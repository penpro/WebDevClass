/* Stragglers: topic strings used by a few questions (mostly exam buckets and
   the new visual questions) whose exact label doesn't match a ch0-8 entry.
   Keyed by their exact "<chapter>::<topic>" so whyFor() resolves them. */
TOC.addWhy({
  "1::Nondeterminism": {
    why: "Nondeterminism lets a machine 'guess' and explore many computation paths at once, accepting if any path leads to acceptance. It often makes machines far easier to design — and for finite automata it adds no recognizing power (NFAs and DFAs accept the same languages).",
    real: "The idea underlies how a regex with alternation \\((a\\mid b)\\) explores options, and framing a search as 'guess a solution, then verify it' is exactly the verifier view of \\(NP\\)."
  },
  "1::NFA to DFA": {
    why: "Converting an NFA to an equivalent DFA (the subset construction) proves nondeterminism adds no power to finite automata, and it's the bridge from an easy-to-design NFA to a fast deterministic machine you can actually run.",
    real: "Regex libraries like RE2 and lex/flex build an NFA from your pattern, then determinize it into a DFA so matching runs in linear time with no backtracking — avoiding the catastrophic 'ReDoS' blowups of backtracking engines."
  },
  "10::Context-free grammars": {
    why: "A context-free grammar is a finite set of rewrite rules that generates a language with nested structure — the formal model behind how programming-language syntax is specified.",
    real: "Every language's reference manual defines its syntax with a CFG (often written in BNF), and parser generators like Bison and ANTLR turn that grammar directly into the parser inside the compiler."
  },
  "10::Finite-state transducers": {
    why: "A finite-state transducer is a finite automaton that outputs a string as it reads — it doesn't just accept or reject, it transforms, mapping inputs to outputs with only finite memory.",
    real: "Transducers power tokenizers, text normalizers, and the morphological analyzers behind spell-checkers and NLP pipelines — how a fixed-memory device rewrites a stream on the fly."
  },
  "11::Recognizability": {
    why: "Turing-recognizability is the outer edge of what a computer can do at all: a recognizer confirms every member (it halts and accepts) but may run forever on a non-member. It is the weakest useful guarantee — strictly broader than decidability.",
    real: "A theorem prover or exhaustive type checker embodies this — when a proof exists it eventually finds it, but it can loop forever on an unprovable goal, which is exactly why such tools impose time limits."
  },
  "12::Big-O / small-o": {
    why: "Asymptotic notation (\\(O\\), \\(o\\)) measures how an algorithm's cost grows with input size while ignoring constants — the language for comparing algorithms and for defining complexity classes like \\(P\\).",
    real: "It is why engineers say a hash lookup is \\(O(1)\\) while a nested-loop scan is \\(O(n^2)\\): at scale the growth rate, not the constant factor, decides whether a system stays responsive on large inputs."
  }
});
