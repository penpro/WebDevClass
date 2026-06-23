/* Chapter 5 — Reducibility: extra distractors (each unambiguously WRONG for its
   question). Keyed by question id. The app samples a varying subset of wrong
   options each render so you can't answer by position or remembered shape.
   Correctness focus: reduction DIRECTIONS and decidability VERDICTS are exact. */
TOC.addPools({
  // ---------- The idea of reducibility ----------
  "ch5-idea-direction-undecidable": [
    "\\(B\\le_m A_{TM}\\) (i.e. \\(B\\) reduces to \\(A_{TM}\\))",
    "\\(B\\) reduces to a known-recognizable problem",
    "\\(\\overline{B}\\) reduces to a known-decidable problem",
    "a known-decidable problem reduces to \\(B\\)"
  ],

  // ---------- HALT_TM ----------
  "ch5-halt-why-naive-fails": [
    "Reading \\(M\\)'s answer requires solving \\(HALT_{TM}\\) first",
    "A TM cannot be given its own description as input",
    "If \\(M\\) accepts \\(w\\), the simulation rejects instead"
  ],

  // ---------- E_TM ----------
  "ch5-etm-modified-machine": [
    "So that \\(L(M_1)=\\emptyset\\) **iff** \\(M\\) accepts \\(w\\)",
    "So that \\(M_1\\) decides \\(A_{TM}\\) directly",
    "So that \\(L(M_1)\\) equals \\(L(M)\\) on every input",
    "So that \\(M_1\\) never halts on \\(w\\)"
  ],

  // ---------- REGULAR_TM ----------
  "ch5-regular-m2-construction": [
    "\\(\\{0^n1^n\\mid n\\ge 0\\}\\) together with nothing else",
    "a nonregular language, since the second clause keeps it nonregular",
    "\\(\\{w\\}\\cup\\{0^n1^n\\mid n\\ge 0\\}\\)"
  ],

  // ---------- EQ_TM ----------
  "ch5-eqtm-reduce-from": [
    "\\(EQ_{DFA}\\)",
    "\\(E_{CFG}\\)",
    "\\(A_{DFA}\\)",
    "\\(EQ_{CFG}\\)"
  ],

  // ---------- Computation histories ----------
  "ch5-comphist-def": [
    "a sequence of configurations ending in a rejecting configuration",
    "any sequence of configurations of \\(M\\), halting or not",
    "the list of states \\(M\\) visits, without the tape contents"
  ],

  // ---------- LBA configuration count ----------
  "ch5-lba-config-count": [
    "\\(q\\,n^{g}\\)",
    "\\(g^{qn}\\)",
    "\\(n\\,g^{q}\\)"
  ],

  // ---------- E_LBA proof ----------
  "ch5-elba-b-language": [
    "the rejecting computation histories of \\(M\\) on \\(w\\)",
    "the accepting computation histories of every TM",
    "the inputs \\(w'\\) that \\(M\\) accepts"
  ],

  // ---------- ALL_CFG reverse trick ----------
  "ch5-allcfg-reverse-trick": [
    "So a finite automaton can read the history in one left-to-right pass",
    "So that \\(L(G)=\\emptyset\\) when \\(M\\) accepts \\(w\\)",
    "Because the pumping lemma requires reversed substrings"
  ],

  // ---------- PCP ----------
  "ch5-pcp-match-encodes": [
    "an accepting computation history of \\(M\\) on the empty string",
    "a domino whose top and bottom are already equal",
    "a string the LBA \\(B\\) accepts"
  ],

  // ---------- Computable functions ----------
  "ch5-computable-fn-def": [
    "some TM, on every input \\(w\\), accepts iff \\(f(w)\\) is defined",
    "\\(f\\) is computable by some PDA",
    "some enumerator prints every value \\(f(w)\\) in order",
    "\\(f\\) maps each \\(w\\) to a member of a decidable language"
  ],

  // ---------- Mapping reducibility (multi) ----------
  "ch5-mapping-iff-both-directions": [
    "If \\(f(w)\\in B\\) then \\(w\\notin A\\)",
    "\\(f\\) must be onto \\(B\\) (every element of \\(B\\) is some \\(f(w)\\))",
    "\\(f\\) may be partial, so long as it halts on inputs in \\(A\\)"
  ],

  // ---------- Non-recognizability (Cor 5.29) ----------
  "ch5-cor529-nonrecognizable": [
    "\\(\\overline{A_{TM}}\\le_m \\overline{B}\\)",
    "\\(B\\le_m \\overline{A_{TM}}\\)",
    "\\(\\overline{B}\\le_m \\overline{A_{TM}}\\)",
    "\\(A_{TM}\\le_m B\\) (equivalently \\(\\overline{A_{TM}}\\le_m \\overline{B}\\))"
  ],

  // ---------- Rice's theorem (statement) ----------
  "ch5-rice-statement": [
    "every nontrivial property of a TM's number of states is undecidable",
    "every trivial property of a TM's language is undecidable",
    "a property of \\(L(M)\\) is decidable iff it is nontrivial"
  ],

  // ---------- Rice's theorem (conditions, multi) ----------
  "ch5-rice-conditions-multi": [
    "\\(P\\) holds for no TM at all",
    "\\(P\\) is a property of the machine's transition function",
    "\\(P\\) is decidable for at least one machine"
  ],

  // ---------- Rice's theorem (applies, multi) ----------
  "ch5-rice-applies-multi": [
    "\\(\\{\\langle M\\rangle \\mid M\\text{ has exactly 7 states}\\}\\)",
    "\\(\\{\\langle M\\rangle \\mid M\\text{ ever moves its head left}\\}\\)",
    "\\(\\{\\langle M\\rangle \\mid \\langle M\\rangle\\text{ is at most 100 symbols long}\\}\\)"
  ],

  // ---------- Decidability classification (decidable, multi) ----------
  "ch5-classify-multi": [
    "\\(REGULAR_{TM}\\) (is a TM's language regular?)",
    "\\(EQ_{TM}\\) (do two TMs recognize the same language?)",
    "\\(A_{TM}\\) (does a TM accept its input?)",
    "\\(PCP\\) (does a set of dominos have a match?)"
  ],

  // ---------- Decidability classification (undecidable, multi) ----------
  "ch5-classify-undecidable-multi": [
    "\\(A_{DFA}\\)",
    "\\(E_{CFG}\\)",
    "\\(A_{CFG}\\)",
    "\\(EQ_{DFA}\\)"
  ],

  // ---------- Recognizable-but-not-decidable ----------
  "ch5-recognizable-classify": [
    "\\(E_{CFG}\\)",
    "\\(A_{DFA}\\)",
    "\\(\\overline{EQ_{TM}}\\)",
    "\\(E_{LBA}\\)"
  ]
});
