/* Chapter 6 — Advanced Topics in Computability (Sipser §6.1, §6.3, §6.4).
   Course scope: the recursion theorem (Thm 6.3) and its applications, with light
   coverage of Turing reducibility (§6.3) and descriptive/Kolmogorov complexity
   (§6.4). Assigned Problem 6.24 = "the set of incompressible strings is
   undecidable"; supplemental 5.30 surfaces here as the recursion-theorem proof of
   Rice's theorem (Problem 6.9). */
TOC.addQuestions([
  // ---- The recursion theorem: statement & self-reference ----
  {
    id: "ch6-recursion-statement-tf", chapter: 6, topic: "Recursion theorem", type: "tf",
    prompt: "The recursion theorem says a Turing machine can obtain its own description \\(\\langle M\\rangle\\) and then go on to compute with it.",
    answer: true,
    explanation: "This is exactly the content of Thm 6.3: from a machine \\(T\\) computing \\(t(\\langle R\\rangle, w)\\) one obtains a machine \\(R\\) with \\(r(w)=t(\\langle R\\rangle, w)\\), so \\(R\\) acts as if its own description were handed to it for free.",
    source: "Sipser Thm 6.3"
  },
  {
    id: "ch6-recursion-self-purpose-mc", chapter: 6, topic: "Recursion theorem", type: "mc",
    prompt: "The machine \\(\\mathit{SELF}\\) constructed before the recursion theorem does what on every input?",
    choices: [
      "Ignores its input and prints out its own description \\(\\langle \\mathit{SELF}\\rangle\\)",
      "Loops forever on every input",
      "Accepts iff its input encodes a Turing machine",
      "Prints the description of the universal Turing machine"
    ],
    answer: 0,
    explanation: "\\(\\mathit{SELF}\\) is built in two parts \\(A\\) and \\(B\\): \\(A\\) prints \\(\\langle B\\rangle\\), then \\(B\\) computes \\(\\langle A\\rangle\\) from the tape and assembles \\(\\langle AB\\rangle=\\langle \\mathit{SELF}\\rangle\\). It outputs a copy of itself, ignoring the input.",
    source: "Sipser §6.1 (the machine SELF)"
  },
  {
    id: "ch6-recursion-lemma-q-mc", chapter: 6, topic: "Recursion theorem", type: "mc",
    prompt: "Lemma 6.1 supplies a computable function \\(q\\colon \\Sigma^*\\to\\Sigma^*\\). What is \\(q(w)\\)?",
    choices: [
      "The description \\(\\langle P_w\\rangle\\) of a TM \\(P_w\\) that prints \\(w\\) and then halts",
      "The string \\(w\\) reversed",
      "An accepting computation history of some fixed TM on \\(w\\)",
      "The length of \\(w\\) written in binary"
    ],
    answer: 0,
    explanation: "\\(q\\) maps a string \\(w\\) to the encoding of a machine \\(P_w\\) that erases its input, writes \\(w\\), and halts. This 'hard-code a string into a printer' step is the engine behind both \\(\\mathit{SELF}\\) and the recursion theorem.",
    source: "Sipser Lemma 6.1"
  },
  {
    id: "ch6-recursion-part-b-mc", chapter: 6, topic: "Recursion theorem", type: "mc",
    prompt: "In the construction of \\(\\mathit{SELF}=AB\\), part \\(A\\) is the machine \\(P_{\\langle B\\rangle}\\) (it prints \\(\\langle B\\rangle\\)). How does part \\(B\\) obtain \\(\\langle B\\rangle\\) so it can compute \\(\\langle A\\rangle=q(\\langle B\\rangle)\\)?",
    choices: [
      "It reads \\(\\langle B\\rangle\\) off the tape, where \\(A\\) left it",
      "It is defined directly as \\(q(\\langle A\\rangle)\\)",
      "It queries an oracle for \\(A_{TM}\\)",
      "It guesses \\(\\langle B\\rangle\\) nondeterministically"
    ],
    answer: 0,
    explanation: "Defining \\(B\\) as \\(q(\\langle A\\rangle)\\) would be circular (\\(A\\) is already defined via \\(B\\)). Instead \\(B\\) finds \\(\\langle B\\rangle\\) already on the tape — left there by \\(A\\) — then applies \\(q\\) to recover \\(\\langle A\\rangle\\) and assembles \\(\\langle AB\\rangle\\).",
    source: "Sipser §6.1 (construction of SELF)"
  },
  {
    id: "ch6-recursion-self-order", chapter: 6, topic: "Recursion theorem", type: "order",
    prompt: "Order the steps that occur when the self-printing machine \\(\\mathit{SELF}=AB\\) runs.",
    items: [
      "\\(A\\) runs and prints \\(\\langle B\\rangle\\) on the tape",
      "\\(B\\) starts and reads \\(\\langle B\\rangle\\) from the tape",
      "\\(B\\) computes \\(q(\\langle B\\rangle)=\\langle A\\rangle\\) and combines it with \\(\\langle B\\rangle\\)",
      "\\(B\\) prints \\(\\langle AB\\rangle=\\langle \\mathit{SELF}\\rangle\\) and halts"
    ],
    explanation: "\\(A\\) leaves \\(\\langle B\\rangle\\) on the tape; \\(B\\) reads it, recovers \\(\\langle A\\rangle\\) via \\(q\\), assembles the whole description, and prints it. The same trick implements the self-referential 'this' in any programming language.",
    source: "Sipser §6.1 (behavior of SELF)"
  },
  {
    id: "ch6-recursion-usage-tf", chapter: 6, topic: "Recursion theorem", type: "tf",
    prompt: "When designing a TM \\(M\\), the recursion theorem lets you legitimately write the instruction \"obtain own description \\(\\langle M\\rangle\\)\" inside \\(M\\)'s own algorithm.",
    answer: true,
    explanation: "The theorem justifies using \\(\\langle M\\rangle\\) as a computed value inside \\(M\\). Having it, \\(M\\) can print it, count its states, simulate it, etc. — this is the standard way the theorem is applied.",
    source: "Sipser §6.1 (terminology for the recursion theorem)"
  },

  // ---- Applications of the recursion theorem ----
  {
    id: "ch6-atm-recursion-mc", chapter: 6, topic: "Recursion theorem applications", type: "mc",
    prompt: "In the recursion-theorem proof that \\(A_{TM}\\) is undecidable, assume \\(H\\) decides \\(A_{TM}\\). The machine \\(B\\) obtains \\(\\langle B\\rangle\\), runs \\(H\\) on \\(\\langle B,w\\rangle\\), and then:",
    choices: [
      "does the opposite of \\(H\\)'s answer (accept if \\(H\\) rejects, reject if \\(H\\) accepts)",
      "accepts iff \\(H\\) accepts",
      "loops forever regardless of \\(H\\)",
      "prints \\(\\langle H\\rangle\\) and halts"
    ],
    answer: 0,
    explanation: "\\(B\\) asks \\(H\\) whether \\(B\\) itself accepts \\(w\\) and then does the opposite, so \\(B\\)'s actual behavior contradicts \\(H\\)'s verdict on \\(\\langle B,w\\rangle\\). Hence no such \\(H\\) exists. This replaces the diagonalization of Thm 4.11.",
    source: "Sipser Thm 6.5"
  },
  {
    id: "ch6-atm-no-diagonal-tf", chapter: 6, topic: "Recursion theorem applications", type: "tf",
    prompt: "The recursion-theorem proof of the undecidability of \\(A_{TM}\\) (Thm 6.5) avoids Cantor's diagonalization argument used in the original Thm 4.11 proof.",
    answer: true,
    explanation: "Self-reference does the work that diagonalization did before: \\(B\\) obtains its own description and contradicts the assumed decider directly, giving a shorter proof than the diagonal method.",
    source: "Sipser Thm 6.5"
  },
  {
    id: "ch6-mintm-recognizable-mc", chapter: 6, topic: "Recursion theorem applications", type: "mc",
    prompt: "Let \\(MIN_{TM}=\\{\\langle M\\rangle \\mid M \\text{ is a minimal TM}\\}\\) (no equivalent TM has a shorter description). What does the recursion theorem establish about it?",
    choices: [
      "\\(MIN_{TM}\\) is not Turing-recognizable",
      "\\(MIN_{TM}\\) is decidable",
      "\\(MIN_{TM}\\) is regular",
      "\\(MIN_{TM}\\) is finite"
    ],
    answer: 0,
    explanation: "If an enumerator \\(E\\) listed \\(MIN_{TM}\\), a machine \\(C\\) could obtain \\(\\langle C\\rangle\\), wait for \\(E\\) to list some \\(D\\) longer than \\(C\\), and simulate \\(D\\). Then \\(C\\equiv D\\) but is shorter, so \\(D\\) isn't minimal — contradiction.",
    source: "Sipser Thm 6.7"
  },
  {
    id: "ch6-mintm-why-mc", chapter: 6, topic: "Recursion theorem applications", type: "mc",
    prompt: "In the proof that \\(MIN_{TM}\\) is not Turing-recognizable, the machine \\(C\\) obtains \\(\\langle C\\rangle\\) and then searches the enumerator's output for a machine \\(D\\) that is longer than \\(C\\), and finally simulates \\(D\\). Where does the contradiction come from?",
    choices: [
      "\\(C\\) is equivalent to \\(D\\) but shorter, so \\(D\\) cannot be minimal even though \\(E\\) listed it",
      "\\(C\\) halts on no inputs, so it is not a valid TM",
      "\\(D\\) must be equal to \\(C\\), so the list repeats",
      "\\(E\\) cannot enumerate any infinite language"
    ],
    answer: 0,
    explanation: "Because \\(MIN_{TM}\\) is infinite, \\(E\\) must eventually output some \\(D\\) longer than \\(C\\). Simulating \\(D\\) makes \\(C\\equiv D\\); since \\(|\\langle C\\rangle|<|\\langle D\\rangle|\\), \\(D\\) isn't minimal, yet it appeared on \\(E\\)'s list of minimal machines.",
    source: "Sipser Thm 6.7"
  },
  {
    id: "ch6-fixedpoint-mc", chapter: 6, topic: "Recursion theorem applications", type: "mc",
    prompt: "The fixed-point version of the recursion theorem (Thm 6.8) states that for every computable transformation \\(t\\colon \\Sigma^*\\to\\Sigma^*\\) of TM descriptions, there is a TM \\(F\\) such that:",
    choices: [
      "\\(t(\\langle F\\rangle)\\) describes a TM equivalent to \\(F\\)",
      "\\(t(\\langle F\\rangle)=\\langle F\\rangle\\) as strings",
      "\\(F\\) halts on every input",
      "\\(t\\) is the identity transformation"
    ],
    answer: 0,
    explanation: "A fixed point need not be unchanged as a string — \\(F\\) is a fixed point up to behavior: \\(t(\\langle F\\rangle)\\) and \\(\\langle F\\rangle\\) describe equivalent machines. \\(F\\) obtains \\(\\langle F\\rangle\\), computes \\(t(\\langle F\\rangle)=\\langle G\\rangle\\), and simulates \\(G\\).",
    source: "Sipser Thm 6.8"
  },
  {
    id: "ch6-rice-recursion-tf", chapter: 6, topic: "Recursion theorem applications", type: "tf",
    prompt: "Rice's theorem can be proved using the recursion theorem: if \\(X\\) decided a nontrivial property \\(P\\) of TM languages, build \\(R\\) that obtains \\(\\langle R\\rangle\\), runs \\(X\\) on \\(\\langle R\\rangle\\), and then behaves like a machine on the opposite side of \\(P\\).",
    answer: true,
    explanation: "Pick \\(A\\) with \\(\\langle A\\rangle\\in P\\) and \\(B\\) with \\(\\langle B\\rangle\\notin P\\). \\(R\\) simulates \\(B\\) if \\(X\\) accepts \\(\\langle R\\rangle\\) and simulates \\(A\\) if \\(X\\) rejects, making \\(R\\)'s membership in \\(P\\) inconsistent with \\(X\\)'s verdict.",
    source: "Sipser Problem 6.9 (recursion-theorem proof of Rice's theorem)"
  },
  {
    id: "ch6-virus-fib", chapter: 6, topic: "Recursion theorem applications", type: "fib",
    prompt: "Sipser notes that to carry out its self-replication, a computer ____ may contain the construction from the proof of the recursion theorem. (one word)",
    accept: ["virus", "a virus"],
    explanation: "A computer virus copies itself into other hosts; the recursion theorem's self-reproducing construction is precisely the mechanism that makes printing one's own code possible.",
    source: "Sipser §6.1 (applications)"
  },

  // ---- Turing reducibility (§6.3, light) ----
  {
    id: "ch6-oracle-def-mc", chapter: 6, topic: "Turing reducibility", type: "mc",
    prompt: "An oracle for a language \\(B\\) is:",
    choices: [
      "an external device that reports, for any string \\(w\\), whether \\(w\\in B\\)",
      "a TM that enumerates \\(B\\) in lexicographic order",
      "a polynomial-time algorithm for \\(B\\)",
      "a proof that \\(B\\) is decidable"
    ],
    answer: 0,
    explanation: "An oracle answers membership queries \"\\(w\\in B\\)?\" in one step, with no concern for how. An oracle TM \\(M^{B}\\) is a TM augmented with the ability to query such an oracle.",
    source: "Sipser Def 6.18"
  },
  {
    id: "ch6-turing-reducible-def-mc", chapter: 6, topic: "Turing reducibility", type: "mc",
    prompt: "Language \\(A\\) is Turing reducible to \\(B\\), written \\(A\\le_T B\\), exactly when:",
    choices: [
      "\\(A\\) is decidable relative to \\(B\\) (some oracle TM \\(M^{B}\\) decides \\(A\\))",
      "there is a computable \\(f\\) with \\(w\\in A \\Leftrightarrow f(w)\\in B\\)",
      "\\(A\\) and \\(B\\) are both Turing-recognizable",
      "\\(A\\subseteq B\\)"
    ],
    answer: 0,
    explanation: "\\(A\\le_T B\\) means an oracle TM with an oracle for \\(B\\) decides \\(A\\). The second choice is the definition of mapping reducibility \\(\\le_m\\), a strictly more restrictive notion.",
    source: "Sipser Def 6.20"
  },
  {
    id: "ch6-mapping-implies-turing-tf", chapter: 6, topic: "Turing reducibility", type: "tf",
    prompt: "If \\(A\\le_m B\\) then \\(A\\le_T B\\), but the converse can fail: for example \\(\\overline{A_{TM}}\\le_T A_{TM}\\) even though \\(\\overline{A_{TM}}\\not\\le_m A_{TM}\\).",
    answer: true,
    explanation: "Turing reducibility generalizes mapping reducibility (a mapping reduction yields an oracle machine). But \\(\\overline{A_{TM}}\\le_T A_{TM}\\) (just flip the oracle's answer), while \\(\\overline{A_{TM}}\\not\\le_m A_{TM}\\) since \\(A_{TM}\\) is recognizable and \\(\\overline{A_{TM}}\\) is not.",
    source: "Sipser §6.3 (Thm 6.21 discussion)"
  },
  {
    id: "ch6-oracle-etm-tf", chapter: 6, topic: "Turing reducibility", type: "tf",
    prompt: "An oracle Turing machine with an oracle for \\(A_{TM}\\) can decide \\(E_{TM}\\) (the emptiness problem for TMs).",
    answer: true,
    explanation: "Given \\(\\langle M\\rangle\\), build \\(N\\) that accepts every input iff \\(L(M)\\neq\\emptyset\\), then ask the oracle whether \\(\\langle N,0\\rangle\\in A_{TM}\\). So \\(E_{TM}\\le_T A_{TM}\\): it is decidable relative to \\(A_{TM}\\).",
    source: "Sipser Example 6.19"
  },

  // ---- Descriptive / Kolmogorov complexity (§6.4) + Problem 6.24 ----
  {
    id: "ch6-kolmogorov-def-mc", chapter: 6, topic: "Descriptive complexity", type: "mc",
    prompt: "The descriptive (Kolmogorov) complexity \\(K(x)\\) of a binary string \\(x\\) is defined as:",
    choices: [
      "the length \\(|d(x)|\\) of a shortest description \\(\\langle M,w\\rangle\\) on which \\(M\\) on input \\(w\\) halts with \\(x\\) on its tape",
      "the number of \\(1\\)s in \\(x\\)",
      "the running time of the fastest TM that prints \\(x\\)",
      "the number of distinct substrings of \\(x\\)"
    ],
    answer: 0,
    explanation: "\\(d(x)\\) is the shortest (lexicographically first if tied) string \\(\\langle M,w\\rangle\\) such that \\(M\\) on \\(w\\) outputs \\(x\\); \\(K(x)=|d(x)|\\) measures the information content of \\(x\\) as its minimal description length.",
    source: "Sipser Def 6.23"
  },
  {
    id: "ch6-kolmogorov-upper-mc", chapter: 6, topic: "Descriptive complexity", type: "mc",
    prompt: "Which bound on descriptive complexity holds for a universal constant \\(c\\) and every string \\(x\\)?",
    choices: [
      "\\(K(x)\\le |x|+c\\)",
      "\\(K(x)\\ge 2|x|\\)",
      "\\(K(x)=|x|\\) for all \\(x\\)",
      "\\(K(x)\\le \\log_2|x|\\)"
    ],
    answer: 0,
    explanation: "Describe \\(x\\) by \\(\\langle M\\rangle x\\) where \\(M\\) is the identity machine; taking \\(c=|\\langle M\\rangle|\\) gives \\(K(x)\\le|x|+c\\). A string's information is at most a constant more than its length.",
    source: "Sipser Thm 6.24"
  },
  {
    id: "ch6-incompressible-exist-tf", chapter: 6, topic: "Descriptive complexity", type: "tf",
    prompt: "Incompressible strings (where \\(K(x)\\ge|x|\\)) exist of every length.",
    answer: true,
    explanation: "There are \\(2^n\\) strings of length \\(n\\) but only \\(2^n-1\\) descriptions of length \\(<n\\), and each description yields at most one string. So some length-\\(n\\) string has no shorter description — it is incompressible.",
    source: "Sipser Thm 6.29"
  },
  {
    id: "ch6-incompressible-fib", chapter: 6, topic: "Descriptive complexity", type: "fib",
    prompt: "A string \\(x\\) with no description shorter than itself (\\(K(x)\\ge|x|\\)) is called ____.",
    accept: ["incompressible", "incompressible by 1"],
    explanation: "Sipser calls \\(x\\) incompressible when it is incompressible by \\(1\\), i.e. \\(K(x)\\ge|x|\\). Such strings behave like random strings (roughly equal \\(0\\)s and \\(1\\)s, etc.).",
    source: "Sipser Def 6.28"
  },
  {
    id: "ch6-prob624-incompressible-undecidable-mc", chapter: 6, topic: "Descriptive complexity", type: "mc",
    prompt: "Problem 6.24 asks you to prove which fact about the set of incompressible strings?",
    choices: [
      "The set of incompressible strings is undecidable",
      "The set of incompressible strings is regular",
      "The set of incompressible strings is finite",
      "The set of incompressible strings is empty"
    ],
    answer: 0,
    explanation: "Problem 6.24: no algorithm decides whether a string is incompressible. (Relatedly, \\(K\\) itself is not computable by Problem 6.23, and the incompressible strings contain no infinite Turing-recognizable subset by Problem 6.25.)",
    source: "Sipser Problem 6.24"
  },
  {
    id: "ch6-k-not-computable-tf", chapter: 6, topic: "Descriptive complexity", type: "tf",
    prompt: "The function \\(K(x)\\) (descriptive complexity) is computable: a Turing machine can output \\(K(x)\\) given \\(x\\).",
    answer: false,
    explanation: "By Problem 6.23, \\(K\\) is not computable. If it were, one could effectively find incompressible strings and even decide incompressibility (Problem 6.24), which is impossible.",
    source: "Sipser Problem 6.23"
  }
]);
