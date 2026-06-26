// 24-triangle hex with per-triangle unroll animation + palette morph.
//
// Renders a 280×78 SVG. By default the 24 triangles sit in hex formation
// at the center of the canvas (visible 78×78 area when the parent
// .hex-card is collapsed). When an ancestor with class .hex-card is
// hovered, each triangle CSS-transforms (translate + rotate around its
// source centroid) to a target position in a horizontal strip of
// alternating up/down equilateral triangles. Stagger is 14ms per
// triangle, giving a sequential "unroll" feel.
//
// Color: paths get their fill/stroke from a palette object (PALETTES
// export). A palette is { buckets, morph } — buckets[i] = static color
// for bucket index i, morph[i] = the "other" color cells of bucket i
// pulse to (or null for no animation). The pulsing is driven by a CSS
// @keyframes rule (hex-cell-pulse) defined in CommitGrid.jsx that reads
// per-path --c-from / --c-to / --phase CSS variables set inline here.
// Each path's --phase is offset so the cells ripple through the cycle
// instead of pulsing in lockstep.
//
// Geometry: flat-top hex (rotated 30° from pointy-top) so hexes tile
// cleanly when arranged at 60° intervals around an empty center.
// 6 wedges × 4 sub-triangles = 24 cells. Indices 0..17 = outer ring
// (3 cells per wedge, clockwise); 18..23 = inner hex. Day mapping puts
// oldest 18 on outer ring, newest 6 in inner core — so when the hex
// unrolls, older days land LEFT and newer days land RIGHT.

export const PALETTES = {
  corona: {
    name: 'Corona',
    buckets: [
      { bg: 'rgba(94, 234, 212, 0.06)', border: 'rgba(94, 234, 212, 0.18)' },
      { bg: 'rgba(94, 234, 212, 0.28)', border: 'rgba(94, 234, 212, 0.45)' },
      { bg: 'rgba(94, 234, 212, 0.50)', border: 'rgba(94, 234, 212, 0.65)' },
      { bg: 'rgba(94, 234, 212, 0.75)', border: 'rgba(94, 234, 212, 0.90)' },
      { bg: 'rgba(94, 234, 212, 1.00)', border: 'rgba(94, 234, 212, 1.00)' }
    ],
    morph: null
  },
  duotone: {
    name: 'Duotone',
    buckets: [
      { bg: 'rgba(94, 234, 212, 0.06)', border: 'rgba(94, 234, 212, 0.18)' },
      { bg: 'rgba(94, 234, 212, 0.28)', border: 'rgba(94, 234, 212, 0.45)' },
      { bg: 'rgba(94, 234, 212, 0.50)', border: 'rgba(94, 234, 212, 0.65)' },
      { bg: 'rgba(94, 234, 212, 0.75)', border: 'rgba(94, 234, 212, 0.90)' },
      { bg: 'rgba(94, 234, 212, 1.00)', border: 'rgba(94, 234, 212, 1.00)' }
    ],
    // Bucket 0 (empty cells) stays static at the dim corona color above —
    // null here means "don't animate this bucket". Active cells morph to
    // the magenta side.
    morph: [
      null,
      { bg: 'rgba(192, 132, 252, 0.28)', border: 'rgba(192, 132, 252, 0.45)' },
      { bg: 'rgba(192, 132, 252, 0.50)', border: 'rgba(192, 132, 252, 0.65)' },
      { bg: 'rgba(192, 132, 252, 0.75)', border: 'rgba(192, 132, 252, 0.90)' },
      { bg: 'rgba(192, 132, 252, 1.00)', border: 'rgba(192, 132, 252, 1.00)' }
    ]
  }
};

// Backward-compat export — used by the mobile strip-row + the static
// legend in the footer. Always the corona palette regardless of the
// active selection (the legend represents the bucket scale, not the
// current palette).
export const FILL = PALETTES.corona.buckets;

export function bucketOf(count) {
  if (count === 0) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  if (count <= 7) return 3;
  return 4;
}

const HEX_SIZE = 78;
const SVG_WIDTH = 280;
const SVG_HEIGHT = HEX_SIZE;
const STAGGER_MS = 14;
const TRANSITION_MS = 540;
const PULSE_SECONDS = 8;

function computeHexCells(size, cx, cy) {
  const R = size / 2;
  const verts = [];
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3;
    verts.push({ x: cx + R * Math.cos(a), y: cy + R * Math.sin(a) });
  }
  const C = { x: cx, y: cy };
  const mid = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
  const fmt = (n) => n.toFixed(2);

  const buildCell = (a, b, c) => {
    const ccx = (a.x + b.x + c.x) / 3;
    const ccy = (a.y + b.y + c.y) / 3;
    return {
      path: `M ${fmt(a.x)} ${fmt(a.y)} L ${fmt(b.x)} ${fmt(b.y)} L ${fmt(c.x)} ${fmt(c.y)} Z`,
      centroid: { x: ccx, y: ccy },
      angle: Math.atan2(a.y - ccy, a.x - ccx)
    };
  };

  const outer = [];
  const inner = [];
  for (let k = 0; k < 6; k++) {
    const Vk = verts[k];
    const Vk1 = verts[(k + 1) % 6];
    const ML = mid(C, Vk);
    const MR = mid(C, Vk1);
    const MO = mid(Vk, Vk1);
    outer.push(buildCell(ML, Vk, MO));
    outer.push(buildCell(ML, MO, MR));
    outer.push(buildCell(MO, Vk1, MR));
    inner.push(buildCell(C, ML, MR));
  }
  return [...outer, ...inner];
}

function computeStripTargets(svgWidth, svgHeight) {
  const b = 19.5;
  const totalWidth = 23 * (b / 2) + b;
  const leftEdge = (svgWidth - totalWidth) / 2;
  const center0 = leftEdge + b / 2;
  const cy = svgHeight / 2;
  return Array.from({ length: 24 }, (_, k) => {
    const cx = center0 + k * (b / 2);
    const isUp = k % 2 === 0;
    return {
      cx,
      cy,
      angle: isUp ? -Math.PI / 2 : Math.PI / 2
    };
  });
}

function normalizeAngle(rad) {
  let a = rad;
  while (a > Math.PI) a -= 2 * Math.PI;
  while (a < -Math.PI) a += 2 * Math.PI;
  return a;
}

const cells = computeHexCells(HEX_SIZE, SVG_WIDTH / 2, SVG_HEIGHT / 2);
const targets = computeStripTargets(SVG_WIDTH, SVG_HEIGHT);
const transforms = cells.map((cell, k) => {
  const tgt = targets[k];
  return {
    centroid: cell.centroid,
    dx: tgt.cx - cell.centroid.x,
    dy: tgt.cy - cell.centroid.y,
    rotationDeg: (normalizeAngle(tgt.angle - cell.angle) * 180) / Math.PI,
    delayMs: k * STAGGER_MS,
    // Negative animation-delay shifts each cell into a different phase
    // of the pulse cycle so they ripple instead of pulsing in lockstep.
    phaseSeconds: -((k * PULSE_SECONDS) / 24)
  };
});

export default function HexCell({ buckets, palette, ariaLabel }) {
  const p = palette || PALETTES.corona;
  return (
    <svg
      width={SVG_WIDTH}
      height={SVG_HEIGHT}
      viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
      role="img"
      aria-label={ariaLabel}
      style={{ display: 'block' }}
    >
      {cells.map((cell, k) => {
        const bucket = buckets[k];
        const from = p.buckets[bucket] || p.buckets[0];
        const to = p.morph ? p.morph[bucket] : null;
        const t = transforms[k];
        return (
          <path
            key={k}
            d={cell.path}
            fill={from.bg}
            stroke={from.border}
            strokeWidth={0.5}
            data-pulse={to ? '1' : '0'}
            style={{
              transformOrigin: `${t.centroid.x.toFixed(2)}px ${t.centroid.y.toFixed(2)}px`,
              transition: `transform ${TRANSITION_MS}ms cubic-bezier(0.4, 0, 0.2, 1) ${t.delayMs}ms`,
              '--tx': `${t.dx.toFixed(2)}px`,
              '--ty': `${t.dy.toFixed(2)}px`,
              '--tr': `${t.rotationDeg.toFixed(1)}deg`,
              '--c-from': from.bg,
              '--c-to': to ? to.bg : from.bg,
              '--c-from-border': from.border,
              '--c-to-border': to ? to.border : from.border,
              '--phase': `${t.phaseSeconds.toFixed(2)}s`
            }}
          />
        );
      })}
    </svg>
  );
}
