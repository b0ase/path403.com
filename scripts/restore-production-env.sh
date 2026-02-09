#!/bin/bash

echo "🔄 Restoring production environment..."

# Stop local Supabase
echo "⏹️ Stopping local Supabase..."
supabase stop

# Restore production environment
if [ -f .env.local.prod ]; then
    cp .env.local.prod .env.local
    echo "✅ Restored production Supabase configuration"
else
    echo "❌ Production environment backup (.env.local.prod) not found"
    exit 1
fi

echo "🎉 Production environment restored!"
echo ""
echo "🌐 Your app is now using production Supabase"
echo "🚀 Deploy with: npm run build && git push"