# Product PRD Index

> Master list of all products requiring PRDs, prioritized by strategic importance.

---

## Priority Tiers

### Tier 1: Core Infrastructure (Write First)
These power everything else. Understanding these unlocks the rest.

| Product | Token | Repo | PRD Status | Schematic |
|---------|-------|------|------------|-----------|
| **Cashboard** | - | bitcoin-corp-website | 🟢 [Done](cashboard.md) | 🟢 [Infrastructure Flow](/schematics/infrastructure-flow) |
| **Bitcoin Exchange** | $bCorp | bitcoin-exchange | ⬜ Todo | 🟢 [3D Exchange](/schematics/bitcoin-exchange) |
| **MoneyButton** | $MONEYBUTTON | moneybutton2 | 🟢 [Done](moneybutton.md) | 🟢 [Infrastructure Flow](/schematics/infrastructure-flow) |
| **Divvy** (Dividends) | - | divvy | 🟢 [Done](divvy.md) | 🟢 [Infrastructure Flow](/schematics/infrastructure-flow) |
| **Bitcoin Wallet** | - | bitcoin-wallet | ⬜ Todo | ⬜ Todo |

### Tier 2: Bitcoin OS Apps (The $bCorp Stack)
Core apps that run on Bitcoin OS infrastructure.

| Product | Token | Repo | PRD Status | Schematic |
|---------|-------|------|------------|-----------|
| **Bitcoin Writer** | $WRITER | bitcoin-writer | 🟢 [Done](bitcoin-writer.md) | 🟡 [Exchange Pattern](/schematics/exchange-pattern) |
| **Bitcoin Drive** | $DRIVE | bitcoin-drive | 🟢 [Done](bitcoin-drive.md) | 🟡 [Exchange Pattern](/schematics/exchange-pattern) |
| **Bitcoin Chat** | - | bitcoin-chat | ⬜ Todo | ⬜ Todo |
| **Bitcoin Spreadsheet** | $SHEET | bitcoin-spreadsheet | 🟢 [Done](bitcoin-spreadsheet.md) | 🟡 [Exchange Pattern](/schematics/exchange-pattern) |
| **Senseii** (AI Assistant) | - | senseii | ⬜ Todo | ⬜ Todo |
| **BitPension** | - | Penshun | ⬜ Todo | ⬜ Todo |

### Tier 3: NPG Entertainment ($NPG Stack)
Entertainment and gaming products under Ninja Punk Girls.

| Product | Token | Repo | PRD Status | Schematic |
|---------|-------|------|------------|-----------|
| **Ninja Punk Girls** | $NPG | ninja-punk-girls-com | ⬜ Todo | ⬜ Todo |
| **AI Girlfriends** | $AIGF | aigirlfriends-website | ⬜ Todo | ⬜ Todo |
| **Zero Dice** | - | zerodice | ⬜ Todo | ⬜ Todo |
| **Audex** | - | audex | ⬜ Todo | ⬜ Todo |
| **AI VJ** | - | AI-VJ | ⬜ Todo | ⬜ Todo |
| **OneShot Comics** | - | oneshotcomics | ⬜ Todo | ⬜ Todo |

### Tier 4: Tools & Utilities
Supporting tools and developer infrastructure.

| Product | Token | Repo | PRD Status | Schematic |
|---------|-------|------|------------|-----------|
| **BSV API** | - | bsvapi-com | ⬜ Todo | ⬜ Todo |
| **Tokeniser** | - | tokeniser | ⬜ Todo | ⬜ Todo |
| **Metagraph** | - | metagraph-app | ⬜ Todo | ⬜ Todo |
| **BitCDN** | - | bitcdn | ⬜ Todo | ⬜ Todo |
| **BitDNS** | - | bitdns | ⬜ Todo | ⬜ Todo |

### Tier 5: Client/Venture Products
Incubated projects and client work.

| Product | Token | Repo | PRD Status | Schematic |
|---------|-------|------|------------|-----------|
| **Libertas Coffee** | - | libertascoffee-store | ⬜ Todo | ⬜ Todo |
| **CourseKings** | - | coursekings-website | ⬜ Todo | ⬜ Todo |
| **VexVoid** | - | vexvoid-com | ⬜ Todo | ⬜ Todo |
| **Beauty Queen AI** | - | beauty-queen-ai-com | ⬜ Todo | ⬜ Todo |
| **Minecraft Party** | - | minecraftparty-website | ⬜ Todo | ⬜ Todo |

---

## Core Infrastructure (Completed)

The foundational layer is now documented:

1. ✅ **MoneyButton** - [PRD](moneybutton.md) - The trigger layer
2. ✅ **Cashboard** - [PRD](cashboard.md) - The coordination layer
3. ✅ **Divvy** - [PRD](divvy.md) - The distribution layer
4. ✅ **Exchange Pattern** - [Pattern Doc](EXCHANGE_PATTERN.md) - The universal backend

These 4 documents reveal 80% of the ecosystem logic. All other apps follow the Exchange Pattern.

---

## PRD Workflow

1. **Investigation** → Read repo, understand what exists
2. **Draft PRD** → Fill template with findings
3. **Identify Primitives** → Map which `@b0ase/*` packages it uses/needs
4. **Create Schematic** → Visual architecture from PRD
5. **Update Index** → Mark as complete

---

## Status Legend

- ⬜ Todo
- 🟡 In Progress
- 🟢 Complete
- 🔴 Blocked

---

*Last Updated: 2026-01-25*
