# b0ase Master Plan

> Sequential logic. Does this make sense?

**Status**: Active Investigation - Iteration 2 Complete
**Last Updated**: 2026-01-25 03:30
**Confidence**: HIGH (payment infrastructure fully mapped)

---

## 1. Primitive Inventory

**ACTUAL STATUS FROM CODE REVIEW:**

| Primitive | Location | Function | Status | Notes |
|-----------|----------|----------|--------|-------|
| ScrollPay | /tools/scrollpay | Pay-to-scroll demo, Intersection Observer | **FUNCTIONAL** | Frontend only, no backend |
| Registry | /tools/registry | Multi-tab registration (users, companies, projects, tokens) | **FUNCTIONAL** | Uses /api/registry/* |
| Mint | /tools/mint | Token minting form | **PARTIAL** | Fields collected but not all passed to API |
| Cap Table | /tools/cap | Token ownership viewer, CSV export | **FUNCTIONAL** | Uses /api/cap-table/* |
| Dividends | /tools/dividends | Create/view dividend distributions | **FUNCTIONAL** | Uses /api/dividends |
| BSV Scripts | /tools/scripts | Landing page for 8 script types | **FUNCTIONAL** | Navigation only, child pages TBD |
| Video Gen | /video/editor/generator | AI video generation | ? | Not yet investigated |
| TX Broadcaster | /tx-broadcaster | Raw BSV transaction broadcast | ? | Not yet investigated |
| Money Buttons | /buttons | Payment trigger widgets | **DISCONNECTED** | UI exists, /api/buttons/press works, but NOT wired together |
| Video Studio | /video/editor/studio | Video editing | ? | |
| Chaos Mixer | /video/editor | Glitch effects | ? | |
| Auto-Book | /tools/auto-book | AI book outlines | ? | |
| Graphic Designer | /tools/graphic-designer | OG image generation | ? | |
| SCADA | /tools/scada | Industrial control | ? | |
| Button Creator | /tools/button-graphic-creator | Button graphics | ? | |
| Course Maker | /tools/video-course-maker | Video course production | ? | |
| KYC Verify | /tools/verify | Identity verification | ? | |
| Transfers | /tools/transfer | Token movement | ? | |
| ID Tokeniser | /tools/id-tokeniser | Identity hashing | ? | |

**Key Finding**: Most primitives are UI-complete but depend on backend APIs. ScrollPay is pure frontend demo. **MoneyButtons has both UI and API but they're not connected** - this is the critical wiring gap.

---

## 2. Cashboard Reality Check

**CRITICAL FINDING**: Cashboard page is **marketing copy with zero automation implementation**.

### What EXISTS in bitcoin-corp-website:
- 2-of-2 multisig wallet generation ✓
- Balance lookups from blockchain ✓
- User authentication ✓
- Manual withdrawal request creation ✓
- Transaction history retrieval ✓

### What does NOT EXIST:
| Feature Claimed | Reality |
|-----------------|---------|
| Conditional Payments | ❌ No rules engine |
| Automated Dividends | ❌ No dividend logic |
| Payroll & Operations | ❌ No scheduler |
| Cascading Automations | ❌ No triggers |
| "Set it once, runs forever" | ❌ Manual signing required |

**Conclusion**: Cashboard is wallet custody + aspirational marketing. The automation vision exists but isn't built yet.

### What's Needed to Make Cashboard Real:
1. Workflow automation engine
2. Cron job scheduler with blockchain event listeners
3. Smart contract templating and execution
4. Rule builder for payment conditions
5. Invoice system with automatic execution
6. Dividend distribution logic

---

## 3. Payment Infrastructure Analysis

**CRITICAL FINDING**: Payment infrastructure EXISTS but is DISCONNECTED from dividends.

### What Actually Executes Payments:

| Route | Purpose | Payment Execution | Notes |
|-------|---------|-------------------|-------|
| `/api/buttons/press` | Button press trigger | **YES** (HandCash) | Sends $0.01 to 'b0ase' handle |
| `/api/buttons/click` | Token distribution | **NO** | Records tokens in DB only |
| `/api/dividends` | Create distributions | **NO** | Records in DB only |
| `/api/dividends/[id]/process` | Process dividends | **NO** | Creates payment records, no execution |
| `/api/pay/create-order` | Multi-party splits | **YES** (HandCash) | Upstream beneficiary splits! |
| `/api/kintsugi/pay` | Setup fee | **YES** (HandCash) | Single payment to 'b0ase' |

### HandCash Service (lib/handcash-service.ts):
- `sendPayment()` - Single payment ✓
- `sendMultiPayment()` - Multi-output irrigation ✓
- `getSpendableBalance()` - Balance check ✓
- `transferItems()` - Ordinal transfers ✓
- `getHouseAccount()` - Platform wallet ✓

### THE GAP:
Dividends system creates `dividend_payments` records with `status: 'pending'` and `payment_method: 'bank_transfer'` but **never calls HandCash to execute**. The irrigation plumbing exists but isn't connected!

### What Needs Connecting:
1. Dividends → HandCash `sendMultiPayment()`
2. Button clicks → actual BSV transactions (currently just DB records)
3. Automation triggers → scheduled payment execution

---

## 4. External Project Status

| Project | Status | Size | Notes |
|---------|--------|------|-------|
| **Bitcoin-OS** | ACTIVE | 819 files | Full Next.js app, wallet/OS features |
| **AI-VJ** | ACTIVE | 10,713 files | Electron + React, video/effects heavy |
| **Penshun** | ACTIVE | 107 files | Next.js (simply-stream), Hero WIP |
| **ninja-punk-girls-com** | ACTIVE | 105,974 files | Massive, video-heavy, Hetzner VPS |
| **audex** | SKELETON | 18 files | Minimal, early stage |

---

## 5. Composition Map

How do primitives combine into tools?

| Tool | Should Compose From | Evidence | Status |
|------|---------------------|----------|--------|
| Divvy | Dividends + Cap Table + Transfers | Logical | **PARTIAL** - dividends records exist, no payment execution |
| MoneyButton Store | Money Buttons + Mint + Button Creator | Logical | **PARTIAL** - button press triggers payment, click just records |
| Kintsugi | Registry + Cap Table + Dividends + KYC | Logical | **FUNCTIONAL** - has /api/kintsugi/pay that executes |
| Pay/Create-Order | Tokenized Repos + Upstream Beneficiaries | **CODE EXISTS** | **FUNCTIONAL** - multi-party splits work! |
| Cashboard | Everything + Automation Engine | **DOES NOT EXIST** | Marketing only |

**Key Finding**: `/api/pay/create-order` is THE irrigation primitive in action - it calculates splits based on upstream beneficiaries and executes multi-party payments via HandCash. This is the model for how dividends should work.

---

## 6. Gap Analysis

### Critical Gaps

1. **Dividends Don't Execute**
   - `/api/dividends/[id]/process` creates payment records
   - Sets `payment_method: 'bank_transfer'` and `status: 'pending'`
   - **Never calls HandCash** to actually send money
   - The split calculation logic exists but stops at DB records

2. **Button Click vs Button Press Disconnect**
   - `/api/buttons/press` - Executes $0.01 payment via HandCash ✓
   - `/api/buttons/click` - Just records tokens in DB, no BSV transaction
   - Vision: Every click should be an on-chain event
   - Reality: Only "press" triggers real payment

3. **No Automation Engine**
   - Cashboard's core promise is unbuilt
   - No cron, no triggers, no cascading payments
   - The plumbing exists (HandCash service) but no scheduler

4. **MoneyButton UI Disconnect**
   - `/buttons` and `/moneybuttons` are navigation UIs with physics animations
   - They don't call `/api/buttons/press` - just navigate to portfolio pages
   - The actual payment trigger API exists but isn't wired to the UI

### What EXISTS and Works:
- HandCash payment infrastructure ✓
- Multi-party payment splits (`sendMultiPayment`) ✓
- Upstream beneficiary calculation ✓
- Token balance tracking ✓
- Dividend calculation logic ✓

### What's MISSING:
- Connect dividends to HandCash execution
- Connect MoneyButton UI to payment API
- Automation/cron scheduler
- Webhook event system
- Cascading trigger rules

---

## 7. Build Sequence (Proposed)

### Phase 1: Connect MoneyButton UI to Payment API ⚡ QUICK WIN
- Wire `/buttons` and `/moneybuttons` to call `/api/buttons/press`
- Every MoneyButton click should trigger HandCash payment
- This makes THE primitive functional

### Phase 2: Connect Dividends to HandCash 💰 HIGH IMPACT
- Modify `/api/dividends/[id]/process` to call `handcashService.sendMultiPayment()`
- Use `/api/pay/create-order` as the model (it already does multi-party splits)
- Change `payment_method` from 'bank_transfer' to 'handcash'
- Add admin approval workflow before execution

### Phase 3: Unify Button Click with On-Chain 🔗 MEDIUM
- Make `/api/buttons/click` create actual BSV transaction records
- Connect token balance changes to blockchain inscriptions
- Every click = verifiable on-chain event

### Phase 4: Build Automation Engine 🤖 COMPLEX
- Cron scheduler for recurring dividend payments
- Webhook listeners for external triggers
- Rule builder for conditional payment logic
- Event cascade system (payment A triggers payment B)
- This is what makes Cashboard's vision real

### Phase 5: Deploy to Stacks
- Bitcoin OS apps first
- NPG Apps second
- Clients third

---

## 8. Open Questions

1. ~~**MoneyButton**: What does it actually do? Is it functional?~~ **ANSWERED**: UI exists, payment API exists, but they're not connected
2. ~~**API Completeness**: Do /api/registry/*, /api/dividends, /api/cap-table/* work end-to-end?~~ **PARTIAL**: APIs work but dividends don't execute payments
3. **Wallet Integration**: How does bitcoin-corp-website wallet connect to b0ase.com tools?
4. **External Services**: cashboard.website and senseii-zeta.vercel.app - are these deployed? functional?
5. ~~**Irrigation Model**: Is it conceptual or does money actually flow?~~ **ANSWERED**: Plumbing exists, some water flows (button press, kintsugi pay), but main irrigation (dividends) is blocked

### New Questions:
6. **HOUSE_AUTH_TOKEN**: Is the House account configured? Can platform-initiated payments work?
7. **Demo Mode**: Is HandCash running in demo mode in production? (checks for HANDCASH_APP_ID/SECRET)
8. **KYC Integration**: Does cap_table_shareholders.kyc_status actually get verified anywhere?
9. **Tokenized Repos**: How many repos have upstream_beneficiaries configured?

---

## Investigation Log

| Iteration | Date | Focus | Findings | Confidence |
|-----------|------|-------|----------|------------|
| 0 | 2026-01-25 | Initial sketch | Structure only | Low |
| 1 | 2026-01-25 02:15 | Primitives + Cashboard + External repos | 6 primitives assessed, Cashboard is marketing, 4/5 external projects active | Medium |
| 2 | 2026-01-25 03:30 | Payment Infrastructure Deep Dive | HandCash service fully implemented, dividends don't execute, button press works, pay/create-order does multi-party splits | High |

---

## Next Investigation Priorities

1. [x] MoneyButton (/buttons) - THE primitive - **INVESTIGATED**: UI/API disconnect found
2. [ ] TX Broadcaster - blockchain interaction
3. [x] API endpoints - do they actually work? - **INVESTIGATED**: payment APIs work, dividends stop at DB
4. [ ] Bitcoin-OS repo - understand the OS layer
5. [ ] ninja-punk-girls-com - understand NPG stack
6. [ ] **NEW**: Wire MoneyButton UI to payment API (Phase 1 quick win)
7. [ ] **NEW**: Connect dividends to HandCash execution (Phase 2)

---

**Confidence Assessment**: HIGH. We now understand the full payment infrastructure. The plumbing (HandCash service) works. The gap is clear: dividends calculate but don't execute, MoneyButton UI doesn't call payment API. Phase 1 and 2 are well-defined quick wins.
