// 404 page rendered by the React Router catch-all.
//
// Without this, any URL that doesn't match a defined route hits the
// SPA shell and renders an empty Outlet under the Layout — looks like
// the site is broken on a bad link, and Google indexes 404s as 200.
// This page renders an actual "not found" message and steers the
// visitor at the high-value pages.
//
// Caveat: this is a client-side 404, so nginx still returns HTTP 200
// on the initial response. Real SEO-friendly 404 status would require
// SSR, which we don't have. Documented trade-off; not blocking for now.

import { Link, useLocation } from 'react-router-dom';
import {
  colors,
  fonts,
  fontSizes,
  fontWeights,
  space
} from '../theme.js';
import Container from '../components/Container.jsx';
import HudLabel from '../components/HudLabel.jsx';
import Button from '../components/Button.jsx';

export default function NotFound() {
  const location = useLocation();
  return (
    <section
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        paddingTop: space['3xl'],
        paddingBottom: space['3xl']
      }}
    >
      <Container narrow style={{ textAlign: 'center' }}>
        <HudLabel tone="magenta">404</HudLabel>
        <h1
          style={{
            fontFamily: fonts.heading,
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: fontWeights.bold,
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            margin: `${space.md} 0 ${space.md}`,
            color: colors.text
          }}
        >
          That page isn&apos;t here.
        </h1>
        <p
          style={{
            margin: `0 auto ${space.lg}`,
            maxWidth: '60ch',
            fontSize: fontSizes.md,
            color: colors.textSecondary,
            lineHeight: 1.65
          }}
        >
          The URL <code style={{ fontFamily: fonts.mono, color: colors.accent }}>
            {location.pathname}
          </code>{' '}
          doesn&apos;t match anything on the site. Likely a typo or a
          stale share link. Try one of these instead.
        </p>
        <div
          style={{
            marginTop: space.xl,
            display: 'flex',
            gap: space.md,
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}
        >
          <Button as={Link} to="/" size="lg">
            Back to the home page
          </Button>
          <Button as={Link} to="/projects" variant="secondary" size="lg">
            See the case studies
          </Button>
          <Button as={Link} to="/contact" variant="ghost" size="lg">
            Get in touch
          </Button>
        </div>
      </Container>
    </section>
  );
}
