# Monitoring & Observability Guide

## Overview

Production monitoring tracks application health, performance, and user experience in real-time.

## Key Metrics to Monitor

### Application Performance

```typescript
// 1. Response Time (p50, p95, p99)
// Target: p95 < 1000ms, p99 < 2000ms
- API endpoints
- Database queries
- Page load times

// 2. Error Rate
// Target: < 0.1% (1 error per 1000 requests)
- HTTP errors (500, 502, 503)
- Unhandled exceptions
- API validation errors

// 3. Request Volume
- Requests per second
- Peak traffic times
- Traffic patterns

// 4. Throughput
- Requests per second served
- Failed requests
- Timeout rate
```

### Core Web Vitals

```typescript
// 1. Largest Contentful Paint (LCP)
// Target: < 2.5s
- First paint time
- Page load time

// 2. First Input Delay (FID)
// Target: < 100ms
- Response to user interaction
- JavaScript execution time

// 3. Cumulative Layout Shift (CLS)
// Target: < 0.1
- Unexpected layout changes
- Visual stability
```

### Business Metrics

```typescript
// 1. User Sessions
- Active users
- Session duration
- Bounce rate

// 2. Conversion Rate
- Sign-ups
- Feature usage
- Retention

// 3. User Experience
- Errors encountered
- Feature adoption
- User feedback
```

## Monitoring Implementation

### Application Monitoring with Sentry

```typescript
// Initialize Sentry
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  integrations: [
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

// Capture exceptions
try {
  await fetchData();
} catch (error) {
  Sentry.captureException(error);
}

// Capture messages
Sentry.captureMessage('Important event occurred', 'info');

// Set user context
Sentry.setUser({
  id: user.id,
  email: user.email,
  username: user.name,
});

// Add breadcrumbs
Sentry.addBreadcrumb({
  message: 'User clicked button',
  level: 'info',
  data: { buttonId: 'submit' },
});
```

### Logging

```typescript
// Structured logging
interface LogContext {
  userId?: string;
  requestId?: string;
  endpoint?: string;
  duration?: number;
  [key: string]: any;
}

class Logger {
  info(message: string, context?: LogContext) {
    console.log(JSON.stringify({
      level: 'info',
      timestamp: new Date().toISOString(),
      message,
      ...context,
    }));
  }

  error(message: string, error: Error, context?: LogContext) {
    console.error(JSON.stringify({
      level: 'error',
      timestamp: new Date().toISOString(),
      message,
      error: error.message,
      stack: error.stack,
      ...context,
    }));
  }

  warn(message: string, context?: LogContext) {
    console.warn(JSON.stringify({
      level: 'warn',
      timestamp: new Date().toISOString(),
      message,
      ...context,
    }));
  }

  debug(message: string, context?: LogContext) {
    if (process.env.NODE_ENV === 'development') {
      console.debug(JSON.stringify({
        level: 'debug',
        timestamp: new Date().toISOString(),
        message,
        ...context,
      }));
    }
  }
}
```

### Performance Monitoring

```typescript
// Track page performance
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log); // Cumulative Layout Shift
getFID(console.log); // First Input Delay
getFCP(console.log); // First Contentful Paint
getLCP(console.log); // Largest Contentful Paint
getTTFB(console.log); // Time to First Byte

// Custom metrics
const startTime = performance.now();
await performExpensiveOperation();
const duration = performance.now() - startTime;

Sentry.captureMessage(`Operation took ${duration}ms`, 'info');
```

### API Monitoring

```typescript
// Track API response times
export async function monitoredFetch(url: string, options?: RequestInit) {
  const startTime = performance.now();

  try {
    const response = await fetch(url, options);
    const duration = performance.now() - startTime;

    logger.info('API request', {
      url,
      status: response.status,
      duration: Math.round(duration),
      method: options?.method || 'GET',
    });

    return response;
  } catch (error) {
    const duration = performance.now() - startTime;

    logger.error('API request failed', error as Error, {
      url,
      duration: Math.round(duration),
      method: options?.method || 'GET',
    });

    throw error;
  }
}
```

### Database Monitoring

```typescript
// Track slow queries
import { createClient } from '@/lib/supabase/server';

export async function monitoredQuery(
  builder: any,
  label: string
) {
  const startTime = performance.now();

  try {
    const result = await builder;
    const duration = performance.now() - startTime;

    if (duration > 1000) {
      logger.warn('Slow database query', {
        label,
        duration: Math.round(duration),
      });
    }

    return result;
  } catch (error) {
    const duration = performance.now() - startTime;

    logger.error('Database query failed', error as Error, {
      label,
      duration: Math.round(duration),
    });

    throw error;
  }
}
```

## Alerting

### Alert Rules

```yaml
# Error Rate Alert
- name: HighErrorRate
  condition: error_rate > 1%
  duration: 5m
  severity: critical
  action: page_oncall

# Slow Response Time Alert
- name: SlowAPI
  condition: p95_response_time > 2000ms
  duration: 10m
  severity: warning
  action: notify_slack

# High Memory Usage Alert
- name: HighMemory
  condition: memory_usage > 80%
  duration: 5m
  severity: warning
  action: notify_slack

# Database Connection Alert
- name: DatabaseDown
  condition: db_connection_failed > 3 times in 1m
  duration: 1m
  severity: critical
  action: page_oncall + create_incident

# Low Disk Space Alert
- name: LowDiskSpace
  condition: disk_usage > 90%
  duration: 1m
  severity: critical
  action: page_oncall
```

### Notification Channels

- **Critical**: PagerDuty, SMS, Call
- **Warning**: Slack, Email
- **Info**: Slack, Discord

## Dashboards

### Production Dashboard

```
┌─────────────────────────────────────────────────────┐
│ B0ASE Production Dashboard                          │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Status: ✅ Healthy      Uptime: 99.95%            │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │ Response Times (last 1h)                     │  │
│  │ p50: 250ms | p95: 850ms | p99: 2100ms       │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │ Error Rate (last 1h)                         │  │
│  │ 0.02% errors | 2 errors in 9,500 requests   │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │ Active Users                                 │  │
│  │ 342 currently | 1,245 today | 15,432 month  │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │ Database Performance                         │  │
│  │ Connections: 23/100 | Queries: 1250/sec    │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │ Infrastructure                               │  │
│  │ CPU: 42% | Memory: 58% | Disk: 64%          │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## Incident Response

### Incident Severity Levels

| Level | Response Time | Escalation | Example |
|-------|---------------|------------|---------|
| P1 (Critical) | Immediate | Page on-call | Database down, auth broken |
| P2 (High) | 15 min | Notify team | High error rate, slow API |
| P3 (Medium) | 1 hour | Log issue | Performance degradation |
| P4 (Low) | Next day | Track in backlog | Minor UI issue |

### Response Procedure

```
1. DETECT (Monitoring)
   ↓
2. ALERT (Notify team)
   ↓
3. INVESTIGATE (Root cause)
   ↓
4. MITIGATE (Temporary fix or rollback)
   ↓
5. RESOLVE (Permanent solution)
   ↓
6. DOCUMENT (Post-mortem)
```

### Runbook Example

```markdown
## Database Connection Failures

### Symptoms
- Database queries failing
- 500 errors on API endpoints
- Alert: DatabaseConnectionFailed

### Steps
1. Check database status in Supabase dashboard
2. Verify network connectivity: ping [db-host]
3. Check active connections: SELECT count(*) FROM pg_stat_activity
4. Check for long-running queries
5. If still failing, trigger failover

### Escalation
- If not resolved in 5 min → Page on-call
- If still failing → Contact Supabase support
```

## Observability Best Practices

### ✅ DO

- Log meaningful context (userId, requestId, etc.)
- Use structured logging (JSON format)
- Track business metrics
- Monitor error rates and performance
- Set up alerts for abnormal behavior
- Review logs regularly
- Create runbooks for common issues
- Do post-mortems for incidents

### ❌ DON'T

- Log sensitive data (passwords, API keys)
- Log too verbosely in production
- Create too many alerts (alert fatigue)
- Ignore warnings and errors
- Deploy without monitoring
- Keep logs forever without archiving
- Mix different log formats

## Tools & Services

### Recommended Stack

```
Monitoring:     Sentry
Logging:        CloudWatch / ELK Stack
Metrics:        Prometheus / Grafana
Uptime:         UptimeRobot / StatusPage
Analytics:      Mixpanel / Amplitude
Real User Mon:  LogRocket / NewRelic
```

## References

- [Web Vitals](https://web.dev/vitals/)
- [Sentry Docs](https://docs.sentry.io)
- [Structured Logging](https://www.splunk.com/en_us/blog/learn/structured-logging.html)
