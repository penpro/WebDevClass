import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { apiFetch } from '../lib/api.js'
import { useAuth } from '../AuthContext.jsx'

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

  // Load the user's notes once the auth check is done and we know there
  // is a logged-in user.
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

  if (loading) return <p>Loading…</p>
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
      // The server returns the whole row including the new updated_at.
      // Replace in place, but move the updated note to the top to match
      // the server's default sort.
      setNotes((prev) => [updated, ...prev.filter((n) => n.id !== id)])
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
      if (editingId === id) cancelEdit()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <h1>QuickNotes</h1>
      <p style={{ color: '#6b7280' }}>
        Jot things down. Only you can see your notes.
      </p>

      <section
        style={{
          border: '1px solid #d1d5db',
          borderRadius: 8,
          padding: '1rem',
          marginBottom: '2rem',
          background: '#f9fafb'
        }}
      >
        <h2 style={{ marginTop: 0, fontSize: '1.1rem' }}>New note</h2>
        <form onSubmit={handleCreate}>
          <input
            type="text"
            placeholder="Title"
            value={newTitle}
            onChange={(event) => setNewTitle(event.target.value)}
            maxLength={255}
            style={{
              width: '100%',
              padding: '0.5rem',
              marginBottom: '0.5rem',
              boxSizing: 'border-box'
            }}
          />
          <textarea
            placeholder="Write something…"
            value={newBody}
            onChange={(event) => setNewBody(event.target.value)}
            rows={4}
            style={{
              width: '100%',
              padding: '0.5rem',
              marginBottom: '0.5rem',
              fontFamily: 'inherit',
              boxSizing: 'border-box'
            }}
          />
          <button type="submit" disabled={creating}>
            {creating ? 'Creating…' : 'Create note'}
          </button>
        </form>
      </section>

      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      {listLoading ? (
        <p>Loading notes…</p>
      ) : notes.length === 0 ? (
        <p>No notes yet. Create your first one above.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {notes.map((note) => (
            <li
              key={note.id}
              style={{
                border: '1px solid #d1d5db',
                borderRadius: 8,
                padding: '1rem',
                marginBottom: '0.75rem',
                background: 'white'
              }}
            >
              {editingId === note.id ? (
                <>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(event) => setEditTitle(event.target.value)}
                    maxLength={255}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      marginBottom: '0.5rem',
                      boxSizing: 'border-box'
                    }}
                  />
                  <textarea
                    value={editBody}
                    onChange={(event) => setEditBody(event.target.value)}
                    rows={6}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      marginBottom: '0.5rem',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box'
                    }}
                  />
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button type="button" onClick={() => handleSave(note.id)}>
                      Save
                    </button>
                    <button type="button" onClick={cancelEdit}>
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h3 style={{ marginTop: 0, marginBottom: '0.5rem' }}>
                    {note.title}
                  </h3>
                  {note.body && (
                    <p style={{ whiteSpace: 'pre-wrap', marginTop: 0 }}>
                      {note.body}
                    </p>
                  )}
                  <div
                    style={{
                      display: 'flex',
                      gap: '0.5rem',
                      alignItems: 'center'
                    }}
                  >
                    <button type="button" onClick={() => startEdit(note)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(note.id)}
                    >
                      Delete
                    </button>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        color: '#6b7280',
                        marginLeft: 'auto'
                      }}
                    >
                      Updated {new Date(note.updated_at).toLocaleString()}
                    </span>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
