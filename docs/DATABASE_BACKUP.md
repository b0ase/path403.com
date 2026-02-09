# Database Backup System

## Overview

b0ase.com has an automated daily backup system that:
- Runs daily at 3 AM UTC via Vercel Cron
- Backs up 26 critical tables to JSON format
- Stores backups in Supabase Storage (`backups` bucket)
- Automatically deletes backups older than 7 days

## Backup Schedule

| Job | Schedule | Endpoint |
|-----|----------|----------|
| Daily Backup | `0 3 * * *` (3 AM UTC) | `/api/cron/database-backup` |

## Manual Operations

### Trigger a Backup Manually

```bash
curl "https://b0ase.com/api/cron/database-backup?secret=YOUR_CRON_SECRET"
```

### List Existing Backups

```bash
curl -X POST "https://b0ase.com/api/cron/database-backup" \
  -H "Content-Type: application/json" \
  -d '{"secret":"YOUR_CRON_SECRET","action":"list"}'
```

### Check Database Size

```bash
curl -X POST "https://b0ase.com/api/cron/database-backup" \
  -H "Content-Type: application/json" \
  -d '{"secret":"YOUR_CRON_SECRET","action":"size"}'
```

## Tables Backed Up

The following tables are included in each backup:

**Core User Data:**
- `profiles`
- `user_wallets`

**Agent System:**
- `agents`
- `agent_tasks`
- `agent_inscriptions`
- `agent_conversations`
- `agent_messages`

**Content:**
- `projects`
- `blog_posts`
- `blog_categories`
- `content_ideas`
- `clients`
- `Audio`
- `Video`
- `AutoBook`
- `AutoBookChapter`

**Token System:**
- `identity_tokens`
- `token_market_data`
- `token_trades`
- `developer_token_holders`

**Contracts & Marketplace:**
- `service_contracts`
- `contract_milestones`
- `contract_escrow`

**Governance:**
- `boardroom_proposals`
- `boardroom_votes`
- `boardroom_members`

## Backup Storage

Backups are stored in Supabase Storage:
- **Bucket:** `backups`
- **Format:** JSON (compressed)
- **Naming:** `backup-YYYY-MM-DDTHH-MM-SS-SSSZ.json`
- **Retention:** 7 days

## Restoring from Backup

To restore data from a backup:

1. Download the backup file from Supabase Storage
2. Parse the JSON structure
3. Use Prisma or direct SQL to restore tables

**Note:** Full restore functionality is not yet automated. Contact the admin for restore assistance.

## Configuration

The backup system uses these environment variables:
- `CRON_SECRET` - Authentication for cron endpoints
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key with full access

## Monitoring

Check backup status:
1. Vercel Dashboard → Functions → `/api/cron/database-backup`
2. Supabase Dashboard → Storage → `backups` bucket
3. List backups via API (see above)

---

**Last Updated:** 2026-01-23
