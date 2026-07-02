/* Chapter 7 — "why this matters" + real-world ties. Keyed "7::<topic>" to match question topics. */
TOC.addWhy({
  "7::TIME(t(n))": {
    why: "\\(\\mathrm{TIME}(t(n))\\) is the unit we measure algorithms in: it turns \"fast\" into a precise statement about how step counts scale with input length \\(n\\), which is what lets us compare two algorithms before ever running them.",
    real: "When a library documents that sorting is \\(O(n\\log n)\\) but a naive approach is \\(O(n^2)\\), that is a \\(\\mathrm{TIME}\\) claim — it predicts which one survives when \\(n\\) grows from a thousand to a billion records."
  },
  "7::Time complexity (basics)": {
    why: "Counting steps as a function of input size is the first thing that separates a usable algorithm from one that technically works but never finishes — it tells you whether doubling the input doubles the wait or squares it.",
    real: "A web search engine handling billions of pages can only ship algorithms whose running time grows gently with the data; an \\(O(n^2)\\) ranking pass over the whole index would simply never return."
  },
  "7::Big-O and small-o": {
    why: "Big-O lets us ignore machine-specific constants and tiny terms and talk about the one thing that survives at scale — the dominant growth rate — so that an analysis done on paper still predicts behavior on real hardware.",
    real: "Cloud providers price and capacity-plan around asymptotics: choosing a hash index (\\(O(1)\\) lookup) over a linear scan (\\(O(n)\\)) is what keeps a database responsive as a table grows from thousands to millions of rows."
  },
  "7::Big-O and small-o (basics)": {
    why: "These notations are the vocabulary for \"about how fast\": Big-O is an upper bound up to a constant, and small-o means strictly slower-growing, so you can rank algorithms without drowning in exact step counts.",
    real: "When a coding-interview answer is judged \"\\(O(n)\\) is good enough, \\(O(n^2)\\) will time out,\" that verdict is pure Big-O reasoning about how the code behaves on the largest test inputs."
  },
  "7::Polynomial vs exponential (basics)": {
    why: "This is the great dividing line of practical computing: a polynomial bound like \\(n^2\\) stays manageable as inputs grow, while an exponential bound like \\(2^{n}\\) explodes so fast that even small inputs become hopeless on any machine.",
    real: "Brute-forcing a 128-bit cryptographic key is exponential (\\(2^{128}\\) possibilities) and thus infeasible for every computer that will ever exist, which is precisely why such keys keep your data safe."
  },
  "7::Model relationships": {
    why: "Knowing that a multitape machine costs at most a squaring while removing nondeterminism may cost an exponential is what justifies treating \\(\\mathrm{P}\\) as model-independent — it tells us which implementation choices are harmless and which could be catastrophic.",
    real: "It explains why moving an algorithm from one realistic architecture to another (more tapes, more cores) never turns a tractable problem intractable, so engineers can reason about feasibility without pinning down the exact hardware."
  },
  "7::The class P": {
    why: "\\(\\mathrm{P}\\) is computer science's working definition of \"efficiently solvable,\" and its robustness across all reasonable deterministic models is what lets theorists prove a problem is feasible once, on paper, rather than re-checking every machine.",
    real: "Routing a packet across the internet relies on shortest-path algorithms that are in \\(\\mathrm{P}\\); because the problem is polynomial, routers can recompute paths fast enough to keep traffic flowing in real time."
  },
  "7::The class P (basics)": {
    why: "\\(\\mathrm{P}\\) is the set of problems we can actually solve quickly as inputs scale up, so labeling a problem \"in \\(\\mathrm{P}\\)\" is a promise that a practical algorithm exists — not just some algorithm that eventually halts.",
    real: "Checking whether two numbers share a common factor (used when generating crypto keys) is in \\(\\mathrm{P}\\) thanks to Euclid's algorithm, so software can do it instantly even on enormous numbers."
  },
  "7::The class NP": {
    why: "\\(\\mathrm{NP}\\) captures problems where a solution is hard to find but easy to CHECK, which is exactly the structure behind search, optimization, and security — the gap between finding and verifying is where most of the difficulty in computing lives.",
    real: "Verifying a Sudoku solution or a valid travel itinerary is trivial once handed to you, but discovering one can require searching an astronomical space — the everyday face of an \\(\\mathrm{NP}\\) problem."
  },
  "7::The class NP (basics)": {
    why: "\\(\\mathrm{NP}\\) is the class of \"easy to check, maybe hard to solve\" problems: if someone gives you a candidate answer plus a short hint (a certificate), you can confirm it quickly even when finding it yourself seems impossible.",
    real: "When a website verifies your password or a digital signature, it is doing the easy \"check\" side of an \\(\\mathrm{NP}\\)-style problem, while an attacker faces the hard \"find\" side."
  },
  "7::Verifiers & certificates (basics)": {
    why: "The verifier/certificate view reframes hardness as a question of proof length: a problem is in \\(\\mathrm{NP}\\) exactly when a YES answer comes with a short, quickly-checkable witness, which is the foundation for everything from proofs to authentication.",
    real: "A digital signature is a certificate: anyone can quickly verify it against the public key, but only the holder of the private key could have produced it — easy to check, hard to forge."
  },
  "7::P versus NP": {
    why: "\\(\\mathrm{P}\\) vs \\(\\mathrm{NP}\\) asks whether every problem whose solutions are easy to verify is also easy to solve; a YES would mean creativity can be automated, and a NO would confirm that some problems are inherently hard to crack.",
    real: "Modern public-key cryptography (RSA, the locks behind online banking) is betting that \\(\\mathrm{P}\\neq\\mathrm{NP}\\)-style hardness holds — if anyone found a fast algorithm for these problems, that security would collapse overnight."
  },
  "7::P versus NP (basics)": {
    why: "This is the famous open question: is checking an answer fundamentally easier than finding one? Almost all of computing quietly assumes the answer is yes (that solving is harder), and a proof either way would reshape the field.",
    real: "If solving were as easy as checking, then cracking passwords, breaking encryption, and finding optimal schedules would all become fast — which is exactly why the presumed hardness is what keeps your accounts secure."
  },
  "7::P vs NP": {
    why: "At heart \\(\\mathrm{P}\\) vs \\(\\mathrm{NP}\\) is about whether brilliant insight (finding a solution) can always be replaced by mechanical search that runs quickly; its resolution would tell us the true cost of solving versus merely recognizing a good answer.",
    real: "A completed Sudoku grid is instantly checkable, but solving large puzzles seems to require search — the same \"easy to verify, hard to produce\" gap that, at industrial scale, protects encrypted data."
  },
  "7::Polynomial-time reducibility": {
    why: "Polynomial-time reductions let us say \"\\(A\\) is no harder than \\(B\\)\" with a single efficient translation, turning thousands of separate problems into one connected web where solving any hard node would solve them all.",
    real: "Engineers exploit this daily by re-encoding a new scheduling or assignment problem as Boolean satisfiability and feeding it to an industrial SAT solver — a reduction \\(A\\le_p B\\) that reuses one powerful engine for many tasks."
  },
  "7::Polynomial-time reduction (basics)": {
    why: "A reduction is just an efficient translator from one problem into another that preserves yes/no answers; it means you can solve a brand-new problem by converting it into one you already know how to solve.",
    real: "Map and logistics apps turn many real questions (\"can I visit these stops under a time limit?\") into a few well-studied problems, then run one optimized solver — the practical payoff of reductions."
  },
  "7::NP-completeness": {
    why: "The NP-complete problems are the hardest in \\(\\mathrm{NP}\\) and all stand or fall together: a fast algorithm for any one of them would solve every problem in \\(\\mathrm{NP}\\) quickly, so they mark the boundary where efficient solutions are presumed impossible.",
    real: "Once you recognize that vehicle routing, crew scheduling, or chip layout is NP-complete, you stop chasing a perfect fast algorithm and deploy heuristics or approximations instead — exactly what shipping and airline planners do."
  },
  "7::NP-complete (basics)": {
    why: "An NP-complete problem is among the toughest \"easy-to-check\" problems, and they are all secretly the same difficulty — crack one efficiently and you crack them all, which is why none is believed to have a fast solution.",
    real: "The traveling salesman problem (find the shortest tour through many cities) is NP-complete, so delivery companies settle for near-optimal routes rather than guaranteed-best ones."
  },
  "7::Cook–Levin theorem": {
    why: "Cook–Levin proved a FIRST NP-complete problem (\\(SAT\\)) from scratch, giving the whole theory a starting point: every later NP-completeness proof grows from this seed by reduction, so it is the anchor of the entire map of intractability.",
    real: "It is why SAT solvers became a universal tool — because so many problems reduce to satisfiability, hardware verification and AI planning systems encode their tasks as Boolean formulas and let a SAT engine do the work."
  },
  "7::Cook–Levin (basics)": {
    why: "Cook–Levin showed that satisfiability of Boolean formulas (\\(SAT\\)) is NP-complete — the first problem proven to be as hard as everything in \\(\\mathrm{NP}\\), and the template all other hardness proofs copy.",
    real: "Because of this result, checking whether a digital circuit can ever output the wrong value is phrased as a \\(SAT\\) question, and chip makers run solvers on it to catch bugs before manufacturing."
  },
  "7::Additional NP-complete problems": {
    why: "Showing that \\(CLIQUE\\), \\(VERTEX\\text{-}COVER\\), \\(HAMPATH\\), \\(SUBSET\\text{-}SUM\\) and others are NP-complete reveals that intractability is everywhere, not a freak feature of one puzzle — recognizing the pattern saves you from hunting for a fast algorithm that almost certainly does not exist.",
    real: "Packing items into the fewest bins (bin packing) and seating guests with conflicting constraints reduce to these known NP-complete problems, so warehouse and event software relies on approximation rather than exact optimization."
  },
  "7::Famous problems (basics)": {
    why: "The named NP-complete problems — \\(SAT\\), \\(3SAT\\), \\(CLIQUE\\), \\(VERTEX\\text{-}COVER\\), \\(HAMPATH\\), \\(SUBSET\\text{-}SUM\\) — are a shared vocabulary: spotting that your task \"looks like\" one of them immediately tells you it is probably hard and points you to existing tools.",
    real: "A social-network feature that finds the largest group of mutual friends is the \\(CLIQUE\\) problem, and the difficulty of computing it exactly on huge graphs is why such features use sampling and approximation."
  }
});
