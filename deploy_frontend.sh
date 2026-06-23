#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   ./deploy_frontend.sh
#   ./deploy_frontend.sh /home/ubuntu/WebDevClass
#   ./deploy_frontend.sh /home/ubuntu/WebDevClass /var/www/hello-app
#
# Default repo root:
#   $HOME/WebDevClass
# Default frontend path:
#   <repo_root>/hello-world/frontend
# Default nginx web root:
#   /var/www/hello-app

REPO_ROOT="${1:-$HOME/WebDevClass}"
WEB_ROOT="${2:-/var/www/hello-app}"
FRONTEND_DIR="$REPO_ROOT/hello-world/frontend"

if [ ! -d "$FRONTEND_DIR" ]; then
  echo "Frontend directory not found: $FRONTEND_DIR" >&2
  exit 1
fi

if [ ! -f "$FRONTEND_DIR/package.json" ]; then
  echo "package.json not found in: $FRONTEND_DIR" >&2
  exit 1
fi

cd "$FRONTEND_DIR"

echo "==> Frontend directory: $FRONTEND_DIR"

# Sync the live ToC tool from its upstream repo so the case-study page
# always serves the latest review questions/fixes. Two files in
# public/toc/ are intentionally NOT overwritten because they carry
# Penumbra-Tech-specific customizations:
#   * index.html — data-theme="dark" + brand strip linking back to
#     /projects/theory-of-computation
#   * css/styles.css — corona-palette override of [data-theme="dark"]
#     plus the .pt-strip rules for the brand strip
# If upstream materially changes either file (new components, layout
# overhaul), merge by hand. Everything else (js/, tools/, vendor/,
# data) syncs through automatically.
echo "==> Syncing ToC tool from upstream"
TOC_SRC="${TOC_SRC:-$HOME/toc-source}"
TOC_REPO="${TOC_REPO:-https://github.com/penpro/theory-of-computation-review.git}"
TOC_DEST="$FRONTEND_DIR/public/toc"

if [ -d "$TOC_SRC/.git" ]; then
  git -C "$TOC_SRC" fetch --quiet origin
  git -C "$TOC_SRC" reset --hard --quiet origin/HEAD
else
  git clone --depth 1 --quiet "$TOC_REPO" "$TOC_SRC"
fi

rsync -a \
  --exclude='.git' \
  --exclude='index.html' \
  --exclude='css/styles.css' \
  "$TOC_SRC/" "$TOC_DEST/"

echo "==> Installing frontend dependencies if needed"
npm install

echo "==> Building frontend"
npm run build

if [ ! -d "$FRONTEND_DIR/dist" ]; then
  echo "Build failed: dist directory was not created" >&2
  exit 1
fi

echo "==> Preparing Nginx web root: $WEB_ROOT"
sudo mkdir -p "$WEB_ROOT"
sudo rm -rf "$WEB_ROOT"/*
sudo cp -r "$FRONTEND_DIR"/dist/* "$WEB_ROOT"/

echo "==> Reloading Nginx"
sudo nginx -t
sudo systemctl reload nginx

echo "==> Frontend deployed successfully"
echo "Open: http://<your-public-ip>"
