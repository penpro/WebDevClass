-- 010_add_contacts.sql
--
-- Inbound contact-form submissions from the marketing site. Stored
-- structured so they can be batch-exported to JSON for downstream use
-- (planning, project management, AI-assisted triage).
--
-- Status column doubles as a lightweight workflow:
--   new        — just submitted, not yet read
--   read       — opened in the admin UI
--   responded  — I've replied to the sender
--   spam       — flagged as junk
--   archived   — handled and tucked away
--
-- The migration uses information_schema guards so it is safe to run on
-- an already-applied database; the runner also tracks applied filenames
-- in schema_migrations, but the guards make a manual re-run a no-op too.

SET @tbl_exists := (
  SELECT COUNT(*)
    FROM information_schema.TABLES
   WHERE TABLE_SCHEMA = DATABASE()
     AND TABLE_NAME = 'contacts'
);
SET @sql := IF(
  @tbl_exists = 0,
  'CREATE TABLE contacts (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(80) NOT NULL,
    email VARCHAR(120) NOT NULL,
    subject VARCHAR(120) NULL,
    message TEXT NOT NULL,
    source_url VARCHAR(500) NULL,
    ip_address VARCHAR(64) NULL,
    user_agent VARCHAR(500) NULL,
    status ENUM(''new'', ''read'', ''responded'', ''spam'', ''archived'') NOT NULL DEFAULT ''new'',
    admin_notes TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_email (email),
    INDEX idx_created_at (created_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci',
  'SELECT ''contacts table already exists, skipping'' AS info'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
