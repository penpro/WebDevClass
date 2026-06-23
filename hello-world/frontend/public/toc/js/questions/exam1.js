/* Exam 1 Practice (chapter 10) — checkpoint over Chapters 0-2.
   Drawn from the past Exam 1 (regular & context-free languages) and review
   problems 1.46 / 2.47. Unlocks once Ch 0-2 are mastered. */
TOC.addQuestions([
  // ---- Degree / handshake subtlety (Exam 1 Q1) ----
  {
    id: "exam-degree-equal-simple-tf", chapter: 10, topic: "Graphs", type: "tf",
    prompt: "In any **simple** graph (no self-loops, no multi-edges) with two or more nodes, there must exist two nodes of equal degree.",
    answer: true,
    explanation: "In a simple graph on \\(n\\ge 2\\) nodes each degree lies in \\(\\{0,1,\\dots,n-1\\}\\), but degree \\(0\\) and degree \\(n-1\\) cannot both occur, leaving only \\(n-1\\) possible values for \\(n\\) nodes — so by pigeonhole two share a degree.",
    source: "Exam 1 Q1 (refined to simple graphs)"
  },,
  {
    id: "exam-degree-equal-multigraph-mc", chapter: 10, topic: "Graphs", type: "mc",
    prompt: "Exam 1 asked to prove/disprove: \"every graph with \\(\\ge 2\\) nodes has two nodes of equal degree.\" As stated (allowing self-loops / multi-edges) the claim is **false**. Which counterexample shows this?",
    choices: [
      "Two nodes \\(A,B\\) joined by an edge, plus a self-loop on \\(B\\): then \\(\\deg(A)=1\\) but \\(\\deg(B)=3\\)",
      "Two isolated nodes with no edges: both have degree \\(0\\)",
      "A triangle on three nodes: all degrees equal \\(2\\)",
      "A single node with a self-loop: degree \\(2\\)"
    ],
    answer: 0,
    explanation: "A self-loop adds \\(2\\) to a node's degree, so \\(B\\) has degree \\(1+2=3\\) while \\(A\\) has degree \\(1\\) — distinct degrees. The pigeonhole argument that forces equal degrees requires a SIMPLE graph; multigraphs escape it.",
    source: "Exam 1 Q1"
  },,
  // ---- Finite-state transducer (Exam 1 Q2) ----
  {
    id: "exam-fst-rps-fib", chapter: 10, topic: "Finite-state transducers", type: "fib",
    prompt: "An FST plays rock-paper-scissors: on each input in \\(\\{r,p,s\\}\\) it outputs the winner versus the **previous** symbol, emitting \\(x\\) on a tie, and starts in the state where \\(r\\) was just seen. On input \\(rpssprs\\), what does it output? (7 letters, no spaces)",
    accept: ["xpsxspr", "x p s x s p r"],
    explanation: "Compare each symbol to the previous one: r vs r = x; p beats r = p; s beats p = s; s vs s = x; p beats s = s; r beats p = p; s beats r = r. Output \\(xpsxspr\\).",
    source: "Exam 1 Q2"
  },,
  // ---- DFA for complement of regular language (Exam 1 Q3) ----
  {
    id: "exam-complement-regular-closure-mc", chapter: 10, topic: "Regular languages", type: "mc",
    prompt: "Let \\(R=\\Sigma^*1100\\Sigma^*\\) over \\(\\Sigma=\\{0,1\\}\\) and \\(D=L(R)\\) (strings containing \\(1100\\)). To build a DFA recognizing \\(E=\\overline{D}\\), the simplest method is to:",
    choices: [
      "Build a DFA for \\(D\\) that tracks how much of the pattern \\(1100\\) has matched, then swap its accepting and non-accepting states",
      "Reverse all the transitions of a DFA for \\(D\\)",
      "Delete the accept state of a DFA for \\(D\\)",
      "Take the union of \\(D\\) with \\(\\Sigma^*\\)"
    ],
    answer: 0,
    explanation: "Regular languages are closed under complement: given a DFA for \\(D\\), swapping accept / non-accept states yields a DFA for \\(\\overline{D}\\). This needs a DFA — swapping the states of an NFA does not complement it.",
    source: "Exam 1 Q3"
  },,
  // ---- PDA with nondeterminism (Exam 1 Q4) ----
  {
    id: "exam-pda-nondet-or-mc", chapter: 10, topic: "Pushdown automata", type: "mc",
    prompt: "Let \\(A=\\{a^i b^j c^k \\mid i,j,k\\ge 0,\\ i=j \\text{ or } i=k\\}\\). A PDA recognizes \\(A\\). Why is **nondeterminism** essential here?",
    choices: [
      "The PDA must guess at the start whether to check \\(i=j\\) or \\(i=k\\), since a single stack pass cannot verify both",
      "Nondeterminism lets the PDA use two stacks at once",
      "Deterministic PDAs cannot push a bottom-of-stack marker \\(\\$\\)",
      "Only nondeterministic PDAs can read input left to right"
    ],
    answer: 0,
    explanation: "The PDA pushes the \\(a\\)'s, then nondeterministically branches: one branch pops while reading \\(b\\)'s to test \\(i=j\\), the other ignores \\(b\\)'s and pops while reading \\(c\\)'s to test \\(i=k\\). A single deterministic pass cannot match the \\(a\\)'s against both the \\(b\\)'s and the \\(c\\)'s.",
    source: "Exam 1 Q4"
  },,
  {
    id: "exam-pda-stack-bottom-fib", chapter: 10, topic: "Pushdown automata", type: "fib",
    prompt: "In the Exam 1 PDA for \\(A\\), before pushing any \\(a\\)'s the machine first pushes a special symbol so it can later detect an \"empty\" stack. By convention this bottom-of-stack marker is written as which single character?",
    accept: ["$", "\\$", "dollar", "dollar sign"],
    explanation: "A PDA pushes a bottom marker \\(\\$\\) at the start; seeing \\(\\$\\) on top again means everything pushed has been popped (the stack is \"empty\"), since a PDA cannot otherwise test for emptiness.",
    source: "Exam 1 Q4"
  },,
  // ---- CFG derivations (Exam 1 Q5) ----
  {
    id: "exam-cfg-derivation-abacbab-order", chapter: 10, topic: "Context-free grammars", type: "order",
    prompt: "For \\(G\\) with rule \\(S\\to aSb \\mid bSa \\mid c\\), order the steps of a leftmost derivation of the string \\(abacbab\\).",
    items: [
      "\\(S\\)",
      "\\(aSb\\)",
      "\\(abSab\\)",
      "\\(abaSbab\\)",
      "\\(abacbab\\)"
    ],
    explanation: "Apply \\(S\\to aSb\\), then \\(S\\to bSa\\), then \\(S\\to aSb\\), then \\(S\\to c\\): \\(S\\Rightarrow aSb\\Rightarrow abSab\\Rightarrow abaSbab\\Rightarrow abacbab\\). The grammar wraps a central \\(c\\) in mirror-paired outer symbols.",
    source: "Exam 1 Q5"
  },,
  // ---- Balanced parentheses CFG + non-regularity (Exam 1 Q6) ----
  {
    id: "exam-balanced-parens-cfg-mc", chapter: 10, topic: "Context-free grammars", type: "mc",
    prompt: "Let \\(P\\) be the language of properly nested parentheses over \\(\\Sigma=\\{(,)\\}\\) (e.g. \\(()()\\), \\(((()))\\), and \\(\\varepsilon\\), but not \\()(\\)). Which CFG generates exactly \\(P\\)?",
    choices: [
      "\\(S\\to (S) \\mid SS \\mid \\varepsilon\\)",
      "\\(S\\to (S) \\mid \\varepsilon\\)",
      "\\(S\\to ()S \\mid \\varepsilon\\)",
      "\\(S\\to SS \\mid ()\\)"
    ],
    answer: 0,
    explanation: "\\(S\\to (S)\\) wraps a balanced string in a matched pair, \\(S\\to SS\\) concatenates two balanced strings, and \\(S\\to\\varepsilon\\) gives the empty string. The other grammars miss strings like \\((())()\\) or \\(\\varepsilon\\).",
    source: "Exam 1 Q6(a)"
  },,
  {
    id: "exam-balanced-parens-nonregular-mc", chapter: 10, topic: "Pumping lemma", type: "mc",
    prompt: "To prove the balanced-parentheses language \\(P\\) is **not regular** via the pumping lemma, which string \\(s\\) (with pumping length \\(p\\)) is the standard choice?",
    choices: [
      "\\(s=\\,(^{\\,p}\\,)^{\\,p}\\) — i.e. \\(p\\) left parens followed by \\(p\\) right parens",
      "\\(s=(\\,)^{\\,p}\\) — i.e. \\(p\\) copies of \\(()\\)",
      "\\(s=\\,(^{\\,p}\\)",
      "\\(s=\\,)^{\\,p}\\,(^{\\,p}\\)"
    ],
    answer: 0,
    explanation: "With \\(s=(^p\\,)^p\\), the constraint \\(|xy|\\le p\\) forces \\(y\\) to be all left parens; pumping to \\(i=0\\) deletes left parens, leaving fewer \\('('\\) than \\(')'\\), so the result is unbalanced and outside \\(P\\) — contradiction.",
    source: "Exam 1 Q6(b)"
  },,
  // ---- Pumping for non-CF language (Exam 1 Q7) ----
  {
    id: "exam-noncf-pumping-string-mc", chapter: 10, topic: "Pumping lemma (CFL)", type: "mc",
    prompt: "Let \\(A=\\{a^i b^j c^i \\mid i\\le j\\le 2i\\}\\). To prove \\(A\\) is **not context-free** with the pumping lemma for CFLs, which string is the standard pick (pumping length \\(p\\))?",
    choices: [
      "\\(s=a^p b^p c^p\\)",
      "\\(s=a^p b^{2p} c^p\\)",
      "\\(s=a^p c^p\\)",
      "\\(s=(abc)^p\\)"
    ],
    answer: 0,
    explanation: "Take \\(s=a^p b^p c^p\\in A\\) (since \\(p\\le p\\le 2p\\)). Any split \\(s=uvxyz\\) with \\(|vxy|\\le p\\) touches at most two of the three blocks, so pumping unbalances the \\(a\\)/\\(c\\) counts or drives \\(j\\) out of \\([i,2i]\\) — contradiction.",
    source: "Exam 1 Q7"
  },,
  // ---- Chomsky normal form (Exam 1 Q8) ----
  {
    id: "exam-cnf-conversion-order", chapter: 10, topic: "Chomsky normal form", type: "order",
    prompt: "Order the standard steps for converting a CFG to Chomsky normal form (as used on Exam 1 to convert \\(S\\to aSb\\mid aSbb\\mid\\varepsilon\\)).",
    items: [
      "Add a new start variable \\(S_0\\) with \\(S_0\\to S\\)",
      "Remove \\(\\varepsilon\\)-rules \\(A\\to\\varepsilon\\)",
      "Remove unit rules \\(A\\to B\\)",
      "Replace terminals in long rules with new variables (e.g. \\(A\\to a\\))",
      "Break right-hand sides longer than two into chained two-variable rules"
    ],
    explanation: "Sipser's order: new start symbol; eliminate \\(\\varepsilon\\)-rules; eliminate unit rules; isolate terminals; then split long bodies into binary rules. The exam followed exactly these stages.",
    source: "Exam 1 Q8"
  },,
  {
    id: "exam-cnf-forms-multi", chapter: 10, topic: "Chomsky normal form", type: "multi",
    prompt: "In Chomsky normal form, which rule shapes are allowed? (Here \\(A,B,C\\) are variables, \\(a\\) a terminal, \\(S\\) the start variable.)",
    choices: [
      "\\(A\\to BC\\) (two variables)",
      "\\(A\\to a\\) (a single terminal)",
      "\\(S\\to\\varepsilon\\) (only from the start variable)",
      "\\(A\\to aB\\) (terminal then variable)",
      "\\(A\\to BCD\\) (three variables)"
    ],
    answers: [0, 1, 2],
    explanation: "CNF permits \\(A\\to BC\\), \\(A\\to a\\), and \\(S\\to\\varepsilon\\) only for the start variable. Mixed bodies like \\(aB\\) and over-long bodies like \\(BCD\\) are not in CNF and must be rewritten.",
    source: "Exam 1 Q8 (CNF definition)"
  },,
  // ---- 1.46: prove a language non-regular via pumping ----
  {
    id: "exam-review-146-nonregular-mc", chapter: 10, topic: "Pumping lemma", type: "mc",
    prompt: "Review problem 1.46 asks you to prove certain languages are not regular. For \\(\\{ww \\mid w\\in\\{0,1\\}^*\\}\\), which pumping-lemma string is a standard contradiction-producing choice (length \\(>p\\))?",
    choices: [
      "\\(s=0^p1\\,0^p1\\)",
      "\\(s=0^p1^p\\)",
      "\\(s=(01)^p\\)",
      "\\(s=1^p\\)"
    ],
    answer: 0,
    explanation: "With \\(s=0^p1\\,0^p1\\), the bound \\(|xy|\\le p\\) forces \\(y\\) into the first block of \\(0\\)'s; pumping changes only that block, so the string can no longer split as \\(ww\\) — contradiction. \\((01)^p\\) is pumpable and fails to force one.",
    source: "Course review, Sipser 1.46"
  },,
  // ---- 2.47: CFG / non-CF problem ----
  {
    id: "exam-review-247-cfl-not-closed-multi", chapter: 10, topic: "Context-free languages", type: "multi",
    prompt: "Review problem 2.47 concerns context-free vs. non-context-free languages. Which closure facts about the class of CFLs are **true**?",
    choices: [
      "CFLs are closed under union",
      "CFLs are closed under concatenation",
      "CFLs are closed under intersection with a regular language",
      "CFLs are closed under intersection (with another CFL)",
      "CFLs are closed under complement"
    ],
    answers: [0, 1, 2],
    explanation: "CFLs are closed under union, concatenation, star, and intersection with a regular language, but NOT under intersection or complement. The classic witness: \\(\\{a^nb^nc^m\\}\\cap\\{a^mb^nc^n\\}=\\{a^nb^nc^n\\}\\) is not context-free.",
    source: "Course review, Sipser 2.47"
  },
]);
