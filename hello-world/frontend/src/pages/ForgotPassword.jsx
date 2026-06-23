import { useState } from 'react'
import { Link } from 'react-router-dom'
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
      <Container
        narrow
        style={{
          paddingTop: space['3xl'],
          paddingBottom: space['3xl'],
          maxWidth: 480
        }}
      >
        <HudLabel tone="cyan">Reset link sent</HudLabel>
        <h1 style={authTitleStyle}>Check your email.</h1>
        <AuthInfo>
          If an account exists for <strong>{email}</strong>, a password
          reset link has been sent. The link will expire in one hour.
        </AuthInfo>
        <p
          style={{
            color: colors.textSecondary,
            fontSize: fontSizes.sm,
            marginTop: space.lg
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
      <h1 style={authTitleStyle}>Forgot password.</h1>
      <p
        style={{
          margin: `${space.md} 0`,
          color: colors.textSecondary,
          fontSize: fontSizes.md,
          lineHeight: 1.6
        }}
      >
        Enter the email on your account and we&apos;ll send a reset link.
      </p>
      <Card>
        <form onSubmit={handleSubmit}>
          <AuthField label="Email" htmlFor="forgot-email">
            <AuthInput
              id="forgot-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </AuthField>
          {error && <AuthError>{error}</AuthError>}
          <Button type="submit" disabled={submitting} fullWidth size="md">
            {submitting ? 'Sending…' : 'Send reset link →'}
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
