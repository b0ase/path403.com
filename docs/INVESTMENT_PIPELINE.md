# Investment Pipeline System

**Version:** 1.0.0
**Date:** 2026-01-24
**Status:** Operational

## Overview

The Investment Pipeline enables crowdfunded development of projects through funding tranches. Each project has a roadmap divided into tranches, and each tranche can be funded by investors. When funded, GitHub issues are assigned as deliverables, and developers are paid upon PR merge.

## How It Works

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   INVESTOR      │     │   DEVELOPER     │     │   PROJECT       │
│                 │     │                 │     │                 │
│  Funds Tranche  │────►│  Claims Issue   │────►│  PR Merged      │
│  Gets Tokens    │     │  Builds Feature │     │  Equity Released│
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │                       │
        ▼                       ▼                       ▼
   Escrow Holds            Paid on Merge         Token Distributed
```

### Investment Flow

1. **Investor** browses `/invest` and selects a project
2. **Investor** views `/invest/[slug]` roadmap with tranches
3. **Investor** funds a tranche → tokens held in 2-of-2 multisig
4. **Developer** claims a GitHub issue from the funded tranche
5. **Developer** submits PR linked to the issue
6. **Admin** merges PR → developer paid, investor receives tokens

## Database Schema

### Core Tables

| Table | Purpose |
|-------|---------|
| `funding_tranches` | Project roadmap segments with funding targets |
| `github_issues` | Cached GitHub issues for deliverables |
| `github_issue_tranches` | Links issues to tranches |
| `tokenized_repositories` | GitHub repos linked to tokens |
| `investor_allocations` | Investor stake per tranche |
| `cap_table_entries` | Token ownership records |

### Schema Details

```sql
-- Funding tranches for project roadmaps
CREATE TABLE funding_tranches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_slug VARCHAR NOT NULL,
  tranche_number INT NOT NULL,
  name VARCHAR NOT NULL,
  description TEXT,
  target_amount_gbp DECIMAL(10,2) NOT NULL,
  raised_amount_gbp DECIMAL(10,2) DEFAULT 0,
  price_per_percent DECIMAL(10,4) NOT NULL,
  equity_offered DECIMAL(5,2) NOT NULL,
  status VARCHAR DEFAULT 'upcoming', -- upcoming, open, funded, completed
  milestone_summary TEXT,
  fundraising_round_id UUID REFERENCES fundraising_rounds(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_slug, tranche_number)
);

-- GitHub issues synced from repos
CREATE TABLE github_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repo_id UUID REFERENCES tokenized_repositories(id) ON DELETE CASCADE,
  github_issue_id INT NOT NULL,
  title VARCHAR NOT NULL,
  body TEXT,
  state VARCHAR NOT NULL, -- open, closed
  html_url VARCHAR NOT NULL,
  author_login VARCHAR,
  labels JSONB DEFAULT '[]',
  assignees JSONB DEFAULT '[]',
  milestone VARCHAR,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  last_synced_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(repo_id, github_issue_id)
);

-- Many-to-many: issues to tranches
CREATE TABLE github_issue_tranches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID REFERENCES github_issues(id) ON DELETE CASCADE,
  tranche_id UUID REFERENCES funding_tranches(id) ON DELETE CASCADE,
  priority INT DEFAULT 0,
  UNIQUE(issue_id, tranche_id)
);
```

## API Endpoints

### Tranches API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/tranches` | GET | List all tranches (filter: `?project_slug=xxx`) |
| `/api/tranches` | POST | Create new tranche |
| `/api/tranches/[id]` | GET | Get tranche details |
| `/api/tranches/[id]` | PATCH | Update tranche |
| `/api/tranches/[id]` | DELETE | Delete tranche |

### Roadmap API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/projects/[slug]/roadmap` | GET | Get full roadmap with tranches and issues |

### Opportunities API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/invest/opportunities` | GET | List all investment opportunities |
| `/api/invest/opportunities/[id]/fund` | POST | Fund a tranche |

### Example: Create Tranche

```bash
curl -X POST http://localhost:3000/api/tranches \
  -H "Content-Type: application/json" \
  -d '{
    "projectSlug": "my-project",
    "trancheNumber": 1,
    "name": "Foundation",
    "description": "Project setup and core infrastructure",
    "targetAmountGbp": 999,
    "pricePerPercent": 999,
    "equityOffered": 1,
    "status": "open"
  }'
```

### Example: Get Roadmap

```bash
curl http://localhost:3000/api/projects/bitcoin-email/roadmap | jq
```

Response:
```json
{
  "projectSlug": "bitcoin-email",
  "summary": {
    "totalTranches": 10,
    "totalTargetGbp": 9990,
    "totalRaisedGbp": 100,
    "totalEquityPercent": 10,
    "fundingProgress": 1,
    "totalIssues": 29,
    "openIssues": 27,
    "closedIssues": 2,
    "issueCompletion": 6.9
  },
  "tranches": [...]
}
```

## Seed Scripts

### 1. Seed Funding Tranches

Creates 10 tranches for each project with category-specific descriptions.

**Location:** `scripts/seed-funding-tranches.ts`

**Run:**
```bash
npx ts-node --compiler-options '{"module":"commonjs"}' scripts/seed-funding-tranches.ts
```

**What it does:**
- Creates 10 tranches per project
- Tranche 1 is set to "open", rest are "upcoming"
- Each tranche offers 1% equity for £999
- Descriptions are customized by category (bitcoin-app, nft, defi, ecommerce, website)

**Standard Tranches:**

| # | Name | Description |
|---|------|-------------|
| 1 | Foundation | Project setup, architecture, core infrastructure |
| 2 | Core Features | Primary functionality and MVP features |
| 3 | User Interface | UI/UX design implementation and polish |
| 4 | Data & Storage | Database integration, state management |
| 5 | Authentication | User auth, permissions, security features |
| 6 | API & Integration | External APIs, third-party integrations |
| 7 | Blockchain | BSV blockchain integration and token functionality |
| 8 | Testing & QA | Comprehensive testing, bug fixes, optimization |
| 9 | Documentation | User guides, API docs, developer docs |
| 10 | Launch & Scale | Production deployment, monitoring, scaling |

### 2. Sync GitHub Issues

Fetches issues from GitHub and assigns them to tranches.

**Location:** `scripts/sync-github-issues.ts`

**Run:**
```bash
npx ts-node --compiler-options '{"module":"commonjs"}' scripts/sync-github-issues.ts
```

**What it does:**
- Fetches issues from bitcoin-apps-suite GitHub repos
- Creates `tokenized_repositories` entries if needed
- Syncs issue metadata (title, body, labels, state, assignees)
- Auto-assigns issues to tranches based on labels/keywords

**Issue Classification:**

| Keywords/Labels | Assigned Tranche |
|-----------------|------------------|
| setup, init, scaffold | Tranche 1: Foundation |
| feature, implement, add | Tranche 2: Core Features |
| ui, style, design | Tranche 3: User Interface |
| data, database, persist | Tranche 4: Data & Storage |
| auth, login, user | Tranche 5: Authentication |
| api, endpoint, integrate | Tranche 6: API & Integration |
| blockchain, bsv, wallet, token | Tranche 7: Blockchain |
| test, bug, fix | Tranche 8: Testing & QA |
| doc, readme, guide | Tranche 9: Documentation |
| deploy, release, publish | Tranche 10: Launch & Scale |

**Supported Repos:**

The script syncs issues from these bitcoin-apps-suite repos:

- bitcoin-email, bitcoin-drive, bitcoin-spreadsheet
- bitcoin-writer, bitcoin-music, bitcoin-art
- bitcoin-code, bitcoin-chat, bitcoin-identity
- bitcoin-photos, bitcoin-3d, bitcoin-exchange
- (and more - see script for full list)

### Adding New Projects

To add tranches for a new project:

1. Add to `projects` array in `seed-funding-tranches.ts`:
```typescript
{ slug: 'new-project', category: 'website' }
```

2. Run the seed script (will skip existing):
```bash
npx ts-node scripts/seed-funding-tranches.ts
```

### Syncing New Repos

To sync GitHub issues for a new repo:

1. Add to `bitcoinAppRepos` in `sync-github-issues.ts`:
```typescript
'project-slug': { owner: 'github-org', repo: 'repo-name', tokenSymbol: '$TOKEN' },
```

2. Run the sync script:
```bash
npx ts-node scripts/sync-github-issues.ts
```

## Frontend Pages

### /invest

Main investment opportunities listing.

**Features:**
- Grid of all projects with investment data
- Token symbols, funding progress, issue counts
- Links to individual project roadmaps

### /invest/[slug]

Individual project roadmap and investment page.

**Features:**
- Funding progress bar
- Tranche list with status indicators
- Issue completion metrics
- Detailed tranche view with GitHub issues
- "Invest in This Tranche" CTA for open tranches
- "How Tranche Investing Works" explainer

## Library Functions

**Location:** `lib/github-issue-sync.ts`

| Function | Description |
|----------|-------------|
| `fetchGitHubIssues(owner, repo)` | Fetch issues from GitHub API |
| `syncGitHubIssues(repoId, owner, repo)` | Sync issues to database |
| `getProjectRoadmap(slug)` | Get full roadmap with tranches and issues |
| `createFundingTranche(data)` | Create a new tranche |
| `updateFundingTranche(id, data)` | Update tranche details |
| `assignIssueToTranche(issueId, trancheId)` | Link issue to tranche |
| `getTrancheIssues(trancheId)` | Get issues for a tranche |

## Current Data Stats

As of 2026-01-24:

| Metric | Value |
|--------|-------|
| Total Projects with Tranches | 69 |
| Total Tranches | 690 |
| GitHub Issues Synced | 304 |
| Projects with Real Issues | 12 |

### Projects with Most Issues

| Project | Issues | Completion |
|---------|--------|------------|
| bitcoin-writer | 53 | 13% |
| bitcoin-code | 48 | varies |
| bitcoin-music | 47 | varies |
| bitcoin-art | 30 | varies |
| bitcoin-email | 29 | 7% |

## Maintenance

### Re-sync Issues (Weekly)

```bash
npx ts-node scripts/sync-github-issues.ts
```

### Add Tranches for New Projects

```bash
npx ts-node scripts/seed-funding-tranches.ts
```

### Manually Update Tranche Status

```bash
curl -X PATCH http://localhost:3000/api/tranches/[id] \
  -H "Content-Type: application/json" \
  -d '{"status": "funded"}'
```

## Related Documentation

- [FUNDING_STRATEGY.md](./FUNDING_STRATEGY.md) - Overall funding approach
- [PIPELINE_SYSTEM_SPEC.md](./PIPELINE_SYSTEM_SPEC.md) - Project pipeline workflow
- [MULTISIG_STRATEGY.md](./MULTISIG_STRATEGY.md) - Token custody approach
- [INVESTOR_CERTIFICATION_PLAN.md](./INVESTOR_CERTIFICATION_PLAN.md) - KYC/accreditation

## Troubleshooting

### Roadmap shows no tranches

Run the seed script:
```bash
npx ts-node scripts/seed-funding-tranches.ts
```

### Issues not showing in tranches

1. Check if issues were synced:
```bash
curl http://localhost:3000/api/projects/[slug]/roadmap | jq '.summary.totalIssues'
```

2. If 0, run the sync script:
```bash
npx ts-node scripts/sync-github-issues.ts
```

### GitHub API rate limiting

Add a `GITHUB_TOKEN` to your environment for higher rate limits:
```bash
export GITHUB_TOKEN=ghp_xxxxx
npx ts-node scripts/sync-github-issues.ts
```

### New project not appearing in /invest

Ensure the project exists in `lib/data.ts` with correct slug, then run:
```bash
npx ts-node scripts/seed-funding-tranches.ts
```
