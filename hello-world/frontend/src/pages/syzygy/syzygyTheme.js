// Syzygy product-portal brand tokens.
//
// Syzygy (the Penumbra research workspace, github.com/penpro/Syzygy) has
// its own identity, deliberately distinct from the consulting site's
// corona/void language: warm paper, research ink, observatory blue, with
// copper/ochre accents and IBM Plex type. These values mirror the
// `[data-theme='syzygy']` preset in the app's styles.css — if the app's
// palette shifts, update both in the same change.
//
// Scoped to src/pages/syzygy/* only. Everything else on the site keeps
// importing ../theme.js.

export const syz = {
  // Surfaces — flat paper, no starfields, no glow gradients.
  bg: '#f6f2e7',        // Warm Paper
  panel: '#fbf8f0',
  bg2: '#efe9da',
  bg3: '#e6dfcc',

  // Ink scale.
  text: '#0b1d2a',      // Research Ink
  text2: '#3e5361',
  muted: '#5a6e7a',
  faint: '#8a97a0',

  // Accents.
  accent: '#2e5c8a',    // Observatory Blue — primary action
  accent2: '#4c7f7a',   // Muted Teal
  copper: '#b26d4a',    // Oxidized Copper — warm emphasis
  ochre: '#d6a24c',     // Ochre — the glint
  onAccent: '#fbf8f0',

  // Ink-based borders — accent-tinted borders read as smudges on paper.
  border: 'rgba(11, 29, 42, 0.14)',
  border2: 'rgba(11, 29, 42, 0.28)',
  shadow: '0 1px 3px rgba(11, 29, 42, 0.08)',
  shadowLift: '0 6px 24px rgba(11, 29, 42, 0.10)',

  font: "'IBM Plex Sans', 'Segoe UI', system-ui, sans-serif",
  mono: "'IBM Plex Mono', 'SFMono-Regular', Consolas, monospace",

  radius: '10px',
  radiusSm: '6px',
  maxWidth: '1080px',
  maxWidthNarrow: '760px'
};

export const REPO_URL = 'https://github.com/penpro/Syzygy';
export const DOWNLOAD_URL = 'https://github.com/penpro/Syzygy/releases/latest';
export const CONTACT_EMAIL = 'wesley@penumbra-tech.com';
