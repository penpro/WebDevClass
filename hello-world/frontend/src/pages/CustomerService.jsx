import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { apiFetch } from '../lib/api.js'
import { useAuth } from '../AuthContext.jsx'

const ADMIN_ROLES = new Set(['admin', 'super_admin'])
const ROLE_OPTIONS = [
  { value: 'user', label: 'User' },
  { value: 'premium', label: 'Premium' },
  { value: 'admin', label: 'Admin' },
  { value: 'super_admin', label: 'Super admin' }
]
const ROLE_LABELS = Object.fromEntries(
  ROLE_OPTIONS.map((o) => [o.value, o.label])
)

export default function CustomerService() {
  const { user, loading } = useAuth()

  const [query, setQuery] = useState('')
  const [results, setResults] = useState(null)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState(null)

  // Per-user-id reset state: 'idle' | 'sending' | 'sent' | 'error'
  const [resetStates, setResetStates] = useState({})
  // Per-user-id pending role selection in the dropdown (super_admin UI)
  const [pendingRoles, setPendingRoles] = useState({})
  // Per-user-id role-change state: 'idle' | 'saving' | 'saved' | 'error'
  const [roleStates, setRoleStates] = useState({})

  if (loading) return <p>Loading…</p>
  if (!user) {
    return (
      <Navigate
        to="/login"
        state={{ from: '/customer-service' }}
        replace
      />
    )
  }
  if (!ADMIN_ROLES.has(user.role)) {
    return (
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <h1>Customer Service</h1>
        <p>You do not have access to this tool.</p>
      </div>
    )
  }

  const isSuperAdmin = user.role === 'super_admin'

  async function handleSearch(event) {
    event.preventDefault()
    setError(null)
    const q = query.trim()
    if (!q) {
      setResults([])
      return
    }
    setSearching(true)
    try {
      const data = await apiFetch(
        `/admin/users/search?q=${encodeURIComponent(q)}`
      )
      setResults(data || [])
      setResetStates({})
      setPendingRoles({})
      setRoleStates({})
    } catch (err) {
      setError(err.message)
      setResults([])
    } finally {
      setSearching(false)
    }
  }

  async function handleSendReset(userId) {
    setError(null)
    setResetStates((prev) => ({ ...prev, [userId]: 'sending' }))
    try {
      await apiFetch(`/admin/users/${userId}/send-password-reset`, {
        method: 'POST'
      })
      setResetStates((prev) => ({ ...prev, [userId]: 'sent' }))
    } catch (err) {
      setError(err.message)
      setResetStates((prev) => ({ ...prev, [userId]: 'error' }))
    }
  }

  async function handleChangeRole(targetUser) {
    const newRole = pendingRoles[targetUser.id] || targetUser.role
    if (newRole === targetUser.role) return
    if (!window.confirm(
      `Change ${targetUser.email}'s role from ` +
      `${ROLE_LABELS[targetUser.role]} to ${ROLE_LABELS[newRole]}?`
    )) return

    setError(null)
    setRoleStates((prev) => ({ ...prev, [targetUser.id]: 'saving' }))
    try {
      const updated = await apiFetch(
        `/admin/users/${targetUser.id}/role`,
        {
          method: 'PUT',
          body: JSON.stringify({ role: newRole })
        }
      )
      // Update the row in place so the UI reflects the new role
      setResults((prev) =>
        prev
          ? prev.map((u) =>
              u.id === targetUser.id ? { ...u, role: updated.role } : u
            )
          : prev
      )
      setRoleStates((prev) => ({ ...prev, [targetUser.id]: 'saved' }))
      setTimeout(() => {
        setRoleStates((prev) => {
          const next = { ...prev }
          delete next[targetUser.id]
          return next
        })
      }, 1500)
    } catch (err) {
      setError(err.message)
      setRoleStates((prev) => ({ ...prev, [targetUser.id]: 'error' }))
    }
  }

  function resetButtonLabel(userId) {
    const state = resetStates[userId]
    if (state === 'sending') return 'Sending…'
    if (state === 'sent') return 'Sent ✓'
    if (state === 'error') return 'Retry'
    return 'Send password reset email'
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <h1>Customer Service</h1>
      <p style={{ color: '#6b7280' }}>
        Search by email, then trigger a password reset email for the found
        account.
        {isSuperAdmin && ' As a super admin you can also assign roles.'}
        {' '}The reset email is sent through the same flow as a user's own
        forgot-password request — a one-hour, single-use token.
      </p>

      <section
        style={{
          border: '1px solid #d1d5db',
          borderRadius: 8,
          padding: '1rem',
          marginBottom: '1.5rem',
          background: '#f9fafb'
        }}
      >
        <form
          onSubmit={handleSearch}
          style={{ display: 'flex', gap: '0.5rem' }}
        >
          <input
            type="text"
            placeholder="Search user email (substring match)"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            style={{
              flex: 1,
              padding: '0.5rem',
              boxSizing: 'border-box'
            }}
          />
          <button type="submit" disabled={searching || !query.trim()}>
            {searching ? 'Searching…' : 'Search'}
          </button>
        </form>
      </section>

      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      {results === null ? (
        <p style={{ color: '#6b7280' }}>
          Enter a search term above to look up users.
        </p>
      ) : results.length === 0 ? (
        <p>No users matched that search.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {results.map((u) => {
            const resetState = resetStates[u.id] || 'idle'
            const resetDisabled =
              resetState === 'sending' || resetState === 'sent'
            const isSelf = u.id === user.id
            const pendingRole = pendingRoles[u.id] || u.role
            const roleState = roleStates[u.id] || 'idle'
            const roleChanged = pendingRole !== u.role

            return (
              <li
                key={u.id}
                style={{
                  border: '1px solid #d1d5db',
                  borderRadius: 8,
                  padding: '1rem',
                  marginBottom: '0.75rem',
                  background: 'white'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    flexWrap: 'wrap'
                  }}
                >
                  <strong style={{ fontSize: '1rem' }}>{u.email}</strong>
                  <RoleBadge role={u.role} />
                  {isSelf && (
                    <span
                      style={{
                        fontSize: '0.7rem',
                        color: '#6b7280',
                        fontStyle: 'italic'
                      }}
                    >
                      (you)
                    </span>
                  )}
                </div>
                <div
                  style={{
                    fontSize: '0.8rem',
                    color: '#6b7280',
                    marginTop: '0.25rem'
                  }}
                >
                  Created {new Date(u.created_at).toLocaleString()}
                  {' · '}
                  Last login{' '}
                  {u.last_login_at
                    ? new Date(u.last_login_at).toLocaleString()
                    : 'never'}
                </div>

                <div
                  style={{
                    marginTop: '0.75rem',
                    display: 'flex',
                    gap: '0.5rem',
                    flexWrap: 'wrap',
                    alignItems: 'center'
                  }}
                >
                  <button
                    type="button"
                    onClick={() => handleSendReset(u.id)}
                    disabled={resetDisabled}
                  >
                    {resetButtonLabel(u.id)}
                  </button>

                  {isSuperAdmin && !isSelf && (
                    <>
                      <span
                        style={{
                          color: '#6b7280',
                          fontSize: '0.85rem'
                        }}
                      >
                        |
                      </span>
                      <label
                        style={{
                          fontSize: '0.85rem',
                          display: 'flex',
                          gap: '0.35rem',
                          alignItems: 'center'
                        }}
                      >
                        Role:
                        <select
                          value={pendingRole}
                          onChange={(e) =>
                            setPendingRoles((prev) => ({
                              ...prev,
                              [u.id]: e.target.value
                            }))
                          }
                          disabled={roleState === 'saving'}
                        >
                          {ROLE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <button
                        type="button"
                        disabled={!roleChanged || roleState === 'saving'}
                        onClick={() => handleChangeRole(u)}
                      >
                        {roleState === 'saving'
                          ? 'Saving…'
                          : roleState === 'saved'
                          ? 'Saved ✓'
                          : 'Apply'}
                      </button>
                    </>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function RoleBadge({ role }) {
  const tiers = {
    super_admin: { label: 'super admin', bg: '#fbbf24', color: '#111827' },
    admin: { label: 'admin', bg: '#111827', color: 'white' },
    premium: { label: 'premium', bg: '#a78bfa', color: '#111827' },
    user: { label: 'user', bg: '#e5e7eb', color: '#374151' }
  }
  const tier = tiers[role] || tiers.user
  return (
    <span
      style={{
        fontSize: '0.7rem',
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
