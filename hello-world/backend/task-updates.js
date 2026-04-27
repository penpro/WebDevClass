// Task updates ("progress posts") API.
//
// Mounted by tasks.js at /api/tasks/:taskId/updates so every route in
// here is implicitly scoped to a specific task. Every request verifies
// that the caller owns the task before reading or writing anything.
//
// Media bytes (image OR video) live on the server's filesystem under
// UPLOAD_DIR (default hello-world/backend/uploads/task-updates/). Only
// the filename and MIME type are stored in MySQL — the bytes are
// streamed back to the client through Express on demand, gated by the
// same ownership check.
//
// Premium / admin / super_admin users can upload video (up to 100 MB).
// Regular users are restricted to image uploads (up to 10 MB). The
// uploader is picked at request time based on the caller's current
// role, so a demotion takes effect on the next upload.

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const express = require('express');
const multer = require('multer');

const pool = require('./db');
const { requireAuth, loadCurrentUserRole } = require('./auth');

// ---------------------------------------------------------------------------
// Upload directory
// ---------------------------------------------------------------------------

const DEFAULT_UPLOAD_DIR = path.join(__dirname, 'uploads', 'task-updates');
const UPLOAD_DIR = process.env.UPLOAD_DIR || DEFAULT_UPLOAD_DIR;
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// ---------------------------------------------------------------------------
// Allowed MIME types and size limits
// ---------------------------------------------------------------------------

const IMAGE_MIMES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif'
]);
const VIDEO_MIMES = new Set([
  'video/mp4',
  'video/quicktime',
  'video/webm'
]);
const ALL_MIMES = new Set([...IMAGE_MIMES, ...VIDEO_MIMES]);

const IMAGE_MAX = 10 * 1024 * 1024; // 10 MB for free-tier users
const MEDIA_MAX = 100 * 1024 * 1024; // 100 MB for premium+

const PREMIUM_ROLES = new Set(['premium', 'admin', 'super_admin']);

// File extensions we keep in the saved filename. Anything else gets `.bin`.
const SAFE_EXT = /^\.(jpe?g|png|webp|gif|mp4|mov|webm)$/;

// ---------------------------------------------------------------------------
// Multer instances (one per tier)
// ---------------------------------------------------------------------------

function makeStorage() {
  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => {
      const rawExt = path.extname(file.originalname || '').toLowerCase();
      const ext = SAFE_EXT.test(rawExt) ? rawExt : '.bin';
      const random = crypto.randomBytes(16).toString('hex');
      cb(null, `${Date.now()}-${random}${ext}`);
    }
  });
}

function makeUploader(maxBytes, allowedMimes) {
  return multer({
    storage: makeStorage(),
    limits: { fileSize: maxBytes },
    fileFilter: (req, file, cb) => {
      if (allowedMimes.has(file.mimetype)) {
        cb(null, true);
      } else {
        cb(
          new Error(
            `File type "${file.mimetype}" is not allowed for your account level`
          )
        );
      }
    }
  });
}

const imageOnlyUpload = makeUploader(IMAGE_MAX, IMAGE_MIMES);
const fullMediaUpload = makeUploader(MEDIA_MAX, ALL_MIMES);

// ---------------------------------------------------------------------------
// Role-aware upload dispatcher
// ---------------------------------------------------------------------------

// Loads the caller's current role and routes the multipart request to
// the appropriate multer instance. Premium / admin / super_admin get
// the full media uploader (images + videos, 100 MB). Everyone else gets
// the image-only uploader (10 MB).
async function pickUploader(req, res, next) {
  try {
    const role = await loadCurrentUserRole(req.session.userId);
    const isPremium = PREMIUM_ROLES.has(role || 'user');
    const uploader = isPremium ? fullMediaUpload : imageOnlyUpload;

    uploader.single('media')(req, res, (err) => {
      if (!err) return next();
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          const limit = isPremium ? '100 MB' : '10 MB';
          return res
            .status(413)
            .json({ error: `File is too large (max ${limit} for your account)` });
        }
        return res.status(400).json({ error: err.message });
      }
      return res.status(400).json({ error: err.message || 'Upload failed' });
    });
  } catch (error) {
    console.error('pickUploader failed:', error);
    res.status(500).json({ error: 'Upload setup failed' });
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function loadOwnedTask(req, res) {
  const [rows] = await pool.query(
    'SELECT id FROM tasks WHERE id = ? AND user_id = ?',
    [req.params.taskId, req.session.userId]
  );
  if (rows.length === 0) {
    res.status(404).json({ error: 'Task not found' });
    return null;
  }
  return rows[0];
}

function safeUnlink(filename) {
  if (!filename) return;
  fs.unlink(path.join(UPLOAD_DIR, filename), () => {
    // Swallow errors — already-gone is fine.
  });
}

function shapeUpdate(row) {
  return {
    id: row.id,
    body: row.body,
    has_media: Boolean(row.media_filename),
    media_mime: row.media_mime || null,
    created_at: row.created_at
  };
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

const router = express.Router({ mergeParams: true });
router.use(requireAuth);

// GET /api/tasks/:taskId/updates - list updates for a task, newest first
router.get('/', async (req, res) => {
  try {
    const task = await loadOwnedTask(req, res);
    if (!task) return;

    const [rows] = await pool.query(
      `SELECT id, body, media_filename, media_mime, created_at
         FROM task_updates
        WHERE task_id = ?
        ORDER BY created_at DESC, id DESC`,
      [task.id]
    );
    res.json(rows.map(shapeUpdate));
  } catch (error) {
    console.error('List task updates failed:', error);
    res.status(500).json({ error: 'Failed to list updates' });
  }
});

// POST /api/tasks/:taskId/updates - create a new update
// Multipart form-data with optional `body` text and optional `media` file.
// At least one of the two must be present.
router.post('/', pickUploader, async (req, res) => {
  try {
    const task = await loadOwnedTask(req, res);
    if (!task) {
      if (req.file) safeUnlink(req.file.filename);
      return;
    }

    const body = String(req.body.body || '').trim();
    if (!body && !req.file) {
      if (req.file) safeUnlink(req.file.filename);
      return res
        .status(400)
        .json({ error: 'An update must have text, a media file, or both' });
    }

    const [result] = await pool.query(
      `INSERT INTO task_updates (task_id, user_id, body, media_filename, media_mime)
       VALUES (?, ?, ?, ?, ?)`,
      [
        task.id,
        req.session.userId,
        body || null,
        req.file ? req.file.filename : null,
        req.file ? req.file.mimetype : null
      ]
    );

    const [rows] = await pool.query(
      `SELECT id, body, media_filename, media_mime, created_at
         FROM task_updates
        WHERE id = ?`,
      [result.insertId]
    );

    await pool.query('UPDATE tasks SET updated_at = NOW() WHERE id = ?', [task.id]);

    res.status(201).json(shapeUpdate(rows[0]));
  } catch (error) {
    console.error('Create task update failed:', error);
    if (req.file) safeUnlink(req.file.filename);
    res.status(500).json({ error: 'Failed to create update' });
  }
});

// DELETE /api/tasks/:taskId/updates/:id - remove update + its media file
router.delete('/:id', async (req, res) => {
  try {
    const task = await loadOwnedTask(req, res);
    if (!task) return;

    const [rows] = await pool.query(
      `SELECT id, media_filename FROM task_updates
       WHERE id = ? AND task_id = ?`,
      [req.params.id, task.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Update not found' });
    }

    await pool.query('DELETE FROM task_updates WHERE id = ?', [rows[0].id]);
    safeUnlink(rows[0].media_filename);

    res.json({ ok: true });
  } catch (error) {
    console.error('Delete task update failed:', error);
    res.status(500).json({ error: 'Failed to delete update' });
  }
});

// GET /api/tasks/:taskId/updates/:id/media - serve the media bytes
router.get('/:id/media', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.media_filename, u.media_mime
         FROM task_updates u
         JOIN tasks t ON t.id = u.task_id
        WHERE u.id = ? AND u.task_id = ? AND t.user_id = ?`,
      [req.params.id, req.params.taskId, req.session.userId]
    );
    if (rows.length === 0 || !rows[0].media_filename) {
      return res.status(404).json({ error: 'Media not found' });
    }
    const filePath = path.join(UPLOAD_DIR, rows[0].media_filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Media file missing' });
    }
    res.setHeader('Content-Type', rows[0].media_mime || 'application/octet-stream');
    res.setHeader('Cache-Control', 'private, max-age=31536000');
    res.sendFile(filePath);
  } catch (error) {
    console.error('Serve task update media failed:', error);
    res.status(500).json({ error: 'Failed to serve media' });
  }
});

module.exports = {
  router,
  UPLOAD_DIR,
  safeUnlink
};
