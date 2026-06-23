// Branded button with three variants:
//   primary   — solid electric-blue, the dominant CTA
//   secondary — outlined, used for "secondary action next to a primary"
//   ghost     — no border, low-emphasis (e.g. nav, inline actions)
//
// Use the `as` prop to render as a Link or anchor instead of a button:
//   <Button as={Link} to="/contact">Start a project</Button>
//   <Button as="a" href="mailto:..." variant="secondary">Email me</Button>

import { colors, fonts, fontWeights, radii, transitions } from '../theme.js';
import { useState } from 'react';

const variants = {
  primary: {
    background: colors.accent,
    color: colors.textOnAccent,
    border: `1px solid ${colors.accent}`,
    hoverBg: colors.accentHover,
    hoverBorder: colors.accentHover
  },
  secondary: {
    background: 'transparent',
    color: colors.text,
    border: `1px solid ${colors.border}`,
    hoverBg: colors.surface,
    hoverBorder: colors.text
  },
  ghost: {
    background: 'transparent',
    color: colors.textSecondary,
    border: '1px solid transparent',
    hoverBg: colors.surface,
    hoverBorder: 'transparent'
  }
};

const sizes = {
  sm: { padding: '0.4rem 0.85rem', fontSize: '0.85rem' },
  md: { padding: '0.65rem 1.25rem', fontSize: '0.95rem' },
  lg: { padding: '0.85rem 1.75rem', fontSize: '1rem' }
};

export default function Button({
  children,
  as: Component = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  fullWidth = false,
  style,
  ...rest
}) {
  const [hover, setHover] = useState(false);
  const v = variants[variant] || variants.primary;
  const s = sizes[size] || sizes.md;

  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    background: hover && !disabled ? v.hoverBg : v.background,
    color: v.color,
    border: hover && !disabled ? `1px solid ${v.hoverBorder}` : v.border,
    borderRadius: radii.md,
    padding: s.padding,
    fontSize: s.fontSize,
    fontFamily: fonts.body,
    fontWeight: fontWeights.semibold,
    letterSpacing: '0.01em',
    textDecoration: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    width: fullWidth ? '100%' : 'auto',
    transition: `background ${transitions.base}, border-color ${transitions.base}`,
    ...style
  };

  return (
    <Component
      {...rest}
      style={baseStyle}
      disabled={Component === 'button' ? disabled : undefined}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {children}
    </Component>
  );
}
