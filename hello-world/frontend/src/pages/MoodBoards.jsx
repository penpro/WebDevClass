import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { apiFetch } from '../lib/api.js'
import { useAuth } from '../AuthContext.jsx'
import Container from '../components/Container.jsx'
import Card from '../components/Card.jsx'
import Button from '../components/Button.jsx'
import HudLabel from '../components/HudLabel.jsx'
import CornerBrackets from '../components/CornerBrackets.jsx'
import {
  colors,
  fonts,
  fontSizes,
  fontWeights,
  radii,
  space
} from '../theme.js'

export default function MoodBoards() {
  const { user, loading } = useAuth()

  const [boards, setBoards] = useState([])
  const [listLoading, setListLoading] = useState(true)
  const [error, setError] = useState(null)

  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (loading || !user) return
    let cancelled = false
    setListLoading(true)
    apiFetch('/boards')
      .then((data) => {
        if (!cancelled) setBoards(data || [])
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setListLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [loading, user])

  if (loading) {
    return (
      <Container narrow style={{ paddingTop: space['3xl'] }}>
        <p style={{ color: colors.textSecondary }}>Loading…</p>
      </Container>
    )
  }
  if (!user) {
    return <Navigate to="/login" state={{ from: '/moodboard' }} replace />
  }

  async function handleCreate(event) {
    event.preventDefault()
    setError(null)
    const name = newName.trim()
    if (!name) return
    setCreating(true)
    try {
      const created = await apiFetch('/boards', {
        method: 'POST',
        body: JSON.stringify({ name })
      })
      setBoards((prev) => [created, ...prev])
      setNewName('')
    } catch (err) {
      setError(err.message)
    } finally {
      setCreating(false)
    }
  }

  async function handleDelete(board) {
    if (!window.confirm(`Delete "${board.name}" and all its images?`)) return
    setError(null)
    try {
      await apiFetch(`/boards/${board.share_token}`, { method: 'DELETE' })
      setBoards((prev) => prev.filter((b) => b.id !== board.id))
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <>
      <section
        style={{
          position: 'relative',
          overflow: 'hidden',
          paddingTop: space['2xl'],
          paddingBottom: space.lg,
          borderBottom: `1px solid ${colors.borderSubtle}`
        }}
      >
        <CornerBrackets size={28} inset={24} />
        <Container narrow style={{ position: 'relative', zIndex: 1 }}>
          <HudLabel tone="magenta">MoodBoard</HudLabel>
          <h1 style={pageTitleStyle}>Image-URL boards, public share links.</h1>
          <p
            style={{
              margin: `${space.md} 0 0`,
              color: colors.textSecondary,
              fontSize: fontSizes.md,
              lineHeight: 1.6,
              maxWidth: '60ch'
            }}
          >
            Create a board, paste image URLs, share the link. No photos
            are uploaded or stored on the server — tiles load directly
            from their original hosts.
          </p>
        </Container>
      </section>

      <Container narrow style={{ paddingTop: space.xl, paddingBottom: space['3xl'] }}>
        <Card style={{ marginBottom: space.lg }}>
          <h2
            style={{
              fontFamily: fonts.heading,
              fontSize: fontSizes.lg,
              fontWeight: fontWeights.semibold,
              color: colors.text,
              margin: `0 0 ${space.md}`
            }}
          >
            New board
          </h2>
          <form
            onSubmit={handleCreate}
            style={{ display: 'flex', gap: space.sm, flexWrap: 'wrap' }}
          >
            <input
              type="text"
              placeholder="Board name (e.g. Autumn photoshoot)"
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              maxLength={255}
              style={{
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
              }}
            />
            <Button
              type="submit"
              disabled={creating || !newName.trim()}
            >
              {creating ? 'Creating…' : 'Create →'}
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

        {listLoading ? (
          <p style={{ color: colors.textSecondary }}>Loading boards…</p>
        ) : boards.length === 0 ? (
          <p style={{ color: colors.textSecondary }}>
            No boards yet. Create your first one above.
          </p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {boards.map((board) => (
              <li key={board.id} style={{ marginBottom: space.md }}>
                <Card
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: space.md,
                    flexWrap: 'wrap'
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Link
                      to={`/moodboard/${board.share_token}`}
                      style={{
                        fontFamily: fonts.heading,
                        fontSize: fontSizes.md,
                        fontWeight: fontWeights.semibold,
                        textDecoration: 'none',
                        color: colors.text
                      }}
                    >
                      {board.name}
                    </Link>
                    <div
                      style={{
                        fontSize: fontSizes.xs,
                        color: colors.textMuted,
                        marginTop: space.xs,
                        fontFamily: fonts.mono
                      }}
                    >
                      {board.image_count}{' '}
                      {board.image_count === 1 ? 'image' : 'images'} ·
                      updated{' '}
                      {new Date(board.updated_at).toLocaleString()}
                    </div>
                  </div>
                  <Button
                    as={Link}
                    to={`/moodboard/${board.share_token}`}
                    size="sm"
                    variant="secondary"
                  >
                    Open
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(board)}
                    style={{ color: colors.danger }}
                  >
                    Delete
                  </Button>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </>
  )
}

const pageTitleStyle = {
  fontFamily: fonts.heading,
  fontSize: 'clamp(2rem, 4vw, 3rem)',
  fontWeight: fontWeights.bold,
  lineHeight: 1.1,
  letterSpacing: '-0.02em',
  margin: `${space.md} 0 0`,
  color: colors.text
}
