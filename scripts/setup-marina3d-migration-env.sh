#!/bin/bash

# Marina3D Database Migration Environment Setup
# This script helps set up environment variables for Marina3D database migration

echo "🔧 Setting up Marina3D database migration environment..."

# Marina3D Database Configuration
echo "Please provide the following information for the Marina3D database:"
echo ""

# Get Marina3D service key
read -p "Enter Marina3D Supabase Service Role Key: " MARINA3D_SERVICE_KEY

if [ -z "$MARINA3D_SERVICE_KEY" ]; then
    echo "❌ Marina3D service key is required!"
    echo "You can find it in the Marina3D Supabase dashboard under Settings > API"
    exit 1
fi

# Export environment variables
export MARINA3D_SUPABASE_URL="https://lokglgrszeupwnjjnner.supabase.co"
export MARINA3D_SUPABASE_SERVICE_KEY="$MARINA3D_SERVICE_KEY"

# B0ase database configuration (already set up)
export B0ASE_SUPABASE_URL="https://api.b0ase.com"
export B0ASE_SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsYXB1dHp4ZXFneXBwaHpkeHByIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjIwNzAwMywiZXhwIjoyMDYxNzgzMDAzfQ.q7BSh0OmgNZKQYqDFYYy1CVRojdJmktijYPK88kwEgQ"

echo ""
echo "✅ Environment variables set successfully!"
echo ""
echo "📋 Configuration Summary:"
echo "  Marina3D Database URL: $MARINA3D_SUPABASE_URL"
echo "  Marina3D Service Key: ${MARINA3D_SERVICE_KEY:0:20}..."
echo "  B0ase Database URL: $B0ASE_SUPABASE_URL"
echo "  B0ase Service Key: ${B0ASE_SUPABASE_SERVICE_KEY:0:20}..."
echo ""
echo "🚀 Ready to run Marina3D database migration!"
echo ""
echo "Next steps:"
echo "1. Run: node scripts/analyze-marina3d-database.js"
echo "2. Review the analysis results"
echo "3. Run: node scripts/migrate-marina3d-database.js"
echo ""
echo "💡 Tip: You can save these environment variables to your shell profile:"
echo "  echo 'export MARINA3D_SUPABASE_SERVICE_KEY=\"$MARINA3D_SERVICE_KEY\"' >> ~/.zshrc"
echo "  source ~/.zshrc" 