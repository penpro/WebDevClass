// CS 330 databases review tool, case study.
//
// A study aid for a databases course. The course publishes its own question
// bank; this turns the 280 questions into spaced-repetition practice. Every
// number on this page comes from the tool itself (the bank, the validator,
// the tests) or from running the course SQL against MySQL 8.4.

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

const COURSE_URL =
  'https://srfoster.github.io/oc-classes/page.html?class=cs330&page=homepage';

const SECTIONS = [
  { id: 'hero',     num: '00', label: 'Intro' },
  { id: 'why',      num: '01', label: 'Why I built it' },
  { id: 'coverage', num: '02', label: 'Coverage' },
  { id: 'formats',  num: '03', label: 'Question types' },
  { id: 'learning', num: '04', label: 'Learning algo' },
  { id: 'mysql',    num: '05', label: 'Tested on MySQL' },
  { id: 'runs',     num: '06', label: 'How it runs' },
  { id: 'cta',      num: '07', label: 'Book a Call' }
];

// Units are runs of four course cards. Counts come from the question bank.
const UNITS = [
  { n: '1',  topic: 'Course overview', cards: '1–4', q: 20 },
  { n: '2',  topic: 'Tables and queries (SELECT, WHERE, ORDER BY, LIMIT)', cards: '5–8', q: 23 },
  { n: '3',  topic: 'Relationships and foreign keys', cards: '9–12', q: 21 },
  { n: '4',  topic: 'JOINs', cards: '13–16', q: 21 },
  { n: '5',  topic: 'Normalization and anomalies', cards: '17–20', q: 21 },
  { n: '6',  topic: 'Normal forms and many-to-many', cards: '21–24', q: 22 },
  { n: '7',  topic: 'Keys and constraints', cards: '25–28', q: 21 },
  { n: '8',  topic: 'INSERT, UPDATE, DELETE', cards: '29–32', q: 22 },
  { n: '9',  topic: 'GROUP BY and HAVING', cards: '33–36', q: 20 },
  { n: '10', topic: 'Subqueries and set operations', cards: '37–40', q: 22 },
  { n: '11', topic: 'Document and key-value stores', cards: '41–44', q: 22 },
  { n: '12', topic: 'Graph databases', cards: '45–48', q: 22 },
  { n: '13', topic: 'Apps and choosing a database', cards: '49–52', q: 23 }
];

// The real weighting function from the tool's scheduler (engine.js).
const SCHEDULER_CODE = `// Weight for picking the next question from the pool.
function weight(q) {
  var s = progress[q.id];
  var box = s ? (s.box || 1) : 1;
  var w = ({ 1: 12, 2: 7, 3: 4, 4: 2.5, 5: 1.5, 6: 0.8 })[box] || 1;
  if (!s || s.seen === 0) w = (q.unit === focusUnit) ? 9 : 3;
  if (s && s.everWrong && !s.mastered) w *= 1.9;   // past mistakes
  if (s && s.mastered) w *= 0.5;                   // keep mastered ones in rotation, lightly
  w *= (q.unit === focusUnit) ? 1.6 : (q.unit < focusUnit ? 0.8 : 0.45);
  if (s && s.lastSeen != null && (now - s.lastSeen) < 2) w *= 0.15; // no echoes
  return Math.max(w, 0.01);
}`;

// What the course writes, and what MySQL does with it, as run on MySQL 8.4.
const MYSQL_CODE = `-- As the course writes it. MySQL parses the
-- REFERENCES, then ignores it: no key exists.
CREATE TABLE cards (
  id INTEGER PRIMARY KEY,
  deck_id INTEGER REFERENCES decks(id)
);
INSERT INTO cards VALUES (1, 99);  -- succeeds

-- What MySQL needs to enforce it:
CREATE TABLE cards (
  id INTEGER PRIMARY KEY,
  deck_id INTEGER,
  FOREIGN KEY (deck_id) REFERENCES decks(id)
);
INSERT INTO cards VALUES (1, 99);
-- ERROR 1452: Cannot add or update a child row`;

const MYSQL_FINDINGS = [
  {
    title: 'Inline REFERENCES is ignored',
    body:
      'A column written as deck_id INTEGER REFERENCES decks(id) creates no key at all. A card that points at a deck that does not exist inserts without an error.'
  },
  {
    title: 'TEXT cannot be UNIQUE',
    body:
      'email TEXT UNIQUE fails with error 1170. The column has to be a VARCHAR with a length.'
  },
  {
    title: 'SET NOT NULL is a syntax error',
    body:
      'ALTER COLUMN ... SET NOT NULL does not exist in MySQL. It uses MODIFY and restates the column type.'
  },
  {
    title: 'INNER JOIN without ON is not an error',
    body:
      'The course calls a missing ON clause a mistake. MySQL accepts it and returns every pairing, 12 rows from a 3-row and a 4-row table.'
  }
];

export default function DatabasesReviewCase() {
  useDocumentMeta({
    title: 'CS 330 databases review tool case study | Penumbra Tech',
    description:
      'Study app for a databases course. 280 questions on SQL, joins, normalization, NoSQL and graph databases, spaced repetition, mock exams, and the course SQL checked against MySQL 8.4.',
    canonical: 'https://penumbra-tech.com/projects/databases-review'
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
        <Stars density={140} heroDensity={14} colorTint="mixed" />
        <CornerBrackets size={28} inset={24} />
        <Container style={{ position: 'relative', zIndex: 1 }}>
          <HudLabel tone="magenta">Case study: Databases</HudLabel>
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
            CS 330 databases review tool.
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
            A study app I built for my databases course. It turns the
            course&apos;s published question bank,{' '}
            <strong style={{ color: colors.text }}>280 questions across 52
            cards</strong>, into spaced-repetition practice: auto-graded
            multiple choice for concepts, and write-it-from-memory for SQL
            and other code. No account, no backend, and nothing leaves your
            browser.
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
              'Spaced repetition',
              'SQL practice',
              'Mock exams',
              'Tested on MySQL 8.4',
              'No account'
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
            <Button as="a" href="/cs330/" size="lg">
              Try it live →
            </Button>
            <Button as={Link} to="/projects" variant="secondary" size="lg">
              All projects
            </Button>
          </div>

          <p
            style={{
              margin: `${space.md} 0 0`,
              maxWidth: '64ch',
              fontSize: fontSizes.sm,
              color: colors.textMuted,
              lineHeight: 1.6
            }}
          >
            The questions and their reference answers are from the CS 330
            course&apos;s own question bank, published by the instructor,
            Dr. Stephen Foster, on the{' '}
            <a
              href={COURSE_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: colors.accent, textDecoration: 'none' }}
            >
              course site
            </a>
            . I did not write them. This is an independent study aid and is
            not affiliated with or endorsed by the course or its instructor.
          </p>
        </Container>
      </section>

      {/* ====================== Why I built it ============================ */}
      <section
        id="why"
        style={{
          paddingTop: space['3xl'],
          paddingBottom: space['3xl'],
          background: colors.bgSoft,
          borderBottom: `1px solid ${colors.borderSubtle}`
        }}
      >
        <Container>
          <div style={{ maxWidth: '64ch' }}>
            <HudLabel tone="corona">Why I built it</HudLabel>
            <h2 style={sectionTitleStyle}>
              A course built on recall needs a recall tool.
            </h2>
            <Prose>
              <p>
                CS 330 is an asynchronous databases course. The material is
                52 flashcard-style cards, and the grade rests on check-ins
                and two exams where you write queries and explain concepts
                from memory. The instructor publishes a bank of practice
                questions with answers, written for paper exams. A list of
                questions can&apos;t tell you which ones to repeat, so I
                built something that can.
              </p>
              <p>
                The tool quizzes you, tracks what you miss, and brings
                those questions back sooner. It follows the course&apos;s
                own card order, so the first unit is the first thing the
                course teaches, and the check-in ranges (cards 1–12, 1–36,
                all 52) are one click each.
              </p>
              <p>
                It also taught me something I did not plan on. Running the
                course&apos;s example SQL on a real MySQL server showed
                several places where the generic SQL on the cards behaves
                differently in practice. That list is further down, and it
                is in the tool&apos;s Reference tab too.
              </p>
            </Prose>
          </div>
        </Container>
      </section>

      {/* ============================ Coverage ============================ */}
      <section
        id="coverage"
        style={{
          paddingTop: space['3xl'],
          paddingBottom: space['3xl'],
          borderBottom: `1px solid ${colors.borderSubtle}`
        }}
      >
        <Container>
          <div style={{ maxWidth: '60ch', marginBottom: space.xl }}>
            <HudLabel tone="cyan">Coverage</HudLabel>
            <h2 style={sectionTitleStyle}>
              What the question bank contains.
            </h2>
            <p
              style={{
                margin: `${space.md} 0 0`,
                color: colors.textSecondary,
                fontSize: fontSizes.md,
                lineHeight: 1.6
              }}
            >
              The course comes in runs of four cards (what is it, two
              syntax cards, then a fluency card), so a unit is one run.
              In guided mode a unit unlocks when you have mastered the
              one before it.
            </p>
          </div>

          <Card padding={space.lg} style={{ overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontFamily: fonts.body,
                  fontSize: fontSizes.sm
                }}
              >
                <thead>
                  <tr
                    style={{
                      color: colors.cyan,
                      fontFamily: fonts.mono,
                      fontSize: fontSizes.xs,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em'
                    }}
                  >
                    <th style={thStyle}>Unit</th>
                    <th style={{ ...thStyle, width: '100%' }}>Topic</th>
                    <th style={thStyle}>Cards</th>
                    <th style={{ ...thStyle, textAlign: 'right' }}>Questions</th>
                  </tr>
                </thead>
                <tbody>
                  {UNITS.map((row, i) => (
                    <tr
                      key={row.n}
                      style={{
                        background: i % 2 === 0 ? 'transparent' : colors.bgSoft,
                        color: colors.text
                      }}
                    >
                      <td
                        style={{
                          ...tdStyle,
                          fontFamily: fonts.mono,
                          color: colors.accent,
                          fontWeight: fontWeights.bold,
                          width: '3rem'
                        }}
                      >
                        {row.n}
                      </td>
                      <td style={tdStyle}>{row.topic}</td>
                      <td
                        style={{
                          ...tdStyle,
                          fontFamily: fonts.mono,
                          color: colors.textSecondary,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {row.cards}
                      </td>
                      <td
                        style={{
                          ...tdStyle,
                          textAlign: 'right',
                          fontFamily: fonts.mono,
                          color: colors.textSecondary
                        }}
                      >
                        {row.q}
                      </td>
                    </tr>
                  ))}
                  <tr
                    style={{
                      background: colors.accentMuted,
                      color: colors.text,
                      fontWeight: fontWeights.bold
                    }}
                  >
                    <td style={tdStyle}>Σ</td>
                    <td style={tdStyle}>Total questions</td>
                    <td style={tdStyle} />
                    <td
                      style={{
                        ...tdStyle,
                        textAlign: 'right',
                        fontFamily: fonts.mono,
                        color: colors.accent
                      }}
                    >
                      {UNITS.reduce((s, r) => s + r.q, 0)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </Container>
      </section>

      {/* ============================ Question types ====================== */}
      <section
        id="formats"
        style={{
          paddingTop: space['3xl'],
          paddingBottom: space['3xl'],
          background: colors.bgSoft,
          borderBottom: `1px solid ${colors.borderSubtle}`
        }}
      >
        <Container>
          <div style={{ maxWidth: '64ch' }}>
            <HudLabel tone="cyan">Question types</HudLabel>
            <h2 style={sectionTitleStyle}>
              Auto-grade what you can, make you type what you must.
            </h2>
            <Prose>
              <p>
                Concepts, definitions, tracing (&ldquo;what does this
                return?&rdquo;), debugging, and &ldquo;which database
                would you pick&rdquo; questions are multiple choice (149)
                or select-all (12), graded the moment you check. Select-all
                is all or nothing: miss one option or pick a wrong one and
                it counts as a miss.
              </p>
              <p>
                The 119 questions whose answer is code stay typed, because
                SQL has to be written accurately anyway. You write it from
                memory, reveal the reference answer, and grade yourself.
                A keyword check lists the clauses in the reference that
                your answer left out, for example no <code style={inlineCodeStyle}>LIMIT</code>.
                It is a hint, never a grade, since a query can contain
                every keyword and still be wrong.
              </p>
              <p>
                My first draft of the multiple-choice options had a flaw.
                The correct option was the longest one in 74% of the
                questions, so picking the longest answer would have scored
                well without knowing anything. I rewrote the options so
                the correct one is the longest about 16% of the time
                (random is 25%), and the tool&apos;s validator now fails
                if that bias comes back. Options are also reshuffled on
                every showing, and the wrong ones are drawn from a larger
                pool, so you have to read all of them each time.
              </p>
            </Prose>
          </div>
        </Container>
      </section>

      {/* ===================== Learning algorithm ========================= */}
      <section
        id="learning"
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
            className="cs330-code-grid"
          >
            <div>
              <HudLabel tone="corona">Engineering, not just content</HudLabel>
              <h2 style={sectionTitleStyle}>
                A spaced-repetition scheduler.
              </h2>
              <Prose>
                <p>Three published methods, combined:</p>
                <ul style={proseListStyle}>
                  <li>
                    <strong style={{ color: colors.text }}>Leitner boxes.</strong>{' '}
                    Each question sits in one of six boxes. A correct answer
                    promotes it to a longer interval. A miss drops it to box
                    1 so it comes right back.
                  </li>
                  <li>
                    <strong style={{ color: colors.text }}>Streak mastery.</strong>{' '}
                    A question counts as mastered after three correct answers
                    in a row, so one lucky guess never sticks.
                  </li>
                  <li>
                    <strong style={{ color: colors.text }}>Mastery-gated units.</strong>{' '}
                    The next unit unlocks at about 90% mastery of the current
                    one. Earlier units keep mixing in, weighted toward what
                    you have missed.
                  </li>
                </ul>
                <p>
                  Inside a unit there is a difficulty ramp: concept
                  questions first, then syntax, tracing, writing,
                  debugging, and design. A tier opens once you have
                  recalled most of the one below it. The snippet is the
                  real weighting function, and the scheduler, the gating,
                  the ramp, and the answer-format rules all have tests.
                </p>
              </Prose>
            </div>
            <div style={{ minWidth: 0 }}>
              <CodePanel
                filename="engine.js"
                language="js"
                code={SCHEDULER_CODE}
                status="TESTED"
                maxHeight="460px"
              />
            </div>
          </div>
          <style>{`
            @media (max-width: 900px) {
              .cs330-code-grid {
                grid-template-columns: 1fr !important;
                gap: 2rem !important;
              }
            }
          `}</style>
        </Container>
      </section>

      {/* ============================ MySQL ============================ */}
      <section
        id="mysql"
        style={{
          paddingTop: space['3xl'],
          paddingBottom: space['3xl'],
          background: colors.bgSoft,
          borderBottom: `1px solid ${colors.borderSubtle}`
        }}
      >
        <Container>
          <div style={{ maxWidth: '64ch', marginBottom: space.xl }}>
            <HudLabel tone="magenta">Tested against a real database</HudLabel>
            <h2 style={sectionTitleStyle}>
              The docs say one thing. The server does another.
            </h2>
            <Prose>
              <p>
                The course teaches generic SQL, and its answers are correct
                as SQL. I also run everything I practice on a local MySQL
                8.4 server, and several of the answers behave differently
                there. I checked each of these on the server instead of
                trusting memory.
              </p>
              <p>
                The tool still grades you against the course&apos;s own
                syntax, because that is what the exams use. The Reference
                tab keeps the MySQL notes separate, for when you are
                running queries in Workbench.
              </p>
            </Prose>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 1fr)',
              gap: space['2xl'],
              alignItems: 'start'
            }}
            className="cs330-code-grid"
          >
            <div
              style={{
                display: 'grid',
                gap: space.md,
                gridTemplateColumns: '1fr'
              }}
            >
              {MYSQL_FINDINGS.map((f) => (
                <Card key={f.title} padding={space.md}>
                  <h3
                    style={{
                      fontFamily: fonts.heading,
                      fontSize: fontSizes.base,
                      fontWeight: fontWeights.semibold,
                      margin: 0,
                      color: colors.text
                    }}
                  >
                    {f.title}
                  </h3>
                  <p
                    style={{
                      margin: `${space.xs} 0 0`,
                      fontSize: fontSizes.sm,
                      color: colors.textSecondary,
                      lineHeight: 1.6
                    }}
                  >
                    {f.body}
                  </p>
                </Card>
              ))}
            </div>
            <div style={{ minWidth: 0 }}>
              <CodePanel
                filename="foreign_key.sql"
                language="js"
                code={MYSQL_CODE}
                status="VERIFIED"
                maxHeight="460px"
              />
            </div>
          </div>
        </Container>
      </section>

      {/* ============================ How it runs ============================ */}
      <section
        id="runs"
        style={{
          paddingTop: space['3xl'],
          paddingBottom: space['3xl'],
          borderBottom: `1px solid ${colors.borderSubtle}`
        }}
      >
        <Container>
          <div style={{ maxWidth: '64ch' }}>
            <HudLabel tone="corona">How it runs</HudLabel>
            <h2 style={sectionTitleStyle}>
              Static files. No backend, no account.
            </h2>
            <Prose>
              <p>
                The whole tool is vanilla JavaScript plus one small
                library (<code style={inlineCodeStyle}>marked</code>) for
                rendering the course&apos;s markdown. It makes no network
                requests, so nothing about your answers goes anywhere.
                Progress is saved in your browser, and Settings can export
                it as a file and import it back.
              </p>
              <p>
                It also has a timed mock exam. You answer a mixed sheet,
                the choice questions are graded for you, you mark the
                written ones against the key, and it keeps your scores as
                a history without touching your mastery progress.
              </p>
            </Prose>
            <div style={{ marginTop: space.lg }}>
              <Button as="a" href="/cs330/" size="md">
                Open the live build →
              </Button>
            </div>
            <p
              style={{
                margin: `${space.md} 0 0`,
                fontSize: fontSizes.sm,
                color: colors.textMuted,
                lineHeight: 1.6
              }}
            >
              The live build at <code style={inlineCodeStyle}>/cs330/</code>{' '}
              is the same tool with this site&apos;s corona palette and a
              brand strip across the top.
            </p>
          </div>
        </Container>
      </section>

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
          <HudLabel tone="magenta">Work with me</HudLabel>
          <h2
            style={{
              fontFamily: fonts.heading,
              fontSize: fontSizes['2xl'],
              fontWeight: fontWeights.bold,
              margin: `${space.md} 0 ${space.md}`,
              color: colors.text
            }}
          >
            If your data model matters, let&apos;s talk.
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: fontSizes.md,
              color: colors.textSecondary,
              lineHeight: 1.6
            }}
          >
            I build small production systems end to end, and I care about
            the part that usually gets skipped: checking that the thing
            behaves the way the docs say it does. If you have a database
            that needs to hold up, I&apos;m happy to look at it.
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
            <Button as={Link} to="/contact" size="lg">
              Start a project →
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

const sectionTitleStyle = {
  fontFamily: fonts.heading,
  fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
  fontWeight: fontWeights.bold,
  lineHeight: 1.15,
  letterSpacing: '-0.015em',
  margin: `${space.md} 0 0`,
  color: colors.text
};

const proseListStyle = {
  margin: `${space.md} 0`,
  paddingLeft: space.lg,
  lineHeight: 1.7
};

const thStyle = {
  textAlign: 'left',
  padding: `${space.sm} ${space.md}`,
  borderBottom: `1px solid ${colors.border}`,
  fontWeight: fontWeights.semibold
};

const tdStyle = {
  padding: `${space.sm} ${space.md}`,
  borderBottom: `1px solid ${colors.borderSubtle}`,
  fontSize: fontSizes.sm
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
