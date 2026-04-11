// MoodBoard API.
//
// Mounted at /api/boards by server.js. Mixed auth: the GET route for a
// specific board by its share_token is public so anyone with the link
// can view it, but every mutation and the "list my boards" endpoint
// require a logged-in session and scope by user_id.
//
// A board's share_token is generated at creation time and is the board's
// stable external identifier (the URL path). The numeric id is a private
// primary key used for foreign key relationships only; it is never
// exposed in URLs or API paths.

const crypto = require('crypto');
const express = require('express');

const pool = require('./db');
const { requireAuth } = require('./auth');

const router = express.Router();

const MAX_URL_LENGTH = 2000;
const MAX_NAME_LENGTH = 255;

// --- helpers --------------------------------------------------------------

// 16 random bytes encoded as URL-safe base64 = 22 characters.
// 2^128 possibilities, which is well past unguessable.
function generateShareToken() {
  return crypto.randomBytes(16).toString('base64url');
}

function isValidHttpUrl(value) {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > MAX_URL_LENGTH) return false;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

async function getBoardByToken(shareToken) {
  const [rows] = await pool.query(
    'SELECT id, user_id, name, share_token, created_at, updated_at FROM boards WHERE share_token = ?',
    [shareToken]
  );
  return rows[0] || null;
}

async function getBoardImages(boardId) {
  const [rows] = await pool.query(
    'SELECT id, url, created_at FROM board_images WHERE board_id = ? ORDER BY created_at ASC, id ASC',
    [boardId]
  );
  return rows;
}

function touchBoard(boardId) {
  return pool.query('UPDATE boards SET updated_at = NOW() WHERE id = ?', [boardId]);
}

// --- routes ---------------------------------------------------------------

// GET /api/boards - list the current user's boards (newest-edited first)
router.get('/', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT b.id, b.name, b.share_token, b.created_at, b.updated_at,
              (SELECT COUNT(*) FROM board_images WHERE board_id = b.id) AS image_count
         FROM boards b
        WHERE b.user_id = ?
        ORDER BY b.updated_at DESC, b.id DESC`,
      [req.session.userId]
    );
    res.json(rows);
  } catch (error) {
    console.error('List boards failed:', error);
    res.status(500).json({ error: 'Failed to list boards' });
  }
});

// POST /api/boards - create a new board
router.post('/', requireAuth, async (req, res) => {
  try {
    const name = String(req.body.name || '').trim().slice(0, MAX_NAME_LENGTH);
    if (!name) {
      return res.status(400).json({ error: 'Board name is required' });
    }

    const share_token = generateShareToken();
    const [result] = await pool.query(
      'INSERT INTO boards (user_id, name, share_token) VALUES (?, ?, ?)',
      [req.session.userId, name, share_token]
    );

    const [rows] = await pool.query(
      'SELECT id, name, share_token, created_at, updated_at FROM boards WHERE id = ?',
      [result.insertId]
    );
    res.status(201).json({ ...rows[0], image_count: 0 });
  } catch (error) {
    console.error('Create board failed:', error);
    res.status(500).json({ error: 'Failed to create board' });
  }
});

// GET /api/boards/:token - fetch a board and its images.
// Public: anyone with the token can read. The response includes
// `can_edit: true` when the caller is the board's owner, so the UI
// knows whether to show the edit controls.
router.get('/:token', async (req, res) => {
  try {
    const board = await getBoardByToken(req.params.token);
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    const images = await getBoardImages(board.id);
    const canEdit = Boolean(req.session && req.session.userId === board.user_id);

    res.json({
      board: {
        name: board.name,
        share_token: board.share_token,
        created_at: board.created_at,
        updated_at: board.updated_at
      },
      images,
      can_edit: canEdit
    });
  } catch (error) {
    console.error('Get board failed:', error);
    res.status(500).json({ error: 'Failed to fetch board' });
  }
});

// PUT /api/boards/:token - rename a board (owner only)
router.put('/:token', requireAuth, async (req, res) => {
  try {
    const board = await getBoardByToken(req.params.token);
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }
    if (board.user_id !== req.session.userId) {
      return res.status(403).json({ error: 'You do not own this board' });
    }

    const name = String(req.body.name || '').trim().slice(0, MAX_NAME_LENGTH);
    if (!name) {
      return res.status(400).json({ error: 'Board name is required' });
    }

    await pool.query(
      'UPDATE boards SET name = ? WHERE id = ?',
      [name, board.id]
    );

    const [rows] = await pool.query(
      'SELECT id, name, share_token, created_at, updated_at FROM boards WHERE id = ?',
      [board.id]
    );
    res.json(rows[0]);
  } catch (error) {
    console.error('Update board failed:', error);
    res.status(500).json({ error: 'Failed to update board' });
  }
});

// DELETE /api/boards/:token - delete a board (owner only). ON DELETE CASCADE
// on board_images takes care of the child rows.
router.delete('/:token', requireAuth, async (req, res) => {
  try {
    const board = await getBoardByToken(req.params.token);
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }
    if (board.user_id !== req.session.userId) {
      return res.status(403).json({ error: 'You do not own this board' });
    }

    await pool.query('DELETE FROM boards WHERE id = ?', [board.id]);
    res.json({ ok: true });
  } catch (error) {
    console.error('Delete board failed:', error);
    res.status(500).json({ error: 'Failed to delete board' });
  }
});

// POST /api/boards/:token/images - add an image URL to a board (owner only)
router.post('/:token/images', requireAuth, async (req, res) => {
  try {
    const board = await getBoardByToken(req.params.token);
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }
    if (board.user_id !== req.session.userId) {
      return res.status(403).json({ error: 'You do not own this board' });
    }

    const url = String(req.body.url || '').trim();
    if (!isValidHttpUrl(url)) {
      return res.status(400).json({
        error: 'A valid http or https URL is required'
      });
    }

    const [result] = await pool.query(
      'INSERT INTO board_images (board_id, url) VALUES (?, ?)',
      [board.id, url]
    );

    // Bump the board's updated_at so it sorts to the top of the list.
    await touchBoard(board.id);

    const [rows] = await pool.query(
      'SELECT id, url, created_at FROM board_images WHERE id = ?',
      [result.insertId]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Add image failed:', error);
    res.status(500).json({ error: 'Failed to add image' });
  }
});

// DELETE /api/boards/:token/images/:imageId - remove an image (owner only)
router.delete('/:token/images/:imageId', requireAuth, async (req, res) => {
  try {
    const board = await getBoardByToken(req.params.token);
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }
    if (board.user_id !== req.session.userId) {
      return res.status(403).json({ error: 'You do not own this board' });
    }

    const [result] = await pool.query(
      'DELETE FROM board_images WHERE id = ? AND board_id = ?',
      [req.params.imageId, board.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }

    await touchBoard(board.id);
    res.json({ ok: true });
  } catch (error) {
    console.error('Delete image failed:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

module.exports = router;
