// Penumbra Tech landing page — second pass.
//
// This version pulls in the streaming overlay's visual vocabulary so the
// website actually feels like Penumbra rather than a generic dark-mode
// portfolio. The signature elements:
//
//   * Eclipse SVG anchored to the right of the hero
//   * Starfield behind everything in the hero section
//   * Corner brackets framing the hero region
//   * HUD-style bracketed monospace eyebrow labels
//   * A real code panel below the hero (an actual snippet from the
//     diagnostics SSE handler) as visible proof of "real code, not
//     stock photos"
//   * Magenta highlight word in the headline (the "BeginPlay()" treatment)
//
// Below the hero the layout follows the original structure: a 4-card
// services grid, a featured-work row, and a closing CTA.

import { Link } from 'react-router-dom';
import {
  colors,
  fonts,
  fontSizes,
  fontWeights,
  radii,
  space
} from '../theme.js';
import Container from '../components/Container.jsx';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import Eclipse from '../components/Eclipse.jsx';
import Stars from '../components/Stars.jsx';
import CornerBrackets from '../components/CornerBrackets.jsx';
import HudLabel from '../components/HudLabel.jsx';
import CodePanel from '../components/CodePanel.jsx';

// One place to swap the Cal.com booking URL. Update once and every
// booking CTA on the site picks it up.
const CAL_BOOKING_URL = 'https://cal.com/wesley-weaver-avi7mu/30min';

// First named-client testimonial. Sourced direct from Ryan at 360 Auto,
// June 2026. Numbers (20-30 -> 40-50 calls/week) are his.
const RYAN_QUOTE =
  '"Heyo! Ryan from 360 Auto here. Our website was in shambles and Wes was able to redesign it and brought up the calls and car count from 20-30 up to 40-50 a week. He treated our website like his own and really knocked it out of the park."';

const POC_OFFERS = [
  {
    badge: 'Start here',
    price: '$5K',
    title: 'Diagnostic Week',
    body:
      'A short, focused engagement to find your actual constraint and put a written plan against it. One week digging through your stack, your data, and the bottleneck you can name. End the week with a written plan plus a fixed-price build quote. The fee rolls into the build credit if we move forward; the plan is yours either way.',
    bestFor:
      'You think you know what is wrong, but you want a senior eye on it before committing to a 4-6 week sprint.'
  },
  {
    badge: 'Most common',
    price: '$10K – $25K',
    title: 'Build Sprint',
    body:
      '4-6 weeks of fixed-scope work with weekly demos. Half paid up front, half on acceptance. The second half is not owed if week-one deliverables miss the agreed criteria. Typical scopes: a customer portal, an internal dashboard, a backend rescue, an audit and remediation.',
    bestFor:
      'You have a defined project and you want it shipped reliably without having to manage it daily.'
  },
  {
    badge: 'Ongoing',
    price: '$250 / hr',
    title: 'Retainer',
    body:
      'Block-of-hours arrangement for ongoing operations, on-call backstop, smaller asks, or the long-tail mode after a build engagement wraps. Hours roll month to month; no minimum monthly commitment.',
    bestFor:
      'You want a senior engineer on speed-dial without hiring full-time.'
  }
];

const SERVICES = [
  {
    icon: ServerIcon,
    title: 'Custom software',
    body:
      'Full-stack web apps, internal tools, and APIs. Built clean, documented, and handed over so your team can keep going.'
  },
  {
    icon: CloudIcon,
    title: 'Cloud & backend',
    body:
      'AWS deployments, MySQL and DynamoDB, CI/CD pipelines, and the operational glue that keeps a service running at 3am without paging anyone.'
  },
  {
    icon: GamepadIcon,
    title: 'Game development',
    body:
      'Unreal Engine builds, multiplayer systems, AI behaviour, web portals for live games. See the case study under Projects.'
  },
  {
    icon: ShieldIcon,
    title: 'Performance & reliability',
    body:
      'Load testing, security hardening, incident response. I find where your stack breaks before your users do.'
  }
];

const FEATURED = [
  {
    to: '/projects/diagnostics',
    badge: 'Performance engineering',
    title: 'Diagnostics & load-testing dashboard',
    body:
      'A live k6 test runner with SSE-streamed charts, runtime rate-limit and maintenance toggles, and a 128-bit bypass token model. Measured the actual ceiling of a t3.micro at ~1000 req/s.'
  },
  {
    to: '/tasktrackr',
    badge: 'Full-stack web app',
    title: 'TaskTrackr',
    body:
      'Task manager with category filtering, auto-saving edits, Facebook-style progress feed, and a role-aware multer uploader gated behind Stripe Subscriptions.'
  },
  {
    to: '/moodboard',
    badge: 'Web app + canvas',
    title: 'MoodBoard',
    body:
      'Image-URL boards with public share links and a client-side collage generator: seeded layouts, cover-crop drawing, and pastel accent fills computed from neighbouring images.'
  }
];

// Real snippet from diagnostics.js — the SSE bucket flusher that
// powers the live latency charts. Functional code; not a mock.
const HERO_CODE = `// 1-second SSE flush — keeps the chart smooth even at 1500 req/s.
function flushK6Bucket(run, now) {
  const a = run.k6Bucket;
  if (a.count === 0) return;

  const sorted = a.durations.slice().sort((x, y) => x - y);
  const p50 = sorted[Math.floor(sorted.length * 0.5)];
  const p95 = sorted[Math.floor(sorted.length * 0.95)];
  const mean = sorted.reduce((s, v) => s + v, 0) / sorted.length;

  broadcast(run, {
    type: 'k6_bucket',
    t: now,
    reqCount: a.count,
    failedCount: a.failedCount,
    p50, p95, mean
  });

  a.durations.length = 0;
  a.count = 0;
  a.failedCount = 0;
}`;

export default function PenumbraHome() {
  return (
    <>
      {/* ============================== Hero ============================== */}
      <section
        style={{
          position: 'relative',
          overflow: 'hidden',
          paddingTop: space['4xl'],
          paddingBottom: space['4xl'],
          minHeight: '78vh',
          display: 'flex',
          alignItems: 'center',
          borderBottom: `1px solid ${colors.borderSubtle}`
        }}
      >
        <Stars density={220} heroDensity={20} colorTint="mixed" />
        <CornerBrackets size={36} inset={32} />

        {/* Eclipse positioned to the right, partially off-canvas so it
            reads as a presence rather than a literal logo placement.
            On narrow viewports it slides further off and dims. */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            right: '-12%',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            zIndex: 0
          }}
          className="penumbra-eclipse-wrap"
        >
          <Eclipse size={620} glow={84} />
        </div>

        <Container style={{ position: 'relative', zIndex: 1, width: '100%' }}>
          <div style={{ maxWidth: '36rem' }}>
            <HudLabel tone="cyan" live>
              Now booking: Q3 2026
            </HudLabel>

            <h1
              style={{
                fontFamily: fonts.heading,
                fontSize: 'clamp(2.5rem, 5.5vw, 5rem)',
                fontWeight: fontWeights.bold,
                lineHeight: 1.04,
                letterSpacing: '-0.025em',
                margin: `${space.lg} 0 0`,
                color: colors.text
              }}
            >
              Reliable code.{' '}
              <span
                style={{
                  color: colors.magenta,
                  textShadow: `0 0 28px rgba(192, 132, 252, 0.45)`,
                  whiteSpace: 'nowrap'
                }}
              >
                Real impact.
              </span>
            </h1>

            <p
              style={{
                marginTop: space.lg,
                maxWidth: '38rem',
                fontSize: fontSizes.lg,
                lineHeight: 1.6,
                color: colors.textSecondary
              }}
            >
              Penumbra Tech is the single-engineer practice of Wesley
              Weaver Jr.{' '}
              <strong style={{ color: colors.text }}>
                I build across the seams
              </strong>: software, infrastructure, data, operations,
              and the human process around them. Web apps, AWS, Unreal
              Engine systems, and the reliability work that keeps
              everything from quietly falling over.
            </p>

            <div
              style={{
                display: 'flex',
                gap: space.md,
                marginTop: space.xl,
                flexWrap: 'wrap'
              }}
            >
              <Button as={Link} to="/contact" size="lg">
                Start a project →
              </Button>
              <Button as={Link} to="/projects" variant="secondary" size="lg">
                See the work
              </Button>
            </div>
          </div>
        </Container>

        {/* Hide the eclipse on narrow viewports — at phone widths the
            hero text needs the full canvas. */}
        <style>{`
          @media (max-width: 900px) {
            .penumbra-eclipse-wrap { opacity: 0.18; right: -30%; }
          }
        `}</style>
      </section>

      {/* ====================== Code panel "proof" ===================== */}
      <section
        style={{
          background: colors.bgSoft,
          paddingTop: space['3xl'],
          paddingBottom: space['3xl'],
          borderBottom: `1px solid ${colors.borderSubtle}`,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Container>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.15fr)',
              gap: space['2xl'],
              alignItems: 'center'
            }}
            className="penumbra-code-grid"
          >
            <div>
              <HudLabel tone="corona">Engineering, not slides</HudLabel>
              <h2
                style={{
                  fontFamily: fonts.heading,
                  fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)',
                  fontWeight: fontWeights.bold,
                  lineHeight: 1.15,
                  letterSpacing: '-0.02em',
                  margin: `${space.md} 0 ${space.md}`,
                  color: colors.text
                }}
              >
                The actual code I write.
              </h2>
              <p
                style={{
                  margin: 0,
                  fontSize: fontSizes.md,
                  color: colors.textSecondary,
                  lineHeight: 1.6,
                  maxWidth: '40ch'
                }}
              >
                This is a real function from the diagnostics
                dashboard: the SSE flush that lets the latency chart
                stream cleanly even when k6 is firing 1,500 req/s.
                Tight, documented, no framework gymnastics.
                That&apos;s the style across every project on this
                site.
              </p>
              <div style={{ marginTop: space.lg, display: 'flex', gap: space.md, flexWrap: 'wrap' }}>
                <Button
                  as={Link}
                  to="/projects/diagnostics"
                  variant="secondary"
                  size="sm"
                >
                  Read the case study →
                </Button>
                <Button
                  as="a"
                  href="https://github.com/penpro/WebDevClass"
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="ghost"
                  size="sm"
                >
                  Source on GitHub ↗
                </Button>
              </div>
            </div>
            <div style={{ minWidth: 0 }}>
              <CodePanel
                filename="diagnostics.js"
                language="js"
                code={HERO_CODE}
                status="LIVE"
                maxHeight="420px"
              />
            </div>
          </div>
          <style>{`
            @media (max-width: 900px) {
              .penumbra-code-grid {
                grid-template-columns: 1fr !important;
                gap: 2rem !important;
              }
            }
          `}</style>
        </Container>
      </section>

      {/* ============================ Engagements ============================ */}
      <section
        id="engagements"
        style={{
          paddingTop: space['3xl'],
          paddingBottom: space['3xl'],
          borderBottom: `1px solid ${colors.borderSubtle}`,
          position: 'relative',
          background: colors.surface
        }}
      >
        <Container>
          <SectionHeading
            eyebrow="How engagements start"
            title="Three ways to work together"
            body="Concrete shapes with concrete prices. Pick one or ask me which fits — I'll tell you if neither does."
            tone="cyan"
          />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(280px, 1fr))',
              gap: space.lg,
              marginTop: space['2xl']
            }}
          >
            {POC_OFFERS.map((offer) => (
              <Card key={offer.title} variant="accent" padding={space.lg}>
                <span
                  style={{
                    fontFamily: fonts.mono,
                    fontSize: fontSizes.xs,
                    color: colors.cyan,
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em'
                  }}
                >
                  {offer.badge}
                </span>
                <div
                  style={{
                    fontFamily: fonts.heading,
                    fontSize: fontSizes['2xl'],
                    fontWeight: fontWeights.bold,
                    color: colors.text,
                    marginTop: space.xs,
                    letterSpacing: '-0.01em'
                  }}
                >
                  {offer.price}
                </div>
                <h3
                  style={{
                    fontFamily: fonts.heading,
                    fontSize: fontSizes.lg,
                    fontWeight: fontWeights.semibold,
                    color: colors.text,
                    margin: `${space.xs} 0 ${space.sm}`
                  }}
                >
                  {offer.title}
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: fontSizes.sm,
                    lineHeight: 1.65,
                    color: colors.textSecondary
                  }}
                >
                  {offer.body}
                </p>
                <p
                  style={{
                    margin: `${space.md} 0 0`,
                    fontFamily: fonts.mono,
                    fontSize: fontSizes.xs,
                    color: colors.textMuted,
                    lineHeight: 1.55,
                    paddingTop: space.md,
                    borderTop: `1px dashed ${colors.borderSubtle}`
                  }}
                >
                  <strong style={{ color: colors.textSecondary, fontWeight: fontWeights.semibold }}>
                    Best for:
                  </strong>{' '}
                  {offer.bestFor}
                </p>
              </Card>
            ))}
          </div>
          <div
            style={{
              marginTop: space['2xl'],
              display: 'flex',
              gap: space.md,
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}
          >
            <Button
              as="a"
              href={CAL_BOOKING_URL}
              target="_blank"
              rel="noreferrer noopener"
              size="lg"
            >
              Book a 30-min intro →
            </Button>
            <Button as={Link} to="/contact" variant="secondary" size="lg">
              Send a written brief
            </Button>
          </div>
          <p
            style={{
              marginTop: space.lg,
              fontFamily: fonts.mono,
              fontSize: fontSizes.xs,
              color: colors.textMuted,
              textAlign: 'center',
              letterSpacing: '0.04em',
              textTransform: 'uppercase'
            }}
          >
            Next intake window opens within ~2 weeks of intro call
          </p>
        </Container>
      </section>

      {/* =========================== Testimonial =========================== */}
      <section
        style={{
          paddingTop: space['3xl'],
          paddingBottom: space['3xl'],
          borderBottom: `1px solid ${colors.borderSubtle}`,
          position: 'relative'
        }}
      >
        <Container narrow>
          <HudLabel tone="magenta">From the client side</HudLabel>
          <blockquote
            style={{
              margin: `${space.lg} 0 0`,
              padding: 0,
              fontFamily: fonts.heading,
              fontSize: fontSizes.xl,
              lineHeight: 1.4,
              color: colors.text,
              letterSpacing: '-0.01em',
              fontStyle: 'normal'
            }}
          >
            {RYAN_QUOTE}
          </blockquote>
          <p
            style={{
              margin: `${space.lg} 0 0`,
              fontSize: fontSizes.sm,
              color: colors.textSecondary,
              lineHeight: 1.55
            }}
          >
            Ryan, owner ·{' '}
            <a
              href="https://www.repair360auto.com/"
              target="_blank"
              rel="noreferrer noopener"
              style={{ color: colors.accent, textDecoration: 'none' }}
            >
              360 Auto
            </a>{' '}
            · Port Orchard, WA
          </p>
          <p
            style={{
              margin: `${space.sm} 0 0`,
              fontSize: fontSizes.xs,
              fontFamily: fonts.mono,
              color: colors.textMuted,
              letterSpacing: '0.04em'
            }}
          >
            Read the full engineering writeup:{' '}
            <Link
              to="/projects/repair360-auto"
              style={{ color: colors.cyan, textDecoration: 'none' }}
            >
              Repair360 case study →
            </Link>
          </p>
        </Container>
      </section>

      {/* =========================== Services =========================== */}
      <section
        style={{
          paddingTop: space['3xl'],
          paddingBottom: space['3xl'],
          borderBottom: `1px solid ${colors.borderSubtle}`,
          position: 'relative'
        }}
      >
        <Container>
          <SectionHeading
            eyebrow="What I do"
            title="Engineering across the stack"
            body="Most projects need a generalist who can pick up the entire problem instead of handing it off across three teams."
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(240px, 1fr))',
              gap: space.lg,
              marginTop: space['2xl']
            }}
          >
            {SERVICES.map((service) => (
              <Card key={service.title} variant="accent">
                <service.icon />
                <h3
                  style={{
                    fontFamily: fonts.heading,
                    fontSize: fontSizes.lg,
                    fontWeight: fontWeights.semibold,
                    marginTop: space.md,
                    marginBottom: space.sm,
                    color: colors.text
                  }}
                >
                  {service.title}
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: fontSizes.sm,
                    lineHeight: 1.6,
                    color: colors.textSecondary
                  }}
                >
                  {service.body}
                </p>
              </Card>
            ))}
          </div>

          <div style={{ marginTop: space.xl, textAlign: 'center' }}>
            <Button as={Link} to="/services" variant="ghost">
              Detailed services breakdown →
            </Button>
          </div>
        </Container>
      </section>

      {/* ========================== Featured work ========================== */}
      <section
        style={{
          paddingTop: space['3xl'],
          paddingBottom: space['3xl']
        }}
      >
        <Container>
          <SectionHeading
            eyebrow="Featured work"
            title="Evidence, not promises"
            body="Each project below is live and exercisable. Click through to see the real working software."
            tone="corona"
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(280px, 1fr))',
              gap: space.lg,
              marginTop: space['2xl']
            }}
          >
            {FEATURED.map((item) => (
              <Card key={item.to} interactive>
                <Link
                  to={item.to}
                  style={{
                    color: 'inherit',
                    textDecoration: 'none',
                    display: 'block'
                  }}
                >
                  <span
                    style={{
                      fontFamily: fonts.mono,
                      fontSize: fontSizes.xs,
                      color: colors.cyan,
                      textTransform: 'uppercase',
                      letterSpacing: '0.12em'
                    }}
                  >
                    {item.badge}
                  </span>
                  <h3
                    style={{
                      fontFamily: fonts.heading,
                      fontSize: fontSizes.lg,
                      fontWeight: fontWeights.semibold,
                      margin: `${space.sm} 0`,
                      color: colors.text
                    }}
                  >
                    {item.title}
                  </h3>
                  <p
                    style={{
                      margin: 0,
                      fontSize: fontSizes.sm,
                      lineHeight: 1.6,
                      color: colors.textSecondary
                    }}
                  >
                    {item.body}
                  </p>
                  <span
                    style={{
                      display: 'inline-block',
                      marginTop: space.md,
                      color: colors.accent,
                      fontSize: fontSizes.sm,
                      fontWeight: fontWeights.semibold
                    }}
                  >
                    Open the case study →
                  </span>
                </Link>
              </Card>
            ))}
          </div>

          <div style={{ marginTop: space.xl, textAlign: 'center' }}>
            <Button as={Link} to="/projects" variant="ghost">
              All projects →
            </Button>
          </div>
        </Container>
      </section>

      {/* =========================== Closing CTA =========================== */}
      <section
        style={{
          background: colors.surface,
          borderTop: `1px solid ${colors.border}`,
          paddingTop: space['3xl'],
          paddingBottom: space['3xl']
        }}
      >
        <Container narrow style={{ textAlign: 'center' }}>
          <HudLabel tone="magenta">Let&apos;s talk</HudLabel>
          <h2
            style={{
              fontFamily: fonts.heading,
              fontSize: fontSizes['2xl'],
              fontWeight: fontWeights.bold,
              margin: `${space.md} 0 0`,
              color: colors.text
            }}
          >
            Have something tangled you want untangled?
          </h2>
          <p
            style={{
              marginTop: space.md,
              fontSize: fontSizes.md,
              color: colors.textSecondary,
              lineHeight: 1.6
            }}
          >
            Send a quick note describing what you&apos;re building or
            what&apos;s stuck. I&apos;ll reply with whether I think I can
            help. No commitment, no template-bot follow-up sequence.
          </p>
          <div
            style={{
              marginTop: space.xl,
              display: 'flex',
              gap: space.md,
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}
          >
            <Button
              as="a"
              href={CAL_BOOKING_URL}
              target="_blank"
              rel="noreferrer noopener"
              size="lg"
            >
              Book a 30-min intro →
            </Button>
            <Button as={Link} to="/contact" variant="secondary" size="lg">
              Send a written brief
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}

// -------------------------------------------------------------------- //
// Small bits.

function SectionHeading({ eyebrow, title, body, tone = 'cyan' }) {
  return (
    <div style={{ maxWidth: '60ch' }}>
      <HudLabel tone={tone}>{eyebrow}</HudLabel>
      <h2
        style={{
          fontFamily: fonts.heading,
          fontSize: fontSizes['2xl'],
          fontWeight: fontWeights.bold,
          margin: `${space.md} 0 ${space.md}`,
          color: colors.text,
          letterSpacing: '-0.01em'
        }}
      >
        {title}
      </h2>
      <p
        style={{
          margin: 0,
          fontSize: fontSizes.md,
          color: colors.textSecondary,
          lineHeight: 1.6
        }}
      >
        {body}
      </p>
    </div>
  );
}

// Service icons rebuilt as cleaner geometric forms — the previous
// gamepad and a few others were squished. These all share the same
// 22px viewBox so they line up in the card grid.
function IconWrap({ children }) {
  return (
    <div
      style={{
        width: 44,
        height: 44,
        borderRadius: radii.md,
        background: colors.accentMuted,
        border: `1px solid ${colors.accentBorder}`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: colors.accent,
        boxShadow: `0 0 16px rgba(94, 234, 212, 0.25) inset`
      }}
    >
      {children}
    </div>
  );
}

function ServerIcon() {
  return (
    <IconWrap>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="4" width="18" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
        <rect x="3" y="14" width="18" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
        <circle cx="6.5" cy="7" r="0.9" fill="currentColor" />
        <circle cx="6.5" cy="17" r="0.9" fill="currentColor" />
        <line x1="10" y1="7" x2="17" y2="7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="10" y1="17" x2="17" y2="17" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    </IconWrap>
  );
}

function CloudIcon() {
  return (
    <IconWrap>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M7 18 a4 4 0 0 1 -1 -7.8 a5 5 0 0 1 9.8 -1.2 A4 4 0 0 1 18 18 Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
      </svg>
    </IconWrap>
  );
}

// New, simpler joystick icon — the previous gamepad path rendered
// uneven. This one is a single d-pad + button cluster, reads cleanly.
function GamepadIcon() {
  return (
    <IconWrap>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect
          x="2.5"
          y="7"
          width="19"
          height="10"
          rx="5"
          stroke="currentColor"
          strokeWidth="1.7"
        />
        {/* D-pad on the left */}
        <line x1="6" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="7.5" y1="10.5" x2="7.5" y2="13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        {/* Buttons on the right */}
        <circle cx="15.5" cy="11" r="1.1" fill="currentColor" />
        <circle cx="17.5" cy="12.8" r="1.1" fill="currentColor" />
      </svg>
    </IconWrap>
  );
}

function ShieldIcon() {
  return (
    <IconWrap>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 3 L20 6 V12 a8 8 0 0 1 -8 8 a8 8 0 0 1 -8 -8 V6 Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <path
          d="M9 12 l2 2 l4 -4"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </IconWrap>
  );
}
