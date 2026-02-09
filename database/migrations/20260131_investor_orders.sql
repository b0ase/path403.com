-- Investor Orders Table
-- Tracks investment orders, payments, and token transfers

CREATE TABLE IF NOT EXISTS investor_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investor_email VARCHAR(255) NOT NULL,
    investor_wallet VARCHAR(255),
    token_symbol VARCHAR(50) NOT NULL,
    token_amount BIGINT NOT NULL,
    price_per_token DECIMAL(20, 10) NOT NULL,
    total_price_gbp DECIMAL(20, 2) NOT NULL,
    payment_chain VARCHAR(10) NOT NULL, -- bsv, eth, sol
    payment_address VARCHAR(255) NOT NULL,
    payment_amount_crypto DECIMAL(30, 18) NOT NULL,
    payment_currency VARCHAR(10) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    payment_txid VARCHAR(255),
    transfer_txid VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_investor_orders_email ON investor_orders(investor_email);
CREATE INDEX idx_investor_orders_status ON investor_orders(status);
CREATE INDEX idx_investor_orders_token ON investor_orders(token_symbol);
CREATE INDEX idx_investor_orders_created ON investor_orders(created_at DESC);

-- Update trigger
CREATE OR REPLACE FUNCTION update_investor_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER investor_orders_updated_at
    BEFORE UPDATE ON investor_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_investor_orders_updated_at();

-- Token member registry (if not exists)
CREATE TABLE IF NOT EXISTS token_member_registry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_id VARCHAR(255) NOT NULL,
    token_symbol VARCHAR(50) NOT NULL,
    member_email VARCHAR(255) NOT NULL,
    wallet_address VARCHAR(255),
    allocation_amount BIGINT NOT NULL,
    ownership_percent DECIMAL(10, 6) NOT NULL,
    purchase_price_gbp DECIMAL(20, 2),
    payment_txid VARCHAR(255),
    transfer_txid VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending',
    acquired_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_token_member_registry_token ON token_member_registry(token_symbol);
CREATE INDEX idx_token_member_registry_member ON token_member_registry(member_email);
CREATE INDEX idx_token_member_registry_wallet ON token_member_registry(wallet_address);
