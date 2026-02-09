#!/bin/bash
# Cancel an active Ralph Wiggum loop

RALPH_STATE_FILE="${HOME}/.ralph-wiggum-state"
RALPH_PROMPT_FILE="${HOME}/.ralph-wiggum-prompt"
RALPH_ITERATION_FILE="${HOME}/.ralph-wiggum-iteration"

# Check if loop is active
if [[ ! -f "$RALPH_STATE_FILE" ]]; then
    echo "No active Ralph loop found."
    exit 0
fi

RALPH_ACTIVE=$(head -1 "$RALPH_STATE_FILE" 2>/dev/null)
if [[ "$RALPH_ACTIVE" != "active" ]]; then
    echo "No active Ralph loop found."
    exit 0
fi

# Get iteration count
ITERATIONS=$(cat "$RALPH_ITERATION_FILE" 2>/dev/null || echo "0")

# Deactivate
echo "inactive" > "$RALPH_STATE_FILE"

echo "=== Ralph Loop Cancelled ==="
echo "Completed iterations: $ITERATIONS"
echo "Loop deactivated."
echo "============================"

# Cleanup
rm -f "$RALPH_PROMPT_FILE" "$RALPH_ITERATION_FILE"
