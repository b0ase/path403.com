#!/bin/bash

# Production Auth Fix Script for b0ase.com
# This script helps diagnose and fix production authentication issues

echo "🚨 b0ase.com Production Auth Emergency Fix"
echo "========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${RED}🔥 PRODUCTION AUTH IS BROKEN - LET'S FIX IT${NC}"
echo ""

echo -e "${BLUE}📊 DIAGNOSIS CHECKLIST:${NC}"
echo ""

# 1. Check if debug endpoint exists
echo -e "${CYAN}1. Testing debug endpoint...${NC}"
if curl -s -f https://b0ase.com/api/debug/auth > /dev/null 2>&1; then
    echo "✅ Debug endpoint is accessible"
    echo "📄 Debug data:"
    curl -s https://b0ase.com/api/debug/auth | jq . 2>/dev/null || curl -s https://b0ase.com/api/debug/auth
else
    echo "❌ Debug endpoint is NOT accessible"
    echo "   → This means environment variables might not be deployed"
fi
echo ""

# 2. Check local environment
echo -e "${CYAN}2. Checking local environment...${NC}"
if [ -f ".env.local" ]; then
    echo "✅ .env.local exists"
    
    # Check for required variables
    required_vars=("NEXT_PUBLIC_SUPABASE_URL" "NEXT_PUBLIC_SUPABASE_ANON_KEY" "SUPABASE_SERVICE_ROLE_KEY" "GOOGLE_CLIENT_ID" "GOOGLE_CLIENT_SECRET")
    
    for var in "${required_vars[@]}"; do
        if grep -q "^${var}=" .env.local; then
            echo "✅ $var is set locally"
        else
            echo "❌ $var is MISSING locally"
        fi
    done
else
    echo "❌ .env.local file not found"
fi
echo ""

# 3. Test auth callback
echo -e "${CYAN}3. Testing auth callback endpoint...${NC}"
if curl -s -f https://b0ase.com/auth/callback > /dev/null 2>&1; then
    echo "✅ Auth callback endpoint exists"
else
    echo "❌ Auth callback endpoint is NOT accessible"
fi
echo ""

echo -e "${YELLOW}🛠️ IMMEDIATE FIXES TO APPLY:${NC}"
echo ""

echo -e "${GREEN}STEP 1: Verify Vercel Environment Variables${NC}"
echo "Go to: https://vercel.com/richardboase/b0ase-com/settings/environment-variables"
echo "Ensure these are set in PRODUCTION:"
echo ""
echo "NEXT_PUBLIC_SUPABASE_URL=https://api.b0ase.com"
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
echo "SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
echo "GOOGLE_CLIENT_ID=464314572333-pv6m2avofvafr2r7dmg0ahc8j2g6akv9.apps.googleusercontent.com"
echo "GOOGLE_CLIENT_SECRET=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"
echo "NEXT_PUBLIC_GOOGLE_CLIENT_ID=464314572333-pv6m2avofvafr2r7dmg0ahc8j2g6akv9.apps.googleusercontent.com"
echo ""

echo -e "${GREEN}STEP 2: Force Redeploy${NC}"
echo "Run: vercel --prod"
echo "Or push a commit to trigger redeploy"
echo ""

echo -e "${GREEN}STEP 3: Verify Supabase Settings${NC}"
echo "1. Go to: https://api.b0ase.com (self-hosted Supabase Studio)"
echo "2. Set Site URL to: https://b0ase.com"
echo "3. Add Redirect URLs:"
echo "   - https://b0ase.com/auth/callback"
echo "   - http://localhost:3000/auth/callback"
echo ""

echo -e "${GREEN}STEP 4: Verify Google OAuth Settings${NC}"
echo "1. Go to: https://console.cloud.google.com/apis/credentials"
echo "2. Edit OAuth 2.0 Client ID: 464314572333-pv6m2avofvafr2r7dmg0ahc8j2g6akv9"
echo "3. Set Authorized JavaScript origins:"
echo "   - https://b0ase.com"
echo "   - http://localhost:3000"
echo "4. Set Authorized redirect URIs:"
echo "   - https://b0ase.com/api/auth/google/callback"
echo "   - http://localhost:3000/api/auth/google/callback"
echo ""

echo -e "${RED}🚨 CRITICAL PRODUCTION ISSUES FOUND:${NC}"
echo ""

# Check if we can connect to the production site at all
echo -e "${CYAN}Testing production site accessibility...${NC}"
if curl -s -f https://b0ase.com > /dev/null 2>&1; then
    echo "✅ b0ase.com is accessible"
else
    echo "❌ b0ase.com is NOT accessible - DNS/hosting issue"
fi

# Check if login page works
if curl -s -f https://b0ase.com/login > /dev/null 2>&1; then
    echo "✅ Login page is accessible"
else
    echo "❌ Login page is NOT accessible"
fi

echo ""
echo -e "${YELLOW}⚡ EMERGENCY COMMANDS TO RUN:${NC}"
echo ""

echo "1. Deploy with environment variables:"
echo "   vercel --prod"
echo ""

echo "2. Check deployment logs:"
echo "   vercel logs --prod"
echo ""

echo "3. Test after deployment:"
echo "   curl https://b0ase.com/api/debug/auth"
echo ""

echo -e "${GREEN}🔧 DEVELOPMENT TESTING:${NC}"
echo "Before fixing production, test locally:"
echo "1. npm run dev"
echo "2. Go to http://localhost:3000"
echo "3. Try to log in"
echo "4. Check console for errors"
echo ""

echo -e "${BLUE}📝 VERIFICATION CHECKLIST:${NC}"
echo "After applying fixes, verify:"
echo "[ ] https://b0ase.com/api/debug/auth returns valid data"
echo "[ ] https://b0ase.com/login loads without errors"
echo "[ ] Google login works on production"
echo "[ ] Email login works on production"
echo "[ ] Redirects work properly after login"
echo ""

echo -e "${GREEN}🎯 THIS SHOULD FIX YOUR AUTH!${NC}"
echo "The main issue is likely missing environment variables in production."
echo "Follow STEP 1 above to fix this immediately."
echo "" 