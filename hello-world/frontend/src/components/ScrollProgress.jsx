// Thin corona-accent bar at the very top of the viewport that fills
// left-to-right as the user scrolls the page. Universal — lives in
// Layout so it covers every route.
//
// Intentionally chunky (4px) so it actually registers as a visual
// element, not a hairline that visitors miss. Animated via rAF so
// the transform is GPU-composited and free of layout thrash.

import { useEffect, useState } from 'react';
import { colors } from '../theme.js';

export default function ScrollProgress() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - doc.clientHeight;
      const value = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
      setPct(value);
      frame = 0;
    };
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 4,
        zIndex: 100,
        background: 'rgba(94, 234, 212, 0.08)',
        pointerEvents: 'none'
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${pct}%`,
          background: `linear-gradient(90deg, ${colors.accent}, ${colors.cyan}, ${colors.magenta})`,
          boxShadow: `0 0 12px ${colors.accent}`,
          transition: 'width 80ms linear'
        }}
      />
    </div>
  );
}
