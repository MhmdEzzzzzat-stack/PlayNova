-- Prompt 9: asset inventory and review workflow. Object bytes live in Cloudflare R2, never D1.
PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS content_assets (
  id TEXT PRIMARY KEY,
  game_id TEXT REFERENCES games(id) ON DELETE SET NULL,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('thumbnail','screenshot','html5_package')),
  storage_key TEXT NOT NULL UNIQUE,
  original_filename TEXT NOT NULL,
  content_type TEXT NOT NULL,
  file_extension TEXT NOT NULL,
  size_bytes INTEGER NOT NULL CHECK (size_bytes > 0),
  sha256 TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending_review' CHECK (status IN ('pending_review','approved','rejected','published','removed')),
  review_notes TEXT NOT NULL DEFAULT '',
  uploaded_by TEXT NOT NULL,
  reviewed_by TEXT,
  reviewed_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_content_assets_game ON content_assets(game_id, asset_type, status);
CREATE INDEX IF NOT EXISTS idx_content_assets_review ON content_assets(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_assets_hash ON content_assets(sha256, size_bytes);

-- Explicit provider host allowlist; empty by default so no arbitrary remote embeds are trusted.
CREATE TABLE IF NOT EXISTS provider_domains (
  domain TEXT PRIMARY KEY COLLATE NOCASE,
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0,1)),
  notes TEXT NOT NULL DEFAULT '',
  added_by TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
