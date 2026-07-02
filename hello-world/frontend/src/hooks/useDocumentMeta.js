// useDocumentMeta — keeps document.title + <meta name="description"> +
// OG/Twitter title-and-description tags in sync with the active page.
//
// The site is a React SPA but ships per-route prerendered HTML via
// puppeteer (see hello-world/frontend/prerender.js). Puppeteer renders
// each route after React's effects have fired, so whatever this hook
// sets at mount time gets baked into the per-route static HTML that
// crawlers and LLM agents fetch.
//
// On client-side navigation, the hook keeps the values fresh as the
// user moves between routes inside the SPA.
//
// Usage:
//   useDocumentMeta({
//     title: 'About Wesley Weaver Jr. — Penumbra Tech',
//     description: 'One-engineer consulting practice...',
//     canonical: 'https://penumbra-tech.com/about',  // optional
//     image: 'https://.../og.png',                   // optional og:image override
//     type: 'article'                                // optional og:type (default website)
//   });

import { useEffect } from 'react';

// Set an attribute on the first element matching `selector`, creating the
// tag when it doesn't exist yet (some og tags are only present when a
// page has previously set them; blog posts set og:image per-post).
function setTag(selector, create, attr, value) {
  let el = document.querySelector(selector);
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
}

function metaBy(kind, key) {
  return () => {
    const el = document.createElement('meta');
    el.setAttribute(kind, key);
    return el;
  };
}

export default function useDocumentMeta({
  title,
  description,
  canonical,
  image,
  type
}) {
  useEffect(() => {
    if (title) {
      document.title = title;
      setTag('meta[property="og:title"]', metaBy('property', 'og:title'), 'content', title);
      setTag('meta[name="twitter:title"]', metaBy('name', 'twitter:title'), 'content', title);
    }
    if (description) {
      setTag('meta[name="description"]', metaBy('name', 'description'), 'content', description);
      setTag('meta[property="og:description"]', metaBy('property', 'og:description'), 'content', description);
      setTag('meta[name="twitter:description"]', metaBy('name', 'twitter:description'), 'content', description);
    }
    if (canonical) {
      setTag('link[rel="canonical"]', () => {
        const el = document.createElement('link');
        el.setAttribute('rel', 'canonical');
        return el;
      }, 'href', canonical);
      setTag('meta[property="og:url"]', metaBy('property', 'og:url'), 'content', canonical);
    }
    if (image) {
      setTag('meta[property="og:image"]', metaBy('property', 'og:image'), 'content', image);
      setTag('meta[name="twitter:image"]', metaBy('name', 'twitter:image'), 'content', image);
    }
    // og:type always resets so navigating from an article back to a
    // marketing page doesn't leave a stale type="article" behind.
    setTag('meta[property="og:type"]', metaBy('property', 'og:type'), 'content', type || 'website');
  }, [title, description, canonical, image, type]);
}
