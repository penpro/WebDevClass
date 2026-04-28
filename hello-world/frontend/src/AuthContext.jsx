import { createContext, useContext, useEffect, useState } from 'react'
import { apiFetch } from './lib/api.js'

const AuthContext = createContext(null)

const DEFAULT_MAINTENANCE = { enabled: false, message: null, enabledAt: null }

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  // Mirrors the backend's maintenance flag so any page can show a
  // banner / overlay without doing its own polling. Hydrated by /me on
  // mount and subsequently updated by window events that lib/api.js
  // dispatches when API calls return 503 with maintenance: true.
  const [maintenance, setMaintenance] = useState(DEFAULT_MAINTENANCE)

  // On first render, ask the backend who we are. This runs once per page
  // load and hydrates the shared user state that every page reads from.
  useEffect(() => {
    let cancelled = false
    apiFetch('/auth/me')
      .then((data) => {
        if (cancelled) return
        setUser(data?.user || null)
        if (data && data.maintenance) {
          setMaintenance({
            enabled: !!data.maintenance.enabled,
            message: data.maintenance.message || null,
            enabledAt: data.maintenance.enabledAt || null
          })
        }
      })
      .catch(() => {
        if (!cancelled) setUser(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Listen for maintenance state updates broadcast from lib/api.js. The
  // SPA stays in sync without polling: any time an API call comes back
  // with a 503 maintenance response, or any time it succeeds while the
  // SPA thinks maintenance is on (so we know it's over), api.js fires
  // an `app:maintenance` event and we update.
  useEffect(() => {
    function onMaintenance(event) {
      const next = event.detail || DEFAULT_MAINTENANCE
      setMaintenance({
        enabled: !!next.enabled,
        message: next.message || null,
        enabledAt: next.enabledAt || null
      })
    }
    window.addEventListener('app:maintenance', onMaintenance)
    return () => window.removeEventListener('app:maintenance', onMaintenance)
  }, [])

  async function login(email, password) {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    })
    setUser(data.user)
    return data.user
  }

  async function register(email, password) {
    const data = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    })
    setUser(data.user)
    return data.user
  }

  async function logout() {
    await apiFetch('/auth/logout', { method: 'POST' })
    setUser(null)
  }

  const value = { user, loading, login, register, logout, maintenance }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>')
  }
  return ctx
}
