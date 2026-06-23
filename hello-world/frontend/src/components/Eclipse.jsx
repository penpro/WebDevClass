// The signature Penumbra eclipse — corona ring around a dark moon disk,
// gently pulsing. Ported from the streaming overlay's eclipse.html so the
// website and OBS scenes share the exact same focal element.
//
// Usage:
//   <Eclipse size={420} />
//   <Eclipse style={{ position: 'absolute', right: '-12%', top: '-10%' }} />
//
// The SVG is centered on (0, 0) in its own viewBox so positioning it via
// CSS is just placement of the wrapping element — no math required.
//
// Props:
//   size       — pixel size; the SVG is square
//   glow       — drop-shadow radius (matches the overlay's vmin-based glow)
//   className  — optional class so callers can add their own animations
//   style      — forwarded to the wrapping span

import { useId } from 'react';

export default function Eclipse({
  size = 480,
  glow = 56,
  className,
  style
}) {
  // useId so multiple eclipses on the same page don't collide on gradient ids.
  const u = useId().replace(/:/g, '');

  return (
    <span
      className={className}
      style={{
        display: 'inline-block',
        lineHeight: 0,
        ...style
      }}
      aria-hidden="true"
    >
      <style>{`
        @keyframes penumbra-corona-pulse-${u} {
          0%, 100% { opacity: 0.88; transform: scale(1); }
          50%      { opacity: 1;    transform: scale(1.02); }
        }
        @keyframes penumbra-corona-pulse-2-${u} {
          0%, 100% { opacity: 0.55; transform: scale(1.03) rotate(0deg); }
          50%      { opacity: 0.9;  transform: scale(1)    rotate(2deg); }
        }
        .penumbra-corona-${u} {
          transform-origin: center;
          animation: penumbra-corona-pulse-${u} 5.5s ease-in-out infinite;
        }
        .penumbra-corona-soft-${u} {
          transform-origin: center;
          animation: penumbra-corona-pulse-2-${u} 7s ease-in-out infinite;
        }
      `}</style>
      <svg
        width={size}
        height={size}
        viewBox="-400 -400 800 800"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          filter: `drop-shadow(0 0 ${glow}px rgba(94, 234, 212, 0.4))`,
          display: 'block'
        }}
      >
        <defs>
          <radialGradient id={`atmos-${u}`} cx="0" cy="0" r="400" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0" />
            <stop offset="55%" stopColor="#22d3ee" stopOpacity="0.05" />
            <stop offset="75%" stopColor="#5eead4" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#5eead4" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`corona-outer-${u}`} cx="0" cy="0" r="320" gradientUnits="userSpaceOnUse">
            <stop offset="65%" stopColor="#ecfeff" stopOpacity="0" />
            <stop offset="78%" stopColor="#a7f3d0" stopOpacity="0.45" />
            <stop offset="86%" stopColor="#5eead4" stopOpacity="0.75" />
            <stop offset="95%" stopColor="#22d3ee" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`corona-bright-${u}`} cx="0" cy="0" r="270" gradientUnits="userSpaceOnUse">
            <stop offset="80%" stopColor="#ecfeff" stopOpacity="0" />
            <stop offset="88%" stopColor="#ecfeff" stopOpacity="1" />
            <stop offset="92%" stopColor="#5eead4" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`moon-${u}`} cx="-0.2" cy="-0.2" r="1.1">
            <stop offset="0%" stopColor="#2e1a5e" />
            <stop offset="50%" stopColor="#150b30" />
            <stop offset="100%" stopColor="#07021a" />
          </radialGradient>
          <filter id={`blur-soft-${u}`}>
            <feGaussianBlur stdDeviation="8" />
          </filter>
          <filter id={`blur-tight-${u}`}>
            <feGaussianBlur stdDeviation="2" />
          </filter>
        </defs>

        <circle r="400" fill={`url(#atmos-${u})`} />
        <g className={`penumbra-corona-soft-${u}`}>
          <circle r="320" fill={`url(#corona-outer-${u})`} filter={`url(#blur-soft-${u})`} />
        </g>
        <g className={`penumbra-corona-${u}`}>
          <circle r="270" fill={`url(#corona-bright-${u})`} filter={`url(#blur-tight-${u})`} />
          <circle r="248" fill="none" stroke="#ecfeff" strokeWidth="0.6" opacity="0.55" />
        </g>
        <circle r="240" fill={`url(#moon-${u})`} />
        <circle r="243" fill="none" stroke="#5eead4" strokeWidth="1.5" opacity="0.45" />
        <circle r="240" fill="none" stroke="#a7f3d0" strokeWidth="0.5" opacity="0.7" />
      </svg>
    </span>
  );
}
