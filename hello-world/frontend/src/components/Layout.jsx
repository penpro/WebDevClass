// Shared layout shell. Wraps every route with the NavBar + Footer and
// provides the dark page background. Replaces what App.jsx used to do.
//
// The `<Outlet />` is where the matched route's component renders.

import { Outlet } from 'react-router-dom';
import { colors, fonts } from '../theme.js';
import NavBar from './NavBar.jsx';
import Footer from './Footer.jsx';

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
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
