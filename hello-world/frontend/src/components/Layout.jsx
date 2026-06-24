// Shared layout shell. Wraps every route with the NavBar + Footer and
// provides the dark page background. Replaces what App.jsx used to do.
//
// Suspense lives here (not at the router root) so a lazy-loaded route
// can fall back without un-rendering the NavBar + Footer.

import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { colors, fonts } from '../theme.js';
import NavBar from './NavBar.jsx';
import Footer from './Footer.jsx';

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
      <NavBar />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Suspense fallback={<PageFallback />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
