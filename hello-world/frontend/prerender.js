// Post-build prerender step.
//
// For each route in ROUTES, this:
//   1. Serves the freshly-built dist/ on localhost
//   2. Headless-Chromium-renders that route through the SPA
//   3. Writes the post-React HTML to dist/<route>/index.html
//
// Combined with nginx `try_files $uri $uri/index.html /index.html;`, this
// means a request to /about returns the fully-rendered about page HTML
// (no JS execution needed by the client to see content). Two payoffs:
//
//   * SEO — Google indexes content reliably without depending on its
//     JS rendering step.
//   * LLM accessibility — ChatGPT/Claude/Perplexity fetching the URL
//     via tool calls get actual page content, not the empty React shell.
//
// Users hitting the site in a browser still get the SPA experience:
// React hydrates on top of the prerendered HTML, takes over routing,
// and the rest of the navigation stays client-side.
//
// Skipped routes: auth pages, app surfaces (admin, tasktrackr, etc.),
// and dynamic param routes (:token) — no SEO value, would need auth
// or a stub anyway.

import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, dirname, join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = resolve(__dirname, 'dist');
const PORT = 4174;

const ROUTES = [
  '/',
  '/about',
  '/contact',
  '/services',
  '/stack',
  '/judgment',
  '/guide',
  '/saas-rescue',
  '/projects',
  '/projects/diagnostics',
  '/projects/theory-of-computation',
  '/projects/repair360-auto',
  '/projects/trigonometry-tools',
  '/projects/metaverse-origins',
  '/projects/music-visualizer',
  '/api-guide'
];

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.mjs':  'application/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.ico':  'image/x-icon',
  '.webp': 'image/webp',
  '.woff':  'font/woff',
  '.woff2': 'font/woff2',
  '.ttf':   'font/ttf',
  '.otf':   'font/otf',
  '.xml':   'application/xml; charset=utf-8',
  '.txt':   'text/plain; charset=utf-8'
};

// Minimal static-file server with SPA fallback so puppeteer can navigate
// any route and get index.html for unknown paths (matches nginx behavior).
function startServer() {
  return new Promise((resolveFn) => {
    const server = createServer(async (req, res) => {
      let urlPath = req.url.split('?')[0];
      if (urlPath === '/') urlPath = '/index.html';

      // Try the literal path first.
      let fullPath = join(DIST, urlPath);
      if (!existsSync(fullPath) || !extname(fullPath)) {
        // SPA fallback — any route without an extension serves index.html.
        fullPath = join(DIST, 'index.html');
      }

      try {
        const body = await readFile(fullPath);
        const mime = MIME[extname(fullPath)] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': mime });
        res.end(body);
      } catch {
        res.writeHead(404);
        res.end('not found');
      }
    });
    server.listen(PORT, () => resolveFn(server));
  });
}

async function main() {
  if (!existsSync(DIST)) {
    console.error(`prerender: dist/ not found at ${DIST}. Run 'vite build' first.`);
    process.exit(1);
  }

  const server = await startServer();
  console.log(`prerender: serving dist/ on http://localhost:${PORT}`);

  // --no-sandbox is required for the constrained container EC2 sometimes
  // runs builds in. Safe here since the only URL puppeteer visits is our
  // own localhost server.
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  let ok = 0;
  let failed = 0;

  // Collected per-route (title, plain text) for llms-full.txt.
  const llmEntries = [];

  for (const route of ROUTES) {
    const url = `http://localhost:${PORT}${route}`;
    process.stdout.write(`prerender: ${route} ... `);

    const page = await browser.newPage();
    try {
      // networkidle2 = ≤2 connections for 500ms — copes with React.lazy
      // chunks finishing + the CommitGrid's GitHub API call.
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      // Small grace period for any late hydration / lazy-loaded sections.
      await new Promise((r) => setTimeout(r, 1200));

      const html = await page.content();
      const outDir = route === '/' ? DIST : join(DIST, route);
      const outFile = join(outDir, 'index.html');
      await mkdir(outDir, { recursive: true });
      await writeFile(outFile, html, 'utf-8');

      // Also extract the page's text content for llms-full.txt. innerText
      // respects layout (gives us collapsed whitespace, line breaks at
      // block boundaries) which is exactly what an LLM consumer wants.
      const { title, text } = await page.evaluate(() => ({
        title: document.title,
        text: document.body.innerText
      }));
      llmEntries.push({ route, title, text });

      console.log(`✓ (${Math.round(html.length / 1024)}KB html, ${Math.round(text.length / 1024)}KB text)`);
      ok++;
    } catch (err) {
      console.log(`✗ ${err.message}`);
      failed++;
    } finally {
      await page.close();
    }
  }

  await browser.close();
  server.close();

  // Write llms-full.txt with the full plain text of every prerendered
  // route. Format follows the llmstxt.org convention loosely — one
  // section per page, separated by a clear delimiter. LLM agents can
  // ingest this directly without parsing HTML.
  const llmFullPath = join(DIST, 'llms-full.txt');
  const llmFullBody = llmEntries
    .map(
      ({ route, title, text }) =>
        `# ${title}\n\nURL: https://penumbra-tech.com${route}\n\n${text.trim()}\n`
    )
    .join('\n---\n\n');
  await writeFile(llmFullPath, llmFullBody, 'utf-8');
  console.log(`prerender: wrote llms-full.txt (${Math.round(llmFullBody.length / 1024)}KB across ${llmEntries.length} pages)`);

  console.log(`prerender: done. ${ok} ok, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error('prerender: fatal', err);
  process.exit(1);
});
