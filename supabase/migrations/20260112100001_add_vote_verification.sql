-- Add verification columns to boardroom votes
-- Stores on-chain verified token balance and verification timestamp

-- Add columns to votes table
ALTER TABLE public.boardroom_votes
  ADD COLUMN IF NOT EXISTS token_balance TEXT, -- Verified token balance at time of vote
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE; -- When balance was verified

-- Add index for verification queries
CREATE INDEX IF NOT EXISTS idx_votes_verified_at ON public.boardroom_votes(verified_at);

-- Comment on new columns
COMMENT ON COLUMN public.boardroom_votes.token_balance IS 'On-chain verified token balance at vote time';
COMMENT ON COLUMN public.boardroom_votes.verified_at IS 'Timestamp when token balance was verified on-chain';
