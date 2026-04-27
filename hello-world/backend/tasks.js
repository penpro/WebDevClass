// Tasks API for the TaskTrackr mini app.
//
// Mounted at /api/tasks by server.js. Every route requires a logged-in
// session and every query is scoped by req.session.userId so one account
// never sees another account's tasks.
//
// PUT supports partial updates: send only the fields that changed and
// the rest stay untouched. This makes the auto-save flow on the
// frontend dead simple — when a checkbox flips, the client sends just
// `{ completed: true }`.

const express = require('express');
const pool = require('./db');
const { requireAuth } = require('./auth');

const router = express.Router();
router.use(requireAuth);

const SELECT_COLUMNS =
  'id, title, description, due_date, completed, category, created_at, updated_at';

function clampStr(value, max, fallback) {
  const s = String(value == null ? '' : value).trim();
  if (!s) return fallback;
  return s.slice(0, max);
}

// Normalize a date input into the YYYY-MM-DD string MySQL DATE accepts,
// or null if the field was cleared.
function normalizeDate(value) {
  if (value == null || value === '') return null;
  const s = String(value);
  // Accept either "YYYY-MM-DD" or an ISO datetime; take the date part only.
  const match = s.match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : null;
}

// GET /api/tasks - list all of the user's tasks
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT ${SELECT_COLUMNS} FROM tasks
       WHERE user_id = ?
       ORDER BY completed ASC,
                ISNULL(due_date) ASC, due_date ASC,
                updated_at DESC`,
      [req.session.userId]
    );
    res.json(rows);
  } catch (error) {
    console.error('List tasks failed:', error);
    res.status(500).json({ error: 'Failed to list tasks' });
  }
});

// GET /api/tasks/:id - fetch a single task (must be owned by the caller)
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT ${SELECT_COLUMNS} FROM tasks WHERE id = ? AND user_id = ?`,
      [req.params.id, req.session.userId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Get task failed:', error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

// POST /api/tasks - create a new task
router.post('/', async (req, res) => {
  try {
    const title = clampStr(req.body.title, 255, 'Untitled Task');
    const description = String(req.body.description || '');
    const due_date = normalizeDate(req.body.due_date);
    const category = clampStr(req.body.category, 100, 'General');

    const [result] = await pool.query(
      `INSERT INTO tasks (user_id, title, description, due_date, category)
       VALUES (?, ?, ?, ?, ?)`,
      [req.session.userId, title, description, due_date, category]
    );

    const [rows] = await pool.query(
      `SELECT ${SELECT_COLUMNS} FROM tasks WHERE id = ? AND user_id = ?`,
      [result.insertId, req.session.userId]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Create task failed:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// PUT /api/tasks/:id - partial update of any subset of fields
router.put('/:id', async (req, res) => {
  try {
    const fields = [];
    const values = [];

    if (Object.prototype.hasOwnProperty.call(req.body, 'title')) {
      fields.push('title = ?');
      values.push(clampStr(req.body.title, 255, 'Untitled Task'));
    }
    if (Object.prototype.hasOwnProperty.call(req.body, 'description')) {
      fields.push('description = ?');
      values.push(String(req.body.description || ''));
    }
    if (Object.prototype.hasOwnProperty.call(req.body, 'due_date')) {
      fields.push('due_date = ?');
      values.push(normalizeDate(req.body.due_date));
    }
    if (Object.prototype.hasOwnProperty.call(req.body, 'completed')) {
      fields.push('completed = ?');
      values.push(req.body.completed ? 1 : 0);
    }
    if (Object.prototype.hasOwnProperty.call(req.body, 'category')) {
      fields.push('category = ?');
      values.push(clampStr(req.body.category, 100, 'General'));
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields provided to update' });
    }

    values.push(req.params.id, req.session.userId);

    const [result] = await pool.query(
      `UPDATE tasks SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`,
      values
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const [rows] = await pool.query(
      `SELECT ${SELECT_COLUMNS} FROM tasks WHERE id = ? AND user_id = ?`,
      [req.params.id, req.session.userId]
    );
    res.json(rows[0]);
  } catch (error) {
    console.error('Update task failed:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM tasks WHERE id = ? AND user_id = ?',
      [req.params.id, req.session.userId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ ok: true });
  } catch (error) {
    console.error('Delete task failed:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

module.exports = router;
