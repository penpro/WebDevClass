// Penumbra Tech landing page.
//
// Structure (top to bottom):
//   * Hero — name, tagline, value prop, primary CTA
//   * Services — three to four service cards
//   * Featured work — small grid pulled from the projects index
//   * Closing CTA — "Have a project?" prompt
//
// The hero deliberately lives flush against the navbar so the dark
// circuit background carries the eye all the way down. Subsequent
// sections use the surfaceMuted background to create rhythm.

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
import CircuitBackground from '../components/CircuitBackground.jsx';

const SERVICES = [
  {
    icon: ServerIcon,
    title: 'Custom software',
    body:
      'Full-stack web apps, internal tools, and APIs. Built clean, documented, and handed over so your team can keep going.'
  },
  {
    icon: CloudIcon,
    title: 'Cloud &amp; backend',
    body:
      'AWS deployments, MySQL and DynamoDB, CI/CD pipelines, and the operational glue that keeps a service running at 3am without paging anyone.'
  },
  {
    icon: GamepadIcon,
    title: 'Game development',
    body:
      'Unreal Engine builds, multiplayer systems, AI behaviour, web portals for live games — see the case study under Projects.'
  },
  {
    icon: ShieldIcon,
    title: 'Performance &amp; reliability',
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
    to: '/projects/tasktrackr',
    badge: 'Full-stack web app',
    title: 'TaskTrackr',
    body:
      'Task manager with category filtering, auto-saving edits, Facebook-style progress feed, and a role-aware multer uploader gated behind Stripe Subscriptions.'
  },
  {
    to: '/projects/moodboard',
    badge: 'Web app + canvas',
    title: 'MoodBoard',
    body:
      'Image-URL boards with public share links and a client-side collage generator — seeded layouts, cover-crop drawing, and pastel accent fills computed from neighbouring images.'
  }
];

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
          borderBottom: `1px solid ${colors.borderSubtle}`
        }}
      >
        <CircuitBackground opacity={0.1} color={colors.accent} />

        <Container style={{ position: 'relative' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: space.xs,
              padding: '0.35rem 0.75rem',
              borderRadius: radii.full,
              background: colors.accentMuted,
              border: `1px solid ${colors.accent}`,
              color: colors.cyan,
              fontFamily: fonts.mono,
              fontSize: fontSizes.xs,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              marginBottom: space.lg
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: radii.full,
                background: colors.success,
                display: 'inline-block'
              }}
            />
            Now booking projects
          </span>

          <h1
            style={{
              fontFamily: fonts.heading,
              fontSize: 'clamp(2.25rem, 5vw, 4.5rem)',
              fontWeight: fontWeights.bold,
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
              margin: 0,
              maxWidth: '18ch'
            }}
          >
            Reliable code.{' '}
            <span style={{ color: colors.accent }}>Real impact.</span>
          </h1>

          <p
            style={{
              marginTop: space.lg,
              maxWidth: '60ch',
              fontSize: fontSizes.lg,
              lineHeight: 1.55,
              color: colors.textSecondary
            }}
          >
            Penumbra Tech is a one-person consultancy that helps
            freelancers and small businesses turn complex problems into
            clean software and reliable systems. Web apps, cloud
            infrastructure, game development, and the operational glue
            that keeps it all working.
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
        </Container>
      </section>

      {/* =========================== Services =========================== */}
      <section
        style={{
          background: colors.surfaceMuted,
          paddingTop: space['3xl'],
          paddingBottom: space['3xl'],
          borderBottom: `1px solid ${colors.borderSubtle}`
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
                  // dangerouslySetInnerHTML required because some titles
                  // contain &amp; entities (which JSX won't decode in
                  // child text the way HTML does).
                  dangerouslySetInnerHTML={{ __html: service.title }}
                />
                <p
                  style={{
                    margin: 0,
                    fontSize: fontSizes.sm,
                    lineHeight: 1.55,
                    color: colors.textSecondary
                  }}
                  dangerouslySetInnerHTML={{ __html: service.body }}
                />
              </Card>
            ))}
          </div>

          <div
            style={{
              marginTop: space.xl,
              textAlign: 'center'
            }}
          >
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
              <Card
                key={item.to}
                interactive
                style={{ display: 'block', textDecoration: 'none' }}
                {...{
                  // Render the whole card as a Link without breaking
                  // Card's prop expectations.
                  onClick: () => {
                    window.location.href = item.to;
                  }
                }}
              >
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
                      letterSpacing: '0.08em'
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

          <div
            style={{
              marginTop: space.xl,
              textAlign: 'center'
            }}
          >
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
          <h2
            style={{
              fontFamily: fonts.heading,
              fontSize: fontSizes['2xl'],
              fontWeight: fontWeights.bold,
              margin: 0,
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
              lineHeight: 1.55
            }}
          >
            Send a quick note describing what you&apos;re building or
            what&apos;s stuck. I&apos;ll reply with whether I think I can
            help — no commitment, no template-bot follow-up sequence.
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
            <Button as={Link} to="/contact" size="lg">
              Start a project →
            </Button>
            <Button
              as="a"
              href="mailto:wesleyaweaverjr@gmail.com"
              variant="secondary"
              size="lg"
            >
              Or email me directly
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}

// -------------------------------------------------------------------- //
// Small bits.

function SectionHeading({ eyebrow, title, body }) {
  return (
    <div style={{ maxWidth: '60ch' }}>
      <span
        style={{
          fontFamily: fonts.mono,
          fontSize: fontSizes.xs,
          color: colors.cyan,
          textTransform: 'uppercase',
          letterSpacing: '0.1em'
        }}
      >
        {eyebrow}
      </span>
      <h2
        style={{
          fontFamily: fonts.heading,
          fontSize: fontSizes['2xl'],
          fontWeight: fontWeights.bold,
          margin: `${space.sm} 0 ${space.md}`,
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
          lineHeight: 1.55
        }}
      >
        {body}
      </p>
    </div>
  );
}

// Quick inline SVG icons so we don't pull a library. Each is sized at
// 32px and inherits the accent color from its parent card.
function IconWrap({ children }) {
  return (
    <div
      style={{
        width: 44,
        height: 44,
        borderRadius: radii.md,
        background: colors.accentMuted,
        border: `1px solid ${colors.accent}`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: colors.accent
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
        <rect
          x="3"
          y="4"
          width="18"
          height="6"
          rx="1.5"
          stroke="currentColor"
          strokeWidth="2"
        />
        <rect
          x="3"
          y="14"
          width="18"
          height="6"
          rx="1.5"
          stroke="currentColor"
          strokeWidth="2"
        />
        <circle cx="7" cy="7" r="1" fill="currentColor" />
        <circle cx="7" cy="17" r="1" fill="currentColor" />
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
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    </IconWrap>
  );
}

function GamepadIcon() {
  return (
    <IconWrap>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M6 8h12 a4 4 0 0 1 4 4 v0 a4 4 0 0 1 -7 2.5 L13 14 h-2 l-2 0.5 A4 4 0 0 1 2 12 a4 4 0 0 1 4 -4 z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <line x1="7" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="8" y1="11" x2="8" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="16" cy="11" r="0.8" fill="currentColor" />
        <circle cx="17.5" cy="12.5" r="0.8" fill="currentColor" />
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
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M9 12 l2 2 l4 -4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </IconWrap>
  );
}
