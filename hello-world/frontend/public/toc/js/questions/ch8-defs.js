/* Chapter 8 — Space Complexity: BASICS tier (rank 0).
   Very-beginner definition/explainer questions. Plain language, one idea each,
   building intuition for what the terms mean before any proofs. Pairs with ch8.js.
   Every question here has rank: 0 and an id prefixed "ch8-basic-". */
TOC.addQuestions([
  // ---- What "space" means ----
  {
    id: "ch8-basic-what-is-space", chapter: 8, rank: 0, topic: "Space complexity", type: "mc",
    prompt: "In this chapter, the **space** a machine uses means roughly:",
    choices: [
      "how much memory (scratch paper / tape cells) it needs to work",
      "how many steps it takes",
      "how many states its program has",
      "how long its input is"
    ],
    answer: 0,
    explanation: "Space is about memory — the amount of working room the machine needs. Think of it as how much scratch paper you'd go through, not how long the work takes.",
    source: "Sipser §8.1"
  },
  {
    id: "ch8-basic-space-vs-time", chapter: 8, rank: 0, topic: "Space complexity", type: "mc",
    prompt: "What is the big difference between **time** and **space** as resources?",
    choices: [
      "Space can be erased and reused; time, once spent, is gone forever",
      "Time can be reused but space cannot",
      "They are exactly the same thing measured twice",
      "Space is always larger than time for every problem"
    ],
    answer: 0,
    explanation: "You can erase scratch paper and write on it again, so the same memory cell gets reused. A second of time, once used, never comes back. That reusability is why space is often a smaller resource than time.",
    source: "Sipser §8.1"
  },
  {
    id: "ch8-basic-space-fn-notation", chapter: 8, rank: 0, topic: "Space complexity", type: "mc",
    prompt: "The notation \\(\\mathrm{SPACE}(f(n))\\) names the set of problems that:",
    choices: [
      "a deterministic machine can solve using at most about \\(f(n)\\) memory cells on inputs of length \\(n\\)",
      "a machine can solve in at most \\(f(n)\\) steps of time",
      "have inputs of length exactly \\(f(n)\\)",
      "need at least \\(f(n)\\) states"
    ],
    answer: 0,
    explanation: "\\(\\mathrm{SPACE}(f(n))\\) groups problems by how much memory they need: it's everything solvable within about \\(f(n)\\) cells when the input has length \\(n\\).",
    source: "Sipser Def 8.2"
  },

  // ---- NSPACE ----
  {
    id: "ch8-basic-nspace-what", chapter: 8, rank: 0, topic: "Space complexity", type: "mc",
    prompt: "In plain terms, \\(\\mathrm{NSPACE}(f(n))\\) is like \\(\\mathrm{SPACE}(f(n))\\) except the machine is allowed to:",
    choices: [
      "make lucky guesses (be nondeterministic) while still using only about \\(f(n)\\) memory",
      "use unlimited memory",
      "run forever",
      "read the answer from a table"
    ],
    answer: 0,
    explanation: "The \\(\\mathrm{N}\\) stands for nondeterministic — the machine may guess. \\(\\mathrm{NSPACE}(f(n))\\) is what such a guessing machine can solve within about \\(f(n)\\) memory.",
    source: "Sipser Def 8.2"
  },
  {
    id: "ch8-basic-nspace-n-meaning", chapter: 8, rank: 0, topic: "Space complexity", type: "fib",
    prompt: "Fill in the blank: in \\(\\mathrm{NSPACE}\\), the letter \\(\\mathrm{N}\\) stands for ____.",
    accept: ["nondeterministic", "non-deterministic", "nondeterminism", "non determinism", "nondeterminstic"],
    explanation: "\\(\\mathrm{N}\\) means nondeterministic: the machine is allowed to branch and guess, just like in \\(\\mathrm{NP}\\) and \\(\\mathrm{NL}\\).",
    source: "Sipser Def 8.2"
  },

  // ---- Configuration & finitely many configs ----
  {
    id: "ch8-basic-config-what", chapter: 8, rank: 0, topic: "Space complexity", type: "mc",
    prompt: "A **configuration** of a machine is best described as:",
    choices: [
      "a complete snapshot of the machine right now: its state, its tape contents, and where its head is",
      "the machine's final answer",
      "the list of all its states",
      "the input string by itself"
    ],
    answer: 0,
    explanation: "A configuration is a full snapshot — everything you'd need to pause the machine and later resume it: current state, what's written on the tape, and the head position.",
    source: "Sipser §8.1 (configurations)"
  },
  {
    id: "ch8-basic-config-finite", chapter: 8, rank: 0, topic: "Space complexity", type: "tf",
    prompt: "True or false: if a machine can only use a limited amount of memory, then it has only finitely many different snapshots (configurations) it could ever be in.",
    answer: true,
    explanation: "With limited memory there are only so many ways to fill those cells, only so many head positions, and only so many states — so the number of possible snapshots is finite.",
    source: "Sipser §8.1 (configurations)"
  },

  // ---- PSPACE ----
  {
    id: "ch8-basic-pspace-what", chapter: 8, rank: 0, topic: "PSPACE", type: "mc",
    prompt: "In plain terms, \\(\\mathrm{PSPACE}\\) is the set of problems solvable using:",
    choices: [
      "a polynomial amount of memory (like \\(n\\), \\(n^2\\), or \\(n^3\\) cells)",
      "a polynomial amount of time",
      "an exponential amount of memory",
      "exactly \\(n\\) cells, never more"
    ],
    answer: 0,
    explanation: "The \\(\\mathrm{P}\\) is for polynomial and \\(\\mathrm{SPACE}\\) is for memory: \\(\\mathrm{PSPACE}\\) is everything you can solve with memory that grows only polynomially in the input size.",
    source: "Sipser Def 8.6"
  },
  {
    id: "ch8-basic-pspace-eq-npspace", chapter: 8, rank: 0, topic: "PSPACE", type: "tf",
    prompt: "True or false: for polynomial memory, letting the machine guess gives it no extra power — that is, \\(\\mathrm{PSPACE}=\\mathrm{NPSPACE}\\).",
    answer: true,
    explanation: "Surprisingly, deterministic and nondeterministic polynomial space solve exactly the same problems. (Savitch's theorem is the reason — see the next questions.)",
    source: "Sipser §8.2"
  },

  // ---- Savitch's theorem ----
  {
    id: "ch8-basic-savitch-plain", chapter: 8, rank: 0, topic: "Savitch's theorem", type: "mc",
    prompt: "In plain language, **Savitch's theorem** says that getting rid of guessing costs a machine:",
    choices: [
      "only a modest amount of extra memory (about squaring it), not a huge blowup",
      "no extra memory at all",
      "an exponential amount of extra memory",
      "extra time but never extra memory"
    ],
    answer: 0,
    explanation: "Savitch's theorem says a guessing (nondeterministic) machine can be replaced by a non-guessing one that uses only about the square of the memory. Squaring is cheap compared to the exponential blowup you might fear.",
    source: "Sipser Thm 8.5"
  },
  {
    id: "ch8-basic-savitch-square-fib", chapter: 8, rank: 0, topic: "Savitch's theorem", type: "fib",
    prompt: "Fill in the blank: by Savitch's theorem, removing nondeterminism costs at most a ____ of the memory used (turning \\(f(n)\\) into about \\(f(n)^2\\)).",
    accept: ["squaring", "square", "squared", "squaring it", "square of it"],
    explanation: "It's a squaring: \\(\\mathrm{NSPACE}(f(n))\\subseteq\\mathrm{SPACE}(f(n)^2)\\). Memory \\(f(n)\\) becomes about \\(f(n)^2\\).",
    source: "Sipser Thm 8.5"
  },

  // ---- PSPACE-complete ----
  {
    id: "ch8-basic-pspace-complete-what", chapter: 8, rank: 0, topic: "PSPACE-completeness", type: "mc",
    prompt: "Calling a problem \\(\\mathrm{PSPACE}\\)-**complete** means it is:",
    choices: [
      "in \\(\\mathrm{PSPACE}\\) and at least as hard as every other problem in \\(\\mathrm{PSPACE}\\)",
      "the easiest problem in \\(\\mathrm{PSPACE}\\)",
      "a problem that needs no memory",
      "a problem outside \\(\\mathrm{PSPACE}\\)"
    ],
    answer: 0,
    explanation: "A \\(\\mathrm{PSPACE}\\)-complete problem is both inside \\(\\mathrm{PSPACE}\\) and a hardest one there: every \\(\\mathrm{PSPACE}\\) problem reduces to it. Solve it efficiently and you've solved them all.",
    source: "Sipser Def 8.8"
  },

  // ---- TQBF ----
  {
    id: "ch8-basic-quantified-formula", chapter: 8, rank: 0, topic: "PSPACE-completeness", type: "mc",
    prompt: "A **fully quantified Boolean formula** is a true/false formula in which every variable is introduced by one of:",
    choices: [
      "\\(\\forall\\) (\"for all\") or \\(\\exists\\) (\"there exists\"), so each variable ranges over true and false",
      "\\(+\\) or \\(\\times\\), so each variable ranges over numbers",
      "\\(\\subseteq\\) or \\(\\in\\), so each variable ranges over sets",
      "no quantifiers at all"
    ],
    answer: 0,
    explanation: "\"Fully quantified\" means every variable is pinned down by \\(\\forall\\) (for all) or \\(\\exists\\) (there exists), ranging over the values true and false. With every variable quantified, the whole formula is simply true or false.",
    source: "Sipser §8.3 (TQBF)"
  },
  {
    id: "ch8-basic-tqbf-asks", chapter: 8, rank: 0, topic: "PSPACE-completeness", type: "mc",
    prompt: "The problem **TQBF** asks, about a given fully quantified Boolean formula:",
    choices: [
      "is it true?",
      "how many variables does it have?",
      "how long is it?",
      "can it be made shorter?"
    ],
    answer: 0,
    explanation: "TQBF is just \"is this fully quantified formula true?\" Because every variable is already quantified, there's a definite yes/no answer. TQBF is the classic \\(\\mathrm{PSPACE}\\)-complete problem.",
    source: "Sipser Thm 8.9"
  },

  // ---- FORMULA-GAME ----
  {
    id: "ch8-basic-formula-game-what", chapter: 8, rank: 0, topic: "PSPACE-completeness", type: "mc",
    prompt: "The **formula game** turns a quantified formula into a two-player game. How is it played?",
    choices: [
      "Players take turns picking true/false for the variables — one player handles the \\(\\exists\\) variables, the other the \\(\\forall\\) variables — and we ask whether the formula ends up true",
      "Players race to write the formula fastest",
      "One player tries to make the formula longer, the other shorter",
      "Players guess each other's variables without setting any values"
    ],
    answer: 0,
    explanation: "Reading the quantifiers left to right, the two players alternately assign true or false to the variables (one owns the \\(\\exists\\)'s, the other the \\(\\forall\\)'s). The question is whether the formula comes out true at the end.",
    source: "Sipser §8.3 (FORMULA-GAME)"
  },
  {
    id: "ch8-basic-formula-game-eq-tqbf", chapter: 8, rank: 0, topic: "PSPACE-completeness", type: "tf",
    prompt: "True or false: a fully quantified formula is true exactly when the \"there exists\" player has a way to always win the formula game.",
    answer: true,
    explanation: "The two are the same question in different clothes: the formula is true precisely when the \\(\\exists\\) player has a winning strategy. That's why both TQBF and the formula game are \\(\\mathrm{PSPACE}\\)-complete.",
    source: "Sipser Thm 8.11"
  },

  // ---- Generalized geography ----
  {
    id: "ch8-basic-gg-what", chapter: 8, rank: 0, topic: "PSPACE-completeness", type: "mc",
    prompt: "In the game **generalized geography**, two players:",
    choices: [
      "take turns extending a path through a directed graph, never reusing a node; whoever can't move loses",
      "take turns coloring nodes of a graph",
      "name real-world cities until someone repeats one",
      "race to count the edges of a graph"
    ],
    answer: 0,
    explanation: "It's an abstract version of the kids' game where each city must start with the last city's final letter. Here players just keep extending a path in a directed graph, can't revisit a node, and the player with no legal move loses.",
    source: "Sipser §8.3 (generalized geography)"
  },

  // ---- L and NL ----
  {
    id: "ch8-basic-l-what", chapter: 8, rank: 0, topic: "L and NL", type: "mc",
    prompt: "The class \\(\\mathrm{L}\\) (\"log space\") is the set of problems a normal machine can solve using only:",
    choices: [
      "about \\(\\log n\\) extra memory — just enough to hold a few pointers into the input",
      "about \\(n^2\\) memory",
      "no memory at all",
      "an exponential amount of memory"
    ],
    answer: 0,
    explanation: "\\(\\mathrm{L}\\) means logarithmic working memory — roughly \\(\\log n\\) cells, enough to remember a handful of positions in the input but not to copy it. It's a very small amount of scratch space.",
    source: "Sipser Def 8.17"
  },
  {
    id: "ch8-basic-nl-what", chapter: 8, rank: 0, topic: "L and NL", type: "mc",
    prompt: "The class \\(\\mathrm{NL}\\) is just like \\(\\mathrm{L}\\) except the machine may also:",
    choices: [
      "make guesses (be nondeterministic) while still using only about \\(\\log n\\) memory",
      "use polynomial memory",
      "use a second unlimited tape",
      "look at the input twice as fast"
    ],
    answer: 0,
    explanation: "\\(\\mathrm{NL}\\) is nondeterministic log space: same tiny \\(\\log n\\) working memory as \\(\\mathrm{L}\\), but now the machine is allowed to guess as it goes.",
    source: "Sipser Def 8.17"
  },
  {
    id: "ch8-basic-logspace-readonly", chapter: 8, rank: 0, topic: "L and NL", type: "mc",
    prompt: "To make memory below \\(n\\) (like \\(\\log n\\)) meaningful, the machine is given a special setup. Which one?",
    choices: [
      "It can read the input for free (a read-only input tape), and only its separate scratch tape counts as memory",
      "It must copy the whole input into its memory first",
      "It cannot read the input at all",
      "It is given the answer and just checks it"
    ],
    answer: 0,
    explanation: "The input sits on a read-only tape that doesn't count against the budget, and a separate work tape holds the scratch work. Only the work tape is measured, so it can be much smaller than the input.",
    source: "Sipser §8.4"
  },

  // ---- NL-complete, PATH ----
  {
    id: "ch8-basic-path-what", chapter: 8, rank: 0, topic: "NL-completeness", type: "mc",
    prompt: "The problem \\(PATH\\) asks: given a directed graph and two nodes \\(s\\) and \\(t\\),",
    choices: [
      "is there a path that follows the arrows from \\(s\\) to \\(t\\)?",
      "how many nodes does the graph have?",
      "is the graph connected as a whole?",
      "does the graph contain a cycle?"
    ],
    answer: 0,
    explanation: "\\(PATH\\) is simple reachability: can you get from \\(s\\) to \\(t\\) by following the directed edges? It's the standard example of a problem in \\(\\mathrm{NL}\\).",
    source: "Sipser §8.4 (PATH)"
  },
  {
    id: "ch8-basic-path-fib", chapter: 8, rank: 0, topic: "NL-completeness", type: "fib",
    prompt: "Fill in the blank: the directed-graph reachability problem (is there a route from \\(s\\) to \\(t\\)?) is named ____.",
    accept: ["PATH", "path"],
    explanation: "It's just called \\(PATH\\). It is the canonical \\(\\mathrm{NL}\\)-complete problem.",
    source: "Sipser Thm 8.25"
  },
  {
    id: "ch8-basic-nl-complete-what", chapter: 8, rank: 0, topic: "NL-completeness", type: "mc",
    prompt: "Saying \\(PATH\\) is \\(\\mathrm{NL}\\)-**complete** means it is:",
    choices: [
      "in \\(\\mathrm{NL}\\) and among the hardest problems in \\(\\mathrm{NL}\\) (every \\(\\mathrm{NL}\\) problem reduces to it)",
      "the easiest problem in \\(\\mathrm{NL}\\)",
      "outside \\(\\mathrm{NL}\\)",
      "solvable with no memory"
    ],
    answer: 0,
    explanation: "As always, \"complete\" means in the class and hardest in it. So \\(PATH\\) captures the full difficulty of \\(\\mathrm{NL}\\): a good algorithm for it would give good algorithms for everything in \\(\\mathrm{NL}\\).",
    source: "Sipser Thm 8.25"
  },

  // ---- NL = coNL ----
  {
    id: "ch8-basic-nl-eq-conl", chapter: 8, rank: 0, topic: "NL = coNL", type: "tf",
    prompt: "True or false: nondeterministic log space is closed under complement — that is, \\(\\mathrm{NL}=\\mathrm{coNL}\\).",
    answer: true,
    explanation: "Yes, surprisingly. \\(\\mathrm{coNL}\\) is the \"opposite-answer\" version of \\(\\mathrm{NL}\\), and it turns out to be exactly \\(\\mathrm{NL}\\) itself. This is the Immerman–Szelepcsényi theorem.",
    source: "Sipser Thm 8.27"
  },
  {
    id: "ch8-basic-conl-meaning", chapter: 8, rank: 0, topic: "NL = coNL", type: "mc",
    prompt: "What does \\(\\mathrm{coNL}\\) mean?",
    choices: [
      "the problems whose \"no\" instances form an \\(\\mathrm{NL}\\) problem — i.e. the complements of \\(\\mathrm{NL}\\) problems",
      "the problems that are not in \\(\\mathrm{NL}\\)",
      "the problems harder than everything in \\(\\mathrm{PSPACE}\\)",
      "another name for \\(\\mathrm{L}\\)"
    ],
    answer: 0,
    explanation: "\\(\\mathrm{coNL}\\) collects the complements of \\(\\mathrm{NL}\\) problems — flip each yes to no and no to yes. (\"co-\" always means \"complement of.\") The big result is that this gives you nothing new: \\(\\mathrm{coNL}=\\mathrm{NL}\\).",
    source: "Sipser Thm 8.27"
  },

  // ---- Which contains what (intuition) ----
  {
    id: "ch8-basic-l-in-nl", chapter: 8, rank: 0, topic: "L and NL", type: "tf",
    prompt: "True or false: every problem in \\(\\mathrm{L}\\) is also in \\(\\mathrm{NL}\\) (so \\(\\mathrm{L}\\subseteq\\mathrm{NL}\\)).",
    answer: true,
    explanation: "A machine that never bothers to guess is a special case of one that may guess, so anything solvable in \\(\\mathrm{L}\\) is automatically solvable in \\(\\mathrm{NL}\\).",
    source: "Sipser §8.4"
  },
  {
    id: "ch8-basic-big-chain-order", chapter: 8, rank: 0, topic: "L and NL", type: "order",
    prompt: "Put these classes in order from smallest to largest, as they are known to nest.",
    items: [
      "\\(\\mathrm{L}\\)",
      "\\(\\mathrm{NL}\\)",
      "\\(\\mathrm{P}\\)",
      "\\(\\mathrm{NP}\\)",
      "\\(\\mathrm{PSPACE}\\)"
    ],
    explanation: "The known chain is \\(\\mathrm{L}\\subseteq\\mathrm{NL}\\subseteq\\mathrm{P}\\subseteq\\mathrm{NP}\\subseteq\\mathrm{PSPACE}\\). Each class sits inside the next; whether any of these containments is strict is mostly still open.",
    source: "Sipser §8.6"
  },
  {
    id: "ch8-basic-nl-in-p", chapter: 8, rank: 0, topic: "NL-completeness", type: "tf",
    prompt: "True or false: everything solvable in nondeterministic log space can also be solved in polynomial time (\\(\\mathrm{NL}\\subseteq\\mathrm{P}\\)).",
    answer: true,
    explanation: "Yes. A log-space machine has only polynomially many possible snapshots, so a polynomial-time machine can explore them all. Hence \\(\\mathrm{NL}\\subseteq\\mathrm{P}\\).",
    source: "Sipser Cor 8.26"
  }
]);
