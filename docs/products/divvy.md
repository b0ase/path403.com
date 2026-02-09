# Divvy - Product Requirements Document

> **Status**: Draft
> **Owner**: Richard
> **Last Updated**: 2026-01-25
> **Token**: N/A (infrastructure layer)
> **Repo**: /Volumes/2026/Projects/divvy

---

## 1. Executive Summary

**One-liner**: Automated dividend distribution for token-based businesses.

**Problem**: Distributing profits to hundreds or thousands of token holders is manual, error-prone, and expensive. Most token projects promise dividends but never deliver because the logistics are painful.

**Solution**: A dividend engine that takes a pool of funds and automatically calculates and distributes proportional payments to all token holders with one click.

**Target User**:
- Primary: Token issuers who promised dividend rights
- Secondary: DAOs distributing treasury to members
- Tertiary: Any organization with proportional payouts (royalties, profit sharing)

---

## 2. Business Model

### Revenue Streams
| Stream | Description | Pricing |
|--------|-------------|---------|
| Distribution Fee | Per dividend distribution executed | 0.5% of pool |
| Premium Features | Advanced analytics, scheduling, compliance | Subscription |
| White-label | Branded dividend portal for token projects | Custom |

### Key Metrics
- **North Star**: Total Dividends Distributed (TDD)
- **Secondary**:
  - Unique token projects using Divvy
  - Average distribution size
  - Holder satisfaction (claim rate)
  - Time from creation to full distribution

---

## 3. Core Features

### MVP (Exists)

1. **Create Distribution**
   - User story: As a token issuer, I want to create a dividend pool for my holders
   - Implementation: Admin specifies total amount, period label, distribution type
   - Acceptance: Distribution created with calculated per-token dividend

2. **Proportional Calculation**
   - User story: As a system, I need to calculate fair dividends based on holdings
   - Formula: `dividendPerToken = totalPool / totalSupply`
   - Then: `holderDividend = holderBalance × dividendPerToken`
   - Acceptance: All holders see correct proportional amount

3. **Claim Dividends**
   - User story: As a token holder, I want to claim my dividends to my wallet
   - Implementation: User triggers claim → HandCash payment sent
   - Acceptance: BSV arrives in holder's HandCash wallet

4. **Token Holder Management**
   - User story: As an admin, I want to manage token holder balances
   - Implementation: Admin CRUD for holder records, bulk import
   - Acceptance: Balances reflect actual token ownership

5. **Distribution History**
   - User story: As a holder, I want to see my dividend history
   - Implementation: Per-user view of all distributions and claims
   - Acceptance: Full audit trail visible

### Phase 2 (Should Have)
- [ ] Automated scheduling (monthly, quarterly)
- [ ] On-chain token balance sync (no manual entry)
- [ ] Multi-token support (one Divvy instance, many tokens)
- [ ] Minimum holding period requirements
- [ ] KYC-gated distributions

### Future (Nice to Have)
- [ ] Dividend reinvestment (auto-buy more tokens)
- [ ] Tax reporting exports
- [ ] Holder communication (announcements, notifications)
- [ ] Governance integration (vote on distribution amounts)
- [ ] Cross-chain token support

---

## 4. Technical Architecture

### Primitives Used
| Package | Purpose |
|---------|---------|
| `@b0ase/dividend-engine` | Core calculation logic |
| `@b0ase/handcash` | Wallet auth and payments |
| `@b0ase/queue-manager` | Batch payment processing |
| `@b0ase/rate-limiter` | HandCash API limits |
| `@b0ase/validation` | Input validation |

### Data Flow
```
┌─────────────────────────────────────────────────────────┐
│                  DIVIDEND DISTRIBUTION                   │
│                                                         │
│  1. Admin creates distribution                          │
│     └─→ totalPool: 10 BSV                              │
│     └─→ period: "Q1 2026"                              │
│                                                         │
│  2. System calculates                                   │
│     └─→ totalSupply: 1,000,000 tokens                  │
│     └─→ dividendPerToken: 0.00001 BSV                  │
│                                                         │
│  3. For each holder:                                    │
│     └─→ Alice: 100,000 tokens → 1.0 BSV               │
│     └─→ Bob: 50,000 tokens → 0.5 BSV                  │
│     └─→ Carol: 10,000 tokens → 0.1 BSV                │
│                                                         │
│  4. Payments queued and executed via HandCash          │
│     └─→ Batch size: 50 per API call                    │
│     └─→ Status tracked per recipient                   │
│                                                         │
│  5. Audit trail recorded                                │
│     └─→ txid for each payment                          │
│     └─→ Success/failure status                         │
└─────────────────────────────────────────────────────────┘
```

### Database Schema (MongoDB)

**DividendDistribution**
```javascript
{
  distributionPeriod: "Q1 2026",
  totalDividendPool: 10.0,
  dividendPerToken: 0.00001,
  distributionType: "regular", // regular, special, emergency, bonus
  status: "completed",
  payments: [{
    tokenHolderId: ObjectId,
    handle: "alice",
    tokenBalance: 100000,
    dividendAmount: 1.0,
    status: "confirmed",
    txId: "abc123...",
    paidAt: Date
  }],
  statistics: {
    totalRecipients: 150,
    successfulPayments: 148,
    failedPayments: 2,
    completionPercentage: 98.67
  }
}
```

**TokenHolder**
```javascript
{
  handcashHandle: "alice",
  npgTokenBalance: 100000,
  isShareholder: true,
  sharePercentage: 10.0,
  totalDividendsEarned: 5.5,
  totalDividendsClaimed: 5.0,
  isActive: true
}
```

### Current Implementation Status

**What Exists:**
- Full dividend calculation and distribution flow
- HandCash OAuth and payment integration
- Admin dashboard for managing distributions
- Token holder CRUD operations
- Claim flow for users
- Batch payment processing (50 per batch)

**What's Stubbed/Missing:**
- Multisig token locking (placeholder addresses)
- Automated scheduling (cron exists but not wired)
- On-chain token balance sync
- Retry logic for failed payments

### Key Integrations
- **Wallet**: HandCash (OAuth + payments)
- **Database**: MongoDB
- **Auth**: HandCash OAuth → JWT
- **Blockchain**: Payments via HandCash API (not direct)

---

## 5. User Flows

### Admin Flow: Create Distribution
1. Admin logs in with HandCash
2. Navigates to "Create Distribution"
3. Enters total pool amount (e.g., 10 BSV)
4. Enters period label (e.g., "Q1 2026")
5. Selects distribution type (regular/bonus/special)
6. System shows preview: X holders, Y per token
7. Admin confirms
8. System batches and sends all payments
9. Dashboard shows progress and completion

### Holder Flow: Claim Dividends
1. Holder logs in with HandCash
2. Sees "Unclaimed Dividends: 0.5 BSV"
3. Clicks "Claim"
4. System sends BSV to their HandCash handle
5. Balance updates, txid shown
6. History updated with claim record

### Admin Flow: Manage Holders
1. Admin navigates to "Token Holders"
2. Views paginated list of all holders
3. Can update individual balances
4. Can bulk import from CSV
5. Can toggle active/inactive status
6. Can set shareholder flag and percentage

---

## 6. Competitive Landscape

| Competitor | Their Approach | Our Differentiation |
|------------|----------------|---------------------|
| Manual spreadsheets | Export holders, calculate, send individually | We automate everything |
| Ethereum dividend contracts | On-chain, gas-expensive, complex | BSV = cheap, HandCash = easy |
| Traditional transfer agents | Slow, expensive, fiat-only | Real-time, cheap, crypto-native |
| Revenue share platforms | Platform-specific, not token-based | We work with any token |

---

## 7. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| HandCash API limits | Medium | Medium | Batching, rate limiting, queue |
| Incorrect balances | Medium | High | On-chain sync, audit tools |
| Payment failures | Low | Medium | Retry logic, manual retry UI |
| Large holder count | Medium | Medium | Pagination, async processing |
| Regulatory (securities) | Medium | High | Clear disclaimers, no US marketing |

---

## 8. Success Criteria

### Launch Criteria (MVP) ✅
- [x] Create distribution with pool amount
- [x] Calculate proportional dividends
- [x] Send payments via HandCash
- [x] Track payment status
- [x] User can view and claim

### 30-Day Goals
- [ ] 5 token projects using Divvy
- [ ] $5,000 total distributed
- [ ] Automated monthly scheduling
- [ ] 99% payment success rate

### 90-Day Goals
- [ ] 20 token projects
- [ ] $50,000 total distributed
- [ ] On-chain balance sync (no manual)
- [ ] Multi-token support
- [ ] White-label option

---

## 9. Open Questions

- [ ] Should Divvy sync balances from on-chain or trust admin input?
- [ ] Minimum holding period before dividend eligibility?
- [ ] Should failed payments auto-retry or require manual trigger?
- [ ] How to handle dust amounts (< $0.01)?
- [ ] Should dividends auto-compound (reinvest) option exist?
- [ ] KYC requirements for larger distributions?
- [ ] Should Divvy support non-BSV tokens (wrapped, multi-chain)?

---

## 10. Appendix

### Related Documents
- Schematic: [To be created]
- Repo: `/Volumes/2026/Projects/divvy`

### Key Files
| File | Purpose |
|------|---------|
| `server/routes/dividends.js` | Core dividend logic |
| `server/routes/tokens.js` | Token holder management |
| `server/models/DividendDistribution.js` | Distribution schema |
| `server/models/TokenHolder.js` | Holder schema |
| `server/services/handcashService.js` | Payment integration |

### API Endpoints
| Endpoint | Purpose |
|----------|---------|
| `POST /api/dividends/admin/create-distribution` | Create new distribution |
| `GET /api/dividends/my-dividends` | User's dividend history |
| `POST /api/dividends/claim` | Claim pending dividends |
| `GET /api/tokens/admin/holders` | List all holders |
| `PUT /api/tokens/admin/holders/:id/balance` | Update holder balance |

### Changelog
| Date | Change | Author |
|------|--------|--------|
| 2026-01-25 | Initial draft from investigation | Claude |
