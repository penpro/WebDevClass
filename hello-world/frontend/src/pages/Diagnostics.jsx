// Super-admin Diagnostics & Tests page.
//
// Run any of the whitelisted k6 scripts (defined server-side in
// hello-world/backend/diagnostics.js) and watch the results stream in.
// Three lines render in real time:
//
//   * req/s + error rate
//   * p95 latency (ms)
//   * server CPU% + memory%
//
// Underneath is a scrolling log panel and, after the run completes, a
// summary card with totals and percentiles computed across the whole run.
//
// The flow:
//   1. POST /api/admin/diagnostics/run   -> { runId }
//   2. EventSource('/api/admin/diagnostics/stream/:runId')
//   3. Events: run_started, k6_bucket, system, log, run_ended
//   4. POST /api/admin/diagnostics/stop/:runId  to interrupt early.

import { useEffect, useRef, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { apiFetch } from '../lib/api.js'
import { useAuth } from '../AuthContext.jsx'

const MAX_LOG_LINES = 500

export default function Diagnostics() {
  const { user, loading } = useAuth()

  const [scripts, setScripts] = useState(null)
  const [scriptsError, setScriptsError] = useState(null)
  const [selectedScript, setSelectedScript] = useState('homepage')

  const [runId, setRunId] = useState(null)
  const [runLabel, setRunLabel] = useState(null)
  const [runStatus, setRunStatus] = useState('idle') // idle | starting | running | completed | failed | stopped
  const [runStartedAt, setRunStartedAt] = useState(null)
  const [expectedDuration, setExpectedDuration] = useState(null)
  const [elapsed, setElapsed] = useState(0)

  const [reqSeries, setReqSeries] = useState([])      // [{ t, reqPerSec, failedPerSec, errorRatePct }]
  const [latencySeries, setLatencySeries] = useState([]) // [{ t, p50, p95, mean }]
  const [systemSeries, setSystemSeries] = useState([])  // [{ t, cpuPercent, memPercent }]
  const [logs, setLogs] = useState([])
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState(null)

  const eventSourceRef = useRef(null)
  const logBoxRef = useRef(null)

  // Fetch the script list once on mount.
  useEffect(() => {
    apiFetch('/admin/diagnostics/scripts')
      .then((list) => {
        setScripts(list || [])
        if (list && list.length > 0 && !list.find((s) => s.key === selectedScript)) {
          setSelectedScript(list[0].key)
        }
      })
      .catch((err) => setScriptsError(err.message))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Re-attach to an active run (e.g. after page reload).
  useEffect(() => {
    if (!user || user.role !== 'super_admin') return
    apiFetch('/admin/diagnostics/runs/active')
      .then((list) => {
        if (list && list.length > 0) {
          const active = list[0]
          attachToRun(active.runId, active.label)
        }
      })
      .catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // Tick a 1-second elapsed counter while running so the status header
  // updates without us having to redraw the whole page on every event.
  useEffect(() => {
    if (runStatus !== 'running' || !runStartedAt) return
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - runStartedAt) / 1000))
    }, 1000)
    return () => clearInterval(id)
  }, [runStatus, runStartedAt])

  // Auto-scroll the log panel to the bottom when new lines arrive, but only
  // if the user hasn't scrolled up to read history.
  useEffect(() => {
    const el = logBoxRef.current
    if (!el) return
    const stickToBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40
    if (stickToBottom) el.scrollTop = el.scrollHeight
  }, [logs])

  // Tear down the SSE connection on unmount.
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }
    }
  }, [])

  if (loading) return <p>Loading…</p>
  if (!user) {
    return (
      <Navigate
        to="/login"
        state={{ from: '/admin-portal/diagnostics' }}
        replace
      />
    )
  }
  if (user.role !== 'super_admin') {
    return (
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <h1>Diagnostics &amp; Tests</h1>
        <p>This page is restricted to super admins.</p>
        <p>
          <Link to="/admin-portal">← Back to Admin Portal</Link>
        </p>
      </div>
    )
  }

  function resetRunState() {
    setReqSeries([])
    setLatencySeries([])
    setSystemSeries([])
    setLogs([])
    setSummary(null)
    setError(null)
    setElapsed(0)
  }

  function attachToRun(id, label) {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }

    setRunId(id)
    setRunLabel(label || null)
    setRunStatus('running')
    setRunStartedAt(Date.now())
    resetRunState()

    const es = new EventSource(`/api/admin/diagnostics/stream/${id}`)
    eventSourceRef.current = es

    es.onmessage = (e) => {
      let event
      try {
        event = JSON.parse(e.data)
      } catch {
        return
      }
      handleStreamEvent(event)
    }

    es.onerror = () => {
      // EventSource auto-reconnects on transient failures. Only treat it
      // as fatal if the run isn't currently running.
      if (runStatus !== 'running') {
        es.close()
        eventSourceRef.current = null
      }
    }
  }

  function handleStreamEvent(event) {
    switch (event.type) {
      case 'run_started':
        setRunStartedAt(event.t)
        setRunLabel(event.label || null)
        setExpectedDuration(event.expectedDurationSeconds || null)
        setRunStatus('running')
        break

      case 'k6_bucket': {
        const reqPerSec = event.reqCount
        const failedPerSec = event.failedCount
        const errorRatePct =
          reqPerSec > 0 ? (failedPerSec / reqPerSec) * 100 : 0
        setReqSeries((prev) => appendCapped(prev, {
          t: event.t,
          tLabel: formatTimeShort(event.t),
          reqPerSec,
          failedPerSec,
          errorRatePct
        }, 600))
        if (reqPerSec > 0) {
          setLatencySeries((prev) => appendCapped(prev, {
            t: event.t,
            tLabel: formatTimeShort(event.t),
            p50: round2(event.p50),
            p95: round2(event.p95),
            mean: round2(event.mean)
          }, 600))
        }
        break
      }

      case 'system':
        setSystemSeries((prev) => appendCapped(prev, {
          t: event.t,
          tLabel: formatTimeShort(event.t),
          cpuPercent: round2(event.cpuPercent),
          memPercent: round2(event.memPercent)
        }, 600))
        break

      case 'log':
        setLogs((prev) => appendCapped(prev, {
          t: event.t,
          stream: event.stream,
          text: event.text
        }, MAX_LOG_LINES))
        break

      case 'run_ended':
        setRunStatus(event.status || 'completed')
        if (event.summary) setSummary(event.summary)
        if (eventSourceRef.current) {
          eventSourceRef.current.close()
          eventSourceRef.current = null
        }
        break

      case 'replay_complete':
        // Run had already ended when we connected; show the final state.
        setRunStatus(event.status || 'completed')
        break

      default:
        break
    }
  }

  async function handleStart() {
    setError(null)
    setRunStatus('starting')
    resetRunState()
    try {
      const result = await apiFetch('/admin/diagnostics/run', {
        method: 'POST',
        body: JSON.stringify({ scriptName: selectedScript })
      })
      attachToRun(result.runId, result.label)
    } catch (err) {
      setRunStatus('idle')
      setError(err.message)
    }
  }

  async function handleStop() {
    if (!runId) return
    try {
      await apiFetch(`/admin/diagnostics/stop/${runId}`, { method: 'POST' })
    } catch (err) {
      setError(err.message)
    }
  }

  const isRunning = runStatus === 'running' || runStatus === 'starting'
  const selectedMeta = scripts && scripts.find((s) => s.key === selectedScript)

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <p style={{ marginBottom: '0.5rem' }}>
        <Link to="/admin-portal">← Back to Admin Portal</Link>
      </p>
      <h1>Diagnostics &amp; Tests</h1>
      <p style={{ color: '#6b7280' }}>
        Run a pre-defined k6 load test against this server. Charts update
        every second while the test runs. CPU and memory readouts come from
        the EC2 instance the backend lives on.
      </p>

      {scriptsError && (
        <p style={{ color: 'crimson' }}>
          Failed to load script list: {scriptsError}
        </p>
      )}

      {/* --- Script picker -------------------------------------------- */}
      <section
        style={{
          border: '1px solid #d1d5db',
          borderRadius: 8,
          padding: '1rem',
          marginBottom: '1rem',
          background: '#f9fafb'
        }}
      >
        <h2 style={{ marginTop: 0 }}>Select test</h2>
        {scripts === null ? (
          <p>Loading…</p>
        ) : scripts.length === 0 ? (
          <p>No scripts available.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {scripts.map((s) => (
              <label
                key={s.key}
                style={{
                  display: 'flex',
                  gap: '0.6rem',
                  alignItems: 'flex-start',
                  padding: '0.5rem',
                  border:
                    selectedScript === s.key
                      ? '2px solid #4f46e5'
                      : '1px solid #d1d5db',
                  borderRadius: 6,
                  background: 'white',
                  cursor: isRunning ? 'not-allowed' : 'pointer'
                }}
              >
                <input
                  type="radio"
                  name="script"
                  value={s.key}
                  checked={selectedScript === s.key}
                  disabled={isRunning}
                  onChange={() => setSelectedScript(s.key)}
                />
                <div>
                  <strong>{s.label}</strong>
                  <span
                    style={{
                      marginLeft: '0.5rem',
                      color: '#6b7280',
                      fontSize: '0.8rem'
                    }}
                  >
                    ~{s.expectedDurationSeconds}s
                  </span>
                  <div style={{ fontSize: '0.85rem', color: '#374151', marginTop: '0.25rem' }}>
                    {s.description}
                  </div>
                </div>
              </label>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
          <button
            type="button"
            onClick={handleStart}
            disabled={isRunning || !selectedMeta}
            style={{
              background: '#4f46e5',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1.25rem',
              borderRadius: 6,
              fontWeight: 'bold',
              cursor: isRunning ? 'not-allowed' : 'pointer',
              opacity: isRunning ? 0.5 : 1
            }}
          >
            {runStatus === 'starting' ? 'Starting…' : 'Run test'}
          </button>
          {isRunning && (
            <button
              type="button"
              onClick={handleStop}
              style={{
                background: 'white',
                color: '#b91c1c',
                border: '1px solid #b91c1c',
                padding: '0.5rem 1.25rem',
                borderRadius: 6,
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Stop
            </button>
          )}
        </div>

        {error && <p style={{ color: 'crimson', marginTop: '0.5rem' }}>{error}</p>}
      </section>

      {/* --- Run status ----------------------------------------------- */}
      {runStatus !== 'idle' && (
        <section
          style={{
            border: '1px solid #d1d5db',
            borderRadius: 8,
            padding: '0.75rem 1rem',
            marginBottom: '1rem',
            background:
              runStatus === 'running'
                ? '#fef3c7'
                : runStatus === 'completed'
                ? '#d1fae5'
                : runStatus === 'failed' || runStatus === 'stopped'
                ? '#fee2e2'
                : '#f3f4f6',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.5rem'
          }}
        >
          <div>
            <strong>{labelForStatus(runStatus)}</strong>
            {runLabel && <> — {runLabel}</>}
          </div>
          <div style={{ fontSize: '0.85rem', color: '#374151' }}>
            {runStatus === 'running' && expectedDuration
              ? `${formatDuration(elapsed)} / ~${formatDuration(expectedDuration)}`
              : runStatus === 'running'
              ? formatDuration(elapsed)
              : ''}
          </div>
        </section>
      )}

      {/* --- Charts --------------------------------------------------- */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: '1rem',
          marginBottom: '1rem'
        }}
      >
        <ChartCard title="Requests / sec (and errors)">
          <LineChart
            data={reqSeries}
            formatY={(v) => formatCount(v)}
            series={[
              { key: 'reqPerSec', label: 'req/s', color: '#4f46e5' },
              { key: 'failedPerSec', label: 'failed/s', color: '#b91c1c' }
            ]}
          />
        </ChartCard>

        <ChartCard title="Latency (ms)">
          <LineChart
            data={latencySeries}
            formatY={(v) => `${Math.round(v)}ms`}
            series={[
              { key: 'mean', label: 'mean', color: '#9ca3af' },
              { key: 'p50', label: 'p50', color: '#0ea5e9' },
              { key: 'p95', label: 'p95', color: '#f59e0b' }
            ]}
          />
        </ChartCard>

        <ChartCard title="Server CPU & memory (%)">
          <LineChart
            data={systemSeries}
            yMax={100}
            formatY={(v) => `${Math.round(v)}%`}
            series={[
              { key: 'cpuPercent', label: 'CPU %', color: '#dc2626' },
              { key: 'memPercent', label: 'Mem %', color: '#059669' }
            ]}
          />
        </ChartCard>
      </div>

      {/* --- Summary -------------------------------------------------- */}
      {summary && (
        <section
          style={{
            border: '1px solid #c7d2fe',
            background: '#eef2ff',
            borderRadius: 8,
            padding: '1rem',
            marginBottom: '1rem'
          }}
        >
          <h2 style={{ marginTop: 0 }}>Summary</h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '0.75rem'
            }}
          >
            <SummaryStat label="Total requests" value={summary.totalRequests.toLocaleString()} />
            <SummaryStat
              label="Failures"
              value={`${summary.totalFailed.toLocaleString()} (${(summary.failureRate * 100).toFixed(2)}%)`}
            />
            <SummaryStat label="Avg req/s" value={summary.avgReqPerSec.toFixed(1)} />
            <SummaryStat label="Duration" value={`${summary.durationSeconds.toFixed(1)}s`} />
            <SummaryStat label="Mean latency" value={`${summary.mean.toFixed(2)} ms`} />
            <SummaryStat label="p50" value={`${summary.p50.toFixed(2)} ms`} />
            <SummaryStat label="p95" value={`${summary.p95.toFixed(2)} ms`} />
            <SummaryStat label="p99" value={`${summary.p99.toFixed(2)} ms`} />
            <SummaryStat label="Max" value={`${summary.max.toFixed(2)} ms`} />
          </div>
        </section>
      )}

      {/* --- Log ------------------------------------------------------ */}
      <section
        style={{
          border: '1px solid #d1d5db',
          borderRadius: 8,
          marginBottom: '2rem'
        }}
      >
        <div
          style={{
            background: '#111827',
            color: '#e5e7eb',
            padding: '0.5rem 0.75rem',
            fontSize: '0.85rem',
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8
          }}
        >
          Log output ({logs.length} line{logs.length === 1 ? '' : 's'})
        </div>
        <div
          ref={logBoxRef}
          style={{
            background: '#1f2937',
            color: '#d1d5db',
            fontFamily: 'monospace',
            fontSize: '0.78rem',
            padding: '0.75rem',
            height: 220,
            overflowY: 'auto',
            borderBottomLeftRadius: 8,
            borderBottomRightRadius: 8,
            whiteSpace: 'pre-wrap'
          }}
        >
          {logs.length === 0 ? (
            <span style={{ color: '#6b7280' }}>No log output yet.</span>
          ) : (
            logs.map((line, idx) => (
              <div
                key={idx}
                style={{
                  color: line.stream === 'stderr' ? '#fca5a5' : '#d1d5db'
                }}
              >
                {line.text}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}

// --- helpers --------------------------------------------------------------

function appendCapped(arr, item, cap) {
  const next = arr.concat(item)
  if (next.length > cap) next.splice(0, next.length - cap)
  return next
}

function round2(n) {
  return Math.round(Number(n) * 100) / 100
}

function formatDuration(seconds) {
  const s = Math.max(0, Math.floor(seconds))
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${m}:${r.toString().padStart(2, '0')}`
}

function formatTimeShort(epochMs) {
  const d = new Date(epochMs)
  return `${d.getMinutes().toString().padStart(2, '0')}:${d
    .getSeconds()
    .toString()
    .padStart(2, '0')}`
}

function labelForStatus(s) {
  switch (s) {
    case 'starting':
      return 'Starting…'
    case 'running':
      return 'Running'
    case 'completed':
      return 'Completed ✓'
    case 'failed':
      return 'Failed'
    case 'stopped':
      return 'Stopped'
    default:
      return s
  }
}

function ChartCard({ title, children }) {
  return (
    <div
      style={{
        border: '1px solid #d1d5db',
        borderRadius: 8,
        padding: '0.75rem',
        background: 'white'
      }}
    >
      <h3 style={{ margin: '0 0 0.5rem', fontSize: '0.9rem' }}>{title}</h3>
      {children}
    </div>
  )
}

function SummaryStat({ label, value }) {
  return (
    <div
      style={{
        background: 'white',
        borderRadius: 6,
        padding: '0.5rem 0.75rem',
        border: '1px solid #c7d2fe'
      }}
    >
      <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#6b7280', letterSpacing: '0.05em' }}>
        {label}
      </div>
      <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginTop: '0.15rem' }}>
        {value}
      </div>
    </div>
  )
}

function formatCount(v) {
  if (v >= 1000) return `${(v / 1000).toFixed(1)}k`
  if (v >= 100) return v.toFixed(0)
  if (v >= 10) return v.toFixed(0)
  if (v >= 1) return v.toFixed(1)
  return v.toFixed(2)
}

// --- LineChart --------------------------------------------------------------
//
// Lightweight SVG line chart. Replaces the previously-used recharts library
// because tree-shaking ~200 polar/radial chart files we never use was
// bringing the t3.micro Vite build to its knees. This implementation is
// ~150 lines, has no dependencies, and bundles into the page chunk for
// effectively no cost.
//
// Props:
//   data    - Array of { tLabel, ...numericSeries }. tLabel is the X-axis
//             label (we use "MM:SS" wallclock). Y values are read by key.
//   series  - Array of { key, label, color }. One <path> per entry.
//   height  - SVG height in px. Width auto-fills the container via
//             ResizeObserver.
//   yMax    - Optional fixed Y ceiling. If null, computed from data with
//             10% headroom.
//   formatY - (number) => string for Y-axis tick labels.

function LineChart({ data, series, height = 220, yMax = null, formatY = defaultFormatY }) {
  const containerRef = useRef(null)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const measure = () => setWidth(el.getBoundingClientRect().width)
    measure()
    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(measure)
      ro.observe(el)
      return () => ro.disconnect()
    }
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  const padding = { top: 8, right: 8, bottom: 24, left: 44 }
  const innerW = Math.max(60, width - padding.left - padding.right)
  const innerH = height - padding.top - padding.bottom

  // Resolve Y ceiling.
  let computedMax = yMax
  if (computedMax == null) {
    let m = 0
    for (const d of data) {
      for (const s of series) {
        const v = d[s.key]
        if (typeof v === 'number' && v > m) m = v
      }
    }
    computedMax = Math.max(1, m * 1.1)
  }

  const xFor = (i) =>
    padding.left +
    (data.length > 1 ? (i / (data.length - 1)) * innerW : innerW / 2)
  const yFor = (v) => {
    const clipped = Math.max(0, Math.min(computedMax, v || 0))
    return padding.top + innerH - (clipped / computedMax) * innerH
  }

  const yTickFractions = [0, 0.25, 0.5, 0.75, 1]
  const yTicks = yTickFractions.map((t) => t * computedMax)

  const paths = series.map((s) => {
    if (data.length === 0) return { ...s, d: '' }
    const cmds = data.map((d, i) => {
      const v = typeof d[s.key] === 'number' ? d[s.key] : 0
      return `${i === 0 ? 'M' : 'L'}${xFor(i).toFixed(1)},${yFor(v).toFixed(1)}`
    })
    return { ...s, d: cmds.join(' ') }
  })

  let xTickIdx = []
  if (data.length === 1) {
    xTickIdx = [0]
  } else if (data.length >= 2) {
    xTickIdx = [0, Math.floor((data.length - 1) / 2), data.length - 1].filter(
      (v, i, arr) => arr.indexOf(v) === i
    )
  }

  return (
    <div ref={containerRef} style={{ width: '100%' }}>
      {width > 0 ? (
        <svg width={width} height={height} style={{ display: 'block' }}>
          {/* Horizontal grid lines + Y labels */}
          {yTicks.map((v, i) => (
            <g key={i}>
              <line
                x1={padding.left}
                y1={yFor(v)}
                x2={padding.left + innerW}
                y2={yFor(v)}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
              <text
                x={padding.left - 6}
                y={yFor(v)}
                textAnchor="end"
                dominantBaseline="middle"
                fontSize="10"
                fill="#6b7280"
              >
                {formatY(v)}
              </text>
            </g>
          ))}
          {/* X axis labels */}
          {xTickIdx.map((i) => (
            <text
              key={i}
              x={xFor(i)}
              y={height - padding.bottom + 14}
              textAnchor="middle"
              fontSize="10"
              fill="#6b7280"
            >
              {data[i].tLabel}
            </text>
          ))}
          {/* Series lines */}
          {paths.map((p, idx) => (
            <path
              key={idx}
              d={p.d}
              stroke={p.color}
              fill="none"
              strokeWidth={1.8}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ))}
        </svg>
      ) : (
        <div style={{ height }} />
      )}
      {/* Legend */}
      <div
        style={{
          display: 'flex',
          gap: '0.75rem',
          flexWrap: 'wrap',
          fontSize: '0.7rem',
          marginTop: '0.25rem',
          justifyContent: 'center',
          color: '#374151'
        }}
      >
        {series.map((s) => (
          <div
            key={s.key}
            style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}
          >
            <span
              style={{
                display: 'inline-block',
                width: 12,
                height: 2,
                background: s.color
              }}
            />
            {s.label}
          </div>
        ))}
      </div>
    </div>
  )
}

function defaultFormatY(v) {
  if (Math.abs(v) >= 1000) return v.toFixed(0)
  if (Math.abs(v) >= 10) return v.toFixed(0)
  if (Math.abs(v) >= 1) return v.toFixed(1)
  return v.toFixed(2)
}
