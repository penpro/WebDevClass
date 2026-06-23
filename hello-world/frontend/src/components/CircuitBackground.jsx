// Decorative circuit-trace SVG used as a faint background behind hero
// sections and large empty surfaces. Inspired by the brand's circuit
// pattern; rendered at low opacity so it adds texture without competing
// with content.
//
// Designed to absolute-position behind its parent (which should be
// `position: relative; overflow: hidden`). Pass `style` to override the
// positioning if you need something different.

import { colors } from '../theme.js';

export default function CircuitBackground({
  opacity = 0.08,
  color = colors.accent,
  style
}) {
  return (
    <svg
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        opacity,
        ...style
      }}
      viewBox="0 0 1200 600"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g stroke={color} strokeWidth="1.5" fill="none">
        {/* Horizontal trace runs with circuit-board-like step turns. */}
        <path d="M0 80 L260 80 L290 110 L420 110 L450 80 L1200 80" />
        <path d="M0 160 L120 160 L150 130 L520 130 L560 170 L1200 170" />
        <path d="M0 240 L80 240 L110 270 L380 270 L410 240 L900 240 L930 270 L1200 270" />
        <path d="M0 320 L180 320 L210 290 L640 290 L670 320 L1200 320" />
        <path d="M0 400 L240 400 L270 430 L700 430 L730 400 L1200 400" />
        <path d="M0 480 L120 480 L150 450 L320 450 L350 480 L1200 480" />

        {/* Vertical drops linking horizontal runs at a few junction points. */}
        <path d="M260 80 L260 160" />
        <path d="M520 130 L520 240" />
        <path d="M380 270 L380 320" />
        <path d="M700 430 L700 480" />
        <path d="M900 240 L900 400" />
      </g>

      {/* Solder dots at trace endpoints. */}
      <g fill={color}>
        <circle cx="260" cy="80" r="3" />
        <circle cx="520" cy="130" r="3" />
        <circle cx="380" cy="270" r="3" />
        <circle cx="640" cy="290" r="3" />
        <circle cx="700" cy="430" r="3" />
        <circle cx="900" cy="240" r="3" />
        <circle cx="900" cy="400" r="3" />
      </g>
    </svg>
  );
}
