/* Chapter 1 — Regular Languages: extra distractors (each unambiguously WRONG for
   its question). Keyed by question id. The app samples a varying subset of wrong
   options each render so you can't answer by position or remembered shape. */
TOC.addPools({
  // ---- DFA: formal definition, computation, design ----
  "ch1-dfa-5tuple-parts": [
    "states, alphabet, accept states, transition function, start state",
    "alphabet, states, transition function, accept states, start state",
    "states, alphabet, transition function, accept states, start state",
    "start state, states, alphabet, transition function, accept states"
  ],
  "ch1-dfa-computation-conditions": [
    "\\(r_0\\in F\\) (start in an accept state)",
    "\\(\\delta(r_{i+1},w_i)=r_i\\) for \\(i=1,\\dots,n\\)",
    "\\(r_n=q_0\\) (return to the start state at the end)",
    "the sequence \\(r_0,\\dots,r_n\\) visits every state of \\(M\\)"
  ],
  "ch1-dfa-design-substring-001": ["\\(6\\)", "\\(8\\)", "\\(7\\)"],

  // ---- NFA ----
  "ch1-nfa-vs-dfa-differences": [
    "The start state may be an accept state",
    "Several states may share the same name",
    "The transition function may map to the empty set \\(\\emptyset\\) only in a DFA"
  ],
  "ch1-nfa-acceptance-criterion": [
    "no branch of the computation enters a reject state",
    "the first branch explored ends in an accept state",
    "exactly one branch of the computation ends in an accept state"
  ],

  // ---- Subset construction ----
  "ch1-subset-construction-states": [
    "the set \\(Q\\cup\\{q_0\\}\\) with one extra start state",
    "the set \\(\\Sigma\\times Q\\) of (symbol, state) pairs",
    "a set with exactly \\(k^2\\) states"
  ],

  // ---- Regular operations & closure ----
  "ch1-regops-three": [
    "union, concatenation, complement",
    "concatenation, intersection, star",
    "union, star, reverse"
  ],
  "ch1-regops-concat-def": [
    "\\(\\{x\\mid x\\in A\\text{ and }x\\notin B\\}\\)",
    "\\(\\{yx\\mid x\\in A\\text{ and }y\\in B\\}\\)",
    "\\(\\{xy\\mid x\\in A\\text{ or }y\\in B\\}\\)"
  ],
  "ch1-closure-intersection-accept": [
    "the symmetric difference \\(A_1\\triangle A_2\\)",
    "the set difference \\(A_1\\setminus A_2\\)",
    "the complement \\(\\overline{A_1\\cup A_2}\\)"
  ],
  "ch1-closure-which-multi": [
    "Concatenation never preserves regularity",
    "The class of regular languages is not closed under star",
    "Complementing a regular language can yield a nonregular language"
  ],

  // ---- Regular expressions ----
  "ch1-regex-precedence": [
    "concatenation, then union, then star",
    "union, then star, then concatenation",
    "all three operations have equal precedence and associate left to right"
  ],
  "ch1-regex-base-cases": [
    "\\(R^*\\) for a regular expression \\(R\\)",
    "\\(\\Sigma\\) (the whole alphabet)",
    "\\(R_1\\cup R_2\\) for regular expressions \\(R_1,R_2\\)"
  ],
  "ch1-regex-eps-vs-emptyset": [
    "\\(\\varepsilon\\) describes \\(\\Sigma\\); \\(\\emptyset\\) describes \\(\\Sigma^*\\)",
    "\\(\\varepsilon\\) describes every string of length one; \\(\\emptyset\\) describes \\(\\{\\varepsilon\\}\\)",
    "\\(\\emptyset\\) is not a valid regular expression, but \\(\\varepsilon\\) is"
  ],
  "ch1-regex-identity-union-empty": [
    "\\(R\\cup R=\\emptyset\\)",
    "\\(R^*\\cup\\varepsilon=\\emptyset\\)",
    "\\(\\emptyset^*=\\emptyset\\)"
  ],
  "ch1-regex-meaning-sigmastar1": [
    "\\(\\{w\\mid w\\text{ contains the substring }010\\}\\)",
    "\\(\\{w\\mid w\\text{ begins and ends with }0\\}\\)",
    "\\(\\{w\\mid w\\text{ contains no }1\\text{s}\\}\\)"
  ],

  // ---- GNFA / RE<->FA ----
  "ch1-gnfa-labels": [
    "the empty string \\(\\varepsilon\\) only",
    "sets of alphabet symbols",
    "stack operations (push and pop)"
  ],
  "ch1-gnfa-rip-label": [
    "\\((R_1)^*(R_2)(R_3)^*\\cup(R_4)\\)",
    "\\((R_1)(R_3)^*(R_2)\\cap(R_4)\\)",
    "\\((R_4)\\cup(R_1)\\cup(R_2)^*\\cup(R_3)\\)"
  ],

  // ---- Pumping lemma ----
  "ch1-pumping-statement": [
    "\\(xy^iz\\in A\\) for all \\(i\\ge 0\\);  \\(|y|\\ge 0\\);  \\(|xz|\\le p\\)",
    "\\(xy^iz\\notin A\\) for some \\(i\\ge 0\\);  \\(|y|>0\\);  \\(|xy|\\le p\\)",
    "\\(xy^iz\\in A\\) for all \\(i\\ge 2\\);  \\(|x|>0\\);  \\(|yz|\\le p\\)"
  ],
  "ch1-pumping-0n1n-string": [
    "\\(s=0^p1^{p+1}\\)",
    "\\(s=\\varepsilon\\)",
    "\\(s=1^p\\)"
  ],
  "ch1-pumping-which-nonregular": [
    "\\(\\{0^m1^n\\mid m,n\\ge 0\\}\\)",
    "\\(\\{w\\in\\{0,1\\}^*\\mid w\\text{ starts and ends with the same symbol}\\}\\)",
    "\\(\\{w\\in\\{0,1\\}^*\\mid \\#0\\equiv\\#1 \\pmod 2\\}\\)"
  ],
  "ch1-pumping-ww-string": [
    "\\(s=0^p1^p\\)",
    "\\(s=\\varepsilon\\)",
    "\\(s=0^{2p}\\)"
  ],
  "ch1-pumping-down-igtj": [
    "pumps up to \\(i=2\\): the extra \\(0\\)s push \\(xyyz\\) out of \\(E\\)",
    "pumps down to \\(i=0\\), removing \\(1\\)s so the \\(1\\)s no longer fit",
    "splits \\(s\\) so that \\(y\\) straddles the boundary between \\(0\\)s and \\(1\\)s"
  ],

  // ---- Regular vs nonregular ----
  "ch1-regular-closed-not-help-prove-regular": [
    "\\(C\\) is undecidable, so no finite automaton can recognize it",
    "\\(C\\cup 0^*1^*=\\Sigma^*\\), which is nonregular",
    "\\(\\overline{C}\\) is the known-nonregular \\(\\{0^n1^n\\}\\), and regular languages are closed under complement"
  ],

  // ---- Formal definitions (DFA / NFA / regex) ----
  "ch1-def-dfa-tuple": [
    "States, alphabet, transition function, set of accept states, start state",
    "Alphabet, states, transition function, start state, accept states",
    "States, alphabet, transition function, start state, reject states"
  ],
  "ch1-def-dfa-delta": [
    "\\(\\delta:Q\\times Q\\to\\Sigma\\)",
    "\\(\\delta:Q\\to Q\\times\\Sigma\\)",
    "\\(\\delta:\\Sigma\\times\\Sigma\\to Q\\)"
  ],
  "ch1-def-dfa-accept": [
    "Some prefix of \\(w\\) drives \\(M\\) from \\(q_0\\) into an accept state",
    "Following \\(\\delta\\) from \\(q_0\\), the run avoids every non-accept state",
    "There is a branch of \\(M\\)'s computation on \\(w\\) ending in \\(F\\)"
  ],
  "ch1-def-nfa-delta": [
    "\\(\\delta:Q\\times\\Sigma\\to\\mathcal{P}(Q)\\)",
    "\\(\\delta:\\mathcal{P}(Q)\\times\\Sigma_\\varepsilon\\to\\mathcal{P}(Q)\\)",
    "\\(\\delta:Q\\times\\Sigma_\\varepsilon\\to Q\\)"
  ],
  "ch1-def-nfa-accept": [
    "Some branch of the computation never leaves an accept state",
    "More than half of its computation branches end in accept states",
    "Its unique computation branch ends in an accept state"
  ],
  "ch1-def-regex-atoms-multi": [
    "\\(R_1\\circ R_2\\) (a concatenation)",
    "\\(\\Sigma_\\varepsilon\\)",
    "any NFA"
  ],
  "ch1-def-regex-ops-multi": [
    "reverse \\(R_1^{\\mathcal{R}}\\)",
    "Kleene plus \\(R_1^{+}\\) as a primitive operator",
    "set difference \\(R_1\\setminus R_2\\)"
  ],
  "ch1-def-emptyset-vs-eps": [
    "\\(\\emptyset\\) matches the empty string; \\(\\varepsilon\\) matches every string",
    "\\(\\emptyset\\) matches \\(\\{\\varepsilon\\}\\); \\(\\varepsilon\\) matches no strings",
    "\\(\\emptyset\\) and \\(\\varepsilon\\) both match exactly the empty string"
  ]
});

TOC.addPools({
  "ch1-concept-dfa-what": [
    "A machine that may be in several states at once and accepts if any branch does",
    "A two-way automaton that can re-read earlier input symbols",
    "A machine that recognizes exactly the context-free languages"
  ],
  "ch1-concept-nfa-what": [
    "A finite automaton equipped with a stack for unbounded memory",
    "A finite automaton that recognizes strictly more languages than any DFA",
    "A deterministic machine with exactly one computation per input"
  ],
  "ch1-concept-regular-what": [
    "Some pushdown automaton recognizes it",
    "Some unrestricted grammar generates it",
    "Every string in it has bounded length"
  ],
  "ch1-concept-regex-what": [
    "A finite-state machine with states and transitions but no memory",
    "A grammar that can describe structure nested to arbitrary depth",
    "An algorithm that decides membership in any decidable language"
  ],
  "ch1-trace-dfa-odd1s": [
    "strings with an even number of \\(0\\)s",
    "strings of odd length",
    "strings that start with \\(1\\)"
  ],
  "ch1-trace-dfa-endin0": [
    "strings containing at least one \\(0\\)",
    "strings with more \\(0\\)s than \\(1\\)s",
    "strings that end in \\(00\\)"
  ],
  "ch1-trace-dfa-contains01": [
    "strings containing the substring \\(00\\)",
    "strings that end in \\(1\\)",
    "strings with at least two \\(1\\)s"
  ],
  "ch1-trace-dfa-div3": [
    "strings whose number of \\(1\\)s is a multiple of \\(3\\)",
    "strings of length at most \\(3\\)",
    "strings of even length"
  ],
  "ch1-trace-nfa-endin01": [
    "strings that end in \\(10\\)",
    "strings of length at least \\(2\\)",
    "strings with an even number of \\(1\\)s"
  ],
  "ch1-trace-nfa-contains11": [
    "strings containing the substring \\(00\\)",
    "strings that end in \\(1\\)",
    "strings with at least two \\(1\\)s anywhere"
  ],
  "ch1-regex-read-end01": [
    "all strings of even length",
    "all strings that end in \\(1\\)",
    "all strings containing exactly one \\(01\\)"
  ],
  "ch1-regex-read-astarbstar": [
    "strings where every \\(a\\) comes after every \\(b\\)",
    "all nonempty strings over \\(\\{a,b\\}\\)",
    "\\(\\{a^n b^n \\mid n\\ge 0\\}\\)"
  ],
  "ch1-regex-read-abstar": [
    "all strings that end in \\(ab\\)",
    "all strings with an even number of letters in any arrangement",
    "\\(\\{a^n b^n \\mid n\\ge 0\\}\\)"
  ],
  "ch1-def-sigma-eps-fib": [
    "\\(\\Sigma\\)",
    "\\(\\{\\varepsilon\\}\\)",
    "\\(\\Gamma\\cup\\{\\varepsilon\\}\\)",
    "\\(\\emptyset\\)"
  ]
});
