/* Exam 1 distractor pools (Ch 0-2 checkpoint) — each option UNAMBIGUOUSLY WRONG
   for its question. Keyed by exact question id. The app samples a varying subset
   of wrong options each render, so a question can't be answered by position.
   Correctness notes: regular languages are closed under complement (swap accept
   states of a DFA, not an NFA); the only CFG generating exactly the balanced
   parens is \(S\to(S)\mid SS\mid\varepsilon\); CNF bodies are exactly \(A\to BC\),
   \(A\to a\), and \(S\to\varepsilon\); CFLs are NOT closed under intersection or
   complement. */
TOC.addPools({
  // ---- Multigraph counterexample (every option here FAILS to disprove the claim) ----
  "exam-degree-equal-multigraph-mc": [
    "A path on three nodes \\(A-B-C\\): the endpoints \\(A,C\\) both have degree \\(1\\)",
    "Two nodes \\(A,B\\) joined by two parallel edges: both have degree \\(2\\)",
    "Four nodes in a cycle: every node has degree \\(2\\)",
    "A star with center \\(c\\) and three leaves: all three leaves have degree \\(1\\)"
  ],

  // ---- Complement of a regular language via DFA ----
  "exam-complement-regular-closure-mc": [
    "Build an NFA for \\(D\\) and swap its accepting and non-accepting states",
    "Add \\(\\varepsilon\\)-transitions from every accept state of a DFA for \\(D\\) back to its start state",
    "Convert \\(D\\) to a regular expression and append \\(\\overline{\\phantom{x}}\\) to it",
    "Run a DFA for \\(D\\) and accept whenever it would have looped"
  ],

  // ---- Nondeterminism essential for the PDA ----
  "exam-pda-nondet-or-mc": [
    "A deterministic PDA cannot pop the stack while reading an input symbol",
    "Nondeterminism lets the PDA scan the input from both ends simultaneously",
    "Only a nondeterministic PDA can store the \\(a\\)-count in its finite control",
    "Deterministic PDAs are limited to languages of the form \\(a^n b^n\\)"
  ],

  // ---- CFG that generates exactly the balanced parentheses ----
  "exam-balanced-parens-cfg-mc": [
    "\\(S\\to (S)S \\mid \\varepsilon S\\)",
    "\\(S\\to S(S) \\mid ()\\)",
    "\\(S\\to (S \\mid S) \\mid \\varepsilon\\)",
    "\\(S\\to (\\,)\\mid SS\\)"
  ],

  // ---- Pumping string for balanced parens not regular ----
  "exam-balanced-parens-nonregular-mc": [
    "\\(s=\\,(^{\\,p}\\,)^{\\,p}\\,(^{\\,p}\\,)^{\\,p}\\) — two balanced blocks",
    "\\(s=\\big((\\,)\\big)^{\\,p}\\) — \\(p\\) copies of \\((())\\)",
    "\\(s=\\,(^{\\,p+1}\\,)^{\\,p+1}\\) — already balanced, no contradiction forced",
    "\\(s=\\varepsilon\\) — the empty string"
  ],

  // ---- Pumping string for the non-CF language a^i b^j c^i, i<=j<=2i ----
  "exam-noncf-pumping-string-mc": [
    "\\(s=a^p b^p\\)",
    "\\(s=b^p c^p\\)",
    "\\(s=a^p b^{p}\\,c^{2p}\\)",
    "\\(s=a^{2p} b^{2p} c^{2p}\\)"
  ],

  // ---- CNF allowed rule shapes (multi); every option here is NOT a CNF body ----
  "exam-cnf-forms-multi": [
    "\\(A\\to Ba\\) (variable then terminal)",
    "\\(A\\to\\varepsilon\\) for an arbitrary variable \\(A\\)",
    "\\(A\\to abc\\) (a string of terminals)",
    "\\(A\\to B\\) (a single variable)"
  ],

  // ---- Pumping string for {ww} (1.46) ----
  "exam-review-146-nonregular-mc": [
    "\\(s=0^p 0^p\\)",
    "\\(s=0^p 1^p\\, 0^p 1^p\\) — but already a perfect square, no contradiction",
    "\\(s=(0011)^p\\)",
    "\\(s=0^{2p}\\)"
  ],

  // ---- True CFL closure facts (multi); every option here is a FALSE closure claim ----
  "exam-review-247-cfl-not-closed-multi": [
    "CFLs are closed under set difference",
    "The complement of a CFL is always context-free",
    "The intersection of two CFLs is always context-free",
    "If \\(A\\) is context-free and \\(B\\subseteq A\\), then \\(B\\) is context-free"
  ]
});
