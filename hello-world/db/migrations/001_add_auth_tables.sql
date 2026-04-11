-- Migration: add authentication tables
--
-- Creates users, sessions, and password_resets tables in the hello_app
-- database. Safe to re-run: every statement is idempotent.
--
-- Runs against an existing hello_app database that was bootstrapped with
-- hello-world/init.sql. It does NOT create the database or the application
-- user; that is still the job of init.sql on a fresh server.

USE hello_app;

-- Users: one row per account.
CREATE TABLE IF NOT EXISTS users (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  email           VARCHAR(255) NOT NULL,
  password_hash   VARCHAR(255) NOT NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_login_at   DATETIME NULL,
  UNIQUE KEY users_email_unique (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sessions: backing store for express-mysql-session.
-- Column shapes are dictated by the library; do not rename them.
-- If the library creates this table itself at boot time, the IF NOT EXISTS
-- here turns the migration into a no-op on that side.
CREATE TABLE IF NOT EXISTS sessions (
  session_id  VARCHAR(128) NOT NULL PRIMARY KEY,
  expires     INT UNSIGNED NOT NULL,
  data        MEDIUMTEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Password resets: short-lived tokens that let a user set a new password.
-- The plaintext token is never stored; only its sha256 hash. When a reset
-- is consumed, used_at is stamped so the same token cannot be reused.
CREATE TABLE IF NOT EXISTS password_resets (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  token_hash  VARCHAR(255) NOT NULL,
  expires_at  DATETIME NOT NULL,
  used_at     DATETIME NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY password_resets_user_id (user_id),
  UNIQUE KEY password_resets_token_hash (token_hash),
  CONSTRAINT password_resets_user_fk
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
