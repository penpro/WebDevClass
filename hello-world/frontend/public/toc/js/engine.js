/* Scheduling + mastery engine.
   Hybrid of the Leitner system (boxes with growing intervals), Bloom-style
   mastery learning (gated chapter unlock), and streak-based mastery (each
   question must be answered correctly `masterStreak` times to count, so nothing
   passes on a lucky guess). The "clock" is a logical counter `now` = number of
   questions answered, not wall-clock time. Pure logic; Node-testable. */
(function (root) {
  var TOC = (root.TOC = root.TOC || {});

  function rand() { return Math.random(); }

  // ---- per-question state -------------------------------------------------
  function blankState() {
    return { box: 1, streak: 0, correct: 0, wrong: 0, seen: 0, mastered: false, everWrong: false, due: 0, lastSeen: null };
  }
  function st(progress, id) {
    return progress[id] || null;
  }

  // Mastery of a single question: 1 ONLY once it is truly mastered (answered
  // correctly masterStreak times in a row, so it has been seen >= masterStreak
  // times), else 0. No partial credit — a question seen once or twice counts as
  // 0 toward chapter mastery, so nothing reads as "mastered" before 3 correct.
  function qMastery(state, masterStreak) {
    return state && state.mastered ? 1 : 0;
  }

  // ---- chapter aggregates -------------------------------------------------
  function chapterStats(bank, progress, chapter, settings) {
    var qs = bank.filter(function (q) { return q.chapter === chapter; });
    var out = { total: qs.length, mastered: 0, seen: 0, mastery: 0, attempted: 0 };
    if (qs.length === 0) return out;
    var sum = 0;
    qs.forEach(function (q) {
      var s = progress[q.id];
      sum += qMastery(s, settings.masterStreak);
      if (s && s.mastered) out.mastered++;
      if (s && s.seen > 0) { out.seen++; out.attempted += s.seen; }
    });
    out.mastery = sum / qs.length;
    return out;
  }

  function meetsThreshold(bank, progress, chapter, settings) {
    var cs = chapterStats(bank, progress, chapter, settings);
    return cs.total === 0 || cs.mastery >= settings.unlockThreshold; // empty = cleared
  }

  function isUnlocked(bank, progress, chapter, settings) {
    if (settings.mode === "free") return true;
    if (settings.unlocked && settings.unlocked.indexOf(chapter) !== -1) return true; // manually unlocked
    if (TOC.isExamBucket(chapter)) {
      // an exam checkpoint unlocks once all the chapters it covers are mastered
      var ex = TOC.examBucket(chapter);
      if (!ex) return true;
      return ex.covers.every(function (c) { return meetsThreshold(bank, progress, c, settings); });
    }
    var priors = TOC.CHAPTERS.filter(function (c) { return c.n < chapter; });
    return priors.every(function (c) { return meetsThreshold(bank, progress, c.n, settings); });
  }

  function unlockedChapterNums(bank, progress, settings) {
    return TOC.allChapters().map(function (c) { return c.n; })
      .filter(function (n) { return isUnlocked(bank, progress, n, settings); });
  }

  // The chapter the learner is currently "on": lowest real chapter not yet at
  // threshold (their learning edge). If all are mastered, the weakest one.
  function autoFocus(bank, progress, settings) {
    var unlocked = TOC.CHAPTERS.filter(function (c) { return isUnlocked(bank, progress, c.n, settings); });
    var edge = null, weakest = null, weakestM = 2;
    unlocked.forEach(function (c) {
      var m = chapterStats(bank, progress, c.n, settings).mastery;
      if (m < weakestM) { weakestM = m; weakest = c.n; }
      if (edge === null && m < settings.unlockThreshold) edge = c.n;
    });
    return edge !== null ? edge : (weakest !== null ? weakest : 0);
  }

  // ---- answering ----------------------------------------------------------
  function onAnswer(progress, id, correct, now, settings) {
    var s = progress[id] || (progress[id] = blankState());
    s.seen++;
    if (correct) {
      s.streak++;
      s.correct++;
      s.box = Math.min(s.box + 1, 6);
      if (s.streak >= settings.masterStreak) s.mastered = true;
      s.due = now + (TOC.INTERVALS[s.box] || 1);
    } else {
      s.streak = 0;
      s.wrong++;
      s.everWrong = true;
      s.mastered = false;
      s.box = 1;
      s.due = now + 1; // resurface a wrong answer almost immediately
    }
    s.lastSeen = now;
    return s;
  }

  // ---- difficulty ramp ----------------------------------------------------
  // The highest rank tier currently open in a chapter: walk tiers low→high; the
  // first tier where fewer than RAMP_THRESHOLD of its questions have been
  // answered correctly at least once is the ceiling (you see it + everything
  // below it). Once that tier is cleared, the next one opens.
  function tierCeiling(bank, progress, chapter) {
    var qs = bank.filter(function (q) { return q.chapter === chapter; });
    if (!qs.length) return Infinity;
    var rankSet = {};
    qs.forEach(function (q) { rankSet[TOC.rankOf(q)] = 1; });
    var ranks = Object.keys(rankSet).map(Number).sort(function (a, b) { return a - b; });
    for (var i = 0; i < ranks.length; i++) {
      var r = ranks[i];
      var tier = qs.filter(function (q) { return TOC.rankOf(q) === r; });
      var cleared = tier.filter(function (q) { var s = progress[q.id]; return s && (s.correct || 0) > 0; }).length;
      if (cleared / tier.length < TOC.RAMP_THRESHOLD) return r;
    }
    return Infinity; // every tier cleared
  }

  // ---- selection ----------------------------------------------------------
  function pickNext(bank, progress, settings, now, focus) {
    var unlocked = unlockedChapterNums(bank, progress, settings);
    var specific = focus != null && focus !== "auto" && focus !== "all";
    var focusNum = specific ? Number(focus) : null;
    var pool;

    if (specific && TOC.isExamBucket(focusNum)) {
      // an exam checkpoint: serve ONLY that bucket's questions (locked => nothing)
      if (unlocked.indexOf(focusNum) === -1) return null;
      pool = bank.filter(function (q) { return q.chapter === focusNum; });
    } else if (specific) {
      // a real chapter: that chapter + still-missed earlier real-chapter items
      pool = bank.filter(function (q) {
        if (TOC.isExamBucket(q.chapter) || unlocked.indexOf(q.chapter) === -1) return false;
        if (q.chapter === focusNum) return true;
        var s = progress[q.id];
        return s && s.everWrong && !s.mastered;
      });
    } else {
      // auto / all: unlocked REAL chapters only — exam checkpoints never auto-appear
      pool = bank.filter(function (q) {
        return !TOC.isExamBucket(q.chapter) && unlocked.indexOf(q.chapter) !== -1;
      });
    }
    if (pool.length === 0) return null;

    // difficulty ramp: within each chapter, hide rank tiers above the open ceiling
    if (settings.ramp !== false) {
      var ceilCache = {};
      var ramped = pool.filter(function (q) {
        var ch = q.chapter;
        if (ceilCache[ch] === undefined) ceilCache[ch] = tierCeiling(bank, progress, ch);
        return TOC.rankOf(q) <= ceilCache[ch];
      });
      if (ramped.length) pool = ramped; // never let the ramp empty the pool
    }

    var focusChapter = specific ? focusNum : autoFocus(bank, progress, settings);

    var due = pool.filter(function (q) { var s = progress[q.id]; return !s || (s.due || 0) <= now; });
    var candidates = due.length ? due : pool;

    function weight(q) {
      var s = progress[q.id];
      var box = s ? (s.box || 1) : 1;
      var w = ({ 1: 12, 2: 7, 3: 4, 4: 2.5, 5: 1.5, 6: 0.8 })[box] || 1;
      if (!s || s.seen === 0) w = (q.chapter === focusChapter) ? 9 : 3;     // surface fresh material in focus
      if (s && s.everWrong && !s.mastered) w *= 1.9;                         // emphasize past mistakes
      if (s && s.mastered) w *= 0.5;                                         // keep mastered in rotation, lightly
      w *= (q.chapter === focusChapter) ? 1.6 : (q.chapter < focusChapter ? 0.8 : 0.45);
      if (s && s.lastSeen != null && (now - s.lastSeen) < 2) w *= 0.15;      // avoid echoing the same item
      return Math.max(w, 0.01);
    }

    var total = 0, ws = candidates.map(function (q) { var w = weight(q); total += w; return w; });
    var r = rand() * total;
    for (var i = 0; i < candidates.length; i++) { r -= ws[i]; if (r <= 0) return candidates[i]; }
    return candidates[candidates.length - 1];
  }

  // overall mastery across real chapters, weighted by # of questions
  function overall(bank, progress, settings) {
    var real = bank.filter(function (q) { return !TOC.isExamBucket(q.chapter); });
    if (real.length === 0) return { mastery: 0, mastered: 0, total: 0, seen: 0 };
    var sum = 0, mastered = 0, seen = 0;
    real.forEach(function (q) {
      var s = progress[q.id];
      sum += qMastery(s, settings.masterStreak);
      if (s && s.mastered) mastered++;
      if (s && s.seen > 0) seen++;
    });
    return { mastery: sum / real.length, mastered: mastered, total: real.length, seen: seen };
  }

  function dueCount(bank, progress, settings, now) {
    var unlocked = unlockedChapterNums(bank, progress, settings);
    return bank.filter(function (q) {
      if (TOC.isExamBucket(q.chapter) || unlocked.indexOf(q.chapter) === -1) return false;
      var s = progress[q.id];
      return !s || (s.due || 0) <= now;
    }).length;
  }

  TOC.engine = {
    blankState: blankState,
    qMastery: qMastery,
    chapterStats: chapterStats,
    isUnlocked: isUnlocked,
    unlockedChapterNums: unlockedChapterNums,
    autoFocus: autoFocus,
    onAnswer: onAnswer,
    pickNext: pickNext,
    tierCeiling: tierCeiling,
    overall: overall,
    dueCount: dueCount
  };
})(typeof window !== "undefined" ? window : globalThis);
