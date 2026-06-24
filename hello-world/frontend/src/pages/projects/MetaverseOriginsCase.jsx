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
import SectionRail from '../../components/SectionRail.jsx';

const SECTIONS = [
  { id: 'hero',         num: '00', label: 'Intro' },
  { id: 'status',       num: '01', label: 'What you’re buying' },
  { id: 'real-project', num: '02', label: 'The real project' },
  { id: 'toolset',      num: '03', label: 'The toolset' },
  { id: 'leverage',     num: '04', label: 'Leverage limit' },
  { id: 'cta',          num: '05', label: 'Book' }
];

const STEAM_URL = 'https://store.steampowered.com/app/1602810/Metaverse_Origins/';
const STEAM_HEADER =
  'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1602810/header.jpg?t=1640856855';

export default function MetaverseOriginsCase() {
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
        <Stars density={160} heroDensity={16} colorTint="mixed" />
        <CornerBrackets size={28} inset={24} />
        <Container style={{ position: 'relative', zIndex: 1 }}>
          <HudLabel tone="magenta">
            Case study: Published software · Steam Early Access
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
            Metaverse: Origins, sandbox survival built granular by design.
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
            Penumbra.tech studio name. Voxel terrain you can dig and
            build, a medical and metabolism simulation, AI companions
            on skill trees, save/load that has to survive years of
            schema changes — a studio-sized codebase being run on
            indie headcount. The interesting story isn&apos;t the game;
            it&apos;s the pipeline I built around it to make that
            possible.
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
      <div id="status">
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
      </div>

      {/* ====================== The real project ============================ */}
      <div id="real-project">
      <ChallengeSection
        background={colors.bgSoft}
        eyebrow="The real project isn&apos;t the game"
        tone="corona"
        title="A studio-sized codebase, run on an indie headcount."
      >
        <p>
          Origins is bigger than it looks from the store page. Voxel
          terrain you can dig and build, a medical and metabolism
          simulation, AI companions on skill trees, save/load that has
          to survive years of schema changes — that adds up to{' '}
          <strong style={{ color: colors.text }}>
            more than 150,000 lines across 500-plus files and fifteen
            interlocking subsystems
          </strong>
          . The honest problem for a solo developer isn&apos;t writing
          any one feature. It&apos;s that the infrastructure a studio
          takes for granted — a QA team, an automation engineer, a
          tools team, a release process — doesn&apos;t exist when
          there&apos;s one of you.
        </p>
        <p>
          So I built that part too. Not just the game&apos;s features —
          the apparatus around them. Over the last stretch I&apos;ve
          been using Claude Code less as an autocomplete and more as
          an engineering org I direct: a fleet of agents pointed at
          the work that normally needs headcount, wrapped in tooling I
          wrote myself to make their output trustworthy, not merely
          fast. The game is the visible artefact. The pipeline that
          builds it is the real one.
        </p>
      </ChallengeSection>
      </div>

      {/* ============================ The toolset ============================ */}
      <section
        id="toolset"
        style={{
          paddingTop: space['3xl'],
          paddingBottom: space['3xl'],
          borderBottom: `1px solid ${colors.borderSubtle}`
        }}
      >
        <Container>
          <div style={{ maxWidth: '64ch', marginBottom: space.xl }}>
            <HudLabel tone="cyan">The toolset</HudLabel>
            <h2 style={sectionTitleStyle}>
              What &ldquo;agents as engineering org&rdquo; actually looks like.
            </h2>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: space.lg
            }}
          >
            <ToolEntry title="An agent that drives the live engine.">
              <p>
                Most game bugs only exist at runtime — in the editor,
                with the game actually playing — so verifying a fix
                usually means a human booting the build and clicking
                through it. I built a file-driven bridge that lets an
                agent drive the running engine directly: boot a fresh
                save in about ten seconds, open and close menus, fire
                game events, read live state straight out of the
                simulation&apos;s components, and run multi-frame UI
                test sequences that report pass or fail. No human in
                the loop, no screenshots. It turns &ldquo;I think this
                fixes it&rdquo; into &ldquo;here&apos;s the green
                verification run,&rdquo; at one-person speed. That
                change-build-boot-verify-commit loop is precisely what
                a studio hires an automation engineer to own.
              </p>
            </ToolEntry>

            <ToolEntry title="A standing audit pipeline.">
              <p>
                Every so often I fan a fleet of agents across the
                entire codebase hunting the bugs that don&apos;t
                announce themselves: memory-safety crashes,
                use-after-frees, save/load data-loss holes, places
                where the server trusts a client it shouldn&apos;t.
                The catch with machine-found bugs is false positives —
                so nothing is trusted on the first pass. Each finding
                is handed to independent agents whose only job is to
                try to <em>refute</em> it, and only the survivors get
                filed, with a severity code and a test plan attached.
                The last full pass was{' '}
                <strong style={{ color: colors.text }}>
                  seventeen agents plus forty adversarial verifications
                  across 500-plus files
                </strong>
                ; it surfaced{' '}
                <strong style={{ color: colors.text }}>
                  nine critical and forty-eight high-severity defects
                </strong>
                . A studio calls that QA plus a security review plus a
                tools team. Here it&apos;s a repeatable afternoon —
                and every critical it found has since been fixed and
                verified through the harness above.
              </p>
            </ToolEntry>

            <ToolEntry title="The unglamorous tooling underneath.">
              <p>
                The same instinct shows up in the boring places. Game
                data — a couple of hundred items, recipes, skill
                curves — lives in spreadsheet-shaped tables that are
                miserable to hand-edit safely, so I built a
                SQLite-backed utility that queries, transforms,
                validates and round-trips them with schema migration
                and drift detection. Project knowledge — engineering
                standards, architecture decisions, the running list of
                known defects — lives in a structured memory the
                agents read every session, so the reasoning behind a
                decision survives across months and the work stays
                coherent instead of drifting. None of it is glamorous.
                All of it is the difference between a project that
                compounds and one that rots.
              </p>
            </ToolEntry>
          </div>
        </Container>
      </section>

      {/* ======================= Where the leverage ends ====================== */}
      <div id="leverage">
      <ChallengeSection
        background={colors.bgSoft}
        eyebrow="Where the leverage ends"
        tone="magenta"
        title="Tools make you fast. Judgement is still the job."
      >
        <p>
          It&apos;s worth being precise about where the automation
          stops, because that line is the whole point. The agents
          don&apos;t decide anything. Architecture, scope, the call on
          whether a reported bug is even real, the gate where nothing
          gets committed until it builds and verifies — that&apos;s
          mine, and it has to be.
        </p>
        <p>
          The clearest example from recent work: one audit finding was
          a key-rebinding bug I could have &ldquo;fixed&rdquo; in five
          minutes, and I deliberately didn&apos;t. The only honest way
          to verify a rebinding change is to exercise the live input
          system; my test harness can&apos;t reach that path; and
          shipping an unverified change to something that could break
          all input is exactly the AI-assisted carelessness that earns
          the skepticism. So it&apos;s flagged and deferred to a
          session where it can be done properly. Anyone can prompt a
          model into producing code.{' '}
          <strong style={{ color: colors.text }}>
            The discipline worth paying for is knowing which output
            you&apos;re not yet allowed to trust — and building the
            verification that decides.
          </strong>
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
          <HudLabel tone="corona">Hire the pipeline, not just the prompts</HudLabel>
          <h2
            style={{
              fontFamily: fonts.heading,
              fontSize: fontSizes['2xl'],
              fontWeight: fontWeights.bold,
              margin: `${space.md} 0 ${space.md}`,
              color: colors.text
            }}
          >
            Same instincts on your codebase.
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: fontSizes.md,
              color: colors.textSecondary,
              lineHeight: 1.6
            }}
          >
            If your team is interested in agent-assisted development
            but wary — for good reason — about the carelessness it
            can produce, this is the engagement to ask about. The
            harness, the audit pipeline, the verification discipline
            all generalise; they aren&apos;t game-specific. The Steam
            page is the canonical source of truth for the game&apos;s
            current state — roadmap, patch notes, reviews — and a
            useful reference for how long this project has actually
            been live in public.
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

function ToolEntry({ title, children }) {
  return (
    <Card variant="accent" padding={space.lg}>
      <h3
        style={{
          fontFamily: fonts.heading,
          fontSize: fontSizes.lg,
          fontWeight: fontWeights.semibold,
          color: colors.text,
          margin: 0,
          marginBottom: space.sm,
          letterSpacing: '-0.005em'
        }}
      >
        {title}
      </h3>
      <div
        style={{
          color: colors.textSecondary,
          fontSize: fontSizes.md,
          lineHeight: 1.7
        }}
      >
        {children}
      </div>
    </Card>
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
