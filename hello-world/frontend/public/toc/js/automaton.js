/* Tiny automaton-diagram renderer: spec -> inline SVG state diagram.
   Used for "what does this NFA/DFA do?" and conversion questions.
   Spec:
     { width, height,
       states: [{id, x, y, start?, accept?, label?}, ...],
       edges:  [{from, to, label, bend?, loop?:'up'|'down', labelOff?}, ...] }
   Colors come from CSS variables so it adapts to light/dark. Edge labels are
   plain text (use Unicode like ε, not LaTeX). */
(function (root) {
  var TOC = (root.TOC = root.TOC || {});
  var R = 22; // state radius

  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

  function stateInner(s) {
    var t = s.label != null ? s.label : s.id;
    var m = /^([A-Za-z]+)(\d+)$/.exec(t);
    if (m) return '<tspan font-style="italic">' + esc(m[1]) + '</tspan><tspan font-size="0.7em" dy="0.3em">' + esc(m[2]) + "</tspan>";
    return '<tspan font-style="italic">' + esc(t) + "</tspan>";
  }

  function lbl(x, y, text) {
    if (text == null || text === "") return "";
    return '<text x="' + r2(x) + '" y="' + r2(y) + '" text-anchor="middle" dominant-baseline="middle" ' +
      'font-size="14" font-family="Georgia, \'Times New Roman\', serif" fill="var(--ink)" ' +
      'style="paint-order:stroke;stroke:var(--panel-2);stroke-width:4px;stroke-linejoin:round">' + esc(text) + "</text>";
  }
  function r2(n) { return Math.round(n * 10) / 10; }

  function aim(fx, fy, tx, ty, r) {
    var dx = tx - fx, dy = ty - fy, len = Math.sqrt(dx * dx + dy * dy) || 1;
    return { x: fx + dx / len * r, y: fy + dy / len * r };
  }

  function edge(A, B, e) {
    var ax = A.x, ay = A.y, bx = B.x, by = B.y;
    var dx = bx - ax, dy = by - ay, len = Math.sqrt(dx * dx + dy * dy) || 1;
    var ux = dx / len, uy = dy / len, px = -uy, py = ux;
    var bend = e.bend || 0;
    if (!bend) {
      var sx = ax + ux * R, sy = ay + uy * R, ex = bx - ux * R, ey = by - uy * R;
      var off = e.labelOff != null ? e.labelOff : -13;
      return '<line x1="' + r2(sx) + '" y1="' + r2(sy) + '" x2="' + r2(ex) + '" y2="' + r2(ey) +
        '" stroke="var(--ink-soft)" stroke-width="2" marker-end="url(#ah)"/>' +
        lbl((sx + ex) / 2 + px * off, (sy + ey) / 2 + py * off, e.label);
    }
    var mx = (ax + bx) / 2, my = (ay + by) / 2, cx = mx + px * bend, cy = my + py * bend;
    var s = aim(ax, ay, cx, cy, R), en = aim(bx, by, cx, cy, R);
    return '<path d="M ' + r2(s.x) + " " + r2(s.y) + " Q " + r2(cx) + " " + r2(cy) + " " + r2(en.x) + " " + r2(en.y) +
      '" fill="none" stroke="var(--ink-soft)" stroke-width="2" marker-end="url(#ah)"/>' +
      lbl(mx + px * bend * 0.62, my + py * bend * 0.62, e.label);
  }

  function selfLoop(A, e) {
    var dir = e.loop === "down" ? 1 : -1;
    var x = A.x, topy = A.y + dir * R;
    var sx = x - 9, sy = A.y + dir * (R - 3), ex = x + 9, ey = A.y + dir * (R - 3);
    var c1x = x - 27, c1y = topy + dir * 30, c2x = x + 27, c2y = topy + dir * 30;
    return '<path d="M ' + r2(sx) + " " + r2(sy) + " C " + r2(c1x) + " " + r2(c1y) + " " + r2(c2x) + " " + r2(c2y) +
      " " + r2(ex) + " " + r2(ey) + '" fill="none" stroke="var(--ink-soft)" stroke-width="2" marker-end="url(#ah)"/>' +
      lbl(x, topy + dir * 34, e.label);
  }

  TOC.automaton = function (spec) {
    if (!spec || !spec.states) return "";
    var W = spec.width || 480, H = spec.height || 170;
    var byId = {};
    spec.states.forEach(function (s) { byId[s.id] = s; });
    var out = ['<svg viewBox="0 0 ' + W + " " + H + '" xmlns="http://www.w3.org/2000/svg" class="automaton" role="img">'];
    out.push('<defs><marker id="ah" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--ink-soft)"/></marker></defs>');

    (spec.edges || []).forEach(function (e) {
      var A = byId[e.from], B = byId[e.to];
      if (!A || !B) return;
      out.push(e.from === e.to ? selfLoop(A, e) : edge(A, B, e));
    });

    spec.states.forEach(function (s) {
      if (s.start) out.push('<line x1="' + r2(s.x - R - 20) + '" y1="' + s.y + '" x2="' + r2(s.x - R - 2) + '" y2="' + s.y +
        '" stroke="var(--ink-soft)" stroke-width="2" marker-end="url(#ah)"/>');
      out.push('<circle cx="' + s.x + '" cy="' + s.y + '" r="' + R + '" fill="var(--panel)" stroke="var(--ink)" stroke-width="2"/>');
      if (s.accept) out.push('<circle cx="' + s.x + '" cy="' + s.y + '" r="' + (R - 4) + '" fill="none" stroke="var(--ink)" stroke-width="1.5"/>');
      out.push('<text x="' + s.x + '" y="' + (s.y + 1) + '" text-anchor="middle" dominant-baseline="middle" font-size="16" font-family="Georgia, \'Times New Roman\', serif" fill="var(--ink)">' + stateInner(s) + "</text>");
    });

    out.push("</svg>");
    return out.join("");
  };
})(typeof window !== "undefined" ? window : globalThis);
