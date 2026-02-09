-- Create boardroom_messages table
CREATE TABLE IF NOT EXISTS boardroom_messages (
  id TEXT PRIMARY KEY,
  room_id TEXT NOT NULL DEFAULT 'general',
  user_id TEXT NOT NULL,
  username TEXT NOT NULL,
  message TEXT NOT NULL,
  tokens TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_boardroom_messages_room_id ON boardroom_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_boardroom_messages_created_at ON boardroom_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_boardroom_messages_user_id ON boardroom_messages(user_id);

-- Enable Row Level Security
ALTER TABLE boardroom_messages ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow anyone to read messages (for public chat)
CREATE POLICY "Allow public read access to boardroom messages" ON boardroom_messages
  FOR SELECT USING (true);

-- Allow authenticated users to insert messages
CREATE POLICY "Allow authenticated users to insert messages" ON boardroom_messages
  FOR INSERT WITH CHECK (
    -- Allow if user has tokens (wallet connected) or is a Telegram user
    array_length(tokens, 1) > 0 OR user_id LIKE 'telegram_%' OR user_id = 'boardroom_bot'
  );

-- Allow users to update their own messages (optional)
CREATE POLICY "Allow users to update own messages" ON boardroom_messages
  FOR UPDATE USING (user_id = current_user);

-- Allow users to delete their own messages (optional)
CREATE POLICY "Allow users to delete own messages" ON boardroom_messages
  FOR DELETE USING (user_id = current_user);

-- Insert some sample messages
INSERT INTO boardroom_messages (id, room_id, user_id, username, message, tokens, created_at) VALUES
  ('welcome-1', 'general', 'boardroom_bot', 'Board_Room_Bot', '🎉 Welcome to The Boardroom! This is a token-gated community chat. Connect your Phantom wallet to participate.', '{}', NOW() - INTERVAL '1 hour'),
  ('welcome-2', 'general', 'boardroom_bot', 'Board_Room_Bot', '🔐 Only verified token holders can send messages. If you don\'t have the required tokens, you can still read the conversation.', '{}', NOW() - INTERVAL '30 minutes'),
  ('sample-1', 'general', 'telegram_123', 'Alice', 'Hello everyone! Excited to be part of this community! 🚀', '{BOASE}', NOW() - INTERVAL '15 minutes'),
  ('sample-2', 'general', 'telegram_456', 'Bob', 'Great to see the token-gating working properly! 💪', '{BOASE}', NOW() - INTERVAL '10 minutes'); 