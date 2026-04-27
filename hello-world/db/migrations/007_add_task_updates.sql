-- Migration: add task_updates for the TaskTrackr "progress posts" feature.
--
-- Each update belongs to a task and is optionally accompanied by an
-- uploaded image. The image bytes themselves live on the server's
-- filesystem (under hello-world/backend/uploads/task-updates/) — only
-- the filename and MIME type are stored here. When an update or its
-- parent task is deleted the application code unlinks the on-disk file
-- so the filesystem stays in sync with the database.
--
-- body and image_filename are both nullable: an update may be text-only
-- (image_filename NULL) or image-only (body NULL). The application code
-- enforces "at least one must be present" so an empty update can't be
-- created.

USE hello_app;

CREATE TABLE IF NOT EXISTS task_updates (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  task_id         INT NOT NULL,
  user_id         INT NOT NULL,
  body            TEXT NULL,
  image_filename  VARCHAR(255) NULL,
  image_mime      VARCHAR(100) NULL,
  created_at      TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  KEY task_updates_task_id (task_id),
  KEY task_updates_created_at (created_at),
  CONSTRAINT task_updates_task_fk
    FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE,
  CONSTRAINT task_updates_user_fk
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
