// PrivatePagesConsole — the Admin Portal's "Private pages" surface
// (super_admin only; the parent gates rendering).
//
// Upload a self-contained .html file or a .zip static-site bundle; each is
// published to an UNLISTED URL (/preview/<slug>/) you can hand to a client —
// nothing links to it and it's flagged noindex, but anyone with the URL can
// open it. "Lock" flips a page to super-admin-only (a locked URL 404s for
// everyone else). Every page's URL is listed here with a copy button so you
// never lose one. Delete removes the row and the files.
//
// The upload is multipart/form-data, so it uses a raw fetch (apiFetch always
// sends application/json). List / lock / delete go through apiFetch.

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

function formatBytes(n) {
  const b = Number(n) || 0;
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
}

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export default function PrivatePagesConsole() {
  const [pages, setPages] = useState(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null); // {tone, text, url?}
  const [copied, setCopied] = useState(null); // id just copied
  const fileRef = useRef(null);

  async function refresh() {
    try {
      setPages(await apiFetch('/admin/previews'));
    } catch (err) {
      setMessage({ tone: 'err', text: `Couldn't load pages: ${err.message}` });
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onFile(e) {
    const f = e.target.files && e.target.files[0];
    setFile(f || null);
    setMessage(null);
    if (f && !slugTouched) {
      const base = f.name.replace(/\.[^.]+$/, '');
      setSlug(slugify(base));
      if (!title) setTitle('');
    }
  }

  async function upload() {
    if (!file) return;
    setBusy(true);
    setMessage(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      if (title.trim()) fd.append('title', title.trim());
      if (slug.trim()) fd.append('slug', slug.trim());
      // Raw fetch: multipart needs the browser to set its own boundary, so
      // we can't route this through apiFetch (which forces JSON).
      const res = await fetch('/api/admin/previews', {
        method: 'POST',
        credentials: 'include',
        body: fd
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error((data && data.error) || `Upload failed (${res.status})`);
      }
      setMessage({
        tone: 'ok',
        text: `Published "${data.title}".`,
        url: data.path
      });
      setTitle('');
      setSlug('');
      setSlugTouched(false);
      setFile(null);
      if (fileRef.current) fileRef.current.value = '';
      refresh();
    } catch (err) {
      setMessage({ tone: 'err', text: err.message });
    } finally {
      setBusy(false);
    }
  }

  async function toggleLock(page) {
    try {
      await apiFetch(`/admin/previews/${page.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ locked: !page.locked })
      });
      refresh();
    } catch (err) {
      setMessage({ tone: 'err', text: err.message });
    }
  }

  async function remove(page) {
    if (
      !window.confirm(
        `Delete "${page.title}" (/preview/${page.slug}/) permanently? The files are removed too. This cannot be undone.`
      )
    ) {
      return;
    }
    try {
      await apiFetch(`/admin/previews/${page.id}`, { method: 'DELETE' });
      refresh();
    } catch (err) {
      setMessage({ tone: 'err', text: err.message });
    }
  }

  async function copyUrl(page) {
    try {
      await navigator.clipboard.writeText(page.url);
      setCopied(page.id);
      setTimeout(() => setCopied((c) => (c === page.id ? null : c)), 1500);
    } catch {
      setMessage({ tone: 'err', text: 'Clipboard blocked — select the URL and copy manually.' });
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
        Private pages
      </div>
      <div
        style={{
          fontSize: fontSizes.sm,
          color: colors.textSecondary,
          lineHeight: 1.55,
          marginBottom: space.md,
          maxWidth: '64ch'
        }}
      >
        Upload a self-contained <code>.html</code> file or a <code>.zip</code>{' '}
        of a static site (must contain an <code>index.html</code>). Each gets
        an unlisted URL at <code>/preview/&lt;slug&gt;/</code> — nothing links
        to it and it's marked noindex, so you can hand the link to a client.
        Every URL is listed below so you never lose one.{' '}
        <strong style={{ color: colors.text }}>Lock</strong> makes a page
        visible only to you (a locked URL 404s for everyone else).
      </div>

      <div
        style={{
          display: 'flex',
          gap: space.sm,
          flexWrap: 'wrap',
          marginBottom: space.sm
        }}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".html,.htm,.zip,text/html,application/zip"
          onChange={onFile}
          style={{
            color: colors.textSecondary,
            fontFamily: fonts.mono,
            fontSize: fontSizes.xs
          }}
        />
      </div>

      <div style={{ display: 'grid', gap: space.sm, marginBottom: space.md }}>
        <label style={fieldLabelStyle}>
          Title (optional — defaults to the page&apos;s &lt;title&gt; or filename)
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={fieldInputStyle}
            placeholder="Luminous Vibrations — client preview"
          />
        </label>
        <label style={fieldLabelStyle}>
          Slug — /preview/{slug || '…'}/
          <input
            type="text"
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(slugify(e.target.value));
            }}
            style={fieldInputStyle}
            placeholder="luminous-vibrations"
          />
        </label>
      </div>

      <div
        style={{
          display: 'flex',
          gap: space.sm,
          alignItems: 'center',
          flexWrap: 'wrap'
        }}
      >
        <Button onClick={upload} disabled={busy || !file}>
          {busy ? 'Uploading…' : 'Publish preview'}
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
              <a
                href={message.url}
                target="_blank"
                rel="noreferrer"
                style={{ color: colors.accent }}
              >
                View it →
              </a>
            )}
          </span>
        )}
      </div>

      {/* Existing pages */}
      <div
        style={{
          marginTop: space.lg,
          borderTop: `1px solid ${colors.borderSubtle}`,
          paddingTop: space.md
        }}
      >
        {pages === null && (
          <span style={{ color: colors.textMuted, fontSize: fontSizes.sm }}>
            Loading pages…
          </span>
        )}
        {pages && pages.length === 0 && (
          <span style={{ color: colors.textMuted, fontSize: fontSizes.sm }}>
            No private pages yet — upload one above.
          </span>
        )}
        {pages &&
          pages.map((page) => (
            <div
              key={page.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: space.md,
                flexWrap: 'wrap',
                padding: `${space.sm} 0`,
                borderBottom: `1px solid ${colors.borderSubtle}`
              }}
            >
              <div style={{ flex: '1 1 320px', minWidth: 0 }}>
                <div
                  style={{
                    color: colors.text,
                    fontWeight: fontWeights.medium,
                    fontSize: fontSizes.sm,
                    display: 'flex',
                    alignItems: 'center',
                    gap: space.xs,
                    overflow: 'hidden'
                  }}
                >
                  <span
                    style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {page.title}
                  </span>
                  {page.locked && (
                    <span
                      style={{
                        flex: 'none',
                        fontFamily: fonts.mono,
                        fontSize: '0.62rem',
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        color: colors.honey || colors.accent,
                        border: `1px solid ${colors.border}`,
                        borderRadius: radii.full || radii.md,
                        padding: '0.05rem 0.4rem'
                      }}
                    >
                      🔒 Locked
                    </span>
                  )}
                </div>
                <div
                  style={{
                    color: colors.textMuted,
                    fontFamily: fonts.mono,
                    fontSize: fontSizes.xs,
                    marginTop: '0.15rem'
                  }}
                >
                  {page.kind} · {formatBytes(page.bytes)} · {page.files} file
                  {page.files === 1 ? '' : 's'} · {formatDate(page.created_at)}
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: space.xs,
                    marginTop: '0.3rem',
                    minWidth: 0
                  }}
                >
                  <code
                    style={{
                      color: colors.textSecondary,
                      fontFamily: fonts.mono,
                      fontSize: fontSizes.xs,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {page.url}
                  </code>
                  <button
                    type="button"
                    onClick={() => copyUrl(page)}
                    style={{ ...rowBtnStyle, flex: 'none' }}
                  >
                    {copied === page.id ? 'Copied ✓' : 'Copy'}
                  </button>
                </div>
              </div>
              <div style={{ display: 'flex', gap: space.xs, flexWrap: 'wrap' }}>
                <a
                  href={page.path}
                  target="_blank"
                  rel="noreferrer"
                  style={rowBtnStyle}
                >
                  View ↗
                </a>
                <button type="button" onClick={() => toggleLock(page)} style={rowBtnStyle}>
                  {page.locked ? 'Unlock' : 'Lock'}
                </button>
                <button
                  type="button"
                  onClick={() => remove(page)}
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
