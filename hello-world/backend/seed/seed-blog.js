// One-shot seeder for the first blog post. Run on the EC2 box from the
// backend directory (the pool reads .env for DB credentials):
//
//   cd ~/WebDevClass/hello-world/backend && node seed/seed-blog.js
//
// Idempotent: keyed on the slug — re-running updates the content in
// place rather than duplicating. Day-to-day publishing goes through the
// Admin Portal blog console; this exists only to bootstrap post #1 from
// the repo without needing a browser session.

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const fs = require('fs');
const path = require('path');
const pool = require('../db');

const SLUG = 'ai-complaints-are-capitalism-complaints';
const MD_FILE = path.join(__dirname, 'ai-complaints-are-capitalism-complaints.md');
// Kept under 130 chars so the share card's two-line excerpt fits without
// ellipsizing the punchline.
const DESCRIPTION =
  'The fears are real. The target is wrong. The problem is not that machines can make things, it is who owns the machines.';

async function main() {
  const raw = fs.readFileSync(MD_FILE, 'utf8').replace(/\r\n/g, '\n').trim();

  // Same convention as the admin console: first `# ` line is the title
  // and is stripped from the stored body.
  const lines = raw.split('\n');
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
  if (!title) throw new Error('Seed markdown must start with "# Title"');
  const body = lines.slice(bodyStart).join('\n').trim();

  const [result] = await pool.query(
    `INSERT INTO blog_posts (slug, title, description, markdown, published, published_at)
     VALUES (?, ?, ?, ?, 1, NOW())
     ON DUPLICATE KEY UPDATE
       title = VALUES(title),
       description = VALUES(description),
       markdown = VALUES(markdown),
       published = 1`,
    [SLUG, title, DESCRIPTION, body]
  );

  console.log(
    result.affectedRows === 1
      ? `Inserted "${title}" at /blog/${SLUG}`
      : `Updated "${title}" at /blog/${SLUG}`
  );
  await pool.end();
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
