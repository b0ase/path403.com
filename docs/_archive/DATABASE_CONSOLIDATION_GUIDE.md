# Database Consolidation Guide: Vexvoid → B0ase

This guide will help you consolidate your vexvoid.com database into your b0ase.com database to save money on database costs.

## Prerequisites

1. **Supabase CLI installed** (if not already installed):
   ```bash
   npm install -g supabase
   ```

2. **Access to both databases**:
   - Vexvoid.com Supabase project URL and service key
   - B0ase.com Supabase project URL and service key

## Step 1: Analyze Your Vexvoid Database

First, let's see what's actually in your vexvoid database:

1. **Set environment variables**:
   ```bash
   export VEXVOID_SUPABASE_URL="https://your-vexvoid-project.supabase.co"
   export VEXVOID_SUPABASE_SERVICE_KEY="your-vexvoid-service-key"
   ```

2. **Run the analysis script**:
   ```bash
   node scripts/analyze-vexvoid-database.js
   ```

This will show you:
- How many tables exist (if any)
- How many storage buckets exist
- How many files are in each bucket
- Any custom schemas

## Step 2: Plan Your Migration

Based on the analysis results:

### If vexvoid only has storage buckets:
- ✅ **Easy migration** - Just migrate the storage buckets
- No database schema changes needed
- Update your vexvoid application to use b0ase database URLs

### If vexvoid has tables:
- ⚠️ **More complex** - Need to migrate both data and schema
- Tables will be prefixed with `vexvoid_` to avoid conflicts
- You may need to update your application code

## Step 3: Run the Full Migration

1. **Set both database configurations**:
   ```bash
   export VEXVOID_SUPABASE_URL="https://your-vexvoid-project.supabase.co"
   export VEXVOID_SUPABASE_SERVICE_KEY="your-vexvoid-service-key"
   export B0ASE_SUPABASE_URL="https://klaputzxeqgy.supabase.co"
   export B0ASE_SUPABASE_SERVICE_KEY="your-b0ase-service-key"
   ```

2. **Run the consolidation script**:
   ```bash
   node scripts/consolidate-vexvoid-database.js
   ```

This script will:
- ✅ Analyze the vexvoid database structure
- ✅ Generate migration SQL for any tables
- ✅ Migrate all storage buckets and files
- ✅ Create detailed logs of the process

## Step 4: Update Your Application Configuration

### For Storage-Only Migration:

1. **Update vexvoid application environment variables**:
   ```env
   # Change from vexvoid to b0ase
   SUPABASE_URL=https://klaputzxeqgy.supabase.co
   SUPABASE_ANON_KEY=your-b0ase-anon-key
   SUPABASE_SERVICE_KEY=your-b0ase-service-key
   ```

2. **Update any hardcoded URLs** in your vexvoid application

### For Full Database Migration:

1. **Apply the generated SQL migration** (if tables exist):
   ```bash
   # The script generates a file like: vexvoid-migration-2024-01-15T10-30-00-000Z.sql
   # Review this file and apply it to your b0ase database
   ```

2. **Update your application code** to use the new table names (prefixed with `vexvoid_`)

## Step 5: Verify the Migration

1. **Check storage buckets** in your b0ase.com Supabase dashboard
2. **Verify files are accessible** from your vexvoid application
3. **Test any database queries** if tables were migrated

## Step 6: Clean Up

1. **Update DNS/domain settings** to point vexvoid.com to use b0ase database
2. **Delete the old vexvoid Supabase project** (after confirming everything works)
3. **Update any documentation** or deployment scripts

## Troubleshooting

### Common Issues:

1. **"Bucket already exists" errors**:
   - The script handles this automatically by using `upsert: true`
   - Files will be overwritten if they have the same name

2. **Permission errors**:
   - Ensure you're using the service key (not anon key) for migrations
   - Check that your service key has the necessary permissions

3. **Large file uploads failing**:
   - The script processes files one by one
   - Check the error logs for specific file failures

### Getting Help:

- Check the generated log files: `migration-log-*.txt`
- Check error files: `migration-errors-*.txt`
- Review the SQL migration file if tables exist

## Cost Savings

After consolidation:
- ✅ **One database instead of two** = ~50% cost reduction
- ✅ **Simplified infrastructure** = easier maintenance
- ✅ **Unified data management** = better analytics

## Security Considerations

1. **Review RLS policies** on migrated storage buckets
2. **Update any bucket-specific permissions**
3. **Ensure proper access controls** are in place
4. **Test authentication flows** with the new database

## Next Steps

1. **Monitor the consolidated database** for performance
2. **Consider implementing data archiving** for old files
3. **Set up automated backups** for the consolidated database
4. **Document the new architecture** for your team

---

**Need help?** Check the generated logs and error files for specific issues, or refer to the Supabase documentation for more detailed migration guidance. 