// Penumbra Music Visualizer — open-source case study.
//
// A single-file in-browser music visualizer. The "no cookies, no
// install, no wifi" framing is the actual reason this project exists
// — Wesley wanted something he could double-click on a laptop at a
// party and not worry about a dropped internet connection or some
// cloud auth flow ruining the moment. Everything runs locally,
// including the BPM and key analysis.
//
// Case study positions it as: same Penumbra-brand aesthetic as the
// streaming overlay and this site (corona teal, eclipse motifs, the
// JetBrains-Rider HUD chrome), but a meaningfully different problem
// shape — real-time audio DSP in Canvas 2D with zero build pipeline.

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
  { id: 'hero',         num: '00', label: 'Intro' },
  { id: 'why',          num: '01', label: 'Why' },
  { id: 'what',         num: '02', label: 'What it does' },
  { id: 'shots',        num: '03', label: 'Visuals' },
  { id: 'engineering',  num: '04', label: 'How it works' },
  { id: 'cta',          num: '05', label: 'Book a Call' }
];

const REPO_URL = 'https://github.com/penpro/MusicVisualizer';
const RAW_URL = 'https://raw.githubusercontent.com/penpro/MusicVisualizer/main';
const DEMO_VIDEO_URL = 'https://youtu.be/qXSvnXlZAhg';
const DEMO_THUMB = 'https://img.youtube.com/vi/qXSvnXlZAhg/maxresdefault.jpg';

const SCREENSHOTS = [
  { src: `${RAW_URL}/docs/01-triangular-peaks.png`, label: 'Triangular Peaks — a 3D perspective lattice of equilateral triangles, spectrum radiating from the center' },
  { src: `${RAW_URL}/docs/02-eclipse-core.png`,     label: 'Eclipse Core — corona ring with the spectrum drawn as corona spikes' },
  { src: `${RAW_URL}/docs/03-aurora.png`,           label: 'Aurora Flow — curtain-shaped low-frequency response with hue-cycling' },
  { src: `${RAW_URL}/docs/04-code-rain.png`,        label: 'Code Rain — Matrix-style C++/hex glyphs whose fall speed tracks the music' },
  { src: `${RAW_URL}/docs/05-radial-spectrum.png`,  label: 'Radial Spectrum — frequency bins drawn as bars sweeping out from the center' },
  { src: `${RAW_URL}/docs/06-particle-burst.png`,   label: 'Particle Burst — onset-driven particle field; transients spawn new emitters' }
];

export default function MusicVisualizerCase() {
  useDocumentMeta({
    title: 'Penumbra Music Visualizer — offline-first single-file app | Penumbra Tech',
    description:
      "Single-file in-browser music visualizer. No install, no cookies, no wifi — drag an mp3 onto the page and 9 reactive visualizers (Triangular Peaks, Eclipse Core, Code Rain, more) light up. Includes from-scratch BPM and musical-key detection, all running in Web Audio + Canvas 2D with zero dependencies.",
    canonical: 'https://penumbra-tech.com/projects/music-visualizer'
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
            Case study: Open source · Single-file web app
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
            A music visualizer that survives bad wifi.
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
            I wanted a music visualizer I could load up at a party and
            not have it ruined by the internet dropping in the middle
            of a set. No install, no signup, no cookies, no wifi
            dependency. The whole thing is one <code style={inlineCodeStyle}>index.html</code>
            {' '}file (~52KB) you save to your desktop, double-click,
            and drag a song onto. It analyses the audio locally and
            reacts in real time — nine custom visualizers, on-brand
            with the rest of Penumbra Tech (corona teal, eclipse
            motifs, debug-HUD chrome).
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
              'Single file',
              'No build',
              'No dependencies',
              'Offline',
              'Web Audio API',
              'Canvas 2D',
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
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              size="lg"
            >
              View on GitHub ↗
            </Button>
            <Button
              as="a"
              href={DEMO_VIDEO_URL}
              target="_blank"
              rel="noopener noreferrer"
              variant="secondary"
              size="lg"
            >
              Watch the demo ▶
            </Button>
          </div>
        </Container>
      </section>

      {/* =========================== Demo thumbnail =========================== */}
      <DemoEmbed src={DEMO_THUMB} href={DEMO_VIDEO_URL} />

      {/* =============================== Why ================================ */}
      <div id="why">
      <ChallengeSection
        eyebrow="Why this exists"
        tone="cyan"
        title="The constraint was the design."
      >
        <p>
          Most music visualizers fall into one of two buckets. Either
          they&apos;re heavyweight desktop apps (MilkDrop,{' '}
          <code style={inlineCodeStyle}>projectM</code>, the various
          Spotify add-ons) that take a real install and break on the
          machine you didn&apos;t plan for — or they&apos;re web apps
          that need an account, a cloud service, an active connection
          to a streaming API, and a browser permission dance every
          time. Both fail the &ldquo;5pm at the cabin with spotty wifi
          and a Bluetooth speaker&rdquo; test.
        </p>
        <p>
          The constraint here was strict: <strong style={{ color: colors.text }}>everything has to work from a
          flash drive on an airplane.</strong>{' '}
          That ruled out frameworks (build pipelines), CDN
          dependencies (need network), telemetry (need network), and
          accounts (privacy hostility for no gain). What&apos;s left
          is the most boring possible architecture, which turned out
          to be the right one: one HTML file with inline CSS and JS,
          Web Audio for analysis, Canvas 2D for rendering. You can
          read every line of it.
        </p>
      </ChallengeSection>
      </div>

      {/* ============================== What ================================ */}
      <div id="what">
      <ChallengeSection
        background={colors.bgSoft}
        eyebrow="What it actually does"
        tone="corona"
        title="Nine visualizers, real audio analysis, and a way to record the result."
      >
        <p>
          Drag an <code style={inlineCodeStyle}>.mp3</code> onto the
          page and it starts playing + visualizing immediately. The
          control bar hides while it plays and reappears on mouse
          movement, so you can leave it running on a TV at a party
          without the chrome distracting from the visual. Nine
          visualizers ship in the box, switchable via dropdown or
          shuffled automatically by an Auto / Random mode that mixes
          settings on a timer.
        </p>
        <p>
          The three Penumbra-branded modes (Triangular Peaks, Eclipse
          Core, Code Rain) match the streaming overlay and this site —
          same corona teal, same eclipse silhouette, same debug-HUD
          chrome with a live <code style={inlineCodeStyle}>void
          MEDIA::Playing(&quot;track&quot;)</code> readout, BASS/LVL
          meters, and a scrolling beat timeline. The other six
          (Aurora, Code Rain, Mirror Bars, Pulse Rings, Tunnel Grid,
          Particle Burst, Waveform) are more conventional spectrum
          treatments.
        </p>
        <p>
          Extra-credit features that mattered for the actual party-use
          case: a microphone / tab-audio capture path so it can
          visualize YouTube Music or Spotify in another tab, a
          built-in canvas+audio recorder that exports a{' '}
          <code style={inlineCodeStyle}>.webm</code> you can post to
          YouTube, and a playlist queue with drag-and-drop and
          auto-advance.
        </p>
      </ChallengeSection>
      </div>

      {/* ============================ Screenshots ============================ */}
      <section
        id="shots"
        style={{
          paddingTop: space['2xl'],
          paddingBottom: space['2xl'],
          borderBottom: `1px solid ${colors.borderSubtle}`
        }}
      >
        <Container>
          <div style={{ maxWidth: '64ch', marginBottom: space.lg }}>
            <HudLabel tone="magenta">Visualizer modes</HudLabel>
            <h2 style={sectionTitleStyle}>Six of the nine.</h2>
            <p
              style={{
                marginTop: space.md,
                color: colors.textSecondary,
                fontSize: fontSizes.md,
                lineHeight: 1.7
              }}
            >
              Stills don&apos;t do them justice — the visualizers are
              live reactive — but they show the shape and palette of
              each. Full video demo is on{' '}
              <a
                href={DEMO_VIDEO_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: colors.accent, textDecoration: 'none' }}
              >
                YouTube
              </a>.
            </p>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: space.lg
            }}
          >
            {SCREENSHOTS.map((shot) => (
              <Card key={shot.src} padding={0} style={{ overflow: 'hidden' }}>
                <img
                  src={shot.src}
                  alt={shot.label}
                  loading="lazy"
                  style={{
                    display: 'block',
                    width: '100%',
                    height: 'auto',
                    background: colors.bg,
                    borderBottom: `1px solid ${colors.borderSubtle}`
                  }}
                />
                <div
                  style={{
                    padding: space.md,
                    fontSize: fontSizes.sm,
                    color: colors.textSecondary,
                    lineHeight: 1.5
                  }}
                >
                  {shot.label}
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* =========================== How it works ============================ */}
      <div id="engineering">
      <ChallengeSection
        eyebrow="How it works"
        tone="cyan"
        title="The interesting bits are all in the audio analysis."
      >
        <p>
          The rendering is honest Canvas 2D — an offscreen FX layer
          composited with{' '}
          <code style={inlineCodeStyle}>lighten</code> /{' '}
          <code style={inlineCodeStyle}>screen</code> blend modes for
          the neon glow, no WebGL, no shaders. The work is in the
          audio path:
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
            <strong style={{ color: colors.text }}>
              Web Audio routing
            </strong>{' '}
            — a single{' '}
            <code style={inlineCodeStyle}>AnalyserNode</code> sits
            inline between whichever source is live ({' '}
            <code style={inlineCodeStyle}>MediaElementSource</code> for
            local files, <code style={inlineCodeStyle}>MediaStreamSource</code>
            {' '}for tab-audio capture) and the destination. Every
            visualizer pulls frequency or waveform data from that
            single node per frame.
          </li>
          <li style={{ marginTop: space.sm }}>
            <strong style={{ color: colors.text }}>BPM detection</strong>{' '}
            on file load: an in-file FFT computes an onset envelope
            from the full track, then autocorrelates it across the
            60-200 BPM range. The peak lag determines tempo. Result is
            cached in <code style={inlineCodeStyle}>localStorage</code>{' '}
            keyed on file hash, so each song is analyzed once.
          </li>
          <li style={{ marginTop: space.sm }}>
            <strong style={{ color: colors.text }}>
              Musical key detection
            </strong>{' '}
            via Krumhansl-Schmuckler: bin the whole track&apos;s
            energy into 12-bin chroma vectors, then correlate against
            the 24 standard major/minor key profiles. The best-fit
            profile is the song&apos;s key. Same{' '}
            <code style={inlineCodeStyle}>localStorage</code> cache.
          </li>
          <li style={{ marginTop: space.sm }}>
            <strong style={{ color: colors.text }}>
              Recording path
            </strong>{' '}
            — the canvas{' '}
            <code style={inlineCodeStyle}>captureStream()</code> is
            merged with the audio destination via a{' '}
            <code style={inlineCodeStyle}>MediaStreamDestination</code>
            {' '}and fed to a{' '}
            <code style={inlineCodeStyle}>MediaRecorder</code>. Stop
            recording, get a{' '}
            <code style={inlineCodeStyle}>.webm</code> with both
            tracks already in sync.
          </li>
        </ul>
        <p style={{ marginTop: space.lg }}>
          What&apos;s deliberately NOT here: no library, no npm, no
          build step, no minification, no telemetry, no analytics
          beacon, no font CDN call. The HTML file is the whole
          deliverable.
        </p>
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
          <HudLabel tone="cyan">Take it for a spin</HudLabel>
          <h2
            style={{
              fontFamily: fonts.heading,
              fontSize: fontSizes['2xl'],
              fontWeight: fontWeights.bold,
              margin: `${space.md} 0 ${space.md}`,
              color: colors.text
            }}
          >
            One file. Drag an mp3 onto it. Done.
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: fontSizes.md,
              color: colors.textSecondary,
              lineHeight: 1.6
            }}
          >
            Free, open source, MIT-licensed. If you want a similar
            zero-install browser tool built for your own brand or use
            case — single file, no backend, runs from a USB stick —
            that&apos;s a real shape of engagement; book a call below.
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
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              size="lg"
            >
              View on GitHub ↗
            </Button>
            <Button as={Link} to="/contact" variant="secondary" size="lg">
              Book a 30-min intro →
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

function DemoEmbed({ src, href }) {
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
              alt="Penumbra Music Visualizer — demo video thumbnail (click to watch on YouTube)"
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
              ▶ Watch the full demo on YouTube ({DEMO_VIDEO_URL})
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
