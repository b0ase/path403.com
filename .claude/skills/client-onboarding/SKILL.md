---
name: b0ase-client-onboarding
description: Complete client onboarding workflow for b0ase projects. Use when starting new client engagement, setting up project infrastructure, or creating client handoff documentation. Triggers on "Onboard new client", "Setup client project", or "Create client handoff".
license: MIT
metadata:
  author: b0ase.com
  version: "1.0.0"
---

# b0ase Client Onboarding

Automated client onboarding workflow. Sets up complete project infrastructure, access credentials, documentation, and handoff materials.

## When to Use

Deploy this skill when:
- Starting new client engagement
- Setting up project infrastructure
- Creating client access and credentials
- Generating handoff documentation
- Onboarding clients to ongoing projects

## What Gets Created

### Infrastructure
- Project repository (GitHub/GitLab)
- Development, staging, production environments
- Database instances (if needed)
- CI/CD pipelines
- Monitoring and error tracking

### Access & Credentials
- Client dashboard access
- Repository permissions
- Deployment platform access
- Database credentials
- API keys (documented securely)

### Documentation
- Comprehensive README
- Architecture documentation
- API documentation
- Deployment guide
- Maintenance runbook

### Communication
- Project Slack channel
- Email notifications
- Status dashboard
- Support contact info

## Usage

```bash
bash /mnt/skills/user/client-onboarding/scripts/onboard.sh [client-name] [project-type]
```

**Arguments:**
- `client-name` - Client company name (required)
- `project-type` - Type: web-app|api|fullstack|ai-content|ecommerce (defaults to fullstack)

**Examples:**

```bash
# Onboard new web app client
bash /mnt/skills/user/client-onboarding/scripts/onboard.sh "Acme Corp" web-app

# Onboard AI content business client
bash /mnt/skills/user/client-onboarding/scripts/onboard.sh "FitnessBrand" ai-content

# Onboard full-stack project
bash /mnt/skills/user/client-onboarding/scripts/onboard.sh "Startup Inc" fullstack

# Onboard e-commerce client
bash /mnt/skills/user/client-onboarding/scripts/onboard.sh "Shop Co" ecommerce
```

## Output

```
Setting up client: Acme Corp
Project type: Full-stack Application

========================================
INFRASTRUCTURE SETUP
========================================

✓ Repository Created
  → GitHub: https://github.com/b0ase-clients/acme-corp
  → Main branch: main
  → Protected branches configured

✓ Environments Configured
  → Development: https://dev.acme-corp.b0ase.dev
  → Staging: https://staging.acme-corp.b0ase.dev
  → Production: https://acme-corp.com

✓ Database Provisioned
  → PostgreSQL 15 on Railway
  → Connection: postgresql://***@***:5432/acme_prod
  → Credentials: See 1Password vault "Acme Corp"

✓ CI/CD Pipeline
  → GitHub Actions configured
  → Auto-deploy: staging (on push), production (on tag)
  → Tests run on all PRs

✓ Monitoring Enabled
  → Uptime: UptimeRobot (5min checks)
  → Errors: Sentry configured
  → Analytics: Plausible

========================================
ACCESS CREDENTIALS
========================================

✓ Client Dashboard
  → URL: https://dashboard.b0ase.com/clients/acme-corp
  → Login: admin@acme.com
  → Password: Sent via secure link

✓ Repository Access
  → GitHub team: @b0ase-clients/acme-corp
  → Invited: admin@acme.com, dev@acme.com

✓ Deployment Access
  → Railway: Project shared with admin@acme.com
  → Vercel: Team member invited

✓ Credential Storage
  → 1Password vault created: "Acme Corp"
  → Shared with client team
  → Contains: DB creds, API keys, deployment tokens

========================================
DOCUMENTATION
========================================

✓ Project Documentation Generated
  → README.md (comprehensive setup guide)
  → ARCHITECTURE.md (system design)
  → API.md (endpoint documentation)
  → DEPLOYMENT.md (deployment procedures)
  → MAINTENANCE.md (ongoing operations)

✓ Handoff Materials Created
  → /docs/HANDOFF.md (knowledge transfer)
  → /docs/TROUBLESHOOTING.md (common issues)
  → /docs/RUNBOOK.md (operational procedures)

========================================
COMMUNICATION
========================================

✓ Slack Integration
  → Channel: #client-acme-corp
  → Webhooks: Deployment notifications
  → Support bot configured

✓ Email Notifications
  → Weekly status reports
  → Deployment summaries
  → Error alerts

✓ Status Page
  → https://status.acme-corp.b0ase.dev
  → Public uptime monitoring
  → Incident history

========================================
NEXT STEPS
========================================

1. Schedule kickoff call
   → Review infrastructure setup
   → Walkthrough client dashboard
   → Demonstrate deployment process

2. Client access verification
   → Confirm all team members can log in
   → Test repository access
   → Verify deployment permissions

3. Knowledge transfer session
   → Review documentation
   → Demonstrate maintenance tasks
   → Q&A

4. Handoff checklist completion
   → All credentials documented
   → All access verified
   → Client trained on dashboard
   → Support contact info shared

========================================
SUPPORT
========================================

Client Support Channels:
  → Email: support@b0ase.com
  → Slack: #client-acme-corp
  → Emergency: +1 (XXX) XXX-XXXX
  → Dashboard: https://dashboard.b0ase.com/support

Project Manager: [Name]
Technical Lead: [Name]

========================================

Onboarding complete! 🎉

Project ID: proj_abc123xyz
Client Portal: https://dashboard.b0ase.com/clients/acme-corp
```

The script outputs JSON for programmatic integration:

```json
{
  "success": true,
  "clientName": "Acme Corp",
  "projectId": "proj_abc123xyz",
  "projectType": "fullstack",
  "infrastructure": {
    "repository": {
      "url": "https://github.com/b0ase-clients/acme-corp",
      "mainBranch": "main"
    },
    "environments": {
      "development": "https://dev.acme-corp.b0ase.dev",
      "staging": "https://staging.acme-corp.b0ase.dev",
      "production": "https://acme-corp.com"
    },
    "database": {
      "provider": "railway",
      "type": "postgresql",
      "version": "15",
      "credentialsLocation": "1Password: Acme Corp"
    },
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
    "dashboard": "https://dashboard.b0ase.com/clients/acme-corp",
    "repository": "https://github.com/b0ase-clients/acme-corp",
    "credentialVault": "1Password: Acme Corp"
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
    "slack": "#client-acme-corp",
    "email": "support@b0ase.com",
    "statusPage": "https://status.acme-corp.b0ase.dev"
  },
  "onboardedAt": "2026-01-16T04:00:00Z"
}
```

## Project Type Configurations

### Web App
- Frontend framework (Next.js, React, Vue)
- Static site or SSR
- CDN configuration
- Asset optimization

### API
- RESTful or GraphQL API
- Database setup
- Authentication/authorization
- Rate limiting
- API documentation (OpenAPI/Swagger)

### Full-stack
- Frontend + backend
- Database
- Authentication
- File storage
- Email service
- Payment integration (if needed)

### AI Content
- Content engine infrastructure
- Multi-platform distribution
- Analytics dashboard
- Monetization tracking
- Client brand portal

### E-commerce
- Product catalog
- Shopping cart
- Payment processing (Stripe)
- Order management
- Inventory tracking
- Email notifications
- Admin dashboard

## Security Configuration

All projects include:

### SSL/TLS
- Automatic SSL certificates (Let's Encrypt or platform-provided)
- HTTPS enforcement
- HSTS headers

### Authentication
- Secure password hashing (bcrypt)
- Session management
- JWT tokens (where applicable)
- OAuth integration options

### Database Security
- Connection encryption
- Principle of least privilege
- Regular backups
- Point-in-time recovery

### API Security
- API key authentication
- Rate limiting
- CORS configuration
- Input validation
- SQL injection prevention

### Secrets Management
- Environment variables for all secrets
- 1Password vault for team sharing
- Rotation procedures documented
- No secrets in git history

## Monitoring Setup

### Uptime Monitoring
- 5-minute ping checks (UptimeRobot)
- Multi-region checks
- SMS/email alerts
- Public status page

### Error Tracking
- Sentry integration
- Source maps for debugging
- Release tracking
- User context capture
- Alert rules configured

### Performance Monitoring
- Core Web Vitals tracking
- API response time monitoring
- Database query performance
- Custom metrics

### Analytics
- Privacy-friendly analytics (Plausible)
- No cookies or tracking
- GDPR compliant
- Real-time dashboard

## Client Dashboard Features

The b0ase client dashboard provides:

### Project Overview
- Deployment status
- Environment health
- Recent activity
- Quick links

### Deployments
- Deploy history
- Rollback capability
- Environment variables management
- Build logs

### Monitoring
- Uptime status
- Error rates
- Performance metrics
- Custom alerts

### Team Management
- User access control
- Invite team members
- Role-based permissions

### Support
- Submit tickets
- Documentation access
- Knowledge base
- Contact information

### Billing (if applicable)
- Usage tracking
- Invoices
- Payment methods

## Handoff Checklist

Before client handoff, verify:

### Technical Handoff
- [ ] All code committed and pushed
- [ ] Documentation complete
- [ ] Tests passing (>80% coverage)
- [ ] Production deployment successful
- [ ] Monitoring configured and alerting
- [ ] Backups verified
- [ ] Performance benchmarks met
- [ ] Security audit passed

### Access Handoff
- [ ] Client team has repository access
- [ ] Dashboard credentials shared
- [ ] 1Password vault shared
- [ ] Deployment platform access granted
- [ ] DNS control transferred (if applicable)
- [ ] Domain ownership verified

### Documentation Handoff
- [ ] README comprehensive
- [ ] API documented
- [ ] Architecture explained
- [ ] Deployment guide tested
- [ ] Maintenance runbook complete
- [ ] Troubleshooting guide created
- [ ] Video walkthrough recorded (optional)

### Knowledge Transfer
- [ ] Kickoff call completed
- [ ] Dashboard demo given
- [ ] Deployment process demonstrated
- [ ] Maintenance tasks explained
- [ ] Q&A session completed
- [ ] Training materials provided

### Legal/Admin
- [ ] Contracts signed
- [ ] Payment terms agreed
- [ ] Support SLA defined
- [ ] Ownership transferred
- [ ] Final invoice sent

## Ongoing Support Tiers

### Tier 1: Basic Support (Included)
- Email support (24-hour response)
- Dashboard access
- Documentation and knowledge base
- Community Slack access
- Security updates

### Tier 2: Standard Support ($500/month)
- Priority email (4-hour response)
- Monthly maintenance
- Dependency updates
- Performance optimization
- Dedicated Slack channel

### Tier 3: Premium Support ($2000/month)
- 24/7 emergency support
- Dedicated account manager
- Proactive monitoring
- Monthly strategy calls
- Feature development hours included
- White-glove service

## Client Communication Templates

The skill generates email templates for:

### Welcome Email
- Project overview
- Access credentials
- Next steps
- Support contacts

### Handoff Email
- Project completion summary
- Documentation links
- Support information
- Feedback request

### Monthly Status Report
- Uptime summary
- Performance metrics
- Recent updates
- Upcoming plans

### Incident Notification
- Issue description
- Impact assessment
- Resolution status
- Prevention measures

## Customization Options

Customize onboarding with flags:

```bash
# Include e-commerce features
bash scripts/onboard.sh "Shop Co" fullstack --ecommerce

# Setup multi-region deployment
bash scripts/onboard.sh "Global App" web-app --multi-region

# Include advanced monitoring
bash scripts/onboard.sh "Enterprise" fullstack --monitoring=premium

# White-label for agency clients
bash scripts/onboard.sh "Agency Client" web-app --white-label
```

## Integration with Other Skills

This skill integrates with:
- **b0ase Standards**: Ensures new projects meet compliance
- **Multi-Deploy**: Sets up all deployment environments
- **AI Content Engine**: Special onboarding for content clients

## Post-Onboarding

After onboarding completes:

### Week 1
- Monitor deployment stability
- Address any access issues
- Schedule knowledge transfer call

### Week 2-4
- Weekly check-ins
- Performance optimization
- Feature requests triage

### Month 2+
- Monthly status reports
- Proactive maintenance
- Growth planning

## Support Resources

- Client onboarding guide: https://docs.b0ase.com/onboarding
- Dashboard tutorial: https://docs.b0ase.com/dashboard
- Support: support@b0ase.com
- Emergency: Available for premium clients
