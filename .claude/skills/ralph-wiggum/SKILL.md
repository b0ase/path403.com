# Ralph Wiggum - Autonomous Loop Skill

> "Me fail English? That's unpossible!" - Ralph keeps going.

## Overview

Ralph Wiggum implements an iterative, self-referential AI development loop. It allows Claude to work autonomously on tasks for extended periods by intercepting exit attempts and re-feeding the same prompt until completion.

## Trigger Phrases

- "Run ralph loop"
- "Start autonomous loop"
- "Ralph wiggum this task"
- "Keep iterating until done"

## How It Works

```
/ralph-loop "Your task" --max-iterations 20 --completion-promise "DONE"

Claude works → Tries to exit → Stop hook blocks → Re-feeds prompt → Repeat
```

The loop happens **inside your current session**. Claude's previous work persists in files, and each iteration sees the modified codebase.

## Commands

### Start a Loop
```bash
/ralph-loop "<prompt>" --max-iterations <n> --completion-promise "<text>"
```

### Cancel Active Loop
```bash
/cancel-ralph
```

## Prompt Best Practices

### 1. Clear Completion Criteria
```
Build a REST API for todos.

When complete:
- All CRUD endpoints working
- Tests passing (coverage > 80%)
- Output: <promise>COMPLETE</promise>
```

### 2. Incremental Goals
```
Phase 1: User authentication
Phase 2: Product catalog
Phase 3: Shopping cart

Output <promise>COMPLETE</promise> when all phases done.
```

### 3. Self-Correction
```
Implement feature X following TDD:
1. Write failing tests
2. Implement feature
3. Run tests - if fail, debug and fix
4. Repeat until all green
5. Output: <promise>COMPLETE</promise>
```

### 4. Escape Hatches
Always use `--max-iterations` as safety:
```bash
/ralph-loop "Implement X" --max-iterations 20
```

## When to Use

**Good for:**
- Well-defined tasks with clear success criteria
- Tasks requiring iteration (getting tests to pass)
- Greenfield projects
- Tasks with automatic verification (tests, linters)
- Batch deployments across multiple projects

**Not good for:**
- Tasks requiring human judgment
- One-shot operations
- Unclear success criteria
- Production debugging

## b0ase Use Cases

### Batch Tool Deployment
```bash
/ralph-loop "Deploy MoneyButton integration to all NPG Apps.
Check each project in /portfolio, add MoneyButton component,
verify it renders. Output <promise>BATCH_COMPLETE</promise>
when all projects updated." --max-iterations 50
```

### Primitive Perfection
```bash
/ralph-loop "Perfect the ScrollPay primitive:
1. Add error handling
2. Add retry logic
3. Add tests (>90% coverage)
4. Document API
Output <promise>PRIMITIVE_READY</promise>" --max-iterations 30
```

### Stack Integration
```bash
/ralph-loop "Integrate Divvy into Bitcoin OS apps:
- Bitcoin Corporation
- Bitcoin Apps
- BSV21
Run each, verify dividends flow.
Output <promise>INTEGRATION_COMPLETE</promise>" --max-iterations 40
```

## Safety

**WARNING**: Without limits, Claude will burn through tokens.

- Always use `--max-iterations`
- Start small (5-10 iterations) to test prompts
- Monitor token usage
- Use `/cancel-ralph` if needed

## Philosophy

1. **Iteration > Perfection** - Let the loop refine
2. **Failures Are Data** - Use them to tune prompts
3. **Operator Skill Matters** - Good prompts = good results
4. **Persistence Wins** - Keep trying until success

## References

- Original technique: https://ghuntley.com/ralph/
- Official plugin: https://github.com/anthropics/claude-code/tree/main/plugins/ralph-wiggum
