import { useEffect, useState } from 'react'
import { listTodos, addTodo } from './api.js'

export default function App() {
  const [todos, setTodos] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [adding, setAdding] = useState(false)

  async function refresh() {
    setError(null)
    try {
      const data = await listTodos()
      setTodos(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  async function handleAdd(event) {
    event.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return
    setAdding(true)
    setError(null)
    try {
      await addTodo(trimmed)
      setText('')
      await refresh()
    } catch (err) {
      setError(err.message)
    } finally {
      setAdding(false)
    }
  }

  return (
    <div
      style={{
        maxWidth: 560,
        margin: '2rem auto',
        fontFamily: 'system-ui, sans-serif',
        padding: '0 1rem',
        color: '#111827'
      }}
    >
      <h1 style={{ marginBottom: '0.25rem' }}>Serverless Todo</h1>
      <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: 0 }}>
        React on S3 → API Gateway HTTP API → Lambda → DynamoDB. Same idea
        as a traditional server stack; completely different architectural
        shape underneath.
      </p>

      <form
        onSubmit={handleAdd}
        style={{ display: 'flex', gap: '0.5rem', margin: '1rem 0' }}
      >
        <input
          type="text"
          placeholder="Add a todo…"
          value={text}
          onChange={(event) => setText(event.target.value)}
          disabled={adding}
          style={{
            flex: 1,
            padding: '0.5rem 0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: 4,
            fontSize: '1rem'
          }}
        />
        <button
          type="submit"
          disabled={adding || !text.trim()}
          style={{
            background: '#4f46e5',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: 4,
            fontWeight: 'bold',
            cursor: adding || !text.trim() ? 'not-allowed' : 'pointer',
            opacity: adding || !text.trim() ? 0.5 : 1
          }}
        >
          {adding ? 'Adding…' : 'Add'}
        </button>
      </form>

      {error && (
        <p
          style={{
            color: '#991b1b',
            background: '#fef2f2',
            padding: '0.5rem 0.75rem',
            borderRadius: 4,
            border: '1px solid #fca5a5',
            fontSize: '0.9rem'
          }}
        >
          {error}
        </p>
      )}

      {loading ? (
        <p style={{ color: '#6b7280' }}>Loading…</p>
      ) : todos.length === 0 ? (
        <p style={{ color: '#6b7280' }}>No todos yet. Add one above.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {todos.map((t) => (
            <li
              key={t.id}
              style={{
                padding: '0.6rem 0.75rem',
                marginBottom: '0.4rem',
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: 4,
                display: 'flex',
                justifyContent: 'space-between',
                gap: '0.5rem'
              }}
            >
              <span>{t.text}</span>
              <span
                style={{
                  fontSize: '0.7rem',
                  color: '#9ca3af',
                  whiteSpace: 'nowrap'
                }}
              >
                {new Date(t.created_at).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
