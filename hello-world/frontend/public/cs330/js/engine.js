/* Scheduling + mastery engine.
   Hybrid of the Leitner system (boxes with growing intervals), Bloom-style
   mastery learning (gated unit unlock), and streak-based mastery (each question
   must be self-graded "got it" `masterStreak` times in a row, so nothing passes
   on one lucky recall). The "clock" is a logical counter `now` = number of
   questions answered, not wall-clock time. Pure logic; Node-testable. */
(function (root) {
  var CS = (root.CS = root.CS || {});

  function rand() { return Math.random(); }

  // ---- per-question state -------------------------------------------------
  function blankState() {
    return { box: 1, streak: 0, correct: 0, wrong: 0, seen: 0, mastered: false, everWrong: false, due: 0, lastSeen: null };
  }

  // 1 only once truly mastered (streak reached), else 0: no partial credit.
  function qMastery(state) { return state && state.mastered ? 1 : 0; }

  // ---- unit aggregates ----------------------------------------------------
  function unitStats(bank, progress, unit) {
    var qs = bank.filter(function (q) { return q.unit === unit; });
    var out = { total: qs.length, mastered: 0, seen: 0, mastery: 0, attempted: 0 };
    if (!qs.length) return out;
    var sum = 0;
    qs.forEach(function (q) {
      var s = progress[q.id];
      sum += qMastery(s);
      if (s && s.mastered) out.mastered++;
      if (s && s.seen > 0) { out.seen++; out.attempted += s.seen; }
    });
    out.mastery = sum / qs.length;
    return out;
  }

  function meetsThreshold(bank, progress, unit, settings) {
    var us = unitStats(bank, progress, unit);
    return us.total === 0 || us.mastery >= settings.unlockThreshold;
  }

  function isUnlocked(bank, progress, unit, settings) {
    if (settings.mode === "free") return true;
    if (settings.unlocked && settings.unlocked.indexOf(unit) !== -1) return true; // manually unlocked
    return CS.UNITS.filter(function (u) { return u.n < unit; })
      .every(function (u) { return meetsThreshold(bank, progress, u.n, settings); });
  }

  function unlockedUnitNums(bank, progress, settings) {
    return CS.UNITS.map(function (u) { return u.n; })
      .filter(function (n) { return isUnlocked(bank, progress, n, settings); });
  }

  // The unit the learner is "on": lowest unlocked unit not yet at threshold.
  // If all are mastered, the weakest one.
  function autoFocus(bank, progress, settings) {
    var edge = null, weakest = null, weakestM = 2;
    CS.UNITS.forEach(function (u) {
      if (!isUnlocked(bank, progress, u.n, settings)) return;
      var m = unitStats(bank, progress, u.n).mastery;
      if (m < weakestM) { weakestM = m; weakest = u.n; }
      if (edge === null && m < settings.unlockThreshold) edge = u.n;
    });
    return edge !== null ? edge : (weakest !== null ? weakest : 1);
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
      s.due = now + (CS.INTERVALS[s.box] || 1);
    } else {
      s.streak = 0;
      s.wrong++;
      s.everWrong = true;
      s.mastered = false;
      s.box = 1;
      s.due = now + 1; // resurface a miss almost immediately
    }
    s.lastSeen = now;
    return s;
  }

  // ---- difficulty ramp ----------------------------------------------------
  // The highest rank tier open in a unit: walk tiers low->high; the first tier
  // where fewer than RAMP_THRESHOLD of its questions have been recalled at least
  // once is the ceiling (you see it plus everything below it).
  function tierCeiling(bank, progress, unit) {
    var qs = bank.filter(function (q) { return q.unit === unit; });
    if (!qs.length) return Infinity;
    var rankSet = {};
    qs.forEach(function (q) { rankSet[CS.rankOf(q)] = 1; });
    var ranks = Object.keys(rankSet).map(Number).sort(function (a, b) { return a - b; });
    for (var i = 0; i < ranks.length; i++) {
      var r = ranks[i];
      var tier = qs.filter(function (q) { return CS.rankOf(q) === r; });
      var cleared = tier.filter(function (q) { var s = progress[q.id]; return s && (s.correct || 0) > 0; }).length;
      if (cleared / tier.length < CS.RAMP_THRESHOLD) return r;
    }
    return Infinity;
  }

  // ---- selection ----------------------------------------------------------
  // Weighted spaced-repetition pick: prefer due, low-box, never-seen (in the
  // focus unit), and previously-missed items. focusUnit may be null.
  function weightedPick(pool, progress, now, focusUnit) {
    if (!pool.length) return null;
    var due = pool.filter(function (q) { var s = progress[q.id]; return !s || (s.due || 0) <= now; });
    var candidates = due.length ? due : pool;

    function weight(q) {
      var s = progress[q.id];
      var box = s ? (s.box || 1) : 1;
      var w = ({ 1: 12, 2: 7, 3: 4, 4: 2.5, 5: 1.5, 6: 0.8 })[box] || 1;
      if (!s || s.seen === 0) w = (focusUnit != null && q.unit === focusUnit) ? 9 : 3;
      if (s && s.everWrong && !s.mastered) w *= 1.9;
      if (s && s.mastered) w *= 0.5;
      if (focusUnit != null) w *= (q.unit === focusUnit) ? 1.6 : (q.unit < focusUnit ? 0.8 : 0.45);
      if (s && s.lastSeen != null && (now - s.lastSeen) < 2) w *= 0.15; // avoid echoing
      return Math.max(w, 0.01);
    }

    var total = 0, ws = candidates.map(function (q) { var w = weight(q); total += w; return w; });
    var r = rand() * total;
    for (var i = 0; i < candidates.length; i++) { r -= ws[i]; if (r <= 0) return candidates[i]; }
    return candidates[candidates.length - 1];
  }

  // focus: { kind: "auto" } | { kind: "unit", n } | { kind: "range", from, to }
  // topic: a topic key to drill across ALL units (explicit action: bypasses gating and ramp).
  function pickNext(bank, progress, settings, now, focus, topic) {
    var unlocked = unlockedUnitNums(bank, progress, settings);
    focus = focus || { kind: "auto" };

    if (topic) {
      return weightedPick(bank.filter(function (q) { return q.topic === topic; }), progress, now, null);
    }
    if (focus.kind === "range") {
      return weightedPick(bank.filter(function (q) { return q.card >= focus.from && q.card <= focus.to; }), progress, now, null);
    }

    var pool, focusUnit;
    if (focus.kind === "unit") {
      if (unlocked.indexOf(focus.n) === -1) return null;
      pool = bank.filter(function (q) {
        if (unlocked.indexOf(q.unit) === -1) return false;
        if (q.unit === focus.n) return true;
        var s = progress[q.id];
        return s && s.everWrong && !s.mastered; // still-missed earlier items mix in
      });
      focusUnit = focus.n;
    } else {
      pool = bank.filter(function (q) { return unlocked.indexOf(q.unit) !== -1; });
      focusUnit = autoFocus(bank, progress, settings);
    }
    if (!pool.length) return null;

    if (settings.ramp !== false) {
      var ceil = {};
      var ramped = pool.filter(function (q) {
        if (ceil[q.unit] === undefined) ceil[q.unit] = tierCeiling(bank, progress, q.unit);
        return CS.rankOf(q) <= ceil[q.unit];
      });
      if (ramped.length) pool = ramped; // never let the ramp empty the pool
    }
    return weightedPick(pool, progress, now, focusUnit);
  }

  function overall(bank, progress) {
    if (!bank.length) return { mastery: 0, mastered: 0, total: 0, seen: 0 };
    var sum = 0, mastered = 0, seen = 0;
    bank.forEach(function (q) {
      var s = progress[q.id];
      sum += qMastery(s);
      if (s && s.mastered) mastered++;
      if (s && s.seen > 0) seen++;
    });
    return { mastery: sum / bank.length, mastered: mastered, total: bank.length, seen: seen };
  }

  function dueCount(bank, progress, settings, now) {
    var unlocked = unlockedUnitNums(bank, progress, settings);
    return bank.filter(function (q) {
      if (unlocked.indexOf(q.unit) === -1) return false;
      var s = progress[q.id];
      return !s || (s.due || 0) <= now;
    }).length;
  }

  CS.engine = {
    blankState: blankState, qMastery: qMastery, unitStats: unitStats, isUnlocked: isUnlocked,
    unlockedUnitNums: unlockedUnitNums, autoFocus: autoFocus, onAnswer: onAnswer, pickNext: pickNext,
    tierCeiling: tierCeiling, overall: overall, dueCount: dueCount
  };
})(typeof window !== "undefined" ? window : globalThis);
