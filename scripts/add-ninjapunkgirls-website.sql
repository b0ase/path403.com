-- Simple SQL script to add ninjapunkgirls.website as a client project
-- Run this directly in the Supabase SQL Editor

-- Step 1: Create the client record
INSERT INTO clients (
  name,
  email,
  slug,
  website,
  logo_url,
  project_brief,
  project_category,
  status,
  badge1,
  badge2,
  badge3,
  badge4,
  badge5,
  is_featured
) VALUES (
  'Ninja Punk Girls',
  'info@ninjapunkgirls.website',
  'ninjapunkgirls-website',
  'https://ninjapunkgirls.website',
  '/images/clientprojects/ninjapunkgirls-com/NPG%20logo.png',
  'A revolutionary NFT and digital art platform that combines cyberpunk aesthetics with ninja culture, creating a unique community-driven ecosystem for digital collectibles, gaming, and immersive experiences.',
  'NFT Platform',
  'active',
  'Live',
  'NFT Platform',
  'Gaming Integration',
  'Community Driven',
  'AI Generated Art',
  true
) ON CONFLICT (slug) DO NOTHING;

-- Step 2: Create the project record
INSERT INTO projects (
  name,
  slug,
  description,
  project_brief,
  url,
  status,
  is_active,
  is_public,
  created_by,
  owner_user_id,
  client_id,
  category,
  project_type,
  is_featured,
  traffic_light_1,
  traffic_light_2,
  traffic_light_3
) VALUES (
  'Ninja Punk Girls Website',
  'ninjapunkgirls-website',
  'A vibrant NFT marketplace showcasing unique digital art of cyberpunk female warriors with gaming integration and community features.',
  'A revolutionary NFT and digital art platform that combines cyberpunk aesthetics with ninja culture, creating a unique community-driven ecosystem for digital collectibles, gaming, and immersive experiences.',
  'https://ninjapunkgirls.website',
  'active',
  true,
  true,
  '738e36f8-a8ac-43f6-b8d2-4abac3e8d9d7',
  '738e36f8-a8ac-43f6-b8d2-4abac3e8d9d7',
  (SELECT id FROM clients WHERE slug = 'ninjapunkgirls-website'),
  'NFT Platform',
  'Web Application',
  true,
  'green',
  'green',
  'green'
) ON CONFLICT (slug) DO NOTHING;

-- Step 3: Create a team for the project
INSERT INTO teams (
  name,
  slug,
  description,
  is_public,
  created_by,
  project_id,
  status,
  category
) VALUES (
  'Ninja Punk Girls Team',
  'npg-team',
  'Development team for the Ninja Punk Girls NFT platform',
  false,
  '738e36f8-a8ac-43f6-b8d2-4abac3e8d9d7',
  (SELECT id FROM projects WHERE slug = 'ninjapunkgirls-website'),
  'active',
  'Development'
) ON CONFLICT DO NOTHING;

-- Step 4: Verify the creation
SELECT '✅ Client created successfully' as status;
SELECT 
  c.name,
  c.website,
  c.status,
  c.badge1,
  c.badge2,
  c.badge3
FROM clients c 
WHERE c.slug = 'ninjapunkgirls-website';

SELECT '✅ Project created successfully' as status;
SELECT 
  p.name,
  p.url,
  p.status,
  p.traffic_light_1,
  p.traffic_light_2,
  p.traffic_light_3
FROM projects p 
WHERE p.slug = 'ninjapunkgirls-website';

SELECT '✅ Team created successfully' as status;
SELECT 
  t.name,
  t.slug,
  t.status
FROM teams t 
WHERE t.slug = 'npg-team';
