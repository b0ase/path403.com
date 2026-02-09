-- Create a table to store chat messages
CREATE TABLE public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL, -- Optional: Link to a registered user
    role TEXT NOT NULL CHECK (role IN ('user', 'agent')),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add an index for faster retrieval of messages for a session
CREATE INDEX idx_chat_messages_session_id ON public.chat_messages(session_id);

-- Optional: RLS policies for chat_messages
-- This would be important if you allow users to fetch their own chat history directly from the client.
-- For now, as it's server-side, we'll omit this. 