// One hexagonal cell of 24 triangles. Used by CommitGrid as the per-repo
// visualization. Layout: a pointy-top hexagon split into 6 large triangles
// from the center, each subdivided into 4 sub-triangles (corner + middle +
// corner + inner-center), giving 24 cells total. The inner 6 form a small
// hexagon at the core; the outer 18 form the ring around it.
//
// Triangle ordering used by the parent:
//   indices 0..17 = outer ring, clockwise from top, three cells per wedge
//                   (left corner → middle → right corner)
//   indices 18..23 = inner hex, clockwise from top
//
// So if you map days[0..23] (oldest → newest) onto cells[0..23] in order,
// the most recent six days light up the inner core and older days populate
// the outer ring. Active repos visually "glow from the center."

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

function computePaths(size) {
  const R = size / 2;
  const cx = R;
  const cy = R;

  // Pointy-top hexagon. V_0 at 12 o'clock, going clockwise.
  const verts = [];
  for (let i = 0; i < 6; i++) {
    const angle = -Math.PI / 2 + (i * Math.PI) / 3;
    verts.push({
      x: cx + R * Math.cos(angle),
      y: cy + R * Math.sin(angle)
    });
  }

  const C = { x: cx, y: cy };
  const mid = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
  const fmt = (n) => n.toFixed(2);
  const tri = (a, b, c) =>
    `M ${fmt(a.x)} ${fmt(a.y)} L ${fmt(b.x)} ${fmt(b.y)} L ${fmt(c.x)} ${fmt(c.y)} Z`;

  const outer = [];
  const inner = [];

  for (let k = 0; k < 6; k++) {
    const Vk = verts[k];
    const Vk1 = verts[(k + 1) % 6];
    const ML = mid(C, Vk);
    const MR = mid(C, Vk1);
    const MO = mid(Vk, Vk1);

    // Wedge k contributes 3 outer sub-triangles (clockwise) + 1 inner.
    outer.push(tri(ML, Vk, MO)); // outer corner near V_k
    outer.push(tri(ML, MO, MR)); // middle of outer edge
    outer.push(tri(MO, Vk1, MR)); // outer corner near V_{k+1}
    inner.push(tri(C, ML, MR)); // inner sub-triangle (one of 6 forming inner hex)
  }

  return [...outer, ...inner];
}

export default function HexCell({ size = 78, fills, ariaLabel }) {
  const paths = computePaths(size);
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={ariaLabel}
      style={{ display: 'block' }}
    >
      {paths.map((d, i) => {
        const fill = fills[i] || FILL[0];
        return (
          <path
            key={i}
            d={d}
            fill={fill.bg}
            stroke={fill.border}
            strokeWidth={0.5}
          />
        );
      })}
    </svg>
  );
}
