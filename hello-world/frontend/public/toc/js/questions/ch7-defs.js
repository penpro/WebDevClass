/* Chapter 7 — Time Complexity: VERY BEGINNER definitions & explainers.
   Plain-language "what is it" questions for P, NP, NP-complete, polynomial-time
   reduction, big-O / small-o, verifiers & certificates, and name-level intros to
   SAT, 3SAT, CLIQUE, vertex cover, HAMPATH, and SUBSET-SUM. Every question rank 0.
   Companion to ch7.js (deeper tier) — ids are prefixed "ch7-basic-". */
TOC.addQuestions([
  // ---- Running time / time complexity ----
  {
    id: "ch7-basic-running-time", chapter: 7, rank: 0, topic: "Time complexity (basics)", type: "mc",
    prompt: "When we talk about the **running time** of an algorithm, we usually mean:",
    choices: [
      "roughly how many steps it takes, as the input gets bigger",
      "how many seconds it takes on one specific laptop",
      "how many lines of code it has",
      "how much it costs to run"
    ],
    answer: 0,
    explanation: "Time complexity counts how the number of steps grows as the input size grows. We measure steps (not seconds on one machine) so the answer does not depend on the exact computer.",
    source: "Sipser §7.1"
  },

  // ---- Big-O ----
  {
    id: "ch7-basic-bigo-plain", chapter: 7, rank: 0, topic: "Big-O and small-o (basics)", type: "mc",
    prompt: "In plain words, saying an algorithm is \\(O(n^2)\\) means its running time:",
    choices: [
      "grows no faster than \\(n^2\\) (ignoring constant factors), for large inputs",
      "is exactly \\(n^2\\) steps, always",
      "is always faster than \\(n^2\\) steps",
      "uses exactly \\(n^2\\) bytes of memory"
    ],
    answer: 0,
    explanation: "Big-O is an **upper bound** on growth: it says the time grows no faster than the named function, once the input is large. It is about how things scale, not an exact step count.",
    source: "Sipser Def 7.2"
  },
  {
    id: "ch7-basic-bigo-constants", chapter: 7, rank: 0, topic: "Big-O and small-o (basics)", type: "tf",
    prompt: "Big-O notation **ignores constant factors and lower-order terms** — so \\(3n^2+10n+7\\) is just \\(O(n^2)\\).",
    answer: true,
    explanation: "We keep only the fastest-growing term and drop its constant. The \\(10n\\) and \\(7\\) barely matter for large \\(n\\), and the \\(3\\) in front does not change how fast it grows.",
    source: "Sipser §7.1"
  },

  // ---- small-o ----
  {
    id: "ch7-basic-smallo-plain", chapter: 7, rank: 0, topic: "Big-O and small-o (basics)", type: "mc",
    prompt: "Small-o, as in \\(f(n)=o(g(n))\\), means \\(f\\) grows:",
    choices: [
      "strictly slower than \\(g\\) (\\(g\\) eventually pulls way ahead)",
      "at exactly the same rate as \\(g\\)",
      "strictly faster than \\(g\\)",
      "no faster than \\(g\\), but maybe the same"
    ],
    answer: 0,
    explanation: "Small-o is the **strict** version: \\(f\\) grows strictly slower than \\(g\\). Compare big-O (\\(\\le\\), 'no faster than') with small-o (\\(<\\), 'strictly slower').",
    source: "Sipser Def 7.5"
  },

  // ---- Polynomial vs exponential ----
  {
    id: "ch7-basic-poly-vs-exp", chapter: 7, rank: 0, topic: "Polynomial vs exponential (basics)", type: "mc",
    prompt: "Why do we treat **polynomial time** as 'efficient / feasible' but **exponential time** as not?",
    choices: [
      "polynomial time stays usable as inputs grow; exponential time explodes and becomes impossible fast",
      "exponential algorithms are always wrong",
      "polynomial algorithms never make mistakes",
      "exponential time uses no memory"
    ],
    answer: 0,
    explanation: "A polynomial like \\(n^2\\) grows gently, so even big inputs stay doable. Exponential time like \\(2^n\\) doubles with each extra symbol, so it quickly outruns any computer.",
    source: "Sipser §7.2"
  },
  {
    id: "ch7-basic-exp-fib", chapter: 7, rank: 0, topic: "Polynomial vs exponential (basics)", type: "fib",
    prompt: "A running time like \\(2^n\\) that roughly doubles each time the input grows by one is called ____ time (one word).",
    accept: ["exponential", "exponential-time"],
    explanation: "\\(2^n\\) is exponential: add one symbol and the work doubles. This is why brute-force search over all possibilities is usually too slow.",
    source: "Sipser §7.2"
  },

  // ---- The class P ----
  {
    id: "ch7-basic-p-def", chapter: 7, rank: 0, topic: "The class P (basics)", type: "mc",
    prompt: "The class \\(\\mathrm{P}\\) is the set of problems that:",
    choices: [
      "a computer can SOLVE in polynomial time",
      "have answers that are easy to check but maybe hard to find",
      "can never be solved by any computer",
      "take exponential time no matter what"
    ],
    answer: 0,
    explanation: "\\(\\mathrm{P}\\) = problems you can actually **solve** quickly (in polynomial time). Think of \\(\\mathrm{P}\\) as the 'efficiently solvable' problems.",
    source: "Sipser Def 7.12"
  },
  {
    id: "ch7-basic-p-meaning-tf", chapter: 7, rank: 0, topic: "The class P (basics)", type: "tf",
    prompt: "A problem in \\(\\mathrm{P}\\) is one we already have a reasonably fast (polynomial-time) algorithm to answer.",
    answer: true,
    explanation: "Yes — 'in \\(\\mathrm{P}\\)' is shorthand for 'we can solve it efficiently.' An example from the chapter is checking whether a graph has a path from \\(s\\) to \\(t\\).",
    source: "Sipser Def 7.12"
  },

  // ---- The class NP ----
  {
    id: "ch7-basic-np-def", chapter: 7, rank: 0, topic: "The class NP (basics)", type: "mc",
    prompt: "The class \\(\\mathrm{NP}\\) is best described as the set of problems where:",
    choices: [
      "if the answer is YES, there is a short proof you can CHECK quickly",
      "the answer can never be found",
      "every algorithm runs in constant time",
      "the answer is always NO"
    ],
    answer: 0,
    explanation: "\\(\\mathrm{NP}\\) = problems whose YES-answers come with a short hint that is **fast to check**, even if finding the answer yourself might be slow. Checking is easy; solving might be hard.",
    source: "Sipser §7.3"
  },
  {
    id: "ch7-basic-np-name", chapter: 7, rank: 0, topic: "The class NP (basics)", type: "mc",
    prompt: "What does the 'N' in \\(\\mathrm{NP}\\) actually stand for?",
    choices: [
      "nondeterministic (as in 'nondeterministic polynomial time')",
      "non-polynomial",
      "never",
      "numeric"
    ],
    answer: 0,
    explanation: "\\(\\mathrm{NP}\\) means **nondeterministic polynomial time**. It does NOT mean 'non-polynomial' — that is a famous mix-up. In fact \\(\\mathrm{P}\\) sits inside \\(\\mathrm{NP}\\).",
    source: "Sipser §7.3"
  },
  {
    id: "ch7-basic-np-not-nonpoly", chapter: 7, rank: 0, topic: "The class NP (basics)", type: "tf",
    prompt: "\\(\\mathrm{NP}\\) stands for 'non-polynomial.'",
    answer: false,
    explanation: "Common misconception! \\(\\mathrm{NP}\\) is **nondeterministic polynomial time**. Since \\(\\mathrm{P}\\subseteq\\mathrm{NP}\\), the class \\(\\mathrm{NP}\\) even contains problems we can solve in polynomial time.",
    source: "Sipser §7.3"
  },

  // ---- Verifier & certificate ----
  {
    id: "ch7-basic-verifier-def", chapter: 7, rank: 0, topic: "Verifiers & certificates (basics)", type: "mc",
    prompt: "A **verifier** is a program that:",
    choices: [
      "takes the problem plus a hint, and quickly checks whether the hint proves a YES answer",
      "solves the problem from scratch with no hint",
      "always says YES",
      "lists every possible answer"
    ],
    answer: 0,
    explanation: "A verifier is the 'fact-checker': give it the input and a hint, and it quickly confirms whether the hint really shows the answer is YES.",
    source: "Sipser Def 7.18"
  },
  {
    id: "ch7-basic-certificate-fib", chapter: 7, rank: 0, topic: "Verifiers & certificates (basics)", type: "fib",
    prompt: "The short hint that proves a YES answer — the thing a verifier checks — is called a ____ (also called a witness).",
    accept: ["certificate", "witness", "proof"],
    explanation: "The hint is a **certificate** (or witness). For 'does this graph have a path that visits every city once?', the certificate is just that path — easy to check.",
    source: "Sipser Def 7.18"
  },

  // ---- P inside NP ----
  {
    id: "ch7-basic-p-subset-np", chapter: 7, rank: 0, topic: "P versus NP (basics)", type: "tf",
    prompt: "Every problem in \\(\\mathrm{P}\\) is also in \\(\\mathrm{NP}\\) (that is, \\(\\mathrm{P}\\subseteq\\mathrm{NP}\\)).",
    answer: true,
    explanation: "If you can SOLVE something quickly, you can also CHECK it quickly (just ignore the hint and solve it). So everything in \\(\\mathrm{P}\\) is automatically in \\(\\mathrm{NP}\\).",
    source: "Sipser §7.3"
  },

  // ---- P vs NP question ----
  {
    id: "ch7-basic-pvsnp-question", chapter: 7, rank: 0, topic: "P versus NP (basics)", type: "mc",
    prompt: "In plain words, the famous **P vs NP** question asks:",
    choices: [
      "if an answer is easy to CHECK, is it also easy to FIND?",
      "is every problem impossible to solve?",
      "do computers ever make mistakes?",
      "is \\(2^n\\) bigger than \\(n^2\\)?"
    ],
    answer: 0,
    explanation: "P vs NP asks whether 'easy to check' (\\(\\mathrm{NP}\\)) is the same as 'easy to solve' (\\(\\mathrm{P}\\)). Nobody knows the answer — it is one of the biggest open problems in computer science.",
    source: "Sipser §7.3"
  },

  // ---- Polynomial-time reduction ----
  {
    id: "ch7-basic-reduce-def", chapter: 7, rank: 0, topic: "Polynomial-time reduction (basics)", type: "mc",
    prompt: "A **polynomial-time reduction** from problem \\(A\\) to problem \\(B\\) is a fast way to:",
    choices: [
      "turn any question about \\(A\\) into a question about \\(B\\), so that solving \\(B\\) answers \\(A\\)",
      "prove \\(A\\) and \\(B\\) are both impossible",
      "make \\(A\\) run faster on a laptop",
      "delete problem \\(A\\)"
    ],
    answer: 0,
    explanation: "A reduction is a quick translator: it rewrites an \\(A\\)-question as a \\(B\\)-question with the same yes/no answer. If you can solve \\(B\\), you can solve \\(A\\).",
    source: "Sipser Def 7.29"
  },
  {
    id: "ch7-basic-reduce-symbol-fib", chapter: 7, rank: 0, topic: "Polynomial-time reduction (basics)", type: "fib",
    prompt: "We write '\\(A\\) reduces to \\(B\\) in polynomial time' with the symbol \\(A\\,\\_\\_\\_\\,B\\). Type the symbol (for example: <=p).",
    accept: ["<=p", "\\le_p", "\\leq_p", "<= p", "≤p", "<=_p", "<= _p"],
    explanation: "The notation is \\(A\\le_p B\\). The little \\(p\\) reminds you the translation must be done in **polynomial** time.",
    source: "Sipser Def 7.29"
  },
  {
    id: "ch7-basic-reduce-transfers-easy", chapter: 7, rank: 0, topic: "Polynomial-time reduction (basics)", type: "tf",
    prompt: "If \\(A\\le_p B\\) and \\(B\\) is easy (in \\(\\mathrm{P}\\)), then \\(A\\) is easy too.",
    answer: true,
    explanation: "Easiness flows backward along the arrow: translate the \\(A\\)-question into a \\(B\\)-question (fast), then solve \\(B\\) (fast). So \\(A\\) is in \\(\\mathrm{P}\\) as well.",
    source: "Sipser Thm 7.31"
  },
  {
    id: "ch7-basic-reduce-transfers-hard", chapter: 7, rank: 0, topic: "Polynomial-time reduction (basics)", type: "mc",
    prompt: "Reductions also transfer **hardness**. If \\(A\\le_p B\\) and we know \\(A\\) is hard, then:",
    choices: [
      "\\(B\\) must be at least as hard as \\(A\\)",
      "\\(B\\) must be easy",
      "\\(B\\) becomes impossible",
      "nothing can be said about \\(B\\)"
    ],
    answer: 0,
    explanation: "If the hard problem \\(A\\) can be re-asked as \\(B\\), then \\(B\\) can't be easier than \\(A\\) — a fast solver for \\(B\\) would make \\(A\\) fast too. This is how we prove problems are hard.",
    source: "Sipser Thm 7.36 (idea)"
  },

  // ---- NP-hard & NP-complete ----
  {
    id: "ch7-basic-nphard-def", chapter: 7, rank: 0, topic: "NP-complete (basics)", type: "mc",
    prompt: "Calling a problem **NP-hard** means, in plain words, that it is:",
    choices: [
      "at least as hard as every problem in \\(\\mathrm{NP}\\) (everything in \\(\\mathrm{NP}\\) reduces to it)",
      "definitely impossible to solve",
      "always easy to solve",
      "not a real problem"
    ],
    answer: 0,
    explanation: "NP-hard = 'as hard as the hardest things in \\(\\mathrm{NP}\\), or harder.' Every \\(\\mathrm{NP}\\) problem can be turned into it by a reduction.",
    source: "Sipser §7.4"
  },
  {
    id: "ch7-basic-npc-def", chapter: 7, rank: 0, topic: "NP-complete (basics)", type: "mc",
    prompt: "A problem is **NP-complete** when it is both:",
    choices: [
      "in \\(\\mathrm{NP}\\), AND as hard as every other problem in \\(\\mathrm{NP}\\)",
      "in \\(\\mathrm{P}\\), AND very short to write down",
      "impossible, AND undecidable",
      "easy to solve, AND easy to check"
    ],
    answer: 0,
    explanation: "NP-complete = the hardest problems **inside** \\(\\mathrm{NP}\\): they are in \\(\\mathrm{NP}\\), and every \\(\\mathrm{NP}\\) problem reduces to them. Solve one of them quickly and you solve all of \\(\\mathrm{NP}\\) quickly.",
    source: "Sipser Def 7.34"
  },

  // ---- Cook–Levin ----
  {
    id: "ch7-basic-cooklevin", chapter: 7, rank: 0, topic: "Cook–Levin (basics)", type: "mc",
    prompt: "The **Cook–Levin theorem** is famous for telling us that:",
    choices: [
      "\\(SAT\\) was the first problem proven to be NP-complete",
      "\\(\\mathrm{P}=\\mathrm{NP}\\)",
      "no problem is NP-complete",
      "every problem is in \\(\\mathrm{P}\\)"
    ],
    answer: 0,
    explanation: "Cook and Levin showed \\(SAT\\) is NP-complete — the very first such problem. After that, others were proven NP-complete by reducing from \\(SAT\\) (or \\(3SAT\\)).",
    source: "Sipser Thm 7.37"
  },

  // ---- Name-level: SAT, 3SAT, CLIQUE, vertex cover, HAMPATH, SUBSET-SUM ----
  {
    id: "ch7-basic-sat-name", chapter: 7, rank: 0, topic: "Famous problems (basics)", type: "mc",
    prompt: "The problem **SAT** asks:",
    choices: [
      "can we set the true/false variables so a logic formula comes out TRUE?",
      "is a number prime?",
      "does a graph have a path between two nodes?",
      "do some numbers add up to a target?"
    ],
    answer: 0,
    explanation: "SAT (satisfiability) asks whether a Boolean formula can be made true by choosing the right true/false values for its variables. A formula that can is called 'satisfiable.'",
    source: "Sipser §7.4"
  },
  {
    id: "ch7-basic-3sat-name", chapter: 7, rank: 0, topic: "Famous problems (basics)", type: "tf",
    prompt: "**3SAT** is just SAT for formulas written in a tidy form where each clause (a group joined by 'or') has exactly three pieces.",
    answer: true,
    explanation: "3SAT is the special, neatly-structured version of SAT (three literals per clause). Its rigid shape makes it the favorite starting point for proving other problems NP-complete.",
    source: "Sipser Cor 7.42"
  },
  {
    id: "ch7-basic-clique-name", chapter: 7, rank: 0, topic: "Famous problems (basics)", type: "mc",
    prompt: "In a graph, a **clique** is:",
    choices: [
      "a group of nodes where every pair is directly connected by an edge",
      "a path that visits every node once",
      "a node touching every edge",
      "a graph with no edges"
    ],
    answer: 0,
    explanation: "A clique is an 'all-friends' group: every two nodes in it share an edge. The CLIQUE problem asks whether a graph contains a clique of a given size.",
    source: "Sipser §7.3"
  },
  {
    id: "ch7-basic-vertexcover-name", chapter: 7, rank: 0, topic: "Famous problems (basics)", type: "mc",
    prompt: "A **vertex cover** of a graph is:",
    choices: [
      "a set of nodes that touches (covers) every edge",
      "a set of nodes that are all connected to each other",
      "a trip that visits every node once",
      "a coloring of the nodes"
    ],
    answer: 0,
    explanation: "A vertex cover is a set of 'guard' nodes so that every edge has at least one endpoint guarded. VERTEX-COVER asks if a small enough such set exists.",
    source: "Sipser §7.5"
  },
  {
    id: "ch7-basic-hampath-name", chapter: 7, rank: 0, topic: "Famous problems (basics)", type: "mc",
    prompt: "**HAMPATH** (the Hamiltonian path problem) asks whether a graph has a path that:",
    choices: [
      "visits every node exactly once",
      "uses every edge exactly once",
      "starts and ends at the same node",
      "has the fewest edges possible"
    ],
    answer: 0,
    explanation: "A Hamiltonian path touches every node exactly once. HAMPATH asks whether such a path exists from a start node to an end node — easy to check given the path, hard to find.",
    source: "Sipser §7.3"
  },
  {
    id: "ch7-basic-subsetsum-name", chapter: 7, rank: 0, topic: "Famous problems (basics)", type: "mc",
    prompt: "**SUBSET-SUM** asks:",
    choices: [
      "is there a group of the given numbers that adds up exactly to a target?",
      "what is the largest of the given numbers?",
      "are all the numbers prime?",
      "how many numbers are there in total?"
    ],
    answer: 0,
    explanation: "SUBSET-SUM asks whether some subset of the numbers hits a target total. The certificate is just that subset, and a verifier simply adds it up.",
    source: "Sipser §7.3"
  }
]);
