// Where the API lives. The API Gateway invoke URL is baked in at build
// time via Vite's env-var support — production uses .env.production,
// local dev uses .env.local. The actual file is gitignored; commit
// .env.example to document the format.
//
// Example value (replace abc123 with your real API id):
//   VITE_API_URL=https://abc123.execute-api.us-east-1.amazonaws.com

const API_URL = import.meta.env.VITE_API_URL || ''

if (!API_URL) {
  // eslint-disable-next-line no-console
  console.warn(
    'VITE_API_URL is not set. The app will fail to fetch. Set it in ' +
      '.env.local (dev) or .env.production (build) before npm run build.'
  )
}

export async function listTodos() {
  const r = await fetch(`${API_URL}/todos`)
  if (!r.ok) throw new Error(`GET /todos failed (${r.status})`)
  return r.json()
}

export async function addTodo(text) {
  const r = await fetch(`${API_URL}/todos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  })
  if (!r.ok) {
    let detail = ''
    try {
      const body = await r.json()
      detail = body?.error ? ` — ${body.error}` : ''
    } catch {
      // ignore non-JSON error bodies
    }
    throw new Error(`POST /todos failed (${r.status})${detail}`)
  }
  return r.json()
}
