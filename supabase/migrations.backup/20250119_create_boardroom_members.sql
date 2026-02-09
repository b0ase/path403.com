-- Create boardroom_members table
CREATE TABLE IF NOT EXISTS boardroom_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  role VARCHAR(100) NOT NULL,
  wallet_address VARCHAR(255),
  source VARCHAR(50) DEFAULT 'website', -- 'bot' or 'website'
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_boardroom_members_username ON boardroom_members(username);
CREATE INDEX IF NOT EXISTS idx_boardroom_members_role ON boardroom_members(role);
CREATE INDEX IF NOT EXISTS idx_boardroom_members_source ON boardroom_members(source);
CREATE INDEX IF NOT EXISTS idx_boardroom_members_joined_at ON boardroom_members(joined_at);

-- Add RLS (Row Level Security) policies
ALTER TABLE boardroom_members ENABLE ROW LEVEL SECURITY;

-- Allow public read access to boardroom members
CREATE POLICY "Allow public read access to boardroom members" ON boardroom_members
  FOR SELECT USING (true);

-- Allow authenticated users to insert
CREATE POLICY "Allow authenticated users to insert boardroom members" ON boardroom_members
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow users to update their own records
CREATE POLICY "Allow users to update own boardroom member record" ON boardroom_members
  FOR UPDATE USING (auth.uid()::text = wallet_address);

-- Insert some sample data
INSERT INTO boardroom_members (username, role, wallet_address, source) VALUES
  ('Board_Room_Bot', 'System Admin', NULL, 'bot'),
  ('Alice', 'Investor', '0x1234567890abcdef', 'website'),
  ('Bob', 'Developer', '0xabcdef1234567890', 'bot'),
  ('Carol', 'Advisor', '0x9876543210fedcba', 'website')
ON CONFLICT DO NOTHING; 