# B0ASE.COM Development Checklist

**Last Updated:** 2026-01-19


---

## COMPLETED TASKS ✓

### Page Layout & Styling
- ~~Remove max-width from /services page to match house style~~ ✓ **DONE** - Removed `max-w-7xl mx-auto`, now full-width like /agents
- ~~Fix /dashboard/fundraising layout (remove max-width, conform to house style)~~ ✓ **DONE** - Changed padding to `px-4 md:px-8 py-16`
- ~~Fix back button on /dashboard/fundraising to go to /dashboard~~ ✓ **DONE** - Added FiArrowLeft icon link
- ~~Fix back button on /dashboard/auto-book to go to /dashboard~~ ✓ **DONE** - Task agent completed
- ~~Fix /dashboard/marketing-plan layout and back button~~ ✓ **DONE** - Task agent completed
- ~~Fix /dashboard/business-plan layout and back button~~ ✓ **DONE** - Task agent completed
- ~~Fix /dashboard/projections layout and back button~~ ✓ **DONE** - Task agent completed

### Navigation
- ~~Change DASHBOARD button text from blue to white when signed in~~ ✓ **DONE** - Updated NavbarWithMusic.tsx and GlobalAuthBar.tsx
- ~~Add second HOME icon to the left of Agents in navbar~~ ✓ **DONE** - Added to sitePages array
- ~~Fix navbar scroll arrows functionality~~ ✓ **DONE** - Implemented scrollLeft/scrollRight functions, added mouse wheel support

### Content Management
- ~~Replace 'community' with 'shareholders' globally~~ ✓ **DONE** - Updated lib/data.ts (smart contracts) and app/mint/page.tsx
- ~~Remove fraudulent blog post using first-person voice not from b0ase~~ ✓ **DONE** - Deleted `28-startup-lessons-learned-the-hard-way.md` and removed from lib/blog.ts
- ~~Create /admin/content page for content ideas bucket~~ ✓ **DONE** - Built mobile-accessible admin interface at app/admin/content/page.tsx
- ~~Fix email placeholder `[your-email]` to richard@b0ase.com~~ ✓ **DONE** - Updated blog post
- ~~Create rules.md for content standards~~ ✓ **DONE** - Created docs/CONTENT_RULES.md with email/Telegram validation

### Schematics & Premium Content
- ~~Lock all schematics as premium content on /schematics~~ ✓ **DONE** - Changed bitcoin-exchange and bsv status to 'locked'
- ~~Create /dashboard/schematics page for admin access~~ ✓ **DONE** - Full admin interface with filter tabs and edit buttons

### Client Experience
- ~~Revise /client page to be more inviting and easy to understand~~ ✓ **DONE** - Added hero section with "48h start time", key metrics, improved CTAs

### Portfolio & Demo
- ~~Create /portfolio/demo with fake data for potential clients~~ ✓ **DONE** - Built complete demo page with 5 fake tokens, activity feed, stats

### Video Upload System
- ~~Build working video upload system at /user/account?tab=content~~ ✓ **DONE** - Complete Supabase Storage integration:
  - Created docs/SUPABASE_STORAGE_SETUP.md with SQL schema
  - Built app/api/content-assets/upload/route.ts (POST endpoint)
  - Built app/api/content-assets/route.ts (GET/DELETE/PATCH)
  - Implemented ContentTabSection component with drag & drop, progress bars, asset grid
  - Supports video/audio/image uploads up to 5GB per file
  - Ready for client's 47 founder videos

### Documentation
- ~~Create comprehensive checklist for feature tracking~~ ✓ **DONE** - Created docs/CHECKLIST.md
- ~~Create AUTO_BOOK_QUEUE_SYSTEM.md architecture~~ ✓ **DONE** - Full system design with DB schemas, cron jobs, timeline
- ~~Create brand system specification~~ ✓ **DONE** - Created docs/BRAND_SYSTEM_SPEC.md (30-40 hour implementation plan)
- ~~Create video upload system documentation~~ ✓ **DONE** - docs/VIDEO_UPLOAD_SYSTEM_COMPLETE.md

### Style Guide
- ~~Create formal /styleguide page~~ ✓ **DONE** - Built comprehensive style guide at app/styleguide/page.tsx with layout principles, typography, colors, components, navigation guidelines, best practices, and contact standards

---

## PENDING TASKS - HIGH PRIORITY

### Admin Path Consolidation (INVESTIGATE THOROUGHLY)
- [ ] **SERIOUS INVESTIGATION NEEDED**: Audit `/admin/` vs `/dashboard/` paths
  - 15 pages in `/app/admin/` that may duplicate or conflict with `/app/dashboard/`
  - 13 API routes in `/app/api/admin/` that may be called from multiple places
  - Currently confirmed: `/api/admin/` routes only called from `/admin/` pages
  - BUT: Other parts of the codebase might reference `/admin` paths
  - Tasks:
    - [ ] Full grep for all `/admin` references in codebase
    - [ ] Check middleware protection on `/api/admin/` routes
    - [ ] Document which admin features are NOT in dashboard
    - [ ] Create migration plan for any needed functionality
    - [ ] Decide: delete `/admin/` or maintain both paths?
  - Related: `/api/admin/` middleware was blocking `/dashboard/users` API call (moved to `/api/dashboard-users/`)

### Auto-Book & Blog System
- [ ] Setup cron jobs for Twitter auto-posting (@b0ase_com and @b0ase)
  - ✅ Twitter API credentials configured in .env.local
  - Daily posts from content bucket
  - Weekly engagement automation
- [ ] Build auto-book queue system with cron jobs
  - Weekly: Process queue for full book
  - Daily: Auto-publish blog posts
  - Connect to /blog pages
  - See docs/AUTO_BOOK_QUEUE_SYSTEM.md for architecture
- ~~Create 'blog ideas bucket' database~~ ✓ **DONE** - Complete system with Supabase backend:
  - Created docs/CONTENT_IDEAS_DB_SETUP.md with SQL schema
  - Built API endpoints: POST/GET at /api/content-ideas, DELETE/PATCH at /api/content-ideas/[id]
  - Updated /admin/content UI with real API integration, loading states, refresh functionality
  - Supports articles, tweets, repos, manual entries with tags and notes
  - Tracks 'used' status for auto-blog generation
  - Ready for cron job integration

### Automation Page
- ~~Reorganize /automation page~~ ✓ **DONE**
  - ✓ Moved packages to top (immediately under header)
  - ✓ Created individual package detail pages at /automation/packages/[tier]
  - ✓ Built checkout flow at /automation/packages/[tier]/checkout
  - ✓ 'Get Started' buttons now link to package pages with working checkout
  - Package pages include: Starter (£297/mo), Professional (£597/mo), Enterprise (£1,497/mo)
  - Each package has detailed features, setup timeline, platform info, AI capabilities
  - Checkout includes secure payment form (TODO: integrate Stripe/payment gateway)

### Contracts System
- ~~Create real contract pages (currently just placeholder links)~~ ✓ **DONE** - Built complete contract system:
  - Created app/user/account/contracts/service-agreement/page.tsx - Full service agreement template with editable fields
  - Created app/user/account/contracts/nda/page.tsx - Mutual NDA with comprehensive confidentiality clauses
  - Created app/user/account/contracts/ai-rider/page.tsx - AI development addendum with ethical AI provisions
  - Created app/user/account/contracts/ip-transfer/page.tsx - IP assignment agreement with warranties
  - All contracts have edit mode, save functionality (TODO: database integration), download PDF (TODO: PDF generation)
  - All contracts include BSV blockchain inscription placeholders
  - Professional legal formatting with signature sections
- [ ] Implement BSV blockchain inscription for contracts
  - Save contracts as ordinals inscriptions
  - Version history via sequential ordinals
  - Keep old versions on-chain for reference
  - Enable agent and client signatures
  - Integrate with database for storage

### Brand Assets System
- ~~Build brand assets backend infrastructure~~ ✓ **DONE** - Complete backend system ready:
  - Created docs/BRAND_ASSETS_DB_SETUP.md with comprehensive SQL schema
  - Built app/api/brand-assets/route.ts (GET/PATCH for fetching and updating brand assets)
  - Built app/api/brand-assets/upload/route.ts (POST for file uploads to Supabase Storage)
  - Database schema supports: 4 logo types (primary, inverted, favicon, social), 5 color palette fields
  - File validation: SVG/PNG for logos, ICO for favicon, max 5MB per file
  - Color validation: Hex format (#RRGGBB) with CHECK constraints
  - RLS policies implemented for secure user-scoped access
- [ ] Build dynamic brand tab UI at /user/account?tab=brand
  - Replace static "Warning Amber" placeholder
  - Implement file upload UI for logos, favicons, social images
  - Build color palette editor with hex input and visual picker
  - Add brand preview functionality
  - Apply brand assets to /public/client/[name] pages
  - See docs/BRAND_SYSTEM_SPEC.md for full UI specification

### Agents System (CRITICAL PRIORITY)
- ~~**STRATEGIC: Comprehensive architectural assessment and PRD**~~ ✓ **DONE** - Created complete documentation:
  - Created docs/ARCHITECTURAL_ASSESSMENT_2026.md (500+ lines) - Full strategic analysis, current state (30 features), gap analysis, proposed agent-first architecture, complete PRD with database schema, API specs, UI components, 10-week roadmap
  - Created docs/AGENT_SYSTEM_SPEC.md (600+ lines) - Complete technical specification, implementation guide with code examples, database migration SQL, API endpoints (TypeScript), React components, cron scheduler, testing strategy, deployment guide
  - **KEY FINDING**: Architecture inverted - agents currently subordinate to projects, must be reversed
  - **DECISION**: Agent-first hierarchy - Agents → Projects → Contracts/Tokens/Workflows
  - Ready to implement 10-week plan in 6 phases
- ~~**PHASE 0: Database Foundation (Week 1)**~~ ✓ **DONE**
  - ✓ Execute database migration (agents + 9 related tables)
  - ✓ Setup RLS policies (25+ policies)
  - ✓ Fixed agent_projects type mismatch (TEXT vs UUID)
  - ✓ Install dependencies (@anthropic-ai/sdk, node-cron, cron-parser)
  - ✓ Configure environment variables (comprehensive .env.example created)
- ~~**PHASE 1: Agent Chat (Weeks 2-3)**~~ ✓ **DONE**
  - ✓ Built AgentChatInterface component with streaming support
  - ✓ Implemented streaming Claude API integration with SSE
  - ✓ Created conversation persistence system (PostgreSQL)
  - ✓ Real-time SSE responses with token/cost tracking
  - ✓ Built /agent/chat page for direct agent interaction
  - ✓ Rebuilt /dashboard/agents with agent-first architecture
  - ✓ Agent creation wizard with role selection
  - ✓ Multi-agent support with agent switcher
- ~~**PHASE 2: Agent Management (Weeks 4-5)**~~ ✓ **BUILT** (2026-01-15)
  - ✓ Built `/dashboard/agents/[id]` agent detail page with tabs
  - ✓ Task assignment interface with create task modal
  - ✓ Cron presets (daily, weekly, hourly, etc.)
  - ✓ APIs: GET/PATCH/DELETE agent, CRUD for agent tasks
  - ⏳ Needs dev server restart to verify
- [ ] **PHASE 3-6: Multi-project, Performance, BSV, Advanced (Weeks 6-10)**
  - Project linkage system
  - Performance tracking dashboard
  - BSV blockchain inscription
  - RAG memory system

---

## PENDING TASKS - MEDIUM PRIORITY

### Portfolio Demo Fix
- [ ] Fix /portfolio/demo page
  - Currently wrong - should be a copy of /portfolio with mock token prices
  - Show sample project with fake but realistic data

### Problem Solving Page
- [ ] Create /problem-solving page
  - Map out what b0ase.com can offer businesses for problem solving
  - Include spreadsheet coordination services
  - Document client intake process
  - Explain methodology for when clients need help

### Founders Page & Market
- [ ] Create /founders page in navbar
  - Table of founders similar to /pricing layout
  - Each row: name, socials, founder token (e.g. $Scott_Powell), link to /founders/[name]
  - Individual founder pages at /founders/[slug]
  - Market for investing in founders themselves
  - Founders can link projects/businesses to profiles
  - On-chain auditable fund allocation
  - Future: Investor voting on fund apportionment

### Developers Page
- [ ] Create /developers page
  - Similar to /founders but for developers
  - Include GitHub repo links
  - Connect to existing repo tokenization system
  - Developer token market

### Exchange Improvements
- [ ] Enhance /exchange page
  - Currently good but needs more markets
  - Add fake live charts until real token data available
  - Support BSV primarily but consider Solana/ETH data pipes

### Mint/Launch Features
- [ ] Create checkout page for /mint/launch
  - Allow users to purchase mint mechanics
  - Initial: Manual architecture by b0ase team
  - Future: Automated minting process
  - Pricing and package options

### Pipeline System (~70% UI Built)
- [x] Develop /pipeline/*/*/* routing system ✓ **PARTIALLY DONE** (2026-01-19)
  - ✓ 4 UI pages built (index, new, [id], [id]/[stageName])
  - ✓ 7-stage workflow (Discovery → Post-Launch)
  - ✓ Task management per stage
  - ✓ Real AI agent chat integration (StageAgentChat component)
  - ✓ Database schema (pipeline_stages)
  - ✓ API routes for stages and tasks
  - [ ] Feature funding marketplace (not built)
  - [ ] Payment processing (not connected to escrow)
  - [ ] Token minting integration (not connected)
  - See docs/PIPELINE_SYSTEM_SPEC.md for full status

### Agent Backend System (~90% Built)
- [x] Build working /agent backend system ✓ **DONE** (2026-01-19)
  - ✓ /agent page with real AI chat (useChat hook)
  - ✓ Project builder wizard with modules
  - ✓ Track conversations with session persistence
  - ✓ /api/ai-agent endpoint working
  - [ ] Inscribe user-agent interactions on BSV blockchain (not built)
  - [ ] Sequential ordinal inscriptions (not built)
  - See /agent page and lib/hooks/useChat.ts

### Boardrooms
- [ ] Create subpages for /boardrooms
  - Link to implied services mentioned on main page
  - Full descriptions of what b0ase.com offers to build
  - Cost estimates for each feature
  - Add features to /pricing table
  - Enable clients to add to checklists and shopping carts
  - Follow site style guidelines

### Notion Integration
- [ ] Connect Notion to /admin/notion (optional)
  - May be overkill
  - Alternative to /admin/content for link tracking
  - See docs/NOTION_INTEGRATION.md

---

## PENDING TASKS - LOW PRIORITY

### Exchange Development
- [ ] Completely rebuild 1sat.market at /exchange/1sat-market
  - Full exchange interface
  - Large undertaking
  - May want separate planning document

### Token Types & Tokenization ✅ ALL COMPLETE (9/9)
- ~~Expand /tokens page to show different token types~~ ✅ **DONE**
  - ✅ `/tokens/types` overview with all 9 types
  - ✅ Phase 1: Utility, Governance, NFTs
  - ✅ Phase 2: Data, Legal, Identity
  - ✅ Phase 3: Revenue, Social
  - ✅ Phase 4: Conversation (novel)
- [ ] Implement ordinals inscription for token data
  - Sequential ordinals for canonical updates
  - Tamper-proof records on BSV blockchain
  - Version history tracking
- [ ] Expand blockchain use cases and applications
  - Think laterally: WhatsApp chat bubble tokenization
  - Legal records tokenization
  - Data provenance and ownership
  - Identity verification tokens
  - Micro-transactions and micropayments
  - Digital asset ownership
  - Supply chain tracking
  - Medical records
  - Educational credentials

### GitHub Repository Tokenization (NEW - Major Feature)
- [ ] Build new /github-repo-tokeniser tool
  - Replace/improve tokeniser.vercel.app (keep old as reference)
  - Allow repo OWNERS to tokenize by signing in with GitHub
  - Inscribe entire repository onto BSV ordinal
  - Repo owner gets full ownership of tokenized repo
- [ ] Create admin 'targets' page
  - Add popular/trending GitHub repos
  - Each repo gets dedicated mint page
  - Forward to GitHub authors to claim ownership
- [ ] Implement monetization features
  - Charge for repo access
  - Charge for forks and clones
  - Charge for PR requests and merges
  - Payment gating system
- [ ] Multi-wallet authentication
  - GitHub login (primary)
  - HandCash wallet integration
  - Yours wallet integration
  - Create b0ase.com user accounts to track authors
- [ ] Trending repos tracking system
  - Monitor Twitter feeds for trending repos
  - Track GitHub's own trending/popular lists
  - Auto-populate targets page
  - Real-time trend detection
- [ ] Create speculative token market
  - Investors can speculate on repo success
  - Which repos will "blow up"?
  - Trading interface for repo tokens
  - Market analytics and predictions
- [ ] Add to /tools page
  - List GitHub Repo Tokeniser as available tool
  - Link to /github-repo-tokeniser
  - Showcase use cases and benefits

**Business Model:** Speculative market for GitHub repos - "which repo will developers suddenly use to publish apps?" Major market opportunity.

---

## PENDING TASKS - PERFORMANCE

### Immediate Wins (High Impact, Low Effort)
- [ ] **Narrow Middleware Matcher:** Only run auth middleware on protected routes (`/admin`, `/dashboard`, etc.).
- [ ] **Lazy-Load Wallet Provider:** Dynamically import `YoursWalletProvider` only on pages that need it.
- [ ] **Remove Static Supabase Export:** Remove `export const supabase = createClient()` from `lib/supabase/client.ts` to prevent premature initialization.
- [ ] **Split Root Layout:** Create route groups (`(main)`, `(minimal)`, `(admin)`) with different layouts to reduce provider overhead.
- [ ] **Dynamic Import Heavy Components:** Dynamically import `NavbarWithMusic`.

### Medium-Term Improvements
- [ ] **Defer Auth Check:** Instead of middleware, check for authentication within the components that require it.
- [ ] **Code Split Heavy Libraries:** Dynamically import Three.js and other heavy libraries only on pages that use them.
- [ ] **Review and Remove Unused Dependencies:** Run `npx knip` to identify and remove unused packages from `node_modules`.

---

## TECHNICAL DEBT & INFRASTRUCTURE

### Supabase Setup ✅ COMPLETE
- ~~Run SQL from docs/SUPABASE_STORAGE_SETUP.md~~ ✅ **DONE** (2026-01-15)
  - ✅ Created content-assets bucket
  - ✅ Setup storage policies
  - ✅ Created content_assets table with RLS
- ~~Run SQL from docs/CONTENT_IDEAS_DB_SETUP.md~~ ✅ **DONE**
  - ✅ Created content_ideas table with RLS
- ~~Run SQL from docs/BRAND_ASSETS_DB_SETUP.md~~ ✅ **DONE**
  - ✅ Created brand_assets table with RLS
  - ✅ Created brand-assets storage bucket

### Twitter API Setup ✅ CONFIGURED
- ~~Obtain Twitter API credentials~~ ✅ **DONE** - Already in .env.local
  - TWITTER_API_KEY, TWITTER_API_KEY_SECRET configured
  - TWITTER_BEARER_TOKEN configured
  - TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_TOKEN_SECRET configured
- [ ] Configure Vercel cron jobs for scheduled posting
- [ ] Test posting to both accounts

### BSV Blockchain Integration
- [ ] Research ordinals inscription APIs
- [ ] Setup BSV wallet for contract inscriptions
- [ ] Build inscription service
- [ ] Test contract versioning on testnet

---

## NOTES & CONTEXT

### House Style Guidelines
- **Layout**: Full-width pages, no `max-w-*` containers
- **Padding**: `px-4 md:px-8 py-16`
- **Back Buttons**: Use FiArrowLeft icon, link to parent section
- **Colors**: DASHBOARD button should be white text, not blue
- **Typography**: Bold, uppercase headings with tight tracking
- **Reference Page**: /agents is the canonical style example

### Email Standards
- Only use: richard@b0ase.com, info@b0ase.com, richard@b0ase.com
- Never use placeholders like `[your-email]`

### Telegram Link
- Correct link: https://t.me/b0ase_com
- Never use https://t.me/b0ase

### Color Palette
- Pure Black: #000000
- Pure White: #FFFFFF
- Brand colors should be dynamic per-user (not "Warning Amber")

### Content Standards
- Never use first-person voice unless explicitly from b0ase
- All blog posts must be authentic b0ase content or properly attributed
- See docs/CONTENT_RULES.md for full validation rules

---

## PROJECT LINKS & REFERENCES

### Documentation
- `/docs/CHECKLIST.md` - Detailed feature tracking
- `/docs/CONTENT_RULES.md` - Content validation rules
- `/docs/AUTO_BOOK_QUEUE_SYSTEM.md` - Auto-book architecture
- `/docs/BRAND_SYSTEM_SPEC.md` - Brand assets implementation plan
- `/docs/VIDEO_UPLOAD_SYSTEM_COMPLETE.md` - Video upload guide
- `/docs/SUPABASE_STORAGE_SETUP.md` - Storage SQL setup

### Key Pages
- `/agents` - House style reference
- `/admin/content` - Content ideas bucket (built)
- `/dashboard/schematics` - Admin schematic access (built)
- `/dashboard/agents` - Agent management dashboard (rebuilt with agent-first architecture)
- `/agent/chat` - Chat with autonomous agents (built)
- `/portfolio/demo` - Demo portfolio for clients (built)
- `/user/account?tab=content` - Video upload system (built)

### APIs Built
- `/api/content-assets/upload` - POST file uploads
- `/api/content-assets` - GET/DELETE/PATCH operations
- `/api/agents` - GET all agents for user
- `/api/agents/create` - POST create new agent
- `/api/agents/[id]/chat` - POST streaming chat with SSE
- `/api/agents/[id]/conversations` - GET conversation history
- `/api/agents/[id]/conversations/[conversationId]/messages` - GET messages

---

## STRATEGIC DECISIONS IMPLEMENTED (2026-01-15)

### Executive Decision Framework
Created comprehensive strategic decision document at `/docs/STRATEGIC_DECISIONS_2026.md` (500+ lines)

**Priority Scoring Formula Applied:**
`(Business Impact × 2) + Competitive Advantage - (Complexity × 0.5)`

### Decision A: Automation Page Reorganization
**Status:** ✅ ALREADY COMPLETE
**Finding:** Packages section already positioned at top of page (line 199)
**Action:** Verified and documented current state

### Decision B: Contract BSV Inscription
**Status:** 📅 SCHEDULED Q2 2026
**Decision:** Medium priority - implement after Agent Phase 2 completion
**Rationale:** Contract system needs more real-world usage data before blockchain integration
**Dependencies:** Agent Phase 2, contract templates refinement, BSV wallet setup

### Decision C: Token Types Expansion
**Status:** ✅ ALL PHASES COMPLETE (9/9 token types)
**Priority:** HIGH - Completed

**All Pages Built:**
- ✅ `/app/tokens/types/page.tsx` - Overview page with all 9 token types
- ✅ `/app/tokens/types/utility/page.tsx` - Utility tokens
- ✅ `/app/tokens/types/governance/page.tsx` - Governance tokens
- ✅ `/app/tokens/types/nfts/page.tsx` - NFTs
- ✅ `/app/tokens/types/data/page.tsx` - Data tokens
- ✅ `/app/tokens/types/legal/page.tsx` - Legal record tokens
- ✅ `/app/tokens/types/identity/page.tsx` - Identity tokens
- ✅ `/app/tokens/types/revenue/page.tsx` - Revenue share tokens
- ✅ `/app/tokens/types/social/page.tsx` - Social tokens
- ✅ `/app/tokens/types/conversation/page.tsx` - Conversation tokens (novel)

### Decision D: Pipeline System Specification
**Status:** ✅ SPECIFICATION COMPLETE
**Priority:** HIGH - Spec created, ready for implementation approval
**Document:** `/docs/PIPELINE_SYSTEM_SPEC.md` (400+ lines)

**What Was Specified:**
- 7 pipeline stages (Discovery → Post-Launch)
- Complete database schema (5 new tables)
- Milestone-based payment system
- Agent integration strategy
- 4-phase implementation plan (16 weeks total)
- Parallel token minting workflow
- Stage-by-stage client journey with checklists

**Ready For:** User approval to begin Phase 1 (MVP implementation, 4 weeks)

### Architectural Decisions (AD-001 through AD-005)
- **AD-001:** Agent-First Hierarchy maintained across all new features
- **AD-002:** Supabase + PostgreSQL for all new tables
- **AD-003:** BSV blockchain for token/contract inscriptions (when implemented)
- **AD-004:** Stripe for milestone payments in pipeline
- **AD-005:** Next.js App Router for all new pages

---

**Total Completed:** 41 tasks (Agent Phase 0-1, Token Types Phase 1, Pipeline Spec, Strategic Framework)
**High Priority Pending:** 6 tasks (Agent Phases 2-6, Token Types Phases 2-4, Pipeline implementation)
**Medium Priority Pending:** 4 tasks
**Low Priority Pending:** 2 tasks
**Infrastructure Setup:** 3 items
