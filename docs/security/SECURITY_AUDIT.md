# Security Audit - b0ase.com

**Last Updated:** 2026-01-12
**Auditor:** Claude Opus 4.5
**Status:** In Progress

---

## Executive Summary

Security audit identified critical vulnerabilities in API authentication that have been **fixed and deployed**. Additional items remain for review.

---

## Fixed Issues (2026-01-12)

### Critical - API Authentication Bypass

| Severity | File | Issue | Status |
|----------|------|-------|--------|
| CRITICAL | `/api/admin/client-requests/route.ts` | `isAdmin()` always returned `true` | FIXED |
| CRITICAL | `/api/admin/client-requests/[id]/approve/route.ts` | `isAdmin()` always returned `true` | FIXED |
| CRITICAL | `/api/admin/client-requests/[id]/reject/route.ts` | `isAdmin()` always returned `true` | FIXED |
| CRITICAL | `/api/admin/client-requests/[id]/resend-approval-email/route.ts` | `isAdmin()` always returned `true` | FIXED |
| CRITICAL | `/api/clients/route.ts` | No authentication on PUT/DELETE | FIXED |
| HIGH | `/api/boardroom/chat/route.ts` | Weak auth (`tokens.length > 0` bypass) | FIXED |
| HIGH | `middleware.ts` | `/api/admin/*` routes not protected | FIXED |
| MEDIUM | Multiple files | Admin client created at module level | FIXED |

### Fixes Applied

1. **Middleware Protection** - All `/api/admin/*` routes now require authenticated admin (checks session + `ADMIN_EMAIL` env var)
2. **Proper Auth Functions** - Created `lib/auth/verifyAdmin.ts` shared helper
3. **Boardroom Chat** - Now requires Supabase session OR valid bot API key
4. **XSS Sanitization** - Chat messages now stripped of HTML/script tags
5. **Rate Limiting** - Chat GET limited to 100 messages

---

## Outstanding Items - Supabase/Database

### 1. BOARDROOM_BOT_API_KEY Environment Variable
**Priority:** Medium
**Action Required:** Add to `.env.local` and Vercel environment variables

```bash
BOARDROOM_BOT_API_KEY=<generate-a-secure-random-string>
```

This enables secure Telegram bot integration with the boardroom chat.

---

### 2. SECURITY DEFINER Functions
**Priority:** Medium
**Location:** PostgreSQL/Supabase

Functions with `SECURITY DEFINER` bypass RLS and run with creator's privileges. Audit these:

| Function | File | Risk |
|----------|------|------|
| `get_or_create_unified_user()` | `20260111030000_create_unified_users.sql` | Can create arbitrary user records |
| `merge_unified_users()` | `20260111030000_create_unified_users.sql` | Can merge accounts if exploited |
| Token balance functions | `20260111000000_create_token_balances.sql` | May allow balance manipulation |

**Recommendation:** Add input validation and rate limiting to these functions, or restrict who can call them.

---

### 3. Overly Permissive RLS Policies
**Priority:** Medium
**Pattern:** `USING (true)` allows all reads

| Table | Policy | Intentional? |
|-------|--------|--------------|
| `user_profiles` | SELECT with `USING (true)` | Review - may be intentional for public profiles |
| `chat_rooms` | SELECT with `USING (true)` | Review - may be intentional for public rooms |
| `boardroom_members` | SELECT with `USING (true)` | Review - may be intentional for member list |
| Video schema | SELECT with `USING (true)` | Review |

**Recommendation:** Confirm these are intentional. If not, restrict to authenticated users or specific roles.

---

### 4. Rate Limiting on POST Endpoints
**Priority:** Low-Medium
**Status:** Not Implemented

Consider adding rate limiting to prevent abuse:
- `/api/boardroom/chat` POST (message spam)
- `/api/client-request` POST (form spam)
- All public POST endpoints

**Options:**
- Vercel Edge Config rate limiting
- Upstash Redis rate limiter
- In-memory with cleanup (not recommended for serverless)

---

## Infrastructure Security - Hetzner Server

**Audit Date:** 2026-01-12
**Server:** REDACTED_HOST (ubuntu-4gb-hel1-1)

### Active Attack Detected
Brute force SSH attacks were in progress from multiple IPs:
- 103.147.14.18
- 103.75.68.132
- 92.118.39.87
- 80.94.92.168
- 195.178.110.x
- 2.57.121.112

### Fixes Applied

| Action | Status |
|--------|--------|
| Disable SSH password authentication | DONE |
| Enable key-only authentication | DONE |
| Set `PermitRootLogin without-password` | DONE |
| Max 3 auth attempts per connection | DONE |
| Install fail2ban | DONE |
| Configure fail2ban (24hr ban after 3 failures) | DONE |
| Block attacking IPs via UFW | DONE |
| Remove cloud-init SSH override | DONE |

### Current Security Status

```
SSH Config:
  - permitrootlogin: without-password
  - pubkeyauthentication: yes
  - passwordauthentication: no

UFW Firewall:
  - Status: active
  - Open ports: 22 (SSH), 80, 443, 8888
  - 5 IPs manually blocked

Fail2ban:
  - 6 IPs currently banned
  - Auto-bans after 3 failed attempts
  - Ban duration: 24 hours
```

### CRITICAL FINDING: This Server Hosts Your Database

**What's on this server:**
- `supabase-db` - PostgreSQL database (ALL YOUR DATA)
- `supabase-auth` - Authentication service
- `supabase-storage` - File storage
- `supabase-kong` - API gateway
- Multiple Supabase Studios (Ninja Punk Girls, Bitcoin AI, Divvy, etc.)
- `adminer` - Database admin UI (WAS PUBLICLY ACCESSIBLE)

### Additional Fixes Applied (2026-01-12)

| Issue | Action | Status |
|-------|--------|--------|
| Adminer exposed on :8080 | Container stopped and removed | FIXED |
| Supabase Studio exposed on :3000 | Blocked via iptables DOCKER-USER chain | FIXED |
| All studio ports (8001-8006) exposed | Blocked via iptables | FIXED |
| Direct DB port (54322) exposed | Blocked via iptables | FIXED |
| Docker bypassing UFW | Added DOCKER-USER iptables rules | FIXED |
| Iptables rules not persistent | Installed iptables-persistent | FIXED |

### Hetzner Recommendations

- [ ] Set up SSH key rotation schedule
- [ ] Consider changing SSH port from 22 to non-standard
- [ ] Enable automatic security updates (`unattended-upgrades`)
- [ ] Set up monitoring/alerting for failed SSH attempts
- [ ] Review what services are running on ports 80, 443, 8888
- [ ] Set up proper reverse proxy with auth for admin interfaces
- [ ] Consider moving database to managed service or private network

---

## Environment Variables Security

Ensure these are set and not exposed in client-side code:

| Variable | Purpose | Status |
|----------|---------|--------|
| `ADMIN_EMAIL` | Admin authentication | Required |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin DB operations | Required (server-side only) |
| `BOARDROOM_BOT_API_KEY` | Telegram bot auth | Needs to be added |
| `GMAIL_APP_PASSWORD` | Email sending | Check if needed |

---

## Next Steps

1. [ ] Generate and add `BOARDROOM_BOT_API_KEY` to environment
2. [ ] Audit SECURITY DEFINER functions in database
3. [ ] Review `USING (true)` RLS policies for intentionality
4. [ ] Consider rate limiting on public endpoints
5. [ ] Set up Hetzner monitoring/alerting
6. [ ] Schedule regular security reviews

---

## Security Checklist (Updated 2026-01-20)

Based on industry best practices and real-world attack prevention.

### API Security

| Check | Status | Notes |
|-------|--------|-------|
| ✅ Rate limiting on endpoints | ✅ DONE | Implemented on client-request, boardroom chat, client-login, invite-client |
| ✅ Authorization headers required | ✅ DONE | Admin routes require auth via middleware |
| ✅ IP block list for abuse prevention | ✅ DONE | fail2ban + UFW on Hetzner |
| ✅ CORS configured properly | ✅ DONE | Vercel handles; no wildcard `*` |
| ✅ Security headers (helmet equivalent) | ✅ DONE | Added in next.config.js (HSTS, X-Frame, CSP, etc.) |
| ✅ Input validation (frontend + backend) | ⚠️ PARTIAL | Zod on some routes; need comprehensive coverage |
| ✅ File upload limits | ✅ DONE | content-assets: 5GB (videos), brand-assets: 5MB (logos) - both auth required |
| ✅ ORM for DB (SQL injection prevention) | ✅ DONE | Prisma ORM + Supabase parameterized queries |
| ✅ Password hashing | ✅ DONE | Supabase Auth handles; bcrypt used |

### Authentication & Authorization

| Check | Status | Notes |
|-------|--------|-------|
| ✅ Session management secure | ✅ DONE | Supabase Auth + httpOnly cookies |
| ✅ Admin routes protected | ✅ DONE | Middleware checks session + ADMIN_EMAIL |
| ✅ No hardcoded credentials | ✅ DONE | Deleted old auth routes with fallbacks |
| ✅ API keys in env vars only | ✅ DONE | All secrets in .env.local / Vercel |
| ✅ Token expiry configured | ✅ DONE | Supabase handles refresh |

### Data Protection

| Check | Status | Notes |
|-------|--------|-------|
| ✅ XSS prevention | ✅ DONE | DOMPurify installed and used |
| ✅ CSRF protection | ✅ DONE | Next.js + Supabase handle |
| ✅ SQL injection prevention | ✅ DONE | Prisma + parameterized queries |
| ✅ Sensitive data not logged | ⚠️ REVIEW | Audit console.log statements |
| ✅ Error messages don't leak info | ⚠️ REVIEW | Some endpoints may be verbose |

### Infrastructure

| Check | Status | Notes |
|-------|--------|-------|
| ✅ SSH key-only auth | ✅ DONE | Password auth disabled on Hetzner |
| ✅ Firewall configured | ✅ DONE | UFW + iptables rules |
| ✅ Fail2ban active | ✅ DONE | 24hr ban after 3 failures |
| ✅ Admin UIs not exposed | ✅ DONE | Adminer removed; Studios blocked |
| ✅ HTTPS only | ✅ DONE | Vercel enforces SSL |
| ⬜ Automatic security updates | ⬜ TODO | Enable unattended-upgrades |
| ⬜ SSH key rotation | ⬜ TODO | Schedule regular rotation |

### Monitoring & Response

| Check | Status | Notes |
|-------|--------|-------|
| ⬜ Error logging/monitoring | ⬜ TODO | Set up alerting for anomalies |
| ⬜ Failed login alerts | ⬜ TODO | Monitor auth failures |
| ⬜ Rate limit breach alerts | ⬜ TODO | Alert on 429s spike |
| ✅ Audit trail for admin actions | ⚠️ PARTIAL | Some logging exists |

---

## Priority Actions

1. ~~**HIGH**: Implement rate limiting on all public POST endpoints~~ ✅ DONE (2026-01-20)
2. ~~**HIGH**: Add security headers in `next.config.js`~~ ✅ DONE (2026-01-20)
3. ~~**MEDIUM**: Audit file upload endpoints for size limits~~ ✅ DONE (2026-01-20)
4. **MEDIUM**: Add Zod validation to remaining API routes
5. **LOW**: Set up monitoring/alerting for security events

---

## Changelog

| Date | Action | By |
|------|--------|-----|
| 2026-01-20 | Implemented rate limiting on 4 public POST endpoints | Claude Opus 4.5 |
| 2026-01-20 | Added HTTP security headers to next.config.js | Claude Opus 4.5 |
| 2026-01-20 | Audited file upload limits (all endpoints have limits + auth) | Claude Opus 4.5 |
| 2026-01-20 | Added comprehensive security checklist | Claude Opus 4.5 |
| 2026-01-12 | Initial audit, fixed critical API auth issues | Claude Opus 4.5 |
| 2026-01-12 | Hetzner SSH hardening, fail2ban setup | Claude Opus 4.5 (separate instance) |
