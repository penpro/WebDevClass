// 24-triangle hex with per-triangle unroll animation.
//
// Renders an SVG canvas 280x78 wide. By default the 24 triangles sit in
// hex formation at the center of the canvas (the visible 78x78 area when
// the parent .hex-card is collapsed). When an ancestor with class
// .hex-card is hovered, each triangle CSS-transforms (translate + rotate
// around its source centroid) to a target position in a horizontal strip
// of 24 alternating up/down equilateral triangles. Stagger is 14ms per
// triangle, giving a sequential "unroll" feel from one end of the hex
// to the other.
//
// Geometry: flat-top hex (vertices start at 0° not -90°). This 30°
// rotation from the pointy-top orientation makes the hexes tile cleanly
// when arranged at 60° intervals around an empty center in the parent
// flower layout — each pair of adjacent hexes shares a flat edge.
//
// Subdivision: 6 wedges × 4 sub-triangles = 24 cells. Indices 0..17 are
// the outer ring (3 sub-triangles per wedge, clockwise); 18..23 are the
// inner hex (the 6 sub-triangles touching the center). Day mapping puts
// the oldest 18 days on the outer ring and the newest 6 in the inner
// core — so active repos visually "glow from the center", and when the
// hex unrolls, the older-day triangles land on the LEFT of the strip and
// newer days on the RIGHT (left-to-right chronological reading).

export const FILL = [
  { bg: 'rgba(94, 234, 212, 0.06)', border: 'rgba(94, 234, 212, 0.18)' },
  { bg: 'rgba(94, 234, 212, 0.28)', border: 'rgba(94, 234, 212, 0.45)' },
  { bg: 'rgba(94, 234, 212, 0.50)', border: 'rgba(94, 234, 212, 0.65)' },
  { bg: 'rgba(94, 234, 212, 0.75)', border: 'rgba(94, 234, 212, 0.90)' },
  { bg: 'rgba(94, 234, 212, 1.00)', border: 'rgba(94, 234, 212, 1.00)' }
];

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
  // 24 equilateral triangles of side b=19.5, alternating up/down, sharing
  // edges. Adjacent centers are b/2 apart horizontally. Strip is centered
  // in the SVG width.
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

// Pre-compute once at module load. Hex shape is identical across all
// repos (only fills differ), so we share the geometry.
const cells = computeHexCells(HEX_SIZE, SVG_WIDTH / 2, SVG_HEIGHT / 2);
const targets = computeStripTargets(SVG_WIDTH, SVG_HEIGHT);
const transforms = cells.map((cell, k) => {
  const tgt = targets[k];
  return {
    centroid: cell.centroid,
    dx: tgt.cx - cell.centroid.x,
    dy: tgt.cy - cell.centroid.y,
    rotationDeg: (normalizeAngle(tgt.angle - cell.angle) * 180) / Math.PI,
    delayMs: k * STAGGER_MS
  };
});

export default function HexCell({ fills, ariaLabel }) {
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
        const fill = fills[k] || FILL[0];
        const t = transforms[k];
        return (
          <path
            key={k}
            d={cell.path}
            fill={fill.bg}
            stroke={fill.border}
            strokeWidth={0.5}
            style={{
              transformOrigin: `${t.centroid.x.toFixed(2)}px ${t.centroid.y.toFixed(2)}px`,
              transition: `transform ${TRANSITION_MS}ms cubic-bezier(0.4, 0, 0.2, 1) ${t.delayMs}ms`,
              '--tx': `${t.dx.toFixed(2)}px`,
              '--ty': `${t.dy.toFixed(2)}px`,
              '--tr': `${t.rotationDeg.toFixed(1)}deg`
            }}
          />
        );
      })}
    </svg>
  );
}
