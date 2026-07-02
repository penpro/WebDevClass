/* discussions2.js — a second batch of guided "discussion" builders plus a set of
   standalone VISUAL questions (each carries a diagram/svg). Same conventions as
   discussions.js: type:"discussion" with revealed-one-at-a-time mc/tf steps, then
   a whyMatters + realWorld; visual questions are plain mc/tf/multi with a `diagram`
   (automaton spec) or `svg` field. Edge labels are PLAIN UNICODE (ε, 0, 1), never
   LaTeX; KaTeX in text uses \\( ... \\). Fills the gap in ch0 discussions and adds
   ch6 self-reference / Turing-reducibility builders. */
TOC.addQuestions([

  /* ===================== Ch 0 — what is a language? ===================== */
  {
    id: "disc-ch0-alphabet-string-language", chapter: 0, topic: "Strings & languages", type: "discussion", rank: 12,
    prompt: "**Before any machine, there's the raw material: symbols.** This whole course studies sets of *strings*. Let's build that idea cleanly, one layer at a time: an **alphabet** is a finite set of symbols, a **string** is a finite sequence of them, and a **language** is a set of strings.",
    steps: [
      { prompt: "Start with the alphabet \\(\\Sigma=\\{0,1\\}\\). A **string over \\(\\Sigma\\)** is a finite sequence of its symbols, like \\(0110\\). How many *different* strings of length exactly \\(3\\) are there over \\(\\Sigma\\)?", type: "mc",
        choices: ["\\(8\\)  (that is, \\(2^3\\))", "\\(6\\)  (that is, \\(2\\cdot 3\\))", "\\(3\\)", "Infinitely many"], answer: 0,
        explain: "Each of the \\(3\\) positions independently is \\(0\\) or \\(1\\), so there are \\(2^3=8\\) strings: \\(000,001,010,011,100,101,110,111\\). In general there are \\(|\\Sigma|^n\\) strings of length \\(n\\)." },
      { prompt: "The notation \\(\\Sigma^*\\) means \"all finite strings over \\(\\Sigma\\), including the empty string \\(\\varepsilon\\).\" True or false: \\(\\Sigma^*\\) is an **infinite** set even though \\(\\Sigma\\) is finite.", type: "tf", answer: true,
        explain: "True. \\(\\Sigma^*\\) contains strings of every length \\(0,1,2,3,\\dots\\) with no upper bound, so it is infinite — but each individual string is still **finite**. (\\(\\Sigma^*=\\{\\varepsilon,0,1,00,01,\\dots\\}\\).)" },
      { prompt: "Finally, a **language** over \\(\\Sigma\\) is *any* set of strings — formally any subset \\(L\\subseteq\\Sigma^*\\). Which of these is **not** a valid language over \\(\\Sigma=\\{0,1\\}\\)?", type: "mc",
        choices: ["A set containing an infinitely long \"string\" of \\(0\\)s", "The empty set \\(\\emptyset\\)", "The finite set \\(\\{\\varepsilon,01,0011\\}\\)", "The infinite set \\(\\{0^n1^n\\mid n\\ge 0\\}\\)"], answer: 0,
        explain: "Strings must be **finite**, so there is no infinite \"string\" to put in a language. The empty set, any finite set, and infinite sets of finite strings are all perfectly good languages — \\(L\\) just has to be a subset of \\(\\Sigma^*\\)." }
    ],
    explanation: "The chain is **alphabet \\(\\Sigma\\)** (finite symbols) → **strings** (finite sequences, collected as \\(\\Sigma^*\\)) → **language** (any subset \\(L\\subseteq\\Sigma^*\\)). Every model in the course — DFA, PDA, Turing machine — is ultimately just a way to *describe which strings are in a language*.",
    whyMatters: "\"Recognizing a language\" is the single goal that unifies the whole subject: each machine you meet is judged purely by **which set of strings it accepts**. Getting alphabet/string/language straight is the vocabulary everything else is written in.",
    realWorld: "Every input your programs ever see — a file, a URL, a DNA sequence over \\(\\{A,C,G,T\\}\\), a network packet — is a finite **string** over some alphabet, and \"valid inputs\" form a **language**. A validator (\"is this a well-formed email address?\") is literally a membership test for a language.",
    source: "Sipser §0.2 (Strings and languages); Def 1.5"
  },

  /* ===================== Ch 0 — proof techniques (worked) ===================== */
  {
    id: "disc-ch0-why-prove-by-contradiction", chapter: 0, topic: "Proof techniques", type: "discussion", rank: 12,
    prompt: "**Why do we ever assume the *opposite* of what we want, then break it?** That's proof **by contradiction**, and it's the workhorse behind the deepest results ahead (irrationality, the pumping lemma, undecidability). Let's walk the classic worked example and see exactly why it's valid — then contrast it with a *constructive* proof.",
    steps: [
      { prompt: "Claim: \\(\\sqrt{2}\\) is **irrational**. The proof by contradiction opens by assuming the negation. What is that opening assumption?", type: "mc",
        choices: ["Assume \\(\\sqrt{2}=\\tfrac{a}{b}\\) is rational, in lowest terms (\\(a,b\\) not both even)", "Assume \\(\\sqrt{2}\\) is irrational and simplify", "Assume \\(a^2=2b^2\\) has no solutions", "Pick a specific \\(a,b\\) and compute \\(a/b\\)"], answer: 0,
        explain: "By-contradiction always **negates the goal first**. To prove \"\\(\\sqrt 2\\) is irrational,\" you assume the opposite — that it *is* rational, \\(\\sqrt2=a/b\\) in lowest terms — and aim to derive an absurdity." },
      { prompt: "From \\(\\sqrt2=a/b\\) you get \\(a^2=2b^2\\), so \\(a^2\\) is even, hence \\(a\\) is even, say \\(a=2k\\); substituting gives \\(b^2=2k^2\\), so \\(b\\) is even **too**. Why is that the contradiction?", type: "mc",
        choices: ["\\(a\\) and \\(b\\) are now both even, contradicting \"lowest terms\"", "It proves \\(\\sqrt2\\) is rational after all", "It shows \\(a^2=2b^2\\) has too many solutions", "Even numbers cannot be squared"], answer: 0,
        explain: "We assumed \\(a/b\\) was in **lowest terms** (no common factor of \\(2\\)), yet derived that \\(a\\) and \\(b\\) are *both* even. That's a flat contradiction, so the only thing we assumed — that \\(\\sqrt2\\) is rational — must be **false**. Hence \\(\\sqrt2\\) is irrational." },
      { prompt: "A proof **by construction** is different: to prove \"an object with property \\(P\\) exists,\" you simply **exhibit one** (or give a procedure that builds it). True or false: construction proves existence *directly*, without assuming the statement is false.", type: "tf", answer: true,
        explain: "True. Construction is the opposite spirit: you build a witness on the spot (a graph, a DFA, an explicit number) and check it has property \\(P\\). Most \"there exists a machine that…\" results in this course are proved by **constructing** the machine." },
      { prompt: "Here's the gentlest teaser of what's coming: Cantor showed the real numbers are **uncountable** — there are strictly *more* reals than there are finite descriptions of them. Since every program/Turing machine is one finite string, what must follow?", type: "mc",
        choices: ["Some languages/functions have **no** program at all (more problems than programs)", "Every real number is computable", "There are only finitely many programs", "Every language is decidable"], answer: 0,
        explain: "There are only **countably many** finite programs but **uncountably many** languages, so by sheer counting *most* languages have no recognizer. This counting/diagonalization idea (Ch 0 sets → Ch 4 undecidability) is the seed of the entire computability story." }
    ],
    explanation: "**By contradiction**: assume the negation, derive an absurdity, conclude the original. **By construction**: exhibit a witness directly. These two moves — plus induction — are the toolkit for every theorem ahead, and Cantor's counting argument is the bridge from \"sets\" to \"some problems are unsolvable.\"",
    whyMatters: "Picking the right proof *shape* is half of doing the proof: existence claims invite construction, while impossibility claims (the pumping lemma, undecidability of \\(A_{TM}\\)) almost always go by contradiction. Recognizing the pattern tells you how to start.",
    realWorld: "Cryptography leans on the **constructive** side (here is an algorithm, here is why it's hard to break), while security *impossibility* results — \"no program can detect all malware,\" \"no perfect halting checker exists\" — are proved by **contradiction**, the same shape as the \\(\\sqrt2\\) argument.",
    source: "Sipser §0.4 (Proof by contradiction & construction); §4.2 (uncountability / diagonalization)"
  },

  /* ===================== Ch 6 — recursion theorem / quines ===================== */
  {
    id: "disc-ch6-recursion-quine", chapter: 6, topic: "Recursion theorem", type: "discussion", rank: 32,
    prompt: "**Can a program print its own source code — with no file reading, no cheating?** Yes: such a program is called a **quine**, and the fact that one must exist is the **recursion theorem**. It feels paradoxical (\"how can it know itself?\") but it isn't. Let's defuse the paradox.",
    steps: [
      { prompt: "First, the would-be paradox. To print its source, it *seems* a program must \"contain a copy of itself,\" which seems to need a copy inside that copy, forever. What's the resolution?", type: "mc",
        choices: ["Split into two parts: a **data** part that encodes the **code** part, and code that prints the data then decodes-and-prints itself", "It's genuinely impossible without reading the source file", "The program must be infinitely long", "Only interpreted languages can do it"], answer: 0,
        explain: "The trick is **two parts**: a piece of *data* \\(B\\) that describes the *program* \\(A\\), plus code \\(A\\) that (1) prints \\(B\\) verbatim and (2) uses \\(B\\) to reconstruct and print \\(A\\). No infinite regress — the data describes the code *once*, finitely. This is exactly Sipser's \\(\\mathit{SELF}=AB\\)." },
      { prompt: "Sipser's key gadget (Lemma 6.1) is a computable function \\(q\\) where \\(q(w)=\\langle P_w\\rangle\\): the description of a machine \\(P_w\\) that simply **prints \\(w\\) and halts**. Why is \\(q\\) the engine of self-reproduction?", type: "mc",
        choices: ["It lets any string \\(w\\) be turned into code that outputs \\(w\\), so a program can recover its own code-part from its data-part", "It reverses the string \\(w\\)", "It decides whether \\(w\\) is a valid program", "It compresses \\(w\\) to minimal length"], answer: 0,
        explain: "\\(q\\) is \"hard-code this string into a printer.\" In \\(\\mathit{SELF}=AB\\): part \\(A\\) is \\(P_{\\langle B\\rangle}\\) (it prints the data \\(\\langle B\\rangle\\)); part \\(B\\) then reads \\(\\langle B\\rangle\\) off the tape and applies \\(q\\) to get \\(\\langle A\\rangle=q(\\langle B\\rangle)\\), so it can assemble and print the whole \\(\\langle AB\\rangle\\)." },
      { prompt: "The **recursion theorem** generalizes this: it says any TM \\(M\\) may, as a legitimate step, **obtain its own description \\(\\langle M\\rangle\\)** and compute with it. True or false: this lets you write \"get my own code\" inside an algorithm without circularity.", type: "tf", answer: true,
        explain: "True. The theorem *guarantees* a machine equivalent to your description-using design exists, so \"obtain \\(\\langle M\\rangle\\)\" is a valid instruction — just like \\(\\texttt{this}\\)/\\(\\texttt{self}\\) in programming. It's a construction, not a paradox." },
      { prompt: "One famous payoff: the recursion-theorem proof that \\(A_{TM}\\) is **undecidable**. Assume \\(H\\) decides \\(A_{TM}\\); build \\(B\\) that obtains \\(\\langle B\\rangle\\), asks \\(H\\) \"does \\(B\\) accept \\(w\\)?\", and then does the **opposite**. What goes wrong for \\(H\\)?", type: "mc",
        choices: ["\\(B\\)'s real behavior always contradicts \\(H\\)'s verdict, so no correct \\(H\\) can exist", "\\(B\\) loops, so \\(H\\) is fine", "\\(H\\) accepts \\(\\langle B\\rangle\\), proving \\(A_{TM}\\) decidable", "Nothing — \\(B\\) is not a valid machine"], answer: 0,
        explain: "If \\(H\\) says \"\\(B\\) accepts,\" \\(B\\) rejects; if \\(H\\) says \"rejects,\" \\(B\\) accepts. \\(B\\)'s actual behavior is the negation of \\(H\\)'s claim about it — a contradiction — so no decider \\(H\\) exists. Self-reference replaces the diagonalization of Thm 4.11." }
    ],
    explanation: "A **quine** is no paradox: a finite *data* part encodes the *code* part, and Sipser's \\(q\\)-function (\"print this string\") lets the code rebuild and emit its full source. The **recursion theorem** packages this as \"any machine may obtain its own description\" — a clean tool that, among other things, gives a one-line proof that \\(A_{TM}\\) is undecidable.",
    whyMatters: "Self-reference is a *constructive technique*, not a logical trap: once you can legitimately use \\(\\langle M\\rangle\\) inside \\(M\\), hard impossibility proofs (Rice's theorem, \\(MIN_{TM}\\) unrecognizable) become short and mechanical.",
    realWorld: "Quines are a real programming sport in every language, and the same self-copying construction is exactly how a **computer virus** reproduces its own code into new hosts — Sipser explicitly points this out.",
    source: "Sipser §6.1 (Lemma 6.1, SELF, Thm 6.3, Thm 6.5)"
  },

  /* ===================== Ch 6 — Turing reducibility / oracles ===================== */
  {
    id: "disc-ch6-oracle-turing-reducibility", chapter: 6, topic: "Turing reducibility", type: "discussion", rank: 32,
    prompt: "**Imagine you're given a magic library call** `inB(w)` that instantly returns whether \\(w\\in B\\) — you don't know how it works, you just *call* it. That call is an **oracle**, and a machine allowed to use it is an **oracle Turing machine** \\(M^B\\). This is how we compare problems even when both are undecidable.",
    steps: [
      { prompt: "An oracle for a language \\(B\\) is best described as:", type: "mc",
        choices: ["A black-box subroutine that answers \"\\(w\\in B\\)?\" in a single step, however hard \\(B\\) actually is", "A polynomial-time algorithm for \\(B\\)", "A proof that \\(B\\) is decidable", "An enumerator that lists \\(B\\) in order"], answer: 0,
        explain: "An oracle is exactly a **free, instantaneous membership test** for \\(B\\) — a library/subroutine you may call, with no regard for whether \\(B\\) is even computable. The machine \\(M^B\\) is an ordinary TM plus the power to make such queries." },
      { prompt: "We say \\(A\\le_T B\\) (\\(A\\) is **Turing reducible** to \\(B\\)) when some oracle machine \\(M^B\\) **decides** \\(A\\). Intuitively, what does \\(A\\le_T B\\) assert?", type: "mc",
        choices: ["\"If I could solve \\(B\\), I could solve \\(A\\)\" — \\(A\\) is no harder than \\(B\\)", "\\(A\\subseteq B\\) as sets", "\\(A\\) and \\(B\\) are both recognizable", "\\(A\\) and \\(B\\) are equal"], answer: 0,
        explain: "\\(A\\le_T B\\) means: *given* the ability to decide \\(B\\) (the oracle), you can decide \\(A\\). It's the precise version of \"\\(A\\) is solvable **relative to** \\(B\\)\" — \\(A\\) is at most as hard as \\(B\\)." },
      { prompt: "How does \\(\\le_T\\) differ from mapping reducibility \\(\\le_m\\) (a single computable \\(f\\) with \\(w\\in A\\Leftrightarrow f(w)\\in B\\))? Pick the sharpest statement.", type: "mc",
        choices: ["\\(\\le_m\\) makes **one** call to \\(B\\) and must report \\(B\\)'s answer unchanged; \\(\\le_T\\) may call the oracle **many times** and may **negate/combine** the answers", "They are identical notions", "\\(\\le_T\\) requires \\(f\\) to be one-to-one", "\\(\\le_m\\) is more general than \\(\\le_T\\)"], answer: 0,
        explain: "A mapping reduction is a *one-shot, answer-preserving* translation. An oracle machine is far more flexible: it can query \\(B\\) repeatedly, on inputs it computes, and freely **flip or combine** the results. So \\(\\le_T\\) is strictly more general — every \\(\\le_m\\) is a \\(\\le_T\\), but not conversely." },
      { prompt: "The classic gap: \\(\\overline{A_{TM}}\\le_T A_{TM}\\) holds (an oracle machine just asks the \\(A_{TM}\\) oracle and **flips** its yes/no), yet \\(\\overline{A_{TM}}\\not\\le_m A_{TM}\\). True or false: this shows \\(\\le_T\\) is strictly more powerful than \\(\\le_m\\).", type: "tf", answer: true,
        explain: "True. Flipping the oracle's answer trivially gives \\(\\overline{A_{TM}}\\le_T A_{TM}\\). But \\(\\overline{A_{TM}}\\not\\le_m A_{TM}\\), because \\(A_{TM}\\) is Turing-recognizable while \\(\\overline{A_{TM}}\\) is not, and \\(\\le_m\\) would carry recognizability over. The single answer-preserving call is exactly the restriction that \\(\\le_T\\) lifts." }
    ],
    explanation: "An **oracle** is a free membership-subroutine for \\(B\\); \\(A\\le_T B\\) means an oracle machine \\(M^B\\) decides \\(A\\) (\"\\(A\\) is no harder than \\(B\\)\"). Unlike a **one-shot, answer-preserving** \\(\\le_m\\) reduction, \\(\\le_T\\) may query repeatedly and negate/combine answers — strictly more general, witnessed by \\(\\overline{A_{TM}}\\le_T A_{TM}\\) with \\(\\overline{A_{TM}}\\not\\le_m A_{TM}\\).",
    whyMatters: "Turing reducibility is the \"right\" everyday notion of *\"I can solve A if I'm handed a solver for B,\"* and it's how the hardness of undecidable problems is ranked (the arithmetical hierarchy) when plain \\(\\le_m\\) is too rigid.",
    realWorld: "It's exactly the engineering reality of **calling a library/API**: your code decides its own question by making (possibly many) calls to a service it treats as a black box — and post-processing the replies — without caring how that service is implemented.",
    source: "Sipser §6.3 (Def 6.18, 6.20; Thm 6.21 discussion)"
  },

  /* ===================== Visual questions (each carries a diagram/svg) ===================== */

  /* DFA trace — "ends in 0" reachability */
  {
    id: "ch1-vis-trace-parity0", chapter: 1, topic: "DFA computation", type: "mc", difficulty: 2,
    prompt: "Trace this DFA on the input string \\(1011\\), starting at the start state \\(q_0\\). In which state does it finish, and is the string **accepted**?",
    diagram: { width: 460, height: 170, states: [
      { id: "q0", x: 110, y: 85, start: true },
      { id: "q1", x: 330, y: 85, accept: true }
    ], edges: [
      { from: "q0", to: "q1", label: "0", bend: 40 },
      { from: "q1", to: "q0", label: "1", bend: 40 },
      { from: "q0", to: "q0", label: "1", loop: "up" },
      { from: "q1", to: "q1", label: "0", loop: "up" }
    ] },
    choices: [
      "Ends in \\(q_0\\); **rejected** (only \\(q_1\\) accepts)",
      "Ends in \\(q_1\\); accepted",
      "Ends in \\(q_0\\); accepted",
      "It gets stuck (no transition) and rejects"
    ],
    answer: 0,
    explanation: "Reading \\(1011\\) from \\(q_0\\): on \\(1\\) stay at \\(q_0\\); on \\(0\\) go to \\(q_1\\); on \\(1\\) go to \\(q_0\\); on \\(1\\) stay at \\(q_0\\). It ends in \\(q_0\\), which is **not** accepting. This DFA accepts exactly the strings ending in \\(0\\) (it is in \\(q_1\\) iff the last symbol read was \\(0\\)).",
    source: "Sipser §1.1 (DFA computation)"
  },

  /* DFA membership (multi) — which strings are accepted */
  {
    id: "ch1-vis-accept-set-ends0", chapter: 1, topic: "DFA computation", type: "multi", difficulty: 2,
    prompt: "The DFA below accepts a string exactly when it finishes in the accepting state \\(q_1\\). Select **every** string this machine accepts.",
    diagram: { width: 460, height: 170, states: [
      { id: "q0", x: 110, y: 85, start: true },
      { id: "q1", x: 330, y: 85, accept: true }
    ], edges: [
      { from: "q0", to: "q1", label: "0", bend: 40 },
      { from: "q1", to: "q0", label: "1", bend: 40 },
      { from: "q0", to: "q0", label: "1", loop: "up" },
      { from: "q1", to: "q1", label: "0", loop: "up" }
    ] },
    choices: [
      "\\(10\\)",
      "\\(0\\)",
      "\\(11\\)",
      "\\(110\\)",
      "\\(\\varepsilon\\) (the empty string)"
    ],
    answers: [0, 1, 3],
    explanation: "This DFA is in \\(q_1\\) exactly when the **last symbol read was \\(0\\)**, so it accepts precisely the strings ending in \\(0\\): \\(10\\), \\(0\\), and \\(110\\) end in \\(0\\) (accepted); \\(11\\) ends in \\(1\\) and \\(\\varepsilon\\) has no last symbol (both start/stay in non-accepting \\(q_0\\)), so both are rejected.",
    source: "Sipser §1.1 (language of a DFA)"
  },

  /* NFA -> DFA subset construction, one step */
  {
    id: "ch1-vis-subset-step", chapter: 1, topic: "NFA to DFA", type: "mc", difficulty: 2,
    prompt: "Consider this NFA over \\(\\Sigma=\\{0,1\\}\\) (note the **two** \\(0\\)-edges out of \\(q_0\\)). In the subset construction, the DFA start state is \\(\\{q_0\\}\\). Which set of NFA states is reached after reading a single \\(0\\)?",
    diagram: { width: 480, height: 170, states: [
      { id: "q0", x: 95, y: 85, start: true },
      { id: "q1", x: 290, y: 85 },
      { id: "q2", x: 410, y: 85, accept: true }
    ], edges: [
      { from: "q0", to: "q0", label: "0,1", loop: "up" },
      { from: "q0", to: "q1", label: "0" },
      { from: "q1", to: "q2", label: "1" }
    ] },
    choices: [
      "\\(\\{q_0, q_1\\}\\)",
      "\\(\\{q_1\\}\\)",
      "\\(\\{q_0\\}\\)",
      "\\(\\{q_0, q_1, q_2\\}\\)"
    ],
    answer: 0,
    explanation: "From \\(q_0\\) on input \\(0\\) the NFA can go to \\(q_0\\) (the self-loop) **or** to \\(q_1\\) (the second \\(0\\)-edge). The subset-construction successor is the **union** of all reachable states: \\(\\{q_0,q_1\\}\\). (There are no \\(\\varepsilon\\)-edges here, so no extra closure is needed.)",
    source: "Sipser Thm 1.39 (subset construction)"
  },

  /* 2-state NFA with epsilon */
  {
    id: "ch1-vis-epsilon-nfa-accepts-empty", chapter: 1, topic: "Nondeterminism", type: "tf",
    prompt: "In the NFA below, the only edge out of the start state \\(q_0\\) is an \\(\\varepsilon\\)-transition to the accepting state \\(q_1\\). **True or false:** this NFA accepts the empty string \\(\\varepsilon\\).",
    diagram: { width: 440, height: 150, states: [
      { id: "q0", x: 120, y: 80, start: true },
      { id: "q1", x: 300, y: 80, accept: true }
    ], edges: [
      { from: "q0", to: "q1", label: "ε" },
      { from: "q1", to: "q1", label: "0,1", loop: "up" }
    ] },
    answer: true,
    explanation: "An NFA accepts a string if **some** computation branch ends in an accepting state. On input \\(\\varepsilon\\) the machine may take the \\(\\varepsilon\\)-edge \\(q_0\\to q_1\\) without consuming any input and land in accepting \\(q_1\\). So \\(\\varepsilon\\) is accepted. (Via the \\(\\varepsilon\\)-closure, the start state's closure already contains the accept state.)",
    source: "Sipser §1.2 (NFAs with \\(\\varepsilon\\)-moves)"
  },

  /* Nondeterminism: a single 0 can lead to two states */
  {
    id: "ch1-vis-nondeterminism-branch", chapter: 1, topic: "Nondeterminism", type: "mc", difficulty: 2,
    prompt: "Look at state \\(q_0\\) in this machine: reading the symbol \\(0\\) there can lead to \\(q_0\\) **or** to \\(q_1\\). What does that tell you about the machine?",
    diagram: { width: 470, height: 170, states: [
      { id: "q0", x: 105, y: 85, start: true },
      { id: "q1", x: 300, y: 85 },
      { id: "q2", x: 415, y: 85, accept: true }
    ], edges: [
      { from: "q0", to: "q0", label: "0,1", loop: "up" },
      { from: "q0", to: "q1", label: "0" },
      { from: "q1", to: "q2", label: "1" }
    ] },
    choices: [
      "It is an **NFA**: a state may have several (or zero) transitions on the same symbol",
      "It is a DFA, since every DFA allows multiple transitions per symbol",
      "It is invalid — no machine may have two edges with the same label from one state",
      "It is a PDA, because branching requires a stack"
    ],
    answer: 0,
    explanation: "Having two \\(0\\)-transitions out of \\(q_0\\) is the defining feature of **nondeterminism**: an NFA's transition function maps a state and symbol to a **set** of states (here \\(\\{q_0,q_1\\}\\)). A DFA requires *exactly one* transition per (state, symbol). The machine accepts if *any* branch reaches \\(q_2\\) — informally, strings with a \\(0\\) that is immediately followed by a \\(1\\).",
    source: "Sipser Def 1.37 (nondeterministic finite automaton)"
  },

  /* PDA-style idea: balanced parens need a stack, shown via SVG counter sketch */
  {
    id: "ch2-vis-pda-stack-balanced", chapter: 2, topic: "Pushdown automata", type: "mc", difficulty: 2,
    prompt: "A PDA checks balanced parentheses by **pushing** on every `(` and **popping** on every `)`. The sketch shows the stack height while scanning `( ( ) ( ) )` left to right. For the string to be balanced, what must be true of the stack at the points marked?",
    svg: '<svg viewBox="0 0 480 200" xmlns="http://www.w3.org/2000/svg" font-family="Georgia, \'Times New Roman\', serif"><line x1="40" y1="160" x2="450" y2="160" stroke="var(--ink-soft)" stroke-width="1.5"/><line x1="40" y1="40" x2="40" y2="160" stroke="var(--ink-soft)" stroke-width="1.5"/><text x="20" y="46" font-size="11" fill="var(--ink-soft)">height</text><g stroke="var(--brand)" stroke-width="2.5" fill="none"><polyline points="40,140 100,100 160,60 220,100 280,60 340,100 400,140"/></g><g fill="var(--brand)"><circle cx="40" cy="140" r="3.5"/><circle cx="100" cy="100" r="3.5"/><circle cx="160" cy="60" r="3.5"/><circle cx="220" cy="100" r="3.5"/><circle cx="280" cy="60" r="3.5"/><circle cx="340" cy="100" r="3.5"/><circle cx="400" cy="140" r="3.5"/></g><g font-size="13" fill="var(--ink)" text-anchor="middle"><text x="70" y="178">(</text><text x="130" y="178">(</text><text x="190" y="178">)</text><text x="250" y="178">(</text><text x="310" y="178">)</text><text x="370" y="178">)</text></g><text x="400" y="135" font-size="11" font-weight="700" fill="var(--good)" text-anchor="middle">end</text><line x1="40" y1="140" x2="408" y2="140" stroke="var(--ink-soft)" stroke-width="1" stroke-dasharray="3 3"/><text x="430" y="143" font-size="10" fill="var(--ink-soft)">start level</text></svg>',
    choices: [
      "It must **never** drop below the start level mid-scan, and must return **exactly** to the start level at the end",
      "It only needs to end above the start level",
      "It must reach height 0 after every symbol",
      "The maximum height must equal the string's length"
    ],
    answer: 0,
    explanation: "Popping when the stack is already at the start level means a `)` with no matching `(` — so the height must **never dip below** where it began. Ending **back at** the start level means every `(` was matched by a `)`. The string `(()())` satisfies both, so it is balanced. This empty-at-end, never-negative condition is exactly what the PDA's stack enforces, and what a DFA's finite memory cannot.",
    source: "Sipser §2.2 (PDAs; balanced-parentheses CFL)"
  }

]);
