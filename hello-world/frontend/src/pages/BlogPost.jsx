// Blog post — /blog/:slug.
//
// Fetches the server-rendered HTML (markdown is converted by the backend
// with marked; content is authored only by the super_admin) and displays
// it with the site's typography. Direct loads are served by the backend
// shell-injection route so crawlers get correct per-post meta (including
// the generated og.png share card) without a redeploy.
//
// The share row is plain intent links — no SDKs, no scripts, CSP-clean.
// The teaser card preview below it shows exactly what platforms will
// attach when the link is shared, and can be downloaded for manual posts.

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiFetch } from '../lib/api.js';
import {
  colors,
  fonts,
  fontSizes,
  fontWeights,
  radii,
  space
} from '../theme.js';
import Container from '../components/Container.jsx';
import Button from '../components/Button.jsx';
import HudLabel from '../components/HudLabel.jsx';
import useDocumentMeta from '../hooks/useDocumentMeta.js';

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | ready | missing | error
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    setPost(null);
    apiFetch(`/blog/${slug}`)
      .then((data) => {
        if (cancelled) return;
        setPost(data);
        setStatus('ready');
      })
      .catch((err) => {
        if (cancelled) return;
        setStatus(/not found/i.test(err.message) ? 'missing' : 'error');
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const pageUrl = `https://penumbra-tech.com/blog/${slug}`;
  const cardUrl = `https://penumbra-tech.com/api/blog/${slug}/og.png`;

  useDocumentMeta({
    title: post ? `${post.title} | Penumbra Tech` : 'Blog | Penumbra Tech',
    description: post ? post.description : undefined,
    canonical: pageUrl,
    image: post ? cardUrl : undefined,
    type: 'article'
  });

  if (status === 'loading') {
    return (
      <Container narrow style={{ paddingTop: space['3xl'], paddingBottom: space['3xl'] }}>
        <p style={{ color: colors.textMuted }}>Loading…</p>
      </Container>
    );
  }

  if (status !== 'ready') {
    return (
      <Container narrow style={{ paddingTop: space['3xl'], paddingBottom: space['3xl'] }}>
        <HudLabel tone="corona">Blog</HudLabel>
        <h1
          style={{
            fontFamily: fonts.heading,
            color: colors.text,
            fontSize: fontSizes['2xl']
          }}
        >
          {status === 'missing' ? 'No post lives at this address.' : "Couldn't load this post."}
        </h1>
        <p style={{ color: colors.textSecondary }}>
          {status === 'missing'
            ? 'It may have been unpublished, or the link has a typo.'
            : 'Something went wrong on the server. Try a refresh.'}
        </p>
        <div style={{ marginTop: space.lg }}>
          <Button as={Link} to="/blog">
            ← All posts
          </Button>
        </div>
      </Container>
    );
  }

  const shareTargets = [
    {
      label: 'Share on X',
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(pageUrl)}`
    },
    {
      label: 'LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`
    },
    {
      label: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`
    },
    {
      label: 'Reddit',
      href: `https://www.reddit.com/submit?url=${encodeURIComponent(pageUrl)}&title=${encodeURIComponent(post.title)}`
    },
    {
      label: 'Hacker News',
      href: `https://news.ycombinator.com/submitlink?u=${encodeURIComponent(pageUrl)}&t=${encodeURIComponent(post.title)}`
    },
    {
      label: 'Email',
      href: `mailto:?subject=${encodeURIComponent(post.title)}&body=${encodeURIComponent(pageUrl)}`
    }
  ];

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be unavailable (permissions, http); the URL bar
      // still exists, so fail silently.
    }
  }

  return (
    <>
      <section
        style={{
          paddingTop: space['3xl'],
          paddingBottom: space.xl,
          borderBottom: `1px solid ${colors.borderSubtle}`
        }}
      >
        <Container narrow>
          <Link
            to="/blog"
            style={{
              color: colors.textSecondary,
              textDecoration: 'none',
              fontSize: fontSizes.sm,
              fontFamily: fonts.mono
            }}
          >
            ← All posts
          </Link>
          <div style={{ marginTop: space.lg }}>
            <HudLabel tone="corona">
              {formatDate(post.published_at)} · {post.read_minutes} min read
            </HudLabel>
          </div>
          <h1
            style={{
              fontFamily: fonts.heading,
              fontSize: 'clamp(1.9rem, 3.6vw, 2.8rem)',
              fontWeight: fontWeights.bold,
              lineHeight: 1.12,
              letterSpacing: '-0.02em',
              margin: `${space.md} 0 0`,
              color: colors.text
            }}
          >
            {post.title}
          </h1>
        </Container>
      </section>

      <section style={{ paddingTop: space.xl, paddingBottom: space.xl }}>
        <Container narrow>
          {/* Markdown-rendered article. Scoped styles rather than inline
              because the HTML arrives as one server-rendered string. */}
          <style>{`
            .pt-article { color: ${colors.textSecondary}; font-size: 1.06rem; line-height: 1.8; }
            .pt-article h2 { color: ${colors.text}; font-family: ${fonts.heading}; font-size: 1.55rem; line-height: 1.25; margin: 2.6rem 0 1rem; letter-spacing: -0.01em; }
            .pt-article h3 { color: ${colors.text}; font-family: ${fonts.heading}; font-size: 1.2rem; margin: 2rem 0 0.8rem; }
            .pt-article p { margin: 0 0 1.15rem; }
            .pt-article strong { color: ${colors.text}; }
            .pt-article em { color: ${colors.accentBright}; font-style: italic; }
            .pt-article a { color: ${colors.accent}; text-decoration: none; border-bottom: 1px solid ${colors.accentBorder}; }
            .pt-article a:hover { color: ${colors.accentHover}; }
            .pt-article blockquote { border-left: 3px solid ${colors.accent}; margin: 1.4rem 0; padding: 0.2rem 0 0.2rem 1.2rem; color: ${colors.text}; }
            .pt-article ul, .pt-article ol { margin: 0 0 1.15rem; padding-left: 1.4rem; }
            .pt-article li { margin-bottom: 0.4rem; }
            .pt-article hr { border: none; border-top: 1px solid ${colors.borderSubtle}; margin: 2.2rem 0; }
            .pt-article code { font-family: ${fonts.mono}; font-size: 0.9em; background: ${colors.bg}; border: 1px solid ${colors.borderSubtle}; border-radius: 4px; padding: 0.1rem 0.35rem; color: ${colors.accentBright}; }
            .pt-article pre { background: ${colors.codeBg}; border: 1px solid ${colors.border}; border-radius: 8px; padding: 1rem 1.2rem; overflow-x: auto; }
            .pt-article pre code { background: none; border: none; padding: 0; }
            .pt-article img { max-width: 100%; border-radius: 8px; }
          `}</style>
          <article
            className="pt-article"
            // Trusted content: markdown is authored exclusively by the
            // super_admin and rendered server-side. Nobody else can write
            // to blog_posts.
            dangerouslySetInnerHTML={{ __html: post.html }}
          />
        </Container>
      </section>

      {/* Share row + teaser card preview */}
      <section
        style={{
          paddingTop: space.xl,
          paddingBottom: space['2xl'],
          borderTop: `1px solid ${colors.borderSubtle}`
        }}
      >
        <Container narrow>
          <HudLabel tone="cyan">Share this essay</HudLabel>
          <div
            style={{
              display: 'flex',
              gap: space.sm,
              flexWrap: 'wrap',
              marginTop: space.md
            }}
          >
            {shareTargets.map((t) => (
              <a
                key={t.label}
                href={t.href}
                target="_blank"
                rel="noopener noreferrer"
                style={shareBtnStyle}
              >
                {t.label} ↗
              </a>
            ))}
            <button type="button" onClick={copyLink} style={{ ...shareBtnStyle, cursor: 'pointer' }}>
              {copied ? 'Copied ✓' : 'Copy link'}
            </button>
          </div>

          <p
            style={{
              margin: `${space.xl} 0 ${space.sm}`,
              color: colors.textMuted,
              fontFamily: fonts.mono,
              fontSize: fontSizes.xs,
              letterSpacing: '0.04em'
            }}
          >
            The card platforms attach when this link is shared — or{' '}
            <a
              href={cardUrl}
              download={`${slug}-card.png`}
              style={{ color: colors.accent, textDecoration: 'none' }}
            >
              download it
            </a>{' '}
            to attach manually.
          </p>
          <a href={cardUrl} target="_blank" rel="noopener noreferrer">
            <img
              src={cardUrl}
              alt={`Share card for "${post.title}"`}
              loading="lazy"
              style={{
                display: 'block',
                width: '100%',
                maxWidth: 560,
                borderRadius: radii.md,
                border: `1px solid ${colors.border}`
              }}
            />
          </a>

          <div style={{ marginTop: space['2xl'], display: 'flex', gap: space.md, flexWrap: 'wrap' }}>
            <Button as={Link} to="/blog" variant="secondary">
              ← All posts
            </Button>
            <Button as={Link} to="/contact">
              Book a 30-min intro →
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}

const shareBtnStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '0.45rem 0.9rem',
  background: colors.bg,
  border: `1px solid ${colors.border}`,
  borderRadius: radii.full,
  color: colors.textSecondary,
  fontFamily: fonts.mono,
  fontSize: fontSizes.xs,
  letterSpacing: '0.04em',
  textDecoration: 'none'
};
