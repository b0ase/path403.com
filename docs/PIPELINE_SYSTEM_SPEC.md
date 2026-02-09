# B0ASE.COM - Pipeline System Specification

**Status:** PARTIALLY IMPLEMENTED (~70% UI, ~30% business logic) - See Implementation Status below
**Version:** 1.0.0
**Date:** 2026-01-15
**Updated:** 2026-01-19
**Priority:** High (Strategic Infrastructure)

## Implementation Status

| Feature | Status | Location |
|---------|--------|----------|
| Pipeline Index Page | ✅ | `app/pipeline/page.tsx` |
| New Project Wizard | ✅ | `app/pipeline/new/page.tsx` |
| Project Dashboard | ✅ | `app/pipeline/[id]/page.tsx` |
| Stage Detail Page | ✅ | `app/pipeline/[id]/[stageName]/page.tsx` |
| 7-Stage Workflow | ✅ | Discovery → Specification → Design → Development → Testing → Deployment → Post-Launch |
| Task Management | ✅ | Add, complete, delete tasks per stage |
| Agent Chat Integration | ✅ | `DemoAgentChat` component per stage |
| Database Schema | ✅ | `pipeline_stages` in Prisma |
| Stages API | ✅ | `app/api/pipeline/[id]/stages/route.ts` |
| Tasks API | ✅ | `app/api/pipeline/tasks/[taskId]/route.ts` |
| Demo Mode | ✅ | Sample projects with realistic data |
| Deliverables Tracking | ✅ | Per-stage deliverable lists |
| Progress Visualization | ✅ | Progress bars, % complete |
| Fundraising Rounds | ✅ | Database schema supports per-stage funding |
| Feature Funding Marketplace | ❌ | Not yet implemented |
| Real Agent Integration | ✅ | `components/pipeline/StageAgentChat.tsx` with stage-specific prompts |
| Payment Processing | ❌ | Not connected to escrow system |
| Token Minting Integration | ❌ | Not connected to minting system |

---

## EXECUTIVE SUMMARY

The Pipeline System is b0ase.com's core client workflow infrastructure—a guided, stage-by-stage journey from project idea to successful launch. Unlike typical project management tools, the Pipeline integrates AI agents at every stage to provide real-time guidance, automated task execution, and intelligent decision support.

**Strategic Importance:**
- **Primary Revenue Driver:** Direct path from lead to paying client
- **Differentiation:** AI-guided workflows no competitor offers
- **Retention:** Structured process increases completion rates
- **Scalability:** Agents handle 70%+ of routine guidance

**Core Innovation:** Agent-first architecture where AI agents act as co-pilots, not just tools, throughout the entire client journey.

---

## SYSTEM OVERVIEW

### What Is the Pipeline?

The Pipeline is a **private, dynamic route system** at `/pipeline/[project-slug]/[stage-slug]` where clients progress through clearly defined stages with agent assistance, checklists, deliverables, and milestone payments.

### Key Characteristics

1. **Agent-Guided:** AI agent available 24/7 for questions, recommendations, and task automation
2. **Stage-Based:** 7 discrete stages with clear entry/exit criteria
3. **Milestone Payments:** Client pays per stage completion, reducing risk
4. **Real-Time Progress:** Visual tracking of tasks, deliverables, and next steps
5. **Collaborative:** Client + Agent + b0ase team work together
6. **Token-Parallel:** Token minting runs alongside project development
7. **Feature Funding:** Each stage can be crowdfunded by investors (Feature Funding Marketplace)

---

## FEATURE FUNDING MARKETPLACE LOOP (NEW)

The "Single Client" model is replaced by a "Tranche-Based" funding model:

1. **Roadmap Definition:** Project Owner defines the roadmap (Stages 1-7).
2. **Tranche Creation:** Each stage becomes a "Funding Round". e.g., "Stage 4: Development" needs £5,000.
3. **Crowdfunding:**
   - Investors browse `/investors` and see "Build Mobile App Feature".
   - They fund the tranche (funds go to Escrow).
   - They receive "Future Equity Tokens" (convertible upon delivery).
4. **Developer Tender:**
   - Once fully funded, the stage appears on `/developers` as a "Funded Tender".
   - Developers bid or are assigned.
   - Smart Contract wraps the deal.
5. **Execution & Release:**
   - Developer builds feature.
   - Upon acceptance, Developer gets Cash (from Escrow).
   - Investors get Equity Tokens (minted on BSV).

---

## TECHNICAL ARCHITECTURE

### URL Structure

```
/pipeline/[project-slug]/[stage-slug]
```

**Examples:**
- `/pipeline/my-saas-app/discovery` - Discovery stage for "My SaaS App"
- `/pipeline/tokenize-repo/specification` - Specification stage for "Tokenize Repo"
- `/pipeline/nft-marketplace/development` - Development stage for "NFT Marketplace"

### Database Schema

```sql
-- Projects table (already exists)
CREATE TABLE IF NOT EXISTS public.projects (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  category VARCHAR(100),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pipeline stages (new)
CREATE TABLE public.pipeline_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id TEXT REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  stage_name VARCHAR(50) NOT NULL,
  stage_order INT NOT NULL,
  status VARCHAR(50) DEFAULT 'not_started',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  agent_id UUID REFERENCES public.agents(id),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT valid_stage_name CHECK (stage_name IN (
    'discovery', 'specification', 'design', 'development', 'testing', 'deployment', 'post_launch'
  )),
  CONSTRAINT valid_status CHECK (status IN (
    'not_started', 'in_progress', 'blocked', 'completed', 'skipped'
  )),
  UNIQUE(project_id, stage_name)
);

-- Stage tasks (checklists)
CREATE TABLE public.stage_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_id UUID REFERENCES public.pipeline_stages(id) ON DELETE CASCADE NOT NULL,
  task_name VARCHAR(200) NOT NULL,
  task_description TEXT,
  task_order INT NOT NULL,
  is_required BOOLEAN DEFAULT true,
  is_completed BOOLEAN DEFAULT false,
  completed_by UUID REFERENCES auth.users(id),
  completed_at TIMESTAMPTZ,
  agent_suggested BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Stage deliverables
CREATE TABLE public.stage_deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_id UUID REFERENCES public.pipeline_stages(id) ON DELETE CASCADE NOT NULL,
  deliverable_name VARCHAR(200) NOT NULL,
  deliverable_type VARCHAR(50),
  file_url TEXT,
  description TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  uploaded_at TIMESTAMPTZ,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT valid_deliverable_type CHECK (deliverable_type IN (
    'document', 'design', 'code', 'contract', 'asset', 'other'
  ))
);

-- Stage payments
CREATE TABLE public.stage_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_id UUID REFERENCES public.pipeline_stages(id) ON DELETE CASCADE NOT NULL,
  amount_gbp DECIMAL(10,2) NOT NULL,
  payment_status VARCHAR(50) DEFAULT 'pending',
  invoice_url TEXT,
  paid_at TIMESTAMPTZ,
  stripe_payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT valid_payment_status CHECK (payment_status IN (
    'pending', 'invoiced', 'paid', 'failed', 'refunded'
  ))
);

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Fundraising Rounds (Feature Funding)
CREATE TABLE public.fundraising_rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_id UUID REFERENCES public.pipeline_stages(id) ON DELETE CASCADE NOT NULL,
  target_amount DECIMAL(10,2) NOT NULL,
  raised_amount DECIMAL(10,2) DEFAULT 0,
  min_investment DECIMAL(10,2) DEFAULT 10,
  max_investment DECIMAL(10,2),
  equity_token_count INT,
  status VARCHAR(50) DEFAULT 'draft', -- draft, open, fully_funded, closed
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Investor Allocations
CREATE TABLE public.investor_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id UUID REFERENCES public.fundraising_rounds(id) ON DELETE CASCADE NOT NULL,
  investor_user_id UUID REFERENCES auth.users(id) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pledged', -- pledged, escrowed, released, refunded
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Marketplace Tenders (Developer Bids)
CREATE TABLE public.marketplace_tenders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_id UUID REFERENCES public.pipeline_stages(id) ON DELETE CASCADE NOT NULL,
  budget_max DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'open', -- open, awarded, closed
  awarded_developer_id UUID REFERENCES auth.users(id),
  contract_id UUID, -- Link to marketplace_contracts
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Stage conversations (agent interactions)
CREATE TABLE public.stage_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_id UUID REFERENCES public.pipeline_stages(id) ON DELETE CASCADE NOT NULL,
  conversation_id UUID REFERENCES public.agent_conversations(id) ON DELETE SET NULL,
  topic VARCHAR(200),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_pipeline_stages_project_id ON public.pipeline_stages(project_id);
CREATE INDEX idx_pipeline_stages_status ON public.pipeline_stages(status);
CREATE INDEX idx_pipeline_stages_agent_id ON public.pipeline_stages(agent_id);
CREATE INDEX idx_stage_tasks_stage_id ON public.stage_tasks(stage_id);
CREATE INDEX idx_stage_deliverables_stage_id ON public.stage_deliverables(stage_id);
CREATE INDEX idx_stage_payments_stage_id ON public.stage_payments(stage_id);

-- RLS Policies
ALTER TABLE public.pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stage_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stage_deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stage_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stage_conversations ENABLE ROW LEVEL SECURITY;

-- Users can view pipeline stages for their projects
CREATE POLICY "Users can view their project stages"
  ON public.pipeline_stages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = pipeline_stages.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Similar policies for other tables (tasks, deliverables, payments, conversations)
```

### API Endpoints

**Stage Management:**
- `GET /api/pipeline/[projectId]/stages` - List all stages for a project
- `POST /api/pipeline/[projectId]/stages/[stageName]/start` - Start a stage
- `POST /api/pipeline/[projectId]/stages/[stageName]/complete` - Complete a stage
- `PATCH /api/pipeline/[projectId]/stages/[stageName]` - Update stage (assign agent, etc.)

**Task Management:**
- `GET /api/pipeline/stages/[stageId]/tasks` - List tasks for a stage
- `POST /api/pipeline/stages/[stageId]/tasks` - Add custom task
- `PATCH /api/pipeline/tasks/[taskId]/complete` - Mark task complete

**Deliverables:**
- `GET /api/pipeline/stages/[stageId]/deliverables` - List deliverables
- `POST /api/pipeline/stages/[stageId]/deliverables/upload` - Upload deliverable

**Payments:**
- `POST /api/pipeline/stages/[stageId]/invoice` - Generate invoice for stage
- `POST /api/pipeline/stages/[stageId]/pay` - Process payment (Stripe integration)

---

## THE 7 PIPELINE STAGES

### Stage 1: DISCOVERY
**Duration:** 1-2 weeks
**Cost:** £500-1,500
**Agent Role:** Idea Validator & Market Researcher

**Purpose:**
Validate the project idea, assess market fit, and determine feasibility. Clients leave with confidence their project is viable.

**Entry Criteria:**
- Client has paid discovery fee
- Initial project brief submitted
- Agent assigned to project

**Core Tasks:**
1. ✓ Complete project questionnaire (30 questions)
2. ✓ Market research review (agent-generated)
3. ✓ Competitive analysis (agent-assisted)
4. ✓ Technical feasibility assessment
5. ✓ Budget and timeline estimation
6. ✓ Risk identification
7. ✓ Go/No-Go decision meeting

**Deliverables:**
- Market Research Report (agent-generated)
- Competitive Landscape Analysis
- Technical Feasibility Document
- Preliminary Budget & Timeline
- Risk Assessment Matrix

**Exit Criteria:**
- All tasks completed
- Client approves Go decision
- Discovery payment received
- Next stage payment agreed

**Agent Capabilities:**
- Conduct market research via web scraping
- Analyze competitor websites and features
- Suggest similar successful projects
- Identify technical risks proactively
- Generate preliminary specs

---

### Stage 2: SPECIFICATION
**Duration:** 1-3 weeks
**Cost:** £1,000-3,000
**Agent Role:** Requirements Engineer & Scope Definer

**Purpose:**
Define exactly what will be built. Convert ideas into detailed, actionable specifications.

**Entry Criteria:**
- Discovery stage completed
- Go decision confirmed
- Specification payment received

**Core Tasks:**
1. ✓ User story mapping (agent-assisted)
2. ✓ Feature prioritization (MoSCoW method)
3. ✓ Technical requirements documentation
4. ✓ API & integration specifications
5. ✓ Data model design
6. ✓ Security requirements definition
7. ✓ Performance requirements
8. ✓ Module selection (from b0ase catalog)
9. ✓ Final pricing agreement

**Deliverables:**
- Product Requirements Document (PRD)
- User Stories & Acceptance Criteria
- Technical Specification Document
- Data Model Diagrams (ER diagrams)
- API Specification (OpenAPI/Swagger)
- Module Selection & Pricing Sheet
- Statement of Work (SOW)

**Exit Criteria:**
- Client signs off on complete specification
- No ambiguous requirements remain
- Development payment schedule agreed
- Contracts signed

**Agent Capabilities:**
- Generate user stories from conversations
- Suggest required modules based on features
- Create data model diagrams
- Estimate development time per feature
- Identify missing requirements

---

### Stage 3: DESIGN
**Duration:** 1-2 weeks
**Cost:** £800-2,500
**Agent Role:** Design Advisor & Brand Consultant

**Purpose:**
Create visual designs, wireframes, and brand assets. Clients see their project come to life visually.

**Entry Criteria:**
- Specification approved
- Design payment received
- Brand assets uploaded (or using defaults)

**Core Tasks:**
1. ✓ Wireframe creation (all key screens)
2. ✓ High-fidelity mockups
3. ✓ Brand style guide creation
4. ✓ Component library design
5. ✓ User flow diagrams
6. ✓ Design review & iterations
7. ✓ Design handoff preparation

**Deliverables:**
- Complete Wireframe Set (Figma/Sketch)
- High-Fidelity Mockups (10-20 screens)
- Brand Style Guide (colors, fonts, logos)
- Component Library
- User Flow Diagrams
- Design Handoff Package

**Exit Criteria:**
- Client approves final designs
- All screens designed
- Design system documented
- Development-ready assets exported

**Agent Capabilities:**
- Suggest design patterns for features
- Generate color palette recommendations
- Create basic wireframe layouts
- Identify UX issues proactively
- Recommend design inspiration

---

### Stage 4: DEVELOPMENT
**Duration:** 4-12 weeks
**Cost:** £5,000-50,000+
**Agent Role:** Project Manager & Code Reviewer

**Purpose:**
Build the actual product. Code is written, APIs are connected, features are implemented.

**Entry Criteria:**
- Design approved
- Development contract signed
- First development payment received

**Core Tasks:**
1. ✓ Development environment setup
2. ✓ Database schema implementation
3. ✓ Backend API development
4. ✓ Frontend component development
5. ✓ Feature implementation (per spec)
6. ✓ Integration testing
7. ✓ Code review & QA
8. ✓ Bug fixing
9. ✓ Performance optimization
10. ✓ Security audit

**Deliverables:**
- Working Application (staging environment)
- Source Code Repository (GitHub)
- API Documentation
- Database Schema & Migrations
- Environment Configuration Files
- Developer Documentation

**Exit Criteria:**
- All features implemented per specification
- No critical bugs remaining
- Performance benchmarks met
- Security audit passed
- Client UAT (User Acceptance Testing) approved

**Agent Capabilities:**
- Track development progress automatically
- Run automated code reviews
- Identify potential bugs via static analysis
- Suggest code optimizations
- Generate API documentation
- Notify client of milestone completions

---

### Stage 5: TESTING
**Duration:** 1-2 weeks
**Cost:** £1,000-3,000
**Agent Role:** QA Engineer & Test Coordinator

**Purpose:**
Comprehensive testing to ensure quality. Find and fix bugs before launch.

**Entry Criteria:**
- Development stage completed
- Application deployed to staging
- Testing payment received

**Core Tasks:**
1. ✓ Test plan creation
2. ✓ Unit test verification
3. ✓ Integration testing
4. ✓ End-to-end testing
5. ✓ Cross-browser testing
6. ✓ Mobile responsiveness testing
7. ✓ Performance testing (load, stress)
8. ✓ Security testing
9. ✓ Accessibility testing (WCAG)
10. ✓ User acceptance testing (UAT)

**Deliverables:**
- Test Plan Document
- Test Cases & Results
- Bug Reports & Resolutions
- Performance Test Results
- Security Audit Report
- UAT Sign-off Document

**Exit Criteria:**
- All tests passed
- No critical/high-priority bugs
- Client UAT approved
- Performance targets met
- Security vulnerabilities resolved

**Agent Capabilities:**
- Run automated test suites
- Generate test cases from specifications
- Monitor staging environment for errors
- Coordinate UAT sessions with client
- Track bug resolution progress

---

### Stage 6: DEPLOYMENT
**Duration:** 3-5 days
**Cost:** £500-1,500
**Agent Role:** DevOps Engineer & Launch Coordinator

**Purpose:**
Launch the project to production. Go live!

**Entry Criteria:**
- Testing completed successfully
- Production environment configured
- Launch payment received
- Client approval to launch

**Core Tasks:**
1. ✓ Production environment setup
2. ✓ Database migration to production
3. ✓ DNS & domain configuration
4. ✓ SSL certificate installation
5. ✓ Deployment automation setup
6. ✓ Monitoring & logging configuration
7. ✓ Backup system setup
8. ✓ Launch checklist completion
9. ✓ Production smoke testing
10. ✓ Go-live!

**Deliverables:**
- Live Production Application
- Deployment Runbook
- Monitoring Dashboard
- Backup & Recovery Plan
- Launch Announcement Materials
- Operations Handover Document

**Exit Criteria:**
- Application live on production domain
- No critical errors in production
- Monitoring systems active
- Backups running successfully
- Client trained on operations

**Agent Capabilities:**
- Run deployment scripts
- Monitor deployment progress
- Perform automated smoke tests
- Alert on deployment issues
- Generate launch announcements

---

### Stage 7: POST-LAUNCH
**Duration:** 4-12 weeks (support period)
**Cost:** £300-1,000/month
**Agent Role:** Support Engineer & Optimization Advisor

**Purpose:**
Ensure smooth operations, gather feedback, and optimize performance post-launch.

**Entry Criteria:**
- Application successfully launched
- Support contract signed
- First month payment received

**Core Tasks:**
1. ✓ Monitor application health
2. ✓ User feedback collection
3. ✓ Bug fix releases
4. ✓ Performance optimization
5. ✓ Analytics review & insights
6. ✓ Feature usage analysis
7. ✓ Client training sessions
8. ✓ Documentation updates
9. ✓ Growth recommendations
10. ✓ Handoff to client (or renewal)

**Deliverables:**
- Monthly Performance Reports
- Bug Fix Releases
- Optimization Recommendations
- Analytics Dashboard
- User Feedback Summary
- Growth Strategy Document

**Exit Criteria:**
- Application stable (< 0.1% error rate)
- Client satisfied with operations
- All post-launch bugs fixed
- Client trained and confident
- Support contract renewal or graceful handoff

**Agent Capabilities:**
- Monitor application 24/7
- Analyze user behavior patterns
- Suggest optimization opportunities
- Generate monthly reports
- Provide automated support responses
- Identify growth opportunities

---

## AGENT INTEGRATION

### Agent Assignment Strategy

**Discovery & Specification:**
- Assign **Research & Planning Agent** (role: custom)
- Focus: Market analysis, requirements gathering, documentation

**Design:**
- Assign **Design Advisory Agent** (role: content)
- Focus: UX feedback, design patterns, brand consistency

**Development & Testing:**
- Assign **Technical Agent** (role: developer)
- Focus: Code review, bug detection, performance monitoring

**Deployment & Post-Launch:**
- Assign **DevOps Agent** (role: support)
- Focus: Deployment automation, monitoring, incident response

### Agent-User Interaction

**Stage Chat Widget:**
Every pipeline stage page includes embedded agent chat:
```tsx
<AgentChatInterface
  agentId={stage.agent_id}
  conversationId={stage.current_conversation_id}
  context={{
    stage: stage.stage_name,
    projectId: project.id,
    projectName: project.name,
    tasks: incompleteTasks
  }}
/>
```

**Agent Context Awareness:**
Agents have access to:
- Current stage and all tasks
- Project specification and requirements
- Previous stage deliverables
- Client conversation history
- B0ase knowledge base

**Proactive Agent Behaviors:**
- Remind client of overdue tasks
- Suggest next steps when stuck
- Flag potential issues early
- Celebrate milestone completions
- Recommend additional modules

---

## TOKEN MINTING PARALLEL WORKFLOW

### Token Pipeline (Runs Alongside Main Pipeline)

Clients who want to tokenize their project follow a parallel token pipeline:

**Token Stages:**
1. **Token Design** (parallel to Specification)
   - Choose token type (utility, governance, NFT, etc.)
   - Define tokenomics (supply, distribution)
   - Smart contract requirements

2. **Smart Contract Development** (parallel to Development)
   - Solidity/Bitcoin script development
   - Token contract testing
   - Audit preparation

3. **Token Launch** (parallel to Deployment)
   - Mainnet deployment
   - BSV ordinals inscription
   - Token distribution
   - Exchange listing (if applicable)

**Token Pipeline Table:**
```sql
CREATE TABLE public.token_pipelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id TEXT REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  token_type VARCHAR(50) NOT NULL,
  token_symbol VARCHAR(10),
  total_supply BIGINT,
  smart_contract_url TEXT,
  bsv_inscription_id TEXT,
  status VARCHAR(50) DEFAULT 'designing',
  launched_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
```

---

## PAYMENT INTEGRATION

### Milestone-Based Payments

Each stage has an associated cost. Clients pay per milestone, reducing risk.

**Payment Flow:**
1. Client completes current stage
2. System generates invoice for next stage
3. Client reviews and approves invoice
4. Payment processed via Stripe
5. Next stage unlocks upon successful payment

**Pricing Models:**

**Fixed Price:**
- Discovery: £500-1,500
- Specification: £1,000-3,000
- Design: £800-2,500
- Development: £5,000-50,000
- Testing: £1,000-3,000
- Deployment: £500-1,500
- Post-Launch: £300-1,000/month

**Time & Materials:**
- Hourly rate: £75-150/hour
- Agent time: £30/hour (discounted)
- Client tracks hours per stage

**Retainer:**
- Monthly retainer covers all stages
- Fixed scope, predictable cost
- Unused hours roll over

### Stripe Integration

```typescript
// Generate invoice
async function generateStageInvoice(stageId: string) {
  const stage = await getStageById(stageId);
  const pricing = getStagePricing(stage.stage_name);

  const invoice = await stripe.invoices.create({
    customer: stage.project.user.stripe_customer_id,
    description: `${stage.stage_name} - ${stage.project.name}`,
    amount: pricing.amount_gbp * 100, // Convert to pence
    currency: 'gbp',
    metadata: {
      project_id: stage.project_id,
      stage_id: stageId,
      stage_name: stage.stage_name
    }
  });

  await saveInvoice(stageId, invoice.id, invoice.hosted_invoice_url);
  return invoice;
}

// Process payment
async function processStagePayment(stageId: string, paymentMethodId: string) {
  const invoice = await getStageInvoice(stageId);

  const payment = await stripe.paymentIntents.create({
    amount: invoice.amount_gbp * 100,
    currency: 'gbp',
    payment_method: paymentMethodId,
    confirm: true,
    metadata: {
      stage_id: stageId,
      invoice_id: invoice.id
    }
  });

  if (payment.status === 'succeeded') {
    await markStagePaymentComplete(stageId);
    await unlockNextStage(stageId);
  }

  return payment;
}
```

---

## USER INTERFACE

### Pipeline Dashboard (`/pipeline/[projectId]`)

**Overview Screen:**
```
┌─────────────────────────────────────────────────────────┐
│  MY SAAS APP                                    80% ⬤   │
│  Project Dashboard                                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ✓ Discovery      ✓ Specification   ✓ Design          │
│  ✓ Development    → Testing          ○ Deployment       │
│  ○ Post-Launch                                          │
│                                                          │
│  CURRENT STAGE: Testing                                 │
│  ┌─────────────────────────────────────────────┐       │
│  │  Agent: QA Engineer Bot                      │       │
│  │  Progress: 12/15 tasks completed             │       │
│  │  Next Milestone: UAT Sign-off                │       │
│  │  Payment Status: Paid                        │       │
│  └─────────────────────────────────────────────┘       │
│                                                          │
│  [Continue to Testing Stage →]                         │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Stage Detail Screen (`/pipeline/[projectId]/testing`)

```
┌─────────────────────────────────────────────────────────┐
│  ← Back to Dashboard                                     │
├─────────────────────────────────────────────────────────┤
│  TESTING STAGE                              12/15 ✓     │
├─────────────────────────────────────────────────────────┤
│  TASKS                          AGENT CHAT              │
│  ┌──────────────────────┐      ┌───────────────────┐   │
│  │ ✓ Test plan created  │      │ QA Engineer Bot   │   │
│  │ ✓ Unit tests passing │      │                   │   │
│  │ → UAT in progress    │      │ "All unit tests   │   │
│  │ ○ Security audit     │      │  passed! Ready    │   │
│  │ ○ Performance tests  │      │  for UAT?"        │   │
│  └──────────────────────┘      │                   │   │
│                                │ [Type message...] │   │
│  DELIVERABLES                  └───────────────────┘   │
│  • Test Results.pdf                                     │
│  • Bug Reports.csv                                      │
│                                                          │
│  PAYMENT: £2,500 (Paid ✓)                              │
│  NEXT: Complete UAT, then proceed to Deployment         │
└─────────────────────────────────────────────────────────┘
```

---

## IMPLEMENTATION PHASES

### Phase 1: MVP (Weeks 1-4)
**Goal:** Basic pipeline with 3 stages (Discovery, Specification, Development)

**Deliverables:**
- Database schema complete
- API endpoints for stages and tasks
- Basic UI for pipeline dashboard
- Manual agent assignment
- Simple task checklists

**Out of Scope:**
- Automated payments
- Advanced agent features
- Deliverable uploads
- Token pipeline

### Phase 2: Payments & Deliverables (Weeks 5-6)
**Goal:** Add Stripe integration and file uploads

**Deliverables:**
- Stripe payment processing
- Invoice generation
- Deliverable upload system
- Payment-gated stage progression

### Phase 3: Full Agent Integration (Weeks 7-10)
**Goal:** Intelligent agents that proactively guide clients

**Deliverables:**
- Agent auto-assignment per stage
- Context-aware agent responses
- Proactive agent suggestions
- Agent-generated deliverables

### Phase 4: Token Pipeline (Weeks 11-14)
**Goal:** Parallel token minting workflow

**Deliverables:**
- Token pipeline stages
- Smart contract integration
- BSV ordinals inscription
- Token launch coordination

### Phase 5: Analytics & Optimization (Weeks 15-16)
**Goal:** Data-driven insights and improvements

**Deliverables:**
- Analytics dashboard
- Completion rate tracking
- Client satisfaction surveys
- Agent performance metrics

---

## SUCCESS METRICS

### Client Metrics
- **Completion Rate:** 70%+ of clients complete all stages
- **Time to Launch:** Average 8-12 weeks from discovery to deployment
- **Satisfaction Score:** 8.5/10 average client rating
- **Referral Rate:** 40%+ clients refer others

### Business Metrics
- **Revenue per Client:** £10,000-50,000 average
- **Agent Efficiency:** 70% of tasks completed or assisted by agents
- **Support Tickets:** <5% of stages require human intervention
- **Renewal Rate:** 60%+ clients renew post-launch support

### Technical Metrics
- **Page Load Time:** <2s for all pipeline pages
- **Agent Response Time:** <3s for agent chat
- **Uptime:** 99.9% availability
- **Error Rate:** <0.1% of stage transitions fail

---

## RISKS & MITIGATION

### Risk 1: Scope Creep in Specification Stage
**Likelihood:** High
**Impact:** Medium (delays subsequent stages)
**Mitigation:**
- Clearly defined exit criteria
- Agent flags scope expansion
- Additional fees for major changes
- Formal change request process

### Risk 2: Client Abandonment Mid-Pipeline
**Likelihood:** Medium
**Impact:** High (revenue loss)
**Mitigation:**
- Milestone payments minimize loss
- Agent engagement keeps clients active
- Automated reminders for overdue tasks
- Offer "pause" option vs. cancellation

### Risk 3: Agent Hallucinations/Errors
**Likelihood:** Low (with Claude Sonnet 4.5)
**Impact:** High (client trust)
**Mitigation:**
- Human review of all agent-generated deliverables
- Clear disclaimers on agent suggestions
- Client approval required for critical decisions
- Agent conversation logging for audit

### Risk 4: Payment Processing Failures
**Likelihood:** Low
**Impact:** Medium (stage blocking)
**Mitigation:**
- Stripe webhook monitoring
- Retry logic for failed payments
- Manual payment override option
- Clear communication of payment issues

---

## CONCLUSION

The Pipeline System is b0ase.com's strategic infrastructure for client project delivery. By combining structured workflows with AI agent assistance, we create a differentiated experience that increases completion rates, client satisfaction, and revenue per client.

**Recommended Next Steps:**
1. **Approve Specification** - Review and approve this document
2. **Database Migration** - Execute pipeline schema SQL
3. **Begin Phase 1** - Build MVP (Weeks 1-4)
4. **Client Testing** - Pilot with 3 initial clients
5. **Iterate & Launch** - Refine based on feedback, full launch

**Questions for Stakeholder:**
- Should we start with 3-stage MVP or full 7-stage system?
- Preferred payment model: Milestone, T&M, or Retainer?
- Which agent capabilities are highest priority?
- Timeline expectations: Fast MVP (4 weeks) or Full System (16 weeks)?

---

**Document Status:** READY FOR APPROVAL
**Next Review:** Upon stakeholder feedback
**Contact:** Claude (Acting CTO) via /agent/chat

