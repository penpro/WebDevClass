import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiFetch } from '../lib/api.js'
import { useAuth } from '../AuthContext.jsx'

export default function Home() {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    apiFetch('/messages')
      .then((data) => setMessages(data || []))
      .catch((err) => setError(err.message))
  }, [])

  return (
    <div>
      <h1>Hello, World!</h1>
      <p>This site is being used as a showcase for web development projects.</p>

      {user ? (
        <section style={{ marginBottom: '2rem' }}>
          <h2>Your apps</h2>
          <ul>
            <li>
              <Link to="/quicknotes">QuickNotes</Link> — jot notes, saved to
              your account.
            </li>
          </ul>
          <p>
            <a href="/apps/apps.html">See the full Mini Apps Showcase</a>
          </p>
        </section>
      ) : (
        <p>
          You are not signed in yet.{' '}
          <Link to="/login">Log in</Link> or{' '}
          <Link to="/register">create an account</Link> to use the apps.{' '}
          <a href="/apps/apps.html">Browse the showcase</a>.
        </p>
      )}

      <h2>Messages from MySQL through Node</h2>
      {error && <p style={{ color: 'crimson' }}>Failed to load: {error}</p>}
      <ul>
        {messages.map((message) => (
          <li key={message.id}>{message.text}</li>
        ))}
      </ul>
    </div>
  )
}
