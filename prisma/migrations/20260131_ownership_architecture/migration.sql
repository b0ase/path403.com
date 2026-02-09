-- Ownership Architecture Migration
-- Implements two-layer ownership model:
-- 1. Tokens (beneficial interest) - tradeable, no KYC
-- 2. Registry (legal title) - requires KYC, filed with Companies House

-- ============================================
-- COMPANY HIERARCHY
-- ============================================

-- Company types
CREATE TYPE company_type AS ENUM ('HOLDING', 'SUBSIDIARY', 'DIVISION');

-- Companies table with parent/child relationships
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  company_number VARCHAR(20), -- Companies House number (null for divisions)
  type company_type NOT NULL DEFAULT 'SUBSIDIARY',

  -- Hierarchy
  parent_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  parent_ownership_percent DECIMAL(5,2), -- e.g., 85.35 for 85.35%

  -- Token association
  token_symbol VARCHAR(20), -- $BOASE, $NPG, etc.

  -- Metadata
  incorporated_date DATE,
  jurisdiction VARCHAR(50) DEFAULT 'England and Wales',
  registered_address TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for hierarchy queries
CREATE INDEX idx_companies_parent ON companies(parent_id);
CREATE INDEX idx_companies_token ON companies(token_symbol);

-- ============================================
-- SHAREHOLDER REGISTRY (LEGAL TITLE)
-- ============================================

CREATE TYPE kyc_status_enum AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED');

-- Registry entries - these go on confirmation statements
CREATE TABLE IF NOT EXISTS shareholder_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Legal identity (for Companies House)
  legal_name VARCHAR(255) NOT NULL,
  legal_address_line1 VARCHAR(255) NOT NULL,
  legal_address_line2 VARCHAR(255),
  legal_address_city VARCHAR(100) NOT NULL,
  legal_address_postal_code VARCHAR(20) NOT NULL,
  legal_address_country VARCHAR(2) NOT NULL DEFAULT 'GB',

  -- Entity type
  is_corporate BOOLEAN DEFAULT FALSE, -- true if shareholder is a company
  corporate_company_number VARCHAR(20), -- if corporate shareholder

  -- Shareholding
  shares BIGINT NOT NULL,
  share_class VARCHAR(50) NOT NULL DEFAULT 'Ordinary',
  certificate_number VARCHAR(50),
  date_registered DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Link to beneficial interest (if staked from tokens)
  token_stake_tx VARCHAR(100), -- BSV tx where tokens were staked
  tokens_staked BIGINT,
  token_symbol VARCHAR(20),
  staked_at TIMESTAMPTZ,

  -- KYC
  kyc_status kyc_status_enum DEFAULT 'PENDING',
  kyc_verified_at TIMESTAMPTZ,
  kyc_document_ids TEXT[], -- references to uploaded documents

  -- PSC (Person with Significant Control)
  is_psc BOOLEAN DEFAULT FALSE,
  psc_nature_of_control TEXT[], -- e.g., ['ownership-of-shares-75-to-100-percent']

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  updated_by UUID
);

-- Indexes for confirmation statement queries
CREATE INDEX idx_registry_company ON shareholder_registry(company_id);
CREATE INDEX idx_registry_kyc ON shareholder_registry(kyc_status);
CREATE INDEX idx_registry_psc ON shareholder_registry(is_psc) WHERE is_psc = TRUE;

-- ============================================
-- BENEFICIAL INTEREST (TOKENS)
-- ============================================

-- Tracks on-chain token holdings (beneficial interest, not title)
CREATE TABLE IF NOT EXISTS beneficial_interest (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- On-chain representation
  token_symbol VARCHAR(20) NOT NULL,
  wallet_address VARCHAR(100) NOT NULL,
  blockchain VARCHAR(10) NOT NULL DEFAULT 'BSV', -- BSV, ETH, SOL
  amount BIGINT NOT NULL,

  -- Last known balance (synced from chain)
  last_sync_at TIMESTAMPTZ DEFAULT NOW(),
  last_sync_tx VARCHAR(100),

  -- Staking status
  staked_for_equity BOOLEAN DEFAULT FALSE,
  stake_tx VARCHAR(100),
  staked_at TIMESTAMPTZ,

  -- Link to registry (if staked and KYC approved)
  registry_entry_id UUID REFERENCES shareholder_registry(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_beneficial_company ON beneficial_interest(company_id);
CREATE INDEX idx_beneficial_wallet ON beneficial_interest(wallet_address);
CREATE INDEX idx_beneficial_staked ON beneficial_interest(staked_for_equity) WHERE staked_for_equity = TRUE;

-- ============================================
-- PRODUCT REVENUE SHARE (NOT EQUITY)
-- ============================================

-- For product tokens like $bWriter that represent revenue share, not equity
CREATE TABLE IF NOT EXISTS product_revenue_share (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name VARCHAR(100) NOT NULL, -- bWriter, bMail, etc.
  parent_company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Token for revenue participation
  token_symbol VARCHAR(20) NOT NULL,

  -- Revenue share terms
  revenue_pool_percent DECIMAL(5,2) NOT NULL, -- e.g., 20.00 for 20%
  distribution_frequency VARCHAR(20) DEFAULT 'QUARTERLY', -- MONTHLY, QUARTERLY, ANNUALLY

  -- Explicitly NOT equity
  is_equity BOOLEAN DEFAULT FALSE CHECK (is_equity = FALSE),

  -- Description for legal clarity
  description TEXT DEFAULT 'This token represents contractual revenue share rights, not equity ownership.',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_product_revenue_company ON product_revenue_share(parent_company_id);

-- ============================================
-- STAKE REQUESTS (WORKFLOW)
-- ============================================

CREATE TYPE stake_status AS ENUM ('PENDING_KYC', 'KYC_SUBMITTED', 'KYC_APPROVED', 'KYC_REJECTED', 'COMPLETED', 'CANCELLED');

-- Tracks stake requests (token → equity)
CREATE TABLE IF NOT EXISTS stake_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),

  -- Token being staked
  token_symbol VARCHAR(20) NOT NULL,
  wallet_address VARCHAR(100) NOT NULL,
  tokens_to_stake BIGINT NOT NULL,
  stake_tx VARCHAR(100), -- BSV tx locking tokens

  -- Requestor
  user_id UUID, -- if logged in
  email VARCHAR(255) NOT NULL,

  -- Status
  status stake_status DEFAULT 'PENDING_KYC',

  -- KYC data (encrypted in production)
  kyc_full_name VARCHAR(255),
  kyc_dob DATE,
  kyc_address JSONB,
  kyc_document_ids TEXT[],
  kyc_submitted_at TIMESTAMPTZ,
  kyc_reviewed_at TIMESTAMPTZ,
  kyc_reviewed_by UUID,
  kyc_rejection_reason TEXT,

  -- Result
  registry_entry_id UUID REFERENCES shareholder_registry(id),
  completed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_stake_requests_status ON stake_requests(status);
CREATE INDEX idx_stake_requests_wallet ON stake_requests(wallet_address);

-- ============================================
-- CONFIRMATION STATEMENT HISTORY
-- ============================================

-- Track filed confirmation statements
CREATE TABLE IF NOT EXISTS confirmation_statements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),

  -- Filing details
  statement_date DATE NOT NULL, -- "made up to" date
  filed_date DATE,
  companies_house_submission_id VARCHAR(50),

  -- Snapshot of data at filing time
  shareholders_snapshot JSONB, -- copy of registry at filing
  psc_snapshot JSONB, -- PSC data at filing

  -- Status
  status VARCHAR(20) DEFAULT 'DRAFT', -- DRAFT, SUBMITTED, ACCEPTED, REJECTED

  created_at TIMESTAMPTZ DEFAULT NOW(),
  filed_by UUID
);

CREATE INDEX idx_confirmation_company ON confirmation_statements(company_id);

-- ============================================
-- SEED DATA: INITIAL COMPANY STRUCTURE
-- ============================================

-- Insert b0ase Ltd (holding company)
INSERT INTO companies (id, name, type, token_symbol)
VALUES (
  'b0ase-ltd-0001',
  'b0ase Ltd',
  'HOLDING',
  '$BOASE'
) ON CONFLICT DO NOTHING;

-- Insert Ninja Punk Girls Ltd (subsidiary)
INSERT INTO companies (id, name, type, parent_id, parent_ownership_percent, token_symbol)
VALUES (
  'npg-ltd-0001',
  'Ninja Punk Girls Ltd',
  'SUBSIDIARY',
  'b0ase-ltd-0001',
  85.35,
  '$NPG'
) ON CONFLICT DO NOTHING;

-- Insert Bitcoin Corporation Ltd (subsidiary)
INSERT INTO companies (id, name, type, parent_id, parent_ownership_percent, token_symbol)
VALUES (
  'bitcoin-corp-0001',
  'The Bitcoin Corporation Ltd',
  'SUBSIDIARY',
  'b0ase-ltd-0001',
  99.00,
  '$bCorp'
) ON CONFLICT DO NOTHING;

-- Insert product revenue shares (NOT companies)
INSERT INTO product_revenue_share (product_name, parent_company_id, token_symbol, revenue_pool_percent)
VALUES
  ('bWriter', 'bitcoin-corp-0001', '$bWriter', 20.00),
  ('bMail', 'bitcoin-corp-0001', '$bMail', 20.00),
  ('bSheets', 'bitcoin-corp-0001', '$bSheets', 20.00),
  ('bOS', 'bitcoin-corp-0001', '$bOS', 20.00),
  ('bDrive', 'bitcoin-corp-0001', '$bDrive', 20.00),
  ('MoneyButton', 'bitcoin-corp-0001', '$MONEYBUTTON', 20.00)
ON CONFLICT DO NOTHING;

-- ============================================
-- VIEWS FOR COMMON QUERIES
-- ============================================

-- View: Full company hierarchy with ownership chain
CREATE OR REPLACE VIEW company_hierarchy AS
WITH RECURSIVE hierarchy AS (
  -- Base case: top-level companies
  SELECT
    id,
    name,
    type,
    token_symbol,
    parent_id,
    parent_ownership_percent,
    1 as depth,
    ARRAY[name] as path
  FROM companies
  WHERE parent_id IS NULL

  UNION ALL

  -- Recursive case: subsidiaries
  SELECT
    c.id,
    c.name,
    c.type,
    c.token_symbol,
    c.parent_id,
    c.parent_ownership_percent,
    h.depth + 1,
    h.path || c.name
  FROM companies c
  JOIN hierarchy h ON c.parent_id = h.id
)
SELECT * FROM hierarchy;

-- View: Cap table with beneficial interest + registry status
CREATE OR REPLACE VIEW cap_table_view AS
SELECT
  c.id as company_id,
  c.name as company_name,
  c.token_symbol,
  sr.legal_name as shareholder_name,
  sr.shares,
  sr.share_class,
  sr.is_psc,
  sr.kyc_status,
  bi.wallet_address,
  bi.amount as token_balance,
  bi.staked_for_equity,
  CASE
    WHEN sr.id IS NOT NULL THEN 'REGISTERED'
    WHEN bi.staked_for_equity THEN 'PENDING_REGISTRATION'
    ELSE 'BENEFICIAL_ONLY'
  END as ownership_status
FROM companies c
LEFT JOIN shareholder_registry sr ON sr.company_id = c.id
LEFT JOIN beneficial_interest bi ON bi.registry_entry_id = sr.id
ORDER BY c.name, sr.shares DESC NULLS LAST;

-- View: Confirmation statement data (ready for filing)
CREATE OR REPLACE VIEW confirmation_statement_data AS
SELECT
  c.id as company_id,
  c.name as company_name,
  c.company_number,
  sr.legal_name,
  sr.legal_address_line1,
  sr.legal_address_city,
  sr.legal_address_postal_code,
  sr.legal_address_country,
  sr.shares,
  sr.share_class,
  sr.is_psc,
  sr.psc_nature_of_control
FROM companies c
JOIN shareholder_registry sr ON sr.company_id = c.id
WHERE sr.kyc_status = 'APPROVED'
ORDER BY c.name, sr.shares DESC;
