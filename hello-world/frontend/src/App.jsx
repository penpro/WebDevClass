import { useEffect, useState } from 'react'

export default function App() {
  const [messages, setMessages] = useState([])

  useEffect(() => {
    fetch('/api/messages')
      .then((response) => response.json())
      .then((data) => setMessages(data))
      .catch((error) => console.error('Failed to fetch messages:', error))
  }, [])

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '2rem', lineHeight: '1.6' }}>
      <h1>Hello, World!</h1>
      <p>This site is being used as a showcase for web development projects.</p>

      <p>
        <a href="/apps/apps.html">View Mini Apps Showcase</a>
      </p>

      <h2>Messages from MySQL through Node</h2>
      <ul>
        {messages.map((message) => (
          <li key={message.id}>{message.text}</li>
        ))}
      </ul>
    </div>
  )
}