-- Pipeline System Database Migration
-- Created: 2026-01-15
-- Purpose: Core pipeline infrastructure for client project workflow
-- Reference: docs/PIPELINE_SYSTEM_SPEC.md

-- ============================================================================
-- PIPELINE STAGES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.pipeline_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id TEXT REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  
  -- Stage Definition
  stage_name VARCHAR(50) NOT NULL,
  stage_order INT NOT NULL,
  
  -- Status Tracking
  status VARCHAR(50) DEFAULT 'not_started',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Agent Assignment
  agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT valid_stage_name CHECK (stage_name IN (
    'discovery', 'specification', 'design', 'development', 'testing', 'deployment', 'post_launch'
  )),
  CONSTRAINT valid_status CHECK (status IN (
    'not_started', 'in_progress', 'blocked', 'completed', 'skipped'
  )),
  UNIQUE(project_id, stage_name)
);

-- ============================================================================
-- STAGE TASKS TABLE (Checklists)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.stage_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_id UUID REFERENCES public.pipeline_stages(id) ON DELETE CASCADE NOT NULL,
  
  -- Task Definition
  task_name VARCHAR(200) NOT NULL,
  task_description TEXT,
  task_order INT NOT NULL,
  
  -- Completion Tracking
  is_required BOOLEAN DEFAULT true,
  is_completed BOOLEAN DEFAULT false,
  completed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  completed_at TIMESTAMPTZ,
  
  -- Agent Suggestions
  agent_suggested BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- STAGE DELIVERABLES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.stage_deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_id UUID REFERENCES public.pipeline_stages(id) ON DELETE CASCADE NOT NULL,
  
  -- Deliverable Definition
  deliverable_name VARCHAR(200) NOT NULL,
  deliverable_type VARCHAR(50) DEFAULT 'document',
  description TEXT,
  
  -- File Storage
  file_url TEXT,
  file_size BIGINT,
  mime_type VARCHAR(100),
  
  -- Tracking
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  uploaded_at TIMESTAMPTZ,
  status VARCHAR(50) DEFAULT 'pending',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT valid_deliverable_type CHECK (deliverable_type IN (
    'document', 'design', 'code', 'contract', 'asset', 'other'
  )),
  CONSTRAINT valid_deliverable_status CHECK (status IN (
    'pending', 'uploaded', 'approved', 'rejected'
  ))
);

-- ============================================================================
-- STAGE PAYMENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.stage_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_id UUID REFERENCES public.pipeline_stages(id) ON DELETE CASCADE NOT NULL,
  
  -- Payment Details
  amount_gbp DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'GBP',
  
  -- Payment Status
  payment_status VARCHAR(50) DEFAULT 'pending',
  invoice_url TEXT,
  stripe_payment_id TEXT,
  stripe_invoice_id TEXT,
  
  -- Timestamps
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT valid_payment_status CHECK (payment_status IN (
    'pending', 'invoiced', 'paid', 'failed', 'refunded'
  ))
);

-- ============================================================================
-- STAGE CONVERSATIONS TABLE (Links to Agent Conversations)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.stage_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_id UUID REFERENCES public.pipeline_stages(id) ON DELETE CASCADE NOT NULL,
  conversation_id UUID REFERENCES public.agent_conversations(id) ON DELETE SET NULL,
  
  -- Conversation Metadata
  topic VARCHAR(200),
  message_count INT DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_message_at TIMESTAMPTZ
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_pipeline_stages_project_id ON public.pipeline_stages(project_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_stages_status ON public.pipeline_stages(status);
CREATE INDEX IF NOT EXISTS idx_pipeline_stages_agent_id ON public.pipeline_stages(agent_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_stages_order ON public.pipeline_stages(stage_order);

CREATE INDEX IF NOT EXISTS idx_stage_tasks_stage_id ON public.stage_tasks(stage_id);
CREATE INDEX IF NOT EXISTS idx_stage_tasks_completed ON public.stage_tasks(is_completed);
CREATE INDEX IF NOT EXISTS idx_stage_tasks_order ON public.stage_tasks(task_order);

CREATE INDEX IF NOT EXISTS idx_stage_deliverables_stage_id ON public.stage_deliverables(stage_id);
CREATE INDEX IF NOT EXISTS idx_stage_deliverables_status ON public.stage_deliverables(status);

CREATE INDEX IF NOT EXISTS idx_stage_payments_stage_id ON public.stage_payments(stage_id);
CREATE INDEX IF NOT EXISTS idx_stage_payments_status ON public.stage_payments(payment_status);

CREATE INDEX IF NOT EXISTS idx_stage_conversations_stage_id ON public.stage_conversations(stage_id);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stage_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stage_deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stage_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stage_conversations ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES: PIPELINE STAGES
-- ============================================================================

CREATE POLICY "Users can view their project pipeline stages"
  ON public.pipeline_stages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = pipeline_stages.project_id
      AND projects.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can create pipeline stages for their projects"
  ON public.pipeline_stages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = pipeline_stages.project_id
      AND projects.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update their project pipeline stages"
  ON public.pipeline_stages FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = pipeline_stages.project_id
      AND projects.created_by = auth.uid()
    )
  );

-- ============================================================================
-- RLS POLICIES: STAGE TASKS
-- ============================================================================

CREATE POLICY "Users can view tasks for their project stages"
  ON public.stage_tasks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.pipeline_stages ps
      JOIN public.projects p ON p.id = ps.project_id
      WHERE ps.id = stage_tasks.stage_id
      AND p.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can create tasks for their project stages"
  ON public.stage_tasks FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.pipeline_stages ps
      JOIN public.projects p ON p.id = ps.project_id
      WHERE ps.id = stage_tasks.stage_id
      AND p.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update tasks for their project stages"
  ON public.stage_tasks FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.pipeline_stages ps
      JOIN public.projects p ON p.id = ps.project_id
      WHERE ps.id = stage_tasks.stage_id
      AND p.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can delete tasks for their project stages"
  ON public.stage_tasks FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.pipeline_stages ps
      JOIN public.projects p ON p.id = ps.project_id
      WHERE ps.id = stage_tasks.stage_id
      AND p.created_by = auth.uid()
    )
  );

-- ============================================================================
-- RLS POLICIES: STAGE DELIVERABLES
-- ============================================================================

CREATE POLICY "Users can view deliverables for their project stages"
  ON public.stage_deliverables FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.pipeline_stages ps
      JOIN public.projects p ON p.id = ps.project_id
      WHERE ps.id = stage_deliverables.stage_id
      AND p.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can upload deliverables for their project stages"
  ON public.stage_deliverables FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.pipeline_stages ps
      JOIN public.projects p ON p.id = ps.project_id
      WHERE ps.id = stage_deliverables.stage_id
      AND p.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update deliverables for their project stages"
  ON public.stage_deliverables FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.pipeline_stages ps
      JOIN public.projects p ON p.id = ps.project_id
      WHERE ps.id = stage_deliverables.stage_id
      AND p.created_by = auth.uid()
    )
  );

-- ============================================================================
-- RLS POLICIES: STAGE PAYMENTS
-- ============================================================================

CREATE POLICY "Users can view payments for their project stages"
  ON public.stage_payments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.pipeline_stages ps
      JOIN public.projects p ON p.id = ps.project_id
      WHERE ps.id = stage_payments.stage_id
      AND p.created_by = auth.uid()
    )
  );

-- Payments are created by system, not users directly

-- ============================================================================
-- RLS POLICIES: STAGE CONVERSATIONS
-- ============================================================================

CREATE POLICY "Users can view conversations for their project stages"
  ON public.stage_conversations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.pipeline_stages ps
      JOIN public.projects p ON p.id = ps.project_id
      WHERE ps.id = stage_conversations.stage_id
      AND p.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can create conversations for their project stages"
  ON public.stage_conversations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.pipeline_stages ps
      JOIN public.projects p ON p.id = ps.project_id
      WHERE ps.id = stage_conversations.stage_id
      AND p.created_by = auth.uid()
    )
  );

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.pipeline_stages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.stage_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.stage_deliverables
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.stage_payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- DEFAULT STAGE TEMPLATES
-- ============================================================================

-- Function to initialize pipeline stages for a new project
CREATE OR REPLACE FUNCTION public.initialize_project_pipeline(p_project_id TEXT)
RETURNS void AS $$
BEGIN
  -- Insert all 7 stages with their order
  INSERT INTO public.pipeline_stages (project_id, stage_name, stage_order) VALUES
    (p_project_id, 'discovery', 1),
    (p_project_id, 'specification', 2),
    (p_project_id, 'design', 3),
    (p_project_id, 'development', 4),
    (p_project_id, 'testing', 5),
    (p_project_id, 'deployment', 6),
    (p_project_id, 'post_launch', 7)
  ON CONFLICT (project_id, stage_name) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- DEFAULT TASK TEMPLATES PER STAGE
-- ============================================================================

-- Function to add default tasks when a stage is started
CREATE OR REPLACE FUNCTION public.add_default_stage_tasks(p_stage_id UUID, p_stage_name VARCHAR(50))
RETURNS void AS $$
BEGIN
  CASE p_stage_name
    WHEN 'discovery' THEN
      INSERT INTO public.stage_tasks (stage_id, task_name, task_order, is_required) VALUES
        (p_stage_id, 'Complete project questionnaire', 1, true),
        (p_stage_id, 'Review market research', 2, true),
        (p_stage_id, 'Competitive analysis', 3, true),
        (p_stage_id, 'Technical feasibility assessment', 4, true),
        (p_stage_id, 'Budget and timeline estimation', 5, true),
        (p_stage_id, 'Risk identification', 6, true),
        (p_stage_id, 'Go/No-Go decision', 7, true);
    
    WHEN 'specification' THEN
      INSERT INTO public.stage_tasks (stage_id, task_name, task_order, is_required) VALUES
        (p_stage_id, 'User story mapping', 1, true),
        (p_stage_id, 'Feature prioritization (MoSCoW)', 2, true),
        (p_stage_id, 'Technical requirements documentation', 3, true),
        (p_stage_id, 'API & integration specifications', 4, true),
        (p_stage_id, 'Data model design', 5, true),
        (p_stage_id, 'Security requirements', 6, true),
        (p_stage_id, 'Final pricing agreement', 7, true);
    
    WHEN 'design' THEN
      INSERT INTO public.stage_tasks (stage_id, task_name, task_order, is_required) VALUES
        (p_stage_id, 'Wireframe creation', 1, true),
        (p_stage_id, 'High-fidelity mockups', 2, true),
        (p_stage_id, 'Brand style guide', 3, true),
        (p_stage_id, 'Component library design', 4, false),
        (p_stage_id, 'User flow diagrams', 5, true),
        (p_stage_id, 'Design review & approval', 6, true);
    
    WHEN 'development' THEN
      INSERT INTO public.stage_tasks (stage_id, task_name, task_order, is_required) VALUES
        (p_stage_id, 'Development environment setup', 1, true),
        (p_stage_id, 'Database schema implementation', 2, true),
        (p_stage_id, 'Backend API development', 3, true),
        (p_stage_id, 'Frontend implementation', 4, true),
        (p_stage_id, 'Feature development', 5, true),
        (p_stage_id, 'Integration testing', 6, true),
        (p_stage_id, 'Code review & QA', 7, true),
        (p_stage_id, 'Bug fixing', 8, true);
    
    WHEN 'testing' THEN
      INSERT INTO public.stage_tasks (stage_id, task_name, task_order, is_required) VALUES
        (p_stage_id, 'Test plan creation', 1, true),
        (p_stage_id, 'Unit testing', 2, true),
        (p_stage_id, 'Integration testing', 3, true),
        (p_stage_id, 'End-to-end testing', 4, true),
        (p_stage_id, 'Performance testing', 5, true),
        (p_stage_id, 'Security testing', 6, true),
        (p_stage_id, 'User acceptance testing (UAT)', 7, true);
    
    WHEN 'deployment' THEN
      INSERT INTO public.stage_tasks (stage_id, task_name, task_order, is_required) VALUES
        (p_stage_id, 'Production environment setup', 1, true),
        (p_stage_id, 'Database migration', 2, true),
        (p_stage_id, 'DNS & domain configuration', 3, true),
        (p_stage_id, 'SSL certificate setup', 4, true),
        (p_stage_id, 'Monitoring setup', 5, true),
        (p_stage_id, 'Launch checklist', 6, true),
        (p_stage_id, 'Go-live!', 7, true);
    
    WHEN 'post_launch' THEN
      INSERT INTO public.stage_tasks (stage_id, task_name, task_order, is_required) VALUES
        (p_stage_id, 'Monitor application health', 1, true),
        (p_stage_id, 'User feedback collection', 2, true),
        (p_stage_id, 'Bug fix releases', 3, false),
        (p_stage_id, 'Performance optimization', 4, false),
        (p_stage_id, 'Analytics review', 5, true),
        (p_stage_id, 'Growth recommendations', 6, false);
    
    ELSE
      -- Unknown stage, no default tasks
      NULL;
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'Pipeline System migration completed successfully!';
  RAISE NOTICE 'Created 5 tables: pipeline_stages, stage_tasks, stage_deliverables, stage_payments, stage_conversations';
  RAISE NOTICE 'Created indexes and RLS policies';
  RAISE NOTICE 'Created helper functions: initialize_project_pipeline, add_default_stage_tasks';
END $$;
