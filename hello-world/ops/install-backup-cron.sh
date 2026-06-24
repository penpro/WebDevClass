#!/usr/bin/env bash
set -euo pipefail

# Installs a daily cron entry that runs backup-db.sh at 3am local time.
# Idempotent: re-running replaces the existing entry rather than
# stacking duplicates.

echo "==> Installing penumbra-backup cron entry"

REPO_ROOT="${REPO_ROOT:-$HOME/WebDevClass}"
BACKUP_SCRIPT="$REPO_ROOT/hello-world/ops/backup-db.sh"
LOG_FILE="${LOG_FILE:-/var/log/penumbra-backup.log}"

if [ ! -x "$BACKUP_SCRIPT" ]; then
  chmod +x "$BACKUP_SCRIPT"
fi

# Make sure the log file exists and is writable by the user who runs cron.
sudo touch "$LOG_FILE"
sudo chown "$USER:$USER" "$LOG_FILE"

# Build the new crontab content. The `|| true` guards keep the script
# from aborting under `set -euo pipefail` when there's no existing
# crontab (crontab -l exits 1) or when grep finds no matches.
EXISTING="$(crontab -l 2>/dev/null || true)"
FILTERED="$(printf '%s\n' "$EXISTING" | grep -v 'penumbra-backup' || true)"
CRON_LINE="0 3 * * * $BACKUP_SCRIPT >> $LOG_FILE 2>&1 # penumbra-backup"

# Reassemble: filtered existing lines first, then our new line. Empty
# leading newline from a previously-empty crontab is harmless.
{
  printf '%s\n' "$FILTERED"
  printf '%s\n' "$CRON_LINE"
} | crontab -

echo ""
echo "Installed cron entry:"
crontab -l | grep penumbra-backup
echo ""
echo "Logs will accumulate at: $LOG_FILE"
echo "Tail with: tail -f $LOG_FILE"
