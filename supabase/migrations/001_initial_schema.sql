-- Supabase Migration: Initial Schema for SOLPVE
-- Run this in Supabase SQL Editor to create all tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Pools table
CREATE TABLE IF NOT EXISTS pools (
  id SERIAL PRIMARY KEY,
  token TEXT NOT NULL,
  mint TEXT NOT NULL,
  logo_url TEXT,
  
  -- Timestamps (BigInt as text for Supabase)
  start_ts TEXT NOT NULL,
  lock_ts TEXT NOT NULL,
  end_ts TEXT NOT NULL,
  
  -- AI Prediction
  line_bps INTEGER NOT NULL,
  pool_type TEXT NOT NULL DEFAULT 'PvMarket',
  
  -- Pool Status
  status TEXT NOT NULL,
  winner TEXT,
  
  -- Totals (BigInt as text)
  total_over_lamports TEXT DEFAULT '0',
  total_under_lamports TEXT DEFAULT '0',
  
  -- AI Model Data
  ai_confidence FLOAT NOT NULL,
  ai_model TEXT NOT NULL,
  ai_commit TEXT NOT NULL,
  ai_payload_url TEXT,
  
  -- Proof Data
  proof_hash TEXT,
  proof_url TEXT,
  
  -- Solana Contract Data
  contract_address TEXT,
  contract_url TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_pools_status ON pools(status);
CREATE INDEX IF NOT EXISTS idx_pools_lock_ts ON pools(lock_ts);
CREATE INDEX IF NOT EXISTS idx_pools_end_ts ON pools(end_ts);
CREATE INDEX IF NOT EXISTS idx_pools_pool_type ON pools(pool_type);

-- Entries table
CREATE TABLE IF NOT EXISTS entries (
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

-- Price History table
CREATE TABLE IF NOT EXISTS price_history (
  id SERIAL PRIMARY KEY,
  pool_id INTEGER NOT NULL REFERENCES pools(id),
  timestamp TEXT NOT NULL,
  price FLOAT NOT NULL,
  source TEXT NOT NULL
);

-- Create index for price_history
CREATE INDEX IF NOT EXISTS idx_price_history_pool_time ON price_history(pool_id, timestamp);

-- AI Line History table
CREATE TABLE IF NOT EXISTS ai_line_history (
  id SERIAL PRIMARY KEY,
  pool_id INTEGER NOT NULL REFERENCES pools(id),
  timestamp TEXT NOT NULL,
  line_bps INTEGER NOT NULL,
  source TEXT NOT NULL,
  note TEXT
);

-- Create index for ai_line_history
CREATE INDEX IF NOT EXISTS idx_ai_line_history_pool_time ON ai_line_history(pool_id, timestamp);

-- Resolutions table
CREATE TABLE IF NOT EXISTS resolutions (
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

-- Create index for resolutions
CREATE INDEX IF NOT EXISTS idx_resolutions_pool ON resolutions(pool_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_pools_updated_at
    BEFORE UPDATE ON pools
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to increment pool totals (for atomic updates)
CREATE OR REPLACE FUNCTION increment_pool_total(
  pool_id INTEGER,
  field_name TEXT,
  increment_value TEXT
)
RETURNS VOID AS $$
BEGIN
  IF field_name = 'total_over_lamports' THEN
    UPDATE pools
    SET total_over_lamports = (
      CAST(total_over_lamports AS NUMERIC) + CAST(increment_value AS NUMERIC)
    )::TEXT
    WHERE id = pool_id;
  ELSIF field_name = 'total_under_lamports' THEN
    UPDATE pools
    SET total_under_lamports = (
      CAST(total_under_lamports AS NUMERIC) + CAST(increment_value AS NUMERIC)
    )::TEXT
    WHERE id = pool_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security (optional, for future auth)
ALTER TABLE pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_line_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE resolutions ENABLE ROW LEVEL SECURITY;

-- Policy to allow public read access to pools
CREATE POLICY "Allow public read access to pools"
  ON pools FOR SELECT
  USING (true);

-- Policy to allow public read access to entries
CREATE POLICY "Allow public read access to entries"
  ON entries FOR SELECT
  USING (true);

-- Policy to allow public read access to price history
CREATE POLICY "Allow public read access to price_history"
  ON price_history FOR SELECT
  USING (true);

-- Policy to allow public read access to ai_line_history
CREATE POLICY "Allow public read access to ai_line_history"
  ON ai_line_history FOR SELECT
  USING (true);

-- Policy to allow public read access to resolutions
CREATE POLICY "Allow public read access to resolutions"
  ON resolutions FOR SELECT
  USING (true);

