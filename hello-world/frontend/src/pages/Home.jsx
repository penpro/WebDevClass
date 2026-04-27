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
      <p style={{ fontStyle: 'italic', color: '#6b7280' }}>Hello Professor Foster!</p>

      <p style={{ marginBottom: '1.5rem' }}>
        <Link to="/api-guide">📘 API Guide</Link> — full reference for every
        endpoint this site exposes, with REST conventions, status codes,
        roles, and rate limits.
      </p>

      {user ? (
        <section style={{ marginBottom: '2rem' }}>
          <h2>Your apps</h2>
          <ul>
            <li>
              <Link to="/quicknotes">QuickNotes</Link> — jot notes, saved to
              your account.
            </li>
            <li>
              <Link to="/moodboard">MoodBoard</Link> — make boards from image
              URLs and share them via a public link.
            </li>
            <li>
              <Link to="/tasktrackr">TaskTrackr</Link> — manage tasks by
              category with due dates and auto-saving edits.
            </li>
            <li>
              {user.role === 'premium' ? (
                <>
                  <Link to="/subscribe">Manage subscription</Link> — your
                  Premium plan, billing date, cancel option.
                </>
              ) : user.role === 'user' ? (
                <>
                  <Link to="/subscribe">Upgrade to Premium</Link> — unlock
                  video uploads on task progress posts (100 MB cap, vs 10 MB
                  images-only for free).
                </>
              ) : (
                <>
                  <Link to="/subscribe">Subscription</Link> — Premium tier
                  signup or management.
                </>
              )}
            </li>
            {(user.role === 'admin' || user.role === 'super_admin') && (
              <li>
                <Link to="/customer-service">Customer Service</Link> — admin
                tool to search users and manually send password reset emails
                {user.role === 'super_admin' && ' (and assign roles)'}.
              </li>
            )}
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
