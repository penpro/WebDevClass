require('dotenv').config();

const express = require('express');
const session = require('express-session');
const rateLimit = require('express-rate-limit');
const MySQLStore = require('express-mysql-session')(session);

const pool = require('./db');
const { router: authRouter } = require('./auth');
const notesRouter = require('./notes');
const boardsRouter = require('./boards');
const tasksRouter = require('./tasks');
const adminRouter = require('./admin');
const diagnosticsRouter = require('./diagnostics');
const rateLimiterState = require('./rateLimiterState');
const {
  router: paymentsRouter,
  webhookHandler: paymentsWebhookHandler
} = require('./payments');

const app = express();
const port = Number(process.env.PORT) || 3000;

// We sit behind nginx, so honor its X-Forwarded-* headers.
app.set('trust proxy', 1);

// ---------------------------------------------------------------------------
// Stripe webhook — MUST be registered BEFORE express.json()
// ---------------------------------------------------------------------------
// Stripe signs webhook payloads with HMAC over the RAW request bytes.
// If express.json() parses the body first, the bytes change (whitespace,
// key order) and signature verification fails. The webhook route is
// the one place in the API that needs the raw Buffer; everywhere else
// uses parsed JSON via the express.json() middleware below.
app.post(
  '/api/payments/webhook',
  express.raw({ type: 'application/json' }),
  paymentsWebhookHandler
);

app.use(express.json());

// ---------------------------------------------------------------------------
// Rate limiting
// ---------------------------------------------------------------------------
// Three tiers keyed by the client's IP (which nginx passes via
// X-Forwarded-For, interpreted by trust proxy above).
//
// All four limiters honor a runtime-mutable "disabled" flag via the
// express-rate-limit `skip` option. The flag's initial value comes from
// the DISABLE_RATE_LIMITS env var (see rateLimiterState.js), and can also
// be flipped at runtime by the super-admin diagnostics endpoints. Each
// request invokes skip() so it always reads the current value.
if (rateLimiterState.isDisabled()) {
  console.warn(
    'WARNING: rate limits are DISABLED (DISABLE_RATE_LIMITS=true). ' +
    'Use only for load testing — unset and restart for production.'
  );
}
const skipIfDisabled = () => rateLimiterState.isDisabled();

// Global safety net: 100 requests per minute per IP across all API routes.
// Generous enough to never bother a real user; tight enough to slow a
// naive brute-force or scraping attempt.
const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests — please wait a moment' },
  skip: skipIfDisabled
});
app.use('/api', globalLimiter);

// Auth mutation endpoints get a much stricter limiter because every
// request either does a bcrypt comparison (login), creates a user
// (register), or sends an email (forgot-password). These are expensive
// and abusable.
const authMutationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15-minute window
  max: 10,                   // 10 attempts per 15 min per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts — please try again later' },
  skip: skipIfDisabled
});

// Forgot-password is even tighter to limit email spam potential.
const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1-hour window
  max: 5,                   // 5 requests per hour per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many password reset requests — please try again later' },
  skip: skipIfDisabled
});

// Admin routes: moderate limiter. Admins are trusted but the endpoints
// send emails and query the user table, so a runaway script should still
// be capped.
const adminLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Admin rate limit exceeded' },
  skip: skipIfDisabled
});

// ---------------------------------------------------------------------------
// Session store
// ---------------------------------------------------------------------------
// Backed by MySQL. Uses its own small connection pool so it is not
// affected by churn in the application pool. The sessions table is also
// pre-created by the auth migration, so createDatabaseTable is a no-op
// in production.
const sessionStore = new MySQLStore({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  createDatabaseTable: true,
  schema: {
    tableName: 'sessions',
    columnNames: {
      session_id: 'session_id',
      expires: 'expires',
      data: 'data'
    }
  }
});

app.use(
  session({
    name: 'hello.sid',
    secret: process.env.SESSION_SECRET || 'dev-insecure-secret-change-me',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      // Flip to true once the site is served over HTTPS.
      secure: process.env.COOKIE_SECURE === 'true',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    }
  })
);

// ---------------------------------------------------------------------------
// Route mounting with per-group rate limiters
// ---------------------------------------------------------------------------

// Apply the tight auth limiter to specific mutation routes only, not
// to GET /me or POST /logout (which are cheap and should not be gated).
app.use('/api/auth/login', authMutationLimiter);
app.use('/api/auth/register', authMutationLimiter);
app.use('/api/auth/forgot-password', forgotPasswordLimiter);

app.use('/api/auth', authRouter);
app.use('/api/notes', notesRouter);
app.use('/api/boards', boardsRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/payments', paymentsRouter);
// Diagnostics is mounted BEFORE the broader /api/admin prefix so its more
// specific path wins. We deliberately skip the adminLimiter here: SSE
// streams hold a single request open for the whole test, and the global
// limiter is still applied via app.use('/api', globalLimiter) above. Each
// route inside also calls requireSuperAdmin individually.
app.use('/api/admin/diagnostics', diagnosticsRouter);
app.use('/api/admin', adminLimiter, adminRouter);

app.get('/api/messages', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, text FROM messages ORDER BY id'
    );
    res.json(rows);
  } catch (error) {
    console.error('Database query failed:', error);
    res.status(500).json({ error: 'Database query failed' });
  }
});

app.listen(port, () => {
  console.log(`Backend listening on http://127.0.0.1:${port}`);
});
