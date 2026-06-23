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
import LineChart from '../components/LineChart.jsx'
import Container from '../components/Container.jsx'
import Card from '../components/Card.jsx'
import Button from '../components/Button.jsx'
import HudLabel from '../components/HudLabel.jsx'
import CornerBrackets from '../components/CornerBrackets.jsx'
import {
  colors,
  fonts,
  fontSizes,
  fontWeights,
  radii,
  space
} from '../theme.js'

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

  // Live mirror of the backend's runtime rate-limit-disabled flag. Loaded
  // on mount and updated optimistically when the user clicks the toggle.
  const [limiterDisabled, setLimiterDisabled] = useState(false)
  const [limiterLoading, setLimiterLoading] = useState(false)

  // Live mirror of the backend's maintenance flag. The api-overload test
  // also auto-toggles this, so we refresh it on mount and after every
  // run start/end so the UI stays accurate.
  const [maintenanceEnabled, setMaintenanceEnabled] = useState(false)
  const [maintenanceLoading, setMaintenanceLoading] = useState(false)

  // Copy-button feedback state: 'idle' | 'copied' | 'error'.
  const [copyState, setCopyState] = useState('idle')

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

  // Fetch the current rate-limiter state on mount.
  useEffect(() => {
    apiFetch('/admin/diagnostics/limiter')
      .then((data) => setLimiterDisabled(!!data.disabled))
      .catch(() => {})
  }, [])

  // Fetch the current maintenance state on mount.
  useEffect(() => {
    apiFetch('/admin/diagnostics/maintenance')
      .then((data) => setMaintenanceEnabled(!!data.enabled))
      .catch(() => {})
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

  if (loading) {
    return (
      <Container narrow style={{ paddingTop: space['3xl'] }}>
        <p style={{ color: colors.textSecondary }}>Loading…</p>
      </Container>
    )
  }
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
      <Container narrow style={{ paddingTop: space['3xl'] }}>
        <HudLabel tone="magenta">Diagnostics &amp; Tests</HudLabel>
        <h1 style={pageTitleStyle}>
          This page is restricted to super admins.
        </h1>
        <p
          style={{
            marginTop: space.md,
            color: colors.textSecondary,
            fontSize: fontSizes.md
          }}
        >
          <Link
            to="/admin-portal"
            style={{ color: colors.accent, textDecoration: 'none' }}
          >
            ← Back to Admin Portal
          </Link>
        </p>
      </Container>
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
        // Auto-trigger may have flipped maintenance server-side; mirror.
        if (typeof event.maintenance === 'boolean') {
          setMaintenanceEnabled(event.maintenance)
        }
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
        // Auto-clear may have flipped maintenance server-side; mirror.
        if (typeof event.maintenance === 'boolean') {
          setMaintenanceEnabled(event.maintenance)
        }
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

  async function handleToggleLimiter() {
    if (isRunning || limiterLoading) return
    const next = !limiterDisabled
    setLimiterLoading(true)
    setError(null)
    try {
      const data = await apiFetch('/admin/diagnostics/limiter', {
        method: 'POST',
        body: JSON.stringify({ disabled: next })
      })
      setLimiterDisabled(!!data.disabled)
    } catch (err) {
      setError(err.message)
    } finally {
      setLimiterLoading(false)
    }
  }

  async function handleCopyLog() {
    if (logs.length === 0) return
    const text = logs.map((l) => l.text).join('\n')
    try {
      // navigator.clipboard requires a secure context (HTTPS), which
      // we have, plus a transient user activation, which a click is.
      await navigator.clipboard.writeText(text)
      setCopyState('copied')
    } catch {
      setCopyState('error')
    }
    setTimeout(() => setCopyState('idle'), 2000)
  }

  async function handleToggleMaintenance() {
    // Deliberately NOT disabled while a test is running. If a runaway
    // test is hurting the site and the auto-disable hasn't fired, the
    // admin still needs the manual override.
    if (maintenanceLoading) return
    const next = !maintenanceEnabled
    setMaintenanceLoading(true)
    setError(null)
    try {
      const data = await apiFetch('/admin/diagnostics/maintenance', {
        method: 'POST',
        body: JSON.stringify({ enabled: next })
      })
      setMaintenanceEnabled(!!data.enabled)
    } catch (err) {
      setError(err.message)
    } finally {
      setMaintenanceLoading(false)
    }
  }

  const isRunning = runStatus === 'running' || runStatus === 'starting'
  const selectedMeta = scripts && scripts.find((s) => s.key === selectedScript)

  return (
    <>
      <section
        style={{
          position: 'relative',
          overflow: 'hidden',
          paddingTop: space['2xl'],
          paddingBottom: space.lg,
          borderBottom: `1px solid ${colors.borderSubtle}`
        }}
      >
        <CornerBrackets size={28} inset={20} />
        <Container style={{ position: 'relative', zIndex: 1 }}>
          <Link
            to="/admin-portal"
            style={{
              fontFamily: fonts.mono,
              fontSize: fontSizes.sm,
              color: colors.textSecondary,
              textDecoration: 'none'
            }}
          >
            ← Back to Admin Portal
          </Link>
          <div style={{ marginTop: space.md }}>
            <HudLabel tone="magenta" live>
              Diagnostics &amp; Tests
            </HudLabel>
          </div>
          <h1 style={pageTitleStyle}>Load testing dashboard.</h1>
          <p
            style={{
              margin: `${space.md} 0 0`,
              color: colors.textSecondary,
              fontSize: fontSizes.md,
              lineHeight: 1.6,
              maxWidth: '62ch'
            }}
          >
            Run a pre-defined k6 load test against this server. Charts
            update every second while the test runs. CPU and memory
            readouts come from the EC2 instance the backend lives on.
          </p>
        </Container>
      </section>

      <Container style={{ paddingTop: space.xl, paddingBottom: space['3xl'] }}>
        {scriptsError && (
          <p
            style={{
              color: colors.danger,
              background: colors.dangerMuted,
              border: `1px solid ${colors.danger}`,
              borderRadius: radii.md,
              padding: `${space.sm} ${space.md}`,
              fontSize: fontSizes.sm,
              margin: `0 0 ${space.md}`
            }}
          >
            Failed to load script list: {scriptsError}
          </p>
        )}

        {limiterDisabled && (
          <div
            style={{
              background: colors.dangerMuted,
              border: `1px solid ${colors.danger}`,
              color: colors.danger,
              padding: `${space.sm} ${space.md}`,
              borderRadius: radii.md,
              fontSize: fontSizes.sm,
              marginBottom: space.lg,
              lineHeight: 1.55
            }}
          >
            <strong style={{ color: colors.text }}>
              Rate limiter is DISABLED.
            </strong>{' '}
            All API endpoints are currently unprotected from request
            flooding. Toggle back to ON when you&apos;re done load testing
            — this state persists until you flip it back or the backend is
            restarted.
          </div>
        )}

      {/* --- Script picker -------------------------------------------- */}
      <Card style={{ marginBottom: space.md }}>
        <SectionTitle>Select test</SectionTitle>
        {scripts === null ? (
          <p style={{ color: colors.textSecondary }}>Loading…</p>
        ) : scripts.length === 0 ? (
          <p style={{ color: colors.textSecondary }}>No scripts available.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: space.sm }}>
            {scripts.map((s) => {
              const selected = selectedScript === s.key
              return (
                <label
                  key={s.key}
                  style={{
                    display: 'flex',
                    gap: space.sm,
                    alignItems: 'flex-start',
                    padding: space.md,
                    border:
                      '1px solid ' +
                      (selected ? colors.accent : colors.border),
                    background: selected ? colors.accentMuted : colors.bg,
                    borderRadius: radii.md,
                    cursor: isRunning ? 'not-allowed' : 'pointer',
                    transition: 'background 150ms ease, border-color 150ms ease'
                  }}
                >
                  <input
                    type="radio"
                    name="script"
                    value={s.key}
                    checked={selected}
                    disabled={isRunning}
                    onChange={() => setSelectedScript(s.key)}
                    style={{ accentColor: colors.accent, marginTop: '0.25rem' }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: space.sm,
                        flexWrap: 'wrap'
                      }}
                    >
                      <strong
                        style={{
                          fontFamily: fonts.heading,
                          color: colors.text,
                          fontSize: fontSizes.base
                        }}
                      >
                        {s.label}
                      </strong>
                      <span
                        style={{
                          color: colors.cyan,
                          fontSize: fontSizes.xs,
                          fontFamily: fonts.mono,
                          letterSpacing: '0.05em'
                        }}
                      >
                        ~{s.expectedDurationSeconds}s
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: fontSizes.sm,
                        color: colors.textSecondary,
                        marginTop: space.xs,
                        lineHeight: 1.55
                      }}
                    >
                      {s.description}
                    </div>
                  </div>
                </label>
              )
            })}
          </div>
        )}

        <div
          style={{
            display: 'flex',
            gap: space.sm,
            marginTop: space.lg,
            alignItems: 'center',
            flexWrap: 'wrap'
          }}
        >
          <Button
            type="button"
            onClick={handleStart}
            disabled={isRunning || !selectedMeta}
          >
            {runStatus === 'starting' ? 'Starting…' : 'Run test →'}
          </Button>
          {isRunning && (
            <Button
              type="button"
              variant="secondary"
              onClick={handleStop}
              style={{
                color: colors.danger,
                borderColor: colors.danger
              }}
            >
              Stop
            </Button>
          )}

          {/* Toggle group pushed to the right of the row. */}
          <div
            style={{
              marginLeft: 'auto',
              display: 'flex',
              gap: space.lg,
              alignItems: 'center',
              fontSize: fontSizes.sm,
              flexWrap: 'wrap'
            }}
          >
            <ToggleBlock
              label="Rate limiter"
              on={!limiterDisabled}
              loading={limiterLoading}
              disabledClick={isRunning || limiterLoading}
              onClick={handleToggleLimiter}
              alertWhenOff
              title={
                isRunning
                  ? 'Cannot change while a test is running'
                  : limiterDisabled
                  ? 'Click to re-enable rate limiting'
                  : 'Click to disable rate limiting (load testing only)'
              }
            />
            <ToggleBlock
              label="Maintenance"
              on={!maintenanceEnabled}
              loading={maintenanceLoading}
              disabledClick={maintenanceLoading}
              onClick={handleToggleMaintenance}
              alertWhenOff={false}
              alertWhenOn
              title={
                maintenanceEnabled
                  ? 'Click to bring the site back up'
                  : 'Click to put the site in maintenance mode (admins always retain access)'
              }
            />
          </div>
        </div>

        {error && (
          <p
            style={{
              color: colors.danger,
              marginTop: space.md,
              fontSize: fontSizes.sm
            }}
          >
            {error}
          </p>
        )}
      </Card>

      {/* --- Run status ----------------------------------------------- */}
      {runStatus !== 'idle' && (
        <RunStatusBanner
          runStatus={runStatus}
          runLabel={runLabel}
          elapsed={elapsed}
          expectedDuration={expectedDuration}
        />
      )}

      {/* --- Charts --------------------------------------------------- */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: space.md,
          marginBottom: space.md
        }}
      >
        <ChartCard title="Requests / sec (and errors)">
          <LineChart
            data={reqSeries}
            formatY={(v) => formatCount(v)}
            series={[
              { key: 'reqPerSec', label: 'req/s', color: colors.accent },
              { key: 'failedPerSec', label: 'failed/s', color: colors.danger }
            ]}
          />
        </ChartCard>

        <ChartCard title="Latency (ms)">
          <LineChart
            data={latencySeries}
            formatY={(v) => `${Math.round(v)}ms`}
            series={[
              { key: 'mean', label: 'mean', color: colors.textMuted },
              { key: 'p50', label: 'p50', color: colors.cyan },
              { key: 'p95', label: 'p95', color: colors.magenta }
            ]}
          />
        </ChartCard>

        <ChartCard title="Server CPU & memory (%)">
          <LineChart
            data={systemSeries}
            yMax={100}
            formatY={(v) => `${Math.round(v)}%`}
            series={[
              { key: 'cpuPercent', label: 'CPU %', color: colors.danger },
              { key: 'memPercent', label: 'Mem %', color: colors.accent }
            ]}
          />
        </ChartCard>
      </div>

      {/* --- Summary -------------------------------------------------- */}
      {summary && (
        <Card variant="accent" style={{ marginBottom: space.md }}>
          <SectionTitle>Summary</SectionTitle>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: space.sm
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
        </Card>
      )}

      {/* --- Log ------------------------------------------------------ */}
      <div
        style={{
          border: `1px solid ${colors.border}`,
          borderRadius: radii.lg,
          overflow: 'hidden',
          marginBottom: space['2xl']
        }}
      >
        <div
          style={{
            background: colors.codeChrome,
            color: colors.text,
            padding: `${space.sm} ${space.md}`,
            fontSize: fontSizes.sm,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: space.sm,
            borderBottom: `1px solid ${colors.border}`
          }}
        >
          <span style={{ fontFamily: fonts.mono, color: colors.textSecondary }}>
            Log output ({logs.length} line{logs.length === 1 ? '' : 's'})
          </span>
          <button
            type="button"
            onClick={handleCopyLog}
            disabled={logs.length === 0}
            title={logs.length === 0 ? 'No log to copy' : 'Copy log output'}
            style={{
              background: 'transparent',
              color:
                copyState === 'copied' ? colors.accent : colors.textSecondary,
              border:
                '1px solid ' +
                (copyState === 'copied' ? colors.accent : colors.border),
              padding: '0.25rem 0.6rem',
              borderRadius: radii.sm,
              fontFamily: fonts.mono,
              fontSize: fontSizes.xs,
              cursor: logs.length === 0 ? 'not-allowed' : 'pointer',
              opacity: logs.length === 0 ? 0.5 : 1,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            {copyState === 'copied'
              ? 'Copied'
              : copyState === 'error'
              ? 'Copy failed'
              : 'Copy'}
          </button>
        </div>
        <div
          ref={logBoxRef}
          style={{
            background: colors.codeBg,
            color: colors.text,
            fontFamily: fonts.mono,
            fontSize: '0.78rem',
            padding: space.md,
            height: 220,
            overflowY: 'auto',
            whiteSpace: 'pre-wrap'
          }}
        >
          {logs.length === 0 ? (
            <span style={{ color: colors.textMuted }}>No log output yet.</span>
          ) : (
            logs.map((line, idx) => (
              <div
                key={idx}
                style={{
                  color:
                    line.stream === 'stderr' ? colors.danger : colors.text
                }}
              >
                {line.text}
              </div>
            ))
          )}
        </div>
      </div>
      </Container>
    </>
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

const pageTitleStyle = {
  fontFamily: fonts.heading,
  fontSize: 'clamp(2rem, 4vw, 3rem)',
  fontWeight: fontWeights.bold,
  lineHeight: 1.1,
  letterSpacing: '-0.02em',
  margin: `${space.md} 0 0`,
  color: colors.text
}

function SectionTitle({ children }) {
  return (
    <h2
      style={{
        fontFamily: fonts.heading,
        fontSize: fontSizes.lg,
        fontWeight: fontWeights.semibold,
        color: colors.text,
        margin: `0 0 ${space.md}`
      }}
    >
      {children}
    </h2>
  )
}

function ChartCard({ title, children }) {
  return (
    <Card padding={space.md}>
      <h3
        style={{
          margin: `0 0 ${space.sm}`,
          fontFamily: fonts.heading,
          fontSize: fontSizes.sm,
          fontWeight: fontWeights.semibold,
          color: colors.text
        }}
      >
        {title}
      </h3>
      {children}
    </Card>
  )
}

function SummaryStat({ label, value }) {
  return (
    <div
      style={{
        background: colors.bg,
        borderRadius: radii.md,
        padding: '0.5rem 0.75rem',
        border: `1px solid ${colors.borderSubtle}`
      }}
    >
      <div
        style={{
          fontSize: fontSizes.xs,
          textTransform: 'uppercase',
          color: colors.textMuted,
          letterSpacing: '0.08em',
          fontFamily: fonts.mono
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: fontSizes.lg,
          fontWeight: fontWeights.bold,
          color: colors.text,
          marginTop: '0.15rem',
          fontFamily: fonts.mono
        }}
      >
        {value}
      </div>
    </div>
  )
}

// ToggleBlock — green pill when "on", warning-tinted when "off". `alertWhenOff`
// is for the rate limiter (off = danger). `alertWhenOn` is for maintenance
// mode (on = warning visible to all users). The `on`/`off` semantics flip
// between the two so we can keep the green = good convention.
function ToggleBlock({
  label,
  on,
  loading,
  disabledClick,
  onClick,
  alertWhenOff,
  alertWhenOn,
  title
}) {
  const danger = (!on && alertWhenOff) || (on && alertWhenOn)
  const bg = on
    ? alertWhenOn
      ? colors.warning + '22'
      : colors.successMuted
    : colors.dangerMuted
  const fg = on
    ? alertWhenOn
      ? colors.warning
      : colors.success
    : colors.danger
  const border = '1px solid ' + (danger ? fg : colors.borderAccent)
  return (
    <div style={{ display: 'flex', gap: space.sm, alignItems: 'center' }}>
      <span
        style={{
          color: colors.textSecondary,
          fontFamily: fonts.mono,
          fontSize: fontSizes.xs,
          letterSpacing: '0.05em',
          textTransform: 'uppercase'
        }}
      >
        {label}:
      </span>
      <button
        type="button"
        onClick={onClick}
        disabled={disabledClick}
        title={title}
        style={{
          background: bg,
          color: fg,
          border,
          padding: '0.3rem 0.75rem',
          borderRadius: radii.full,
          fontSize: fontSizes.xs,
          fontFamily: fonts.mono,
          fontWeight: fontWeights.semibold,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          cursor: disabledClick ? 'not-allowed' : 'pointer',
          opacity: disabledClick ? 0.65 : 1
        }}
      >
        {loading ? '…' : on ? 'ON — click to disable' : 'OFF — click to enable'}
      </button>
    </div>
  )
}

function RunStatusBanner({ runStatus, runLabel, elapsed, expectedDuration }) {
  const config = {
    running: { bg: colors.cyanMuted, border: colors.cyan, fg: colors.text },
    completed: { bg: colors.successMuted, border: colors.success, fg: colors.text },
    failed: { bg: colors.dangerMuted, border: colors.danger, fg: colors.text },
    stopped: { bg: colors.dangerMuted, border: colors.danger, fg: colors.text },
    starting: { bg: colors.surface, border: colors.border, fg: colors.text }
  }[runStatus] || { bg: colors.surface, border: colors.border, fg: colors.text }
  return (
    <div
      style={{
        background: config.bg,
        border: `1px solid ${config.border}`,
        borderRadius: radii.md,
        padding: `${space.sm} ${space.md}`,
        marginBottom: space.md,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: space.sm,
        color: config.fg
      }}
    >
      <div style={{ fontFamily: fonts.heading, fontSize: fontSizes.md }}>
        <strong>{labelForStatus(runStatus)}</strong>
        {runLabel && <> — {runLabel}</>}
      </div>
      <div
        style={{
          fontSize: fontSizes.sm,
          color: colors.textSecondary,
          fontFamily: fonts.mono
        }}
      >
        {runStatus === 'running' && expectedDuration
          ? `${formatDuration(elapsed)} / ~${formatDuration(expectedDuration)}`
          : runStatus === 'running'
          ? formatDuration(elapsed)
          : ''}
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
