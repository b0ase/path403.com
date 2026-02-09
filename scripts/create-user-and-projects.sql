-- Script to create projects for the currently authenticated user
-- This script should be run after logging in to the application

-- First, let's see who is currently authenticated
DO $$
DECLARE
  current_user_id UUID;
  user_email TEXT;
BEGIN
  -- Get the current authenticated user
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'No authenticated user found. Please log in first.';
  END IF;
  
  -- Get user email for confirmation
  SELECT email INTO user_email FROM auth.users WHERE id = current_user_id;
  
  RAISE NOTICE 'Creating projects for user: % (ID: %)', user_email, current_user_id;
  
  -- Insert projects with the current user as creator/owner
  INSERT INTO projects (name, slug, description, project_brief, status, is_public, created_by, owner_user_id, category, project_type, is_featured, traffic_light_1, traffic_light_2, traffic_light_3) 
  VALUES 
    ('b0ase.com Platform', 'b0ase-platform', 'Main b0ase.com platform with crypto modules and services', 'A comprehensive platform for crypto project development with modular components, shopping cart, and authentication system.', 'active', true, current_user_id, current_user_id, 'Platform', 'Web Application', true, 'green', 'orange', 'orange'),
    ('Crypto Trading Bot', 'crypto-trading-bot', 'Automated cryptocurrency trading system', 'Advanced trading bot with machine learning algorithms for optimal crypto trading strategies.', 'active', false, current_user_id, current_user_id, 'Trading', 'Software', true, 'orange', 'green', 'red'),
    ('NFT Marketplace', 'nft-marketplace', 'Decentralized NFT trading platform', 'Full-featured NFT marketplace with minting, trading, and royalty management capabilities.', 'active', false, current_user_id, current_user_id, 'NFT', 'Web Application', false, 'red', 'orange', 'orange'),
    ('DeFi Yield Aggregator', 'defi-yield-aggregator', 'Multi-protocol yield farming optimizer', 'Smart contract system that automatically finds and compounds the best DeFi yields across multiple protocols.', 'active', true, current_user_id, current_user_id, 'DeFi', 'Smart Contract', true, 'green', 'green', 'orange'),
    ('Blockchain Analytics Dashboard', 'blockchain-analytics', 'Real-time blockchain data visualization', 'Comprehensive analytics platform for tracking blockchain metrics, transactions, and market data.', 'active', true, current_user_id, current_user_id, 'Analytics', 'Web Application', true, 'green', 'orange', 'green');

  -- Insert teams for the first two projects
  INSERT INTO teams (name, slug, description, is_public, created_by, project_id)
  VALUES 
    ('b0ase Core Team', 'b0ase-core', 'Main development team for the b0ase platform', false, current_user_id, (SELECT id FROM projects WHERE slug = 'b0ase-platform')),
    ('Trading Bot Specialists', 'trading-specialists', 'Specialized team for trading bot development', false, current_user_id, (SELECT id FROM projects WHERE slug = 'crypto-trading-bot'));

  RAISE NOTICE 'Successfully created 5 projects and 2 teams for user: %', user_email;
END $$; 