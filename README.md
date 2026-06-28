# Penumbra Tech (penumbra-tech.com) + demo apps

> Production source for **penumbra-tech.com** — a single-engineer
> consulting site (React + Vite + Express + MySQL on AWS EC2) plus the
> demo apps surfaced under `/projects/*`. The repo is named
> `WebDevClass` for historical reasons; every commit in here is
> production code now.

---

# Original deployment notes (kept verbatim below)

> **Heads-up for newcomers (2026-04 rebrand).** This repository now backs
> two related things on the same EC2 stack:
>
> 1. **Penumbra Tech** (`penumbra-tech.com`) — the new top-level site:
>    a consulting / portfolio landing page for tech consulting, software
>    development, game dev, and photography. The Penumbra Tech-branded
>    React app lives in `hello-world/frontend/` (yes, the folder still
>    reads "hello-world" for historical reasons — every commit in here is
>    real production code now, not class scaffolding).
> 2. **Demo projects (formerly "the class apps")** — the original
>    QuickNotes / MoodBoard / TaskTrackr / Subscribe / API Guide /
>    Diagnostics work still lives at the same routes (`/quicknotes`,
>    `/moodboard`, etc.) and is surfaced as portfolio evidence under
>    `/projects`. The original measurements, security hardening, and
>    architectural narrative below describe the same stack — they just
>    apply to the demo apps now rather than to the headline product.
>
> The rest of this README is the original deployment / architecture write-up
> for the underlying stack. Everything in it is still accurate: Penumbra
> Tech rides on the same Express + MySQL + nginx + PM2 + EC2 infrastructure
> with one additional table (`contacts`) and one additional API surface
> (`/api/contact` + `/api/admin/contacts`) for the contact form. The
> canonical hostname is **penumbra-tech.com** (served by a Let's Encrypt
> cert covering `penumbra-tech.com` and `www.penumbra-tech.com`).

## Overview

This project started as a basic full-stack "Hello, World" deployment and has grown into a small multi-app site sharing a single login. The stack is:

- **React + Vite** frontend with `react-router-dom` for client-side routing
- **Node.js + Express** backend with session-based auth and MySQL-backed sessions
- **MySQL 8** database with a numbered-migration workflow
- **Nginx** as the web server, reverse proxy, and TLS terminator
- **PM2** to keep the backend running
- **AWS EC2 Ubuntu** instance as the production server
- **Let's Encrypt** (via certbot + DuckDNS) for HTTPS
- **Git + GitHub** for version control and deployment

The deployed architecture looks like this:

```text
Browser
  |   (HTTPS)
  v
Nginx :443 (Let's Encrypt cert, auto-redirects :80 -> :443,
            HSTS / CSP / X-Frame-Options / Referrer-Policy headers)
  |
  +-- static files (React SPA) ---> /var/www/hello-app
  |
  +-- /api/messages              \
  +-- /api/auth/*                 \
  +-- /api/notes/*                 \
  +-- /api/boards/*                 \
  +-- /api/tasks/*                   >-- Node/Express :3000 ---> MySQL
  +-- /api/payments/*               /
  +-- /api/admin/*                 /   (requireAdmin / requireSuperAdmin)
  +-- /api/admin/diagnostics/*    /    (requireSuperAdmin, k6 + SSE)
  +-- /api/loadtest/*            /     (header-gated synthetic endpoints)
```

The site is live at **https://penumbra-tech.com**. Unauthenticated visitors see the seeded hello-world messages and a public **API Guide** documenting every endpoint. Logged-in users have access to:

- **QuickNotes** — user-scoped note list with full CRUD
- **MoodBoard** — image-URL boards, public share link, plus a client-side **Create Collage** feature that renders a downloadable portrait collage entirely in the browser
- **TaskTrackr** — task manager with categories, auto-saving edits, due-soon filter, and per-task progress updates. Free users can attach images (10 MB cap); Premium users can attach videos (100 MB cap).
- **Subscribe** — Stripe-backed Premium tier, $5/month, unlocks the larger upload tier. Real Stripe Elements card form with webhook-driven role activation.

Administrators have an **Admin Portal** that combines:

- the original user-search + manual password reset trigger
- a **role-management** UI (super_admin only) that promotes/demotes between four tiers: `user` → `premium` → `admin` → `super_admin`
- a **Diagnostics & Tests** subpage (super_admin only) with a button-driven k6 load test runner, live charts of req/s, latency percentiles, and CPU/memory, runtime toggles for the rate limiter and a site-wide maintenance banner, and a "true limit" hard-failure test demonstrating Node single-thread bottleneck

Every route in the site sits underneath a shared session login, and a persistent site footer (home, GitHub, phone, email, copyright) lives in `index.html` so it shows on every page regardless of which React route is active.

---

## What Was Installed on the Server

The EC2 instance was an **Ubuntu 24.04 LTS** server.

The following software was installed and verified:

- **Git** for pulling project code from GitHub
- **curl** for downloading setup files and testing endpoints
- **MySQL Server 8.0** for the production database
- **Nginx 1.24** for serving the frontend and proxying API requests
- **Node.js 22** from **NodeSource**
- **npm 10**
- **PM2 6** for managing the backend process
- **certbot** + **python3-certbot-nginx** (added later) for Let's Encrypt certificates and automatic renewal

### Package installation

Base packages were installed with:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git nginx mysql-server curl
```

Node.js 22 was installed using the NodeSource repository:

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x -o nodesource_setup.sh
sudo -E bash nodesource_setup.sh
sudo apt install -y nodejs
node -v
npm -v
```

PM2 was then installed globally:

```bash
sudo npm install -g pm2
pm2 -v
```

---

## AWS Setup That Ended Up Working

A single **Ubuntu EC2 instance** was used to host the whole application.

### Security group rules

The security group needed the following rules to make the deployment work:

#### Inbound rules

- **SSH (22)** from my IP
- **HTTP (80)** from anywhere
- **HTTPS (443)** from anywhere was also opened, although the deployed site was accessed over plain HTTP because HTTPS was not configured with a certificate

#### Outbound rules

This turned out to matter a lot.

At first, outbound traffic was too restricted. That caused several commands to hang when they tried to reach external package registries, and later caused `dig @8.8.8.8` to time out during HTTPS troubleshooting.

The rules that ended up being needed:

- **HTTPS (443)** outbound — for npm, apt, curl, and Node's outbound HTTPS calls
- **SMTP (TCP/587)** outbound — for the backend to submit password-reset emails to Gmail's SMTP server
- **DNS (UDP/53)** outbound — for direct DNS queries from the server (e.g. `dig @8.8.8.8`) during diagnostics
- **DNS (TCP/53)** outbound — DNS responses sometimes fall back to TCP

Interesting subtlety: the system's own DNS resolution worked even before the DNS rules were opened, because Ubuntu on EC2 resolves hostnames through the AWS VPC resolver via a link-local address that bypasses the security group. That is why `npm install` and `curl https://...` kept working, while `dig @8.8.8.8 penumbrapro.duckdns.org` timed out. Anything that relies on the system resolver is fine; only direct queries to external DNS servers need outbound 53.

---

## Main Problems Encountered and What Fixed Them

## 1. SSH login failed with `Permission denied (publickey)`

### Cause

The EC2 instance required the `.pem` private key and the SSH command had to use the full file path.

### Fix

Use the correct Ubuntu username and pass the full path to the key file:

```bash
ssh -i "C:\full\path\to\key.pem" ubuntu@PUBLIC_IP
```

Important detail: for Ubuntu EC2 instances, the default username is usually `ubuntu`.

---

## 2. Package downloads and npm installs hung with no progress

### Cause

This was not really a Node or npm problem. The EC2 instance could reach some package sources, but outbound HTTPS access was blocked by the security group.

That caused commands like these to hang:

- `npm ping`
- `curl -I https://registry.npmjs.org/`
- `npm install`
- `sudo npm install -g pm2`

### Fix

Open outbound **port 443** in the EC2 security group.

Once outbound 443 was allowed, npm and other HTTPS-based package downloads worked normally.

---

## 3. Ubuntu `apt` installed Node 18, but Vite needed a newer version

### Cause

Ubuntu 24.04 ships with Node 18 through the default package repositories, but the Vite-based frontend needed a newer Node version.

### Fix

Use **NodeSource** to install **Node 22** instead of relying on the default Ubuntu package version.

That resolved compatibility concerns for the frontend build.

---

## 4. `Ctrl+Z` caused confusion when stopping programs

### Cause

While testing backend processes, `Ctrl+Z` was used instead of `Ctrl+C`.

`Ctrl+Z` does **not** stop a program cleanly. It suspends it and leaves it hanging in the shell jobs list. That caused problems like port 3000 still being occupied even though it looked like the process had stopped.

This led to errors like:

```text
Error: listen EADDRINUSE: address already in use :::3000
```

### Fix

- Use **`Ctrl+C`** to stop a foreground program cleanly
- Use `jobs -l` and `kill` to clean up suspended jobs when needed

Example cleanup:

```bash
jobs -l
kill $(jobs -p)
```

---

## 5. `npm install` failed because `package.json` did not exist yet

### Cause

At one point, only stub folders existed on the server. The backend and frontend application files had not actually been created yet.

That meant commands like `npm install` failed because there was no `package.json` in the target directory.

### Fix

Create the actual application files before trying to install dependencies.

The final working structure became:

```text
WebDevClass/
  hello-world/
    backend/
      db.js
      server.js
      package.json
    frontend/
      src/
      index.html
      vite.config.js
      package.json
    init.sql
```

---

## 6. Git directories were not showing up correctly after pull

### Cause

Git does not track empty directories. Some folders only had placeholder text files, and the actual project files were not yet committed.

### Fix

Build out the actual project files, then commit and push those real files instead of relying on empty folders or stubs.

---

## 7. Browser initially showed `refused to connect`

### Cause

This turned out not to be an Nginx or server problem. The issue was that modern browsers often try **HTTPS first automatically**.

Since the deployment only had HTTP configured and no SSL certificate installed, the browser would try `https://PUBLIC_IP` and fail.

### Fix

Manually enter the URL with **`http://`**:

```text
http://PUBLIC_IP
```

This worked immediately once Nginx was correctly serving the app on port 80.

Important note: opening inbound port 443 alone does **not** make HTTPS work. Nginx still needs TLS certificate configuration for that.

---

## 8. GitHub push failed because password auth is not supported

### Cause

GitHub no longer supports password-based authentication for Git over HTTPS. On top of that, the account had two-factor authentication enabled.

### Fix

Use **SSH authentication** from the EC2 server to GitHub instead of HTTPS password auth.

That required:

1. Generating an SSH key on the EC2 server
2. Adding the **public key** to GitHub under **Settings -> SSH and GPG keys**
3. Setting the Git remote URL to the SSH form

Example remote:

```bash
git remote set-url origin git@github.com:penpro/WebDevClass.git
```

---

## 9. GitHub SSH authentication hung on port 22

### Cause

GitHub SSH defaults to port 22, and that connection was hanging.

### Fix

Configure SSH to use **GitHub over port 443** instead.

The working `~/.ssh/config` entry was:

```sshconfig
Host github.com
  HostName ssh.github.com
  Port 443
  User git
  IdentityFile ~/.ssh/Classwork
  IdentitiesOnly yes
```

That allowed `ssh -T git@github.com` to work over outbound 443.

---

## Database Setup

The MySQL database is named `hello_app`. It was bootstrapped on the EC2 server with `hello-world/init.sql`, which creates the database, the `hello_user` application user, and the seeded `messages` table:

- Hello from AWS MySQL
- This came through Node
- This is flowing into React

Everything added after that lives in numbered migration files under `hello-world/db/migrations/`, applied by `hello-world/db/migrate.sh`. The runner tracks applied filenames in a `schema_migrations` table, so it is safe to re-run and only executes files that have not been applied yet.

### Current tables in `hello_app`

- `messages` — the original seeded rows (hello world demo, unauthenticated)
- `users` — one row per account: `id`, `email` (unique, lowercased), `role` (one of `user` / `premium` / `admin` / `super_admin`, default `user`), `password_hash` (bcrypt), `created_at`, `last_login_at`
- `sessions` — backing store for `express-mysql-session`; shape dictated by the library (`session_id`, `expires`, `data`)
- `password_resets` — hashed reset tokens with expiry; the plaintext token is never stored, only `sha256(token)`
- `notes` — QuickNotes rows, scoped by `user_id` with `ON DELETE CASCADE`
- `boards` — MoodBoard boards, one per user, with a random `share_token` that doubles as the public URL identifier (`ON DELETE CASCADE` from users)
- `board_images` — image URLs belonging to a board (`ON DELETE CASCADE` from boards). Only URLs are stored; no image binaries are uploaded or hosted by this server
- `admin_actions` — durable audit log of every admin action (user search, password reset trigger, role change), with `admin_id`, `action`, `target_id`, JSON `detail`, and timestamp. Survives PM2 log rotation.
- `tasks` — TaskTrackr items with category, due date, completion state, and `user_id` (`ON DELETE CASCADE`)
- `task_updates` — Facebook-style progress updates on a task; text plus an optional uploaded media file path
- `stripe_events` — idempotency record of webhook events Stripe has delivered. Stripe is at-least-once, so we dedupe on the event id before applying any state changes.
- `schema_migrations` — filenames of applied migrations, with timestamps

### Migrations applied

Numbered migrations live in `hello-world/db/migrations/`:

- `001_add_auth_tables.sql` — creates `users`, `sessions`, `password_resets`
- `002_reconcile_users_and_add_notes.sql` — renames `hashed_password` → `password_hash`, adds `last_login_at`, declares `notes` (conditional ALTERs so it is safe on both existing and fresh databases)
- `003_add_moodboards.sql` — creates `boards` and `board_images`
- `004_add_user_roles.sql` — adds the `role` column to `users` (initial 2-tier `user`/`admin`)
- `005_add_admin_actions.sql` — durable audit log table for admin actions
- `006_add_tasks.sql` — TaskTrackr `tasks` table
- `007_add_task_updates.sql` — `task_updates` table for the Facebook-style progress feed
- `008_roles_and_media_rename.sql` — extends the role enum to four tiers (`user`, `premium`, `admin`, `super_admin`); renames the upload column to `media_path` to reflect that it can be image OR video
- `009_add_payments.sql` — adds `stripe_events` for webhook idempotency, plus columns on `users` for `stripe_customer_id` and `subscription_status`

### Adding a new migration

Any schema change goes in as `hello-world/db/migrations/NNN_description.sql`. On the server, running `./hello-world/db/migrate.sh` (or `./deploy_all.sh`) picks it up and applies it exactly once. See `002_reconcile_users_and_add_notes.sql` or `004_add_user_roles.sql` for an example that uses conditional ALTER statements so the same migration is safe on both an existing database and a fresh one.

### Promoting yourself to super_admin (bootstrap)

Migration 004 adds the `role` column and migration 008 extends it to four tiers, but neither promotes anyone. After running migrations on a fresh environment, the first **super_admin** has to be set by hand:

```bash
sudo mysql hello_app -e "UPDATE users SET role='super_admin' WHERE email='your.email@example.com';"
```

Log out and back in (or hard-refresh the browser) and the admin-only UI plus the Diagnostics & Tests link will appear. Once one super_admin exists, every other promotion/demotion can be done through the GUI on `/admin-portal`. See the **Four-Tier Role Hierarchy** section below for the full enum and what each tier unlocks.

---

## Backend Setup

The backend is **Node.js + Express**, talking to MySQL via `mysql2/promise`, managed by PM2 as the `hello-backend` process. It sits behind nginx (`app.set('trust proxy', 1)`) and terminates `/api/*` requests.

### Dependencies

Declared in `hello-world/backend/package.json`:

- `express` — HTTP server
- `mysql2` — MySQL client (promise interface)
- `dotenv` — loads `.env` at startup
- `bcryptjs` — password hashing
- `express-session` + `express-mysql-session` — sessions persisted in the `sessions` table
- `nodemailer` — password reset email delivery
- `express-rate-limit` — IP-based rate limiting on `/api/*` (4 tiers: global, auth-mutation, forgot-password, admin)
- `multer` (2.x) — multipart file upload handling for TaskTrackr progress media
- `stripe` — Stripe Subscriptions + Payment Element integration for the Premium tier

### Environment variables

The backend reads config from `hello-world/backend/.env` on the server (which is gitignored). `hello-world/backend/.env.example` documents the required keys:

- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` — MySQL connection
- `SESSION_SECRET` — signs the session cookie. Generate with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`
- `COOKIE_SECURE` — `true` once HTTPS is in place (sets the `Secure` flag on the session cookie)
- `APP_BASE_URL` — canonical site URL, used to build password-reset links. **No trailing slash.** The auth code concatenates `${APP_BASE_URL}/reset-password`, so a stray trailing slash produces `//` and breaks react-router matching. This has bitten the project more than once.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` — email delivery. When `SMTP_HOST` is blank, the mailer logs the full email to `pm2 logs hello-backend` instead of sending, which makes the password reset flow testable without real SMTP credentials.
- `PORT` — backend listen port (defaults to 3000)

### Routes

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/messages` | public | Original hello-world demo — returns the seeded rows |
| POST | `/api/auth/register` | public | Create account and log in |
| POST | `/api/auth/login` | public | Log in |
| POST | `/api/auth/logout` | public | Destroy session |
| GET | `/api/auth/me` | public | Current user with role (or `null`) |
| DELETE | `/api/auth/me` | required | Delete the current user's account |
| POST | `/api/auth/forgot-password` | public | Send a reset email (console fallback if no SMTP) |
| POST | `/api/auth/reset-password` | public | Consume a reset token and set a new password |
| GET | `/api/notes` | required | List the current user's notes |
| GET | `/api/notes/:id` | required | Fetch one of the user's notes |
| POST | `/api/notes` | required | Create a note |
| PUT | `/api/notes/:id` | required | Update a note |
| DELETE | `/api/notes/:id` | required | Delete a note |
| GET | `/api/boards` | required | List the current user's moodboards |
| POST | `/api/boards` | required | Create a new moodboard |
| GET | `/api/boards/:token` | public | Fetch one board + its images; `can_edit: true` when the caller is the owner |
| PUT | `/api/boards/:token` | required | Rename a board (owner only) |
| DELETE | `/api/boards/:token` | required | Delete a board (owner only) |
| POST | `/api/boards/:token/images` | required | Add an image URL (owner only) |
| DELETE | `/api/boards/:token/images/:imageId` | required | Remove an image (owner only) |
| GET | `/api/tasks` | required | List the current user's tasks |
| POST | `/api/tasks` | required | Create a task |
| PATCH | `/api/tasks/:id` | required | Update / complete / rename a task (auto-save on edit) |
| DELETE | `/api/tasks/:id` | required | Delete a task |
| GET | `/api/tasks/:id/updates` | required | List progress updates for a task |
| POST | `/api/tasks/:id/updates` | required | Add a progress update; multipart upload (image for `user`, image-or-video for `premium`+) |
| DELETE | `/api/tasks/:id/updates/:updateId` | required | Delete a progress update (owner only) |
| GET | `/api/payments/config` | public | Returns Stripe publishable key for the SPA |
| POST | `/api/payments/subscribe` | required | Create or reuse a SetupIntent + Subscription for the current user |
| POST | `/api/payments/cancel` | required | Cancel the user's subscription at period end |
| GET | `/api/payments/status` | required | Current subscription status (used by Subscribe page polling) |
| POST | `/api/payments/webhook` | Stripe-signed | Receives `customer.subscription.*` events, deduplicates via `stripe_events`, flips the user's role between `user` and `premium` |
| GET | `/api/admin/users/search?q=...` | admin | Search users by email substring (max 50 results) |
| POST | `/api/admin/users/:id/send-password-reset` | admin | Manually trigger a reset email for a target user |
| PUT | `/api/admin/users/:id/role` | super_admin | Change a user's role (one of the four tiers); blocks self-modification |
| GET | `/api/admin/diagnostics/scripts` | super_admin | Whitelisted k6 test scripts available to run from the GUI |
| GET | `/api/admin/diagnostics/runs/active` | super_admin | Re-attach to a currently-running test after a page reload |
| POST | `/api/admin/diagnostics/run` | super_admin | Spawn k6 against a whitelisted script (one run at a time) |
| POST | `/api/admin/diagnostics/stop/:runId` | super_admin | SIGTERM the running k6 child |
| GET | `/api/admin/diagnostics/stream/:runId` | super_admin | Server-Sent Events stream of k6 metrics, system samples, and logs |
| GET | `/api/admin/diagnostics/limiter` | super_admin | Read the runtime rate-limit-disabled flag |
| POST | `/api/admin/diagnostics/limiter` | super_admin | Flip the runtime rate-limit-disabled flag |
| GET | `/api/admin/diagnostics/maintenance` | super_admin | Read the runtime maintenance-mode flag |
| POST | `/api/admin/diagnostics/maintenance` | super_admin | Flip the runtime maintenance-mode flag |
| GET | `/api/loadtest/block?ms=N` | header-gated | Synthetic blocking endpoint (busy-waits N ms; clamped 0-1000). Requires `X-Diagnostic-Run` header matching an active run id; otherwise 404. |

Sessions are cookie-based: a cookie called `hello.sid` (HttpOnly, SameSite=Lax, Secure when HTTPS is live) references a row in the `sessions` table. Every mini app can protect its routes with the shared `requireAuth` middleware exported from `hello-world/backend/auth.js`, or with `requireAdmin` for admin-only endpoints.

A handful of defensive touches are already in place:

- Login always runs bcrypt against either the real hash or a placeholder, so request timing doesn't leak which emails are registered.
- `req.session.regenerate()` is called on login and register so old session IDs can't be reused.
- `/api/auth/forgot-password` always returns the same `{ok: true}` regardless of whether the email exists.
- Reset tokens are stored as `sha256(token)`; the plaintext only exists in the email the user receives.
- `requireAdmin` re-reads the current user's role from the database on every admin-guarded request, so demoting an account takes effect on the next admin action without waiting for the session to end.
- Both the self-service `/api/auth/forgot-password` flow and the admin-triggered `/api/admin/users/:id/send-password-reset` flow go through the same `sendPasswordResetForUser` helper, so token generation, hashing, expiry, and email delivery are guaranteed identical across both paths.

### Backend files

- `hello-world/backend/server.js` — Express app, rate limiters, session middleware, maintenance middleware, mounts each feature router
- `hello-world/backend/db.js` — MySQL connection pool
- `hello-world/backend/auth.js` — auth routes + `requireAuth`, `requireAdmin`, `requireSuperAdmin`, `sendPasswordResetForUser`, `loadCurrentUserRole`
- `hello-world/backend/notes.js` — QuickNotes CRUD routes
- `hello-world/backend/boards.js` — MoodBoard CRUD routes (mixed public/authed)
- `hello-world/backend/tasks.js` — TaskTrackr routes; uses a role-aware multer uploader (image-only for free users, image-or-video for premium+)
- `hello-world/backend/admin.js` — admin routes (search, password reset trigger, role change). Every state-changing call writes a row to `admin_actions`.
- `hello-world/backend/payments.js` — Stripe Subscriptions: `subscribe`, `cancel`, `status`, `config`, plus the `webhookHandler` exported separately so it can be mounted with `express.raw()` BEFORE `express.json()` (Stripe signs the raw bytes)
- `hello-world/backend/diagnostics.js` — super-admin diagnostics router: spawns k6, parses `--out json=-` into 1-second buckets, samples CPU/memory, streams events over SSE
- `hello-world/backend/loadtestEndpoints.js` — synthetic load-test endpoints (`/block?ms=N`); header-gated by an active diagnostic run id so they 404 to anyone else
- `hello-world/backend/rateLimiterState.js` — in-memory mutable flag the diagnostics page uses to toggle rate limiting at runtime without a `pm2 restart`. Initial value comes from `DISABLE_RATE_LIMITS` env var.
- `hello-world/backend/maintenanceState.js` — in-memory mutable maintenance-mode flag plus a Set of currently-active diagnostic run ids (used to bypass the 503 maintenance response for legitimate test traffic)
- `hello-world/backend/mailer.js` — nodemailer wrapper with console fallback

### Running the backend

Initially started under PM2:

```bash
cd ~/WebDevClass/hello-world/backend
pm2 start server.js --name hello-backend
pm2 save
```

With PM2 startup configured so the backend comes back after a reboot:

```bash
sudo env PATH=$PATH:/usr/bin /usr/local/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu
pm2 save
```

After that, `./deploy_backend.sh` at the repo root is how you pick up new code or env changes. See the **Deployment Workflow** section below.

---

## Frontend Setup

The frontend is **React + Vite** with `react-router-dom` for client-side routing. A shared `<AuthProvider>` wraps the router and exposes `useAuth()` (current user, `login`, `register`, `logout`) to every page.

### Pages and routes

| Route | Page | Auth required? |
|---|---|---|
| `/` | Home — hello world text, seeded messages, links to your apps | No |
| `/login` | Login form | No |
| `/register` | Create account | No |
| `/forgot-password` | Request reset email | No |
| `/reset-password?token=...` | Set a new password from a reset token | No |
| `/api-guide` | Public API reference: every endpoint, REST conventions, status codes, roles, rate limits | No |
| `/quicknotes` | QuickNotes mini app (list / create / edit / delete) | Yes — redirects to `/login` |
| `/moodboard` | Your MoodBoard boards | Yes — redirects to `/login` |
| `/moodboard/:token` | One moodboard; edit controls if you own it, read-only view otherwise. Public viewers also get the **Create Collage** button (read-only operation). | No (public share link) |
| `/tasktrackr` | TaskTrackr task manager: category sidebar, due-soon filter, auto-saving edits, Facebook-style progress feed per task | Yes — redirects to `/login` |
| `/subscribe` | Stripe-backed Premium subscription page (Payment Element, $5/month). Polls `/payments/status` after redirect to handle webhook timing. | Yes — redirects to `/login` |
| `/admin-portal` | Admin Portal: user search + manual password reset; super_admin also gets role assignment plus a banner link to Diagnostics | Yes, admin or super_admin |
| `/admin-portal/diagnostics` | Diagnostics & Tests: pick a k6 script and run it from the GUI with live charts and log streaming | Yes, super_admin only |
| `/customer-service` | Permanent redirect to `/admin-portal` (this page was renamed; old bookmarks keep working) | No |
| `/apps/apps.html` | Static mini-apps showcase | No |

The static showcase at `/apps/apps.html` lives under `hello-world/frontend/public/apps/`, which Vite copies into `dist/apps/` on build. Nginx serves it directly from `/var/www/hello-app/apps/apps.html` — the React SPA never sees the request.

`index.html` also hosts a persistent site footer (home, GitHub, phone, email, copyright) as a sibling of `<div id="root">`. That is outside React's control on purpose: the body uses a CSS grid (`grid-template-rows: 1fr auto`) so the footer always sits at the bottom of the viewport regardless of which React route is active and without React needing to know anything about the footer.

### Linking out of the SPA

One thing worth calling out because it bit this project twice: **inside React pages, link to the static showcase with a plain `<a href="/apps/apps.html">`, not a react-router `<Link to="/apps/apps.html">`.** `<Link>` triggers client-side navigation, so React Router tries to match the URL against its `<Routes>`, finds no match, and renders an empty layout. The user then sees just the site footer (which lives outside the React root in `index.html`) and thinks the React app is gone. The rule of thumb:

- **React route** (`/`, `/login`, `/quicknotes`, `/moodboard`, `/admin-portal`, …) → `<Link to="...">` (client-side)
- **Static HTML file** under `/apps/` or anything else served directly by nginx → plain `<a href="...">` (full page load)
- **External URL** → plain `<a href="...">`

If you ever see a page rendering "just the header and the footer, no content between them," suspect this first — it almost always means React Router got handed a URL that doesn't match any `<Route>`.

### Dependencies

Declared in `hello-world/frontend/package.json`:

- `react` + `react-dom`
- `react-router-dom` — SPA routing
- `@stripe/stripe-js` + `@stripe/react-stripe-js` — Stripe.js loader and the `<Elements>` / `<PaymentElement>` React components used on the Subscribe page
- `vite` + `@vitejs/plugin-react` (dev)
- `postcss` (overridden via the `overrides` field to `^8.5.10` to pull in the security fix; the version `vite-plugin-react` pinned was older)

The diagnostics page draws live charts with a small inline SVG `LineChart` component (~150 lines), not a third-party charting library. Adding `recharts` was tried briefly and reverted — it brings hundreds of source files for chart types we don't use (polar, radar, sankey, treemap, etc.), and Vite's tree-shaking pass on the t3.micro's 1 GB box was running it out of memory. The plain SVG implementation tree-shakes to zero overhead.

### Building and deploying

The build produces `dist/`, which gets copied into `/var/www/hello-app` and served by nginx:

```bash
cd ~/WebDevClass/hello-world/frontend
npm install
npm run build
sudo rm -rf /var/www/hello-app/*
sudo cp -r dist/* /var/www/hello-app/
sudo systemctl reload nginx
```

In practice, run `./deploy_frontend.sh` at the repo root — it wraps this and also verifies `dist/` was actually produced before wiping the web root, so a failed build can't accidentally take the site down.

The React app calls the backend via relative paths like `fetch('/api/messages')`, which nginx proxies to `127.0.0.1:3000`. Hardcoding `localhost:3000` in frontend code would be wrong for browser access.

---

## Nginx Setup

Nginx does three jobs now:

1. Serve the built frontend from `/var/www/hello-app`
2. Proxy `/api/*` requests to the backend running on `127.0.0.1:3000`
3. Terminate TLS with the Let's Encrypt certificate and redirect any plain-HTTP request to HTTPS

The `try_files $uri /index.html;` directive is what makes client-side routing work: any URL that doesn't match a real file (`/login`, `/register`, `/quicknotes`, …) falls through to `index.html`, and React Router takes over from there.

The original pre-HTTPS config was:

```nginx
server {
    listen 80;
    server_name _;

    root /var/www/hello-app;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        try_files $uri /index.html;
    }
}
```

After creating the config, the default site was disabled and this one was enabled:

```bash
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf /etc/nginx/sites-available/hello-app /etc/nginx/sites-enabled/hello-app
sudo nginx -t
sudo systemctl reload nginx
```

Once certbot ran with the `--nginx` plugin it edited this file in place — moving the original block onto port 443 with TLS directives, and adding a second small block on port 80 that redirects everything to HTTPS. The post-certbot version of `/etc/nginx/sites-available/hello-app` is roughly:

```nginx
server {
    server_name penumbrapro.duckdns.org;

    root /var/www/hello-app;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        try_files $uri /index.html;
    }

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/penumbrapro.duckdns.org/fullchain.pem;       # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/penumbrapro.duckdns.org/privkey.pem;     # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf;                                   # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;                                     # managed by Certbot
}

server {
    if ($host = penumbrapro.duckdns.org) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    listen 80;
    server_name penumbrapro.duckdns.org;
    return 404; # managed by Certbot
}
```

---

## HTTPS Setup (DuckDNS + Let's Encrypt)

Let's Encrypt only issues certificates for domain names, not bare IPs, and this project doesn't own a real domain. [DuckDNS](https://www.duckdns.org/) solves that by handing out free subdomains under `duckdns.org` that can point at any IP. Let's Encrypt treats them as real domains and issues trusted certificates for them.

### 1. DuckDNS

In a browser:

1. Go to https://www.duckdns.org and sign in (Google / GitHub / Twitter / Reddit)
2. Pick a subdomain and click **add domain**
3. Paste the EC2 public IP into the **current ip** field and click **update ip**

After a few seconds, `dig +short YOURNAME.duckdns.org` on the server should return the EC2 IP.

### 2. Install certbot

Use the apt package (not `snap` or `pip`) so the systemd renewal timer is set up automatically:

```bash
sudo apt update
sudo apt install -y certbot python3-certbot-nginx
```

### 3. Tell nginx the domain exists

Before running certbot, change `server_name _;` in `/etc/nginx/sites-available/hello-app` to `server_name YOURNAME.duckdns.org;` and reload nginx:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

This matters because certbot's nginx plugin finds the right server block by matching `server_name`.

### 4. Run certbot

```bash
sudo certbot --nginx -d YOURNAME.duckdns.org
```

It asks for an email (for renewal notifications), agreement to the Let's Encrypt terms of service, and whether to redirect HTTP to HTTPS — answer **yes** to the redirect. On success it edits the nginx config as shown above and reloads nginx.

### 5. Flip the backend into HTTPS mode

In `hello-world/backend/.env`:

```env
COOKIE_SECURE=true
APP_BASE_URL=https://YOURNAME.duckdns.org
```

Then `./deploy_backend.sh` to restart PM2 and pick up the new env. `COOKIE_SECURE=true` sets the `Secure` flag on the session cookie so it never travels over plain HTTP. `APP_BASE_URL` is baked into password-reset email links — **no trailing slash**, for the reason discussed in the Backend section.

### 6. Verify

```bash
curl -I https://YOURNAME.duckdns.org         # expect 200
curl -I http://YOURNAME.duckdns.org          # expect 301 redirecting to https
sudo systemctl list-timers certbot.timer     # shows the renewal timer
```

Then in a browser, test the full login / QuickNotes / password-reset flow over HTTPS.

### Gotchas encountered

- **CAA query timeouts from Let's Encrypt.** On the first certbot run it may fail with `DNS problem: query timed out looking up CAA for YOURNAME.duckdns.org`. This is not a config problem — Let's Encrypt's own DNS resolvers are slow to reach DuckDNS sometimes. Retry after a minute or two and it almost always succeeds. This is *not* affected by the EC2 security group (the CAA check happens from Let's Encrypt's infrastructure, not yours).
- **Raw-IP URLs stop working for HTTPS.** The cert is issued to the domain name, so `https://<raw-ip>` throws a certificate-mismatch warning. Plain `http://<raw-ip>` also doesn't redirect because there is no nginx server block matching the IP. Always use the domain URL. Optionally you can add a `listen 80 default_server; server_name _; return 301 https://YOURNAME.duckdns.org$request_uri;` catch-all server block in nginx to bounce any unknown host to the canonical domain.
- **IP changes.** Stopping and starting the EC2 instance releases its public IP; the DuckDNS record then points at nothing. Either update the IP on duckdns.org after the restart, or allocate an **Elastic IP** and associate it with the instance so the public IP stays fixed. This project uses an Elastic IP.

---

## Email Delivery (Gmail SMTP)

Password-reset emails are sent through Gmail's SMTP server using an **app password** tied to a regular Google account. No SendGrid / SES / Mailgun account is required. This is appropriate for class-project scale (Gmail allows ~500 outgoing messages per day per account).

`hello-world/backend/mailer.js` is a thin wrapper around `nodemailer`: when `SMTP_HOST` is set in `.env`, it sends real email; when `SMTP_HOST` is blank, it prints the message body to `pm2 logs hello-backend` instead. That means the password-reset flow is testable end-to-end without any SMTP configuration at all — useful for local development and for verifying the flow works before wiring up real delivery.

### 1. Generate a Gmail app password

In a browser, signed into the Google account you want to send from:

1. Make sure **2-Step Verification** is enabled at https://myaccount.google.com/security (Google requires it before letting you create app passwords)
2. Go to https://myaccount.google.com/apppasswords
3. Enter an app name like `WebDev class SMTP` and click **Create**
4. Copy the 16-character password that appears in the dialog. Google will not show it again — if it's lost, generate a new one and replace it in `.env`

The app password is a bearer credential for that account's SMTP. Treat it as sensitive. It can be revoked from the same page at any time without affecting the main account password.

### 2. Fill in `.env` on the server

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your.email@gmail.com
SMTP_PASS=abcdefghijklmnop
SMTP_FROM=WebDev Class <your.email@gmail.com>
```

Notes:
- Strip the spaces out of the app password. `abcd efgh ijkl mnop` becomes `abcdefghijklmnop`.
- `SMTP_FROM`'s email address **must match** `SMTP_USER`. Gmail's SMTP server will silently rewrite mismatched from-addresses, or reject the send. The `Name <address>` format for `SMTP_FROM` is fine and shows up nicely in the recipient's inbox.
- Port **587** (STARTTLS) is what `mailer.js` is wired for; port 465 (implicit TLS) also works but the current code expects 587 unless you explicitly use 465.

Then restart the backend:

```bash
cd ~/WebDevClass
./deploy_backend.sh
```

### 3. Outbound port 587

The backend's SMTP submission goes out on **TCP 587**, so the EC2 security group needs an outbound rule allowing that port. Add it in the AWS console: EC2 → Security Groups → yours → Outbound rules → Edit → Add rule → Custom TCP, port 587, destination `0.0.0.0/0` → Save.

Without this rule the first send attempt hangs or fails with `ETIMEDOUT` / `ECONNREFUSED` against `smtp.gmail.com:587`.

### 4. Verify

From the server:

```bash
curl -sX POST https://penumbra-tech.com/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"your.email@gmail.com"}'
pm2 logs hello-backend --lines 20 --nostream
```

When real SMTP is in play, the PM2 log should show **no** `--- email (no SMTP configured, logging to console) ---` block — that only appears in the fallback path. The real path is silent on success. Check your inbox (and the spam folder on first send — Gmail sometimes routes the very first self-send to spam until reputation is established).

### Common failures

| Error | Cause | Fix |
|---|---|---|
| `535-5.7.8 Username and Password not accepted` | Wrong app password, or a real account password was pasted | Regenerate the app password and re-paste (spaces removed) |
| `535-5.7.14 Please log in via your web browser` | Google's anti-abuse block on first SMTP auth from a new IP | Sign into the Google account from a browser once to clear the block |
| `ECONNREFUSED` or `ETIMEDOUT` on `smtp.gmail.com:587` | Outbound TCP 587 blocked by the security group | Add the outbound rule described in step 3 |
| Email arrives but from a different address than `SMTP_FROM` | `SMTP_FROM`'s email didn't match `SMTP_USER` | Make them match |

---

## Final Verification Steps

The deployment is verified in a few ways.

### Local checks on the server

Test the backend directly:

```bash
curl http://127.0.0.1:3000/api/messages          # 200 + seeded rows
curl http://127.0.0.1:3000/api/auth/me           # 200 + {"user":null}
curl http://127.0.0.1:3000/api/notes             # 401 + {"error":"Authentication required"}
```

Test nginx:

```bash
curl -I https://penumbra-tech.com                # 200
curl -I http://penumbra-tech.com                 # 301 -> https
```

### Browser test

Open **https://penumbra-tech.com** and walk through:

1. Home page loads with the seeded messages
2. Register or log in
3. Header flips to "Signed in as …"
4. `/quicknotes` loads; create / edit / delete a note
5. Log out
6. `/forgot-password` → enter email → `pm2 logs hello-backend --lines 20 --nostream` on the server prints the reset URL in the console-fallback output (or it lands in a real inbox once SMTP is configured)
7. Paste the reset URL in a browser, set a new password, log back in

---

## Production Change Test

A production change was tested by inserting a new row directly into the database on the server:

```bash
sudo mysql -e "USE hello_app; INSERT INTO messages (text) VALUES ('This is my production change test');"
```

Refreshing the deployed page showed the new row immediately.

Screenshots were taken before and after to document the change.

---

## Deployment Workflow

All code, SQL, and shell scripts are edited and committed locally, pushed to GitHub, pulled on the EC2 server, and executed there. Nothing runs on the local machine directly. The repo contains shell scripts that wrap every step so the server side is a one-liner.

### The four scripts

At the repo root:

- **`deploy_all.sh`** — one-shot deploy: `git pull` → apply DB migrations → install backend deps and restart PM2 → rebuild frontend and reload nginx. This is the usual thing you run.
- **`deploy_backend.sh`** — just the backend: `npm install` in `hello-world/backend/` and `pm2 restart hello-backend --update-env` (or a fresh `pm2 start` if the process isn't there yet). Use this when you only changed backend code or `.env`.
- **`deploy_frontend.sh`** — just the frontend: `npm install`, `npm run build`, copy `dist/*` into `/var/www/hello-app/`, reload nginx. Verifies `dist/` was actually produced before wiping the web root.
- **`hello-world/db/migrate.sh`** — applies any `.sql` files in `hello-world/db/migrations/` that aren't already recorded in `schema_migrations`. Idempotent.

### Normal change flow

On the local machine:

```bash
# edit files
git add <paths>
git commit -m "Describe the change"
git push
```

On the EC2 server:

```bash
cd ~/WebDevClass
./deploy_all.sh
```

That's it for the common case. Use the narrower scripts when you want to skip the parts you didn't change:

```bash
git pull && ./deploy_backend.sh    # backend-only change
git pull && ./deploy_frontend.sh   # frontend-only change
git pull && ./hello-world/db/migrate.sh   # schema-only change
```

**Important:** only `deploy_all.sh` runs `git pull` for you. The three narrower scripts all operate on whatever source is currently in the working tree, so running `./deploy_frontend.sh` without a prior `git pull` silently rebuilds from stale code — it looks successful but nothing changes in production. The `git pull && ...` idiom above is the safe form. This separation is intentional (you may want to review what changed before applying it), but the trade-off is that you have to remember the pull step.

### Schema changes

Any schema change goes in as a new migration file under `hello-world/db/migrations/`, named `NNN_description.sql`. Commit it, push, and running `./deploy_all.sh` (or `./hello-world/db/migrate.sh` directly) on the server will apply it exactly once. The runner prints `[apply]` or `[skip]` for each file so you can see what happened.

For one-off ad-hoc data fixes on the server (seeding a row, patching a value), `sudo mysql hello_app -e "..."` is still fine. The migrations system is for schema and reproducible seed data, not for routine data edits.

### Environment changes

`hello-world/backend/.env` lives only on the server (gitignored). After editing it, run `./deploy_backend.sh` so PM2 picks up the new values. `hello-world/backend/.env.example` in the repo documents which keys are required; update that file when new keys are added.

### Pre-commit checklist

- `.env` is not in `git status` (it is gitignored, but double-check)
- `node_modules/` is not in `git status`
- Shell scripts stay LF-ending on checkout (`.gitattributes` enforces this for `*.sh` and `*.sql` to avoid CRLF surprises on the Linux server)

---

## Security Hardening

Several layers of defence-in-depth are now in place beyond the original session/auth setup:

### Rate limiting

`express-rate-limit` runs in `hello-world/backend/server.js` with four IP-based tiers, all keyed on `req.ip` (which honors `X-Forwarded-For` because of `app.set('trust proxy', 1)`):

| Limiter | Window | Max | Applies to |
|---|---|---|---|
| Global | 1 minute | 100 req | Everything under `/api/*` |
| Auth-mutation | 15 minutes | 10 req | `/api/auth/login`, `/api/auth/register` |
| Forgot-password | 1 hour | 5 req | `/api/auth/forgot-password` |
| Admin | 1 minute | 30 req | `/api/admin/*` (NOT `/api/admin/diagnostics/*` — see below) |

The auth-mutation and forgot-password limits exist because every login does a bcrypt comparison (expensive) and every forgot-password request can send an email (abusable). The global limit is a generic safety net at 100 req/min — generous enough to never bother a real user, tight enough to slow a naive scraper.

`express-rate-limit`'s `skip` callback on each limiter consults a runtime-mutable flag from `hello-world/backend/rateLimiterState.js`, initialized from `DISABLE_RATE_LIMITS=true` in `.env`. The Diagnostics page can flip the flag without a `pm2 restart`. Process restart reverts to the env-var default, so a forgotten "off" toggle can't outlive a process lifetime.

### Nginx security headers

`hello-world/nginx/security-headers.conf` is a versioned include file pulled into the HTTPS server block:

```nginx
include /home/ubuntu/WebDevClass/hello-world/nginx/security-headers.conf;
```

It sets:

- `Strict-Transport-Security: max-age=31536000; includeSubDomains` — browsers force HTTPS for a year
- `X-Content-Type-Options: nosniff` — prevent MIME sniffing
- `X-Frame-Options: DENY` — anti-clickjacking
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Content-Security-Policy` — strict allowlist; same-origin `default-src` plus narrowly-scoped exceptions for `js.stripe.com`, `api.stripe.com`, `maps.stripe.com`, and `hooks.stripe.com` so the Stripe Payment Element can render and confirm payments. `frame-ancestors 'none'` overrides X-Frame-Options on modern browsers.
- `client_max_body_size 110m` — accommodates the 100 MB premium video upload plus multipart envelope. Multer enforces the actual per-tier limit on the application side.

Keeping headers in a versioned `.conf` file (instead of hand-editing certbot-managed blocks) means they survive future certbot renewals.

### Durable admin audit log

Every state-changing admin action writes a row to the `admin_actions` table in addition to logging via `console.log`:

| Column | Meaning |
|---|---|
| `admin_id` | Who did it |
| `action` | `user_search`, `send_password_reset`, `change_role` |
| `target_id` | The affected user (nullable for searches) |
| `detail` | JSON blob with action-specific context (search query, target email, role from/to) |
| `created_at` | When |

This survives PM2 log rotation, so "who changed which user's role last month" stays answerable. The audit insertion is in a try/catch — losing an audit row is preferable to 500-ing the action that already succeeded.

---

## Four-Tier Role Hierarchy

The `users.role` enum holds one of four values, in increasing order of privilege:

1. **`user`** — default. Owns notes, boards, tasks. Free upload tier (image only, ≤10 MB).
2. **`premium`** — paid via Stripe ($5/month). Same as `user` plus video uploads up to 100 MB on TaskTrackr progress posts.
3. **`admin`** — staff. Can search users and trigger password reset emails on their behalf.
4. **`super_admin`** — like `admin`, plus can change other users' roles and access the Diagnostics & Tests page.

### Middleware

- `requireAuth` — any logged-in user
- `requireAdmin` — `admin` OR `super_admin`
- `requireSuperAdmin` — `super_admin` only

All three re-read the role from the database on every request. Role information is **never cached in the session**, so a demoted account loses access immediately on its next request rather than waiting for the session to end. Also: super_admins cannot demote themselves (the role-change endpoint blocks self-modification) so the admin team can't accidentally lock everyone out of role management.

### Promoting a user

The first super_admin still has to be set by hand on a fresh database:

```bash
sudo mysql hello_app -e "UPDATE users SET role='super_admin' WHERE email='your.email@example.com';"
```

After that, a super_admin can promote/demote everyone else through the GUI on `/admin-portal`. Every change is logged to `admin_actions` with the from-role and to-role recorded in the JSON `detail`.

---

## TaskTrackr

Third mini-app, parallel to QuickNotes and MoodBoard. Lives at `/tasktrackr`.

- **Category sidebar** — left nav lists distinct categories; click one to filter
- **Due-soon filter** — counts and surfaces tasks due within 7 days OR already overdue (the count and the filter share a single predicate so they're guaranteed consistent)
- **Auto-saving edits** — changing the title, body, or due date PATCHes the row after a 500 ms debounce; no explicit save button
- **Mark complete UX** — explicit "Mark complete" / "Completed" label, click-to-expand hint when collapsed, `window.confirm` before flipping the state (it's a destructive-feeling action, even though it's reversible)
- **Progress updates** — Facebook-style append-only feed under each task. Each update has text and an optional uploaded media file. Free `user` accounts can attach images up to 10 MB; `premium` accounts can attach videos up to 100 MB.

### Multer 2.x with role-aware limits

Uploads are handled by `multer` (2.x — the 1.x branch went into maintenance mode). The TaskTrackr router exposes two uploader instances and picks one per request based on the user's role:

- Free tier: `image/*` mime types only, 10 MB cap
- Premium+: `image/*` OR `video/*`, 100 MB cap

The role check happens at request time (after `requireAuth`), so a user who upgrades to premium between page loads gets the larger uploader on the very next request.

Uploaded files land on the EC2 instance's local disk under `hello-world/backend/uploads/` and are served by nginx through a `location /uploads/` block. Originals are kept; no thumbnailing or transcoding.

---

## MoodBoard Collage

Extension to MoodBoard added to the public viewer (works for the owner AND for anyone holding the share link — it's a read-only operation).

A **Create Collage** button below the image grid generates a downloadable portrait-orientation collage of the board entirely client-side. No backend involvement, no server storage. The implementation is a pure utility module at `hello-world/frontend/src/lib/collage.js`:

- **Seeded PRNG** (Mulberry32 keyed off the board's `share_token`) — same board produces the same layout across reloads, so the experience feels deterministic
- **5–7 slot portrait layouts** (1200×1600 canvas, 3:4 aspect) with multiple variants per slot count; the seeded PRNG picks which variant to use
- **Cover-crop drawing** for each real image (matches CSS `object-fit: cover`) so images always fill their slot with no letterboxing
- **Pastel accent fills** when the board has fewer images than slots: for each empty slot, the algorithm samples the center third of an adjacent real image down to a 1×1 pixel (the browser's bilinear scaling does the averaging in C++ for us, no per-pixel JS), inverts the color to its complement, then washes it 60% toward white minus 20 to land in pastel territory. The result is a soft accent that harmonizes with the neighbouring image. Zero perceptible compute cost.
- **Per-click variation + diagonal fill from corner** — every click reshuffles the seed so the user can spin a few options without losing determinism within one click
- **Padding, corner radius, and theme controls** — small UI under the preview lets the user tweak the look before downloading

Output is a `image/jpeg` blob at quality 0.92 written into a temporary `<a download>` link. Blob URLs are revoked on close/unmount to avoid memory leaks.

---

## API Guide Page

`/api-guide` is a public, browse-anywhere reference for the entire HTTP API. It documents:

- **REST conventions** the project follows (resource-oriented URLs, HTTP-verb semantics, JSON in/out, status code meanings, standard error envelope `{error: "..."}`)
- **Every endpoint** with its method, path, auth requirement, request shape, success body, and error cases
- **Roles** required per endpoint (any of: public, required, admin, super_admin, Stripe-signed, header-gated)
- **Rate limits** that apply (which of the four limiter tiers covers each path)
- **Webhook handling** for Stripe — what events we listen for and how idempotency is enforced via `stripe_events`

The page is intentionally public and unauthenticated — there's nothing here that wouldn't already be visible to anyone reading the source on GitHub. Documenting it gives a clean self-service onboarding for anyone (a future class collaborator, a reviewer, the grader) who wants to understand the surface area without spelunking the routers.

---

## Stripe Subscriptions (Premium Tier)

`/subscribe` lets a logged-in user upgrade to the **Premium** role for $5/month. Premium unlocks the larger TaskTrackr upload tier (videos up to 100 MB instead of images-only at 10 MB).

The integration uses Stripe **Subscriptions** with the **Payment Element**, not Stripe Checkout. The card form renders inline on the Subscribe page so the user never leaves our site, and PCI compliance stays straightforward because card data is entered into a Stripe-hosted iframe — our JS never sees it.

### Backend (`hello-world/backend/payments.js`)

| Route | Purpose |
|---|---|
| `GET /api/payments/config` | Returns the Stripe **publishable** key (safe to expose) so the SPA can `loadStripe(...)` |
| `POST /api/payments/subscribe` | Creates or reuses a Stripe Customer for this user, then a SetupIntent + Subscription. Returns the SetupIntent client secret. |
| `POST /api/payments/cancel` | Cancels the user's subscription at period end (they keep premium until the period rolls over) |
| `GET /api/payments/status` | Reports the current subscription state. The Subscribe page polls this after redirect to handle the webhook race. |
| `POST /api/payments/webhook` | Stripe-signed events: `customer.subscription.created`, `.updated`, `.deleted`. Each event is keyed by `event.id` against the `stripe_events` table for idempotency (Stripe is at-least-once; same event can arrive twice). |

The webhook is mounted with `express.raw({ type: 'application/json' })` **before** the global `express.json()` middleware. Stripe signs the raw bytes; if `express.json()` parses the body first, the bytes change (whitespace, key order) and the HMAC signature fails. This was non-obvious until it bit us — the rest of the API uses parsed JSON, but this one route specifically needs the original `Buffer`.

The webhook handler ONLY ever flips the user's role between `user` and `premium`. It will never touch `admin` or `super_admin` accounts: an admin who's been promoted won't get demoted to `user` if their subscription expires, and a paying admin won't be downgraded to plain `user` either. That decoupling means staff status is independent of payment status.

### Frontend (`hello-world/frontend/src/pages/Subscribe.jsx`)

The page wraps `@stripe/react-stripe-js`'s `<Elements>` provider around a `<PaymentElement>` form. On submit, it calls `stripe.confirmSetup({ ... return_url: ... })`. Stripe redirects the user back with `?redirect_status=succeeded`, which triggers a polling effect that hits `/api/payments/status` every 1.5 s up to 30 s, showing an "Activating your subscription…" interim screen until the webhook lands and updates the role server-side. Without that polling, users would land on a stale "subscribe" page after a successful payment because the webhook hadn't quite caught up to the redirect.

### CSP additions

The Payment Element loads JS from `js.stripe.com`, posts to `api.stripe.com` and `maps.stripe.com`, and renders its 3D Secure / card-input iframes from `js.stripe.com` and `hooks.stripe.com`. All four origins had to be allowlisted in the CSP in `hello-world/nginx/security-headers.conf`. With CSP off the form silently fails to render — there's no console error in default Chrome, just an empty space where the card form should be.

### .env additions

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_PRICE_ID=price_...
```

---

## Stress Testing &amp; Benchmarks

A class learning objective for the project was to choose a load testing tool, establish a baseline, find bottlenecks, optionally fix one, and re-measure. The chosen tool was **k6** (single Go binary, JS-scripted tests, percentile output, free) installed via the official apt repo on the EC2 instance:

```bash
sudo gpg --no-default-keyring \
  --keyring /usr/share/keyrings/k6-archive-keyring.gpg \
  --keyserver hkp://keyserver.ubuntu.com:80 \
  --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" \
  | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt update && sudo apt install -y k6
```

The five test scripts live in `hello-world/loadtests/` and target progressively heavier scenarios:

| Script | Profile | Target |
|---|---|---|
| `homepage.js` | 50 VUs / 30s, no rate-limit interference | `GET /` (static `index.html` via nginx) |
| `api-baseline.js` | 10 VUs / 60s, paced under the 100 req/min limit | `GET /api/messages` (real DB read) |
| `api-stress.js` | Ramp 10→50→100 VUs / 3 min, no sleep | `GET /api/messages` |
| `api-overload.js` | Ramp 50→200→500 VUs / 4 min, no sleep | `GET /api/messages` |
| `api-block.js` | Ramp 20→60→120 VUs / ~3 min | `GET /api/loadtest/block?ms=100` (synthetic blocking endpoint) |

All five scripts read `__ENV.DIAG_RUN_ID` and attach it as an `X-Diagnostic-Run` header when present. The Diagnostics page sets that env var when it spawns k6 so the test traffic carries a per-run bearer token that bypasses maintenance mode and gates the synthetic loadtest endpoints. CLI-launched runs without the env var still work; you just need maintenance to be off and you can't reach the synthetic endpoints (they 404 without a valid token).

### Actual limits found

These numbers come from real runs on the t3.micro production instance, not theoretical estimates.

| Test | Throughput | Latency p(95) | Errors | What we learned |
|---|---|---|---|---|
| **Homepage** (50 VUs, static file) | **475 req/s** | **2.4 ms** | 0% | nginx serving a static 200 KB `index.html` is essentially free on this hardware. We never approached its ceiling — would need many more VUs from a different machine to find it. |
| **API baseline** (10 VUs, paced under limiter) | 1.5 req/s | 9.99–88.89 ms | 0% | Real "Express + MySQL behind nginx" latency. The wide p(95) range across runs reflects connection pool warmth: a cold pool's first query pays the reconnect cost (~80 ms tail), a warm pool serves in single-digit ms. Median was always ~3 ms. |
| **API stress** (limiter ON) | 1500 req/s attempted, 1.66 req/s admitted | 63 ms (mostly 429s) | 99.89% | Exactly **300 successful** requests over 3 min — matches the 100 req/min × 3 min budget. The rate limiter is the **first** bottleneck, intentionally and aggressively so. |
| **API stress** (limiter OFF) | **998 req/s sustained** | **108 ms** | 0% | Real application ceiling for `/api/messages`. CPU pinned at ~90% on the 2-vCPU box (using burst credits). Latency barely degraded vs. the unloaded baseline (~20 ms increase from 89 to 108 ms) — the system scales gracefully across this range. |
| **API overload** (ramp to 500 VUs, limiter OFF) | 944 req/s | 553 ms | 0% | Throughput plateaus around 1000 req/s regardless of how many more VUs we throw at it (k6 itself starts competing for CPU). Latency climbs unboundedly as queue depth grows — graceful degradation, not crash. The lesson: a CPU-saturated Node + MySQL + nginx stack stays *correct* under siege, just slow. |
| **API event-loop block** (synthetic 100 ms blocker) | **9.86 req/s** | **11.83 s** | 0% | The classic Node single-thread failure mode. Throughput is exactly `1 / 100ms = 10 req/s`, regardless of VU count. CPU sits at ~50% (one core saturated, the other idle — Node doesn't use it). p(95) hit nearly 12 seconds; nginx's 60 s `proxy_read_timeout` was the only thing keeping us out of 504 territory. The diagnostics page itself goes briefly unresponsive during the worst of it — that **is** the demonstration. |

### What this tells us about the t3.micro

- **Static content (nginx)** can do hundreds of req/s without breaking a sweat; the ceiling is well above where we measured.
- **API + MySQL** ceiling is around **1000 req/s** for a cached small SELECT, with p(95) under 200 ms. CPU is the bottleneck.
- **Rate limiter** is currently set 600× more restrictive than the actual application capacity. That's correct — it exists to make brute force expensive, not to match capacity. The app has enormous headroom for legitimate spikes.
- **t3.micro is "burstable"**: 2 vCPUs that earn CPU credits at idle and spend them when busy. Default mode is **unlimited**, so AWS bills small overage instead of throttling once credits are exhausted. A 3-minute test fits comfortably inside burst credits on a fresh box; a sustained-hours test would either throttle or charge.
- **Memory: 1 GB total**, of which MySQL takes ~377 MB and node + nginx + system take another ~200 MB. **There is no swap by default.** Operating with ~370 MB free for any one-shot work (like `vite build`) is dangerous; we hit OOM-thrash during a deploy and had to reboot. **A 2 GB swap file is now configured** (`/swapfile`, `swapon`'d, persisted in `/etc/fstab`) which removes the dead-lock failure mode at the cost of some swap-spilled latency under extreme pressure.
- **The single-threaded event loop is the easiest way to take this server down** — a single misbehaving handler that does sync work blocks every other request on the process. The `api-block.js` test makes this dramatic: 0% errors but p(95) latency in the multi-second range with 60 VUs hitting an endpoint that does a 100 ms busy-wait. The fix is `worker_threads` or `cluster` — we have not implemented a worker-thread version yet, but it would be the logical "optimization" to demonstrate the before/after.

### Adding swap (if you're starting from a fresh t3.micro)

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
free -h   # should show Swap: 2.0Gi
```

This was the missing piece in the original deploy. Production-grade EC2 setups always have swap; the default Ubuntu image doesn't.

---

## Diagnostics &amp; Tests Page

A super-admin-only GUI at `/admin-portal/diagnostics` for running the load tests above without dropping to the SSH shell.

### What the page does

- **Pick a script** from the whitelisted list (homepage, api-baseline, api-stress, api-overload, api-block)
- **Run / Stop** buttons. Only one test can run at a time globally — a second `POST /run` while one is active returns 409.
- **Three live charts** (custom inline SVG `LineChart`, ~150 lines, no chart library):
  - **Requests/sec + errors/sec** (blue + red lines)
  - **Latency p50 / p95 / mean** in ms
  - **Server CPU % + memory %** (sampled from `os.cpus()` deltas + `os.freemem()` every 1 s)
- **Status badge** that cycles: yellow "Running" → green "Completed ✓" / red "Stopped" / red "Failed"
- **Live log panel** streaming k6's stderr line-by-line, with a **Copy** button (lucide-style two-rectangle clipboard icon, "Copied" / "Copy failed" feedback)
- **Summary card** with totals and percentiles (p50/p95/p99/max) computed across the entire run, server-side, from the full duration array (not the bucketed data)

### How the streaming works

`hello-world/backend/diagnostics.js` spawns k6 with `--out json=-` so its metrics come over the child's stdout as newline-delimited JSON. The router parses each line, drops every individual data point into a 1-second aggregation bucket per run, and once per second emits one `k6_bucket` event over **Server-Sent Events** with `{count, p50, p95, mean, failedCount}`. A 1500 req/s test would otherwise drown the browser in events.

The `os.cpus()` delta sampler runs on the same 1-second tick, so CPU/memory and request metrics arrive in lock-step.

The SSE endpoint (`GET /stream/:runId`) replays history first so a refreshed client sees the full timeline before live events resume. The page also queries `/runs/active` on mount and re-attaches to any in-flight run, so a tab close + reopen during a 4-minute test is a non-event.

### Runtime toggles

Two pill-shaped toggles next to the Run/Stop buttons:

- **Rate limiter** (green ON / red OFF) — flips a runtime flag in `rateLimiterState.js` that all four `express-rate-limit` instances consult through their `skip` callback. No `pm2 restart` needed.
- **Maintenance** (green OFF / yellow ON) — flips `maintenanceState.js`. When ON, a sticky yellow banner appears across every page of the site for everyone, and an Express middleware returns 503 with `{maintenance: true}` for all `/api/*` paths **except** the explicit bypass list:
  - `/api/auth/*` — admins must always be able to log in
  - `/api/admin/*` — admins must always be able to reach the toggle to flip it back off
  - `/api/payments/webhook` — Stripe is at-least-once but we don't gain anything by dropping these intentionally

The maintenance toggle is **deliberately not locked while a test is running** so that if a runaway test is hurting the site and the auto-disable hasn't fired, the manual override is still available.

### Auto-trigger for "real users see maintenance"

The two heaviest scripts (`api-overload`, `api-block`) auto-enable maintenance on run start and auto-disable on run end / stop / spawn-error. Real visitors hit the maintenance banner instead of timeout-hung requests. The auto-clear is gated on a `didEnableMaintenance` flag per run so a manually-toggled maintenance state is never clobbered by the test.

### Bypass token for test traffic

If maintenance is on AND the test traffic itself goes through the maintenance middleware, every k6 request gets 503'd and the test measures the 503-rejection path instead of the application. To avoid that, the diagnostics router generates a 128-bit cryptographically-random run id, registers it in `maintenanceState`'s active-set, and passes it to the k6 child as `DIAG_RUN_ID`. Each k6 script reads the env var and attaches `X-Diagnostic-Run: <id>` to its requests. The maintenance middleware bypasses 503 if the header value matches a currently-active id.

**Security model for that bypass header:**

- The token is 128 bits of entropy, valid only during a 30 s–4 min test run, and unregistered on close/error/spawn-failure. Brute-forcing 2^128 inside a 4-minute window is infeasible.
- The header value flows only into `Set.has(string)` — never interpolated, never logged, never reflected. There is no code-injection vector.
- Maintenance is an **operational** flag, not a security boundary. A successful bypass grants only "the site is reachable"; every endpoint behind it still enforces `requireAuth` / `requireAdmin` / `requireSuperAdmin` independently.
- The header **cannot** enable maintenance or change any state. Toggling still requires a super_admin session on `POST /api/admin/diagnostics/maintenance`.

### Recovery layers

If a test wedges the box, in order of softness:

1. **Click the Maintenance toggle off** on the diagnostics page (the toggle stays reachable because `/api/admin/*` is always bypassed)
2. **Click Stop** on the test — the auto-clear on close fires anyway
3. **SSH + curl** the toggle endpoint with the admin's session cookie
4. **`pm2 restart hello-backend`** — in-memory flags reset to env-var defaults (which means: rate-limiter ON, maintenance OFF)
5. **AWS console reboot** — last resort; instance comes back clean

The fact that every flag is in-memory only means a process restart is always a clean reset. There is no persistent "stuck on forever" failure mode for either the rate limiter or maintenance mode.

---

## Key Lessons Learned

### From the original hello-world deploy

- Security group **outbound** rules matter, not just inbound rules
- If npm, curl, or package downloads hang, check outbound **HTTPS 443** first
- Ubuntu's default Node package may be too old for modern frontend tooling — use **NodeSource** for a newer Node
- **Ctrl+C** stops a process, while **Ctrl+Z** suspends it and leaves it hanging on the port
- Git does not track empty directories
- GitHub password authentication is gone — use SSH keys, and SSH over port 443 when normal SSH hangs
- Nginx is a clean way to serve the frontend and hide the backend behind `/api`

### From the shared-auth + HTTPS + mini-apps work

- **Don't run scripts on the local machine.** This repo's workflow is strictly push-pull-run: commit locally, pull on the server, run a `.sh` script there. Anything that needs to happen on the server must live in a committed script, not in your memory.
- **Only `deploy_all.sh` pulls.** `deploy_backend.sh`, `deploy_frontend.sh`, and `migrate.sh` all run against whatever source is in the working tree. Running one of them without `git pull` first silently rebuilds from stale code and looks successful. Always `git pull && ./deploy_frontend.sh` (etc.) when using the narrower scripts.
- **Use numbered migration files for every schema change**, even one-line ALTERs. The migration runner tracks what's been applied, so "what state is prod in?" stays answerable over time. Conditional dynamic SQL (`information_schema` + `PREPARE` / `EXECUTE`) lets one migration be safe on both existing and fresh databases.
- **In a React SPA living alongside static HTML pages, use `<Link>` for React routes and plain `<a>` for anything served directly by nginx (`/apps/*`, external URLs).** `<Link to="/apps/apps.html">` tries to match against React Router's routes, fails, and renders a blank layout. The symptom is "React is gone, only the header and footer show" — if you see that, suspect routing first.
- **`APP_BASE_URL` must not have a trailing slash.** The auth code concatenates `${APP_BASE_URL}/reset-password`, so a stray slash produces `//` and that URL doesn't match any React route. Same blank-layout symptom as above.
- **Let's Encrypt only issues certs for domain names, not raw IPs.** DuckDNS gives you a free subdomain that satisfies this at zero cost. Certbot's `--nginx` plugin handles nearly all of the nginx editing for you.
- **Let's Encrypt's CAA lookup happens from their servers, not yours.** A `CAA query timed out` error during certbot is a transient issue between Let's Encrypt and the DNS provider, not a problem with your EC2 firewall. Retry; it usually clears within a few minutes.
- **The AWS VPC DNS resolver hides outbound-53 firewall restrictions from the system resolver.** Ordinary DNS works through link-local regardless; only direct queries to external DNS servers (`dig @8.8.8.8`) need outbound UDP/53 in the security group.
- **`pm2 restart --update-env` usually picks up `.env` changes, but `pm2 delete` + `pm2 start` is bulletproof.** If a running process seems to cling to stale env values, go for the delete-and-start path.
- **When merging parallel work built on the same server, don't just trust the first pull.** If the server had its own uncommitted experiments, stash them, pull, read the stash carefully, and integrate what's valuable by hand. That's how the QuickNotes prototype ended up in the repo.
- **For admin / role checks, re-read the role from the database on every admin-guarded request.** Caching the role in the session is faster but goes stale on demotion. A per-request query is cheap on the low volume of admin calls and guarantees a demoted admin immediately loses access.
- **Extract shared side-effect helpers instead of duplicating them between endpoints.** The password reset flow was originally inlined in `/api/auth/forgot-password`; once the admin-triggered version arrived, the logic was pulled into `sendPasswordResetForUser` so both callers are guaranteed to produce identical tokens, storage, and emails.
- **Store only URLs for user-supplied images; never host their binaries.** MoodBoard leans on this hard — the server never downloads the images, which means no storage footprint, no upload UI, no bandwidth cost for serving them, and no responsibility for image content moderation. Broken URLs are handled with a client-side `onError` → local placeholder fallback.

### From the security hardening, payments, and stress-testing work

- **Stripe webhooks need the raw body, not parsed JSON.** Mount the webhook route with `express.raw({ type: 'application/json' })` BEFORE `express.json()` is registered globally. Stripe signs the original bytes; if `express.json()` parses first, the bytes change (whitespace, key order) and signature verification fails. Every other route uses parsed JSON, but this one specifically needs the original `Buffer`.
- **Stripe is at-least-once.** The same webhook event can arrive twice. Dedupe on `event.id` against a `stripe_events` table before applying any state changes, or you'll double-process the same payment.
- **Stripe webhook race vs. user redirect.** `stripe.confirmSetup` redirects the user back with success before the webhook has hit your server. The user lands on a stale subscribe page until the webhook updates their role. Fix: poll `/payments/status` after redirect with a `redirect_status=succeeded` param, show an interim "activating…" screen, and reveal success once the role flips.
- **CSP blocks Stripe.js silently in default Chrome.** No console error, just an empty space where the Payment Element should be. Allowlist `js.stripe.com` (script-src), `api.stripe.com` + `maps.stripe.com` (connect-src), and `js.stripe.com` + `hooks.stripe.com` (frame-src). Worth keeping the allowlist scoped to specific Stripe origins instead of opening the whole policy.
- **Don't decide premium status from session data.** Re-check the role from the database on every gated request, just like for admin gating. A canceled subscription's role flip needs to take effect immediately.
- **Rate limit gracefully via `skip`, not via tearing the limiter down.** `express-rate-limit` accepts a `skip(req)` callback that runs every request. Wire it to a runtime-mutable boolean (which itself defaults from an env var) and you can toggle limiting on and off without restarting the process. Ground state lives in env so a process restart is a clean reset.
- **t3.micro instances are *burstable*, not auto-scaling.** AWS does not auto-scale CPU on a single instance. The T-family earns CPU credits when idle and spends them under load; default mode is "unlimited" which means AWS bills you for overage instead of throttling. A 3-minute test fits inside burst credits comfortably; a sustained-hour test would either throttle or charge.
- **The default EC2 image has no swap.** A 1 GB t3.micro running MySQL + node + nginx + a one-shot `vite build` is operating with ~370 MB free for the build, which is below the build's peak. Without swap, hitting the limit is a deadlock — kswapd pegs at 100% trying to evict pages it can't evict and the box wedges. **Always configure 2 GB swap on a memory-tight EC2.** It's a five-minute setup that protects against any future memory spike, costs essentially nothing, and never gets touched in normal operation.
- **`recharts` doesn't tree-shake well on a 1 GB build server.** It bundles ~200 source files for chart types we don't use (polar, radar, sankey, treemap). Vite's tree-shaking pass on a memory-tight box churns through them slow enough to hang or OOM. For three small charts, ~150 lines of inline SVG bundles to nothing and renders just as well.
- **The rate limiter is the *first* bottleneck you'll hit, not the application.** Our limiter is set 600× more restrictive than the actual application capacity (100 req/min vs. ~1000 req/s real ceiling). That's correct — it exists to make brute-force expensive, not to match capacity. When stress-testing, you have to step around the limiter to measure the application; otherwise the numbers reflect the limiter's response time instead.
- **CPU-bound load produces graceful degradation; event-loop blocking produces hard failure.** Same hardware, same client, same VU count — the failure mode depends entirely on what the endpoint runs. CPU saturation just slows everything down (every request still completes). A 100 ms synchronous busy-wait at moderate concurrency drives p(95) latency to 12 seconds and pushes nginx toward its 60 s timeout. The latter is what takes production down at 3 a.m.
- **Maintenance pages need explicit bypass paths to be safe.** A maintenance flag that blocks `/api/admin/*` would lock the admin out of toggling it back off. The bypass list (`/api/auth/*`, `/api/admin/*`, `/api/payments/webhook`) is the *safety* feature, not a leak. Combined with in-memory-only state (process restart resets to OFF), maintenance mode has no "stuck on forever" failure mode.
- **Bypass tokens for legitimate test traffic must be unguessable AND short-lived.** 128-bit cryptographic random per run, valid only for the test's duration, registered on start, unregistered on close/error. Used solely as a `Set.has(string)` lookup so there's no injection vector. The worst-case if a token leaks is "the attacker gets to bypass an operational flag" — not a security boundary, so the cost of accepting the header is acceptable.

---

## Final Result

The project is live at **https://penumbra-tech.com**, with:

- a React + react-router SPA served by nginx (built frontend in `/var/www/hello-app`)
- a Node/Express backend managed by PM2 (process `hello-backend`) behind nginx at `127.0.0.1:3000`
- a MySQL 8 database (`hello_app`) with numbered migrations (`001` through `009`)
- shared session auth (register / login / logout / password reset / account deletion)
- four-tier role-based access (`user` / `premium` / `admin` / `super_admin`) with `requireAuth` / `requireAdmin` / `requireSuperAdmin` middleware. Roles re-read from the database on every gated request so demotions take effect immediately.
- four-tier rate limiting via `express-rate-limit` (global, auth-mutation, forgot-password, admin) with a runtime toggle the diagnostics page can flip without `pm2 restart`
- nginx security headers (HSTS, CSP, X-Frame-Options, Referrer-Policy, X-Content-Type-Options) versioned in `hello-world/nginx/security-headers.conf`
- durable admin audit log (`admin_actions` table) capturing every search, password-reset trigger, and role change with JSON detail
- 2 GB swap file (`/swapfile`, persisted in `/etc/fstab`) so a memory spike during `vite build` or a runaway process doesn't deadlock the box
- **QuickNotes** — user-scoped notes with full CRUD
- **MoodBoard** — image-URL boards with public share links, broken-image fallback, inline rename, and a client-side **Create Collage** feature with seeded layout, cover-crop drawing, and pastel accent fills
- **TaskTrackr** — task manager with categories, due-soon filter, auto-saving edits, mark-complete UX with confirmation, and a Facebook-style progress feed per task. Free users upload images up to 10 MB; Premium users upload images or videos up to 100 MB.
- **Subscribe** — Stripe Subscriptions integration with the inline Payment Element, idempotent webhook handling, and post-redirect polling so users see "Activating…" instead of a stale subscribe page during the webhook race window
- **API Guide** — public reference page documenting every endpoint, status code, role, and rate limit
- **Admin Portal** — admin user search + manual password reset trigger; super_admin extends this with role-management UI and a Diagnostics & Tests subpage
- **Diagnostics & Tests** — super-admin-only GUI for running k6 load tests with live SVG charts (req/s, latency p50/p95/mean, server CPU+mem), copy-able log streaming, runtime toggles for the rate limiter and a site-wide maintenance banner, and a 128-bit per-run bypass token so legitimate test traffic can reach the application even with maintenance on
- a persistent site footer in `index.html` (home, GitHub, phone, email, copyright) that sits below every React route via a body grid layout
- Let's Encrypt cert via DuckDNS, auto-renewing
- Gmail SMTP wired up for real password-reset email delivery, with a console-log fallback when `SMTP_HOST` is blank
- Elastic IP attached so the public address is stable across reboots
- push → pull → `./deploy_all.sh` as the repeatable deploy loop

### Measured production limits (t3.micro, real runs)

- nginx serving the static SPA: **475 req/s** at p(95) **2.4 ms** (50 VUs / 30 s); ceiling not yet reached
- API + MySQL with rate limiter ON: **1.66 req/s admitted** (the 100 req/min budget); limiter is the first bottleneck by design
- API + MySQL with rate limiter OFF: **998 req/s sustained** at p(95) **108 ms**, 0% errors; CPU pinned at ~90%, the actual application ceiling
- API under 500-VU overload (limiter OFF): **944 req/s** at p(95) **553 ms**, 0% errors; graceful degradation, throughput plateau, latency climbs
- Synthetic event-loop block (100 ms busy-wait per request): **9.86 req/s** at p(95) **11.83 s**, 0% errors but CPU only at ~50%; canonical Node single-thread failure mode
