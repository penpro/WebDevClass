/* Chapter 5 — Reducibility: topic-level "why this matters" + real-world ties.
   Keyed "5::<topic>" to match question topics (see js/why/_registry.js). */
TOC.addWhy({
  "5::Idea of reducibility": {
    why: "Reducibility is the central tool for *transferring* hardness: instead of proving each new problem unsolvable from scratch, you show that solving it would solve a problem you already know is impossible. This 'compare problems by translation' habit is how all of computability and complexity theory grows from a single seed.",
    real: "It mirrors everyday engineering: a team proves a new scheduling feature is intractable by reducing the classic NP-hard job-shop problem to it, so they ship a heuristic instead of chasing an exact algorithm that cannot scale."
  },
  "5::What is a reduction": {
    why: "A reduction is a precise contract — a computable translation \\(f\\) with \\(w\\in A \\iff f(w)\\in B\\) — that lets a solver for one problem stand in for a solver for another. Pinning down exactly what counts as a reduction is what makes 'problem \\(A\\) is no harder than \\(B\\)' a theorem rather than hand-waving.",
    real: "Compilers and toolchains do this for real: an SMT-based verifier reduces 'is this C assertion always true?' to a satisfiability query, so improving the SAT/SMT backend automatically improves every checker built on top of it."
  },
  "5::What reductions give you": {
    why: "A single reduction \\(A\\le_m B\\) is a two-way lever: it pushes undecidability *downward* (if \\(A\\) is undecidable so is \\(B\\)) and pulls decidability *upward* (if \\(B\\) is decidable so is \\(A\\)). One arrow, used in either direction, is how almost every classification result in the chapter is obtained.",
    real: "Industrial constraint solvers exploit the upward direction constantly: reduce graph coloring, register allocation, or timetabling to a common solver, and one good solver pays off across dozens of unrelated products."
  },
  "5::Reducibility": {
    why: "Reducibility turns 'how hard is this problem?' into 'which problems can be translated into which?', giving computer science a partial order of difficulty rather than a pile of isolated puzzles. It is the organizing principle that links the halting problem to grammar emptiness, tiling, and beyond.",
    real: "The same logic underlies cryptographic security proofs: breaking a scheme is shown to be at least as hard as factoring or discrete log, so confidence in the hard problem transfers to confidence in the system."
  },
  "5::Halting problem": {
    why: "The halting problem is the canonical undecidable problem and the source most other impossibility results reduce from; its undecidability says no algorithm can perfectly predict whether arbitrary code terminates. This is a hard wall, not a temporary gap in our cleverness.",
    real: "It is why no compiler, IDE, or CI tool can flag *all* infinite loops: linters and timeouts catch common cases, but a sound, complete 'will this run forever?' checker provably cannot exist."
  },
  "5::Famous undecidable problems": {
    why: "Halting, \\(A_{TM}\\), \\(E_{TM}\\), \\(EQ_{TM}\\), \\(ALL_{CFG}\\), and PCP form a catalog of problems we have *proved* no algorithm can solve, mapping out the hard boundary of computation. Knowing the catalog tells you when to stop searching for an exact algorithm and switch to approximation, restriction, or interaction.",
    real: "Static-analysis vendors live on the right side of this boundary: tools like Coverity or Infer accept that perfect bug detection is undecidable and instead trade soundness for completeness, reporting 'likely' defects rather than certainties."
  },
  "5::Emptiness E_TM": {
    why: "\\(E_{TM}\\) — 'does this machine accept nothing?' — is undecidable, which means you cannot algorithmically tell whether a program's set of accepted inputs is empty. Whole families of 'is this code ever triggered?' questions inherit that impossibility.",
    real: "It is the theoretical reason dead-code and unreachable-branch detectors can never be exact: a coverage tool may report a branch as unreached on its test suite, but no analyzer can certify that *no* input ever reaches it."
  },
  "5::Equivalence EQ_TM": {
    why: "\\(EQ_{TM}\\) — 'do these two machines accept the same language?' — is not merely undecidable but neither recognizable nor co-recognizable, putting program equivalence among the genuinely hardest natural problems. Optimizers therefore can never fully verify that a transformed program matches the original on all inputs.",
    real: "Compiler test suites and translation-validation tools attack this with bounded, heuristic checks (random inputs, symbolic execution) precisely because deciding full behavioral equivalence of two arbitrary programs is impossible."
  },
  "5::REGULAR_TM": {
    why: "\\(REGULAR_{TM}\\) shows that even asking 'is this machine's language *simple* (regular)?' is undecidable, so you cannot algorithmically detect when a program's I/O behavior collapses to something a finite automaton could recognize. It is an early hint of the sweeping pattern Rice's theorem makes precise.",
    real: "Protocol- and parser-analysis tools cannot automatically certify that some component's accepted inputs form a regular set, so they fall back on requiring developers to *declare* the grammar (e.g., a regex or ABNF) rather than inferring it."
  },
  "5::Decidability classification": {
    why: "Sorting a problem into decidable, recognizable-but-undecidable, co-recognizable, or neither tells you exactly what kind of algorithm — if any — you can hope to build. This taxonomy is the practical payoff of the whole chapter: it converts 'is this solvable?' into a checklist.",
    real: "It guides tool design directly: a recognizer-only problem (like 'does this program halt?') justifies a 'run it and wait' tool with timeouts, while a 'neither' problem (like full equivalence) tells you to give up on any complete checker."
  },
  "5::CFG problems": {
    why: "The jump from decidable \\(A_{CFG}\\) and \\(E_{CFG}\\) to *undecidable* \\(ALL_{CFG}\\) and \\(EQ_{CFG}\\) shows that small increases in what you ask of grammars cross the line into impossibility. It marks exactly where automated reasoning about parsers stops being possible.",
    real: "This is why parser-generator toolchains (yacc, ANTLR) can build a parser and check a specific string, but provably cannot decide whether two arbitrary grammars describe the same language or whether one accepts every input — a real limit on grammar-equivalence tooling."
  },
  "5::Post Correspondence Problem": {
    why: "PCP is a deceptively simple tiling/matching puzzle that is undecidable, which makes it a lightweight 'undecidability gadget' to reduce *from* when \\(A_{TM}\\) is awkward to encode. Its value is leverage: many later impossibility proofs start by reducing PCP into the target.",
    real: "PCP reductions are how grammar ambiguity is proved undecidable — so parser-tool authors know that 'is this context-free grammar ambiguous?' can never be decided by an algorithm, and they rely on heuristics and conflict reports instead."
  },
  "5::Computation histories": {
    why: "A computation history reifies a machine's whole run as a single finite string, turning the *dynamic* question 'does \\(M\\) accept \\(w\\)?' into the *static* question 'does a valid history exist?'. Because checking a history is purely local, even weak models can do it — which is the engine behind the \\(E_{LBA}\\), \\(ALL_{CFG}\\), and PCP reductions.",
    real: "The same reification powers practical verification: a model checker or proof-carrying-code system ships an execution *trace* or certificate so a simple checker can validate each step locally, instead of re-running the computation."
  },
  "5::Computation history": {
    why: "Encoding a computation as a sequence of configurations \\(C_1,\\dots,C_l\\) where each step legally follows the last lets you replace 'simulate and see' with 'verify a witness'. This witness-checking view is exactly what lets restricted machines and grammars reason about full Turing machines.",
    real: "It is the theoretical ancestor of audit logs and replayable transaction journals: instead of trusting a system's behavior, you record each state transition so an independent, lightweight verifier can confirm the run was legal."
  },
  "5::Linear bounded automata": {
    why: "LBAs sit on a knife's edge: bounding the tape to the input makes acceptance \\(A_{LBA}\\) *decidable* (only finitely many configurations, so looping is detectable) yet emptiness \\(E_{LBA}\\) stays undecidable. They show that limiting *space* can rescue some questions while leaving others impossible.",
    real: "This is the computability shadow of the LBA = context-sensitive grammar correspondence used in language theory, and it foreshadows why bounded-memory model checking can exhaustively explore a finite state space that an unbounded program never could."
  },
  "5::Linear bounded automaton": {
    why: "A linear bounded automaton is a Turing machine restricted to the tape its input occupies, so it has only \\(q\\,n\\,g^{n}\\) configurations — a finite number that makes its acceptance problem decidable by detecting repeats. It is the textbook example that *space bounds* change what is computable, not just how fast.",
    real: "Bounded model checkers like CBMC apply the same principle: by capping the explored state to a finite budget they can decide properties exhaustively, whereas the same question over unbounded execution is undecidable."
  },
  "5::Mapping reducibility": {
    why: "Mapping (many-one) reducibility \\(A\\le_m B\\) is the cleanest, most disciplined reduction — a single computable function with no oracle calls — which is exactly why it cleanly transfers *both* decidability and recognizability. Its rigidity is its strength: the implications go through without side effects.",
    real: "Karp-style polynomial-time many-one reductions are the everyday form of this idea in complexity, and they are what NP-completeness proofs (e.g., reducing 3-SAT to a new scheduling or routing problem) actually use."
  },
  "5::Mapping reducibility theorems": {
    why: "The core theorems — if \\(A\\le_m B\\) and \\(B\\) is decidable then \\(A\\) is, and the contrapositive for undecidability (and the same for recognizability) — are the formal rules that license every reduction argument. They turn a translation into a watertight proof of (un)solvability.",
    real: "They justify 'solver reuse' in practice: because a many-one reduction preserves solvability, an engineer can correctly claim that a working SAT solver yields a working solver for any problem they reduce to SAT."
  },
  "5::Recognizability via reductions": {
    why: "Mapping reductions respect *recognizability*, and since \\(A\\le_m B\\) is the same as \\(\\overline{A}\\le_m\\overline{B}\\), they also let you prove a language is **not** recognizable by reducing \\(\\overline{A_{TM}}\\) into it. This is the standard route to the lower half of the recognizability hierarchy.",
    real: "It is the formal reason some verification questions admit *no* sound-and-complete semi-decision procedure: you cannot even build a tool guaranteed to eventually say 'yes' for every true instance, only one-sided checkers."
  },
  "5::EQ_TM recognizability": {
    why: "\\(EQ_{TM}\\) is neither Turing-recognizable nor co-Turing-recognizable, the strongest 'impossibility' badge a language can wear — strictly worse than the halting problem. It marks the existence of problems that resist even a one-sided, never-halting search for an answer.",
    real: "Practically, this is why nobody offers a tool that will *eventually* confirm two arbitrary programs are equivalent (nor one that will eventually confirm they differ on all-inputs): translation validators settle for bounded, best-effort checks because the full problem is doubly impossible."
  },
  "5::Rice's theorem": {
    why: "Rice's theorem is a sweeping generalization: **any** nontrivial property of the *language* a program recognizes is undecidable. One theorem retires an infinite list of 'can a tool detect property P of program behavior?' questions with a single 'no'.",
    real: "It is the deep reason perfect static analysis is impossible — no algorithm can always decide whether arbitrary code is malware-free, side-effect-free, or computes a given function — so antivirus and analyzers necessarily rely on heuristics, signatures, and false-positive/negative trade-offs."
  },
  "5::Computable function": {
    why: "A computable function is one a Turing machine can actually carry out on every input, and reductions are *built* from such functions — the translation \\(f\\) in \\(A\\le_m B\\) must itself be computable, or the argument is meaningless. The concept is what keeps 'translate one problem to another' honest.",
    real: "It is the formal counterpart of 'effectively implementable': every transformation in a real compiler pass — renaming, encoding, instrumenting code — must be a computable function, which is exactly what lets the pass run as a finite program."
  },
  "5::Computable functions": {
    why: "Computable functions are the legitimate 'glue' of reductions: only a function a machine can evaluate may serve as the translation in \\(A\\le_m B\\), so the class of computable functions delimits which reductions are even allowed. They distinguish a real proof from wishful mapping.",
    real: "Serializers, transpilers, and data-format converters are everyday computable functions; the same requirement — that the mapping be effectively computable — is what makes a reduction-based solver pipeline (translate, solve, translate back) something you can actually run."
  }
});
