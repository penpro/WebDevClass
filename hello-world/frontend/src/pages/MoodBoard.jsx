import { useEffect, useState, useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import { apiFetch } from '../lib/api.js'
import { generateCollage } from '../lib/collage.js'

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

  // Collage generation state:
  //   null        — idle (no overlay)
  //   'generating' — loading images + drawing canvas
  //   { previewUrl, canvas, included, skipped } — ready for download
  const [collageState, setCollageState] = useState(null)

  // Collage style options (persisted in component state between generates)
  const [collageGap, setCollageGap] = useState('12')
  const [collageCorners, setCollageCorners] = useState('12')
  const [collageTheme, setCollageTheme] = useState('dark')

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

  // --- collage ---

  const cleanupCollage = useCallback(() => {
    setCollageState((prev) => {
      if (prev && typeof prev === 'object' && prev.previewUrl) {
        URL.revokeObjectURL(prev.previewUrl)
      }
      return null
    })
  }, [])

  // Revoke any blob URL on unmount (navigating away without closing)
  useEffect(() => cleanupCollage, [cleanupCollage])

  async function handleCreateCollage() {
    if (!boardData || boardData.images.length === 0) return
    setCollageState('generating')
    try {
      const urls = boardData.images.map((img) => img.url)
      const result = await generateCollage(urls, token, {
        gap: Number(collageGap),
        cornerRadius: Number(collageCorners),
        theme: collageTheme
      })
      // Low-quality data URL for the preview (small transfer to <img>);
      // the full-quality blob is created on demand at download time.
      const previewUrl = result.canvas.toDataURL('image/jpeg', 0.5)
      setCollageState({
        canvas: result.canvas,
        previewUrl,
        included: result.included,
        skipped: result.skipped
      })
    } catch (err) {
      setCollageState(null)
      setError(err.message)
    }
  }

  function handleDownloadCollage() {
    if (!collageState || !collageState.canvas) return
    collageState.canvas.toBlob(
      (blob) => {
        if (!blob) return
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `moodboard-collage-${token.slice(0, 8)}.jpg`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        // Small delay before revoking so the browser has time to start
        // the download; the blob stays alive until the save completes.
        setTimeout(() => URL.revokeObjectURL(url), 5000)
      },
      'image/jpeg',
      0.92
    )
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

      {/* --- Collage options + button --- */}
      {images.length > 0 && !collageState && (
        <div
          style={{
            marginTop: '1.5rem',
            border: '1px solid #d1d5db',
            borderRadius: 8,
            padding: '1rem',
            background: '#f9fafb'
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: '1rem',
              flexWrap: 'wrap',
              alignItems: 'center',
              marginBottom: '0.75rem'
            }}
          >
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem' }}>
              Padding
              <select
                value={collageGap}
                onChange={(e) => setCollageGap(e.target.value)}
                style={{ padding: '0.3rem' }}
              >
                <option value="0">None</option>
                <option value="6">Thin</option>
                <option value="12">Medium</option>
                <option value="24">Thick</option>
                <option value="36">Extra thick</option>
              </select>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem' }}>
              Corners
              <select
                value={collageCorners}
                onChange={(e) => setCollageCorners(e.target.value)}
                style={{ padding: '0.3rem' }}
              >
                <option value="0">Sharp</option>
                <option value="8">Slight</option>
                <option value="16">Rounded</option>
                <option value="28">Very rounded</option>
              </select>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem' }}>
              Theme
              <select
                value={collageTheme}
                onChange={(e) => setCollageTheme(e.target.value)}
                style={{ padding: '0.3rem' }}
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
              </select>
            </label>
          </div>

          <div style={{ textAlign: 'center' }}>
            <button
              type="button"
              onClick={handleCreateCollage}
              style={{
                padding: '0.6rem 1.5rem',
                fontSize: '1rem',
                cursor: 'pointer'
              }}
            >
              Create Collage
            </button>
          </div>
        </div>
      )}

      {/* --- Collage generating spinner --- */}
      {collageState === 'generating' && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
        >
          <div
            style={{
              background: 'white',
              borderRadius: 12,
              padding: '2rem',
              textAlign: 'center',
              maxWidth: 400
            }}
          >
            <p style={{ fontSize: '1.1rem', margin: 0 }}>
              Generating collage…
            </p>
            <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
              Loading and arranging images
            </p>
          </div>
        </div>
      )}

      {/* --- Collage ready overlay --- */}
      {collageState && typeof collageState === 'object' && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
            overflowY: 'auto'
          }}
        >
          <div
            style={{
              background: 'white',
              borderRadius: 12,
              padding: '1.5rem',
              maxWidth: 500,
              width: '100%',
              textAlign: 'center'
            }}
          >
            <img
              src={collageState.previewUrl}
              alt="Collage preview"
              style={{
                width: '100%',
                borderRadius: 8,
                border: '1px solid #d1d5db',
                marginBottom: '1rem'
              }}
            />
            <p style={{ fontSize: '0.85rem', color: '#6b7280' }}>
              {collageState.included} of{' '}
              {collageState.included + collageState.skipped} images included
              {collageState.skipped > 0 && (
                <span>
                  {' '}
                  ({collageState.skipped} could not be loaded due to
                  cross-origin restrictions)
                </span>
              )}
            </p>
            <p
              style={{
                fontSize: '0.85rem',
                color: '#b45309',
                fontStyle: 'italic',
                margin: '0.75rem 0'
              }}
            >
              Collage ready for download — do not refresh before downloading
              or collage will need to be regenerated
            </p>
            <div
              style={{
                display: 'flex',
                gap: '0.75rem',
                justifyContent: 'center',
                marginTop: '1rem'
              }}
            >
              <button
                type="button"
                onClick={handleDownloadCollage}
                style={{
                  padding: '0.5rem 1.5rem',
                  background: '#111827',
                  color: 'white',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                Download
              </button>
              <button
                type="button"
                onClick={cleanupCollage}
                style={{
                  padding: '0.5rem 1.5rem',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
