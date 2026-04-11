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
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '2rem' }}>
      <h1>Hello, World!</h1>
      <p>Messages coming from MySQL through Node:</p>
      <ul>
        {messages.map((message) => (
          <li key={message.id}>{message.text}</li>
        ))}
      </ul>
    </div>
  )
}
