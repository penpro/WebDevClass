/* Chapter 4 — Decidability. "Why this matters" + real-world examples, keyed "4::<topic>". */
TOC.addWhy({
  "4::Acceptance problem": {
    why: "The acceptance problem \\(A_{TM}=\\{\\langle M,w\\rangle\\mid M\\text{ accepts }w\\}\\) is the seed of undecidability: it is recognizable (just simulate \\(M\\) on \\(w\\)) yet has no decider, and almost every other undecidable problem is proven so by reduction from it. Asking \"will this program accept this input?\" is the canonical question software cannot answer in general.",
    real: "An IDE or static analyzer cannot decide in advance whether an arbitrary function will return successfully on a given argument; tools like data-flow analyzers therefore approximate reachability conservatively, flagging \"may not return\" rather than giving the exact answer \\(A_{TM}\\) would require."
  },
  "4::Classification": {
    why: "Sorting every problem into decidable, recognizable-but-not-decidable, or not-even-recognizable is the master map of computability: it tells you up front whether a problem admits a guaranteed algorithm, only a one-sided procedure, or no procedure at all. Knowing a problem's box tells you what kind of tool is even possible.",
    real: "Program-verification practice runs on this taxonomy: bounded model checkers target decidable fragments, semi-decision procedures (theorem provers) handle recognizable validity, and for non-recognizable properties engineers fall back on testing and runtime monitoring because no analyzer can ever be complete."
  },
  "4::Co-recognizability": {
    why: "A language is co-recognizable when its complement is recognizable, and the pivotal theorem is that decidable = recognizable AND co-recognizable. So a problem you can confirm but whose negation you cannot confirm is necessarily undecidable — the inability to recognize \\(\\overline{A_{TM}}\\) is what makes \\(A_{TM}\\) undecidable.",
    real: "Deadlock detection illustrates the asymmetry: a monitor can eventually confirm a deadlock has occurred (a cycle in the wait-for graph) but cannot in general certify a long-running concurrent system will never deadlock — confirming the bad event is recognizable, ruling it out forever is not."
  },
  "4::Co-recognizable": {
    why: "Co-recognizable means \"\\(\\overline{A}\\) is recognizable\" — you can eventually confirm non-membership but maybe never membership. Pairing recognizability with co-recognizability is exactly what upgrades a one-sided procedure into a true decider, by running both searches in parallel until one of them must succeed.",
    real: "A linker that searches for an undefined symbol can confirm absence (it exhausts all object files and reports \"unresolved\"), the mirror image of a search that confirms presence; only because both directions terminate can the linker give a definitive yes/no for each symbol."
  },
  "4::Context-free is decidable": {
    why: "Every context-free language is decidable (Thm 4.9), but the proof must route through the grammar in Chomsky normal form rather than simulating a PDA directly, because nondeterministic PDA branches can loop. This is the boundary where \"recognizable by an automaton\" is strengthened to \"always-halting decidable.\"",
    real: "Programming-language parsers built from CFGs (the grammars behind yacc/Bison or ANTLR) always terminate when deciding whether source code is syntactically valid, which is why a compiler can reliably report a syntax error instead of hanging on malformed input."
  },
  "4::Countability": {
    why: "Countability — the ability to list a set as \\(a_1,a_2,a_3,\\dots\\) — is the tool that makes infinite sets comparable in size. The decisive fact is that the set of all Turing machines is countable, because each has a finite encoding; this is half of the proof that some problems have no machine at all.",
    real: "Every possible program of every length forms a countable set, since each is a finite file: this is why you can in principle enumerate all programs (as code-golf \"brute force every program\" experiments do) — but it also means there are only countably many programs to go around."
  },
  "4::Countable vs uncountable": {
    why: "The gulf between countable and uncountable is the engine of the whole chapter: there are only countably many programs but uncountably many problems (languages), so by sheer counting most problems are unsolvable by any program. This is a non-constructive existence proof — it guarantees unsolvable problems without naming one.",
    real: "There are uncountably many possible functions from inputs to outputs but only countably many programs to implement them, so the overwhelming majority of conceivable input-output behaviors are uncomputable — a fundamental reason no finite library or AI model can ever realize every function one might specify."
  },
  "4::Decidability": {
    why: "Decidability is the formal boundary of what algorithms can reliably solve: a decidable problem has a procedure that always halts with the correct yes/no answer, and proving a problem decidable is proving that a dependable, terminating algorithm exists. Everything outside this boundary requires approximation, heuristics, or human judgment.",
    real: "A package manager's dependency resolver works on a decidable constraint problem, so it always terminates with either a valid install plan or a definitive conflict report — unlike the undecidable questions a static analyzer faces, the resolver can promise an answer every time."
  },
  "4::Decidable": {
    why: "Calling a language decidable is the strongest computational guarantee short of efficiency: some Turing machine halts on every input and answers correctly, so the problem is solvable in the fullest sense. Identifying a problem as decidable is what licenses building a tool that is sound and complete and always terminates.",
    real: "Regular-expression matching against a true regular (non-backtracking) engine like RE2 is decidable and runs in guaranteed linear time, which is precisely why large services use RE2 to filter untrusted input safely — it cannot be tricked into running forever."
  },
  "4::Decidable DFA/CFG problems": {
    why: "Acceptance, emptiness, and equivalence for finite automata are all decidable because their objects are finite and simulations terminate — but the pattern breaks at \\(EQ_{CFG}\\), which is undecidable. Seeing exactly where decidability stops (DFA equivalence yes, CFG equivalence no) is the lesson: more expressive models lose decidable questions.",
    real: "Optimizing compilers decide DFA equivalence to minimize lexer state machines and merge equivalent states, but they cannot decide whether two arbitrary context-free grammars generate the same language — a hard wall that tools for grammar refactoring run into."
  },
  "4::Decidable vs recognizable": {
    why: "The decidable-versus-recognizable line is the most consequential distinction in the theory: a decider always halts, while a recognizer may loop forever on \"no\" instances. This is the formal reason there are properties software can confirm but never refute, and it forces real tools to choose between completeness and termination.",
    real: "An antivirus engine recognizes known threats (it halts and alarms when a signature matches) but cannot decide that an arbitrary executable is benign; this recognizable-not-decidable reality is why zero-day malware slips through and why \"no threats found\" never means \"provably safe.\""
  },
  "4::Decidable: context-free languages": {
    why: "Showing every context-free language is decidable closes the gap between automata that may loop and algorithms that always halt: the Chomsky-normal-form bound makes only finitely many derivations need checking. It is the link in the hierarchy context-free \\(\\subsetneq\\) decidable, proven concretely rather than assumed.",
    real: "A CFG-based parser (Bison, ANTLR) terminates on every input precisely because membership testing reduces to checking finitely many bounded-length derivations, so a build never stalls in the parsing phase no matter how malformed the source file is."
  },
  "4::Decidable: regular languages": {
    why: "Every standard question about finite automata — acceptance, emptiness, equivalence — is decidable because finite objects yield terminating simulations, and equivalence even reduces to an emptiness test on a symmetric-difference automaton. This makes regular languages the well-behaved baseline against which harder models' undecidable questions stand out.",
    real: "Network firewalls and intrusion-detection systems compile rule sets into finite automata and decide emptiness and equivalence to prove that two rule sets accept exactly the same traffic, or that some rule is dead (its language is empty) and can be removed."
  },
  "4::Deciders vs recognizers": {
    why: "A decider never loops and a recognizer may, so the difference is the guarantee of an answer on every input. This is the dividing line that determines whether you can trust a tool's silence: a decider's \"no\" is a real no, while a recognizer that hasn't accepted might simply still be running.",
    real: "A type checker for a decidable type system is a decider — it always reports well-typed or ill-typed — whereas an automated theorem prover is only a recognizer for validity, which is why proof assistants impose timeouts and let humans intervene when the prover spins."
  },
  "4::Diagonalization": {
    why: "Diagonalization is the proof technique that manufactures an object differing from every entry on a list, and it powers both Cantor's uncountability of \\(\\mathbb{R}\\) and the undecidability of \\(A_{TM}\\). Whenever you must show no enumeration can be complete — no list of all reals, no decider for all programs — this self-referential diagonal is the weapon.",
    real: "The same self-reference underlies the quine (a program that prints its own source) and the logic of computer viruses that reason about their own code; it is also the structural heart of Gödel's incompleteness, which limits what any automated proof system can establish about itself."
  },
  "4::Halting problem": {
    why: "The halting problem — does program \\(M\\) halt on input \\(w\\)? — is the most famous undecidable problem: no algorithm can decide it for all programs, a hard limit on what software can know about software. Most other impossibility results in computing are reductions from it.",
    real: "This is why no compiler or static analyzer can flag every infinite loop, why no tool can perfectly detect all unreachable code, and why CI systems use wall-clock timeouts: detecting non-termination in general is provably impossible, so engineering substitutes a conservative cutoff for the answer no algorithm can give."
  },
  "4::Language hierarchy": {
    why: "The strict chain regular \\(\\subsetneq\\) context-free \\(\\subsetneq\\) decidable \\(\\subsetneq\\) Turing-recognizable organizes all of computation into nested tiers of power, each gap witnessed by a concrete language. Knowing a problem's tier tells you both what machine you need to solve it and what questions about it remain answerable.",
    real: "Language designers exploit the hierarchy deliberately: configuration formats are kept regular or context-free so they can be validated reliably and fast, while general-purpose languages are Turing-complete — which is exactly why you can validate a JSON schema completely but cannot fully verify an arbitrary program."
  },
  "4::More languages than machines": {
    why: "Because Turing machines are countable but languages are uncountable, there must exist languages no machine recognizes — the demand for computation outstrips the supply of programs. This counting argument proves unsolvable problems exist before any specific one is exhibited, reframing undecidability as inevitable rather than a curiosity.",
    real: "However many programs humanity ever writes, they form a countable set, yet the space of possible input-output specifications is uncountable, so most conceivable software behaviors can never be implemented — a ceiling that bounds automated program synthesis and code-generating models no matter how large they grow."
  },
  "4::Uncountability": {
    why: "Uncountability — proven by Cantor's diagonal argument — establishes that the set of all languages is strictly larger than any list, hence larger than the countable set of Turing machines. This size mismatch is the abstract source of every \"this cannot be computed\" result, guaranteeing non-recognizable languages exist.",
    real: "The real numbers are uncountable, so almost every real number is uncomputable (no program outputs its digits); this is why floating-point and arbitrary-precision libraries can only ever represent a countable, measure-zero sliver of the true continuum of reals."
  },
  "4::Undecidability of A_TM": {
    why: "The undecidability of \\(A_{TM}\\) is the first concrete proof that a specific, natural problem has no algorithm, built by a diagonal construction that turns a hypothetical decider against itself. It is the anchor from which the halting problem and countless other undecidable problems are derived by reduction.",
    real: "It is the formal reason an antivirus or sandbox cannot decide from an executable alone whether it will perform a malicious action on a given input; security tools must therefore actually run code in instrumented sandboxes and watch behavior, since the static question reduces to undecidable \\(A_{TM}\\)."
  },
  "4::Undecidable": {
    why: "Labeling a problem undecidable is a permanent impossibility result, not a statement about current technology: no algorithm in any language, however clever or fast, can solve all instances. It tells engineers to stop seeking a perfect solver and instead design for approximation, restriction to special cases, or human-in-the-loop checking.",
    real: "Determining whether two arbitrary programs compute the same function (program equivalence) is undecidable, which is why refactoring tools and optimizing compilers only apply equivalence transformations they can prove locally, and why \"prove these two implementations always agree\" generally needs tests rather than a universal checker."
  },
  "4::Universal Turing machine": {
    why: "The universal Turing machine \\(U\\) takes \\(\\langle M,w\\rangle\\) and simulates \\(M\\) on \\(w\\), proving that a single fixed machine can run any program supplied as data — the theoretical birth of the general-purpose, stored-program computer. It also recognizes \\(A_{TM}\\), showing the boundary between recognizable and decidable from the inside.",
    real: "Every interpreter and CPU is a universal machine in practice: the Python interpreter, the JVM, and a physical processor each read another program's encoding and execute it, which is exactly why one device can run arbitrary downloaded software instead of being wired for a single task."
  }
});
