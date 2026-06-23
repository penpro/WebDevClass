/* Chapter 8 — Space Complexity: extra distractors (each unambiguously WRONG
   for its question). Keyed by question id. The app samples a varying subset of
   wrong options each render so you can't answer by position or remembered shape.
   Only mc/multi questions are pooled. */
TOC.addPools({
  // ---- mc ----
  "ch8-def-space-measure": [
    "the number of distinct configurations \\(M\\) enters on inputs of length \\(n\\)",
    "the size of the largest input \\(M\\) accepts using \\(n\\) tape cells",
    "the number of tape cells scanned, divided by the running time"
  ],
  "ch8-allnfa-complement": [
    "\\(ALL_{NFA}\\) directly, by converting \\(A\\) to a DFA and checking it accepts \\(\\Sigma^*\\)",
    "whether \\(L(A)\\) is finite",
    "whether two given NFAs are equivalent"
  ],
  "ch8-savitch-statement": [
    "\\(\\mathrm{SPACE}(f(n))\\subseteq\\mathrm{NSPACE}(f^2(n))\\)",
    "\\(\\mathrm{NSPACE}(f(n))\\subseteq\\mathrm{TIME}(f^2(n))\\)",
    "\\(\\mathrm{NSPACE}(f(n))\\subseteq\\mathrm{SPACE}(f(n)\\log f(n))\\)"
  ],
  "ch8-pspace-def": [
    "\\(\\bigcup_k \\mathrm{NSPACE}(2^{n^k})\\) — languages decidable in exponential space",
    "\\(\\mathrm{SPACE}(\\log n)\\)",
    "the class of languages decidable in polynomial time nondeterministically"
  ],
  "ch8-tqbf-reduction-savitch": [
    "the formula would have to be in conjunctive normal form, which a tableau cannot express",
    "quantified formulas cannot describe a single computation step",
    "the start and accept configurations are not known in advance"
  ],
  "ch8-generalized-geography": [
    "\\(\\mathrm{NL}\\)-complete, by a log-space reduction from \\(PATH\\)",
    "in \\(\\mathrm{P}\\), since the winner can be found by a greedy longest-path search",
    "undecidable, because optimal play may require unbounded lookahead"
  ],
  "ch8-sublinear-model": [
    "a single read-only tape holding the input, with no work tape at all",
    "an oracle tape that returns the answer in one step",
    "a read/write input tape plus a read-only work tape, counting only the input"
  ],
  "ch8-akbk-in-l": [
    "it overwrites each matched \\(0\\) and \\(1\\) on the input tape in place",
    "it stores the positions of all the \\(0\\)s as a list on the work tape",
    "context-free languages are automatically in \\(\\mathrm{L}\\) and \\(A\\) is context-free"
  ],
  "ch8-path-in-nl": [
    "a binary counter holding the out-degree of every node",
    "the set of all nodes not yet visited",
    "a stack of the nodes on the current path, to allow backtracking"
  ],
  "ch8-logspace-transducer": [
    "an output tape that also counts toward the \\(O(\\log n)\\) work bound",
    "a read-only output tape it compares against the input",
    "a work tape of size \\(O(n)\\) plus a separate log-space counter"
  ],
  "ch8-conl-via-pathbar": [
    "because \\(\\overline{PATH}\\in\\mathrm{NL}\\) immediately implies \\(\\mathrm{NL}=\\mathrm{P}\\)",
    "because Savitch's theorem already gives \\(\\mathrm{NL}=\\mathrm{coNL}\\) and this merely confirms it",
    "because \\(\\overline{PATH}\\) is \\(\\mathrm{NP}\\)-complete"
  ],
  "ch8-conl-counting": [
    "the number of nodes from which \\(t\\) is reachable",
    "the diameter of the graph \\(G\\)",
    "the number of strongly connected components of \\(G\\)"
  ],

  // ---- multi ----
  "ch8-pspace-contains-np-conp": [
    "\\(\\mathrm{PSPACE}\\subseteq\\mathrm{P}\\)",
    "\\(\\mathrm{PSPACE}\\subseteq\\mathrm{NP}\\)",
    "\\(\\mathrm{EXPTIME}\\subseteq\\mathrm{NP}\\)"
  ],
  "ch8-pspace-complete-def": [
    "\\(B\\) is decidable in polynomial time",
    "\\(B\\notin\\mathrm{PSPACE}\\)",
    "every \\(A\\in\\mathrm{NP}\\) is polynomial-time reducible to \\(B\\), but no \\(\\mathrm{PSPACE}\\) language need be"
  ],
  "ch8-logspace-reducibility-why": [
    "Every problem in \\(\\mathrm{NL}\\) is \\(\\mathrm{NL}\\)-complete under \\(\\le_L\\)",
    "If \\(A\\le_L B\\) and \\(B\\in\\mathrm{L}\\), then \\(B\\le_L A\\)",
    "\\(\\mathrm{NL}\\)-completeness is defined using polynomial-time reducibility \\(\\le_P\\)"
  ],
  "ch8-l-nl-def": [
    "\\(\\mathrm{NL}=\\mathrm{coNL}=\\mathrm{SPACE}(\\log n)\\)",
    "\\(\\mathrm{L}=\\mathrm{NSPACE}(\\log n)\\)",
    "\\(\\mathrm{NL}=\\mathrm{SPACE}(n\\log n)\\)"
  ]
});
