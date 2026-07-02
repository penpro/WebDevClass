#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   ./deploy_backend.sh
#   ./deploy_backend.sh /home/ubuntu/WebDevClass
#
# Assumes `git pull` has already been run in the repo. Installs backend
# dependencies, then starts or restarts the "hello-backend" PM2 process.
# Safe to re-run: npm install is idempotent and pm2 restart picks up new
# code and new environment values.

REPO_ROOT="${1:-$HOME/WebDevClass}"
BACKEND_DIR="$REPO_ROOT/hello-world/backend"
PM2_NAME="hello-backend"

if [ ! -d "$BACKEND_DIR" ]; then
  echo "Backend directory not found: $BACKEND_DIR" >&2
  exit 1
fi

if [ ! -f "$BACKEND_DIR/package.json" ]; then
  echo "package.json not found in: $BACKEND_DIR" >&2
  exit 1
fi

if [ ! -f "$BACKEND_DIR/.env" ]; then
  echo "WARNING: $BACKEND_DIR/.env does not exist."
  echo "         Copy .env.example to .env and fill it in before the backend"
  echo "         can talk to MySQL or sign session cookies."
fi

# Re-assert owner-only perms on .env every deploy. Cheap insurance in
# case it ever gets restored from a backup or recreated with looser
# perms; chmod is idempotent so this is free when it's already correct.
[ -f "$BACKEND_DIR/.env" ] && chmod 600 "$BACKEND_DIR/.env"

# Install the share-card fonts where fontconfig (used by sharp/librsvg
# for the blog og.png renderer) can find them. Idempotent: cp -u only
# copies when the source is newer.
if compgen -G "$BACKEND_DIR/assets/fonts/*.ttf" > /dev/null; then
  mkdir -p "$HOME/.fonts"
  cp -u "$BACKEND_DIR"/assets/fonts/*.ttf "$HOME/.fonts/"
  command -v fc-cache >/dev/null 2>&1 && fc-cache -f >/dev/null 2>&1 || true
fi

cd "$BACKEND_DIR"

echo "==> Backend directory: $BACKEND_DIR"
echo "==> Installing backend dependencies"
npm install --omit=dev

if pm2 describe "$PM2_NAME" >/dev/null 2>&1; then
  echo "==> Restarting PM2 process: $PM2_NAME"
  pm2 restart "$PM2_NAME" --update-env
else
  echo "==> Starting new PM2 process: $PM2_NAME"
  pm2 start server.js --name "$PM2_NAME" --update-env
  pm2 save
fi

echo ""
echo "==> Backend deployed successfully"
pm2 status "$PM2_NAME" || true
