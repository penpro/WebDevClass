/* Chapter 2 — Context-Free Languages: HANDS-ON / PROCEDURE pack (Sipser 2.1–2.3).
   The "do it, step by step" twin of the Ch 1 hands-on file. Four procedures:
     (A) Converting ONE concrete grammar to Chomsky normal form (Sipser Ex 2.10),
         chained stage by stage as a discussion.
     (B) The CFL pumping lemma as a plug-in: pick the witness string, then reason
         through the two placements of vxy that break a^n b^n c^n.
     (C) Ambiguity: two leftmost derivations / parse trees for a+a×a in grammar
         G5, one rendered as a parse-tree diagram; what a leftmost derivation is.
     (D) CFG -> PDA: how the PDA simulates a leftmost derivation on its stack,
         with an SVG stack strip.
   Mirrors the plug-in / diagram style of ch1.js and discussions.js. */
TOC.addQuestions([

  // ============================================================
  // (A) CHOMSKY NORMAL FORM — one grammar, chained stage by stage
  //     (Sipser Example 2.10 / Theorem 2.9)
  // ============================================================
  {
    id: "disc-ch2-cnf-convert-ex210", chapter: 2, topic: "Chomsky normal form", type: "discussion", rank: 40,
    prompt: "**Let's convert one grammar to Chomsky normal form**, exactly as Sipser does in Example 2.10. Start with\n\n\\(S\\to ASA\\mid aB\\)\n\\(A\\to B\\mid S\\)\n\\(B\\to b\\mid\\varepsilon\\)\n\nWe'll run the four stages in order and watch each rule set change. Recall CNF allows only \\(A\\to BC\\) and \\(A\\to a\\) (plus \\(S_0\\to\\varepsilon\\)).",
    steps: [
      { prompt: "**Stage 1 — new start variable.** We add a fresh start variable \\(S_0\\) and one rule. What is that rule, and why do we add it?", type: "mc",
        choices: [
          "\\(S_0\\to S\\), so the start variable never appears on a right-hand side",
          "\\(S_0\\to\\varepsilon\\), to allow the empty string immediately",
          "\\(S_0\\to ASA\\mid aB\\), copying \\(S\\)'s rules",
          "\\(S_0\\to B\\), to reach the terminal rules faster"
        ], answer: 0,
        explain: "Stage 1 adds \\(S_0\\to S\\) with \\(S_0\\) brand new. This guarantees the start variable does not occur on the right-hand side of any rule, which the later stages rely on. The grammar is now \\(S_0\\to S,\\ S\\to ASA\\mid aB,\\ A\\to B\\mid S,\\ B\\to b\\mid\\varepsilon\\)." },
      { prompt: "**Stage 2 — remove \\(\\varepsilon\\)-rules.** We delete \\(B\\to\\varepsilon\\). Because \\(B\\) appears on the right of \\(S\\to aB\\) and (after also clearing \\(A\\to\\varepsilon\\)) inside \\(S\\to ASA\\), what NEW \\(S\\)-rules must be added to preserve the language?", type: "mc",
        choices: [
          "\\(S\\to a\\) (from \\(aB\\)) and \\(S\\to SA\\mid AS\\mid S\\) (dropping an \\(A\\) from \\(ASA\\))",
          "\\(S\\to\\varepsilon\\), since \\(B\\) could be empty",
          "\\(S\\to bB\\) and \\(S\\to Ab\\)",
          "No new rules — deleting \\(B\\to\\varepsilon\\) changes nothing"
        ], answer: 0,
        explain: "Removing \\(A\\to\\varepsilon\\) is what forces new \\(S\\to ASA\\) variants: for each occurrence of the nullable \\(A\\) you add a copy with that \\(A\\) deleted, giving \\(SA\\), \\(AS\\), and \\(S\\). Removing \\(B\\to\\varepsilon\\) turns \\(aB\\) into the extra rule \\(a\\). After stage 2: \\(S\\to ASA\\mid aB\\mid a\\mid SA\\mid AS\\mid S\\), with \\(A\\to B\\mid S\\) and \\(B\\to b\\)." },
      { prompt: "**Stage 3 — remove unit rules.** After deleting the unit rules \\(S\\to S\\), \\(S_0\\to S\\), \\(A\\to B\\), \\(A\\to S\\), the variable \\(A\\) inherits the bodies of \\(S\\). Which rule set for \\(A\\) results?", type: "mc",
        choices: [
          "\\(A\\to b\\mid ASA\\mid aB\\mid a\\mid SA\\mid AS\\)",
          "\\(A\\to B\\mid S\\) (unit rules are left as-is in CNF)",
          "\\(A\\to\\varepsilon\\)",
          "\\(A\\to b\\) only"
        ], answer: 0,
        explain: "A unit rule \\(A\\to B\\) is replaced by copies of \\(B\\)'s (non-unit) bodies. From \\(A\\to B\\) we pick up \\(b\\); from \\(A\\to S\\) we pick up all of \\(S\\)'s bodies \\(ASA,\\ aB,\\ a,\\ SA,\\ AS\\). So \\(A\\to b\\mid ASA\\mid aB\\mid a\\mid SA\\mid AS\\). \\(S_0\\) and \\(S\\) likewise gain \\(ASA\\mid aB\\mid a\\mid SA\\mid AS\\)." },
      { prompt: "**Stage 4 — fix long RHS and lone terminals.** Take the rule \\(S_0\\to ASA\\). CNF forbids a body of three symbols and a terminal mixed with variables. How is \\(ASA\\) (and the terminal in \\(aB\\)) put into proper form?", type: "mc",
        choices: [
          "Break \\(ASA\\to A\\,A_1\\) with \\(A_1\\to SA\\); replace the terminal by \\(U\\to a\\) so \\(aB\\to UB\\)",
          "Leave \\(ASA\\) as one rule — three symbols are allowed in CNF",
          "Rewrite \\(ASA\\to a\\) and delete \\(B\\)",
          "Add \\(S_0\\to\\varepsilon\\) to shorten it"
        ], answer: 0,
        explain: "A body of length \\(k\\ge 3\\) is chained into 2-symbol rules with new variables: \\(ASA\\Rightarrow A A_1,\\ A_1\\to SA\\). A terminal that shares a body with variables is pulled out via \\(U\\to a\\), so \\(aB\\Rightarrow UB\\). Final CNF: \\(S_0\\to AA_1\\mid UB\\mid a\\mid SA\\mid AS\\), etc., matching Sipser's answer." }
    ],
    explanation: "CNF conversion is four ordered stages: (1) new start \\(S_0\\to S\\); (2) delete \\(\\varepsilon\\)-rules, adding a variant of each rule for every deleted nullable symbol; (3) delete unit rules \\(A\\to B\\), giving \\(A\\) all of \\(B\\)'s bodies; (4) shorten bodies of length \\(\\ge 3\\) with new variables and isolate stray terminals as \\(U\\to a\\).",
    whyMatters: "CNF is the normal form that makes grammars *algorithmically* tractable: parse trees become binary, a length-\\(n\\) string has a derivation of exactly \\(2n-1\\) steps, and the CYK parsing / emptiness algorithms of Chapters 4 and 7 assume it.",
    realWorld: "Parser generators and the CYK algorithm preprocess a grammar into (near-)CNF for exactly this reason — bounded rule length turns \"does this grammar derive \\(w\\)?\" into a clean dynamic-programming table.",
    source: "Sipser Ex 2.10 / Thm 2.9"
  },
  {
    id: "ch2-hcnf-stage-order", chapter: 2, topic: "Chomsky normal form", type: "order",
    prompt: "You are converting a CFG to Chomsky normal form by Sipser's procedure. Put the four stages in the order they must be applied.",
    items: [
      "Add a new start variable \\(S_0\\) with \\(S_0\\to S\\)",
      "Remove every \\(\\varepsilon\\)-rule \\(A\\to\\varepsilon\\) (patching in the deleted-occurrence variants)",
      "Remove every unit rule \\(A\\to B\\) (copying \\(B\\)'s bodies onto \\(A\\))",
      "Replace bodies of length \\(\\ge 3\\) and isolate lone terminals with rules \\(U\\to a\\)"
    ],
    explanation: "Order matters: the new start comes first so \\(S\\) never sits on a right-hand side; \\(\\varepsilon\\)-removal precedes unit-removal because clearing \\(\\varepsilon\\)-rules can create fresh unit rules (e.g. \\(S\\to S\\)); the long-body/terminal cleanup is purely local and comes last.",
    source: "Sipser Thm 2.9"
  },
  {
    id: "ch2-hcnf-epsilon-variants", chapter: 2, topic: "Chomsky normal form", type: "mc",
    prompt: "During \\(\\varepsilon\\)-rule removal, a rule \\(R\\to uAvAw\\) contains two occurrences of a nullable variable \\(A\\). Which set of rules replaces it?",
    choices: [
      "\\(R\\to uAvAw\\mid uvAw\\mid uAvw\\mid uvw\\)  (every subset of the \\(A\\)'s deleted)",
      "\\(R\\to uvw\\)  (delete both \\(A\\)'s only)",
      "\\(R\\to uAvAw\\mid\\varepsilon\\)",
      "\\(R\\to uAvAw\\)  (unchanged)"
    ],
    answer: 0,
    explanation: "When a nullable \\(A\\) can vanish, you add a copy of the rule for each way of deleting some of its occurrences — keep both, drop the first, drop the second, drop both — while keeping the original. That is exactly \\(uAvAw,\\ uvAw,\\ uAvw,\\ uvw\\).",
    source: "Sipser Thm 2.9 (proof)"
  },

  // ============================================================
  // (B) CFL PUMPING LEMMA — plug-in (pick s, place vxy)
  //     (Sipser Theorem 2.34 / Example 2.36)
  // ============================================================
  {
    id: "ch2-hpl-conditions-pick", chapter: 2, topic: "Pumping lemma (CFL)", type: "mc",
    prompt: "The pumping lemma for CFLs splits a long string as \\(s=uvxyz\\). Which three conditions must the split satisfy?",
    choices: [
      "\\(uv^ixy^iz\\in A\\) for all \\(i\\ge 0\\);  \\(|vy|>0\\);  \\(|vxy|\\le p\\)",
      "\\(uv^ixy^iz\\in A\\) for all \\(i\\ge 1\\);  \\(|v|>0\\ \\text{and}\\ |y|>0\\);  \\(|vxy|\\ge p\\)",
      "\\(u^ivx^iyz\\in A\\) for all \\(i\\ge 0\\);  \\(|vy|>0\\);  \\(|uvx|\\le p\\)",
      "\\(uvx^iyz\\in A\\) for all \\(i\\ge 0\\);  \\(|x|>0\\);  \\(|vxy|\\le p\\)"
    ],
    answer: 0,
    explanation: "Theorem 2.34: the two 'outer' middle pieces \\(v\\) and \\(y\\) pump *together* — \\(uv^ixy^iz\\in A\\) for every \\(i\\ge 0\\) (including \\(i=0\\)); \\(|vy|>0\\) means at least one of \\(v,y\\) is nonempty; and \\(|vxy|\\le p\\) keeps the pumped region short.",
    source: "Sipser Thm 2.34"
  },
  {
    id: "ch2-hpl-abc-pick-s", chapter: 2, topic: "Pumping lemma (CFL)", type: "mc",
    prompt: "To prove \\(B=\\{a^nb^nc^n\\mid n\\ge 0\\}\\) is not context free, which witness string \\(s\\) (with pumping length \\(p\\)) is the standard choice?",
    choices: [
      "\\(s=a^pb^pc^p\\)",
      "\\(s=a^pb^p\\)",
      "\\(s=(abc)^p\\)",
      "\\(s=a^{2p}b^pc^p\\)"
    ],
    answer: 0,
    explanation: "Take \\(s=a^pb^pc^p\\in B\\) with \\(|s|=3p\\ge p\\). Its rigid \"equal blocks in order\" shape is what the pumping surgery breaks. \\((abc)^p\\) is a poor choice because it can be pumped while staying in the language.",
    source: "Sipser Ex 2.36"
  },
  {
    id: "ch2-hpl-abc-plugin-p3", chapter: 2, topic: "Pumping lemma (CFL)", type: "fib",
    prompt: "Plug in a number. For \\(B=\\{a^nb^nc^n\\}\\) with pumping length \\(p=2\\), write out the witness string \\(s=a^pb^pc^p\\) as concrete letters (e.g. abc).",
    accept: ["aabbcc"],
    explanation: "\\(a^pb^pc^p\\) with \\(p=2\\) is \\(a^2b^2c^2 = aabbcc\\): two \\(a\\)s, two \\(b\\)s, two \\(c\\)s in order.",
    source: "Sipser Ex 2.36"
  },
  {
    id: "ch2-hpl-abc-case-onetype", chapter: 2, topic: "Pumping lemma (CFL)", type: "mc",
    prompt: "Case 1 of the \\(a^pb^pc^p\\) proof: suppose each of \\(v\\) and \\(y\\) lies within a single letter-block (e.g. \\(v\\) is all \\(a\\)s, \\(y\\) is all \\(b\\)s). Why does pumping to \\(uv^2xy^2z\\) leave \\(B\\)?",
    choices: [
      "It raises the counts of at most two of the three letters, so the \\(a\\), \\(b\\), \\(c\\) counts are no longer all equal",
      "It reorders the letters so the \\(a\\)s no longer come first",
      "It makes the string shorter than \\(p\\)",
      "It duplicates the whole string, giving \\(ss\\)"
    ],
    answer: 0,
    explanation: "\\(|vxy|\\le p\\) means \\(vxy\\) can span at most two adjacent blocks, so pumping can add to at most two of the three letters. The third letter's count is untouched, so equality \\(\\#a=\\#b=\\#c\\) fails and \\(uv^2xy^2z\\notin B\\).",
    source: "Sipser Ex 2.36 (case 1)"
  },
  {
    id: "ch2-hpl-abc-case-mixed", chapter: 2, topic: "Pumping lemma (CFL)", type: "mc",
    prompt: "Case 2: suppose instead \\(v\\) (or \\(y\\)) straddles a boundary and contains more than one type of letter, say \\(v=a\\cdots b\\). Now \\(uv^2xy^2z\\) might have equal counts — so what breaks?",
    choices: [
      "The letters fall out of order (an \\(a\\) after a \\(b\\), etc.), so the string is not of the form \\(a^*b^*c^*\\)",
      "The counts become unequal instead",
      "The string becomes empty",
      "Nothing breaks — this case actually stays in \\(B\\)"
    ],
    answer: 0,
    explanation: "Repeating a block that mixes two letters (e.g. \\(ab\\)) injects out-of-order letters like \\(\\dots abab\\dots\\). Even if the totals happened to match, the string no longer looks like \\(a\\)s then \\(b\\)s then \\(c\\)s, so it is not in \\(B\\). Both cases contradict the lemma, so \\(B\\) is not context free.",
    source: "Sipser Ex 2.36 (case 2)"
  },
  {
    id: "ch2-hpl-vy-together-tf", chapter: 2, topic: "Pumping lemma (CFL)", type: "tf",
    prompt: "In the CFL pumping lemma you may pump \\(v\\) and \\(y\\) independently — e.g. repeat \\(v\\) three times but \\(y\\) only once.",
    answer: false,
    explanation: "False. Condition 1 is \\(uv^ixy^iz\\): \\(v\\) and \\(y\\) share the SAME exponent \\(i\\) and must be pumped *together*. This 'linked pair' comes from the two subtrees of a repeated variable \\(R\\) on one root-to-leaf path (the parse-tree surgery), which is why the CFL lemma has two pumpable pieces, not one.",
    source: "Sipser Thm 2.34 (proof idea)"
  },
  {
    id: "ch2-hpl-ww-pick-s", chapter: 2, topic: "Pumping lemma (CFL)", type: "mc",
    prompt: "For \\(D=\\{ww\\mid w\\in\\{0,1\\}^*\\}\\), a good witness is \\(s=0^p1^p0^p1^p\\) (which is \\(ww\\) with \\(w=0^p1^p\\)). Why is the naive \\(s=0^p0^p=0^{2p}\\) a bad choice?",
    choices: [
      "\\(0^{2p}\\) can be pumped and stay in \\(D\\) (it is \\(ww\\) with \\(w=0^{p+k}\\) after adding \\(2k\\) zeros)",
      "\\(0^{2p}\\) is shorter than \\(p\\)",
      "\\(0^{2p}\\) is not in \\(D\\)",
      "\\(0^{2p}\\) has odd length"
    ],
    answer: 0,
    explanation: "A witness must be a string the adversary *cannot* pump. Pumping zeros in \\(0^{2p}\\) keeps an even number of zeros, so it stays \\(ww\\) — no contradiction. The richer \\(0^p1^p0^p1^p\\) forces the pumped region (length \\(\\le p\\)) to disrupt the two-halves matching, giving the contradiction.",
    source: "Sipser §2.3 (choosing witnesses)"
  },

  // ============================================================
  // (C) AMBIGUITY — two parse trees / leftmost derivations
  //     (Sipser Def 2.7, grammar G5, string a+a×a)
  // ============================================================
  {
    id: "ch2-hamb-leftmost-def", chapter: 2, topic: "Derivations & parse trees", type: "mc",
    prompt: "What is a **leftmost derivation** of a string in a CFG?",
    choices: [
      "A derivation in which, at every step, the leftmost remaining variable is the one replaced",
      "A derivation that uses the leftmost rule listed for each variable",
      "A derivation that produces the shortest string",
      "A derivation drawn as a tree instead of a sequence"
    ],
    answer: 0,
    explanation: "A leftmost derivation fixes the replacement order: always expand the leftmost variable next. Ambiguity is then defined via leftmost derivations so that two derivations differing only in the *order* of independent replacements are not counted as different.",
    source: "Sipser §2.1 (leftmost derivation), Def 2.7"
  },
  {
    id: "ch2-hamb-def-ambiguous", chapter: 2, topic: "Ambiguity", type: "mc",
    prompt: "By Sipser's Definition 2.7, a grammar \\(G\\) is **ambiguous** exactly when:",
    choices: [
      "some string is generated with two or more different leftmost derivations (equivalently, two different parse trees)",
      "some string has two different derivations, even if they differ only in the order of replacements",
      "the grammar has two different rules with the same left-hand side",
      "the grammar contains a rule \\(A\\to A\\)"
    ],
    answer: 0,
    explanation: "Ambiguity is about *structure*: a grammar is ambiguous if some string has \\(\\ge 2\\) leftmost derivations, i.e. two genuinely different parse trees. Merely reordering independent replacements is NOT ambiguity — that is why the definition is stated with leftmost derivations.",
    source: "Sipser Def 2.7"
  },
  {
    id: "ch2-hamb-parsetree-plus-first", chapter: 2, topic: "Parse trees", type: "mc",
    prompt: "Consider the expression grammar \\(E\\to E+E\\mid E\\times E\\mid (E)\\mid a\\) on the string \\(a+a\\times a\\). The parse tree below applies \\(E\\to E+E\\) at the root. What grouping does it encode?",
    diagram: { width: 460, height: 250, states: [
      { id: "r",  x: 230, y: 30,  label: "E" },
      { id: "l1", x: 120, y: 100, label: "E" },
      { id: "p",  x: 230, y: 100, label: "+" },
      { id: "r1", x: 340, y: 100, label: "E" },
      { id: "la", x: 120, y: 170, label: "a" },
      { id: "rl", x: 250, y: 170, label: "E" },
      { id: "tm", x: 340, y: 170, label: "×" },
      { id: "rr", x: 430, y: 170, label: "E" },
      { id: "b1", x: 250, y: 225, label: "a" },
      { id: "b2", x: 430, y: 225, label: "a" }
    ], edges: [
      { from: "r",  to: "l1" }, { from: "r", to: "p" }, { from: "r", to: "r1" },
      { from: "l1", to: "la" },
      { from: "r1", to: "rl" }, { from: "r1", to: "tm" }, { from: "r1", to: "rr" },
      { from: "rl", to: "b1" }, { from: "rr", to: "b2" }
    ] },
    choices: [
      "\\(a+(a\\times a)\\) — the multiplication is grouped first, then added",
      "\\((a+a)\\times a\\) — the addition is grouped first, then multiplied",
      "\\((a+a\\times a)\\) with no grouping",
      "\\(a\\times(a+a)\\)"
    ],
    answer: 0,
    explanation: "The root splits as \\(E+E\\) with the *right* \\(E\\) expanding to \\(E\\times E\\). So \\(a\\times a\\) is a single subtree that becomes the right operand of \\(+\\): the tree means \\(a+(a\\times a)\\).",
    source: "Sipser §2.1 (grammar G5, Fig 2.6)"
  },
  {
    id: "ch2-hamb-two-trees-why", chapter: 2, topic: "Ambiguity", type: "mc",
    prompt: "The same grammar \\(E\\to E+E\\mid E\\times E\\mid (E)\\mid a\\) also has a second parse tree for \\(a+a\\times a\\) that applies \\(E\\to E\\times E\\) at the root, giving \\((a+a)\\times a\\). What does the existence of these two trees show?",
    choices: [
      "The grammar is ambiguous — one string has two different parse trees, so \\(a+a\\times a\\) has two meanings",
      "The language is not context free",
      "The grammar is in Chomsky normal form",
      "The string \\(a+a\\times a\\) is not in the language"
    ],
    answer: 0,
    explanation: "Two distinct parse trees for a single string is precisely ambiguity (Def 2.7). Here the grammar fails to encode precedence, so it can group \\(+\\) before \\(\\times\\) or vice versa. Sipser's \\(G_4\\) fixes this with separate variables for term/factor, yielding a unique tree per string.",
    source: "Sipser §2.1 (G5 ambiguous, G4 unambiguous)"
  },
  {
    id: "ch2-hamb-leftmost-count-tf", chapter: 2, topic: "Derivations & parse trees", type: "tf",
    prompt: "For the grammar \\(E\\to E+E\\mid E\\times E\\mid (E)\\mid a\\), the string \\(a+a\\times a\\) has exactly two different leftmost derivations, matching its two parse trees.",
    answer: true,
    explanation: "Each parse tree corresponds to exactly one leftmost derivation, and \\(a+a\\times a\\) has two parse trees (root \\(+\\) vs. root \\(\\times\\)), hence two leftmost derivations. That two-to-two correspondence is why Sipser defines ambiguity via leftmost derivations.",
    source: "Sipser Def 2.7"
  },

  // ============================================================
  // (D) CFG -> PDA — simulate a leftmost derivation on the stack
  //     (Sipser Lemma 2.21)
  // ============================================================
  {
    id: "ch2-hpda-sim-stack", chapter: 2, topic: "CFG/PDA equivalence", type: "mc",
    prompt: "To turn a CFG into an equivalent PDA (Sipser's Lemma 2.21), the PDA simulates a **leftmost derivation** on its stack. It first pushes the start variable (over a bottom marker \\(\\$\\)), then loops. The strip shows the stack while deriving with \\(S\\to aTb\\). What are the two kinds of loop move?",
    svg: '<svg viewBox="0 0 470 180" xmlns="http://www.w3.org/2000/svg" font-family="Georgia, \'Times New Roman\', serif"><text x="60" y="20" text-anchor="middle" font-size="12" fill="var(--muted)">push S$</text><text x="235" y="20" text-anchor="middle" font-size="12" fill="var(--muted)">expand S→aTb</text><text x="410" y="20" text-anchor="middle" font-size="12" fill="var(--muted)">match a, pop</text><g stroke="var(--brand)" stroke-width="1.5" fill="var(--panel)"><rect x="30" y="100" width="60" height="26"/><rect x="30" y="126" width="60" height="26"/></g><text x="60" y="118" text-anchor="middle" font-size="14" fill="var(--ink)" font-style="italic">S</text><text x="60" y="144" text-anchor="middle" font-size="14" fill="var(--ink)">$</text><g stroke="var(--brand)" stroke-width="1.5" fill="var(--panel)"><rect x="205" y="48" width="60" height="26"/><rect x="205" y="74" width="60" height="26"/><rect x="205" y="100" width="60" height="26"/><rect x="205" y="126" width="60" height="26"/></g><text x="235" y="66" text-anchor="middle" font-size="14" fill="var(--ink)" font-style="italic">a</text><text x="235" y="92" text-anchor="middle" font-size="14" fill="var(--ink)" font-style="italic">T</text><text x="235" y="118" text-anchor="middle" font-size="14" fill="var(--ink)" font-style="italic">b</text><text x="235" y="144" text-anchor="middle" font-size="14" fill="var(--ink)">$</text><g stroke="var(--brand)" stroke-width="1.5" fill="var(--panel)"><rect x="380" y="74" width="60" height="26"/><rect x="380" y="100" width="60" height="26"/><rect x="380" y="126" width="60" height="26"/></g><text x="410" y="92" text-anchor="middle" font-size="14" fill="var(--ink)" font-style="italic">T</text><text x="410" y="118" text-anchor="middle" font-size="14" fill="var(--ink)" font-style="italic">b</text><text x="410" y="144" text-anchor="middle" font-size="14" fill="var(--ink)">$</text><g stroke="var(--ink-soft)" stroke-width="1.5" fill="none" marker-end="url(#a)"><path d="M96 113 L199 100"/><path d="M271 100 L374 105"/></g><defs><marker id="a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="var(--ink-soft)"/></marker></defs></svg>',
    choices: [
      "Variable on top → pop it and push the right-hand side of one of its rules (chosen nondeterministically); terminal on top → read the next input symbol and pop if it matches",
      "Variable on top → accept; terminal on top → push it again",
      "Always pop two symbols and push one, like the GNFA rip rule",
      "Read the whole input first, then compare it to the stack"
    ],
    answer: 0,
    explanation: "The PDA keeps the *tail* of the current leftmost sentential form on the stack. When a **variable** \\(A\\) is on top, it replaces it with the body of some rule \\(A\\to w\\) (nondeterministically guessing the derivation). When a **terminal** is on top, it must match the next input symbol and pop. Reaching \\(\\$\\) with all input consumed accepts.",
    source: "Sipser Lemma 2.21"
  },
  {
    id: "ch2-hpda-init-fib", chapter: 2, topic: "CFG/PDA equivalence", type: "fib",
    prompt: "In the CFG-to-PDA construction, before the main loop the PDA pushes two symbols onto the stack: the start variable \\(S\\) on top and, beneath it, a special bottom-of-stack marker written as which single symbol?",
    accept: ["$", "\\$", "dollar", "dollar sign"],
    explanation: "The PDA initializes its stack to \\(S\\$\\): the start variable \\(S\\) on top of the end-marker \\(\\$\\). Seeing \\(\\$\\) again later means the stack is effectively empty, which is the PDA's way of testing for an empty stack.",
    source: "Sipser Lemma 2.21 (step 1)"
  },
  {
    id: "ch2-hpda-nondet-role", chapter: 2, topic: "CFG/PDA equivalence", type: "mc",
    prompt: "When the PDA has a variable \\(A\\) on top of the stack and \\(A\\) has several rules \\(A\\to w_1\\mid w_2\\mid\\cdots\\), how does the PDA decide which rule to apply?",
    choices: [
      "Nondeterministically — it guesses a rule; some branch corresponds to a correct derivation iff the input is in the language",
      "It always uses the first rule and backtracks by rewinding the input",
      "It uses the rule whose body is shortest",
      "It reads ahead in the input to compute the right rule deterministically"
    ],
    answer: 0,
    explanation: "The PDA is nondeterministic: it *guesses* which rule to fire for \\(A\\). If \\(w\\) is generated by \\(G\\), then some sequence of guesses reconstructs a leftmost derivation of \\(w\\) and that branch accepts; if \\(w\\notin L(G)\\), no branch can. Nondeterminism is what lets the PDA search all derivations.",
    source: "Sipser Lemma 2.21 (proof idea)"
  },
  {
    id: "ch2-hpda-equiv-tf", chapter: 2, topic: "CFG/PDA equivalence", type: "tf",
    prompt: "Because a CFG can be converted to a PDA and a PDA back to a CFG, pushdown automata and context-free grammars recognize/generate exactly the same class of languages.",
    answer: true,
    explanation: "Theorem 2.20: a language is context free iff some PDA recognizes it. Lemma 2.21 gives CFG \\(\\to\\) PDA (simulate a leftmost derivation on the stack); the converse direction builds a CFG from a PDA. Together they establish PDA \\(\\equiv\\) CFG, so you may prove a language context free by giving *either* one.",
    source: "Sipser Thm 2.20"
  }

]);
