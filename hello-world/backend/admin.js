// Admin-only customer service API.
//
// Mounted at /api/admin by server.js. Every route requires req.session to
// reference a user whose role is 'admin'; see requireAdmin in auth.js. The
// role is re-read on every request so a demotion takes effect on the next
// admin action, and we never trust cached role state in the session.
//
// Every state-changing action is logged to the admin_actions table (in
// addition to console.log) so there is a durable audit trail independent
// of PM2 log rotation.

const express = require('express');

const pool = require('./db');
const {
  requireAdmin,
  requireSuperAdmin,
  sendPasswordResetForUser,
  VALID_ROLES
} = require('./auth');

const router = express.Router();

const MAX_SEARCH_RESULTS = 50;
const VALID_ROLES_SET = new Set(VALID_ROLES);

// --- audit helper ---------------------------------------------------------

// Writes a row to admin_actions so every admin action has a permanent
// database record. detail is an optional plain object that gets stored as
// JSON.  Failures are logged to stderr but do not block the response — the
// action itself already succeeded, and losing the audit row is better than
// returning a 500 for the admin action.
async function logAdminAction(adminId, action, targetId, detail) {
  try {
    await pool.query(
      'INSERT INTO admin_actions (admin_id, action, target_id, detail) VALUES (?, ?, ?, ?)',
      [adminId, action, targetId || null, detail ? JSON.stringify(detail) : null]
    );
  } catch (error) {
    console.error('Failed to write admin audit log:', error);
  }
}

// --- routes ---------------------------------------------------------------

// GET /api/admin/users/search?q=substring
//
// Returns up to 50 users whose email contains the given substring,
// case-insensitively (MySQL utf8mb4_unicode_ci collation handles this).
// Empty or missing query returns an empty array - we explicitly do NOT
// list all users for an empty search, to avoid accidental table dumps.
//
// Searches are logged to the audit table so there is a record of what
// an admin looked for and when.
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

    await logAdminAction(req.session.userId, 'user_search', null, {
      query: q,
      results_count: rows.length
    });

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

      await logAdminAction(
        req.session.userId,
        'send_password_reset',
        targetUser.id,
        { email: targetUser.email }
      );

      res.json({ ok: true });
    } catch (error) {
      console.error('Admin send-password-reset failed:', error);
      res.status(500).json({ error: 'Failed to send password reset email' });
    }
  }
);

// PUT /api/admin/users/:id/role
//
// Super-admin-only. Changes a user's role to one of the four valid
// values. Self-modification is blocked so a super_admin can't
// accidentally demote themselves and lock everyone out of the role-
// management UI. Every successful change is recorded in admin_actions.
router.put('/users/:id/role', requireSuperAdmin, async (req, res) => {
  try {
    const userId = Number(req.params.id);
    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({ error: 'Invalid user id' });
    }

    if (userId === req.session.userId) {
      return res.status(400).json({
        error: "You can't change your own role"
      });
    }

    const newRole = String(req.body.role || '');
    if (!VALID_ROLES_SET.has(newRole)) {
      return res.status(400).json({
        error: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}`
      });
    }

    const [rows] = await pool.query(
      'SELECT id, email, role FROM users WHERE id = ?',
      [userId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const target = rows[0];

    if (target.role === newRole) {
      // Nothing to do — return the existing record so the client can
      // update its UI consistently.
      return res.json({ id: target.id, email: target.email, role: target.role });
    }

    await pool.query('UPDATE users SET role = ? WHERE id = ?', [newRole, userId]);

    console.log(
      `[admin] user ${req.session.userId} changed role of user ${target.id} (${target.email}) from ${target.role} to ${newRole}`
    );

    await logAdminAction(req.session.userId, 'change_role', target.id, {
      email: target.email,
      from: target.role,
      to: newRole
    });

    res.json({ id: target.id, email: target.email, role: newRole });
  } catch (error) {
    console.error('Change role failed:', error);
    res.status(500).json({ error: 'Failed to change role' });
  }
});

module.exports = router;
