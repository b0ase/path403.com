# Bitcoin Spreadsheet - Product Requirements Document

> **Status**: Draft
> **Owner**: Richard
> **Last Updated**: 2026-01-25
> **Token**: $SHEET (planned)
> **Repo**: /Volumes/2026/Projects/bitcoin-spreadsheet
> **Architecture**: Follows [Exchange Pattern](EXCHANGE_PATTERN.md)

---

## 1. Executive Summary

**One-liner**: Spreadsheets you own, on the blockchain.

**Problem**: Business-critical data lives in Google Sheets or Excel—platforms you don't control. No cryptographic proof of data integrity. Sharing requires trusting centralized services. Monetizing spreadsheet templates is fragmented.

**Solution**: A familiar spreadsheet interface where every save creates a blockchain record. Data is encrypted client-side, owned by the user, and can be tokenized for sale. Cell-level Bitcoin addresses enable novel use cases (pay-per-cell, crowdsourced data).

**Target User**:
- Primary: Crypto-native businesses needing auditable records
- Secondary: Template creators selling spreadsheets
- Tertiary: Data collectors wanting verifiable datasets

---

## 2. Business Model

### Revenue Streams
| Stream | Description | Pricing |
|--------|-------------|---------|
| Storage Fees | Per-spreadsheet save to chain | $0.01/save (capped) |
| Template Sales | Commission on spreadsheet NFTs | 5% |
| Premium Features | Formulas, collaboration, large sheets | Subscription |
| Enterprise | Audit trails, compliance, API | Custom |

### Token Economics (Planned)
- **Token**: $SHEET
- **Supply**: TBD (follows bonding curve)
- **Utility**:
  - Hold → receive share of storage fees
  - Spend → unlock premium features
  - Stake → governance over formula library
- **Dividend Flow**: Save fees → Cashboard → 30% to $SHEET holders

### Key Metrics
- **North Star**: Spreadsheets Saved to Chain
- **Secondary**:
  - Monthly Active Users
  - Cells edited per day
  - Template NFT sales
  - Premium conversion rate

---

## 3. Core Features

### MVP (Exists - ~20% Complete)

1. **Spreadsheet Grid**
   - User story: As a user, I want a familiar spreadsheet interface
   - Implementation: 100 rows × 26 columns (A-Z)
   - Status: ✅ Basic grid works

2. **Cell Editing**
   - User story: As a user, I want to edit cells with keyboard shortcuts
   - Implementation: Arrow keys, Ctrl+C/V, Delete, Enter
   - Status: ✅ Complete

3. **HandCash Authentication**
   - User story: As a user, I want to login with my wallet
   - Implementation: OAuth flow
   - Status: ✅ Complete

4. **Client-Side Encryption**
   - User story: As a user, I want my data encrypted before storage
   - Implementation: AES-256 encryption
   - Status: ✅ Complete

5. **Save to Blockchain**
   - User story: As a user, I want to save my spreadsheet permanently
   - Implementation: Transaction preparation (broadcast not working)
   - Status: ⚠️ Partial (localStorage only, chain broadcast pending)

### Phase 2 (Planned - Q1-Q2 2025)
- [ ] Formula engine (SUM, AVERAGE, IF, VLOOKUP, etc.)
- [ ] Cell formatting (bold, colors, borders)
- [ ] Import/Export (Excel, CSV)
- [ ] Charts (line, bar, pie)
- [ ] Real-time collaboration

### Future (Q3-Q4 2025)
- [ ] 400+ Excel-compatible formulas
- [ ] 1M+ row support (virtual scrolling)
- [ ] Pivot tables
- [ ] Macros/scripting
- [ ] Mobile apps
- [ ] Enterprise features

---

## 4. Technical Architecture

### Primitives Used
| Package | Purpose |
|---------|---------|
| `@b0ase/handcash` | Wallet auth and payments |
| `@b0ase/crypto-utils` | AES-256 cell encryption |
| `@b0ase/tx-builder` | Transaction construction |
| `@b0ase/inscription-service` | On-chain storage |
| `@b0ase/validation` | Formula parsing |

### Cell Storage Model
```
Spreadsheet {
  id: string
  title: string
  cells: {
    "A1": { value: "Hello", type: "string", encrypted: true },
    "B1": { value: 42, type: "number", encrypted: true },
    "C1": { value: "=SUM(A1:B1)", type: "formula", encrypted: true }
  }
  metadata: {
    author: handcashHandle,
    created: timestamp,
    version: number
  }
}
```

### Per-Cell Addresses (Optional Feature)
```
Each cell can have its own Bitcoin address:
- Path: m/44'/236'/0'/row'/col'
- Example: A1 = m/44'/236'/0'/0'/0'
- Use case: Crowdsourced data (pay to fill cell)
- Use case: Cell-level access control
```

### Data Flow
```
[Edit Cell] → [Update local state]
      ↓
[Auto-save to localStorage]
      ↓
[Click "Save to Blockchain"]
      ↓
[Encrypt all cells with AES-256]
      ↓
[Build OP_RETURN transaction]
      ↓
[HandCash signs + broadcasts]
      ↓
[Store txid, update version]
```

### Planned Formula Engine
Recommended: **HyperFormula** (GPL v3) or **Luckysheet** (MIT)

| Category | Functions |
|----------|-----------|
| Math | SUM, AVERAGE, MIN, MAX, ROUND, ABS |
| Logic | IF, AND, OR, NOT, IFS, SWITCH |
| Lookup | VLOOKUP, HLOOKUP, INDEX, MATCH |
| Text | CONCAT, LEFT, RIGHT, LEN, TRIM |
| Date | TODAY, NOW, DATEADD, DATEDIFF |
| Financial | NPV, IRR, PMT, FV, PV |

---

## 5. User Flows

### Primary Flow: Create and Save
1. User logs in with HandCash
2. Sees empty 100×26 grid
3. Types in cells, uses arrow keys to navigate
4. Clicks "Save"
5. Choose storage option:
   - Quick Save: $0.01 (encrypted, on-chain)
   - Local Only: Free (localStorage, not permanent)
6. HandCash confirms payment
7. Spreadsheet saved with txid
8. Can reload from any device

### Secondary Flow: Sell Template
1. User creates useful spreadsheet (budget template)
2. Clicks "Tokenize"
3. Sets: Price ($5), Royalty (10%)
4. Creates NFT listing
5. Buyer purchases → receives copy
6. Original creator gets royalties on resales

### Collaboration Flow (Future)
1. Owner shares spreadsheet link
2. Collaborator opens with their HandCash
3. Real-time cursors visible
4. Changes sync via WebSocket
5. Each save creates new blockchain version
6. Full version history available

---

## 6. Competitive Landscape

| Competitor | Their Approach | Our Differentiation |
|------------|----------------|---------------------|
| Google Sheets | Free, centralized | We're owned, verifiable |
| Excel | Desktop, expensive | Blockchain-native, cheaper |
| Airtable | Database-spreadsheet hybrid | Simpler, Bitcoin-native |
| Notion | All-in-one workspace | Focused, auditable |
| Rows.com | Modern spreadsheet | Own your data |

---

## 7. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Formula engine complexity | High | High | Use proven library (HyperFormula) |
| Blockchain save latency | High | Medium | Async save, optimistic UI |
| Large spreadsheet costs | High | High | Compression, size limits, tiers |
| Excel compatibility | Medium | Medium | Progressive feature parity |
| Real-time sync complexity | High | High | Start single-user, add collab later |

---

## 8. Success Criteria

### Launch Criteria (MVP)
- [ ] Grid editing works smoothly
- [ ] Basic formulas (SUM, AVERAGE, IF)
- [ ] Save to blockchain functional
- [ ] HandCash auth complete
- [ ] Import/Export CSV

### 30-Day Goals
- [ ] 500 spreadsheets saved
- [ ] 100 unique users
- [ ] 10 formula types working
- [ ] Mobile-responsive

### 90-Day Goals
- [ ] 5,000 spreadsheets
- [ ] 1,000 users
- [ ] 50+ formulas
- [ ] Charts working
- [ ] Template marketplace live

---

## 9. Open Questions

- [ ] HyperFormula (GPL) vs Luckysheet (MIT) licensing implications?
- [ ] How to handle very large spreadsheets (>10MB)?
- [ ] Should formulas execute on-chain or client-only?
- [ ] Per-cell addresses: cool feature or complexity?
- [ ] How to price storage (per cell vs per sheet)?
- [ ] Real-time collab architecture (CRDT vs OT)?

---

## 10. Appendix

### Related Documents
- [Exchange Pattern](EXCHANGE_PATTERN.md)
- Schematic: [To be created]
- Repo: `/Volumes/2026/Projects/bitcoin-spreadsheet`
- Existing PRD: `/docs/PRD.md` in repo

### Key Files
| File | Purpose |
|------|---------|
| `app/spreadsheet/[id]/page.tsx` | Main editor |
| `services/BitcoinService.ts` | Core app logic |
| `services/BSVService.ts` | Blockchain integration |
| `components/Spreadsheet.tsx` | Grid component |

### Implementation Status
| Feature | Status | Notes |
|---------|--------|-------|
| Grid UI | ✅ 90% | Works but limited to 100×26 |
| Cell editing | ✅ 80% | Keyboard shortcuts work |
| HandCash auth | ✅ 90% | OAuth complete |
| Encryption | ✅ 80% | AES-256 working |
| Blockchain save | ⚠️ 30% | Tx prep works, broadcast pending |
| Formulas | ⚠️ 10% | Pattern detection only |
| Formatting | ❌ 0% | Not started |
| Charts | ❌ 0% | Library included, not integrated |
| Collaboration | ❌ 0% | Not started |

### Roadmap (from repo docs)
| Quarter | Focus |
|---------|-------|
| Q1 2025 | Core editing, blockchain saves, basic formulas |
| Q2 2025 | Advanced formulas, formatting, charts |
| Q3 2025 | Collaboration, mobile apps |
| Q4 2025 | Enterprise, API, marketplace |

### Changelog
| Date | Change | Author |
|------|--------|--------|
| 2026-01-25 | Initial draft from investigation | Claude |
