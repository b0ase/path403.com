#!/bin/bash

# Apply database migration to Hetzner Supabase server
# This script uploads and applies the migration to fix multiple OAuth providers

set -e

MIGRATION_FILE="supabase/migrations/20260117000000_fix_multiple_oauth_providers.sql"

if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ Migration file not found: $MIGRATION_FILE"
    exit 1
fi

echo "🚀 Applying migration to Hetzner Supabase server..."
echo ""
echo "Migration: Fix multiple OAuth providers"
echo "File: $MIGRATION_FILE"
echo ""

# Copy migration to server
echo "📦 Uploading migration file..."
scp "$MIGRATION_FILE" hetzner:/tmp/fix_oauth_migration.sql

# Apply migration
echo "⚙️  Applying migration to database..."
ssh hetzner << 'EOF'
    # Apply the migration using docker exec
    docker exec -i supabase-db psql -U supabase_admin -d postgres < /tmp/fix_oauth_migration.sql

    # Verify the constraint was updated
    echo ""
    echo "🔍 Verifying new constraint..."
    docker exec supabase-db psql -U supabase_admin -d postgres -c "
        SELECT conname, contype, pg_get_constraintdef(oid)
        FROM pg_constraint
        WHERE conrelid = 'user_identities'::regclass
        AND contype = 'u';
    "

    # Clean up
    rm /tmp/fix_oauth_migration.sql

    echo ""
    echo "✅ Migration applied successfully!"
EOF

echo ""
echo "🎉 Done! You can now link multiple OAuth providers."
echo ""
echo "Next steps:"
echo "  1. Go to: http://localhost:3000/user/account?tab=connections"
echo "  2. Click 'Connect Discord'"
echo "  3. After OAuth, Discord should show as connected!"
echo ""
