-- Migration: add tables for Stripe subscription tracking.
--
-- Two tables:
--
--   subscriptions     — one row per user (UNIQUE on user_id) tracking
--                       their Stripe customer ID, current subscription
--                       ID, status, period end, and cancel-at-period-end
--                       flag. The user's role in the users table is the
--                       source of truth for "are they premium?" — this
--                       table is the audit trail and gives us a way to
--                       query Stripe state without round-tripping.
--
--   stripe_events     — every Stripe webhook event ID we've processed.
--                       Used purely for idempotency: Stripe may deliver
--                       the same event multiple times (network retries,
--                       at-least-once delivery), and we must not act on
--                       it twice (charging the user twice for an event
--                       that already flipped their role).

USE hello_app;

CREATE TABLE IF NOT EXISTS subscriptions (
  id                     INT AUTO_INCREMENT PRIMARY KEY,
  user_id                INT NOT NULL,
  stripe_customer_id     VARCHAR(255) NOT NULL,
  stripe_subscription_id VARCHAR(255) NULL,
  status                 VARCHAR(50) NULL,
  current_period_end     TIMESTAMP NULL,
  cancel_at_period_end   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at             TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at             TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP
                         ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY subscriptions_user (user_id),
  KEY subscriptions_customer (stripe_customer_id),
  KEY subscriptions_stripe_sub (stripe_subscription_id),
  CONSTRAINT subscriptions_user_fk
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS stripe_events (
  id            VARCHAR(255) NOT NULL PRIMARY KEY,
  type          VARCHAR(100) NOT NULL,
  processed_at  TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  KEY stripe_events_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
