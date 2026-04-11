# WebDev Class Deployment Notes

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
Nginx :443 (Let's Encrypt cert, auto-redirects :80 -> :443)
  |
  +-- static files (React SPA) ---> /var/www/hello-app
  |
  +-- /api/auth/*    \
  +-- /api/notes/*    >-- Node/Express :3000 ---> MySQL
  +-- /api/messages  /
```

The site is live at **https://penumbrapro.duckdns.org**. Unauthenticated visitors see the seeded hello-world messages; logged-in users can use the QuickNotes mini app. More mini apps are planned on top of the same shared account.

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
- `users` — one row per account: `id`, `email` (unique, lowercased), `password_hash` (bcrypt), `created_at`, `last_login_at`
- `sessions` — backing store for `express-mysql-session`; shape dictated by the library (`session_id`, `expires`, `data`)
- `password_resets` — hashed reset tokens with expiry; the plaintext token is never stored, only `sha256(token)`
- `notes` — QuickNotes rows, scoped by `user_id` with `ON DELETE CASCADE`
- `schema_migrations` — filenames of applied migrations, with timestamps

### Adding a new migration

Any schema change goes in as `hello-world/db/migrations/NNN_description.sql`. On the server, running `./hello-world/db/migrate.sh` (or `./deploy_all.sh`) picks it up and applies it exactly once. See `hello-world/db/migrations/002_reconcile_users_and_add_notes.sql` for an example that uses conditional ALTER statements so it is safe on both an existing database and a fresh one.

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
| GET | `/api/auth/me` | public | Current user (or `null`) |
| DELETE | `/api/auth/me` | required | Delete the current user's account |
| POST | `/api/auth/forgot-password` | public | Send a reset email (console fallback if no SMTP) |
| POST | `/api/auth/reset-password` | public | Consume a reset token and set a new password |
| GET | `/api/notes` | required | List the current user's notes |
| GET | `/api/notes/:id` | required | Fetch one of the user's notes |
| POST | `/api/notes` | required | Create a note |
| PUT | `/api/notes/:id` | required | Update a note |
| DELETE | `/api/notes/:id` | required | Delete a note |

Sessions are cookie-based: a cookie called `hello.sid` (HttpOnly, SameSite=Lax, Secure when HTTPS is live) references a row in the `sessions` table. Every mini app can protect its routes with the shared `requireAuth` middleware exported from `hello-world/backend/auth.js`.

A handful of defensive touches are already in place:

- Login always runs bcrypt against either the real hash or a placeholder, so request timing doesn't leak which emails are registered.
- `req.session.regenerate()` is called on login and register so old session IDs can't be reused.
- `/api/auth/forgot-password` always returns the same `{ok: true}` regardless of whether the email exists.
- Reset tokens are stored as `sha256(token)`; the plaintext only exists in the email the user receives.

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
| `/` | Home — hello world text, the seeded messages, and links to your apps | No |
| `/login` | Login form | No |
| `/register` | Create account | No |
| `/forgot-password` | Request reset email | No |
| `/reset-password?token=...` | Set a new password from a reset token | No |
| `/quicknotes` | QuickNotes mini app (list / create / edit / delete) | Yes — redirects to `/login` |
| `/apps/apps.html` | Static mini-apps showcase | No |

The static showcase at `/apps/apps.html` lives under `hello-world/frontend/public/apps/`, which Vite copies into `dist/apps/` on build. Nginx serves it directly from `/var/www/hello-app/apps/apps.html` — the React SPA never sees the request.

### Linking out of the SPA

One thing worth calling out because it bit this project twice: **inside React pages, link to the static showcase with a plain `<a href="/apps/apps.html">`, not a react-router `<Link to="/apps/apps.html">`.** `<Link>` triggers client-side navigation, so React Router tries to match the URL against its `<Routes>`, finds no match, and renders an empty layout. The user then sees just the grey static paragraph from `index.html`'s body and thinks the app is broken. The rule of thumb:

- **React route** (`/`, `/login`, `/quicknotes`, …) → `<Link to="...">` (client-side)
- **Static HTML file** under `/apps/` or anything else served directly by nginx → plain `<a href="...">` (full page load)
- **External URL** → plain `<a href="...">`

### Dependencies

Declared in `hello-world/frontend/package.json`:

- `react` + `react-dom`
- `react-router-dom` — SPA routing
- `vite` + `@vitejs/plugin-react` (dev)

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
- **IP changes.** Stopping and starting the EC2 instance releases its public IP; the DuckDNS record then points at nothing. Either update the IP on duckdns.org after the restart, or allocate an **Elastic IP** and associate it with the instance so the public IP stays fixed.

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
curl -I https://penumbrapro.duckdns.org          # 200
curl -I http://penumbrapro.duckdns.org           # 301 -> https
```

### Browser test

Open **https://penumbrapro.duckdns.org** and walk through:

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
./deploy_backend.sh    # backend-only change
./deploy_frontend.sh   # frontend-only change
./hello-world/db/migrate.sh   # schema-only change
```

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

## Key Lessons Learned

### From the original hello-world deploy

- Security group **outbound** rules matter, not just inbound rules
- If npm, curl, or package downloads hang, check outbound **HTTPS 443** first
- Ubuntu's default Node package may be too old for modern frontend tooling — use **NodeSource** for a newer Node
- **Ctrl+C** stops a process, while **Ctrl+Z** suspends it and leaves it hanging on the port
- Git does not track empty directories
- GitHub password authentication is gone — use SSH keys, and SSH over port 443 when normal SSH hangs
- Nginx is a clean way to serve the frontend and hide the backend behind `/api`

### From the shared-auth + HTTPS + QuickNotes work

- **Don't run scripts on the local machine.** This repo's workflow is strictly push-pull-run: commit locally, pull on the server, run a `.sh` script there. Anything that needs to happen on the server must live in a committed script, not in your memory.
- **Use numbered migration files for every schema change**, even one-line ALTERs. The migration runner tracks what's been applied, so "what state is prod in?" stays answerable over time. Conditional dynamic SQL (`information_schema` + `PREPARE` / `EXECUTE`) lets one migration be safe on both existing and fresh databases.
- **In a React SPA living alongside static HTML pages, use `<Link>` for React routes and plain `<a>` for static files under `/apps/`.** `<Link to="/apps/apps.html">` tries to match against React Router's routes, fails, and renders a blank layout. The symptom is "the React app is gone, only the grey static paragraph shows" — if you see that, suspect routing first.
- **`APP_BASE_URL` must not have a trailing slash.** The auth code concatenates `${APP_BASE_URL}/reset-password`, so a stray slash produces `//` and that URL doesn't match any React route. Same blank-layout symptom as above.
- **Let's Encrypt only issues certs for domain names, not raw IPs.** DuckDNS gives you a free subdomain that satisfies this at zero cost. Certbot's `--nginx` plugin handles nearly all of the nginx editing for you.
- **Let's Encrypt's CAA lookup happens from their servers, not yours.** A `CAA query timed out` error during certbot is a transient issue between Let's Encrypt and the DNS provider, not a problem with your EC2 firewall. Retry; it usually clears within a few minutes.
- **The AWS VPC DNS resolver hides outbound-53 firewall restrictions from the system resolver.** Ordinary DNS works through link-local regardless; only direct queries to external DNS servers (`dig @8.8.8.8`) need outbound UDP/53 in the security group.
- **`pm2 restart --update-env` usually picks up `.env` changes, but `pm2 delete` + `pm2 start` is bulletproof.** If a running process seems to cling to stale env values, go for the delete-and-start path.
- **When merging parallel work built on the same server, don't just trust the first pull.** If the server had its own uncommitted experiments, stash them, pull, read the stash carefully, and integrate what's valuable by hand. That's how the QuickNotes prototype ended up in the repo.

---

## Final Result

The project is live at **https://penumbrapro.duckdns.org**, with:

- a React + react-router SPA served by nginx (built frontend in `/var/www/hello-app`)
- a Node/Express backend managed by PM2 (process `hello-backend`) behind nginx at `127.0.0.1:3000`
- a MySQL 8 database (`hello_app`) with numbered migrations
- shared auth (register / login / logout / password reset / account deletion) via session cookies
- **QuickNotes** as the first live mini app — user-scoped CRUD against `/api/notes`
- Let's Encrypt cert via DuckDNS, auto-renewing
- push → pull → `./deploy_all.sh` as the repeatable deploy loop
