import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
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

export default function QuickNotes() {
  const { user, loading } = useAuth()

  const [notes, setNotes] = useState([])
  const [listLoading, setListLoading] = useState(true)
  const [error, setError] = useState(null)

  const [newTitle, setNewTitle] = useState('')
  const [newBody, setNewBody] = useState('')
  const [creating, setCreating] = useState(false)

  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editBody, setEditBody] = useState('')

  useEffect(() => {
    if (loading || !user) return
    let cancelled = false
    setListLoading(true)
    apiFetch('/notes')
      .then((data) => {
        if (!cancelled) setNotes(data || [])
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
    return <Navigate to="/login" state={{ from: '/quicknotes' }} replace />
  }

  async function handleCreate(event) {
    event.preventDefault()
    setError(null)
    setCreating(true)
    try {
      const created = await apiFetch('/notes', {
        method: 'POST',
        body: JSON.stringify({
          title: newTitle || 'Untitled Note',
          body: newBody
        })
      })
      setNotes((prev) => [created, ...prev])
      setNewTitle('')
      setNewBody('')
    } catch (err) {
      setError(err.message)
    } finally {
      setCreating(false)
    }
  }

  function startEdit(note) {
    setEditingId(note.id)
    setEditTitle(note.title)
    setEditBody(note.body || '')
  }

  function cancelEdit() {
    setEditingId(null)
    setEditTitle('')
    setEditBody('')
  }

  async function handleSave(id) {
    setError(null)
    try {
      const updated = await apiFetch(`/notes/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ title: editTitle, body: editBody })
      })
      setNotes((prev) => prev.map((n) => (n.id === id ? updated : n)))
      cancelEdit()
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this note?')) return
    setError(null)
    try {
      await apiFetch(`/notes/${id}`, { method: 'DELETE' })
      setNotes((prev) => prev.filter((n) => n.id !== id))
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
          <HudLabel tone="corona">QuickNotes</HudLabel>
          <h1 style={pageTitleStyle}>Jot things down.</h1>
          <p
            style={{
              margin: `${space.md} 0 0`,
              color: colors.textSecondary,
              fontSize: fontSizes.md,
              lineHeight: 1.6
            }}
          >
            Only you can see your notes. Sessions auth + MySQL foreign
            keys do the rest.
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
            New note
          </h2>
          <form onSubmit={handleCreate}>
            <input
              type="text"
              placeholder="Title"
              value={newTitle}
              onChange={(event) => setNewTitle(event.target.value)}
              maxLength={255}
              style={{ ...inputStyle, marginBottom: space.sm }}
            />
            <textarea
              placeholder="Write something…"
              value={newBody}
              onChange={(event) => setNewBody(event.target.value)}
              rows={4}
              style={{
                ...inputStyle,
                marginBottom: space.sm,
                fontFamily: fonts.body,
                resize: 'vertical'
              }}
            />
            <Button type="submit" disabled={creating}>
              {creating ? 'Creating…' : 'Create note →'}
            </Button>
          </form>
        </Card>

        {error && <ErrorBanner>{error}</ErrorBanner>}

        {listLoading ? (
          <p style={{ color: colors.textSecondary }}>Loading notes…</p>
        ) : notes.length === 0 ? (
          <p style={{ color: colors.textSecondary }}>
            No notes yet. Create your first one above.
          </p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {notes.map((note) => (
              <li key={note.id} style={{ marginBottom: space.md }}>
                <Card>
                  {editingId === note.id ? (
                    <>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(event) => setEditTitle(event.target.value)}
                        maxLength={255}
                        style={{ ...inputStyle, marginBottom: space.sm }}
                      />
                      <textarea
                        value={editBody}
                        onChange={(event) => setEditBody(event.target.value)}
                        rows={6}
                        style={{
                          ...inputStyle,
                          marginBottom: space.sm,
                          fontFamily: fonts.body,
                          resize: 'vertical'
                        }}
                      />
                      <div style={{ display: 'flex', gap: space.sm }}>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => handleSave(note.id)}
                        >
                          Save
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={cancelEdit}
                        >
                          Cancel
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <h3
                        style={{
                          fontFamily: fonts.heading,
                          fontSize: fontSizes.lg,
                          fontWeight: fontWeights.semibold,
                          color: colors.text,
                          margin: `0 0 ${space.sm}`
                        }}
                      >
                        {note.title}
                      </h3>
                      {note.body && (
                        <p
                          style={{
                            whiteSpace: 'pre-wrap',
                            margin: `0 0 ${space.md}`,
                            color: colors.textSecondary,
                            lineHeight: 1.6
                          }}
                        >
                          {note.body}
                        </p>
                      )}
                      <div
                        style={{
                          display: 'flex',
                          gap: space.sm,
                          alignItems: 'center',
                          flexWrap: 'wrap'
                        }}
                      >
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => startEdit(note)}
                        >
                          Edit
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(note.id)}
                          style={{ color: colors.danger }}
                        >
                          Delete
                        </Button>
                        <span
                          style={{
                            fontSize: fontSizes.xs,
                            color: colors.textMuted,
                            marginLeft: 'auto',
                            fontFamily: fonts.mono
                          }}
                        >
                          updated {new Date(note.updated_at).toLocaleString()}
                        </span>
                      </div>
                    </>
                  )}
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

const inputStyle = {
  width: '100%',
  padding: '0.6rem 0.75rem',
  background: colors.bg,
  color: colors.text,
  border: `1px solid ${colors.border}`,
  borderRadius: radii.md,
  fontFamily: fonts.body,
  fontSize: fontSizes.base,
  outline: 'none',
  boxSizing: 'border-box'
}

function ErrorBanner({ children }) {
  return (
    <p
      style={{
        color: colors.danger,
        background: colors.dangerMuted,
        border: `1px solid ${colors.danger}`,
        borderRadius: radii.md,
        padding: `${space.sm} ${space.md}`,
        fontSize: fontSizes.sm,
        margin: `0 0 ${space.md}`
      }}
    >
      {children}
    </p>
  )
}
