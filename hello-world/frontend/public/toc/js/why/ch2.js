/* Chapter 2 — Context-Free Languages (Sipser 2.1–2.4): topic-level "why this
   matters" + a concrete real-world example. Keyed "2::<topic>" to match the
   topics used by js/questions/ch2.js. */
TOC.addWhy({
  "2::CFG basics": {
    why: "Context-free grammars give a finite set of recursive rules that generate an infinite language, which is the first model powerful enough to describe NESTED, self-similar structure that finite automata cannot. This generative, rule-based view is how we specify the syntax of essentially every programming language.",
    real: "The grammar of a programming language — and the formal grammar of a data format like JSON — is written as a CFG, and that grammar is the specification a parser is built to follow."
  },
  "2::CFG formal definition": {
    why: "The 4-tuple \\((V,\\Sigma,R,S)\\) — variables, terminals, rules, and a start variable — makes \"what strings does this grammar generate\" a precise question with a provable answer. Pinning down that rules rewrite a single variable independent of context (hence \"context-free\") is exactly what separates this class from the more powerful grammars above it.",
    real: "Parser generators like yacc, Bison, and ANTLR take a CFG written in essentially this \\((V,\\Sigma,R,S)\\) form as their input file and mechanically generate the parsing code from it."
  },
  "2::Context-free languages": {
    why: "The context-free languages are the next rung above the regular languages: they add a single stack's worth of memory, which is exactly enough to handle balanced nesting like matched parentheses or \\(\\{0^n1^n\\}\\). Knowing a language is context-free promises an efficient parser; it also marks the ceiling beyond which you need a full Turing machine.",
    real: "The syntax of programming languages lives at this level — nested blocks, parenthesized expressions, and matched braces are context-free — which is why a compiler's parsing phase is built on context-free technology."
  },
  "2::Derivations": {
    why: "A derivation is the step-by-step record of how a grammar rewrites the start variable into a terminal string, and it is the proof that the string is in the language. Standardizing on leftmost (or rightmost) derivations is what lets a parser proceed deterministically and what makes ambiguity a precise, detectable phenomenon.",
    real: "Top-down (LL) parsers construct a leftmost derivation as they read a program, while bottom-up (LR) parsers used by Bison reconstruct a rightmost derivation in reverse — the derivation order is literally the parsing strategy."
  },
  "2::Derivations & parse trees": {
    why: "A parse tree captures a string's grammatical STRUCTURE while abstracting away the incidental order in which rules were applied, so many derivations collapse to one tree. That structure — not the flat string — is what carries meaning, which is why compilers compute on the tree rather than the raw text.",
    real: "A compiler turns source code into an abstract syntax tree (essentially a cleaned-up parse tree); every later stage — type checking, optimization, code generation — walks that tree, since the nesting determines what the program means."
  },
  "2::Parse trees": {
    why: "A parse tree makes the hierarchical, nested meaning of a string explicit: who is an operand of whom, which block contains which statement. Because evaluation follows the tree's shape, the tree is where syntax becomes semantics, and two different trees for one string mean two different meanings.",
    real: "A spreadsheet parses a formula like \\(\\texttt{=A1+A2*A3}\\) into a tree that forces multiplication below addition, so it computes \\(A2{\\cdot}A3\\) first — the tree's shape encodes operator precedence."
  },
  "2::Ambiguity": {
    why: "A grammar is ambiguous when some string has two distinct parse trees, meaning two structural interpretations — and since structure determines meaning, ambiguity is a genuine defect in a language specification. Worse, some context-free languages are INHERENTLY ambiguous, so no rewriting can remove it, which bounds what clean grammars can express.",
    real: "The classic \"dangling else\" (which \\(\\texttt{if}\\) does an \\(\\texttt{else}\\) attach to?) is grammar ambiguity in real languages; designers resolve it with precedence rules or extra grammar constraints so the compiler picks one parse tree."
  },
  "2::Designing CFGs": {
    why: "Designing a CFG is learning to express recursive structure with rules: a variable that appears on both sides of its own production captures \"a thing made of smaller things,\" like \\(S\\to(S)S\\mid\\varepsilon\\) for balanced parentheses. This is the skill of writing a language's syntax specification from scratch.",
    real: "When you author a grammar file for ANTLR or Bison — or define a new data format's syntax — you are doing exactly this: writing recursive productions that generate every legal program or document and nothing else."
  },
  "2::Pushdown automata": {
    why: "A pushdown automaton is a finite automaton plus one stack, and that single unbounded last-in-first-out memory is PRECISELY the extra power needed to recognize context-free languages. The PDA shows concretely why a stack — and not, say, a second counter — is the right resource for matching nested structure.",
    real: "Real parsers and expression evaluators are stack machines: the shift-reduce parsers generated by Bison push and pop grammar symbols on a stack, and evaluating arithmetic or checking balanced brackets uses a stack the same way a PDA does."
  },
  "2::CFG/PDA equivalence": {
    why: "A language is context-free iff some pushdown automaton recognizes it, so the generative view (grammars) and the machine view (stack automata) describe exactly the same class. This bridge is what lets a language be SPECIFIED with a readable grammar yet IMPLEMENTED as an efficient stack-based parser.",
    real: "Parser generators embody this equivalence: you supply a CFG and the tool emits a pushdown (stack) automaton — the generated LL or LR parser — that recognizes precisely the language your grammar describes."
  },
  "2::Chomsky normal form": {
    why: "Chomsky normal form restricts every rule to \\(A\\to BC\\) or \\(A\\to a\\), and any CFG can be converted to it. That uniform shape makes parse trees binary and bounds derivation length, which is exactly what enables general parsing algorithms and the clean proof of the CFL pumping lemma.",
    real: "The CYK parsing algorithm requires its input grammar to be in Chomsky normal form; it then fills a table to decide membership for ANY context-free grammar in \\(O(n^3)\\) time, a guarantee used when a grammar is too tangled for fast LL/LR parsing."
  },
  "2::Closure properties": {
    why: "The context-free languages are closed under union, concatenation, and star but — unlike the regular languages — NOT under intersection or complement, and that asymmetry is itself a deep fact: a single stack cannot, in general, enforce two nested constraints at once. Knowing which operations preserve context-freeness tells you which language-combining tricks keep a problem parseable.",
    real: "Language designers exploit the safe closures by composing sub-grammars (a rule for expressions concatenated with a rule for statements stays context-free), but the failure of intersection closure is exactly why a parser cannot, by grammar alone, also enforce \"every variable is declared\" — that cross-cutting check is pushed to a later semantic phase."
  },
  "2::Pumping lemma (CFL)": {
    why: "The CFL pumping lemma is the standard tool to prove a language is NOT context-free — i.e., that no grammar or single-stack machine can describe it — by exploiting that a long enough parse tree must repeat a variable. It marks the upper edge of context-free power, just as the regular pumping lemma marks the edge below.",
    real: "It explains why one stack is not enough for languages like \\(\\{a^nb^nc^n\\}\\) or \"the same identifier must be declared before use\": enforcing such cross-references is beyond context-free grammars, so compilers handle declaration/use checking in a separate semantic pass, not in the parser."
  },
  "2::Regular vs context-free": {
    why: "Every regular language is context-free but not vice versa, so this comparison locates the exact gain from adding a stack: the ability to count and match nested structure that finite memory alone cannot. Knowing which side a language is on tells you whether a regular expression suffices or whether you truly need a grammar and a parser.",
    real: "This is why real language tools are split in two: a regular lexer tokenizes the flat character stream, then a context-free parser assembles those tokens into the nested tree — matching parentheses defeats the lexer but is routine for the parser."
  },
  "2::Deterministic CFLs": {
    why: "Deterministic context-free languages are those a deterministic pushdown automaton can recognize — a PROPER subclass of the CFLs — and they are exactly the ones admitting fast, unambiguous, single-pass parsing with no backtracking. This subclass is the sweet spot real language designers aim for so their grammars can be parsed in linear time.",
    real: "The LR (and LALR) grammars accepted by Bison/yacc are deterministic context-free: their deterministic shift-reduce parsers run in linear time, which is why production language and compiler front-ends are designed to fit inside this class."
  }
});
