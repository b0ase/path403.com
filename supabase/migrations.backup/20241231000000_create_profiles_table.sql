-- Create profiles table that other migrations depend on
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  full_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  website_url TEXT,
  twitter_url TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  instagram_url TEXT,
  discord_url TEXT,
  phone_whatsapp TEXT,
  tiktok_url TEXT,
  telegram_url TEXT,
  facebook_url TEXT,
  dollar_handle TEXT,
  token_name TEXT,
  supply TEXT DEFAULT '1,000,000,000',
  has_seen_welcome_card BOOLEAN DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user role enum
CREATE TYPE user_role_type AS ENUM (
  'admin',
  'user',
  'investor',
  'builder',
  'social',
  'strategist', 
  'creative',
  'marketer',
  'connector',
  'community'
);

-- Add role column to profiles table
ALTER TABLE profiles 
ADD COLUMN role user_role_type DEFAULT 'user';

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    username, 
    display_name, 
    full_name, 
    avatar_url
  )
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'full_name',
    COALESCE(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture')
  );
  RETURN new;
END;
$$ language plpgsql security definer;

-- Trigger to automatically create profile when user signs up
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create skills table
CREATE TABLE IF NOT EXISTS skills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  category TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_skills junction table
CREATE TABLE IF NOT EXISTS user_skills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, skill_id)
);

-- Create indexes for skills tables
CREATE INDEX IF NOT EXISTS idx_skills_name ON skills(name);
CREATE INDEX IF NOT EXISTS idx_skills_category ON skills(category);
CREATE INDEX IF NOT EXISTS idx_user_skills_user_id ON user_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_skill_id ON user_skills(skill_id);

-- Enable RLS for skills tables
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;

-- RLS policies for skills (readable by all authenticated users)
CREATE POLICY "Skills are viewable by all authenticated users" 
  ON skills FOR SELECT 
  TO authenticated 
  USING (true);

-- RLS policies for user_skills
CREATE POLICY "Users can view their own skills" 
  ON user_skills FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own skills" 
  ON user_skills FOR ALL 
  USING (auth.uid() = user_id);

-- Insert some default skills
INSERT INTO skills (name, category, description) VALUES
('JavaScript', 'Programming', 'JavaScript programming language'),
('TypeScript', 'Programming', 'TypeScript programming language'),
('React', 'Frontend', 'React JavaScript library'),
('Next.js', 'Frontend', 'Next.js React framework'),
('Node.js', 'Backend', 'Node.js runtime environment'),
('Python', 'Programming', 'Python programming language'),
('Solidity', 'Blockchain', 'Smart contract programming language'),
('Web3', 'Blockchain', 'Web3 and blockchain development'),
('UI/UX Design', 'Design', 'User interface and experience design'),
('Graphic Design', 'Design', 'Visual design and graphics'),
('Project Management', 'Management', 'Project planning and coordination'),
('Marketing', 'Business', 'Digital marketing and promotion'),
('SEO', 'Marketing', 'Search engine optimization'),
('Content Writing', 'Content', 'Writing and content creation'),
('Social Media', 'Marketing', 'Social media management'),
('Photography', 'Creative', 'Photography and image creation'),
('Video Editing', 'Creative', 'Video production and editing'),
('Analytics', 'Data', 'Data analysis and insights'),
('Cryptocurrency', 'Blockchain', 'Cryptocurrency and DeFi'),
('Smart Contracts', 'Blockchain', 'Smart contract development')
ON CONFLICT (name) DO NOTHING; 