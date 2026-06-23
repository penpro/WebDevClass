import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { apiFetch } from '../lib/api.js'
import { useAuth } from '../AuthContext.jsx'
import {
  colors,
  fonts,
  fontSizes,
  fontWeights,
  radii,
  space
} from '../theme.js'
import Container from '../components/Container.jsx'
import Card from '../components/Card.jsx'
import Button from '../components/Button.jsx'
import HudLabel from '../components/HudLabel.jsx'
import CornerBrackets from '../components/CornerBrackets.jsx'

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

export default function AdminPortal() {
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

  if (loading) {
    return (
      <Container narrow style={{ paddingTop: space['3xl'] }}>
        <p style={{ color: colors.textSecondary }}>Loading…</p>
      </Container>
    )
  }
  if (!user) {
    return (
      <Navigate to="/login" state={{ from: '/admin-portal' }} replace />
    )
  }
  if (!ADMIN_ROLES.has(user.role)) {
    return (
      <Container narrow style={{ paddingTop: space['3xl'] }}>
        <HudLabel tone="cyan">Admin Portal</HudLabel>
        <h1 style={pageTitleStyle}>You don&apos;t have access to this tool.</h1>
        <p style={{ color: colors.textSecondary, marginTop: space.md }}>
          The Admin Portal is restricted to admin and super-admin users.
        </p>
      </Container>
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
    if (
      !window.confirm(
        `Change ${targetUser.email}'s role from ` +
          `${ROLE_LABELS[targetUser.role]} to ${ROLE_LABELS[newRole]}?`
      )
    ) {
      return
    }

    setError(null)
    setRoleStates((prev) => ({ ...prev, [targetUser.id]: 'saving' }))
    try {
      const updated = await apiFetch(`/admin/users/${targetUser.id}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role: newRole })
      })
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
    <>
      {/* Page hero with HUD chrome, matching the marketing pages. */}
      <section
        style={{
          position: 'relative',
          overflow: 'hidden',
          paddingTop: space['3xl'],
          paddingBottom: space.xl,
          borderBottom: `1px solid ${colors.borderSubtle}`
        }}
      >
        <CornerBrackets size={28} inset={24} />
        <Container narrow style={{ position: 'relative', zIndex: 1 }}>
          <HudLabel tone="corona" live>
            Admin portal
          </HudLabel>
          <h1 style={pageTitleStyle}>User search &amp; password resets.</h1>
          <p
            style={{
              margin: `${space.md} 0 0`,
              color: colors.textSecondary,
              fontSize: fontSizes.md,
              lineHeight: 1.6
            }}
          >
            Admin tools for the site. Search users below to send password
            resets{isSuperAdmin && ' or change roles'}.
          </p>
        </Container>
      </section>

      <section style={{ paddingTop: space['2xl'], paddingBottom: space['3xl'] }}>
        <Container narrow>
          {/* Diagnostics jump card — super_admin only */}
          {isSuperAdmin && (
            <Card
              variant="accent"
              style={{
                marginBottom: space.xl,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: space.md,
                flexWrap: 'wrap'
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: fonts.heading,
                    fontWeight: fontWeights.semibold,
                    color: colors.text,
                    fontSize: fontSizes.md,
                    marginBottom: space.xs
                  }}
                >
                  Diagnostics &amp; Tests
                </div>
                <div
                  style={{
                    fontSize: fontSizes.sm,
                    color: colors.textSecondary,
                    lineHeight: 1.55,
                    maxWidth: '52ch'
                  }}
                >
                  Run k6 load tests against this server with live charts and
                  CPU/memory readouts. Lets you toggle the rate limiter and
                  maintenance banner at runtime.
                </div>
              </div>
              <Button as={Link} to="/admin-portal/diagnostics">
                Open Diagnostics →
              </Button>
            </Card>
          )}

          <SectionTitle>User search</SectionTitle>

          <Card style={{ marginBottom: space.lg }}>
            <form
              onSubmit={handleSearch}
              style={{ display: 'flex', gap: space.sm, flexWrap: 'wrap' }}
            >
              <input
                type="text"
                placeholder="Search user email (substring match)"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                style={inputStyle}
              />
              <Button
                type="submit"
                disabled={searching || !query.trim()}
                size="md"
              >
                {searching ? 'Searching…' : 'Search'}
              </Button>
            </form>
          </Card>

          {error && (
            <p
              style={{
                color: colors.danger,
                background: colors.dangerMuted,
                border: `1px solid ${colors.danger}`,
                borderRadius: radii.md,
                padding: `${space.sm} ${space.md}`,
                fontSize: fontSizes.sm,
                margin: `0 0 ${space.lg}`
              }}
            >
              {error}
            </p>
          )}

          {results === null ? (
            <p style={{ color: colors.textMuted, fontSize: fontSizes.sm }}>
              Enter a search term above to look up users.
            </p>
          ) : results.length === 0 ? (
            <p style={{ color: colors.textSecondary }}>
              No users matched that search.
            </p>
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
                  <li key={u.id} style={{ marginBottom: space.md }}>
                    <Card>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: space.sm,
                          flexWrap: 'wrap'
                        }}
                      >
                        <strong
                          style={{
                            fontSize: fontSizes.md,
                            color: colors.text,
                            fontFamily: fonts.body
                          }}
                        >
                          {u.email}
                        </strong>
                        <RoleBadge role={u.role} />
                        {isSelf && (
                          <span
                            style={{
                              fontSize: fontSizes.xs,
                              color: colors.textMuted,
                              fontStyle: 'italic'
                            }}
                          >
                            (you)
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          fontSize: fontSizes.xs,
                          color: colors.textMuted,
                          marginTop: space.xs,
                          fontFamily: fonts.mono
                        }}
                      >
                        created {new Date(u.created_at).toLocaleString()}
                        {' · '}
                        last login{' '}
                        {u.last_login_at
                          ? new Date(u.last_login_at).toLocaleString()
                          : 'never'}
                      </div>

                      <div
                        style={{
                          marginTop: space.md,
                          display: 'flex',
                          gap: space.sm,
                          flexWrap: 'wrap',
                          alignItems: 'center'
                        }}
                      >
                        <Button
                          variant={resetState === 'sent' ? 'secondary' : 'primary'}
                          size="sm"
                          onClick={() => handleSendReset(u.id)}
                          disabled={resetDisabled}
                        >
                          {resetButtonLabel(u.id)}
                        </Button>

                        {isSuperAdmin && !isSelf && (
                          <>
                            <span
                              style={{
                                color: colors.borderSubtle,
                                fontSize: fontSizes.sm
                              }}
                            >
                              |
                            </span>
                            <label
                              style={{
                                fontSize: fontSizes.sm,
                                color: colors.textSecondary,
                                display: 'flex',
                                gap: space.xs,
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
                                style={selectStyle}
                              >
                                {ROLE_OPTIONS.map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                            </label>
                            <Button
                              size="sm"
                              variant={
                                roleState === 'saved' ? 'secondary' : 'primary'
                              }
                              disabled={!roleChanged || roleState === 'saving'}
                              onClick={() => handleChangeRole(u)}
                            >
                              {roleState === 'saving'
                                ? 'Saving…'
                                : roleState === 'saved'
                                ? 'Saved ✓'
                                : 'Apply'}
                            </Button>
                          </>
                        )}
                      </div>
                    </Card>
                  </li>
                )
              })}
            </ul>
          )}
        </Container>
      </section>
    </>
  )
}

// ----------------------------- shared bits ----------------------------- //

const pageTitleStyle = {
  fontFamily: fonts.heading,
  fontSize: 'clamp(2rem, 4vw, 3rem)',
  fontWeight: fontWeights.bold,
  lineHeight: 1.1,
  letterSpacing: '-0.02em',
  margin: `${space.md} 0 0`,
  color: colors.text
}

const inputStyle = {
  flex: 1,
  minWidth: '12rem',
  padding: '0.6rem 0.75rem',
  background: colors.bg,
  color: colors.text,
  border: `1px solid ${colors.border}`,
  borderRadius: radii.md,
  fontFamily: fonts.body,
  fontSize: fontSizes.base,
  outline: 'none'
}

const selectStyle = {
  background: colors.bg,
  color: colors.text,
  border: `1px solid ${colors.border}`,
  borderRadius: radii.sm,
  padding: '0.3rem 0.5rem',
  fontFamily: fonts.body,
  fontSize: fontSizes.sm,
  cursor: 'pointer'
}

function SectionTitle({ children }) {
  return (
    <h2
      style={{
        fontFamily: fonts.heading,
        fontSize: fontSizes.lg,
        fontWeight: fontWeights.semibold,
        color: colors.text,
        margin: `0 0 ${space.md}`
      }}
    >
      {children}
    </h2>
  )
}

function RoleBadge({ role }) {
  const tiers = {
    super_admin: { label: 'super admin', bg: colors.accent, fg: '#04221b' },
    admin: { label: 'admin', bg: colors.success, fg: '#04221b' },
    premium: { label: 'premium', bg: colors.cyan, fg: '#04222a' },
    user: { label: 'user', bg: colors.surfaceHover, fg: colors.textSecondary }
  }
  const tier = tiers[role] || tiers.user
  return (
    <span
      style={{
        fontSize: fontSizes.xs,
        padding: '0.15rem 0.5rem',
        borderRadius: radii.full,
        background: tier.bg,
        color: tier.fg,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        fontWeight: fontWeights.bold,
        fontFamily: fonts.body
      }}
    >
      {tier.label}
    </span>
  )
}
