#!/bin/bash
# Ralph Wiggum Stop Hook
# Intercepts Claude exit attempts and re-feeds the prompt

RALPH_STATE_FILE="${HOME}/.ralph-wiggum-state"
RALPH_PROMPT_FILE="${HOME}/.ralph-wiggum-prompt"
RALPH_ITERATION_FILE="${HOME}/.ralph-wiggum-iteration"

# Check if Ralph loop is active
if [[ ! -f "$RALPH_STATE_FILE" ]]; then
    exit 0  # No active loop, allow exit
fi

# Read state
RALPH_ACTIVE=$(cat "$RALPH_STATE_FILE" 2>/dev/null)
if [[ "$RALPH_ACTIVE" != "active" ]]; then
    exit 0  # Loop not active, allow exit
fi

# Read configuration
MAX_ITERATIONS=$(grep "^MAX_ITERATIONS=" "$RALPH_STATE_FILE" 2>/dev/null | cut -d= -f2)
COMPLETION_PROMISE=$(grep "^COMPLETION_PROMISE=" "$RALPH_STATE_FILE" 2>/dev/null | cut -d= -f2)
CURRENT_ITERATION=$(cat "$RALPH_ITERATION_FILE" 2>/dev/null || echo "0")

# Check if max iterations reached
if [[ -n "$MAX_ITERATIONS" ]] && [[ "$CURRENT_ITERATION" -ge "$MAX_ITERATIONS" ]]; then
    echo "Ralph: Max iterations ($MAX_ITERATIONS) reached. Stopping loop."
    echo "inactive" > "$RALPH_STATE_FILE"
    exit 0
fi

# Check if completion promise found in recent output
if [[ -n "$COMPLETION_PROMISE" ]]; then
    # Check last Claude output for completion promise
    if grep -q "$COMPLETION_PROMISE" /tmp/ralph-last-output 2>/dev/null; then
        echo "Ralph: Completion promise found. Task complete!"
        echo "inactive" > "$RALPH_STATE_FILE"
        exit 0
    fi
fi

# Increment iteration
NEXT_ITERATION=$((CURRENT_ITERATION + 1))
echo "$NEXT_ITERATION" > "$RALPH_ITERATION_FILE"

# Log iteration
echo "Ralph: Iteration $NEXT_ITERATION - Continuing..."

# Re-feed the prompt (this blocks exit and continues the loop)
if [[ -f "$RALPH_PROMPT_FILE" ]]; then
    PROMPT=$(cat "$RALPH_PROMPT_FILE")
    echo ""
    echo "--- Ralph Loop Iteration $NEXT_ITERATION ---"
    echo ""
    # Output the prompt to be picked up by Claude
    echo "$PROMPT"

    # Block the exit
    exit 1
fi

exit 0
