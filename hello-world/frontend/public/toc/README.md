# Theory of Computation — Final Review

A self-contained, offline study app for Sipser's *Introduction to the Theory of
Computation* (3rd ed.), covering everything in the course: **Chapters 0–8** plus
three **exam checkpoints**. **670+ auto-graded questions** with instant feedback,
a deeper "explain this" on every question, spaced repetition, per-chapter mastery
tracking, and a **difficulty ramp** that eases you in from plain-language basics.

## How to run

**Just double-click `index.html`.** It opens in your browser, works fully
offline, and saves your progress locally — no install, no server. Chrome, Edge,
and Firefox all save progress for files opened this way.

If you ever see a banner at the top saying your browser **isn't saving progress**
(a few browser configs block storage for files opened directly — the Settings
page also shows whether saving is on), you have two options:
- Use **Export / Import** in Settings to back up and restore your progress, or
- Double-click **`Start Review.cmd`** to serve the folder locally (opens
  `http://localhost:8137/`). Keep the small black window open while you study;
  close it to stop. Needs Python.

Nothing goes online — math is rendered with a bundled copy of KaTeX.

## How to use it

- **Study** — the app picks questions for you. Answer, get instant feedback with
  an explanation and the Sipser source, press **Enter** (or **Next**) to continue.
  Keyboard: `1`–`9` choose an option, `T`/`F` for true/false, `Enter` to submit
  then advance, `E` to explain deeper.
- **"I don't get it — explain in more depth"** — every answered question has this
  button (it pulses after a wrong answer). It opens a full concept explainer for
  that topic: the definition, the intuition, the key theorem, and the common trap.
- **No pattern-gaming** — multiple-choice options are reshuffled every time, and most
  questions draw from a larger pool of wrong answers than are shown, so the option
  *set* (not just its order) changes between repetitions. You have to read them.
- **Eases you in (difficulty ramp)** — each chapter starts with plain-language **Basics**
  ("what is NSPACE? what is a reduction? what is TQBF?"); harder questions unlock only
  once you've got the basics down. The badge on each card shows its level (**Basics →
  Easy → Core → Harder → Challenge**). Turn the ramp off in **Settings** to see all
  difficulties at once.
- **Diagrams & hands-on practice** — many Ch 1 questions show actual **state diagrams**
  (DFAs/NFAs) and have you *do the procedure*: read/trace a machine, run the NFA→DFA
  subset construction step by step, apply GNFA "ripping," or plug numbers into the
  pumping lemma.
- **Numbers, flagging & jumping** — every question shows a number like **#142**. Click
  the **🚩** to flag one for help — flagged questions collect on the **Dashboard** (and
  you can tell me "help with #142"). Use the **Go to #** box to jump straight to any
  question.
- **Unlock anything for focused study** — in Guided mode, locked chapters/checkpoints
  show a **🔓 Unlock** button on the Dashboard. Use it to open the **Final Prep** bucket
  (Ch 7–8 + the assigned problems) — or Ch 7/Ch 8 directly — without finishing earlier
  chapters. Unlocking one thing doesn't unlock the rest; re-lock from the same card.
- **Focus** — let it run on **Auto** (it follows your weakest unlocked chapter and
  mixes in review), or pick a specific chapter from the dropdown. **Exam checkpoints**
  (Exam 1 / Exam 2 / Final) are listed separately and are only served when you
  pick them — they never interrupt normal chapter study.
- **Dashboard** — mastery bars per chapter, what's locked/unlocked, overall
  progress, accuracy, and your weakest topics.
- **Settings** — switch between **Guided** (chapters unlock in order) and **Free
  practice** (everything open — good for targeted cramming), tune the mastery
  rules, and **export/import** your progress as a backup.

## How the learning algorithm works

A hybrid of three well-known methods:

- **Leitner boxes** — each question lives in a box; correct answers promote it to a
  longer interval, a wrong answer drops it back to box 1 so it returns quickly.
- **Streak mastery** — a question is only **mastered after 3 correct answers in a
  row** (tunable). One wrong answer resets the streak, so a lucky guess never
  sticks — every question effectively gets asked at least 3 times.
- **Mastery-gated progression (Bloom)** — the next chapter unlocks when the current
  one reaches **~90% mastery** (tunable). Earlier chapters keep mixing in
  afterward, weighted toward questions you've missed.

The scheduler weights selection toward low-box, never-seen, and
previously-missed questions, while interleaving review from earlier chapters.

## Coverage

| Chapter | Topic | Questions |
|---|---|---|
| 0 | Mathematical preliminaries | 25 |
| 1 | Regular languages (definitions, diagrams, NFA→DFA, ripping, pumping) | 89 |
| 2 | Context-free languages | 40 |
| 3 | Turing machines (Church–Turing) | 32 |
| 4 | Decidability | 36 |
| 5 | Reducibility | 33 |
| 6 | Advanced computability (recursion theorem) | 23 |
| 7 | Time complexity (P, NP) | 44 |
| 8 | Space complexity | 30 |
| Exam 1 | Checkpoint over Ch 0–2 (past Exam 1 + review) | 14 |
| Exam 2 | Checkpoint over Ch 3–5 (past Exam 2 + decidability prep) | 16 |
| Final | Checkpoint over Ch 6–8 (final-exam scope) | 32 |

Question types: true/false, multiple choice, select-all, fill-in-the-blank, and
put-in-order. Each topic also has a deeper concept explainer behind the "Explain
this" button (96 of them).

**Exam checkpoints** mirror the real course: Exam 1 covers Chapters 0–2, Exam 2
covers 3–5, and the Final covers 6–8. In Guided mode each one unlocks when you've
mastered the chapters it covers.

## Adding or fixing questions

Questions live in `js/questions/chN.js` (and `exam1.js`, `exam2.js`, `final.js`),
one `TOC.addQuestions([...])` call per file. Deeper explainers live in
`js/concepts/chN.js` (`TOC.addConcepts({...})`, keyed `"<chapter>::<topic>"`). Extra
multiple-choice distractors live in `js/pools/chN.js` (`TOC.addPools({"<qid>": [...]})`).
The schema and KaTeX rules are in `tools/AUTHORING-GUIDE.md`. After editing, validate:

```
node tools/validate.js           # all question files
node tools/validate.js 4         # just chapter 4
node tools/validate-concepts.js  # concept explainers + coverage
node tools/validate-pools.js     # distractor pools (and no distractor == a correct answer)
```

These check the schema, answer ranges, balanced math delimiters, and (using the
bundled KaTeX) that every formula actually parses. `node tools/sim.js` runs the
scheduler/mastery/gating unit tests.

*Question bank drafted from the Sipser text and your exam materials. If any
keyed answer looks wrong, tell me the question and I'll fix it.*

## Credits

- Math is rendered with **[KaTeX](https://katex.org/)**, bundled offline in
  [`vendor/katex/`](vendor/katex/). KaTeX is © 2013–2020 Khan Academy and other
  contributors, released under the MIT License — see
  [`vendor/katex/LICENSE`](vendor/katex/LICENSE).
- Content is a study aid based on Michael Sipser, *Introduction to the Theory of
  Computation* (3rd ed.); the questions are original concept-checks for personal
  review and are not affiliated with or endorsed by the author or publisher.
