-- Migration: introduce the super_admin / admin / premium / user role
-- hierarchy and rename task_updates.image_* columns to media_* now that
-- they will hold video as well as image bytes.
--
-- All steps are conditional so the migration is safe on both an
-- existing database and a fresh one.

USE hello_app;

-- ===========================================================================
-- 1. task_updates.image_filename → media_filename
-- ===========================================================================
SET @needs_rename := (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'task_updates'
    AND column_name = 'image_filename'
);
SET @sql := IF(@needs_rename > 0,
  'ALTER TABLE task_updates CHANGE image_filename media_filename VARCHAR(255) NULL',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ===========================================================================
-- 2. task_updates.image_mime → media_mime
-- ===========================================================================
SET @needs_rename := (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'task_updates'
    AND column_name = 'image_mime'
);
SET @sql := IF(@needs_rename > 0,
  'ALTER TABLE task_updates CHANGE image_mime media_mime VARCHAR(100) NULL',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ===========================================================================
-- 3. Promote the existing site admin to super_admin (idempotent).
-- ===========================================================================
-- This UPDATE is safe on fresh databases because the WHERE clause matches
-- nothing (the user table is empty until someone registers). On the existing
-- production database it elevates the original admin so they can hand out
-- admin / premium roles to others. Other promotions go through the new
-- /api/admin/users/:id/role endpoint, not through migrations.
UPDATE users SET role = 'super_admin'
WHERE email = 'wesleyaweaverjr@gmail.com'
  AND role IN ('admin', 'user');
