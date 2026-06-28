// The SaaS-rescue playbook — Maya's page.
//
// Vertical-specific long-form aimed at the persona that arrived
// scoring 64% in the round-2 audit but couldn't sign because there
// was no SaaS-shaped case study on the site. This page IS that case
// study, written as a 6-week sprint guide so it stays useful even to
// the founder who reads it and decides to do the work themselves.
//
// Format: same TOC + print-to-PDF as /guide, but tighter (~5K words,
// 8 chapters). Each chapter ends with a "What hiring me looks like
// in this week" callout that's the conversion reframe — the page
// gives away the recipe and sells the execution.

import useDocumentMeta from '../hooks/useDocumentMeta.js';
import { Link } from 'react-router-dom';
import {
  colors,
  fonts,
  fontSizes,
  fontWeights,
  space
} from '../theme.js';
import Container from '../components/Container.jsx';
import Button from '../components/Button.jsx';
import HudLabel from '../components/HudLabel.jsx';

const CAL_BOOKING_URL = 'https://cal.com/wesley-weaver-avi7mu/30min';

const CHAPTERS = [
  { id: 'foreword', num: '0', title: 'You are not behind. You are mid-build.' },
  { id: 'audit',    num: '1', title: 'Week 0: the 30-minute audit' },
  { id: 'secrets',  num: '2', title: 'Week 1: secrets, auth, rate limits' },
  { id: 'payments', num: '3', title: 'Week 2: Stripe (and what comes after Stripe)' },
  { id: 'deploys',  num: '4', title: 'Week 3: deploys without 3am surprises' },
  { id: 'monitor',  num: '5', title: 'Week 4: monitoring you will actually answer' },
  { id: 'backups',  num: '6', title: 'Week 5: backups and the recovery test' },
  { id: 'handover', num: '7', title: 'Week 6: security headers and the handover' },
  { id: 'honest',   num: '8', title: 'The honest chapter' }
];

// ---------------------------------------------------------------------- //
// Helpers (mirror Guide.jsx — kept inline so the file is self-contained)
// ---------------------------------------------------------------------- //

function ChapterTitle({ num, title, id }) {
  return (
    <div style={{ marginBottom: space.lg }}>
      <div
        style={{
          fontFamily: fonts.mono,
          fontSize: fontSizes.xs,
          color: colors.cyan,
          textTransform: 'uppercase',
          letterSpacing: '0.12em'
        }}
      >
        Chapter {num}
      </div>
      <h2
        id={id}
        style={{
          fontFamily: fonts.heading,
          fontSize: fontSizes['2xl'],
          fontWeight: fontWeights.bold,
          color: colors.text,
          margin: `${space.xs} 0 0`,
          letterSpacing: '-0.015em',
          lineHeight: 1.2,
          scrollMarginTop: '90px'
        }}
      >
        {title}
      </h2>
    </div>
  );
}

function P({ children }) {
  return (
    <p
      style={{
        margin: `0 0 ${space.md}`,
        fontSize: fontSizes.md,
        color: colors.textSecondary,
        lineHeight: 1.7
      }}
    >
      {children}
    </p>
  );
}

function H3({ children, id }) {
  return (
    <h3
      id={id}
      style={{
        fontFamily: fonts.heading,
        fontSize: fontSizes.lg,
        fontWeight: fontWeights.semibold,
        color: colors.text,
        margin: `${space.xl} 0 ${space.sm}`,
        letterSpacing: '-0.005em',
        scrollMarginTop: '90px'
      }}
    >
      {children}
    </h3>
  );
}

function C({ children }) {
  return (
    <code
      style={{
        fontFamily: fonts.mono,
        fontSize: '0.92em',
        color: colors.accent,
        background: colors.codeBg,
        padding: '0.12em 0.4em',
        borderRadius: 4
      }}
    >
      {children}
    </code>
  );
}

function CodeBlock({ children, label }) {
  return (
    <div style={{ margin: `${space.md} 0 ${space.lg}` }}>
      {label ? (
        <div
          style={{
            fontFamily: fonts.mono,
            fontSize: fontSizes.xs,
            color: colors.textMuted,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: space.xs
          }}
        >
          {label}
        </div>
      ) : null}
      <pre
        className="saas-code-block"
        style={{
          margin: 0,
          padding: space.md,
          background: colors.codeBg,
          border: `1px solid ${colors.border}`,
          borderRadius: 8,
          fontFamily: fonts.mono,
          fontSize: fontSizes.sm,
          lineHeight: 1.5,
          color: colors.text,
          overflowX: 'auto',
          whiteSpace: 'pre',
          tabSize: 2
        }}
      >
        {children}
      </pre>
    </div>
  );
}

function Gotcha({ children, title = 'What actually goes wrong here' }) {
  return (
    <aside
      className="saas-gotcha"
      style={{
        margin: `${space.xl} 0`,
        padding: `${space.lg} ${space.xl}`,
        borderRadius: 12,
        background: 'rgba(192, 132, 252, 0.06)',
        border: `1px dashed ${colors.magenta}`
      }}
    >
      <div
        style={{
          fontFamily: fonts.mono,
          fontSize: fontSizes.xs,
          color: colors.magenta,
          textTransform: 'uppercase',
          letterSpacing: '0.14em',
          marginBottom: space.sm
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: fontSizes.md,
          color: colors.text,
          lineHeight: 1.7
        }}
      >
        {children}
      </div>
    </aside>
  );
}

// Distinct from the gotcha: the conversion reframe. Same visual
// weight, different colour, different intent. Magenta dashes for
// "warning, footgun"; corona-accent solid for "here is what hiring
// me looks like."
function HireReframe({ children, title = 'What hiring me looks like' }) {
  return (
    <aside
      className="saas-hire"
      style={{
        margin: `${space.xl} 0`,
        padding: `${space.lg} ${space.xl}`,
        borderRadius: 12,
        background: 'rgba(94, 234, 212, 0.06)',
        border: `1px solid ${colors.borderAccent}`
      }}
    >
      <div
        style={{
          fontFamily: fonts.mono,
          fontSize: fontSizes.xs,
          color: colors.accent,
          textTransform: 'uppercase',
          letterSpacing: '0.14em',
          marginBottom: space.sm
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: fontSizes.md,
          color: colors.text,
          lineHeight: 1.7
        }}
      >
        {children}
      </div>
      <div style={{ marginTop: space.md, display: 'flex', gap: space.sm, flexWrap: 'wrap' }}>
        <a
          href={CAL_BOOKING_URL}
          target="_blank"
          rel="noreferrer noopener"
          style={{
            fontFamily: fonts.mono,
            fontSize: fontSizes.xs,
            color: colors.accent,
            textDecoration: 'none',
            letterSpacing: '0.06em',
            textTransform: 'uppercase'
          }}
        >
          Book a 30-min intro →
        </a>
      </div>
    </aside>
  );
}

function UL({ children }) {
  return (
    <ul
      style={{
        margin: `0 0 ${space.md}`,
        paddingLeft: space.xl,
        fontSize: fontSizes.md,
        color: colors.textSecondary,
        lineHeight: 1.7
      }}
    >
      {children}
    </ul>
  );
}

// ---------------------------------------------------------------------- //
// Page
// ---------------------------------------------------------------------- //

export default function SaasRescue() {
  useDocumentMeta({
    title: 'The 6-week SaaS-rescue playbook — Penumbra Tech',
    description:
      "8 chapters for solo SaaS founders whose backend is on fire. Real code: Stripe webhook ordering, nightly mysqldump, /api/health, nginx security headers. Free if you have the time, $10K-$25K if you don't.",
    canonical: 'https://penumbra-tech.com/saas-rescue'
  });

  return (
    <>
      <style>{`
        @media print {
          header, footer, .saas-no-print { display: none !important; }
          .saas-shell {
            display: block !important;
            background: #ffffff !important;
            color: #111111 !important;
            padding: 0 !important;
          }
          .saas-toc { display: none !important; }
          .saas-content {
            max-width: none !important;
            color: #111111 !important;
            padding: 0 !important;
          }
          .saas-content h1, .saas-content h2, .saas-content h3 {
            color: #000000 !important;
          }
          .saas-content p, .saas-content li {
            color: #222222 !important;
          }
          .saas-chapter { page-break-before: always; }
          .saas-chapter:first-of-type { page-break-before: avoid; }
          .saas-code-block {
            background: #f4f4f4 !important;
            color: #111111 !important;
            border: 1px solid #cccccc !important;
            white-space: pre-wrap !important;
            word-break: break-all !important;
            page-break-inside: avoid;
          }
          .saas-gotcha, .saas-hire {
            background: #fef6e7 !important;
            border: 1px dashed #b08020 !important;
            color: #111111 !important;
            page-break-inside: avoid;
          }
          .saas-gotcha div, .saas-hire div { color: #111111 !important; }
        }
      `}</style>

      {/* =============================== Hero =============================== */}
      <section
        className="saas-no-print"
        style={{
          paddingTop: space['3xl'],
          paddingBottom: space['2xl'],
          borderBottom: `1px solid ${colors.borderSubtle}`,
          background: colors.bg
        }}
      >
        <Container>
          <HudLabel tone="magenta">The SaaS-rescue playbook</HudLabel>
          <h1
            style={{
              fontFamily: fonts.heading,
              fontSize: 'clamp(2rem, 4vw, 3.5rem)',
              fontWeight: fontWeights.bold,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              margin: `${space.md} 0 ${space.md}`,
              color: colors.text,
              maxWidth: '26ch'
            }}
          >
            Six weeks to take the boring infra off your plate.
          </h1>
          <p
            style={{
              margin: 0,
              maxWidth: '64ch',
              fontSize: fontSizes.lg,
              color: colors.textSecondary,
              lineHeight: 1.6
            }}
          >
            For the solo founder four months into a vertical SaaS who
            is shipping features fine but losing a day or two a week to
            TLS, payments, deploys, and the stuff nobody notices until
            it breaks. Free if you have the time. $10K–$25K if you
            don&apos;t.
          </p>
          <div
            style={{
              marginTop: space.xl,
              display: 'flex',
              gap: space.md,
              flexWrap: 'wrap'
            }}
          >
            <Button
              as="a"
              href={CAL_BOOKING_URL}
              target="_blank"
              rel="noreferrer noopener"
              variant="primary"
            >
              Book a 30-min intro →
            </Button>
            <Button onClick={() => window.print()} variant="secondary">
              Save as PDF
            </Button>
            <Button as={Link} to="/#engagements" variant="ghost">
              See the engagement shapes
            </Button>
          </div>
          <p
            style={{
              marginTop: space.lg,
              fontSize: fontSizes.xs,
              fontFamily: fonts.mono,
              color: colors.textMuted,
              letterSpacing: '0.04em'
            }}
          >
            ~25 pages printed · 6-week sprint, $10K–$25K · Code from the live Penumbra Tech backend
          </p>
        </Container>
      </section>

      {/* ===================== Two-column shell (TOC + content) ===================== */}
      <div
        className="saas-shell"
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 240px) minmax(0, 1fr)',
          gap: space['2xl'],
          maxWidth: '1180px',
          margin: '0 auto',
          padding: `${space['2xl']} ${space.lg}`
        }}
      >
        {/* Sticky TOC */}
        <aside
          className="saas-toc saas-no-print"
          style={{
            position: 'sticky',
            top: '88px',
            alignSelf: 'start',
            maxHeight: 'calc(100vh - 110px)',
            overflowY: 'auto',
            paddingRight: space.md,
            borderRight: `1px solid ${colors.borderSubtle}`
          }}
        >
          <div
            style={{
              fontFamily: fonts.mono,
              fontSize: fontSizes.xs,
              color: colors.cyan,
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              marginBottom: space.md
            }}
          >
            Contents
          </div>
          <ol style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: fontSizes.sm, lineHeight: 1.6 }}>
            {CHAPTERS.map((c) => (
              <li key={c.id} style={{ marginBottom: space.xs }}>
                <a
                  href={`#${c.id}`}
                  style={{
                    color: colors.textSecondary,
                    textDecoration: 'none',
                    display: 'block',
                    padding: '4px 6px',
                    borderRadius: 4
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = colors.text;
                    e.currentTarget.style.background = colors.bgSoft;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = colors.textSecondary;
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <span style={{ color: colors.textMuted, fontFamily: fonts.mono, marginRight: 8 }}>
                    {c.num.padStart(2, '0')}
                  </span>
                  {c.title}
                </a>
              </li>
            ))}
          </ol>
          <div style={{ marginTop: space.xl, paddingTop: space.md, borderTop: `1px solid ${colors.borderSubtle}` }}>
            <a
              href={CAL_BOOKING_URL}
              target="_blank"
              rel="noreferrer noopener"
              style={{
                display: 'block',
                fontFamily: fonts.mono,
                fontSize: fontSizes.xs,
                color: colors.accent,
                background: 'transparent',
                border: `1px solid ${colors.accent}`,
                padding: '8px 12px',
                borderRadius: 4,
                textAlign: 'center',
                textDecoration: 'none',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: space.sm
              }}
            >
              Book a 30-min intro
            </a>
            <button
              onClick={() => window.print()}
              style={{
                width: '100%',
                fontFamily: fonts.mono,
                fontSize: fontSizes.xs,
                color: colors.cyan,
                background: 'transparent',
                border: `1px solid ${colors.cyan}`,
                padding: '8px 12px',
                borderRadius: 4,
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '0.08em'
              }}
            >
              Save as PDF
            </button>
          </div>
        </aside>

        {/* Content */}
        <article className="saas-content" style={{ maxWidth: '70ch' }}>
          {/* =========================== Foreword =========================== */}
          <section className="saas-chapter">
            <ChapterTitle num="0" id="foreword" title="You are not behind. You are mid-build." />
            <P>
              You are four months in. You can ship a feature in a
              morning. Your customers (or your alpha users) are
              starting to do interesting things in the product. And
              somewhere between three and six days a month you find
              yourself fixing TLS, debugging why a Stripe webhook
              failed, googling pm2 restart flags, or panicking that
              you do not actually have a recent database backup.
            </P>
            <P>
              None of that work moves the product forward. All of it
              is necessary. The math is the well-known one for any
              solo founder: every hour you spend on infra is an hour
              you do not spend on the thing that is actually
              differentiating your SaaS.
            </P>
            <P>
              This page is what a 6-week sprint looks like when you
              hand the infra work to somebody whose entire job is
              this. It is also a complete recipe. If you have the time
              and want to do it yourself, read the chapters straight
              through and you will end up with the same posture I
              would hand back. If you don&apos;t have the time, the
              same chapters tell you exactly what you are paying for
              and roughly how long each piece takes, so you can
              evaluate the trade honestly.
            </P>
            <P>
              The code below is from the actual Penumbra Tech backend
              that serves this site. None of it is hypothetical.
            </P>
            <Gotcha title="Before you start, read this">
              <P>
                The single most common reason a SaaS launches with a
                production incident is the founder thinking
                &ldquo;I&apos;ll harden it after launch.&rdquo; You
                will not. Launch always reveals three things you
                didn&apos;t plan for, and they will eat the bandwidth
                you reserved for hardening. The work in this playbook
                belongs before launch, or it stops being a sprint and
                starts being a series of 3am incident retros.
              </P>
            </Gotcha>
            <HireReframe title="What the engagement actually buys">
              The 6-week Build Sprint engagement is $10K–$25K depending
              on scope (auth complexity, payment volume, third-party
              integrations). Half paid up front, half on acceptance.
              Second half is not owed if week-one deliverables miss the
              agreed criteria. You keep the code, the deploy scripts,
              the runbook, and the AWS account from day one.
            </HireReframe>
          </section>

          {/* =========================== Week 0 — the audit =========================== */}
          <section className="saas-chapter">
            <ChapterTitle num="1" id="audit" title="Week 0 — the 30-minute audit" />
            <P>
              Before any work begins, the audit. You can do this on
              your own codebase in half an hour with grep and a
              checklist. Most of the answers will be either &ldquo;not
              yet&rdquo; or &ldquo;sort of.&rdquo; That is the
              starting point.
            </P>

            <H3>The ten things to check</H3>
            <CodeBlock label="Ten greps that tell you where you are">
{`# 1. Are sessions backed by a real store, or in-memory?
grep -rn "express-session\\|MemoryStore" --include="*.js" .

# 2. Is bcrypt cost 10+ (12 is better for production)?
grep -rn "bcrypt.hash\\|bcrypt.compare" --include="*.js" .

# 3. Are there rate limits on auth mutations?
grep -rn "express-rate-limit\\|rateLimit(" --include="*.js" .

# 4. Is Stripe webhook registered BEFORE express.json()?
grep -B2 -A2 "stripe\\|webhook" server.js | grep -i "raw\\|json"

# 5. Are secrets read from env with a fail-fast in prod?
grep -rn "process.env.SESSION_SECRET\\|process.env.DB_PASSWORD" .

# 6. Is /api/health (or equivalent) defined?
grep -rn "/health\\|/healthz" --include="*.js" .

# 7. Is there a global error handler?
grep -rn "app.use((err" --include="*.js" .

# 8. Are uncaughtException / unhandledRejection handled?
grep -rn "uncaughtException\\|unhandledRejection" --include="*.js" .

# 9. Is X-Powered-By disabled?
grep -rn "x-powered-by\\|disable.*powered" --include="*.js" .

# 10. Does anything do nightly DB backups?
crontab -l 2>/dev/null | grep -i "dump\\|backup"
find . -name "*.sh" -path "*backup*" 2>/dev/null`}
            </CodeBlock>

            <P>
              The number of those that come back empty is the rough
              shape of week 1. For most pre-launch SaaS, it is
              six-to-nine empty.
            </P>

            <Gotcha>
              <P>
                The audit is not a quality judgement. The codebase you
                wrote in four months is fine. It is, however,
                pre-production: the difference between a working app
                and a production-ready app is mostly the boring stuff
                this playbook covers.
              </P>
            </Gotcha>

            <HireReframe title="Week 0, hired out">
              The first week is exactly this audit, deeper. I clone
              your repo, walk through every endpoint, run the greps,
              check your DNS and TLS posture, look at your AWS bill
              and IAM setup, and end with a written prioritised list
              of what should change and what should not. If we move
              forward, week-one deliverables come from that list. If
              we don&apos;t, you keep the list.
            </HireReframe>
          </section>

          {/* =========================== Week 1 — secrets =========================== */}
          <section className="saas-chapter">
            <ChapterTitle num="2" id="secrets" title="Week 1 — secrets, auth, rate limits" />
            <P>
              The first week of real work is the security baseline.
              Three changes that together close the largest blast
              radii: hardened session config, rate-limited mutations,
              and a startup that refuses to boot in a misconfigured
              state.
            </P>

            <H3>Fail-fast on missing secrets</H3>
            <P>
              The <C>process.env.SESSION_SECRET || &apos;dev-default&apos;</C>{' '}
              fallback you see in every Express tutorial is fine in
              dev and dangerous in prod. If <C>.env</C> is misplaced
              or the env var isn&apos;t loaded, the app cheerfully
              boots with a hardcoded secret that is public on GitHub.
              Refuse to start instead.
            </P>
            <CodeBlock label="server.js — top of the file, before requires">
{`if (process.env.NODE_ENV === 'production') {
  const secret = process.env.SESSION_SECRET;
  if (!secret || /change-me|insecure|example/i.test(secret)) {
    console.error(
      'FATAL: SESSION_SECRET is missing or matches an example value. ' +
      'Set a long random value in .env before starting.'
    );
    process.exit(1);
  }
  if (process.env.COOKIE_SECURE !== 'true') {
    console.error('FATAL: COOKIE_SECURE must be "true" in production.');
    process.exit(1);
  }
}`}
            </CodeBlock>

            <H3>Timing-constant login</H3>
            <P>
              Hash passwords with <C>bcrypt</C> at cost 12. Then a
              subtle thing: when somebody tries to log in with an
              email that does not exist, do not skip the bcrypt
              comparison. If you do, your login route returns in 5ms
              for a non-existent user and 250ms for an existing one,
              and an attacker can enumerate your user list by timing
              alone. The fix is to always run the comparison, against
              a fake hash if necessary.
            </P>
            <CodeBlock>
{`const FAKE_HASH = bcrypt.hashSync('placeholder-for-timing', 12);

const user = await findUserByEmail(email);
const hash = user ? user.password_hash : FAKE_HASH;
const ok = await bcrypt.compare(submittedPassword, hash);

if (!user || !ok) {
  // Same response either way. Same timing either way.
  return res.status(401).json({ error: 'Invalid credentials' });
}`}
            </CodeBlock>

            <H3>Tiered rate limits</H3>
            <P>
              One global limit on <C>/api/*</C> as the safety net, a
              much tighter limit on auth mutations, and an even
              tighter one on anything that sends an email
              (forgot-password, contact form). Lets a real user use
              the product freely while making credential stuffing and
              email-flooding bots economically painful.
            </P>
            <CodeBlock>
{`const globalLimiter = rateLimit({
  windowMs: 60 * 1000, max: 100,
  standardHeaders: true, legacyHeaders: false,
  message: { error: 'Too many requests' }
});
app.use('/api', globalLimiter);

const authMutationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 10,
  message: { error: 'Too many attempts' }
});
app.use('/api/auth/login', authMutationLimiter);
app.use('/api/auth/register', authMutationLimiter);

const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, max: 5,
  message: { error: 'Too many password reset requests' }
});
app.use('/api/auth/forgot-password', forgotPasswordLimiter);`}
            </CodeBlock>

            <Gotcha>
              <P>
                If you sit behind a reverse proxy (nginx, ALB,
                Cloudflare), you need <C>app.set(&apos;trust proxy&apos;, 1)</C>{' '}
                BEFORE the rate limiter mounts, or every request looks
                like it came from your proxy&apos;s IP and one
                aggressive user immediately rate-limits everyone else.
              </P>
            </Gotcha>

            <HireReframe title="Week 1 in a Build Sprint">
              Week 1 ships as a single PR against your repo: the
              fail-fast block, the bcrypt + timing fix, the four rate
              limiters, plus a short README on what each tier protects
              and how to tune them. About a day of real work
              compressed into a clean review. The rest of week 1
              becomes the deeper audit findings from week 0.
            </HireReframe>
          </section>

          {/* =========================== Week 2 — Stripe =========================== */}
          <section className="saas-chapter">
            <ChapterTitle num="3" id="payments" title="Week 2 — Stripe (and what comes after Stripe)" />
            <P>
              If your SaaS takes payments via Stripe, there is exactly
              one mistake that will quietly burn three hours of your
              life and another six explaining it to the next engineer.
              It happens in the first ten lines of <C>server.js</C>.
            </P>

            <H3>The Stripe webhook ordering trap</H3>
            <P>
              Stripe signs webhooks with HMAC over the <em>raw</em>{' '}
              request bytes. If <C>express.json()</C> parses the body
              before your webhook handler runs, the bytes change
              (whitespace, key order), and signature verification
              silently fails forever. The fix is one line of careful
              ordering.
            </P>
            <CodeBlock label="server.js — order matters">
{`// Stripe webhook MUST be mounted BEFORE express.json():
app.post(
  '/api/payments/webhook',
  express.raw({ type: 'application/json' }),
  paymentsWebhookHandler
);

// THEN the global JSON parser:
app.use(express.json());`}
            </CodeBlock>

            <H3>Webhook idempotency</H3>
            <P>
              Stripe delivers webhooks at-least-once. Your handler will
              eventually be invoked twice for the same event (network
              flake, retry, your worker restarted mid-process). Stash
              every event id you process so you can short-circuit the
              second one.
            </P>
            <CodeBlock>
{`// SQL: a tiny table is enough
CREATE TABLE stripe_events (
  id VARCHAR(255) PRIMARY KEY,
  type VARCHAR(64),
  received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

// handler:
const event = stripe.webhooks.constructEvent(
  rawBody, req.headers['stripe-signature'], webhookSecret
);

const [existing] = await pool.query(
  'SELECT id FROM stripe_events WHERE id = ?', [event.id]
);
if (existing.length) return res.status(200).send('ok'); // already processed

await pool.query(
  'INSERT INTO stripe_events (id, type) VALUES (?, ?)',
  [event.id, event.type]
);
// ... now actually process the event ...`}
            </CodeBlock>

            <H3>Server-side state is the truth</H3>
            <P>
              Never trust the client to tell you what plan a user is
              on. The browser can lie; the URL can lie; the form
              parameters can lie. The Stripe webhook is the only place
              you flip a user&apos;s role / plan / subscription
              status. The frontend reads the role from your backend,
              not from Stripe Elements state. This is the same
              discipline that keeps a malicious user from upgrading
              themselves with curl.
            </P>

            <Gotcha>
              <P>
                The most common symptom of getting webhook ordering
                wrong is &ldquo;my webhooks worked yesterday and now
                they don&apos;t and Stripe&apos;s logs show signature
                verification failures.&rdquo; The cause is almost
                always somebody (or a refactor) moving the{' '}
                <C>express.json()</C> line above the webhook route.
                Add a code-comment shouting the constraint, because
                you <em>will</em> forget.
              </P>
            </Gotcha>

            <HireReframe title="The Week 2 deliverable">
              Week 2 in a Build Sprint covers the full Stripe
              integration if you don&apos;t have one yet (Payment
              Element rendering, subscription state machine, webhook
              handler, idempotency table, role-flip logic). If you
              already have Stripe wired up, week 2 is an audit + fix
              pass on the integration, plus the supporting pieces
              (refund handling, dunning emails, customer-portal embed
              for self-serve cancellation).
            </HireReframe>
          </section>

          {/* =========================== Week 3 — deploys =========================== */}
          <section className="saas-chapter">
            <ChapterTitle num="4" id="deploys" title="Week 3 — deploys without 3am surprises" />
            <P>
              Most solo SaaS deploys are some variant of &ldquo;SSH
              in, git pull, npm install, restart pm2 with my fingers
              crossed.&rdquo; That works fine until it doesn&apos;t,
              and the time it doesn&apos;t is always 11pm the night
              before a customer demo. Two improvements eliminate most
              of that risk.
            </P>

            <H3>Atomic deploys with a rollback</H3>
            <P>
              Your deploy script almost certainly does{' '}
              <C>rm -rf $WEB_ROOT/*</C> followed by{' '}
              <C>cp -r dist/* $WEB_ROOT/</C>. If the copy fails
              mid-flight (disk full, permission flap, network blip on
              a remote copy), the site is broken with no rollback
              path. Replace with a versioned-directory + symlink-swap
              pattern that takes a millisecond to roll back.
            </P>
            <CodeBlock>
{`STAMP=$(date +%s)
sudo mkdir -p /var/www/myapp-$STAMP
sudo cp -r dist/* /var/www/myapp-$STAMP/

# Atomic swap: ln -sfn replaces the symlink in one syscall.
sudo ln -sfn /var/www/myapp-$STAMP /var/www/myapp

# Keep the last 3 deploys for instant rollback.
cd /var/www && ls -t -d myapp-* | tail -n +4 | xargs -r sudo rm -rf

# nginx serves /var/www/myapp (the symlink), no reload needed.`}
            </CodeBlock>

            <P>
              To roll back: <C>sudo ln -sfn /var/www/myapp-PREV /var/www/myapp</C>.
              That is the entire rollback. No git revert, no rebuild,
              no second deploy.
            </P>

            <H3>Graceful process restarts</H3>
            <P>
              <C>pm2 restart</C> is a hard restart: in-flight requests
              fail. <C>pm2 reload</C> spawns a new worker first, waits
              for it to start, then drains and stops the old one.
              Same result, no dropped requests.
            </P>
            <CodeBlock>
{`# In your deploy script, swap restart -> reload:
pm2 reload your-backend --update-env

# For PM2 cluster mode, this gives you zero-downtime deploys.
# For a single-process app, it gives you "no client request gets killed
# mid-flight when you push" which is the same thing in practice.`}
            </CodeBlock>

            <Gotcha>
              <P>
                A t3.micro has 1GB of RAM. That is enough to run
                nginx + Node + MySQL in steady state. It is NOT enough
                to run <C>npm install</C> on a non-trivial React
                project, or <C>vite build</C> on anything past a few
                dozen modules. Those processes will be killed by the
                OOM killer mid-run with no useful error. Add a 2 GB
                swap file before your first deploy.
              </P>
              <CodeBlock>
{`sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab`}
              </CodeBlock>
            </Gotcha>

            <HireReframe title="How Week 3 ships">
              Week 3 lands the versioned-deploy script, the
              pm2 reload migration, the swap file, and a 30-line
              rollback runbook posted in your repo. The total work
              is small but it changes how you sleep on Sunday nights.
              I also write the GitHub Actions workflow that runs
              lint+build on every push so a broken commit never
              even reaches your deploy script.
            </HireReframe>
          </section>

          {/* =========================== Week 4 — monitoring =========================== */}
          <section className="saas-chapter">
            <ChapterTitle num="5" id="monitor" title="Week 4 — monitoring you will actually answer" />
            <P>
              Most solo SaaS monitoring stories are &ldquo;a customer
              emails me when the site is down.&rdquo; That is not a
              monitoring story; that is your customers monitoring your
              uptime for you, and reporting through a channel you
              don&apos;t read at 2am. Three pieces fix this.
            </P>

            <H3>An /api/health endpoint that actually tests health</H3>
            <P>
              Cheap liveness probe for UptimeRobot / future load
              balancers / PM2. Pings the DB with a trivial{' '}
              <C>SELECT 1</C> so a healthy 200 actually means &ldquo;the
              worker can talk to MySQL,&rdquo; not just &ldquo;the
              process is up.&rdquo;
            </P>
            <CodeBlock>
{`app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', uptime: process.uptime() });
  } catch (err) {
    res.status(503).json({ status: 'degraded', reason: 'db_unreachable' });
  }
});`}
            </CodeBlock>

            <H3>UptimeRobot (free tier, 50 monitors)</H3>
            <P>
              Sign up. New monitor → HTTP(s) → URL{' '}
              <C>https://yourdomain.com/api/health</C> → 5-minute
              interval → email alert contact. Verify the alert by
              stopping your backend on purpose; you should get a
              &ldquo;DOWN&rdquo; email within 6-10 minutes and an
              &ldquo;UP&rdquo; one shortly after you restart.
            </P>
            <P>
              <strong>Point it at <C>/api/health</C>, not the homepage.</strong>{' '}
              Your static frontend keeps loading even when the backend
              is dead, because nginx serves the HTML directly. The
              whole point of the health endpoint is that it exercises
              the live application path including the database
              round-trip. UptimeRobot must hit that path, not the
              static file. This is the single most common monitoring
              mistake and the one that lets a backend die overnight
              without you finding out.
            </P>

            <H3>Process-level catches + logrotate</H3>
            <P>
              Node will silently exit on an unhandled promise
              rejection. PM2 restarts the worker but every in-flight
              request fails. Wire all three handlers so the cause is
              traceable in PM2 logs.
            </P>
            <CodeBlock>
{`app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  if (res.headersSent) return next(err);
  res.status(500).json({ error: 'Internal server error' });
});

process.on('uncaughtException', (err) => {
  console.error('uncaughtException:', err);
  process.exit(1);   // clean exit so PM2 restarts cleanly
});
process.on('unhandledRejection', (reason) => {
  console.error('unhandledRejection:', reason);
  process.exit(1);
});`}
            </CodeBlock>
            <CodeBlock label="One-time pm2-logrotate setup">
{`pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
pm2 set pm2-logrotate:rotateInterval '0 0 * * *'`}
            </CodeBlock>

            <Gotcha>
              <P>
                Without logrotate, PM2&apos;s log files grow without
                bound and eventually fill your disk. The first symptom
                is usually <C>vite build</C> failing with{' '}
                <C>ENOSPC: no space left on device</C> the next time
                you deploy. The second symptom is the entire box
                wedging because MySQL can&apos;t write to its journal.
                10 minutes of one-time setup, never think about it
                again.
              </P>
            </Gotcha>

            <HireReframe title="Week 4 deliverable">
              Week 4 ships /api/health, the three error handlers, the
              UptimeRobot configuration, and pm2-logrotate. Total
              code: about 40 lines. Total time you have spent worrying
              about whether your server is up at 3am: zero, from this
              week forward.
            </HireReframe>
          </section>

          {/* =========================== Week 5 — backups =========================== */}
          <section className="saas-chapter">
            <ChapterTitle num="6" id="backups" title="Week 5 — backups and the recovery test" />
            <P>
              A backup that has never been restored is a file, not a
              backup. Two pieces: a nightly automated dump, and a
              one-time manual restore into a scratch database to prove
              the dump file actually contains your data.
            </P>

            <H3>Nightly mysqldump cron</H3>
            <P>
              Loads DB credentials from your existing <C>.env</C> so
              the script stays in sync with prod. Uses{' '}
              <C>--defaults-extra-file</C> with a 600-perm tempfile
              so the password never appears in <C>ps</C>. Sanity-checks
              the dump size and fails loud if the file is suspiciously
              small (less than 1KB usually means mysqldump errored
              silently).
            </P>
            <CodeBlock label="backup-db.sh">
{`#!/usr/bin/env bash
set -euo pipefail

ENV_FILE="$HOME/your-repo/backend/.env"
DB_USER="$(grep ^DB_USER= "$ENV_FILE" | cut -d= -f2-)"
DB_PASSWORD="$(grep ^DB_PASSWORD= "$ENV_FILE" | cut -d= -f2-)"
DB_NAME="$(grep ^DB_NAME= "$ENV_FILE" | cut -d= -f2-)"

sudo mkdir -p /backups && sudo chown "$USER:$USER" /backups

TMP_CNF="$(mktemp)"
trap 'rm -f "$TMP_CNF"' EXIT
cat >"$TMP_CNF" <<EOF
[client]
user=$DB_USER
password=$DB_PASSWORD
EOF
chmod 600 "$TMP_CNF"

mysqldump --defaults-extra-file="$TMP_CNF" \\
  --single-transaction --quick --routines --triggers \\
  --skip-lock-tables --set-gtid-purged=OFF --no-tablespaces \\
  "$DB_NAME" \\
  | gzip -c > "/backups/\${DB_NAME}_$(date +%F).sql.gz"

find /backups -maxdepth 1 -name "\${DB_NAME}_*.sql.gz" -mtime +14 -delete
echo "[$(date -Iseconds)] backup OK"`}
            </CodeBlock>
            <CodeBlock label="install the cron (3am daily)">
{`chmod +x backup-db.sh
sudo touch /var/log/your-backup.log
sudo chown $USER:$USER /var/log/your-backup.log
( crontab -l 2>/dev/null ; \\
  echo "0 3 * * * $HOME/backup-db.sh >> /var/log/your-backup.log 2>&1" ) \\
  | crontab -`}
            </CodeBlock>

            <H3>Restore drill (do this once)</H3>
            <P>
              Restore last night&apos;s dump into a scratch DB and
              confirm it has your data. Pick a weekend, ten minutes.
              If you skip this step you have a backup script, not a
              backup strategy.
            </P>
            <CodeBlock>
{`sudo mysql -e "CREATE DATABASE recovery_test;"
gunzip < /backups/yourdb_$(date +%F).sql.gz | sudo mysql recovery_test
sudo mysql recovery_test -e "SHOW TABLES; SELECT COUNT(*) FROM users;"
# Should list your tables and show a non-zero user count.
sudo mysql -e "DROP DATABASE recovery_test;"`}
            </CodeBlock>

            <Gotcha>
              <P>
                MySQL 8 mysqldump tries to dump tablespace metadata by
                default, which requires the server-wide PROCESS grant.
                Your app user should NOT have that. Pass{' '}
                <C>--no-tablespaces</C> and the dump succeeds without
                the warning. Skipping that flag produces a scary
                &ldquo;Access denied&rdquo; line on every nightly run
                that turns into log noise you eventually stop reading
                — which is the same as not having a backup.
              </P>
            </Gotcha>

            <HireReframe title="Week 5, hands-on">
              Week 5 in a Build Sprint adds the backup script, the
              cron, the log path, a weekly EBS snapshot via AWS CLI
              (if you want the &ldquo;whole-disk gone&rdquo; case
              covered), and the restore-drill runbook in your repo.
              We do the first restore together on a video call so
              you have seen the recovery path work end-to-end before
              you ever need it.
            </HireReframe>
          </section>

          {/* =========================== Week 6 — headers + handover =========================== */}
          <section className="saas-chapter">
            <ChapterTitle num="7" id="handover" title="Week 6 — security headers and the handover" />
            <P>
              The last week is the part most engagements skip and the
              part that decides whether the engagement was worth what
              you paid. Security headers everywhere they should be,
              and a written handover doc so future-you can operate
              the system without having to remember anything.
            </P>

            <H3>Five security headers in nginx</H3>
            <P>
              Default nginx ships with none of these. Adding them
              takes ten minutes and meaningfully changes your
              site&apos;s posture. Important nginx gotcha: if any
              child <C>location</C> block calls{' '}
              <C>add_header</C> (even just for cache control), nginx
              replaces every parent <C>add_header</C> for that
              location. Factor the security headers into an include
              file and call it from every location that adds
              anything.
            </P>
            <CodeBlock label="security-headers.snippet.conf">
{`add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' https://js.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' https: data:; font-src 'self'; connect-src 'self' https://api.stripe.com; frame-src 'self' https://js.stripe.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'" always;`}
            </CodeBlock>
            <CodeBlock label="In your server block, include it everywhere">
{`server {
    listen 443 ssl;
    include /path/to/security-headers.snippet.conf;

    location /api/ {
        # inherits the include above (no add_header here)
        proxy_pass http://127.0.0.1:3000;
    }

    location ~* ^/assets/ {
        include /path/to/security-headers.snippet.conf;  # MUST repeat
        add_header Cache-Control "public, max-age=31536000, immutable" always;
        try_files $uri =404;
    }

    location / {
        try_files $uri /index.html;
    }
}`}
            </CodeBlock>
            <P>
              Verify with{' '}
              <C>curl -sI https://yourdomain.com/ | grep -iE
              &apos;strict|frame|csp|referrer|nosniff&apos;</C>. You
              should see all five. If any one is missing on any
              specific path, that path has an{' '}
              <C>add_header</C> somewhere that is replacing the
              parent set.
            </P>

            <H3>The handover doc</H3>
            <P>
              A single Markdown file at the root of your repo. Six
              sections, each one short. The point is not to be
              comprehensive — it is to be findable when something
              breaks and the engineer is panicking.
            </P>
            <CodeBlock label="ops/RUNBOOK.md (template)">
{`# Production runbook

## How to deploy
\`./deploy.sh\` from the repo root. Builds frontend, pm2 reload backend,
reloads nginx, smoke-tests /api/health. Logs to /var/log/deploy.log.

## How to roll back
\`sudo ln -sfn /var/www/myapp-PREVIOUS /var/www/myapp\` — instant.
Find PREVIOUS with \`ls -t /var/www/myapp-* | head\`.

## Common incidents
- 502 from nginx: backend down. \`pm2 logs my-backend --lines 100\`.
- 503 with maintenance:true: somebody toggled maintenance mode.
  Flip back in the admin panel.
- /api/health says db_unreachable: MySQL down.
  \`sudo systemctl status mysql\`.

## Backups
Nightly mysqldump to /backups/. Retention 14 days.
Test restore quarterly with the script in ops/restore-drill.sh.

## Where everything lives
- App code: /home/USER/your-repo
- Web root: /var/www/myapp (symlink to /var/www/myapp-TIMESTAMP)
- nginx config: /etc/nginx/sites-available/myapp
- TLS certs: /etc/letsencrypt/live/yourdomain.com/
- PM2 logs: ~/.pm2/logs/
- DB backups: /backups/

## Contacts
- UptimeRobot dashboard: <url>
- Stripe dashboard: <url>
- Domain registrar: <name>
- DNS: Route 53, hosted zone <id>`}
            </CodeBlock>

            <Gotcha>
              <P>
                The single thing engagements regularly skip is the
                handover doc. The contractor ships, the codebase is
                fine, and three months later the founder cannot
                remember which directory the nginx config is in or
                where Let&apos;s Encrypt put the renewal cron. The
                doc takes one hour to write at the end of the
                engagement and saves the next debugging session.
              </P>
            </Gotcha>

            <HireReframe title="The handover week">
              Week 6 ships the nginx header fix, an updated CSP
              tuned to whichever third-party services your app
              actually uses (Stripe, analytics, fonts), and the
              runbook above filled in with your real paths,
              dashboards, and contact info. Plus a one-week
              bug-fix coverage window after handover — anything
              that breaks because of work I did in the sprint gets
              fixed at no charge for seven days.
            </HireReframe>
          </section>

          {/* =========================== Honest chapter =========================== */}
          <section className="saas-chapter">
            <ChapterTitle num="8" id="honest" title="The honest chapter" />
            <P>
              You have read the whole thing. Either you are now going
              to spend the next month doing this work yourself, or you
              are going to hire somebody. Both are correct answers
              depending on the variables. Here is the honest math.
            </P>

            <H3>If you DIY this</H3>
            <P>
              Expect 60-100 hours of real work. Not 60 hours of typing
              — 60 hours of typing, waiting, googling error messages,
              trying fixes that don&apos;t work, eventually finding
              the right one. The chapters above are the recipe; what
              you cannot see in the recipe is the time between the
              steps. That is where the actual cost lives.
            </P>
            <P>
              The hidden second cost is the ongoing tax. Once you
              have built this stack, you maintain it: a Node CVE every
              two weeks, an Ubuntu kernel upgrade every six, a TLS
              cert that almost always auto-renews. Budget two hours a
              month after the build is done, more if you add features
              that touch infrastructure.
            </P>

            <H3>If you hire this</H3>
            <P>
              A 6-week Build Sprint engagement runs $10K-$25K
              depending on scope. The high end is appropriate if your
              app has unusual integrations, a complex auth model, or
              you want me to also do the database schema review.
              Lower end if your app is conventional and the work is
              mostly the chapters above.
            </P>
            <P>
              The trade is straightforward. At a value-of-time over
              $80/hour, hiring is cheaper than DIY before you count
              the difference in what you ship to your customers
              during those weeks. At a value-of-time below $40/hour
              and a tolerance for the learning curve, DIY is fine.
              Between those numbers, it depends on whether you would
              rather be writing infra or writing product.
            </P>

            <H3>What you actually pay for</H3>
            <P>
              Speed. A consultant who has done this twenty times
              ships week 1&apos;s work in a day. You will ship the
              same work in a week the first time. That is not a
              criticism — it is what learning costs. The consultant
              is the one who already paid.
            </P>
            <P>
              Pattern recognition. Half of the chapters above are
              not in the official docs of the things they describe.
              Stripe&apos;s webhook ordering footgun is famous in
              the engineer community but absent from the Stripe
              quick-start. Same for nginx&apos;s add_header
              inheritance rule, the mysqldump tablespaces grant, and
              the bcrypt timing leak. The consultant has stepped on
              all of them already; the recipe you are reading is the
              compressed lessons from those mistakes.
            </P>
            <P>
              A second pair of eyes. The most useful thing about
              hiring somebody for a 6-week sprint is not the code
              they write — it is the questions they ask in week 1.
              The ones that go &ldquo;wait, what happens if a user
              deletes their account while a Stripe webhook is in
              flight?&rdquo; The chapters above will not catch every
              one of those for you. A senior engineer will.
            </P>

            <HireReframe title="The intro call, if it makes sense">
              The 30-minute intro call is genuinely free of pitch.
              We walk through your stack, what you have done, what
              you are stuck on, and I tell you honestly whether
              hiring me makes sense for your situation. Sometimes
              it does not — your app is conventional enough that
              the chapters above are everything you need, or you
              have a friend who already does this work and the
              right move is to ask them for two days. I will tell
              you. The call is worth your time either way.
            </HireReframe>
          </section>

          {/* =========================== Closing CTA =========================== */}
          <section
            className="saas-no-print"
            style={{
              marginTop: space['3xl'],
              padding: `${space['2xl']} ${space.xl}`,
              borderRadius: 16,
              background: colors.surface,
              border: `1px solid ${colors.border}`,
              textAlign: 'center'
            }}
          >
            <HudLabel tone="magenta">Six weeks, end to end</HudLabel>
            <h2
              style={{
                fontFamily: fonts.heading,
                fontSize: fontSizes['2xl'],
                fontWeight: fontWeights.bold,
                color: colors.text,
                margin: `${space.md} 0 ${space.md}`,
                letterSpacing: '-0.015em'
              }}
            >
              You build the product. I take the rest off your plate.
            </h2>
            <p
              style={{
                margin: `0 auto ${space.xl}`,
                maxWidth: '60ch',
                fontSize: fontSizes.md,
                color: colors.textSecondary,
                lineHeight: 1.65
              }}
            >
              Whether you build it yourself with the recipe above or
              you wire me $20K to do it, the chapters are yours. The
              30-minute intro is the next step either way.
            </p>
            <div
              style={{
                display: 'flex',
                gap: space.md,
                justifyContent: 'center',
                flexWrap: 'wrap'
              }}
            >
              <Button
                as="a"
                href={CAL_BOOKING_URL}
                target="_blank"
                rel="noreferrer noopener"
                size="lg"
              >
                Book a 30-min intro →
              </Button>
              <Button onClick={() => window.print()} variant="secondary" size="lg">
                Save this as PDF
              </Button>
            </div>
          </section>
        </article>
      </div>

      {/* Responsive: collapse the TOC to top-of-page on narrow viewports */}
      <style>{`
        @media (max-width: 900px) {
          .saas-shell {
            grid-template-columns: 1fr !important;
          }
          .saas-toc {
            position: static !important;
            max-height: none !important;
            border-right: none !important;
            border-bottom: 1px solid rgba(94, 234, 212, 0.10) !important;
            padding-right: 0 !important;
            padding-bottom: 1rem !important;
            margin-bottom: 2rem !important;
          }
          .saas-content {
            max-width: none !important;
          }
        }
      `}</style>
    </>
  );
}
