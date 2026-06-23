/* Chapter 3 — extra distractors (each unambiguously WRONG for its question).
   Keyed by question id. The app samples a varying subset of wrong options each
   render so you can't answer by position or remembered shape. */
TOC.addPools({
  // ---- Formal definition: the 7-tuple ----
  "ch3-tm-7tuple-components": [
    "A stack \\(\\Gamma_{stack}\\) used as auxiliary storage",
    "A separate blank symbol \\(\\sqcup\\) listed as its own tuple component",
    "An input tape head and a separate output tape head",
    "A set of nondeterministic move choices \\(\\Delta\\subseteq Q\\times\\Gamma\\)"
  ],

  // ---- Transition function ----
  "ch3-tm-delta-form": [
    "\\(\\delta:Q\\times\\Gamma\\to\\mathcal{P}(Q\\times\\Gamma\\times\\{L,R\\})\\)",
    "\\(\\delta:Q\\times\\Sigma\\to Q\\times\\Sigma\\times\\{L,R\\}\\)",
    "\\(\\delta:Q\\times\\Gamma\\to\\Gamma\\times\\{L,R\\}\\)",
    "\\(\\delta:Q\\times\\Gamma\\to Q\\times\\Gamma\\times\\{L,R,S\\}\\)"
  ],

  // ---- Configurations and yielding ----
  "ch3-config-parts": [
    "Current state, the transition function, and the input alphabet",
    "The full computation history, the tape alphabet, and the start state",
    "Current head location, current state, and the number of remaining input symbols",
    "Accept state, reject state, and current tape contents"
  ],
  "ch3-config-yield-right": [
    "\\(u a\\,q_i\\,bv\\) yields \\(ua\\,q_j\\,cv\\)",
    "\\(u a\\,q_i\\,bv\\) yields \\(uacb\\,q_j\\,v\\)",
    "\\(u a\\,q_i\\,bv\\) yields \\(uc\\,q_j\\,v\\)"
  ],

  // ---- Recognizable vs decidable ----
  "ch3-recognizable-def": [
    "Some Turing machine halts and rejects every string outside \\(A\\)",
    "Some enumerator prints the strings of \\(A\\) in increasing order without repetition",
    "Some Turing machine accepts exactly \\(A\\) and is guaranteed to halt on all inputs",
    "Every string in \\(A\\) is accepted by a deterministic finite automaton"
  ],
  "ch3-decidable-def": [
    "Some Turing machine recognizes it, possibly looping on strings not in the language",
    "Both the language and its complement are Turing-recognizable but neither is decidable",
    "Some enumerator enumerates it in some (not necessarily sorted) order",
    "Some pushdown automaton with one stack accepts exactly that language"
  ],

  // ---- Encoding objects ----
  "ch3-encoding-bracket": [
    "The result of running \\(M\\) on \\(w\\), i.e. accept, reject, or loop",
    "A pair of tapes, one initialized with \\(M\\) and the other with \\(w\\)",
    "The set \\(\\{w\\}\\) of strings that \\(M\\) accepts on input \\(w\\)",
    "An ordered configuration \\(u\\,q\\,v\\) of \\(M\\) on input \\(w\\)"
  ],

  // ---- Variants and equivalence ----
  "ch3-nondet-delta": [
    "\\(\\delta:\\mathcal{P}(Q)\\times\\Gamma\\to Q\\times\\Gamma\\times\\{L,R\\}\\)",
    "\\(\\delta:Q\\times\\mathcal{P}(\\Gamma)\\to Q\\times\\Gamma\\times\\{L,R\\}\\)",
    "\\(\\delta:Q\\times\\Gamma\\to\\mathcal{P}(Q)\\times\\Gamma\\times\\{L,R\\}\\)"
  ],
  "ch3-nondet-bfs": [
    "Breadth-first search lets \\(D\\) avoid ever copying \\(N\\)'s tape contents",
    "Only breadth-first search can detect when every branch has halted and rejected",
    "Depth-first search would require \\(N\\) to be deterministic in the first place"
  ],
  "ch3-enumerator-def": [
    "A Turing machine whose accepted language must be listed in lexicographic order",
    "A nondeterministic finite automaton that outputs each accepted string once",
    "A decider that, on input \\(w\\), prints every string the machine has accepted so far",
    "A two-tape Turing machine that reads a list of strings and accepts the longest"
  ],

  // ---- Church–Turing thesis ----
  "ch3-ct-thesis": [
    "The \\(\\lambda\\)-calculus can compute strictly more functions than any Turing machine",
    "Every problem solvable by an algorithm can be solved by some finite automaton",
    "A Turing machine can decide any language that is Turing-recognizable",
    "Nondeterministic Turing machines recognize strictly more languages than deterministic ones"
  ],

  // ---- Hilbert's 10th ----
  "ch3-hilbert-tenth": [
    "Such an algorithm exists and was given by Matijasevič in 1970",
    "The set of such polynomials is neither decidable nor Turing-recognizable",
    "The problem is decidable for one variable but the multivariable set is not even recognizable",
    "An algorithm exists for polynomials with rational coefficients but the integer case stays open"
  ],

  // ---- Closure properties ----
  "ch3-dec-closure-multi": [
    "Taking the complement of a non-recognizable language",
    "Mapping each string to an arbitrary, possibly uncomputable, output",
    "Choosing any infinite subset of the language"
  ],
  "ch3-rec-closure-multi": [
    "Set difference \\(L_1\\setminus L_2\\) for arbitrary recognizable \\(L_1,L_2\\)",
    "Taking an arbitrary subset of a recognizable language"
  ],

  // ---- Recognizable closure: union construction ----
  "ch3-rec-closure-union-construction": [
    "Running \\(M_2\\) first to completion guarantees a wrong answer whenever \\(w\\in L_1\\)",
    "Alternating the two simulations makes \\(M'\\) a decider for \\(L_1\\cup L_2\\)",
    "Sequential simulation would compute the intersection \\(L_1\\cap L_2\\) instead of the union",
    "Step-by-step interleaving is required because single-tape TMs cannot store two states at once"
  ]
});

TOC.addPools({
  "ch3-concept-tm-what": [
    "A finite automaton augmented with a single stack",
    "A machine that is guaranteed to halt on every input",
    "A grammar with unrestricted rewriting rules"
  ],
  "ch3-concept-recognize-vs-decide": [
    "A decider may accept some strings not in the language; a recognizer may not",
    "Recognizing a language requires it to be finite",
    "A decider is allowed to loop forever on strings not in the language"
  ]
});
