/* Distractor-pool registry. Each pools/chN.js calls TOC.addPools({ "<qid>": ["wrong", ...] }).
   Extra WRONG options for an mc/multi question. At display time the app shows the
   correct answer(s) plus a random sample of wrong options (from the question's own
   wrong choices + this pool), shuffled — so the option set varies between reps.
   Loaded after the question files, before the app. */
(function (root) {
  var TOC = (root.TOC = root.TOC || {});
  TOC.POOLS = TOC.POOLS || {};
  TOC.addPools = function (obj) {
    if (!obj || typeof obj !== "object") return;
    Object.keys(obj).forEach(function (qid) {
      var arr = obj[qid];
      if (!Array.isArray(arr)) return;
      TOC.POOLS[qid] = (TOC.POOLS[qid] || []).concat(arr);
    });
  };
})(typeof window !== "undefined" ? window : globalThis);
