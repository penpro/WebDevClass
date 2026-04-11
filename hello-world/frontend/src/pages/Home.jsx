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

      <p>
        {user
          ? `You are signed in as ${user.email}.`
          : 'You are not signed in yet.'}{' '}
        <Link to="/apps/apps.html">View Mini Apps Showcase</Link>
      </p>

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
