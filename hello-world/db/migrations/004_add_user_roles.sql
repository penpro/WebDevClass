-- Migration: add a role column to users for permission levels.
--
-- Values in use:
--   'user'  - default for every account; no special privileges
--   'admin' - access to /api/admin/* (user search, manual password resets)
--
-- VARCHAR rather than a boolean so additional roles can be introduced
-- later (moderator, support, etc.) without another schema change.
--
-- This migration intentionally does NOT promote any specific account to
-- admin. After running it, promote your own account on the server with:
--
--   sudo mysql hello_app -e "UPDATE users SET role='admin' WHERE email='your.email@example.com';"
--
-- The conditional ALTER keeps the migration safe to re-run against both
-- an existing database and a fresh one.

USE hello_app;

SET @missing_col := (
  SELECT COUNT(*) = 0 FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'users'
    AND column_name = 'role'
);
SET @sql := IF(@missing_col = 1,
  'ALTER TABLE users ADD COLUMN role VARCHAR(32) NOT NULL DEFAULT ''user'' AFTER email',
  'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
