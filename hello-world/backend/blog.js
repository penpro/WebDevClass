// Blog — public read API, super_admin publishing API, social share-card
// renderer, and the HTML routes that make blog URLs crawler-correct the
// moment a post is published.
//
// WHY THE BACKEND SERVES /blog HTML
// ---------------------------------
// Every other marketing route on the site gets its static HTML from the
// puppeteer prerender step at deploy time. That works because those routes
// are known at build time. Blog posts are database rows created from the
// Admin Portal at runtime — a post published on Tuesday would serve the
// SPA shell with the DEFAULT og:image/title until the next deploy, which
// breaks the whole point of publishing (sharing the link and getting a
// correct preview card).
//
// So nginx proxies /blog and /blog/:slug to this backend instead. For each
// request we take the deployed SPA shell (index.html), swap the head
// metadata (title/description/canonical/og/twitter, per-post og:image),
// and inject a server-rendered copy of the article into #root so crawlers
// and LLM fetchers that don't execute JS still get the full text. Browsers
// load the same React bundles as everywhere else; React re-renders the
// route on hydration and takes over.
//
// The share-card teaser (og.png) is generated with sharp from an SVG
// template in the Penumbra corona/void brand — title + excerpt + read
// time, 1200x630 — and disk-cached keyed on the post content hash, so
// editing a post automatically produces a fresh card.
//
// Content model: raw markdown is canonical (stored in MySQL). The first
// `# heading` becomes the title and is stripped from the body. HTML is
// rendered per-request with marked. Markdown is authored exclusively by
// the super_admin through an authenticated route, so it is trusted input;
// there is deliberately no sanitizer pass between marked and the page.

const express = require('express');
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const { marked } = require('marked');
const sharp = require('sharp');

const pool = require('./db');
const { requireSuperAdmin } = require('./auth');

const publicRouter = express.Router();
const adminRouter = express.Router();
const htmlRouter = express.Router();

// Where the deployed frontend lives (nginx web root). The HTML routes read
// the SPA shell + static sitemap/llms-full from here. Overridable for
// local development where /var/www doesn't exist.
const STATIC_ROOT = process.env.STATIC_ROOT || '/var/www/hello-app';
const SITE_ORIGIN = process.env.SITE_ORIGIN || 'https://penumbra-tech.com';

// Share-card PNG cache. One file per (slug, content-hash); stale hashes
// for the same slug are cleaned opportunistically on regeneration.
const OG_CACHE_DIR =
  process.env.BLOG_OG_DIR || path.join(process.env.HOME || '/tmp', 'blog-og');

// ---------------------------------------------------------------------------
// Markdown helpers
// ---------------------------------------------------------------------------

function slugify(s) {
  return String(s)
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Parse a raw .md file into the fields we store. The first `# ` line is
// the title (stripped from the body so the page's h1 doesn't duplicate);
// the first non-heading paragraph seeds the meta description.
function deriveFromMarkdown(rawMd) {
  const md = String(rawMd).replace(/\r\n/g, '\n').trim();
  const lines = md.split('\n');

  let title = null;
  let bodyStart = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    if (line.startsWith('# ')) {
      title = line.slice(2).trim();
      bodyStart = i + 1;
    }
    break;
  }
  const body = lines.slice(bodyStart).join('\n').trim();

  // First real paragraph: skip headings, blank lines, images, hrs.
  let description = '';
  for (const para of body.split(/\n{2,}/)) {
    const p = para.trim();
    if (!p || p.startsWith('#') || p.startsWith('![') || /^[-*_]{3,}$/.test(p)) {
      continue;
    }
    description = p.replace(/\s+/g, ' ').replace(/[*_`>#[\]]/g, '');
    break;
  }
  if (description.length > 200) {
    description = `${description.slice(0, 197).trimEnd()}...`;
  }

  const words = body.split(/\s+/).filter(Boolean).length;
  const readMinutes = Math.max(1, Math.round(words / 220));

  return { title, body, description, words, readMinutes };
}

function renderHtml(markdown) {
  return marked.parse(markdown);
}

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function rowToListItem(row) {
  return {
    slug: row.slug,
    title: row.title,
    description: row.description,
    published: !!row.published,
    published_at: row.published_at,
    updated_at: row.updated_at,
    read_minutes: Math.max(
      1,
      Math.round(row.markdown.split(/\s+/).filter(Boolean).length / 220)
    )
  };
}

async function getPublishedPost(slug) {
  if (!SLUG_RE.test(slug)) return null;
  const [rows] = await pool.query(
    'SELECT * FROM blog_posts WHERE slug = ? AND published = 1',
    [slug]
  );
  return rows[0] || null;
}

// Same audit-trail helper admin.js uses; duplicated because it is ten
// lines and importing it would tangle the two routers' dependencies.
async function logAdminAction(adminId, action, targetId, detail) {
  try {
    await pool.query(
      'INSERT INTO admin_actions (admin_id, action, target_id, detail) VALUES (?, ?, ?, ?)',
      [adminId, action, targetId || null, detail ? JSON.stringify(detail) : null]
    );
  } catch (error) {
    console.error('Failed to write admin audit log:', error);
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

// GET /api/blog — published posts, newest first.
publicRouter.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM blog_posts WHERE published = 1 ORDER BY published_at DESC'
    );
    res.json(rows.map(rowToListItem));
  } catch (err) {
    console.error('[blog] list failed:', err);
    res.status(500).json({ error: 'Failed to load posts' });
  }
});

// GET /api/blog/:slug — one post, with the markdown rendered to HTML.
publicRouter.get('/:slug', async (req, res) => {
  try {
    const post = await getPublishedPost(req.params.slug);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json({
      ...rowToListItem(post),
      html: renderHtml(post.markdown)
    });
  } catch (err) {
    console.error('[blog] read failed:', err);
    res.status(500).json({ error: 'Failed to load post' });
  }
});

// ---------------------------------------------------------------------------
// Share-card teaser image — GET /api/blog/:slug/og.png
// ---------------------------------------------------------------------------
// 1200x630 (the OG/Twitter large-card standard). Void background, corona
// accents, corner brackets, eclipse ring, wrapped title, excerpt, and the
// read time — a branded "screenshot of the text" for link previews and
// manual attachment.

// Greedy word-wrap using an average-advance-width estimate per font. Space
// Grotesk metrics hover near 0.58em (bold) / 0.53em (regular) average
// advance for English prose; close enough for card layout, and the
// ellipsis fallback catches pathological titles.
function wrapText(text, fontSize, maxWidth, emFactor, maxLines) {
  const charW = fontSize * emFactor;
  const maxChars = Math.max(8, Math.floor(maxWidth / charW));
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
    if (lines.length === maxLines) break;
  }
  if (lines.length < maxLines && line) lines.push(line);
  if (
    lines.length === maxLines &&
    (line !== lines[lines.length - 1] ||
      words.join(' ').length > lines.join(' ').length)
  ) {
    const last = lines[maxLines - 1];
    lines[maxLines - 1] = `${last.replace(/[,.;:]?$/, '').slice(0, maxChars - 1).trimEnd()}…`;
  }
  return lines;
}

function ogCardSvg(post) {
  const W = 1200;
  const H = 630;
  const M = 84; // content margin

  const titleSize = post.title.length <= 44 ? 66 : post.title.length <= 80 ? 56 : 48;
  const titleLines = wrapText(post.title, titleSize, W - M * 2 - 60, 0.58, 4);
  const titleLineH = Math.round(titleSize * 1.16);

  const excerptLines = wrapText(post.description, 26, W - M * 2 - 120, 0.53, 2);

  const titleTopY = 208;
  const excerptY = titleTopY + titleLines.length * titleLineH + 46;

  const titleTspans = titleLines
    .map(
      (line, i) =>
        `<text x="${M}" y="${titleTopY + i * titleLineH}" font-family="'Space Grotesk', 'DejaVu Sans', sans-serif" font-size="${titleSize}" font-weight="700" fill="#ecfeff" letter-spacing="-1">${esc(line)}</text>`
    )
    .join('\n  ');

  const excerptTspans = excerptLines
    .map(
      (line, i) =>
        `<text x="${M}" y="${excerptY + i * 40}" font-family="'Space Grotesk', 'DejaVu Sans', sans-serif" font-size="26" font-weight="400" fill="#a4b0c4">${esc(line)}</text>`
    )
    .join('\n  ');

  const dateLabel = formatDate(post.published_at || new Date());
  const readLabel = `${post.read_minutes} MIN READ`;

  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="glow-cyan" cx="20%" cy="24%" r="70%">
      <stop offset="0%" stop-color="#22d3ee" stop-opacity="0.16"/>
      <stop offset="60%" stop-color="#22d3ee" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glow-violet" cx="86%" cy="12%" r="70%">
      <stop offset="0%" stop-color="#c084fc" stop-opacity="0.15"/>
      <stop offset="60%" stop-color="#c084fc" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#22d3ee"/>
      <stop offset="45%" stop-color="#5eead4"/>
      <stop offset="100%" stop-color="#c084fc"/>
    </linearGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="#07021a"/>
  <rect width="${W}" height="${H}" fill="url(#glow-cyan)"/>
  <rect width="${W}" height="${H}" fill="url(#glow-violet)"/>

  <!-- eclipse ring, right edge -->
  <circle cx="1102" cy="315" r="210" fill="none" stroke="url(#ring)" stroke-width="2" opacity="0.35"/>
  <circle cx="1102" cy="315" r="168" fill="none" stroke="url(#ring)" stroke-width="26" opacity="0.10"/>

  <!-- corner brackets -->
  <path d="M36 74 V36 H74" fill="none" stroke="url(#ring)" stroke-width="3"/>
  <path d="M${W - 36} 74 V36 H${W - 74}" fill="none" stroke="#5eead4" stroke-width="3" opacity="0.7"/>
  <path d="M36 ${H - 74} V${H - 36} H74" fill="none" stroke="#5eead4" stroke-width="3" opacity="0.7"/>
  <path d="M${W - 36} ${H - 74} V${H - 36} H${W - 74}" fill="none" stroke="#c084fc" stroke-width="3" opacity="0.7"/>

  <!-- eyebrow -->
  <circle cx="${M + 5}" cy="102" r="5" fill="#5eead4"/>
  <text x="${M + 24}" y="110" font-family="'JetBrains Mono', 'DejaVu Sans Mono', monospace" font-size="22" fill="#5eead4" letter-spacing="5">PENUMBRA TECH · BLOG</text>

  ${titleTspans}

  ${excerptTspans}

  <!-- footer -->
  <line x1="${M}" y1="${H - 92}" x2="${W - M}" y2="${H - 92}" stroke="#5eead4" stroke-opacity="0.18" stroke-width="1"/>
  <text x="${M}" y="${H - 50}" font-family="'JetBrains Mono', 'DejaVu Sans Mono', monospace" font-size="22" fill="#5eead4" letter-spacing="1">penumbra-tech.com/blog</text>
  <text x="${W - M}" y="${H - 50}" text-anchor="end" font-family="'JetBrains Mono', 'DejaVu Sans Mono', monospace" font-size="20" fill="#7a85a0" letter-spacing="2">${esc(dateLabel.toUpperCase())} · ${esc(readLabel)}</text>
</svg>`;
}

publicRouter.get('/:slug/og.png', async (req, res) => {
  try {
    const post = await getPublishedPost(req.params.slug);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const item = rowToListItem(post);
    const hash = crypto
      .createHash('sha1')
      .update(`${item.title}\n${item.description}\n${item.published_at}`)
      .digest('hex')
      .slice(0, 12);
    const file = path.join(OG_CACHE_DIR, `${item.slug}-${hash}.png`);

    let png;
    try {
      png = await fsp.readFile(file);
    } catch {
      png = await sharp(Buffer.from(ogCardSvg(item)), { density: 96 })
        .png()
        .toBuffer();
      await fsp.mkdir(OG_CACHE_DIR, { recursive: true });
      await fsp.writeFile(file, png);
      // Drop stale cards for this slug (older content hashes).
      const stale = (await fsp.readdir(OG_CACHE_DIR)).filter(
        (f) => f.startsWith(`${item.slug}-`) && f !== path.basename(file)
      );
      await Promise.all(
        stale.map((f) => fsp.unlink(path.join(OG_CACHE_DIR, f)).catch(() => {}))
      );
    }

    res
      .type('png')
      // Cacheable but revalidated hourly — edits change the hash, but the
      // URL crawlers fetch is the stable /og.png one.
      .set('Cache-Control', 'public, max-age=3600')
      .send(png);
  } catch (err) {
    console.error('[blog] og card failed:', err);
    res.status(500).json({ error: 'Card render failed' });
  }
});

// ---------------------------------------------------------------------------
// Admin API — mounted at /api/admin/blog, super_admin only
// ---------------------------------------------------------------------------

// GET /api/admin/blog — all posts including unpublished.
adminRouter.get('/', requireSuperAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM blog_posts ORDER BY COALESCE(published_at, created_at) DESC'
    );
    res.json(rows.map((r) => ({ id: r.id, ...rowToListItem(r) })));
  } catch (err) {
    console.error('[blog] admin list failed:', err);
    res.status(500).json({ error: 'Failed to load posts' });
  }
});

// POST /api/admin/blog — create a post from markdown. Title, slug, and
// description are derived from the markdown when not supplied explicitly.
adminRouter.post('/', requireSuperAdmin, async (req, res) => {
  try {
    const rawMd = String(req.body.markdown || '');
    if (!rawMd.trim()) {
      return res.status(400).json({ error: 'markdown is required' });
    }
    if (rawMd.length > 500 * 1024) {
      return res.status(400).json({ error: 'markdown too large (500KB max)' });
    }

    const derived = deriveFromMarkdown(rawMd);
    const title = String(req.body.title || derived.title || '').trim().slice(0, 300);
    if (!title) {
      return res.status(400).json({
        error: 'No title: supply one or start the markdown with "# Your Title"'
      });
    }
    const slug = slugify(req.body.slug || title);
    if (!SLUG_RE.test(slug)) {
      return res.status(400).json({ error: 'Invalid slug' });
    }
    const description = String(req.body.description || derived.description || title)
      .trim()
      .slice(0, 500);
    const published = req.body.published === false ? 0 : 1;

    const [result] = await pool.query(
      `INSERT INTO blog_posts (slug, title, description, markdown, published, published_at)
       VALUES (?, ?, ?, ?, ?, ${published ? 'NOW()' : 'NULL'})`,
      [slug, title, description, derived.body, published]
    );

    await logAdminAction(req.session.userId, 'blog_create', result.insertId, {
      slug,
      title,
      published: !!published
    });

    res.status(201).json({
      id: result.insertId,
      slug,
      title,
      description,
      published: !!published,
      url: `${SITE_ORIGIN}/blog/${slug}`
    });
  } catch (err) {
    if (err && err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'A post with that slug already exists' });
    }
    console.error('[blog] create failed:', err);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// PUT /api/admin/blog/:id — update markdown/fields or toggle published.
adminRouter.put('/:id', requireSuperAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'Invalid id' });
    }
    const [rows] = await pool.query('SELECT * FROM blog_posts WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ error: 'Post not found' });
    const post = rows[0];

    let { title, description, markdown } = post;
    if (req.body.markdown !== undefined) {
      const derived = deriveFromMarkdown(String(req.body.markdown));
      markdown = derived.body;
      if (req.body.title === undefined && derived.title) title = derived.title;
      if (req.body.description === undefined && derived.description) {
        description = derived.description;
      }
    }
    if (req.body.title !== undefined) title = String(req.body.title).trim().slice(0, 300);
    if (req.body.description !== undefined) {
      description = String(req.body.description).trim().slice(0, 500);
    }

    let published = post.published;
    let publishedAtSql = '';
    if (req.body.published !== undefined) {
      published = req.body.published ? 1 : 0;
      // First-time publish stamps published_at; re-publishing keeps the
      // original date so edits don't shuffle the index order.
      if (published && !post.published_at) publishedAtSql = ', published_at = NOW()';
    }

    await pool.query(
      `UPDATE blog_posts SET title = ?, description = ?, markdown = ?, published = ?${publishedAtSql} WHERE id = ?`,
      [title, description, markdown, published, id]
    );

    await logAdminAction(req.session.userId, 'blog_update', id, {
      slug: post.slug,
      published: !!published
    });

    res.json({ id, slug: post.slug, title, description, published: !!published });
  } catch (err) {
    console.error('[blog] update failed:', err);
    res.status(500).json({ error: 'Failed to update post' });
  }
});

// DELETE /api/admin/blog/:id
adminRouter.delete('/:id', requireSuperAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'Invalid id' });
    }
    const [rows] = await pool.query(
      'SELECT slug, title FROM blog_posts WHERE id = ?',
      [id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Post not found' });

    await pool.query('DELETE FROM blog_posts WHERE id = ?', [id]);
    await logAdminAction(req.session.userId, 'blog_delete', id, rows[0]);
    res.json({ ok: true });
  } catch (err) {
    console.error('[blog] delete failed:', err);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

// ---------------------------------------------------------------------------
// HTML routes — /blog and /blog/:slug (proxied here by nginx)
// ---------------------------------------------------------------------------

// The deployed SPA shell, cached with an mtime check so a redeploy is
// picked up without restarting the backend. spa-shell.html is the
// PRISTINE pre-prerender shell that the build saves aside (the deployed
// index.html is the fully-prerendered home page — injecting into that
// would ship home-page DOM under blog URLs). Falls back to index.html
// only for the window between deploying this backend and the next
// frontend build that produces spa-shell.html.
let shellCache = { mtime: 0, html: null };
async function loadShell() {
  let shellPath = path.join(STATIC_ROOT, 'spa-shell.html');
  try {
    await fsp.access(shellPath);
  } catch {
    shellPath = path.join(STATIC_ROOT, 'index.html');
  }
  const stat = await fsp.stat(shellPath);
  if (!shellCache.html || stat.mtimeMs !== shellCache.mtime) {
    shellCache = { mtime: stat.mtimeMs, html: await fsp.readFile(shellPath, 'utf8') };
  }
  return shellCache.html;
}

// Strip the shell's baked-in head metadata and replace it with per-page
// tags. Removal-then-inject guarantees a single source of truth even if
// the static header changes shape in a future deploy.
function injectMeta(shell, meta) {
  // The shell's meta tags are multi-line (attributes on their own lines),
  // so the match must allow whitespace/newlines between <meta and its
  // name/property attribute, and [^>]* naturally spans newlines.
  let html = shell
    .replace(/<title>[\s\S]*?<\/title>/, '')
    .replace(/[ \t]*<meta\s+(?:name|property)="(?:description|og:[^"]+|twitter:[^"]+)"[^>]*?\/?>\s*\n?/g, '')
    .replace(/[ \t]*<link rel="canonical"[^>]*?\/?>\s*\n?/g, '');

  const block = [
    `<title>${esc(meta.title)}</title>`,
    `<meta name="description" content="${esc(meta.description)}" />`,
    `<link rel="canonical" href="${esc(meta.canonical)}" />`,
    `<meta property="og:type" content="${meta.type || 'website'}" />`,
    `<meta property="og:site_name" content="Penumbra Tech" />`,
    `<meta property="og:title" content="${esc(meta.title)}" />`,
    `<meta property="og:description" content="${esc(meta.description)}" />`,
    `<meta property="og:url" content="${esc(meta.canonical)}" />`,
    `<meta property="og:image" content="${esc(meta.image)}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    meta.publishedAt
      ? `<meta property="article:published_time" content="${new Date(meta.publishedAt).toISOString()}" />`
      : '',
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(meta.title)}" />`,
    `<meta name="twitter:description" content="${esc(meta.description)}" />`,
    `<meta name="twitter:image" content="${esc(meta.image)}" />`
  ]
    .filter(Boolean)
    .join('\n    ');

  return html.replace('</head>', `    ${block}\n  </head>`);
}

// Server-rendered article dropped inside #root. Crawlers and LLM fetchers
// that don't run JS read this; browsers replace it the moment React mounts.
// Styled inline to approximate the SPA page so the pre-hydration flash is
// subtle rather than jarring.
function injectBody(shell, innerHtml) {
  return shell.replace(
    /<div id="root">\s*<\/div>/,
    `<div id="root">${innerHtml}</div>`
  );
}

const ARTICLE_CSS = `
    .pt-ssr { max-width: 780px; margin: 0 auto; padding: 64px 20px; background: #07021a; color: #a4b0c4; font-family: Inter, system-ui, sans-serif; line-height: 1.75; }
    .pt-ssr .eyebrow { font-family: 'JetBrains Mono', monospace; font-size: 12px; letter-spacing: .12em; text-transform: uppercase; color: #5eead4; }
    .pt-ssr h1 { color: #ecfeff; font-family: 'Space Grotesk', Inter, sans-serif; font-size: 2.2rem; line-height: 1.15; margin: .6rem 0 1.4rem; }
    .pt-ssr h2 { color: #ecfeff; font-family: 'Space Grotesk', Inter, sans-serif; font-size: 1.5rem; margin: 2.2rem 0 .8rem; }
    .pt-ssr a { color: #5eead4; }
    .pt-ssr strong { color: #ecfeff; }
    .pt-ssr blockquote { border-left: 3px solid #5eead4; margin: 1.2rem 0; padding: .2rem 0 .2rem 1.1rem; color: #ecfeff; }
`;

htmlRouter.get('/blog', async (req, res) => {
  try {
    const shell = await loadShell();
    const [rows] = await pool.query(
      'SELECT * FROM blog_posts WHERE published = 1 ORDER BY published_at DESC'
    );
    const items = rows
      .map(rowToListItem)
      .map(
        (p) =>
          `<li style="margin-bottom:1.6rem"><a href="/blog/${p.slug}" style="color:#ecfeff;font-size:1.25rem;font-weight:600">${esc(p.title)}</a><br/><span class="eyebrow">${esc(formatDate(p.published_at))} · ${p.read_minutes} min read</span><br/>${esc(p.description)}</li>`
      )
      .join('\n');

    let html = injectMeta(shell, {
      title: 'Blog | Penumbra Tech',
      description:
        'Essays from a one-engineer software practice: AI and ownership, engineering judgment, and what it takes to ship real systems.',
      canonical: `${SITE_ORIGIN}/blog`,
      image: `${SITE_ORIGIN}/og-card.png`,
      type: 'website'
    });
    html = injectBody(
      html,
      `<style>${ARTICLE_CSS}</style><main class="pt-ssr"><p class="eyebrow">Penumbra Tech · Blog</p><h1>Blog</h1><ul style="list-style:none;padding:0">${items}</ul></main>`
    );
    res.type('html').send(html);
  } catch (err) {
    console.error('[blog] html index failed:', err);
    res.status(500).type('text').send('blog unavailable');
  }
});

htmlRouter.get('/blog/:slug', async (req, res) => {
  try {
    const shell = await loadShell();
    const post = await getPublishedPost(req.params.slug);

    if (!post) {
      // Serve the SPA shell (React shows its NotFound page) but with a
      // real 404 status so crawlers don't index dead slugs.
      return res.status(404).type('html').send(shell);
    }

    const item = rowToListItem(post);
    const canonical = `${SITE_ORIGIN}/blog/${item.slug}`;

    let html = injectMeta(shell, {
      title: `${item.title} | Penumbra Tech`,
      description: item.description,
      canonical,
      image: `${SITE_ORIGIN}/api/blog/${item.slug}/og.png`,
      type: 'article',
      publishedAt: item.published_at
    });
    html = injectBody(
      html,
      `<style>${ARTICLE_CSS}</style><main class="pt-ssr"><p class="eyebrow">Penumbra Tech · Blog · ${esc(formatDate(item.published_at))} · ${item.read_minutes} min read</p><h1>${esc(item.title)}</h1><article>${renderHtml(post.markdown)}</article><p style="margin-top:2.5rem"><a href="/blog">More posts</a> · <a href="/contact">Book a call</a></p></main>`
    );
    res.type('html').send(html);
  } catch (err) {
    console.error('[blog] html post failed:', err);
    res.status(500).type('text').send('post unavailable');
  }
});

// ---------------------------------------------------------------------------
// Dynamic sitemap.xml + llms-full.txt — static file with blog appended
// ---------------------------------------------------------------------------
// The build step writes the static versions covering the prerendered
// marketing routes; these handlers append the blog entries at request time
// so publishing a post never requires a redeploy for discoverability.

htmlRouter.get('/sitemap.xml', async (req, res) => {
  try {
    const base = await fsp.readFile(path.join(STATIC_ROOT, 'sitemap.xml'), 'utf8');
    const [rows] = await pool.query(
      'SELECT slug, updated_at FROM blog_posts WHERE published = 1 ORDER BY published_at DESC'
    );
    const entries = [
      `  <url>\n    <loc>${SITE_ORIGIN}/blog</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`,
      ...rows.map(
        (r) =>
          `  <url>\n    <loc>${SITE_ORIGIN}/blog/${r.slug}</loc>\n    <lastmod>${new Date(r.updated_at).toISOString().slice(0, 10)}</lastmod>\n    <priority>0.7</priority>\n  </url>`
      )
    ].join('\n');
    res
      .type('application/xml')
      .send(base.replace('</urlset>', `${entries}\n</urlset>`));
  } catch (err) {
    console.error('[blog] sitemap failed:', err);
    res.status(500).type('text').send('sitemap unavailable');
  }
});

htmlRouter.get('/llms-full.txt', async (req, res) => {
  try {
    const base = await fsp.readFile(path.join(STATIC_ROOT, 'llms-full.txt'), 'utf8');
    const [rows] = await pool.query(
      'SELECT * FROM blog_posts WHERE published = 1 ORDER BY published_at DESC'
    );
    const sections = rows
      .map(
        (r) =>
          `\n---\n\n# ${r.title}\n\nURL: ${SITE_ORIGIN}/blog/${r.slug}\nPublished: ${new Date(r.published_at).toISOString().slice(0, 10)}\n\n${r.markdown}\n`
      )
      .join('');
    res.type('text/plain; charset=utf-8').send(base + sections);
  } catch (err) {
    console.error('[blog] llms-full failed:', err);
    res.status(500).type('text').send('llms-full unavailable');
  }
});

module.exports = { publicRouter, adminRouter, htmlRouter };
