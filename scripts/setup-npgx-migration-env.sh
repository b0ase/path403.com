#!/bin/bash

# NPGX Database Migration Environment Setup
# This script helps set up environment variables for NPGX database migration

echo "🔧 Setting up NPGX database migration environment..."

# NPGX Database Configuration
echo "Please provide the following information for the NPGX database:"
echo ""

# Get NPGX service key
read -p "Enter NPGX Supabase Service Role Key: " NPGX_SERVICE_KEY

if [ -z "$NPGX_SERVICE_KEY" ]; then
    echo "❌ NPGX service key is required!"
    echo "You can find it in the NPGX Supabase dashboard under Settings > API"
    exit 1
fi

# Export environment variables
export NPGX_SUPABASE_URL="https://fthpedywgwpygrfqliqf.supabase.co"
export NPGX_SUPABASE_SERVICE_KEY="$NPGX_SERVICE_KEY"

# B0ase database configuration (already set up)
export B0ASE_SUPABASE_URL="https://api.b0ase.com"
export B0ASE_SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsYXB1dHp4ZXFneXBwaHpkeHByIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjIwNzAwMywiZXhwIjoyMDYxNzgzMDAzfQ.q7BSh0OmgNZKQYqDFYYy1CVRojdJmktijYPK88kwEgQ"

echo ""
echo "✅ Environment variables set successfully!"
echo ""
echo "📋 Configuration Summary:"
echo "  NPGX Database URL: $NPGX_SUPABASE_URL"
echo "  NPGX Service Key: ${NPGX_SERVICE_KEY:0:20}..."
echo "  B0ase Database URL: $B0ASE_SUPABASE_URL"
echo "  B0ase Service Key: ${B0ASE_SUPABASE_SERVICE_KEY:0:20}..."
echo ""
echo "🚀 Ready to run NPGX database migration!"
echo ""
echo "Next steps:"
echo "1. Run: node scripts/analyze-npgx-database.js"
echo "2. Review the analysis results"
echo "3. Run: node scripts/migrate-npgx-database.js"
echo ""
echo "💡 Tip: You can save these environment variables to your shell profile:"
echo "  echo 'export NPGX_SUPABASE_SERVICE_KEY=\"$NPGX_SERVICE_KEY\"' >> ~/.zshrc"
echo "  source ~/.zshrc" 