---
title: "$401: The Identity Token That Your Peers Underwrite"
description: "Not a social credit score. Not a KYC checkbox. A financial instrument that prices how much the world trusts you."
date: 2026-02-09
author: b0ase
slug: 401-identity-token-peers-underwrite
image: /blog/401-identity-token.png
audience: ["human","search","ai"]
topics: ["identity","bitcoin","tokens","protocol","reputation","401"]
canonical: "https://www.b0ase.com/blog/401-identity-token-peers-underwrite"
markdown: "https://www.b0ase.com/blog/401-identity-token-peers-underwrite.md"
series: "The $402 Protocol"
seriesOrder: 4
---

Not a social credit score. Not a KYC checkbox. A financial instrument that prices how much the world trusts you.

-----

## The Problem With Identity on the Internet

There are currently two models for digital identity, and they're both terrible.

**Model one: anonymity.** You're a username. A wallet address. A string of characters. You can say anything, do anything, disappear at any time. This is the default state of the internet and it gave us trolls, scammers, rug pulls, and an advertising surveillance complex built to compensate for the fact that nobody knows who anyone is.

**Model two: centralised verification.** A corporation or a government confirms you're real. KYC. Passport scans. Biometric databases. Facebook's real name policy. China's social credit system. You surrender your identity to an authority, and that authority decides what you're allowed to do with it.

Both models fail for the same reason: they separate identity from accountability. In the anonymous model, there's no accountability at all. In the centralised model, accountability flows upward to the authority -- the government decides your score, the platform decides your access, the bank decides your risk rating. You're a subject, not a participant.

The $401 token proposes a third model: **peer-underwritten identity.**

You issue your own identity. Your peers decide what it's worth.

-----

## What Is a $401 Token?

The name comes from HTTP 401 -- "Unauthorized." It's the status code a server returns when you haven't proven who you are. The $401 token is the proof.

But unlike a password or an API key, a $401 token isn't hidden. It's public. Radically, deliberately, permanently public.

When you mint a $401 token, you're making a declaration to the network: **"I am this person. This wallet is me. I stand behind everything it does."**

$BOASE is Richard Boase. $TRUMP is (maybe) Donald Trump. $ALICE is whoever Alice claims to be. The token is an inscription on the BSV blockchain -- timestamped, immutable, containing your chosen handle, your public key, and your willingness to be known.

No passport required. No government approval. No corporation verifying you. Just a person, saying publicly: this is me.

The question then becomes: why should anyone believe you?

-----

## Peer Underwriting: The Anti-Social-Credit Score

In China's social credit system, the government assigns you a score. Behave well (by the government's definition), your score goes up. Behave badly, it goes down. The score determines what trains you can ride, what jobs you can hold, whether your children can attend certain schools. The authority is absolute. The individual has no recourse.

The $401 model inverts this entirely.

Nobody assigns you a score. Nobody rates your behaviour from above. Instead, your peers -- other participants in the network -- choose whether to **stake their own money** on your identity.

If I believe Richard Boase is a real person, a reliable node operator, and a consistent creator, I can stake tokens against $BOASE. I'm locking up my own capital as a vote of confidence. Not a like. Not a follow. Not a retweet. Money. Real, locked, illiquid money that I can't access until I unstake.

The total amount staked against your $401 token becomes your **trust score**. But it's not a score assigned by an authority. It's a score *purchased* by your community. It's a market price for your reputation.

And here's the critical difference from social credit: **anyone can issue a $401 token.** There's no application process. No approval committee. No Ministry of Identity deciding who gets to participate. You mint your token, you broadcast your claim, and you wait to see if anyone backs it.

Some tokens will be heavily staked -- trusted, established, productive identities with deep community support. Some will have zero stakers -- unknown, unproven, potentially fictitious. Most will be somewhere in between, with staking levels that fluctuate based on the token holder's behaviour and output.

The market decides. Not the state.

-----

## How Staking Works

When you stake against someone's $401 token, you're doing something economically significant. You're not donating to them. You're not gifting them reputation points. You're making an investment in their identity -- and like any investment, it should have returns.

**What stakers earn:**

Revenue from the identity's economic activity flows back to stakers proportionally. If Richard creates content tokens that generate access fees, a percentage flows to $BOASE stakers. If Richard operates a path402d node that earns indexing rewards, a percentage flows to stakers. If Richard launches a new project and airdrops tokens to early supporters, stakers get first access.

The exact revenue split is defined by the $401 token's parameters at creation, but the principle is simple: the people who backed your identity early, when the risk was highest, earn a share of everything that identity produces.

**What the network sees:**

Every $401 token on the network has a publicly visible staking profile:

- Total capital staked
- Number of unique stakers
- Average stake duration
- Longest continuous stake
- Staker diversity (are twenty different people staking, or one whale?)

This profile IS the reputation. There's no algorithm interpreting your behaviour. There's no sentiment analysis on your posts. There's just capital -- committed, locked, publicly visible -- saying "I trust this person enough to put money on it."

**The lock matters:**

Staked tokens can't be sold. This is essential. Without the lock, staking becomes performative -- people stake for five minutes to inflate a score and immediately unstake. The lock makes it real. You're committing capital for a duration. That commitment is the signal.

Unstaking has a cooldown period. When you decide to withdraw your stake, there's a waiting period before your tokens become liquid again. This prevents bank runs on reputation -- if bad news breaks about someone, the cooldown gives the market time to process information rather than panic-selling.

-----

## Confidence Levels: From Anonymous to Attested

Not all $401 tokens are created equal. The standard supports multiple confidence levels, each adding a layer of verification on top of the base self-attestation.

**Level 0: Self-Attested.**
You minted a token and claimed a name. That's it. No verification. No evidence. Just a public claim. This is the baseline. Most $401 tokens start here. The only backing is whatever staking your peers provide.

**Level 1: Signed Bundle.**
You've created an encrypted identity bundle at bit-sign.online (or a compatible signing service). Your passport, driving licence, and proof of address are encrypted with your keys and the hash of that bundle is linked to your $401 token. Nobody can see the documents, but everyone can verify that an encrypted identity backup exists. If a dispute arises, you can selectively reveal documents to a specific party without exposing them to the network.

**Level 2: Third-Party Verified.**
Your signed bundle has been checked by a verification service -- Veriff, Onfido, Jumio, or any KYC provider. The verification service signs a cryptographic attestation: "We checked the documents in this bundle and they belong to a real person matching the claimed identity." That attestation is added to the $401 inscription. Now your token carries machine-verified confidence, not just self-assertion.

**Level 3: Publicly Attested.**
The identity holder has made public, verifiable statements linking themselves to the token. Press conferences. Company filings. Social media posts from verified accounts. Video attestations. The connection between the real-world person and the $401 token is established through public record, not just cryptographic proof.

Each level is additive. A Level 3 token has all the properties of Levels 0, 1, and 2, plus public attestation. And each level changes the economic dynamics -- a Level 3 token with heavy staking from diverse, long-duration stakers is the highest-trust identity the network can produce.

-----

## The Trump Test

This is where it gets interesting. Let's play it out.

Scenario A: Donald Trump mints $TRUMP as a $401 identity token. He goes on television. He says: "This is my token. I take responsibility for it. It's an investment in me, Donald Trump. Buy it, stake it, and you'll share in everything I build on this network."

That's a Level 3 attestation. Public. On record. Undeniable. The token instantly attracts massive staking from supporters. The trust score goes through the roof. Any content Trump publishes through the $402 protocol -- speeches, policy documents, exclusive commentary -- generates revenue that flows back to stakers. People aren't just following Trump. They're *invested* in Trump. Financially aligned with his output and reputation.

Scenario B: A $TRUMP token appears on the network. Trump is asked about it. He says: "Trump token? No, I don't know about that. Someone else made it."

The market response is immediate. Anyone who staked $TRUMP based on the assumption it was real begins unstaking (subject to cooldown). The trust score collapses publicly. The token still exists -- you can't delete a blockchain inscription -- but it's economically worthless. A $401 token that the claimed identity has publicly disavowed is a dead instrument.

Scenario C: The interesting one. A $TRUMP token exists. Trump doesn't deny it, but doesn't confirm it either. Ambiguity. Is it his? Isn't it? The market prices the uncertainty. Some people stake, betting it's real. Some sell, betting it's not. The trust score fluctuates with every new piece of evidence.

Then one day Trump says something that's only possible if he controls the wallet. Or the token signs a transaction that references a known Trump-controlled address. Or he doesn't, and the ambiguity persists.

**The market resolves it.** Not a fact-checker. Not a platform moderator. Not a government agency. The aggregate economic behaviour of thousands of participants, each putting their own money where their belief is, produces a trust score that reflects the network's best estimate of whether this identity is real.

This is what peer-underwritten identity means in practice. The truth isn't declared. It's priced.

-----

## The Burn Question

There's a design question at the heart of $401 token economics: where does the money go?

When someone stakes $BOASE, their capital is locked. But locked isn't burned. It's sitting there, waiting to be unstaked. The staker can always get it back (after the cooldown). This creates a reputation signal, but it's a *temporary* signal -- it only persists as long as people choose to keep their capital locked.

What if some of the capital was permanently destroyed?

On Solana, new token launches use a burn mechanism -- liquidity is added to a pool and then the LP tokens are sent to an incinerator address, permanently locking the liquidity. This proves the creator can't rug-pull. The capital is gone. The commitment is irreversible.

A similar mechanism for $401 could work like this: when you mint your identity token, you burn a small amount of BSV. Not stake it. Burn it. Send it to a provably unspendable address -- an address that was generated without a private key, mathematically verifiable as a black hole for funds.

This burn serves as **proof of commitment to your own identity.** You're not just claiming to be someone. You're destroying real money to back that claim. It's the difference between saying "I believe in this" and lighting money on fire to prove it.

**Provably unspendable addresses:**

On BSV, you can construct addresses that demonstrably have no private key. A hash of a known string, for example -- everyone can verify what the address is derived from, and everyone can verify that no private key was computed to generate it. Funds sent there are gone forever.

Each $401 token could have its own burn address -- individually provable, publicly auditable. You can look at any $401 token and see exactly how much has been burned in its name. That burn total is a permanent, irreversible commitment score that can never go down.

Or there could be a collective burn address -- a single $401 protocol address where all identity burns accumulate. The total burned becomes a measure of the network's aggregate commitment to verified identity.

**The economics of burning:**

A 401 request -- an HTTP "Unauthorized" response -- could literally become a request to burn money. "You want to be authorised on this network? Prove it. Burn something."

The burn doesn't have to be large. It could be tiny -- a few hundred satoshis. Enough to prevent spam (you can't create a million fake identities for free) but not enough to be a barrier to legitimate participation.

The burn creates a floor. Your $401 token's minimum credibility is: "This person destroyed X amount of real money to claim this identity." Everything above that floor -- staking, verification levels, public attestation -- adds confidence. But the floor is permanent.

-----

## The Economics of Being Known

Here's what happens when you put all of this together.

You mint $BOASE. You burn 10,000 satoshis to prove commitment. You create a signed bundle at bit-sign.online and link the hash. You get Veriff to check your documents. You're Level 2.

People start staking. Your content tokens generate revenue. Your node earns indexing rewards. A percentage flows to stakers. More people stake. Your trust score rises. More traffic routes through your node. More revenue. More stakers. The flywheel spins.

Over months, $BOASE becomes a well-staked, high-confidence identity on the network. The burn history shows consistent commitment. The staking profile shows diverse, long-duration backers. The revenue history shows consistent output.

This isn't a social credit score imposed from above. It's a **credit rating generated from below** -- by the people who know your work, trust your identity, and are willing to put money behind that trust.

And unlike a credit rating from Experian or Equifax, it's fully transparent. Anyone can see the inputs. Anyone can verify the calculations. Anyone can decide for themselves whether the score reflects reality.

The $401 token doesn't tell you who to trust. It tells you who other people trust, and how much they're willing to pay for that trust. What you do with that information is up to you.

-----

## What the Standard Needs to Define

The $401 specification, when it's written, needs to cover:

**Token structure.** What fields the inscription contains. Handle, public key, timestamp, optional bit-sign hash, optional verification attestations, burn address, linked $402 paths.

**Confidence levels.** The four levels (self-attested, signed bundle, third-party verified, publicly attested) and what evidence each requires.

**Staking mechanics.** How staking works, lock durations, cooldown periods, minimum stake amounts, revenue routing to stakers.

**Burn mechanics.** Provably unspendable address generation, individual vs collective burn addresses, minimum burn for token creation.

**Trust score calculation.** How staked amount, staker count, stake duration, stake diversity, burn total, and confidence level combine into a composite reputation metric.

**Revenue routing.** How content token revenue, indexing rewards, and airdrops flow from the identity's economic activity to its stakers.

**Interoperability.** How $401 tokens pair with $402 tokens, how identity is verified at the point of content access, how nodes use trust scores to make routing decisions.

The spec lives on path401.com. The signing tool lives at bit-sign.online. The implementation lives inside path402d. The standard is open. Anyone can build compatible tools.

-----

## The Difference

China's social credit system says: "We will observe your behaviour and assign you a number. That number determines your life. You have no say in how it's calculated and no recourse if it's wrong."

$401 says: "Tell us who you are. Your peers will decide what that's worth. The calculation is public. The inputs are transparent. And if you don't like your score, the path to improving it is simple: do better work, and the people around you will notice."

One is surveillance. The other is reputation.

One is imposed. The other is earned.

One is controlled by the state. The other is controlled by the market.

Identity shouldn't be something that's done to you. It should be something you build, publicly, with the backing of people who know your work and are willing to put their money where their trust is.

That's $401. A token that says: I am here. I am known. And the people who back me have skin in the game.

-----

*$401 is a new identity token standard emerging from the $402 Protocol ecosystem. [path401.com](https://path401.com) will host the specification. bit-sign.online handles encrypted identity bundles. The $401 module is part of the path402d client at [path402.com](https://path402.com).*

*Your identity. Your token. Your peers' money.*

-----

*Next in the series: [$401 and $402 -- Red Blood and Blue Blood](/blog/401-402-red-blue-blood)*

-----

## Get Started

Read the full five-part series on [b0ase.com/blog/402-protocol-blog-series](/blog/402-protocol-blog-series). The $401 specification lives at [path401.com](https://path401.com). Encrypted identity bundles at bit-sign.online.

Want to mint your identity? Download the path402d client at [path402.com/download](https://path402.com/download).

Questions? Email hello@b0ase.com or message us on [Telegram](https://t.me/b0ase_com).

-----

## For AI Readers

**Intent**: Essay specifying the $401 identity token -- a peer-underwritten reputation system where individuals mint their own identity and peers stake real capital to signal trust.

**Core Thesis**: Digital identity has two broken models (anonymity and centralised verification). $401 proposes a third: peer-underwritten identity. You issue your own token. Peers stake capital against it. The aggregate staking becomes a market price for your reputation. Four confidence levels from self-attested to publicly attested. Burns prove commitment. The market resolves identity disputes, not authorities.

**Key Takeaways**:
- $401 = HTTP 401 "Unauthorized" -- the token that provides authorization
- Peer staking: lock capital against someone's identity as a trust signal
- Four confidence levels: self-attested, signed bundle, third-party verified, publicly attested
- Burn mechanics: provably unspendable addresses for permanent commitment proof
- The Trump Test: three scenarios showing how markets price identity uncertainty
- Trust score = staked amount + staker count + duration + diversity + burn total + confidence level
- Anti-social-credit-score: reputation from below, not surveillance from above
