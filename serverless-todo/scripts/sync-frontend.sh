#!/usr/bin/env bash
#
# Build the React frontend and sync the dist/ folder to your S3 bucket.
# Set the bucket name via BUCKET env var or as the first argument.
#
# Usage:
#   BUCKET=serverless-todo-frontend-yourname ./scripts/sync-frontend.sh
#   ./scripts/sync-frontend.sh serverless-todo-frontend-yourname
#
# Requires:
#   * aws CLI installed and configured (aws configure)
#   * AWS credentials with s3:PutObject + s3:DeleteObject + s3:ListBucket
#     permissions on the bucket
#   * VITE_API_URL set in serverless-todo/frontend/.env.production

set -euo pipefail

BUCKET="${1:-${BUCKET:-}}"
if [[ -z "$BUCKET" ]]; then
  echo "Usage: $0 <s3-bucket-name>"
  echo "   or: BUCKET=my-bucket-name $0"
  exit 1
fi

SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
FRONTEND_DIR="$SCRIPT_DIR/../frontend"

if [[ ! -d "$FRONTEND_DIR" ]]; then
  echo "Frontend dir not found at $FRONTEND_DIR" >&2
  exit 1
fi

cd "$FRONTEND_DIR"

if [[ ! -f .env.production ]]; then
  echo "Missing .env.production with VITE_API_URL set." >&2
  echo "Copy .env.example to .env.production and fill in your invoke URL." >&2
  exit 1
fi

echo "==> npm install"
npm install --silent

echo "==> npm run build"
npm run build

echo "==> aws s3 sync dist/ to s3://$BUCKET/"
aws s3 sync dist/ "s3://$BUCKET/" --delete

echo "==> Done. If your bucket has static-website hosting enabled, the"
echo "    site is at the website endpoint shown in the S3 console under"
echo "    Properties -> Static website hosting."
