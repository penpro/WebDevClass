// Aphelion — Penumbra product case study.
//
// Aphelion has its own marketing site at https://penpro.github.io/Aphelion/
// — that's the canonical product page (features, models, FAQ, safety
// framing, screenshots, download CTAs).  Rather than fork that content
// here and drift, this page is a thin consulting-side wrapper:
//
//   1. A short "why this matters for a Penumbra client" framing — the
//      part that belongs on the consulting site, not the product site.
//   2. The live product page embedded inline via iframe, so visitors
//      see the same marketing the GitHub release does without us
//      maintaining two copies.
//   3. A closing CTA: download + book-a-call.
//
// Updating the product page on the Aphelion repo's docs/index.html
// automatically reflects here — there is no sync step.  Required
// nginx config: frame-src must include https://penpro.github.io
// (added in security-headers-snippet.conf).

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
import Button from '../../components/Button.jsx';
import Stars from '../../components/Stars.jsx';
import CornerBrackets from '../../components/CornerBrackets.jsx';
import HudLabel from '../../components/HudLabel.jsx';
import SectionRail from '../../components/SectionRail.jsx';
import useDocumentMeta from '../../hooks/useDocumentMeta.js';

const SECTIONS = [
  { id: 'hero',  num: '00', label: 'Intro' },
  { id: 'why',   num: '01', label: 'Why this matters' },
  { id: 'live',  num: '02', label: 'Live product' },
  { id: 'brand', num: '03', label: 'Brand family' },
  { id: 'cta',   num: '04', label: 'Book a Call' }
];

const REPO_URL = 'https://github.com/penpro/Aphelion';
const DOWNLOAD_URL = 'https://github.com/penpro/Aphelion/releases/latest';
const PRODUCT_SITE = 'https://penpro.github.io/Aphelion/';

export default function AphelionCase() {
  useDocumentMeta({
    title: 'Aphelion — local AI desktop app by Penumbra | Penumbra Tech',
    description:
      "Aphelion is a free, open-source Windows desktop app that runs powerful AI models entirely on the user's own machine. No cloud, no account, no telemetry. Tauri + Rust + bundled llama.cpp engine; auto-fits the best GGUF model to the GPU. MIT licensed.",
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
        <Stars density={120} heroDensity={14} colorTint="mixed" />
        <CornerBrackets size={28} inset={24} />
        <Container style={{ position: 'relative', zIndex: 1 }}>
          <HudLabel tone="corona">
            Penumbra product · Open source · Windows
          </HudLabel>
          <h1
            style={{
              fontFamily: fonts.heading,
              fontSize: 'clamp(2rem, 4vw, 3rem)',
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
            A free, open-source Windows desktop app that runs powerful
            AI models entirely on the user&apos;s own machine. The
            product page is embedded below — the consulting-side note
            on why a Penumbra customer should care lives right here.
          </p>

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
            <Button
              as="a"
              href={PRODUCT_SITE}
              target="_blank"
              rel="noopener noreferrer"
              variant="secondary"
              size="lg"
            >
              Open product page ↗
            </Button>
          </div>
        </Container>
      </section>

      {/* ====================== Why this matters ============================ */}
      <section
        id="why"
        style={{
          paddingTop: space['3xl'],
          paddingBottom: space['3xl'],
          background: colors.bgSoft,
          borderBottom: `1px solid ${colors.borderSubtle}`
        }}
      >
        <Container>
          <div style={{ maxWidth: '64ch' }}>
            <HudLabel tone="cyan">Why this matters to a Penumbra client</HudLabel>
            <h2 style={sectionTitleStyle}>
              The same operator who ships consulting work also ships
              products.
            </h2>
            <div
              style={{
                marginTop: space.md,
                color: colors.textSecondary,
                fontSize: fontSizes.md,
                lineHeight: 1.7
              }}
            >
              <p>
                Most consulting sites show a list of past employers
                and ask you to trust the resume. Aphelion is a
                different kind of evidence: an end-to-end product —
                Tauri shell, bundled inference engine, auto-fit model
                pipeline, branded installer, GitHub Pages landing
                site, MIT license — released to the public under the
                Penumbra name. Anyone can download it, run it, and
                form their own opinion on the engineering quality.
              </p>
              <p>
                If your work needs a similar shape — a one-installer
                desktop tool that runs locally and doesn&apos;t depend
                on a cloud account, a domain-specific local-LLM
                assistant for a regulated industry, a small Tauri
                + Rust app wrapping an existing engine —{' '}
                <strong style={{ color: colors.text }}>that&apos;s a
                real engagement shape I can take on</strong>. The
                product below is the proof I&apos;ve done the work
                end-to-end at least once.
              </p>
              <p>
                The same coherence applies to the brand. Aphelion uses
                the same corona-eclipse motif, the same JetBrains-Rider
                HUD chrome, and the same Penumbra family lineage as
                this site, the streaming overlay, and the Steam-published
                games. That consistency is a signal: the standards on
                paid client work and the standards on shipped products
                are the same standards.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* =========================== Live iframe ============================ */}
      <section
        id="live"
        style={{
          paddingTop: space['2xl'],
          paddingBottom: space['2xl'],
          borderBottom: `1px solid ${colors.borderSubtle}`
        }}
      >
        <Container>
          <HudLabel tone="corona">Live product page</HudLabel>
          <h2 style={{ ...sectionTitleStyle, marginBottom: space.sm }}>
            Embedded from penpro.github.io/Aphelion
          </h2>
          <p
            style={{
              margin: `${space.sm} 0 ${space.lg}`,
              color: colors.textMuted,
              fontFamily: fonts.mono,
              fontSize: fontSizes.xs,
              maxWidth: '64ch'
            }}
          >
            The frame below is the canonical Aphelion landing page,
            served live from GitHub Pages. Updates to the product page
            appear here automatically — there is no duplicate copy of
            the marketing to keep in sync.
          </p>
          <div
            style={{
              border: `1px solid ${colors.border}`,
              borderRadius: radii.lg,
              overflow: 'hidden',
              background: colors.bg,
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4)'
            }}
          >
            <iframe
              src={PRODUCT_SITE}
              title="Aphelion product page (penpro.github.io/Aphelion)"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              style={{
                display: 'block',
                width: '100%',
                height: '3600px',
                border: 'none',
                background: '#07021A'
              }}
            />
          </div>
          <p
            style={{
              margin: `${space.md} 0 0`,
              color: colors.textMuted,
              fontSize: fontSizes.xs,
              fontFamily: fonts.mono
            }}
          >
            iframe blocked or rendering oddly?{' '}
            <a
              href={PRODUCT_SITE}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: colors.accent, textDecoration: 'none' }}
            >
              Open it directly at penpro.github.io/Aphelion ↗
            </a>
          </p>
        </Container>
      </section>

      {/* ============================ Brand family =========================== */}
      <section
        id="brand"
        style={{
          paddingTop: space['3xl'],
          paddingBottom: space['3xl'],
          background: colors.bgSoft,
          borderBottom: `1px solid ${colors.borderSubtle}`
        }}
      >
        <Container>
          <div style={{ maxWidth: '64ch' }}>
            <HudLabel tone="magenta">Brand family</HudLabel>
            <h2 style={sectionTitleStyle}>Same eclipse, different orbit.</h2>
            <p
              style={{
                marginTop: space.md,
                color: colors.textSecondary,
                fontSize: fontSizes.md,
                lineHeight: 1.7
              }}
            >
              Aphelion belongs to the same brand family as this
              consulting site, the streaming overlay, Penumbra
              Productions (Trigonometry Tools on Steam), and
              Penumbra.tech (Metaverse: Origins on Steam). The name
              is the pitch: <em>aphelion</em> is the orbital point
              farthest from the sun, and the product is the point
              farthest from the cloud. The visual language — corona
              teal, void purple-black, HUD brackets — is shared on
              purpose, so that anyone landing on any Penumbra surface
              sees the same operator behind it.
            </p>
          </div>
        </Container>
      </section>

      {/* =========================== Closing CTA ============================ */}
      <section
        id="cta"
        style={{
          paddingTop: space['3xl'],
          paddingBottom: space['3xl'],
          background: colors.surface,
          borderTop: `1px solid ${colors.border}`
        }}
      >
        <Container narrow style={{ textAlign: 'center' }}>
          <HudLabel tone="cyan">What&apos;s next</HudLabel>
          <h2
            style={{
              fontFamily: fonts.heading,
              fontSize: fontSizes['2xl'],
              fontWeight: fontWeights.bold,
              margin: `${space.md} 0 ${space.md}`,
              color: colors.text
            }}
          >
            Want a similar product built for your business?
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: fontSizes.md,
              color: colors.textSecondary,
              lineHeight: 1.6
            }}
          >
            Download Aphelion to see the bar I hold for shipped
            software, then book a 30-min intro to talk about a custom
            local-AI tool, a Tauri + Rust desktop app for your team,
            or any other engagement that uses the same engineering
            shape.
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

const sectionTitleStyle = {
  fontFamily: fonts.heading,
  fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
  fontWeight: fontWeights.bold,
  lineHeight: 1.15,
  letterSpacing: '-0.015em',
  margin: `${space.md} 0 0`,
  color: colors.text
};
