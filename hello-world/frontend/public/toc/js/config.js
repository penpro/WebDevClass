/* Global config: chapters, defaults, constants.
   Works in browser (window) and Node (globalThis) for testing. */
(function (root) {
  var TOC = (root.TOC = root.TOC || {});

  // Real, gated chapters (Sipser 0–8, scoped to what the course covered).
  TOC.CHAPTERS = [
    { n: 0, title: "Mathematical Preliminaries", short: "Ch 0", blurb: "Sets, sequences, functions, relations, graphs, strings & languages, proof techniques." },
    { n: 1, title: "Regular Languages", short: "Ch 1", blurb: "DFA, NFA, regular expressions, closure, pumping lemma, nonregularity." },
    { n: 2, title: "Context-Free Languages", short: "Ch 2", blurb: "CFGs, derivations, ambiguity, Chomsky normal form, PDAs, CFL pumping lemma." },
    { n: 3, title: "Turing Machines (Church–Turing)", short: "Ch 3", blurb: "TM definition, configurations, variants, recognizers vs deciders, the Church–Turing thesis." },
    { n: 4, title: "Decidability", short: "Ch 4", blurb: "Decidable problems, A_TM, diagonalization, the halting problem, co-recognizability." },
    { n: 5, title: "Reducibility", short: "Ch 5", blurb: "Undecidable problems, computation histories, mapping reducibility, Rice's theorem." },
    { n: 6, title: "Advanced Computability", short: "Ch 6", blurb: "The recursion theorem and self-reference (supplemental: 5.30, 6.24)." },
    { n: 7, title: "Time Complexity", short: "Ch 7", blurb: "Big-O, the classes P and NP, verifiers, NP-completeness, Cook–Levin, reductions." },
    { n: 8, title: "Space Complexity", short: "Ch 8", blurb: "PSPACE, Savitch's theorem, TQBF, L and NL, NL-completeness, NL = coNL." }
  ];

  // Exam checkpoints. Each covers a range of chapters and unlocks (in guided
  // mode) only once those chapters are mastered. They are NOT auto-interleaved
  // into chapter study — you select them explicitly from the Focus menu.
  //   Exam 1  -> Chapters 0-2     Exam 2 -> Chapters 3-5     Final -> Chapters 6-8
  TOC.EXAMS = [
    { n: 10, title: "Exam 1 Practice", short: "Exam 1", covers: [0, 1, 2], blurb: "Checkpoint over Chapters 0–2 (graphs, regular & context-free languages). Drawn from your past Exam 1 and review problems." },
    { n: 11, title: "Exam 2 Practice", short: "Exam 2", covers: [3, 4, 5], blurb: "Checkpoint over Chapters 3–5 (Turing machines, decidability, reducibility). From your past Exam 2 and the decidability prep handout." },
    { n: 12, title: "Final Prep (Ch 7–8 + assigned)", short: "Final", covers: [6, 7, 8], blurb: "Focused final-exam prep — Chapters 7–8 (time & space complexity) plus the assigned problems: 7.1–7.12, 7.20, 7.29; 8.1–8.3, 8.8, 8.9; supplemental 5.30 & 6.24; review 1.46, 2.47, 3.13, 4.15. Use 🔓 Unlock to open it directly." }
  ];

  TOC.isExamBucket = function (n) { return n >= 10; };
  TOC.examBucket = function (n) { return TOC.EXAMS.find(function (e) { return e.n === n; }) || null; };

  TOC.allChapters = function () {
    return TOC.CHAPTERS.concat(TOC.EXAMS);
  };

  TOC.chapterMeta = function (n) {
    return TOC.allChapters().find(function (c) { return c.n === n; }) || { n: n, title: "Chapter " + n, short: "Ch " + n, blurb: "" };
  };

  // Tunable defaults (exposed in Settings).
  TOC.DEFAULTS = {
    masterStreak: 3,        // correct-in-a-row needed to "master" a question (asked >=3x)
    unlockThreshold: 0.9,   // chapter mastery needed to unlock the next chapter
    mode: "guided",         // "guided" (gated progression) | "free" (all chapters open)
    ramp: true,             // difficulty ramp: ease in with basics before harder questions
    theme: "light"
  };

  // ---- difficulty ramp ----------------------------------------------------
  // Each question has a rank (0 = plain-language definition / basics; higher =
  // harder). Within a chapter a rank tier only opens once ~RAMP_THRESHOLD of the
  // tier below it has been answered correctly at least once — so you learn what
  // the terms mean before the tool throws constructions and proofs at you.
  TOC.RAMP_THRESHOLD = 0.7;

  TOC.rankOf = function (q) {
    if (q.rank != null) return q.rank;
    var lp = (q.prompt || "").toLowerCase();
    if (/in plain terms|what is a|what is an|what is the|what does .*(mean|denote|stand for)|shorthand for|\bis called\b|\bare called\b|called the|denoted|the term for|stands for/.test(lp)) return 0;
    if (q.diagram) return 40;
    if (/\btrace\b|how many|\bcompute\b|plug in|pumped|which string|subset construction|configuration|leftmost|relatively prime|fill out the table/.test(lp)) return 40;
    if (/\bprove\b|reduction|reduce |np-complete|pspace-complete|nl-complete|why is|why does|\bconstruct\b/.test(lp)) return 40;
    if (q.type === "tf" || q.type === "fib") return 10;
    if (q.type === "order") return 30;
    return 20; // mc / multi recall
  };

  // The label shown for a rank tier (UI).
  TOC.rankLabel = function (r) {
    if (r <= 0) return "Basics";
    if (r < 20) return "Easy";
    if (r < 30) return "Core";
    if (r < 40) return "Harder";
    return "Challenge";
  };

  // Leitner box -> spacing interval, measured in "question events" (a logical clock).
  TOC.INTERVALS = { 1: 1, 2: 2, 3: 4, 4: 8, 5: 16, 6: 32 };
})(typeof window !== "undefined" ? window : globalThis);
