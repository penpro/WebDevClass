// Yūki's Sacred Space, case study.
//
// Client is a distance-reiki, spirit-guide, death-doula practitioner. The job
// was making an esoteric, non-technical business read as a real one, and the
// trust almost all comes from engineering rather than styling. Copy is written
// in Wes's voice per D:\Substack\de-ai-methods.md (zero em-dashes, plain words,
// first person, specifics, no tidy-bow ending), kept clean for a client page.
//
// Live at https://yukis.space/. Client work; source is private, so this links
// to the live site only.

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
import SectionRail from '../../components/SectionRail.jsx';
import useDocumentMeta from '../../hooks/useDocumentMeta.js';

const SECTIONS = [
  { id: 'hero',        num: '00', label: 'Intro' },
  { id: 'screenshots', num: '01', label: 'The site' },
  { id: 'build',       num: '02', label: 'The build' },
  { id: 'close',       num: '03', label: 'So' }
];

const SITE_URL = 'https://yukis.space/';

// Screenshots live at public/projects/yuki/. The ScreenshotStrip degrades to a
// "pending" tile if a file is missing, so the layout never breaks.
const SCREENSHOTS = [
  {
    src: '/projects/yuki/yuki-home.jpg',
    caption:
      'The home page. Distance reiki, spirit guide, reiki master, death doula, over a background I built by hand: an aura wash, a column of vertical kanji that reads "for my future self," a couple of spiders on threads, film grain. All of it sits under the text and ignores your mouse.'
  },
  {
    src: '/projects/yuki/yuki-resources.jpg',
    caption:
      'The free guides. Five printable CBT-style workbooks, no email required to grab them. This is the practical stuff that balances out the mysticism.'
  },
  {
    src: '/projects/yuki/yuki-guide.png',
    caption:
      'A workbook on screen. "The spiral," for catching catastrophic thinking. Short prompts, six to nine words each, which is the way a worksheet actually gets used.'
  },
  {
    src: '/projects/yuki/yuki-guide-print.png',
    caption:
      'The same file, printer-friendly. One button flips it to black and white with real lines to write on. Every guide says plainly that it isn\'t therapy; the heavy ones carry the 988 crisis line.'
  }
];

// Illustrative, faithful to the real workbook.css: one component ruleset, two
// token blocks, so the branded and print versions can't drift apart.
const DUAL_RENDER_CSS = `/* workbook.css: one set of component rules, two token blocks.
   Screen is the branded dark version; "printer friendly" is plain
   black-and-white with real ruled lines. Same components, so they
   can't drift apart. */
:root {
  --wb-bg:     #191317;                 /* warm near-black */
  --wb-ink:    #EFE6E0;
  --wb-accent: #D4A94A;                 /* antique gold */
  --wb-line:   rgba(233,222,216,.30);   /* the lines you write on */
}

body.print-preview {                    /* same components, print tokens */
  --wb-bg:   #fff;
  --wb-ink:  #111;
  --wb-line: #111;                      /* solid rules for pen and paper */
}

@media print { :root { /* print tokens, always, on paper */ } }`;

export default function YukiCase() {
  useDocumentMeta({
    title: "Yūki's Sacred Space, a reiki site with a real backend | Penumbra Tech",
    description:
      "Client case study. A distance reiki, spirit guide, and death doula site that reads as a real business: free printable CBT workbooks, a full Node/MySQL/nginx stack, Square left alone for checkout, and the witchy atmosphere built carefully enough to feel like care.",
    canonical: 'https://penumbra-tech.com/projects/yuki'
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
        <Stars density={120} heroDensity={12} colorTint="violet" />
        <CornerBrackets size={28} inset={24} />
        <Container style={{ position: 'relative', zIndex: 1 }}>
          <HudLabel tone="magenta">Yūki&apos;s Sacred Space · client build</HudLabel>
          <h1
            style={{
              fontFamily: fonts.heading,
              fontSize: 'clamp(2rem, 4vw, 3.25rem)',
              fontWeight: fontWeights.bold,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              margin: `${space.md} 0 ${space.md}`,
              color: colors.text,
              maxWidth: '20ch'
            }}
          >
            You can do spirit work and still have a serious website.
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
            Yūki does distance reiki, spirit guidance, and death doula work.
            That&apos;s about as far from &ldquo;technical&rdquo; as a business
            gets, and it&apos;s the kind of thing a lot of people bounce off of
            before they even read it. The site she had turned all of it into a
            bare list of prices. What she actually needed was for someone
            who&apos;s curious but on the fence to land on the page and go, ok,
            this person&apos;s the real deal. That&apos;s barely a design
            problem. It&apos;s mostly engineering, and it&apos;s the same
            engineering I&apos;d put under any business I take seriously.
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
              'Brand system',
              'Node + Express',
              'MySQL',
              'nginx + PM2',
              'Accessibility',
              'SEO',
              'Printable CBT workbooks'
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
              Visit yukis.space ↗
            </Button>
            <Button as={Link} to="/contact" variant="secondary" size="lg">
              Talk to me about your thing
            </Button>
          </div>
        </Container>
      </section>

      {/* ============================ Screenshots =========================== */}
      <div id="screenshots">
        <ScreenshotStrip />
      </div>

      {/* ============================== The build ========================== */}
      <div id="build">
        <ChallengeSection
          background={colors.bgSoft}
          eyebrow="The free guides"
          tone="corona"
          title="The best thing on the site is free."
        >
          <p>
            The first real thing you hit on the site is five workbooks she
            gives away, before anything asks you for money or an email. Box
            breathing. A five-minute meditation. One for catching a thought
            spiral, one for the nerves before a new job, one for the grief after
            a breakup. They&apos;re built from plain CBT technique, the stuff a
            therapist would actually walk you through: catch the thought, name
            what your brain did with it, check it against what actually
            happened, write down a truer version. The prompts are short on
            purpose, like six to nine words each, because a worksheet with a
            paragraph-long question just doesn&apos;t get filled in.
          </p>
          <p>
            Every guide comes out of one file and renders two ways. On screen
            it&apos;s the dark branded version. Hit one button and it flips to
            clean black-and-white with real lines to write on, and printing
            always uses that one. It&apos;s the same file, so the pretty version
            and the print version can&apos;t drift out of sync. And because free
            mental-health material from someone who isn&apos;t a clinician has
            to be careful, every guide says plainly that it isn&apos;t therapy,
            and the three that get into real distress carry the 988 crisis line.
          </p>
          <div style={{ marginTop: space.lg }}>
            <CodePanel
              filename="workbook.css"
              language="css"
              code={DUAL_RENDER_CSS}
              status="ONE FILE · TWO RENDERS"
              maxHeight="360px"
            />
          </div>
        </ChallengeSection>

        <ChallengeSection
          eyebrow="The part nobody sees"
          tone="cyan"
          title="There's a real server under the reiki."
        >
          <p>
            Most sites like this are a drag-and-drop template. This one runs the
            same stack I&apos;d stand up for a software client: Node and Express,
            a MySQL database, real sessions, rate limiting, actual
            transactional email, database migrations, a newsletter, first-party
            analytics, and an admin panel she logs into. It lives on a Linux box
            behind nginx and PM2 with its own HTTPS.
          </p>
          <p>
            Nobody reads any of that and thinks &ldquo;ah, PM2.&rdquo; They just
            land on something fast and stable that doesn&apos;t feel like a
            hobby, and that does most of the trust work before she&apos;s said a
            word. The boring invisible part is the part doing the heavy lifting.
          </p>
        </ChallengeSection>

        <ChallengeSection
          background={colors.bgSoft}
          eyebrow="The money"
          tone="magenta"
          title="I didn't touch her checkout."
        >
          <p>
            She already had Square doing the actual work. The calendar, the
            payments, gift cards, the confirmation emails. All of that worked
            fine. Ripping it out to rebuild it myself would&apos;ve put her
            income at risk to fix a problem she didn&apos;t have. So every
            &ldquo;book&rdquo; button just opens her Square page in a new tab and
            nothing about her setup changed. The new site is the front door
            Square was never going to give her.
          </p>
          <p>
            The pricing is honest too. The three-month package is 24 sessions
            for $2,400, which comes out to $100 a session. At her normal $140
            walk-up rate that same block of sessions would run $3,360, so
            it&apos;s a real discount for committing without quietly undercutting
            her single bookings. Grounding a mystical business partly just means
            being unmysterious about the money.
          </p>
        </ChallengeSection>

        <ChallengeSection
          eyebrow="The witchy part"
          tone="cyan"
          title="The spooky stuff is real code."
        >
          <p>
            The witchy layer stayed. I just built it carefully enough that it
            reads as care instead of clutter. There are five fixed layers behind
            the page (an aura wash, a faint centering line, a column of vertical
            Japanese, a couple of slow spiders on threads, and a film grain), and
            every one of them sits under the content and ignores your mouse. The
            Japanese reads <span lang="ja">未来の私のために</span>,
            &ldquo;for my future self,&rdquo; and it&apos;s marked{' '}
            <code style={inlineCodeStyle}>aria-hidden</code> so a screen reader
            skips it instead of reading untranslated characters at a blind
            person. It scrolls exactly its own height, so the whole phrase reads
            through once by the time you hit the footer.
          </p>
          <p>
            The spiders&apos; speed is set in pixels per millisecond, because if
            you set a duration and also randomize how far they drop, the two
            cancel out and they always look the same speed no matter what you
            type (learned that one the annoying way). All of it shuts off if you
            have reduced-motion turned on. I checked it at 375 and 1310 pixels
            wide: nothing overflows, nothing clips at either end of the scroll,
            the body text sits at 5.4:1 contrast or better. Fussing over that is
            the actual grounding move. Careful reads as trustworthy.
          </p>
        </ChallengeSection>

        <ChallengeSection
          background={colors.bgSoft}
          eyebrow="For the person who isn't sure"
          tone="magenta"
          title="Built for the skeptic."
        >
          <p>
            There&apos;s a section on the site literally called{' '}
            <em>for the skeptical &amp; the curious</em>, and the build backs
            that up. Semantic HTML, a skip link, focus rings you can actually
            see, screen-reader labels on every &ldquo;book&rdquo; button so they
            don&apos;t all just announce &ldquo;book,&rdquo; a print stylesheet,
            a sitemap, robots, a web manifest, a one-page brand sheet so her
            logo and colors stay consistent everywhere she shows up.
          </p>
          <p>
            Her longer writing lives on Medium, and the site pulls it in as
            short teasers that link back out, so the two copies don&apos;t fight
            each other in search or split her readers. None of that is flashy.
            It all says the same quiet thing, which is that a real person runs
            this and they thought about you.
          </p>
        </ChallengeSection>
      </div>

      {/* =============================== Close ============================= */}
      <section
        id="close"
        style={{
          paddingTop: space['3xl'],
          paddingBottom: space['3xl'],
          background: colors.surface,
          borderTop: `1px solid ${colors.border}`
        }}
      >
        <Container narrow>
          <p
            style={{
              margin: 0,
              fontFamily: fonts.heading,
              fontSize: fontSizes.xl,
              lineHeight: 1.4,
              color: colors.text,
              letterSpacing: '-0.01em'
            }}
          >
            None of this is complicated. Most of it is just caring about the
            parts other people skip.
          </p>
          <p
            style={{
              margin: `${space.lg} 0 0`,
              fontSize: fontSizes.md,
              color: colors.textSecondary,
              lineHeight: 1.7
            }}
          >
            Yūki is good at her actual job. The site just needed to stop getting
            in the way of people finding that out. If you&apos;re good at your
            thing and your website is doing the opposite, that&apos;s the work I
            do.
          </p>
          <div
            style={{
              marginTop: space.xl,
              display: 'flex',
              gap: space.md,
              flexWrap: 'wrap'
            }}
          >
            <Button
              as="a"
              href={SITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              size="lg"
            >
              Visit yukis.space ↗
            </Button>
            <Button as={Link} to="/contact" variant="secondary" size="lg">
              Talk to me about your thing
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
              style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}
            >
              <Card padding={0} interactive style={{ overflow: 'hidden' }}>
                <img
                  src={shot.src}
                  alt={shot.caption}
                  loading="lazy"
                  onError={(e) => {
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
