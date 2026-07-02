/* Chapter 0 — Mathematical Preliminaries: BASICS tier (rank 0).
   Very-beginner definition/explainer questions. Plain language, one idea each,
   for a smart learner who has never seen this. These are the FIRST questions a
   learner sees — build intuition for the raw vocabulary (sets, functions,
   graphs, strings) before any of the harder Ch 0 material in ch0.js.
   Pairs with ch0.js. Every question here has rank: 0 and an id prefixed
   "ch0-basic-". Topic labels reuse the Ch 0 labels from ch0.js. */
TOC.addQuestions([
  // ============================================================
  // ---- Sets: set, element, subset, power set ----
  // ============================================================
  {
    id: "ch0-basic-set-what", chapter: 0, rank: 0, topic: "Sets", type: "mc",
    prompt: "In plain terms, what is a **set**?",
    choices: [
      "An unordered collection of distinct things, with no repeats and no built-in order",
      "A list of things written in a fixed order",
      "A single number",
      "A rule that pairs inputs with outputs"
    ],
    answer: 0,
    explanation: "A set is just a group of objects gathered together, like \\(\\{2,4,6\\}\\). Order does not matter and repeats are ignored, so \\(\\{2,4\\}\\) and \\(\\{4,2,2\\}\\) are the same set.",
    source: "Sipser §0.2 (Sets)"
  },
  {
    id: "ch0-basic-element-what", chapter: 0, rank: 0, topic: "Sets", type: "mc",
    prompt: "What is an **element** (or member) of a set, and how do we write \"\\(x\\) is in \\(A\\)\"?",
    choices: [
      "An element is a thing that belongs to the set; we write \\(x\\in A\\)",
      "An element is a smaller set inside the set; we write \\(x\\subseteq A\\)",
      "An element is the number of things in the set; we write \\(|A|\\)",
      "An element is a copy of the whole set; we write \\(A\\in A\\)"
    ],
    answer: 0,
    explanation: "The objects in a set are its elements (members). \\(x\\in A\\) means \"\\(x\\) is one of the things in \\(A\\)\"; \\(x\\notin A\\) means it is not. For \\(A=\\{2,4,6\\}\\), we have \\(4\\in A\\) but \\(5\\notin A\\).",
    source: "Sipser §0.2 (Sets)"
  },
  {
    id: "ch0-basic-empty-set-what", chapter: 0, rank: 0, topic: "Sets", type: "tf",
    prompt: "True or false: the **empty set** \\(\\emptyset\\) is the set with no elements at all.",
    answer: true,
    explanation: "True. The empty set \\(\\emptyset\\) (also written \\(\\{\\}\\)) contains nothing. It is a perfectly good set — the \"zero\" of set theory — and it is a subset of every set.",
    source: "Sipser §0.2 (Sets)"
  },
  {
    id: "ch0-basic-subset-what", chapter: 0, rank: 0, topic: "Sets", type: "mc",
    prompt: "What does it mean for \\(A\\) to be a **subset** of \\(B\\), written \\(A\\subseteq B\\)?",
    choices: [
      "Every element of \\(A\\) is also an element of \\(B\\)",
      "\\(A\\) and \\(B\\) share exactly one element",
      "\\(A\\) has fewer elements than \\(B\\)",
      "\\(A\\) is an element of \\(B\\)"
    ],
    answer: 0,
    explanation: "\\(A\\subseteq B\\) means \\(A\\) sits entirely inside \\(B\\): each thing in \\(A\\) is also in \\(B\\). For example \\(\\{2,4\\}\\subseteq\\{2,4,6\\}\\). Note a set is always a subset of itself.",
    source: "Sipser §0.2 (Sets)"
  },
  {
    id: "ch0-basic-powerset-what", chapter: 0, rank: 0, topic: "Sets", type: "mc",
    prompt: "What is the **power set** \\(\\mathcal{P}(A)\\) of a set \\(A\\)?",
    choices: [
      "The set of ALL subsets of \\(A\\) (including \\(\\emptyset\\) and \\(A\\) itself)",
      "The set \\(A\\) with each element doubled",
      "The largest element of \\(A\\)",
      "The number of elements of \\(A\\)"
    ],
    answer: 0,
    explanation: "The power set collects every subset of \\(A\\). For \\(A=\\{1,2\\}\\), \\(\\mathcal{P}(A)=\\{\\emptyset,\\{1\\},\\{2\\},\\{1,2\\}\\}\\). If \\(A\\) has \\(n\\) elements, \\(\\mathcal{P}(A)\\) has \\(2^n\\) of them.",
    source: "Sipser §0.2 (Sets)"
  },

  // ============================================================
  // ---- Set operations: union, intersection, complement ----
  // ============================================================
  {
    id: "ch0-basic-union-what", chapter: 0, rank: 0, topic: "Sets", type: "mc",
    prompt: "What is the **union** \\(A\\cup B\\) of two sets?",
    choices: [
      "The set of everything that is in \\(A\\), in \\(B\\), or in both",
      "The set of everything that is in both \\(A\\) and \\(B\\)",
      "The set of everything in \\(A\\) but not in \\(B\\)",
      "The set of all subsets of \\(A\\) and \\(B\\)"
    ],
    answer: 0,
    explanation: "Union pools the two sets together: \\(x\\in A\\cup B\\) if \\(x\\) is in \\(A\\) or in \\(B\\) (or both). For example \\(\\{1,2\\}\\cup\\{2,3\\}=\\{1,2,3\\}\\). It is the \"or\" of sets.",
    source: "Sipser §0.2 (Sets)"
  },
  {
    id: "ch0-basic-intersection-what", chapter: 0, rank: 0, topic: "Sets", type: "mc",
    prompt: "What is the **intersection** \\(A\\cap B\\) of two sets?",
    choices: [
      "The set of everything that is in BOTH \\(A\\) and \\(B\\)",
      "The set of everything that is in \\(A\\) or \\(B\\)",
      "The set of everything in \\(A\\) but not \\(B\\)",
      "The larger of the two sets"
    ],
    answer: 0,
    explanation: "Intersection keeps only the overlap: \\(x\\in A\\cap B\\) if \\(x\\) is in \\(A\\) and in \\(B\\). For example \\(\\{1,2\\}\\cap\\{2,3\\}=\\{2\\}\\). It is the \"and\" of sets.",
    source: "Sipser §0.2 (Sets)"
  },
  {
    id: "ch0-basic-complement-what", chapter: 0, rank: 0, topic: "Sets", type: "mc",
    prompt: "What is the **complement** \\(\\overline{A}\\) of a set \\(A\\) (relative to a universe of all possible elements)?",
    choices: [
      "Everything in the universe that is NOT in \\(A\\)",
      "Everything that is in \\(A\\)",
      "The empty set",
      "The subsets of \\(A\\)"
    ],
    answer: 0,
    explanation: "The complement flips membership: \\(\\overline{A}\\) is all the things (from the agreed universe) that are not in \\(A\\). If the universe is \\(\\{1,2,3\\}\\) and \\(A=\\{1\\}\\), then \\(\\overline{A}=\\{2,3\\}\\).",
    source: "Sipser §0.2 (Sets)"
  },

  // ============================================================
  // ---- Sequences & tuples: sequence vs set, tuple, product ---
  // ============================================================
  {
    id: "ch0-basic-sequence-vs-set", chapter: 0, rank: 0, topic: "Sequences & tuples", type: "mc",
    prompt: "How does a **sequence** differ from a **set**?",
    choices: [
      "In a sequence order matters and repeats are allowed; in a set neither does",
      "A sequence must be infinite, a set must be finite",
      "A sequence can only hold numbers; a set can hold anything",
      "There is no difference"
    ],
    answer: 0,
    explanation: "A sequence is an ordered list, so \\((1,2)\\neq(2,1)\\) and \\((1,1,2)\\) is fine. A set ignores order and repeats, so \\(\\{1,2\\}=\\{2,1\\}\\) and \\(\\{1,1,2\\}=\\{1,2\\}\\).",
    source: "Sipser §0.2 (Sequences and tuples)"
  },
  {
    id: "ch0-basic-tuple-what", chapter: 0, rank: 0, topic: "Sequences & tuples", type: "mc",
    prompt: "What is a **tuple** (for example, a \\(k\\)-tuple)?",
    choices: [
      "A finite ordered list of elements; a \\(k\\)-tuple has exactly \\(k\\) entries, like \\((a,b,c)\\)",
      "Any set with exactly \\(k\\) elements",
      "A collection of \\(k\\) sets",
      "A single element repeated \\(k\\) times"
    ],
    answer: 0,
    explanation: "A tuple is a finite sequence. A \\(2\\)-tuple \\((a,b)\\) is an ordered pair, a \\(3\\)-tuple \\((a,b,c)\\) an ordered triple, and so on. Order matters and positions are fixed.",
    source: "Sipser §0.2 (Sequences and tuples)"
  },
  {
    id: "ch0-basic-cartesian-product-what", chapter: 0, rank: 0, topic: "Sequences & tuples", type: "mc",
    prompt: "What is the **Cartesian product** \\(A\\times B\\) of two sets?",
    choices: [
      "The set of all ordered pairs \\((a,b)\\) with \\(a\\in A\\) and \\(b\\in B\\)",
      "The set of elements in either \\(A\\) or \\(B\\)",
      "The set of elements in both \\(A\\) and \\(B\\)",
      "The number \\(|A|\\times|B|\\)"
    ],
    answer: 0,
    explanation: "\\(A\\times B\\) pairs every element of \\(A\\) with every element of \\(B\\): \\(A\\times B=\\{(a,b)\\mid a\\in A,\\ b\\in B\\}\\). For \\(A=\\{1,2\\}\\), \\(B=\\{x\\}\\), it is \\(\\{(1,x),(2,x)\\}\\). Its size is \\(|A|\\cdot|B|\\).",
    source: "Sipser §0.2 (Sequences and tuples)"
  },

  // ============================================================
  // ---- Functions & relations ----
  // ============================================================
  {
    id: "ch0-basic-function-what", chapter: 0, rank: 0, topic: "Functions & relations", type: "mc",
    prompt: "In plain terms, what is a **function** \\(f:A\\to B\\)?",
    choices: [
      "A rule that assigns to each input in \\(A\\) exactly one output in \\(B\\)",
      "A rule that assigns each input several outputs",
      "Any set of pairs, with no rules",
      "A list of the elements of \\(B\\)"
    ],
    answer: 0,
    explanation: "A function is a deterministic input-to-output rule: feed it any \\(a\\in A\\) and it returns exactly one \\(f(a)\\in B\\). \"Exactly one\" is key — no input is left out and none gets two answers.",
    source: "Sipser §0.2 (Functions and relations)"
  },
  {
    id: "ch0-basic-domain-range-what", chapter: 0, rank: 0, topic: "Functions & relations", type: "mc",
    prompt: "For a function \\(f:A\\to B\\), what are the **domain** and the **range**?",
    choices: [
      "The domain is the set of inputs \\(A\\); the range is the set of outputs actually produced",
      "The domain is the outputs; the range is the inputs",
      "The domain and range are both \\(B\\)",
      "The domain is the largest input; the range is the largest output"
    ],
    answer: 0,
    explanation: "The domain is where inputs come from (\\(A\\)); the range (or image) is the set of values \\(f\\) actually hits. The range sits inside the codomain \\(B\\) but need not fill it.",
    source: "Sipser §0.2 (Functions and relations)"
  },
  {
    id: "ch0-basic-injective-what", chapter: 0, rank: 0, topic: "Functions & relations", type: "mc",
    prompt: "What does it mean for a function to be **injective** (one-to-one)?",
    choices: [
      "Different inputs always give different outputs (no two inputs share an output)",
      "Every output is hit by some input",
      "Every input has exactly one output",
      "The function is defined on its whole domain"
    ],
    answer: 0,
    explanation: "Injective means no collisions: if \\(a_1\\neq a_2\\) then \\(f(a_1)\\neq f(a_2)\\). Equivalently, \\(f(a_1)=f(a_2)\\) forces \\(a_1=a_2\\). (Every function already gives one output per input — that alone is not injectivity.)",
    source: "Sipser §0.2 (Functions and relations)"
  },
  {
    id: "ch0-basic-surjective-what", chapter: 0, rank: 0, topic: "Functions & relations", type: "mc",
    prompt: "What does it mean for a function \\(f:A\\to B\\) to be **surjective** (onto)?",
    choices: [
      "Every element of \\(B\\) is the output \\(f(a)\\) for at least one input \\(a\\)",
      "Different inputs give different outputs",
      "Each input maps to exactly one output",
      "\\(A\\) and \\(B\\) have the same number of elements"
    ],
    answer: 0,
    explanation: "Surjective (onto) means nothing in \\(B\\) is missed: the range equals all of \\(B\\). Every target value is reached by some input. This is separate from one-to-one, which is about inputs not colliding.",
    source: "Sipser §0.2 (Functions and relations)"
  },
  {
    id: "ch0-basic-bijective-what", chapter: 0, rank: 0, topic: "Functions & relations", type: "mc",
    prompt: "What is a **bijective** function (a bijection / one-to-one correspondence)?",
    choices: [
      "A function that is both injective (one-to-one) and surjective (onto)",
      "A function that is injective but not surjective",
      "Any function with a finite domain",
      "A function that maps everything to a single output"
    ],
    answer: 0,
    explanation: "A bijection is both one-to-one and onto, so it pairs the elements of \\(A\\) and \\(B\\) up perfectly with none left over on either side. Bijections are exactly the functions that have an inverse.",
    source: "Sipser §0.2 (Functions and relations)"
  },
  {
    id: "ch0-basic-relation-what", chapter: 0, rank: 0, topic: "Functions & relations", type: "mc",
    prompt: "In plain terms, what is a (binary) **relation** on a set?",
    choices: [
      "A set of ordered pairs — it records which elements are \"related,\" allowing zero, one, or many partners each",
      "A rule giving each element exactly one output",
      "A single ordered pair",
      "A set with no order"
    ],
    answer: 0,
    explanation: "A binary relation is any set of ordered pairs (a subset of \\(A\\times A\\)); \\((a,b)\\) being in it means \"\\(a\\) is related to \\(b\\).\" Unlike a function, an element may relate to many others or to none. \"Less than\" on numbers is a relation.",
    source: "Sipser §0.2 (Functions and relations)"
  },
  {
    id: "ch0-basic-equivalence-relation-what", chapter: 0, rank: 0, topic: "Functions & relations", type: "mc",
    prompt: "What is an **equivalence relation**?",
    choices: [
      "A relation that is reflexive, symmetric, and transitive",
      "A relation that is only reflexive",
      "A relation where every element relates to every other",
      "A function that is one-to-one and onto"
    ],
    answer: 0,
    explanation: "An equivalence relation captures a kind of \"sameness\": each element relates to itself (reflexive), the relation goes both ways (symmetric), and it chains (transitive). Such a relation splits the set into equivalence classes. Equality is the basic example.",
    source: "Sipser §0.2 (Functions and relations)"
  },

  // ============================================================
  // ---- Graphs: graph, node/edge, degree, path, cycle, tree ---
  // ============================================================
  {
    id: "ch0-basic-graph-what", chapter: 0, rank: 0, topic: "Graphs", type: "mc",
    prompt: "In plain terms, what is a **graph**?",
    choices: [
      "A collection of points (nodes) with lines (edges) joining some pairs of them",
      "A plot of a function on axes",
      "A list of numbers in order",
      "A set with no structure"
    ],
    answer: 0,
    explanation: "In this course a graph means dots and connections: nodes (vertices) drawn as points, and edges drawn as lines connecting pairs of nodes. It models networks like roads, friendships, or states of a machine.",
    source: "Sipser §0.2 (Graphs)"
  },
  {
    id: "ch0-basic-node-edge-what", chapter: 0, rank: 0, topic: "Graphs", type: "mc",
    prompt: "In a graph, what are a **node** and an **edge**?",
    choices: [
      "A node is a point of the graph; an edge is a connection joining two nodes",
      "A node is a connection; an edge is a point",
      "A node is the whole graph; an edge is a subgraph",
      "A node and an edge are the same thing"
    ],
    answer: 0,
    explanation: "Nodes (also called vertices) are the dots; edges are the lines linking pairs of dots. An edge \\(\\{u,v\\}\\) says \"node \\(u\\) is connected to node \\(v\\).\"",
    source: "Sipser §0.2 (Graphs)"
  },
  {
    id: "ch0-basic-degree-what", chapter: 0, rank: 0, topic: "Graphs", type: "mc",
    prompt: "In an undirected graph, what is the **degree** of a node?",
    choices: [
      "The number of edges attached to that node",
      "The number of nodes in the whole graph",
      "The distance to the farthest node",
      "The number of nodes it is NOT connected to"
    ],
    answer: 0,
    explanation: "Degree counts the edges touching a node — how many connections it has. A node joined to three others has degree 3. (A self-loop, where allowed, counts twice.)",
    source: "Sipser §0.2 (Graphs)"
  },
  {
    id: "ch0-basic-path-what", chapter: 0, rank: 0, topic: "Graphs", type: "mc",
    prompt: "In a graph, what is a **path**?",
    choices: [
      "A sequence of nodes connected in a row by edges, each step following an edge",
      "Any set of nodes, connected or not",
      "A single edge only",
      "The complete list of all edges"
    ],
    answer: 0,
    explanation: "A path is a route through the graph: nodes \\(v_1,v_2,\\dots,v_k\\) where each consecutive pair is joined by an edge. It is how you \"travel\" from one node to another along connections.",
    source: "Sipser §0.2 (Graphs)"
  },
  {
    id: "ch0-basic-cycle-what", chapter: 0, rank: 0, topic: "Graphs", type: "mc",
    prompt: "In a graph, what is a **cycle**?",
    choices: [
      "A path that starts and ends at the same node (a closed loop)",
      "A path that visits every node exactly once",
      "A graph with no edges",
      "A single node with no connections"
    ],
    answer: 0,
    explanation: "A cycle is a path that loops back to where it began, forming a closed ring of edges (with no repeats in between). A triangle of three nodes joined in a loop is the smallest simple cycle.",
    source: "Sipser §0.2 (Graphs)"
  },
  {
    id: "ch0-basic-tree-what", chapter: 0, rank: 0, topic: "Graphs", type: "mc",
    prompt: "In plain terms, what is a **tree**?",
    choices: [
      "A connected graph with no cycles",
      "Any graph with a cycle",
      "A graph where every node connects to every other",
      "A list of nodes with no edges"
    ],
    answer: 0,
    explanation: "A tree is a graph that is all one piece (connected) and has no loops (no cycles). Family trees and folder hierarchies are examples. A tree on \\(n\\) nodes has exactly \\(n-1\\) edges.",
    source: "Sipser §0.2 (Graphs)"
  },
  {
    id: "ch0-basic-directed-vs-undirected", chapter: 0, rank: 0, topic: "Graphs", type: "mc",
    prompt: "What is the difference between a **directed** and an **undirected** graph?",
    choices: [
      "In a directed graph edges are one-way arrows (from one node to another); in an undirected graph edges are two-way (just a connection)",
      "A directed graph has more nodes than an undirected one",
      "A directed graph has no cycles, an undirected one always does",
      "There is no difference; the names are interchangeable"
    ],
    answer: 0,
    explanation: "Undirected edges are symmetric links (like a friendship). Directed edges are arrows with a direction (like a one-way street or \"follows\" on social media): an arrow from \\(u\\) to \\(v\\) does not imply one from \\(v\\) to \\(u\\).",
    source: "Sipser §0.2 (Graphs)"
  },

  // ============================================================
  // ---- Strings & languages ----
  // ============================================================
  {
    id: "ch0-basic-alphabet-what", chapter: 0, rank: 0, topic: "Strings & languages", type: "tf",
    prompt: "True or false: an **alphabet** is a finite, nonempty set of symbols (for example \\(\\Sigma=\\{0,1\\}\\)).",
    answer: true,
    explanation: "True. An alphabet is just the finite set of symbols we are allowed to use, such as \\(\\{0,1\\}\\) or \\(\\{a,b,c\\}\\). Everything else — strings and languages — is built from these symbols.",
    source: "Sipser §0.2 (Strings and languages)"
  },
  {
    id: "ch0-basic-string-what", chapter: 0, rank: 0, topic: "Strings & languages", type: "mc",
    prompt: "In plain terms, what is a **string** over an alphabet \\(\\Sigma\\)?",
    choices: [
      "A finite sequence of symbols from \\(\\Sigma\\) written in order, like \\(0110\\)",
      "Any set of symbols, in no particular order",
      "A single symbol from \\(\\Sigma\\)",
      "An infinitely long row of symbols"
    ],
    answer: 0,
    explanation: "A string is symbols placed one after another, order mattering and length finite. Over \\(\\Sigma=\\{0,1\\}\\), examples are \\(0\\), \\(11\\), and \\(0110\\). The length \\(|w|\\) counts its symbols.",
    source: "Sipser §0.2 (Strings and languages)"
  },
  {
    id: "ch0-basic-empty-string-what", chapter: 0, rank: 0, topic: "Strings & languages", type: "mc",
    prompt: "What is the **empty string** \\(\\varepsilon\\)?",
    choices: [
      "The string with no symbols at all (length \\(0\\))",
      "The string made of one blank space",
      "The symbol \\(0\\)",
      "A string that does not exist"
    ],
    answer: 0,
    explanation: "The empty string, written \\(\\varepsilon\\), is the string of length \\(0\\) — nothing written down. It is a real string, just an empty one, much like \\(0\\) is a real number. Note \\(|\\varepsilon|=0\\).",
    source: "Sipser §0.2 (Strings and languages)"
  },
  {
    id: "ch0-basic-empty-string-symbol-fib", chapter: 0, rank: 0, topic: "Strings & languages", type: "fib",
    prompt: "Fill in: the empty string (the string of length zero) is written with the Greek letter ____.",
    accept: ["epsilon", "varepsilon", "ε", "\\varepsilon"],
    explanation: "The empty string is denoted \\(\\varepsilon\\) (epsilon), and \\(|\\varepsilon|=0\\).",
    source: "Sipser §0.2 (Strings and languages)"
  },
  {
    id: "ch0-basic-concatenation-what", chapter: 0, rank: 0, topic: "Strings & languages", type: "mc",
    prompt: "What is the **concatenation** of two strings \\(x\\) and \\(y\\) (written \\(xy\\))?",
    choices: [
      "The string formed by writing all of \\(x\\), then all of \\(y\\), right after it",
      "The set containing \\(x\\) and \\(y\\)",
      "The symbols common to \\(x\\) and \\(y\\)",
      "The longer of the two strings"
    ],
    answer: 0,
    explanation: "Concatenation glues strings end to end: if \\(x=01\\) and \\(y=00\\) then \\(xy=0100\\). Its length is \\(|x|+|y|\\), and gluing on \\(\\varepsilon\\) changes nothing (\\(x\\varepsilon=x\\)).",
    source: "Sipser §0.2 (Strings and languages)"
  },
  {
    id: "ch0-basic-language-what", chapter: 0, rank: 0, topic: "Strings & languages", type: "mc",
    prompt: "In plain terms, what is a **language**?",
    choices: [
      "A set of strings (any collection of strings you choose)",
      "A single special string",
      "A set of symbols (an alphabet)",
      "A machine that reads strings"
    ],
    answer: 0,
    explanation: "A language is simply a set of strings — a subset of \\(\\Sigma^*\\). For example, \"all strings of \\(0\\)s and \\(1\\)s that end in \\(1\\)\" is a language. It may be finite or infinite, and \\(\\emptyset\\) is a language too.",
    source: "Sipser §0.2 (Strings and languages)"
  },

  // ============================================================
  // ---- Boolean logic (one plain-language anchor) ----
  // ============================================================
  {
    id: "ch0-basic-boolean-and-or-not", chapter: 0, rank: 0, topic: "Boolean logic", type: "mc",
    prompt: "In **Boolean logic**, values are just true/false (\\(1\\)/\\(0\\)). What do the operations AND (\\(\\wedge\\)), OR (\\(\\vee\\)), and NOT (\\(\\neg\\)) mean?",
    choices: [
      "\\(\\wedge\\) is true only when both parts are true; \\(\\vee\\) is true when at least one part is true; \\(\\neg\\) flips true and false",
      "\\(\\wedge\\) is true when either part is true; \\(\\vee\\) needs both true; \\(\\neg\\) does nothing",
      "All three mean the same thing",
      "\\(\\wedge\\) and \\(\\vee\\) add numbers; \\(\\neg\\) subtracts"
    ],
    answer: 0,
    explanation: "AND (\\(\\wedge\\)) needs both operands true; OR (\\(\\vee\\)) needs at least one true; NOT (\\(\\neg\\)) reverses a value. These are the basic building blocks of Boolean formulas used throughout the course.",
    source: "Sipser §0.2 (Boolean logic)"
  },

  // ============================================================
  // ---- Proof techniques (one plain-language anchor) ----
  // ============================================================
  {
    id: "ch0-basic-proof-techniques-what", chapter: 0, rank: 0, topic: "Proof techniques", type: "mc",
    prompt: "A **proof** in this course is best described as:",
    choices: [
      "A convincing, logically airtight argument that a mathematical statement is true",
      "A single supporting example",
      "A guess backed by intuition",
      "A computer program that runs without errors"
    ],
    answer: 0,
    explanation: "A proof is a watertight chain of reasoning establishing a statement beyond doubt — not just evidence or an example. Common styles you will meet are proof by construction, by contradiction, and by induction.",
    source: "Sipser §0.4 (Proof techniques)"
  }
]);
