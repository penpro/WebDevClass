// Penumbra Tech logomark — a circled P with a small circuit-trace
// notch nodding to the brand pattern. Pure inline SVG so it inherits
// currentColor and scales without any asset pipeline.
//
// Two visual elements:
//   1. An outer circle (the "penumbra" — the partial shadow ring)
//   2. A serif-ish "P" letterform inside, with a small dot at the
//      circle's edge to suggest a circuit termination point.
//
// Props:
//   size      — width/height in px (default 32)
//   color     — stroke / fill color (defaults to currentColor so it
//               follows whatever text color it's nested in)
//   showText  — render the "PENUMBRA TECH" wordmark next to the icon
//   wordmarkColor — independent color for the wordmark text

import { colors, fonts, fontWeights } from '../theme.js';

export default function LogoMark({
  size = 32,
  color = 'currentColor',
  showText = false,
  wordmarkColor = colors.text
}) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.6rem',
        lineHeight: 1
      }}
      aria-label="Penumbra Tech"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Outer ring with a small gap at the upper-right for the
            circuit accent. */}
        <path
          d="M32 4
             a28 28 0 1 1 -0.001 0
             M 56 14 L 60 14"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        {/* Circuit termination dot just outside the ring's upper-right. */}
        <circle cx="60" cy="14" r="2.4" fill={color} />

        {/* The P letterform: stem + bowl. Drawn rather than typeset so
            it stays crisp regardless of available fonts. */}
        <path
          d="M22 18
             L22 48
             M22 18
             L36 18
             a8 8 0 0 1 0 16
             L22 34"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      {showText && (
        <span
          style={{
            fontFamily: fonts.heading,
            fontWeight: fontWeights.bold,
            color: wordmarkColor,
            letterSpacing: '0.08em',
            fontSize: '0.95rem',
            textTransform: 'uppercase'
          }}
        >
          Penumbra Tech
        </span>
      )}
    </span>
  );
}
