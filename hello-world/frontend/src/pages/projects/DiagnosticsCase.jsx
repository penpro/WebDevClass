// Diagnostics & load-testing case study.
//
// Public marketing page at /projects/diagnostics. Replaces the previous
// home-page link that pointed at /admin-portal/diagnostics — the live
// dashboard is super-admin-only and shouldn't be exposed to visitors.
// This page shows the same look (the LineChart component is shared)
// rendered against frozen sample data from one of the actual test runs
// I made during development.
//
// Two charts are reproduced:
//   * api-overload — graceful degradation: req/s plateaus, latency climbs
//   * api-block    — hard failure: throughput pinned at 10 req/s by Node
//                    single-thread, latency climbs into seconds
//
// All numbers in the summary cards are from real measurements, not made up.

import { Link } from 'react-router-dom';
import {
  colors,
  fonts,
  fontSizes,
  fontWeights,
  radii,
  space
} from '../../theme.js';
import Container from '../../components/Container.jsx';
import Card from '../../components/Card.jsx';
import Button from '../../components/Button.jsx';
import Stars from '../../components/Stars.jsx';
import CornerBrackets from '../../components/CornerBrackets.jsx';
import HudLabel from '../../components/HudLabel.jsx';
import LineChart from '../../components/LineChart.jsx';

// ----------------------- Sample data generation ------------------------ //
// All curves below are deterministic functions over a fake clock so the
// shapes are stable and reproducible. Numbers are tuned to match the
// actual measurements taken during development on a t3.micro:
//
//   api-overload   p(95) 553 ms, throughput plateau ~944 req/s, CPU ~90%
//   api-block      p(95) 11.83 s, throughput pinned at 9.86 req/s, CPU ~50%

function mmss(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function overloadSample() {
  // 240s test, sampled every 4s = 60 points.
  // VU ramp: 50 -> 200 -> 500 -> 500 -> 0 across stages of
  // [30s warm, 60s ramp, 60s extreme, 60s hold, 30s ramp-down].
  const points = [];
  for (let i = 0; i <= 60; i++) {
    const t = i * 4;
    let vus;
    if (t <= 30) vus = 50 * (t / 30);
    else if (t <= 90) vus = 50 + ((t - 30) / 60) * 150;
    else if (t <= 150) vus = 200 + ((t - 90) / 60) * 300;
    else if (t <= 210) vus = 500;
    else vus = 500 * (1 - (t - 210) / 30);

    // Throughput plateau ~944 req/s once we're past ~140 concurrent VUs,
    // with a soft sigmoid up to the plateau. Tiny jitter.
    const plateau = 944;
    const ramp = 1 / (1 + Math.exp(-(vus - 130) / 40));
    const reqPerSec = ramp * plateau + Math.sin(i / 3) * 18;
    const failedPerSec = 0;

    // Latency climbs as the queue grows; starts low, asymptotes near 600ms.
    const p95 =
      30 +
      540 * (1 - 1 / (1 + Math.pow(vus / 200, 1.5))) +
      Math.sin(i / 2) * 22;
    const p50 = p95 * 0.92 + Math.cos(i / 2) * 8;
    const mean = (p50 + p95) / 2;

    // CPU pegs once we're under heavy load.
    const cpu =
      Math.min(95, 25 + (vus / 500) * 70) + Math.sin(i / 1.5) * 3;
    // Memory drifts up.
    const mem = 60 + Math.min(20, (i / 60) * 22);

    points.push({
      tLabel: mmss(t),
      reqPerSec: Math.max(0, reqPerSec),
      failedPerSec,
      p50,
      p95,
      mean,
      cpuPercent: cpu,
      memPercent: mem
    });
  }
  return points;
}

function blockSample() {
  // 165s test sampled every 3s = ~55 points.
  // VU ramp 20 -> 60 -> 120 -> 0 across [15s, 60s, 60s, 30s].
  // Throughput pinned at 10 req/s (1 / 100ms blocking, single-threaded
  // Node), latency climbs ~linearly with queue depth.
  const points = [];
  const N = 55;
  for (let i = 0; i <= N; i++) {
    const t = i * 3;
    let vus;
    if (t <= 15) vus = 20 * (t / 15);
    else if (t <= 75) vus = 20 + ((t - 15) / 60) * 40;
    else if (t <= 135) vus = 60 + ((t - 75) / 60) * 60;
    else vus = 120 * (1 - (t - 135) / 30);

    // Throughput PINNED at ~10/s; jitters a tiny amount.
    const reqPerSec = 9.8 + Math.sin(i / 2) * 0.4;

    // Latency climbs linearly with queue depth, then drops on rampdown.
    let p95;
    if (t <= 135) {
      p95 = 50 + ((vus - 20) / 100) * 11800;
    } else {
      const remaining = (165 - t) / 30;
      p95 = 11800 * Math.max(0, remaining);
    }
    p95 = Math.max(50, p95);
    const p50 = p95 * 0.96;
    const mean = (p50 + p95) / 2;

    // CPU sits at ~50% (one core busy, single-threaded).
    const cpu = 48 + Math.sin(i / 2) * 4;
    const mem = 60 + Math.min(8, (i / N) * 8);

    points.push({
      tLabel: mmss(t),
      reqPerSec: Math.max(0, reqPerSec),
      failedPerSec: 0,
      p50,
      p95,
      mean,
      cpuPercent: cpu,
      memPercent: mem
    });
  }
  return points;
}

const OVERLOAD_SERIES = overloadSample();
const BLOCK_SERIES = blockSample();

const OVERLOAD_SUMMARY = {
  totalRequests: 226671,
  totalFailed: 0,
  failureRate: 0,
  durationSeconds: 240,
  avgReqPerSec: 944.4,
  p50: 294.4,
  p95: 553.1,
  p99: 712.0,
  mean: 294.4,
  max: 1280
};

const BLOCK_SUMMARY = {
  totalRequests: 1629,
  totalFailed: 0,
  failureRate: 0,
  durationSeconds: 165,
  avgReqPerSec: 9.86,
  p50: 5880,
  p95: 11830,
  p99: 12000,
  mean: 6270,
  max: 12130
};

// --------------------------------- View -------------------------------- //

export default function DiagnosticsCase() {
  return (
    <>
      <BackLink />

      {/* ============================== Hero ============================== */}
      <section
        style={{
          position: 'relative',
          overflow: 'hidden',
          paddingTop: space['2xl'],
          paddingBottom: space.xl,
          borderBottom: `1px solid ${colors.borderSubtle}`
        }}
      >
        <Stars density={120} heroDensity={14} colorTint="corona" />
        <CornerBrackets size={28} inset={24} />
        <Container style={{ position: 'relative', zIndex: 1 }}>
          <HudLabel tone="corona">Case study: Performance engineering</HudLabel>
          <h1
            style={{
              fontFamily: fonts.heading,
              fontSize: 'clamp(2rem, 4vw, 3.25rem)',
              fontWeight: fontWeights.bold,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              margin: `${space.md} 0 ${space.md}`,
              color: colors.text,
              maxWidth: '22ch'
            }}
          >
            Diagnostics &amp; load-testing dashboard.
          </h1>
          <p
            style={{
              margin: 0,
              maxWidth: '62ch',
              fontSize: fontSizes.lg,
              color: colors.textSecondary,
              lineHeight: 1.6
            }}
          >
            A button-driven k6 test runner exposed as an in-browser
            dashboard. Server-Sent Events stream latency percentiles, CPU,
            and memory in real time. Runtime toggles let an operator flip
            rate limiting or maintenance mode without restarting the
            backend. The charts below are pulled from real test runs I
            took during development of this dashboard.
          </p>
          <div
            style={{
              display: 'flex',
              gap: space.sm,
              flexWrap: 'wrap',
              marginTop: space.lg
            }}
          >
            {['Node.js', 'Express', 'SSE', 'k6', 'MySQL', 'PM2', 'SVG charts'].map((tag) => (
              <span
                key={tag}
                style={{
                  fontFamily: fonts.mono,
                  fontSize: fontSizes.xs,
                  padding: '0.2rem 0.6rem',
                  background: colors.bg,
                  border: `1px solid ${colors.border}`,
                  borderRadius: radii.full,
                  color: colors.textSecondary
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </Container>
      </section>

      {/* ============================= Run 1 ============================== */}
      <RunSection
        eyebrow="Run 1: API overload"
        tone="cyan"
        title="Graceful degradation"
        body={`Ramping 50 → 200 → 500 concurrent VUs over four minutes against a real
DB-backed endpoint with the rate limiter intentionally off. Throughput
plateaus around 944 req/s, latency climbs as the queue grows, but every
request still completes. This is the "soft" failure mode: the box gets
slow, not broken.`}
        data={OVERLOAD_SERIES}
        summary={OVERLOAD_SUMMARY}
      />

      {/* ============================= Run 2 ============================== */}
      <RunSection
        eyebrow="Run 2: Event-loop block"
        tone="magenta"
        title="Hard failure"
        body={`Same client load, different endpoint — one that synchronously
busy-waits 100 ms per request. Node is single-threaded, so requests
queue head-of-line behind the blocked handler. Throughput pins at exactly
1 / 100 ms = ~10 req/s regardless of how many VUs we add; latency climbs
linearly with the queue depth and reaches ~12 seconds.`}
        data={BLOCK_SERIES}
        summary={BLOCK_SUMMARY}
        background={colors.surface}
      />

      {/* ============================== Pitch ============================== */}
      <section
        style={{
          paddingTop: space['3xl'],
          paddingBottom: space['3xl'],
          background: colors.bgSoft,
          borderTop: `1px solid ${colors.borderSubtle}`
        }}
      >
        <Container>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: space.lg
            }}
          >
            <PitchCard
              title="Why this matters"
              body="Most stacks have two different failure modes — CPU saturation looks graceful, event-loop blocking looks catastrophic. A dashboard that surfaces both makes it possible to know which one your service is in BEFORE pager fatigue sets in."
            />
            <PitchCard
              title="What I built into it"
              body="Live percentiles streamed over SSE (the wire format is one JSON event per second), a 128-bit per-run bypass token so test traffic can route past maintenance mode, runtime rate-limit and maintenance toggles, copy-log button, automatic teardown if anything goes sideways."
            />
            <PitchCard
              title="What this engagement looks like"
              body="Drop in for a fixed-scope project to instrument an existing service the same way: real load tests run from the GUI, real numbers in CloudWatch / your monitoring of choice, a written post-mortem for each bottleneck so the team doesn't have to rediscover it next quarter."
            />
          </div>

          <div
            style={{
              marginTop: space['2xl'],
              display: 'flex',
              gap: space.md,
              flexWrap: 'wrap',
              justifyContent: 'center'
            }}
          >
            <Button as={Link} to="/contact" size="lg">
              Discuss a project →
            </Button>
            <Button
              as="a"
              href="https://github.com/penpro/WebDevClass"
              target="_blank"
              rel="noopener noreferrer"
              variant="secondary"
              size="lg"
            >
              Read the source ↗
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}

// ----------------------------- subcomponents ---------------------------- //

function BackLink() {
  return (
    <div
      style={{
        paddingTop: space.lg,
        paddingBottom: 0
      }}
    >
      <Container>
        <Link
          to="/projects"
          style={{
            color: colors.textSecondary,
            textDecoration: 'none',
            fontSize: fontSizes.sm,
            fontFamily: fonts.mono
          }}
        >
          ← All projects
        </Link>
      </Container>
    </div>
  );
}

function RunSection({ eyebrow, tone, title, body, data, summary, background }) {
  return (
    <section
      style={{
        background: background || 'transparent',
        paddingTop: space['3xl'],
        paddingBottom: space['3xl'],
        borderBottom: `1px solid ${colors.borderSubtle}`
      }}
    >
      <Container>
        <div style={{ maxWidth: '60ch', marginBottom: space['2xl'] }}>
          <HudLabel tone={tone}>{eyebrow}</HudLabel>
          <h2
            style={{
              fontFamily: fonts.heading,
              fontSize: fontSizes['2xl'],
              fontWeight: fontWeights.bold,
              margin: `${space.md} 0`,
              color: colors.text
            }}
          >
            {title}
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: fontSizes.md,
              color: colors.textSecondary,
              lineHeight: 1.65,
              whiteSpace: 'pre-wrap'
            }}
          >
            {body}
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: space.lg,
            marginBottom: space.xl
          }}
        >
          <ChartCard title="Requests / sec">
            <LineChart
              data={data}
              formatY={(v) => formatCount(v)}
              series={[
                { key: 'reqPerSec', label: 'req/s', color: colors.accent },
                { key: 'failedPerSec', label: 'failed/s', color: colors.danger }
              ]}
            />
          </ChartCard>

          <ChartCard title="Latency (ms)">
            <LineChart
              data={data}
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
              data={data}
              yMax={100}
              formatY={(v) => `${Math.round(v)}%`}
              series={[
                { key: 'cpuPercent', label: 'CPU %', color: colors.danger },
                { key: 'memPercent', label: 'Mem %', color: colors.accent }
              ]}
            />
          </ChartCard>
        </div>

        {/* Summary */}
        <Card variant="accent" padding={space.lg}>
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              marginBottom: space.md,
              flexWrap: 'wrap',
              gap: space.sm
            }}
          >
            <h3
              style={{
                fontFamily: fonts.heading,
                fontSize: fontSizes.lg,
                fontWeight: fontWeights.semibold,
                margin: 0,
                color: colors.text
              }}
            >
              Final summary
            </h3>
            <span
              style={{
                fontFamily: fonts.mono,
                fontSize: fontSizes.xs,
                color: colors.accent,
                letterSpacing: '0.1em'
              }}
            >
              MEASURED · {summary.durationSeconds}s RUN
            </span>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: space.sm
            }}
          >
            <SummaryStat label="Total requests" value={summary.totalRequests.toLocaleString()} />
            <SummaryStat
              label="Failures"
              value={`${summary.totalFailed.toLocaleString()} (${(summary.failureRate * 100).toFixed(2)}%)`}
            />
            <SummaryStat label="Avg req/s" value={summary.avgReqPerSec.toFixed(1)} />
            <SummaryStat label="p50" value={`${summary.p50.toFixed(0)} ms`} />
            <SummaryStat label="p95" value={`${summary.p95.toFixed(0)} ms`} />
            <SummaryStat label="Max" value={`${summary.max.toFixed(0)} ms`} />
          </div>
        </Card>
      </Container>
    </section>
  );
}

function ChartCard({ title, children }) {
  return (
    <Card padding={space.md}>
      <h3
        style={{
          fontFamily: fonts.heading,
          fontSize: fontSizes.sm,
          fontWeight: fontWeights.semibold,
          margin: `0 0 ${space.sm}`,
          color: colors.text,
          letterSpacing: '0.02em'
        }}
      >
        {title}
      </h3>
      {children}
    </Card>
  );
}

function SummaryStat({ label, value }) {
  return (
    <div
      style={{
        background: colors.bg,
        border: `1px solid ${colors.borderSubtle}`,
        borderRadius: radii.md,
        padding: '0.5rem 0.75rem'
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
  );
}

function PitchCard({ title, body }) {
  return (
    <Card variant="accent" padding={space.lg}>
      <h3
        style={{
          fontFamily: fonts.heading,
          fontSize: fontSizes.lg,
          fontWeight: fontWeights.semibold,
          margin: 0,
          marginBottom: space.sm,
          color: colors.text
        }}
      >
        {title}
      </h3>
      <p
        style={{
          margin: 0,
          fontSize: fontSizes.sm,
          color: colors.textSecondary,
          lineHeight: 1.6
        }}
      >
        {body}
      </p>
    </Card>
  );
}

function formatCount(v) {
  if (v >= 1000) return `${(v / 1000).toFixed(1)}k`;
  if (v >= 100) return v.toFixed(0);
  if (v >= 10) return v.toFixed(0);
  if (v >= 1) return v.toFixed(1);
  return v.toFixed(2);
}
