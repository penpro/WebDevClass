/* Validates distractor pools: each pool targets a real mc/multi question, every
   distractor parses as KaTeX with balanced delimiters, and — critically — no
   distractor equals a CORRECT answer (which would silently break the question).
   Usage:  node tools/validate-pools.js        (all)
           node tools/validate-pools.js 4        (only pools/ch4.js) */
var fs = require("fs"), path = require("path");
require("../js/config.js");
require("../js/questions/_registry.js");
require("../js/pools/_registry.js");
var TOC = globalThis.TOC;

var katex = null;
try { katex = require(path.join(__dirname, "..", "..", "_katexbuild", "node_modules", "katex")); } catch (e) {}
if (!katex) { try { katex = require(path.join(__dirname, "..", "vendor", "katex", "katex.js")); } catch (e) {} }

var errors = [], warnings = [];
function err(id, m) { errors.push(id + ": " + m); }
function countOcc(s, sub) { return s.split(sub).length - 1; }
function mathSegments(s) {
  var out = [], reI = /\\\(([\s\S]+?)\\\)/g, reD = /\\\[([\s\S]+?)\\\]/g, m;
  while ((m = reI.exec(s))) out.push([m[1], false]);
  while ((m = reD.exec(s))) out.push([m[1], true]);
  return out;
}
function checkText(id, field, s) {
  if (typeof s !== "string") { err(id, field + " is not a string"); return; }
  if (!s.trim()) { err(id, field + " is empty"); return; }
  // control chars (e.g. a vertical tab from a corrupted "\v" in "\varepsilon") never belong here
  if (/[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(s)) err(id, "contains a control character (likely a corrupted backslash escape) in " + field);
  if (countOcc(s, "\\(") !== countOcc(s, "\\)")) err(id, "unbalanced \\( \\) in " + field);
  if (countOcc(s, "\\[") !== countOcc(s, "\\]")) err(id, "unbalanced \\[ \\] in " + field);
  if (katex) mathSegments(s).forEach(function (seg) {
    try { katex.renderToString(seg[0], { throwOnError: true, displayMode: seg[1] }); }
    catch (e) { err(id, "KaTeX error in " + field + ": " + String(e.message).split("\n")[0]); }
  });
}

// load all question files + pool files (or a single chapter)
var only = process.argv[2];
for (var i = 0; i <= 8; i++) { var qp = path.join(__dirname, "..", "js", "questions", "ch" + i + ".js"); if (fs.existsSync(qp)) require(qp); }
["exam1", "exam2", "final"].forEach(function (n) { var p = path.join(__dirname, "..", "js", "questions", n + ".js"); if (fs.existsSync(p)) require(p); });
var byId = {}; TOC.BANK.forEach(function (q) { byId[q.id] = q; });

var poolFiles = [];
function addP(n) { var p = path.join(__dirname, "..", "js", "pools", n + ".js"); if (fs.existsSync(p)) poolFiles.push(p); }
if (only) addP(/^\d+$/.test(only) ? "ch" + only : only);
else { for (var j = 0; j <= 8; j++) addP("ch" + j); ["exam1", "exam2", "final"].forEach(addP); }
poolFiles.forEach(function (f) { require(f); });

function correctTextsOf(q) {
  if (q.type === "mc") return [q.choices[q.answer]];
  if (q.type === "multi") return q.answers.map(function (i) { return q.choices[i]; });
  return [];
}

var poolCount = 0, distractorCount = 0;
Object.keys(TOC.POOLS).forEach(function (qid) {
  var arr = TOC.POOLS[qid];
  var q = byId[qid];
  if (!q) { err(qid, "no such question id"); return; }
  if (q.type !== "mc" && q.type !== "multi") { err(qid, "pool on a " + q.type + " question (only mc/multi supported)"); return; }
  poolCount++;
  var correct = correctTextsOf(q);
  var seen = {};
  arr.forEach(function (d, k) {
    distractorCount++;
    checkText(qid, "distractor[" + k + "]", d);
    if (correct.indexOf(d) !== -1) err(qid, "distractor EQUALS a correct answer: «" + String(d).slice(0, 50) + "»");
    if (q.choices.indexOf(d) !== -1 && correct.indexOf(d) === -1) warnings.push(qid + ": distractor duplicates an existing wrong choice (redundant)");
    if (seen[d]) warnings.push(qid + ": duplicate distractor «" + String(d).slice(0, 40) + "»");
    seen[d] = 1;
  });
});

// coverage
var mcMulti = TOC.BANK.filter(function (q) { return q.type === "mc" || q.type === "multi"; });
var withPool = mcMulti.filter(function (q) { return TOC.POOLS[q.id] && TOC.POOLS[q.id].length; }).length;
console.log("Pools: " + poolCount + " questions, " + distractorCount + " distractors. KaTeX: " + (katex ? "ON" : "off"));
console.log("Coverage: " + withPool + " / " + mcMulti.length + " mc+multi questions have a distractor pool.");
if (warnings.length) { console.log("\n" + warnings.length + " warning(s):"); warnings.slice(0, 40).forEach(function (w) { console.log("  ! " + w); }); }
if (errors.length) { console.log("\n" + errors.length + " ERROR(s):"); errors.slice(0, 120).forEach(function (e) { console.log("  ✗ " + e); }); process.exitCode = 1; }
else console.log("\n✓ No pool errors.");
