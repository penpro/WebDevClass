/* Chapter 6 — rank-0 beginner definitions/explainers.
   VERY plain-language "what is it" questions for the advanced computability
   topics: the recursion theorem & self-reference, quines, the do-the-opposite
   impossibility trick, oracles, Turing reducibility (\\(\\le_T\\)), and
   Kolmogorov / descriptive complexity \\(K(x)\\). One idea per question.
   Every question is rank 0 (basics tier). Ids prefixed "ch6-basic-". */
TOC.addQuestions([
  // ---- Recursion theorem: a program can see its own code ----
  {
    id: "ch6-basic-recursion-idea-tf", chapter: 6, topic: "Recursion theorem", type: "tf", rank: 0,
    prompt: "The **recursion theorem** says a program can get a copy of its own source code while it is running, and then use that code however it likes.",
    answer: true,
    explanation: "That is the whole idea in plain words: a machine can obtain its own description and then compute with it — print it, count its own states, or simulate itself.",
    source: "Sipser §6.1 (recursion theorem)"
  },
  {
    id: "ch6-basic-recursion-meaning-mc", chapter: 6, topic: "Recursion theorem", type: "mc", rank: 0,
    prompt: "In one sentence, what does the recursion theorem let a Turing machine do?",
    choices: [
      "Get hold of its own description and then keep computing with it",
      "Run twice as fast as any other machine",
      "Decide whether any other machine halts",
      "Turn itself into a finite automaton"
    ],
    answer: 0,
    explanation: "The recursion theorem guarantees a machine can refer to itself: it can obtain \\(\\langle M\\rangle\\), its own code, for free and use it in its algorithm.",
    source: "Sipser §6.1 (recursion theorem)"
  },
  {
    id: "ch6-basic-recursion-magic-tf", chapter: 6, topic: "Recursion theorem", type: "tf", rank: 0,
    prompt: "It is impossible for any program to know its own source code, so the recursion theorem must be false.",
    answer: false,
    explanation: "It feels surprising, but it is true and provable: a program really can compute its own description. The recursion theorem makes \"use my own code\" a legal step when designing a machine.",
    source: "Sipser §6.1 (recursion theorem)"
  },

  // ---- Self-reference ----
  {
    id: "ch6-basic-selfreference-fib", chapter: 6, topic: "Self-reference", type: "fib", rank: 0,
    prompt: "When a program talks about or uses *itself* (its own code), we call that ____-reference. (one word for the blank)",
    accept: ["self", "self reference", "self-reference"],
    explanation: "Self-reference is when something refers to itself. The recursion theorem is the tool that makes self-reference possible for Turing machines.",
    source: "Sipser §6.1 (terminology)"
  },
  {
    id: "ch6-basic-selfreference-which-mc", chapter: 6, topic: "Self-reference", type: "mc", rank: 0,
    prompt: "Which of these is an example of **self-reference**?",
    choices: [
      "A program that reads its own code and prints how many lines it has",
      "A program that adds two numbers from the input",
      "A program that sorts a list",
      "A program that prints \"hello\""
    ],
    answer: 0,
    explanation: "Looking at or using your own code is self-reference. The other programs only work with their input, never with themselves.",
    source: "Sipser §6.1 (self-reference)"
  },

  // ---- Quine: self-printing program ----
  {
    id: "ch6-basic-quine-def-mc", chapter: 6, topic: "Self-reference", type: "mc", rank: 0,
    prompt: "A **quine** (a self-printing program) is a program that, when you run it,",
    choices: [
      "prints out an exact copy of its own source code",
      "prints the word \"quine\"",
      "never stops running",
      "prints whatever you type in"
    ],
    answer: 0,
    explanation: "A quine outputs a perfect copy of itself, using no input. It is the everyday example of the recursion theorem's self-reproducing trick.",
    source: "Sipser §6.1 (the machine SELF)"
  },
  {
    id: "ch6-basic-quine-noinput-tf", chapter: 6, topic: "Self-reference", type: "tf", rank: 0,
    prompt: "A self-printing program (quine) needs to be given its own code as input before it can print itself.",
    answer: false,
    explanation: "No — that is what makes it clever. A quine builds and prints its own code from scratch, ignoring the input entirely.",
    source: "Sipser §6.1 (the machine SELF)"
  },
  {
    id: "ch6-basic-virus-fib", chapter: 6, topic: "Self-reference", type: "fib", rank: 0,
    prompt: "A computer ____ copies its own code into other files to spread; it uses the same self-copying idea as the recursion theorem. (one word)",
    accept: ["virus", "a virus"],
    explanation: "A computer virus reproduces by copying itself. That self-replication is exactly the self-printing construction from the recursion theorem.",
    source: "Sipser §6.1 (applications)"
  },

  // ---- The "do the opposite" impossibility trick ----
  {
    id: "ch6-basic-opposite-trick-mc", chapter: 6, topic: "Recursion theorem applications", type: "mc", rank: 0,
    prompt: "The recursion theorem gives a clean way to prove some problems are impossible. The trick is to build a machine that gets its own code, asks a hypothetical predictor what it will do, and then",
    choices: [
      "does the **opposite** of whatever the predictor says",
      "copies the predictor exactly",
      "shuts down immediately",
      "asks the predictor a second time"
    ],
    answer: 0,
    explanation: "If a machine always does the opposite of the predictor's answer about itself, the prediction is always wrong. So the perfect predictor can't exist — a quick impossibility proof.",
    source: "Sipser Thm 6.5 (style of proof)"
  },
  {
    id: "ch6-basic-opposite-why-tf", chapter: 6, topic: "Recursion theorem applications", type: "tf", rank: 0,
    prompt: "If a machine \\(B\\) is built to do the **opposite** of what a supposed decider \\(H\\) predicts \\(B\\) will do, then \\(H\\)'s prediction about \\(B\\) is always wrong.",
    answer: true,
    explanation: "By design \\(B\\) contradicts \\(H\\). Since \\(H\\) was supposed to be always right, it can't exist — that is how self-reference proves a problem is undecidable.",
    source: "Sipser Thm 6.5"
  },

  // ---- Oracle ----
  {
    id: "ch6-basic-oracle-def-mc", chapter: 6, topic: "Turing reducibility", type: "mc", rank: 0,
    prompt: "An **oracle** for a language \\(B\\) is best described as:",
    choices: [
      "A magic box that instantly answers \"is \\(w\\in B\\)?\" for any string \\(w\\)",
      "A faster computer",
      "A list of every string in \\(B\\), printed on paper",
      "A proof that \\(B\\) is easy"
    ],
    answer: 0,
    explanation: "An oracle for \\(B\\) is an imagined helper that answers any membership question \"is \\(w\\) in \\(B\\)?\" in a single step, without our caring how it does it.",
    source: "Sipser Def 6.18"
  },
  {
    id: "ch6-basic-oracle-instant-tf", chapter: 6, topic: "Turing reducibility", type: "tf", rank: 0,
    prompt: "We are allowed to imagine an oracle for a language even if that language is actually undecidable.",
    answer: true,
    explanation: "Oracles are a thought tool. We pretend we have a box that answers \"is \\(w\\in B\\)?\" for free — even for hard or undecidable \\(B\\) — to ask what *else* we could then solve.",
    source: "Sipser §6.3 (oracles)"
  },
  {
    id: "ch6-basic-oracle-question-fib", chapter: 6, topic: "Turing reducibility", type: "fib", rank: 0,
    prompt: "The one kind of question you may ask an oracle for \\(B\\) is a ____ question: \"is this string in \\(B\\)?\" (one word for the blank)",
    accept: ["membership", "a membership", "member"],
    explanation: "An oracle only answers membership questions: given \\(w\\), it tells you yes or no for \\(w\\in B\\).",
    source: "Sipser Def 6.18"
  },

  // ---- Turing reducibility ----
  {
    id: "ch6-basic-turing-reduce-mc", chapter: 6, topic: "Turing reducibility", type: "mc", rank: 0,
    prompt: "We say \\(A\\) is **Turing reducible** to \\(B\\), written \\(A\\le_T B\\), when:",
    choices: [
      "You could solve \\(A\\) if you were allowed to ask an oracle for \\(B\\)",
      "\\(A\\) and \\(B\\) are the same language",
      "\\(A\\) is a subset of \\(B\\)",
      "\\(B\\) is shorter to write down than \\(A\\)"
    ],
    answer: 0,
    explanation: "\\(A\\le_T B\\) means: give me a magic box that answers membership in \\(B\\), and I can build a machine that decides \\(A\\). \\(B\\)'s power is enough to solve \\(A\\).",
    source: "Sipser Def 6.20"
  },
  {
    id: "ch6-basic-turing-reduce-meaning-tf", chapter: 6, topic: "Turing reducibility", type: "tf", rank: 0,
    prompt: "\\(A\\le_T B\\) intuitively means \"\\(B\\) is at least as hard as \\(A\\)\": once you can answer \\(B\\), you can answer \\(A\\) too.",
    answer: true,
    explanation: "If an oracle for \\(B\\) lets you decide \\(A\\), then \\(A\\) is no harder than \\(B\\). Turing reducibility is a way to compare how hard two problems are.",
    source: "Sipser §6.3"
  },
  {
    id: "ch6-basic-turing-vs-mapping-mc", chapter: 6, topic: "Turing reducibility", type: "mc", rank: 0,
    prompt: "How does Turing reducibility \\(\\le_T\\) compare to mapping reducibility \\(\\le_m\\)?",
    choices: [
      "\\(\\le_T\\) is looser (more permissive): you may ask the oracle as often as you like and use its answers freely",
      "\\(\\le_T\\) is stricter: it forbids using the oracle",
      "They are exactly the same thing",
      "\\(\\le_T\\) only works for regular languages"
    ],
    answer: 0,
    explanation: "A mapping reduction must transform the input once and pass it along. With \\(\\le_T\\) you may query the oracle many times and combine the answers however you want — so \\(\\le_T\\) is the looser notion.",
    source: "Sipser §6.3 (\\(\\le_T\\) generalizes \\(\\le_m\\))"
  },
  {
    id: "ch6-basic-turing-looser-tf", chapter: 6, topic: "Turing reducibility", type: "tf", rank: 0,
    prompt: "Every mapping reduction \\(A\\le_m B\\) also counts as a Turing reduction \\(A\\le_T B\\).",
    answer: true,
    explanation: "Mapping reducibility is a special, more restricted case. So \\(A\\le_m B\\) always gives \\(A\\le_T B\\), but not the other way around — \\(\\le_T\\) can do strictly more.",
    source: "Sipser §6.3"
  },

  // ---- Kolmogorov / descriptive complexity ----
  {
    id: "ch6-basic-kolmogorov-def-mc", chapter: 6, topic: "Descriptive complexity", type: "mc", rank: 0,
    prompt: "The **Kolmogorov complexity** (descriptive complexity) \\(K(x)\\) of a string \\(x\\) is:",
    choices: [
      "The length of the **shortest program** that prints \\(x\\)",
      "The number of \\(1\\)s in \\(x\\)",
      "The number of letters in \\(x\\)",
      "How long the fastest program takes to print \\(x\\)"
    ],
    answer: 0,
    explanation: "\\(K(x)\\) measures information by description length: it is the size of the smallest program whose output is \\(x\\). A string you can describe briefly has small \\(K(x)\\).",
    source: "Sipser Def 6.23"
  },
  {
    id: "ch6-basic-kolmogorov-short-tf", chapter: 6, topic: "Descriptive complexity", type: "tf", rank: 0,
    prompt: "A string with an easy, short pattern (like a million \\(0\\)s in a row) has a **small** \\(K(x)\\).",
    answer: true,
    explanation: "A short program — \"print \\(0\\) a million times\" — produces it, so its shortest description is small. Lots of repetition means low Kolmogorov complexity.",
    source: "Sipser §6.4"
  },
  {
    id: "ch6-basic-minimal-description-fib", chapter: 6, topic: "Descriptive complexity", type: "fib", rank: 0,
    prompt: "The shortest program that prints \\(x\\) is called the ____ description of \\(x\\); its length is \\(K(x)\\). (one word for the blank)",
    accept: ["minimal", "minimum", "shortest"],
    explanation: "The minimal (shortest) description of \\(x\\) is the smallest program that outputs it. \\(K(x)\\) is just the length of that minimal description.",
    source: "Sipser Def 6.23"
  },
  {
    id: "ch6-basic-incompressible-mc", chapter: 6, topic: "Descriptive complexity", type: "mc", rank: 0,
    prompt: "A string \\(x\\) is called **incompressible** (or *random*) when:",
    choices: [
      "It has no description shorter than itself, i.e. \\(K(x)\\ge|x|\\)",
      "It is very long",
      "It contains only \\(0\\)s",
      "It can be printed by a tiny program"
    ],
    answer: 0,
    explanation: "Incompressible means you can't describe \\(x\\) with fewer symbols than \\(x\\) itself has: \\(K(x)\\ge|x|\\). There is no clever shortcut, so it looks random.",
    source: "Sipser Def 6.28"
  },
  {
    id: "ch6-basic-incompressible-fib", chapter: 6, topic: "Descriptive complexity", type: "fib", rank: 0,
    prompt: "A string with no shorter description than itself (\\(K(x)\\ge|x|\\)) is said to be ____. (one word)",
    accept: ["incompressible", "random"],
    explanation: "Such a string is incompressible: the shortest way to describe it is basically to write it out in full. These strings behave like random ones.",
    source: "Sipser Def 6.28"
  },
  {
    id: "ch6-basic-random-meaning-tf", chapter: 6, topic: "Descriptive complexity", type: "tf", rank: 0,
    prompt: "If a string can be produced by a program much shorter than the string itself, then it is incompressible.",
    answer: false,
    explanation: "It's the opposite. A short program means a short description, so the string *is* compressible. Incompressible strings have **no** description shorter than themselves.",
    source: "Sipser §6.4"
  },
  {
    id: "ch6-basic-k-not-computable-tf", chapter: 6, topic: "Descriptive complexity", type: "tf", rank: 0,
    prompt: "There is no algorithm that, given any string \\(x\\), always outputs its Kolmogorov complexity \\(K(x)\\).",
    answer: true,
    explanation: "\\(K\\) is **not computable**. No machine can compute the shortest-program length for every input, which is also why we can't simply decide whether a string is incompressible.",
    source: "Sipser §6.4 (Problem 6.23)"
  }
]);
