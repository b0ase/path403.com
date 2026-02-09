-- $KINTSUGI Token Setup
-- Product token for the Kintsugi AI Startup Engine
-- Created: 2026-01-31

-- =====================================================
-- 1. Create $KINTSUGI venture token
-- =====================================================

INSERT INTO venture_tokens (
    ticker,
    name,
    description,
    total_supply,
    price_usd,
    price_gbp,
    blockchain,
    is_deployed,
    tokens_sold,
    tokens_available,
    portfolio_slug,
    is_active,
    is_public
) VALUES (
    'KINTSUGI',
    'Kintsugi Engine',
    'AI that turns ideas into fundable startups. Generates token, website, social media, and KYC infrastructure for founders.',
    1000000000,  -- 1 billion tokens
    0.000001,    -- $0.000001 per token = $1000 for 1%
    0.0000008,   -- ~£0.0000008 per token = £999 for 1% (approx)
    'BSV',
    false,       -- Not deployed on-chain yet
    0,
    1000000000,
    'kintsugi',
    true,
    true
) ON CONFLICT (ticker) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    is_active = true,
    is_public = true,
    updated_at = NOW();

-- =====================================================
-- 2. Create initial cap table entries via token_member_registry
-- =====================================================

-- Insert founder allocation (40%)
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
    'KINTSUGI',
    'Richard Boase (Founder)',
    'richardwboase@gmail.com',
    NULL,
    400000000,
    40.0,
    'confirmed',
    true,
    'Founder allocation - Kintsugi Engine creator'
) ON CONFLICT DO NOTHING;

-- Insert b0ase studio allocation (50%)
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
    'KINTSUGI',
    'b0ase Ventures (Studio)',
    'studio@b0ase.com',
    NULL,
    500000000,
    50.0,
    'confirmed',
    true,
    'Studio allocation - flows to $BOASE token holders'
) ON CONFLICT DO NOTHING;

-- Insert investor pool allocation (10% - available for raise)
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
    'KINTSUGI',
    'Investor Pool (Available)',
    NULL,
    NULL,
    100000000,
    10.0,
    'pending',
    true,
    'Available for investment. £999 = 1% (10M tokens)'
) ON CONFLICT DO NOTHING;

-- =====================================================
-- 3. Create index for faster lookups
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_token_member_registry_symbol_status
ON token_member_registry(token_symbol, status);

-- =====================================================
-- 4. Comment for documentation
-- =====================================================

COMMENT ON TABLE venture_tokens IS 'Portfolio venture token definitions. Includes $KINTSUGI, $bWriter, etc.';
