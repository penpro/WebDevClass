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
const fs = require('fs').promises;
const path = require('path');
const { spawn } = require('child_process');

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

// --- Metaverse: Origins crash dump management ----------------------------
//
// CrashReportClient bundles land at /home/ubuntu/crash-dumps/{AppVersion}/
// {YYYY-MM-DD}/{uuid}.{bin,json} via the /datarouter/crashes ingest route
// (see datarouter.js).  These admin routes wrap the directory for hands-off
// retrieval and cleanup so the operator can collect samples for the phase-2
// decoder and clear the tree once done — without SSHing.  Both are super-
// admin only; the bundles can contain client IPs, system info, and (in
// .log files) user-typed text.

const CRASH_DIR =
  process.env.CRASH_DUMP_DIR || '/home/ubuntu/crash-dumps';

// Walk the crash directory tree and return the file count.  Used to
// populate the audit log entry on delete so we have a record of how many
// bundles were destroyed.
async function countFilesIn(dir) {
  let count = 0;
  let items;
  try {
    items = await fs.readdir(dir, { withFileTypes: true });
  } catch (err) {
    if (err.code === 'ENOENT') return 0;
    throw err;
  }
  for (const item of items) {
    if (item.isDirectory()) {
      count += await countFilesIn(path.join(dir, item.name));
    } else {
      count += 1;
    }
  }
  return count;
}

// GET /api/admin/crashes/count
//
// Returns a quick summary of what's on disk so the admin UI can show
// "12 crashes, 47 MB, last at ..." before they decide whether to
// download.  Each crash is one .bin + one .json sidecar pair; we count
// .bin files specifically as "crashes" and sum every file's size into
// total_bytes (which approximates the eventual tar.gz size before
// compression).
router.get('/crashes/count', requireSuperAdmin, async (req, res) => {
  try {
    let crashCount = 0;
    let totalBytes = 0;
    let latestMtimeMs = null;

    async function walk(dir) {
      let items;
      try {
        items = await fs.readdir(dir, { withFileTypes: true });
      } catch (err) {
        if (err.code === 'ENOENT') return;
        throw err;
      }
      for (const item of items) {
        const full = path.join(dir, item.name);
        if (item.isDirectory()) {
          await walk(full);
        } else {
          const s = await fs.stat(full);
          totalBytes += s.size;
          if (item.name.endsWith('.bin')) {
            crashCount += 1;
            if (latestMtimeMs === null || s.mtimeMs > latestMtimeMs) {
              latestMtimeMs = s.mtimeMs;
            }
          }
        }
      }
    }
    await walk(CRASH_DIR);

    res.json({
      crash_count: crashCount,
      total_bytes: totalBytes,
      latest_iso: latestMtimeMs ? new Date(latestMtimeMs).toISOString() : null
    });
  } catch (err) {
    console.error('[admin] crash count failed:', err);
    res.status(500).json({ error: 'count failed' });
  }
});

// GET /api/admin/crashes/archive
//
// Streams a gzipped tarball of the entire crash-dumps directory back to the
// admin's browser as an attachment.  Uses tar(1) via spawn so the whole
// archive never has to materialize on disk or in Node memory — output
// chunks flow tar → stdout → res as they're compressed.  Audit log is
// written on successful close (exit code 0); a failed tar leaves no audit
// row, which matches the existing "log on success" pattern.
router.get('/crashes/archive', requireSuperAdmin, async (req, res) => {
  try {
    await fs.access(CRASH_DIR);
  } catch {
    return res.status(404).json({ error: 'crash directory not found' });
  }

  const date = new Date().toISOString().slice(0, 10);
  const filename = `mo-crashes-${date}.tar.gz`;
  const parent = path.dirname(CRASH_DIR);
  const base = path.basename(CRASH_DIR);

  res.setHeader('Content-Type', 'application/gzip');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${filename}"`
  );

  const tar = spawn('tar', ['-czf', '-', '-C', parent, base], {
    stdio: ['ignore', 'pipe', 'pipe']
  });

  tar.stderr.on('data', (chunk) => {
    console.error('[admin] tar stderr:', chunk.toString().trim());
  });

  tar.stdout.pipe(res);

  tar.on('close', async (code) => {
    if (code === 0) {
      await logAdminAction(
        req.session.userId,
        'crashes_download',
        null,
        { filename }
      );
    } else {
      console.error(`[admin] tar exited with code ${code}`);
    }
  });
});

// DELETE /api/admin/crashes
//
// Removes every {AppVersion}/{date}/ subtree under CRASH_DIR, preserving
// CRASH_DIR itself so the ingest endpoint can keep writing.  Files are
// counted first so the audit log records what was destroyed.  No "are you
// sure" confirmation server-side — that's the client's job before calling
// the route.
router.delete('/crashes', requireSuperAdmin, async (req, res) => {
  try {
    let entries;
    try {
      entries = await fs.readdir(CRASH_DIR);
    } catch (err) {
      if (err.code === 'ENOENT') {
        return res.json({ ok: true, files_deleted: 0 });
      }
      throw err;
    }

    const filesDeleted = await countFilesIn(CRASH_DIR);

    for (const entry of entries) {
      await fs.rm(path.join(CRASH_DIR, entry), {
        recursive: true,
        force: true
      });
    }

    await logAdminAction(
      req.session.userId,
      'crashes_delete',
      null,
      { files_deleted: filesDeleted }
    );

    res.json({ ok: true, files_deleted: filesDeleted });
  } catch (err) {
    console.error('[admin] crashes delete failed:', err);
    res.status(500).json({ error: 'delete failed' });
  }
});

module.exports = router;
