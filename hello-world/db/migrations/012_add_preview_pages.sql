-- Private/unlisted preview pages. The super_admin uploads a self-contained
-- .html file or a .zip static-site bundle through the Admin Portal "Private
-- pages" console; each becomes a page served by the backend at
-- /preview/<slug>/. Pages are UNLISTED (never linked, never in the sitemap,
-- served with X-Robots-Tag: noindex) so a URL can be handed to a client
-- without exposing it site-wide. `locked = 1` gates a page behind a
-- super_admin session — non-owners get a 404, so a locked URL does not even
-- reveal that anything lives there.
--
-- Only metadata lives in MySQL; the actual files live on disk under
-- PREVIEW_ROOT (outside the deploy-replaced web root) so a redeploy never
-- wipes an uploaded preview. See backend/previews.js.
--
-- Guarded CREATE so the migration is safe to re-run (same pattern as
-- 011_add_blog_posts.sql).

SET @tbl_exists := (
  SELECT COUNT(*)
    FROM information_schema.TABLES
   WHERE TABLE_SCHEMA = DATABASE()
     AND TABLE_NAME = 'preview_pages'
);
SET @sql := IF(
  @tbl_exists = 0,
  'CREATE TABLE preview_pages (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(120) NOT NULL UNIQUE,
    title VARCHAR(300) NOT NULL,
    entry VARCHAR(255) NOT NULL DEFAULT ''index.html'',
    kind VARCHAR(16) NOT NULL DEFAULT ''html'',
    bytes BIGINT UNSIGNED NOT NULL DEFAULT 0,
    files INT UNSIGNED NOT NULL DEFAULT 1,
    locked TINYINT(1) NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci',
  'SELECT ''preview_pages table already exists, skipping'' AS info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
