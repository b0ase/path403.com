# @b0ase Primitives Extraction Checklist

> Generated from Ralph Wiggum's Ecosystem Map (ECOSYSTEM_MAP.md)
>
> **Status**: 54 packages built (exceeded 50+ goal!)

---

## DONE

### Core Infrastructure (40)
- [x] `@b0ase/handcash` - Unified HandCash integration (payments, auth, provider) ✅
- [x] `@b0ase/ledger` - Unified accounting layer for tokens (internal overlay) ✅
- [x] `@b0ase/multi-wallet-auth` - Multi-wallet auth (HandCash, Yours, Phantom, MetaMask) ✅
- [x] `@b0ase/flow-canvas` - SVG-based workflow canvas with nodes, connections, drag-drop ✅
- [x] `@b0ase/bonding-curve` - Token price curves (exponential, linear, sigmoid) ✅
- [x] `@b0ase/dividend-engine` - Pro-rata dividend distribution to token holders ✅
- [x] `@b0ase/org` - Organization management with RBAC, roles, shares, KYC ✅
- [x] `@b0ase/nft-container` - Universal file tokenization container (.nft/.ft format) ✅
- [x] `@b0ase/chain-publish` - Unified BSV blockchain publishing (OP_RETURN, Ordinals) ✅
- [x] `@b0ase/governance` - Token-based governance with proposals, voting, quorum ✅
- [x] `@b0ase/price-service` - Real-time crypto price service with caching ✅
- [x] `@b0ase/bitcoin-signing` - BSV message signing and verification utilities ✅
- [x] `@b0ase/storage-options` - Cloud/blockchain storage provider definitions ✅
- [x] `@b0ase/payments` - Multi-party payment splits and revenue distribution ✅
- [x] `@b0ase/wallet-view` - Unified wallet balance display types and utilities ✅
- [x] `@b0ase/whatsonchain` - WhatsOnChain BSV API client ✅
- [x] `@b0ase/shareholder-ui` - Cap table and shareholder display ✅
- [x] `@b0ase/version-tree` - Git-like version tree visualization ✅
- [x] `@b0ase/dropblocks` - Decentralized storage management (IPFS, Arweave, BSV) ✅
- [x] `@b0ase/unified-auth-ui` - Unified authentication UI (OAuth + Wallets) ✅
- [x] `@b0ase/cross-app-tokens` - Cross-app token recognition and portability ✅
- [x] `@b0ase/brc100-tokens` - BRC-100 token standard implementation ✅
- [x] `@b0ase/stripe-bsv-bridge` - Fiat onramp for BSV via Stripe ✅
- [x] `@b0ase/network-graph` - D3 force-directed network graph types ✅
- [x] `@b0ase/supabase-types` - Shared Supabase database types ✅
- [x] `@b0ase/token-distributor` - Batch token distribution and airdrop ✅
- [x] `@b0ase/dopamine` - Audio/visual effects for payment gamification ✅
- [x] `@b0ase/task-contracts` - Task/bounty contract system ✅
- [x] `@b0ase/utxo-viz` - 3D bubble UTXO visualization ✅
- [x] `@b0ase/nft-minting-modal` - NFT creation interface ✅
- [x] `@b0ase/market-table` - Trading interface types and utilities ✅
- [x] `@b0ase/supabase-service` - Supabase client patterns and utilities ✅
- [x] `@b0ase/chat-contracts` - Message payment contracts ✅
- [x] `@b0ase/tokenization-modal` - Asset tokenization UI ✅
- [x] `@b0ase/wallet-adapter` - Unified wallet adapter for multi-chain ✅
- [x] `@b0ase/tx-builder` - Transaction building utilities ✅
- [x] `@b0ase/inscription-service` - Ordinals inscription service ✅
- [x] `@b0ase/api-client` - Unified API client with retry/caching ✅
- [x] `@b0ase/crypto-utils` - Cryptographic utilities (SHA256, Base58, etc.) ✅
- [x] `@b0ase/rate-limiter` - Rate limiting utilities for APIs ✅

### Utility Primitives (14)
- [x] `@b0ase/event-emitter` - Type-safe event emitter with async support ✅
- [x] `@b0ase/validation` - Input validation with schema builders ✅
- [x] `@b0ase/logger` - Structured logging with levels and transports ✅
- [x] `@b0ase/storage-adapter` - Unified storage (localStorage, IndexedDB, memory) ✅
- [x] `@b0ase/state-machine` - Type-safe finite state machine ✅
- [x] `@b0ase/retry-utils` - Retry with backoff and circuit breaker ✅
- [x] `@b0ase/promise-utils` - Promise utilities (debounce, throttle, pool) ✅
- [x] `@b0ase/date-utils` - Date formatting, parsing, relative time ✅
- [x] `@b0ase/string-utils` - String utilities (case, slugify, template) ✅
- [x] `@b0ase/object-utils` - Object utilities (deep clone, merge, pick, omit) ✅
- [x] `@b0ase/array-utils` - Array utilities (groupBy, chunk, unique, sort) ✅
- [x] `@b0ase/queue-manager` - Job queue with priority and concurrency ✅
- [x] `@b0ase/http-status` - HTTP status codes and error utilities ✅
- [x] `@b0ase/color-utils` - Color parsing, conversion, and contrast ✅

---

## HIGH PRIORITY (Remaining)

Used across multiple apps, high reuse potential:

| Package | Complexity | Source Repos | Description |
|---------|------------|--------------|-------------|
| `@b0ase/ordinals-api` | Medium | bitcoin-wallet | Ordinals indexer API client |
| `@b0ase/mempool-service` | Medium | bitcoin-wallet | Mempool monitoring service |

---

## LOWER PRIORITY (Specialized)

Specialized use cases:

| Package | Complexity | Source Repos | Description |
|---------|------------|--------------|-------------|
| `@b0ase/os-shell` | High | Bitcoin-OS | Desktop OS simulation |
| `@b0ase/blockchain-dns` | Medium | bitcoin-browser | Decentralized domain resolver |
| `@b0ase/x402-revenue` | Medium | bitcoin-browser | HTTP 402 payment protocol |
| `@b0ase/domain-governance` | Low-Medium | bitcoin-browser | DNS voting/governance |
| `@b0ase/blockchain-email` | Medium-High | bitcoin-email | On-chain email system |
| `@b0ase/steganography` | Low | bitcoin-marketing | Hidden data in images |
| `@b0ase/cli-payment` | Low | transaction-broadcaster | CLI payment tools |
| `@b0ase/grant-system` | Medium | Bitcoin-OS | Grant application system |
| `@b0ase/yours-wallet` | Medium | Bitcoin-OS | Yours wallet integration |
| `@b0ase/button-press` | Medium | moneybutton2 | Payment + tokenization combo |

---

## Build Order Progress

### Phase 1: Foundation ✅ COMPLETE
1. ~~`@b0ase/handcash`~~ ✅
2. ~~`@b0ase/multi-wallet-auth`~~ ✅
3. ~~`@b0ase/brc100-tokens`~~ ✅

### Phase 2: Visualization ✅ COMPLETE
4. ~~`@b0ase/flow-canvas`~~ ✅
5. ~~`@b0ase/network-graph`~~ ✅

### Phase 3: Tokenomics ✅ COMPLETE
6. ~~`@b0ase/dividend-engine`~~ ✅
7. ~~`@b0ase/bonding-curve`~~ ✅
8. ~~`@b0ase/nft-container`~~ ✅

### Phase 3.5: Organization ✅ COMPLETE
9. ~~`@b0ase/org`~~ ✅

### Phase 4: Storage & Chain ✅ COMPLETE
10. ~~`@b0ase/chain-publish`~~ ✅
11. ~~`@b0ase/dropblocks`~~ ✅
12. ~~`@b0ase/version-tree`~~ ✅

### Phase 5: UI Components ✅ COMPLETE
13. ~~`@b0ase/unified-auth-ui`~~ ✅
14. ~~`@b0ase/wallet-view`~~ ✅
15. ~~`@b0ase/shareholder-ui`~~ ✅

### Phase 6: Cross-App & Payments ✅ COMPLETE
16. ~~`@b0ase/cross-app-tokens`~~ ✅
17. ~~`@b0ase/stripe-bsv-bridge`~~ ✅
18. ~~`@b0ase/governance`~~ ✅
19. ~~`@b0ase/price-service`~~ ✅
20. ~~`@b0ase/payments`~~ ✅
21. ~~`@b0ase/whatsonchain`~~ ✅
22. ~~`@b0ase/bitcoin-signing`~~ ✅
23. ~~`@b0ase/storage-options`~~ ✅

### Phase 7: Database & Distribution ✅ COMPLETE
24. ~~`@b0ase/supabase-types`~~ ✅
25. ~~`@b0ase/token-distributor`~~ ✅
26. ~~`@b0ase/ledger`~~ ✅

### Phase 8: Gamification & Contracts ✅ COMPLETE
27. ~~`@b0ase/dopamine`~~ ✅
28. ~~`@b0ase/task-contracts`~~ ✅

---

## Notes

- Each primitive should be in `packages/[name]/`
- All use same structure as `@b0ase/handcash`
- Build with `pnpm build` in package dir
- Link with `pnpm add @b0ase/[name] --workspace`

---

**Last Updated**: 2026-01-25
**Extracted by**: Ralph Wiggum + Claude
