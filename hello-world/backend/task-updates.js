// Task updates ("progress posts") API.
//
// Mounted by tasks.js at /api/tasks/:taskId/updates so every route in
// here is implicitly scoped to a specific task. Every request verifies
// that the caller owns the task before reading or writing anything.
//
// Image bytes live on the server's filesystem under UPLOAD_DIR (default
// hello-world/backend/uploads/task-updates/). Only the filename and
// MIME type are stored in MySQL — the bytes are streamed back to the
// client through Express on demand, gated by the same ownership check.

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const express = require('express');
const multer = require('multer');

const pool = require('./db');
const { requireAuth } = require('./auth');

// ---------------------------------------------------------------------------
// Upload directory + multer config
// ---------------------------------------------------------------------------

const DEFAULT_UPLOAD_DIR = path.join(__dirname, 'uploads', 'task-updates');
const UPLOAD_DIR = process.env.UPLOAD_DIR || DEFAULT_UPLOAD_DIR;

// Make sure the directory exists at boot. Recursive create is a no-op
// when the dir is already there.
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED_MIMES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif'
]);

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    // Random opaque filename so URLs aren't guessable. Preserve the
    // original extension (lower-cased) only if it matches one we know
    // is safe to serve.
    const rawExt = path.extname(file.originalname || '').toLowerCase();
    const safeExt = /^\.(jpe?g|png|webp|gif)$/.test(rawExt) ? rawExt : '.bin';
    const random = crypto.randomBytes(16).toString('hex');
    cb(null, `${Date.now()}-${random}${safeExt}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_BYTES },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIMES.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, WebP, and GIF images are allowed'));
    }
  }
});

// Translates multer's errors into nice JSON. Without this the default
// error handler returns HTML, which the React client can't parse.
function handleMulter(req, res, next) {
  upload.single('image')(req, res, (err) => {
    if (!err) return next();
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res
          .status(413)
          .json({ error: 'Image is too large (max 10 MB)' });
      }
      return res.status(400).json({ error: err.message });
    }
    return res.status(400).json({ error: err.message || 'Upload failed' });
  });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// Confirms the caller owns the parent task. Returns the task row on
// success, sends a 404 and returns null on failure.
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
    // Swallow errors — if the file is already gone, that's fine, and
    // failing here shouldn't fail the user-facing operation.
  });
}

function shapeUpdate(row) {
  return {
    id: row.id,
    body: row.body,
    has_image: Boolean(row.image_filename),
    image_mime: row.image_mime || null,
    created_at: row.created_at
  };
}

// Apply the auth middleware to every route in this sub-router.
// mergeParams: true lets us read req.params.taskId from the parent.
const router = express.Router({ mergeParams: true });
router.use(requireAuth);

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

// GET /api/tasks/:taskId/updates - list updates for a task, newest first
router.get('/', async (req, res) => {
  try {
    const task = await loadOwnedTask(req, res);
    if (!task) return;

    const [rows] = await pool.query(
      `SELECT id, body, image_filename, image_mime, created_at
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
// Multipart form-data with optional `body` text and optional `image` file.
// At least one of the two must be present.
router.post('/', handleMulter, async (req, res) => {
  try {
    const task = await loadOwnedTask(req, res);
    if (!task) {
      // Clean up the uploaded file if the task was bogus
      if (req.file) safeUnlink(req.file.filename);
      return;
    }

    const body = String(req.body.body || '').trim();
    if (!body && !req.file) {
      if (req.file) safeUnlink(req.file.filename);
      return res
        .status(400)
        .json({ error: 'An update must have text, an image, or both' });
    }

    const [result] = await pool.query(
      `INSERT INTO task_updates (task_id, user_id, body, image_filename, image_mime)
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
      `SELECT id, body, image_filename, image_mime, created_at
         FROM task_updates
        WHERE id = ?`,
      [result.insertId]
    );

    // Bump the parent task's updated_at so it sorts to the top of the list.
    await pool.query('UPDATE tasks SET updated_at = NOW() WHERE id = ?', [task.id]);

    res.status(201).json(shapeUpdate(rows[0]));
  } catch (error) {
    console.error('Create task update failed:', error);
    if (req.file) safeUnlink(req.file.filename);
    res.status(500).json({ error: 'Failed to create update' });
  }
});

// DELETE /api/tasks/:taskId/updates/:id - remove update + its image file
router.delete('/:id', async (req, res) => {
  try {
    const task = await loadOwnedTask(req, res);
    if (!task) return;

    const [rows] = await pool.query(
      `SELECT id, image_filename FROM task_updates
       WHERE id = ? AND task_id = ?`,
      [req.params.id, task.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Update not found' });
    }

    await pool.query('DELETE FROM task_updates WHERE id = ?', [rows[0].id]);
    safeUnlink(rows[0].image_filename);

    res.json({ ok: true });
  } catch (error) {
    console.error('Delete task update failed:', error);
    res.status(500).json({ error: 'Failed to delete update' });
  }
});

// GET /api/tasks/:taskId/updates/:id/image - serve the image bytes
router.get('/:id/image', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.image_filename, u.image_mime
         FROM task_updates u
         JOIN tasks t ON t.id = u.task_id
        WHERE u.id = ? AND u.task_id = ? AND t.user_id = ?`,
      [req.params.id, req.params.taskId, req.session.userId]
    );
    if (rows.length === 0 || !rows[0].image_filename) {
      return res.status(404).json({ error: 'Image not found' });
    }
    const filePath = path.join(UPLOAD_DIR, rows[0].image_filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Image file missing' });
    }
    res.setHeader('Content-Type', rows[0].image_mime || 'application/octet-stream');
    // The filename is content-hashed and never reused, so the response is
    // safely cacheable by the browser.
    res.setHeader('Cache-Control', 'private, max-age=31536000');
    res.sendFile(filePath);
  } catch (error) {
    console.error('Serve task update image failed:', error);
    res.status(500).json({ error: 'Failed to serve image' });
  }
});

// Exported alongside the helpers a parent module needs to clean up files
// when a task itself is deleted.
module.exports = {
  router,
  UPLOAD_DIR,
  safeUnlink
};
