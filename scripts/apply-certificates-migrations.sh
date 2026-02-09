#!/bin/bash

# Apply certificates migrations to Hetzner Supabase server
set -e

HOST="root@5.78.77.125"
KEY="$HOME/.ssh/hetzner"
MIGRATION_1="supabase/migrations/20260128000000_add_image_data_to_signatures.sql"
MIGRATION_2="supabase/migrations/20260128000001_create_certificates_table.sql"

if [ ! -f "$KEY" ]; then
    echo "❌ SSH key not found: $KEY"
    exit 1
fi

echo "🚀 Applying migrations to Hetzner..."

# copy files
echo "📦 Uploading migrations..."
scp -i "$KEY" "$MIGRATION_1" "$HOST":/tmp/mig_1.sql
scp -i "$KEY" "$MIGRATION_2" "$HOST":/tmp/mig_2.sql

# apply
echo "⚙️  Applying migrations..."
ssh -i "$KEY" "$HOST" << 'EOF'
    echo "Applying mig_1.sql..."
    docker exec -i supabase-db psql -U supabase_admin -d postgres < /tmp/mig_1.sql
    
    echo "Applying mig_2.sql..."
    docker exec -i supabase-db psql -U supabase_admin -d postgres < /tmp/mig_2.sql

    # Cleanup
    rm /tmp/mig_1.sql /tmp/mig_2.sql
    
    echo "✅ Migrations applied!"
EOF
