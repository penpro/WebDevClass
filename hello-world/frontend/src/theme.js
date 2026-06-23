// Penumbra Tech brand tokens.
//
// The palette comes from the streaming overlay's "corona" identity:
// deep moon-shadow navy backgrounds, cyan/teal corona accents, soft
// mint atmospheric highlights, and a magenta-violet for the rare hot
// emphasis moments ("BeginPlay()" treatment). This is the SAME visual
// language the OBS overlays use, ported to the website so the brand
// reads coherently across both surfaces.
//
// Imported by every component instead of repeating hex codes inline.

export const colors = {
  // Deep navy / moon-shadow backgrounds. The page wash leans toward the
  // overlay's "moon" colors (#07021a, #150b30, #2e1a5e) rather than a
  // generic slate. Surfaces are lighter so cards still rise off the page.
  bg: '#07021a',
  bgSoft: '#0d0626',
  surface: '#150b30',
  surfaceHover: '#1e1145',
  surfaceMuted: '#0a0420',

  // Borders run subtle and corona-tinted so cards feel like glowing
  // panels rather than boxed-in rectangles.
  border: '#2a1a55',
  borderSubtle: 'rgba(94, 234, 212, 0.10)',
  borderAccent: 'rgba(94, 234, 212, 0.35)',

  // Text scale. Primary is near-white with the faintest mint hint so it
  // reads warm against the navy. Secondary is the overlay's mint cyan.
  text: '#ecfeff',
  textSecondary: '#a4b0c4',
  textMuted: '#7a85a0',
  textOnAccent: '#04221b',

  // Brand accents — the corona. This IS the primary action color.
  accent: '#5eead4',          // teal corona — buttons, CTAs, primary action
  accentHover: '#7ef0db',     // brighter for hover
  accentBright: '#a7f3d0',    // mint — atmospheric highlights, soft text
  accentMuted: 'rgba(94, 234, 212, 0.12)',
  accentBorder: 'rgba(94, 234, 212, 0.35)',

  // Cyan / atmosphere — used for HUD labels, eyebrows, and the
  // outer atmosphere of the eclipse.
  cyan: '#22d3ee',
  cyanSoft: '#67e8f9',
  cyanMuted: 'rgba(34, 211, 238, 0.12)',

  // Magenta / violet — the "BeginPlay()" emphasis color. Use sparingly.
  // One per page, usually. Reserved for the headline highlight word.
  magenta: '#c084fc',
  magentaSoft: '#e9d5ff',
  magentaMuted: 'rgba(192, 132, 252, 0.12)',

  // Semantic.
  success: '#5eead4',         // matches accent — corona = good
  successMuted: 'rgba(94, 234, 212, 0.12)',
  danger: '#fb7185',
  dangerMuted: 'rgba(251, 113, 133, 0.12)',
  warning: '#fbbf24',

  // Code panel colors — mirror the JetBrains Rider chrome from the
  // streaming overlay's code panel. Used by CodePanel.jsx.
  codeBg: '#0b0418',
  codeChrome: '#1a0d3a',
  codeKeyword: '#c084fc',     // class, void, struct, return
  codeType: '#5eead4',        // FString, UFUNCTION, APenumbra
  codeFunc: '#67e8f9',        // function calls
  codeString: '#a7f3d0',      // string literals
  codeComment: '#6b7891',     // // comments
  codeNumber: '#fb7185'
};

export const fonts = {
  heading: "'Space Grotesk', 'Inter', system-ui, sans-serif",
  body: "'Inter', system-ui, sans-serif",
  mono: "'JetBrains Mono', 'Fira Code', Consolas, monospace"
};

export const fontSizes = {
  xs: '0.75rem',
  sm: '0.85rem',
  base: '1rem',
  md: '1.1rem',
  lg: '1.25rem',
  xl: '1.5rem',
  '2xl': '2rem',
  '3xl': '2.5rem',
  '4xl': '3.25rem',
  '5xl': '4rem',
  '6xl': '5rem'
};

export const fontWeights = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700
};

export const space = {
  0: '0',
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
  '3xl': '4rem',
  '4xl': '6rem',
  '5xl': '8rem',
  '6xl': '10rem'
};

export const radii = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '20px',
  full: '9999px'
};

export const shadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.4)',
  md: '0 4px 16px rgba(0, 0, 0, 0.5)',
  lg: '0 16px 40px rgba(0, 0, 0, 0.6)',
  // Corona-tinted glows for emphasis. Use on hero CTAs and focused inputs.
  glow: '0 0 24px rgba(94, 234, 212, 0.35)',
  glowStrong: '0 0 36px rgba(94, 234, 212, 0.55)',
  glowMagenta: '0 0 24px rgba(192, 132, 252, 0.4)'
};

export const layout = {
  maxWidth: '1180px',
  maxWidthNarrow: '780px',
  navHeight: '72px'
};

export const transitions = {
  base: '150ms ease',
  slow: '300ms ease',
  glow: '600ms ease-in-out'
};

// Convenience export for usage like `theme.colors.accent`.
const theme = {
  colors,
  fonts,
  fontSizes,
  fontWeights,
  space,
  radii,
  shadows,
  layout,
  transitions
};

export default theme;
