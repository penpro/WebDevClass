// Projects / portfolio index. Each card links to the re-themed wrapper
// route under /projects/<slug>. Wrappers themselves arrive in task #4 —
// for now the cards still link to the existing top-level routes
// (quicknotes, moodboard, etc.) which keep working until they're moved.

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
import Card from '../components/Card.jsx';
import Stars from '../components/Stars.jsx';
import CornerBrackets from '../components/CornerBrackets.jsx';
import HudLabel from '../components/HudLabel.jsx';

const PROJECTS = [
  {
    to: '/projects/diagnostics',
    // No fallback to the admin route — the case study at /projects/diagnostics
    // is the public-facing page. The live admin dashboard stays behind auth.
    badge: 'Performance engineering',
    title: 'Diagnostics & load-testing dashboard',
    summary:
      'A live k6 test runner exposed as a GUI: button-driven runs, SSE-streamed charts (req/s, latency percentiles, CPU+memory), runtime rate-limiter and maintenance toggles, and a 128-bit per-run bypass token. Built to measure the actual ceiling of a production stack.',
    stack: ['Node.js', 'Express', 'SSE', 'k6', 'MySQL', 'PM2'],
    auth: 'Case study (live tool is super_admin only)'
  },
  {
    to: '/projects/theory-of-computation',
    badge: 'Computer science depth',
    title: 'Theory of Computation review tool',
    summary:
      "Self-contained offline study app for Sipser's graduate-level theory of computation course. 670+ original questions across Chapters 0–8 + three exam checkpoints, a custom Leitner + streak + mastery-gated SRS scheduler, state-diagram practice for DFAs and NFAs, KaTeX-rendered math. Live themed build runs in the browser at /toc/; canonical offline build is on GitHub. Built to prove I can think about computability and complexity, not just stitch libraries.",
    stack: ['Vanilla JS', 'KaTeX', 'Spaced repetition', 'Offline-first'],
    auth: 'Live + offline (GitHub) — see case study'
  },
  {
    to: '/projects/repair360-auto',
    badge: 'Client work',
    title: 'Repair360 Auto — modern site inside a Wix panel',
    summary:
      "Client kept their Wix host because their booking app, email, and listings were already wired to it. Built a hand-written dependency-free single-file front-end (~160 KB, no framework, no build step) embedded in a Wix HTML/Iframe panel — plus the harder hidden work: reverse-engineering the brand from social-media flyers, JPEG-to-SVG logo recovery, defeating a UTF-8 mojibake bug in the delivery pipeline, and fixing the iframe SEO-invisibility trap with AutoRepair JSON-LD and native host elements.",
    stack: ['Vanilla JS', 'Responsive CSS', 'SVG vectorization', 'JSON-LD', 'Wix embed'],
    auth: 'Live site link inside the case study'
  },
  {
    to: '/projects/tasktrackr',
    fallback: '/tasktrackr',
    badge: 'Full-stack web app',
    title: 'TaskTrackr',
    summary:
      'Task manager with category sidebar, due-soon filter, auto-saving edits, and a Facebook-style progress feed per task. Free users upload images up to 10 MB; Premium users upload video up to 100 MB via a role-aware multer uploader gated on a Stripe subscription.',
    stack: ['React', 'Express', 'MySQL', 'multer', 'Stripe'],
    auth: 'Public — sign in to try it'
  },
  {
    to: '/projects/moodboard',
    fallback: '/moodboard',
    badge: 'Web app + canvas',
    title: 'MoodBoard',
    summary:
      'Image-URL boards with public share links, broken-image fallback, inline rename, and a client-side collage generator. The collage uses seeded layouts, cover-crop drawing, and pastel accent fills computed from the dominant color of neighbouring images — all in the browser, no server-side storage of images.',
    stack: ['React', 'Express', 'MySQL', 'HTML Canvas'],
    auth: 'Public — sign in to create, share link to view'
  },
  {
    to: '/projects/subscribe',
    fallback: '/subscribe',
    badge: 'Payments integration',
    title: 'Stripe subscription flow',
    summary:
      'Full Stripe Subscriptions integration with the Payment Element rendered inline (PCI scope stays out of our infra). Idempotent webhook handling via a stripe_events table, raw-body signature verification, and post-redirect polling so users see "Activating…" instead of a stale state during the webhook race window.',
    stack: ['React', 'Express', '@stripe/react-stripe-js', 'Stripe Webhooks'],
    auth: 'Public — sign in to use'
  },
  {
    to: '/projects/api-guide',
    fallback: '/api-guide',
    badge: 'Documentation',
    title: 'Public API guide',
    summary:
      'Browse-anywhere reference for every endpoint on the site, including REST conventions, status codes, role requirements, and which rate-limit tier applies. Exists partly as documentation and partly as evidence that the API has been thoughtfully designed.',
    stack: ['React'],
    auth: 'Public — no login required'
  },
  {
    to: '/projects/quicknotes',
    fallback: '/quicknotes',
    badge: 'Full-stack web app',
    title: 'QuickNotes',
    summary:
      'The original mini-app: user-scoped note list with full CRUD. The smallest possible vehicle for demonstrating sessions, auth, MySQL foreign keys, and a clean React form lifecycle.',
    stack: ['React', 'Express', 'MySQL', 'express-session'],
    auth: 'Public — sign in to try it'
  }
];

const EXTERNAL = [
  {
    href: 'https://github.com/penpro/WebDevClass',
    badge: 'Source code',
    title: 'Full repository on GitHub',
    summary:
      'Everything visible on this site — the React frontend, the Express backend with auth and four rate-limit tiers, the MySQL migration runner, the diagnostics infrastructure, the deploy scripts, the serverless companion project on AWS Lambda — all open for reading.'
  }
];

export default function Projects() {
  return (
    <>
      <section
        style={{
          position: 'relative',
          overflow: 'hidden',
          paddingTop: space['3xl'],
          paddingBottom: space.xl,
          borderBottom: `1px solid ${colors.borderSubtle}`
        }}
      >
        <Stars density={100} heroDensity={10} colorTint="corona" />
        <CornerBrackets size={28} inset={24} />
        <Container style={{ position: 'relative', zIndex: 1 }}>
          <HudLabel tone="corona">Projects</HudLabel>
          <h1
            style={{
              fontFamily: fonts.heading,
              fontSize: 'clamp(2rem, 4vw, 3.25rem)',
              fontWeight: fontWeights.bold,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              margin: `${space.md} 0 ${space.md}`,
              color: colors.text
            }}
          >
            Live, exercisable evidence.
          </h1>
          <p
            style={{
              margin: 0,
              maxWidth: '60ch',
              fontSize: fontSizes.lg,
              color: colors.textSecondary,
              lineHeight: 1.6
            }}
          >
            Each project below is running right now and you can click
            into it. A few require sign-in (free, no spam) — that&apos;s
            because they save data to the database, which only makes
            sense per-user.
          </p>
        </Container>
      </section>

      <section
        style={{
          paddingTop: space['2xl'],
          paddingBottom: space['3xl']
        }}
      >
        <Container>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(320px, 1fr))',
              gap: space.lg
            }}
          >
            {PROJECTS.map((p) => (
              <ProjectCard key={p.title} project={p} />
            ))}
            {EXTERNAL.map((p) => (
              <Card key={p.title} interactive>
                <a
                  href={p.href}
                  target="_blank"
                  rel="noopener noreferrer"
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
                    {p.badge}
                  </span>
                  <h2
                    style={{
                      fontFamily: fonts.heading,
                      fontSize: fontSizes.lg,
                      fontWeight: fontWeights.semibold,
                      margin: `${space.sm} 0`,
                      color: colors.text
                    }}
                  >
                    {p.title}
                  </h2>
                  <p
                    style={{
                      margin: 0,
                      fontSize: fontSizes.sm,
                      lineHeight: 1.6,
                      color: colors.textSecondary
                    }}
                  >
                    {p.summary}
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
                    Open on GitHub ↗
                  </span>
                </a>
              </Card>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}

function ProjectCard({ project }) {
  // The new /projects/<slug> wrapper routes don't exist yet — task #4.
  // Until they do, link to the working `fallback` (the old top-level
  // route) so the cards aren't broken between commits.
  const href = project.fallback || project.to;
  return (
    <Card interactive padding={space.lg}>
      <Link
        to={href}
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
          {project.badge}
        </span>
        <h2
          style={{
            fontFamily: fonts.heading,
            fontSize: fontSizes.lg,
            fontWeight: fontWeights.semibold,
            margin: `${space.sm} 0`,
            color: colors.text
          }}
        >
          {project.title}
        </h2>
        <p
          style={{
            margin: 0,
            fontSize: fontSizes.sm,
            lineHeight: 1.6,
            color: colors.textSecondary
          }}
        >
          {project.summary}
        </p>

        <div
          style={{
            marginTop: space.md,
            display: 'flex',
            gap: space.xs,
            flexWrap: 'wrap'
          }}
        >
          {project.stack.map((s) => (
            <span
              key={s}
              style={{
                fontFamily: fonts.mono,
                fontSize: fontSizes.xs,
                padding: '0.15rem 0.5rem',
                background: colors.bg,
                border: `1px solid ${colors.border}`,
                borderRadius: radii.full,
                color: colors.textSecondary
              }}
            >
              {s}
            </span>
          ))}
        </div>

        <div
          style={{
            marginTop: space.md,
            fontSize: fontSizes.xs,
            color: colors.textMuted
          }}
        >
          {project.auth}
        </div>

        <span
          style={{
            display: 'inline-block',
            marginTop: space.md,
            color: colors.accent,
            fontSize: fontSizes.sm,
            fontWeight: fontWeights.semibold
          }}
        >
          Open the project →
        </span>
      </Link>
    </Card>
  );
}
