/* Tiny table/grid renderer: spec -> inline SVG. Companion to automaton.js, for
   computation-history "filmstrips", CYK tables, diagonalization tables,
   Cook–Levin tableaux, and any labeled grid. Theme-aware via CSS vars.

   spec = {
     cells: [[cell, ...], ...]   // cell = null (blank) | "text" | {text, hi?, mono?, muted?}
     colHeaders?: ["h", ...]     // shown above the grid (muted)
     rowHeaders?: ["h", ...]     // shown left of each row (muted)
     cellW?=46, cellH?=34, rowHeaderW?=54,
     hi?: [[r,c], ...]           // extra highlighted cells (0-based, over the cells grid)
     title?, note?               // captions above / below
   }
   Null cells render nothing (good for triangular CYK tables). */
(function (root) {
  var TOC = (root.TOC = root.TOC || {});
  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

  TOC.grid = function (spec) {
    spec = spec || {};
    var cells = spec.cells || [];
    var rows = cells.length;
    var cols = cells.reduce(function (m, r) { return Math.max(m, (r || []).length); }, 0);
    var cw = spec.cellW || 46, ch = spec.cellH || 34;
    var pad = 8;
    var hasCol = !!spec.colHeaders, hasRow = !!spec.rowHeaders;
    var rowHW = hasRow ? (spec.rowHeaderW || 54) : 0;
    var colHH = hasCol ? ch : 0;
    var titleH = spec.title ? 22 : 0, noteH = spec.note ? 20 : 0;
    var W = pad * 2 + rowHW + cols * cw;
    var H = pad * 2 + titleH + colHH + rows * ch + noteH;
    var hiSet = {};
    (spec.hi || []).forEach(function (p) { hiSet[p[0] + "," + p[1]] = 1; });

    var out = ['<svg viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg" font-family="Georgia, \'Times New Roman\', serif">'];
    if (spec.title) out.push('<text x="' + (W / 2) + '" y="' + (pad + 14) + '" text-anchor="middle" font-size="13" font-weight="700" fill="var(--ink)">' + esc(spec.title) + '</text>');
    var y0 = pad + titleH;
    var x0 = pad + rowHW;
    if (hasCol) spec.colHeaders.forEach(function (h, c) {
      out.push('<text x="' + (x0 + c * cw + cw / 2) + '" y="' + (y0 + ch / 2) + '" text-anchor="middle" dominant-baseline="middle" font-size="12" fill="var(--muted)">' + esc(h) + '</text>');
    });
    var gy = y0 + colHH;
    for (var r = 0; r < rows; r++) {
      if (hasRow) out.push('<text x="' + (pad + rowHW - 8) + '" y="' + (gy + r * ch + ch / 2) + '" text-anchor="end" dominant-baseline="middle" font-size="12" fill="var(--muted)">' + esc((spec.rowHeaders[r] != null ? spec.rowHeaders[r] : "")) + '</text>');
      var row = cells[r] || [];
      for (var c = 0; c < cols; c++) {
        var cell = row[c];
        if (cell == null) continue;
        var isObj = typeof cell === "object";
        var text = isObj ? cell.text : cell;
        var hi = (isObj && cell.hi) || hiSet[r + "," + c];
        var mono = isObj && cell.mono;
        var muted = isObj && cell.muted;
        var x = x0 + c * cw, y = gy + r * ch;
        out.push('<rect x="' + x + '" y="' + y + '" width="' + cw + '" height="' + ch + '" rx="4" fill="' + (hi ? 'var(--brand-soft)' : 'var(--panel)') + '" stroke="' + (hi ? 'var(--brand)' : 'var(--line)') + '" stroke-width="' + (hi ? '2' : '1') + '"/>');
        out.push('<text x="' + (x + cw / 2) + '" y="' + (y + ch / 2 + 1) + '" text-anchor="middle" dominant-baseline="middle" font-size="' + (mono ? 12 : 13) + '"' + (mono ? ' font-family="ui-monospace, Menlo, Consolas, monospace"' : '') + ' fill="' + (muted ? 'var(--muted)' : (hi ? 'var(--brand)' : 'var(--ink)')) + '">' + esc(text) + '</text>');
      }
    }
    if (spec.note) out.push('<text x="' + (W / 2) + '" y="' + (H - 6) + '" text-anchor="middle" font-size="11" fill="var(--muted)">' + esc(spec.note) + '</text>');
    out.push('</svg>');
    return out.join("");
  };
})(typeof window !== "undefined" ? window : globalThis);
