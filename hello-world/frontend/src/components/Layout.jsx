// Shared layout shell. Wraps every route with the NavBar + Footer and
// provides the dark page background. Replaces what App.jsx used to do.
//
// Suspense lives here (not at the router root) so a lazy-loaded route
// can fall back without un-rendering the NavBar + Footer.
//
// An error boundary lives here too, keyed on the current pathname so
// the boundary unmounts and resets every time the user navigates. That
// way one route blowing up at render (a typo in JSX, a stray template-
// literal `${var}`, an undefined import) never wedges the rest of the
// SPA — the visitor sees a friendly error card, clicks "Back to the
// home page," and is in a working state again.

import React, { Suspense } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { colors, fonts, fontSizes, fontWeights, space } from '../theme.js';
import NavBar from './NavBar.jsx';
import Footer from './Footer.jsx';
import ScrollProgress from './ScrollProgress.jsx';

function PageFallback() {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '40vh',
        color: colors.textMuted,
        fontFamily: fonts.mono,
        fontSize: '0.8rem',
        letterSpacing: '0.06em',
        textTransform: 'uppercase'
      }}
    >
      Loading
    </div>
  );
}

function PageError({ error }) {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        padding: space.xl
      }}
    >
      <div
        style={{
          maxWidth: '52ch',
          textAlign: 'center',
          padding: space.xl,
          borderRadius: 14,
          background: colors.surface,
          border: `1px solid ${colors.border}`
        }}
      >
        <div
          style={{
            fontFamily: fonts.mono,
            fontSize: fontSizes.xs,
            color: colors.magenta,
            textTransform: 'uppercase',
            letterSpacing: '0.14em',
            marginBottom: space.sm
          }}
        >
          This page blew up
        </div>
        <h1
          style={{
            fontFamily: fonts.heading,
            fontSize: fontSizes.xl,
            fontWeight: fontWeights.bold,
            color: colors.text,
            margin: `0 0 ${space.md}`,
            letterSpacing: '-0.01em'
          }}
        >
          Something rendered wrong here.
        </h1>
        <p
          style={{
            margin: 0,
            color: colors.textSecondary,
            fontSize: fontSizes.md,
            lineHeight: 1.6
          }}
        >
          The rest of the site is fine. Navigate away and come back, or
          jump straight to the home page.
        </p>
        {error && error.message ? (
          <pre
            style={{
              marginTop: space.lg,
              padding: space.md,
              background: colors.codeBg,
              border: `1px solid ${colors.border}`,
              borderRadius: 8,
              fontFamily: fonts.mono,
              fontSize: fontSizes.xs,
              color: colors.textMuted,
              textAlign: 'left',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}
          >
            {error.message}
          </pre>
        ) : null}
        <div style={{ marginTop: space.lg, display: 'flex', gap: space.sm, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            to="/"
            style={{
              padding: '0.6rem 1.2rem',
              borderRadius: 6,
              background: colors.accent,
              color: colors.textOnAccent,
              textDecoration: 'none',
              fontFamily: fonts.body,
              fontWeight: fontWeights.semibold,
              fontSize: fontSizes.sm
            }}
          >
            Back to the home page
          </Link>
        </div>
      </div>
    </div>
  );
}

// React error boundaries still have to be class components — the hooks
// API doesn't cover componentDidCatch / getDerivedStateFromError.
class RouteErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Log to console so the operator has a stack to grep when the
    // visitor opens DevTools to figure out what happened.
    console.error('Route render error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return <PageError error={this.state.error} />;
    }
    return this.props.children;
  }
}

// Wrap the boundary in a pathname-keyed component so React unmounts +
// remounts it on every navigation. Without this, once the boundary
// catches an error it stays errored until a full page reload, even if
// the user navigates to a perfectly healthy route.
function RoutedContent() {
  const location = useLocation();
  return (
    <RouteErrorBoundary key={location.pathname}>
      <Suspense fallback={<PageFallback />}>
        <Outlet />
      </Suspense>
    </RouteErrorBoundary>
  );
}

export default function Layout() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: colors.bg,
        color: colors.text,
        fontFamily: fonts.body,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <ScrollProgress />
      <NavBar />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <RoutedContent />
      </main>
      <Footer />
    </div>
  );
}
