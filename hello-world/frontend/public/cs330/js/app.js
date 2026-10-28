/* Controller: bootstraps state, runs the study loop, mock exam, dashboard, settings. */
(function (root) {
  var CS = root.CS;
  var el = CS.ui.el, setMarkdown = CS.ui.setMarkdown, esc = CS.ui.escapeHtml;
  var $ = function (id) { return document.getElementById(id); };
  var state, current = null, phase = "write", attemptEl = null, widget = null, drillTopic = null, exam = null;

  // ---- boot --------------------------------------------------------------
  function boot() {
    state = CS.storage.load() || CS.storage.fresh();
    applyTheme();
    wireNav();
    wireSettings();
    buildFocusOptions();
    $("brand-sub").textContent = CS.BANK.length + " questions · 52 cards";
    $("focus-select").addEventListener("change", function () { drillTopic = null; nextQuestion(); });
    $("goto-num").addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); gotoQuestion(); } });
    $("mock-btn").addEventListener("click", startExamSetup);
    document.addEventListener("keydown", onKey);
    refreshHeader();
    maybeWarnStorage();
    showView("study");
    nextQuestion();
  }

  function maybeWarnStorage() {
    if (CS.storage.available() || $("storage-warning")) return;
    var bar = el("div", "storage-warning");
    bar.id = "storage-warning";
    bar.innerHTML = "⚠️ <strong>This browser isn't saving your progress.</strong> " +
      "(Some browsers block storage for files opened directly.) It will reset when you reload — " +
      "back it up with <strong>Export</strong> in Settings, or launch via <strong>Start Review.cmd</strong>. " +
      "<button type=\"button\" id=\"sw-dismiss\">dismiss</button>";
    document.body.insertBefore(bar, document.body.firstChild);
    $("sw-dismiss").addEventListener("click", function () { bar.remove(); });
  }

  function save() { CS.storage.save(state); }
  function clock() { return state.stats.clock; }

  // ---- numbering + flagging ----------------------------------------------
  function qNum(q) { return CS.BANK.indexOf(q) + 1; }
  function isFlagged(id) { var s = state.progress[id]; return !!(s && s.flagged); }
  function setFlag(id, val) {
    var s = state.progress[id] || (state.progress[id] = CS.engine.blankState());
    s.flagged = val; save();
  }
  function setUnlocked(n, val) {
    var u = state.settings.unlocked || (state.settings.unlocked = []);
    var i = u.indexOf(n);
    if (val && i === -1) u.push(n);
    if (!val && i !== -1) u.splice(i, 1);
    save(); buildFocusOptions(); refreshHeader();
  }

  function gotoQuestion() {
    var raw = $("goto-num").value.trim().replace(/^#/, "");
    if (!raw) return;
    var q = /^\d+$/.test(raw) ? CS.BANK[parseInt(raw, 10) - 1]
      : CS.BANK.find(function (x) { return x.id.toLowerCase() === raw.toLowerCase(); });
    if (!q) { flashEl($("goto-num")); return; }
    if (exam) endExam();
    drillTopic = null;
    showView("study");
    showSpecific(q);
  }
  function showSpecific(q) {
    current = q;
    $("study-empty").hidden = true;
    renderQuestion(q); updateChips();
    if (window.scrollTo) window.scrollTo(0, 0);
  }

  function startTopicDrill(topic) {
    drillTopic = topic;
    showView("study");
    if (window.scrollTo) window.scrollTo(0, 0);
    nextQuestion();
  }
  function clearDrill() { if (!drillTopic) return; drillTopic = null; nextQuestion(); }

  function snippet(q) {
    var s = CS.promptOf(q).replace(/```[\s\S]*?```/g, " [code] ").replace(/[*`#>|]/g, "").replace(/\s+/g, " ").trim();
    return s.length > 120 ? s.slice(0, 120).trim() + "…" : s;
  }

  // ---- header ------------------------------------------------------------
  function refreshHeader() {
    var o = CS.engine.overall(CS.BANK, state.progress);
    $("overall-pct").textContent = Math.round(o.mastery * 100) + "%";
    $("overall-mastered").textContent = o.mastered + " / " + o.total + " mastered";
    var C = 2 * Math.PI * 19;
    $("overall-ring").style.strokeDashoffset = (C * (1 - o.mastery)).toFixed(1);
  }

  // ---- views -------------------------------------------------------------
  function showView(name) {
    ["study", "dashboard", "reference", "settings"].forEach(function (v) { $("view-" + v).hidden = v !== name; });
    document.querySelectorAll(".nav-btn").forEach(function (b) { b.classList.toggle("active", b.dataset.view === name); });
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
    var ug = document.createElement("optgroup"); ug.label = "Units";
    CS.UNITS.forEach(function (u) {
      var unlocked = CS.engine.isUnlocked(CS.BANK, state.progress, u.n, state.settings);
      var opt = new Option(u.short + " — " + u.title + (unlocked ? "" : "  🔒"), "u:" + u.n);
      if (!unlocked) opt.disabled = true;
      ug.appendChild(opt);
    });
    sel.appendChild(ug);
    var cg = document.createElement("optgroup"); cg.label = "Check-in practice (everything in range)";
    CS.CHECKPOINTS.forEach(function (c) {
      cg.appendChild(new Option(c.title + " — cards " + c.cards[0] + "–" + c.cards[1], "r:" + c.id));
    });
    sel.appendChild(cg);
    if (keep) sel.value = keep;
    if (!sel.value) sel.value = "auto";
  }
  function currentFocus() {
    var v = $("focus-select").value;
    if (v.indexOf("u:") === 0) return { kind: "unit", n: Number(v.slice(2)) };
    if (v.indexOf("r:") === 0) {
      var c = CS.checkpoint(v.slice(2));
      return c ? { kind: "range", from: c.cards[0], to: c.cards[1] } : { kind: "auto" };
    }
    return { kind: "auto" };
  }

  // ---- study loop --------------------------------------------------------
  function nextQuestion() {
    var q = CS.engine.pickNext(CS.BANK, state.progress, state.settings, clock(), currentFocus(), drillTopic);
    current = q;
    var area = $("question-area"), empty = $("study-empty");
    if (!q) { area.innerHTML = ""; empty.hidden = false; updateChips(); return; }
    empty.hidden = true;
    renderQuestion(q);
    updateChips();
  }

  function updateChips() {
    $("chip-unit").textContent = current ? CS.unitMeta(current.unit).short : "—";
    var chips = $("chip-unit").parentNode, dc = $("chip-drill");
    if (drillTopic) {
      if (!dc) { dc = el("span", "chip drill"); dc.id = "chip-drill"; chips.insertBefore(dc, chips.firstChild); }
      dc.innerHTML = "🎯 " + esc(CS.topicLabel(drillTopic)) + ' <span class="chip-x" title="Stop drilling this topic">✕</span>';
      dc.querySelector(".chip-x").onclick = function (e) { e.stopPropagation(); clearDrill(); };
    } else if (dc) { dc.parentNode.removeChild(dc); }
    var sc = $("chip-streak");
    sc.textContent = "🔥 " + (state.stats.streak || 0) + " in a row";
    sc.title = "Consecutive 'got it' grades across all questions; one miss resets it. Best so far: " + (state.stats.bestStreak || 0) + ".";
    $("chip-due").textContent = CS.engine.dueCount(CS.BANK, state.progress, state.settings, clock()) + " due";
  }

  function masteryDots(q) {
    var st = state.progress[q.id], n = state.settings.masterStreak;
    var have = st ? Math.min(st.streak, n) : 0, mastered = st && st.mastered, dots = "";
    for (var i = 0; i < n; i++) dots += '<span class="dot' + (i < have || mastered ? " on" : "") + '"></span>';
    return '<span class="qmastery" title="' + (mastered ? "Mastered" : have + " of " + n + " recalled in a row") + '">' + dots + "</span>";
  }

  function metaRow(q, withTools) {
    var meta = el("div", "qmeta");
    meta.appendChild(el("span", "badge", CS.unitMeta(q.unit).short));
    var cb = CS.cardBadge(q.card);
    var cardBadge = el("span", "badge card-badge" + (cb.red ? " red" : ""), cb.text);
    cardBadge.title = "Card " + q.card + ": " + q.cardTitle;
    meta.appendChild(cardBadge);
    meta.appendChild(el("span", "badge", esc(CS.topicLabel(q.topic))));
    meta.appendChild(el("span", "badge tier tier-" + CS.tierClass(q.rank), CS.TYPE_LABEL[q.type]));
    meta.appendChild(el("span", "badge fmt fmt-" + q.fmt, CS.FMT_LABEL[q.fmt]));
    if (withTools) {
      meta.appendChild(el("span", "spacer"));
      meta.appendChild(el("span", "badge num", "#" + qNum(q)));
      var flagBtn = el("button", "flag-btn" + (isFlagged(q.id) ? " on" : ""), "🚩");
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
    }
    return meta;
  }

  // Multiple choice / select all: auto-graded the moment you check.
  function renderChoiceQuestion(q) {
    phase = "choose"; attemptEl = null;
    widget = CS.ui.buildChoices(q);
    var area = $("question-area");
    area.innerHTML = "";
    var card = el("div", "card");
    card.appendChild(metaRow(q, true));
    var prompt = el("div", "prompt md");
    setMarkdown(prompt, CS.promptOf(q));
    card.appendChild(prompt);
    card.appendChild(widget.node);
    if (widget.multi) card.appendChild(el("p", "fib-hint", "Select <strong>all</strong> that apply, then check. Keys <kbd>1</kbd>–<kbd>" + widget.items.length + "</kbd> toggle options."));
    else card.appendChild(el("p", "fib-hint", "Pick one. Keys <kbd>1</kbd>–<kbd>" + widget.items.length + "</kbd> choose, <kbd>Enter</kbd> checks."));

    var fb = el("div", "feedback"); fb.id = "feedback"; fb.hidden = true;
    card.appendChild(fb);
    var actions = el("div", "actions"); actions.id = "actions";
    var check = el("button", "btn", "Check answer");
    check.id = "check-btn";
    check.addEventListener("click", checkChoice);
    actions.appendChild(check);
    card.appendChild(actions);
    area.appendChild(card);
  }

  function checkChoice() {
    if (phase !== "choose" || !current || !widget || exam) return;
    if (!widget.hasSelection()) { flashEl($("check-btn")); return; }
    phase = "graded";
    var q = current, ok = widget.isCorrect();
    widget.reveal();
    var fb = finishQuestion(q, ok);
    var ref = el("div", "answer-md md");
    setMarkdown(ref, "**Reference answer.** " + q.answer);
    fb.appendChild(ref);
  }

  function renderQuestion(q) {
    if (q.fmt !== "typed") return renderChoiceQuestion(q);
    phase = "write"; widget = null;
    var area = $("question-area");
    area.innerHTML = "";
    var card = el("div", "card");
    card.appendChild(metaRow(q, true));

    var prompt = el("div", "prompt md");
    setMarkdown(prompt, q.prompt);
    card.appendChild(prompt);

    var ta = el("textarea", "ans-input");
    ta.rows = 6;
    ta.placeholder = "Write your answer from memory — the SQL, or the explanation in your own words…";
    ta.setAttribute("spellcheck", "false");
    ta.setAttribute("autocomplete", "off");
    attemptEl = ta;
    card.appendChild(ta);
    card.appendChild(el("p", "fib-hint", "Write it out like you would on the check-in, then reveal and grade yourself honestly. <kbd>Ctrl</kbd>+<kbd>Enter</kbd> reveals."));

    var actions = el("div", "actions");
    actions.id = "actions";
    var rb = el("button", "btn", "Show answer");
    rb.id = "reveal-btn";
    rb.addEventListener("click", revealAnswer);
    actions.appendChild(rb);
    ta.addEventListener("input", function () { rb.textContent = ta.value.trim() ? "Show answer" : "I don't know — show answer"; });
    rb.textContent = "I don't know — show answer";

    // order matters: compare -> verdict -> buttons, so grading never needs scrolling back up
    var rev = el("div", "reveal"); rev.id = "reveal"; rev.hidden = true;
    card.appendChild(rev);
    var fb = el("div", "feedback"); fb.id = "feedback"; fb.hidden = true;
    card.appendChild(fb);
    card.appendChild(actions);

    area.appendChild(card);
    ta.focus();
  }

  // Reveal the reference answer next to what was typed; the learner grades themselves.
  function revealAnswer() {
    if (phase !== "write" || !current || exam) return;
    phase = "revealed";
    var q = current, attempt = attemptEl.value;
    attemptEl.disabled = true;
    var rev = $("reveal"); rev.hidden = false; rev.innerHTML = "";
    rev.appendChild(compareBlock(q, attempt));
    rev.appendChild(el("p", "grade-q", "How did you do? <span class=\"muted\">Strict: right idea <em>and</em> right syntax, from memory, counts as a recall.</span>"));

    var actions = $("actions"); actions.innerHTML = "";
    var got = el("button", "btn good", "✓ Got it <kbd>1</kbd>");
    var miss = el("button", "btn bad", "✗ Missed it <kbd>2</kbd>");
    got.addEventListener("click", function () { gradeSelf(true); });
    miss.addEventListener("click", function () { gradeSelf(false); });
    actions.appendChild(got); actions.appendChild(miss);
    if (window.scrollTo && rev.getBoundingClientRect().top > window.innerHeight * 0.55) rev.scrollIntoView({ block: "center", behavior: "smooth" });
  }

  // "Your answer" next to the reference answer, plus the keyword hint.
  function compareBlock(q, attempt) {
    var wrap = el("div", "compare" + (attempt.trim() ? " two" : ""));
    if (attempt.trim()) {
      var mine = el("div", "pane");
      mine.appendChild(el("div", "pane-h", "Your answer"));
      mine.appendChild(CS.ui.answerBlock(attempt));
      var kc = CS.keywordCheck(q.answer, attempt);
      if (kc) {
        var line = el("div", "kw-check");
        line.innerHTML = "Keyword check: " + kc.needed.map(function (k) {
          return '<span class="kw ' + (kc.found.indexOf(k) !== -1 ? "ok" : "no") + '">' + (kc.found.indexOf(k) !== -1 ? "✓ " : "✗ ") + k + "</span>";
        }).join(" ") + ' <span class="muted">— a hint, not a grade</span>';
        mine.appendChild(line);
      }
      wrap.appendChild(mine);
    }
    var ref = el("div", "pane");
    ref.appendChild(el("div", "pane-h", "Reference answer"));
    var body = el("div", "md answer-md");
    setMarkdown(body, q.answer);
    ref.appendChild(body);
    wrap.appendChild(ref);
    return wrap;
  }

  function gradeSelf(correct) {
    if (phase !== "revealed" || !current) return;
    phase = "graded";
    finishQuestion(current, correct);
    $("reveal").querySelectorAll(".grade-q").forEach(function (n) { n.remove(); });
  }

  // Record a graded answer (auto-graded choice or self-graded typed): engine, stats,
  // streak, persistence, feedback panel, Next button. Returns the feedback element.
  function finishQuestion(q, correct) {
    var before = CS.engine.unlockedUnitNums(CS.BANK, state.progress, state.settings);
    CS.engine.onAnswer(state.progress, q.id, correct, clock(), state.settings);
    state.stats.answered++;
    if (correct) state.stats.correct++;
    state.stats.clock++;
    state.stats.streak = correct ? (state.stats.streak || 0) + 1 : 0;
    if (state.stats.streak > (state.stats.bestStreak || 0)) state.stats.bestStreak = state.stats.streak;
    var after = CS.engine.unlockedUnitNums(CS.BANK, state.progress, state.settings);
    save(); refreshHeader();

    var fb = $("feedback");
    fb.className = "feedback " + (correct ? "good" : "bad");
    fb.hidden = false;
    var st = state.progress[q.id];
    var typed = q.fmt === "typed";
    var html = '<div class="verdict">' + (correct ? (typed ? "✓ Got it" : "✓ Correct") : (typed ? "✗ Marked as a miss — it will come back soon" : "✗ Not quite — it will come back soon")) + "</div>";
    if (correct && st.mastered) html += '<div class="source" style="color:var(--good);font-weight:700">★ Mastered (' + state.settings.masterStreak + " in a row)</div>";
    html += '<div class="source">Card ' + q.card + " — " + esc(q.cardTitle) + " &middot; " + q.id + "</div>";
    if (after.length > before.length) {
      html += '<div class="source" style="color:var(--good);font-weight:700">🔓 Unlocked: ' +
        after.filter(function (n) { return before.indexOf(n) === -1; }).map(function (n) { return CS.unitMeta(n).short; }).join(", ") + "</div>";
    }
    fb.innerHTML = html;

    var actions = $("actions"); actions.innerHTML = "";
    var next = el("button", "btn", "Next →");
    next.id = "next-btn";
    next.addEventListener("click", nextQuestion);
    actions.appendChild(next);
    next.focus();
    buildFocusOptions(); updateChips();
    var qm = document.querySelector("#question-area .qmastery");
    if (qm) qm.outerHTML = masteryDots(q);
    return fb;
  }

  function flashEl(b) {
    if (!b || !b.animate) return;
    b.animate([{ transform: "translateX(0)" }, { transform: "translateX(-6px)" }, { transform: "translateX(6px)" }, { transform: "translateX(0)" }], { duration: 220 });
  }

  // ---- mock exam: a written sheet, then a self-graded report ---------------
  // Mirrors the course's exam page (answer on paper, then check the key). It does
  // NOT touch the spaced-repetition progress; scores are kept as history only.
  function examPool(scope) {
    if (scope.indexOf("u:") === 0) {
      var n = Number(scope.slice(2));
      return { label: CS.unitMeta(n).short + " — " + CS.unitMeta(n).title, qs: CS.BANK.filter(function (q) { return q.unit === n; }) };
    }
    var c = CS.checkpoint(scope) || CS.checkpoint("all");
    return { label: c.title + " (cards " + c.cards[0] + "–" + c.cards[1] + ")", qs: CS.BANK.filter(function (q) { return q.card >= c.cards[0] && q.card <= c.cards[1]; }) };
  }

  function hideControls(on) {
    var sc = document.querySelector(".study-controls"); if (sc) sc.style.display = on ? "none" : "";
  }

  function startExamSetup() {
    drillTopic = null; if (exam) endExam();
    showView("study"); hideControls(false);
    $("study-empty").hidden = true;
    var area = $("question-area"); area.innerHTML = "";
    var card = el("div", "card exam-setup");
    card.innerHTML = '<h2>🎓 Mock exam</h2><p class="muted">A whole sheet answered from memory on a timer, like the check-in. Multiple-choice and select-all questions are graded for you; written (code) answers you check against the reference and mark yourself. Your mastery progress is left untouched.</p>';
    var row = el("div", "setting-inline");
    row.innerHTML = '<label class="field"><span>Scope</span><select id="exam-scope"></select></label>';
    card.appendChild(row);
    var sel = row.querySelector("select");
    CS.CHECKPOINTS.forEach(function (c) { sel.appendChild(new Option(c.title + " — cards " + c.cards[0] + "–" + c.cards[1], c.id)); });
    var og = document.createElement("optgroup"); og.label = "A single unit";
    CS.UNITS.forEach(function (u) { og.appendChild(new Option(u.short + " — " + u.title, "u:" + u.n)); });
    sel.appendChild(og);
    var cur = $("focus-select").value;
    if (cur.indexOf("u:") === 0) sel.value = cur;
    var presets = [[5, 10, "Quiz"], [20, 40, "Exam"], [40, 80, "Long exam"]];
    var prow = el("div", "exam-presets");
    presets.forEach(function (p) {
      var b = el("button", "btn", "<strong>" + p[2] + "</strong><span>" + p[0] + " questions &middot; " + p[1] + " min</span>");
      b.addEventListener("click", function () { startExam(p[0], p[1], sel.value); });
      prow.appendChild(b);
    });
    card.appendChild(prow);
    var cancel = el("button", "btn ghost small", "Cancel");
    cancel.addEventListener("click", function () { nextQuestion(); });
    card.appendChild(cancel);
    area.appendChild(card);
    if (window.scrollTo) window.scrollTo(0, 0);
  }

  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  function startExam(n, minutes, scope) {
    var pool = examPool(scope);
    var qs = shuffle(pool.qs).slice(0, Math.min(n, pool.qs.length));
    if (!qs.length) return;
    exam = { qs: qs, label: pool.label, minutes: minutes, endAt: Date.now() + minutes * 60000, timer: null,
      phase: "write", answers: qs.map(function () { return ""; }), marks: qs.map(function () { return null; }),
      widgets: qs.map(function (q) { return q.fmt !== "typed" ? CS.ui.buildChoices(q) : null; }) };
    hideControls(true);
    exam.timer = setInterval(updateExamTimer, 500);
    renderExamSheet();
  }

  function renderExamSheet() {
    var area = $("question-area"); area.innerHTML = "";
    var card = el("div", "card exam-sheet");
    var head = el("div", "exam-head");
    head.innerHTML = '<span class="exam-prog">' + esc(exam.label) + " &middot; " + exam.qs.length + ' questions</span><span class="exam-timer" id="exam-timer">⏱</span>';
    card.appendChild(head);
    exam.qs.forEach(function (q, i) {
      var box = el("div", "exam-q");
      var top = el("div", "exam-qtop");
      top.appendChild(el("span", "exam-qn", (i + 1) + "."));
      top.appendChild(metaRow(q, false));
      box.appendChild(top);
      var p = el("div", "prompt md"); setMarkdown(p, CS.promptOf(q)); box.appendChild(p);
      if (exam.widgets[i]) {
        box.appendChild(exam.widgets[i].node);
        if (exam.widgets[i].multi) box.appendChild(el("p", "fib-hint", "Select <strong>all</strong> that apply."));
      } else {
        var ta = el("textarea", "ans-input");
        ta.rows = 5; ta.value = exam.answers[i];
        ta.placeholder = "Your answer…";
        ta.setAttribute("spellcheck", "false");
        ta.addEventListener("input", function () { exam.answers[i] = ta.value; });
        box.appendChild(ta);
      }
      card.appendChild(box);
    });
    var actions = el("div", "actions");
    var fin = el("button", "btn", "Finish — grade myself →");
    fin.addEventListener("click", function () {
      var blank = exam.qs.filter(function (q, i) { var w = exam.widgets[i]; return w ? !w.hasSelection() : !exam.answers[i].trim(); }).length;
      if (blank && !confirm(blank + " question(s) are blank — grade anyway?")) return;
      beginGrading();
    });
    var quit = el("button", "btn ghost", "Abandon exam");
    quit.addEventListener("click", function () { endExam(); nextQuestion(); });
    actions.appendChild(fin); actions.appendChild(quit);
    card.appendChild(actions);
    area.appendChild(card);
    updateExamTimer();
    if (window.scrollTo) window.scrollTo(0, 0);
  }

  function updateExamTimer() {
    if (!exam || exam.phase !== "write") return;
    var t = $("exam-timer");
    var left = Math.max(0, Math.round((exam.endAt - Date.now()) / 1000));
    if (t) {
      var m = Math.floor(left / 60), s = left % 60;
      t.textContent = "⏱ " + m + ":" + (s < 10 ? "0" : "") + s;
      t.classList.toggle("low", left <= 60);
    }
    if (left <= 0) beginGrading();
  }

  function beginGrading() {
    if (!exam || exam.phase !== "write") return;
    exam.phase = "grade";
    if (exam.timer) { clearInterval(exam.timer); exam.timer = null; }
    var area = $("question-area"); area.innerHTML = "";
    var card = el("div", "card exam-sheet");
    card.innerHTML = '<h2>Check your answers</h2><p class="muted">Multiple-choice and select-all questions are already graded. For the written ones, compare your answer to the reference and mark it. Strict is honest: right idea <em>and</em> right syntax, from memory. Anything you leave unmarked counts as missed.</p>';
    var tally = el("div", "exam-tally"); tally.id = "exam-tally";
    card.appendChild(tally);
    exam.qs.forEach(function (q, i) {
      var box = el("div", "exam-q");
      var top = el("div", "exam-qtop");
      top.appendChild(el("span", "exam-qn", (i + 1) + "."));
      top.appendChild(metaRow(q, false));
      box.appendChild(top);
      var p = el("div", "prompt md"); setMarkdown(p, CS.promptOf(q)); box.appendChild(p);
      var w = exam.widgets[i];
      if (w) {
        var ok = w.hasSelection() && w.isCorrect();
        w.reveal();
        exam.marks[i] = ok;
        box.appendChild(w.node);
        var v = el("div", "auto-verdict " + (ok ? "good" : "bad"), ok ? "✓ Correct" : (w.hasSelection() ? "✗ Not quite" : "✗ Left blank"));
        box.appendChild(v);
        var ref = el("div", "answer-md md"); setMarkdown(ref, "**Reference answer.** " + q.answer);
        box.appendChild(ref);
        card.appendChild(box);
        return;
      }
      box.appendChild(compareBlock(q, exam.answers[i]));
      var row = el("div", "mark-row");
      var got = el("button", "btn ghost mark", "✓ Got it");
      var miss = el("button", "btn ghost mark", "✗ Missed it");
      function set(v) {
        exam.marks[i] = v;
        got.classList.toggle("on-good", v === true);
        miss.classList.toggle("on-bad", v === false);
        updateTally();
      }
      got.addEventListener("click", function () { set(true); });
      miss.addEventListener("click", function () { set(false); });
      row.appendChild(got); row.appendChild(miss);
      box.appendChild(row);
      card.appendChild(box);
    });
    var actions = el("div", "actions");
    var done = el("button", "btn", "See my score →");
    done.addEventListener("click", finishExam);
    actions.appendChild(done);
    card.appendChild(actions);
    area.appendChild(card);
    updateTally();
    if (window.scrollTo) window.scrollTo(0, 0);
  }

  function updateTally() {
    var t = $("exam-tally"); if (!t || !exam) return;
    var marked = exam.marks.filter(function (m) { return m !== null; }).length;
    var good = exam.marks.filter(function (m) { return m === true; }).length;
    t.textContent = "Marked " + marked + " / " + exam.qs.length + " · " + good + " got it";
  }

  function finishExam() {
    if (!exam || exam.phase === "report") return;
    exam.phase = "report";
    var total = exam.qs.length, correct = 0, byUnit = {}, misses = [];
    exam.qs.forEach(function (q, i) {
      var ok = exam.marks[i] === true;
      byUnit[q.unit] = byUnit[q.unit] || { n: 0, ok: 0 };
      byUnit[q.unit].n++;
      if (ok) { correct++; byUnit[q.unit].ok++; } else misses.push(q);
    });
    var pct = Math.round(100 * correct / total);
    state.exams.push({ when: Date.now(), scope: exam.label, n: total, correct: correct });
    if (state.exams.length > 30) state.exams = state.exams.slice(-30);
    save();

    var area = $("question-area"); area.innerHTML = "";
    var card = el("div", "card exam-report");
    var html = "<h2>Mock exam &middot; " + pct + "%</h2>" +
      '<p class="exam-score">' + correct + " / " + total + " got it &middot; " + esc(exam.label) + "</p>" +
      '<div class="exam-breakdown">';
    Object.keys(byUnit).sort(function (a, b) { return a - b; }).forEach(function (u) {
      var b = byUnit[u];
      html += '<div class="exam-chrow"><span class="ec-name">' + CS.unitMeta(Number(u)).short + '</span><span class="wbar"><span style="width:' +
        Math.round(100 * b.ok / b.n) + '%"></span></span><span class="ec-num">' + b.ok + "/" + b.n + "</span></div>";
    });
    html += "</div>";
    if (misses.length) html += "<h3>Review your misses (" + misses.length + ')</h3><ul class="exam-misses" id="exam-misses"></ul>';
    html += '<div class="actions"><button class="btn" id="exam-again">New mock exam</button><button class="btn ghost" id="exam-done">Back to study</button></div>';
    card.innerHTML = html;
    area.appendChild(card);
    if (misses.length) {
      var ul = $("exam-misses");
      misses.forEach(function (q) {
        var li = el("li");
        li.appendChild(el("span", "miss-prompt", esc(snippet(q))));
        var go = el("button", "btn ghost small", "Review #" + qNum(q));
        go.addEventListener("click", function () { endExam(); showSpecific(q); });
        li.appendChild(go); ul.appendChild(li);
      });
    }
    $("exam-again").addEventListener("click", function () { endExam(); startExamSetup(); });
    $("exam-done").addEventListener("click", function () { endExam(); nextQuestion(); });
    if (window.scrollTo) window.scrollTo(0, 0);
  }

  function endExam() {
    if (exam && exam.timer) clearInterval(exam.timer);
    exam = null;
    hideControls(false);
  }

  // ---- keyboard ----------------------------------------------------------
  function onKey(e) {
    if ($("view-study").hidden || exam) return;
    var tag = (e.target.tagName || "").toLowerCase();
    if (e.target.id === "goto-num") return;
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      if (phase === "write") { e.preventDefault(); revealAnswer(); }
      return;
    }
    if (tag === "textarea" || tag === "input" || tag === "select") return;
    var k = e.key.toLowerCase();
    if (phase === "choose") {
      if (e.key === "Enter") { e.preventDefault(); checkChoice(); }
      else if (/^[0-9]$/.test(k) && widget) { e.preventDefault(); widget.handleKey(k); }
      return;
    }
    if (phase === "revealed") {
      if (k === "1" || k === "y") { e.preventDefault(); gradeSelf(true); }
      else if (k === "2" || k === "n") { e.preventDefault(); gradeSelf(false); }
      return;
    }
    if (phase === "graded" && e.key === "Enter") { e.preventDefault(); nextQuestion(); }
  }

  // ---- dashboard ---------------------------------------------------------
  function stat(v, l) { return '<div class="stat"><div class="v">' + v + '</div><div class="l">' + l + "</div></div>"; }

  function renderDashboard() {
    var o = CS.engine.overall(CS.BANK, state.progress);
    var acc = state.stats.answered ? Math.round(100 * state.stats.correct / state.stats.answered) : 0;
    $("dash-stats").innerHTML =
      stat(Math.round(o.mastery * 100) + "%", "overall mastery") +
      stat(o.mastered + "/" + o.total, "questions mastered") +
      stat(state.stats.answered, "answered") +
      stat(acc + "%", "recall rate") +
      stat("🔥 " + (state.stats.bestStreak || 0), "best streak");

    var grid = $("chapter-grid"); grid.innerHTML = "";
    CS.UNITS.forEach(function (u) {
      var us = CS.engine.unitStats(CS.BANK, state.progress, u.n);
      var unlocked = CS.engine.isUnlocked(CS.BANK, state.progress, u.n, state.settings);
      var card = el("div", "chcard" + (unlocked ? "" : " locked"));
      card.innerHTML =
        '<div class="chtop"><span class="chnum">' + u.short + " · cards " + u.cards[0] + "–" + u.cards[1] + "</span>" +
        '<span class="lock-pill ' + (unlocked ? "open" : "") + '">' + (unlocked ? "open" : "locked") + "</span></div>" +
        "<h4>" + esc(u.title) + "</h4>" +
        '<div class="blurb">' + esc(u.blurb) + "</div>" +
        '<div class="bar"><span style="width:' + (us.mastery * 100).toFixed(0) + '%"></span></div>' +
        '<div class="chstat"><span>' + Math.round(us.mastery * 100) + "% mastery</span>" +
        "<span>" + us.mastered + " / " + us.total + " mastered</span></div>";
      if (unlocked) {
        var btn = el("button", "btn", "Study " + u.short);
        btn.addEventListener("click", function () { $("focus-select").value = "u:" + u.n; drillTopic = null; showView("study"); nextQuestion(); });
        card.appendChild(btn);
        if ((state.settings.unlocked || []).indexOf(u.n) !== -1) {
          var lk = el("button", "btn ghost small", "🔒 re-lock");
          lk.title = "Re-lock (only affects Guided mode)";
          lk.addEventListener("click", function () { setUnlocked(u.n, false); renderDashboard(); });
          card.appendChild(lk);
        }
      } else {
        var ub = el("button", "btn", "🔓 Unlock");
        ub.title = "Open this now without finishing earlier units first";
        ub.addEventListener("click", function () { setUnlocked(u.n, true); renderDashboard(); });
        card.appendChild(ub);
      }
      grid.appendChild(card);
    });

    var flagged = CS.BANK.map(function (q, i) { return { q: q, n: i + 1 }; })
      .filter(function (o2) { var s = state.progress[o2.q.id]; return s && s.flagged; });
    $("flag-count").textContent = flagged.length ? "— " + flagged.length + " marked" : "";
    var fl = $("flag-list");
    fl.innerHTML = flagged.length ? "" : '<li class="muted">No flagged questions yet. Click the 🚩 on any question to mark it.</li>';
    flagged.forEach(function (o2) {
      var li = el("li");
      li.appendChild(el("span", "flag-num", "#" + o2.n));
      li.appendChild(el("span", "flag-ch", CS.unitMeta(o2.q.unit).short));
      li.appendChild(el("span", "flag-prompt", esc(snippet(o2.q))));
      var go = el("button", "btn ghost small", "Go to");
      go.addEventListener("click", function () { showView("study"); showSpecific(o2.q); });
      var un = el("button", "btn ghost small", "Unflag");
      un.addEventListener("click", function () { setFlag(o2.q.id, false); renderDashboard(); });
      li.appendChild(go); li.appendChild(un);
      fl.appendChild(li);
    });

    var byTopic = {};
    CS.BANK.forEach(function (q) {
      var key = q.unit + "|" + q.topic, st = state.progress[q.id];
      var t = byTopic[key] || (byTopic[key] = { sum: 0, n: 0, seen: 0, unit: q.unit, topic: q.topic });
      t.sum += CS.engine.qMastery(st); t.n++; if (st && st.seen > 0) t.seen++;
    });
    var rows = Object.keys(byTopic).map(function (k) { var t = byTopic[k]; t.m = t.sum / t.n; return t; })
      .filter(function (t) { return t.seen > 0; }).sort(function (a, b) { return a.m - b.m; }).slice(0, 8);
    var wl = $("weak-list");
    wl.innerHTML = rows.length ? "" : '<li class="muted">Answer a few questions and your weak spots will show up here.</li>';
    rows.forEach(function (r) {
      var li = el("li", "weak-row");
      li.title = "Drill this topic across all units";
      li.innerHTML = "<span>" + esc(CS.topicLabel(r.topic)) + "</span>" +
        '<span class="wbar"><span style="width:' + Math.round(r.m * 100) + '%"></span></span>' +
        '<span class="wch">' + CS.unitMeta(r.unit).short + " · " + Math.round(r.m * 100) + "%</span>" +
        '<span class="drill-go">drill →</span>';
      li.addEventListener("click", function () { startTopicDrill(r.topic); });
      wl.appendChild(li);
    });

    var eh = $("exam-history");
    eh.innerHTML = state.exams.length ? "" : '<li class="muted">No mock exams yet. Use 🎓 Mock exam on the Study tab.</li>';
    state.exams.slice(-8).reverse().forEach(function (x) {
      var li = el("li", "hist-row");
      li.innerHTML = "<span>" + new Date(x.when).toLocaleDateString() + "</span><span class=\"hist-scope\">" + esc(x.scope) +
        '</span><span class="wch">' + x.correct + " / " + x.n + " · " + Math.round(100 * x.correct / x.n) + "%</span>";
      eh.appendChild(li);
    });
  }

  // ---- reference ---------------------------------------------------------
  var REFERENCE = [
    ["Reading a query: written order vs. what runs first",
      "```sql\nSELECT deck_id, COUNT(*) AS num_cards\nFROM cards\nWHERE created_at > '2026-01-01'\nGROUP BY deck_id\nHAVING COUNT(*) > 10\nORDER BY num_cards DESC\nLIMIT 5;\n```\n" +
      "`WHERE` filters **rows** first, then `GROUP BY` forms groups, then `HAVING` filters the **groups** (it needs aggregates that only exist after grouping). `ORDER BY` then `LIMIT`. " +
      "`WHERE` can never use `COUNT(*)`."],
    ["Relationships and foreign keys",
      "```sql\nCREATE TABLE decks (\n  id INTEGER PRIMARY KEY,\n  name TEXT NOT NULL\n);\nCREATE TABLE cards (\n  id INTEGER PRIMARY KEY,\n  question TEXT NOT NULL,\n  answer TEXT NOT NULL,\n  deck_id INTEGER REFERENCES decks(id)\n);\n```\n" +
      "* **has-many**: one row (a deck) is referenced by many rows (its cards).\n* **belongs-to**: a card points at exactly one deck through its own `deck_id`.\n" +
      "* The foreign key lives on the **many** (belongs-to) side; the deck row stores no list of cards.\n* Parent first: insert the deck before the card that references it. A missing parent is rejected."],
    ["JOINs",
      "| | keeps | no match on the right |\n|---|---|---|\n| `INNER JOIN` | only rows that match in both tables | row dropped |\n| `LEFT JOIN` | every left row | right columns are `NULL` |\n\n" +
      "```sql\nSELECT decks.name\nFROM decks\nLEFT JOIN cards ON cards.deck_id = decks.id\nWHERE cards.id IS NULL;   -- decks with no cards\n```\n" +
      "Always give the `ON`. Test `IS NULL`, never `= NULL`. Through a junction table you need two joins: `a JOIN a_b ON ... JOIN b ON ...`. `COUNT(reviews.id)`, not `COUNT(*)`, after a `LEFT JOIN`."],
    ["Normalization",
      "* **Redundancy**: the same fact stored in many rows. **Update anomaly**: miss one copy and the table disagrees with itself. **Delete anomaly**: deleting the only row about something erases that fact.\n" +
      "* **1NF**: one atomic value per cell (no `'loops, syntax'` lists). **2NF**: 1NF + every non-key column depends on the *whole* key. **3NF**: 2NF + no non-key column depends on another non-key column.\n" +
      "* Many-to-many (students/classes): a **junction table** with a composite primary key `(student_id, class_id)`.\n* Cost of over-normalizing: more JOINs for simple questions."],
    ["Keys and constraints",
      "```sql\nid INTEGER PRIMARY KEY\nPRIMARY KEY (card_id, tag_id)          -- composite\nemail TEXT NOT NULL UNIQUE\njoined_on TEXT DEFAULT '2026-01-01'\nrating INTEGER CHECK (rating BETWEEN 1 AND 5)\n```\n" +
      "A violating `INSERT` / `UPDATE` is rejected with an error and **nothing** is saved. A table has exactly one primary key (it may span columns)."],
    ["Changing data",
      "```sql\nINSERT INTO reviews (card_id, rating) VALUES (1, 4);\nUPDATE reviews SET rating = 5 WHERE id = 1;\nDELETE FROM reviews WHERE reviewed_at < '2025-01-01';\n```\n" +
      "No `WHERE` = **every row**. Habit: run the matching `SELECT ... WHERE ...` first. Comparisons like `< '2025-01-01'` are strict: a row dated exactly 2025-01-01 is kept."],
    ["Subqueries and set operations",
      "```sql\nSELECT question FROM cards\nWHERE id NOT IN (SELECT card_id FROM reviews);   -- never reviewed\n```\n" +
      "* Same answer as `LEFT JOIN ... WHERE reviews.id IS NULL`.\n* **Correlated** subquery references the outer row and re-runs per row; a regular one runs once.\n" +
      "* `UNION` combines and removes duplicates; `UNION ALL` keeps them; `INTERSECT` = in both; `EXCEPT` = in the first, not the second."],
    ["Document, key-value, and graph syntax",
      "```\ndb.cards.find({ \"tags\": \"joins\" })\ndb.cards.insertOne({ \"_id\": 1, \"question\": \"What is a JOIN?\", \"tags\": [\"syntax\", \"joins\"] })\n\nSET card:1:due_today true\nGET card:1:due_today\nDEL card:1:due_today\n\nCREATE (a:Card {question: 'What is a loop?'})\nCREATE (a)-[:PREREQUISITE_OF]->(b)\nMATCH (p:Card)-[:PREREQUISITE_OF*]->(:Card {question: 'What is a nested loop?'})\nRETURN DISTINCT p.question;\n```\n" +
      "Embedding avoids JOINs and reads as one unit, but duplicates facts across documents (redundancy again). `*` after the edge type = follow it any number of hops; `DISTINCT` because a node can be reached by several paths."],
    ["Apps and choosing a database",
      "```\nrows = connection.query(\n  \"SELECT question, answer FROM cards WHERE deck_id = ?\",\n  [params.id]\n)\n```\n" +
      "Browser → web server → database. Only the server talks to the database; it holds a **pool** of open connections. Never glue user input into SQL (`\"... WHERE deck_id = \" + params.id` is **SQL injection**); pass it as a parameter.\n\n" +
      "| Pick | when |\n|---|---|\n| Relational | structured data needing integrity (keys, constraints) and complex queries |\n| Document | self-contained items with a flexible shape, read as one unit |\n| Key-value | one-key lookups that must be fast (cache, session, cart) |\n| Graph | the relationships *are* the data; deep or variable-length traversal |"],
    ["Running these answers in MySQL (where it differs from the course)",
      "Checked against MySQL 8.4:\n\n" +
      "* An inline `deck_id INTEGER REFERENCES decks(id)` is **parsed and silently ignored**: no key is created, and a card with a nonexistent `deck_id` inserts fine. Use a separate clause so it is enforced: `FOREIGN KEY (deck_id) REFERENCES decks(id)` (a bad insert then fails with error 1452). Check with `SHOW CREATE TABLE cards;`.\n" +
      "* `TEXT` columns can't be `UNIQUE` or a key without a length (error 1170): use `VARCHAR(255)`, e.g. `email VARCHAR(255) NOT NULL UNIQUE`.\n" +
      "* `ALTER COLUMN ... SET NOT NULL` is a syntax error in MySQL: use `ALTER TABLE cards MODIFY question TEXT NOT NULL;`.\n" +
      "* `id INTEGER PRIMARY KEY AUTO_INCREMENT` picks the next id for you; `DEFAULT CURRENT_TIMESTAMP` needs a `DATETIME` / `TIMESTAMP` column.\n" +
      "* `INNER JOIN` with no `ON` is **not** an error in MySQL: it silently returns every pairing (a cross join, 3 × 4 = 12 rows). The course calls a missing `ON` a mistake, so always write it.\n" +
      "* `INTERSECT` and `EXCEPT` need MySQL 8.0.31+. Escape a quote inside a string by doubling it: `'I don''t know'`.\n" +
      "* Write the course's own syntax on the exam; use this list only when running things in Workbench."]
  ];

  function renderReference() {
    var body = $("reference-body");
    body.innerHTML = "";
    REFERENCE.forEach(function (b) {
      var sec = el("section", "ref-block");
      sec.appendChild(el("h3", null, esc(b[0])));
      var md = el("div", "md"); setMarkdown(md, b[1]); sec.appendChild(md);
      body.appendChild(sec);
    });
    var pb = $("ref-print"); if (pb) pb.onclick = function () { window.print(); };
  }

  // ---- settings ----------------------------------------------------------
  function renderSettings() {
    document.querySelectorAll("#mode-seg button").forEach(function (b) { b.classList.toggle("active", b.dataset.mode === state.settings.mode); });
    document.querySelectorAll("#ramp-seg button").forEach(function (b) { b.classList.toggle("active", (b.dataset.ramp === "on") === (state.settings.ramp !== false)); });
    var ms = $("master-streak"); ms.value = state.settings.masterStreak; $("ms-val").textContent = state.settings.masterStreak + "×";
    var ut = $("unlock-threshold"); ut.value = state.settings.unlockThreshold; $("ut-val").textContent = Math.round(state.settings.unlockThreshold * 100) + "%";
    var stat2 = $("storage-status");
    if (!stat2) {
      stat2 = el("p", "muted small"); stat2.id = "storage-status";
      var row = document.querySelector("#view-settings .btn-row");
      if (row) row.parentNode.appendChild(stat2);
    }
    stat2.innerHTML = CS.storage.available()
      ? 'Progress saving: <strong style="color:var(--good)">on</strong> — your progress is being saved in this browser.'
      : 'Progress saving: <strong style="color:var(--bad)">off</strong> — this browser isn\'t persisting data (common with file://). Use Export/Import, or run via Start Review.cmd.';
  }

  function wireSettings() {
    document.querySelectorAll("#mode-seg button").forEach(function (b) {
      b.addEventListener("click", function () { state.settings.mode = b.dataset.mode; save(); renderSettings(); buildFocusOptions(); refreshHeader(); });
    });
    document.querySelectorAll("#ramp-seg button").forEach(function (b) {
      b.addEventListener("click", function () { state.settings.ramp = (b.dataset.ramp === "on"); save(); renderSettings(); });
    });
    $("master-streak").addEventListener("input", function () {
      state.settings.masterStreak = Number(this.value); $("ms-val").textContent = this.value + "×"; save(); refreshHeader();
    });
    $("unlock-threshold").addEventListener("input", function () {
      state.settings.unlockThreshold = Number(this.value); $("ut-val").textContent = Math.round(this.value * 100) + "%"; save(); buildFocusOptions();
    });
    $("export-btn").addEventListener("click", function () { CS.storage.exportJSON(state); });
    $("import-btn").addEventListener("click", function () { $("import-file").click(); });
    $("import-file").addEventListener("change", function () {
      if (!this.files[0]) return;
      CS.storage.importJSON(this.files[0], function (err, s) {
        if (err) { alert("Import failed: " + err.message); return; }
        state = s; save(); applyTheme(); buildFocusOptions(); refreshHeader(); renderSettings();
        alert("Progress imported."); showView("study"); nextQuestion();
      });
      this.value = "";
    });
    $("reset-btn").addEventListener("click", function () {
      if (!confirm("Erase all progress and start over? This cannot be undone (export a backup first if unsure).")) return;
      state = CS.storage.fresh(); save(); applyTheme(); buildFocusOptions(); refreshHeader(); renderSettings(); showView("study"); nextQuestion();
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})(typeof window !== "undefined" ? window : globalThis);
