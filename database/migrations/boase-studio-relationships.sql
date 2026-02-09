-- $BOASE Studio Token Relationships
-- Formalizes that $BOASE (studio) owns 50% of each product token
-- Created: 2026-01-31

-- =====================================================
-- 1. Add parent_token column to venture_tokens
-- =====================================================
-- This links product tokens to their parent studio token

ALTER TABLE venture_tokens
ADD COLUMN IF NOT EXISTS parent_token VARCHAR(20);

ALTER TABLE venture_tokens
ADD COLUMN IF NOT EXISTS studio_ownership_pct DECIMAL(5,2) DEFAULT 0;

COMMENT ON COLUMN venture_tokens.parent_token IS 'Parent studio token (e.g., BOASE for product tokens)';
COMMENT ON COLUMN venture_tokens.studio_ownership_pct IS 'Percentage of this token owned by the parent studio';

-- =====================================================
-- 2. Ensure $BOASE exists in venture_tokens
-- =====================================================

INSERT INTO venture_tokens (
    ticker,
    name,
    description,
    total_supply,
    price_usd,
    price_gbp,
    blockchain,
    token_id,
    is_deployed,
    tokens_sold,
    tokens_available,
    portfolio_slug,
    is_active,
    is_public,
    parent_token,
    studio_ownership_pct
) VALUES (
    'BOASE',
    'b0ase Ventures',
    'Studio token representing ownership in b0ase venture studio. Holders gain exposure to ALL products through the studio''s 50% stake in each product token.',
    1000000000,  -- 1 billion tokens
    0.001,       -- $0.001 per token = $1000 for 0.1%
    0.0008,      -- ~£999 for 0.1%
    'BSV',
    'c3bf2d7a4519ddc633bc91bbfd1022db1a77da71e16bb582b0acc0d8f7836161_1',  -- Live BSV21 token
    true,        -- Already deployed on-chain
    0,
    1000000000,
    'boase',
    true,
    true,
    NULL,        -- No parent - this IS the studio token
    0            -- Studio doesn't own itself
) ON CONFLICT (ticker) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    token_id = EXCLUDED.token_id,
    is_deployed = true,
    is_active = true,
    is_public = true,
    updated_at = NOW();

-- =====================================================
-- 3. Link product tokens to $BOASE studio
-- =====================================================

-- Link KINTSUGI to BOASE
UPDATE venture_tokens
SET
    parent_token = 'BOASE',
    studio_ownership_pct = 50.0,
    updated_at = NOW()
WHERE ticker = 'KINTSUGI';

-- Link any other existing product tokens
UPDATE venture_tokens
SET
    parent_token = 'BOASE',
    studio_ownership_pct = 50.0,
    updated_at = NOW()
WHERE ticker IN ('BWRITER', 'MBUTTON', 'MONEYBUTTON', 'SCROLLPAY', 'DEVMKT')
  AND (parent_token IS NULL OR parent_token = '');

-- =====================================================
-- 4. Create $BOASE cap table entries
-- =====================================================

-- Founder allocation (60%)
INSERT INTO token_member_registry (
    token_symbol,
    member_name,
    email,
    wallet_address,
    allocation_tokens,
    allocation_percentage,
    status,
    is_public,
    notes
) VALUES (
    'BOASE',
    'Richard Boase (Founder)',
    'richardwboase@gmail.com',
    NULL,
    600000000,
    60.0,
    'confirmed',
    true,
    'Founder allocation - b0ase venture studio'
) ON CONFLICT DO NOTHING;

-- Investor Pool (40% available)
INSERT INTO token_member_registry (
    token_symbol,
    member_name,
    email,
    wallet_address,
    allocation_tokens,
    allocation_percentage,
    status,
    is_public,
    notes
) VALUES (
    'BOASE',
    'Investor Pool (Available)',
    NULL,
    NULL,
    400000000,
    40.0,
    'pending',
    true,
    'Available for investment. £999 = 0.1% (1M tokens), £4999 = 0.5%, £9999 = 1.0%'
) ON CONFLICT DO NOTHING;

-- =====================================================
-- 5. Create view for studio portfolio summary
-- =====================================================

CREATE OR REPLACE VIEW studio_portfolio_summary AS
SELECT
    vt.ticker AS product_token,
    vt.name AS product_name,
    vt.parent_token AS studio_token,
    vt.studio_ownership_pct,
    vt.total_supply,
    vt.is_deployed,
    vt.is_active,
    (SELECT SUM(tmr.allocation_tokens)
     FROM token_member_registry tmr
     WHERE tmr.token_symbol = vt.ticker
       AND tmr.member_name LIKE '%b0ase%'
       AND tmr.status = 'confirmed') AS studio_tokens_held,
    (SELECT SUM(tmr.allocation_percentage)
     FROM token_member_registry tmr
     WHERE tmr.token_symbol = vt.ticker
       AND tmr.member_name LIKE '%b0ase%'
       AND tmr.status = 'confirmed') AS studio_pct_held
FROM venture_tokens vt
WHERE vt.parent_token IS NOT NULL
ORDER BY vt.ticker;

COMMENT ON VIEW studio_portfolio_summary IS 'Shows all product tokens and b0ase studio ownership percentage';

-- =====================================================
-- 6. Create index for parent token lookups
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_venture_tokens_parent
ON venture_tokens(parent_token);

-- =====================================================
-- 7. Summary of structure
-- =====================================================

/*
STUDIO TOKEN STRUCTURE:

$BOASE (Studio Token)
├── 60% Founder (Richard Boase)
└── 40% Investor Pool

PRODUCT TOKENS (b0ase owns 50% of each):

$KINTSUGI (AI Startup Engine)
├── 50% b0ase Ventures ──► flows to $BOASE holders
├── 40% Founder (Richard Boase)
└── 10% Investor Pool

$BWRITER (Writing Platform)
├── 50% b0ase Ventures ──► flows to $BOASE holders
├── 40% Founder
└── 10% Investor Pool

... and all future products follow same structure

VALUE FLOW:
Product Revenue → 80% to token holders
  → b0ase gets 50% of that 80% = 40% of product revenue
  → b0ase distributes 80% to $BOASE holders
  → Net: $BOASE holders get ~32% of each product's revenue
*/
