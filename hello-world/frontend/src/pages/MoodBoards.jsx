import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { apiFetch } from '../lib/api.js'
import { useAuth } from '../AuthContext.jsx'

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

  if (loading) return <p>Loading…</p>
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
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <h1>MoodBoard</h1>
      <p style={{ color: '#6b7280' }}>
        Create a board, paste image URLs, share the link with anyone. No photos
        are uploaded or stored on the server — tiles load directly from their
        original hosts.
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
        <h2 style={{ marginTop: 0, fontSize: '1.1rem' }}>New board</h2>
        <form
          onSubmit={handleCreate}
          style={{ display: 'flex', gap: '0.5rem' }}
        >
          <input
            type="text"
            placeholder="Board name (e.g. Autumn photoshoot)"
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            maxLength={255}
            style={{
              flex: 1,
              padding: '0.5rem',
              boxSizing: 'border-box'
            }}
          />
          <button type="submit" disabled={creating || !newName.trim()}>
            {creating ? 'Creating…' : 'Create'}
          </button>
        </form>
      </section>

      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      {listLoading ? (
        <p>Loading boards…</p>
      ) : boards.length === 0 ? (
        <p>No boards yet. Create your first one above.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {boards.map((board) => (
            <li
              key={board.id}
              style={{
                border: '1px solid #d1d5db',
                borderRadius: 8,
                padding: '1rem',
                marginBottom: '0.75rem',
                background: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <Link
                  to={`/moodboard/${board.share_token}`}
                  style={{
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    textDecoration: 'none',
                    color: '#111827'
                  }}
                >
                  {board.name}
                </Link>
                <div
                  style={{
                    fontSize: '0.85rem',
                    color: '#6b7280',
                    marginTop: '0.25rem'
                  }}
                >
                  {board.image_count}{' '}
                  {board.image_count === 1 ? 'image' : 'images'} · Updated{' '}
                  {new Date(board.updated_at).toLocaleString()}
                </div>
              </div>
              <Link to={`/moodboard/${board.share_token}`}>
                <button type="button">Open</button>
              </Link>
              <button type="button" onClick={() => handleDelete(board)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
