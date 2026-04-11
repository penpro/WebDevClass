import { useState } from 'react'
import { Link } from 'react-router-dom'
import { apiFetch } from '../lib/api.js'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await apiFetch('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email })
      })
      setSent(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (sent) {
    return (
      <div style={{ maxWidth: 420, margin: '2rem auto' }}>
        <h1>Check your email</h1>
        <p>
          If an account exists for <strong>{email}</strong>, a password reset
          link has been sent. The link will expire in one hour.
        </p>
        <p>
          <Link to="/login">Back to log in</Link>
        </p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 360, margin: '2rem auto' }}>
      <h1>Forgot password</h1>
      <p>Enter the email on your account and we will send a reset link.</p>
      <form onSubmit={handleSubmit}>
        <label style={{ display: 'block', marginBottom: '0.75rem' }}>
          Email
          <br />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </label>
        {error && <p style={{ color: 'crimson' }}>{error}</p>}
        <button type="submit" disabled={submitting}>
          {submitting ? 'Sending…' : 'Send reset link'}
        </button>
      </form>
      <p style={{ marginTop: '1rem' }}>
        <Link to="/login">Back to log in</Link>
      </p>
    </div>
  )
}
