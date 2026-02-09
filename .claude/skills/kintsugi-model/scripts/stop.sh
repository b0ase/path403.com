#!/bin/bash
# Stop Kintsugi agent on Hetzner
# Usage: ./stop.sh

REMOTE_HOST="hetzner"
REMOTE_DIR="/opt/kintsugi"

echo "Stopping Kintsugi containers..."
ssh $REMOTE_HOST "cd $REMOTE_DIR && docker compose down"
echo "Done."
