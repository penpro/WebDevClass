-- Migration: add a durable audit log for admin actions.
--
-- Every action taken through /api/admin/* gets a row here so there is a
-- permanent record of who did what and when, independent of PM2 log
-- rotation. The action column is a short verb (e.g. 'send_password_reset'),
-- and detail is a free-form JSON blob for context.

USE hello_app;

CREATE TABLE IF NOT EXISTS admin_actions (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  admin_id    INT NOT NULL,
  action      VARCHAR(100) NOT NULL,
  target_id   INT NULL,
  detail      JSON NULL,
  created_at  TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  KEY admin_actions_admin_id (admin_id),
  KEY admin_actions_created_at (created_at),
  CONSTRAINT admin_actions_admin_fk
    FOREIGN KEY (admin_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
