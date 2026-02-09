-- Create chat_rooms table
CREATE TABLE IF NOT EXISTS public.chat_rooms (
  id TEXT PRIMARY KEY, -- 'general', 'boase-holders', etc.
  name TEXT NOT NULL,
  description TEXT,
  required_tokens TEXT[] DEFAULT '{}', -- Array of token symbols required to access
  created_by_wallet TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create boardroom_messages table
CREATE TABLE IF NOT EXISTS public.boardroom_messages (
  id TEXT PRIMARY KEY,
  room_id TEXT REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  username TEXT NOT NULL,
  message TEXT NOT NULL,
  tokens TEXT[] DEFAULT '{}', -- Tokens held by the user at time of message
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create boardroom_members table
CREATE TABLE IF NOT EXISTS public.boardroom_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Member',
  wallet_address TEXT,
  source TEXT DEFAULT 'website',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boardroom_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boardroom_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Chat Rooms: Visible to everyone, manageable by service role
CREATE POLICY "Chat rooms are viewable by everyone" 
  ON public.chat_rooms FOR SELECT 
  USING (true);

CREATE POLICY "Chat rooms manageable by service role" 
  ON public.chat_rooms FOR ALL 
  USING (auth.role() = 'service_role');

-- Messages: Visible to everyone (API handles filtering), insertable by service role
-- Note: In a real app, you might restrict SELECT based on token holdings in RLS,
-- but since we are using an API route with a Service Role key to fetch, 
-- the API is responsible for gating.
CREATE POLICY "Messages viewable by service role" 
  ON public.boardroom_messages FOR ALL
  USING (auth.role() = 'service_role');
  
-- Allow public read for messages? Maybe restricted to authenticated in future.
-- For now, relying on API.

-- Members: Visible to everyone, manageable by service role
CREATE POLICY "Members viewable by everyone" 
  ON public.boardroom_members FOR SELECT 
  USING (true);

CREATE POLICY "Members manageable by service role" 
  ON public.boardroom_members FOR ALL 
  USING (auth.role() = 'service_role');

-- Insert default 'General' room
INSERT INTO public.chat_rooms (id, name, description, required_tokens, is_active)
VALUES (
  'general', 
  'General Boardroom', 
  'Open discussion for all community members', 
  '{}', 
  true
) ON CONFLICT (id) DO NOTHING;
