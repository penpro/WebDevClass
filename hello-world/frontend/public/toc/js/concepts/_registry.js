/* Concept-explainer registry. Each concepts/chN.js calls TOC.addConcepts({...}).
   Keys are "<chapter>::<exact topic string>" matching a question's `topic`.
   Used by the "Explain this in more depth" button. Loaded before the chapter
   concept files in index.html. */
(function (root) {
  var TOC = (root.TOC = root.TOC || {});
  TOC.CONCEPTS = TOC.CONCEPTS || {};
  TOC.addConcepts = function (obj) {
    if (!obj || typeof obj !== "object") return;
    Object.keys(obj).forEach(function (k) {
      if (TOC.CONCEPTS[k]) { console.warn("Duplicate concept key:", k); }
      TOC.CONCEPTS[k] = obj[k];
    });
  };
})(typeof window !== "undefined" ? window : globalThis);
