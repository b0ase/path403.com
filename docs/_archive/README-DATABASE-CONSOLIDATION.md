# Database Consolidation: Vexvoid → B0ase

## 🎯 Goal
Consolidate your vexvoid.com database into b0ase.com to save money on database costs.

## 🚀 Quick Start

### 1. Setup Environment
```bash
./scripts/setup-migration-env.sh
```

### 2. Analyze Vexvoid Database
```bash
node scripts/analyze-vexvoid-database.js
```

### 3. Run Full Migration
```bash
node scripts/consolidate-vexvoid-database.js
```

## 📁 Files Created

- `scripts/analyze-vexvoid-database.js` - Quick analysis of vexvoid database
- `scripts/consolidate-vexvoid-database.js` - Full migration script
- `scripts/setup-migration-env.sh` - Environment setup helper
- `docs/DATABASE_CONSOLIDATION_GUIDE.md` - Detailed step-by-step guide

## 💰 Expected Cost Savings

- **~50% reduction** in database costs
- **Simplified infrastructure** management
- **Unified data** for better analytics

## 🔍 What the Scripts Do

### Analysis Script
- ✅ Checks for tables in vexvoid database
- ✅ Lists all storage buckets and file counts
- ✅ Identifies custom schemas
- ✅ Provides migration recommendations

### Migration Script
- ✅ Analyzes complete database structure
- ✅ Generates SQL migration for any tables
- ✅ Migrates all storage buckets and files
- ✅ Creates detailed logs and error reports
- ✅ Handles conflicts and errors gracefully

## 📊 Current B0ase Database Structure

Your b0ase.com database already has:
- **15+ tables** including projects, teams, user profiles, etc.
- **Comprehensive user management** system
- **Role-based permissions** system
- **AI character management** system
- **Project management** features

## ⚠️ Important Notes

1. **Storage buckets** will be migrated with all files
2. **Tables** (if any) will be prefixed with `vexvoid_` to avoid conflicts
3. **Service keys** are required for migration (not anon keys)
4. **Backup** your vexvoid database before migration
5. **Test** the migration on a staging environment first

## 🆘 Need Help?

1. Check the generated log files: `migration-log-*.txt`
2. Review error files: `migration-errors-*.txt`
3. Read the detailed guide: `docs/DATABASE_CONSOLIDATION_GUIDE.md`
4. Check Supabase documentation for additional help

## 🔄 After Migration

1. Update vexvoid application to use b0ase database URLs
2. Test all functionality thoroughly
3. Delete the old vexvoid Supabase project
4. Update any documentation or deployment scripts

---

**Ready to save money?** Start with the analysis script to see what's in your vexvoid database! 