// Shared form primitives used across the four auth pages (Login,
// Register, ForgotPassword, ResetPassword). Pulled out so the auth
// surface looks consistent without four copies of the same JSX.

import { colors, fonts, fontSizes, fontWeights, radii, space } from '../theme.js';

export const authTitleStyle = {
  fontFamily: fonts.heading,
  fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
  fontWeight: fontWeights.bold,
  lineHeight: 1.1,
  letterSpacing: '-0.02em',
  margin: `${space.md} 0 0`,
  color: colors.text
};

export function AuthField({ label, htmlFor, hint, children }) {
  return (
    <div style={{ marginBottom: space.md }}>
      <label
        htmlFor={htmlFor}
        style={{
          display: 'block',
          marginBottom: space.xs,
          color: colors.text,
          fontSize: fontSizes.sm,
          fontWeight: fontWeights.semibold,
          fontFamily: fonts.body
        }}
      >
        {label}
      </label>
      {hint && (
        <div
          style={{
            fontSize: fontSizes.xs,
            color: colors.textMuted,
            marginBottom: space.xs,
            lineHeight: 1.5
          }}
        >
          {hint}
        </div>
      )}
      {children}
    </div>
  );
}

export function AuthInput(props) {
  return (
    <input
      {...props}
      style={{
        width: '100%',
        padding: '0.6rem 0.75rem',
        background: colors.bg,
        color: colors.text,
        border: `1px solid ${colors.border}`,
        borderRadius: radii.md,
        fontFamily: fonts.body,
        fontSize: fontSizes.base,
        outline: 'none',
        boxSizing: 'border-box',
        ...(props.style || {})
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = colors.accent;
        e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.accentMuted}`;
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = colors.border;
        e.currentTarget.style.boxShadow = 'none';
        props.onBlur?.(e);
      }}
    />
  );
}

export function AuthError({ children }) {
  return (
    <p
      role="alert"
      style={{
        color: colors.danger,
        background: colors.dangerMuted,
        border: `1px solid ${colors.danger}`,
        borderRadius: radii.md,
        padding: `${space.sm} ${space.md}`,
        fontSize: fontSizes.sm,
        margin: `0 0 ${space.md}`
      }}
    >
      {children}
    </p>
  );
}

export function AuthInfo({ children }) {
  return (
    <p
      style={{
        color: colors.accent,
        background: colors.accentMuted,
        border: `1px solid ${colors.accentBorder}`,
        borderRadius: radii.md,
        padding: `${space.sm} ${space.md}`,
        fontSize: fontSizes.sm,
        margin: `0 0 ${space.md}`,
        lineHeight: 1.5
      }}
    >
      {children}
    </p>
  );
}
