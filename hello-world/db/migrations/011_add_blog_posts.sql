-- Blog posts. Authored by the super_admin through the Admin Portal blog
-- console (markdown in, everything else derived). The raw markdown is the
-- canonical content; HTML is rendered at request time by the backend so a
-- markdown-renderer upgrade never requires a data migration.
--
-- Guarded CREATE so the migration is safe to run against a database where
-- the table already exists (same pattern as 010_add_contacts.sql).

SET @tbl_exists := (
  SELECT COUNT(*)
    FROM information_schema.TABLES
   WHERE TABLE_SCHEMA = DATABASE()
     AND TABLE_NAME = 'blog_posts'
);
SET @sql := IF(
  @tbl_exists = 0,
  'CREATE TABLE blog_posts (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(120) NOT NULL UNIQUE,
    title VARCHAR(300) NOT NULL,
    description VARCHAR(500) NOT NULL,
    markdown MEDIUMTEXT NOT NULL,
    published TINYINT(1) NOT NULL DEFAULT 1,
    published_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_published (published, published_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci',
  'SELECT ''blog_posts table already exists, skipping'' AS info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
