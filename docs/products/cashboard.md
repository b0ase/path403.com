# Cashboard - Product Requirements Document

> **Status**: Draft
> **Owner**: Richard
> **Last Updated**: 2026-01-25
> **Token**: N/A (infrastructure layer)
> **Repo**: /Volumes/2026/Projects/bitcoin-corp-website (integration) + www.cashboard.website (external)

---

## 1. Executive Summary

**One-liner**: The coordination layer that turns business rules into automated on-chain payments.

**Problem**: Businesses have complex payment logic (splits, conditions, schedules, approvals) that requires manual execution, accounting overhead, and trust in intermediaries.

**Solution**: A programmable coordination engine where you define rules once ("30% of revenue → dividends", "if milestone hit → release payment") and they execute automatically on Bitcoin, forever.

**Target User**:
- Primary: Token-based businesses needing automated treasury management
- Secondary: DAOs and multi-stakeholder organizations
- Tertiary: Freelancers and agencies with complex payment splits

---

## 2. Business Model

### Revenue Streams
| Stream | Description | Pricing |
|--------|-------------|---------|
| Transaction Fee | Per automated payment executed | 0.1% of transaction |
| Premium Rules | Complex multi-condition automations | Subscription tier |
| Enterprise | Custom integrations, SLAs, support | Custom pricing |

### Key Metrics
- **North Star**: Monthly Automated Volume (MAV)
- **Secondary**:
  - Active rules running
  - Unique businesses using
  - Average rules per business
  - Rule execution success rate

---

## 3. Core Features

### MVP (Must Have)

1. **Payment Splits**
   - User story: As a business owner, I want incoming revenue automatically split to stakeholders
   - Example: "Revenue → 30% dividends, 20% operations, 50% treasury"
   - Acceptance: Split executes on every qualifying incoming transaction

2. **Conditional Payments**
   - User story: As a project manager, I want payments released when conditions are met
   - Example: "If milestone marked complete → release 25% of escrow"
   - Acceptance: Condition evaluates on trigger, payment executes if true

3. **Scheduled Payments**
   - User story: As a business owner, I want recurring payments on schedule
   - Example: "Every 2 weeks → pay team salaries"
   - Acceptance: Cron-like scheduling with reliable execution

4. **Cascading Automations**
   - User story: As an ecosystem builder, I want one payment to trigger others
   - Example: "Dividend paid → triggers re-investment rule → triggers LP deposit"
   - Acceptance: Chain of rules executes in sequence

5. **2-of-2 Multisig Custody**
   - User story: As a stakeholder, I want shared control over treasury
   - Implementation: Shareholder key + company key required for withdrawals
   - Acceptance: No single party can move funds unilaterally

### Phase 2 (Should Have)
- [ ] Rule templates (payroll, dividends, invoicing)
- [ ] Visual rule builder (no-code)
- [ ] Approval workflows (n-of-m signing)
- [ ] Webhook triggers (external events)
- [ ] Analytics dashboard

### Future (Nice to Have)
- [ ] Cross-chain coordination (BSV ↔ other chains)
- [ ] AI-suggested optimizations
- [ ] Accounting software export (QuickBooks, Xero)
- [ ] Mobile approval app

---

## 4. Technical Architecture

### Primitives Used
| Package | Purpose |
|---------|---------|
| `@b0ase/tx-builder` | Construct BSV transactions |
| `@b0ase/multi-wallet-auth` | Multi-party signing |
| `@b0ase/dividend-engine` | Proportional distributions |
| `@b0ase/rate-limiter` | Prevent rule abuse |
| `@b0ase/event-emitter` | Rule trigger pub/sub |
| `@b0ase/state-machine` | Rule execution states |
| `@b0ase/queue-manager` | Async rule processing |

### Rule Engine Architecture
```
┌─────────────────────────────────────────────────────────┐
│                    RULE DEFINITION                       │
│  ┌─────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │ TRIGGER │ →  │ CONDITIONS  │ →  │   ACTIONS   │     │
│  └─────────┘    └─────────────┘    └─────────────┘     │
│   on_payment     if amount > X      split(30%, 70%)    │
│   on_schedule    if sender = Y      pay(address, amt)  │
│   on_webhook     if balance > Z     cascade(rule_id)   │
│   on_milestone   if approved = true escrow_release()   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   EXECUTION ENGINE                       │
│  1. Event received (trigger fires)                      │
│  2. Evaluate conditions (all must pass)                 │
│  3. Queue actions for execution                         │
│  4. Execute with retry logic                            │
│  5. Log result + cascade to dependent rules             │
└─────────────────────────────────────────────────────────┘
```

### Data Model
```
Rule {
  id: string
  name: string
  trigger: TriggerConfig
  conditions: ConditionConfig[]
  actions: ActionConfig[]
  status: 'active' | 'paused' | 'error'
  lastExecuted: timestamp
  executionCount: number
  createdBy: address
}

Execution {
  id: string
  ruleId: string
  triggeredAt: timestamp
  conditionsResult: boolean
  actionsExecuted: ActionResult[]
  status: 'pending' | 'success' | 'failed'
  txids: string[]
}
```

### Current Implementation Status

**What Exists (in bitcoin-corp-website):**
- 2-of-2 multisig wallet creation and management
- Signing request workflow (shareholder → company approval)
- Transaction history tracking
- Basic withdrawal flow

**What's External (www.cashboard.website):**
- Rule definition UI
- Condition builder
- Execution engine
- Analytics

**Gap: Rule engine is not local.** Decision needed: build locally or integrate deeper with external Cashboard.

### Key Integrations
- **Wallet**: Custom 2-of-2 multisig (BSV)
- **Payment**: Direct BSV transactions
- **Auth**: Existing b0ase auth system
- **Blockchain**: WhatsOnChain API for broadcast/status

---

## 5. User Flows

### Primary Flow: Create a Revenue Split Rule
1. Business connects treasury wallet
2. Opens rule builder
3. Selects trigger: "On incoming payment"
4. Adds condition: "Amount > 0.01 BSV"
5. Defines actions:
   - 30% → dividend wallet
   - 20% → operations wallet
   - 50% → stays in treasury
6. Activates rule
7. Every qualifying payment auto-splits

### Secondary Flow: Milestone-Based Release
1. Client and contractor agree on milestones
2. Client deposits escrow to Cashboard-managed address
3. Rule created: "If milestone X approved → release 25%"
4. Contractor completes work
5. Client marks milestone complete (on-chain or webhook)
6. Cashboard auto-releases funds to contractor

### Approval Flow: Multi-sig Withdrawal
1. Shareholder initiates withdrawal request
2. System creates signing request
3. Shareholder signs with their key
4. Company co-signer notified
5. Company reviews and signs
6. Transaction broadcast
7. Both parties see confirmation

---

## 6. Competitive Landscape

| Competitor | Their Approach | Our Differentiation |
|------------|----------------|---------------------|
| Stripe Connect | Payment splits for platforms | We're on-chain, immutable, no middleman |
| Gnosis Safe | Multi-sig treasury | We add automation rules on top |
| Superfluid | Streaming payments (ETH) | We're BSV-native, lower fees |
| Traditional payroll | Manual, monthly, fiat | Real-time, automated, Bitcoin |

---

## 7. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Rule execution failure | Medium | High | Retry logic, alerts, manual override |
| Key compromise | Low | Critical | 2-of-2 multisig, hardware key support |
| Regulatory scrutiny | Medium | Medium | Clear TOS, not custodial (users hold keys) |
| Complex rules = bugs | Medium | Medium | Rule simulation/preview before activation |
| External Cashboard dependency | High | High | Build local rule engine or acquire |

---

## 8. Success Criteria

### Launch Criteria (MVP)
- [ ] Split rule type working
- [ ] Scheduled payment rule working
- [ ] 2-of-2 signing flow complete
- [ ] Basic rule management UI
- [ ] Execution logging and history

### 30-Day Goals
- [ ] 10 businesses with active rules
- [ ] $10,000 automated volume
- [ ] 99% rule execution success rate
- [ ] 3 rule templates available

### 90-Day Goals
- [ ] 100 businesses
- [ ] $100,000 automated volume
- [ ] Visual no-code rule builder
- [ ] Webhook trigger support
- [ ] Analytics dashboard

---

## 9. Open Questions

- [ ] Build rule engine locally or integrate with external Cashboard?
- [ ] What approval threshold requires manual review vs auto-execute?
- [ ] Should rules be on-chain (immutable) or off-chain (flexible)?
- [ ] How to handle rule conflicts (two rules triggered simultaneously)?
- [ ] Fee structure: per-transaction, subscription, or hybrid?
- [ ] Should Cashboard have its own token for governance?

---

## 10. Appendix

### Related Documents
- Schematic: [To be created]
- External platform: www.cashboard.website
- Repo: `/Volumes/2026/Projects/bitcoin-corp-website`

### Key Files (Current)
| File | Purpose |
|------|---------|
| `app/cashboard/page.tsx` | Marketing/landing page |
| `lib/wallet.ts` | 2-of-2 multisig creation |
| `app/api/wallets/*` | Wallet management APIs |
| `components/wallet/*` | Signing UI components |

### Changelog
| Date | Change | Author |
|------|--------|--------|
| 2026-01-25 | Initial draft from investigation | Claude |
