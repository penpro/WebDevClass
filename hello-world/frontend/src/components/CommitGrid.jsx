// Thin wrapper around the standalone hex-commit-grid package
// (https://github.com/penpro/hex-commit-grid). The original local
// CommitGrid + HexCell.jsx were extracted into that package so the
// component has one source of truth — bug fixes and feature work
// ship by bumping the dependency, not by editing two places.
//
// The package's .hcg-flower hides itself below 760px viewport (radial
// honeycomb geometry doesn't shrink gracefully). On mobile the
// surrounding Card on About.jsx (id="shipping") therefore renders an
// empty padded surface. Acceptable for now; if it ever feels broken
// we can either (a) hide #shipping entirely on mobile via a media
// query, or (b) add a mobile fallback to the package and re-render.

import 'hex-commit-grid/styles.css';
import { HexCommitGrid } from 'hex-commit-grid';

export default function CommitGrid() {
  return <HexCommitGrid username="penpro" defaultPalette="corona" />;
}
