# Question authoring guide (read this fully before writing any questions)

You are writing a JavaScript question file for an offline Theory-of-Computation
review app (Sipser, *Introduction to the Theory of Computation*, 3rd ed.). Every
question is auto-graded and gives instant feedback, so each must have one
unambiguous, correct answer.

## File format

The file contains exactly one call:

```js
TOC.addQuestions([
  { /* question */ },
  { /* question */ }
]);
```

No `module.exports`, no `require`, no other top-level code. The registry
(`TOC.addQuestions`) is already loaded.

## Question schema

Common fields (all required unless noted):
- `id` — globally unique, lowercase kebab: `"ch4-atm-undecidable-03"`. Prefix with the chapter.
- `chapter` — integer (0–8, or 9 for the exam/review bucket).
- `topic` — short subtopic label, e.g. `"Pumping lemma"`, `"NP-completeness"`. Used for grouping/weak-spot stats — reuse consistent labels.
- `type` — one of `"tf" | "mc" | "multi" | "fib" | "order"`.
- `prompt` — the question text (math + minimal markdown — see below).
- `explanation` — 1–3 sentences that TEACH the answer. State the key fact and *why*. This is the main study payload.
- `source` — optional provenance, e.g. `"Sipser Thm 4.11"`, `"Def 1.5"`, `"Exercise 3.8"`, `"Exam 2 Q4"`.
- `difficulty` — optional 1 (recall) | 2 (apply) | 3 (synthesize).

Type-specific fields:
- `tf`    → `answer`: `true` | `false`.
- `mc`    → `choices`: array of 3–5 strings; `answer`: index of the correct choice (0-based).
- `multi` → `choices`: array; `answers`: array of correct indices (≥1; grading is all-or-nothing).
- `fib`   → `accept`: array of acceptable answer strings; optional `acceptRegex`: a regex source string.
- `order` → `items`: array of strings **in the correct order** (the app shuffles them for the user).

## Math (KaTeX) — critical rules

- Inline math: `\\( ... \\)`  Display math: `\\[ ... \\]`. (Double backslash because it's inside a JS string.)
- Put ALL symbols/notation in math: `\\(\\Sigma^*\\)`, `\\(a^i b^j c^k\\)`, `\\(\\overline{A_{TM}}\\)`, `\\(L(G)\\subseteq L(E)\\)`, `\\(\\varepsilon\\)`, `\\(\\delta\\)`, `\\(\\le_m\\)`, `\\(\\emptyset\\)`, `\\(M\\langle w\\rangle\\)` → use `\\langle M, w\\rangle`.
- Common tokens: `\\Sigma \\Gamma \\varepsilon \\delta \\emptyset \\cup \\cap \\times \\subseteq \\subsetneq \\in \\notin \\mid \\to \\Rightarrow \\Leftrightarrow \\le \\ge \\neq \\overline{X} \\langle \\rangle \\forall \\exists \\wedge \\vee \\neg`.
- Subscripted machine languages: write `A_{TM}`, `E_{CFG}`, `ALL_{CFG}`, `EQ_{DFA}`, `HALT_{TM}`.
- A literal dollar sign (e.g. PDA stack bottom) inside math is `\\$`.
- Every `\\(` needs a matching `\\)`, every `\\[` a matching `\\]`. Unbalanced delimiters fail validation.
- Minimal markdown also works in any text field: `**bold**`, `` `code` ``, and `\n` line breaks. Do NOT use single `*` for italics (it collides with Kleene star).

## Quality bar

- **Correct & unambiguous.** Ground every fact in the provided chapter text / standard Sipser content. If you are not sure a fact is standard and correct, do not write the question.
- **Distractors must be clearly wrong** to someone who knows the material, but plausible to someone who doesn't (common misconceptions make great distractors — e.g. "CFLs are closed under intersection").
- **`fib` only for short, unambiguous answers** (a single term, number, or canonical short phrase). Always include synonyms/variants in `accept` (e.g. `["nondeterministic","non-deterministic"]`, `["2^n","2^{n}"]`). Matching is case-insensitive, trims/collapses spaces, and ignores trailing punctuation. If an answer could be phrased many ways, use `mc` instead.
- **`order`** is great for processes: CNF conversion steps, NFA→DFA, the stages of a reduction, pumping-lemma proof structure.
- **`tf`** should target a specific misconception, not a vague generality. Prefer statements that are decisively true or false.
- Vary types across the file (rough mix: ~40% mc, ~20% tf, ~15% multi, ~15% fib, ~10% order) and spread across all subtopics in your checklist.
- Keep prompts self-contained. Define any machine/language you reference in the prompt itself.

## Example questions (study the style, then exceed it)

```js
{
  id: "ch1-closure-union-01", chapter: 1, topic: "Closure properties", type: "tf",
  prompt: "The class of regular languages is closed under union.",
  answer: true,
  explanation: "Given DFAs for \\(A\\) and \\(B\\), the product construction tracks both at once and accepts when either does. Sipser proves closure under \\(\\cup\\), concatenation, and star.",
  source: "Sipser Thm 1.25"
},
{
  id: "ch1-pumping-pick-01", chapter: 1, topic: "Pumping lemma", type: "mc",
  prompt: "To prove \\(L=\\{0^n1^n \\mid n\\ge 0\\}\\) is not regular with the pumping lemma, which string \\(s\\) is the standard choice (with pumping length \\(p\\))?",
  choices: ["\\(s=0^p1^p\\)", "\\(s=(01)^p\\)", "\\(s=0^p\\)", "\\(s=1^p0^p\\)"],
  answer: 0,
  explanation: "Choosing \\(s=0^p1^p\\) forces \\(xy\\) into the block of \\(0\\)s (since \\(|xy|\\le p\\)); pumping changes the count of \\(0\\)s but not \\(1\\)s, leaving the language.",
  source: "Sipser Ex 1.73"
},
{
  id: "ch2-cnf-order-01", chapter: 2, topic: "Chomsky normal form", type: "order",
  prompt: "Order the standard steps for converting a CFG to Chomsky normal form.",
  items: [
    "Add a new start variable \\(S_0\\) with \\(S_0\\to S\\)",
    "Remove \\(\\varepsilon\\)-rules \\(A\\to\\varepsilon\\)",
    "Remove unit rules \\(A\\to B\\)",
    "Replace long right-hand sides and isolate terminals"
  ],
  explanation: "Sipser's procedure: new start, then eliminate \\(\\varepsilon\\)-rules, then unit rules, then convert remaining rules to the two-variable / single-terminal forms.",
  source: "Sipser Thm 2.9"
}
```

## When done

1. Write the file to `js/questions/chN.js` (replace any placeholder entirely).
2. From the `review/` folder run: `node tools/validate.js N` and fix every error/warning it reports.
3. Report: how many questions, the type breakdown, the subtopics covered, and any question whose correctness you were unsure about (so it can be double-checked).
