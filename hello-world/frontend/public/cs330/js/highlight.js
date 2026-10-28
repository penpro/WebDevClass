/* Tiny syntax highlighter (SQL / Cypher / Mongo / Redis-style) + keyword check.
   Highlights only exact-UPPERCASE keywords, so lowercase column names stay plain. */
(function (root) {
  var CS = (root.CS = root.CS || {});

  var KW = {};
  ("SELECT FROM WHERE AND OR NOT NULL IS IN LIKE BETWEEN ORDER BY GROUP HAVING LIMIT OFFSET ASC DESC DISTINCT AS ON " +
   "JOIN INNER LEFT RIGHT OUTER CROSS FULL UNION ALL INTERSECT EXCEPT EXISTS INSERT INTO VALUES UPDATE SET DELETE " +
   "CREATE TABLE ALTER ADD DROP COLUMN CONSTRAINT PRIMARY KEY FOREIGN REFERENCES UNIQUE CHECK DEFAULT " +
   "INTEGER INT TEXT REAL DATE DATETIME TIMESTAMP VARCHAR BOOLEAN CASE WHEN THEN ELSE END COUNT SUM AVG MIN MAX " +
   "MODIFY AUTO_INCREMENT MATCH RETURN CURRENT_TIMESTAMP DEL GET USE DATABASE DESCRIBE").split(" ")
    .forEach(function (k) { KW[k] = 1; });

  function esc(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

  var TOKEN = /(--[^\n]*|\/\/[^\n]*)|('(?:[^']|'')*'|"(?:[^"\\\n]|\\.)*")|(\b\d+(?:\.\d+)?\b)|([A-Za-z_][A-Za-z0-9_]*)|([\s\S])/g;

  CS.highlight = function (code) {
    var out = "", m;
    TOKEN.lastIndex = 0;
    while ((m = TOKEN.exec(code)) !== null) {
      if (m[1] != null) out += '<span class="tk-c">' + esc(m[1]) + "</span>";
      else if (m[2] != null) out += '<span class="tk-s">' + esc(m[2]) + "</span>";
      else if (m[3] != null) out += '<span class="tk-n">' + esc(m[3]) + "</span>";
      else if (m[4] != null) out += (m[4] === m[4].toUpperCase() && KW[m[4]]) ? '<span class="tk-k">' + m[4] + "</span>" : esc(m[4]);
      else out += esc(m[5]);
    }
    return out;
  };

  // Keywords the reference answer's CODE uses (fenced blocks and `inline code`),
  // and which of them appear in the learner's attempt. A hint only: it can say
  // "you never wrote LIMIT", not whether the query is right. Needs >= 2 keywords.
  CS.keywordCheck = function (answerMd, attempt) {
    var segs = (answerMd.match(/```[\s\S]*?```/g) || []).concat(answerMd.match(/`[^`\n]+`/g) || []);
    var needed = [], seen = {};
    segs.join("\n").replace(/\b[A-Z][A-Z_]+\b/g, function (w) {
      if (KW[w] && !seen[w]) { seen[w] = 1; needed.push(w); }
      return w;
    });
    if (needed.length < 2) return null;
    var found = [], missing = [];
    needed.forEach(function (k) {
      (new RegExp("\\b" + k + "\\b", "i").test(attempt) ? found : missing).push(k);
    });
    return { needed: needed, found: found, missing: missing };
  };
})(typeof window !== "undefined" ? window : globalThis);
