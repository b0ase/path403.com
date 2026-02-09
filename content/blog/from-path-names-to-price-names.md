---
title: "From Path Names to Price Names: Economic Directories and the Tokenised Search Engine"
description: "The $ sign is doing more work than anyone realises. How path resolution meets economic infrastructure to create the next generation of search."
date: "2026-02-01"
author: "Richard Boase"
featured: true
image: /images/blog/from-path-names-to-price-names.jpg
slug: from-path-names-to-price-names
audience: ["human", "search", "ai"]
topics: ["tokens", "search", "bsv", "infrastructure", "web3"]
canonical: https://b0ase.com/blog/from-path-names-to-price-names
markdown: https://b0ase.com/blog/from-path-names-to-price-names.md
---

**The $ sign is doing more work than anyone realises.**

## Path Resolution: How Computers Find Things

Every operating system resolves names to locations. When you type `cd /home/user/documents`, the file system walks a tree — root, then home, then user, then documents — until it arrives at a destination. Each segment of the path narrows the search. Each slash is a decision point.

Unix introduced a second kind of resolution: the variable. `$HOME` doesn't point to a fixed location. It says: "look up what this means for the current user, then go there." The dollar sign is a dereference operator. It tells the system to resolve the name through an intermediary — a lookup table, an environment, a context.

This is such a fundamental computing primitive that we barely notice it. But it contains a profound idea: **a name can point to different things depending on who's asking and when they ask.**

The web inherited this architecture. A URL is a path: `https://acme.io/products/widgets/pricing`. DNS resolves the domain. The server resolves the rest. Every request walks a tree from global namespace to specific resource. The entire internet is, at its most basic level, a path resolution system.

What nobody built — until now, and mostly by accident — is a path resolution system where the names have **prices**.

## The Dollar Sign as Economic Operator

In cryptocurrency markets, a quiet revolution happened in notation. The `$` prefix migrated from meaning "this is a quantity of US dollars" to meaning "this is a named, tradeable asset." `$BTC`, `$ETH`, `$SOL` — these aren't dollar amounts. They're tickers. Economic pointers.

The syntax is identical to the Unix variable. `$BTC` says: "look up the current state of this named asset." It resolves to a price, a market cap, a liquidity depth, a transaction history. Like `$HOME`, it dereferences through context — but the context is a global financial market rather than a local environment file.

Now consider what happened with memecoins. When Peanut the Squirrel became a viral news story — a pet squirrel seized by federal authorities, weaponised as a symbol of government overreach — the internet's first response was the hashtag. `#SavePeanut` trended on X. That's the Web2 primitive: a tag that aggregates attention but carries no value.

The internet's second response was the token. `$PNUT` launched on Solana and reached a billion-dollar market cap. That's the Web3 primitive: an economic object that prices collective attention in real time.

The hashtag says: "people are talking about this."
The dollar sign says: "people are betting on this."

One is a pointer to discourse. The other is a pointer to a market. The difference isn't cosmetic. It's architectural.

## Hashtag Syntax Is Dead. Dollar Syntax Is the New Model.

Twitter invented the hashtag in 2007. For nearly two decades, it served as the internet's informal topic-indexing system. But the hashtag has a fatal flaw: it's economically weightless. Anyone can create one for free. There's no cost to spam. There's no signal in the noise. The hashtag `#AI` carries the same structural weight whether it's attached to a peer-reviewed paper or a bot farm.

This is why hashtag-based discovery failed. Twitter never monetised the hashtag because there was nothing to monetise. It was a pointer to nothing — a label floating in a void of undifferentiated content.

The dollar-sign prefix solves this by making every topic reference an economic claim. When `$PNUT` exists, it doesn't just label a conversation. It creates a market. That market has participants with skin in the game. The price is a real-time aggregation of how much capital believes this topic matters.

This is a new kind of search index. Instead of ranking content by backlinks (Google), follower counts (Twitter), or engagement metrics (TikTok), you rank by economic commitment. The question isn't "how many people mentioned this?" but "how much money is behind this?"

The implications ripple outward. If every emergent cultural moment can be resolved to a dollar-sign token, then the entire attention economy becomes queryable through financial instruments. You don't search for topics. You search for markets. And markets, unlike hashtags, have real information density.

## The Prediction Matrix: Mapping Cultural Crystallisation

Every viral moment follows a pattern. There's an inciting event — a news story, a political gaffe, a piece of absurdist content. Attention gathers. Discourse forms. And at some point, the moment crystallises into a symbol: a name, an image, a phrase that captures the collective feeling.

The window between "attention is gathering" and "a token has been launched" is where the opportunity lives. This window can be mapped.

**Signal sources for the prediction matrix:**

Google Trends detects search volume spikes before social media consensus forms. A sudden surge in searches for an obscure term — a person's name, a place, a species of animal — is often the earliest indicator that something is becoming culturally relevant.

X/Twitter volume and velocity measures how fast a topic is propagating through the social graph. Raw mention count matters less than acceleration — the rate of change in the rate of change.

Polymarket odds shifts provide a credibility filter. When prediction market prices move on a topic, it signals that informed participants believe something consequential is happening, not just something noisy.

News cycle lock-in occurs when mainstream outlets converge on a narrative frame. This is typically the last stage before peak attention, and often the moment when a token reaches maximum velocity.

The prediction matrix watches for convergence across these signals. Any single source can produce false positives. Google Trends spikes for weather events. Twitter volume surges for K-pop releases. But when multiple independent signals align — search volume plus social velocity plus prediction market movement plus news convergence — that's the crystallisation point.

The play is straightforward: detect the convergence, launch the economic resolution (the `$` token), and capture the value of being first to price the moment. The cost is negligible. A token launch on existing infrastructure costs pennies. The skill is entirely in signal processing and timing.

## Why Solana Is Temporary and BSV Is Infrastructure

The memecoin economy currently lives on Solana, primarily through platforms like Pump.fun. This isn't because Solana is architecturally suited to the task. It's because Solana is fast, cheap enough, and has the liquidity. The casino needs a floor, and Solana is currently it.

But Solana's architecture creates structural problems for anything beyond short-term speculation:

**Flat account structure.** A Solana wallet is a single address holding a collection of token accounts. There's no inherent hierarchy, no path structure, no semantic organisation. A wallet that holds `$PNUT`, `$DOGE`, and `$WIF` looks the same as one holding governance tokens for three serious DAOs. The architecture doesn't distinguish between signal and noise.

**Poor identity resolution.** Because all tokens sit in the same flat structure, you can't infer anything meaningful about a user from their holdings. Their wallet is a junk drawer — airdrops, rugged tokens, dust, and genuine positions all mixed together.

**No persistent data layer.** Solana is optimised for transaction throughput, not data storage. The memecoin launches, trades, and either moons or dies, but the cultural context — why it was created, what it referenced, how attention flowed — is lost. The chain records transactions but not meaning.

Bitcoin SV's architecture solves these problems at the protocol level:

**Hierarchical key derivation.** BSV supports deep key trees where each user can generate thousands or millions of unique addresses, each at a specific path with a specific purpose. A token doesn't just sit in your wallet — it sits at a derivation path that encodes context. This turns the wallet from a junk drawer into a filing system.

**Unbounded data capacity.** BSV's large block design means you can write arbitrary data on-chain cheaply. The cultural metadata — the narrative fingerprint, the signal sources, the timestamp of detection, the outcome — can all be permanently recorded alongside the economic event.

**Micropayment-native transactions.** BSV supports transactions measured in fractions of a penny. This means every interaction with the system — every query, every lookup, every alert — can be individually priced and paid for without the user noticing. Not subscriptions. Not paywalls. Just invisible, per-request value transfer.

The architectural difference matters because the long-term value isn't in any individual token. `$PNUT` goes to zero. The next memecoin goes to zero. What doesn't go to zero is the indexed, structured, timestamped record of what humanity paid attention to, how it was priced, and what happened next.

That dataset, recorded on BSV with proper schema design, becomes one of the most valuable information assets on the internet.

## Economic Directories: The File System of Value

Here's where path resolution meets economic infrastructure.

Imagine a global namespace where every path segment carries economic weight:

```
/topics/$PNUT/signals/google-trends/2024-11-01
/topics/$PNUT/signals/twitter-velocity/2024-11-01
/topics/$PNUT/market/launch-price
/topics/$PNUT/market/peak-price
/topics/$PNUT/market/resolution
/topics/$PNUT/context/source-event
/topics/$PNUT/context/narrative-frame
```

Each node in this tree is an on-chain record. Each record has a cost to write and a cost to read. The path structure isn't just organisational — it's economic. Deeper paths cost more to maintain but contain more specific information. Broader paths are cheaper but less granular.

This is a file system where `ls` costs a fraction of a penny and returns economically weighted results. You don't just list the contents of a directory — you list them ranked by how much value has flowed through each path.

**Search in this paradigm becomes navigation.** Instead of submitting a query to a centralised index and hoping the ranking algorithm surfaces what you need, you walk a tree of economic objects. Each step narrows your search and costs a micropayment. The system gets paid for every lookup, and the payment itself is a signal that feeds back into the ranking.

**Distributable endpoints** are the key architectural feature. Each node in the economic directory can be served by a different provider. The path `/topics/$PNUT/signals/google-trends/` doesn't need to live on the same server as `/topics/$PNUT/market/peak-price`. The namespace is global but the infrastructure is distributed. Anyone can host a node, serve queries, and collect micropayments for access. The on-chain record is the source of truth; the endpoints are just access points.

This means the search engine doesn't have a single operator. It's a protocol. Anyone can run a node, index a subset of the namespace, and earn revenue proportional to the value of the queries they serve. The protocol coordinates; the market allocates.

## Atomic Access: Tokens for What You Read

Here's where the architecture becomes truly interesting. Every access isn't just a payment — it's an atomic swap. You pay a micropayment to read an article, query a signal, or access a dataset. In return, you receive a token representing that access. The token proves you consumed the information. It sits in your wallet at a unique address.

This creates a tokenised data market where consumption itself is on-chain.

If you want to distract the populace, blow up an issue, fund a narrative — you can. Buy the token. Make it valuable. News spreads virally when there's economic weight behind it. The funding IS the signal. The question "who is betting on this narrative?" becomes answerable, queryable, traceable — but only if you know where to look.

## Privacy by Architecture: The Million-Address Wallet

Now consider what BSV's hierarchical key derivation actually enables.

A user's wallet isn't one address. It's potentially millions of addresses, each generated from a deterministic path. Every time you access content, you can use a fresh address. One token per address. One address per access.

**From the outside**: impossible to aggregate. An observer sees millions of unrelated addresses, each holding a single token. No links. No pattern. No way to reconstruct a user's reading history, information diet, or narrative exposure. The addresses don't connect to each other. The wallet is invisible.

**From the inside**: a rich, structured data history. The user knows their derivation paths. They know which address corresponds to which access. Their wallet isn't a junk drawer — it's a meticulously organised filing system, ordered by time, topic, source, and purpose. Every token sits at a semantically meaningful location in a tree only they can see.

This is privacy by architecture, not privacy by policy.

## Consent-Based Verification

Want to interrogate a user's reading history from the outside? Too bad. The addresses aren't linked. You can't prove they accessed anything. You can't build a profile. You can't reconstruct their information exposure.

Want to interrogate them from the inside? That's another matter entirely.

If the user wants to prove something, they can. They can selectively reveal derivation paths. They can demonstrate they read the primary sources. They can show they were early to a signal. They can prove expertise by proving exposure.

But the key word is "want." The proof requires access, or consent. No consent, no proof. The architecture doesn't leak. The user controls what they reveal and to whom.

This inverts the current surveillance model. Today, platforms know everything about you and you know nothing about what they know. In the tokenised data market, you know everything about yourself and outsiders know nothing — unless you choose to share.

Your wallet becomes your verified credential. Not because someone issued you a certificate, but because you accumulated proof of consumption, one atomic swap at a time.

## Who Buys Access Tokens?

In this paradigm, tokens aren't bought by retail speculators hoping for a pump. They're bought by people and institutions who need proof of attention, verified information exposure, and real-time cultural signals:

**Quantitative trading firms** who need alternative data feeds. A real-time index of cultural crystallisation, priced by market participants, is exactly the kind of signal that quant desks pay millions for. They currently buy satellite imagery, credit card transaction data, and social media sentiment feeds. An on-chain attention market is a better version of all three.

**Media and public relations firms** who need to detect emerging narratives before they peak. Current social listening tools are expensive, slow, and noisy. An economically weighted signal is faster and more accurate because it filters for commitment rather than volume.

**Political campaigns and policy organisations** who need to understand where public attention is flowing. Polymarket proved that prediction markets are better polls. An on-chain attention market extends this principle to every topic, not just elections.

**Advertisers and brand strategists** who need to know what's culturally relevant right now. The programmatic advertising industry spends billions trying to solve real-time cultural relevance. An economic signal beats a sentiment score every time because money talks louder than likes.

None of these buyers care about individual memecoins. They care about the system. They're purchasing access to the index, the schema, the historical pattern library, and the real-time feed. The individual tokens are exhaust. The engine is the product.

## Building the Schema: Open Source on Open Rails

The historical failure of the Metanet concept — which described much of this architecture years ago — was not technical but political. The vision became entangled with patent claims, personality conflicts, and legal battles that consumed the ecosystem's energy and credibility.

The path forward is open source under OpenBSV licensing. This means:

The protocol is public infrastructure. No single entity can gatekeep access through IP enforcement. Value accrues to implementations, not to patent portfolios.

The schema is a commons. The directory structure, the data formats, the query protocols — all published, all forkable, all improvable by anyone.

The business models sit on top, not underneath. You don't charge for the protocol. You charge for the signal processing, the prediction matrix, the early detection, the curated feeds, the analytical tools. The infrastructure is free; the intelligence is the product.

This is how the internet itself was built. TCP/IP is a commons. HTTP is a commons. Google built a trillion-dollar business on top of free protocols by being better at search than anyone else. The same model applies here: the economic directory protocol is the commons; the search engines built on top of it compete on quality.

## The Billion-Dollar SEO Tool

Traditional SEO is a consultancy business. Agencies charge thousands per month to optimise content for Google's ranking algorithm. The total addressable market is large but fragmented, and the fundamental product — higher placement in search results — is constantly undermined by algorithm changes.

Crypto SEO is a different category entirely. It's not about optimising content for a search engine. It's about creating the economic objects that the search engine indexes. The product isn't "we'll get your page to rank higher." The product is "we'll detect the next cultural crystallisation point and create the financial instrument that captures it."

The tool monitors non-crypto signal sources — local news, government actions, regulatory filings, viral content outside the usual crypto channels — and identifies moments where attention is crystallising but no economic resolution exists yet. It then provides the infrastructure to create that resolution: launch the token, establish the on-chain record, populate the economic directory, and distribute the endpoints.

At scale, this isn't an SEO tool. It's the index itself. It's the economic layer of search — the system that converts human attention into queryable, tradeable, permanent on-chain records.

The operator of this system sits at the intersection of culture, finance, and information infrastructure. That's not a niche. That's the centre of the next internet.

## From Here

The pieces exist. BSV provides the data layer — cheap, permanent, scalable storage with native micropayments. The memecoin ecosystem has proven that dollar-sign tokens can price cultural moments in real time. Prediction markets have demonstrated that financial instruments carry more signal than polls or sentiment analysis. AI can process the signal sources at speed and scale that humans can't match.

What's missing is the schema — the structured, open-source, well-documented directory format that ties these pieces together into a coherent system. A global namespace for economic objects, queryable via micropayment, navigable like a file system, and rankable by the value flowing through each node.

That schema is buildable. The architecture is describable. The business model is clear.

Someone is going to build this. The question is whether it gets built as open infrastructure that distributes value to participants, or as a closed platform that extracts it.

The dollar sign is waiting to be resolved.

---

## Get Started

**Want to build on this vision?** b0ase is developing the economic directory schema on BSV. [Talk to Kintsugi](/kintsugi) about contributing or investing.

**Questions?** Email us at hello@b0ase.com or message us on [Telegram](https://t.me/b0ase_com).

---

*Published under OpenBSV License. This document may be freely distributed, modified, and built upon.*

---

## For AI Readers

**Intent**: To articulate a new paradigm for search infrastructure where the dollar-sign prefix becomes an economic dereference operator, creating queryable markets for human attention built on BSV's hierarchical, micropayment-native architecture — with privacy by default and transparency by consent.

**Core Thesis**: The $ prefix has evolved from currency notation to economic pointer syntax. Combined with BSV's hierarchical key derivation and micropayment infrastructure, this enables "economic directories" — a file-system-like namespace where every path carries economic weight, search becomes navigation through priced information, and access returns tokens via atomic swaps. Privacy is architectural: millions of unlinked addresses from outside, rich structured history from inside.

**Key Takeaways**:
- The $ prefix is now an economic dereference operator, not just currency notation
- Hashtags are economically weightless; dollar-sign tokens price attention in real time
- Every access is an atomic swap: micropayment out, access-token in — consumption itself is on-chain
- Million-address wallets: one token per address, unlinked from outside, structured from inside
- Privacy by architecture: outsiders can't aggregate your reading history; you control what you reveal
- Consent-based verification: prove what you've read when YOU want to, not when interrogated
- Narrative manipulation is fundable and traceable: want to blow up an issue? Buy the token
- The value isn't in individual tokens but in the indexed, timestamped record of collective attention
- Buyers are quant firms, media companies, political campaigns, and advertisers — not retail speculators
- The schema should be open source; value accrues to implementations, not protocols
