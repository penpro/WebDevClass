// Surface-level card primitive used for service callouts, project cards,
// stat blocks, etc. Two visual modes:
//   default  — neutral surface, used in grids of equal items
//   accent   — left-edge accent stripe in the brand blue, for emphasis
//
// Hover lift is opt-in via `interactive` — keep it off for static
// content cards so they don't feel "clickable" when they aren't.

import { useState } from 'react';
import { colors, radii, shadows, space, transitions } from '../theme.js';

export default function Card({
  children,
  variant = 'default',
  interactive = false,
  padding = space.lg,
  style,
  ...rest
}) {
  const [hover, setHover] = useState(false);

  const accentStripe =
    variant === 'accent'
      ? { borderLeft: `3px solid ${colors.accent}` }
      : {};

  return (
    <div
      {...rest}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background:
          interactive && hover ? colors.surfaceHover : colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: radii.lg,
        padding,
        color: colors.text,
        boxShadow: interactive && hover ? shadows.md : shadows.sm,
        transform: interactive && hover ? 'translateY(-2px)' : 'none',
        transition: `background ${transitions.base}, transform ${transitions.base}, box-shadow ${transitions.base}`,
        cursor: interactive ? 'pointer' : 'default',
        ...accentStripe,
        ...style
      }}
    >
      {children}
    </div>
  );
}
