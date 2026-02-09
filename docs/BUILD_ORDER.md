# Build Order Directive

> **Philosophy**: Build primitives first. Compose them into tools. Then apply uniformly to all stacks.

## The Five Portfolio Groups

Based on the Irrigation Model (see `/dividends`), b0ase organizes all work into five groups:

| Order | Group | Token | Purpose |
|-------|-------|-------|---------|
| 1 | **Primitives** | Atomic | Atomic building blocks - smallest units |
| 2 | **Tools** | Revenue | Utility layer - composed from primitives |
| 3 | **Bitcoin OS** | $bCorp | Operating system - core Bitcoin apps |
| 4 | **NPG Apps** | $NPG | Entertainment franchise |
| 5 | **Clients** | Client | Incubation pool - external projects |

## Build Order Rationale

### Why Primitives First?

Primitives are atomic units - the smallest functional pieces that can't be broken down further. Examples from `/tools`:

**Creation Primitives**:
- Video Gen, Video Studio, Chaos Mixer
- Graphic Designer, Button Creator
- Auto-Book, Course Maker

**Blockchain Primitives**:
- TX Broadcaster, BSV Scripts
- Registry, Mint, Cap Table
- Transfers, ID Tokeniser

**Infrastructure Primitives**:
- SCADA, ScrollPay, Money Buttons
- Dividends, KYC Verify

### Why Tools Second?

Tools are **compositions of primitives**. They combine atomic units into higher-order functionality:

- **Divvy** = Dividends primitive + Cap Table + Transfers
- **MoneyButton** = Mint + TX Broadcaster + Button Creator
- **Kintsugi** = Registry + Cap Table + Dividends + KYC

1. **Eliminate Duplicate Labor**: Build once, deploy everywhere. Every app gets the same battle-tested implementation.

2. **Batch Deployment**: Roll out across entire stacks in coordinated efforts.

3. **Quality Multiplier**: 10-hour investment in a shared primitive/tool saves 500+ hours.

4. **Consistency**: All apps share patterns, reducing cognitive load.

## Primitive Categories (from /tools)

### Creation Primitives
- **Video Gen** - AI video generation
- **Video Studio** - Video editing
- **Chaos Mixer** - Glitch effects
- **Graphic Designer** - OG images
- **Button Creator** - Button graphics
- **Auto-Book** - AI book outlines
- **Course Maker** - Video course production

### Blockchain Primitives
- **TX Broadcaster** - Raw transaction broadcast
- **BSV Scripts** - Complex transaction scripts
- **Registry** - Entity registration
- **Mint** - Token creation
- **Cap Table** - Ownership tracking
- **Transfers** - Token movement
- **ID Tokeniser** - Identity hashing

### Infrastructure Primitives
- **SCADA** - Industrial control
- **ScrollPay** - Pay-to-scroll
- **Money Buttons** - Payment widgets
- **Dividends** - Revenue distribution
- **KYC Verify** - Identity verification

## Tool Categories (composed from primitives)

### Infrastructure Tools
- **Divvy** - Revenue distribution engine (Dividends + Cap Table + Transfers)
- **BitCDN** - Decentralized content delivery
- **BitDNS** - Blockchain DNS resolution

### Development Tools
- **Repository Tokenization** - GitHub repo → BSV-20 token
- **Workflow Automation** - CI/CD pipelines

### Financial Tools
- **Kintsugi Invest** - Tokenized investment (Registry + Cap + Dividends + KYC)
- **CashHandle** - Handle-based payments
- **BSVEX** - Token exchange
- **Cashboard** - Financial dashboard

## Batch Deployment Process

### Phase 1: Primitive Development
```
[Primitive] → Development → Testing → Perfection
```

### Phase 2: Tool Composition
```
[Primitive A] + [Primitive B] + [Primitive C] → [Tool]
```

### Phase 3: Stack Integration
```
[Perfected Tool]
    ├── Bitcoin OS Apps (batch rollout)
    ├── NPG Apps (batch rollout)
    └── Client Projects (batch rollout)
```

### Phase 4: Maintenance
```
[Primitive Update] → Tools Update → Propagate to all stacks
```

## Example: Payment Integration

**Old Way (Duplicate Labor)**:
```
Bitcoin Corporation → Build payment system
Bitcoin Apps → Build payment system (again)
NPG → Build payment system (again)
Cherry Graf → Build payment system (again)
... repeat for 50+ apps
```

**New Way (Primitives → Tools → Stacks)**:
```
1. Perfect primitives: Mint, TX Broadcaster, Button Creator
2. Compose into MoneyButton tool
3. Deploy MoneyButton to ALL apps in single batch:
   - Bitcoin OS: 8 apps × 1 integration = 8 integrations
   - NPG Apps: 15 apps × 1 integration = 15 integrations
   - Clients: 30 apps × 1 integration = 30 integrations
```

**Result**: 3 primitives → 1 tool → 53 apps. 95% labor reduction.

## Pipeline Roadmaps

When planning development sprints:

1. **Identify Common Needs**: What do multiple apps need?
2. **Build as Tool**: Create shared, reusable implementation
3. **Batch Schedule**: Plan coordinated rollout to stacks
4. **Document Integration**: Create guides for tool usage

## Tool Readiness Checklist

Before deploying a tool to stacks:

- [ ] Core functionality complete
- [ ] Error handling robust
- [ ] Documentation written
- [ ] API stable (breaking changes resolved)
- [ ] Security audit passed
- [ ] Performance tested at scale
- [ ] Integration examples ready

## Stack Priority

When deploying tools to stacks, prioritize by revenue impact:

1. **Bitcoin OS** - Core infrastructure, highest priority
2. **NPG Apps** - Entertainment revenue, high priority
3. **Clients** - Growth pool, medium priority

## Tracking Deployment

### Primitive Status

| Primitive | Status | Used By Tools |
|-----------|--------|---------------|
| TX Broadcaster | ✅ Ready | MoneyButton, Divvy |
| Mint | ✅ Ready | MoneyButton, Kintsugi |
| Cap Table | ✅ Ready | Divvy, Kintsugi |
| Dividends | ✅ Ready | Divvy, Kintsugi |
| Registry | ✅ Ready | Kintsugi |
| Video Gen | ⏳ Building | Course Maker |
| SCADA | ⏳ Building | - |

### Tool Deployment Matrix

| Tool | Bitcoin OS | NPG Apps | Clients | Status |
|------|------------|----------|---------|--------|
| Divvy | ✅ | ✅ | ⏳ | Active |
| MoneyButton | ✅ | ⏳ | ⏳ | Rolling out |
| Kintsugi | ✅ | ⏳ | ⏳ | Rolling out |
| BitCDN | ⏳ | ⏳ | ⏳ | In development |

## Related Documentation

- [Irrigation Model](/dividends) - Revenue flow architecture
- [Portfolio](/portfolio) - All projects overview
- [Agent System](docs/AGENTS_QUICK_START.md) - Autonomous agents

---

**Last Updated**: 2026-01-25
**Maintained By**: b0ase team
