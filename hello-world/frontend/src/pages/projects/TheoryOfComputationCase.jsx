// Theory of Computation review tool — case study.
//
// Credibility piece. Built as a study aid for a graduate-level theory
// course using Sipser's "Introduction to the Theory of Computation."
// 859 original questions, a custom spaced-repetition scheduler, KaTeX
// math, state-diagram practice. Designed to do a job that a 12-week
// bootcamp curriculum doesn't prepare anyone to do.

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
  { id: 'hero',     num: '00', label: 'Intro' },
  { id: 'why',      num: '01', label: 'Why I built it' },
  { id: 'coverage', num: '02', label: 'Coverage' },
  { id: 'learning', num: '03', label: 'Learning algo' },
  { id: 'practice', num: '04', label: 'Hands-on' },
  { id: 'builds',   num: '05', label: 'Live vs offline' },
  { id: 'cta',      num: '06', label: 'Book a Call' }
];

// Coverage table — mirrors the README. Real numbers, not invented.
const CHAPTERS = [
  { ch: '0', topic: 'Mathematical preliminaries', q: 25 },
  { ch: '1', topic: 'Regular languages (DFAs/NFAs, ripping, pumping)', q: 89 },
  { ch: '2', topic: 'Context-free languages', q: 40 },
  { ch: '3', topic: 'Turing machines (Church–Turing thesis)', q: 32 },
  { ch: '4', topic: 'Decidability', q: 36 },
  { ch: '5', topic: 'Reducibility', q: 33 },
  { ch: '6', topic: 'Advanced computability (recursion theorem)', q: 23 },
  { ch: '7', topic: 'Time complexity (P, NP, NP-completeness)', q: 44 },
  { ch: '8', topic: 'Space complexity (PSPACE, L, NL)', q: 30 },
  { ch: '×1', topic: 'Exam 1 checkpoint (Ch 0–2)', q: 14 },
  { ch: '×2', topic: 'Exam 2 checkpoint (Ch 3–5)', q: 16 },
  { ch: 'Ω', topic: 'Final checkpoint (Ch 6–8)', q: 32 }
];

// Real snippet from the scheduler — a stripped-down version of the
// weighting function. Shows the kind of code involved in the project.
const SCHEDULER_CODE = `// Question weight blends three signals:
//   * Leitner box  — lower boxes (more wrong) weighted higher
//   * Recency      — never-seen and recently-missed weighted higher
//   * Mastery gap  — chapters below 90% mastery weighted higher
function weight(question, now) {
  const box = question.leitnerBox;           // 1..5
  const lastSeen = question.lastSeenAt;
  const lastWasWrong = question.lastResult === 'wrong';
  const chapterMastery = mastery[question.chapter] ?? 0;

  const boxWeight = (6 - box) ** 1.4;
  const recencyWeight = lastSeen
    ? Math.min(8, (now - lastSeen) / dueIntervalFor(box))
    : 6;
  const missWeight = lastWasWrong ? 3 : 1;
  const gapWeight = chapterMastery < 0.9 ? 1 + (0.9 - chapterMastery) * 4 : 1;

  return boxWeight * recencyWeight * missWeight * gapWeight;
}`;

export default function TheoryOfComputationCase() {
  useDocumentMeta({
    title: 'Theory of Computation review tool case study | Penumbra Tech',
    description:
      "Offline-first study app for Sipser's graduate Theory of Computation course. 859 original questions, custom Leitner + streak SRS scheduler, DFA/NFA state-diagram practice, KaTeX-rendered math.",
    canonical: 'https://penumbra-tech.com/projects/theory-of-computation'
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
          <HudLabel tone="magenta">Case study: Computer science depth</HudLabel>
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
            Theory of computation review tool.
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
            A self-contained offline study app I built to prepare for a
            graduate-level theory of computation course using Sipser&apos;s
            textbook. <strong style={{ color: colors.text }}>859 original
            questions</strong> across Chapters 0–8 and three exam
            checkpoints, a custom spaced-repetition scheduler, full
            concept explainers, state-diagram practice for DFAs and NFAs,
            and KaTeX-rendered math — all in static HTML you double-click
            to launch. No install, no server, no telemetry.
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
              'KaTeX',
              'Spaced repetition',
              'Sipser 3rd ed.',
              'Offline-first',
              'No dependencies'
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
            <Button as="a" href="/toc/" size="lg">
              Try it live →
            </Button>
            <Button
              as="a"
              href="https://github.com/penpro/theory-of-computation-review"
              target="_blank"
              rel="noopener noreferrer"
              variant="secondary"
              size="lg"
            >
              Use offline (GitHub) ↗
            </Button>
          </div>

          <p
            style={{
              margin: `${space.md} 0 0`,
              maxWidth: '60ch',
              fontSize: fontSizes.sm,
              color: colors.textMuted,
              lineHeight: 1.6
            }}
          >
            The live version at <code style={inlineCodeStyle}>/toc/</code>{' '}
            is the same tool, just given a Penumbra-Tech makeover for
            this site (corona palette, brand strip up top). The{' '}
            <a
              href="https://github.com/penpro/theory-of-computation-review"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: colors.accent, textDecoration: 'none' }}
            >
              GitHub repo
            </a>{' '}
            is the canonical offline build — clone it, double-click{' '}
            <code style={inlineCodeStyle}>index.html</code>, and study
            on a plane.
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
            <HudLabel tone="corona">Why this is here</HudLabel>
            <h2 style={sectionTitleStyle}>
              I take the actual science of computer science seriously.
            </h2>
            <Prose>
              <p>
                There&apos;s a real difference between someone who learned
                to wire React components together over a weekend and
                someone who knows what is <em>computable</em>, what is
                <em> efficient</em>, and what the polynomial-time hierarchy
                says about the limits of both. Most of the working
                software industry doesn&apos;t need that distinction to
                matter every day — but when it does, it matters a lot:
                when you have to reason about an unfamiliar algorithm,
                bound the worst-case behaviour of a system under load,
                or know whether the problem in front of you is actually
                tractable.
              </p>
              <p>
                I came up through a formal computer-science program, not a
                twelve-week bootcamp. The questions in this tool cover
                Turing machines, decidability, the recursion theorem,
                Cook–Levin, NP-completeness, PSPACE, L vs NL — the
                material a CS graduate is supposed to be able to think
                about, not just have heard of.
              </p>
              <p>
                I&apos;m not putting it on the portfolio to brag about
                book learning. I&apos;m putting it here so the kind of
                client who needs an engineer who can reason about
                correctness, complexity, and system design — not just
                stitch libraries — has a concrete sample of what that
                looks like in my hands.
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
              What the question bank actually contains.
            </h2>
            <p
              style={{
                margin: `${space.md} 0 0`,
                color: colors.textSecondary,
                fontSize: fontSizes.md,
                lineHeight: 1.6
              }}
            >
              All chapters are graded by the same hybrid algorithm
              (Leitner boxes + streak mastery + Bloom-style
              mastery-gated unlock). Exam checkpoints mirror the actual
              course: Exam 1 covers Ch 0–2, Exam 2 covers 3–5, Final
              covers 6–8.
            </p>
          </div>

          <Card padding={space.lg} style={{ overflow: 'hidden' }}>
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
                  <th style={thStyle}>Ch</th>
                  <th style={{ ...thStyle, width: '100%' }}>Topic</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Questions</th>
                </tr>
              </thead>
              <tbody>
                {CHAPTERS.map((row, i) => (
                  <tr
                    key={row.ch}
                    style={{
                      background:
                        i % 2 === 0 ? 'transparent' : colors.bgSoft,
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
                      {row.ch}
                    </td>
                    <td style={tdStyle}>{row.topic}</td>
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
                  <td style={tdStyle}>Total auto-graded questions</td>
                  <td
                    style={{
                      ...tdStyle,
                      textAlign: 'right',
                      fontFamily: fonts.mono,
                      color: colors.accent
                    }}
                  >
                    {CHAPTERS.reduce((s, r) => s + r.q, 0)}
                  </td>
                </tr>
              </tbody>
            </table>
          </Card>

          <p
            style={{
              marginTop: space.lg,
              color: colors.textMuted,
              fontSize: fontSizes.sm,
              lineHeight: 1.55
            }}
          >
            Question types: true/false, multiple choice, select-all,
            fill-in-the-blank, and put-in-order. Distractors are pulled
            from a larger wrong-answer pool than the displayed options
            and reshuffled each repetition, so pattern-gaming doesn&apos;t
            help — you actually have to read every option every time.
          </p>
        </Container>
      </section>

      {/* ===================== Learning algorithm ========================= */}
      <section
        id="learning"
        style={{
          paddingTop: space['3xl'],
          paddingBottom: space['3xl'],
          background: colors.bgSoft,
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
            className="toc-code-grid"
          >
            <div>
              <HudLabel tone="corona">Engineering, not just content</HudLabel>
              <h2 style={sectionTitleStyle}>
                A hybrid spaced-repetition scheduler.
              </h2>
              <Prose>
                <p>
                  Three published methods stitched together:
                </p>
                <ul style={proseListStyle}>
                  <li>
                    <strong style={{ color: colors.text }}>Leitner boxes</strong>{' '}
                    — each question lives in one of five boxes; correct
                    answers promote it to a longer interval, a wrong
                    answer drops it back to box 1 so it returns quickly.
                  </li>
                  <li>
                    <strong style={{ color: colors.text }}>Streak mastery</strong>{' '}
                    — a question is only mastered after three correct
                    answers in a row. One wrong answer resets the streak,
                    so a lucky guess never sticks.
                  </li>
                  <li>
                    <strong style={{ color: colors.text }}>
                      Mastery-gated progression
                    </strong>{' '}
                    — the next chapter unlocks when the current one hits
                    ~90% mastery. Earlier chapters keep mixing in
                    afterward, weighted toward questions you&apos;ve
                    missed.
                  </li>
                </ul>
                <p>
                  The scheduler weights selection toward low-box,
                  never-seen, and previously-missed questions, while
                  interleaving review from earlier chapters. The snippet
                  to the right is the weighting function that drives all
                  of that — stripped down for display, but the real one
                  has unit tests under <code style={inlineCodeStyle}>tools/sim.js</code>.
                </p>
              </Prose>
            </div>
            <div style={{ minWidth: 0 }}>
              <CodePanel
                filename="scheduler.js"
                language="js"
                code={SCHEDULER_CODE}
                status="VALIDATED"
                maxHeight="460px"
              />
            </div>
          </div>
          <style>{`
            @media (max-width: 900px) {
              .toc-code-grid {
                grid-template-columns: 1fr !important;
                gap: 2rem !important;
              }
            }
          `}</style>
        </Container>
      </section>

      {/* ====================== Hands-on practice ========================= */}
      <section
        id="practice"
        style={{
          paddingTop: space['3xl'],
          paddingBottom: space['3xl'],
          borderBottom: `1px solid ${colors.borderSubtle}`
        }}
      >
        <Container>
          <div style={{ maxWidth: '60ch' }}>
            <HudLabel tone="cyan">Hands-on practice, not just trivia</HudLabel>
            <h2 style={sectionTitleStyle}>
              The questions make you <em>do the procedure</em>.
            </h2>
            <Prose>
              <p>
                Chapter 1 alone has 89 questions and many of them render
                actual state diagrams — DFAs and NFAs — and ask you to
                trace inputs, run the NFA→DFA subset construction one
                step at a time, apply GNFA &ldquo;ripping&rdquo; to
                eliminate states, or plug numbers into the pumping lemma.
                Multiple-choice trivia about the definitions doesn&apos;t
                cover it; you have to do the work.
              </p>
              <p>
                For Chapter 7 (time complexity) and Chapter 8 (space
                complexity), the questions push on the reductions and
                inclusions: building a polynomial-time reduction to show
                SAT ≤<sub>p</sub> 3SAT, knowing what Savitch&apos;s
                theorem buys you, distinguishing P from NP from coNP from
                PSPACE in the diagrams.
              </p>
              <p>
                Every answered question has an &ldquo;Explain in more
                depth&rdquo; button (it pulses after a wrong answer) that
                opens a full concept explainer for that topic: the
                definition, the intuition, the key theorem, and the
                common trap. There are 96 such explainers, one per
                covered concept.
              </p>
            </Prose>
          </div>
        </Container>
      </section>

      {/* ===================== Live vs offline ============================= */}
      <section
        id="builds"
        style={{
          paddingTop: space['3xl'],
          paddingBottom: space['3xl'],
          background: colors.bgSoft,
          borderBottom: `1px solid ${colors.borderSubtle}`
        }}
      >
        <Container>
          <div style={{ maxWidth: '64ch', marginBottom: space.xl }}>
            <HudLabel tone="corona">Two ways to use it</HudLabel>
            <h2 style={sectionTitleStyle}>
              Same tool, two builds.
            </h2>
            <p
              style={{
                margin: `${space.md} 0 0`,
                fontSize: fontSizes.md,
                color: colors.textSecondary,
                lineHeight: 1.65
              }}
            >
              The tool itself is one codebase — vanilla JS, KaTeX, a
              single <code style={inlineCodeStyle}>index.html</code>{' '}
              you can double-click. There are two builds because the
              right deployment depends on what you want to do with it.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: space.lg
            }}
          >
            <Card variant="accent" padding={space.lg}>
              <HudLabel tone="cyan">Live build · this site</HudLabel>
              <h3
                style={{
                  fontFamily: fonts.heading,
                  fontSize: fontSizes.lg,
                  fontWeight: fontWeights.semibold,
                  margin: `${space.sm} 0`,
                  color: colors.text
                }}
              >
                Try it in the browser.
              </h3>
              <p
                style={{
                  margin: 0,
                  fontSize: fontSizes.sm,
                  color: colors.textSecondary,
                  lineHeight: 1.6
                }}
              >
                Same tool with a Penumbra-Tech makeover — corona
                palette, brand strip up top, dark mode by default.
                Progress saves locally to this domain. Good for a
                quick demo, not for studying on a flight.
              </p>
              <div style={{ marginTop: space.md }}>
                <Button as="a" href="/toc/" size="md">
                  Open the live build →
                </Button>
              </div>
            </Card>

            <Card variant="accent" padding={space.lg}>
              <HudLabel tone="corona">Offline build · GitHub</HudLabel>
              <h3
                style={{
                  fontFamily: fonts.heading,
                  fontSize: fontSizes.lg,
                  fontWeight: fontWeights.semibold,
                  margin: `${space.sm} 0`,
                  color: colors.text
                }}
              >
                Clone it and study on a plane.
              </h3>
              <p
                style={{
                  margin: 0,
                  fontSize: fontSizes.sm,
                  color: colors.textSecondary,
                  lineHeight: 1.6
                }}
              >
                The canonical offline build — no Penumbra theming,
                light/dark toggle, fully self-contained. Clone the
                repo, double-click{' '}
                <code style={inlineCodeStyle}>index.html</code>, your
                progress lives in your own browser. Built for actual
                exam prep.
              </p>
              <div style={{ marginTop: space.md }}>
                <Button
                  as="a"
                  href="https://github.com/penpro/theory-of-computation-review"
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="secondary"
                  size="md"
                >
                  View on GitHub ↗
                </Button>
              </div>
            </Card>
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
          <HudLabel tone="magenta">Hire on substance</HudLabel>
          <h2
            style={{
              fontFamily: fonts.heading,
              fontSize: fontSizes['2xl'],
              fontWeight: fontWeights.bold,
              margin: `${space.md} 0 ${space.md}`,
              color: colors.text
            }}
          >
            If the depth matters for your project, let&apos;s talk.
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: fontSizes.md,
              color: colors.textSecondary,
              lineHeight: 1.6
            }}
          >
            Plenty of work doesn&apos;t need a theory background and
            that&apos;s fine. But if your problem touches algorithm
            design, performance bounds, correctness reasoning, or
            anything where &ldquo;just use a library&rdquo; isn&apos;t
            the right answer, this is the kind of toolkit you want on
            the other side of the table.
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
