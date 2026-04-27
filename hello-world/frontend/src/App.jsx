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
                <RoleBadge role={user.role} />
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

// Small visual indicator next to the email in the header so people know
// at a glance what tier they're signed in as. Plain users get no badge.
function RoleBadge({ role }) {
  const tiers = {
    super_admin: { label: 'super admin', bg: '#fbbf24', color: '#111827' },
    admin: { label: 'admin', bg: 'white', color: '#111827' },
    premium: { label: 'premium', bg: '#a78bfa', color: '#111827' }
  }
  const tier = tiers[role]
  if (!tier) return null
  return (
    <span
      style={{
        fontSize: '0.65rem',
        padding: '0.1rem 0.45rem',
        borderRadius: 999,
        background: tier.bg,
        color: tier.color,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        fontWeight: 'bold'
      }}
    >
      {tier.label}
    </span>
  )
}
