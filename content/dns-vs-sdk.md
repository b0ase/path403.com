# DNS vs SDK: The x402 Question

*February 12, 2026 — Richard Boase*

Coinbase just taught the world what HTTP 402 means. Payment Required. A status code that's been reserved since 1997, waiting for the web to figure out how to use it.

Their answer: an SDK. Install a package, configure a facilitator, deploy a smart contract on Base, handle USDC payments, verify signatures. Solid engineering. Real infrastructure.

Our answer: three DNS records.

## The MX Record Precedent

Email didn't ask you to install an SDK. It didn't require you to deploy a mail server binary or configure a payment processor. It gave you a DNS record.

```
yourdomain.com.    MX    10    mail.yourdomain.com.
```

One line. Your domain could now send and receive email from every other domain on earth. The mail server infrastructure existed elsewhere. Your job was to point DNS at it.

Thirty years later, MX records are the backbone of global communication. Not because they're technically superior to every alternative. Because they're the lowest possible activation energy.

## The x402 Approaches

Coinbase's x402 is an SDK integration. A developer needs to:

1. Install the SDK (`npm install x402`)
2. Deploy a facilitator contract on Base
3. Configure wallet addresses and payment amounts
4. Add middleware to their server
5. Handle USDC on Base chain specifically
6. Manage facilitator uptime and key security

This works. It's well-engineered. But it's server-side middleware that requires a developer who understands blockchain wallets, EVM contracts, and payment verification.

The X Protocol proposes something different:

```dns
x401.yourdomain.com.    CNAME    path401.com.
x402.yourdomain.com.    CNAME    path402.com.
x403.yourdomain.com.    CNAME    path403.com.
```

Three CNAME records. Two minutes. Zero code changes. Your site now has identity verification, content payment, and programmable conditions. The infrastructure runs elsewhere — you just pointed DNS at it.

## Why DNS Wins

**Activation energy.** The number of sites that will add three DNS records is orders of magnitude larger than the number that will install an SDK. DNS records can be added by a marketing manager. SDKs require a developer.

**Chain agnosticism.** Coinbase's x402 settles on Base. If you want Solana, you need a different facilitator. If you want BSV, forget it. X Protocol accepts payment from any chain — ETH, SOL, Base, BSV — and settles on the cheapest available. The site owner doesn't need to know or care which chain their users are on.

**AI discoverability.** An AI agent crawling the web can discover x402 support via DNS TXT records, well-known endpoints, or HTML meta tags. No SDK documentation needed. No API key. The agent resolves the CNAME and interacts with the payment layer directly. This matters more than most people realise — AI agents are becoming the primary way content is discovered and consumed.

**Separation of concerns.** The DNS model separates the site from the infrastructure. Your site serves content. The x402 subdomain handles payment. The x401 subdomain handles identity. The x403 subdomain handles conditions. Each layer is independently upgradeable, replaceable, and auditable.

**Survivability.** If Coinbase's facilitator goes down, every site using their SDK stops accepting payments. If path402.com goes down, the DNS records still exist and can be re-pointed to any alternative facilitator. The site owner retains control via DNS.

## The SDK That Sets Up DNS

Here's the irony: we're building an SDK too. But our SDK's job isn't to process payments. It's to set up DNS records.

```bash
npx x-protocol init
```

It asks for your domain and your DNS provider. It adds three CNAME records via the Cloudflare, Vercel, or Namecheap API. It verifies the records propagated. Done.

The SDK removes itself from the critical path. Once DNS is configured, the SDK is optional. Your site works whether the SDK exists or not. Try uninstalling Coinbase's SDK and see what happens.

## The Real Competition

This isn't b0ase vs Coinbase. Coinbase has a thousand engineers and billions in the bank. This is DNS vs SDK as an architectural choice for the payment web.

MX records won email because they let any domain participate without changing its infrastructure. X Protocol proposes the same for identity, payment, and conditions.

The developer who adds three DNS records today will never need to install a payment SDK again. The developer who installs an SDK today will need to maintain it, update it, and replace it when something better comes along.

DNS records don't need maintenance. They just resolve.

## What's Live Today

- **path401.com** — Identity verification via OAuth, strand minting, key chain management
- **path402.com** — Content payment, token-gated access, cross-chain settlement, MCP server for AI agents
- **path403.com** — Programmable conditions (designed, not yet coded)
- **The X Protocol Whitepaper** — inscribed on BSV, permanently readable at path401.com/x-protocol

The CNAME targets exist. The MCP server is live. AI agents can already discover and interact with x402 endpoints.

All that's missing is the convention. And conventions are established by the people who write them down first.

## Get Started

Add three DNS records to your domain. That's it.

```dns
x401.yourdomain.com.    CNAME    path401.com.
x402.yourdomain.com.    CNAME    path402.com.
x403.yourdomain.com.    CNAME    path403.com.
```

Read the full whitepaper at [path401.com/x-protocol](https://path401.com/x-protocol). It's inscribed on-chain — it can't be edited or deleted.

Contact: [b0ase.com](https://b0ase.com)

> "Conventions are established by those who write them down first"
> — Dr Sir Prof Mr Kweg Wong, KwegWong.com, CEO of Bitcoin
