// Projects / portfolio index.
//
// Each project carries a `category` field. The page groups them into
// titled sections — Client work, Infrastructure & SaaS, Web apps,
// Computer science & games, Reference — and the SectionRail on the
// left gets a stop per category so a buyer can jump straight to the
// kind of evidence they care about.
//
// A plain substring search at the top of the page filters across every
// category at once (title + summary + stack). Sections with zero
// matches collapse to a "no matches" line so the rail anchors still
// scroll-land correctly.

import { useMemo, useState } from 'react';
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
import Button from '../components/Button.jsx';
import Stars from '../components/Stars.jsx';
import CornerBrackets from '../components/CornerBrackets.jsx';
import HudLabel from '../components/HudLabel.jsx';
import SectionRail from '../components/SectionRail.jsx';
import useDocumentMeta from '../hooks/useDocumentMeta.js';

const SECTIONS = [
  { id: 'hero',           num: '00', label: 'Intro' },
  { id: 'cat-products',   num: '01', label: 'Products' },
  { id: 'cat-client',     num: '02', label: 'Client work' },
  { id: 'cat-infra',      num: '03', label: 'Infrastructure' },
  { id: 'cat-apps',       num: '04', label: 'Web apps' },
  { id: 'cat-csgames',    num: '05', label: 'CS & tools' },
  { id: 'cat-reference',  num: '06', label: 'Source & docs' },
  { id: 'book',           num: '07', label: 'Book a Call' }
];

const CATEGORIES = [
  {
    id: 'cat-products',
    label: 'Products',
    intro:
      'Shipped, downloadable software — Steam releases and installable Windows apps under the Penumbra family of studios.'
  },
  {
    id: 'cat-client',
    label: 'Client work',
    intro: 'Paid engagements with named outside clients.'
  },
  {
    id: 'cat-infra',
    label: 'Infrastructure & SaaS',
    intro: 'The plumbing — load testing, payments, deploys, SaaS rescue patterns.'
  },
  {
    id: 'cat-apps',
    label: 'Web apps',
    intro: 'Full-stack web apps with auth, MySQL, and the seams that always need work.'
  },
  {
    id: 'cat-csgames',
    label: 'Computer science & tools',
    intro:
      'Pure-craft work: graduate-level theory of computation depth and zero-dependency browser tools.'
  },
  {
    id: 'cat-reference',
    label: 'Source & documentation',
    intro: 'Where to read the actual code and the public API.'
  }
];

const PROJECTS = [
  {
    category: 'cat-infra',
    to: '/saas-rescue',
    badge: 'Playbook · SaaS infrastructure',
    title: 'The 6-week SaaS-rescue playbook',
    summary:
      "Vertical-specific long-form for the solo founder four months into a SaaS who is shipping features fine but losing a day or two a week to TLS, payments, deploys, and the stuff nobody notices until it breaks. Eight chapters with real code from this backend (Stripe webhook ordering, /api/health pattern, nightly mysqldump, nginx security headers). Each chapter has a 'what hiring me looks like in this week' reframe. Free if you have the time, the price if you don't.",
    stack: ['Express patterns', 'Stripe', 'AWS / EC2', 'nginx hardening', 'Operations'],
    auth: 'Open playbook · Save as PDF · Book a 30-min intro'
  },
  {
    category: 'cat-infra',
    to: '/projects/diagnostics',
    badge: 'Performance engineering',
    title: 'Diagnostics & load-testing dashboard',
    summary:
      'A live k6 test runner exposed as a GUI: button-driven runs, SSE-streamed charts (req/s, latency percentiles, CPU+memory), runtime rate-limiter and maintenance toggles, and a 128-bit per-run bypass token. Built to measure the actual ceiling of a production stack.',
    stack: ['Node.js', 'Express', 'SSE', 'k6', 'MySQL', 'PM2'],
    auth: 'Case study (live tool is super_admin only)'
  },
  {
    category: 'cat-products',
    to: '/projects/aphelion',
    badge: 'Penumbra product · Open source · Windows',
    title: 'Aphelion: local AI desktop app',
    summary:
      "A free, open-source Windows desktop app that runs powerful LLMs entirely on the user's own machine. Tauri v2 (Rust + React + TypeScript) shell around a bundled llama.cpp engine (Vulkan), GGUF models auto-fit to the GPU's reported VRAM. One installer, no servers, no Docker, no account, no telemetry, no phone-home. Five workspaces share the same loaded engine: chat, characters & roleplay, story writing, dialogue trees, code assistant. Aphelion (n.) — the orbital point farthest from the sun; your AI, at the farthest point from the cloud.",
    stack: ['Tauri v2', 'Rust', 'React + TypeScript + Vite', 'llama.cpp + Vulkan', 'GGUF models', '100% offline'],
    auth: 'Free download · Windows installer · MIT'
  },
  {
    category: 'cat-products',
    to: '/projects/metaverse-origins',
    badge: 'Published software · Steam Early Access',
    title: 'Metaverse: Origins',
    summary:
      "Steam Early Access since May 2021 under the Penumbra.tech studio name. 150K+ lines across 500+ files and 15 subsystems: a studio-sized codebase run on indie headcount. The interesting story isn't the game; it's the pipeline I built around it: a live-engine test harness an agent can drive, a standing audit pipeline with adversarial verification (last pass surfaced 9 critical + 48 high-severity defects), and a structured agent memory that keeps the work coherent across months.",
    stack: [
      'Steam Early Access',
      'Agent-driven CI',
      'Adversarial audit',
      'Live-engine harness',
      '150K+ LOC',
      'Penumbra.tech'
    ],
    auth: 'Live on Steam: paid, pre-alpha (read the EA framing)'
  },
  {
    category: 'cat-products',
    to: '/projects/trigonometry-tools',
    badge: 'Published software · Steam',
    title: 'Trigonometry Tools',
    summary:
      "A free educational game published to Steam in April 2025 under the Penumbra Productions name. Gamifies the unit-circle drill that precalculus students need to reach fluency (radians, sine, cosine at every standard angle) on a Steam-installed PC. Small on purpose, but it went through the full Steam release process: Steamworks app, store presence, public download.",
    stack: ['Steam release', 'Education', 'Penumbra Productions'],
    auth: 'Live on Steam, free download'
  },
  {
    category: 'cat-csgames',
    to: '/projects/theory-of-computation',
    badge: 'Computer science depth',
    title: 'Theory of Computation review tool',
    summary:
      "Self-contained offline study app for Sipser's graduate-level theory of computation course. 670+ original questions across Chapters 0–8 + three exam checkpoints, a custom Leitner + streak + mastery-gated SRS scheduler, state-diagram practice for DFAs and NFAs, KaTeX-rendered math. Live themed build runs in the browser at /toc/; canonical offline build is on GitHub. Built to prove I can think about computability and complexity, not just stitch libraries.",
    stack: ['Vanilla JS', 'KaTeX', 'Spaced repetition', 'Offline-first'],
    auth: 'Live + offline (GitHub); see case study'
  },
  {
    category: 'cat-csgames',
    to: '/projects/music-visualizer',
    badge: 'Single-file web app · Open source',
    title: 'Penumbra Music Visualizer',
    summary:
      "I wanted a music visualizer that survived bad wifi at a party — no install, no cookies, no signup, no cloud dependency, just one HTML file you double-click. Drag a song onto it and nine reactive visualizers light up (three Penumbra-branded, six conventional spectrum treatments). From-scratch BPM detection via onset-envelope autocorrelation, musical-key detection via Krumhansl-Schmuckler chroma — both cached in localStorage so each song is analyzed once. Tab-audio capture lets it visualize YouTube Music or Spotify; built-in canvas+audio recorder exports a .webm. Zero dependencies, no build step, ~52KB of one index.html.",
    stack: ['Single-file HTML', 'Web Audio API', 'Canvas 2D', 'FFT / BPM / Key detection', 'localStorage cache', 'MediaRecorder'],
    auth: 'Open source · MIT · Download index.html, double-click'
  },
  {
    category: 'cat-client',
    to: '/projects/repair360-auto',
    badge: 'Client work',
    title: 'Repair360 Auto: modern site inside a Wix panel',
    summary:
      "Client kept their Wix host because their booking app, email, and listings were already wired to it. Built a hand-written dependency-free single-file front-end (~160 KB, no framework, no build step) embedded in a Wix HTML/Iframe panel, plus the harder hidden work: reverse-engineering the brand from social-media flyers, JPEG-to-SVG logo recovery, defeating a UTF-8 mojibake bug in the delivery pipeline, and fixing the iframe SEO-invisibility trap with AutoRepair JSON-LD and native host elements. Calls and car count went from 20-30/wk to 40-50/wk.",
    stack: ['Vanilla JS', 'Responsive CSS', 'SVG vectorization', 'JSON-LD', 'Wix embed'],
    auth: 'Live site link inside the case study'
  },
  {
    category: 'cat-apps',
    to: '/projects/tasktrackr',
    fallback: '/tasktrackr',
    badge: 'Full-stack web app',
    title: 'TaskTrackr',
    summary:
      'Task manager with category sidebar, due-soon filter, auto-saving edits, and a Facebook-style progress feed per task. Free users upload images up to 10 MB; Premium users upload video up to 100 MB via a role-aware multer uploader gated on a Stripe subscription.',
    stack: ['React', 'Express', 'MySQL', 'multer', 'Stripe'],
    auth: 'Public; sign in to try it'
  },
  {
    category: 'cat-apps',
    to: '/projects/moodboard',
    fallback: '/moodboard',
    badge: 'Web app + canvas',
    title: 'MoodBoard',
    summary:
      'Image-URL boards with public share links, broken-image fallback, inline rename, and a client-side collage generator. The collage uses seeded layouts, cover-crop drawing, and pastel accent fills computed from the dominant color of neighbouring images, all in the browser, no server-side storage of images.',
    stack: ['React', 'Express', 'MySQL', 'HTML Canvas'],
    auth: 'Public; sign in to create, share link to view'
  },
  {
    category: 'cat-infra',
    to: '/projects/subscribe',
    fallback: '/subscribe',
    badge: 'Payments integration',
    title: 'Stripe subscription flow',
    summary:
      'Full Stripe Subscriptions integration with the Payment Element rendered inline (PCI scope stays out of our infra). Idempotent webhook handling via a stripe_events table, raw-body signature verification, and post-redirect polling so users see "Activating…" instead of a stale state during the webhook race window.',
    stack: ['React', 'Express', '@stripe/react-stripe-js', 'Stripe Webhooks'],
    auth: 'Public; sign in to use'
  },
  {
    category: 'cat-reference',
    to: '/projects/api-guide',
    fallback: '/api-guide',
    badge: 'Documentation',
    title: 'Public API guide',
    summary:
      'Browse-anywhere reference for every endpoint on the site, including REST conventions, status codes, role requirements, and which rate-limit tier applies. Exists partly as documentation and partly as evidence that the API has been thoughtfully designed.',
    stack: ['React'],
    auth: 'Public; no login required'
  },
  {
    category: 'cat-apps',
    to: '/projects/quicknotes',
    fallback: '/quicknotes',
    badge: 'Full-stack web app',
    title: 'QuickNotes',
    summary:
      'The original mini-app: user-scoped note list with full CRUD. The smallest possible vehicle for demonstrating sessions, auth, MySQL foreign keys, and a clean React form lifecycle.',
    stack: ['React', 'Express', 'MySQL', 'express-session'],
    auth: 'Public; sign in to try it'
  }
];

const EXTERNAL = [
  {
    category: 'cat-reference',
    href: 'https://github.com/penpro/WebDevClass',
    badge: 'Source code',
    title: 'Full repository on GitHub',
    summary:
      'Everything visible on this site (the React frontend, the Express backend with auth and four rate-limit tiers, the MySQL migration runner, the diagnostics infrastructure, the deploy scripts, the serverless companion project on AWS Lambda) all open for reading.',
    stack: ['React', 'Express', 'MySQL', 'AWS', 'Open source']
  }
];

function matchesQuery(project, q) {
  if (!q) return true;
  const haystack = (
    project.title +
    ' ' +
    project.summary +
    ' ' +
    (project.stack || []).join(' ') +
    ' ' +
    (project.badge || '')
  ).toLowerCase();
  return q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => haystack.includes(term));
}

export default function Projects() {
  useDocumentMeta({
    title: 'Live projects and case studies | Penumbra Tech',
    description:
      'Live, exercisable evidence — case studies and running demos across client work, SaaS infrastructure, performance engineering, computer science depth, and Steam-published software.',
    canonical: 'https://penumbra-tech.com/projects'
  });

  const [query, setQuery] = useState('');

  const allProjects = useMemo(() => [...PROJECTS, ...EXTERNAL], []);
  const filtered = useMemo(
    () => allProjects.filter((p) => matchesQuery(p, query)),
    [allProjects, query]
  );
  const totalCount = allProjects.length;
  const filteredCount = filtered.length;

  return (
    <>
      <SectionRail sections={SECTIONS} />
      <section
        id="hero"
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
            Each project below is either shipped as a real product you
            can install, or running right now and you can click into
            it. A few require sign-in (free, no spam) — that&apos;s
            because they save data to the database, which only makes
            sense per-user.
          </p>

          {/* Search bar — substring match across title, summary, stack,
              badge. Plain controlled input, no fancy fuzzy library. */}
          <div
            style={{
              marginTop: space.xl,
              display: 'flex',
              alignItems: 'center',
              gap: space.md,
              flexWrap: 'wrap'
            }}
          >
            <label
              htmlFor="project-search"
              style={{
                fontFamily: fonts.mono,
                fontSize: fontSizes.xs,
                color: colors.cyan,
                textTransform: 'uppercase',
                letterSpacing: '0.08em'
              }}
            >
              Search
            </label>
            <input
              id="project-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="stripe · k6 · unreal · stack name · keyword"
              style={{
                flex: '1 1 320px',
                maxWidth: 520,
                padding: '0.6rem 0.9rem',
                background: colors.bg,
                border: `1px solid ${colors.border}`,
                borderRadius: radii.md,
                color: colors.text,
                fontFamily: fonts.mono,
                fontSize: fontSizes.sm,
                outline: 'none'
              }}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                style={{
                  background: 'transparent',
                  border: `1px solid ${colors.border}`,
                  borderRadius: radii.md,
                  padding: '0.5rem 0.75rem',
                  color: colors.textSecondary,
                  fontFamily: fonts.mono,
                  fontSize: fontSizes.xs,
                  cursor: 'pointer'
                }}
              >
                Clear
              </button>
            )}
            <span
              style={{
                fontFamily: fonts.mono,
                fontSize: fontSizes.xs,
                color: colors.textMuted,
                marginLeft: 'auto'
              }}
            >
              {query
                ? `${filteredCount} of ${totalCount} matching`
                : `${totalCount} projects`}
            </span>
          </div>
        </Container>
      </section>

      {CATEGORIES.map((cat) => {
        const projectsInCat = filtered.filter((p) => p.category === cat.id);
        return (
          <section
            key={cat.id}
            id={cat.id}
            style={{
              paddingTop: space['2xl'],
              paddingBottom: space.xl,
              borderBottom: `1px solid ${colors.borderSubtle}`
            }}
          >
            <Container>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: space.sm,
                  marginBottom: space.lg
                }}
              >
                <div>
                  <h2
                    style={{
                      margin: 0,
                      fontFamily: fonts.heading,
                      fontSize: fontSizes.xl,
                      fontWeight: fontWeights.bold,
                      color: colors.text
                    }}
                  >
                    {cat.label}
                  </h2>
                  <p
                    style={{
                      margin: `${space.xs} 0 0`,
                      color: colors.textSecondary,
                      fontSize: fontSizes.sm,
                      maxWidth: '60ch'
                    }}
                  >
                    {cat.intro}
                  </p>
                </div>
                <span
                  style={{
                    fontFamily: fonts.mono,
                    fontSize: fontSizes.xs,
                    color: colors.textMuted,
                    letterSpacing: '0.04em'
                  }}
                >
                  {projectsInCat.length} project
                  {projectsInCat.length === 1 ? '' : 's'}
                </span>
              </div>

              {projectsInCat.length === 0 ? (
                <p
                  style={{
                    color: colors.textMuted,
                    fontStyle: 'italic',
                    fontSize: fontSizes.sm,
                    margin: 0
                  }}
                >
                  No matches in this category.
                </p>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(auto-fit, minmax(320px, 1fr))',
                    gap: space.lg
                  }}
                >
                  {projectsInCat.map((p) =>
                    p.href ? (
                      <ExternalCard key={p.title} project={p} />
                    ) : (
                      <ProjectCard key={p.title} project={p} />
                    )
                  )}
                </div>
              )}
            </Container>
          </section>
        );
      })}

      <section
        id="book"
        style={{
          paddingTop: space['3xl'],
          paddingBottom: space['3xl'],
          scrollMarginTop: 90,
          textAlign: 'center'
        }}
      >
        <Container>
          <h2
            style={{
              margin: 0,
              fontFamily: fonts.heading,
              fontSize: fontSizes.xl,
              fontWeight: fontWeights.bold,
              color: colors.text
            }}
          >
            See something close to your problem?
          </h2>
          <p
            style={{
              margin: `${space.md} auto 0`,
              maxWidth: '52ch',
              color: colors.textSecondary,
              fontSize: fontSizes.base,
              lineHeight: 1.6
            }}
          >
            Most engagements start with a 30-minute call. Quick sketch of the
            problem, honest answer on whether I'm the right person for it, and
            a rough shape of the work.
          </p>
          <div style={{ marginTop: space.lg }}>
            <Button as={Link} to="/contact" size="lg">
              Book a 30-min intro →
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}

function ProjectCard({ project }) {
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
        <CardBody project={project} />
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

function ExternalCard({ project }) {
  return (
    <Card interactive padding={space.lg}>
      <a
        href={project.href}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          color: 'inherit',
          textDecoration: 'none',
          display: 'block'
        }}
      >
        <CardBody project={project} />
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
  );
}

function CardBody({ project }) {
  return (
    <>
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
      <h3
        style={{
          fontFamily: fonts.heading,
          fontSize: fontSizes.lg,
          fontWeight: fontWeights.semibold,
          margin: `${space.sm} 0`,
          color: colors.text
        }}
      >
        {project.title}
      </h3>
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

      {project.stack && (
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
      )}

      {project.auth && (
        <div
          style={{
            marginTop: space.md,
            fontSize: fontSizes.xs,
            color: colors.textMuted
          }}
        >
          {project.auth}
        </div>
      )}
    </>
  );
}
