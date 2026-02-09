#!/bin/bash
# Deploy PATH402 Indexer to Hetzner VPS

set -e

echo "Deploying PATH402 Indexer..."

# Create directory on server
ssh hetzner "sudo mkdir -p /opt/path402-indexer && sudo chown \$USER:\$USER /opt/path402-indexer"

# Copy files
scp index.js package.json path402-indexer.service hetzner:/opt/path402-indexer/

# Create .env file with Supabase credentials
ssh hetzner "cat > /opt/path402-indexer/.env << 'EOF'
SUPABASE_URL=http://localhost:8000
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
EOF"

# Install dependencies
ssh hetzner "cd /opt/path402-indexer && npm install --production"

# Install systemd service
ssh hetzner "sudo cp /opt/path402-indexer/path402-indexer.service /etc/systemd/system/"
ssh hetzner "sudo systemctl daemon-reload"
ssh hetzner "sudo systemctl enable path402-indexer"
ssh hetzner "sudo systemctl restart path402-indexer"

echo ""
echo "Deployed! Check status with:"
echo "  ssh hetzner 'systemctl status path402-indexer'"
echo "  ssh hetzner 'journalctl -u path402-indexer -f'"
