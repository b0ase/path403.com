-- Add missing tables for b0ase.com application
-- Created 2024-12-24

-- Skills table
CREATE TABLE IF NOT EXISTS public.skills (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name TEXT NOT NULL,
  category TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Robust AE content table (for traffic lights and other dynamic content)
CREATE TABLE IF NOT EXISTS public.robust_ae_content (
  id INTEGER PRIMARY KEY,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on new tables
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.robust_ae_content ENABLE ROW LEVEL SECURITY;

-- Policies for skills table (read-only for authenticated users)
CREATE POLICY "Skills are viewable by everyone"
  ON public.skills FOR SELECT
  USING (true);

CREATE POLICY "Skills can be managed by authenticated users"
  ON public.skills FOR ALL
  USING (auth.role() = 'authenticated');

-- Policies for robust_ae_content table (admin only)
CREATE POLICY "Robust AE content viewable by authenticated users"
  ON public.robust_ae_content FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Robust AE content manageable by service role"
  ON public.robust_ae_content FOR ALL
  USING (auth.role() = 'service_role');

-- Insert some sample skills data
INSERT INTO public.skills (name, category, description) VALUES
  ('React', 'Frontend Development', 'Modern JavaScript library for building user interfaces'),
  ('Next.js', 'Frontend Development', 'Full-stack React framework for production applications'),
  ('TypeScript', 'Programming', 'Statically typed superset of JavaScript'),
  ('Node.js', 'Backend Development', 'JavaScript runtime for server-side applications'),
  ('Supabase', 'Backend Development', 'Open-source Firebase alternative with PostgreSQL'),
  ('PostgreSQL', 'Databases', 'Advanced open-source relational database'),
  ('Tailwind CSS', 'Frontend Development', 'Utility-first CSS framework'),
  ('Docker', 'DevOps', 'Containerization platform for application deployment'),
  ('Git', 'Programming', 'Distributed version control system'),
  ('AWS', 'Cloud Computing', 'Amazon Web Services cloud platform')
ON CONFLICT (id) DO NOTHING;

-- Initialize traffic lights data in robust_ae_content
INSERT INTO public.robust_ae_content (id, data) VALUES
  (999, '{"trafficLights": {}}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  data = EXCLUDED.data;