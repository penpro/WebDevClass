import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { apiFetch } from '../lib/api.js'
import { useAuth } from '../AuthContext.jsx'

export default function CustomerService() {
  const { user, loading } = useAuth()

  const [query, setQuery] = useState('')
  const [results, setResults] = useState(null) // null = no search yet, [] = searched
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState(null)

  // Per-user-id reset state: 'idle' | 'sending' | 'sent' | 'error'
  const [resetStates, setResetStates] = useState({})

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
  if (user.role !== 'admin') {
    return (
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <h1>Customer Service</h1>
        <p>You do not have access to this tool.</p>
      </div>
    )
  }

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
        account. The email is sent through the same flow as a user's own
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
            const state = resetStates[u.id] || 'idle'
            const disabled = state === 'sending' || state === 'sent'
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
                  {u.role === 'admin' && (
                    <span
                      style={{
                        fontSize: '0.7rem',
                        padding: '0.1rem 0.45rem',
                        borderRadius: 999,
                        background: '#111827',
                        color: 'white',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}
                    >
                      admin
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
                <div style={{ marginTop: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => handleSendReset(u.id)}
                    disabled={disabled}
                  >
                    {resetButtonLabel(u.id)}
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
