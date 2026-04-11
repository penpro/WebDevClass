// Notes API for the QuickNotes mini app.
//
// Mounted at /api/notes by server.js. Every route in here requires a
// logged-in session and every query is scoped by req.session.userId, so
// one account never sees another account's notes.

const express = require('express');
const pool = require('./db');
const { requireAuth } = require('./auth');

const router = express.Router();

// Apply the auth guard to everything in this router in one shot.
router.use(requireAuth);

const SELECT_COLUMNS =
  'id, title, body, created_at, updated_at';

// GET /api/notes - list the current user's notes, newest-edited first.
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT ${SELECT_COLUMNS} FROM notes WHERE user_id = ? ORDER BY updated_at DESC`,
      [req.session.userId]
    );
    res.json(rows);
  } catch (error) {
    console.error('List notes failed:', error);
    res.status(500).json({ error: 'Failed to list notes' });
  }
});

// GET /api/notes/:id - fetch a single note (404 if it belongs to another user).
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT ${SELECT_COLUMNS} FROM notes WHERE id = ? AND user_id = ?`,
      [req.params.id, req.session.userId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Get note failed:', error);
    res.status(500).json({ error: 'Failed to fetch note' });
  }
});

// POST /api/notes - create a new note for the current user.
router.post('/', async (req, res) => {
  try {
    const title = String(req.body.title || 'Untitled Note').slice(0, 255);
    const body = String(req.body.body || '');

    const [result] = await pool.query(
      'INSERT INTO notes (user_id, title, body) VALUES (?, ?, ?)',
      [req.session.userId, title, body]
    );

    const [rows] = await pool.query(
      `SELECT ${SELECT_COLUMNS} FROM notes WHERE id = ? AND user_id = ?`,
      [result.insertId, req.session.userId]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Create note failed:', error);
    res.status(500).json({ error: 'Failed to create note' });
  }
});

// PUT /api/notes/:id - replace the title/body of an existing note.
router.put('/:id', async (req, res) => {
  try {
    const title = String(req.body.title || 'Untitled Note').slice(0, 255);
    const body = String(req.body.body || '');

    const [result] = await pool.query(
      'UPDATE notes SET title = ?, body = ? WHERE id = ? AND user_id = ?',
      [title, body, req.params.id, req.session.userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const [rows] = await pool.query(
      `SELECT ${SELECT_COLUMNS} FROM notes WHERE id = ? AND user_id = ?`,
      [req.params.id, req.session.userId]
    );
    res.json(rows[0]);
  } catch (error) {
    console.error('Update note failed:', error);
    res.status(500).json({ error: 'Failed to update note' });
  }
});

// DELETE /api/notes/:id - remove a note.
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM notes WHERE id = ? AND user_id = ?',
      [req.params.id, req.session.userId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json({ ok: true });
  } catch (error) {
    console.error('Delete note failed:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

module.exports = router;
