PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE COLLATE NOCASE,
  email TEXT UNIQUE COLLATE NOCASE,
  display_name TEXT NOT NULL,
  first_name TEXT NOT NULL DEFAULT '',
  last_name TEXT NOT NULL DEFAULT '',
  grade TEXT NOT NULL DEFAULT '',
  telegram_id TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('owner','admin','reviewer','user')),
  password_salt TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  bio TEXT NOT NULL DEFAULT '',
  profile_image TEXT NOT NULL DEFAULT '/icon.png',
  abilities_json TEXT NOT NULL DEFAULT '{}',
  reviewer INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS lessons (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  section TEXT NOT NULL CHECK (section IN ('theory','algorithm','programming')),
  rank TEXT NOT NULL DEFAULT 'pawn',
  piece TEXT NOT NULL DEFAULT 'pawn',
  difficulty TEXT NOT NULL DEFAULT 'مقدماتی',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','review','published')),
  content_markdown TEXT NOT NULL DEFAULT '',
  created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS roadmap_modules (
  id TEXT PRIMARY KEY,
  section TEXT NOT NULL CHECK (section IN ('theory','algorithm','programming')),
  rank TEXT NOT NULL DEFAULT 'pawn',
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  piece TEXT NOT NULL DEFAULT 'pawn',
  position INTEGER NOT NULL DEFAULT 0,
  UNIQUE(section, piece, position)
);

CREATE TABLE IF NOT EXISTS roadmap_module_lessons (
  module_id TEXT NOT NULL REFERENCES roadmap_modules(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY(module_id, lesson_id),
  UNIQUE(module_id, position)
);

CREATE TABLE IF NOT EXISTS problem_sources (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  url TEXT NOT NULL DEFAULT '',
  brand_color TEXT NOT NULL DEFAULT '#38bdf8'
);

CREATE TABLE IF NOT EXISTS problems (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  source_id TEXT NOT NULL REFERENCES problem_sources(id) ON DELETE RESTRICT,
  external_id TEXT NOT NULL DEFAULT '',
  url_key TEXT NOT NULL DEFAULT '',
  name TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  topic TEXT NOT NULL DEFAULT '',
  difficulty TEXT NOT NULL DEFAULT 'متوسط',
  rank TEXT NOT NULL DEFAULT 'pawn',
  piece TEXT NOT NULL DEFAULT 'pawn',
  rating INTEGER,
  usaco_level TEXT NOT NULL DEFAULT '',
  contest_year INTEGER,
  cses_topic TEXT NOT NULL DEFAULT '',
  tags_json TEXT NOT NULL DEFAULT '[]',
  examples_json TEXT NOT NULL DEFAULT '[]',
  link TEXT NOT NULL DEFAULT '',
  statement_default_language TEXT NOT NULL DEFAULT 'fa' CHECK (statement_default_language IN ('fa','en')),
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft','review','published')),
  created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS problem_statements (
  id TEXT PRIMARY KEY,
  problem_id TEXT NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  language TEXT NOT NULL CHECK (language IN ('fa','en')),
  content_markdown TEXT NOT NULL,
  input_markdown TEXT NOT NULL DEFAULT '',
  output_markdown TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft','review','published','rejected')),
  author_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(problem_id, language, status)
);

CREATE TABLE IF NOT EXISTS problem_education (
  id TEXT PRIMARY KEY,
  problem_id TEXT NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('hint','solution','takeaway')),
  layer INTEGER NOT NULL DEFAULT 0,
  language TEXT NOT NULL DEFAULT 'fa' CHECK (language IN ('fa','en')),
  title TEXT NOT NULL DEFAULT '',
  content_markdown TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft','review','published','rejected')),
  author_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS lesson_problems (
  lesson_id TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  problem_id TEXT NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY(lesson_id, problem_id)
);

CREATE TABLE IF NOT EXISTS lesson_practice_items (
  id TEXT PRIMARY KEY,
  lesson_id TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  difficulty TEXT NOT NULL DEFAULT '',
  url TEXT NOT NULL DEFAULT '',
  position INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS contributions (
  id TEXT PRIMARY KEY,
  problem_id TEXT NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  contributor_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('translation','hint','solution','takeaway')),
  language TEXT NOT NULL DEFAULT 'fa' CHECK (language IN ('fa','en')),
  layer INTEGER NOT NULL DEFAULT 0,
  title TEXT NOT NULL DEFAULT '',
  content_markdown TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected')),
  review_note TEXT NOT NULL DEFAULT '',
  reviewed_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  xp_awarded INTEGER NOT NULL DEFAULT 0,
  published_id TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  reviewed_at TEXT
);

CREATE TABLE IF NOT EXISTS progress (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  problem_id TEXT NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  solved INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL,
  PRIMARY KEY(user_id, problem_id)
);

CREATE TABLE IF NOT EXISTS lesson_progress (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  completed INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL,
  PRIMARY KEY(user_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS contributor_requests (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  motivation TEXT NOT NULL,
  experience TEXT NOT NULL DEFAULT '',
  telegram_id TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  reviewed_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL,
  reviewed_at TEXT
);

CREATE TABLE IF NOT EXISTS problem_submissions (
  id TEXT PRIMARY KEY,
  problem_id TEXT NOT NULL UNIQUE REFERENCES problems(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected')),
  xp_awarded INTEGER NOT NULL DEFAULT 0,
  review_note TEXT NOT NULL DEFAULT '',
  published_parts_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  reviewed_at TEXT
);

CREATE TABLE IF NOT EXISTS xp_settings (
  key TEXT PRIMARY KEY,
  value INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS files (
  id TEXT PRIMARY KEY,
  original_name TEXT NOT NULL,
  stored_name TEXT NOT NULL,
  url TEXT NOT NULL,
  size INTEGER NOT NULL DEFAULT 0,
  mimetype TEXT NOT NULL DEFAULT '',
  uploaded_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  uploaded_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  actor_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  actor_username TEXT NOT NULL DEFAULT '',
  actor_role TEXT NOT NULL DEFAULT '',
  method TEXT NOT NULL,
  path TEXT NOT NULL,
  status_code INTEGER NOT NULL DEFAULT 200,
  summary TEXT NOT NULL DEFAULT '',
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS problem_collections (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  source_id TEXT REFERENCES problem_sources(id) ON DELETE SET NULL,
  created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS problem_collection_items (
  collection_id TEXT NOT NULL REFERENCES problem_collections(id) ON DELETE CASCADE,
  problem_id TEXT NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY(collection_id, problem_id)
);

CREATE TABLE IF NOT EXISTS reviewer_tickets (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','in_progress','closed')),
  admin_note TEXT NOT NULL DEFAULT '',
  reviewed_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL,
  reviewed_at TEXT
);

CREATE TABLE IF NOT EXISTS content_reactions (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL,
  content_id TEXT NOT NULL,
  value INTEGER NOT NULL CHECK (value IN (-1,1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY(user_id, content_type, content_id)
);

CREATE INDEX IF NOT EXISTS idx_lessons_public ON lessons(status, section, rank);
CREATE INDEX IF NOT EXISTS idx_problems_public ON problems(status, source_id, rank, topic);
CREATE INDEX IF NOT EXISTS idx_contributions_queue ON contributions(status, created_at);
CREATE INDEX IF NOT EXISTS idx_education_problem ON problem_education(problem_id, kind, layer);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_collection_items_problem ON problem_collection_items(problem_id);
CREATE INDEX IF NOT EXISTS idx_reviewer_tickets_queue ON reviewer_tickets(status, created_at);
INSERT OR IGNORE INTO xp_settings(key,value) VALUES ('statement',10),('hint',15),('solution',30),('takeaway',10),('problem',100);
