# Production Deployment Guide

## Overview

This guide covers deploying b0ase.com to production with confidence through automated testing, monitoring, and rollback procedures.

## Architecture

```
Development → GitHub → CI/CD Pipeline → Staging → Production
   (local)    (push)    (Test & Build)    (test)   (live)
```

## Pre-Deployment Checklist

### Code Quality
- [ ] All tests passing (unit + e2e)
- [ ] No console warnings or errors
- [ ] No TypeScript errors
- [ ] Code coverage > 60%
- [ ] No security vulnerabilities (pnpm audit)
- [ ] Staging deployed and tested

### Security
- [ ] All secrets in environment variables
- [ ] No hardcoded credentials
- [ ] HTTPS enabled
- [ ] CORS configured correctly
- [ ] API rate limiting enabled
- [ ] Database backups recent

### Performance
- [ ] Lighthouse score > 80
- [ ] Bundle size analyzed
- [ ] Images optimized
- [ ] API response times acceptable
- [ ] Database indexes present

### Documentation
- [ ] README updated
- [ ] API documentation current
- [ ] Environment variables documented
- [ ] Deployment procedures clear
- [ ] Rollback plan ready

## CI/CD Pipeline

### Automated Workflow

1. **On Push to Main**
   ```
   1. Run tests (unit + e2e)
   2. Check code coverage
   3. Build application
   4. Check bundle size
   5. Deploy to staging
   6. Run smoke tests
   ```

2. **Manual Deployment to Production**
   ```
   1. Review staging environment
   2. Approve deployment
   3. Deploy to production
   4. Monitor for errors
   5. Verify functionality
   ```

### GitHub Actions Workflows

See `.github/workflows/` for:
- `test.yml` - Run tests on every push
- `build.yml` - Build application
- `deploy-staging.yml` - Deploy to staging
- `deploy-production.yml` - Deploy to production

## Environment Variables

### Required Environment Variables

```bash
# Database
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
DATABASE_URL=postgresql://...

# Authentication
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://b0ase.com

# API Keys
OPENAI_API_KEY=...
GOOGLE_API_KEY=...

# Monitoring
SENTRY_AUTH_TOKEN=...
LOG_LEVEL=info
```

### Security

- Store secrets in GitHub Secrets
- Never commit `.env.local`
- Rotate secrets quarterly
- Use strong random values (32+ characters)
- Use different secrets per environment

## Deployment Environments

### Development
```
URL: localhost:3000
Database: bDatabase (Hetzner)
Purpose: Local development
```

### Staging
```
URL: staging.b0ase.com
Database: bDatabase (Hetzner)
Purpose: Pre-production testing
```

### Production
```
URL: b0ase.com
Database: bDatabase (Hetzner)
Purpose: Live application
```

## Monitoring

### Application Monitoring

```typescript
// Monitor performance metrics
const metrics = {
  pageLoadTime: 0,
  apiResponseTime: 0,
  errorRate: 0,
  userSessions: 0,
};
```

### Error Tracking

Integrate with error tracking service (e.g., Sentry):

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

### Logging

```typescript
// Use structured logging
logger.info('User logged in', { userId: '123', timestamp: Date.now() });
logger.error('Database error', { error: e, query: sql });
logger.warn('High response time', { route: '/api/projects', ms: 5000 });
```

### Alerts

Set up alerts for:
- Error rate > 1%
- Response time > 5s
- Database connection failures
- Disk space < 10%
- Memory usage > 80%

## Backup & Recovery

### Database Backups

```bash
# Automated daily backups
# Stored in: /backups/supabase/

# Manual backup
./scripts/backup-supabase-cloud.sh

# Verify backup
ls -lh /backups/supabase/
```

### Backup Strategy

- **Frequency**: Every 6 hours
- **Retention**: 30 days
- **Location**: Multiple regions (if possible)
- **Verification**: Weekly integrity checks

### Recovery Procedures

#### Full Recovery
```bash
# 1. Stop application
docker-compose down

# 2. Restore database from backup
./scripts/restore-production-env.sh

# 3. Verify data integrity
pnpm run test:db

# 4. Restart application
docker-compose up
```

#### Point-in-Time Recovery
```bash
# For Supabase:
# 1. Go to Supabase dashboard
# 2. Navigate to Settings → Backups
# 3. Select restore point
# 4. Click restore
# 5. Verify production data
```

### Disaster Recovery Plan

| Scenario | RTO | RPO | Action |
|----------|-----|-----|--------|
| Database corruption | 1 hour | 6 hours | Restore from backup |
| Data breach | 30 min | 1 hour | Invalidate sessions, rotate keys |
| Server down | 15 min | 5 min | Failover to standby |
| Code issue | 10 min | 1 min | Rollback to previous version |

## Rollback Procedure

### Rollback to Previous Version

```bash
# 1. Check current version
git log --oneline -n 5

# 2. Revert to previous commit
git revert HEAD

# 3. Push to trigger deployment
git push origin main

# 4. Monitor application
# Watch logs and metrics for 30 minutes

# 5. If still problematic, rollback further
git revert HEAD
git push origin main
```

### Quick Rollback

```bash
# If stuck, use emergency rollback
# This skips tests and deploys immediately
git push --force origin <stable-commit>
pnpm run deploy:emergency
```

## Health Checks

### Pre-Deployment Health Check

```bash
# Test database connection
curl https://b0ase.com/api/health

# Expected response:
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2024-01-05T12:00:00Z"
}
```

### Post-Deployment Verification

1. **Homepage loads** - curl https://b0ase.com
2. **API working** - curl https://b0ase.com/api/health
3. **Database responsive** - Query execution < 100ms
4. **Errors none** - Check error logs
5. **Performance ok** - Lighthouse > 80

### Smoke Tests

```bash
# Run quick smoke tests after deployment
pnpm run test:smoke

# Checks:
- Homepage loads
- Login works
- Database queries work
- API endpoints respond
- No console errors
```

## Performance Optimization

### For Production

1. **Enable caching**
   - Static content: 1 year
   - API responses: 5 minutes
   - HTML: no-cache

2. **CDN Configuration**
   - Use CDN for static assets
   - Cache images aggressively
   - Compress responses (gzip, brotli)

3. **Database Optimization**
   - Enable connection pooling
   - Create indexes on frequently queried columns
   - Archive old data
   - Monitor slow queries

4. **Application Optimization**
   - Enable HTTP/2
   - Use service workers
   - Lazy load components
   - Minify and compress assets

## Scaling Strategy

### Vertical Scaling
- Increase server resources (CPU, RAM)
- Upgrade database tier
- Expected: 2x performance

### Horizontal Scaling
- Add load balancer
- Run multiple app instances
- Use read replicas for database
- Expected: N x performance

### Auto-Scaling
```yaml
# Configure auto-scaling based on:
- CPU usage > 70%
- Memory usage > 80%
- Request rate > 1000/min
```

## Troubleshooting

### Application won't start
```bash
# 1. Check logs
docker logs app

# 2. Verify environment variables
env | grep NEXT

# 3. Check dependencies
pnpm install

# 4. Check database connection
psql $DATABASE_URL -c "SELECT 1"

# 5. Rebuild
pnpm run build
```

### Database connection issues
```bash
# 1. Verify connection string
echo $DATABASE_URL

# 2. Test connection
psql $DATABASE_URL -c "SELECT version()"

# 3. Check firewall rules
# Verify IP whitelist in Supabase/database settings

# 4. Check connection pool
# Monitor active connections in database dashboard
```

### High memory usage
```bash
# 1. Check memory leaks
node --inspect app.js

# 2. Monitor heap
pnpm add -D clinic
clinic doctor -- pnpm start

# 3. Increase Node memory
NODE_OPTIONS="--max-old-space-size=4096" pnpm start
```

## Monitoring Dashboard

### Key Metrics to Monitor

- **Response Time**: p50, p95, p99
- **Error Rate**: Errors per 1000 requests
- **Uptime**: Target 99.9%
- **Database**: Query time, connection count
- **Disk Usage**: Target < 80%
- **Memory**: Target < 70%

### Tools

- **Application**: Sentry, LogRocket
- **Database**: pgAdmin, Supabase Console
- **Infrastructure**: Grafana, Prometheus
- **Uptime**: UptimeRobot, StatusPage

## Maintenance Schedule

### Daily
- Monitor error logs
- Check uptime status
- Review alert notifications

### Weekly
- Review performance metrics
- Check disk usage
- Verify backups completed

### Monthly
- Review and optimize slow queries
- Update dependencies
- Security audit
- Capacity planning

### Quarterly
- Rotate secrets and credentials
- Full backup restoration test
- Disaster recovery drill
- Performance optimization

## Security Checklist

- [ ] HTTPS enabled
- [ ] Secrets in environment
- [ ] Database backups encrypted
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] SQL injection prevented
- [ ] XSS protection enabled
- [ ] CSRF tokens implemented
- [ ] API authentication required
- [ ] Admin routes protected
- [ ] Logs don't contain secrets
- [ ] Dependencies updated
- [ ] No console logs in production

## Deployment Approval

Before deploying to production:

1. **Code Review**: At least 2 approvals
2. **Tests**: All passing
3. **QA**: Staging verified
4. **Stakeholder**: Approval from team lead
5. **Backup**: Recent backup confirmed
6. **Runbook**: Reviewed and ready

## After Deployment

### Immediate (5 min)
- [ ] Verify site loads
- [ ] Check error logs
- [ ] Test login flow
- [ ] Verify database queries

### Short-term (1 hour)
- [ ] Monitor error rate
- [ ] Check performance metrics
- [ ] Review user feedback
- [ ] Prepare rollback if needed

### Long-term (24 hours)
- [ ] Analyze metrics
- [ ] Check user sessions
- [ ] Verify all features working
- [ ] Document lessons learned

## Resources

- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Backups](https://supabase.com/docs/guides/backups)
- [GitHub Actions](https://github.com/features/actions)
- [Sentry Setup](https://docs.sentry.io)

## Contact

- **On-call**: [contact info]
- **Escalation**: [contact info]
- **Incident channel**: #incidents
