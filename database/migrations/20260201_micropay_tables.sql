-- Micropayment System Tables
-- Every button click costs 1¢ and earns 1 $BOASE token

-- Transaction log for all micropayments
CREATE TABLE IF NOT EXISTS micropay_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    handle TEXT NOT NULL,
    amount_usd DECIMAL(10, 4) NOT NULL DEFAULT 0.01,
    tokens_earned INTEGER NOT NULL DEFAULT 1,
    transaction_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_micropay_transactions_handle ON micropay_transactions(handle);
CREATE INDEX IF NOT EXISTS idx_micropay_transactions_created_at ON micropay_transactions(created_at);

-- User token balances
CREATE TABLE IF NOT EXISTS user_token_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    handle TEXT NOT NULL,
    token_symbol TEXT NOT NULL DEFAULT 'BOASE',
    balance BIGINT NOT NULL DEFAULT 0,
    staked BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(handle, token_symbol)
);

CREATE INDEX IF NOT EXISTS idx_user_token_balances_handle ON user_token_balances(handle);

-- Enable RLS
ALTER TABLE micropay_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_token_balances ENABLE ROW LEVEL SECURITY;

-- Policies for micropay_transactions
CREATE POLICY "Users can view own micropay transactions" ON micropay_transactions
    FOR SELECT USING (handle = current_setting('app.current_handle', true));

CREATE POLICY "Service role can insert micropay transactions" ON micropay_transactions
    FOR INSERT WITH CHECK (true);

-- Policies for user_token_balances
CREATE POLICY "Users can view own token balances" ON user_token_balances
    FOR SELECT USING (handle = current_setting('app.current_handle', true));

CREATE POLICY "Service role can manage token balances" ON user_token_balances
    FOR ALL WITH CHECK (true);

-- Comments
COMMENT ON TABLE micropay_transactions IS 'Log of all micropayment transactions - 1¢ per click';
COMMENT ON TABLE user_token_balances IS 'User $BOASE token balances - earned from micropayments';
