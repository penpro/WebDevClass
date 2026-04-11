// Thin wrapper around fetch() that always talks to /api, always sends the
// session cookie, always posts JSON, and throws an Error with the server's
// error message when the response is not 2xx.

const API_ROOT = '/api'

export async function apiFetch(path, options = {}) {
  const init = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  }

  const response = await fetch(`${API_ROOT}${path}`, init)

  const text = await response.text()
  let data = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      // Non-JSON body; leave data as null.
    }
  }

  if (!response.ok) {
    const message =
      (data && data.error) || `Request failed with status ${response.status}`
    throw new Error(message)
  }

  return data
}
