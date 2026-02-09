---
name: security-audit
description: Security audit for vibe-coded MVPs. Use when you need a full codebase security review with practical, minimal fixes. Triggers on "security audit", "audit security", "full security review", "MVP security check".
license: MIT
metadata:
  author: b0ase.com
  version: "1.0.0"
---

# Security Audit for Vibe Coded MVPs

Quick, practical security audits focused on high-impact vulnerabilities with minimal fixes.

## When to Use

**Use this skill when:**
- Reviewing a new or unfamiliar codebase
- Before launching an MVP to production
- After major feature additions
- Periodic security reviews (monthly/quarterly)
- Onboarding to a new project

**Use `security-check` instead when:**
- Pre-commit checks (faster, automated)
- Checking specific files or changes
- Running automated scans

## The 3-Phase Approach

### Phase 1: Codebase Scan

Review the entire repository, with extra focus on:
- Authentication flows
- API endpoints
- Database queries
- Environment variables and secrets
- User input handling

For every risky issue, flag it with:
- File name + line number
- Clear explanation of what's wrong
- Priority level: **Critical / High / Medium / Low**

### Phase 2: Risk Analysis + Fix Plan

For each issue:
1. Explain what the vulnerability is
2. Describe how it could be exploited
3. Recommend the smallest possible fix
4. Explain how the fix improves security

**Guidelines:**
- Avoid overengineering
- Focus on practical fixes
- Do not break existing functionality

### Phase 3: Secure Fixes

For approved fixes:
- Make minimal changes only
- Show a before / after diff
- Verify the fix works and doesn't introduce new issues
- Flag anything that requires manual testing

## Focus Areas to Prioritize

Pay special attention to:
- Leaked API keys or credentials
- Missing rate limits
- Broken or bypassable authentication
- Insecure Direct Object References (IDOR)
- Missing server-side validation
- Poor error handling that leaks information
- Sensitive data exposed unnecessarily

## Output Format

Return the final report as a clean Markdown list:

```markdown
# Security Audit Report

**Date:** YYYY-MM-DD
**Scope:** [repository/feature name]

## Summary

| Severity | Count |
|----------|-------|
| Critical | X |
| High | X |
| Medium | X |
| Low | X |

## Critical Issues

### 1. [Issue Title]
- **File:** `path/to/file.ts:123`
- **Issue:** Clear explanation
- **Exploit:** How it could be attacked
- **Fix:** Minimal recommended fix
- **Status:** [ ] Pending / [x] Fixed

## High Issues
...

## Recommendations

1. Priority fixes
2. Quick wins
3. Future improvements
```

## Usage

### Via Claude Code

Simply ask:
- "Run a security audit"
- "Audit security of this codebase"
- "Full security review"
- "Check this MVP for vulnerabilities"

### Manual Invocation

```
/security-audit
```

## Comparison with security-check

| Feature | security-audit | security-check |
|---------|---------------|----------------|
| Scope | Full codebase | Specific files/changes |
| Speed | Thorough (slower) | Fast (pre-commit) |
| Output | Detailed report | Pass/fail + issues |
| When | Periodic reviews | Every commit |
| Focus | High-impact vulns | All vulnerabilities |

## Best Practices

1. **Be precise** - Exact file and line numbers
2. **Be realistic** - Prioritize impact over perfection
3. **Be practical** - Smallest possible fixes
4. **Be clear** - Easy to share with team

## See Also

- `.claude/skills/security-check/` - Pre-commit security scanning
- `.claude/skills/b0ase-standards/` - Code standards compliance
- `CLAUDE.md` - Project security guidelines
