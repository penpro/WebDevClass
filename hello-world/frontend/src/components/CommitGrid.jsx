// Multi-repo "recent shipping" grid for /about.
//
// Fetches the top-N most-recently-pushed public, non-fork, non-archived
// repos owned by the user, then renders one row per repo. Each row's
// 30-cell window ENDS at that repo's last-push date — so dormant repos
// still show their last burst of activity instead of reading as a blank
// "abandoned" row. The relative-time label next to each repo name makes
// the staleness honest ("4 months ago" not hidden).
//
// Cached in sessionStorage (1h TTL) so a visitor browsing /about →
// /contact → /about doesn't re-hit the GitHub API. Anonymous limit is
// 60 req/hr/IP; this component uses 1 + N requests per cold load, well
// under that ceiling even with multiple visitors sharing an IP.

import { useEffect, useState } from 'react';
import {
  colors,
  fonts,
  fontSizes,
  fontWeights,
  space
} from '../theme.js';

const USER = 'penpro';
const REPO_COUNT = 8;
const DAYS = 25;
const CACHE_KEY = 'penumbra_commit_grid_v2';
const CACHE_TTL_MS = 60 * 60 * 1000;

function dateKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function buildDays(endDate, n) {
  const out = [];
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setDate(end.getDate() - i);
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

const FILL = [
  { bg: 'rgba(94, 234, 212, 0.06)', border: 'rgba(94, 234, 212, 0.18)' },
  { bg: 'rgba(94, 234, 212, 0.28)', border: 'rgba(94, 234, 212, 0.45)' },
  { bg: 'rgba(94, 234, 212, 0.50)', border: 'rgba(94, 234, 212, 0.65)' },
  { bg: 'rgba(94, 234, 212, 0.75)', border: 'rgba(94, 234, 212, 0.90)' },
  { bg: 'rgba(94, 234, 212, 1.00)', border: 'rgba(94, 234, 212, 1.00)' }
];

function relativeTime(iso) {
  const ms = Date.now() - new Date(iso).getTime();
  const seconds = Math.round(ms / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);
  const months = Math.round(days / 30);
  const years = Math.round(days / 365);

  const fmt = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  if (Math.abs(seconds) < 60) return fmt.format(-seconds, 'second');
  if (Math.abs(minutes) < 60) return fmt.format(-minutes, 'minute');
  if (Math.abs(hours) < 24) return fmt.format(-hours, 'hour');
  if (Math.abs(days) < 30) return fmt.format(-days, 'day');
  if (Math.abs(months) < 12) return fmt.format(-months, 'month');
  return fmt.format(-years, 'year');
}

async function fetchRepos() {
  const url = `https://api.github.com/users/${USER}/repos?type=owner&sort=pushed&per_page=30`;
  const r = await fetch(url, {
    headers: { Accept: 'application/vnd.github+json' }
  });
  if (!r.ok) throw new Error(`Repos API ${r.status}`);
  const data = await r.json();
  return data
    .filter((repo) => !repo.fork && !repo.archived)
    .slice(0, REPO_COUNT);
}

async function fetchRepoCommits(repo) {
  const pushedAt = new Date(repo.pushed_at);
  const since = new Date(pushedAt);
  since.setDate(since.getDate() - DAYS + 1);
  since.setHours(0, 0, 0, 0);

  let url = `https://api.github.com/repos/${repo.full_name}/commits?since=${encodeURIComponent(since.toISOString())}&until=${encodeURIComponent(pushedAt.toISOString())}&per_page=100`;

  const commits = [];
  while (url && commits.length < 500) {
    const r = await fetch(url, {
      headers: { Accept: 'application/vnd.github+json' }
    });
    if (!r.ok) throw new Error(`Commits API ${r.status} for ${repo.full_name}`);
    const page = await r.json();
    commits.push(...page);
    const link = r.headers.get('Link');
    const match = link && link.match(/<([^>]+)>;\s*rel="next"/);
    url = match ? match[1] : null;
  }

  const counts = {};
  for (const c of commits) {
    const iso = c.commit?.committer?.date || c.commit?.author?.date;
    if (!iso) continue;
    const key = dateKey(new Date(iso));
    counts[key] = (counts[key] || 0) + 1;
  }

  return {
    name: repo.name,
    fullName: repo.full_name,
    htmlUrl: repo.html_url,
    pushedAt: repo.pushed_at,
    counts
  };
}

function readCache() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.ts > CACHE_TTL_MS) return null;
    return parsed.repos;
  } catch {
    return null;
  }
}

function writeCache(repos) {
  try {
    sessionStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ ts: Date.now(), repos })
    );
  } catch {
    // sessionStorage can be unavailable; cache is a nice-to-have.
  }
}

export default function CommitGrid() {
  const [state, setState] = useState({ status: 'loading', repos: [] });

  useEffect(() => {
    const cached = readCache();
    if (cached) {
      setState({ status: 'ready', repos: cached });
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const repos = await fetchRepos();
        const results = await Promise.all(
          repos.map((repo) =>
            fetchRepoCommits(repo).catch(() => null)
          )
        );
        const filtered = results.filter(Boolean);
        if (cancelled) return;
        writeCache(filtered);
        setState({ status: 'ready', repos: filtered });
      } catch {
        if (cancelled) return;
        setState({ status: 'error', repos: [] });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const { status, repos } = state;
  const totalCommits = repos.reduce(
    (sum, r) => sum + Object.values(r.counts).reduce((a, b) => a + b, 0),
    0
  );

  const headerRight =
    status === 'ready'
      ? `${totalCommits} commit${totalCommits === 1 ? '' : 's'} across ${repos.length} repo${repos.length === 1 ? '' : 's'}`
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
          marginBottom: space.lg
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

      {status === 'ready' && repos.length === 0 && (
        <p
          style={{
            margin: 0,
            color: colors.textMuted,
            fontSize: fontSizes.sm
          }}
        >
          No public repos found.
        </p>
      )}

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: space.sm
        }}
      >
        {repos.map((repo) => (
          <Row key={repo.fullName} repo={repo} status={status} />
        ))}
      </div>

      <div
        style={{
          marginTop: space.lg,
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
        <span>{DAYS} days ending at each repo&apos;s last commit</span>
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
          href={`https://github.com/${USER}`}
          target="_blank"
          rel="noreferrer noopener"
          style={{
            color: colors.accent,
            textDecoration: 'none'
          }}
        >
          github.com/{USER} ↗
        </a>
      </div>

      <style>{`
        @media (max-width: 700px) {
          .commit-row {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 4px !important;
          }
          .commit-row-name,
          .commit-row-time {
            flex: 0 0 auto !important;
            width: auto !important;
          }
          .commit-row-cells {
            margin-left: 0 !important;
            width: 100% !important;
            grid-template-columns: repeat(${DAYS}, minmax(0, 1fr)) !important;
          }
        }
      `}</style>
    </div>
  );
}

function Row({ repo, status }) {
  const days = buildDays(new Date(repo.pushedAt), DAYS);
  const lastIdx = days.length - 1;
  const totalForRepo = Object.values(repo.counts).reduce(
    (a, b) => a + b,
    0
  );
  const rel = relativeTime(repo.pushedAt);

  return (
    <div
      className="commit-row"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: space.sm
      }}
    >
      <a
        href={repo.htmlUrl}
        target="_blank"
        rel="noreferrer noopener"
        className="commit-row-name"
        style={{
          flex: '0 0 160px',
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          color: colors.text,
          textDecoration: 'none',
          fontFamily: fonts.mono,
          fontSize: fontSizes.sm,
          fontWeight: fontWeights.medium
        }}
        title={`${repo.name} — ${totalForRepo} commit${totalForRepo === 1 ? '' : 's'} in window`}
      >
        {repo.name}
      </a>
      <span
        className="commit-row-time"
        style={{
          flex: '0 0 90px',
          minWidth: 0,
          color: colors.textMuted,
          fontFamily: fonts.mono,
          fontSize: fontSizes.xs,
          letterSpacing: '0.04em'
        }}
      >
        {rel}
      </span>
      <div
        className="commit-row-cells"
        style={{
          flex: '0 1 auto',
          minWidth: 0,
          marginLeft: 'auto',
          display: 'grid',
          gridTemplateColumns: `repeat(${DAYS}, minmax(0, 12px))`,
          gap: 3
        }}
      >
        {days.map((day, i) => {
          const count = repo.counts[day] || 0;
          const b = bucketOf(count);
          const fill = FILL[b];
          const isLast = i === lastIdx;
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
                aspectRatio: '1 / 1',
                borderRadius: 2,
                background: fill.bg,
                border: `1px solid ${fill.border}`,
                boxShadow:
                  isLast && count > 0
                    ? '0 0 8px rgba(94, 234, 212, 0.55)'
                    : 'none',
                display: 'block'
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
