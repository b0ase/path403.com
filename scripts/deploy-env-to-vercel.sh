#!/bin/bash

# Deploy Environment Variables to Vercel Production
echo "🚀 Deploying Environment Variables to Vercel Production"
echo "====================================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}Setting up environment variables for production...${NC}"

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}Vercel CLI not found. Installing...${NC}"
    npm i -g vercel
fi

# Set production environment variables
echo -e "${GREEN}Adding environment variables to Vercel...${NC}"

# Validation function
check_env() {
    if [ -z "${!1}" ]; then
        echo -e "${RED}Error: $1 is not set in your environment.${NC}"
        echo -e "Please ensure it is set in .env.local or your shell."
        exit 1
    fi
}

# Required variables validation
check_env "NEXT_PUBLIC_SUPABASE_URL"
check_env "NEXT_PUBLIC_SUPABASE_ANON_KEY"
check_env "SUPABASE_SERVICE_ROLE_KEY"
check_env "NEXT_PUBLIC_GOOGLE_CLIENT_ID"
check_env "GOOGLE_CLIENT_SECRET"
check_env "ADMIN_PASSWORD"
check_env "STUDIO_PASSWORD"

# Supabase variables
vercel env add NEXT_PUBLIC_SUPABASE_URL production <<< "$NEXT_PUBLIC_SUPABASE_URL"
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production <<< "$NEXT_PUBLIC_SUPABASE_ANON_KEY"
vercel env add SUPABASE_SERVICE_ROLE_KEY production <<< "$SUPABASE_SERVICE_ROLE_KEY"

# Google OAuth variables
vercel env add NEXT_PUBLIC_GOOGLE_CLIENT_ID production <<< "$NEXT_PUBLIC_GOOGLE_CLIENT_ID"
vercel env add GOOGLE_CLIENT_SECRET production <<< "$GOOGLE_CLIENT_SECRET"

# Admin and other variables
vercel env add ADMIN_PASSWORD production <<< "$ADMIN_PASSWORD"
vercel env add STUDIO_PASSWORD production <<< "$STUDIO_PASSWORD"

echo -e "${GREEN}Environment variables added!${NC}"
echo ""

echo -e "${YELLOW}🚀 Deploying to production...${NC}"
vercel --prod --yes

echo ""
echo -e "${GREEN}🎉 Deployment complete!${NC}"
echo ""
echo "🔍 Test your deployment:"
echo "1. Wait 30 seconds for deployment to complete"
echo "2. Test: curl https://b0ase.com/api/debug/auth"
echo "3. Try logging in at: https://b0ase.com/login"
echo ""
echo -e "${YELLOW}If auth still doesn't work, run:${NC}"
echo "./scripts/fix-production-auth.sh" 