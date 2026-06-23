// Top navigation. Sticky on scroll, dark surface, brand logo on the left,
// page links + auth state on the right. Collapses to a hamburger on
// narrow viewports — kept simple (no animation library) to match the
// rest of the codebase.

import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  colors,
  fonts,
  fontWeights,
  layout,
  radii,
  space
} from '../theme.js';
import { useAuth } from '../AuthContext.jsx';
import LogoMark from './LogoMark.jsx';
import Button from './Button.jsx';
import Container from './Container.jsx';

const PUBLIC_LINKS = [
  { to: '/services', label: 'Services' },
  { to: '/projects', label: 'Projects' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' }
];

export default function NavBar() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    await logout();
    setOpen(false);
    navigate('/');
  }

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(11, 18, 32, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${colors.borderSubtle}`
      }}
    >
      <Container
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: layout.navHeight
        }}
      >
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            color: colors.text,
            textDecoration: 'none'
          }}
          onClick={() => setOpen(false)}
        >
          <LogoMark size={32} color={colors.accent} showText />
        </Link>

        {/* Desktop nav */}
        <nav
          className="penumbra-nav-desktop"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: space.lg
          }}
        >
          {PUBLIC_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              style={({ isActive }) => ({
                color: isActive ? colors.text : colors.textSecondary,
                textDecoration: 'none',
                fontFamily: fonts.body,
                fontWeight: fontWeights.medium,
                fontSize: '0.95rem',
                paddingBottom: '2px',
                borderBottom: isActive
                  ? `2px solid ${colors.accent}`
                  : '2px solid transparent'
              })}
            >
              {link.label}
            </NavLink>
          ))}

          <div
            style={{
              width: 1,
              height: 22,
              background: colors.border,
              margin: `0 ${space.sm}`
            }}
          />

          {loading ? null : user ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: space.md
              }}
            >
              <span
                style={{
                  color: colors.textSecondary,
                  fontSize: '0.85rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                {user.email}
                <RoleBadge role={user.role} />
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleLogout}
              >
                Log out
              </Button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: space.sm }}>
              <Button as={Link} to="/login" variant="ghost" size="sm">
                Log in
              </Button>
              <Button as={Link} to="/register" variant="primary" size="sm">
                Sign up
              </Button>
            </div>
          )}
        </nav>

        {/* Mobile hamburger */}
        <button
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((v) => !v)}
          className="penumbra-nav-burger"
          style={{
            display: 'none',
            background: 'transparent',
            color: colors.text,
            border: `1px solid ${colors.border}`,
            borderRadius: radii.sm,
            padding: '0.45rem 0.6rem',
            cursor: 'pointer'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            {open ? (
              <path
                d="M6 6 L18 18 M18 6 L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M4 7 H20 M4 12 H20 M4 17 H20"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            )}
          </svg>
        </button>
      </Container>

      {/* Mobile dropdown */}
      {open && (
        <div
          style={{
            background: colors.bg,
            borderTop: `1px solid ${colors.borderSubtle}`,
            padding: `${space.md} ${space.lg}`
          }}
          className="penumbra-nav-mobile-panel"
        >
          {PUBLIC_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              style={({ isActive }) => ({
                display: 'block',
                padding: '0.6rem 0',
                color: isActive ? colors.text : colors.textSecondary,
                textDecoration: 'none',
                fontFamily: fonts.body,
                fontWeight: fontWeights.medium,
                borderBottom: `1px solid ${colors.borderSubtle}`
              })}
            >
              {link.label}
            </NavLink>
          ))}
          {loading ? null : user ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: space.md
              }}
            >
              <span
                style={{
                  color: colors.textSecondary,
                  fontSize: '0.85rem'
                }}
              >
                {user.email}
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleLogout}
              >
                Log out
              </Button>
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                gap: space.sm,
                paddingTop: space.md
              }}
            >
              <Button
                as={Link}
                to="/login"
                variant="ghost"
                size="sm"
                fullWidth
                onClick={() => setOpen(false)}
              >
                Log in
              </Button>
              <Button
                as={Link}
                to="/register"
                variant="primary"
                size="sm"
                fullWidth
                onClick={() => setOpen(false)}
              >
                Sign up
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Toggle desktop/mobile via media-query injected style tag — keeps
          components free of CSS files but lets us actually be responsive. */}
      <style>{`
        @media (max-width: 768px) {
          .penumbra-nav-desktop { display: none !important; }
          .penumbra-nav-burger { display: inline-flex !important; }
        }
        @media (min-width: 769px) {
          .penumbra-nav-mobile-panel { display: none !important; }
        }
      `}</style>
    </header>
  );
}

function RoleBadge({ role }) {
  const tiers = {
    super_admin: { label: 'super admin', bg: colors.accent, color: '#fff' },
    admin: { label: 'admin', bg: colors.success, color: '#04221b' },
    premium: { label: 'premium', bg: colors.cyan, color: '#04222a' }
  };
  const tier = tiers[role];
  if (!tier) return null;
  return (
    <span
      style={{
        fontSize: '0.65rem',
        padding: '0.1rem 0.45rem',
        borderRadius: radii.full,
        background: tier.bg,
        color: tier.color,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        fontWeight: 700
      }}
    >
      {tier.label}
    </span>
  );
}
