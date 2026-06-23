// Metaverse: Origins — Steam Early Access case study.
//
// Published May 2021 under the Penumbra.tech studio name (same brand
// as the consulting practice — these aren't separate identities). The
// game is in pre-alpha and the case study is honest about that: the
// portfolio value is "I've been doing this since 2021, in public, on
// Steam, with paying customers," not "buy it for the gameplay today."

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

const STEAM_URL = 'https://store.steampowered.com/app/1602810/Metaverse_Origins/';
const STEAM_HEADER =
  'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1602810/header.jpg?t=1640856855';

export default function MetaverseOriginsCase() {
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
        <Stars density={160} heroDensity={16} colorTint="mixed" />
        <CornerBrackets size={28} inset={24} />
        <Container style={{ position: 'relative', zIndex: 1 }}>
          <HudLabel tone="magenta">
            Case study — Published software · Steam Early Access
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
            Metaverse: Origins — sandbox survival, granular by design.
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
            An open-world sandbox survival game in pre-alpha early
            access on Steam since May 2021, published under the
            Penumbra.tech studio name. The premise is the unglamorous
            part of the survival genre done with real depth: detailed
            resource gathering and crafting, multiple AI companion
            characters trained across skill trees, and cooperative
            play where the goal is civilisation growth rather than
            grinding the same node ten thousand times.
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
              'Steam Early Access · 2021',
              'Pre-alpha',
              '$9.99',
              'Sandbox · Survival',
              'Multiplayer',
              'Windows 10 64-bit',
              'Penumbra.tech'
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
      <SteamHeader src={STEAM_HEADER} alt="Metaverse: Origins — Steam header image" />

      {/* =========================== Honest status =========================== */}
      <ChallengeSection
        eyebrow="What you're buying"
        tone="cyan"
        title="It says pre-alpha for a reason."
      >
        <p>
          Metaverse: Origins is on Steam, but it&apos;s on Steam in{' '}
          <em>early access pre-alpha</em>. Functionality is limited,
          systems are partial, and the bigger pieces of the design —
          the multi-character AI skill trees, the cooperative
          civilisation loop, the multiplayer hosting — are in active
          development, not finished features.
        </p>
        <p>
          That&apos;s exactly the right way to read it for the
          portfolio: this isn&apos;t a shippable retail title; it&apos;s
          a long-arc Steam project where the store presence, the
          public roadmap, and the customer relationship have been live
          since 2021. If you want to know what it looks like when I
          ship a game-shaped commercial product through Steam, this is
          the longer of the two examples on this site (Trigonometry
          Tools is the shorter one, fully released).
        </p>
      </ChallengeSection>

      {/* =========================== Design idea ============================= */}
      <ChallengeSection
        background={colors.bgSoft}
        eyebrow="The design idea"
        tone="corona"
        title="Granular, not grindy."
      >
        <p>
          Most sandbox survival games shortcut to the same loop: chop
          tree, mine rock, build wall, repeat for hours, watch the
          progress bar climb. The design pitch behind Origins is the
          opposite — keep the granularity of resource gathering and
          crafting (real materials, real workflow, real time) but
          remove the player&apos;s obligation to be the one mining
          every rock by hand.
        </p>
        <p>
          The mechanism is multiple controllable AI characters, each
          trained across skill trees. The player&apos;s job becomes
          assigning the right AI to the right task — the woodcutter
          who&apos;s actually leveled in axe work, the builder who
          knows the schematics — and watching a small civilisation
          take shape. Cooperative multiplayer extends that model:
          multiple human players coordinating multiple AI agents
          across a shared world.
        </p>
        <p>
          It&apos;s a hard design to land — easy to describe, hard to
          balance — which is why the development arc has been long and
          the early-access framing is honest about it.
        </p>
      </ChallengeSection>

      {/* ===================== What the work demonstrates ===================== */}
      <ChallengeSection
        eyebrow="What this demonstrates for the consulting work"
        tone="magenta"
        title="Long-arc projects, in public."
      >
        <p>
          A four-plus-year project on a public storefront with paying
          customers is a different artefact from a side-project repo.
          You don&apos;t get to pretend the rough patches didn&apos;t
          happen; you have to keep the build pipeline working, the
          store page coherent, the patch notes honest, and the
          development direction recognisable across years of changes.
          That&apos;s the kind of stewardship the better contracts
          want — engineers who can carry a system past its honeymoon
          phase and through the long part.
        </p>
        <p>
          The same instincts apply outside games: keep the
          architecture explainable, ship incrementally without
          breaking installed copies, communicate scope honestly,
          accept that the &ldquo;final&rdquo; version is always two
          patches away. Origins is where I&apos;ve been practicing
          those muscles since 2021.
        </p>
      </ChallengeSection>

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
          <HudLabel tone="corona">Long-arc work</HudLabel>
          <h2
            style={{
              fontFamily: fonts.heading,
              fontSize: fontSizes['2xl'],
              fontWeight: fontWeights.bold,
              margin: `${space.md} 0 ${space.md}`,
              color: colors.text
            }}
          >
            See the store page, read the early-access framing.
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: fontSizes.md,
              color: colors.textSecondary,
              lineHeight: 1.6
            }}
          >
            The Steam page is the canonical source of truth for the
            current state: roadmap, patch notes, reviews, screenshots.
            Read it the way you&apos;d read a consulting reference —
            what&apos;s been live, for how long, and how the
            communication around it has held up.
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
