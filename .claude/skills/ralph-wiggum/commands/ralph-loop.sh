#!/bin/bash
# Start a Ralph Wiggum autonomous loop
# Usage: ralph-loop.sh "<prompt>" [--max-iterations N] [--completion-promise "TEXT"]

RALPH_STATE_FILE="${HOME}/.ralph-wiggum-state"
RALPH_PROMPT_FILE="${HOME}/.ralph-wiggum-prompt"
RALPH_ITERATION_FILE="${HOME}/.ralph-wiggum-iteration"

# Parse arguments
PROMPT=""
MAX_ITERATIONS=""
COMPLETION_PROMISE=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --max-iterations)
            MAX_ITERATIONS="$2"
            shift 2
            ;;
        --completion-promise)
            COMPLETION_PROMISE="$2"
            shift 2
            ;;
        *)
            if [[ -z "$PROMPT" ]]; then
                PROMPT="$1"
            fi
            shift
            ;;
    esac
done

if [[ -z "$PROMPT" ]]; then
    echo "Usage: /ralph-loop \"<prompt>\" [--max-iterations N] [--completion-promise \"TEXT\"]"
    echo ""
    echo "Example:"
    echo "  /ralph-loop \"Build a REST API with tests. Output <promise>DONE</promise> when complete.\" --max-iterations 20 --completion-promise \"DONE\""
    exit 1
fi

# Warn if no safety limits
if [[ -z "$MAX_ITERATIONS" ]]; then
    echo "WARNING: No --max-iterations set. Ralph will loop indefinitely!"
    echo "Recommended: Add --max-iterations 20 (or appropriate limit)"
    echo ""
fi

# Initialize state
echo "active" > "$RALPH_STATE_FILE"
echo "MAX_ITERATIONS=$MAX_ITERATIONS" >> "$RALPH_STATE_FILE"
echo "COMPLETION_PROMISE=$COMPLETION_PROMISE" >> "$RALPH_STATE_FILE"
echo "$PROMPT" > "$RALPH_PROMPT_FILE"
echo "0" > "$RALPH_ITERATION_FILE"

echo "=== Ralph Wiggum Loop Started ==="
echo "Prompt: $PROMPT"
[[ -n "$MAX_ITERATIONS" ]] && echo "Max iterations: $MAX_ITERATIONS"
[[ -n "$COMPLETION_PROMISE" ]] && echo "Completion promise: $COMPLETION_PROMISE"
echo ""
echo "Use /cancel-ralph to stop the loop"
echo "=================================="
echo ""

# Output the initial prompt for Claude to pick up
echo "$PROMPT"
