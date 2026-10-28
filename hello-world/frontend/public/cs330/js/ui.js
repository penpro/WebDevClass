/* Rendering helpers: markdown (marked), highlighted code blocks, clipboard. */
(function (root) {
  var CS = (root.CS = root.CS || {});

  if (root.marked && root.marked.setOptions) root.marked.setOptions({ gfm: true, breaks: true });

  function escapeHtml(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  function copyText(text) {
    if (root.navigator && root.navigator.clipboard && root.isSecureContext) {
      return root.navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var ta = el("textarea"); ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy") ? resolve() : reject(new Error("copy failed")); }
      catch (e) { reject(e); }
      document.body.removeChild(ta);
    });
  }

  // Wrap a <pre><code> in a highlighted block with a copy button.
  function decorateCode(pre) {
    var code = pre.querySelector("code");
    var text = (code || pre).textContent.replace(/\n$/, "");
    pre.classList.add("codeblock");
    pre.innerHTML = "";
    var c = el("code");
    c.innerHTML = CS.highlight(text);
    pre.appendChild(c);
    var btn = el("button", "copy-btn", "Copy");
    btn.type = "button";
    btn.title = "Copy to clipboard (paste it into Workbench)";
    btn.addEventListener("click", function () {
      copyText(text).then(function () { btn.textContent = "Copied"; }, function () { btn.textContent = "Press Ctrl+C"; });
      setTimeout(function () { btn.textContent = "Copy"; }, 1200);
    });
    pre.appendChild(btn);
  }

  // Render markdown into an element, highlighting every fenced code block.
  function setMarkdown(node, md) {
    node.innerHTML = root.marked ? root.marked.parse(md || "") : "<pre>" + escapeHtml(md) + "</pre>";
    node.querySelectorAll("pre").forEach(decorateCode);
  }

  // The learner's own typed answer, shown as a read-only highlighted block.
  function answerBlock(text) {
    var pre = el("pre", "codeblock mine");
    var c = el("code"); c.innerHTML = CS.highlight(text);
    pre.appendChild(c);
    return pre;
  }

  function setInline(node, md) {
    node.innerHTML = root.marked && root.marked.parseInline ? root.marked.parseInline(md || "") : escapeHtml(md);
  }

  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  // Multiple-choice / select-all widget. The option ORDER is reshuffled every time, and
  // wrong options are sampled from a larger authored pool, so the option SET also varies
  // between repetitions: you have to read them, not answer by position or shape.
  function buildChoices(q) {
    var spec = CS.CHOICES[q.id], multi = spec.r.length > 1;
    var nWrong = multi ? Math.min(spec.w.length, Math.max(2, 5 - spec.r.length)) : Math.min(spec.w.length, 3);
    var items = shuffle(spec.r.map(function (t) { return { text: t, correct: true }; })
      .concat(shuffle(spec.w).slice(0, nWrong).map(function (t) { return { text: t, correct: false }; })));
    var wrap = el("div", "options"), nodes = [], selected = multi ? {} : null;
    function choose(i) {
      if (api.answered) return;
      if (multi) { selected[i] = !selected[i]; nodes[i].classList.toggle("sel", !!selected[i]); }
      else { selected = i; nodes.forEach(function (n, j) { n.classList.toggle("sel", j === i); }); }
    }
    items.forEach(function (item, i) {
      var opt = el("div", "opt");
      opt.tabIndex = 0;
      opt.appendChild(el("div", "key", String(i + 1)));
      var body = el("div", "opt-body"); setInline(body, item.text); opt.appendChild(body);
      opt.addEventListener("click", function () { choose(i); });
      opt.addEventListener("keydown", function (e) { if (e.key === " ") { e.preventDefault(); choose(i); } });
      wrap.appendChild(opt); nodes.push(opt);
    });
    var api = {
      node: wrap, multi: multi, items: items, answered: false,
      hasSelection: function () { return multi ? Object.keys(selected).some(function (k) { return selected[k]; }) : selected != null; },
      handleKey: function (k) { var n = parseInt(k, 10); if (!isNaN(n) && n >= 1 && n <= items.length) choose(n - 1); },
      isCorrect: function () {
        if (multi) return items.every(function (it, j) { return it.correct ? !!selected[j] : !selected[j]; });
        return selected != null && !!items[selected] && items[selected].correct;
      },
      reveal: function () {
        api.answered = true;
        nodes.forEach(function (n, j) {
          n.setAttribute("disabled", "");
          var picked = multi ? !!selected[j] : selected === j;
          if (items[j].correct) n.classList.add("correct");
          else if (picked) n.classList.add("wrong");
          if (items[j].correct && !picked) n.classList.add("missed");
        });
      }
    };
    return api;
  }

  CS.ui = { escapeHtml: escapeHtml, el: el, copyText: copyText, setMarkdown: setMarkdown, answerBlock: answerBlock, buildChoices: buildChoices };
})(typeof window !== "undefined" ? window : globalThis);
