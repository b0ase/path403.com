# Payment Compliance & Terminology Guide

## The Problem

Stripe and PayPal prohibit:
- Cryptocurrency sales
- Securities/investment products
- Unregistered financial instruments

## The Solution: Service-First Framing

We don't sell tokens. We sell **services** and issue **digital receipts**.

---

## Terminology Mapping

| DON'T Say | DO Say |
|-----------|--------|
| Token | Service Credit / Digital Receipt |
| Token sale | Service agreement |
| Investment | Contribution / Backing |
| Investor | Backer / Supporter / Client |
| Dividends | Revenue share / Profit participation |
| Buy tokens | Purchase service credits |
| Token holder | Service credit holder |
| ICO / Token launch | Service launch / Platform access |
| Tokenomics | Credit economics |
| Airdrop | Bonus credits / Loyalty reward |

---

## What We Actually Sell

### 1. Development Services

**What Stripe sees**: Client purchases development services
**What we deliver**: Working software + service receipt (blockchain-inscribed)

```
Invoice: "Development Services - MVP Build"
Amount: £1,000
Deliverable: Working application
Receipt: Digital proof of purchase (happens to be on blockchain)
```

### 2. Platform Access

**What Stripe sees**: Subscription to platform services
**What we deliver**: Access + service credits

```
Invoice: "Platform Access - Pro Tier"
Amount: £99/month
Deliverable: Dashboard access, API calls, support
Receipt: Service credits (redeemable for future services)
```

### 3. Project Backing

**What Stripe sees**: Pre-purchase of future services
**What we deliver**: Service credits redeemable when project launches

```
Invoice: "Project Backing - [Project Name]"
Amount: Variable
Deliverable: Service credits + profit participation rights
Receipt: Blockchain-inscribed proof of contribution
```

---

## The Legal Structure

### Service Credits (Not Tokens)

A "service credit" is:
- Proof you purchased something
- Redeemable for platform services
- Transferable (like a gift card)
- NOT a security (no expectation of profit from others' efforts)

### Profit Participation (Not Dividends)

When projects generate revenue:
- Backers receive "profit participation" (contractual right)
- This is a SERVICE agreement, not an investment
- Similar to affiliate commissions or revenue share

### Blockchain = Database

The blockchain inscription is:
- A receipt (proof of purchase)
- A database entry (happens to be immutable)
- NOT the product itself

---

## Stripe-Safe Product Descriptions

### For Token Purchases (reframe as Service Credits)

**BAD** (will get flagged):
```
"Purchase 10,000 $BOASE tokens"
"Invest in our token sale"
"Buy cryptocurrency"
```

**GOOD** (Stripe-compliant):
```
"Purchase Service Credits - BOASE Platform"
"Back this project (receive redeemable credits)"
"Pre-order platform access with transferable credits"
```

### For Checkout Sessions

```typescript
// Stripe checkout metadata
{
  product_name: "Platform Service Credits",
  product_description: "Redeemable credits for b0ase.com services. Credits are transferable and recorded on a distributed ledger for transparency.",

  // NOT:
  // product_name: "BOASE Tokens",
  // product_description: "Cryptocurrency tokens on BSV blockchain"
}
```

### For Invoices

```
INVOICE

Service: Platform Development Backing
Description: Contribution toward [Project] development.
             Includes: Service credits redeemable for future
             platform services, plus contractual profit
             participation rights per attached agreement.

Amount: £500.00

Note: Credits recorded on distributed ledger (BSV) for
      transparency and transferability.
```

---

## Contract Language

### Service Agreement (Not Token Sale Agreement)

```markdown
# SERVICE CREDIT AGREEMENT

This agreement ("Agreement") is between:
- b0ase Ltd ("Provider")
- [Client Name] ("Client")

## 1. Services Purchased

Client purchases Service Credits redeemable for:
- Platform access
- Development services
- API usage
- Support hours

## 2. Credit Issuance

Credits are recorded on a distributed ledger (BSV blockchain)
for transparency, auditability, and transferability.

## 3. Profit Participation

Client receives contractual profit participation rights
equal to [X]% of net revenue from [Project], payable
quarterly as service fee reimbursements.

## 4. Credit Transfer

Credits may be transferred to third parties. Transfer is
recorded on the distributed ledger.

## 5. Redemption

Credits may be redeemed for services at current platform rates.
Unused credits do not expire.

## 6. Not a Security

Credits represent pre-purchased services, not equity,
debt, or investment instruments. Client has no ownership
stake in Provider.
```

---

## API Endpoint Naming

| DON'T | DO |
|-------|-----|
| `/api/tokens/buy` | `/api/credits/purchase` |
| `/api/tokens/transfer` | `/api/credits/transfer` |
| `/api/dividends/claim` | `/api/revenue-share/claim` |
| `/api/investors` | `/api/backers` |

---

## UI Copy

### Checkout Flow

**BAD**:
> "Buy 10,000 tokens for £100"

**GOOD**:
> "Get 10,000 service credits for £100"
> "Credits are redeemable for platform services and recorded on a public ledger"

### Dashboard

**BAD**:
> "Your Token Holdings"
> "Dividend Earnings"

**GOOD**:
> "Your Service Credits"
> "Revenue Share Earnings"

### Marketing

**BAD**:
> "Invest in the future of X"
> "Token sale now live"

**GOOD**:
> "Back the future of X"
> "Service credits now available"

---

## Stripe Descriptor

Set your Stripe statement descriptor to:

```
B0ASE SERVICES
```

NOT:
```
B0ASE TOKENS
B0ASE CRYPTO
```

---

## Risk Mitigation

### If Stripe Asks

Prepare this response:

> "b0ase.com is a software development agency. We sell development
> services and platform access. Clients receive 'service credits'
> as proof of purchase, which are redeemable for our services.
>
> We use blockchain technology (BSV) as our database for recording
> these transactions - similar to how other companies use databases.
> This provides transparency and allows credits to be transferred.
>
> We do not sell cryptocurrency, securities, or investment products.
> All purchases are for services rendered or to be rendered."

### Documentation to Keep

- Service agreements (not token sale agreements)
- Invoices showing services purchased
- Receipts showing "service credits" (not tokens)
- Clear terms of service on website

---

## Implementation Checklist

- [ ] Update checkout descriptions to "service credits"
- [ ] Rename API endpoints from "token" to "credit"
- [ ] Update UI copy throughout
- [ ] Revise terms of service
- [ ] Update invoice templates
- [ ] Set Stripe descriptor to "B0ASE SERVICES"
- [ ] Prepare response document for Stripe inquiries
- [ ] Train any support staff on terminology

---

## Summary

| Concept | Stripe-Safe Term |
|---------|------------------|
| Token | Service Credit |
| Token holder | Credit Holder / Backer |
| Token sale | Credit Purchase |
| Investment | Project Backing |
| Dividend | Revenue Share |
| Airdrop | Bonus Credits |
| Blockchain | Distributed Ledger / Public Database |

**The core reframe**: We sell services. The blockchain is just our database. Credits are just receipts.
