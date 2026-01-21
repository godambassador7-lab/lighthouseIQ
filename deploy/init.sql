-- Database initialization script for Nursing Layoff Radar
-- This runs automatically when the PostgreSQL container starts

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create the main notices table
CREATE TABLE IF NOT EXISTS warn_notices (
    id TEXT PRIMARY KEY,
    state VARCHAR(2) NOT NULL,
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
    source_url TEXT,
    source_id TEXT,
    attachments JSONB,
    nursing_score INTEGER DEFAULT 0,
    nursing_label TEXT DEFAULT 'Unclear',
    nursing_signals JSONB DEFAULT '[]'::jsonb,
    nursing_keywords JSONB DEFAULT '[]'::jsonb,
    retrieved_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_warn_notices_state ON warn_notices(state);
CREATE INDEX IF NOT EXISTS idx_warn_notices_notice_date ON warn_notices(notice_date DESC);
CREATE INDEX IF NOT EXISTS idx_warn_notices_nursing_score ON warn_notices(nursing_score DESC);
CREATE INDEX IF NOT EXISTS idx_warn_notices_retrieved_at ON warn_notices(retrieved_at DESC);

-- Create trigram indexes for text search
CREATE INDEX IF NOT EXISTS idx_warn_notices_employer_trgm
    ON warn_notices USING GIN (employer_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_warn_notices_raw_trgm
    ON warn_notices USING GIN (raw_text gin_trgm_ops);

-- Create composite index for common filter combinations
CREATE INDEX IF NOT EXISTS idx_warn_notices_state_date
    ON warn_notices(state, notice_date DESC);
CREATE INDEX IF NOT EXISTS idx_warn_notices_score_date
    ON warn_notices(nursing_score DESC, notice_date DESC);

-- Grant permissions (if running as superuser creating for another role)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO nlr;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO nlr;
