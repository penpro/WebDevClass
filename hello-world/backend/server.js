const express = require('express');
const pool = require('./db');

const app = express();
const port = 3000;

app.get('/api/messages', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, text FROM messages ORDER BY id');
    res.json(rows);
  } catch (error) {
    console.error('Database query failed:', error);
    res.status(500).json({ error: 'Database query failed' });
  }
});

app.listen(port, () => {
  console.log(`Backend listening on http://127.0.0.1:${port}`);
});
