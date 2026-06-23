/* Final distractor pools (Ch 6-8 checkpoint) — each option UNAMBIGUOUSLY WRONG
   for its question. Keyed by exact question id. The app samples a varying subset
   of wrong options each render, so a question can't be answered by position.
   Correctness notes mirror the final scope: the recursion theorem grants
   self-reference (it does NOT make undecidable problems decidable); \(\le_m\)
   implies \(\le_T\) but not conversely; \(\mathrm{NP}\) = nondeterministic poly
   time (NOT "non-polynomial"); to prove \(C\) NP-complete reduce a known-hard
   \(B\) TO \(C\) (\(B\le_p C\)); reductions transfer EASINESS along the arrow
   (\(B\in\mathrm{P}\Rightarrow A\in\mathrm{P}\) when \(A\le_p B\)); Savitch costs
   a squaring of space; \(PATH\in\mathrm{P}\) and is \(\mathrm{NL}\)-complete. */
TOC.addPools({
  // ============================================================
  // Chapter 6 — Advanced computability
  // ============================================================
  "final-recursion-meaning-mc": [
    "A Turing machine can decide whether an arbitrary program halts on a given input",
    "Every Turing-recognizable language becomes decidable once self-reference is allowed",
    "No Turing machine can ever obtain or refer to its own description",
    "A computable function always equals its own least fixed point"
  ],
  "final-atm-recursion-proof-mc": [
    "Halts and prints \\(\\langle B\\rangle\\) without ever running \\(H\\)",
    "Replaces \\(H\\) with a decider for \\(\\overline{A_{TM}}\\) and accepts",
    "Runs \\(H\\) on \\(\\langle H,w\\rangle\\) instead of \\(\\langle B,w\\rangle\\)",
    "Rejects every input, so \\(H\\) is never consulted"
  ],
  "final-fixedpoint-mc": [
    "\\(F\\) is the unique machine whose description \\(t\\) leaves unchanged",
    "\\(t(\\langle F\\rangle)\\) describes a machine that disagrees with \\(F\\) on every input",
    "\\(t\\) must be the identity transformation for \\(F\\) to exist",
    "\\(F\\) computes \\(t\\) itself, so \\(\\langle F\\rangle=\\langle t\\rangle\\)"
  ],
  "final-turing-vs-mapping-mc": [
    "\\(A\\le_T B\\) implies \\(A\\le_m B\\), but \\(\\le_m\\) does not imply \\(\\le_T\\)",
    "\\(\\le_T\\) is strictly weaker than \\(\\le_m\\): some \\(\\le_m\\)-reductions are not oracle reductions",
    "If \\(A\\le_T B\\) and \\(B\\) is recognizable then \\(A\\) is recognizable",
    "\\(A\\le_m B\\) holds iff \\(A\\le_T B\\) holds, for every pair of languages"
  ],
  "final-incompressible-undecidable-mc": [
    "It is decidable",
    "It is Turing-recognizable but not decidable",
    "It is context-free",
    "It contains only finitely many strings of each length"
  ],

  // ============================================================
  // Chapter 7 — Time complexity (P / NP)
  // ============================================================
  "final-np-characterize-mc": [
    "Languages that cannot be decided in polynomial time (the 'non-polynomial' languages)",
    "Languages decidable by a nondeterministic TM using exponential time",
    "Languages whose certificates require exponential length to write down",
    "Languages closed under polynomial-time reductions but not in \\(\\mathrm{P}\\)"
  ],
  "final-reduce-pclosure-mc": [
    "If \\(A\\) is NP-complete then \\(B\\) is NP-complete",
    "If \\(B\\in\\mathrm{NP}\\) then \\(A\\in\\mathrm{P}\\)",
    "If \\(B\\) is undecidable then \\(A\\) is decidable",
    "If \\(A\\notin\\mathrm{P}\\) then \\(B\\notin\\mathrm{P}\\)"
  ],
  "final-sat-iff-pnp-mc": [
    "\\(\\mathrm{NP}=\\mathrm{coNP}\\)",
    "\\(\\mathrm{P}=\\mathrm{PSPACE}\\)",
    "\\(\\mathrm{NP}\\subsetneq\\mathrm{EXPTIME}\\)",
    "\\(\\mathrm{NP}=\\mathrm{PSPACE}\\)"
  ],
  "final-npc-spread-mc": [
    "\\(C\\le_p B\\) and \\(B\\le_p C\\) (mutual reductions)",
    "\\(B\\le_T C\\) (a Turing reduction from \\(B\\) to \\(C\\))",
    "\\(C\\le_p A\\) for every \\(A\\in\\mathrm{NP}\\)",
    "\\(C\\le_m B\\) (a mapping reduction from \\(C\\) to \\(B\\))"
  ],
  "final-3sat-clique-mc": [
    "\\(CLIQUE\\le_p 3SAT\\): a \\(k\\)-clique is encoded as a satisfiable \\(3cnf\\)-formula",
    "\\(VERTEX\\text{-}COVER\\le_p CLIQUE\\): a cover of size \\(k\\) becomes a clique of size \\(k\\)",
    "\\(SAT\\le_p CLIQUE\\) directly, bypassing \\(3SAT\\) and the clause-triple gadget",
    "\\(CLIQUE\\le_p CLIQUE\\): the problem is complete because it reduces to itself"
  ],
  "final-classify-problems-multi": [
    "\\(2SAT\\)",
    "\\(EQ_{DFA}\\)",
    "\\(A_{TM}\\)",
    "\\(E_{CFG}\\)"
  ],
  "final-path-in-p-mc": [
    "NP-complete, via a reduction from \\(HAMPATH\\)",
    "\\(\\mathrm{NP}\\)-hard but not known to be in \\(\\mathrm{NP}\\)",
    "Decidable but not in \\(\\mathrm{P}\\), requiring exponential path enumeration",
    "\\(\\mathrm{PSPACE}\\)-complete, since reachability needs polynomial space"
  ],

  // ============================================================
  // Chapter 8 — Space complexity
  // ============================================================
  "final-savitch-mc": [
    "\\(\\mathrm{NSPACE}(f(n))\\subseteq\\mathrm{SPACE}(\\log f(n))\\)",
    "\\(\\mathrm{NSPACE}(f(n))\\subseteq\\mathrm{SPACE}(f(n)\\log f(n))\\)",
    "\\(\\mathrm{NSPACE}(f(n))=\\mathrm{SPACE}(f(n))\\) for all \\(f(n)\\ge n\\)",
    "\\(\\mathrm{NSPACE}(f(n))\\subseteq\\mathrm{SPACE}(2^{f^2(n)})\\)"
  ],
  "final-pspace-containments-multi": [
    "\\(\\mathrm{PSPACE}\\subseteq\\mathrm{P}\\)",
    "\\(\\mathrm{PSPACE}\\subseteq\\mathrm{NP}\\)",
    "\\(\\mathrm{EXPTIME}\\subseteq\\mathrm{NP}\\)",
    "\\(\\mathrm{EXPTIME}\\subseteq\\mathrm{PSPACE}\\) is known to hold"
  ],
  "final-pspace-complete-reduction-mc": [
    "A polynomial-time reduction can use more memory than a polynomial-space one",
    "\\(\\mathrm{PSPACE}\\) has no complete problems under any reduction",
    "Polynomial-time and polynomial-space reductions are equally powerful, so either works",
    "Polynomial-time reductions are required because \\(\\mathrm{PSPACE}\\subseteq\\mathrm{P}\\)"
  ],
  "final-l-nl-def-multi": [
    "\\(\\mathrm{NL}=\\mathrm{NSPACE}(n)\\)",
    "\\(\\mathrm{L}=\\mathrm{SPACE}(\\log^2 n)\\)",
    "\\(\\mathrm{L}=\\mathrm{TIME}(\\log n)\\)",
    "\\(\\mathrm{NL}=\\mathrm{SPACE}(\\log n)\\)"
  ],
  "final-savitch-space-not-time-mc": [
    "Time can also be reused, so \\(SAT\\) is in \\(\\mathrm{TIME}(n)\\) as well",
    "Linear space suffices to store all \\(2^n\\) assignments simultaneously",
    "\\(SAT\\) has a known polynomial-time algorithm that also uses linear space",
    "Nondeterminism lets the machine guess the satisfying assignment in \\(O(n)\\) space"
  ]
});
