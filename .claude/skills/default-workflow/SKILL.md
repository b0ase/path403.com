# Default Workflow - Specialist Routing

Automatically route tasks to the right specialists. This skill defines which agents, tools, and skills to use for different situations.

## When to Use

This skill is **always active**. Reference it when starting sessions or before major tasks.

## Agent Routing

### Use `Explore` Agent For:

**Any open-ended codebase search** - NOT Glob/Grep directly

```
- "Where is X handled?"
- "How does Y work?"
- "Find files related to Z"
- "What's the structure of..."
- "Understanding the architecture of..."
```

**Why**: Explore agents can iterate, follow leads, and provide context. Direct Glob/Grep often needs multiple rounds.

### Use `Plan` Agent For:

**Before implementing major features**

```
- New API routes affecting multiple files
- Database schema changes
- Authentication/authorization changes
- Payment flow modifications
- Any change touching 3+ files
```

**Why**: Gets architectural sign-off, identifies dependencies, prevents rework.

### Use `general-purpose` Agent For:

**Complex multi-step research**

```
- Cross-referencing multiple docs
- Investigating patterns across codebase
- Tasks requiring multiple tool types
- When you need to "figure something out"
```

### Use `Bash` Agent For:

**Git operations and command execution**

```
- Complex git workflows
- Running multiple commands
- Server operations via SSH
```

## Parallel Agent Patterns

**Launch multiple agents simultaneously when tasks are independent:**

```
Example: Before implementing a feature
- Agent 1 (Explore): Find existing patterns
- Agent 2 (Explore): Check for similar implementations
- Agent 3 (Plan): Draft implementation approach
```

**Do NOT parallelize when:**
- Task B depends on Task A's result
- You need to validate before continuing

## Skill Routing

### Before Commits

| Situation | Skill |
|-----------|-------|
| Any code change | `security-check` |
| Auth/payment code | `security-check` (mandatory) |
| Blog post content | `blog-formatter` |
| Standards compliance | `b0ase-standards` |

### Content Creation

| Situation | Skill |
|-----------|-------|
| Blog posts | `blog-formatter` then `human-first-blog` |
| Marketing copy | `copywriting` or `copy-editing` |
| Social media | `social-content` |
| SEO pages | `programmatic-seo` |

### Infrastructure

| Situation | Skill |
|-----------|-------|
| Deploying | `multi-deploy` |
| New client | `client-onboarding` |
| Server setup | `vps-hardening` |
| Health check | `health-check` (weekly) |

### Optimization

| Situation | Skill |
|-----------|-------|
| Landing pages | `page-cro` |
| Signup flows | `signup-flow-cro` |
| Forms | `form-cro` |
| Paywalls | `paywall-upgrade-cro` |

## Default Session Start Routine

When starting a new session or major task:

1. **Understand Context**
   - Use `cartographer:cartographer` if codebase has changed
   - Use `claude-supermemory:super-search` for past context

2. **Route to Specialists**
   - Exploration? → Explore agent
   - Implementation? → Plan agent first, then code
   - Content? → Appropriate content skill

3. **Before Finishing**
   - Security check if code changed
   - Blog formatter if content created
   - Commit with proper message

## Anti-Patterns to Avoid

### Don't Do This:

```
# Direct search when exploring
Glob: **/*.ts  # Too broad, wastes context

# Manual multi-file reads
Read: file1.ts
Read: file2.ts
Read: file3.ts  # Use Explore agent instead

# Implementing without planning
[Immediately writing code for complex feature]
```

### Do This Instead:

```
# Use Explore agent for discovery
Task(Explore): "Find how authentication is handled"

# Use Plan agent for complex features
Task(Plan): "Design approach for new payment flow"

# Parallel agents for independent research
Task(Explore): "Find auth patterns" +
Task(Explore): "Find payment patterns"  # Parallel
```

## Quick Reference

| Task Type | First Action |
|-----------|--------------|
| "Where is..." | Explore agent |
| "How does..." | Explore agent |
| "Implement..." | Plan agent → then code |
| "Write blog..." | blog-formatter skill |
| "Deploy..." | multi-deploy skill |
| "Check security..." | security-check skill |
| "Review code..." | b0ase-standards skill |

## Integration with Supermemory

After completing significant work:
- Knowledge is automatically captured by `continuous-learning` skill
- Use `claude-supermemory:super-search` to recall past work
- Codebase map stays current via `cartographer:cartographer`

---

**This workflow maximizes efficiency by routing to the right specialist for each task type.**
