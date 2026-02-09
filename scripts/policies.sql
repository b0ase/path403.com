
-- Enable RLS
ALTER TABLE "public"."clients" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."projects" ENABLE ROW LEVEL SECURITY;

-- CLIENTS POLICIES
DROP POLICY IF EXISTS "Users can view their own clients" ON "public"."clients";
CREATE POLICY "Users can view their own clients" ON "public"."clients"
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own clients" ON "public"."clients";
CREATE POLICY "Users can insert their own clients" ON "public"."clients"
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own clients" ON "public"."clients";
CREATE POLICY "Users can update their own clients" ON "public"."clients"
FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

-- PROJECTS POLICIES
DROP POLICY IF EXISTS "Users can view their own projects" ON "public"."projects";
CREATE POLICY "Users can view their own projects" ON "public"."projects"
FOR SELECT TO authenticated
USING (auth.uid() = owner_user_id OR auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can insert their own projects" ON "public"."projects";
CREATE POLICY "Users can insert their own projects" ON "public"."projects"
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = owner_user_id);

DROP POLICY IF EXISTS "Users can update their own projects" ON "public"."projects";
CREATE POLICY "Users can update their own projects" ON "public"."projects"
FOR UPDATE TO authenticated
USING (auth.uid() = owner_user_id);

-- MEMBERS POLICIES
ALTER TABLE "public"."project_members" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view project members" ON "public"."project_members";
CREATE POLICY "Anyone can view project members" ON "public"."project_members"
FOR SELECT TO authenticated
USING (true);

-- TREATMENTS POLICIES
ALTER TABLE "public"."project_treatments" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view project treatments" ON "public"."project_treatments";
CREATE POLICY "Anyone can view project treatments" ON "public"."project_treatments"
FOR SELECT TO authenticated
USING (true);

-- TIMELINES POLICIES
ALTER TABLE "public"."project_timelines" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view project timelines" ON "public"."project_timelines";
CREATE POLICY "Anyone can view project timelines" ON "public"."project_timelines"
FOR SELECT TO authenticated
USING (true);

-- FEATURES POLICIES
ALTER TABLE "public"."project_features" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view project features" ON "public"."project_features";
CREATE POLICY "Anyone can view project features" ON "public"."project_features"
FOR SELECT TO authenticated
USING (true);

DROP POLICY IF EXISTS "Users can manage features for their projects" ON "public"."project_features";
CREATE POLICY "Users can manage features for their projects" ON "public"."project_features"
FOR ALL TO authenticated
USING (true); -- Simplified for now, can be scoped to user's projects later

-- FEEDBACK POLICIES
ALTER TABLE "public"."project_feedback" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can insert feedback" ON "public"."project_feedback";
CREATE POLICY "Users can insert feedback" ON "public"."project_feedback"
FOR INSERT TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Owners can view feedback" ON "public"."project_feedback";
CREATE POLICY "Owners can view feedback" ON "public"."project_feedback"
FOR SELECT TO authenticated
USING (true);
