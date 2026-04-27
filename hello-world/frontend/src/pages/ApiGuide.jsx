// Public API guide / reference page.
//
// Lists every endpoint the backend exposes plus the underlying REST
// concepts they're built on. Educational for the class project; also
// serves as a self-audit document for the API surface.

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  marginBottom: '1.5rem',
  fontSize: '0.9rem'
}
const thStyle = {
  textAlign: 'left',
  borderBottom: '2px solid #d1d5db',
  padding: '0.4rem 0.5rem',
  background: '#f9fafb',
  fontWeight: 'bold'
}
const tdStyle = {
  borderBottom: '1px solid #e5e7eb',
  padding: '0.4rem 0.5rem',
  verticalAlign: 'top'
}
const codeStyle = {
  background: '#f3f4f6',
  padding: '0.1rem 0.35rem',
  borderRadius: 3,
  fontFamily: 'ui-monospace, monospace',
  fontSize: '0.85em'
}

function Method({ verb }) {
  const colors = {
    GET: '#15803d',
    POST: '#1d4ed8',
    PUT: '#b45309',
    DELETE: '#b91c1c'
  }
  return (
    <span
      style={{
        display: 'inline-block',
        background: colors[verb] || '#374151',
        color: 'white',
        padding: '0.05rem 0.4rem',
        borderRadius: 3,
        fontFamily: 'ui-monospace, monospace',
        fontSize: '0.75rem',
        fontWeight: 'bold',
        minWidth: 50,
        textAlign: 'center'
      }}
    >
      {verb}
    </span>
  )
}

function EndpointTable({ rows }) {
  return (
    <table style={tableStyle}>
      <thead>
        <tr>
          <th style={{ ...thStyle, width: 70 }}>Method</th>
          <th style={{ ...thStyle, width: 280 }}>Path</th>
          <th style={{ ...thStyle, width: 90 }}>Auth</th>
          <th style={thStyle}>Description</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>
            <td style={tdStyle}>
              <Method verb={r.method} />
            </td>
            <td style={{ ...tdStyle, fontFamily: 'ui-monospace, monospace', fontSize: '0.85em' }}>
              {r.path}
            </td>
            <td style={{ ...tdStyle, fontSize: '0.85em', color: '#6b7280' }}>
              {r.auth}
            </td>
            <td style={tdStyle}>{r.desc}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default function ApiGuide() {
  return (
    <div style={{ maxWidth: 880, margin: '0 auto', lineHeight: 1.65 }}>
      <h1 style={{ marginTop: 0 }}>API Guide</h1>
      <p style={{ color: '#6b7280' }}>
        A reference for every endpoint this site exposes, plus the REST
        principles the API follows. Every route lives under{' '}
        <code style={codeStyle}>/api</code> on{' '}
        <code style={codeStyle}>https://penumbrapro.duckdns.org</code>.
      </p>

      {/* -------- Table of contents -------- */}
      <nav
        style={{
          background: '#f9fafb',
          border: '1px solid #d1d5db',
          borderRadius: 8,
          padding: '0.75rem 1rem',
          margin: '1.5rem 0'
        }}
      >
        <strong style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Contents
        </strong>
        <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.25rem' }}>
          <li><a href="#stack">The stack</a></li>
          <li><a href="#rest">REST conventions</a></li>
          <li><a href="#status">Status codes</a></li>
          <li><a href="#auth">Authentication and sessions</a></li>
          <li><a href="#roles">User roles</a></li>
          <li><a href="#rate-limits">Rate limits</a></li>
          <li>
            Endpoints
            <ul>
              <li><a href="#endpoints-messages">Messages</a></li>
              <li><a href="#endpoints-auth">Auth</a></li>
              <li><a href="#endpoints-notes">Notes (QuickNotes)</a></li>
              <li><a href="#endpoints-boards">Boards (MoodBoard)</a></li>
              <li><a href="#endpoints-tasks">Tasks (TaskTrackr)</a></li>
              <li><a href="#endpoints-task-updates">Task updates (progress posts)</a></li>
              <li><a href="#endpoints-payments">Payments (Stripe subscriptions)</a></li>
              <li><a href="#endpoints-admin">Admin (Customer Service)</a></li>
            </ul>
          </li>
          <li><a href="#diverges">Where this API diverges from textbook REST</a></li>
        </ul>
      </nav>

      {/* -------- Stack -------- */}
      <h2 id="stack">The stack</h2>
      <ul>
        <li><strong>Backend:</strong> Node.js + Express, MySQL via{' '}
          <code style={codeStyle}>mysql2/promise</code></li>
        <li><strong>Sessions:</strong>{' '}
          <code style={codeStyle}>express-session</code> with{' '}
          <code style={codeStyle}>express-mysql-session</code> store —{' '}
          cookies are{' '}
          <code style={codeStyle}>HttpOnly + SameSite=Lax + Secure</code>{' '}
          (over HTTPS)</li>
        <li><strong>Frontend:</strong> React + Vite, react-router-dom for SPA routing</li>
        <li><strong>Hosting:</strong> single AWS EC2 Ubuntu instance, nginx in front, PM2
          managing the Node process, Let's Encrypt cert via DuckDNS</li>
      </ul>

      {/* -------- REST conventions -------- */}
      <h2 id="rest">REST conventions</h2>
      <p>
        The API uses HTTP method semantics to convey intent. Each method has specific
        properties around safety, idempotency, and cacheability:
      </p>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Method</th>
            <th style={thStyle}>Used for</th>
            <th style={thStyle}>Safe</th>
            <th style={thStyle}>Idempotent</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={tdStyle}><Method verb="GET" /></td>
            <td style={tdStyle}>Reading a resource or listing a collection</td>
            <td style={tdStyle}>Yes (no side effects)</td>
            <td style={tdStyle}>Yes</td>
          </tr>
          <tr>
            <td style={tdStyle}><Method verb="POST" /></td>
            <td style={tdStyle}>Creating a new resource or invoking an action</td>
            <td style={tdStyle}>No</td>
            <td style={tdStyle}>No (creates a new row each time)</td>
          </tr>
          <tr>
            <td style={tdStyle}><Method verb="PUT" /></td>
            <td style={tdStyle}>Updating fields on an existing resource</td>
            <td style={tdStyle}>No</td>
            <td style={tdStyle}>Yes (same body → same end state)</td>
          </tr>
          <tr>
            <td style={tdStyle}><Method verb="DELETE" /></td>
            <td style={tdStyle}>Removing a resource</td>
            <td style={tdStyle}>No</td>
            <td style={tdStyle}>Yes (gone is gone)</td>
          </tr>
        </tbody>
      </table>
      <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>
        <em>Idempotent</em> means calling N times produces the same end-state as
        calling once — important so a network blip retry can't compound damage.
        Only POST is non-idempotent here (you really do create a new note each time).
      </p>

      {/* -------- Status codes -------- */}
      <h2 id="status">Status codes</h2>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={{ ...thStyle, width: 70 }}>Code</th>
            <th style={{ ...thStyle, width: 200 }}>Meaning</th>
            <th style={thStyle}>When you'll see it</th>
          </tr>
        </thead>
        <tbody>
          <tr><td style={tdStyle}>200</td><td style={tdStyle}>OK</td><td style={tdStyle}>Successful read or update; body has the resource</td></tr>
          <tr><td style={tdStyle}>201</td><td style={tdStyle}>Created</td><td style={tdStyle}>POST that created a new resource; body has the new row</td></tr>
          <tr><td style={tdStyle}>400</td><td style={tdStyle}>Bad Request</td><td style={tdStyle}>Validation failed (missing field, malformed input)</td></tr>
          <tr><td style={tdStyle}>401</td><td style={tdStyle}>Unauthorized</td><td style={tdStyle}>No session cookie or session expired</td></tr>
          <tr><td style={tdStyle}>403</td><td style={tdStyle}>Forbidden</td><td style={tdStyle}>Authenticated but lacking required role or ownership</td></tr>
          <tr><td style={tdStyle}>404</td><td style={tdStyle}>Not Found</td><td style={tdStyle}>Resource doesn't exist or isn't yours (we return 404 either way to avoid leaking which IDs exist)</td></tr>
          <tr><td style={tdStyle}>409</td><td style={tdStyle}>Conflict</td><td style={tdStyle}>e.g. registering an email that's already taken</td></tr>
          <tr><td style={tdStyle}>413</td><td style={tdStyle}>Payload Too Large</td><td style={tdStyle}>File upload exceeded the per-tier size limit</td></tr>
          <tr><td style={tdStyle}>429</td><td style={tdStyle}>Too Many Requests</td><td style={tdStyle}>Rate limit hit; <code style={codeStyle}>RateLimit-*</code> headers tell you when you can retry</td></tr>
          <tr><td style={tdStyle}>500</td><td style={tdStyle}>Internal Server Error</td><td style={tdStyle}>Unexpected server-side bug; details are logged but never returned to the client</td></tr>
        </tbody>
      </table>

      {/* -------- Authentication -------- */}
      <h2 id="auth">Authentication and sessions</h2>
      <p>
        The API uses <strong>cookie-based session authentication</strong>. Successful{' '}
        <code style={codeStyle}>POST /api/auth/login</code> or{' '}
        <code style={codeStyle}>POST /api/auth/register</code> sets a cookie
        named <code style={codeStyle}>hello.sid</code>. That cookie is{' '}
        <code style={codeStyle}>HttpOnly</code> (so JavaScript can't read it,
        defending against XSS-based theft),{' '}
        <code style={codeStyle}>SameSite=Lax</code> (defending against most CSRF),
        and <code style={codeStyle}>Secure</code> (only sent over HTTPS).
      </p>
      <p>
        Every request after login automatically carries the cookie. Browsers handle
        this; from <code style={codeStyle}>fetch()</code> include{' '}
        <code style={codeStyle}>credentials: 'include'</code>. The session itself
        lives in the <code style={codeStyle}>sessions</code> table in MySQL —
        destroying the row (via logout) immediately revokes the session.
      </p>
      <p>
        On login the session ID is regenerated (defends against fixation), and login
        always runs a bcrypt comparison whether or not the email exists (defends
        against timing-based account enumeration).
      </p>
      <p>
        Password reset uses one-hour, single-use tokens. Only their{' '}
        <code style={codeStyle}>sha256</code> hash is stored — the plaintext only
        exists in the email sent to the user.
      </p>

      {/* -------- Roles -------- */}
      <h2 id="roles">User roles</h2>
      <p>
        The <code style={codeStyle}>users.role</code> column is a four-tier hierarchy.
        Each tier inherits everything below it. The role is re-read from the database
        on every gated request — never cached in the session — so a demotion takes
        effect immediately.
      </p>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Role</th>
            <th style={thStyle}>Capabilities</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={tdStyle}><code style={codeStyle}>user</code></td>
            <td style={tdStyle}>Default. Use the apps. Image uploads on task progress
              posts, capped at 10&nbsp;MB.</td>
          </tr>
          <tr>
            <td style={tdStyle}><code style={codeStyle}>premium</code></td>
            <td style={tdStyle}>+ Video uploads on task progress posts, capped at 100&nbsp;MB.</td>
          </tr>
          <tr>
            <td style={tdStyle}><code style={codeStyle}>admin</code></td>
            <td style={tdStyle}>+ Customer Service tool: search users, send manual password
              resets.</td>
          </tr>
          <tr>
            <td style={tdStyle}><code style={codeStyle}>super_admin</code></td>
            <td style={tdStyle}>+ Assign any role to any other user. Cannot change own role
              (backend blocks self-modification so a super admin can't accidentally lock
              everyone out).</td>
          </tr>
        </tbody>
      </table>

      {/* -------- Rate limits -------- */}
      <h2 id="rate-limits">Rate limits</h2>
      <p>
        Three tiers of rate limiting, all keyed by client IP (resolved from the
        nginx <code style={codeStyle}>X-Forwarded-For</code> header):
      </p>
      <ul>
        <li><strong>Global:</strong> 100 requests/minute/IP across all{' '}
          <code style={codeStyle}>/api/*</code> routes</li>
        <li><strong>Auth mutations:</strong> 10 requests / 15 minutes / IP for{' '}
          <code style={codeStyle}>/api/auth/login</code> and{' '}
          <code style={codeStyle}>/api/auth/register</code></li>
        <li><strong>Forgot-password:</strong> 5 requests / hour / IP for{' '}
          <code style={codeStyle}>/api/auth/forgot-password</code> (limits email
          spam potential)</li>
        <li><strong>Admin routes:</strong> 30 requests/minute/IP for{' '}
          <code style={codeStyle}>/api/admin/*</code></li>
      </ul>
      <p>
        Every response includes <code style={codeStyle}>RateLimit-Policy</code>,{' '}
        <code style={codeStyle}>RateLimit-Limit</code>,{' '}
        <code style={codeStyle}>RateLimit-Remaining</code>, and{' '}
        <code style={codeStyle}>RateLimit-Reset</code> headers so clients know
        their remaining budget without trial and error.
      </p>

      {/* -------- Endpoints -------- */}
      <h2>Endpoints</h2>

      {/* messages */}
      <h3 id="endpoints-messages">Messages — the original Hello World demo</h3>
      <EndpointTable
        rows={[
          { method: 'GET', path: '/api/messages', auth: 'public', desc: 'Returns the seeded messages from MySQL' }
        ]}
      />

      {/* auth */}
      <h3 id="endpoints-auth">Auth</h3>
      <EndpointTable
        rows={[
          { method: 'POST', path: '/api/auth/register', auth: 'public', desc: 'Create an account and log in. Body: { email, password }' },
          { method: 'POST', path: '/api/auth/login', auth: 'public', desc: 'Log into an existing account. Body: { email, password }' },
          { method: 'POST', path: '/api/auth/logout', auth: 'public', desc: 'Destroy the current session' },
          { method: 'GET', path: '/api/auth/me', auth: 'public', desc: 'Returns the current user (or null) including role' },
          { method: 'DELETE', path: '/api/auth/me', auth: 'required', desc: "Permanently delete the caller's account and all their data" },
          { method: 'POST', path: '/api/auth/forgot-password', auth: 'public', desc: 'Send a reset email if the address exists. Always returns the same generic response so attackers can\'t enumerate accounts.' },
          { method: 'POST', path: '/api/auth/reset-password', auth: 'public', desc: 'Consume a reset token and set a new password. Body: { token, password }' }
        ]}
      />

      {/* notes */}
      <h3 id="endpoints-notes">Notes — QuickNotes</h3>
      <EndpointTable
        rows={[
          { method: 'GET', path: '/api/notes', auth: 'required', desc: "List the caller's notes, newest-edited first" },
          { method: 'GET', path: '/api/notes/:id', auth: 'required', desc: 'One note (404 if it belongs to another user)' },
          { method: 'POST', path: '/api/notes', auth: 'required', desc: 'Create a new note. Body: { title, body }' },
          { method: 'PUT', path: '/api/notes/:id', auth: 'required', desc: 'Update title and/or body' },
          { method: 'DELETE', path: '/api/notes/:id', auth: 'required', desc: 'Delete the note' }
        ]}
      />

      {/* boards */}
      <h3 id="endpoints-boards">Boards — MoodBoard</h3>
      <EndpointTable
        rows={[
          { method: 'GET', path: '/api/boards', auth: 'required', desc: "List the caller's boards" },
          { method: 'POST', path: '/api/boards', auth: 'required', desc: 'Create a new board. Body: { name }' },
          { method: 'GET', path: '/api/boards/:token', auth: 'public', desc: 'Fetch one board + its images. Public so a share link works without login. Response includes can_edit:true when the caller is the owner.' },
          { method: 'PUT', path: '/api/boards/:token', auth: 'owner', desc: 'Rename a board. Body: { name }' },
          { method: 'DELETE', path: '/api/boards/:token', auth: 'owner', desc: 'Delete the board (cascades to images)' },
          { method: 'POST', path: '/api/boards/:token/images', auth: 'owner', desc: 'Add an image URL. Body: { url }. Validated http/https only.' },
          { method: 'DELETE', path: '/api/boards/:token/images/:imageId', auth: 'owner', desc: 'Remove an image' }
        ]}
      />

      {/* tasks */}
      <h3 id="endpoints-tasks">Tasks — TaskTrackr</h3>
      <EndpointTable
        rows={[
          { method: 'GET', path: '/api/tasks', auth: 'required', desc: "List the caller's tasks. Open tasks first, then by due date, then by recently updated." },
          { method: 'GET', path: '/api/tasks/:id', auth: 'required', desc: 'Fetch one task' },
          { method: 'POST', path: '/api/tasks', auth: 'required', desc: 'Create a task. Body: { title, description, due_date, category }' },
          { method: 'PUT', path: '/api/tasks/:id', auth: 'required', desc: 'Partial update — send only the fields that changed (used by auto-save)' },
          { method: 'DELETE', path: '/api/tasks/:id', auth: 'required', desc: 'Delete the task. Cascades to task_updates rows AND unlinks any uploaded media files from disk.' }
        ]}
      />

      {/* task updates */}
      <h3 id="endpoints-task-updates">Task updates — progress posts</h3>
      <EndpointTable
        rows={[
          { method: 'GET', path: '/api/tasks/:taskId/updates', auth: 'owner', desc: 'List updates for a task, newest first' },
          { method: 'POST', path: '/api/tasks/:taskId/updates', auth: 'owner', desc: 'Multipart form with optional body (text) and optional media (file). Image-only for free users (10 MB cap); image + video for premium+ (100 MB cap). At least one of body or media required.' },
          { method: 'DELETE', path: '/api/tasks/:taskId/updates/:id', auth: 'owner', desc: 'Delete an update and unlink its media file' },
          { method: 'GET', path: '/api/tasks/:taskId/updates/:id/media', auth: 'owner', desc: 'Stream the uploaded media bytes. Auth-checked on every request, so URLs are not capabilities.' }
        ]}
      />

      {/* payments */}
      <h3 id="endpoints-payments">Payments — Stripe subscriptions</h3>
      <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>
        Subscription billing for the Premium tier, integrated with Stripe.
        The frontend uses Stripe Elements (Payment Element) so card details
        are sent directly from the browser to Stripe — they never touch this
        server, which keeps PCI compliance scope at SAQ-A. The role flip
        from <code style={codeStyle}>user</code> to{' '}
        <code style={codeStyle}>premium</code> happens in the webhook
        handler, not in the frontend, because the webhook is the only
        trustworthy "did the payment actually clear" signal.
      </p>
      <EndpointTable
        rows={[
          { method: 'GET', path: '/api/payments/config', auth: 'required', desc: 'Returns the Stripe publishable key (safe to expose) and a configured flag the UI uses to detect missing env vars.' },
          { method: 'GET', path: '/api/payments/status', auth: 'required', desc: 'Returns { status, current_period_end, cancel_at_period_end, is_active } for the caller. status="none" if they have no record.' },
          { method: 'POST', path: '/api/payments/subscribe', auth: 'required', desc: 'Creates a Stripe customer (if needed) and a subscription with payment_behavior=default_incomplete. Returns { client_secret } for the frontend Payment Element to confirm. 400 if you already have an active subscription.' },
          { method: 'POST', path: '/api/payments/cancel', auth: 'required', desc: 'Sets cancel_at_period_end on the subscription. Premium access continues until the period ends; the webhook flips the role back to user when Stripe finally terminates.' },
          { method: 'POST', path: '/api/payments/webhook', auth: 'Stripe-signed', desc: 'Stripe-only endpoint. Verifies the signature against STRIPE_WEBHOOK_SECRET, dedupes by event id (stripe_events table), and updates user role on customer.subscription.* events. Returns 5xx on processing failure so Stripe retries.' }
        ]}
      />
      <p style={{ fontSize: '0.85rem', color: '#6b7280' }}>
        The webhook endpoint is registered with{' '}
        <code style={codeStyle}>express.raw()</code> in{' '}
        <code style={codeStyle}>server.js</code> BEFORE the global{' '}
        <code style={codeStyle}>express.json()</code> middleware, because
        Stripe signs the raw request bytes — pre-parsed JSON would fail
        signature verification.
      </p>

      {/* admin */}
      <h3 id="endpoints-admin">Admin — Customer Service</h3>
      <EndpointTable
        rows={[
          { method: 'GET', path: '/api/admin/users/search?q=...', auth: 'admin+', desc: 'Substring search on user emails. Returns up to 50 users with role, created_at, last_login_at. Logged to admin_actions audit table.' },
          { method: 'POST', path: '/api/admin/users/:id/send-password-reset', auth: 'admin+', desc: 'Trigger a reset email to a target user. Goes through the same code path as self-service forgot-password. Logged.' },
          { method: 'PUT', path: '/api/admin/users/:id/role', auth: 'super_admin', desc: 'Assign a role (user / premium / admin / super_admin) to another user. Self-modification blocked. Logged with from/to detail.' }
        ]}
      />

      {/* -------- What's missing / honest notes -------- */}
      <h2 id="diverges">Where this API diverges from textbook REST</h2>
      <p>Three honest concessions worth knowing about:</p>
      <ul>
        <li>
          <strong>PUT does partial updates</strong>, which is technically PATCH semantics.
          Strict REST says PUT replaces the whole resource. Our PUTs only modify
          fields present in the body, leaving others untouched. Pragmatic for our
          auto-save flows; not strictly conformant.
        </li>
        <li>
          <strong>DELETE on a non-existent resource returns 404 instead of 204.</strong>{' '}
          This breaks the strict "DELETE is idempotent" contract slightly. We picked
          404 for honesty — if the client thought it existed and it doesn't, that's
          worth surfacing.
        </li>
        <li>
          <strong>No pagination.</strong> List endpoints return everything for the
          caller. Fine for personal-data scale (a user has a few dozen tasks);
          breaks at scale. The right pattern is{' '}
          <code style={codeStyle}>?cursor=...&amp;limit=50</code> with a{' '}
          <code style={codeStyle}>next_cursor</code> in the response. Easy to add
          when needed.
        </li>
      </ul>
      <p>
        Other things a strict reviewer might call out: no API versioning (no{' '}
        <code style={codeStyle}>/api/v1/</code> prefix), no formal OpenAPI/Swagger
        spec, no{' '}
        <code style={codeStyle}>ETag</code>-based optimistic locking for concurrent
        edits, no idempotency keys for retried POSTs. All reasonable to skip at
        class-project scope; all worth knowing exist.
      </p>
    </div>
  )
}
