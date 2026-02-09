-- Migration to add ninjapunkgirls.website as a client project
-- This migration creates the client record and project for ninjapunkgirls.website

-- First, create the client record for ninjapunkgirls.website
INSERT INTO clients (
  id,
  name,
  email,
  slug,
  website,
  logo_url,
  project_brief,
  project_category,
  status,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'Ninja Punk Girls',
  'info@ninjapunkgirls.website',
  'ninjapunkgirls-website',
  'https://ninjapunkgirls.website',
  '/images/clientprojects/ninjapunkgirls-com/NPG%20logo.png',
  'A revolutionary NFT and digital art platform that combines cyberpunk aesthetics with ninja culture, creating a unique community-driven ecosystem for digital collectibles, gaming, and immersive experiences.',
  'NFT Platform',
  'active',
  NOW(),
  NOW()
) ON CONFLICT (slug) DO NOTHING;

-- Get the client ID we just created
DO $$
DECLARE
  client_id UUID;
  user_id UUID;
BEGIN
  -- Get the client ID
  SELECT id INTO client_id FROM clients WHERE slug = 'ninjapunkgirls-website';
  
  -- Get Richard's user ID (assuming he's the creator)
  SELECT id INTO user_id FROM auth.users WHERE email = 'richardwboase@gmail.com';
  
  -- Create the project record linked to the client
  INSERT INTO projects (
    id,
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
    traffic_light_3,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    'Ninja Punk Girls Website',
    'ninjapunkgirls-website',
    'A vibrant NFT marketplace showcasing unique digital art of cyberpunk female warriors with gaming integration and community features.',
    'A revolutionary NFT and digital art platform that combines cyberpunk aesthetics with ninja culture, creating a unique community-driven ecosystem for digital collectibles, gaming, and immersive experiences.',
    'https://ninjapunkgirls.website',
    'active',
    true,
    true,
    COALESCE(user_id, '738e36f8-a8ac-43f6-b8d2-4abac3e8d9d7'),
    COALESCE(user_id, '738e36f8-a8ac-43f6-b8d2-4abac3e8d9d7'),
    client_id,
    'NFT Platform',
    'Web Application',
    true,
    'green',
    'green',
    'green'
  ) ON CONFLICT (slug) DO NOTHING;
  
  -- Create a team for the project
  INSERT INTO teams (
    id,
    name,
    slug,
    description,
    is_public,
    created_by,
    project_id,
    status,
    category,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    'Ninja Punk Girls Team',
    'npg-team',
    'Development team for the Ninja Punk Girls NFT platform',
    false,
    COALESCE(user_id, '738e36f8-a8ac-43f6-b8d2-4abac3e8d9d7'),
    (SELECT id FROM projects WHERE slug = 'ninjapunkgirls-website'),
    'active',
    'Development',
    NOW(),
    NOW()
  ) ON CONFLICT DO NOTHING;
  
END $$;

-- Add any additional metadata or badges to the client if needed
UPDATE clients 
SET 
  badge1 = 'Live',
  badge2 = 'NFT Platform',
  badge3 = 'Gaming Integration',
  badge4 = 'Community Driven',
  badge5 = 'AI Generated Art',
  is_featured = true
WHERE slug = 'ninjapunkgirls-website';

-- Verify the insertion
SELECT 
  'Client created:' as status,
  c.name,
  c.website,
  c.status
FROM clients c 
WHERE c.slug = 'ninjapunkgirls-website';

SELECT 
  'Project created:' as status,
  p.name,
  p.url,
  p.status,
  p.traffic_light_1,
  p.traffic_light_2,
  p.traffic_light_3
FROM projects p 
WHERE p.slug = 'ninjapunkgirls-website';
