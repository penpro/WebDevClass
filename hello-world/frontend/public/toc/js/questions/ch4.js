/* Chapter 4 — Decidability (Sipser 4.1–4.2).
   Decidable problems about regular and context-free languages, countability
   and Cantor diagonalization, the undecidability of A_TM, and a
   Turing-unrecognizable language (the complement of A_TM).
   36 questions: mc 15, tf 11, multi 4, fib 4, order 2. */
TOC.addQuestions([
  // ============ Framing: deciders vs recognizers ============
  {
    id: "ch4-decider-vs-recognizer", chapter: 4, topic: "Deciders vs recognizers", type: "tf",
    prompt: "A decider is a Turing machine that halts on every input (it never loops), whereas a recognizer may loop forever on strings not in its language.",
    answer: true,
    explanation: "A decider always halts and so decides its language; a recognizer must accept exactly the strings of its language but may run forever on rejected inputs. Every decidable language is recognizable, but not conversely.",
    source: "Sipser §3.1, §4.2"
  },

  // ============ Decidable problems about regular languages ============
  {
    id: "ch4-adfa-decidable", chapter: 4, topic: "Decidable: regular languages", type: "mc",
    prompt: "Why is \\(A_{DFA}=\\{\\langle B,w\\rangle\\mid B\\text{ is a DFA that accepts }w\\}\\) decidable?",
    choices: [
      "A TM can simulate \\(B\\) on \\(w\\); since \\(B\\) reads each symbol once, the simulation halts after \\(|w|\\) steps, accepting iff \\(B\\) ends in an accept state",
      "Because \\(B\\) might loop, the TM rejects whenever the simulation runs too long",
      "Because \\(A_{DFA}\\) is finite",
      "Because every DFA accepts \\(\\Sigma^*\\)"
    ],
    answer: 0,
    explanation: "Simulating a DFA always terminates after exactly \\(|w|\\) steps, so the simulating TM is a decider — it never loops.",
    source: "Sipser Thm 4.1"
  },
  {
    id: "ch4-anfa-method", chapter: 4, topic: "Decidable: regular languages", type: "mc",
    prompt: "How does Sipser's decider for \\(A_{NFA}=\\{\\langle B,w\\rangle\\mid B\\text{ is an NFA that accepts }w\\}\\) work?",
    choices: [
      "Convert the NFA \\(B\\) to an equivalent DFA \\(C\\) (subset construction), then run the \\(A_{DFA}\\) decider on \\(\\langle C,w\\rangle\\)",
      "Test whether \\(L(B)=\\emptyset\\) and reject if so",
      "Try all derivations of \\(w\\) of length \\(2|w|-1\\)",
      "Diagonalize against all NFAs"
    ],
    answer: 0,
    explanation: "The \\(A_{NFA}\\) decider reuses the \\(A_{DFA}\\) decider as a subroutine: first apply the subset construction (Thm 1.39), then test acceptance.",
    source: "Sipser Thm 4.2"
  },
  {
    id: "ch4-arex-decidable", chapter: 4, topic: "Decidable: regular languages", type: "tf",
    prompt: "The language \\(A_{REX}=\\{\\langle R,w\\rangle\\mid R\\text{ is a regular expression that generates }w\\}\\) is decidable.",
    answer: true,
    explanation: "Convert \\(R\\) to an equivalent NFA (Thm 1.54), then run the \\(A_{NFA}\\) decider. For decidability a DFA, NFA, or regular expression are interchangeable since each converts to the others.",
    source: "Sipser Thm 4.3"
  },
  {
    id: "ch4-edfa-emptiness", chapter: 4, topic: "Decidable: regular languages", type: "mc",
    prompt: "The emptiness problem \\(E_{DFA}=\\{\\langle A\\rangle\\mid A\\text{ is a DFA and }L(A)=\\emptyset\\}\\) is decided by which algorithm?",
    choices: [
      "Mark the start state, repeatedly mark any state reachable from a marked state, then accept iff no accept state is ever marked",
      "Simulate \\(A\\) on every string in \\(\\Sigma^*\\) one by one",
      "Convert \\(A\\) to Chomsky normal form and count derivations",
      "Build the symmetric-difference DFA and test it"
    ],
    answer: 0,
    explanation: "A DFA accepts some string iff an accept state is reachable from the start state. The reachability (marking) algorithm terminates because there are finitely many states.",
    source: "Sipser Thm 4.4"
  },
  {
    id: "ch4-eqdfa-symdiff", chapter: 4, topic: "Decidable: regular languages", type: "mc",
    prompt: "To decide \\(EQ_{DFA}=\\{\\langle A,B\\rangle\\mid L(A)=L(B)\\}\\), Sipser builds a DFA \\(C\\) with \\(L(C)=\\big(L(A)\\cap\\overline{L(B)}\\big)\\cup\\big(\\overline{L(A)}\\cap L(B)\\big)\\). Why does this work?",
    choices: [
      "This symmetric difference is empty iff \\(L(A)=L(B)\\), so testing \\(L(C)=\\emptyset\\) with the \\(E_{DFA}\\) decider settles equivalence",
      "\\(L(C)=\\Sigma^*\\) iff \\(L(A)=L(B)\\)",
      "\\(C\\) is an NFA, so we run the \\(A_{NFA}\\) decider on it",
      "\\(C\\) has fewer states than \\(A\\) and \\(B\\) combined"
    ],
    answer: 0,
    explanation: "The symmetric difference holds exactly the strings on which \\(A\\) and \\(B\\) disagree, so \\(L(C)=\\emptyset\\) precisely when they recognize the same language. Regular languages are closed under \\(\\cap,\\cup,\\) and complement, so \\(C\\) is constructible.",
    source: "Sipser Thm 4.5"
  },
  {
    id: "ch4-alldfa-decidable", chapter: 4, topic: "Decidable: regular languages", type: "tf",
    prompt: "The language \\(ALL_{DFA}=\\{\\langle A\\rangle\\mid A\\text{ is a DFA and }L(A)=\\Sigma^*\\}\\) is decidable.",
    answer: true,
    explanation: "Complement \\(A\\) (swap accept and non-accept states) to get \\(A'\\) with \\(L(A')=\\overline{L(A)}\\); then \\(L(A)=\\Sigma^*\\) iff \\(L(A')=\\emptyset\\), which the \\(E_{DFA}\\) decider tests.",
    source: "Sipser Exercise 4.3"
  },
  {
    id: "ch4-regular-classify-multi", chapter: 4, topic: "Decidable: regular languages", type: "multi",
    prompt: "Which of the following languages are **decidable**?",
    choices: [
      "\\(A_{DFA}\\) — does DFA \\(B\\) accept \\(w\\)?",
      "\\(E_{DFA}\\) — is \\(L(A)=\\emptyset\\) for DFA \\(A\\)?",
      "\\(EQ_{DFA}\\) — do DFAs \\(A,B\\) recognize the same language?",
      "\\(A_{TM}\\) — does TM \\(M\\) accept \\(w\\)?"
    ],
    answers: [0, 1, 2],
    explanation: "Every standard decision problem about finite automata is decidable: acceptance, emptiness, and equivalence. \\(A_{TM}\\) is the odd one out — it is undecidable (Thm 4.11).",
    source: "Sipser Thms 4.1–4.5"
  },

  // ============ Decidable problems about context-free languages ============
  {
    id: "ch4-acfg-why-not-naive", chapter: 4, topic: "Decidable: context-free languages", type: "mc",
    prompt: "Why doesn't simply trying all derivations of \\(w\\) in a CFG \\(G\\) yield a **decider** for \\(A_{CFG}\\), and how is this fixed?",
    choices: [
      "A grammar may have infinitely many derivations, so the naive search can loop forever; converting to Chomsky normal form bounds derivations of \\(w\\) to \\(2|w|-1\\) steps",
      "Derivations are uncomputable; the fix is to use a PDA instead",
      "The naive search uses too much memory; the fix is a multi-tape TM",
      "CFGs are ambiguous; the fix is to remove ambiguity first"
    ],
    answer: 0,
    explanation: "Unbounded derivation search only recognizes \\(A_{CFG}\\) (it may loop when \\(w\\notin L(G)\\)). CNF caps any derivation of a length-\\(n\\) string at \\(2n-1\\) steps, leaving finitely many to check.",
    source: "Sipser Thm 4.7"
  },
  {
    id: "ch4-acfg-cnf-steps", chapter: 4, topic: "Decidable: context-free languages", type: "fib",
    prompt: "In a grammar in Chomsky normal form, every derivation of a string of length \\(n\\ge 1\\) has exactly how many steps? (Give the formula in terms of \\(n\\).)",
    accept: ["2n-1", "2n - 1", "2*n-1", "2*n - 1", "2n−1"],
    explanation: "CNF rules are \\(A\\to BC\\) and \\(A\\to a\\). A length-\\(n\\) string needs \\(n-1\\) applications of \\(A\\to BC\\) plus \\(n\\) of \\(A\\to a\\), totaling \\(2n-1\\) steps.",
    source: "Sipser Thm 4.7 / Problem 2.26"
  },
  {
    id: "ch4-ecfg-emptiness", chapter: 4, topic: "Decidable: context-free languages", type: "mc",
    prompt: "The emptiness problem \\(E_{CFG}=\\{\\langle G\\rangle\\mid G\\text{ is a CFG and }L(G)=\\emptyset\\}\\) is decided by:",
    choices: [
      "A marking algorithm: mark all terminals, then mark any variable having a rule whose right side is fully marked; accept iff the start variable is never marked",
      "Listing all strings \\(w\\) and testing each with the \\(A_{CFG}\\) decider",
      "Converting \\(G\\) to a DFA and testing reachability",
      "Diagonalizing over all CFGs"
    ],
    answer: 0,
    explanation: "\\(L(G)=\\emptyset\\) iff the start variable cannot derive any terminal string. The bottom-up marking of variables that generate terminals terminates and detects exactly this.",
    source: "Sipser Thm 4.8"
  },
  {
    id: "ch4-every-cfl-decidable", chapter: 4, topic: "Decidable: context-free languages", type: "tf",
    prompt: "Every context-free language is decidable.",
    answer: true,
    explanation: "Given a CFG \\(G\\) for the CFL \\(A\\), the machine \\(M_G\\) decides \\(A\\) by running the \\(A_{CFG}\\) decider on \\(\\langle G,w\\rangle\\). (Converting the PDA directly to a TM fails because PDA branches can loop.)",
    source: "Sipser Thm 4.9"
  },
  {
    id: "ch4-eqcfg-undecidable", chapter: 4, topic: "Decidable: context-free languages", type: "tf",
    prompt: "The equivalence problem for context-free grammars, \\(EQ_{CFG}=\\{\\langle G,H\\rangle\\mid L(G)=L(H)\\}\\), is decidable.",
    answer: false,
    explanation: "Unlike \\(EQ_{DFA}\\), \\(EQ_{CFG}\\) is NOT decidable. The symmetric-difference trick fails because CFLs are not closed under intersection or complement; undecidability is proved in Chapter 5.",
    source: "Sipser §4.1 (p. 200)"
  },
  {
    id: "ch4-cfl-classify-multi", chapter: 4, topic: "Decidable: context-free languages", type: "multi",
    prompt: "Which problems about context-free grammars are **decidable**?",
    choices: [
      "\\(A_{CFG}\\) — does \\(G\\) generate the string \\(w\\)?",
      "\\(E_{CFG}\\) — is \\(L(G)=\\emptyset\\)?",
      "Membership in any fixed context-free language \\(A\\)",
      "\\(EQ_{CFG}\\) — do \\(G\\) and \\(H\\) generate the same language?"
    ],
    answers: [0, 1, 2],
    explanation: "\\(A_{CFG}\\) (Thm 4.7), \\(E_{CFG}\\) (Thm 4.8), and membership in any CFL (Thm 4.9) are decidable. \\(EQ_{CFG}\\) is the outlier — it is undecidable.",
    source: "Sipser Thms 4.7–4.9"
  },

  // ============ Language-class hierarchy ============
  {
    id: "ch4-hierarchy-order", chapter: 4, topic: "Language hierarchy", type: "order",
    prompt: "Order these language classes from smallest (most restrictive) to largest, as established by Theorem 4.9.",
    items: [
      "Regular languages",
      "Context-free languages",
      "Decidable languages",
      "Turing-recognizable languages"
    ],
    explanation: "Each class properly contains the previous: regular \\(\\subsetneq\\) context-free \\(\\subsetneq\\) decidable \\(\\subsetneq\\) Turing-recognizable. Theorem 4.9 supplies the context-free \\(\\subseteq\\) decidable link.",
    source: "Sipser Thm 4.9, Fig. 4.10"
  },

  // ============ Countability and correspondences ============
  {
    id: "ch4-countable-def", chapter: 4, topic: "Countability", type: "mc",
    prompt: "By Sipser's definition, a set \\(A\\) is **countable** exactly when:",
    choices: [
      "\\(A\\) is finite, or \\(A\\) has the same size as \\(\\mathbb{N}\\) (there is a correspondence \\(f:\\mathbb{N}\\to A\\))",
      "\\(A\\) is infinite",
      "\\(A\\) is a subset of \\(\\mathbb{R}\\)",
      "\\(A\\) has strictly fewer elements than \\(\\mathbb{N}\\)"
    ],
    answer: 0,
    explanation: "A set is countable if it is finite or can be put in one-to-one correspondence with \\(\\mathbb{N}\\) — equivalently, its elements can be listed \\(a_1,a_2,a_3,\\dots\\)",
    source: "Sipser Def 4.14"
  },
  {
    id: "ch4-correspondence-fib", chapter: 4, topic: "Countability", type: "fib",
    prompt: "A function that is both one-to-one (injective) and onto (surjective) is called a correspondence, or by the one-word synonym ____.",
    accept: ["bijection", "a bijection", "bijective", "bijective function"],
    explanation: "A correspondence (bijection) pairs each element of \\(A\\) with a unique element of \\(B\\) and vice versa; Sipser uses it to define when two sets have the same size.",
    source: "Sipser Def 4.12"
  },
  {
    id: "ch4-rationals-countable", chapter: 4, topic: "Countability", type: "mc",
    prompt: "Sipser shows the positive rationals \\(\\mathbb{Q}\\) are countable. What is the key idea?",
    choices: [
      "Arrange the rationals in a 2D grid by numerator and denominator, then list them along diagonals, skipping repeats",
      "Map each rational to its decimal expansion",
      "Show \\(\\mathbb{Q}\\) is finite",
      "Pair each rational with a distinct real number"
    ],
    answer: 0,
    explanation: "Listing row-by-row fails (each row is infinite), but the diagonal sweep of the numerator/denominator grid reaches every fraction in finitely many steps, giving a correspondence with \\(\\mathbb{N}\\).",
    source: "Sipser Example 4.15"
  },
  {
    id: "ch4-countable-sets-multi", chapter: 4, topic: "Countability", type: "multi",
    prompt: "Which of the following sets are **countable**?",
    choices: [
      "The rational numbers \\(\\mathbb{Q}\\)",
      "\\(\\Sigma^*\\), the set of all finite strings over an alphabet \\(\\Sigma\\)",
      "The set of all Turing machines",
      "The set \\(\\mathbb{R}\\) of real numbers"
    ],
    answers: [0, 1, 2],
    explanation: "\\(\\mathbb{Q}\\) is countable (Ex 4.15); \\(\\Sigma^*\\) is countable since there are finitely many strings of each length; the TMs are countable because each has a finite encoding \\(\\langle M\\rangle\\). But \\(\\mathbb{R}\\) is uncountable (Thm 4.17).",
    source: "Sipser Thm 4.17, Cor 4.18"
  },

  // ============ Uncountability and diagonalization ============
  {
    id: "ch4-reals-uncountable", chapter: 4, topic: "Uncountability", type: "tf",
    prompt: "The set \\(\\mathbb{R}\\) of real numbers is uncountable.",
    answer: true,
    explanation: "Cantor's diagonalization shows no correspondence \\(f:\\mathbb{N}\\to\\mathbb{R}\\) exists: one can always build a real differing from \\(f(n)\\) in the \\(n\\)th decimal digit, so it is missed by the list.",
    source: "Sipser Thm 4.17"
  },
  {
    id: "ch4-diagonalization-idea", chapter: 4, topic: "Uncountability", type: "mc",
    prompt: "In Cantor's diagonalization proof that \\(\\mathbb{R}\\) is uncountable, how is the missing number \\(x\\) constructed from a hypothetical list \\(f(1),f(2),f(3),\\dots\\)?",
    choices: [
      "Choose the \\(n\\)th digit of \\(x\\) to differ from the \\(n\\)th digit of \\(f(n)\\), so \\(x\\neq f(n)\\) for every \\(n\\)",
      "Let \\(x\\) be the average of all the \\(f(n)\\)",
      "Let \\(x=f(1)+f(2)+\\cdots\\)",
      "Pick \\(x\\) to equal \\(f(n)\\) for the largest \\(n\\)"
    ],
    answer: 0,
    explanation: "By making \\(x\\) disagree with \\(f(n)\\) in the \\(n\\)th fractional digit (avoiding 0 and 9 to dodge representation ties), \\(x\\) cannot equal any \\(f(n)\\). So no list covers all reals.",
    source: "Sipser Thm 4.17"
  },
  {
    id: "ch4-languages-uncountable", chapter: 4, topic: "Uncountability", type: "tf",
    prompt: "The set of all languages over an alphabet \\(\\Sigma\\) is uncountable.",
    answer: true,
    explanation: "Each language corresponds to its characteristic (infinite binary) sequence over the listing of \\(\\Sigma^*\\). The set of all infinite binary sequences is uncountable by diagonalization, so the set of languages is uncountable.",
    source: "Sipser Cor 4.18 (proof)"
  },
  {
    id: "ch4-counting-existence", chapter: 4, topic: "Uncountability", type: "mc",
    prompt: "Sipser concludes that **some languages are not Turing-recognizable**. What is the core of the argument?",
    choices: [
      "There are only countably many Turing machines but uncountably many languages, so some language is recognized by no TM",
      "Every TM loops on some input, so it cannot recognize its language",
      "\\(A_{TM}\\) is undecidable, hence no language is recognizable",
      "The recognizable languages are not closed under complement"
    ],
    answer: 0,
    explanation: "Each TM recognizes at most one language and the TMs are countable, but the languages over \\(\\Sigma\\) are uncountable. By cardinality, recognizers cannot cover all languages — a non-constructive existence argument.",
    source: "Sipser Cor 4.18"
  },

  // ============ Undecidability of A_TM ============
  {
    id: "ch4-atm-undecidable", chapter: 4, topic: "Undecidability of A_TM", type: "tf",
    prompt: "The acceptance problem \\(A_{TM}=\\{\\langle M,w\\rangle\\mid M\\text{ is a TM and }M\\text{ accepts }w\\}\\) is undecidable.",
    answer: true,
    explanation: "Assuming a decider \\(H\\) for \\(A_{TM}\\), Sipser builds \\(D\\) that runs \\(H\\) on \\(\\langle M,\\langle M\\rangle\\rangle\\) and does the opposite. Running \\(D\\) on \\(\\langle D\\rangle\\) forces \\(D\\) to disagree with itself — a contradiction.",
    source: "Sipser Thm 4.11"
  },
  {
    id: "ch4-atm-recognizable-tf", chapter: 4, topic: "Undecidability of A_TM", type: "tf",
    prompt: "Although \\(A_{TM}\\) is undecidable, it is Turing-recognizable.",
    answer: true,
    explanation: "The universal TM \\(U\\) simulates \\(M\\) on \\(w\\) and accepts iff \\(M\\) accepts; it recognizes \\(A_{TM}\\). It loops exactly when \\(M\\) loops on \\(w\\), which is why it recognizes but does not decide \\(A_{TM}\\).",
    source: "Sipser Thm 4.11"
  },
  {
    id: "ch4-universal-tm-fib", chapter: 4, topic: "Undecidability of A_TM", type: "fib",
    prompt: "The machine \\(U\\) that simulates an arbitrary TM \\(M\\) on input \\(w\\) from the description \\(\\langle M\\rangle\\) — and thereby recognizes \\(A_{TM}\\) — is called the ____ Turing machine.",
    accept: ["universal", "the universal"],
    explanation: "Turing's universal machine \\(U\\) can simulate any other TM given that machine's encoding; it recognizes \\(A_{TM}\\) and foreshadowed the stored-program computer.",
    source: "Sipser Thm 4.11"
  },
  {
    id: "ch4-diagonal-d-behavior", chapter: 4, topic: "Undecidability of A_TM", type: "mc",
    prompt: "In the proof that \\(A_{TM}\\) is undecidable, the machine \\(D\\) (built from the assumed decider \\(H\\)) is defined so that on input \\(\\langle M\\rangle\\) it:",
    choices: [
      "accepts \\(\\langle M\\rangle\\) iff \\(M\\) does NOT accept \\(\\langle M\\rangle\\)",
      "accepts \\(\\langle M\\rangle\\) iff \\(M\\) accepts \\(\\langle M\\rangle\\)",
      "loops iff \\(M\\) halts on \\(\\langle M\\rangle\\)",
      "accepts every input \\(\\langle M\\rangle\\)"
    ],
    answer: 0,
    explanation: "\\(D\\) runs \\(H\\) on \\(\\langle M,\\langle M\\rangle\\rangle\\) and outputs the opposite. Feeding \\(D\\) its own description gives \"\\(D\\) accepts \\(\\langle D\\rangle\\) iff \\(D\\) does not accept \\(\\langle D\\rangle\\)\" — the contradiction.",
    source: "Sipser Thm 4.11"
  },
  {
    id: "ch4-reductio-steps-order", chapter: 4, topic: "Undecidability of A_TM", type: "order",
    prompt: "Order the steps of the diagonalization proof that \\(A_{TM}\\) is undecidable.",
    items: [
      "Assume \\(H\\) is a decider for \\(A_{TM}\\): \\(H\\) accepts \\(\\langle M,w\\rangle\\) iff \\(M\\) accepts \\(w\\)",
      "Build \\(D\\) that on \\(\\langle M\\rangle\\) runs \\(H\\) on \\(\\langle M,\\langle M\\rangle\\rangle\\) and outputs the opposite",
      "Run \\(D\\) on its own description \\(\\langle D\\rangle\\)",
      "Derive the contradiction: \\(D\\) accepts \\(\\langle D\\rangle\\) iff \\(D\\) does not accept \\(\\langle D\\rangle\\), so \\(H\\) cannot exist"
    ],
    explanation: "The proof is reductio ad absurdum: suppose a decider \\(H\\) exists, construct the self-contradicting \\(D\\), run \\(D\\) on itself, and reach a contradiction — hence no decider \\(H\\) exists.",
    source: "Sipser Thm 4.11"
  },

  // ============ A Turing-unrecognizable language ============
  {
    id: "ch4-decidable-iff-thm", chapter: 4, topic: "Co-recognizability", type: "tf",
    prompt: "A language is decidable if and only if it is both Turing-recognizable and co-Turing-recognizable.",
    answer: true,
    explanation: "If \\(A\\) and \\(\\overline{A}\\) have recognizers \\(M_1,M_2\\), run them in parallel: one must accept every input, giving a decider. Conversely, a decidable language and its complement are both recognizable.",
    source: "Sipser Thm 4.22"
  },
  {
    id: "ch4-co-turing-fib", chapter: 4, topic: "Co-recognizability", type: "fib",
    prompt: "A language whose **complement** is Turing-recognizable is called ____-recognizable (give the prefix term Sipser uses).",
    accept: ["co-turing", "co turing", "coturing", "co-turing-recognizable", "co"],
    explanation: "A language is co-Turing-recognizable when it is the complement of a Turing-recognizable language. Theorem 4.22: decidable = Turing-recognizable AND co-Turing-recognizable.",
    source: "Sipser §4.2"
  },
  {
    id: "ch4-complement-atm-unrecognizable", chapter: 4, topic: "Co-recognizability", type: "tf",
    prompt: "The complement \\(\\overline{A_{TM}}\\) is not Turing-recognizable.",
    answer: true,
    explanation: "\\(A_{TM}\\) is recognizable. If \\(\\overline{A_{TM}}\\) were also recognizable, then by Theorem 4.22 \\(A_{TM}\\) would be decidable — contradicting Theorem 4.11. So \\(\\overline{A_{TM}}\\) is unrecognizable.",
    source: "Sipser Cor 4.23"
  },
  {
    id: "ch4-atm-not-co-recognizable-mc", chapter: 4, topic: "Co-recognizability", type: "mc",
    prompt: "Which statement about \\(A_{TM}\\) and its complement is correct?",
    choices: [
      "\\(A_{TM}\\) is Turing-recognizable but not co-Turing-recognizable, and \\(\\overline{A_{TM}}\\) is not Turing-recognizable",
      "Both \\(A_{TM}\\) and \\(\\overline{A_{TM}}\\) are Turing-recognizable",
      "\\(A_{TM}\\) is decidable but \\(\\overline{A_{TM}}\\) is not",
      "Neither \\(A_{TM}\\) nor \\(\\overline{A_{TM}}\\) is Turing-recognizable"
    ],
    answer: 0,
    explanation: "\\(A_{TM}\\) is recognizable (via \\(U\\)) but not decidable; if it were also co-recognizable it would be decidable (Thm 4.22). Hence \\(A_{TM}\\) is not co-recognizable and \\(\\overline{A_{TM}}\\) is not recognizable.",
    source: "Sipser Thm 4.22, Cor 4.23"
  },
  {
    id: "ch4-parallel-decider-mc", chapter: 4, topic: "Co-recognizability", type: "mc",
    prompt: "In the proof of Theorem 4.22, given recognizers \\(M_1\\) for \\(A\\) and \\(M_2\\) for \\(\\overline{A}\\), how is a decider for \\(A\\) built?",
    choices: [
      "Run \\(M_1\\) and \\(M_2\\) in parallel on \\(w\\); accept if \\(M_1\\) accepts, reject if \\(M_2\\) accepts",
      "Run \\(M_1\\) to completion, then run \\(M_2\\)",
      "Run \\(M_1\\) for \\(|w|\\) steps and guess the answer",
      "Convert \\(M_1\\) and \\(M_2\\) to DFAs and intersect them"
    ],
    answer: 0,
    explanation: "Every \\(w\\) is in \\(A\\) or in \\(\\overline{A}\\), so exactly one of \\(M_1,M_2\\) accepts. Simulating both in parallel guarantees halting, yielding a decider. (Running them sequentially could loop on the first.)",
    source: "Sipser Thm 4.22"
  },

  // ============ Synthesis / classification ============
  {
    id: "ch4-classify-undecidable-pick", chapter: 4, topic: "Classification", type: "mc",
    prompt: "Which one of the following languages is **undecidable**?",
    choices: [
      "\\(A_{TM}=\\{\\langle M,w\\rangle\\mid M\\text{ accepts }w\\}\\)",
      "\\(A_{CFG}=\\{\\langle G,w\\rangle\\mid G\\text{ generates }w\\}\\)",
      "\\(E_{DFA}=\\{\\langle A\\rangle\\mid L(A)=\\emptyset\\}\\)",
      "\\(EQ_{DFA}=\\{\\langle A,B\\rangle\\mid L(A)=L(B)\\}\\)"
    ],
    answer: 0,
    explanation: "\\(A_{TM}\\) is undecidable (Thm 4.11). The other three — CFG membership, DFA emptiness, and DFA equivalence — are all decidable.",
    source: "Sipser Thm 4.11"
  },
  {
    id: "ch4-classify-decidable-pick", chapter: 4, topic: "Classification", type: "mc",
    prompt: "Which one of the following languages is **decidable**?",
    choices: [
      "\\(A_{CFG}=\\{\\langle G,w\\rangle\\mid G\\text{ is a CFG generating }w\\}\\)",
      "\\(A_{TM}=\\{\\langle M,w\\rangle\\mid M\\text{ accepts }w\\}\\)",
      "\\(\\overline{A_{TM}}\\), the complement of \\(A_{TM}\\)",
      "\\(EQ_{CFG}=\\{\\langle G,H\\rangle\\mid L(G)=L(H)\\}\\)"
    ],
    answer: 0,
    explanation: "\\(A_{CFG}\\) is decidable (Thm 4.7). \\(A_{TM}\\) is undecidable, \\(\\overline{A_{TM}}\\) is not even recognizable, and \\(EQ_{CFG}\\) is undecidable.",
    source: "Sipser Thm 4.7"
  },
  {
    id: "ch4-classic-traps-multi", chapter: 4, topic: "Classification", type: "multi",
    prompt: "Which of the following statements are **true**?",
    choices: [
      "\\(A_{TM}\\) is Turing-recognizable",
      "Every context-free language is decidable",
      "\\(EQ_{DFA}\\) is decidable",
      "\\(\\overline{A_{TM}}\\) is Turing-recognizable"
    ],
    answers: [0, 1, 2],
    explanation: "\\(A_{TM}\\) is recognizable (Thm 4.11), every CFL is decidable (Thm 4.9), and \\(EQ_{DFA}\\) is decidable (Thm 4.5). The false one is the classic trap: \\(\\overline{A_{TM}}\\) is NOT recognizable (Cor 4.23).",
    source: "Sipser Thms 4.5, 4.9, 4.11, Cor 4.23"
  }
]);
