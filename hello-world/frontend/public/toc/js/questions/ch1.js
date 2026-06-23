/* Chapter 1 — Regular Languages (Sipser 1.1–1.4).
   Finite automata (DFA), nondeterminism (NFA), equivalence of NFAs and DFAs
   (subset construction), the regular operations and closure properties,
   regular expressions, RE <-> FA equivalence (GNFA), and the pumping lemma
   for proving nonregularity. */
TOC.addQuestions([
  // ============================================================
  // ---- DFA: formal definition, computation, design ----
  // ============================================================
  {
    id: "ch1-dfa-5tuple-parts", chapter: 1, topic: "DFA definition", type: "mc",
    prompt: "A deterministic finite automaton is formally a 5-tuple \\((Q,\\Sigma,\\delta,q_0,F)\\). Which list correctly names the five components in order?",
    choices: [
      "states, alphabet, transition function, start state, accept states",
      "alphabet, states, start state, transition function, accept states",
      "states, alphabet, start state, accept states, transition function",
      "states, transition function, alphabet, accept states, start state"
    ],
    answer: 0,
    explanation: "By Definition 1.5, \\(Q\\) is the finite set of states, \\(\\Sigma\\) the alphabet, \\(\\delta\\) the transition function, \\(q_0\\in Q\\) the start state, and \\(F\\subseteq Q\\) the accept states.",
    source: "Sipser Def 1.5"
  },
  {
    id: "ch1-dfa-exactly-one-transition", chapter: 1, topic: "DFA definition", type: "tf",
    prompt: "In a DFA, every state has exactly one outgoing transition for each symbol of the alphabet.",
    answer: true,
    explanation: "Because \\(\\delta:Q\\times\\Sigma\\to Q\\) is a total function, each state has precisely one exiting arrow per alphabet symbol — no missing and no multiple transitions. This is the defining contrast with an NFA.",
    source: "Sipser Def 1.5"
  },
  {
    id: "ch1-dfa-computation-conditions", chapter: 1, topic: "DFA computation", type: "multi",
    prompt: "A DFA \\(M\\) accepts \\(w=w_1w_2\\cdots w_n\\) when a sequence of states \\(r_0,r_1,\\dots,r_n\\) exists satisfying which conditions?",
    choices: [
      "\\(r_0=q_0\\) (start in the start state)",
      "\\(\\delta(r_i,w_{i+1})=r_{i+1}\\) for \\(i=0,\\dots,n-1\\)",
      "\\(r_n\\in F\\) (end in an accept state)",
      "\\(r_i\\in F\\) for every \\(i\\) (pass only through accept states)"
    ],
    answers: [0, 1, 2],
    explanation: "The formal definition of computation requires starting in \\(q_0\\), following \\(\\delta\\) at each step, and ending in \\(F\\). Only the final state must be accepting; intermediate states are unrestricted.",
    source: "Sipser §1.1 (Formal definition of computation)"
  },
  {
    id: "ch1-regular-language-def", chapter: 1, topic: "Regular languages", type: "fib",
    prompt: "A language is called a ____ language if some finite automaton recognizes it.",
    accept: ["regular", "regular language", "a regular language"],
    explanation: "Definition 1.16: a language is regular exactly when some finite automaton recognizes it.",
    source: "Sipser Def 1.16"
  },
  {
    id: "ch1-dfa-empty-string-accept", chapter: 1, topic: "DFA computation", type: "tf",
    prompt: "A finite automaton accepts the empty string \\(\\varepsilon\\) if and only if its start state is an accept state.",
    answer: true,
    explanation: "On input \\(\\varepsilon\\) the machine reads nothing, so it remains in \\(q_0\\); it accepts iff \\(q_0\\in F\\). This is exactly why machine \\(M_3\\) accepts \\(\\varepsilon\\).",
    source: "Sipser Ex 1.9"
  },
  {
    id: "ch1-dfa-design-substring-001", chapter: 1, topic: "Designing DFAs", type: "mc",
    prompt: "Consider designing a DFA over \\(\\{0,1\\}\\) for \\(\\{w\\mid w\\text{ contains }001\\text{ as a substring}\\}\\). Using the \"how much of the pattern have I seen\" idea, how many states are needed?",
    choices: ["\\(4\\)", "\\(2\\)", "\\(3\\)", "\\(5\\)"],
    answer: 0,
    explanation: "Sipser tracks four possibilities: seen none of the pattern, seen \\(0\\), seen \\(00\\), or seen all of \\(001\\). The last is an accept/trap state. That gives four states.",
    source: "Sipser Ex 1.21"
  },

  // ============================================================
  // ---- NFA: nondeterminism, epsilon, formal definition ----
  // ============================================================
  {
    id: "ch1-nfa-vs-dfa-differences", chapter: 1, topic: "NFA definition", type: "multi",
    prompt: "Which features are allowed in an NFA but NOT in a DFA?",
    choices: [
      "A state may have several outgoing arrows for the same symbol",
      "A state may have zero outgoing arrows for some symbol",
      "Transitions may be labeled \\(\\varepsilon\\) (empty string)",
      "There may be more than one accept state"
    ],
    answers: [0, 1, 2],
    explanation: "NFAs relax determinism: a state may have zero, one, or many arrows per symbol, and \\(\\varepsilon\\)-arrows are permitted. Having multiple accept states is allowed in DFAs too, so it is not a distinguishing feature.",
    source: "Sipser §1.2 (Nondeterminism)"
  },
  {
    id: "ch1-nfa-transition-fib", chapter: 1, topic: "NFA definition", type: "fib",
    prompt: "An NFA's transition function has type \\(\\delta:Q\\times\\Sigma_\\varepsilon\\to\\mathcal{P}(Q)\\), where \\(\\mathcal{P}(Q)\\) is the ____ of \\(Q\\) (all subsets of \\(Q\\)).",
    accept: ["power set", "powerset", "power-set"],
    explanation: "An NFA returns a SET of possible next states, so the codomain is the power set \\(\\mathcal{P}(Q)\\). The value \\(\\emptyset\\) means no available transition.",
    source: "Sipser Def 1.37"
  },
  {
    id: "ch1-nfa-acceptance-criterion", chapter: 1, topic: "NFA computation", type: "mc",
    prompt: "An NFA accepts an input string exactly when:",
    choices: [
      "at least one branch of the computation ends in an accept state",
      "every branch of the computation ends in an accept state",
      "the majority of branches end in an accept state",
      "the unique computation ends in an accept state"
    ],
    answer: 0,
    explanation: "Nondeterministic acceptance is existential: the machine accepts if some choice of moves (some branch) leads to an accept state at the end of the input. Requiring all branches to accept defines a different model (the all-NFA of Problem 1.38).",
    source: "Sipser §1.2 (Formal definition of an NFA)"
  },
  {
    id: "ch1-nfa-power-same", chapter: 1, topic: "NFA vs DFA power", type: "tf",
    prompt: "NFAs can recognize some languages that no DFA can recognize.",
    answer: false,
    explanation: "False — a classic misconception. By Theorem 1.39 every NFA has an equivalent DFA, so NFAs and DFAs recognize exactly the same class (the regular languages). Nondeterminism adds convenience, not power, for finite automata.",
    source: "Sipser Thm 1.39"
  },
  {
    id: "ch1-nfa-third-from-end", chapter: 1, topic: "NFA examples", type: "fib",
    prompt: "Let \\(A=\\{w\\in\\{0,1\\}^*\\mid w\\text{ has a }1\\text{ in the third position from the end}\\}\\). A 4-state NFA recognizes \\(A\\), but the smallest DFA for \\(A\\) has how many states? (give the number)",
    accept: ["8", "eight", "2^3"],
    explanation: "The NFA \\(N_2\\) uses \\(4\\) states by \"guessing\" the position, but the smallest DFA must remember the last three symbols, requiring \\(2^3=8\\) states.",
    source: "Sipser Ex 1.30"
  },

  // ============================================================
  // ---- Equivalence of NFA/DFA: subset construction ----
  // ============================================================
  {
    id: "ch1-subset-construction-states", chapter: 1, topic: "Subset construction", type: "mc",
    prompt: "In converting an NFA with \\(k\\) states to a DFA by the subset construction, the DFA's state set is taken to be:",
    choices: [
      "\\(\\mathcal{P}(Q)\\), the set of all subsets of the NFA's states",
      "the same set \\(Q\\) of states",
      "the set \\(Q\\times Q\\) of pairs of states",
      "a set with exactly \\(2k\\) states"
    ],
    answer: 0,
    explanation: "Each DFA state records the set of NFA states currently reachable, so the DFA states are the subsets of \\(Q\\): there are \\(2^k\\) of them.",
    source: "Sipser Thm 1.39"
  },
  {
    id: "ch1-subset-2k-states", chapter: 1, topic: "Subset construction", type: "tf",
    prompt: "There exist languages for which converting a \\(k\\)-state NFA to a DFA requires \\(2^k\\) states; this exponential blow-up cannot always be avoided.",
    answer: true,
    explanation: "The subset construction produces up to \\(2^k\\) states, and for some languages (e.g. a \\(1\\) in the \\(k\\)-th position from the end) every DFA genuinely needs \\(2^k\\) states. So the worst case is unavoidable.",
    source: "Sipser Thm 1.39, Problem 1.61"
  },
  {
    id: "ch1-subset-order", chapter: 1, topic: "Subset construction", type: "order",
    prompt: "Order the steps for converting an NFA \\(N\\) (possibly with \\(\\varepsilon\\)-arrows) into an equivalent DFA \\(M\\) by the subset construction.",
    items: [
      "Take the DFA states to be \\(\\mathcal{P}(Q)\\), all subsets of \\(N\\)'s states",
      "Set the DFA start state to \\(E(\\{q_0\\})\\), the \\(\\varepsilon\\)-closure of \\(q_0\\)",
      "Define \\(\\delta'(R,a)=\\{q\\mid q\\in E(\\delta(r,a))\\text{ for some }r\\in R\\}\\)",
      "Mark \\(R\\) as accepting iff \\(R\\) contains an accept state of \\(N\\)"
    ],
    explanation: "The construction uses subsets as states, takes the \\(\\varepsilon\\)-closure of the start, follows each symbol then closes under \\(\\varepsilon\\), and accepts any subset meeting \\(N\\)'s accept set.",
    source: "Sipser Thm 1.39"
  },

  // ============================================================
  // ---- Regular operations & closure properties ----
  // ============================================================
  {
    id: "ch1-regops-three", chapter: 1, topic: "Regular operations", type: "mc",
    prompt: "Sipser defines the three regular operations on languages. They are:",
    choices: [
      "union, concatenation, star",
      "union, intersection, complement",
      "concatenation, reverse, star",
      "union, concatenation, intersection"
    ],
    answer: 0,
    explanation: "Definition 1.23 names union \\(A\\cup B\\), concatenation \\(A\\circ B\\), and star \\(A^*\\) as the regular operations. Intersection and complement, though regular languages are closed under them, are not on this list.",
    source: "Sipser Def 1.23"
  },
  {
    id: "ch1-regops-concat-def", chapter: 1, topic: "Regular operations", type: "mc",
    prompt: "The concatenation \\(A\\circ B\\) of two languages is:",
    choices: [
      "\\(\\{xy\\mid x\\in A\\text{ and }y\\in B\\}\\)",
      "\\(\\{x\\mid x\\in A\\text{ or }x\\in B\\}\\)",
      "\\(\\{x\\mid x\\in A\\text{ and }x\\in B\\}\\)",
      "\\(\\{x_1x_2\\cdots x_k\\mid k\\ge 0,\\ x_i\\in A\\}\\)"
    ],
    answer: 0,
    explanation: "Concatenation glues a string of \\(A\\) in front of a string of \\(B\\) in all possible ways. The last choice describes \\(A^*\\), not \\(A\\circ B\\).",
    source: "Sipser Def 1.23"
  },
  {
    id: "ch1-closure-intersection-accept", chapter: 1, topic: "Closure properties", type: "mc",
    prompt: "The product construction runs DFAs \\(M_1,M_2\\) at once on state pairs \\((r_1,r_2)\\in Q_1\\times Q_2\\). Choosing the accept set \\(F=F_1\\times F_2\\) (both components accepting) makes the machine recognize:",
    choices: [
      "the intersection \\(A_1\\cap A_2\\)",
      "the union \\(A_1\\cup A_2\\)",
      "the concatenation \\(A_1\\circ A_2\\)",
      "the complement \\(\\overline{A_1}\\)"
    ],
    answer: 0,
    explanation: "Requiring both \\(M_1\\) and \\(M_2\\) to accept yields the intersection; this is how the same construction proves regular languages are closed under \\(\\cap\\) (Sipser's footnote to Thm 1.25).",
    source: "Sipser Thm 1.25 (footnote)"
  },
  {
    id: "ch1-closure-complement-nfa-swap", chapter: 1, topic: "Closure properties", type: "tf",
    prompt: "Swapping accept and non-accept states of an NFA always produces an NFA for the complement of its language.",
    answer: false,
    explanation: "False. A string can be traced by both an accepting and a non-accepting branch, so after swapping it may still be accepted. The swap works for DFAs, not NFAs (Exercise 1.14b). Regular languages ARE closed under complement, but you argue it via DFAs.",
    source: "Sipser Exercise 1.14"
  },
  {
    id: "ch1-closure-which-multi", chapter: 1, topic: "Closure properties", type: "multi",
    prompt: "Under which of these operations is the class of regular languages closed?",
    choices: [
      "Union",
      "Intersection",
      "Reverse",
      "\"Unpairing\" \\(\\{x\\mid xx\\in A\\}\\) is never regular"
    ],
    answers: [0, 1, 2],
    explanation: "Regular languages are closed under union, intersection, reverse (and complement, concatenation, star). The fourth choice is false — that operation does preserve regularity, so the blanket claim is wrong.",
    source: "Sipser Thm 1.25, 1.45–1.49; Prob 1.31"
  },
  {
    id: "ch1-closure-union-nfa-order", chapter: 1, topic: "Closure properties", type: "order",
    prompt: "Order the steps of the NFA-based proof that regular languages are closed under union (combining NFAs \\(N_1,N_2\\) into \\(N\\)).",
    items: [
      "Start from NFAs \\(N_1\\) and \\(N_2\\) for \\(A_1\\) and \\(A_2\\)",
      "Add a single new start state \\(q_0\\)",
      "Add \\(\\varepsilon\\)-arrows from \\(q_0\\) to the start states of \\(N_1\\) and \\(N_2\\)",
      "Keep all original accept states; \\(N\\) accepts if either \\(N_1\\) or \\(N_2\\) accepts"
    ],
    explanation: "Theorem 1.45's construction nondeterministically guesses which machine to run by branching from a fresh start state via \\(\\varepsilon\\)-arrows.",
    source: "Sipser Thm 1.45"
  },

  // ============================================================
  // ---- Regular expressions ----
  // ============================================================
  {
    id: "ch1-regex-precedence", chapter: 1, topic: "Regular expressions", type: "mc",
    prompt: "In regular expressions, what is the precedence order of the operations (highest first), absent parentheses?",
    choices: [
      "star, then concatenation, then union",
      "union, then concatenation, then star",
      "concatenation, then star, then union",
      "star, then union, then concatenation"
    ],
    answer: 0,
    explanation: "Star binds tightest, then concatenation, then union. So \\(0\\cup 10^*\\) parses as \\(0\\cup(1\\,(0^*))\\), not as \\((0\\cup 1)0^*\\).",
    source: "Sipser §1.3 (Regular expressions)"
  },
  {
    id: "ch1-regex-base-cases", chapter: 1, topic: "Regular expressions", type: "multi",
    prompt: "By the formal (inductive) definition, which of the following are base-case (atomic) regular expressions?",
    choices: [
      "\\(a\\) for some \\(a\\in\\Sigma\\)",
      "\\(\\varepsilon\\)",
      "\\(\\emptyset\\)",
      "\\(\\Sigma^*\\)"
    ],
    answers: [0, 1, 2],
    explanation: "Definition 1.52 lists the atomic regular expressions as \\(a\\) (a single alphabet symbol), \\(\\varepsilon\\), and \\(\\emptyset\\). Larger expressions are built using \\(\\cup\\), \\(\\circ\\), and \\(*\\); \\(\\Sigma^*\\) is a compound expression, not a base case.",
    source: "Sipser Def 1.52"
  },
  {
    id: "ch1-regex-eps-vs-emptyset", chapter: 1, topic: "Regular expressions", type: "mc",
    prompt: "What is the difference between the regular expressions \\(\\varepsilon\\) and \\(\\emptyset\\)?",
    choices: [
      "\\(\\varepsilon\\) describes \\(\\{\\varepsilon\\}\\) (one string); \\(\\emptyset\\) describes the empty language (no strings)",
      "They describe the same language",
      "\\(\\varepsilon\\) describes the empty language; \\(\\emptyset\\) describes \\(\\{\\varepsilon\\}\\)",
      "\\(\\varepsilon\\) is not a valid regular expression"
    ],
    answer: 0,
    explanation: "\\(L(\\varepsilon)=\\{\\varepsilon\\}\\) contains a single (empty) string, whereas \\(L(\\emptyset)=\\emptyset\\) contains no strings at all. Confusing them is a common error.",
    source: "Sipser Def 1.52"
  },
  {
    id: "ch1-regex-identity-union-empty", chapter: 1, topic: "Regular expressions", type: "mc",
    prompt: "Which identity holds for every regular expression \\(R\\)?",
    choices: [
      "\\(R\\cup\\emptyset=R\\)",
      "\\(R\\cup\\varepsilon=R\\)",
      "\\(R\\circ\\emptyset=R\\)",
      "\\(R\\circ\\varepsilon=\\emptyset\\)"
    ],
    answer: 0,
    explanation: "Adding the empty language changes nothing: \\(R\\cup\\emptyset=R\\). In contrast \\(R\\cup\\varepsilon\\) may add \\(\\varepsilon\\), and \\(R\\circ\\emptyset=\\emptyset\\) (concatenating with the empty language annihilates).",
    source: "Sipser §1.3 (identities)"
  },
  {
    id: "ch1-regex-emptyset-star", chapter: 1, topic: "Regular expressions", type: "fib",
    prompt: "Simplify: \\(\\emptyset^*\\) equals the language containing only which string? Give the single member (name or symbol).",
    accept: ["epsilon", "varepsilon", "\\varepsilon", "ε", "the empty string", "empty string"],
    explanation: "Star can concatenate zero strings, producing \\(\\varepsilon\\); so \\(\\varepsilon\\in A^*\\) for EVERY language \\(A\\). Since \\(\\emptyset\\) has no strings, \\(\\varepsilon\\) is the only option here, giving \\(\\emptyset^*=\\{\\varepsilon\\}\\).",
    source: "Sipser Ex 1.53(12)"
  },
  {
    id: "ch1-regex-meaning-sigmastar1", chapter: 1, topic: "Regular expressions", type: "mc",
    prompt: "Over \\(\\Sigma=\\{0,1\\}\\), which language does the regular expression \\(0^*10^*\\) describe?",
    choices: [
      "\\(\\{w\\mid w\\text{ contains exactly one }1\\}\\)",
      "\\(\\{w\\mid w\\text{ contains at least one }1\\}\\)",
      "\\(\\{w\\mid w\\text{ ends in }1\\}\\)",
      "\\(\\{w\\mid w\\text{ has an even number of }1\\text{s}\\}\\)"
    ],
    answer: 0,
    explanation: "Any number of \\(0\\)s, a single forced \\(1\\), then any number of \\(0\\)s: exactly one \\(1\\) in total. (At least one \\(1\\) would be \\(\\Sigma^*1\\Sigma^*\\).)",
    source: "Sipser Ex 1.53(1)"
  },

  // ============================================================
  // ---- RE <-> FA equivalence (GNFA) ----
  // ============================================================
  {
    id: "ch1-re-fa-equiv", chapter: 1, topic: "RE/FA equivalence", type: "tf",
    prompt: "A language is regular if and only if some regular expression describes it.",
    answer: true,
    explanation: "Theorem 1.54: regular expressions and finite automata have exactly the same descriptive power. One direction converts RE to NFA (Lemma 1.55); the other converts DFA to RE via GNFAs (Lemma 1.60).",
    source: "Sipser Thm 1.54"
  },
  {
    id: "ch1-gnfa-labels", chapter: 1, topic: "GNFA", type: "mc",
    prompt: "A generalized nondeterministic finite automaton (GNFA) differs from an ordinary NFA in that its transition arrows are labeled with:",
    choices: [
      "arbitrary regular expressions",
      "single alphabet symbols only",
      "subsets of states",
      "context-free grammars"
    ],
    answer: 0,
    explanation: "A GNFA reads whole blocks of input matching a regular expression on an arrow, so its labels are regular expressions rather than just symbols or \\(\\varepsilon\\).",
    source: "Sipser §1.3 (GNFA), Def 1.64"
  },
  {
    id: "ch1-gnfa-rip-label", chapter: 1, topic: "GNFA", type: "mc",
    prompt: "When ripping out state \\(q_{\\mathrm{rip}}\\) during DFA→RE conversion, with \\(R_1=\\delta(q_i,q_{\\mathrm{rip}})\\), \\(R_2=\\delta(q_{\\mathrm{rip}},q_{\\mathrm{rip}})\\), \\(R_3=\\delta(q_{\\mathrm{rip}},q_j)\\), \\(R_4=\\delta(q_i,q_j)\\), the new label on the arrow from \\(q_i\\) to \\(q_j\\) becomes:",
    choices: [
      "\\((R_1)(R_2)^*(R_3)\\cup(R_4)\\)",
      "\\((R_1)(R_2)(R_3)(R_4)\\)",
      "\\((R_1\\cup R_2\\cup R_3\\cup R_4)^*\\)",
      "\\((R_4)(R_3)^*(R_2)\\cup(R_1)\\)"
    ],
    answer: 0,
    explanation: "The new arrow must describe paths from \\(q_i\\) to \\(q_j\\) that either bypass \\(q_{\\mathrm{rip}}\\) (the \\(R_4\\) term) or go through it any number of times: \\((R_1)(R_2)^*(R_3)\\cup(R_4)\\).",
    source: "Sipser §1.3 (CONVERT), Fig 1.63"
  },
  {
    id: "ch1-gnfa-min-states", chapter: 1, topic: "GNFA", type: "fib",
    prompt: "The CONVERT procedure rips out states until the GNFA has exactly how many states, at which point the single remaining arrow's label is the answer? (give the number)",
    accept: ["2", "two"],
    explanation: "A GNFA has a distinct start and accept state, so \\(k\\ge 2\\). The recursion stops at \\(k=2\\), where the lone arrow from start to accept is labeled with the equivalent regular expression.",
    source: "Sipser Lemma 1.60 (CONVERT)"
  },
  {
    id: "ch1-dfa-to-re-order", chapter: 1, topic: "RE/FA equivalence", type: "order",
    prompt: "Order the stages of converting a DFA into an equivalent regular expression.",
    items: [
      "Add a new start state with an \\(\\varepsilon\\)-arrow to the old start state",
      "Add a new single accept state with \\(\\varepsilon\\)-arrows from the old accept states",
      "Repeatedly rip out an internal state, repairing arrow labels with \\((R_1)(R_2)^*(R_3)\\cup(R_4)\\)",
      "When only the start and accept states remain, read off the label as the regular expression"
    ],
    explanation: "First convert the DFA into a special-form GNFA (new start and accept states), then reduce one internal state at a time until two remain and the connecting label is the answer.",
    source: "Sipser Lemma 1.60"
  },

  // ============================================================
  // ---- Pumping lemma ----
  // ============================================================
  {
    id: "ch1-pumping-statement", chapter: 1, topic: "Pumping lemma", type: "mc",
    prompt: "The pumping lemma guarantees a pumping length \\(p\\) such that any \\(s\\in A\\) with \\(|s|\\ge p\\) can be written \\(s=xyz\\) satisfying three conditions. Which set of conditions is correct?",
    choices: [
      "\\(xy^iz\\in A\\) for all \\(i\\ge 0\\);  \\(|y|>0\\);  \\(|xy|\\le p\\)",
      "\\(xy^iz\\in A\\) for all \\(i\\ge 1\\);  \\(|y|\\ge 0\\);  \\(|xy|\\ge p\\)",
      "\\(xy^iz\\in A\\) for some \\(i\\ge 0\\);  \\(|y|>0\\);  \\(|yz|\\le p\\)",
      "\\(x^iyz\\in A\\) for all \\(i\\ge 0\\);  \\(|y|>0\\);  \\(|xy|\\le p\\)"
    ],
    answer: 0,
    explanation: "Theorem 1.70: (1) \\(xy^iz\\in A\\) for every \\(i\\ge 0\\) (including \\(i=0\\)), (2) \\(|y|>0\\) so the pumped part is nonempty, and (3) \\(|xy|\\le p\\) so \\(y\\) occurs within the first \\(p\\) symbols.",
    source: "Sipser Thm 1.70"
  },
  {
    id: "ch1-pumping-i-zero-allowed", chapter: 1, topic: "Pumping lemma", type: "tf",
    prompt: "The pumping lemma requires \\(xy^iz\\in A\\) only for \\(i\\ge 1\\); the case \\(i=0\\) need not hold.",
    answer: false,
    explanation: "False. Condition 1 holds for all \\(i\\ge 0\\), including \\(i=0\\) where \\(xy^0z=xz\\). \"Pumping down\" to \\(i=0\\) is exactly the trick used to prove \\(\\{0^i1^j\\mid i>j\\}\\) nonregular.",
    source: "Sipser Thm 1.70, Ex 1.77"
  },
  {
    id: "ch1-pumping-proof-basis", chapter: 1, topic: "Pumping lemma", type: "fib",
    prompt: "The pumping lemma's proof takes \\(p\\) to be the number of states of a DFA for \\(A\\); a string of length \\(\\ge p\\) must repeat a state by the ____ principle. (name it)",
    accept: ["pigeonhole", "the pigeonhole", "pigeon-hole", "pigeon hole"],
    explanation: "A string of length \\(\\ge p\\) visits \\(\\ge p+1\\) states, but the DFA has only \\(p\\) states, so by the pigeonhole principle some state repeats; the loop between repetitions is the pumpable \\(y\\).",
    source: "Sipser Thm 1.70 (proof)"
  },
  {
    id: "ch1-pumping-0n1n-string", chapter: 1, topic: "Pumping lemma", type: "mc",
    prompt: "To prove \\(B=\\{0^n1^n\\mid n\\ge 0\\}\\) nonregular via the pumping lemma, which string \\(s\\) is the standard choice (with pumping length \\(p\\))?",
    choices: [
      "\\(s=0^p1^p\\)",
      "\\(s=(01)^p\\)",
      "\\(s=0^p\\)",
      "\\(s=1^p0^p\\)"
    ],
    answer: 0,
    explanation: "Choosing \\(s=0^p1^p\\) and using \\(|xy|\\le p\\) forces \\(y\\) to be all \\(0\\)s; then \\(xyyz\\) has more \\(0\\)s than \\(1\\)s, leaving \\(B\\). The choice \\((01)^p\\) fails because it can be pumped.",
    source: "Sipser Ex 1.73"
  },
  {
    id: "ch1-pumping-game-quantifiers", chapter: 1, topic: "Pumping lemma", type: "order",
    prompt: "Order the steps of a pumping-lemma proof that a language \\(B\\) is nonregular (the adversary/game structure).",
    items: [
      "Assume \\(B\\) is regular, so the pumping lemma gives a pumping length \\(p\\)",
      "Choose a specific string \\(s\\in B\\) with \\(|s|\\ge p\\) (you pick \\(s\\))",
      "Consider every legal split \\(s=xyz\\) with \\(|y|>0\\) and \\(|xy|\\le p\\) (the adversary picks the split)",
      "Find some \\(i\\) with \\(xy^iz\\notin B\\), contradicting the lemma; conclude \\(B\\) is not regular"
    ],
    explanation: "You control the assumption and the choice of \\(s\\); the adversary controls \\(p\\) and the split. You win by exhibiting an \\(i\\) (often \\(i=0\\) or \\(i=2\\)) that ejects the string from \\(B\\).",
    source: "Sipser §1.4 (using the pumping lemma)"
  },
  {
    id: "ch1-pumping-which-nonregular", chapter: 1, topic: "Pumping lemma", type: "multi",
    prompt: "Which of the following languages are NOT regular (over a suitable alphabet)?",
    choices: [
      "\\(\\{0^n1^n\\mid n\\ge 0\\}\\)",
      "\\(\\{ww\\mid w\\in\\{0,1\\}^*\\}\\)",
      "\\(\\{1^{n^2}\\mid n\\ge 0\\}\\)",
      "\\(\\{w\\in\\{0,1\\}^*\\mid w\\text{ has at least one }1\\}\\)"
    ],
    answers: [0, 1, 2],
    explanation: "The first three require unbounded counting or non-periodic structure and are proved nonregular by the pumping lemma (Ex 1.73, 1.75, 1.76). \"At least one \\(1\\)\" is regular (e.g. \\(\\Sigma^*1\\Sigma^*\\)).",
    source: "Sipser Ex 1.73, 1.75, 1.76"
  },
  {
    id: "ch1-pumping-ww-string", chapter: 1, topic: "Pumping lemma", type: "mc",
    prompt: "For \\(F=\\{ww\\mid w\\in\\{0,1\\}^*\\}\\), which string best exhibits the \"essence\" of nonregularity and works with the pumping lemma?",
    choices: [
      "\\(s=0^p10^p1\\)",
      "\\(s=0^p0^p\\)",
      "\\(s=(01)^p\\)",
      "\\(s=1^p\\)"
    ],
    answer: 0,
    explanation: "With \\(s=0^p10^p1\\), condition \\(|xy|\\le p\\) forces \\(y\\) into the first block of \\(0\\)s, so \\(xyyz\\notin F\\). The string \\(0^p0^p=0^{2p}\\) fails because it can be pumped while staying in \\(F\\).",
    source: "Sipser Ex 1.75"
  },
  {
    id: "ch1-pumping-down-igtj", chapter: 1, topic: "Pumping lemma", type: "mc",
    prompt: "To show \\(E=\\{0^i1^j\\mid i>j\\}\\) is nonregular, Sipser uses \\(s=0^{p+1}1^p\\) and then:",
    choices: [
      "pumps down to \\(i=0\\): \\(xz\\) has too few \\(0\\)s, so \\(xz\\notin E\\)",
      "pumps up to \\(i=2\\): \\(xyyz\\) has too many \\(1\\)s",
      "uses \\(i=2\\) to create unequal symbols out of order",
      "concludes immediately since \\(s\\notin E\\)"
    ],
    answer: 0,
    explanation: "Since \\(y\\) is all \\(0\\)s, pumping UP keeps the string in \\(E\\) (more \\(0\\)s is fine). Pumping DOWN to \\(xy^0z=xz\\) removes \\(0\\)s, so the \\(0\\)s no longer exceed the \\(1\\)s and \\(xz\\notin E\\) — the needed contradiction.",
    source: "Sipser Ex 1.77"
  },
  {
    id: "ch1-pumping-condition3-purpose", chapter: 1, topic: "Pumping lemma", type: "tf",
    prompt: "Condition 3, \\(|xy|\\le p\\), is sometimes essential: for \\(C=\\{w\\mid w\\text{ has equal numbers of }0\\text{s and }1\\text{s}\\}\\) with \\(s=0^p1^p\\), it forces \\(y\\) to lie within the \\(0\\)s.",
    answer: true,
    explanation: "Without condition 3 you could take \\(y=0^p1^p\\) and pump while staying in \\(C\\). Condition 3 confines \\(xy\\) to the first \\(p\\) symbols (all \\(0\\)s), so \\(y\\) is all \\(0\\)s and \\(xyyz\\notin C\\).",
    source: "Sipser Ex 1.74"
  },
  {
    id: "ch1-pumping-cannot-prove-regular", chapter: 1, topic: "Pumping lemma", type: "tf",
    prompt: "If every long string of a language can be pumped, the pumping lemma proves the language is regular.",
    answer: false,
    explanation: "False. The pumping lemma is a one-way (necessary) condition: regular languages satisfy it, but some nonregular languages do too (Problem 1.54). It can prove nonregularity, never regularity.",
    source: "Sipser Thm 1.70, Problem 1.54"
  },

  // ============================================================
  // ---- Regular vs nonregular; finite languages ----
  // ============================================================
  {
    id: "ch1-finite-languages-regular", chapter: 1, topic: "Regular vs nonregular", type: "tf",
    prompt: "Every finite language is regular.",
    answer: true,
    explanation: "A finite language is the union of finitely many single-string languages, each described by a regular expression (just spell the string out); a finite union of regular languages is regular.",
    source: "Sipser §1.3 (regular expressions)"
  },
  {
    id: "ch1-equal-01-nonregular", chapter: 1, topic: "Regular vs nonregular", type: "tf",
    prompt: "The language \\(C=\\{w\\mid w\\text{ has an equal number of }0\\text{s and }1\\text{s}\\}\\) is regular.",
    answer: false,
    explanation: "False — \\(C\\) is nonregular (Ex 1.74). A finite automaton cannot track an unbounded difference. Beware: the similar-looking \\(D=\\{w\\mid \\#01=\\#10\\}\\) IS regular, so intuition must be backed by proof.",
    source: "Sipser Ex 1.74"
  },
  {
    id: "ch1-regular-closed-not-help-prove-regular", chapter: 1, topic: "Regular vs nonregular", type: "mc",
    prompt: "Sipser gives an alternative proof that \\(C=\\{w\\mid \\#0=\\#1\\}\\) is nonregular WITHOUT pumping \\(C\\) directly. What is the key idea?",
    choices: [
      "\\(C\\cap 0^*1^*=\\{0^n1^n\\mid n\\ge 0\\}\\), which is known nonregular; closure under \\(\\cap\\) then forces \\(C\\) nonregular",
      "\\(C\\) is finite, hence the pumping lemma applies vacuously",
      "\\(C\\) equals \\(\\Sigma^*\\), which is nonregular",
      "\\(C\\) is the complement of a regular language, hence nonregular"
    ],
    answer: 0,
    explanation: "If \\(C\\) were regular, then \\(C\\cap 0^*1^*\\) would be regular (intersection with the regular set \\(0^*1^*\\)). But that intersection is \\(\\{0^n1^n\\}\\), known nonregular — contradiction.",
    source: "Sipser Ex 1.74 (alternative proof)"
  },

  // ============================================================
  // ====  Formal definitions (DFA / NFA / regular expr.)  ======
  // ============================================================
  {
    id: "ch1-def-dfa-tuple", chapter: 1, topic: "DFA", type: "mc",
    prompt: "A deterministic finite automaton is a 5-tuple \\((Q,\\Sigma,\\delta,q_0,F)\\). What are the five components, in order?",
    choices: [
      "States, alphabet, transition function, start state, set of accept states",
      "States, stack alphabet, transition function, start state, accept states",
      "States, alphabet, start state, transition function, reject states",
      "States, tape alphabet, transition function, start state, final states"
    ],
    answer: 0,
    explanation: "\\(Q\\) is the finite set of states, \\(\\Sigma\\) the input alphabet, \\(\\delta\\) the transition function, \\(q_0\\in Q\\) the start state, and \\(F\\subseteq Q\\) the set of accept (final) states. A DFA has no stack or tape.",
    source: "Sipser Def 1.5"
  },
  {
    id: "ch1-def-dfa-delta", chapter: 1, topic: "DFA", type: "mc",
    prompt: "What is the form (signature) of a DFA's transition function \\(\\delta\\)?",
    choices: [
      "\\(\\delta:Q\\times\\Sigma\\to Q\\)",
      "\\(\\delta:Q\\times\\Sigma\\to\\mathcal{P}(Q)\\)",
      "\\(\\delta:Q\\times\\Sigma_\\varepsilon\\to\\mathcal{P}(Q)\\)",
      "\\(\\delta:Q\\times\\Gamma\\to Q\\times\\{L,R\\}\\)"
    ],
    answer: 0,
    explanation: "For each (state, input symbol) pair a DFA gives exactly one next state, so \\(\\delta:Q\\times\\Sigma\\to Q\\). The powerset and \\(\\Sigma_\\varepsilon\\) forms are for NFAs; the tape form is for Turing machines.",
    source: "Sipser Def 1.5"
  },
  {
    id: "ch1-def-dfa-total-tf", chapter: 1, topic: "DFA", type: "tf",
    prompt: "In a DFA, every state has exactly one outgoing transition for each symbol of the alphabet \\(\\Sigma\\).",
    answer: true,
    explanation: "Determinism + totality: \\(\\delta\\) is a (total) function on \\(Q\\times\\Sigma\\), so for every state and every symbol there is exactly one defined next state — no choices, no missing edges, and no \\(\\varepsilon\\)-moves.",
    source: "Sipser Def 1.5"
  },
  {
    id: "ch1-def-dfa-accept", chapter: 1, topic: "DFA", type: "mc",
    prompt: "A DFA \\(M\\) **accepts** a string \\(w=w_1w_2\\cdots w_n\\) when:",
    choices: [
      "Starting at \\(q_0\\) and following \\(\\delta\\) on each symbol, the final state reached is in \\(F\\)",
      "It passes through some accept state at any point during the run",
      "It never enters a reject state",
      "The string \\(w\\) is in \\(\\Sigma^*\\)"
    ],
    answer: 0,
    explanation: "Acceptance is about the state at the END of the input: there is a sequence \\(r_0,\\dots,r_n\\) with \\(r_0=q_0\\), \\(r_{i+1}=\\delta(r_i,w_{i+1})\\), and \\(r_n\\in F\\). Merely visiting an accept state midway does not count.",
    source: "Sipser Def 1.5 (computation)"
  },
  {
    id: "ch1-def-nfa-delta", chapter: 1, topic: "NFA", type: "mc",
    prompt: "What is the form of a nondeterministic finite automaton's transition function \\(\\delta\\)?",
    choices: [
      "\\(\\delta:Q\\times\\Sigma_\\varepsilon\\to\\mathcal{P}(Q)\\)",
      "\\(\\delta:Q\\times\\Sigma\\to Q\\)",
      "\\(\\delta:Q\\times\\Sigma\\to Q\\times\\{L,R\\}\\)",
      "\\(\\delta:\\mathcal{P}(Q)\\times\\Sigma\\to Q\\)"
    ],
    answer: 0,
    explanation: "An NFA maps a (state, symbol-or-\\(\\varepsilon\\)) pair to a SET of possible next states: \\(\\delta:Q\\times\\Sigma_\\varepsilon\\to\\mathcal{P}(Q)\\). The powerset codomain captures \"zero, one, or many\" choices, and \\(\\Sigma_\\varepsilon\\) allows \\(\\varepsilon\\)-moves.",
    source: "Sipser Def 1.37"
  },
  {
    id: "ch1-def-sigma-eps-fib", chapter: 1, topic: "NFA", type: "mc",
    prompt: "In an NFA's definition, \\(\\Sigma_\\varepsilon\\) is shorthand for which set?",
    choices: [
      "\\(\\Sigma\\cup\\{\\varepsilon\\}\\)",
      "\\(\\Sigma\\cap\\{\\varepsilon\\}\\)",
      "\\(\\Sigma\\times\\{\\varepsilon\\}\\)",
      "\\(\\Sigma\\setminus\\{\\varepsilon\\}\\)"
    ],
    answer: 0,
    explanation: "\\(\\Sigma_\\varepsilon=\\Sigma\\cup\\{\\varepsilon\\}\\): the input alphabet together with the empty string, so the transition function can also act on \\(\\varepsilon\\) (spontaneous moves).",
    source: "Sipser Def 1.37"
  },
  {
    id: "ch1-def-nfa-branches-tf", chapter: 1, topic: "NFA", type: "tf",
    prompt: "In an NFA, a single state may have zero, one, or several transitions on the same input symbol, and may also have \\(\\varepsilon\\)-transitions.",
    answer: true,
    explanation: "That flexibility is exactly nondeterminism: \\(\\delta\\) returns a set (possibly empty, a singleton, or larger), and \\(\\varepsilon\\)-moves let the machine change state without consuming input.",
    source: "Sipser Def 1.37"
  },
  {
    id: "ch1-def-nfa-accept", chapter: 1, topic: "NFA", type: "mc",
    prompt: "An NFA **accepts** \\(w\\) when:",
    choices: [
      "At least one of its computation branches ends in an accept state",
      "All of its computation branches end in accept states",
      "It has no \\(\\varepsilon\\)-transitions on \\(w\\)",
      "Every prefix of \\(w\\) leads to an accept state"
    ],
    answer: 0,
    explanation: "Nondeterministic acceptance is existential: \\(w\\) is accepted if SOME choice of branches leads to an accept state. The string is rejected only if every branch fails.",
    source: "Sipser Def 1.37 (computation)"
  },
  {
    id: "ch1-def-dfa-is-nfa-tf", chapter: 1, topic: "NFA", type: "tf",
    prompt: "Every DFA can be regarded as an NFA (one that happens to be deterministic).",
    answer: true,
    explanation: "A DFA meets the NFA definition: each \\(\\delta(q,a)\\) is just a singleton set and there are no \\(\\varepsilon\\)-moves. This is the easy direction of DFA/NFA equivalence; the hard direction is the subset construction.",
    source: "Sipser §1.2"
  },
  {
    id: "ch1-def-regular-fib", chapter: 1, topic: "Regular vs nonregular", type: "fib",
    prompt: "A language is called **regular** exactly when some ____ recognizes it (what kind of machine?).",
    accept: ["finite automaton", "finite automata", "dfa", "nfa", "finite state machine", "finite-state automaton", "finite state automaton"],
    explanation: "Definition: a language is regular iff a finite automaton recognizes it. By NFA/DFA equivalence it does not matter whether you say DFA or NFA, and by Kleene's theorem it is the same as being describable by a regular expression.",
    source: "Sipser Def 1.16"
  },
  {
    id: "ch1-def-regex-atoms-multi", chapter: 1, topic: "Regular expressions", type: "multi",
    prompt: "In Sipser's inductive definition of a regular expression over \\(\\Sigma\\), which are the **base (atomic) cases**?",
    choices: [
      "a single symbol \\(a\\in\\Sigma\\)",
      "\\(\\varepsilon\\) (the empty string)",
      "\\(\\emptyset\\) (the empty language)",
      "\\(\\Sigma^*\\)",
      "any DFA"
    ],
    answers: [0, 1, 2],
    explanation: "The atomic regular expressions are \\(a\\) (for \\(a\\in\\Sigma\\)), \\(\\varepsilon\\), and \\(\\emptyset\\). Larger expressions are built from these by union, concatenation, and star.",
    source: "Sipser Def 1.52"
  },
  {
    id: "ch1-def-regex-ops-multi", chapter: 1, topic: "Regular expressions", type: "multi",
    prompt: "Which operations are part of the formal definition of regular expressions (used to combine smaller expressions)?",
    choices: [
      "union \\(R_1\\cup R_2\\)",
      "concatenation \\(R_1\\circ R_2\\)",
      "star \\(R_1^{*}\\)",
      "intersection \\(R_1\\cap R_2\\)",
      "complement \\(\\overline{R_1}\\)"
    ],
    answers: [0, 1, 2],
    explanation: "Regular expressions are built only from union, concatenation, and star. Regular LANGUAGES are also closed under intersection and complement, but those operators are not part of the regular-expression syntax itself.",
    source: "Sipser Def 1.52"
  },
  {
    id: "ch1-def-emptyset-vs-eps", chapter: 1, topic: "Regular expressions", type: "mc",
    prompt: "As regular expressions, how do \\(\\emptyset\\) and \\(\\varepsilon\\) differ?",
    choices: [
      "\\(\\emptyset\\) matches no strings at all; \\(\\varepsilon\\) matches exactly the one empty string",
      "They are two notations for the same thing",
      "\\(\\emptyset\\) matches the empty string; \\(\\varepsilon\\) matches nothing",
      "\\(\\emptyset\\) matches every string; \\(\\varepsilon\\) matches none"
    ],
    answer: 0,
    explanation: "\\(L(\\emptyset)=\\{\\}\\) (the empty language, size 0) while \\(L(\\varepsilon)=\\{\\varepsilon\\}\\) (one string, the empty string, size 1). Hence \\(R\\circ\\emptyset=\\emptyset\\) but \\(R\\circ\\varepsilon=R\\).",
    source: "Sipser Def 1.52"
  },

  // ============================================================
  // ====  "What is …" plain-language definitions  ==============
  // ============================================================
  {
    id: "ch1-concept-dfa-what", chapter: 1, topic: "DFA", type: "mc",
    prompt: "In plain terms, what is a **deterministic finite automaton (DFA)**?",
    choices: [
      "A machine with finitely many states that reads the input once, left to right, is always in exactly one state, and accepts if it ends in an accept state",
      "A machine with a stack it can push to and pop from while reading the input",
      "A machine with an unbounded tape it can read from and write to",
      "A set of replacement rules that generates strings by derivation"
    ],
    answer: 0,
    explanation: "A DFA is the simplest model: finite memory (its states), one left-to-right pass, no stack or tape, exactly one move per symbol. The other options describe a PDA, a Turing machine, and a grammar.",
    source: "Sipser Def 1.5"
  },
  {
    id: "ch1-concept-nfa-what", chapter: 1, topic: "NFA", type: "mc",
    prompt: "In plain terms, what is a **nondeterministic finite automaton (NFA)**?",
    choices: [
      "A finite automaton that may have several possible moves (and \\(\\varepsilon\\)-moves) on a symbol, and accepts if SOME sequence of choices reaches an accept state",
      "A finite automaton that must have exactly one move per symbol from every state",
      "A finite automaton equipped with an unbounded stack",
      "A finite automaton that reads its input from right to left"
    ],
    answer: 0,
    explanation: "Nondeterminism = the machine may branch into several possibilities at once (including \\(\\varepsilon\\)-moves); it accepts when at least one branch ends in an accept state. It recognizes exactly the regular languages — same power as a DFA.",
    source: "Sipser Def 1.37"
  },
  {
    id: "ch1-concept-regular-what", chapter: 1, topic: "Regular vs nonregular", type: "mc",
    prompt: "What does it mean for a language to be **regular**?",
    choices: [
      "Some finite automaton recognizes it (equivalently, some regular expression describes it)",
      "It contains only finitely many strings",
      "Some context-free grammar generates it",
      "Every string in it has the same length"
    ],
    answer: 0,
    explanation: "A language is regular iff a finite automaton (DFA or NFA — same class) recognizes it, equivalently iff a regular expression describes it. Regular languages can be infinite (e.g. \\(\\Sigma^*\\)), and they are a strict subset of the context-free languages.",
    source: "Sipser Def 1.16, Thm 1.54"
  },
  {
    id: "ch1-concept-regex-what", chapter: 1, topic: "Regular expressions", type: "mc",
    prompt: "What is a **regular expression**?",
    choices: [
      "A notation that describes a language by combining symbols of \\(\\Sigma\\) (and \\(\\varepsilon,\\ \\emptyset\\)) with union, concatenation, and star",
      "A grammar with rules of the form \\(A\\to BC\\) or \\(A\\to a\\)",
      "A finite-state machine equipped with a stack",
      "A pattern that can match parentheses nested to arbitrary depth"
    ],
    answer: 0,
    explanation: "Regular expressions build up languages from atoms using \\(\\cup\\), concatenation, and \\(^*\\); they describe exactly the regular languages. They CANNOT match arbitrarily nested parentheses — that needs a context-free grammar.",
    source: "Sipser Def 1.52"
  },

  // ============================================================
  // ====  "What does this automaton / regex do?"  =============
  // ============================================================
  {
    id: "ch1-trace-dfa-odd1s", chapter: 1, topic: "DFA computation", type: "mc",
    prompt: "A DFA over \\(\\Sigma=\\{0,1\\}\\) has this transition table (\\(\\to\\) marks the start state, \\(*\\) marks accept):\n\n\\[\\begin{array}{c|cc} \\delta & 0 & 1\\\\ \\hline \\to q_0 & q_0 & q_1\\\\ *\\,q_1 & q_1 & q_0\\end{array}\\]\n\nWhich language does it recognize?",
    choices: [
      "strings with an odd number of \\(1\\)s",
      "strings with an even number of \\(1\\)s",
      "strings that end in \\(1\\)",
      "strings containing the substring \\(11\\)"
    ],
    answer: 0,
    explanation: "Reading a \\(0\\) keeps the state; reading a \\(1\\) flips \\(q_0\\leftrightarrow q_1\\). Since \\(q_1\\) is the accept state and you start in \\(q_0\\), you accept exactly when the number of \\(1\\)s is odd.",
    source: "Sipser §1.1 (designing/reading DFAs)"
  },
  {
    id: "ch1-trace-dfa-endin0", chapter: 1, topic: "DFA computation", type: "mc",
    prompt: "A DFA over \\(\\Sigma=\\{0,1\\}\\) (\\(\\to\\) start, \\(*\\) accept):\n\n\\[\\begin{array}{c|cc} \\delta & 0 & 1\\\\ \\hline \\to q_s & q_a & q_b\\\\ *\\,q_a & q_a & q_b\\\\ q_b & q_a & q_b\\end{array}\\]\n\nWhat does it accept?",
    choices: [
      "nonempty strings that end in \\(0\\)",
      "strings that end in \\(1\\)",
      "strings that start with \\(0\\)",
      "strings with an even number of \\(0\\)s"
    ],
    answer: 0,
    explanation: "On a \\(0\\) the machine goes to the accept state \\(q_a\\); on a \\(1\\) it goes to the non-accept state \\(q_b\\). So you accept exactly when the LAST symbol read was \\(0\\). (The empty string stays in \\(q_s\\), which is non-accepting.)",
    source: "Sipser §1.1 (designing/reading DFAs)"
  },
  {
    id: "ch1-trace-dfa-contains01", chapter: 1, topic: "DFA computation", type: "mc",
    prompt: "A DFA over \\(\\Sigma=\\{0,1\\}\\) (\\(\\to\\) start, \\(*\\) accept; \\(q_2\\) is a trap that stays accepting):\n\n\\[\\begin{array}{c|cc} \\delta & 0 & 1\\\\ \\hline \\to q_0 & q_1 & q_0\\\\ q_1 & q_1 & q_2\\\\ *\\,q_2 & q_2 & q_2\\end{array}\\]\n\nWhich language does it recognize?",
    choices: [
      "strings containing the substring \\(01\\)",
      "strings containing the substring \\(10\\)",
      "strings that end in \\(01\\)",
      "strings that start with \\(0\\)"
    ],
    answer: 0,
    explanation: "State \\(q_1\\) means \"a \\(0\\) was just seen.\" From \\(q_1\\), reading a \\(1\\) reaches the accepting trap \\(q_2\\) — i.e. a \\(0\\) followed by a \\(1\\) appeared. Once in \\(q_2\\) it stays, so it accepts every string containing \\(01\\) anywhere.",
    source: "Sipser §1.1 (designing/reading DFAs)"
  },
  {
    id: "ch1-trace-dfa-div3", chapter: 1, topic: "DFA computation", type: "mc",
    prompt: "A DFA over \\(\\Sigma=\\{0,1\\}\\) (\\(\\to\\) start, \\(*\\) accept):\n\n\\[\\begin{array}{c|cc} \\delta & 0 & 1\\\\ \\hline \\to *q_0 & q_1 & q_1\\\\ q_1 & q_2 & q_2\\\\ q_2 & q_0 & q_0\\end{array}\\]\n\nWhat does it accept?",
    choices: [
      "strings whose length is a multiple of \\(3\\)",
      "strings that contain exactly three \\(1\\)s",
      "strings of length exactly \\(3\\)",
      "strings that end in \\(000\\)"
    ],
    answer: 0,
    explanation: "Every symbol (\\(0\\) or \\(1\\)) advances \\(q_0\\to q_1\\to q_2\\to q_0\\), so the state tracks the length modulo \\(3\\). The accept state \\(q_0\\) is reached exactly when the length is \\(\\equiv 0 \\pmod 3\\) (including \\(\\varepsilon\\)).",
    source: "Sipser §1.1 (designing/reading DFAs)"
  },
  {
    id: "ch1-trace-nfa-endin01", chapter: 1, topic: "NFA computation", type: "mc",
    prompt: "An NFA over \\(\\Sigma=\\{0,1\\}\\) (\\(\\to\\) start, \\(*\\) accept; entries are SETS of states):\n\n\\[\\begin{array}{c|cc} \\delta & 0 & 1\\\\ \\hline \\to q_0 & \\{q_0,q_1\\} & \\{q_0\\}\\\\ q_1 & \\emptyset & \\{q_2\\}\\\\ *\\,q_2 & \\emptyset & \\emptyset\\end{array}\\]\n\nWhich language does it recognize?",
    choices: [
      "strings that end in \\(01\\)",
      "strings that contain \\(01\\) somewhere",
      "strings that end in \\(0\\)",
      "strings that start with \\(01\\)"
    ],
    answer: 0,
    explanation: "\\(q_0\\) loops on everything (\"stay and keep guessing\"); the branch \\(q_0\\xrightarrow{0}q_1\\xrightarrow{1}q_2\\) reaches the accept state only if the machine guesses the final \\(0\\) then reads a \\(1\\). Since \\(q_2\\) has no outgoing moves, acceptance requires the \\(01\\) to be the LAST two symbols.",
    source: "Sipser §1.2 (reading NFAs)"
  },
  {
    id: "ch1-trace-nfa-contains11", chapter: 1, topic: "NFA computation", type: "mc",
    prompt: "An NFA over \\(\\Sigma=\\{0,1\\}\\) (\\(\\to\\) start, \\(*\\) accept; entries are SETS):\n\n\\[\\begin{array}{c|cc} \\delta & 0 & 1\\\\ \\hline \\to q_0 & \\{q_0\\} & \\{q_0,q_1\\}\\\\ q_1 & \\emptyset & \\{q_2\\}\\\\ *\\,q_2 & \\{q_2\\} & \\{q_2\\}\\end{array}\\]\n\nWhat does it accept?",
    choices: [
      "strings containing the substring \\(11\\)",
      "strings that end in \\(11\\)",
      "strings containing exactly two \\(1\\)s",
      "strings that start with \\(11\\)"
    ],
    answer: 0,
    explanation: "\\(q_0\\) loops; on a \\(1\\) it may also guess into \\(q_1\\), and a following \\(1\\) reaches the accepting trap \\(q_2\\) — i.e. two consecutive \\(1\\)s appeared. \\(q_2\\) absorbs the rest, so it accepts every string containing \\(11\\).",
    source: "Sipser §1.2 (reading NFAs)"
  },
  {
    id: "ch1-regex-read-end01", chapter: 1, topic: "Regular expressions", type: "mc",
    prompt: "Over \\(\\Sigma=\\{0,1\\}\\), which strings does \\((0\\cup 1)^*01\\) describe?",
    choices: [
      "all strings that end in \\(01\\)",
      "all strings that start with \\(01\\)",
      "all strings that contain \\(01\\) somewhere",
      "only the string \\(01\\)"
    ],
    answer: 0,
    explanation: "\\((0\\cup 1)^*\\) matches any prefix; pinning \\(01\\) at the end forces the string to finish with \\(01\\). To say \"contains \\(01\\)\" you'd need \\((0\\cup1)^*01(0\\cup1)^*\\).",
    source: "Sipser Def 1.52 (reading regular expressions)"
  },
  {
    id: "ch1-regex-read-astarbstar", chapter: 1, topic: "Regular expressions", type: "mc",
    prompt: "Over \\(\\Sigma=\\{a,b\\}\\), what does \\(a^*b^*\\) describe?",
    choices: [
      "zero or more \\(a\\)'s followed by zero or more \\(b\\)'s",
      "strings with equally many \\(a\\)'s and \\(b\\)'s",
      "all strings over \\(\\{a,b\\}\\)",
      "strings that strictly alternate \\(a\\) and \\(b\\)"
    ],
    answer: 0,
    explanation: "Concatenation of \\(a^*\\) and \\(b^*\\) means all the \\(a\\)'s (if any) come first, then all the \\(b\\)'s — e.g. \\(\\varepsilon, a, b, aabbb\\), but NOT \\(ba\\) or \\(abab\\). It does not constrain the counts to be equal.",
    source: "Sipser Def 1.52 (reading regular expressions)"
  },
  {
    id: "ch1-regex-read-abstar", chapter: 1, topic: "Regular expressions", type: "mc",
    prompt: "What does \\((ab)^*\\) describe over \\(\\Sigma=\\{a,b\\}\\)?",
    choices: [
      "\\(\\varepsilon, ab, abab, ababab, \\dots\\) — zero or more copies of \\(ab\\)",
      "any string of \\(a\\)'s and \\(b\\)'s",
      "strings with the same number of \\(a\\)'s and \\(b\\)'s in any order",
      "an \\(a\\) followed by zero or more \\(b\\)'s"
    ],
    answer: 0,
    explanation: "Star applies to the whole block \\(ab\\), so you get repetitions of the two-symbol unit \\(ab\\). Although such strings do have equal \\(a\\)/\\(b\\) counts, the order is forced (always \\(abab\\dots\\)), so \"any order\" is wrong; \\(ab^*\\) would mean \\(a\\) then \\(b\\)'s.",
    source: "Sipser Def 1.52 (reading regular expressions)"
  },

  // ============================================================
  // ====  Hands-on with diagrams: read / trace automata  =======
  // ============================================================
  {
    id: "ch1-dia-dfa-odd1s", chapter: 1, topic: "DFA computation", type: "mc",
    prompt: "Read the DFA below (→ marks the start state, the double circle is an accept state). Which language does it recognize?",
    diagram: { width: 440, height: 175, states: [
      { id: "q0", x: 130, y: 92, start: true },
      { id: "q1", x: 330, y: 92, accept: true }
    ], edges: [
      { from: "q0", to: "q1", label: "1", bend: 40 },
      { from: "q1", to: "q0", label: "1", bend: 40 },
      { from: "q0", to: "q0", label: "0", loop: "up" },
      { from: "q1", to: "q1", label: "0", loop: "up" }
    ] },
    choices: [
      "strings with an odd number of \\(1\\)s",
      "strings with an even number of \\(1\\)s",
      "strings that end in \\(1\\)",
      "strings containing \\(11\\)"
    ],
    answer: 0,
    explanation: "A \\(0\\) is a self-loop (no state change); a \\(1\\) flips \\(q_0\\leftrightarrow q_1\\). Starting in \\(q_0\\) and accepting in \\(q_1\\) means you accept exactly when the number of \\(1\\)s read is odd.",
    source: "Sipser §1.1 (reading DFAs)"
  },
  {
    id: "ch1-dia-dfa-trace", chapter: 1, topic: "DFA computation", type: "mc",
    prompt: "Trace the same DFA on the input \\(1011\\). What happens?",
    diagram: { width: 440, height: 175, states: [
      { id: "q0", x: 130, y: 92, start: true },
      { id: "q1", x: 330, y: 92, accept: true }
    ], edges: [
      { from: "q0", to: "q1", label: "1", bend: 40 },
      { from: "q1", to: "q0", label: "1", bend: 40 },
      { from: "q0", to: "q0", label: "0", loop: "up" },
      { from: "q1", to: "q1", label: "0", loop: "up" }
    ] },
    choices: [
      "Accept — the run is \\(q_0\\to q_1\\to q_1\\to q_0\\to q_1\\), ending in the accept state (three \\(1\\)s, odd)",
      "Reject — the run ends in \\(q_0\\)",
      "Reject — the input contains a \\(0\\)",
      "Accept — because the input ends in \\(1\\)"
    ],
    answer: 0,
    explanation: "Reading \\(1,0,1,1\\) from \\(q_0\\): \\(1\\to q_1\\), \\(0\\to q_1\\), \\(1\\to q_0\\), \\(1\\to q_1\\). It ends in \\(q_1\\) (accept). \\(1011\\) has three \\(1\\)s — odd — which is the real reason, not \"ends in 1\".",
    source: "Sipser §1.1 (computation of a DFA)"
  },
  {
    id: "ch1-dia-dfa-contains01", chapter: 1, topic: "DFA computation", type: "mc",
    prompt: "Which language does the DFA below recognize? (\\(q_2\\) is an accepting trap.)",
    diagram: { width: 520, height: 175, states: [
      { id: "q0", x: 90, y: 92, start: true },
      { id: "q1", x: 265, y: 92 },
      { id: "q2", x: 440, y: 92, accept: true }
    ], edges: [
      { from: "q0", to: "q0", label: "1", loop: "up" },
      { from: "q0", to: "q1", label: "0" },
      { from: "q1", to: "q1", label: "0", loop: "up" },
      { from: "q1", to: "q2", label: "1" },
      { from: "q2", to: "q2", label: "0,1", loop: "up" }
    ] },
    choices: [
      "strings containing the substring \\(01\\)",
      "strings containing the substring \\(10\\)",
      "strings that end in \\(01\\)",
      "strings that start with \\(0\\)"
    ],
    answer: 0,
    explanation: "\\(q_1\\) means \"a \\(0\\) has been seen\"; from \\(q_1\\), reading a \\(1\\) reaches the accepting trap \\(q_2\\) — i.e. a \\(0\\) followed later by a \\(1\\). Once in \\(q_2\\) you stay, so any string containing \\(01\\) is accepted.",
    source: "Sipser §1.1 (reading DFAs)"
  },
  {
    id: "ch1-dia-nfa-contains11", chapter: 1, topic: "NFA computation", type: "mc",
    prompt: "Read the NFA below (entries may be nondeterministic). Which language does it recognize?",
    diagram: { width: 520, height: 175, states: [
      { id: "q0", x: 90, y: 92, start: true },
      { id: "q1", x: 265, y: 92 },
      { id: "q2", x: 440, y: 92, accept: true }
    ], edges: [
      { from: "q0", to: "q0", label: "0,1", loop: "up" },
      { from: "q0", to: "q1", label: "1" },
      { from: "q1", to: "q2", label: "1" },
      { from: "q2", to: "q2", label: "0,1", loop: "up" }
    ] },
    choices: [
      "strings containing the substring \\(11\\)",
      "strings that end in \\(11\\)",
      "strings with exactly two \\(1\\)s",
      "strings that start with \\(11\\)"
    ],
    answer: 0,
    explanation: "\\(q_0\\) loops on everything and may also guess into \\(q_1\\) on a \\(1\\); a following \\(1\\) reaches the accepting trap \\(q_2\\). So some branch accepts exactly when two consecutive \\(1\\)s appear anywhere.",
    source: "Sipser §1.2 (reading NFAs)"
  },
  {
    id: "ch1-dia-nfa-why-nondet", chapter: 1, topic: "NFA", type: "mc",
    prompt: "Look at state \\(q_0\\) of the NFA above. What specifically makes this machine nondeterministic (not a DFA)?",
    diagram: { width: 520, height: 175, states: [
      { id: "q0", x: 90, y: 92, start: true },
      { id: "q1", x: 265, y: 92 },
      { id: "q2", x: 440, y: 92, accept: true }
    ], edges: [
      { from: "q0", to: "q0", label: "0,1", loop: "up" },
      { from: "q0", to: "q1", label: "1" },
      { from: "q1", to: "q2", label: "1" },
      { from: "q2", to: "q2", label: "0,1", loop: "up" }
    ] },
    choices: [
      "On input \\(1\\), \\(q_0\\) has two possible moves (stay in \\(q_0\\) or go to \\(q_1\\))",
      "It has an accept state",
      "It has a self-loop",
      "It reads its input from left to right"
    ],
    answer: 0,
    explanation: "A DFA must have exactly one transition per (state, symbol). Here \\(q_0\\) on \\(1\\) can either stay or move to \\(q_1\\) — two choices on one symbol — which is exactly nondeterminism.",
    source: "Sipser Def 1.37"
  },

  // ---- NFA -> DFA subset construction (hands-on) ----
  {
    id: "ch1-sub-start", chapter: 1, topic: "Subset construction", type: "mc",
    prompt: "Convert the NFA below to a DFA by the subset construction. Since the NFA has no \\(\\varepsilon\\)-moves, what is the DFA's **start state**?",
    diagram: { width: 440, height: 165, states: [
      { id: "q0", x: 130, y: 88, start: true },
      { id: "q1", x: 330, y: 88, accept: true }
    ], edges: [
      { from: "q0", to: "q0", label: "a,b", loop: "up" },
      { from: "q0", to: "q1", label: "a" }
    ] },
    choices: ["\\(\\{q_0\\}\\)", "\\(\\{q_0,q_1\\}\\)", "\\(\\{q_1\\}\\)", "\\(\\emptyset\\)"],
    answer: 0,
    explanation: "Each DFA state is a SET of NFA states. With no \\(\\varepsilon\\)-moves, the DFA start state is just the \\(\\varepsilon\\)-closure of the NFA start, \\(\\{q_0\\}\\).",
    source: "Sipser Thm 1.39 (subset construction)"
  },
  {
    id: "ch1-sub-step-a", chapter: 1, topic: "Subset construction", type: "mc",
    prompt: "In that subset construction, from the DFA state \\(\\{q_0\\}\\) on input \\(a\\), which set of NFA states do you reach?",
    diagram: { width: 440, height: 165, states: [
      { id: "q0", x: 130, y: 88, start: true },
      { id: "q1", x: 330, y: 88, accept: true }
    ], edges: [
      { from: "q0", to: "q0", label: "a,b", loop: "up" },
      { from: "q0", to: "q1", label: "a" }
    ] },
    choices: ["\\(\\{q_0,q_1\\}\\)", "\\(\\{q_0\\}\\)", "\\(\\{q_1\\}\\)", "\\(\\emptyset\\)"],
    answer: 0,
    explanation: "From \\(q_0\\) on \\(a\\) the NFA can stay in \\(q_0\\) (the \\(a,b\\) self-loop) AND move to \\(q_1\\). Take the union: \\(\\{q_0,q_1\\}\\). That set becomes a new DFA state.",
    source: "Sipser Thm 1.39 (subset construction)"
  },
  {
    id: "ch1-sub-step-b", chapter: 1, topic: "Subset construction", type: "mc",
    prompt: "Continuing, from the DFA state \\(\\{q_0,q_1\\}\\) on input \\(b\\), which set do you reach? (Recall \\(q_1\\) has no outgoing edges.)",
    diagram: { width: 440, height: 165, states: [
      { id: "q0", x: 130, y: 88, start: true },
      { id: "q1", x: 330, y: 88, accept: true }
    ], edges: [
      { from: "q0", to: "q0", label: "a,b", loop: "up" },
      { from: "q0", to: "q1", label: "a" }
    ] },
    choices: ["\\(\\{q_0\\}\\)", "\\(\\{q_0,q_1\\}\\)", "\\(\\{q_1\\}\\)", "\\(\\emptyset\\)"],
    answer: 0,
    explanation: "Union the \\(b\\)-moves of every state in the set: \\(q_0\\) on \\(b\\) gives \\(\\{q_0\\}\\), and \\(q_1\\) on \\(b\\) gives \\(\\emptyset\\). So \\(\\{q_0\\}\\cup\\emptyset=\\{q_0\\}\\).",
    source: "Sipser Thm 1.39 (subset construction)"
  },
  {
    id: "ch1-sub-eclosure", chapter: 1, topic: "Subset construction", type: "mc",
    prompt: "This NFA has an \\(\\varepsilon\\)-transition \\(q_0\\to q_1\\). In the subset construction, the DFA start state is the \\(\\varepsilon\\)-closure of \\(\\{q_0\\}\\) — which set is that?",
    diagram: { width: 440, height: 165, states: [
      { id: "q0", x: 130, y: 88, start: true },
      { id: "q1", x: 330, y: 88, accept: true }
    ], edges: [
      { from: "q0", to: "q1", label: "ε" },
      { from: "q1", to: "q1", label: "a", loop: "up" }
    ] },
    choices: ["\\(\\{q_0,q_1\\}\\)", "\\(\\{q_0\\}\\)", "\\(\\{q_1\\}\\)", "\\(\\emptyset\\)"],
    answer: 0,
    explanation: "The \\(\\varepsilon\\)-closure of a set adds every state reachable by \\(\\varepsilon\\)-moves. From \\(q_0\\) you can take the \\(\\varepsilon\\)-edge to \\(q_1\\), so the closure — and the DFA start state — is \\(\\{q_0,q_1\\}\\).",
    source: "Sipser Thm 1.39 (handling ε-moves)"
  },
  {
    id: "ch1-sub-maxstates", chapter: 1, topic: "Subset construction", type: "mc",
    prompt: "If an NFA has \\(n\\) states, how many states can the DFA produced by the subset construction have in the worst case?",
    choices: ["\\(2^n\\)", "\\(n\\)", "\\(n^2\\)", "\\(2n\\)"],
    answer: 0,
    explanation: "DFA states are subsets of the NFA's \\(n\\) states, and there are \\(2^n\\) subsets. Usually far fewer are reachable, but \\(2^n\\) is the worst case (which is why NFAs can be exponentially smaller).",
    source: "Sipser Thm 1.39"
  },
  {
    id: "ch1-sub-deadstate", chapter: 1, topic: "Subset construction", type: "mc",
    prompt: "In the subset construction, what role does the DFA state \\(\\emptyset\\) (the empty set of NFA states) play?",
    choices: [
      "A non-accepting trap (dead) state: once you reach \\(\\emptyset\\) you stay there and reject",
      "The DFA's start state",
      "An accepting state, since the empty set is a subset of every set",
      "It can never occur in a subset construction"
    ],
    answer: 0,
    explanation: "\\(\\emptyset\\) means \"no NFA state is currently active\" (every branch died). All of its transitions go to \\(\\emptyset\\), and it isn't accepting — a dead/trap state.",
    source: "Sipser Thm 1.39"
  },

  // ---- FA -> regex via GNFA ripping (hands-on) ----
  {
    id: "ch1-rip-what", chapter: 1, topic: "GNFA", type: "mc",
    prompt: "To convert a finite automaton into an equivalent regular expression, you turn it into a GNFA and then repeatedly:",
    choices: [
      "remove ('rip out') states one at a time, relabeling the affected edges with regular expressions, until only the start and accept states remain",
      "merge all accept states into one and read off the result",
      "complement the automaton and swap its arrows",
      "apply the pumping lemma to each state"
    ],
    answer: 0,
    explanation: "The GNFA-to-regex procedure removes internal states one by one. Each removal re-routes the paths that went through that state by combining edge labels, until a single edge from start to accept holds the answer.",
    source: "Sipser Thm 1.54 (GNFA)"
  },
  {
    id: "ch1-rip-rule", chapter: 1, topic: "GNFA", type: "mc",
    prompt: "You rip out state \\(q\\), whose self-loop is labeled \\(R_2\\). An edge \\(p\\xrightarrow{R_1}q\\xrightarrow{R_3}r\\) is replaced by a direct edge \\(p\\to r\\) whose new label (combined with any existing \\(p\\to r\\) label \\(R_4\\)) is:",
    choices: [
      "\\(R_1 R_2^{*} R_3 \\,\\cup\\, R_4\\)",
      "\\(R_1 R_3 \\,\\cup\\, R_4\\)",
      "\\(R_1 \\cup R_2 \\cup R_3 \\cup R_4\\)",
      "\\((R_1 R_2 R_3 R_4)^{*}\\)"
    ],
    answer: 0,
    explanation: "Going \\(p\\to q\\) (\\(R_1\\)), looping at \\(q\\) any number of times (\\(R_2^{*}\\)), then \\(q\\to r\\) (\\(R_3\\)) gives \\(R_1R_2^{*}R_3\\); union it with the label already on \\(p\\to r\\). This is Sipser's edge-relabeling rule.",
    source: "Sipser Thm 1.54 (Fig. on ripping)"
  },
  {
    id: "ch1-rip-gnfa-tf", chapter: 1, topic: "GNFA", type: "tf",
    prompt: "In the GNFA used for this conversion, the special start state has no incoming arrows and the special accept state has no outgoing arrows.",
    answer: true,
    explanation: "Sipser's GNFA normal form: add a new start state with \\(\\varepsilon\\)-arrows to the old start and no arrows in, and a new accept state with arrows from all old accepts and no arrows out. This makes the rip-out procedure uniform.",
    source: "Sipser Def 1.55 / Thm 1.54"
  },

  // ---- Pumping lemma, hands-on / plug-in ----
  {
    id: "ch1-pump-why-y0", chapter: 1, topic: "Pumping lemma", type: "mc",
    prompt: "In the pumping-lemma proof that \\(\\{0^n1^n\\}\\) is not regular, you pick \\(s=0^p1^p\\). Why must the pumped part \\(y\\) consist only of \\(0\\)s?",
    choices: [
      "Because \\(|xy|\\le p\\) forces \\(xy\\) into the first \\(p\\) symbols of \\(s\\), which are all \\(0\\)s",
      "Because \\(y\\) must contain the boundary between the \\(0\\)s and the \\(1\\)s",
      "Because \\(|y|>0\\) means \\(y\\) is nonempty",
      "Because the pumping length \\(p\\) is always even"
    ],
    answer: 0,
    explanation: "The lemma guarantees a split \\(s=xyz\\) with \\(|xy|\\le p\\) and \\(|y|>0\\). The first \\(p\\) symbols of \\(0^p1^p\\) are all \\(0\\)s, so \\(xy\\) (hence \\(y\\)) lies entirely in the \\(0\\)-block.",
    source: "Sipser Thm 1.70 / Ex 1.73"
  },
  {
    id: "ch1-pump-plugin-s", chapter: 1, topic: "Pumping lemma", type: "fib",
    prompt: "Plug in a number. For \\(\\{0^n1^n\\}\\) with pumping length \\(p=3\\), the witness string \\(s=0^p1^p\\) is which concrete string? (type the digits, e.g. 0011)",
    accept: ["000111"],
    explanation: "\\(0^p1^p\\) with \\(p=3\\) is \\(0^3 1^3 = 000111\\) — three \\(0\\)s followed by three \\(1\\)s.",
    source: "Sipser Ex 1.73"
  },
  {
    id: "ch1-pump-plugin-xy2z", chapter: 1, topic: "Pumping lemma", type: "fib",
    prompt: "Continuing with \\(s=000111\\) and the split \\(x=0,\\ y=00,\\ z=111\\): write the pumped string \\(xy^2z\\) (that is, \\(x\\) then \\(yy\\) then \\(z\\)).",
    accept: ["00000111"],
    explanation: "\\(xy^2z = x\\,y\\,y\\,z = 0 + 00 + 00 + 111 = 00000111\\) — five \\(0\\)s but only three \\(1\\)s, so it is NOT in \\(\\{0^n1^n\\}\\). That contradiction proves the language is not regular.",
    source: "Sipser Ex 1.73"
  },
  {
    id: "ch1-pump-count", chapter: 1, topic: "Pumping lemma", type: "mc",
    prompt: "Generalizing: with \\(s=0^p1^p\\) and \\(y=0^k\\) (\\(k\\ge 1\\)), how many \\(0\\)s and \\(1\\)s does \\(xy^2z\\) have?",
    choices: [
      "\\(p+k\\) zeros and \\(p\\) ones — unequal, so it leaves the language",
      "\\(p\\) zeros and \\(p\\) ones — still in the language",
      "\\(p+k\\) zeros and \\(p+k\\) ones",
      "\\(2p\\) zeros and \\(p\\) ones"
    ],
    answer: 0,
    explanation: "Pumping \\(y=0^k\\) up once adds \\(k\\) extra \\(0\\)s and no \\(1\\)s, giving \\(0^{p+k}1^p\\). Since \\(k\\ge 1\\), the counts differ, so \\(xy^2z\\notin\\{0^n1^n\\}\\) — the contradiction.",
    source: "Sipser Ex 1.73"
  },
  {
    id: "ch1-pump-down", chapter: 1, topic: "Pumping lemma", type: "mc",
    prompt: "Instead, pump DOWN: take \\(i=0\\) (the string \\(xz\\)) with \\(y=0^k\\) inside the \\(0\\)-block of \\(s=0^p1^p\\). What do you get?",
    choices: [
      "\\(0^{p-k}1^p\\): fewer \\(0\\)s than \\(1\\)s, so \\(xz\\notin\\{0^n1^n\\}\\)",
      "\\(0^{p}1^{p-k}\\): fewer \\(1\\)s than \\(0\\)s",
      "\\(0^{p}1^{p}\\): unchanged",
      "\\(\\varepsilon\\): the empty string"
    ],
    answer: 0,
    explanation: "Removing \\(y=0^k\\) (the \\(i=0\\) case) deletes \\(k\\) \\(0\\)s, giving \\(0^{p-k}1^p\\). Now there are fewer \\(0\\)s than \\(1\\)s, so it is outside \\(\\{0^n1^n\\}\\) — pumping down works too.",
    source: "Sipser Ex 1.73"
  }
]);
