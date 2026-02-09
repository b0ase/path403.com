-- Fix agent_projects table with TEXT type for project_id (matching existing projects table)

-- Create agent_projects table with correct type
CREATE TABLE IF NOT EXISTS public.agent_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE NOT NULL,
  project_id TEXT REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,  -- Changed to TEXT to match projects table
  can_read BOOLEAN DEFAULT true,
  can_write BOOLEAN DEFAULT false,
  can_deploy BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(agent_id, project_id)
);

-- Create indexes for agent_projects
CREATE INDEX idx_agent_projects_agent_id ON public.agent_projects(agent_id);
CREATE INDEX idx_agent_projects_project_id ON public.agent_projects(project_id);
CREATE INDEX idx_agent_projects_active ON public.agent_projects(is_active) WHERE is_active = true;

-- Enable RLS
ALTER TABLE public.agent_projects ENABLE ROW LEVEL SECURITY;

-- RLS Policies for agent_projects
CREATE POLICY "Users can view projects for their agents"
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

CREATE POLICY "Users can remove project links from their agents"
  ON public.agent_projects FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.agents
      WHERE agents.id = agent_projects.agent_id
      AND agents.user_id = auth.uid()
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_agent_projects_updated_at
  BEFORE UPDATE ON public.agent_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON public.agent_projects TO postgres;
GRANT ALL ON public.agent_projects TO authenticated;
GRANT ALL ON public.agent_projects TO service_role;
