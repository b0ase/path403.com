-- Create n8n_webhooks table
CREATE TABLE IF NOT EXISTS n8n_webhooks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id TEXT NOT NULL,
  node_id TEXT NOT NULL,
  webhook_type TEXT NOT NULL DEFAULT 'trigger',
  payload JSONB NOT NULL DEFAULT '{}',
  received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_n8n_webhooks_workflow_id ON n8n_webhooks(workflow_id);
CREATE INDEX IF NOT EXISTS idx_n8n_webhooks_webhook_type ON n8n_webhooks(webhook_type);
CREATE INDEX IF NOT EXISTS idx_n8n_webhooks_received_at ON n8n_webhooks(received_at DESC);
CREATE INDEX IF NOT EXISTS idx_n8n_webhooks_processed ON n8n_webhooks(processed);

-- Create n8n_workflows table for storing workflow metadata
CREATE TABLE IF NOT EXISTS n8n_workflows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  tags TEXT[],
  is_active BOOLEAN DEFAULT FALSE,
  last_execution_at TIMESTAMP WITH TIME ZONE,
  execution_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for n8n_workflows
CREATE INDEX IF NOT EXISTS idx_n8n_workflows_workflow_id ON n8n_workflows(workflow_id);
CREATE INDEX IF NOT EXISTS idx_n8n_workflows_is_active ON n8n_workflows(is_active);
CREATE INDEX IF NOT EXISTS idx_n8n_workflows_last_execution ON n8n_workflows(last_execution_at DESC);

-- Create n8n_executions table for storing execution history
CREATE TABLE IF NOT EXISTS n8n_executions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  execution_id TEXT UNIQUE NOT NULL,
  workflow_id TEXT NOT NULL,
  status TEXT NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  finished_at TIMESTAMP WITH TIME ZONE,
  duration_ms INTEGER,
  input_data JSONB,
  output_data JSONB,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for n8n_executions
CREATE INDEX IF NOT EXISTS idx_n8n_executions_execution_id ON n8n_executions(execution_id);
CREATE INDEX IF NOT EXISTS idx_n8n_executions_workflow_id ON n8n_executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_n8n_executions_status ON n8n_executions(status);
CREATE INDEX IF NOT EXISTS idx_n8n_executions_started_at ON n8n_executions(started_at DESC);

-- Add RLS policies
ALTER TABLE n8n_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE n8n_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE n8n_executions ENABLE ROW LEVEL SECURITY;

-- Admin can read all n8n data
CREATE POLICY "Admin can read all n8n data" ON n8n_webhooks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin can read all n8n workflows" ON n8n_workflows
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin can read all n8n executions" ON n8n_executions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Service role can insert/update n8n data
CREATE POLICY "Service role can manage n8n data" ON n8n_webhooks
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage n8n workflows" ON n8n_workflows
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage n8n executions" ON n8n_executions
  FOR ALL USING (auth.role() = 'service_role'); 