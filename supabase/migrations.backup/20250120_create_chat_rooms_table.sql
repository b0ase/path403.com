-- Create chat_rooms table for persistent token-based chat rooms
CREATE TABLE IF NOT EXISTS chat_rooms (
  id TEXT PRIMARY KEY, -- e.g., 'sol-holders', 'usdc-holders', 'multi-token-vip'
  name TEXT NOT NULL, -- e.g., 'SOL Holders', 'USDC Holders', 'Multi-Token VIP'
  description TEXT,
  required_tokens TEXT[] DEFAULT '{}', -- Array of token symbols required to access
  is_active BOOLEAN DEFAULT true,
  created_by_wallet TEXT, -- Wallet address that created this room
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_rooms_required_tokens ON chat_rooms USING GIN(required_tokens);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_created_by_wallet ON chat_rooms(created_by_wallet);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_is_active ON chat_rooms(is_active);

-- Enable Row Level Security
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow anyone to read active chat rooms
CREATE POLICY "Allow public read access to active chat rooms" ON chat_rooms
  FOR SELECT USING (is_active = true);

-- Allow authenticated users to create chat rooms
CREATE POLICY "Allow authenticated users to create chat rooms" ON chat_rooms
  FOR INSERT WITH CHECK (true);

-- Allow room creators to update their rooms
CREATE POLICY "Allow room creators to update their rooms" ON chat_rooms
  FOR UPDATE USING (created_by_wallet = current_user);

-- Function to create a chat room for a specific token
CREATE OR REPLACE FUNCTION create_token_chat_room(
  token_symbol TEXT,
  wallet_address TEXT
) RETURNS TEXT AS $$
DECLARE
  room_id TEXT;
  room_name TEXT;
  room_description TEXT;
BEGIN
  -- Create room ID from token symbol
  room_id := LOWER(token_symbol) || '-holders';
  room_name := token_symbol || ' Holders';
  room_description := 'Exclusive chat for ' || token_symbol || ' token holders';
  
  -- Insert the room if it doesn't exist
  INSERT INTO chat_rooms (id, name, description, required_tokens, created_by_wallet)
  VALUES (room_id, room_name, room_description, ARRAY[token_symbol], wallet_address)
  ON CONFLICT (id) DO NOTHING;
  
  RETURN room_id;
END;
$$ LANGUAGE plpgsql;

-- Function to create VIP room for users with multiple tokens
CREATE OR REPLACE FUNCTION create_vip_chat_room(
  token_symbols TEXT[],
  wallet_address TEXT
) RETURNS TEXT AS $$
DECLARE
  room_id TEXT;
  room_name TEXT;
  room_description TEXT;
  token_count INTEGER;
BEGIN
  -- Count tokens for room naming
  token_count := array_length(token_symbols, 1);
  
  -- Create room ID and name
  room_id := 'multi-token-vip-' || token_count || '-plus';
  room_name := token_count || '+ Token VIP';
  room_description := 'Exclusive VIP chat for holders of ' || token_count || ' or more tokens';
  
  -- Insert the room if it doesn't exist
  INSERT INTO chat_rooms (id, name, description, required_tokens, created_by_wallet)
  VALUES (room_id, room_name, room_description, token_symbols, wallet_address)
  ON CONFLICT (id) DO NOTHING;
  
  RETURN room_id;
END;
$$ LANGUAGE plpgsql;

-- Insert default general room
INSERT INTO chat_rooms (id, name, description, required_tokens, created_by_wallet)
VALUES (
  'general',
  'General Discussion',
  'Open discussion for all authenticated users',
  '{}',
  'system'
) ON CONFLICT (id) DO NOTHING;

-- Create a function to get chat rooms for a wallet's tokens
CREATE OR REPLACE FUNCTION get_chat_rooms_for_tokens(
  user_tokens TEXT[]
) RETURNS TABLE (
  id TEXT,
  name TEXT,
  description TEXT,
  required_tokens TEXT[],
  has_access BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cr.id,
    cr.name,
    cr.description,
    cr.required_tokens,
    CASE 
      WHEN cr.required_tokens = '{}' THEN true -- General room always accessible
      WHEN cr.required_tokens && user_tokens THEN true -- User has required tokens
      ELSE false
    END as has_access
  FROM chat_rooms cr
  WHERE cr.is_active = true
  ORDER BY 
    CASE WHEN cr.required_tokens = '{}' THEN 0 ELSE 1 END, -- General room first
    cr.name;
END;
$$ LANGUAGE plpgsql; 