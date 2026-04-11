// Admin-only customer service API.
//
// Mounted at /api/admin by server.js. Every route requires req.session to
// reference a user whose role is 'admin'; see requireAdmin in auth.js. The
// role is re-read on every request so a demotion takes effect on the next
// admin action, and we never trust cached role state in the session.

const express = require('express');

const pool = require('./db');
const { requireAdmin, sendPasswordResetForUser } = require('./auth');

const router = express.Router();

const MAX_SEARCH_RESULTS = 50;

// GET /api/admin/users/search?q=substring
//
// Returns up to 50 users whose email contains the given substring,
// case-insensitively (MySQL utf8mb4_unicode_ci collation handles this).
// Empty or missing query returns an empty array - we explicitly do NOT
// list all users for an empty search, to avoid accidental table dumps.
router.get('/users/search', requireAdmin, async (req, res) => {
  try {
    const q = String(req.query.q || '').trim();
    if (!q) {
      return res.json([]);
    }

    // Escape LIKE meta characters (% _ !) so they are treated as literal
    // text inside the pattern. Using '!' as the ESCAPE character avoids
    // confusion with backslash escaping in both JS strings and MySQL.
    const escaped = q.replace(/[%_!]/g, '!$&');
    const pattern = `%${escaped}%`;

    const [rows] = await pool.query(
      `SELECT id, email, role, created_at, last_login_at
         FROM users
        WHERE email LIKE ? ESCAPE '!'
        ORDER BY email
        LIMIT ?`,
      [pattern, MAX_SEARCH_RESULTS]
    );
    res.json(rows);
  } catch (error) {
    console.error('Admin user search failed:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// POST /api/admin/users/:id/send-password-reset
//
// Triggers the same reset token + email machinery that self-service
// /api/auth/forgot-password uses, but targeted at a specific user id.
// Logs the acting admin and the target user for a simple audit trail in
// the PM2 logs.
router.post(
  '/users/:id/send-password-reset',
  requireAdmin,
  async (req, res) => {
    try {
      const userId = Number(req.params.id);
      if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({ error: 'Invalid user id' });
      }

      const [rows] = await pool.query(
        'SELECT id, email FROM users WHERE id = ?',
        [userId]
      );
      if (rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      const targetUser = rows[0];

      console.log(
        `[admin] user ${req.session.userId} triggered password reset for user ${targetUser.id} (${targetUser.email})`
      );

      await sendPasswordResetForUser(targetUser);
      res.json({ ok: true });
    } catch (error) {
      console.error('Admin send-password-reset failed:', error);
      res.status(500).json({ error: 'Failed to send password reset email' });
    }
  }
);

module.exports = router;
