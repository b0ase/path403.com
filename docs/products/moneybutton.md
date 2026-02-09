# MoneyButton - Product Requirements Document

> **Status**: Draft
> **Owner**: Richard
> **Last Updated**: 2026-01-25
> **Token**: $MONEYBUTTON (1 billion supply)
> **Repo**: /Volumes/2026/Projects/moneybutton2

---

## 1. Executive Summary

**One-liner**: Press a button, pay a penny, own a piece of the button.

**Problem**: Creating and distributing tokenized equity is complex, expensive, and boring. Most people will never experience ownership in something viral.

**Solution**: A dopamine-optimized clicker game where every press costs $0.01 and grants 1 token. 100% of revenue flows back to token holders as dividends. Exponential bonding curve rewards early believers.

**Target User**:
- Primary: Crypto-curious normies who want skin in the game
- Secondary: Creators who want to tokenize their brand/handle
- Tertiary: Degens looking for the next viral token play

---

## 2. Business Model

### Revenue Streams
| Stream | Description | Pricing |
|--------|-------------|---------|
| Button Presses | $0.01 per press on $MONEYBUTTON | 100% to holders |
| Custom Buttons | Users mint their own $HANDLE tokens | 1% platform fee |
| Welcome Gifts | Onboarding subsidy (loss leader) | -$0.01 per new user |

### Token Economics
- **Token**: $MONEYBUTTON
- **Supply**: 1,000,000,000 (1 billion) fixed
- **Bonding Curve**: Exponential - `Price = 10^(-7 + 13 × (token# - 1) / 999,999,999)`
  - Token #1: $0.0000001
  - Token #500M: ~$0.01
  - Token #1B: $1,000,000
- **Dividend Flow**: 100% of press revenue distributed proportionally to all holders
- **Utility**: Hold tokens → receive dividends from all future presses

### Key Metrics
- **North Star**: Daily Active Pressers (DAP)
- **Secondary**:
  - Tokens distributed per day
  - Dividend yield (annualized)
  - Custom buttons created
  - Viral coefficient (referrals per user)

---

## 3. Core Features

### MVP (Live)
1. **The Button**
   - User story: As a user, I want to press a button and feel rewarded so that I keep coming back
   - Implementation: Giant animated button with escalating "chaos modes" (calm → chaos → transcendence)
   - Acceptance: Button press → $0.01 deducted → 1 token added → visual/audio feedback

2. **HandCash Login**
   - User story: As a user, I want to login with my wallet so I can pay and receive dividends
   - Implementation: HandCash OAuth with PAY and SIGN_DATA permissions
   - Acceptance: One-click login, persistent session, handle displayed

3. **Token Balance Display**
   - User story: As a holder, I want to see my tokens so I know my stake
   - Implementation: Real-time counter with animations
   - Acceptance: Balance updates immediately after press, shows pending dividends

4. **Dividend Distribution**
   - User story: As a holder, I want to receive my share of revenue automatically
   - Implementation: Proportional distribution tracked in database, claimable
   - Acceptance: Dividends accrue per press, withdrawable to wallet

5. **Withdrawal to Yours Wallet**
   - User story: As a holder, I want to withdraw my tokens on-chain
   - Implementation: BSV-20 inscription via Yours Wallet connection
   - Acceptance: Tokens appear in Yours Wallet as BSV-20 ordinals

### Phase 2 (Custom Buttons)
- [x] `/mint` - Create your own $HANDLE button
- [x] `/button/[handle]` - Custom button pages
- [x] Per-button token tracking
- [ ] Button discovery/marketplace
- [ ] Leaderboards (most pressed, highest value)

### Future
- [ ] Jackpot system (random multipliers)
- [ ] Achievements and streaks
- [ ] Social features (follow buttons, notifications)
- [ ] Mobile app
- [ ] API for embedding buttons

---

## 4. Technical Architecture

### Primitives Used
| Package | Purpose |
|---------|---------|
| `@b0ase/bonding-curve` | Exponential price calculation |
| `@b0ase/dividend-engine` | Proportional dividend distribution |
| `@b0ase/handcash` | Wallet authentication and payments |
| `@b0ase/yours-wallet` | BSV-20 token withdrawals |
| `@b0ase/inscription-service` | On-chain token inscriptions |

### External Dependencies
- **HandCash Connect** (v0.8.11): OAuth, micropayments, signing
- **Yours Wallet Provider** (v3.7.0): BSV-20 ordinal transfers
- **js-1sat-ord** (v0.1.91): Ordinal inscription creation
- **@bsv/sdk** (v1.9.31): Transaction signing

### Data Flow
```
[Press Button] → [HandCash Payment $0.01] → [Increment Token Balance]
      ↓                                              ↓
[Chaos Animation]                          [Calculate Dividends]
                                                     ↓
                                           [Update All Holders]
```

### Database Schema (Prisma)
- **User**: HandCash handle, token balance, pending dividends
- **UserToken**: Per-user, per-button balances (for custom buttons)
- **Transaction**: Every press logged with timestamp
- **TokenSupply**: Global supply tracking
- **ThemedTokenSupply**: Per-button supply
- **GiftVoucher**: Referral/onboarding gifts
- **Button**: Custom button configs
- **IssuedToken**: Custom tokens minted

### Key Integrations
- **Wallet**: HandCash (primary), Yours Wallet (withdrawal)
- **Payment**: HandCash micropayments ($0.01)
- **Auth**: HandCash OAuth → JWT session
- **Blockchain**: BSV mainnet via WhatsOnChain

---

## 5. User Flows

### Primary Flow: Press the Button
1. User lands on homepage, sees giant pulsing button
2. User clicks "Login with HandCash"
3. HandCash OAuth redirects back with session
4. User presses button
5. $0.01 deducted via HandCash
6. Token balance increments with animation
7. Chaos level escalates (sounds, confetti, visual effects)
8. Repeat until dopamine exhaustion

### Secondary Flow: Withdraw Tokens
1. User clicks "Withdraw"
2. Prompted to connect Yours Wallet
3. User enters amount to withdraw
4. System creates BSV-20 inscription
5. Tokens appear in Yours Wallet
6. Database balance decremented

### Custom Button Flow
1. User navigates to `/mint`
2. Enters desired handle (e.g., "michael")
3. Pays minting fee
4. Button created at `/button/michael`
5. User shares link
6. Pressers buy $MICHAEL tokens
7. 99% to holders, 1% platform fee

---

## 6. Competitive Landscape

| Competitor | Their Approach | Our Differentiation |
|------------|----------------|---------------------|
| friend.tech | Social tokens, chat access | We're simpler: just press, no chat complexity |
| pump.fun | Meme token launcher | We have game mechanics, not just launch |
| Cookie Clicker | Idle game, no real money | Real stakes, real ownership |
| Traditional stocks | Complex, slow, expensive | One-click, instant, $0.01 entry |

---

## 7. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Gambling classification | Medium | High | No randomness in core mechanic (deterministic) |
| HandCash dependency | Medium | High | Abstract wallet layer, add backup providers |
| Viral spike overwhelms infra | Medium | Medium | Rate limiting, queue system, CDN |
| Token price speculation | High | Low | Transparent bonding curve, no promises |
| Copycat competitors | High | Low | First mover, brand, network effects |

---

## 8. Success Criteria

### Launch Criteria (MVP) ✅
- [x] Button pressable with HandCash payment
- [x] Token balance tracking
- [x] Dividend calculation
- [x] Withdrawal to Yours Wallet
- [x] Basic chaos mode animations

### 30-Day Goals
- [ ] 1,000 unique pressers
- [ ] 100,000 total presses
- [ ] 10 custom buttons created
- [ ] $1,000 total volume

### 90-Day Goals
- [ ] 10,000 unique pressers
- [ ] 1,000,000 total presses
- [ ] 100 custom buttons
- [ ] $10,000 total volume
- [ ] Button marketplace live

---

## 9. Open Questions

- [ ] Should jackpot/randomness be added? (Gambling risk vs engagement)
- [ ] Optimal chaos mode escalation timing?
- [ ] Custom button pricing (flat fee vs % of supply)?
- [ ] Should dividends auto-compound or require claim?
- [ ] Mobile-first redesign needed?
- [ ] API for third-party button embedding?

---

## 10. Appendix

### Related Documents
- Schematic: [To be created]
- Design: Figma link TBD
- Repo: `/Volumes/2026/Projects/moneybutton2`

### Key Files
| File | Purpose |
|------|---------|
| `app/page.tsx` | Main button page (DopaminePage) |
| `lib/bonding-curve.ts` | Price calculation |
| `lib/dividend.ts` | Dividend distribution |
| `lib/handcash.ts` | Wallet integration |
| `app/api/press/route.ts` | Core press endpoint |

### Changelog
| Date | Change | Author |
|------|--------|--------|
| 2026-01-25 | Initial draft from investigation | Claude |
