#!/bin/bash
# Check Kintsugi status on Hetzner
# Usage: ./status.sh

REMOTE_HOST="hetzner"
REMOTE_DIR="/opt/kintsugi"

echo "=== Kintsugi Agent Status ==="
echo ""

echo "Containers:"
ssh $REMOTE_HOST "cd $REMOTE_DIR && docker compose ps"

echo ""
echo "Gateway Health:"
ssh $REMOTE_HOST "curl -s http://localhost:3001/health | jq ."

echo ""
echo "Recent Logs (last 20 lines):"
ssh $REMOTE_HOST "cd $REMOTE_DIR && docker compose logs --tail=20"
