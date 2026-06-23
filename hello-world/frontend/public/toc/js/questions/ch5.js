/* Chapter 5 — Reducibility (Sipser 5.1–5.3; course 5.1–5.12 excl. 5.3/5.8/5.9,
   plus Rice's theorem as supplemental 5.30).
   The idea of reducibility; undecidable problems from language theory
   (HALT_TM, E_TM, REGULAR_TM, EQ_TM); reductions via computation histories;
   LBAs (A_LBA decidable, E_LBA undecidable); ALL_CFG / EQ_CFG; PCP;
   mapping reducibility and its decidability/recognizability theorems;
   non-recognizability via reductions; Rice's theorem. */
TOC.addQuestions([
  // ---------- The idea of reducibility ----------
  {
    id: "ch5-idea-direction-undecidable", chapter: 5, topic: "Idea of reducibility", type: "mc",
    prompt: "To prove that a new problem \\(B\\) is **undecidable** by reduction, the correct strategy is to show that:",
    choices: [
      "a known-undecidable problem (e.g. \\(A_{TM}\\)) reduces to \\(B\\)",
      "\\(B\\) reduces to a known-undecidable problem (e.g. \\(A_{TM}\\))",
      "\\(B\\) reduces to a known-decidable problem",
      "\\(B\\) reduces to itself"
    ],
    answer: 0,
    explanation: "Reduce a known-undecidable problem TO \\(B\\): if \\(A\\) is undecidable and \\(A\\) reduces to \\(B\\), then \\(B\\) must be undecidable too (a decider for \\(B\\) would decide \\(A\\)). Reducing \\(B\\) to a hard problem proves nothing about \\(B\\) — that is the classic direction error.",
    source: "Sipser §5.1 (strategy of Thm 5.1)",
    difficulty: 2
  },
  {
    id: "ch5-direction-error-tf", chapter: 5, topic: "Idea of reducibility", type: "tf",
    prompt: "Showing \\(B\\le_m A_{TM}\\) proves that \\(B\\) is undecidable.",
    answer: false,
    explanation: "Wrong direction. \\(B\\le_m A_{TM}\\) means \\(B\\) is no harder than \\(A_{TM}\\); since \\(A_{TM}\\) is recognizable, this even shows \\(B\\) is recognizable. To prove \\(B\\) undecidable you need \\(A_{TM}\\le_m B\\).",
    source: "Sipser Cor 5.23 (direction)",
    difficulty: 2
  },
  {
    id: "ch5-reduction-stages-order", chapter: 5, topic: "Idea of reducibility", type: "order",
    prompt: "Put the stages of a standard ``reduce \\(A_{TM}\\) to \\(B\\)'' undecidability proof in order.",
    items: [
      "Assume, for contradiction, that TM \\(R\\) decides \\(B\\)",
      "From input \\(\\langle M,w\\rangle\\), compute the description of a gadget machine/object whose membership in \\(B\\) tracks whether \\(M\\) accepts \\(w\\)",
      "Run \\(R\\) on that description and read off (possibly inverting) its answer to decide \\(A_{TM}\\)",
      "Conclude \\(R\\) cannot exist, since \\(A_{TM}\\) is undecidable, so \\(B\\) is undecidable"
    ],
    explanation: "Every reduction proof in §5.1 follows this template: assume a decider for the target, transform the \\(A_{TM}\\) instance into a target instance, use the decider, and derive a contradiction with the undecidability of \\(A_{TM}\\).",
    source: "Sipser §5.1 (pattern of Thms 5.1–5.4)",
    difficulty: 2
  },

  // ---------- HALT_TM ----------
  {
    id: "ch5-halt-undecidable-tf", chapter: 5, topic: "Halting problem", type: "tf",
    prompt: "\\(HALT_{TM}=\\{\\langle M,w\\rangle \\mid M\\text{ is a TM and }M\\text{ halts on }w\\}\\) is undecidable.",
    answer: true,
    explanation: "If a decider \\(R\\) for \\(HALT_{TM}\\) existed, we could decide \\(A_{TM}\\): run \\(R\\) on \\(\\langle M,w\\rangle\\); if it says \\(M\\) halts, simulate \\(M\\) on \\(w\\) safely and report accept/reject. Since \\(A_{TM}\\) is undecidable, no such \\(R\\) exists.",
    source: "Sipser Thm 5.1",
    difficulty: 1
  },
  {
    id: "ch5-halt-why-naive-fails", chapter: 5, topic: "Halting problem", type: "mc",
    prompt: "Why does the naive idea \"to decide \\(A_{TM}\\), just simulate \\(M\\) on \\(w\\) and copy its answer\" fail?",
    choices: [
      "If \\(M\\) loops on \\(w\\), the simulation never terminates, so the simulator is not a decider",
      "Simulating a TM is not computable",
      "\\(M\\) might accept a string other than \\(w\\)",
      "TMs cannot be simulated by other TMs"
    ],
    answer: 0,
    explanation: "A decider must always halt. If \\(M\\) loops on \\(w\\), plain simulation loops forever, so it never rejects. The \\(HALT_{TM}\\) oracle removes this danger by first telling us whether \\(M\\) halts.",
    source: "Sipser Thm 5.1 (proof idea)",
    difficulty: 2
  },

  // ---------- E_TM ----------
  {
    id: "ch5-etm-def-fib", chapter: 5, topic: "Emptiness E_TM", type: "fib",
    prompt: "\\(E_{TM}=\\{\\langle M\\rangle \\mid M\\text{ is a TM and }L(M)=\\square\\}\\). Replace \\(\\square\\) with the name of the language for which \\(M\\) recognizes no strings (the ____ set).",
    accept: ["empty", "the empty", "empty set", "emptyset"],
    explanation: "\\(E_{TM}\\) asks whether \\(L(M)=\\emptyset\\): the machine accepts no string at all. Sipser proves it undecidable in Theorem 5.2.",
    source: "Sipser Thm 5.2",
    difficulty: 1
  },
  {
    id: "ch5-etm-modified-machine", chapter: 5, topic: "Emptiness E_TM", type: "mc",
    prompt: "In the proof that \\(E_{TM}\\) is undecidable, given \\(\\langle M,w\\rangle\\) we build a machine \\(M_1\\) that rejects every input except \\(w\\), and on \\(w\\) runs \\(M\\). Why is \\(M_1\\) constructed this way?",
    choices: [
      "So that \\(L(M_1)\\neq\\emptyset\\) **iff** \\(M\\) accepts \\(w\\), turning the \\(A_{TM}\\) question into an emptiness question",
      "So that \\(M_1\\) halts on every input",
      "So that \\(L(M_1)\\) is always regular",
      "So that \\(M_1\\) is an LBA"
    ],
    answer: 0,
    explanation: "The only string \\(M_1\\) could possibly accept is \\(w\\), so \\(L(M_1)\\) is nonempty exactly when \\(M\\) accepts \\(w\\). Feeding \\(\\langle M_1\\rangle\\) to an \\(E_{TM}\\) decider therefore answers \\(A_{TM}\\).",
    source: "Sipser Thm 5.2 (proof)",
    difficulty: 2
  },

  // ---------- REGULAR_TM ----------
  {
    id: "ch5-regular-m2-construction", chapter: 5, topic: "REGULAR_TM", type: "mc",
    prompt: "\\(REGULAR_{TM}=\\{\\langle M\\rangle \\mid L(M)\\text{ is regular}\\}\\) is undecidable. In the reduction, \\(M_2\\) on input \\(x\\) accepts every \\(x\\) of the form \\(0^n1^n\\), and otherwise runs \\(M\\) on \\(w\\) and accepts if \\(M\\) does. What is \\(L(M_2)\\) when \\(M\\) **accepts** \\(w\\)?",
    choices: [
      "\\(\\Sigma^*\\) (a regular language)",
      "\\(\\{0^n1^n\\mid n\\ge 0\\}\\) (nonregular)",
      "\\(\\emptyset\\)",
      "exactly \\(\\{w\\}\\)"
    ],
    answer: 0,
    explanation: "If \\(M\\) accepts \\(w\\), then for every \\(x\\) the second clause accepts, so \\(M_2\\) accepts all strings: \\(L(M_2)=\\Sigma^*\\), which is regular. If \\(M\\) does not accept \\(w\\), \\(M_2\\) accepts only \\(\\{0^n1^n\\}\\), nonregular. So \\(L(M_2)\\) is regular iff \\(M\\) accepts \\(w\\).",
    source: "Sipser Thm 5.3 (proof)",
    difficulty: 3
  },

  // ---------- EQ_TM ----------
  {
    id: "ch5-eqtm-reduce-from", chapter: 5, topic: "Equivalence EQ_TM", type: "mc",
    prompt: "Sipser proves \\(EQ_{TM}=\\{\\langle M_1,M_2\\rangle \\mid L(M_1)=L(M_2)\\}\\) undecidable most conveniently by reducing which problem to it?",
    choices: [
      "\\(E_{TM}\\)",
      "\\(A_{LBA}\\)",
      "\\(ALL_{CFG}\\)",
      "\\(PCP\\)"
    ],
    answer: 0,
    explanation: "Take \\(\\langle M\\rangle\\) and output \\(\\langle M, M_1\\rangle\\) where \\(M_1\\) rejects all inputs (so \\(L(M_1)=\\emptyset\\)). Then \\(L(M)=L(M_1)\\) iff \\(L(M)=\\emptyset\\). Thus \\(E_{TM}\\) is the special case of \\(EQ_{TM}\\) with one machine fixed to recognize \\(\\emptyset\\).",
    source: "Sipser Thm 5.4",
    difficulty: 2
  },

  // ---------- Computation histories & LBAs ----------
  {
    id: "ch5-comphist-def", chapter: 5, topic: "Computation histories", type: "mc",
    prompt: "An **accepting computation history** for \\(M\\) on \\(w\\) is:",
    choices: [
      "a sequence of configurations \\(C_1,\\dots,C_l\\) where \\(C_1\\) is the start config, \\(C_l\\) is accepting, and each \\(C_{i+1}\\) legally follows \\(C_i\\)",
      "the set of all strings \\(M\\) accepts",
      "the transition function of \\(M\\) written out",
      "an infinite sequence of configurations \\(M\\) passes through"
    ],
    answer: 0,
    explanation: "It is the finite, complete record of an accepting run: start configuration, each step legal under \\(\\delta\\), ending in an accepting configuration. If \\(M\\) does not halt on \\(w\\), no such (finite) history exists.",
    source: "Sipser Def 5.5",
    difficulty: 1
  },
  {
    id: "ch5-lba-config-count", chapter: 5, topic: "Linear bounded automata", type: "mc",
    prompt: "A linear bounded automaton (LBA) is a TM whose head may not leave the input portion of the tape. An LBA with \\(q\\) states and \\(g\\) tape symbols, on a tape of length \\(n\\), has exactly how many distinct configurations?",
    choices: ["\\(q\\,n\\,g^{n}\\)", "\\(q\\,g\\,n\\)", "\\(q^{n}g^{n}\\)", "\\(2^{qn}\\)"],
    answer: 0,
    explanation: "A configuration is (state, head position, tape contents): \\(q\\) states, \\(n\\) head positions, and \\(g^{n}\\) tape strings, giving \\(q\\,n\\,g^{n}\\). The finiteness of this count makes looping detectable.",
    source: "Sipser Def 5.6, Lemma 5.8",
    difficulty: 2
  },
  {
    id: "ch5-alba-decidable-tf", chapter: 5, topic: "Linear bounded automata", type: "tf",
    prompt: "\\(A_{LBA}=\\{\\langle M,w\\rangle \\mid M\\text{ is an LBA that accepts }w\\}\\) is decidable.",
    answer: true,
    explanation: "Simulate \\(M\\) on \\(w\\) for \\(q\\,n\\,g^{n}\\) steps (Lemma 5.8). If it has not halted by then it must have repeated a configuration and is looping, so we may safely reject. \\(A_{LBA}\\) is decidable even though \\(A_{TM}\\) is not.",
    source: "Sipser Thm 5.9",
    difficulty: 2
  },
  {
    id: "ch5-alba-vs-atm", chapter: 5, topic: "Linear bounded automata", type: "mc",
    prompt: "Which statement correctly contrasts \\(A_{LBA}\\) and \\(A_{TM}\\)?",
    choices: [
      "\\(A_{LBA}\\) is decidable but \\(A_{TM}\\) is undecidable",
      "Both are undecidable",
      "Both are decidable",
      "\\(A_{LBA}\\) is undecidable but \\(A_{TM}\\) is decidable"
    ],
    answer: 0,
    explanation: "The bounded tape gives an LBA only finitely many configurations, so looping is detectable and \\(A_{LBA}\\) is decidable (Thm 5.9). An unrestricted TM can loop undetectably, so \\(A_{TM}\\) is undecidable (Thm 4.11).",
    source: "Sipser Thm 5.9",
    difficulty: 2
  },
  {
    id: "ch5-elba-undecidable-tf", chapter: 5, topic: "Linear bounded automata", type: "tf",
    prompt: "\\(E_{LBA}=\\{\\langle M\\rangle \\mid M\\text{ is an LBA and }L(M)=\\emptyset\\}\\) is decidable.",
    answer: false,
    explanation: "\\(E_{LBA}\\) is **undecidable** (Thm 5.10), by reduction from \\(A_{TM}\\) via computation histories: build an LBA \\(B\\) whose language is the set of accepting computation histories of \\(M\\) on \\(w\\), so \\(L(B)\\neq\\emptyset\\) iff \\(M\\) accepts \\(w\\).",
    source: "Sipser Thm 5.10",
    difficulty: 2
  },
  {
    id: "ch5-elba-b-language", chapter: 5, topic: "Linear bounded automata", type: "mc",
    prompt: "In the proof that \\(E_{LBA}\\) is undecidable, the LBA \\(B\\) built from \\(M\\) and \\(w\\) is designed to accept exactly:",
    choices: [
      "the accepting computation histories of \\(M\\) on \\(w\\)",
      "every string over the alphabet",
      "the encodings of all LBAs",
      "the strings \\(M\\) rejects"
    ],
    answer: 0,
    explanation: "\\(B\\) checks whether its input is a valid accepting computation history for \\(M\\) on \\(w\\). Such a history exists iff \\(M\\) accepts \\(w\\); thus \\(L(B)\\) is nonempty exactly when \\(M\\) accepts \\(w\\). An LBA can verify step-by-step legality by zig-zagging between adjacent configurations.",
    source: "Sipser Thm 5.10 (proof)",
    difficulty: 3
  },

  // ---------- ALL_CFG and EQ_CFG ----------
  {
    id: "ch5-allcfg-reverse-trick", chapter: 5, topic: "CFG problems", type: "mc",
    prompt: "\\(ALL_{CFG}=\\{\\langle G\\rangle \\mid L(G)=\\Sigma^*\\}\\) is undecidable. In the reduction, \\(G\\) generates all strings that are **not** accepting computation histories of \\(M\\) on \\(w\\). Why is every **other** configuration written in reverse order?",
    choices: [
      "So a PDA can pop a configuration off the stack in the correct order to compare it with the next one",
      "To make the history shorter",
      "To make \\(L(G)\\) regular",
      "Because TMs require reversed input"
    ],
    answer: 0,
    explanation: "A stack pops in reverse, so a directly-pushed \\(C_i\\) would come off backward and not align with \\(C_{i+1}\\). Writing alternate configurations reversed lets the PDA pop \\(C_i\\) in an order suitable for comparison. Then \\(L(G)=\\Sigma^*\\) iff \\(M\\) does not accept \\(w\\).",
    source: "Sipser Thm 5.13 (proof, Fig 5.14)",
    difficulty: 3
  },
  {
    id: "ch5-eqcfg-undecidable-tf", chapter: 5, topic: "CFG problems", type: "tf",
    prompt: "\\(EQ_{CFG}=\\{\\langle G,H\\rangle \\mid G,H\\text{ are CFGs and }L(G)=L(H)\\}\\) is undecidable.",
    answer: true,
    explanation: "It follows from \\(ALL_{CFG}\\): fix \\(H\\) to a CFG with \\(L(H)=\\Sigma^*\\); then \\(L(G)=L(H)\\) iff \\(L(G)=\\Sigma^*\\), reducing the undecidable \\(ALL_{CFG}\\) to \\(EQ_{CFG}\\) (Exercise 5.1).",
    source: "Sipser Ex 5.1 (via Thm 5.13)",
    difficulty: 2
  },

  // ---------- PCP ----------
  {
    id: "ch5-pcp-match-encodes", chapter: 5, topic: "Post Correspondence Problem", type: "mc",
    prompt: "The Post Correspondence Problem (find an ordering of dominos so the concatenated top string equals the concatenated bottom string) is undecidable. In Sipser's proof, a match of the constructed instance \\(P\\) corresponds to:",
    choices: [
      "an accepting computation history of \\(M\\) on \\(w\\)",
      "a rejecting computation history of \\(M\\) on \\(w\\)",
      "the transition table of \\(M\\)",
      "an arbitrary string in \\(L(M)\\)"
    ],
    answer: 0,
    explanation: "The dominos force any match to simulate \\(M\\) on \\(w\\) step by step, so a match exists iff \\(M\\) accepts \\(w\\) (its accepting computation history can be assembled). Deciding \\(PCP\\) would thus decide \\(A_{TM}\\).",
    source: "Sipser Thm 5.15 (proof idea)",
    difficulty: 2
  },
  {
    id: "ch5-mpcp-order", chapter: 5, topic: "Post Correspondence Problem", type: "order",
    prompt: "Order the high-level steps of Sipser's proof that \\(PCP\\) is undecidable.",
    items: [
      "Assume a decider for \\(PCP\\) and start from a TM \\(M\\) and input \\(w\\)",
      "Build an MPCP instance \\(P'\\) whose forced match simulates \\(M\\) on \\(w\\)",
      "Convert \\(P'\\) to a PCP instance \\(P\\) (using the starred-symbol trick to force the first domino)",
      "Conclude \\(P\\) has a match iff \\(M\\) accepts \\(w\\), deciding \\(A_{TM}\\) — a contradiction"
    ],
    explanation: "Sipser first reduces \\(A_{TM}\\le_m MPCP\\) (match must start with the first domino), then \\(MPCP\\le_m PCP\\) via the \\(\\star\\)-interleaving trick. Composed, \\(A_{TM}\\le_m PCP\\), so \\(PCP\\) is undecidable.",
    source: "Sipser Thm 5.15; Ex 5.25",
    difficulty: 3
  },

  // ---------- Mapping reducibility: definition & computable functions ----------
  {
    id: "ch5-computable-fn-def", chapter: 5, topic: "Computable functions", type: "mc",
    prompt: "A function \\(f:\\Sigma^*\\to\\Sigma^*\\) is a **computable function** if:",
    choices: [
      "some TM, on every input \\(w\\), halts with just \\(f(w)\\) on its tape",
      "some TM recognizes the set \\(\\{f(w)\\mid w\\in\\Sigma^*\\}\\)",
      "\\(f\\) is one-to-one and onto",
      "\\(f\\) is computable by a DFA"
    ],
    answer: 0,
    explanation: "Computability of \\(f\\) means a TM transforms each input \\(w\\) into the output \\(f(w)\\) and always halts. Such functions include arithmetic and transformations of machine descriptions.",
    source: "Sipser Def 5.17",
    difficulty: 1
  },
  {
    id: "ch5-mapping-def-fib", chapter: 5, topic: "Mapping reducibility", type: "fib",
    prompt: "Complete Definition 5.20: \\(A\\le_m B\\) if there is a computable \\(f\\) with, for every \\(w\\), \\(w\\in A \\Leftrightarrow f(w)\\in \\underline{\\hphantom{XX}}\\). (Give the single language symbol.)",
    accept: ["B", "b"],
    explanation: "Mapping reducibility requires \\(w\\in A \\iff f(w)\\in B\\): the reduction sends members of \\(A\\) to members of \\(B\\) and non-members to non-members. \\(f\\) is called the reduction from \\(A\\) to \\(B\\).",
    source: "Sipser Def 5.20",
    difficulty: 1
  },
  {
    id: "ch5-mapping-iff-both-directions", chapter: 5, topic: "Mapping reducibility", type: "multi",
    prompt: "For a computable \\(f\\) to witness \\(A\\le_m B\\) (Def 5.20), which conditions must hold for every \\(w\\)? Select all that apply.",
    choices: [
      "If \\(w\\in A\\) then \\(f(w)\\in B\\)",
      "If \\(w\\notin A\\) then \\(f(w)\\notin B\\)",
      "\\(f\\) is total and computable (halts on every input)",
      "\\(f\\) must be a bijection"
    ],
    answers: [0, 1, 2],
    explanation: "The biconditional \\(w\\in A\\iff f(w)\\in B\\) bundles both implications, and \\(f\\) must be a (total) computable function. It need not be injective or surjective — many inputs may map to the same output (``many-one'' reducibility).",
    source: "Sipser Def 5.20",
    difficulty: 2
  },
  {
    id: "ch5-mapping-notation-fib", chapter: 5, topic: "Mapping reducibility", type: "fib",
    prompt: "Mapping reducibility is also known in other textbooks as ____ reducibility (the term Sipser notes in a footnote; hyphenated).",
    accept: ["many-one", "many one", "manyone"],
    explanation: "Sipser's mapping reducibility \\(\\le_m\\) is the same notion called *many-one* reducibility elsewhere, reflecting that the reduction function need not be one-to-one.",
    source: "Sipser §5.3 (footnote to Def 5.20)",
    difficulty: 1
  },

  // ---------- Key theorems about mapping reducibility ----------
  {
    id: "ch5-cor523-undecidable", chapter: 5, topic: "Mapping reducibility theorems", type: "tf",
    prompt: "If \\(A\\le_m B\\) and \\(A\\) is undecidable, then \\(B\\) is undecidable.",
    answer: true,
    explanation: "This is the contrapositive of Theorem 5.22 and the main tool for undecidability proofs: a decider for \\(B\\) would, via \\(f\\), give a decider for \\(A\\). So \\(B\\) inherits undecidability from \\(A\\).",
    source: "Sipser Cor 5.23",
    difficulty: 1
  },
  {
    id: "ch5-complement-equivalence-tf", chapter: 5, topic: "Recognizability via reductions", type: "tf",
    prompt: "\\(A\\le_m B\\) holds if and only if \\(\\overline{A}\\le_m \\overline{B}\\).",
    answer: true,
    explanation: "The very same computable \\(f\\) witnessing \\(w\\in A\\iff f(w)\\in B\\) also witnesses \\(w\\in\\overline{A}\\iff f(w)\\in\\overline{B}\\). This sensitivity to complementation is what powers non-recognizability proofs.",
    source: "Sipser §5.3 (Def 5.20 consequence)",
    difficulty: 2
  },
  {
    id: "ch5-cor529-nonrecognizable", chapter: 5, topic: "Recognizability via reductions", type: "mc",
    prompt: "Theorem 5.28 says: if \\(A\\le_m B\\) and \\(B\\) is Turing-recognizable, then \\(A\\) is Turing-recognizable. To prove that a language \\(B\\) is **not** Turing-recognizable (Cor 5.29), a typical move is to show:",
    choices: [
      "\\(\\overline{A_{TM}}\\le_m B\\) (equivalently \\(A_{TM}\\le_m \\overline{B}\\))",
      "\\(A_{TM}\\le_m B\\)",
      "\\(B\\le_m A_{TM}\\)",
      "\\(B\\) is decidable"
    ],
    answer: 0,
    explanation: "\\(\\overline{A_{TM}}\\) is not recognizable (Cor 4.23). By Corollary 5.29, if \\(\\overline{A_{TM}}\\le_m B\\) then \\(B\\) is not recognizable either. Note \\(\\overline{A_{TM}}\\le_m B\\) is the same as \\(A_{TM}\\le_m \\overline{B}\\).",
    source: "Sipser Thm 5.28, Cor 5.29",
    difficulty: 3
  },

  // ---------- EQ_TM: neither recognizable nor co-recognizable ----------
  {
    id: "ch5-eqtm-neither-tf", chapter: 5, topic: "EQ_TM recognizability", type: "tf",
    prompt: "\\(EQ_{TM}\\) is neither Turing-recognizable nor co-Turing-recognizable.",
    answer: true,
    explanation: "Theorem 5.30 shows \\(A_{TM}\\le_m \\overline{EQ_{TM}}\\) (so \\(EQ_{TM}\\) is not recognizable) and \\(A_{TM}\\le_m EQ_{TM}\\) (so \\(\\overline{EQ_{TM}}\\) is not recognizable, i.e. \\(EQ_{TM}\\) is not co-recognizable).",
    source: "Sipser Thm 5.30",
    difficulty: 2
  },

  // ---------- Rice's theorem ----------
  {
    id: "ch5-rice-statement", chapter: 5, topic: "Rice's theorem", type: "mc",
    prompt: "**Rice's theorem** states that:",
    choices: [
      "every nontrivial property of the language recognized by a TM is undecidable",
      "every property of a TM's transition function is undecidable",
      "no property of TM languages is decidable, trivial or not",
      "the language of every TM is undecidable"
    ],
    answer: 0,
    explanation: "Rice's theorem: any property \\(P\\) that depends only on \\(L(M)\\) and is *nontrivial* (held by some TMs, not all) is undecidable. Properties of the machine's syntax (not its language) are exempt, and trivial properties are decidable.",
    source: "Sipser Problem 5.28",
    difficulty: 2
  },
  {
    id: "ch5-rice-conditions-multi", chapter: 5, topic: "Rice's theorem", type: "multi",
    prompt: "For Rice's theorem to declare a property \\(P\\) of TMs undecidable, \\(P\\) must satisfy which conditions? Select all that apply.",
    choices: [
      "\\(P\\) is nontrivial: some TMs have it and some do not",
      "\\(P\\) depends only on the language: if \\(L(M_1)=L(M_2)\\) then \\(\\langle M_1\\rangle\\in P \\Leftrightarrow \\langle M_2\\rangle\\in P\\)",
      "\\(P\\) holds for every TM",
      "\\(P\\) is a property of the machine's number of states"
    ],
    answers: [0, 1],
    explanation: "Both nontriviality and language-dependence are required (Problem 5.28). A property held by all (or no) machines is trivial and decidable; a property of the machine's syntax, like state count, need not be undecidable.",
    source: "Sipser Problem 5.28",
    difficulty: 2
  },
  {
    id: "ch5-rice-applies-multi", chapter: 5, topic: "Rice's theorem", type: "multi",
    prompt: "By Rice's theorem, which of these languages are undecidable? Select all that apply.",
    choices: [
      "\\(INFINITE_{TM}=\\{\\langle M\\rangle \\mid L(M)\\text{ is infinite}\\}\\)",
      "\\(\\{\\langle M\\rangle \\mid 1011\\in L(M)\\}\\)",
      "\\(ALL_{TM}=\\{\\langle M\\rangle \\mid L(M)=\\Sigma^*\\}\\)",
      "\\(\\{\\langle M\\rangle \\mid M\\text{ has at least 5 states}\\}\\)"
    ],
    answers: [0, 1, 2],
    explanation: "The first three are nontrivial language properties, hence undecidable (Problem 5.30). ``Has at least 5 states'' is a syntactic property of the machine — not a property of \\(L(M)\\) — so Rice's theorem does not apply (and it is in fact decidable).",
    source: "Sipser Problem 5.30",
    difficulty: 2
  },

  // ---------- Synthesis / classification ----------
  {
    id: "ch5-classify-multi", chapter: 5, topic: "Decidability classification", type: "multi",
    prompt: "Which of the following languages are **decidable**? Select all that apply.",
    choices: [
      "\\(A_{LBA}\\) (does an LBA accept its input?)",
      "\\(E_{CFG}\\) (is a CFG's language empty?)",
      "\\(E_{LBA}\\) (is an LBA's language empty?)",
      "\\(HALT_{TM}\\) (does a TM halt on its input?)"
    ],
    answers: [0, 1],
    explanation: "\\(A_{LBA}\\) (Thm 5.9) and \\(E_{CFG}\\) (Thm 4.8) are decidable. \\(E_{LBA}\\) (Thm 5.10) and \\(HALT_{TM}\\) (Thm 5.1) are undecidable. Note how the bounded tape makes acceptance decidable yet emptiness still is not.",
    source: "Sipser Thms 5.9, 4.8, 5.10, 5.1",
    difficulty: 3
  },
  {
    id: "ch5-classify-undecidable-multi", chapter: 5, topic: "Decidability classification", type: "multi",
    prompt: "Which of the following are **undecidable**? Select all that apply.",
    choices: [
      "\\(REGULAR_{TM}\\)",
      "\\(EQ_{TM}\\)",
      "\\(PCP\\)",
      "\\(A_{LBA}\\)"
    ],
    answers: [0, 1, 2],
    explanation: "\\(REGULAR_{TM}\\) (Thm 5.3), \\(EQ_{TM}\\) (Thm 5.4), and \\(PCP\\) (Thm 5.15) are undecidable. \\(A_{LBA}\\) is decidable (Thm 5.9), so it does not belong — a frequent trap given that \\(E_{LBA}\\) is undecidable.",
    source: "Sipser Thms 5.3, 5.4, 5.15, 5.9",
    difficulty: 2
  },
  {
    id: "ch5-recognizable-classify", chapter: 5, topic: "Decidability classification", type: "mc",
    prompt: "Which language is Turing-recognizable but **not** decidable?",
    choices: [
      "\\(A_{TM}\\)",
      "\\(EQ_{TM}\\)",
      "\\(\\overline{A_{TM}}\\)",
      "\\(A_{LBA}\\)"
    ],
    answer: 0,
    explanation: "\\(A_{TM}\\) is recognizable (simulate \\(M\\) on \\(w\\)) but undecidable. \\(\\overline{A_{TM}}\\) is not even recognizable; \\(EQ_{TM}\\) is neither recognizable nor co-recognizable; \\(A_{LBA}\\) is fully decidable.",
    source: "Sipser §4.2, Thm 5.30, Thm 5.9",
    difficulty: 2
  }
]);
