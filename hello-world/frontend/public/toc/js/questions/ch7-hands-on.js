/* ch7-hands-on.js — HANDS-ON Chapter 7 lab. Two threads:
   (A) an NP-completeness GADGET LAB that draws the actual 3SAT->CLIQUE graph
       (Sipser Thm 7.32) for a 2-clause formula, plus a certificate-checking pack
       (HAMPATH / SUBSET-SUM / VERTEX-COVER verifiers), and
   (B) a CYK table-fill thread: a tiny CNF grammar + short strings shown as a
       triangular `grid` table, filling cells bottom-up and reading membership
       off the top cell.
   Diagrams use the automaton spec (nodes+edges); CYK tables use the grid spec
   (null cells = blank, for the triangle). KaTeX in text uses \\( ... \\); CNF
   grammar rules live in `code` spans. All gadget edges and CYK cells were
   worked out by hand and cross-checked. */
TOC.addQuestions([

  /* =======================================================================
     (A) NP-COMPLETENESS GADGET LAB — the 3SAT -> CLIQUE construction
     Formula:  phi = (x1 OR x2 OR ~x3) AND (~x1 OR x2 OR x3)      [k = 2 clauses]
     Clause 1 triple (top):    a = x1,  b = x2,  c = ~x3
     Clause 2 triple (bottom): d = ~x1, e = x2,  f = x3
     Edges (all cross-clause pairs EXCEPT contradictory ones):
        a-e, a-f, b-d, b-e, b-f, c-d, c-e     (7 edges)
     No a-d (x1 / ~x1 contradictory) and no c-f (~x3 / x3 contradictory);
     no within-triple edges.
     ======================================================================= */

  {
    id: "ch7-clique-gadget-k", chapter: 7, topic: "NP-completeness", type: "mc", rank: 40, difficulty: 2,
    prompt: "**Gadget lab.** Below is the graph \\(G\\) that Sipser's reduction (Thm 7.32) builds from the 3cnf-formula\n\n\\[\\phi=(x_1\\vee x_2\\vee\\neg x_3)\\wedge(\\neg x_1\\vee x_2\\vee x_3).\\]\n\nEach clause becomes a **triple** of nodes (its three literals); an edge joins two nodes iff they are in **different** clauses **and** are not contradictory. The reduction outputs \\(\\langle G,k\\rangle\\). What is \\(k\\) — the clique size we look for?",
    diagram: { width: 520, height: 260, states: [
      { id: "a", x: 90,  y: 55,  label: "x1" },
      { id: "b", x: 260, y: 55,  label: "x2" },
      { id: "c", x: 430, y: 55,  label: "!x3" },
      { id: "d", x: 90,  y: 205, label: "!x1" },
      { id: "e", x: 260, y: 205, label: "x2" },
      { id: "f", x: 430, y: 205, label: "x3" }
    ], edges: [
      { from: "a", to: "e" }, { from: "a", to: "f" },
      { from: "b", to: "d" }, { from: "b", to: "e" }, { from: "b", to: "f" },
      { from: "c", to: "d" }, { from: "c", to: "e" }
    ] },
    choices: [
      "\\(k=2\\) — one node per clause, and there are \\(2\\) clauses",
      "\\(k=3\\) — one node per literal in a clause",
      "\\(k=6\\) — the total number of nodes",
      "\\(k=7\\) — the number of edges"
    ],
    answer: 0,
    explanation: "In the reduction \\(k\\) equals the **number of clauses**. Here \\(\\phi\\) has \\(2\\) clauses, so \\(k=2\\): a \\(k\\)-clique must pick exactly one node from each triple, i.e. one satisfied literal per clause.",
    source: "Sipser Thm 7.32 (3SAT \\(\\le_P\\) CLIQUE)"
  },

  {
    id: "ch7-clique-gadget-no-edges", chapter: 7, topic: "NP-completeness", type: "multi", rank: 42, difficulty: 3,
    prompt: "**Same gadget** for \\(\\phi=(x_1\\vee x_2\\vee\\neg x_3)\\wedge(\\neg x_1\\vee x_2\\vee x_3)\\) (top triple \\(x_1,x_2,\\neg x_3\\); bottom triple \\(\\neg x_1,x_2,x_3\\)). By the construction, an edge is **absent** for exactly two reasons. Select **every** pair below that is correctly **not** connected.",
    diagram: { width: 520, height: 260, states: [
      { id: "a", x: 90,  y: 55,  label: "x1" },
      { id: "b", x: 260, y: 55,  label: "x2" },
      { id: "c", x: 430, y: 55,  label: "!x3" },
      { id: "d", x: 90,  y: 205, label: "!x1" },
      { id: "e", x: 260, y: 205, label: "x2" },
      { id: "f", x: 430, y: 205, label: "x3" }
    ], edges: [
      { from: "a", to: "e" }, { from: "a", to: "f" },
      { from: "b", to: "d" }, { from: "b", to: "e" }, { from: "b", to: "f" },
      { from: "c", to: "d" }, { from: "c", to: "e" }
    ] },
    choices: [
      "\\(x_1\\) and \\(x_2\\) (both in the top clause) — same triple",
      "\\(x_1\\) (top) and \\(\\neg x_1\\) (bottom) — contradictory labels",
      "\\(\\neg x_3\\) (top) and \\(x_3\\) (bottom) — contradictory labels",
      "\\(x_1\\) (top) and \\(x_2\\) (bottom) — different clauses, compatible",
      "\\(\\neg x_3\\) (top) and \\(x_2\\) (bottom) — different clauses, compatible"
    ],
    answers: [0, 1, 2],
    explanation: "Edges are omitted only for **same-triple** pairs (they can never both be picked, since a clique takes one node per clause) and for **contradictory** pairs \\(x_i,\\neg x_i\\) (an assignment can't make both true). So \\(x_1\\!-\\!x_2\\) (same triple), \\(x_1\\!-\\!\\neg x_1\\) and \\(\\neg x_3\\!-\\!x_3\\) (contradictory) have no edge. The last two pairs are cross-clause and consistent, so they **are** connected.",
    source: "Sipser Thm 7.32"
  },

  {
    id: "ch7-clique-gadget-select", chapter: 7, topic: "NP-completeness", type: "mc", rank: 44, difficulty: 3,
    prompt: "**Reading a satisfying assignment off the gadget.** Take \\(x_1=\\text{T},\\,x_2=\\text{T},\\,x_3=\\text{T}\\) for \\(\\phi=(x_1\\vee x_2\\vee\\neg x_3)\\wedge(\\neg x_1\\vee x_2\\vee x_3)\\). We build the \\(2\\)-clique by choosing one **true** literal in each clause that are joined by an edge. Which choice is a valid \\(2\\)-clique?",
    diagram: { width: 520, height: 260, states: [
      { id: "a", x: 90,  y: 55,  label: "x1" },
      { id: "b", x: 260, y: 55,  label: "x2" },
      { id: "c", x: 430, y: 55,  label: "!x3" },
      { id: "d", x: 90,  y: 205, label: "!x1" },
      { id: "e", x: 260, y: 205, label: "x2" },
      { id: "f", x: 430, y: 205, label: "x3" }
    ], edges: [
      { from: "a", to: "e" }, { from: "a", to: "f" },
      { from: "b", to: "d" }, { from: "b", to: "e" }, { from: "b", to: "f" },
      { from: "c", to: "d" }, { from: "c", to: "e" }
    ] },
    choices: [
      "\\(\\{\\,x_1\\text{ (top)},\\ x_3\\text{ (bottom)}\\,\\}\\) — both true, and joined by an edge",
      "\\(\\{\\,\\neg x_3\\text{ (top)},\\ x_3\\text{ (bottom)}\\,\\}\\) — contradictory, and \\(\\neg x_3\\) is false here",
      "\\(\\{\\,x_1\\text{ (top)},\\ \\neg x_1\\text{ (bottom)}\\,\\}\\) — no edge between them",
      "\\(\\{\\,x_1\\text{ (top)},\\ x_2\\text{ (top)}\\,\\}\\) — both in the same clause"
    ],
    answer: 0,
    explanation: "Under \\(x_1=x_2=x_3=\\text{T}\\), clause 1's true literals are \\(x_1,x_2\\) and clause 2's are \\(x_2,x_3\\). We need one true node per clause that are adjacent: \\(x_1\\text{(top)}\\) and \\(x_3\\text{(bottom)}\\) are both true and there is an edge \\(x_1\\!-\\!x_3\\), so \\(\\{x_1,x_3\\}\\) is a valid \\(2\\)-clique. \\(\\{x_1,x_2\\text{(top)}\\}\\) fails (same clause, no edge) and the contradictory pair has no edge.",
    source: "Sipser Thm 7.32"
  },

  {
    id: "ch7-clique-gadget-whynoedge", chapter: 7, topic: "NP-completeness", type: "mc", rank: 43, difficulty: 2,
    prompt: "In the 3SAT\\(\\to\\)CLIQUE gadget, **why** is there deliberately no edge between two nodes with **contradictory** labels (like \\(x_1\\) and \\(\\neg x_1\\))?",
    choices: [
      "So a clique can never select both — no single assignment can make \\(x_1\\) and \\(\\neg x_1\\) both true",
      "To keep the graph a tree so CLIQUE is easy to solve",
      "Because contradictory literals are always in the same clause",
      "So the graph has fewer than \\(k\\) edges total"
    ],
    answer: 0,
    explanation: "The missing edges make the graph's cliques line up with **consistent** truth assignments. If \\(x_1\\) and \\(\\neg x_1\\) were joined, a clique could pick both, which no assignment can satisfy. Omitting that edge forbids the clique from ever choosing a contradictory pair, so a \\(k\\)-clique always yields a legal assignment.",
    source: "Sipser Thm 7.32"
  },

  {
    id: "ch7-clique-gadget-edge-read", chapter: 7, topic: "NP-completeness", type: "tf", rank: 41, difficulty: 2,
    prompt: "**Read the gadget.** In the graph for \\(\\phi=(x_1\\vee x_2\\vee\\neg x_3)\\wedge(\\neg x_1\\vee x_2\\vee x_3)\\), there **is** an edge between \\(\\neg x_3\\) (top clause) and \\(\\neg x_1\\) (bottom clause).",
    diagram: { width: 520, height: 260, states: [
      { id: "a", x: 90,  y: 55,  label: "x1" },
      { id: "b", x: 260, y: 55,  label: "x2" },
      { id: "c", x: 430, y: 55,  label: "!x3" },
      { id: "d", x: 90,  y: 205, label: "!x1" },
      { id: "e", x: 260, y: 205, label: "x2" },
      { id: "f", x: 430, y: 205, label: "x3" }
    ], edges: [
      { from: "a", to: "e" }, { from: "a", to: "f" },
      { from: "b", to: "d" }, { from: "b", to: "e" }, { from: "b", to: "f" },
      { from: "c", to: "d" }, { from: "c", to: "e" }
    ] },
    answer: true,
    explanation: "\\(\\neg x_3\\) and \\(\\neg x_1\\) are in **different** clauses and are **not** contradictory (different variables, \\(x_3\\) vs \\(x_1\\)), so the construction connects them. Indeed the edge \\(\\neg x_3\\!-\\!\\neg x_1\\) is one of the graph's \\(7\\) edges.",
    source: "Sipser Thm 7.32"
  },

  /* ---------- Certificate-checking pack (verifiers & certificates) ---------- */

  {
    id: "ch7-cert-clique-what", chapter: 7, topic: "Verifiers & certificates (basics)", type: "mc", rank: 38, difficulty: 2,
    prompt: "CLIQUE \\(=\\{\\langle G,k\\rangle \\mid G\\text{ has a }k\\text{-clique}\\}\\) is in NP. For an input \\(\\langle G,k\\rangle\\), what is the **certificate**, and what does the polynomial-time **verifier** check?",
    choices: [
      "Certificate: a set of \\(k\\) vertices. Verifier: checks it has \\(k\\) vertices and that every pair among them is an edge of \\(G\\)",
      "Certificate: the whole graph \\(G\\). Verifier: re-reads \\(G\\)",
      "Certificate: a Hamiltonian path. Verifier: checks it visits every vertex",
      "Certificate: the number \\(k\\). Verifier: checks \\(k\\le|V|\\)"
    ],
    answer: 0,
    explanation: "A certificate for CLIQUE is the clique itself — a list of \\(k\\) vertices. The verifier confirms there are \\(k\\) of them and that all \\(\\binom{k}{2}\\) pairs are edges, which is polynomial in the size of \\(\\langle G,k\\rangle\\). That is exactly what \"membership can be verified quickly\" means.",
    source: "Sipser Thm 7.24 (CLIQUE \\(\\in\\) NP)"
  },

  {
    id: "ch7-cert-hampath-valid", chapter: 7, topic: "Verifiers & certificates (basics)", type: "mc", rank: 39, difficulty: 3,
    prompt: "HAMPATH \\(=\\{\\langle G,s,t\\rangle \\mid G\\text{ has a Hamiltonian path from }s\\text{ to }t\\}\\). Consider the directed graph with vertices \\(\\{1,2,3,4\\}\\) and edges \\(1\\!\\to\\!2,\\ 2\\!\\to\\!3,\\ 3\\!\\to\\!4,\\ 1\\!\\to\\!3,\\ 2\\!\\to\\!4\\), with \\(s=1,\\ t=4\\). A prover offers the **candidate certificate** (the proposed path) \\((1,2,3,4)\\). Is it a **valid** certificate?",
    choices: [
      "Valid — it starts at \\(1\\), ends at \\(4\\), uses only real edges, and visits each of the \\(4\\) vertices exactly once",
      "Invalid — a Hamiltonian path may not repeat any edge, and this repeats an edge",
      "Invalid — the edge \\(3\\to4\\) does not exist",
      "Invalid — it must also return from \\(t\\) back to \\(s\\)"
    ],
    answer: 0,
    explanation: "The verifier checks three things: the path begins at \\(s=1\\) and ends at \\(t=4\\); each consecutive step \\((1,2),(2,3),(3,4)\\) is a real edge; and every vertex appears **exactly once**. All hold, so \\((1,2,3,4)\\) is a valid Hamiltonian-path certificate. (A Hamiltonian path visits vertices, not edges, and does **not** return to \\(s\\).)",
    source: "Sipser §7.3 (HAMPATH \\(\\in\\) NP)"
  },

  {
    id: "ch7-cert-hampath-invalid", chapter: 7, topic: "Verifiers & certificates (basics)", type: "mc", rank: 39, difficulty: 3,
    prompt: "Same graph as before: vertices \\(\\{1,2,3,4\\}\\), edges \\(1\\!\\to\\!2,\\ 2\\!\\to\\!3,\\ 3\\!\\to\\!4,\\ 1\\!\\to\\!3,\\ 2\\!\\to\\!4\\), \\(s=1,\\ t=4\\). Now the prover offers the candidate path \\((1,3,4)\\). Why does the verifier **reject** this certificate?",
    choices: [
      "It skips vertex \\(2\\) — a Hamiltonian path must visit **every** vertex exactly once, and this misses one",
      "It uses the non-existent edge \\(1\\to3\\)",
      "It starts at the wrong vertex",
      "It is actually valid; the verifier accepts it"
    ],
    answer: 0,
    explanation: "\\((1,3,4)\\) uses only real edges (\\(1\\to3\\) and \\(3\\to4\\) exist) and starts/ends correctly, but it visits only \\(3\\) of the \\(4\\) vertices — vertex \\(2\\) is never visited. A **Hamiltonian** path must cover **all** vertices exactly once, so the verifier rejects. This is the subtlety a certificate check must catch.",
    source: "Sipser §7.3 (HAMPATH \\(\\in\\) NP)"
  },

  {
    id: "ch7-cert-subsetsum-valid", chapter: 7, topic: "The class NP", type: "mc", rank: 38, difficulty: 2,
    prompt: "SUBSET-SUM \\(=\\{\\langle S,t\\rangle \\mid \\text{some sub-collection of }S\\text{ sums to }t\\}\\). For \\(S=\\{4,11,16,21,27\\}\\) and target \\(t=25\\), a prover presents the **certificate** \\(\\{4,21\\}\\). What must the verifier confirm, and does it pass?",
    choices: [
      "That every element of the certificate is in \\(S\\) and that they sum to \\(t\\); here \\(4+21=25=t\\), so it **passes**",
      "That the certificate uses **all** of \\(S\\); it does not, so it fails",
      "That the elements are consecutive in \\(S\\); they are not, so it fails",
      "That \\(t\\) is prime; \\(25\\) is not, so it fails"
    ],
    answer: 0,
    explanation: "The certificate is the subset itself. The verifier checks (1) each listed number really is in \\(S\\) and (2) the numbers add up to \\(t\\). Since \\(4,21\\in S\\) and \\(4+21=25=t\\), the certificate is valid, so \\(\\langle S,25\\rangle\\in\\) SUBSET-SUM. You need only *check* the given subset — not search for it.",
    source: "Sipser Thm 7.25 (SUBSET-SUM \\(\\in\\) NP)"
  },

  {
    id: "ch7-cert-subsetsum-invalid", chapter: 7, topic: "The class NP", type: "mc", rank: 38, difficulty: 2,
    prompt: "Still SUBSET-SUM with \\(S=\\{4,11,16,21,27\\}\\), target \\(t=25\\). A prover now submits the candidate certificate \\(\\{16,11\\}\\). What does the verifier decide?",
    choices: [
      "Reject — \\(16+11=27\\neq 25\\), so this sub-collection does not hit the target",
      "Accept — any two elements of \\(S\\) form a valid certificate",
      "Reject — \\(16\\) and \\(11\\) are not both in \\(S\\)",
      "Accept — \\(27\\) is close enough to \\(25\\)"
    ],
    answer: 0,
    explanation: "Both \\(16\\) and \\(11\\) are in \\(S\\), so the membership check passes, but their sum is \\(27\\), not the target \\(25\\). The verifier must confirm the sum **equals** \\(t\\) exactly, so it rejects this certificate. (A *different* subset, \\(\\{4,21\\}\\), does work — the instance is still a yes-instance; this particular certificate just fails.)",
    source: "Sipser Thm 7.25"
  },

  {
    id: "ch7-cert-vertexcover", chapter: 7, topic: "Additional NP-complete problems", type: "mc", rank: 40, difficulty: 3,
    prompt: "VERTEX-COVER \\(=\\{\\langle G,k\\rangle \\mid G\\text{ has a vertex cover of size }k\\}\\), where a **cover** is a set of vertices touching every edge. Take the 4-cycle \\(G\\) with edges \\(\\{1,2\\},\\{2,3\\},\\{3,4\\},\\{4,1\\}\\) and \\(k=2\\). A prover offers the certificate \\(\\{2,4\\}\\). Is it a valid vertex cover of size \\(2\\)?",
    diagram: { width: 300, height: 240, states: [
      { id: "1", x: 80,  y: 60,  label: "1" },
      { id: "2", x: 220, y: 60,  label: "2" },
      { id: "3", x: 220, y: 190, label: "3" },
      { id: "4", x: 80,  y: 190, label: "4" }
    ], edges: [
      { from: "1", to: "2" }, { from: "2", to: "3" }, { from: "3", to: "4" }, { from: "4", to: "1" }
    ] },
    choices: [
      "Valid — every edge has at least one endpoint in \\(\\{2,4\\}\\), and \\(|\\{2,4\\}|=2\\)",
      "Invalid — a vertex cover must be an **independent** set",
      "Invalid — edge \\(\\{1,3\\}\\) is not covered",
      "Invalid — a cover of a 4-cycle needs at least \\(3\\) vertices"
    ],
    answer: 0,
    explanation: "Check each edge for an endpoint in \\(\\{2,4\\}\\): \\(\\{1,2\\}\\ni2\\), \\(\\{2,3\\}\\ni2\\), \\(\\{3,4\\}\\ni4\\), \\(\\{4,1\\}\\ni4\\). All four edges are covered and the set has size \\(2\\), so the certificate is valid. (\\(\\{1,3\\}\\) is not an edge of this graph, and covers are the opposite of independent sets.)",
    source: "Sipser §7.5 (VERTEX-COVER); Thm 7.44"
  },

  {
    id: "ch7-cert-general-fib", chapter: 7, topic: "Verifiers & certificates (basics)", type: "fib", rank: 36, difficulty: 1,
    prompt: "Fill in the term. A language \\(A\\) is in **NP** exactly when it has a polynomial-time **verifier**: a machine \\(V\\) such that \\(w\\in A\\) iff there exists a short string \\(c\\) with \\(V\\) accepting \\(\\langle w,c\\rangle\\). The string \\(c\\) — the piece of extra evidence the verifier checks — is called a ____ (or \"witness\").",
    accept: ["certificate", "certificates", "a certificate", "proof certificate"],
    explanation: "The extra string \\(c\\) is the **certificate** (also called a *witness* or *proof*). NP is precisely the class of languages with polynomial-time verifiers, i.e. whose yes-instances have a polynomially-long certificate that can be **checked** in polynomial time.",
    source: "Sipser Def 7.18 (verifier); §7.3"
  },

  {
    id: "ch7-cert-verifier-vs-solve", chapter: 7, topic: "The class NP", type: "tf", rank: 37, difficulty: 2,
    prompt: "A polynomial-time **verifier** for an NP problem is given both the input **and** a candidate certificate, and only has to *check* it. It is **not** required to *find* a certificate on its own.",
    answer: true,
    explanation: "Exactly. The verifier receives the certificate as extra input and merely validates it in polynomial time; the burden of *producing* a valid certificate is not on the verifier (that search is the hard part). This checking-vs-finding gap is the whole point of NP — and of \\(P\\overset{?}{=}NP\\).",
    source: "Sipser Def 7.18"
  },

  /* =======================================================================
     (B) CYK TABLE-FILL — membership for context-free languages
     Grammar G (Chomsky normal form):
         S -> AB | AC
         C -> SB
         A -> a
         B -> b
     L(G) = { a^n b^n : n >= 1 }.
     CYK table for "aabb" (bottom row = terminals, work upward):
        len 1:  A   A   B   B
        len 2:  -   S   -
        len 3:  -   C
        len 4:  S            -> S in top cell, so aabb in L(G).
     ======================================================================= */

  {
    id: "ch7-cyk-len1-row", chapter: 7, topic: "Decidable: context-free languages", type: "mc", rank: 34, difficulty: 2,
    prompt: "**CYK table-fill.** Use the CNF grammar\n\n`S -> AB | AC`   `C -> SB`   `A -> a`   `B -> b`\n\nWe test the string \\(aabb\\) with the CYK (dynamic-programming) algorithm. The **bottom row** records, for each single letter, which variables derive it. Which variables go in the four bottom cells, reading left to right for \\(a\\,a\\,b\\,b\\)?",
    grid: { title: "CYK — bottom row (length-1 substrings)", cells: [
      [ "?", "?", "?", "?" ]
    ], colHeaders: ["a", "a", "b", "b"], rowHeaders: ["len 1"], note: "which variable derives each single terminal?" },
    choices: [
      "\\(A,\\ A,\\ B,\\ B\\)  (since \\(A\\to a\\) and \\(B\\to b\\))",
      "\\(S,\\ S,\\ S,\\ S\\)  (the start variable everywhere)",
      "\\(A,\\ B,\\ A,\\ B\\)  (alternating)",
      "\\(a,\\ a,\\ b,\\ b\\)  (the terminals themselves)"
    ],
    answer: 0,
    explanation: "The only terminal rules are \\(A\\to a\\) and \\(B\\to b\\). So each \\(a\\) is derived by \\(A\\) and each \\(b\\) by \\(B\\): the bottom row for \\(a\\,a\\,b\\,b\\) is \\(A,\\ A,\\ B,\\ B\\). CYK fills this length-1 row first, then combines adjacent blocks upward.",
    source: "Sipser Thm 7.16 (CFL \\(\\in\\) P); CYK algorithm"
  },

  {
    id: "ch7-cyk-len2-cell", chapter: 7, topic: "Decidable: context-free languages", type: "mc", rank: 35, difficulty: 3,
    prompt: "Continuing CYK on \\(aabb\\) with `S -> AB | AC`, `C -> SB`, `A -> a`, `B -> b`. The bottom row is \\(A,A,B,B\\). Which variable(s) belong in the **length-2 cell for the middle substring \\(ab\\)** (positions 2–3, the \\(a\\) then the first \\(b\\))?",
    grid: { title: "CYK — length-2 row for aabb", cells: [
      [ "-", "?", "-" ],
      [ "A", "A", "B", "B" ]
    ], colHeaders: ["1", "2", "3", "4"], rowHeaders: ["len 2", "len 1"], hi: [[0,1]], note: "the highlighted cell covers the substring ab (positions 2-3)" },
    choices: [
      "\\(S\\)  — because \\(A\\) (deriving position 2's \\(a\\)) and \\(B\\) (position 3's \\(b\\)) combine via \\(S\\to AB\\)",
      "\\(C\\)  — via \\(C\\to SB\\)",
      "\\(A\\)  — it inherits from the cell below",
      "nothing — no variable derives \\(ab\\)"
    ],
    answer: 0,
    explanation: "The substring \\(ab\\) splits into \\(a\\) (derived by \\(A\\)) and \\(b\\) (derived by \\(B\\)). A variable derives \\(ab\\) iff some rule has a matching right-hand side: \\(S\\to AB\\) fits, so \\(S\\) goes in the cell. (\\(C\\to SB\\) needs an \\(S\\) on the left, which isn't available for a length-2 split here.)",
    source: "Sipser Thm 7.16; CYK algorithm"
  },

  {
    id: "ch7-cyk-len3-cell", chapter: 7, topic: "Decidable: context-free languages", type: "mc", rank: 35, difficulty: 3,
    prompt: "Still CYK on \\(aabb\\) with `S -> AB | AC`, `C -> SB`, `A -> a`, `B -> b`. Lower rows give: length-1 \\(=A,A,B,B\\); length-2 \\(=(-,\\,S,\\,-)\\). Which variable belongs in the **length-3 cell for the substring \\(abb\\)** (positions 2–4)?",
    grid: { title: "CYK — length-3 row for aabb", cells: [
      [ "-", "?" ],
      [ "-", "S", "-" ],
      [ "A", "A", "B", "B" ]
    ], colHeaders: ["1", "2", "3", "4"], rowHeaders: ["len 3", "len 2", "len 1"], hi: [[0,1]], note: "the highlighted cell covers the substring abb (positions 2-4)" },
    choices: [
      "\\(C\\)  — split \\(abb=ab\\,|\\,b\\): the \\(ab\\) part gives \\(S\\), the \\(b\\) gives \\(B\\), and \\(C\\to SB\\) applies",
      "\\(S\\)  — via \\(S\\to AB\\) directly on \\(abb\\)",
      "\\(A\\)  — since \\(abb\\) starts with \\(a\\)",
      "nothing — \\(abb\\) has no derivation"
    ],
    answer: 0,
    explanation: "Split \\(abb\\) as \\(ab\\,|\\,b\\): the left part \\(ab\\) is derived by \\(S\\) (from the length-2 row) and the right \\(b\\) by \\(B\\). The rule \\(C\\to SB\\) matches, so \\(C\\) fills the cell. (The other split \\(a\\,|\\,bb\\) fails, since \\(bb\\) has no variable.)",
    source: "Sipser Thm 7.16; CYK algorithm"
  },

  {
    id: "ch7-cyk-top-membership", chapter: 7, topic: "Decidable: context-free languages", type: "mc", rank: 36, difficulty: 2,
    prompt: "The completed CYK table for \\(aabb\\) under `S -> AB | AC`, `C -> SB`, `A -> a`, `B -> b` is shown. The **top cell** (the whole string, positions 1–4) is obtained from the split \\(a\\,|\\,abb\\): the \\(a\\) gives \\(A\\), the \\(abb\\) gives \\(C\\), and \\(S\\to AC\\) fires. What does the top cell let you conclude?",
    grid: { title: "CYK table for aabb (complete)", cells: [
      [ "S" ],
      [ "-", "C" ],
      [ "-", "S", "-" ],
      [ "A", "A", "B", "B" ]
    ], colHeaders: ["1", "2", "3", "4"], rowHeaders: ["len 4", "len 3", "len 2", "len 1"], hi: [[0,0]], note: "top cell contains S = the start variable" },
    choices: [
      "\\(aabb\\in L(G)\\) — the **start variable \\(S\\)** appears in the top cell, so the whole string is derivable",
      "\\(aabb\\notin L(G)\\) — a single variable in the top cell means rejection",
      "Nothing — CYK only reports the bottom row",
      "\\(aabb\\) is ambiguous, because \\(S\\) uses two rules"
    ],
    answer: 0,
    explanation: "CYK accepts iff the **start variable** \\(S\\) lands in the top cell (the cell for the entire string). Here it does, via \\(S\\to AC\\) with \\(A\\Rightarrow a\\) and \\(C\\Rightarrow abb\\), so \\(aabb\\in L(G)\\). (Indeed \\(L(G)=\\{a^n b^n:n\\ge1\\}\\) and \\(aabb=a^2b^2\\).)",
    source: "Sipser Thm 7.16; CYK membership test"
  },

  {
    id: "ch7-cyk-nonmember", chapter: 7, topic: "Decidable: context-free languages", type: "tf", rank: 34, difficulty: 3,
    prompt: "Same grammar `S -> AB | AC`, `C -> SB`, `A -> a`, `B -> b`. Running CYK on \\(aab\\) fills: length-1 \\(=A,A,B\\); length-2 \\(=(-,\\,S)\\); and the top (length-3) cell comes out **empty**. Therefore \\(aab\\notin L(G)\\).",
    grid: { title: "CYK table for aab", cells: [
      [ "-" ],
      [ "-", "S" ],
      [ "A", "A", "B" ]
    ], colHeaders: ["1", "2", "3"], rowHeaders: ["len 3", "len 2", "len 1"], hi: [[0,0]], note: "top cell is empty -> reject" },
    answer: true,
    explanation: "For \\(aab\\): the only length-2 variable is \\(S\\) over the trailing \\(ab\\) (positions 2–3); position-1 \\(a\\) pairs with nothing usable, and no rule builds the whole string. The top cell is empty, so \\(S\\) is absent and \\(aab\\notin L(G)\\) — correct, since \\(a^2b^1\\) is not of the form \\(a^n b^n\\).",
    source: "Sipser Thm 7.16; CYK membership test"
  },

  {
    id: "ch7-cyk-order", chapter: 7, topic: "Decidable: context-free languages", type: "order", rank: 33, difficulty: 2,
    prompt: "Put the steps of the **CYK membership test** (for a CNF grammar \\(G\\) and string \\(w=w_1\\cdots w_n\\)) into the order the algorithm performs them.",
    items: [
      "Fill each length-1 cell: put variable \\(A\\) in cell \\(i\\) iff \\(G\\) has a rule \\(A\\to w_i\\)",
      "For increasing lengths \\(\\ell=2,\\dots,n\\), fill each length-\\(\\ell\\) cell by trying every split into a left and right part",
      "Add variable \\(A\\) to a cell whenever some rule \\(A\\to BC\\) has \\(B\\) in the left part and \\(C\\) in the right part",
      "Accept iff the start variable \\(S\\) appears in the top cell (the cell spanning all of \\(w\\))"
    ],
    explanation: "CYK is bottom-up dynamic programming: first the terminal (length-1) row, then progressively longer substrings, each built by combining two already-filled shorter pieces via a binary rule \\(A\\to BC\\). Membership is read off the single top cell. This runs in \\(O(n^3\\cdot|G|)\\) time, proving every CFL is decidable (indeed in P).",
    source: "Sipser Thm 7.16 (every CFL is in P)"
  },

  {
    id: "ch7-cfl-in-p", chapter: 7, topic: "Decidable: context-free languages", type: "mc", rank: 32, difficulty: 2,
    prompt: "The CYK algorithm decides, for a fixed context-free grammar in Chomsky normal form, whether \\(w\\in L(G)\\) in time polynomial in \\(|w|\\). What does this establish about context-free languages?",
    choices: [
      "Every context-free language is in **P** (decidable in polynomial time)",
      "Every context-free language is NP-complete",
      "Context-free languages are undecidable",
      "Only regular languages can be decided in polynomial time"
    ],
    answer: 0,
    explanation: "CYK runs in \\(O(n^3)\\) time for fixed \\(G\\), so membership in any fixed CFL is decidable in polynomial time: **every context-free language is in P**. This is Sipser's Theorem 7.16 and is why parsing programming-language grammars is efficient.",
    source: "Sipser Thm 7.16"
  }

]);
