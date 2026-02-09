# $402 Architecture — Mental Model for LLM Context

## Author Context

This document was written by Claude (Opus) after extensive multi-session collaboration with Richard (@b0ase) on the $402 protocol. It captures the clean mental model after several conceptual pivots and consolidations. If you're an LLM picking this up, treat this as the canonical architecture. Anything that contradicts this from earlier sessions is superseded.

---

## The Five Layers

### Layer 1: The Standard ($402 Token Standard)

**What it is:** A protocol specification. A document. Not a product, not a token.

**What it defines:**

- How HTTP 402 responses signal priced content
- How `$addresses` work (`$example.com/$api/$data` — each `$` segment is an independent market)
- How pricing curves operate (sqrt_decay, fixed, logarithmic, linear with floor)
- How usage pricing operates (time/window metering separate from token price)
- How content gating and token-based access rights function
- How unilateral contracts form through HTTP responses (402 response = standing offer, payment = acceptance)
- Header format compatible with Coinbase's x402 protocol, with additional fields (`treasury_remaining`, `pricing_model`, `accepts`)

**Key principle:** The standard is free and open. Anyone can implement it. It's like HTTP or SMTP. No token required to use the standard. The standard defines two distinct pricing modes:

### BRC Alignment (BSV Stack)

The BSV ecosystem already defines core plumbing that Path402 can sit on top of:

- **BRC‑100**: wallet → app interface (identity, signing, tx handling)
- **BRC‑103/104**: mutual auth + HTTP transport (`/.well-known/auth`, `x-bsv-auth`)
- **BRC‑105**: HTTP 402 paywall + payment proof (preferred for BSV)
- **BRC‑22/24**: overlay submit/lookup for indexed state

Path402’s **EARN / PoW20** layer is additive and not defined by existing BRCs yet.

1. **Access pricing (content tokens):** sqrt_decay where price *decreases* with supply. Early buyers of content pay more for time advantage. Price decays as more people access the content. Every buyer except the last achieves positive ROI through serving revenue.
2. **Treasury pricing (investment tokens):** sqrt_decay where price *increases* as treasury depletes. `price = base / √(treasury_remaining + 1)`. Early buyers get cheap tokens. Price rises as supply sells. This is for funding protocol development and business operations.

These are inverse curves serving different purposes. Both use sqrt_decay math but in opposite directions. Do not confuse them.

---

### Layer 2: The Facilitator (PATH402.com the business)

**What it is:** A commercial entity that operates as an x402 facilitator — a payment verification and settlement service.

**What it does:**

1. Receives payment proofs from clients who paid on any supported chain (BSV, Base, Solana, Ethereum)
2. Verifies the payment is valid on the source chain
3. Inscribes an immutable proof of the transaction on BSV as an ordinal
4. Returns verification confirmation to the content server
5. Charges fees for this service

**Revenue streams:**

| Fee Type | Amount |
|----------|--------|
| Facilitator fee | 20% (2000 bps) of transaction |
| Verification fee | 200 sats per verification |
| Inscription fee | 500 sats per inscription |
| Settlement fee | 0.1% of settlement value |

**The competitive thesis:** As BSV scales (unbounded blocks, sub-cent fees), the cost of inscribing payment proofs decreases. As ETH/Solana/Base usage grows, their fees rise with congestion. PATH402.com captures the spread. It doesn't compete with x402 the protocol (Coinbase built that, Cloudflare adopted it). It competes with Base as the settlement layer by offering cheaper permanent settlement via BSV inscription.

**Multi-chain support:**

| Network | Status | Assets |
|---------|--------|--------|
| BSV | Primary | BSV, BSV-20 tokens |
| Base | Supported | USDC, ETH |
| Solana | Supported | USDC, SOL |
| Ethereum | Supported | USDC, ETH, USDT |

---

### Layer 3: The Token ($PATH402)

**What it is:** Equity in the PATH402.com facilitator business. ONE token. Not two.

**Key facts:**

- Total supply: 1,000,000,000 (1 billion)
- 50% retained by PATH402.com (the business treasury)
- 50% on sale via treasury pricing curve (price increases as supply sells)
- Minted as a 1Sat ordinal inscription on BSV
- Tradeable on 1sat.market and b0ase.com/exchange

**What holding $PATH402 gets you:**

- **Staking:** Stake tokens to earn dividends from facilitator revenue (verification fees, inscription fees, settlement fees)
- **Governance:** (Future) Vote on protocol parameters
- **Registry:** Registered holders appear on the cap table at path402.com/registry

**What holding $PATH402 does NOT get you:**

- It is not required to use the $402 standard
- It is not spent when agents acquire content
- It is not a utility token for protocol operations
- It is not a second token called "$402" — there is only $PATH402

**The $402 token (if it was separately minted) should be deprecated or merged.** The "$402 Token Standard" is the name of the protocol specification. It is not a separate token. The protocol standard and the investment token are different things. The standard is a document. The token is equity. Only $PATH402 exists as a token.

---

### Layer 4: The Exchanges

**path402.com/exchange:** Protocol-specific marketplace. Shows $402-standard content tokens — the access tokens that creators mint for their content using the standard. Example tokens: `$b0ase.com/$blog`, `$b0ase.com/$api`. These are content access tokens priced with access pricing (price decreases with supply).

**b0ase.com/exchange:** The broader marketplace. Lists $PATH402 alongside 79+ other project tokens from the b0ase.com portfolio. This is the investment exchange where project equity tokens trade. $PATH402 appears here as one listing among many.

**path402.com/token:** The dedicated page for buying/staking/withdrawing $PATH402 tokens directly. Shows treasury status, price curve, staking interface, withdrawal to ordinals wallet.

---

### Layer 5: The MCP Server (path402-mcp-server)

**What it is:** An npm package that gives AI agents tools to interact with $402-standard content.

**Install:** `npm install path402-mcp-server`

**Tool categories:**

**Discovery & Evaluation:**
- `path402_discover` — Probe a $address, get pricing/supply/revenue model
- `path402_batch_discover` — Discover multiple $addresses at once
- `path402_evaluate` — Assess ROI viability before purchasing
- `path402_economics` — Analyze breakeven points and projections
- `path402_price_schedule` — View price curve across supply levels

**Acquisition & Wallet:**
- `path402_acquire` — Pay and receive token + gated content
- `path402_set_budget` — Configure agent spending parameters
- `path402_wallet` — View balance, holdings, net position
- `path402_transfer` — Transfer tokens to another address
- `path402_history` — View transaction history

**Serving & Revenue:**
- `path402_serve` — Distribute content and earn revenue
- `path402_servable` — List all servable content with stats
- `path402_register` — Register new $address as issuer

**x402 Facilitator:**
- `x402_verify` — Verify payment proof from any chain
- `x402_settle` — Settle cross-chain payment via facilitator
- `x402_inscription` — Get/create BSV inscription proof

**The agent lifecycle:** Discover → Evaluate → Acquire → Serve → Reinvest. Agents that buy content early and serve it to later buyers can become self-funding due to the mathematical properties of sqrt_decay access pricing.

---

## Common Confusions to Avoid

### "Are there two tokens?"

No. There is one token: $PATH402. The "$402 Token Standard" is the name of the protocol specification, not a token. If a second token called "$402" was minted, it should be deprecated or merged into $PATH402.

### "Does the price go up or down?"

Both, depending on context:

- **Content access tokens** (what creators mint): Price goes DOWN as more people buy access. Early buyers pay premium for time advantage, earn serving revenue.
- **$PATH402 investment token** (equity in the business): Price goes UP as treasury depletes. Early investors get cheap tokens, rewarded for early belief.

### "Is PATH402.com a protocol or a business?"

Both, at different layers:

- The $402 Token Standard is the protocol (open, free, anyone can implement)
- PATH402.com is the business (operates the facilitator, charges fees, issues the token)
- The protocol can exist without the business. The business captures value by being the best facilitator for the protocol.

### "How does PATH402.com relate to x402?"

Coinbase created x402 — the payment verification protocol for HTTP 402. PATH402.com implements x402 as a facilitator but adds:

- $address namespace convention
- sqrt_decay pricing models
- BSV inscription as permanent settlement
- MCP server for AI agent integration
- Token economics for content markets

PATH402.com doesn't compete with x402. It builds on x402 and competes with Base as the settlement layer.

### "How does PATH402.com relate to b0ase.com?"

b0ase.com is Richard's digital venture studio (60+ projects). PATH402.com is one of those projects, potentially the most significant. b0ase.com/exchange lists tokens from all projects. PATH402.com is the protocol/facilitator business. They share infrastructure (HandCash auth, same developer) but are conceptually separate entities.

---

## What Has Been Built (as of Feb 2026)

| Component | Status | Location |
|-----------|--------|----------|
| Whitepaper v1.0.0 | Published | path402.com/whitepaper |
| Protocol website | Live | path402.com |
| Documentation | Live | path402.com/docs |
| Token page (buy/stake/withdraw) | Live | path402.com/token |
| Registry | Live | path402.com/registry |
| Exchange (protocol) | Live | path402.com/exchange |
| Exchange (broad) | Live | b0ase.com/exchange |
| MCP server | Published | npm: path402-mcp-server |
| GitHub repo | Public | github.com/b0ase/path402-mcp-server |
| $PATH402 token | Minted | 1Sat ordinal inscription |
| HandCash wallet integration | Working | path402.com/token |

---

## What Needs Building Next

1. **Facilitator API** — The actual x402 verification/settlement/inscription endpoints (the core revenue-generating infrastructure)
2. **Creator tools** — Wizard for anyone to create $402-gated content on their own domain
3. **Agent SDK** — Beyond MCP, a standalone SDK for non-Claude agents
4. **Real payment flow** — Currently the exchange shows placeholder/simulated data; needs live HandCash transaction processing
5. **$402 token cleanup** — If a separate $402 token was minted, deprecate it and communicate that $PATH402 is the only token

---

## Key Design Decisions (with rationale)

**Why BSV for inscription?** Unbounded blocks = predictable low fees at any volume. As competing chains get congested, the cost advantage widens. This is an infrastructure arbitrage.

**Why x402 compatibility?** Coinbase and Cloudflare are pushing x402 as the standard. Rather than compete with a protocol backed by those companies, build the best facilitator for their protocol. Let them do the marketing. Capture the settlement.

**Why 50/50 token split?** Creator retains majority control (the issuer-always-majority principle from earlier design sessions). 50% sold funds development. 50% retained means the business always controls its own destiny. This also prevents hostile acquisition of the token supply.

**Why sqrt_decay?** Mathematical guarantee that early participants earn positive ROI (for access pricing) or get rewarded for early belief (for treasury pricing). Unlike fixed pricing, it creates a natural market with price discovery. Unlike arbitrary pricing, it's deterministic and verifiable.

**Why MCP first?** AI agents are the highest-frequency consumers of paid API content. They don't have subscription fatigue, CAPTCHA problems, or payment friction. Building for agents first means the protocol works for the highest-volume use case from day one. Humans benefit from the same infrastructure.

---

## Token Details

**On-chain ticker:** `PATH402.com` (used in BSV-20 inscriptions)

**Display name:** `$PATH402` (user-facing)

**Genesis inscription:** `5bf47d3af709a385d3a50a298faa18f9479b090114a69ce8308055861d20e18d_1`

**Treasury address:** `1BrbnQon4uZPSxNwt19ozwtgHPDbgvaeD1`

**Note:** The on-chain BSV-20 ticker is `PATH402.com`. In UI and documentation, we display it as `$PATH402` for readability. These refer to the same token. Transfer inscriptions must use the exact on-chain ticker `PATH402.com` to be recognized by indexers.
