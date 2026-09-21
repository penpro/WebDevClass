// Tug Comanche (ATA-202), case study.
//
// Client is the Tug Comanche Historical Rescue Foundation, a volunteer
// nonprofit keeping a 1944 Navy ocean tug (later USCGC WMEC-202) afloat and
// underway on Puget Sound. The job was the unglamorous operational backend a
// nonprofit actually runs on: donations, email to supporters, volunteer and
// grant intake, a board portal, and a real contact list. Copy is in Wes's
// voice per D:\Substack\de-ai-methods.md (zero em-dashes, plain words, first
// person, no summary-bow ending).
//
// Live at https://tug202.org/. Client work; source is private, links to the
// live site only.

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

const SITE_URL = 'https://tug202.org/';

const SCREENSHOTS = [
  {
    src: '/projects/ata-202/ata-home.jpg',
    caption:
      "The home page. That's Comanche herself, a 1944 Navy ocean tug, moored in Budd Inlet off Olympia. Drone stills the volunteers shot, a Coast Guard-style crest, and the one thing a rescue site has to get right: a donate button that's never more than a tap away."
  },
  {
    src: '/projects/ata-202/ata-support.jpg',
    caption:
      "The support page. Donations run through Givebutter, embedded, so the foundation never touches card numbers or receipts. My job was making \u201cgive\u201d the easiest thing on the page."
  },
  {
    src: '/projects/ata-202/ata-visit.jpg',
    caption:
      "The visit page. Comanche is an operational museum ship, she gets underway under her own power, so the whole site treats her as a place you go see, never a boat you charter."
  }
];

// Illustrative, faithful to the real grants.js: one source per proposal drives
// both the web page and the PDF, and the budget is computed so the two can't
// disagree.
const GRANTS_CODE = `// grants.js: one source of truth per proposal. The /grants page AND the
// downloadable PDF both render from this object. The budget is computed,
// not typed, so the number on the page can't drift from the number in
// the grant packet.
export const drydock = {
  title: 'Dry-dock and hull survey',
  lineItems: [
    { name: 'Haul-out and lay days',      cost: 42000 },
    { name: 'Hull survey + gauging',       cost: 15000 },
    { name: 'Steel and welding',           cost: 88000 },
  ],
  pmPercent: 12,           // project management
  contingencyPercent: 15,  // it's a 1944 hull; things surprise you
};
// total = roundUpTo10k(sum(lineItems) * (1 + pm% + contingency%))`;

export default function Ata202Case() {
  useDocumentMeta({
    title: 'Tug Comanche (ATA-202), the software behind a ship rescue | Penumbra Tech',
    description:
      "Client case study. tug202.org, for the volunteer nonprofit keeping the 1944 Navy tug Comanche underway on Puget Sound. Donations, email blasts to supporters, volunteer and grant intake, a board portal, and a contact list built from a box of old paper sign-in sheets.",
    canonical: 'https://penumbra-tech.com/projects/ata-202'
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
        <Stars density={120} heroDensity={12} colorTint="cyan" />
        <CornerBrackets size={28} inset={24} />
        <Container style={{ position: 'relative', zIndex: 1 }}>
          <HudLabel tone="cyan">Tug Comanche · nonprofit · client build</HudLabel>
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
            Saving a WWII ship is mostly paperwork.
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
            Comanche is a 1944 Navy ocean tug, later the Coast Guard cutter
            WMEC-202, and she still gets underway under her own power on Puget
            Sound. A handful of volunteers keep her running. The romantic part
            is the ship. The part that actually decides whether she survives is
            money and paperwork, and that runs on software. So the site I built
            for the Tug Comanche Historical Rescue Foundation is really an
            operations backend wearing a museum-ship front end.
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
              'Node + Express',
              'MySQL',
              'nginx + PM2',
              'Givebutter donations',
              'Amazon SES + blasts',
              'Board portal',
              'Grant PDFs',
              'Nonprofit'
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
              Visit tug202.org ↗
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
          eyebrow="The money"
          tone="corona"
          title="The whole site points at one button."
        >
          <p>
            A rescue like this lives or dies on donations, so everything is
            arranged to make giving the shortest path on the page. Donate sits
            in the nav, floats in the corner, and is the loud button in the
            hero. The actual money runs through Givebutter, embedded right in
            the Support page, which means the foundation never touches a card
            number or has to mail a receipt. Same move I make everywhere:
            don&apos;t rebuild the parts a specialist already does well and
            has to be compliant about. Wire into them and get out of the way.
          </p>
        </ChallengeSection>

        <ChallengeSection
          eyebrow="The back office"
          tone="cyan"
          title="There's a board portal doing the real work."
        >
          <p>
            Behind the public pages is a full backend, the same stack I&apos;d
            build for any client: Node and Express on MySQL, behind nginx and
            PM2. The volunteer board logs into a portal at{' '}
            <code style={inlineCodeStyle}>/admin</code> with real session
            accounts (bcrypt, roles for admin and editor), and new board members
            get on by invite link instead of someone emailing a shared password
            around. Every contact, volunteer, and partner form writes to the
            database and pings a notify address. The news feed is database-backed
            but falls back to a bundled list if the API ever hiccups, so the
            front page never goes blank.
          </p>
          <p>
            None of that is visible to a visitor. It&apos;s the difference
            between a nonprofit that runs on one person&apos;s inbox and one that
            keeps working when that person is out on the water.
          </p>
        </ChallengeSection>

        <ChallengeSection
          background={colors.bgSoft}
          eyebrow="The shoebox"
          tone="magenta"
          title="I turned a box of sign-in sheets into a mailing list."
        >
          <p>
            The foundation had years of supporters, and they were sitting in a
            stack of paper sign-in sheets from open-boat days. So I scanned and
            transcribed them: 159 people, around 550 candidate email addresses
            once you account for the guesses and permutations. That went into a
            real contact list on the server (kept out of git, since it&apos;s
            actual people&apos;s info) with a verify-and-bounce workflow, so
            addresses get marked good or dead instead of silently rotting.
          </p>
          <p>
            From there the board sends branded email blasts straight out of the
            portal: pick an audience, send, watch a per-recipient log. It runs on
            Amazon SES, and when a message bounces, SES tells a webhook and the
            address gets flagged automatically. A pile of paper became a list the
            crew can actually reach, which for a donation-funded nonprofit is
            most of the whole game.
          </p>
        </ChallengeSection>

        <ChallengeSection
          eyebrow="The paperwork"
          tone="cyan"
          title="The grant proposals build their own PDFs."
        >
          <p>
            Grants are how a project like this gets real money, and grant
            packets are miserable to keep in sync. So each proposal is one object
            in the code, and that single source renders both the page you read on
            the site and a downloadable PDF for the application. The budget
            isn&apos;t typed in twice, it&apos;s computed from the line items
            plus a project-management percentage and a contingency (it&apos;s a
            1944 hull, things surprise you), rounded up to the nearest $10k. The
            number on the website and the number in the grant packet literally
            cannot disagree.
          </p>
          <div style={{ marginTop: space.lg }}>
            <CodePanel
              filename="grants.js"
              language="js"
              code={GRANTS_CODE}
              status="ONE SOURCE · PAGE + PDF"
              maxHeight="380px"
            />
          </div>
          <p style={{ marginTop: space.lg }}>
            Same generator stamps out the rest of the fundraising kit from
            templates: a flyer, a 4x6 donation card, a QR code, a printable
            donation receipt. The stuff a volunteer needs at a table on the dock,
            printed and ready, not something they have to design the night
            before.
          </p>
        </ChallengeSection>

        <ChallengeSection
          background={colors.bgSoft}
          eyebrow="The facts"
          tone="magenta"
          title="It's a history site, so I sweated the history."
        >
          <p>
            A museum ship&apos;s whole credibility is that it tells the truth
            about itself. So the dates and claims that came from secondary
            sources are flagged in the code and read as &ldquo;reported&rdquo; on
            the page, waiting to be reconciled against the official Navy and
            Coast Guard histories, instead of getting stated as gospel. And one
            distinction stays in every line of copy: Comanche is an operational
            museum ship that cruises through nonprofit partnerships, she is never
            a charter you can rent. Getting that right is its own kind of
            engineering. It just happens to be about words instead of code.
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
            A twelve-person volunteer board now runs on the same kind of
            software a real company would, which is the point.
          </p>
          <p
            style={{
              margin: `${space.lg} 0 0`,
              fontSize: fontSizes.md,
              color: colors.textSecondary,
              lineHeight: 1.7
            }}
          >
            They get to spend their time on the ship instead of on spreadsheets
            and shared passwords. If you run a small nonprofit and the admin work
            is eating the mission, that gap is the thing I close.
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
              Visit tug202.org ↗
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
