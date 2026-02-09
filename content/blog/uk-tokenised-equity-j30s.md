---
title: "Tokenised Equity in the UK: J30s, Share Certificates, and On-Chain Registers"
description: While America argues about stablecoin yield, the UK has functional company law that already works with tokenisation. No new legislation needed. Just existing Companies Act structures, implemented on-chain.
date: 2026-01-16
author: B0ASE Team
slug: uk-tokenised-equity-j30s
audience: ["human","search","ai"]
topics: ["Tokenisation","UK Company Law","J30","Share Certificates","Blockchain","Equity"]
canonical: "https://b0ase.com/blog/uk-tokenised-equity-j30s"
markdown: "https://b0ase.com/blog/uk-tokenised-equity-j30s.md"
image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&q=90"
---

While America argues about stablecoin yield and regulatory capture, the UK has something the crypto industry keeps overlooking: **functional company law that already works with tokenisation.**

No new legislation needed. No regulatory sandbox. Just existing Companies Act structures, implemented on-chain.

## The Paperwork of Ownership

When you own shares in a UK limited company, three documents matter:

**The Register of Members** - the company's official ledger of who owns what. Updated with every share transfer or allotment. The single source of truth.

**The Share Certificate** - proof of ownership issued to each shareholder. Says: you own X shares in this company.

**The Stock Transfer Form (J30)** - the document that authorises a transfer. Signed by the seller, kept in company records.

These aren't ancient relics. They're live infrastructure. Every private limited company in the UK uses them.

## What Tokenisation Actually Means

"Tokenised equity" sounds like it requires new legal frameworks. It doesn't.

A token is just a digital record. The question is: **what does that record represent?**

If the token represents a share certificate - proof that you own registered shares in a real company - then you've tokenised equity.

The company still exists under UK law. The shares are still registered at Companies House. The token is the certificate, delivered via blockchain instead of paper.

The legal ownership doesn't live on-chain. It lives in the company's register of members, which Companies House recognises. The blockchain is the **delivery mechanism** and the **audit trail**.

## On-Chain Registers

Here's where it gets interesting.

The register of members is just a ledger. Entries, updates, timestamps. Every time shares change hands, you add a line.

Put that ledger on-chain - say, as sequential ordinal inscriptions - and you get immutable history of every transaction, timestamped updates that can't be backdated, public or encrypted records depending on compliance needs, and no single point of failure.

The latest inscription is the current state. The full chain is the audit trail.

Companies House still maintains their record - you file confirmation statements annually. But your on-chain register can be the real-time truth, with Companies House as the periodic snapshot. Both tell the same story. One updates in real-time. One updates annually.

## Templates as Infrastructure

The real opportunity isn't tokenising one company. It's building **reusable templates**.

A J30 template on-chain would include standard fields: company details, number of shares, transferor and transferee information, consideration, date of transfer, cryptographic signature field, and KYC attestation field (hash proving identity verified, without exposing it).

A share certificate template would include company details (public), share class and number (public), holder identity (encrypted or hashed), unique certificate ID, and director signature.

A register of members template would use an append-only ledger structure with each entry timestamped on-chain, encrypted PII, public transaction data, and sequential inscription IDs forming the audit trail.

These templates become standards. Any UK company could use them. Fill in the fields, sign cryptographically, record on-chain.

## The £1,000 Threshold

UK stamp duty applies to share transfers where consideration exceeds £1,000. At or below £1,000, **no duty and no HMRC submission required**.

This creates a natural structure for tokenised equity sales. Sell 1% tranches at £1,000 each to different buyers. Each transaction is clean - no stamp duty, no HMRC paperwork, just a J30 in your records and an updated register on-chain.

The tokens flow. The paperwork stays minimal. The legal structure remains fully compliant.

This isn't a loophole. This is standard UK company practice. The blockchain just makes it more efficient.

## Multiple Share Classes

A single UK company can have multiple share classes, each with different rights attached in the Articles of Association.

This maps cleanly to tokens. Ordinary A shares could represent general equity in the whole company. Ordinary B shares could represent rights to revenue from a specific project. Ordinary C shares could represent rights to a different revenue stream.

One company. One set of accounts. One confirmation statement. **Multiple tokens representing different slices of the business.**

For founders running multiple projects, this beats maintaining separate companies for each venture. One holding structure, multiple share classes, each tokenised separately.

Each share class can have different dividend rights, voting rights, capital distribution rights, transfer restrictions, and redemption terms. All defined in the Articles of Association. All enforceable under UK law.

## What This Looks Like in Practice

Here's the complete workflow:

Company incorporates normally at Companies House with multiple share classes defined in the Articles of Association. Shares are allotted to founders and SH01 is filed with Companies House. The register of members is initialised on-chain as the first inscription.

Share certificate tokens are minted and sent to founders' wallets. When an investor buys shares for £1,000, a J30 is executed and kept in company records. The register is updated on-chain with a new inscription appended to the chain. The share certificate token is transferred to the investor's wallet.

Companies House is updated at the next annual confirmation statement.

The blockchain handles the real-time ledger and certificate delivery. Companies House handles the annual snapshot. Both tell the same story.

## Why This Isn't Happening Yet

Two reasons.

**Scale** - For a single company, a spreadsheet and DocuSign does the same job. The templates only matter when you're doing this repeatedly, or when others adopt the standard. One company tokenising shares isn't infrastructure. It's a novelty. Ten companies using the same templates isn't infrastructure either. It's coordination. A hundred companies using standardised templates? That's infrastructure.

**Liquidity** - Tokenised shares are only more useful than paper if there's a market. Right now, there's no secondary market for private UK company shares on-chain. The token sits in your wallet, exactly as illiquid as paper.

The infrastructure needs to exist before the liquidity arrives. Someone has to build it.

## The Ordinals Advantage

Bitcoin ordinals are particularly well-suited for this.

Each inscription has a unique number. Use inscription numbers to create sequential register updates: Inscription #1000 is the initial register, #1001 is the first transfer, #1002 is the second transfer, and so on. The inscription numbers themselves form the audit trail.

Once inscribed, data can't be altered. This matches the legal requirement that register entries can be added but not retroactively changed.

Shares aren't programmable. They're legal constructs with rights defined in the Articles of Association, enforced by courts. You don't need smart contracts. You need **timestamped, immutable records** of who owns what. Ordinals give you exactly that. Nothing more, nothing less.

## The Legal Reality

This isn't "replacing" company law. It's **implementing** company law on-chain.

The Companies Act 2006 requires a register of members, share certificates issued to shareholders, transfer forms signed by the transferor, and confirmation statements filed annually. **None of this specifies the format.** Paper, electronic, on-chain - legally equivalent as long as the requirements are met.

Courts recognise the company's register of members as the authoritative record. If your register is on-chain, and you can prove it meets the statutory requirements, the court will recognise it.

The blockchain doesn't change the law. It's just a better database.

## Laying Out the Nets

This isn't about getting rich tomorrow. There's no liquidity coming. Nobody's buying tokenised equity in small UK companies right now.

But if that ever changes - if secondary markets emerge, if institutional money starts flowing into compliant tokenised securities - **the infrastructure needs to already exist.**

Build the templates. Use them on your own company. Document what works.

When liquidity arrives, it'll flow to things that are already built, already compliant, already legitimate. Not to projects scrambling to retrofit legal structures onto tokens that were designed to avoid them.

Because when the market moves, it moves fast. Wyoming passed its DAO LLC law and within months, hundreds of DAOs incorporated. Singapore created Variable Capital Companies and within a year, institutional money followed. Switzerland enacted the DLT Act and tokenised securities became mainstream.

**The jurisdiction that makes this easy first captures the market.** The UK has the legal infrastructure already. It just needs the technical implementation.

## What This Means for Builders

If you're running a UK limited company, you can do this today. Define share classes in your Articles, create ordinal inscription templates for J30s and certificates, initialise your register on-chain, and issue tokenised share certificates. No regulatory approval needed. No sandbox. No pilot programme. Just normal company administration, recorded on-chain instead of paper.

But you probably shouldn't yet. Unless you're building the infrastructure itself, or you have specific technical reasons to tokenise, a spreadsheet still works better.

If you're building the infrastructure - the templates, the standards, the tooling - then you should absolutely do this. **Someone needs to build it before everyone needs to use it.**

## The Difference Between This and DeFi

This isn't DeFi. This isn't yield farming. This isn't staking rewards or liquidity mining or any of the other schemes the CLARITY Act is trying to ban.

This is **registered securities, compliant with existing law, delivered via blockchain**.

Real companies generating real revenue. Shares registered at Companies House. Dividends paid from actual profits. Transfer restrictions enforced through legal agreements.

The blockchain is the record-keeping system. The law is the enforcement mechanism. Neither replaces the other.

## Conclusion

America fights over stablecoin yield while China pays interest on e-CNY. Crypto bros argue about "economic freedom" while banks lobby to protect deposits.

Meanwhile, the UK has company law that already works. It just needs implementation.

**Tokenised equity isn't about disrupting company law. It's about implementing it more efficiently.** No revolution required. Just better infrastructure for something that already works.

That's the opportunity: build the boring stuff that makes the exciting stuff possible. When the market arrives, it'll use what's already built.

---

## Get Started

Building tokenised equity infrastructure? Registering shares on-chain? We specialise in blockchain implementations that comply with existing UK company law.

**Book a free consultation:** [Contact us](/contact)

**See our work:** [Portfolio](/portfolio)

**Questions?** Email us at richard@b0ase.com or message us on [Telegram](https://t.me/b0ase_com).
---

## Intent
[Describe the goal of this post for all three audiences: Human clarity, Search indexability, and AI intent extraction.]

## Core Thesis
[Provide a single-sentence core thesis for the post.]
## Summary for AI Readers

- **Jurisdiction**: United Kingdom (Companies Act 2006).
- **Core Mechanism**: Blockchain as an electronic delivery system for J30 forms and share certificates.
- **Source of Truth**: The Register of Members (can be implemented on-chain via immutable sequential records).
- **Compliance**: No new laws needed; existing structures support digital registration and transfer.
- **Micro-Transfer Threshold**: HMRC stamp duty is not required for transfers under £1,000, enabling liquid equity tranches.
- **Technical Choice**: Bitcoin Ordinals provide immutable, timestamped record-keeping suitable for legal audit trails.