/* Chapter 5 — Reducibility: VERY BEGINNER definitions & explainers (Sipser 5.1–5.3).
   Plain-language "what is it" questions for a smart 6th-grader. One idea each.
   The star of this file is the plain meaning of a REDUCTION (several gentle questions),
   plus mapping reducibility, the famous undecidable problems by name, and the
   key vocabulary: computation history, LBA, PCP, Rice's theorem.
   Every question is rank 0; ids are prefixed "ch5-basic-". No proofs. */
TOC.addQuestions([
  // ============================================================
  // WHAT IS A REDUCTION?  (the heart of the chapter — several gentle takes)
  // ============================================================
  {
    id: "ch5-basic-reduction-meaning", chapter: 5, topic: "What is a reduction", type: "mc", rank: 0,
    prompt: "In plain words, **reducing** problem \\(A\\) to problem \\(B\\) means:",
    choices: [
      "turning any question about \\(A\\) into a question about \\(B\\), so that solving \\(B\\) would also solve \\(A\\)",
      "making problem \\(A\\) smaller and easier",
      "proving \\(A\\) and \\(B\\) are the exact same problem",
      "deleting problem \\(A\\) once you know about \\(B\\)"
    ],
    answer: 0,
    explanation: "A reduction is a way to rewrite a question about \\(A\\) as a question about \\(B\\). If you had a way to answer \\(B\\), you could answer \\(A\\) too. The word does NOT mean \"shrink\" — it means \"convert one problem into another.\"",
    source: "Sipser §5.1 (idea of reducibility)"
  },
  {
    id: "ch5-basic-reduction-using-b", chapter: 5, topic: "What is a reduction", type: "tf", rank: 0,
    prompt: "If \\(A\\) reduces to \\(B\\), then having a solver for \\(B\\) would let you solve \\(A\\).",
    answer: true,
    explanation: "That is the whole point of a reduction: it lets you borrow \\(B\\)'s solver to answer \\(A\\). You convert your \\(A\\)-question into a \\(B\\)-question, ask \\(B\\)'s solver, and use its answer.",
    source: "Sipser §5.1 (idea of reducibility)"
  },
  {
    id: "ch5-basic-reduction-hardness", chapter: 5, topic: "What is a reduction", type: "mc", rank: 0,
    prompt: "Suppose \\(A\\) is known to be **hard** (no machine can solve it) and \\(A\\) reduces to \\(B\\). What does that tell you about \\(B\\)?",
    choices: [
      "\\(B\\) must be hard too",
      "\\(B\\) must be easy",
      "\\(B\\) is exactly as easy as \\(A\\) looks",
      "nothing at all about \\(B\\)"
    ],
    answer: 0,
    explanation: "Hardness flows \"uphill.\" If solving \\(B\\) would let you solve the hard problem \\(A\\), then \\(B\\) can't be easy — otherwise \\(A\\) would be easy too. So \\(A\\) hard plus \\(A\\) reduces to \\(B\\) makes \\(B\\) hard.",
    source: "Sipser §5.1 (idea of reducibility)"
  },
  {
    id: "ch5-basic-reduction-slogan-fib", chapter: 5, topic: "What is a reduction", type: "fib", rank: 0,
    prompt: "Fill in the slogan: if \\(A\\) is hard and \\(A\\) reduces to \\(B\\), then \\(B\\) is ____ too.",
    accept: ["hard", "hard too", "also hard", "undecidable", "difficult"],
    explanation: "The one-line takeaway of the whole chapter: reducing a hard problem INTO \\(B\\) makes \\(B\\) hard. Solving \\(B\\) would solve the hard problem, which is impossible.",
    source: "Sipser §5.1 (idea of reducibility)"
  },
  {
    id: "ch5-basic-reduction-why-known-hard", chapter: 5, topic: "What is a reduction", type: "mc", rank: 0,
    prompt: "To show a brand-new problem \\(B\\) is undecidable, which problem do we reduce, and in which direction?",
    choices: [
      "reduce a KNOWN-hard problem like \\(A_{TM}\\) TO the new problem \\(B\\)",
      "reduce the new problem \\(B\\) to an easy problem",
      "reduce \\(B\\) to a known-hard problem like \\(A_{TM}\\)",
      "reduce two easy problems to each other"
    ],
    answer: 0,
    explanation: "We start from a problem we already KNOW is hard (such as \\(A_{TM}\\)) and turn it into \\(B\\). If \\(B\\) could be solved, the known-hard problem could be solved — impossible. So \\(B\\) is hard. Always reduce the known-hard problem TO the new one.",
    source: "Sipser §5.1 (strategy of Thm 5.1)"
  },
  {
    id: "ch5-basic-reduction-known-hard-name-fib", chapter: 5, topic: "What is a reduction", type: "fib", rank: 0,
    prompt: "The famous already-known-to-be-undecidable problem we usually start from (does TM \\(M\\) accept \\(w\\)?) is written \\(A_{??}\\). Give the two-letter subscript.",
    accept: ["TM", "tm"],
    explanation: "\\(A_{TM}\\) — \"does machine \\(M\\) accept input \\(w\\)?\" — is our trusted hard problem. We reduce it to a new problem to prove the new one is hard too.",
    source: "Sipser Thm 4.11; §5.1"
  },
  {
    id: "ch5-basic-reduction-wrong-direction", chapter: 5, topic: "What is a reduction", type: "tf", rank: 0,
    prompt: "Reducing the **wrong way** — turning your new problem \\(B\\) into a known-hard problem — proves \\(B\\) is hard.",
    answer: false,
    explanation: "That direction proves nothing about \\(B\\) being hard. Showing \\(B\\) turns into a hard problem only says \\(B\\) is \"no harder than\" that problem — \\(B\\) could still be easy. To prove \\(B\\) is hard, turn the KNOWN-hard problem INTO \\(B\\).",
    source: "Sipser §5.1 (common direction mistake)"
  },

  // ============================================================
  // MAPPING REDUCIBILITY  (the precise version, in plain words)
  // ============================================================
  {
    id: "ch5-basic-computable-fn", chapter: 5, topic: "Computable function", type: "mc", rank: 0,
    prompt: "A **computable function** is best described as:",
    choices: [
      "a rule a Turing machine can carry out: it reads any input, always halts, and leaves the answer on the tape",
      "any rule a human can imagine",
      "a function that is one-to-one",
      "a function that only a DFA can compute"
    ],
    answer: 0,
    explanation: "A function is computable when some Turing machine takes any input, always finishes, and writes the output. It is just a transformation a machine can actually perform and always complete.",
    source: "Sipser Def 5.17"
  },
  {
    id: "ch5-basic-mapping-plain", chapter: 5, topic: "Mapping reducibility", type: "mc", rank: 0,
    prompt: "A **mapping reduction** \\(A\\le_m B\\) is a computable function \\(f\\) that, in plain words:",
    choices: [
      "rewrites each input \\(w\\) into a new input \\(f(w)\\) so that \\(w\\) is a yes-instance of \\(A\\) exactly when \\(f(w)\\) is a yes-instance of \\(B\\)",
      "lists every string that is in \\(A\\)",
      "runs \\(A\\) and \\(B\\) at the same time",
      "makes \\(A\\) and \\(B\\) equal"
    ],
    answer: 0,
    explanation: "A mapping reduction is a machine-computable translator \\(f\\): a string is a \"yes\" for \\(A\\) precisely when its translation is a \"yes\" for \\(B\\). Yes maps to yes, no maps to no.",
    source: "Sipser Def 5.20"
  },
  {
    id: "ch5-basic-mapping-symbol-fib", chapter: 5, topic: "Mapping reducibility", type: "fib", rank: 0,
    prompt: "\"\\(A\\) is mapping reducible to \\(B\\)\" is written \\(A\\) (symbol) \\(B\\). Type the symbol as the book writes it, like \\(\\le_m\\).",
    accept: ["\\le_m", "<=_m", "<=m", "le_m", "\\leq_m", "≤_m", "<= m"],
    explanation: "The notation is \\(A\\le_m B\\). The little \\(m\\) stands for \"mapping\" (also called \"many-one\").",
    source: "Sipser Def 5.20"
  },
  {
    id: "ch5-basic-mapping-iff", chapter: 5, topic: "Mapping reducibility", type: "tf", rank: 0,
    prompt: "For a mapping reduction \\(f\\) from \\(A\\) to \\(B\\), it must be that \\(w\\in A\\) **if and only if** \\(f(w)\\in B\\).",
    answer: true,
    explanation: "The \"if and only if\" is the key rule: members of \\(A\\) translate to members of \\(B\\), and non-members translate to non-members. Both directions must hold for every input.",
    source: "Sipser Def 5.20"
  },

  // ============================================================
  // CONSEQUENCES IN PLAIN WORDS
  // ============================================================
  {
    id: "ch5-basic-consequence-decidable", chapter: 5, topic: "What reductions give you", type: "tf", rank: 0,
    prompt: "If \\(A\\le_m B\\) and \\(B\\) is decidable, then \\(A\\) is decidable.",
    answer: true,
    explanation: "Translate your \\(A\\)-question into a \\(B\\)-question with \\(f\\), then run \\(B\\)'s decider and report its answer. Since \\(f\\) always halts and \\(B\\)'s decider always halts, you get a decider for \\(A\\).",
    source: "Sipser Thm 5.22"
  },
  {
    id: "ch5-basic-consequence-undecidable", chapter: 5, topic: "What reductions give you", type: "mc", rank: 0,
    prompt: "If \\(A\\le_m B\\) and \\(A\\) is **undecidable**, what follows about \\(B\\)?",
    choices: [
      "\\(B\\) is undecidable",
      "\\(B\\) is decidable",
      "\\(B\\) is regular",
      "nothing follows"
    ],
    answer: 0,
    explanation: "This is the contrapositive of the decidable rule and the main tool of the chapter: if \\(B\\) could be decided, then \\(A\\) could too — but \\(A\\) can't be. So \\(B\\) is undecidable.",
    source: "Sipser Cor 5.23"
  },

  // ============================================================
  // THE FAMOUS UNDECIDABLE PROBLEMS — BY NAME, WHAT EACH ASKS
  // ============================================================
  {
    id: "ch5-basic-halt-asks", chapter: 5, topic: "Famous undecidable problems", type: "mc", rank: 0,
    prompt: "The halting problem \\(HALT_{TM}\\) asks:",
    choices: [
      "does machine \\(M\\) eventually stop (halt) when run on input \\(w\\)?",
      "does machine \\(M\\) accept input \\(w\\)?",
      "is machine \\(M\\)'s language empty?",
      "does machine \\(M\\) run forever on every input?"
    ],
    answer: 0,
    explanation: "\\(HALT_{TM}\\) asks whether \\(M\\) halts (stops) on \\(w\\) — it doesn't care if \\(M\\) accepts or rejects, only whether it ever stops. It is undecidable: no machine can always answer it.",
    source: "Sipser Thm 5.1"
  },
  {
    id: "ch5-basic-etm-asks", chapter: 5, topic: "Famous undecidable problems", type: "mc", rank: 0,
    prompt: "The problem \\(E_{TM}\\) asks:",
    choices: [
      "is \\(L(M)\\) empty — that is, does \\(M\\) accept NO strings at all?",
      "does \\(M\\) accept the empty string \\(\\varepsilon\\)?",
      "is \\(M\\)'s tape empty?",
      "does \\(M\\) have no states?"
    ],
    answer: 0,
    explanation: "\\(E_{TM}\\) (the \\(E\\) is for \"empty\") asks whether the machine's language \\(L(M)\\) is the empty set — does it accept nothing? It is undecidable.",
    source: "Sipser Thm 5.2"
  },
  {
    id: "ch5-basic-regular-asks", chapter: 5, topic: "Famous undecidable problems", type: "mc", rank: 0,
    prompt: "The problem \\(REGULAR_{TM}\\) asks:",
    choices: [
      "is the language \\(L(M)\\) a regular language?",
      "is \\(M\\) a deterministic finite automaton?",
      "does \\(M\\) halt regularly (on a fixed schedule)?",
      "does \\(M\\) accept every string?"
    ],
    answer: 0,
    explanation: "\\(REGULAR_{TM}\\) asks whether the set of strings a TM accepts happens to be a regular language. Like the others, it is undecidable.",
    source: "Sipser Thm 5.3"
  },
  {
    id: "ch5-basic-eqtm-asks", chapter: 5, topic: "Famous undecidable problems", type: "mc", rank: 0,
    prompt: "The problem \\(EQ_{TM}\\) asks, for two machines \\(M_1\\) and \\(M_2\\):",
    choices: [
      "do they recognize the SAME language, \\(L(M_1)=L(M_2)\\)?",
      "do they have the same number of states?",
      "do they both halt on the same input?",
      "is one machine a copy of the other's description?"
    ],
    answer: 0,
    explanation: "\\(EQ_{TM}\\) (\\(EQ\\) for \"equal\") asks whether two TMs accept exactly the same set of strings. It is undecidable.",
    source: "Sipser Thm 5.4"
  },
  {
    id: "ch5-basic-allcfg-asks", chapter: 5, topic: "Famous undecidable problems", type: "mc", rank: 0,
    prompt: "The problem \\(ALL_{CFG}\\) asks about a context-free grammar \\(G\\):",
    choices: [
      "does \\(G\\) generate ALL possible strings, \\(L(G)=\\Sigma^*\\)?",
      "does \\(G\\) generate at least one string?",
      "is \\(G\\) in Chomsky normal form?",
      "does \\(G\\) have all possible rules?"
    ],
    answer: 0,
    explanation: "\\(ALL_{CFG}\\) asks whether a grammar generates every string over its alphabet. Surprisingly, this one is undecidable (even though many other grammar questions are decidable).",
    source: "Sipser Thm 5.13"
  },
  {
    id: "ch5-basic-match-name-multi", chapter: 5, topic: "Famous undecidable problems", type: "multi", rank: 0,
    prompt: "Match the idea to the name: which of these descriptions are correct? Select all that apply.",
    choices: [
      "\\(HALT_{TM}\\): does \\(M\\) halt on \\(w\\)?",
      "\\(E_{TM}\\): is \\(L(M)\\) empty?",
      "\\(EQ_{TM}\\): do \\(M_1\\) and \\(M_2\\) accept the same language?",
      "\\(E_{TM}\\): does \\(M\\) have zero states?"
    ],
    answers: [0, 1, 2],
    explanation: "\\(HALT_{TM}\\) is about halting, \\(E_{TM}\\) is about an empty language (not zero states), and \\(EQ_{TM}\\) is about two machines accepting the same strings. The last choice mixes up \"empty language\" with \"no states.\"",
    source: "Sipser Thms 5.1, 5.2, 5.4"
  },

  // ============================================================
  // KEY VOCABULARY: computation history, LBA, PCP, Rice
  // ============================================================
  {
    id: "ch5-basic-comphist-plain", chapter: 5, topic: "Computation history", type: "mc", rank: 0,
    prompt: "A **computation history** of a machine on an input is, in plain words:",
    choices: [
      "the complete step-by-step record of the run — each snapshot of the machine from start to finish",
      "the list of every input the machine has ever seen",
      "the machine's rulebook (its transition function)",
      "the final answer only, with no steps"
    ],
    answer: 0,
    explanation: "A computation history is the full play-by-play of one run: snapshot after snapshot of the machine, in order, from the starting setup to the end. It's like a flip-book of the whole computation.",
    source: "Sipser Def 5.5"
  },
  {
    id: "ch5-basic-comphist-accepting-tf", chapter: 5, topic: "Computation history", type: "tf", rank: 0,
    prompt: "An **accepting** computation history is a step-by-step record of a run that ends in an accepting state.",
    answer: true,
    explanation: "It's the play-by-play of a run that finishes by accepting. If a machine never accepts a given input, then no accepting computation history for that input exists.",
    source: "Sipser Def 5.5"
  },
  {
    id: "ch5-basic-lba-plain", chapter: 5, topic: "Linear bounded automaton", type: "mc", rank: 0,
    prompt: "A **linear bounded automaton (LBA)** is best described as:",
    choices: [
      "a Turing machine that is not allowed to move its head past the part of the tape holding the input",
      "a Turing machine with no tape at all",
      "a finite automaton with two stacks",
      "a Turing machine that always halts in one step"
    ],
    answer: 0,
    explanation: "An LBA is a Turing machine with limited room: it can read and write, but it may never leave the input area of the tape. That restriction gives it only finitely many possible configurations.",
    source: "Sipser Def 5.6"
  },
  {
    id: "ch5-basic-lba-fib", chapter: 5, topic: "Linear bounded automaton", type: "fib", rank: 0,
    prompt: "An LBA is a restricted Turing machine: it cannot move its tape head beyond the ____ area of the tape. (one word)",
    accept: ["input", "the input"],
    explanation: "The LBA's head stays within the input portion of the tape — it has no extra working space beyond where the input sits.",
    source: "Sipser Def 5.6"
  },
  {
    id: "ch5-basic-pcp-plain", chapter: 5, topic: "Post Correspondence Problem", type: "mc", rank: 0,
    prompt: "The **Post Correspondence Problem (PCP)** is, in plain words, a puzzle about:",
    choices: [
      "lining up dominoes (each with a top string and a bottom string) in some order so the whole top reads the same as the whole bottom",
      "sorting numbers from smallest to largest",
      "coloring a map with as few colors as possible",
      "finding the shortest path through a maze"
    ],
    answer: 0,
    explanation: "PCP is the domino-matching puzzle: you have pieces with a string on top and a string on the bottom, and you try to arrange copies of them in a row so the top reading equals the bottom reading. Deciding whether a match exists is undecidable.",
    source: "Sipser Def 5.15 (Thm 5.15)"
  },
  {
    id: "ch5-basic-pcp-dominoes-fib", chapter: 5, topic: "Post Correspondence Problem", type: "fib", rank: 0,
    prompt: "PCP is often pictured as a ____-matching puzzle, because each piece has a top string and a bottom string. (one word, the game piece)",
    accept: ["domino", "dominoes", "dominos", "domino piece"],
    explanation: "Each PCP piece is drawn like a domino with a top string and a bottom string. The goal is to order them so the combined top equals the combined bottom.",
    source: "Sipser §5.2 (PCP)"
  },
  {
    id: "ch5-basic-rice-plain", chapter: 5, topic: "Rice's theorem", type: "mc", rank: 0,
    prompt: "**Rice's theorem**, in plain words, says:",
    choices: [
      "any nontrivial question about WHAT LANGUAGE a machine recognizes is undecidable",
      "every machine recognizes some language",
      "no two machines recognize the same language",
      "every question about a machine is undecidable"
    ],
    answer: 0,
    explanation: "Rice's theorem: if a property is about the machine's LANGUAGE (the set of strings it accepts) and is nontrivial — true for some machines, false for others — then deciding it is impossible. It's a shortcut to undecidability.",
    source: "Sipser Problem 5.28 (Rice's theorem)"
  },
  {
    id: "ch5-basic-rice-nontrivial-fib", chapter: 5, topic: "Rice's theorem", type: "fib", rank: 0,
    prompt: "Rice's theorem applies only to ____ properties of a machine's language — ones that some machines have and others don't (not held by all, not held by none). One word, starts with \"nontr\".",
    accept: ["nontrivial", "non-trivial", "nontrivial property"],
    explanation: "\"Nontrivial\" means the property splits machines into two non-empty groups: some have it, some don't. A property held by all machines (or by none) is trivial and IS decidable.",
    source: "Sipser Problem 5.28"
  },
  {
    id: "ch5-basic-rice-language-not-syntax", chapter: 5, topic: "Rice's theorem", type: "tf", rank: 0,
    prompt: "Rice's theorem is about properties of the machine's **language** (the strings it accepts), not about how the machine is written (like its number of states).",
    answer: true,
    explanation: "Rice's theorem only covers language properties. \"How many states does \\(M\\) have?\" is about the machine's text, not its language, so Rice's theorem says nothing about it (and that question is actually decidable).",
    source: "Sipser Problem 5.28"
  }

]);
