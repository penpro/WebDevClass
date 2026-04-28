// Thin wrapper around fetch() that always talks to /api, always sends the
// session cookie, always posts JSON, and throws an Error with the server's
// error message when the response is not 2xx.
//
// As a side channel, this also keeps the SPA's maintenance-mode banner
// in sync without any polling: every response either confirms maintenance
// is on (503 with maintenance: true) or implicitly confirms it's off (a
// successful response when we previously thought it was on). Both signals
// dispatch an `app:maintenance` window event that AuthContext listens for.

const API_ROOT = '/api'

// Module-scoped flag: true if a previous response told us the site was
// in maintenance mode. We use this to avoid spamming "maintenance: false"
// events on every successful request — we only need to fire one when
// the state actually changes from on -> off.
let lastSeenMaintenance = false

function dispatchMaintenance(state) {
  // state: { enabled: bool, message?: string, enabledAt?: number }
  lastSeenMaintenance = !!state.enabled
  window.dispatchEvent(
    new CustomEvent('app:maintenance', { detail: state })
  )
}

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

  // Maintenance signal: 503 with maintenance:true.
  if (response.status === 503 && data && data.maintenance === true) {
    dispatchMaintenance({
      enabled: true,
      message: data.message || null
    })
  } else if (response.ok && lastSeenMaintenance) {
    // We previously saw maintenance, and now a request succeeded — the
    // backend isn't returning 503s anymore, so the flag must be off.
    // Fire one "all clear" event and stop until the next maintenance.
    dispatchMaintenance({ enabled: false, message: null })
  }

  if (!response.ok) {
    const message =
      (data && data.error) || `Request failed with status ${response.status}`
    throw new Error(message)
  }

  return data
}
