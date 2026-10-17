// Metaverse: Origins, the game page (not the engineering case study).
//
// This is the player-facing page for the actual game: what it is, what you
// do, the art, and where to play it. The how-it's-built story lives at
// /projects/metaverse-origins and the two cross-link. Steam app 1602810.
// Copy in Wes's voice per D:\Substack\de-ai-methods.md: plain, honest,
// specific, zero em-dashes, no marketing hype.

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
  { id: 'hero',      num: '00', label: 'Intro' },
  { id: 'about',     num: '01', label: 'What it is' },
  { id: 'features',  num: '02', label: 'What you do' },
  { id: 'gallery',   num: '03', label: 'Screens' },
  { id: 'honest',    num: '04', label: 'Early Access' },
  { id: 'play',      num: '05', label: 'Play it' }
];

const STEAM_URL = 'https://store.steampowered.com/app/1602810/';
const CASE_STUDY = '/projects/metaverse-origins';

const FEATURES = [
  {
    title: 'Build',
    body:
      'Place a building as a ghost, haul materials to it, and watch it go up stage by stage. Change your mind and cancel, and you get the materials back.'
  },
  {
    title: 'Craft and progress',
    body:
      'Recipes, a crafting queue, and work stations. Tool gates and craft times, plus skills and knowledge that decide what you can make yet.'
  },
  {
    title: 'Dig the caves',
    body:
      'Procedural caves with real bedrock and ore bodies underneath. Dig time depends on the rock, and what you pull out depends on how deep you went for it.'
  },
  {
    title: 'Run a colony',
    body:
      'Recruit survivor pawns, hand them jobs, and keep a small settlement fed and running. Predators and prey share the map and act on their own.'
  },
  {
    title: 'Play solo or co-op',
    body:
      'Host or join over Steam or LAN. Every machine builds the same terrain from one shared seed, so everyone is standing in the same world.'
  }
];

const SHOTS = [
  {
    src: '/metaverse/metaverse-keyart.jpg',
    caption: 'Alpine-heath ridge at golden hour. The terrain is generated, not hand-placed.'
  },
  {
    src: '/metaverse/metaverse-landscape.jpg',
    caption: 'Open country rolling out to the mountains. Weather and a day/night clock run over all of it.'
  },
  {
    src: '/metaverse/metaverse-vertical.jpg',
    caption: 'Backlit treeline. All screenshots are in-engine, from the game itself.'
  }
];

export default function MetaverseGame() {
  useDocumentMeta({
    title: 'Metaverse: Origins, a survival colony sandbox on Steam | Penumbra Tech',
    description:
      'Metaverse: Origins is a survival colony sandbox on Steam (app 1602810). Build, craft, dig caves, and keep a handful of survivors alive, solo or in Steam/LAN co-op. Early Access, pre-alpha, built by one engineer.',
    canonical: 'https://penumbra-tech.com/metaverse'
  });
  return (
    <>
      <SectionRail sections={SECTIONS} />

      {/* ============================== Hero ============================== */}
      <section
        id="hero"
        style={{
          position: 'relative',
          overflow: 'hidden',
          minHeight: '82vh',
          display: 'flex',
          alignItems: 'flex-end',
          borderBottom: `1px solid ${colors.borderSubtle}`
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'url(/metaverse/metaverse-hero.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: 0
          }}
        />
        {/* Dark gradient so the text stays readable over the art. */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(to top, ${colors.bg} 2%, rgba(7,2,26,0.72) 38%, rgba(7,2,26,0.32) 70%, rgba(7,2,26,0.45) 100%)`,
            zIndex: 1
          }}
        />
        <CornerBrackets size={36} inset={32} />
        <Container
          style={{
            position: 'relative',
            zIndex: 2,
            paddingTop: space['3xl'],
            paddingBottom: space['2xl']
          }}
        >
          <HudLabel tone="cyan" live>
            Steam Early Access · pre-alpha
          </HudLabel>
          <h1
            style={{
              fontFamily: fonts.heading,
              fontSize: 'clamp(2.5rem, 6vw, 5rem)',
              fontWeight: fontWeights.bold,
              lineHeight: 1.02,
              letterSpacing: '-0.02em',
              margin: `${space.md} 0 0`,
              color: colors.text,
              textShadow: '0 2px 24px rgba(0,0,0,0.7)'
            }}
          >
            Metaverse: Origins
          </h1>
          <p
            style={{
              margin: `${space.md} 0 0`,
              maxWidth: '54ch',
              fontSize: fontSizes.lg,
              lineHeight: 1.55,
              color: colors.text,
              textShadow: '0 1px 12px rgba(0,0,0,0.8)'
            }}
          >
            A survival colony sandbox. Land on generated terrain with nothing,
            then build, dig, craft, and keep a handful of survivors alive.
            Solo, or with friends over Steam and LAN.
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
              href={STEAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              size="lg"
            >
              Play on Steam ↗
            </Button>
            <Button as={Link} to={CASE_STUDY} variant="secondary" size="lg">
              How it's built
            </Button>
          </div>
        </Container>
      </section>

      {/* ============================== What it is ============================== */}
      <section
        id="about"
        style={{
          paddingTop: space['3xl'],
          paddingBottom: space['3xl'],
          borderBottom: `1px solid ${colors.borderSubtle}`,
          background: colors.surface
        }}
      >
        <Container narrow>
          <HudLabel tone="corona">What it is</HudLabel>
          <p
            style={{
              margin: `${space.lg} 0 0`,
              fontFamily: fonts.heading,
              fontSize: fontSizes.xl,
              lineHeight: 1.4,
              color: colors.text,
              letterSpacing: '-0.01em'
            }}
          >
            You start with nothing and build up from there.
          </p>
          <p
            style={{
              margin: `${space.lg} 0 0`,
              fontSize: fontSizes.md,
              color: colors.textSecondary,
              lineHeight: 1.75
            }}
          >
            Chop and mine for materials, craft tools and stations, dig into the
            caves for ore, and recruit survivors who work jobs and keep a small
            settlement going. There are predators and prey out in the world, a
            day/night clock, and real weather moving over generated terrain.
            Play it alone or host a game so friends can join and share the same
            map. It has been in Steam Early Access since 2021, it is still a
            pre-alpha, and one engineer builds it. That last part matters, so
            there is an honest section about it below.
          </p>
        </Container>
      </section>

      {/* ============================== Features ============================== */}
      <section
        id="features"
        style={{
          paddingTop: space['3xl'],
          paddingBottom: space['3xl'],
          borderBottom: `1px solid ${colors.borderSubtle}`
        }}
      >
        <Container>
          <HudLabel tone="cyan">What you do</HudLabel>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: space.lg,
              marginTop: space['2xl']
            }}
          >
            {FEATURES.map((f) => (
              <Card key={f.title} variant="accent" padding={space.lg}>
                <h3
                  style={{
                    margin: 0,
                    marginBottom: space.sm,
                    fontFamily: fonts.heading,
                    fontSize: fontSizes.lg,
                    fontWeight: fontWeights.semibold,
                    color: colors.text
                  }}
                >
                  {f.title}
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: fontSizes.sm,
                    lineHeight: 1.65,
                    color: colors.textSecondary
                  }}
                >
                  {f.body}
                </p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* ============================== Gallery ============================== */}
      <section
        id="gallery"
        style={{
          paddingTop: space['3xl'],
          paddingBottom: space['3xl'],
          borderBottom: `1px solid ${colors.borderSubtle}`,
          background: colors.surface
        }}
      >
        <Container>
          <HudLabel tone="magenta">Screens</HudLabel>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: space.lg,
              marginTop: space['2xl']
            }}
          >
            {SHOTS.map((shot) => (
              <a
                key={shot.src}
                href={shot.src}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}
              >
                <Card padding={0} interactive style={{ overflow: 'hidden' }}>
                  <img
                    src={shot.src}
                    alt={shot.caption}
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
                      borderTop: `1px solid ${colors.borderSubtle}`
                    }}
                  >
                    {shot.caption}
                  </div>
                </Card>
              </a>
            ))}
          </div>
        </Container>
      </section>

      {/* ============================== Early Access honesty ============================== */}
      <section
        id="honest"
        style={{
          paddingTop: space['3xl'],
          paddingBottom: space['3xl'],
          borderBottom: `1px solid ${colors.borderSubtle}`
        }}
      >
        <Container narrow>
          <HudLabel tone="corona">The honest part</HudLabel>
          <h2
            style={{
              fontFamily: fonts.heading,
              fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
              fontWeight: fontWeights.bold,
              lineHeight: 1.15,
              letterSpacing: '-0.015em',
              margin: `${space.md} 0 0`,
              color: colors.text
            }}
          >
            It says pre-alpha for a reason.
          </h2>
          <p
            style={{
              margin: `${space.md} 0 0`,
              fontSize: fontSizes.md,
              color: colors.textSecondary,
              lineHeight: 1.75
            }}
          >
            This is paid Early Access and it is genuinely pre-alpha. One person
            builds it, so there are bugs, rough edges, and whole systems still
            landing. Buy it if the idea excites you and you want to watch it
            grow, not if you want a finished game today. I would rather you
            know that up front than feel sold to.
          </p>
          <p
            style={{
              margin: `${space.md} 0 0`,
              fontSize: fontSizes.md,
              color: colors.textSecondary,
              lineHeight: 1.75
            }}
          >
            The other reason it is on this site: how it gets made is as
            interesting as what it is. It is a studio-sized codebase run on an
            indie headcount, held together by an agent-driven test and audit
            pipeline that does the work a QA team usually does. If that is the
            part you care about, the engineering write-up goes deep.
          </p>
          <div style={{ marginTop: space.lg }}>
            <Button as={Link} to={CASE_STUDY} variant="secondary">
              Read the engineering write-up →
            </Button>
          </div>
        </Container>
      </section>

      {/* ============================== Play CTA ============================== */}
      <section
        id="play"
        style={{
          paddingTop: space['3xl'],
          paddingBottom: space['3xl'],
          background: colors.surface,
          borderTop: `1px solid ${colors.border}`,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Stars density={80} heroDensity={8} colorTint="mixed" />
        <Container narrow style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <h2
            style={{
              fontFamily: fonts.heading,
              fontSize: fontSizes['2xl'],
              fontWeight: fontWeights.bold,
              margin: 0,
              color: colors.text
            }}
          >
            Come build something and watch it break.
          </h2>
          <p
            style={{
              margin: `${space.md} auto 0`,
              maxWidth: '48ch',
              fontSize: fontSizes.md,
              color: colors.textSecondary,
              lineHeight: 1.6
            }}
          >
            It is on Steam now, under active development. Wishlisting helps it
            get seen, and buying in early means you shape where it goes.
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
              Play on Steam ↗
            </Button>
            <Button as={Link} to="/projects" variant="secondary" size="lg">
              See the rest of my work
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
