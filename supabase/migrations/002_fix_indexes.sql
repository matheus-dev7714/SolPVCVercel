-- Fix for index syntax errors
-- Run this AFTER running the corrected 001_initial_schema.sql

-- Drop and recreate entries table with proper syntax
DROP TABLE IF EXISTS entries CASCADE;

CREATE TABLE entries (
  id SERIAL PRIMARY KEY,
  pool_id INTEGER NOT NULL REFERENCES pools(id),
  user_pubkey TEXT NOT NULL,
  side TEXT NOT NULL,
  amount_lamports TEXT NOT NULL,
  fee_lamports TEXT NOT NULL,
  tx_signature TEXT,
  claimed BOOLEAN DEFAULT false,
  claim_tx_signature TEXT,
  price_at_entry FLOAT,
  ai_line_bps_at_entry INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for entries table
CREATE INDEX IF NOT EXISTS idx_entries_pool_user ON entries(pool_id, user_pubkey);
CREATE INDEX IF NOT EXISTS idx_entries_user ON entries(user_pubkey);
CREATE INDEX IF NOT EXISTS idx_entries_pool_side ON entries(pool_id, side);
CREATE INDEX IF NOT EXISTS idx_entries_claimed ON entries(pool_id, claimed);

-- Drop and recreate price_history table
DROP TABLE IF EXISTS price_history CASCADE;

CREATE TABLE price_history (
  id SERIAL PRIMARY KEY,
  pool_id INTEGER NOT NULL REFERENCES pools(id),
  timestamp TEXT NOT NULL,
  price FLOAT NOT NULL,
  source TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_price_history_pool_time ON price_history(pool_id, timestamp);

-- Drop and recreate ai_line_history table
DROP TABLE IF EXISTS ai_line_history CASCADE;

CREATE TABLE ai_line_history (
  id SERIAL PRIMARY KEY,
  pool_id INTEGER NOT NULL REFERENCES pools(id),
  timestamp TEXT NOT NULL,
  line_bps INTEGER NOT NULL,
  source TEXT NOT NULL,
  note TEXT
);

CREATE INDEX IF NOT EXISTS idx_ai_line_history_pool_time ON ai_line_history(pool_id, timestamp);

-- Drop and recreate resolutions table
DROP TABLE IF EXISTS resolutions CASCADE;

CREATE TABLE resolutions (
  id SERIAL PRIMARY KEY,
  pool_id INTEGER NOT NULL REFERENCES pools(id),
  resolver_id TEXT NOT NULL,
  final_price FLOAT NOT NULL,
  start_price FLOAT NOT NULL,
  price_change_bps INTEGER NOT NULL,
  winner_side TEXT NOT NULL,
  proof_data TEXT NOT NULL,
  resolved_at TIMESTAMP DEFAULT NOW(),
  tx_signature TEXT
);

CREATE INDEX IF NOT EXISTS idx_resolutions_pool ON resolutions(pool_id);

-- Re-enable RLS
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_line_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE resolutions ENABLE ROW LEVEL SECURITY;

-- Recreate policies
CREATE POLICY "Allow public read access to entries"
  ON entries FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access to price_history"
  ON price_history FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access to ai_line_history"
  ON ai_line_history FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access to resolutions"
  ON resolutions FOR SELECT
  USING (true);

