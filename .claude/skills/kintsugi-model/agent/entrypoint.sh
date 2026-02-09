#!/bin/bash
# Kintsugi Agent Entrypoint
# Starts the autonomous agent loop

set -e

echo "=== Kintsugi Agent Starting ==="
echo "Gateway URL: ${CLAUDE_CODE_GATEWAY}"
echo "Work directory: /home/kintsugi/projects"

# Wait for gateway to be available
echo "Waiting for gateway..."
until curl -s http://gateway:3001/health > /dev/null 2>&1; do
  sleep 2
done
echo "Gateway is ready!"

# Create working directory if needed
mkdir -p /home/kintsugi/projects

cd /home/kintsugi/projects

# Check for pending work
echo "Checking for work items..."
WORK_ITEMS=$(curl -s http://gateway:3001/pipeline/work-items)
echo "Available work items: $(echo $WORK_ITEMS | jq '.count // 0')"

# If a specific task is provided, run it
if [ -n "$KINTSUGI_TASK" ]; then
  echo "Running specific task: $KINTSUGI_TASK"
  claude --dangerously-skip-permissions "$KINTSUGI_TASK"
  exit $?
fi

# Otherwise, enter autonomous loop
echo "Entering autonomous work loop..."

while true; do
  # Fetch open work items
  WORK=$(curl -s http://gateway:3001/pipeline/work-items | jq -r '.workItems[0] // empty')

  if [ -n "$WORK" ]; then
    WORK_ID=$(echo $WORK | jq -r '.id')
    TITLE=$(echo $WORK | jq -r '.title')
    DESCRIPTION=$(echo $WORK | jq -r '.description // "No description"')
    BOUNTY=$(echo $WORK | jq -r '.bountyAmountGbp')

    echo ""
    echo "=== Found Work Item ==="
    echo "ID: $WORK_ID"
    echo "Title: $TITLE"
    echo "Bounty: £$BOUNTY"
    echo ""

    # Claim the work
    CLAIM_RESULT=$(curl -s -X POST http://gateway:3001/pipeline/claim-issue \
      -H "Content-Type: application/json" \
      -d "{\"action\": \"claim\", \"workItemId\": \"$WORK_ID\"}")

    if echo "$CLAIM_RESULT" | jq -e '.success' > /dev/null; then
      echo "Work item claimed successfully!"

      # Start work
      curl -s -X POST http://gateway:3001/pipeline/claim-issue \
        -H "Content-Type: application/json" \
        -d "{\"action\": \"start\", \"workItemId\": \"$WORK_ID\"}"

      # Create project directory
      PROJECT_DIR="/home/kintsugi/projects/work-$WORK_ID"
      mkdir -p "$PROJECT_DIR"
      cd "$PROJECT_DIR"

      # Run Claude Code with the task
      TASK_PROMPT="You are working on: $TITLE

Description: $DESCRIPTION

This work item is tracked in the pipeline. When you're done:
1. Make sure all tests pass
2. Create a git commit with your changes
3. Push to a branch
4. Submit for review by calling:
   curl -X POST http://gateway:3001/pipeline/claim-issue -H 'Content-Type: application/json' -d '{\"action\": \"submit\", \"workItemId\": \"$WORK_ID\"}'

Start by understanding the requirements, then implement the solution."

      echo "Starting Claude Code for task..."
      claude --dangerously-skip-permissions "$TASK_PROMPT" || true

      echo "Task attempt completed. Checking for more work in 60 seconds..."
      sleep 60
    else
      echo "Failed to claim work item. Waiting 30 seconds..."
      sleep 30
    fi
  else
    echo "No work available. Checking again in 60 seconds..."
    sleep 60
  fi
done
