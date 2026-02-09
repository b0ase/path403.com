#!/bin/bash
# View Kintsugi logs from Hetzner
# Usage: ./logs.sh [gateway|agent]

REMOTE_HOST="hetzner"
REMOTE_DIR="/opt/kintsugi"
SERVICE="${1:-}"

if [ -n "$SERVICE" ]; then
  ssh $REMOTE_HOST "cd $REMOTE_DIR && docker compose logs -f $SERVICE"
else
  ssh $REMOTE_HOST "cd $REMOTE_DIR && docker compose logs -f"
fi
