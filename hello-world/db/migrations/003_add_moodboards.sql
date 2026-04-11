-- Migration: add boards and board_images for the MoodBoard mini app.
--
-- Each board belongs to a user and has a random share_token that serves
-- as its URL identifier. Anyone who knows the token can view the board;
-- only the owner (authenticated, matched by user_id) can modify it.
--
-- Images are stored by URL only. No photos are uploaded to or hosted by
-- this server; clients render images directly from the URLs stored here.
-- That is a deliberate design choice -- see README for context.

USE hello_app;

CREATE TABLE IF NOT EXISTS boards (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT NOT NULL,
  name         VARCHAR(255) NOT NULL,
  share_token  VARCHAR(64) NOT NULL,
  created_at   TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP
               ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY boards_share_token (share_token),
  KEY boards_user_id (user_id),
  CONSTRAINT boards_user_fk
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS board_images (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  board_id    INT NOT NULL,
  url         VARCHAR(2048) NOT NULL,
  created_at  TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  KEY board_images_board_id (board_id),
  CONSTRAINT board_images_board_fk
    FOREIGN KEY (board_id) REFERENCES boards (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
