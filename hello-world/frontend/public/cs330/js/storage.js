/* Persistence via localStorage + JSON export/import. */
(function (root) {
  var CS = (root.CS = root.CS || {});
  var KEY = "cs330-review-v1";

  function nowMs() { return (typeof Date !== "undefined") ? Date.now() : 0; }
  function blankStats() { return { answered: 0, correct: 0, clock: 0, streak: 0, bestStreak: 0, started: nowMs() }; }

  function fresh() {
    return {
      version: 1,
      settings: Object.assign({}, CS.DEFAULTS, { unlocked: [] }),
      progress: {},          // id -> per-question state
      stats: blankStats(),
      exams: []              // mock-exam history: { when, scope, n, correct }
    };
  }

  function load() {
    try {
      var raw = root.localStorage && root.localStorage.getItem(KEY);
      if (!raw) return null;
      return normalize(JSON.parse(raw));
    } catch (e) { console.warn("load failed", e); return null; }
  }

  function normalize(s) {
    s.settings = Object.assign({}, CS.DEFAULTS, s.settings || {});
    if (!Array.isArray(s.settings.unlocked)) s.settings.unlocked = [];
    if (!s.progress) s.progress = {};
    if (!s.stats) s.stats = blankStats();
    if (typeof s.stats.streak !== "number") s.stats.streak = 0;
    if (typeof s.stats.bestStreak !== "number") s.stats.bestStreak = 0;
    if (!Array.isArray(s.exams)) s.exams = [];
    return s;
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
    a.download = "cs330-review-progress.json";
    document.body.appendChild(a); a.click();
    setTimeout(function () { document.body.removeChild(a); URL.revokeObjectURL(url); }, 0);
  }

  function importJSON(file, cb) {
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var s = JSON.parse(reader.result);
        if (!s.progress || !s.settings) throw new Error("Not a valid progress file");
        cb(null, normalize(s));
      } catch (e) { cb(e); }
    };
    reader.onerror = function () { cb(reader.error); };
    reader.readAsText(file);
  }

  // True if localStorage can actually be written and read back (some browsers
  // disable it for file:// pages, in which case progress won't persist).
  function available() {
    try {
      var k = "__cs330_probe__";
      root.localStorage.setItem(k, "1");
      var ok = root.localStorage.getItem(k) === "1";
      root.localStorage.removeItem(k);
      return ok;
    } catch (e) { return false; }
  }

  CS.storage = { KEY: KEY, fresh: fresh, load: load, save: save, exportJSON: exportJSON, importJSON: importJSON, available: available };
})(typeof window !== "undefined" ? window : globalThis);
