/* Question bank registry. Each chapter file calls TOC.addQuestions([...]).
   Loaded BEFORE the chapter files in index.html. */
(function (root) {
  var TOC = (root.TOC = root.TOC || {});
  TOC.BANK = TOC.BANK || [];
  TOC._ids = TOC._ids || {};

  var VALID_TYPES = { tf: 1, mc: 1, multi: 1, fib: 1, order: 1 };

  TOC.addQuestions = function (arr) {
    if (!Array.isArray(arr)) { console.error("addQuestions expects an array"); return; }
    arr.forEach(function (q) {
      if (!q || !q.id) { console.error("Question missing id:", q); return; }
      if (TOC._ids[q.id]) { console.error("Duplicate question id:", q.id); return; }
      if (!VALID_TYPES[q.type]) { console.error("Bad question type for", q.id, ":", q.type); return; }
      if (typeof q.chapter !== "number") { console.error("Question missing numeric chapter:", q.id); return; }
      TOC._ids[q.id] = true;
      TOC.BANK.push(q);
    });
  };
})(typeof window !== "undefined" ? window : globalThis);
