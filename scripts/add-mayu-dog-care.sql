-- Add Mayu Dog Care client and project
-- This script adds the Mayu Dog Care website to the client projects

-- First, insert the client record
INSERT INTO clients (
  name,
  website,
  project_brief,
  project_category,
  slug,
  status
) VALUES (
  'Mayu Dog Care',
  'https://www.mayudogcare.website/',
  'Dog daycare and pet care services website located in Koh Samui, Thailand. Services include daily daycare, overnight stays, and special care for pets.',
  'Pet Care Services',
  'mayu-dog-care',
  'active'
) ON CONFLICT (slug) DO NOTHING;

-- Then, insert the project record linked to the client
INSERT INTO projects (
  name,
  slug,
  description,
  project_brief,
  url,
  status,
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
  'Mayu Dog Care Website',
  'mayu-dog-care-website',
  'Professional dog daycare website for Mayu Dog Care located in Koh Samui, Thailand. Features daily pet care services, overnight boarding, and special pet care options.',
  'Complete website development for a dog daycare business including service listings, booking system, and contact information.',
  'https://www.mayudogcare.website/',
  'completed',
  true,
  (SELECT id FROM auth.users LIMIT 1), -- Use first available user as creator
  (SELECT id FROM auth.users LIMIT 1), -- Use first available user as owner
  (SELECT id FROM clients WHERE slug = 'mayu-dog-care'),
  'Pet Care',
  'Business Website',
  false,
  'green',  -- Website is live
  'green',  -- Features are complete
  'green'   -- Full functionality
) ON CONFLICT (slug) DO NOTHING;

-- Display the results
SELECT
  'Client added: ' || c.name || ' (' || c.website || ')' as result
FROM clients c
WHERE c.slug = 'mayu-dog-care';

SELECT
  'Project added: ' || p.name || ' (' || p.url || ')' as result
FROM projects p
WHERE p.slug = 'mayu-dog-care-website';
