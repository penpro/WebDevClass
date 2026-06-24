// Trigonometry Tools — Steam-released case study.
//
// Published April 2025 under the Penumbra Productions name (one of the
// operator-history entities listed in the About proof strip). Free,
// tagged Education / Strategy / Utilities. The case study positions it
// as "shipped software, not a side-project demo" — the bar for the
// Steam release process is much higher than for a self-hosted web app,
// and that's the credibility signal worth keeping in front of clients.

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

const SECTIONS = [
  { id: 'hero',        num: '00', label: 'Intro' },
  { id: 'why',         num: '01', label: 'Why it matters' },
  { id: 'design',      num: '02', label: 'Design idea' },
  { id: 'engineering', num: '03', label: 'Engineering note' },
  { id: 'cta',         num: '04', label: 'Book' }
];

const STEAM_URL = 'https://store.steampowered.com/app/3622460/Trigonometry_Tools/';
const STEAM_HEADER =
  'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/3622460/4e15e9aa9551fb437a109ce99ca4c5951a89b4be/header.jpg?t=1744404808';

export default function TrigonometryToolsCase() {
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
        <Stars density={120} heroDensity={12} colorTint="mixed" />
        <CornerBrackets size={28} inset={24} />
        <Container style={{ position: 'relative', zIndex: 1 }}>
          <HudLabel tone="corona">
            Case study: Published software · Steam
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
            Trigonometry Tools: a gamified unit-circle trainer.
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
            A free educational title published to Steam in April 2025
            under the Penumbra Productions name. The pitch is direct:
            precalculus students need a reflexive grip on the unit
            circle — angles, radians, sine and cosine at the standard
            positions — and the usual way they get there is by grinding
            flashcards until something sticks. Trigonometry Tools turns
            that grind into a game loop you can run for ten minutes a
            day on a Steam-installed PC.
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
              'Steam · April 2025',
              'Free',
              'Education',
              'Utilities',
              'Windows 10+',
              'Penumbra Productions'
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
              href={STEAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              size="lg"
            >
              View on Steam ↗
            </Button>
            <Button as={Link} to="/contact" variant="secondary" size="lg">
              Discuss a similar build
            </Button>
          </div>
        </Container>
      </section>

      {/* ========================== Steam header ========================== */}
      <SteamHeader src={STEAM_HEADER} alt="Trigonometry Tools — Steam header image" />

      {/* ===================== Why this is on the portfolio =================== */}
      <div id="why">
      <ChallengeSection
        eyebrow="Why it matters"
        tone="cyan"
        title="Shipped software, not a side-project demo."
      >
        <p>
          The bar between &ldquo;I built a thing&rdquo; and &ldquo;I
          shipped a thing&rdquo; is real. Shipping to Steam means
          assembling a Steamworks application, passing review,
          producing a real store presence (capsules, screenshots,
          descriptions, trailer), wiring up a release branch with
          actual downloadable builds, and accepting that other people
          will install it and find what you missed. That&apos;s a
          different exercise from putting something on a personal
          website.
        </p>
        <p>
          Trigonometry Tools is small on purpose — it does one
          educational job and does it well — but it went through the
          full Steam release process. It&apos;s a free download, in
          the Education category, and anyone with a Steam account can
          install it right now.
        </p>
      </ChallengeSection>
      </div>

      {/* =========================== Design notes ============================ */}
      <div id="design">
      <ChallengeSection
        background={colors.bgSoft}
        eyebrow="The design idea"
        tone="corona"
        title="The unit circle is the perfect candidate for gamification."
      >
        <p>
          Precalculus students hit a wall at the unit circle because
          there&apos;s no clever insight that makes the answer
          obvious; the cosine of 5π/6 is{' '}
          <code style={inlineCodeStyle}>−√3/2</code> because that&apos;s
          where the radius lands, full stop. The only path to
          fluency is repetition until the standard angles, their
          equivalents in radians, and their sine and cosine values are
          available instantly. That kind of memorisation responds well
          to a spaced-repetition / reaction-time game loop: present a
          prompt, accept an answer, escalate difficulty, reward speed.
        </p>
        <p>
          The game ships that loop in a way that respects the learner&apos;s
          time. It doesn&apos;t pretend to teach the concept from
          first principles — that&apos;s the textbook&apos;s job — and it
          doesn&apos;t pad the run with cosmetic progression for its
          own sake. It does the one thing the textbook can&apos;t: drill
          the reflex until the values are cached.
        </p>
      </ChallengeSection>
      </div>

      {/* ========================= Engineering note ========================== */}
      <div id="engineering">
      <ChallengeSection
        eyebrow="Engineering note"
        tone="magenta"
        title="Small games are still real software."
      >
        <p>
          From the outside, &ldquo;a unit-circle trainer&rdquo; sounds
          like an afternoon. From the inside, even a small Steam title
          requires: a build pipeline that produces a distributable
          Windows executable, input handling that doesn&apos;t feel
          janky on a laptop trackpad or a desktop with a controller,
          per-session state for streaks and progression, store-page
          marketing copy that survives Steam&apos;s review, and a
          deployment process that lets you push a fix without
          breaking installed copies. Those are all the same
          engineering muscles a contract client needs from a
          production system; the game is just where I exercised them
          on something I owned end-to-end.
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
          <HudLabel tone="cyan">Try it</HudLabel>
          <h2
            style={{
              fontFamily: fonts.heading,
              fontSize: fontSizes['2xl'],
              fontWeight: fontWeights.bold,
              margin: `${space.md} 0 ${space.md}`,
              color: colors.text
            }}
          >
            It&apos;s free and it&apos;s on Steam right now.
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: fontSizes.md,
              color: colors.textSecondary,
              lineHeight: 1.6
            }}
          >
            If you&apos;ve got a precalculus student in the house, or
            you&apos;re prepping a trig refresher yourself, install it
            and run a few sessions. The case study&apos;s value to
            this site isn&apos;t the game&apos;s mechanics — it&apos;s
            the proof that I take software from idea to public
            release, not just to demo.
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
              href={STEAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              size="lg"
            >
              View on Steam ↗
            </Button>
            <Button as={Link} to="/projects" variant="secondary" size="lg">
              See other projects
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

function SteamHeader({ src, alt }) {
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
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'block', textDecoration: 'none' }}
        >
          <Card padding={0} interactive style={{ overflow: 'hidden' }}>
            <img
              src={src}
              alt={alt}
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
              Steam store header — image served from Valve&apos;s CDN
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
