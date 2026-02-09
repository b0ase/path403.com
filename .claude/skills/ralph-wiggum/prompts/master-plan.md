# Ralph's Master Plan - Investigation Loop

You are in **investigation mode**, not coding mode. Your job is to explore, question, connect, and document.

## Context: What We Know

**The Irrigation Model**: Revenue flows upward like water through channels:
- MoneyButton (THE primitive) triggers payments
- Payments flow through Cashboard rules
- Rules cascade: dividends → stakeholders → more rules
- Everything irrigates upward to $BOASE holders

**The Five Columns** (left to right = build order):
1. **Primitives** (emerald) - Atomic units, build these FIRST
2. **Tools** (gray) - Compositions of primitives
3. **Bitcoin OS** (orange) - Core Bitcoin apps ($bCorp)
4. **NPG Apps** (pink) - Entertainment franchise ($NPG)
5. **Clients** (cyan) - Incubation pool

**Key Insight**: MoneyButton is THE primitive - the trigger for all payments. Every website has a token. Tokens are both shares AND auth tokens. Bitcoin is plumbing. Dividends are irrigation.

**Cashboard** (bitcoin-corp-website/app/cashboard) is the HUB - it shows how Richard thinks about money flowing. Conditional payments, cascading automations, self-running business logic.

**Your Mission**: Build an LLM matrix that models Richard's creative brain. Not just "what files exist" but "how does this all connect?" and "where is this going?"

## Your Mission

Build a coherent Master Plan Document that maps the b0ase ecosystem:
- **Primitives** → atomic building blocks (from /tools page)
- **Tools** → compositions of primitives (from portfolio)
- **Stacks** → where tools deploy (Bitcoin OS, NPG Apps, Clients)

## Each Iteration

1. **EXPLORE**: Read files, understand what exists
2. **QUESTION**: "How does X connect to Y?" "What's missing?"
3. **CONNECT**: Map relationships between components
4. **DOCUMENT**: Update the Master Plan
5. **VALIDATE**: "Does this make sense?" If not, revise.

## Files to Explore

### b0ase.com (main repo: /Volumes/2026/Projects/b0ase.com)
- `/app/tools/page.tsx` - Lists all 19 primitives
- `/app/tools/*/page.tsx` - Individual primitive implementations
- `/app/dividends/page.tsx` - The irrigation model visualization
- `/components/boase/IrrigationFlow.tsx` - Five column categorization
- `/lib/data.ts` - Portfolio data (~164 projects)
- `/docs/BUILD_ORDER.md` - Build philosophy
- `/docs/MASTER_PLAN.md` - This document (update it!)

### External Projects (/Volumes/2026/Projects/)
~130 repos. Key ones to explore:
- `/bitcoin-corp-website/` - Bitcoin Corporation site
- `/bitcoin-corp-website/app/cashboard/page.tsx` - **THE HUB** - Cashboard
- `/Bitcoin-OS/` - The operating system
- `/ninja-punk-girls-com/` - NPG franchise
- `/AI-VJ/` - AIVJ project
- `/zerodice/` - Zero Dice
- `/Penshun/` - BitPension
- `/audex/` - Audex

### Questions for Each Primitive
- Is it functional or placeholder?
- What does it actually do (read the code)?
- Which tools use this primitive?
- Is there duplicate code elsewhere?

### Questions for Each Tool
- Which primitives compose it?
- Is the composition explicit (imports) or assumed?
- Where is it deployed (which stacks)?
- What's blocking broader deployment?

### Questions for Cashboard
- How do payment rules cascade?
- What primitives power each feature?
- How does it connect to other tools?
- Is this the "brain" of the ecosystem?

## Output Format

Update this document each iteration:

```
docs/MASTER_PLAN.md
```

Structure:
1. **Primitive Inventory** - What we have, what each does
2. **Composition Map** - How primitives combine into tools
3. **Deployment Matrix** - Where tools are deployed
4. **Gap Analysis** - What's missing
5. **Build Sequence** - Optimal order to build/perfect
6. **Open Questions** - Things that don't make sense yet

## Validation Questions

Ask yourself each iteration:
- Does this primitive actually work standalone?
- Is this tool actually using these primitives, or is it monolithic?
- Why isn't tool X deployed to stack Y yet? Blocker?
- Is there duplicate functionality between A and B?
- What's the minimal path to get primitive P working everywhere?

## Completion Signal

When you have:
- [ ] Inventoried all primitives with their actual functionality
- [ ] Mapped all tool compositions
- [ ] Identified all deployment gaps
- [ ] Proposed a logical build sequence
- [ ] Resolved major open questions

Output: <promise>MASTER_PLAN_COMPLETE</promise>

## Remember

- NO CODING. Investigation only.
- Read files, don't edit them.
- Question everything. "Richard built this... why? How does it connect?"
- Sequential logic. Each step must follow from the previous.
- It's okay to be wrong. Document uncertainty. Iterate.

---

**Current Iteration**: [Ralph will track]
**Last Updated**: [Ralph will track]
**Confidence Level**: [Low/Medium/High]
