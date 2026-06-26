// "Recent shipping" visualization for /about.
//
// Desktop (viewport ≥ 760): 6-hex honeycomb ring. Each repo is rendered
// as a flat-top hexagon split into 24 triangular cells; the 6 hexes
// arrange at 60° intervals around an empty center, touching at flat
// edges (true honeycomb tiling). Repo names + relative-time labels
// radiate outward from each hex with dashed connector lines.
//
// Hover a hex and the 24 triangles individually translate + rotate to
// target positions in a horizontal alternating-up/down strip — staggered
// 14ms per triangle so they appear to peel off sequentially. The card
// itself expands 78→280px wide to accommodate the unrolled strip. Click
// navigates to the repo on GitHub.
//
// Mobile (< 760): falls back to the previous strip-row layout. Honeycomb
// geometry doesn't shrink gracefully below the desktop breakpoint.
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
const REPO_COUNT = 6;
const DAYS = 24;
const CACHE_KEY = 'penumbra_commit_grid_v4';
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
        <span>{DAYS} days ending at each repo&apos;s last commit · hover to unroll</span>
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

        /* Hex card: 78x78 by default, expands to 280x78 on hover. Centered
           on its --cx/--cy CSS variables via the left calc. */
        .hex-card {
          position: absolute;
          width: 78px;
          height: 78px;
          z-index: 5;
          cursor: pointer;
          overflow: hidden;
          border-radius: 8px;
          left: calc(var(--cx) - 39px);
          top: calc(var(--cy) - 39px);
          transition: width 380ms cubic-bezier(0.4, 0, 0.2, 1),
                      left 380ms cubic-bezier(0.4, 0, 0.2, 1);
        }
        .hex-card:hover {
          width: 280px;
          left: calc(var(--cx) - 140px);
          z-index: 20;
        }

        /* Background panel that fades in behind the unrolled strip. */
        .hex-card-bg {
          position: absolute;
          inset: 0;
          background: rgba(13, 6, 38, 0.94);
          border: 1px solid rgba(94, 234, 212, 0.35);
          border-radius: 8px;
          box-shadow: 0 0 24px rgba(94, 234, 212, 0.28);
          opacity: 0;
          transition: opacity 280ms 60ms;
          pointer-events: none;
          box-sizing: border-box;
        }
        .hex-card:hover .hex-card-bg {
          opacity: 1;
        }

        /* SVG wrapper stays 280px wide always; centered in the card. When
           card is 78px wide, only the center 78px of the SVG is visible
           (the hex). When card expands to 280, the full strip is visible. */
        .hex-card-svg-wrap {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 280px;
          height: 78px;
          filter: drop-shadow(0 0 8px rgba(94, 234, 212, 0.18));
          transition: filter 180ms;
        }
        .hex-card:hover .hex-card-svg-wrap {
          filter: none;
        }

        /* Default path transform = identity. On hover, each path picks up
           its own --tx, --ty, --tr from inline style (set per-path in
           HexCell.jsx) and translates+rotates to its strip target. */
        .hex-card svg path {
          transform: translate(0px, 0px) rotate(0deg);
        }
        .hex-card:hover svg path {
          transform: translate(var(--tx), var(--ty)) rotate(var(--tr));
        }

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

// ---- 6-hex honeycomb ring ----

function HexFlower({ repos }) {
  const N = repos.length;
  if (N === 0) return null;

  const hexSize = 78;
  const R = hexSize / 2;
  const sqrt3 = Math.sqrt(3);
  const ringR = R * sqrt3; // 67.5 — touching distance for hexes at 60° intervals

  const W = 460;
  const H = 320;
  const cx = W / 2;
  const cy = H / 2;
  const labelOffset = 18;

  // 6 positions at 60° intervals starting from top (-π/2). For N < 6 we
  // just leave the trailing positions empty; for N > 6 (shouldn't happen
  // given REPO_COUNT=6) we'd slice.
  const layout = Array.from({ length: 6 }, (_, i) => {
    const angle = -Math.PI / 2 + (i * Math.PI) / 3;
    return {
      x: ringR * Math.cos(angle),
      y: ringR * Math.sin(angle),
      angle
    };
  });

  const positions = repos.slice(0, 6).map((_, i) => {
    const p = layout[i];
    const hexX = cx + p.x;
    const hexY = cy + p.y;
    const labelDist = R + labelOffset;
    return {
      angle: p.angle,
      hexX,
      hexY,
      labelX: hexX + labelDist * Math.cos(p.angle),
      labelY: hexY + labelDist * Math.sin(p.angle),
      lineStartX: hexX + (R - 1) * Math.cos(p.angle),
      lineStartY: hexY + (R - 1) * Math.sin(p.angle),
      lineEndX: hexX + (R + labelOffset - 4) * Math.cos(p.angle),
      lineEndY: hexY + (R + labelOffset - 4) * Math.sin(p.angle)
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

      {repos.slice(0, 6).map((repo, i) => {
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

      {repos.slice(0, 6).map((repo, i) => {
        const p = positions[i];
        return (
          <HexNode
            key={`hex-${repo.fullName}`}
            repo={repo}
            position={{ x: p.hexX, y: p.hexY }}
          />
        );
      })}
    </div>
  );
}

// ---- Single hex card. Hover behavior is pure CSS (no React state). ----

function HexNode({ repo, position }) {
  const days = buildDays(new Date(repo.pushedAt), DAYS);
  const fills = days.map((day) => FILL[bucketOf(repo.counts[day] || 0)]);
  const totalForRepo = Object.values(repo.counts).reduce((a, b) => a + b, 0);

  return (
    <div
      className="hex-card"
      style={{
        '--cx': `${position.x}px`,
        '--cy': `${position.y}px`
      }}
      onClick={() =>
        window.open(repo.htmlUrl, '_blank', 'noopener,noreferrer')
      }
      title={`${repo.name} — ${totalForRepo} commit${totalForRepo === 1 ? '' : 's'} in ${DAYS}-day window. Click for repo.`}
    >
      <div className="hex-card-bg" />
      <div className="hex-card-svg-wrap">
        <HexCell
          fills={fills}
          ariaLabel={`${repo.name}: ${DAYS}-day activity hex, ${totalForRepo} commits`}
        />
      </div>
    </div>
  );
}

// ---- Mobile-fallback strip row ----

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
