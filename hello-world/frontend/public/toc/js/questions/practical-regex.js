/* Practical regular expressions — how regex is used in the real world to match
   file types, emails, and validate input — and where practical "regex" meets
   (and exceeds) the formal regular languages of Chapter 1. Regex patterns are
   written in `code` spans (NOT KaTeX); a literal backslash is "\\" in the JS
   string. type: tf/mc/fib + two discussions. */
TOC.addQuestions([

  {
    id: "ch1-regex-image-ext", chapter: 1, topic: "Regular expressions", type: "mc", rank: 20,
    prompt: "You want to match filenames that end in an image extension — `.jpg`, `.png`, or `.gif`. Which regular expression does this **correctly**?",
    choices: [
      "`\\.(jpg|png|gif)$`",
      "`\\.(jpg|png|gif)` (no end anchor)",
      "`(jpg|png|gif)` (no dot, no anchor)",
      "`\\.[jpg|png|gif]$` (square brackets)"
    ],
    answer: 0,
    explanation: "`\\.` matches a literal dot (an unescaped `.` matches ANY character), the group `(jpg|png|gif)` lists the alternatives, and `$` anchors them to the END of the name. The `[jpg|png|gif]` version is a classic bug — square brackets are a character class that matches a SINGLE character from the set `j,p,g,|,n,i`, not one of the words.",
    source: "Regular expressions in practice (Sipser 1.3)"
  },

  {
    id: "ch1-regex-dot-any", chapter: 1, topic: "Regular expressions", type: "mc", rank: 15,
    prompt: "In the pattern `a.c`, the middle character is an unescaped dot. Which strings does `a.c` match?",
    choices: [
      "Any 3-character string starting with `a` and ending with `c` — `abc`, `a7c`, and `a.c` all match",
      "Only the exact string `a.c`",
      "Only `a`, then a digit, then `c`",
      "Strings of any length that start with `a` and end with `c`"
    ],
    answer: 0,
    explanation: "An unescaped `.` matches ANY single character. To match a literal period you escape it as `\\.` — which is exactly why file-extension patterns are written `\\.txt`, not `.txt` (the latter would also match `aXtxt` or `1xtxt`).",
    source: "Regular expressions in practice"
  },

  {
    id: "ch1-regex-anchors", chapter: 1, topic: "Regular expressions", type: "mc", rank: 18,
    prompt: "What is the role of `^` and `$` in `^\\d{5}$` (validating a 5-digit US ZIP code)?",
    choices: [
      "They anchor the match to the start and end, forcing the WHOLE string to be exactly 5 digits",
      "They match the literal characters `^` and `$`",
      "They make the digits optional",
      "They reverse the match direction"
    ],
    answer: 0,
    explanation: "`^` anchors to the start, `$` to the end. Without them, `\\d{5}` would match 5 digits ANYWHERE inside a longer string — so `abc12345xyz` would pass. Anchors are what turn a 'find a substring' search into a 'validate the entire input' check.",
    source: "Regular expressions in practice"
  },

  {
    id: "ch1-regex-ext-anchor", chapter: 1, topic: "Regular expressions", type: "mc", rank: 20,
    prompt: "A program lists text files with the pattern `\\.txt$`. Why does it end with `$`?",
    choices: [
      "So `.txt` must be at the END — `notes.txt` matches, but `txt_archive.zip` and `notes.txt.bak` do not",
      "`$` matches a literal dollar sign in the name",
      "`$` makes the whole pattern case-insensitive",
      "`$` repeats the previous character"
    ],
    answer: 0,
    explanation: "`$` anchors to the end of the string, so the extension must be the LAST thing. Without it, `\\.txt` would match `report.txt.bak` — the `.txt` appears but isn't the real extension. Identifying the true file type means anchoring to the end.",
    source: "Regular expressions in practice"
  },

  {
    id: "ch1-regex-d-class", chapter: 1, topic: "Regular expressions", type: "mc", rank: 12,
    prompt: "Which shorthand character class matches a single **digit** (`0`–`9`)?",
    choices: ["`\\d`", "`\\w`", "`\\s`", "`\\D`"],
    answer: 0,
    explanation: "`\\d` = one digit. `\\w` = one 'word' character (letter, digit, or underscore), `\\s` = one whitespace character, and `\\D` is the negation — any NON-digit. These shorthands are what make a phone-number pattern like `\\d{3}-\\d{4}` so compact.",
    source: "Regular expressions in practice"
  },

  {
    id: "ch1-regex-plus", chapter: 1, topic: "Regular expressions", type: "mc", rank: 12,
    prompt: "What does the quantifier `+` mean (as in `\\d+`)?",
    choices: [
      "One or more of the preceding item",
      "Zero or more of the preceding item",
      "Exactly one",
      "Zero or one (optional)"
    ],
    answer: 0,
    explanation: "`+` = one or more. Compare `*` = zero or more, `?` = zero or one (optional), and `{n}` = exactly n. So `\\d+` matches a run of one or more digits — like the numeric part of an order ID.",
    source: "Regular expressions in practice (Sipser 1.3 — the star/plus operators)"
  },

  {
    id: "ch1-regex-charclass", chapter: 1, topic: "Regular expressions", type: "mc", rank: 14,
    prompt: "What does the character class `[a-z]` match?",
    choices: [
      "Exactly one lowercase letter in the range a–z",
      "The literal three characters `a`, `-`, `z`",
      "One or more lowercase letters",
      "Any letter, upper- or lower-case"
    ],
    answer: 0,
    explanation: "`[a-z]` matches a SINGLE character in the range a–z. To match a run of them, add a quantifier: `[a-z]+`. For both cases you'd write `[a-zA-Z]`. Character classes are how you say 'one of these characters' compactly.",
    source: "Regular expressions in practice"
  },

  {
    id: "ch1-regex-email-at", chapter: 1, topic: "Regular expressions", type: "mc", rank: 25,
    prompt: "A basic email check uses `^[^@\\s]+@[^@\\s]+\\.[a-z]+$`. What does the `[^@\\s]+` before the `@` match?",
    choices: [
      "One or more characters that are neither `@` nor whitespace (the local part, e.g. `alice`)",
      "Exactly one `@` sign",
      "Any characters at all, including `@`",
      "Only lowercase letters"
    ],
    answer: 0,
    explanation: "`[^@\\s]` is a NEGATED class — any character except `@` or whitespace; `+` means one or more. Writing `[^@]+@[^@]+` cleverly forces EXACTLY one `@`, because neither side may contain another. The trailing `\\.[a-z]+` then requires a dot and a domain ending like `com`.",
    source: "Regular expressions in practice"
  },

  {
    id: "ch1-regex-anchor-term", chapter: 1, topic: "Regular expressions", type: "fib", rank: 16,
    prompt: "A regex token like `^`, `$`, or `\\b` that matches a *position* in the string (rather than consuming an actual character) is called a(n) ___.",
    accept: ["anchor", "anchors", "an anchor"],
    explanation: "Anchors match positions, not characters: `^` (start), `$` (end), `\\b` (word boundary). They consume nothing — they assert *where* a match must occur, which is how you pin a pattern to the start or end of an input.",
    source: "Regular expressions in practice"
  },

  {
    id: "ch1-regex-nesting", chapter: 1, topic: "Regular vs nonregular", type: "tf", rank: 28,
    prompt: "True or false: a true regular expression cannot match arbitrarily deeply nested brackets — `()`, `(())`, `((()))`, … for *every* depth — no matter how cleverly it is written.",
    answer: true,
    explanation: "True. Balanced, arbitrarily-deep nesting is a NON-regular language: matching the counts needs unbounded memory a finite automaton doesn't have (the `\\(0^n1^n\\)` idea). This is the formal reason behind the famous warning that you cannot reliably parse HTML or nested tags with regex.",
    source: "Sipser 1.4 (nonregularity)"
  },

  {
    id: "ch1-regex-backref", chapter: 1, topic: "Regular vs nonregular", type: "tf", rank: 30,
    prompt: "Many regex engines support **backreferences** — e.g. `(.+)\\1` matches a chunk followed by an identical copy, like `abcabc`. True or false: the 'copy' language \\(\\{ww \\mid w\\in\\Sigma^*\\}\\) this describes is NOT a regular language.",
    answer: true,
    explanation: "True. `\\(ww\\)` (a string repeated) is a classic non-regular language — provable with the pumping lemma. Backreferences give practical 'regex' power BEYOND formal regular expressions, which is exactly why theory and practice diverge: a backreference pattern can describe things no finite automaton can.",
    source: "Sipser 1.4 (nonregularity)"
  },

  {
    id: "ch1-regex-ssn", chapter: 1, topic: "Regular expressions", type: "mc", rank: 22,
    prompt: "What kind of input does `^\\d{3}-\\d{2}-\\d{4}$` validate?",
    choices: [
      "A US Social-Security-number format like `123-45-6789` (3, then 2, then 4 digits, dash-separated)",
      "Any string that contains 9 digits somewhere",
      "A date written `YYYY-MM-DD`",
      "A 9-letter word"
    ],
    answer: 0,
    explanation: "`\\d{3}-\\d{2}-\\d{4}` matches three digits, a dash, two digits, a dash, four digits, and the `^`…`$` anchors force the WHOLE string to fit. This shows how `{n}` exact counts plus literal separators pin down fixed formats — SSNs, ZIP+4, credit-card groupings, and the like.",
    source: "Regular expressions in practice"
  },

  /* ----- discussion: dissecting an email regex ----- */
  {
    id: "disc-ch1-regex-email", chapter: 1, topic: "Regular expressions", type: "discussion", rank: 24,
    prompt: "**How does a website check that you typed a real email address?** It runs your input against a regular expression. Let's dissect a simple one, piece by piece: `^[^@\\s]+@[^@\\s]+\\.[a-z]{2,}$`",
    steps: [
      { prompt: "The pattern starts with `^` and ends with `$`. What do these anchors accomplish?", type: "mc",
        choices: [
          "They force the ENTIRE input to match — no extra text allowed before or after",
          "They match the literal characters `^` and `$`",
          "They make the match case-insensitive"
        ], answer: 0,
        explain: "Anchors mean the whole string must be a valid email, not merely contain one somewhere. Without them, `hi alice@x.com !!!` would 'match' on the middle part." },
      { prompt: "What does `[^@\\s]+` (which appears on both sides of the `@`) match, and why a NEGATED class?", type: "mc",
        choices: [
          "One or more characters that aren't `@` or whitespace — and putting it on both sides forces EXACTLY one `@`",
          "Exactly one `@` symbol",
          "Any characters at all, including `@` and spaces"
        ], answer: 0,
        explain: "`[^@\\s]` = 'not @ and not whitespace'. With `[^@]+@[^@]+`, neither side can contain another `@`, so there is exactly one — a tidy trick for 'exactly one separator'." },
      { prompt: "The tail is `\\.[a-z]{2,}`. What does it require of the domain?", type: "mc",
        choices: [
          "A literal dot, then at least two letters — a TLD like `com`, `org`, or `io`",
          "Any two characters",
          "Exactly two letters, no more"
        ], answer: 0,
        explain: "`\\.` is an escaped (literal) dot and `[a-z]{2,}` is two-or-more lowercase letters. So `alice@host` fails (no dot+TLD) while `alice@host.com` passes." },
      { prompt: "True or false: this regex will still accept some addresses that can't actually receive mail, and reject some unusual-but-valid ones.", type: "tf", answer: true,
        explain: "True — practical email validation is always an approximation. The fully-correct grammar (RFC 5322) is monstrous, so real systems use a 'good enough' regex and then send a confirmation link. A regex checks SHAPE, not deliverability." }
    ],
    explanation: "An email validator is a regular expression read left to right: anchors pin the whole string, negated classes force a single `@`, and an escaped dot plus a letter-run demand a TLD. It is a finite-state check on the string's *shape*.",
    whyMatters: "Input validation is one of the most common real uses of regular expressions — and a daily reminder that a regex matches a string's *shape*, not its *meaning*: a perfectly-formed address can still bounce.",
    realWorld: "Every signup form, the HTML `<input type=\"email\">` element, and countless server-side checks use a regex like this — then pair it with a real confirmation email, because no regex can guarantee an address actually works.",
    source: "Regular expressions in practice (Sipser 1.3)"
  },

  /* ----- discussion: how software identifies a file type ----- */
  {
    id: "disc-ch1-regex-filetype", chapter: 1, topic: "Regular expressions", type: "discussion", rank: 26,
    prompt: "**How does your computer know a file is a PNG image?** There are two very different answers — and one of them is a regular expression. Let's compare them.",
    steps: [
      { prompt: "The quick method: look at the filename's extension. Which regex tests 'ends in `.png`'?", type: "mc",
        choices: ["`\\.png$`", "`png`", "`.png` (unescaped dot)", "`^png`"], answer: 0,
        explain: "`\\.png$` — escaped dot, then `png`, anchored to the end. Bare `.png` would match `axpng` (the `.` matches any char); `png` alone matches anywhere; `^png` anchors to the START instead." },
      { prompt: "True or false: trusting the extension is easy but unreliable — anyone can rename `virus.exe` to `cat.png`, and it's still an executable.", type: "tf", answer: true,
        explain: "True. The extension is just text in the name, so a regex on it is a fast finite-state check that says nothing about the actual bytes — a real security gap." },
      { prompt: "The reliable method: check the file's first bytes — its 'magic number'. A PNG always starts with the bytes `89 50 4E 47` (`.PNG`). How is this like the regex check?", type: "mc",
        choices: [
          "Both match a FIXED pattern at a FIXED position — a finite-state check, just on bytes instead of name text",
          "It isn't — reading magic numbers requires a stack",
          "Magic-number checks need backtracking"
        ], answer: 0,
        explain: "Reading a fixed signature at the start is an anchored pattern match (think `^\\x89PNG`) over bytes rather than characters — still regular, still finite-state. It's more reliable because the bytes are intrinsic to the file." },
      { prompt: "What can NEITHER a name-regex nor a magic-number check do?", type: "mc",
        choices: [
          "Verify the file's full internal structure is valid — that needs real parsing, beyond a regular expression",
          "Read the first byte of the file",
          "Match a literal dot"
        ], answer: 0,
        explain: "Confirming a file is COMPLETELY valid means parsing its nested structure (chunks, lengths, checksums) — context-free or beyond. A regex / magic-number check only inspects a bounded prefix; full validation needs a stronger machine." }
    ],
    explanation: "Identifying a file by extension (a regex on the name) or by magic number (a regex on the leading bytes) are both finite-state, anchored pattern matches — fast but shallow. Verifying the file's full structure needs real parsing beyond the regular languages.",
    whyMatters: "It's a perfect illustration of the regular-language boundary in the wild: matching a fixed signature is finite-state, but validating nested structure is not — the very line between Chapter 1 and Chapter 2.",
    realWorld: "The Unix `file` command and web browsers sniff 'magic numbers' to detect a type regardless of extension; upload validators check both the extension and the signature — yet still can't trust a file is well-formed without actually parsing it.",
    source: "Regular expressions in practice (Sipser 1.3)"
  }

]);
