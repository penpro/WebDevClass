// About / story page. Kept readable-width (Container narrow) — this is
// the most text-heavy page on the site and shouldn't sprawl across a
// 1180px viewport.
//
// Voice note: this page leads with founder/operator credibility and
// systems credibility, not "I built a side project once." Penumbra
// Tech is the latest in a chain of practices that go back to 2016, and
// the engineering instincts come from a decade in environments where
// "probably fine" wasn't an acceptable standard.

import { Link } from 'react-router-dom'
import {
  colors,
  fonts,
  fontSizes,
  fontWeights,
  radii,
  space
} from '../theme.js'
import Container from '../components/Container.jsx'
import Card from '../components/Card.jsx'
import Button from '../components/Button.jsx'
import Stars from '../components/Stars.jsx'
import CornerBrackets from '../components/CornerBrackets.jsx'
import HudLabel from '../components/HudLabel.jsx'
import Eclipse from '../components/Eclipse.jsx'
import SectionRail from '../components/SectionRail.jsx'
import CommitGrid from '../components/CommitGrid.jsx'

const SECTIONS = [
  { id: 'hero',        num: '00', label: 'Intro' },
  { id: 'story',       num: '01', label: 'Story' },
  { id: 'proof',       num: '02', label: 'Proof strip' },
  { id: 'shipping',    num: '03', label: 'Shipping' },
  { id: 'how-i-think', num: '04', label: 'How I think' },
  { id: 'working',     num: '05', label: 'Working with me' }
];

const PILLARS = [
  {
    title: 'Engineer',
    body:
      'I write production code, not slides about code. SQL through React. Linux through user interface. AWS through deployment. I care about whether the thing works after someone else has to use it.'
  },
  {
    title: 'Problem solver',
    body:
      'When a system is broken, the useful question is rarely "which library should we add?" It\'s "what constraint are we actually fighting?" I\'m comfortable in unfamiliar codebases, half-documented systems, and projects where the problem is spread across software, infrastructure, people, and process.'
  },
  {
    title: 'Maker',
    body:
      'Software, photography, game systems, hardware tinkering, documentation, physical builds: they all train the same muscle, turning vague intent into working structure. The cross-pollination is part of the point.'
  }
]

const PROOFS = [
  {
    signal: 'Founder / operator',
    detail:
      'Founder of Penumbra Group, Penumbra PC, and Penumbra Productions, running customer-facing technical work since 2016.'
  },
  {
    signal: 'Systems background',
    detail:
      'Former U.S. Navy nuclear-trained technician. Power plant operations, radiological controls, analytical chemistry, LAN administration, watchstanding.'
  },
  {
    signal: 'Current stack',
    detail:
      'Full-stack web (React + Express + MySQL), AWS (EC2 / Lambda / DynamoDB / S3 / CloudFront), Linux operations, Unreal Engine C++, performance & reliability work.'
  },
  {
    signal: 'Recognition',
    detail: 'Penumbra PC, Best of South Kitsap 2017.'
  },
  {
    signal: 'Education',
    detail: 'Computer Science BS coursework, Olympic College.'
  },
  {
    signal: 'Entity',
    detail: 'Penumbra Tech is a sole proprietorship operating from Kitsap County, WA.'
  }
]

export default function About() {
  return (
    <>
    <SectionRail sections={SECTIONS} />
    <section
      style={{
        position: 'relative',
        overflow: 'hidden',
        paddingTop: space['3xl'],
        paddingBottom: space['4xl']
      }}
    >
      <Stars density={120} heroDensity={12} colorTint="mixed" />
      <CornerBrackets size={28} inset={24} />

      {/* Subtle eclipse on the far right as a brand accent. Sits off
          the canvas edge so it's atmosphere, not a focal element. */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          right: '-22%',
          top: '8%',
          opacity: 0.5,
          pointerEvents: 'none',
          zIndex: 0
        }}
        className="penumbra-about-eclipse"
      >
        <Eclipse size={520} glow={64} />
      </div>
      <style>{`
        @media (max-width: 900px) { .penumbra-about-eclipse { display: none; } }
      `}</style>

      <Container narrow style={{ position: 'relative', zIndex: 1 }}>
        <HudLabel tone="magenta">About</HudLabel>
        <div
          id="hero"
          className="penumbra-about-hero"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) 200px',
            gap: space.xl,
            alignItems: 'start',
            margin: `${space.md} 0 ${space.lg}`
          }}
        >
          <h1
            style={{
              fontFamily: fonts.heading,
              fontSize: 'clamp(2rem, 4vw, 3.25rem)',
              fontWeight: fontWeights.bold,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              margin: 0,
              color: colors.text
            }}
          >
            One engineer, generalist by choice.
          </h1>
          <img
            src="/wesley.jpg"
            alt="Wesley Weaver Jr."
            width="200"
            height="250"
            style={{
              width: '100%',
              maxWidth: 200,
              aspectRatio: '4 / 5',
              objectFit: 'cover',
              borderRadius: 12,
              border: `1px solid ${colors.borderAccent}`,
              boxShadow: '0 12px 30px rgba(0,0,0,.5)',
              display: 'block'
            }}
          />
        </div>
        <style>{`
          @media (max-width: 640px) {
            .penumbra-about-hero {
              grid-template-columns: 1fr !important;
            }
            .penumbra-about-hero img {
              max-width: 160px !important;
              justify-self: start;
            }
          }
        `}</style>

        <div id="story">
        <Prose>
          <p>
            Penumbra Tech is the single-engineer consulting and software
            practice of{' '}
            <a
              href="https://www.linkedin.com/in/wesley-weaver-31726629/"
              target="_blank"
              rel="noreferrer noopener"
              style={{ color: colors.accent, textDecoration: 'none' }}
            >
              Wesley Weaver Jr.
            </a>{' '}
            I started programming because something was broken and nobody
            else was going to fix it. That mindset still drives the work I
            take on.
          </p>

          <p>
            I&apos;m a deliberate generalist. Most useful software
            doesn&apos;t live cleanly inside &ldquo;front-end,&rdquo;{' '}
            &ldquo;back-end,&rdquo; &ldquo;cloud,&rdquo;{' '}
            &ldquo;database,&rdquo; or &ldquo;operations.&rdquo; It lives
            in the seams between them: a customer clicks something, a
            request moves through infrastructure, business logic runs,
            data changes, the interface responds, and someone has to
            understand the whole chain well enough to make it reliable.{' '}
            <strong style={{ color: colors.text }}>
              A generalist optimises the seam.
            </strong>{' '}
            That&apos;s where I work best.
          </p>

          <p>
            Before Penumbra Tech, I built and ran{' '}
            <strong style={{ color: colors.text }}>Penumbra Group</strong>,{' '}
            <strong style={{ color: colors.text }}>Penumbra PC</strong>, and{' '}
            <strong style={{ color: colors.text }}>
              Penumbra Productions
            </strong>: years of hands-on technical work with real
            customers, real deadlines, and real consequences. Before that, I spent more
            than a decade in the U.S. Navy nuclear pipeline and related
            technical roles: power plant operations, radiological
            controls, analytical chemistry, LAN administration,
            maintenance, documentation, watchstanding, and systems where{' '}
            <em>&ldquo;probably fine&rdquo;</em> was never an acceptable
            engineering standard.
          </p>

          <p>
            That background shaped how I build software. I like systems
            that are observable, explainable, maintainable, and boring
            in the right places. I like code that survives contact with
            users. I like infrastructure that can be rebuilt from notes
            instead of mythology. I like finding the actual constraint
            instead of throwing libraries at symptoms.
          </p>

          <p>
            The work I take on tends to fall into four buckets:
            full-stack web applications, AWS infrastructure, Unreal
            Engine systems, and performance / reliability work. The{' '}
            <Link
              to="/projects"
              style={{ color: colors.accent, textDecoration: 'none' }}
            >
              projects section
            </Link>{' '}
            includes live, exercisable examples, including a traditional
            EC2 stack benchmarked head-to-head against the same idea built
            serverlessly on Lambda + DynamoDB + S3.
          </p>

          <p>
            Outside of consulting I build game prototypes, work in Unreal
            Engine C++, do photography, restore and maintain physical
            spaces, and write up what I learn. Different domains, same
            engineering instincts: define the system, find the failure
            points, improve the loop.
          </p>
        </Prose>
        </div>

        {/* ------------ Proof strip ------------ */}
        <Card
          id="proof"
          variant="accent"
          padding={space.lg}
          style={{ marginTop: space['2xl'] }}
        >
          <h2
            style={{
              fontFamily: fonts.heading,
              fontSize: fontSizes.lg,
              fontWeight: fontWeights.semibold,
              margin: `0 0 ${space.md}`,
              color: colors.text
            }}
          >
            The shorter version
          </h2>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontFamily: fonts.body
            }}
          >
            <tbody>
              {PROOFS.map((row, i) => (
                <tr
                  key={row.signal}
                  style={{
                    borderTop:
                      i === 0
                        ? 'none'
                        : `1px solid ${colors.borderSubtle}`
                  }}
                >
                  <th
                    scope="row"
                    style={{
                      textAlign: 'left',
                      padding: `${space.sm} ${space.md} ${space.sm} 0`,
                      verticalAlign: 'top',
                      color: colors.cyan,
                      fontFamily: fonts.mono,
                      fontSize: fontSizes.xs,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      fontWeight: fontWeights.semibold,
                      whiteSpace: 'nowrap',
                      minWidth: '11rem'
                    }}
                  >
                    {row.signal}
                  </th>
                  <td
                    style={{
                      padding: `${space.sm} 0`,
                      verticalAlign: 'top',
                      color: colors.textSecondary,
                      fontSize: fontSizes.sm,
                      lineHeight: 1.6
                    }}
                  >
                    {row.detail}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* ------------ Recent shipping ------------ */}
        <Card
          id="shipping"
          variant="accent"
          padding={space.lg}
          style={{ marginTop: space['2xl'] }}
        >
          <CommitGrid />
        </Card>

        {/* ------------ Pillars ------------ */}
        <div
          id="how-i-think"
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(180px, 1fr))',
            gap: space.lg,
            marginTop: space['2xl']
          }}
        >
          {PILLARS.map((p) => (
            <Card key={p.title} variant="accent">
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
                {p.title}
              </h3>
              <p
                style={{
                  margin: 0,
                  fontSize: fontSizes.sm,
                  lineHeight: 1.6,
                  color: colors.textSecondary
                }}
              >
                {p.body}
              </p>
            </Card>
          ))}
        </div>

        {/* ------------ Working with me ------------ */}
        <Card
          id="working"
          variant="accent"
          padding={space.xl}
          style={{
            marginTop: space['2xl'],
            background: colors.surfaceHover
          }}
        >
          <h3
            style={{
              fontFamily: fonts.heading,
              fontSize: fontSizes.xl,
              fontWeight: fontWeights.bold,
              margin: 0,
              color: colors.text
            }}
          >
            Working with me
          </h3>
          <p
            style={{
              marginTop: space.md,
              fontSize: fontSizes.base,
              color: colors.textSecondary,
              lineHeight: 1.6
            }}
          >
            Most engagements start with a short async exchange. You
            describe the problem, I tell you whether I think I&apos;m
            the right person for it, and we sketch the rough shape of
            the work. From there it&apos;s either a fixed-scope quote
            or an hourly contract depending on how well-defined the
            scope is.
          </p>
          <div
            style={{
              marginTop: space.lg,
              display: 'flex',
              gap: space.md,
              flexWrap: 'wrap'
            }}
          >
            <Button as={Link} to="/contact">
              Start the conversation →
            </Button>
            <Button as={Link} to="/services" variant="secondary">
              See services in detail
            </Button>
          </div>
        </Card>
      </Container>
    </section>
    </>
  )
}

function Prose({ children }) {
  return (
    <div
      style={{
        fontSize: fontSizes.md,
        lineHeight: 1.75,
        color: colors.textSecondary,
        fontFamily: fonts.body
      }}
    >
      {children}
    </div>
  )
}
