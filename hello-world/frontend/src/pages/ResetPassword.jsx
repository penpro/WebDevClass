import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { apiFetch } from '../lib/api.js'
import {
  colors,
  fontSizes,
  fontWeights,
  space
} from '../theme.js'
import Container from '../components/Container.jsx'
import Card from '../components/Card.jsx'
import Button from '../components/Button.jsx'
import HudLabel from '../components/HudLabel.jsx'
import {
  AuthField,
  AuthInput,
  AuthError,
  AuthInfo,
  authTitleStyle
} from '../components/AuthBits.jsx'

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
      <Container
        narrow
        style={{
          paddingTop: space['3xl'],
          paddingBottom: space['3xl'],
          maxWidth: 480
        }}
      >
        <HudLabel tone="corona">Password updated</HudLabel>
        <h1 style={authTitleStyle}>Done.</h1>
        <AuthInfo>Redirecting you to the login page…</AuthInfo>
      </Container>
    )
  }

  return (
    <Container
      narrow
      style={{
        paddingTop: space['3xl'],
        paddingBottom: space['3xl'],
        maxWidth: 460
      }}
    >
      <HudLabel tone="magenta">Password reset</HudLabel>
      <h1 style={authTitleStyle}>Choose a new password.</h1>
      {!token && (
        <AuthError>
          This page needs a <code>?token=…</code> parameter. Use the
          link from your reset email.
        </AuthError>
      )}
      <Card style={{ marginTop: space.lg }}>
        <form onSubmit={handleSubmit}>
          <AuthField
            label={`New password (${MIN_PASSWORD_LENGTH}+ characters)`}
            htmlFor="reset-password"
          >
            <AuthInput
              id="reset-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={MIN_PASSWORD_LENGTH}
              autoComplete="new-password"
            />
          </AuthField>
          <AuthField label="Confirm password" htmlFor="reset-confirm">
            <AuthInput
              id="reset-confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={MIN_PASSWORD_LENGTH}
              autoComplete="new-password"
            />
          </AuthField>
          {error && <AuthError>{error}</AuthError>}
          <Button
            type="submit"
            disabled={submitting || !token}
            fullWidth
            size="md"
          >
            {submitting ? 'Updating…' : 'Update password →'}
          </Button>
        </form>
      </Card>
      <p
        style={{
          marginTop: space.lg,
          color: colors.textSecondary,
          fontSize: fontSizes.sm
        }}
      >
        <Link
          to="/login"
          style={{
            color: colors.accent,
            textDecoration: 'none',
            fontWeight: fontWeights.semibold
          }}
        >
          ← Back to log in
        </Link>
      </p>
    </Container>
  )
}
