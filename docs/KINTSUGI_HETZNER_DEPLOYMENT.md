# Kintsugi Agent Deployment on Hetzner

**Status**: IMPLEMENTED - Ready to Deploy
**Last Updated**: 2026-01-31
**Risk Level**: HIGH (autonomous code execution)
**Implementation**: `.claude/skills/kintsugi-model/`

---

## Overview

Deploy a sandboxed Kintsugi agent on Hetzner that can build products 24/7 while maintaining security boundaries.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    HETZNER VPS                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  KINTSUGI CONTAINER (rootless podman, no sudo)          │    │
│  │                                                          │    │
│  │  User: kintsugi (UID 1000, no sudo)                     │    │
│  │  Capabilities: NONE (--cap-drop=ALL)                    │    │
│  │  Network: Allowlisted egress only                       │    │
│  │  Volumes: /home/kintsugi/projects (RW)                  │    │
│  │                                                          │    │
│  │  Tools available:                                        │    │
│  │  ├── node, pnpm, npm (build tools)                      │    │
│  │  ├── git (via credential helper → Gateway)              │    │
│  │  ├── docker CLI (proxied → Gateway)                     │    │
│  │  └── claude-code (AI agent)                             │    │
│  └────────────────────────┬────────────────────────────────┘    │
│                           │                                      │
│                     Unix Socket                                  │
│                           │                                      │
│  ┌────────────────────────▼────────────────────────────────┐    │
│  │  GATEWAY CONTAINER (has secrets, proxies requests)      │    │
│  │                                                          │    │
│  │  Responsibilities:                                       │    │
│  │  ├── Inject API keys (Anthropic, GitHub, Vercel)        │    │
│  │  ├── Proxy Docker commands (allowlist only)             │    │
│  │  ├── Proxy git operations (inject SSH key)              │    │
│  │  ├── Filter outputs (redact secrets)                    │    │
│  │  ├── Rate limit (prevent runaway costs)                 │    │
│  │  └── Audit log (all actions recorded)                   │    │
│  │                                                          │    │
│  │  Secrets (never exposed to Kintsugi):                   │    │
│  │  ├── ANTHROPIC_API_KEY                                  │    │
│  │  ├── GITHUB_TOKEN                                       │    │
│  │  ├── VERCEL_TOKEN                                       │    │
│  │  ├── SUPABASE_SERVICE_KEY                               │    │
│  │  └── SSH private keys                                   │    │
│  └────────────────────────┬────────────────────────────────┘    │
│                           │                                      │
│                    Docker Socket                                 │
│                           │                                      │
│  ┌────────────────────────▼────────────────────────────────┐    │
│  │  HOST DOCKER / SUPABASE STACK                           │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Security Tiers

| Tier | Access | Use Case |
|------|--------|----------|
| **BUILDER** | Build, test, lint in project dirs | Normal development |
| **DEPLOYER** | + Deploy to Vercel/Netlify | Ship to production |
| **ORCHESTRATOR** | + Create Docker containers | Complex builds |
| **ADMIN** | + Database migrations | Infrastructure changes |

Kintsugi starts at BUILDER, escalates only with explicit approval.

## Allowlisted Commands

### Always Allowed (BUILDER tier)
```bash
# Build tools
node, npm, pnpm, npx, yarn
bun, deno

# Testing
vitest, jest, mocha, pytest
pnpm test, npm test

# Linting
eslint, prettier, tsc, biome

# Version control (via Gateway proxy)
git clone, git add, git commit, git push, git pull, git fetch
git status, git diff, git log, git branch, git checkout
```

### Allowed with Approval (DEPLOYER tier)
```bash
# Deployment
vercel, netlify, railway, fly
pnpm deploy, npm run deploy
```

### Allowed with Approval (ORCHESTRATOR tier)
```bash
# Docker (proxied, no --privileged)
docker build, docker run, docker stop
docker logs, docker ps

# NOT allowed:
docker exec, docker --privileged, docker -v /:/host
```

### Blocked Always
```bash
# System access
sudo, su, passwd, chown (outside project)
apt, yum, dnf, pacman

# Network tools
nc, netcat, nmap, curl (to non-allowlisted hosts)
ssh (direct - must go through Gateway)

# Dangerous
rm -rf /, dd, mkfs
kill, killall, pkill (host processes)
mount, umount
```

## Network Allowlist

Kintsugi can only reach:
```
# Package registries
registry.npmjs.org
registry.yarnpkg.com

# APIs (via Gateway proxy)
api.anthropic.com (proxied)
api.github.com (proxied)
api.vercel.com (proxied)

# Code hosting
github.com
gitlab.com
bitbucket.org

# Documentation
docs.*.com (read-only)
```

## Secret Handling

**Never in Kintsugi container:**
- API keys
- SSH private keys
- Database credentials
- Service tokens

**Injected by Gateway at runtime:**
```typescript
// Gateway proxy injects auth
async function proxyGitPush(repo: string) {
  const sshKey = await vault.get('GITHUB_SSH_KEY');
  // Execute with key in isolated subprocess
  // Key never visible to Kintsugi
}
```

## Rate Limits

| Resource | Limit | Reason |
|----------|-------|--------|
| API calls | 1000/hour | Cost control |
| Docker containers | 5 concurrent | Resource limits |
| Disk writes | 10GB total | Prevent fill |
| Network egress | 100GB/day | Prevent abuse |
| Build time | 30 min max | Runaway prevention |

## Audit Logging

All actions logged to immutable store:
```json
{
  "timestamp": "2026-01-31T12:00:00Z",
  "action": "git push",
  "repo": "github.com/b0ase/project",
  "result": "success",
  "duration_ms": 1234,
  "tier": "DEPLOYER"
}
```

## Deployment Steps

### Phase 1: Create Kintsugi User
```bash
ssh hetzner

# Create unprivileged user
sudo useradd -m -s /bin/bash kintsugi
sudo usermod -aG docker kintsugi  # For proxied docker only

# Create project directory
sudo mkdir -p /home/kintsugi/projects
sudo chown kintsugi:kintsugi /home/kintsugi/projects
```

### Phase 2: Deploy Gateway Container
```bash
# Build gateway image
docker build -t kintsugi-gateway ./gateway

# Run with secrets
docker run -d \
  --name kintsugi-gateway \
  --restart unless-stopped \
  -v /var/run/docker.sock:/var/run/docker.sock:ro \
  -v /home/kintsugi/gateway.sock:/gateway.sock \
  --env-file /root/.kintsugi-secrets \
  kintsugi-gateway
```

### Phase 3: Deploy Kintsugi Container
```bash
# Build kintsugi image (no secrets baked in)
docker build -t kintsugi-agent ./agent

# Run without privileges
docker run -d \
  --name kintsugi-agent \
  --restart unless-stopped \
  --user 1000:1000 \
  --cap-drop ALL \
  --security-opt no-new-privileges \
  --read-only \
  --tmpfs /tmp:rw,noexec,nosuid \
  -v /home/kintsugi/projects:/projects:rw \
  -v /home/kintsugi/gateway.sock:/gateway.sock:ro \
  kintsugi-agent
```

### Phase 4: Test Security Boundaries
```bash
# Inside kintsugi container, these should FAIL:
sudo ls                    # No sudo
cat /etc/passwd           # Filesystem read-only
curl evil.com             # Not in allowlist
docker run --privileged   # Blocked by gateway
echo $ANTHROPIC_API_KEY   # Not in environment
```

## Monitoring

### Health Checks
- Gateway responds to ping
- Kintsugi can reach Gateway
- Build queue processing
- No container escapes

### Alerts
- Failed auth attempts
- Blocked command attempts
- Resource limit hits
- Unusual network traffic

## Rollback Plan

If security breach detected:
1. `docker stop kintsugi-agent kintsugi-gateway`
2. Rotate all secrets
3. Audit logs for exfiltration
4. Rebuild containers from scratch

## Future Enhancements

- [ ] Rootless Podman instead of Docker
- [ ] gVisor for additional isolation
- [ ] Hardware security module for secrets
- [ ] Multi-region execution nodes
- [ ] Auto-scaling based on workload

---

## References

- `docs/KINTSUGI_AI_SECURITY.md` - Secret isolation patterns
- `docs/TRAIL_OF_BITS_ANALYSIS.md` - Security best practices
- `docs/_archive/AGENT_SYSTEMS_RESEARCH.md` - Clawdbot architecture

---

**Next Steps:**
1. Build Gateway container with command proxy
2. Build Kintsugi container with sandboxing
3. Test security boundaries
4. Deploy and monitor
