# Security Quick Reference

> **Full details:** `docs/SECURITY_FINDINGS.md`

## ✅ What's Actually Safe (Ignore Security Scan)

The security scan flags these as issues, but they're **false positives**:

- ❌ "Hardcoded API Keys" → Just validation code (`if (key.startsWith('sk-'))`)
- ❌ "SQL Injection" → All queries use Supabase parameterized methods
- ❌ "Hardcoded Passwords" → Just React state (`useState('')`)
- ❌ "eval() usage" → Doesn't exist in our code
- ❌ "Weak Hashing" → No MD5/SHA1 in our code

**Your new token management tools are secure.** ✅

---

## ⚠️ Real Issues to Fix (4 remaining)

### Priority 1: XSS Risk - ✅ FIXED (2026-01-17)
**Status:** ✅ **RESOLVED**

What we did:
- ✅ Installed DOMPurify
- ✅ Fixed `app/agent/page.tsx:320` (chat messages - real XSS risk)
- ✅ Documented `app/layout.tsx` instances (safe - static code, no user input)

---

### Priority 2: Missing Rate Limiting
**No rate limiting on `/api/*` routes**

Quick fix: Add middleware (see `docs/SECURITY_FINDINGS.md`)

---

### Priority 3-5: Minor Issues
- Input validation could use Zod (works fine without it)
- CORS config (Vercel handles this)
- Error messages could be less verbose

---

## Quick Commands

```bash
# Check for real secrets
grep -r "sk-ant-api" --include="*.ts" . | grep -v node_modules

# Run security scan (expect false positives)
bash .claude/skills/security-check/scripts/scan.sh .

# Check dependencies
pnpm audit
```

---

**For detailed analysis:** Read `docs/SECURITY_FINDINGS.md`
