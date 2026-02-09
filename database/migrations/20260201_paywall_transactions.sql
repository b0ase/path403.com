-- Paywall Transactions Table
-- Tracks all site access payments and token issuances

CREATE TABLE IF NOT EXISTS paywall_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    handle TEXT NOT NULL,
    amount_usd DECIMAL(10, 4) NOT NULL,
    tokens_issued INTEGER NOT NULL DEFAULT 1,
    token_symbol TEXT NOT NULL DEFAULT 'BOASE',
    transaction_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for querying by handle
CREATE INDEX IF NOT EXISTS idx_paywall_transactions_handle ON paywall_transactions(handle);

-- Index for querying by transaction_id
CREATE INDEX IF NOT EXISTS idx_paywall_transactions_tx_id ON paywall_transactions(transaction_id);

-- Index for querying by date
CREATE INDEX IF NOT EXISTS idx_paywall_transactions_created_at ON paywall_transactions(created_at);

-- Enable RLS
ALTER TABLE paywall_transactions ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to view their own transactions
CREATE POLICY "Users can view own paywall transactions" ON paywall_transactions
    FOR SELECT
    USING (
        handle = (
            SELECT raw_user_meta_data->>'handle'
            FROM auth.users
            WHERE id = auth.uid()
        )
    );

-- Policy: Service role can insert
CREATE POLICY "Service role can insert paywall transactions" ON paywall_transactions
    FOR INSERT
    WITH CHECK (true);

-- Comment on table
COMMENT ON TABLE paywall_transactions IS 'Tracks site access payments via HandCash and $BOASE token issuances';
