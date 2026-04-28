// Super-admin diagnostics router.
//
// Mounted at /api/admin/diagnostics by server.js. Lets a super_admin run
// pre-defined k6 load test scripts from the GUI with real-time streaming
// of:
//
//   * k6 request metrics (aggregated into 1-second buckets so we don't
//     drown the browser with thousands of data points per second)
//   * System CPU and memory samples (sampled once per second)
//   * Plain log output from k6's stderr
//   * Run lifecycle events (started, stopped, completed, summary)
//
// The transport is Server-Sent Events. Run lifecycle is:
//
//   1. POST /run { scriptName }                 -> { runId }
//   2. EventSource('/stream/:runId')            -> live event stream
//   3. POST /stop/:runId                        -> SIGTERMs the k6 process
//
// SECURITY: only the three scripts listed in SCRIPTS below can be
// executed. There is no user-controllable file path. requireSuperAdmin
// guards every route. Even though that's redundant with the whitelist,
// it's defence in depth.

const express = require('express');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');
const crypto = require('crypto');

const { requireSuperAdmin } = require('./auth');
const rateLimiterState = require('./rateLimiterState');

const router = express.Router();

// --- Whitelisted test scripts ---------------------------------------------
// REPO_ROOT resolves to the directory two levels above this file, i.e. the
// repo root that contains hello-world/. The k6 scripts live in
// hello-world/loadtests/ and are referenced by absolute path.

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const LOADTESTS_DIR = path.join(REPO_ROOT, 'hello-world', 'loadtests');

const SCRIPTS = {
  homepage: {
    file: path.join(LOADTESTS_DIR, 'homepage.js'),
    label: 'Homepage (static, nginx ceiling)',
    description:
      '50 VUs for 30s on GET / — the static index.html via nginx, ' +
      'no app server, no rate limiter. Ceiling test for the network/nginx layer.',
    expectedDurationSeconds: 30
  },
  'api-baseline': {
    file: path.join(LOADTESTS_DIR, 'api-baseline.js'),
    label: 'API baseline (paced under rate limit)',
    description:
      '10 VUs for 60s on GET /api/messages, paced at ~1.5 req/s total to ' +
      'stay under the 100 req/min rate limit. Real "API + MySQL" latency.',
    expectedDurationSeconds: 60
  },
  'api-stress': {
    file: path.join(LOADTESTS_DIR, 'api-stress.js'),
    label: 'API stress (ramp 10 to 100 VUs)',
    description:
      'Ramp from 10 to 100 concurrent VUs over 3 minutes with no sleep. ' +
      'Designed to find the breaking point. With the rate limiter on you ' +
      'will see a flood of 429s — that\'s by design, the limiter is the ' +
      'first bottleneck. Toggle the limiter off below to measure the ' +
      'actual app/DB ceiling instead.',
    expectedDurationSeconds: 180
  },
  'api-overload': {
    file: path.join(LOADTESTS_DIR, 'api-overload.js'),
    label: 'API overload (ramp 50 to 500 VUs) — TRUE LIMIT',
    description:
      'Aggressive ramp 50 -> 200 -> 500 -> 0 over 4 minutes hitting ' +
      '/api/messages with no sleep. Designed to find the actual t3.micro ' +
      'ceiling, not the rate-limiter ceiling. Strongly recommended to ' +
      'disable the rate limiter via the toggle below — otherwise you are ' +
      'just measuring how fast the limiter returns 429s under siege. ' +
      'Watch the CPU chart pin to 100% and the latency curve inflect.',
    expectedDurationSeconds: 240
  }
};

// --- Active run registry --------------------------------------------------

// Map of runId -> run object. Only one run can be in 'running' state at a
// time globally; finished runs hang around for 5 minutes so a refreshed
// client can still pull the history.
const activeRuns = new Map();

// Cap how many events we keep in history per run. Each event is small
// (sub-kilobyte) and a 3-minute run produces about 360 of them, so 5000
// is generous and bounds the memory.
const MAX_HISTORY = 5000;

function broadcast(run, event) {
  run.history.push(event);
  if (run.history.length > MAX_HISTORY) {
    run.history.splice(0, run.history.length - MAX_HISTORY);
  }
  const payload = `data: ${JSON.stringify(event)}\n\n`;
  for (const res of run.listeners) {
    try {
      res.write(payload);
    } catch {
      // Listener went away; the close handler on req will tidy up.
    }
  }
}

// --- System metric sampler ------------------------------------------------

// os.cpus() returns cumulative tick counts since boot. To turn that into a
// usage percentage over a window we have to take two snapshots and diff
// them. We sum across all cores so the percentage is across the whole box,
// not per core (so on a 2-vCPU instance you'll see at most 100%, which is
// the more intuitive number).
function snapshotCpu() {
  const cpus = os.cpus();
  let user = 0,
    nice = 0,
    sys = 0,
    idle = 0,
    irq = 0;
  for (const cpu of cpus) {
    user += cpu.times.user;
    nice += cpu.times.nice;
    sys += cpu.times.sys;
    idle += cpu.times.idle;
    irq += cpu.times.irq;
  }
  return { user, nice, sys, idle, irq, total: user + nice + sys + idle + irq };
}

function startSystemSampler(run, intervalMs = 1000) {
  let prev = snapshotCpu();
  const tick = () => {
    const now = Date.now();

    // Flush the k6 1-second aggregation bucket every tick so the chart
    // updates at a smooth 1 Hz even if k6 didn't emit a point this second.
    flushK6Bucket(run, now);

    const cur = snapshotCpu();
    const dTotal = cur.total - prev.total;
    const dIdle = cur.idle - prev.idle;
    const cpuPercent =
      dTotal > 0
        ? Math.max(0, Math.min(100, ((dTotal - dIdle) / dTotal) * 100))
        : 0;
    prev = cur;

    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const memPercent = ((totalMem - freeMem) / totalMem) * 100;

    broadcast(run, {
      type: 'system',
      t: now,
      cpuPercent,
      memPercent,
      loadAvg: os.loadavg()[0]
    });
  };
  return setInterval(tick, intervalMs);
}

// --- k6 metric aggregation ------------------------------------------------
//
// k6 with --out json=- emits one JSON line per data point, often hundreds
// or thousands per second. Forwarding all of those over SSE to the browser
// would be a denial-of-service against the chart library. Instead we
// aggregate every individual point into a 1-second bucket and emit one
// summary event per second containing count, p50, p95, mean, and the
// failure count. The full duration array is also kept for the run's
// life so we can compute a real p95 across the whole run at the end.

function flushK6Bucket(run, now) {
  const a = run.k6Bucket;
  if (a.count === 0) {
    // Even an empty bucket is useful — keeps the chart line continuous.
    broadcast(run, {
      type: 'k6_bucket',
      t: now,
      reqCount: 0,
      failedCount: 0,
      p50: 0,
      p95: 0,
      mean: 0
    });
    return;
  }
  const sorted = a.durations.slice().sort((x, y) => x - y);
  const p50 = sorted[Math.floor(sorted.length * 0.5)];
  const p95 = sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95))];
  const mean = sorted.reduce((s, v) => s + v, 0) / sorted.length;
  broadcast(run, {
    type: 'k6_bucket',
    t: now,
    reqCount: a.count,
    failedCount: a.failedCount,
    p50,
    p95,
    mean
  });
  // Reset the bucket; durations have already been pushed onto allDurations
  // in the stdout handler so we can compute a final summary later.
  a.durations.length = 0;
  a.count = 0;
  a.failedCount = 0;
}

function computeFinalSummary(run) {
  const all = run.allDurations;
  if (all.length === 0) {
    return {
      totalRequests: 0,
      totalFailed: 0,
      failureRate: 0,
      durationSeconds: (Date.now() - run.startedAt) / 1000,
      avgReqPerSec: 0,
      p50: 0,
      p95: 0,
      p99: 0,
      mean: 0,
      max: 0
    };
  }
  const sorted = all.slice().sort((a, b) => a - b);
  const p50 = sorted[Math.floor(sorted.length * 0.5)];
  const p95 = sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95))];
  const p99 = sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.99))];
  const mean = sorted.reduce((s, v) => s + v, 0) / sorted.length;
  const max = sorted[sorted.length - 1];
  const durationSeconds = (Date.now() - run.startedAt) / 1000;
  return {
    totalRequests: sorted.length,
    totalFailed: run.totalFailed,
    failureRate: run.totalFailed / sorted.length,
    durationSeconds,
    avgReqPerSec: sorted.length / Math.max(1, durationSeconds),
    p50,
    p95,
    p99,
    mean,
    max
  };
}

// --- Routes ---------------------------------------------------------------

// GET /api/admin/diagnostics/limiter
// Returns the current state of the runtime rate-limit-disabled flag.
router.get('/limiter', requireSuperAdmin, (req, res) => {
  res.json({ disabled: rateLimiterState.isDisabled() });
});

// POST /api/admin/diagnostics/limiter  body: { disabled: boolean }
// Flips the runtime rate-limit-disabled flag. Logs to stderr so there's a
// durable trail of who toggled it (PM2 captures stderr to its log file).
router.post('/limiter', requireSuperAdmin, (req, res) => {
  const value = !!req.body.disabled;
  const wasDisabled = rateLimiterState.isDisabled();
  rateLimiterState.setDisabled(value);
  if (wasDisabled !== value) {
    console.warn(
      `[diagnostics] super_admin id=${req.session.userId} set rate ` +
        `limiter to ${value ? 'DISABLED' : 'ENABLED'}`
    );
  }
  res.json({ disabled: rateLimiterState.isDisabled() });
});

// GET /api/admin/diagnostics/scripts
// Returns the static metadata for available scripts.
router.get('/scripts', requireSuperAdmin, (req, res) => {
  const list = Object.entries(SCRIPTS).map(([key, meta]) => ({
    key,
    label: meta.label,
    description: meta.description,
    expectedDurationSeconds: meta.expectedDurationSeconds
  }));
  res.json(list);
});

// GET /api/admin/diagnostics/runs/active
// Returns the currently-running test (if any), so a refreshed page can
// re-attach to its event stream.
router.get('/runs/active', requireSuperAdmin, (req, res) => {
  const list = [];
  for (const [runId, run] of activeRuns.entries()) {
    if (run.status === 'running') {
      list.push({
        runId,
        scriptName: run.scriptName,
        startedAt: run.startedAt,
        label: SCRIPTS[run.scriptName]?.label || run.scriptName
      });
    }
  }
  res.json(list);
});

// POST /api/admin/diagnostics/run
// Body: { scriptName: 'homepage' | 'api-baseline' | 'api-stress' }
// Returns: { runId, scriptName }
router.post('/run', requireSuperAdmin, (req, res) => {
  const scriptName = String(req.body.scriptName || '');
  const meta = SCRIPTS[scriptName];
  if (!meta) {
    return res.status(400).json({ error: 'Unknown scriptName' });
  }

  // One run at a time globally — running tests in parallel would corrupt
  // each other's results because they'd compete for the same CPU/network.
  for (const run of activeRuns.values()) {
    if (run.status === 'running') {
      return res.status(409).json({
        error: 'A test is already running. Stop it first.',
        runId: run.runId
      });
    }
  }

  const runId = crypto.randomBytes(8).toString('hex');
  const run = {
    runId,
    scriptName,
    label: meta.label,
    startedAt: Date.now(),
    endedAt: null,
    status: 'running',
    listeners: new Set(),
    history: [],
    summary: null,
    proc: null,
    samplerInterval: null,
    stdoutBuffer: '',
    stderrBuffer: '',
    k6Bucket: { durations: [], count: 0, failedCount: 0 },
    allDurations: [],
    totalFailed: 0
  };
  activeRuns.set(runId, run);

  // --quiet drops the ASCII banner and the progress bar, keeping the JSON
  // stream clean. We log via our own SSE channel anyway.
  const proc = spawn('k6', ['run', '--out', 'json=-', '--quiet', meta.file], {
    cwd: REPO_ROOT,
    env: { ...process.env }
  });
  run.proc = proc;

  broadcast(run, {
    type: 'run_started',
    t: Date.now(),
    runId,
    scriptName,
    label: meta.label,
    expectedDurationSeconds: meta.expectedDurationSeconds
  });

  run.samplerInterval = startSystemSampler(run, 1000);

  // k6 stdout: newline-delimited JSON.
  proc.stdout.on('data', (chunk) => {
    run.stdoutBuffer += chunk.toString('utf8');
    let nl;
    while ((nl = run.stdoutBuffer.indexOf('\n')) !== -1) {
      const line = run.stdoutBuffer.slice(0, nl).trim();
      run.stdoutBuffer = run.stdoutBuffer.slice(nl + 1);
      if (!line) continue;
      let obj;
      try {
        obj = JSON.parse(line);
      } catch {
        // Non-JSON line — surface as a log entry.
        broadcast(run, {
          type: 'log',
          t: Date.now(),
          stream: 'stdout',
          text: line
        });
        continue;
      }
      if (obj.type !== 'Point' || !obj.metric || !obj.data) continue;
      if (obj.metric === 'http_req_duration') {
        const v = obj.data.value;
        run.k6Bucket.durations.push(v);
        run.k6Bucket.count++;
        run.allDurations.push(v);
      } else if (obj.metric === 'http_req_failed') {
        if (obj.data.value > 0) {
          run.k6Bucket.failedCount++;
          run.totalFailed++;
        }
      }
    }
  });

  // k6 stderr: human-readable progress + warnings.
  proc.stderr.on('data', (chunk) => {
    run.stderrBuffer += chunk.toString('utf8');
    let nl;
    while ((nl = run.stderrBuffer.indexOf('\n')) !== -1) {
      const line = run.stderrBuffer.slice(0, nl);
      run.stderrBuffer = run.stderrBuffer.slice(nl + 1);
      if (line.trim()) {
        broadcast(run, {
          type: 'log',
          t: Date.now(),
          stream: 'stderr',
          text: line
        });
      }
    }
  });

  proc.on('close', (code, signal) => {
    if (run.samplerInterval) {
      clearInterval(run.samplerInterval);
      run.samplerInterval = null;
    }

    // Drain whatever's left in the line buffers.
    if (run.stdoutBuffer.trim()) {
      broadcast(run, {
        type: 'log',
        t: Date.now(),
        stream: 'stdout',
        text: run.stdoutBuffer
      });
      run.stdoutBuffer = '';
    }
    if (run.stderrBuffer.trim()) {
      broadcast(run, {
        type: 'log',
        t: Date.now(),
        stream: 'stderr',
        text: run.stderrBuffer
      });
      run.stderrBuffer = '';
    }

    // One final flush so the last partial second still shows up.
    flushK6Bucket(run, Date.now());

    run.status = signal ? 'stopped' : code === 0 ? 'completed' : 'failed';
    run.endedAt = Date.now();
    run.summary = computeFinalSummary(run);

    broadcast(run, {
      type: 'run_ended',
      t: Date.now(),
      status: run.status,
      exitCode: code,
      signal,
      summary: run.summary
    });

    for (const res of run.listeners) {
      try {
        res.end();
      } catch {}
    }
    run.listeners.clear();

    // Keep the run record around for a few minutes so a page reload after
    // completion can still see the final state.
    setTimeout(() => activeRuns.delete(runId), 5 * 60 * 1000);
  });

  proc.on('error', (err) => {
    broadcast(run, {
      type: 'log',
      t: Date.now(),
      stream: 'stderr',
      text: `spawn error: ${err.message}`
    });
  });

  res.json({ runId, scriptName, label: meta.label });
});

// POST /api/admin/diagnostics/stop/:runId
router.post('/stop/:runId', requireSuperAdmin, (req, res) => {
  const run = activeRuns.get(req.params.runId);
  if (!run) {
    return res.status(404).json({ error: 'Run not found' });
  }
  if (run.status !== 'running') {
    return res.status(400).json({ error: `Run is ${run.status}` });
  }
  if (run.proc) {
    run.proc.kill('SIGTERM');
  }
  res.json({ ok: true });
});

// GET /api/admin/diagnostics/stream/:runId
//
// SSE endpoint. Replays the run's history, then streams live events. If
// the run has already ended we replay the history once and close.
router.get('/stream/:runId', requireSuperAdmin, (req, res) => {
  const run = activeRuns.get(req.params.runId);
  if (!run) {
    return res.status(404).json({ error: 'Run not found' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  // Tell nginx not to buffer this response — SSE needs each event to flush
  // through to the client immediately.
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  // Replay the entire history first so a (re)connecting client gets the
  // full timeline, not just events from now on.
  for (const event of run.history) {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  }

  if (run.status !== 'running') {
    res.write(
      `data: ${JSON.stringify({
        type: 'replay_complete',
        t: Date.now(),
        status: run.status
      })}\n\n`
    );
    res.end();
    return;
  }

  run.listeners.add(res);
  req.on('close', () => {
    run.listeners.delete(res);
  });
});

module.exports = router;
