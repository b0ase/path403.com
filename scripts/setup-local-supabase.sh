#!/bin/bash

echo "🚀 Setting up local Supabase development environment..."

# Check if Docker is running
if ! docker ps &> /dev/null; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

# Start local Supabase
echo "📦 Starting local Supabase instance..."
supabase start

# Switch to local environment
echo "🔄 Switching to local development environment..."
if [ -f .env.local.dev ]; then
    cp .env.local .env.local.prod.backup
    cp .env.local.dev .env.local
    echo "✅ Switched to local Supabase configuration"
else
    echo "❌ Local development environment file (.env.local.dev) not found"
    exit 1
fi

echo "🎉 Local Supabase setup complete!"
echo ""
echo "Available services:"
echo "📊 Supabase Studio: http://127.0.0.1:54323"
echo "🔗 API URL: http://127.0.0.1:54321"
echo "💾 Database: postgresql://postgres:postgres@127.0.0.1:54322/postgres"
echo ""
echo "🌐 Start your development server:"
echo "npm run dev"
echo ""
echo "📝 To return to production environment:"
echo "./scripts/restore-production-env.sh"