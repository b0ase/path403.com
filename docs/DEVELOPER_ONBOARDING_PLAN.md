# Developer Onboarding Plan

## Current State (Implemented)

The developer onboarding system at `/dashboard/developer/setup` is operational with a 5-step wizard:

| Step | Component | Status |
|------|-----------|--------|
| 1. GitHub Verification | `GitHubVerificationStep.tsx` | Complete |
| 2. Profile Setup | `ProfileSetupStep.tsx` | Complete |
| 3. Payout Preferences | `PayoutPreferencesStep.tsx` | Complete |
| 4. Agent Registration | `AgentRegistrationStep.tsx` | Complete |
| 5. Completion | Redirect to dashboard | Complete |

### Verification Requirements
- GitHub account 90+ days old
- 3+ public repositories
- Fetches stars, forks, languages, top repos

### Payout Options
- Stripe Connect (bank transfers) - 95% to developer
- PayPal (email-based)
- Crypto (BSV, ETH, SOL wallet address)

## Improvement Roadmap

### Phase 1: Post-Onboarding Experience

**1.1 Welcome Dashboard** (Priority: High)
- First-time developer dashboard with guided tour
- Progress checklist showing next steps
- Quick stats: profile views, contract opportunities

**1.2 Service Templates** (Priority: High)
- Pre-configured service offerings by category:
  - Web Development Package ($2,500-$10,000)
  - Mobile App Development ($5,000-$25,000)
  - AI Integration ($1,500-$5,000)
  - Blockchain Development ($3,000-$15,000)
  - Code Review/Audit ($500-$2,000)
- One-click service creation from templates

**1.3 Portfolio Showcase** (Priority: Medium)
- GitHub repo showcase (auto-imported)
- Case study templates
- Screenshot/demo video uploads
- Client testimonials section

### Phase 2: Communication & Matching

**2.1 In-App Messaging** (Priority: High)
- Direct messaging between developers and clients
- Contract-scoped conversations
- File attachments for deliverables
- Notification system (email + in-app)

**2.2 Contract Matching** (Priority: Medium)
- Algorithm matching developers to client requests
- Skills-based recommendations
- Availability filtering
- Price range matching
- "Recommended for you" section

**2.3 Proposal System** (Priority: Medium)
- Developers can submit proposals to open requests
- Custom pricing per proposal
- Estimated timeline
- Proposal acceptance workflow

### Phase 3: Contract Management

**3.1 Milestone Automation** (Priority: High)
- Automated milestone reminders
- Due date notifications
- Overdue alerts
- Progress tracking visualizations

**3.2 Deliverable Management** (Priority: Medium)
- File upload for milestone submissions
- Version history
- Approval workflow with comments
- Automatic receipt generation

**3.3 Dispute Resolution** (Priority: Low)
- Dispute filing workflow
- Evidence submission
- Admin review interface
- Resolution outcomes (refund, partial, release)

### Phase 4: Analytics & Growth

**4.1 Performance Dashboard** (Priority: Medium)
- Earnings history (daily/weekly/monthly)
- Contract completion rate
- Average rating trends
- Response time metrics
- Comparison to marketplace averages

**4.2 Reputation System** (Priority: Medium)
- Public profile ratings
- Review aggregation
- Badges (Top Rated, Quick Responder, etc.)
- Featured developer program

**4.3 Tax Documentation** (Priority: Low)
- 1099 generation (US)
- Annual earnings reports
- Invoice history export
- Tax-compliant receipts

## API Endpoints Needed

### Phase 1
```
GET  /api/developer/welcome          - Welcome dashboard data
GET  /api/developer/service-templates - List service templates
POST /api/developer/services/from-template - Create from template
POST /api/developer/portfolio        - Add portfolio item
```

### Phase 2
```
GET  /api/messages                   - List conversations
POST /api/messages/[conversationId]  - Send message
GET  /api/contracts/matches          - Get matched contracts
POST /api/contracts/proposals        - Submit proposal
```

### Phase 3
```
POST /api/milestones/[id]/remind     - Send reminder
POST /api/milestones/[id]/upload     - Upload deliverable
POST /api/disputes                   - File dispute
GET  /api/admin/disputes             - Admin dispute queue
```

### Phase 4
```
GET  /api/developer/analytics        - Performance metrics
GET  /api/developer/earnings         - Earnings breakdown
GET  /api/developer/tax-docs         - Tax documents
```

## Database Schema Additions

```prisma
// Service Templates
model service_templates {
  id          String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  category    String   // web_development, mobile_app, etc.
  title       String
  description String
  base_price  Decimal  @db.Decimal(10, 2)
  max_price   Decimal  @db.Decimal(10, 2)
  skills      String[]
  milestones  Json     // Default milestone structure
  is_active   Boolean  @default(true)
  created_at  DateTime @default(now()) @db.Timestamptz(6)
}

// Messages
model messages {
  id              String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  conversation_id String   @db.Uuid
  sender_id       String   @db.Uuid
  content         String
  attachments     Json?
  read_at         DateTime? @db.Timestamptz(6)
  created_at      DateTime @default(now()) @db.Timestamptz(6)

  conversation    conversations @relation(fields: [conversation_id], references: [id])
  sender          profiles      @relation(fields: [sender_id], references: [id])
}

model conversations {
  id           String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  contract_id  String?  @db.Uuid
  participant1 String   @db.Uuid
  participant2 String   @db.Uuid
  created_at   DateTime @default(now()) @db.Timestamptz(6)

  messages     messages[]
  contract     marketplace_contracts? @relation(fields: [contract_id], references: [id])
}

// Disputes
model disputes {
  id            String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  contract_id   String   @db.Uuid
  filed_by      String   @db.Uuid
  reason        String
  evidence      Json?
  status        String   @default("pending") // pending, reviewing, resolved
  resolution    String?  // refund, partial, release
  resolved_by   String?  @db.Uuid
  resolved_at   DateTime? @db.Timestamptz(6)
  created_at    DateTime @default(now()) @db.Timestamptz(6)

  contract      marketplace_contracts @relation(fields: [contract_id], references: [id])
  filer         profiles @relation("DisputeFiler", fields: [filed_by], references: [id])
  resolver      profiles? @relation("DisputeResolver", fields: [resolved_by], references: [id])
}

// Developer Analytics (materialized daily)
model developer_analytics {
  id                  String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  developer_id        String   @db.Uuid
  date                DateTime @db.Date
  profile_views       Int      @default(0)
  contracts_completed Int      @default(0)
  earnings_usd        Decimal  @default(0) @db.Decimal(10, 2)
  average_rating      Decimal? @db.Decimal(2, 1)
  response_time_hours Int?

  developer           profiles @relation(fields: [developer_id], references: [id])

  @@unique([developer_id, date])
}
```

## Implementation Priority

### Immediate (This Sprint)
1. Welcome dashboard with guided checklist
2. Service templates (5 core categories)
3. Milestone reminder emails

### Short-term (Next 2 Sprints)
4. In-app messaging system
5. Performance dashboard
6. Portfolio showcase

### Medium-term (Q2 2026)
7. Contract matching algorithm
8. Proposal system
9. Reputation badges

### Long-term (Q3 2026)
10. Dispute resolution
11. Tax documentation
12. Advanced analytics

## Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Developer signups/month | - | 50 |
| Onboarding completion rate | - | 80% |
| First contract within 30 days | - | 40% |
| Developer satisfaction (NPS) | - | 50+ |
| Average time to first payout | - | 14 days |

## Related Documentation

- [CODEBASE_MAP.md](./CODEBASE_MAP.md) - Architecture overview
- [SYSTEM_MAP.md](./SYSTEM_MAP.md) - Infrastructure access
- Onboarding code: `/app/dashboard/developer/setup/`
- API routes: `/app/api/developer/`

---

*Last Updated: 2026-01-19*
*Status: Planning Complete - Ready for Implementation*
