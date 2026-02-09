-- Minting Contracts System - Database Schema
-- Created: 2026-01-18
--
-- This schema supports milestone-based token releases with pricing contracts,
-- legal agreements, and regulatory forms all inscribed on-chain.

-- ============================================================================
-- 1. PROJECT TYPE TEMPLATES
-- ============================================================================

CREATE TABLE IF NOT EXISTS project_type_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_type VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,

  -- Standard milestone structure for this project type
  standard_milestones JSONB NOT NULL,

  -- Typical parameters (for AI suggestions)
  typical_duration_days INTEGER,
  typical_funding_range JSONB,  -- {min: X, max: Y} in BSV
  typical_token_allocation JSONB,  -- Array of percentages

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE project_type_templates IS 'Templates for different project types (AI, software, marketing, etc.) with standard milestones';
COMMENT ON COLUMN project_type_templates.standard_milestones IS 'Array of milestone templates with deliverables, timelines, and funding';

-- ============================================================================
-- 2. MINTING CONTRACTS (Main Bundle)
-- ============================================================================

CREATE TABLE IF NOT EXISTS minting_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tokenized_repo_id UUID REFERENCES tokenized_repositories(id),
  unified_user_id UUID NOT NULL,

  -- Token basics
  token_symbol VARCHAR(10) NOT NULL,
  total_supply BIGINT NOT NULL,
  project_type VARCHAR(100) REFERENCES project_type_templates(project_type),

  -- Inscription IDs for each contract component
  token_deploy_txid VARCHAR(100),           -- BSV-21 token deploy
  pricing_contract_txid VARCHAR(100),       -- Pricing curve contract
  release_schedule_txid VARCHAR(100),       -- Milestone tranches
  legal_contracts_txids JSONB,              -- Array of legal contract TXIDs
  regulatory_forms_txids JSONB,             -- Array of form TXIDs
  metadata_txid VARCHAR(100),               -- Final metadata inscription

  -- Contract bundle integrity
  merkle_root VARCHAR(100),
  integrity_hash VARCHAR(100),
  all_inscriptions JSONB,  -- Complete array of all TXIDs for verification

  -- Status
  status VARCHAR(50) DEFAULT 'draft',  -- draft, minting, minted, active, completed
  minted_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE minting_contracts IS 'Complete minting contract bundles with all inscriptions';
COMMENT ON COLUMN minting_contracts.status IS 'draft=being created, minting=inscribing, minted=on-chain, active=sales running, completed=all milestones done';

CREATE INDEX idx_minting_contracts_repo ON minting_contracts(tokenized_repo_id);
CREATE INDEX idx_minting_contracts_user ON minting_contracts(unified_user_id);
CREATE INDEX idx_minting_contracts_status ON minting_contracts(status);

-- ============================================================================
-- 3. PRICING CONTRACTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS pricing_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  minting_contract_id UUID REFERENCES minting_contracts(id) ON DELETE CASCADE,

  contract_type VARCHAR(50) NOT NULL,  -- bonding_curve, linear, fixed, dutch_auction
  formula TEXT,  -- Human-readable formula
  parameters JSONB NOT NULL,  -- Curve parameters (basePrice, reserveRatio, exponent, etc.)

  -- Legal terms
  legal_terms JSONB,
  legal_text TEXT,  -- Full legal contract text

  inscription_txid VARCHAR(100),

  created_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE pricing_contracts IS 'Pricing models (bonding curves, etc.) inscribed as contracts';
COMMENT ON COLUMN pricing_contracts.contract_type IS 'bonding_curve, linear, fixed_price, dutch_auction, custom';

-- ============================================================================
-- 4. PROJECT MILESTONES
-- ============================================================================

CREATE TABLE IF NOT EXISTS project_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  minting_contract_id UUID REFERENCES minting_contracts(id) ON DELETE CASCADE,

  phase INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,

  -- Token allocation
  token_tranche BIGINT NOT NULL,      -- How many tokens released for this milestone
  funding_goal DECIMAL(20, 8),        -- BSV to raise

  -- Timeline
  start_date DATE,
  deadline DATE,
  grace_period INTEGER DEFAULT 30,    -- Days past deadline before consequences

  -- Dependencies (must complete these milestones first)
  depends_on_milestone_ids UUID[],

  -- Deliverables (what must be completed)
  deliverables JSONB NOT NULL,        -- Array of deliverable descriptions
  deliverable_details TEXT,           -- Detailed explanation

  -- Release conditions (how to verify completion)
  release_conditions JSONB,           -- {type: 'deliverables_and_vote', threshold: 0.66, ...}
  proof_requirements JSONB,           -- What proof is needed {types: ['github_commit', 'demo_url']}

  -- Refund policy
  refund_policy JSONB,                -- What happens if milestone fails

  -- Status tracking
  status VARCHAR(50) DEFAULT 'pending',  -- pending, in_progress, completed, failed, disputed
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  failed_at TIMESTAMP,

  -- Proof submission
  proof_submitted JSONB,              -- Actual proof when completed
  proof_submitted_at TIMESTAMP,

  -- Community voting (if required)
  vote_required BOOLEAN DEFAULT false,
  vote_threshold DECIMAL(3, 2),       -- e.g., 0.66 for 66%
  community_vote_result JSONB,        -- Vote results if applicable
  voted_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE project_milestones IS 'Individual milestones with deliverables, timelines, and completion tracking';
COMMENT ON COLUMN project_milestones.status IS 'pending, in_progress, completed, failed, disputed';

CREATE INDEX idx_milestones_contract ON project_milestones(minting_contract_id);
CREATE INDEX idx_milestones_status ON project_milestones(status);
CREATE INDEX idx_milestones_phase ON project_milestones(minting_contract_id, phase);

-- ============================================================================
-- 5. TOKEN TRANCHES
-- ============================================================================

CREATE TABLE IF NOT EXISTS token_tranches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  minting_contract_id UUID REFERENCES minting_contracts(id) ON DELETE CASCADE,
  milestone_id UUID REFERENCES project_milestones(id) ON DELETE CASCADE,

  -- Token allocation
  tokens_allocated BIGINT NOT NULL,
  tokens_sold BIGINT DEFAULT 0,
  tokens_remaining BIGINT,

  -- Funding
  funds_raised DECIMAL(20, 8) DEFAULT 0,
  funding_goal DECIMAL(20, 8),

  -- Status
  status VARCHAR(50) DEFAULT 'locked',  -- locked, active, completed, failed
  unlocked_at TIMESTAMP,
  locked_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE token_tranches IS 'Tracks token releases and sales per milestone';
COMMENT ON COLUMN token_tranches.status IS 'locked (not yet available), active (selling), completed (sold out), failed (milestone failed)';

CREATE INDEX idx_tranches_contract ON token_tranches(minting_contract_id);
CREATE INDEX idx_tranches_milestone ON token_tranches(milestone_id);
CREATE INDEX idx_tranches_status ON token_tranches(status);

-- ============================================================================
-- 6. LEGAL CONTRACTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS legal_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  minting_contract_id UUID REFERENCES minting_contracts(id) ON DELETE CASCADE,

  contract_type VARCHAR(100) NOT NULL,  -- terms_of_issuance, service_agreement, nda, ip_transfer, etc.
  name VARCHAR(255) NOT NULL,
  template_id VARCHAR(100),             -- If based on template

  content TEXT NOT NULL,                -- Full legal text
  content_hash VARCHAR(100),            -- SHA256 hash for integrity

  effective_date DATE,
  expiration_date DATE,

  parties JSONB,  -- {developer: '...', tokenHolders: '...'}
  terms JSONB,    -- Structured key terms

  inscription_txid VARCHAR(100),

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE legal_contracts IS 'Individual legal contract inscriptions (ToS, agreements, NDAs, etc.)';
COMMENT ON COLUMN legal_contracts.contract_type IS 'terms_of_issuance, service_agreement, nda, ip_transfer, milestone_agreement, etc.';

CREATE INDEX idx_legal_contracts_minting ON legal_contracts(minting_contract_id);
CREATE INDEX idx_legal_contracts_type ON legal_contracts(contract_type);

-- ============================================================================
-- 7. REGULATORY FORMS
-- ============================================================================

CREATE TABLE IF NOT EXISTS regulatory_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  minting_contract_id UUID REFERENCES minting_contracts(id) ON DELETE CASCADE,

  form_type VARCHAR(50) NOT NULL,       -- J30, SH01, etc.
  jurisdiction VARCHAR(100),            -- Wyoming, Delaware, etc.
  filing_date DATE,

  form_data JSONB NOT NULL,             -- Complete form data
  form_hash VARCHAR(100),               -- SHA256 hash

  inscription_txid VARCHAR(100),

  filed_with VARCHAR(255),              -- Which authority
  confirmation_number VARCHAR(100),

  created_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE regulatory_forms IS 'Regulatory compliance forms (J30, SH01, etc.) inscribed on-chain';

CREATE INDEX idx_regulatory_forms_minting ON regulatory_forms(minting_contract_id);
CREATE INDEX idx_regulatory_forms_type ON regulatory_forms(form_type);

-- ============================================================================
-- 8. TOKEN SALES (Purchase tracking)
-- ============================================================================

CREATE TABLE IF NOT EXISTS token_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  minting_contract_id UUID REFERENCES minting_contracts(id),
  tranche_id UUID REFERENCES token_tranches(id),
  milestone_id UUID REFERENCES project_milestones(id),

  -- Buyer
  buyer_unified_user_id UUID,
  buyer_address VARCHAR(100),  -- BSV address

  -- Sale details
  tokens_purchased BIGINT NOT NULL,
  price_per_token DECIMAL(20, 8) NOT NULL,
  total_price DECIMAL(20, 8) NOT NULL,

  -- Transaction
  payment_txid VARCHAR(100),
  transfer_txid VARCHAR(100),  -- Token transfer transaction

  purchased_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE token_sales IS 'Individual token purchases and transfers';

CREATE INDEX idx_token_sales_contract ON token_sales(minting_contract_id);
CREATE INDEX idx_token_sales_buyer ON token_sales(buyer_unified_user_id);
CREATE INDEX idx_token_sales_tranche ON token_sales(tranche_id);

-- ============================================================================
-- 9. UPDATE EXISTING TABLES
-- ============================================================================

-- Add minting contract reference to tokenized_repositories
ALTER TABLE tokenized_repositories
  ADD COLUMN IF NOT EXISTS minting_contract_id UUID REFERENCES minting_contracts(id),
  ADD COLUMN IF NOT EXISTS has_minting_contract BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS uses_milestone_release BOOLEAN DEFAULT false;

COMMENT ON COLUMN tokenized_repositories.has_minting_contract IS 'True if token uses advanced minting contract system';
COMMENT ON COLUMN tokenized_repositories.uses_milestone_release IS 'True if token uses milestone-based tranche releases';

-- ============================================================================
-- 10. SEED DATA - PROJECT TYPE TEMPLATES
-- ============================================================================

INSERT INTO project_type_templates (project_type, name, description, standard_milestones, typical_duration_days, typical_funding_range, typical_token_allocation)
VALUES
(
  'ai_content_engine',
  'AI-Powered Content Business',
  'Automated content creation, publishing, and monetization infrastructure',
  '[
    {
      "phase": 1,
      "name": "Research & Niche Selection",
      "typicalDuration": 30,
      "typicalFunding": 5,
      "typicalTokens": 0.10,
      "deliverables": [
        "Niche analysis report",
        "Keyword research (500+ keywords)",
        "Competitor analysis",
        "Content strategy document"
      ]
    },
    {
      "phase": 2,
      "name": "Content Stack Setup",
      "typicalDuration": 45,
      "typicalFunding": 15,
      "typicalTokens": 0.20,
      "deliverables": [
        "WordPress/Ghost site deployed",
        "AI content generation pipeline",
        "Publishing automation",
        "50+ articles published"
      ]
    },
    {
      "phase": 3,
      "name": "Monetization Integration",
      "typicalDuration": 30,
      "typicalFunding": 10,
      "typicalTokens": 0.15,
      "deliverables": [
        "Ad network integration (AdSense/Mediavine)",
        "Affiliate program setup",
        "Email marketing funnel",
        "Analytics dashboard"
      ]
    },
    {
      "phase": 4,
      "name": "Traffic & Growth",
      "typicalDuration": 90,
      "typicalFunding": 20,
      "typicalTokens": 0.30,
      "deliverables": [
        "10,000+ monthly visitors",
        "SEO optimization complete",
        "Social media channels active",
        "First $1000 revenue generated"
      ]
    },
    {
      "phase": 5,
      "name": "Scale & Optimization",
      "typicalDuration": 90,
      "typicalFunding": 25,
      "typicalTokens": 0.25,
      "deliverables": [
        "50,000+ monthly visitors",
        "Revenue exceeds costs",
        "Additional monetization channels",
        "Content production at 100+ articles/month"
      ]
    }
  ]'::jsonb,
  285,
  '{"min": 50, "max": 100}'::jsonb,
  '[0.10, 0.20, 0.15, 0.30, 0.25]'::jsonb
),
(
  'software_development',
  'Custom Software Development',
  'Build custom applications from requirements to production deployment',
  '[
    {
      "phase": 1,
      "name": "Requirements & Architecture",
      "typicalDuration": 30,
      "typicalFunding": 10,
      "typicalTokens": 0.10,
      "deliverables": [
        "Requirements specification document",
        "System architecture design",
        "Database schema design",
        "API documentation",
        "Technology stack decision"
      ]
    },
    {
      "phase": 2,
      "name": "MVP Development",
      "typicalDuration": 90,
      "typicalFunding": 30,
      "typicalTokens": 0.25,
      "deliverables": [
        "Core functionality implemented",
        "Basic UI/UX complete",
        "Unit tests (>70% coverage)",
        "Development deployment",
        "Internal testing complete"
      ]
    },
    {
      "phase": 3,
      "name": "Beta Testing & Refinement",
      "typicalDuration": 45,
      "typicalFunding": 15,
      "typicalTokens": 0.15,
      "deliverables": [
        "Beta deployment with 50+ users",
        "Bug fixes and improvements",
        "Performance optimization",
        "User feedback incorporated",
        "Documentation updated"
      ]
    },
    {
      "phase": 4,
      "name": "Production Launch",
      "typicalDuration": 30,
      "typicalFunding": 20,
      "typicalTokens": 0.25,
      "deliverables": [
        "Production deployment",
        "Monitoring and alerting setup",
        "Backup and disaster recovery",
        "Security audit passed",
        "User training materials"
      ]
    },
    {
      "phase": 5,
      "name": "Maintenance & Growth",
      "typicalDuration": 180,
      "typicalFunding": 25,
      "typicalTokens": 0.25,
      "deliverables": [
        "6 months of maintenance",
        "Feature enhancements",
        "Performance improvements",
        "Security updates",
        "Technical support"
      ]
    }
  ]'::jsonb,
  375,
  '{"min": 80, "max": 150}'::jsonb,
  '[0.10, 0.25, 0.15, 0.25, 0.25]'::jsonb
),
(
  'marketing_automation',
  'Marketing Automation System',
  'Lead generation, email campaigns, and conversion optimization',
  '[
    {
      "phase": 1,
      "name": "Strategy & Setup",
      "typicalDuration": 21,
      "typicalFunding": 8,
      "typicalTokens": 0.15,
      "deliverables": [
        "Marketing strategy document",
        "Customer journey mapping",
        "Tool stack selection",
        "Account setup (CRM, email, ads)",
        "Brand guidelines"
      ]
    },
    {
      "phase": 2,
      "name": "Content & Campaign Creation",
      "typicalDuration": 30,
      "typicalFunding": 15,
      "typicalTokens": 0.20,
      "deliverables": [
        "Email sequences (5+ campaigns)",
        "Landing pages (10+)",
        "Ad creatives (20+ variations)",
        "Lead magnets created",
        "Sales funnel built"
      ]
    },
    {
      "phase": 3,
      "name": "Automation Implementation",
      "typicalDuration": 30,
      "typicalFunding": 12,
      "typicalTokens": 0.20,
      "deliverables": [
        "Automation workflows active",
        "Lead scoring implemented",
        "Segmentation rules configured",
        "Integration with existing systems",
        "Testing complete"
      ]
    },
    {
      "phase": 4,
      "name": "Launch & Optimization",
      "typicalDuration": 60,
      "typicalFunding": 20,
      "typicalTokens": 0.25,
      "deliverables": [
        "Campaigns live and running",
        "1000+ leads generated",
        "A/B testing results",
        "Conversion rate optimization",
        "ROI tracking dashboard"
      ]
    },
    {
      "phase": 5,
      "name": "Scale & Performance",
      "typicalDuration": 90,
      "typicalFunding": 20,
      "typicalTokens": 0.20,
      "deliverables": [
        "5000+ leads generated",
        "Positive ROI achieved",
        "Additional channels added",
        "Advanced segmentation",
        "Reporting and analytics refined"
      ]
    }
  ]'::jsonb,
  231,
  '{"min": 60, "max": 120}'::jsonb,
  '[0.15, 0.20, 0.20, 0.25, 0.20]'::jsonb
)
ON CONFLICT (project_type) DO NOTHING;

-- ============================================================================
-- COMPLETE
-- ============================================================================
