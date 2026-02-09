# Trail of Bits Skills Repository - Analysis & Learnings

## Repository Overview

**Repository**: https://github.com/trailofbits/skills
**Purpose**: Security-focused Claude Code plugin marketplace
**Structure**: Plugin-based (not just skills)
**Focus**: Security auditing, smart contracts, penetration testing

## Key Differences from Vercel's Agent Skills

### 1. Plugin Architecture vs Skills-Only

**Trail of Bits** uses a full plugin system:
```
plugins/
  <plugin-name>/
    .claude-plugin/
      plugin.json         # Plugin metadata
    skills/               # Knowledge/guidance
    commands/             # Slash commands
    agents/               # Autonomous agents
    hooks/                # Event hooks
    README.md
```

**Vercel** uses skills-only:
```
skills/
  <skill-name>/
    SKILL.md
    scripts/
    references/
```

**Key Insight**: Plugins are a superset of skills. They can include multiple skills plus commands/agents/hooks.

### 2. Quality Standards

Trail of Bits has stricter quality requirements:

| Requirement | Trail of Bits | Our Current Approach |
|-------------|---------------|----------------------|
| **SKILL.md length** | <500 lines | No hard limit |
| **Progressive disclosure** | Required (references/, workflows/) | Implemented |
| **"When NOT to use"** | Required section | Optional |
| **"Rationalizations to Reject"** | Required for security skills | Not included |
| **allowed-tools** | Explicit whitelist in frontmatter | Not used |
| **Python dependencies** | PEP 723 inline metadata + uv | Bash scripts only |

### 3. Security-First Philosophy

Trail of Bits skills emphasize:

**1. Misuse-Resistant Design** (from `sharp-edges` skill)
- Identify "footgun" APIs
- Enforce "pit of success" pattern
- Reject rationalizations ("it's documented", "advanced users need it")

**2. Prescriptiveness Based on Risk**
- Strict for fragile tasks (security audits, crypto)
- Flexible for variable tasks (code exploration, refactoring)

**3. Behavioral Guidance Over Reference Dumps**
- Don't paste entire specs
- Teach WHEN and HOW to look things up
- Explain WHY, not just WHAT

### 4. Python Scripts with PEP 723

Instead of bash scripts, Trail of Bits uses Python with inline dependency declarations:

```python
#!/usr/bin/env python3
# /// script
# requires-python = ">=3.11"
# dependencies = [
#     "pypdf>=3.0",
#     "pydantic>=2.0"
# ]
# ///

import sys
from pypdf import PdfReader
# Script code...
```

**Benefits**:
- Auto dependency resolution with `uv run`
- Type hints and better tooling
- More robust error handling
- Cross-platform compatibility

### 5. Progressive Disclosure Pattern

Trail of Bits enforces clean information architecture:

**SKILL.md** (entry point, <500 lines):
```markdown
## Quick Start
[Core instructions]

## Advanced Usage
See [ADVANCED.md](references/ADVANCED.md)

## API Reference
See [API.md](references/API.md)
```

**references/** (detailed docs):
- Language-specific guides
- Deep technical documentation
- API references

**workflows/** (step-by-step procedures):
- Audit checklists
- Testing procedures
- Multi-step processes

## Standout Skills to Learn From

### 1. sharp-edges

**Purpose**: Identify misuse-prone API designs

**What Makes It Great**:
- "Rationalizations to Reject" section counters common excuses
- Three adversary model: Scoundrel, Lazy Developer, Confused Developer
- Real examples from JWT, PHP, libsodium vulnerabilities
- Tests for "secure by default" principle

**Applicable to b0ase**:
- API design reviews for clients
- Security-critical configuration validation
- Client handoff documentation (avoiding footguns)

### 2. constant-time-analysis

**Purpose**: Detect timing side-channels in cryptographic code

**What Makes It Great**:
- Python package with dependencies
- Uses `uv run` for auto dependency management
- Compiler-specific guidance
- Real-world examples from production bugs

**Applicable to b0ase**:
- Crypto implementation reviews
- Payment processing security
- Authentication timing attacks

### 3. differential-review

**Purpose**: Security-focused review of code changes

**What Makes It Great**:
- Git history analysis
- Before/after security comparison
- Focus on security-relevant changes
- Automated detection of risk patterns

**Applicable to b0ase**:
- Pre-deployment reviews
- Client code audit workflow
- PR security analysis

### 4. ask-questions-if-underspecified

**Purpose**: Clarify requirements before implementing

**What Makes It Great**:
- Simple, focused skill
- Prevents wasted effort
- Encourages specification clarity

**Applicable to b0ase**:
- Client requirements gathering
- Project scoping
- Reduce rework

### 5. audit-context-building

**Purpose**: Build deep architectural context through granular code analysis

**What Makes It Great**:
- Ultra-thorough analysis methodology
- Creates comprehensive architectural understanding
- Documents dependencies and data flows

**Applicable to b0ase**:
- Legacy code analysis
- Client project onboarding
- Architecture documentation generation

## What to Adopt for b0ase Skills

### Immediate Improvements

1. **Add "When NOT to Use" sections** to all skills
   - Helps AI agent select correct skill
   - Sets boundaries and expectations

2. **Add "allowed-tools" frontmatter**
   - Restricts skills to needed tools
   - Improves performance and safety

3. **Enforce <500 line SKILL.md limit**
   - Move detailed content to references/
   - Improve readability and activation speed

4. **Add "Rationalizations to Reject"** to security-check skill
   - Counter common security excuses
   - Strengthen audit quality

### Medium-Term Enhancements

5. **Convert to full plugin architecture**
   ```
   plugins/b0ase-suite/
     .claude-plugin/plugin.json
     skills/
       ai-content-engine/
       security-check/
       b0ase-standards/
     commands/
       /deploy
       /audit
       /onboard
     agents/
       security-auditor
   ```

6. **Add Python scripts with PEP 723**
   - More robust than bash for complex logic
   - Better error handling
   - Type safety with mypy

7. **Create workflows/ directories**
   - Step-by-step procedures
   - Audit checklists
   - Testing protocols

### Long-Term Goals

8. **Build security-focused skills**
   - API footgun detector (inspired by sharp-edges)
   - Timing attack analyzer
   - Permission model validator
   - OWASP Top 10 scanner

9. **Create autonomous agents**
   - Auto security auditor
   - Performance optimizer
   - Documentation generator

10. **Event hooks**
    - Pre-commit security scan
    - Pre-deployment checklist
    - Post-deploy verification

## Recommended New Skills for b0ase

Based on Trail of Bits patterns:

### 1. API Design Checker (`api-footguns`)
Inspired by `sharp-edges`, checks client APIs for:
- Dangerous defaults
- Configuration cliffs
- Algorithm selection vulnerabilities
- Type confusion risks

### 2. Permission Model Validator (`permission-check`)
Analyzes authorization logic:
- IDOR vulnerabilities
- Privilege escalation paths
- Missing authorization checks
- Role-based access control gaps

### 3. Performance Profiler (`perf-analyzer`)
Client performance auditing:
- Bundle size analysis
- Render performance
- Database query optimization
- API response time profiling

### 4. Dependency Security Scanner (`dep-security`)
Enhanced dependency checking:
- CVE database lookups
- License compliance
- Outdated package detection
- Supply chain risk assessment

### 5. Documentation Generator (`doc-gen`)
Auto-generate client docs:
- API documentation from code
- Architecture diagrams from structure
- Deployment runbooks
- Troubleshooting guides

## Implementing Full Plugin Support

To upgrade our skills to plugins:

### Step 1: Restructure

```bash
# Current structure
skills/
  ai-content-engine/SKILL.md
  security-check/SKILL.md

# New plugin structure
plugins/b0ase-suite/
  .claude-plugin/
    plugin.json
  skills/
    ai-content-engine/
      SKILL.md
      references/
      workflows/
    security-check/
      SKILL.md
      references/
      workflows/
  commands/
    deploy.md
    audit.md
  agents/
    security-auditor/
      AGENT.md
```

### Step 2: Create plugin.json

```json
{
  "name": "b0ase-suite",
  "version": "1.0.0",
  "description": "Professional b0ase.com development and security tools",
  "author": {
    "name": "b0ase.com",
    "url": "https://b0ase.com"
  },
  "keywords": ["security", "deployment", "ai-content", "standards"],
  "license": "MIT"
}
```

### Step 3: Add Commands

```markdown
# commands/deploy.md
---
name: deploy
description: "Deploy application to production"
---

Deploys current project to production using multi-deploy skill.

Usage: /deploy [platform]
Platforms: vercel, netlify, railway, fly, auto

This command activates the multi-deploy skill with production environment.
```

### Step 4: Add Autonomous Agents

```markdown
# agents/security-auditor/AGENT.md
---
name: security-auditor
description: "Autonomous security audit agent"
allowed-tools:
  - Read
  - Grep
  - Bash
---

Performs comprehensive security audit without user intervention:
1. Runs security-check skill
2. Analyzes findings
3. Suggests fixes
4. Re-scans after fixes
5. Generates report

Automatically invoked before production deploys.
```

## Comparison Matrix

| Feature | Vercel Skills | Trail of Bits Plugins | b0ase Current | b0ase Future |
|---------|---------------|----------------------|---------------|--------------|
| **Skills** | ✓ | ✓ | ✓ | ✓ |
| **Commands** | ✗ | ✓ | ✗ | ✓ |
| **Agents** | ✗ | ✓ | ✗ | ✓ |
| **Hooks** | ✗ | ✓ | ✗ | ✓ |
| **Python Scripts** | ✗ | ✓ (PEP 723) | ✗ | ✓ |
| **Bash Scripts** | ✓ | Limited | ✓ | ✓ |
| **Progressive Disclosure** | ✓ | ✓ (enforced) | ✓ | ✓ |
| **Security Focus** | ✗ | ✓✓✓ | ✓ | ✓✓ |
| **Quality Standards** | Basic | Strict | Good | Strict |
| **Marketplace** | No | Yes | No | Yes |

## Action Plan

### Phase 1: Immediate (This Week)

- [x] Create security-check skill ✓
- [ ] Add "When NOT to Use" to all existing skills
- [ ] Add "allowed-tools" frontmatter to all skills
- [ ] Add "Rationalizations to Reject" to security-check
- [ ] Limit SKILL.md files to <500 lines

### Phase 2: Short-Term (Next 2 Weeks)

- [ ] Convert to plugin architecture
- [ ] Create plugin.json
- [ ] Add /deploy, /audit, /onboard commands
- [ ] Create references/ directories for detailed docs
- [ ] Add workflows/ for step-by-step procedures

### Phase 3: Medium-Term (Next Month)

- [ ] Add Python scripts with PEP 723
- [ ] Create api-footguns skill
- [ ] Create permission-check skill
- [ ] Create autonomous security-auditor agent
- [ ] Add pre-commit hook integration

### Phase 4: Long-Term (Next Quarter)

- [ ] Build b0ase plugin marketplace
- [ ] Create performance-analyzer skill
- [ ] Create doc-generator skill
- [ ] Add event hooks system
- [ ] Publish to public marketplace

## Key Takeaways

1. **Plugins > Skills**: Full plugin architecture adds commands, agents, hooks
2. **Quality Matters**: Trail of Bits' strict standards produce better skills
3. **Security Focus**: "Rationalizations to Reject" section is brilliant
4. **Python + PEP 723**: Better than bash for complex automation
5. **Progressive Disclosure**: Essential for large skills
6. **Prescriptiveness by Risk**: Strict for security, flexible for exploration
7. **Behavioral Guidance**: Teach WHEN/HOW/WHY, not just reference dumps

## Resources

- **Trail of Bits Skills**: https://github.com/trailofbits/skills
- **Claude Code Plugins Docs**: https://docs.anthropic.com/en/docs/claude-code/plugins
- **Agent Skills Spec**: https://agentskills.io/
- **PEP 723 (Inline Script Metadata)**: https://peps.python.org/pep-0723/
- **Sharp Edges Philosophy**: Trail of Bits security principles
- **uv Documentation**: https://docs.astral.sh/uv/

## Conclusion

Trail of Bits demonstrates that skills can be:
- **More sophisticated** (plugins with commands/agents/hooks)
- **Higher quality** (strict standards, progressive disclosure)
- **Security-focused** (rejecting rationalizations, footgun detection)
- **Better engineered** (Python + PEP 723, proper dependency management)

We should adopt their best practices while maintaining our focus on client services, deployment automation, and AI content businesses.

The immediate win is adding "When NOT to Use" sections and "Rationalizations to Reject" to our security-check skill. The long-term vision is a full plugin marketplace for b0ase.com clients.
