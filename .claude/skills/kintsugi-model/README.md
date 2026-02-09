# Kintsugi Agent Deployment

Secure, sandboxed deployment of an autonomous Claude Code agent on Hetzner VPS.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    HETZNER VPS                               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  AGENT CONTAINER (sandboxed, no secrets)            │    │
│  │                                                      │    │
│  │  - Claude Code CLI                                   │    │
│  │  - Node.js, pnpm, git                               │    │
│  │  - No network access (except Gateway)               │    │
│  │  - No sudo, no docker, no curl                      │    │
│  └────────────────────────┬────────────────────────────┘    │
│                           │                                  │
│                     HTTP to Gateway                          │
│                           │                                  │
│  ┌────────────────────────▼────────────────────────────┐    │
│  │  GATEWAY CONTAINER (has secrets)                    │    │
│  │                                                      │    │
│  │  - Injects API keys                                  │    │
│  │  - Rate limits requests                              │    │
│  │  - Allowlists operations                             │    │
│  │  - Audit logs everything                             │    │
│  └────────────────────────┬────────────────────────────┘    │
│                           │                                  │
│                    External APIs                             │
│                           │                                  │
│  ┌────────────────────────▼────────────────────────────┐    │
│  │  - api.anthropic.com (Claude)                       │    │
│  │  - api.github.com (Issues, PRs)                     │    │
│  │  - b0ase.com/api/pipeline (Work items)              │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Security Model

### What the Agent CAN Do
- Read/write files in `/home/kintsugi/projects/`
- Run npm, pnpm, node commands
- Run git commands
- Query the Pipeline API for work
- Read GitHub issues (via Gateway proxy)

### What the Agent CANNOT Do
- Access API keys or secrets directly
- Make arbitrary network requests
- Install system packages
- Run Docker commands
- Access the host filesystem
- Kill processes or access other containers

## Quick Start

### 1. Create Fresh GitHub Account

**CRITICAL**: Create a NEW GitHub account for Kintsugi. Never use your personal account.

```
Email: kintsugi@your-domain.com
Username: kintsugi-agent-yourname
```

Create a PAT with only these permissions:
- `repo` (for reading/writing to assigned repos)
- `read:org` (for org membership if needed)

### 2. Configure Secrets

```bash
cd .claude/skills/kintsugi-model
cp .env.example .env
# Edit .env with your keys
```

### 3. Deploy to Hetzner

```bash
./scripts/deploy.sh
```

### 4. Monitor

```bash
# View all logs
./scripts/logs.sh

# View agent logs only
./scripts/logs.sh agent

# Check status
./scripts/status.sh
```

### 5. Stop

```bash
./scripts/stop.sh
```

## Pipeline Integration

The agent connects to the b0ase.com Pipeline API:

1. **List work**: `GET /api/pipeline/work-items`
2. **Claim work**: `POST /api/pipeline/claim-issue`
3. **Start work**: `POST /api/pipeline/claim-issue {action: "start"}`
4. **Submit work**: `POST /api/pipeline/claim-issue {action: "submit"}`

All requests go through the Gateway which:
- Injects authentication
- Rate limits
- Logs for audit

## Rate Limits

| Resource | Default | Environment Variable |
|----------|---------|---------------------|
| Requests/minute | 60 | `MAX_REQUESTS_PER_MINUTE` |
| Tokens/hour | 100,000 | `MAX_TOKENS_PER_HOUR` |

## Cost Estimation

| Component | Monthly Cost |
|-----------|-------------|
| Hetzner VPS (CX21) | ~$5-10 |
| Anthropic API | $50-500+ (usage based) |
| **Total** | **$55-510+** |

The API costs dominate. Set token limits carefully.

## Troubleshooting

### Agent not starting

```bash
# Check gateway health
ssh hetzner "curl http://localhost:3001/health"

# Check container logs
./scripts/logs.sh
```

### Rate limit exceeded

Increase limits in `.env` or wait for reset.

### Work item claim failed

Another agent may have claimed it first. This is normal - try the next item.

## Files

```
kintsugi-model/
├── agent/
│   ├── Dockerfile          # Sandboxed agent container
│   ├── agent-config.json   # Claude Code permissions
│   ├── system-prompt.md    # Agent instructions
│   └── entrypoint.sh       # Startup script
├── gateway/
│   ├── Dockerfile          # Gateway container
│   ├── gateway.ts          # Proxy server
│   ├── package.json        # Dependencies
│   └── tsconfig.json       # TypeScript config
├── scripts/
│   ├── deploy.sh           # Deploy to Hetzner
│   ├── logs.sh             # View logs
│   ├── status.sh           # Check status
│   └── stop.sh             # Stop containers
├── docker-compose.yml      # Container orchestration
├── .env.example            # Configuration template
└── README.md               # This file
```

## Related Documentation

- `docs/KINTSUGI_HETZNER_DEPLOYMENT.md` - Full deployment architecture
- `docs/KINTSUGI_AI_SECURITY.md` - Security considerations
- `lib/pipeline-manager.ts` - Pipeline API implementation

## Part 3: Clawn.ch Listing

After deploying and testing, you can list Kintsugi on the Clawn.ch agent marketplace:

1. Create agent profile on Clawn.ch
2. Link to your Kintsugi GitHub org
3. Set pricing and availability
4. Enable for public work requests

See: https://clawn.ch/docs/listing-agents
