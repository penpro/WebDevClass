/* ch8-hands-on.js — hands-on, trace-through questions for Chapter 8 (space
   complexity & games). Three threads, each grounded in Sipser §8.2–8.3:
     (A) Savitch's theorem: the recursive CANYIELD idea drawn as a divide-and-
         conquer recursion TREE (each call splits into two half-t subcalls through
         a guessed midpoint), with questions on recursion DEPTH and why only one
         root-to-leaf path is stored — the source of the f^2 space bound.
     (B) Generalized geography played on drawn directed graphs (`diagram`): does
         Player I or Player II have a winning strategy, and which first move?
         Every winner below was verified by exhaustive game-tree search.
     (C) The TQBF "quantifier game": exists = you choose, forall = the adversary,
         true iff you have a winning strategy — a `discussion` builder.
   Conventions match ch8.js / ch8-defs.js: complexity classes use \\mathrm{...};
   CANYIELD is written \\mathrm{CANYIELD}(c_1,c_2,t); diagram edge labels are PLAIN
   Unicode (no LaTeX); KaTeX in text uses \\( ... \\). Do not modify other files. */
TOC.addQuestions([

  /* ==================================================================== */
  /* (A) SAVITCH — the CANYIELD recursion, as a divide-and-conquer tree    */
  /* ==================================================================== */

  {
    id: "ch8-savitch-canyield-split", chapter: 8, rank: 32, topic: "Savitch's theorem", type: "mc",
    prompt: "**Savitch's recursive procedure.** \\(\\mathrm{CANYIELD}(c_1,c_2,t)\\) answers \"can configuration \\(c_1\\) reach \\(c_2\\) in at most \\(t\\) steps?\" The tree below shows how one call is solved. To decide \\(\\mathrm{CANYIELD}(c_1,c_2,t)\\), the machine tries **every** midpoint configuration \\(c_m\\) and, for each, makes which two recursive calls?",
    diagram: { width: 500, height: 250, states: [
      { id: "root", x: 250, y: 34, label: "c1,c2,t" },
      { id: "L", x: 130, y: 130, label: "c1,cm" },
      { id: "R", x: 370, y: 130, label: "cm,c2" },
      { id: "LL", x: 70, y: 218, label: "c1,x" },
      { id: "LR", x: 190, y: 218, label: "x,cm" },
      { id: "RL", x: 310, y: 218, label: "cm,y" },
      { id: "RR", x: 430, y: 218, label: "y,c2" }
    ], edges: [
      { from: "root", to: "L", label: "t/2" },
      { from: "root", to: "R", label: "t/2" },
      { from: "L", to: "LL", label: "t/4" },
      { from: "L", to: "LR", label: "t/4" },
      { from: "R", to: "RL", label: "t/4" },
      { from: "R", to: "RR", label: "t/4" }
    ] },
    choices: [
      "\\(\\mathrm{CANYIELD}(c_1,c_m,t/2)\\) and \\(\\mathrm{CANYIELD}(c_m,c_2,t/2)\\)",
      "\\(\\mathrm{CANYIELD}(c_1,c_m,t-1)\\) and \\(\\mathrm{CANYIELD}(c_m,c_2,t-1)\\)",
      "\\(\\mathrm{CANYIELD}(c_1,c_m,t)\\) and \\(\\mathrm{CANYIELD}(c_2,c_m,t)\\)",
      "A single call \\(\\mathrm{CANYIELD}(c_1,c_2,t/2)\\)"
    ],
    answer: 0,
    explanation: "A path of length \\(t\\) from \\(c_1\\) to \\(c_2\\) passes through some midpoint \\(c_m\\) reached in \\(t/2\\) steps, with \\(c_m\\) then reaching \\(c_2\\) in \\(t/2\\) steps. So the call splits into the two **half-\\(t\\)** subcalls \\(\\mathrm{CANYIELD}(c_1,c_m,t/2)\\) and \\(\\mathrm{CANYIELD}(c_m,c_2,t/2)\\); it returns yes if some \\(c_m\\) makes both succeed.",
    source: "Sipser §8.2 (Savitch's theorem, CANYIELD)", difficulty: 2
  },

  {
    id: "ch8-savitch-recursion-depth", chapter: 8, rank: 33, topic: "Savitch's theorem", type: "mc",
    prompt: "Each level of the \\(\\mathrm{CANYIELD}\\) recursion **halves** the step budget \\(t\\) (\\(t\\to t/2\\to t/4\\to\\cdots\\)), stopping at \\(t\\le 1\\). If an \\(f(n)\\)-space machine has at most \\(2^{O(f(n))}\\) configurations, the top-level budget is \\(t=2^{O(f(n))}\\). How deep does the recursion go?",
    choices: [
      "\\(O(f(n))\\) levels — since \\(\\log t = \\log 2^{O(f(n))} = O(f(n))\\)",
      "\\(2^{O(f(n))}\\) levels — one per configuration",
      "\\(O(\\log n)\\) levels, independent of \\(f\\)",
      "\\(O(n)\\) levels — one per input symbol"
    ],
    answer: 0,
    explanation: "Halving \\(t\\) each level means the depth is \\(\\log_2 t\\). With \\(t=2^{O(f(n))}\\) that is \\(\\log_2 2^{O(f(n))}=O(f(n))\\). The recursion is only about \\(f(n)\\) levels deep even though \\(t\\) itself is exponential — that shallow depth is the whole point.",
    source: "Sipser §8.2 (Savitch's theorem)", difficulty: 2
  },

  {
    id: "ch8-savitch-one-path-space", chapter: 8, rank: 34, topic: "Savitch's theorem", type: "tf",
    prompt: "In the recursion tree above, the algorithm explores the calls **depth-first**, so at any instant it only stores the configurations along **one root-to-leaf path** (plus the midpoint it is currently trying) — never the whole exponential tree at once.",
    answer: true,
    explanation: "True. Like any recursive procedure, only the current call stack is in memory: one branch from root to leaf. The two subcalls of a node are done one after the other and **reuse the same space**, so the tree's exponential *width* costs time, not space.",
    source: "Sipser §8.2 (Savitch's theorem)", difficulty: 2
  },

  {
    id: "ch8-savitch-why-squares", chapter: 8, rank: 34, topic: "Savitch's theorem", type: "mc",
    prompt: "**Why Savitch squares the space.** The stored path has \\(O(f(n))\\) stack frames (the depth), and each frame must record configurations \\(c_1,c_2,c_m\\), each of which is \\(O(f(n))\\) symbols long. Multiplying these gives the total space. What is it?",
    choices: [
      "\\(O(f(n))\\times O(f(n)) = O(f^2(n))\\)",
      "\\(O(f(n)) + O(f(n)) = O(f(n))\\)",
      "\\(2^{O(f(n))}\\)",
      "\\(O(\\log f(n))\\)"
    ],
    answer: 0,
    explanation: "Depth \\(O(f(n))\\) frames, each holding \\(O(f(n))\\)-size configurations, gives \\(O(f(n))\\cdot O(f(n)) = O(f^2(n))\\) space. That is exactly \\(\\mathrm{NSPACE}(f)\\subseteq\\mathrm{SPACE}(f^2)\\): removing nondeterminism costs only a **squaring**, not the exponential blow-up you would get by writing the whole path/tableau down at once.",
    source: "Sipser Thm 8.5 (Savitch)", difficulty: 3
  },

  {
    id: "ch8-savitch-canyield-order", chapter: 8, rank: 33, topic: "Savitch's theorem", type: "order",
    prompt: "Put the steps of a single call \\(\\mathrm{CANYIELD}(c_1,c_2,t)\\) (with \\(t>1\\)) in the order the procedure performs them.",
    items: [
      "If \\(t=1\\): accept iff \\(c_1=c_2\\) or \\(c_1\\) yields \\(c_2\\) in one step (base case)",
      "Otherwise, loop over every configuration \\(c_m\\) that uses \\(\\le f(n)\\) space",
      "Recursively test \\(\\mathrm{CANYIELD}(c_1,c_m,t/2)\\)",
      "If it succeeded, recursively test \\(\\mathrm{CANYIELD}(c_m,c_2,t/2)\\)",
      "If both succeeded for this \\(c_m\\), accept; if no \\(c_m\\) works, reject"
    ],
    explanation: "Sipser's \\(\\mathrm{CANYIELD}\\): handle the \\(t=1\\) base case, then for each candidate midpoint \\(c_m\\) check the first half and, if it holds, the second half — accepting as soon as some \\(c_m\\) links \\(c_1\\) to \\(c_2\\). Crucially the two recursive tests are done in sequence in the **same** space.",
    source: "Sipser §8.2 (Savitch's theorem)", difficulty: 2
  },

  {
    id: "ch8-savitch-config-count-fib", chapter: 8, rank: 32, topic: "Savitch's theorem", type: "fib",
    prompt: "To be sure a real path is never missed, the top-level call sets the step budget \\(t\\) to (an upper bound on) the total number of configurations of an \\(f(n)\\)-space machine. As an expression in \\(f(n)\\), that number of configurations is \\(t = \\) ____.  (Write it as a power of 2, e.g. `2^{O(f(n))}`.)",
    accept: ["2^{O(f(n))}", "2^{O(f)}", "2^(O(f(n)))", "2^{O(f(n)}", "2^O(f(n))", "2^{cf(n)}", "2^{O(f (n))}"],
    acceptRegex: "^\\s*2\\s*\\^\\s*\\{?\\s*(c|O\\s*\\(?)\\s*f\\b",
    explanation: "A configuration is a state, head position, and tape contents over \\(O(f(n))\\) cells, so there are \\(2^{O(f(n))}\\) of them. If \\(c_1\\) can reach \\(c_2\\) at all, it does so within that many steps — so \\(t=2^{O(f(n))}\\) loses nothing, and \\(\\log t=O(f(n))\\) sets the recursion depth.",
    source: "Sipser §8.2 (configuration counting)", difficulty: 2
  },

  {
    id: "ch8-savitch-facts-multi", chapter: 8, rank: 34, topic: "Savitch's theorem", type: "multi",
    prompt: "Select **all** true statements about Savitch's algorithm as drawn in the recursion tree.",
    choices: [
      "The recursion depth is \\(O(f(n))\\), so the call stack holds \\(O(f(n))\\) frames.",
      "Its running **time** can be exponential even though its space is \\(O(f^2(n))\\).",
      "It yields \\(\\mathrm{NSPACE}(f)\\subseteq\\mathrm{SPACE}(f^2)\\), hence \\(\\mathrm{PSPACE}=\\mathrm{NPSPACE}\\).",
      "It stores the entire recursion tree in memory simultaneously.",
      "It needs the machine to be deterministic to even start (it cannot simulate a nondeterministic machine)."
    ],
    answers: [0, 1, 2],
    explanation: "Depth \\(O(f)\\) with \\(O(f)\\)-size frames gives \\(O(f^2)\\) space (true), while trying all midpoints at every level costs exponential **time** (true), and the space bound gives \\(\\mathrm{NSPACE}(f)\\subseteq\\mathrm{SPACE}(f^2)\\) and \\(\\mathrm{PSPACE}=\\mathrm{NPSPACE}\\) (true). It does **not** store the whole tree (only one path), and its very purpose is to determinize a nondeterministic space-\\(f\\) machine.",
    source: "Sipser Thm 8.5 / Cor 8.6", difficulty: 3
  },

  /* ==================================================================== */
  /* (B) GENERALIZED GEOGRAPHY — winning strategies on drawn graphs        */
  /*     Rules restated in every prompt; winners verified by search.       */
  /* ==================================================================== */

  {
    id: "ch8-gg-rules-tf", chapter: 8, rank: 33, topic: "PSPACE-completeness", type: "tf",
    prompt: "**Generalized geography, the rules.** Players alternate sliding a single token along a directed edge to a node that has **not** been visited yet; a player who cannot move (no outgoing edge leads to an unvisited node) **loses**; Player I moves first. True or false: a node may therefore be visited **at most once** during a play, so every play is a *simple* path in the graph.",
    answer: true,
    explanation: "True. \"Move to an unvisited node\" forbids revisiting, so the sequence of nodes is a simple path. Since a simple path in a finite graph has bounded length, every play must end — and the player stuck without a legal move loses.",
    source: "Sipser §8.3 (generalized geography)", difficulty: 1
  },

  {
    id: "ch8-gg-graph-a-winner", chapter: 8, rank: 35, topic: "PSPACE-completeness", type: "mc",
    prompt: "**Graph A.** Play generalized geography from start node \\(1\\) (slide to an unvisited node; stuck = lose; Player I first). Who has a winning strategy, and with which first move?",
    diagram: { width: 460, height: 230, states: [
      { id: "1", x: 60, y: 115, start: true, label: "1" },
      { id: "2", x: 175, y: 45, label: "2" },
      { id: "3", x: 175, y: 185, label: "3" },
      { id: "4", x: 300, y: 45, label: "4" },
      { id: "5", x: 300, y: 185, label: "5" },
      { id: "6", x: 415, y: 115, label: "6" }
    ], edges: [
      { from: "1", to: "2" },
      { from: "1", to: "3" },
      { from: "2", to: "4" },
      { from: "4", to: "3", bend: 30 },
      { from: "3", to: "5" },
      { from: "5", to: "6" },
      { from: "6", to: "4", bend: 40 }
    ] },
    choices: [
      "**Player I** wins — the winning first move is \\(1\\to 2\\).",
      "**Player I** wins — the winning first move is \\(1\\to 3\\).",
      "**Player II** wins no matter what Player I does.",
      "The game can go on forever, so nobody wins."
    ],
    answer: 0,
    explanation: "Player I wins by \\(1\\to2\\): then \\(2\\to4\\) (forced), \\(4\\to3\\) (forced), \\(3\\to5\\), \\(5\\to6\\), and now Player II is at \\(6\\) whose only edge \\(6\\to4\\) is visited — Player II is stuck. The other option \\(1\\to3\\) **loses**: \\(3\\to5,\\,5\\to6,\\,6\\to4\\), and Player I is stuck at \\(4\\) (edge \\(4\\to3\\) visited). Only a *simple*-path analysis (each node once) gives the right answer.",
    source: "Sipser §8.3 (generalized geography); winner verified by exhaustive search", difficulty: 3
  },

  {
    id: "ch8-gg-graph-b-winner", chapter: 8, rank: 36, topic: "PSPACE-completeness", type: "mc",
    prompt: "**Graph B.** Same rules, start node \\(1\\). Note the \"diamond\" \\(1\\to\\{2,3\\}\\to4\\) feeding a two-node tail \\(4\\to5\\to6\\). Who has a winning strategy?",
    diagram: { width: 470, height: 210, states: [
      { id: "1", x: 55, y: 100, start: true, label: "1" },
      { id: "2", x: 165, y: 40, label: "2" },
      { id: "3", x: 165, y: 160, label: "3" },
      { id: "4", x: 270, y: 100, label: "4" },
      { id: "5", x: 370, y: 100, label: "5" },
      { id: "6", x: 445, y: 100, label: "6" }
    ], edges: [
      { from: "1", to: "2" },
      { from: "1", to: "3" },
      { from: "2", to: "4" },
      { from: "3", to: "4" },
      { from: "4", to: "5" },
      { from: "5", to: "6" }
    ] },
    choices: [
      "**Player II** wins — whatever Player I does, Player II moves the token into node \\(4\\).",
      "**Player I** wins with \\(1\\to 2\\).",
      "**Player I** wins with \\(1\\to 3\\).",
      "The first player is always forced to lose in every geography graph."
    ],
    answer: 0,
    explanation: "Player II wins. If Player I plays \\(1\\to2\\), Player II replies \\(2\\to4\\); if \\(1\\to3\\), then \\(3\\to4\\). Either way Player II lands the token on \\(4\\), Player I must go \\(4\\to5\\), Player II plays \\(5\\to6\\), and Player I is stuck at \\(6\\). The whole play uses \\(4\\) moves, so the **second** player makes the last one — the tail \\(4\\to5\\to6\\) has even length, handing Player II the win.",
    source: "Sipser §8.3 (generalized geography); winner verified by exhaustive search", difficulty: 3
  },

  {
    id: "ch8-gg-graph-c-firstmove", chapter: 8, rank: 36, topic: "PSPACE-completeness", type: "mc",
    prompt: "**Graph C.** Same rules, start node \\(s\\). Player I *does* have a winning strategy here — but only one first move secures it. Which first move **wins** for Player I?",
    diagram: { width: 470, height: 210, states: [
      { id: "s", x: 60, y: 100, start: true, label: "s" },
      { id: "a", x: 175, y: 40, label: "a" },
      { id: "b", x: 175, y: 160, label: "b" },
      { id: "c", x: 290, y: 40, label: "c" },
      { id: "d", x: 320, y: 150, label: "d" },
      { id: "e", x: 430, y: 150, label: "e" }
    ], edges: [
      { from: "s", to: "a" },
      { from: "s", to: "b" },
      { from: "a", to: "c" },
      { from: "c", to: "s", bend: 38 },
      { from: "c", to: "d" },
      { from: "b", to: "d" },
      { from: "d", to: "e" }
    ] },
    choices: [
      "\\(s\\to b\\) — then \\(b\\to d,\\ d\\to e\\) and Player II is stuck.",
      "\\(s\\to a\\) — the edge \\(c\\to s\\) lets Player I loop back and win.",
      "Either first move wins.",
      "Neither wins; Player II wins this graph."
    ],
    answer: 0,
    explanation: "\\(s\\to b\\) wins: Player II must play \\(b\\to d\\), then Player I plays \\(d\\to e\\), and Player II is stuck at \\(e\\). The tempting \\(s\\to a\\) **loses**: after \\(a\\to c\\), the edge \\(c\\to s\\) is *useless* because \\(s\\) is already visited, so Player II plays \\(c\\to d\\), Player I \\(d\\to e\\), and now **Player I** is stuck. The revisit ban is exactly what defeats the \\(c\\to s\\) \"escape.\"",
    source: "Sipser §8.3 (generalized geography); winner verified by exhaustive search", difficulty: 3
  },

  {
    id: "ch8-gg-in-pspace", chapter: 8, rank: 34, topic: "PSPACE", type: "mc",
    prompt: "Why is deciding the winner of generalized geography in \\(\\mathrm{PSPACE}\\)?",
    choices: [
      "A recursive routine evaluates the game tree depth-first, storing only the current path (a simple path, so \\(\\le\\) the number of nodes) — polynomial space.",
      "The game tree has only polynomially many nodes total.",
      "Every geography graph can be solved greedily in polynomial time without recursion.",
      "It cannot be — deciding geography needs exponential space."
    ],
    answer: 0,
    explanation: "Mark a node a Player-I win if some move leads to a position that is a loss for the opponent, and recurse. Explored depth-first, the algorithm holds only the current root-to-leaf path, which is a **simple path** of length \\(\\le|V|\\) — polynomial space (exponential time). In fact \\(GG\\) is \\(\\mathrm{PSPACE}\\)-**complete**.",
    source: "Sipser §8.3 (GG is PSPACE-complete)", difficulty: 2
  },

  /* ==================================================================== */
  /* (C) THE TQBF QUANTIFIER GAME — exists = you, forall = adversary        */
  /* ==================================================================== */

  {
    id: "ch8-tqbf-exists-you-tf", chapter: 8, rank: 34, topic: "PSPACE-completeness", type: "tf",
    prompt: "**The quantifier game.** Read a fully quantified formula left to right as a game: at \\(\\exists x_i\\) **you** pick \\(x_i\\in\\{0,1\\}\\); at \\(\\forall x_i\\) the **adversary** picks; after all variables are set, you win iff the quantifier-free part is true. True or false: the formula is a **true** quantified Boolean formula exactly when **you** have a winning strategy in this game.",
    answer: true,
    explanation: "True. \\(\\exists x\\,\\psi\\) means \"there is a choice of \\(x\\) making \\(\\psi\\) true\" — a move you get to pick — and \\(\\forall x\\,\\psi\\) means \"for every adversary choice \\(\\psi\\) stays true.\" A winning strategy for you is precisely a way to satisfy the formula against all opposition, so \\(\\mathrm{TQBF}=\\{\\text{formulas where you win}\\}=FORMULA\\text{-}GAME\\).",
    source: "Sipser §8.3 (TQBF, FORMULA-GAME)", difficulty: 2
  },

  {
    id: "ch8-tqbf-quantifier-game", chapter: 8, rank: 36, topic: "PSPACE-completeness", type: "discussion",
    prompt: "**Is a quantified formula true? Play it as a game.** Reading \\(\\exists x\\,\\forall y\\,\\exists z\\,[\\dots]\\) left to right, an \\(\\exists\\) is a move **you** make and a \\(\\forall\\) is a move your **adversary** makes; you win iff the inner formula ends up true. The formula is *true* exactly when **you have a winning strategy**. Let's play a small one.",
    diagram: { width: 470, height: 210, states: [
      { id: "r", x: 60, y: 100, start: true, label: "∃x" },
      { id: "x0", x: 200, y: 45, label: "x=0" },
      { id: "x1", x: 200, y: 155, label: "x=1" },
      { id: "y0", x: 340, y: 30, label: "y=0" },
      { id: "y1", x: 340, y: 90, label: "y=1" },
      { id: "z0", x: 340, y: 150, label: "y=0" },
      { id: "z1", x: 340, y: 195, label: "y=1" }
    ], edges: [
      { from: "r", to: "x0", label: "you" },
      { from: "r", to: "x1", label: "you" },
      { from: "x0", to: "y0", label: "adv" },
      { from: "x0", to: "y1", label: "adv" },
      { from: "x1", to: "z0", label: "adv" },
      { from: "x1", to: "z1", label: "adv" }
    ] },
    steps: [
      { prompt: "Take \\(\\phi=\\exists x\\,\\forall y\\,[(x\\vee y)\\wedge(x\\vee\\neg y)]\\). You move first (choose \\(x\\)), then the adversary chooses \\(y\\). If you play \\(x=1\\), what does the adversary's choice of \\(y\\) do to the inner formula \\((x\\vee y)\\wedge(x\\vee\\neg y)\\)?", type: "mc",
        choices: [
          "It stays **true** for both \\(y=0\\) and \\(y=1\\) (each clause already has \\(x=1\\)).",
          "The adversary can pick \\(y\\) to make it false.",
          "It is true only if the adversary also picks \\(y=1\\).",
          "The inner formula is undefined until \\(z\\) is chosen."
        ], answer: 0,
        explain: "With \\(x=1\\), the literal \\(x\\) is true, so \\((x\\vee y)\\) and \\((x\\vee\\neg y)\\) are both true whatever \\(y\\) is. The \\(\\forall y\\) adversary is powerless — so \\(x=1\\) is a **winning first move** for you." },
      { prompt: "Because you have a move (\\(x=1\\)) that wins against **every** adversary reply, is \\(\\phi\\) a true quantified Boolean formula?", type: "tf", answer: true,
        explain: "Yes. \\(\\exists x\\) only needs **one** good choice, and \\(x=1\\) works for all \\(y\\). Having a winning strategy is the definition of the formula being true — so \\(\\langle\\phi\\rangle\\in\\mathrm{TQBF}\\)." },
      { prompt: "Now flip it: \\(\\psi=\\forall x\\,\\exists y\\,[x\\wedge y]\\). The adversary moves first. Can you (choosing \\(y\\)) always make \\(x\\wedge y\\) true?", type: "tf", answer: false,
        explain: "No. The adversary can open with \\(x=0\\); then \\(x\\wedge y\\) is false no matter which \\(y\\) you pick. You have **no** winning strategy, so \\(\\psi\\) is **false** — the leading \\(\\forall\\) lets the adversary sabotage you first." },
      { prompt: "Why does viewing TQBF as this game show it is solvable in **polynomial space** (indeed it is \\(\\mathrm{PSPACE}\\)-complete)?", type: "mc",
        choices: [
          "Evaluate the game tree depth-first, storing only the current assignment along one root-to-leaf branch — one bit per variable, so linear space.",
          "The game tree is small, with only polynomially many leaves.",
          "You can always decide the winner in polynomial time by a greedy rule.",
          "Because every quantified formula is actually in \\(\\mathrm{P}\\)."
        ], answer: 0,
        explain: "The tree has \\(2^{(\\#\\text{vars})}\\) leaves (exponential **time**), but a depth-first evaluation stores only the values along **one branch** — one bit per variable — so it runs in **linear space**. TQBF being both in \\(\\mathrm{PSPACE}\\) and \\(\\mathrm{PSPACE}\\)-hard makes it \\(\\mathrm{PSPACE}\\)-complete." }
    ],
    explanation: "A quantified formula is a two-player game: \\(\\exists\\) = your move, \\(\\forall\\) = the adversary's, and the formula is **true iff you have a winning strategy**. Evaluating that game tree depth-first uses only one branch's worth of memory, so \\(\\mathrm{TQBF}\\in\\mathrm{PSPACE}\\).",
    whyMatters: "This game view is *why* \\(\\mathrm{TQBF}\\) sits at the center of \\(\\mathrm{PSPACE}\\): alternating \\(\\exists/\\forall\\) is exactly \"I move / you move,\" so any bounded two-player game (geography, \\(n\\times n\\) tic-tac-toe, the formula game) reduces to asking whether a quantified formula is true.",
    realWorld: "\"Can I force a win?\" questions — game solvers, adversarial planning, and verifying a controller works against **every** environment move — are all \\(\\exists/\\forall\\) alternation, the essence of \\(\\mathrm{PSPACE}\\)-hard reasoning rather than mere \\(\\mathrm{NP}\\) search.",
    source: "Sipser §8.3 (Thm 8.9, TQBF is PSPACE-complete; FORMULA-GAME)"
  },

  {
    id: "ch8-tqbf-savitch-fold", chapter: 8, rank: 35, topic: "PSPACE-completeness", type: "mc",
    prompt: "In reducing an arbitrary \\(\\mathrm{PSPACE}\\) language to \\(\\mathrm{TQBF}\\), a naive formula \"\\(c_1\\) reaches \\(c_2\\) in \\(t\\) steps\" would be exponentially large because \\(t\\) is exponential. The fix reuses **one** subformula \\(\\phi_{c_1,c_2,t/2}\\) for *both* halves by quantifying over a midpoint \\(c_m\\) and a universally chosen pair. Which earlier idea is this the direct analogue of?",
    choices: [
      "Savitch's \\(\\mathrm{CANYIELD}\\) midpoint recursion — the same halving-through-a-midpoint that squares the space.",
      "The Cook–Levin tableau written out in full, row by row.",
      "The pumping lemma's decomposition \\(s=xyz\\).",
      "Rice's theorem about nontrivial properties."
    ],
    answer: 0,
    explanation: "The \\(\\forall\\)-\"folding\" that lets one subformula stand for both the \\(c_1\\to c_m\\) and \\(c_m\\to c_2\\) halves is exactly **Savitch's midpoint trick** transplanted into logic: halving the step count \\(\\log t=O(f)\\) times keeps the formula polynomial, just as the recursion of depth \\(O(f)\\) keeps the space \\(O(f^2)\\). Both defeat an exponential blow-up by recursing through a guessed midpoint.",
    source: "Sipser §8.3 (Thm 8.9 proof); §8.2 (Savitch)", difficulty: 3
  },

  {
    id: "ch8-bounded-game-pspace", chapter: 8, rank: 35, topic: "PSPACE vs EXPTIME", type: "mc",
    prompt: "Generalized geography and \\(n\\times n\\) tic-tac-toe are in \\(\\mathrm{PSPACE}\\), while generalized chess/checkers/Go are \\(\\mathrm{EXPTIME}\\)-complete. What property of a game decides which side of that line it falls on?",
    choices: [
      "Whether every play must **end within polynomially many moves** (bounded, irreversible progress) — then the game-tree *depth* is polynomial, so depth-first search uses polynomial space.",
      "Whether the game tree has few nodes overall.",
      "Whether the game is played on a square board.",
      "Whether the first player or the second player tends to win."
    ],
    answer: 0,
    explanation: "The stored root-to-leaf path has length equal to the game-tree **depth**. Bounded games (geography visits each node once; tic-tac-toe fills a square each move) have polynomial depth, so the depth-first winner search fits in polynomial space → \\(\\mathrm{PSPACE}\\). Reversible games (chess positions can repeat) can run exponentially long, forcing exponentially deep search → \\(\\mathrm{EXPTIME}\\). Depth, not tree size, is what must be held in memory.",
    source: "Sipser §8.3; Fraenkel–Lichtenstein (n×n chess is EXPTIME-complete)", difficulty: 3
  }

]);
