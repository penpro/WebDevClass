import { useEffect, useState } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js'
import { apiFetch } from '../lib/api.js'
import { useAuth } from '../AuthContext.jsx'

// loadStripe must be called outside any component because it returns a
// Promise we want to keep stable across renders. We populate it lazily
// once the backend tells us the publishable key, so we don't bake the
// key into the bundle.
let stripePromise = null
function getStripe(publishableKey) {
  if (!stripePromise && publishableKey) {
    stripePromise = loadStripe(publishableKey)
  }
  return stripePromise
}

const PAGE_STYLE = { maxWidth: 600, margin: '0 auto', lineHeight: 1.6 }

export default function Subscribe() {
  const { user, loading } = useAuth()
  const [params] = useSearchParams()

  // Backend-reported subscription state ('none' | 'incomplete' | 'active' | ...)
  const [subStatus, setSubStatus] = useState(null)
  // Stripe Elements client_secret returned from /api/payments/subscribe
  const [clientSecret, setClientSecret] = useState(null)
  // Publishable key from /api/payments/config; null until the config call resolves
  const [publishableKey, setPublishableKey] = useState(null)
  const [paymentsConfigured, setPaymentsConfigured] = useState(true)

  const [error, setError] = useState(null)
  const [creating, setCreating] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  // After a successful Stripe redirect, the subscription status in our DB
  // takes a moment to flip to 'active' because the webhook arrives a
  // second or two after the redirect. Track a "polling" state so we can
  // show an interim "activating…" view instead of the default Upgrade
  // pitch, which would make it look like nothing happened.
  const [activating, setActivating] = useState(false)
  const [activationFailed, setActivationFailed] = useState(false)

  // Returning from a Stripe redirect? confirmPayment redirects to
  // ?payment_intent=...&redirect_status=succeeded after the card is
  // authorized. We don't have to do anything special — the webhook
  // updates the role server-side — but a friendly success message is
  // nice. We also re-fetch /auth/me so the role badge in the header
  // updates without requiring a full page reload.
  const [redirectStatus] = useState(params.get('redirect_status'))

  // ---- bootstrap: fetch config + status ------------------------------------
  useEffect(() => {
    if (loading || !user) return
    let cancelled = false
    Promise.all([
      apiFetch('/payments/config'),
      apiFetch('/payments/status')
    ])
      .then(([config, status]) => {
        if (cancelled) return
        setPublishableKey(config.publishable_key)
        setPaymentsConfigured(Boolean(config.configured))
        setSubStatus(status)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
    return () => {
      cancelled = true
    }
  }, [loading, user])

  // After a successful Stripe redirect, poll /payments/status until the
  // subscription is reported as active (or we time out). Stripe redirects
  // the user back the moment the payment confirms, but the webhook that
  // flips status to 'active' on our side arrives 1–3 seconds later. A
  // single fetch right after the redirect almost always misses the
  // update; polling closes the gap so the UI doesn't flash back to the
  // "Upgrade to Premium" pitch.
  useEffect(() => {
    if (redirectStatus !== 'succeeded') return

    let cancelled = false
    let attempts = 0
    const MAX_ATTEMPTS = 20 // ~30 seconds at 1500ms intervals
    const INTERVAL_MS = 1500
    let timer = null

    setActivating(true)
    setActivationFailed(false)

    async function tick() {
      if (cancelled) return
      attempts += 1
      try {
        const status = await apiFetch('/payments/status')
        if (cancelled) return
        setSubStatus(status)
        if (status.is_active) {
          setActivating(false)
          // Webhook also updated the user's role; refetch /auth/me so
          // the role badge in the header flips without a full page reload.
          apiFetch('/auth/me').catch(() => {})
          return // done — no more polls
        }
      } catch {
        // Swallow transient errors; the next tick will retry.
      }
      if (attempts >= MAX_ATTEMPTS) {
        setActivating(false)
        setActivationFailed(true)
        return
      }
      timer = setTimeout(tick, INTERVAL_MS)
    }

    // Kick off the first poll immediately (no initial delay).
    tick()

    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
    }
  }, [redirectStatus])

  if (loading) return <p>Loading…</p>
  if (!user) {
    return <Navigate to="/login" state={{ from: '/subscribe' }} replace />
  }

  if (!paymentsConfigured) {
    return (
      <div style={PAGE_STYLE}>
        <h1>Premium subscription</h1>
        <p style={{ color: '#b45309' }}>
          Payments are not configured on this server yet. The site
          administrator needs to set <code>STRIPE_PUBLISHABLE_KEY</code>,{' '}
          <code>STRIPE_SECRET_KEY</code>, <code>STRIPE_PRICE_ID</code>,
          and <code>STRIPE_WEBHOOK_SECRET</code> in the backend{' '}
          <code>.env</code> before this page can do anything.
        </p>
      </div>
    )
  }

  // ---- handlers -----------------------------------------------------------

  async function handleStartSubscription() {
    setError(null)
    setCreating(true)
    try {
      const data = await apiFetch('/payments/subscribe', { method: 'POST' })
      setClientSecret(data.client_secret)
    } catch (err) {
      setError(err.message)
    } finally {
      setCreating(false)
    }
  }

  async function handleCancel() {
    if (
      !window.confirm(
        'Cancel your subscription?\n\n' +
          'You will keep premium access until the end of your current ' +
          'billing period, then your role will revert to a regular user.'
      )
    ) {
      return
    }
    setError(null)
    setCancelling(true)
    try {
      await apiFetch('/payments/cancel', { method: 'POST' })
      const fresh = await apiFetch('/payments/status')
      setSubStatus(fresh)
    } catch (err) {
      setError(err.message)
    } finally {
      setCancelling(false)
    }
  }

  // ---- render branches ----------------------------------------------------

  // 0. Mid-activation — Stripe redirected back but the webhook hasn't
  // finished flipping the status to 'active' yet. Show a friendly
  // interim screen instead of the default Upgrade pitch so the user
  // doesn't think the payment failed.
  if (activating && !(subStatus && subStatus.is_active)) {
    return (
      <div style={PAGE_STYLE}>
        <h1>Activating your subscription…</h1>
        <p>
          Stripe confirmed your payment. We're waiting for the activation
          signal to land on our side — this usually takes a couple of
          seconds.
        </p>
        <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
          Don't refresh the page; it'll update on its own as soon as
          activation completes.
        </p>
      </div>
    )
  }

  // 0b. Polling timed out without seeing 'active'. Either the webhook
  // hasn't arrived (rare; Stripe retries for 3 days) or the payment
  // didn't actually succeed despite the redirect. Tell the user to
  // refresh in a moment, and surface the current status so they can
  // see what state things are actually in.
  if (activationFailed) {
    return (
      <div style={PAGE_STYLE}>
        <h1>Subscription is still activating</h1>
        <p>
          Stripe sent you back here a while ago but our backend hasn't
          received the activation event yet. This is unusual — refresh
          the page in a moment, or check the Stripe dashboard if it
          persists.
        </p>
        <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>
          Current status: <code>{subStatus?.status || 'unknown'}</code>
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          style={{
            padding: '0.5rem 1rem',
            background: '#111827',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer'
          }}
        >
          Refresh
        </button>
      </div>
    )
  }

  // 1. Active subscription — show status + cancel option.
  if (subStatus && subStatus.is_active) {
    return (
      <div style={PAGE_STYLE}>
        <h1>Premium subscription</h1>

        {redirectStatus === 'succeeded' && (
          <p
            style={{
              padding: '0.75rem 1rem',
              background: '#d1fae5',
              borderLeft: '4px solid #15803d',
              borderRadius: 4,
              marginBottom: '1.5rem'
            }}
          >
            Subscription activated. Your account has been upgraded to Premium —
            you can now post videos in TaskTrackr progress updates.
          </p>
        )}

        <p>
          You're a Premium subscriber. Status:{' '}
          <strong>{subStatus.status}</strong>.
        </p>
        {subStatus.current_period_end && (
          <p style={{ color: '#6b7280' }}>
            {subStatus.cancel_at_period_end
              ? `Your subscription ends on ${new Date(
                  subStatus.current_period_end
                ).toLocaleDateString()} and will not renew.`
              : `Your next billing date is ${new Date(
                  subStatus.current_period_end
                ).toLocaleDateString()}.`}
          </p>
        )}

        {error && <p style={{ color: 'crimson' }}>{error}</p>}

        {!subStatus.cancel_at_period_end && (
          <button
            type="button"
            onClick={handleCancel}
            disabled={cancelling}
            style={{
              background: 'transparent',
              border: '1px solid #b91c1c',
              color: '#b91c1c',
              padding: '0.5rem 1rem',
              borderRadius: 4,
              cursor: 'pointer'
            }}
          >
            {cancelling ? 'Cancelling…' : 'Cancel subscription'}
          </button>
        )}
      </div>
    )
  }

  // 2. We have a client_secret — render Stripe Elements for card collection.
  if (clientSecret) {
    const stripe = getStripe(publishableKey)
    if (!stripe) {
      return (
        <div style={PAGE_STYLE}>
          <p style={{ color: 'crimson' }}>Stripe failed to load.</p>
        </div>
      )
    }
    return (
      <div style={PAGE_STYLE}>
        <h1>Complete your subscription</h1>
        <Elements
          stripe={stripe}
          options={{
            clientSecret,
            appearance: { theme: 'flat' }
          }}
        >
          <SubscribeForm />
        </Elements>
      </div>
    )
  }

  // 3. Default: pitch the upgrade and offer the Subscribe button.
  return (
    <div style={PAGE_STYLE}>
      <h1>Upgrade to Premium</h1>
      <p>
        Premium adds video uploads to your TaskTrackr progress posts, with a
        100 MB-per-file cap (free accounts are image-only at 10 MB). One
        recurring charge, cancel anytime.
      </p>

      <ul style={{ color: '#374151' }}>
        <li>Image and video uploads on task progress posts</li>
        <li>100 MB per file (vs 10 MB for free accounts)</li>
        <li>All future Premium-only features automatically</li>
      </ul>

      <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
        We use Stripe in test mode — your real card is never charged. Use the
        Stripe test card number <code>4242 4242 4242 4242</code> with any
        future expiry, any 3-digit CVC, and any ZIP.
      </p>

      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      <button
        type="button"
        onClick={handleStartSubscription}
        disabled={creating}
        style={{
          padding: '0.6rem 1.2rem',
          background: '#111827',
          color: 'white',
          border: 'none',
          borderRadius: 4,
          cursor: 'pointer',
          fontSize: '1rem'
        }}
      >
        {creating ? 'Starting…' : 'Subscribe'}
      </button>
    </div>
  )
}

function SubscribeForm() {
  const stripe = useStripe()
  const elements = useElements()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(event) {
    event.preventDefault()
    if (!stripe || !elements) return

    setSubmitting(true)
    setError(null)

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/subscribe`
      }
    })

    // confirmPayment redirects on success. We only get here on a
    // synchronous failure (validation, declined card with immediate
    // response, etc.). Real success is reported by the webhook.
    if (stripeError) {
      setError(stripeError.message || 'Payment failed')
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      {error && (
        <p style={{ color: 'crimson', marginTop: '0.75rem' }}>{error}</p>
      )}
      <button
        type="submit"
        disabled={!stripe || submitting}
        style={{
          marginTop: '1rem',
          padding: '0.6rem 1.2rem',
          background: '#111827',
          color: 'white',
          border: 'none',
          borderRadius: 4,
          cursor: 'pointer',
          fontSize: '1rem',
          width: '100%'
        }}
      >
        {submitting ? 'Processing…' : 'Subscribe'}
      </button>
      <p
        style={{
          fontSize: '0.8rem',
          color: '#6b7280',
          marginTop: '0.75rem',
          textAlign: 'center'
        }}
      >
        Powered by Stripe — your card information is sent directly to Stripe
        and never touches our server.
      </p>
    </form>
  )
}
