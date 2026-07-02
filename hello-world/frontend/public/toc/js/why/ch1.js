/* Chapter 1 — Regular Languages (Sipser 1.1–1.4): topic-level "why this matters"
   + a concrete real-world example. Keyed "1::<topic>" to match js/questions/ch1.js. */
TOC.addWhy({
  "1::Finite automata": {
    why: "Finite automata are the simplest realistic model of computation — a machine with a fixed, finite amount of memory — and pinning down exactly what such a machine can and cannot do is the first concrete answer to \"what is computable?\" Their limits (no unbounded counting) are as instructive as their powers, because they reveal what extra resources harder problems truly require.",
    real: "Finite automata run inside vending machines, elevators, and traffic-light controllers, and they power the lexical analyzers in every compiler that chop source code into tokens."
  },
  "1::DFA": {
    why: "A DFA gives the cleanest possible notion of computation: read the input once, left to right, with no backtracking and no choices, in time exactly proportional to the input length. That guaranteed single-pass, constant-memory behavior is why DFAs are the gold standard for fast, predictable string recognition.",
    real: "Network intrusion-detection systems and protocol parsers compile signatures into DFAs so they can scan a high-speed packet stream in one linear pass without ever pausing to reconsider."
  },
  "1::DFA definition": {
    why: "The 5-tuple \\((Q,\\Sigma,\\delta,q_0,F)\\) is the contract that makes a machine a precise mathematical object instead of a hand-wavy diagram, so claims about it can be proved rather than just demonstrated. Getting each component right — especially that \\(\\delta\\) is a TOTAL function — is what guarantees every input has exactly one well-defined run.",
    real: "Hardware description languages like Verilog formalize a controller as a finite state machine with an explicit state set and next-state function, and a synthesis tool turns that 5-tuple-style spec directly into a circuit."
  },
  "1::DFA computation": {
    why: "Defining computation as a sequence of states \\(r_0,\\dots,r_n\\) ending in \\(F\\) makes \"the machine accepts\" a checkable mathematical statement, and it pinpoints that only the FINAL state matters. That precision is what lets us reason about acceptance and prove two machines equivalent.",
    real: "A login or checkout form modeled as a state machine accepts only when the run of events (entered password, clicked submit, payment cleared) lands in a designated final state; passing through an intermediate \"valid\" state mid-flow is not enough to complete."
  },
  "1::Designing DFAs": {
    why: "Designing a DFA forces the key engineering question: what is the MINIMAL finite information I must remember to decide acceptance? Mastering this teaches you to recognize when a fixed amount of memory suffices — and, just as importantly, when a problem secretly needs unbounded memory and no DFA can exist.",
    real: "An input validator for a fixed format — say a credit-card number or a phone number — is exactly this design problem: track just enough about the digits seen so far (running checksum, digit count) to accept or reject in one pass."
  },
  "1::Regular languages": {
    why: "The regular languages are the first and simplest level of the computational hierarchy — exactly the languages a finite-memory machine can recognize — and they draw the first sharp line between \"easy\" and \"out of reach.\" Knowing a language is regular guarantees a linear-time, constant-space recognizer; knowing it is not warns you that you need at least a stack or more.",
    real: "When a language designer decides a token class (identifiers, numbers, keywords) belongs in the lexer rather than the parser, they are deciding it is regular and can be matched by a finite automaton."
  },
  "1::Strings & languages": {
    why: "Casting a decision problem as membership in a language of strings is the move that lets the whole machinery of automata apply to it: \"does this input have property P?\" becomes \"is this string in language \\(L_P\\)?\" The complexity of the problem is then exactly the power of machine needed to recognize \\(L_P\\).",
    real: "A spell-checker treats the dictionary as a (very large but finite) language of strings and asks membership for each word you type; a syntax highlighter classifies each token by which language it belongs to."
  },
  "1::NFA": {
    why: "Nondeterminism lets a machine \"guess\" and have ANY successful guess count, which often yields a far smaller or more natural machine than the deterministic equivalent. It is also the gentle introduction to the existential \"\\(\\exists\\) an accepting path\" idea that later becomes the defining feature of NP.",
    real: "Regular-expression engines build an NFA from a pattern and accept a string if any path through it succeeds — the nondeterministic \"try all matches at once\" view (Thompson's construction) behind tools like grep and lexer generators."
  },
  "1::NFA definition": {
    why: "The NFA 5-tuple differs from the DFA's in one decisive slot — \\(\\delta:Q\\times\\Sigma_\\varepsilon\\to\\mathcal{P}(Q)\\) returns a SET of states and allows \\(\\varepsilon\\)-moves — and that single change is exactly what encodes branching and \"no available move.\" Reading the type of \\(\\delta\\) tells you immediately whether you are looking at a DFA, NFA, or something stronger.",
    real: "When a regex library compiles \\((ab|a)c\\), the \\(\\varepsilon\\)-transitions and multiple out-edges of the resulting NFA are precisely what let it represent the two alternative ways to match before committing."
  },
  "1::NFA computation": {
    why: "An NFA's computation is a TREE of possibilities (or, equivalently, a set of simultaneously live states), and acceptance is existential: one accepting branch suffices. Understanding it as \"track every state you could be in at once\" is the exact intuition that makes the subset construction obvious.",
    real: "A multi-pattern matcher (like the Aho–Corasick automaton used by antivirus and intrusion-detection tools) keeps the whole set of currently-possible matches alive as it scans, accepting as soon as any one of them completes."
  },
  "1::NFA examples": {
    why: "Worked NFAs show that nondeterminism buys dramatic SUCCINCTNESS without buying any new languages — \"a \\(1\\) in the \\(k\\)-th position from the end\" needs only \\(k{+}1\\) NFA states but \\(2^k\\) DFA states. This size gap is the practical reason to design with NFAs and convert only when determinism is required.",
    real: "Regex tooling lets you write a compact pattern that compiles to a small NFA; the engine then either simulates that NFA directly or expands it to a larger DFA when it needs guaranteed linear-time matching."
  },
  "1::NFA vs DFA power": {
    why: "NFAs and DFAs recognize exactly the same class — the regular languages — so for finite automata nondeterminism adds CONVENIENCE and succinctness but never power. This clean \"equal power\" result is the sharp contrast that makes the still-open P vs NP question (where nondeterminism may genuinely add power) so striking.",
    real: "Regular-expression engines exploit this equivalence directly: they can run the small NFA from your pattern or, for worst-case-linear performance, convert it to an equivalent DFA, confident that both accept the very same strings."
  },
  "1::Subset construction": {
    why: "The subset construction is a concrete simulation that proves NFA = DFA: let a DFA state be the SET of NFA states currently reachable, and existential \"some branch accepts\" becomes an ordinary deterministic run. It is the template for \"track all possibilities at once,\" and its \\(2^{|Q|}\\) blow-up shows determinism can cost exponential space.",
    real: "Lexer generators such as lex/flex apply exactly this NFA-to-DFA conversion (plus minimization) to turn your token regexes into the fast deterministic state table that scans source code."
  },
  "1::Regular operations": {
    why: "Union, concatenation, and star are the three operations from which every regular expression — and thus every regular language — is built, so understanding them is understanding the whole class generatively rather than just machine-by-machine. Note that star always includes \\(\\varepsilon\\), the zero-piece case, a detail that drives many edge cases.",
    real: "Regular-expression syntax exposes these operations one-to-one: \\(\\texttt{|}\\) is union, juxtaposition is concatenation, and \\(\\texttt{*}\\) is star — so \\(\\texttt{(ab)*}\\) is exactly \\((A\\circ B)^*\\)."
  },
  "1::Closure properties": {
    why: "Closure theorems let you build complex regular languages from simple ones and, crucially, prove NONREGULARITY indirectly: if \\(A\\cap R\\) is known nonregular for some regular \\(R\\), then \\(A\\) cannot be regular. They turn each construction (the product machine for intersection, swapping accept states for complement) into a reusable proof tool.",
    real: "A query optimizer combining pattern filters relies on the same algebra — intersecting two regular constraints yields another regular constraint via the product construction, so the combined filter is still recognizable by a single finite automaton."
  },
  "1::Regular expressions": {
    why: "Regular expressions are a textual, generative description of exactly the regular languages, equivalent in power to finite automata but far more compact to write and read. The precedence rules and the gap between \\(\\varepsilon\\) (one string) and \\(\\emptyset\\) (no strings) are exactly the subtleties that make them precise enough to compile into a machine.",
    real: "Regexes are everywhere in software: validating and parsing input, find-and-replace in editors, log scanning, and the token rules of compilers — all of them describe a regular language that a tool turns into an automaton."
  },
  "1::RE/FA equivalence": {
    why: "Kleene's theorem says a language is regular iff some regular expression describes it, so machines and expressions are interchangeable and either one is a proof of regularity. This two-way bridge is what lets tools accept a human-friendly regex and internally run a machine, and lets analyses convert a machine back to a readable pattern.",
    real: "Every regex engine implements the RE\\(\\to\\)NFA direction (Thompson's construction) to execute your pattern, while state-machine-to-regex conversion is used to summarize the language a finite-state controller or protocol accepts."
  },
  "1::GNFA": {
    why: "A generalized NFA labels its arrows with whole regular expressions, and the \"rip out a state\" procedure on it is the concrete algorithm that converts any finite automaton into an equivalent regular expression. It shows the FA\\(\\to\\)RE direction of Kleene's theorem is not just true but mechanical.",
    real: "The same state-elimination idea is used to derive a closed-form description of a finite-state protocol or controller — collapsing its states one by one yields a single regular expression summarizing every accepted sequence of events."
  },
  "1::Pumping lemma": {
    why: "The pumping lemma packages the pigeonhole fact that a long enough run must repeat a state, giving the standard tool to PROVE a language nonregular — i.e., to prove no finite-memory machine can recognize it. It is strictly one-directional: it can refute regularity but, since some nonregular languages also pump, can never confirm it.",
    real: "It explains a real limitation programmers hit: a pure regular expression cannot match balanced, arbitrarily nested brackets or HTML tags (\\(\\{0^n1^n\\}\\) in disguise), which is exactly why parsing such structure needs a stack-based parser rather than a regex."
  },
  "1::Regular vs nonregular": {
    why: "The regular/nonregular line is the first impossibility boundary in the course: languages that need an UNBOUNDED count or comparison fall outside what finite memory can do. Learning to spot which side a language is on — and to back intuition with a pumping or closure proof — is the core skill, since surface appearance is often misleading.",
    real: "This boundary is why language tools split work into a regular lexer (for tokens) and a non-regular parser (for nested structure): matching balanced parentheses or \\(\\texttt{begin}\\dots\\texttt{end}\\) nesting is provably beyond any regular expression."
  }
});
