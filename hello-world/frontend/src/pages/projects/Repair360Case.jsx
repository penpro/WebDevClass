// Repair360 Auto — case study.
//
// The visible work is a custom auto-repair-shop site living inside a
// Wix HTML/Iframe panel. The interesting work is everything that had
// to be solved to make a hand-built page behave inside someone else's
// no-code host without losing the brand or its search visibility.
//
// Stack note: hand-written dependency-free HTML/CSS/vanilla JS, a
// single ~160 KB file, no framework, no build step. Earlier drafts of
// this case study claimed React and an active postMessage size-
// negotiation layer; both were wrong. This version is honest about
// what shipped — the actual story is more interesting anyway.

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

// Screenshots live at public/projects/repair360/. Drop any PNG/JPG of
// the live site in there and add an entry below — order is preserved.
// Captions are short by design; the case study text carries the story.
const SCREENSHOTS = [
  {
    src: '/projects/repair360/desktop-hero.png',
    caption:
      'Hero — "Covering 360° of your vehicle." Brand orange against near-black, vectorised logo, condensed-bold display type reverse-engineered from the client\'s flyers.'
  },
  {
    src: '/projects/repair360/services.png',
    caption:
      'Full Detailing Service section — Exterior / Interior / Extras lists with a $249 starting-at price card. All the brand work (palette, type, hierarchy) lands here.'
  }
];

// Real snippet — the AutoRepair JSON-LD that makes the embed visible to
// Google despite living inside an iframe. The same shape lives in the
// host page's <head>, not inside the iframe (the iframe doesn't carry
// its own SEO).
const JSONLD_CODE = `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "AutoRepair",
  "name": "360 Automotive",
  "url": "https://www.repair360auto.com/",
  "telephone": "+1-360-...",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "…",
    "addressLocality": "Port Orchard",
    "addressRegion": "WA",
    "postalCode": "…",
    "addressCountry": "US"
  },
  "openingHours": "Mo-Fr 08:00-17:00",
  "priceRange": "$$"
}
</script>`;

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
          <HudLabel tone="cyan">
            Case study: Client work, constraint engineering
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
              maxWidth: '22ch'
            }}
          >
            Repair360 Auto: a modern site inside a Wix panel.
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
            The brief that&apos;s secretly an engineering problem. The
            client had a working Wix setup — booking app, email, business
            listings all wired to that account — and no interest in
            re-platforming. They wanted a better visitor experience
            without uprooting a back office that already worked. The lazy
            answer is &ldquo;migrate to a real stack.&rdquo; The right
            answer is to meet them where they are and make a modern
            front-end behave correctly inside the host they already trust.
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
              'Vanilla JS',
              'Responsive CSS',
              'SVG vectorization',
              'JSON-LD structured data',
              'Wix embed',
              'Client work'
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

      {/* ============================ Screenshots =========================== */}
      <ScreenshotStrip />

      {/* ========================== Challenge 1 ============================ */}
      <ChallengeSection
        background={colors.bgSoft}
        eyebrow="Challenge 1: Brand reverse-engineering"
        tone="corona"
        title="A brand with no brand guide."
      >
        <p>
          The deliverable I was handed was three social-media flyers and
          a logo. No palette, no type spec, no copy deck, no component
          library — just the raw artwork the client already had. So
          before I could build the page I had to reverse-engineer the
          brand from the artwork: extract the orange{' '}
          <code style={inlineCodeStyle}>#F47A1F</code> against near-black,
          identify the condensed-bold display face used in the headers
          and the outlined-italic title treatment, and turn it all into
          a cohesive responsive single-pager with real structure
          (services, detailing package, value props, contact).
        </p>
        <p>
          The output is a brand that <em>reads</em> consistent across
          every section because the inputs were normalised first; the
          page just expresses a system that didn&apos;t formally exist
          before.
        </p>
      </ChallengeSection>

      {/* ========================== Challenge 2 ============================ */}
      <ChallengeSection
        eyebrow="Challenge 2: Logo that fought every size"
        tone="cyan"
        title="A muddy JPEG with a baked-in black background."
      >
        <p>
          The supplied logo was a JPEG, not an SVG, and it had a baked-in
          black background — lossy compression artefacts around every
          edge and no transparency, so it sat in an ugly opaque box on a
          dark page.
        </p>
        <p>
          The fix was two passes. First, key the black out to recover a
          clean transparent PNG — treating the image as
          premultiplied-over-black so the alpha channel could be
          extracted properly rather than hard-edge keying every pixel.
          Then vectorise to SVG: posterise the result to flat brand
          colours to kill the JPEG noise, trace the shapes, and strip
          the background. The final logo is razor-sharp from a 16 px
          favicon to a billboard, and lives inline in the HTML so there
          isn&apos;t even a separate asset request to fail.
        </p>
      </ChallengeSection>

      {/* ========================== Challenge 3 ============================ */}
      <ChallengeSection
        background={colors.bgSoft}
        eyebrow="Challenge 3: Behave inside a Wix panel"
        tone="magenta"
        title="One self-contained file, no framework, no build step."
      >
        <p>
          The whole front-end ships as a single self-contained HTML file
          — CSS and JS inlined, logo embedded as inline SVG, fonts from
          a CDN — and gets dropped into a Wix HTML/Iframe panel. No
          React, no Vue, no bundler, no build step. About 160 KB,
          paste-anywhere, framework-free.
        </p>
        <p>
          That&apos;s a stronger answer for an embed than React would have
          been. The framework runtime would have been pure tax — the
          page has no state to model, no client-side routing, no
          re-render cycle. Mobile-first CSS handles the responsiveness;
          the panel is sized to fit the content.
        </p>
        <p>
          One known limitation worth naming: an iframe&apos;s in-page
          anchor nav can&apos;t scroll its <em>parent</em>, so I dropped
          the section links for a tagline and routed the primary CTA
          straight to the client&apos;s external booking app in a new
          tab. The pragmatic call beat the clever one.
        </p>
      </ChallengeSection>

      {/* ========================== Challenge 4 ============================ */}
      <ChallengeSection
        eyebrow="Challenge 4: Mojibake nobody warns you about"
        tone="cyan"
        title="UTF-8 turned to soup somewhere between editor and clipboard."
      >
        <p>
          First paste into Wix came out full of garbage characters — em
          dashes, degree signs, and icons all corrupted. The root cause
          wasn&apos;t in the code; it was in the delivery pipeline.
          PowerShell was reading a UTF-8 file as Windows-1252 on its way
          to the clipboard, so every multi-byte UTF-8 sequence was being
          interpreted one byte at a time. The tell was that the
          clipboard&apos;s character count exactly equalled the file&apos;s
          byte count — a giveaway that the encoding step had collapsed.
        </p>
        <p>
          The fix wasn&apos;t to harden the pipeline — I don&apos;t own
          the Wix paste path. The fix was to make the artefact immune to
          its own delivery: compile the entire embed to pure ASCII. HTML
          numeric entities in the markup, unicode escapes in the CSS, so
          no encoding step in PowerShell, the clipboard, or Wix can
          corrupt it again. Robust to a channel I don&apos;t control.
        </p>
      </ChallengeSection>

      {/* ========================== Challenge 5 ============================ */}
      <ChallengeSection
        background={colors.bgSoft}
        eyebrow="Challenge 5: The invisible-website trap"
        tone="magenta"
        title="Pixel-perfect, and effectively unindexable."
      >
        <p>
          This is the one most builders miss, and it&apos;s the most
          consequential for a small business. An embed has a hidden cost:
          content inside an iframe is a <em>separate document</em>, and
          Google doesn&apos;t credit it to the host page. I audited the
          live site the way a crawler sees it and the worst case was
          confirmed — the host page had zero headings, no body text, a
          default <code style={inlineCodeStyle}>Home | 360 Automotive</code>{' '}
          title, no meta description. Pixel-perfect inside the frame,
          invisible to search outside it.
        </p>
        <p>
          Fixing it didn&apos;t require leaving Wix. The substantive,
          visible content went into <strong>native host elements</strong>{' '}
          — an H1, the service list, and the full name/address/phone (the
          NAP triple every local-search algorithm wants) — and the host
          page got{' '}
          <a
            href="https://schema.org/AutoRepair"
            target="_blank"
            rel="noopener noreferrer"
            style={inlineLinkStyle}
          >
            <code style={inlineCodeStyle}>AutoRepair</code> JSON-LD
            structured data
          </a>{' '}
          plus a real title and meta description. The site went from
          invisible-to-Google to fully crawlable — same host, same
          design, dramatically different findability.
        </p>
        <p style={{ marginTop: space.lg, marginBottom: 0 }}>
          A trimmed version of the JSON-LD block that lives in the host
          page&apos;s{' '}
          <code style={inlineCodeStyle}>&lt;head&gt;</code>:
        </p>
        <div style={{ marginTop: space.md }}>
          <CodePanel
            filename="head.html"
            language="js"
            code={JSONLD_CODE}
            status="DEPLOYED"
            maxHeight="360px"
          />
        </div>
      </ChallengeSection>

      {/* ============================== Lessons ============================== */}
      <section
        style={{
          paddingTop: space['3xl'],
          paddingBottom: space['3xl'],
          background: colors.surface,
          borderTop: `1px solid ${colors.border}`
        }}
      >
        <Container>
          <div style={{ maxWidth: '60ch', marginBottom: space['2xl'] }}>
            <HudLabel tone="corona">Lessons that travel</HudLabel>
            <h2 style={sectionTitleStyle}>Patterns worth keeping.</h2>
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
              body="A client who's productive on a no-code platform isn't wrong to stay there. A custom front-end inside their host is usually cheaper, faster, and lower-risk than a migration."
            />
            <PitchCard
              title='"Looks done" isn&apos;t "gets found"'
              body="An embedded site can be pixel-perfect and still invisible to search — the frame doesn't carry your SEO. Verify crawlability and solve it natively in the host: headings, NAP, structured data. Never assume."
            />
            <PitchCard
              title="The delivery pipeline is part of the product"
              body="A file that's correct in your editor can be corrupted by the channel that carries it. When you don't control the pipe, ship something robust to it — pure ASCII travels everywhere intact."
            />
            <PitchCard
              title="Know when not to over-engineer"
              body="Manual full-height panel sizing and a tagline-instead-of-nav held up fine. I spent the effort where it actually mattered — encoding, SEO, brand consistency — not on machinery the project didn't need."
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

function ScreenshotStrip() {
  return (
    <section
      style={{
        paddingTop: space['2xl'],
        paddingBottom: space['2xl'],
        borderBottom: `1px solid ${colors.borderSubtle}`
      }}
    >
      <Container>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: space.lg
          }}
        >
          {SCREENSHOTS.map((shot) => (
            <a
              key={shot.src}
              href={shot.src}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block',
                textDecoration: 'none',
                color: 'inherit'
              }}
            >
              <Card padding={0} interactive style={{ overflow: 'hidden' }}>
                <img
                  src={shot.src}
                  alt={shot.caption}
                  loading="lazy"
                  onError={(e) => {
                    // While screenshots aren't on disk yet, swap to a
                    // neutral placeholder caption so the layout doesn't
                    // shift around a broken image.
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement.querySelector(
                      '.shot-placeholder'
                    ).style.display = 'flex';
                  }}
                  style={{
                    display: 'block',
                    width: '100%',
                    height: 'auto',
                    background: colors.bg
                  }}
                />
                <div
                  className="shot-placeholder"
                  style={{
                    display: 'none',
                    width: '100%',
                    aspectRatio: '16 / 10',
                    background: colors.bg,
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: colors.textMuted,
                    fontFamily: fonts.mono,
                    fontSize: fontSizes.xs,
                    textAlign: 'center',
                    padding: space.md
                  }}
                >
                  Screenshot pending
                </div>
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
        // dangerouslySetInnerHTML so `&apos;` decodes in the title.
        dangerouslySetInnerHTML={{ __html: title }}
      />
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

const inlineLinkStyle = {
  color: colors.accent,
  textDecoration: 'none'
};
