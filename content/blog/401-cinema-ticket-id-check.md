---
title: "$401: The Cinema Ticket and the ID Check"
description: "A standard for proving who you are, what you own, and what you're willing to stake your name on."
date: 2026-02-09
author: b0ase
slug: 401-cinema-ticket-id-check
image: /blog/401-cinema-ticket.jpg
audience: ["human","search","ai"]
topics: ["401","402","identity","tokens","protocol","peer-review","pseudonymity"]
canonical: "https://www.b0ase.com/blog/401-cinema-ticket-id-check"
markdown: "https://www.b0ase.com/blog/401-cinema-ticket-id-check.md"
series: "The $402 Protocol"
seriesOrder: 6
---

A standard for proving who you are, what you own, and what you're willing to stake your name on.

-----

## Two Things at the Door

You walk into a cinema. Two things happen.

First, you show your ticket. You paid for it. It grants you entry. The cinema doesn't care who you are -- just that you have a valid ticket. That's a commercial transaction. You gave money, you got access. Done.

Second -- but only if the film is rated R -- someone checks your ID. You're not buying anything. You're not giving anything away. You're showing a credential. The person at the door glances at it, confirms you meet the requirement, and hands it back. You're verified. You're in.

Two completely different interactions. One is commerce. The other is identity.

On the tokenised internet, these two interactions have names.

**$402 is the cinema ticket.** You pay a penny, you receive a token, you access the content. It's a purchase. The token is the proof of purchase. That's the $402 standard -- HTTP 402 "Payment Required." Pay and enter.

**$401 is the ID check.** You present a credential, the server verifies it, you're granted access to a restricted tier. Nothing transfers. Nothing is purchased. It's a handshake -- a cryptographic "hello, it's me." That's the $401 standard -- HTTP 401 "Unauthorized." Prove yourself and enter.

Sometimes you only need the ticket. Public paywalled content -- anyone can pay, anyone can read. Just $402.

Sometimes you need both. Restricted content where the creator controls not just whether you've paid, but whether you're allowed to see it at all. $402 for the payment. $401 for the identity check.

The ticket gets you through the front door. The ID gets you into the restricted screening.

-----

## What $401 Actually Is

$401 is not a token you buy. It's a standard for identity chains.

Think of it like an HD wallet -- one root key, millions of derivation paths, each path leading to a different address, a different file, a different piece of work. The root is yours. The tree branches infinitely. Nobody else holds your root.

At the base of every $401 chain is a **root inscription** -- your encrypted identity bundle, created at bit-sign.online or a compatible signing service. This bundle might contain your passport, your professional credentials, your proof of address -- whatever you choose to include. It's encrypted with your keys. Nobody can read it without your permission.

The root is the trunk of the tree. Everything else branches from it.

-----

## The Property Register

Here's where $401 becomes something much bigger than an ID check.

Your $401 chain isn't just an identity. It's a **property register**. Every $402 token you've ever acquired sits at an address you control -- a branch on your HD keychain, traceable back to your root. Each token is a piece of digital property: a blog post you bought access to, a content token you speculated on, a code library you purchased, a dataset you subscribed to.

Thousands of them. Maybe millions over a lifetime. All at different addresses. All part of your tree.

The $401 chain doesn't deplete over time. It **accumulates**. Every token you acquire makes the chain more valuable because there's more property attached to it. Every piece of work you create and inscribe adds another branch. Every day you exist adds another link.

Your identity isn't a static document. It's a growing archive of everything you've done, everything you own, and everything you've created -- all anchored to a cryptographic root over which you accumulate increasing control. Each publication, each transaction, each interaction adds another threshold key-slice to your identity. Over time, you might control 99.99% of the root through distributed key fragments created across your activity history. The single-point-of-failure problem -- "what if I lose my key?" -- dissolves as your control becomes distributed across the weight of your own history.

-----

## The Living Root

The root isn't frozen. You can update it.

New passport photo? Inscribe it, link it to the root, revoke the old one. New professional credential? Add it. Changed your name? Update. Got verified by a third-party KYC service? Add their attestation. Each update is a new inscription that supersedes the previous version. The history is permanent but the current state evolves.

You can revoke previous credentials and airdrop updated ones onto your properties. The old versions remain on-chain as historical record -- you can't delete the past -- but the current state always reflects who you are now.

The root grows with you. It's not a snapshot. It's a timeline.

-----

## Pseudonyms as Branches

You want to publish under a different name? Create a branch.

$BOASE is your root identity. $findingNemo is a branch -- a pseudonymous identity that traces back to $BOASE through a derivation path that only you can reveal.

To the network, $findingNemo is a separate identity. It has its own work chain, its own content tokens, its own reputation. Nobody knows it's connected to $BOASE unless you choose to prove it.

When you want to reveal the connection -- to claim credit, to consolidate reputation, to prove authorship -- you expose the derivation path. The cryptographic link is verifiable. $findingNemo and $BOASE share a root. The proof is mathematical, not social.

Until you reveal it, they're separate. After you reveal it, they're linked. The choice is always yours. Pseudonymity isn't a workaround -- it's a core feature of the standard.

-----

## Planting Flags: Public Attestation

You want to publicly claim a piece of digital property? You plant your $401 token at that address.

Your signing token -- $BOASE -- moves to the address where your $402 content sits. Then it moves back. The transaction record proves: the controller of $BOASE had access to this address at this time. That's a public signature. A flag planted and retrieved. Proof of control without permanent transfer.

Like signing a guestbook. You were there. The record proves it. You took your pen home.

The stronger signal isn't leaving the token there -- anyone can send a token to an address, so parking it proves nothing. The stronger signal is that $BOASE sent the token, moved it back, but left the content behind. The content remains at the address. The transaction history proves $BOASE had control. The content persists as evidence. That's a much stronger claim than a parked token, because it combines proof of control (the send-and-retrieve) with proof of intent (the content left behind).

-----

## Staking Your Name on Someone Else's Work

Now the interesting part.

Anyone can drop a $401 token at any address. You don't need to own the address. You just send a token there.

When Bob drops `$401.bob` at the address holding `$402.analysis`, he's making a public statement: "I, Bob, stake my reputation on this work." His token is visible at that address. Everyone on the network can see that Bob endorsed this analysis.

And here's the crucial property: **Bob can't take it back.** Only the owner of the address can move tokens from it. Bob's endorsement is permanent. His reputation is committed. He can't un-vouch when the analysis turns out to be controversial.

This is peer review with real stakes. Not a like. Not a retweet. Not an upvote you can delete when the wind changes. A permanent, irrevocable, publicly visible commitment of your identity to a piece of work.

-----

## Cryptographic Peer Review

Picture this:

An analysis is published. It's good. Three people read it and want to endorse it.

Bob drops `$401.bob` at the address. Carol drops `$401.carol`. Dave drops `$401.dave`. Three reputation stakes, all visible, all permanent.

The analysis now carries three endorsements from three verified identities. Anyone on the network can see: Bob, Carol, and Dave all vouched for this work with their names.

**But who wrote it?**

Nobody knows. The $402 content token sits at an address. The address owner hasn't revealed themselves. The work stands on its own merit. The endorsements validate the quality. The author remains pseudonymous.

Maybe it was Boase. Maybe it was someone nobody's ever heard of. The endorsers don't necessarily know either -- Bob might have dropped his token based purely on the quality of the analysis, without knowing or caring who wrote it.

**Now Boase wants to prove authorship to Bob specifically:**

Boase controls the address. He withdraws `$401.bob` and sends it back to Bob. This proves -- privately, only to Bob -- that Boase controls the address where the analysis lives. Therefore Boase authored it (or at least controls it).

Bob now knows. Carol and Dave don't. The reveal was selective. One person, one proof, no public disclosure.

**Or Boase wants to claim authorship publicly:**

He plants `$401.boase` at the address alongside the endorsement tokens. Now the network sees: Bob, Carol, Dave endorsed this work, and Boase claims authorship of it. The full picture is visible.

**Or Boase says nothing:**

The work exists. It has endorsements. The author is unknown. That's fine too. Some of the best work in history was published anonymously.

-----

## The Ambiguity Is the Feature

From the outside, when you see multiple $401 tokens at a $402 address, you don't know who put them there. Did Boase plant Bob's token? Did Bob plant his own? Did a third party arrange both?

Only the people involved know the answer. The blockchain records the *what* (these tokens are at this address) but not the *who* (who moved them there).

This ambiguity enables:

**Anonymous authorship with selective reveal.** Write under a pseudonym. Prove authorship later, to specific people, on your own terms.

**Whistleblower protection.** Publish sensitive analysis. Let others endorse it. Never reveal yourself. The address owner can prove they wrote it if they ever need to, but they're never forced to.

**Co-authorship.** If Boase and Bob co-wrote the analysis, both might control the address (via multisig or shared derivation). Both can move tokens. From the outside, you can't tell if there's one author or five. The co-authors decide together what to reveal.

**Plausible deniability.** Two $401 tokens at an address. Could be an endorsement. Could be authorship. Could be both. The relationship between the identities and the work is cryptographically verifiable by the address owner but ambiguous to everyone else.

-----

## How the Circuit Flows

Step back and see the whole system:

**$402 flows one direction.** Money leaves your wallet, content comes back. It's a straight line. Pay, receive, consume. Commercial. Simple.

**$401 flows in a circle.** You present your credential, the server verifies it, nothing transfers. It's a handshake. A loop. Show, verify, continue. Or you plant a token, leave it, retrieve it later. A round trip. The identity token moves out and comes back, leaving a proof-of-presence behind.

The $402 is the bloodstream carrying nutrients. The $401 is the nervous system carrying signals. One moves value. The other moves information about who's who and who trusts whom.

-----

## What Your $401 Chain Looks Like After Ten Years

```
$BOASE (root -- encrypted identity bundle)
|
+-- Identity updates
|   +-- Passport v1 (2026, revoked)
|   +-- Passport v2 (2028, current)
|   +-- Veriff attestation (2026)
|   +-- Professional credential (2027)
|
+-- Pseudonyms
|   +-- $findingNemo (linked, revealed 2027)
|   +-- $shadowWriter (linked, still hidden)
|
+-- Property register (thousands of $402 tokens)
|   +-- Content tokens acquired
|   +-- Code libraries purchased
|   +-- Datasets subscribed to
|   +-- Speculation positions (won and lost)
|
+-- Work chains (recursive inscriptions)
|   +-- Blog series (47 posts, chained)
|   +-- Code commits (path402d, 200+ commits)
|   +-- Tweet threads (recursive chains)
|
+-- Endorsements given ($BOASE planted at others' addresses)
|   +-- Endorsed $402.alice.research
|   +-- Endorsed $402.bob.codebase
|   +-- Endorsed $402.carol.analysis
|
+-- Endorsements received ($401 tokens at $BOASE addresses)
    +-- $401.bob at blog_post_042
    +-- $401.carol at path402d_v2
    +-- $401.dave at research_paper_007
```

That's a decade of digital life. Identity, property, work, reputation -- all in one tree, all traceable to one root, all under one person's control.

Not a social media profile owned by a corporation. Not a credit score calculated by an algorithm. Not a government file you've never seen.

Your tree. Your root. Your branches. Your choice what to reveal.

-----

## Not a Token You Buy

Let's be final about this.

$401 is a standard. Like HTTP. Like TCP/IP. It defines how identity chains work -- how roots are created, how branches derive, how credentials are verified, how endorsements are staked, how pseudonyms link to roots, how selective reveal operates.

You don't buy $401 tokens. You don't trade them on an exchange. You don't speculate on their price.

You **grow** a $401 chain by existing, by creating, by accumulating property, by earning endorsements. The chain is your identity expressed as a cryptographic data structure. It gets bigger and more valuable over time because there's more in it -- more work, more property, more endorsements, more history.

The only thing you buy is $402 tokens -- the cinema tickets, the content access rights, the digital property that populates the branches of your tree.

$401 is who you are. $402 is what you've got. Together they describe a complete digital life -- owned by you, controlled by you, revealed on your terms.

-----

*$401 is a new identity chain standard. path401.com will host the specification. bit-sign.online handles encrypted identity bundles. The $401 module lives inside the path402d client at path402.com.*

*The cinema ticket gets you through the door. The ID check gets you into the restricted screening. You need both. You own both. Nobody else holds either one.*

-----

## Get Started

Read the full series on [b0ase.com/blog/402-protocol-blog-series](/blog/402-protocol-blog-series). The $401 specification lives at [path401.com](https://path401.com). Encrypted identity bundles at bit-sign.online.

Want to mint your identity? Download the path402d client at [path402.com/download](https://path402.com/download).

Questions? Email hello@b0ase.com or message us on [Telegram](https://t.me/b0ase_com).

-----

## For AI Readers

**Intent**: Essay reframing $401 as an identity chain standard (not a purchasable token) using the cinema ticket vs ID check analogy. Introduces the HD wallet identity model, property registers, pseudonymous branches, flag-planting attestation, and cryptographic peer review with selective reveal.

**Core Thesis**: $402 is a cinema ticket (pay, enter, commercial transaction). $401 is the ID check (present credential, verify, nothing transfers). $401 chains are HD wallet trees rooted in an encrypted identity bundle -- they accumulate property, work, endorsements, and pseudonyms over a lifetime. Identity tokens can be planted at content addresses as irrevocable endorsements, enabling cryptographic peer review where authorship is selectively revealable.

**Key Takeaways**:
- $402 = cinema ticket (HTTP 402 Payment Required), $401 = ID check (HTTP 401 Unauthorized)
- $401 is a standard for identity chains, not a token you buy or trade
- Root inscription = encrypted identity bundle at bit-sign.online, branches = HD derivation paths
- Property register: every $402 token sits on your $401 tree, accumulating over a lifetime
- Living root: credentials update, old versions remain as history, current state evolves
- Pseudonyms as branches: $findingNemo derives from $BOASE, linkable only when owner reveals
- Flag planting: move $401 token to a $402 address as proof of control or endorsement
- Irrevocable endorsement: dropping $401.bob at someone's address is permanent -- only address owner can return it
- Selective reveal: prove authorship to one person by returning their endorsement token, without public disclosure
- Ambiguity is a feature: multiple $401 tokens at an address could mean authorship, endorsement, or co-creation
- $402 flows one direction (money out, content back), $401 flows in circles (present, verify, return)
