-- Create client_requests table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.client_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Basic contact information
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    
    -- Project details
    project_title TEXT NOT NULL,
    project_description TEXT,
    required_features TEXT[],
    additional_notes TEXT,
    
    -- Budget and timeline
    requested_budget NUMERIC,
    timeline TEXT,
    
    -- Status tracking
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'approved', 'rejected', 'completed')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    
    -- Admin tracking
    assigned_to UUID REFERENCES auth.users(id),
    internal_notes TEXT,
    
    -- Contact preferences
    preferred_contact_method TEXT DEFAULT 'email',
    best_time_to_contact TEXT,
    
    -- Source tracking
    source TEXT DEFAULT 'website',
    referral TEXT,
    
    -- Additional metadata
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_client_requests_status ON public.client_requests(status);
CREATE INDEX IF NOT EXISTS idx_client_requests_created_at ON public.client_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_client_requests_email ON public.client_requests(email);
CREATE INDEX IF NOT EXISTS idx_client_requests_assigned_to ON public.client_requests(assigned_to);

-- Enable Row Level Security
ALTER TABLE public.client_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
CREATE POLICY "Admin users can view all client requests" ON public.client_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Admin users can insert client requests" ON public.client_requests
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Admin users can update client requests" ON public.client_requests
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

-- Allow anonymous inserts for public form submissions
CREATE POLICY "Allow anonymous client request submissions" ON public.client_requests
    FOR INSERT WITH CHECK (true);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_client_requests_updated_at BEFORE UPDATE
    ON public.client_requests FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column(); 