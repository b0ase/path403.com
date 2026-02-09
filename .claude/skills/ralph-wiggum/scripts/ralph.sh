#!/bin/bash
# Ralph Wiggum - External Loop Runner
# The simplest form: a bash loop that keeps invoking Claude
#
# Usage: ./ralph.sh <prompt-file> [max-iterations]
#
# Example:
#   echo "Build a REST API with tests" > task.md
#   ./ralph.sh task.md 20

PROMPT_FILE="$1"
MAX_ITERATIONS="${2:-50}"  # Default 50 iterations
ITERATION=0

if [[ -z "$PROMPT_FILE" ]] || [[ ! -f "$PROMPT_FILE" ]]; then
    echo "Usage: ./ralph.sh <prompt-file> [max-iterations]"
    echo ""
    echo "Create a prompt file first:"
    echo "  echo 'Your task description' > task.md"
    echo "  ./ralph.sh task.md 20"
    exit 1
fi

echo "=== Ralph Wiggum Loop ==="
echo "Prompt file: $PROMPT_FILE"
echo "Max iterations: $MAX_ITERATIONS"
echo "========================="
echo ""
echo "Starting in 3 seconds... (Ctrl+C to abort)"
sleep 3

while [[ $ITERATION -lt $MAX_ITERATIONS ]]; do
    ITERATION=$((ITERATION + 1))
    echo ""
    echo "--- Ralph Iteration $ITERATION/$MAX_ITERATIONS ---"
    echo ""

    # Run Claude with the prompt
    # Using --print to get output, --dangerously-skip-permissions for automation
    claude --print --dangerously-skip-permissions < "$PROMPT_FILE"

    EXIT_CODE=$?

    # Check for completion signals in output
    # You can customize this based on your completion promise
    if [[ $EXIT_CODE -eq 0 ]]; then
        echo ""
        echo "Claude exited cleanly. Continuing loop..."
    fi

    # Small delay between iterations
    sleep 2
done

echo ""
echo "=== Ralph Loop Complete ==="
echo "Completed $ITERATION iterations"
echo "==========================="
