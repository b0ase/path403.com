#!/bin/bash
# Deploy Kintsugi Agent to Hetzner
# Usage: ./deploy.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
REMOTE_HOST="hetzner"
REMOTE_DIR="/opt/kintsugi"

echo "=== Deploying Kintsugi Agent to Hetzner ==="
echo "Project directory: $PROJECT_DIR"
echo "Remote: $REMOTE_HOST:$REMOTE_DIR"
echo ""

# Check for required secrets file
if [ ! -f "$PROJECT_DIR/.env" ]; then
  echo "ERROR: .env file not found in $PROJECT_DIR"
  echo "Create .env with:"
  echo "  ANTHROPIC_API_KEY=sk-..."
  echo "  GITHUB_TOKEN=ghp_..."
  echo "  PIPELINE_API_KEY=..."
  exit 1
fi

# Create remote directory
echo "Creating remote directory..."
ssh $REMOTE_HOST "sudo mkdir -p $REMOTE_DIR && sudo chown \$(whoami):\$(whoami) $REMOTE_DIR"

# Copy files to remote
echo "Copying files to remote..."
rsync -avz --exclude 'node_modules' --exclude '.git' \
  "$PROJECT_DIR/" "$REMOTE_HOST:$REMOTE_DIR/"

# Copy secrets securely
echo "Copying secrets..."
scp "$PROJECT_DIR/.env" "$REMOTE_HOST:$REMOTE_DIR/.env"
ssh $REMOTE_HOST "chmod 600 $REMOTE_DIR/.env"

# Build and start on remote
echo "Building and starting containers..."
ssh $REMOTE_HOST "cd $REMOTE_DIR && docker compose build && docker compose up -d"

# Check status
echo ""
echo "=== Deployment Complete ==="
ssh $REMOTE_HOST "cd $REMOTE_DIR && docker compose ps"
echo ""
echo "View logs with: ssh $REMOTE_HOST 'cd $REMOTE_DIR && docker compose logs -f'"
echo "Stop with: ssh $REMOTE_HOST 'cd $REMOTE_DIR && docker compose down'"
