#!/bin/bash

# Development Environment Setup Script
# This script helps separate development from production authentication

echo "🚨 CRITICAL: Development Environment Setup"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${RED}🔥 AUTHENTICATION CROSS-CONTAMINATION DETECTED!${NC}"
echo ""
echo -e "${YELLOW}Your local development is using PRODUCTION credentials!${NC}"
echo "This is why you're getting logged in as different users."
echo ""

echo -e "${BLUE}📋 IMMEDIATE ACTIONS REQUIRED:${NC}"
echo ""

echo -e "${GREEN}1. 🏗️  CREATE DEVELOPMENT SUPABASE PROJECT${NC}"
echo "   → Go to: https://supabase.com/dashboard"
echo "   → Click 'New Project'"
echo "   → Name: 'b0ase-dev' or similar"
echo "   → Note down the project URL and keys"
echo ""

echo -e "${GREEN}2. 🔑 CREATE DEVELOPMENT GOOGLE OAUTH CLIENT${NC}"
echo "   → Go to: https://console.cloud.google.com/apis/credentials"
echo "   → Click 'Create Credentials' → 'OAuth 2.0 Client ID'"
echo "   → Application type: 'Web application'"
echo "   → Name: 'b0ase-dev' or similar"
echo "   → Authorized JavaScript origins: http://localhost:3000"
echo "   → Authorized redirect URIs: http://localhost:3000/auth/callback"
echo "   → Note down the Client ID and Client Secret"
echo ""

echo -e "${GREEN}3. 📄 CREATE DEVELOPMENT .env.local FILE${NC}"
echo "   Run this command to create your development environment file:"
echo ""
echo "   cat > .env.local << 'EOF'"
echo "# DEVELOPMENT ENVIRONMENT - DO NOT USE PRODUCTION CREDENTIALS"
echo ""
echo "# Development Supabase Project (REPLACE WITH YOUR DEV PROJECT)"
echo "NEXT_PUBLIC_SUPABASE_URL=https://YOUR-DEV-PROJECT.supabase.co"
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR-DEV-ANON-KEY"
echo "SUPABASE_SERVICE_ROLE_KEY=YOUR-DEV-SERVICE-ROLE-KEY"
echo ""
echo "# Development Google OAuth (REPLACE WITH YOUR DEV CLIENT)"
echo "NEXT_PUBLIC_GOOGLE_CLIENT_ID=YOUR-DEV-CLIENT-ID.apps.googleusercontent.com"
echo "GOOGLE_CLIENT_ID=YOUR-DEV-CLIENT-ID.apps.googleusercontent.com"
echo "GOOGLE_CLIENT_SECRET=YOUR-DEV-CLIENT-SECRET"
echo ""
echo "# Development App Configuration"
echo "NEXT_PUBLIC_APP_URL=http://localhost:3000"
echo "NEXTAUTH_URL=http://localhost:3000"
echo ""
echo "# Shared API Keys (Safe for development)"
echo "GOOGLE_AI_API_KEY=AIzaSyDXtaj25_2vm8B_0VYLorY9FSN4wM3KsAk"
echo "GOOGLE_AI_PRO_API_KEY=AIzaSyDvm5AQq5j6cTYjBQrqGNErjglUlpNKnV4"
echo "AIML_API_KEY=a706de6d7f744977aae283ee7dbfe5a3"
echo "ADMIN_PASSWORD=vcud#WQfRiUW64f"
echo "STUDIO_PASSWORD=FBGHT543"
echo "EOF"
echo ""

echo -e "${GREEN}4. 🔧 UPDATE DEVELOPMENT PROJECT SETTINGS${NC}"
echo "   In your NEW development Supabase project:"
echo "   → Go to Authentication → Settings"
echo "   → Set Site URL: http://localhost:3000"
echo "   → Add Redirect URL: http://localhost:3000/auth/callback"
echo "   → Enable Google OAuth provider"
echo "   → Use your DEV Google OAuth client ID/secret"
echo ""

echo -e "${GREEN}5. 🧪 TEST SEPARATION${NC}"
echo "   After setting up:"
echo "   → Restart your dev server: npm run dev"
echo "   → Test login at http://localhost:3000"
echo "   → Verify you're NOT accessing production users"
echo "   → Check that you're using the development database"
echo ""

echo -e "${YELLOW}⚠️  SECURITY WARNINGS:${NC}"
echo "• NEVER use production credentials in development"
echo "• NEVER commit .env.local to version control"
echo "• ALWAYS test auth flows in isolated environments"
echo "• DELETE any production sessions from your browser"
echo ""

echo -e "${RED}🚨 CURRENT ISSUE SUMMARY:${NC}"
echo "• Your local dev uses PRODUCTION Supabase instance"
echo "• Your local dev uses PRODUCTION Google OAuth client"
echo "• You're sharing user database between dev/prod"
echo "• Authentication sessions are cross-contaminating"
echo ""

echo -e "${GREEN}💡 AFTER SETUP BENEFITS:${NC}"
echo "• 🔒 Isolated development environment"
echo "• 🛡️  No production data exposure"
echo "• 🧪 Safe testing without affecting live users"
echo "• 📊 Clean separation of concerns"
echo ""

echo -e "${BLUE}📞 EMERGENCY CLEANUP:${NC}"
echo "If you need to fix this immediately:"
echo "1. Clear all browser cookies and localStorage"
echo "2. Sign out of all Google accounts"
echo "3. Test authentication in incognito mode"
echo "4. Check which Supabase project you're connecting to"
echo ""

echo -e "${GREEN}🎯 Next Steps:${NC}"
echo "1. Create the development Supabase project"
echo "2. Create the development Google OAuth client"
echo "3. Update your .env.local file"
echo "4. Test the isolated development environment"
echo "5. Deploy production with proper environment separation"
echo ""

echo -e "${CYAN}📚 Documentation:${NC}"
echo "• Supabase Projects: https://supabase.com/docs/guides/getting-started"
echo "• Google OAuth Setup: https://developers.google.com/identity/protocols/oauth2"
echo "• Environment Variables: https://nextjs.org/docs/basic-features/environment-variables"
echo ""

echo -e "${GREEN}✅ Ready to set up proper development environment!${NC}" 