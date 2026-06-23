// Site footer. Brand-aligned replacement for the inline footer that
// previously lived in index.html. Three columns on desktop (brand /
// links / contact), stacked on mobile.

import { Link } from 'react-router-dom';
import {
  colors,
  fonts,
  fontWeights,
  layout,
  radii,
  space
} from '../theme.js';
import LogoMark from './LogoMark.jsx';
import Container from './Container.jsx';

const YEAR = 2026;

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
                lineHeight: 1.55,
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

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: space.sm,
            paddingTop: space.lg,
            borderTop: `1px solid ${colors.borderSubtle}`,
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
                background: colors.success,
                borderRadius: radii.full,
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
        fontSize: '0.85rem',
        fontWeight: fontWeights.semibold,
        textTransform: 'uppercase',
        letterSpacing: '0.08em'
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
