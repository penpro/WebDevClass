import { useEffect, useMemo, useRef, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { apiFetch } from '../lib/api.js'
import { useAuth } from '../AuthContext.jsx'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// Normalize whatever date shape comes back from the API into the
// "YYYY-MM-DD" string that <input type="date"> expects.
function dateForInput(value) {
  if (!value) return ''
  return String(value).slice(0, 10)
}

// Today as "YYYY-MM-DD" in the user's local timezone.
function todayStr() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// Returns the "YYYY-MM-DD" string for N days from today.
function daysFromNow(n) {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + n)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function formatDueLabel(value) {
  if (!value) return null
  const d = dateForInput(value)
  const today = todayStr()
  if (d === today) return 'Due today'
  if (d < today) return `Overdue (${d})`
  return `Due ${d}`
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const FILTER_ALL = 'all'
const FILTER_DUE_SOON = 'due-soon'
const FILTER_COMPLETED = 'completed'

export default function TaskTrackr() {
  const { user, loading } = useAuth()

  const [tasks, setTasks] = useState([])
  const [listLoading, setListLoading] = useState(true)
  const [error, setError] = useState(null)

  const [newTitle, setNewTitle] = useState('')
  const [newCategory, setNewCategory] = useState('General')
  const [creating, setCreating] = useState(false)

  const [filter, setFilter] = useState(FILTER_ALL) // top-tab filter
  const [categoryFilter, setCategoryFilter] = useState(null) // sidebar

  const [editingId, setEditingId] = useState(null)
  const [edits, setEdits] = useState({}) // pending edits for the open task
  const [saveStatus, setSaveStatus] = useState('idle') // idle | saving | saved
  const saveTimerRef = useRef(null)

  // ---------- load tasks once authed ----------
  useEffect(() => {
    if (loading || !user) return
    let cancelled = false
    setListLoading(true)
    apiFetch('/tasks')
      .then((data) => {
        if (!cancelled) setTasks(data || [])
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
    return <Navigate to="/login" state={{ from: '/tasktrackr' }} replace />
  }

  // ---------- derived data ----------
  const categories = useMemo(() => {
    const counts = new Map()
    for (const t of tasks) {
      counts.set(t.category, (counts.get(t.category) || 0) + 1)
    }
    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [tasks])

  const dueSoonCount = useMemo(() => {
    const today = todayStr()
    const cutoff = daysFromNow(7)
    return tasks.filter(
      (t) =>
        !t.completed &&
        t.due_date &&
        dateForInput(t.due_date) >= today &&
        dateForInput(t.due_date) <= cutoff
    ).length
  }, [tasks])

  const completedCount = useMemo(
    () => tasks.filter((t) => t.completed).length,
    [tasks]
  )

  const filteredTasks = useMemo(() => {
    const today = todayStr()
    const cutoff = daysFromNow(7)
    return tasks.filter((t) => {
      // top-tab filter
      if (filter === FILTER_ALL && t.completed) return false
      if (filter === FILTER_DUE_SOON) {
        if (t.completed) return false
        if (!t.due_date) return false
        const d = dateForInput(t.due_date)
        if (d > cutoff) return false
      }
      if (filter === FILTER_COMPLETED && !t.completed) return false
      // sidebar category
      if (categoryFilter && t.category !== categoryFilter) return false
      return true
    })
  }, [tasks, filter, categoryFilter])

  // ---------- mutations ----------

  async function handleCreate(event) {
    event.preventDefault()
    setError(null)
    const title = newTitle.trim()
    if (!title) return
    const category = (newCategory || 'General').trim() || 'General'
    setCreating(true)
    try {
      const created = await apiFetch('/tasks', {
        method: 'POST',
        body: JSON.stringify({ title, category })
      })
      setTasks((prev) => [created, ...prev])
      setNewTitle('')
    } catch (err) {
      setError(err.message)
    } finally {
      setCreating(false)
    }
  }

  async function applyUpdate(id, patch) {
    setSaveStatus('saving')
    try {
      const updated = await apiFetch(`/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(patch)
      })
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)))
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 1200)
    } catch (err) {
      setError(err.message)
      setSaveStatus('idle')
    }
  }

  async function handleToggleCompleted(task) {
    // Immediate save — no debounce for discrete toggles.
    await applyUpdate(task.id, { completed: !task.completed })
  }

  async function handleDelete(task) {
    if (!window.confirm(`Delete "${task.title}"?`)) return
    setError(null)
    try {
      await apiFetch(`/tasks/${task.id}`, { method: 'DELETE' })
      setTasks((prev) => prev.filter((t) => t.id !== task.id))
      if (editingId === task.id) {
        setEditingId(null)
        setEdits({})
      }
    } catch (err) {
      setError(err.message)
    }
  }

  function startEditing(task) {
    // If switching from a different open task, flush pending edits first.
    if (editingId && editingId !== task.id && Object.keys(edits).length > 0) {
      applyUpdate(editingId, edits)
    }
    setEditingId(task.id)
    setEdits({})
    setSaveStatus('idle')
  }

  function closeEditing() {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current)
      saveTimerRef.current = null
    }
    if (editingId && Object.keys(edits).length > 0) {
      applyUpdate(editingId, edits)
    }
    setEditingId(null)
    setEdits({})
  }

  // Update a single field of the currently-edited task.  Text fields
  // (title, description) get an 800ms debounced save; date and category
  // save immediately because they are discrete commits.
  function setEditField(field, value, immediate = false) {
    setEdits((prev) => ({ ...prev, [field]: value }))

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current)
      saveTimerRef.current = null
    }

    if (immediate) {
      const patch = { ...edits, [field]: value }
      applyUpdate(editingId, patch)
      setEdits({})
      return
    }

    saveTimerRef.current = setTimeout(() => {
      const patch = { ...edits, [field]: value }
      applyUpdate(editingId, patch)
      setEdits({})
    }, 800)
  }

  // ---------- render ----------

  return (
    <div style={{ maxWidth: 960, margin: '0 auto' }}>
      <style>{`
        .tt-grid { display: grid; gap: 1.5rem; grid-template-columns: minmax(0, 1fr); }
        @media (min-width: 720px) {
          .tt-grid { grid-template-columns: 220px minmax(0, 1fr); }
        }
        .tt-side-link {
          display: flex; justify-content: space-between; align-items: center;
          padding: 0.4rem 0.6rem; border-radius: 6px;
          cursor: pointer; user-select: none;
          color: #111827; text-decoration: none;
        }
        .tt-side-link:hover { background: #f3f4f6; }
        .tt-side-link.active { background: #111827; color: white; }
        .tt-side-link .count { font-size: 0.8rem; opacity: 0.7; }
      `}</style>

      <h1 style={{ marginTop: 0 }}>TaskTrackr</h1>
      <p style={{ color: '#6b7280' }}>
        Tasks organized by category, with auto-saving edits and due-date
        tracking.
      </p>

      <div className="tt-grid">
        {/* ------------------------------ Sidebar ------------------------------ */}
        <aside>
          <div style={{ marginBottom: '1rem' }}>
            <SideTabs
              filter={filter}
              setFilter={setFilter}
              dueSoonCount={dueSoonCount}
              completedCount={completedCount}
              total={tasks.filter((t) => !t.completed).length}
            />
          </div>

          <div>
            <div
              style={{
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: '#6b7280',
                margin: '0.5rem 0.6rem'
              }}
            >
              Categories
            </div>
            <div
              className={
                'tt-side-link' + (categoryFilter === null ? ' active' : '')
              }
              onClick={() => setCategoryFilter(null)}
            >
              <span>All categories</span>
            </div>
            {categories.map((c) => (
              <div
                key={c.name}
                className={
                  'tt-side-link' +
                  (categoryFilter === c.name ? ' active' : '')
                }
                onClick={() => setCategoryFilter(c.name)}
              >
                <span>{c.name}</span>
                <span className="count">{c.count}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* ------------------------------ Main area ------------------------------ */}
        <main>
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
              onSubmit={handleCreate}
              style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}
            >
              <input
                type="text"
                placeholder="New task title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                maxLength={255}
                style={{
                  flex: '1 1 200px',
                  padding: '0.5rem',
                  boxSizing: 'border-box'
                }}
              />
              <input
                type="text"
                placeholder="Category"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                maxLength={100}
                style={{
                  flex: '0 0 140px',
                  padding: '0.5rem',
                  boxSizing: 'border-box'
                }}
              />
              <button
                type="submit"
                disabled={creating || !newTitle.trim()}
              >
                {creating ? 'Adding…' : 'Add task'}
              </button>
            </form>
          </section>

          {error && <p style={{ color: 'crimson' }}>{error}</p>}

          {listLoading ? (
            <p>Loading tasks…</p>
          ) : filteredTasks.length === 0 ? (
            <p>
              {tasks.length === 0
                ? 'No tasks yet. Add your first one above.'
                : 'No tasks match the current filter.'}
            </p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {filteredTasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  isEditing={editingId === task.id}
                  edits={edits}
                  saveStatus={saveStatus}
                  onToggleCompleted={() => handleToggleCompleted(task)}
                  onClickRow={() => {
                    if (editingId === task.id) {
                      closeEditing()
                    } else {
                      startEditing(task)
                    }
                  }}
                  onChangeField={setEditField}
                  onDelete={() => handleDelete(task)}
                />
              ))}
            </ul>
          )}
        </main>
      </div>

    </div>
  )
}

// ---------------------------------------------------------------------------
// Subcomponents
// ---------------------------------------------------------------------------

function SideTabs({ filter, setFilter, dueSoonCount, completedCount, total }) {
  const items = [
    { key: FILTER_ALL, label: 'All open', count: total },
    { key: FILTER_DUE_SOON, label: 'Due soon', count: dueSoonCount },
    { key: FILTER_COMPLETED, label: 'Completed', count: completedCount }
  ]
  return (
    <div>
      {items.map((item) => (
        <div
          key={item.key}
          className={'tt-side-link' + (filter === item.key ? ' active' : '')}
          onClick={() => setFilter(item.key)}
        >
          <span>{item.label}</span>
          <span className="count">{item.count}</span>
        </div>
      ))}
    </div>
  )
}

function TaskRow({
  task,
  isEditing,
  edits,
  saveStatus,
  onToggleCompleted,
  onClickRow,
  onChangeField,
  onDelete
}) {
  // The displayed value for an edited field is the pending edit if it
  // exists, otherwise the underlying task field.
  const fieldValue = (key, fallback) =>
    Object.prototype.hasOwnProperty.call(edits, key) ? edits[key] : fallback

  const dueLabel = formatDueLabel(task.due_date)

  return (
    <li
      style={{
        border: '1px solid #d1d5db',
        borderRadius: 8,
        padding: '0.75rem 1rem',
        marginBottom: '0.5rem',
        background: 'white'
      }}
    >
      {/* ---- collapsed header row (always visible) ---- */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}
      >
        <input
          type="checkbox"
          checked={!!task.completed}
          onChange={(e) => {
            e.stopPropagation()
            onToggleCompleted()
          }}
          onClick={(e) => e.stopPropagation()}
          style={{ flex: '0 0 auto', cursor: 'pointer' }}
        />
        <div
          style={{ flex: 1, cursor: 'pointer', minWidth: 0 }}
          onClick={onClickRow}
        >
          <div
            style={{
              fontWeight: 'bold',
              textDecoration: task.completed ? 'line-through' : 'none',
              color: task.completed ? '#6b7280' : '#111827',
              wordBreak: 'break-word'
            }}
          >
            {task.title}
          </div>
          <div
            style={{
              fontSize: '0.8rem',
              color: '#6b7280',
              marginTop: '0.15rem',
              display: 'flex',
              gap: '0.5rem',
              flexWrap: 'wrap'
            }}
          >
            {dueLabel && (
              <span
                style={{
                  color:
                    dueLabel.startsWith('Overdue')
                      ? '#b91c1c'
                      : dueLabel === 'Due today'
                      ? '#b45309'
                      : '#6b7280'
                }}
              >
                {dueLabel}
              </span>
            )}
            <span
              style={{
                background: '#e5e7eb',
                color: '#374151',
                padding: '0.05rem 0.45rem',
                borderRadius: 999,
                fontSize: '0.75rem'
              }}
            >
              {task.category}
            </span>
          </div>
        </div>
      </div>

      {/* ---- expanded editor (when this task is the open one) ---- */}
      {isEditing && (
        <div
          style={{
            marginTop: '0.75rem',
            paddingTop: '0.75rem',
            borderTop: '1px dashed #d1d5db'
          }}
        >
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            <span
              style={{
                fontSize: '0.75rem',
                color: '#6b7280',
                display: 'block'
              }}
            >
              Title
            </span>
            <input
              type="text"
              value={fieldValue('title', task.title)}
              onChange={(e) => onChangeField('title', e.target.value)}
              maxLength={255}
              style={{
                width: '100%',
                padding: '0.4rem',
                boxSizing: 'border-box'
              }}
            />
          </label>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            <span
              style={{
                fontSize: '0.75rem',
                color: '#6b7280',
                display: 'block'
              }}
            >
              Description
            </span>
            <textarea
              value={fieldValue('description', task.description || '')}
              onChange={(e) => onChangeField('description', e.target.value)}
              rows={3}
              style={{
                width: '100%',
                padding: '0.4rem',
                boxSizing: 'border-box',
                fontFamily: 'inherit'
              }}
            />
          </label>
          <div
            style={{
              display: 'flex',
              gap: '0.75rem',
              flexWrap: 'wrap',
              marginBottom: '0.5rem'
            }}
          >
            <label>
              <span
                style={{
                  fontSize: '0.75rem',
                  color: '#6b7280',
                  display: 'block'
                }}
              >
                Due date
              </span>
              <input
                type="date"
                value={dateForInput(fieldValue('due_date', task.due_date))}
                onChange={(e) => onChangeField('due_date', e.target.value, true)}
                style={{ padding: '0.3rem' }}
              />
            </label>
            <label style={{ flex: 1, minWidth: 140 }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  color: '#6b7280',
                  display: 'block'
                }}
              >
                Category
              </span>
              <input
                type="text"
                value={fieldValue('category', task.category)}
                onChange={(e) => onChangeField('category', e.target.value)}
                onBlur={(e) => {
                  // Force a save immediately when the user leaves the field.
                  if (e.target.value !== task.category) {
                    onChangeField('category', e.target.value, true)
                  }
                }}
                maxLength={100}
                style={{
                  width: '100%',
                  padding: '0.3rem',
                  boxSizing: 'border-box'
                }}
              />
            </label>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.5rem'
            }}
          >
            <span
              style={{
                fontSize: '0.75rem',
                color:
                  saveStatus === 'saving'
                    ? '#b45309'
                    : saveStatus === 'saved'
                    ? '#15803d'
                    : '#9ca3af'
              }}
            >
              {saveStatus === 'saving'
                ? 'Saving…'
                : saveStatus === 'saved'
                ? 'Saved ✓'
                : 'Auto-saves as you type'}
            </span>
            <button
              type="button"
              onClick={onDelete}
              style={{
                background: 'transparent',
                border: '1px solid #b91c1c',
                color: '#b91c1c',
                padding: '0.25rem 0.6rem',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: '0.85rem'
              }}
            >
              Delete task
            </button>
          </div>
        </div>
      )}
    </li>
  )
}
