/* Chapter 8 — Space Complexity (Sipser 8.1–8.6).
   SPACE / NSPACE, Savitch's theorem, PSPACE = NPSPACE, PSPACE-completeness
   (TQBF, games), the sublinear classes L and NL, log-space reducibility,
   PATH is NL-complete, NL ⊆ P, and NL = coNL (Immerman–Szelepcsényi). */
TOC.addQuestions([
  // ---- Space complexity: definitions, SPACE / NSPACE ----
  {
    id: "ch8-def-space-measure", chapter: 8, topic: "Space complexity", type: "mc",
    prompt: "For a deterministic TM \\(M\\) that halts on all inputs, the space complexity \\(f(n)\\) is defined as:",
    choices: [
      "the maximum number of tape cells \\(M\\) scans on any input of length \\(n\\)",
      "the maximum number of steps \\(M\\) takes on any input of length \\(n\\)",
      "the number of states in \\(M\\)'s control",
      "the total number of tape cells \\(M\\) ever scans over all inputs"
    ],
    answer: 0,
    explanation: "Space complexity counts the worst-case number of tape cells scanned over inputs of length \\(n\\) — a high-water mark of memory used, not time. Cells can be reused, which is what makes space more reusable than time.",
    source: "Sipser Def 8.1"
  },
  {
    id: "ch8-sat-space-bound", chapter: 8, topic: "Space complexity", type: "fib",
    prompt: "Trying all truth assignments one at a time and reusing the tape shows \\(SAT\\in\\mathrm{SPACE}(f(n))\\) for which \\(f(n)\\)? Give the tightest standard bound (e.g. \\(n\\), \\(n^2\\), \\(2^n\\)).",
    accept: ["n", "O(n)", "linear", "cn", "n^1"],
    explanation: "Machine \\(M_1\\) stores only the current assignment over the \\(m\\le n\\) variables, reusing those \\(O(m)\\) cells for every assignment, so \\(SAT\\in\\mathrm{SPACE}(n)\\) — linear space — even though \\(SAT\\) is \\(\\mathrm{NP}\\)-complete. Space, unlike time, can be reused.",
    source: "Sipser Ex 8.3"
  },
  {
    id: "ch8-allnfa-complement", chapter: 8, topic: "Space complexity", type: "mc",
    prompt: "For \\(ALL_{NFA}=\\{\\langle A\\rangle\\mid A \\text{ is an NFA and } L(A)=\\Sigma^*\\}\\), Sipser gives a nondeterministic linear-space algorithm. What does that algorithm decide?",
    choices: [
      "the complement \\(\\overline{ALL_{NFA}}\\), by guessing a rejected string and tracking the set of active states",
      "\\(ALL_{NFA}\\) directly, by checking all strings up to length \\(2^q\\)",
      "whether the NFA is deterministic",
      "whether \\(L(A)=\\emptyset\\)"
    ],
    answer: 0,
    explanation: "The NTM guesses a string \\(A\\) rejects and keeps a marker on each currently-active state (linear space), so it decides \\(\\overline{ALL_{NFA}}\\in\\mathrm{NSPACE}(n)\\). This language is not known to be in \\(\\mathrm{NP}\\) or \\(\\mathrm{coNP}\\).",
    source: "Sipser Ex 8.4"
  },

  // ---- Savitch's theorem ----
  {
    id: "ch8-savitch-statement", chapter: 8, topic: "Savitch's theorem", type: "mc",
    prompt: "Savitch's theorem states that for any function \\(f(n)\\ge n\\):",
    choices: [
      "\\(\\mathrm{NSPACE}(f(n))\\subseteq\\mathrm{SPACE}(f^2(n))\\)",
      "\\(\\mathrm{NSPACE}(f(n))\\subseteq\\mathrm{SPACE}(f(n))\\)",
      "\\(\\mathrm{NSPACE}(f(n))\\subseteq\\mathrm{SPACE}(2^{f(n)})\\)",
      "\\(\\mathrm{NTIME}(f(n))\\subseteq\\mathrm{TIME}(f^2(n))\\)"
    ],
    answer: 0,
    explanation: "Savitch's theorem converts a nondeterministic \\(f(n)\\)-space machine into a deterministic one using \\(O(f^2(n))\\) space: nondeterminism costs at most a squaring of space, not an exponential blowup.",
    source: "Sipser Thm 8.5"
  },
  {
    id: "ch8-savitch-blowup-linear", chapter: 8, topic: "Savitch's theorem", type: "tf",
    prompt: "Savitch's theorem shows that removing nondeterminism costs only a **linear** increase in space.",
    answer: false,
    explanation: "The cost is a **squaring**: \\(\\mathrm{NSPACE}(f(n))\\subseteq\\mathrm{SPACE}(f^2(n))\\). A linear blowup would be a much stronger (unknown) result.",
    source: "Sipser Thm 8.5"
  },
  {
    id: "ch8-savitch-procedure", chapter: 8, topic: "Savitch's theorem", type: "fib",
    prompt: "The recursive yieldability/reachability procedure at the heart of Savitch's theorem, which tests whether one configuration can reach another within \\(t\\) steps, is named ____.",
    accept: ["CANYIELD", "CAN-YIELD", "canyield", "can yield"],
    explanation: "\\(\\mathrm{CANYIELD}(c_1,c_2,t)\\) recurses on a midpoint \\(c_m\\), checking \\(c_1\\to c_m\\) and \\(c_m\\to c_2\\) each in \\(t/2\\) steps, and reuses the same space for both halves.",
    source: "Sipser Thm 8.5 (proof)"
  },
  {
    id: "ch8-savitch-logn", chapter: 8, topic: "Savitch's theorem", type: "tf",
    prompt: "Savitch's theorem extends to sublinear bounds: it holds whenever \\(f(n)\\ge\\log n\\), so in particular \\(\\mathrm{NL}\\subseteq\\mathrm{SPACE}(\\log^2 n)\\).",
    answer: true,
    explanation: "Using the read-only input tape and configurations of \\(N\\) on \\(w\\) (which take \\(\\log n + O(f(n))\\) space to store), the proof goes through for \\(f(n)\\ge\\log n\\). Taking \\(f(n)=\\log n\\) gives \\(\\mathrm{NL}\\subseteq\\mathrm{SPACE}(\\log^2 n)\\).",
    source: "Sipser Thm 8.5 (p351 note)"
  },

  // ---- PSPACE = NPSPACE and class relationships ----
  {
    id: "ch8-pspace-def", chapter: 8, topic: "PSPACE", type: "mc",
    prompt: "The class \\(\\mathrm{PSPACE}\\) is defined as:",
    choices: [
      "\\(\\bigcup_k \\mathrm{SPACE}(n^k)\\) — languages decidable in polynomial space deterministically",
      "\\(\\bigcup_k \\mathrm{TIME}(n^k)\\) — languages decidable in polynomial time",
      "\\(\\mathrm{SPACE}(2^n)\\)",
      "the class of languages decidable in polynomial space nondeterministically only"
    ],
    answer: 0,
    explanation: "\\(\\mathrm{PSPACE}=\\bigcup_k\\mathrm{SPACE}(n^k)\\): everything decidable in polynomial space on a deterministic TM.",
    source: "Sipser Def 8.6"
  },
  {
    id: "ch8-pspace-eq-npspace", chapter: 8, topic: "PSPACE", type: "tf",
    prompt: "\\(\\mathrm{PSPACE}=\\mathrm{NPSPACE}\\).",
    answer: true,
    explanation: "By Savitch's theorem, \\(\\mathrm{NSPACE}(n^k)\\subseteq\\mathrm{SPACE}(n^{2k})\\), and the square of a polynomial is still a polynomial. So nondeterminism gives no extra power for polynomial space: \\(\\mathrm{PSPACE}=\\mathrm{NPSPACE}\\).",
    source: "Sipser §8.2 (after Def 8.6)"
  },
  {
    id: "ch8-pspace-neq-npspace-false", chapter: 8, topic: "PSPACE", type: "tf",
    prompt: "It is a major open problem whether \\(\\mathrm{PSPACE}=\\mathrm{NPSPACE}\\); the two classes are not known to be equal.",
    answer: false,
    explanation: "Unlike \\(\\mathrm{P}\\) vs \\(\\mathrm{NP}\\), equality here is settled: Savitch's theorem proves \\(\\mathrm{PSPACE}=\\mathrm{NPSPACE}\\) outright. There is nothing open about it.",
    source: "Sipser §8.2 (Savitch)"
  },
  {
    id: "ch8-pspace-contains-np-conp", chapter: 8, topic: "PSPACE", type: "multi",
    prompt: "Which containments involving \\(\\mathrm{PSPACE}\\) are known to hold?",
    choices: [
      "\\(\\mathrm{NP}\\subseteq\\mathrm{PSPACE}\\)",
      "\\(\\mathrm{coNP}\\subseteq\\mathrm{PSPACE}\\)",
      "\\(\\mathrm{PSPACE}\\subseteq\\mathrm{EXPTIME}\\)",
      "\\(\\mathrm{EXPTIME}\\subseteq\\mathrm{PSPACE}\\)"
    ],
    answers: [0, 1, 2],
    explanation: "\\(\\mathrm{P}\\subseteq\\mathrm{NP}\\subseteq\\mathrm{PSPACE}\\) and, since \\(\\mathrm{PSPACE}\\) is closed under complement, also \\(\\mathrm{coNP}\\subseteq\\mathrm{PSPACE}\\). A space-\\(f(n)\\) TM runs in time \\(2^{O(f(n))}\\), giving \\(\\mathrm{PSPACE}\\subseteq\\mathrm{EXPTIME}\\). The reverse \\(\\mathrm{EXPTIME}\\subseteq\\mathrm{PSPACE}\\) is not known.",
    source: "Sipser §8.2"
  },
  {
    id: "ch8-class-chain-order", chapter: 8, topic: "PSPACE", type: "order",
    prompt: "Arrange these classes from smallest to largest in the known chain of containments.",
    items: [
      "\\(\\mathrm{P}\\)",
      "\\(\\mathrm{NP}\\)",
      "\\(\\mathrm{PSPACE}\\)",
      "\\(\\mathrm{EXPTIME}\\)"
    ],
    explanation: "Sipser summarizes \\(\\mathrm{P}\\subseteq\\mathrm{NP}\\subseteq\\mathrm{PSPACE}=\\mathrm{NPSPACE}\\subseteq\\mathrm{EXPTIME}\\). By the time hierarchy \\(\\mathrm{P}\\neq\\mathrm{EXPTIME}\\), so at least one containment is proper — but we don't know which.",
    source: "Sipser §8.2"
  },

  // ---- PSPACE-completeness and TQBF / games ----
  {
    id: "ch8-pspace-complete-def", chapter: 8, topic: "PSPACE-completeness", type: "multi",
    prompt: "A language \\(B\\) is \\(\\mathrm{PSPACE}\\)-complete when which conditions hold?",
    choices: [
      "\\(B\\in\\mathrm{PSPACE}\\)",
      "every \\(A\\in\\mathrm{PSPACE}\\) is polynomial-**time** reducible to \\(B\\)",
      "every \\(A\\in\\mathrm{PSPACE}\\) is polynomial-**space** reducible to \\(B\\)",
      "\\(B\\in\\mathrm{P}\\)"
    ],
    answers: [0, 1],
    explanation: "By Definition 8.8, \\(B\\) must be in \\(\\mathrm{PSPACE}\\) and \\(\\mathrm{PSPACE}\\)-hard under polynomial-**time** reductions. (Satisfying only hardness makes \\(B\\) merely \\(\\mathrm{PSPACE}\\)-hard.)",
    source: "Sipser Def 8.8"
  },
  {
    id: "ch8-why-poly-time-reduction", chapter: 8, topic: "PSPACE-completeness", type: "tf",
    prompt: "\\(\\mathrm{PSPACE}\\)-completeness uses polynomial-**time** reducibility rather than polynomial-space reducibility because the reduction model must be more limited than the class being defined.",
    answer: true,
    explanation: "If the reduction were as powerful as the class itself, a fast solution to the complete problem would not yield fast solutions to the rest. So the reduction must be weaker than \\(\\mathrm{PSPACE}\\) — polynomial time works.",
    source: "Sipser §8.3"
  },
  {
    id: "ch8-tqbf-pspace-complete", chapter: 8, topic: "PSPACE-completeness", type: "fib",
    prompt: "Sipser's first example of a \\(\\mathrm{PSPACE}\\)-complete language — the set of true fully quantified Boolean formulas — is named ____.",
    accept: ["TQBF", "tqbf"],
    explanation: "\\(TQBF=\\{\\langle\\phi\\rangle\\mid\\phi \\text{ is a true fully quantified Boolean formula}\\}\\) is \\(\\mathrm{PSPACE}\\)-complete. It generalizes \\(SAT\\) by allowing \\(\\forall\\) and \\(\\exists\\) over \\(\\{0,1\\}\\).",
    source: "Sipser Thm 8.9"
  },
  {
    id: "ch8-tqbf-reduction-savitch", chapter: 8, topic: "PSPACE-completeness", type: "mc",
    prompt: "In reducing an arbitrary \\(\\mathrm{PSPACE}\\) language to \\(TQBF\\), why can't one naively encode the whole computation tableau like in the Cook–Levin proof?",
    choices: [
      "the tableau's height is exponential, so a direct formula would be exponentially large; the \\(\\forall\\)-folding trick (à la Savitch) keeps it polynomial",
      "tableaux cannot encode space-bounded machines at all",
      "Cook–Levin only applies to nondeterministic machines",
      "the formula would be unsatisfiable"
    ],
    answer: 0,
    explanation: "A poly-space machine may run for exponential time, so the tableau is exponentially tall. The reduction instead recursively halves the time interval and uses a universal quantifier to share one subformula for both halves, yielding \\(O(f^2(n))\\) size — the same idea as Savitch's theorem.",
    source: "Sipser Thm 8.9 (proof)"
  },
  {
    id: "ch8-formula-game-eq-tqbf", chapter: 8, topic: "PSPACE-completeness", type: "tf",
    prompt: "\\(FORMULA\\text{-}GAME\\) (does Player E have a winning strategy?) is \\(\\mathrm{PSPACE}\\)-complete because it is essentially the same language as \\(TQBF\\).",
    answer: true,
    explanation: "A fully quantified formula is true exactly when the existential player (E) has a winning strategy in the associated formula game. So \\(FORMULA\\text{-}GAME=TQBF\\), and completeness follows from Theorem 8.9.",
    source: "Sipser Thm 8.11"
  },
  {
    id: "ch8-generalized-geography", chapter: 8, topic: "PSPACE-completeness", type: "mc",
    prompt: "In **generalized geography** \\(GG\\), two players alternately extend a simple path in a directed graph from a start node; the first player who cannot move loses. Where does \\(GG\\) sit?",
    choices: [
      "\\(\\mathrm{PSPACE}\\)-complete, shown via a reduction from \\(FORMULA\\text{-}GAME\\)",
      "\\(\\mathrm{NP}\\)-complete, like most graph games",
      "in \\(\\mathrm{L}\\), since paths use little memory",
      "decidable in linear time by table lookup"
    ],
    answer: 0,
    explanation: "\\(GG\\) is \\(\\mathrm{PSPACE}\\)-complete: a recursive (poly-space) algorithm decides the winner, and \\(FORMULA\\text{-}GAME\\le_P GG\\) via a diamond gadget per variable so geography play mimics the formula game.",
    source: "Sipser Thm 8.14"
  },

  // ---- L and NL ----
  {
    id: "ch8-sublinear-model", chapter: 8, topic: "L and NL", type: "mc",
    prompt: "To define sublinear space classes like \\(\\mathrm{L}\\) and \\(\\mathrm{NL}\\) meaningfully, which machine model is used?",
    choices: [
      "a read-only input tape plus a separate read/write work tape; only work-tape cells count",
      "a single read/write tape, counting all cells including the input",
      "a write-only input tape and a read-only work tape",
      "a two-way infinite tape with no input"
    ],
    answer: 0,
    explanation: "With a read-only input tape and a separate work tape, the machine can read all of the input without having space to store it; only the work-tape cells contribute to space complexity, enabling bounds below \\(n\\).",
    source: "Sipser §8.4 (p349)"
  },
  {
    id: "ch8-l-nl-def", chapter: 8, topic: "L and NL", type: "multi",
    prompt: "Which equalities correctly define the logarithmic-space classes?",
    choices: [
      "\\(\\mathrm{L}=\\mathrm{SPACE}(\\log n)\\)",
      "\\(\\mathrm{NL}=\\mathrm{NSPACE}(\\log n)\\)",
      "\\(\\mathrm{L}=\\mathrm{SPACE}(n)\\)",
      "\\(\\mathrm{NL}=\\mathrm{NTIME}(\\log n)\\)"
    ],
    answers: [0, 1],
    explanation: "\\(\\mathrm{L}\\) is deterministic log-space and \\(\\mathrm{NL}\\) is nondeterministic log-space: \\(\\mathrm{L}=\\mathrm{SPACE}(\\log n)\\), \\(\\mathrm{NL}=\\mathrm{NSPACE}(\\log n)\\). Log space is enough to hold a constant number of pointers into the input.",
    source: "Sipser Def 8.17"
  },
  {
    id: "ch8-akbk-in-l", chapter: 8, topic: "L and NL", type: "mc",
    prompt: "Why is \\(A=\\{0^k1^k\\mid k\\ge 0\\}\\in\\mathrm{L}\\), even though the linear-space algorithm crosses symbols off the input?",
    choices: [
      "the input tape is read-only, so instead it stores two binary counters on the work tape, each \\(O(\\log n)\\)",
      "it copies the input to the work tape and matches it there",
      "regular languages are automatically in \\(\\mathrm{L}\\) and \\(A\\) is regular",
      "it guesses \\(k\\) nondeterministically"
    ],
    answer: 0,
    explanation: "The log-space machine cannot mark the read-only input, so it counts the \\(0\\)s and the \\(1\\)s separately in binary on the work tape and compares. Two binary counters need only \\(O(\\log n)\\) space, so \\(A\\in\\mathrm{L}\\).",
    source: "Sipser Ex 8.18"
  },
  {
    id: "ch8-path-in-nl", chapter: 8, topic: "L and NL", type: "mc",
    prompt: "The nondeterministic log-space algorithm for \\(PATH\\) (directed \\(s\\)-\\(t\\) reachability) stores what on its work tape?",
    choices: [
      "only the identity of the current node, guessing the next node each step",
      "the entire guessed path from \\(s\\) to \\(t\\)",
      "the full adjacency matrix of \\(G\\)",
      "a list of all visited nodes"
    ],
    answer: 0,
    explanation: "It starts at \\(s\\) and repeatedly guesses a neighbor, recording only the current node (a pointer, \\(O(\\log n)\\)) and a step counter, accepting if it reaches \\(t\\) within \\(m\\) steps. Storing the whole path would exceed log space. Hence \\(PATH\\in\\mathrm{NL}\\).",
    source: "Sipser Ex 8.19"
  },

  // ---- Log-space reducibility, PATH NL-complete, NL ⊆ P ----
  {
    id: "ch8-logspace-transducer", chapter: 8, topic: "NL-completeness", type: "mc",
    prompt: "A **log space transducer** has a read-only input tape, an \\(O(\\log n)\\) work tape, and:",
    choices: [
      "a write-only output tape whose head cannot move leftward",
      "a second read/write work tape of unlimited size",
      "an output tape it may freely read and rewrite",
      "no output tape; it answers accept/reject"
    ],
    answer: 0,
    explanation: "The output tape is write-only and the head never moves left, so the (possibly large) output doesn't count against the log-space work bound. Such a transducer computes a log-space computable function used for \\(\\le_L\\) reductions.",
    source: "Sipser Def 8.21"
  },
  {
    id: "ch8-logspace-reducibility-why", chapter: 8, topic: "NL-completeness", type: "multi",
    prompt: "Which statements about reducibility for \\(\\mathrm{NL}\\)-completeness are correct?",
    choices: [
      "\\(\\mathrm{NL}\\)-completeness is defined using log-space reducibility \\(\\le_L\\), not \\(\\le_P\\)",
      "Polynomial-time reducibility is too coarse here because \\(\\mathrm{NL}\\subseteq\\mathrm{P}\\), so almost all \\(\\mathrm{NL}\\) problems are \\(\\le_P\\)-interreducible",
      "If \\(A\\le_L B\\) and \\(B\\in\\mathrm{L}\\), then \\(A\\in\\mathrm{L}\\)",
      "Log-space reducibility is more powerful than polynomial-time reducibility"
    ],
    answers: [0, 1, 2],
    explanation: "Since \\(\\mathrm{NL}\\subseteq\\mathrm{P}\\), \\(\\le_P\\) can't separate \\(\\mathrm{NL}\\) problems, so we use the weaker \\(\\le_L\\); and \\(\\le_L\\) composes with \\(\\mathrm{L}\\) (Thm 8.23). Log-space reductions are weaker (more limited), not more powerful, than poly-time ones.",
    source: "Sipser §8.5, Thm 8.23"
  },
  {
    id: "ch8-path-nl-complete", chapter: 8, topic: "NL-completeness", type: "fib",
    prompt: "The canonical \\(\\mathrm{NL}\\)-complete problem — directed graph reachability, \\(\\{\\langle G,s,t\\rangle\\mid G \\text{ has a path } s\\to t\\}\\) — is named ____.",
    accept: ["PATH", "path"],
    explanation: "\\(PATH\\) is \\(\\mathrm{NL}\\)-complete (Thm 8.25): it's in \\(\\mathrm{NL}\\) (Ex 8.19), and any \\(\\mathrm{NL}\\) language log-space reduces to it by building the configuration graph of its log-space NTM.",
    source: "Sipser Thm 8.25"
  },
  {
    id: "ch8-nl-subseteq-p", chapter: 8, topic: "NL-completeness", type: "tf",
    prompt: "\\(\\mathrm{NL}\\subseteq\\mathrm{P}\\).",
    answer: true,
    explanation: "Any \\(\\mathrm{NL}\\) language log-space (hence poly-time) reduces to \\(PATH\\), and \\(PATH\\in\\mathrm{P}\\) (Thm 7.14). Since \\(\\mathrm{P}\\) is closed under poly-time reductions, \\(\\mathrm{NL}\\subseteq\\mathrm{P}\\). (More directly, a log-space machine has only polynomially many configurations.)",
    source: "Sipser Cor 8.26"
  },

  // ---- NL = coNL ----
  {
    id: "ch8-nl-eq-conl", chapter: 8, topic: "NL = coNL", type: "tf",
    prompt: "\\(\\mathrm{NL}=\\mathrm{coNL}\\) (the Immerman–Szelepcsényi theorem).",
    answer: true,
    explanation: "Surprisingly, nondeterministic log space is closed under complement. The proof shows \\(\\overline{PATH}\\in\\mathrm{NL}\\); since \\(PATH\\) is \\(\\mathrm{NL}\\)-complete, every \\(\\mathrm{coNL}\\) language is in \\(\\mathrm{NL}\\), so \\(\\mathrm{NL}=\\mathrm{coNL}\\).",
    source: "Sipser Thm 8.27"
  },
  {
    id: "ch8-conl-via-pathbar", chapter: 8, topic: "NL = coNL", type: "mc",
    prompt: "How does proving \\(\\overline{PATH}\\in\\mathrm{NL}\\) establish \\(\\mathrm{NL}=\\mathrm{coNL}\\)?",
    choices: [
      "because \\(PATH\\) is \\(\\mathrm{NL}\\)-complete, putting its complement in \\(\\mathrm{NL}\\) forces every \\(\\mathrm{coNL}\\) language into \\(\\mathrm{NL}\\)",
      "because \\(\\overline{PATH}\\) is \\(\\mathrm{coNL}\\)-complete and trivially in \\(\\mathrm{coNL}\\)",
      "because every language equals its own complement",
      "because \\(\\overline{PATH}\\in\\mathrm{P}\\)"
    ],
    answer: 0,
    explanation: "\\(PATH\\) is \\(\\mathrm{NL}\\)-complete, so \\(\\overline{PATH}\\) is \\(\\mathrm{coNL}\\)-complete. If \\(\\overline{PATH}\\in\\mathrm{NL}\\), then by closure under \\(\\le_L\\) every \\(\\mathrm{coNL}\\) language reduces into \\(\\mathrm{NL}\\); combined with \\(\\mathrm{NL}\\subseteq\\mathrm{coNL}\\) this gives equality.",
    source: "Sipser Thm 8.27 (proof idea)"
  },
  {
    id: "ch8-conl-counting", chapter: 8, topic: "NL = coNL", type: "mc",
    prompt: "The \\(\\mathrm{NL}\\) algorithm for \\(\\overline{PATH}\\) crucially computes which quantity to certify that \\(t\\) is unreachable?",
    choices: [
      "\\(c\\), the exact number of nodes reachable from \\(s\\) (computed by inductive counting of \\(c_i=|A_i|\\))",
      "the length of the shortest \\(s\\)-\\(t\\) path",
      "the total number of edges in \\(G\\)",
      "a topological ordering of \\(G\\)"
    ],
    answer: 0,
    explanation: "The algorithm computes \\(c=c_m\\), the count of nodes reachable from \\(s\\), by iteratively obtaining \\(c_{i+1}\\) from \\(c_i\\). Knowing \\(c\\), it can nondeterministically verify exactly \\(c\\) reachable nodes none of which is \\(t\\), thereby certifying non-reachability in log space.",
    source: "Sipser Thm 8.27 (proof)"
  },
  {
    id: "ch8-summary-chain", chapter: 8, topic: "NL = coNL", type: "order",
    prompt: "Order these classes from smallest to largest in Sipser's summary chain (treat the equal pair as one rung).",
    items: [
      "\\(\\mathrm{L}\\)",
      "\\(\\mathrm{NL}=\\mathrm{coNL}\\)",
      "\\(\\mathrm{P}\\)",
      "\\(\\mathrm{NP}\\)",
      "\\(\\mathrm{PSPACE}\\)"
    ],
    explanation: "Sipser's summary: \\(\\mathrm{L}\\subseteq\\mathrm{NL}=\\mathrm{coNL}\\subseteq\\mathrm{P}\\subseteq\\mathrm{NP}\\subseteq\\mathrm{PSPACE}\\). Since \\(\\mathrm{NL}\\subsetneq\\mathrm{PSPACE}\\), at least one of these containments is proper, though it is unknown which.",
    source: "Sipser §8.6 (p356)"
  }
]);
