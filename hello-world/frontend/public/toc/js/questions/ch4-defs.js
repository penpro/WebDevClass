/* Chapter 4 — Decidability: VERY BEGINNER definitions & explainers (Sipser 4.1–4.2).
   Plain-language "what is it" questions for a first pass. One idea each.
   Every question rank: 0. Ids prefixed "ch4-basic-".
   33 questions: mc 17, tf 10, fib 5, multi 1. */
TOC.addQuestions([
  // ============ Decidable ============
  {
    id: "ch4-basic-decidable-what", chapter: 4, rank: 0, topic: "Decidable", type: "mc",
    prompt: "A language is **decidable** when:",
    choices: [
      "there is a machine that always stops and gives the right yes-or-no answer for every input",
      "there is a machine that sometimes stops and sometimes runs forever",
      "no machine can answer questions about it",
      "it has only finitely many strings"
    ],
    answer: 0,
    explanation: "Decidable means a Turing machine (a decider) always halts and correctly says \"yes, it's in the language\" or \"no, it isn't\" — it never gets stuck looping.",
    source: "Sipser §4.1 (Definition of decidable)"
  },
  {
    id: "ch4-basic-decider-halts", chapter: 4, rank: 0, topic: "Decidable", type: "tf",
    prompt: "A **decider** is a machine that always stops (halts) on every input.",
    answer: true,
    explanation: "A decider never loops forever. Because it always halts with an accept or reject, the language it decides is decidable.",
    source: "Sipser §3.1"
  },
  {
    id: "ch4-basic-decidable-fib", chapter: 4, rank: 0, topic: "Decidable", type: "fib",
    prompt: "A machine that always halts and answers yes or no is called a ____ for its language.",
    accept: ["decider", "a decider"],
    explanation: "A decider always stops with a definite yes/no answer. A language with a decider is called decidable.",
    source: "Sipser §3.1"
  },

  // ============ Undecidable ============
  {
    id: "ch4-basic-undecidable-what", chapter: 4, rank: 0, topic: "Undecidable", type: "mc",
    prompt: "A language is **undecidable** when:",
    choices: [
      "no machine can always stop and give the correct yes-or-no answer for it",
      "it is empty",
      "a machine answers it, but slowly",
      "it has infinitely many strings"
    ],
    answer: 0,
    explanation: "Undecidable means there is NO decider: no Turing machine can always halt and correctly decide membership. Some questions simply cannot be answered by any always-halting program.",
    source: "Sipser §4.2"
  },
  {
    id: "ch4-basic-undecidable-tf", chapter: 4, rank: 0, topic: "Undecidable", type: "tf",
    prompt: "If a language is undecidable, then no Turing machine can decide it.",
    answer: true,
    explanation: "\"Undecidable\" literally means no decider exists for it — that is the definition.",
    source: "Sipser §4.2"
  },

  // ============ Decidable vs recognizable ============
  {
    id: "ch4-basic-dec-vs-recog", chapter: 4, rank: 0, topic: "Decidable vs recognizable", type: "mc",
    prompt: "What is the difference between a **decider** and a plain **recognizer**?",
    choices: [
      "A decider always halts; a recognizer may run forever on strings that are not in its language",
      "A decider is slower than a recognizer",
      "A recognizer always halts but a decider may loop",
      "There is no difference"
    ],
    answer: 0,
    explanation: "Both accept exactly the right strings, but a recognizer is allowed to loop forever when a string is NOT in the language. A decider is the stronger kind: it must always stop.",
    source: "Sipser §3.1"
  },
  {
    id: "ch4-basic-decidable-implies-recog", chapter: 4, rank: 0, topic: "Decidable vs recognizable", type: "tf",
    prompt: "Every decidable language is also Turing-recognizable.",
    answer: true,
    explanation: "A decider is already a recognizer that happens to always halt. So deciding a language is just a stronger version of recognizing it.",
    source: "Sipser §4.2"
  },
  {
    id: "ch4-basic-recog-not-decidable", chapter: 4, rank: 0, topic: "Decidable vs recognizable", type: "tf",
    prompt: "Some languages are Turing-recognizable but NOT decidable.",
    answer: true,
    explanation: "Recognizable is a weaker promise than decidable (looping is allowed). \\(A_{TM}\\) is the famous example: a machine can recognize it, but no machine can decide it.",
    source: "Sipser §4.2"
  },

  // ============ Acceptance problem A_TM ============
  {
    id: "ch4-basic-atm-what", chapter: 4, rank: 0, topic: "Acceptance problem", type: "mc",
    prompt: "The **acceptance problem** \\(A_{TM}=\\{\\langle M,w\\rangle\\mid M\\text{ accepts }w\\}\\) asks:",
    choices: [
      "does machine \\(M\\) accept the input string \\(w\\)?",
      "does machine \\(M\\) halt on every input?",
      "is the language of \\(M\\) empty?",
      "do two machines accept the same strings?"
    ],
    answer: 0,
    explanation: "\\(A_{TM}\\) bundles a machine \\(M\\) and a string \\(w\\) together and asks the simple question: does \\(M\\) accept \\(w\\)?",
    source: "Sipser §4.2 (Thm 4.11)"
  },
  {
    id: "ch4-basic-atm-undecidable", chapter: 4, rank: 0, topic: "Acceptance problem", type: "tf",
    prompt: "The acceptance problem \\(A_{TM}\\) is undecidable.",
    answer: true,
    explanation: "There is no machine that can always correctly decide whether \\(M\\) accepts \\(w\\). This is one of the most famous results in the whole course.",
    source: "Sipser Thm 4.11"
  },

  // ============ Halting problem ============
  {
    id: "ch4-basic-halting-what", chapter: 4, rank: 0, topic: "Halting problem", type: "mc",
    prompt: "The **halting problem** asks, in general:",
    choices: [
      "given a program and an input, will the program eventually stop, or run forever?",
      "how fast does a program run?",
      "how much memory does a program use?",
      "is a program written correctly?"
    ],
    answer: 0,
    explanation: "The halting problem asks whether a given program halts (stops) on a given input. In general, no algorithm can answer this for every program.",
    source: "Sipser §5.1 (HALT_{TM})"
  },
  {
    id: "ch4-basic-halting-undecidable", chapter: 4, rank: 0, topic: "Halting problem", type: "tf",
    prompt: "There is no general method that can always decide whether an arbitrary program will halt on a given input.",
    answer: true,
    explanation: "The halting problem is undecidable: no single program can correctly predict, for every possible program and input, whether it stops or loops forever.",
    source: "Sipser §5.1"
  },

  // ============ Decidable DFA / CFG problems ============
  {
    id: "ch4-basic-adfa-what", chapter: 4, rank: 0, topic: "Decidable DFA/CFG problems", type: "mc",
    prompt: "The problem \\(A_{DFA}\\) asks:",
    choices: [
      "does a given DFA accept a given string \\(w\\)?",
      "does a given DFA have any states?",
      "is a given DFA the same as another DFA?",
      "does a DFA accept every string?"
    ],
    answer: 0,
    explanation: "\\(A_{DFA}\\) asks whether DFA \\(B\\) accepts string \\(w\\). You can just run \\(B\\) on \\(w\\) — it always stops — so this is decidable.",
    source: "Sipser Thm 4.1"
  },
  {
    id: "ch4-basic-edfa-what", chapter: 4, rank: 0, topic: "Decidable DFA/CFG problems", type: "mc",
    prompt: "The emptiness problem \\(E_{DFA}\\) asks:",
    choices: [
      "does a given DFA accept NO strings at all (is its language empty)?",
      "does a given DFA accept the empty string \\(\\varepsilon\\)?",
      "does a DFA have zero states?",
      "do two DFAs match?"
    ],
    answer: 0,
    explanation: "\\(E_{DFA}\\) asks whether DFA \\(A\\) accepts nothing, i.e. \\(L(A)=\\emptyset\\). You can check by seeing if any accept state is reachable, so it is decidable.",
    source: "Sipser Thm 4.4"
  },
  {
    id: "ch4-basic-eqdfa-what", chapter: 4, rank: 0, topic: "Decidable DFA/CFG problems", type: "mc",
    prompt: "The equivalence problem \\(EQ_{DFA}\\) asks:",
    choices: [
      "do two given DFAs accept exactly the same set of strings?",
      "do two DFAs have the same number of states?",
      "does one DFA accept the empty string?",
      "does a DFA accept a given string \\(w\\)?"
    ],
    answer: 0,
    explanation: "\\(EQ_{DFA}\\) asks whether DFAs \\(A\\) and \\(B\\) recognize the same language, \\(L(A)=L(B)\\). It is decidable.",
    source: "Sipser Thm 4.5"
  },
  {
    id: "ch4-basic-acfg-what", chapter: 4, rank: 0, topic: "Decidable DFA/CFG problems", type: "mc",
    prompt: "The problem \\(A_{CFG}\\) asks:",
    choices: [
      "does a given context-free grammar \\(G\\) generate a given string \\(w\\)?",
      "is the grammar \\(G\\) ambiguous?",
      "does \\(G\\) generate every string?",
      "do two grammars match?"
    ],
    answer: 0,
    explanation: "\\(A_{CFG}\\) asks whether grammar \\(G\\) can produce the string \\(w\\). It is decidable (using Chomsky normal form to keep the search finite).",
    source: "Sipser Thm 4.7"
  },
  {
    id: "ch4-basic-ecfg-what", chapter: 4, rank: 0, topic: "Decidable DFA/CFG problems", type: "mc",
    prompt: "The emptiness problem \\(E_{CFG}\\) asks:",
    choices: [
      "does a given context-free grammar generate NO strings at all?",
      "does the grammar have no rules?",
      "does the grammar generate the empty string \\(\\varepsilon\\)?",
      "are two grammars equal?"
    ],
    answer: 0,
    explanation: "\\(E_{CFG}\\) asks whether \\(L(G)=\\emptyset\\), i.e. the grammar can't generate anything. It is decidable.",
    source: "Sipser Thm 4.8"
  },
  {
    id: "ch4-basic-dfa-cfg-decidable-multi", chapter: 4, rank: 0, topic: "Decidable DFA/CFG problems", type: "multi",
    prompt: "Which of these problems are **decidable**?",
    choices: [
      "\\(A_{DFA}\\) — does a DFA accept \\(w\\)?",
      "\\(E_{DFA}\\) — is a DFA's language empty?",
      "\\(A_{CFG}\\) — does a grammar generate \\(w\\)?",
      "\\(A_{TM}\\) — does a Turing machine accept \\(w\\)?"
    ],
    answers: [0, 1, 2],
    explanation: "All the basic DFA and CFG questions are decidable because the machines/grammars are simple enough to check fully. \\(A_{TM}\\) is the one that is undecidable.",
    source: "Sipser Thms 4.1–4.8"
  },

  // ============ Every CFL is decidable ============
  {
    id: "ch4-basic-cfl-decidable", chapter: 4, rank: 0, topic: "Context-free is decidable", type: "tf",
    prompt: "Every context-free language is decidable.",
    answer: true,
    explanation: "If a language has a context-free grammar, we can always build a machine that halts and decides membership. So context-free languages sit inside the decidable languages.",
    source: "Sipser Thm 4.9"
  },

  // ============ Diagonalization ============
  {
    id: "ch4-basic-diagonalization-what", chapter: 4, rank: 0, topic: "Diagonalization", type: "mc",
    prompt: "**Diagonalization** is a trick that:",
    choices: [
      "builds a new thing that is different from every item on a given list",
      "sorts a list from smallest to largest",
      "adds up the numbers on a diagonal",
      "copies the first item of a list"
    ],
    answer: 0,
    explanation: "Diagonalization makes something that disagrees with the 1st item in spot 1, the 2nd item in spot 2, and so on — so it can't match anything on the list. This shows the list was missing something.",
    source: "Sipser §4.2 (Cantor)"
  },
  {
    id: "ch4-basic-diagonalization-fib", chapter: 4, rank: 0, topic: "Diagonalization", type: "fib",
    prompt: "Cantor's trick for building an item unlike every entry in a list is called ____.",
    accept: ["diagonalization", "the diagonalization", "diagonalisation", "diagonal method", "diagonalization method"],
    explanation: "Diagonalization builds an object that differs from the \\(n\\)th listed object in the \\(n\\)th spot, so it appears nowhere on the list.",
    source: "Sipser §4.2"
  },

  // ============ Countable vs uncountable ============
  {
    id: "ch4-basic-countable-what", chapter: 4, rank: 0, topic: "Countable vs uncountable", type: "mc",
    prompt: "A set is **countable** when:",
    choices: [
      "you can put its members in a list \\(a_1, a_2, a_3, \\dots\\) (or it is finite)",
      "it has finitely many members only",
      "it is a set of numbers",
      "it is too big to list"
    ],
    answer: 0,
    explanation: "Countable means finite, or able to be lined up one-by-one matching \\(\\mathbb{N}=\\{1,2,3,\\dots\\}\\). The natural numbers and the rationals are countable.",
    source: "Sipser Def 4.14"
  },
  {
    id: "ch4-basic-naturals-countable", chapter: 4, rank: 0, topic: "Countable vs uncountable", type: "tf",
    prompt: "The natural numbers \\(\\mathbb{N}=\\{1,2,3,\\dots\\}\\) are countable.",
    answer: true,
    explanation: "They are already in a list, so they are countable. \"Countable\" basically means \"listable like \\(\\mathbb{N}\\).\"",
    source: "Sipser Def 4.14"
  },
  {
    id: "ch4-basic-reals-uncountable", chapter: 4, rank: 0, topic: "Countable vs uncountable", type: "mc",
    prompt: "The real numbers \\(\\mathbb{R}\\) are **uncountable**. What does that mean?",
    choices: [
      "they cannot all be put into a single list — there are too many",
      "there are only finitely many of them",
      "they can be listed just like \\(\\mathbb{N}\\)",
      "they have no order"
    ],
    answer: 0,
    explanation: "Uncountable means no list can include them all. Diagonalization shows that any list of reals always misses some real number.",
    source: "Sipser Thm 4.17"
  },
  {
    id: "ch4-basic-uncountable-fib", chapter: 4, rank: 0, topic: "Countable vs uncountable", type: "fib",
    prompt: "A set too big to be put in a list (like \\(\\mathbb{R}\\)) is called ____.",
    accept: ["uncountable", "uncountably infinite"],
    explanation: "An uncountable set has no complete listing. The real numbers are the classic example.",
    source: "Sipser Thm 4.17"
  },

  // ============ More languages than machines ============
  {
    id: "ch4-basic-more-languages", chapter: 4, rank: 0, topic: "More languages than machines", type: "mc",
    prompt: "Why must some language have NO Turing machine that recognizes it?",
    choices: [
      "there are only countably many Turing machines, but uncountably many languages — so machines run out",
      "every Turing machine breaks on long inputs",
      "languages are harder to write than machines",
      "all machines recognize the same language"
    ],
    answer: 0,
    explanation: "Each machine can be written down with a finite description, so the machines are countable. But the languages are uncountable. There simply aren't enough machines to cover every language.",
    source: "Sipser Cor 4.18"
  },
  {
    id: "ch4-basic-tms-countable", chapter: 4, rank: 0, topic: "More languages than machines", type: "tf",
    prompt: "The set of all Turing machines is countable, because each machine has a finite description.",
    answer: true,
    explanation: "Every Turing machine can be written as a finite string \\(\\langle M\\rangle\\), and finite strings can be listed. So the machines are countable — unlike the uncountable set of languages.",
    source: "Sipser §4.2"
  },

  // ============ Co-Turing-recognizable & the rule ============
  {
    id: "ch4-basic-co-recognizable-what", chapter: 4, rank: 0, topic: "Co-recognizable", type: "mc",
    prompt: "A language is **co-Turing-recognizable** when:",
    choices: [
      "its complement (the strings NOT in it) is Turing-recognizable",
      "it is recognizable and also empty",
      "it has two recognizers",
      "it is decidable"
    ],
    answer: 0,
    explanation: "Co-Turing-recognizable just means: flip the language to its complement, and THAT complement is recognizable.",
    source: "Sipser §4.2"
  },
  {
    id: "ch4-basic-co-recognizable-fib", chapter: 4, rank: 0, topic: "Co-recognizable", type: "fib",
    prompt: "A language whose complement is Turing-recognizable is called ____-Turing-recognizable.",
    accept: ["co", "co-turing", "coturing"],
    explanation: "The prefix \"co\" points to the complement: a co-Turing-recognizable language is the complement of a recognizable one.",
    source: "Sipser §4.2"
  },
  {
    id: "ch4-basic-decidable-rule", chapter: 4, rank: 0, topic: "Co-recognizable", type: "mc",
    prompt: "A language is decidable **exactly when** it is:",
    choices: [
      "both Turing-recognizable AND co-Turing-recognizable",
      "either recognizable OR co-recognizable",
      "context-free",
      "finite"
    ],
    answer: 0,
    explanation: "The rule: decidable = recognizable AND co-recognizable. If you can recognize both the language and its complement, you can run both and always get an answer.",
    source: "Sipser Thm 4.22"
  },
  {
    id: "ch4-basic-decidable-rule-tf", chapter: 4, rank: 0, topic: "Co-recognizable", type: "tf",
    prompt: "If a language and its complement are both Turing-recognizable, then the language is decidable.",
    answer: true,
    explanation: "Run the two recognizers at the same time. One of them is guaranteed to accept, so you always get a yes/no answer — that's a decider.",
    source: "Sipser Thm 4.22"
  },

  // ============ Universal Turing machine ============
  {
    id: "ch4-basic-utm-what", chapter: 4, rank: 0, topic: "Universal Turing machine", type: "mc",
    prompt: "The **universal Turing machine** \\(U\\) is special because it:",
    choices: [
      "can simulate any other Turing machine, given that machine's description and its input",
      "accepts every string",
      "is the fastest Turing machine",
      "never halts"
    ],
    answer: 0,
    explanation: "Give \\(U\\) a description \\(\\langle M\\rangle\\) and an input \\(w\\), and it runs \\(M\\) on \\(w\\) for you. One machine that can imitate them all — like a computer running any program.",
    source: "Sipser §4.2"
  },
  {
    id: "ch4-basic-utm-fib", chapter: 4, rank: 0, topic: "Universal Turing machine", type: "fib",
    prompt: "The single machine that can simulate any other Turing machine is called the ____ Turing machine.",
    accept: ["universal", "the universal"],
    explanation: "The universal Turing machine \\(U\\) reads another machine's description and runs it — the idea behind the stored-program computer.",
    source: "Sipser §4.2"
  }
]);
