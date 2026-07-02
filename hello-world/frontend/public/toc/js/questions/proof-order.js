/* Proof-skeleton pack — "reconstruct the canonical proof" drills.
   Mostly `order` questions (the app shuffles the items; here they are listed IN
   CORRECT ORDER), plus a few `mc` to probe the load-bearing step of each proof.
   These raise the under-used `order` type by asking the learner to arrange the
   OUTLINE of a standard Sipser proof rather than recall a fact.

   Coverage (Ch 1,4,5,7,8):
     - Undecidability of A_TM by diagonalization           (Thm 4.11)
     - General pumping-lemma proof shape (regular)          (Thm 1.70)
     - Cook–Levin formula pieces / SAT is NP-complete       (Thm 7.37)
     - Savitch's theorem (CANYIELD recursion)               (Thm 8.5)
     - Rice's theorem via reduction from A_TM               (Problem 5.28)
     - Mapping-reduction template A ≤_m B                   (Def 5.20 / Thm 5.22)

   Every question carries an explicit `rank`. IDs are prefixed "proof-" so they
   never collide with the shorter `order` questions already in ch2/ch4/ch7. */
TOC.addQuestions([
  // ============================================================
  // ==== Undecidability of A_TM by diagonalization (Thm 4.11) ==
  // ============================================================
  {
    id: "proof-atm-diagonalization-order", chapter: 4, rank: 2, topic: "Diagonalization", type: "order", difficulty: 3,
    prompt: "Reconstruct the diagonalization proof that \\(A_{TM}=\\{\\langle M,w\\rangle\\mid M\\text{ accepts }w\\}\\) is **undecidable**. Put the outline in order.",
    items: [
      "For contradiction, assume \\(A_{TM}\\) is decidable, so some TM \\(H\\) decides it: \\(H\\) accepts \\(\\langle M,w\\rangle\\) if \\(M\\) accepts \\(w\\), and rejects if \\(M\\) does not accept \\(w\\)",
      "Use \\(H\\) as a subroutine to build a new TM \\(D\\) that, on input \\(\\langle M\\rangle\\), runs \\(H\\) on \\(\\langle M,\\langle M\\rangle\\rangle\\) (feeding \\(M\\) its own description)",
      "Have \\(D\\) output the **opposite** of \\(H\\): \\(D\\) accepts \\(\\langle M\\rangle\\) exactly when \\(M\\) does NOT accept \\(\\langle M\\rangle\\)",
      "Run \\(D\\) on its own description \\(\\langle D\\rangle\\)",
      "Observe that \\(D\\) accepts \\(\\langle D\\rangle\\) iff \\(D\\) does not accept \\(\\langle D\\rangle\\) — a contradiction",
      "Conclude the decider \\(H\\) cannot exist, so \\(A_{TM}\\) is undecidable"
    ],
    explanation: "The proof is reductio ad absurdum with self-reference: assume a decider \\(H\\); build \\(D\\) that flips \\(H\\)'s answer on the diagonal input \\(\\langle M,\\langle M\\rangle\\rangle\\); run \\(D\\) on \\(\\langle D\\rangle\\); the flip forces \\(D\\) to disagree with itself, so no \\(H\\) exists.",
    source: "Sipser Thm 4.11"
  },
  {
    id: "proof-atm-d-self-mc", chapter: 4, rank: 2, topic: "Diagonalization", type: "mc", difficulty: 2,
    prompt: "In the proof that \\(A_{TM}\\) is undecidable, why is \\(D\\) run specifically on the input \\(\\langle D\\rangle\\) (its own description)?",
    choices: [
      "Because \\(D\\) is defined to flip \\(M\\)'s behavior on \\(\\langle M\\rangle\\); taking \\(M=D\\) makes \\(D\\) flip its own behavior, which is the contradiction",
      "Because \\(\\langle D\\rangle\\) is the only input \\(H\\) can read",
      "Because \\(D\\) accepts every input except \\(\\langle D\\rangle\\)",
      "Because \\(\\langle D\\rangle\\) is the shortest string in \\(A_{TM}\\)"
    ],
    answer: 0,
    explanation: "\\(D(\\langle M\\rangle)\\) does the opposite of \\(M(\\langle M\\rangle)\\). Substituting \\(M=D\\) gives \"\\(D\\) accepts \\(\\langle D\\rangle\\) iff \\(D\\) does not accept \\(\\langle D\\rangle\\)\" — the self-contradiction that kills the assumed decider.",
    source: "Sipser Thm 4.11"
  },

  // ============================================================
  // ==== General pumping-lemma proof shape — regular (Thm 1.70)=
  // ============================================================
  {
    id: "proof-pumping-regular-shape-order", chapter: 1, rank: 2, topic: "Pumping lemma", type: "order", difficulty: 3,
    prompt: "Arrange the general shape of a proof that a language \\(L\\) is **not regular** using the pumping lemma.",
    items: [
      "For contradiction, assume \\(L\\) is regular",
      "The pumping lemma then gives a pumping length \\(p\\): every \\(s\\in L\\) with \\(|s|\\ge p\\) can be pumped",
      "Choose one specific string \\(s\\in L\\) with \\(|s|\\ge p\\) (pick one exhibiting the \"essence\" of \\(L\\))",
      "Consider EVERY way to split \\(s=xyz\\) subject to \\(|xy|\\le p\\) and \\(|y|>0\\)",
      "For each such split, exhibit an \\(i\\ge 0\\) with the pumped string \\(xy^iz\\notin L\\)",
      "This contradicts the pumping lemma, so \\(L\\) is not regular"
    ],
    explanation: "Sipser's recipe (p.80): assume regular and get \\(p\\); pick \\(s\\) with \\(|s|\\ge p\\); over all legal splits (using \\(|xy|\\le p\\), \\(|y|>0\\)) find a pump \\(i\\) that leaves \\(L\\); contradiction. The learner picks \\(s\\); the adversary picks the split; so all splits must fail.",
    source: "Sipser Thm 1.70"
  },
  {
    id: "proof-pumping-quantifier-mc", chapter: 1, rank: 2, topic: "Pumping lemma", type: "mc", difficulty: 3,
    prompt: "In a pumping-lemma non-regularity proof, who \"chooses\" the string \\(s\\) and who \"chooses\" the split \\(s=xyz\\), and why does it matter?",
    choices: [
      "You choose \\(s\\) (one good string suffices), but you must defeat EVERY split \\(xyz\\) with \\(|xy|\\le p,\\ |y|>0\\), since the lemma only promises some split exists",
      "The lemma chooses \\(s\\) and you choose the split, so one convenient split finishes the proof",
      "You choose both \\(s\\) and the split, so a single example ends the argument",
      "Both are chosen by the lemma, so the proof requires no case analysis"
    ],
    answer: 0,
    explanation: "The lemma is \\(\\exists p\\,\\forall s\\,\\exists\\,\\text{split}\\dots\\). To contradict it you fix \\(p\\) (given), pick one \\(s\\), and then rule out ALL admissible splits — hence the case analysis over where \\(y\\) can fall (\\(|xy|\\le p\\) confines it).",
    source: "Sipser Thm 1.70 (p.80)"
  },

  // ============================================================
  // ==== Cook–Levin: SAT is NP-complete (Thm 7.37) =============
  // ============================================================
  {
    id: "proof-cook-levin-order", chapter: 7, rank: 3, topic: "Cook–Levin theorem", type: "order", difficulty: 3,
    prompt: "Reconstruct the outline of the Cook–Levin proof that \\(SAT\\) is **NP-complete**.",
    items: [
      "Show \\(SAT\\in\\mathrm{NP}\\): a satisfying assignment is a polynomial-size certificate a verifier can check quickly",
      "Take an arbitrary language \\(A\\in\\mathrm{NP}\\), decided by a nondeterministic TM \\(N\\) in time \\(n^k\\)",
      "For an input \\(w\\), picture an accepting computation of \\(N\\) as an \\(n^k\\times n^k\\) **tableau** whose rows are successive configurations",
      "Build a Boolean formula \\(\\phi=\\phi_{cell}\\wedge\\phi_{start}\\wedge\\phi_{move}\\wedge\\phi_{accept}\\) using variables for the tableau's cell contents",
      "Argue \\(\\phi\\) is satisfiable iff a legal accepting tableau for \\(N\\) on \\(w\\) exists, i.e. iff \\(w\\in A\\)",
      "Check the reduction runs in polynomial time (\\(\\phi\\) has size \\(O(n^{2k})\\)), giving \\(A\\le_p SAT\\) for every \\(A\\in\\mathrm{NP}\\)"
    ],
    explanation: "Cook–Levin: \\(SAT\\in\\mathrm{NP}\\), then a generic \\(A\\in\\mathrm{NP}\\) is reduced to \\(SAT\\) by encoding \\(N\\)'s accepting tableau as \\(\\phi=\\phi_{cell}\\wedge\\phi_{start}\\wedge\\phi_{move}\\wedge\\phi_{accept}\\). Satisfying \\(\\phi\\) = filling in an accepting computation. Poly-size formula ⇒ poly-time reduction ⇒ NP-hard.",
    source: "Sipser Thm 7.37"
  },
  {
    id: "proof-cook-levin-conjuncts-order", chapter: 7, rank: 3, topic: "Cook–Levin theorem", type: "order", difficulty: 2,
    prompt: "The Cook–Levin formula is \\(\\phi=\\phi_{cell}\\wedge\\phi_{start}\\wedge\\phi_{move}\\wedge\\phi_{accept}\\). Order the four conjuncts by the job they do, from \"each cell is well-formed\" to \"the computation accepts.\"",
    items: [
      "\\(\\phi_{cell}\\): every cell of the tableau holds exactly one symbol",
      "\\(\\phi_{start}\\): the first row spells out the start configuration \\(q_0w_1w_2\\cdots w_n\\)",
      "\\(\\phi_{move}\\): every \\(2\\times 3\\) window of cells is consistent with \\(N\\)'s transition function (a legal move)",
      "\\(\\phi_{accept}\\): an accepting configuration appears somewhere in the tableau"
    ],
    explanation: "\\(\\phi_{cell}\\) enforces well-formed cells, \\(\\phi_{start}\\) pins the initial row, \\(\\phi_{move}\\) makes each local \\(2\\times 3\\) window a legal step, and \\(\\phi_{accept}\\) demands an accept state occur. Their conjunction is satisfiable exactly when an accepting tableau exists.",
    source: "Sipser Thm 7.37 (proof)"
  },
  {
    id: "proof-cook-levin-window-mc", chapter: 7, rank: 3, topic: "Cook–Levin theorem", type: "mc", difficulty: 3,
    prompt: "Why does \\(\\phi_{move}\\) only need to constrain every \\(2\\times 3\\) **window** of the tableau, rather than compare whole consecutive rows directly?",
    choices: [
      "Because a TM changes only near its head each step, so legality of the whole next row follows from every local 2×3 window being legal — keeping the formula polynomial-size",
      "Because the tableau has only two rows",
      "Because \\(\\phi_{start}\\) already forces every later row, making \\(\\phi_{move}\\) redundant",
      "Because windows larger than 2×3 cannot be written as Boolean formulas"
    ],
    answer: 0,
    explanation: "One TM step alters only the cell at the head and its neighbors. So row-to-row legality is a purely local condition: if every \\(2\\times 3\\) window is consistent with \\(\\delta\\), the transition is legal everywhere. Locality is what keeps \\(\\phi_{move}\\) (and thus \\(\\phi\\)) of size \\(O(n^{2k})\\).",
    source: "Sipser Thm 7.37 (proof)"
  },

  // ============================================================
  // ==== Savitch's theorem (Thm 8.5) ===========================
  // ============================================================
  {
    id: "proof-savitch-order", chapter: 8, rank: 3, topic: "Savitch's theorem", type: "order", difficulty: 3,
    prompt: "Reconstruct the proof of **Savitch's theorem**, \\(\\mathrm{NSPACE}(f(n))\\subseteq\\mathrm{SPACE}(f^2(n))\\) for \\(f(n)\\ge n\\). Put the steps in order.",
    items: [
      "Let \\(N\\) be an NTM deciding \\(A\\) in space \\(f(n)\\); we build a deterministic \\(M\\) for \\(A\\)",
      "Note a configuration of \\(N\\) on \\(w\\) fits in \\(O(f(n))\\) space, and \\(N\\) runs at most \\(t=2^{O(f(n))}\\) steps on any branch",
      "Define \\(\\mathrm{CANYIELD}(c_1,c_2,t)\\): does \\(N\\) get from configuration \\(c_1\\) to \\(c_2\\) in at most \\(t\\) steps?",
      "Solve it recursively: search over every midpoint configuration \\(c_m\\) and check \\(\\mathrm{CANYIELD}(c_1,c_m,t/2)\\) and \\(\\mathrm{CANYIELD}(c_m,c_2,t/2)\\)",
      "Have \\(M\\) accept iff \\(\\mathrm{CANYIELD}(c_{start},c_{accept},2^{O(f(n))})\\) succeeds",
      "Bound the space: recursion depth is \\(\\log t=O(f(n))\\) and each level stores one \\(O(f(n))\\)-size configuration, so total space is \\(O(f^2(n))\\)"
    ],
    explanation: "Savitch replaces branch-by-branch search (which would cost \\(2^{O(f(n))}\\) space) with a divide-and-conquer reachability test. \\(\\mathrm{CANYIELD}\\) guesses a midpoint and recurses on two half-length subproblems, reusing space. Depth \\(\\log t=O(f(n))\\) times \\(O(f(n))\\) per frame gives \\(O(f^2(n))\\).",
    source: "Sipser Thm 8.5"
  },
  {
    id: "proof-savitch-midpoint-mc", chapter: 8, rank: 3, topic: "Savitch's theorem", type: "mc", difficulty: 3,
    prompt: "In Savitch's theorem, why does the midpoint recursion of \\(\\mathrm{CANYIELD}\\) achieve \\(O(f^2(n))\\) space instead of exponential space?",
    choices: [
      "Halving the step budget makes the recursion depth \\(\\log t=O(f(n))\\), and the two recursive calls REUSE the same space, so only \\(O(f(n))\\) frames of size \\(O(f(n))\\) are ever live",
      "The midpoint \\(c_m\\) is unique, so there is no search",
      "It stores every configuration on the path at once, which happens to be small",
      "It avoids recursion entirely by trying branches one at a time"
    ],
    answer: 0,
    explanation: "Splitting a \\(t\\)-step reachability question at a midpoint gives two \\(t/2\\)-step questions, so recursion depth is \\(\\log t=O(f(n))\\). Because the two halves run sequentially and reuse space, only the current stack of \\(O(f(n))\\) configuration-frames (each \\(O(f(n))\\)) exists: \\(O(f(n))\\cdot O(f(n))=O(f^2(n))\\).",
    source: "Sipser Thm 8.5 (proof)"
  },

  // ============================================================
  // ==== Rice's theorem via reduction from A_TM (Prob 5.28) ====
  // ============================================================
  {
    id: "proof-rice-order", chapter: 5, rank: 3, topic: "Rice's theorem", type: "order", difficulty: 3,
    prompt: "Reconstruct a proof of **Rice's theorem** (every nontrivial property \\(P\\) of a TM's language is undecidable) by reducing \\(A_{TM}\\) to \\(P\\). Put the outline in order.",
    items: [
      "Let \\(P\\) be a nontrivial property of the recognized language; WLOG the always-rejecting machine \\(T_\\emptyset\\) (with \\(L(T_\\emptyset)=\\emptyset\\)) does NOT have \\(P\\)",
      "By nontriviality, fix some machine \\(T\\) whose language \\(L(T)\\) DOES have \\(P\\)",
      "For contradiction, assume a TM \\(R_P\\) decides \\(P\\)",
      "To decide \\(A_{TM}\\) on input \\(\\langle M,w\\rangle\\), build a machine \\(M_w\\): on input \\(x\\), first simulate \\(M\\) on \\(w\\); if \\(M\\) accepts \\(w\\), then run \\(T\\) on \\(x\\) (else reject \\(x\\))",
      "Observe \\(L(M_w)=L(T)\\) (which has \\(P\\)) if \\(M\\) accepts \\(w\\), and \\(L(M_w)=\\emptyset\\) (which lacks \\(P\\)) if \\(M\\) does not accept \\(w\\)",
      "So running \\(R_P\\) on \\(\\langle M_w\\rangle\\) decides whether \\(M\\) accepts \\(w\\), deciding \\(A_{TM}\\) — contradiction; hence \\(P\\) is undecidable"
    ],
    explanation: "Rice via \\(A_{TM}\\le_m P\\): pick a machine \\(T\\) that has the property and note \\(\\emptyset\\) lacks it. The gadget \\(M_w\\) makes its language equal to \\(L(T)\\) exactly when \\(M\\) accepts \\(w\\), and \\(\\emptyset\\) otherwise. A decider for \\(P\\) would then decide \\(A_{TM}\\).",
    source: "Sipser Problem 5.28"
  },
  {
    id: "proof-rice-gadget-mc", chapter: 5, rank: 3, topic: "Rice's theorem", type: "mc", difficulty: 3,
    prompt: "In the Rice's-theorem reduction, the constructed machine \\(M_w\\) first simulates \\(M\\) on \\(w\\) and only then runs \\(T\\) on its own input \\(x\\). What is the point of this ordering?",
    choices: [
      "It makes \\(L(M_w)\\) depend on whether \\(M\\) accepts \\(w\\): if yes, \\(M_w\\) behaves like \\(T\\) (language has \\(P\\)); if no, \\(M_w\\) accepts nothing (language lacks \\(P\\))",
      "It guarantees \\(M_w\\) always halts on every input \\(x\\)",
      "It ensures \\(L(M_w)\\) equals \\(A_{TM}\\)",
      "It makes \\(M_w\\) run \\(T\\) before reading \\(x\\), so \\(x\\) is irrelevant"
    ],
    answer: 0,
    explanation: "The simulation of \\(M\\) on \\(w\\) acts as a gate: it succeeds (and lets \\(M_w=T\\) on \\(x\\)) exactly when \\(M\\) accepts \\(w\\). Thus \\(L(M_w)\\in\\{L(T),\\emptyset\\}\\) tracks membership in \\(A_{TM}\\), and since \\(P\\) is a language property, \\(R_P\\) reads that off.",
    source: "Sipser Problem 5.28"
  },

  // ============================================================
  // ==== Mapping-reduction template A ≤_m B (Def 5.20) =========
  // ============================================================
  {
    id: "proof-mapping-reduction-template-order", chapter: 5, rank: 2, topic: "Mapping reducibility", type: "order", difficulty: 2,
    prompt: "Order the steps of the general template for establishing a mapping reduction \\(A\\le_m B\\) (and using it to transfer (un)decidability).",
    items: [
      "Describe a function \\(f\\) that transforms an arbitrary instance \\(w\\) into an instance \\(f(w)\\) of the \\(B\\)-problem",
      "Verify \\(f\\) is computable: give a TM that halts on every input \\(w\\) with \\(f(w)\\) on its tape",
      "Prove the forward direction: if \\(w\\in A\\) then \\(f(w)\\in B\\)",
      "Prove the reverse direction: if \\(w\\notin A\\) then \\(f(w)\\notin B\\) (equivalently \\(f(w)\\in B\\Rightarrow w\\in A\\))",
      "Conclude \\(w\\in A\\Leftrightarrow f(w)\\in B\\), so \\(f\\) witnesses \\(A\\le_m B\\)",
      "Apply it: if \\(B\\) is decidable then so is \\(A\\); contrapositively, if \\(A\\) is undecidable then so is \\(B\\)"
    ],
    explanation: "A mapping reduction is a total computable \\(f\\) with \\(w\\in A\\Leftrightarrow f(w)\\in B\\) (Def 5.20). Both directions of the biconditional must be shown. Then Thm 5.22 transfers decidability from \\(B\\) to \\(A\\) — and its contrapositive transfers undecidability from \\(A\\) to \\(B\\).",
    source: "Sipser Def 5.20 / Thm 5.22"
  },
  {
    id: "proof-mapping-direction-mc", chapter: 5, rank: 2, topic: "Mapping reducibility", type: "mc", difficulty: 2,
    prompt: "You have shown \\(A\\le_m B\\) with \\(A\\) known undecidable. Which conclusion is valid, and why is the reduction's direction essential?",
    choices: [
      "\\(B\\) is undecidable: a decider for \\(B\\) plus the computable \\(f\\) would decide \\(A\\) (run \\(f\\), then the \\(B\\)-decider), contradicting \\(A\\)'s undecidability",
      "\\(A\\) is decidable, because \\(B\\) sits above it",
      "\\(B\\) is decidable, because \\(f\\) simplifies instances",
      "Nothing follows unless \\(f\\) is a bijection"
    ],
    answer: 0,
    explanation: "\\(A\\le_m B\\) means \\(A\\) is \"no harder than\" \\(B\\). So undecidability flows UP: if \\(B\\) were decidable, composing \\(f\\) with \\(B\\)'s decider would decide \\(A\\). Reducing the KNOWN-hard \\(A\\) TO the target \\(B\\) is what makes \\(B\\) hard; the opposite direction would prove nothing.",
    source: "Sipser Thm 5.22 / Cor 5.23"
  }
]);
