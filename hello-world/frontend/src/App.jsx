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
              <span style={{ opacity: 0.8, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                Signed in as {user.email}
                {user.role === 'admin' && (
                  <span
                    style={{
                      fontSize: '0.65rem',
                      padding: '0.1rem 0.45rem',
                      borderRadius: 999,
                      background: 'white',
                      color: '#111827',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      fontWeight: 'bold'
                    }}
                  >
                    admin
                  </span>
                )}
              </span>
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
