/* Controller: bootstraps state, runs the study loop, dashboard, settings. */
(function (root) {
  var TOC = root.TOC;
  var $ = function (id) { return document.getElementById(id); };
  var state, current = null, currentInput = null, answered = false, drillTopic = null, exam = null;

  // ---- boot --------------------------------------------------------------
  function boot() {
    state = TOC.storage.load() || TOC.storage.fresh();
    applyTheme();
    wireNav();
    wireSettings();
    buildFocusOptions();
    $("focus-select").addEventListener("change", function () { drillTopic = null; nextQuestion(); });
    $("goto-num").addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); gotoNumber(); } });
    $("mock-btn").addEventListener("click", startExamSetup);
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
    drillTopic = null;
    showView("study");
    showSpecific(TOC.BANK[v - 1]);
  }
  function showSpecific(q) {
    answered = false; current = q;
    $("study-empty").hidden = true;
    renderQuestion(q); updateChips();
    if (window.scrollTo) window.scrollTo(0, 0);
  }

  // Drill a single topic across all unlocked chapters (launched from the
  // dashboard's weak-topics list). Overrides the Focus dropdown until cleared.
  function startTopicDrill(topic) {
    drillTopic = topic;
    showView("study");
    if (window.scrollTo) window.scrollTo(0, 0);
    nextQuestion();
  }
  function clearDrill() { if (!drillTopic) return; drillTopic = null; nextQuestion(); }

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
    ["study", "dashboard", "reference", "settings"].forEach(function (v) {
      $("view-" + v).hidden = v !== name;
    });
    document.querySelectorAll(".nav-btn").forEach(function (b) {
      b.classList.toggle("active", b.dataset.view === name);
    });
    if (name === "dashboard") renderDashboard();
    if (name === "reference") renderReference();
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
    var q = TOC.engine.pickNext(TOC.BANK, state.progress, state.settings, clock(), currentFocus(), drillTopic);
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
    var chips = $("chip-chapter").parentNode;
    var dc = $("chip-drill");
    if (drillTopic) {
      if (!dc) { dc = TOC.ui.el("span", "chip drill"); dc.id = "chip-drill"; chips.insertBefore(dc, chips.firstChild); }
      dc.innerHTML = "🎯 " + TOC.ui.escapeHtml(drillTopic) + ' <span class="chip-x" title="Stop drilling this topic">✕</span>';
      dc.querySelector(".chip-x").onclick = function (e) { e.stopPropagation(); clearDrill(); };
    } else if (dc) { dc.parentNode.removeChild(dc); }
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

  var TYPE_LABEL = { tf: "True / False", mc: "Multiple choice", multi: "Select all", fib: "Fill in the blank", order: "Put in order", discussion: "Discussion" };

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

    if (q.diagram || q.svg || q.grid) {
      var fig = TOC.ui.el("div", "figure");
      try { fig.innerHTML = q.svg ? q.svg : q.grid ? TOC.grid(q.grid) : TOC.automaton(q.diagram); } catch (e) { fig.textContent = "[diagram]"; }
      card.appendChild(fig);
      TOC.ui.renderMath(fig); // labels may contain \(...\)
    }

    if (q.type === "discussion") {
      currentInput = null;
      renderDiscussion(q, card);
      area.appendChild(card);
      return;
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

  // ---- discussion: a real-world scenario plus a guided series of auto-graded
  // sub-questions, revealed one at a time with teaching after each. Reports one
  // result to the engine (correct only if every step was right), so it counts
  // toward mastery like any other question. ----
  function renderDiscussion(q, card) {
    var steps = q.steps || [];
    var results = [];
    var stepsWrap = TOC.ui.el("div", "disc-steps");
    card.appendChild(stepsWrap);
    var controls = TOC.ui.el("div", "actions");
    card.appendChild(controls);
    var fb = TOC.ui.el("div", "feedback");
    fb.id = "feedback"; fb.hidden = true;
    card.appendChild(fb);

    function renderStep(i) {
      var step = steps[i];
      var box = TOC.ui.el("div", "disc-step");
      box.appendChild(TOC.ui.el("div", "disc-step-n", "Step " + (i + 1) + " of " + steps.length));
      var sp = TOC.ui.el("div", "disc-q"); TOC.ui.setRich(sp, step.prompt); box.appendChild(sp);
      if (step.diagram || step.svg || step.grid) {
        var fig = TOC.ui.el("div", "figure");
        try { fig.innerHTML = step.svg ? step.svg : step.grid ? TOC.grid(step.grid) : TOC.automaton(step.diagram); } catch (e) { fig.textContent = "[diagram]"; }
        box.appendChild(fig); TOC.ui.renderMath(fig);
      }
      var isTF = step.type === "tf";
      var optionTexts = isTF ? ["True", "False"] : step.choices.slice();
      var correctIdx = isTF ? (step.answer ? 0 : 1) : step.answer;
      var order = optionTexts.map(function (_, k) { return k; });
      if (!isTF) { for (var a = order.length - 1; a > 0; a--) { var b = Math.floor(Math.random() * (a + 1)); var t = order[a]; order[a] = order[b]; order[b] = t; } }
      var optsWrap = TOC.ui.el("div", "options");
      var nodes = [], selected = null, checked = false;
      order.forEach(function (origK, pos) {
        var opt = TOC.ui.el("div", "opt");
        opt.appendChild(TOC.ui.el("div", "key", isTF ? (optionTexts[origK] === "True" ? "T" : "F") : String(pos + 1)));
        var body = TOC.ui.el("div", "opt-body"); TOC.ui.setRich(body, optionTexts[origK]); opt.appendChild(body);
        opt.addEventListener("click", function () {
          if (checked) return;
          selected = origK;
          nodes.forEach(function (n, j) { n.classList.toggle("sel", order[j] === origK); });
        });
        optsWrap.appendChild(opt); nodes.push(opt);
      });
      box.appendChild(optsWrap);
      var explain = TOC.ui.el("div", "disc-explain"); explain.hidden = true; box.appendChild(explain);
      stepsWrap.appendChild(box);

      controls.innerHTML = "";
      var btn = TOC.ui.el("button", "btn", "Check");
      controls.appendChild(btn);
      btn.focus();
      btn.addEventListener("click", function () {
        if (!checked) {
          if (selected == null) { flashEl(btn); return; }
          checked = true;
          var ok = selected === correctIdx;
          results[i] = ok;
          nodes.forEach(function (n, j) {
            n.setAttribute("disabled", "");
            if (order[j] === correctIdx) n.classList.add("correct");
            else if (order[j] === selected) n.classList.add("wrong");
          });
          TOC.ui.setRich(explain, (ok ? "**✓ Right.** " : "**✗ Not quite.** ") + (step.explain || ""));
          explain.hidden = false;
          box.classList.add("done");
          btn.textContent = (i + 1 < steps.length) ? "Next step →" : "See why this matters →";
          btn.focus();
        } else {
          if (i + 1 < steps.length) renderStep(i + 1);
          else finish();
        }
      });
    }

    function finish() {
      var n = steps.length, k = results.filter(Boolean).length;
      answered = true;
      applyResult(q, { correct: n > 0 && k === n, tally: k + " / " + n });
      controls.innerHTML = "";
      var next = TOC.ui.el("button", "btn", "Next →");
      next.id = "next-btn";
      next.addEventListener("click", nextQuestion);
      controls.appendChild(next); next.focus();
    }

    renderStep(0);
  }

  function flashEl(b) {
    if (!b || !b.animate) return;
    b.animate([{ transform: "translateX(0)" }, { transform: "translateX(-6px)" }, { transform: "translateX(6px)" }, { transform: "translateX(0)" }], { duration: 220 });
  }

  function onSubmit() {
    if (exam || answered || !current || !currentInput) return;
    if (!currentInput.hasSelection()) { flashSubmit(); return; }
    // choice widgets shuffle/sample their options, so they grade themselves;
    // fib/order fall back to the central grader.
    var result = currentInput.evaluate ? currentInput.evaluate() : TOC.grade(current, currentInput.getResponse());
    answered = true;
    currentInput.reveal(result);
    applyResult(current, result);
    swapToNext();
  }

  // Record a graded answer: update the engine, stats, streak, persistence,
  // header, and feedback panel. Shared by the normal submit flow and the
  // multi-step discussion flow. Does NOT swap the action button.
  function applyResult(q, result) {
    var before = TOC.engine.unlockedChapterNums(TOC.BANK, state.progress, state.settings);
    TOC.engine.onAnswer(state.progress, q.id, result.correct, clock(), state.settings);
    state.stats.answered++;
    if (result.correct) state.stats.correct++;
    state.stats.clock++;
    // global running streak (consecutive correct across all questions)
    state.stats.streak = result.correct ? (state.stats.streak || 0) + 1 : 0;
    if (state.stats.streak > (state.stats.bestStreak || 0)) state.stats.bestStreak = state.stats.streak;
    var after = TOC.engine.unlockedChapterNums(TOC.BANK, state.progress, state.settings);
    save(); refreshHeader();
    showFeedback(q, result, after.length > before.length ? diffChapters(before, after) : null);
  }

  function diffChapters(before, after) {
    return after.filter(function (n) { return before.indexOf(n) === -1; });
  }

  function showFeedback(q, result, unlockedNow) {
    var fb = $("feedback");
    fb.className = "feedback " + (result.correct ? "good" : "bad");
    fb.hidden = false;
    var verdict = result.correct ? "✓ Correct" : "✗ Not quite";
    if (result.tally) verdict = (result.correct ? "✓ All steps right — " : "→ ") + result.tally + " steps";
    var showCorrect = !result.correct && !!correctAnswerText(q);
    var html = '<div class="verdict">' + verdict + "</div>";
    if (showCorrect) html += '<div class="explain" id="fb-correct"></div>';
    html += '<div class="explain" id="fb-explain"></div>';
    var wm = whyFor(q);
    if (wm && wm.why) html += '<div class="why-matters" id="fb-why"></div>';
    if (wm && wm.real) html += '<div class="real-world" id="fb-real"></div>';
    if (q.source) html += '<div class="source">Source: ' + TOC.ui.escapeHtml(q.source) + "</div>";
    if (unlockedNow && unlockedNow.length) {
      html += '<div class="source" style="color:var(--good);font-weight:700">🔓 Unlocked: ' +
        unlockedNow.map(function (n) { return TOC.chapterMeta(n).short; }).join(", ") + "</div>";
    }
    html += '<div class="deep-actions"><button class="btn ghost small" id="explain-btn" type="button">🤔 I don\'t get it — explain in more depth</button></div>';
    html += '<div class="deep-help" id="deep-help" hidden></div>';
    fb.innerHTML = html;

    if (showCorrect) TOC.ui.setRich($("fb-correct"), "**Answer:** " + correctAnswerText(q));
    TOC.ui.setRich($("fb-explain"), q.explanation || "");
    if (wm && wm.why) TOC.ui.setRich($("fb-why"), "**🎯 Why this matters.** " + wm.why);
    if (wm && wm.real) TOC.ui.setRich($("fb-real"), "**🌍 In the real world.** " + wm.real);
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

  // Why-this-matters + real-world for a question: a per-question whyMatters /
  // realWorld if present, else the topic-level entry from TOC.WHY (exact
  // chapter::topic match, then any chapter with that topic) so every question
  // gets one via its topic. Returns { why, real } or null.
  function whyFor(q) {
    if (!q) return null;
    if (q.whyMatters || q.realWorld) return { why: q.whyMatters, real: q.realWorld };
    var W = TOC.WHY;
    if (W && q.topic) {
      var e = W[q.chapter + "::" + q.topic];
      if (!e) {
        var keys = Object.keys(W);
        for (var i = 0; i < keys.length; i++) { if (keys[i].split("::")[1] === q.topic) { e = W[keys[i]]; break; } }
      }
      if (e) return { why: e.why, real: e.real };
    }
    return null;
  }

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
      case "discussion": return "";
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

  // ---- mock exam: timed, batch-graded, feedback deferred to a score report ---
  // A separate assessment — it does NOT touch the spaced-repetition progress.
  function startExamSetup() {
    drillTopic = null; if (exam) endExam();
    showView("study");
    var sc = document.querySelector(".study-controls"); if (sc) sc.style.display = "";
    $("study-empty").hidden = true;
    var area = $("question-area"); area.innerHTML = "";
    var card = TOC.ui.el("div", "card exam-setup");
    card.innerHTML = '<h2>🎓 Mock exam</h2><p class="muted">A timed batch drawn from every chapter — no feedback until you finish, then a scored report with a per-chapter breakdown. Your mastery progress is left untouched.</p>';
    var presets = [[10, 15, "Quick"], [20, 30, "Standard"], [40, 60, "Full final"]];
    var row = TOC.ui.el("div", "exam-presets");
    presets.forEach(function (p) {
      var b = TOC.ui.el("button", "btn", "<strong>" + p[2] + "</strong><span>" + p[0] + " questions &middot; " + p[1] + " min</span>");
      b.addEventListener("click", function () { startExam(p[0], p[1]); });
      row.appendChild(b);
    });
    card.appendChild(row);
    var cancel = TOC.ui.el("button", "btn ghost small", "Cancel");
    cancel.addEventListener("click", function () { nextQuestion(); });
    card.appendChild(cancel);
    area.appendChild(card);
    if (window.scrollTo) window.scrollTo(0, 0);
  }

  function sampleExam(n) {
    var pool = TOC.BANK.filter(function (q) {
      return !TOC.isExamBucket(q.chapter) && q.type !== "discussion" && TOC.rankOf(q) >= 10;
    }).slice();
    for (var i = pool.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = pool[i]; pool[i] = pool[j]; pool[j] = t; }
    return pool.slice(0, Math.min(n, pool.length));
  }

  function startExam(n, minutes) {
    var qs = sampleExam(n);
    if (!qs.length) return;
    exam = { qs: qs, i: 0, results: [], minutes: minutes, endAt: Date.now() + minutes * 60000, timer: null, finished: false };
    var sc = document.querySelector(".study-controls"); if (sc) sc.style.display = "none";
    exam.timer = setInterval(updateExamTimer, 500);
    renderExamQuestion();
  }

  function renderExamQuestion() {
    if (!exam) return;
    var q = exam.qs[exam.i];
    current = q; answered = false;
    var area = $("question-area"); area.innerHTML = "";
    var card = TOC.ui.el("div", "card");
    var head = TOC.ui.el("div", "exam-head");
    head.innerHTML = '<span class="exam-prog">Question ' + (exam.i + 1) + ' / ' + exam.qs.length + '</span><span class="exam-timer" id="exam-timer">⏱</span>';
    card.appendChild(head);
    var meta = TOC.ui.el("div", "qmeta");
    meta.appendChild(TOC.ui.el("span", "badge", TOC.chapterMeta(q.chapter).short));
    if (q.topic) meta.appendChild(TOC.ui.el("span", "badge", TOC.ui.escapeHtml(q.topic)));
    meta.appendChild(TOC.ui.el("span", "badge type", TYPE_LABEL[q.type] || q.type));
    card.appendChild(meta);
    var prompt = TOC.ui.el("div", "prompt"); TOC.ui.setRich(prompt, q.prompt); card.appendChild(prompt);
    if (q.diagram || q.svg || q.grid) {
      var fig = TOC.ui.el("div", "figure");
      try { fig.innerHTML = q.svg ? q.svg : q.grid ? TOC.grid(q.grid) : TOC.automaton(q.diagram); } catch (e) { fig.textContent = "[diagram]"; }
      card.appendChild(fig); TOC.ui.renderMath(fig);
    }
    currentInput = TOC.ui.buildInput(q);
    card.appendChild(currentInput.node);
    if (q.type === "multi") card.appendChild(TOC.ui.el("p", "muted small", "Select all that apply."));
    var actions = TOC.ui.el("div", "actions");
    var btn = TOC.ui.el("button", "btn", exam.i + 1 < exam.qs.length ? "Submit & next →" : "Finish exam");
    btn.addEventListener("click", examSubmit);
    actions.appendChild(btn);
    var skip = TOC.ui.el("button", "btn ghost small", "Skip");
    skip.addEventListener("click", function () { exam.results[exam.i] = { q: q, correct: false, skipped: true }; advanceExam(); });
    actions.appendChild(skip);
    card.appendChild(actions);
    area.appendChild(card);
    updateExamTimer();
    if (currentInput.focus) currentInput.focus();
    if (window.scrollTo) window.scrollTo(0, 0);
  }

  function examSubmit() {
    if (!exam || !currentInput) return;
    if (!currentInput.hasSelection()) {
      var b = document.querySelector("#question-area .actions .btn");
      if (b && b.animate) b.animate([{ transform: "translateX(0)" }, { transform: "translateX(-6px)" }, { transform: "translateX(6px)" }, { transform: "translateX(0)" }], { duration: 220 });
      return;
    }
    var result = currentInput.evaluate ? currentInput.evaluate() : TOC.grade(exam.qs[exam.i], currentInput.getResponse());
    exam.results[exam.i] = { q: exam.qs[exam.i], correct: !!result.correct };
    advanceExam();
  }

  function advanceExam() {
    exam.i++;
    if (exam.i >= exam.qs.length) finishExam();
    else renderExamQuestion();
  }

  function updateExamTimer() {
    if (!exam || exam.finished) return;
    var el = $("exam-timer");
    var left = Math.max(0, Math.round((exam.endAt - Date.now()) / 1000));
    if (el) {
      var m = Math.floor(left / 60), s = left % 60;
      el.textContent = "⏱ " + m + ":" + (s < 10 ? "0" : "") + s;
      el.classList.toggle("low", left <= 60);
    }
    if (left <= 0) finishExam();
  }

  function finishExam() {
    if (!exam || exam.finished) return;
    exam.finished = true;
    if (exam.timer) { clearInterval(exam.timer); exam.timer = null; }
    var total = exam.qs.length, answeredN = 0, correct = 0, byCh = {};
    exam.qs.forEach(function (q, i) {
      var r = exam.results[i];
      byCh[q.chapter] = byCh[q.chapter] || { n: 0, ok: 0 };
      byCh[q.chapter].n++;
      if (r) { if (!r.skipped) answeredN++; if (r.correct) { correct++; byCh[q.chapter].ok++; } }
    });
    var pct = Math.round(100 * correct / total);
    var area = $("question-area"); area.innerHTML = "";
    var card = TOC.ui.el("div", "card exam-report");
    var html = '<h2>Mock exam &middot; ' + pct + '%</h2>' +
      '<p class="exam-score">' + correct + ' / ' + total + ' correct' + (answeredN < total ? ' &middot; ' + (total - answeredN) + ' left blank' : '') + '</p>' +
      '<div class="exam-breakdown">';
    Object.keys(byCh).sort(function (a, b) { return a - b; }).forEach(function (c) {
      var b = byCh[c];
      html += '<div class="exam-chrow"><span class="ec-name">' + TOC.chapterMeta(Number(c)).short + '</span><span class="wbar"><span style="width:' + Math.round(100 * b.ok / b.n) + '%"></span></span><span class="ec-num">' + b.ok + '/' + b.n + '</span></div>';
    });
    html += '</div>';
    var misses = [];
    exam.qs.forEach(function (q, i) { var r = exam.results[i]; if (!r || !r.correct) misses.push(q); });
    if (misses.length) html += '<h3>Review your misses (' + misses.length + ')</h3><ul class="exam-misses" id="exam-misses"></ul>';
    html += '<div class="actions"><button class="btn" id="exam-again">New mock exam</button><button class="btn ghost" id="exam-done">Back to study</button></div>';
    card.innerHTML = html;
    area.appendChild(card);
    TOC.ui.renderMath(card);
    if (misses.length) {
      var ul = $("exam-misses");
      misses.forEach(function (q) {
        var li = TOC.ui.el("li");
        var p = TOC.ui.el("span", "miss-prompt"); TOC.ui.setRich(p, snippet(q)); li.appendChild(p);
        var go = TOC.ui.el("button", "btn ghost small", "Review #" + qNum(q));
        go.addEventListener("click", function () { endExam(); showSpecific(q); });
        li.appendChild(go); ul.appendChild(li);
      });
    }
    $("exam-again").addEventListener("click", function () { var n = exam.qs.length, m = exam.minutes; endExam(); startExam(n, m); });
    $("exam-done").addEventListener("click", function () { endExam(); nextQuestion(); });
    if (window.scrollTo) window.scrollTo(0, 0);
  }

  function endExam() {
    if (exam && exam.timer) clearInterval(exam.timer);
    exam = null;
    var sc = document.querySelector(".study-controls"); if (sc) sc.style.display = "";
  }

  // ---- keyboard ----------------------------------------------------------
  function onKey(e) {
    if ($("view-study").hidden) return;
    if (e.target && e.target.id === "goto-num") return; // the go-to box handles its own keys
    if (exam && !exam.finished) {
      if (e.key === "Enter") { e.preventDefault(); var eb = document.querySelector("#question-area .actions .btn"); if (eb) eb.click(); return; }
      if ((e.target.tagName || "").toLowerCase() === "input") return;
      var ek = e.key.toLowerCase();
      if (currentInput && (/^[0-9]$/.test(ek) || ek === "t" || ek === "f")) currentInput.handleKey(ek);
      return;
    }
    var tag = (e.target.tagName || "").toLowerCase();
    if (e.key === "Enter") {
      if (answered) { var nb = $("next-btn"); if (nb) { e.preventDefault(); nextQuestion(); } }
      else if (currentInput) { e.preventDefault(); onSubmit(); }
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
      var topic = r.key.split(" · ")[1];
      var li = TOC.ui.el("li", "weak-row");
      li.title = "Drill this topic across your unlocked chapters";
      li.innerHTML = '<span>' + TOC.ui.escapeHtml(topic) + '</span>' +
        '<span class="wbar"><span style="width:' + Math.round(r.m * 100) + '%"></span></span>' +
        '<span class="wch">' + r.key.split(" · ")[0] + " · " + Math.round(r.m * 100) + '%</span>' +
        '<span class="drill-go">drill →</span>';
      li.addEventListener("click", function () { startTopicDrill(topic); });
      wl.appendChild(li);
    });
  }
  function stat(v, l) { return '<div class="stat"><div class="v">' + v + '</div><div class="l">' + l + "</div></div>"; }

  // ---- reference / cheat-sheet -------------------------------------------
  var REF_COMPLEXITY_SVG = '<svg viewBox="0 0 380 150" xmlns="http://www.w3.org/2000/svg" font-family="Georgia, \'Times New Roman\', serif"><rect x="8" y="8" width="364" height="134" rx="10" fill="none" stroke="var(--ink-soft)" stroke-width="1.5"/><text x="16" y="24" font-size="12" fill="var(--ink-soft)">EXPTIME</text><rect x="28" y="30" width="324" height="104" rx="9" fill="none" stroke="var(--ink-soft)" stroke-width="1.5"/><text x="36" y="46" font-size="12" fill="var(--ink-soft)">PSPACE</text><rect x="54" y="52" width="272" height="74" rx="8" fill="none" stroke="var(--brand)" stroke-width="1.5"/><text x="62" y="68" font-size="12" fill="var(--brand)">NP</text><rect x="84" y="74" width="212" height="44" rx="7" fill="var(--brand-soft)" stroke="var(--brand)" stroke-width="1.5"/><text x="190" y="101" text-anchor="middle" font-size="13" font-weight="700" fill="var(--brand)">P</text></svg>';
  var REF_HIERARCHY_SVG = '<svg viewBox="0 0 380 150" xmlns="http://www.w3.org/2000/svg" font-family="Georgia, \'Times New Roman\', serif"><rect x="8" y="8" width="364" height="134" rx="10" fill="none" stroke="var(--ink-soft)" stroke-width="1.5"/><text x="16" y="24" font-size="11" fill="var(--ink-soft)">Turing-recognizable</text><rect x="28" y="30" width="324" height="104" rx="9" fill="none" stroke="var(--ink-soft)" stroke-width="1.5"/><text x="36" y="46" font-size="11" fill="var(--ink-soft)">decidable</text><rect x="54" y="52" width="272" height="74" rx="8" fill="none" stroke="var(--brand)" stroke-width="1.5"/><text x="62" y="68" font-size="11" fill="var(--brand)">context-free</text><rect x="84" y="74" width="212" height="44" rx="7" fill="var(--brand-soft)" stroke="var(--brand)" stroke-width="1.5"/><text x="190" y="101" text-anchor="middle" font-size="12" font-weight="700" fill="var(--brand)">regular</text></svg>';

  function renderReference() {
    function block(title, inner) { return '<section class="ref-block"><h3>' + title + "</h3>" + inner + "</section>"; }
    function cells(a) { return a.map(function (v) { return '<td class="' + (v ? "yes" : "no") + '">' + (v ? "✓" : "✗") + "</td>"; }).join(""); }
    function crow(name, a) { return "<tr><th>" + name + "</th>" + cells(a) + "</tr>"; }
    function nrow(s, d) { return "<tr><th>" + s + "</th><td>" + d + "</td></tr>"; }

    var closure = block("Closure properties",
      '<div class="ref-scroll"><table class="ref-table"><thead><tr><th>Class</th><th>∪</th><th>∩</th><th>compl.</th><th>concat</th><th>star</th></tr></thead><tbody>' +
      crow("Regular", [1, 1, 1, 1, 1]) +
      crow("Context-free", [1, 0, 0, 1, 1]) +
      crow("Decidable", [1, 1, 1, 1, 1]) +
      crow("T-recognizable", [1, 1, 0, 1, 1]) +
      '</tbody></table></div><p class="ref-note">CFLs are <strong>not</strong> closed under \\(\\cap\\) or complement; recognizable languages are <strong>not</strong> closed under complement — which is exactly why \\(A_{TM}\\) is recognizable but \\(\\overline{A_{TM}}\\) is not.</p>');

    var decid = block("Decidable? Recognizable?",
      '<div class="ref-scroll"><table class="ref-table"><thead><tr><th>Problem</th><th>Decidable</th><th>Recog.</th><th>co-Recog.</th></tr></thead><tbody>' +
      crow("\\(A_{DFA}, E_{DFA}, EQ_{DFA}\\)", [1, 1, 1]) +
      crow("\\(A_{CFG}, E_{CFG}\\)", [1, 1, 1]) +
      crow("\\(A_{TM}, HALT_{TM}\\)", [0, 1, 0]) +
      crow("\\(E_{TM}\\)", [0, 0, 1]) +
      crow("\\(EQ_{TM}\\)", [0, 0, 0]) +
      '</tbody></table></div><p class="ref-note">Decidable = Recognizable <em>and</em> co-Recognizable (Thm 4.22). \\(A_{TM}\\) is the canonical recognizable-but-undecidable language; \\(EQ_{TM}\\) is neither.</p>');

    var maps = block("The class maps", '<div class="ref-maps">' + REF_HIERARCHY_SVG + REF_COMPLEXITY_SVG + "</div>");

    var complete = block("Canonical complete problems",
      '<ul class="ref-list">' +
      "<li><strong>NP-complete:</strong> SAT, 3SAT, CLIQUE, VERTEX-COVER, INDEPENDENT-SET, HAMPATH, SUBSET-SUM</li>" +
      "<li><strong>PSPACE-complete:</strong> TQBF, FORMULA-GAME, generalized geography (GG)</li>" +
      "<li><strong>NL-complete:</strong> PATH (directed \\(s\\to t\\) reachability), 2SAT</li>" +
      "<li><strong>In P:</strong> PATH, RELPRIME, and <em>every</em> context-free language</li>" +
      "</ul>");

    var pump = block("Pumping lemmas",
      '<p><strong>Regular:</strong> if \\(A\\) is regular there is a length \\(p\\) so every \\(s\\in A\\) with \\(|s|\\ge p\\) splits as \\(s=xyz\\): (i) \\(xy^iz\\in A\\) for all \\(i\\ge 0\\), (ii) \\(|y|>0\\), (iii) \\(|xy|\\le p\\).</p>' +
      '<p><strong>Context-free:</strong> if \\(A\\) is a CFL there is a \\(p\\) so every \\(s\\in A\\), \\(|s|\\ge p\\), splits as \\(s=uvxyz\\): (i) \\(uv^ixy^iz\\in A\\) for all \\(i\\ge 0\\), (ii) \\(|vy|>0\\), (iii) \\(|vxy|\\le p\\).</p>' +
      '<p class="ref-note">To prove non-regular / non-context-free: <em>you</em> pick \\(s\\); the adversary splits it; you pump to a string outside \\(A\\).</p>');

    var thms = block("Key theorems",
      '<ul class="ref-list">' +
      '<li><strong>Church–Turing:</strong> "algorithm" = Turing machine.</li>' +
      "<li><strong>Rice:</strong> every nontrivial property of \\(L(M)\\) is undecidable.</li>" +
      "<li><strong>Cook–Levin:</strong> SAT is NP-complete.</li>" +
      "<li><strong>Savitch:</strong> \\(NSPACE(f)\\subseteq SPACE(f^2)\\) for \\(f\\ge\\log n\\).</li>" +
      "<li><strong>Immerman–Szelepcsényi:</strong> \\(NL=coNL\\).</li>" +
      "<li><strong>Hierarchy:</strong> regular \\(\\subsetneq\\) CFL \\(\\subsetneq\\) decidable \\(\\subsetneq\\) recognizable; and \\(L\\subseteq NL\\subseteq P\\subseteq NP\\subseteq PSPACE\\subseteq EXPTIME\\).</li>" +
      "</ul>");

    var notation = block("Notation",
      '<div class="ref-scroll"><table class="ref-table notation"><tbody>' +
      nrow("\\(\\Sigma,\\ \\Sigma^*\\)", "an alphabet; all finite strings over it") +
      nrow("\\(\\varepsilon\\)", "the empty string") +
      nrow("\\(\\emptyset\\)", "the empty set / empty language") +
      nrow("\\(\\delta\\)", "a machine's transition function") +
      nrow("\\(L(M)\\)", "the language a machine \\(M\\) recognizes") +
      nrow("\\(\\langle M, w\\rangle\\)", "a string encoding the objects \\(M, w\\)") +
      nrow("\\(\\overline{A}\\)", "the complement of language \\(A\\)") +
      nrow("\\(A\\le_m B\\)", "\\(A\\) mapping-reduces to \\(B\\) (computable \\(f\\))") +
      nrow("\\(A\\le_p B\\)", "\\(A\\) polynomial-time reduces to \\(B\\)") +
      nrow("\\(A\\le_L B\\)", "\\(A\\) log-space reduces to \\(B\\)") +
      "</tbody></table></div>");

    var body = $("reference-body");
    body.innerHTML = closure + decid + maps + complete + pump + thms + notation;
    TOC.ui.renderMath(body);
    var pb = $("ref-print"); if (pb) pb.onclick = function () { window.print(); };
  }

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
