import { useState, useEffect } from 'react'
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
  // M:O crash-log delete state: 'idle' | 'deleting' | 'deleted' | 'error'
  const [crashDeleteState, setCrashDeleteState] = useState('idle')
  const [crashDeleteMessage, setCrashDeleteMessage] = useState(null)
  // null = not yet loaded; object = { crash_count, total_bytes, latest_iso };
  // 'error' = fetch failed; refetched after a successful delete.
  const [crashStats, setCrashStats] = useState(null)

  // Load the crash stats once on mount for super_admins.  Must live above
  // the early-return guards below so hook order stays stable across
  // renders (rules-of-hooks); the super_admin gate is inline on user.role
  // since `isSuperAdmin` isn't derived until after the guards.
  useEffect(() => {
    if (user?.role !== 'super_admin') return
    let cancelled = false
    ;(async () => {
      try {
        const res = await apiFetch('/api/admin/crashes/count')
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        if (!cancelled) setCrashStats(data)
      } catch (err) {
        console.error('Crash stats fetch failed:', err)
        if (!cancelled) setCrashStats('error')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [user?.role])

  async function refreshCrashStats() {
    try {
      const res = await apiFetch('/api/admin/crashes/count')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setCrashStats(await res.json())
    } catch (err) {
      console.error('Crash stats refetch failed:', err)
      setCrashStats('error')
    }
  }

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

  async function handleDeleteCrashes() {
    const confirmed = window.confirm(
      'Delete every crash bundle on the server? This is irreversible — make sure you have already downloaded any logs you need.'
    )
    if (!confirmed) return

    setCrashDeleteState('deleting')
    setCrashDeleteMessage(null)
    try {
      const res = await apiFetch('/api/admin/crashes', { method: 'DELETE' })
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }
      const data = await res.json()
      setCrashDeleteState('deleted')
      setCrashDeleteMessage(`Deleted ${data.files_deleted} file${data.files_deleted === 1 ? '' : 's'}.`)
      refreshCrashStats()
    } catch (err) {
      console.error('Crash delete failed:', err)
      setCrashDeleteState('error')
      setCrashDeleteMessage(`Delete failed: ${err.message}`)
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

          {/* M:O crash logs — super_admin only.  The download is a plain
              same-origin anchor so the session cookie rides along and the
              browser handles the streamed tar.gz natively; the delete
              calls the JSON endpoint with a confirm prompt. */}
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
                  Metaverse: Origins crash logs
                </div>
                <div
                  style={{
                    fontSize: fontSizes.sm,
                    color: colors.textSecondary,
                    lineHeight: 1.55,
                    maxWidth: '52ch'
                  }}
                >
                  CrashReportClient bundles received from the live game.
                  Download as a single gzipped tar (organized by app
                  version + date) for analysis in WinDbg / Visual Studio,
                  or wipe the directory once you&apos;re done.
                </div>
                <div
                  style={{
                    marginTop: space.sm,
                    fontFamily: fonts.mono,
                    fontSize: fontSizes.xs,
                    color: colors.textMuted,
                    letterSpacing: '0.04em'
                  }}
                >
                  {crashStats === null && 'Counting…'}
                  {crashStats === 'error' && 'Stats unavailable'}
                  {crashStats &&
                    typeof crashStats === 'object' &&
                    (crashStats.crash_count === 0
                      ? 'No crashes on disk yet'
                      : `${crashStats.crash_count} crash${crashStats.crash_count === 1 ? '' : 'es'} · ${formatBytes(crashStats.total_bytes)} · latest ${formatLatest(crashStats.latest_iso)}`)}
                </div>
                {crashDeleteMessage && (
                  <div
                    style={{
                      marginTop: space.sm,
                      fontSize: fontSizes.sm,
                      color:
                        crashDeleteState === 'error'
                          ? colors.danger
                          : colors.accent
                    }}
                  >
                    {crashDeleteMessage}
                  </div>
                )}
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: space.sm,
                  flexWrap: 'wrap'
                }}
              >
                <Button as="a" href="/api/admin/crashes/archive">
                  Download M:O crash logs ↓
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleDeleteCrashes}
                  disabled={crashDeleteState === 'deleting'}
                >
                  {crashDeleteState === 'deleting'
                    ? 'Deleting…'
                    : 'Delete logs'}
                </Button>
              </div>
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

function formatBytes(n) {
  if (typeof n !== 'number' || n < 0) return '0 B'
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`
  return `${(n / 1024 / 1024 / 1024).toFixed(2)} GB`
}

function formatLatest(iso) {
  if (!iso) return 'never'
  const ms = Date.now() - new Date(iso).getTime()
  if (ms < 60 * 1000) return 'just now'
  if (ms < 60 * 60 * 1000) return `${Math.floor(ms / 60000)}m ago`
  if (ms < 24 * 60 * 60 * 1000) return `${Math.floor(ms / 3600000)}h ago`
  if (ms < 7 * 24 * 60 * 60 * 1000) return `${Math.floor(ms / 86400000)}d ago`
  return new Date(iso).toISOString().slice(0, 10)
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
