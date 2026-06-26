// "Recent shipping" visualization for /about.
//
// Desktop (viewport ≥ 760): radial hex flower. Each repo is rendered as a
// pointy-top hexagon split into 24 triangular cells (6 inner + 18 outer).
// The 6 most recent days light up the inner core; the older 18 fill the
// outer ring clockwise from the top. Hexes are distributed evenly around
// a center point, with repo names + relative-time labels radiating outward
// and dashed connector lines tying each hex to its label.
//
// Hover a hex and it expands sideways into a horizontal 24-cell strip
// showing the linear timeline (crossfade between hex and strip views,
// 350ms). Click navigates to the repo on GitHub.
//
// Mobile (< 760): falls back to the previous strip-row layout — radial
// geometry doesn't shrink gracefully below ~700px wide.
//
// Data source: GitHub public commits API, anonymous. 1 list call + N
// per-repo commit calls per cold load. sessionStorage cache (1h TTL)
// covers within-session re-navigation.

import { useEffect, useState } from 'react';
import {
  colors,
  fonts,
  fontSizes,
  fontWeights,
  space
} from '../theme.js';
import HexCell, { FILL, bucketOf } from './HexCell.jsx';

const USER = 'penpro';
const REPO_COUNT = 8;
const DAYS = 24;
const CACHE_KEY = 'penumbra_commit_grid_v3';
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
          repos.map((repo) => fetchRepoCommits(repo).catch(() => null))
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

      {status === 'ready' && repos.length > 0 && (
        <>
          <div className="commit-flower-desktop">
            <HexFlower repos={repos} />
          </div>
          <div className="commit-strip-mobile">
            {repos.map((repo) => (
              <StripRow key={repo.fullName} repo={repo} status={status} />
            ))}
          </div>
        </>
      )}

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
        <span>{DAYS} days ending at each repo&apos;s last commit · hover to expand</span>
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
        .commit-flower-desktop { display: block; }
        .commit-strip-mobile { display: none; }
        @media (max-width: 760px) {
          .commit-flower-desktop { display: none; }
          .commit-strip-mobile {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
        }
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

// ---- Radial hex flower ----

function HexFlower({ repos }) {
  const N = repos.length;
  const W = 700;
  const H = 560;
  const cx = W / 2;
  const cy = H / 2;
  const layoutR = 175;
  const hexSize = 78;
  const labelOffset = 26;

  const positions = repos.map((_, i) => {
    const angle = -Math.PI / 2 + (2 * Math.PI * i) / N;
    const radial = layoutR + hexSize / 2;
    return {
      angle,
      hexX: cx + layoutR * Math.cos(angle),
      hexY: cy + layoutR * Math.sin(angle),
      labelX: cx + (radial + labelOffset) * Math.cos(angle),
      labelY: cy + (radial + labelOffset) * Math.sin(angle),
      lineStartX: cx + (radial - 1) * Math.cos(angle),
      lineStartY: cy + (radial - 1) * Math.sin(angle),
      lineEndX: cx + (radial + labelOffset - 4) * Math.cos(angle),
      lineEndY: cy + (radial + labelOffset - 4) * Math.sin(angle)
    };
  });

  return (
    <div
      style={{
        position: 'relative',
        width: W,
        height: H,
        margin: '0 auto',
        maxWidth: '100%'
      }}
    >
      <svg
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none'
        }}
        aria-hidden="true"
      >
        {positions.map((p, i) => (
          <line
            key={i}
            x1={p.lineStartX}
            y1={p.lineStartY}
            x2={p.lineEndX}
            y2={p.lineEndY}
            stroke="rgba(94, 234, 212, 0.30)"
            strokeWidth={0.6}
            strokeDasharray="2 3"
          />
        ))}
      </svg>

      {repos.map((repo, i) => {
        const p = positions[i];
        const cosA = Math.cos(p.angle);
        const align = cosA > 0.3 ? 'left' : cosA < -0.3 ? 'right' : 'center';
        const translateX =
          align === 'left' ? '0%' : align === 'right' ? '-100%' : '-50%';
        return (
          <div
            key={`label-${repo.fullName}`}
            style={{
              position: 'absolute',
              left: p.labelX,
              top: p.labelY,
              transform: `translate(${translateX}, -50%)`,
              maxWidth: 110,
              textAlign: align,
              pointerEvents: 'none',
              userSelect: 'none'
            }}
          >
            <div
              style={{
                fontFamily: fonts.mono,
                fontSize: fontSizes.xs,
                fontWeight: fontWeights.medium,
                color: colors.text,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
              title={repo.name}
            >
              {repo.name}
            </div>
            <div
              style={{
                fontFamily: fonts.mono,
                fontSize: 10,
                color: colors.textMuted,
                marginTop: 2,
                letterSpacing: '0.04em'
              }}
            >
              {relativeTime(repo.pushedAt)}
            </div>
          </div>
        );
      })}

      {repos.map((repo, i) => {
        const p = positions[i];
        return (
          <HexNode
            key={`hex-${repo.fullName}`}
            repo={repo}
            position={{ x: p.hexX, y: p.hexY }}
            hexSize={hexSize}
          />
        );
      })}
    </div>
  );
}

// ---- Single hex node with hover-expand-to-strip ----

function HexNode({ repo, position, hexSize }) {
  const [hovered, setHovered] = useState(false);
  const stripWidth = 280;
  const cardWidth = hovered ? stripWidth : hexSize;
  const days = buildDays(new Date(repo.pushedAt), DAYS);
  const fills = days.map((day) => FILL[bucketOf(repo.counts[day] || 0)]);
  const totalForRepo = Object.values(repo.counts).reduce((a, b) => a + b, 0);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => window.open(repo.htmlUrl, '_blank', 'noopener,noreferrer')}
      title={`${repo.name} — ${totalForRepo} commit${totalForRepo === 1 ? '' : 's'} in ${DAYS}-day window. Click for repo.`}
      style={{
        position: 'absolute',
        left: position.x - cardWidth / 2,
        top: position.y - hexSize / 2,
        width: cardWidth,
        height: hexSize,
        transition:
          'left 380ms cubic-bezier(0.4, 0, 0.2, 1), width 380ms cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        zIndex: hovered ? 20 : 5
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: hexSize,
          height: hexSize,
          opacity: hovered ? 0 : 1,
          transition: 'opacity 180ms',
          filter: hovered
            ? 'none'
            : 'drop-shadow(0 0 8px rgba(94, 234, 212, 0.18))'
        }}
      >
        <HexCell
          size={hexSize}
          fills={fills}
          ariaLabel={`${repo.name}: ${DAYS}-day activity hex, ${totalForRepo} commits`}
        />
      </div>

      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: hovered ? 1 : 0,
          pointerEvents: hovered ? 'auto' : 'none',
          transition: 'opacity 220ms 160ms',
          display: 'flex',
          alignItems: 'center',
          padding: '0 12px',
          background: 'rgba(13, 6, 38, 0.94)',
          border: `1px solid ${colors.borderAccent}`,
          borderRadius: 8,
          boxShadow: '0 0 24px rgba(94, 234, 212, 0.28)'
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${DAYS}, minmax(0, 1fr))`,
            gap: 2,
            width: '100%',
            height: 26
          }}
        >
          {fills.map((fill, idx) => (
            <span
              key={idx}
              style={{
                aspectRatio: '1 / 1',
                background: fill.bg,
                border: `1px solid ${fill.border}`,
                borderRadius: 1,
                display: 'block'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ---- Mobile-fallback strip row (same layout as the previous version) ----

function StripRow({ repo, status }) {
  const days = buildDays(new Date(repo.pushedAt), DAYS);
  const lastIdx = days.length - 1;
  const totalForRepo = Object.values(repo.counts).reduce((a, b) => a + b, 0);
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
          const fill = FILL[bucketOf(count)];
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
