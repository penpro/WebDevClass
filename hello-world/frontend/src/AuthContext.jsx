import { createContext, useContext, useEffect, useState } from 'react'
import { apiFetch } from './lib/api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // On first render, ask the backend who we are. This runs once per page
  // load and hydrates the shared user state that every page reads from.
  useEffect(() => {
    let cancelled = false
    apiFetch('/auth/me')
      .then((data) => {
        if (!cancelled) setUser(data?.user || null)
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

  const value = { user, loading, login, register, logout }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>')
  }
  return ctx
}
