// BlogConsole — the Admin Portal's publishing surface (super_admin only;
// the parent gates rendering).
//
// Flow: drop or pick a .md file (or paste markdown), the console derives
// title / slug / description from the text the same way the backend does
// (first `# heading` = title; first paragraph = description), all three
// stay editable, then Publish POSTs to /api/admin/blog. The moment that
// returns, the post is live at /blog/<slug> with working share cards —
// the backend serves blog HTML dynamically, so there is no deploy step.
//
// Below the composer: every existing post with view / share-card /
// unpublish / delete controls.

import { useEffect, useRef, useState } from 'react';
import { apiFetch } from '../../lib/api.js';
import {
  colors,
  fonts,
  fontSizes,
  fontWeights,
  radii,
  space
} from '../../theme.js';
import Card from '../Card.jsx';
import Button from '../Button.jsx';

function slugify(s) {
  return String(s)
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

// Mirror of the backend's deriveFromMarkdown — used only to prefill the
// editable fields so the admin sees what will happen before publishing.
function derive(md) {
  const text = String(md).replace(/\r\n/g, '\n').trim();
  const lines = text.split('\n');
  let title = '';
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith('# ')) title = line.slice(2).trim();
    break;
  }
  let description = '';
  for (const para of text.split(/\n{2,}/)) {
    const p = para.trim();
    if (!p || p.startsWith('#') || p.startsWith('![') || /^[-*_]{3,}$/.test(p)) continue;
    description = p.replace(/\s+/g, ' ').replace(/[*_`>#[\]]/g, '');
    break;
  }
  if (description.length > 200) description = `${description.slice(0, 197).trimEnd()}...`;
  return { title, description };
}

function formatDate(d) {
  if (!d) return 'draft';
  return new Date(d).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export default function BlogConsole() {
  const [posts, setPosts] = useState(null);
  const [markdown, setMarkdown] = useState('');
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null); // {tone: 'ok'|'err', text, url?}
  const fileRef = useRef(null);

  async function refresh() {
    try {
      setPosts(await apiFetch('/admin/blog'));
    } catch (err) {
      setMessage({ tone: 'err', text: `Couldn't load posts: ${err.message}` });
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function adoptMarkdown(text) {
    setMarkdown(text);
    const d = derive(text);
    if (d.title) {
      setTitle(d.title);
      if (!slugTouched) setSlug(slugify(d.title));
    }
    if (d.description) setDescription(d.description);
    setMessage(null);
  }

  function onFile(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => adoptMarkdown(String(reader.result || ''));
    reader.readAsText(file);
  }

  async function publish() {
    setBusy(true);
    setMessage(null);
    try {
      const created = await apiFetch('/admin/blog', {
        method: 'POST',
        body: JSON.stringify({
          markdown,
          title: title.trim() || undefined,
          slug: slug.trim() || undefined,
          description: description.trim() || undefined,
          published: true
        })
      });
      setMessage({
        tone: 'ok',
        text: `Published "${created.title}".`,
        url: `/blog/${created.slug}`
      });
      setMarkdown('');
      setTitle('');
      setSlug('');
      setDescription('');
      setSlugTouched(false);
      if (fileRef.current) fileRef.current.value = '';
      refresh();
    } catch (err) {
      setMessage({ tone: 'err', text: err.message });
    } finally {
      setBusy(false);
    }
  }

  async function togglePublished(post) {
    try {
      await apiFetch(`/admin/blog/${post.id}`, {
        method: 'PUT',
        body: JSON.stringify({ published: !post.published })
      });
      refresh();
    } catch (err) {
      setMessage({ tone: 'err', text: err.message });
    }
  }

  async function remove(post) {
    if (!window.confirm(`Delete "${post.title}" permanently? This cannot be undone.`)) {
      return;
    }
    try {
      await apiFetch(`/admin/blog/${post.id}`, { method: 'DELETE' });
      refresh();
    } catch (err) {
      setMessage({ tone: 'err', text: err.message });
    }
  }

  return (
    <Card variant="accent" style={{ marginBottom: space.xl }}>
      <div
        style={{
          fontFamily: fonts.heading,
          fontWeight: fontWeights.semibold,
          color: colors.text,
          fontSize: fontSizes.md,
          marginBottom: space.xs
        }}
      >
        Blog console
      </div>
      <div
        style={{
          fontSize: fontSizes.sm,
          color: colors.textSecondary,
          lineHeight: 1.55,
          marginBottom: space.md,
          maxWidth: '62ch'
        }}
      >
        Drop a .md file (or paste markdown), check the derived title, slug,
        and description, and publish. The post is live at /blog/&lt;slug&gt;
        immediately, share card included — no deploy needed.
      </div>

      <div style={{ display: 'flex', gap: space.sm, flexWrap: 'wrap', marginBottom: space.sm }}>
        <input
          ref={fileRef}
          type="file"
          accept=".md,.markdown,text/markdown,text/plain"
          onChange={onFile}
          style={{
            color: colors.textSecondary,
            fontFamily: fonts.mono,
            fontSize: fontSizes.xs
          }}
        />
      </div>

      <textarea
        value={markdown}
        onChange={(e) => adoptMarkdown(e.target.value)}
        placeholder={'# Post Title\n\nOr paste the whole markdown file here...'}
        rows={markdown ? 10 : 4}
        style={{
          width: '100%',
          boxSizing: 'border-box',
          padding: '0.7rem 0.9rem',
          background: colors.bg,
          border: `1px solid ${colors.border}`,
          borderRadius: radii.md,
          color: colors.text,
          fontFamily: fonts.mono,
          fontSize: fontSizes.sm,
          lineHeight: 1.5,
          resize: 'vertical',
          outline: 'none',
          marginBottom: space.md
        }}
      />

      <div style={{ display: 'grid', gap: space.sm, marginBottom: space.md }}>
        <label style={fieldLabelStyle}>
          Title
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!slugTouched) setSlug(slugify(e.target.value));
            }}
            style={fieldInputStyle}
          />
        </label>
        <label style={fieldLabelStyle}>
          Slug — /blog/{slug || '…'}
          <input
            type="text"
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(slugify(e.target.value));
            }}
            style={fieldInputStyle}
          />
        </label>
        <label style={fieldLabelStyle}>
          Meta description (search results + share card excerpt)
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            style={{ ...fieldInputStyle, resize: 'vertical' }}
          />
        </label>
      </div>

      <div style={{ display: 'flex', gap: space.sm, alignItems: 'center', flexWrap: 'wrap' }}>
        <Button onClick={publish} disabled={busy || !markdown.trim()}>
          {busy ? 'Publishing…' : 'Publish post'}
        </Button>
        {message && (
          <span
            style={{
              fontSize: fontSizes.sm,
              color: message.tone === 'ok' ? colors.accent : colors.danger
            }}
          >
            {message.text}{' '}
            {message.url && (
              <a href={message.url} style={{ color: colors.accent }}>
                View it →
              </a>
            )}
          </span>
        )}
      </div>

      {/* Existing posts */}
      <div style={{ marginTop: space.lg, borderTop: `1px solid ${colors.borderSubtle}`, paddingTop: space.md }}>
        {posts === null && (
          <span style={{ color: colors.textMuted, fontSize: fontSizes.sm }}>Loading posts…</span>
        )}
        {posts && posts.length === 0 && (
          <span style={{ color: colors.textMuted, fontSizes: fontSizes.sm }}>
            No posts yet — the one above will be the first.
          </span>
        )}
        {posts &&
          posts.map((post) => (
            <div
              key={post.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: space.md,
                flexWrap: 'wrap',
                padding: `${space.sm} 0`,
                borderBottom: `1px solid ${colors.borderSubtle}`
              }}
            >
              <div style={{ flex: '1 1 260px', minWidth: 0 }}>
                <div
                  style={{
                    color: colors.text,
                    fontWeight: fontWeights.medium,
                    fontSize: fontSizes.sm,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {post.title}
                </div>
                <div
                  style={{
                    color: colors.textMuted,
                    fontFamily: fonts.mono,
                    fontSize: fontSizes.xs
                  }}
                >
                  {post.published ? formatDate(post.published_at) : 'unpublished'} ·{' '}
                  {post.read_minutes} min · /blog/{post.slug}
                </div>
              </div>
              <div style={{ display: 'flex', gap: space.xs, flexWrap: 'wrap' }}>
                <a href={`/blog/${post.slug}`} target="_blank" rel="noreferrer" style={rowBtnStyle}>
                  View ↗
                </a>
                <a
                  href={`/api/blog/${post.slug}/og.png`}
                  target="_blank"
                  rel="noreferrer"
                  style={rowBtnStyle}
                >
                  Card ↗
                </a>
                <button type="button" onClick={() => togglePublished(post)} style={rowBtnStyle}>
                  {post.published ? 'Unpublish' : 'Publish'}
                </button>
                <button
                  type="button"
                  onClick={() => remove(post)}
                  style={{ ...rowBtnStyle, color: colors.danger, borderColor: colors.dangerMuted }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
      </div>
    </Card>
  );
}

const fieldLabelStyle = {
  display: 'block',
  color: colors.textMuted,
  fontFamily: fonts.mono,
  fontSize: fontSizes.xs,
  letterSpacing: '0.04em'
};

const fieldInputStyle = {
  display: 'block',
  width: '100%',
  boxSizing: 'border-box',
  marginTop: '0.3rem',
  padding: '0.5rem 0.7rem',
  background: colors.bg,
  border: `1px solid ${colors.border}`,
  borderRadius: radii.md,
  color: colors.text,
  fontFamily: fonts.body,
  fontSize: fontSizes.sm,
  outline: 'none'
};

const rowBtnStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '0.3rem 0.7rem',
  background: 'transparent',
  border: `1px solid ${colors.border}`,
  borderRadius: radii.md,
  color: colors.textSecondary,
  fontFamily: fonts.mono,
  fontSize: fontSizes.xs,
  textDecoration: 'none',
  cursor: 'pointer'
};
