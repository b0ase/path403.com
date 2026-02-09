-- Simple project creation script
-- Run this in Supabase SQL Editor after logging in

-- Check if user is authenticated
SELECT 
  CASE 
    WHEN auth.uid() IS NOT NULL THEN 'User authenticated: ' || (SELECT email FROM auth.users WHERE id = auth.uid())
    ELSE 'ERROR: No authenticated user found'
  END as status;

-- Insert projects (replace with your user ID if needed)
INSERT INTO projects (
  name, 
  slug, 
  description, 
  project_brief, 
  status, 
  is_public, 
  created_by, 
  owner_user_id, 
  category, 
  project_type, 
  is_featured, 
  traffic_light_1, 
  traffic_light_2, 
  traffic_light_3
) VALUES 
(
  'b0ase.com Platform',
  'b0ase-platform', 
  'Main b0ase.com platform with crypto modules and services',
  'A comprehensive platform for crypto project development with modular components, shopping cart, and authentication system.',
  'active',
  true,
  auth.uid(),
  auth.uid(),
  'Platform',
  'Web Application',
  true,
  'green',
  'orange',
  'orange'
),
(
  'Crypto Trading Bot',
  'crypto-trading-bot',
  'Automated cryptocurrency trading system',
  'Advanced trading bot with machine learning algorithms for optimal crypto trading strategies.',
  'active',
  false,
  auth.uid(),
  auth.uid(),
  'Trading',
  'Software',
  true,
  'orange',
  'green', 
  'red'
),
(
  'NFT Marketplace',
  'nft-marketplace',
  'Decentralized NFT trading platform',
  'Full-featured NFT marketplace with minting, trading, and royalty management capabilities.',
  'active',
  false,
  auth.uid(),
  auth.uid(),
  'NFT',
  'Web Application',
  false,
  'red',
  'orange',
  'orange'
);

-- Insert teams
INSERT INTO teams (name, slug, description, is_public, created_by, project_id)
VALUES 
(
  'b0ase Core Team',
  'b0ase-core',
  'Main development team for the b0ase platform',
  false,
  auth.uid(),
  (SELECT id FROM projects WHERE slug = 'b0ase-platform' LIMIT 1)
);

-- Verify results
SELECT 'Projects created: ' || COUNT(*) as result FROM projects WHERE created_by = auth.uid();
SELECT 'Teams created: ' || COUNT(*) as result FROM teams WHERE created_by = auth.uid(); 