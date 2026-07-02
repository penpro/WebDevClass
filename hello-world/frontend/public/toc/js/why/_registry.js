/* "Why this matters" registry, keyed "<chapter>::<topic>" -> { why, real }.
   Supplies a topic-level "why this matters" + real-world example shown in the
   feedback panel for any question that doesn't define its own whyMatters /
   realWorld. Loaded after the question bank (needs TOC). */
(function (root) {
  var TOC = (root.TOC = root.TOC || {});
  TOC.WHY = TOC.WHY || {};
  TOC.addWhy = function (obj) {
    if (!obj) return;
    Object.keys(obj).forEach(function (k) { TOC.WHY[k] = obj[k]; });
  };
})(typeof window !== "undefined" ? window : globalThis);
