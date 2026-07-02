/* Chapter 8 — "why this matters" + real-world ties. Keyed "8::<topic>" to match question topics. */
TOC.addWhy({
  "8::Space complexity": {
    why: "Space complexity measures the resource you can REUSE, so it behaves very differently from time: a fixed block of memory can be cycled through exponentially many possibilities, which is why a problem can need little space yet enormous time.",
    real: "Embedded controllers and graphics drivers live under hard memory ceilings, so engineers pick algorithms by their space footprint — an approach that needs \\(O(n)\\) memory may be unusable where only a few kilobytes exist."
  },
  "8::Savitch's theorem": {
    why: "Savitch's theorem shows that for space, nondeterminism buys you almost nothing — guessing can be simulated deterministically at the cost of only SQUARING the space (\\(\\mathrm{NSPACE}(f)\\subseteq\\mathrm{SPACE}(f^2)\\)), a stark contrast to the suspected exponential gap for time.",
    real: "It underlies memory-frugal reachability and verification: a model checker can confirm a system never reaches a bad state using space proportional to \\(f^2\\) rather than storing the full exponential set of reachable configurations."
  },
  "8::PSPACE": {
    why: "\\(\\mathrm{PSPACE}\\) is the natural home of problems solvable with reasonable memory but possibly astronomical time, and it captures a higher tier of difficulty than \\(\\mathrm{NP}\\) — the realm of deep lookahead and exhaustive reasoning under a memory budget.",
    real: "Deciding the winner of a two-player board game with perfect play, or checking that a hardware protocol satisfies a temporal-logic spec, are \\(\\mathrm{PSPACE}\\)-style tasks: bounded memory, but a search tree far too large to ever fully expand."
  },
  "8::PSPACE-completeness": {
    why: "\\(\\mathrm{PSPACE}\\)-complete problems are the hardest in \\(\\mathrm{PSPACE}\\); identifying one (like true quantified Boolean formulas, \\(TQBF\\)) tells you the task is almost certainly beyond \\(\\mathrm{NP}\\) and that alternating \\(\\forall/\\exists\\) reasoning is unavoidable.",
    real: "Generalized versions of games like Go and many AI planning problems with adversaries are \\(\\mathrm{PSPACE}\\)-complete, which is why perfect game-solvers and full planners must rely on bounded search and heuristics rather than exact computation."
  },
  "8::PSPACE vs EXPTIME": {
    why: "\\(\\mathrm{PSPACE}\\subseteq\\mathrm{EXPTIME}\\) because a polynomial-space machine has only \\(2^{O(f(n))}\\) configurations, and the time hierarchy forces \\(\\mathrm{P}\\neq\\mathrm{EXPTIME}\\) — so somewhere in the chain a separation is guaranteed even though no one knows exactly where.",
    real: "It marks a real difficulty cliff in game AI: small games solvable in polynomial space scale into provably exponential-time territory, which is why endgame solvers for larger boards must give up on exhaustive analysis."
  },
  "8::L and NL": {
    why: "\\(\\mathrm{L}\\) and \\(\\mathrm{NL}\\) (log space) model computation that can READ a gigantic input but only afford a constant number of pointers into it — the theory behind processing data far larger than your working memory.",
    real: "Streaming and log-analysis systems that scan terabytes while keeping only counters and indices in RAM are doing essentially log-space computation; \\(\\mathrm{L}\\) is the formal version of \"one pass, tiny memory.\""
  },
  "8::NL-completeness": {
    why: "\\(\\mathrm{NL}\\)-completeness (defined with the weaker log-space reduction \\(\\le_L\\)) pinpoints the hardest problems solvable nondeterministically in tiny memory, with directed graph reachability (\\(PATH\\)) as the canonical example that everything in \\(\\mathrm{NL}\\) reduces to.",
    real: "Asking \"is destination \\(t\\) reachable from source \\(s\\)?\" in a huge road or network graph is the \\(PATH\\) problem, and its log-space character is what lets navigation systems answer reachability without loading the entire map into memory at once."
  },
  "8::NL = coNL": {
    why: "The Immerman–Szelepcsényi result \\(\\mathrm{NL}=\\mathrm{coNL}\\) was a genuine surprise: in log space you can verify a NO answer (\"\\(t\\) is UNreachable\") as easily as a YES, even though the matching question for \\(\\mathrm{NP}\\) versus \\(\\mathrm{coNP}\\) is famously still open.",
    real: "It means a tiny-memory certifier can confirm that no path connects two nodes — useful for verifying isolation or unreachability in a network, where proving something can't happen is as important as finding a route that can."
  }
});
