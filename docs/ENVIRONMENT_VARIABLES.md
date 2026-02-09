# Environment Variables Documentation

**Last Updated**: January 19, 2026
**Purpose**: Complete reference for all environment variables used in b0ase.com

---

## Overview

Environment variables are stored in `.env.local` (gitignored).
Production variables are stored in the hosting platform (Vercel/etc).

---

## Current Configuration (Self-Hosted Supabase)

### Database (Self-Hosted Supabase on Hetzner)

```bash
# Self-Hosted Supabase
NEXT_PUBLIC_SUPABASE_URL=https://api.b0ase.com
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-placeholder-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-placeholder-service-role-key
```

**Usage**:
- Client-side database access (all components)
- Server-side database access (API routes)
- Authentication (NextAuth + Supabase Auth)

**Required**: ✅ Always
**Secret**: ⚠️ Anon key is public, Service Role key is SECRET

---

### Google OAuth

```bash
# Google OAuth Configuration
NEXT_PUBLIC_GOOGLE_CLIENT_ID=464314572333-pv6m2avofvafr2r7dmg0ahc8j2g6akv9.apps.googleusercontent.com
GOOGLE_CLIENT_ID=464314572333-pv6m2avofvafr2r7dmg0ahc8j2g6akv9.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-placeholder-client-secret
```

**Usage**:
- User authentication via Google
- `/api/auth/google` endpoint
- Google Drive integration

**Required**: ✅ For Google login
**Secret**: 🔒 CLIENT_SECRET is SECRET

---

### Google AI APIs

```bash
# Google AI / Nano Banana Video Generation
GOOGLE_API_KEY=your-placeholder-google-api-key
GOOGLE_AI_API_KEY=your-placeholder-google-ai-api-key
GOOGLE_AI_PRO_API_KEY=your-placeholder-google-ai-pro-api-key
```

**Usage**:
- `/api/google-ai/generate-video` - AI video generation
- Video production features

**Required**: ⚠️ Only if using Google AI video generation
**Secret**: 🔒 SECRET

**Note**: Multiple keys for different tiers/services

---

### AI/ML APIs

```bash
# AIML API (unclear usage)
AIML_API_KEY=your-placeholder-aiml-key
```

**Usage**: Unknown - needs audit
**Required**: ❓ Unknown
**Secret**: 🔒 SECRET

**TODO**: Audit usage and document or remove

---

### Admin Credentials

```bash
# Admin Panel Access
ADMIN_PASSWORD=your-placeholder-admin-password
```

**Usage**:
- Admin authentication
- `/admin/*` routes
- Client project login bypass

**Required**: ✅ For admin features
**Secret**: 🔒 SECRET

**⚠️ SECURITY ISSUE**: Hardcoded `ADMIN_EMAIL` in `/middleware.ts`

**ACTION REQUIRED**: Move ADMIN_EMAIL to environment variable

---

### App Configuration

```bash
# Application URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
```

**Usage**:
- NextAuth callback URLs
- Public-facing app URL
- API endpoint base URL

**Required**: ✅ Always
**Secret**: ❌ Public config

**Production**: Change to `https://b0ase.com`

---

### ~~Hardcoded API Tokens~~ (RESOLVED)

**Status**: ✅ Fixed - Route deleted, Oracle server deprecated (Jan 2026)

The central-automation route and related Oracle infrastructure have been removed.
Cron jobs now run via Vercel Cron (defined in `vercel.json`).

---

### Hardcoded Admin Email (SECURITY ISSUE)

**Found in**: `/middleware.ts` (line 64)

```typescript
// ❌ HARDCODED - MUST MOVE TO ENV
const ADMIN_EMAIL = 'richardwboase@gmail.com';
```

**ACTION REQUIRED (Phase 1)**:
Move to environment variables:
```bash
ADMIN_EMAIL=your-placeholder-admin-email
```

---

## Missing Environment Variables

These are needed but not currently set:

### Grok API (if used)
```bash
GROK_API_KEY=<key>
```

### n8n Automation
```bash
N8N_WEBHOOK_SECRET=<secret>
N8N_API_KEY=<key>
```

### Stripe (if e-commerce is active)
```bash
STRIPE_SECRET_KEY=<key>
STRIPE_WEBHOOK_SECRET=<secret>
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=<key>
```

### Sentry (for error monitoring)
```bash
SENTRY_DSN=<dsn>
NEXT_PUBLIC_SENTRY_DSN=<dsn>
```

---

## Future Configuration (bDatabase Migration)

After Phase 2, these will change:

### Database (bDatabase on Hetzner)

```bash
# bDatabase Configuration
NEXT_PUBLIC_SUPABASE_URL=http://REDACTED_HOST:8000
NEXT_PUBLIC_SUPABASE_ANON_KEY=[GET_FROM_HETZNER]
SUPABASE_SERVICE_ROLE_KEY=[GET_FROM_HETZNER]

# Direct PostgreSQL Connection (for scripts)
DATABASE_URL=postgresql://postgres:your-placeholder-db-password@your-placeholder-ip:54322/b0ase_com
```

**How to get keys**:
```bash
ssh root@REDACTED_HOST
cd /root/supabase/docker
cat .env | grep -E "ANON_KEY|SERVICE_ROLE_KEY"
```

---

## Production Environment Variables

**Template for Vercel/hosting platform**:

```bash
# Database
NEXT_PUBLIC_SUPABASE_URL=http://REDACTED_HOST:8000
NEXT_PUBLIC_SUPABASE_ANON_KEY=[PRODUCTION_KEY]
SUPABASE_SERVICE_ROLE_KEY=[PRODUCTION_KEY]

# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=[PROD_CLIENT_ID]
GOOGLE_CLIENT_ID=[PROD_CLIENT_ID]
GOOGLE_CLIENT_SECRET=[PROD_SECRET]

# Google AI
GOOGLE_API_KEY=[PROD_KEY]
GOOGLE_AI_API_KEY=[PROD_KEY]
GOOGLE_AI_PRO_API_KEY=[PROD_KEY]

# Admin
ADMIN_PASSWORD=[STRONG_PASSWORD]
ADMIN_EMAIL=[ADMIN_EMAIL]

# App Config
NEXT_PUBLIC_APP_URL=https://b0ase.com
NEXTAUTH_URL=https://b0ase.com
NEXTAUTH_SECRET=[GENERATE_NEW_SECRET]

# Monitoring
SENTRY_DSN=[IF_USING_SENTRY]
NEXT_PUBLIC_SENTRY_DSN=[IF_USING_SENTRY]
```

---

## Security Best Practices

### ✅ DO
- Store all secrets in `.env.local` (gitignored)
- Use different values for dev/staging/production
- Rotate secrets periodically
- Use strong, randomly generated passwords
- Validate all env vars on app startup

### ❌ DON'T
- Commit `.env.local` to git
- Hardcode secrets in source code
- Log secrets to console
- Share secrets in chat/email
- Use same secrets across environments

---

## Environment Variable Validation

**Create**: `/lib/config/env.ts` (Phase 1)

```typescript
// Validates all required env vars on startup
// Provides typed access
// Throws clear errors if missing

export const config = {
  supabase: {
    url: requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
    anonKey: requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    serviceRoleKey: requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
  },
  google: {
    clientId: requireEnv('GOOGLE_CLIENT_ID'),
    clientSecret: requireEnv('GOOGLE_CLIENT_SECRET'),
    apiKey: requireEnv('GOOGLE_API_KEY'),
  },
  admin: {
    password: requireEnv('ADMIN_PASSWORD'),
    email: requireEnv('ADMIN_EMAIL'),
  },
  app: {
    url: requireEnv('NEXT_PUBLIC_APP_URL'),
    env: process.env.NODE_ENV,
  },
};

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}
```

---

## Audit Checklist

- [ ] All secrets moved to environment variables
- [ ] No hardcoded credentials in source code
- [ ] No console.log with secrets
- [ ] .env.local in .gitignore
- [ ] Production variables configured in hosting platform
- [ ] Environment validation added
- [ ] Documentation complete

---

## Related Files

- `.env.local` - Local development environment variables (gitignored)
- `.env.example` - Template for environment variables (should create)
- `/lib/config/env.ts` - Environment variable validation (exists)
- `/middleware.ts` - Contains hardcoded ADMIN_EMAIL (needs fix)
