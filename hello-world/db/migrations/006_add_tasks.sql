-- Migration: add tasks table for the TaskTrackr mini app.
--
-- Categories are stored as free-text VARCHAR rather than a separate
-- table. The frontend sidebar derives the category list from DISTINCT
-- values across the user's own tasks, which keeps the schema simple
-- and avoids needing a separate "manage categories" UI.
--
-- due_date is DATE (not DATETIME) because a task is "due on a day",
-- not "due at 14:32:01 on a day".

USE hello_app;

CREATE TABLE IF NOT EXISTS tasks (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  title       VARCHAR(255) NOT NULL DEFAULT 'Untitled Task',
  description TEXT,
  due_date    DATE NULL,
  completed   BOOLEAN NOT NULL DEFAULT FALSE,
  category    VARCHAR(100) NOT NULL DEFAULT 'General',
  created_at  TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP
              ON UPDATE CURRENT_TIMESTAMP,
  KEY tasks_user_id (user_id),
  KEY tasks_user_completed (user_id, completed),
  KEY tasks_user_category (user_id, category),
  CONSTRAINT tasks_user_fk
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
