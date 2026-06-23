/* Chapter 2 — VERY BEGINNER definitions/explainers (Sipser 2.1–2.4).
   The first questions a learner sees: plain language, one idea each, rank 0.
   Covers CFG and its parts, derivations, parse trees, ambiguity, Chomsky
   normal form, PDAs and the stack, CFLs, regular ⊆ context-free, the CFL
   pumping lemma in plain words, and a non-context-free example. */
TOC.addQuestions([
  // ---- What is a CFG ----
  {
    id: "ch2-basic-cfg-what", chapter: 2, rank: 0, topic: "CFG basics", type: "mc",
    prompt: "What is a **context-free grammar (CFG)**?",
    choices: [
      "A set of rules for building strings by repeatedly replacing symbols",
      "A machine with a finite number of states and nothing else",
      "A list of all the strings in a language",
      "A drawing of a computer's memory"
    ],
    answer: 0,
    explanation: "A CFG is a collection of replacement rules. You start with one symbol and keep swapping symbols for other symbols until you have a finished string. It builds (generates) strings.",
    source: "Sipser §2.1 (Def 2.2)"
  },
  {
    id: "ch2-basic-cfg-generates-tf", chapter: 2, rank: 0, topic: "CFG basics", type: "tf",
    prompt: "A grammar is used to **build** (generate) strings, step by step.",
    answer: true,
    explanation: "Grammars generate strings: you begin with the start symbol and apply rules to grow the string. (A machine instead reads a finished string and decides yes or no.)",
    source: "Sipser §2.1"
  },

  // ---- Variable / nonterminal ----
  {
    id: "ch2-basic-variable-what", chapter: 2, rank: 0, topic: "CFG basics", type: "mc",
    prompt: "In a grammar, a **variable** (also called a nonterminal) is:",
    choices: [
      "A placeholder symbol that still needs to be replaced using a rule",
      "A symbol that appears in the final string and is never replaced",
      "The number of rules in the grammar",
      "A state of a machine"
    ],
    answer: 0,
    explanation: "A variable is a temporary placeholder. It is not part of the finished string — you must use a rule to replace it. Variables are usually written as capital letters like \\(A\\) or \\(S\\).",
    source: "Sipser §2.1 (Def 2.2)"
  },
  {
    id: "ch2-basic-variable-fib", chapter: 2, rank: 0, topic: "CFG basics", type: "fib",
    prompt: "Another name for a variable in a grammar (a symbol that still gets replaced) is a ____.",
    accept: ["nonterminal", "non-terminal", "non terminal"],
    explanation: "Variable and nonterminal mean the same thing: a placeholder symbol that a rule will replace. The opposite is a terminal.",
    source: "Sipser §2.1 (Def 2.2)"
  },

  // ---- Terminal ----
  {
    id: "ch2-basic-terminal-what", chapter: 2, rank: 0, topic: "CFG basics", type: "mc",
    prompt: "In a grammar, a **terminal** is:",
    choices: [
      "A symbol that appears in the finished string and is never replaced",
      "A placeholder that still must be replaced",
      "The first rule in the grammar",
      "A symbol that ends every rule"
    ],
    answer: 0,
    explanation: "A terminal is a real letter of the final string, like \\(0\\), \\(1\\), or \\(a\\). Once a terminal is in the string it stays — no rule replaces it. Terminals are the alphabet of the language.",
    source: "Sipser §2.1 (Def 2.2)"
  },
  {
    id: "ch2-basic-terminal-vs-variable-tf", chapter: 2, rank: 0, topic: "CFG basics", type: "tf",
    prompt: "A finished string (one the grammar has produced) contains only terminals, with no variables left.",
    answer: true,
    explanation: "You keep replacing variables until none are left. When only terminals remain, the string is done. If a variable is still there, you are not finished.",
    source: "Sipser §2.1 (Def 2.2)"
  },

  // ---- Rule / production ----
  {
    id: "ch2-basic-rule-what", chapter: 2, rank: 0, topic: "CFG basics", type: "mc",
    prompt: "A **rule** (production) such as \\(A\\to 0A1\\) means:",
    choices: [
      "Wherever you see the variable \\(A\\), you may replace it with \\(0A1\\)",
      "\\(A\\) equals the number \\(0A1\\)",
      "\\(A\\) is an accept state",
      "Delete \\(A\\) from the string"
    ],
    answer: 0,
    explanation: "A rule \\(A\\to 0A1\\) is permission to swap: any \\(A\\) can become \\(0A1\\). The left side is always a single variable; the right side is any mix of variables and terminals.",
    source: "Sipser §2.1 (Def 2.2)"
  },
  {
    id: "ch2-basic-rule-leftside-tf", chapter: 2, rank: 0, topic: "CFG basics", type: "tf",
    prompt: "In a context-free grammar, the left side of every rule is exactly one variable.",
    answer: true,
    explanation: "That single-variable left side is what \"context-free\" means: you can replace the variable no matter what is around it. The right side may be any string of variables and terminals.",
    source: "Sipser §2.1 (Def 2.2)"
  },
  {
    id: "ch2-basic-rule-bar-fib", chapter: 2, rank: 0, topic: "CFG basics", type: "fib",
    prompt: "In \\(A\\to 0A1 \\mid \\varepsilon\\), the bar symbol \\(\\mid\\) is just a shorthand for the word ____.",
    accept: ["or", "\"or\""],
    explanation: "The bar \\(\\mid\\) means \"or.\" So \\(A\\to 0A1\\mid\\varepsilon\\) is two choices for \\(A\\): become \\(0A1\\), or become the empty string \\(\\varepsilon\\).",
    source: "Sipser §2.1"
  },

  // ---- Start variable ----
  {
    id: "ch2-basic-start-what", chapter: 2, rank: 0, topic: "CFG basics", type: "mc",
    prompt: "The **start variable** of a grammar is:",
    choices: [
      "The variable you begin every derivation from",
      "The first terminal in the alphabet",
      "The last rule listed",
      "A variable that has no rules"
    ],
    answer: 0,
    explanation: "Every derivation begins at the start variable (often called \\(S\\)). Building a string always starts there and then follows the rules.",
    source: "Sipser §2.1 (Def 2.2)"
  },

  // ---- Derivation ----
  {
    id: "ch2-basic-derivation-what", chapter: 2, rank: 0, topic: "Derivations", type: "mc",
    prompt: "A **derivation** is:",
    choices: [
      "The sequence of steps that builds a string by applying rules one at a time",
      "A list of all the variables in the grammar",
      "A proof that a language is regular",
      "The number of terminals in a string"
    ],
    answer: 0,
    explanation: "A derivation is the play-by-play: start at the start variable, then show each replacement until you reach a finished string of terminals.",
    source: "Sipser §2.1 (Def 2.2)"
  },
  {
    id: "ch2-basic-derivation-single-arrow-mc", chapter: 2, rank: 0, topic: "Derivations", type: "mc",
    prompt: "What does the single arrow \\(\\Rightarrow\\) mean in a derivation?",
    choices: [
      "\"becomes, in one rule step\"",
      "\"is a subset of\"",
      "\"is equal to\"",
      "\"is not regular\""
    ],
    answer: 0,
    explanation: "\\(\\Rightarrow\\) marks one step: the left becomes the right by applying a single rule. For example \\(0A1\\Rightarrow 00A11\\) used the rule \\(A\\to 0A1\\) once.",
    source: "Sipser §2.1 (Def 2.2)"
  },
  {
    id: "ch2-basic-derivation-star-arrow-mc", chapter: 2, rank: 0, topic: "Derivations", type: "mc",
    prompt: "What does the starred arrow \\(\\stackrel{*}{\\Rightarrow}\\) mean?",
    choices: [
      "\"becomes, after zero or more rule steps\"",
      "\"becomes, in exactly one step\"",
      "\"can never become\"",
      "\"is the start variable\""
    ],
    answer: 0,
    explanation: "The star means \"in any number of steps\" (including zero). So \\(S\\stackrel{*}{\\Rightarrow}w\\) says you can get from \\(S\\) all the way to the string \\(w\\) by applying rules some number of times.",
    source: "Sipser §2.1 (Def 2.2)"
  },
  {
    id: "ch2-basic-leftmost-what", chapter: 2, rank: 0, topic: "Derivations", type: "mc",
    prompt: "In a **leftmost derivation**, at each step you replace:",
    choices: [
      "The leftmost variable that is still in the string",
      "Any variable you feel like",
      "The rightmost terminal",
      "The start variable again"
    ],
    answer: 0,
    explanation: "A leftmost derivation always expands the left-most remaining variable first. It is just a tidy, fixed order for doing the replacements.",
    source: "Sipser §2.1 (Ambiguity)"
  },

  // ---- Parse tree & yield ----
  {
    id: "ch2-basic-parsetree-what", chapter: 2, rank: 0, topic: "Parse trees", type: "mc",
    prompt: "A **parse tree** is:",
    choices: [
      "A picture of a derivation, showing how each variable branched into its rule's right side",
      "A list of accept states",
      "A stack of symbols",
      "A regular expression"
    ],
    answer: 0,
    explanation: "A parse tree draws the derivation as a tree: the start variable is the root, and every time a rule replaces a variable, that variable's symbols become its children.",
    source: "Sipser §2.1"
  },
  {
    id: "ch2-basic-yield-what", chapter: 2, rank: 0, topic: "Parse trees", type: "mc",
    prompt: "The **yield** of a parse tree is:",
    choices: [
      "The string you read off the leaves, left to right",
      "The number of nodes in the tree",
      "The tallest path in the tree",
      "The root variable"
    ],
    answer: 0,
    explanation: "Read the bottom leaves from left to right and you get the yield — the actual terminal string the tree builds.",
    source: "Sipser §2.1"
  },
  {
    id: "ch2-basic-yield-fib", chapter: 2, rank: 0, topic: "Parse trees", type: "fib",
    prompt: "The terminal string read off the leaves of a parse tree (left to right) is called the tree's ____.",
    accept: ["yield", "the yield"],
    explanation: "The yield is the finished string at the leaves. The tree shows how that string was built.",
    source: "Sipser §2.1"
  },

  // ---- Ambiguity ----
  {
    id: "ch2-basic-ambiguous-what", chapter: 2, rank: 0, topic: "Ambiguity", type: "mc",
    prompt: "A grammar is **ambiguous** when:",
    choices: [
      "Some string can be built with two different parse trees",
      "It has more than one rule",
      "It uses the empty string \\(\\varepsilon\\)",
      "It has more than one variable"
    ],
    answer: 0,
    explanation: "Ambiguous means a single string has two genuinely different parse trees (two different ways to build it). That can make the string's structure unclear.",
    source: "Sipser §2.1 (Def 2.7)"
  },
  {
    id: "ch2-basic-ambiguous-tf", chapter: 2, rank: 0, topic: "Ambiguity", type: "tf",
    prompt: "Having two or more rules for the same variable, by itself, makes a grammar ambiguous.",
    answer: false,
    explanation: "No. Most grammars have several rules per variable and are perfectly fine. Ambiguity is specifically about one string having two different parse trees.",
    source: "Sipser §2.1 (Def 2.7)"
  },

  // ---- Chomsky normal form ----
  {
    id: "ch2-basic-cnf-what", chapter: 2, rank: 0, topic: "Chomsky normal form", type: "mc",
    prompt: "A grammar is in **Chomsky normal form** when every rule has one of these tidy shapes:",
    choices: [
      "A variable goes to two variables, or a variable goes to one terminal",
      "A variable goes to any string at all",
      "Every rule is \\(A\\to aB\\)",
      "There are no rules"
    ],
    answer: 0,
    explanation: "In Chomsky normal form each rule is either \\(A\\to BC\\) (two variables) or \\(A\\to a\\) (one terminal). The only extra allowance is \\(S\\to\\varepsilon\\) so the empty string can still be made.",
    source: "Sipser §2.1 (Def 2.8)"
  },
  {
    id: "ch2-basic-cnf-tf", chapter: 2, rank: 0, topic: "Chomsky normal form", type: "tf",
    prompt: "Every context-free grammar can be rewritten into Chomsky normal form that generates the same language.",
    answer: true,
    explanation: "Yes. There is a step-by-step procedure to convert any CFG into Chomsky normal form without changing which strings it builds. The tidy shape is handy for proofs and algorithms.",
    source: "Sipser §2.1 (Thm 2.9)"
  },

  // ---- PDA & the stack ----
  {
    id: "ch2-basic-pda-what", chapter: 2, rank: 0, topic: "Pushdown automata", type: "mc",
    prompt: "What is a **pushdown automaton (PDA)**?",
    choices: [
      "A finite-state machine with an added stack for extra memory",
      "A grammar written with arrows",
      "A Turing machine with two tapes",
      "A finite-state machine with no memory at all"
    ],
    answer: 0,
    explanation: "A PDA is just an NFA (a finite-state machine) plus a stack it can push onto and pop from. The stack is the extra memory that an ordinary finite-state machine lacks.",
    source: "Sipser §2.2 (Def 2.13)"
  },
  {
    id: "ch2-basic-stack-what", chapter: 2, rank: 0, topic: "Pushdown automata", type: "mc",
    prompt: "A **stack** stores symbols in which order?",
    choices: [
      "Last-in, first-out: you always add to and remove from the top",
      "First-in, first-out: like a line at a store",
      "In sorted order, smallest first",
      "Randomly"
    ],
    answer: 0,
    explanation: "A stack is last-in, first-out (LIFO), like a stack of plates: you push a new symbol on top and you can only pop the top one off. The bottom symbols wait until the ones above are removed.",
    source: "Sipser §2.2"
  },
  {
    id: "ch2-basic-stack-lifo-fib", chapter: 2, rank: 0, topic: "Pushdown automata", type: "fib",
    prompt: "A stack is a \"last-in, first-out\" memory. Its common three-letter abbreviation is ____.",
    accept: ["LIFO", "L.I.F.O.", "lifo"],
    explanation: "LIFO stands for last-in, first-out: the most recently pushed symbol is the first one popped off.",
    source: "Sipser §2.2"
  },
  {
    id: "ch2-basic-stack-why-mc", chapter: 2, rank: 0, topic: "Pushdown automata", type: "mc",
    prompt: "Why does the stack let a PDA recognize a language like \\(\\{0^n1^n\\mid n\\ge 0\\}\\) when a plain finite-state machine cannot?",
    choices: [
      "The PDA can push a symbol for each \\(0\\), then pop one for each \\(1\\) to check the counts match",
      "The stack sorts the input alphabetically",
      "The stack lets the PDA read the input backwards",
      "The stack gives the PDA infinitely many states"
    ],
    answer: 0,
    explanation: "Push one marker per \\(0\\), then pop one per \\(1\\). If the stack empties exactly as the input ends, the counts matched. The stack is the unbounded counter a finite-state machine doesn't have.",
    source: "Sipser §2.2 (Example 2.14)"
  },

  // ---- CFL ----
  {
    id: "ch2-basic-cfl-what", chapter: 2, rank: 0, topic: "Context-free languages", type: "mc",
    prompt: "A **context-free language (CFL)** is:",
    choices: [
      "Any language that some context-free grammar can generate",
      "Any language with finitely many strings",
      "Any language a DFA can recognize",
      "Any language that is not regular"
    ],
    answer: 0,
    explanation: "A language is context-free if at least one CFG builds exactly its strings. The same languages are exactly the ones some pushdown automaton can recognize.",
    source: "Sipser §2.1–2.2"
  },
  {
    id: "ch2-basic-regular-subset-tf", chapter: 2, rank: 0, topic: "Context-free languages", type: "tf",
    prompt: "Every regular language is also context-free.",
    answer: true,
    explanation: "Yes. A finite-state machine is just a PDA that ignores its stack, so anything regular is context-free too. But not the other way around — \\(\\{0^n1^n\\}\\) is context-free and not regular.",
    source: "Sipser §2.1 (Cor 2.32)"
  },

  // ---- Pumping lemma (plain) & non-CFL example ----
  {
    id: "ch2-basic-pumping-what", chapter: 2, rank: 0, topic: "Pumping lemma (CFL)", type: "mc",
    prompt: "In plain words, the **pumping lemma for context-free languages** says:",
    choices: [
      "In any context-free language, every long enough string has two short pieces you can repeat together as many times as you like and stay in the language",
      "Every context-free language is finite",
      "Every long string can be sorted",
      "Context-free languages are closed under intersection"
    ],
    answer: 0,
    explanation: "Long strings in a CFL contain two stretches that can be copied in lock-step (pumped) any number of times, always landing back in the language. If no string can be pumped that way, the language is not context-free.",
    source: "Sipser §2.3 (Thm 2.34)"
  },
  {
    id: "ch2-basic-pumping-use-tf", chapter: 2, rank: 0, topic: "Pumping lemma (CFL)", type: "tf",
    prompt: "The pumping lemma is used to show that a language is **not** context-free.",
    answer: true,
    explanation: "Right. You find a string that cannot be pumped while staying in the language; that contradiction proves the language is not context-free. It is a tool for proving \"not context-free.\"",
    source: "Sipser §2.3 (Thm 2.34)"
  },
  {
    id: "ch2-basic-non-cfl-example-mc", chapter: 2, rank: 0, topic: "Pumping lemma (CFL)", type: "mc",
    prompt: "Which language is a classic example of a language that is **not** context-free?",
    choices: [
      "\\(\\{a^nb^nc^n\\mid n\\ge 0\\}\\) (equal numbers of \\(a\\)'s, \\(b\\)'s, and \\(c\\)'s)",
      "\\(\\{0^n1^n\\mid n\\ge 0\\}\\)",
      "All strings over \\(\\{a,b\\}\\)",
      "\\(\\{a^n\\mid n\\ge 0\\}\\)"
    ],
    answer: 0,
    explanation: "A stack can match two counts (push for \\(a\\), pop for \\(b\\)), but it cannot keep three counts equal at once. So \\(\\{a^nb^nc^n\\}\\) is not context-free, while \\(\\{0^n1^n\\}\\) is.",
    source: "Sipser §2.3 (Example 2.36)"
  }
]);
