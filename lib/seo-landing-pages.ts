// SEO Landing Pages Data
// Template-based pages for long-tail keywords

export interface SEOLandingPage {
  slug: string;
  title: string;
  h1: string;
  metaDescription: string;
  heroSubtitle: string;
  category: 'blockchain' | 'use-case' | 'industry' | 'problem';

  // Content sections
  problemStatement: string;
  solution: string;
  benefits: { title: string; description: string }[];
  howItWorks: { step: number; title: string; description: string }[];
  useCases: string[];

  // SEO
  keywords: string[];

  // CTA
  ctaTitle: string;
  ctaDescription: string;
}

export const seoLandingPages: SEOLandingPage[] = [
  // BY BLOCKCHAIN
  {
    slug: 'bsv-smart-contracts',
    title: 'BSV Smart Contract Development | b0ase',
    h1: 'BSV Smart Contract Development',
    metaDescription: 'Professional BSV smart contract development using sCrypt. Low fees, high throughput, enterprise-grade Bitcoin SV contracts for dividends, governance, and tokenization.',
    heroSubtitle: 'Build on Bitcoin SV with ultra-low fees and unlimited scalability',
    category: 'blockchain',
    problemStatement: 'Ethereum gas fees make many smart contract applications economically unfeasible. A simple dividend distribution can cost hundreds of dollars in gas.',
    solution: 'BSV offers sub-cent transaction fees with unlimited block sizes, making even micro-transactions profitable. We build production-ready sCrypt contracts that leverage BSV\'s unique capabilities.',
    benefits: [
      { title: 'Sub-cent fees', description: 'Pay fractions of a penny per transaction, even for complex contract interactions' },
      { title: 'Unlimited scale', description: 'No block size limits means your contract works the same at 10 users or 10 million' },
      { title: 'Data on-chain', description: 'Store application data directly on the blockchain without expensive L2 solutions' },
      { title: 'Instant finality', description: '0-conf transactions for immediate user experience, with SPV proofs for security' },
    ],
    howItWorks: [
      { step: 1, title: 'Design', description: 'We analyze your requirements and design the contract architecture' },
      { step: 2, title: 'Build', description: 'Development in sCrypt with full test coverage' },
      { step: 3, title: 'Audit', description: 'Security review and optimization for minimal fees' },
      { step: 4, title: 'Deploy', description: 'Mainnet deployment with monitoring and support' },
    ],
    useCases: ['Token dividend distribution', 'NFT marketplaces', 'Supply chain tracking', 'Gaming item ownership', 'Micropayment channels'],
    keywords: ['bsv smart contract', 'bitcoin sv development', 'scrypt developer', 'bsv developer', 'bitcoin smart contract'],
    ctaTitle: 'Build on BSV',
    ctaDescription: 'Get a quote for your BSV smart contract project',
  },
  {
    slug: 'ethereum-smart-contracts',
    title: 'Ethereum Smart Contract Development | b0ase',
    h1: 'Ethereum Smart Contract Development',
    metaDescription: 'Expert Solidity development for Ethereum smart contracts. DeFi, NFTs, DAOs, and custom ERC tokens. Audited, gas-optimized, production-ready.',
    heroSubtitle: 'Production-grade Solidity contracts for the world\'s largest smart contract platform',
    category: 'blockchain',
    problemStatement: 'The Ethereum ecosystem is complex with constantly evolving standards, security vulnerabilities, and gas optimization challenges.',
    solution: 'We bring years of Solidity experience to build secure, gas-optimized contracts that follow best practices and integrate seamlessly with the broader Ethereum ecosystem.',
    benefits: [
      { title: 'Largest ecosystem', description: 'Access to the most liquidity, users, and integrations in crypto' },
      { title: 'Battle-tested', description: 'Proven security patterns and extensive tooling' },
      { title: 'DeFi composability', description: 'Integrate with Uniswap, Aave, Compound, and thousands of protocols' },
      { title: 'L2 ready', description: 'Contracts work on Arbitrum, Optimism, Base, and other L2s' },
    ],
    howItWorks: [
      { step: 1, title: 'Specification', description: 'Define contract behavior and security requirements' },
      { step: 2, title: 'Development', description: 'Solidity development with Hardhat/Foundry' },
      { step: 3, title: 'Testing', description: 'Comprehensive unit and integration tests' },
      { step: 4, title: 'Audit & Deploy', description: 'Security audit and mainnet deployment' },
    ],
    useCases: ['ERC-20 tokens', 'NFT collections (ERC-721/1155)', 'DeFi protocols', 'DAO governance', 'Staking contracts'],
    keywords: ['ethereum smart contract', 'solidity developer', 'erc20 token', 'defi development', 'ethereum developer'],
    ctaTitle: 'Build on Ethereum',
    ctaDescription: 'Get a quote for your Ethereum smart contract',
  },
  {
    slug: 'solana-programs',
    title: 'Solana Program Development | b0ase',
    h1: 'Solana Program Development',
    metaDescription: 'High-performance Solana program development in Rust. Fast, cheap transactions for DeFi, NFTs, and gaming applications.',
    heroSubtitle: 'Lightning-fast blockchain applications with sub-second finality',
    category: 'blockchain',
    problemStatement: 'Many blockchain applications need real-time performance that Ethereum cannot provide. Gaming, trading, and social apps require sub-second response times.',
    solution: 'Solana offers 400ms block times and parallel transaction processing. We build Rust programs using Anchor framework that leverage Solana\'s unique architecture.',
    benefits: [
      { title: '400ms blocks', description: 'Near-instant transaction confirmation for real-time applications' },
      { title: 'Low fees', description: 'Fractions of a cent per transaction' },
      { title: 'Parallel processing', description: 'Transactions that don\'t conflict execute simultaneously' },
      { title: 'Growing ecosystem', description: 'Rapidly expanding DeFi, NFT, and gaming ecosystem' },
    ],
    howItWorks: [
      { step: 1, title: 'Architecture', description: 'Design account structure and program interfaces' },
      { step: 2, title: 'Development', description: 'Rust development with Anchor framework' },
      { step: 3, title: 'Testing', description: 'Local validator testing and devnet deployment' },
      { step: 4, title: 'Mainnet', description: 'Production deployment with monitoring' },
    ],
    useCases: ['High-frequency trading', 'Gaming economies', 'Social tokens', 'NFT marketplaces', 'Real-time auctions'],
    keywords: ['solana developer', 'solana program', 'rust blockchain', 'anchor framework', 'solana smart contract'],
    ctaTitle: 'Build on Solana',
    ctaDescription: 'Get a quote for your Solana program',
  },

  // BY USE CASE
  {
    slug: 'automate-dividend-payments',
    title: 'Automate Dividend Payments with Smart Contracts | b0ase',
    h1: 'Automate Dividend Payments',
    metaDescription: 'Eliminate manual dividend calculations forever. Smart contracts automatically distribute revenue to token holders based on their stake. Trustless, transparent, instant.',
    heroSubtitle: 'Set it and forget it. Revenue flows directly to shareholders.',
    category: 'use-case',
    problemStatement: 'Manual dividend distribution is time-consuming, error-prone, and requires trust. Shareholders wait weeks for payments while accountants calculate pro-rata shares.',
    solution: 'A dividend smart contract automatically calculates each holder\'s share based on their token balance and distributes funds instantly. No accountants, no delays, no errors.',
    benefits: [
      { title: 'Instant payouts', description: 'Shareholders receive funds within seconds of deposit' },
      { title: 'Zero errors', description: 'Mathematical precision - every holder gets exactly their share' },
      { title: 'Full transparency', description: 'Anyone can verify the calculations on-chain' },
      { title: 'No middlemen', description: 'Direct wallet-to-wallet transfers, no payment processors' },
    ],
    howItWorks: [
      { step: 1, title: 'Deposit revenue', description: 'Send funds to the contract address' },
      { step: 2, title: 'Snapshot balances', description: 'Contract records all token holder balances' },
      { step: 3, title: 'Calculate shares', description: 'Pro-rata calculation based on token ownership' },
      { step: 4, title: 'Distribute', description: 'Holders claim or receive automatic payouts' },
    ],
    useCases: ['Tokenized company shares', 'Revenue-sharing tokens', 'Investment DAOs', 'Creator royalties', 'Real estate tokens'],
    keywords: ['automate dividends', 'dividend smart contract', 'token dividend distribution', 'automated profit sharing', 'crypto dividends'],
    ctaTitle: 'Automate Your Dividends',
    ctaDescription: 'Get a dividend distribution contract built for your project',
  },
  {
    slug: 'trustless-escrow',
    title: 'Trustless Escrow Smart Contracts | b0ase',
    h1: 'Trustless Escrow Contracts',
    metaDescription: 'Secure payments without trusting third parties. Smart contract escrow holds funds until conditions are met, then releases automatically. No disputes, no delays.',
    heroSubtitle: 'Hold funds securely until delivery is confirmed',
    category: 'use-case',
    problemStatement: 'Traditional escrow requires expensive third parties and can take days to release funds. Disputes are costly and time-consuming to resolve.',
    solution: 'A smart contract escrow locks funds programmatically and releases them when predefined conditions are met. No third party can interfere or delay payment.',
    benefits: [
      { title: 'No trust required', description: 'Code enforces the agreement - neither party can cheat' },
      { title: 'Instant release', description: 'Funds transfer the moment conditions are verified' },
      { title: 'Lower fees', description: 'No escrow service taking 3-5% of the transaction' },
      { title: 'Programmable conditions', description: 'Release on delivery confirmation, time, oracle data, or multi-sig' },
    ],
    howItWorks: [
      { step: 1, title: 'Create escrow', description: 'Buyer deposits funds with release conditions' },
      { step: 2, title: 'Fulfill terms', description: 'Seller delivers goods/services' },
      { step: 3, title: 'Verify completion', description: 'Buyer confirms or oracle verifies' },
      { step: 4, title: 'Release funds', description: 'Contract automatically pays the seller' },
    ],
    useCases: ['Freelance payments', 'Real estate deposits', 'International trade', 'Milestone-based projects', 'P2P marketplace sales'],
    keywords: ['escrow smart contract', 'trustless escrow', 'crypto escrow', 'blockchain escrow', 'smart contract payments'],
    ctaTitle: 'Build Trustless Escrow',
    ctaDescription: 'Get a custom escrow contract for your use case',
  },
  {
    slug: 'token-vesting-schedules',
    title: 'Token Vesting Smart Contracts | b0ase',
    h1: 'Token Vesting Schedules',
    metaDescription: 'Lock team and investor tokens with enforceable vesting schedules. Linear release, cliff periods, and revocable options. Build trust with verifiable token locks.',
    heroSubtitle: 'Mathematically guaranteed token locks that build investor confidence',
    category: 'use-case',
    problemStatement: 'Investors fear team dumps. Without verifiable locks, teams can sell their allocation at any time, crashing the token price.',
    solution: 'A vesting smart contract locks tokens for a defined period, releasing them gradually over time. The lock is publicly verifiable and mathematically enforced.',
    benefits: [
      { title: 'Build trust', description: 'Investors can verify team tokens are locked on-chain' },
      { title: 'Prevent dumps', description: 'Tokens physically cannot be sold until vested' },
      { title: 'Flexible schedules', description: 'Custom cliff periods, linear release, or milestone-based' },
      { title: 'Standard practice', description: 'Expected by serious investors and exchanges' },
    ],
    howItWorks: [
      { step: 1, title: 'Configure schedule', description: 'Define cliff, duration, and release curve' },
      { step: 2, title: 'Deposit tokens', description: 'Lock tokens in the vesting contract' },
      { step: 3, title: 'Time passes', description: 'Tokens gradually become claimable' },
      { step: 4, title: 'Claim vested', description: 'Beneficiaries withdraw available tokens' },
    ],
    useCases: ['Team token allocation', 'Investor lock-ups', 'Advisor compensation', 'Employee token grants', 'Partnership agreements'],
    keywords: ['token vesting', 'vesting smart contract', 'token lock', 'team token lock', 'investor vesting'],
    ctaTitle: 'Create Vesting Schedule',
    ctaDescription: 'Build trust with verifiable token vesting',
  },
  {
    slug: 'dao-governance',
    title: 'DAO Governance Smart Contracts | b0ase',
    h1: 'DAO Governance Contracts',
    metaDescription: 'Decentralized governance for your organization. Token-weighted voting, proposal systems, and automatic execution. True shareholder democracy on the blockchain.',
    heroSubtitle: 'Give your token holders a real voice in decision-making',
    category: 'use-case',
    problemStatement: 'Traditional corporate governance is opaque, slow, and excludes most shareholders. Voting is inaccessible and results are not verifiable.',
    solution: 'A governance smart contract enables transparent, verifiable voting where every token holder can participate. Decisions can automatically trigger on-chain actions.',
    benefits: [
      { title: 'True democracy', description: 'Every token holder can propose and vote' },
      { title: 'Verifiable results', description: 'Anyone can audit votes on the blockchain' },
      { title: 'Automatic execution', description: 'Passed proposals can trigger contract actions' },
      { title: 'Global participation', description: 'Vote from anywhere, no proxy statements needed' },
    ],
    howItWorks: [
      { step: 1, title: 'Create proposal', description: 'Any holder above threshold can propose' },
      { step: 2, title: 'Voting period', description: 'Token holders cast votes during window' },
      { step: 3, title: 'Quorum check', description: 'Verify minimum participation reached' },
      { step: 4, title: 'Execute or reject', description: 'Passed proposals execute automatically' },
    ],
    useCases: ['Investment DAOs', 'Protocol governance', 'Community treasuries', 'Collective ownership', 'Shareholder voting'],
    keywords: ['dao governance', 'governance smart contract', 'token voting', 'decentralized voting', 'dao development'],
    ctaTitle: 'Build DAO Governance',
    ctaDescription: 'Create governance infrastructure for your organization',
  },

  // BY INDUSTRY
  {
    slug: 'smart-contracts-for-startups',
    title: 'Smart Contracts for Startups | b0ase',
    h1: 'Smart Contracts for Startups',
    metaDescription: 'Tokenize your startup equity, automate cap table management, and enable secondary trading. Modern equity infrastructure for the blockchain age.',
    heroSubtitle: 'Modern equity infrastructure for ambitious startups',
    category: 'industry',
    problemStatement: 'Traditional equity management is expensive, illiquid, and requires lawyers for every transaction. Cap tables are spreadsheets prone to errors.',
    solution: 'Tokenized equity on the blockchain provides instant transfers, automatic cap table updates, and programmable rights like dividends and voting.',
    benefits: [
      { title: 'Instant transfers', description: 'Shareholders can transfer equity in seconds, not weeks' },
      { title: 'Automatic cap table', description: 'On-chain ownership is always accurate and current' },
      { title: 'Built-in compliance', description: 'Transfer restrictions and investor accreditation enforced by code' },
      { title: 'Programmable rights', description: 'Dividends, voting, and preferences execute automatically' },
    ],
    howItWorks: [
      { step: 1, title: 'Structure', description: 'Design token classes matching your equity structure' },
      { step: 2, title: 'Tokenize', description: 'Issue tokens representing equity ownership' },
      { step: 3, title: 'Distribute', description: 'Allocate to founders, investors, employees' },
      { step: 4, title: 'Operate', description: 'Run dividends, voting, and transfers on-chain' },
    ],
    useCases: ['Founder equity', 'SAFE/convertible notes', 'Employee stock options', 'Investor rounds', 'Secondary sales'],
    keywords: ['startup tokenization', 'equity smart contract', 'tokenized shares', 'startup cap table', 'digital securities'],
    ctaTitle: 'Tokenize Your Startup',
    ctaDescription: 'Get modern equity infrastructure',
  },
  {
    slug: 'smart-contracts-for-creators',
    title: 'Smart Contracts for Creators | b0ase',
    h1: 'Smart Contracts for Creators',
    metaDescription: 'Automatic royalty splits, NFT drops, and fan tokens. Monetize your creative work with blockchain technology that pays you forever.',
    heroSubtitle: 'Get paid automatically, forever, on every sale',
    category: 'industry',
    problemStatement: 'Creators lose control of their work once it\'s sold. They miss out on secondary sales and have no direct relationship with collectors.',
    solution: 'NFTs with royalty contracts ensure you earn on every resale. Fan tokens create direct monetization channels between you and your audience.',
    benefits: [
      { title: 'Perpetual royalties', description: 'Earn 5-10% on every secondary sale, automatically' },
      { title: 'Direct sales', description: 'Sell directly to fans without gallery or platform fees' },
      { title: 'Fan engagement', description: 'Token-gated content, experiences, and communities' },
      { title: 'Provenance', description: 'Permanent proof of authenticity and ownership history' },
    ],
    howItWorks: [
      { step: 1, title: 'Create', description: 'Prepare your artwork or content' },
      { step: 2, title: 'Mint', description: 'Create NFTs with royalty contract attached' },
      { step: 3, title: 'Sell', description: 'Primary sale on marketplaces or your own site' },
      { step: 4, title: 'Earn forever', description: 'Collect royalties on all future sales' },
    ],
    useCases: ['Digital art', 'Music royalties', 'Video content', 'Writing and journalism', 'Photography'],
    keywords: ['nft royalties', 'creator smart contract', 'nft for artists', 'royalty smart contract', 'creator tokens'],
    ctaTitle: 'Launch Your NFT Project',
    ctaDescription: 'Build sustainable income from your creative work',
  },
  {
    slug: 'smart-contracts-for-real-estate',
    title: 'Smart Contracts for Real Estate | b0ase',
    h1: 'Smart Contracts for Real Estate',
    metaDescription: 'Tokenize property ownership, automate rental income distribution, and enable fractional real estate investment. Blockchain meets brick and mortar.',
    heroSubtitle: 'Fractionalize property ownership and automate rental distributions',
    category: 'industry',
    problemStatement: 'Real estate investment requires large capital, is illiquid, and rental distributions are manual and delayed. Small investors are excluded.',
    solution: 'Tokenized real estate enables fractional ownership with automatic rental distributions. A $500k property becomes 500,000 tokens anyone can buy.',
    benefits: [
      { title: 'Fractional ownership', description: 'Invest in real estate with as little as $100' },
      { title: 'Automatic rent', description: 'Rental income distributed to token holders automatically' },
      { title: 'Liquid market', description: 'Trade property tokens 24/7, no closing costs' },
      { title: 'Transparent cap table', description: 'Always know exactly who owns what percentage' },
    ],
    howItWorks: [
      { step: 1, title: 'Structure', description: 'Create SPV and legal wrapper' },
      { step: 2, title: 'Tokenize', description: 'Issue tokens representing property ownership' },
      { step: 3, title: 'Raise', description: 'Sell tokens to investors' },
      { step: 4, title: 'Distribute', description: 'Rental income flows to token holders automatically' },
    ],
    useCases: ['Apartment buildings', 'Commercial property', 'Vacation rentals', 'Development projects', 'REITs'],
    keywords: ['real estate tokenization', 'property smart contract', 'fractional real estate', 'tokenized property', 'real estate blockchain'],
    ctaTitle: 'Tokenize Property',
    ctaDescription: 'Modernize your real estate with blockchain',
  },
];

// Helper to get page by slug
export function getSEOLandingPage(slug: string): SEOLandingPage | undefined {
  return seoLandingPages.find(page => page.slug === slug);
}

// Get all slugs for static generation
export function getAllSEOLandingSlugs(): string[] {
  return seoLandingPages.map(page => page.slug);
}

// Get pages by category
export function getSEOLandingPagesByCategory(category: SEOLandingPage['category']): SEOLandingPage[] {
  return seoLandingPages.filter(page => page.category === category);
}
