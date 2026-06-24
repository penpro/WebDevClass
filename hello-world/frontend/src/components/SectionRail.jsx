// Fixed-position, left-edge, numbered section nav. The 3verse-inspired
// pattern but bigger so it actually registers — 200px wide, mono ~0.9rem,
// generous line-height, active section highlighted with the corona
// accent color plus a left-edge bar. Hidden below 1100px viewport
// because there's no room.
//
// Pages opt in by passing a `sections` array. Each entry needs:
//   id     — the DOM id of the <section> on the page
//   num    — short numeric label rendered before the title ("00")
//   label  — the display name in the rail
//
// The page must also put matching id="..." attributes on the actual
// <section> elements, otherwise the IntersectionObserver has nothing to
// observe and the active-section highlight stays stuck on the first
// entry.

import { useEffect, useState } from 'react';
import { colors, fonts, fontSizes, fontWeights, space } from '../theme.js';

export default function SectionRail({ sections }) {
  const [active, setActive] = useState(sections[0]?.id);

  useEffect(() => {
    if (!sections.length) return undefined;

    // Anchor on the middle 30% of the viewport: a section counts as
    // "active" when it crosses into the central reading band. Avoids
    // the thrashy "this section is technically intersecting by 1px"
    // behavior that makes the rail flip on every scroll tick.
    const observer = new IntersectionObserver(
      (entries) => {
        // Multiple sections can be intersecting at once; pick the one
        // closest to the centre of the viewport.
        let best = null;
        let bestDistance = Infinity;
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const rect = entry.boundingClientRect;
          const centre = rect.top + rect.height / 2;
          const distance = Math.abs(centre - window.innerHeight / 2);
          if (distance < bestDistance) {
            bestDistance = distance;
            best = entry.target.id;
          }
        });
        if (best) setActive(best);
      },
      {
        rootMargin: '-35% 0px -35% 0px',
        threshold: [0, 0.25, 0.5, 0.75, 1]
      }
    );

    const elements = [];
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) {
        observer.observe(el);
        elements.push(el);
      }
    });

    return () => observer.disconnect();
  }, [sections]);

  function handleClick(e, id) {
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    setActive(id);
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // Reflect the anchor in the URL without jumping the page.
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, '', `#${id}`);
    }
  }

  return (
    <nav
      className="penumbra-section-rail"
      aria-label="On this page"
      style={{
        position: 'fixed',
        left: 24,
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 30,
        width: 220,
        pointerEvents: 'auto'
      }}
    >
      <div
        style={{
          fontFamily: fonts.mono,
          fontSize: fontSizes.xs,
          color: colors.cyan,
          textTransform: 'uppercase',
          letterSpacing: '0.14em',
          marginBottom: space.md,
          paddingLeft: space.sm
        }}
      >
        On this page
      </div>
      <ol
        style={{
          listStyle: 'none',
          margin: 0,
          padding: 0,
          fontFamily: fonts.mono,
          fontSize: '0.88rem',
          lineHeight: 1.4
        }}
      >
        {sections.map((s) => {
          const isActive = s.id === active;
          return (
            <li key={s.id} style={{ position: 'relative', marginBottom: space.xs }}>
              {/* Active-state left bar — accent color, 3px wide, sits
                  in the gutter so its presence/absence is the
                  scannable signal even before color reads. */}
              <span
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 6,
                  bottom: 6,
                  width: 3,
                  background: isActive ? colors.accent : 'transparent',
                  borderRadius: 2,
                  transition: 'background 220ms ease'
                }}
              />
              <a
                href={`#${s.id}`}
                onClick={(e) => handleClick(e, s.id)}
                style={{
                  display: 'block',
                  padding: `${space.xs} ${space.sm} ${space.xs} ${space.md}`,
                  textDecoration: 'none',
                  color: isActive ? colors.text : colors.textMuted,
                  letterSpacing: '0.04em',
                  fontWeight: isActive ? fontWeights.semibold : fontWeights.regular,
                  transition: 'color 220ms ease, transform 220ms ease',
                  transform: isActive ? 'translateX(2px)' : 'translateX(0)',
                  borderRadius: 4
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.color = colors.textSecondary;
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.color = colors.textMuted;
                }}
              >
                <span
                  style={{
                    color: isActive ? colors.accent : colors.textMuted,
                    marginRight: '0.6em',
                    fontVariantNumeric: 'tabular-nums'
                  }}
                >
                  {s.num}
                </span>
                {s.label}
              </a>
            </li>
          );
        })}
      </ol>
      {/* Hide on narrow viewports where there's no room beside the
          centered container. 1180px container + 220px rail + 24px gap
          + a little breathing room ≈ 1450px minimum to look natural;
          we drop earlier at 1180px since the rail is genuinely helpful
          and most reading happens above that anyway. */}
      <style>{`
        @media (max-width: 1180px) {
          .penumbra-section-rail { display: none !important; }
        }
      `}</style>
    </nav>
  );
}
