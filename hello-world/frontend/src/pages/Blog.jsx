// Blog index — /blog.
//
// Lists published posts newest-first from GET /api/blog. Direct loads of
// this URL are served by the backend (nginx proxies /blog there), which
// injects the meta tags + a plain-HTML copy of the list into the SPA
// shell for crawlers; this component is what humans see once React mounts.

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../lib/api.js';
import {
  colors,
  fonts,
  fontSizes,
  fontWeights,
  space
} from '../theme.js';
import Container from '../components/Container.jsx';
import Card from '../components/Card.jsx';
import Stars from '../components/Stars.jsx';
import CornerBrackets from '../components/CornerBrackets.jsx';
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

export default function Blog() {
  useDocumentMeta({
    title: 'Blog | Penumbra Tech',
    description:
      'Essays from a one-engineer software practice: AI and ownership, engineering judgment, and what it takes to ship real systems.',
    canonical: 'https://penumbra-tech.com/blog'
  });

  const [posts, setPosts] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    apiFetch('/blog')
      .then((data) => {
        if (!cancelled) setPosts(data || []);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <section
        style={{
          position: 'relative',
          overflow: 'hidden',
          paddingTop: space['3xl'],
          paddingBottom: space.xl,
          borderBottom: `1px solid ${colors.borderSubtle}`
        }}
      >
        <Stars density={100} heroDensity={10} colorTint="corona" />
        <CornerBrackets size={28} inset={24} />
        <Container narrow style={{ position: 'relative', zIndex: 1 }}>
          <HudLabel tone="corona">Blog</HudLabel>
          <h1
            style={{
              fontFamily: fonts.heading,
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: fontWeights.bold,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              margin: `${space.md} 0 ${space.md}`,
              color: colors.text
            }}
          >
            Longer thoughts, written down.
          </h1>
          <p
            style={{
              margin: 0,
              maxWidth: '58ch',
              fontSize: fontSizes.lg,
              color: colors.textSecondary,
              lineHeight: 1.6
            }}
          >
            Essays on AI and ownership, engineering judgment, and what it
            takes to ship real systems. Written by a human, one engineer,
            no content calendar.
          </p>
        </Container>
      </section>

      <section style={{ paddingTop: space['2xl'], paddingBottom: space['3xl'] }}>
        <Container narrow>
          {error && (
            <p style={{ color: colors.danger }}>
              Couldn&apos;t load posts: {error}
            </p>
          )}
          {!error && posts === null && (
            <p style={{ color: colors.textMuted }}>Loading…</p>
          )}
          {posts && posts.length === 0 && (
            <p style={{ color: colors.textMuted }}>
              Nothing published yet. Check back soon.
            </p>
          )}
          {posts &&
            posts.map((post) => (
              <Link
                key={post.slug}
                to={`/blog/${post.slug}`}
                style={{ textDecoration: 'none', display: 'block', marginBottom: space.lg }}
              >
                <Card interactive padding={space.lg}>
                  <div
                    style={{
                      fontFamily: fonts.mono,
                      fontSize: fontSizes.xs,
                      color: colors.cyan,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      marginBottom: space.sm
                    }}
                  >
                    {formatDate(post.published_at)} · {post.read_minutes} min read
                  </div>
                  <h2
                    style={{
                      fontFamily: fonts.heading,
                      fontSize: fontSizes.xl,
                      fontWeight: fontWeights.semibold,
                      margin: `0 0 ${space.sm}`,
                      color: colors.text,
                      lineHeight: 1.25
                    }}
                  >
                    {post.title}
                  </h2>
                  <p
                    style={{
                      margin: 0,
                      fontSize: fontSizes.base,
                      lineHeight: 1.65,
                      color: colors.textSecondary
                    }}
                  >
                    {post.description}
                  </p>
                  <span
                    style={{
                      display: 'inline-block',
                      marginTop: space.md,
                      color: colors.accent,
                      fontSize: fontSizes.sm,
                      fontWeight: fontWeights.semibold
                    }}
                  >
                    Read the essay →
                  </span>
                </Card>
              </Link>
            ))}
        </Container>
      </section>
    </>
  );
}
