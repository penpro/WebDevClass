-- Migration: reconcile users schema and make notes table official.
--
-- Brings the existing hello_app database (hand-bootstrapped during the
-- QuickNotes prototype) in line with what hello-world/backend/auth.js and
-- hello-world/backend/notes.js expect:
--
--   1. rename users.hashed_password -> users.password_hash
--      (historical naming from the earlier hand-written auth prototype)
--   2. add users.last_login_at so /api/auth/login can stamp sign-ins
--   3. declare the `notes` table in version control so fresh environments
--      get the same shape via ./hello-world/db/migrate.sh
--
-- Steps 1 and 2 are conditional so this migration is safe on both:
--   * the existing server where `users` has the old column and no
--     last_login_at column
--   * a fresh database where migration 001 already created the new shape

USE hello_app;

-- --- 1. users.password_hash ----------------------------------------------
SET @needs_rename := (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'users'
    AND column_name = 'hashed_password'
);
SET @sql := IF(@needs_rename > 0,
  'ALTER TABLE users CHANGE hashed_password password_hash VARCHAR(255) NOT NULL',
  'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- --- 2. users.last_login_at ----------------------------------------------
SET @missing_col := (
  SELECT COUNT(*) = 0 FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'users'
    AND column_name = 'last_login_at'
);
SET @sql := IF(@missing_col = 1,
  'ALTER TABLE users ADD COLUMN last_login_at DATETIME NULL AFTER created_at',
  'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- --- 3. notes table ------------------------------------------------------
-- On the existing server this table already exists (created by hand during
-- the prototype), so CREATE TABLE IF NOT EXISTS is a no-op there. For a
-- fresh install this makes sure the same shape is recreated.
CREATE TABLE IF NOT EXISTS notes (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  title       VARCHAR(255) NOT NULL DEFAULT 'Untitled Note',
  body        TEXT,
  created_at  TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP
              ON UPDATE CURRENT_TIMESTAMP,
  KEY notes_user_id (user_id),
  CONSTRAINT notes_user_fk
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
