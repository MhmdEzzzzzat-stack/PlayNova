-- Prompt 8: administration, licensing, moderation, homepage, and real analytics.
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS admin_users (
  email TEXT PRIMARY KEY COLLATE NOCASE,
  role TEXT NOT NULL CHECK (role IN ('owner','administrator','editor','reviewer')),
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0,1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_audit_log_v2 (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  actor_email TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  details_json TEXT NOT NULL DEFAULT '{}',
  ip_hash TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_admin_audit_created ON admin_audit_log_v2(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_entity ON admin_audit_log_v2(entity_type, entity_id);

ALTER TABLE categories ADD COLUMN description_ar TEXT NOT NULL DEFAULT '';
ALTER TABLE categories ADD COLUMN description_en TEXT NOT NULL DEFAULT '';
ALTER TABLE categories ADD COLUMN visible INTEGER NOT NULL DEFAULT 1;
ALTER TABLE categories ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0;

ALTER TABLE games ADD COLUMN mobile_support INTEGER NOT NULL DEFAULT 0;
ALTER TABLE games ADD COLUMN orientation TEXT NOT NULL DEFAULT 'any' CHECK (orientation IN ('any','portrait','landscape'));
ALTER TABLE games ADD COLUMN rights_holder TEXT NOT NULL DEFAULT '';
ALTER TABLE games ADD COLUMN rights_expires_at TEXT;
ALTER TABLE games ADD COLUMN rights_evidence_url TEXT NOT NULL DEFAULT '';
ALTER TABLE games ADD COLUMN review_status TEXT NOT NULL DEFAULT 'not_submitted' CHECK (review_status IN ('not_submitted','pending','approved','rejected'));
ALTER TABLE games ADD COLUMN moderation_status TEXT NOT NULL DEFAULT 'active' CHECK (moderation_status IN ('active','suspended'));
ALTER TABLE games ADD COLUMN updated_by TEXT NOT NULL DEFAULT '';

CREATE TABLE IF NOT EXISTS game_reports (
  id TEXT PRIMARY KEY,
  game_id TEXT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  reporter_email TEXT,
  reason TEXT NOT NULL,
  details TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','reviewing','resolved','dismissed')),
  decision TEXT NOT NULL DEFAULT '',
  reviewed_by TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_game_reports_status ON game_reports(status, created_at DESC);

CREATE TABLE IF NOT EXISTS play_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  game_id TEXT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('start','load_success','load_failure')),
  session_hash TEXT NOT NULL,
  failure_code TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_play_events_created ON play_events(created_at);
CREATE INDEX IF NOT EXISTS idx_play_events_game ON play_events(game_id, created_at);

CREATE TABLE IF NOT EXISTS homepage_sections (
  id TEXT PRIMARY KEY,
  title_ar TEXT NOT NULL,
  title_en TEXT NOT NULL,
  section_type TEXT NOT NULL CHECK (section_type IN ('featured','category','latest','manual')),
  category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  game_ids_json TEXT NOT NULL DEFAULT '[]',
  visible INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value_json TEXT NOT NULL,
  updated_by TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_games_moderation ON games(status, moderation_status, license_status);
CREATE INDEX IF NOT EXISTS idx_games_review ON games(review_status, status);
