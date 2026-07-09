// previews.js — private/unlisted preview pages.
//
// The super_admin uploads a self-contained .html file OR a .zip static-site
// bundle through the Admin Portal "Private pages" console. Each becomes a
// page served at /preview/<slug>/. Pages are UNLISTED: never linked, never
// in the sitemap, and served with `X-Robots-Tag: noindex` so a URL can be
// handed to a client without exposing it site-wide. A page can be LOCKED,
// which gates it behind a super_admin session — non-owners get a 404, so a
// locked URL does not even reveal that something lives there.
//
// WHY THE BACKEND SERVES /preview (not nginx static)
// --------------------------------------------------
// Locked pages need a per-request auth decision (does this session belong to
// the super_admin?), which static nginx can't make. So nginx proxies
// /preview/ here, the same way it proxies /blog. Files live under
// PREVIEW_ROOT, OUTSIDE the frontend dist, so a deploy that replaces
// /var/www never deletes an uploaded preview.
//
// SECURITY MODEL
//   * Upload/list/lock/delete are super_admin only (requireSuperAdmin).
//   * Served pages run on the app origin, so an uploaded page's JavaScript
//     shares the origin with /api. That is acceptable ONLY because the sole
//     uploader is the trusted operator publishing their own or their
//     client's own content — there is no untrusted-author path. The session
//     cookie is httpOnly, so page JS cannot read it.
//   * Zip extraction is guarded against zip-slip: every entry must resolve
//     INSIDE the page directory (safeJoin) or it is dropped.
//   * The public serve path only ever reads files via safeJoin under the
//     page's own directory, so `/preview/x/../../etc/passwd`-style requests
//     cannot escape.

const express = require('express');
const fsp = require('fs/promises');
const path = require('path');
const multer = require('multer');
const AdmZip = require('adm-zip');

const pool = require('./db');
const { requireSuperAdmin } = require('./auth');

const adminRouter = express.Router();
// strict routing so `/preview/x` and `/preview/x/` are distinct routes and
// the trailing-slash redirect below can't loop.
const htmlRouter = express.Router({ strict: true });

const SITE_ORIGIN = process.env.SITE_ORIGIN || 'https://penumbra-tech.com';

// Persistent store, deliberately OUTSIDE the deploy-replaced web root. On the
// EC2 box the backend runs as `ubuntu`, so this resolves to
// /home/ubuntu/previews and survives every redeploy.
const PREVIEW_ROOT =
  process.env.PREVIEW_ROOT || path.join(process.env.HOME || '/tmp', 'previews');

// Upload / extraction ceilings.
const MAX_UPLOAD = 80 * 1024 * 1024; // 80 MB compressed
const MAX_TOTAL = 120 * 1024 * 1024; // 120 MB extracted
const MAX_FILES = 4000;

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD, files: 1 }
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function slugify(s) {
  return String(s)
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

function pageDir(slug) {
  return path.join(PREVIEW_ROOT, slug);
}

// Resolve `relPath` under `baseDir`, returning null if it would escape.
// This is the single chokepoint for both zip extraction and asset serving.
function safeJoin(baseDir, relPath) {
  const cleaned = String(relPath).replace(/\\/g, '/').replace(/^\/+/, '');
  const target = path.resolve(baseDir, cleaned);
  const rel = path.relative(baseDir, target);
  if (rel === '') return target; // the dir itself
  if (rel === '..' || rel.startsWith(`..${path.sep}`) || path.isAbsolute(rel)) {
    return null;
  }
  return target;
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.htm': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.bmp': 'image/bmp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.eot': 'application/vnd.ms-fontobject',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.ogg': 'video/ogg',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.m4a': 'audio/mp4',
  '.pdf': 'application/pdf'
};

function mimeFor(p) {
  return MIME[path.extname(p).toLowerCase()] || 'application/octet-stream';
}

function getHtmlTitle(str) {
  const m = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(String(str));
  if (!m) return '';
  return m[1]
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 300);
}

function rowToItem(row) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    kind: row.kind,
    bytes: Number(row.bytes),
    files: row.files,
    locked: !!row.locked,
    created_at: row.created_at,
    updated_at: row.updated_at,
    url: `${SITE_ORIGIN}/preview/${row.slug}/`,
    path: `/preview/${row.slug}/`
  };
}

// Audit-trail helper (same shape blog.js/admin.js use).
async function logAdminAction(adminId, action, targetId, detail) {
  try {
    await pool.query(
      'INSERT INTO admin_actions (admin_id, action, target_id, detail) VALUES (?, ?, ?, ?)',
      [adminId, action, targetId || null, detail ? JSON.stringify(detail) : null]
    );
  } catch (error) {
    console.error('[previews] audit log failed:', error);
  }
}

// Write a single self-contained HTML file as the page's index.html.
async function writeSingleHtml(dir, buffer) {
  await fsp.mkdir(dir, { recursive: true });
  await fsp.writeFile(path.join(dir, 'index.html'), buffer);
  return { entry: 'index.html', bytes: buffer.length, files: 1 };
}

// Extract a zip bundle into `dir`. Picks the shallowest index.html as the
// entry and strips its directory prefix, so it works whether the archive was
// made by zipping the folder (foo/index.html) or its contents (index.html).
// Every write goes through safeJoin, so a zip-slip entry is dropped.
async function extractZip(dir, buffer) {
  const zip = new AdmZip(buffer);
  const entries = zip.getEntries();

  const htmlEntries = entries
    .filter((e) => !e.isDirectory && /(^|\/)index\.html$/i.test(e.entryName))
    .sort((a, b) => a.entryName.split('/').length - b.entryName.split('/').length);
  if (!htmlEntries.length) {
    throw new Error('Zip must contain an index.html');
  }
  const entryName = htmlEntries[0].entryName;
  const prefix = entryName.slice(0, entryName.length - 'index.html'.length);

  await fsp.mkdir(dir, { recursive: true });
  let bytes = 0;
  let files = 0;
  for (const e of entries) {
    if (e.isDirectory) continue;
    const name = e.entryName;
    if (/(^|\/)(__MACOSX\/|\.DS_Store$|Thumbs\.db$)/i.test(name)) continue;
    if (prefix && !name.startsWith(prefix)) continue; // outside the chosen root
    const rel = prefix ? name.slice(prefix.length) : name;
    if (!rel) continue;
    const dest = safeJoin(dir, rel);
    if (!dest) {
      console.warn('[previews] dropped zip-slip entry:', name);
      continue;
    }
    const data = e.getData();
    bytes += data.length;
    files += 1;
    if (bytes > MAX_TOTAL) throw new Error('Bundle too large once extracted');
    if (files > MAX_FILES) throw new Error('Too many files in bundle');
    await fsp.mkdir(path.dirname(dest), { recursive: true });
    await fsp.writeFile(dest, data);
  }
  if (!files) throw new Error('Zip contained no usable files');
  return { entry: 'index.html', bytes, files };
}

async function isSuperAdminReq(req) {
  if (!req.session || !req.session.userId) return false;
  try {
    const [rows] = await pool.query('SELECT role FROM users WHERE id = ?', [
      req.session.userId
    ]);
    return !!rows[0] && rows[0].role === 'super_admin';
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Admin API — mounted at /api/admin/previews, super_admin only
// ---------------------------------------------------------------------------

adminRouter.get('/', requireSuperAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM preview_pages ORDER BY created_at DESC'
    );
    res.json(rows.map(rowToItem));
  } catch (err) {
    console.error('[previews] list failed:', err);
    res.status(500).json({ error: 'Failed to load preview pages' });
  }
});

// POST /api/admin/previews — multipart: file (.html or .zip) + title? + slug?
adminRouter.post('/', requireSuperAdmin, upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    const ext = path.extname(file.originalname || '').toLowerCase();
    const isZip =
      ext === '.zip' ||
      file.mimetype === 'application/zip' ||
      file.mimetype === 'application/x-zip-compressed';
    const isHtml = ext === '.html' || ext === '.htm';
    if (!isZip && !isHtml) {
      return res
        .status(400)
        .json({ error: 'Upload a single .html file or a .zip bundle' });
    }

    // Title: explicit → parsed <title> → filename.
    const baseName = (file.originalname || 'preview').replace(/\.[^.]+$/, '');
    let title = String(req.body.title || '').trim();
    if (!title && isHtml) title = getHtmlTitle(file.buffer.toString('utf8'));
    if (!title) title = baseName;
    title = title.slice(0, 300) || 'Untitled preview';

    const slug = slugify(req.body.slug || baseName || title);
    if (!SLUG_RE.test(slug)) {
      return res.status(400).json({ error: 'Could not derive a valid slug — set one explicitly' });
    }

    const [dupe] = await pool.query('SELECT id FROM preview_pages WHERE slug = ?', [
      slug
    ]);
    if (dupe.length) {
      return res
        .status(409)
        .json({ error: `A preview with slug "${slug}" already exists` });
    }

    const dir = pageDir(slug);
    // Guard against a stray directory from a previously-failed upload.
    await fsp.rm(dir, { recursive: true, force: true });

    let meta;
    try {
      meta = isZip
        ? await extractZip(dir, file.buffer)
        : await writeSingleHtml(dir, file.buffer);
    } catch (e) {
      await fsp.rm(dir, { recursive: true, force: true }).catch(() => {});
      return res.status(400).json({ error: e.message || 'Could not unpack upload' });
    }

    // For a zip, prefer the entry page's <title> when none was given.
    if (!req.body.title && isZip) {
      try {
        const html = await fsp.readFile(path.join(dir, 'index.html'), 'utf8');
        const t = getHtmlTitle(html);
        if (t) title = t;
      } catch {
        /* keep filename title */
      }
    }

    const [result] = await pool.query(
      `INSERT INTO preview_pages (slug, title, entry, kind, bytes, files, locked)
       VALUES (?, ?, ?, ?, ?, ?, 0)`,
      [slug, title, meta.entry, isZip ? 'zip' : 'html', meta.bytes, meta.files]
    );

    await logAdminAction(req.session.userId, 'preview_create', result.insertId, {
      slug,
      title,
      kind: isZip ? 'zip' : 'html',
      files: meta.files
    });

    res.status(201).json(
      rowToItem({
        id: result.insertId,
        slug,
        title,
        entry: meta.entry,
        kind: isZip ? 'zip' : 'html',
        bytes: meta.bytes,
        files: meta.files,
        locked: 0,
        created_at: new Date(),
        updated_at: new Date()
      })
    );
  } catch (err) {
    console.error('[previews] create failed:', err);
    res.status(500).json({ error: 'Failed to publish preview page' });
  }
});

// PATCH /api/admin/previews/:id — toggle lock (body: { locked: bool }).
adminRouter.patch('/:id', requireSuperAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'Invalid id' });
    }
    const [rows] = await pool.query('SELECT slug FROM preview_pages WHERE id = ?', [
      id
    ]);
    if (!rows.length) return res.status(404).json({ error: 'Preview not found' });

    const locked = req.body.locked ? 1 : 0;
    await pool.query('UPDATE preview_pages SET locked = ? WHERE id = ?', [locked, id]);
    await logAdminAction(req.session.userId, 'preview_lock', id, {
      slug: rows[0].slug,
      locked: !!locked
    });
    res.json({ ok: true, locked: !!locked });
  } catch (err) {
    console.error('[previews] lock failed:', err);
    res.status(500).json({ error: 'Failed to update lock' });
  }
});

// DELETE /api/admin/previews/:id — remove the row and the files on disk.
adminRouter.delete('/:id', requireSuperAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'Invalid id' });
    }
    const [rows] = await pool.query(
      'SELECT slug, title FROM preview_pages WHERE id = ?',
      [id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Preview not found' });

    await pool.query('DELETE FROM preview_pages WHERE id = ?', [id]);
    // Only rm inside PREVIEW_ROOT; slug is validated on the way in, but
    // re-validate before an rm -rf just in case.
    if (SLUG_RE.test(rows[0].slug)) {
      await fsp.rm(pageDir(rows[0].slug), { recursive: true, force: true }).catch(
        () => {}
      );
    }
    await logAdminAction(req.session.userId, 'preview_delete', id, rows[0]);
    res.json({ ok: true });
  } catch (err) {
    console.error('[previews] delete failed:', err);
    res.status(500).json({ error: 'Failed to delete preview' });
  }
});

// ---------------------------------------------------------------------------
// Public serve — /preview/:slug/ and its assets (proxied here by nginx)
// ---------------------------------------------------------------------------

function send404(res) {
  res
    .status(404)
    .type('html')
    .set('X-Robots-Tag', 'noindex, nofollow')
    .send(
      '<!doctype html><meta charset="utf-8"><title>Not found</title>' +
        '<body style="margin:0;height:100vh;display:grid;place-items:center;' +
        'font-family:system-ui,sans-serif;background:#07021a;color:#a4b0c4">' +
        '<p>404 — no preview here.</p></body>'
    );
}

async function loadPage(slug) {
  if (!SLUG_RE.test(slug)) return null;
  const [rows] = await pool.query('SELECT * FROM preview_pages WHERE slug = ?', [
    slug
  ]);
  return rows[0] || null;
}

// Bare slug (no trailing slash) → redirect so the page's relative asset URLs
// resolve against /preview/<slug>/ rather than /preview/.
htmlRouter.get('/preview/:slug', (req, res) => {
  res.redirect(308, `/preview/${encodeURIComponent(req.params.slug)}/`);
});

// The index (`/preview/<slug>/`) and every asset (`/preview/<slug>/rest`).
async function serve(req, res) {
  try {
    const { slug } = req.params;
    const rest = req.params[0] || ''; // '' for the index route
    const page = await loadPage(slug);
    if (!page) return send404(res);

    if (page.locked && !(await isSuperAdminReq(req))) {
      // Hide existence entirely from non-owners.
      return send404(res);
    }

    const relative = rest === '' ? page.entry || 'index.html' : rest;
    const abs = safeJoin(pageDir(slug), relative);
    if (!abs) return send404(res);

    res.set('X-Robots-Tag', 'noindex, nofollow');
    // Private caching: never let a shared/CDN cache hold a locked page, and
    // keep browser caching short so re-uploads show up quickly.
    res.set('Cache-Control', 'private, max-age=60');
    res.type(mimeFor(abs));
    res.sendFile(abs, (err) => {
      if (err && !res.headersSent) send404(res);
    });
  } catch (err) {
    console.error('[previews] serve failed:', err);
    if (!res.headersSent) res.status(500).type('text').send('preview unavailable');
  }
}

htmlRouter.get('/preview/:slug/', serve);
htmlRouter.get('/preview/:slug/*', serve);

module.exports = { adminRouter, htmlRouter, PREVIEW_ROOT };
// Exported for unit tests (pure helpers; no side effects on their own).
module.exports._test = { safeJoin, extractZip, slugify, getHtmlTitle, mimeFor };
