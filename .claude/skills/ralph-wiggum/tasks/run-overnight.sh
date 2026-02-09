#!/bin/bash
# Run Ralph Wiggum overnight for ecosystem investigation
# Usage: ./run-overnight.sh

cd /Volumes/2026/Projects/b0ase.com

echo "=== Ralph Wiggum Overnight Investigation ==="
echo "Target: Map ecosystem patterns across 129 repos"
echo "Output: docs/ECOSYSTEM_MAP.md"
echo "Memory: /Volumes/2026/Projects/Claude/memory/"
echo ""
echo "Starting in 5 seconds... (Ctrl+C to abort)"
sleep 5

# Run with 20 iterations - each iteration investigates 2-3 repos
# That should cover ~40-60 repos by morning
/Volumes/2026/Projects/b0ase.com/.claude/skills/ralph-wiggum/scripts/ralph.sh \
  /Volumes/2026/Projects/b0ase.com/.claude/skills/ralph-wiggum/tasks/overnight-ecosystem.md \
  20

echo ""
echo "=== Investigation Complete ==="
echo "Check results at:"
echo "  - docs/ECOSYSTEM_MAP.md"
echo "  - docs/MASTER_PLAN.md"
echo "  - /Volumes/2026/Projects/Claude/memory/CONTEXT.md"
