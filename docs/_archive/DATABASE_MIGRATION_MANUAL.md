# Manual Database Migration Guide

Since automated backup requires Supabase CLI login, here are alternative approaches:

## Option 1: Export from Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard**
   - URL: https://api.b0ase.com (self-hosted, migration complete)
   - Login with your credentials

2. **Navigate to Database Settings**
   - Click "Database" in left sidebar
   - Click "Backups" tab

3. **Create Manual Backup**
   - Click "Start a backup"
   - Wait for backup to complete
   - Download the backup file

4. **Save backup**
   ```bash
   # Save downloaded file to:
   /Users/b0ase/Projects/b0ase.com/backups/supabase_backup_manual.sql
   ```

---

## Option 2: Use Supabase Connection Pooler (Direct SQL Export)

If Supabase provides direct PostgreSQL access:

1. **Get Connection String from Supabase Dashboard**
   - Go to Project Settings > Database
   - Copy the "Connection string" (with password)

2. **Export using pg_dump** (requires PostgreSQL client tools)
   ```bash
   # Install PostgreSQL client if needed
   brew install postgresql

   # Export database (replace [PASSWORD] and [HOST])
   pg_dump "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" \
     > backups/supabase_manual_$(date +%Y%m%d).sql
   ```

---

## Option 3: Skip Backup (If Database is Empty or Expendable)

If your current Supabase Cloud database is:
- Empty or has no important data
- Just for development/testing
- Can be recreated

Then we can skip the backup and just set up fresh schema in bDatabase.

---

## Option 4: Use Supabase CLI with Access Token

If you have a Supabase access token:

```bash
# Set access token
export SUPABASE_ACCESS_TOKEN="your-token-here"

# Run backup script
./scripts/backup-supabase-cloud.sh
```

**To get access token**:
1. Go to https://app.supabase.com/account/tokens
2. Create new access token
3. Copy token and use in command above

---

## Which Option Should We Use?

**Tell me:**
1. Do you have important data in Supabase Cloud that needs to be backed up?
2. If yes, which option would you prefer?
3. If no, we can proceed with fresh schema setup in bDatabase

**If uncertain**, Option 1 (Dashboard export) is safest and easiest.
