#!/bin/bash

# Update production GitHub OAuth credentials in server .env file
# Usage: GITHUB_PROD_CLIENT_SECRET='secret' ./scripts/update-server-env.sh

set -e

PROD_CLIENT_ID="Ov23li0oGP6bbCKJAyUC"

if [ -z "$GITHUB_PROD_CLIENT_SECRET" ]; then
    echo "❌ Error: GITHUB_PROD_CLIENT_SECRET environment variable not set"
    echo ""
    echo "Usage:"
    echo "  GITHUB_PROD_CLIENT_SECRET='your_secret' ./scripts/update-server-env.sh"
    echo ""
    exit 1
fi

PROD_CLIENT_SECRET="$GITHUB_PROD_CLIENT_SECRET"

echo "🔧 Updating GitHub OAuth credentials in server .env file..."
echo ""
echo "Client ID: $PROD_CLIENT_ID"
echo "Secret: (hidden)"
echo ""

ssh hetzner << EOF
    set -e

    ENV_FILE="/root/supabase/docker/.env"

    echo "📝 Backing up .env file..."
    cp "\$ENV_FILE" "\$ENV_FILE.backup.\$(date +%Y%m%d_%H%M%S)"

    echo "✏️  Updating GitHub OAuth credentials..."
    sed -i 's/^GOTRUE_EXTERNAL_GITHUB_CLIENT_ID=.*/GOTRUE_EXTERNAL_GITHUB_CLIENT_ID=$PROD_CLIENT_ID/' "\$ENV_FILE"
    sed -i 's/^GOTRUE_EXTERNAL_GITHUB_SECRET=.*/GOTRUE_EXTERNAL_GITHUB_SECRET=$PROD_CLIENT_SECRET/' "\$ENV_FILE"

    echo "🔄 Recreating Supabase auth container to apply new credentials..."
    cd /root/supabase/docker
    docker-compose up -d --force-recreate --no-deps supabase-auth

    echo "⏳ Waiting for container to be healthy..."
    sleep 5

    for i in {1..15}; do
        if docker ps | grep -q "supabase-auth.*healthy"; then
            echo "✅ Container is healthy!"
            break
        fi
        echo "Waiting... (\$i/15)"
        sleep 2
    done

    echo ""
    echo "🔍 Verifying new credentials..."
    docker inspect supabase-auth | grep "GOTRUE_EXTERNAL_GITHUB_CLIENT_ID" | grep -v "SECRET"

    echo ""
    echo "✅ Production credentials updated and container recreated!"
EOF

echo ""
echo "🎉 Done! Now test:"
echo "   1. Go to: https://b0ase.com/user/account?tab=repos"
echo "   2. Click 'Connect GitHub'"
echo "   3. You should see 'b0ase.com' as the app name"
echo "   4. Authorize and your repos should load!"
echo ""

unset GITHUB_PROD_CLIENT_SECRET
