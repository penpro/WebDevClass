// HUD-style bracketed monospace label — `[ SERVICES — ]`. Used as the
// eyebrow above each page hero, matching the streaming overlay's
// `[ STARTING SOON — ]` / `[ BE RIGHT BACK — ]` cadence.
//
// Props:
//   children   — the label text
//   tone       — 'cyan' | 'corona' | 'magenta' (default 'cyan')
//   live       — when true, prepends a pulsing dot (used for "now booking")
//   style      — forwarded to the wrapping span

import { colors, fonts, fontSizes, fontWeights, radii } from '../theme.js';

const TONES = {
  cyan: colors.cyan,
  corona: colors.accent,
  magenta: colors.magenta
};

export default function HudLabel({
  children,
  tone = 'cyan',
  live = false,
  style
}) {
  const color = TONES[tone] || TONES.cyan;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontFamily: fonts.mono,
        fontSize: fontSizes.xs,
        color,
        textTransform: 'uppercase',
        letterSpacing: '0.18em',
        fontWeight: fontWeights.medium,
        lineHeight: 1,
        ...style
      }}
    >
      <style>{`
        @keyframes penumbra-hud-pulse {
          0%, 100% { opacity: 0.55; transform: scale(1); }
          50%      { opacity: 1;    transform: scale(1.25); }
        }
      `}</style>
      <span style={{ opacity: 0.7 }}>[</span>
      {live && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: radii.full,
            background: color,
            display: 'inline-block',
            boxShadow: `0 0 8px ${color}`,
            animation: 'penumbra-hud-pulse 1.8s ease-in-out infinite'
          }}
        />
      )}
      <span>{children}</span>
      <span style={{ opacity: 0.7 }}>—</span>
      <span style={{ opacity: 0.7 }}>]</span>
    </span>
  );
}
