# Contract Marketplace Protocol

**Version:** 1.0
**Created:** 2026-01-18
**Status:** Design Phase

---

## Core Concept

**Inscribe contracts directly on the blockchain as searchable, AI-readable markdown files.**

Instead of posting jobs on platforms or sending proposals via email:
1. **Service providers inscribe OFFER contracts** - "I will do X for Y BSV"
2. **Clients inscribe PROBLEM contracts** - "I need X solved, willing to pay Y BSV"
3. **AI search engines index the blockchain** and match problems to solutions
4. **Parties sign contracts on-chain** by referencing inscription IDs
5. **Work is delivered and proven on-chain** with completion inscriptions
6. **Payment flows directly** (BSV transfer, optional smart contract escrow)

**No middleman. No platform fees. Just inscriptions and BSV transfers.**

---

## Why This Works

### For AI Search Engines

```
AI Crawler: "Scanning BSV blockchain for contracts..."

Found: inscription_123456
Type: PROBLEM_CONTRACT
Problem: "Need Next.js app with Supabase auth, 5 pages, mobile responsive"
Budget: 15 BSV
Deadline: 30 days
Required Skills: ["Next.js", "Supabase", "TypeScript", "Tailwind"]
Client: verified_github_@alice

AI: "Checking my indexed OFFER_CONTRACTs..."

Match: inscription_789012
Type: OFFER_CONTRACT
Service: "Next.js + Supabase full-stack development"
Rate: 0.5 BSV/day (15 BSV for 30 days = MATCH)
Provider: verified_github_@b0ase
Portfolio: [inscriptions with past work]
Rating: 4.8/5 (on-chain reviews)

AI: "Sending notification to both parties..."
```

**The AI can:**
- Parse markdown contracts (standardized format)
- Match skills to requirements
- Check provider reputation (on-chain reviews)
- Verify budget compatibility
- Suggest matches to both parties

### For Humans

**As a service provider (b0ase):**
- Publish your services as inscriptions once
- AI agents find you when relevant problems appear
- No need to hunt for work
- Your portfolio is on-chain (verifiable)

**As a client (AI Forge):**
- Express your problem as a contract
- AI finds qualified providers
- Choose from matched offers
- Work proof is on-chain (verifiable delivery)

---

## Contract Types

### 1. OFFER_CONTRACT (Service Provider → Blockchain)

**What b0ase publishes:**

```markdown
# OFFER_CONTRACT

**Type:** OFFER_CONTRACT
**Provider:** b0ase.com
**Provider Verification:** verified_github_@b0ase
**Inscription ID:** txid_0

---

## Service Offered

**AI-Powered Content Business Setup**

Complete infrastructure for automated content creation, publishing, and monetization.

---

## What's Included

- Niche research and keyword analysis
- WordPress/Ghost site setup and configuration
- AI content generation pipeline (GPT-4 integration)
- Publishing automation (schedule, SEO optimization)
- Monetization setup (AdSense, affiliates, email marketing)
- 30 days of support and optimization

---

## Deliverables

1. Fully functional content website (WordPress or Ghost)
2. AI content generation system producing 50+ articles
3. Publishing automation (auto-post, auto-optimize)
4. Analytics dashboard (traffic, revenue tracking)
5. Documentation for ongoing operation
6. Training session (1 hour via video call)

---

## Timeline

**30 days** from contract signature to delivery

Milestones:
- Day 7: Niche research complete, site deployed
- Day 14: AI pipeline operational, 20 articles published
- Day 21: Monetization integrated, 40 articles published
- Day 30: Final delivery, training, handoff

---

## Pricing

**Fixed Price:** 25 BSV

**Payment Terms:**
- 40% upfront (10 BSV) - upon contract signature
- 30% midpoint (7.5 BSV) - after Day 14 milestone
- 30% completion (7.5 BSV) - upon final delivery

**Refund Policy:**
- Full refund if Day 7 milestone not met
- Proportional refund if project abandoned mid-stream
- Final payment only after client approval of deliverables

---

## Requirements from Client

- Access to domain name and hosting (or b0ase can provide)
- Content niche preferences (3-5 options)
- Brand guidelines (if applicable)
- API keys for tools (OpenAI, WordPress, etc.)

---

## Skills & Tech Stack

- Next.js, React, TypeScript
- WordPress, Ghost CMS
- OpenAI GPT-4 API
- Google Analytics, Search Console
- AdSense, affiliate networks

---

## Portfolio

Previous work (on-chain inscriptions):
- [AI Content Engine - Travel Niche](inscription_link_1) - 50k monthly visitors
- [Automated Tech Blog](inscription_link_2) - $2k/month revenue
- [Finance Content Site](inscription_link_3) - 100+ articles, AdSense approved

---

## How to Accept

1. Review this contract and portfolio
2. Create ACCEPTANCE_CONTRACT referencing this inscription ID
3. Send 10 BSV to: [b0ase_payment_address]
4. Work begins within 24 hours of payment confirmation

---

## Contact

- Website: https://b0ase.com
- GitHub: @b0ase
- Email: richard@b0ase.com

---

**Contract Hash:** sha256_abc123
**Inscription Date:** 2026-01-18
**Valid Until:** 2026-12-31 (or until 5 contracts accepted, whichever first)
```

**Inscribed as markdown.** AI-readable. Human-readable. Searchable.

---

### 2. PROBLEM_CONTRACT (Client → Blockchain)

**What AI Forge publishes:**

```markdown
# PROBLEM_CONTRACT

**Type:** PROBLEM_CONTRACT
**Client:** AI Forge
**Client Verification:** verified_github_@aiforge
**Inscription ID:** txid_1

---

## Problem Statement

**Our AI agent platform needs better UX for non-technical users**

Our product works great for developers, but we're losing non-technical users who find it too complex. We need a simplified onboarding flow and dashboard redesign.

---

## Current Situation

- Product: AI agent platform (SaaS)
- Users: 500+ technical users, high retention
- Problem: 70% of non-technical signups abandon during onboarding
- Current stack: Next.js, React, Tailwind
- Current onboarding: 7 steps, requires API key setup, config file editing

---

## What We Need

1. **Simplified Onboarding Flow**
   - Reduce steps from 7 to 3
   - Auto-configure with sensible defaults
   - Interactive tutorial/walkthrough
   - No manual config file editing

2. **Dashboard Redesign**
   - Non-technical users don't understand current metrics
   - Need plain-language explanations
   - Visual feedback (less text, more graphics)
   - Guided actions (suggest next steps)

3. **Template Library**
   - Pre-built agent templates for common use cases
   - One-click deploy
   - Customizable without code

---

## Success Criteria

- New user activation rate > 50% (currently 30%)
- Time to first successful agent run < 5 minutes (currently 20+ minutes)
- Support tickets about "how to get started" reduced by 75%
- User feedback: "easy to use" rating > 4/5 (currently 2.5/5)

---

## Timeline

**Flexible - prefer faster delivery**

Estimated: 21-45 days depending on scope

Milestones:
- Design mockups for approval (Week 1)
- Onboarding flow implementation (Week 2-3)
- Dashboard redesign (Week 3-4)
- Template library (Week 4-5)
- Testing and refinement (Week 5-6)

---

## Budget

**15-25 BSV** depending on scope and timeline

Willing to pay premium for:
- Faster delivery
- Proven UX expertise
- User research/testing included

---

## Required Skills

- UX/UI design (portfolio required)
- Next.js / React development
- User research and testing
- Technical writing (for tutorials/guides)

---

## What We Provide

- Full access to codebase (private GitHub repo)
- Current user feedback data
- Analytics and heatmaps
- Availability for daily standups
- Fast feedback on designs/prototypes

---

## How to Respond

1. Review this problem statement
2. Create PROPOSAL_CONTRACT with:
   - Your approach to solving this
   - Portfolio of similar UX work
   - Detailed timeline and pricing
   - Reference this inscription ID
3. We'll review all proposals within 7 days
4. Selected provider will receive ACCEPTANCE_CONTRACT

---

## Contact

- Website: https://aiforge.dev
- GitHub: @aiforge
- Email: hello@aiforge.dev

---

**Contract Hash:** sha256_def456
**Inscription Date:** 2026-01-18
**Open Until:** 2026-02-15 (or until accepted)
```

---

### 3. PROPOSAL_CONTRACT (Response to Problem)

**b0ase's response to AI Forge:**

```markdown
# PROPOSAL_CONTRACT

**Type:** PROPOSAL_CONTRACT
**In Response To:** [AI Forge PROBLEM_CONTRACT inscription_txid_1]
**Proposer:** b0ase.com
**Proposer Verification:** verified_github_@b0ase
**Inscription ID:** txid_2

---

## Understanding Your Problem

You have a **technical product with a UX gap for non-technical users**.

The core issue isn't the product itself - it's the **onboarding friction** and **dashboard complexity** that creates a barrier for your target market expansion.

I see three layers to solve:
1. **Cognitive load** - Too many decisions in onboarding
2. **Language barrier** - Technical jargon alienates non-devs
3. **Lack of guidance** - Users don't know "what good looks like"

---

## My Approach

### Phase 1: User Research (Days 1-7)

**Before touching code**, I want to understand your users:

- Interview 10-15 users (5 successful, 10 abandoned)
- Record 5+ onboarding sessions (with permission)
- Analyze support tickets for common confusion points
- Competitive analysis (how do similar tools onboard?)

**Deliverable:** User research report with key insights

### Phase 2: Design (Days 8-14)

Based on research, design new flows:

**Onboarding Redesign:**
- Step 1: Choose template (show examples, not abstract config)
- Step 2: Customize in plain language ("What should your agent do?")
- Step 3: Launch and test (instant feedback, no config files)

**Dashboard Redesign:**
- Replace metrics with "health score" (simple 0-100)
- Add plain-language status ("Your agent is working great!")
- Show suggested actions ("Try adding X to improve Y")
- Use more visuals, less text

**Deliverable:** Figma mockups for approval

### Phase 3: Implementation (Days 15-28)

Build in Next.js/React:

- New onboarding flow (3 steps, auto-config)
- Interactive tutorial (tooltips, walkthroughs)
- Dashboard redesign (components, not full rewrite)
- Template library (5 templates to start)

**Deliverable:** Working prototype on staging

### Phase 4: Testing & Refinement (Days 29-35)

- User testing with 20+ beta users
- Collect feedback, iterate
- Fix bugs, polish UI
- Write documentation

**Deliverable:** Production-ready code

---

## Timeline

**35 days** (5 weeks)

Can accelerate to **28 days** if:
- User interviews happen in parallel (you coordinate)
- Design approval is fast (< 2 days)

---

## Pricing

**20 BSV total**

Payment schedule:
- 6 BSV upfront (30%) - Research & design phase
- 8 BSV at Day 14 (40%) - After design approval
- 6 BSV at completion (30%) - After testing & delivery

**Bonus:** If activation rate exceeds 60% (not just 50%), I'll donate 2 BSV to open-source UX tools.

---

## Why I'm Qualified

**Relevant Experience:**

1. **b0ase.com Dashboard Redesign**
   - Reduced user confusion by 80% (measured via support tickets)
   - [Inscription: Before/After screenshots](inscription_link)

2. **Portfolio Site UX Overhaul**
   - Simplified complex tokenization flow
   - 3-step wizard reduced dropoff from 65% to 20%
   - [Inscription: Case study](inscription_link)

3. **Client Project: SaaS Onboarding**
   - 7-step flow → 3 steps
   - Activation rate 35% → 68%
   - [Inscription: Client testimonial](inscription_link)

**Skills:**
- UX research and testing (5+ years)
- Next.js / React (7+ years)
- Figma design (expert level)
- Technical writing

---

## What I Need From You

- Codebase access (read + write permissions)
- User data (analytics, heatmaps, support tickets)
- 10-15 users willing to be interviewed (I'll coordinate)
- Fast feedback on designs (ideally same-day turnaround)
- Slack/Discord for quick communication

---

## Guarantees

1. **Activation rate > 50%** or I'll refund 50% of final payment
2. **Support ticket reduction > 75%** or I'll provide 30 days free support
3. **User satisfaction > 4/5** or I'll iterate until we hit it (no extra charge)

If I don't deliver by Day 35, you get 10% discount per week late.

---

## Next Steps

1. Review this proposal
2. Schedule 30-min video call to discuss (optional but recommended)
3. If you want to proceed:
   - Create ACCEPTANCE_CONTRACT referencing this inscription
   - Send 6 BSV to: [b0ase_payment_address]
   - I'll start user research within 24 hours

---

**Contract Hash:** sha256_ghi789
**Inscription Date:** 2026-01-18
**Valid Until:** 2026-02-01
```

---

### 4. ACCEPTANCE_CONTRACT (Agreement to Work)

**AI Forge accepts b0ase's proposal:**

```markdown
# ACCEPTANCE_CONTRACT

**Type:** ACCEPTANCE_CONTRACT
**Accepting:** [b0ase PROPOSAL_CONTRACT inscription_txid_2]
**In Response To:** [Original PROBLEM_CONTRACT inscription_txid_1]
**Client:** AI Forge
**Provider:** b0ase.com
**Inscription ID:** txid_3

---

## Contract Terms Accepted

We accept the terms outlined in b0ase's proposal (inscription_txid_2):

- **Timeline:** 35 days (starting 2026-01-19)
- **Payment:** 20 BSV (6 + 8 + 6 schedule)
- **Deliverables:** User research, design mockups, implementation, testing
- **Success criteria:** 50%+ activation, 75%+ support reduction, 4/5 satisfaction

---

## Payment Confirmation

**First Payment:** 6 BSV sent to [b0ase_payment_address]
**Transaction ID:** payment_txid_001
**Timestamp:** 2026-01-18 14:30:00 UTC

---

## Additional Terms

1. **Communication:** Daily standup via Slack at 10am PST
2. **Code Review:** All PRs require approval before merge
3. **Design Approval:** We commit to < 24hr turnaround on Figma reviews
4. **User Interviews:** We'll coordinate 15 users within 3 days

---

## Milestone Schedule

- **Day 7:** User research report due
- **Day 14:** Design mockups due + Payment 2 (8 BSV)
- **Day 28:** Implementation complete (staging)
- **Day 35:** Testing done, production deployment + Payment 3 (6 BSV)

---

## Amendments

This contract may be amended by mutual agreement inscribed on-chain.

Any disputes will be resolved by:
1. Good-faith negotiation
2. If unresolved, community arbitration (both parties submit case, token holders vote)

---

## Signatures

**Client Signature:** AI Forge
**Signed By:** verified_github_@aiforge
**Date:** 2026-01-18

**Provider Signature:** b0ase.com
**Signed By:** verified_github_@b0ase
**Date:** 2026-01-18

**Contract Hash:** sha256_jkl012
**Inscription Date:** 2026-01-18
```

---

### 5. COMPLETION_CONTRACT (Work Delivered)

**After 35 days, b0ase inscribes proof:**

```markdown
# COMPLETION_CONTRACT

**Type:** COMPLETION_CONTRACT
**Contract Reference:** [ACCEPTANCE_CONTRACT inscription_txid_3]
**Provider:** b0ase.com
**Client:** AI Forge
**Inscription ID:** txid_4

---

## Work Delivered

All deliverables from the accepted proposal have been completed and delivered.

---

## Deliverables

### 1. User Research Report
- 15 user interviews conducted
- 5 onboarding session recordings analyzed
- 200+ support tickets reviewed
- Competitive analysis of 8 similar platforms
- **Inscription:** [User Research Report](inscription_link_report)

### 2. Design Mockups
- Onboarding flow (3 steps)
- Dashboard redesign (6 screens)
- Template library (10 templates)
- Approved by client on 2026-01-25
- **Inscription:** [Figma Mockups](inscription_link_figma)

### 3. Implementation
- New onboarding flow (deployed to staging 2026-02-10)
- Dashboard redesign (deployed to staging 2026-02-15)
- Template library (5 templates live, 5 more in progress)
- Code review and approval by client
- **GitHub PR:** [Link to merged PR]
- **Inscription:** [Code diff summary](inscription_link_code)

### 4. Testing Results
- Beta tested with 25 users (2026-02-16 to 2026-02-22)
- **Activation rate:** 64% (exceeded 50% target by 14%)
- **Time to first agent:** 4.2 minutes (beat 5-minute target)
- **Support tickets:** Reduced by 82% (exceeded 75% target)
- **User satisfaction:** 4.3/5 (exceeded 4/5 target)
- **Inscription:** [Testing Report](inscription_link_testing)

---

## Success Criteria Met

✅ Activation rate > 50% (achieved 64%)
✅ Time to first agent < 5 min (achieved 4.2 min)
✅ Support tickets reduced > 75% (achieved 82%)
✅ User satisfaction > 4/5 (achieved 4.3/5)

**All targets exceeded.**

---

## Final Payment Request

Per contract terms, final payment of **6 BSV** is due upon delivery.

**Payment Address:** [b0ase_payment_address]

---

## Client Approval

[Awaiting client signature below]

---

**Provider Signature:** b0ase.com
**Signed By:** verified_github_@b0ase
**Completion Date:** 2026-02-22

**Contract Hash:** sha256_mno345
**Inscription Date:** 2026-02-22
```

---

### 6. REVIEW_CONTRACT (Optional Feedback)

**AI Forge reviews the work:**

```markdown
# REVIEW_CONTRACT

**Type:** REVIEW_CONTRACT
**Contract Reference:** [COMPLETION_CONTRACT inscription_txid_4]
**Reviewer:** AI Forge
**Provider:** b0ase.com
**Inscription ID:** txid_5

---

## Overall Rating

⭐⭐⭐⭐⭐ (5/5)

---

## What Went Well

1. **User Research Was Exceptional**
   - Discovered insights we hadn't considered
   - Competitive analysis changed our roadmap
   - Report was extremely thorough

2. **Design Exceeded Expectations**
   - Clean, modern, intuitive
   - Addressed every pain point from research
   - Fast iteration on feedback

3. **Implementation Was Solid**
   - Clean code, well-tested
   - Great documentation
   - Easy to maintain and extend

4. **Results Speak for Themselves**
   - 64% activation (up from 30%)
   - 82% support reduction
   - Users love the new onboarding

---

## What Could Improve

- Testing phase ran 2 days over schedule (not a big deal)
- Would have liked more frequent updates during implementation
- Some edge cases weren't caught until production

---

## Would Hire Again?

**Absolutely.** Already discussing next project.

---

## Final Payment Confirmation

**Final Payment:** 6 BSV sent to [b0ase_payment_address]
**Transaction ID:** payment_txid_003
**Timestamp:** 2026-02-23 10:00:00 UTC

**Total Paid:** 20 BSV (6 + 8 + 6)

---

**Client Signature:** AI Forge
**Signed By:** verified_github_@aiforge
**Date:** 2026-02-23

**Contract Hash:** sha256_pqr678
**Inscription Date:** 2026-02-23
```

---

## Database Schema

```sql
-- Contract marketplace tables

CREATE TABLE contract_inscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inscription_txid VARCHAR(100) UNIQUE NOT NULL,
  contract_type VARCHAR(50) NOT NULL,  -- OFFER, PROBLEM, PROPOSAL, ACCEPTANCE, COMPLETION, REVIEW

  -- Parties
  provider_unified_user_id UUID,
  client_unified_user_id UUID,

  -- Contract content
  content_markdown TEXT NOT NULL,
  content_hash VARCHAR(100) NOT NULL,

  -- References
  references_inscription_txid VARCHAR(100),  -- Links to parent contract

  -- Metadata
  skills_required JSONB,
  budget_bsv DECIMAL(20, 8),
  timeline_days INTEGER,
  status VARCHAR(50),  -- open, matched, in_progress, completed, disputed

  -- Search indexing
  searchable_text TEXT,  -- For AI/human search
  tags TEXT[],

  inscribed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_contract_type ON contract_inscriptions(contract_type);
CREATE INDEX idx_contract_status ON contract_inscriptions(status);
CREATE INDEX idx_contract_provider ON contract_inscriptions(provider_unified_user_id);
CREATE INDEX idx_contract_client ON contract_inscriptions(client_unified_user_id);
CREATE INDEX idx_contract_references ON contract_inscriptions(references_inscription_txid);

-- Full-text search
CREATE INDEX idx_contract_search ON contract_inscriptions USING gin(to_tsvector('english', searchable_text));

-- Contract matches (AI-suggested or user-initiated)
CREATE TABLE contract_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_inscription_txid VARCHAR(100) REFERENCES contract_inscriptions(inscription_txid),
  offer_inscription_txid VARCHAR(100) REFERENCES contract_inscriptions(inscription_txid),

  match_score DECIMAL(3, 2),  -- 0.00 to 1.00
  match_reasons JSONB,  -- Why AI thinks this is a good match

  suggested_by VARCHAR(50),  -- ai_engine, user_manual, etc.
  suggested_at TIMESTAMP DEFAULT NOW(),

  status VARCHAR(50) DEFAULT 'suggested'  -- suggested, viewed, contacted, accepted, rejected
);

-- Payment tracking
CREATE TABLE contract_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_inscription_txid VARCHAR(100) REFERENCES contract_inscriptions(inscription_txid),

  amount_bsv DECIMAL(20, 8) NOT NULL,
  payment_txid VARCHAR(100),
  payment_address VARCHAR(100),

  milestone VARCHAR(255),  -- "upfront", "midpoint", "completion"
  paid_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## AI Indexing Format

To make contracts easily discoverable by AI, we use **structured metadata** in the markdown:

```markdown
---
type: OFFER_CONTRACT
provider: b0ase.com
provider_verification: verified_github_@b0ase
service_category: web_development
skills: ["Next.js", "React", "Supabase", "TypeScript", "Tailwind"]
budget_min: 15
budget_max: 50
timeline_min_days: 21
timeline_max_days: 90
available: true
inscription_id: txid_123
contract_hash: sha256_abc
---

# Service Title

[markdown content...]
```

AI crawlers can parse the YAML frontmatter for quick filtering, then read the full markdown for context.

---

## How AI Matching Works

### Step 1: Crawler Indexes Contracts

```javascript
// AI crawler runs periodically
const crawler = {
  async scanBlockchain() {
    const inscriptions = await bsv.getInscriptionsWithPrefix("CONTRACT:");

    for (const inscription of inscriptions) {
      const content = await inscription.getContent();
      const parsed = parseMarkdownContract(content);

      await db.contracts.upsert({
        inscription_txid: inscription.txid,
        type: parsed.frontmatter.type,
        skills: parsed.frontmatter.skills,
        budget: parsed.frontmatter.budget_max,
        searchable_text: parsed.content,
        // ... more fields
      });
    }
  }
};
```

### Step 2: Matching Algorithm

```javascript
async function findMatches(problemContract) {
  const matches = await db.query(`
    SELECT
      o.*,
      similarity(o.searchable_text, $1) as text_similarity,
      array_overlap_count(o.skills, $2) as skill_matches
    FROM contract_inscriptions o
    WHERE o.contract_type = 'OFFER_CONTRACT'
      AND o.status = 'open'
      AND o.budget_min <= $3
      AND o.budget_max >= $4
      AND array_overlap(o.skills, $2)  -- At least some skill overlap
    ORDER BY
      skill_matches DESC,
      text_similarity DESC
    LIMIT 10
  `, [
    problemContract.searchable_text,
    problemContract.skills_required,
    problemContract.budget_bsv * 0.8,  // Allow 20% below
    problemContract.budget_bsv * 1.2   // Allow 20% above
  ]);

  return matches.map(match => ({
    offer: match,
    score: calculateMatchScore(problemContract, match),
    reasons: generateMatchReasons(problemContract, match)
  }));
}

function calculateMatchScore(problem, offer) {
  let score = 0;

  // Skill matching (40% weight)
  const skillOverlap = countOverlap(problem.skills, offer.skills);
  score += (skillOverlap / problem.skills.length) * 0.4;

  // Budget fit (20% weight)
  const budgetFit = offer.budget_max >= problem.budget_bsv ? 0.2 : 0.1;
  score += budgetFit;

  // Timeline fit (20% weight)
  const timelineFit = offer.timeline_max_days <= problem.timeline_days ? 0.2 : 0.1;
  score += timelineFit;

  // Text similarity (20% weight)
  score += offer.text_similarity * 0.2;

  return Math.min(score, 1.0);
}
```

### Step 3: Notify Parties

```javascript
async function notifyMatches(matches) {
  for (const match of matches) {
    if (match.score > 0.7) {  // High confidence
      await sendNotification(match.offer.provider, {
        type: 'high_match',
        problem: match.problem,
        score: match.score,
        reasons: match.reasons
      });

      await sendNotification(match.problem.client, {
        type: 'provider_found',
        offer: match.offer,
        score: match.score,
        reasons: match.reasons
      });
    }
  }
}
```

---

## UI Implementation

### Publishing an OFFER Contract

**Page:** `/contracts/new/offer`

```
Publish Service Offer
=====================

What service do you offer?
[AI-Powered Content Business Setup        ]

Short description (1-2 sentences):
[Complete infrastructure for automated content creation,
 publishing, and monetization.                          ]

What's included? (deliverables)
✓ Niche research and keyword analysis
✓ Website setup (WordPress/Ghost)
✓ AI content generation pipeline
✓ Publishing automation
[+ Add deliverable]

Timeline
Minimum: [21] days
Maximum: [45] days

Pricing
Budget range: [15] to [50] BSV
Payment structure: ● Fixed price  ○ Hourly  ○ Milestone-based

Required skills (for AI matching)
[Next.js] [WordPress] [OpenAI] [SEO] [+]

Portfolio (inscriptions)
[inscription_1] [inscription_2] [+ Add work sample]

Valid until: [2026-12-31]
Max contracts: [5] (auto-expires after 5 acceptances)

[Preview Markdown] [Inscribe Offer (0.01 BSV) →]
```

### Viewing PROBLEM Contracts

**Page:** `/contracts/browse/problems`

```
Open Problems
=============

Filters:
Budget: [5] to [100] BSV
Skills: [Next.js ×] [React ×] [AI ×]
Timeline: < [90] days

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Problem: Better UX for AI agent platform
Client: AI Forge (verified_github_@aiforge)
Budget: 15-25 BSV | Timeline: 21-45 days
Skills: UX Design, Next.js, React, User Research

"Our AI agent platform works great for developers, but we're
 losing non-technical users who find it too complex..."

Match Score: 87% ⭐⭐⭐⭐
- You have 4/4 required skills
- Your rate (0.5 BSV/day) fits budget
- You have UX portfolio pieces
- Similar past work found

[View Full Problem] [Submit Proposal →]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Problem: E-commerce site needs performance optimization
Client: ShopFast (verified_github_@shopfast)
Budget: 10-20 BSV | Timeline: 14-21 days

Match Score: 45% ⭐⭐
- You have 2/5 required skills
- Outside your typical timeline
[View Full Problem]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## The AI Forge Use Case

You mentioned:

> "AI Forge have a problem, but it's not brilliantly expressed. What I need to do is express what I think their problem is, offer them a contract to fix it, OR create a WAY for them to express their problem as a contract, and then sign it...do the work"

**Option 1: You Express Their Problem FOR Them**

```markdown
# PROBLEM_CONTRACT (on behalf of AI Forge)

**Type:** PROBLEM_CONTRACT
**Drafted By:** b0ase.com (on behalf of AI Forge)
**Client:** AI Forge (pending confirmation)

---

## Problem Statement (As I Understand It)

AI Forge has built a powerful AI agent platform, but adoption is
hampered by UX complexity for non-technical users.

**Symptoms:**
- High signup-to-activation dropoff
- Support overwhelmed with "how do I..." questions
- Technical users love it, non-technical users abandon

**Root Cause:**
Onboarding assumes developer-level comfort with config files,
APIs, and technical jargon.

**Solution Needed:**
Simplified onboarding + plain-language dashboard + guided templates

---

[Full details...]

---

## Note from b0ase

I've drafted this problem statement based on observing AI Forge's
product and talking to some of their users.

If AI Forge agrees this accurately describes their problem, they
can:
1. Sign this contract (confirming the problem statement)
2. I'll submit a PROPOSAL_CONTRACT
3. We proceed from there

If they want to modify this problem statement, they can fork it
and inscribe their own version.

**This contract is a starting point for discussion, not binding.**
```

You inscribe this. AI Forge sees it, says "Yes, that's exactly our problem!", signs it, and you proceed.

**Option 2: Create a Template for Them**

Build a UI at `/contracts/new/problem/template` that guides them:

```
Express Your Problem
====================

Let's figure out what you need.

What's the main issue?
○ Product not selling
● Users signing up but not activating
○ Too many support requests
○ Technical debt slowing us down
○ Need to scale infrastructure

→ You selected: "Users signing up but not activating"

Tell me more:
- How many signups per week? [~50]
- How many activate? [~15] (30%)
- What do you want? [>50%]

What happens during onboarding?
[User describes: 7 steps, config files, API keys...]

What makes your product hard to use?
[Too technical, confusing jargon, no guidance...]

[AI generates draft problem contract]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Here's your problem contract (AI-generated):

# PROBLEM_CONTRACT

**Client:** AI Forge
**Problem:** Low user activation due to complex onboarding

Our AI agent platform has a 30% activation rate. Users sign up
but abandon during the 7-step onboarding process which requires...

[Full AI-generated contract]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Edit Contract] [Inscribe on Blockchain (0.01 BSV) →]
```

AI helps them articulate the problem clearly.

---

## Integration with Minting Contracts

**Work contracts can fund milestone-based tokens:**

1. AI Forge publishes PROBLEM_CONTRACT
2. b0ase submits PROPOSAL_CONTRACT
3. Instead of BSV payment, b0ase gets **AI Forge tokens** as they complete milestones
4. Contract inscribed on-chain links to token contract

```markdown
# ACCEPTANCE_CONTRACT

**Payment Terms:**
Instead of 20 BSV, provider will receive:
- 100,000 AIFORGE tokens (vested over project milestones)
- Tokens unlock as work milestones complete
- Token value tied to product success

Provider becomes stakeholder in product improvement.
```

This aligns incentives perfectly.

---

## Next Steps

1. **Build contract templates** (OFFER, PROBLEM, PROPOSAL, etc.)
2. **Create markdown editor** with YAML frontmatter
3. **Inscribe contracts** on BSV
4. **Build AI indexer** to scan blockchain
5. **Matching algorithm** to connect problems/offers
6. **Notification system** for matches
7. **UI for browsing/searching** contracts

**Should I start building this?**

Or should I focus on getting the basic verification working first, then come back to this marketplace concept?
