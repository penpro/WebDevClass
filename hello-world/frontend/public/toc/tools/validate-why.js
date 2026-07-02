/* Validates the "why this matters" entries (js/why/chN.js):
   - KaTeX delimiter balance + parse on each why/real string,
   - coverage: every topic used by a question resolves to an entry (exact
     "<chapter>::<topic>", else any chapter with that topic — same fallback the
     app uses in whyFor()).
   Run from the review/ folder:  node tools/validate-why.js */
var fs = require("fs"), path = require("path");
require("../js/config.js");
require("../js/questions/_registry.js");
require("../js/why/_registry.js");
var TOC = globalThis.TOC;

// load the question bank (to know which topics are actually used)
var qnames = [];
for (var i = 0; i <= 8; i++) { qnames.push("ch" + i, "ch" + i + "-defs", "ch" + i + "-hands-on"); }
qnames.push("exam1", "exam2", "final", "discussions", "discussions2", "discussions3", "practical-regex", "proof-order");
qnames.forEach(function (n) { var p = path.join(__dirname, "..", "js", "questions", n + ".js"); if (fs.existsSync(p)) require(p); });

// load the why files
var missingFiles = [];
for (var j = 0; j <= 8; j++) {
  var p = path.join(__dirname, "..", "js", "why", "ch" + j + ".js");
  if (fs.existsSync(p)) require(p); else missingFiles.push("ch" + j + ".js");
}
var pExtra = path.join(__dirname, "..", "js", "why", "extra.js");
if (fs.existsSync(pExtra)) require(pExtra);

var katex = null;
try { katex = require(path.join(__dirname, "..", "..", "_katexbuild", "node_modules", "katex")); } catch (e) {}
if (!katex) { try { katex = require(path.join(__dirname, "..", "vendor", "katex", "katex.js")); } catch (e) {} }

var errors = [], warnings = [];
function countOcc(s, sub) { return s.split(sub).length - 1; }
function mathSegs(s) { var out = [], re = /\\\(([\s\S]+?)\\\)/g, m; while ((m = re.exec(s))) out.push(m[1]); return out; }
function checkText(id, field, s) {
  if (typeof s !== "string") { errors.push(id + ": " + field + " is not a string"); return; }
  if (countOcc(s, "\\(") !== countOcc(s, "\\)")) errors.push(id + ": unbalanced \\( \\) in " + field);
  if (katex) mathSegs(s).forEach(function (seg) {
    try { katex.renderToString(seg, { throwOnError: true }); }
    catch (e) { errors.push(id + ": KaTeX in " + field + ": " + String(e.message).split("\n")[0] + " «" + seg.slice(0, 36) + "»"); }
  });
}

var W = TOC.WHY || {};
Object.keys(W).forEach(function (k) {
  var e = W[k] || {};
  if (!e.why) warnings.push(k + ": missing why");
  if (!e.real) warnings.push(k + ": missing real");
  checkText(k, "why", e.why || "");
  checkText(k, "real", e.real || "");
});

function resolves(chapter, topic) {
  if (W[chapter + "::" + topic]) return true;
  return Object.keys(W).some(function (kk) { return kk.split("::")[1] === topic; });
}
var missing = {};
TOC.BANK.forEach(function (q) {
  if (!q.topic) return;
  if (!resolves(q.chapter, q.topic)) missing[q.chapter + "::" + q.topic] = (missing[q.chapter + "::" + q.topic] || 0) + 1;
});

if (missingFiles.length) console.log("Missing why files: " + missingFiles.join(", "));
console.log("WHY entries loaded: " + Object.keys(W).length);
console.log("KaTeX parse check: " + (katex ? "ON" : "off (module not found)"));
var miss = Object.keys(missing);
console.log("Topics used by questions with NO resolvable why entry: " + miss.length);
miss.sort().forEach(function (k) { console.log("  ⚠ " + k + " (" + missing[k] + " questions)"); });
if (warnings.length) { console.log("\n" + warnings.length + " warning(s):"); warnings.slice(0, 60).forEach(function (w) { console.log("  ! " + w); }); }
if (errors.length) { console.log("\n" + errors.length + " ERROR(s):"); errors.slice(0, 100).forEach(function (e) { console.log("  ✗ " + e); }); process.exitCode = 1; }
else console.log("\n✓ No KaTeX errors in why/real.");
