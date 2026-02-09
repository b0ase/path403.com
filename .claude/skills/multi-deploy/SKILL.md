---
name: b0ase-multi-deploy
description: Deploy applications to multiple platforms (Vercel, Netlify, Railway, Fly.io). Use when client requests "Deploy my app", "Push to production", "Deploy to Vercel/Netlify", or needs multi-platform deployment strategy. Auto-detects framework and selects optimal platform.
license: MIT
metadata:
  author: b0ase.com
  version: "1.0.0"
---

# b0ase Multi-Platform Deploy

One-command deployment to any platform. Automatically selects the optimal hosting platform based on your project type and requirements.

## When to Use

Deploy this skill when:
- Client requests deployment
- Setting up production infrastructure
- Creating preview/staging environments
- Implementing multi-region deployments
- Comparing platform options

## Supported Platforms

| Platform | Best For | Auto-Deploy |
|----------|----------|-------------|
| **Vercel** | Next.js, React, Static Sites | ✓ |
| **Netlify** | Static Sites, Jamstack, Functions | ✓ |
| **Railway** | Full-stack Apps, Databases, APIs | ✓ |
| **Fly.io** | Global Edge Apps, Docker, Databases | ✓ |
| **Render** | Web Services, Static Sites, Cron Jobs | ✓ |
| **Cloudflare Pages** | Static Sites, Workers, Edge Functions | ✓ |

## How It Works

1. **Framework Detection** - Analyzes project to determine framework
2. **Platform Selection** - Recommends optimal platform (or uses specified platform)
3. **Build Configuration** - Generates platform-specific config
4. **Deployment** - Packages and deploys to target platform
5. **URL Generation** - Returns preview and production URLs

## Usage

```bash
bash /mnt/skills/user/multi-deploy/scripts/deploy.sh [path] [platform]
```

**Arguments:**
- `path` - Project directory (defaults to current directory)
- `platform` - Target platform: auto|vercel|netlify|railway|fly|render|cloudflare (defaults to auto)

**Examples:**

```bash
# Auto-detect platform and deploy
bash /mnt/skills/user/multi-deploy/scripts/deploy.sh

# Deploy Next.js app to Vercel
bash /mnt/skills/user/multi-deploy/scripts/deploy.sh ./my-app vercel

# Deploy full-stack app to Railway
bash /mnt/skills/user/multi-deploy/scripts/deploy.sh ./api railway

# Deploy static site to Netlify
bash /mnt/skills/user/multi-deploy/scripts/deploy.sh ./landing netlify

# Deploy Docker app to Fly.io
bash /mnt/skills/user/multi-deploy/scripts/deploy.sh ./service fly
```

## Platform Selection Logic

### Auto Mode (Recommended)

When platform is set to `auto`, the skill selects based on:

```
Next.js App
  → Has API routes or server components → Railway or Fly.io
  → Static export → Vercel or Netlify
  → Default → Vercel

React/Vue/Svelte (Vite/CRA)
  → Static → Netlify or Cloudflare Pages
  → With backend → Railway

Node.js/Express API
  → Railway or Fly.io

Full-stack with Database
  → Railway (includes DB)
  → Fly.io (separate DB)

Static HTML/CSS/JS
  → Netlify or Cloudflare Pages

Docker Container
  → Fly.io or Railway
```

### Manual Override

Specify platform explicitly when you need:
- Specific platform features (e.g., Vercel Edge Functions)
- Pricing considerations
- Regional requirements
- Team/client preferences

## Output

```
Analyzing project...
✓ Framework detected: Next.js 14
✓ Project type: Full-stack with API routes
✓ Platform selected: Railway

Building for deployment...
✓ Build completed (32.4s)
✓ Package size: 2.1 MB

Deploying to Railway...
✓ Deployment ID: dep_abc123xyz
✓ Build logs: https://railway.app/project/abc123/deployments/xyz

Deployment successful!

Production URL:  https://my-app-production.up.railway.app
Preview URL:     https://my-app-pr-42.up.railway.app
Dashboard:       https://railway.app/project/abc123

Environment: production
Region: us-west1
Status: Healthy
```

The script outputs JSON for programmatic integration:

```json
{
  "success": true,
  "platform": "railway",
  "framework": "nextjs",
  "deploymentId": "dep_abc123xyz",
  "urls": {
    "production": "https://my-app-production.up.railway.app",
    "preview": "https://my-app-pr-42.up.railway.app",
    "dashboard": "https://railway.app/project/abc123"
  },
  "environment": "production",
  "region": "us-west1",
  "buildTime": "32.4s",
  "packageSize": "2.1 MB",
  "status": "healthy",
  "deployedAt": "2026-01-16T04:00:00Z"
}
```

## Platform-Specific Features

### Vercel

**Best for**: Next.js, React, static sites, serverless functions

**Features**:
- Automatic edge caching
- Image optimization
- Edge Functions
- Analytics built-in
- Preview deployments per PR

**Configuration**:
```json
// vercel.json (auto-generated)
{
  "framework": "nextjs",
  "buildCommand": "pnpm build",
  "outputDirectory": ".next",
  "installCommand": "pnpm install",
  "devCommand": "pnpm dev",
  "regions": ["iad1", "sfo1"]
}
```

### Netlify

**Best for**: Static sites, Jamstack, serverless functions

**Features**:
- Form handling
- Identity/Auth
- Split testing
- Netlify Functions (AWS Lambda)
- Asset optimization

**Configuration**:
```toml
# netlify.toml (auto-generated)
[build]
  command = "pnpm build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
```

### Railway

**Best for**: Full-stack apps, APIs, databases, persistent services

**Features**:
- Databases included (PostgreSQL, MySQL, MongoDB, Redis)
- Environment management
- Automatic SSL
- Private networking
- GitHub integration

**Configuration**:
```toml
# railway.toml (auto-generated)
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "pnpm start"
healthcheckPath = "/api/health"
healthcheckTimeout = 100
restartPolicyType = "ON_FAILURE"
```

### Fly.io

**Best for**: Global edge apps, WebSockets, Docker, low-latency

**Features**:
- Global deployment (multi-region)
- Anycast routing
- Persistent volumes
- Built-in Postgres
- Docker-native

**Configuration**:
```toml
# fly.toml (auto-generated)
app = "my-app"
primary_region = "iad"

[build]
  [build.args]
    NODE_VERSION = "20"

[http_service]
  internal_port = 3000
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 1

[[services]]
  protocol = "tcp"
  internal_port = 3000

  [[services.ports]]
    port = 80
    handlers = ["http"]

  [[services.ports]]
    port = 443
    handlers = ["tls", "http"]
```

### Render

**Best for**: Web services, cron jobs, static sites

**Features**:
- Free SSL
- Auto-deploy from Git
- Background workers
- Cron jobs
- Preview environments

**Configuration**:
```yaml
# render.yaml (auto-generated)
services:
  - type: web
    name: my-app
    env: node
    buildCommand: pnpm install && pnpm build
    startCommand: pnpm start
    healthCheckPath: /api/health
    autoDeploy: true
```

### Cloudflare Pages

**Best for**: Static sites, Workers, edge computing

**Features**:
- Global CDN (275+ cities)
- Workers (serverless)
- Analytics
- Free SSL
- Unlimited bandwidth

**Configuration**:
```toml
# wrangler.toml (auto-generated)
name = "my-app"
compatibility_date = "2026-01-16"
pages_build_output_dir = "dist"

[build]
command = "pnpm build"

[[routes]]
pattern = "/*"
zone_name = "example.com"
```

## Environment Variables

The skill handles environment variables automatically:

```bash
# Reads from .env.production
# Uploads securely to target platform
# Never commits secrets to git
```

For each platform:
- Vercel: `vercel env add`
- Netlify: `netlify env:set`
- Railway: `railway vars set`
- Fly: `fly secrets set`
- Render: Dashboard or `render env:set`
- Cloudflare: `wrangler secret put`

## Custom Domains

After deployment, configure custom domain:

```bash
# Add custom domain to deployment
bash /mnt/skills/user/multi-deploy/scripts/domain-add.sh [project-id] [domain]
```

Example:
```bash
bash /mnt/skills/user/multi-deploy/scripts/domain-add.sh abc123 app.client.com
```

## Multi-Region Deployment

Deploy to multiple regions for global low latency:

```bash
bash /mnt/skills/user/multi-deploy/scripts/deploy.sh ./app fly --regions=iad,lhr,syd,nrt
```

Supported regions:
- **iad**: US East (Virginia)
- **lhr**: Europe (London)
- **syd**: Asia-Pacific (Sydney)
- **nrt**: Asia (Tokyo)
- **fra**: Europe (Frankfurt)

## Present Results to User

After successful deployment:

```
✓ Deployment Complete!

PRODUCTION
→ URL: https://app.client.com
→ Dashboard: https://railway.app/project/abc123
→ Status: Healthy ✓

DETAILS
Platform: Railway
Region: us-west1
Build Time: 32.4s
Deploy Time: 18.2s

NEXT STEPS
1. Configure custom domain (if needed)
2. Set up monitoring and alerts
3. Review security headers
4. Test all critical paths

Need help? Check deployment guide:
https://docs.b0ase.com/deployment/[platform]
```

## Monitoring & Rollback

Monitor deployment health:

```bash
# Check deployment status
bash /mnt/skills/user/multi-deploy/scripts/status.sh [deployment-id]

# View logs
bash /mnt/skills/user/multi-deploy/scripts/logs.sh [deployment-id]

# Rollback to previous version
bash /mnt/skills/user/multi-deploy/scripts/rollback.sh [deployment-id]
```

## Troubleshooting

### Build Failures

```
Error: Build failed

Common causes:
1. Missing environment variables
   → Add required vars in platform dashboard
   → Check .env.example for required keys

2. Dependency installation failed
   → Verify pnpm-lock.yaml is committed
   → Check for platform compatibility

3. Build command timeout
   → Optimize build process
   → Consider larger instance size
```

### Runtime Errors

```
Error: Deployment healthy but returning 500 errors

Debugging steps:
1. Check logs: bash scripts/logs.sh [id]
2. Verify environment variables are set
3. Check database connection
4. Review health check endpoint
```

### Platform Authentication

First-time deployment may require platform authentication:

```
Platform not authenticated. Choose authentication method:

1. API Token (recommended)
   → Add token to environment: VERCEL_TOKEN=xxx
   → Get token: https://vercel.com/account/tokens

2. OAuth Login
   → Run: bash scripts/auth.sh vercel
   → Follow browser authentication

3. CLI Login
   → Run: vercel login
   → Complete authentication
```

## Cost Estimation

Estimate monthly costs before deploying:

```bash
bash /mnt/skills/user/multi-deploy/scripts/estimate-cost.sh [path] [platform]
```

Example output:
```
Cost Estimation for Railway

Base Plan: $5/month
  - Included: 500 hours, $5 credit

Estimated Usage:
  - Web Service: ~$10/month (1 instance)
  - PostgreSQL: ~$10/month (1GB storage)
  - Bandwidth: ~$2/month (100GB)

Total Estimate: ~$17/month
```

## Security Checklist

Before deploying to production:

- [ ] All secrets in environment variables (not code)
- [ ] HTTPS enforced
- [ ] CORS properly configured
- [ ] Rate limiting implemented
- [ ] Security headers set
- [ ] Database credentials rotated
- [ ] API keys have minimum required permissions
- [ ] Health check endpoint doesn't leak sensitive info
- [ ] Error messages don't expose internals
- [ ] Logging excludes sensitive data

Run security audit:
```bash
bash /mnt/skills/user/multi-deploy/scripts/security-check.sh [deployment-url]
```

## Integration with b0ase Workflow

This skill integrates with:
- **b0ase Standards**: Auto-runs compliance check before deploy
- **Client Onboarding**: Sets up client access to deployments
- **Monitoring**: Configures uptime monitoring and alerts

All deployments are tracked in b0ase client dashboard.

## Platform Comparison

| Feature | Vercel | Netlify | Railway | Fly.io | Render | Cloudflare |
|---------|--------|---------|---------|--------|--------|------------|
| Static Sites | ★★★★★ | ★★★★★ | ★★★☆☆ | ★★☆☆☆ | ★★★★☆ | ★★★★★ |
| Next.js | ★★★★★ | ★★★☆☆ | ★★★★☆ | ★★★☆☆ | ★★★★☆ | ★★★☆☆ |
| Full-stack | ★★★☆☆ | ★★☆☆☆ | ★★★★★ | ★★★★★ | ★★★★☆ | ★★★☆☆ |
| Databases | ☆☆☆☆☆ | ☆☆☆☆☆ | ★★★★★ | ★★★★☆ | ★★★★☆ | ☆☆☆☆☆ |
| Global Edge | ★★★★☆ | ★★★★☆ | ★★☆☆☆ | ★★★★★ | ★★★☆☆ | ★★★★★ |
| Free Tier | ★★★★☆ | ★★★★★ | ★★★☆☆ | ★★★★☆ | ★★★★☆ | ★★★★★ |
| Ease of Use | ★★★★★ | ★★★★★ | ★★★★☆ | ★★★☆☆ | ★★★★☆ | ★★★★☆ |

## Support

For deployment issues:
- Platform docs: Check specific platform documentation
- b0ase support: support@b0ase.com
- Emergency hotline: Available for enterprise clients
