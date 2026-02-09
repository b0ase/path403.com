# Bitcoin Writer - Product Requirements Document

> **Status**: Draft
> **Owner**: Richard
> **Last Updated**: 2026-01-25
> **Token**: $WRITER (planned)
> **Repo**: /Volumes/2026/Projects/bitcoin-writer
> **Architecture**: Follows [Exchange Pattern](EXCHANGE_PATTERN.md)

---

## 1. Executive Summary

**One-liner**: Write once, own forever—documents on the blockchain.

**Problem**: Writers don't own their content. Platforms can censor, deplatform, or disappear. Proving authorship is hard. Getting paid requires intermediaries who take 30%+.

**Solution**: A beautiful writing app where every save creates an immutable blockchain record. Writers own their content cryptographically, get paid instantly via micropayments, and can monetize through NFTs, pay-per-read, and time-locked releases.

**Target User**:
- Primary: Independent writers, bloggers, journalists who want ownership
- Secondary: Content creators monetizing exclusive content
- Tertiary: Publishers needing tamper-proof document trails

---

## 2. Business Model

### Revenue Streams
| Stream | Description | Pricing |
|--------|-------------|---------|
| Storage Markup | 2x markup on blockchain storage costs | ~$0.10/KB |
| NFT Commission | Fee on NFT sales | 2.5% |
| Premium Features | Advanced encryption, collaboration | Subscription |
| Contract Completion | Marketplace escrow fee | 5% |

### Token Economics (Planned)
- **Token**: $WRITER
- **Supply**: TBD (follows bonding curve)
- **Utility**:
  - Hold → receive share of platform revenue
  - Spend → premium features, reduced fees
  - Stake → governance over feature roadmap
- **Dividend Flow**: Storage fees → Cashboard → 30% to $WRITER holders

### Key Metrics
- **North Star**: Documents Saved to Chain (DSC)
- **Secondary**:
  - Monthly Active Writers
  - Total storage volume (KB)
  - NFT sales volume
  - Avg revenue per writer

---

## 3. Core Features

### MVP (Exists)

1. **Rich Text Editor**
   - User story: As a writer, I want a distraction-free editor so I can focus on writing
   - Implementation: Quill.js WYSIWYG with formatting toolbar
   - Status: ✅ Complete

2. **Save to Blockchain**
   - User story: As a writer, I want to save my work permanently so no one can delete it
   - Implementation: Multiple protocols (B, D, BCAT, UHRP, Bico)
   - Cost: ~$0.05/KB with 2x service markup
   - Status: ✅ Complete

3. **HandCash Authentication**
   - User story: As a user, I want to login with my wallet
   - Implementation: OAuth with PAY + SIGN_DATA permissions
   - Status: ✅ Complete

4. **Document Versioning (Work Tree)**
   - User story: As a writer, I want to track versions of my document
   - Implementation: Git-style version chains on blockchain
   - Status: ✅ Complete

5. **Encryption Options**
   - User story: As a writer, I want to control who can read my content
   - Options: Password, NoteSV, Multiparty, Timelock
   - Status: ✅ Complete

6. **NFT Creation**
   - User story: As a writer, I want to sell my work as NFTs
   - Implementation: Mint with royalty %, supply cap, pricing
   - Status: ✅ Complete

### Phase 2 (Planned)
- [ ] Writer marketplace (find gigs, bid on projects)
- [ ] Collaboration (real-time multi-author)
- [ ] Import from Medium, Substack, WordPress
- [ ] Mobile PWA
- [ ] Chrome extension

### Future
- [ ] AI writing assistant (Gemini integration exists)
- [ ] Publisher portal (commission writers)
- [ ] Audiobook generation
- [ ] Multi-language support

---

## 4. Technical Architecture

### Primitives Used
| Package | Purpose |
|---------|---------|
| `@b0ase/handcash` | Wallet auth and payments |
| `@b0ase/inscription-service` | On-chain document storage |
| `@b0ase/tx-builder` | Transaction construction |
| `@b0ase/crypto-utils` | Encryption (AES, ECIES) |
| `@b0ase/version-tree` | Document versioning |

### Storage Protocols
| Protocol | Use Case | Cost |
|----------|----------|------|
| B:// | Small documents (<100KB) | Cheapest |
| D:// | Searchable/indexed docs | + indexing fee |
| BCAT | Large documents (chunked) | Per-chunk |
| UHRP | Universal addressing | Standard |
| Bico.Media | CDN-backed retrieval | + CDN fee |

### Data Flow
```
[Write in Editor] → [Auto-save localStorage]
        ↓
[Click "Save to Blockchain"]
        ↓
[Choose: Protocol + Encryption + Monetization]
        ↓
[Calculate cost] → [HandCash payment]
        ↓
[Create transaction] → [Broadcast to BSV]
        ↓
[Return: txid, hash, explorer URL]
        ↓
[Add to Work Tree version chain]
```

### Key Integrations
- **Wallet**: HandCash (primary), MetaNet/BRC100 (secondary)
- **Payment**: HandCash micropayments
- **Auth**: HandCash OAuth → JWT session
- **Blockchain**: BSV mainnet
- **AI**: Gemini API for writing assistance

---

## 5. User Flows

### Primary Flow: Write and Save
1. User opens Bitcoin Writer
2. Starts typing in clean editor
3. Auto-saves to localStorage every 3-5 seconds
4. Clicks "Save to Blockchain"
5. Modal: Choose storage options
   - Protocol: Auto-detect or manual
   - Encryption: None / Password / Timelock
   - Monetization: NFT? Price? Royalty?
6. See cost estimate ($0.02)
7. Confirm → HandCash signs
8. Document saved, txid displayed
9. Version added to work tree

### Secondary Flow: Monetize as NFT
1. Writer has saved document
2. Opens "Tokenize" modal
3. Sets: Price ($5), Royalty (10%), Supply (100)
4. Creates NFT listing
5. Shares link
6. Buyers pay → writer receives 90%, platform 10%
7. Royalties on resales flow back

### Pay-Per-Read Flow
1. Writer saves with "Priced unlock"
2. Sets price ($0.50 to read)
3. Readers see preview/teaser
4. Pay $0.50 via MoneyButton
5. Content decrypted and revealed

---

## 6. Competitive Landscape

| Competitor | Their Approach | Our Differentiation |
|------------|----------------|---------------------|
| Medium | Centralized, can censor | We're immutable, writer owns |
| Substack | Email-based, 10% fee | Instant payments, 2.5% fee |
| Mirror.xyz | Ethereum, expensive gas | BSV = cheap, instant |
| Arweave | Permanent storage | We add monetization + versioning |
| Google Docs | Free but you're the product | Own your data, get paid |

---

## 7. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| BSV price volatility | High | Medium | Show costs in USD, budget caps |
| HandCash dependency | Medium | High | Abstract wallet layer |
| Content moderation | Medium | Medium | Encrypted by default, user responsibility |
| Piracy of paid content | Medium | Low | DRM options, social proof |
| Complex UX | Medium | High | Progressive disclosure, defaults |

---

## 8. Success Criteria

### Launch Criteria (MVP) ✅
- [x] Editor with formatting
- [x] Save to blockchain
- [x] HandCash login
- [x] Version tracking
- [x] Basic encryption
- [x] NFT creation

### 30-Day Goals
- [ ] 500 documents saved to chain
- [ ] 100 unique writers
- [ ] 10 NFTs sold
- [ ] $500 platform revenue

### 90-Day Goals
- [ ] 5,000 documents saved
- [ ] 1,000 writers
- [ ] Writer marketplace live
- [ ] Mobile PWA launched
- [ ] $5,000 monthly revenue

---

## 9. Open Questions

- [ ] Should auto-save go to chain or just localStorage?
- [ ] Optimal default encryption (none vs password)?
- [ ] How to handle very large documents (books)?
- [ ] Writer marketplace commission structure?
- [ ] Should $WRITER token launch with product or later?
- [ ] AGPL license implications for SaaS?

---

## 10. Appendix

### Related Documents
- [Exchange Pattern](EXCHANGE_PATTERN.md)
- Schematic: [To be created]
- Repo: `/Volumes/2026/Projects/bitcoin-writer`

### Key Files
| File | Purpose |
|------|---------|
| `app/page.tsx` | Main editor |
| `services/BlockchainDocumentService.ts` | Core orchestrator |
| `services/IntegratedWorkTreeService.ts` | Version control |
| `components/modals/SaveToBlockchainModal.tsx` | Save UI |

### Changelog
| Date | Change | Author |
|------|--------|--------|
| 2026-01-25 | Initial draft from investigation | Claude |
