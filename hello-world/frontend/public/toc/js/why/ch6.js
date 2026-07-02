/* Chapter 6 — Advanced topics: topic-level "why this matters" + real-world ties.
   Keyed "6::<topic>" to match question topics (see js/why/_registry.js). */
TOC.addWhy({
  "6::Recursion theorem": {
    why: "The recursion theorem proves that a program can *legitimately obtain and use its own description* — self-reference is not a paradox but a guaranteed feature of any reasonable model of computation. It frees you to write 'let \\(B\\) be a machine that gets its own code' as a routine step in a proof.",
    real: "It is the rigorous foundation for quines (programs that print their own source) and the reason a piece of software can reason about or modify itself — the formal license behind self-replicating code."
  },
  "6::Recursion theorem applications": {
    why: "With self-reference in hand, classic results fall out cleanly: \\(A_{TM}\\)'s undecidability gets a diagonalization-free proof, the fixed-point theorem appears, and \\(MIN_{TM}\\) (the set of minimal-size machines) is shown non-recognizable. The theorem turns several hard arguments into short, uniform ones.",
    real: "Its most vivid application is the computer virus: a program that uses its own code to write a copy of itself into other files is exactly a recursion-theorem construction, which is why self-replication via \\(fork()\\)-and-copy is provably realizable rather than science fiction."
  },
  "6::Self-reference": {
    why: "Self-reference — a machine acting on its own description — is shown to be a sound, constructible operation, dissolving the apparent circularity in statements like 'this program refers to itself'. It is the engine that powers the recursion theorem and the diagonal-flavored impossibility proofs without any sleight of hand.",
    real: "Reflection in real languages embodies it: Java's reflection API, Python's introspection, and quines all let code inspect or reproduce itself, and the same mechanism underlies self-replicating malware and self-hosting compilers."
  },
  "6::Turing reducibility": {
    why: "Turing reducibility \\(A\\le_T B\\) lets a decider for \\(A\\) call an *oracle* for \\(B\\) freely — as a subroutine, any number of times, in either polarity — making it more general than mapping reducibility (which cannot, e.g., complement). It is the right notion when you want to say 'solvable *given* a solver for \\(B\\)', and it cleanly captures that \\(A\\) and \\(\\overline{A}\\) are equally hard.",
    real: "This is exactly the 'relative to a library/solver' reasoning engineers use: 'if I had an oracle for SAT, I could solve this' is a Turing reduction, and calling an external solver, model checker, or trusted service as a black-box subroutine is the practical face of the same idea."
  },
  "6::Descriptive complexity": {
    why: "Kolmogorov (descriptive) complexity defines the *information content* of a string as the length of its shortest generating program, formalizing 'random = incompressible'. Crucially \\(K(x)\\) is uncomputable, so there is no algorithm that always finds the truly shortest description of arbitrary data — a hard limit on compression and on detecting structure.",
    real: "It underpins the theory of lossless compression and the minimum-description-length principle in machine learning: tools like gzip approximate the ideal, but the impossibility of computing \\(K\\) is why no compressor can be optimal on every input, and it explains why 'compress this perfectly' has no general solution."
  }
});
