-- Migration: Saved Credentials + Receipts System
-- Date: 2025-11-23
-- Description: Adds properties table for saved credentials and receipts table
-- NOTE: No property_limit - users can save unlimited credentials (only scan_count is limited)

-- ============================================
-- 1. CREATE properties TABLE (Saved Credentials)
-- ============================================
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Property info
  property_name VARCHAR(255) NOT NULL,
  property_type VARCHAR(100), -- Hotel, B&B, Agriturismo, Affittacamere, Casa Vacanze, etc.
  address VARCHAR(500),
  city VARCHAR(100),
  province VARCHAR(50),

  -- Alloggiati Web credentials (ENCRYPTED with AES-256-GCM)
  wskey_encrypted TEXT NOT NULL,
  alloggiati_username VARCHAR(255) NOT NULL,

  -- Usage tracking
  is_default BOOLEAN DEFAULT FALSE,
  last_used_at TIMESTAMP,
  total_submissions INTEGER DEFAULT 0,

  -- Metadata
  notes TEXT, -- Optional user notes

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for properties
CREATE INDEX IF NOT EXISTS idx_properties_user_id ON properties(user_id);
CREATE INDEX IF NOT EXISTS idx_properties_default ON properties(user_id, is_default);
CREATE INDEX IF NOT EXISTS idx_properties_name ON properties(user_id, property_name);

-- Trigger for updated_at
CREATE TRIGGER IF NOT EXISTS update_properties_updated_at
BEFORE UPDATE ON properties
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 2. ADD property_id TO scans TABLE
-- ============================================
ALTER TABLE scans
ADD COLUMN IF NOT EXISTS property_id UUID REFERENCES properties(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_scans_property ON scans(property_id);

-- ============================================
-- 3. CREATE receipts TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS receipts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  scan_id UUID REFERENCES scans(id) ON DELETE SET NULL,

  -- Receipt metadata
  receipt_number VARCHAR(100) NOT NULL,
  receipt_date DATE NOT NULL,

  -- PDF storage (BASE64 encoded or BYTEA)
  receipt_pdf_base64 TEXT NOT NULL, -- Store as Base64 for easier transfer
  file_size INTEGER, -- Size in bytes

  -- Guest info (for search/filtering)
  guest_name VARCHAR(255),
  guest_surname VARCHAR(255),
  guest_birth_date DATE,
  guest_nationality VARCHAR(50),

  -- Property info (denormalized for faster queries)
  property_name VARCHAR(255),

  -- Check-in/out dates
  checkin_date DATE,
  checkout_date DATE,
  nights INTEGER,

  -- SOAP submission metadata
  submission_timestamp TIMESTAMP,
  soap_response_code VARCHAR(50),

  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for receipts
CREATE INDEX IF NOT EXISTS idx_receipts_user_date ON receipts(user_id, receipt_date DESC);
CREATE INDEX IF NOT EXISTS idx_receipts_property ON receipts(property_id, receipt_date DESC);
CREATE INDEX IF NOT EXISTS idx_receipts_guest ON receipts(user_id, guest_surname, guest_name);
CREATE INDEX IF NOT EXISTS idx_receipts_number ON receipts(receipt_number);
CREATE INDEX IF NOT EXISTS idx_receipts_dates ON receipts(checkin_date, checkout_date);

-- ============================================
-- 4. UPDATE subscriptions TABLE (optional metadata)
-- ============================================
-- Note: No need to track properties_included since unlimited

-- ============================================
-- NOTES:
-- ============================================
-- After running this migration:
-- 1. Generate ENCRYPTION_KEY: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
-- 2. Add to Vercel Environment Variables: ENCRYPTION_KEY=your_generated_key
-- 3. Users can save UNLIMITED credentials (no property_limit)
-- 4. Only scan_count (total submissions) is limited by subscription plan
-- 5. WSKEY will be encrypted before storage using lib/encryption.ts
-- 6. Receipts PDF stored as Base64 text (easier for Vercel Serverless)
