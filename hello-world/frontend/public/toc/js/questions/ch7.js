/* Chapter 7 — Time Complexity (Sipser 7.1–7.5).
   Big-O / small-o, the class TIME(t(n)), model relationships (Thm 7.8, 7.11),
   the class P (PATH, RELPRIME, CFLs), the class NP (verifiers, NTMs, CLIQUE,
   SUBSET-SUM, HAMPATH), P vs NP, polynomial-time reducibility, NP-completeness,
   the Cook–Levin theorem, and additional NP-complete problems. */
TOC.addQuestions([
  // ---- Measuring complexity: running time, big-O, small-o ----
  {
    id: "ch7-bigo-highest-term", chapter: 7, topic: "Big-O and small-o", type: "mc",
    prompt: "Let \\(f(n)=5n^3+2n^2+22n+6\\). Which is the tightest correct big-O bound from this list?",
    choices: ["\\(O(n^3)\\)", "\\(O(n^2)\\)", "\\(O(n^4)\\)", "\\(O(2^n)\\)"],
    answer: 0,
    explanation: "Keep the highest-order term and drop its coefficient: \\(f(n)=O(n^3)\\). It is also \\(O(n^4)\\) (looser), but it is **not** \\(O(n^2)\\).",
    source: "Sipser Ex 7.3"
  },
  {
    id: "ch7-bigo-definition", chapter: 7, topic: "Big-O and small-o", type: "mc",
    prompt: "\\(f(n)=O(g(n))\\) means there exist positive integers \\(c\\) and \\(n_0\\) such that for every \\(n\\ge n_0\\):",
    choices: [
      "\\(f(n)\\le c\\,g(n)\\)",
      "\\(f(n)\\ge c\\,g(n)\\)",
      "\\(f(n)=c\\,g(n)\\) exactly",
      "\\(\\lim_{n\\to\\infty} f(n)/g(n)=0\\)"
    ],
    answer: 0,
    explanation: "Big-O gives an asymptotic **upper** bound up to a constant factor: \\(f(n)\\le c\\,g(n)\\) for all sufficiently large \\(n\\). The limit-equals-0 condition is the definition of small-o (a strictly smaller growth rate) instead.",
    source: "Sipser Def 7.2"
  },
  {
    id: "ch7-smallo-strict", chapter: 7, topic: "Big-O and small-o", type: "mc",
    prompt: "\\(f(n)=o(g(n))\\) is defined by which condition?",
    choices: [
      "\\(\\displaystyle\\lim_{n\\to\\infty}\\frac{f(n)}{g(n)}=0\\)",
      "\\(\\displaystyle\\lim_{n\\to\\infty}\\frac{f(n)}{g(n)}=1\\)",
      "there exist \\(c,n_0\\) with \\(f(n)\\le c\\,g(n)\\) for \\(n\\ge n_0\\)",
      "\\(f(n)\\le g(n)\\) for all \\(n\\)"
    ],
    answer: 0,
    explanation: "Small-o says \\(f\\) is asymptotically strictly smaller than \\(g\\): the ratio tends to 0. Big-O (the \\(\\le c\\,g(n)\\) condition) is the non-strict analog — like \\(<\\) versus \\(\\le\\).",
    source: "Sipser Def 7.5"
  },
  {
    id: "ch7-smallo-selfref", chapter: 7, topic: "Big-O and small-o", type: "tf",
    prompt: "For any function \\(f\\), it holds that \\(f(n)=o(f(n))\\).",
    answer: false,
    explanation: "False: \\(\\lim_{n\\to\\infty} f(n)/f(n)=1\\neq 0\\), so \\(f(n)\\) is never \\(o(f(n))\\). (By contrast \\(f(n)=O(f(n))\\) always holds.)",
    source: "Sipser Ex 7.6"
  },
  {
    id: "ch7-smallo-examples", chapter: 7, topic: "Big-O and small-o", type: "multi",
    prompt: "Which of the following small-o relationships are correct?",
    choices: [
      "\\(\\sqrt{n}=o(n)\\)",
      "\\(n\\log n=o(n^2)\\)",
      "\\(n^2=o(n^3)\\)",
      "\\(2^n=o(n^2)\\)"
    ],
    answers: [0, 1, 2],
    explanation: "The first three hold because each ratio tends to 0. The last is false — \\(2^n\\) grows far faster than \\(n^2\\), so if anything \\(n^2=o(2^n)\\).",
    source: "Sipser Ex 7.6"
  },
  {
    id: "ch7-poly-exp-fib", chapter: 7, topic: "Big-O and small-o", type: "fib",
    prompt: "A bound of the form \\(n^c\\) for a constant \\(c>0\\) is called a ____ bound (one word).",
    accept: ["polynomial", "polynomial-time", "poly"],
    explanation: "Bounds of the form \\(n^c\\) are polynomial; bounds of the form \\(2^{(n^{\\delta})}\\) for \\(\\delta>0\\) are exponential. Sipser treats polynomial differences as small and exponential ones as large.",
    source: "Sipser §7.2"
  },

  // ---- Analyzing TMs and the class TIME(t(n)) ----
  {
    id: "ch7-akbk-singletape", chapter: 7, topic: "TIME(t(n))", type: "mc",
    prompt: "Let \\(A=\\{0^k1^k\\mid k\\ge 0\\}\\). The cross-off TM \\(M_1\\) (scan, then repeatedly cross off one \\(0\\) and one \\(1\\)) decides \\(A\\) in time:",
    choices: ["\\(O(n^2)\\)", "\\(O(n)\\)", "\\(O(\\log n)\\)", "\\(O(2^n)\\)"],
    answer: 0,
    explanation: "Each scan costs \\(O(n)\\) and at most \\(n/2\\) scans occur, so stages 2–3 take \\(O(n^2)\\); the total is \\(O(n^2)\\), giving \\(A\\in \\mathrm{TIME}(n^2)\\).",
    source: "Sipser §7.1 (machine \\(M_1\\))"
  },
  {
    id: "ch7-timeclass-def", chapter: 7, topic: "TIME(t(n))", type: "fib",
    prompt: "\\(\\mathrm{TIME}(t(n))\\) is the collection of all languages decidable by some \\(O(t(n))\\)-time ____ Turing machine (one word).",
    accept: ["deterministic", "deterministic single-tape", "single-tape"],
    explanation: "By Def 7.7, \\(\\mathrm{TIME}(t(n))\\) collects languages decidable by an \\(O(t(n))\\)-time deterministic TM. (The nondeterministic analog is \\(\\mathrm{NTIME}(t(n))\\).)",
    source: "Sipser Def 7.7"
  },

  // ---- Complexity relationships among models ----
  {
    id: "ch7-multitape-square", chapter: 7, topic: "Model relationships", type: "mc",
    prompt: "By Theorem 7.8, every \\(t(n)\\)-time multitape TM (with \\(t(n)\\ge n\\)) has an equivalent single-tape TM running in time:",
    choices: ["\\(O(t^2(n))\\)", "\\(O(t(n))\\)", "\\(2^{O(t(n))}\\)", "\\(O(t(n)\\log t(n))\\)"],
    answer: 0,
    explanation: "Simulating one multitape step costs \\(O(t(n))\\) on the single-tape machine, and there are \\(t(n)\\) steps, giving \\(O(t^2(n))\\) — at most a polynomial (squaring) slowdown.",
    source: "Sipser Thm 7.8"
  },
  {
    id: "ch7-nondet-exp", chapter: 7, topic: "Model relationships", type: "mc",
    prompt: "By Theorem 7.11, every \\(t(n)\\)-time nondeterministic single-tape TM (with \\(t(n)\\ge n\\)) has an equivalent deterministic single-tape TM running in time:",
    choices: ["\\(2^{O(t(n))}\\)", "\\(O(t^2(n))\\)", "\\(O(t(n))\\)", "\\(O(t(n)\\log t(n))\\)"],
    answer: 0,
    explanation: "The deterministic machine searches the computation tree, which has \\(O(b^{t(n)})\\) nodes; the total time is \\(2^{O(t(n))}\\) — at most an exponential slowdown.",
    source: "Sipser Thm 7.11"
  },

  // ---- The class P ----
  {
    id: "ch7-p-def", chapter: 7, topic: "The class P", type: "mc",
    prompt: "The class \\(\\mathrm{P}\\) is defined as:",
    choices: [
      "\\(\\bigcup_k \\mathrm{TIME}(n^k)\\) — languages decidable in polynomial time on a deterministic single-tape TM",
      "languages decidable in polynomial time on a nondeterministic TM",
      "languages with polynomial-time verifiers",
      "languages decidable in exponential time"
    ],
    answer: 0,
    explanation: "\\(\\mathrm{P}=\\bigcup_k \\mathrm{TIME}(n^k)\\): polynomial time on a deterministic single-tape TM. Polynomial-time verifiers / nondeterministic poly time both describe \\(\\mathrm{NP}\\) instead.",
    source: "Sipser Def 7.12"
  },
  {
    id: "ch7-unary-encoding", chapter: 7, topic: "The class P", type: "tf",
    prompt: "Encoding the number 17 in unary (as seventeen 1s) is a reasonable encoding for analyzing polynomial-time algorithms.",
    answer: false,
    explanation: "Unary is exponentially larger than base-\\(k\\) (\\(k\\ge 2\\)) notation, so it is **not** reasonable; a polynomial in the unary length can be exponential in the true input size. Reasonable encodings allow poly-time encode/decode.",
    source: "Sipser §7.2 (encoding)"
  },
  {
    id: "ch7-path-in-p", chapter: 7, topic: "The class P", type: "mc",
    prompt: "\\(PATH=\\{\\langle G,s,t\\rangle\\mid G\\text{ is a directed graph with a path from }s\\text{ to }t\\}\\) is in \\(\\mathrm{P}\\). Which technique gives the polynomial-time algorithm?",
    choices: [
      "breadth-first marking of nodes reachable from \\(s\\)",
      "trying all potential paths (brute force)",
      "the Euclidean algorithm",
      "dynamic programming over substrings"
    ],
    answer: 0,
    explanation: "Repeatedly marking nodes reachable from \\(s\\) runs in polynomial time. The brute-force approach examines roughly \\(m^m\\) potential paths — exponential — so it does not place \\(PATH\\) in \\(\\mathrm{P}\\).",
    source: "Sipser Thm 7.14"
  },
  {
    id: "ch7-relprime-euclid", chapter: 7, topic: "The class P", type: "mc",
    prompt: "\\(RELPRIME=\\{\\langle x,y\\rangle\\mid \\gcd(x,y)=1\\}\\) is shown to be in \\(\\mathrm{P}\\) using:",
    choices: [
      "the Euclidean algorithm for the gcd",
      "searching all divisors up to \\(x\\)",
      "a nondeterministic guess of a common divisor",
      "the CYK dynamic-programming table"
    ],
    answer: 0,
    explanation: "The Euclidean algorithm repeatedly applies \\(x\\leftarrow x\\bmod y\\); each pair of stages at least halves a value, so it runs in \\(O(n)\\) stages. Searching all divisors is exponential in the input length.",
    source: "Sipser Thm 7.15"
  },
  {
    id: "ch7-euclid-order", chapter: 7, topic: "The class P", type: "order",
    prompt: "Order the steps of the Euclidean algorithm \\(E\\) on input \\(\\langle x,y\\rangle\\) used to decide \\(RELPRIME\\) in polynomial time.",
    items: [
      "Repeat the next two steps until \\(y=0\\)",
      "Assign \\(x \\leftarrow x \\bmod y\\)",
      "Exchange the values of \\(x\\) and \\(y\\)",
      "Output \\(x\\) (which equals \\(\\gcd\\); accept iff it is \\(1\\))"
    ],
    explanation: "Algorithm \\(E\\) loops \\(x\\leftarrow x\\bmod y\\) then swaps, until \\(y=0\\); the final \\(x\\) is \\(\\gcd(x,y)\\). \\(RELPRIME\\) accepts iff that gcd is \\(1\\). Each iteration at least halves a value, giving \\(O(n)\\) iterations.",
    source: "Sipser Thm 7.15 (algorithm \\(E\\))"
  },
  {
    id: "ch7-p-examples-multi", chapter: 7, topic: "The class P", type: "multi",
    prompt: "Which languages are shown to be in \\(\\mathrm{P}\\) in Chapter 7?",
    choices: [
      "\\(PATH\\)",
      "\\(RELPRIME\\)",
      "every context-free language",
      "\\(HAMPATH\\)"
    ],
    answers: [0, 1, 2],
    explanation: "\\(PATH\\) (Thm 7.14), \\(RELPRIME\\) (Thm 7.15), and every CFL (Thm 7.16) are in \\(\\mathrm{P}\\). \\(HAMPATH\\) is in \\(\\mathrm{NP}\\) but is **not** known to be in \\(\\mathrm{P}\\) (it is NP-complete).",
    source: "Sipser §7.2"
  },

  // ---- The class NP: verifiers, NTMs, examples ----
  {
    id: "ch7-np-name-misconception", chapter: 7, topic: "The class NP", type: "tf",
    prompt: "The 'N' in \\(\\mathrm{NP}\\) stands for 'non-polynomial'.",
    answer: false,
    explanation: "\\(\\mathrm{NP}\\) stands for **nondeterministic polynomial time**, not 'non-polynomial'. Indeed \\(\\mathrm{P}\\subseteq\\mathrm{NP}\\), so \\(\\mathrm{NP}\\) contains polynomial-time-decidable languages.",
    source: "Sipser §7.3"
  },
  {
    id: "ch7-verifier-def", chapter: 7, topic: "The class NP", type: "mc",
    prompt: "A **verifier** for a language \\(A\\) is an algorithm \\(V\\) such that:",
    choices: [
      "\\(A=\\{w\\mid V\\text{ accepts }\\langle w,c\\rangle\\text{ for some string }c\\}\\)",
      "\\(A=\\{w\\mid V\\text{ accepts }\\langle w,c\\rangle\\text{ for every string }c\\}\\)",
      "\\(A=\\{w\\mid V\\text{ rejects }w\\}\\)",
      "\\(A=\\{w\\mid V\\text{ halts on }w\\}\\)"
    ],
    answer: 0,
    explanation: "A verifier accepts \\(w\\) when given **some** suitable certificate \\(c\\). A polynomial-time verifier runs in time polynomial in \\(|w|\\), which forces the useful certificate to have polynomial length.",
    source: "Sipser Def 7.18"
  },
  {
    id: "ch7-certificate-fib", chapter: 7, topic: "The class NP", type: "fib",
    prompt: "The extra string \\(c\\) that a verifier uses to confirm \\(w\\in A\\) is called a ____ (a proof of membership).",
    accept: ["certificate", "witness", "proof"],
    explanation: "The string \\(c\\) is a certificate (also called a witness or proof). For \\(HAMPATH\\) it is the Hamiltonian path; for \\(COMPOSITES\\) it is a divisor.",
    source: "Sipser Def 7.18"
  },
  {
    id: "ch7-np-ntm-equiv", chapter: 7, topic: "The class NP", type: "tf",
    prompt: "A language is in \\(\\mathrm{NP}\\) if and only if it is decided by some nondeterministic polynomial-time Turing machine.",
    answer: true,
    explanation: "Theorem 7.20: an NTM can guess the certificate to simulate a verifier, and a verifier can use an accepting branch as the certificate. The two characterizations of \\(\\mathrm{NP}\\) coincide.",
    source: "Sipser Thm 7.20"
  },
  {
    id: "ch7-subsetsum-def", chapter: 7, topic: "The class NP", type: "mc",
    prompt: "Which instance is a member of \\(SUBSET\\text{-}SUM\\)?",
    choices: [
      "\\(\\langle\\{4,11,16,21,27\\},\\,25\\rangle\\)",
      "\\(\\langle\\{4,11,16,21,27\\},\\,3\\rangle\\)",
      "\\(\\langle\\{2,4,6\\},\\,13\\rangle\\)",
      "\\(\\langle\\{5,10,20\\},\\,7\\rangle\\)"
    ],
    answer: 0,
    explanation: "\\(\\langle\\{4,11,16,21,27\\},25\\rangle\\in SUBSET\\text{-}SUM\\) because \\(4+21=25\\). The certificate is the subcollection that sums to the target \\(t\\); a verifier just adds it up.",
    source: "Sipser Thm 7.25"
  },
  {
    id: "ch7-np-examples-multi", chapter: 7, topic: "The class NP", type: "multi",
    prompt: "Which languages are stated in the chapter to be members of \\(\\mathrm{NP}\\)?",
    choices: [
      "\\(HAMPATH\\)",
      "\\(COMPOSITES\\)",
      "\\(CLIQUE\\)",
      "\\(\\overline{HAMPATH}\\) (the complement of \\(HAMPATH\\))"
    ],
    answers: [0, 1, 2],
    explanation: "\\(HAMPATH\\), \\(COMPOSITES\\), and \\(CLIQUE\\) all have short certificates and are in \\(\\mathrm{NP}\\). The complement \\(\\overline{HAMPATH}\\) is not obviously in \\(\\mathrm{NP}\\) — verifying *non*-existence of a path is not known to be easy.",
    source: "Sipser §7.3"
  },
  {
    id: "ch7-clique-def-fib", chapter: 7, topic: "The class NP", type: "fib",
    prompt: "A subgraph in which every two nodes are joined by an edge is called a ____ (one word).",
    accept: ["clique", "k-clique"],
    explanation: "A clique is a fully-connected subgraph; a \\(k\\)-clique has \\(k\\) nodes. \\(CLIQUE=\\{\\langle G,k\\rangle\\mid G\\text{ has a }k\\text{-clique}\\}\\) is in \\(\\mathrm{NP}\\), with the clique's nodes as certificate.",
    source: "Sipser Thm 7.24"
  },

  // ---- P vs NP ----
  {
    id: "ch7-pvsnp-open", chapter: 7, topic: "P versus NP", type: "tf",
    prompt: "It has been proven that \\(\\mathrm{P}=\\mathrm{NP}\\).",
    answer: false,
    explanation: "Whether \\(\\mathrm{P}=\\mathrm{NP}\\) is one of the great unsolved problems; no one has exhibited even a single language in \\(\\mathrm{NP}\\setminus\\mathrm{P}\\). Most researchers believe \\(\\mathrm{P}\\neq\\mathrm{NP}\\), but it is unproven.",
    source: "Sipser §7.3"
  },
  {
    id: "ch7-pnp-containment", chapter: 7, topic: "P versus NP", type: "mc",
    prompt: "Which containment chain is known to be true?",
    choices: [
      "\\(\\mathrm{P}\\subseteq\\mathrm{NP}\\subseteq \\mathrm{EXPTIME}\\)",
      "\\(\\mathrm{NP}\\subseteq\\mathrm{P}\\subseteq \\mathrm{EXPTIME}\\)",
      "\\(\\mathrm{EXPTIME}\\subseteq\\mathrm{NP}\\subseteq \\mathrm{P}\\)",
      "\\(\\mathrm{NP}=\\mathrm{EXPTIME}\\)"
    ],
    answer: 0,
    explanation: "\\(\\mathrm{P}\\subseteq\\mathrm{NP}\\) (a decider is a trivial verifier), and \\(\\mathrm{NP}\\subseteq\\mathrm{EXPTIME}=\\bigcup_k \\mathrm{TIME}(2^{n^k})\\) by brute-force search. Whether either containment is proper is open.",
    source: "Sipser §7.3"
  },

  // ---- Polynomial-time reducibility ----
  {
    id: "ch7-polyreduce-def", chapter: 7, topic: "Polynomial-time reducibility", type: "mc",
    prompt: "\\(A\\le_p B\\) (polynomial-time mapping reducible) means there is a polynomial-time computable \\(f\\) such that, for every \\(w\\):",
    choices: [
      "\\(w\\in A \\iff f(w)\\in B\\)",
      "\\(w\\in A \\Rightarrow f(w)\\notin B\\)",
      "\\(w\\in B \\iff f(w)\\in A\\)",
      "\\(f(w)\\) is computable but not necessarily in polynomial time"
    ],
    answer: 0,
    explanation: "A polynomial-time reduction is a poly-time computable \\(f\\) with \\(w\\in A\\iff f(w)\\in B\\). It converts membership testing in \\(A\\) into membership testing in \\(B\\), efficiently.",
    source: "Sipser Def 7.29"
  },
  {
    id: "ch7-reduce-pclosure", chapter: 7, topic: "Polynomial-time reducibility", type: "tf",
    prompt: "If \\(A\\le_p B\\) and \\(B\\in\\mathrm{P}\\), then \\(A\\in\\mathrm{P}\\).",
    answer: true,
    explanation: "Theorem 7.31: compute \\(f(w)\\) in poly time, then run \\(B\\)'s poly-time decider on \\(f(w)\\). The composition of polynomials is polynomial, so \\(A\\in\\mathrm{P}\\).",
    source: "Sipser Thm 7.31"
  },
  {
    id: "ch7-reduce-wrongdir", chapter: 7, topic: "Polynomial-time reducibility", type: "tf",
    prompt: "If \\(A\\le_p B\\) and \\(A\\in\\mathrm{P}\\), then \\(B\\in\\mathrm{P}\\).",
    answer: false,
    explanation: "This reverses the direction. \\(A\\le_p B\\) lets an algorithm for \\(B\\) solve \\(A\\), not the other way around. \\(A\\) being easy says nothing about \\(B\\) (an easy \\(A\\) can reduce to a hard \\(B\\)).",
    source: "Sipser Thm 7.31 (direction)"
  },
  {
    id: "ch7-3sat-clique-reduce", chapter: 7, topic: "Polynomial-time reducibility", type: "mc",
    prompt: "In the reduction \\(3SAT\\le_p CLIQUE\\), a \\(3cnf\\)-formula with \\(k\\) clauses maps to a graph \\(G\\) in which a satisfying assignment corresponds to a:",
    choices: [
      "\\(k\\)-clique (one node per clause; no edges within a triple or between contradictory literals)",
      "Hamiltonian path through all nodes",
      "vertex cover of size \\(k\\)",
      "3-coloring of \\(G\\)"
    ],
    answer: 0,
    explanation: "Each clause becomes a triple of literal-nodes; edges join non-contradictory literals in different triples. A \\(k\\)-clique picks one true literal per clause, so \\(\\phi\\) is satisfiable iff \\(G\\) has a \\(k\\)-clique.",
    source: "Sipser Thm 7.32"
  },

  // ---- NP-completeness ----
  {
    id: "ch7-npc-def", chapter: 7, topic: "NP-completeness", type: "mc",
    prompt: "A language \\(B\\) is **NP-complete** if it satisfies which two conditions?",
    choices: [
      "\\(B\\in\\mathrm{NP}\\), and every \\(A\\in\\mathrm{NP}\\) satisfies \\(A\\le_p B\\)",
      "\\(B\\in\\mathrm{P}\\), and every \\(A\\in\\mathrm{NP}\\) satisfies \\(B\\le_p A\\)",
      "\\(B\\notin\\mathrm{P}\\), and \\(B\\) is decidable",
      "\\(B\\in\\mathrm{NP}\\), and \\(B\\le_p A\\) for some \\(A\\in\\mathrm{P}\\)"
    ],
    answer: 0,
    explanation: "Def 7.34: \\(B\\) is NP-complete iff (1) \\(B\\in\\mathrm{NP}\\) and (2) every NP language reduces to \\(B\\) in polynomial time. The reduction goes *into* \\(B\\) (every \\(A\\le_p B\\)).",
    source: "Sipser Def 7.34"
  },
  {
    id: "ch7-npc-collapse", chapter: 7, topic: "NP-completeness", type: "tf",
    prompt: "If some NP-complete problem is in \\(\\mathrm{P}\\), then \\(\\mathrm{P}=\\mathrm{NP}\\).",
    answer: true,
    explanation: "Theorem 7.35: if NP-complete \\(B\\in\\mathrm{P}\\), then since every \\(A\\in\\mathrm{NP}\\) has \\(A\\le_p B\\), Thm 7.31 gives \\(A\\in\\mathrm{P}\\); thus \\(\\mathrm{NP}\\subseteq\\mathrm{P}\\) and the classes are equal.",
    source: "Sipser Thm 7.35"
  },
  {
    id: "ch7-npc-spread", chapter: 7, topic: "NP-completeness", type: "mc",
    prompt: "To show a language \\(C\\in\\mathrm{NP}\\) is NP-complete using a known NP-complete \\(B\\), you prove:",
    choices: [
      "\\(B\\le_p C\\)",
      "\\(C\\le_p B\\)",
      "\\(C\\le_p A\\) for some \\(A\\in\\mathrm{P}\\)",
      "\\(C\\in\\mathrm{P}\\)"
    ],
    answer: 0,
    explanation: "Theorem 7.36: if \\(B\\) is NP-complete, \\(C\\in\\mathrm{NP}\\), and \\(B\\le_p C\\), then \\(C\\) is NP-complete. Reduce *from* the known-hard \\(B\\) *to* the new problem \\(C\\) — the direction is essential.",
    source: "Sipser Thm 7.36"
  },
  {
    id: "ch7-npc-strategy-order", chapter: 7, topic: "NP-completeness", type: "order",
    prompt: "Order the steps of a standard proof that a language \\(C\\) is NP-complete (reducing from a known NP-complete \\(B\\)).",
    items: [
      "Show \\(C\\in\\mathrm{NP}\\) (exhibit a poly-time verifier / certificate)",
      "Pick a known NP-complete language \\(B\\) (often \\(3SAT\\))",
      "Construct a polynomial-time reduction \\(f\\) from \\(B\\) to \\(C\\)",
      "Prove \\(w\\in B \\iff f(w)\\in C\\)"
    ],
    explanation: "First place \\(C\\) in \\(\\mathrm{NP}\\); then reduce a known NP-complete \\(B\\) to \\(C\\) via a poly-time \\(f\\) and prove correctness in both directions. By Thm 7.36 this makes \\(C\\) NP-complete.",
    source: "Sipser §7.5"
  },

  // ---- Cook–Levin theorem ----
  {
    id: "ch7-sat-npc", chapter: 7, topic: "Cook–Levin theorem", type: "tf",
    prompt: "The Cook–Levin theorem states that \\(SAT\\) is NP-complete.",
    answer: true,
    explanation: "Theorem 7.37 (Cook–Levin): \\(SAT\\in\\mathrm{NP}\\), and every NP language reduces to \\(SAT\\) by encoding an accepting computation tableau as a satisfiable Boolean formula. It is the first NP-complete problem.",
    source: "Sipser Thm 7.37"
  },
  {
    id: "ch7-sat-iff-pnp", chapter: 7, topic: "Cook–Levin theorem", type: "mc",
    prompt: "Theorem 7.27 states that \\(SAT\\in\\mathrm{P}\\) if and only if:",
    choices: [
      "\\(\\mathrm{P}=\\mathrm{NP}\\)",
      "\\(\\mathrm{P}\\neq\\mathrm{NP}\\)",
      "\\(\\mathrm{NP}=\\mathrm{EXPTIME}\\)",
      "every CFL is in \\(\\mathrm{P}\\)"
    ],
    answer: 0,
    explanation: "Since \\(SAT\\) is NP-complete, a poly-time algorithm for it would put all of \\(\\mathrm{NP}\\) in \\(\\mathrm{P}\\) (and conversely). Hence \\(SAT\\in\\mathrm{P}\\iff \\mathrm{P}=\\mathrm{NP}\\).",
    source: "Sipser Thm 7.27"
  },
  {
    id: "ch7-sat-def", chapter: 7, topic: "Cook–Levin theorem", type: "fib",
    prompt: "A Boolean formula \\(\\varphi\\) is ____ if some assignment of 0s and 1s to its variables makes it evaluate to 1 (one word).",
    accept: ["satisfiable", "satisfible"],
    explanation: "\\(SAT=\\{\\langle\\varphi\\rangle\\mid \\varphi\\text{ is a satisfiable Boolean formula}\\}\\). An assignment that makes \\(\\varphi=1\\) is said to satisfy it.",
    source: "Sipser §7.4"
  },
  {
    id: "ch7-tableau-fib", chapter: 7, topic: "Cook–Levin theorem", type: "fib",
    prompt: "In the Cook–Levin proof, the \\(n^k\\times n^k\\) table whose rows are the successive configurations of \\(N\\)'s computation on \\(w\\) is called a ____ (one word).",
    accept: ["tableau"],
    explanation: "The reduction builds a Boolean formula \\(\\varphi=\\varphi_{cell}\\wedge\\varphi_{start}\\wedge\\varphi_{move}\\wedge\\varphi_{accept}\\) that is satisfiable exactly when an accepting tableau exists for \\(N\\) on \\(w\\).",
    source: "Sipser Thm 7.37 (proof)"
  },
  {
    id: "ch7-cooklevin-formula-multi", chapter: 7, topic: "Cook–Levin theorem", type: "multi",
    prompt: "In the Cook–Levin reduction, \\(\\varphi=\\varphi_{cell}\\wedge\\varphi_{start}\\wedge\\varphi_{move}\\wedge\\varphi_{accept}\\). Which statements are correct?",
    choices: [
      "\\(\\varphi_{start}\\) forces the first row to be the start configuration of \\(N\\) on \\(w\\)",
      "\\(\\varphi_{move}\\) forces every \\(2\\times 3\\) window of cells to be legal",
      "\\(\\varphi_{accept}\\) forces an accepting configuration to appear somewhere",
      "\\(\\varphi\\) has exponential size, so the reduction is not polynomial time"
    ],
    answers: [0, 1, 2],
    explanation: "Each subformula enforces one consistency condition (start row, legal local moves via \\(2\\times 3\\) windows, an accept state). The total size is \\(O(n^{2k})\\) — polynomial — so the reduction runs in polynomial time.",
    source: "Sipser Thm 7.37 (proof)"
  },
  {
    id: "ch7-3sat-npc", chapter: 7, topic: "Cook–Levin theorem", type: "tf",
    prompt: "\\(3SAT\\) (satisfiable formulas in conjunctive normal form with exactly three literals per clause) is NP-complete.",
    answer: true,
    explanation: "Corollary 7.42: the Cook–Levin formula is converted into \\(3cnf\\) form, so \\(3SAT\\) is NP-complete. It is the usual starting point for reductions because its rigid structure is convenient.",
    source: "Sipser Cor 7.42"
  },

  // ---- Additional NP-complete problems ----
  {
    id: "ch7-vertexcover-def", chapter: 7, topic: "Additional NP-complete problems", type: "mc",
    prompt: "A **vertex cover** of an undirected graph \\(G\\) is:",
    choices: [
      "a set of nodes such that every edge touches at least one node in the set",
      "a set of nodes that are pairwise adjacent",
      "a path visiting every node exactly once",
      "a set of edges covering every node"
    ],
    answer: 0,
    explanation: "A vertex cover is a node set hitting every edge. \\(VERTEX\\text{-}COVER=\\{\\langle G,k\\rangle\\mid G\\text{ has a }k\\text{-node vertex cover}\\}\\) is NP-complete (a pairwise-adjacent set is instead a clique).",
    source: "Sipser Thm 7.44"
  },
  {
    id: "ch7-npc-problems-multi", chapter: 7, topic: "Additional NP-complete problems", type: "multi",
    prompt: "Which of these languages are proven NP-complete in Chapter 7?",
    choices: [
      "\\(VERTEX\\text{-}COVER\\)",
      "\\(HAMPATH\\)",
      "\\(SUBSET\\text{-}SUM\\)",
      "\\(PATH\\)"
    ],
    answers: [0, 1, 2],
    explanation: "\\(VERTEX\\text{-}COVER\\), \\(HAMPATH\\) (and \\(UHAMPATH\\), \\(CLIQUE\\), \\(3SAT\\)), and \\(SUBSET\\text{-}SUM\\) are NP-complete. \\(PATH\\in\\mathrm{P}\\) and is generally believed **not** to be NP-complete.",
    source: "Sipser §7.4–7.5"
  },
  {
    id: "ch7-reduction-sources-order", chapter: 7, topic: "Additional NP-complete problems", type: "order",
    prompt: "Sipser builds the NP-complete problems in a chain, each reduction starting from a previously established result. Order these as the chapter establishes them.",
    items: [
      "\\(SAT\\) is NP-complete (Cook–Levin, from every NP language)",
      "\\(3SAT\\) is NP-complete (corollary of Cook–Levin)",
      "\\(CLIQUE\\) is NP-complete (from \\(3SAT\\))",
      "\\(VERTEX\\text{-}COVER\\) is NP-complete (from \\(3SAT\\))"
    ],
    explanation: "Cook–Levin gives the first NP-complete language \\(SAT\\); \\(3SAT\\) follows as a corollary; then \\(3SAT\\) is reduced to \\(CLIQUE\\), \\(VERTEX\\text{-}COVER\\), \\(HAMPATH\\), and \\(SUBSET\\text{-}SUM\\).",
    source: "Sipser §7.4–7.5"
  },

  // ---- Course-assigned problems 7.20 and 7.29 ----
  {
    id: "ch7-path-not-npc", chapter: 7, topic: "P versus NP", type: "tf",
    prompt: "If someone proved that \\(PATH\\) is **not** NP-complete, that would prove \\(\\mathrm{P}\\neq\\mathrm{NP}\\).",
    answer: true,
    explanation: "Problem 7.20: \\(PATH\\in\\mathrm{P}\\). If \\(\\mathrm{P}=\\mathrm{NP}\\), then every nontrivial language in \\(\\mathrm{P}\\) — including \\(PATH\\) — would be NP-complete. So showing \\(PATH\\) is not NP-complete forces \\(\\mathrm{P}\\neq\\mathrm{NP}\\).",
    source: "Sipser Problem 7.20"
  },
  {
    id: "ch7-3color-npc", chapter: 7, topic: "Additional NP-complete problems", type: "tf",
    prompt: "\\(3COLOR=\\{\\langle G\\rangle\\mid G\\text{ is colorable with 3 colors}\\}\\) is NP-complete.",
    answer: true,
    explanation: "Problem 7.29 establishes \\(3COLOR\\) is NP-complete. A 3-coloring assigns one of three colors to each node so that no edge joins two same-colored nodes; the coloring is a short certificate, and gadgets reduce \\(3SAT\\) to it.",
    source: "Sipser Problem 7.29"
  }
]);
