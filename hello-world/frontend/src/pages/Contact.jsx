// Contact form. POSTs to /api/contact (backend handler defined in
// hello-world/backend/contact.js once task #3 lands).
//
// Fields:
//   name      — string, required, 1–80 chars
//   email     — string, required, validated against a basic regex
//   subject   — string, optional, 0–120 chars
//   message   — string, required, 10–4000 chars
//
// On success the form swaps to a thank-you state. On failure the form
// shows the error and keeps the user's input intact so they can retry.

import { useState } from 'react';
import {
  colors,
  fonts,
  fontSizes,
  fontWeights,
  radii,
  space
} from '../theme.js';
import Container from '../components/Container.jsx';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import Stars from '../components/Stars.jsx';
import CornerBrackets from '../components/CornerBrackets.jsx';
import HudLabel from '../components/HudLabel.jsx';
import { apiFetch } from '../lib/api.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const initialForm = {
  name: '',
  email: '',
  subject: '',
  message: ''
};

export default function Contact() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [error, setError] = useState(null);

  function update(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  function clientValidate() {
    if (!form.name.trim()) return 'Name is required.';
    if (form.name.length > 80) return 'Name is too long.';
    if (!form.email.trim()) return 'Email is required.';
    if (!EMAIL_REGEX.test(form.email)) return 'Email looks malformed.';
    if (form.subject.length > 120) return 'Subject is too long.';
    if (form.message.trim().length < 10)
      return 'Please write at least a sentence so I have something to respond to.';
    if (form.message.length > 4000)
      return 'Message is over the 4,000 character limit — try shortening or sending a follow-up.';
    return null;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);

    const validation = clientValidate();
    if (validation) {
      setError(validation);
      return;
    }

    setStatus('sending');
    try {
      await apiFetch('/contact', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          subject: form.subject.trim() || null,
          message: form.message.trim(),
          source_url:
            typeof window !== 'undefined' ? window.location.href : null
        })
      });
      setStatus('sent');
      setForm(initialForm);
    } catch (err) {
      setStatus('error');
      setError(err.message || 'Something went wrong; please try again.');
    }
  }

  return (
    <section
      style={{
        position: 'relative',
        overflow: 'hidden',
        paddingTop: space['3xl'],
        paddingBottom: space['4xl']
      }}
    >
      <Stars density={100} heroDensity={10} colorTint="corona" />
      <CornerBrackets size={28} inset={24} />
      <Container narrow style={{ position: 'relative', zIndex: 1 }}>
        <HudLabel tone="cyan" live>Contact</HudLabel>
        <h1
          style={{
            fontFamily: fonts.heading,
            fontSize: 'clamp(2rem, 4vw, 3.25rem)',
            fontWeight: fontWeights.bold,
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            margin: `${space.md} 0 ${space.md}`,
            color: colors.text
          }}
        >
          Let&apos;s talk about your project.
        </h1>
        <p
          style={{
            margin: 0,
            fontSize: fontSizes.lg,
            color: colors.textSecondary,
            lineHeight: 1.55,
            maxWidth: '60ch'
          }}
        >
          Tell me what you&apos;re working on, what&apos;s stuck, and
          how I can help. I read every message personally and reply
          within a couple of business days.
        </p>

        <Card
          variant="accent"
          padding={space.xl}
          style={{ marginTop: space['2xl'] }}
        >
          {status === 'sent' ? (
            <ThankYou
              onReset={() => {
                setStatus('idle');
                setError(null);
              }}
            />
          ) : (
            <form
              onSubmit={handleSubmit}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: space.md
              }}
            >
              <Field label="Your name" htmlFor="contact-name" required>
                <Input
                  id="contact-name"
                  type="text"
                  value={form.name}
                  onChange={update('name')}
                  placeholder="Jane Doe"
                  autoComplete="name"
                  required
                  maxLength={80}
                />
              </Field>

              <Field label="Email" htmlFor="contact-email" required>
                <Input
                  id="contact-email"
                  type="email"
                  value={form.email}
                  onChange={update('email')}
                  placeholder="jane@example.com"
                  autoComplete="email"
                  required
                  maxLength={120}
                />
              </Field>

              <Field
                label="Subject"
                htmlFor="contact-subject"
                hint="Optional — one short line if you've got one."
              >
                <Input
                  id="contact-subject"
                  type="text"
                  value={form.subject}
                  onChange={update('subject')}
                  placeholder="Need help with our AWS bill"
                  maxLength={120}
                />
              </Field>

              <Field
                label="Message"
                htmlFor="contact-message"
                required
                hint="The more concrete the better. What's broken, what's wanted, what timeline."
              >
                <Textarea
                  id="contact-message"
                  rows={6}
                  value={form.message}
                  onChange={update('message')}
                  placeholder="We're building a marketplace and the checkout flow is..."
                  required
                  maxLength={4000}
                />
                <div
                  style={{
                    textAlign: 'right',
                    fontSize: fontSizes.xs,
                    color: colors.textMuted,
                    marginTop: space.xs,
                    fontFamily: fonts.mono
                  }}
                >
                  {form.message.length} / 4000
                </div>
              </Field>

              {error && (
                <div
                  role="alert"
                  style={{
                    background: 'rgba(239, 68, 68, 0.12)',
                    color: '#fecaca',
                    border: `1px solid ${colors.danger}`,
                    padding: `${space.sm} ${space.md}`,
                    borderRadius: radii.md,
                    fontSize: fontSizes.sm,
                    lineHeight: 1.5
                  }}
                >
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={status === 'sending'}
                size="lg"
                style={{ marginTop: space.sm }}
              >
                {status === 'sending' ? 'Sending…' : 'Send message →'}
              </Button>

              <p
                style={{
                  margin: 0,
                  fontSize: fontSizes.xs,
                  color: colors.textMuted,
                  lineHeight: 1.55,
                  textAlign: 'center'
                }}
              >
                Prefer email?{' '}
                <a
                  href="mailto:wesleyaweaverjr@gmail.com"
                  style={{
                    color: colors.accent,
                    textDecoration: 'none'
                  }}
                >
                  wesleyaweaverjr@gmail.com
                </a>
              </p>
            </form>
          )}
        </Card>
      </Container>
    </section>
  );
}

// ----------------------------- form bits ----------------------------- //

function Field({ label, htmlFor, hint, required, children }) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        style={{
          display: 'inline-flex',
          alignItems: 'baseline',
          gap: space.xs,
          fontFamily: fonts.body,
          fontWeight: fontWeights.semibold,
          fontSize: fontSizes.sm,
          color: colors.text,
          marginBottom: space.xs
        }}
      >
        {label}
        {required && (
          <span
            style={{ color: colors.accent, fontSize: fontSizes.sm }}
            aria-hidden
          >
            *
          </span>
        )}
      </label>
      {hint && (
        <div
          style={{
            fontSize: fontSizes.xs,
            color: colors.textMuted,
            marginBottom: space.sm,
            lineHeight: 1.5
          }}
        >
          {hint}
        </div>
      )}
      {children}
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '0.65rem 0.85rem',
  background: colors.bg,
  color: colors.text,
  border: `1px solid ${colors.border}`,
  borderRadius: radii.md,
  fontFamily: fonts.body,
  fontSize: fontSizes.base,
  outline: 'none',
  boxSizing: 'border-box'
};

function Input(props) {
  return (
    <input
      {...props}
      style={{
        ...inputStyle,
        ...(props.style || {})
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = colors.accent;
        e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.accentMuted}`;
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = colors.border;
        e.currentTarget.style.boxShadow = 'none';
      }}
    />
  );
}

function Textarea(props) {
  return (
    <textarea
      {...props}
      style={{
        ...inputStyle,
        resize: 'vertical',
        minHeight: '8rem',
        lineHeight: 1.55,
        ...(props.style || {})
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = colors.accent;
        e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.accentMuted}`;
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = colors.border;
        e.currentTarget.style.boxShadow = 'none';
      }}
    />
  );
}

function ThankYou({ onReset }) {
  return (
    <div style={{ textAlign: 'center', padding: `${space.lg} 0` }}>
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: radii.full,
          background: colors.successMuted,
          border: `1px solid ${colors.success}`,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: space.md,
          color: colors.success
        }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path
            d="M5 12 l5 5 l9 -10"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <h2
        style={{
          fontFamily: fonts.heading,
          fontSize: fontSizes.xl,
          fontWeight: fontWeights.bold,
          margin: 0,
          color: colors.text
        }}
      >
        Got it — thanks.
      </h2>
      <p
        style={{
          marginTop: space.md,
          fontSize: fontSizes.base,
          color: colors.textSecondary,
          lineHeight: 1.55,
          maxWidth: '40ch',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}
      >
        I&apos;ll get back to you within a couple of business days. If
        you need something faster, email is the quickest path.
      </p>
      <Button
        variant="secondary"
        size="sm"
        onClick={onReset}
        style={{ marginTop: space.lg }}
      >
        Send another
      </Button>
    </div>
  );
}
