// Detailed services breakdown. Linked from the home page's "What I do"
// card grid. Same four service categories, expanded with what each
// engagement actually looks like.

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
  { id: 'hero',     num: '00', label: 'Intro' },
  { id: 'services', num: '01', label: 'The work' },
  { id: 'book',     num: '02', label: 'Book a Call' }
];

const SERVICES = [
  {
    title: 'Custom software',
    summary:
      'You need a working web application built end-to-end, not a half-finished proof of concept. I deliver the whole thing: front-end, back-end, database, auth, deployment, documentation.',
    deliverables: [
      'React + Vite SPA with sensible routing, auth, and a polished UI',
      'Node.js / Express APIs with proper validation, rate limiting, and error handling',
      'MySQL or DynamoDB schema designed for the actual access patterns',
      'Repo handed over with deploy scripts, README, and a migration system',
      'One free week of bug-fix coverage after launch'
    ],
    bestFor:
      'Founders, freelancers, and small teams who need a working system shipped, not an endless discovery process.'
  },
  {
    title: 'Cloud & backend',
    summary:
      'Whether you need a fresh AWS deployment or a rescue on someone else\'s production fire, I handle the parts of the stack nobody else on your team wants to touch.',
    deliverables: [
      'EC2 / nginx / PM2 / TLS setups with full deploy automation',
      'Serverless (Lambda / API Gateway / DynamoDB / S3 / CloudFront) where it fits',
      'Database migrations, backup strategy, and schema review',
      'Security hardening: rate limiters, security headers, audit logging, sane secrets handling',
      'Cost analysis with concrete numbers, not "it depends"'
    ],
    bestFor:
      "Businesses tired of paying twice the EC2 bill they should because nobody's audited it in two years."
  },
  {
    title: 'Game development',
    summary:
      'Unreal Engine work for indie projects and prototypes. Multiplayer systems, AI behaviour, and the web infrastructure to back a live game (player portals, telemetry, task queues).',
    deliverables: [
      'Unreal C++ and Blueprint development',
      'Steam multiplayer integration via Online Subsystem Steam',
      'Web portals that talk to running game sessions (Steam OpenID + auth tickets)',
      'Async play-while-away mechanics: players queue work for their characters via a web app',
      'Build/CI pipelines for game projects'
    ],
    bestFor:
      'Indie devs who want a non-gameplay engineer to handle the systems plumbing while they focus on the game.'
  },
  {
    title: 'Performance & reliability',
    summary:
      'Find where your stack breaks before your users do. Load testing, profiling, incident response, and post-mortem write-ups that actually get read.',
    deliverables: [
      'k6-driven load testing with live dashboards and percentile reporting',
      'CPU / memory / event-loop profiling on Node.js, Python, and game backends',
      'Identification of the actual bottleneck (usually not what the team thinks it is)',
      'Runtime toggles for safe production experimentation (rate limiters, maintenance mode)',
      'Incident response: dropping in during a fire and getting the system stable, then a written post-mortem'
    ],
    bestFor:
      'Anyone whose support inbox is full of "the site is slow" tickets and they can\'t reproduce it.'
  }
];

export default function Services() {
  useDocumentMeta({
    title: 'Services — custom software, AWS, Unreal, performance | Penumbra Tech',
    description:
      'Four engagement categories: custom web apps (React + Express + MySQL), AWS infrastructure (EC2/Lambda/DynamoDB/S3), Unreal Engine systems, and performance + reliability work (k6 load testing, profiling, incident response). Fixed scope or hourly.',
    canonical: 'https://penumbra-tech.com/services'
  });
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
        <Stars density={90} heroDensity={10} colorTint="corona" />
        <CornerBrackets size={28} inset={24} />
        <Container style={{ position: 'relative', zIndex: 1 }}>
          <HudLabel tone="cyan">Services</HudLabel>
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
            What an engagement looks like
          </h1>
          <p
            style={{
              maxWidth: '60ch',
              fontSize: fontSizes.lg,
              lineHeight: 1.6,
              color: colors.textSecondary,
              margin: 0
            }}
          >
            Four broad categories. Most projects span two of them.
            Pricing is by milestone or by hour depending on how
            well-defined the scope is. Happy to discuss either.
          </p>
        </Container>
      </section>

      <section
        id="services"
        style={{
          paddingTop: space['2xl'],
          paddingBottom: space['3xl']
        }}
      >
        <Container>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: space.lg
            }}
          >
            {SERVICES.map((s) => (
              <Card key={s.title} variant="accent" padding={space.xl}>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      'minmax(0, 1fr) minmax(0, 1.4fr)',
                    gap: space['2xl'],
                    alignItems: 'start'
                  }}
                  className="service-row"
                >
                  <div>
                    <h2
                      style={{
                        fontFamily: fonts.heading,
                        fontSize: fontSizes.xl,
                        fontWeight: fontWeights.bold,
                        margin: 0,
                        color: colors.text
                      }}
                    >
                      {s.title}
                    </h2>
                    <p
                      style={{
                        marginTop: space.md,
                        fontSize: fontSizes.base,
                        lineHeight: 1.6,
                        color: colors.textSecondary
                      }}
                    >
                      {s.summary}
                    </p>
                    <p
                      style={{
                        marginTop: space.md,
                        fontSize: fontSizes.sm,
                        color: colors.textMuted,
                        fontStyle: 'italic',
                        lineHeight: 1.55
                      }}
                    >
                      <strong style={{ color: colors.text }}>
                        Best for:
                      </strong>{' '}
                      {s.bestFor}
                    </p>
                  </div>

                  <div>
                    <h3
                      style={{
                        fontFamily: fonts.heading,
                        fontSize: fontSizes.sm,
                        fontWeight: fontWeights.semibold,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        color: colors.cyan,
                        margin: 0,
                        marginBottom: space.md
                      }}
                    >
                      What you get
                    </h3>
                    <ul
                      style={{
                        margin: 0,
                        padding: 0,
                        listStyle: 'none'
                      }}
                    >
                      {s.deliverables.map((d) => (
                        <li
                          key={d}
                          style={{
                            display: 'flex',
                            alignItems: 'start',
                            gap: space.sm,
                            padding: '0.4rem 0',
                            color: colors.textSecondary,
                            fontSize: fontSizes.sm,
                            lineHeight: 1.55,
                            borderBottom: `1px solid ${colors.borderSubtle}`
                          }}
                        >
                          <span
                            style={{
                              flexShrink: 0,
                              marginTop: '0.45rem',
                              width: 6,
                              height: 6,
                              borderRadius: radii.full,
                              background: colors.accent,
                              display: 'inline-block'
                            }}
                          />
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Stack the service-row to one column on narrow viewports. */}
          <style>{`
            @media (max-width: 768px) {
              .service-row {
                grid-template-columns: 1fr !important;
                gap: 1.25rem !important;
              }
            }
          `}</style>

          <div
            id="book"
            style={{
              textAlign: 'center',
              marginTop: space['2xl'],
              scrollMarginTop: 90
            }}
          >
            <Button as={Link} to="/contact" size="lg">
              Tell me about your project →
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
