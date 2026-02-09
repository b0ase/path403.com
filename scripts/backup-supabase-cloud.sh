#!/bin/bash

# Supabase Cloud Database Backup Script
# This script exports the current production database from Supabase Cloud
# Run this BEFORE migrating to bDatabase

set -e  # Exit on error

echo "🗄️  Supabase Cloud Database Backup"
echo "=================================="
echo ""

# Configuration
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
PROJECT_REF="self-hosted"  # Migration complete - now using api.b0ase.com

# Create backup directory
mkdir -p $BACKUP_DIR

echo "📁 Backup directory: $BACKUP_DIR"
echo "🕐 Timestamp: $TIMESTAMP"
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found!"
    echo "Install with: brew install supabase/tap/supabase"
    exit 1
fi

echo "✅ Supabase CLI found"
echo ""

# Login check
echo "🔐 Checking Supabase authentication..."
if ! supabase projects list &> /dev/null; then
    echo "⚠️  Not logged in to Supabase"
    echo "Running: supabase login"
    supabase login
fi

echo "✅ Authenticated"
echo ""

# Link to project (if not already linked)
echo "🔗 Linking to project: $PROJECT_REF"
supabase link --project-ref $PROJECT_REF 2>/dev/null || echo "Already linked or manual linking required"
echo ""

# Export schema
echo "📤 Exporting database schema..."
SCHEMA_FILE="$BACKUP_DIR/supabase_cloud_schema_$TIMESTAMP.sql"
supabase db dump --schema public > "$SCHEMA_FILE"
echo "✅ Schema exported: $SCHEMA_FILE"
echo ""

# Export data
echo "📤 Exporting database data..."
DATA_FILE="$BACKUP_DIR/supabase_cloud_data_$TIMESTAMP.sql"
supabase db dump --data-only > "$DATA_FILE"
echo "✅ Data exported: $DATA_FILE"
echo ""

# Create combined backup
echo "📤 Creating combined backup..."
COMBINED_FILE="$BACKUP_DIR/supabase_cloud_full_$TIMESTAMP.sql"
cat "$SCHEMA_FILE" "$DATA_FILE" > "$COMBINED_FILE"
echo "✅ Combined backup: $COMBINED_FILE"
echo ""

# Get file sizes
SCHEMA_SIZE=$(du -h "$SCHEMA_FILE" | cut -f1)
DATA_SIZE=$(du -h "$DATA_FILE" | cut -f1)
COMBINED_SIZE=$(du -h "$COMBINED_FILE" | cut -f1)

echo "📊 Backup Summary"
echo "================="
echo "Schema file: $SCHEMA_SIZE"
echo "Data file: $DATA_SIZE"
echo "Combined file: $COMBINED_SIZE"
echo ""

# Create backup manifest
MANIFEST_FILE="$BACKUP_DIR/backup_manifest_$TIMESTAMP.txt"
cat > "$MANIFEST_FILE" << EOF
Supabase Cloud Backup Manifest
==============================

Backup Date: $(date)
Project Ref: $PROJECT_REF
Project URL: https://$PROJECT_REF.supabase.co

Files:
- Schema: $SCHEMA_FILE ($SCHEMA_SIZE)
- Data: $DATA_FILE ($DATA_SIZE)
- Combined: $COMBINED_FILE ($COMBINED_SIZE)

Next Steps:
1. Verify backup integrity
2. Import to bDatabase:
   PGPASSWORD=REDACTED_DB_PASSWORD \\
   psql -h REDACTED_HOST -p 54322 -U postgres -d b0ase_com \\
   < $COMBINED_FILE

3. Verify data in bDatabase
4. Update .env.local to point to bDatabase
5. Test all features

Rollback:
If migration fails, b0ase.com is still pointing to Supabase Cloud.
Simply don't update the environment variables.
EOF

echo "✅ Manifest created: $MANIFEST_FILE"
echo ""

echo "🎉 Backup Complete!"
echo ""
echo "Next steps:"
echo "1. Verify backup files in $BACKUP_DIR"
echo "2. Run: cat $MANIFEST_FILE"
echo "3. Proceed with Phase 2 (Database Migration)"
echo ""
