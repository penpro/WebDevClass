// Contact form router.
//
// Two surfaces:
//   * POST /api/contact            — public, rate-limited form submission
//   * GET  /api/admin/contacts     — admin/super_admin list with filters
//   * PATCH /api/admin/contacts/:id — admin/super_admin update status/notes
//
// Submissions go into the `contacts` table and trigger a notification
// email to the operator. Rows are deliberately structured (separate
// columns for name / email / subject / message / source_url) so a
// downstream batch export to JSON or a CSV dump is one query away.
//
// The POST route is mounted with a tight per-IP rate limiter in server.js
// (contactLimiter) — 5 submissions per hour per IP — to keep the database
// quiet under bot traffic.

const express = require('express');

const pool = require('./db');
const { sendMail } = require('./mailer');
const { requireAdmin } = require('./auth');

const router = express.Router();

// Length caps mirrored on the frontend client validation in Contact.jsx
// so the two halves agree on what counts as a valid submission.
const LIMITS = {
  name: { min: 1, max: 80 },
  email: { min: 3, max: 120 },
  subject: { min: 0, max: 120 },
  message: { min: 10, max: 4000 },
  source_url: { min: 0, max: 500 }
};

// Simple email shape check. We only need to reject obvious garbage —
// real deliverability is verified by actually sending mail back to it.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const VALID_STATUSES = ['new', 'read', 'responded', 'spam', 'archived'];

function validate(body) {
  function field(name) {
    const raw = body?.[name];
    if (raw == null) return '';
    return typeof raw === 'string' ? raw.trim() : '';
  }

  const name = field('name');
  const email = field('email');
  const subject = field('subject');
  const message = field('message');
  // Source URL is optional and a freeform string; we never follow it,
  // only store it for context. Browsers can send arbitrary values here.
  const sourceUrlRaw = body?.source_url;
  const source_url =
    typeof sourceUrlRaw === 'string' && sourceUrlRaw.length > 0
      ? sourceUrlRaw.slice(0, LIMITS.source_url.max)
      : null;

  if (name.length < LIMITS.name.min || name.length > LIMITS.name.max) {
    return { error: 'Name is required (1-80 chars).' };
  }
  if (email.length < LIMITS.email.min || email.length > LIMITS.email.max) {
    return { error: 'Email is required (3-120 chars).' };
  }
  if (!EMAIL_REGEX.test(email)) {
    return { error: 'Email looks malformed.' };
  }
  if (subject.length > LIMITS.subject.max) {
    return { error: `Subject is too long (max ${LIMITS.subject.max} chars).` };
  }
  if (
    message.length < LIMITS.message.min ||
    message.length > LIMITS.message.max
  ) {
    return {
      error: `Message length must be ${LIMITS.message.min}-${LIMITS.message.max} chars.`
    };
  }

  return {
    data: {
      name,
      email,
      subject: subject.length > 0 ? subject : null,
      message,
      source_url
    }
  };
}

// --- POST /api/contact ----------------------------------------------------

router.post('/', async (req, res) => {
  try {
    const result = validate(req.body);
    if (result.error) {
      return res.status(400).json({ error: result.error });
    }
    const data = result.data;

    // Capture IP and user-agent for downstream spam-pattern review.
    // req.ip honors trust proxy (set in server.js), so this is the
    // client IP nginx forwarded, not the loopback.
    const ip = req.ip ? String(req.ip).slice(0, 64) : null;
    const ua = req.get('user-agent') || null;
    const userAgent =
      typeof ua === 'string' ? ua.slice(0, 500) : null;

    const [insert] = await pool.query(
      `INSERT INTO contacts
         (name, email, subject, message, source_url, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        data.name,
        data.email,
        data.subject,
        data.message,
        data.source_url,
        ip,
        userAgent
      ]
    );

    // Fire notification email. Failure to send the notification should
    // NOT fail the request — the row is in the database either way.
    notifyOperator({ ...data, id: insert.insertId }).catch((err) => {
      console.error('contact: notify email failed:', err.message);
    });

    res.json({ ok: true });
  } catch (err) {
    console.error('contact: POST failed:', err);
    res.status(500).json({ error: 'Failed to submit message.' });
  }
});

// --- GET /api/admin/contacts ---------------------------------------------
//
// Mounted under /api/admin/contacts by server.js — see the bottom of
// this file for the adminRouter export and how it's wired up.

const adminRouter = express.Router();

adminRouter.get('/', requireAdmin, async (req, res) => {
  try {
    const status = String(req.query.status || '').toLowerCase();
    const limit = Math.min(200, Math.max(1, Number(req.query.limit) || 50));
    const offset = Math.max(0, Number(req.query.offset) || 0);

    const params = [];
    let where = '';
    if (status && VALID_STATUSES.includes(status)) {
      where = 'WHERE status = ?';
      params.push(status);
    }

    const [rows] = await pool.query(
      `SELECT id, name, email, subject, message, source_url,
              ip_address, user_agent, status, admin_notes,
              created_at, updated_at
         FROM contacts
         ${where}
         ORDER BY created_at DESC
         LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM contacts ${where}`,
      params
    );

    res.json({
      items: rows,
      total: countRows[0]?.total ?? 0,
      limit,
      offset
    });
  } catch (err) {
    console.error('contact: admin list failed:', err);
    res.status(500).json({ error: 'Failed to list contacts.' });
  }
});

adminRouter.patch('/:id', requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'Invalid id.' });
    }

    const updates = [];
    const params = [];

    if (req.body && typeof req.body.status === 'string') {
      const status = req.body.status.toLowerCase();
      if (!VALID_STATUSES.includes(status)) {
        return res.status(400).json({
          error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`
        });
      }
      updates.push('status = ?');
      params.push(status);
    }

    if (req.body && typeof req.body.admin_notes === 'string') {
      const notes = req.body.admin_notes.slice(0, 4000);
      updates.push('admin_notes = ?');
      params.push(notes);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No updatable fields provided.' });
    }

    params.push(id);
    const [result] = await pool.query(
      `UPDATE contacts SET ${updates.join(', ')} WHERE id = ?`,
      params
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Not found.' });
    }

    const [rows] = await pool.query(
      `SELECT id, name, email, subject, message, source_url,
              ip_address, user_agent, status, admin_notes,
              created_at, updated_at
         FROM contacts
        WHERE id = ?`,
      [id]
    );
    res.json(rows[0] || null);
  } catch (err) {
    console.error('contact: admin patch failed:', err);
    res.status(500).json({ error: 'Failed to update contact.' });
  }
});

// --- notification email --------------------------------------------------
//
// Sent to the operator (me) when a new submission comes in. The body is
// plain text — readable in any mail client and quotable verbatim into
// an LLM if I want to triage with assistance.

async function notifyOperator(submission) {
  const recipient = process.env.CONTACT_NOTIFY_EMAIL || process.env.SMTP_FROM;
  if (!recipient) {
    console.warn(
      'contact: no CONTACT_NOTIFY_EMAIL or SMTP_FROM set, skipping notify'
    );
    return;
  }

  const subjectLine = submission.subject
    ? `[Penumbra Tech] ${submission.subject}`
    : `[Penumbra Tech] New contact from ${submission.name}`;

  const body = [
    `New message via the Penumbra Tech contact form.`,
    ``,
    `Name:     ${submission.name}`,
    `Email:    ${submission.email}`,
    `Subject:  ${submission.subject || '(none)'}`,
    `Source:   ${submission.source_url || '(unknown)'}`,
    `Record:   contacts.id = ${submission.id}`,
    ``,
    `--- message ---`,
    submission.message,
    `--- end ---`,
    ``,
    `Reply directly to this email and the recipient will see your address`,
    `(${process.env.SMTP_FROM || 'no-reply@example.com'}) — set Reply-To`,
    `if you want responses to go elsewhere.`
  ].join('\n');

  await sendMail({
    to: recipient,
    subject: subjectLine,
    text: body
  });
}

module.exports = { router, adminRouter };
