# Agent System API Reference

Complete API documentation for the b0ase.com Agent System.

**Base URL:** `/api/agents`
**Authentication:** All routes require Supabase authentication via session cookie.

---

## Table of Contents

1. [Agent Management](#agent-management)
   - [List Agents](#list-agents)
   - [Create Agent](#create-agent)
   - [Get Agent](#get-agent)
   - [Update Agent](#update-agent)
   - [Delete Agent](#delete-agent)
2. [Agent Chat](#agent-chat)
   - [Send Message (Streaming)](#send-message-streaming)
3. [Conversations](#conversations)
   - [List Conversations](#list-conversations)
   - [Create Conversation](#create-conversation)
   - [Get Conversation Messages](#get-conversation-messages)
4. [Tasks](#tasks)
   - [List Tasks](#list-tasks)
   - [Create Task](#create-task)
   - [Get Task](#get-task)
   - [Update Task](#update-task)
   - [Delete Task](#delete-task)
   - [Execute Task Manually](#execute-task-manually)
5. [Projects](#projects)
   - [List Linked Projects](#list-linked-projects)
   - [Link Project](#link-project)
   - [Update Project Link](#update-project-link)
   - [Unlink Project](#unlink-project)
6. [Inscriptions](#inscriptions)
   - [List Inscriptions](#list-inscriptions)
   - [Create Inscription](#create-inscription)
   - [Get Inscription](#get-inscription)
7. [Error Codes](#error-codes)

---

## Agent Management

### List Agents

Retrieve all agents owned by the authenticated user.

```
GET /api/agents
```

**Response:**
```json
{
  "agents": [
    {
      "id": "uuid",
      "name": "Marketing Bot",
      "description": "Generates social media content",
      "role": "marketer",
      "ai_provider": "claude",
      "ai_model": "claude-sonnet-4-5-20250514",
      "is_active": true,
      "is_deployed": false,
      "created_at": "2026-01-19T10:00:00Z",
      "last_active_at": "2026-01-19T15:30:00Z"
    }
  ]
}
```

---

### Create Agent

Create a new AI agent.

```
POST /api/agents/create
```

**Request Body:**
```json
{
  "name": "Marketing Bot",
  "description": "Generates social media content",
  "role": "marketer",
  "ai_provider": "claude",
  "ai_model": "claude-sonnet-4-5-20250514",
  "system_prompt": "You are a marketing specialist...",
  "temperature": 0.7,
  "max_tokens": 4096
}
```

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `name` | string | Yes | - | Display name for the agent |
| `description` | string | No | null | What the agent does |
| `role` | string | Yes | - | One of: `developer`, `marketer`, `support`, `content`, `custom` |
| `ai_provider` | string | No | `claude` | AI provider: `claude` or `openai` |
| `ai_model` | string | No | `claude-sonnet-4-5-20250514` | Model identifier |
| `system_prompt` | string | No | Role default | Custom system instructions |
| `temperature` | number | No | 0.7 | Response creativity (0-1) |
| `max_tokens` | number | No | 4096 | Maximum response length |

**Response (201):**
```json
{
  "success": true,
  "agent": {
    "id": "uuid",
    "name": "Marketing Bot",
    "role": "marketer",
    "created_at": "2026-01-19T10:00:00Z"
  }
}
```

**Errors:**
- `400` - Name and role are required
- `400` - Invalid role
- `401` - Unauthorized

---

### Get Agent

Retrieve a specific agent by ID.

```
GET /api/agents/[id]
```

**Response:**
```json
{
  "agent": {
    "id": "uuid",
    "name": "Marketing Bot",
    "description": "Generates social media content",
    "role": "marketer",
    "ai_provider": "claude",
    "ai_model": "claude-sonnet-4-5-20250514",
    "system_prompt": "You are a marketing specialist...",
    "temperature": 0.7,
    "max_tokens": 4096,
    "is_active": true,
    "is_deployed": false,
    "created_at": "2026-01-19T10:00:00Z",
    "updated_at": "2026-01-19T12:00:00Z",
    "last_active_at": "2026-01-19T15:30:00Z"
  }
}
```

**Errors:**
- `401` - Unauthorized
- `404` - Agent not found

---

### Update Agent

Update an existing agent's configuration.

```
PATCH /api/agents/[id]
```

**Request Body:**
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "system_prompt": "New instructions...",
  "temperature": 0.8,
  "is_active": false
}
```

All fields are optional. Only provided fields will be updated.

**Response:**
```json
{
  "success": true,
  "agent": { ... }
}
```

---

### Delete Agent

Delete an agent and all associated data.

```
DELETE /api/agents/[id]
```

**Response:**
```json
{
  "success": true,
  "message": "Agent deleted"
}
```

**Note:** This cascades to delete all conversations, tasks, and outputs.

---

## Agent Chat

### Send Message (Streaming)

Send a message to an agent and receive a streaming response via Server-Sent Events (SSE).

```
POST /api/agents/[id]/chat
```

**Request Body:**
```json
{
  "message": "Can you help me write a blog post about AI?",
  "conversation_id": "uuid"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `message` | string | Yes | User's message |
| `conversation_id` | string | No | Existing conversation ID. If omitted, creates new conversation. |

**Response:** Server-Sent Events stream

```
data: {"text": "Sure"}
data: {"text": ", I"}
data: {"text": "'d be"}
data: {"text": " happy"}
data: {"text": " to help!"}
data: [DONE]
```

**Client Implementation:**
```typescript
const response = await fetch(`/api/agents/${agentId}/chat`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: 'Hello!' }),
});

const reader = response.body?.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  const chunk = decoder.decode(value);
  const lines = chunk.split('\n');

  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = line.slice(6);
      if (data === '[DONE]') break;
      const { text } = JSON.parse(data);
      console.log(text); // Append to UI
    }
  }
}
```

---

## Conversations

### List Conversations

Get all conversations for an agent.

```
GET /api/agents/[id]/conversations
```

**Response:**
```json
{
  "conversations": [
    {
      "id": "uuid",
      "title": "Marketing Strategy Discussion",
      "status": "active",
      "message_count": 24,
      "created_at": "2026-01-19T10:00:00Z",
      "last_message_at": "2026-01-19T15:30:00Z"
    }
  ]
}
```

---

### Create Conversation

Start a new conversation with an agent.

```
POST /api/agents/[id]/conversations
```

**Request Body:**
```json
{
  "title": "New Project Discussion"
}
```

**Response (201):**
```json
{
  "conversation": {
    "id": "uuid",
    "title": "New Project Discussion",
    "status": "active",
    "created_at": "2026-01-19T16:00:00Z"
  }
}
```

---

### Get Conversation Messages

Retrieve messages from a specific conversation.

```
GET /api/agents/[id]/conversations/[convId]/messages
```

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `limit` | number | 50 | Max messages to return |
| `before` | string | - | Cursor for pagination (message ID) |

**Response:**
```json
{
  "messages": [
    {
      "id": "uuid",
      "role": "user",
      "content": "Hello!",
      "created_at": "2026-01-19T10:00:00Z"
    },
    {
      "id": "uuid",
      "role": "assistant",
      "content": "Hi! How can I help you today?",
      "model_used": "claude-sonnet-4-5-20250514",
      "tokens_used": 15,
      "created_at": "2026-01-19T10:00:05Z"
    }
  ],
  "has_more": false
}
```

---

## Tasks

### List Tasks

Get all scheduled tasks for an agent.

```
GET /api/agents/[id]/tasks
```

**Response:**
```json
{
  "tasks": [
    {
      "id": "uuid",
      "task_name": "Daily Tweet",
      "task_type": "tweet",
      "cron_expression": "0 9 * * *",
      "task_config": {
        "topic": "AI trends",
        "style": "professional"
      },
      "is_enabled": true,
      "last_run_at": "2026-01-19T09:00:00Z",
      "next_run_at": "2026-01-20T09:00:00Z",
      "execution_count": 15,
      "success_count": 14,
      "failure_count": 1
    }
  ]
}
```

---

### Create Task

Create a new scheduled task for an agent.

```
POST /api/agents/[id]/tasks
```

**Request Body:**
```json
{
  "task_name": "Weekly Blog Post",
  "task_type": "blog",
  "task_description": "Generate a weekly blog post about tech trends",
  "cron_expression": "0 9 * * 1",
  "task_config": {
    "topic": "technology trends",
    "word_count": 1500,
    "tone": "professional",
    "include_code_examples": true
  }
}
```

**Task Types and Config Schemas:**

#### `tweet`
```json
{
  "topic": "string - What to tweet about",
  "style": "string - casual|professional|humorous",
  "hashtags": ["array", "of", "hashtags"],
  "max_length": "number - Max characters (default: 280)"
}
```

#### `blog`
```json
{
  "topic": "string - Blog post topic",
  "word_count": "number - Target word count",
  "tone": "string - professional|casual|technical",
  "include_code_examples": "boolean",
  "seo_keywords": ["array", "of", "keywords"]
}
```

#### `analysis`
```json
{
  "data_source": "string - Where to fetch data",
  "metrics": ["array", "of", "metrics"],
  "format": "string - summary|detailed|charts",
  "time_range": "string - 7d|30d|90d"
}
```

#### `webhook`
```json
{
  "url": "string - Webhook URL to call",
  "method": "string - GET|POST|PUT",
  "headers": { "key": "value" },
  "body": { "any": "json" },
  "retry_count": "number - Retries on failure"
}
```

#### `ai_generate`
```json
{
  "prompt": "string - Custom prompt for AI",
  "max_tokens": "number - Max response length",
  "output_format": "string - text|json|markdown",
  "save_to": "string - Where to save output"
}
```

#### `inscription`
```json
{
  "content_source": "string - generate|static|latest_output",
  "prompt": "string - For generate source",
  "static_content": "string - For static source",
  "content_type": "string - text/plain|text/markdown|application/json"
}
```

#### `custom`
```json
{
  "any": "Custom configuration",
  "fields": "as needed"
}
```

**Response (201):**
```json
{
  "success": true,
  "task": {
    "id": "uuid",
    "task_name": "Weekly Blog Post",
    "next_run_at": "2026-01-20T09:00:00Z"
  }
}
```

---

### Get Task

Get a specific task by ID.

```
GET /api/agents/[id]/tasks/[taskId]
```

**Response:**
```json
{
  "task": {
    "id": "uuid",
    "task_name": "Daily Tweet",
    "task_type": "tweet",
    "task_description": "Post daily AI insights",
    "cron_expression": "0 9 * * *",
    "task_config": { ... },
    "is_enabled": true,
    "last_run_at": "2026-01-19T09:00:00Z",
    "next_run_at": "2026-01-20T09:00:00Z",
    "execution_count": 15,
    "success_count": 14,
    "failure_count": 1,
    "created_at": "2026-01-01T10:00:00Z"
  }
}
```

---

### Update Task

Update a task's configuration.

```
PATCH /api/agents/[id]/tasks/[taskId]
```

**Request Body:**
```json
{
  "task_name": "Updated Name",
  "cron_expression": "0 10 * * *",
  "task_config": { "topic": "new topic" },
  "is_enabled": false
}
```

---

### Delete Task

Delete a scheduled task.

```
DELETE /api/agents/[id]/tasks/[taskId]
```

**Response:**
```json
{
  "success": true,
  "message": "Task deleted"
}
```

---

### Execute Task Manually

Trigger immediate execution of a task (bypasses cron schedule).

```
POST /api/agents/[id]/tasks/[taskId]
```

**Response:**
```json
{
  "success": true,
  "result": {
    "output": "Generated content...",
    "tokens_used": 500,
    "execution_time_ms": 2500
  }
}
```

---

## Projects

### List Linked Projects

Get all projects linked to an agent.

```
GET /api/agents/[id]/projects
```

**Response:**
```json
{
  "projects": [
    {
      "id": "uuid",
      "project_id": "uuid",
      "project_name": "E-commerce Site",
      "project_description": "Online store built with Next.js",
      "can_read": true,
      "can_write": true,
      "can_deploy": false,
      "linked_at": "2026-01-15T10:00:00Z"
    }
  ]
}
```

---

### Link Project

Link a project to an agent with specific permissions.

```
POST /api/agents/[id]/projects
```

**Request Body:**
```json
{
  "project_id": "uuid",
  "can_read": true,
  "can_write": true,
  "can_deploy": false
}
```

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `project_id` | string | Yes | - | Project UUID to link |
| `can_read` | boolean | No | true | Agent can read project data |
| `can_write` | boolean | No | false | Agent can modify project |
| `can_deploy` | boolean | No | false | Agent can trigger deployments |

**Response (201):**
```json
{
  "success": true,
  "link": {
    "id": "uuid",
    "project_id": "uuid",
    "can_read": true,
    "can_write": true,
    "can_deploy": false
  }
}
```

---

### Update Project Link

Update permissions for a linked project.

```
PATCH /api/agents/[id]/projects/[projectId]
```

**Request Body:**
```json
{
  "can_read": true,
  "can_write": false,
  "can_deploy": false
}
```

---

### Unlink Project

Remove a project link from an agent.

```
DELETE /api/agents/[id]/projects/[projectId]
```

**Response:**
```json
{
  "success": true,
  "message": "Project unlinked"
}
```

---

## Inscriptions

### List Inscriptions

Get all BSV blockchain inscriptions for an agent.

```
GET /api/agents/[id]/inscriptions
```

**Response:**
```json
{
  "inscriptions": [
    {
      "id": "uuid",
      "inscription_id": "txid_0",
      "transaction_id": "abc123...",
      "content_hash": "sha256...",
      "inscription_type": "text/markdown",
      "inscription_url": "https://whatsonchain.com/tx/abc123",
      "created_at": "2026-01-19T10:00:00Z"
    }
  ]
}
```

---

### Create Inscription

Inscribe agent content on the BSV blockchain.

```
POST /api/agents/[id]/inscriptions
```

**Request Body:**
```json
{
  "content": "This is the content to inscribe permanently on-chain.",
  "contentType": "text/plain",
  "conversationId": "uuid",
  "outputId": "uuid",
  "taskName": "Weekly Report"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `content` | string | Yes | Content to inscribe (max 100KB) |
| `contentType` | string | No | `text/plain`, `text/markdown`, or `application/json` |
| `conversationId` | string | No | Link to conversation |
| `outputId` | string | No | Link to agent output |
| `taskName` | string | No | Associated task name |

**Response (201):**
```json
{
  "success": true,
  "inscription": {
    "txid": "abc123...",
    "inscriptionId": "abc123_0",
    "inscriptionUrl": "https://whatsonchain.com/tx/abc123",
    "contentHash": "sha256...",
    "blockchainExplorerUrl": "https://whatsonchain.com/tx/abc123"
  }
}
```

**Errors:**
- `400` - Content is required
- `400` - Content too large (max 100KB)
- `400` - This output has already been inscribed
- `500` - BSV private key not configured
- `500` - No UTXOs found (address needs funding)

---

### Get Inscription

Get a specific inscription with optional blockchain verification.

```
GET /api/agents/[id]/inscriptions/[inscriptionId]
```

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `verify` | boolean | false | Verify inscription on blockchain |

**Response:**
```json
{
  "inscription": {
    "id": "uuid",
    "agentId": "uuid",
    "conversationId": "uuid",
    "outputId": "uuid",
    "inscriptionId": "txid_0",
    "transactionId": "abc123...",
    "contentHash": "sha256...",
    "inscriptionUrl": "https://whatsonchain.com/tx/abc123",
    "inscriptionType": "text/markdown",
    "createdAt": "2026-01-19T10:00:00Z"
  },
  "blockchainVerification": {
    "verified": true,
    "contentHashMatch": true,
    "document": { ... }
  }
}
```

The `blockchainVerification` field is only present when `?verify=true`.

---

## Error Codes

All endpoints return consistent error responses:

```json
{
  "error": "Error message description"
}
```

| Status | Meaning |
|--------|---------|
| `400` | Bad Request - Invalid input |
| `401` | Unauthorized - Not logged in |
| `403` | Forbidden - No permission |
| `404` | Not Found - Resource doesn't exist |
| `409` | Conflict - Resource already exists |
| `429` | Too Many Requests - Rate limited |
| `500` | Internal Server Error |

### Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| `Unauthorized` | No valid session | Log in |
| `Agent not found` | Invalid agent ID or not owner | Check ID, verify ownership |
| `Invalid role` | Role not in allowed list | Use: developer, marketer, support, content, custom |
| `Content too large` | Inscription > 100KB | Reduce content size |
| `No UTXOs found` | BSV address not funded | Send BSV to inscription address |
| `Invalid cron expression` | Malformed cron syntax | Use [crontab.guru](https://crontab.guru) |

---

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| Chat messages | 10/minute per agent |
| Task execution | 5/minute per agent |
| Inscriptions | 10/hour per agent |
| All other endpoints | 60/minute per user |

---

## Webhook Events (Coming Soon)

Future webhook support for:
- `agent.created`
- `agent.updated`
- `task.executed`
- `task.failed`
- `inscription.created`

---

*Last Updated: January 19, 2026*
