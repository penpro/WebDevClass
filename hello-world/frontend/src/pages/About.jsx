// About / story page. Kept readable-width (Container narrow) — this is
// the most text-heavy page on the site and shouldn't sprawl across a
// 1180px viewport.

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

const PILLARS = [
  {
    title: 'Engineer',
    body:
      'I write code. Production code, not slides about code. The whole stack: SQL up through React, Linux up through user interface.'
  },
  {
    title: 'Problem solver',
    body:
      "When a system is broken, the question is rarely 'which library do we add' — it's 'what's the actual constraint here.' I'm comfortable in unfamiliar codebases."
  },
  {
    title: 'Maker',
    body:
      'Photography on the side. Game projects in Unreal. Hardware tinkering. The same instincts that make for good software apply to physical things; the cross-pollination shows.'
  }
];

export default function About() {
  return (
    <section
      style={{
        paddingTop: space['3xl'],
        paddingBottom: space['4xl']
      }}
    >
      <Container narrow>
        <span
          style={{
            fontFamily: fonts.mono,
            fontSize: fontSizes.xs,
            color: colors.cyan,
            textTransform: 'uppercase',
            letterSpacing: '0.1em'
          }}
        >
          About
        </span>
        <h1
          style={{
            fontFamily: fonts.heading,
            fontSize: 'clamp(2rem, 4vw, 3.25rem)',
            fontWeight: fontWeights.bold,
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            margin: `${space.sm} 0 ${space.lg}`,
            color: colors.text
          }}
        >
          One engineer, generalist by choice.
        </h1>

        <Prose>
          <p>
            Penumbra Tech is the single-engineer practice of Wesley
            Weaver Jr. I started programming because something was
            broken and nobody else was going to fix it — that mindset
            still drives most of the work I take on.
          </p>

          <p>
            I&apos;m a deliberate generalist. Most of the work in this
            world doesn&apos;t fit neatly into &ldquo;front-end&rdquo;
            or &ldquo;back-end&rdquo; — it&apos;s the whole pipeline
            from a customer&apos;s click through to a row in a
            database and back. Specialists tend to optimise their slice
            in ways that hurt the slices on either side. A generalist
            optimises the seam.
          </p>

          <p>
            The work I take on tends to fall into four buckets:
            full-stack web apps, AWS infrastructure, Unreal-based game
            systems, and performance / reliability engineering. The{' '}
            <Link
              to="/projects"
              style={{ color: colors.accent, textDecoration: 'none' }}
            >
              projects section
            </Link>{' '}
            has live, exercisable examples of each — including a
            traditional EC2 stack benchmarked head-to-head against the
            same idea built serverlessly on Lambda + DynamoDB + S3.
          </p>

          <p>
            Outside of consulting I do photography, build game
            prototypes, and write up the things I learn along the way.
            All of it ends up informing the contract work — different
            domains, same engineering instincts.
          </p>
        </Prose>

        <div
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
                  lineHeight: 1.55,
                  color: colors.textSecondary
                }}
              >
                {p.body}
              </p>
            </Card>
          ))}
        </div>

        <Card
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
              lineHeight: 1.55
            }}
          >
            Most engagements start with a short async exchange — you
            describe the problem, I tell you whether I think I&apos;m
            the right person for it, we sketch the rough shape of the
            work. From there it&apos;s either a fixed-scope quote or
            an hourly contract depending on how well-defined the work
            is.
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
  );
}

function Prose({ children }) {
  return (
    <div
      style={{
        fontSize: fontSizes.md,
        lineHeight: 1.7,
        color: colors.textSecondary,
        fontFamily: fonts.body
      }}
    >
      {children}
      <style>{`
        .penumbra-prose p { margin-top: 1rem; margin-bottom: 1rem; }
      `}</style>
    </div>
  );
}
