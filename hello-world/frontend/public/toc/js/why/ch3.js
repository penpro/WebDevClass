/* Chapter 3 — "Why this matters" + real-world examples, keyed "3::<topic>". */
TOC.addWhy({
  "3::Accept & reject": {
    why: "Collapsing every computation to one of two verdicts is what makes a machine a decision procedure rather than a vague process: it turns \"does \\(M\\) like \\(w\\)?\" into a crisp yes/no that proofs and reductions can chain together. The catch is that a TM may give neither verdict by looping, so \"didn't accept\" is genuinely weaker than \"rejected.\"",
    real: "A regular-expression engine returns a clean match/no-match boolean per input, but a poorly written pattern can backtrack forever (catastrophic ReDoS) — the same accept/reject-or-hang trichotomy that lets a denial-of-service attack freeze a web server with one crafted string."
  },
  "3::Acceptance & looping": {
    why: "The possibility of looping is the single feature that separates Turing machines from finite automata and the root of every undecidability result: because a run may never halt, no general \"did it finish yet?\" test exists. This is the precise reason software cannot, in general, predict its own termination.",
    real: "An operating-system scheduler cannot tell whether a running process will ever terminate, so it relies on watchdog timers and user-issued kills (Ctrl-C, the Task Manager \"End task\") rather than a built-in oracle that detects infinite loops."
  },
  "3::Alphabets": {
    why: "Fixing a finite alphabet is what lets every object of interest — numbers, programs, proofs, images — be treated uniformly as a finite string, so a single machine model can take any of them as input. Computation theory studies strings precisely because everything digital reduces to them.",
    real: "All file formats and network protocols ultimately serialize to bytes over the fixed 256-symbol alphabet \\(\\{0,\\dots,255\\}\\); UTF-8 then layers a variable-length encoding on top so the entire Unicode character set rides on that one finite byte alphabet."
  },
  "3::Church–Turing thesis": {
    why: "The thesis is the bridge that justifies talking about \"algorithms\" at all: it lets us prove that no program in any language can solve a problem by proving that no Turing machine can. Without it, an undecidability result would only constrain one specific model rather than computation itself.",
    real: "It underwrites why a problem proven undecidable for Turing machines (like the halting problem) is equally hopeless in Python, Rust, or any future language — vendors of static-analysis tools rely on this universality when they accept that some properties can only be approximated, never decided."
  },
  "3::Closure (decidable)": {
    why: "Closure under union, intersection, and complement means you can build a guaranteed-terminating checker for a compound condition by gluing together checkers for its parts — the always-halting property survives the composition. This compositionality is what makes decidable problems safe to use as building blocks.",
    real: "A linter or policy engine that decides several finite checks (file size limits, allowed-license lists, naming rules) combines them with boolean AND/OR and still always terminates, because each sub-check halts and the combination only runs them in sequence."
  },
  "3::Closure (recognizable)": {
    why: "Recognizable languages are closed under union and intersection but crucially not under complement, which is the first sign of a deep asymmetry: you can sometimes confirm membership yet never confirm non-membership. That gap is exactly what Chapter 4 turns into the existence of recognizable-but-undecidable problems.",
    real: "A malware scanner can eventually confirm a file matches some signature in a growing database (a recognizer that says \"yes\" when it finds a match) but can never definitively certify a file is clean, because proving the absence of any malicious behavior is the uncomputable complement."
  },
  "3::Configuration": {
    why: "A configuration freezes the entire machine state — control state, tape contents, head position — into one finite object, which is what lets us reason about a computation as a discrete sequence of well-defined steps and even feed one machine's state to another. Snapshotting state is the foundation of simulation, checkpointing, and debugging.",
    real: "Virtual-machine and container snapshots (VMware, Docker checkpoint/restore) capture exactly this kind of full state — registers, memory, program counter — so an execution can be paused, copied, migrated to another host, and resumed from precisely where it left off."
  },
  "3::Configurations": {
    why: "Defining acceptance as a finite chain of configurations, each yielding the next, makes \"\\(M\\) accepts \\(w\\)\" a precisely checkable mathematical statement rather than an informal claim about running a program. This rigor is what allows a universal machine to verify another machine's computation step by step.",
    real: "A deterministic replay debugger (such as rr) records the sequence of program states so an execution can be re-run forward and backward exactly, reconstructing each successive configuration to pin down where a bug first appeared."
  },
  "3::Describing TMs": {
    why: "Allowing high-level English descriptions, trusting they could be compiled down to a transition table, is what makes computability proofs tractable — but it imposes a discipline: every step you write in prose must itself be mechanically computable, or you smuggle in power the model lacks. This mirrors the gap between pseudocode and real code.",
    real: "Compilers embody these levels of description literally: a high-level statement is lowered through intermediate representations down to concrete machine instructions, and the compiler must reject any \"step\" (like an undefined operation) that has no executable realization."
  },
  "3::Encoding objects": {
    why: "Encoding lets a Turing machine accept graphs, automata, or even other programs as input by writing them as strings, which is the conceptual leap that makes programs-as-data — and therefore universal machines and self-reference — possible. \\(\\langle M\\rangle\\) is a static description of \\(M\\), not \\(M\\) running.",
    real: "Source code, JSON, and serialized objects (Java's Serializable, Python's pickle) are exactly such encodings; a compiler or interpreter reads another program's encoded text \\(\\langle M\\rangle\\) as ordinary input data before it ever executes it."
  },
  "3::Enumerators": {
    why: "The equivalence between recognizers and enumerators reveals two faces of the same class: a language is recognizable iff its members can be systematically listed (in some order, possibly with repeats). The dovetailing trick — interleaving many computations so none blocks the others — is the technique that defeats individual infinite loops.",
    real: "A web crawler enumerates reachable URLs by dovetailing fetches across many pages concurrently rather than fully exploring one branch first, so a single slow or infinite site cannot stall discovery of the rest of the web."
  },
  "3::Halting & looping": {
    why: "The three-way outcome accept / reject / loop is the defining behavior of general computation, and the third option is irreducible: a machine that always halts (a decider) is strictly more powerful as a tool than one that merely recognizes. Recognizing this gap is the whole point of distinguishing recognizers from deciders.",
    real: "Build systems and CI pipelines impose hard timeouts on every job precisely because they cannot detect a hung step from a slow one; the timeout is an external, conservative substitute for the halting verdict no algorithm can supply."
  },
  "3::Hilbert's 10th / algorithms": {
    why: "Hilbert's tenth problem shows that a perfectly concrete, century-old mathematical question — does this integer polynomial have an integer root? — has provably no algorithm, and settling it required first defining \"algorithm\" rigorously. It is recognizable but not decidable: you can find a root if one exists, but never rule one out.",
    real: "Constraint solvers and SMT tools (Z3) that hunt for integer solutions to systems of equations are sound but necessarily incomplete on general integer arithmetic (Diophantine constraints) — exactly because the underlying problem is undecidable, they may search forever without ever proving unsatisfiability."
  },
  "3::Language of a machine": {
    why: "Identifying a machine with the set of strings it accepts shifts attention from how a computation proceeds to what problem it solves, which is what lets us compare wildly different machines by the single yardstick of their language. Two machines are \"the same\" computationally exactly when they recognize the same language.",
    real: "Test suites treat a program as the language of inputs it accepts: differential testing and fuzzers (AFL) compare two implementations of the same spec — say two PDF parsers — by finding an input where their accept/reject behavior diverges, exposing a bug."
  },
  "3::Recognizable vs decidable": {
    why: "The entire distinction is the single word \"halts\": a recognizer may loop on non-members, while a decider always returns a verdict. This gap is not academic — it is the formal reason there are problems software can confirm but never refute, and confronting it is the heart of computability.",
    real: "A type checker for a decidable type system always terminates with accept or reject, but a theorem prover for full first-order logic only semi-decides validity: it confirms theorems yet may run forever on a non-theorem, the textbook recognizable-not-decidable behavior."
  },
  "3::Recognizer vs decider": {
    why: "A decider is the formal model of a trustworthy algorithm — it always terminates with a definite answer — whereas a recognizer only promises to halt when the answer is \"yes.\" Knowing which one you have determines whether you can rely on the result or must impose external safeguards.",
    real: "A garbage collector that always completes a sweep behaves like a decider, but a SAT-based equivalence checker that may time out on hard instances behaves like a recognizer; engineers wrap the latter in timeouts because it carries no halting guarantee on \"no\" answers."
  },
  "3::TM formal definition": {
    why: "The 7-tuple is the formal stand-in for the intuitive idea of an algorithm; once computation is pinned to this one definition, every later notion — decidability, reductions, complexity classes — can be stated and proved precisely rather than hand-waved. It is the minimal hardware on which all of computability is built.",
    real: "CPU instruction-set architectures (x86, ARM) are real-world descendants of this idea: a finite control unit, a transition rule per instruction, and an unbounded addressable memory standing in for the tape — and indeed a TM is the model used to argue about what those CPUs fundamentally can and cannot compute."
  },
  "3::TM variants": {
    why: "The fact that multitape, nondeterministic, and two-stack variants all recognize exactly the same languages establishes that computability is robust — tweaking the hardware does not change what is solvable, only how fast. This stability is the empirical backbone of the Church–Turing thesis, while the speed differences are what keep \\(\\mathrm{P}\\) vs \\(\\mathrm{NP}\\) interesting.",
    real: "High-level languages and bytecode VMs (the JVM, WebAssembly) are all Turing-equivalent, so any program in one can be expressed in another; what differs is performance, which is exactly why we still pick C over Python for a hot loop even though both compute the same functions."
  },
  "3::Tape & input alphabets": {
    why: "Keeping the input alphabet \\(\\Sigma\\) strictly inside the tape alphabet \\(\\Gamma\\) — with a blank symbol no input can contain — gives the machine scratch symbols and a way to detect where its input ends. The unbounded resource is the tape, not the alphabet, which stays finite.",
    real: "Parsers and serializers reserve special sentinel symbols outside the user's data alphabet — a NUL terminator ending a C string, or an EOF marker — playing exactly the role of the blank: a delimiter the payload is guaranteed never to contain."
  },
  "3::The blank symbol": {
    why: "The blank \\(\\sqcup\\) is the symbol that marks \"unwritten tape,\" and excluding it from \\(\\Sigma\\) is what lets the machine find the right boundary of its input — the first blank. Without a symbol that no input can contain, a machine could not distinguish data from empty memory.",
    real: "Memory allocators and string libraries rely on the same trick: a freshly mapped page reads as zeros, and the NUL byte \\(0\\) terminates a C string, so code can detect where meaningful data stops — and bugs that overwrite that terminator (buffer overruns) are a classic source of security holes."
  },
  "3::The head": {
    why: "Restricting the machine to read and write only at a single moving head — one cell at a time — is what forces computation to be local and sequential, so every step is a small, well-defined action rather than a global rewrite. Random access is a convenience layered on top, not a change in computational power.",
    real: "A tape drive or a disk read/write arm physically embodies the single-head model: data must be reached by moving to its position, and this locality is why sequential access is fast while random seeks are slow on spinning media."
  },
  "3::The tape": {
    why: "The unbounded tape is the formal source of unlimited memory: it is what lets a Turing machine surpass finite automata, which can only remember a bounded amount. Real computers have finite memory, so they are technically closer to large finite automata — the tape is the idealization that captures \"enough memory\" without an arbitrary cap.",
    real: "Virtual memory gives every process the illusion of a vast, near-unbounded address space backed by paging to disk, mirroring the TM tape — and a program that genuinely needs unbounded memory eventually thrashes or triggers an out-of-memory kill, the practical limit the idealized tape abstracts away."
  },
  "3::Transition function": {
    why: "The transition function \\(\\delta\\) packs an entire computation into a finite lookup table: state plus scanned symbol determines the next state, the symbol written, and the head move. That a finite rule set drives unbounded computation is the essence of a program — finite code, unbounded behavior.",
    real: "A CPU's microcode and a lexer's state-transition table are concrete \\(\\delta\\) functions: a finite table maps (current state, current input) to (next state, action), which is how a finite chip processes inputs of any length."
  },
  "3::Transition rules": {
    why: "Each transition rule does three things at once — change state, overwrite the current cell, move the head — and the determinism (exactly one rule per state/symbol pair) is what makes the machine's behavior fully predictable from its input. Predictable, finite rules are what make a computation reproducible.",
    real: "Network-protocol state machines (TCP's connection states, the TLS handshake) are specified as exactly this kind of rule table: in a given state, receiving a given message triggers a single defined response and state change, so any two correct implementations interoperate."
  },
  "3::Turing machines": {
    why: "The Turing machine is the accepted definition of what it means to compute, so its limits are the limits of all software: anything no TM can do, no real program can do either. Everything in computability and complexity theory is ultimately a statement about this one model.",
    real: "Static analyzers, optimizers, and verification tools are all bounded by TM limits, which is why a compiler cannot perfectly detect all dead code or prove all programs free of infinite loops — these reduce to undecidable questions about Turing machines, forcing such tools to be conservative."
  },
  "3::What is a Turing machine": {
    why: "A Turing machine is the simplest device that captures everything mechanically computable — a finite controller scanning an unbounded tape — and its importance is not that it is realistic but that nothing more powerful has ever been found among effective procedures. Its simplicity is exactly what makes impossibility proofs about it convincing.",
    real: "The model directly inspired the stored-program computer: John von Neumann's architecture, where instructions and data share one memory, is the engineering realization of Turing's insight that a single machine can read another machine's description and run it."
  }
});
