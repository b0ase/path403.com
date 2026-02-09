#!/bin/bash

# Restart Supabase with new configuration
# This script stops and restarts local Supabase to apply config changes

set -e

echo "🔄 Restarting Supabase..."
echo ""

# Check if Supabase CLI is available
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Install it with:"
    echo "   brew install supabase/tap/supabase"
    exit 1
fi

# Stop Supabase
echo "⏹️  Stopping Supabase..."
pnpm supabase stop || true

echo ""
echo "⏳ Waiting 3 seconds..."
sleep 3
echo ""

# Start Supabase
echo "▶️  Starting Supabase with new configuration..."
pnpm supabase start

echo ""
echo "✅ Supabase restarted successfully!"
echo ""
echo "📋 Next steps:"
echo "   1. Update GitHub OAuth App callback URL to: https://api.b0ase.com/auth/v1/callback"
echo "   2. Test connection at: https://b0ase.com/user/account?tab=repos"
echo ""
echo "🔧 To view auth logs:"
echo "   pnpm supabase logs auth"
echo ""
echo "🔍 To debug GitHub OAuth:"
echo "   npx tsx scripts/debug-github-oauth.ts"
echo ""
