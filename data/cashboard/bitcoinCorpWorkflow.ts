import { WorkflowState } from '../../app/cashboard/types'

/**
 * Bitcoin Corporation - Complete Organizational Structure
 * 10% zoom overview with expandable node groups
 * ~175+ nodes covering all products, tools, infrastructure, and revenue streams
 */
export const getBitcoinCorpWorkflow = (): WorkflowState => ({
    id: 'bitcoin-corp-org',
    name: 'The Bitcoin Corporation',
    description: 'Complete ecosystem of Bitcoin-native applications with token economies.',
    initialZoom: 0.1,
    nodes: [
        // ═══════════════════════════════════════════════════════════════════
        // LAYER 0: GOVERNANCE (y: 0-200)
        // ═══════════════════════════════════════════════════════════════════
        { id: 'ceo', name: 'CEO', type: 'role', x: 1500, y: 0, status: 'active', description: 'Executive leadership.', connections: [], metadata: { isGroupHeader: true } },
        { id: 'board', name: 'Board of Directors', type: 'team', x: 1200, y: 150, status: 'active', description: 'Multisig governance.', connections: [] },
        { id: 'advisors', name: 'Advisory Board', type: 'team', x: 1800, y: 150, status: 'active', description: 'Strategic advisors.', connections: [] },
        { id: 'legal', name: 'Legal & Compliance', type: 'organization', x: 900, y: 150, status: 'active', description: 'Regulatory compliance.', connections: [] },
        { id: 'finance', name: 'Finance & Treasury', type: 'organization', x: 2100, y: 150, status: 'active', description: 'Capital management.', connections: [] },

        // ═══════════════════════════════════════════════════════════════════
        // LAYER 1: CORE PRODUCTS (y: 350-500) - 6 Main Products
        // ═══════════════════════════════════════════════════════════════════
        { id: 'bitcoin-os', name: 'Bitcoin OS', type: 'workflow', x: 0, y: 400, status: 'active', description: '$bOS - Web OS with wallet, app store, dev env.', connections: [], metadata: { childWorkflowId: 'bitcoin-os-workflow', token: '$bOS', isCollapsible: true, childCount: 8 } },
        { id: 'bitcoin-apps-store', name: 'Bitcoin Apps Store', type: 'workflow', x: 600, y: 400, status: 'active', description: '$bApps - Marketplace for 30+ apps.', connections: [], metadata: { childWorkflowId: 'bitcoin-apps-workflow', token: '$bApps', isCollapsible: true, childCount: 30 } },
        { id: 'bitcoin-exchange', name: 'Bitcoin Exchange', type: 'workflow', x: 1200, y: 400, status: 'active', description: '$bExchange - DEX for BSV tokens.', connections: [], metadata: { childWorkflowId: 'bitcoin-exchange-workflow', token: '$bExchange', isCollapsible: true, childCount: 12 } },
        { id: 'bitcoin-wallet', name: 'Bitcoin Wallet', type: 'workflow', x: 1800, y: 400, status: 'active', description: '$bWallet - Token management & BiFi.', connections: [], metadata: { token: '$bWallet', isCollapsible: true, childCount: 6 } },
        { id: 'senseii', name: 'Senseii', type: 'workflow', x: 2400, y: 400, status: 'active', description: '$SENSEII - AI educational platform.', connections: [], metadata: { token: '$SENSEII', isCollapsible: true, childCount: 5 } },
        { id: 'cashboard', name: 'Cashboard', type: 'workflow', x: 3000, y: 400, status: 'active', description: '$CASH - On-chain business management.', connections: [], metadata: { token: '$CASH', isCollapsible: true, childCount: 15 } },

        // ═══════════════════════════════════════════════════════════════════
        // LAYER 2: PRODUCTIVITY APPS (y: 650-800)
        // ═══════════════════════════════════════════════════════════════════
        { id: 'bitcoin-writer', name: 'Bitcoin Writer', type: 'workflow', x: 0, y: 700, status: 'active', description: '$bWriter - Blockchain writing platform.', connections: [], metadata: { childWorkflowId: 'bitcoin-writer-workflow', token: '$bWriter', isCollapsible: true, childCount: 16 } },
        { id: 'bitcoin-drive', name: 'Bitcoin Drive', type: 'workflow', x: 400, y: 700, status: 'active', description: '$bDrive - Decentralized storage.', connections: [], metadata: { childWorkflowId: 'bitcoin-drive-workflow', token: '$bDrive', isCollapsible: true, childCount: 8 } },
        { id: 'bitcoin-sheets', name: 'Bitcoin Sheets', type: 'workflow', x: 800, y: 700, status: 'active', description: '$bSheets - On-chain spreadsheets.', connections: [], metadata: { token: '$bSheets' } },
        { id: 'bitcoin-calendar', name: 'Bitcoin Calendar', type: 'workflow', x: 1200, y: 700, status: 'active', description: '$bCalendar - Scheduling with micropayments.', connections: [], metadata: { token: '$bCalendar' } },
        { id: 'bitcoin-books', name: 'Bitcoin Books', type: 'workflow', x: 1600, y: 700, status: 'active', description: '$bBooks - Publishing platform.', connections: [], metadata: { token: '$bBooks' } },
        { id: 'bitcoin-code', name: 'Bitcoin Code', type: 'workflow', x: 2000, y: 700, status: 'active', description: '$bCode - On-chain IDE.', connections: [], metadata: { token: '$bCode' } },

        // ═══════════════════════════════════════════════════════════════════
        // LAYER 3: COMMUNICATION APPS (y: 950-1100)
        // ═══════════════════════════════════════════════════════════════════
        { id: 'bitcoin-email', name: 'Bitcoin Email', type: 'workflow', x: 0, y: 1000, status: 'active', description: '$bMail - Identity-based messaging.', connections: [], metadata: { childWorkflowId: 'bitcoin-email-workflow', token: '$bMail', isCollapsible: true, childCount: 8 } },
        { id: 'bitcoin-chat', name: 'Bitcoin Chat', type: 'workflow', x: 400, y: 1000, status: 'active', description: '$bChat - Encrypted messaging.', connections: [], metadata: { token: '$bChat' } },
        { id: 'bitcoin-social', name: 'Bitcoin Social', type: 'workflow', x: 800, y: 1000, status: 'active', description: '$bSocial - Decentralized social.', connections: [], metadata: { token: '$bSocial' } },
        { id: 'bitcoin-video', name: 'Bitcoin Video', type: 'workflow', x: 1200, y: 1000, status: 'active', description: '$bVideo - Video with micropayments.', connections: [], metadata: { token: '$bVideo' } },
        { id: 'bitcoin-music', name: 'Bitcoin Music', type: 'workflow', x: 1600, y: 1000, status: 'active', description: '$bMusic - Streaming with royalties.', connections: [], metadata: { token: '$bMusic' } },
        { id: 'bitcoin-radio', name: 'Bitcoin Radio', type: 'workflow', x: 2000, y: 1000, status: 'active', description: '$bRadio - Decentralized radio.', connections: [], metadata: { token: '$bRadio' } },

        // ═══════════════════════════════════════════════════════════════════
        // LAYER 4: CREATIVE & MEDIA APPS (y: 1250-1400)
        // ═══════════════════════════════════════════════════════════════════
        { id: 'bitcoin-paint', name: 'Bitcoin Paint', type: 'workflow', x: 0, y: 1300, status: 'active', description: '$bPaint - Digital art creation.', connections: [], metadata: { token: '$bPaint' } },
        { id: 'bitcoin-photos', name: 'Bitcoin Photos', type: 'workflow', x: 400, y: 1300, status: 'active', description: '$bPhotos - Photo storage & NFTs.', connections: [], metadata: { token: '$bPhotos' } },
        { id: 'bitcoin-3d', name: 'Bitcoin 3D', type: 'workflow', x: 800, y: 1300, status: 'active', description: '$b3D - 3D modeling tools.', connections: [], metadata: { token: '$b3D' } },
        { id: 'bitcoin-art', name: 'Bitcoin Art', type: 'workflow', x: 1200, y: 1300, status: 'active', description: '$bArt - Art marketplace.', connections: [], metadata: { token: '$bArt' } },
        { id: 'bitcoin-gaming', name: 'Bitcoin Gaming', type: 'workflow', x: 1600, y: 1300, status: 'active', description: '$bGaming - Play-to-earn.', connections: [], metadata: { token: '$bGaming' } },
        { id: 'bitcoin-ai', name: 'Bitcoin AI', type: 'workflow', x: 2000, y: 1300, status: 'active', description: '$bAI - AI services.', connections: [], metadata: { token: '$bAI' } },

        // ═══════════════════════════════════════════════════════════════════
        // LAYER 5: INFRASTRUCTURE (y: 1550-1700)
        // ═══════════════════════════════════════════════════════════════════
        { id: 'bitcoin-identity', name: 'Bitcoin Identity', type: 'workflow', x: 0, y: 1600, status: 'active', description: '$bID - Decentralized identity.', connections: [], metadata: { token: '$bID' } },
        { id: 'bitcoin-dns', name: 'Bitcoin DNS', type: 'workflow', x: 400, y: 1600, status: 'active', description: '$bDNS - On-chain domains.', connections: [], metadata: { token: '$bDNS' } },
        { id: 'bitcoin-search', name: 'Bitcoin Search', type: 'workflow', x: 800, y: 1600, status: 'active', description: '$bSearch - Decentralized search.', connections: [], metadata: { token: '$bSearch' } },
        { id: 'bitcoin-browser', name: 'Bitcoin Browser', type: 'workflow', x: 1200, y: 1600, status: 'active', description: '$bBrowser - Web3 browser.', connections: [], metadata: { token: '$bBrowser' } },
        { id: 'bitcoin-maps', name: 'Bitcoin Maps', type: 'workflow', x: 1600, y: 1600, status: 'active', description: '$bMaps - Location services.', connections: [], metadata: { token: '$bMaps' } },
        { id: 'bitcoin-education', name: 'Bitcoin Education', type: 'workflow', x: 2000, y: 1600, status: 'active', description: '$bEdu - Learning platform.', connections: [], metadata: { token: '$bEdu' } },

        // ═══════════════════════════════════════════════════════════════════
        // LAYER 6: COMMERCE & PROFESSIONAL (y: 1850-2000)
        // ═══════════════════════════════════════════════════════════════════
        { id: 'bitcoin-jobs', name: 'Bitcoin Jobs', type: 'workflow', x: 0, y: 1900, status: 'active', description: '$bJobs - Freelance marketplace.', connections: [], metadata: { token: '$bJobs' } },
        { id: 'bitcoin-marketplace', name: 'Bitcoin Marketplace', type: 'workflow', x: 400, y: 1900, status: 'active', description: '$bMarket - E-commerce.', connections: [], metadata: { token: '$bMarket' } },
        { id: 'bitcoin-contracts', name: 'Bitcoin Contracts', type: 'workflow', x: 800, y: 1900, status: 'active', description: 'Smart contract platform.', connections: [] },
        { id: 'bitcoin-crm', name: 'Bitcoin CRM', type: 'workflow', x: 1200, y: 1900, status: 'active', description: 'Customer management.', connections: [] },
        { id: 'bitcoin-cms', name: 'Bitcoin CMS', type: 'workflow', x: 1600, y: 1900, status: 'active', description: 'Content management.', connections: [] },
        { id: 'bitcoin-todo', name: 'Bitcoin Todo', type: 'workflow', x: 2000, y: 1900, status: 'active', description: 'Task management.', connections: [] },

        // ═══════════════════════════════════════════════════════════════════
        // LAYER 7: b0ase TOOLS (y: 2150-2450) - Right side expansion
        // ═══════════════════════════════════════════════════════════════════
        { id: 'b0ase-tools-header', name: 'b0ase Tools', type: 'organization', x: 2600, y: 700, status: 'active', description: 'Built by b0ase.com', connections: [], metadata: { isGroupHeader: true, isCollapsible: true, childCount: 22 } },

        // Video & Media Tools
        { id: 'video-generator', name: 'Video Generator', type: 'api', x: 2600, y: 850, status: 'active', description: 'AI video generation.', connections: [] },
        { id: 'video-studio', name: 'Video Studio', type: 'api', x: 2900, y: 850, status: 'active', description: 'Professional editor.', connections: [] },
        { id: 'chaos-mixer', name: 'Chaos Mixer', type: 'api', x: 3200, y: 850, status: 'active', description: 'Glitch effects.', connections: [] },
        { id: 'video-course-maker', name: 'Video Course', type: 'api', x: 3500, y: 850, status: 'active', description: 'Course production.', connections: [] },

        // Blockchain Tools
        { id: 'tx-broadcaster', name: 'TX Broadcaster', type: 'api', x: 2600, y: 1000, status: 'active', description: 'Push raw transactions.', connections: [] },
        { id: 'file-hash', name: 'File Hash', type: 'api', x: 2900, y: 1000, status: 'active', description: 'Hash & inscribe.', connections: [] },
        { id: 'bsv-scripts', name: 'BSV Scripts', type: 'api', x: 3200, y: 1000, status: 'active', description: 'Smart contract templates.', connections: [] },
        { id: 'bit-sign', name: 'BitSign', type: 'api', x: 3500, y: 1000, status: 'active', description: 'Document signing.', connections: [] },

        // Token Tools
        { id: 'money-buttons', name: 'Money Buttons', type: 'api', x: 2600, y: 1150, status: 'active', description: 'Token minting.', connections: [] },
        { id: 'bit-certificates', name: 'Bit Certificates', type: 'api', x: 2900, y: 1150, status: 'active', description: 'Share certificates.', connections: [] },
        { id: 'registry', name: 'Registry', type: 'database', x: 3200, y: 1150, status: 'active', description: 'Entity registration.', connections: [] },
        { id: 'mint', name: 'Mint', type: 'api', x: 3500, y: 1150, status: 'active', description: 'Token creation.', connections: [] },

        // Business Tools
        { id: 'cap-table', name: 'Cap Table', type: 'api', x: 2600, y: 1300, status: 'active', description: 'Ownership tracking.', connections: [] },
        { id: 'dividends-tool', name: 'Dividends', type: 'api', x: 2900, y: 1300, status: 'active', description: 'Distribution engine.', connections: [] },
        { id: 'kyc-verify', name: 'KYC Verify', type: 'api', x: 3200, y: 1300, status: 'active', description: 'Identity verification.', connections: [] },
        { id: 'transfers', name: 'Transfers', type: 'api', x: 3500, y: 1300, status: 'active', description: 'Token transfers.', connections: [] },

        // Automation Tools
        { id: 'scada', name: 'SCADA', type: 'api', x: 2600, y: 1450, status: 'active', description: 'Industrial control.', connections: [] },
        { id: 'scrollpay', name: 'ScrollPay', type: 'api', x: 2900, y: 1450, status: 'active', description: 'Pay-to-scroll.', connections: [] },
        { id: 'auto-book', name: 'Auto-Book', type: 'api', x: 3200, y: 1450, status: 'active', description: 'Book generator.', connections: [] },
        { id: 'graphic-designer', name: 'Graphic Designer', type: 'api', x: 3500, y: 1450, status: 'active', description: 'OG image creator.', connections: [] },
        { id: 'id-tokeniser', name: 'ID Tokeniser', type: 'api', x: 2600, y: 1600, status: 'active', description: 'Identity tokens.', connections: [] },
        { id: 'cartographer', name: 'Cartographer', type: 'api', x: 2900, y: 1600, status: 'active', description: 'Site mapping.', connections: [] },

        // ═══════════════════════════════════════════════════════════════════
        // LAYER 8: PROTOCOLS & INFRASTRUCTURE (y: 2200-2500) - Left side
        // ═══════════════════════════════════════════════════════════════════
        { id: 'protocols-header', name: 'Storage Protocols', type: 'database', x: -600, y: 700, status: 'active', description: 'Blockchain storage layer.', connections: [], metadata: { isGroupHeader: true } },
        { id: 'b-protocol', name: 'B:// Protocol', type: 'database', x: -600, y: 850, status: 'active', description: 'Direct file storage.', connections: [] },
        { id: 'bcat-protocol', name: 'BCAT Protocol', type: 'database', x: -600, y: 1000, status: 'active', description: 'Large file chunking.', connections: [] },
        { id: 'd-protocol', name: 'D:// Protocol', type: 'database', x: -600, y: 1150, status: 'active', description: 'Dynamic references.', connections: [] },
        { id: 'uhrp', name: 'UHRP', type: 'database', x: -600, y: 1300, status: 'active', description: 'Universal hash resolution.', connections: [] },
        { id: 'run-protocol', name: 'Run Protocol', type: 'database', x: -600, y: 1450, status: 'active', description: 'Token protocol.', connections: [] },
        { id: 'ordinals', name: 'Ordinals', type: 'database', x: -600, y: 1600, status: 'active', description: 'NFT inscriptions.', connections: [] },

        // ═══════════════════════════════════════════════════════════════════
        // LAYER 9: AUTHENTICATION & SERVICES (y: 2200-2500) - Left side lower
        // ═══════════════════════════════════════════════════════════════════
        { id: 'auth-header', name: 'Auth Services', type: 'integration', x: -300, y: 700, status: 'active', description: 'Authentication providers.', connections: [], metadata: { isGroupHeader: true } },
        { id: 'handcash-auth', name: 'HandCash', type: 'integration', x: -300, y: 850, status: 'active', description: 'Wallet OAuth.', connections: [] },
        { id: 'supabase-auth', name: 'Supabase', type: 'integration', x: -300, y: 1000, status: 'active', description: 'Database & auth.', connections: [] },
        { id: 'github-auth', name: 'GitHub', type: 'integration', x: -300, y: 1150, status: 'active', description: 'Developer auth.', connections: [] },
        { id: 'twitter-auth', name: 'Twitter', type: 'integration', x: -300, y: 1300, status: 'active', description: 'Social auth.', connections: [] },
        { id: 'stripe-service', name: 'Stripe', type: 'integration', x: -300, y: 1450, status: 'active', description: 'Fiat payments.', connections: [] },
        { id: 'gemini-ai', name: 'Gemini AI', type: 'ai-agent', x: -300, y: 1600, status: 'active', description: 'AI services.', connections: [] },

        // ═══════════════════════════════════════════════════════════════════
        // LAYER 10: SMART CONTRACTS (y: 700-1100) - Far right
        // ═══════════════════════════════════════════════════════════════════
        { id: 'contracts-header', name: 'sCrypt Contracts', type: 'contract', x: 3800, y: 700, status: 'active', description: 'Smart contract templates.', connections: [], metadata: { isGroupHeader: true } },
        { id: 'scrypt-multisig', name: 'Multisig', type: 'contract', x: 3800, y: 850, status: 'active', description: 'Multi-signature.', connections: [] },
        { id: 'scrypt-escrow', name: 'Escrow', type: 'contract', x: 3800, y: 1000, status: 'active', description: 'Escrow contracts.', connections: [] },
        { id: 'scrypt-token', name: 'Token', type: 'contract', x: 3800, y: 1150, status: 'active', description: 'Token contracts.', connections: [] },
        { id: 'scrypt-auction', name: 'Auction', type: 'contract', x: 3800, y: 1300, status: 'active', description: 'Auction mechanics.', connections: [] },
        { id: 'scrypt-oracle', name: 'Oracle', type: 'contract', x: 3800, y: 1450, status: 'active', description: 'Data oracles.', connections: [] },
        { id: 'scrypt-voting', name: 'Voting', type: 'contract', x: 3800, y: 1600, status: 'active', description: 'Governance voting.', connections: [] },
        { id: 'scrypt-timelock', name: 'Timelock', type: 'contract', x: 4100, y: 850, status: 'active', description: 'Time-locked funds.', connections: [] },
        { id: 'scrypt-nft', name: 'NFT', type: 'contract', x: 4100, y: 1000, status: 'active', description: 'NFT contracts.', connections: [] },
        { id: 'scrypt-crowdfund', name: 'Crowdfund', type: 'contract', x: 4100, y: 1150, status: 'active', description: 'Crowdfunding.', connections: [] },
        { id: 'scrypt-subscription', name: 'Subscription', type: 'contract', x: 4100, y: 1300, status: 'active', description: 'Recurring payments.', connections: [] },
        { id: 'scrypt-vesting', name: 'Vesting', type: 'contract', x: 4100, y: 1450, status: 'active', description: 'Token vesting.', connections: [] },

        // ═══════════════════════════════════════════════════════════════════
        // LAYER 11: TOKEN ECONOMY (y: 2200-2400) - Bottom center
        // ═══════════════════════════════════════════════════════════════════
        { id: 'token-economy-header', name: 'Token Economy', type: 'instrument', x: 1200, y: 2200, status: 'active', description: 'All 30+ app tokens.', connections: [], metadata: { isGroupHeader: true } },

        // Revenue tokens
        { id: 'token-bos', name: '$bOS', type: 'instrument', x: 600, y: 2350, status: 'active', description: 'Operating system.', connections: [] },
        { id: 'token-bapps', name: '$bApps', type: 'instrument', x: 800, y: 2350, status: 'active', description: 'App store.', connections: [] },
        { id: 'token-bexchange', name: '$bExchange', type: 'instrument', x: 1000, y: 2350, status: 'active', description: 'Exchange.', connections: [] },
        { id: 'token-bwallet', name: '$bWallet', type: 'instrument', x: 1200, y: 2350, status: 'active', description: 'Wallet.', connections: [] },
        { id: 'token-senseii', name: '$SENSEII', type: 'instrument', x: 1400, y: 2350, status: 'active', description: 'Education.', connections: [] },
        { id: 'token-cash', name: '$CASH', type: 'instrument', x: 1600, y: 2350, status: 'active', description: 'Business mgmt.', connections: [] },
        { id: 'token-bwriter', name: '$bWriter', type: 'instrument', x: 1800, y: 2350, status: 'active', description: 'Writing.', connections: [] },
        { id: 'token-bdrive', name: '$bDrive', type: 'instrument', x: 600, y: 2500, status: 'active', description: 'Storage.', connections: [] },
        { id: 'token-bmail', name: '$bMail', type: 'instrument', x: 800, y: 2500, status: 'active', description: 'Email.', connections: [] },
        { id: 'token-bmusic', name: '$bMusic', type: 'instrument', x: 1000, y: 2500, status: 'active', description: 'Music.', connections: [] },
        { id: 'token-bvideo', name: '$bVideo', type: 'instrument', x: 1200, y: 2500, status: 'active', description: 'Video.', connections: [] },
        { id: 'token-bgaming', name: '$bGaming', type: 'instrument', x: 1400, y: 2500, status: 'active', description: 'Gaming.', connections: [] },
        { id: 'token-bcode', name: '$bCode', type: 'instrument', x: 1600, y: 2500, status: 'active', description: 'IDE.', connections: [] },
        { id: 'token-bsocial', name: '$bSocial', type: 'instrument', x: 1800, y: 2500, status: 'active', description: 'Social.', connections: [] },

        // ═══════════════════════════════════════════════════════════════════
        // LAYER 12: TREASURY & DISTRIBUTION (y: 2700-2900)
        // ═══════════════════════════════════════════════════════════════════
        { id: 'treasury', name: 'Corporate Treasury', type: 'wallets', x: 1000, y: 2750, status: 'active', description: 'Multi-sig corporate wallet.', connections: [] },
        { id: 'hot-wallet', name: 'Hot Wallet', type: 'wallets', x: 1300, y: 2750, status: 'active', description: 'Operating funds.', connections: [] },
        { id: 'cold-wallet', name: 'Cold Storage', type: 'wallets', x: 1600, y: 2750, status: 'active', description: 'Reserve holdings.', connections: [] },
        { id: 'dividends', name: 'Dividend Engine', type: 'payment', x: 1000, y: 2900, status: 'active', description: 'Pro-rata distributions.', connections: [] },
        { id: 'buyback', name: 'Buyback Fund', type: 'payment', x: 1300, y: 2900, status: 'active', description: 'Token buybacks.', connections: [] },
        { id: 'grants', name: 'Grants Pool', type: 'payment', x: 1600, y: 2900, status: 'active', description: 'Developer grants.', connections: [] },

        // ═══════════════════════════════════════════════════════════════════
        // LAYER 13: STAKEHOLDERS (y: 3100-3250)
        // ═══════════════════════════════════════════════════════════════════
        { id: 'investors', name: 'Investors', type: 'member', x: 800, y: 3100, status: 'active', description: 'Token holders.', connections: [] },
        { id: 'contributors', name: 'Contributors', type: 'member', x: 1100, y: 3100, status: 'active', description: 'Developers & creators.', connections: [] },
        { id: 'users', name: 'Users', type: 'member', x: 1400, y: 3100, status: 'active', description: 'Platform users.', connections: [] },
        { id: 'partners', name: 'Partners', type: 'member', x: 1700, y: 3100, status: 'active', description: 'Strategic partners.', connections: [] },

        // ═══════════════════════════════════════════════════════════════════
        // LAYER 14: REVENUE STREAMS (y: 700-1200) - Far left
        // ═══════════════════════════════════════════════════════════════════
        { id: 'revenue-header', name: 'Revenue Streams', type: 'payment', x: -900, y: 700, status: 'active', description: 'Income sources.', connections: [], metadata: { isGroupHeader: true } },
        { id: 'tx-fees', name: 'TX Fees', type: 'payment', x: -900, y: 850, status: 'active', description: 'Transaction fees.', connections: [] },
        { id: 'subscriptions', name: 'Subscriptions', type: 'payment', x: -900, y: 1000, status: 'active', description: 'Premium features.', connections: [] },
        { id: 'marketplace-fees', name: 'Marketplace Fees', type: 'payment', x: -900, y: 1150, status: 'active', description: 'Trading commissions.', connections: [] },
        { id: 'api-revenue', name: 'API Access', type: 'payment', x: -900, y: 1300, status: 'active', description: 'Developer APIs.', connections: [] },
        { id: 'enterprise', name: 'Enterprise', type: 'payment', x: -900, y: 1450, status: 'active', description: 'Custom solutions.', connections: [] },
        { id: 'consulting', name: 'Consulting', type: 'payment', x: -900, y: 1600, status: 'active', description: 'Advisory services.', connections: [] },

        // ═══════════════════════════════════════════════════════════════════
        // LAYER 15: TEAMS (y: 200-500) - Top spread
        // ═══════════════════════════════════════════════════════════════════
        { id: 'engineering', name: 'Engineering', type: 'team', x: 500, y: 250, status: 'active', description: 'Core development.', connections: [] },
        { id: 'product', name: 'Product', type: 'team', x: 800, y: 250, status: 'active', description: 'Product management.', connections: [] },
        { id: 'design', name: 'Design', type: 'team', x: 1100, y: 250, status: 'active', description: 'UX/UI design.', connections: [] },
        { id: 'marketing', name: 'Marketing', type: 'team', x: 1900, y: 250, status: 'active', description: 'Growth & marketing.', connections: [] },
        { id: 'operations', name: 'Operations', type: 'team', x: 2200, y: 250, status: 'active', description: 'Business operations.', connections: [] },
        { id: 'hr', name: 'HR', type: 'team', x: 2500, y: 250, status: 'active', description: 'Human resources.', connections: [] },

        // ═══════════════════════════════════════════════════════════════════
        // ADDITIONAL: Marketing & Accelerator (y: 1900-2100) - Far right bottom
        // ═══════════════════════════════════════════════════════════════════
        { id: 'marketing-platform', name: 'Bitcoin Marketing', type: 'workflow', x: 2400, y: 1900, status: 'active', description: 'Marketing automation.', connections: [] },
        { id: 'accelerator', name: 'Bitcoin Accelerator', type: 'workflow', x: 2700, y: 1900, status: 'active', description: 'Startup incubator.', connections: [] },
        { id: 'twitter-bots', name: 'Twitter Bots', type: 'ai-agent', x: 3000, y: 1900, status: 'active', description: 'Social automation.', connections: [] },
        { id: 'shares-platform', name: 'Bitcoin Shares', type: 'workflow', x: 3300, y: 1900, status: 'active', description: 'Equity tokenization.', connections: [] },
    ],
    connections: [
        // Governance hierarchy
        { id: 'c1', from: 'ceo', to: 'board', type: 'task' },
        { id: 'c2', from: 'ceo', to: 'advisors', type: 'task' },
        { id: 'c3', from: 'board', to: 'legal', type: 'task' },
        { id: 'c4', from: 'board', to: 'finance', type: 'task' },

        // Teams from CEO
        { id: 'c5', from: 'ceo', to: 'engineering', type: 'task' },
        { id: 'c6', from: 'ceo', to: 'product', type: 'task' },
        { id: 'c7', from: 'ceo', to: 'design', type: 'task' },
        { id: 'c8', from: 'ceo', to: 'marketing', type: 'task' },
        { id: 'c9', from: 'ceo', to: 'operations', type: 'task' },

        // Engineering to core products
        { id: 'c10', from: 'engineering', to: 'bitcoin-os', type: 'success' },
        { id: 'c11', from: 'engineering', to: 'bitcoin-apps-store', type: 'success' },
        { id: 'c12', from: 'engineering', to: 'bitcoin-exchange', type: 'success' },
        { id: 'c13', from: 'engineering', to: 'bitcoin-wallet', type: 'success' },
        { id: 'c14', from: 'engineering', to: 'senseii', type: 'success' },
        { id: 'c15', from: 'engineering', to: 'cashboard', type: 'success' },

        // Apps store to apps
        { id: 'c20', from: 'bitcoin-apps-store', to: 'bitcoin-writer', type: 'success' },
        { id: 'c21', from: 'bitcoin-apps-store', to: 'bitcoin-drive', type: 'success' },
        { id: 'c22', from: 'bitcoin-apps-store', to: 'bitcoin-email', type: 'success' },
        { id: 'c23', from: 'bitcoin-apps-store', to: 'bitcoin-music', type: 'success' },
        { id: 'c24', from: 'bitcoin-apps-store', to: 'bitcoin-video', type: 'success' },
        { id: 'c25', from: 'bitcoin-apps-store', to: 'bitcoin-chat', type: 'success' },

        // Protocols to apps
        { id: 'c30', from: 'b-protocol', to: 'bitcoin-writer', type: 'success' },
        { id: 'c31', from: 'bcat-protocol', to: 'bitcoin-drive', type: 'success' },
        { id: 'c32', from: 'd-protocol', to: 'bitcoin-email', type: 'success' },

        // Auth services
        { id: 'c40', from: 'handcash-auth', to: 'bitcoin-os', type: 'success' },
        { id: 'c41', from: 'handcash-auth', to: 'bitcoin-wallet', type: 'success' },
        { id: 'c42', from: 'supabase-auth', to: 'cashboard', type: 'success' },

        // Token flows
        { id: 'c50', from: 'bitcoin-os', to: 'token-bos', type: 'payment' },
        { id: 'c51', from: 'bitcoin-apps-store', to: 'token-bapps', type: 'payment' },
        { id: 'c52', from: 'bitcoin-exchange', to: 'token-bexchange', type: 'payment' },
        { id: 'c53', from: 'bitcoin-writer', to: 'token-bwriter', type: 'payment' },
        { id: 'c54', from: 'bitcoin-drive', to: 'token-bdrive', type: 'payment' },
        { id: 'c55', from: 'bitcoin-email', to: 'token-bmail', type: 'payment' },

        // Tokens to treasury
        { id: 'c60', from: 'token-economy-header', to: 'treasury', type: 'payment' },
        { id: 'c61', from: 'treasury', to: 'hot-wallet', type: 'payment' },
        { id: 'c62', from: 'treasury', to: 'cold-wallet', type: 'payment' },
        { id: 'c63', from: 'treasury', to: 'dividends', type: 'payment' },
        { id: 'c64', from: 'treasury', to: 'buyback', type: 'payment' },
        { id: 'c65', from: 'treasury', to: 'grants', type: 'payment' },

        // Dividends to stakeholders
        { id: 'c70', from: 'dividends', to: 'investors', type: 'payment' },
        { id: 'c71', from: 'grants', to: 'contributors', type: 'payment' },

        // Revenue flows
        { id: 'c80', from: 'tx-fees', to: 'token-economy-header', type: 'payment' },
        { id: 'c81', from: 'subscriptions', to: 'token-economy-header', type: 'payment' },
        { id: 'c82', from: 'marketplace-fees', to: 'token-economy-header', type: 'payment' },
        { id: 'c83', from: 'api-revenue', to: 'token-economy-header', type: 'payment' },

        // b0ase tools connections
        { id: 'c90', from: 'b0ase-tools-header', to: 'cashboard', type: 'success' },
        { id: 'c91', from: 'bit-sign', to: 'bitcoin-contracts', type: 'success' },
        { id: 'c92', from: 'bit-certificates', to: 'registry', type: 'success' },

        // Smart contracts
        { id: 'c100', from: 'contracts-header', to: 'bitcoin-exchange', type: 'success' },
        { id: 'c101', from: 'scrypt-escrow', to: 'bitcoin-jobs', type: 'success' },
        { id: 'c102', from: 'scrypt-multisig', to: 'treasury', type: 'success' },
    ],
    selectedNode: null,
    selectedNodes: [],
    isConnecting: null,
    dragging: null,
    workflowStatus: 'running',
    autoMode: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    currentTool: 'select',
    clipboard: [],
    gridSnap: true,
    showGrid: true
})

/**
 * Bitcoin Writer - Actual Architecture (unchanged from before)
 */
export const getBitcoinWriterWorkflow = (): WorkflowState => ({
    id: 'bitcoin-writer-workflow',
    name: 'Bitcoin Writer',
    description: 'Blockchain-native writing platform with micropayments, NFT creation, and smart contracts.',
    initialZoom: 0.55,
    nodes: [
        { id: 'editor', name: 'Quill Editor', type: 'api', x: 300, y: 0, status: 'active', description: 'Rich text WYSIWYG editor.', connections: [] },
        { id: 'handcash-auth', name: 'HandCash Auth', type: 'integration', x: 100, y: 130, status: 'active', description: 'OAuth wallet auth.', connections: [] },
        { id: 'github-auth', name: 'GitHub Auth', type: 'integration', x: 300, y: 130, status: 'active', description: 'Developer auth.', connections: [] },
        { id: 'twitter-auth', name: 'Twitter Auth', type: 'integration', x: 500, y: 130, status: 'active', description: 'Social promotion.', connections: [] },
        { id: 'b-protocol', name: 'B:// Protocol', type: 'database', x: 0, y: 280, status: 'active', description: 'Direct blockchain storage.', connections: [] },
        { id: 'bcat-protocol', name: 'BCAT Protocol', type: 'database', x: 200, y: 280, status: 'active', description: 'Large file chunking.', connections: [] },
        { id: 'd-protocol', name: 'D:// Protocol', type: 'database', x: 400, y: 280, status: 'active', description: 'Dynamic references.', connections: [] },
        { id: 'uhrp', name: 'UHRP Service', type: 'database', x: 600, y: 280, status: 'active', description: 'Hash resolution.', connections: [] },
        { id: 'notesv-encrypt', name: 'NoteSV Encryption', type: 'security', x: 100, y: 420, status: 'active', description: 'AES-256 encryption.', connections: [] },
        { id: 'sig-encrypt', name: 'Signature Encrypt', type: 'security', x: 350, y: 420, status: 'active', description: 'RSA key exchange.', connections: [] },
        { id: 'micropayments', name: 'HandCash Pay', type: 'payment', x: 0, y: 560, status: 'active', description: 'Pay-per-read.', connections: [] },
        { id: 'stripe', name: 'Stripe Subs', type: 'payment', x: 200, y: 560, status: 'active', description: 'Fiat billing.', connections: [] },
        { id: 'nft-service', name: 'NFT Creation', type: 'contract', x: 400, y: 560, status: 'active', description: 'Mint documents.', connections: [] },
        { id: 'task-contracts', name: 'Writer Contracts', type: 'contract', x: 600, y: 560, status: 'active', description: 'Publisher escrow.', connections: [] },
        { id: 'gemini-ai', name: 'Gemini AI', type: 'ai-agent', x: 200, y: 700, status: 'active', description: 'AI assistant.', connections: [] },
        { id: 'work-tree', name: 'Work Tree', type: 'workflow', x: 450, y: 700, status: 'active', description: 'Git-style versioning.', connections: [] },
        { id: 'bwriter-token', name: '$bWriter Token', type: 'instrument', x: 300, y: 850, status: 'active', description: 'Contributor token.', connections: [] },
    ],
    connections: [
        { id: 'w1', from: 'editor', to: 'handcash-auth', type: 'task' },
        { id: 'w2', from: 'editor', to: 'github-auth', type: 'task' },
        { id: 'w3', from: 'editor', to: 'twitter-auth', type: 'task' },
        { id: 'w4', from: 'handcash-auth', to: 'b-protocol', type: 'success' },
        { id: 'w5', from: 'handcash-auth', to: 'bcat-protocol', type: 'success' },
        { id: 'w6', from: 'b-protocol', to: 'notesv-encrypt', type: 'conditional' },
        { id: 'w7', from: 'bcat-protocol', to: 'sig-encrypt', type: 'conditional' },
        { id: 'w8', from: 'd-protocol', to: 'uhrp', type: 'success' },
        { id: 'w9', from: 'notesv-encrypt', to: 'micropayments', type: 'payment' },
        { id: 'w10', from: 'sig-encrypt', to: 'nft-service', type: 'success' },
        { id: 'w11', from: 'micropayments', to: 'bwriter-token', type: 'payment' },
        { id: 'w12', from: 'nft-service', to: 'bwriter-token', type: 'payment' },
        { id: 'w13', from: 'task-contracts', to: 'bwriter-token', type: 'payment' },
        { id: 'w14', from: 'editor', to: 'gemini-ai', type: 'task' },
        { id: 'w15', from: 'editor', to: 'work-tree', type: 'task' },
    ],
    selectedNode: null,
    selectedNodes: [],
    isConnecting: null,
    dragging: null,
    workflowStatus: 'running',
    autoMode: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    currentTool: 'select',
    clipboard: [],
    gridSnap: true,
    showGrid: true
})

export const getBitcoinDriveSubWorkflow = (): WorkflowState => ({
    id: 'bitcoin-drive-workflow',
    name: 'Bitcoin Drive',
    description: 'Decentralized file storage.',
    initialZoom: 0.6,
    nodes: [
        { id: 'upload', name: 'File Upload', type: 'api', x: 300, y: 0, status: 'active', description: 'Multi-file upload.', connections: [] },
        { id: 'encrypt', name: 'AES Encryption', type: 'security', x: 150, y: 130, status: 'active', description: 'Client-side encrypt.', connections: [] },
        { id: 'chunk', name: 'BCAT Chunker', type: 'workflow', x: 450, y: 130, status: 'active', description: 'Split into chunks.', connections: [] },
        { id: 'bcat', name: 'BCAT Storage', type: 'database', x: 150, y: 280, status: 'active', description: 'Store on BSV.', connections: [] },
        { id: 'index', name: 'File Index', type: 'database', x: 450, y: 280, status: 'active', description: 'Track metadata.', connections: [] },
        { id: 'sync', name: 'Drive Sync', type: 'integration', x: 150, y: 430, status: 'active', description: 'Cross-device sync.', connections: [] },
        { id: 'share', name: 'File Sharing', type: 'api', x: 450, y: 430, status: 'active', description: 'Shareable links.', connections: [] },
        { id: 'token', name: '$bDrive Token', type: 'instrument', x: 300, y: 580, status: 'active', description: 'Storage credits.', connections: [] },
    ],
    connections: [
        { id: 'd1', from: 'upload', to: 'encrypt', type: 'task' },
        { id: 'd2', from: 'upload', to: 'chunk', type: 'task' },
        { id: 'd3', from: 'encrypt', to: 'bcat', type: 'success' },
        { id: 'd4', from: 'chunk', to: 'bcat', type: 'success' },
        { id: 'd5', from: 'bcat', to: 'index', type: 'success' },
        { id: 'd6', from: 'index', to: 'sync', type: 'success' },
        { id: 'd7', from: 'index', to: 'share', type: 'success' },
        { id: 'd8', from: 'share', to: 'token', type: 'payment' },
    ],
    selectedNode: null, selectedNodes: [], isConnecting: null, dragging: null, workflowStatus: 'running', autoMode: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), currentTool: 'select', clipboard: [], gridSnap: true, showGrid: true
})

export const getBitcoinEmailSubWorkflow = (): WorkflowState => ({
    id: 'bitcoin-email-workflow',
    name: 'Bitcoin Email',
    description: 'Paymail-based messaging.',
    initialZoom: 0.6,
    nodes: [
        { id: 'compose', name: 'Compose', type: 'api', x: 300, y: 0, status: 'active', description: 'Email composer.', connections: [] },
        { id: 'paymail', name: 'Paymail Resolver', type: 'integration', x: 150, y: 130, status: 'active', description: 'Resolve addresses.', connections: [] },
        { id: 'encrypt', name: 'E2E Encryption', type: 'security', x: 450, y: 130, status: 'active', description: 'Encrypt messages.', connections: [] },
        { id: 'spam', name: 'Spam Prevention', type: 'contract', x: 150, y: 280, status: 'active', description: 'Micropayment filter.', connections: [] },
        { id: 'store', name: 'Message Store', type: 'database', x: 450, y: 280, status: 'active', description: 'Encrypted mailbox.', connections: [] },
        { id: 'inbox', name: 'Inbox', type: 'api', x: 150, y: 430, status: 'active', description: 'Retrieve messages.', connections: [] },
        { id: 'attachments', name: 'Attachments', type: 'database', x: 450, y: 430, status: 'active', description: 'BCAT files.', connections: [] },
        { id: 'token', name: '$bMail Token', type: 'instrument', x: 300, y: 580, status: 'active', description: 'Premium features.', connections: [] },
    ],
    connections: [
        { id: 'e1', from: 'compose', to: 'paymail', type: 'task' },
        { id: 'e2', from: 'paymail', to: 'encrypt', type: 'success' },
        { id: 'e3', from: 'encrypt', to: 'spam', type: 'conditional' },
        { id: 'e4', from: 'encrypt', to: 'store', type: 'success' },
        { id: 'e5', from: 'store', to: 'inbox', type: 'success' },
        { id: 'e6', from: 'compose', to: 'attachments', type: 'task' },
        { id: 'e7', from: 'spam', to: 'token', type: 'payment' },
    ],
    selectedNode: null, selectedNodes: [], isConnecting: null, dragging: null, workflowStatus: 'running', autoMode: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), currentTool: 'select', clipboard: [], gridSnap: true, showGrid: true
})

export const getBitcoinOSSubWorkflow = (): WorkflowState => ({
    id: 'bitcoin-os-workflow',
    name: 'Bitcoin OS',
    description: 'Web-based operating system.',
    initialZoom: 0.55,
    nodes: [
        { id: 'desktop', name: 'Desktop UI', type: 'api', x: 300, y: 0, status: 'active', description: 'Window manager.', connections: [] },
        { id: 'wallet', name: 'Wallet Service', type: 'wallets', x: 100, y: 150, status: 'active', description: 'Built-in wallet.', connections: [] },
        { id: 'appstore', name: 'App Store', type: 'integration', x: 300, y: 150, status: 'active', description: 'Install apps.', connections: [] },
        { id: 'filesystem', name: 'File System', type: 'database', x: 500, y: 150, status: 'active', description: 'Virtual FS.', connections: [] },
        { id: 'apps', name: 'Installed Apps', type: 'workflow', x: 100, y: 300, status: 'active', description: '30+ apps.', connections: [], metadata: { childWorkflowId: 'bitcoin-corp-org' } },
        { id: 'dev-env', name: 'Dev Environment', type: 'api', x: 300, y: 300, status: 'active', description: 'IDE & deploy.', connections: [] },
        { id: 'settings', name: 'Settings', type: 'api', x: 500, y: 300, status: 'active', description: 'User prefs.', connections: [] },
        { id: 'identity', name: 'Identity Manager', type: 'security', x: 200, y: 450, status: 'active', description: 'Paymail & keys.', connections: [] },
        { id: 'permissions', name: 'Permissions', type: 'security', x: 400, y: 450, status: 'active', description: 'Access control.', connections: [] },
        { id: 'token', name: '$bOS Token', type: 'instrument', x: 300, y: 600, status: 'active', description: 'System token.', connections: [] },
    ],
    connections: [
        { id: 'o1', from: 'desktop', to: 'wallet', type: 'task' },
        { id: 'o2', from: 'desktop', to: 'appstore', type: 'task' },
        { id: 'o3', from: 'desktop', to: 'filesystem', type: 'task' },
        { id: 'o4', from: 'appstore', to: 'apps', type: 'success' },
        { id: 'o5', from: 'wallet', to: 'identity', type: 'success' },
        { id: 'o6', from: 'apps', to: 'permissions', type: 'task' },
        { id: 'o7', from: 'identity', to: 'token', type: 'payment' },
        { id: 'o8', from: 'wallet', to: 'token', type: 'payment' },
    ],
    selectedNode: null, selectedNodes: [], isConnecting: null, dragging: null, workflowStatus: 'running', autoMode: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), currentTool: 'select', clipboard: [], gridSnap: true, showGrid: true
})
