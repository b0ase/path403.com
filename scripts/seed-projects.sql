-- Seed script to populate projects with the user as creator
-- Replace 'your-user-uuid-here' with your actual auth.users UUID

-- First, let's check if we have any users to work with
-- You can get your user UUID by running: SELECT id, email FROM auth.users;

-- Example projects to seed (replace the created_by UUID with your actual UUID)
-- Your UUID: 738e36f8-a8ac-43f6-b8d2-4abac3e8d9d7

-- Insert sample projects
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
  '738e36f8-a8ac-43f6-b8d2-4abac3e8d9d7',
  '738e36f8-a8ac-43f6-b8d2-4abac3e8d9d7',
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
  'Automated cryptocurrency trading bot with multiple exchange support',
  'Advanced trading bot with backtesting, risk management, and real-time market analysis.',
  'active',
  true,
  '738e36f8-a8ac-43f6-b8d2-4abac3e8d9d7',
  '738e36f8-a8ac-43f6-b8d2-4abac3e8d9d7',
  'Trading',
  'Bot/Automation',
  true,
  'red',
  'green',
  'green'
),
(
  'NFT Marketplace',
  'nft-marketplace',
  'Decentralized NFT marketplace with custom smart contracts',
  'Full-featured NFT marketplace with minting, trading, and royalty management.',
  'active',
  false,
  '738e36f8-a8ac-43f6-b8d2-4abac3e8d9d7',
  '738e36f8-a8ac-43f6-b8d2-4abac3e8d9d7',
  'NFT',
  'Marketplace',
  true,
  'orange',
  'orange',
  'red'
),
(
  'DeFi Yield Aggregator',
  'defi-yield-aggregator',
  'Yield farming aggregator across multiple DeFi protocols',
  'Automated yield optimization across Uniswap, Compound, Aave, and other DeFi protocols.',
  'active',
  true,
  '738e36f8-a8ac-43f6-b8d2-4abac3e8d9d7',
  '738e36f8-a8ac-43f6-b8d2-4abac3e8d9d7',
  'DeFi',
  'Protocol',
  false,
  'green',
  'green',
  'orange'
),
(
  'Blockchain Analytics Dashboard',
  'blockchain-analytics',
  'Real-time blockchain analytics and monitoring dashboard',
  'Comprehensive analytics platform for tracking transactions, addresses, and network metrics.',
  'active',
  true,
  '738e36f8-a8ac-43f6-b8d2-4abac3e8d9d7',
  '738e36f8-a8ac-43f6-b8d2-4abac3e8d9d7',
  'Analytics',
  'Dashboard',
  false,
  'green',
  'green',
  'green'
);

-- Create some sample teams for these projects
INSERT INTO teams (
  name,
  slug,
  description,
  is_public,
  created_by,
  project_id,
  status,
  category
) VALUES
(
  'b0ase Core Team',
  'b0ase-core-team',
  'Main development team for the b0ase platform',
  false,
  '738e36f8-a8ac-43f6-b8d2-4abac3e8d9d7',
  (SELECT id FROM projects WHERE slug = 'b0ase-platform'),
  'active',
  'Development'
),
(
  'Crypto Bot Developers',
  'crypto-bot-team',
  'Specialized team for trading bot development',
  false,
  '738e36f8-a8ac-43f6-b8d2-4abac3e8d9d7',
  (SELECT id FROM projects WHERE slug = 'crypto-trading-bot'),
  'active',
  'Development'
);

-- Note: This script is ready to run with your UUID: 738e36f8-a8ac-43f6-b8d2-4abac3e8d9d7
-- Just run this script after applying the migration to seed your projects 