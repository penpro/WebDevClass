// The judgement is the product.
//
// Standalone marketing page making the case that engineering judgement
// is what a client is actually paying for in an agent-assisted shop.
// Built around six concrete incidents from real projects (Penumbra
// Origins voxel game + the consulting work), each illustrating a
// specific failure mode of naive LLM-driven development that only
// gets caught by a developer who is reading the system rather than
// the snippet.

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
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import Stars from '../components/Stars.jsx';
import CornerBrackets from '../components/CornerBrackets.jsx';
import HudLabel from '../components/HudLabel.jsx';
import SectionRail from '../components/SectionRail.jsx';

const CAL_BOOKING_URL = 'https://cal.com/wesley-weaver-avi7mu/30min';

const SECTIONS = [
  { id: 'hero',      num: '00', label: 'Intro' },
  { id: 'incidents', num: '01', label: 'Incidents' },
  { id: 'adds',      num: '02', label: 'What I add' },
  { id: 'cta',       num: '03', label: 'Book' }
];

const INCIDENTS = [
  {
    eyebrow: 'Incident 01',
    tone: 'cyan',
    title: 'The fix that looked done but never ran.',
    body: `A flagged task: move the build-cancel refund logic out of a throwaway menu widget. Easy to implement, easy to mark complete. I have a rule that nothing is done until it's verified in the running game, so I ran it, and the refund spawned zero items. Digging in: the refund code spawned a world-actor class off each item's data, and not one of the two-hundred-plus items in the database actually set that field. Materials had been silently vanishing on every cancelled build, for every recipe, indefinitely. The model "completed the task." The engineering was finding out the task description and the real bug were two different things.`
  },
  {
    eyebrow: 'Incident 02',
    tone: 'magenta',
    title: 'The elegant fix that would have crashed the engine.',
    body: `A menu-input bug had a clean-sounding solution: classify menus by their input mode instead of by class. Tidy, correct-looking, and a stack-overflow waiting to happen, because the input-stub's own mode query calls back into the very function I was rewriting. Pattern-matching the fix ships an infinite recursion that takes the whole editor down. Understanding the call graph means you exclude the stub by class first, then probe the rest. You only catch that if you're reading the system, not the snippet.`
  },
  {
    eyebrow: 'Incident 03',
    tone: 'corona',
    title: 'Verified in isolation is not verified in play.',
    body: `I built a Crafting tab on a game project. I wired it to key 6. I wrote a screenshot harness that rendered it. I reported it as done and verified across multiple sessions. It was invisible in actual play, because the tab-bar header was a hardcoded list of five tabs and 6 and 7 never drew. My harness set the tab directly and drew it, so of course it looked fine. I never walked the path a real player takes: open the game, look at the tab bar, press a number. An LLM optimises for the verification it can run and presents that as confidence. The verification that actually matters is a human pressing keys in the real build, and that one I structurally can't do.`
  },
  {
    eyebrow: 'Incident 04',
    tone: 'cyan',
    title: 'The test result I refused to trust.',
    body: `After a pure logging change, a menu-cycle test went from green to failing. The lazy reactions are both wrong: panic-revert a correct change, or "fix" it by sprinkling delays until it passes. A logging edit cannot alter menu logic, so the test was lying, not the code. I traced it to an artefact in the test harness itself: a rapid open/close pattern that desynced and poisoned later runs. Proved it by clearing the stuck state directly, then confirmed the real behaviour was fine with a clean run. The call was to debug the cause, not silence the symptom.`
  },
  {
    eyebrow: 'Incident 05',
    tone: 'magenta',
    title: 'A cook failure that wasn’t a code bug.',
    body: `A package failed at the end with a vague "unknown cook failure" that mentioned a thermal component. Hand that to a model and it will happily start editing C++ for a thermal class that no longer exists. The actual cause was content, not code: an orphaned UI asset whose parent class had been deleted, plus a dangling reference buried in another widget's animation data. Knowing that a cook failure with no compiler error is almost always a Blueprint or asset problem, and that it's an editor fix not a code one, saved a hunt in entirely the wrong file.`
  },
  {
    eyebrow: 'Incident 06',
    tone: 'corona',
    title: 'Works in the editor is not works in the build.',
    body: `World generation respected the player's seed perfectly in the editor and silently ignored it in the packaged game. Nothing in the code looked wrong. The fix lived in plugin internals and in a divergence the model has no reason to know exists: the voxel world auto-instantiating differently in a cooked build, requiring the seed to be forced through a specific override path before generation. The model optimises for "compiles and runs here." A developer remembers that here and shipped are different machines.`
  },
  {
    eyebrow: 'Incident 07',
    tone: 'cyan',
    title: 'Knowing which fix not to make.',
    body: `The most senior call is usually a no. An audit flagged a key-rebinding bug I could have closed in five minutes, and I deliberately left it open. The only honest way to verify a rebinding change is to exercise the live input system; my test harness can't reach that path; shipping an unverified change to something that can break all input is precisely the carelessness that gives AI-assisted work its bad name. Same instinct, one level up, in the architecture: the reflex of the model is to either reinvent what the engine already does well or cram everything into a heavyweight framework that doesn't fit. So the rule on this project is explicit about both: move the UI onto the engine's native system, and keep persistence and the medical simulation deliberately custom, because the native equivalents genuinely don't survive a shipped build or are wrong for the problem. Restraint isn't slower. It's the part that keeps the project shippable.`
  }
];

const ADDS = [
  {
    title: 'Verification at the level that matters',
    body:
      'Compile-passes, unit-test-greens, and synthetic renders are the verification an LLM can run. The verification a buyer actually pays for is a human walking the user path on a real build. That gap is where shipped bugs live.'
  },
  {
    title: 'Architectural stewardship',
    body:
      'An LLM cheerfully bolts the two-hundredth feature onto a structure that should have been split a hundred features ago. The instinct to stop and say "we are painting ourselves into a corner" is human, and someone has to have it.'
  },
  {
    title: 'Taste, including the taste to throw work away',
    body:
      'When a "nice realism feature" breaks the survival loop, the right move is to delete the feature, not to patch around it. The model’s instinct is to keep the work. Knowing which work to throw away is the part that doesn’t come in the box.'
  },
  {
    title: 'The harness that makes the model trustworthy',
    body:
      'The LLM does its best work inside a discipline framework: drive the real input path, assert observable outcomes, treat "tests green but feature invisible" as a failure mode. That framework is engineering work in its own right. Without it, you get a confident pile of green checkmarks sitting on top of an invisible feature.'
  }
];

export default function Judgment() {
  return (
    <>
      <SectionRail sections={SECTIONS} />

      {/* =============================== Hero =============================== */}
      <section
        id="hero"
        style={{
          position: 'relative',
          overflow: 'hidden',
          paddingTop: space['3xl'],
          paddingBottom: space['2xl'],
          borderBottom: `1px solid ${colors.borderSubtle}`
        }}
      >
        <Stars density={120} heroDensity={14} colorTint="mixed" />
        <CornerBrackets size={28} inset={24} />
        <Container narrow style={{ position: 'relative', zIndex: 1 }}>
          <HudLabel tone="magenta">Engineering judgement</HudLabel>
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
            The judgement is the product.
          </h1>
          <p
            style={{
              margin: 0,
              maxWidth: '60ch',
              fontSize: fontSizes.lg,
              color: colors.textSecondary,
              lineHeight: 1.55
            }}
          >
            An LLM is the fastest junior engineer you will ever hire. It is
            also never unsure. That second trait is the catch.
          </p>
          <p
            style={{
              margin: `${space.md} 0 0`,
              maxWidth: '64ch',
              fontSize: fontSizes.md,
              color: colors.textSecondary,
              lineHeight: 1.6
            }}
          >
            Vibe coding (take the plausible output, run it once, move on)
            gets you to a demo. It does not get you to a build that ships,
            survives a save-format change, and still runs in eighteen
            months. The distance between those two is filled with
            engineering judgement, and on a real project it gets exercised
            constantly. Below: real calls, on real projects, where
            accepting the model&apos;s first answer would have shipped a
            bug, a crash, or a wasted afternoon.
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
              href={CAL_BOOKING_URL}
              target="_blank"
              rel="noreferrer noopener"
            >
              Book a 30-min intro →
            </Button>
            <Button as={Link} to="/projects/metaverse-origins" variant="secondary">
              See the harness in detail
            </Button>
          </div>
        </Container>
      </section>

      {/* ============================ Incidents ============================ */}
      <section
        id="incidents"
        style={{
          paddingTop: space['3xl'],
          paddingBottom: space['3xl']
        }}
      >
        <Container narrow>
          <HudLabel tone="cyan">Seven incidents the model would have shipped</HudLabel>
          <h2
            style={{
              fontFamily: fonts.heading,
              fontSize: fontSizes['2xl'],
              fontWeight: fontWeights.bold,
              color: colors.text,
              letterSpacing: '-0.015em',
              margin: `${space.md} 0 ${space['2xl']}`
            }}
          >
            What the model gets confidently wrong.
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: space.lg }}>
            {INCIDENTS.map((inc) => (
              <Card key={inc.title} variant="accent" padding={space.lg}>
                <span
                  style={{
                    fontFamily: fonts.mono,
                    fontSize: fontSizes.xs,
                    color:
                      inc.tone === 'magenta'
                        ? colors.magenta
                        : inc.tone === 'corona'
                        ? colors.accent
                        : colors.cyan,
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em'
                  }}
                >
                  {inc.eyebrow}
                </span>
                <h3
                  style={{
                    fontFamily: fonts.heading,
                    fontSize: fontSizes.lg,
                    fontWeight: fontWeights.semibold,
                    color: colors.text,
                    margin: `${space.xs} 0 ${space.sm}`,
                    letterSpacing: '-0.005em'
                  }}
                >
                  {inc.title}
                </h3>
                <p
                  style={{
                    margin: 0,
                    color: colors.textSecondary,
                    fontSize: fontSizes.md,
                    lineHeight: 1.7
                  }}
                >
                  {inc.body}
                </p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* ====================== What the engineer adds ====================== */}
      <section
        id="adds"
        style={{
          paddingTop: space['3xl'],
          paddingBottom: space['3xl'],
          background: colors.surface,
          borderTop: `1px solid ${colors.border}`,
          borderBottom: `1px solid ${colors.border}`
        }}
      >
        <Container narrow>
          <HudLabel tone="corona">What an engineer actually adds</HudLabel>
          <h2
            style={{
              fontFamily: fonts.heading,
              fontSize: fontSizes['2xl'],
              fontWeight: fontWeights.bold,
              color: colors.text,
              letterSpacing: '-0.015em',
              margin: `${space.md} 0 ${space.xl}`
            }}
          >
            The model is leverage. The judgement is the product.
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: space.lg
            }}
          >
            {ADDS.map((item) => (
              <Card key={item.title} padding={space.lg}>
                <h3
                  style={{
                    fontFamily: fonts.heading,
                    fontSize: fontSizes.md,
                    fontWeight: fontWeights.semibold,
                    color: colors.text,
                    margin: 0,
                    marginBottom: space.sm,
                    letterSpacing: '-0.005em'
                  }}
                >
                  {item.title}
                </h3>
                <p
                  style={{
                    margin: 0,
                    color: colors.textSecondary,
                    fontSize: fontSizes.sm,
                    lineHeight: 1.65
                  }}
                >
                  {item.body}
                </p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* =========================== Closing CTA =========================== */}
      <section
        id="cta"
        style={{
          paddingTop: space['3xl'],
          paddingBottom: space['3xl']
        }}
      >
        <Container narrow style={{ textAlign: 'center' }}>
          <HudLabel tone="magenta">Hire the judgement</HudLabel>
          <h2
            style={{
              fontFamily: fonts.heading,
              fontSize: fontSizes['2xl'],
              fontWeight: fontWeights.bold,
              color: colors.text,
              margin: `${space.md} 0 ${space.md}`,
              letterSpacing: '-0.015em'
            }}
          >
            Anyone can prompt a model. Pay for the person who knows where it&apos;s wrong.
          </h2>
          <p
            style={{
              margin: `0 auto`,
              maxWidth: '60ch',
              fontSize: fontSizes.md,
              color: colors.textSecondary,
              lineHeight: 1.65
            }}
          >
            None of the above is an argument against the tools. I use them
            harder than most, and the volume of work that&apos;s possible
            with them is genuinely new. It is an argument about where the
            value actually sits. The LLM writes fast. Knowing which of its
            answers you&apos;re not allowed to trust yet, that&apos;s the
            job, and it doesn&apos;t come in the box.
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
              href={CAL_BOOKING_URL}
              target="_blank"
              rel="noreferrer noopener"
              size="lg"
            >
              Book a 30-min intro →
            </Button>
            <Button as={Link} to="/contact" variant="secondary" size="lg">
              Send a written brief
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
