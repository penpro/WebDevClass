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
//     canonical: 'https://penumbra-tech.com/about'   // optional
//   });

import { useEffect } from 'react';

function setAttr(selector, attr, value) {
  const el = document.querySelector(selector);
  if (el) el.setAttribute(attr, value);
}

export default function useDocumentMeta({ title, description, canonical }) {
  useEffect(() => {
    if (title) {
      document.title = title;
      setAttr('meta[property="og:title"]', 'content', title);
      setAttr('meta[name="twitter:title"]', 'content', title);
    }
    if (description) {
      setAttr('meta[name="description"]', 'content', description);
      setAttr('meta[property="og:description"]', 'content', description);
      setAttr('meta[name="twitter:description"]', 'content', description);
    }
    if (canonical) {
      setAttr('link[rel="canonical"]', 'href', canonical);
      setAttr('meta[property="og:url"]', 'content', canonical);
    }
  }, [title, description, canonical]);
}
