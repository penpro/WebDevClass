/* Chapter 0 — Mathematical preliminaries: topic-level "why this matters" + a
   concrete real-world example. Keyed "0::<topic>" to match js/questions/ch0.js. */
TOC.addWhy({
  "0::Sets": {
    why: "Sets are the universal language for collections, and the whole theory is built on them: an alphabet, a language, and the set of states of a machine are all sets, so set operations like \\(A\\cup B\\) and \\(A\\cap B\\) become operations on languages and machines. Once you can talk precisely about membership and subsets, you can ask the central question of the field — is a given string IN a given language?",
    real: "Relational databases are set theory in production: a SQL table is a set of rows, and \\(\\texttt{UNION}\\), \\(\\texttt{INTERSECT}\\), and \\(\\texttt{EXCEPT}\\) are literally \\(A\\cup B\\), \\(A\\cap B\\), and \\(A\\setminus B\\) over those sets."
  },
  "0::Sequences & tuples": {
    why: "Order and repetition matter for sequences in a way they do not for sets, which is exactly why we define a machine as an ordered tuple like \\((Q,\\Sigma,\\delta,q_0,F)\\): each slot has a fixed meaning you cannot shuffle. The Cartesian product \\(A\\times B\\) of ordered pairs is also the backbone of transition functions \\(\\delta:Q\\times\\Sigma\\to Q\\).",
    real: "Every coordinate system uses tuples: a GPS fix is an ordered pair \\((\\text{lat},\\text{lon})\\) where swapping the entries lands you in a different hemisphere, and an RGB color \\((r,g,b)\\) is a 3-tuple where position fixes which channel is which."
  },
  "0::Functions & relations": {
    why: "A function pins down exactly one output per input, and that single idea is what makes a DFA deterministic — its transition function \\(\\delta\\) leaves no choice about the next state. Relations generalize this to many-to-many links and underpin equivalence relations, which is how we later collapse indistinguishable states or strings into classes.",
    real: "A hash table implements a function from keys to slots, and a key insight of database normalization is the functional dependency \\(X\\to Y\\) (\"\\(X\\) determines \\(Y\\)\"), which says one column's value forces another's exactly as a function does."
  },
  "0::Graphs": {
    why: "Graphs model anything built from objects and the connections between them, and they are the literal shape of every automaton: states are nodes and transitions are labeled, directed edges. Reasoning about paths, cycles, and reachability in that graph is the same as reasoning about which strings a machine accepts.",
    real: "GPS navigation runs shortest-path algorithms like Dijkstra's over a graph whose nodes are intersections and whose weighted edges are roads; social networks and the web's link structure (the basis of PageRank) are graphs too."
  },
  "0::Strings & languages": {
    why: "A string is a finite sequence of alphabet symbols and a language is just a SET of strings, so \"solving a problem\" is recast as \"deciding membership in a language.\" This reframing is the move that lets us measure a problem's difficulty by the kind of machine needed to recognize its language.",
    real: "Every text search and validation tool operates on strings over an alphabet: a form that checks whether you typed a well-formed email address is deciding membership in the language of valid addresses, and grep scans a file for strings in a pattern's language."
  },
  "0::Boolean logic": {
    why: "Boolean connectives \\(\\wedge,\\vee,\\neg\\) are how we state acceptance conditions precisely (\"accept iff in an accept state AND input consumed\") and how we combine machines — running two DFAs in parallel and ANDing their verdicts gives intersection. Quantifiers \\(\\forall\\) and \\(\\exists\\) capture the difference between DFA acceptance (the one run ends accepting) and NFA acceptance (\\(\\exists\\) an accepting branch).",
    real: "Digital hardware is Boolean logic made physical — every CPU is built from AND, OR, and NOT gates — and search engines expose it directly through queries like \\(\\texttt{cats AND NOT dogs}\\)."
  },
  "0::Proof techniques": {
    why: "Theory of computation is about what is provably possible or impossible, so a claim like \"no finite automaton recognizes \\(0^n1^n\\)\" only counts once it is proved. Induction lets you establish facts about all strings or all steps of a computation, while proof by contradiction is the engine behind nonregularity and undecidability arguments.",
    real: "Formal verification tools (model checkers like TLA+ or theorem provers like Coq) prove that a protocol or chip design is correct for ALL inputs, catching bugs that no finite amount of testing could rule out."
  }
});
