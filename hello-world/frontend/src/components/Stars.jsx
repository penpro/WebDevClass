// Twinkling starfield with sparkle "hero" stars that have cross-glints.
// Ported from the streaming overlay's stars.html and React-ified.
//
// Strategy:
//   * Render once on mount via useEffect — we don't want React to rerender
//     320 DOM nodes on every parent update. Cleanup on unmount.
//   * Each star is a sized absolutely-positioned div with a twinkle
//     animation cycle (random duration + delay).
//   * Hero stars are SVG sparkles with vertical+horizontal cross-glints
//     and a soft radial glow.
//
// Props:
//   density        — small-star count, default 240
//   heroDensity    — hero-star count, default 18
//   colorTint      — palette mix: 'corona' (cyan/mint) or 'mixed' (also magenta)
//   className/style — forwarded to the wrapper

import { useEffect, useRef } from 'react';

const HERO_ANCHORS_1920 = [
  [150, 250], [320, 180], [560, 120], [780, 220], [1100, 160],
  [1340, 240], [1560, 130], [1780, 280], [180, 480], [1820, 460],
  [120, 720], [1840, 740], [240, 920], [520, 970], [1380, 970],
  [1700, 920], [80, 380], [1860, 380], [430, 70], [1500, 80],
  [1880, 600], [60, 600], [380, 1010], [1240, 60], [1620, 1000],
  [680, 1020]
];

export default function Stars({
  density = 240,
  heroDensity = 18,
  colorTint = 'corona',
  className,
  style
}) {
  const ref = useRef(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const W = root.clientWidth || window.innerWidth;
    const H = root.clientHeight || window.innerHeight;

    // ---- small twinkling stars ----
    const frag = document.createDocumentFragment();
    for (let i = 0; i < density; i++) {
      const s = document.createElement('div');
      s.className = 'penumbra-star';
      const r = Math.random();
      let sz;
      if (r > 0.97) sz = 3.5;
      else if (r > 0.88) sz = 2.5;
      else if (r > 0.65) sz = 1.5;
      else sz = 1;

      const tint = Math.random();
      let background = '#ffffff';
      let glow = '';
      if (colorTint === 'mixed' && tint > 0.92) {
        background = '#e9d5ff';
        if (sz >= 2) glow = `0 0 ${sz * 3}px #c084fc`;
      } else if (tint > 0.7) {
        background = '#a7f3d0';
        if (sz >= 2) glow = `0 0 ${sz * 3}px #5eead4`;
      } else if (tint > 0.55 && colorTint !== 'mixed') {
        background = '#67e8f9';
        if (sz >= 2) glow = `0 0 ${sz * 3}px #22d3ee`;
      } else if (sz >= 2) {
        glow = `0 0 ${sz * 3}px rgba(255,255,255,0.9)`;
      }

      Object.assign(s.style, {
        width: `${sz}px`,
        height: `${sz}px`,
        left: `${Math.random() * W}px`,
        top: `${Math.random() * H}px`,
        background,
        boxShadow: glow,
        position: 'absolute',
        borderRadius: '50%',
        opacity: (0.3 + Math.random() * 0.5).toFixed(2),
        animation: `penumbra-twinkle ${(2.5 + Math.random() * 4).toFixed(2)}s ease-in-out ${(Math.random() * 5).toFixed(2)}s infinite`
      });
      frag.appendChild(s);
    }

    // ---- hero stars (cross-glints) ----
    const SX = W / 1920;
    const SY = H / 1080;
    const anchorCount = Math.min(heroDensity, HERO_ANCHORS_1920.length);
    for (let i = 0; i < anchorCount; i++) {
      const [ax, ay] = HERO_ANCHORS_1920[i];
      const tint = Math.random();
      let color = '#ffffff';
      if (colorTint === 'mixed' && tint > 0.65) color = '#e9d5ff';
      else if (tint > 0.55) color = '#a7f3d0';
      else if (tint > 0.3) color = '#67e8f9';

      const roll = Math.random();
      const size = roll > 0.85 ? 26 + Math.random() * 10 : roll > 0.5 ? 16 + Math.random() * 8 : 10 + Math.random() * 5;
      const wrap = document.createElement('div');
      wrap.className = 'penumbra-hero-star';
      Object.assign(wrap.style, {
        position: 'absolute',
        left: `${ax * SX - size / 2}px`,
        top: `${ay * SY - size / 2}px`,
        width: `${size}px`,
        height: `${size}px`,
        pointerEvents: 'none',
        animation: `penumbra-twinkle-hero ${(3 + Math.random() * 3.5).toFixed(2)}s ease-in-out ${(Math.random() * 3).toFixed(2)}s infinite`
      });
      const uid = Math.random().toString(36).slice(2, 8);
      wrap.innerHTML = `
        <svg viewBox="-15 -15 30 30" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="g-${uid}" cx="0" cy="0" r="0.5">
              <stop offset="0%" stop-color="${color}" stop-opacity="1"/>
              <stop offset="45%" stop-color="${color}" stop-opacity="0.45"/>
              <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
            </radialGradient>
            <linearGradient id="h-${uid}" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stop-color="${color}" stop-opacity="0"/>
              <stop offset="50%" stop-color="${color}" stop-opacity="0.85"/>
              <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
            </linearGradient>
            <linearGradient id="v-${uid}" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stop-color="${color}" stop-opacity="0"/>
              <stop offset="50%" stop-color="${color}" stop-opacity="0.85"/>
              <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
            </linearGradient>
          </defs>
          <rect x="-15" y="-0.35" width="30" height="0.7" fill="url(#h-${uid})"/>
          <rect x="-0.35" y="-15" width="0.7" height="30" fill="url(#v-${uid})"/>
          <circle r="2.5" fill="url(#g-${uid})"/>
          <circle r="0.9" fill="${color}"/>
        </svg>
      `;
      frag.appendChild(wrap);
    }

    root.appendChild(frag);
    return () => {
      while (root.firstChild) root.removeChild(root.firstChild);
    };
  }, [density, heroDensity, colorTint]);

  return (
    <>
      <style>{`
        @keyframes penumbra-twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50%      { opacity: 1;   transform: scale(1.25); }
        }
        @keyframes penumbra-twinkle-hero {
          0%, 100% { opacity: 0.35; transform: scale(0.75); }
          50%      { opacity: 1;    transform: scale(1.15); }
        }
      `}</style>
      <div
        ref={ref}
        aria-hidden="true"
        className={className}
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
          ...style
        }}
      />
    </>
  );
}
