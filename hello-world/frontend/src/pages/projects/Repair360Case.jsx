// Repair360Auto case study.
//
// The client wanted to keep their existing Wix-hosted site, which meant
// the entire build had to live inside a Wix HTML/Iframe panel and look
// like part of the page. The real engineering challenge was making a
// proper modern React app behave responsively inside a third-party
// CMS's iframe — Wix doesn't propagate viewport changes to the embed,
// and the embed has no implicit way to ask the parent for height. So
// the layout had to negotiate its size manually via postMessage and
// stay readable across phone / tablet / desktop with no help from the
// host.

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
import CodePanel from '../../components/CodePanel.jsx';

const SITE_URL = 'https://www.repair360auto.com/';

// Real shape of the size-negotiation script. Stripped of project-
// specific selectors so it reads cleanly as a teaching snippet.
const RESIZE_CODE = `// Iframe-to-parent size negotiation.
// Wix doesn't reflow the iframe when our content changes height, so
// we measure ourselves on every layout change and post the new height
// up to the parent — which Wix's editor wires through to the embed
// container.
const sendHeight = () => {
  const h = Math.ceil(document.documentElement.scrollHeight);
  parent.postMessage({ type: 'resize-embed', height: h }, '*');
};

// Watch every layout-sensitive thing that could change height:
// content swaps, image loads, font swaps, viewport rotations.
const ro = new ResizeObserver(sendHeight);
ro.observe(document.documentElement);

window.addEventListener('load', sendHeight);
window.addEventListener('resize', sendHeight);
document.fonts?.ready.then(sendHeight);

// First send, before observers attach.
sendHeight();`;

export default function Repair360Case() {
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
        <Stars density={120} heroDensity={12} colorTint="corona" />
        <CornerBrackets size={28} inset={24} />
        <Container style={{ position: 'relative', zIndex: 1 }}>
          <HudLabel tone="cyan">Case study — Client work / constraint engineering</HudLabel>
          <h1
            style={{
              fontFamily: fonts.heading,
              fontSize: 'clamp(2rem, 4vw, 3.25rem)',
              fontWeight: fontWeights.bold,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              margin: `${space.md} 0 ${space.md}`,
              color: colors.text,
              maxWidth: '22ch'
            }}
          >
            Repair360 Auto — a modern site inside a Wix panel.
          </h1>
          <p
            style={{
              margin: 0,
              maxWidth: '62ch',
              fontSize: fontSizes.lg,
              color: colors.textSecondary,
              lineHeight: 1.6
            }}
          >
            The client had an existing Wix-hosted site they didn&apos;t
            want to migrate — Wix was already wired into their booking
            tools, their email, and their listings. So instead of telling
            them to change hosts, I built a proper responsive React-based
            front-end and shoehorned it into a Wix HTML/Iframe panel,
            with a small postMessage size-negotiation layer so it
            behaves as if it owned the page.
          </p>
          <div
            style={{
              display: 'flex',
              gap: space.sm,
              flexWrap: 'wrap',
              marginTop: space.lg
            }}
          >
            {['React', 'Responsive CSS', 'postMessage', 'Wix embed', 'Client work'].map(
              (tag) => (
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
              )
            )}
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
              href={SITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              size="lg"
            >
              Visit the live site ↗
            </Button>
            <Button as={Link} to="/contact" variant="secondary" size="lg">
              Discuss a similar project
            </Button>
          </div>
        </Container>
      </section>

      {/* ========================== The constraint ========================== */}
      <section
        style={{
          paddingTop: space['3xl'],
          paddingBottom: space['3xl'],
          background: colors.bgSoft,
          borderBottom: `1px solid ${colors.borderSubtle}`
        }}
      >
        <Container>
          <div style={{ maxWidth: '60ch' }}>
            <HudLabel tone="corona">The constraint</HudLabel>
            <h2 style={sectionTitleStyle}>
              &ldquo;We&apos;re not moving off Wix.&rdquo;
            </h2>
            <Prose>
              <p>
                The client&apos;s existing site was on Wix. Their booking
                widgets, customer email, and a handful of marketing
                integrations were all wired to the same account. They
                didn&apos;t want a re-platform; they wanted a better
                visitor experience without uprooting the back office that
                already worked.
              </p>
              <p>
                That&apos;s a real engineering problem dressed up as a
                business preference. A lot of developers respond to it by
                telling the client they&apos;re wrong — &ldquo;you should
                migrate to a real stack&rdquo; — and then either deliver
                a frustrated half-effort or lose the engagement. The
                better answer is to meet the client where they are: ship
                a modern front-end that lives <em>inside</em> the host
                they already use, behaves correctly there, and stays
                maintainable.
              </p>
            </Prose>
          </div>
        </Container>
      </section>

      {/* =========================== The work ============================== */}
      <section
        style={{
          paddingTop: space['3xl'],
          paddingBottom: space['3xl'],
          borderBottom: `1px solid ${colors.borderSubtle}`
        }}
      >
        <Container>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.15fr)',
              gap: space['2xl'],
              alignItems: 'center'
            }}
            className="repair-code-grid"
          >
            <div>
              <HudLabel tone="cyan">The work</HudLabel>
              <h2 style={sectionTitleStyle}>
                Iframe size negotiation, done right.
              </h2>
              <Prose>
                <p>
                  Wix renders embedded HTML panels at a height the editor
                  guesses on insertion and then leaves alone. That breaks
                  every responsive technique that depends on the parent
                  reflowing — CSS media queries inside the iframe see
                  their <em>own</em> viewport, not the host&apos;s, and
                  the parent has no idea when the embed&apos;s content
                  grew or shrank.
                </p>
                <p>
                  The fix is a small postMessage handshake. The embed
                  observes its own document height with a{' '}
                  <code style={inlineCodeStyle}>ResizeObserver</code>,
                  posts the new value up to the parent on every change,
                  and the parent forwards it to the iframe container.
                  Combined with mobile-first responsive CSS inside the
                  embed, the result is a panel that looks correct at any
                  width and never clips its own content vertically.
                </p>
                <p>
                  The snippet on the right is roughly what runs on every
                  page of the live site — observe height, post height,
                  retry on load and resize and font-ready, done.
                </p>
              </Prose>
            </div>
            <div style={{ minWidth: 0 }}>
              <CodePanel
                filename="embed-resize.js"
                language="js"
                code={RESIZE_CODE}
                status="LIVE"
                maxHeight="460px"
              />
            </div>
          </div>
          <style>{`
            @media (max-width: 900px) {
              .repair-code-grid {
                grid-template-columns: 1fr !important;
                gap: 2rem !important;
              }
            }
          `}</style>
        </Container>
      </section>

      {/* ============================== Lessons ============================== */}
      <section
        style={{
          paddingTop: space['3xl'],
          paddingBottom: space['3xl'],
          background: colors.bgSoft
        }}
      >
        <Container>
          <div style={{ maxWidth: '60ch', marginBottom: space['2xl'] }}>
            <HudLabel tone="magenta">Lessons that travel</HudLabel>
            <h2 style={sectionTitleStyle}>
              Meet the client where they are.
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: space.lg
            }}
          >
            <PitchCard
              title="Hosting choices are business decisions"
              body="A client who's productive on a no-code platform isn't wrong to stay there. They've already built workflows around it. Adding a custom front-end as a panel inside their existing host is almost always cheaper, faster, and lower-risk than migrating."
            />
            <PitchCard
              title="Iframes are still useful — when you treat them right"
              body="The web has frame-ancestors policies and X-Frame-Options for good reasons, but inside your own embed inside your own host, the iframe is a perfectly fine isolation boundary. The trick is the size negotiation — once that works, everything else falls into place."
            />
            <PitchCard
              title="Responsive ≠ media-queries-only"
              body="Inside an embed your media queries don't see the host viewport. Mobile-first layouts plus container queries (or postMessage-driven width hints) carry you further. The point isn't to be clever; it's to make the site look right when the host shoves it into a column."
            />
          </div>

          <div
            style={{
              marginTop: space['2xl'],
              display: 'flex',
              gap: space.md,
              flexWrap: 'wrap',
              justifyContent: 'center'
            }}
          >
            <Button
              as="a"
              href={SITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              size="lg"
            >
              Visit the live site ↗
            </Button>
            <Button as={Link} to="/contact" variant="secondary" size="lg">
              Tell me about your constraints →
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

function Prose({ children }) {
  return (
    <div
      style={{
        fontSize: fontSizes.md,
        lineHeight: 1.7,
        color: colors.textSecondary,
        fontFamily: fonts.body,
        marginTop: space.md
      }}
    >
      {children}
    </div>
  );
}

function PitchCard({ title, body }) {
  return (
    <Card variant="accent" padding={space.lg}>
      <h3
        style={{
          fontFamily: fonts.heading,
          fontSize: fontSizes.lg,
          fontWeight: fontWeights.semibold,
          margin: 0,
          marginBottom: space.sm,
          color: colors.text
        }}
      >
        {title}
      </h3>
      <p
        style={{
          margin: 0,
          fontSize: fontSizes.sm,
          color: colors.textSecondary,
          lineHeight: 1.6
        }}
      >
        {body}
      </p>
    </Card>
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
