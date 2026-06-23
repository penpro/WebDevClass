/* Chapter 6 — extra distractors (each unambiguously WRONG for its question).
   Keyed by question id. The app samples a varying subset of wrong options each
   render so you can't answer by position or remembered shape. */
TOC.addPools({
  "ch6-recursion-self-purpose-mc": [
    "Reverses its input string and halts",
    "Rejects every input that is not its own description",
    "Computes \\(q(w)\\) and writes \\(\\langle P_w\\rangle\\)",
    "Decides whether its input is incompressible"
  ],
  "ch6-recursion-lemma-q-mc": [
    "The shortest description of a TM equivalent to \\(M\\)",
    "The encoding \\(\\langle M, w\\rangle\\) of the universal TM run on \\(w\\)",
    "A TM that loops forever on every input",
    "The descriptive complexity \\(K(w)\\) of \\(w\\)"
  ],
  "ch6-recursion-part-b-mc": [
    "It recomputes \\(\\langle B\\rangle\\) by applying \\(q\\) to its own input",
    "It receives \\(\\langle B\\rangle\\) as the input given to \\(\\mathit{SELF}\\)",
    "It enumerates all TM descriptions until it finds \\(\\langle B\\rangle\\)"
  ],
  "ch6-atm-recursion-mc": [
    "accepts \\(w\\) iff \\(H\\) rejects \\(\\langle B, w\\rangle\\) and otherwise loops",
    "ignores \\(H\\)'s answer and accepts every \\(w\\)",
    "halts and outputs \\(\\langle B\\rangle\\) without consulting \\(w\\)",
    "rejects iff \\(H\\) rejects (so it agrees with \\(H\\))"
  ],
  "ch6-mintm-recognizable-mc": [
    "\\(MIN_{TM}\\) is Turing-recognizable but not decidable",
    "\\(MIN_{TM}\\) is context-free",
    "\\(MIN_{TM}\\) is co-Turing-recognizable",
    "\\(MIN_{TM}\\) is mapping reducible to \\(\\emptyset\\)"
  ],
  "ch6-mintm-why-mc": [
    "\\(C\\) loops forever, so simulating it inside \\(D\\) is impossible",
    "the enumerator \\(E\\) lists \\(\\langle C\\rangle\\) itself, contradicting minimality",
    "\\(D\\) is shorter than \\(C\\), so \\(C\\) was never minimal",
    "no machine \\(D\\) longer than \\(C\\) can ever appear on \\(E\\)'s list"
  ],
  "ch6-fixedpoint-mc": [
    "\\(t(\\langle F\\rangle)\\) is the lexicographically first description equal to \\(\\langle F\\rangle\\)",
    "\\(F\\) and \\(t(\\langle F\\rangle)\\) have descriptions of exactly the same length",
    "\\(t\\) has no fixed point unless \\(t\\) is computable and total",
    "\\(L(F)=\\emptyset\\) for the machine \\(F\\) that \\(t\\) fixes"
  ],
  "ch6-oracle-def-mc": [
    "a TM that decides \\(B\\) without ever looping",
    "the set of all strings mapping-reducible to \\(B\\)",
    "a finite lookup table listing every string of \\(B\\)",
    "an enumerator that prints \\(B\\) and then halts"
  ],
  "ch6-turing-reducible-def-mc": [
    "there is a computable \\(f\\) with \\(w\\in A \\Leftrightarrow f(w)\\notin B\\)",
    "\\(B\\) is decidable relative to \\(A\\)",
    "\\(A\\) and \\(B\\) are recognized by the same oracle TM",
    "every TM that recognizes \\(A\\) also recognizes \\(B\\)"
  ],
  "ch6-kolmogorov-def-mc": [
    "the length \\(|x|\\) of the string \\(x\\) itself",
    "the length of the shortest regular expression matching \\(x\\)",
    "the number of states of the smallest DFA accepting \\(\\{x\\}\\)",
    "the running time of the universal TM that outputs \\(x\\)"
  ],
  "ch6-kolmogorov-upper-mc": [
    "\\(K(x)=2^{|x|}\\)",
    "\\(K(x)\\ge|x|\\) for every string \\(x\\)",
    "\\(K(x)\\le c\\) for a fixed constant \\(c\\) independent of \\(x\\)",
    "\\(K(x)\\le|x|-c\\) for every string \\(x\\)"
  ],
  "ch6-prob624-incompressible-undecidable-mc": [
    "The set of incompressible strings is Turing-recognizable",
    "The set of incompressible strings is decidable",
    "The set of incompressible strings is co-finite",
    "Every incompressible string can be effectively computed from its length"
  ]
});
