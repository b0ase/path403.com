#!/bin/bash

# Database Migration Environment Setup Script
# This script helps you set up environment variables for the vexvoid → b0ase migration

echo "🔧 Database Migration Environment Setup"
echo "========================================"
echo ""

# Check if .env file exists
if [ -f ".env" ]; then
    echo "📁 Found existing .env file"
    source .env
else
    echo "📁 No .env file found, creating one..."
    touch .env
fi

echo ""
echo "Please provide your database configuration:"
echo ""

# Vexvoid configuration
echo "🌐 VEXVOID DATABASE CONFIGURATION"
echo "---------------------------------"
read -p "Vexvoid Supabase URL (e.g., https://your-project.supabase.co): " VEXVOID_URL
read -p "Vexvoid Service Key: " VEXVOID_SERVICE_KEY
read -p "Vexvoid Anon Key (optional): " VEXVOID_ANON_KEY

echo ""
echo "🌐 B0ASE DATABASE CONFIGURATION"
echo "-------------------------------"
read -p "B0ase Supabase URL (default: https://klaputzxeqgy.supabase.co): " B0ASE_URL
B0ASE_URL=${B0ASE_URL:-"https://klaputzxeqgy.supabase.co"}
read -p "B0ase Service Key: " B0ASE_SERVICE_KEY
read -p "B0ase Anon Key (optional): " B0ASE_ANON_KEY

echo ""
echo "📝 Writing configuration to .env file..."

# Write to .env file
cat > .env << EOF
# Vexvoid Database Configuration
VEXVOID_SUPABASE_URL=${VEXVOID_URL}
VEXVOID_SUPABASE_SERVICE_KEY=${VEXVOID_SERVICE_KEY}
VEXVOID_SUPABASE_ANON_KEY=${VEXVOID_ANON_KEY}

# B0ase Database Configuration
B0ASE_SUPABASE_URL=${B0ASE_URL}
B0ASE_SUPABASE_SERVICE_KEY=${B0ASE_SERVICE_KEY}
B0ASE_SUPABASE_ANON_KEY=${B0ASE_ANON_KEY}
EOF

echo "✅ Configuration saved to .env file"
echo ""

# Export variables for current session
export VEXVOID_SUPABASE_URL=${VEXVOID_URL}
export VEXVOID_SUPABASE_SERVICE_KEY=${VEXVOID_SERVICE_KEY}
export VEXVOID_SUPABASE_ANON_KEY=${VEXVOID_ANON_KEY}
export B0ASE_SUPABASE_URL=${B0ASE_URL}
export B0ASE_SUPABASE_SERVICE_KEY=${B0ASE_SERVICE_KEY}
export B0ASE_SUPABASE_ANON_KEY=${B0ASE_ANON_KEY}

echo "🚀 Environment variables exported for current session"
echo ""
echo "Next steps:"
echo "1. Run: node scripts/analyze-vexvoid-database.js"
echo "2. Review the analysis results"
echo "3. Run: node scripts/consolidate-vexvoid-database.js"
echo ""
echo "💡 Tip: You can also source this file in future sessions:"
echo "   source .env" 