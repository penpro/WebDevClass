// Standard page-content wrapper. Caps width at the brand max and pads
// the inline edges so the content doesn't kiss the viewport on phones.
//
// Pass `narrow` for text-heavy pages (about, contact) that read better
// at ~780px than at the full 1180px.

import { layout, space } from '../theme.js';

export default function Container({
  children,
  narrow = false,
  style,
  ...rest
}) {
  return (
    <div
      style={{
        maxWidth: narrow ? layout.maxWidthNarrow : layout.maxWidth,
        margin: '0 auto',
        padding: `0 ${space.lg}`,
        boxSizing: 'border-box',
        ...style
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
