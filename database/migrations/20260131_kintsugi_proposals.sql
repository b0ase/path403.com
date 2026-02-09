-- Kintsugi Proposals
-- Stores accepted proposals from Kintsugi conversations
-- Can later be converted to formal contracts/work items

CREATE TABLE IF NOT EXISTS kintsugi_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Link to chat session
  session_id TEXT NOT NULL,
  session_code TEXT,

  -- Contact info
  email TEXT,
  wallet_address TEXT,

  -- Project reference (if contributing to existing)
  project_slug TEXT,
  github_issue_number INT,
  github_issue_url TEXT,

  -- Proposal details
  proposal_type TEXT NOT NULL DEFAULT 'new_project', -- new_project, developer, investor, feedback
  title TEXT NOT NULL,
  description TEXT,

  -- Negotiated terms (stored as JSON for flexibility)
  terms JSONB DEFAULT '{}',
  -- e.g., { "price_gbp": 500, "equity_percent": 0.5, "payment_type": "hybrid", "timeline": "2 weeks" }

  -- Status
  status TEXT NOT NULL DEFAULT 'pending', -- pending, contacted, in_progress, completed, cancelled

  -- Admin notes
  notes TEXT,

  -- Converted to formal record
  converted_to_type TEXT, -- work_item, contract, investment
  converted_to_id UUID,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_kintsugi_proposals_session ON kintsugi_proposals(session_id);
CREATE INDEX idx_kintsugi_proposals_project ON kintsugi_proposals(project_slug);
CREATE INDEX idx_kintsugi_proposals_status ON kintsugi_proposals(status);
CREATE INDEX idx_kintsugi_proposals_email ON kintsugi_proposals(email);
