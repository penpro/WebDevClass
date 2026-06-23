/* Controller: bootstraps state, runs the study loop, dashboard, settings. */
(function (root) {
  var TOC = root.TOC;
  var $ = function (id) { return document.getElementById(id); };
  var state, current = null, currentInput = null, answered = false;

  // ---- boot --------------------------------------------------------------
  function boot() {
    state = TOC.storage.load() || TOC.storage.fresh();
    applyTheme();
    wireNav();
    wireSettings();
    buildFocusOptions();
    $("focus-select").addEventListener("change", nextQuestion);
    $("goto-num").addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); gotoNumber(); } });
    document.addEventListener("keydown", onKey);
    refreshHeader();
    maybeWarnStorage();
    showView("study");
    nextQuestion();
  }

  // If the browser won't persist localStorage (can happen with file:// in some
  // browsers), tell the user plainly so they aren't surprised by lost progress.
  function maybeWarnStorage() {
    if (TOC.storage.available() || document.getElementById("storage-warning")) return;
    var bar = TOC.ui.el("div", "storage-warning");
    bar.id = "storage-warning";
    bar.innerHTML = "⚠️ <strong>This browser isn't saving your progress.</strong> " +
      "(Some browsers block storage when a file is opened directly.) It will reset when you reload — " +
      "back it up with <strong>Export</strong> in Settings, or launch via <strong>Start Review.cmd</strong> to serve it locally. " +
      "<button type=\"button\" id=\"sw-dismiss\">dismiss</button>";
    document.body.insertBefore(bar, document.body.firstChild);
    var d = $("sw-dismiss");
    if (d) d.addEventListener("click", function () { bar.remove(); });
  }

  function save() { TOC.storage.save(state); }
  function clock() { return state.stats.clock; }

  // ---- question numbering + flagging -------------------------------------
  function qNum(q) { return TOC.BANK.indexOf(q) + 1; }            // stable 1-based serial
  function isFlagged(id) { var s = state.progress[id]; return !!(s && s.flagged); }
  function setFlag(id, val) {
    var s = state.progress[id] || (state.progress[id] = TOC.engine.blankState());
    s.flagged = val; save();
  }

  // Manually open (or re-lock) a chapter / exam checkpoint, bypassing the
  // guided-mode gating — for focused study of a specific chapter.
  function setUnlocked(n, val) {
    var u = state.settings.unlocked || (state.settings.unlocked = []);
    var i = u.indexOf(n);
    if (val && i === -1) u.push(n);
    if (!val && i !== -1) u.splice(i, 1);
    save(); buildFocusOptions(); refreshHeader();
  }

  // Jump straight to a specific question (by number) — bypasses the scheduler,
  // for review / "help me with #N". Locks are ignored on purpose.
  function gotoNumber() {
    var v = parseInt($("goto-num").value, 10);
    if (isNaN(v) || v < 1 || v > TOC.BANK.length) return;
    showView("study");
    showSpecific(TOC.BANK[v - 1]);
  }
  function showSpecific(q) {
    answered = false; current = q;
    $("study-empty").hidden = true;
    renderQuestion(q); updateChips();
    if (window.scrollTo) window.scrollTo(0, 0);
  }

  // short, math-safe prompt preview for the dashboard flag list
  function snippet(q) {
    var s = (q.prompt || "").replace(/\\\[[\s\S]*?\\\]/g, " [diagram] ").replace(/\s+/g, " ").trim();
    if (s.length > 110) {
      s = s.slice(0, 110);
      var o = s.lastIndexOf("\\("), c = s.lastIndexOf("\\)");
      if (o > c) s = s.slice(0, o);
      s = s.trim() + "…";
    }
    return s;
  }

  // ---- header / overall --------------------------------------------------
  function refreshHeader() {
    var o = TOC.engine.overall(TOC.BANK, state.progress, state.settings);
    var pct = Math.round(o.mastery * 100);
    $("overall-pct").textContent = pct + "%";
    $("overall-mastered").textContent = o.mastered + " / " + o.total + " mastered";
    var C = 2 * Math.PI * 19;
    $("overall-ring").style.strokeDashoffset = (C * (1 - o.mastery)).toFixed(1);
  }

  // ---- views -------------------------------------------------------------
  function showView(name) {
    ["study", "dashboard", "settings"].forEach(function (v) {
      $("view-" + v).hidden = v !== name;
    });
    document.querySelectorAll(".nav-btn").forEach(function (b) {
      b.classList.toggle("active", b.dataset.view === name);
    });
    if (name === "dashboard") renderDashboard();
    if (name === "settings") renderSettings();
  }

  function wireNav() {
    document.querySelectorAll(".nav-btn").forEach(function (b) {
      b.addEventListener("click", function () { showView(b.dataset.view); });
    });
    $("theme-toggle").addEventListener("click", function () {
      state.settings.theme = state.settings.theme === "dark" ? "light" : "dark";
      applyTheme(); save();
    });
  }
  function applyTheme() { document.documentElement.setAttribute("data-theme", state.settings.theme || "light"); }

  // ---- focus selector ----------------------------------------------------
  function buildFocusOptions() {
    var sel = $("focus-select");
    var keep = sel.value;
    sel.innerHTML = "";
    sel.appendChild(new Option("Auto — follow my edge", "auto"));
    function addOpt(parent, c) {
      var count = TOC.BANK.filter(function (q) { return q.chapter === c.n; }).length;
      if (count === 0) return;
      var unlocked = TOC.engine.isUnlocked(TOC.BANK, state.progress, c.n, state.settings);
      var opt = new Option(c.short + " — " + c.title + (unlocked ? "" : "  🔒"), String(c.n));
      if (!unlocked) opt.disabled = true;
      parent.appendChild(opt);
    }
    TOC.CHAPTERS.forEach(function (c) { addOpt(sel, c); });
    var og = document.createElement("optgroup");
    og.label = "Exam checkpoints";
    TOC.EXAMS.forEach(function (c) { addOpt(og, c); });
    if (og.children.length) sel.appendChild(og);
    if (keep) sel.value = keep;
    if (!sel.value) sel.value = "auto";
  }

  function currentFocus() {
    var v = $("focus-select").value;
    return v === "auto" ? "auto" : Number(v);
  }

  // ---- study loop --------------------------------------------------------
  function nextQuestion() {
    answered = false;
    var q = TOC.engine.pickNext(TOC.BANK, state.progress, state.settings, clock(), currentFocus());
    current = q;
    var area = $("question-area");
    var empty = $("study-empty");
    if (!q) { area.innerHTML = ""; empty.hidden = false; return; }
    empty.hidden = true;
    renderQuestion(q);
    updateChips();
  }

  function updateChips() {
    var meta = current ? TOC.chapterMeta(current.chapter) : null;
    $("chip-chapter").textContent = meta ? meta.short : "—";
    var gs = state.stats.streak || 0;
    var sc = $("chip-streak");
    sc.textContent = "🔥 " + gs + " in a row";
    sc.title = "Consecutive correct answers across all questions — one wrong answer resets it. Best so far: " + (state.stats.bestStreak || 0) + ". (The 3 dots on each question track mastering that one specific question.)";
    var due = TOC.engine.dueCount(TOC.BANK, state.progress, state.settings, clock());
    $("chip-due").textContent = due + " due";
  }

  function masteryDots(q) {
    var st = state.progress[q.id];
    var have = st ? Math.min(st.streak, state.settings.masterStreak) : 0;
    var mastered = st && st.mastered;
    var dots = "";
    for (var i = 0; i < state.settings.masterStreak; i++) dots += '<span class="dot' + (i < have || mastered ? " on" : "") + '"></span>';
    return '<span class="qmastery" title="' + (mastered ? "Mastered" : have + " of " + state.settings.masterStreak + " correct in a row") + '">' + dots + "</span>";
  }

  var TYPE_LABEL = { tf: "True / False", mc: "Multiple choice", multi: "Select all", fib: "Fill in the blank", order: "Put in order" };

  function renderQuestion(q) {
    var area = $("question-area");
    area.innerHTML = "";
    var card = TOC.ui.el("div", "card");

    var meta = TOC.ui.el("div", "qmeta");
    var cm = TOC.chapterMeta(q.chapter);
    meta.appendChild(TOC.ui.el("span", "badge", cm.short));
    if (q.topic) meta.appendChild(TOC.ui.el("span", "badge", TOC.ui.escapeHtml(q.topic)));
    meta.appendChild(TOC.ui.el("span", "badge type", TYPE_LABEL[q.type] || q.type));
    var tier = TOC.rankOf(q);
    meta.appendChild(TOC.ui.el("span", "badge tier tier-" + (tier <= 0 ? "0" : tier < 30 ? "1" : tier < 40 ? "2" : "3"), TOC.rankLabel(tier)));
    meta.appendChild(TOC.ui.el("span", "spacer"));
    meta.appendChild(TOC.ui.el("span", "badge num", "#" + qNum(q)));
    var flagBtn = TOC.ui.el("button", "flag-btn" + (isFlagged(q.id) ? " on" : ""), "🚩");
    flagBtn.type = "button";
    flagBtn.title = isFlagged(q.id) ? "Flagged — click to unflag" : "Flag this for help (shows on the Dashboard)";
    flagBtn.addEventListener("click", function () {
      var on = !isFlagged(q.id);
      setFlag(q.id, on);
      flagBtn.classList.toggle("on", on);
      flagBtn.title = on ? "Flagged — click to unflag" : "Flag this for help (shows on the Dashboard)";
    });
    meta.appendChild(flagBtn);
    meta.insertAdjacentHTML("beforeend", masteryDots(q));
    card.appendChild(meta);

    var prompt = TOC.ui.el("div", "prompt");
    TOC.ui.setRich(prompt, q.prompt);
    card.appendChild(prompt);

    if (q.diagram || q.svg) {
      var fig = TOC.ui.el("div", "figure");
      try { fig.innerHTML = q.svg ? q.svg : TOC.automaton(q.diagram); } catch (e) { fig.textContent = "[diagram]"; }
      card.appendChild(fig);
      TOC.ui.renderMath(fig); // labels may contain \(...\)
    }

    currentInput = TOC.ui.buildInput(q);
    card.appendChild(currentInput.node);

    if (q.type === "multi") {
      var hint = TOC.ui.el("p", "muted small", "Select all that apply, then submit.");
      card.appendChild(hint);
    }

    var actions = TOC.ui.el("div", "actions");
    var submit = TOC.ui.el("button", "btn", "Submit");
    submit.id = "submit-btn";
    submit.addEventListener("click", onSubmit);
    actions.appendChild(submit);
    card.appendChild(actions);

    var fb = TOC.ui.el("div", "feedback");
    fb.id = "feedback"; fb.hidden = true;
    card.appendChild(fb);

    area.appendChild(card);
    if (currentInput.focus) currentInput.focus();
  }

  function onSubmit() {
    if (answered || !current) return;
    if (!currentInput.hasSelection()) { flashSubmit(); return; }
    // choice widgets shuffle/sample their options, so they grade themselves;
    // fib/order fall back to the central grader.
    var result = currentInput.evaluate ? currentInput.evaluate() : TOC.grade(current, currentInput.getResponse());
    answered = true;
    currentInput.reveal(result);

    var before = TOC.engine.unlockedChapterNums(TOC.BANK, state.progress, state.settings);
    TOC.engine.onAnswer(state.progress, current.id, result.correct, clock(), state.settings);
    state.stats.answered++;
    if (result.correct) state.stats.correct++;
    state.stats.clock++;
    // global running streak (consecutive correct across all questions)
    state.stats.streak = result.correct ? (state.stats.streak || 0) + 1 : 0;
    if (state.stats.streak > (state.stats.bestStreak || 0)) state.stats.bestStreak = state.stats.streak;
    var after = TOC.engine.unlockedChapterNums(TOC.BANK, state.progress, state.settings);
    save(); refreshHeader();

    showFeedback(current, result, after.length > before.length ? diffChapters(before, after) : null);
    swapToNext();
  }

  function diffChapters(before, after) {
    return after.filter(function (n) { return before.indexOf(n) === -1; });
  }

  function showFeedback(q, result, unlockedNow) {
    var fb = $("feedback");
    fb.className = "feedback " + (result.correct ? "good" : "bad");
    fb.hidden = false;
    var verdict = result.correct ? "✓ Correct" : "✗ Not quite";
    var html = '<div class="verdict">' + verdict + "</div>";
    if (!result.correct) html += '<div class="explain" id="fb-correct"></div>';
    html += '<div class="explain" id="fb-explain"></div>';
    if (q.source) html += '<div class="source">Source: ' + TOC.ui.escapeHtml(q.source) + "</div>";
    if (unlockedNow && unlockedNow.length) {
      html += '<div class="source" style="color:var(--good);font-weight:700">🔓 Unlocked: ' +
        unlockedNow.map(function (n) { return TOC.chapterMeta(n).short; }).join(", ") + "</div>";
    }
    html += '<div class="deep-actions"><button class="btn ghost small" id="explain-btn" type="button">🤔 I don\'t get it — explain in more depth</button></div>';
    html += '<div class="deep-help" id="deep-help" hidden></div>';
    fb.innerHTML = html;

    if (!result.correct) TOC.ui.setRich($("fb-correct"), "**Answer:** " + correctAnswerText(q));
    TOC.ui.setRich($("fb-explain"), q.explanation || "");
    var eb = $("explain-btn");
    eb.addEventListener("click", toggleDeep);
    if (!result.correct) eb.classList.add("pulse"); // draw the eye after a miss
    buildFocusOptions();
  }

  function toggleDeep() {
    var dh = $("deep-help"), eb = $("explain-btn");
    if (!dh || !eb) return;
    if (dh.hidden) {
      TOC.ui.setRich(dh, deepHelpFor(current));
      dh.hidden = false; eb.textContent = "Hide deeper explanation"; eb.classList.remove("pulse");
    } else {
      dh.hidden = true; eb.textContent = "🤔 I don't get it — explain in more depth";
    }
  }

  function conceptText(c) { return (c.title ? "**" + c.title + "**\n\n" : "") + (c.body || ""); }

  // Deeper explanation for a question: a per-question `deep` field if present,
  // else the concept explainer for its topic (exact chapter match, then any
  // chapter with that topic), else a graceful "key idea + where to look".
  function deepHelpFor(q) {
    if (!q) return "";
    if (q.deep) return q.deep;
    var C = TOC.CONCEPTS;
    if (C && q.topic) {
      if (C[q.chapter + "::" + q.topic]) return conceptText(C[q.chapter + "::" + q.topic]);
      var keys = Object.keys(C);
      for (var i = 0; i < keys.length; i++) {
        if (keys[i].split("::")[1] === q.topic) return conceptText(C[keys[i]]);
      }
    }
    return "**The key idea.** " + (q.explanation || "") +
      "\n\n**Where to look:** review **" + (q.topic || "this topic") + "** in " +
      (q.source || "the relevant Sipser section") + ", together with the definition and the worked example near it. " +
      "If it still isn't clicking, try writing out the smallest example you can and tracing it by hand.";
  }

  function correctAnswerText(q) {
    switch (q.type) {
      case "tf": return q.answer ? "True." : "False.";
      case "mc": return q.choices[Number(q.answer)];
      case "multi": return q.answers.map(function (i) { return q.choices[i]; }).join("; ");
      case "fib": {
        var a = (q.accept && q.accept[0]) ? q.accept[0] : "";
        return /[\\^_{}]/.test(a) ? "\\(" + a + "\\)" : a; // render math-looking answers
      }
      case "order": return q.items.map(function (t, i) { return (i + 1) + ". " + t; }).join("  ");
      default: return "";
    }
  }

  function swapToNext() {
    var actions = document.querySelector("#question-area .actions");
    if (!actions) return;
    actions.innerHTML = "";
    var next = TOC.ui.el("button", "btn", "Next →");
    next.id = "next-btn";
    next.addEventListener("click", nextQuestion);
    actions.appendChild(next);
    next.focus();
    updateChips();
  }

  function flashSubmit() {
    var b = $("submit-btn"); if (!b) return;
    b.animate([{ transform: "translateX(0)" }, { transform: "translateX(-6px)" }, { transform: "translateX(6px)" }, { transform: "translateX(0)" }], { duration: 220 });
  }

  // ---- keyboard ----------------------------------------------------------
  function onKey(e) {
    if ($("view-study").hidden) return;
    if (e.target && e.target.id === "goto-num") return; // the go-to box handles its own keys
    var tag = (e.target.tagName || "").toLowerCase();
    if (e.key === "Enter") {
      if (answered) { var nb = $("next-btn"); if (nb) { e.preventDefault(); nextQuestion(); } }
      else { e.preventDefault(); onSubmit(); }
      return;
    }
    if (tag === "input") return; // don't hijack typing in fill-in-the-blank
    var k = e.key.toLowerCase();
    if (answered) { if (k === "e") { e.preventDefault(); toggleDeep(); } return; } // E = explain deeper
    if (!currentInput) return;
    if (/^[0-9]$/.test(k) || k === "t" || k === "f") { currentInput.handleKey(k); }
  }

  // ---- dashboard ---------------------------------------------------------
  function renderDashboard() {
    var o = TOC.engine.overall(TOC.BANK, state.progress, state.settings);
    var acc = state.stats.answered ? Math.round(100 * state.stats.correct / state.stats.answered) : 0;
    $("dash-stats").innerHTML =
      stat(Math.round(o.mastery * 100) + "%", "overall mastery") +
      stat(o.mastered + "/" + o.total, "questions mastered") +
      stat(state.stats.answered, "answered") +
      stat(acc + "%", "accuracy") +
      stat("🔥 " + (state.stats.bestStreak || 0), "best streak");

    var grid = $("chapter-grid"); grid.innerHTML = "";
    var sepDone = false;
    TOC.allChapters().forEach(function (c) {
      var cs = TOC.engine.chapterStats(TOC.BANK, state.progress, c.n, state.settings);
      if (cs.total === 0) return;
      if (TOC.isExamBucket(c.n) && !sepDone) {
        sepDone = true;
        grid.appendChild(TOC.ui.el("div", "grid-sep", "Exam checkpoints <span class=\"muted\">— unlock as you master each range</span>"));
      }
      var unlocked = TOC.engine.isUnlocked(TOC.BANK, state.progress, c.n, state.settings);
      var card = TOC.ui.el("div", "chcard" + (unlocked ? "" : " locked") + (TOC.isExamBucket(c.n) ? " checkpoint" : ""));
      card.innerHTML =
        '<div class="chtop"><span class="chnum">' + c.short + '</span>' +
        '<span class="lock-pill ' + (unlocked ? "open" : "") + '">' + (unlocked ? "open" : "locked") + '</span></div>' +
        '<h4>' + TOC.ui.escapeHtml(c.title) + '</h4>' +
        '<div class="blurb">' + TOC.ui.escapeHtml(c.blurb || "") + '</div>' +
        '<div class="bar"><span style="width:' + (cs.mastery * 100).toFixed(0) + '%"></span></div>' +
        '<div class="chstat"><span>' + Math.round(cs.mastery * 100) + '% mastery</span>' +
        '<span>' + cs.mastered + " / " + cs.total + ' mastered</span></div>';
      if (unlocked) {
        var btn = TOC.ui.el("button", "btn", "Study " + c.short);
        btn.addEventListener("click", function () { $("focus-select").value = String(c.n); showView("study"); nextQuestion(); });
        card.appendChild(btn);
        if ((state.settings.unlocked || []).indexOf(c.n) !== -1) {
          var lk = TOC.ui.el("button", "btn ghost small", "🔒 re-lock");
          lk.title = "Re-lock (only affects Guided mode)";
          lk.addEventListener("click", function () { setUnlocked(c.n, false); renderDashboard(); });
          card.appendChild(lk);
        }
      } else {
        var ub = TOC.ui.el("button", "btn", "🔓 Unlock");
        ub.title = "Open this now for focused study, without finishing earlier chapters first";
        ub.addEventListener("click", function () { setUnlocked(c.n, true); renderDashboard(); });
        card.appendChild(ub);
      }
      grid.appendChild(card);
    });

    // flagged-for-help list
    var flagged = TOC.BANK.map(function (q, i) { return { q: q, n: i + 1 }; })
      .filter(function (o) { var s = state.progress[o.q.id]; return s && s.flagged; });
    $("flag-count").textContent = flagged.length ? "— " + flagged.length + " marked" : "";
    var fl = $("flag-list");
    fl.innerHTML = flagged.length ? "" :
      '<li class="muted">No flagged questions yet. Click the 🚩 on any question to mark it (e.g. for me to help with — just tell me the number).</li>';
    flagged.forEach(function (o) {
      var li = TOC.ui.el("li");
      li.appendChild(TOC.ui.el("span", "flag-num", "#" + o.n));
      li.appendChild(TOC.ui.el("span", "flag-ch", TOC.chapterMeta(o.q.chapter).short));
      var p = TOC.ui.el("span", "flag-prompt"); TOC.ui.setRich(p, snippet(o.q)); li.appendChild(p);
      var go = TOC.ui.el("button", "btn ghost small", "Go to");
      go.addEventListener("click", function () { showSpecific(o.q); });
      var un = TOC.ui.el("button", "btn ghost small", "Unflag");
      un.addEventListener("click", function () { setFlag(o.q.id, false); renderDashboard(); });
      li.appendChild(go); li.appendChild(un);
      fl.appendChild(li);
    });

    // weakest topics (only among attempted)
    var byTopic = {};
    TOC.BANK.forEach(function (q) {
      var key = TOC.chapterMeta(q.chapter).short + " · " + (q.topic || "General");
      var st = state.progress[q.id];
      var m = TOC.engine.qMastery(st, state.settings.masterStreak);
      var seen = st && st.seen > 0;
      if (!byTopic[key]) byTopic[key] = { sum: 0, n: 0, seen: 0, ch: q.chapter };
      byTopic[key].sum += m; byTopic[key].n++; if (seen) byTopic[key].seen++;
    });
    var rows = Object.keys(byTopic).map(function (k) {
      var t = byTopic[k]; return { key: k, m: t.sum / t.n, seen: t.seen, ch: t.ch };
    }).filter(function (r) { return r.seen > 0; }).sort(function (a, b) { return a.m - b.m; }).slice(0, 8);
    var wl = $("weak-list");
    wl.innerHTML = rows.length ? "" : '<li class="muted">Answer a few questions and your weak spots will show up here.</li>';
    rows.forEach(function (r) {
      var li = TOC.ui.el("li");
      li.innerHTML = '<span>' + TOC.ui.escapeHtml(r.key.split(" · ")[1]) + '</span>' +
        '<span class="wbar"><span style="width:' + Math.round(r.m * 100) + '%"></span></span>' +
        '<span class="wch">' + r.key.split(" · ")[0] + " · " + Math.round(r.m * 100) + '%</span>';
      wl.appendChild(li);
    });
  }
  function stat(v, l) { return '<div class="stat"><div class="v">' + v + '</div><div class="l">' + l + "</div></div>"; }

  // ---- settings ----------------------------------------------------------
  function renderSettings() {
    document.querySelectorAll("#mode-seg button").forEach(function (b) {
      b.classList.toggle("active", b.dataset.mode === state.settings.mode);
    });
    document.querySelectorAll("#ramp-seg button").forEach(function (b) {
      b.classList.toggle("active", (b.dataset.ramp === "on") === (state.settings.ramp !== false));
    });
    var ms = $("master-streak"); ms.value = state.settings.masterStreak; $("ms-val").textContent = state.settings.masterStreak + "×";
    var ut = $("unlock-threshold"); ut.value = state.settings.unlockThreshold; $("ut-val").textContent = Math.round(state.settings.unlockThreshold * 100) + "%";
    var stat = $("storage-status");
    if (!stat) {
      stat = TOC.ui.el("p", "muted small"); stat.id = "storage-status";
      var row = document.querySelector("#view-settings .btn-row");
      if (row) row.parentNode.appendChild(stat);
    }
    var ok = TOC.storage.available();
    stat.innerHTML = ok
      ? "Progress saving: <strong style=\"color:var(--good)\">on</strong> — your progress is being saved in this browser."
      : "Progress saving: <strong style=\"color:var(--bad)\">off</strong> — this browser isn't persisting data (common with file://). Use Export/Import, or run via Start Review.cmd.";
  }

  function wireSettings() {
    document.querySelectorAll("#mode-seg button").forEach(function (b) {
      b.addEventListener("click", function () {
        state.settings.mode = b.dataset.mode; save(); renderSettings(); buildFocusOptions(); refreshHeader();
      });
    });
    document.querySelectorAll("#ramp-seg button").forEach(function (b) {
      b.addEventListener("click", function () {
        state.settings.ramp = (b.dataset.ramp === "on"); save(); renderSettings();
      });
    });
    $("master-streak").addEventListener("input", function () {
      state.settings.masterStreak = Number(this.value); $("ms-val").textContent = this.value + "×"; save(); refreshHeader();
    });
    $("unlock-threshold").addEventListener("input", function () {
      state.settings.unlockThreshold = Number(this.value); $("ut-val").textContent = Math.round(this.value * 100) + "%"; save(); buildFocusOptions();
    });
    $("export-btn").addEventListener("click", function () { TOC.storage.exportJSON(state); });
    $("import-btn").addEventListener("click", function () { $("import-file").click(); });
    $("import-file").addEventListener("change", function () {
      if (!this.files[0]) return;
      TOC.storage.importJSON(this.files[0], function (err, s) {
        if (err) { alert("Import failed: " + err.message); return; }
        state = s; save(); applyTheme(); buildFocusOptions(); refreshHeader(); renderSettings();
        alert("Progress imported."); showView("study"); nextQuestion();
      });
      this.value = "";
    });
    $("reset-btn").addEventListener("click", function () {
      if (!confirm("Erase all progress and start over? This cannot be undone (export a backup first if unsure).")) return;
      state = TOC.storage.fresh(); save(); applyTheme(); buildFocusOptions(); refreshHeader(); renderSettings(); showView("study"); nextQuestion();
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})(typeof window !== "undefined" ? window : globalThis);
