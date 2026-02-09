#!/bin/bash

# Sync production GitHub OAuth credentials to Hetzner server
# This script reads from environment variables so secrets aren't exposed

set -e

echo "🔧 Syncing GitHub OAuth credentials to Hetzner server..."
echo ""

# Use production credentials
PROD_CLIENT_ID="Ov23li0oGP6bbCKJAyUC"

# Check if secret is in environment (you should set this yourself)
if [ -z "$GITHUB_PROD_CLIENT_SECRET" ]; then
    echo "❌ Error: GITHUB_PROD_CLIENT_SECRET environment variable not set"
    echo ""
    echo "To use this script:"
    echo "  1. Get your production GitHub OAuth secret from:"
    echo "     - Vercel Dashboard → Settings → Environment Variables"
    echo "     - Or GitHub: https://github.com/settings/applications/2616058"
    echo ""
    echo "  2. Run this script with the secret as an environment variable:"
    echo "     GITHUB_PROD_CLIENT_SECRET='your_secret_here' ./scripts/sync-github-oauth-to-server.sh"
    echo ""
    echo "The secret will NOT be logged or displayed."
    exit 1
fi

PROD_CLIENT_SECRET="$GITHUB_PROD_CLIENT_SECRET"

echo "Client ID: $PROD_CLIENT_ID"
echo "Secret: (hidden for security)"
echo ""

# SSH to server and update
ssh hetzner << EOF
    echo "📦 Finding Supabase docker-compose file..."

    # Find docker-compose file
    if [ -f "/root/multi-studios/docker-compose.yml" ]; then
        COMPOSE_FILE="/root/multi-studios/docker-compose.yml"
    elif [ -f "/root/supabase/docker/docker-compose.yml" ]; then
        COMPOSE_FILE="/root/supabase/docker/docker-compose.yml"
    else
        # Try to find it from running container
        COMPOSE_FILE=\$(docker inspect supabase-auth --format '{{index .Config.Labels "com.docker.compose.project.working_dir"}}/docker-compose.yml' 2>/dev/null)
    fi

    if [ -z "\$COMPOSE_FILE" ] || [ ! -f "\$COMPOSE_FILE" ]; then
        echo "❌ Could not find docker-compose.yml"
        exit 1
    fi

    echo "Found: \$COMPOSE_FILE"

    # Backup current file
    echo "💾 Creating backup..."
    cp "\$COMPOSE_FILE" "\$COMPOSE_FILE.backup.\$(date +%Y%m%d_%H%M%S)"

    # Update GitHub OAuth credentials
    echo "✏️  Updating GitHub OAuth credentials..."
    sed -i 's/GOTRUE_EXTERNAL_GITHUB_CLIENT_ID=.*/GOTRUE_EXTERNAL_GITHUB_CLIENT_ID=$PROD_CLIENT_ID/' "\$COMPOSE_FILE"
    sed -i 's/GOTRUE_EXTERNAL_GITHUB_SECRET=.*/GOTRUE_EXTERNAL_GITHUB_SECRET=$PROD_CLIENT_SECRET/' "\$COMPOSE_FILE"

    echo "🔄 Restarting Supabase auth container..."
    docker restart supabase-auth

    echo "⏳ Waiting for auth container to be healthy..."
    for i in {1..10}; do
        if docker ps | grep -q "supabase-auth.*healthy"; then
            echo "✅ Auth container is healthy!"
            break
        fi
        echo "Waiting... (\$i/10)"
        sleep 2
    done

    # Verify the update
    echo ""
    echo "🔍 Verifying credentials..."
    docker inspect supabase-auth | grep "GOTRUE_EXTERNAL_GITHUB_CLIENT_ID" | grep -v "SECRET"

    echo ""
    echo "✅ Production GitHub OAuth credentials updated!"
EOF

echo ""
echo "🎉 Done! Test the connection:"
echo "   1. Go to: https://b0ase.com/user/account?tab=repos"
echo "   2. Click 'Connect GitHub'"
echo "   3. Authorize the app"
echo ""

# Clear the secret from memory
unset GITHUB_PROD_CLIENT_SECRET
