// Shared chrome for the Syzygy product portal (/syzygy, /syzygy/privacy,
// /syzygy/terms): paper page shell, the Syzygy mark, buttons, and the
// portal footer. All three pages live in one lazy chunk, so the IBM Plex
// fontsource imports here are only fetched by portal visitors.

import { Link } from 'react-router-dom';
import { syz, REPO_URL, CONTACT_EMAIL } from './syzygyTheme.js';

import '@fontsource/ibm-plex-sans/400.css';
import '@fontsource/ibm-plex-sans/500.css';
import '@fontsource/ibm-plex-sans/600.css';
import '@fontsource/ibm-plex-sans/700.css';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';

/** The Syzygy mark — three celestial bodies aligned on a horizontal axis
 *  (a literal syzygy): two ink satellites flanking an Observatory-Blue
 *  primary, with the ochre glint just off the primary's upper limb.
 *  Mirrors SyzygyMark.tsx in the app. */
export function SyzygyMark({ size = 40, glint = true }) {
  return (
    <svg
      width={size * 2.4}
      height={size}
      viewBox="0 0 96 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ overflow: 'visible', display: 'block' }}
    >
      <line x1="2" y1="20" x2="94" y2="20" stroke={syz.text2} strokeWidth="1.6" />
      <circle cx="16" cy="20" r="7" fill={syz.text} />
      <circle cx="80" cy="20" r="7" fill={syz.text} />
      <circle cx="48" cy="20" r="12" fill={syz.accent} />
      {glint && (
        <g>
          <path
            d="M60 6 L60.9 11.1 L66 12 L60.9 12.9 L60 18 L59.1 12.9 L54 12 L59.1 11.1 Z"
            fill={syz.ochre}
          />
          <circle cx="64.5" cy="8" r="0.9" fill={syz.ochre} opacity="0.8" />
        </g>
      )}
    </svg>
  );
}

/** Full-bleed paper shell. The consulting site's dark NavBar/Footer still
 *  frame the route (Layout wraps every page); inside, the portal reads as
 *  its own sheet of paper with Syzygy type and ink. */
export function PaperPage({ children }) {
  return (
    <div
      style={{
        background: syz.bg,
        color: syz.text,
        fontFamily: syz.font,
        lineHeight: 1.65
      }}
    >
      {children}
    </div>
  );
}

export function PaperContainer({ narrow = false, style, children }) {
  return (
    <div
      style={{
        maxWidth: narrow ? syz.maxWidthNarrow : syz.maxWidth,
        margin: '0 auto',
        padding: '0 1.5rem',
        boxSizing: 'border-box',
        ...style
      }}
    >
      {children}
    </div>
  );
}

/** Small-caps mono eyebrow — the portal's equivalent of HudLabel. */
export function InkLabel({ children }) {
  return (
    <div
      style={{
        fontFamily: syz.mono,
        fontSize: '0.75rem',
        fontWeight: 500,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: syz.accent2
      }}
    >
      {children}
    </div>
  );
}

export function PaperButton({ href, to, variant = 'primary', children }) {
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.72rem 1.5rem',
    borderRadius: syz.radiusSm,
    fontFamily: syz.font,
    fontWeight: 600,
    fontSize: '1rem',
    textDecoration: 'none',
    border: '1px solid transparent',
    transition: 'filter 150ms ease, transform 150ms ease'
  };
  const variants = {
    primary: { background: syz.accent, color: syz.onAccent },
    secondary: {
      background: 'transparent',
      color: syz.accent,
      border: `1px solid ${syz.border2}`
    }
  };
  const style = { ...base, ...variants[variant] };
  const hover = (e, on) => {
    e.currentTarget.style.filter = on ? 'brightness(1.08)' : 'none';
    e.currentTarget.style.transform = on ? 'translateY(-1px)' : 'none';
  };
  if (to) {
    return (
      <Link
        to={to}
        style={style}
        onMouseEnter={(e) => hover(e, true)}
        onMouseLeave={(e) => hover(e, false)}
      >
        {children}
      </Link>
    );
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={style}
      onMouseEnter={(e) => hover(e, true)}
      onMouseLeave={(e) => hover(e, false)}
    >
      {children}
    </a>
  );
}

const footLink = {
  color: syz.text2,
  textDecoration: 'none',
  fontFamily: syz.mono,
  fontSize: '0.85rem'
};

/** Portal footer: policy links Google's OAuth branding points at, plus the
 *  way back out to the consulting site. */
export function SyzygyFooter() {
  return (
    <div
      style={{
        borderTop: `1px solid ${syz.border}`,
        background: syz.bg2,
        padding: '2rem 0 2.5rem'
      }}
    >
      <PaperContainer
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '1.5rem',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <SyzygyMark size={22} glint={false} />
          <span style={{ fontFamily: syz.mono, fontSize: '0.85rem', color: syz.muted }}>
            Syzygy · a Penumbra product
          </span>
        </div>
        <nav style={{ display: 'flex', flexWrap: 'wrap', gap: '1.4rem' }}>
          <Link to="/syzygy" style={footLink}>Home</Link>
          <Link to="/syzygy/privacy" style={footLink}>Privacy</Link>
          <Link to="/syzygy/terms" style={footLink}>Terms</Link>
          <a href={REPO_URL} target="_blank" rel="noopener noreferrer" style={footLink}>
            GitHub ↗
          </a>
          <a href={`mailto:${CONTACT_EMAIL}`} style={footLink}>Contact</a>
        </nav>
      </PaperContainer>
    </div>
  );
}

/** Shared heading style for policy pages and landing sections. */
export const syzH2 = {
  fontFamily: syz.font,
  fontSize: 'clamp(1.35rem, 2.4vw, 1.8rem)',
  fontWeight: 700,
  letterSpacing: '-0.015em',
  lineHeight: 1.2,
  margin: '2.2em 0 0.4em',
  color: syz.text,
  borderBottom: `2px solid ${syz.ochre}`,
  paddingBottom: '0.3em'
};
