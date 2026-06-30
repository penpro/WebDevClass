#!/usr/bin/env bash
set -euo pipefail

# Installs two daily cron entries that purge CrashReportClient bundles
# older than 30 days and prune the empty subdirectories left behind.
# Idempotent: re-running replaces the existing entries (matched by the
# `# penumbra-crash-cleanup` marker comment) instead of stacking
# duplicates.

echo "==> Installing penumbra-crash-cleanup cron entries"

CRASH_DIR="${CRASH_DIR:-$HOME/crash-dumps}"
LOG_FILE="${LOG_FILE:-/var/log/penumbra-crash-cleanup.log}"

# Make sure the log file exists and is writable by the user who runs cron.
sudo touch "$LOG_FILE"
sudo chown "$USER:$USER" "$LOG_FILE"

# Read the existing crontab, strip any prior crash-cleanup entries, then
# reassemble with our two new lines on the end. The `|| true` guards keep
# the script from aborting under `set -euo pipefail` when there's no
# existing crontab (crontab -l exits 1) or when grep finds no matches.
EXISTING="$(crontab -l 2>/dev/null || true)"
FILTERED="$(printf '%s\n' "$EXISTING" | grep -v 'penumbra-crash-cleanup' || true)"

# 03:00 — delete every regular file older than 30 days. Crash bundles
# are .bin (raw body) and .json (sidecar metadata); both fall under
# this rule.
PURGE_LINE="0 3 * * * find $CRASH_DIR -type f -mtime +30 -delete >> $LOG_FILE 2>&1 # penumbra-crash-cleanup-purge"
# 03:05 — prune any subdirectories the purge left empty (e.g. an
# entire {AppVersion}/{date}/ subtree once all its files have aged
# out). mindepth 1 protects CRASH_DIR itself from being removed.
PRUNE_LINE="5 3 * * * find $CRASH_DIR -mindepth 1 -type d -empty -delete >> $LOG_FILE 2>&1 # penumbra-crash-cleanup-prune"

{
  printf '%s\n' "$FILTERED"
  printf '%s\n' "$PURGE_LINE"
  printf '%s\n' "$PRUNE_LINE"
} | crontab -

echo ""
echo "Installed cron entries:"
crontab -l | grep penumbra-crash-cleanup
echo ""
echo "Logs will accumulate at: $LOG_FILE"
echo "Tail with: tail -f $LOG_FILE"
