-- Create projects table with all necessary columns
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  project_brief TEXT,
  url TEXT,
  budget DECIMAL(10,2),
  status TEXT DEFAULT 'active',
  is_active BOOLEAN DEFAULT true,
  is_public BOOLEAN DEFAULT false,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  client_id UUID,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  category TEXT,
  project_type TEXT,
  social_links JSONB DEFAULT '{}',
  inspiration_links TEXT,
  what_to_build TEXT,
  desired_domain_name TEXT,
  logo_url TEXT,
  requested_budget TEXT,
  badge1 TEXT,
  badge2 TEXT,
  badge3 TEXT,
  badge4 TEXT,
  badge5 TEXT,
  is_featured BOOLEAN DEFAULT false,
  traffic_light_1 TEXT DEFAULT 'red' CHECK (traffic_light_1 IN ('red', 'orange', 'green')),
  traffic_light_2 TEXT DEFAULT 'red' CHECK (traffic_light_2 IN ('red', 'orange', 'green')),
  traffic_light_3 TEXT DEFAULT 'red' CHECK (traffic_light_3 IN ('red', 'orange', 'green')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON projects(created_by);
CREATE INDEX IF NOT EXISTS idx_projects_owner_user_id ON projects(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_is_public ON projects(is_public);

-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  color_scheme JSONB DEFAULT '{}',
  icon_name TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'on-hold', 'cancelled')),
  category TEXT,
  budget DECIMAL(10,2),
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for teams
CREATE INDEX IF NOT EXISTS idx_teams_created_by ON teams(created_by);
CREATE INDEX IF NOT EXISTS idx_teams_project_id ON teams(project_id);
CREATE INDEX IF NOT EXISTS idx_teams_slug ON teams(slug);

-- Create project roles enum
CREATE TYPE project_role AS ENUM (
  'Owner',
  'Admin', 
  'Project Manager',
  'Developer',
  'Designer',
  'Client',
  'Freelancer',
  'Consultant',
  'Investor',
  'Advisor',
  'Contributor',
  'Viewer'
);

-- Create access level enum
CREATE TYPE access_level AS ENUM (
  'Full',
  'Limited',
  'Read Only',
  'Custom'
);

-- Create user_project_memberships table
CREATE TABLE IF NOT EXISTS user_project_memberships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  role project_role DEFAULT 'Contributor',
  access_level access_level DEFAULT 'Limited',
  permissions TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'inactive')),
  invited_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, project_id)
);

-- Create indexes for user_project_memberships
CREATE INDEX IF NOT EXISTS idx_user_project_memberships_user_id ON user_project_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_user_project_memberships_project_id ON user_project_memberships(project_id);
CREATE INDEX IF NOT EXISTS idx_user_project_memberships_role ON user_project_memberships(role);

-- Create join_requests table
CREATE TABLE IF NOT EXISTS join_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  requested_role project_role DEFAULT 'Contributor',
  requested_access_level access_level DEFAULT 'Limited',
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, project_id)
);

-- Create indexes for join_requests
CREATE INDEX IF NOT EXISTS idx_join_requests_user_id ON join_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_join_requests_project_id ON join_requests(project_id);
CREATE INDEX IF NOT EXISTS idx_join_requests_status ON join_requests(status);

-- Create clients table (for project client information)
CREATE TABLE IF NOT EXISTS clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT,
  slug TEXT UNIQUE,
  website TEXT,
  logo_url TEXT,
  project_brief TEXT,
  project_category TEXT,
  notes TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for clients
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_slug ON clients(slug);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);

-- Add foreign key constraint for projects.client_id
ALTER TABLE projects 
ADD CONSTRAINT projects_client_id_fkey 
FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_projects_updated_at 
  BEFORE UPDATE ON projects 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at 
  BEFORE UPDATE ON teams 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_project_memberships_updated_at 
  BEFORE UPDATE ON user_project_memberships 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at 
  BEFORE UPDATE ON clients 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Create RLS policies
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_project_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE join_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Projects policies (simplified to avoid recursion)
CREATE POLICY "Users can view public projects" ON projects
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view their created projects" ON projects
  FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Users can view their owned projects" ON projects
  FOR SELECT USING (owner_user_id = auth.uid());

CREATE POLICY "Users can create projects" ON projects
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Project creators can update their projects" ON projects
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Project owners can update their projects" ON projects
  FOR UPDATE USING (owner_user_id = auth.uid());

-- Teams policies
CREATE POLICY "Users can view public teams" ON teams
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view teams they created" ON teams
  FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Users can create teams" ON teams
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Team creators can update their teams" ON teams
  FOR UPDATE USING (created_by = auth.uid());

-- User project memberships policies (simplified)
CREATE POLICY "Users can view their own memberships" ON user_project_memberships
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage memberships for their projects" ON user_project_memberships
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = user_project_memberships.project_id 
      AND (projects.created_by = auth.uid() OR projects.owner_user_id = auth.uid())
    )
  );

-- Join requests policies (simplified)
CREATE POLICY "Users can view their own join requests" ON join_requests
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can view join requests for their projects" ON join_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = join_requests.project_id 
      AND (projects.created_by = auth.uid() OR projects.owner_user_id = auth.uid())
    )
  );

CREATE POLICY "Users can create join requests" ON join_requests
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update join requests for their projects" ON join_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = join_requests.project_id 
      AND (projects.created_by = auth.uid() OR projects.owner_user_id = auth.uid())
    )
  );

-- Clients policies
CREATE POLICY "Users can view their own client records" ON clients
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create client records" ON clients
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own client records" ON clients
  FOR UPDATE USING (user_id = auth.uid());

-- Create a view for backwards compatibility with existing code that expects 'project_members'
CREATE OR REPLACE VIEW project_members AS
SELECT 
  upm.id,
  upm.user_id,
  upm.project_id,
  upm.role,
  p.display_name,
  p.username AS email, -- Fallback to username if email not available
  p.avatar_url,
  upm.created_at,
  upm.updated_at
FROM user_project_memberships upm
LEFT JOIN profiles p ON upm.user_id = p.id;

-- Comments for documentation
COMMENT ON TABLE projects IS 'Main projects table containing all project information';
COMMENT ON COLUMN projects.created_by IS 'User who created the project (required)';
COMMENT ON COLUMN projects.owner_user_id IS 'Current owner of the project (can be transferred)';
COMMENT ON COLUMN projects.traffic_light_1 IS 'Website live status: green=live, red=not live';
COMMENT ON COLUMN projects.traffic_light_2 IS 'Features status: green=up to date, orange=need attention, red=need work';
COMMENT ON COLUMN projects.traffic_light_3 IS 'Deep functionality status: green=full functionality, orange=some incomplete, red=not built/no database'; 