// Thin wrapper around nodemailer with a safe fallback.
//
// When SMTP_HOST is set in the environment, real email is sent through the
// configured transport. When it is NOT set, the message is written to the
// process stdout instead (which, under PM2, lands in `pm2 logs hello-backend`).
// That way the password-reset flow is fully testable in production without
// needing SMTP credentials, and adding real delivery later is purely an
// environment change with no code edits.

const nodemailer = require('nodemailer');

let cachedTransporter = null;

function getTransporter() {
  if (cachedTransporter !== null) {
    return cachedTransporter;
  }

  const host = process.env.SMTP_HOST;
  if (!host) {
    cachedTransporter = false; // sentinel: "no transporter, use console"
    return cachedTransporter;
  }

  const port = Number(process.env.SMTP_PORT) || 587;
  const hasAuth = Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: hasAuth
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined
  });

  return cachedTransporter;
}

async function sendMail({ to, subject, text, html }) {
  const from = process.env.SMTP_FROM || 'no-reply@example.com';
  const transporter = getTransporter();

  if (!transporter) {
    // Console fallback: print the whole message so a developer can grab
    // reset links out of the PM2 log while SMTP is not yet set up.
    console.log('--- email (no SMTP configured, logging to console) ---');
    console.log(`from:    ${from}`);
    console.log(`to:      ${to}`);
    console.log(`subject: ${subject}`);
    console.log('body:');
    console.log(text || html || '(no body)');
    console.log('-------------------------------------------------------');
    return { delivered: false, logged: true };
  }

  const info = await transporter.sendMail({ from, to, subject, text, html });
  return { delivered: true, messageId: info.messageId };
}

module.exports = { sendMail };
