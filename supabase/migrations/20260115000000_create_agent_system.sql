-- Agent System Database Migration
-- Created: 2026-01-15
-- Purpose: Implement agent-first architecture for autonomous AI agents
-- Reference: docs/AGENT_SYSTEM_SPEC.md Section 2.1

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA public;

-- ============================================================================
-- CORE AGENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Agent Identity
  name VARCHAR(100) NOT NULL,
  description TEXT,
  role VARCHAR(50) NOT NULL DEFAULT 'custom',
  avatar_url TEXT,

  -- AI Configuration
  ai_provider VARCHAR(50) DEFAULT 'claude',
  ai_model VARCHAR(100) DEFAULT 'claude-sonnet-4-5-20250929',
  temperature DECIMAL(3,2) DEFAULT 0.7,
  max_tokens INT DEFAULT 4096,
  system_prompt TEXT,

  -- Status
  is_active BOOLEAN DEFAULT true,
  is_deployed BOOLEAN DEFAULT false,
  deployment_url TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_active_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT valid_role CHECK (role IN ('developer', 'marketer', 'support', 'content', 'custom')),
  CONSTRAINT valid_provider CHECK (ai_provider IN ('claude', 'openai', 'grok')),
  CONSTRAINT valid_temperature CHECK (temperature >= 0 AND temperature <= 2),
  CONSTRAINT valid_max_tokens CHECK (max_tokens > 0 AND max_tokens <= 100000)
);

-- ============================================================================
-- AGENT TASKS (Cron Jobs & Scheduled Tasks)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.agent_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE NOT NULL,

  -- Task Definition
  task_name VARCHAR(200) NOT NULL,
  task_description TEXT,
  task_type VARCHAR(50) NOT NULL DEFAULT 'cron',

  -- Scheduling
  cron_expression VARCHAR(100),
  next_run_at TIMESTAMPTZ,
  last_run_at TIMESTAMPTZ,

  -- Configuration
  task_config JSONB DEFAULT '{}'::jsonb,
  priority INT DEFAULT 5,
  retry_count INT DEFAULT 3,
  timeout_seconds INT DEFAULT 300,

  -- Status & Metrics
  is_enabled BOOLEAN DEFAULT true,
  execution_count INT DEFAULT 0,
  success_count INT DEFAULT 0,
  failure_count INT DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  CONSTRAINT valid_task_type CHECK (task_type IN ('cron', 'webhook', 'manual')),
  CONSTRAINT valid_priority CHECK (priority >= 1 AND priority <= 10)
);

-- ============================================================================
-- CONVERSATIONS (User ↔ Agent Communication)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.agent_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Conversation Metadata
  title VARCHAR(200),
  status VARCHAR(50) DEFAULT 'active',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_message_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT valid_status CHECK (status IN ('active', 'archived', 'deleted'))
);

-- ============================================================================
-- CONVERSATION MESSAGES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.conversation_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.agent_conversations(id) ON DELETE CASCADE NOT NULL,

  -- Message Data
  role VARCHAR(20) NOT NULL,
  content TEXT NOT NULL,
  attachments JSONB DEFAULT '[]'::jsonb,

  -- Metadata
  tokens_used INT,
  model_used VARCHAR(100),
  cost_usd DECIMAL(10,6),

  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  CONSTRAINT valid_role CHECK (role IN ('user', 'assistant', 'system'))
);

-- ============================================================================
-- AGENT MEMORY (RAG System)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.agent_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE NOT NULL,

  -- Memory Content
  content TEXT NOT NULL,
  embedding VECTOR(1536), -- OpenAI/Claude embedding dimension
  memory_type VARCHAR(50),

  -- Source
  source_conversation_id UUID REFERENCES public.agent_conversations(id) ON DELETE SET NULL,
  source_url TEXT,

  -- Metadata
  importance_score DECIMAL(3,2) DEFAULT 0.5,
  access_count INT DEFAULT 0,
  last_accessed_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  CONSTRAINT valid_memory_type CHECK (memory_type IN ('fact', 'procedure', 'example', 'context')),
  CONSTRAINT valid_importance CHECK (importance_score >= 0 AND importance_score <= 1)
);

-- ============================================================================
-- AGENT PROJECTS (Many-to-Many: Agents ↔ Projects)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.agent_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,

  -- Permissions
  can_read BOOLEAN DEFAULT true,
  can_write BOOLEAN DEFAULT false,
  can_deploy BOOLEAN DEFAULT false,

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  UNIQUE(agent_id, project_id)
);

-- ============================================================================
-- AGENT PERFORMANCE METRICS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.agent_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE NOT NULL,

  -- Time Period
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,

  -- Metrics
  tasks_completed INT DEFAULT 0,
  tasks_failed INT DEFAULT 0,
  total_tokens_used INT DEFAULT 0,
  total_cost_usd DECIMAL(10,2) DEFAULT 0,
  avg_response_time_ms INT,

  -- Quality Metrics
  user_satisfaction_score DECIMAL(3,2),
  error_rate DECIMAL(5,2),

  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  CONSTRAINT valid_satisfaction CHECK (user_satisfaction_score IS NULL OR (user_satisfaction_score >= 0 AND user_satisfaction_score <= 5)),
  CONSTRAINT valid_error_rate CHECK (error_rate IS NULL OR (error_rate >= 0 AND error_rate <= 100))
);

-- ============================================================================
-- AGENT OUTPUTS (Work Products)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.agent_outputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE NOT NULL,
  task_id UUID REFERENCES public.agent_tasks(id) ON DELETE SET NULL,

  -- Output Data
  output_type VARCHAR(50),
  content TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Status
  status VARCHAR(50) DEFAULT 'draft',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  published_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT valid_output_status CHECK (status IN ('draft', 'pending_review', 'approved', 'published', 'rejected'))
);

-- ============================================================================
-- BSV BLOCKCHAIN INSCRIPTIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.agent_inscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE NOT NULL,
  conversation_id UUID REFERENCES public.agent_conversations(id) ON DELETE SET NULL,
  output_id UUID REFERENCES public.agent_outputs(id) ON DELETE SET NULL,

  -- Inscription Data
  inscription_id VARCHAR(100) UNIQUE,
  transaction_id VARCHAR(100),
  content_hash VARCHAR(100),
  inscription_url TEXT,

  -- Metadata
  inscription_type VARCHAR(50),

  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  CONSTRAINT valid_inscription_type CHECK (inscription_type IN ('conversation', 'output', 'contract', 'token', 'other'))
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Agents
CREATE INDEX IF NOT EXISTS idx_agents_user_id ON public.agents(user_id);
CREATE INDEX IF NOT EXISTS idx_agents_role ON public.agents(role);
CREATE INDEX IF NOT EXISTS idx_agents_is_active ON public.agents(is_active) WHERE is_active = true;

-- Agent Tasks
CREATE INDEX IF NOT EXISTS idx_agent_tasks_agent_id ON public.agent_tasks(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_next_run ON public.agent_tasks(next_run_at) WHERE is_enabled = true;
CREATE INDEX IF NOT EXISTS idx_agent_tasks_is_enabled ON public.agent_tasks(is_enabled);

-- Conversations
CREATE INDEX IF NOT EXISTS idx_agent_conversations_agent_id ON public.agent_conversations(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_conversations_user_id ON public.agent_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_conversations_status ON public.agent_conversations(status);

-- Messages
CREATE INDEX IF NOT EXISTS idx_conversation_messages_conversation_id ON public.conversation_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_created_at ON public.conversation_messages(created_at DESC);

-- Memory
CREATE INDEX IF NOT EXISTS idx_agent_memory_agent_id ON public.agent_memory(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_memory_type ON public.agent_memory(memory_type);
-- Vector similarity index (requires pgvector)
CREATE INDEX IF NOT EXISTS idx_agent_memory_embedding ON public.agent_memory USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Agent Projects
CREATE INDEX IF NOT EXISTS idx_agent_projects_agent_id ON public.agent_projects(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_projects_project_id ON public.agent_projects(project_id);
CREATE INDEX IF NOT EXISTS idx_agent_projects_active ON public.agent_projects(is_active) WHERE is_active = true;

-- Performance
CREATE INDEX IF NOT EXISTS idx_agent_performance_agent_id ON public.agent_performance(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_performance_period ON public.agent_performance(period_start, period_end);

-- Outputs
CREATE INDEX IF NOT EXISTS idx_agent_outputs_agent_id ON public.agent_outputs(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_outputs_task_id ON public.agent_outputs(task_id);
CREATE INDEX IF NOT EXISTS idx_agent_outputs_status ON public.agent_outputs(status);

-- Inscriptions
CREATE INDEX IF NOT EXISTS idx_agent_inscriptions_agent_id ON public.agent_inscriptions(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_inscriptions_conversation_id ON public.agent_inscriptions(conversation_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_inscriptions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES: AGENTS
-- ============================================================================

CREATE POLICY "Users can view their own agents"
  ON public.agents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own agents"
  ON public.agents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own agents"
  ON public.agents FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own agents"
  ON public.agents FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- RLS POLICIES: AGENT TASKS
-- ============================================================================

CREATE POLICY "Users can view tasks for their agents"
  ON public.agent_tasks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.agents
      WHERE agents.id = agent_tasks.agent_id
      AND agents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert tasks for their agents"
  ON public.agent_tasks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.agents
      WHERE agents.id = agent_tasks.agent_id
      AND agents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update tasks for their agents"
  ON public.agent_tasks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.agents
      WHERE agents.id = agent_tasks.agent_id
      AND agents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete tasks for their agents"
  ON public.agent_tasks FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.agents
      WHERE agents.id = agent_tasks.agent_id
      AND agents.user_id = auth.uid()
    )
  );

-- ============================================================================
-- RLS POLICIES: CONVERSATIONS
-- ============================================================================

CREATE POLICY "Users can view their own conversations"
  ON public.agent_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create conversations"
  ON public.agent_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations"
  ON public.agent_conversations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations"
  ON public.agent_conversations FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- RLS POLICIES: CONVERSATION MESSAGES
-- ============================================================================

CREATE POLICY "Users can view messages in their conversations"
  ON public.conversation_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.agent_conversations
      WHERE agent_conversations.id = conversation_messages.conversation_id
      AND agent_conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages in their conversations"
  ON public.conversation_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.agent_conversations
      WHERE agent_conversations.id = conversation_messages.conversation_id
      AND agent_conversations.user_id = auth.uid()
    )
  );

-- Messages are immutable (no UPDATE or DELETE policies)

-- ============================================================================
-- RLS POLICIES: AGENT MEMORY
-- ============================================================================

CREATE POLICY "Users can view memory for their agents"
  ON public.agent_memory FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.agents
      WHERE agents.id = agent_memory.agent_id
      AND agents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert memory for their agents"
  ON public.agent_memory FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.agents
      WHERE agents.id = agent_memory.agent_id
      AND agents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update memory for their agents"
  ON public.agent_memory FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.agents
      WHERE agents.id = agent_memory.agent_id
      AND agents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete memory for their agents"
  ON public.agent_memory FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.agents
      WHERE agents.id = agent_memory.agent_id
      AND agents.user_id = auth.uid()
    )
  );

-- ============================================================================
-- RLS POLICIES: AGENT PROJECTS (Many-to-Many)
-- ============================================================================

CREATE POLICY "Users can view project links for their agents"
  ON public.agent_projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.agents
      WHERE agents.id = agent_projects.agent_id
      AND agents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can link projects to their agents"
  ON public.agent_projects FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.agents
      WHERE agents.id = agent_projects.agent_id
      AND agents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update project links for their agents"
  ON public.agent_projects FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.agents
      WHERE agents.id = agent_projects.agent_id
      AND agents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can unlink projects from their agents"
  ON public.agent_projects FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.agents
      WHERE agents.id = agent_projects.agent_id
      AND agents.user_id = auth.uid()
    )
  );

-- ============================================================================
-- RLS POLICIES: AGENT PERFORMANCE
-- ============================================================================

CREATE POLICY "Users can view performance for their agents"
  ON public.agent_performance FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.agents
      WHERE agents.id = agent_performance.agent_id
      AND agents.user_id = auth.uid()
    )
  );

-- Performance metrics are system-generated (no INSERT/UPDATE/DELETE for users)

-- ============================================================================
-- RLS POLICIES: AGENT OUTPUTS
-- ============================================================================

CREATE POLICY "Users can view outputs from their agents"
  ON public.agent_outputs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.agents
      WHERE agents.id = agent_outputs.agent_id
      AND agents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert outputs for their agents"
  ON public.agent_outputs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.agents
      WHERE agents.id = agent_outputs.agent_id
      AND agents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update outputs from their agents"
  ON public.agent_outputs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.agents
      WHERE agents.id = agent_outputs.agent_id
      AND agents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete outputs from their agents"
  ON public.agent_outputs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.agents
      WHERE agents.id = agent_outputs.agent_id
      AND agents.user_id = auth.uid()
    )
  );

-- ============================================================================
-- RLS POLICIES: AGENT INSCRIPTIONS
-- ============================================================================

CREATE POLICY "Users can view inscriptions for their agents"
  ON public.agent_inscriptions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.agents
      WHERE agents.id = agent_inscriptions.agent_id
      AND agents.user_id = auth.uid()
    )
  );

-- Inscriptions are system-generated (no INSERT/UPDATE/DELETE for users)

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables with updated_at column
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.agents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.agent_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.agent_conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.agent_memory
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.agent_projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.agent_outputs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- DEFAULT DATA SEEDS (Optional)
-- ============================================================================

-- Uncomment to insert example agent roles and task templates
-- These can be helpful for UI dropdowns and default configurations

/*
-- Example: Default task templates
CREATE TABLE IF NOT EXISTS public.task_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name VARCHAR(200) NOT NULL,
  task_type VARCHAR(50) NOT NULL,
  default_cron VARCHAR(100),
  default_config JSONB DEFAULT '{}'::jsonb,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

INSERT INTO public.task_templates (template_name, task_type, default_cron, default_config, description)
VALUES
  ('Daily Twitter Post', 'cron', '0 9 * * *', '{"platform": "twitter", "content_type": "text"}', 'Post daily content to Twitter at 9am'),
  ('Weekly Blog Post', 'cron', '0 9 * * 1', '{"content_type": "blog", "word_count": 1000}', 'Generate weekly blog post every Monday'),
  ('Hourly Social Monitoring', 'cron', '0 * * * *', '{"platforms": ["twitter", "reddit"], "keywords": []}', 'Monitor social media mentions every hour');
*/

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Log migration completion
DO $$
BEGIN
  RAISE NOTICE 'Agent system migration completed successfully!';
  RAISE NOTICE 'Created 9 tables: agents, agent_tasks, agent_conversations, conversation_messages, agent_memory, agent_projects, agent_performance, agent_outputs, agent_inscriptions';
  RAISE NOTICE 'Created 25+ indexes for optimal query performance';
  RAISE NOTICE 'Enabled RLS on all tables with user-scoped policies';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Verify tables in Supabase Studio > Database';
  RAISE NOTICE '2. Install dependencies: npm install @anthropic-ai/sdk node-cron cron-parser';
  RAISE NOTICE '3. Configure ANTHROPIC_API_KEY in environment variables';
  RAISE NOTICE '4. Proceed to Phase 1: Build agent chat interface';
END $$;
