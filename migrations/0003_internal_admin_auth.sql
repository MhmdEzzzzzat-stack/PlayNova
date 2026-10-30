-- Internal admin authentication for Cloudflare Workers + D1.
-- Apply after 0002_admin_dashboard.sql.
PRAGMA foreign_keys = ON;

ALTER TABLE admin_users ADD COLUMN password_hash TEXT;

CREATE TABLE IF NOT EXISTS admin_sessions (
  token_hash TEXT PRIMARY KEY,
  admin_email TEXT NOT NULL COLLATE NOCASE REFERENCES admin_users(email) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_seen_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expiry ON admin_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_email ON admin_sessions(admin_email);

CREATE TABLE IF NOT EXISTS admin_login_attempts (
  attempt_key TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_admin_login_attempts_key_time
  ON admin_login_attempts(attempt_key, created_at);
