/* Chapter 0 — Mathematical Preliminaries (Sipser 0.1–0.4).
   Sets, sequences/tuples, functions & relations, graphs, strings & languages,
   Boolean logic, and the three proof techniques. */
TOC.addQuestions([
  // ---- Sets ----
  {
    id: "ch0-sets-emptyset-subset", chapter: 0, topic: "Sets", type: "tf",
    prompt: "The empty set \\(\\emptyset\\) is a subset of every set.",
    answer: true,
    explanation: "\\(A\\subseteq B\\) means every element of \\(A\\) is in \\(B\\). Since \\(\\emptyset\\) has no elements, the condition holds vacuously for any \\(B\\).",
    source: "Sipser §0.2 (Sets)"
  },
  {
    id: "ch0-sets-powerset-size", chapter: 0, topic: "Sets", type: "mc",
    prompt: "If a set \\(A\\) has \\(n\\) elements, how many elements does its power set \\(\\mathcal{P}(A)\\) have?",
    choices: ["\\(n\\)", "\\(2n\\)", "\\(2^n\\)", "\\(n^2\\)"],
    answer: 2,
    explanation: "The power set is the set of all subsets. Each element is independently in or out of a subset, giving \\(2^n\\) subsets.",
    source: "Sipser §0.2 (Sets)"
  },
  {
    id: "ch0-sets-cardinality-fib", chapter: 0, topic: "Sets", type: "fib",
    prompt: "The number of elements in a set is called its ____.",
    accept: ["cardinality", "size", "the cardinality"],
    explanation: "The cardinality (or size) of a finite set \\(A\\) is written \\(|A|\\).",
    source: "Sipser §0.2 (Sets)"
  },
  {
    id: "ch0-sets-properties-multi", chapter: 0, topic: "Sets", type: "multi",
    prompt: "Which statements about sets are true?",
    choices: [
      "A set is unordered: \\(\\{1,2\\}=\\{2,1\\}\\)",
      "Repetition is ignored: \\(\\{1,1,2\\}=\\{1,2\\}\\)",
      "\\(A\\cap B\\) is the set of elements in both \\(A\\) and \\(B\\)",
      "\\(A\\subseteq B\\) implies \\(B\\subseteq A\\)"
    ],
    answers: [0, 1, 2],
    explanation: "Sets are unordered and ignore repetition; intersection collects common elements. Subset is not symmetric — \\(A\\subseteq B\\) does not force \\(B\\subseteq A\\).",
    source: "Sipser §0.2 (Sets)"
  },

  // ---- Sequences & tuples ----
  {
    id: "ch0-seq-order-matters", chapter: 0, topic: "Sequences & tuples", type: "tf",
    prompt: "In a sequence (tuple), order matters and repeated elements are allowed.",
    answer: true,
    explanation: "Unlike a set, a sequence is ordered and may repeat: \\((1,2)\\neq(2,1)\\) and \\((1,1,2)\\) is a valid 3-tuple.",
    source: "Sipser §0.2 (Sequences and tuples)"
  },
  {
    id: "ch0-seq-cartesian", chapter: 0, topic: "Sequences & tuples", type: "mc",
    prompt: "The Cartesian product \\(A\\times B\\) is the set of all ____.",
    choices: [
      "ordered pairs \\((a,b)\\) with \\(a\\in A,\\ b\\in B\\)",
      "elements in \\(A\\) or \\(B\\)",
      "subsets of \\(A\\cup B\\)",
      "functions from \\(A\\) to \\(B\\)"
    ],
    answer: 0,
    explanation: "\\(A\\times B=\\{(a,b)\\mid a\\in A \\text{ and } b\\in B\\}\\); its size is \\(|A|\\cdot|B|\\).",
    source: "Sipser §0.2 (Sequences and tuples)"
  },

  // ---- Functions & relations ----
  {
    id: "ch0-fn-onto", chapter: 0, topic: "Functions & relations", type: "mc",
    prompt: "A function \\(f:A\\to B\\) is **onto** (surjective) exactly when:",
    choices: [
      "every element of \\(B\\) is \\(f(a)\\) for some \\(a\\in A\\)",
      "distinct inputs give distinct outputs",
      "\\(f\\) is defined on all of \\(A\\)",
      "\\(|A|=|B|\\)"
    ],
    answer: 0,
    explanation: "Onto means the range equals the codomain \\(B\\): nothing in \\(B\\) is missed. Distinct-inputs-distinct-outputs is the *one-to-one* (injective) property instead.",
    source: "Sipser §0.2 (Functions and relations)"
  },
  {
    id: "ch0-fn-injective-fib", chapter: 0, topic: "Functions & relations", type: "fib",
    prompt: "A function that maps distinct inputs to distinct outputs is called ____ (give the one-word term).",
    accept: ["injective", "one-to-one", "one to one", "1-1"],
    explanation: "An injective (one-to-one) function never sends two different inputs to the same output.",
    source: "Sipser §0.2 (Functions and relations)"
  },
  {
    id: "ch0-rel-equivalence", chapter: 0, topic: "Functions & relations", type: "mc",
    prompt: "A binary relation is an **equivalence relation** exactly when it is:",
    choices: [
      "reflexive, symmetric, and transitive",
      "reflexive and antisymmetric",
      "symmetric and total",
      "transitive and irreflexive"
    ],
    answer: 0,
    explanation: "Equivalence relations satisfy all three of reflexivity, symmetry, and transitivity, and they partition the underlying set into equivalence classes.",
    source: "Sipser §0.2 (Functions and relations)"
  },
  {
    id: "ch0-fn-domain-range", chapter: 0, topic: "Functions & relations", type: "tf",
    prompt: "For \\(f:A\\to B\\), the range of \\(f\\) is always a subset of the codomain \\(B\\), but need not equal \\(B\\).",
    answer: true,
    explanation: "The range (set of actual outputs) satisfies \\(\\text{range}(f)\\subseteq B\\); equality holds iff \\(f\\) is onto.",
    source: "Sipser §0.2 (Functions and relations)"
  },

  // ---- Graphs ----
  {
    id: "ch0-graph-degree", chapter: 0, topic: "Graphs", type: "mc",
    prompt: "In an undirected graph, the **degree** of a node is:",
    choices: [
      "the number of edges touching it",
      "the number of nodes in the graph",
      "the length of the longest path from it",
      "the number of nodes it cannot reach"
    ],
    answer: 0,
    explanation: "Degree counts the edges incident to the node (a self-loop, where allowed, contributes 2).",
    source: "Sipser §0.2 (Graphs)"
  },
  {
    id: "ch0-graph-handshake", chapter: 0, topic: "Graphs", type: "tf",
    prompt: "In any undirected graph, the sum of the degrees of all nodes equals twice the number of edges.",
    answer: true,
    explanation: "Each edge contributes 1 to the degree of each of its two endpoints, so it is counted twice in the degree sum (the handshaking lemma).",
    source: "Sipser §0.2 (Graphs)"
  },
  {
    id: "ch0-graph-tree-fib", chapter: 0, topic: "Graphs", type: "fib",
    prompt: "A connected graph with no cycles is called a ____.",
    accept: ["tree", "a tree"],
    explanation: "A tree is a connected acyclic graph; on \\(n\\) nodes it has exactly \\(n-1\\) edges.",
    source: "Sipser §0.2 (Graphs)"
  },

  // ---- Strings & languages ----
  {
    id: "ch0-str-sigma-star", chapter: 0, topic: "Strings & languages", type: "mc",
    prompt: "For an alphabet \\(\\Sigma\\), the notation \\(\\Sigma^*\\) denotes:",
    choices: [
      "the set of all finite strings over \\(\\Sigma\\), including the empty string",
      "the set of all nonempty strings over \\(\\Sigma\\)",
      "the set of all infinite strings over \\(\\Sigma\\)",
      "the alphabet \\(\\Sigma\\) with one extra symbol"
    ],
    answer: 0,
    explanation: "\\(\\Sigma^*\\) is the set of all finite-length strings over \\(\\Sigma\\), and it always contains the empty string \\(\\varepsilon\\). (\\(\\Sigma^+\\) excludes \\(\\varepsilon\\).)",
    source: "Sipser §0.2 (Strings and languages)"
  },
  {
    id: "ch0-str-empty-fib", chapter: 0, topic: "Strings & languages", type: "fib",
    prompt: "The string of length zero is called the empty string and is written with which Greek letter? (name it)",
    accept: ["epsilon", "varepsilon", "ε", "the empty string"],
    explanation: "The empty string is denoted \\(\\varepsilon\\) and has length \\(|\\varepsilon|=0\\).",
    source: "Sipser §0.2 (Strings and languages)"
  },
  {
    id: "ch0-str-language-def", chapter: 0, topic: "Strings & languages", type: "tf",
    prompt: "A **language** is a set of strings (a subset of \\(\\Sigma^*\\)).",
    answer: true,
    explanation: "By definition a language over \\(\\Sigma\\) is any set \\(L\\subseteq\\Sigma^*\\); it may be finite or infinite, and \\(\\emptyset\\) is a language.",
    source: "Sipser §0.2 (Strings and languages)"
  },
  {
    id: "ch0-str-count", chapter: 0, topic: "Strings & languages", type: "mc",
    prompt: "How many strings of length exactly \\(n\\) are there over a binary alphabet \\(\\Sigma=\\{0,1\\}\\)?",
    choices: ["\\(2^n\\)", "\\(2n\\)", "\\(n^2\\)", "\\(n!\\)"],
    answer: 0,
    explanation: "Each of the \\(n\\) positions independently has 2 choices, giving \\(2^n\\) strings.",
    source: "Sipser §0.2 (Strings and languages)"
  },

  // ---- Boolean logic ----
  {
    id: "ch0-bool-implication", chapter: 0, topic: "Boolean logic", type: "mc",
    prompt: "The implication \\(P\\Rightarrow Q\\) is **false** in exactly which case?",
    choices: [
      "\\(P\\) true and \\(Q\\) false",
      "\\(P\\) false and \\(Q\\) true",
      "\\(P\\) false and \\(Q\\) false",
      "\\(P\\) true and \\(Q\\) true"
    ],
    answer: 0,
    explanation: "An implication only fails when the hypothesis holds but the conclusion does not; whenever \\(P\\) is false, \\(P\\Rightarrow Q\\) is (vacuously) true.",
    source: "Sipser §0.2 (Boolean logic)"
  },
  {
    id: "ch0-bool-xor-fib", chapter: 0, topic: "Boolean logic", type: "fib",
    prompt: "The exclusive-or \\(P\\oplus Q\\) is true exactly when the two operands ____ (one word).",
    accept: ["differ", "disagree", "are different", "are unequal"],
    explanation: "XOR is true iff its operands have different truth values.",
    source: "Sipser §0.2 (Boolean logic)"
  },
  {
    id: "ch0-bool-demorgan-multi", chapter: 0, topic: "Boolean logic", type: "multi",
    prompt: "Which of the following are valid logical equivalences?",
    choices: [
      "\\(\\overline{P\\wedge Q}=\\overline{P}\\vee\\overline{Q}\\)",
      "\\(\\overline{P\\vee Q}=\\overline{P}\\wedge\\overline{Q}\\)",
      "\\((P\\Rightarrow Q)=(\\overline{P}\\vee Q)\\)",
      "\\(\\overline{P\\wedge Q}=\\overline{P}\\wedge\\overline{Q}\\)"
    ],
    answers: [0, 1, 2],
    explanation: "The first two are De Morgan's laws; the third rewrites implication. The last is wrong — negating a conjunction gives a disjunction, not a conjunction.",
    source: "Sipser §0.2 (Boolean logic)"
  },

  // ---- Proof techniques ----
  {
    id: "ch0-proof-contradiction", chapter: 0, topic: "Proof techniques", type: "mc",
    prompt: "In a proof **by contradiction**, you begin by assuming:",
    choices: [
      "the negation of the statement you want to prove",
      "the statement is true and simplify it",
      "a smaller instance of the statement (induction)",
      "an explicit example exists"
    ],
    answer: 0,
    explanation: "You assume the claim is false, then derive a contradiction, forcing the original claim to be true. Sipser's proof that \\(\\sqrt{2}\\) is irrational is the classic example.",
    source: "Sipser §0.4 (Proof by contradiction)"
  },
  {
    id: "ch0-proof-construction-tf", chapter: 0, topic: "Proof techniques", type: "tf",
    prompt: "A proof **by construction** establishes that an object exists by actually exhibiting one (or giving a procedure that builds it).",
    answer: true,
    explanation: "Constructive proofs demonstrate existence by building the object — e.g., constructing a graph with a desired property, or a DFA recognizing a language.",
    source: "Sipser §0.4 (Proof by construction)"
  },
  {
    id: "ch0-proof-induction-when", chapter: 0, topic: "Proof techniques", type: "mc",
    prompt: "Which statement is most naturally proved by **induction**?",
    choices: [
      "\\(\\sum_{i=1}^{n} i = \\tfrac{n(n+1)}{2}\\) for all \\(n\\ge 1\\)",
      "\\(\\sqrt{2}\\) is irrational",
      "There exist two people with the same number of friends",
      "The empty set is a subset of every set"
    ],
    answer: 0,
    explanation: "A claim quantified over all natural numbers \\(n\\) is the prototypical target for induction: prove a base case, then the inductive step.",
    source: "Sipser §0.4 (Proof by induction)"
  },
  {
    id: "ch0-proof-induction-order", chapter: 0, topic: "Proof techniques", type: "order",
    prompt: "Put the parts of a standard proof by induction in order.",
    items: [
      "Base case: prove \\(P(1)\\) (or \\(P(0)\\))",
      "Inductive hypothesis: assume \\(P(k)\\) holds",
      "Inductive step: use \\(P(k)\\) to prove \\(P(k+1)\\)",
      "Conclude \\(P(n)\\) holds for all \\(n\\)"
    ],
    explanation: "Induction establishes a base case, assumes the hypothesis at \\(k\\), proves it carries to \\(k+1\\), and concludes the statement for all \\(n\\).",
    source: "Sipser §0.4 (Proof by induction)"
  },
  {
    id: "ch0-proof-pigeonhole", chapter: 0, topic: "Proof techniques", type: "mc",
    prompt: "The **pigeonhole principle** states that if \\(n\\) items are placed into \\(m\\) boxes with \\(n>m\\), then:",
    choices: [
      "some box contains at least two items",
      "every box contains at least one item",
      "some box is empty",
      "the items can be evenly distributed"
    ],
    answer: 0,
    explanation: "With more items than boxes, at least one box must hold two or more items. This underlies many counting arguments (and the pumping lemma's repeated-state idea).",
    source: "Sipser §0.2 (used throughout)"
  }
]);
