-- Create table for storing Notion OAuth tokens
CREATE TABLE notion_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  access_token TEXT NOT NULL,
  token_type TEXT NOT NULL DEFAULT 'bearer',
  bot_id TEXT NOT NULL,
  workspace_name TEXT,
  workspace_icon TEXT,
  workspace_id TEXT NOT NULL,
  owner JSONB,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_notion_tokens_workspace_id ON notion_tokens(workspace_id);
CREATE INDEX idx_notion_tokens_user_id ON notion_tokens(user_id);

-- Enable RLS
ALTER TABLE notion_tokens ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own tokens" ON notion_tokens
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tokens" ON notion_tokens
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tokens" ON notion_tokens
  FOR UPDATE USING (auth.uid() = user_id); 