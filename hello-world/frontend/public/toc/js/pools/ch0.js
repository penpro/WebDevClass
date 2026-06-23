/* Chapter 0 — extra distractors (each unambiguously WRONG for its question).
   Keyed by question id. The app samples a varying subset of wrong options each
   render so you can't answer by position or remembered shape. */
TOC.addPools({
  "ch0-sets-powerset-size": ["\\(n!\\)", "\\(2^{n-1}\\)", "\\(n+1\\)"],
  "ch0-sets-properties-multi": [
    "If \\(A\\subseteq B\\) then \\(|A|>|B|\\)",
    "Every set is a subset of \\(\\emptyset\\)",
    "\\(A\\cup B\\) contains only the elements common to \\(A\\) and \\(B\\)"
  ],
  "ch0-seq-cartesian": [
    "unordered pairs \\(\\{a,b\\}\\) with \\(a\\in A,\\ b\\in B\\)",
    "ordered pairs with both coordinates drawn from \\(A\\)",
    "all functions from \\(B\\) to \\(A\\)"
  ],
  "ch0-fn-onto": [
    "\\(f\\) has a well-defined inverse function",
    "the range of \\(f\\) is a proper subset of \\(B\\)",
    "\\(f\\) assigns each \\(a\\in A\\) exactly one value"
  ],
  "ch0-rel-equivalence": [
    "reflexive, antisymmetric, and transitive",
    "symmetric and transitive but not reflexive",
    "total, reflexive, and antisymmetric"
  ],
  "ch0-graph-degree": [
    "the number of nodes in the graph minus one",
    "the number of self-loops at that node",
    "the number of nodes reachable from it"
  ],
  "ch0-str-sigma-star": [
    "the set of all strings over \\(\\Sigma\\) of length exactly one",
    "the set of all infinite-length strings over \\(\\Sigma\\)",
    "the set of all subsets of \\(\\Sigma\\)"
  ],
  "ch0-str-count": ["\\(2^{n+1}\\)", "\\(\\binom{n}{2}\\)", "\\(2^{n}-1\\)"],
  "ch0-bool-demorgan-multi": [
    "\\(\\overline{P\\vee Q}=\\overline{P}\\vee\\overline{Q}\\)",
    "\\(\\overline{\\overline{P}}=\\overline{P}\\)",
    "\\((P\\Rightarrow Q)=(P\\vee\\overline{Q})\\)"
  ],
  "ch0-proof-contradiction": [
    "a specific worked example of the statement",
    "the contrapositive, which is then proved directly",
    "a smaller instance of the same statement"
  ],
  "ch0-proof-pigeonhole": [
    "every box contains exactly one item",
    "at least two boxes are left empty",
    "the items cannot all be placed"
  ]
});
