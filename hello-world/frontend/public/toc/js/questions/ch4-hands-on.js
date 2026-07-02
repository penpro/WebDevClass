/* Chapter 4 — HANDS-ON: see the diagonalization, count the countable, and place
   each language in the hierarchy. Visual companions to ch4.js (grid tables +
   a nested-rings language map). All facts grounded in Sipser 4.2
   (Thm 4.17, Cor 4.18, Thm 4.11 / Fig 4.19–4.21, Thm 4.22, Cor 4.23).
   Grid/SVG text is plain Unicode on purpose — KaTeX does not render inside SVG
   <text>, so notation in figures uses ⟨ ⟩, ⁿ, subscripts directly. */
TOC.addQuestions([

  /* ============================================================
     (A)  DIAGONALIZATION YOU CAN SEE  — the H / D table (Fig 4.20–4.21)
     ============================================================ */

  // Reusable table = Sipser Figure 4.20: entry (i,j) = value of H on ⟨Mi,⟨Mj⟩⟩.
  // Diagonal (acc,acc,rej,rej) is highlighted; D outputs its OPPOSITE.
  {
    id: "ch4-hands-diag-read-grid", chapter: 4, topic: "Diagonalization", type: "mc", rank: 40,
    prompt: "The table shows, for each TM \\(M_i\\) (rows) and each encoding \\(\\langle M_j\\rangle\\) (columns), whether \\(M_i\\) **accepts** \\(\\langle M_j\\rangle\\). The **diagonal** (shaded) records what each machine does on **its own** description. The diagonal machine \\(D\\) is defined to output the *opposite* of the diagonal: \\(D\\) accepts \\(\\langle M_i\\rangle\\) exactly when \\(M_i\\) does **not** accept \\(\\langle M_i\\rangle\\). What does \\(D\\) do on \\(\\langle M_3\\rangle\\)?",
    grid: {
      colHeaders: ["⟨M₁⟩", "⟨M₂⟩", "⟨M₃⟩", "⟨M₄⟩", "…"],
      rowHeaders: ["M₁", "M₂", "M₃", "M₄", "⋮"],
      cells: [
        ["acc", "rej", "acc", "rej", "…"],
        ["acc", "acc", "acc", "acc", "…"],
        ["rej", "rej", "rej", "rej", "…"],
        ["acc", "acc", "rej", "rej", "…"],
        ["⋮", "⋮", "⋮", "⋮", ""]
      ],
      hi: [[0, 0], [1, 1], [2, 2], [3, 3]],
      title: "Entry (i,j): does Mᵢ accept ⟨Mⱼ⟩?",
      note: "Diagonal shaded — D outputs its opposite"
    },
    choices: [
      "**accept** — because the diagonal entry \\((M_3,\\langle M_3\\rangle)\\) is *reject*, so \\(D\\) flips it to accept",
      "**reject** — \\(D\\) copies the diagonal entry, which is *reject*",
      "**accept** — because row \\(M_3\\) is all *reject*",
      "It loops, since \\(M_3\\) rejects everything"
    ],
    answer: 0,
    explanation: "The diagonal cell for \\(M_3\\) is its behavior on \\(\\langle M_3\\rangle\\) = **reject**. \\(D\\) is built to do the opposite of the diagonal, so \\(D\\) **accepts** \\(\\langle M_3\\rangle\\). Reading straight down the shaded diagonal gives acc, acc, rej, rej; \\(D\\)'s row is the flip: rej, rej, acc, acc.",
    source: "Sipser Fig 4.20–4.21"
  },

  {
    id: "ch4-hands-diag-disagree", chapter: 4, topic: "Diagonalization", type: "mc", rank: 40,
    prompt: "By construction, \\(D\\) on input \\(\\langle M_i\\rangle\\) is guaranteed to give a **different** answer than one particular machine on one particular input. Which entry of the table does \\(D\\)'s behavior on \\(\\langle M_i\\rangle\\) always disagree with?",
    choices: [
      "The **diagonal** entry \\((M_i,\\langle M_i\\rangle)\\) — i.e. what \\(M_i\\) itself does on \\(\\langle M_i\\rangle\\)",
      "The first entry of row \\(M_i\\), i.e. \\((M_i,\\langle M_1\\rangle)\\)",
      "The entry \\((M_1,\\langle M_i\\rangle)\\) at the top of column \\(i\\)",
      "Every entry in row \\(M_i\\) simultaneously"
    ],
    answer: 0,
    explanation: "\\(D\\) is defined to output the opposite of the diagonal, so on \\(\\langle M_i\\rangle\\) it disagrees precisely with the **diagonal** cell \\((M_i,\\langle M_i\\rangle)\\) — machine \\(M_i\\)'s own behavior on its own encoding. That single planned disagreement per row is the whole trick.",
    source: "Sipser Thm 4.11 (proof)"
  },

  {
    id: "ch4-hands-diag-no-row", chapter: 4, topic: "Diagonalization", type: "mc", rank: 40,
    prompt: "Suppose \\(D\\) were itself a Turing machine. Then it would appear somewhere in the list of all TMs as some row \\(M_k\\), giving it a column \\(\\langle D\\rangle=\\langle M_k\\rangle\\). Why is that impossible?",
    choices: [
      "At the cell \\((D,\\langle D\\rangle)\\), \\(D\\) would have to accept iff it does **not** accept \\(\\langle D\\rangle\\) — a contradiction",
      "\\(D\\) has infinitely many states, so it can't be encoded as a string",
      "The list of TMs is finite, so there is no room to add \\(D\\)",
      "\\(D\\) is not deterministic, so it has no single row"
    ],
    answer: 0,
    explanation: "If \\(D\\) sat in row \\(M_k\\), look at its own diagonal cell \\((D,\\langle D\\rangle)\\). \\(D\\) is defined to *flip* that cell, so \\(D\\) accepts \\(\\langle D\\rangle\\) exactly when \\(D\\) does **not** accept \\(\\langle D\\rangle\\). No consistent entry exists (Sipser's \"?\"), so \\(D\\)—hence the decider \\(H\\) it was built from—cannot exist.",
    source: "Sipser Fig 4.21"
  },

  {
    id: "ch4-hands-diag-contradiction-cell", chapter: 4, topic: "Diagonalization", type: "tf", rank: 30,
    prompt: "In Sipser's Figure 4.21 the contradiction is marked with a **\"?\"** at the single cell where the row for \\(D\\) crosses the column \\(\\langle D\\rangle\\).",
    answer: true,
    explanation: "True. Every other cell of \\(D\\)'s row is a well-defined flip of the diagonal, but the cell \\((D,\\langle D\\rangle)\\) would have to equal the opposite of *itself*. That lone impossible cell is the \"?\" and is exactly where the proof breaks the assumption that \\(H\\) (and thus \\(D\\)) exists.",
    source: "Sipser Fig 4.21"
  },

  {
    id: "ch4-hands-diag-proves", chapter: 4, topic: "More languages than machines", type: "mc", rank: 30,
    prompt: "Stepping back from \\(A_{TM}\\): the diagonalization / counting argument of Section 4.2 establishes which of the following as its headline conclusion?",
    choices: [
      "There are only **countably many** Turing machines but **uncountably many** languages, so some language is **not Turing-recognizable**",
      "Every language is decidable, but some are hard to decide",
      "The set of Turing machines and the set of languages are the same size",
      "Every Turing-recognizable language is also decidable"
    ],
    answer: 0,
    explanation: "Each TM has a finite encoding, so the TMs are countable; the set of languages matches the uncountable set of infinite binary sequences. Uncountable-many languages cannot all be paired with countable-many machines, so some language is recognized by **no** TM (Corollary 4.18).",
    source: "Sipser Cor 4.18"
  },

  {
    id: "disc-ch4-hands-diagonalization", chapter: 4, topic: "Diagonalization", type: "discussion", rank: 30,
    prompt: "**Let's actually run the diagonal argument on a picture.** Lay every Turing machine \\(M_1,M_2,\\dots\\) down the rows and its encoding \\(\\langle M_1\\rangle,\\langle M_2\\rangle,\\dots\\) across the columns. Cell \\((i,j)\\) says whether \\(M_i\\) accepts \\(\\langle M_j\\rangle\\). We'll build a machine that *cannot* be in the table — and see why that means some language beats every machine.",
    grid: {
      colHeaders: ["⟨M₁⟩", "⟨M₂⟩", "⟨M₃⟩", "⟨M₄⟩", "…", "⟨D⟩"],
      rowHeaders: ["M₁", "M₂", "M₃", "M₄", "⋮", "D"],
      cells: [
        ["acc", "rej", "acc", "rej", "…", "acc"],
        ["acc", "acc", "acc", "acc", "…", "acc"],
        ["rej", "rej", "rej", "rej", "…", "rej"],
        ["acc", "acc", "rej", "rej", "…", "acc"],
        ["⋮", "⋮", "⋮", "⋮", "", "⋮"],
        ["rej", "rej", "acc", "acc", "…", "?"]
      ],
      hi: [[0, 0], [1, 1], [2, 2], [3, 3], [5, 5]],
      title: "D flips the diagonal — so what goes at (D, ⟨D⟩)?",
      note: "acc,acc,rej,rej down the diagonal → D's row is rej,rej,acc,acc"
    },
    steps: [
      { prompt: "Read straight down the shaded diagonal: it records each machine's verdict on **its own** description, here acc, acc, rej, rej, …. We define \\(D\\) so its row is the **opposite** of that diagonal. What is \\(D\\)'s row?",
        type: "mc",
        choices: ["rej, rej, acc, acc, …", "acc, acc, rej, rej, … (a copy of the diagonal)", "all accept", "all reject"], answer: 0,
        explain: "\\(D\\) on \\(\\langle M_i\\rangle\\) does the opposite of what \\(M_i\\) does on \\(\\langle M_i\\rangle\\). Flipping acc,acc,rej,rej gives **rej,rej,acc,acc** — different from every row in at least the diagonal position." },
      { prompt: "By design, \\(D\\)'s row differs from row \\(M_i\\) at column \\(\\langle M_i\\rangle\\), for every \\(i\\). So can \\(D\\) equal any machine \\(M_i\\) already in the list?",
        type: "tf", answer: false,
        explain: "No. \\(D\\) is engineered to disagree with each \\(M_i\\) somewhere (namely on \\(\\langle M_i\\rangle\\)), so it can't be identical to any listed machine. It differs from all of them by construction." },
      { prompt: "But \\(D\\) was built from an assumed decider \\(H\\) for \\(A_{TM}\\), so \\(D\\) *would* be a TM and *must* appear as some row. Look at the cell \\((D,\\langle D\\rangle)\\), marked \"?\". What value can it take?",
        type: "mc",
        choices: ["Neither — it must be the opposite of itself, which is impossible", "accept, safely", "reject, safely", "It can be either; there's no problem"], answer: 0,
        explain: "\\(D\\) accepts \\(\\langle D\\rangle\\) iff \\(D\\) does **not** accept \\(\\langle D\\rangle\\). The cell must equal its own opposite — a flat contradiction. So the assumed \\(H\\) can't exist, and \\(A_{TM}\\) is undecidable." },
      { prompt: "The *same counting picture* also shows a language no machine recognizes. Which size mismatch is responsible?",
        type: "mc",
        choices: ["Countably many TMs vs. uncountably many languages", "Finitely many TMs vs. infinitely many languages", "Uncountably many TMs vs. countably many languages", "They are the same size, so nothing is missed"], answer: 0,
        explain: "Every TM has a finite string encoding, so the machines are **countable**. Languages correspond to infinite binary sequences, which are **uncountable**. Too many languages, too few machines — so some language is unrecognizable (Cor 4.18)." }
    ],
    explanation: "Diagonalization builds a machine \\(D\\) that flips the table's diagonal, so it disagrees with every row exactly once — yet if it were a TM it would need a row, and its own diagonal cell would be the opposite of itself. That contradiction kills the assumed decider for \\(A_{TM}\\). The very same table shows countably many machines can't cover uncountably many languages.",
    whyMatters: "This one picture is the engine behind *every* undecidability result in the course: it's how we know a hard limit on computation exists at all, before we ever reduce one problem to another.",
    realWorld: "Cantor's diagonal is the same move that shows the real numbers outnumber the integers and that no program can list every real. \"You can't enumerate them all\" — reals, or languages — is a recurring wall in logic, computability, and even database theory.",
    source: "Sipser Thm 4.11, Cor 4.18 (Fig 4.19–4.21)"
  },

  /* ============================================================
     (B)  COUNTABILITY — enumerating Σ*, dovetailing ℕ×ℕ, ℚ vs ℝ
     ============================================================ */

  {
    id: "ch4-hands-shortlex-order", chapter: 4, topic: "Countability", type: "order", rank: 30,
    prompt: "To show \\(\\Sigma^*\\) is countable over \\(\\Sigma=\\{0,1\\}\\), list strings in **shortlex** order (by length, then dictionary order within a length). Put the **start** of that enumeration in order.",
    items: [
      "\\(\\varepsilon\\)",
      "\\(0\\)",
      "\\(1\\)",
      "\\(00\\)",
      "\\(01\\)",
      "\\(10\\)",
      "\\(11\\)",
      "\\(000\\)"
    ],
    explanation: "There are only **finitely many** strings of each length, so we can write them all down length by length: length 0 \\((\\varepsilon)\\), then length 1 \\((0,1)\\), then length 2 \\((00,01,10,11)\\), and so on. Every string appears at a finite position, which is exactly what \"countable\" means. (Ordering by length first avoids the trap of listing all of \\(0^*\\) before ever reaching \\(1\\).)",
    source: "Sipser Cor 4.18 (Σ* is countable)"
  },

  {
    id: "ch4-hands-dovetail-pairs", chapter: 4, topic: "Countability", type: "mc", rank: 30,
    prompt: "To prove \\(\\mathbb{N}\\times\\mathbb{N}\\) (all pairs \\((i,j)\\)) is countable — the same idea used for \\(\\mathbb{Q}\\) in Figure 4.16 — how do you turn the infinite 2-D grid of pairs into a single list?",
    choices: [
      "Sweep the **finite anti-diagonals** \\(i+j=2,3,4,\\dots\\) one after another (\"dovetailing\")",
      "List all of row \\(i=1\\) first, then all of row \\(i=2\\), and so on",
      "List all of column \\(j=1\\) first, then all of column \\(j=2\\)",
      "Pick pairs at random until every pair has appeared"
    ],
    answer: 0,
    explanation: "Each diagonal \\(i+j=\\text{const}\\) holds only **finitely many** pairs, so walking the diagonals from the corner reaches every pair after finitely many steps. Listing a whole (infinite) row or column first never finishes that row, so it would miss everything below — the classic dovetailing fix.",
    source: "Sipser Fig 4.16 (ℕ×ℕ / ℚ countable)"
  },

  {
    id: "ch4-hands-rationals-countable", chapter: 4, topic: "Countability", type: "tf", rank: 10,
    prompt: "The set \\(\\mathbb{Q}\\) of rational numbers is **countable**.",
    answer: true,
    explanation: "True. Arrange the fractions \\(i/j\\) in a grid and list them along diagonals (skipping repeats like \\(2/2=1/1\\)); every rational appears at a finite position. Being countable does **not** mean small — \\(\\mathbb{Q}\\) is infinite — only that it can be put in one-to-one correspondence with \\(\\mathbb{N}\\).",
    source: "Sipser Fig 4.16"
  },

  {
    id: "ch4-hands-reals-uncountable-why", chapter: 4, topic: "Uncountability", type: "mc", rank: 30,
    prompt: "In Cantor's proof that \\(\\mathbb{R}\\) is uncountable, we assume a list \\(f(1),f(2),f(3),\\dots\\) of all reals in \\([0,1)\\) and build a real \\(x\\) missing from it. How is \\(x\\) constructed, and why avoid the digits \\(0\\) and \\(9\\)?",
    choices: [
      "Make \\(x\\)'s \\(n\\)th digit differ from the \\(n\\)th digit of \\(f(n)\\); avoid \\(0/9\\) so quirks like \\(0.1999\\ldots=0.2000\\ldots\\) can't make \\(x\\) secretly equal a listed number",
      "Set every digit of \\(x\\) to \\(0\\); this guarantees \\(x\\) is new",
      "Copy the diagonal digits exactly; \\(0\\) and \\(9\\) are just hard to typeset",
      "Average all the \\(f(n)\\); avoiding \\(0/9\\) keeps the average in range"
    ],
    answer: 0,
    explanation: "Choosing \\(x\\)'s \\(n\\)th digit \\(\\neq\\) the \\(n\\)th digit of \\(f(n)\\) forces \\(x\\neq f(n)\\) for every \\(n\\), so \\(x\\) is on no list — \\(\\mathbb{R}\\) is uncountable. Sipser sidesteps \\(0\\) and \\(9\\) because two decimal expansions can name the *same* real (e.g. \\(0.4999\\ldots=0.5\\)); banning them keeps \"different digit\" meaning \"different number.\"",
    source: "Sipser Thm 4.17"
  },

  {
    id: "ch4-hands-tms-vs-langs", chapter: 4, topic: "Countable vs uncountable", type: "mc", rank: 20,
    prompt: "Which counting fact directly forces the existence of a language that is not Turing-recognizable?",
    choices: [
      "The set of TMs is **countable**, but the set of languages over \\(\\Sigma\\) is **uncountable**",
      "Both sets are countable, but the languages are listed in a different order",
      "The set of TMs is uncountable, while the set of languages is countable",
      "Both sets are uncountable and the same size, so a diagonal language always exists"
    ],
    answer: 0,
    explanation: "Each TM is named by a finite string \\(\\langle M\\rangle\\), so the TMs form a countable list. Languages correspond to infinite binary (characteristic) sequences, an uncountable set. A countable list cannot cover an uncountable collection, so some language has **no** recognizer.",
    source: "Sipser Cor 4.18"
  },

  {
    id: "ch4-hands-countable-multi", chapter: 4, topic: "Countable vs uncountable", type: "multi", rank: 20,
    prompt: "Select **every** set below that is **countable**.",
    choices: [
      "\\(\\Sigma^*\\), all finite strings over a finite alphabet \\(\\Sigma\\)",
      "The set of all Turing machines",
      "\\(\\mathbb{R}\\), the real numbers",
      "The set of all languages over \\(\\{0,1\\}\\)",
      "\\(\\mathbb{N}\\times\\mathbb{N}\\), all pairs of natural numbers"
    ],
    answers: [0, 1, 4],
    explanation: "\\(\\Sigma^*\\) (list by length), the TMs (each has a finite encoding), and \\(\\mathbb{N}\\times\\mathbb{N}\\) (dovetail the diagonals) are all **countable**. \\(\\mathbb{R}\\) and the set of all languages are **uncountable** — the latter matches the uncountable set \\(B\\) of infinite binary sequences via characteristic sequences.",
    source: "Sipser 4.2 (Thm 4.17, Cor 4.18)"
  },

  /* ============================================================
     (C)  PLACE THIS LANGUAGE — nested-rings hierarchy + classification
     ============================================================ */

  // Shared hierarchy figure: regular ⊂ CF ⊂ decidable ⊂ recognizable, with
  // co-recognizable indicated and four example languages pinned.
  {
    id: "ch4-hands-hierarchy-svg-anbncn", chapter: 4, topic: "Language hierarchy", type: "mc", rank: 40,
    prompt: "Use the language map below. Where does \\(\\{a^n b^n c^n \\mid n\\ge 0\\}\\) live?",
    svg: '<svg viewBox="0 0 470 300" xmlns="http://www.w3.org/2000/svg" font-family="Georgia, \'Times New Roman\', serif"><rect x="10" y="10" width="450" height="280" rx="14" fill="none" stroke="var(--ink-soft)" stroke-width="1.5"/><text x="20" y="28" font-size="12" fill="var(--ink-soft)">all languages</text><rect x="26" y="38" width="418" height="234" rx="12" fill="var(--brand-soft)" fill-opacity="0.10" stroke="var(--brand)" stroke-width="1.5"/><text x="36" y="56" font-size="12.5" font-weight="700" fill="var(--brand)">Turing-recognizable</text><rect x="54" y="66" width="300" height="180" rx="11" fill="none" stroke="var(--ink)" stroke-width="1.4"/><text x="64" y="84" font-size="12.5" font-weight="700" fill="var(--ink)">decidable</text><rect x="70" y="94" width="210" height="138" rx="10" fill="none" stroke="var(--ink-soft)" stroke-width="1.3"/><text x="80" y="112" font-size="12" fill="var(--ink-soft)">context-free</text><rect x="84" y="122" width="120" height="96" rx="9" fill="none" stroke="var(--ink-soft)" stroke-width="1.3"/><text x="94" y="140" font-size="12" fill="var(--ink-soft)">regular</text><text x="122" y="164" text-anchor="middle" font-size="12" fill="var(--ink)">aⁿ</text><text x="150" y="206" text-anchor="middle" font-size="12" fill="var(--ink)">0ⁿ1ⁿ</text><text x="238" y="150" text-anchor="middle" font-size="12" fill="var(--ink)">aⁿbⁿcⁿ</text><text x="300" y="200" text-anchor="middle" font-size="12" fill="var(--brand)">A_TM</text><rect x="366" y="66" width="80" height="180" rx="11" fill="none" stroke="var(--ink-soft)" stroke-width="1.2" stroke-dasharray="4 3"/><text x="406" y="150" text-anchor="middle" font-size="11.5" fill="var(--ink-soft)">co-recognizable</text><text x="406" y="168" text-anchor="middle" font-size="12" fill="var(--ink-soft)">co-A_TM</text><text x="235" y="286" text-anchor="middle" font-size="11" fill="var(--muted)">regular ⊂ context-free ⊂ decidable ⊂ recognizable</text></svg>',
    choices: [
      "**Decidable but not context-free**",
      "Regular",
      "Context-free but not regular",
      "Turing-recognizable but not decidable"
    ],
    answer: 0,
    explanation: "\\(\\{a^n b^n c^n\\}\\) fails the pumping lemma for CFLs, so it is **not context-free** — yet a TM can decide it by counting the three blocks and halting. So it sits in the **decidable** ring but outside the context-free ring, exactly as pinned on the map.",
    source: "Sipser 2.3 / 4.1 (a^n b^n c^n decidable, non-CFL)"
  },

  {
    id: "ch4-hands-hierarchy-svg-atm", chapter: 4, topic: "Language hierarchy", type: "mc", rank: 40,
    prompt: "On the same map, which region correctly describes \\(A_{TM}=\\{\\langle M,w\\rangle \\mid M\\text{ accepts }w\\}\\)?",
    svg: '<svg viewBox="0 0 470 300" xmlns="http://www.w3.org/2000/svg" font-family="Georgia, \'Times New Roman\', serif"><rect x="10" y="10" width="450" height="280" rx="14" fill="none" stroke="var(--ink-soft)" stroke-width="1.5"/><text x="20" y="28" font-size="12" fill="var(--ink-soft)">all languages</text><rect x="26" y="38" width="418" height="234" rx="12" fill="var(--brand-soft)" fill-opacity="0.10" stroke="var(--brand)" stroke-width="1.5"/><text x="36" y="56" font-size="12.5" font-weight="700" fill="var(--brand)">Turing-recognizable</text><rect x="54" y="66" width="300" height="180" rx="11" fill="none" stroke="var(--ink)" stroke-width="1.4"/><text x="64" y="84" font-size="12.5" font-weight="700" fill="var(--ink)">decidable</text><rect x="70" y="94" width="210" height="138" rx="10" fill="none" stroke="var(--ink-soft)" stroke-width="1.3"/><text x="80" y="112" font-size="12" fill="var(--ink-soft)">context-free</text><rect x="84" y="122" width="120" height="96" rx="9" fill="none" stroke="var(--ink-soft)" stroke-width="1.3"/><text x="94" y="140" font-size="12" fill="var(--ink-soft)">regular</text><text x="122" y="164" text-anchor="middle" font-size="12" fill="var(--ink)">aⁿ</text><text x="150" y="206" text-anchor="middle" font-size="12" fill="var(--ink)">0ⁿ1ⁿ</text><text x="238" y="150" text-anchor="middle" font-size="12" fill="var(--ink)">aⁿbⁿcⁿ</text><text x="300" y="200" text-anchor="middle" font-size="12" fill="var(--brand)">A_TM</text><rect x="366" y="66" width="80" height="180" rx="11" fill="none" stroke="var(--ink-soft)" stroke-width="1.2" stroke-dasharray="4 3"/><text x="406" y="150" text-anchor="middle" font-size="11.5" fill="var(--ink-soft)">co-recognizable</text><text x="406" y="168" text-anchor="middle" font-size="12" fill="var(--ink-soft)">co-A_TM</text><text x="235" y="286" text-anchor="middle" font-size="11" fill="var(--muted)">regular ⊂ context-free ⊂ decidable ⊂ recognizable</text></svg>',
    choices: [
      "**Turing-recognizable but not decidable** (inside the recognizable ring, outside decidable)",
      "Decidable",
      "Not Turing-recognizable",
      "Context-free"
    ],
    answer: 0,
    explanation: "The universal TM recognizes \\(A_{TM}\\) by simulating \\(M\\) on \\(w\\) (it accepts whenever \\(M\\) does), so \\(A_{TM}\\) is **Turing-recognizable**. But Theorem 4.11 shows it is **undecidable**. Hence it lands in the recognizable ring but outside decidable — right where it's pinned.",
    source: "Sipser Thm 4.11"
  },

  {
    id: "ch4-hands-hierarchy-svg-co-atm", chapter: 4, topic: "Language hierarchy", type: "mc", rank: 40,
    prompt: "Still on the map, the complement \\(\\overline{A_{TM}}\\) is drawn in the dashed **co-recognizable** band *outside* the recognizable ring. What does that placement assert?",
    svg: '<svg viewBox="0 0 470 300" xmlns="http://www.w3.org/2000/svg" font-family="Georgia, \'Times New Roman\', serif"><rect x="10" y="10" width="450" height="280" rx="14" fill="none" stroke="var(--ink-soft)" stroke-width="1.5"/><text x="20" y="28" font-size="12" fill="var(--ink-soft)">all languages</text><rect x="26" y="38" width="418" height="234" rx="12" fill="var(--brand-soft)" fill-opacity="0.10" stroke="var(--brand)" stroke-width="1.5"/><text x="36" y="56" font-size="12.5" font-weight="700" fill="var(--brand)">Turing-recognizable</text><rect x="54" y="66" width="300" height="180" rx="11" fill="none" stroke="var(--ink)" stroke-width="1.4"/><text x="64" y="84" font-size="12.5" font-weight="700" fill="var(--ink)">decidable</text><rect x="70" y="94" width="210" height="138" rx="10" fill="none" stroke="var(--ink-soft)" stroke-width="1.3"/><text x="80" y="112" font-size="12" fill="var(--ink-soft)">context-free</text><rect x="84" y="122" width="120" height="96" rx="9" fill="none" stroke="var(--ink-soft)" stroke-width="1.3"/><text x="94" y="140" font-size="12" fill="var(--ink-soft)">regular</text><text x="122" y="164" text-anchor="middle" font-size="12" fill="var(--ink)">aⁿ</text><text x="150" y="206" text-anchor="middle" font-size="12" fill="var(--ink)">0ⁿ1ⁿ</text><text x="238" y="150" text-anchor="middle" font-size="12" fill="var(--ink)">aⁿbⁿcⁿ</text><text x="300" y="200" text-anchor="middle" font-size="12" fill="var(--brand)">A_TM</text><rect x="366" y="66" width="80" height="180" rx="11" fill="none" stroke="var(--ink-soft)" stroke-width="1.2" stroke-dasharray="4 3"/><text x="406" y="150" text-anchor="middle" font-size="11.5" fill="var(--ink-soft)">co-recognizable</text><text x="406" y="168" text-anchor="middle" font-size="12" fill="var(--ink-soft)">co-A_TM</text><text x="235" y="286" text-anchor="middle" font-size="11" fill="var(--muted)">regular ⊂ context-free ⊂ decidable ⊂ recognizable</text></svg>',
    choices: [
      "\\(\\overline{A_{TM}}\\) is **not Turing-recognizable** (it is co-recognizable, since \\(A_{TM}\\) is recognizable)",
      "\\(\\overline{A_{TM}}\\) is decidable",
      "\\(\\overline{A_{TM}}\\) is regular",
      "\\(\\overline{A_{TM}}\\) is recognizable but not co-recognizable"
    ],
    answer: 0,
    explanation: "By Theorem 4.22 a language is decidable iff both it and its complement are recognizable. \\(A_{TM}\\) is recognizable but undecidable, so its complement \\(\\overline{A_{TM}}\\) **cannot** be recognizable (Corollary 4.23) — it is only co-recognizable, which is why it sits in the dashed band outside the recognizable ring.",
    source: "Sipser Thm 4.22, Cor 4.23"
  },

  {
    id: "ch4-hands-place-0n1n", chapter: 4, topic: "Classification", type: "mc", rank: 20,
    prompt: "Place \\(\\{0^n 1^n \\mid n\\ge 0\\}\\) as precisely as possible in the hierarchy.",
    choices: [
      "**Context-free but not regular**",
      "Regular",
      "Decidable but not context-free",
      "Turing-recognizable but not decidable"
    ],
    answer: 0,
    explanation: "\\(0^n1^n\\) is the textbook **non-regular** language (pumping lemma), but a PDA / CFG \\(S\\to 0S1\\mid\\varepsilon\\) generates it, so it is **context-free**. It therefore sits inside the context-free ring but outside the regular ring — and being context-free, it is also decidable.",
    source: "Sipser Ex 1.73 / 2.2"
  },

  {
    id: "ch4-hands-place-multi", chapter: 4, topic: "Classification", type: "multi", rank: 30,
    prompt: "Select **every** language that is **Turing-recognizable but not decidable**.",
    choices: [
      "\\(A_{TM}=\\{\\langle M,w\\rangle \\mid M\\text{ accepts }w\\}\\)",
      "\\(HALT_{TM}=\\{\\langle M,w\\rangle \\mid M\\text{ halts on }w\\}\\)",
      "\\(\\{0^n 1^n \\mid n\\ge 0\\}\\)",
      "\\(\\overline{A_{TM}}\\)",
      "\\(\\{a^n b^n c^n \\mid n\\ge 0\\}\\)"
    ],
    answers: [0, 1],
    explanation: "\\(A_{TM}\\) and \\(HALT_{TM}\\) are both recognizable (simulate \\(M\\) on \\(w\\)) yet undecidable, so they sit in the recognizable-not-decidable region. \\(0^n1^n\\) and \\(a^nb^nc^n\\) are **decidable** (a stronger property). \\(\\overline{A_{TM}}\\) is **not even recognizable**, so it fails the requirement too.",
    source: "Sipser Thm 4.11; Thm 5.1; Cor 4.23"
  }

]);
