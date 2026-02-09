# b0ase.com Operational Costs & Projections

**Last Updated:** January 24, 2026
**Version:** 1.0
**Owner:** richard@b0ase.com

> **Purpose:** Single source of truth for all operational costs, API expenses, and financial projections. Updated monthly. Referenced by investors and used for runway calculations.

---

## Monthly Cost Summary

### Current (January 2026) - Pre-Revenue

| Category | Monthly (GBP) | Annual (GBP) | Notes |
|----------|---------------|--------------|-------|
| **Infrastructure** | £95 | £1,140 | Vercel, Supabase, domains |
| **AI APIs** | £150 | £1,800 | Claude, Gemini, Deepseek |
| **Compliance** | £0 | £0 | Veriff added when investors onboard |
| **Tools & Services** | £50 | £600 | GitHub, monitoring, email |
| **TOTAL** | **£295** | **£3,540** | Baseline burn rate |

### Projected (Month 6) - 20 Active Investors

| Category | Monthly (GBP) | Annual (GBP) | Notes |
|----------|---------------|--------------|-------|
| **Infrastructure** | £150 | £1,800 | Scaled Vercel/Supabase |
| **AI APIs** | £400 | £4,800 | Increased agent usage |
| **Compliance** | £30 | £360 | ~20 Veriff checks @ £1.50 |
| **Tools & Services** | £100 | £1,200 | Added CRM, analytics |
| **TOTAL** | **£680** | **£8,160** | |

### Projected (Month 12) - 100 Active Investors, 50 Automation Subscribers

| Category | Monthly (GBP) | Annual (GBP) | Notes |
|----------|---------------|--------------|-------|
| **Infrastructure** | £400 | £4,800 | Pro tiers, scaling |
| **AI APIs** | £1,200 | £14,400 | Heavy agent automation |
| **Compliance** | £100 | £1,200 | ~70 new investors/year |
| **Tools & Services** | £200 | £2,400 | Full tooling stack |
| **TOTAL** | **£1,900** | **£22,800** | |

---

## Detailed Cost Breakdown

### 1. Infrastructure

| Service | Current | Scale (M12) | Pricing Model | Notes |
|---------|---------|-------------|---------------|-------|
| **Vercel Pro** | £20/mo | £150/mo | $20/user + usage | Hosting, serverless, analytics |
| **Supabase Pro** | £25/mo | £75/mo | $25/mo + usage | Database, auth, storage |
| **Domain (b0ase.com)** | £15/yr | £15/yr | Annual | Primary domain |
| **Domain (moneybutton.store)** | £12/yr | £12/yr | Annual | Secondary domain |
| **Cloudflare** | £0 | £20/mo | Free → Pro | CDN, DDoS protection |
| **Railway** | £0 | £50/mo | Usage-based | Background jobs, N8N |
| **Hetzner VPS** | £20/mo | £50/mo | Fixed | BSV node, custom services |

### 2. AI API Costs

| Provider | Current | Scale (M12) | Rate | Use Case |
|----------|---------|-------------|------|----------|
| **Claude API** | £100/mo | £800/mo | ~$3/1M tokens | Primary AI, agents, chat |
| **Gemini API** | £30/mo | £200/mo | ~$0.50/1M tokens | Image generation, fallback |
| **Deepseek API** | £20/mo | £100/mo | ~$0.14/1M tokens | Cheap fallback, bulk tasks |
| **OpenAI API** | £0 | £100/mo | ~$2/1M tokens | Embeddings, specific tasks |

**Token Usage Estimates:**
- Kintsugi chat session: ~5K tokens/conversation = £0.015
- Agent task execution: ~10K tokens/task = £0.03
- Blog generation: ~20K tokens/post = £0.06
- Daily active agents (10): ~100K tokens/day = £9/mo

### 3. Compliance & KYC

| Service | Current | Scale (M12) | Rate | Notes |
|---------|---------|-------------|------|-------|
| **Veriff** | £0 | £100/mo | ~£1.50/check | KYC verification for investors |
| **BSV Inscriptions** | £5/mo | £50/mo | ~£0.01/inscription | On-chain contracts, certs |
| **AML Monitoring** | £0 | £0 | Included in Veriff | Ongoing screening |

**Veriff Pricing Breakdown:**
- Per verification: ~$1.50-2.00 (£1.20-1.60)
- Monthly minimum: $49 (£40)
- Free trial: 15 days
- Volume discount: Available at 100+/mo

**Investor Verification Projections:**
| Period | New Investors | Veriff Cost |
|--------|---------------|-------------|
| M1-M3 | 10 | £40 (minimum) |
| M4-M6 | 20 | £40 (minimum) |
| M7-M12 | 50 | £75-100 |
| Year 2 | 200 | £300-400 |

### 4. Tools & Services

| Service | Current | Scale (M12) | Purpose |
|---------|---------|-------------|---------|
| **GitHub Pro** | £0 | £20/mo | Private repos, actions |
| **N8N Cloud** | £20/mo | £50/mo | Workflow automation |
| **Postmark** | £10/mo | £30/mo | Transactional email |
| **Sentry** | £0 | £30/mo | Error monitoring |
| **Plausible** | £0 | £20/mo | Privacy-friendly analytics |
| **Cal.com** | £0 | £15/mo | Booking system |
| **Notion** | £10/mo | £20/mo | Internal docs |
| **1Password** | £5/mo | £10/mo | Secrets management |

### 5. Payment Processing Fees

| Provider | Fee | Notes |
|----------|-----|-------|
| **Stripe** | 1.4% + 20p (UK cards) | 2.9% + 30p international |
| **PayPal** | 2.9% + 30p | Marketplace escrow |
| **BSV transactions** | ~£0.001 | Negligible |

**Fee Projections at Scale:**
- £10K MRR: ~£290 in fees (2.9%)
- £50K MRR: ~£1,450 in fees (2.9%)
- £100K MRR: ~£2,900 in fees (2.9%)

---

## Kintsugi Engine Costs

The Kintsugi AI orchestration system has specific cost drivers:

### Per-Session Costs

| Action | Tokens | Cost | Frequency |
|--------|--------|------|-----------|
| Discovery chat | 10K | £0.03 | Per new user |
| Proposal generation | 25K | £0.075 | Per project |
| Repo creation | 5K | £0.015 | Per project |
| Contract generation | 15K | £0.045 | Per contract |
| Ongoing agent tasks | 10K/task | £0.03 | Daily |

### Monthly Kintsugi Projections

| Scale | Users | Sessions/mo | Token Usage | Cost |
|-------|-------|-------------|-------------|------|
| Current | 10 | 50 | 500K | £15 |
| M6 | 50 | 250 | 2.5M | £75 |
| M12 | 200 | 1,000 | 10M | £300 |
| M18 | 500 | 2,500 | 25M | £750 |

---

## Runway Calculations

### Current Runway (No Revenue)

| Scenario | Monthly Burn | Cash Required | Runway |
|----------|--------------|---------------|--------|
| Minimal | £295 | £3,540 | 12 months |
| Growth | £680 | £8,160 | 12 months |
| Scaled | £1,900 | £22,800 | 12 months |

### Post-Raise Runway (£75K)

| Scenario | Monthly Burn | Months of Runway |
|----------|--------------|------------------|
| Conservative (£500/mo) | £500 | 150 months |
| Moderate (£2,000/mo) | £2,000 | 37 months |
| Aggressive (£5,000/mo) | £5,000 | 15 months |
| With Team (£8,000/mo) | £8,000 | 9 months |

### Break-Even Analysis

| MRR Target | Fixed Costs | Required Customers |
|------------|-------------|-------------------|
| £2,000 | £680 | 4 Professional (£597) |
| £5,000 | £1,200 | 9 Professional |
| £10,000 | £1,900 | 17 Professional |
| £50,000 | £5,000 | 84 Professional |

---

## Cost Optimization Strategies

### Implemented

1. **Multi-provider AI fallback** - Use Deepseek for bulk, Claude for quality
2. **Edge caching** - Reduce API calls with intelligent caching
3. **Batch inscriptions** - Combine multiple inscriptions per transaction
4. **Free tiers maximized** - Vercel, Supabase, GitHub free tiers

### Planned

1. **Token usage optimization** - Reduce prompt sizes by 30%
2. **Self-hosted LLM** - For non-critical tasks (savings: £200/mo at scale)
3. **Volume discounts** - Negotiate at 100+ Veriff/mo
4. **Annual billing** - 20% savings on most SaaS

---

## Update Log

| Date | Change | Impact |
|------|--------|--------|
| 2026-01-24 | Created document | Baseline established |
| 2026-01-24 | Added Veriff KYC costs | +£40-100/mo projected |

---

## References

- [FUNDING_STRATEGY.md](./FUNDING_STRATEGY.md) - Investment deck
- [INVESTMENT_PIPELINE.md](./INVESTMENT_PIPELINE.md) - Tranche system
- [Veriff Pricing](https://veriff.com/pricing) - KYC provider
- [Claude Pricing](https://anthropic.com/pricing) - AI API
- [Supabase Pricing](https://supabase.com/pricing) - Database

---

**Review Schedule:** Monthly (1st of each month)
**Next Review:** February 1, 2026
