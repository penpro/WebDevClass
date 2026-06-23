// Penumbra Tech brand tokens.
//
// Imported by components instead of repeating hex codes inline. Keeps the
// look consistent across pages and makes a future theme swap a single-file
// change.
//
// Source: brand sheet in /Inspiration/. Strict adherence is not required;
// these values are the working interpretation.

export const colors = {
  // Dark slate / navy backgrounds.
  bg: '#0B1220',
  surface: '#131C2E',
  surfaceHover: '#1A2540',
  surfaceMuted: '#0F1828',

  // Borders run subtle so cards feel like elevated planes, not boxed in.
  border: '#1F2A44',
  borderSubtle: 'rgba(255, 255, 255, 0.06)',

  // Text scale. Primary is near-white but with a hint of warmth so it
  // doesn't feel surgical. Secondary is a desaturated steel.
  text: '#E8EEF7',
  textSecondary: '#A4B0C4',
  textMuted: '#6B7891',
  textOnAccent: '#FFFFFF',

  // Brand accents. Electric blue is the primary action color.
  accent: '#2563EB',
  accentHover: '#1D4ED8',
  accentMuted: 'rgba(37, 99, 235, 0.12)',

  // Green is for success states and the "secondary" accent in the brand
  // sheet. Cyan is the tertiary highlight (used sparingly).
  success: '#10B981',
  successMuted: 'rgba(16, 185, 129, 0.12)',
  cyan: '#22D3EE',
  cyanMuted: 'rgba(34, 211, 238, 0.12)',

  // Semantic.
  danger: '#EF4444',
  warning: '#F59E0B'
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
  '5xl': '4rem'
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
  '5xl': '8rem'
};

export const radii = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '20px',
  full: '9999px'
};

export const shadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.25)',
  md: '0 4px 12px rgba(0, 0, 0, 0.35)',
  lg: '0 12px 32px rgba(0, 0, 0, 0.45)',
  glow: '0 0 24px rgba(37, 99, 235, 0.35)'
};

export const layout = {
  maxWidth: '1180px',
  maxWidthNarrow: '780px',
  navHeight: '72px'
};

export const transitions = {
  base: '150ms ease',
  slow: '300ms ease'
};

// Convenience export for usage like `theme.colors.bg`.
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
