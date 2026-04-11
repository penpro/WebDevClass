// Authentication routes and middleware.
//
// Exposes an Express router at /api/auth with:
//   POST /register         create an account and log in
//   POST /login            log in to an existing account
//   POST /logout           destroy the current session
//   GET  /me               return the current user (or null)
//   DELETE /me             delete the current user's account
//   POST /forgot-password  start a reset flow by emailing a token
//   POST /reset-password   consume a token and set a new password
//
// Also exports:
//   requireAuth                - middleware requiring any logged-in user
//   requireAdmin               - middleware requiring users.role = 'admin'
//   sendPasswordResetForUser   - shared helper used by both the self-service
//                                /forgot-password flow and the admin-triggered
//                                send-password-reset endpoint

const crypto = require('crypto');
const express = require('express');
const bcrypt = require('bcryptjs');

const pool = require('./db');
const { sendMail } = require('./mailer');

const router = express.Router();

const MIN_PASSWORD_LENGTH = 8;
const BCRYPT_COST = 12;
const RESET_TOKEN_TTL_HOURS = 1;

// A bcrypt hash of a string no user could ever submit. Used as a timing-
// constant placeholder when the requested email does not exist, so the
// login handler always spends about the same amount of CPU whether or not
// the account exists.
const FAKE_PASSWORD_HASH =
  '$2a$12$CjwlCHqQ1tD8WP.0aZ1a1eS5zKZwV5xM2o6xXn1oGfbW9a0bC4P3y';

// --- helpers --------------------------------------------------------------

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function isValidEmail(value) {
  // Intentionally loose: basic shape check, not full RFC 5322.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function sanitizeUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    role: user.role || 'user'
  };
}

function regenerateSession(req) {
  return new Promise((resolve, reject) => {
    req.session.regenerate((err) => (err ? reject(err) : resolve()));
  });
}

function saveSession(req) {
  return new Promise((resolve, reject) => {
    req.session.save((err) => (err ? reject(err) : resolve()));
  });
}

function destroySession(req) {
  return new Promise((resolve, reject) => {
    req.session.destroy((err) => (err ? reject(err) : resolve()));
  });
}

// Create a password reset token for a user, persist its hash, and send
// the reset email. Shared between the self-service /forgot-password flow
// (in this file) and the admin-triggered /api/admin/users/:id/send-password-reset
// flow (in admin.js), so both paths produce identical tokens and emails.
async function sendPasswordResetForUser(user) {
  const token = crypto.randomBytes(32).toString('hex');
  const token_hash = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  const expires_at = new Date(
    Date.now() + RESET_TOKEN_TTL_HOURS * 60 * 60 * 1000
  );

  await pool.query(
    'INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
    [user.id, token_hash, expires_at]
  );

  const base = process.env.APP_BASE_URL || 'http://localhost';
  const resetUrl = `${base}/reset-password?token=${token}`;

  await sendMail({
    to: user.email,
    subject: 'Reset your password',
    text:
      'A password reset was requested for your account.\n\n' +
      `Open the link below to choose a new password. The link expires in ${RESET_TOKEN_TTL_HOURS} hour(s).\n\n` +
      `${resetUrl}\n\n` +
      "If you did not request this, you can ignore this email and your password will stay the same."
  });
}

// --- middleware -----------------------------------------------------------

function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}

// requireAdmin is a superset of requireAuth: it checks that the caller is
// logged in AND that the user row currently has role='admin'. The role is
// re-read from the DB on every admin-guarded request so a demotion takes
// effect on the next admin action without waiting for the session to end.
async function requireAdmin(req, res, next) {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const [rows] = await pool.query(
      'SELECT role FROM users WHERE id = ?',
      [req.session.userId]
    );
    if (rows.length === 0 || rows[0].role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  } catch (error) {
    console.error('Admin check failed:', error);
    res.status(500).json({ error: 'Authorization check failed' });
  }
}

// --- routes ---------------------------------------------------------------

router.post('/register', async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || '');

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'A valid email is required' });
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({
        error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`
      });
    }

    const [existing] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    if (existing.length > 0) {
      return res
        .status(409)
        .json({ error: 'An account with that email already exists' });
    }

    const password_hash = await bcrypt.hash(password, BCRYPT_COST);
    const [result] = await pool.query(
      'INSERT INTO users (email, password_hash) VALUES (?, ?)',
      [email, password_hash]
    );

    const user = { id: result.insertId, email };

    await regenerateSession(req);
    req.session.userId = user.id;
    await saveSession(req);

    res.status(201).json({ user: sanitizeUser(user) });
  } catch (error) {
    console.error('Register failed:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || '');

    const [rows] = await pool.query(
      'SELECT id, email, role, password_hash FROM users WHERE email = ?',
      [email]
    );
    const user = rows[0];

    // Always run bcrypt to keep login timing roughly constant.
    const hashToCompare = user ? user.password_hash : FAKE_PASSWORD_HASH;
    const ok = await bcrypt.compare(password, hashToCompare);

    if (!user || !ok) {
      return res.status(401).json({ error: 'Incorrect email or password' });
    }

    await pool.query(
      'UPDATE users SET last_login_at = NOW() WHERE id = ?',
      [user.id]
    );

    await regenerateSession(req);
    req.session.userId = user.id;
    await saveSession(req);

    res.json({ user: sanitizeUser(user) });
  } catch (error) {
    console.error('Login failed:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.post('/logout', async (req, res) => {
  try {
    if (!req.session) {
      return res.json({ ok: true });
    }
    await destroySession(req);
    res.clearCookie('hello.sid');
    res.json({ ok: true });
  } catch (error) {
    console.error('Logout failed:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

router.get('/me', async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.json({ user: null });
    }
    const [rows] = await pool.query(
      'SELECT id, email, role FROM users WHERE id = ?',
      [req.session.userId]
    );
    res.json({ user: sanitizeUser(rows[0]) });
  } catch (error) {
    console.error('Current-user lookup failed:', error);
    res.status(500).json({ error: 'Failed to fetch current user' });
  }
});

router.delete('/me', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    // FK on password_resets cascades. sessions rows will be cleaned up by
    // express-mysql-session's own expiry sweep, but we destroy this one now.
    await pool.query('DELETE FROM users WHERE id = ?', [userId]);
    await destroySession(req);
    res.clearCookie('hello.sid');
    res.json({ ok: true });
  } catch (error) {
    console.error('Account deletion failed:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);

    // Always return the same shape so attackers cannot probe which emails
    // are registered by watching the response.
    const genericResponse = { ok: true };

    if (!isValidEmail(email)) {
      return res.json(genericResponse);
    }

    const [rows] = await pool.query(
      'SELECT id, email FROM users WHERE email = ?',
      [email]
    );
    const user = rows[0];

    if (user) {
      await sendPasswordResetForUser(user);
    }

    res.json(genericResponse);
  } catch (error) {
    console.error('Forgot-password failed:', error);
    // Still return the generic success to avoid leaking information.
    res.json({ ok: true });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const token = String(req.body.token || '');
    const password = String(req.body.password || '');

    if (!token) {
      return res.status(400).json({ error: 'Reset token is required' });
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({
        error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`
      });
    }

    const token_hash = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const [rows] = await pool.query(
      'SELECT id, user_id, expires_at, used_at FROM password_resets WHERE token_hash = ?',
      [token_hash]
    );
    const record = rows[0];

    if (
      !record ||
      record.used_at ||
      new Date(record.expires_at) < new Date()
    ) {
      return res
        .status(400)
        .json({ error: 'This reset link is invalid or has expired' });
    }

    const password_hash = await bcrypt.hash(password, BCRYPT_COST);

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      await connection.query(
        'UPDATE users SET password_hash = ? WHERE id = ?',
        [password_hash, record.user_id]
      );
      await connection.query(
        'UPDATE password_resets SET used_at = NOW() WHERE id = ?',
        [record.id]
      );
      await connection.commit();
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }

    res.json({ ok: true });
  } catch (error) {
    console.error('Reset-password failed:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

module.exports = {
  router,
  requireAuth,
  requireAdmin,
  sendPasswordResetForUser
};
