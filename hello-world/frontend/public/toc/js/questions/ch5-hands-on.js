/* Chapter 5 — Reducibility, HANDS-ON (Sipser §5.1). A construction-first companion
   to ch5.js / ch5-defs.js: instead of "what is a reduction," these items walk the
   ACTUAL machine you build, step by step, and drill the direction (known-undecidable
   on the LEFT). Three "BUILD THE REDUCTION" discussions (A_TM ≤ HALT_TM, A_TM ≤ E_TM,
   A_TM ≤ REGULAR_TM); a computation-history pack (Def 5.5, Lemma 5.8, Thm 5.10 / 5.13)
   with a config "filmstrip" grid; and a reduction family-tree diagram.
   Visual conventions: diagram/grid labels are PLAIN UNICODE (#, Σ*, 0ⁿ1ⁿ), never
   KaTeX; KaTeX only in text/choice fields via \\( ... \\). */
TOC.addQuestions([

  /* =================================================================
     (A) BUILD THE REDUCTION — three guided constructions
     ================================================================= */

  /* ---- A1: A_TM ≤m HALT_TM (loop instead of reject) ---- */
  {
    id: "disc-ch5-build-halt", chapter: 5, topic: "Mapping reducibility", type: "discussion", rank: 34,
    prompt: "**BUILD THE REDUCTION: \\(A_{TM}\\le_m HALT_{TM}\\).** We want a computable map \\(f\\) that turns any instance \\(\\langle M,w\\rangle\\) of \\(A_{TM}\\) into an instance \\(\\langle M',w\\rangle\\) of the halting problem, so that **\\(M\\) accepts \\(w\\)** exactly when **\\(M'\\) halts on \\(w\\)**. Let's assemble \\(M'\\) one design decision at a time. (Recall \\(HALT_{TM}=\\{\\langle N,x\\rangle\\mid N\\text{ halts on }x\\}\\).)",
    steps: [
      { prompt: "The only difference between \"\\(M\\) **accepts** \\(w\\)\" and \"\\(M'\\) **halts** on \\(w\\)\" is the reject case: a rejecting \\(M\\) still halts. So we design \\(M'\\) to simulate \\(M\\) but sabotage exactly one outcome. What should \\(M'\\) do?", type: "mc",
        choices: [
          "Simulate \\(M\\) on \\(w\\); if \\(M\\) accepts, halt (accept); if \\(M\\) would reject, enter a deliberate infinite loop instead",
          "Simulate \\(M\\) on \\(w\\) and copy its answer exactly (accept stays accept, reject stays reject)",
          "Immediately halt on every input without simulating \\(M\\)",
          "Simulate \\(M\\) but swap accept and reject"
        ], answer: 0,
        explain: "Make \\(M'\\) **loop wherever \\(M\\) rejects**. Then the only way \\(M'\\) can halt is if \\(M\\) accepted. \\(M' = \\)\"on input \\(x\\): run \\(M\\) on \\(x\\); if \\(M\\) accepts, **accept**; if \\(M\\) rejects, **enter a loop**.\" (We feed \\(M'\\) the same \\(w\\).)" },
      { prompt: "Trace the two cases. If \\(M\\) **accepts** \\(w\\): \\(M'\\) accepts, hence halts. If \\(M\\) **rejects or loops** on \\(w\\): \\(M'\\) loops (either because we forced a loop on reject, or because \\(M\\) itself looped). So \\(M'\\) halts on \\(w\\) if and only if…", type: "mc",
        choices: [
          "\\(M\\) accepts \\(w\\)",
          "\\(M\\) rejects \\(w\\)",
          "\\(M\\) halts on \\(w\\) (accepts or rejects)",
          "always — \\(M'\\) halts on every input"
        ], answer: 0,
        explain: "\\(M'\\) halts on \\(w\\) \\(\\iff\\) \\(M\\) accepts \\(w\\). Reject and loop both collapse into \"\\(M'\\) loops,\" so halting is now a perfect proxy for acceptance. Thus \\(\\langle M,w\\rangle\\in A_{TM}\\iff\\langle M',w\\rangle\\in HALT_{TM}\\) — exactly the mapping-reduction condition." },
      { prompt: "Is the map \\(f(\\langle M,w\\rangle)=\\langle M',w\\rangle\\) actually **computable** — i.e., can an algorithm build \\(\\langle M'\\rangle\\) without ever running \\(M\\)?", type: "tf", answer: true,
        explain: "Yes. \\(f\\) just edits \\(M\\)'s description: keep all of \\(M\\), then redirect its reject transitions into a new 2-state \"spin forever\" gadget. That is pure syntactic surgery on \\(\\langle M\\rangle\\); **no simulation of \\(M\\) happens at reduction time**. A reduction must be a *total computable function*, and this one is." },
      { prompt: "Finally, why does this reduction prove \\(HALT_{TM}\\) is **undecidable** (rather than proving something about \\(A_{TM}\\))?", type: "mc",
        choices: [
          "Because the KNOWN-undecidable \\(A_{TM}\\) is on the LEFT: a decider for \\(HALT_{TM}\\) would compose with \\(f\\) to decide \\(A_{TM}\\), which is impossible",
          "Because \\(HALT_{TM}\\) is on the left, so it inherits undecidability from \\(A_{TM}\\)",
          "Because \\(f\\) is one-to-one",
          "Because \\(M'\\) has more states than \\(M\\)"
        ], answer: 0,
        explain: "Direction is everything. \\(A_{TM}\\le_m HALT_{TM}\\) says \\(A_{TM}\\) is **no harder than** \\(HALT_{TM}\\). If \\(HALT_{TM}\\) had a decider \\(R\\), then \"compute \\(f\\), run \\(R\\)\" would decide the undecidable \\(A_{TM}\\) — contradiction. The known monster must sit on the **left** of \\(\\le_m\\)." }
    ],
    explanation: "To reduce \\(A_{TM}\\) to \\(HALT_{TM}\\), map \\(\\langle M,w\\rangle\\) to \\(\\langle M',w\\rangle\\) where \\(M'\\) runs \\(M\\) but **loops in place of rejecting**. Now \\(M'\\) halts on \\(w\\) iff \\(M\\) accepts \\(w\\), so \\(\\langle M,w\\rangle\\in A_{TM}\\iff\\langle M',w\\rangle\\in HALT_{TM}\\). Building \\(\\langle M'\\rangle\\) is a computable edit of \\(\\langle M\\rangle\\), and with \\(A_{TM}\\) (known-undecidable) on the left, no decider for \\(HALT_{TM}\\) can exist.",
    whyMatters: "This is the cleanest reduction in the course and the template for all the others: change one behavior of \\(M\\) so that a *target* property (here, halting) becomes a faithful stand-in for *acceptance*. Master the \"loop instead of reject\" trick and the rest of §5.1 is variations on a theme.",
    realWorld: "The undecidability of halting is *why* no compiler, linter, or CI tool can flag every infinite loop in your code. The construction shows the obstruction is not a missing clever algorithm — acceptance and halting are inter-translatable, so a perfect loop-detector would also settle every \"does this program accept?\" question.",
    source: "Sipser Thm 5.1 (A_TM reduces to HALT_TM); Def 5.20 (mapping reducibility)"
  },

  /* ---- A2: A_TM ≤m E_TM (erase input, simulate M on w) ---- */
  {
    id: "disc-ch5-build-etm", chapter: 5, topic: "Famous undecidable problems", type: "discussion", rank: 35,
    prompt: "**BUILD THE REDUCTION: \\(A_{TM}\\le_m E_{TM}\\)**, where \\(E_{TM}=\\{\\langle N\\rangle\\mid L(N)=\\emptyset\\}\\). From \\(\\langle M,w\\rangle\\) we construct a single machine \\(M_1\\) whose **language is empty exactly when \\(M\\) does not accept \\(w\\)**. The move: hard-wire \\(w\\) into \\(M_1\\) and make \\(M_1\\) ignore its own input. Let's build it.",
    steps: [
      { prompt: "We want \\(L(M_1)\\) to depend only on the fixed question \"does \\(M\\) accept \\(w\\)?\", **not** on \\(M_1\\)'s actual input \\(x\\). What is the cleanest design for \\(M_1\\)?", type: "mc",
        choices: [
          "On input \\(x\\): ignore/erase \\(x\\), then run \\(M\\) on the built-in string \\(w\\); accept iff \\(M\\) accepts \\(w\\)",
          "On input \\(x\\): run \\(M\\) on \\(x\\); accept iff \\(M\\) accepts \\(x\\)",
          "On input \\(x\\): accept iff \\(x=w\\)",
          "On input \\(x\\): reject everything"
        ], answer: 0,
        explain: "Define \\(M_1=\\)\"on input \\(x\\): **erase \\(x\\)** (or simply disregard it), then simulate \\(M\\) on the hard-coded \\(w\\); accept if \\(M\\) accepts.\" Because \\(M_1\\) throws its input away, every \\(x\\) gets the **same verdict**, decided entirely by whether \\(M\\) accepts \\(w\\). (Sipser's \\(M_1\\) instead checks \\(x=w\\); erasing the input is the standard equivalent presentation.)" },
      { prompt: "Now read off \\(L(M_1)\\) in each case. If \\(M\\) **accepts** \\(w\\), then \\(M_1\\) accepts every \\(x\\), so \\(L(M_1)=\\Sigma^*\\). If \\(M\\) **does not accept** \\(w\\) (rejects or loops), what is \\(L(M_1)\\)?", type: "mc",
        choices: [
          "\\(\\emptyset\\) — \\(M_1\\) accepts nothing",
          "\\(\\Sigma^*\\) — \\(M_1\\) accepts everything",
          "\\(\\{w\\}\\) — \\(M_1\\) accepts only \\(w\\)",
          "\\(\\{\\varepsilon\\}\\) — \\(M_1\\) accepts only the empty string"
        ], answer: 0,
        explain: "If \\(M\\) fails on \\(w\\), the sub-simulation never accepts, so **no** \\(x\\) is ever accepted: \\(L(M_1)=\\emptyset\\). Summary: \\(L(M_1)=\\Sigma^*\\) when \\(M\\) accepts \\(w\\), and \\(L(M_1)=\\emptyset\\) otherwise. The language is a two-valued switch flipped by \\(A_{TM}\\)." },
      { prompt: "So how does a supposed decider \\(R\\) for \\(E_{TM}\\) let us decide \\(A_{TM}\\) — and mind the polarity?", type: "mc",
        choices: [
          "Build \\(\\langle M_1\\rangle\\), run \\(R\\); \\(R\\) accepts (\\(L(M_1)=\\emptyset\\)) means \\(M\\) does NOT accept \\(w\\), so INVERT \\(R\\)'s answer",
          "Build \\(\\langle M_1\\rangle\\), run \\(R\\); accept \\(A_{TM}\\) exactly when \\(R\\) accepts",
          "Run \\(R\\) on \\(\\langle M,w\\rangle\\) directly",
          "Run \\(M_1\\) on \\(w\\) and copy the result"
        ], answer: 0,
        explain: "\\(R\\) tests emptiness, and emptiness means \\(M\\) **rejected**. So \\(S=\\)\"construct \\(M_1\\); run \\(R\\) on \\(\\langle M_1\\rangle\\); **if \\(R\\) accepts, reject; if \\(R\\) rejects, accept**\" decides \\(A_{TM}\\). The inversion is the crux: \\(E_{TM}\\) answers the *opposite* of acceptance, so \\(f\\) is really a reduction \\(A_{TM}\\le_m \\overline{E_{TM}}\\); either way a decider for \\(E_{TM}\\) yields one for \\(A_{TM}\\)." },
      { prompt: "True or false: the correctness of this reduction depends on \\(M_1\\) actually being **run** on some input during the construction.", type: "tf", answer: false,
        explain: "False — and this is the single most common confusion. \\(M_1\\) is **never executed**; we only compute its *description* \\(\\langle M_1\\rangle\\) (write \\(M\\)'s code, prepend an \"erase input, load \\(w\\)\" preamble) and hand that description to \\(R\\). The reduction reasons about \\(L(M_1)\\), it does not simulate it." }
    ],
    explanation: "For \\(A_{TM}\\le_m E_{TM}\\): from \\(\\langle M,w\\rangle\\) build \\(M_1\\) that **ignores its input and simulates \\(M\\) on the hard-wired \\(w\\)**. Then \\(L(M_1)=\\Sigma^*\\) if \\(M\\) accepts \\(w\\) and \\(L(M_1)=\\emptyset\\) otherwise. An \\(E_{TM}\\) decider run on \\(\\langle M_1\\rangle\\), with its answer **inverted**, decides \\(A_{TM}\\) — so \\(E_{TM}\\) is undecidable. \\(M_1\\) is only constructed, never run.",
    whyMatters: "The \"ignore the input, hard-code \\(w\\)\" gadget is a workhorse: it converts a question about one specific run (\\(M\\) on \\(w\\)) into a question about a whole *language* (\\(L(M_1)\\)). That lift from a single computation to a language property is exactly what makes emptiness, regularity, finiteness, and Rice's theorem fall.",
    realWorld: "\"Will this program ever produce any output at all?\" is the emptiness question in disguise, and it is undecidable for the same reason. Static analyzers approximate it (dead-code and reachability analysis) precisely because they cannot decide it exactly.",
    source: "Sipser Thm 5.2 (E_TM undecidable; machine M1)"
  },

  /* ---- A3: A_TM ≤m REGULAR_TM (M2 recognizes Σ* or 0^n1^n) ---- */
  {
    id: "disc-ch5-build-regular", chapter: 5, topic: "Famous undecidable problems", type: "discussion", rank: 36,
    prompt: "**BUILD THE REDUCTION: \\(A_{TM}\\le_m REGULAR_{TM}\\)**, where \\(REGULAR_{TM}=\\{\\langle N\\rangle\\mid L(N)\\text{ is regular}\\}\\). The clever bit: engineer a machine \\(M_2\\) whose language is **regular exactly when \\(M\\) accepts \\(w\\)**, by toggling between a regular language and a famously non-regular one.",
    steps: [
      { prompt: "We need a knob that reads \"regular\" in the accept case and \"non-regular\" in the reject case. Which pair of languages is the natural choice to toggle between?", type: "mc",
        choices: [
          "\\(\\Sigma^*\\) (regular) vs. \\(\\{0^n1^n\\mid n\\ge 0\\}\\) (non-regular)",
          "\\(\\emptyset\\) (regular) vs. \\(\\Sigma^*\\) (also regular)",
          "\\(\\{w\\}\\) (regular) vs. \\(\\{ww\\}\\) (regular)",
          "two different finite languages"
        ], answer: 0,
        explain: "Toggle between \\(\\{0^n1^n\\}\\) — the canonical **non-regular** language — and \\(\\Sigma^*\\), which is **regular**. The reduction will arrange \\(L(M_2)=\\Sigma^*\\) when \\(M\\) accepts \\(w\\) and \\(L(M_2)=\\{0^n1^n\\}\\) when it doesn't. (Using \\(\\emptyset\\) vs \\(\\Sigma^*\\) fails: both are regular, so the target can't tell them apart.)" },
      { prompt: "Sipser's construction: \\(M_2=\\)\"on input \\(x\\): **(1)** if \\(x\\) has the form \\(0^n1^n\\), accept; **(2)** otherwise, run \\(M\\) on \\(w\\) and accept if \\(M\\) accepts.\" If \\(M\\) accepts \\(w\\), which strings does \\(M_2\\) accept?", type: "mc",
        choices: [
          "Every string: the \\(0^n1^n\\) ones via step 1, and all others via step 2 — so \\(L(M_2)=\\Sigma^*\\)",
          "Only strings of the form \\(0^n1^n\\)",
          "Only strings NOT of the form \\(0^n1^n\\)",
          "No strings at all"
        ], answer: 0,
        explain: "When \\(M\\) accepts \\(w\\), step 2 accepts **every** non-\\(0^n1^n\\) string, and step 1 already accepts the \\(0^n1^n\\) strings. Together that is all of \\(\\Sigma^*\\) — which is **regular**." },
      { prompt: "Now the reject case. If \\(M\\) does **not** accept \\(w\\), step 2 never accepts, so \\(M_2\\) accepts only the strings caught by step 1. Therefore \\(L(M_2)=\\{0^n1^n\\}\\), which is **non-regular**. Putting it together, \\(\\langle M_2\\rangle\\in REGULAR_{TM}\\) iff…", type: "mc",
        choices: [
          "\\(M\\) accepts \\(w\\)  — regularity matches acceptance, so a \\(REGULAR_{TM}\\) decider decides \\(A_{TM}\\)",
          "\\(M\\) rejects \\(w\\)",
          "always (\\(L(M_2)\\) is regular either way)",
          "never (\\(L(M_2)\\) is non-regular either way)"
        ], answer: 0,
        explain: "\\(L(M_2)\\) is regular \\(\\iff\\) it equals \\(\\Sigma^*\\) \\(\\iff\\) \\(M\\) accepts \\(w\\). So \\(S=\\)\"build \\(\\langle M_2\\rangle\\); run the \\(REGULAR_{TM}\\) decider \\(R\\); accept iff \\(R\\) accepts\" decides \\(A_{TM}\\). Since \\(A_{TM}\\) is undecidable, \\(REGULAR_{TM}\\) is too. (No inversion needed here — regularity lines up *with* acceptance.)" },
      { prompt: "A student objects: \"Step 2 says 'run \\(M\\) on \\(w\\)' — but if \\(M\\) loops on \\(w\\), doesn't \\(M_2\\) loop, so \\(M_2\\) isn't a decider?\" Why is that objection harmless here?", type: "mc",
        choices: [
          "\\(M_2\\) only needs to be a recognizer to have a well-defined LANGUAGE; the reduction feeds \\(\\langle M_2\\rangle\\) to \\(R\\) and never requires \\(M_2\\) to halt",
          "Because \\(M\\) never loops on \\(w\\)",
          "Because \\(M_2\\) is a DFA, which always halts",
          "Because looping strings are removed from \\(\\Sigma^*\\)"
        ], answer: 0,
        explain: "We only care about \\(L(M_2)\\), the *set of strings \\(M_2\\) accepts* — that is well-defined even if \\(M_2\\) loops on some inputs. If \\(M\\) loops on \\(w\\), then for non-\\(0^n1^n\\) inputs \\(M_2\\) loops (hence does not accept), so those inputs are simply outside \\(L(M_2)\\), leaving \\(L(M_2)=\\{0^n1^n\\}\\) — exactly the non-accept case. Deciders are never required; \\(\\langle M_2\\rangle\\) is only *inspected* by \\(R\\)." }
    ],
    explanation: "For \\(A_{TM}\\le_m REGULAR_{TM}\\): build \\(M_2\\) that **auto-accepts all \\(0^n1^n\\)**, and on every other input runs \\(M\\) on \\(w\\). Then \\(L(M_2)=\\Sigma^*\\) (regular) if \\(M\\) accepts \\(w\\), and \\(L(M_2)=\\{0^n1^n\\}\\) (non-regular) otherwise. A decider for \\(REGULAR_{TM}\\) applied to \\(\\langle M_2\\rangle\\) would thus decide \\(A_{TM}\\); \\(M_2\\) is only constructed, never run.",
    whyMatters: "This shows the reduction toolkit is *modular*: to attack property \\(P\\), pick one language with \\(P\\) and one without, then wire \\(M\\)'s verdict to flip \\(M_2\\) between them. The same recipe proves \\(CONTEXTFREE_{TM}\\), \\(DECIDABLE_{TM}\\), \\(FINITE_{TM}\\) undecidable — and generalizes to Rice's theorem.",
    realWorld: "\"Is the set of inputs this program accepts describable by a simple pattern (a regex/finite automaton)?\" is \\(REGULAR_{TM}\\), and it is undecidable. Tools that try to summarize a program's accepted inputs must therefore settle for sound approximations, never an exact test.",
    source: "Sipser Thm 5.3 (REGULAR_TM undecidable; machine M2)"
  },

  /* ---- A4: direction sanity check on the built reductions ---- */
  {
    id: "ch5-build-direction-check", chapter: 5, topic: "Mapping reducibility", type: "tf",
    prompt: "A classmate says: \"I proved \\(E_{TM}\\) is undecidable by building, from any \\(\\langle N\\rangle\\), an instance of \\(A_{TM}\\) — that is, I showed \\(E_{TM}\\le_m A_{TM}\\).\" **True or false:** that argument establishes \\(E_{TM}\\) is undecidable.",
    answer: false,
    explanation: "False — it is the direction error. \\(E_{TM}\\le_m A_{TM}\\) puts the target \\(E_{TM}\\) on the **left**, which only shows \\(E_{TM}\\) is *no harder than* \\(A_{TM}\\) (and since \\(A_{TM}\\) is recognizable, would merely make \\(E_{TM}\\) recognizable — in fact \\(E_{TM}\\) is not even recognizable!). To prove \\(E_{TM}\\) undecidable you must reduce the **known-undecidable** \\(A_{TM}\\) *into* it: \\(A_{TM}\\le_m E_{TM}\\), the construction built in the \\(M_1\\) discussion. Known-hard problem on the left.",
    source: "Sipser Cor 5.23 (direction); Thm 5.2"
  },

  /* =================================================================
     (B) COMPUTATION-HISTORY PACK — standalone mc / tf
     ================================================================= */

  /* ---- B1: what an accepting computation history IS (with filmstrip grid) ---- */
  {
    id: "ch5-hist-filmstrip-def", chapter: 5, topic: "Computation history", type: "mc", difficulty: 2,
    prompt: "The \"filmstrip\" below shows a candidate accepting computation history for a TM \\(M\\) on input \\(w=01\\), written as \\(C_1\\#C_2\\#\\cdots\\#C_\\ell\\) (each cell is one configuration; the head state is shown inline). For this to be a **valid accepting computation history**, which three conditions must hold?",
    grid: { title: "One accepting computation history for M on w = 01",
      cells: [[ {text:"q0 0 1", mono:true}, {text:"#", muted:true}, {text:"x q1 1", mono:true}, {text:"#", muted:true}, {text:"x y q2", mono:true}, {text:"#", muted:true}, {text:"x qacc y", mono:true, hi:true} ]],
      cellW: 78, cellH: 34,
      note: "C1 = start config on 01;  each Ci yields Ci+1 by one move of M;  last config (highlighted) holds qacc" },
    choices: [
      "\\(C_1\\) is the start configuration \\(q_0\\,w\\); every \\(C_{i+1}\\) legally follows from \\(C_i\\) by one move of \\(M\\); and \\(C_\\ell\\) is an accepting configuration (contains \\(q_{accept}\\))",
      "Only that \\(C_1\\) is the start configuration and \\(C_\\ell\\) contains \\(q_{accept}\\); the middle steps may be arbitrary",
      "Only that each \\(C_{i+1}\\) follows from \\(C_i\\); the endpoints don't matter",
      "That the configurations are all distinct and listed in increasing length"
    ],
    answer: 0,
    explanation: "By Sipser's Definition 5.5, an accepting computation history is a sequence \\(C_1,\\dots,C_\\ell\\) with **(1)** \\(C_1\\) the start configuration \\(q_0w\\), **(2)** each \\(C_{i+1}\\) legally following from \\(C_i\\) via \\(M\\)'s transition function, and **(3)** \\(C_\\ell\\) an accepting configuration. All three are required — dropping the \"legally follows\" links would let you forge acceptance out of unrelated snapshots.",
    source: "Sipser Def 5.5 (accepting computation history); Fig 5.11"
  },

  /* ---- B2: "legally follows" — local change only ---- */
  {
    id: "ch5-hist-legally-follows", chapter: 5, topic: "Computation history", type: "mc", difficulty: 3,
    prompt: "In a computation history, checking that \\(C_{i+1}\\) **legally follows** from \\(C_i\\) is the hard condition. What exactly must a verifier confirm about the pair \\(C_i, C_{i+1}\\)?",
    choices: [
      "They are IDENTICAL except in the few cells at and adjacent to the head, which change exactly as \\(M\\)'s transition function \\(\\delta\\) dictates",
      "They differ in every cell, since the whole tape is rewritten each step",
      "\\(C_{i+1}\\) is longer than \\(C_i\\) by exactly one symbol",
      "They contain the same state but the head has moved to the far end of the tape"
    ],
    answer: 0,
    explanation: "A single TM step is **local**: only the scanned cell, the state, and the head position change (the head moves one square). So \\(C_i\\) and \\(C_{i+1}\\) must agree everywhere except in that tiny window around the head, and the update there must match \\(\\delta\\). This locality is precisely why a finite-memory checker (an LBA, or a PDA in the \\(ALL_{CFG}\\) proof) can verify the link by comparing corresponding positions.",
    source: "Sipser Def 5.5; Thm 5.10 (checking each Ci yields Ci+1)"
  },

  /* ---- B3: no history ⇔ doesn't halt/accept ---- */
  {
    id: "ch5-hist-none-if-loops", chapter: 5, topic: "Computation history", type: "tf",
    prompt: "If a deterministic TM \\(M\\) **does not accept** \\(w\\) (it either rejects or loops), then **no** accepting computation history for \\(M\\) on \\(w\\) exists.",
    answer: true,
    explanation: "Correct. An accepting computation history must end in an accepting configuration reached by legal steps from the start; if \\(M\\) rejects, the (unique, since \\(M\\) is deterministic) run ends in \\(q_{reject}\\), and if \\(M\\) loops, the run is infinite — so no *finite* sequence ending in \\(q_{accept}\\) exists. This exact fact is what makes \"\\(\\exists\\) an accepting history\" a faithful stand-in for \"\\(M\\) accepts \\(w\\).\"",
    source: "Sipser Def 5.5 (histories are finite; none if M doesn't halt/accept)"
  },

  /* ---- B4: LBA configuration count qng^n ---- */
  {
    id: "ch5-hist-lba-config-count", chapter: 5, topic: "Linear bounded automata", type: "mc", difficulty: 2,
    prompt: "An LBA \\(M\\) has \\(q\\) states and a tape alphabet of \\(g\\) symbols, and its head is confined to the \\(n\\) cells holding the input. Exactly how many distinct configurations can \\(M\\) have on a length-\\(n\\) tape, and why does it matter?",
    choices: [
      "\\(q\\,n\\,g^{n}\\) — finitely many, so a run that exceeds this count must have repeated a configuration and is therefore looping",
      "\\(2^{n}\\) — exponential, so configurations are effectively unlimited",
      "\\(q+n+g\\) — linear, matching the name \"linear bounded\"",
      "infinitely many, because the tape symbols can be arranged in unboundedly many ways"
    ],
    answer: 0,
    explanation: "A configuration = (state, head position, tape contents): \\(q\\) choices of state, times \\(n\\) head positions, times \\(g^{n}\\) tape strings, giving \\(q\\,n\\,g^{n}\\) (Lemma 5.8). Crucially this is **finite**, so if an LBA runs for more than \\(q\\,n\\,g^{n}\\) steps it must repeat a configuration and loop forever — which is exactly how \\(A_{LBA}\\) is *decided* (simulate for \\(q\\,n\\,g^{n}\\) steps, then reject if not halted).",
    source: "Sipser Lemma 5.8; Thm 5.9 (A_LBA decidable)"
  },

  /* ---- B5: E_LBA via histories — B's language ---- */
  {
    id: "ch5-hist-elba-b-language", chapter: 5, topic: "Computation histories", type: "mc", difficulty: 3,
    prompt: "To prove \\(E_{LBA}\\) undecidable, from \\(\\langle M,w\\rangle\\) we build an **LBA \\(B\\)** that, given a candidate string \\(x\\), accepts iff \\(x\\) is an accepting computation history for \\(M\\) on \\(w\\). What is \\(L(B)\\), and how does a decider for \\(E_{LBA}\\) then decide \\(A_{TM}\\)?",
    choices: [
      "\\(L(B)\\) is \\(\\{\\text{the accepting history}\\}\\) (one string) if \\(M\\) accepts \\(w\\), else \\(\\emptyset\\); so \\(L(B)=\\emptyset\\iff M\\) doesn't accept \\(w\\) — run the \\(E_{LBA}\\) decider and INVERT",
      "\\(L(B)=\\Sigma^*\\) if \\(M\\) accepts \\(w\\), else \\(\\emptyset\\); accept \\(A_{TM}\\) exactly when \\(E_{LBA}\\) accepts",
      "\\(L(B)\\) is always empty, so \\(E_{LBA}\\) always accepts \\(\\langle B\\rangle\\)",
      "\\(L(B)\\) is the set of all TMs equivalent to \\(M\\)"
    ],
    answer: 0,
    explanation: "Because a deterministic \\(M\\) has **at most one** accepting history on \\(w\\): if \\(M\\) accepts \\(w\\), that unique history is the only string \\(B\\) accepts, so \\(L(B)\\) is a singleton (nonempty); if \\(M\\) doesn't accept \\(w\\), no accepting history exists, so \\(L(B)=\\emptyset\\). Hence \\(L(B)=\\emptyset\\iff M\\) does not accept \\(w\\). The reduction: build \\(\\langle B\\rangle\\), run the \\(E_{LBA}\\) decider \\(R\\), and **invert** (\\(R\\) accepts, so \\(L(B)\\) empty, so \\(M\\) rejects). \\(B\\) can be an LBA because verifying a history needs only the space the history occupies.",
    source: "Sipser Thm 5.10 (E_LBA undecidable)"
  },

  /* ---- B6: ALL_CFG generates the NON-histories ---- */
  {
    id: "ch5-hist-allcfg-complement", chapter: 5, topic: "Computation histories", type: "mc", difficulty: 3,
    prompt: "The \\(ALL_{CFG}\\) proof (\\(ALL_{CFG}=\\{\\langle G\\rangle\\mid L(G)=\\Sigma^*\\}\\)) has a twist versus the LBA proof: from \\(\\langle M,w\\rangle\\) we build a CFG/PDA that generates a specific set of strings. Which set — and why that choice?",
    choices: [
      "All strings that are NOT accepting computation histories for \\(M\\) on \\(w\\); then \\(L(G)=\\Sigma^*\\iff\\) no accepting history exists \\(\\iff M\\) does not accept \\(w\\)",
      "Exactly the accepting computation histories for \\(M\\) on \\(w\\), so \\(L(G)=\\Sigma^*\\iff M\\) accepts \\(w\\)",
      "All strings over \\(\\{0,1\\}\\), regardless of \\(M\\) and \\(w\\)",
      "All palindromes, which a CFG can generate"
    ],
    answer: 0,
    explanation: "A PDA/CFG can *reject* the set of valid histories but can naturally *generate* their **complement**: a string fails to be an accepting history if it doesn't start with \\(C_1\\), doesn't end in an accepting config, or has some \\(C_i\\) that doesn't yield \\(C_{i+1}\\) — each a condition a nondeterministic PDA can catch. So \\(G\\) generates **all non-histories**, giving \\(L(G)=\\Sigma^*\\) exactly when there is *no* accepting history, i.e. when \\(M\\) does not accept \\(w\\). (The stack forces writing every other config in reverse so it can be compared on pop.)",
    source: "Sipser Thm 5.13 (ALL_CFG undecidable; generate the non-histories)"
  },

  /* ---- B7: why the complement trick is needed (PDA can't intersect) ---- */
  {
    id: "ch5-hist-why-complement-pda", chapter: 5, topic: "Computation histories", type: "tf",
    prompt: "In the \\(ALL_{CFG}\\) reduction we make the grammar generate the **complement** of the accepting histories (rather than the histories themselves) because a PDA can guess and check a *single* way a string is malformed nondeterministically, whereas directly recognizing valid histories would require verifying *all* the links at once — beyond context-free power.",
    answer: true,
    explanation: "True. Recognizing the set of *valid* accepting histories is not context-free (it needs to enforce every \\(C_i\\vdash C_{i+1}\\) simultaneously, like the non-CF language \\(\\{ww\\}\\)-style matching across many blocks). But the **complement** — being *some* kind of malformed — only requires nondeterministically guessing one defect and checking it with the stack, which a PDA can do. That asymmetry is the whole reason the proof targets \\(ALL_{CFG}\\) (\"generates everything\") instead of an emptiness/acceptance question.",
    source: "Sipser Thm 5.13 (why the PDA generates non-histories)"
  },

  /* ---- B8: why B fits in linear space (LBA) ---- */
  {
    id: "ch5-hist-b-fits-lba", chapter: 5, topic: "Linear bounded automata", type: "mc", difficulty: 3,
    prompt: "In the \\(E_{LBA}\\) reduction, the checker \\(B\\) is required to be an **LBA** (head confined to the input). Why can \\(B\\) verify a candidate accepting history \\(x=C_1\\#\\cdots\\#C_\\ell\\) without ever using space beyond \\(x\\) itself?",
    choices: [
      "All of \\(B\\)'s work — matching \\(C_1\\) to the start config, scanning for \\(q_{accept}\\), and zig-zagging between adjacent \\(C_i,C_{i+1}\\) to check legal moves — happens **within the given string \\(x\\)**, so linear (input-bounded) space suffices",
      "Because \\(B\\) copies \\(x\\) onto a second, unbounded work tape first",
      "Because the history \\(x\\) is guaranteed to be short (at most \\(n\\) symbols)",
      "Because an LBA may move its head arbitrarily far right past the input"
    ],
    answer: 0,
    explanation: "Every check \\(B\\) performs is a comparison *between positions already inside* the candidate string \\(x\\): condition 1 compares the front of \\(x\\) to the built-in start config, condition 3 scans the last block for \\(q_{accept}\\), and condition 2 zig-zags between neighboring configuration-blocks marking positions with dots. None of that needs scratch space outside \\(x\\), so \\(B\\) is genuinely an LBA. That is exactly why the reduction lands in \\(E_{LBA}\\) (an LBA problem) and not merely \\(E_{TM}\\).",
    source: "Sipser Thm 5.10 (B is an LBA checking the history in place)"
  },

  /* ---- B9: which problems the history method proves undecidable (multi) ---- */
  {
    id: "ch5-hist-method-targets", chapter: 5, topic: "Computation histories", type: "multi", difficulty: 2,
    prompt: "The **computation-history method** (encode \"\\(M\\) has an accepting history on \\(w\\)\" as a property of a constructed object) is Sipser's tool for problems that test for the *existence of something*. Select **every** problem below that Sipser proves undecidable using this method.",
    choices: [
      "\\(E_{LBA}\\) — emptiness for linear bounded automata",
      "\\(ALL_{CFG}\\) — whether a CFG generates \\(\\Sigma^*\\)",
      "\\(PCP\\) — the Post Correspondence Problem",
      "\\(A_{DFA}\\) — whether a DFA accepts a given string",
      "\\(A_{LBA}\\) — whether an LBA accepts its input"
    ],
    answers: [0, 1, 2],
    explanation: "The history method proves \\(E_{LBA}\\) (Thm 5.10), \\(ALL_{CFG}\\) (Thm 5.13), and \\(PCP\\) (Thm 5.15, a match encodes an accepting history) undecidable — plus Hilbert's tenth problem. The distractors are **decidable**: \\(A_{DFA}\\) is decidable by simulation (Thm 4.1), and \\(A_{LBA}\\) is decidable because an LBA has only \\(q\\,n\\,g^{n}\\) configurations, so looping can be detected (Thm 5.9). Decidable problems are never *proved undecidable* by any method.",
    source: "Sipser Thms 5.10, 5.13, 5.15 (history method); Thms 4.1, 5.9 (the decidable distractors)"
  },

  /* =================================================================
     (C) REDUCTION FAMILY TREE — diagram + "which proves what" mc
     ================================================================= */

  /* ---- C1: the family tree of §5.1 reductions (diagram) ---- */
  {
    id: "ch5-family-tree-map", chapter: 5, topic: "Famous undecidable problems", type: "mc", difficulty: 2,
    prompt: "The arrow map below is the \"family tree\" of Chapter 5 undecidability reductions: an arrow \\(X\\to Y\\) means **\\(X\\) reduces to \\(Y\\)** (\\(X\\le_m Y\\)), i.e. \\(Y\\)'s undecidability is proved *using* \\(X\\). Reading the tree, which statement is correct?",
    diagram: { width: 560, height: 260, states: [
      { id: "atm", x: 90, y: 130, start: true, label: "ATM" },
      { id: "halt", x: 285, y: 45, label: "HALT" },
      { id: "etm", x: 285, y: 130, label: "ETM" },
      { id: "reg", x: 285, y: 215, label: "REG" },
      { id: "eqtm", x: 480, y: 130, label: "EQTM" }
    ], edges: [
      { from: "atm", to: "halt", label: "5.1" },
      { from: "atm", to: "etm", label: "5.2" },
      { from: "atm", to: "reg", label: "5.3" },
      { from: "etm", to: "eqtm", label: "5.4" }
    ] },
    choices: [
      "\\(A_{TM}\\) is the root (known-undecidable) and is reduced INTO \\(HALT_{TM}\\), \\(E_{TM}\\), \\(REGULAR_{TM}\\); \\(EQ_{TM}\\) is then proved from \\(E_{TM}\\), not directly from \\(A_{TM}\\)",
      "\\(EQ_{TM}\\) is the root, and everything reduces to \\(A_{TM}\\)",
      "The arrows show that \\(HALT_{TM}\\le_m A_{TM}\\), i.e. \\(A_{TM}\\) is proved from \\(HALT_{TM}\\)",
      "\\(REGULAR_{TM}\\) reduces to \\(E_{TM}\\), which reduces to \\(A_{TM}\\)"
    ],
    answer: 0,
    explanation: "The known-undecidable \\(A_{TM}\\) sits at the **root** (left) and is reduced *into* the three language-property problems: \\(A_{TM}\\le_m HALT_{TM}\\) (Thm 5.1), \\(A_{TM}\\le_m E_{TM}\\) (5.2), \\(A_{TM}\\le_m REGULAR_{TM}\\) (5.3). Then Sipser proves \\(EQ_{TM}\\) undecidable from \\(E_{TM}\\) (\\(E_{TM}\\le_m EQ_{TM}\\), Thm 5.4) — a convenient second-generation reduction — rather than from \\(A_{TM}\\) directly. Arrows always point *away* from the known-hard source.",
    source: "Sipser Thms 5.1–5.4 (reduction structure of §5.1)"
  },

  /* ---- C2: E_TM ≤ EQ_TM — which reduction, right direction ---- */
  {
    id: "ch5-family-eqtm-from-etm", chapter: 5, topic: "Famous undecidable problems", type: "mc", difficulty: 2,
    prompt: "Following the family tree, we prove \\(EQ_{TM}=\\{\\langle M_1,M_2\\rangle\\mid L(M_1)=L(M_2)\\}\\) undecidable by reducing **\\(E_{TM}\\)** to it. What is the one-line construction, and why does it work?",
    choices: [
      "Map \\(\\langle M\\rangle\\mapsto\\langle M,\\,M_\\emptyset\\rangle\\) where \\(M_\\emptyset\\) rejects every input; then \\(L(M)=L(M_\\emptyset)\\iff L(M)=\\emptyset\\), so \\(EQ_{TM}\\) here answers exactly \\(E_{TM}\\)",
      "Map \\(\\langle M\\rangle\\mapsto\\langle M,\\,M\\rangle\\); then \\(EQ_{TM}\\) always accepts, deciding \\(E_{TM}\\)",
      "Map \\(\\langle M\\rangle\\mapsto\\langle M,\\,M_{\\Sigma^*}\\rangle\\) where \\(M_{\\Sigma^*}\\) accepts everything; then equality means \\(L(M)=\\Sigma^*\\)",
      "Reduce \\(EQ_{TM}\\) to \\(E_{TM}\\) instead, since \\(E_{TM}\\) is the special case"
    ],
    answer: 0,
    explanation: "Fix \\(M_\\emptyset\\) to be a TM that rejects all inputs, so \\(L(M_\\emptyset)=\\emptyset\\). Then \\(\\langle M,M_\\emptyset\\rangle\\in EQ_{TM}\\iff L(M)=\\emptyset\\iff\\langle M\\rangle\\in E_{TM}\\). So \\(E_{TM}\\) is the special case of \\(EQ_{TM}\\) with one machine pinned to the empty language, and a decider for \\(EQ_{TM}\\) would decide the undecidable \\(E_{TM}\\). The direction is \\(E_{TM}\\le_m EQ_{TM}\\) — the known-hard problem on the **left** — matching the arrow \\(E_{TM}\\to EQ_{TM}\\).",
    source: "Sipser Thm 5.4 (EQ_TM undecidable via E_TM)"
  },

  /* ---- C3: pick the reduction that proves a given target ---- */
  {
    id: "ch5-family-pick-reduction", chapter: 5, topic: "Mapping reducibility", type: "mc", difficulty: 2,
    prompt: "You must prove \\(REGULAR_{TM}\\) undecidable and you get to choose the source problem for a mapping reduction \\((\\text{source})\\le_m REGULAR_{TM}\\). Which choice is **valid**, and what disqualifies the others?",
    choices: [
      "Use \\(A_{TM}\\) (or any known-undecidable language) as the source; a DECIDABLE source like \\(A_{DFA}\\) proves nothing, and putting \\(REGULAR_{TM}\\) on the left is the direction error",
      "Use \\(A_{DFA}\\) as the source, since it is a well-understood acceptance problem",
      "Reduce \\(REGULAR_{TM}\\le_m A_{TM}\\); since \\(A_{TM}\\) is hard, \\(REGULAR_{TM}\\) inherits hardness",
      "Any source works, as long as the map \\(f\\) is computable"
    ],
    answer: 0,
    explanation: "To prove a target undecidable you must reduce a **known-undecidable** problem *into* it: \\(A_{TM}\\le_m REGULAR_{TM}\\) works because a decider for \\(REGULAR_{TM}\\) would then decide \\(A_{TM}\\). A decidable source (\\(A_{DFA}\\)) yields no contradiction — deciding \\(REGULAR_{TM}\\) would only let you decide something already decidable. And \\(REGULAR_{TM}\\le_m A_{TM}\\) is the reversed direction, which shows \\(REGULAR_{TM}\\) is *no harder than* \\(A_{TM}\\) — the opposite of what you want. Computability of \\(f\\) is necessary but nowhere near sufficient.",
    source: "Sipser Cor 5.23 / §5.1 (direction of undecidability reductions)"
  },

  /* ---- C4: order the generic history reduction (order) ---- */
  {
    id: "ch5-family-history-order", chapter: 5, topic: "Computation histories", type: "order",
    prompt: "Order the steps of a generic \"reduction via computation histories\" that proves a target problem \\(T\\) (like \\(E_{LBA}\\)) is undecidable from \\(A_{TM}\\).",
    items: [
      "Assume, for contradiction, that TM \\(R\\) decides the target \\(T\\)",
      "From \\(\\langle M,w\\rangle\\), construct a machine/grammar whose language is built from the accepting computation histories of \\(M\\) on \\(w\\)",
      "Feed that object's description to \\(R\\) and read off (possibly inverting) whether an accepting history exists",
      "Conclude you have decided \\(A_{TM}\\) — impossible — so \\(R\\) can't exist and \\(T\\) is undecidable"
    ],
    explanation: "The computation-history template: assume a decider for \\(T\\); turn \\(\\langle M,w\\rangle\\) into an object that encodes \"\\(M\\) has an accepting history on \\(w\\)\" as a language property \\(T\\) can test; use \\(R\\) (inverting when \\(T\\) is an emptiness/all question); derive the contradiction with \\(A_{TM}\\)'s undecidability. This is the shared skeleton behind \\(E_{LBA}\\), \\(ALL_{CFG}\\), \\(PCP\\), and Hilbert's 10th.",
    source: "Sipser §5.1 (reductions via computation histories, Thms 5.10–5.13)"
  }

]);
