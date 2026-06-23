/* Node test harness for the pure logic (grade.js + engine.js + config.js).
   Run: node tools/sim.js   (from the review/ folder) */
require("../js/config.js");
require("../js/questions/_registry.js");
require("../js/grade.js");
require("../js/engine.js");
var TOC = globalThis.TOC;

function assert(cond, msg) { if (!cond) { console.error("FAIL:", msg); process.exitCode = 1; } else { console.log("ok  :", msg); } }

// ---- grading ----
assert(TOC.grade({ type: "tf", answer: true }, true).correct, "tf true");
assert(!TOC.grade({ type: "tf", answer: true }, false).correct, "tf wrong");
assert(TOC.grade({ type: "mc", answer: 2 }, 2).correct, "mc index");
assert(!TOC.grade({ type: "mc", answer: 2 }, 1).correct, "mc wrong");
assert(TOC.grade({ type: "multi", answers: [0, 2] }, [2, 0]).correct, "multi set order-independent");
assert(!TOC.grade({ type: "multi", answers: [0, 2] }, [0]).correct, "multi missing one");
assert(TOC.grade({ type: "fib", accept: ["regular", "a regular language"] }, "  Regular.").correct, "fib normalize");
assert(TOC.grade({ type: "fib", accept: ["a^n b^n"] }, "a^n  b^n").correct, "fib space-insensitive");
assert(!TOC.grade({ type: "fib", accept: ["regular"] }, "decidable").correct, "fib wrong");
assert(TOC.grade({ type: "order", items: ["a", "b", "c"] }, [0, 1, 2]).correct, "order correct");
assert(!TOC.grade({ type: "order", items: ["a", "b", "c"] }, [0, 2, 1]).correct, "order wrong");

// ---- seed a tiny 2-chapter bank ----
function gen(ch, k) {
  var arr = [];
  for (var i = 0; i < k; i++) arr.push({ id: "c" + ch + "q" + i, chapter: ch, type: "tf", prompt: "x", answer: true, explanation: "e" });
  return arr;
}
TOC.addQuestions(gen(0, 8));
TOC.addQuestions(gen(1, 8));
TOC.addQuestions(gen(10, 5)); // Exam 1 checkpoint bucket (covers chapters 0-2)
assert(TOC.BANK.length === 21, "bank loaded 21 (got " + TOC.BANK.length + ")");

var state = { settings: Object.assign({}, TOC.DEFAULTS), progress: {}, stats: { clock: 0 } };

// binary mastery: seeing/answering a question once must NOT count toward mastery
var probe = {};
TOC.engine.onAnswer(probe, "p", true, 0, state.settings);
assert(TOC.engine.qMastery(probe["p"], state.settings.masterStreak) === 0, "answered correctly ONCE counts 0 toward mastery (not mastered)");
TOC.engine.onAnswer(probe, "p", true, 1, state.settings);
assert(TOC.engine.qMastery(probe["p"], state.settings.masterStreak) === 0, "answered correctly TWICE still counts 0 toward mastery");
TOC.engine.onAnswer(probe, "p", true, 2, state.settings);
assert(TOC.engine.qMastery(probe["p"], state.settings.masterStreak) === 1, "mastered (3 correct in a row) counts 1");

// Chapter 1 should be LOCKED initially in guided mode.
assert(!TOC.engine.isUnlocked(TOC.BANK, state.progress, 1, state.settings), "ch1 locked at start");
assert(TOC.engine.isUnlocked(TOC.BANK, state.progress, 0, state.settings), "ch0 unlocked at start");
assert(!TOC.engine.isUnlocked(TOC.BANK, state.progress, 10, state.settings), "Exam 1 checkpoint LOCKED at start (ch0-2 not mastered)");

// First pick under auto-focus must come from ch0 (the learning edge).
var firstPick = TOC.engine.pickNext(TOC.BANK, state.progress, state.settings, 0, "auto");
assert(firstPick && firstPick.chapter === 0, "auto-focus picks ch0 first");

// Drive a learner answering correctly until ch1 unlocks (the "near 100%" gate).
var now = 0, picks = 0, guard = 0, lockedPick = false;
while (!TOC.engine.isUnlocked(TOC.BANK, state.progress, 1, state.settings) && guard < 5000) {
  var q = TOC.engine.pickNext(TOC.BANK, state.progress, state.settings, now, "auto");
  if (!q) break;
  if (!TOC.engine.isUnlocked(TOC.BANK, state.progress, q.chapter, state.settings)) lockedPick = true;
  TOC.engine.onAnswer(state.progress, q.id, true, now, state.settings);
  now++; picks++; guard++;
}
assert(!lockedPick, "selector never serves a locked-chapter question");
var cs0 = TOC.engine.chapterStats(TOC.BANK, state.progress, 0, state.settings);
console.log("  -> ch1 unlocked at ch0 mastery=" + cs0.mastery.toFixed(3) + ", mastered=" + cs0.mastered + "/" + cs0.total + ", picks=" + picks);
assert(cs0.mastery >= 0.9, "ch0 reached >=0.9 (near 100%) before unlock");
assert(TOC.engine.isUnlocked(TOC.BANK, state.progress, 1, state.settings), "ch1 unlocked");

// Keep going to FULL mastery: now every ch0 question has been asked >=3x.
guard = 0;
while (cs0.mastered < cs0.total && guard < 5000) {
  var q2 = TOC.engine.pickNext(TOC.BANK, state.progress, state.settings, now, 0);
  if (!q2) break;
  TOC.engine.onAnswer(state.progress, q2.id, true, now, state.settings);
  now++; guard++;
  cs0 = TOC.engine.chapterStats(TOC.BANK, state.progress, 0, state.settings);
}
var minSeen = Math.min.apply(null, TOC.BANK.filter(function (x) { return x.chapter === 0; }).map(function (x) { return state.progress[x.id].seen; }));
assert(minSeen >= 3, "at full mastery, every ch0 question asked >=3x (min seen=" + minSeen + ")");

// Interleaving: a previously-wrong ch0 item still resurfaces while focusing ch1.
TOC.engine.onAnswer(state.progress, "c0q3", false, now, state.settings); now++;
var sawC0wrong = false;
for (var t = 0; t < 60; t++) {
  var q3 = TOC.engine.pickNext(TOC.BANK, state.progress, state.settings, now, 1);
  if (q3 && q3.id === "c0q3") { sawC0wrong = true; }
  if (q3) { TOC.engine.onAnswer(state.progress, q3.id, true, now, state.settings); now++; }
}
assert(sawC0wrong, "a previously-missed earlier-chapter item interleaves while studying a later chapter");

// ---- Exam checkpoint gating + the no-auto-interleave bug fix ----
guard = 0;
while (TOC.engine.chapterStats(TOC.BANK, state.progress, 1, state.settings).mastered < 8 && guard < 5000) {
  var q4 = TOC.engine.pickNext(TOC.BANK, state.progress, state.settings, now, 1);
  if (!q4) break; TOC.engine.onAnswer(state.progress, q4.id, true, now, state.settings); now++; guard++;
}
assert(TOC.engine.isUnlocked(TOC.BANK, state.progress, 10, state.settings), "Exam 1 checkpoint UNLOCKS once ch0-2 are mastered");
var autoServedExam = false;
for (var u = 0; u < 300; u++) {
  var qa = TOC.engine.pickNext(TOC.BANK, state.progress, state.settings, now, "auto");
  if (qa && TOC.isExamBucket(qa.chapter)) autoServedExam = true;
}
assert(!autoServedExam, "auto/guided NEVER serves an exam-checkpoint question (the reported bug)");
var examFocusStayedInBucket = true;
for (var v = 0; v < 50; v++) {
  var qe = TOC.engine.pickNext(TOC.BANK, state.progress, state.settings, now, 10);
  if (qe && qe.chapter !== 10) examFocusStayedInBucket = false;
}
assert(examFocusStayedInBucket, "focusing Exam 1 serves ONLY Exam 1 questions");

// ---- manual unlock overrides gating (for focused study) ----
var fu = { settings: Object.assign({}, TOC.DEFAULTS, { unlocked: [] }), progress: {} };
assert(!TOC.engine.isUnlocked(TOC.BANK, fu.progress, 1, fu.settings), "ch1 locked in a fresh guided state");
fu.settings.unlocked.push(1);
assert(TOC.engine.isUnlocked(TOC.BANK, fu.progress, 1, fu.settings), "manual unlock opens ch1 without mastering ch0");
assert(!TOC.engine.isUnlocked(TOC.BANK, fu.progress, 2, fu.settings), "manual unlock of ch1 does NOT also open ch2");

// A wrong answer must drop mastery + resurface that question soon.
var victim = "c0q0";
TOC.engine.onAnswer(state.progress, victim, false, now, state.settings);
assert(state.progress[victim].streak === 0 && state.progress[victim].mastered === false, "wrong answer un-masters + resets streak");
assert(state.progress[victim].due <= now + 1, "wrong answer due again almost immediately");
assert(state.progress[victim].everWrong === true, "wrong answer flags everWrong");

// ---- difficulty ramp: basics first, harder tiers unlock as basics clear ----
TOC.addQuestions([
  { id: "rmp-def-1", chapter: 3, type: "tf", rank: 0, prompt: "x", answer: true, explanation: "e" },
  { id: "rmp-def-2", chapter: 3, type: "tf", rank: 0, prompt: "x", answer: true, explanation: "e" },
  { id: "rmp-def-3", chapter: 3, type: "tf", rank: 0, prompt: "x", answer: true, explanation: "e" },
  { id: "rmp-hard-1", chapter: 3, type: "tf", rank: 40, prompt: "x", answer: true, explanation: "e" },
  { id: "rmp-hard-2", chapter: 3, type: "tf", rank: 40, prompt: "x", answer: true, explanation: "e" }
]);
var rmp = { settings: Object.assign({}, TOC.DEFAULTS, { unlocked: [3] }), progress: {} };
var servedHardEarly = false;
for (var rt = 0; rt < 50; rt++) { var rq = TOC.engine.pickNext(TOC.BANK, rmp.progress, rmp.settings, rt, 3); if (rq && TOC.rankOf(rq) > 0) servedHardEarly = true; }
assert(!servedHardEarly, "ramp: only rank-0 basics are served before the basics tier is cleared");
["rmp-def-1", "rmp-def-2", "rmp-def-3"].forEach(function (id, i) { TOC.engine.onAnswer(rmp.progress, id, true, i, rmp.settings); });
var sawHard = false;
for (var ru = 0; ru < 80; ru++) { var rq2 = TOC.engine.pickNext(TOC.BANK, rmp.progress, rmp.settings, ru, 3); if (rq2 && TOC.rankOf(rq2) === 40) sawHard = true; }
assert(sawHard, "ramp: the harder tier opens once the basics tier is cleared");
var rmpOff = { settings: Object.assign({}, TOC.DEFAULTS, { unlocked: [3], ramp: false }), progress: {} };
var sawHardOff = false;
for (var rv = 0; rv < 80; rv++) { var rq3 = TOC.engine.pickNext(TOC.BANK, rmpOff.progress, rmpOff.settings, rv, 3); if (rq3 && TOC.rankOf(rq3) === 40) sawHardOff = true; }
assert(sawHardOff, "ramp off: every tier is available immediately");

console.log("\nDone. exitCode=" + (process.exitCode || 0));
