/* Validates concept explainers: balanced math delimiters, KaTeX parse, and
   coverage (which question topics still lack a concept).
   Usage:  node tools/validate-concepts.js        (all)
           node tools/validate-concepts.js 4       (only concepts/ch4.js) */
var fs = require("fs"), path = require("path");
require("../js/config.js");
require("../js/questions/_registry.js");
require("../js/concepts/_registry.js");
var TOC = globalThis.TOC;

var katex = null;
try { katex = require(path.join(__dirname, "..", "..", "_katexbuild", "node_modules", "katex")); } catch (e) {}
if (!katex) { try { katex = require(path.join(__dirname, "..", "vendor", "katex", "katex.js")); } catch (e) {} }

var only = process.argv[2];
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
  if (typeof s !== "string") return;
  if (countOcc(s, "\\(") !== countOcc(s, "\\)")) err(id, "unbalanced \\( \\) in " + field);
  if (countOcc(s, "\\[") !== countOcc(s, "\\]")) err(id, "unbalanced \\[ \\] in " + field);
  if (katex) mathSegments(s).forEach(function (seg) {
    try { katex.renderToString(seg[0], { throwOnError: true, displayMode: seg[1] }); }
    catch (e) { err(id, "KaTeX error in " + field + ": " + String(e.message).split("\n")[0] + "  «" + seg[0].slice(0, 36) + "»"); }
  });
}

// load concept files
var files = [];
function add(n) { var p = path.join(__dirname, "..", "js", "concepts", "ch" + n + ".js"); if (fs.existsSync(p)) files.push(p); }
if (only) add(only.replace(/^ch/, "")); else for (var i = 0; i <= 8; i++) add(i);
files.forEach(function (f) { require(f); });

Object.keys(TOC.CONCEPTS).forEach(function (key) {
  var c = TOC.CONCEPTS[key];
  if (!/^\d+::.+/.test(key)) err(key, "key must be '<chapter>::<topic>'");
  if (!c.body || !String(c.body).trim()) warnings.push(key + ": empty body");
  checkText("concept " + key, "title", c.title || "");
  checkText("concept " + key, "body", c.body || "");
});

// coverage: load ALL question files, find topics without a concept
var qfiles = [];
for (var q = 0; q <= 8; q++) qfiles.push(path.join(__dirname, "..", "js", "questions", "ch" + q + ".js"));
qfiles.forEach(function (f) { if (fs.existsSync(f)) require(f); });
var byTopic = {};
Object.keys(TOC.CONCEPTS).forEach(function (k) { byTopic[k.split("::")[1]] = 1; });
var missing = {};
TOC.BANK.forEach(function (qq) {
  if (TOC.isExamBucket(qq.chapter)) return;
  if (!TOC.CONCEPTS[qq.chapter + "::" + qq.topic] && !byTopic[qq.topic]) missing[qq.chapter + "::" + qq.topic] = 1;
});

console.log("Concept explainers: " + Object.keys(TOC.CONCEPTS).length + "  (from " + files.length + " file(s))");
console.log("KaTeX parse check: " + (katex ? "ON" : "off"));
var miss = Object.keys(missing).sort();
console.log("Question topics still WITHOUT a concept: " + miss.length);
miss.slice(0, 80).forEach(function (m) { console.log("  ~ " + m); });
if (warnings.length) { console.log("\n" + warnings.length + " warning(s):"); warnings.slice(0, 40).forEach(function (w) { console.log("  ! " + w); }); }
if (errors.length) { console.log("\n" + errors.length + " ERROR(s):"); errors.slice(0, 120).forEach(function (e) { console.log("  ✗ " + e); }); process.exitCode = 1; }
else console.log("\n✓ No concept errors.");
