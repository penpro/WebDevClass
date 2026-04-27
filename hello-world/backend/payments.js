// Stripe subscription integration.
//
// Exposes two things server.js wires up separately:
//
//   router          —  authed JSON routes for the user-facing flow:
//                      GET  /api/payments/config   → publishable key
//                      GET  /api/payments/status   → current sub state
//                      POST /api/payments/subscribe → start a sub, returns
//                                                     the Payment Element
//                                                     client_secret
//                      POST /api/payments/cancel   → cancel at period end
//
//   webhookHandler  —  raw-body endpoint that Stripe POSTs events to.
//                      Verifies the request signature against
//                      STRIPE_WEBHOOK_SECRET, deduplicates by event id
//                      (stripe_events table), and updates user role on
//                      subscription state changes.  MUST be registered
//                      with express.raw() BEFORE the global express.json(),
//                      otherwise the body comes in pre-parsed and the
//                      signature will not verify.
//
// User role is the source of truth for "are they premium?" — we flip
// users.role between 'user' and 'premium' from the webhook handler
// only.  We never demote or promote admin / super_admin from this code
// path; the webhook only touches users in those two specific roles.

const express = require('express');
const Stripe = require('stripe');

const pool = require('./db');
const { requireAuth } = require('./auth');

// ---------------------------------------------------------------------------
// Stripe client
// ---------------------------------------------------------------------------

// Stripe is optional — if STRIPE_SECRET_KEY isn't configured, the routes
// still mount but each one returns 503. This lets the rest of the app
// boot in dev environments without Stripe credentials.
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

const PRICE_ID = process.env.STRIPE_PRICE_ID || null;
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || null;

function ensureStripe(res) {
  if (!stripe || !PRICE_ID) {
    res
      .status(503)
      .json({ error: 'Payments are not configured on the server' });
    return false;
  }
  return true;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// Get or create a Stripe customer for the given user. Stores the
// customer id in the subscriptions table on first creation so we don't
// re-create one each time.
async function getOrCreateCustomer(userId) {
  const [users] = await pool.query(
    'SELECT id, email FROM users WHERE id = ?',
    [userId]
  );
  if (users.length === 0) throw new Error('User not found');
  const user = users[0];

  const [existing] = await pool.query(
    'SELECT stripe_customer_id FROM subscriptions WHERE user_id = ?',
    [userId]
  );
  if (existing.length > 0 && existing[0].stripe_customer_id) {
    return existing[0].stripe_customer_id;
  }

  const customer = await stripe.customers.create({
    email: user.email,
    metadata: { user_id: String(userId) }
  });

  // Insert the row now so we have somewhere to write subscription
  // data when the user actually subscribes.
  await pool.query(
    `INSERT INTO subscriptions (user_id, stripe_customer_id)
     VALUES (?, ?)
     ON DUPLICATE KEY UPDATE stripe_customer_id = VALUES(stripe_customer_id)`,
    [userId, customer.id]
  );

  return customer.id;
}

// Returns true if the subscription status is one we treat as "active
// premium." active and trialing are the two Stripe statuses that mean
// the customer is in good standing right now.
function isActiveStatus(status) {
  return status === 'active' || status === 'trialing';
}

// ---------------------------------------------------------------------------
// JSON router (mounted at /api/payments by server.js)
// ---------------------------------------------------------------------------

const router = express.Router();

// GET /api/payments/config
// Returns the Stripe publishable key so the React app can initialize
// stripe.js. The publishable key is meant to be public — it's the
// secret key that must never leave the server.
router.get('/config', requireAuth, (req, res) => {
  res.json({
    publishable_key: process.env.STRIPE_PUBLISHABLE_KEY || null,
    configured: Boolean(stripe && PRICE_ID && process.env.STRIPE_PUBLISHABLE_KEY)
  });
});

// GET /api/payments/status
// Returns the caller's current subscription state for the UI to read
// without having to round-trip Stripe.
router.get('/status', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT stripe_subscription_id, status, current_period_end,
              cancel_at_period_end
         FROM subscriptions
        WHERE user_id = ?`,
      [req.session.userId]
    );
    if (rows.length === 0 || !rows[0].stripe_subscription_id) {
      return res.json({ status: 'none' });
    }
    const row = rows[0];
    res.json({
      status: row.status || 'incomplete',
      current_period_end: row.current_period_end,
      cancel_at_period_end: Boolean(row.cancel_at_period_end),
      is_active: isActiveStatus(row.status)
    });
  } catch (error) {
    console.error('Subscription status check failed:', error);
    res.status(500).json({ error: 'Failed to fetch subscription status' });
  }
});

// POST /api/payments/subscribe
// Creates a new subscription in default_incomplete state and returns
// the latest invoice's PaymentIntent client_secret so the frontend can
// collect card details with Stripe Elements.
router.post('/subscribe', requireAuth, async (req, res) => {
  if (!ensureStripe(res)) return;

  try {
    // Reject if the user already has an active subscription.
    const [existing] = await pool.query(
      `SELECT stripe_subscription_id, status FROM subscriptions
        WHERE user_id = ?`,
      [req.session.userId]
    );
    if (
      existing.length > 0 &&
      existing[0].stripe_subscription_id &&
      isActiveStatus(existing[0].status)
    ) {
      return res
        .status(400)
        .json({ error: 'You already have an active subscription' });
    }

    const customerId = await getOrCreateCustomer(req.session.userId);

    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: PRICE_ID }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent']
    });

    await pool.query(
      `UPDATE subscriptions
          SET stripe_subscription_id = ?, status = ?,
              cancel_at_period_end = FALSE
        WHERE user_id = ?`,
      [subscription.id, subscription.status, req.session.userId]
    );

    const clientSecret =
      subscription.latest_invoice &&
      subscription.latest_invoice.payment_intent &&
      subscription.latest_invoice.payment_intent.client_secret;

    res.json({
      subscription_id: subscription.id,
      client_secret: clientSecret
    });
  } catch (error) {
    console.error('Create subscription failed:', error);
    res.status(500).json({ error: 'Failed to start subscription' });
  }
});

// POST /api/payments/cancel
// Cancels the user's active subscription at the end of the current
// billing period. The user keeps premium access until that date; the
// webhook will flip the role back to 'user' when Stripe finally
// terminates the subscription.
router.post('/cancel', requireAuth, async (req, res) => {
  if (!ensureStripe(res)) return;

  try {
    const [rows] = await pool.query(
      `SELECT stripe_subscription_id, status FROM subscriptions
        WHERE user_id = ?`,
      [req.session.userId]
    );
    if (rows.length === 0 || !rows[0].stripe_subscription_id) {
      return res.status(404).json({ error: 'No subscription to cancel' });
    }

    const updated = await stripe.subscriptions.update(
      rows[0].stripe_subscription_id,
      { cancel_at_period_end: true }
    );

    await pool.query(
      `UPDATE subscriptions SET cancel_at_period_end = TRUE WHERE user_id = ?`,
      [req.session.userId]
    );

    res.json({
      ok: true,
      cancel_at_period_end: true,
      current_period_end: new Date(updated.current_period_end * 1000)
    });
  } catch (error) {
    console.error('Cancel subscription failed:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

// ---------------------------------------------------------------------------
// Webhook handler (registered separately by server.js with raw-body parsing)
// ---------------------------------------------------------------------------

// Only flip role 'user' → 'premium'. Never touch admins.
async function promoteToPremium(userId) {
  await pool.query(
    `UPDATE users SET role = 'premium' WHERE id = ? AND role = 'user'`,
    [userId]
  );
}

// Only flip role 'premium' → 'user'. Never touch admins.
async function demoteFromPremium(userId) {
  await pool.query(
    `UPDATE users SET role = 'user' WHERE id = ? AND role = 'premium'`,
    [userId]
  );
}

async function handleSubscriptionEvent(subscription) {
  const customerId =
    typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer && subscription.customer.id;
  if (!customerId) return;

  const [rows] = await pool.query(
    'SELECT user_id FROM subscriptions WHERE stripe_customer_id = ?',
    [customerId]
  );
  if (rows.length === 0) {
    console.warn(
      `Webhook: no local subscription row for Stripe customer ${customerId}`
    );
    return;
  }
  const userId = rows[0].user_id;

  const periodEnd = subscription.current_period_end
    ? new Date(subscription.current_period_end * 1000)
    : null;

  await pool.query(
    `UPDATE subscriptions
        SET stripe_subscription_id = ?,
            status = ?,
            current_period_end = ?,
            cancel_at_period_end = ?
      WHERE user_id = ?`,
    [
      subscription.id,
      subscription.status,
      periodEnd,
      Boolean(subscription.cancel_at_period_end),
      userId
    ]
  );

  if (isActiveStatus(subscription.status)) {
    await promoteToPremium(userId);
  } else if (
    ['canceled', 'incomplete_expired', 'unpaid'].includes(subscription.status)
  ) {
    await demoteFromPremium(userId);
  }
  // Other statuses (incomplete, past_due) are intentionally left alone —
  // we don't promote until they're fully active, and we don't demote on
  // a transient past_due (Stripe will retry).
}

async function processEvent(event) {
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      await handleSubscriptionEvent(event.data.object);
      break;
    case 'customer.subscription.deleted':
      await handleSubscriptionEvent({
        ...event.data.object,
        status: 'canceled'
      });
      break;
    case 'invoice.payment_succeeded':
    case 'invoice.payment_failed':
      // We don't act on these directly — the customer.subscription.* events
      // already carry the relevant status changes. Logged for audit.
      console.log(
        `[stripe] ${event.type} for invoice ${event.data.object.id}`
      );
      break;
    default:
      console.log(`[stripe] unhandled event type: ${event.type}`);
  }
}

async function webhookHandler(req, res) {
  if (!stripe || !WEBHOOK_SECRET) {
    return res.status(503).send('Webhook not configured');
  }

  const signature = req.headers['stripe-signature'];
  let event;
  try {
    // req.body is a Buffer here because we registered the route with
    // express.raw(). constructEvent verifies the signature using the
    // raw bytes; if we'd parsed the body to JSON the bytes would have
    // changed (whitespace, key order) and verification would fail.
    event = stripe.webhooks.constructEvent(req.body, signature, WEBHOOK_SECRET);
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Idempotency: skip if we've seen this event id before.
  try {
    const [seen] = await pool.query(
      'SELECT id FROM stripe_events WHERE id = ?',
      [event.id]
    );
    if (seen.length > 0) {
      console.log(`[stripe] duplicate event ${event.id} skipped`);
      return res.json({ received: true, duplicate: true });
    }

    await processEvent(event);

    await pool.query(
      'INSERT INTO stripe_events (id, type) VALUES (?, ?)',
      [event.id, event.type]
    );

    res.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook processing failed:', error);
    // Returning 5xx tells Stripe to retry. The idempotency check above
    // means a successful retry won't double-process.
    res.status(500).send('Webhook processing failed');
  }
}

module.exports = { router, webhookHandler };
