#!/bin/bash

# Redirect URLs Optimization Script
# This script helps you implement the optimized redirect URL configuration

echo "🚀 b0ase.com Redirect URLs Optimization"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Current Status Analysis:${NC}"
echo "✅ Supabase auth callback handler: /app/auth/callback/route.ts"
echo "✅ Google OAuth callback handler: /app/api/auth/google/callback/route.ts"
echo ""

echo -e "${YELLOW}📋 OPTIMIZED REDIRECT URLS TO CONFIGURE:${NC}"
echo ""

echo -e "${GREEN}🔹 SUPABASE REDIRECT URLs (keep only these 3):${NC}"
echo "   Development: http://localhost:3000/auth/callback"
echo "   Production:  https://b0ase.com/auth/callback"
echo "   Optional:    https://*.vercel.app/auth/callback"
echo ""

echo -e "${GREEN}🔹 GOOGLE OAUTH REDIRECT URLs (keep only these 2):${NC}"
echo "   Development: http://localhost:3000/api/auth/google/callback"
echo "   Production:  https://b0ase.com/api/auth/google/callback"
echo ""

echo -e "${RED}🗑️  REMOVE THESE URLS:${NC}"
echo ""
echo -e "${RED}From Supabase:${NC}"
echo "   ❌ http://localhost:3000/** (too broad)"
echo "   ❌ https://b0ase.com/** (too broad)"
echo "   ❌ http://localhost:3001 (unused port)"
echo "   ❌ http://localhost:3002 (unused port)"
echo "   ❌ http://localhost:3003 (unused port)"
echo "   ❌ All specific Vercel deployment URLs"
echo ""

echo -e "${RED}From Google OAuth:${NC}"
echo "   ❌ All localhost URLs except port 3000"
echo "   ❌ All specific Vercel deployment URLs"
echo ""

echo -e "${BLUE}📝 IMPLEMENTATION STEPS:${NC}"
echo ""
echo "1. 🔧 Update Supabase Settings:"
echo "   → Go to: https://supabase.com/dashboard/project/[your-project]/auth/url-configuration"
echo "   → Remove all existing redirect URLs"
echo "   → Add the 3 recommended URLs above"
echo ""

echo "2. 🔧 Update Google OAuth Settings:"
echo "   → Go to: https://console.cloud.google.com/apis/credentials"
echo "   → Select your OAuth 2.0 Client ID"
echo "   → Remove all existing authorized redirect URIs"
echo "   → Add the 2 recommended URLs above"
echo ""

echo "3. 🧪 Test the changes:"
echo "   → Test login/signup on localhost:3000"
echo "   → Test login/signup on b0ase.com"
echo "   → Test Google OAuth flows"
echo "   → Verify no redirect_uri_mismatch errors"
echo ""

echo -e "${YELLOW}⚠️  SAFETY TIPS:${NC}"
echo "• Keep a backup of your current URLs before removing them"
echo "• Test in development first, then apply to production"
echo "• If something breaks, you can quickly restore the old URLs"
echo ""

echo -e "${GREEN}💡 BENEFITS OF THIS OPTIMIZATION:${NC}"
echo "• 🛡️  Enhanced Security (reduced attack surface)"
echo "• 🔧 Easier Maintenance"
echo "• 📊 Consistent Callback Patterns"
echo "• 🐛 Simplified Debugging"
echo ""

# Check if environment variables are properly set
echo -e "${BLUE}🔍 Environment Check:${NC}"

if [ -f ".env.local" ]; then
    echo "✅ .env.local file found"
    
    if grep -q "GOOGLE_CLIENT_ID" .env.local; then
        echo "✅ GOOGLE_CLIENT_ID configured"
    else
        echo "⚠️  GOOGLE_CLIENT_ID not found in .env.local"
    fi
    
    if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local; then
        echo "✅ NEXT_PUBLIC_SUPABASE_URL configured"
    else
        echo "⚠️  NEXT_PUBLIC_SUPABASE_URL not found in .env.local"
    fi
else
    echo "⚠️  .env.local file not found"
fi

echo ""
echo -e "${GREEN}🎯 Ready to optimize your redirect URLs!${NC}"
echo "Follow the steps above to implement the changes."
echo "" 