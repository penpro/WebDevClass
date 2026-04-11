import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { apiFetch } from '../lib/api.js'

const MIN_PASSWORD_LENGTH = 8

export default function ResetPassword() {
  const [params] = useSearchParams()
  const token = params.get('token') || ''
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [done, setDone] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)

    if (!token) {
      setError('Missing reset token. Use the link from your email.')
      return
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`)
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }

    setSubmitting(true)
    try {
      await apiFetch('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, password })
      })
      setDone(true)
      setTimeout(() => navigate('/login', { replace: true }), 1500)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div style={{ maxWidth: 420, margin: '2rem auto' }}>
        <h1>Password updated</h1>
        <p>Redirecting you to the login page…</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 360, margin: '2rem auto' }}>
      <h1>Choose a new password</h1>
      {!token && (
        <p style={{ color: 'crimson' }}>
          This page needs a <code>?token=…</code> parameter. Use the link from
          your reset email.
        </p>
      )}
      <form onSubmit={handleSubmit}>
        <label style={{ display: 'block', marginBottom: '0.75rem' }}>
          New password ({MIN_PASSWORD_LENGTH}+ characters)
          <br />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={MIN_PASSWORD_LENGTH}
            autoComplete="new-password"
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </label>
        <label style={{ display: 'block', marginBottom: '0.75rem' }}>
          Confirm password
          <br />
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            minLength={MIN_PASSWORD_LENGTH}
            autoComplete="new-password"
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </label>
        {error && <p style={{ color: 'crimson' }}>{error}</p>}
        <button type="submit" disabled={submitting || !token}>
          {submitting ? 'Updating…' : 'Update password'}
        </button>
      </form>
      <p style={{ marginTop: '1rem' }}>
        <Link to="/login">Back to log in</Link>
      </p>
    </div>
  )
}
