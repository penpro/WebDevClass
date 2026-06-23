/* Chapter 3 — VERY BEGINNER definitions/explainers (Sipser 3.1–3.3).
   Plain-language "what is it" questions for a smart 6th-grader: one idea each.
   Turing machines, the tape/head, alphabets, the blank, the transition function
   in words, accept/reject/loop/halt, configurations, recognizer vs decider,
   recognizable vs decidable, L(M), variants & their equivalence, the
   Church–Turing thesis, and encoding objects as strings.
   Every question rank: 0 (foundational). Ids prefixed "ch3-basic-". */
TOC.addQuestions([
  // ---- What a Turing machine is ----
  {
    id: "ch3-basic-tm-what", chapter: 3, rank: 0, topic: "What is a Turing machine", type: "mc",
    prompt: "In the simplest terms, what is a **Turing machine**?",
    choices: [
      "A finite set of rules (a control) plus a long tape it can read and write, with a head that moves left and right",
      "A real metal machine you can buy in a store",
      "A list of words with no way to change them",
      "A drawing of a graph with nodes and edges"
    ],
    answer: 0,
    explanation: "A Turing machine is a simple imaginary computer: a small set of rules controlling a head that moves along a tape, reading and writing symbols. It is our standard picture of \"any computer program.\"",
    source: "Sipser §3.1, Def 3.3"
  },
  {
    id: "ch3-basic-tm-vs-dfa-loop-tf", chapter: 3, rank: 0, topic: "What is a Turing machine", type: "tf",
    prompt: "Unlike a simple finite-state machine, a Turing machine can keep running forever on some inputs.",
    answer: true,
    explanation: "A finite-state machine reads the input once and stops. A Turing machine can move back and forth and rewrite the tape, so it might never stop — it can \"loop\" forever.",
    source: "Sipser §3.1"
  },

  // ---- The tape ----
  {
    id: "ch3-basic-tape-what", chapter: 3, rank: 0, topic: "The tape", type: "mc",
    prompt: "What is the **tape** of a Turing machine?",
    choices: [
      "A long strip of cells, each holding one symbol, that the machine can read from and write on",
      "A list of the machine's states",
      "The single answer the machine prints at the end",
      "A stack where you can only touch the top item"
    ],
    answer: 0,
    explanation: "The tape is the machine's memory: a row of cells, one symbol per cell. The machine can both read what is there and write new symbols over it.",
    source: "Sipser §3.1"
  },
  {
    id: "ch3-basic-tape-unbounded-tf", chapter: 3, rank: 0, topic: "The tape", type: "tf",
    prompt: "The tape is unbounded: it never runs out of room on the right, so the machine always has more cells if it needs them.",
    answer: true,
    explanation: "The tape has a left end but stretches as far right as needed. This unlimited space is what makes a Turing machine more powerful than a fixed-size memory.",
    source: "Sipser §3.1, Def 3.3"
  },

  // ---- The head ----
  {
    id: "ch3-basic-head-what", chapter: 3, rank: 0, topic: "The head", type: "mc",
    prompt: "What does the **head** of a Turing machine do?",
    choices: [
      "It points at one cell of the tape, reads or writes there, and then moves one cell left or right",
      "It stores the final yes/no answer",
      "It counts how many states the machine has",
      "It holds the whole input in one spot at once"
    ],
    answer: 0,
    explanation: "The head is the part touching the tape. At each step it reads (and may write) the one cell it is on, then steps one cell to the left or right.",
    source: "Sipser §3.1, Def 3.3"
  },

  // ---- Alphabets ----
  {
    id: "ch3-basic-input-alphabet-what", chapter: 3, rank: 0, topic: "Alphabets", type: "mc",
    prompt: "What is the **input alphabet** \\(\\Sigma\\)?",
    choices: [
      "The set of symbols the input string is allowed to be made of",
      "Every symbol that can ever appear on the tape",
      "The list of states the machine can be in",
      "The two move directions, left and right"
    ],
    answer: 0,
    explanation: "The input alphabet \\(\\Sigma\\) is just the symbols allowed in the input you hand the machine — for example \\(\\{0,1\\}\\).",
    source: "Sipser Def 3.3"
  },
  {
    id: "ch3-basic-tape-alphabet-what", chapter: 3, rank: 0, topic: "Alphabets", type: "mc",
    prompt: "What is the **tape alphabet** \\(\\Gamma\\)?",
    choices: [
      "All the symbols that are allowed to appear on the tape (including the blank)",
      "Only the symbols allowed in the original input",
      "The set of accept and reject states",
      "The directions the head may move"
    ],
    answer: 0,
    explanation: "The tape alphabet \\(\\Gamma\\) is every symbol that can sit in a cell. It includes the input symbols plus extras the machine writes, like the blank.",
    source: "Sipser Def 3.3"
  },
  {
    id: "ch3-basic-gamma-contains-sigma-tf", chapter: 3, rank: 0, topic: "Alphabets", type: "tf",
    prompt: "Every input symbol is also a tape symbol, so the input alphabet \\(\\Sigma\\) sits inside the tape alphabet \\(\\Gamma\\) (\\(\\Sigma\\subseteq\\Gamma\\)).",
    answer: true,
    explanation: "The input starts out written on the tape, so each input symbol must be a legal tape symbol. The tape alphabet can have more symbols, like the blank.",
    source: "Sipser Def 3.3"
  },

  // ---- The blank symbol ----
  {
    id: "ch3-basic-blank-what", chapter: 3, rank: 0, topic: "The blank symbol", type: "mc",
    prompt: "What is the **blank symbol** \\(\\sqcup\\)?",
    choices: [
      "A special tape symbol marking an empty cell — it fills the whole tape past where the input ends",
      "The very first symbol of every input",
      "A symbol meaning the machine has accepted",
      "Another name for the start state"
    ],
    answer: 0,
    explanation: "The blank \\(\\sqcup\\) marks cells that hold nothing yet. After the input, the rest of the endless tape is all blanks.",
    source: "Sipser Def 3.3"
  },
  {
    id: "ch3-basic-blank-not-input-tf", chapter: 3, rank: 0, topic: "The blank symbol", type: "tf",
    prompt: "The blank symbol is a tape symbol, but it is never allowed to be part of the input string.",
    answer: true,
    explanation: "The blank lives in the tape alphabet \\(\\Gamma\\) but not the input alphabet \\(\\Sigma\\). That way the machine can tell where the real input stops and the blanks begin.",
    source: "Sipser Def 3.3"
  },
  {
    id: "ch3-basic-blank-fills-rest-fib", chapter: 3, rank: 0, topic: "The blank symbol", type: "fib",
    prompt: "When a machine starts, the input sits at the left of the tape and every cell after it holds the ____ symbol.",
    accept: ["blank", "blank symbol"],
    explanation: "Past the end of the input, the endless tape is filled with the blank symbol \\(\\sqcup\\), marking empty cells.",
    source: "Sipser Def 3.3"
  },

  // ---- Transition function in words ----
  {
    id: "ch3-basic-delta-what", chapter: 3, rank: 0, topic: "Transition rules", type: "mc",
    prompt: "The **transition function** \\(\\delta\\) is the machine's rule book. Given the current state and the symbol under the head, what does one rule tell the machine to do?",
    choices: [
      "Go to a new state, write a symbol in the current cell, and move the head left or right",
      "Only change to a new state, nothing else",
      "Print the whole answer and stop immediately",
      "Erase the entire tape and start over"
    ],
    answer: 0,
    explanation: "Each rule looks at (state, symbol read) and says three things: the next state, the symbol to write, and which way to move (L or R). In symbols, \\(\\delta:Q\\times\\Gamma\\to Q\\times\\Gamma\\times\\{L,R\\}\\).",
    source: "Sipser Def 3.3"
  },

  // ---- Accept / reject states ----
  {
    id: "ch3-basic-accept-state-what", chapter: 3, rank: 0, topic: "Accept & reject", type: "mc",
    prompt: "What is the **accept state** \\(q_{accept}\\)?",
    choices: [
      "A special state that, once entered, makes the machine stop and say \"yes, accept\"",
      "The state the machine always starts in",
      "A state that erases the tape",
      "The symbol written when the machine is done"
    ],
    answer: 0,
    explanation: "If the machine ever reaches the accept state, it halts right away and accepts the input. There is also a reject state that halts and rejects.",
    source: "Sipser Def 3.3"
  },

  // ---- Halting and looping ----
  {
    id: "ch3-basic-halt-what", chapter: 3, rank: 0, topic: "Halting & looping", type: "mc",
    prompt: "What does it mean for a Turing machine to **halt**?",
    choices: [
      "It stops running — either by accepting or by rejecting",
      "It writes a blank on the tape",
      "It moves its head all the way to the left",
      "It restarts from the beginning"
    ],
    answer: 0,
    explanation: "To halt is simply to stop. A Turing machine halts by entering its accept state or its reject state.",
    source: "Sipser §3.1"
  },
  {
    id: "ch3-basic-loop-what", chapter: 3, rank: 0, topic: "Halting & looping", type: "mc",
    prompt: "What does it mean for a Turing machine to **loop**?",
    choices: [
      "It runs forever and never halts — it neither accepts nor rejects",
      "It accepts and then rejects the same input",
      "It reads its input exactly twice",
      "It prints every string in its language"
    ],
    answer: 0,
    explanation: "Looping means running forever without stopping. A looping machine never reaches an accept or reject state, so it gives no answer.",
    source: "Sipser §3.1"
  },
  {
    id: "ch3-basic-three-outcomes", chapter: 3, rank: 0, topic: "Halting & looping", type: "mc",
    prompt: "When you start a Turing machine on an input, how many possible outcomes are there?",
    choices: [
      "Three: accept, reject, or loop forever",
      "Two: accept or reject — it always stops",
      "One: it always accepts",
      "Four, including a special \"maybe\" answer"
    ],
    answer: 0,
    explanation: "A run can accept, reject, or loop forever. The possibility of looping is what sets Turing machines apart from simpler models that always stop.",
    source: "Sipser §3.1"
  },

  // ---- Configuration ----
  {
    id: "ch3-basic-config-what", chapter: 3, rank: 0, topic: "Configuration", type: "mc",
    prompt: "A **configuration** is a snapshot of a Turing machine at one moment. Which three things does it record?",
    choices: [
      "The current state, the current tape contents, and where the head is",
      "The accept state, the reject state, and the start state",
      "The input alphabet, the tape alphabet, and the blank",
      "The number of steps, the number of states, and the answer"
    ],
    answer: 0,
    explanation: "A configuration captures everything you need to continue the run: the state the machine is in, what is written on the tape, and the head's position.",
    source: "Sipser §3.1 (Configurations)"
  },

  // ---- Recognizer vs decider ----
  {
    id: "ch3-basic-decider-what", chapter: 3, rank: 0, topic: "Recognizer vs decider", type: "mc",
    prompt: "What is a **decider**?",
    choices: [
      "A Turing machine that always halts — it never loops, so it always answers accept or reject",
      "A Turing machine that always accepts",
      "A machine with no reject state",
      "A machine that only prints strings"
    ],
    answer: 0,
    explanation: "A decider is a Turing machine that halts on every input. Because it never loops, it always gives a clear yes-or-no answer.",
    source: "Sipser Def 3.6"
  },
  {
    id: "ch3-basic-recognizer-vs-decider", chapter: 3, rank: 0, topic: "Recognizer vs decider", type: "mc",
    prompt: "How does a **decider** differ from a plain **recognizer**?",
    choices: [
      "A decider must halt on every input; a recognizer is allowed to loop forever on strings not in its language",
      "A decider may loop, but a recognizer always halts",
      "A decider has a tape, but a recognizer does not",
      "There is no difference at all"
    ],
    answer: 0,
    explanation: "Both accept exactly the strings in the language. The extra promise a decider makes is that it always halts — it never loops, not even on non-members.",
    source: "Sipser Def 3.5, 3.6"
  },

  // ---- Recognizable vs decidable ----
  {
    id: "ch3-basic-recognizable-what", chapter: 3, rank: 0, topic: "Recognizable vs decidable", type: "mc",
    prompt: "What does it mean for a language to be **Turing-recognizable**?",
    choices: [
      "Some Turing machine accepts exactly the strings in that language (it may loop on the others)",
      "Some Turing machine rejects every string",
      "Some finite-state machine accepts it",
      "No machine can accept it"
    ],
    answer: 0,
    explanation: "A language is Turing-recognizable if there is a TM that accepts every string in it. On strings not in the language, that machine may reject or loop forever.",
    source: "Sipser Def 3.5"
  },
  {
    id: "ch3-basic-decidable-what", chapter: 3, rank: 0, topic: "Recognizable vs decidable", type: "mc",
    prompt: "What does it mean for a language to be **Turing-decidable**?",
    choices: [
      "Some decider recognizes it — a Turing machine that halts on every input and accepts exactly that language",
      "Some machine accepts it but might loop on non-members",
      "Some printer eventually lists it",
      "It contains only finitely many strings"
    ],
    answer: 0,
    explanation: "Decidable means a decider handles it: the machine always halts and accepts exactly the strings in the language. Halting on every input is the key extra requirement.",
    source: "Sipser Def 3.6"
  },

  // ---- L(M) ----
  {
    id: "ch3-basic-language-of-m", chapter: 3, rank: 0, topic: "Language of a machine", type: "mc",
    prompt: "What is \\(L(M)\\), the **language of a machine** \\(M\\)?",
    choices: [
      "The set of all strings that \\(M\\) accepts",
      "The set of all strings that \\(M\\) rejects",
      "The list of states inside \\(M\\)",
      "The symbols \\(M\\) is allowed to write"
    ],
    answer: 0,
    explanation: "\\(L(M)\\) collects every string the machine accepts. Strings it rejects or loops on are not in \\(L(M)\\).",
    source: "Sipser §3.1"
  },

  // ---- Variants and equivalence ----
  {
    id: "ch3-basic-multitape-what", chapter: 3, rank: 0, topic: "TM variants", type: "mc",
    prompt: "What is a **multitape** Turing machine?",
    choices: [
      "A Turing machine with several tapes, each with its own head",
      "A Turing machine that can only read, never write",
      "A finite-state machine with no tape",
      "A Turing machine whose tape is finite"
    ],
    answer: 0,
    explanation: "A multitape machine has more than one tape, each with its own head. It is often handier to program, but it is no more powerful than the one-tape model.",
    source: "Sipser §3.2"
  },
  {
    id: "ch3-basic-variants-equal-power-tf", chapter: 3, rank: 0, topic: "TM variants", type: "tf",
    prompt: "Multitape machines, nondeterministic machines, and enumerators all recognize exactly the same languages as an ordinary one-tape Turing machine.",
    answer: true,
    explanation: "These variants are all equally powerful: each can be simulated by a basic one-tape TM, so they recognize the very same class of languages.",
    source: "Sipser §3.2 (Thm 3.13, 3.16, 3.21)"
  },
  {
    id: "ch3-basic-enumerator-what", chapter: 3, rank: 0, topic: "TM variants", type: "mc",
    prompt: "What is an **enumerator**?",
    choices: [
      "A Turing machine with a printer that prints out a list of strings — the strings it prints are its language",
      "A Turing machine that answers yes or no about one input",
      "A machine that counts the number of states in another machine",
      "A finite-state machine that sorts its input"
    ],
    answer: 0,
    explanation: "An enumerator is a TM hooked to a printer. It just keeps printing strings, and the language it defines is the collection of everything it ever prints.",
    source: "Sipser §3.2 (Enumerators)"
  },

  // ---- Church–Turing thesis ----
  {
    id: "ch3-basic-church-turing-what", chapter: 3, rank: 0, topic: "Church–Turing thesis", type: "mc",
    prompt: "In plain words, what does the **Church–Turing thesis** say?",
    choices: [
      "Anything we would call an \"algorithm\" can be done by a Turing machine",
      "Every Turing machine always halts",
      "Turing machines are weaker than real computers",
      "Only regular languages can be decided"
    ],
    answer: 0,
    explanation: "The Church–Turing thesis ties the everyday idea of an \"algorithm\" to the precise Turing-machine model: if a step-by-step method exists, a Turing machine can carry it out.",
    source: "Sipser §3.3 (Church–Turing thesis)"
  },
  {
    id: "ch3-basic-ct-not-theorem-tf", chapter: 3, rank: 0, topic: "Church–Turing thesis", type: "tf",
    prompt: "The Church–Turing thesis links an informal idea (\"algorithm\") to a formal model (the Turing machine), rather than being something you prove like a theorem.",
    answer: true,
    explanation: "It is a thesis, not a theorem: it connects the fuzzy everyday notion of an algorithm to the exact Turing-machine definition. We accept it because every reasonable model of computation has turned out equivalent.",
    source: "Sipser §3.3"
  },

  // ---- Encoding objects as strings ----
  {
    id: "ch3-basic-encoding-what", chapter: 3, rank: 0, topic: "Encoding objects", type: "mc",
    prompt: "A Turing machine's input must be a string. So when we want to feed it an object like a graph or another machine \\(M\\), we first turn the object into a string. What does \\(\\langle M\\rangle\\) mean?",
    choices: [
      "A string that encodes (describes) the object \\(M\\)",
      "The machine \\(M\\) running and accepting",
      "The number of states in \\(M\\)",
      "The blank symbol followed by \\(M\\)"
    ],
    answer: 0,
    explanation: "The angle brackets \\(\\langle\\cdot\\rangle\\) mean \"the string encoding of.\" So \\(\\langle M\\rangle\\) is a string that describes the object \\(M\\), and \\(\\langle M,w\\rangle\\) is one string encoding both \\(M\\) and \\(w\\).",
    source: "Sipser §3.3 (encoding)"
  },
  {
    id: "ch3-basic-encoding-why-fib", chapter: 3, rank: 0, topic: "Encoding objects", type: "fib",
    prompt: "We must encode objects like graphs or machines as strings because a Turing machine's input is always a ____.",
    accept: ["string", "a string"],
    explanation: "A TM only reads strings, so any object must first be written down as a string before it can be handed to the machine.",
    source: "Sipser §3.3"
  }
]);
