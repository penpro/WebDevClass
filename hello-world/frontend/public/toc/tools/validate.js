/* Validates question files: schema, answer ranges, KaTeX delimiter balance,
   and (if KaTeX is available) that every math snippet actually parses.
   Usage:  node tools/validate.js          (all chapter files)
           node tools/validate.js 4         (only js/questions/ch4.js)
           node tools/validate.js exam      (only js/questions/exam.js) */
var fs = require("fs"), path = require("path");
require("../js/config.js");
require("../js/questions/_registry.js");
var TOC = globalThis.TOC;

var only = process.argv[2];
var files = [];
function add(name) { var p = path.join(__dirname, "..", "js", "questions", name + ".js"); if (fs.existsSync(p)) files.push([name, p]); }
if (only) { var nm = only.replace(/^ch/, "").match(/^\d+$/) ? "ch" + only.replace(/^ch/, "") : only; add(nm); add(nm + "-defs"); }
else { for (var i = 0; i <= 8; i++) { add("ch" + i); add("ch" + i + "-defs"); add("ch" + i + "-hands-on"); } add("exam1"); add("exam2"); add("final"); add("discussions"); add("discussions2"); add("discussions3"); add("practical-regex"); add("proof-order"); }

var errors = [], warnings = [];
function err(id, m) { errors.push((id || "?") + ": " + m); }
function warn(id, m) { warnings.push((id || "?") + ": " + m); }

// optional KaTeX parse check
var katex = null;
try { katex = require(path.join(__dirname, "..", "..", "_katexbuild", "node_modules", "katex")); } catch (e) {}
if (!katex) { try { katex = require(path.join(__dirname, "..", "vendor", "katex", "katex.js")); } catch (e) {} }

files.forEach(function (f) { require(f[1]); });

function mathSegments(s) {
  var out = [];
  var reI = /\\\(([\s\S]+?)\\\)/g, reD = /\\\[([\s\S]+?)\\\]/g, m;
  while ((m = reI.exec(s))) out.push([m[1], false]);
  while ((m = reD.exec(s))) out.push([m[1], true]);
  return out;
}
function countOcc(s, sub) { return s.split(sub).length - 1; }
function checkText(id, field, s) {
  if (typeof s !== "string") return;
  if (countOcc(s, "\\(") !== countOcc(s, "\\)")) err(id, "unbalanced \\( \\) in " + field);
  if (countOcc(s, "\\[") !== countOcc(s, "\\]")) err(id, "unbalanced \\[ \\] in " + field);
  if (katex) {
    mathSegments(s).forEach(function (seg) {
      try { katex.renderToString(seg[0], { throwOnError: true, displayMode: seg[1] }); }
      catch (e) { err(id, "KaTeX parse error in " + field + ": " + String(e.message).split("\n")[0] + "  «" + seg[0].slice(0, 40) + "»"); }
    });
  }
}

var TYPES = { tf: 1, mc: 1, multi: 1, fib: 1, order: 1, discussion: 1 };
TOC.BANK.forEach(function (q) {
  var id = q.id;
  if (!id) { err(id, "missing id"); return; }
  if (!/^[a-z0-9-]+$/.test(id)) warn(id, "id should be lowercase-kebab");
  if (typeof q.chapter !== "number") err(id, "chapter must be a number");
  if (!TYPES[q.type]) err(id, "bad type " + q.type);
  if (!q.prompt) err(id, "missing prompt");
  if (!q.explanation) warn(id, "missing explanation (every question should teach)");
  if (!q.topic) warn(id, "missing topic label");
  checkText(id, "prompt", q.prompt);
  checkText(id, "explanation", q.explanation || "");
  checkText(id, "whyMatters", q.whyMatters || "");
  checkText(id, "realWorld", q.realWorld || "");

  if (q.type === "tf") {
    if (typeof q.answer !== "boolean") err(id, "tf needs boolean answer");
  } else if (q.type === "mc") {
    if (!Array.isArray(q.choices) || q.choices.length < 2) err(id, "mc needs >=2 choices");
    else { if (typeof q.answer !== "number" || q.answer < 0 || q.answer >= q.choices.length) err(id, "mc answer index out of range"); q.choices.forEach(function (c, i) { checkText(id, "choice[" + i + "]", c); }); }
  } else if (q.type === "multi") {
    if (!Array.isArray(q.choices) || q.choices.length < 2) err(id, "multi needs >=2 choices");
    if (!Array.isArray(q.answers) || q.answers.length < 1) err(id, "multi needs >=1 answer");
    else {
      var seen = {};
      q.answers.forEach(function (a) {
        if (typeof a !== "number" || a < 0 || (q.choices && a >= q.choices.length)) err(id, "multi answer index out of range: " + a);
        if (seen[a]) err(id, "duplicate answer index " + a); seen[a] = 1;
      });
      if (q.choices) q.choices.forEach(function (c, i) { checkText(id, "choice[" + i + "]", c); });
      if (q.answers && q.choices && q.answers.length === q.choices.length) warn(id, "multi has ALL choices correct (suspicious)");
    }
  } else if (q.type === "fib") {
    if (!Array.isArray(q.accept) || q.accept.length < 1 || q.accept.some(function (a) { return !a || !String(a).trim(); })) err(id, "fib needs non-empty accept[]");
    if (q.acceptRegex) { try { new RegExp(q.acceptRegex); } catch (e) { err(id, "bad acceptRegex"); } }
  } else if (q.type === "order") {
    if (!Array.isArray(q.items) || q.items.length < 2) err(id, "order needs >=2 items");
    else q.items.forEach(function (it, i) { checkText(id, "item[" + i + "]", it); });
  } else if (q.type === "discussion") {
    if (!Array.isArray(q.steps) || q.steps.length < 1) err(id, "discussion needs >=1 step");
    else q.steps.forEach(function (s, si) {
      var sid = id + " step[" + (si + 1) + "]";
      if (!s.prompt) err(sid, "step missing prompt");
      checkText(sid, "step.prompt", s.prompt || "");
      checkText(sid, "step.explain", s.explain || "");
      if (s.type === "tf") {
        if (typeof s.answer !== "boolean") err(sid, "tf step needs boolean answer");
      } else {
        if (!Array.isArray(s.choices) || s.choices.length < 2) err(sid, "step needs >=2 choices");
        else {
          if (typeof s.answer !== "number" || s.answer < 0 || s.answer >= s.choices.length) err(sid, "step answer index out of range");
          s.choices.forEach(function (c, ci) { checkText(sid, "step.choice[" + ci + "]", c); });
        }
      }
    });
  }
});

// summary by type/chapter
var byType = {}, byChap = {};
TOC.BANK.forEach(function (q) { byType[q.type] = (byType[q.type] || 0) + 1; byChap[q.chapter] = (byChap[q.chapter] || 0) + 1; });

console.log("Loaded " + TOC.BANK.length + " questions from: " + files.map(function (f) { return f[0]; }).join(", "));
console.log("By type:   " + JSON.stringify(byType));
console.log("By chapter:" + JSON.stringify(byChap));
console.log("KaTeX parse check: " + (katex ? "ON" : "off (module not found)"));
if (warnings.length) { console.log("\n" + warnings.length + " warning(s):"); warnings.slice(0, 80).forEach(function (w) { console.log("  ! " + w); }); }
if (errors.length) { console.log("\n" + errors.length + " ERROR(s):"); errors.slice(0, 120).forEach(function (e) { console.log("  ✗ " + e); }); process.exitCode = 1; }
else console.log("\n✓ No errors.");
