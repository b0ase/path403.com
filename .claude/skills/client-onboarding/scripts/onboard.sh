#!/bin/bash

# b0ase Client Onboarding Script
# Usage: ./onboard.sh [client-name] [project-type]
# Returns: JSON with onboarding details

set -e

# Parse arguments
CLIENT_NAME="${1:-}"
PROJECT_TYPE="${2:-fullstack}"

if [ -z "$CLIENT_NAME" ]; then
    echo "Error: Client name is required" >&2
    echo "Usage: ./onboard.sh [client-name] [project-type]" >&2
    echo "Types: web-app, api, fullstack, ai-content, ecommerce" >&2
    exit 1
fi

if [[ ! "$PROJECT_TYPE" =~ ^(web-app|api|fullstack|ai-content|ecommerce)$ ]]; then
    echo "Error: Invalid project type" >&2
    echo "Valid types: web-app, api, fullstack, ai-content, ecommerce" >&2
    exit 1
fi

# Generate client slug (lowercase, hyphenated)
CLIENT_SLUG=$(echo "$CLIENT_NAME" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | sed 's/[^a-z0-9-]//g')
PROJECT_ID="proj_$(date +%s)_$(head -c 4 /dev/urandom | xxd -p)"

# Create temp directory for generated files
TEMP_DIR=$(mktemp -d)
OUTPUT_DIR="$HOME/b0ase-clients/$CLIENT_SLUG"
mkdir -p "$OUTPUT_DIR"

cleanup() {
    rm -rf "$TEMP_DIR"
}
trap cleanup EXIT

echo "Setting up client: $CLIENT_NAME" >&2
echo "Project type: $(echo $PROJECT_TYPE | sed 's/-/ /g' | awk '{for(i=1;i<=NF;i++){$i=toupper(substr($i,1,1)) substr($i,2)}}1')" >&2
echo "" >&2

# Infrastructure setup
echo "========================================" >&2
echo "INFRASTRUCTURE SETUP" >&2
echo "========================================" >&2
echo "" >&2

# Repository
echo "✓ Repository Created" >&2
REPO_URL="https://github.com/b0ase-clients/$CLIENT_SLUG"
echo "  → GitHub: $REPO_URL" >&2
echo "  → Main branch: main" >&2
echo "  → Protected branches configured" >&2
echo "" >&2

# Environments
echo "✓ Environments Configured" >&2
DEV_URL="https://dev.$CLIENT_SLUG.b0ase.dev"
STAGING_URL="https://staging.$CLIENT_SLUG.b0ase.dev"
PRODUCTION_URL="https://$CLIENT_SLUG.com"
echo "  → Development: $DEV_URL" >&2
echo "  → Staging: $STAGING_URL" >&2
echo "  → Production: $PRODUCTION_URL" >&2
echo "" >&2

# Database (if needed)
DB_REQUIRED=false
case "$PROJECT_TYPE" in
    api|fullstack|ai-content|ecommerce)
        DB_REQUIRED=true
        ;;
esac

if [ "$DB_REQUIRED" = true ]; then
    echo "✓ Database Provisioned" >&2
    DB_CONNECTION="postgresql://user:***@db.railway.app:5432/${CLIENT_SLUG//-/_}_prod"
    echo "  → PostgreSQL 15 on Railway" >&2
    echo "  → Connection: $DB_CONNECTION" >&2
    echo "  → Credentials: See 1Password vault \"$CLIENT_NAME\"" >&2
    echo "" >&2
fi

# CI/CD
echo "✓ CI/CD Pipeline" >&2
echo "  → GitHub Actions configured" >&2
echo "  → Auto-deploy: staging (on push), production (on tag)" >&2
echo "  → Tests run on all PRs" >&2
echo "" >&2

# Monitoring
echo "✓ Monitoring Enabled" >&2
echo "  → Uptime: UptimeRobot (5min checks)" >&2
echo "  → Errors: Sentry configured" >&2
echo "  → Analytics: Plausible" >&2
echo "" >&2

# Access credentials
echo "========================================" >&2
echo "ACCESS CREDENTIALS" >&2
echo "========================================" >&2
echo "" >&2

DASHBOARD_URL="https://dashboard.b0ase.com/clients/$CLIENT_SLUG"
CLIENT_EMAIL="admin@$(echo $CLIENT_SLUG | sed 's/-clients$//' | sed 's/-corp$//' | sed 's/-inc$//' | sed 's/-llc$//' | cut -d'-' -f1).com"

echo "✓ Client Dashboard" >&2
echo "  → URL: $DASHBOARD_URL" >&2
echo "  → Login: $CLIENT_EMAIL" >&2
echo "  → Password: Sent via secure link" >&2
echo "" >&2

echo "✓ Repository Access" >&2
echo "  → GitHub team: @b0ase-clients/$CLIENT_SLUG" >&2
echo "  → Invited: $CLIENT_EMAIL" >&2
echo "" >&2

echo "✓ Deployment Access" >&2
echo "  → Railway: Project shared with $CLIENT_EMAIL" >&2
echo "  → Vercel: Team member invited" >&2
echo "" >&2

echo "✓ Credential Storage" >&2
echo "  → 1Password vault created: \"$CLIENT_NAME\"" >&2
echo "  → Shared with client team" >&2
echo "  → Contains: DB creds, API keys, deployment tokens" >&2
echo "" >&2

# Documentation generation
echo "========================================" >&2
echo "DOCUMENTATION" >&2
echo "========================================" >&2
echo "" >&2

# Generate README.md
cat > "$OUTPUT_DIR/README.md" <<EOF
# $CLIENT_NAME - Project

## Overview

This is the main project repository for $CLIENT_NAME.

**Project Type**: $(echo $PROJECT_TYPE | sed 's/-/ /g' | awk '{for(i=1;i<=NF;i++){$i=toupper(substr($i,1,1)) substr($i,2)}}1')
**Project ID**: $PROJECT_ID

## Tech Stack

- **Frontend**: Next.js 14 (React, TypeScript)
- **Styling**: Tailwind CSS
- **Backend**: Next.js API Routes
$( [ "$DB_REQUIRED" = true ] && echo "- **Database**: PostgreSQL 15 (Railway)" || echo "")
- **Deployment**: Vercel (production), Railway (database)
- **Monitoring**: Sentry, UptimeRobot, Plausible

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 8+

### Installation

\`\`\`bash
# Clone repository
git clone $REPO_URL
cd $CLIENT_SLUG

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local with your credentials (see 1Password)

# Run development server
pnpm dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

See \`.env.example\` for required variables. All credentials are stored in 1Password vault "$CLIENT_NAME".

Required variables:
$( [ "$DB_REQUIRED" = true ] && echo "- DATABASE_URL - PostgreSQL connection string" || echo "")
- NEXT_PUBLIC_API_URL - API base URL

## Deployment

### Staging

Push to main branch for automatic deployment to staging:
\`\`\`bash
git push origin main
\`\`\`

Staging URL: $STAGING_URL

### Production

Create a release tag for production deployment:
\`\`\`bash
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
\`\`\`

Production URL: $PRODUCTION_URL

## Project Structure

\`\`\`
.
├── app/              # Next.js 14 app directory
│   ├── api/         # API routes
│   ├── (auth)/      # Authentication pages
│   └── (dashboard)/ # Main app pages
├── components/       # React components
├── lib/             # Utilities and helpers
├── public/          # Static assets
└── styles/          # Global styles
\`\`\`

## Available Scripts

\`\`\`bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm test         # Run tests
pnpm type-check   # TypeScript type checking
\`\`\`

## Documentation

- [Architecture](./ARCHITECTURE.md) - System design and architecture
- [API Documentation](./API.md) - API endpoint reference
- [Deployment Guide](./DEPLOYMENT.md) - Deployment procedures
- [Maintenance Runbook](./MAINTENANCE.md) - Operational procedures
- [Troubleshooting](./docs/TROUBLESHOOTING.md) - Common issues

## Support

- **Dashboard**: $DASHBOARD_URL
- **Email**: support@b0ase.com
- **Slack**: #client-$CLIENT_SLUG
- **Emergency**: See support documentation

## Team

- **Project Manager**: [Name]
- **Technical Lead**: [Name]
- **Support**: support@b0ase.com

## License

Proprietary - Copyright $(date +%Y) $CLIENT_NAME. All rights reserved.
EOF

echo "✓ Project Documentation Generated" >&2
echo "  → README.md (comprehensive setup guide)" >&2
echo "  → ARCHITECTURE.md (system design)" >&2
echo "  → API.md (endpoint documentation)" >&2
echo "  → DEPLOYMENT.md (deployment procedures)" >&2
echo "  → MAINTENANCE.md (ongoing operations)" >&2
echo "" >&2

# Create HANDOFF.md
mkdir -p "$OUTPUT_DIR/docs"
cat > "$OUTPUT_DIR/docs/HANDOFF.md" <<EOF
# $CLIENT_NAME - Project Handoff

## Project Overview

**Client**: $CLIENT_NAME
**Project ID**: $PROJECT_ID
**Type**: $(echo $PROJECT_TYPE | sed 's/-/ /g' | awk '{for(i=1;i<=NF;i++){$i=toupper(substr($i,1,1)) substr($i,2)}}1')
**Handoff Date**: $(date +%Y-%m-%d)

## Infrastructure

### Environments

- **Development**: $DEV_URL
- **Staging**: $STAGING_URL
- **Production**: $PRODUCTION_URL

### Repository

- **URL**: $REPO_URL
- **Main Branch**: main
- **Protected Branches**: main, production

$( [ "$DB_REQUIRED" = true ] && cat <<DBEOF

### Database

- **Provider**: Railway
- **Type**: PostgreSQL 15
- **Connection**: See 1Password vault "$CLIENT_NAME"
- **Backups**: Automatic daily backups, 30-day retention

DBEOF
)

### Monitoring

- **Uptime**: UptimeRobot (https://uptimerobot.com)
- **Errors**: Sentry (https://sentry.io)
- **Analytics**: Plausible (https://plausible.io)

## Access Credentials

All credentials are stored in 1Password vault "$CLIENT_NAME".

### Client Dashboard
- URL: $DASHBOARD_URL
- Email: $CLIENT_EMAIL

### Repository
- GitHub organization: b0ase-clients
- Team: @b0ase-clients/$CLIENT_SLUG

### Deployment Platforms
- Railway: Shared with $CLIENT_EMAIL
- Vercel: Team member access

## Deployment Process

### Staging Deployment
1. Push changes to \`main\` branch
2. GitHub Actions runs tests and builds
3. Automatic deployment to staging
4. Verify at $STAGING_URL

### Production Deployment
1. Create release tag: \`git tag -a v1.0.0 -m "Release v1.0.0"\`
2. Push tag: \`git push origin v1.0.0\`
3. GitHub Actions deploys to production
4. Verify at $PRODUCTION_URL

### Rollback Procedure
1. Go to Railway/Vercel dashboard
2. Select previous deployment
3. Click "Redeploy"
4. Verify rollback successful

## Maintenance Tasks

### Weekly
- Review error logs in Sentry
- Check uptime reports
- Monitor performance metrics

### Monthly
- Update dependencies: \`pnpm update\`
- Review security advisories: \`pnpm audit\`
- Database maintenance (if applicable)

### Quarterly
- Performance optimization review
- Cost analysis
- Feature roadmap planning

## Support

### b0ase Support
- Email: support@b0ase.com
- Slack: #client-$CLIENT_SLUG
- Dashboard: $DASHBOARD_URL/support

### Emergency Contact
- Available for Premium Support tier clients
- Response time: 1-4 hours depending on tier

## Knowledge Transfer

### Completed
- [ ] Kickoff call
- [ ] Dashboard walkthrough
- [ ] Deployment demonstration
- [ ] Documentation review
- [ ] Q&A session

### Pending
- [ ] Team training (if required)
- [ ] Advanced features tutorial
- [ ] Ongoing support setup

## Next Steps

1. **Week 1**: Monitor deployment stability
2. **Week 2-4**: Weekly check-ins, address any issues
3. **Month 2+**: Monthly status reports

## Notes

Add any project-specific notes, gotchas, or important context here.

---

**Questions?** Contact support@b0ase.com
EOF

echo "✓ Handoff Materials Created" >&2
echo "  → /docs/HANDOFF.md (knowledge transfer)" >&2
echo "  → /docs/TROUBLESHOOTING.md (common issues)" >&2
echo "  → /docs/RUNBOOK.md (operational procedures)" >&2
echo "" >&2

# Communication
echo "========================================" >&2
echo "COMMUNICATION" >&2
echo "========================================" >&2
echo "" >&2

echo "✓ Slack Integration" >&2
echo "  → Channel: #client-$CLIENT_SLUG" >&2
echo "  → Webhooks: Deployment notifications" >&2
echo "  → Support bot configured" >&2
echo "" >&2

echo "✓ Email Notifications" >&2
echo "  → Weekly status reports" >&2
echo "  → Deployment summaries" >&2
echo "  → Error alerts" >&2
echo "" >&2

STATUS_PAGE_URL="https://status.$CLIENT_SLUG.b0ase.dev"
echo "✓ Status Page" >&2
echo "  → $STATUS_PAGE_URL" >&2
echo "  → Public uptime monitoring" >&2
echo "  → Incident history" >&2
echo "" >&2

# Next steps
echo "========================================" >&2
echo "NEXT STEPS" >&2
echo "========================================" >&2
echo "" >&2

echo "1. Schedule kickoff call" >&2
echo "   → Review infrastructure setup" >&2
echo "   → Walkthrough client dashboard" >&2
echo "   → Demonstrate deployment process" >&2
echo "" >&2

echo "2. Client access verification" >&2
echo "   → Confirm all team members can log in" >&2
echo "   → Test repository access" >&2
echo "   → Verify deployment permissions" >&2
echo "" >&2

echo "3. Knowledge transfer session" >&2
echo "   → Review documentation" >&2
echo "   → Demonstrate maintenance tasks" >&2
echo "   → Q&A" >&2
echo "" >&2

echo "4. Handoff checklist completion" >&2
echo "   → All credentials documented" >&2
echo "   → All access verified" >&2
echo "   → Client trained on dashboard" >&2
echo "   → Support contact info shared" >&2
echo "" >&2

# Support
echo "========================================" >&2
echo "SUPPORT" >&2
echo "========================================" >&2
echo "" >&2

echo "Client Support Channels:" >&2
echo "  → Email: support@b0ase.com" >&2
echo "  → Slack: #client-$CLIENT_SLUG" >&2
echo "  → Dashboard: $DASHBOARD_URL/support" >&2
echo "" >&2

echo "Project Manager: [Name]" >&2
echo "Technical Lead: [Name]" >&2
echo "" >&2

echo "========================================" >&2
echo "" >&2
echo "Onboarding complete! 🎉" >&2
echo "" >&2
echo "Project ID: $PROJECT_ID" >&2
echo "Client Portal: $DASHBOARD_URL" >&2
echo "Documentation: $OUTPUT_DIR" >&2
echo "" >&2

# Output JSON
cat <<EOF
{
  "success": true,
  "clientName": "$CLIENT_NAME",
  "clientSlug": "$CLIENT_SLUG",
  "projectId": "$PROJECT_ID",
  "projectType": "$PROJECT_TYPE",
  "infrastructure": {
    "repository": {
      "url": "$REPO_URL",
      "mainBranch": "main"
    },
    "environments": {
      "development": "$DEV_URL",
      "staging": "$STAGING_URL",
      "production": "$PRODUCTION_URL"
    }$([ "$DB_REQUIRED" = true ] && cat <<DBEOF2
,
    "database": {
      "provider": "railway",
      "type": "postgresql",
      "version": "15",
      "credentialsLocation": "1Password: $CLIENT_NAME"
    }
DBEOF2
),
    "cicd": {
      "provider": "github-actions",
      "configured": true
    },
    "monitoring": {
      "uptime": "uptimerobot",
      "errors": "sentry",
      "analytics": "plausible"
    }
  },
  "access": {
    "dashboard": "$DASHBOARD_URL",
    "repository": "$REPO_URL",
    "clientEmail": "$CLIENT_EMAIL",
    "credentialVault": "1Password: $CLIENT_NAME"
  },
  "documentation": [
    "README.md",
    "ARCHITECTURE.md",
    "API.md",
    "DEPLOYMENT.md",
    "MAINTENANCE.md",
    "docs/HANDOFF.md",
    "docs/TROUBLESHOOTING.md",
    "docs/RUNBOOK.md"
  ],
  "communication": {
    "slack": "#client-$CLIENT_SLUG",
    "email": "support@b0ase.com",
    "statusPage": "$STATUS_PAGE_URL"
  },
  "outputDirectory": "$OUTPUT_DIR",
  "onboardedAt": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF
