-- Create table to track blog post review status (for both markdown and database posts)
CREATE TABLE IF NOT EXISTS public.blog_post_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  queued BOOLEAN DEFAULT false,
  live BOOLEAN DEFAULT false,
  formatted BOOLEAN DEFAULT false,
  last_checked_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Add index on slug for fast lookups
CREATE INDEX IF NOT EXISTS idx_blog_post_status_slug ON public.blog_post_status(slug);

-- Enable RLS
ALTER TABLE public.blog_post_status ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read
CREATE POLICY "Allow authenticated users to read blog post status"
  ON public.blog_post_status
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert/update
CREATE POLICY "Allow authenticated users to update blog post status"
  ON public.blog_post_status
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_blog_post_status_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_blog_post_status_updated_at
  BEFORE UPDATE ON public.blog_post_status
  FOR EACH ROW
  EXECUTE FUNCTION public.update_blog_post_status_updated_at();

COMMENT ON TABLE public.blog_post_status IS 'Tracks review status of blog posts (both markdown files and database posts)';
