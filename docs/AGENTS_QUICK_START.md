# Agent System Quick Start Guide

> Get your first AI agent running in 5 minutes.

## Prerequisites

- Node.js 18+
- pnpm installed
- Supabase project configured
- `ANTHROPIC_API_KEY` in `.env.local`

## Create Your First Agent

### Step 1: Start the Development Server

```bash
pnpm dev
```

### Step 2: Navigate to Agent Dashboard

Open [http://localhost:3000/dashboard/agents](http://localhost:3000/dashboard/agents)

### Step 3: Create an Agent

Click **"Create Agent"** and fill in:

| Field | Example | Description |
|-------|---------|-------------|
| Name | "Marketing Bot" | Display name for your agent |
| Role | `marketer` | One of: `developer`, `marketer`, `support`, `content`, `custom` |
| Description | "Generates social media content" | What the agent does |
| System Prompt | (optional) | Custom instructions - leave blank for role default |

### Step 4: Start Chatting

After creation, you'll be redirected to the agent chat interface. Type a message and watch your agent respond in real-time via streaming.

---

## Adding Scheduled Tasks

Agents can run automated tasks on a schedule using cron expressions.

### Create a Task

1. Go to your agent's detail page: `/dashboard/agents/[id]`
2. Click the **Tasks** tab
3. Click **"Add Task"**

### Task Configuration

```json
{
  "task_name": "Daily Tweet",
  "task_type": "tweet",
  "cron_expression": "0 9 * * *",
  "task_config": {
    "topic": "AI and technology trends",
    "style": "professional",
    "hashtags": ["AI", "Tech", "Innovation"]
  }
}
```

### Common Cron Expressions

| Expression | Schedule |
|------------|----------|
| `0 9 * * *` | Daily at 9:00 AM |
| `0 9 * * 1` | Every Monday at 9:00 AM |
| `0 */6 * * *` | Every 6 hours |
| `0 9,18 * * *` | Twice daily at 9 AM and 6 PM |
| `*/30 * * * *` | Every 30 minutes |

### Available Task Types

| Type | Purpose | Config Options |
|------|---------|----------------|
| `tweet` | Generate and post tweets | `topic`, `style`, `hashtags` |
| `blog` | Generate blog posts | `topic`, `word_count`, `tone` |
| `analysis` | Run data analysis | `data_source`, `metrics`, `format` |
| `webhook` | Call external APIs | `url`, `method`, `headers`, `body` |
| `ai_generate` | Custom AI generation | `prompt`, `max_tokens`, `output_format` |
| `inscription` | Inscribe to BSV blockchain | `content_source`, `content_type` |
| `custom` | Freeform task | Any JSON config |

---

## Linking Projects

Agents can be linked to projects for context-aware assistance.

### Link a Project

1. Go to your agent's detail page
2. Click the **Projects** tab
3. Click **"Link Project"**
4. Select a project and set permissions:

| Permission | Description |
|------------|-------------|
| `can_read` | Agent can read project files and data |
| `can_write` | Agent can modify project files |
| `can_deploy` | Agent can trigger deployments |

### How It Works

When an agent is linked to projects, the project context is automatically injected into:
- Chat conversations (system prompt)
- Task execution (project awareness)

Example system prompt injection:
```
You have access to the following projects:
- Project: "E-commerce Site" (Permissions: read, write)
- Project: "Marketing Dashboard" (Permissions: read)
```

---

## BSV Blockchain Inscriptions

Agents can inscribe their outputs permanently on the BSV blockchain.

### Create an Inscription

**Via API:**
```bash
curl -X POST /api/agents/[id]/inscriptions \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Agent generated this analysis on 2026-01-19...",
    "contentType": "text/plain",
    "taskName": "Weekly Analysis"
  }'
```

**Via Scheduled Task:**
```json
{
  "task_type": "inscription",
  "task_config": {
    "content_source": "generate",
    "prompt": "Generate a weekly market summary",
    "content_type": "text/markdown"
  }
}
```

### Content Sources for Inscriptions

| Source | Description |
|--------|-------------|
| `generate` | AI generates content from prompt |
| `static` | Use provided static content |
| `latest_output` | Inscribe the agent's most recent output |

### View Inscriptions

Go to your agent's **Inscriptions** tab to see all blockchain records with:
- Transaction ID
- Content hash
- WhatsOnChain explorer link

---

## API Quick Reference

### Create Agent
```bash
POST /api/agents/create
{
  "name": "My Agent",
  "role": "developer",
  "description": "Helps with coding tasks"
}
```

### Chat with Agent
```bash
POST /api/agents/[id]/chat
{
  "message": "Hello, can you help me?"
}
# Returns: Server-Sent Events stream
```

### List Agent Tasks
```bash
GET /api/agents/[id]/tasks
```

### Run Task Manually
```bash
POST /api/agents/[id]/tasks/[taskId]
```

### Link Project
```bash
POST /api/agents/[id]/projects
{
  "project_id": "uuid",
  "can_read": true,
  "can_write": false,
  "can_deploy": false
}
```

For complete API documentation, see [AGENTS_API_REFERENCE.md](./AGENTS_API_REFERENCE.md).

---

## Troubleshooting

### Agent not responding
1. Check `ANTHROPIC_API_KEY` is set in `.env.local`
2. Verify Supabase connection
3. Check browser console for errors

### Tasks not running
1. Verify cron expression syntax at [crontab.guru](https://crontab.guru)
2. Check task is enabled (`is_enabled: true`)
3. Verify `next_run_at` is in the past
4. Check Vercel cron logs (production)

### Inscriptions failing
1. Ensure `BSV_PRIVATE_KEY` is set
2. Verify the address has UTXOs (needs funding)
3. Check content size < 100KB

### Project context not appearing
1. Verify project is linked with correct permissions
2. Check agent has `can_read` permission
3. Restart conversation after linking

---

## Next Steps

- Read the full [Agent System Specification](./AGENT_SYSTEM_SPEC.md)
- Explore the [API Reference](./AGENTS_API_REFERENCE.md)
- Check the [Agent Dashboard](/dashboard/agents) for your agents

---

*Last Updated: January 19, 2026*
