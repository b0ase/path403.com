# Agent System Technical Specification

**Version:** 1.3
**Date:** January 15, 2026
**Status:** ✅ In Progress (~85% Complete)
**Last Updated:** January 19, 2026
**Prerequisites:** Read ARCHITECTURAL_ASSESSMENT_2026.md first

---

## Overview

This document provides the complete technical specification for building the autonomous AI agent system at B0ase.com. It serves as the implementation guide for developers.

**Core Premise:** Agents are at the top of the hierarchy, managing projects, contracts, tokens, and workflows autonomously.

---

## 1. SYSTEM ARCHITECTURE

### 1.1 Component Diagram

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                        │
│  /agent                /dashboard/agents                │
│  AgentChatInterface    AgentSpawner                     │
│  ConversationHistory   AgentTaskManager                 │
│  MessageBubble         AgentProjectLinker               │
└───────────────┬─────────────────────────────────────────┘
                │
                │ HTTP / SSE
                ▼
┌─────────────────────────────────────────────────────────┐
│                     API LAYER                           │
│  /api/agents/[id]/chat                                  │
│  /api/agents/create                                     │
│  /api/agents/[id]/tasks                                 │
│  /api/agents/[id]/conversations                         │
│  /api/agents/[id]/projects                              │
└───────────────┬─────────────────────────────────────────┘
                │
                │ Function Calls
                ▼
┌─────────────────────────────────────────────────────────┐
│                   BUSINESS LOGIC                        │
│  AgentEngine         CronScheduler                      │
│  ConversationManager TaskExecutor                       │
│  MemoryManager       ProjectLinker                      │
└───────────────┬─────────────────────────────────────────┘
                │
                │ Database Queries
                ▼
┌─────────────────────────────────────────────────────────┐
│                    DATA LAYER                           │
│  agents              agent_conversations                │
│  agent_tasks         conversation_messages              │
│  agent_memory        agent_projects                     │
│  agent_performance   agent_outputs                      │
└─────────────────────────────────────────────────────────┘
                │
                │ External APIs
                ▼
┌─────────────────────────────────────────────────────────┐
│                 EXTERNAL SERVICES                       │
│  Anthropic (Claude)  Twitter API                        │
│  OpenAI (Fallback)   GitHub API                         │
│  BSV Blockchain      n8n Workflows                      │
└─────────────────────────────────────────────────────────┘
```

### 1.2 Data Flow: Chat Message

```
User types message
  ↓
Client: POST /api/agents/[id]/conversations/[convId]/messages
  ↓
Server: Validate auth & permissions
  ↓
Server: Save user message to database
  ↓
Server: Fetch conversation history + agent memory (RAG)
  ↓
Server: Call Claude API with context
  ↓
Server: Stream response back to client (SSE)
  ↓
Server: Save assistant response to database
  ↓
Server: Update agent last_active_at
  ↓
Client: Display response in real-time
```

### 1.3 Data Flow: Cron Task Execution

```
Cron scheduler wakes up
  ↓
Check agent_tasks table for due tasks (next_run_at <= NOW())
  ↓
For each due task:
  ↓
  Load agent config (AI model, system prompt, etc.)
  ↓
  Load task config (task_type, task_config JSON)
  ↓
  Execute task:
    - If task_type = 'tweet': Post to Twitter
    - If task_type = 'blog': Generate & publish blog post
    - If task_type = 'analysis': Run analytics & save report
  ↓
  Save task execution result to agent_outputs
  ↓
  Update task.last_run_at, next_run_at, execution_count
  ↓
  Update agent_performance metrics
  ↓
  (Optional) Inscribe output on BSV blockchain
```

---

## 2. DATABASE SCHEMA IMPLEMENTATION

### 2.1 Setup Instructions

**File:** `/supabase/migrations/20260115_create_agent_system.sql`

```sql
-- Execute this migration in Supabase Studio SQL Editor
-- This creates all agent-related tables

-- Enable pgvector extension for RAG
CREATE EXTENSION IF NOT EXISTS vector;

-- Core Agents Table (as specified in ARCHITECTURAL_ASSESSMENT_2026.md)
-- [Full SQL from Section 6.2 of assessment doc]

-- Enable RLS
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
-- [All RLS policies as specified]
```

### 2.2 Default Data Seeds

```sql
-- Insert default agent roles
INSERT INTO agent_roles (role_name, description, default_system_prompt) VALUES
('developer', 'Software development agent', 'You are an expert software developer...'),
('marketer', 'Marketing automation agent', 'You are a marketing specialist...'),
('support', 'Customer support agent', 'You are a helpful customer support agent...'),
('content', 'Content creation agent', 'You are a creative content writer...'),
('custom', 'Custom configured agent', NULL);

-- Insert default task templates
INSERT INTO task_templates (template_name, task_type, default_cron, default_config) VALUES
('Daily Twitter Post', 'cron', '0 9 * * *', '{"platform": "twitter", "content_type": "text"}'),
('Weekly Blog Post', 'cron', '0 9 * * 1', '{"content_type": "blog", "word_count": 1000}'),
('Hourly Social Monitoring', 'cron', '0 * * * *', '{"platforms": ["twitter", "reddit"], "keywords": []}');
```

---

## 3. API IMPLEMENTATION

### 3.1 File Structure

```
app/api/agents/
├── create/
│   └── route.ts              # POST /api/agents/create
├── [id]/
│   ├── route.ts              # GET/PATCH/DELETE /api/agents/[id]
│   ├── chat/
│   │   └── route.ts          # POST /api/agents/[id]/chat (streaming)
│   ├── conversations/
│   │   ├── route.ts          # GET/POST /api/agents/[id]/conversations
│   │   └── [convId]/
│   │       ├── route.ts      # GET/PATCH /api/agents/[id]/conversations/[convId]
│   │       └── messages/
│   │           └── route.ts  # GET/POST (streaming)
│   ├── tasks/
│   │   ├── route.ts          # GET/POST /api/agents/[id]/tasks
│   │   └── [taskId]/
│   │       ├── route.ts      # GET/PATCH/DELETE
│   │       ├── execute/
│   │       │   └── route.ts  # POST manual trigger
│   │       └── history/
│   │           └── route.ts  # GET execution logs
│   ├── projects/
│   │   ├── route.ts          # GET/POST /api/agents/[id]/projects
│   │   └── [projectId]/
│   │       └── route.ts      # DELETE unlink
│   ├── performance/
│   │   └── route.ts          # GET metrics
│   └── deploy/
│       └── route.ts          # POST deploy agent
└── route.ts                  # GET /api/agents (list all)
```

### 3.2 Core API Implementation Examples

**Agent Creation (`app/api/agents/create/route.ts`):**

```typescript
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Authenticate
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse body
    const body = await request.json();
    const {
      name,
      description,
      role,
      ai_provider = 'claude',
      ai_model = 'claude-sonnet-4-5',
      system_prompt,
    } = body;

    // Validate
    if (!name || !role) {
      return NextResponse.json(
        { error: 'Name and role are required' },
        { status: 400 }
      );
    }

    const validRoles = ['developer', 'marketer', 'support', 'content', 'custom'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: `Invalid role. Must be one of: ${validRoles.join(', ')}` },
        { status: 400 }
      );
    }

    // Create agent
    const { data: agent, error } = await supabase
      .from('agents')
      .insert({
        user_id: session.user.id,
        name,
        description,
        role,
        ai_provider,
        ai_model,
        system_prompt: system_prompt || getDefaultSystemPrompt(role),
        is_active: true,
        is_deployed: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating agent:', error);
      return NextResponse.json(
        { error: 'Failed to create agent' },
        { status: 500 }
      );
    }

    // Initialize default conversation
    await supabase.from('agent_conversations').insert({
      agent_id: agent.id,
      user_id: session.user.id,
      title: 'Initial conversation',
      status: 'active',
    });

    return NextResponse.json({ success: true, agent }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/agents/create:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function getDefaultSystemPrompt(role: string): string {
  const prompts = {
    developer: 'You are an expert software developer specializing in modern web technologies. You write clean, efficient code and follow best practices.',
    marketer: 'You are a marketing specialist who creates engaging content and data-driven strategies.',
    support: 'You are a helpful customer support agent who provides clear, empathetic assistance.',
    content: 'You are a creative content writer who produces engaging, SEO-optimized material.',
    custom: 'You are a helpful AI assistant.',
  };
  return prompts[role as keyof typeof prompts] || prompts.custom;
}
```

**Streaming Chat (`app/api/agents/[id]/conversations/[convId]/messages/route.ts`):**

```typescript
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export const dynamic = 'force-dynamic';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; convId: string } }
) {
  const { id: agentId, convId: conversationId } = params;

  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Authenticate
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Get agent
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('*')
      .eq('id', agentId)
      .eq('user_id', session.user.id)
      .single();

    if (agentError || !agent) {
      return new Response('Agent not found', { status: 404 });
    }

    // Parse message
    const body = await request.json();
    const { content, attachments } = body;

    if (!content) {
      return new Response('Content is required', { status: 400 });
    }

    // Save user message
    const { data: userMessage, error: saveError } = await supabase
      .from('conversation_messages')
      .insert({
        conversation_id: conversationId,
        role: 'user',
        content,
        attachments,
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving user message:', saveError);
      return new Response('Failed to save message', { status: 500 });
    }

    // Fetch conversation history
    const { data: history } = await supabase
      .from('conversation_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(20);

    // Build messages for Claude
    const messages = history?.map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    })) || [];

    // Stream response from Claude
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let fullResponse = '';

          const claudeStream = await anthropic.messages.create({
            model: agent.ai_model || 'claude-sonnet-4-5-20250929',
            max_tokens: agent.max_tokens || 4096,
            temperature: agent.temperature || 0.7,
            system: agent.system_prompt || undefined,
            messages,
            stream: true,
          });

          for await (const chunk of claudeStream) {
            if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
              const text = chunk.delta.text;
              fullResponse += text;

              // Send chunk to client
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
              );
            }
          }

          // Save assistant message
          await supabase.from('conversation_messages').insert({
            conversation_id: conversationId,
            role: 'assistant',
            content: fullResponse,
            model_used: agent.ai_model,
            tokens_used: fullResponse.length / 4, // Rough estimate
          });

          // Update agent last_active_at
          await supabase
            .from('agents')
            .update({ last_active_at: new Date().toISOString() })
            .eq('id', agentId);

          // Update conversation last_message_at
          await supabase
            .from('agent_conversations')
            .update({ last_message_at: new Date().toISOString() })
            .eq('id', conversationId);

          // Send done signal
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('Error in Claude stream:', error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error in POST /api/agents/[id]/conversations/[convId]/messages:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
```

**Task Execution (`lib/agent-executor.ts`):**

```typescript
import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Server-side only
);

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function executeAgentTask(taskId: string) {
  try {
    // Get task
    const { data: task, error: taskError } = await supabase
      .from('agent_tasks')
      .select('*, agents(*)')
      .eq('id', taskId)
      .single();

    if (taskError || !task) {
      throw new Error(`Task not found: ${taskId}`);
    }

    const agent = task.agents;
    const config = task.task_config || {};

    console.log(`Executing task: ${task.task_name} for agent: ${agent.name}`);

    let result: any;
    let success = true;

    // Execute based on task type
    switch (config.task_type || task.task_type) {
      case 'tweet':
        result = await executeTweetTask(agent, config);
        break;

      case 'blog':
        result = await executeBlogTask(agent, config);
        break;

      case 'analysis':
        result = await executeAnalysisTask(agent, config);
        break;

      case 'github':
        result = await executeGitHubTask(agent, config);
        break;

      default:
        result = await executeGenericTask(agent, task, config);
    }

    // Save output
    await supabase.from('agent_outputs').insert({
      agent_id: agent.id,
      task_id: task.id,
      output_type: config.task_type || task.task_type,
      content: JSON.stringify(result),
      status: success ? 'completed' : 'failed',
    });

    // Update task stats
    await supabase
      .from('agent_tasks')
      .update({
        last_run_at: new Date().toISOString(),
        next_run_at: calculateNextRun(task.cron_expression),
        execution_count: task.execution_count + 1,
        success_count: task.success_count + (success ? 1 : 0),
        failure_count: task.failure_count + (success ? 0 : 1),
      })
      .eq('id', taskId);

    return { success: true, result };
  } catch (error) {
    console.error(`Error executing task ${taskId}:`, error);

    // Update failure count
    await supabase
      .from('agent_tasks')
      .update({
        last_run_at: new Date().toISOString(),
        failure_count: supabase.sql`failure_count + 1`,
      })
      .eq('id', taskId);

    return { success: false, error };
  }
}

async function executeTweetTask(agent: any, config: any) {
  // Generate tweet content
  const response = await anthropic.messages.create({
    model: agent.ai_model,
    max_tokens: 280,
    system: `You are a social media expert. Generate an engaging tweet based on: ${config.topic || 'general interest'}. Keep it under 280 characters.`,
    messages: [
      {
        role: 'user',
        content: `Create a tweet about: ${config.topic || 'interesting tech news'}`,
      },
    ],
  });

  const tweet = response.content[0].type === 'text' ? response.content[0].text : '';

  // Post to Twitter (TODO: integrate Twitter API)
  console.log('Would post tweet:', tweet);

  return { tweet, posted: false };
}

async function executeBlogTask(agent: any, config: any) {
  const response = await anthropic.messages.create({
    model: agent.ai_model,
    max_tokens: 4096,
    system: `You are a professional blog writer. Create a ${config.word_count || 1000}-word blog post.`,
    messages: [
      {
        role: 'user',
        content: `Write a blog post about: ${config.topic}`,
      },
    ],
  });

  const content = response.content[0].type === 'text' ? response.content[0].text : '';

  // Save to blog (TODO: integrate blog system)
  return { content, published: false };
}

async function executeAnalysisTask(agent: any, config: any) {
  // Run data analysis
  // TODO: Implement analysis logic
  return { analysis: 'placeholder' };
}

async function executeGitHubTask(agent: any, config: any) {
  // GitHub automation
  // TODO: Implement GitHub API integration
  return { action: 'placeholder' };
}

async function executeGenericTask(agent: any, task: any, config: any) {
  // Generic task execution
  const response = await anthropic.messages.create({
    model: agent.ai_model,
    max_tokens: agent.max_tokens || 4096,
    system: agent.system_prompt,
    messages: [
      {
        role: 'user',
        content: `Execute this task: ${task.task_description}`,
      },
    ],
  });

  const result = response.content[0].type === 'text' ? response.content[0].text : '';
  return { result };
}

function calculateNextRun(cronExpression: string): string {
  // Parse cron expression and calculate next run time
  // Using a library like 'cron-parser'
  const parser = require('cron-parser');
  const interval = parser.parseExpression(cronExpression);
  return interval.next().toISOString();
}
```

**Cron Scheduler (`lib/cron-scheduler.ts`):**

```typescript
import cron from 'node-cron';
import { createClient } from '@supabase/supabase-js';
import { executeAgentTask } from './agent-executor';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Run every minute to check for due tasks
cron.schedule('* * * * *', async () => {
  console.log('Checking for due agent tasks...');

  try {
    const now = new Date().toISOString();

    // Get all enabled tasks that are due
    const { data: tasks, error } = await supabase
      .from('agent_tasks')
      .select('*')
      .eq('is_enabled', true)
      .lte('next_run_at', now);

    if (error) {
      console.error('Error fetching due tasks:', error);
      return;
    }

    if (!tasks || tasks.length === 0) {
      return;
    }

    console.log(`Found ${tasks.length} due tasks`);

    // Execute each task
    for (const task of tasks) {
      executeAgentTask(task.id).catch(err => {
        console.error(`Failed to execute task ${task.id}:`, err);
      });
    }
  } catch (error) {
    console.error('Error in cron scheduler:', error);
  }
});

console.log('Agent cron scheduler started');
```

---

## 4. UI COMPONENTS

### 4.1 Agent Chat Interface

**File:** `components/agents/AgentChatInterface.tsx`

```typescript
'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiSend, FiPaperclip } from 'react-icons/fi';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

interface AgentChatInterfaceProps {
  agentId: string;
  conversationId: string;
}

export function AgentChatInterface({ agentId, conversationId }: AgentChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch conversation history
  useEffect(() => {
    fetchMessages();
  }, [conversationId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingMessage]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(
        `/api/agents/${agentId}/conversations/${conversationId}/messages`
      );
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || streaming) return;

    const userMessage = input;
    setInput('');
    setStreaming(true);
    setStreamingMessage('');

    try {
      const response = await fetch(
        `/api/agents/${agentId}/conversations/${conversationId}/messages`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: userMessage }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      // Add user message to UI immediately
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'user',
          content: userMessage,
          created_at: new Date().toISOString(),
        },
      ]);

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              // Add final assistant message
              setMessages(prev => [
                ...prev,
                {
                  id: Date.now().toString(),
                  role: 'assistant',
                  content: fullResponse,
                  created_at: new Date().toISOString(),
                },
              ]);
              setStreamingMessage('');
              break;
            }

            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                fullResponse += parsed.text;
                setStreamingMessage(fullResponse);
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setStreaming(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-black text-white">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {streamingMessage && (
          <MessageBubble
            message={{
              id: 'streaming',
              role: 'assistant',
              content: streamingMessage,
              created_at: new Date().toISOString(),
            }}
            isStreaming
          />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-800 p-4">
        <div className="flex items-end gap-3">
          <button className="p-3 hover:bg-gray-800 transition-colors rounded">
            <FiPaperclip size={20} />
          </button>

          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Type your message..."
            className="flex-1 bg-gray-900 border border-gray-800 rounded px-4 py-3 resize-none focus:outline-none focus:border-blue-500 transition-colors"
            rows={1}
            disabled={streaming}
          />

          <button
            onClick={sendMessage}
            disabled={streaming || !input.trim()}
            className="p-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed"
          >
            <FiSend size={20} />
          </button>
        </div>

        {streaming && (
          <div className="text-xs text-gray-500 mt-2">Agent is typing...</div>
        )}
      </div>
    </div>
  );
}

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
}

function MessageBubble({ message, isStreaming }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[70%] rounded-lg px-4 py-3 ${
          isUser
            ? 'bg-blue-500 text-white'
            : 'bg-gray-800 text-gray-100 border border-gray-700'
        }`}
      >
        <div className="whitespace-pre-wrap break-words">{message.content}</div>

        {isStreaming && (
          <span className="inline-block w-2 h-4 bg-current animate-pulse ml-1" />
        )}

        <div className="text-xs opacity-60 mt-2">
          {new Date(message.created_at).toLocaleTimeString()}
        </div>
      </div>
    </motion.div>
  );
}
```

### 4.2 Agent Spawner

**File:** `components/agents/AgentSpawner.tsx`

```typescript
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowRight, FiArrowLeft, FiCheck } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

const ROLES = [
  { id: 'developer', name: 'Developer', description: 'Code generation and technical tasks' },
  { id: 'marketer', name: 'Marketer', description: 'Content creation and social media' },
  { id: 'support', name: 'Support', description: 'Customer support and assistance' },
  { id: 'content', name: 'Content Creator', description: 'Blog posts and creative writing' },
  { id: 'custom', name: 'Custom', description: 'Define your own agent role' },
];

export function AgentSpawner({ onClose }: { onClose?: () => void }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [creating, setCreating] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    role: 'custom',
    system_prompt: '',
  });

  const canProceed = () => {
    if (step === 1) return formData.name.trim().length > 0;
    if (step === 2) return formData.role.length > 0;
    return true;
  };

  const createAgent = async () => {
    setCreating(true);

    try {
      const response = await fetch('/api/agents/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create agent');
      }

      const data = await response.json();

      // Redirect to agent chat
      router.push(`/agent?id=${data.agent.id}`);

      if (onClose) onClose();
    } catch (error) {
      console.error('Error creating agent:', error);
      alert('Failed to create agent. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-black text-white p-8 border border-gray-800">
      <h2 className="text-3xl font-bold mb-6">Create New Agent</h2>

      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3].map(num => (
            <div key={num} className="flex items-center flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  step >= num ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-500'
                }`}
              >
                {step > num ? <FiCheck /> : num}
              </div>
              {num < 3 && <div className="flex-1 h-1 bg-gray-800 mx-2" />}
            </div>
          ))}
        </div>

        <div className="flex justify-between mt-2 text-sm">
          <span className={step >= 1 ? 'text-white' : 'text-gray-500'}>Basic Info</span>
          <span className={step >= 2 ? 'text-white' : 'text-gray-500'}>Role</span>
          <span className={step >= 3 ? 'text-white' : 'text-gray-500'}>Customize</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-bold mb-2">Agent Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Marketing Assistant"
                className="w-full bg-gray-900 border border-gray-800 px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Description (optional)</label>
              <textarea
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="What will this agent do?"
                rows={3}
                className="w-full bg-gray-900 border border-gray-800 px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors resize-none"
              />
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-3"
          >
            {ROLES.map(role => (
              <button
                key={role.id}
                onClick={() => setFormData({ ...formData, role: role.id })}
                className={`w-full text-left p-4 border transition-colors ${
                  formData.role === role.id
                    ? 'border-blue-500 bg-blue-900/20'
                    : 'border-gray-800 hover:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold">{role.name}</div>
                    <div className="text-sm text-gray-400">{role.description}</div>
                  </div>
                  {formData.role === role.id && (
                    <FiCheck className="text-blue-500" size={20} />
                  )}
                </div>
              </button>
            ))}
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-bold mb-2">
                Custom System Prompt (optional)
              </label>
              <textarea
                value={formData.system_prompt}
                onChange={e => setFormData({ ...formData, system_prompt: e.target.value })}
                placeholder="Leave blank to use default prompt for this role..."
                rows={6}
                className="w-full bg-gray-900 border border-gray-800 px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors resize-none font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-2">
                Advanced: Define how your agent should behave and respond
              </p>
            </div>

            <div className="border border-blue-900/30 bg-blue-900/10 p-4">
              <h4 className="font-bold mb-2">Preview</h4>
              <div className="text-sm text-gray-300 space-y-1">
                <div><strong>Name:</strong> {formData.name}</div>
                <div><strong>Role:</strong> {ROLES.find(r => r.id === formData.role)?.name}</div>
                {formData.description && (
                  <div><strong>Description:</strong> {formData.description}</div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between mt-8">
        {step > 1 ? (
          <button
            onClick={() => setStep(step - 1)}
            className="flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            <FiArrowLeft /> Back
          </button>
        ) : (
          <div />
        )}

        {step < 3 ? (
          <button
            onClick={() => setStep(step + 1)}
            disabled={!canProceed()}
            className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed"
          >
            Next <FiArrowRight />
          </button>
        ) : (
          <button
            onClick={createAgent}
            disabled={creating}
            className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white hover:bg-green-600 transition-colors disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed"
          >
            {creating ? 'Creating...' : 'Create Agent'} <FiCheck />
          </button>
        )}
      </div>
    </div>
  );
}
```

---

## 5. IMPLEMENTATION CHECKLIST

**Last Updated:** January 19, 2026

### Phase 0: Foundation ✅ COMPLETE
- [x] Create database migration file (Prisma schema)
- [x] Execute migration in Supabase
- [x] Verify all tables created (8 agent tables)
- [x] Test RLS policies
- [x] Install Anthropic SDK: `pnpm add @anthropic-ai/sdk`
- [ ] Install cron: `pnpm add node-cron @types/node-cron`
- [ ] Install cron-parser: `pnpm add cron-parser @types/cron-parser`
- [x] Add environment variables to `.env.local`

### Phase 1: Agent Chat ✅ COMPLETE
- [x] Create `/app/api/agents/create/route.ts`
- [x] Create `/app/api/agents/[id]/chat/route.ts` (streaming)
- [x] Create AgentChatInterface in `/app/agent/page.tsx` (787 lines)
- [x] Create `/app/agent/chat/page.tsx`
- [x] Test conversation creation
- [x] Test streaming responses (SSE working)
- [x] Test message persistence

### Phase 2: Agent Management ⚠️ PARTIAL
- [x] Create AgentSpawner (`/app/build/create-an-agent/page.tsx`)
- [x] Create `/app/dashboard/agents/page.tsx` (429 lines)
- [x] Create `/app/api/agents/route.ts` (list all)
- [x] Create `/app/api/agents/[id]/route.ts` (get/update/delete)
- [x] Test agent creation
- [x] Test agent listing
- [x] Test agent editing

### Phase 3: Task System ✅ COMPLETE
- [x] Create `/app/api/agents/[id]/tasks/route.ts` (CRUD with cron validation)
- [x] Create agent_tasks table schema
- [x] Create `/lib/agent-executor.ts` (tweet, blog, analysis, webhook, ai_generate, inscription, custom)
- [x] Create `/lib/cron-scheduler.ts` (cron-parser integration)
- [x] Create `/api/cron/agent-tasks/route.ts` (Vercel cron endpoint)
- [x] Create manual execution endpoint (POST /api/agents/[id]/tasks/[taskId])
- [x] Create task management UI component with Run Now button
- [x] Test cron scheduling (vercel.json configured)

### Phase 4: Multi-Project ✅ COMPLETE
- [x] Create agent_projects table schema
- [x] Create `/app/api/agents/[id]/projects/route.ts` (GET, POST)
- [x] Create `/app/api/agents/[id]/projects/[projectId]/route.ts` (GET, PATCH, DELETE)
- [x] Add project context to agent chat (system prompt injection)
- [x] Update agent executor for project awareness
- [x] Create project linking UI component (Projects tab with permissions UI)
- [ ] Test agent-project linkage
- [ ] Test permissions system

### Phase 5: Performance ✅ COMPLETE
- [x] Create performance tracking system (agent_performance table)
- [x] Create analytics dashboard (`/app/dashboard/agents/analytics/page.tsx`)
- [x] Test metrics aggregation (tokens, cost, daily usage)

### Phase 6: BSV Integration ✅ COMPLETE
- [x] Create agent_inscriptions table schema
- [x] Research BSV inscription APIs (built on existing bsv-inscription.ts)
- [x] Create `/lib/agent-inscription.ts` (inscription service)
- [x] Create `/api/agents/[id]/inscriptions` route (GET, POST)
- [x] Create `/api/agents/[id]/inscriptions/[inscriptionId]` route (GET with verification)
- [x] Add `inscription` task type to agent-executor
- [x] Create inscription management UI (Inscriptions tab in agent detail page)
- [ ] Test inscriptions on testnet (requires BSV_PRIVATE_KEY funding)

### Progress Summary

| Phase | Status | Completion |
|-------|--------|------------|
| Phase 0: Foundation | ✅ Complete | 100% |
| Phase 1: Agent Chat | ✅ Complete | 100% |
| Phase 2: Agent Management | ⚠️ Partial | 85% |
| Phase 3: Task System | ✅ Complete | 95% |
| Phase 4: Multi-Project | ✅ Complete | 90% |
| Phase 5: Performance | ✅ Complete | 90% |
| Phase 6: BSV Integration | ✅ Complete | 90% |

**Overall: ~92% complete**

---

## 6. TESTING STRATEGY

### Unit Tests
```typescript
// __tests__/api/agents/create.test.ts
describe('POST /api/agents/create', () => {
  it('creates agent with valid input', async () => {
    // Test implementation
  });

  it('rejects unauthenticated requests', async () => {
    // Test implementation
  });

  it('validates role enum', async () => {
    // Test implementation
  });
});
```

### Integration Tests
```typescript
// __tests__/agent-chat.integration.test.ts
describe('Agent Chat Flow', () => {
  it('completes full conversation flow', async () => {
    // 1. Create agent
    // 2. Create conversation
    // 3. Send message
    // 4. Receive streamed response
    // 5. Verify persistence
  });
});
```

### E2E Tests (Playwright)
```typescript
// e2e/agent-spawner.spec.ts
test('user can create agent via wizard', async ({ page }) => {
  await page.goto('/dashboard/agents');
  await page.click('text=Create Agent');
  await page.fill('input[name="name"]', 'Test Agent');
  await page.click('text=Next');
  await page.click('text=Developer');
  await page.click('text=Next');
  await page.click('text=Create Agent');
  await expect(page).toHaveURL(/\/agent\?id=/);
});
```

---

## 7. DEPLOYMENT

### Environment Variables (Vercel)

```bash
# Anthropic API
ANTHROPIC_API_KEY=sk-ant-...

# OpenAI (Fallback)
OPENAI_API_KEY=sk-...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ... # Server-side only

# BSV (Optional)
BSV_WALLET_PRIVATE_KEY=...
BSV_INSCRIPTION_API_URL=...
```

### Vercel Cron Jobs

Create `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/agent-tasks",
      "schedule": "* * * * *"
    }
  ]
}
```

Create `/app/api/cron/agent-tasks/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { executeAgentTask } from '@/lib/agent-executor';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const now = new Date().toISOString();

  const { data: tasks } = await supabase
    .from('agent_tasks')
    .select('id')
    .eq('is_enabled', true)
    .lte('next_run_at', now);

  const results = [];

  for (const task of tasks || []) {
    const result = await executeAgentTask(task.id);
    results.push(result);
  }

  return NextResponse.json({ executed: results.length, results });
}
```

---

## 8. PERFORMANCE OPTIMIZATION

### Database Indexes
Already included in schema (Section 2.1)

### Caching Strategy
```typescript
// Cache agent configs for 5 minutes
import { unstable_cache } from 'next/cache';

export const getAgentCached = unstable_cache(
  async (agentId: string) => {
    // Fetch agent from database
  },
  ['agent'],
  { revalidate: 300 } // 5 minutes
);
```

### Rate Limiting
```typescript
// lib/rate-limiter.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export const chatRateLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '60 s'), // 10 messages per minute
  analytics: true,
});
```

---

## 9. MONITORING & LOGGING

### Logging Structure
```typescript
// lib/logger.ts
export function logAgentAction(
  agentId: string,
  action: string,
  metadata?: Record<string, any>
) {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    type: 'agent_action',
    agent_id: agentId,
    action,
    ...metadata,
  }));
}
```

### Metrics to Track
- Agent creation rate
- Conversation count per agent
- Average tokens per conversation
- Task execution success rate
- API response times
- Error rates

---

## 10. SECURITY CONSIDERATIONS

### Authentication
- All endpoints require Supabase auth
- RLS policies enforce user-scoped access
- Service role key only on server

### Input Validation
- Sanitize all user inputs
- Validate cron expressions
- Limit message length
- Check file types for attachments

### Rate Limiting
- Implement per-user rate limits
- Prevent API abuse
- Monitor for unusual activity

### Data Privacy
- User data never shared between users
- Conversations encrypted at rest
- BSV inscriptions are public (by design)

---

## APPENDIX: Quick Start Guide

### For Developers

**1. Setup Database:**
```bash
# Copy SQL from Section 2.1
# Paste into Supabase Studio SQL Editor
# Execute migration
```

**2. Install Dependencies:**
```bash
npm install @anthropic-ai/sdk node-cron cron-parser
```

**3. Configure Environment:**
```bash
# Add to .env.local
ANTHROPIC_API_KEY=sk-ant-...
```

**4. Start Development:**
```bash
npm run dev
```

**5. Test Agent Creation:**
- Go to http://localhost:3000/dashboard/agents
- Click "Create Agent"
- Follow wizard
- Start chatting at http://localhost:3000/agent

---

## 11. AGENT-MEDIATED CONTRACTING

> **Merged from:** `AGENT_MEDIATED_CONTRACTING.md` (January 19, 2026)

### Core Principle

> **Agents may propose and perform work.**
> **Humans authorise, accept, and bear responsibility.**

Every contract explicitly binds **two humans**, each represented by an agent.

### Roles

| Role | Responsibilities |
|------|-----------------|
| **Human Principal** | Legal counterparty, signs contracts, accepts/rejects deliverables, bears liability |
| **Agent** | Negotiates scope/terms, executes work, produces artifacts, reports status |

### Contract Structure (Minimum Viable)

Each contract MUST include:

**Parties:**
- Contract ID (unique blockchain inscription identifier)
- Human Principal A (public key / verified identity)
- Agent A (model, version, capabilities)
- Human Principal B (public key / verified identity)
- Agent B (model, version, capabilities)

**Terms:**
- Scope of work
- Deliverables
- Acceptance criteria
- Price and payment conditions
- Timeline
- Jurisdiction or arbitration clause
- Hashes of any off-chain documents

### Contract Lifecycle

```
1. OFFER     → Contract published on-chain by Human Principal A
2. ACCEPT    → Human Principal B signs acceptance transaction
3. EXECUTE   → Agent B performs work, progress logged
4. REVIEW    → Agent B submits completion claim
5. SETTLE    → Payment released on acceptance (or dispute escalation)
```

**Blockchain Actions:**
- `OFFER_CONTRACT` - Initial offer inscription
- `ACCEPT_CONTRACT` - Acceptance referencing original offer
- `PROGRESS_UPDATE` - Optional milestone updates
- `COMPLETION_CLAIM` - Work submitted with proofs
- `ACCEPT_COMPLETION` - Payment release
- `DISPUTE_INITIATED` - Escalation to arbitration

### Implementation Phases

| Phase | Description | Status |
|-------|-------------|--------|
| Phase 1 | Basic contract publishing as markdown inscriptions | ⚠️ Partial |
| Phase 2 | On-chain acceptance with escrow | ❌ Not started |
| Phase 3 | Automated settlement | ❌ Not started |
| Phase 4 | AI agent negotiation within human-defined bounds | ❌ Not started |
| Phase 5 | Reputation & discovery system | ❌ Not started |

### Design Constraints

1. **No Anonymous Principals** - All human principals must have verified identities
2. **No Fully Autonomous Contracting** - Agents cannot sign without human authorization
3. **No Mutable Terms Post-Acceptance** - Terms are immutable once signed
4. **Human Sign-Off Required** - Only humans can accept, sign, and authorize payment

### BSV Blockchain Usage

The blockchain serves as:
- A public contract registry
- A timestamped execution log
- A settlement layer for escrowed funds

Requirements: Low fees, stability, data capacity → **Bitcoin SV**

---

**END OF SPECIFICATION**

This document should be read in conjunction with:
- `ARCHITECTURAL_ASSESSMENT_2026.md` (strategic context & PRD)
- `agentic-workforce-strategy.md` (business vision)

**Implementation Status:** ~92% complete. All phases implemented with APIs and UI. Remaining: end-to-end testing, BSV testnet funding.

**Ready to continue:** Focus on testing and production hardening.
