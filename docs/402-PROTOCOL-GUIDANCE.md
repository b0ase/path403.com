# $402 Protocol Guidance

> **Core Principle**: $402 is a protocol that enables domain monetization. It does NOT prescribe how to price, distribute, or structure. Those are policy decisions made by each domain owner.

## What $402 Actually Is

$402 is an HTTP extension that allows any URL to:

1. **Declare tokenization** via DNS TXT record and `/.well-known/path402.json`
2. **Gate access** via token ownership verification
3. **Accept payment** via BSV micropayments
4. **Distribute revenue** to token holders

That's it. Everything else is **owner choice**.

## What $402 Does NOT Prescribe

### Pricing Model

The owner chooses:
- **Flat rate**: 1p per request, always
- **Sqrt decay**: Early buyers pay more, price drops with supply
- **Bonding curve**: Price increases with demand
- **Market-driven**: Tokens trade freely, market discovers price
- **Tiered**: Different prices for different access levels
- **Usage-based**: Pay per API call, per MB, per minute
- **Subscription**: Monthly token burn for continued access
- **Custom**: Any formula the owner wants

**The protocol doesn't care.** It just needs a way to check "does this user have the required tokens?"

### Revenue Distribution

The owner chooses:
- **Pro-rata**: All holders share equally by token count
- **Weighted**: Issuer keeps X%, rest to holders
- **Staker-only**: Only active infrastructure operators earn
- **Tiered**: KYC holders get dividends, bearer holders don't
- **None**: Tokens grant access only, no revenue share
- **Custom**: Any split the owner defines

**The protocol doesn't care.** It just needs a payment address and a way to record transactions.

### Supply Mechanics

The owner chooses:
- **Unlimited**: Mint forever, price adjusts
- **Capped**: Fixed supply, secondary market only after cap
- **Treasury-based**: Fixed pool depletes over time
- **Burn mechanics**: Tokens consumed on use
- **Inflationary**: New tokens minted on schedule

**The protocol doesn't care.** It just needs to know total supply for verification.

### Access Control

The owner chooses:
- **Token-gated**: Must hold tokens to access
- **Pay-per-use**: Pay each request, no holding required
- **Hybrid**: Hold for discount, pay-per-use otherwise
- **Threshold**: Must hold X tokens for premium tier
- **Time-locked**: Access expires, must renew

**The protocol doesn't care.** It just returns 402 or 200.

## The Three Things $402 Actually Defines

### 1. Verification Bundle

Three proofs that tie a domain to its token:

```
DNS TXT:     _path402.domain.com → token config
HTTP:        domain.com/.well-known/path402.json → machine-readable spec
On-chain:    BSV inscription → immutable record
```

All three must agree. This is the ONLY thing $402 is strict about.

### 2. HTTP 402 Response Format

When access is denied, return:

```
HTTP/1.1 402 Payment Required
Content-Type: application/json

{
  "token_id": "...",
  "required_amount": 1,
  "price_sats": 100,
  "payment_address": "...",
  "acquire_url": "..."
}
```

This tells clients how to get access.

### 3. Token Ownership Proof

Clients prove ownership via:
- Bearer token header
- Signed message
- On-chain verification

Server validates, grants or denies access.

## Common Misconceptions

### "Sqrt decay is THE $402 model"

**Wrong.** Sqrt decay is ONE option. A domain owner might prefer flat pricing for predictability, or market-driven pricing for liquidity. The MetaWeb blog posts describe sqrt decay as a recommendation for content speculation, not a protocol requirement.

### "Tokens must pay dividends"

**Wrong.** Tokens can be access-only with no revenue share. Or they can pay 100% of revenue to holders. Owner's choice.

### "There's a 50% parent rule"

**Wrong.** The hierarchical model with parent ownership is ONE way to structure a domain with subpaths. An owner might keep 100% of child path revenue, or share 10%, or create independent tokens per path with no hierarchy.

### "KYC is required for dividends"

**Wrong.** That's a compliance choice. Some jurisdictions may require it. Others won't. The protocol supports both bearer (anonymous) and registered (KYC'd) holder tiers.

### "Early buyers must profit"

**Wrong.** Some pricing models reward early buyers. Others don't. Flat pricing treats all buyers equally. The owner decides if speculation incentives are desired.

## How to Think About $402

**$402 is plumbing, not policy.**

It's like HTTP itself. HTTP doesn't tell you what content to serve or how to price it. It just defines how requests and responses work.

$402 extends HTTP with:
- A way to say "this costs money"
- A way to prove you paid
- A way to verify token legitimacy

Everything else is up to the domain owner, their shareholders, and their governance model.

## Practical Implications

### For DNS-DEX

DNS-DEX is an **exchange** where domain tokens trade. It should:
- Display whatever pricing model each domain uses
- Support trading regardless of underlying tokenomics
- Show revenue distribution rules set by each issuer
- Not impose a single model on all domains

### For Content Creators

Choose the model that fits your content:
- Breaking news? Sqrt decay rewards early readers
- Reference docs? Flat pricing for predictability
- API access? Usage-based pricing for fairness
- Community content? Revenue share to all holders

### For Investors

Understand what you're buying:
- Access rights only? Value = utility
- Revenue share? Value = expected dividends
- Speculative position? Value = expected price appreciation

Each token is different. Read the `path402.json`.

## Summary

| Aspect | $402 Protocol | Owner Policy |
|--------|---------------|--------------|
| Verification | Required (3-proof) | N/A |
| HTTP 402 format | Required | N/A |
| Pricing model | Framework only | Owner chooses |
| Revenue distribution | Framework only | Owner chooses |
| Supply mechanics | Framework only | Owner chooses |
| Access control | Framework only | Owner chooses |
| Governance | Framework only | Owner/shareholders choose |

**$402 enables. Owners decide.**

---

*Last updated: 2026-02-03*
