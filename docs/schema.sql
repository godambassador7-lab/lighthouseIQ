-- Basic schema for storing normalized WARN notices

CREATE TABLE IF NOT EXISTS warn_notices (
  id TEXT PRIMARY KEY,
  state TEXT NOT NULL,
  employer_name TEXT NOT NULL,
  parent_system TEXT,
  city TEXT,
  county TEXT,
  address TEXT,
  notice_date DATE,
  effective_date DATE,
  employees_affected INTEGER,
  naics TEXT,
  reason TEXT,
  raw_text TEXT,
  source_name TEXT NOT NULL,
  source_url TEXT NOT NULL,
  source_id TEXT,
  attachments JSONB,
  nursing_score INTEGER,
  nursing_label TEXT,
  nursing_signals JSONB,
  nursing_keywords JSONB,
  retrieved_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_warn_notices_state ON warn_notices(state);
CREATE INDEX IF NOT EXISTS idx_warn_notices_notice_date ON warn_notices(notice_date);
CREATE INDEX IF NOT EXISTS idx_warn_notices_nursing_score ON warn_notices(nursing_score);
