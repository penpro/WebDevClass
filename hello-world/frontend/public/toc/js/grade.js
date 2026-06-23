/* Auto-grading for every question type. Pure functions; Node-testable. */
(function (root) {
  var TOC = (root.TOC = root.TOC || {});

  function norm(s) {
    return String(s == null ? "" : s)
      .toLowerCase()
      .trim()
      .replace(/\s+/g, " ")
      .replace(/[‘’]/g, "'")
      .replace(/[“”]/g, '"')
      .replace(/[.,;:!?]+$/g, "");
  }
  function stripSpaces(s) { return norm(s).replace(/\s+/g, ""); }

  function gradeFIB(q, resp) {
    var r = norm(resp);
    if (r === "") return false;
    var accept = (q.accept || []).map(norm);
    if (accept.indexOf(r) !== -1) return true;
    // space-insensitive compare (helps symbolic answers like "a^n b^n")
    var rns = stripSpaces(resp);
    if (accept.some(function (a) { return stripSpaces(a) === rns; })) return true;
    if (q.acceptRegex) {
      try { if (new RegExp(q.acceptRegex, "i").test(String(resp).trim())) return true; } catch (e) {}
    }
    return false;
  }

  function sameSet(a, b) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
    var s = a.map(Number).sort(function (x, y) { return x - y; });
    var t = b.map(Number).sort(function (x, y) { return x - y; });
    return s.every(function (x, i) { return x === t[i]; });
  }

  // resp shapes by type:
  //   tf    -> boolean
  //   mc    -> chosen index (number)
  //   multi -> array of chosen indices
  //   fib   -> string
  //   order -> array of original item indices in the user's chosen order
  TOC.grade = function (q, resp) {
    switch (q.type) {
      case "tf":
        return { correct: !!resp === !!q.answer };
      case "mc":
        return { correct: Number(resp) === Number(q.answer) };
      case "multi":
        return { correct: sameSet(resp, q.answers) };
      case "fib":
        return { correct: gradeFIB(q, resp) };
      case "order":
        return {
          correct: Array.isArray(resp) && resp.length === q.items.length &&
            resp.every(function (x, i) { return Number(x) === i; })
        };
      default:
        return { correct: false };
    }
  };

  TOC._norm = norm; // exported for tests
})(typeof window !== "undefined" ? window : globalThis);
