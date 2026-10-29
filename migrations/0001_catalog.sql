-- PlayNova catalog and licensing foundation.
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS games (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title_ar TEXT NOT NULL,
  title_en TEXT NOT NULL,
  description_ar TEXT NOT NULL DEFAULT '',
  description_en TEXT NOT NULL DEFAULT '',
  instructions_ar TEXT NOT NULL DEFAULT '',
  instructions_en TEXT NOT NULL DEFAULT '',
  controls_ar TEXT NOT NULL DEFAULT '',
  controls_en TEXT NOT NULL DEFAULT '',
  thumbnail_url TEXT,
  source_name TEXT NOT NULL,
  source_page_url TEXT NOT NULL,
  launch_url TEXT NOT NULL,
  allowed_origin TEXT NOT NULL,
  launch_mode TEXT NOT NULL CHECK (launch_mode IN ('hosted-html5','authorized-embed','publisher-sdk')),
  license_type TEXT NOT NULL DEFAULT 'pending',
  license_status TEXT NOT NULL DEFAULT 'pending' CHECK (license_status IN ('pending','approved','rejected','expired')),
  authorization_reference TEXT NOT NULL DEFAULT '',
  authorization_notes TEXT NOT NULL DEFAULT '',
  permissions_fullscreen INTEGER NOT NULL DEFAULT 0,
  permissions_pointer_lock INTEGER NOT NULL DEFAULT 0,
  permissions_orientation_lock INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  featured INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  published_at TEXT,
  CHECK (status != 'published' OR (license_status = 'approved' AND length(trim(authorization_reference)) > 0))
);

CREATE TABLE IF NOT EXISTS game_categories (
  game_id TEXT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (game_id, category_id)
);

CREATE TABLE IF NOT EXISTS game_tags (
  game_id TEXT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  PRIMARY KEY (game_id, tag)
);

CREATE TABLE IF NOT EXISTS admin_audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  actor_email TEXT NOT NULL,
  action TEXT NOT NULL,
  game_id TEXT,
  details TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_games_status ON games(status);
CREATE INDEX IF NOT EXISTS idx_games_source ON games(source_name);
CREATE INDEX IF NOT EXISTS idx_game_categories_category ON game_categories(category_id);

INSERT OR IGNORE INTO categories (id, slug, name_ar, name_en) VALUES
('action','action','أكشن','Action'),
('strategy','strategy','استراتيجية','Strategy'),
('adventure','adventure','مغامرات','Adventure'),
('racing','racing','سباق','Racing'),
('sports','sports','رياضة','Sports'),
('football','football','كرة القدم','Football'),
('puzzle','puzzle','ألغاز','Puzzle'),
('shooting','shooting','تصويب','Shooting'),
('multiplayer','multiplayer','متعددة اللاعبين','Multiplayer'),
('two-player','two-player','لاعبان','Two Player'),
('simulation','simulation','محاكاة','Simulation'),
('horror','horror','رعب','Horror'),
('casual','casual','خفيفة','Casual'),
('idle','idle','خمولية','Idle'),
('platformer','platformer','منصات','Platformer'),
('3d-games','3d-games','ألعاب ثلاثية الأبعاد','3D Games');

-- Candidate embeds only: intentionally draft and blocked until written authorization is recorded.
INSERT OR IGNORE INTO games (
 id, slug, title_ar, title_en, description_ar, description_en,
 source_name, source_page_url, launch_url, allowed_origin, launch_mode,
 license_type, license_status, authorization_notes, status
) VALUES
('madkid-stick-war-legacy','stick-war-legacy','Stick War Legacy','Stick War Legacy',
 'لعبة استراتيجية مرشحة للإضافة من MadKidGames.','Strategy game candidate sourced from MadKidGames.',
 'MadKidGames','https://www.madkidgames.com/full/stick-war-legacy',
 'https://www.madkidgames.com/full/stick-war-legacy','https://www.madkidgames.com',
 'authorized-embed','pending','pending','Candidate only. Verify publisher rights and written embed approval before publishing.','draft'),
('madkid-subway-surfers','subway-surfers','Subway Surfers','Subway Surfers',
 'لعبة جري ومغامرات مرشحة للإضافة من MadKidGames.','Endless runner candidate sourced from MadKidGames.',
 'MadKidGames','https://www.madkidgames.com/full/subway-surfers',
 'https://www.madkidgames.com/full/subway-surfers','https://www.madkidgames.com',
 'authorized-embed','pending','pending','Candidate only. Verify publisher rights and written embed approval before publishing.','draft'),
('madkid-free-kick-football','free-kick-football-3d-soccer','ركلات حرة - كرة قدم ثلاثية الأبعاد','Free Kick Football 3D Soccer',
 'لعبة كرة قدم مرشحة للإضافة من MadKidGames.','Football game candidate sourced from MadKidGames.',
 'MadKidGames','https://www.madkidgames.com/full/free-kick-football-3d-soccer',
 'https://www.madkidgames.com/full/free-kick-football-3d-soccer','https://www.madkidgames.com',
 'authorized-embed','pending','pending','Candidate only. Verify publisher rights and written embed approval before publishing.','draft');

INSERT OR IGNORE INTO game_categories (game_id, category_id) VALUES
('madkid-stick-war-legacy','action'),
('madkid-stick-war-legacy','strategy'),
('madkid-subway-surfers','casual'),
('madkid-subway-surfers','adventure'),
('madkid-free-kick-football','sports'),
('madkid-free-kick-football','football');
