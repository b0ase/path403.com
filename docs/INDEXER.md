# PATH402 Indexer

A lightweight, self-hosted BSV-20 token indexer for PATH402.

## Overview

The indexer watches the treasury address for outgoing BSV-20 transfers and records them in the database. This eliminates dependency on third-party indexers (like GorillaPool) which can be slow to update.

```
Treasury Address ──────────────────────────────────────┐
       │                                               │
       ▼                                               │
   WhatsOnChain API                                    │
       │                                               │
       ▼                                               │
┌──────────────────┐     ┌─────────────────────────────┴───┐
│ PATH402 Indexer  │────▶│ path402_transfers table         │
│ (polls every 30s)│     │ - holder_id                     │
└──────────────────┘     │ - to_address                    │
                         │ - amount                        │
                         │ - tx_id                         │
                         │ - status                        │
                         └─────────────────────────────────┘
```

## Why We Need Our Own Indexer

1. **Third-party indexers are slow** - GorillaPool can take hours/days to index new transfers
2. **No dependency** - We control the infrastructure
3. **Real-time updates** - 30-second polling vs waiting for external indexers
4. **Simple** - ~150 lines of JavaScript, easy to maintain

## Infrastructure

The indexer runs on the Hetzner VPS alongside Supabase:

```
Hetzner VPS (ubuntu-4gb-hel1-1)
├── Supabase (Docker)
│   ├── supabase-db (PostgreSQL)
│   ├── supabase-api (PostgREST)
│   └── supabase-auth (GoTrue)
└── path402-indexer (systemd service)
```

## Configuration

| Setting | Value |
|---------|-------|
| Treasury Address | `1BrbnQon4uZPSxNwt19ozwtgHPDbgvaeD1` |
| Token Tick | `$402` |
| Poll Interval | 30 seconds |
| API | WhatsOnChain (mainnet) |

## Files

```
indexer/
├── index.js                    # Main indexer script
├── package.json                # Dependencies
├── path402-indexer.service     # systemd service file
└── deploy.sh                   # Deployment script
```

## Management Commands

```bash
# Check status
ssh hetzner 'systemctl status path402-indexer'

# View logs (live)
ssh hetzner 'sudo journalctl -u path402-indexer -f'

# View recent logs
ssh hetzner 'sudo journalctl -u path402-indexer -n 50'

# Restart
ssh hetzner 'sudo systemctl restart path402-indexer'

# Stop
ssh hetzner 'sudo systemctl stop path402-indexer'

# Start
ssh hetzner 'sudo systemctl start path402-indexer'

# Disable autostart
ssh hetzner 'sudo systemctl disable path402-indexer'
```

## Deployment

To redeploy after changes:

```bash
cd indexer
./deploy.sh
```

The script:
1. Copies files to `/opt/path402-indexer` on Hetzner
2. Installs npm dependencies
3. Restarts the systemd service

## Database Schema

The indexer writes to the `path402_transfers` table:

```sql
CREATE TABLE path402_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  holder_id UUID REFERENCES path402_holders(id),
  to_address TEXT NOT NULL,
  amount BIGINT NOT NULL,
  tx_id TEXT NOT NULL,
  status TEXT DEFAULT 'confirmed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_transfers_holder ON path402_transfers(holder_id);
CREATE INDEX idx_transfers_address ON path402_transfers(to_address);
```

## How It Works

1. **Poll Treasury** - Every 30 seconds, fetch recent transactions from treasury address via WhatsOnChain
2. **Parse Transactions** - Look for BSV-20 transfer inscriptions in outputs
3. **Extract Data** - Parse the JSON payload: `{"p":"bsv-21","op":"transfer","tick":"$402","amt":"..."}`
4. **Match Holder** - Look up the recipient address in `user_wallets` to find the holder
5. **Record Transfer** - Insert into `path402_transfers` if not already recorded

## Balance Calculation

The `/api/token/holding` endpoint now uses tracked transfers as a fallback:

```
User Balance = Database Balance + max(Indexer Balance, Tracked Transfers)
```

This ensures users see their correct balance even before third-party indexers catch up.

## Monitoring

Check the indexer is healthy:

```bash
# Should show "active (running)"
ssh hetzner 'systemctl status path402-indexer | grep Active'

# Should show recent polling activity
ssh hetzner 'sudo journalctl -u path402-indexer -n 5 --no-pager'
```

Expected log output:
```
[2026-02-03T08:58:31.611Z] Polling treasury...
[2026-02-03T08:59:02.071Z] Polling treasury...
Recorded transfer: 9090909 to 17Rw7n5z3qrYdbu6r6zzU5hfxPgHorMZBh (tx: ecfa123334e3...)
```

## Troubleshooting

### Indexer not starting

```bash
# Check for errors
ssh hetzner 'sudo journalctl -u path402-indexer -n 100 --no-pager | tail -50'

# Check environment file exists
ssh hetzner 'cat /opt/path402-indexer/.env'

# Try running manually
ssh hetzner 'cd /opt/path402-indexer && node index.js'
```

### Missing transfers

1. Check the transaction exists on WhatsOnChain
2. Verify it's from the treasury address
3. Verify it contains a valid BSV-20 transfer inscription
4. Check the `path402_transfers` table for existing entry

```bash
ssh hetzner "docker exec supabase-db psql -U postgres -d postgres -c \"SELECT * FROM path402_transfers ORDER BY created_at DESC LIMIT 10;\""
```

### Database connection issues

```bash
# Test Supabase connection
ssh hetzner 'curl -s http://localhost:8000/rest/v1/ -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU"'
```

## Future Improvements

- [ ] WebSocket connection for real-time tx monitoring (instead of polling)
- [ ] Track all BSV-21 tokens, not just $402
- [ ] Alert on large transfers
- [ ] Sync historical transfers on startup
- [ ] Health check endpoint
