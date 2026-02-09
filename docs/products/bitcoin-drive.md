# Bitcoin Drive - Product Requirements Document

> **Status**: Draft
> **Owner**: Richard
> **Last Updated**: 2026-01-25
> **Token**: $DRIVE (planned)
> **Repo**: /Volumes/2026/Projects/bitcoin-drive
> **Architecture**: Follows [Exchange Pattern](EXCHANGE_PATTERN.md)

---

## 1. Executive Summary

**One-liner**: Your files, your blockchain, forever.

**Problem**: Cloud storage providers own your data. They can access it, lose it, or shut down. Sharing requires trusting centralized platforms. Monetizing files (selling, licensing) is fragmented.

**Solution**: A familiar Drive interface where files are stored with blockchain-verified ownership. Hybrid storage (metadata on-chain, content flexible) keeps costs low while providing cryptographic proof. Any file can become a tradeable NFT.

**Target User**:
- Primary: Crypto users who want sovereign file storage
- Secondary: Creators selling digital assets (art, music, templates)
- Tertiary: Businesses needing tamper-proof document archives

---

## 2. Business Model

### Revenue Streams
| Stream | Description | Pricing |
|--------|-------------|---------|
| Storage Fees | On-chain storage markup | ~$0.001/KB |
| NFT Commission | Fee on file NFT sales | 2.5% |
| Premium Storage | Faster retrieval, redundancy | Subscription |
| Enterprise | Team features, compliance | Custom |

### Token Economics (Planned)
- **Token**: $DRIVE
- **Supply**: TBD (follows bonding curve)
- **Utility**:
  - Hold → receive share of storage fees
  - Spend → discounted storage, premium features
  - Stake → increased storage allocation
- **Dividend Flow**: Storage fees → Cashboard → 30% to $DRIVE holders

### Key Metrics
- **North Star**: Total Storage Volume (TB)
- **Secondary**:
  - Monthly Active Users
  - Files uploaded per day
  - NFT sales volume
  - Storage cost per user

---

## 3. Core Features

### MVP (Partial - ~50% Complete)

1. **File Upload Interface**
   - User story: As a user, I want to drag-and-drop files to upload
   - Implementation: Modern upload modal with progress
   - Status: ✅ UI Complete, ⚠️ Backend partial

2. **Storage Method Selection**
   - User story: As a user, I want to choose how my file is stored
   - Options:
     - Full On-Chain (OP_PUSHDATA4): Permanent, expensive
     - Hybrid (Metadata on-chain, content off-chain): Balanced
     - Hash+Cloud (Hash on-chain, file on Google Drive): Cheapest
   - Status: ✅ UI Complete, ⚠️ Backend partial

3. **Google Drive Integration**
   - User story: As a user, I want to connect my existing Drive
   - Implementation: OAuth sync, browse, tokenize existing files
   - Status: ✅ Complete

4. **File Browser**
   - User story: As a user, I want to view and manage my files
   - Implementation: Grid/list views, search, preview
   - Status: ✅ UI Complete

5. **NFT Tokenization**
   - User story: As a creator, I want to sell my files as NFTs
   - Implementation: Set price, royalty, supply cap
   - Status: ⚠️ UI Complete, Backend pending

### Phase 2 (Planned)
- [ ] Folder management (create, move, rename)
- [ ] File sharing with permissions
- [ ] DropBlocks integration (fully decentralized)
- [ ] Encryption (client-side, end-to-end)
- [ ] Mobile app

### Future
- [ ] Team workspaces
- [ ] Version history
- [ ] Real-time collaboration
- [ ] IPFS backend option
- [ ] Enterprise compliance (GDPR, HIPAA)

---

## 4. Technical Architecture

### Primitives Used
| Package | Purpose |
|---------|---------|
| `@b0ase/handcash` | Wallet auth and payments |
| `@b0ase/inscription-service` | On-chain file storage |
| `@b0ase/storage-adapter` | Unified storage interface |
| `@b0ase/crypto-utils` | File encryption |
| `@b0ase/nft-minting-modal` | NFT creation flow |

### Storage Architecture
```
┌─────────────────────────────────────────────────────────┐
│                    FILE UPLOAD                           │
└──────────────────────┬──────────────────────────────────┘
                       │
         ┌─────────────┼─────────────┐
         ▼             ▼             ▼
    FULL ON-CHAIN   HYBRID      HASH+CLOUD
    (expensive)    (balanced)    (cheap)
         │             │             │
         ▼             ▼             ▼
    OP_PUSHDATA4   Metadata +    SHA-256 hash
    (full file)    Reference     on chain
         │             │             │
         │             ▼             ▼
         │        Cloud/IPFS    Google Drive
         │        (content)     (full file)
         │             │             │
         └─────────────┼─────────────┘
                       │
              Blockchain Record
              (proof of ownership)
```

### Database Schema (Prisma)
```
User {
  id
  email
  handcashHandle
  googleDriveToken
  storageUsed
  storageLimit
}

File {
  id
  userId
  name
  mimeType
  size
  storageMethod  // 'on-chain' | 'hybrid' | 'hash-only'
  blockchainTxid
  contentHash
  cloudReference
  isNFT
  nftPrice
  createdAt
}
```

### Key Integrations
- **Wallet**: HandCash (primary)
- **Cloud**: Google Drive (OAuth)
- **Blockchain**: BSV mainnet
- **Decentralized**: DropBlocks protocol (planned)

---

## 5. User Flows

### Primary Flow: Upload File
1. User logs in (Google OAuth or HandCash)
2. Drags file to upload zone
3. Modal opens: Choose storage method
   - Full On-Chain: $0.50 (50KB file)
   - Hybrid: $0.05
   - Hash+Cloud: $0.01
4. User selects Hybrid
5. Confirms → HandCash payment
6. File uploaded, metadata on chain
7. Appears in file browser with blockchain icon

### Secondary Flow: Tokenize as NFT
1. User selects existing file
2. Clicks "Tokenize"
3. Sets: Price ($10), Royalty (5%), Editions (50)
4. Creates NFT listing
5. Shares marketplace link
6. Buyers purchase → receive file access
7. Royalties on resales

### Google Drive Sync Flow
1. User connects Google Drive
2. Sees list of Drive files
3. Selects files to "protect"
4. System stores hash on blockchain
5. Original stays in Drive
6. User now has proof of ownership

---

## 6. Competitive Landscape

| Competitor | Their Approach | Our Differentiation |
|------------|----------------|---------------------|
| Google Drive | Centralized, free tier | We're verifiable, ownable |
| Dropbox | Centralized, subscription | Blockchain proof, NFT option |
| IPFS/Filecoin | Fully decentralized | Easier UX, hybrid flexibility |
| Arweave | Permanent storage | Cheaper via hybrid, BSV native |
| NFT.Storage | Free NFT storage | Monetization built-in |

---

## 7. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| On-chain costs prohibitive | High | High | Default to hybrid, show costs clearly |
| Google Drive dependency | Medium | Medium | Multiple cloud backends |
| File size limits | High | Medium | Chunking, compression, tier limits |
| Piracy after NFT purchase | Medium | Low | Watermarking, legal terms |
| Complex storage options | Medium | High | Smart defaults, progressive disclosure |

---

## 8. Success Criteria

### Launch Criteria (MVP)
- [ ] Upload to hybrid storage working
- [ ] Google Drive sync working
- [ ] File browser functional
- [ ] HandCash authentication
- [ ] Basic NFT tokenization

### 30-Day Goals
- [ ] 1,000 files uploaded
- [ ] 200 unique users
- [ ] 10GB total storage
- [ ] 5 NFT sales

### 90-Day Goals
- [ ] 10,000 files
- [ ] 2,000 users
- [ ] 100GB storage
- [ ] Folder management live
- [ ] Mobile PWA launched

---

## 9. Open Questions

- [ ] What's the max file size for on-chain storage?
- [ ] Should encryption be default or opt-in?
- [ ] How to handle file deletion (blockchain is immutable)?
- [ ] DropBlocks vs IPFS for decentralized layer?
- [ ] Free tier limits (storage, bandwidth)?
- [ ] How to sync deletions with Google Drive?

---

## 10. Appendix

### Related Documents
- [Exchange Pattern](EXCHANGE_PATTERN.md)
- Schematic: [To be created]
- Repo: `/Volumes/2026/Projects/bitcoin-drive`

### Key Files
| File | Purpose |
|------|---------|
| `src/app/page.tsx` | Main Drive interface |
| `src/components/BlockchainUploadModal.tsx` | Upload flow |
| `src/lib/bsv-integration.ts` | Blockchain ops |
| `src/lib/hybrid-storage.ts` | Storage abstraction |

### Implementation Status
| Feature | UI | Backend | Status |
|---------|-----|---------|--------|
| File upload | ✅ | ⚠️ | 60% |
| Google Drive sync | ✅ | ✅ | 90% |
| Storage selection | ✅ | ⚠️ | 50% |
| NFT tokenization | ✅ | ❌ | 30% |
| Folder management | ⚠️ | ❌ | 20% |
| File sharing | ❌ | ❌ | 0% |

### Changelog
| Date | Change | Author |
|------|--------|--------|
| 2026-01-25 | Initial draft from investigation | Claude |
