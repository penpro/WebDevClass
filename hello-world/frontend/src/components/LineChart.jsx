// Lightweight SVG line chart. Originally lived inline inside the
// Diagnostics admin page; extracted so the public case-study page
// (/projects/diagnostics) can reuse the same look without having to
// import the admin component (which is auth-gated, super-admin-only).
//
// No deps. ResizeObserver tracks the container width so the chart
// fills whatever column you drop it in. Theme tokens are pulled from
// theme.js so the colors match the rest of the Penumbra Tech site.
//
// Props:
//   data    - Array of { tLabel, ...numericSeries }
//             tLabel is the X-axis label ("MM:SS" by convention).
//             Y values are read by key name from `series`.
//   series  - Array of { key, label, color }. One <path> per entry.
//   height  - SVG height in px. Width auto-fills the container.
//   yMax    - Optional fixed Y ceiling. If null, computed from data
//             with 10% headroom.
//   formatY - (number) => string for Y-axis tick labels.

import { useEffect, useRef, useState } from 'react';
import { colors, fonts } from '../theme.js';

export default function LineChart({
  data,
  series,
  height = 220,
  yMax = null,
  formatY = defaultFormatY
}) {
  const containerRef = useRef(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => setWidth(el.getBoundingClientRect().width);
    measure();
    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(measure);
      ro.observe(el);
      return () => ro.disconnect();
    }
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const padding = { top: 8, right: 8, bottom: 24, left: 44 };
  const innerW = Math.max(60, width - padding.left - padding.right);
  const innerH = height - padding.top - padding.bottom;

  // Resolve Y ceiling.
  let computedMax = yMax;
  if (computedMax == null) {
    let m = 0;
    for (const d of data) {
      for (const s of series) {
        const v = d[s.key];
        if (typeof v === 'number' && v > m) m = v;
      }
    }
    computedMax = Math.max(1, m * 1.1);
  }

  const xFor = (i) =>
    padding.left +
    (data.length > 1 ? (i / (data.length - 1)) * innerW : innerW / 2);
  const yFor = (v) => {
    const clipped = Math.max(0, Math.min(computedMax, v || 0));
    return padding.top + innerH - (clipped / computedMax) * innerH;
  };

  const yTickFractions = [0, 0.25, 0.5, 0.75, 1];
  const yTicks = yTickFractions.map((t) => t * computedMax);

  const paths = series.map((s) => {
    if (data.length === 0) return { ...s, d: '' };
    const cmds = data.map((d, i) => {
      const v = typeof d[s.key] === 'number' ? d[s.key] : 0;
      return `${i === 0 ? 'M' : 'L'}${xFor(i).toFixed(1)},${yFor(v).toFixed(1)}`;
    });
    return { ...s, d: cmds.join(' ') };
  });

  let xTickIdx = [];
  if (data.length === 1) {
    xTickIdx = [0];
  } else if (data.length >= 2) {
    xTickIdx = [0, Math.floor((data.length - 1) / 2), data.length - 1].filter(
      (v, i, arr) => arr.indexOf(v) === i
    );
  }

  return (
    <div ref={containerRef} style={{ width: '100%' }}>
      {width > 0 ? (
        <svg
          width={width}
          height={height}
          style={{ display: 'block', fontFamily: fonts.mono }}
        >
          {/* Horizontal grid lines + Y labels */}
          {yTicks.map((v, i) => (
            <g key={i}>
              <line
                x1={padding.left}
                y1={yFor(v)}
                x2={padding.left + innerW}
                y2={yFor(v)}
                stroke={colors.borderSubtle}
                strokeWidth="1"
              />
              <text
                x={padding.left - 6}
                y={yFor(v)}
                textAnchor="end"
                dominantBaseline="middle"
                fontSize="10"
                fill={colors.textMuted}
              >
                {formatY(v)}
              </text>
            </g>
          ))}
          {/* X axis labels */}
          {xTickIdx.map((i) => (
            <text
              key={i}
              x={xFor(i)}
              y={height - padding.bottom + 14}
              textAnchor="middle"
              fontSize="10"
              fill={colors.textMuted}
            >
              {data[i].tLabel}
            </text>
          ))}
          {/* Series lines */}
          {paths.map((p, idx) => (
            <path
              key={idx}
              d={p.d}
              stroke={p.color}
              fill="none"
              strokeWidth={1.8}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ))}
        </svg>
      ) : (
        <div style={{ height }} />
      )}
      {/* Legend */}
      <div
        style={{
          display: 'flex',
          gap: '0.75rem',
          flexWrap: 'wrap',
          fontSize: '0.7rem',
          marginTop: '0.25rem',
          justifyContent: 'center',
          color: colors.textSecondary,
          fontFamily: fonts.mono
        }}
      >
        {series.map((s) => (
          <div
            key={s.key}
            style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}
          >
            <span
              style={{
                display: 'inline-block',
                width: 12,
                height: 2,
                background: s.color
              }}
            />
            {s.label}
          </div>
        ))}
      </div>
    </div>
  );
}

function defaultFormatY(v) {
  if (Math.abs(v) >= 1000) return v.toFixed(0);
  if (Math.abs(v) >= 10) return v.toFixed(0);
  if (Math.abs(v) >= 1) return v.toFixed(1);
  return v.toFixed(2);
}
