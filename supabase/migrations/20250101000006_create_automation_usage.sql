-- Create automation usage tracking table
CREATE TABLE IF NOT EXISTS automation_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    automation_type TEXT NOT NULL CHECK (automation_type IN (
        'text-to-image',
        'image-to-video', 
        'text-to-video',
        'upscaling',
        'batch-processing'
    )),
    prompt TEXT NOT NULL,
    credits_used INTEGER DEFAULT 1,
    result_url TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS automation_usage_user_id_idx ON automation_usage(user_id);
CREATE INDEX IF NOT EXISTS automation_usage_type_idx ON automation_usage(automation_type);
CREATE INDEX IF NOT EXISTS automation_usage_created_at_idx ON automation_usage(created_at DESC);

-- Create RLS policies
ALTER TABLE automation_usage ENABLE ROW LEVEL SECURITY;

-- Users can only see their own usage data
CREATE POLICY "Users can view own automation usage"
    ON automation_usage FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own usage data (API will handle this)
CREATE POLICY "Users can insert own automation usage"
    ON automation_usage FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_automation_usage_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER automation_usage_updated_at
    BEFORE UPDATE ON automation_usage
    FOR EACH ROW
    EXECUTE FUNCTION update_automation_usage_updated_at();

-- Create view for usage statistics
CREATE OR REPLACE VIEW automation_usage_stats AS
SELECT 
    user_id,
    automation_type,
    COUNT(*) as usage_count,
    SUM(credits_used) as total_credits,
    AVG(credits_used) as avg_credits,
    MIN(created_at) as first_used,
    MAX(created_at) as last_used
FROM automation_usage
GROUP BY user_id, automation_type;

-- Grant access to the view
GRANT SELECT ON automation_usage_stats TO authenticated;