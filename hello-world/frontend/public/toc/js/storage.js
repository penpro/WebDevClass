/* Persistence via localStorage + JSON export/import. */
(function (root) {
  var TOC = (root.TOC = root.TOC || {});
  var KEY = "toc-review-v1";

  function nowMs() { return (typeof Date !== "undefined") ? Date.now() : 0; }

  function fresh() {
    return {
      version: 1,
      settings: Object.assign({}, TOC.DEFAULTS, { unlocked: [] }),
      progress: {},                     // id -> per-question state
      stats: { answered: 0, correct: 0, clock: 0, streak: 0, bestStreak: 0, started: nowMs() }
    };
  }

  function load() {
    try {
      var raw = root.localStorage && root.localStorage.getItem(KEY);
      if (!raw) return null;
      var s = JSON.parse(raw);
      if (!s.settings) s.settings = Object.assign({}, TOC.DEFAULTS);
      else s.settings = Object.assign({}, TOC.DEFAULTS, s.settings);
      if (!Array.isArray(s.settings.unlocked)) s.settings.unlocked = [];
      if (!s.progress) s.progress = {};
      if (!s.stats) s.stats = { answered: 0, correct: 0, clock: 0, streak: 0, bestStreak: 0, started: nowMs() };
      if (typeof s.stats.streak !== "number") s.stats.streak = 0;
      if (typeof s.stats.bestStreak !== "number") s.stats.bestStreak = 0;
      return s;
    } catch (e) { console.warn("load failed", e); return null; }
  }

  function save(state) {
    try { root.localStorage.setItem(KEY, JSON.stringify(state)); }
    catch (e) { console.warn("save failed", e); }
  }

  function exportJSON(state) {
    var blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "toc-review-progress.json";
    document.body.appendChild(a); a.click();
    setTimeout(function () { document.body.removeChild(a); URL.revokeObjectURL(url); }, 0);
  }

  function importJSON(file, cb) {
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var s = JSON.parse(reader.result);
        if (!s.progress || !s.settings) throw new Error("Not a valid progress file");
        cb(null, s);
      } catch (e) { cb(e); }
    };
    reader.onerror = function () { cb(reader.error); };
    reader.readAsText(file);
  }

  // True if localStorage can actually be written and read back (some browsers
  // disable it for file:// pages, in which case progress won't persist).
  function available() {
    try {
      var k = "__toc_probe__";
      root.localStorage.setItem(k, "1");
      var ok = root.localStorage.getItem(k) === "1";
      root.localStorage.removeItem(k);
      return ok;
    } catch (e) { return false; }
  }

  TOC.storage = { KEY: KEY, fresh: fresh, load: load, save: save, exportJSON: exportJSON, importJSON: importJSON, available: available };
})(typeof window !== "undefined" ? window : globalThis);
