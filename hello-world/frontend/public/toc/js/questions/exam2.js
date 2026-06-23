/* Exam 2 Practice (chapter 11) — checkpoint over Chapters 3-5.
   From the past Exam 2 (Turing machines, decidability, reducibility), the
   decidability exam-prep handout, and review 3.13 / 4.15. Unlocks once Ch 3-5
   are mastered. */
TOC.addQuestions([
  // ---- FA halts, TM need not (Exam 2 Q1a) ----
  {
    id: "exam-fa-halts-tm-may-not-mc", chapter: 11, topic: "Turing machines", type: "mc",
    prompt: "Why does a finite automaton always halt on every input, while a Turing machine need not?",
    choices: [
      "An FA makes one move per input symbol and stops when the input is consumed; a TM can move its head either way, rewrite the tape, and loop forever without ever entering accept or reject",
      "An FA has finitely many states but a TM has infinitely many states",
      "A TM cannot read its input, so it never knows when to stop",
      "An FA has no reject state, so it cannot get stuck"
    ],
    answer: 0,
    explanation: "An FA processes each input symbol once and halts when input is exhausted. A TM halts only upon entering its accept or reject state; nothing forces that to happen, so a TM may run forever (loop).",
    source: "Exam 2 Q1(a)"
  },,
  // ---- recognize vs decide (Exam 2 Q1b,c) ----
  {
    id: "exam-decide-needs-halting-tf", chapter: 11, topic: "Decidability", type: "tf",
    prompt: "To **decide** a language it is enough that the Turing machine accept every string in the language and reject every string not in it; whether it halts on all inputs is irrelevant.",
    answer: false,
    explanation: "Deciding requires the machine to be a decider — it must HALT on every input. A recognizer that merely accepts members may loop forever on some non-members and so does not decide; halting on all inputs is the extra requirement that separates deciding from recognizing.",
    source: "Exam 2 Q1(b),(c)"
  },,
  // ---- Implementation-level TM (Exam 2 Q3) ----
  {
    id: "exam-tm-three-times-as-many-mc", chapter: 11, topic: "Turing machines", type: "mc",
    prompt: "You must give an implementation-level decider for \\(\\{w \\mid w \\text{ has three times as many } a\\text{'s as } b\\text{'s}\\}\\). Which loop body correctly enforces the 3-to-1 ratio?",
    choices: [
      "Repeat until no unmarked \\(b\\) remains: mark one unmarked \\(b\\), then mark three unmarked \\(a\\)'s (reject if fewer than three remain); finally accept iff no unmarked \\(a\\) or \\(b\\) is left",
      "Scan once and accept iff the first symbol is \\(a\\)",
      "Mark one \\(a\\) for each \\(b\\), then accept iff the tape is empty",
      "Count the \\(a\\)'s, then accept iff that count is even"
    ],
    answer: 0,
    explanation: "Pairing each \\(b\\) with three \\(a\\)'s and checking nothing is left over decides \\(\\#a=3\\,\\#b\\). The bounded marking loop always halts, so it is a decider. (\\(aaab\\) accepts; \\(aab\\) leaves an unmarked symbol and rejects.)",
    source: "Exam 2 Q3"
  },,
  // ---- T = <R,S> CFG subseteq NFA decidable (Exam 2 Q4) ----
  {
    id: "exam-cfg-sub-nfa-method-order", chapter: 11, topic: "Decidability", type: "order",
    prompt: "Order the steps of the Exam 2 decider showing \\(T=\\{\\langle R,S\\rangle \\mid R \\text{ a CFG},\\ S \\text{ an NFA},\\ L(R)\\subseteq L(S)\\}\\) is decidable.",
    items: [
      "Convert the NFA \\(S\\) to an equivalent DFA \\(D\\)",
      "Complement \\(D\\) to get \\(\\overline{D}\\), so \\(L(\\overline{D})=\\overline{L(S)}\\)",
      "Build a CFG \\(G\\) with \\(L(G)=L(R)\\cap L(\\overline{D})\\) (CFL \\(\\cap\\) regular is a CFL)",
      "Run the \\(E_{CFG}\\) decider on \\(G\\); accept iff \\(L(G)=\\emptyset\\)"
    ],
    explanation: "\\(L(R)\\subseteq L(S)\\) exactly when \\(R\\) generates nothing outside \\(L(S)\\), i.e. \\(L(R)\\cap\\overline{L(S)}=\\emptyset\\). Each step is effective and the final \\(E_{CFG}\\) test halts (Thm 4.8), so \\(T\\) is decidable. Note you complement the regular side, since CFLs are not closed under complement.",
    source: "Exam 2 Q4"
  },,
  {
    id: "exam-ecfg-decidable-tf", chapter: 11, topic: "Decidability", type: "tf",
    prompt: "\\(E_{CFG}=\\{\\langle G\\rangle \\mid G \\text{ is a CFG and } L(G)=\\emptyset\\}\\) is decidable.",
    answer: true,
    explanation: "Emptiness of a CFG is decidable (Sipser Thm 4.8): mark which variables can derive a terminal string and check whether the start variable becomes marked. This is the engine behind the Exam 2 Q4 containment proof.",
    source: "Exam 2 Q4 / Sipser Thm 4.8"
  },,
  // ---- K rejects "2" undecidable via A_TM (Exam 2 Q5) ----
  {
    id: "exam-k-rejects-2-undecidable-mc", chapter: 11, topic: "Reducibility", type: "mc",
    prompt: "Consider \\(\\{\\langle K\\rangle \\mid \\text{TM } K \\text{ rejects the input string } \"2\"\\}\\). Using that \\(A_{TM}\\) is undecidable, what is its status?",
    choices: [
      "Undecidable, by reducing \\(A_{TM}\\) to it",
      "Decidable, by simulating \\(K\\) on \\(\"2\"\\) for finitely many steps",
      "Decidable, because rejection is the complement of acceptance",
      "Decidable by Rice's theorem"
    ],
    answer: 0,
    explanation: "Given \\(\\langle M,w\\rangle\\), build \\(K\\) that on input \\(x\\): if \\(x=\"2\"\\) simulate \\(M\\) on \\(w\\) and flip the outcome (so \\(K\\) rejects \\(\"2\"\\) iff \\(M\\) accepts \\(w\\)). A decider for the language would then decide \\(A_{TM}\\) — impossible. Pinning the input to a fixed constant like \\(\"2\"\\) never makes acceptance/rejection decidable; it is still \\(A_{TM}\\). (Rice would also call it undecidable, but Rice is not in Sipser's main text.)",
    source: "Exam 2 Q5 (cf. Decidability Exam Prep, Problem 3)"
  },,
  // ---- complement recognizable + reduces => decidable (Exam 2 Q6) ----
  {
    id: "exam-cobar-recognizable-decidable-mc", chapter: 11, topic: "Recognizability", type: "mc",
    prompt: "Suppose \\(\\overline{D}\\) is Turing-recognizable and \\(\\overline{D}\\le_m D\\). Why does it follow that \\(\\overline{D}\\) is **decidable**?",
    choices: [
      "From \\(\\overline{D}\\le_m D\\) we also get \\(D\\le_m\\overline{D}\\), so \\(D\\) is recognizable too; \\(D\\) and \\(\\overline{D}\\) both recognizable makes \\(\\overline{D}\\) decidable",
      "Any language that is Turing-recognizable is automatically decidable",
      "Mapping reductions always preserve decidability in one direction only",
      "\\(\\overline{D}\\le_m D\\) means \\(\\overline{D}=D\\), which is decidable"
    ],
    answer: 0,
    explanation: "A reduction \\(A\\le_m B\\) is equivalently \\(\\overline{A}\\le_m\\overline{B}\\); here \\(\\overline{D}\\le_m D\\) gives \\(D\\le_m\\overline{D}\\). Since \\(\\overline{D}\\) is recognizable and recognizability transfers along \\(\\le_m\\), \\(D\\) is recognizable. A language both recognizable and co-recognizable is decidable (Thm 4.22).",
    source: "Exam 2 Q6 / Sipser Thm 4.22"
  },,
  // ---- Problem 1: Schrodinger / fixed string ----
  {
    id: "exam-prep-fixed-string-decidable-tf", chapter: 11, topic: "Decidability", type: "tf",
    prompt: "Let \\(SC\\) contain the single fixed string \\(s\\), where \\(s=\"alive\"\\) if a (still-unopened-box) cat is alive and \\(s=\"dead\"\\) otherwise. \\(SC\\) is decidable even though we cannot tell which string it is.",
    answer: true,
    explanation: "\\(SC\\) is one fixed finite language — either \\(\\{\\text{alive}\\}\\) or \\(\\{\\text{dead}\\}\\) — and every finite language is regular, hence decidable. Decidability is the EXISTENCE of a decider, not our ability to identify it; the unopened box is a red herring.",
    source: "Decidability Exam Prep, Problem 1"
  },,
  // ---- Problem 2(a) vs 2(b): the one-word flip ----
  {
    id: "exam-prep-at-most-steps-tf", chapter: 11, topic: "Decidability", type: "tf",
    prompt: "The language \\(\\{\\langle M,w\\rangle \\mid M \\text{ accepts } w \\text{ in at most } 2|w| \\text{ steps}\\}\\) is decidable.",
    answer: true,
    explanation: "\"At most \\(2|w|\\) steps\" is a hard deadline: a universal TM simulates \\(M\\) on \\(w\\) for that bounded number of steps and accepts iff \\(M\\) has accepted by then. Bounded simulation always halts, so the language is decidable.",
    source: "Decidability Exam Prep, Problem 2(a)"
  },,
  {
    id: "exam-prep-at-least-steps-mc", chapter: 11, topic: "Decidability", type: "mc",
    prompt: "Now classify \\(\\{\\langle M,w\\rangle \\mid M \\text{ accepts } w \\text{ in \\textbf{no less than} } 2|w| \\text{ steps}\\}\\) (i.e. at least \\(2|w|\\)).",
    choices: [
      "Undecidable (but Turing-recognizable) — \"at least\" removes the deadline, so an unbounded wait for acceptance is hidden; reduce \\(A_{TM}\\) with a stall gadget",
      "Decidable — simulate for \\(2|w|\\) steps and reject if it hasn't accepted",
      "Decidable, and also co-recognizable",
      "Undecidable and not even recognizable"
    ],
    answer: 0,
    explanation: "\"No less than \\(2|w|\\)\" is a floor, not a ceiling: if \\(M\\) hasn't accepted by step \\(2|w|\\) you may wait forever. Map \\(\\langle M,w\\rangle\\mapsto\\langle M',w\\rangle\\) where \\(M'\\) stalls \\(>2|x|\\) steps then simulates \\(M\\) — giving \\(A_{TM}\\le_m L\\). It is recognizable but not co-recognizable, hence not decidable.",
    source: "Decidability Exam Prep, Problem 2(b)"
  },,
  {
    id: "exam-prep-one-word-flip-fib", chapter: 11, topic: "Decidability", type: "fib",
    prompt: "In the step-budget pair, swapping \"at most\" for \"at ____\" flips the verdict from decidable to undecidable. Fill in the missing word.",
    accept: ["least", "at least"],
    explanation: "\"At most \\(k\\)\" is a bounded check (decidable); \"at least \\(k\\)\" / \"no less than \\(k\\)\" hides an unbounded wait for acceptance (undecidable). One word flips it — the handout's headline trap.",
    source: "Decidability Exam Prep, Problem 2 (\"at most vs at least\")"
  },,
  // ---- Problems 4 & 5: the master asymmetry ----
  {
    id: "exam-prep-cfl-sub-reg-decidable-mc", chapter: 11, topic: "Decidability", type: "mc",
    prompt: "Classify \\(\\{\\langle G,E\\rangle \\mid G \\text{ a CFG},\\ E \\text{ a regex},\\ L(G)\\subseteq L(E)\\}\\) (a CFL inside a regular set).",
    choices: [
      "Decidable — \\(L(G)\\subseteq L(E)\\iff L(G)\\cap\\overline{L(E)}=\\emptyset\\); \\(\\overline{L(E)}\\) is regular, the intersection is a CFL, so test \\(E_{CFG}\\)",
      "Undecidable — reduce \\(ALL_{CFG}\\)",
      "Undecidable — CFLs are not closed under complement",
      "Decidable only when \\(L(E)=\\Sigma^*\\)"
    ],
    answer: 0,
    explanation: "Complement the REGULAR side (regular languages are closed under complement); a CFL intersected with a regular language is still a CFL, so build \\(G'\\) with \\(L(G')=L(G)\\cap\\overline{L(E)}\\) and run the decidable \\(E_{CFG}\\) test. Every step halts.",
    source: "Decidability Exam Prep, Problem 4"
  },,
  {
    id: "exam-prep-reg-sub-cfl-undecidable-mc", chapter: 11, topic: "Decidability", type: "mc",
    prompt: "Now reverse the containment: \\(\\{\\langle G,E\\rangle \\mid G \\text{ a CFG},\\ E \\text{ a regex},\\ L(E)\\subseteq L(G)\\}\\) (a regular set inside a CFL).",
    choices: [
      "Undecidable — take \\(L(E)=\\Sigma^*\\); then \\(L(E)\\subseteq L(G)\\iff L(G)=\\Sigma^*\\), which is \\(ALL_{CFG}\\)",
      "Decidable — same emptiness trick as the other direction",
      "Decidable — intersect and test \\(E_{CFG}\\)",
      "Undecidable, and also non-recognizable for trivial reasons"
    ],
    answer: 0,
    explanation: "With \\(L(E)=\\Sigma^*\\) the question becomes \"does \\(G\\) generate every string?\" — CFG universality, \\(ALL_{CFG}\\), undecidable (Thm 5.13). The other direction would need to complement a CFL, which is not closed under complement, so the emptiness trick fails here.",
    source: "Decidability Exam Prep, Problem 5"
  },,
  // ---- Self-test items (a)-(e) ----
  {
    id: "exam-prep-selftest-classify-multi", chapter: 11, topic: "Decidability", type: "multi",
    prompt: "From the handout's self-test, select **every** language that is **decidable**:",
    choices: [
      "\\(\\{\\langle M,w\\rangle \\mid M \\text{ accepts } w \\text{ in exactly } 2|w| \\text{ steps}\\}\\)",
      "\\(\\{\\langle M\\rangle \\mid M \\text{ accepts } \"2\" \\text{ within } 100 \\text{ steps}\\}\\)",
      "\\(\\{\\langle G,E\\rangle \\mid L(G)\\cap L(E)=\\emptyset\\}\\) (\\(G\\) a CFG, \\(E\\) a regex)",
      "\\(\\{\\langle G,E\\rangle \\mid L(G)=L(E)\\}\\) (\\(G\\) a CFG, \\(E\\) a regex)",
      "\\(A_{TM}=\\{\\langle M,w\\rangle \\mid M \\text{ accepts } w\\}\\)"
    ],
    answers: [0, 1, 2],
    explanation: "(a) exactly \\(2|w|\\) steps and (b) within \\(100\\) steps are bounded simulations (decidable); (c) CFL \\(\\cap\\) regular is a CFL, test \\(E_{CFG}\\) (decidable). (d) equality includes the regular-\\(\\subseteq\\)-CFL direction (\\(ALL_{CFG}\\), undecidable) and (e) is \\(A_{TM}\\) itself (undecidable).",
    source: "Decidability Exam Prep, Self-test (a)-(e)"
  },,
  // ---- 3.13 / 4.15: Ch 3/4 TM & decidability review ----
  {
    id: "exam-review-decidable-imp-recognizable-tf", chapter: 11, topic: "Decidability", type: "tf",
    prompt: "Every decidable language is Turing-recognizable, but not every Turing-recognizable language is decidable.",
    answer: true,
    explanation: "A decider is in particular a recognizer, so decidable \\(\\Rightarrow\\) recognizable. The converse fails: \\(A_{TM}\\) is recognizable yet undecidable (Thm 4.11), separating the two classes — a core Ch. 3-4 review fact.",
    source: "Course review, Sipser Ch. 3-4 (3.13 / 4.15)"
  },,
  {
    id: "exam-review-atm-undecidable-source-fib", chapter: 11, topic: "Decidability", type: "fib",
    prompt: "The canonical undecidable language used as the starting point for most reductions in Ch. 4-5 is the **acceptance problem** for Turing machines. Write its standard symbol (subscripted name).",
    accept: ["A_{TM}", "A_TM", "ATM", "A TM", "a_{tm}", "atm"],
    explanation: "\\(A_{TM}=\\{\\langle M,w\\rangle \\mid M \\text{ accepts } w\\}\\) is Turing-recognizable but undecidable (Sipser Thm 4.11). It anchors the reductions in the prep handout and Exam 2.",
    source: "Course review, Sipser 4.11"
  }
]);
