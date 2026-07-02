/* Chapter 3 — HANDS-ON with Turing machines (Sipser 3.1).
   The FIRST Turing-machine state diagrams in the app: read/trace small TMs,
   step configurations forward, and watch a concrete run on a tape strip.
   Machines used (all faithful to Sipser or verified by simulation):
     - M2, the decider for A = {0^(2^n)} of Example 3.7 / Figure 3.8;
     - APPEND, a 3-state TM that walks to the end of the tape and writes a 1;
     - FLIP, a bit-flipper that complements every bit as it scans right.
   Diagram edge labels are plain Unicode ("0→x,R", "␣→R", "0→L"); ␣ is the
   blank. These are apply/trace items, so most carry rank 40 ("Challenge");
   the pure transition-function tf/fib recall items sit lower on the ramp. */
TOC.addQuestions([
  // ============================================================
  // ====  M2: the {0^(2^n)} decider (Sipser Ex 3.7, Fig 3.8)  ==
  // ============================================================
  {
    id: "ch3-hands-m2-language", chapter: 3, topic: "TM formal definition", type: "mc", rank: 40,
    prompt: "The Turing machine \\(M_2\\) below is Sipser's machine from Example 3.7 (\\(\\Sigma=\\{0\\}\\), tape alphabet \\(\\{0,\\mathtt{x},\\sqcup\\}\\)). It repeatedly sweeps the tape crossing off every other \\(0\\). Which language does it decide?",
    diagram: { width: 620, height: 320, states: [
      { id: "q1", x: 70, y: 165, start: true, label: "q1" },
      { id: "q2", x: 250, y: 165, label: "q2" },
      { id: "q3", x: 430, y: 165, label: "q3" },
      { id: "q5", x: 340, y: 55, label: "q5" },
      { id: "q4", x: 520, y: 275, label: "q4" },
      { id: "qr", x: 70, y: 285, label: "qrej" },
      { id: "qa", x: 250, y: 285, accept: true, label: "qacc" }
    ], edges: [
      { from: "q1", to: "q2", label: "0→␣,R" },
      { from: "q1", to: "qr", label: "␣→R,  x→R" },
      { from: "q2", to: "q3", label: "0→x,R" },
      { from: "q2", to: "q2", label: "x→R", loop: "down" },
      { from: "q2", to: "qa", label: "␣→R" },
      { from: "q3", to: "q5", label: "␣→L", bend: -34 },
      { from: "q3", to: "q4", label: "0→R" },
      { from: "q3", to: "q3", label: "x→R", loop: "up" },
      { from: "q4", to: "q3", label: "0→x,R", bend: 40 },
      { from: "q4", to: "q4", label: "x→R", loop: "down" },
      { from: "q5", to: "q2", label: "␣→R", bend: -34 },
      { from: "q5", to: "q5", label: "0→L,  x→L", loop: "up" }
    ] },
    choices: [
      "\\(A=\\{0^{2^n}\\mid n\\ge 0\\}\\) — strings of \\(0\\)s whose length is a power of \\(2\\)",
      "\\(\\{0^n\\mid n\\ge 0\\}\\) — every string of \\(0\\)s",
      "\\(\\{0^n\\mid n\\text{ is even}\\}\\) — an even number of \\(0\\)s",
      "\\(\\{0^n\\mid n\\text{ is prime}\\}\\) — a prime number of \\(0\\)s"
    ],
    answer: 0,
    explanation: "Each sweep of stage 1 crosses off every other \\(0\\), halving the count. If a sweep ever sees an odd count \\(>1\\) the machine rejects; if it sees exactly one \\(0\\) it accepts. Halving down to exactly \\(1\\) is possible iff the starting length is a power of \\(2\\), so \\(L(M_2)=\\{0^{2^n}\\}\\).",
    source: "Sipser Ex 3.7 / Fig 3.8"
  },
  {
    id: "ch3-hands-m2-q1-role", chapter: 3, topic: "Transition rules", type: "mc", rank: 40,
    prompt: "In \\(M_2\\) above, the only transition out of the start state \\(q_1\\) on a \\(0\\) is \\(\\delta(q_1,0)=(q_2,\\sqcup,R)\\): it writes a blank over the leftmost \\(0\\). Why does the machine do this on its very first move?",
    diagram: { width: 620, height: 320, states: [
      { id: "q1", x: 70, y: 165, start: true, label: "q1" },
      { id: "q2", x: 250, y: 165, label: "q2" },
      { id: "q3", x: 430, y: 165, label: "q3" },
      { id: "q5", x: 340, y: 55, label: "q5" },
      { id: "q4", x: 520, y: 275, label: "q4" },
      { id: "qr", x: 70, y: 285, label: "qrej" },
      { id: "qa", x: 250, y: 285, accept: true, label: "qacc" }
    ], edges: [
      { from: "q1", to: "q2", label: "0→␣,R" },
      { from: "q1", to: "qr", label: "␣→R,  x→R" },
      { from: "q2", to: "q3", label: "0→x,R" },
      { from: "q2", to: "q2", label: "x→R", loop: "down" },
      { from: "q2", to: "qa", label: "␣→R" },
      { from: "q3", to: "q5", label: "␣→L", bend: -34 },
      { from: "q3", to: "q4", label: "0→R" },
      { from: "q3", to: "q3", label: "x→R", loop: "up" },
      { from: "q4", to: "q3", label: "0→x,R", bend: 40 },
      { from: "q4", to: "q4", label: "x→R", loop: "down" },
      { from: "q5", to: "q2", label: "␣→R", bend: -34 },
      { from: "q5", to: "q5", label: "0→L,  x→L", loop: "up" }
    ] },
    choices: [
      "The blank marks the left-hand end of the tape, so later sweeps (via \\(q_5\\)) know where to stop when returning left",
      "It counts the input by deleting one \\(0\\) per pass",
      "It converts the input alphabet into the tape alphabet",
      "It is required by the definition to blank the first cell of every TM"
    ],
    answer: 0,
    explanation: "The tape has no left-end marker of its own. Writing \\(\\sqcup\\) over the leftmost \\(0\\) leaves a landmark: when \\(q_5\\) sweeps left it stops at that blank and hands back to \\(q_2\\) to begin the next pass. Sipser notes he uses a blank (rather than a symbol like \\#) just to keep \\(\\Gamma\\) small.",
    source: "Sipser Ex 3.7"
  },
  {
    id: "ch3-hands-m2-on-00", chapter: 3, topic: "Configurations", type: "mc", rank: 40,
    prompt: "Run \\(M_2\\) (the \\(\\{0^{2^n}\\}\\) machine) on the input \\(00\\). What happens, and why?",
    diagram: { width: 620, height: 320, states: [
      { id: "q1", x: 70, y: 165, start: true, label: "q1" },
      { id: "q2", x: 250, y: 165, label: "q2" },
      { id: "q3", x: 430, y: 165, label: "q3" },
      { id: "q5", x: 340, y: 55, label: "q5" },
      { id: "q4", x: 520, y: 275, label: "q4" },
      { id: "qr", x: 70, y: 285, label: "qrej" },
      { id: "qa", x: 250, y: 285, accept: true, label: "qacc" }
    ], edges: [
      { from: "q1", to: "q2", label: "0→␣,R" },
      { from: "q1", to: "qr", label: "␣→R,  x→R" },
      { from: "q2", to: "q3", label: "0→x,R" },
      { from: "q2", to: "q2", label: "x→R", loop: "down" },
      { from: "q2", to: "qa", label: "␣→R" },
      { from: "q3", to: "q5", label: "␣→L", bend: -34 },
      { from: "q3", to: "q4", label: "0→R" },
      { from: "q3", to: "q3", label: "x→R", loop: "up" },
      { from: "q4", to: "q3", label: "0→x,R", bend: 40 },
      { from: "q4", to: "q4", label: "x→R", loop: "down" },
      { from: "q5", to: "q2", label: "␣→R", bend: -34 },
      { from: "q5", to: "q5", label: "0→L,  x→L", loop: "up" }
    ] },
    choices: [
      "It accepts — \\(2\\) is a power of \\(2\\); one sweep crosses off the 2nd \\(0\\), leaving a single \\(0\\)",
      "It rejects — an even count always fails",
      "It loops forever, never halting",
      "It rejects — only the input \\(0\\) (length \\(1\\)) is accepted"
    ],
    answer: 0,
    explanation: "Since \\(2=2^1\\) is a power of \\(2\\), \\(00\\in A\\) and \\(M_2\\) accepts. The run is \\(q_1 00\\Rightarrow\\sqcup\\,q_2 0\\Rightarrow\\sqcup\\mathtt{x}\\,q_3\\Rightarrow\\sqcup\\,q_5\\mathtt{x}\\Rightarrow q_5\\sqcup\\mathtt{x}\\Rightarrow\\sqcup\\,q_2\\mathtt{x}\\Rightarrow\\sqcup\\mathtt{x}\\,q_2\\Rightarrow\\sqcup\\mathtt{x}\\sqcup\\,q_{accept}\\): the second sweep finds only \\(\\mathtt{x}\\)s then a blank, so it accepts.",
    source: "Sipser Ex 3.7 (sample run mechanics)"
  },

  // ============================================================
  // ====  APPEND machine: walk to the end and write a 1  =======
  // ============================================================
  {
    id: "ch3-hands-append-what", chapter: 3, topic: "TM variants", type: "mc", rank: 40,
    prompt: "This Turing machine has \\(\\Sigma=\\{0,1\\}\\) and tape alphabet \\(\\{0,1,\\sqcup\\}\\). Reading the diagram, what does it do to its input tape before accepting?",
    diagram: { width: 470, height: 200, states: [
      { id: "q0", x: 120, y: 95, start: true, label: "q0" },
      { id: "qa", x: 360, y: 95, accept: true, label: "qacc" }
    ], edges: [
      { from: "q0", to: "q0", label: "0→R,  1→R", loop: "up" },
      { from: "q0", to: "qa", label: "␣→1,R" }
    ] },
    choices: [
      "It moves right over the whole input and writes a \\(1\\) on the first blank cell — appending a \\(1\\) at the end",
      "It flips every \\(0\\) to \\(1\\) and every \\(1\\) to \\(0\\)",
      "It deletes the last symbol of the input",
      "It writes a \\(1\\) over the first symbol of the input"
    ],
    answer: 0,
    explanation: "In \\(q_0\\) the machine scans right, unchanged, over every \\(0\\) and \\(1\\) (the self-loop \\(0\\to R,\\ 1\\to R\\)). The first blank triggers \\(\\sqcup\\to 1,R\\): it writes a \\(1\\) there and accepts. So the tape goes from \\(w\\) to \\(w1\\). For example \\(101\\) becomes \\(1011\\).",
    source: "Verified by simulation; cf. Sipser §3.1 (TM operation)"
  },
  {
    id: "ch3-hands-append-trace-order", chapter: 3, topic: "Configurations", type: "order", rank: 40,
    prompt: "Run the append machine above on input \\(10\\). Put its configurations in the order they occur, from the start configuration to the halting one. (Head is on the first symbol of the string written after the state.)",
    items: [
      "\\(q_0\\,10\\)",
      "\\(1\\,q_0\\,0\\)",
      "\\(10\\,q_0\\,\\sqcup\\)",
      "\\(101\\,q_{accept}\\)"
    ],
    explanation: "From the start configuration \\(q_0 10\\): read \\(1\\), move right \\(\\to 1\\,q_0 0\\); read \\(0\\), move right \\(\\to 10\\,q_0\\sqcup\\); now on a blank, write \\(1\\) and move right into \\(q_{accept}\\), giving tape \\(101\\). Each step is one legal 'yields'.",
    source: "Verified by simulation"
  },

  // ============================================================
  // ====  FLIP machine: complement every bit  ==================
  // ============================================================
  {
    id: "ch3-hands-flip-what", chapter: 3, topic: "TM variants", type: "mc", rank: 40,
    prompt: "A Turing machine over \\(\\Sigma=\\{0,1\\}\\), tape alphabet \\(\\{0,1,\\sqcup\\}\\), is shown below. What is written on the tape when it accepts?",
    diagram: { width: 470, height: 200, states: [
      { id: "q0", x: 120, y: 95, start: true, label: "q0" },
      { id: "qa", x: 360, y: 95, accept: true, label: "qacc" }
    ], edges: [
      { from: "q0", to: "q0", label: "0→1,R", loop: "up" },
      { from: "q0", to: "q0", label: "1→0,R", loop: "down" },
      { from: "q0", to: "qa", label: "␣→R" }
    ] },
    choices: [
      "The bitwise complement of the input: every \\(0\\) becomes \\(1\\) and every \\(1\\) becomes \\(0\\)",
      "The input reversed",
      "The input unchanged",
      "A single \\(1\\) followed by blanks"
    ],
    answer: 0,
    explanation: "Scanning right in \\(q_0\\), the rule \\(0\\to 1,R\\) overwrites each \\(0\\) with \\(1\\) and \\(1\\to 0,R\\) overwrites each \\(1\\) with \\(0\\); at the first blank it simply moves right and accepts. So \\(1011\\) leaves \\(0100\\) on the tape. This is a 'bit-flipper'.",
    source: "Verified by simulation; cf. Sipser §3.1"
  },
  {
    id: "ch3-hands-flip-next-config", chapter: 3, topic: "Configurations", type: "mc", rank: 40,
    prompt: "For the bit-flipper (\\(\\delta(q_0,0)=(q_0,1,R)\\), \\(\\delta(q_0,1)=(q_0,0,R)\\)), suppose the current configuration is \\(01\\,q_0\\,1\\) (tape \\(011\\), head on the last symbol). Which configuration comes next?",
    choices: [
      "\\(010\\,q_0\\,\\sqcup\\)",
      "\\(011\\,q_0\\,\\sqcup\\)",
      "\\(01\\,q_0\\,0\\)",
      "\\(0\\,q_0\\,10\\)"
    ],
    answer: 0,
    explanation: "The head reads \\(1\\) in state \\(q_0\\); \\(\\delta(q_0,1)=(q_0,0,R)\\) writes \\(0\\) over that \\(1\\) and moves right onto the next (blank) cell. So \\(01\\,q_0\\,1\\) yields \\(010\\,q_0\\,\\sqcup\\).",
    source: "Sipser §3.1 (yields, rightward move)"
  },
  {
    id: "ch3-hands-flip-tape-strip", chapter: 3, topic: "The tape", type: "mc", rank: 40,
    prompt: "The tape strips below show the bit-flipper running on input \\(101\\), one snapshot per step (the highlighted cell is under the head; state shown at right). Reading top to bottom, what is the final tape content when it halts?",
    grid: {
      title: "Bit-flipper on input 101",
      cells: [
        [ { text: "1", hi: true }, { text: "0" }, { text: "1" }, { text: "␣" }, { text: "␣" }, { text: "q0", muted: true } ],
        [ { text: "0" }, { text: "0", hi: true }, { text: "1" }, { text: "␣" }, { text: "␣" }, { text: "q0", muted: true } ],
        [ { text: "0" }, { text: "1" }, { text: "1", hi: true }, { text: "␣" }, { text: "␣" }, { text: "q0", muted: true } ],
        [ { text: "0" }, { text: "1" }, { text: "0" }, { text: "␣", hi: true }, { text: "␣" }, { text: "q0", muted: true } ],
        [ { text: "0" }, { text: "1" }, { text: "0" }, { text: "␣" }, { text: "␣", hi: true }, { text: "qacc", muted: true } ]
      ],
      note: "each 0↔1 flips as the head passes; on the blank it moves right and accepts"
    },
    choices: [
      "\\(010\\) — the bitwise complement of \\(101\\)",
      "\\(101\\) — unchanged",
      "\\(111\\)",
      "\\(000\\)"
    ],
    answer: 0,
    explanation: "Step by step the head flips \\(1\\to 0\\), \\(0\\to 1\\), \\(1\\to 0\\), then reaches the blank and accepts. The tape reads \\(010\\), the complement of \\(101\\). Notice the head only moves right and the input length is unchanged.",
    source: "Verified by simulation"
  },

  // ============================================================
  // ====  Configuration reading & yields (grounded in Def 3.3) =
  // ============================================================
  {
    id: "ch3-hands-config-read", chapter: 3, topic: "Configurations", type: "mc", rank: 40,
    prompt: "Sipser writes a configuration as \\(u\\,q\\,v\\): state \\(q\\), tape contents \\(uv\\), head on the first symbol of \\(v\\) (blanks follow the last symbol of \\(v\\)). What does the configuration \\(1011\\,q_7\\,01111\\) describe?",
    grid: {
      title: "Tape for configuration 1011 q7 01111",
      cells: [
        [ "1", "0", "1", "1", { text: "0", hi: true }, "1", "1", "1", "1" ]
      ],
      colHeaders: ["1","2","3","4","5","6","7","8","9"],
      note: "head (highlighted) on cell 5, the first symbol of v = 01111; state q7"
    },
    choices: [
      "Tape \\(101101111\\), state \\(q_7\\), head on the \\(5\\)th cell (the first \\(0\\) of \\(v\\))",
      "Tape \\(101101111\\), state \\(q_7\\), head on the leftmost cell",
      "Tape \\(1011\\), state \\(q_7\\), head on cell \\(4\\)",
      "Tape \\(01111\\), state \\(q_7\\), head on the rightmost cell"
    ],
    answer: 0,
    explanation: "With \\(u=1011\\) and \\(v=01111\\), the tape is \\(uv=101101111\\) and the head sits on the first symbol of \\(v\\) — the \\(0\\) in cell \\(5\\). This is exactly the configuration Sipser illustrates in Figure 3.4.",
    source: "Sipser §3.1 (Configurations, Fig 3.4)"
  },
  {
    id: "ch3-hands-yields-left", chapter: 3, topic: "Configurations", type: "mc", rank: 40,
    prompt: "Suppose \\(\\delta(q_i,b)=(q_j,c,L)\\) (a leftward move, head not at the tape's left end). Using Sipser's yields rules, which single step is correct?",
    choices: [
      "\\(ua\\,q_i\\,bv\\) yields \\(u\\,q_j\\,acv\\)",
      "\\(ua\\,q_i\\,bv\\) yields \\(uac\\,q_j\\,v\\)",
      "\\(ua\\,q_i\\,bv\\) yields \\(u\\,q_j\\,cv\\)",
      "\\(ua\\,q_i\\,bv\\) yields \\(uca\\,q_j\\,v\\)"
    ],
    answer: 0,
    explanation: "On a left move the machine writes \\(c\\) over \\(b\\), then the head steps left onto the symbol \\(a\\) that was just to the left. The written \\(c\\) now sits to the right of the head, giving \\(u\\,q_j\\,acv\\). (The second option is the rightward rule.)",
    source: "Sipser §3.1 (yields, leftward move)"
  },

  // ============================================================
  // ====  δ, the blank, and why Σ excludes it (tf / mc / fib) ==
  // ============================================================
  {
    id: "ch3-hands-delta-triple-tf", chapter: 3, topic: "Transition function", type: "tf", rank: 10,
    prompt: "For a standard one-tape TM, a single value \\(\\delta(q,a)=(r,b,L)\\) specifies three things at once: the next state, the symbol to write over \\(a\\), and the direction to move the head.",
    answer: true,
    explanation: "That is precisely the shape \\(\\delta:Q\\times\\Gamma\\to Q\\times\\Gamma\\times\\{L,R\\}\\). Reading symbol \\(a\\) in state \\(q\\), the machine enters \\(r\\), writes \\(b\\) (possibly \\(b=a\\)), and moves \\(L\\) or \\(R\\) — all in one step.",
    source: "Sipser Def 3.3"
  },
  {
    id: "ch3-hands-blank-why-not-input", chapter: 3, topic: "The tape", type: "mc", rank: 20,
    prompt: "The blank \\(\\sqcup\\) is in the tape alphabet \\(\\Gamma\\) but the definition forbids it from the input alphabet \\(\\Sigma\\) (\\(\\sqcup\\notin\\Sigma\\)). What breaks if we allowed \\(\\sqcup\\) to appear in the input?",
    choices: [
      "The machine could no longer tell where the input ends — the first blank is exactly how it detects the right-hand end of the input",
      "The transition function would need a third move direction",
      "The tape would become finite",
      "\\(\\Gamma\\) would no longer contain \\(\\Sigma\\)"
    ],
    answer: 0,
    explanation: "Initially the input occupies the leftmost cells and every cell after it is blank, so the first \\(\\sqcup\\) marks the end of the input. If blanks could occur inside the input, that boundary would be ambiguous. Hence \\(\\Sigma\\subseteq\\Gamma\\) but \\(\\sqcup\\in\\Gamma\\setminus\\Sigma\\).",
    source: "Sipser Def 3.3"
  },
  {
    id: "ch3-hands-leftend-fib", chapter: 3, topic: "Transition rules", type: "fib", rank: 10,
    prompt: "If a TM executes a left-moving transition while its head is already on the leftmost tape cell, the head does not fall off — instead it ____ on that same cell for that step. (one word)",
    accept: ["stays", "remains", "stay", "remain"],
    explanation: "The model prevents the head from moving off the left-hand end: a left move at the left end leaves the head in place (though the write still happens). This is exactly the feature \\(M_3\\) in Example 3.11 exploits to build a left-end detector.",
    source: "Sipser Def 3.3, Ex 3.11"
  },
  {
    id: "ch3-hands-accept-order", chapter: 3, topic: "Configurations", type: "order", rank: 40,
    prompt: "Recall a TM \\(M\\) accepts \\(w\\) when a sequence of configurations \\(C_1,\\dots,C_k\\) meets three conditions (Sipser §3.1). Order the conditions as the definition states them.",
    items: [
      "\\(C_1\\) is the start configuration \\(q_0\\,w\\) of \\(M\\) on input \\(w\\)",
      "Each \\(C_i\\) yields \\(C_{i+1}\\) (every step is a legal move of \\(M\\))",
      "\\(C_k\\) is an accepting configuration (its state is \\(q_{accept}\\))"
    ],
    explanation: "Acceptance is a finite run that begins at the start configuration, proceeds by legal single-step yields, and ends in a configuration whose state is \\(q_{accept}\\). Rejecting configurations (state \\(q_{reject}\\)) and looping are the ways acceptance fails.",
    source: "Sipser §3.1 (definition of accepting)"
  }
]);
