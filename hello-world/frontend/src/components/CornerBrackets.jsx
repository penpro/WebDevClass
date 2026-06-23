// L-shaped corner brackets — the HUD chrome framing element from the
// streaming overlay's corners.html, applied here to section heroes and
// other framed regions on the website.
//
// Usage:
//   <section style={{ position: 'relative' }}>
//     <CornerBrackets />
//     ...content...
//   </section>
//
// Renders four absolute-positioned divs at the corners of the parent.
// Parent must be `position: relative`. Size and inset are tunable.

import { colors } from '../theme.js';

export default function CornerBrackets({
  size = 28,
  inset = 24,
  thickness = 1.5,
  color = colors.accentBorder,
  style
}) {
  const common = {
    position: 'absolute',
    width: `${size}px`,
    height: `${size}px`,
    borderColor: color,
    borderStyle: 'solid',
    borderWidth: 0,
    pointerEvents: 'none'
  };
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        ...style
      }}
    >
      <div
        style={{
          ...common,
          top: inset,
          left: inset,
          borderTopWidth: thickness,
          borderLeftWidth: thickness
        }}
      />
      <div
        style={{
          ...common,
          top: inset,
          right: inset,
          borderTopWidth: thickness,
          borderRightWidth: thickness
        }}
      />
      <div
        style={{
          ...common,
          bottom: inset,
          left: inset,
          borderBottomWidth: thickness,
          borderLeftWidth: thickness
        }}
      />
      <div
        style={{
          ...common,
          bottom: inset,
          right: inset,
          borderBottomWidth: thickness,
          borderRightWidth: thickness
        }}
      />
    </div>
  );
}
