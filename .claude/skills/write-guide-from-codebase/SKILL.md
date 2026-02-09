---
name: write-guide-from-codebase
description: Analyze codebases and generate comprehensive technical guides automatically. Perfect for creating documentation from existing code.
allowed-tools:
  - Read
  - Glob
  - Grep
  - Bash
---

# Write Guide from Codebase

Automatically analyze code sections and generate comprehensive technical documentation with architecture explanations, examples, and best practices.

## When to Use

Trigger this skill when:
- **Creating documentation** - "Write a guide for this authentication system"
- **Explaining architecture** - "Document how the API layer works"
- **Onboarding materials** - "Create a guide for new developers"
- **Technical tutorials** - "Generate a walkthrough of the payment flow"

**Keywords**: write guide, document code, create documentation, explain architecture, codebase tutorial

## What It Does

### 1. Code Analysis

Analyzes your codebase to understand:
- Architecture and design patterns
- Data flow and dependencies
- Key components and their relationships
- Implementation details
- Best practices used

### 2. Guide Generation

Creates comprehensive markdown guides with:
- **Overview** - Purpose and high-level architecture
- **Step-by-step walkthrough** - How the code works
- **Code examples** - Annotated snippets with explanations
- **Diagrams** - Mermaid diagrams for visual concepts
- **Best practices** - What's done well and why
- **Common pitfalls** - What to avoid

### 3. Diagram Extraction

Identifies concepts that need visual explanation and:
- Suggests mermaid diagram structures
- Extracts diagram descriptions for image generation
- Documents component relationships
- Maps data flows

## Usage

### Generate Guide from Code Pattern

```bash
# Analyze authentication system
bash ~/.claude/skills/write-guide-from-codebase/scripts/generate.sh \
  "src/auth/**/*.ts" \
  "Authentication System Guide"

# Document API layer
bash ~/.claude/skills/write-guide-from-codebase/scripts/generate.sh \
  "src/api/**/*.{ts,js}" \
  "API Architecture Guide"

# Explain specific component
bash ~/.claude/skills/write-guide-from-codebase/scripts/generate.sh \
  "src/components/checkout/*.tsx" \
  "Checkout Flow Tutorial"
```

### Through Claude

Just describe what you want documented:

```
"Write a guide explaining how the authentication system works"
"Document the payment processing flow"
"Create a tutorial for the API architecture"
```

## What You Get

### Output Files

**Main guide**: `{guide-title}.md` with complete documentation

**Diagram descriptions**: Extracted mermaid diagrams ready for visualization

**Metadata**: JSON output with paths and statistics

### Guide Structure

```markdown
# Guide Title

## Overview
High-level purpose and architecture

## Architecture
Component relationships and design patterns

## Implementation
Step-by-step code walkthrough

## Code Examples
Annotated snippets with explanations

## Diagrams
Mermaid diagrams for visual concepts

## Best Practices
What's done well and why

## Common Pitfalls
What to avoid and why

## Next Steps
How to extend or modify
```

## Configuration

### Environment Variables

```bash
# Required
export ANTHROPIC_API_KEY="sk-ant-xxx"

# Optional
export GUIDE_OUTPUT_DIR="./docs/guides"
export GUIDE_MAX_FILES=50
export GUIDE_MAX_TOKENS=8000
```

### Custom Templates

Create `~/.claude/guide-template.md` to customize output format:

```markdown
# {{title}}

{{overview}}

## Technical Details
{{architecture}}

{{implementation}}
```

## Examples

### Example 1: Authentication System

**Input:**
```bash
bash generate.sh "src/auth/**/*.ts" "Auth System Guide"
```

**Output:**
- Complete guide explaining JWT flow
- Mermaid sequence diagram of login
- Code examples with annotations
- Security best practices
- Common pitfalls documented

### Example 2: API Documentation

**Input:**
```bash
bash generate.sh "src/api/routes/*.ts" "API Routes Guide"
```

**Output:**
- REST API architecture overview
- Endpoint documentation
- Middleware flow diagram
- Request/response examples
- Error handling patterns

### Example 3: Component Guide

**Input:**
```bash
bash generate.sh "components/forms/**/*" "Forms Architecture"
```

**Output:**
- Form system explanation
- Validation flow diagram
- Reusable component examples
- State management patterns
- Accessibility considerations

## Advanced Features

### Smart File Selection

The skill intelligently selects relevant files:
- Follows imports and dependencies
- Identifies entry points
- Includes configuration files
- Filters test files (optional)

### Context-Aware Analysis

Generates guides that:
- Match your project's patterns
- Use your naming conventions
- Reference your architecture decisions
- Align with your code style

### Diagram Generation

Automatically suggests diagrams for:
- Sequence flows (authentication, checkout)
- Component hierarchies (React trees)
- Data models (database schemas)
- Architecture (microservices, layers)

## Integration

### With Other Skills

Combine with other skills for complete documentation:

```bash
# Generate guide + images + upload to Notion
bash guide-writer-agent.sh "src/auth/**/*.ts" "Auth Guide"

# Generate guide + deploy to docs site
bash generate.sh "src/**/*.ts" "Full Docs" && npm run deploy-docs
```

### CI/CD Integration

Add to GitHub Actions:

```yaml
- name: Generate Documentation
  run: |
    bash ~/.claude/skills/write-guide-from-codebase/scripts/generate.sh \
      "src/**/*.ts" \
      "Architecture Guide"

    git add docs/
    git commit -m "docs: update architecture guide"
```

### Pre-Commit Hook

Auto-update guides on code changes:

```bash
#!/bin/bash
# .git/hooks/pre-commit

if git diff --cached --name-only | grep -q "^src/auth/"; then
  bash generate.sh "src/auth/**/*.ts" "Auth Guide"
  git add docs/auth-guide.md
fi
```

## When NOT to Use

**Don't use this skill for:**
- ❌ **API reference generation** - Use TypeDoc, JSDoc, or similar
- ❌ **Simple README files** - Write manually for personal touch
- ❌ **Changelogs** - Use conventional commits + automation
- ❌ **Code comments** - Add inline documentation directly
- ❌ **Small scripts** - Documentation overhead not worth it

**Use instead:**
- API reference → TypeDoc, Swagger, JSDoc
- README → Manual writing with project context
- Changelogs → conventional-changelog, release-please
- Comments → Inline documentation in code

## Troubleshooting

### Too Many Files Error

**Problem:** Pattern matches too many files

**Solution:**
```bash
# Be more specific with patterns
generate.sh "src/auth/core/*.ts" "Auth Core"

# Or set file limit
export GUIDE_MAX_FILES=100
generate.sh "src/**/*.ts" "Full Guide"
```

### Out of Context Error

**Problem:** Code section too large for analysis

**Solution:**
```bash
# Break into smaller sections
generate.sh "src/auth/jwt/*.ts" "JWT Guide"
generate.sh "src/auth/oauth/*.ts" "OAuth Guide"

# Or increase token limit (costs more)
export GUIDE_MAX_TOKENS=16000
generate.sh "src/auth/**/*.ts" "Auth Guide"
```

### Poor Quality Output

**Problem:** Guide lacks detail or accuracy

**Solution:**
- Include more context files
- Add README or architecture docs to pattern
- Use more specific guide titles
- Review and manually enhance

## Technical Details

### How It Works

1. **File Discovery** - Glob patterns find relevant files
2. **Content Reading** - Files read and formatted
3. **Analysis** - Claude analyzes architecture and patterns
4. **Generation** - Comprehensive guide written
5. **Diagram Extraction** - Mermaid diagrams identified
6. **Output** - Markdown saved with metadata

### Performance

- **Small projects** (<10 files): ~30 seconds
- **Medium projects** (10-50 files): ~2 minutes
- **Large projects** (50+ files): Consider splitting

### Cost Estimation

Using Claude Sonnet 4.5:
- Small guide (2K tokens): ~$0.01
- Medium guide (5K tokens): ~$0.025
- Large guide (8K tokens): ~$0.04

## Quality Standards

Generated guides should:
- ✅ Be accurate and up-to-date with code
- ✅ Include working code examples
- ✅ Explain "why" not just "what"
- ✅ Provide visual diagrams for complex flows
- ✅ Document best practices and pitfalls
- ✅ Be readable by developers at all levels

## Future Enhancements

Planned features:
- [ ] Multi-language support (Python, Go, Rust)
- [ ] Interactive examples with CodeSandbox
- [ ] Video walkthrough generation
- [ ] Diff-based guide updates
- [ ] Custom prompt templates
- [ ] Integration with documentation sites

## Reference

- **Script**: `scripts/generate.sh`
- **Dependencies**: Claude API, glob, fs
- **Output**: Markdown guides
- **Performance**: ~2 minutes for medium projects

---

**Questions?** See the main skills README or contact richard@b0ase.com
