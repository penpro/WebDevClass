require('dotenv').config();

const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);

const pool = require('./db');
const { router: authRouter } = require('./auth');

const app = express();
const port = Number(process.env.PORT) || 3000;

// We sit behind nginx, so honor its X-Forwarded-* headers.
app.set('trust proxy', 1);

app.use(express.json());

// Session store backed by MySQL. Uses its own small connection pool so it
// is not affected by churn in the application pool. The sessions table is
// also pre-created by the auth migration, so createDatabaseTable is a
// no-op in production.
const sessionStore = new MySQLStore({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  createDatabaseTable: true,
  schema: {
    tableName: 'sessions',
    columnNames: {
      session_id: 'session_id',
      expires: 'expires',
      data: 'data'
    }
  }
});

app.use(
  session({
    name: 'hello.sid',
    secret: process.env.SESSION_SECRET || 'dev-insecure-secret-change-me',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      // Flip to true once the site is served over HTTPS.
      secure: process.env.COOKIE_SECURE === 'true',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    }
  })
);

app.use('/api/auth', authRouter);

app.get('/api/messages', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, text FROM messages ORDER BY id'
    );
    res.json(rows);
  } catch (error) {
    console.error('Database query failed:', error);
    res.status(500).json({ error: 'Database query failed' });
  }
});

app.listen(port, () => {
  console.log(`Backend listening on http://127.0.0.1:${port}`);
});
