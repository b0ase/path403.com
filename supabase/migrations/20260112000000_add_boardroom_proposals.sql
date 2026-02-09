-- Add proposals and voting tables for boardroom governance

-- Create proposals table
CREATE TABLE IF NOT EXISTS public.boardroom_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id TEXT REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  proposer_wallet TEXT NOT NULL,
  proposer_name TEXT,
  -- Voting configuration
  voting_type TEXT NOT NULL DEFAULT 'simple', -- 'simple' (yes/no), 'multiple_choice', 'ranked'
  options JSONB DEFAULT '["Yes", "No"]'::jsonb,
  -- Token-weighted voting
  token_weighted BOOLEAN DEFAULT true, -- If true, votes are weighted by token balance
  required_token TEXT, -- Token required to vote (null = any token holder)
  min_tokens_to_propose INTEGER DEFAULT 1, -- Minimum tokens to create proposal
  min_tokens_to_vote INTEGER DEFAULT 1, -- Minimum tokens to vote
  -- Timing
  starts_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  -- Status
  status TEXT NOT NULL DEFAULT 'active', -- 'draft', 'active', 'passed', 'rejected', 'cancelled'
  -- Results (calculated on close)
  result JSONB,
  total_votes INTEGER DEFAULT 0,
  total_voting_power NUMERIC DEFAULT 0,
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create votes table
CREATE TABLE IF NOT EXISTS public.boardroom_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID REFERENCES public.boardroom_proposals(id) ON DELETE CASCADE,
  voter_wallet TEXT NOT NULL,
  voter_name TEXT,
  -- Vote details
  choice INTEGER NOT NULL, -- Index of the chosen option (0 = first option)
  voting_power NUMERIC NOT NULL DEFAULT 1, -- Token balance at time of vote
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  -- Ensure one vote per wallet per proposal
  UNIQUE(proposal_id, voter_wallet)
);

-- Create vote delegation table (optional, for future use)
CREATE TABLE IF NOT EXISTS public.boardroom_delegations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delegator_wallet TEXT NOT NULL,
  delegate_wallet TEXT NOT NULL,
  room_id TEXT REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  -- Can delegate for specific token or all
  token_id TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  revoked_at TIMESTAMP WITH TIME ZONE,
  -- Ensure one active delegation per delegator per room
  UNIQUE(delegator_wallet, room_id, token_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_proposals_room_id ON public.boardroom_proposals(room_id);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON public.boardroom_proposals(status);
CREATE INDEX IF NOT EXISTS idx_proposals_ends_at ON public.boardroom_proposals(ends_at);
CREATE INDEX IF NOT EXISTS idx_votes_proposal_id ON public.boardroom_votes(proposal_id);
CREATE INDEX IF NOT EXISTS idx_votes_voter_wallet ON public.boardroom_votes(voter_wallet);

-- Enable RLS
ALTER TABLE public.boardroom_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boardroom_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boardroom_delegations ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Proposals: Viewable by everyone
CREATE POLICY "Proposals viewable by everyone"
  ON public.boardroom_proposals FOR SELECT
  USING (true);

CREATE POLICY "Proposals manageable by service role"
  ON public.boardroom_proposals FOR ALL
  USING (auth.role() = 'service_role');

-- Votes: Viewable by everyone (transparency)
CREATE POLICY "Votes viewable by everyone"
  ON public.boardroom_votes FOR SELECT
  USING (true);

CREATE POLICY "Votes manageable by service role"
  ON public.boardroom_votes FOR ALL
  USING (auth.role() = 'service_role');

-- Delegations: Viewable by everyone
CREATE POLICY "Delegations viewable by everyone"
  ON public.boardroom_delegations FOR SELECT
  USING (true);

CREATE POLICY "Delegations manageable by service role"
  ON public.boardroom_delegations FOR ALL
  USING (auth.role() = 'service_role');

-- Comments
COMMENT ON TABLE public.boardroom_proposals IS 'Governance proposals for boardroom voting';
COMMENT ON TABLE public.boardroom_votes IS 'Individual votes on proposals, can be token-weighted';
COMMENT ON TABLE public.boardroom_delegations IS 'Vote delegation from one wallet to another';
COMMENT ON COLUMN public.boardroom_proposals.total_voting_power IS 'Total voting power cast (sum of voter token balances)';
