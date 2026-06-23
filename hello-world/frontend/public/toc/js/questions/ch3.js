/* Chapter 3 — The Church–Turing Thesis: Turing Machines (Sipser 3.1–3.3).
   Formal definition (7-tuple) & transition function, configurations & yielding,
   acceptance/rejection/looping, recognizable vs decidable, descriptions &
   encodings, variants (multitape, nondeterministic, enumerators) and their
   equivalence, the Church–Turing thesis & Hilbert's 10th, and closure
   properties of decidable / recognizable languages. */
TOC.addQuestions([
  // ---- Formal definition: the 7-tuple ----
  {
    id: "ch3-tm-7tuple-count", chapter: 3, topic: "TM formal definition", type: "mc",
    prompt: "A Turing machine is formally defined as a tuple with how many components?",
    choices: ["5-tuple", "6-tuple", "7-tuple", "8-tuple"],
    answer: 2,
    explanation: "A TM is the 7-tuple \\((Q,\\Sigma,\\Gamma,\\delta,q_0,q_{accept},q_{reject})\\): states, input alphabet, tape alphabet, transition function, start state, accept state, and reject state.",
    source: "Sipser Def 3.3"
  },
  {
    id: "ch3-tm-7tuple-components", chapter: 3, topic: "TM formal definition", type: "multi",
    prompt: "Which of the following are components of the 7-tuple \\((Q,\\Sigma,\\Gamma,\\delta,q_0,q_{accept},q_{reject})\\) in the formal definition of a Turing machine?",
    choices: [
      "The tape alphabet \\(\\Gamma\\)",
      "The transition function \\(\\delta\\)",
      "A single accept state \\(q_{accept}\\) and a single reject state \\(q_{reject}\\)",
      "A stack alphabet \\(\\Gamma_{stack}\\)",
      "An explicit set of final states \\(F\\subseteq Q\\)"
    ],
    answers: [0, 1, 2],
    explanation: "The TM 7-tuple lists \\(Q,\\Sigma,\\Gamma,\\delta,q_0,q_{accept},q_{reject}\\). There is no stack (that is a PDA); acceptance is by the single states \\(q_{accept}/q_{reject}\\), not a set \\(F\\).",
    source: "Sipser Def 3.3"
  },

  // ---- Transition function ----
  {
    id: "ch3-tm-delta-form", chapter: 3, topic: "Transition function", type: "mc",
    prompt: "For a (deterministic, one-tape) Turing machine, the transition function has which form?",
    choices: [
      "\\(\\delta:Q\\times\\Gamma\\to Q\\times\\Gamma\\times\\{L,R\\}\\)",
      "\\(\\delta:Q\\times\\Sigma\\to Q\\)",
      "\\(\\delta:Q\\times\\Gamma\\to Q\\times\\{L,R\\}\\)",
      "\\(\\delta:Q\\times\\Sigma_\\varepsilon\\to\\mathcal{P}(Q)\\)"
    ],
    answer: 0,
    explanation: "On reading symbol \\(a\\) in state \\(q\\), \\(\\delta(q,a)=(r,b,L)\\) tells the machine to enter state \\(r\\), write \\(b\\) over \\(a\\), and move the head left (or right). It both reads/writes over the full tape alphabet \\(\\Gamma\\) and moves \\(L\\) or \\(R\\).",
    source: "Sipser Def 3.3"
  },
  {
    id: "ch3-tm-delta-codomain-fib", chapter: 3, topic: "Transition function", type: "fib",
    prompt: "After writing a symbol, the head of a standard one-tape TM must move in one of two directions. Give the two direction labels used in \\(\\delta\\) (the set \\(\\{?,?\\}\\)).",
    accept: ["L, R", "L,R", "R, L", "R,L", "left, right", "left and right", "L and R", "left right"],
    explanation: "The basic model's move set is \\(\\{L,R\\}\\) — left or right. A 'stay put' option \\(S\\) can be simulated (move right then left) and adds no power, but it is not part of Definition 3.3.",
    source: "Sipser Def 3.3"
  },

  // ---- Tape & input alphabets ----
  {
    id: "ch3-tm-alphabets-subset", chapter: 3, topic: "Tape & input alphabets", type: "multi",
    prompt: "Let \\(\\Sigma\\) be the input alphabet and \\(\\Gamma\\) the tape alphabet of a Turing machine, with blank symbol \\(\\sqcup\\). Which statements are required by the definition?",
    choices: [
      "\\(\\Sigma\\subseteq\\Gamma\\)",
      "\\(\\sqcup\\in\\Gamma\\)",
      "\\(\\sqcup\\notin\\Sigma\\)",
      "\\(\\Gamma=\\Sigma\\)",
      "\\(\\Sigma\\) and \\(\\Gamma\\) must both be infinite"
    ],
    answers: [0, 1, 2],
    explanation: "By Def 3.3, \\(\\Sigma\\subseteq\\Gamma\\), the blank \\(\\sqcup\\in\\Gamma\\), and \\(\\sqcup\\notin\\Sigma\\). Hence \\(\\Gamma\\neq\\Sigma\\) always (the blank is in \\(\\Gamma\\) but never in \\(\\Sigma\\)); both alphabets are finite sets.",
    source: "Sipser Def 3.3, Exercise 3.5(b)"
  },
  // ---- Configurations and yielding ----
  {
    id: "ch3-config-parts", chapter: 3, topic: "Configurations", type: "mc",
    prompt: "A configuration of a Turing machine records exactly which three pieces of information?",
    choices: [
      "Current state, current tape contents, and current head location",
      "Input string, output string, and number of steps taken",
      "Start state, accept state, and reject state",
      "Tape alphabet, transition function, and head location"
    ],
    answer: 0,
    explanation: "A configuration is the current state, the current tape contents, and the head position. Sipser writes it as \\(u\\,q\\,v\\): state \\(q\\), tape contents \\(uv\\), with the head on the first symbol of \\(v\\).",
    source: "Sipser §3.1 (Configurations)"
  },
  {
    id: "ch3-config-yield-right", chapter: 3, topic: "Configurations", type: "mc",
    prompt: "Suppose \\(\\delta(q_i,b)=(q_j,c,R)\\). Which yields relation is correct for this rightward move (head not at an end)?",
    choices: [
      "\\(u a\\,q_i\\,bv\\) yields \\(uac\\,q_j\\,v\\)",
      "\\(u a\\,q_i\\,bv\\) yields \\(u\\,q_j\\,acv\\)",
      "\\(u a\\,q_i\\,bv\\) yields \\(uac\\,q_j\\,bv\\)",
      "\\(u a\\,q_i\\,bv\\) yields \\(u\\,q_j\\,cv\\)"
    ],
    answer: 0,
    explanation: "On a rightward transition \\(\\delta(q_i,b)=(q_j,c,R)\\), the machine writes \\(c\\) over \\(b\\), enters \\(q_j\\), and the head moves right onto the next symbol: \\(ua\\,q_i\\,bv\\) yields \\(uac\\,q_j\\,v\\).",
    source: "Sipser §3.1 (yields)"
  },
  {
    id: "ch3-config-left-end", chapter: 3, topic: "Configurations", type: "tf",
    prompt: "If a Turing machine tries to move its head left while it is already on the leftmost tape cell, the head stays on that cell (it does not fall off the tape).",
    answer: true,
    explanation: "The model prevents the head from moving off the left-hand end: a left-move transition at the left end leaves the head in place. So the head can occupy the same cell in two successive steps.",
    source: "Sipser Def 3.3, Exercise 3.5(c)"
  },
  {
    id: "ch3-config-start-fib", chapter: 3, topic: "Configurations", type: "fib",
    prompt: "On input \\(w\\), a Turing machine begins in the configuration \\(q_0\\,w\\), called the ____ configuration. (one word)",
    accept: ["start", "starting", "initial"],
    explanation: "The start configuration of \\(M\\) on \\(w\\) is \\(q_0\\,w\\): the machine is in start state \\(q_0\\) with the head on the leftmost tape cell and the input written from there.",
    source: "Sipser §3.1"
  },
  {
    id: "ch3-accept-sequence", chapter: 3, topic: "Configurations", type: "order",
    prompt: "A TM \\(M\\) accepts \\(w\\) when a sequence of configurations \\(C_1,\\dots,C_k\\) exists meeting three conditions. Order these conditions as Sipser lists them.",
    items: [
      "\\(C_1\\) is the start configuration of \\(M\\) on \\(w\\)",
      "Each \\(C_i\\) yields \\(C_{i+1}\\)",
      "\\(C_k\\) is an accepting configuration"
    ],
    explanation: "Acceptance means there is a finite run from the start configuration, each step a legal yield, ending in a configuration whose state is \\(q_{accept}\\).",
    source: "Sipser §3.1"
  },

  // ---- Acceptance, rejection, looping ----
  {
    id: "ch3-outcomes-three", chapter: 3, topic: "Acceptance & looping", type: "multi",
    prompt: "When a Turing machine is started on an input, which outcomes are possible?",
    choices: [
      "It halts and accepts",
      "It halts and rejects",
      "It loops (runs forever without halting)",
      "It returns the input unchanged as a guaranteed third halting verdict 'unknown'"
    ],
    answers: [0, 1, 2],
    explanation: "Exactly three outcomes are possible: accept, reject, or loop (never halt). There is no separate 'unknown' halting verdict; failing to accept means rejecting or looping.",
    source: "Sipser §3.1"
  },
  {
    id: "ch3-loop-may-not-halt", chapter: 3, topic: "Acceptance & looping", type: "tf",
    prompt: "Every Turing machine halts on every input.",
    answer: false,
    explanation: "A TM may loop — run forever without entering \\(q_{accept}\\) or \\(q_{reject}\\). Machines that do halt on all inputs are special; they are called deciders.",
    source: "Sipser §3.1"
  },
  {
    id: "ch3-decider-def", chapter: 3, topic: "Acceptance & looping", type: "fib",
    prompt: "A Turing machine that halts on every input — it never loops — is called a ____.",
    accept: ["decider", "a decider"],
    explanation: "A decider always halts and thus always makes a decision (accept or reject). A decider that recognizes a language is said to decide that language.",
    source: "Sipser §3.1"
  },
  {
    id: "ch3-lang-of-m", chapter: 3, topic: "Acceptance & looping", type: "fib",
    prompt: "The set of all strings that a Turing machine \\(M\\) accepts is called the language ____ by \\(M\\); it is written \\(L(M)\\). (one word)",
    accept: ["recognized", "accepted", "recognised"],
    explanation: "\\(L(M)\\) is the language recognized by \\(M\\): the collection of strings \\(M\\) accepts. Strings outside \\(L(M)\\) are either rejected or cause \\(M\\) to loop — both count as 'not accepted'.",
    source: "Sipser §3.1"
  },

  // ---- Recognizable vs decidable ----
  {
    id: "ch3-recognizable-def", chapter: 3, topic: "Recognizable vs decidable", type: "mc",
    prompt: "A language \\(A\\) is **Turing-recognizable** exactly when:",
    choices: [
      "Some Turing machine accepts every string in \\(A\\) and accepts no string outside \\(A\\) (it may loop on non-members)",
      "Some Turing machine halts on every input and accepts exactly \\(A\\)",
      "Some finite automaton recognizes \\(A\\)",
      "Some Turing machine rejects every string not in \\(A\\)"
    ],
    answer: 0,
    explanation: "\\(A\\) is Turing-recognizable if some TM \\(M\\) has \\(L(M)=A\\). On strings not in \\(A\\), \\(M\\) may reject or loop — recognizers are not required to halt on non-members. (Older texts call this 'recursively enumerable'.)",
    source: "Sipser Def 3.5"
  },
  {
    id: "ch3-decidable-def", chapter: 3, topic: "Recognizable vs decidable", type: "mc",
    prompt: "A language is **Turing-decidable** exactly when:",
    choices: [
      "Some Turing machine decides it — i.e. a TM that halts on all inputs and accepts exactly that language",
      "Some Turing machine accepts it but may loop on non-members",
      "Some enumerator prints it in some order",
      "Some nondeterministic TM has an accepting branch on every input"
    ],
    answer: 0,
    explanation: "A language is decidable if a decider (a TM that halts on every input) recognizes it. The key extra requirement over recognizability is halting on all inputs. (Older texts call this 'recursive'.)",
    source: "Sipser Def 3.6"
  },
  {
    id: "ch3-decidable-implies-recognizable", chapter: 3, topic: "Recognizable vs decidable", type: "tf",
    prompt: "Every decidable language is Turing-recognizable, but not every Turing-recognizable language is decidable.",
    answer: true,
    explanation: "A decider is in particular a recognizer, so decidable \\(\\Rightarrow\\) recognizable. The converse fails: a recognizer may loop on non-members, and Chapter 4 exhibits \\(A_{TM}\\), which is recognizable but not decidable.",
    source: "Sipser §3.1"
  },
  // ---- Descriptions and encodings ----
  {
    id: "ch3-desc-levels", chapter: 3, topic: "Describing TMs", type: "order",
    prompt: "Order the three standard levels of describing a Turing machine algorithm from **lowest/most detailed** to **highest/least detailed**.",
    items: [
      "Formal description (states, transition function spelled out in full)",
      "Implementation description (English prose about head moves and tape storage)",
      "High-level description (English prose for the algorithm, ignoring tape/head details)"
    ],
    explanation: "Sipser names three levels: formal (full 7-tuple detail), implementation (describes head movement and tape data in prose), and high-level (the algorithm, ignoring how the tape and head are managed).",
    source: "Sipser §3.3 (Terminology for describing TMs)"
  },
  {
    id: "ch3-encoding-bracket", chapter: 3, topic: "Encoding objects", type: "mc",
    prompt: "Sipser writes \\(\\langle M, w\\rangle\\) to denote:",
    choices: [
      "A single string that encodes the pair: machine \\(M\\) together with string \\(w\\)",
      "The machine \\(M\\) running on input \\(w\\) and accepting",
      "The language of \\(M\\) intersected with \\(\\{w\\}\\)",
      "A two-tape Turing machine with \\(M\\) on tape 1 and \\(w\\) on tape 2"
    ],
    answer: 0,
    explanation: "The notation \\(\\langle O\\rangle\\) is the encoding of an object \\(O\\) as a string; \\(\\langle O_1,\\dots,O_k\\rangle\\) encodes several objects into one string. So \\(\\langle M,w\\rangle\\) is one string encoding both \\(M\\) and \\(w\\). Because a TM's input must be a string, objects (graphs, automata, polynomials, other TMs) are first encoded this way.",
    source: "Sipser §3.3 (encoding)"
  },

  // ---- Variants and equivalence ----
  {
    id: "ch3-multitape-sim-order", chapter: 3, topic: "TM variants", type: "order",
    prompt: "A single-tape TM \\(S\\) simulates a \\(k\\)-tape TM \\(M\\) (Thm 3.13). Order the main steps \\(S\\) performs.",
    items: [
      "Format the single tape to hold the \\(k\\) tape contents separated by \\(\\#\\), with a dotted symbol marking each virtual head",
      "Scan the whole tape once to read the symbols under all \\(k\\) virtual heads",
      "Scan again to write each tape's new symbol and move each virtual head, per \\(M\\)'s transition",
      "If a virtual head runs onto a \\(\\#\\), write a blank there and shift the tape contents one cell right to make room"
    ],
    explanation: "\\(S\\) stores all \\(k\\) tapes on one tape with delimiters and dotted heads, reads the virtual heads in one pass, updates them in a second pass, and grows a virtual tape by shifting right when a head reaches the \\(\\#\\) boundary.",
    source: "Sipser Thm 3.13 (proof)"
  },
  {
    id: "ch3-nondet-delta", chapter: 3, topic: "TM variants", type: "mc",
    prompt: "The transition function of a **nondeterministic** Turing machine has which form?",
    choices: [
      "\\(\\delta:Q\\times\\Gamma\\to\\mathcal{P}(Q\\times\\Gamma\\times\\{L,R\\})\\)",
      "\\(\\delta:Q\\times\\Gamma\\to Q\\times\\Gamma\\times\\{L,R\\}\\)",
      "\\(\\delta:Q\\times\\Gamma^k\\to Q\\times\\Gamma^k\\times\\{L,R,S\\}^k\\)",
      "\\(\\delta:Q\\times\\Sigma_\\varepsilon\\to\\mathcal{P}(Q)\\)"
    ],
    answer: 0,
    explanation: "A nondeterministic TM maps each (state, symbol) pair to a *set* of possible moves: \\(\\delta:Q\\times\\Gamma\\to\\mathcal{P}(Q\\times\\Gamma\\times\\{L,R\\})\\). Its computation is a tree of branches. (The third option is the *multitape* form.)",
    source: "Sipser §3.2 (Nondeterministic TMs)"
  },
  {
    id: "ch3-nondet-bfs", chapter: 3, topic: "TM variants", type: "mc",
    prompt: "A deterministic TM \\(D\\) simulates a nondeterministic TM \\(N\\) by exploring \\(N\\)'s computation tree. Why must \\(D\\) use breadth-first rather than depth-first search?",
    choices: [
      "Depth-first search could go forever down one infinite branch and miss an accepting configuration on another branch",
      "Breadth-first search uses asymptotically less tape",
      "Depth-first search cannot be implemented on a Turing machine",
      "Breadth-first search makes the simulation deterministic, which depth-first cannot"
    ],
    answer: 0,
    explanation: "Because \\(N\\) accepts if *some* branch reaches \\(q_{accept}\\), and a branch may be infinite, depth-first search might descend an infinite branch forever and never reach an accepting configuration elsewhere. Breadth-first explores all branches level by level and is guaranteed to find any accepting configuration.",
    source: "Sipser Thm 3.16 (proof idea)"
  },
  {
    id: "ch3-enumerator-def", chapter: 3, topic: "Enumerators", type: "mc",
    prompt: "An enumerator is best described as:",
    choices: [
      "A Turing machine with an attached printer; the language it enumerates is the set of all strings it eventually prints",
      "A Turing machine that halts on every input and prints 'yes' or 'no'",
      "A finite automaton that lists its accepted strings in lexicographic order",
      "A Turing machine that requires its input to be a list of strings"
    ],
    answer: 0,
    explanation: "An enumerator is a TM with a printer; it ignores its input (it starts on a blank work tape) and prints strings. The enumerated language is everything it prints — possibly an infinite list, in any order, with repetitions.",
    source: "Sipser §3.2 (Enumerators)"
  },
  {
    id: "ch3-enumerator-thm", chapter: 3, topic: "Enumerators", type: "tf",
    prompt: "A language is Turing-recognizable if and only if some enumerator enumerates it.",
    answer: true,
    explanation: "Given an enumerator \\(E\\) for \\(A\\), a TM recognizes \\(A\\) by running \\(E\\) and accepting if \\(w\\) is ever printed. Conversely, a recognizer \\(M\\) yields an enumerator that runs \\(M\\) for \\(i\\) steps on the first \\(i\\) strings for \\(i=1,2,3,\\dots\\), printing any that accept.",
    source: "Sipser Thm 3.21"
  },
  {
    id: "ch3-enumerator-order", chapter: 3, topic: "Enumerators", type: "tf",
    prompt: "An enumerator must print the strings of its language in increasing order and without repetition.",
    answer: false,
    explanation: "An enumerator may generate strings in any order and may repeat them. (Printing in the standard string order without repetition is exactly what characterizes *decidable* languages — Exercise 3.18 — a stronger condition.)",
    source: "Sipser §3.2 (Enumerators), Exercise 3.18"
  },

  // ---- Church–Turing thesis, algorithm, Hilbert ----
  {
    id: "ch3-ct-thesis", chapter: 3, topic: "Church–Turing thesis", type: "mc",
    prompt: "The Church–Turing thesis asserts that:",
    choices: [
      "The intuitive notion of 'algorithm' coincides with what Turing machines can do",
      "Every Turing machine halts on every input",
      "Turing machines are strictly more powerful than the \\(\\lambda\\)-calculus",
      "Every decidable language is regular"
    ],
    answer: 0,
    explanation: "The Church–Turing thesis equates the informal idea of an algorithm with the precise model of the Turing machine (equivalently, Church's \\(\\lambda\\)-calculus). It connects an intuitive notion to a formal one rather than being a provable theorem.",
    source: "Sipser §3.3 (Church–Turing thesis)"
  },
  {
    id: "ch3-hilbert-tenth", chapter: 3, topic: "Hilbert's 10th / algorithms", type: "mc",
    prompt: "Hilbert's tenth problem asked for an algorithm to test whether a polynomial (with integer coefficients) has an integral root. Its actual status is:",
    choices: [
      "No such algorithm exists; the set is undecidable but Turing-recognizable",
      "Such an algorithm exists and was found by Hilbert",
      "The set of such polynomials is decidable but not recognizable",
      "The problem is equivalent to recognizing a regular language"
    ],
    answer: 0,
    explanation: "Matijasevič (1970) proved no algorithm exists: \\(D=\\{p\\mid p \\text{ has an integral root}\\}\\) is undecidable. But \\(D\\) is Turing-recognizable — a TM can try all integer assignments and accept if one gives 0.",
    source: "Sipser §3.3 (Hilbert's problems)"
  },

  // ---- Closure properties ----
  {
    id: "ch3-dec-closure-multi", chapter: 3, topic: "Closure (decidable)", type: "multi",
    prompt: "The class of **decidable** languages is closed under which of these operations?",
    choices: ["Union", "Intersection", "Complement", "Concatenation", "Taking an arbitrary (possibly non-recognizable) subset"],
    answers: [0, 1, 2, 3],
    explanation: "Decidable languages are closed under union, intersection, complement, concatenation, and also star. They are NOT closed under taking arbitrary subsets — most subsets of \\(\\Sigma^*\\) are not even recognizable. Complement works because a decider always halts: swap its accept and reject outcomes.",
    source: "Sipser Exercise 3.15"
  },
  {
    id: "ch3-rec-closure-multi", chapter: 3, topic: "Closure (recognizable)", type: "multi",
    prompt: "The class of **Turing-recognizable** languages is closed under which operations?",
    choices: ["Union", "Intersection", "Concatenation", "Star", "Complement"],
    answers: [0, 1, 2, 3],
    explanation: "Recognizable languages are closed under union, intersection, concatenation, and star. They are NOT closed under complement — that subtlety is developed in Chapter 4 (if a language and its complement are both recognizable, the language is decidable).",
    source: "Sipser Exercise 3.16"
  },
  {
    id: "ch3-rec-closure-complement-tf", chapter: 3, topic: "Closure (recognizable)", type: "tf",
    prompt: "The class of Turing-recognizable languages is closed under complement.",
    answer: false,
    explanation: "Recognizable languages are NOT closed under complement. In fact a language is decidable iff both it and its complement are recognizable (Ch 4), so a recognizable-but-undecidable language has a non-recognizable complement.",
    source: "Sipser Exercise 3.16 (and Ch 4)"
  },
  {
    id: "ch3-rec-closure-union-construction", chapter: 3, topic: "Closure (recognizable)", type: "mc",
    prompt: "Given recognizers \\(M_1,M_2\\) for Turing-recognizable \\(L_1,L_2\\), why does \\(M'\\) for \\(L_1\\cup L_2\\) run \\(M_1\\) and \\(M_2\\) **alternately, step by step**, rather than \\(M_1\\) fully and then \\(M_2\\)?",
    choices: [
      "If \\(M_1\\) loops on \\(w\\), running it to completion first would prevent ever simulating \\(M_2\\), which might accept",
      "Running them alternately uses less tape than running them sequentially",
      "Sequential simulation is impossible on a single-tape Turing machine",
      "Alternating guarantees \\(M'\\) halts on every input"
    ],
    answer: 0,
    explanation: "A recognizer may loop on non-members. If \\(w\\notin L_1\\) but \\(w\\in L_2\\), running \\(M_1\\) to completion first could loop forever and never reach \\(M_2\\). Interleaving the simulations ensures that if either accepts, \\(M'\\) accepts. (Note \\(M'\\) may still loop, so it recognizes but need not decide \\(L_1\\cup L_2\\).)",
    source: "Sipser Exercise 3.16(a)"
  },
  {
    id: "ch3-two-stacks-tm", chapter: 3, topic: "TM variants", type: "tf",
    prompt: "A pushdown automaton equipped with two stacks can simulate a Turing machine tape, making 2-PDAs as powerful as Turing machines.",
    answer: true,
    explanation: "Two stacks simulate a tape: one stack holds the tape contents left of the head, the other holds the contents to the right. Hence 2-PDAs recognize the Turing-recognizable languages, and adding a third stack gives no further power.",
    source: "Sipser Problem 3.9"
  },

  // ============================================================
  // ====  "What is …" plain-language definitions  =============
  // ============================================================
  {
    id: "ch3-concept-tm-what", chapter: 3, topic: "TM formal definition", type: "mc",
    prompt: "In plain terms, what is a **Turing machine (TM)**?",
    choices: [
      "A finite control with an unbounded tape it can read AND write, a head that moves left or right, which may accept, reject, or run forever",
      "A finite automaton with a single stack",
      "A finite automaton that reads its input once and must halt",
      "A grammar that generates strings by applying replacement rules"
    ],
    answer: 0,
    explanation: "A TM adds an unbounded read/write tape and two-way head movement to a finite control. Crucially it need not halt — it can loop — which is why we distinguish recognizers from deciders. It is the standard model of \"any algorithm.\"",
    source: "Sipser Def 3.3"
  },
  {
    id: "ch3-concept-recognize-vs-decide", chapter: 3, topic: "Recognizable vs decidable", type: "mc",
    prompt: "What is the difference between a TM that **recognizes** a language and one that **decides** it?",
    choices: [
      "A recognizer must accept every string in the language (but may loop on strings not in it); a decider must additionally HALT on every input — accepting members and rejecting non-members",
      "A recognizer halts on every input; a decider may loop",
      "They are the same thing",
      "A recognizer uses a tape; a decider uses only states"
    ],
    answer: 0,
    explanation: "Both accept exactly the language's members. The extra requirement for deciding is that the machine HALTS on all inputs (never loops) — so decidable \\(\\Rightarrow\\) recognizable, but not conversely (\\(A_{TM}\\) is recognizable yet undecidable).",
    source: "Sipser Def 3.5, 3.6"
  }
]);
