// IDE-styled code panel mimicking JetBrains Rider chrome — the same
// "actual code as content" element used in the streaming overlay's
// code_panel.html. Lives next to the hero on the home page as visible
// proof of "real code, not stock photos."
//
// The syntax highlighter here is intentionally tiny and hand-rolled
// (~50 lines) — Prism / Shiki would add a dep we don't want for a
// single visual element. Tokens for keyword / type / func / string /
// comment / number cover what we need for short snippets.
//
// Props:
//   filename   — shown in the chrome tab (e.g. "diagnostics.js")
//   language   — 'js' | 'ts' | 'cpp' — picks the keyword set
//   code       — the source string. Multi-line; preserves indentation.
//   status     — tiny right-side status pill ('RUNNING', 'PAUSED', etc.)
//   maxHeight  — caps the panel height; content overflows scroll
//
// Width is parent-driven. Drop it inside a column or grid cell.

import { useMemo } from 'react';
import { colors, fonts, fontSizes, radii, shadows } from '../theme.js';

const KEYWORDS = {
  js: new Set([
    'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for',
    'while', 'await', 'async', 'try', 'catch', 'throw', 'new', 'class',
    'extends', 'this', 'export', 'import', 'from', 'default', 'true',
    'false', 'null', 'undefined', 'typeof', 'in', 'of'
  ]),
  ts: new Set([
    'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for',
    'while', 'await', 'async', 'try', 'catch', 'throw', 'new', 'class',
    'extends', 'this', 'export', 'import', 'from', 'default', 'true',
    'false', 'null', 'undefined', 'typeof', 'in', 'of', 'interface',
    'type', 'enum', 'public', 'private', 'protected', 'readonly'
  ]),
  cpp: new Set([
    'void', 'int', 'float', 'double', 'bool', 'char', 'auto', 'const',
    'static', 'class', 'struct', 'public', 'private', 'protected',
    'return', 'if', 'else', 'for', 'while', 'true', 'false', 'nullptr',
    'this', 'override', 'virtual', 'inline', 'template', 'typename',
    'namespace', 'using', 'new', 'delete'
  ])
};

function tokenize(line, keywords) {
  const tokens = [];
  let i = 0;
  while (i < line.length) {
    const ch = line[i];

    // Line comment.
    if (ch === '/' && line[i + 1] === '/') {
      tokens.push({ t: 'comment', v: line.slice(i) });
      break;
    }

    // String literal — handle ", ', `.
    if (ch === '"' || ch === "'" || ch === '`') {
      const quote = ch;
      let j = i + 1;
      while (j < line.length && line[j] !== quote) {
        if (line[j] === '\\') j++;
        j++;
      }
      tokens.push({ t: 'string', v: line.slice(i, j + 1) });
      i = j + 1;
      continue;
    }

    // Number.
    if (/[0-9]/.test(ch)) {
      let j = i;
      while (j < line.length && /[0-9_.]/.test(line[j])) j++;
      tokens.push({ t: 'number', v: line.slice(i, j) });
      i = j;
      continue;
    }

    // Identifier — could be keyword, type, function call, or plain.
    if (/[A-Za-z_$]/.test(ch)) {
      let j = i;
      while (j < line.length && /[A-Za-z0-9_$]/.test(line[j])) j++;
      const word = line.slice(i, j);

      if (keywords.has(word)) {
        tokens.push({ t: 'keyword', v: word });
      } else if (/^[A-Z]/.test(word)) {
        // Capitalised — treat as a type / class (FString, APenumbra, etc.)
        tokens.push({ t: 'type', v: word });
      } else if (line[j] === '(') {
        // Followed by paren — function call.
        tokens.push({ t: 'func', v: word });
      } else {
        tokens.push({ t: 'plain', v: word });
      }
      i = j;
      continue;
    }

    // Anything else (punctuation, whitespace) — emit verbatim.
    tokens.push({ t: 'plain', v: ch });
    i++;
  }
  return tokens;
}

const TOKEN_COLORS = {
  keyword: colors.codeKeyword,
  type: colors.codeType,
  func: colors.codeFunc,
  string: colors.codeString,
  comment: colors.codeComment,
  number: colors.codeNumber,
  plain: colors.text
};

export default function CodePanel({
  filename = 'diagnostics.js',
  language = 'js',
  code,
  status = 'RUNNING',
  maxHeight,
  style
}) {
  const lines = useMemo(
    () => (code ?? '').replace(/\t/g, '  ').split('\n'),
    [code]
  );
  const keywords = KEYWORDS[language] || KEYWORDS.js;

  return (
    <div
      style={{
        background: colors.codeBg,
        border: `1px solid ${colors.borderAccent}`,
        borderRadius: radii.lg,
        boxShadow: shadows.md,
        overflow: 'hidden',
        fontFamily: fonts.mono,
        fontSize: fontSizes.sm,
        ...style
      }}
    >
      {/* Chrome bar with the tab and status pill */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.4rem 0.75rem',
          background: colors.codeChrome,
          borderBottom: `1px solid ${colors.borderAccent}`
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span
            style={{
              display: 'inline-flex',
              gap: 6,
              alignItems: 'center'
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#fb7185' }} />
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#fbbf24' }} />
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#5eead4' }} />
          </span>
          <span
            style={{
              padding: '0.2rem 0.6rem',
              background: colors.codeBg,
              border: `1px solid ${colors.border}`,
              borderRadius: radii.sm,
              fontSize: '0.75rem',
              color: colors.text,
              fontWeight: 500
            }}
          >
            {filename}
          </span>
        </div>
        <span
          style={{
            fontSize: '0.7rem',
            color: colors.accent,
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: colors.accent,
              boxShadow: `0 0 6px ${colors.accent}`
            }}
          />
          {status}
        </span>
      </div>

      {/* Body with gutter and tokenised source */}
      <div
        style={{
          display: 'flex',
          maxHeight: maxHeight || 'none',
          overflow: 'auto'
        }}
      >
        <div
          style={{
            padding: '0.75rem 0.5rem 0.75rem 0.75rem',
            color: colors.codeComment,
            background: colors.codeBg,
            fontSize: '0.78rem',
            lineHeight: '1.55em',
            userSelect: 'none',
            borderRight: `1px solid ${colors.borderSubtle}`,
            textAlign: 'right',
            minWidth: '2.25rem'
          }}
        >
          {lines.map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
        <pre
          style={{
            margin: 0,
            padding: '0.75rem 1rem',
            fontFamily: fonts.mono,
            fontSize: '0.82rem',
            lineHeight: '1.55em',
            color: colors.text,
            overflow: 'auto',
            flex: 1,
            whiteSpace: 'pre'
          }}
        >
          {lines.map((line, idx) => (
            <div key={idx}>
              {line.length === 0 ? (
                <span>&nbsp;</span>
              ) : (
                tokenize(line, keywords).map((tok, ti) => (
                  <span key={ti} style={{ color: TOKEN_COLORS[tok.t] }}>
                    {tok.v}
                  </span>
                ))
              )}
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
}
