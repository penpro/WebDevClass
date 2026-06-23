/* Final Practice (chapter 12) — focused, slightly integrative review over the
   FINAL exam scope: Chapters 6-8 (Sipser 3rd ed.).
   Ch 6  — recursion theorem & advanced computability (self-reference, fixed
           points, Turing reducibility, descriptive/Kolmogorov complexity).
   Ch 7  — time complexity: P, NP (verifiers / NTMs), poly-time reducibility,
           NP-completeness, Cook–Levin, additional NP-complete problems.
   Ch 8  — space complexity: SPACE/NSPACE, Savitch, PSPACE = NPSPACE,
           PSPACE-completeness (TQBF), L and NL, PATH NL-complete, NL = coNL.
   Topic strings deliberately mirror ch6/ch7/ch8 so the "Explain this" concept
   lookup resolves. Every item is auto-gradable with one unambiguous answer. */
TOC.addQuestions([
  // ============================================================
  // Chapter 6 — Advanced computability
  // ============================================================
  {
    id: "final-recursion-self-tf", chapter: 12, topic: "Recursion theorem", type: "tf",
    prompt: "By the recursion theorem, a Turing machine can obtain its own description \\(\\langle M\\rangle\\) and then go on to use it in its computation.",
    answer: true,
    explanation: "This is exactly Thm 6.3: from a machine computing \\(t(\\langle R\\rangle,w)\\) one obtains \\(R\\) with \\(r(w)=t(\\langle R\\rangle,w)\\), so \\(R\\) may treat its own description \\(\\langle R\\rangle\\) as a value it is handed for free.",
    source: "Sipser Thm 6.3"
  },
  {
    id: "final-recursion-meaning-mc", chapter: 12, topic: "Recursion theorem", type: "mc",
    prompt: "Which informal statement most accurately captures what the recursion theorem provides?",
    choices: [
      "A computable process can obtain and use a complete description of itself",
      "Every recursive (computable) function has a least fixed point that is uncomputable",
      "Any recursively enumerable language can be made decidable by adding self-reference",
      "A Turing machine can decide whether an arbitrary program halts on itself"
    ],
    answer: 0,
    explanation: "The recursion theorem legitimizes self-reference: an algorithm may include the step 'obtain own description \\(\\langle M\\rangle\\)' and compute with it. It does not make undecidable problems decidable.",
    source: "Sipser §6.1 (terminology for the recursion theorem)"
  },
  {
    id: "final-atm-recursion-proof-mc", chapter: 12, topic: "Recursion theorem applications", type: "mc",
    prompt: "In the recursion-theorem proof that \\(A_{TM}\\) is undecidable, suppose \\(H\\) decides \\(A_{TM}\\). A machine \\(B\\) obtains \\(\\langle B\\rangle\\), runs \\(H\\) on \\(\\langle B,w\\rangle\\), and then does what to reach a contradiction?",
    choices: [
      "The opposite of \\(H\\)'s verdict: accept if \\(H\\) says reject, reject if \\(H\\) says accept",
      "Accepts exactly when \\(H\\) accepts, so \\(B\\) agrees with \\(H\\)",
      "Loops forever, so \\(H\\) never returns an answer",
      "Prints \\(\\langle H\\rangle\\) and halts without consulting \\(H\\)"
    ],
    answer: 0,
    explanation: "\\(B\\) asks \\(H\\) whether \\(B\\) accepts \\(w\\), then deliberately does the opposite, so \\(B\\)'s real behavior contradicts \\(H\\)'s verdict on \\(\\langle B,w\\rangle\\). This replaces the diagonalization of Thm 4.11.",
    source: "Sipser Thm 6.5"
  },
  {
    id: "final-fixedpoint-mc", chapter: 12, topic: "Recursion theorem applications", type: "mc",
    prompt: "The fixed-point version of the recursion theorem (Thm 6.8) says that for any computable transformation \\(t\\) of machine descriptions there is a TM \\(F\\) such that:",
    choices: [
      "\\(t(\\langle F\\rangle)\\) describes a machine equivalent to \\(F\\) (a fixed point up to behavior)",
      "\\(t(\\langle F\\rangle)=\\langle F\\rangle\\) as identical strings",
      "\\(F\\) halts on every input and \\(t\\) is the identity",
      "\\(t\\) has no computable inverse on \\(\\langle F\\rangle\\)"
    ],
    answer: 0,
    explanation: "\\(F\\) need not be unchanged as a string: \\(F\\) obtains \\(\\langle F\\rangle\\), computes \\(t(\\langle F\\rangle)=\\langle G\\rangle\\), and simulates \\(G\\), so \\(t(\\langle F\\rangle)\\) and \\(\\langle F\\rangle\\) describe equivalent machines.",
    source: "Sipser Thm 6.8"
  },
  {
    id: "final-turing-vs-mapping-mc", chapter: 12, topic: "Turing reducibility", type: "mc",
    prompt: "Which relationship between mapping reducibility \\(\\le_m\\) and Turing reducibility \\(\\le_T\\) is correct?",
    choices: [
      "\\(A\\le_m B\\) implies \\(A\\le_T B\\), but not conversely (e.g. \\(\\overline{A_{TM}}\\le_T A_{TM}\\) while \\(\\overline{A_{TM}}\\not\\le_m A_{TM}\\))",
      "\\(A\\le_T B\\) implies \\(A\\le_m B\\), but not conversely",
      "\\(\\le_m\\) and \\(\\le_T\\) are equivalent notions for all languages",
      "Neither reducibility implies the other in any case"
    ],
    answer: 0,
    explanation: "A mapping reduction yields an oracle machine, so \\(\\le_m\\) implies \\(\\le_T\\). The converse fails: \\(\\overline{A_{TM}}\\le_T A_{TM}\\) by flipping the oracle's answer, yet \\(\\overline{A_{TM}}\\not\\le_m A_{TM}\\) since \\(A_{TM}\\) is recognizable and its complement is not.",
    source: "Sipser §6.3 (Def 6.20, Thm 6.21 discussion)"
  },
  {
    id: "final-oracle-fib", chapter: 12, topic: "Turing reducibility", type: "fib",
    prompt: "An external device that, for any string \\(w\\), instantly reports whether \\(w\\in B\\) is called an ____ for \\(B\\). (one word)",
    accept: ["oracle", "an oracle"],
    explanation: "An oracle for \\(B\\) answers membership queries '\\(w\\in B\\)?' in a single step. A TM augmented with such queries is an oracle TM \\(M^{B}\\), the basis for \\(A\\le_T B\\).",
    source: "Sipser Def 6.18"
  },
  {
    id: "final-kolmogorov-not-computable-tf", chapter: 12, topic: "Descriptive complexity", type: "tf",
    prompt: "The descriptive (Kolmogorov) complexity \\(K(x)\\) is computable: some TM outputs \\(K(x)\\) given \\(x\\).",
    answer: false,
    explanation: "\\(K\\) is not computable (Problem 6.23). If it were, one could effectively find incompressible strings and even decide incompressibility (Problem 6.24), which is impossible.",
    source: "Sipser Problem 6.23"
  },
  {
    id: "final-incompressible-undecidable-mc", chapter: 12, topic: "Descriptive complexity", type: "mc",
    prompt: "What does Problem 6.24 establish about the set of incompressible strings (those \\(x\\) with \\(K(x)\\ge|x|\\))?",
    choices: [
      "It is undecidable",
      "It is regular",
      "It is finite",
      "It is empty"
    ],
    answer: 0,
    explanation: "No algorithm decides whether a string is incompressible (Problem 6.24). Incompressible strings of every length exist (a counting argument), but they cannot be effectively recognized.",
    source: "Sipser Problem 6.24"
  },

  // ============================================================
  // Chapter 7 — Time complexity (P / NP)
  // ============================================================
  {
    id: "final-np-name-tf", chapter: 12, topic: "The class NP", type: "tf",
    prompt: "The 'N' in \\(\\mathrm{NP}\\) stands for 'non-polynomial'.",
    answer: false,
    explanation: "\\(\\mathrm{NP}\\) is nondeterministic polynomial time. Indeed \\(\\mathrm{P}\\subseteq\\mathrm{NP}\\), so \\(\\mathrm{NP}\\) contains many polynomial-time-decidable languages — it is not 'non-polynomial'.",
    source: "Sipser §7.3"
  },
  {
    id: "final-np-characterize-mc", chapter: 12, topic: "The class NP", type: "mc",
    prompt: "Which statement best characterizes the class \\(\\mathrm{NP}\\)?",
    choices: [
      "Languages whose members have polynomial-length certificates checkable by a polynomial-time verifier",
      "Languages that provably cannot be decided in polynomial time",
      "Languages decidable in deterministic exponential time but not polynomial time",
      "Languages recognized by some pushdown automaton"
    ],
    answer: 0,
    explanation: "By Def 7.18 / Thm 7.20, \\(A\\in\\mathrm{NP}\\) iff a poly-time verifier accepts \\(\\langle w,c\\rangle\\) for some poly-length certificate \\(c\\), equivalently iff a nondeterministic poly-time TM decides \\(A\\).",
    source: "Sipser Def 7.19, Thm 7.20"
  },
  {
    id: "final-p-np-pspace-order", chapter: 12, topic: "P versus NP", type: "order",
    prompt: "Place these complexity classes in order from smallest to largest in the known chain of containments.",
    items: [
      "\\(\\mathrm{P}\\)",
      "\\(\\mathrm{NP}\\)",
      "\\(\\mathrm{PSPACE}\\)",
      "\\(\\mathrm{EXPTIME}\\)"
    ],
    explanation: "The established chain is \\(\\mathrm{P}\\subseteq\\mathrm{NP}\\subseteq\\mathrm{PSPACE}\\subseteq\\mathrm{EXPTIME}\\). By the time hierarchy \\(\\mathrm{P}\\subsetneq\\mathrm{EXPTIME}\\), so at least one inclusion is proper, though which remains open.",
    source: "Sipser §7.3, §8.2"
  },
  {
    id: "final-pnp-open-tf", chapter: 12, topic: "P versus NP", type: "tf",
    prompt: "It has been proven that \\(\\mathrm{P}=\\mathrm{NP}\\).",
    answer: false,
    explanation: "Whether \\(\\mathrm{P}=\\mathrm{NP}\\) is the central open problem of the field; no language has been exhibited in \\(\\mathrm{NP}\\setminus\\mathrm{P}\\). Most researchers believe \\(\\mathrm{P}\\neq\\mathrm{NP}\\), but it is unproven.",
    source: "Sipser §7.3"
  },
  {
    id: "final-reduce-pclosure-mc", chapter: 12, topic: "Polynomial-time reducibility", type: "mc",
    prompt: "Suppose \\(A\\le_p B\\). Which implication is valid?",
    choices: [
      "If \\(B\\in\\mathrm{P}\\) then \\(A\\in\\mathrm{P}\\)",
      "If \\(A\\in\\mathrm{P}\\) then \\(B\\in\\mathrm{P}\\)",
      "If \\(A\\in\\mathrm{NP}\\) then \\(B\\in\\mathrm{P}\\)",
      "\\(A\\) and \\(B\\) must be the same language"
    ],
    answer: 0,
    explanation: "Thm 7.31: compute \\(f(w)\\) in poly time, then run \\(B\\)'s poly-time decider on \\(f(w)\\); composing polynomials stays polynomial, so \\(A\\in\\mathrm{P}\\). The reverse direction (easy \\(A\\) forcing easy \\(B\\)) does not follow.",
    source: "Sipser Thm 7.31"
  },
  {
    id: "final-cooklevin-fib", chapter: 12, topic: "Cook–Levin theorem", type: "fib",
    prompt: "The Cook–Levin theorem proves that this language is the first NP-complete problem; name it. (the satisfiability problem)",
    accept: ["SAT", "sat", "satisfiability"],
    explanation: "\\(SAT\\in\\mathrm{NP}\\), and every NP language reduces to it by encoding an accepting computation tableau as a satisfiable Boolean formula. \\(SAT\\) is NP-complete (Thm 7.37).",
    source: "Sipser Thm 7.37"
  },
  {
    id: "final-sat-iff-pnp-mc", chapter: 12, topic: "Cook–Levin theorem", type: "mc",
    prompt: "Because \\(SAT\\) is NP-complete, \\(SAT\\in\\mathrm{P}\\) holds if and only if:",
    choices: [
      "\\(\\mathrm{P}=\\mathrm{NP}\\)",
      "\\(\\mathrm{P}\\neq\\mathrm{NP}\\)",
      "\\(\\mathrm{NP}=\\mathrm{EXPTIME}\\)",
      "\\(\\mathrm{PSPACE}=\\mathrm{NP}\\)"
    ],
    answer: 0,
    explanation: "A poly-time algorithm for an NP-complete language puts all of \\(\\mathrm{NP}\\) into \\(\\mathrm{P}\\) (Thm 7.35), and conversely \\(\\mathrm{P}=\\mathrm{NP}\\) makes \\(SAT\\in\\mathrm{P}\\). Hence \\(SAT\\in\\mathrm{P}\\iff\\mathrm{P}=\\mathrm{NP}\\).",
    source: "Sipser Thm 7.27, Thm 7.35"
  },
  {
    id: "final-npc-spread-mc", chapter: 12, topic: "NP-completeness", type: "mc",
    prompt: "To prove a new language \\(C\\in\\mathrm{NP}\\) is NP-complete using a known NP-complete language \\(B\\), which reduction must you exhibit?",
    choices: [
      "\\(B\\le_p C\\) (reduce FROM the known-hard \\(B\\) TO \\(C\\))",
      "\\(C\\le_p B\\) (reduce FROM \\(C\\) TO the known-hard \\(B\\))",
      "\\(C\\le_p A\\) for some \\(A\\in\\mathrm{P}\\)",
      "\\(B\\le_p A\\) for some \\(A\\in\\mathrm{P}\\)"
    ],
    answer: 0,
    explanation: "Thm 7.36: if \\(B\\) is NP-complete, \\(C\\in\\mathrm{NP}\\), and \\(B\\le_p C\\), then \\(C\\) is NP-complete. The direction is essential — every NP language already reduces to \\(B\\), and \\(B\\le_p C\\) passes that hardness on to \\(C\\).",
    source: "Sipser Thm 7.36"
  },
  {
    id: "final-npc-strategy-order", chapter: 12, topic: "NP-completeness", type: "order",
    prompt: "Order the steps of a standard proof that a language \\(C\\) is NP-complete by reduction from a known NP-complete language \\(B\\).",
    items: [
      "Show \\(C\\in\\mathrm{NP}\\) (give a poly-time verifier / certificate)",
      "Pick a known NP-complete language \\(B\\) (often \\(3SAT\\))",
      "Construct a polynomial-time reduction \\(f\\) from \\(B\\) to \\(C\\)",
      "Prove \\(w\\in B\\iff f(w)\\in C\\)"
    ],
    explanation: "First place \\(C\\) in \\(\\mathrm{NP}\\); then reduce a known NP-complete \\(B\\) to \\(C\\) by a poly-time \\(f\\) and prove correctness in both directions. By Thm 7.36 this makes \\(C\\) NP-complete.",
    source: "Sipser §7.5"
  },
  {
    id: "final-3sat-clique-mc", chapter: 12, topic: "NP-completeness", type: "mc",
    prompt: "Which reduction is used to prove \\(CLIQUE\\) is NP-complete?",
    choices: [
      "\\(3SAT\\le_p CLIQUE\\): a \\(k\\)-clause \\(3cnf\\)-formula maps to a graph whose \\(k\\)-cliques correspond to satisfying assignments",
      "\\(CLIQUE\\le_p 3SAT\\): cliques are encoded as Boolean formulas",
      "\\(HAMPATH\\le_p CLIQUE\\): a Hamiltonian path becomes a clique",
      "\\(PATH\\le_p CLIQUE\\): \\(s\\)-\\(t\\) reachability becomes a clique"
    ],
    answer: 0,
    explanation: "Thm 7.32 reduces \\(3SAT\\) to \\(CLIQUE\\): each clause becomes a triple of literal-nodes, edges join non-contradictory literals in different triples, and a \\(k\\)-clique selects one true literal per clause. Reductions go FROM a known NP-complete problem.",
    source: "Sipser Thm 7.32"
  },
  {
    id: "final-classify-problems-multi", chapter: 12, topic: "Additional NP-complete problems", type: "multi",
    prompt: "Which of these languages are proven NP-complete in Chapter 7?",
    choices: [
      "\\(3SAT\\)",
      "\\(VERTEX\\text{-}COVER\\)",
      "\\(HAMPATH\\)",
      "\\(PATH\\)"
    ],
    answers: [0, 1, 2],
    explanation: "\\(3SAT\\) (Cor 7.42), \\(VERTEX\\text{-}COVER\\) (Thm 7.44), and \\(HAMPATH\\) (Thm 7.46) are NP-complete. \\(PATH\\in\\mathrm{P}\\) (Thm 7.14) and is believed not to be NP-complete.",
    source: "Sipser §7.4–7.5"
  },
  {
    id: "final-path-in-p-mc", chapter: 12, topic: "The class P", type: "mc",
    prompt: "Classify \\(PATH=\\{\\langle G,s,t\\rangle\\mid G\\text{ is a directed graph with a path from }s\\text{ to }t\\}\\).",
    choices: [
      "In \\(\\mathrm{P}\\) (and \\(\\mathrm{NL}\\)-complete), via breadth-first marking of nodes reachable from \\(s\\)",
      "NP-complete, via a reduction from \\(3SAT\\)",
      "Undecidable, by reduction from \\(A_{TM}\\)",
      "PSPACE-complete, via a reduction from \\(TQBF\\)"
    ],
    answer: 0,
    explanation: "Marking all nodes reachable from \\(s\\) runs in polynomial time (Thm 7.14), so \\(PATH\\in\\mathrm{P}\\); it is moreover \\(\\mathrm{NL}\\)-complete (Thm 8.25). Brute-force path enumeration would be exponential but is unnecessary.",
    source: "Sipser Thm 7.14, Thm 8.25"
  },

  // ============================================================
  // Chapter 8 — Space complexity
  // ============================================================
  {
    id: "final-savitch-mc", chapter: 12, topic: "Savitch's theorem", type: "mc",
    prompt: "Savitch's theorem states that for any function \\(f(n)\\ge n\\):",
    choices: [
      "\\(\\mathrm{NSPACE}(f(n))\\subseteq\\mathrm{SPACE}(f^2(n))\\)",
      "\\(\\mathrm{NSPACE}(f(n))\\subseteq\\mathrm{SPACE}(f(n))\\)",
      "\\(\\mathrm{NSPACE}(f(n))\\subseteq\\mathrm{SPACE}(2^{f(n)})\\)",
      "\\(\\mathrm{NTIME}(f(n))\\subseteq\\mathrm{TIME}(f^2(n))\\)"
    ],
    answer: 0,
    explanation: "Savitch converts a nondeterministic \\(f(n)\\)-space machine into a deterministic one using only \\(O(f^2(n))\\) space via the recursive \\(\\mathrm{CANYIELD}\\) procedure. Nondeterminism costs at most a squaring of space, not an exponential blowup.",
    source: "Sipser Thm 8.5"
  },
  {
    id: "final-savitch-linear-tf", chapter: 12, topic: "Savitch's theorem", type: "tf",
    prompt: "Savitch's theorem shows that removing nondeterminism from a space-bounded machine costs only a linear increase in space.",
    answer: false,
    explanation: "The cost is a squaring: \\(\\mathrm{NSPACE}(f(n))\\subseteq\\mathrm{SPACE}(f^2(n))\\). A merely linear blowup would be a far stronger, unknown result.",
    source: "Sipser Thm 8.5"
  },
  {
    id: "final-pspace-eq-npspace-tf", chapter: 12, topic: "PSPACE", type: "tf",
    prompt: "Whether \\(\\mathrm{PSPACE}=\\mathrm{NPSPACE}\\) is a major open problem, like \\(\\mathrm{P}\\) versus \\(\\mathrm{NP}\\).",
    answer: false,
    explanation: "This one is settled: Savitch gives \\(\\mathrm{NSPACE}(n^k)\\subseteq\\mathrm{SPACE}(n^{2k})\\), and the square of a polynomial is polynomial, so \\(\\mathrm{PSPACE}=\\mathrm{NPSPACE}\\) outright. Nothing is open here.",
    source: "Sipser §8.2 (after Def 8.6)"
  },
  {
    id: "final-pspace-containments-multi", chapter: 12, topic: "PSPACE", type: "multi",
    prompt: "Which containments involving \\(\\mathrm{PSPACE}\\) are known to hold?",
    choices: [
      "\\(\\mathrm{NP}\\subseteq\\mathrm{PSPACE}\\)",
      "\\(\\mathrm{coNP}\\subseteq\\mathrm{PSPACE}\\)",
      "\\(\\mathrm{PSPACE}\\subseteq\\mathrm{EXPTIME}\\)",
      "\\(\\mathrm{EXPTIME}\\subseteq\\mathrm{PSPACE}\\)"
    ],
    answers: [0, 1, 2],
    explanation: "\\(\\mathrm{NP}\\subseteq\\mathrm{PSPACE}\\); since \\(\\mathrm{PSPACE}\\) is closed under complement, \\(\\mathrm{coNP}\\subseteq\\mathrm{PSPACE}\\) too; and a space-\\(f(n)\\) machine runs in time \\(2^{O(f(n))}\\), giving \\(\\mathrm{PSPACE}\\subseteq\\mathrm{EXPTIME}\\). The reverse inclusion is not known.",
    source: "Sipser §8.2"
  },
  {
    id: "final-tqbf-fib", chapter: 12, topic: "PSPACE-completeness", type: "fib",
    prompt: "Sipser's first \\(\\mathrm{PSPACE}\\)-complete language — the set of true fully quantified Boolean formulas — is named ____.",
    accept: ["TQBF", "tqbf"],
    explanation: "\\(TQBF=\\{\\langle\\phi\\rangle\\mid\\phi\\text{ is a true fully quantified Boolean formula}\\}\\) is \\(\\mathrm{PSPACE}\\)-complete (Thm 8.9). It generalizes \\(SAT\\) by allowing \\(\\forall\\) and \\(\\exists\\) over \\(\\{0,1\\}\\).",
    source: "Sipser Thm 8.9"
  },
  {
    id: "final-pspace-complete-reduction-mc", chapter: 12, topic: "PSPACE-completeness", type: "mc",
    prompt: "\\(\\mathrm{PSPACE}\\)-completeness is defined using polynomial-time reducibility (not polynomial-space reducibility). Why?",
    choices: [
      "The reduction must be weaker than the class itself, or a fast solution to the complete problem would not transfer to the rest of the class",
      "Polynomial-space reductions are not computable",
      "Polynomial-time reductions can use more memory than polynomial-space ones",
      "\\(\\mathrm{PSPACE}\\) contains no complete problems under space reductions"
    ],
    answer: 0,
    explanation: "If the reduction were as powerful as \\(\\mathrm{PSPACE}\\) itself, an efficient algorithm for the complete problem would not yield efficient algorithms for every other \\(\\mathrm{PSPACE}\\) language. So the reduction is limited to polynomial time.",
    source: "Sipser §8.3 (Def 8.8)"
  },
  {
    id: "final-l-nl-def-multi", chapter: 12, topic: "L and NL", type: "multi",
    prompt: "Which equalities correctly define the logarithmic-space classes?",
    choices: [
      "\\(\\mathrm{L}=\\mathrm{SPACE}(\\log n)\\)",
      "\\(\\mathrm{NL}=\\mathrm{NSPACE}(\\log n)\\)",
      "\\(\\mathrm{L}=\\mathrm{SPACE}(n)\\)",
      "\\(\\mathrm{NL}=\\mathrm{NTIME}(\\log n)\\)"
    ],
    answers: [0, 1],
    explanation: "\\(\\mathrm{L}\\) is deterministic log space and \\(\\mathrm{NL}\\) is nondeterministic log space, measured on a machine with a read-only input tape and a separate work tape. Log space holds a constant number of pointers into the input.",
    source: "Sipser Def 8.17"
  },
  {
    id: "final-path-nl-complete-fib", chapter: 12, topic: "NL-completeness", type: "fib",
    prompt: "The canonical \\(\\mathrm{NL}\\)-complete problem — directed-graph \\(s\\)-\\(t\\) reachability — is named ____.",
    accept: ["PATH", "path"],
    explanation: "\\(PATH\\) is \\(\\mathrm{NL}\\)-complete (Thm 8.25): it is in \\(\\mathrm{NL}\\) (guess the next node, store only the current node), and every \\(\\mathrm{NL}\\) language log-space reduces to it via the configuration graph of its log-space NTM.",
    source: "Sipser Thm 8.25"
  },
  {
    id: "final-nl-subseteq-p-tf", chapter: 12, topic: "NL-completeness", type: "tf",
    prompt: "\\(\\mathrm{NL}\\subseteq\\mathrm{P}\\).",
    answer: true,
    explanation: "A log-space machine has only polynomially many configurations, so its configuration graph is polynomial-size and reachability is decided in poly time (Cor 8.26). Equivalently, every \\(\\mathrm{NL}\\) language reduces to \\(PATH\\in\\mathrm{P}\\).",
    source: "Sipser Cor 8.26"
  },
  {
    id: "final-nl-eq-conl-tf", chapter: 12, topic: "NL = coNL", type: "tf",
    prompt: "\\(\\mathrm{NL}=\\mathrm{coNL}\\): nondeterministic log space is closed under complement (the Immerman–Szelepcsényi theorem).",
    answer: true,
    explanation: "The proof shows \\(\\overline{PATH}\\in\\mathrm{NL}\\) by inductively counting the nodes reachable from \\(s\\); since \\(PATH\\) is \\(\\mathrm{NL}\\)-complete, every \\(\\mathrm{coNL}\\) language is then in \\(\\mathrm{NL}\\), so \\(\\mathrm{NL}=\\mathrm{coNL}\\).",
    source: "Sipser Thm 8.27"
  },
  {
    id: "final-full-class-chain-order", chapter: 12, topic: "NL = coNL", type: "order",
    prompt: "Order these classes from smallest to largest in Sipser's summary chain (treat the equal pair as a single rung).",
    items: [
      "\\(\\mathrm{L}\\)",
      "\\(\\mathrm{NL}=\\mathrm{coNL}\\)",
      "\\(\\mathrm{P}\\)",
      "\\(\\mathrm{NP}\\)",
      "\\(\\mathrm{PSPACE}\\)"
    ],
    explanation: "Sipser's summary: \\(\\mathrm{L}\\subseteq\\mathrm{NL}=\\mathrm{coNL}\\subseteq\\mathrm{P}\\subseteq\\mathrm{NP}\\subseteq\\mathrm{PSPACE}\\). Since \\(\\mathrm{NL}\\subsetneq\\mathrm{PSPACE}\\), at least one containment is proper, though which is unknown.",
    source: "Sipser §8.6 (p356)"
  },
  {
    id: "final-savitch-space-not-time-mc", chapter: 12, topic: "Space complexity", type: "mc",
    prompt: "\\(SAT\\) is \\(\\mathrm{NP}\\)-complete, yet \\(SAT\\in\\mathrm{SPACE}(n)\\) (linear space). What property of space makes this possible?",
    choices: [
      "Space can be reused: a machine tries each assignment in turn, reusing the same \\(O(n)\\) cells",
      "Space and time are interchangeable for \\(SAT\\)",
      "\\(SAT\\) has a polynomial-time algorithm that also uses linear space",
      "Linear space is enough to store all \\(2^n\\) assignments at once"
    ],
    answer: 0,
    explanation: "Machine \\(M_1\\) stores only the current assignment over the \\(m\\le n\\) variables and reuses those cells for every assignment, so \\(SAT\\in\\mathrm{SPACE}(n)\\) despite being \\(\\mathrm{NP}\\)-complete. Unlike time, space is reusable.",
    source: "Sipser Ex 8.3"
  },

  // ============================================================
  // ====  ASSIGNED PROBLEMS (explicit coverage)  ===============
  // ====  Ch7: 7.1–7.12 (excl 7.6,7.7,7.11b), 7.20, 7.29  ======
  // ====  Ch8: 8.1–8.3, 8.8, 8.9 · suppl 5.30, 6.24  ===========
  // ====  review 1.46, 2.47, 3.13, 4.15  =======================
  // ============================================================
  {
    id: "final-asg-71-bigo", chapter: 12, topic: "Big-O / small-o", type: "multi",
    prompt: "**(Exercise 7.1)** Which of these big-O claims are **true**?",
    choices: [
      "\\(2n = O(n)\\)",
      "\\(n\\log n = O(n^2)\\)",
      "\\(3^n = 2^{O(n)}\\)",
      "\\(n^2 = O(n)\\)",
      "\\(n^2 = O(n\\log^2 n)\\)"
    ],
    answers: [0, 1, 2],
    explanation: "\\(2n\\le 2\\cdot n\\); \\(n\\log n\\le n\\cdot n\\); and \\(3^n=2^{n\\log_2 3}=2^{O(n)}\\). The false ones: \\(n^2\\) grows faster than both \\(n\\) and \\(n\\log^2 n\\).",
    source: "Sipser Exercise 7.1"
  },
  {
    id: "final-asg-72-smallo", chapter: 12, topic: "Big-O / small-o", type: "multi",
    prompt: "**(Exercise 7.2)** Which of these small-o claims are **true**?",
    choices: [
      "\\(2n = o(n^2)\\)",
      "\\(2^n = o(3^n)\\)",
      "\\(1 = o(n)\\)",
      "\\(n = o(2n)\\)",
      "\\(n = o(\\log n)\\)"
    ],
    answers: [0, 1, 2],
    explanation: "Small-o needs the ratio \\(\\to 0\\): \\(2n/n^2\\to0\\), \\((2/3)^n\\to0\\), \\(1/n\\to0\\). False: \\(n/2n\\to\\tfrac12\\neq0\\), and \\(n/\\log n\\to\\infty\\).",
    source: "Sipser Exercise 7.2"
  },
  {
    id: "final-asg-73-relprime", chapter: 12, topic: "The class P", type: "mc",
    prompt: "**(Exercise 7.3)** Using the Euclidean algorithm, which pair is **relatively prime** (\\(\\gcd=1\\))?",
    choices: [
      "\\(1274\\) and \\(10505\\)",
      "\\(7289\\) and \\(8029\\)",
      "both pairs",
      "neither pair"
    ],
    answer: 0,
    explanation: "\\(\\gcd(1274,10505)=1\\) (relatively prime). But \\(\\gcd(7289,8029)=37\\) (\\(7289=37\\cdot197,\\ 8029=37\\cdot217\\)), so the second pair is NOT relatively prime. \\(RELPRIME\\in\\mathrm{P}\\) because Euclid's algorithm runs in polynomial time.",
    source: "Sipser Exercise 7.3"
  },
  {
    id: "final-asg-74-cyk", chapter: 12, topic: "The class P", type: "mc",
    prompt: "**(Exercise 7.4 / Thm 7.16)** The polynomial-time algorithm deciding whether a CFG \\(G\\) (in Chomsky normal form) generates a string \\(w\\) works by:",
    choices: [
      "dynamic programming — filling a table of which variables generate each substring of \\(w\\), built up from length-1 substrings to all of \\(w\\)",
      "trying every derivation of \\(G\\) until one yields \\(w\\)",
      "converting \\(G\\) to a DFA and simulating it",
      "applying the pumping lemma to \\(w\\)"
    ],
    answer: 0,
    explanation: "The CYK-style table \\(T[i,j]\\) records the variables deriving \\(w_i\\cdots w_j\\), combining shorter spans via rules \\(A\\to BC\\); it runs in \\(O(n^3)\\). Brute-force derivation search is exponential.",
    source: "Sipser Exercise 7.4"
  },
  {
    id: "final-asg-75-sat", chapter: 12, topic: "The class NP", type: "mc",
    prompt: "**(Exercise 7.5)** Is \\((x\\vee y)\\wedge(x\\vee\\bar y)\\wedge(\\bar x\\vee y)\\wedge(\\bar x\\vee\\bar y)\\) satisfiable?",
    choices: [
      "No — the four clauses rule out all combinations of \\(x,y\\), so every assignment falsifies one",
      "Yes, with \\(x=1,\\ y=1\\)",
      "Yes, with \\(x=0,\\ y=0\\)",
      "Yes, with \\(x=1,\\ y=0\\)"
    ],
    answer: 0,
    explanation: "If \\(x=1\\): \\((\\bar x\\vee y)=y\\) and \\((\\bar x\\vee\\bar y)=\\bar y\\) force \\(y\\) and \\(\\bar y\\) — impossible. If \\(x=0\\): \\((x\\vee y)=y\\) and \\((x\\vee\\bar y)=\\bar y\\) — impossible. Unsatisfiable.",
    source: "Sipser Exercise 7.5"
  },
  {
    id: "final-asg-78-connected", chapter: 12, topic: "The class P", type: "mc",
    prompt: "**(Exercise 7.8)** Why is \\(CONNECTED=\\{\\langle G\\rangle\\mid G\\text{ is a connected undirected graph}\\}\\in\\mathrm{P}\\)?",
    choices: [
      "Mark one node, then repeatedly mark any node adjacent to a marked node; \\(G\\) is connected iff every node ends up marked — polynomial time",
      "Connectivity requires examining all \\(2^n\\) subsets of nodes",
      "It is undecidable, so not in \\(\\mathrm{P}\\)",
      "Only by reducing it to \\(SAT\\)"
    ],
    answer: 0,
    explanation: "The marking (reachability / BFS-DFS) algorithm runs in polynomial time, and \\(G\\) is connected exactly when every node is reachable from the start (Sipser p.185).",
    source: "Sipser Exercise 7.8"
  },
  {
    id: "final-asg-79-triangle", chapter: 12, topic: "The class P", type: "mc",
    prompt: "**(Exercise 7.9)** \\(TRIANGLE=\\{\\langle G\\rangle\\mid G\\text{ contains a triangle (3-clique)}\\}\\) is in \\(\\mathrm{P}\\) because a decider can:",
    choices: [
      "check all \\(\\binom{n}{3}=O(n^3)\\) triples of nodes for three mutual edges",
      "try all \\(2^n\\) subsets of nodes",
      "use the pumping lemma",
      "it isn't — \\(TRIANGLE\\) is NP-complete"
    ],
    answer: 0,
    explanation: "Brute force over node triples is \\(O(n^3)\\), polynomial. (Finding a clique of variable size \\(k\\) is the NP-complete \\(CLIQUE\\); a fixed size 3 is easy.)",
    source: "Sipser Exercise 7.9"
  },
  {
    id: "final-asg-710-alldfa", chapter: 12, topic: "The class P", type: "mc",
    prompt: "**(Exercise 7.10; \\(ALL_{DFA}\\) from Ex 4.3)** \\(ALL_{DFA}=\\{\\langle A\\rangle\\mid A\\text{ a DFA},\\ L(A)=\\Sigma^*\\}\\). A polynomial-time decider:",
    choices: [
      "checks that every state reachable from the start is an accept state (a reachable non-accepting state means some string is rejected)",
      "converts \\(A\\) into an NFA first",
      "enumerates all strings and tests acceptance",
      "cannot exist — \\(ALL_{DFA}\\) is not in \\(\\mathrm{P}\\)"
    ],
    answer: 0,
    explanation: "\\(L(A)=\\Sigma^*\\) iff no reachable state is non-accepting; reachability plus a scan is polynomial. (For NFAs, \\(ALL_{NFA}\\) is PSPACE-complete — far harder.)",
    source: "Sipser Exercise 7.10 (ALL_DFA, Ex 4.3)"
  },
  {
    id: "final-asg-711-eqdfa", chapter: 12, topic: "The class P", type: "mc",
    prompt: "**(Exercise 7.11a)** Why is \\(EQ_{DFA}=\\{\\langle A,B\\rangle\\mid L(A)=L(B)\\}\\in\\mathrm{P}\\)?",
    choices: [
      "Build a DFA for the symmetric difference \\((L(A)\\cap\\overline{L(B)})\\cup(\\overline{L(A)}\\cap L(B))\\) and test it for emptiness — all polynomial time",
      "DFA equivalence is undecidable",
      "Only by minimizing both DFAs, which takes exponential time",
      "Reduce it to \\(A_{TM}\\)"
    ],
    answer: 0,
    explanation: "The product DFA for the symmetric difference is polynomial size, and emptiness (can any accept state be reached?) is polynomial. \\(L(A)=L(B)\\) iff that symmetric difference is empty. (\\(EQ_{NFA}\\) is not known to be in \\(\\mathrm{P}\\).)",
    source: "Sipser Exercise 7.11(a)"
  },
  {
    id: "final-asg-712-iso", chapter: 12, topic: "The class NP", type: "mc",
    prompt: "**(Exercise 7.12)** \\(ISO=\\{\\langle G,H\\rangle\\mid G,H\\text{ are isomorphic graphs}\\}\\) is in \\(\\mathrm{NP}\\) because:",
    choices: [
      "a certificate is a reordering (bijection) of \\(G\\)'s nodes onto \\(H\\)'s; verifying it preserves every edge takes polynomial time",
      "graph isomorphism is solvable in polynomial time",
      "\\(ISO\\) is NP-complete",
      "isomorphism is undecidable"
    ],
    answer: 0,
    explanation: "Guess the node permutation (the certificate) and check edges map correctly in poly time \\(\\Rightarrow ISO\\in\\mathrm{NP}\\). (Whether \\(ISO\\in\\mathrm{P}\\) is famously open, and it is not known to be NP-complete.)",
    source: "Sipser Exercise 7.12"
  },
  {
    id: "final-asg-720-path", chapter: 12, topic: "NP-completeness", type: "mc",
    prompt: "**(Exercise 7.20)** We believe \\(PATH\\) (directed \\(s\\)–\\(t\\) reachability) is not NP-complete. Proving \\(PATH\\) is **not** NP-complete would prove:",
    choices: [
      "\\(\\mathrm{P}\\neq\\mathrm{NP}\\)",
      "\\(\\mathrm{P}=\\mathrm{NP}\\)",
      "\\(PATH\\notin\\mathrm{P}\\)",
      "nothing about \\(\\mathrm{P}\\) vs \\(\\mathrm{NP}\\)"
    ],
    answer: 0,
    explanation: "\\(PATH\\in\\mathrm{P}\\). If \\(\\mathrm{P}=\\mathrm{NP}\\), then every nontrivial language in \\(\\mathrm{NP}\\) — including \\(PATH\\) — would be NP-complete. So \\(PATH\\) not NP-complete forces \\(\\mathrm{P}\\neq\\mathrm{NP}\\).",
    source: "Sipser Exercise 7.20"
  },
  {
    id: "final-asg-729-3color", chapter: 12, topic: "NP-completeness", type: "mc",
    prompt: "**(Exercise 7.29)** \\(3COLOR=\\{\\langle G\\rangle\\mid G\\text{ is 3-colorable}\\}\\). Its status is:",
    choices: [
      "NP-complete — in \\(\\mathrm{NP}\\) via a coloring certificate, and NP-hard by reduction from \\(3SAT\\) using gadget subgraphs",
      "in \\(\\mathrm{P}\\), by a greedy coloring",
      "undecidable",
      "in \\(\\mathrm{NP}\\) but not NP-complete"
    ],
    answer: 0,
    explanation: "\\(3COLOR\\in\\mathrm{NP}\\) (guess and check a 3-coloring) and is NP-hard via \\(3SAT\\) with variable/clause gadgets. (2-coloring = bipartiteness IS in \\(\\mathrm{P}\\); jumping to 3 colors makes it hard.)",
    source: "Sipser Exercise 7.29"
  },
  {
    id: "final-asg-81-space-model", chapter: 12, topic: "Space complexity", type: "mc",
    prompt: "**(Exercise 8.1)** For \\(f(n)\\ge n\\), why is \\(\\mathrm{SPACE}(f(n))\\) the same whether defined with a single-tape TM or a two-tape (read-only input + read/write work tape) TM?",
    choices: [
      "Each model simulates the other with only a constant-factor change in work space, so they capture the same languages",
      "The two-tape model is strictly more powerful",
      "They differ by an exponential factor",
      "Only the input tape's cells count as space"
    ],
    answer: 0,
    explanation: "One tape can hold the input and the work contents together (constant-factor overhead), and the two-tape model trivially simulates one tape; space differs by \\(O(1)\\). (The read-only-input model matters for sublinear space like \\(\\log n\\), where you must not count the input.)",
    source: "Sipser Exercise 8.1"
  },
  {
    id: "final-asg-82-tictactoe", chapter: 12, topic: "PSPACE-completeness", type: "mc",
    prompt: "**(Exercise 8.2)** How do you determine whether a player has a winning strategy from a given game position (e.g. tic-tac-toe)?",
    choices: [
      "Recursively evaluate the game tree (minimax): the position wins for the mover iff some move leads to a position from which the opponent has no winning reply",
      "Apply a single fixed rule to the current board",
      "Use the pumping lemma",
      "It is undecidable in general"
    ],
    answer: 0,
    explanation: "Winning strategies are computed by recursing on the game tree. For board games generalized to \\(n\\times n\\), this recursion runs in polynomial space, placing such games in \\(\\mathrm{PSPACE}\\).",
    source: "Sipser Exercise 8.2"
  },
  {
    id: "final-asg-83-geography", chapter: 12, topic: "PSPACE-completeness", type: "mc",
    prompt: "**(Exercise 8.3)** In generalized geography, players alternately extend a simple path in a directed graph from the start node; a player who cannot move loses. The player to move from node \\(v\\) has a winning strategy iff:",
    choices: [
      "some out-edge of \\(v\\) leads to an unused node from which the opponent has NO winning strategy",
      "\\(v\\) has even out-degree",
      "\\(v\\) can reach the largest node",
      "the graph is acyclic"
    ],
    answer: 0,
    explanation: "This is the recursive (poly-space) win condition for the game; it decides who wins. Generalized geography is in fact \\(\\mathrm{PSPACE}\\)-complete (reduction from \\(FORMULA\\text{-}GAME\\)).",
    source: "Sipser Exercise 8.3"
  },
  {
    id: "final-asg-88-eqrex", chapter: 12, topic: "PSPACE", type: "mc",
    prompt: "**(Exercise 8.8)** Why is \\(EQ_{REX}=\\{\\langle R,S\\rangle\\mid R,S\\text{ are equivalent regular expressions}\\}\\in\\mathrm{PSPACE}\\)?",
    choices: [
      "Convert \\(R,S\\) to NFAs and search for a distinguishing string, tracking the active state-SETS of both on the fly in polynomial space (then use \\(\\mathrm{NPSPACE}=\\mathrm{PSPACE}\\))",
      "Regular-expression equivalence is undecidable",
      "It needs exponential space to store the equivalent DFAs",
      "Only by first reducing it to \\(TQBF\\)"
    ],
    answer: 0,
    explanation: "Inequivalence is in \\(\\mathrm{NPSPACE}\\): nondeterministically guess a string accepted by one NFA but not the other, keeping only each NFA's current subset of states (polynomial space). By Savitch \\(\\mathrm{NPSPACE}=\\mathrm{PSPACE}\\), which is closed under complement. Storing full DFAs would be exponential.",
    source: "Sipser Exercise 8.8"
  },
  {
    id: "final-asg-89-ladder", chapter: 12, topic: "Savitch's theorem", type: "mc",
    prompt: "**(Exercise 8.9)** \\(LADDER_{DFA}=\\{\\langle M,s,t\\rangle\\mid M\\text{ a DFA},\\ L(M)\\text{ has a ladder }s\\to t\\text{ (each step changes one symbol)}\\}\\) is in \\(\\mathrm{PSPACE}\\) because:",
    choices: [
      "it asks for reachability \\(s\\to t\\) in the (exponentially large) graph of equal-length strings in \\(L(M)\\), and reachability is solvable in polynomial space via Savitch's recursive midpoint test",
      "the ladder is found by one left-to-right scan",
      "it is undecidable",
      "it needs only logarithmic space"
    ],
    answer: 0,
    explanation: "Nodes are the length-\\(|s|\\) strings in \\(L(M)\\); edges join strings differing in one position. \"Is there a path \\(s\\to t\\)?\" is reachability in a graph of size \\(2^{O(|s|)}\\), decidable in polynomial space by the \\(CANYIELD\\)-style midpoint recursion (\\(\\mathrm{NPSPACE}=\\mathrm{PSPACE}\\)).",
    source: "Sipser Exercise 8.9"
  },
  {
    id: "final-asg-530-rice", chapter: 12, topic: "Rice's theorem", type: "multi",
    prompt: "**(Exercise 5.30 — supplemental)** By Rice's theorem, which of these are **undecidable**?",
    choices: [
      "\\(INFINITE_{TM}=\\{\\langle M\\rangle\\mid L(M)\\text{ is infinite}\\}\\)",
      "\\(\\{\\langle M\\rangle\\mid 1011\\in L(M)\\}\\)",
      "\\(ALL_{TM}=\\{\\langle M\\rangle\\mid L(M)=\\Sigma^*\\}\\)",
      "\\(\\{\\langle M\\rangle\\mid M\\text{ has at least 5 states}\\}\\)"
    ],
    answers: [0, 1, 2],
    explanation: "Rice's theorem: every nontrivial property of \\(L(M)\\) is undecidable. \"Infinite,\" \"contains \\(1011\\),\" and \"\\(=\\Sigma^*\\)\" are nontrivial language properties. \"\\(\\ge 5\\) states\" is a syntactic property of the machine (not of \\(L(M)\\)) — decidable.",
    source: "Sipser Exercise 5.30 (Rice's theorem, Problem 5.28)"
  },
  {
    id: "final-asg-146-nonregular", chapter: 12, topic: "Pumping lemma", type: "multi",
    prompt: "**(Review 1.46)** Which of these languages are **not regular**?",
    choices: [
      "\\(\\{0^n1^m0^n\\mid m,n\\ge 0\\}\\)",
      "\\(\\{0^m1^n\\mid m\\neq n\\}\\)",
      "\\(\\{w\\in\\{0,1\\}^*\\mid w\\text{ is not a palindrome}\\}\\)",
      "\\(\\{w\\mid w\\text{ contains the substring }01\\}\\)"
    ],
    answers: [0, 1, 2],
    explanation: "All three are nonregular (pumping lemma + closure properties — Problem 1.46). E.g. if \\(\\{0^m1^n\\mid m\\neq n\\}\\) were regular, its complement intersected with \\(0^*1^*\\) would give the nonregular \\(\\{0^k1^k\\}\\). \"Contains \\(01\\)\" is regular.",
    source: "Sipser Review 1.46"
  },
  {
    id: "final-asg-247-secondhalf", chapter: 12, topic: "Pushdown automata", type: "mc",
    prompt: "**(Review 2.47)** Let \\(B=\\{uv\\mid u,v\\in\\Sigma^*,\\ v\\in\\Sigma^*1\\Sigma^*,\\ |u|\\ge|v|\\}\\) — strings with at least one \\(1\\) in their second half. Which is true?",
    choices: [
      "\\(B\\) is context-free: a PDA pushes a symbol per first-half character, pops while scanning the second half, and nondeterministically verifies a \\(1\\) appears in the second half",
      "\\(B\\) is regular",
      "\\(B\\) is not context-free",
      "\\(B\\) is undecidable"
    ],
    answer: 0,
    explanation: "Problem 2.47 asks for a PDA and a CFG, so \\(B\\) is context-free. The stack marks the midpoint (\\(|u|\\ge|v|\\)) and nondeterminism guesses the position of a \\(1\\) in the second half.",
    source: "Sipser Review 2.47"
  },
  {
    id: "final-asg-313-rs-tm", chapter: 12, topic: "TM variants", type: "mc",
    prompt: "**(Review 3.13)** A Turing-machine variant whose head can only move **Right** or **Stay** (\\(\\delta:Q\\times\\Gamma\\to Q\\times\\Gamma\\times\\{R,S\\}\\)) — never Left — recognizes exactly which class of languages?",
    choices: [
      "the regular languages",
      "the context-free languages",
      "the decidable languages",
      "all Turing-recognizable languages"
    ],
    answer: 0,
    explanation: "With no left moves the head only advances; \"stay\" lets it pause on a cell, but it can never return to use information written earlier. Such a one-way machine has only its finite control as memory, so it is no stronger than a finite automaton — it recognizes exactly the regular languages.",
    source: "Sipser Review 3.13"
  },
  {
    id: "final-asg-415-cfg-1star", chapter: 12, topic: "Decidable: context-free languages", type: "mc",
    prompt: "**(Review 4.15)** Is \\(\\{\\langle G\\rangle\\mid G\\text{ is a CFG over }\\{0,1\\}\\text{ and }1^*\\subseteq L(G)\\}\\) decidable?",
    choices: [
      "Yes — \\(L(G)\\cap 1^*\\) is a CFL over the single symbol \\(1\\), hence regular; then decide whether that regular language equals \\(1^*\\)",
      "No — it reduces to \\(ALL_{CFG}\\), which is undecidable",
      "No — containment between a regular set and a CFL is undecidable in general",
      "Yes — because every context-free language is regular"
    ],
    answer: 0,
    explanation: "Key fact: a context-free language over a ONE-letter alphabet is regular. So \\(L(G)\\cap 1^*\\) is regular, and \"does a regular language contain all of \\(1^*\\)?\" is decidable. Restricting to \\(1^*\\) collapses the hard \\(ALL_{CFG}\\)/containment problem to the regular case.",
    source: "Sipser Review 4.15"
  }
]);
