#!/usr/bin/env bash
set -euo pipefail

# Nightly MySQL dump for the hello_app database.
#
# Sources DB credentials from hello-world/backend/.env so this script
# stays in sync with whatever the live backend is using. Writes a
# gzipped dump named with the date to $BACKUP_DIR, then prunes anything
# older than $RETENTION_DAYS so the disk doesn't slowly fill.
#
# Wire to cron (see install-backup-cron.sh):
#   0 3 * * * /home/ubuntu/WebDevClass/hello-world/ops/backup-db.sh
#
# Restore a single dump with:
#   gunzip < /backups/hello_app_2026-06-24.sql.gz | mysql -u hello_user -p hello_app

REPO_ROOT="${REPO_ROOT:-$HOME/WebDevClass}"
ENV_FILE="$REPO_ROOT/hello-world/backend/.env"
BACKUP_DIR="${BACKUP_DIR:-/backups}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"

if [ ! -f "$ENV_FILE" ]; then
  echo "FATAL: .env not found at $ENV_FILE" >&2
  exit 1
fi

# Pull only the four DB vars from .env (avoid sourcing the whole file
# in case there are shell-unsafe characters in other entries).
DB_HOST="$(grep -E '^DB_HOST='     "$ENV_FILE" | head -1 | cut -d'=' -f2-)"
DB_USER="$(grep -E '^DB_USER='     "$ENV_FILE" | head -1 | cut -d'=' -f2-)"
DB_PASSWORD="$(grep -E '^DB_PASSWORD=' "$ENV_FILE" | head -1 | cut -d'=' -f2-)"
DB_NAME="$(grep -E '^DB_NAME='     "$ENV_FILE" | head -1 | cut -d'=' -f2-)"

if [ -z "${DB_HOST:-}" ] || [ -z "${DB_USER:-}" ] || [ -z "${DB_PASSWORD:-}" ] || [ -z "${DB_NAME:-}" ]; then
  echo "FATAL: one or more of DB_HOST/DB_USER/DB_PASSWORD/DB_NAME missing from $ENV_FILE" >&2
  exit 1
fi

# Use $(id -un) rather than $USER — cron doesn't populate $USER, and
# the script's `set -u` would kill us before mkdir under cron context.
RUN_AS="$(id -un)"
sudo mkdir -p "$BACKUP_DIR"
sudo chown "$RUN_AS:$RUN_AS" "$BACKUP_DIR"

STAMP="$(date +%F)"
OUT="$BACKUP_DIR/hello_app_${STAMP}.sql.gz"
TMP_CNF="$(mktemp)"
trap 'rm -f "$TMP_CNF"' EXIT

# Stash credentials in a 600-perm temp file so they never appear in the
# process list (mysqldump -p<pw> would leak via ps).
cat >"$TMP_CNF" <<EOF
[client]
host=$DB_HOST
user=$DB_USER
password=$DB_PASSWORD
EOF
chmod 600 "$TMP_CNF"

echo "[$(date -Iseconds)] dumping $DB_NAME -> $OUT"
mysqldump \
  --defaults-extra-file="$TMP_CNF" \
  --single-transaction \
  --quick \
  --routines \
  --triggers \
  --skip-lock-tables \
  --set-gtid-purged=OFF \
  --no-tablespaces \
  "$DB_NAME" \
  | gzip -c > "$OUT"

# Sanity: gzipped dump should be > a few KB. Empty / tiny means the
# dump silently produced nothing useful.
SIZE=$(stat -c %s "$OUT")
if [ "$SIZE" -lt 1024 ]; then
  echo "FATAL: dump file is suspiciously small ($SIZE bytes) — aborting" >&2
  rm -f "$OUT"
  exit 1
fi

echo "[$(date -Iseconds)] wrote ${SIZE} bytes, pruning files older than ${RETENTION_DAYS}d"
find "$BACKUP_DIR" -maxdepth 1 -name 'hello_app_*.sql.gz' -mtime "+$RETENTION_DAYS" -print -delete

echo "[$(date -Iseconds)] OK"
