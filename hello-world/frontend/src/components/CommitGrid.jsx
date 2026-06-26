// Last-30-days commit grid for penpro/WebDevClass, GitHub-contribution-style.
// Fetches commits client-side from the public GitHub API on mount, buckets by
// local date, and renders 30 corona-accent cells whose brightness scales with
// commit count for that day. Cached in sessionStorage for an hour so a visitor
// browsing multiple pages doesn't trigger a fresh fetch each time.
//
// No auth required — the commits API is public read for public repos. Anon
// limit is 60 req/hr/IP, which the session cache + ~4-page pagination keeps
// us well under.

import { useEffect, useState } from 'react';
import {
  colors,
  fonts,
  fontSizes,
  fontWeights,
  space
} from '../theme.js';

const REPO = 'penpro/WebDevClass';
const DAYS = 30;
const CACHE_KEY = 'penumbra_commit_grid_v1';
const CACHE_TTL_MS = 60 * 60 * 1000;

function dateKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function buildLastNDays(n) {
  const out = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    out.push(dateKey(d));
  }
  return out;
}

function bucketOf(count) {
  if (count === 0) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  if (count <= 7) return 3;
  return 4;
}

// Corona-tinted opacity ramp. Index = bucket 0..4.
const FILL = [
  { bg: 'rgba(94, 234, 212, 0.06)', border: 'rgba(94, 234, 212, 0.18)' },
  { bg: 'rgba(94, 234, 212, 0.28)', border: 'rgba(94, 234, 212, 0.45)' },
  { bg: 'rgba(94, 234, 212, 0.50)', border: 'rgba(94, 234, 212, 0.65)' },
  { bg: 'rgba(94, 234, 212, 0.75)', border: 'rgba(94, 234, 212, 0.90)' },
  { bg: 'rgba(94, 234, 212, 1.00)', border: 'rgba(94, 234, 212, 1.00)' }
];

async function fetchAllCommits(sinceIso) {
  let url = `https://api.github.com/repos/${REPO}/commits?since=${encodeURIComponent(sinceIso)}&per_page=100`;
  const all = [];
  while (url && all.length < 1000) {
    const r = await fetch(url, {
      headers: { Accept: 'application/vnd.github+json' }
    });
    if (!r.ok) throw new Error(`GitHub API ${r.status}`);
    const page = await r.json();
    all.push(...page);
    const link = r.headers.get('Link');
    const match = link && link.match(/<([^>]+)>;\s*rel="next"/);
    url = match ? match[1] : null;
  }
  return all;
}

function readCache() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.ts > CACHE_TTL_MS) return null;
    return parsed.counts;
  } catch {
    return null;
  }
}

function writeCache(counts) {
  try {
    sessionStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ ts: Date.now(), counts })
    );
  } catch {
    // sessionStorage can be unavailable (private mode, quota, etc) — fine.
  }
}

export default function CommitGrid() {
  const [state, setState] = useState({ status: 'loading', counts: {} });
  const days = buildLastNDays(DAYS);
  const today = days[days.length - 1];

  useEffect(() => {
    const cached = readCache();
    if (cached) {
      setState({ status: 'ready', counts: cached });
      return;
    }

    const since = new Date();
    since.setDate(since.getDate() - DAYS);
    since.setHours(0, 0, 0, 0);

    let cancelled = false;
    fetchAllCommits(since.toISOString())
      .then((commits) => {
        if (cancelled) return;
        const counts = {};
        for (const c of commits) {
          const iso =
            c.commit?.committer?.date || c.commit?.author?.date;
          if (!iso) continue;
          const key = dateKey(new Date(iso));
          counts[key] = (counts[key] || 0) + 1;
        }
        writeCache(counts);
        setState({ status: 'ready', counts });
      })
      .catch(() => {
        if (cancelled) return;
        setState({ status: 'error', counts: {} });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const { status, counts } = state;
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const activeDays = Object.values(counts).filter((c) => c > 0).length;

  const headerRight =
    status === 'ready'
      ? `${total} commit${total === 1 ? '' : 's'} across ${activeDays} day${activeDays === 1 ? '' : 's'}`
      : status === 'error'
        ? 'GitHub API unreachable'
        : 'fetching...';

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: space.sm,
          marginBottom: space.md
        }}
      >
        <h3
          style={{
            margin: 0,
            fontFamily: fonts.heading,
            fontSize: fontSizes.lg,
            fontWeight: fontWeights.semibold,
            color: colors.text
          }}
        >
          Recent shipping
        </h3>
        <span
          style={{
            fontFamily: fonts.mono,
            fontSize: fontSizes.xs,
            color: colors.textMuted,
            letterSpacing: '0.04em'
          }}
        >
          {headerRight}
        </span>
      </div>

      <div
        role="img"
        aria-label={`Commit activity for the last ${DAYS} days`}
        style={{
          display: 'flex',
          gap: 4,
          flexWrap: 'nowrap',
          overflowX: 'auto',
          paddingBottom: 2
        }}
      >
        {days.map((day) => {
          const count = counts[day] || 0;
          const b = bucketOf(count);
          const fill = FILL[b];
          const isToday = day === today;
          const label =
            status === 'ready'
              ? `${day}: ${count} commit${count === 1 ? '' : 's'}`
              : day;
          return (
            <span
              key={day}
              title={label}
              aria-label={label}
              style={{
                width: 14,
                height: 14,
                borderRadius: 3,
                background: fill.bg,
                border: `1px solid ${fill.border}`,
                boxShadow: isToday
                  ? '0 0 10px rgba(94, 234, 212, 0.55)'
                  : 'none',
                flexShrink: 0,
                display: 'inline-block'
              }}
            />
          );
        })}
      </div>

      <div
        style={{
          marginTop: space.md,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: space.sm,
          fontFamily: fonts.mono,
          fontSize: fontSizes.xs,
          color: colors.textMuted,
          letterSpacing: '0.04em'
        }}
      >
        <span>30 days ago → today</span>
        <span
          style={{
            display: 'inline-flex',
            gap: 4,
            alignItems: 'center'
          }}
        >
          less
          {FILL.map((f, i) => (
            <span
              key={i}
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                background: f.bg,
                border: `1px solid ${f.border}`,
                display: 'inline-block'
              }}
            />
          ))}
          more
        </span>
        <a
          href={`https://github.com/${REPO}/commits/main`}
          target="_blank"
          rel="noreferrer noopener"
          style={{
            color: colors.accent,
            textDecoration: 'none'
          }}
        >
          github.com/{REPO} ↗
        </a>
      </div>
    </div>
  );
}
