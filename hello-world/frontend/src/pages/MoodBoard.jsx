import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { apiFetch } from '../lib/api.js'

// Shown in place of any image tile whose URL fails to load.
// The file lives in public/ and is served as a static asset by nginx.
const PLACEHOLDER_URL = '/moodboard-placeholder.png'

export default function MoodBoard() {
  const { token } = useParams()

  const [boardData, setBoardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [newUrl, setNewUrl] = useState('')
  const [adding, setAdding] = useState(false)
  const [copied, setCopied] = useState(false)

  const [editingName, setEditingName] = useState(false)
  const [editNameValue, setEditNameValue] = useState('')
  const [savingName, setSavingName] = useState(false)

  // Set of image ids whose `src` failed to load; used to swap in the
  // placeholder. A Set lets multiple failures coexist without re-renders
  // stepping on each other.
  const [brokenImageIds, setBrokenImageIds] = useState(() => new Set())

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    apiFetch(`/boards/${token}`)
      .then((data) => {
        if (!cancelled) setBoardData(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [token])

  async function handleAdd(event) {
    event.preventDefault()
    setError(null)
    const url = newUrl.trim()
    if (!url) return
    setAdding(true)
    try {
      const created = await apiFetch(`/boards/${token}/images`, {
        method: 'POST',
        body: JSON.stringify({ url })
      })
      setBoardData((prev) => ({
        ...prev,
        images: [...prev.images, created]
      }))
      setNewUrl('')
    } catch (err) {
      setError(err.message)
    } finally {
      setAdding(false)
    }
  }

  async function handleRemove(imageId) {
    setError(null)
    try {
      await apiFetch(`/boards/${token}/images/${imageId}`, {
        method: 'DELETE'
      })
      setBoardData((prev) => ({
        ...prev,
        images: prev.images.filter((img) => img.id !== imageId)
      }))
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleCopyShareLink() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // The readonly input below is still selectable as a fallback.
    }
  }

  function startRenamingBoard() {
    setEditNameValue(boardData.board.name)
    setEditingName(true)
  }

  function cancelRenamingBoard() {
    setEditingName(false)
    setEditNameValue('')
  }

  async function saveBoardName() {
    const trimmed = editNameValue.trim()
    if (!trimmed) return
    if (trimmed === boardData.board.name) {
      cancelRenamingBoard()
      return
    }
    setSavingName(true)
    setError(null)
    try {
      const updated = await apiFetch(`/boards/${token}`, {
        method: 'PUT',
        body: JSON.stringify({ name: trimmed })
      })
      setBoardData((prev) => ({
        ...prev,
        board: {
          ...prev.board,
          name: updated.name,
          updated_at: updated.updated_at
        }
      }))
      cancelRenamingBoard()
    } catch (err) {
      setError(err.message)
    } finally {
      setSavingName(false)
    }
  }

  function handleImageError(imageId) {
    setBrokenImageIds((prev) => {
      if (prev.has(imageId)) return prev
      const next = new Set(prev)
      next.add(imageId)
      return next
    })
  }

  if (loading) {
    return (
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <p>Loading board…</p>
      </div>
    )
  }

  if (error && !boardData) {
    return (
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <p style={{ color: 'crimson' }}>{error}</p>
        <p>
          <Link to="/moodboard">← Back to your boards</Link>
        </p>
      </div>
    )
  }

  if (!boardData) return null

  const { board, images, can_edit } = boardData
  const shareUrl =
    typeof window !== 'undefined' ? window.location.href : ''

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      {/*
        Local styles for the hover-to-reveal remove button. Kept inline here
        because the project otherwise uses inline style objects everywhere
        and this is the one spot that actually needs :hover state + a
        `(hover: none)` fallback for touch devices.
      */}
      <style>{`
        .moodboard-tile .moodboard-remove {
          opacity: 0;
          transition: opacity 0.15s ease-in-out;
        }
        .moodboard-tile:hover .moodboard-remove,
        .moodboard-tile:focus-within .moodboard-remove {
          opacity: 1;
        }
        @media (hover: none) {
          .moodboard-tile .moodboard-remove {
            opacity: 0.85;
          }
        }
      `}</style>

      {can_edit && (
        <p style={{ marginBottom: '0.5rem' }}>
          <Link to="/moodboard">← Back to your boards</Link>
        </p>
      )}

      {editingName && can_edit ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1rem'
          }}
        >
          <input
            type="text"
            value={editNameValue}
            onChange={(event) => setEditNameValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') saveBoardName()
              if (event.key === 'Escape') cancelRenamingBoard()
            }}
            maxLength={255}
            autoFocus
            style={{
              flex: 1,
              fontSize: '1.5rem',
              fontWeight: 'bold',
              padding: '0.25rem 0.5rem',
              boxSizing: 'border-box'
            }}
          />
          <button
            type="button"
            onClick={saveBoardName}
            disabled={savingName || !editNameValue.trim()}
          >
            {savingName ? 'Saving…' : 'Save'}
          </button>
          <button type="button" onClick={cancelRenamingBoard}>
            Cancel
          </button>
        </div>
      ) : (
        <h1
          style={{
            marginTop: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            flexWrap: 'wrap'
          }}
        >
          <span>{board.name}</span>
          {can_edit && (
            <button
              type="button"
              onClick={startRenamingBoard}
              title="Rename board"
              style={{
                fontSize: '0.8rem',
                fontWeight: 'normal',
                padding: '0.25rem 0.6rem',
                cursor: 'pointer'
              }}
            >
              Rename
            </button>
          )}
        </h1>
      )}

      {can_edit && (
        <section
          style={{
            border: '1px solid #d1d5db',
            borderRadius: 8,
            padding: '1rem',
            marginBottom: '1rem',
            background: '#f9fafb'
          }}
        >
          <form
            onSubmit={handleAdd}
            style={{
              display: 'flex',
              gap: '0.5rem',
              marginBottom: '0.75rem'
            }}
          >
            <input
              type="url"
              placeholder="Paste an image URL (http or https)"
              value={newUrl}
              onChange={(event) => setNewUrl(event.target.value)}
              style={{
                flex: 1,
                padding: '0.5rem',
                boxSizing: 'border-box'
              }}
            />
            <button type="submit" disabled={adding || !newUrl.trim()}>
              {adding ? 'Adding…' : 'Add'}
            </button>
          </form>

          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'center',
              fontSize: '0.85rem',
              color: '#6b7280'
            }}
          >
            <span style={{ whiteSpace: 'nowrap' }}>Share link:</span>
            <input
              type="text"
              readOnly
              value={shareUrl}
              onFocus={(event) => event.target.select()}
              style={{
                flex: 1,
                padding: '0.25rem 0.5rem',
                fontSize: '0.8rem',
                fontFamily: 'monospace',
                boxSizing: 'border-box'
              }}
            />
            <button type="button" onClick={handleCopyShareLink}>
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </section>
      )}

      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      {images.length === 0 ? (
        <p>
          No images yet
          {can_edit ? '. Paste a URL above to add one.' : '.'}
        </p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '0.75rem'
          }}
        >
          {images.map((image) => {
            const isBroken = brokenImageIds.has(image.id)
            const displaySrc = isBroken ? PLACEHOLDER_URL : image.url
            return (
            <div
              key={image.id}
              className="moodboard-tile"
              style={{
                position: 'relative',
                aspectRatio: '1 / 1',
                borderRadius: 8,
                overflow: 'hidden',
                background: '#e5e7eb'
              }}
            >
              <a
                href={image.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'block',
                  width: '100%',
                  height: '100%'
                }}
                title={isBroken ? `Broken image URL: ${image.url}` : undefined}
              >
                <img
                  src={displaySrc}
                  alt=""
                  loading="lazy"
                  onError={() => handleImageError(image.id)}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block'
                  }}
                />
              </a>
              {can_edit && (
                <button
                  type="button"
                  className="moodboard-remove"
                  onClick={() => handleRemove(image.id)}
                  aria-label="Remove image"
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    border: 'none',
                    background: 'rgba(17, 24, 39, 0.85)',
                    color: 'white',
                    fontSize: 16,
                    fontWeight: 'bold',
                    lineHeight: '1',
                    cursor: 'pointer'
                  }}
                >
                  ×
                </button>
              )}
            </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
