// Site footer.
//
// Layout:
//   * Three-column responsive grid for brand / nav / contact
//   * A dedicated row of social icons (YouTube, Facebook, Instagram,
//     LinkedIn, X, Bluesky, Twitch)
//   * Bottom bar with copyright and the brand tagline

import { Link } from 'react-router-dom';
import {
  colors,
  fonts,
  fontWeights,
  radii,
  space,
  transitions
} from '../theme.js';
import { useState } from 'react';
import LogoMark from './LogoMark.jsx';
import Container from './Container.jsx';

const YEAR = 2026;

const SOCIALS = [
  {
    name: 'YouTube',
    href: 'https://www.youtube.com/@WesleyWeaverPenumbra',
    icon: YouTubeIcon
  },
  {
    name: 'Twitch',
    href: 'https://www.twitch.tv/penumbrapro',
    icon: TwitchIcon
  },
  {
    name: 'X',
    href: 'https://x.com/archaismic',
    icon: XIcon
  },
  {
    name: 'Bluesky',
    href: 'https://bsky.app/profile/penumbrawes.bsky.social',
    icon: BlueskyIcon
  },
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/wesley.weaver.jr/',
    icon: InstagramIcon
  },
  {
    name: 'Facebook',
    href: 'https://www.facebook.com/profile.php?id=1321540389',
    icon: FacebookIcon
  },
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/in/wesley-weaver-31726629/',
    icon: LinkedInIcon
  }
];

export default function Footer() {
  return (
    <footer
      style={{
        background: colors.surfaceMuted,
        borderTop: `1px solid ${colors.border}`,
        color: colors.textSecondary,
        marginTop: 'auto',
        paddingTop: space['2xl'],
        paddingBottom: space.xl
      }}
    >
      <Container>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: space['2xl'],
            marginBottom: space['2xl']
          }}
        >
          <div>
            <LogoMark size={28} color={colors.accent} showText />
            <p
              style={{
                marginTop: space.md,
                fontSize: '0.9rem',
                lineHeight: 1.6,
                maxWidth: '32ch'
              }}
            >
              Tech consulting and software solutions for businesses and
              freelancers who want clean code and reliable systems.
            </p>
          </div>

          <div>
            <FooterHeading>Site</FooterHeading>
            <FooterLink to="/services">Services</FooterLink>
            <FooterLink to="/projects">Projects</FooterLink>
            <FooterLink to="/about">About</FooterLink>
            <FooterLink to="/contact">Contact</FooterLink>
          </div>

          <div>
            <FooterHeading>Connect</FooterHeading>
            <FooterExternal href="mailto:wesleyaweaverjr@gmail.com">
              wesleyaweaverjr@gmail.com
            </FooterExternal>
            <FooterExternal href="tel:+13608507876">
              (360) 850-7876
            </FooterExternal>
            <FooterExternal
              href="https://github.com/penpro/Resume-CV"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </FooterExternal>
          </div>
        </div>

        {/* Social icon row */}
        <div
          style={{
            display: 'flex',
            gap: space.sm,
            flexWrap: 'wrap',
            paddingBottom: space.lg,
            marginBottom: space.lg,
            borderBottom: `1px solid ${colors.borderSubtle}`
          }}
        >
          {SOCIALS.map((s) => (
            <SocialIconLink
              key={s.name}
              name={s.name}
              href={s.href}
              icon={s.icon}
            />
          ))}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: space.sm,
            fontSize: '0.8rem',
            color: colors.textMuted,
            fontFamily: fonts.body
          }}
        >
          <span>
            &copy; {YEAR} Penumbra Tech — Wesley Weaver Jr. All rights
            reserved.
          </span>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: space.xs,
              fontFamily: fonts.mono,
              fontSize: '0.75rem'
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                background: colors.accent,
                borderRadius: radii.full,
                boxShadow: `0 0 6px ${colors.accent}`,
                display: 'inline-block'
              }}
            />
            Reliable code. Real impact.
          </span>
        </div>
      </Container>
    </footer>
  );
}

function FooterHeading({ children }) {
  return (
    <h4
      style={{
        margin: 0,
        marginBottom: space.md,
        color: colors.text,
        fontFamily: fonts.heading,
        fontSize: '0.8rem',
        fontWeight: fontWeights.semibold,
        textTransform: 'uppercase',
        letterSpacing: '0.12em'
      }}
    >
      {children}
    </h4>
  );
}

function FooterLink({ to, children }) {
  return (
    <Link
      to={to}
      style={{
        display: 'block',
        padding: '0.25rem 0',
        color: colors.textSecondary,
        textDecoration: 'none',
        fontSize: '0.9rem',
        fontFamily: fonts.body
      }}
    >
      {children}
    </Link>
  );
}

function FooterExternal({ href, children, ...rest }) {
  return (
    <a
      href={href}
      {...rest}
      style={{
        display: 'block',
        padding: '0.25rem 0',
        color: colors.textSecondary,
        textDecoration: 'none',
        fontSize: '0.9rem',
        fontFamily: fonts.body
      }}
    >
      {children}
    </a>
  );
}

function SocialIconLink({ name, href, icon: Icon }) {
  const [hover, setHover] = useState(false);
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={name}
      title={name}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 40,
        height: 40,
        borderRadius: radii.md,
        background: hover ? colors.accentMuted : 'transparent',
        border: `1px solid ${hover ? colors.accentBorder : colors.border}`,
        color: hover ? colors.accent : colors.textSecondary,
        textDecoration: 'none',
        transition: `background ${transitions.base}, color ${transitions.base}, border-color ${transitions.base}, box-shadow ${transitions.base}`,
        boxShadow: hover ? `0 0 16px rgba(94, 234, 212, 0.35)` : 'none'
      }}
    >
      <Icon size={18} />
    </a>
  );
}

// --- Social icons -------------------------------------------------------- //
// All hand-drawn so there is no library dep. Each takes `size` and uses
// currentColor so the parent button's hover color carries through.

function YouTubeIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23 7.2 a2.9 2.9 0 0 0 -2 -2 C19 4.6 12 4.6 12 4.6 s-7 0 -9 0.6 a2.9 2.9 0 0 0 -2 2 A30 30 0 0 0 0.4 12 a30 30 0 0 0 0.6 4.8 a2.9 2.9 0 0 0 2 2 c2 0.6 9 0.6 9 0.6 s7 0 9 -0.6 a2.9 2.9 0 0 0 2 -2 a30 30 0 0 0 0.6 -4.8 a30 30 0 0 0 -0.6 -4.8 zM9.7 15.5 V8.5 l6.1 3.5 z"/>
    </svg>
  );
}

function TwitchIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M3.5 1 L1.5 5 v15 H7 v3 h3.5 l3 -3 H17 l5 -5 V1 z M19 13 l-3 3 h-4 l-3 3 v-3 H4.5 V3 H19 z M16 5 h-2 v6 h2 z M11 5 H9 v6 h2 z"/>
    </svg>
  );
}

function XIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

function BlueskyIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M5.8 3.5 C 8.9 5.9 12 9.9 12 12.5 c0 -2.6 3.1 -6.6 6.2 -9 c2 -1.5 4.9 -2.7 4.9 0.7 c0 0.7 -0.4 5.6 -0.6 6.4 c-0.7 2.8 -3.5 3.5 -6 3.1 c4.4 0.7 5.5 3.2 3.1 5.7 c-4.6 4.8 -6.6 -1.2 -7.1 -2.7 c-0.1 -0.3 -0.1 -0.4 -0.1 -0.3 c0 -0.1 0 0 -0.1 0.3 c-0.5 1.5 -2.5 7.5 -7.1 2.7 c-2.4 -2.5 -1.3 -5 3.1 -5.7 c-2.5 0.4 -5.3 -0.3 -6 -3.1 C 1.3 9.7 0.9 4.8 0.9 4.1 C 0.9 0.7 3.8 1.9 5.8 3.5 z"/>
    </svg>
  );
}

function InstagramIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M22 12 a10 10 0 1 0 -11.6 9.9 v-7H7.9 V12 h2.5 V9.8 c0 -2.5 1.5 -3.9 3.8 -3.9 c1.1 0 2.2 0.2 2.2 0.2 v2.5 h-1.3 c-1.3 0 -1.7 0.8 -1.7 1.6 V12 h2.9 l-0.5 2.9 H13.4 v7 A10 10 0 0 0 22 12 z"/>
    </svg>
  );
}

function LinkedInIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.4 3H3.6A0.6 0.6 0 0 0 3 3.6v16.8A0.6 0.6 0 0 0 3.6 21h16.8a0.6 0.6 0 0 0 0.6 -0.6V3.6A0.6 0.6 0 0 0 20.4 3zM8.3 18.3H5.7V9.7h2.6zM7 8.5a1.5 1.5 0 1 1 0 -3a1.5 1.5 0 0 1 0 3zm11.3 9.8h-2.6v-4.2c0 -1 0 -2.3 -1.4 -2.3s-1.6 1.1 -1.6 2.2v4.3h-2.6V9.7h2.5v1.2h0a2.7 2.7 0 0 1 2.4 -1.3c2.6 0 3.1 1.7 3.1 3.9z"/>
    </svg>
  );
}
