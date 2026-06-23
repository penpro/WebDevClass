/* Rendering: text+math formatting, question widgets, feedback. */
(function (root) {
  var TOC = (root.TOC = root.TOC || {});
  var KX_OPTS = {
    delimiters: [
      { left: "\\(", right: "\\)", display: false },
      { left: "\\[", right: "\\]", display: true }
    ],
    throwOnError: false,
    errorColor: "#d23b3b"
  };

  function renderMath(el) {
    if (root.renderMathInElement) {
      try { root.renderMathInElement(el, KX_OPTS); } catch (e) { /* ignore */ }
    }
  }

  function escapeHtml(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  // Minimal markdown: **bold**, `code`, line breaks. (Single * left alone so
  // Kleene stars / Σ* survive. Math goes in \( \) / \[ \] and KaTeX handles it.)
  function fmt(s) {
    var h = escapeHtml(s);
    h = h.replace(/`([^`]+)`/g, "<code>$1</code>");
    h = h.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    h = h.replace(/\n/g, "<br>");
    return h;
  }

  function setRich(el, text) { el.innerHTML = fmt(text); renderMath(el); }

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  // ---- answer widgets ----------------------------------------------------
  // Each returns { node, getResponse(), evaluate()?, reveal(), handleKey(), answered }
  function buildInput(q) {
    switch (q.type) {
      case "tf":
      case "mc":
      case "multi": return buildChoices(q);
      case "fib": return buildFib(q);
      case "order": return buildOrder(q);
      default: return buildFib(q);
    }
  }

  function uniq(a) { var seen = {}, out = []; a.forEach(function (x) { if (!seen[x]) { seen[x] = 1; out.push(x); } }); return out; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function sample(a, n) { return shuffle(a).slice(0, Math.max(0, n)); }

  // Build the options to display. Order is ALWAYS shuffled. For mc/multi, if a
  // distractor pool (TOC.POOLS[q.id]) exists, a varying subset of wrong options
  // is sampled (the correct answer(s) always included) so the option SET — not
  // just its order — changes between repetitions. This defeats answering by
  // position or remembered shape; you must read the options each time.
  function displayItems(q) {
    if (q.type === "tf") {
      // keep True/False in conventional order (only mc/multi get shuffled)
      return [{ text: "True", correct: q.answer === true }, { text: "False", correct: q.answer === false }];
    }
    var pool = (TOC.POOLS && TOC.POOLS[q.id]) ? TOC.POOLS[q.id] : [];
    var multi = q.type === "multi";
    var correct, wrong;
    if (multi) {
      correct = q.answers.map(function (i) { return q.choices[i]; });
      wrong = q.choices.filter(function (c, i) { return q.answers.indexOf(i) === -1; }).concat(pool);
    } else {
      correct = [q.choices[q.answer]];
      wrong = q.choices.filter(function (c, i) { return i !== q.answer; }).concat(pool);
    }
    wrong = uniq(wrong).filter(function (w) { return correct.indexOf(w) === -1; });
    var total = multi
      ? Math.min(correct.length + wrong.length, q.choices.length)
      : Math.min(correct.length + wrong.length, Math.max(4, q.choices.length));
    var shownWrong = sample(wrong, Math.max(total - correct.length, 0));
    var items = correct.map(function (t) { return { text: t, correct: true }; })
      .concat(shownWrong.map(function (t) { return { text: t, correct: false }; }));
    return shuffle(items);
  }

  function buildChoices(q) {
    var isTF = q.type === "tf";
    var multi = q.type === "multi";
    var items = displayItems(q);
    var trueIdx = -1, falseIdx = -1;
    if (isTF) items.forEach(function (it, i) { if (it.text === "True") trueIdx = i; if (it.text === "False") falseIdx = i; });
    var wrap = el("div", "options");
    var selected = multi ? {} : null;
    var nodes = [];
    items.forEach(function (item, i) {
      var opt = el("div", "opt");
      opt.tabIndex = 0;
      var keyLabel = isTF ? (item.text === "True" ? "T" : "F") : String(i + 1);
      var key = el("div", "key", keyLabel);
      var body = el("div", "opt-body");
      setRich(body, item.text);
      opt.appendChild(key); opt.appendChild(body);
      opt.addEventListener("click", function () { if (api.answered) return; choose(i); });
      wrap.appendChild(opt); nodes.push(opt);
    });
    function choose(i) {
      if (multi) { selected[i] = !selected[i]; nodes[i].classList.toggle("sel", !!selected[i]); }
      else { selected = i; nodes.forEach(function (n, j) { n.classList.toggle("sel", j === i); }); }
    }
    var api = {
      node: wrap, answered: false,
      getResponse: function () {
        if (multi) return Object.keys(selected).filter(function (k) { return selected[k]; }).map(Number);
        return selected;
      },
      hasSelection: function () {
        if (multi) return Object.keys(selected).some(function (k) { return selected[k]; });
        return selected != null;
      },
      handleKey: function (k) {
        if (api.answered) return;
        if (isTF) { if (k === "t" && trueIdx >= 0) choose(trueIdx); else if (k === "f" && falseIdx >= 0) choose(falseIdx); return; }
        var n = parseInt(k, 10);
        if (!isNaN(n) && n >= 1 && n <= items.length) choose(n - 1);
      },
      // grading is based on the displayed items' correct flags (order/set vary)
      evaluate: function () {
        if (multi) return { correct: items.every(function (it, j) { return it.correct ? !!selected[j] : !selected[j]; }) };
        return { correct: selected != null && !!items[selected] && items[selected].correct };
      },
      reveal: function () {
        api.answered = true;
        nodes.forEach(function (n, j) {
          n.setAttribute("disabled", "");
          if (items[j].correct) n.classList.add("correct");
          else if (multi ? !!selected[j] : selected === j) n.classList.add("wrong");
        });
      }
    };
    return api;
  }

  function buildFib(q) {
    var wrap = el("div");
    var input = el("input", "fib-input");
    input.type = "text";
    input.setAttribute("autocomplete", "off");
    input.setAttribute("autocapitalize", "off");
    input.setAttribute("spellcheck", "false");
    input.placeholder = "Type your answer…";
    wrap.appendChild(input);
    var hint = el("p", "fib-hint", "Tip: matching is loose — you can spell symbols out as words (e.g. “sigma”, “epsilon”, “union”, “dollar”).");
    wrap.appendChild(hint);
    var api = {
      node: wrap, answered: false,
      getResponse: function () { return input.value; },
      hasSelection: function () { return input.value.trim() !== ""; },
      focus: function () { input.focus(); },
      handleKey: function () {},
      reveal: function (result) {
        api.answered = true; input.setAttribute("disabled", "");
        input.style.borderColor = result.correct ? "var(--good)" : "var(--bad)";
      }
    };
    return api;
  }

  function buildOrder(q) {
    // q.items are in CORRECT order; present a shuffled copy tagged with origin index.
    var order = q.items.map(function (_, i) { return i; });
    for (var i = order.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = order[i]; order[i] = order[j]; order[j] = t; }
    if (order.every(function (x, k) { return x === k; }) && order.length > 1) { var a = order[0]; order[0] = order[1]; order[1] = a; }
    var list = el("div", "order-list");
    var api = { node: list, answered: false };
    function render() {
      list.innerHTML = "";
      order.forEach(function (origIdx, pos) {
        var row = el("div", "order-item");
        row.appendChild(el("div", "num", String(pos + 1)));
        var body = el("div", "obody"); setRich(body, q.items[origIdx]); row.appendChild(body);
        if (!api.answered) {
          var btns = el("div", "order-btns");
          var up = el("button", null, "▲"); up.title = "Move up";
          var dn = el("button", null, "▼"); dn.title = "Move down";
          up.disabled = pos === 0; dn.disabled = pos === order.length - 1;
          up.addEventListener("click", function () { swap(pos, pos - 1); });
          dn.addEventListener("click", function () { swap(pos, pos + 1); });
          btns.appendChild(up); btns.appendChild(dn); row.appendChild(btns);
        } else {
          row.classList.add(origIdx === pos ? "correct" : "wrong");
        }
        list.appendChild(row);
      });
    }
    function swap(a, b) { var t = order[a]; order[a] = order[b]; order[b] = t; render(); }
    render();
    api.getResponse = function () { return order.slice(); };
    api.hasSelection = function () { return true; };
    api.handleKey = function () {};
    api.reveal = function () { api.answered = true; render(); };
    return api;
  }

  TOC.ui = {
    renderMath: renderMath, escapeHtml: escapeHtml, fmt: fmt, setRich: setRich, el: el,
    buildInput: buildInput
  };
})(typeof window !== "undefined" ? window : globalThis);
