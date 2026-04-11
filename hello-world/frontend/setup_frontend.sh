#!/usr/bin/env bash
set -e

rm -f stub.text.txt

cat > package.json <<'PKG'
{
  "name": "hello-world-frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "build": "vite build"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.4",
    "vite": "^7.1.0"
  }
}
PKG

cat > vite.config.js <<'VITE'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()]
})
VITE

mkdir -p src

cat > index.html <<'HTML'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Hello World App</title>
    <script type="module" src="/src/main.jsx"></script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
HTML

cat > src/main.jsx <<'MAIN'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
MAIN

cat > src/App.jsx <<'APP'
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
APP

npm install
npm run build
ls -la dist
