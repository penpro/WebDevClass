import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext.jsx'

export default function App() {
  const { user, loading, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', lineHeight: 1.6 }}>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 2rem',
          background: '#111827',
          color: 'white'
        }}
      >
        <Link
          to="/"
          style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}
        >
          Mini Apps
        </Link>
        <nav style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {loading ? null : user ? (
            <>
              <span style={{ opacity: 0.8 }}>Signed in as {user.email}</span>
              <button
                type="button"
                onClick={handleLogout}
                style={{
                  background: 'transparent',
                  color: 'white',
                  border: '1px solid white',
                  borderRadius: 4,
                  padding: '0.25rem 0.75rem',
                  cursor: 'pointer'
                }}
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ color: 'white' }}>
                Log in
              </Link>
              <Link to="/register" style={{ color: 'white' }}>
                Sign up
              </Link>
            </>
          )}
        </nav>
      </header>

      <main style={{ padding: '2rem' }}>
        <Outlet />
      </main>
    </div>
  )
}
