-- Prompt 10: first-party privacy-conscious analytics events.
PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS analytics_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL CHECK(event_type IN ('game_view','search','game_start','load_success','load_failure','favorite_add','favorite_remove','category_visit','session_end','web_vital')),
  game_id TEXT REFERENCES games(id) ON DELETE SET NULL,
  category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  search_term TEXT NOT NULL DEFAULT '',
  source_host TEXT NOT NULL DEFAULT '',
  device_type TEXT NOT NULL DEFAULT 'unknown' CHECK(device_type IN ('mobile','desktop','tablet','unknown')),
  session_hash TEXT NOT NULL,
  duration_ms INTEGER,
  metric_name TEXT NOT NULL DEFAULT '',
  metric_value REAL,
  failure_code TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_analytics_created ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_type_date ON analytics_events(event_type,created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_game_date ON analytics_events(game_id,created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_session_date ON analytics_events(session_hash,created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_search_date ON analytics_events(event_type,search_term,created_at);
