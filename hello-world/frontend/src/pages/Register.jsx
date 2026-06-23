import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext.jsx'
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
  authTitleStyle
} from '../components/AuthBits.jsx'

const MIN_PASSWORD_LENGTH = 8

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)

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
      await register(email, password)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
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
      <HudLabel tone="corona">Create account</HudLabel>
      <h1 style={authTitleStyle}>Spin up an account.</h1>
      <Card style={{ marginTop: space.lg }}>
        <form onSubmit={handleSubmit}>
          <AuthField label="Email" htmlFor="reg-email">
            <AuthInput
              id="reg-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </AuthField>
          <AuthField
            label={`Password (${MIN_PASSWORD_LENGTH}+ characters)`}
            htmlFor="reg-password"
          >
            <AuthInput
              id="reg-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              minLength={MIN_PASSWORD_LENGTH}
            />
          </AuthField>
          <AuthField label="Confirm password" htmlFor="reg-confirm">
            <AuthInput
              id="reg-confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              autoComplete="new-password"
              minLength={MIN_PASSWORD_LENGTH}
            />
          </AuthField>
          {error && <AuthError>{error}</AuthError>}
          <Button type="submit" disabled={submitting} fullWidth size="md">
            {submitting ? 'Creating account…' : 'Create account →'}
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
        Already have an account?{' '}
        <Link
          to="/login"
          style={{
            color: colors.accent,
            textDecoration: 'none',
            fontWeight: fontWeights.semibold
          }}
        >
          Log in
        </Link>
      </p>
    </Container>
  )
}
