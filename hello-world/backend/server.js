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
const loadtestEndpoints = require('./loadtestEndpoints');
const rateLimiterState = require('./rateLimiterState');
const maintenanceState = require('./maintenanceState');
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
// Maintenance mode middleware
// ---------------------------------------------------------------------------
//
// When maintenanceState.isEnabled() is true, every API request gets a 503
// EXCEPT the explicitly-bypassed paths below. The bypass list is the
// safety net that keeps the site recoverable: an admin must always be
// able to log in and reach the diagnostics toggle to flip maintenance
// back off, even if everything else is intentionally down.
//
// The 503 body includes a `maintenance: true` flag so the SPA's apiFetch
// can distinguish maintenance-mode 503s from genuine "service is broken"
// 503s and show the user a friendly banner instead of a cryptic error.
const MAINTENANCE_BYPASS = [
  '/api/auth/',          // login, logout, /me, register, password reset
  '/api/admin/',         // user search, role change, AND diagnostics
  '/api/payments/webhook' // Stripe webhook must keep working — Stripe
                         // retries with exponential backoff; missing
                         // delivery during a 4-min test isn't fatal but
                         // there's no reason to drop them
];

app.use((req, res, next) => {
  if (!maintenanceState.isEnabled()) return next();
  for (const prefix of MAINTENANCE_BYPASS) {
    if (req.path.startsWith(prefix)) return next();
  }
  // Load-test traffic spawned by the diagnostics router carries an
  // X-Diagnostic-Run header whose value matches a currently-active run
  // id, and we let it bypass maintenance so the test actually exercises
  // the app instead of measuring this 503 path's throughput.
  //
  // SECURITY MODEL:
  //   * Maintenance is an operational/UX flag, not a security boundary.
  //     Endpoints reached via this bypass still enforce their own auth
  //     (requireAuth / requireAdmin / requireSuperAdmin). A valid token
  //     grants no privileges beyond "the site is reachable".
  //   * Tokens are 128-bit cryptographically-random hex strings, valid
  //     only for the ~30-240 second window of an active test run, and
  //     unregistered immediately on close/error/spawn-failure.
  //     Brute-forcing 2^128 in a 4-minute window is infeasible.
  //   * The header value is used solely as a Set membership lookup —
  //     never interpolated, never logged, never reflected. There is no
  //     code-injection vector through this header.
  //   * The header CANNOT enable maintenance or change any state. It
  //     only causes this middleware to call next() instead of 503ing.
  //     Toggling maintenance still requires a super_admin session on
  //     POST /api/admin/diagnostics/maintenance.
  const diagRun = req.headers['x-diagnostic-run'];
  if (diagRun && maintenanceState.isActiveRunId(diagRun)) {
    return next();
  }
  res
    .status(503)
    .set('Retry-After', '60')
    .json({
      error: 'Maintenance',
      message: maintenanceState.getState().message,
      maintenance: true
    });
});

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
// Synthetic load-test endpoints. Header-gated; invisible to anyone who
// isn't currently running a test through the diagnostics page.
app.use('/api/loadtest', loadtestEndpoints);

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
