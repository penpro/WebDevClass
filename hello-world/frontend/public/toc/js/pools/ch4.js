/* Chapter 4 — Decidability: extra distractors (each unambiguously WRONG for its
   question). Keyed by question id. The app samples a varying subset of wrong
   options each render so you can't answer by position or remembered shape.
   Correctness is critical here — every (wrong) decidability claim is checked
   against the truth: A_DFA/A_NFA/A_REX/E_DFA/EQ_DFA/A_CFG/E_CFG and every CFL
   are DECIDABLE; A_TM and EQ_CFG are UNDECIDABLE; A_TM is recognizable but
   \overline{A_{TM}} is not even recognizable. */
TOC.addPools({
  // ---- Decidable: regular languages ----
  "ch4-adfa-decidable": [
    "Because regular languages are closed under union, intersection, and complement",
    "By the pumping lemma, which bounds the length of strings \\(B\\) can accept",
    "Because a DFA has only finitely many states, so \\(L(B)\\) is finite",
    "A TM runs \\(B\\) on every string of length \\(\\le|w|\\) and accepts if any is accepted"
  ],
  "ch4-anfa-method": [
    "Run \\(B\\) directly on \\(w\\) and reject the moment any nondeterministic branch rejects",
    "Convert \\(B\\) to a CFG, then run the \\(A_{CFG}\\) decider on \\(\\langle B,w\\rangle\\)",
    "Pump \\(w\\) to length \\(2|w|\\) and check whether \\(B\\) accepts the result"
  ],
  "ch4-edfa-emptiness": [
    "Simulate \\(A\\) on the empty string \\(\\varepsilon\\); accept iff it rejects",
    "Minimize \\(A\\) and accept iff the minimized DFA has exactly one state",
    "Apply the pumping lemma to decide whether \\(L(A)\\) is empty",
    "Build the symmetric-difference DFA \\(C\\) and accept iff \\(L(C)=\\Sigma^*\\)"
  ],
  "ch4-eqdfa-symdiff": [
    "The intersection \\(L(A)\\cap L(B)\\) is empty iff \\(L(A)=L(B)\\)",
    "\\(C\\) accepts \\(\\varepsilon\\) iff \\(L(A)=L(B)\\), so we test membership of \\(\\varepsilon\\)",
    "\\(A\\) and \\(B\\) have the same number of states iff \\(L(A)=L(B)\\)"
  ],

  // ---- Decidable: context-free languages ----
  "ch4-acfg-why-not-naive": [
    "A CFG may generate infinitely many strings, so membership is undecidable without a PDA",
    "The naive search loops because \\(A_{CFG}\\) is only Turing-recognizable, not decidable",
    "Parsing requires backtracking, which a single-tape TM cannot perform"
  ],
  "ch4-ecfg-emptiness": [
    "Convert \\(G\\) to Chomsky normal form and accept iff it has no rules of the form \\(A\\to a\\)",
    "Build a PDA for \\(G\\) and test whether its stack ever empties",
    "Run the \\(A_{CFG}\\) decider on \\(\\langle G,\\varepsilon\\rangle\\) and accept iff it rejects"
  ],

  // ---- Countability ----
  "ch4-countable-def": [
    "there is a correspondence \\(f:\\mathbb{N}\\to A\\), so in particular \\(A\\) must be infinite",
    "\\(A\\) can be put in one-to-one correspondence with \\(\\mathbb{R}\\)",
    "the power set \\(\\mathcal{P}(A)\\) has the same size as \\(A\\)",
    "\\(A\\) is a subset of some finite set"
  ],
  "ch4-rationals-countable": [
    "Apply Cantor's diagonal argument to build a rational missing from every list",
    "List the rationals row by row, completing each infinite row before the next",
    "Use the fact that \\(\\mathbb{Q}\\) is a finite union of finite sets"
  ],

  // ---- Uncountability / diagonalization ----
  "ch4-diagonalization-idea": [
    "Let the \\(n\\)th digit of \\(x\\) equal the \\(n\\)th digit of \\(f(n)\\), so \\(x\\) appears in the list",
    "Take \\(x\\) to be the limit of the sequence \\(f(1),f(2),f(3),\\dots\\)",
    "Choose \\(x\\) so its digits list every machine that fails to halt"
  ],
  "ch4-counting-existence": [
    "There are uncountably many Turing machines but only countably many languages",
    "Both the Turing machines and the languages are countable, but the pairing fails",
    "Every language is recognizable, but some are recognized by infinitely many machines",
    "The recognizable languages are countable while the decidable languages are uncountable"
  ],

  // ---- Undecidability of A_TM ----
  "ch4-diagonal-d-behavior": [
    "rejects \\(\\langle M\\rangle\\) iff \\(M\\) halts on \\(\\langle M\\rangle\\)",
    "accepts \\(\\langle M\\rangle\\) iff \\(M\\) accepts every input",
    "accepts \\(\\langle M\\rangle\\) iff \\(M\\) halts on \\(\\langle M\\rangle\\)",
    "loops iff \\(M\\) does not accept \\(\\langle M\\rangle\\)"
  ],

  // ---- Co-recognizability ----
  "ch4-atm-not-co-recognizable-mc": [
    "\\(A_{TM}\\) is co-Turing-recognizable but not Turing-recognizable",
    "\\(A_{TM}\\) is decidable, hence both it and \\(\\overline{A_{TM}}\\) are Turing-recognizable",
    "\\(\\overline{A_{TM}}\\) is Turing-recognizable but \\(A_{TM}\\) is not"
  ],
  "ch4-parallel-decider-mc": [
    "Run \\(M_2\\) to completion first; if it halts, then run \\(M_1\\) on \\(w\\)",
    "Run \\(M_1\\) on \\(w\\); if it has not accepted within \\(|w|\\) steps, reject",
    "Simulate \\(M_1\\) on \\(w\\) and accept iff it ever enters \\(M_2\\)'s accept state"
  ],

  // ---- Synthesis / classification (single-answer picks) ----
  "ch4-classify-undecidable-pick": [
    "\\(A_{NFA}=\\{\\langle B,w\\rangle\\mid B\\text{ is an NFA that accepts }w\\}\\)",
    "\\(ALL_{DFA}=\\{\\langle A\\rangle\\mid L(A)=\\Sigma^*\\}\\)",
    "\\(A_{REX}=\\{\\langle R,w\\rangle\\mid R\\text{ generates }w\\}\\)"
  ],
  "ch4-classify-decidable-pick": [
    "\\(EQ_{TM}=\\{\\langle M_1,M_2\\rangle\\mid L(M_1)=L(M_2)\\}\\)",
    "\\(HALT_{TM}=\\{\\langle M,w\\rangle\\mid M\\text{ halts on }w\\}\\)",
    "The set of all languages over \\(\\Sigma\\)"
  ],

  // ---- multi questions ----
  "ch4-regular-classify-multi": [
    "\\(\\overline{A_{TM}}\\) — the complement of the TM acceptance problem",
    "\\(EQ_{TM}\\) — do TMs \\(M_1,M_2\\) recognize the same language?",
    "\\(HALT_{TM}\\) — does TM \\(M\\) halt on \\(w\\)?"
  ],
  "ch4-cfl-classify-multi": [
    "\\(ALL_{CFG}\\) — does \\(G\\) generate every string in \\(\\Sigma^*\\)?",
    "\\(EQ_{TM}\\) — do TMs \\(M_1,M_2\\) recognize the same language?",
    "Whether two CFGs \\(G,H\\) generate disjoint languages"
  ],
  "ch4-countable-sets-multi": [
    "The power set \\(\\mathcal{P}(\\mathbb{N})\\) of the natural numbers",
    "The set of all infinite binary sequences",
    "The set of all languages over \\(\\Sigma\\)",
    "The set of all functions \\(f:\\mathbb{N}\\to\\{0,1\\}\\)"
  ],
  "ch4-classic-traps-multi": [
    "\\(\\overline{A_{TM}}\\) is decidable",
    "\\(EQ_{CFG}\\) is decidable",
    "Every Turing-recognizable language is decidable"
  ]
});
