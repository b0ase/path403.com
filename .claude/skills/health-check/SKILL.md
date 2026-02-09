---
name: b0ase-health-check
description: Comprehensive health check for b0ase.com project. Run weekly or before major releases to verify security, code quality, documentation, performance, and infrastructure. Triggers on "health check", "system check", "run periodic check", "verify b0ase health".
allowed-tools:
  - Bash
  - Read
  - Grep
---

# b0ase.com Health Check

Comprehensive periodic health check for the b0ase.com project. Run weekly or before major releases.

## When to Use

- **Weekly**: Every Monday morning
- **Before releases**: Prior to major deployments
- **After incidents**: Post-mortem verification
- **Onboarding**: New team members validating setup
- **Audits**: Security or compliance reviews

## How to Run

### Automated Full Check

```bash
bash .claude/skills/health-check/scripts/check.sh
```

Runs all checks and generates report.

### Manual Checklist

Use the checklists below to verify system health manually.

## 1. Security Health Check

### Critical Security

- [ ] **No CRITICAL vulnerabilities**: Run `pnpm audit` - zero critical issues
- [ ] **No HIGH vulnerabilities**: Run `pnpm audit` - zero high issues
- [ ] **Security scan passes**: Run `bash .claude/skills/security-check/scripts/scan.sh .`
- [ ] **No secrets in code**: Search codebase for hardcoded keys/passwords
- [ ] **No secrets in git history**: Run `git log -p | grep -E 'sk_live_|API_KEY.*sk_'`

### Authentication & Authorization

- [ ] **All API routes authenticated**: Check `app/api/` for missing auth checks
- [ ] **Session tokens secure**: Tokens in httpOnly cookies (not localStorage)
- [ ] **Password hashing strong**: Using bcrypt with salt rounds ≥ 12
- [ ] **OAuth configured**: All providers (Google, GitHub) working
- [ ] **Wallet auth working**: MetaMask, Phantom, HandCash functional

### Input Validation

- [ ] **All API inputs validated**: Check for Zod schemas on POST/PUT routes
- [ ] **File uploads restricted**: Type and size limits enforced
- [ ] **SQL parameterized**: No string concatenation in queries
- [ ] **XSS protection**: DOMPurify used for user HTML

### Access Control

- [ ] **CORS configured**: No wildcard `*` origins in production
- [ ] **Rate limiting active**: Check API routes have rate limiters
- [ ] **RBAC enforced**: Role checks on admin routes
- [ ] **Resource ownership**: Users can only access their own data

## 2. Code Quality Health Check

### Standards Compliance

- [ ] **Standards audit passes**: Run `bash .claude/skills/b0ase-standards/scripts/audit.sh .`
- [ ] **pnpm used exclusively**: No `package-lock.json` or `yarn.lock` exists
- [ ] **TypeScript strict mode**: Check `tsconfig.json` has `"strict": true`
- [ ] **No `any` types**: Search for `any` in new code (last week)
- [ ] **Pre-commit hooks installed**: Check `.git/hooks/pre-commit` exists and works

### Build & Tests

- [ ] **Tests passing**: Run `pnpm test` - all tests green
- [ ] **Build succeeds**: Run `pnpm build` - no errors
- [ ] **Type check passes**: Run `npx tsc --noEmit` - no type errors
- [ ] **Lint passes**: Run `pnpm lint` (if configured)

### Code Hygiene

- [ ] **No console.logs**: Search `app/` and `lib/` for `console.log`
- [ ] **Error handling**: All async functions have try/catch
- [ ] **No commented code**: Clean up old commented blocks
- [ ] **No TODOs without tickets**: Search for `TODO` - link to issues

## 3. Documentation Health Check

### Core Documentation

- [ ] **README.md current**: Last updated < 30 days ago
- [ ] **CLAUDE.md current**: Skills and workflows documented
- [ ] **.env.example complete**: All required variables listed
- [ ] **API documented**: Routes have OpenAPI comments or separate docs
- [ ] **Database schema documented**: Prisma models have comments

### Feature Documentation

- [ ] **New features documented**: Recent PRs have corresponding docs
- [ ] **Deployment guide current**: Vercel deployment steps accurate
- [ ] **Troubleshooting updated**: Common issues and solutions documented
- [ ] **Architecture diagram current**: System design reflects reality

### Team Documentation

- [ ] **Onboarding guide exists**: New developers have setup guide
- [ ] **Runbooks exist**: Incident response procedures documented
- [ ] **Handoff docs current**: Client-facing documentation up-to-date

## 4. Performance Health Check

### Bundle Size

- [ ] **Bundle analyzed**: Run `pnpm build` and check output size
- [ ] **Main bundle < 200KB**: First load JS under target
- [ ] **Code splitting active**: Dynamic imports used for heavy components
- [ ] **Tree shaking working**: Unused exports removed

### Asset Optimization

- [ ] **Images optimized**: Run `pnpm run optimize:images`
- [ ] **Videos optimized**: Run `pnpm run optimize:videos`
- [ ] **SVGs optimized**: SVGO or manual optimization done
- [ ] **Fonts subset**: Only required character sets loaded

### Database Performance

- [ ] **Queries indexed**: Frequently queried fields have indexes
- [ ] **No N+1 queries**: Check for loops with database calls
- [ ] **Connection pooling**: Prisma connection pool configured
- [ ] **Query optimization**: Slow queries identified and optimized

### Caching

- [ ] **API responses cached**: Cache headers on static responses
- [ ] **Static assets cached**: Long cache for `/public` files
- [ ] **Edge caching**: Vercel edge caching configured
- [ ] **Database caching**: Redis or similar for hot data (if applicable)

## 5. Infrastructure Health Check

### Deployment

- [ ] **Vercel deployment working**: Last deploy successful
- [ ] **Environment variables set**: All required vars in Vercel dashboard
- [ ] **DNS configured**: `b0ase.com` resolves correctly
- [ ] **SSL certificate valid**: HTTPS working, cert not expiring soon

### Database

- [ ] **Supabase accessible**: Database connection working
- [ ] **Backups enabled**: Daily backups configured in Supabase
- [ ] **Migrations applied**: Prisma migrations match Supabase schema
- [ ] **Connection limits**: Not hitting connection pool limits

### Monitoring

- [ ] **Error tracking active**: Errors logged (Vercel logs or Sentry)
- [ ] **Performance monitoring**: Vercel Analytics enabled
- [ ] **Uptime monitoring**: Status check configured
- [ ] **Alerts configured**: Notifications for critical errors

### Third-Party Services

- [ ] **Supabase healthy**: Service status green
- [ ] **Vercel healthy**: No ongoing incidents
- [ ] **API quotas**: OpenAI, Anthropic quotas not exceeded
- [ ] **Blockchain RPC**: BSV, ETH, SOL nodes accessible

## 6. Security Compliance Check

### OWASP Top 10

- [ ] **SQL Injection**: Parameterized queries only
- [ ] **XSS**: Sanitization on user input
- [ ] **CSRF**: Tokens on state-changing operations
- [ ] **Authentication**: Secure session management
- [ ] **Access Control**: Proper authorization checks
- [ ] **Security Misconfiguration**: No debug mode in production
- [ ] **Sensitive Data Exposure**: Secrets in env vars only
- [ ] **Insufficient Logging**: Critical actions logged
- [ ] **Known Vulnerabilities**: Dependencies up-to-date
- [ ] **Injection Flaws**: Input validation everywhere

### Blockchain Security

- [ ] **Private keys secure**: Never stored server-side
- [ ] **Transaction validation**: All inputs validated before signing
- [ ] **Gas estimation**: Proper error handling for failed estimates
- [ ] **Address validation**: Checksums and format validation
- [ ] **Confirmation monitoring**: Block confirmations tracked

### Payment Security

- [ ] **Price validation server-side**: Never trust client prices
- [ ] **Payment logging**: All transactions logged
- [ ] **Refund handling**: Process in place for failures
- [ ] **Margin protection**: 25% margin enforced in calculations

## 7. Business Logic Health Check

### Critical Flows

- [ ] **User registration**: New users can sign up successfully
- [ ] **Authentication**: Login with OAuth and wallets works
- [ ] **Payment processing**: Test payment flows end-to-end
- [ ] **Token operations**: Mint, transfer, burn functioning
- [ ] **File uploads**: Images and videos upload correctly

### Data Integrity

- [ ] **Referential integrity**: Foreign key constraints enforced
- [ ] **Soft deletes**: Deleted records marked, not removed
- [ ] **Audit trail**: User actions logged for accountability
- [ ] **Data validation**: Business rules enforced in database

### Edge Cases

- [ ] **Concurrent requests**: Race conditions handled
- [ ] **Timeout handling**: Long operations have timeouts
- [ ] **Error recovery**: Failed operations can retry
- [ ] **Rollback logic**: Failed transactions revert cleanly

## Automated Health Check Script

Run comprehensive automated checks:

```bash
bash .claude/skills/health-check/scripts/check.sh
```

**What it checks**:
- Security vulnerabilities (pnpm audit)
- Code standards compliance
- Build and type check
- Hardcoded secrets scan
- Test suite execution
- Database connectivity
- Environment variables

**Output**: JSON report + human-readable summary

## Weekly Health Check Schedule

### Every Monday 9am

1. **Run automated check**: `bash .claude/skills/health-check/scripts/check.sh`
2. **Review report**: Address any failures
3. **Update dependencies**: `pnpm update` if safe
4. **Check Vercel logs**: Review errors from past week
5. **Review analytics**: Traffic, performance metrics
6. **Update documentation**: Fix any outdated docs

### Monthly Deep Dive (First Monday)

1. **Full security audit**: Manual review of auth/payment code
2. **Performance analysis**: Lighthouse scores, bundle analysis
3. **Dependency cleanup**: Remove unused packages
4. **Database optimization**: Analyze slow queries
5. **Infrastructure review**: Costs, limits, scaling needs

### Quarterly Review (First Monday of Quarter)

1. **Third-party service audit**: Review all integrations
2. **Disaster recovery test**: Verify backups work
3. **Compliance check**: Legal, privacy, security requirements
4. **Architecture review**: Technical debt assessment
5. **Team training**: Security awareness, new patterns

## Interpreting Results

### All Checks Pass ✅

System healthy. Continue normal operations.

### 1-3 Issues Found ⚠️

Minor issues. Fix within 1-2 days.

- Document in issue tracker
- Assign to team member
- Schedule fix in current sprint

### 4+ Issues Found ❌

Significant issues. Immediate attention required.

- Stop new feature work
- Focus on fixes
- Re-run health check after fixes
- Consider incident post-mortem

### Critical Security Issue 🚨

**Immediate action required**:

1. Assess impact and exposure
2. Implement fix or mitigation
3. Deploy emergency patch
4. Review related code
5. Document incident
6. Update procedures to prevent recurrence

## Integration with Git Workflow

### Pre-Commit

Subset of health checks run automatically on every commit via `.git/hooks/pre-commit`:

- Security scan (CRITICAL/HIGH only)
- Standards audit (warnings)
- TypeScript check
- Secret detection

### Pre-Push (Recommended)

Add to `.git/hooks/pre-push`:

```bash
#!/bin/bash
echo "Running health check before push..."
bash .claude/skills/health-check/scripts/check.sh --quick
```

### Pre-Deployment

Before merging to main:

- Full health check passes
- All tests green
- Build succeeds
- Manual smoke testing done

## Metrics to Track

### Week-over-Week

- Number of failed checks
- Time to fix issues
- Dependency vulnerabilities
- Build time
- Bundle size

### Month-over-Month

- Code coverage percentage
- API response times
- Error rates
- Uptime percentage
- Cost trends

### Quarter-over-Quarter

- Technical debt (estimated hours)
- Security incidents
- Performance scores
- Feature velocity

## Support & Escalation

### Issues Found During Check

1. **Low severity**: Create ticket, fix in sprint
2. **Medium severity**: Fix within 2-3 days
3. **High severity**: Fix within 1 day
4. **Critical severity**: Fix immediately

### Unable to Resolve

1. Document investigation in ticket
2. Tag for team review
3. Schedule pairing session
4. Escalate to tech lead if blocked

## Summary

Health checks ensure b0ase.com remains:

✅ **Secure** - No vulnerabilities or exposure
✅ **Performant** - Fast, optimized, efficient
✅ **Reliable** - Stable, tested, monitored
✅ **Maintainable** - Documented, clean, standard
✅ **Compliant** - Meeting security and quality standards

**Run weekly. Fix issues promptly. Keep the system healthy.**

---

*Questions? See CLAUDE.md or .claude/AGENTS.md*
