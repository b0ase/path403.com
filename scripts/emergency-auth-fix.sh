#!/bin/bash

# Emergency Authentication Fix Script
# Use this to quickly resolve the cross-contamination issue

echo "🚨 EMERGENCY AUTH FIX - IMMEDIATE ACTIONS"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${RED}🔥 IMMEDIATE PROBLEM:${NC}"
echo "You signed in with richardwboase@gmail.com on port 3002"
echo "But got redirected to aigirlfriendswebsite@gmail.com on b0ase.com"
echo "This is authentication cross-contamination!"
echo ""

echo -e "${YELLOW}⚡ QUICK FIX STEPS:${NC}"
echo ""

echo -e "${GREEN}1. 🧹 IMMEDIATE CLEANUP${NC}"
echo "   Clear all authentication state:"
echo "   → Close all browser tabs with b0ase.com"
echo "   → Open Chrome/Edge DevTools (F12)"
echo "   → Go to Application tab → Storage"
echo "   → Clear all cookies for localhost:3002 and b0ase.com"
echo "   → Clear Local Storage for both domains"
echo "   → Clear Session Storage for both domains"
echo ""

echo -e "${GREEN}2. 🔧 GOOGLE OAUTH CONFIGURATION${NC}"
echo "   Fix the redirect URI mismatch:"
echo "   → Go to: https://console.cloud.google.com/apis/credentials"
echo "   → Find Client ID: 464314572333-pv6m2avofvafr2r7dmg0ahc8j2g6akv9"
echo "   → Click 'Edit' (pencil icon)"
echo "   → Under 'Authorized JavaScript origins', ensure you have:"
echo "     • http://localhost:3000"
echo "     • http://localhost:3002"
echo "     • https://b0ase.com"
echo "   → Under 'Authorized redirect URIs', ensure you have:"
echo "     • http://localhost:3000/auth/callback"
echo "     • http://localhost:3002/auth/callback"
echo "     • https://b0ase.com/auth/callback"
echo "   → Click 'Save'"
echo ""

echo -e "${GREEN}3. 🔄 SUPABASE SITE URL CONFIGURATION${NC}"
echo "   Fix the site URL mismatch:"
echo "   → Go to: https://api.b0ase.com (self-hosted Supabase Studio)"
echo "   → Go to Authentication → Settings"
echo "   → Set Site URL to: http://localhost:3002 (for development)"
echo "   → In Redirect URLs, add:"
echo "     • http://localhost:3002/auth/callback"
echo "     • http://localhost:3000/auth/callback"
echo "     • https://b0ase.com/auth/callback"
echo "   → Click 'Save'"
echo ""

echo -e "${GREEN}4. 🖥️  LOCAL DEVELOPMENT SERVER${NC}"
echo "   Ensure you're running on the correct port:"
echo "   → Kill any existing development servers"
echo "   → Run: npm run dev"
echo "   → Verify it starts on port 3000 (not 3002)"
echo "   → If it uses 3002, change package.json or use: npm run dev -- --port 3000"
echo ""

echo -e "${GREEN}5. 🧪 TEST THE FIX${NC}"
echo "   Test in incognito mode:"
echo "   → Open incognito/private window"
echo "   → Go to: http://localhost:3000"
echo "   → Try Google sign-in"
echo "   → Verify you stay on localhost (not redirected to b0ase.com)"
echo "   → Verify you're signed in as the correct user"
echo ""

echo -e "${YELLOW}⚠️  TEMPORARY WORKAROUND:${NC}"
echo "If you need to work immediately:"
echo "• Use localhost:3000 consistently"
echo "• Sign out of all Google accounts before testing"
echo "• Use incognito mode for testing"
echo "• Check the URL bar during auth flow"
echo ""

echo -e "${RED}🚨 WHY THIS HAPPENED:${NC}"
echo "• Your JWT state shows site_url: 'https://b0ase.com' (should be localhost)"
echo "• Your OAuth redirect goes to production Supabase"
echo "• You're sharing the same auth infrastructure"
echo "• Sessions are bleeding between environments"
echo ""

echo -e "${BLUE}📋 VERIFICATION CHECKLIST:${NC}"
echo "After applying the fix, verify:"
echo "□ Google OAuth client has correct redirect URIs"
echo "□ Supabase project has correct site URL"
echo "□ Development server runs on port 3000"
echo "□ Authentication stays in localhost"
echo "□ No redirect to production site"
echo "□ Correct user identity is maintained"
echo ""

echo -e "${GREEN}🎯 NEXT STEPS:${NC}"
echo "This is a temporary fix. For long-term solution:"
echo "1. Run: bash scripts/setup-dev-environment.sh"
echo "2. Create separate development Supabase project"
echo "3. Create separate development Google OAuth client"
echo "4. Never use production credentials in development"
echo ""

echo -e "${CYAN}📞 SUPPORT:${NC}"
echo "If the issue persists:"
echo "• Check browser console for errors"
echo "• Verify environment variables are loaded"
echo "• Test in different browser"
echo "• Contact support with specific error messages"
echo ""

echo -e "${GREEN}✅ Apply these fixes now and test immediately!${NC}" 