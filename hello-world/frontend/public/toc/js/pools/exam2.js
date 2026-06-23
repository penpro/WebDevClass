/* Exam 2 distractor pools (Ch 3-5 checkpoint) — each option UNAMBIGUOUSLY WRONG
   for its question. Keyed by exact question id. The app samples a varying subset
   of wrong options each render, so a question can't be answered by position.
   Correctness notes mirror the exam: deciding requires HALTING on all inputs;
   "at most k steps" is decidable but "at least k steps" is only recognizable;
   CFL\(\subseteq\)regular is decidable (complement the regular side, test
   \(E_{CFG}\)) while regular\(\subseteq\)CFL is \(ALL_{CFG}\), undecidable;
   \(A_{TM}\), \(HALT_{TM}\), \(EQ_{TM}\), \(ALL_{CFG}\) are undecidable. */
TOC.addPools({
  // ---- Why an FA halts but a TM need not ----
  "exam-fa-halts-tm-may-not-mc": [
    "An FA is deterministic while every TM is nondeterministic and so may diverge",
    "A TM has an infinite tape, so reading to the end of the tape never terminates",
    "An FA cannot loop because its transition function is total, but a TM's is partial",
    "A TM must visit every tape cell before halting, which takes unbounded time"
  ],

  // ---- Implementation-level decider for #a = 3 #b ----
  "exam-tm-three-times-as-many-mc": [
    "Mark three \\(a\\)'s for every \\(a\\), then accept iff the \\(b\\)'s are exhausted",
    "Sweep left to right and accept iff the number of \\(a\\)'s read so far is always \\(\\ge\\) the number of \\(b\\)'s",
    "Erase one \\(a\\) and one \\(b\\) on each pass, accepting iff the tape ends empty",
    "Accept iff the input matches the regular expression \\((aaab)^*\\)"
  ],

  // ---- K rejects "2": classify (undecidable); every option here is a wrong DECIDABLE verdict ----
  "exam-k-rejects-2-undecidable-mc": [
    "Decidable, because the input \\(\"2\"\\) is fixed and finite",
    "Decidable, by running \\(K\\) on \\(\"2\"\\) until it halts",
    "Decidable, since only one string \\(\"2\"\\) needs to be tested",
    "Decidable, because a single fixed input makes the language regular"
  ],

  // ---- co-recognizable + reduces => decidable ----
  "exam-cobar-recognizable-decidable-mc": [
    "Because \\(\\overline{D}\\le_m D\\) forces \\(\\overline{D}\\) to be finite, and finite languages are decidable",
    "Because any language recognized by some TM is decidable once a reduction exists",
    "Because \\(\\overline{D}\\le_m D\\) makes \\(D\\) the complement of a decidable language",
    "Because a mapping reduction from a language to itself always yields a decider"
  ],

  // ---- "at least 2|w| steps": classify (undecidable but recognizable) ----
  "exam-prep-at-least-steps-mc": [
    "Decidable — \"at least\" only adds a lower bound, which a bounded simulation can check",
    "Decidable, because it is the complement of the decidable \"at most \\(2|w|\\)\" language",
    "Undecidable and co-recognizable, but not recognizable",
    "Neither recognizable nor co-recognizable"
  ],

  // ---- CFL subseteq regular: classify (decidable); every option here is a wrong UNDECIDABLE verdict ----
  "exam-prep-cfl-sub-reg-decidable-mc": [
    "Undecidable — it reduces to \\(EQ_{CFG}\\)",
    "Undecidable — testing \\(L(G)=\\emptyset\\) for a CFG is not decidable",
    "Undecidable — the intersection of a CFL with a regular language need not be a CFL",
    "Decidable only when \\(L(G)\\) is finite"
  ],

  // ---- regular subseteq CFL: classify (undecidable, ALL_CFG); every option here is wrong ----
  "exam-prep-reg-sub-cfl-undecidable-mc": [
    "Decidable — complement the CFL side and test \\(E_{CFG}\\)",
    "Decidable — \\(L(E)\\subseteq L(G)\\iff L(E)\\cap\\overline{L(G)}=\\emptyset\\), an emptiness test",
    "Undecidable — but only because \\(EQ_{TM}\\) reduces to it",
    "Decidable — build the product machine and check reachability"
  ],

  // ---- Self-test "select every decidable" (multi); every option here is UNDECIDABLE ----
  "exam-prep-selftest-classify-multi": [
    "\\(HALT_{TM}=\\{\\langle M,w\\rangle \\mid M \\text{ halts on } w\\}\\)",
    "\\(\\{\\langle G,E\\rangle \\mid L(E)\\subseteq L(G)\\}\\) (\\(G\\) a CFG, \\(E\\) a regex)",
    "\\(\\{\\langle G\\rangle \\mid G \\text{ is a CFG and } L(G)=\\Sigma^*\\}\\)",
    "\\(\\overline{A_{TM}}=\\{\\langle M,w\\rangle \\mid M \\text{ does not accept } w\\}\\)"
  ]
});
