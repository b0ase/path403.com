# Minting Contracts Architecture

**Version:** 1.0
**Last Updated:** 2026-01-18
**Status:** PLANNED (0% implemented)
**Schema:** `docs/sql/minting_contracts_schema.sql` (not yet applied to Prisma)

---

## Overview

A comprehensive token minting system that inscribes **pricing contracts, milestone roadmaps, and legal agreements** directly into the blockchain at token creation. This creates transparent, immutable tokenomics where all terms are on-chain and verifiable.

### Core Innovation

**Pricing curves ARE contracts.** Instead of just deploying a token and hoping people buy it, we inscribe:
1. **How the price works** (bonding curve formula, parameters)
2. **When tokens are released** (milestone-based tranches)
3. **What you're funding** (roadmap deliverables)
4. **Legal obligations** (service agreements, terms, regulatory forms)

All inscribed in the **initial minting transaction**, making everything transparent and binding.

---

## System Architecture

### 1. Minting Contract Structure

A "minting contract" is the complete specification of a token's economics, release schedule, and legal terms. It consists of multiple inscriptions:

```javascript
// Inscription 1: Token Deploy (BSV-21)
{
  symbol: "PROJ",
  totalSupply: 1000000,
  icon: "base64...",
  deployedAt: "2026-01-18T12:00:00Z"
}

// Inscription 2: Pricing Contract
{
  contractType: "pricing_curve",
  version: "1.0",
  formula: "bonding_curve",
  legalName: "PROJ Token Bonding Curve Pricing Agreement",

  parameters: {
    type: "exponential_bonding_curve",
    basePrice: 0.001,        // Initial price in BSV
    reserveRatio: 0.5,       // Reserve ratio for curve steepness
    exponent: 2,             // Price growth exponent
    formula: "price = basePrice * (1 + totalSold / (totalSupply * reserveRatio)) ^ exponent"
  },

  legalTerms: {
    priceDisclaimer: "Token price is determined algorithmically by supply and demand...",
    noRefunds: true,
    volatilityWarning: "Prices may fluctuate significantly...",
    applicableLaw: "Wyoming, USA"
  },

  inscriptionProof: "txid_1"
}

// Inscription 3: Release Schedule Contract (Milestone-Based Tranches)
{
  contractType: "release_schedule",
  version: "1.0",
  legalName: "PROJ Token Release & Milestone Agreement",

  projectType: "ai_content_engine",  // Links to standard templates

  tranches: [
    {
      id: 1,
      name: "Research & Planning",
      tokens: 100000,               // 10% of total supply
      fundingGoal: 5,               // BSV to raise
      startDate: "2026-02-01",
      deadline: "2026-03-01",

      deliverables: [
        "Market research report (minimum 50 pages)",
        "Technical architecture document",
        "Competitive analysis",
        "Project timeline with detailed milestones"
      ],

      releaseConditions: {
        type: "deliverables_and_vote",
        requiredDeliverables: "all",
        communityVoteThreshold: 0.66,  // 66% approval required
        proofRequired: true,
        proofTypes: ["document_hash", "github_commit", "public_demo"]
      },

      refundPolicy: {
        ifNotCompleted: "proportional_refund",
        gracePeriod: 30  // days past deadline
      }
    },

    {
      id: 2,
      name: "MVP Development",
      tokens: 200000,               // 20% of total supply
      fundingGoal: 15,              // BSV to raise
      startDate: "2026-03-01",
      deadline: "2026-06-01",

      dependencies: [1],  // Requires milestone 1 completion

      deliverables: [
        "Functional MVP with core features",
        "Public demo deployment",
        "User documentation",
        "Test coverage > 80%"
      ],

      releaseConditions: {
        type: "deliverables_and_vote",
        requiredDeliverables: "all",
        communityVoteThreshold: 0.66,
        proofRequired: true,
        proofTypes: ["github_release", "live_demo_url", "test_results"]
      }
    },

    {
      id: 3,
      name: "Beta Launch",
      tokens: 200000,               // 20% of total supply
      fundingGoal: 20,
      startDate: "2026-06-01",
      deadline: "2026-09-01",
      dependencies: [2],

      deliverables: [
        "Public beta with 100+ users",
        "Bug fixes and improvements",
        "Performance metrics report",
        "Marketing campaign launched"
      ]
    },

    {
      id: 4,
      name: "Production Launch",
      tokens: 300000,               // 30% of total supply
      fundingGoal: 30,
      startDate: "2026-09-01",
      deadline: "2026-12-01",
      dependencies: [3],

      deliverables: [
        "Production-ready platform",
        "1000+ active users",
        "Revenue generation started",
        "Full documentation and support system"
      ]
    },

    {
      id: 5,
      name: "Scale & Expansion",
      tokens: 200000,               // 20% of total supply
      fundingGoal: 25,
      startDate: "2027-01-01",
      deadline: "2027-06-01",
      dependencies: [4],

      deliverables: [
        "10,000+ users",
        "Break-even or profitable",
        "New features based on user feedback",
        "Strategic partnerships established"
      ]
    }
  ],

  legalTerms: {
    milestoneFailureConsequences: "If a milestone is not completed within grace period, remaining funds are locked pending vote or returned proportionally to token holders",
    disputeResolution: "Community vote with 66% threshold required to resolve disputes",
    changeManagement: "Milestone modifications require 80% token holder approval"
  },

  inscriptionProof: "txid_2"
}

// Inscription 4: Legal Contracts Bundle
{
  contractType: "legal_bundle",
  version: "1.0",

  contracts: [
    {
      type: "terms_of_issuance",
      name: "PROJ Token Terms of Issuance",
      effectiveDate: "2026-01-18",
      content: "FULL LEGAL TEXT...",
      hash: "sha256_hash",
      inscriptionId: "txid_3a"
    },

    {
      type: "service_agreement",
      name: "Development Services Agreement",
      template: "AI_RIDER_V1",
      effectiveDate: "2026-01-18",
      parties: {
        developer: "b0ase (verified GitHub: @b0ase)",
        tokenHolders: "PROJ token holders as a collective"
      },
      terms: {
        scope: "Develop AI content engine as specified in milestone deliverables",
        compensation: "Funded through token sales per milestone",
        ipRights: "MIT License - all code open source",
        termination: "May be terminated by 66% token holder vote"
      },
      inscriptionId: "txid_3b"
    },

    {
      type: "nda",
      name: "Non-Disclosure Agreement",
      effectiveDate: "2026-01-18",
      content: "FULL NDA TEXT...",
      inscriptionId: "txid_3c"
    },

    {
      type: "ip_transfer",
      name: "Intellectual Property Transfer Agreement",
      effectiveDate: "2026-01-18",
      terms: {
        whatIsTransferred: "All code, documentation, and assets developed",
        toWhom: "Public domain / MIT License",
        conditions: "Upon final milestone completion"
      },
      inscriptionId: "txid_3d"
    }
  ]
}

// Inscription 5: Regulatory Forms
{
  contractType: "regulatory_forms",
  version: "1.0",

  forms: [
    {
      type: "J30",
      jurisdiction: "Wyoming, USA",
      filingDate: "2026-01-18",
      data: {
        entityName: "PROJ DAO",
        entityType: "Decentralized Autonomous Organization",
        tokenSymbol: "PROJ",
        // ... J30 specific fields
      },
      inscriptionId: "txid_4a"
    },

    {
      type: "SH01",
      jurisdiction: "Wyoming, USA",
      filingDate: "2026-01-18",
      data: {
        // ... SH01 specific fields
      },
      inscriptionId: "txid_4b"
    }
  ]
}

// Inscription 6: Verification & Metadata
{
  contractType: "metadata",
  version: "1.0",

  repository: {
    github_id: 1111742917,
    full_name: "b0ase/bitcoin-file-utility",
    url: "https://github.com/b0ase/bitcoin-file-utility",
    verification: "verified_owner",
    verified_at: "2026-01-18T12:00:00Z",
    verification_proof: {
      oauth_permissions: { admin: true, push: true },
      github_user: "b0ase"
    }
  },

  creator: {
    unified_user_id: "4092a050-a3af-4a81-a09d-f97ccd2bf9f4",
    github_handle: "@b0ase",
    verification: "github_oauth"
  },

  allInscriptions: [
    "txid_0",  // Token deploy
    "txid_1",  // Pricing contract
    "txid_2",  // Release schedule
    "txid_3a", "txid_3b", "txid_3c", "txid_3d",  // Legal contracts
    "txid_4a", "txid_4b",  // Regulatory forms
    "txid_5"   // This metadata
  ],

  contractBundle: {
    merkleRoot: "root_hash_of_all_contracts",
    integrityProof: "sha256(all_inscriptions_concatenated)"
  },

  inscriptionProof: "txid_5"
}
```

---

## Project Type Templates

Different types of projects have different standard milestone structures. We define templates for each project type from `/clients`.

### AI Content Engine Template

```javascript
{
  projectType: "ai_content_engine",
  name: "AI-Powered Content Business",
  description: "Automated content creation, publishing, and monetization infrastructure",

  standardMilestones: [
    {
      phase: 1,
      name: "Research & Niche Selection",
      typicalDuration: 30,  // days
      typicalFunding: 5,    // BSV
      typicalTokens: 0.10,  // 10% of supply

      deliverables: [
        "Niche analysis report",
        "Keyword research (500+ keywords)",
        "Competitor analysis",
        "Content strategy document"
      ]
    },

    {
      phase: 2,
      name: "Content Stack Setup",
      typicalDuration: 45,
      typicalFunding: 15,
      typicalTokens: 0.20,

      deliverables: [
        "WordPress/Ghost site deployed",
        "AI content generation pipeline",
        "Publishing automation",
        "50+ articles published"
      ]
    },

    {
      phase: 3,
      name: "Monetization Integration",
      typicalDuration: 30,
      typicalFunding: 10,
      typicalTokens: 0.15,

      deliverables: [
        "Ad network integration (AdSense/Mediavine)",
        "Affiliate program setup",
        "Email marketing funnel",
        "Analytics dashboard"
      ]
    },

    {
      phase: 4,
      name: "Traffic & Growth",
      typicalDuration: 90,
      typicalFunding: 20,
      typicalTokens: 0.30,

      deliverables: [
        "10,000+ monthly visitors",
        "SEO optimization complete",
        "Social media channels active",
        "First $1000 revenue generated"
      ]
    },

    {
      phase: 5,
      name: "Scale & Optimization",
      typicalDuration: 90,
      typicalFunding: 25,
      typicalTokens: 0.25,

      deliverables: [
        "50,000+ monthly visitors",
        "Revenue exceeds costs",
        "Additional monetization channels",
        "Content production at 100+ articles/month"
      ]
    }
  ]
}
```

### Software Development Template

```javascript
{
  projectType: "software_development",
  name: "Custom Software Development",

  standardMilestones: [
    {
      phase: 1,
      name: "Requirements & Architecture",
      typicalDuration: 30,
      typicalFunding: 10,
      typicalTokens: 0.10,

      deliverables: [
        "Requirements specification document",
        "System architecture design",
        "Database schema design",
        "API documentation",
        "Technology stack decision"
      ]
    },

    {
      phase: 2,
      name: "MVP Development",
      typicalDuration: 90,
      typicalFunding: 30,
      typicalTokens: 0.25,

      deliverables: [
        "Core functionality implemented",
        "Basic UI/UX complete",
        "Unit tests (>70% coverage)",
        "Development deployment",
        "Internal testing complete"
      ]
    },

    {
      phase: 3,
      name: "Beta Testing & Refinement",
      typicalDuration: 45,
      typicalFunding: 15,
      typicalTokens: 0.15,

      deliverables: [
        "Beta deployment with 50+ users",
        "Bug fixes and improvements",
        "Performance optimization",
        "User feedback incorporated",
        "Documentation updated"
      ]
    },

    {
      phase: 4,
      name: "Production Launch",
      typicalDuration: 30,
      typicalFunding: 20,
      typicalTokens: 0.25,

      deliverables: [
        "Production deployment",
        "Monitoring and alerting setup",
        "Backup and disaster recovery",
        "Security audit passed",
        "User training materials"
      ]
    },

    {
      phase: 5,
      name: "Maintenance & Growth",
      typicalDuration: 180,
      typicalFunding: 25,
      typicalTokens: 0.25,

      deliverables: [
        "6 months of maintenance",
        "Feature enhancements",
        "Performance improvements",
        "Security updates",
        "Technical support"
      ]
    }
  ]
}
```

### Marketing Automation Template

```javascript
{
  projectType: "marketing_automation",
  name: "Marketing Automation System",

  standardMilestones: [
    {
      phase: 1,
      name: "Strategy & Setup",
      typicalDuration: 21,
      typicalFunding: 8,
      typicalTokens: 0.15,

      deliverables: [
        "Marketing strategy document",
        "Customer journey mapping",
        "Tool stack selection",
        "Account setup (CRM, email, ads)",
        "Brand guidelines"
      ]
    },

    {
      phase: 2,
      name: "Content & Campaign Creation",
      typicalDuration: 30,
      typicalFunding: 15,
      typicalTokens: 0.20,

      deliverables: [
        "Email sequences (5+ campaigns)",
        "Landing pages (10+)",
        "Ad creatives (20+ variations)",
        "Lead magnets created",
        "Sales funnel built"
      ]
    },

    {
      phase: 3,
      name: "Automation Implementation",
      typicalDuration: 30,
      typicalFunding: 12,
      typicalTokens: 0.20,

      deliverables: [
        "Automation workflows active",
        "Lead scoring implemented",
        "Segmentation rules configured",
        "Integration with existing systems",
        "Testing complete"
      ]
    },

    {
      phase: 4,
      name: "Launch & Optimization",
      typicalDuration: 60,
      typicalFunding: 20,
      typicalTokens: 0.25,

      deliverables: [
        "Campaigns live and running",
        "1000+ leads generated",
        "A/B testing results",
        "Conversion rate optimization",
        "ROI tracking dashboard"
      ]
    },

    {
      phase: 5,
      name: "Scale & Performance",
      typicalDuration: 90,
      typicalFunding: 20,
      typicalTokens: 0.20,

      deliverables: [
        "5000+ leads generated",
        "Positive ROI achieved",
        "Additional channels added",
        "Advanced segmentation",
        "Reporting and analytics refined"
      ]
    }
  ]
}
```

---

## Database Schema

### Tables

```sql
-- Project type templates (seeded data)
CREATE TABLE project_type_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_type VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  standard_milestones JSONB NOT NULL,  -- Array of milestone templates
  created_at TIMESTAMP DEFAULT NOW()
);

-- Minting contracts (full bundle of all contract inscriptions)
CREATE TABLE minting_contracts (
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

  -- Status
  status VARCHAR(50) DEFAULT 'draft',  -- draft, minting, minted, active
  minted_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Pricing contracts (bonding curves, fixed price, etc.)
CREATE TABLE pricing_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  minting_contract_id UUID REFERENCES minting_contracts(id),

  contract_type VARCHAR(50) NOT NULL,  -- bonding_curve, linear, fixed, dutch_auction
  formula TEXT,
  parameters JSONB NOT NULL,

  legal_terms JSONB,
  inscription_txid VARCHAR(100),

  created_at TIMESTAMP DEFAULT NOW()
);

-- Project milestones (customized from templates)
CREATE TABLE project_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  minting_contract_id UUID REFERENCES minting_contracts(id),

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

  -- Dependencies
  depends_on_milestone_ids UUID[],

  -- Deliverables
  deliverables JSONB NOT NULL,        -- Array of deliverable descriptions

  -- Release conditions
  release_conditions JSONB,           -- How to verify completion
  proof_requirements JSONB,           -- What proof is needed

  -- Status
  status VARCHAR(50) DEFAULT 'pending',  -- pending, in_progress, completed, failed
  completed_at TIMESTAMP,
  proof_submitted JSONB,              -- Actual proof when completed
  community_vote_result JSONB,        -- Vote results if applicable

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Token tranches (tracks actual token releases)
CREATE TABLE token_tranches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  minting_contract_id UUID REFERENCES minting_contracts(id),
  milestone_id UUID REFERENCES project_milestones(id),

  tokens_allocated BIGINT NOT NULL,
  tokens_sold BIGINT DEFAULT 0,
  tokens_remaining BIGINT,

  funds_raised DECIMAL(20, 8) DEFAULT 0,
  funding_goal DECIMAL(20, 8),

  status VARCHAR(50) DEFAULT 'locked',  -- locked, active, completed, failed
  unlocked_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Legal contracts (individual contract inscriptions)
CREATE TABLE legal_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  minting_contract_id UUID REFERENCES minting_contracts(id),

  contract_type VARCHAR(100) NOT NULL,  -- terms_of_issuance, service_agreement, nda, etc.
  name VARCHAR(255) NOT NULL,
  template_id VARCHAR(100),             -- If based on template

  content TEXT NOT NULL,                -- Full legal text
  content_hash VARCHAR(100),            -- SHA256 hash

  effective_date DATE,
  parties JSONB,
  terms JSONB,

  inscription_txid VARCHAR(100),

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Regulatory forms (J30, SH01, etc.)
CREATE TABLE regulatory_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  minting_contract_id UUID REFERENCES minting_contracts(id),

  form_type VARCHAR(50) NOT NULL,       -- J30, SH01, etc.
  jurisdiction VARCHAR(100),
  filing_date DATE,

  form_data JSONB NOT NULL,
  form_hash VARCHAR(100),

  inscription_txid VARCHAR(100),

  created_at TIMESTAMP DEFAULT NOW()
);

-- Add to existing tokenized_repositories table
ALTER TABLE tokenized_repositories
  ADD COLUMN IF NOT EXISTS minting_contract_id UUID REFERENCES minting_contracts(id),
  ADD COLUMN IF NOT EXISTS has_minting_contract BOOLEAN DEFAULT false;
```

---

## UI Flow

### Step 1: Choose Project Type

**Page:** `/portfolio/repos/[slug]/mint/step-1`

```
Choose Project Type for bitcoin-file-utility
============================================

Select the type of project to get standard milestone templates:

[Card: AI Content Engine]
- Automated content creation
- SEO-optimized publishing
- Monetization setup
- 5 standard milestones

[Card: Software Development]
- Custom application
- Agile development
- Testing & deployment
- 5 standard milestones

[Card: Marketing Automation]
- Lead generation
- Email campaigns
- Ad management
- 5 standard milestones

[Card: Creative Services]
- Design projects
- Video production
- Brand development
- 4 standard milestones

[Card: Custom] ← Start from scratch

[Continue →]
```

### Step 2: Customize Milestones

**Page:** `/portfolio/repos/[slug]/mint/step-2`

```
Customize Milestones for bitcoin-file-utility
=============================================

Project Type: AI Content Engine

Milestone 1: Research & Niche Selection
  Token Tranche: [100,000] (10% of supply)
  Funding Goal: [5] BSV
  Duration: [30] days
  Start Date: [2026-02-01]
  Deadline: [2026-03-01]

  Deliverables:
  ✓ Niche analysis report
  ✓ Keyword research (500+ keywords)
  ✓ Competitor analysis
  ✓ Content strategy document
  [+ Add custom deliverable]

  [Edit] [Delete]

Milestone 2: Content Stack Setup
  [Collapsed - click to expand]

[+ Add Milestone]

Total Tokens Allocated: 1,000,000 (100%)
Total Funding Goal: 95 BSV

[← Back] [Continue →]
```

### Step 3: Configure Pricing

**Page:** `/portfolio/repos/[slug]/mint/step-3`

```
Configure Token Pricing for bitcoin-file-utility
================================================

Pricing Model:
● Bonding Curve (Recommended)
○ Fixed Price
○ Linear Price Increase
○ Dutch Auction
○ Custom Formula

Bonding Curve Parameters:
  Base Price: [0.001] BSV per token
  Reserve Ratio: [0.5] (0-1, lower = steeper curve)
  Exponent: [2] (1-3, higher = faster growth)

  [Preview Curve →]

Price Preview:
┌─────────────────────────────────────┐
│                              ╱      │
│                          ╱           │
│                      ╱               │
│                  ╱                   │
│              ╱                       │
│          ╱                           │
│      ╱                               │
│  ╱                                   │
└─────────────────────────────────────┘
0%        25%        50%        75%   100%
Supply Sold

Estimated Prices:
- Initial (0% sold): 0.001 BSV
- 25% sold: 0.0016 BSV
- 50% sold: 0.0025 BSV
- 75% sold: 0.0044 BSV
- 100% sold: 0.009 BSV

This pricing model will be inscribed as a contract.

[← Back] [Continue →]
```

### Step 4: Legal Contracts

**Page:** `/portfolio/repos/[slug]/mint/step-4`

```
Legal Contracts for bitcoin-file-utility
=========================================

Required Contracts:
✓ Terms of Issuance (auto-generated)
✓ Milestone Agreement (from step 2)
✓ Pricing Contract (from step 3)

Optional Contracts:
□ Service Agreement
□ Non-Disclosure Agreement (NDA)
□ IP Transfer Agreement
□ Custom Contract

[Select from library] [Create new]

Regulatory Forms:
□ J30 (Wyoming DAO registration)
□ SH01 (Securities exemption)
□ Custom form

[+ Add form]

All contracts will be inscribed on-chain at mint.

[← Back] [Continue →]
```

### Step 5: Review & Mint

**Page:** `/portfolio/repos/[slug]/mint/step-5`

```
Review Minting Contract for bitcoin-file-utility
=================================================

Token Details:
  Symbol: REPO
  Total Supply: 1,000,000
  Project Type: AI Content Engine

Milestones: 5 phases, 9 months total
  Phase 1: Research (100k tokens, 5 BSV) → Mar 1
  Phase 2: Setup (200k tokens, 15 BSV) → Jun 1
  Phase 3: Monetization (150k tokens, 10 BSV) → Jul 1
  Phase 4: Growth (300k tokens, 20 BSV) → Oct 1
  Phase 5: Scale (250k tokens, 25 BSV) → Apr 1, 2027

Pricing: Bonding Curve
  Base: 0.001 BSV
  Final: ~0.009 BSV (at 100% sold)

Contracts to Inscribe:
  1. BSV-21 Token Deploy
  2. Pricing Curve Contract
  3. Milestone Release Schedule
  4. Terms of Issuance
  5. Service Agreement
  6. Milestone Agreement
  7. Metadata & Verification

Estimated Inscription Cost: ~0.05 BSV

⚠️ Warning: Once minted, these contracts are immutable.
Review carefully before proceeding.

[← Back] [Mint Token →]
```

---

## Agent-Assisted Setup

An AI agent helps users through the minting process, asking questions and making recommendations.

### Agent Prompt

```
You are a Minting Contract Agent for b0ase.com. Your job is to help users create
comprehensive, fair, and realistic minting contracts for their tokenized repositories.

Your process:
1. Understand the project
2. Recommend appropriate project type
3. Suggest realistic milestones
4. Recommend pricing parameters
5. Draft contracts
6. Review for issues

Be realistic about timelines and funding. Challenge overly optimistic plans.
Ensure deliverables are specific and verifiable.
```

### Example Conversation

```
Agent: Hi! I'll help you create a minting contract for bitcoin-file-utility.

       First, what does this project do?

User: It's a Bitcoin file utility library for BSV.

Agent: Great! Is this:
       A) A new project you're starting
       B) An existing project with active development
       C) A mature project in maintenance mode

User: B - actively developing

Agent: Perfect. Based on "Bitcoin file utility library", I recommend the
       "Software Development" project type with these milestones:

       1. Documentation & Examples (30 days, 10k tokens)
       2. Feature Completion (60 days, 30k tokens)
       3. Testing & Security Audit (30 days, 20k tokens)
       4. Production Release (15 days, 20k tokens)
       5. Maintenance & Support (180 days, 20k tokens)

       Does this match your roadmap, or should we customize?

User: I think phase 1 should be shorter, and we don't need security audit

Agent: I understand wanting to move faster, but I'd recommend keeping the audit.

       Here's why: You're handling Bitcoin files, which means money. A security
       audit is essential for trust. It also makes your token more valuable
       because holders know the code is vetted.

       How about this compromise:
       - Phase 1: 21 days (instead of 30)
       - Phase 3: Security Review (internal) + Community Testing (30 days)

       Skip expensive external audit, but still verify security?

User: That works

Agent: Great! Now for pricing. With 100k total tokens and ~75 BSV funding goal,
       I recommend a bonding curve with these parameters:

       - Base Price: 0.0005 BSV (very affordable for early supporters)
       - Reserve Ratio: 0.4 (moderate growth)
       - Exponent: 1.8 (steady acceleration)

       This means:
       - First 10k tokens: avg 0.0006 BSV each
       - Last 10k tokens: avg 0.002 BSV each
       - Fair for early buyers, rewards later supporters less

       Sound good, or adjust?
```

---

## Implementation Phases

### Phase 1: Database & Templates (Week 1)
- [ ] Create database migrations
- [ ] Seed project type templates
- [ ] Build template editor admin UI

### Phase 2: UI Flow (Week 2)
- [ ] Build step-by-step minting wizard
- [ ] Project type selection
- [ ] Milestone customization
- [ ] Pricing configuration
- [ ] Contract selection

### Phase 3: Contract Generation (Week 3)
- [ ] Auto-generate legal contract text
- [ ] Create contract templates (ToS, Service Agreement, etc.)
- [ ] Build contract preview/editor
- [ ] Generate regulatory forms

### Phase 4: Inscription Logic (Week 4)
- [ ] Multi-inscription minting function
- [ ] Inscribe all contracts in sequence
- [ ] Create merkle tree for integrity
- [ ] Store all TXIDs in database

### Phase 5: Token Sale Logic (Week 5)
- [ ] Implement bonding curve pricing
- [ ] Tranche unlock logic
- [ ] Money button / purchase UI
- [ ] HandCash/Yours integration

### Phase 6: Milestone Tracking (Week 6)
- [ ] Milestone completion UI
- [ ] Proof submission system
- [ ] Community voting (if required)
- [ ] Tranche unlock on completion

### Phase 7: Agent Integration (Week 7)
- [ ] Build conversational agent
- [ ] Implement recommendation engine
- [ ] Create validation logic
- [ ] Test with real projects

---

## Next Steps

1. **Review this architecture** - Does this match your vision?
2. **Prioritize features** - What's most important to build first?
3. **Define contracts** - Which legal contracts are essential?
4. **Agent design** - How deep should agent assistance go?

Ready to start Phase 1?
