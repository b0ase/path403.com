# Financial Projections - b0ase.com

**Last Updated:** January 24, 2026
**Status:** DRAFT - Needs Validation
**Confidential:** Yes - Internal/Investor Use Only

---

## Executive Summary

b0ase.com is an **AI-first business**. Our "staff" is AI agents. Our cost structure is API credits and compute, not salaries. This document projects revenue, costs, and path to profitability.

**Key Insight:** Traditional agencies have 60-70% labor costs. We target <20% labor costs by replacing human work with AI agents running 24/7.

---

## Revenue Streams

### Stream 1: Automation Subscriptions

Monthly recurring revenue from businesses subscribing to AI automation packages.

| Tier | Price/mo | Target Customers (M12) | MRR |
|------|----------|------------------------|-----|
| Starter | £297 | 20 | £5,940 |
| Professional | £597 | 15 | £8,955 |
| Enterprise | £1,497 | 5 | £7,485 |
| **TOTAL** | | **40** | **£22,380** |

**Assumptions:**
- 3-month average customer lifetime (conservative)
- 10% monthly churn (high, will improve)
- CAC: £200 per customer (paid + organic)

### Stream 2: Developer Marketplace

10% commission on developer/agent services sold through marketplace.

| Metric | M6 | M12 | M18 |
|--------|-----|-----|-----|
| Monthly GMV | £10,000 | £50,000 | £150,000 |
| Commission (10%) | £1,000 | £5,000 | £15,000 |
| Active Developers | 20 | 50 | 100 |
| Avg Project Size | £500 | £1,000 | £1,500 |

### Stream 3: Investment Platform Fee

5% fee on tranche funding processed through the platform.

| Metric | M6 | M12 | M18 |
|--------|-----|-----|-----|
| Funding Processed | £20,000 | £100,000 | £500,000 |
| Platform Fee (5%) | £1,000 | £5,000 | £25,000 |
| Active Investors | 20 | 100 | 300 |
| Avg Investment | £1,000 | £1,000 | £1,667 |

### Stream 4: Token Allocations

1-5% token allocation in each Kintsugi-created company.

| Metric | M12 | M18 | M24 |
|--------|-----|-----|-----|
| Projects Completed | 5 | 15 | 30 |
| Avg Token Value | £10,000 | £20,000 | £50,000 |
| Our Allocation (3%) | £300 | £600 | £1,500 |
| Total Portfolio Value | £1,500 | £9,000 | £45,000 |

*Note: This is paper value, not liquid. Realizable on token sales or project exits.*

### Stream 5: Custom Services

Web3 design, consulting, and bespoke automation builds.

| Metric | M6 | M12 | M18 |
|--------|-----|-----|-----|
| Projects/Month | 2 | 4 | 6 |
| Avg Project Value | £2,500 | £3,500 | £5,000 |
| Monthly Revenue | £5,000 | £14,000 | £30,000 |

### Stream 6: Kintsugi Setup Fees

One-time fee for onboarding projects to Kintsugi.

| Metric | M6 | M12 | M18 |
|--------|-----|-----|-----|
| Projects Onboarded | 5 | 20 | 50 |
| Setup Fee | £500 | £750 | £999 |
| Monthly Revenue | £2,500 | £15,000 | £49,950 |

---

## Revenue Summary

| Stream | M6 | M12 | M18 |
|--------|-----|-----|-----|
| Automation Subscriptions | £8,000 | £22,380 | £45,000 |
| Marketplace Commission | £1,000 | £5,000 | £15,000 |
| Platform Fee | £1,000 | £5,000 | £25,000 |
| Custom Services | £5,000 | £14,000 | £30,000 |
| Kintsugi Setup | £2,500 | £15,000 | £49,950 |
| **TOTAL MRR** | **£17,500** | **£61,380** | **£164,950** |
| **ANNUAL RUN RATE** | **£210,000** | **£736,560** | **£1,979,400** |

---

## Cost Structure

### The AI-First Model

Traditional agency:
```
Revenue: £100,000
- Staff (60%): £60,000
- Overhead (20%): £20,000
- Profit (20%): £20,000
```

b0ase.com:
```
Revenue: £100,000
- AI/Compute (25%): £25,000
- Infrastructure (10%): £10,000
- Overhead (10%): £10,000
- Profit (55%): £55,000
```

**The arbitrage:** Replace £60K of human labor with £25K of AI compute.

---

## Infrastructure Costs (Scaling)

### Scenario A: Cloud-Only (Current)

| Service | M6 | M12 | M18 |
|---------|-----|-----|-----|
| Vercel Pro | £50 | £150 | £300 |
| Supabase Pro | £50 | £100 | £200 |
| Hetzner VPS | £30 | £75 | £150 |
| Cloudflare | £0 | £20 | £50 |
| Railway (N8N) | £30 | £75 | £150 |
| **Subtotal** | **£160** | **£420** | **£850** |

### Scenario B: Hybrid (Mac Studios + Cloud)

For running local AI agents (ClaudeCode, ClawedBot, Ralphwiggum loops):

**Hardware (One-Time):**

| Item | Qty | Unit Cost | Total |
|------|-----|-----------|-------|
| Mac Studio M3 Ultra (192GB) | 10 | £6,000 | £60,000 |
| 4TB SSD Upgrade | 10 | £500 | £5,000 |
| Monitors (for debugging) | 5 | £300 | £1,500 |
| Network Infrastructure | 1 | £1,000 | £1,000 |
| UPS/Power Protection | 2 | £500 | £1,000 |
| **TOTAL HARDWARE** | | | **£68,500** |

**Monthly Operating Costs (10 Mac Studios):**

| Cost | Monthly |
|------|---------|
| Electricity (10 machines, 24/7) | £200 |
| Internet (dedicated fiber) | £100 |
| Colocation/Office Space | £500 |
| Maintenance Reserve | £100 |
| **Subtotal** | **£900** |

**Why Local Compute?**
- Unlimited Claude Code sessions (vs. API limits)
- Persistent agents running 24/7
- No per-token API costs for local inference
- Full control over scheduling and resources

---

## AI API Costs (Scaling)

### Current Model (API-Heavy)

| Provider | M6 | M12 | M18 |
|----------|-----|-----|-----|
| Claude API | £300 | £800 | £2,000 |
| Gemini API | £100 | £300 | £600 |
| Deepseek API | £50 | £150 | £300 |
| OpenAI (embeddings) | £50 | £100 | £200 |
| **Subtotal** | **£500** | **£1,350** | **£3,100** |

### Future Model (Claude Max Subscriptions)

If we move to subscription-based Claude access:

| Plan | Qty | Monthly | Total |
|------|-----|---------|-------|
| Claude Max (individual) | 10 | £150 | £1,500 |
| Claude Team (if available) | 1 | £500 | £500 |
| Google AI Pro | 5 | £50 | £250 |
| **Subtotal** | | | **£2,250** |

**Trade-off:** Higher fixed cost, but unlimited usage within limits. Better for 24/7 agent operation.

---

## Compliance Costs

| Service | M6 | M12 | M18 |
|---------|-----|-----|-----|
| Veriff KYC (~20/mo) | £40 | £100 | £250 |
| BSV Inscriptions | £10 | £30 | £100 |
| Legal/Accounting | £200 | £400 | £600 |
| **Subtotal** | **£250** | **£530** | **£950** |

---

## Staff Costs (Minimal)

The whole point is minimal staff. AI does the work.

| Role | M6 | M12 | M18 |
|------|-----|-----|-----|
| Founder (Richard) | £0* | £3,000 | £5,000 |
| Part-time Support | £0 | £1,000 | £2,000 |
| Contractors (as needed) | £500 | £1,000 | £2,000 |
| **Subtotal** | **£500** | **£5,000** | **£9,000** |

*Founder takes no salary until profitable, then modest draw.

---

## Total Cost Summary

### Scenario A: Cloud-Only

| Category | M6 | M12 | M18 |
|----------|-----|-----|-----|
| Infrastructure | £160 | £420 | £850 |
| AI APIs | £500 | £1,350 | £3,100 |
| Compliance | £250 | £530 | £950 |
| Staff | £500 | £5,000 | £9,000 |
| Marketing | £500 | £2,000 | £5,000 |
| Misc/Buffer | £200 | £500 | £1,000 |
| **TOTAL** | **£2,110** | **£9,800** | **£19,900** |

### Scenario B: Hybrid (After Hardware Investment)

| Category | M6 | M12 | M18 |
|----------|-----|-----|-----|
| Infrastructure | £160 | £420 | £850 |
| Mac Studio Operations | £0 | £900 | £900 |
| AI APIs (reduced) | £500 | £500 | £750 |
| Claude Max Subs | £0 | £1,500 | £2,250 |
| Compliance | £250 | £530 | £950 |
| Staff | £500 | £5,000 | £9,000 |
| Marketing | £500 | £2,000 | £5,000 |
| Misc/Buffer | £200 | £500 | £1,000 |
| **TOTAL** | **£2,110** | **£11,350** | **£20,700** |

*Plus £68,500 one-time hardware investment*

---

## Profitability Analysis

### Scenario A: Cloud-Only

| Metric | M6 | M12 | M18 |
|--------|-----|-----|-----|
| Revenue | £17,500 | £61,380 | £164,950 |
| Costs | £2,110 | £9,800 | £19,900 |
| **Gross Profit** | **£15,390** | **£51,580** | **£145,050** |
| **Margin** | **88%** | **84%** | **88%** |

### Scenario B: Hybrid (Post-Hardware)

| Metric | M6 | M12 | M18 |
|--------|-----|-----|-----|
| Revenue | £17,500 | £61,380 | £164,950 |
| Costs | £2,110 | £11,350 | £20,700 |
| **Gross Profit** | **£15,390** | **£50,030** | **£144,250** |
| **Margin** | **88%** | **82%** | **87%** |

**Break-Even:**
- Cloud-Only: Month 1 (already profitable at small scale)
- Hybrid: Month 14 (after recovering hardware investment)

---

## Hardware Investment ROI

**Question:** Is it worth spending £68,500 on Mac Studios?

**Analysis:**

| Factor | API-Only | Mac Studios |
|--------|----------|-------------|
| Monthly AI Cost (M18) | £3,100 | £2,100 |
| Monthly Savings | - | £1,000 |
| Payback Period | - | 68 months |

**At current projections, hardware doesn't pay back fast enough.**

**BUT** - the real value is:
- 24/7 agent operation (not rate-limited)
- Running ClawedBot/Ralphwiggum loops continuously
- No per-token anxiety
- Scaling to 100+ concurrent agent sessions

**Recommendation:** Start cloud-only. Invest in hardware when:
1. Revenue exceeds £50K MRR (can afford the CapEx)
2. API limits become a bottleneck
3. Agent workload requires 24/7 operation

---

## Funding Scenarios

### Scenario 1: Bootstrap (No Raise)

| Month | Revenue | Costs | Cash Flow | Cumulative |
|-------|---------|-------|-----------|------------|
| M1 | £2,000 | £2,110 | -£110 | -£110 |
| M3 | £5,000 | £3,000 | £2,000 | £3,890 |
| M6 | £17,500 | £2,110 | £15,390 | £45,000 |
| M12 | £61,380 | £9,800 | £51,580 | £250,000 |

**Viable but slow. Limited marketing budget constrains growth.**

### Scenario 2: Raise £50K

| Use of Funds | Amount |
|--------------|--------|
| Marketing (accelerate CAC) | £20,000 |
| Mac Studios (4 units) | £24,000 |
| Runway buffer | £6,000 |

| Month | Revenue | Costs | Cash Flow | Cumulative |
|-------|---------|-------|-----------|------------|
| M1 | £5,000 | £5,000 | £0 | £50,000 |
| M6 | £30,000 | £5,000 | £25,000 | £125,000 |
| M12 | £80,000 | £12,000 | £68,000 | £400,000 |

**2x growth rate from marketing. Hardware enables 24/7 agents.**

### Scenario 3: Raise £100K

| Use of Funds | Amount |
|--------------|--------|
| Marketing | £35,000 |
| Mac Studios (10 units) | £60,000 |
| Runway buffer | £5,000 |

| Month | Revenue | Costs | Cash Flow | Cumulative |
|-------|---------|-------|-----------|------------|
| M6 | £50,000 | £8,000 | £42,000 | £150,000 |
| M12 | £120,000 | £15,000 | £105,000 | £600,000 |
| M18 | £200,000 | £25,000 | £175,000 | £1,200,000 |

**Full hardware deployment. Aggressive marketing. Path to £2M ARR.**

---

## Unit Economics

### Automation Subscription

| Metric | Value |
|--------|-------|
| Average Revenue Per User (ARPU) | £500/mo |
| Customer Acquisition Cost (CAC) | £200 |
| Lifetime Value (LTV) @ 6mo avg | £3,000 |
| LTV:CAC Ratio | 15:1 |
| Gross Margin | 85% |

### Developer Marketplace

| Metric | Value |
|--------|-------|
| Commission Rate | 10% |
| Avg Transaction Size | £1,000 |
| Revenue per Transaction | £100 |
| Cost to Facilitate | ~£5 (payment processing) |
| Net Margin | 95% |

### Kintsugi Project

| Metric | Value |
|--------|-------|
| Setup Fee | £750 |
| Avg Tranche Funding | £5,000 |
| Platform Fee (5%) | £250 |
| Token Allocation (3%) | Variable |
| Revenue per Project | £1,000+ |
| Cost to Onboard | ~£100 (AI analysis, setup) |
| Margin | 90% |

---

## Key Assumptions & Risks

### Assumptions

1. **AI costs stay stable or decrease** - API pricing continues to fall
2. **Claude Code remains effective** - No major degradation in capability
3. **Demand exists** - Businesses want AI automation
4. **Token model works** - Investors accept BSV-20 tokens
5. **Regulatory clarity** - UK FCA framework remains favorable

### Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| API price increase | Low | High | Multi-provider fallback, local compute |
| Claude capability decline | Low | High | Diversify AI providers |
| Low customer demand | Medium | High | Validate with early customers |
| Regulatory change | Medium | Medium | FCA-compliant from start |
| Competition | High | Medium | First-mover, unique positioning |

---

## Milestones & Checkpoints

| Milestone | Target | Metric |
|-----------|--------|--------|
| First paying customer | M1 | 1 subscription |
| Break-even | M3 | £3K MRR |
| Product-market fit | M6 | 10 subscriptions, <10% churn |
| Scale trigger | M12 | £50K MRR |
| Hardware investment | M12-15 | £60K CapEx decision |
| Profitability | M6 | Positive cash flow |
| Series A ready | M24 | £150K MRR, proven unit economics |

---

## Summary

**The thesis:** AI agents replace human labor at 1/3 the cost with 24/7 availability.

**The math:**
- Traditional agency: 20% profit margin
- b0ase.com: 80%+ profit margin

**The path:**
1. Start cloud-only (minimal CapEx)
2. Prove unit economics with first 10 customers
3. Raise £50-100K to accelerate
4. Invest in hardware when revenue justifies it
5. Scale to £2M ARR with 10 Mac Studios running continuously

**The ask:** £50-100K to accelerate from £20K to £100K MRR in 12 months.

---

## Document References

| Document | Purpose |
|----------|---------|
| `OPERATIONAL_COSTS.md` | Current burn rate detail |
| `FUNDING_STRATEGY.md` | Investment terms |
| `KINTSUGI_PRODUCT.md` | Product specification |
| `EXECUTIVE_SUMMARY.md` | One-pager for investors |

---

**Review Schedule:** Monthly
**Next Review:** February 24, 2026
