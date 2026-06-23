/* Chapter 7 — Time Complexity (P, NP, NP-completeness): extra distractors
   (each unambiguously WRONG for its question). Keyed by question id. The app
   samples a varying subset of wrong options each render so you can't answer by
   position or remembered shape. Only mc/multi questions are pooled. */
TOC.addPools({
  // ---- Measuring complexity: big-O / small-o ----
  "ch7-bigo-highest-term": [
    "\\(O(n)\\)",
    "\\(O(n^{3/2})\\)",
    "\\(O(\\log n)\\)",
    "\\(O(n!)\\)"
  ],
  "ch7-bigo-definition": [
    "\\(f(n)\\ge c\\,g(n)\\) for all sufficiently large \\(n\\)",
    "\\(\\displaystyle\\lim_{n\\to\\infty} f(n)/g(n)=1\\)",
    "\\(g(n)\\le c\\,f(n)\\) for all sufficiently large \\(n\\)",
    "\\(f(n)=c\\,g(n)\\) for every \\(n\\)"
  ],
  "ch7-smallo-strict": [
    "\\(\\displaystyle\\lim_{n\\to\\infty}\\frac{f(n)}{g(n)}=\\infty\\)",
    "\\(\\displaystyle\\lim_{n\\to\\infty}\\frac{g(n)}{f(n)}=0\\)",
    "\\(f(n)=c\\,g(n)\\) for some constant \\(c>0\\)",
    "\\(f(n)\\ge c\\,g(n)\\) for all \\(n\\ge n_0\\)"
  ],
  "ch7-smallo-examples": [
    "\\(n^3=o(n^2)\\)",
    "\\(n=o(\\log n)\\)",
    "\\(2^n=o(n)\\)",
    "\\(n^2=o(n^2)\\)"
  ],

  // ---- TIME(t(n)) and model relationships ----
  "ch7-akbk-singletape": [
    "\\(O(n\\log n)\\)",
    "\\(O(n^3)\\)",
    "\\(O(k)\\)",
    "\\(O(1)\\)"
  ],
  "ch7-multitape-square": [
    "\\(O(\\sqrt{t(n)})\\)",
    "\\(O(\\log t(n))\\)",
    "\\(2^{O(t^2(n))}\\)",
    "\\(O(t(n)/2)\\)"
  ],
  "ch7-nondet-exp": [
    "\\(2^{2^{O(t(n))}}\\)",
    "\\(O(t^3(n))\\)",
    "\\(O(\\log t(n))\\)",
    "\\(O(\\sqrt{t(n)})\\)"
  ],

  // ---- The class P ----
  "ch7-p-def": [
    "\\(\\bigcup_k \\mathrm{TIME}(2^{n^k})\\) — languages decidable in exponential time",
    "languages for which a short certificate can be verified in polynomial time",
    "languages recognizable (but not necessarily decidable) in polynomial time",
    "languages decidable in linear time \\(O(n)\\)"
  ],
  "ch7-path-in-p": [
    "guessing a path nondeterministically and verifying it",
    "the Euclidean gcd algorithm",
    "enumerating every permutation of the nodes",
    "converting \\(G\\) to a context-free grammar"
  ],
  "ch7-relprime-euclid": [
    "factoring \\(x\\) and \\(y\\) into primes and comparing the factor lists",
    "breadth-first search from \\(x\\) to \\(y\\)",
    "testing every integer up to \\(\\min(x,y)\\) as a possible divisor",
    "dynamic programming over the binary digits of \\(x\\)"
  ],
  "ch7-p-examples-multi": [
    "\\(SAT\\)",
    "\\(CLIQUE\\)",
    "\\(SUBSET\\text{-}SUM\\)",
    "\\(3SAT\\)"
  ],

  // ---- The class NP: verifiers, examples ----
  "ch7-verifier-def": [
    "\\(A=\\{w\\mid V\\text{ accepts }\\langle w,c\\rangle\\text{ for at least half of all strings }c\\}\\)",
    "\\(A=\\{w\\mid V\\text{ runs in exponential time on }w\\}\\)",
    "\\(A=\\{w\\mid V\\text{ loops forever on }w\\}\\)",
    "\\(A=\\{w\\mid V\\text{ accepts }w\\text{ with no certificate}\\}\\)"
  ],
  "ch7-subsetsum-def": [
    "\\(\\langle\\{8,12,30\\},\\,5\\rangle\\)",
    "\\(\\langle\\{3,9,14\\},\\,1\\rangle\\)",
    "\\(\\langle\\{6,10,18\\},\\,7\\rangle\\)",
    "\\(\\langle\\{4,11,16,21,27\\},\\,2\\rangle\\)"
  ],
  "ch7-np-examples-multi": [
    "\\(\\overline{CLIQUE}\\) (the complement of \\(CLIQUE\\))",
    "the set of all undecidable languages",
    "\\(A_{TM}\\)",
    "\\(\\overline{SUBSET\\text{-}SUM}\\)"
  ],

  // ---- P versus NP ----
  "ch7-pnp-containment": [
    "\\(\\mathrm{P}=\\mathrm{EXPTIME}\\) and both contain \\(\\mathrm{NP}\\)",
    "\\(\\mathrm{NP}\\subseteq\\mathrm{EXPTIME}\\subseteq\\mathrm{P}\\)",
    "\\(\\mathrm{EXPTIME}\\subseteq\\mathrm{P}\\subseteq \\mathrm{NP}\\)",
    "\\(\\mathrm{P}\\subseteq\\mathrm{EXPTIME}\\subseteq \\mathrm{NP}\\)"
  ],

  // ---- Polynomial-time reducibility ----
  "ch7-polyreduce-def": [
    "\\(w\\notin A \\iff f(w)\\in B\\)",
    "\\(w\\in A \\iff f(w)\\notin B\\)",
    "\\(f(w)\\in A \\iff w\\in B\\)",
    "\\(w\\in A\\) and \\(f(w)\\in B\\) for every \\(w\\)"
  ],
  "ch7-3sat-clique-reduce": [
    "spanning tree of \\(G\\)",
    "independent set with one node per clause-triple",
    "Eulerian circuit using every edge",
    "perfect matching of the literal-nodes"
  ],

  // ---- NP-completeness ----
  "ch7-npc-def": [
    "\\(B\\in\\mathrm{NP}\\), and \\(B\\) cannot be decided by any Turing machine",
    "\\(B\\in\\mathrm{NP}\\), and \\(B\\le_p A\\) for every \\(A\\in\\mathrm{NP}\\)",
    "\\(B\\in\\mathrm{P}\\), and every \\(A\\in\\mathrm{P}\\) satisfies \\(A\\le_p B\\)",
    "\\(B\\notin\\mathrm{NP}\\), and every \\(A\\in\\mathrm{NP}\\) satisfies \\(A\\le_p B\\)"
  ],
  "ch7-npc-spread": [
    "\\(B\\le_p A\\) for some \\(A\\in\\mathrm{P}\\)",
    "\\(C\\le_p A\\) for every \\(A\\in\\mathrm{NP}\\)",
    "\\(C\\in\\mathrm{P}\\) and \\(B\\in\\mathrm{P}\\)",
    "\\(\\overline{C}\\le_p B\\)"
  ],

  // ---- Cook–Levin theorem ----
  "ch7-sat-iff-pnp": [
    "every context-free language is in \\(\\mathrm{P}\\)",
    "\\(SAT\\) is undecidable",
    "\\(\\mathrm{P}=\\mathrm{EXPTIME}\\)",
    "\\(\\mathrm{NP}\\subseteq\\mathrm{P}\\) is false"
  ],

  // ---- Additional NP-complete problems ----
  "ch7-vertexcover-def": [
    "a set of edges that touches every node",
    "a set of nodes with no edge between any two of them",
    "a cycle that passes through every node exactly once",
    "an assignment of colors so that adjacent nodes differ"
  ],
  "ch7-npc-problems-multi": [
    "\\(RELPRIME\\)",
    "every context-free language",
    "\\(A_{TM}\\)",
    "\\(\\{0^k1^k\\mid k\\ge 0\\}\\)"
  ]
});
