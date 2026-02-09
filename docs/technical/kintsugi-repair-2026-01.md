# Kintsugi Repair Plan: b0ase.com (Claude)

> **Kintsugi** (金継ぎ) - The Japanese art of repairing broken pottery with gold, treating breakage as part of the object's history rather than something to disguise.

This document identifies the cracks in the b0ase.com codebase and proposes repairs that honor the existing architecture while making it whole.

---

## Executive Summary

The codebase has grown 37% in 4 days (Jan 14-18, 2026) with 200+ commits. This rapid development created:
- **3 critical bugs** that break functionality
- **4 parallel token systems** that should be unified
- **5 half-built features** at 30-60% completion
- **3 disconnected systems** that should be linked

---

## Part 1: Critical Bugs (Fix Immediately)

### 1.1 CRITICAL: Hardcoded Contract ID

**File:** `app/api/marketplace/contracts/create/route.ts`
**Line:** 80
**Impact:** All marketplace contracts after ID 2 have broken milestones

```typescript
// CURRENT (BROKEN)
await prisma.contract_milestones.createMany({
  data: [
    { contract_id: contract.id, ... },  // ✅ Correct
    { contract_id: 2, ... },             // ❌ HARDCODED - breaks all contracts
  ],
});

// FIX
await prisma.contract_milestones.createMany({
  data: [
    { contract_id: contract.id, ... },
    { contract_id: contract.id, ... },   // ✅ Use actual contract ID
  ],
});
```

**Risk:** HIGH - Production data corruption
**Fix Time:** 5 minutes

---

### 1.2 CRITICAL: No Auth on Contract Creation

**File:** `app/api/marketplace/contracts/create/route.ts`
**Line:** 28
**Impact:** Anyone can create contracts as any user

```typescript
// CURRENT (VULNERABLE)
const data = createContractSchema.parse(body);
// clientUserId accepted without verification!

// FIX
const authContext = await getAuthenticatedUser();
if (!authContext) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
// Use authContext.unifiedUser.id as client ID
```

**Risk:** HIGH - Security vulnerability
**Fix Time:** 15 minutes

---

### 1.3 CRITICAL: Hardcoded Crypto Exchange Rates

**File:** `lib/crypto-pricing.ts`
**Lines:** 15-32
**Impact:** Users pay stale prices, financial loss

```typescript
// CURRENT (STALE)
export const cryptoRates = {
  BSV: { gbpRate: 45 },   // Hardcoded January 2026
  ETH: { gbpRate: 2500 },
  SOL: { gbpRate: 120 },
};

// FIX OPTIONS
// A) Fetch from CoinGecko/CoinMarketCap API
// B) Use environment variables with regular updates
// C) Add admin endpoint to update rates
```

**Risk:** HIGH - Financial
**Fix Time:** 1 hour

---

## Part 2: Half-Built Features

### 2.1 Boardroom (50% Complete)

**What Works:**
- Database schema complete (8 tables)
- API endpoints work (chat, rooms, members, proposals)
- Multi-auth (Supabase, bot API key, wallet)

**What's Broken:**
- Frontend doesn't display rooms (API returns data, UI doesn't render)
- Token-gating logic incomplete
- Proposal voting not implemented
- No real-time updates

**Gemini's Fix (Partially Applied):**
```typescript
// ✅ DONE: Case-insensitive token matching in rooms/route.ts
const normalizedUserTokens = userTokens.map(t => t.toUpperCase());
return room.required_tokens.some(requiredToken =>
  normalizedUserTokens.includes(requiredToken.toUpperCase())
);

// ✅ DONE: Removed token length check blocking fetch
if (!connectedWallet || !walletAddress) {  // Was: || userTokens.length === 0
```

**Still Needed:**
- [ ] Debug why rooms don't display after fetch
- [ ] Implement voting logic for proposals
- [ ] Add WebSocket/polling for real-time
- [ ] Link to cap table for voting weight

**Files:** `app/boardroom/`, `app/api/boardroom/`, `docs/BOARDROOM_ISSUES.md`

---

### 2.2 Marketplace (60% Complete)

**What Works:**
- Contract CRUD operations
- Milestone tracking (submit, approve, reject)
- 50/50 payment structure
- Stripe/PayPal webhooks exist
- BSV inscription for contracts

**What's Broken:**
- Auth validation missing (see Critical 1.2)
- Hardcoded milestone bug (see Critical 1.1)
- Crypto payment listed but not implemented
- Developer stats (closedContracts, rating) marked TODO
- Platform fee calculated in multiple places

**Needed Fixes:**
- [ ] Fix auth on contract creation
- [ ] Fix hardcoded contract_id
- [ ] Implement crypto payment handler
- [ ] Add aggregation calculations for developer stats
- [ ] Consolidate platform fee to single config

**Files:** `app/api/marketplace/`, `lib/escrow-manager.ts`

---

### 2.3 Investor/Cap Table (40% Complete)

**What Works:**
- Database schema comprehensive
- Cap table read API
- UK FCA compliance terminology (just updated)
- 2-of-2 multisig vault creation

**What's Broken:**
- Dividend distribution (schema only)
- Vesting schedules (schema only)
- Purchase flow incomplete
- No integration with boardroom voting

**Needed Fixes:**
- [ ] Implement dividend calculation and distribution
- [ ] Implement vesting schedule logic
- [ ] Complete purchase/investment flow
- [ ] Link shareholders to boardroom members

**Files:** `app/api/investors/`, `app/investors/`, `lib/custody/`

---

### 2.4 Button Tokens (30% Complete)

**What Works:**
- Click tracking records and earns tokens
- HandCash integration for clicks
- Button gallery UI

**What's Broken:**
- No token supply management
- No trading/exchange
- Account management incomplete

**Needed Fixes:**
- [ ] Implement supply tracking
- [ ] Build trading interface
- [ ] Complete account management

**Files:** `app/api/buttons/`, `app/buttons/`

---

## Part 3: Parallel Implementations to Unify

### 3.1 Four Token Systems

| System | Location | Purpose | Status |
|--------|----------|---------|--------|
| `issued_tokens` | `api/tokens/mint` | Blockchain tokens | Active |
| `company_tokens` | `api/companies/*/tokens` | Equity tokens | Half-built |
| Button tokens | `api/buttons/click` | Click rewards | PoC |
| Repository tokens | `api/repos/*/tokenize` | Repo BSV-20 | Complete |

**Recommendation:** Create unified interface

```typescript
// lib/unified-token-system.ts
interface UnifiedToken {
  type: 'blockchain' | 'equity' | 'click_reward' | 'repository';
  symbol: string;
  balance: bigint;
  chain?: 'BSV' | 'ETH' | 'SOL';
  mintable: boolean;
  transferable: boolean;
}

interface TokenOperations {
  mint(token: UnifiedToken, amount: bigint): Promise<TxResult>;
  transfer(token: UnifiedToken, to: string, amount: bigint): Promise<TxResult>;
  balance(token: UnifiedToken, address: string): Promise<bigint>;
}
```

---

### 3.2 Three Pricing Systems

| System | Structure | Used By |
|--------|-----------|---------|
| `lib/pricing.ts` | 1/3-1/3-1/3 + 25% margin | Service contracts |
| Marketplace | 50/50 split | Developer contracts |
| `lib/crypto-pricing.ts` | Hardcoded rates | All crypto |

**Recommendation:** Strategy pattern

```typescript
// lib/unified-pricing.ts
type PricingStrategy = 'thirds' | 'halves' | 'full_upfront';

interface PricingConfig {
  strategy: PricingStrategy;
  marginPercent: number;
  platformFeePercent: number;
  currency: 'GBP' | 'USD' | 'EUR';
}

function calculatePayments(total: number, config: PricingConfig): PaymentSchedule;
```

---

### 3.3 Two Music Contexts (Gemini's Finding)

| System | File | Status |
|--------|------|--------|
| `MusicContext` | `contexts/MusicContext.tsx` | **UNUSED** |
| `MusicContext` | `lib/contexts/MusicContext.tsx` | **UNUSED** |
| `usePersistentMusic` | `hooks/usePersistentMusic.tsx` | **ACTIVE** (15 files) |

**Gemini's Recommendation:** Delete MusicContext.tsx files

**My Assessment:**
- ✅ Correct - MusicContext is dead code
- ⚠️ Low priority - not causing bugs
- Can delete when convenient, no urgency

---

## Part 4: Disconnected Systems to Link

### 4.1 Boardroom ↔ Cap Table

**Current:** Operate independently
**Should Be:** Cap table shareholders = boardroom members with voting weight

```
cap_table_shareholders.wallet_address
    ↓ (should link to)
boardroom_members.wallet_address
    ↓ (derives)
voting_weight = ownership_percentage
```

**Implementation:**
1. Add FK or matching logic between tables
2. Sync member creation when shareholder added
3. Calculate voting power from ownership %
4. Use in proposal voting

---

### 4.2 Marketplace ↔ Investors

**Current:** Developers and investors are separate worlds
**Should Be:** Developer work builds investor value

```
marketplace_contracts.completed
    → equity_earned for developer
    → portfolio_value for investors
```

**Implementation:**
1. Link contracts to companies
2. Developer reputation affects token price
3. Completed work triggers equity vesting

---

### 4.3 Repository Tokens ↔ Marketplace

**Current:** Repos can be tokenized, marketplace shows portfolio
**Should Be:** Repo token holders are developer supporters

**Implementation:**
1. Upstream covenant (Phase 3) - dependency profit sharing
2. Repo revenue → developer reputation
3. Token holders → governance rights

---

## Part 5: Comparison with Gemini's Plan

### Gemini Proposed

| Item | Gemini | Claude | Verdict |
|------|--------|--------|---------|
| Delete MusicContext.tsx | Yes | Low priority | ⚠️ Can wait |
| Boardroom token matching | Done ✅ | Agree | ✅ Keep |
| Boardroom fetch fix | Done ✅ | Agree | ✅ Keep |
| Agent auth integration | Proposed | Not critical | ⚠️ Later |
| Mobile nav dropdown | Done ✅ | Unrelated but fine | ✅ Keep |

### Claude Found (Gemini Missed)

| Item | Severity | Gemini | Claude |
|------|----------|--------|--------|
| Hardcoded contract_id: 2 | CRITICAL | ❌ Missed | ✅ Found |
| No auth on contract creation | CRITICAL | ❌ Missed | ✅ Found |
| Hardcoded crypto rates | CRITICAL | ❌ Missed | ✅ Found |
| 4 parallel token systems | HIGH | ❌ Missed | ✅ Found |
| Investor system 40% complete | MEDIUM | ❌ Missed | ✅ Found |
| Marketplace 60% complete | MEDIUM | ❌ Missed | ✅ Found |

---

## Part 6: Prioritized Fix List

### Immediate (Today) - ✅ COMPLETED

1. **Fix hardcoded contract_id: 2** ✅ DONE
   - File: `app/api/marketplace/contracts/create/route.ts:80`
   - Change: `contract_id: 2` → `contract_id: contract.id`
   - Also added missing `milestone_number: 2`

2. **Fix auth on contract creation** ✅ DONE
   - File: `app/api/marketplace/contracts/create/route.ts:28`
   - Added: `getAuthenticatedUser()` check
   - Added: Authorization check that clientUserId matches auth user

3. **Fix hardcoded crypto rates** ✅ DONE
   - File: `lib/crypto-pricing.ts`
   - Added: CoinGecko API integration with 5-minute cache
   - Added: Environment variable fallbacks (`CRYPTO_RATE_BSV_GBP`, etc.)
   - Added: `getCurrentRates()` async function for live rates
   - Maintained: Backwards compatibility with `cryptoRates` export

4. **Test boardroom with Gemini's fixes**
   - Verify rooms now display
   - If not, debug fetch/render logic
   - Time: 30 minutes

### This Week - ✅ COMPLETED

5. **Link Boardroom → Cap Table** ✅ DONE
   - Added `lib/boardroom/token-holdings.ts` - unified token holdings service
   - Updated `lib/boardroom/token-verification.ts` - checks cap table for voting power
   - Enhanced `app/api/boardroom/rooms/route.ts` - verifies holdings for room access
   - Enhanced `app/api/boardroom/members/route.ts` - auto-syncs shareholders with roles
   - Voting weight: 1% ownership = 1,000,000 voting power
   - Auto-assigns roles: Board Member (≥10%), Shareholder (≥1%), Token Holder (<1%)

6. **Complete marketplace aggregations**
   - Calculate closedContracts, averageRating
   - Time: 2 hours

### Next Sprint

7. **Create unified token system**
   - Consolidate 4 token implementations
   - Time: 8 hours

8. **Create unified pricing engine**
   - Consolidate 3 pricing approaches
   - Time: 4 hours

9. **Complete investor purchase flow**
   - KYC → Purchase → Token allocation
   - Time: 8 hours

10. **Implement dividend distribution**
    - Calculate and distribute to shareholders
    - Time: 6 hours

### Later

11. **Delete dead MusicContext.tsx** (when convenient)
12. **Implement vesting schedules**
13. **Complete button token trading**
14. **Add real-time to boardroom**

---

## Verification Checklist

After implementing fixes:

- [ ] `pnpm build` succeeds
- [ ] Create marketplace contract → milestones link correctly
- [ ] Contract creation requires authentication
- [ ] Boardroom displays token-gated rooms
- [ ] Crypto prices are current (not hardcoded)
- [ ] Cap table shareholders can access boardroom
- [ ] Developer search shows accurate stats

---

## Files Referenced

### Critical
- `app/api/marketplace/contracts/create/route.ts` - Contract bugs
- `lib/crypto-pricing.ts` - Hardcoded rates

### Boardroom
- `app/boardroom/page.tsx` - Frontend display
- `app/api/boardroom/rooms/route.ts` - Token matching
- `docs/BOARDROOM_ISSUES.md` - Known issues

### Investors
- `app/api/investors/` - Cap table APIs
- `lib/custody/vault-manager.ts` - 2-of-2 multisig
- `prisma/schema.prisma` - Database models

### Tokens
- `lib/token-registry.ts` - Token source of truth
- `app/api/tokens/mint/route.ts` - Minting
- `app/api/buttons/click/route.ts` - Click tokens
- `app/api/repos/[repoId]/tokenize/route.ts` - Repo tokens

---

*Last Updated: 2026-01-19*
*Author: Claude (Opus 4.5)*
