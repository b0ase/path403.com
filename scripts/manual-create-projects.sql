-- Insert actual projects from b0ase.com landing page
-- Using UUID: d742607e-ff89-4d49-acd0-37ff0d75f551

-- Domain Projects
INSERT INTO projects (
    title, 
    description, 
    status, 
    tech_stack, 
    live_url, 
    github_url, 
    created_by, 
    access_level
) VALUES 
-- TOP LINE PROJECTS
-- npgx.website
('npgx.website', 'Advanced NFT marketplace and gaming platform featuring Ninja Punk Girls with expanded universe and Web3 integrations.', 'Live', ARRAY['Next.js', 'TypeScript', 'Web3', 'NFT'], 'https://npgx.website', 'https://github.com/b0ase/npgx-website', 'd742607e-ff89-4d49-acd0-37ff0d75f551', 'public'),

-- marina3d.xyz
('marina3d.xyz', 'Cutting-edge 3D visualization and interactive experiences for the web.', 'Live', ARRAY['Next.js', 'TypeScript', 'Three.js', 'WebGL'], 'https://marina3d.xyz', 'https://github.com/b0ase/marina3d-xyz', 'd742607e-ff89-4d49-acd0-37ff0d75f551', 'public'),

-- AI Girlfriends
('AI Girlfriends', 'AI-powered companion platform featuring advanced conversational AI and personalized virtual relationships.', 'Live', ARRAY['AI', 'Machine Learning', 'Next.js', 'TypeScript', 'Natural Language Processing'], 'https://aigirlfriends.website/', 'https://github.com/b0ase/aigirlfriends', 'd742607e-ff89-4d49-acd0-37ff0d75f551', 'public'),

-- Ninja Punk Girls
('Ninja Punk Girls', 'A vibrant NFT marketplace showcasing unique digital art of cyberpunk female warriors.', 'Ltd Company', ARRAY[], 'https://ninjapunkgirls.com', 'https://github.com/b0ase/ninja-punk-girls', 'd742607e-ff89-4d49-acd0-37ff0d75f551', 'public'),

-- OTHER DOMAIN PROJECTS
-- Robust Engineering
('Robust Engineering', 'Industrial automation and embedded systems development company. Services include embedded systems development, industrial automation solutions, and professional electrical engineering consultancy.', 'active', ARRAY['Embedded Systems', 'Industrial Automation', 'Next.js', 'TypeScript', 'React'], 'https://robust-ae.com/', 'https://github.com/b0ase/robust-ae', 'd742607e-ff89-4d49-acd0-37ff0d75f551', 'public'),

-- HyperFlix
('HyperFlix', 'Innovative memecoin marketing platform specializing in viral TikTok campaigns and social engagement.', 'B2C', ARRAY['TikTok', 'Social Media', 'Crypto'], 'https://hyper-flix.com', 'https://github.com/b0ase/hyperflix', 'd742607e-ff89-4d49-acd0-37ff0d75f551', 'public'),

-- Tribify AI
('Tribify AI', 'AI-powered community platform that connects like-minded individuals through shared interests.', 'SaaS', ARRAY[], 'https://tribify.ai', 'https://github.com/b0ase/tribify-ai', 'd742607e-ff89-4d49-acd0-37ff0d75f551', 'public'),

-- AI Tribes
('AI Tribes', 'Dynamic social network where AI agents and humans collaborate to create unique digital experiences.', 'Platform', ARRAY[], 'https://aitribes.online', 'https://github.com/b0ase/ai-tribes', 'd742607e-ff89-4d49-acd0-37ff0d75f551', 'public'),

-- Lilith Tattoo Studio
('Lilith Tattoo Studio', 'Elegant portfolio showcase for a renowned tattoo artist specializing in dark art and mystical designs.', 'Service', ARRAY[], 'https://lilithtattoo.com', 'https://github.com/b0ase/lilith-tattoo-studio', 'd742607e-ff89-4d49-acd0-37ff0d75f551', 'public'),

-- MetaGraph
('MetaGraph', 'Innovative data visualization tool that transforms complex relationships into interactive 3D networks.', 'App', ARRAY[], 'https://metagraph.app', 'https://github.com/b0ase/metagraph', 'd742607e-ff89-4d49-acd0-37ff0d75f551', 'public'),

-- FLOOP!
('FLOOP!', 'A wallet with a token that acts like a dividend-bearing share.', 'Wallet', ARRAY['React', 'Node.js', 'Solidity'], 'https://floop.online', 'https://github.com/b0ase/floop', 'd742607e-ff89-4d49-acd0-37ff0d75f551', 'public'),

-- DNS DEX
('DNS DEX', 'Decentralized domain name exchange platform revolutionizing how web addresses are traded.', 'Platform', ARRAY[], 'https://dns-dex.com', 'https://github.com/b0ase/dns-dex', 'd742607e-ff89-4d49-acd0-37ff0d75f551', 'public'),

-- Tribes Wallet
('Tribes Wallet', 'Secure multi-chain cryptocurrency wallet designed for community-driven token ecosystems.', 'App', ARRAY[], 'https://tribeswallet.com', 'https://github.com/b0ase/tribes-wallet', 'd742607e-ff89-4d49-acd0-37ff0d75f551', 'public'),

-- Penny Pics
('Penny Pics', 'Micro-payment based image marketplace where photographers earn per view.', 'E-commerce', ARRAY[], 'https://pennypics.store', 'https://github.com/b0ase/penny-pics', 'd742607e-ff89-4d49-acd0-37ff0d75f551', 'public'),

-- Miss Void
('Miss Void', 'Avant-garde fashion boutique featuring cyberpunk and dystopian-inspired clothing.', 'E-commerce', ARRAY[], 'https://missvoid.store', 'https://github.com/b0ase/miss-void', 'd742607e-ff89-4d49-acd0-37ff0d75f551', 'public'),

-- Interior Design Pro
('Interior Design Pro', 'Virtual interior design consultation platform with AI-powered room visualization.', 'Service', ARRAY[], 'https://interiordesigns.website', 'https://github.com/b0ase/interior-design-pro', 'd742607e-ff89-4d49-acd0-37ff0d75f551', 'public'),

-- Mikrocosm
('Mikrocosm', 'A collection of creative coding projects, physical computing experiments, and audio-visual explorations. Projects include drum machine emulators, I Ching turntables, and space-time visualizations.', 'active', ARRAY['Creative Coding', 'Max', 'OpenFrameworks', 'Processing', 'Physical Computing'], 'https://mikrocosm2.vercel.app/', '#', 'd742607e-ff89-4d49-acd0-37ff0d75f551', 'public'),

-- V01D Store
('V01D Store', 'Minimalist streetwear brand featuring bold black and white prints and urban aesthetics. Fashion for the digitally native with a "less is more" philosophy that embraces the void.', 'active', ARRAY['E-commerce', 'Next.js', 'Shopify', 'React', 'TypeScript'], 'https://www.v01d.store/', '#', 'd742607e-ff89-4d49-acd0-37ff0d75f551', 'public'),

-- CoffeeGuy Store
('CoffeeGuy Store', 'E-commerce platform for a specialty coffee brand, built with a modern frontend stack.', 'Live', ARRAY['E-commerce', 'Next.js', 'Shopify', 'React'], 'https://www.coffeeguy-commerce.store/', '#', 'd742607e-ff89-4d49-acd0-37ff0d75f551', 'public'),

-- Senseii
('Senseii', 'AI-powered Bitcoin education platform featuring Satoshi AI teacher, wallet-based authentication, and micropayment learning. Focuses on original Bitcoin SV vision with IP tokenization and business incubation tools.', 'active', ARRAY['AI', 'Bitcoin SV', 'Next.js', 'TypeScript', 'Blockchain', 'Micropayments'], 'https://senseii-zeta.vercel.app/', '#', 'd742607e-ff89-4d49-acd0-37ff0d75f551', 'public'),

-- Solana ETF Meme
('Solana ETF Meme', 'A meme project related to the Solana ETF. This project is a placeholder and does not have a specific description.', 'active', ARRAY['Meme', 'Solana'], 'https://solana-etf-meme.com', '#', 'd742607e-ff89-4d49-acd0-37ff0d75f551', 'public'),

-- Vex Void
('Vex Void', 'Creative digital agency specializing in dark aesthetic web design, branding, and interactive experiences. Focuses on avant-garde visual storytelling and immersive user interfaces.', 'active', ARRAY['Next.js', 'TypeScript', 'React', 'Three.js', 'WebGL', 'GSAP'], 'https://vexvoid.com/', '#', 'd742607e-ff89-4d49-acd0-37ff0d75f551', 'public'),

-- AI Builders Club
('AI Builders Club', 'Community platform for AI builders and developers to collaborate, share projects, and build the future of artificial intelligence together.', 'Live', ARRAY['AI', 'Community', 'Next.js', 'TypeScript', 'React'], 'https://aibuildersclub.website/', '#', 'd742607e-ff89-4d49-acd0-37ff0d75f551', 'public'),

-- Beauty Queen AI
('Beauty Queen AI', 'AI-powered companion platform featuring advanced conversational AI and personalized virtual relationships.', 'Live', ARRAY['AI', 'Machine Learning', 'Next.js', 'TypeScript', 'Natural Language Processing'], 'https://beauty-queen-ai.com', '#', 'd742607e-ff89-4d49-acd0-37ff0d75f551', 'public');

-- GitHub Projects
INSERT INTO projects (
    title, 
    description, 
    status, 
    tech_stack, 
    live_url, 
    github_url, 
    created_by, 
    access_level
) VALUES 
-- Repository Tokenization
('Repository Tokenization', 'Revolutionary proposal to transform GitHub''s green "Create repository" button into a gateway for equity distribution. Turn every software project into tradeable equity shares and tap into the $100 trillion stablecoin economy.', 'Live', ARRAY['Blockchain', 'Next.js', 'TypeScript', 'Smart Contracts', 'Tokenization', 'Multi-Blockchain'], 'https://tokeniser.vercel.app/', 'https://github.com/b0ase/tokeniser', 'd742607e-ff89-4d49-acd0-37ff0d75f551', 'public'),

-- V3XV0ID AV Client
('V3XV0ID AV Client', 'Cutting-edge dual-palette crossfading image and video animator with cyber aesthetic branding. Professional VJ/DJ-style tool for live performers and visual artists.', 'Live', ARRAY['Electron', 'JavaScript', 'WebGL', 'Video Processing', 'Real-time Graphics'], 'https://b0ase.github.io/vexvoid-AV-client/', 'https://github.com/b0ase/vexvoid-AV-client', 'd742607e-ff89-4d49-acd0-37ff0d75f551', 'public'),

-- WebsiteStrategy Pro
('WebsiteStrategy Pro', 'Get the exact 7-step framework that built 500+ profitable websites. Complete strategy workshop turning websites into customer-generating machines with proven methodology used for $10,000+ projects.', 'Live', ARRAY['Marketing', 'Next.js', 'TypeScript', 'Conversion Optimization', 'Lead Generation'], 'https://websitestrategypro2025.vercel.app/', '#', 'd742607e-ff89-4d49-acd0-37ff0d75f551', 'public'),

-- Future of Blockchain Research
('Future of Blockchain Research', 'Open research initiative examining blockchain network evolution, convergence theory, and the economic forces driving architectural decisions. Exploring PoS vs PoW models and efficiency pressures.', 'active', ARRAY['Research', 'Next.js', 'TypeScript', 'Data Analysis', 'Economic Modeling'], 'https://future-of-blockchain.vercel.app/', '#', 'd742607e-ff89-4d49-acd0-37ff0d75f551', 'public'),

-- BitDNS
('BitDNS', 'Decentralized domain name system implementation leveraging blockchain technology for censorship-resistant and distributed DNS resolution.', 'active', ARRAY['Bitcoin Script', 'DNS', 'Blockchain', 'TypeScript'], 'https://bitdns.website', '#', 'd742607e-ff89-4d49-acd0-37ff0d75f551', 'public'),

-- BitCDN
('BitCDN', 'Blockchain-based content delivery network providing decentralized, efficient, and censorship-resistant content distribution infrastructure.', 'active', ARRAY['CDN', 'Blockchain', 'BitTorrent', 'TypeScript'], 'https://bitcdn.website', '#', 'd742607e-ff89-4d49-acd0-37ff0d75f551', 'public'),

-- AIOSX
('AIOSX', 'Fork of AIOS: LLM Agent Operating System. Exploring potential applications.', 'Exploration', ARRAY['Python'], NULL, 'https://github.com/b0ase/AIOSX', 'd742607e-ff89-4d49-acd0-37ff0d75f551', 'public'),

-- bitcoin (Fork)
('bitcoin (Fork)', 'Fork of Bitcoin Core integration/staging tree. For study and potential integration.', 'Study', ARRAY['TypeScript'], NULL, 'https://github.com/b0ase/bitcoin', 'd742607e-ff89-4d49-acd0-37ff0d75f551', 'public'),

-- Ninja Punk Girls (GitHub)
('Ninja Punk Girls (GitHub)', 'Public Go project. Purpose and potential to be defined.', 'Concept', ARRAY['Go'], 'https://ninjapunkgirls.com', 'https://github.com/b0ase/npgpublic', 'd742607e-ff89-4d49-acd0-37ff0d75f551', 'public'),

-- Penshun
('Penshun', 'Fork of simply-stream: Lock to Stream Bitcoin. Investigating streaming payment models.', 'Investigation', ARRAY['JavaScript'], NULL, 'https://github.com/b0ase/Penshun', 'd742607e-ff89-4d49-acd0-37ff0d75f551', 'public'),

-- Weight
('Weight', 'Fork of hodlocker: Lock Bitcoins to Social Posts. Experimenting with social/economic weighting.', 'Experiment', ARRAY['TypeScript'], NULL, 'https://github.com/b0ase/Weight', 'd742607e-ff89-4d49-acd0-37ff0d75f551', 'public'),

-- YourCash
('YourCash', 'Fork of Yours Wallet: Yours/HandCash Integration exploration.', 'Archived/Study', ARRAY['JavaScript'], NULL, 'https://github.com/b0ase/YourCash', 'd742607e-ff89-4d49-acd0-37ff0d75f551', 'public'),

-- Index Token
('Index Token', 'Concept and development for an index-based token system.', 'Development', ARRAY['Solidity', 'TypeScript'], NULL, 'https://github.com/b0ase/index-token', 'd742607e-ff89-4d49-acd0-37ff0d75f551', 'public');

-- Create teams for major project categories
INSERT INTO teams (name, description, created_by) VALUES 
('Web3 & Blockchain', 'Team focused on blockchain, crypto, and Web3 projects including wallets, DEX platforms, and tokenization systems', 'd742607e-ff89-4d49-acd0-37ff0d75f551'),
('AI & Machine Learning', 'Team developing AI-powered applications, companions, and educational platforms', 'd742607e-ff89-4d49-acd0-37ff0d75f551'),
('Creative & Digital Art', 'Team working on NFT marketplaces, creative coding, and visual art projects', 'd742607e-ff89-4d49-acd0-37ff0d75f551'),
('E-commerce & Business', 'Team handling online stores, business platforms, and commercial applications', 'd742607e-ff89-4d49-acd0-37ff0d75f551'),
('Research & Development', 'Team conducting blockchain research and experimental technology projects', 'd742607e-ff89-4d49-acd0-37ff0d75f551');

-- Add yourself as team lead for all teams
INSERT INTO user_project_memberships (user_id, project_id, role, team_id)
SELECT 'd742607e-ff89-4d49-acd0-37ff0d75f551', p.id, 'lead', 
  CASE 
    WHEN p.title IN ('FLOOP!', 'DNS DEX', 'Tribes Wallet', 'Repository Tokenization', 'BitDNS', 'BitCDN', 'bitcoin (Fork)', 'Penshun', 'Weight', 'YourCash', 'Index Token', 'Senseii', 'Solana ETF Meme') THEN (SELECT id FROM teams WHERE name = 'Web3 & Blockchain' LIMIT 1)
    WHEN p.title IN ('AI Tribes', 'Tribify AI', 'AI Builders Club', 'Beauty Queen AI', 'AI Girlfriends', 'AIOSX') THEN (SELECT id FROM teams WHERE name = 'AI & Machine Learning' LIMIT 1)
    WHEN p.title IN ('Ninja Punk Girls', 'Ninja Punk Girls (GitHub)', 'npgx.website', 'MetaGraph', 'Mikrocosm', 'V3XV0ID AV Client', 'Vex Void') THEN (SELECT id FROM teams WHERE name = 'Creative & Digital Art' LIMIT 1)
    WHEN p.title IN ('Miss Void', 'V01D Store', 'CoffeeGuy Store', 'Penny Pics', 'HyperFlix', 'Interior Design Pro', 'WebsiteStrategy Pro') THEN (SELECT id FROM teams WHERE name = 'E-commerce & Business' LIMIT 1)
    WHEN p.title IN ('Future of Blockchain Research', 'Robust Engineering', 'marina3d.xyz', 'Lilith Tattoo Studio') THEN (SELECT id FROM teams WHERE name = 'Research & Development' LIMIT 1)
    ELSE (SELECT id FROM teams WHERE name = 'Research & Development' LIMIT 1)
  END
FROM projects p
WHERE p.created_by = 'd742607e-ff89-4d49-acd0-37ff0d75f551';

-- Display summary
SELECT 
  'Projects created: ' || COUNT(*) as summary
FROM projects 
WHERE created_by = 'd742607e-ff89-4d49-acd0-37ff0d75f551';

SELECT 
  'Teams created: ' || COUNT(*) as summary
FROM teams 
WHERE created_by = 'd742607e-ff89-4d49-acd0-37ff0d75f551';