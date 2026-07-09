# Private preview pages — deploy + operation

Unlisted, optionally-locked static pages you upload from the Admin Portal
("Private pages" console) and hand to a client. Files are served by the
backend at `/preview/<slug>/`, stored on disk under `PREVIEW_ROOT`
(default `/home/ubuntu/previews`), metadata in the `preview_pages` table.

- **Unlisted** — nothing links to it, it's not in the sitemap, and it's
  served `X-Robots-Tag: noindex`. Anyone with the URL can open it.
- **Locked** — visible only to you (a logged-in `super_admin`). A locked
  URL returns 404 to everyone else, so it doesn't even reveal it exists.

## One-time nginx change

Two edits to the site's server block (`/etc/nginx/sites-available/hello-app`,
the same file that already proxies `/api` and `/blog`). Use the **same
`proxy_pass` target as your existing `/blog` block** (`127.0.0.1:3000`).

**1) Raise the upload limit on `/api/`.** The console POSTs zip bundles to
`/api/admin/previews`; the default `client_max_body_size` (~1 MB) 413s them.
Add inside the existing `location /api/ { … }`:

```nginx
    client_max_body_size 100m;
```

**2) Add the `/preview/` location — with a permissive CSP.** This is the
critical part. The site-wide CSP is strict (`script-src 'self'`,
`font-src 'self'`), which **blocks the inline `<script>`, Google Fonts, and
embeds that a self-contained client site needs — the page renders blank**.
So `/preview/` gets a relaxed CSP scoped to itself, exactly like the
existing `/visualizer/` block. Because *any* `add_header` in a location
drops the inherited ones (nginx inheritance trap), the other security
headers are re-added here. Insert before the `location / {` SPA fallback:

```nginx
    location /preview/ {
        client_max_body_size 100m;
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;
        add_header Content-Security-Policy "default-src 'self' blob: data:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' https: data: blob:; media-src 'self' https: data: blob:; connect-src 'self' https: blob:; frame-src 'self' https:; frame-ancestors 'self'" always;
        proxy_pass http://127.0.0.1:3000;          # NO trailing slash/URI
        proxy_http_version 1.1;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
```

The relaxed CSP is safe here because only the super_admin uploads previews
(trusted content). The main app keeps its strict CSP. Then:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

## Deploy (push → pull → run)

```bash
cd ~/WebDevClass
git pull

# Backend: adm-zip is a new dependency; migration 012 adds preview_pages.
cd hello-world/backend && npm install
cd ~/WebDevClass && ./hello-world/db/migrate.sh          # applies 012_add_preview_pages.sql

# (recommended) pin the store path so it's stable under pm2:
grep -q '^PREVIEW_ROOT=' hello-world/backend/.env || \
  echo 'PREVIEW_ROOT=/home/ubuntu/previews' >> hello-world/backend/.env

# Frontend: build + publish to the web root exactly as you do now.
cd hello-world/frontend && npm ci && npm run build
# ...copy dist/ to /var/www/hello-app the usual way...

# Restart the API.
pm2 restart hello-backend
```

## Seed the first page (Luminous Vibrations)

`D:\LuminousVibrations.zip` is ready on your machine (index.html at the zip
root + its `assets/`). After deploying:

1. Log in as super_admin → **Admin Portal** → **Private pages**.
2. Choose `D:\LuminousVibrations.zip`, leave Title/Slug blank (title is read
   from the page's `<title>`; slug becomes `luminous-vibrations`), **Publish
   preview**.
3. It's live at `https://penumbra-tech.com/preview/luminous-vibrations/` —
   copy that URL to the client. Leave it **unlocked** so they can open it
   without logging in.

For future pages: upload a single self-contained `.html`, or a `.zip` of a
static site (must contain an `index.html`).

## Smoke test

```bash
# Unlocked page: 200 for anyone.
curl -sI https://penumbra-tech.com/preview/luminous-vibrations/ | head -1
# Bare slug redirects to the trailing-slash form (308).
curl -sI https://penumbra-tech.com/preview/luminous-vibrations | grep -i location
# An asset resolves.
curl -sI https://penumbra-tech.com/preview/luminous-vibrations/assets/p11.jpg | head -1
# Lock it in the console, then in a logged-OUT browser the URL should 404.
```

## Notes

- **Persistence**: `PREVIEW_ROOT` is outside the web root, so redeploys
  never touch it. Deleting a page in the console removes both the DB row
  and the files.
- **Backups**: the page files live on disk (covered by the EBS snapshot in
  `ops/README.md` §4); the metadata rows are in the nightly SQL dump. A full
  restore of a preview needs both.
- **Trust model**: only `super_admin` can upload. Uploaded pages run on the
  app origin, which is safe because the sole uploader is you, publishing your
  own or your client's content — there is no untrusted-author path. Zip
  extraction is guarded against path-escape (`zip-slip`).
```
