/* Chapter 1 — Regular Languages: BASICS tier (rank 0).
   Very-beginner definition/explainer questions. Plain language, one idea each,
   for a smart learner who has never seen this. These are the FIRST questions a
   learner sees — build intuition for what each term means before any proofs or
   constructions (those live in ch1.js). Pairs with ch1.js.
   Every question here has rank: 0 and an id prefixed "ch1-basic-". */
TOC.addQuestions([
  // ============================================================
  // ---- Alphabet, string, empty string, Sigma*, language ----
  // ============================================================
  {
    id: "ch1-basic-alphabet-what", chapter: 1, rank: 0, topic: "Strings & languages", type: "tf",
    prompt: "True or false: an **alphabet** \\(\\Sigma\\) is a finite set of symbols (for example \\(\\{0,1\\}\\)).",
    answer: true,
    explanation: "True. An alphabet is just a finite collection of allowed symbols, like \\(\\Sigma=\\{0,1\\}\\). Everything else (strings, languages) is built out of these symbols.",
    source: "Sipser §0.2 / §1.1"
  },
  {
    id: "ch1-basic-string-what", chapter: 1, rank: 0, topic: "Strings & languages", type: "mc",
    prompt: "In plain terms, what is a **string** over an alphabet \\(\\Sigma\\)?",
    choices: [
      "A finite sequence of symbols from \\(\\Sigma\\), written in order, like \\(0110\\)",
      "Any set of symbols, in no particular order",
      "A single symbol from \\(\\Sigma\\)",
      "An infinitely long row of symbols"
    ],
    answer: 0,
    explanation: "A string is symbols placed one after another, like beads on a thread: order matters and the string is finite. Over \\(\\Sigma=\\{0,1\\}\\), examples are \\(0\\), \\(11\\), and \\(0110\\).",
    source: "Sipser §0.2 (Strings and languages)"
  },
  {
    id: "ch1-basic-empty-string-what", chapter: 1, rank: 0, topic: "Strings & languages", type: "mc",
    prompt: "What is the **empty string** \\(\\varepsilon\\)?",
    choices: [
      "The string with no symbols at all (length \\(0\\))",
      "The string made of one blank space",
      "The symbol \\(0\\)",
      "A string that does not exist"
    ],
    answer: 0,
    explanation: "The empty string, written \\(\\varepsilon\\), is the string of length \\(0\\) — nothing written down. It is a perfectly real string, just an empty one, much like \\(0\\) is a real number.",
    source: "Sipser §0.2 (Strings and languages)"
  },
  {
    id: "ch1-basic-empty-string-symbol-fib", chapter: 1, rank: 0, topic: "Strings & languages", type: "fib",
    prompt: "Fill in: the empty string (the string of length zero) is written with the Greek letter ____.",
    accept: ["epsilon", "varepsilon", "ε", "\\varepsilon"],
    explanation: "The empty string is denoted \\(\\varepsilon\\) (epsilon). Remember \\(|\\varepsilon|=0\\).",
    source: "Sipser §0.2 (Strings and languages)"
  },
  {
    id: "ch1-basic-sigma-star-what", chapter: 1, rank: 0, topic: "Strings & languages", type: "tf",
    prompt: "True or false: \\(\\Sigma^*\\) means the set of ALL strings you can make from \\(\\Sigma\\), including the empty string \\(\\varepsilon\\).",
    answer: true,
    explanation: "True. \\(\\Sigma^*\\) collects every finite string over \\(\\Sigma\\), short and long, and always includes \\(\\varepsilon\\). Over \\(\\{0,1\\}\\) it contains \\(\\varepsilon, 0, 1, 00, 01, \\dots\\) — infinitely many strings.",
    source: "Sipser §0.2 (Strings and languages)"
  },
  {
    id: "ch1-basic-language-what", chapter: 1, rank: 0, topic: "Strings & languages", type: "mc",
    prompt: "In plain terms, what is a **language**?",
    choices: [
      "A set of strings (any collection of strings you choose)",
      "A single special string",
      "A set of symbols (an alphabet)",
      "A machine that reads strings"
    ],
    answer: 0,
    explanation: "A language is simply a set of strings — a subset of \\(\\Sigma^*\\). For example, \"all strings of \\(0\\)s and \\(1\\)s that end in \\(1\\)\" is a language.",
    source: "Sipser §0.2 (Strings and languages)"
  },

  // ============================================================
  // ---- Finite automaton; states, start, accept, transitions --
  // ============================================================
  {
    id: "ch1-basic-finite-automaton-what", chapter: 1, rank: 0, topic: "Finite automata", type: "mc",
    prompt: "In plain terms, what is a **finite automaton**?",
    choices: [
      "A simple machine with a fixed number of states that reads a string one symbol at a time and ends up either accepting or rejecting it",
      "A machine with unlimited memory that can write anywhere",
      "A list of all the strings in a language",
      "A rule for adding two numbers"
    ],
    answer: 0,
    explanation: "A finite automaton is the simplest computing model: finitely many states, it scans the input left to right, and at the end it says yes (accept) or no (reject). Its only memory is which state it is in.",
    source: "Sipser §1.1"
  },
  {
    id: "ch1-basic-state-what", chapter: 1, rank: 0, topic: "Finite automata", type: "mc",
    prompt: "What is a **state** of a finite automaton?",
    choices: [
      "One of the machine's possible situations — drawn as a circle — that records what it needs to remember so far",
      "A symbol of the input alphabet",
      "The final answer the machine gives",
      "The whole input string"
    ],
    answer: 0,
    explanation: "A state is a circle in the machine's diagram. Being in a state is the machine's only memory: it summarizes everything the machine remembers about the input read so far.",
    source: "Sipser §1.1"
  },
  {
    id: "ch1-basic-start-state-what", chapter: 1, rank: 0, topic: "Finite automata", type: "tf",
    prompt: "True or false: the **start state** is the state a finite automaton is in before it reads any input — where every run begins.",
    answer: true,
    explanation: "True. The start state is where computation begins, before reading a single symbol. It is marked with an incoming arrow from nowhere, and there is exactly one of them.",
    source: "Sipser Def 1.5"
  },
  {
    id: "ch1-basic-accept-state-what", chapter: 1, rank: 0, topic: "Finite automata", type: "mc",
    prompt: "What is an **accept state** (also called a final state)?",
    choices: [
      "A \"yes\" state (drawn as a double circle): if the machine finishes the input here, the string is accepted",
      "The state where the machine begins",
      "A state the machine visits exactly once",
      "A state with no outgoing arrows"
    ],
    answer: 0,
    explanation: "Accept states are the \"yes\" states, drawn as double circles. If the machine is in an accept state after reading the whole input, it accepts the string; otherwise it rejects.",
    source: "Sipser Def 1.5"
  },
  {
    id: "ch1-basic-transition-fn-what", chapter: 1, rank: 0, topic: "Finite automata", type: "mc",
    prompt: "What does the **transition function** of a finite automaton tell you?",
    choices: [
      "Given the current state and the next input symbol, which state to move to",
      "Which string the machine will accept",
      "How many states the machine has",
      "Whether the input is finite"
    ],
    answer: 0,
    explanation: "The transition function is the machine's rulebook for its arrows: it takes a state and a symbol and says where to go next. The Greek letter \\(\\delta\\) (delta) names it.",
    source: "Sipser Def 1.5"
  },
  {
    id: "ch1-basic-delta-fib", chapter: 1, rank: 0, topic: "Finite automata", type: "fib",
    prompt: "Fill in: the transition function of a finite automaton is usually named with the Greek letter ____.",
    accept: ["delta", "δ", "\\delta"],
    explanation: "The transition function is written \\(\\delta\\) (delta). It maps a (state, symbol) pair to the next state.",
    source: "Sipser Def 1.5"
  },

  // ============================================================
  // ---- Accept / reject a string ----
  // ============================================================
  {
    id: "ch1-basic-accept-string-what", chapter: 1, rank: 0, topic: "Finite automata", type: "mc",
    prompt: "What does it mean for a finite automaton to **accept** a string?",
    choices: [
      "Starting from the start state and following the arrows for each symbol, the machine ends in an accept state",
      "The machine reads only part of the string",
      "The string appears somewhere inside the machine",
      "The machine passes through the start state again"
    ],
    answer: 0,
    explanation: "To accept, the machine begins in the start state, follows one arrow per input symbol, and after the last symbol lands in an accept state. That string is then \"in the machine's language.\"",
    source: "Sipser Def 1.5 (computation)"
  },
  {
    id: "ch1-basic-reject-string-tf", chapter: 1, rank: 0, topic: "Finite automata", type: "tf",
    prompt: "True or false: a finite automaton **rejects** a string when, after reading all of it, the machine is NOT in an accept state.",
    answer: true,
    explanation: "True. Accept and reject are opposites: if the run ends in an accept state the string is accepted, and if it ends anywhere else the string is rejected. Every string gets exactly one verdict.",
    source: "Sipser Def 1.5 (computation)"
  },

  // ============================================================
  // ---- DFA and NFA (what they are) ----
  // ============================================================
  {
    id: "ch1-basic-dfa-what", chapter: 1, rank: 0, topic: "DFA", type: "mc",
    prompt: "In plain terms, what is a **DFA** (deterministic finite automaton)?",
    choices: [
      "A finite automaton where each state has exactly one arrow to follow for each symbol, so the path is never a choice",
      "A finite automaton that can be in several states at once",
      "A machine with an unlimited tape",
      "A pattern written with stars and unions"
    ],
    answer: 0,
    explanation: "\"Deterministic\" means no choices: from any state, each symbol leads to exactly one next state. So one input traces exactly one path through a DFA.",
    source: "Sipser Def 1.5"
  },
  {
    id: "ch1-basic-nfa-what", chapter: 1, rank: 0, topic: "NFA", type: "mc",
    prompt: "In plain terms, what is an **NFA** (nondeterministic finite automaton)?",
    choices: [
      "A finite automaton where a state may have several arrows (or none) for a symbol, so the machine can try many paths and accepts if ANY path works",
      "A finite automaton with exactly one arrow per symbol from every state",
      "A finite automaton that reads its input backwards",
      "A machine with a stack it can push and pop"
    ],
    answer: 0,
    explanation: "An NFA may offer several choices (or zero) on a symbol. Imagine it exploring all choices at once; it accepts the string if at least one of those paths ends in an accept state.",
    source: "Sipser Def 1.37"
  },
  {
    id: "ch1-basic-epsilon-transition-what", chapter: 1, rank: 0, topic: "NFA", type: "mc",
    prompt: "What is an **\\(\\varepsilon\\)-transition** in an NFA?",
    choices: [
      "An arrow the machine may follow for free, without reading any input symbol",
      "An arrow you must read the symbol \\(\\varepsilon\\) to take",
      "An arrow that deletes a symbol from the input",
      "The only arrow leaving the start state"
    ],
    answer: 0,
    explanation: "An \\(\\varepsilon\\)-transition (\\(\\varepsilon\\) = empty string) lets the NFA jump to another state for free, consuming no input. Only NFAs may have these; DFAs may not.",
    source: "Sipser Def 1.37"
  },

  // ============================================================
  // ---- Determinism vs nondeterminism (plain) ----
  // ============================================================
  {
    id: "ch1-basic-det-vs-nondet", chapter: 1, rank: 0, topic: "NFA", type: "mc",
    prompt: "What is the plain difference between **determinism** and **nondeterminism**?",
    choices: [
      "Deterministic means there is never a choice of move; nondeterministic means the machine may have several choices and can try them all",
      "Deterministic machines are slower than nondeterministic ones",
      "Deterministic machines have more states",
      "Nondeterministic machines can only reject"
    ],
    answer: 0,
    explanation: "Determinism = one forced move at every step. Nondeterminism = the machine may branch and explore many possibilities, accepting if any branch succeeds. For finite automata, both recognize the same languages.",
    source: "Sipser §1.2"
  },

  // ============================================================
  // ---- Regular language; regular expression ----
  // ============================================================
  {
    id: "ch1-basic-regular-language-what", chapter: 1, rank: 0, topic: "Regular languages", type: "mc",
    prompt: "What does it mean for a language to be **regular**?",
    choices: [
      "Some finite automaton recognizes it",
      "It contains only short strings",
      "Every string in it has the same length",
      "It is impossible to describe with a machine"
    ],
    answer: 0,
    explanation: "A language is regular exactly when some finite automaton (DFA or NFA) recognizes it. Equivalently, some regular expression describes it. Regular languages may still be infinite.",
    source: "Sipser Def 1.16"
  },
  {
    id: "ch1-basic-regex-what", chapter: 1, rank: 0, topic: "Regular expressions", type: "mc",
    prompt: "In plain terms, what is a **regular expression**?",
    choices: [
      "A short pattern that describes a language by combining symbols with union, concatenation, and star",
      "A list that names every string in a language one by one",
      "A finite automaton with a stack",
      "A proof that a language is not regular"
    ],
    answer: 0,
    explanation: "A regular expression is a compact pattern, like \\(0^*1\\), built from symbols using the operations union, concatenation, and star. Each regular expression stands for a language.",
    source: "Sipser Def 1.52"
  },

  // ============================================================
  // ---- The three operations: union, concatenation, star ------
  // ============================================================
  {
    id: "ch1-basic-union-what", chapter: 1, rank: 0, topic: "Regular operations", type: "mc",
    prompt: "What is the **union** \\(A\\cup B\\) of two languages?",
    choices: [
      "All strings that are in \\(A\\), in \\(B\\), or in both",
      "All strings that are in both \\(A\\) and \\(B\\) at once",
      "An \\(A\\)-string glued in front of a \\(B\\)-string",
      "Copies of \\(A\\) repeated over and over"
    ],
    answer: 0,
    explanation: "Union just throws both languages together: a string is in \\(A\\cup B\\) if it belongs to \\(A\\) or to \\(B\\) (or both). It is the \"or\" of languages.",
    source: "Sipser Def 1.23"
  },
  {
    id: "ch1-basic-concatenation-what", chapter: 1, rank: 0, topic: "Regular operations", type: "tf",
    prompt: "True or false: the **concatenation** of languages \\(A\\) and \\(B\\) is all strings made by taking a string from \\(A\\) and sticking a string from \\(B\\) right after it.",
    answer: true,
    explanation: "True. Concatenation glues strings end to end: take any \\(x\\) from \\(A\\) and any \\(y\\) from \\(B\\) and form \\(xy\\). For example, \\(\\{a\\}\\) concatenated with \\(\\{b,c\\}\\) gives \\(\\{ab, ac\\}\\).",
    source: "Sipser Def 1.23"
  },
  {
    id: "ch1-basic-star-what", chapter: 1, rank: 0, topic: "Regular operations", type: "mc",
    prompt: "What does the **star** operation \\(A^*\\) mean?",
    choices: [
      "Zero or more strings from \\(A\\), glued together (including the empty string \\(\\varepsilon\\))",
      "Exactly one string from \\(A\\)",
      "All strings NOT in \\(A\\)",
      "Strings in both \\(A\\) and some other language"
    ],
    answer: 0,
    explanation: "Star means \"repeat any number of times, including zero.\" So \\(A^*\\) contains \\(\\varepsilon\\) (zero copies), every string of \\(A\\), every concatenation of two of them, and so on.",
    source: "Sipser Def 1.23"
  },

  // ============================================================
  // ---- Closure (plain) ----
  // ============================================================
  {
    id: "ch1-basic-closure-what", chapter: 1, rank: 0, topic: "Closure properties", type: "mc",
    prompt: "When we say the regular languages are **closed** under an operation, we mean:",
    choices: [
      "Doing that operation to regular languages always gives back a regular language",
      "The operation can never be done to a regular language",
      "The operation makes the language finite",
      "The result is always a nonregular language"
    ],
    answer: 0,
    explanation: "\"Closed under\" means you can't escape the club by doing the operation: combine regular languages with it and the answer is still regular. For example, the union of two regular languages is regular.",
    source: "Sipser Thm 1.25"
  },

  // ============================================================
  // ---- Subset construction (NFA -> DFA), plain ----
  // ============================================================
  {
    id: "ch1-basic-subset-construction-what", chapter: 1, rank: 0, topic: "Subset construction", type: "tf",
    prompt: "True or false: in the **subset construction** (turning an NFA into a DFA), each DFA state stands for a SET of NFA states — all the states the NFA could currently be in.",
    answer: true,
    explanation: "True. Since an NFA can be in several states at once, the DFA tracks that whole set. Each DFA state is a set of NFA states, so the new machine is deterministic but does the same job — which is why every NFA has an equivalent DFA.",
    source: "Sipser Thm 1.39"
  },

  // ============================================================
  // ---- GNFA (one-line idea) ----
  // ============================================================
  {
    id: "ch1-basic-gnfa-what", chapter: 1, rank: 0, topic: "GNFA", type: "mc",
    prompt: "A **GNFA** (generalized NFA) is like an ordinary NFA except that its arrows are labeled with:",
    choices: [
      "whole regular expressions, not just single symbols",
      "numbers instead of symbols",
      "other machines",
      "nothing at all"
    ],
    answer: 0,
    explanation: "In a GNFA, each arrow can be labeled with a regular expression. This is the handy in-between form used to turn a finite automaton into one big regular expression.",
    source: "Sipser §1.3 (GNFA)"
  },

  // ============================================================
  // ---- Pumping lemma (plain) and nonregular ----
  // ============================================================
  {
    id: "ch1-basic-pumping-lemma-plain", chapter: 1, rank: 0, topic: "Pumping lemma", type: "mc",
    prompt: "In plain words, what does the **pumping lemma** say about a regular language?",
    choices: [
      "Every long enough string in it has a middle part you can repeat as many times as you like and still stay in the language",
      "Every string in it must be short",
      "It contains only strings of one fixed length",
      "It can never contain the empty string"
    ],
    answer: 0,
    explanation: "The pumping lemma says: in a regular language, any sufficiently long string has a nonempty chunk that can be repeated (\"pumped\") any number of times, and the result is still in the language.",
    source: "Sipser Thm 1.70"
  },
  {
    id: "ch1-basic-nonregular-what", chapter: 1, rank: 0, topic: "Regular vs nonregular", type: "mc",
    prompt: "What does it mean for a language to be **nonregular**?",
    choices: [
      "No finite automaton can recognize it (and no regular expression describes it)",
      "It has infinitely many strings",
      "It contains the empty string",
      "It is recognized by some NFA"
    ],
    answer: 0,
    explanation: "Nonregular means outside the reach of finite automata: no DFA or NFA recognizes it. A famous example is \\(\\{0^n1^n\\mid n\\ge 0\\}\\), which needs unbounded counting that finite memory can't do.",
    source: "Sipser §1.4"
  }
]);
