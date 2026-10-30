-- Prompt 12: monetization controls and auditable, non-financial ad events.
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS monetization_settings (
  setting_key TEXT PRIMARY KEY,
  enabled INTEGER NOT NULL DEFAULT 0 CHECK(enabled IN (0,1)),
  provider TEXT NOT NULL DEFAULT 'none' CHECK(provider IN ('none','adsense','direct','game_sdk')),
  provider_approved INTEGER NOT NULL DEFAULT 0 CHECK(provider_approved IN (0,1)),
  configured INTEGER NOT NULL DEFAULT 0 CHECK(configured IN (0,1)),
  personalized_ads INTEGER NOT NULL DEFAULT 0 CHECK(personalized_ads IN (0,1)),
  updated_by TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ad_placements (
  placement_id TEXT PRIMARY KEY CHECK(placement_id IN ('home_top','home_feed','game_below_player','game_sidebar','category_feed')),
  enabled INTEGER NOT NULL DEFAULT 0 CHECK(enabled IN (0,1)),
  format TEXT NOT NULL DEFAULT 'display' CHECK(format IN ('display','native','sponsored')),
  label_required INTEGER NOT NULL DEFAULT 1 CHECK(label_required IN (0,1)),
  max_height_px INTEGER NOT NULL DEFAULT 280 CHECK(max_height_px BETWEEN 80 AND 600),
  updated_by TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO monetization_settings(setting_key) VALUES('display_ads'),('game_ads'),('sponsored_games');
INSERT OR IGNORE INTO ad_placements(placement_id,format) VALUES
 ('home_top','display'),('home_feed','native'),('game_below_player','display'),
 ('game_sidebar','display'),('category_feed','native');

CREATE TABLE IF NOT EXISTS monetization_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  provider TEXT NOT NULL,
  provider_event_id TEXT NOT NULL,
  placement_id TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK(event_type IN ('ad_request','impression','click')),
  game_id TEXT REFERENCES games(id) ON DELETE SET NULL,
  session_hash TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(provider,provider_event_id)
);
CREATE INDEX IF NOT EXISTS idx_monetization_events_date ON monetization_events(created_at,event_type);
CREATE INDEX IF NOT EXISTS idx_monetization_events_placement ON monetization_events(placement_id,created_at);
CREATE INDEX IF NOT EXISTS idx_monetization_events_game ON monetization_events(game_id,created_at);

CREATE TABLE IF NOT EXISTS monetization_revenue_imports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  provider TEXT NOT NULL,
  provider_report_id TEXT NOT NULL,
  currency TEXT NOT NULL,
  amount_minor INTEGER NOT NULL CHECK(amount_minor >= 0),
  period_start TEXT NOT NULL,
  period_end TEXT NOT NULL,
  verified_at TEXT NOT NULL,
  imported_by TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(provider,provider_report_id)
);
