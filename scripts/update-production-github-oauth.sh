#!/bin/bash

# Update Hetzner server with production GitHub OAuth credentials
# Usage: ./scripts/update-production-github-oauth.sh <PROD_CLIENT_ID> <PROD_CLIENT_SECRET>

set -e

if [ -z "$1" ] || [ -z "$2" ]; then
    echo "❌ Usage: $0 <PROD_CLIENT_ID> <PROD_CLIENT_SECRET>"
    echo ""
    echo "Example:"
    echo "  $0 Ov23liXXXXXXXXXXXX abc123def456..."
    echo ""
    echo "📋 Steps to create production GitHub OAuth App:"
    echo ""
    echo "1. Go to: https://github.com/settings/developers"
    echo "2. Click 'New OAuth App'"
    echo "3. Configure:"
    echo "   - Application name: b0ase.com (Production)"
    echo "   - Homepage URL: https://b0ase.com"
    echo "   - Authorization callback URL: https://api.b0ase.com/auth/v1/callback"
    echo "4. Click 'Register application'"
    echo "5. Copy the Client ID and generate a new Client Secret"
    echo "6. Run this script with those credentials"
    echo ""
    exit 1
fi

PROD_CLIENT_ID="$1"
PROD_CLIENT_SECRET="$2"

echo "🔧 Updating production GitHub OAuth credentials on Hetzner server..."
echo ""
echo "Client ID: $PROD_CLIENT_ID"
echo "Secret: ${PROD_CLIENT_SECRET:0:10}..."
echo ""

# SSH to server and update docker-compose or env file
ssh hetzner << EOF
    echo "📦 Finding Supabase docker-compose file..."

    # Find the active docker-compose file
    COMPOSE_FILE=\$(docker inspect supabase-auth --format '{{index .Config.Labels "com.docker.compose.project.config_files"}}' 2>/dev/null || echo "/root/multi-studios/docker-compose.yml")

    echo "Found: \$COMPOSE_FILE"

    # Backup current file
    echo "💾 Creating backup..."
    cp \$COMPOSE_FILE \$COMPOSE_FILE.backup.\$(date +%Y%m%d_%H%M%S)

    # Update GitHub OAuth credentials
    echo "✏️  Updating GitHub OAuth credentials..."
    sed -i 's/GOTRUE_EXTERNAL_GITHUB_CLIENT_ID=.*/GOTRUE_EXTERNAL_GITHUB_CLIENT_ID=$PROD_CLIENT_ID/' \$COMPOSE_FILE
    sed -i 's/GOTRUE_EXTERNAL_GITHUB_SECRET=.*/GOTRUE_EXTERNAL_GITHUB_SECRET=$PROD_CLIENT_SECRET/' \$COMPOSE_FILE

    echo "🔄 Restarting Supabase auth container..."
    docker restart supabase-auth

    echo "⏳ Waiting for auth container to be healthy..."
    sleep 5

    # Check health
    docker ps | grep supabase-auth

    echo ""
    echo "✅ Production GitHub OAuth credentials updated!"
EOF

echo ""
echo "🎉 Done! Test the connection:"
echo "   1. Go to: https://b0ase.com/user/account?tab=repos"
echo "   2. Click 'Connect GitHub'"
echo "   3. Authorize the app"
echo ""
