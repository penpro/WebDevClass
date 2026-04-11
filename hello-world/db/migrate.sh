#!/usr/bin/env bash
#
# Apply database migrations from hello-world/db/migrations/.
#
# Designed to run on the EC2 server. Uses `sudo mysql` because that is how
# the rest of the project already talks to MySQL on the box. Tracks applied
# migrations in a schema_migrations table so it is safe to rerun any time.
#
# Usage:
#   ./hello-world/db/migrate.sh
#   ./hello-world/db/migrate.sh hello_app    # override database name
#
# Exit codes:
#   0  success (including "nothing new to apply")
#   1  a migration failed or the environment is wrong

set -euo pipefail

DB_NAME="${1:-hello_app}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MIGRATIONS_DIR="$SCRIPT_DIR/migrations"

if [ ! -d "$MIGRATIONS_DIR" ]; then
  echo "Migrations directory not found: $MIGRATIONS_DIR" >&2
  exit 1
fi

# Make sure mysql is installed and the database exists before doing anything.
if ! command -v mysql >/dev/null 2>&1; then
  echo "mysql client not found on PATH" >&2
  exit 1
fi

if ! sudo mysql -Nse "SHOW DATABASES LIKE '$DB_NAME';" | grep -q "$DB_NAME"; then
  echo "Database '$DB_NAME' does not exist. Run hello-world/init.sql first." >&2
  exit 1
fi

# Ensure the tracking table exists. This is the one piece of schema that
# cannot itself live in a numbered migration file.
sudo mysql "$DB_NAME" <<'SQL'
CREATE TABLE IF NOT EXISTS schema_migrations (
  filename    VARCHAR(255) NOT NULL PRIMARY KEY,
  applied_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
SQL

shopt -s nullglob
applied_count=0
skipped_count=0

for file in "$MIGRATIONS_DIR"/*.sql; do
  filename=$(basename "$file")

  already_applied=$(sudo mysql -Nse \
    "SELECT COUNT(*) FROM schema_migrations WHERE filename = '$filename';" \
    "$DB_NAME")

  if [ "$already_applied" -gt 0 ]; then
    echo "[skip]  $filename"
    skipped_count=$((skipped_count + 1))
    continue
  fi

  echo "[apply] $filename"
  sudo mysql "$DB_NAME" < "$file"
  sudo mysql "$DB_NAME" -e \
    "INSERT INTO schema_migrations (filename) VALUES ('$filename');"
  applied_count=$((applied_count + 1))
done

echo ""
echo "Applied $applied_count migration(s), skipped $skipped_count."
