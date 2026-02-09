-- Create Video table for studio
CREATE TABLE IF NOT EXISTS "Video" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  url TEXT NOT NULL,
  size BIGINT,
  type TEXT,
  metadata JSONB,
  duration FLOAT,
  dimensions TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "framePriceSats" INTEGER DEFAULT 1,
  "projectSlug" TEXT DEFAULT 'cherry'
);

-- Create Audio table for studio
CREATE TABLE IF NOT EXISTS "Audio" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  url TEXT NOT NULL,
  size BIGINT,
  duration FLOAT,
  metadata JSONB,
  "projectSlug" TEXT DEFAULT 'cherry',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE "Video" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Audio" ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access on Video" ON "Video" FOR SELECT USING (true);
CREATE POLICY "Allow public read access on Audio" ON "Audio" FOR SELECT USING (true);

-- Allow authenticated users to insert/update (optional)
CREATE POLICY "Allow authenticated insert on Video" ON "Video" FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated insert on Audio" ON "Audio" FOR INSERT WITH CHECK (true);
