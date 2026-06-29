// Aphelion — Penumbra product case study.
//
// Aphelion (n.) — the point in an orbit farthest from the sun. The name
// is the pitch: your AI, at the farthest point from the cloud. It's a
// free, open-source Windows desktop app that runs LLMs entirely on the
// user's own machine — Tauri v2 (Rust + React/TypeScript) shell around a
// bundled llama.cpp engine, GGUF models auto-fit to the user's GPU.
//
// Case study positions it inside the Penumbra family — same corona /
// eclipse motif as this site and the streaming overlay, same operator
// lineage as Penumbra Group / PC / Productions called out on /about.

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
import SectionRail from '../../components/SectionRail.jsx';
import useDocumentMeta from '../../hooks/useDocumentMeta.js';

const SECTIONS = [
  { id: 'hero',        num: '00', label: 'Intro' },
  { id: 'why',         num: '01', label: 'Why' },
  { id: 'what',        num: '02', label: 'What it does' },
  { id: 'engineering', num: '03', label: 'How it works' },
  { id: 'brand',       num: '04', label: 'Brand family' },
  { id: 'cta',         num: '05', label: 'Book a Call' }
];

const REPO_URL = 'https://github.com/penpro/Aphelion';
const DOWNLOAD_URL = 'https://github.com/penpro/Aphelion/releases/latest';
const BRAND_RAW = 'https://raw.githubusercontent.com/penpro/Aphelion/main/Branding/penumbra-brand';
const BANNER_SRC = `${BRAND_RAW}/readme-banner.svg`;
const ECLIPSE_SRC = `${BRAND_RAW}/logos/corona-eclipse.svg`;

export default function AphelionCase() {
  useDocumentMeta({
    title: 'Aphelion — local AI desktop app by Penumbra | Penumbra Tech',
    description:
      "Aphelion is a free, open-source Windows desktop app that runs powerful AI models entirely on your own machine. No cloud, no account, no telemetry. Tauri + Rust + bundled llama.cpp engine; auto-fits the best GGUF model to your GPU and VRAM. MIT licensed.",
    canonical: 'https://penumbra-tech.com/projects/aphelion'
  });

  return (
    <>
      <SectionRail sections={SECTIONS} />
      <BackLink />

      {/* ============================== Hero ============================== */}
      <section
        id="hero"
        style={{
          position: 'relative',
          overflow: 'hidden',
          paddingTop: space['2xl'],
          paddingBottom: space.xl,
          borderBottom: `1px solid ${colors.borderSubtle}`
        }}
      >
        <Stars density={140} heroDensity={16} colorTint="mixed" />
        <CornerBrackets size={28} inset={24} />
        <Container style={{ position: 'relative', zIndex: 1 }}>
          <HudLabel tone="corona">
            Case study: Product · Open source · Windows
          </HudLabel>
          <h1
            style={{
              fontFamily: fonts.heading,
              fontSize: 'clamp(2rem, 4vw, 3.25rem)',
              fontWeight: fontWeights.bold,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              margin: `${space.md} 0 ${space.md}`,
              color: colors.text,
              maxWidth: '24ch'
            }}
          >
            Aphelion: your AI, at the farthest point from the cloud.
          </h1>
          <p
            style={{
              margin: 0,
              maxWidth: '64ch',
              fontSize: fontSizes.lg,
              color: colors.textSecondary,
              lineHeight: 1.6
            }}
          >
            A free, open-source Windows desktop app that runs powerful AI
            models <em>entirely on your own machine</em>. One install. No
            servers, no Docker, no glue scripts, no account, no
            telemetry. It reads your GPU and VRAM and auto-fits the best
            local model that&apos;ll run fast. Then it gets out of the
            way and you chat, write, build characters, draft code, or
            branch dialogue — all in one window, all offline.
          </p>

          <div
            style={{
              display: 'flex',
              gap: space.sm,
              flexWrap: 'wrap',
              marginTop: space.lg
            }}
          >
            {[
              'Windows 10 / 11',
              'Tauri v2',
              'Rust + React + TypeScript',
              'llama.cpp + Vulkan',
              'GGUF models',
              '100% offline',
              'MIT'
            ].map((tag) => (
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

          <div
            style={{
              display: 'flex',
              gap: space.md,
              flexWrap: 'wrap',
              marginTop: space.xl
            }}
          >
            <Button
              as="a"
              href={DOWNLOAD_URL}
              target="_blank"
              rel="noopener noreferrer"
              size="lg"
            >
              Download for Windows ↓
            </Button>
            <Button
              as="a"
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              variant="secondary"
              size="lg"
            >
              View on GitHub ↗
            </Button>
          </div>
        </Container>
      </section>

      {/* =========================== Brand banner =========================== */}
      <BrandBanner src={BANNER_SRC} href={REPO_URL} />

      {/* =============================== Why ================================ */}
      <div id="why">
      <ChallengeSection
        eyebrow="Why this exists"
        tone="cyan"
        title="Local AI is everyone's correct answer; the plumbing is everyone's blocker."
      >
        <p>
          By 2026, the technically literate answer to &ldquo;where
          should my AI run&rdquo; is &ldquo;on your own hardware,
          unless there&apos;s a specific reason it can&apos;t.&rdquo;
          Your prompts and conversations stay on the machine. There&apos;s
          no per-token cost, no opaque retention policy, no rate-limit
          surprise, no server outage. The model file is yours.
        </p>
        <p>
          What stops most people from actually running local is the
          tower of plumbing: install an inference server (llama.cpp,
          Ollama, vLLM, LM Studio, take your pick), find a model file,
          guess which quantization fits your VRAM, install a chat
          front-end, configure them to talk to each other, then update
          all three when any one of them moves. By the time the user
          has a working setup they&apos;ve spent a Saturday on it and
          they&apos;re using a workflow they have to remember next
          month.
        </p>
        <p>
          Aphelion exists because that&apos;s the wrong shape of
          product. <strong style={{ color: colors.text }}>The right shape is one
          installer that hands you a working AI workspace.</strong>{' '}
          Auto-fit the model to the machine. Don&apos;t require an
          account. Don&apos;t phone home. Don&apos;t ask the user to
          understand what a quantization is. The infrastructure is
          plumbing; the workspace is the product.
        </p>
      </ChallengeSection>
      </div>

      {/* ============================== What ================================ */}
      <div id="what">
      <ChallengeSection
        background={colors.bgSoft}
        eyebrow="What it actually does"
        tone="corona"
        title="One install. Five workspaces in the same window."
      >
        <p>
          First-run setup detects your GPU + VRAM, picks a model that
          will run fast on it, and downloads it (one-time, 2–16 GB
          depending on the hardware). Then the model lives on disk and
          the app runs offline. You can change the model in Settings;
          there&apos;s an opt-in section for uncensored models behind a
          clear warning.
        </p>
        <ul
          style={{
            margin: `${space.md} 0 0`,
            paddingLeft: '1.4em',
            color: colors.textSecondary,
            fontSize: fontSizes.md,
            lineHeight: 1.7
          }}
        >
          <li>
            <strong style={{ color: colors.text }}>Chat</strong> — a
            real conversation UI with multiple personas (a coding
            expert, a blunt straight-answers expert, others).
          </li>
          <li style={{ marginTop: space.sm }}>
            <strong style={{ color: colors.text }}>Characters & roleplay</strong>
            {' '}— named characters with their own context and voice,
            group chats with several at once.
          </li>
          <li style={{ marginTop: space.sm }}>
            <strong style={{ color: colors.text }}>Story writing</strong>
            {' '}— long-form drafting with the model as a collaborator.
          </li>
          <li style={{ marginTop: space.sm }}>
            <strong style={{ color: colors.text }}>Dialogue trees</strong>
            {' '}— branching conversations for game writing or
            interactive fiction.
          </li>
          <li style={{ marginTop: space.sm }}>
            <strong style={{ color: colors.text }}>Code assistant</strong>
            {' '}— draft, analyze, refactor; an in-app expert profile
            tuned for it.
          </li>
        </ul>
        <p style={{ marginTop: space.lg }}>
          The five surfaces share the same loaded model, the same
          local memory, and the same workspace chrome. You don&apos;t
          juggle separate tools — they&apos;re tabs in one window with
          one running engine behind them.
        </p>
      </ChallengeSection>
      </div>

      {/* =========================== How it works ============================ */}
      <div id="engineering">
      <ChallengeSection
        eyebrow="How it works"
        tone="cyan"
        title="Tauri shell, llama.cpp engine, GGUF brain."
      >
        <p>
          The app is a{' '}
          <a
            href="https://tauri.app/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: colors.accent, textDecoration: 'none' }}
          >
            Tauri v2
          </a>{' '}
          desktop binary — a Rust core wrapping a React 18 / TypeScript /
          Vite front-end via the OS webview. Bundle size stays small
          (no shipped Chromium) and the Rust side handles file I/O,
          process supervision, and the bridge to the inference engine.
          The whole UI is built with the same design tokens this site
          uses (corona teal, void purple-black, JetBrains Mono).
        </p>
        <p>
          The inference engine is a bundled{' '}
          <a
            href="https://github.com/ggml-org/llama.cpp"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: colors.accent, textDecoration: 'none' }}
          >
            llama.cpp
          </a>{' '}
          server built against{' '}
          <strong style={{ color: colors.text }}>Vulkan</strong>, so it
          accelerates on AMD, Nvidia, and Intel GPUs without separate
          builds. Tauri starts it on app launch bound to{' '}
          <code style={inlineCodeStyle}>127.0.0.1</code> with no console
          window, the React UI talks to it over the loopback, and the
          process is killed on app exit. No external port is opened.
        </p>
        <p>
          Models are stored locally in{' '}
          <strong style={{ color: colors.text }}>GGUF</strong> format
          (the llama.cpp-native quantized file format). Setup reads
          the GPU&apos;s reported VRAM and picks a quantization tier
          that fits — bigger model on a 4090, smaller on a laptop iGPU
          — and writes the choice into a per-machine config so the
          next launch is instant. The opt-in uncensored section ships
          models from independent publishers; their licenses are
          shown alongside.
        </p>
        <p>
          What&apos;s deliberately NOT there: any telemetry endpoint,
          any account system, any analytics, any phone-home heartbeat.
          The lock icon in the corner is structural — there&apos;s no
          network code that COULD leak data even if asked.
        </p>
      </ChallengeSection>
      </div>

      {/* ============================ Brand family =========================== */}
      <div id="brand">
      <ChallengeSection
        background={colors.bgSoft}
        eyebrow="Brand family"
        tone="magenta"
        title="Same eclipse, different orbit."
      >
        <p>
          Aphelion is a Penumbra product — same corona-and-eclipse
          motif as this consulting site and the live streaming
          overlay, same JetBrains-Rider HUD chrome, same operator
          lineage that runs through Penumbra Group, Penumbra PC,
          Penumbra Productions, and Penumbra.tech. The name is the
          pitch: <em>aphelion</em> is the orbital point farthest from
          the sun, and the product is the point farthest from the
          cloud.
        </p>
        <p>
          That brand coherence isn&apos;t aesthetic vanity — it&apos;s
          a signal of how the practice operates. The same engineering
          standards that run the consulting work also ship the
          released software, with the same visual language tying it
          together. Aphelion is one more piece of evidence that
          Penumbra ships things, not just talks about shipping things.
        </p>
        <div
          style={{
            marginTop: space.lg,
            display: 'flex',
            gap: space.lg,
            flexWrap: 'wrap',
            alignItems: 'center'
          }}
        >
          <img
            src={ECLIPSE_SRC}
            alt="Aphelion corona-eclipse mark"
            loading="lazy"
            style={{
              width: 96,
              height: 96,
              display: 'block'
            }}
          />
          <p
            style={{
              margin: 0,
              color: colors.textMuted,
              fontFamily: fonts.mono,
              fontSize: fontSizes.xs,
              maxWidth: '40ch',
              lineHeight: 1.6
            }}
          >
            The Aphelion corona-eclipse mark — same brand DNA as the
            corner brackets and HUD labels throughout this site.
            Tokens, lockups, and social cards all live in the{' '}
            <a
              href={`${REPO_URL}/tree/main/Branding/penumbra-brand`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: colors.accent, textDecoration: 'none' }}
            >
              Branding package
            </a>{' '}
            in the repo.
          </p>
        </div>
      </ChallengeSection>
      </div>

      {/* =========================== Closing CTA =========================== */}
      <section
        id="cta"
        style={{
          background: colors.surface,
          borderTop: `1px solid ${colors.border}`,
          paddingTop: space['3xl'],
          paddingBottom: space['3xl']
        }}
      >
        <Container narrow style={{ textAlign: 'center' }}>
          <HudLabel tone="cyan">Get the app</HudLabel>
          <h2
            style={{
              fontFamily: fonts.heading,
              fontSize: fontSizes['2xl'],
              fontWeight: fontWeights.bold,
              margin: `${space.md} 0 ${space.md}`,
              color: colors.text
            }}
          >
            Free, open source, on your machine in minutes.
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: fontSizes.md,
              color: colors.textSecondary,
              lineHeight: 1.6
            }}
          >
            Download the installer, run it, give it a few minutes to
            pull the right model for your hardware, and you&apos;re
            chatting with your own AI offline. If you want a similar
            one-installer desktop product built for your own use case
            — Rust + Tauri + a domain-specific local model — that&apos;s
            a real shape of engagement; book a call below.
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
              href={DOWNLOAD_URL}
              target="_blank"
              rel="noopener noreferrer"
              size="lg"
            >
              Download for Windows ↓
            </Button>
            <Button as={Link} to="/contact" size="lg">
              Book a 30-min intro →
            </Button>
            <Button
              as="a"
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              variant="secondary"
              size="lg"
            >
              View on GitHub ↗
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
    <div style={{ paddingTop: space.lg }}>
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

function BrandBanner({ src, href }) {
  return (
    <section
      style={{
        paddingTop: space.xl,
        paddingBottom: space.xl,
        borderBottom: `1px solid ${colors.borderSubtle}`
      }}
    >
      <Container>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'block', textDecoration: 'none' }}
        >
          <Card padding={0} interactive style={{ overflow: 'hidden' }}>
            <img
              src={src}
              alt="Aphelion — Local AI, by Penumbra"
              loading="lazy"
              style={{
                display: 'block',
                width: '100%',
                height: 'auto',
                background: colors.bg
              }}
            />
            <div
              style={{
                padding: `${space.sm} ${space.md}`,
                fontSize: fontSizes.xs,
                color: colors.textSecondary,
                background: colors.surfaceMuted,
                borderTop: `1px solid ${colors.borderSubtle}`,
                fontFamily: fonts.mono
              }}
            >
              Aphelion brand banner — Branding/penumbra-brand/readme-banner.svg
            </div>
          </Card>
        </a>
      </Container>
    </section>
  );
}

function ChallengeSection({ eyebrow, tone, title, background, children }) {
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
        <div style={{ maxWidth: '64ch' }}>
          <HudLabel tone={tone}>{eyebrow}</HudLabel>
          <h2 style={sectionTitleStyle}>{title}</h2>
          <div
            style={{
              marginTop: space.md,
              color: colors.textSecondary,
              fontSize: fontSizes.md,
              lineHeight: 1.7
            }}
          >
            {children}
          </div>
        </div>
      </Container>
    </section>
  );
}

const sectionTitleStyle = {
  fontFamily: fonts.heading,
  fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
  fontWeight: fontWeights.bold,
  lineHeight: 1.15,
  letterSpacing: '-0.015em',
  margin: `${space.md} 0 0`,
  color: colors.text
};

const inlineCodeStyle = {
  fontFamily: fonts.mono,
  fontSize: '0.85em',
  background: colors.bg,
  color: colors.accentBright,
  padding: '0.1rem 0.4rem',
  borderRadius: radii.sm,
  border: `1px solid ${colors.borderSubtle}`
};
