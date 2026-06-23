import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext.jsx'
import {
  colors,
  fonts,
  fontSizes,
  fontWeights,
  radii,
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

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login(email, password)
      navigate(from, { replace: true })
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
      <HudLabel tone="cyan">Sign in</HudLabel>
      <h1 style={authTitleStyle}>Welcome back.</h1>
      <Card style={{ marginTop: space.lg }}>
        <form onSubmit={handleSubmit}>
          <AuthField label="Email" htmlFor="login-email">
            <AuthInput
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </AuthField>
          <AuthField label="Password" htmlFor="login-password">
            <AuthInput
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </AuthField>
          {error && <AuthError>{error}</AuthError>}
          <Button type="submit" disabled={submitting} fullWidth size="md">
            {submitting ? 'Logging in…' : 'Log in →'}
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
        Need an account?{' '}
        <Link to="/register" style={authLinkStyle}>
          Sign up
        </Link>
      </p>
      <p style={{ color: colors.textSecondary, fontSize: fontSizes.sm }}>
        <Link to="/forgot-password" style={authLinkStyle}>
          Forgot your password?
        </Link>
      </p>
    </Container>
  )
}

const authLinkStyle = {
  color: colors.accent,
  textDecoration: 'none',
  fontWeight: fontWeights.semibold
}
