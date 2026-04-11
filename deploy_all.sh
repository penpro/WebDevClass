#!/usr/bin/env bash
set -euo pipefail

# One-shot deploy: pull latest code, apply any new DB migrations, install
# + restart the backend, rebuild + redeploy the frontend. Run this on the
# EC2 server after pushing changes from your local machine.
#
# Usage:
#   ./deploy_all.sh
#   ./deploy_all.sh /home/ubuntu/WebDevClass
#
# Individual steps live in:
#   hello-world/db/migrate.sh
#   deploy_backend.sh
#   deploy_frontend.sh
# Run any of them on their own if you only need one piece.

REPO_ROOT="${1:-$HOME/WebDevClass}"

if [ ! -d "$REPO_ROOT/.git" ]; then
  echo "Repo root does not look like a git checkout: $REPO_ROOT" >&2
  exit 1
fi

cd "$REPO_ROOT"

echo "==> git pull"
git pull --ff-only

echo ""
echo "==> Applying database migrations"
"$REPO_ROOT/hello-world/db/migrate.sh"

echo ""
echo "==> Deploying backend"
"$REPO_ROOT/deploy_backend.sh" "$REPO_ROOT"

echo ""
echo "==> Deploying frontend"
"$REPO_ROOT/deploy_frontend.sh" "$REPO_ROOT"

echo ""
echo "==> All done."
