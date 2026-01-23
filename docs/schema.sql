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

-- Accredited nursing programs (CCNE + ACEN)
CREATE TABLE IF NOT EXISTS nursing_programs (
  id TEXT PRIMARY KEY,
  institution_name TEXT NOT NULL,
  campus_name TEXT,
  city TEXT,
  state TEXT NOT NULL,
  program_level TEXT NOT NULL,
  credential_notes TEXT,
  accreditor TEXT NOT NULL,
  accreditation_status TEXT,
  source_url TEXT NOT NULL,
  school_website_url TEXT,
  nces_unitid TEXT,
  last_verified_date DATE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_nursing_programs_state ON nursing_programs(state);
CREATE INDEX IF NOT EXISTS idx_nursing_programs_level ON nursing_programs(program_level);
CREATE INDEX IF NOT EXISTS idx_nursing_programs_accreditor ON nursing_programs(accreditor);
CREATE INDEX IF NOT EXISTS idx_nursing_programs_unitid ON nursing_programs(nces_unitid);
