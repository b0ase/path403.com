/**
 * TOKEN REGISTRY - Single Source of Truth
 *
 * All token data should be defined here and referenced elsewhere.
 * This consolidates token metadata, pricing, and status in one place.
 */

// Token status types
export type TokenStatus = 'minted' | 'concept' | 'planned';

// Token category types
export type TokenCategory =
  | 'company'      // Regulated shares ($BOASE, $bCorp, $NPG)
  | 'venture'      // Venture/project tokens
  | 'bApps'        // b0ase Apps ecosystem tokens ($b*)
  | 'npg'          // NPG ecosystem tokens ($NPG*, $CHERRY, $AIGF, etc.)
  | 'content'      // Content/media tokens
  | 'utility';     // Utility tokens

// Token info interface
export interface TokenInfo {
  symbol: string;           // e.g., '$BOASE'
  name: string;             // e.g., 'Boase Corporation'
  description?: string;     // Token description
  status: TokenStatus;      // minted, concept, or planned
  category: TokenCategory;  // Token category
  projectSlug?: string;     // Associated project slug
  marketUrl?: string;       // Trading/market URL
  tokenId?: string;         // On-chain token ID (BSV: txid_vout)
  txid?: string;            // Deployment transaction ID
  // Ownership data (what % does $BOASE own of this token)
  ownership?: {
    boaseOwnership: number;   // Percentage owned by $BOASE (0-100)
    note?: string;            // Explanation of ownership
  };
  // Pricing data (for minted tokens)
  pricing?: {
    marketCap: number;      // USD
    supply: number;
    circulation: number;    // Percentage
    volume: number;         // 24h volume USD
  };
}

// Default supply for all tokens (1 billion)
export const DEFAULT_SUPPLY = 1_000_000_000;

// USD to GBP conversion rate
export const USD_TO_GBP = 0.79;

/**
 * THE TOKEN REGISTRY
 * Single source of truth for all token data
 */
export const TOKEN_REGISTRY: Record<string, TokenInfo> = {
  // ============================================
  // COMPANY TOKENS (Regulated Shares)
  // ============================================
  '$BOASE': {
    symbol: '$BOASE',
    name: 'b0ase.com',
    description: 'Venture studio building AI-powered applications, blockchain solutions, and digital products.',
    status: 'minted',
    category: 'company',
    marketUrl: 'https://1sat.market/bsv21/boase',
    ownership: {
      boaseOwnership: 100,    // This IS the studio token
      note: 'Master token - owns stakes in all below',
    },
    pricing: {
      marketCap: 253165,      // £200k FDV (~$253k USD) - valued at debt level, no equity sold
      supply: 100_000_000_000, // 100 billion tokens (not 1bn like others)
      circulation: 100,       // 100% founder held (no external equity sold)
      volume: 0,
    },
  },
  '$NPG': {
    symbol: '$NPG',
    name: 'Ninja Punk Girls',
    description: 'Revolutionary NFT and digital art platform combining cyberpunk aesthetics with ninja culture.',
    status: 'minted',
    category: 'company',
    projectSlug: 'ninja-punk-girls',
    marketUrl: 'https://1sat.market/bsv21/npg',
    ownership: {
      boaseOwnership: 85.35,  // Richard's stake transferred to b0ase
      note: '14.65% held by external investors (Block Dojo, Neil Booth, etc.)',
    },
    pricing: {
      marketCap: 464000,      // £367k FDV (~$464k USD) - 15% sold for £55,000
      supply: DEFAULT_SUPPLY,
      circulation: 15,        // 15% sold
      volume: 0,
    },
  },
  '$bCorp': {
    symbol: '$bCorp',
    name: 'The Bitcoin Corporation',
    description: 'The Bitcoin Corporation Ltd (UK Company No. 16735102). Index token representing all bApps ecosystem tokens.',
    status: 'minted',
    category: 'company',
    projectSlug: 'bitcoin-corp',
    marketUrl: 'https://1sat.market/bsv21/bcorp',
    ownership: {
      boaseOwnership: 99,     // 1% sold to Craig Massey
      note: '1% held by Craig Massey',
    },
    pricing: {
      marketCap: 127000,      // £100k FDV (~$127k USD) - 1% sold for £1,000
      supply: DEFAULT_SUPPLY,
      circulation: 1,         // 1% sold (Craig Massey)
      volume: 0,
    },
  },

  // ============================================
  // INFRASTRUCTURE TOKENS
  // ============================================
  '$KINTSUGI': {
    symbol: '$KINTSUGI',
    name: 'Kintsugi Engine',
    description: 'AI that turns ideas into fundable startups. The engine powering the entire b0ase ecosystem.',
    status: 'concept',
    category: 'company',  // Core infrastructure
    projectSlug: 'kintsugi',
    ownership: {
      boaseOwnership: 100,    // Fully owned by b0ase
      note: 'Internal product - 100% b0ase owned',
    },
    pricing: {
      marketCap: 100000,      // £100k concept valuation
      supply: DEFAULT_SUPPLY,
      circulation: 0,
      volume: 0,
    },
  },

  // ============================================
  // bAPPS ECOSYSTEM TOKENS
  // ============================================

  // INFRASTRUCTURE LAYER (core plumbing)
  '$bDNS': {
    symbol: '$bDNS',
    name: 'Bitcoin DNS',
    description: 'Global namespace resolution for Bitcoin. Maps $TOKEN names to on-chain addresses. The phone book of the Bitcoin filesystem.',
    status: 'concept',
    category: 'bApps',
    projectSlug: 'bitcoin-dns',
    ownership: { boaseOwnership: 100, note: 'Core infrastructure' },
  },
  '$bSearch': {
    symbol: '$bSearch',
    name: 'Bitcoin Search',
    description: 'Global indexer for BSV. Indexes all tokens, provides canonical state, enables discovery. The Google of the Bitcoin filesystem.',
    status: 'concept',
    category: 'bApps',
    projectSlug: 'bitcoin-search',
    ownership: { boaseOwnership: 100, note: 'Core infrastructure' },
  },

  // APPLICATIONS
  '$bMail': {
    symbol: '$bMail',
    name: 'Bitcoin Mail',
    description: 'Decentralized email on the blockchain.',
    status: 'concept',
    category: 'bApps',
    projectSlug: 'bitcoin-email',
    ownership: { boaseOwnership: 100 },
  },
  '$bOs': {
    symbol: '$bOs',
    name: 'Bitcoin OS',
    description: 'Operating system powered by blockchain.',
    status: 'concept',
    category: 'bApps',
    projectSlug: 'bitcoin-os',
    ownership: { boaseOwnership: 100 },
  },
  '$bDrive': {
    symbol: '$bDrive',
    name: 'Bitcoin Drive',
    description: 'Decentralized cloud storage on the blockchain.',
    status: 'concept',
    category: 'bApps',
    projectSlug: 'bitcoin-drive',
    ownership: { boaseOwnership: 100 },
  },
  '$bSheets': {
    symbol: '$bSheets',
    name: 'Bitcoin Spreadsheets',
    description: 'Decentralized spreadsheet application storing all data on Bitcoin SV. Your data, your keys, your spreadsheet.',
    status: 'concept',  // Not live on 1Sat yet
    category: 'bApps',
    projectSlug: 'bitcoin-spreadsheets',
    ownership: { boaseOwnership: 100 },
  },
  '$MONEYBUTTON': {
    symbol: '$MONEYBUTTON',
    name: 'MoneyButton',
    description: 'Micropayment game on BSV. Press button, get tokens. Every press costs less than a penny and mints equity across the b0ase ecosystem.',
    status: 'concept',
    category: 'venture',  // Not a bApp (no lowercase 'b' after $)
    projectSlug: 'moneybutton-store',
    ownership: { boaseOwnership: 100 },
  },
  '$bWriter': {
    symbol: '$bWriter',
    name: 'Bitcoin Writer',
    description: 'Word processing on the blockchain.',
    status: 'concept',
    category: 'bApps',
    projectSlug: 'bitcoin-writer',
    ownership: { boaseOwnership: 100 },
  },
  '$bApps': {
    symbol: '$bApps',
    name: 'Bitcoin Apps',
    description: 'The b0ase application ecosystem token.',
    status: 'concept',
    category: 'bApps',
    projectSlug: 'bitcoin-apps',
    ownership: { boaseOwnership: 100 },
  },
  '$bMusic': {
    symbol: '$bMusic',
    name: 'Bitcoin Music',
    description: 'Music streaming and distribution on the blockchain.',
    status: 'concept',
    category: 'bApps',
    projectSlug: 'bitcoin-music',
    ownership: { boaseOwnership: 100 },
  },
  '$bFile': {
    symbol: '$bFile',
    name: 'Bitcoin File',
    description: 'File management on the blockchain.',
    status: 'concept',
    category: 'bApps',
    projectSlug: 'bitcoin-file-utility',
    ownership: { boaseOwnership: 100 },
  },

  // ============================================
  // VENTURE TOKENS (Projects)
  // ============================================
  '$NPGRED': {
    symbol: '$NPGRED',
    name: 'NPG Red',
    description: 'Ninja Punk Girls Red Edition token.',
    status: 'concept',
    category: 'npg',  // NPG ecosystem
    projectSlug: 'npg-red',
    ownership: { boaseOwnership: 85.35, note: 'Via $NPG stake' },
  },
  '$REPO': {
    symbol: '$REPO',
    name: 'Repository',
    description: 'Code repository management platform token.',
    status: 'concept',
    category: 'venture',
    projectSlug: 'repository-tokenizer',
    ownership: { boaseOwnership: 100 },
  },
  '$RAFS': {
    symbol: '$RAFS',
    name: 'RAFS Kitchen',
    description: 'Restaurant and food service platform token.',
    status: 'concept',
    category: 'venture',
    projectSlug: 'rafskitchen-website',
    ownership: { boaseOwnership: 100 },
  },
  '$WPLDN': {
    symbol: '$WPLDN',
    name: 'WP London',
    description: 'WordPress London community token.',
    status: 'concept',
    category: 'venture',
    projectSlug: 'wordpress-design-london',
    ownership: { boaseOwnership: 100 },
  },
  '$DIVVY': {
    symbol: '$DIVVY',
    name: 'Divvy',
    description: 'Revenue sharing and dividend distribution platform.',
    status: 'concept',
    category: 'venture',
    projectSlug: 'divvy',
    ownership: { boaseOwnership: 100 },
  },
  '$CHERRY': {
    symbol: '$CHERRY',
    name: 'Cherry',
    description: 'Cherry platform token.',
    status: 'concept',
    category: 'npg',  // NPG ecosystem
    projectSlug: 'cherry-x',
    ownership: { boaseOwnership: 85.35, note: 'Via $NPG stake' },
  },
  '$AUDEX': {
    symbol: '$AUDEX',
    name: 'Audex',
    description: 'Audio exchange platform token.',
    status: 'concept',
    category: 'venture',
    projectSlug: 'audex-website',
    ownership: { boaseOwnership: 100 },
  },
  '$MARS3D': {
    symbol: '$MARS3D',
    name: 'Marina 3D',
    description: '3D visualization and interactive experiences for the web.',
    status: 'concept',  // Not live on 1Sat
    category: 'venture',
    projectSlug: 'marina3dxyz',
    ownership: { boaseOwnership: 100 },
  },
  '$AIVJ': {
    symbol: '$AIVJ',
    name: 'AI VJ',
    description: 'AI-powered visual jockey platform.',
    status: 'concept',
    category: 'npg',  // NPG ecosystem
    projectSlug: 'aivj-website',
    ownership: { boaseOwnership: 85.35, note: 'Via $NPG stake' },
  },
  '$AIGF': {
    symbol: '$AIGF',
    name: 'AI Girlfriend',
    description: 'AI companion platform token.',
    status: 'concept',
    category: 'npg',  // NPG ecosystem
    projectSlug: 'aigirlfriends-website',
    ownership: { boaseOwnership: 85.35, note: 'Via $NPG stake' },
  },
  '$HFLIX': {
    symbol: '$HFLIX',
    name: 'HyperFlix',
    description: 'Memecoin marketing platform for viral TikTok campaigns.',
    status: 'concept',
    category: 'venture',
    projectSlug: 'hyperflix',
    ownership: { boaseOwnership: 100 },
  },
  '$TRIBE': {
    symbol: '$TRIBE',
    name: 'Tribify AI',
    description: 'AI-powered community platform connecting like-minded individuals.',
    status: 'concept',
    category: 'npg',  // NPG ecosystem
    projectSlug: 'tribify-ai',
    ownership: { boaseOwnership: 85.35, note: 'Via $NPG stake' },
  },
  '$AITRIBES': {
    symbol: '$AITRIBES',
    name: 'AI Tribes',
    description: 'AI-powered community platform connecting like-minded individuals through tribal networks.',
    status: 'concept',
    category: 'npg',  // NPG ecosystem
    projectSlug: 'ai-tribes',
    ownership: { boaseOwnership: 85.35, note: 'Via $NPG stake' },
  },
  '$LILITH': {
    symbol: '$LILITH',
    name: 'Lilith Tattoo Studio',
    description: 'Elegant portfolio for a tattoo artist specializing in dark art.',
    status: 'concept',
    category: 'npg',  // NPG ecosystem
    projectSlug: 'lilith-tattoo-studio',
    ownership: { boaseOwnership: 85.35, note: 'Via $NPG stake' },
  },
  '$META': {
    symbol: '$META',
    name: 'MetaGraph',
    description: 'Data visualization tool for complex 3D networks.',
    status: 'concept',
    category: 'venture',
    projectSlug: 'metagraph-app',
    ownership: { boaseOwnership: 100 },
  },
  '$FLOOP': {
    symbol: '$FLOOP',
    name: 'FLOOP!',
    description: 'Wallet with dividend-bearing share token.',
    status: 'concept',
    category: 'venture',
    projectSlug: 'floop',
    ownership: { boaseOwnership: 100 },
  },
  '$TWALL': {
    symbol: '$TWALL',
    name: 'Tribes Wallet',
    description: 'Multi-chain cryptocurrency wallet for community tokens.',
    status: 'concept',
    category: 'venture',
    projectSlug: 'tribes-wallet',
    ownership: { boaseOwnership: 100 },
  },
  '$PICS': {
    symbol: '$PICS',
    name: 'Penny Pics',
    description: 'Micro-payment image marketplace.',
    status: 'concept',
    category: 'venture',
    projectSlug: 'penny-pics',
    ownership: { boaseOwnership: 100 },
  },
  '$MISSVOID': {
    symbol: '$MISSVOID',
    name: 'Miss Void',
    description: 'Alternative fashion and fetish wear boutique.',
    status: 'concept',
    category: 'venture',
    projectSlug: 'v01d-store',
    ownership: { boaseOwnership: 100 },
  },
  '$NTR': {
    symbol: '$NTR',
    name: 'Interior Design Pro',
    description: 'Virtual interior design consultation platform.',
    status: 'concept',
    category: 'venture',
    projectSlug: 'interior-design-pro',
    ownership: { boaseOwnership: 100 },
  },
  '$SENSEI': {
    symbol: '$SENSEI',
    name: 'Sensei',
    description: 'Educational platform token.',
    status: 'concept',
    category: 'venture',
    projectSlug: 'senseii-zeta.vercel.app',
    ownership: { boaseOwnership: 100 },
  },
  '$VEX': {
    symbol: '$VEX',
    name: 'Vex',
    description: 'Vex platform token.',
    status: 'concept',
    category: 'venture',
    projectSlug: 'vexvoid-com',
    ownership: { boaseOwnership: 100 },
  },
  '$V3X': {
    symbol: '$V3X',
    name: 'V3X',
    description: 'V3X platform token.',
    status: 'concept',
    category: 'venture',
    projectSlug: 'vexvoid-av-client',
    ownership: { boaseOwnership: 100 },
  },
  '$WSPRO': {
    symbol: '$WSPRO',
    name: 'WS Pro',
    description: 'Web services professional platform.',
    status: 'concept',
    category: 'venture',
    projectSlug: 'websitestrategypro2025',
    ownership: { boaseOwnership: 100 },
  },
  '$RESEARCH': {
    symbol: '$RESEARCH',
    name: 'Research',
    description: 'Research platform token.',
    status: 'concept',
    category: 'venture',
    projectSlug: 'future-of-blockchain-research',
    ownership: { boaseOwnership: 100 },
  },
  '$BITDNS': {
    symbol: '$BITDNS',
    name: 'BitDNS',
    description: 'Legacy/external DNS project. See $bDNS for core Bitcoin OS name resolution.',
    status: 'concept',
    category: 'venture',
    projectSlug: 'bitdns-website',
    ownership: { boaseOwnership: 100 },
  },
  '$BITCDN': {
    symbol: '$BITCDN',
    name: 'BitCDN',
    description: 'Decentralized CDN on the blockchain.',
    status: 'concept',
    category: 'venture',
    projectSlug: 'bitcdn-website',
    ownership: { boaseOwnership: 100 },
  },
  '$AIBC': {
    symbol: '$AIBC',
    name: 'AI Builders Club',
    description: 'AI builders community and governance token.',
    status: 'concept',
    category: 'venture',
    projectSlug: 'aibuildersclub-website',
    ownership: { boaseOwnership: 100 },
  },
  '$NERD': {
    symbol: '$NERD',
    name: 'Nerd',
    description: 'Developer community platform token.',
    status: 'concept',
    category: 'venture',
    projectSlug: 'overnerd-website',
    ownership: { boaseOwnership: 100 },
  },
  '$1SHOT': {
    symbol: '$1SHOT',
    name: '1Shot',
    description: 'One-shot content creation platform.',
    status: 'concept',
    category: 'venture',
    projectSlug: 'oneshotcomics',
    ownership: { boaseOwnership: 100 },
  },
  '$ROBUST': {
    symbol: '$ROBUST',
    name: 'Robust',
    description: 'Enterprise security and compliance platform.',
    status: 'concept',
    category: 'venture',
    projectSlug: 'robust-ae-com',
    ownership: { boaseOwnership: 100 },
  },
  '$MCPY': {
    symbol: '$MCPY',
    name: 'MCopy',
    description: 'Content copying and distribution platform.',
    status: 'concept',
    category: 'venture',
    projectSlug: 'minecraftparty-website',
    ownership: { boaseOwnership: 100 },
  },
  '$BSVAPI': {
    symbol: '$BSVAPI',
    name: 'BSV API',
    description: 'Bitcoin SV API services platform.',
    status: 'concept',
    category: 'venture',
    projectSlug: 'bsvapi-com',
    ownership: { boaseOwnership: 100 },
  },
  '$PENSHUN': {
    symbol: '$PENSHUN',
    name: 'Penshun',
    description: 'Pension and retirement planning platform.',
    status: 'concept',
    category: 'venture',
    projectSlug: 'penshun',
    ownership: { boaseOwnership: 100 },
  },
  '$WEIGHT': {
    symbol: '$WEIGHT',
    name: 'Weight',
    description: 'Health and fitness tracking platform.',
    status: 'concept',
    category: 'venture',
    projectSlug: 'weight',
    ownership: { boaseOwnership: 100 },
  },
  '$YHC': {
    symbol: '$YHC',
    name: 'YHC',
    description: 'YHC platform token.',
    status: 'concept',
    category: 'venture',
    projectSlug: 'yourcash',
    ownership: { boaseOwnership: 100 },
  },
  '$INDEX': {
    symbol: '$INDEX',
    name: 'Index',
    description: 'Index token for portfolio management.',
    status: 'concept',
    category: 'venture',
    projectSlug: 'index-token',
    ownership: { boaseOwnership: 100 },
  },
  '$NPGX': {
    symbol: '$NPGX',
    name: 'NPGX',
    description: 'Advanced NFT marketplace and gaming platform.',
    status: 'concept',
    category: 'venture',
    projectSlug: 'npgx-website',
    ownership: { boaseOwnership: 100 },
  },
  '$COURSE': {
    symbol: '$COURSE',
    name: 'Course',
    description: 'Educational course platform token.',
    status: 'concept',
    category: 'venture',
    projectSlug: 'coursekings-website',
    ownership: { boaseOwnership: 100 },
  },
  '$BSVEX': {
    symbol: '$BSVEX',
    name: 'BSV Exchange',
    description: 'Bitcoin SV exchange platform.',
    status: 'concept',
    category: 'venture',
    projectSlug: 'bsvex-com',
    ownership: { boaseOwnership: 100 },
  },
  '$BREW': {
    symbol: '$BREW',
    name: 'Brew',
    description: 'Premium bulk coffee with automatic revenue sharing.',
    status: 'concept',
    category: 'venture',
    projectSlug: 'libertascoffee-store',
    ownership: { boaseOwnership: 100 },
  },
  '$BEAUTY': {
    symbol: '$BEAUTY',
    name: 'Beauty',
    description: 'Beauty and cosmetics platform token.',
    status: 'concept',
    category: 'venture',
    projectSlug: 'beauty-queen-ai-com',
    ownership: { boaseOwnership: 100 },
  },
  '$CBOARD': {
    symbol: '$CBOARD',
    name: 'CBoard',
    description: 'Clipboard management platform.',
    status: 'concept',
    category: 'venture',
    projectSlug: 'cashboard-website',
    ownership: { boaseOwnership: 100 },
  },
  '$HCTOKEN': {
    symbol: '$HCTOKEN',
    name: 'HC Token',
    description: 'HandCash ecosystem token.',
    status: 'concept',
    category: 'venture',
    projectSlug: 'cashhandletoken-store',
    ownership: { boaseOwnership: 100 },
  },
  '$ZERODICE': {
    symbol: '$ZERODICE',
    name: 'Zero Dice',
    description: 'AI Influencer platform token.',
    status: 'concept',
    category: 'npg',  // NPG ecosystem
    projectSlug: 'zerodice-store',
    ownership: { boaseOwnership: 85.35, note: 'Via $NPG stake' },
  },
  '$ZUMO': {
    symbol: '$ZUMO',
    name: 'Zumo',
    description: 'Zumo platform token.',
    status: 'concept',
    category: 'venture',
    projectSlug: 'zumo',
    ownership: { boaseOwnership: 100 },
  },
  '$DNSDEX': {
    symbol: '$DNSDEX',
    name: 'DNS DEX',
    description: 'Domain tokenization exchange. Tokenize URLs, charge x402 micropayments per visit, distribute revenue to token holders. Speculative market for 402-linked domains.',
    status: 'concept',
    category: 'venture',  // NOT a bApp - separate venture (no lowercase 'b' after $)
    projectSlug: 'dns-dex',
    ownership: { boaseOwnership: 100, note: 'Live at dns-dex.com' },
  },
  '$OK': {
    symbol: '$OK',
    name: 'Osinka Kalaso',
    description: 'Community-funded sustainable onion farming operation in Eastern Europe. Backers receive ownership tokens with revenue sharing.',
    status: 'concept',
    category: 'venture',
    projectSlug: 'osinka-kalaso',
    ownership: { boaseOwnership: 100 },
  },

  // ============================================
  // UTILITY/CONTENT TOKENS (Investment Packages)
  // ============================================
  '$TECH': {
    symbol: '$TECH',
    name: 'Tech',
    description: 'Technology sector investment token.',
    status: 'planned',
    category: 'utility',
  },
  '$COMPONENT': {
    symbol: '$COMPONENT',
    name: 'Component',
    description: 'Component development investment token.',
    status: 'planned',
    category: 'utility',
  },
  '$MUSIC': {
    symbol: '$MUSIC',
    name: 'Music',
    description: 'Music industry investment token.',
    status: 'planned',
    category: 'content',
  },
  '$FLIX': {
    symbol: '$FLIX',
    name: 'Flix',
    description: 'Video streaming investment token.',
    status: 'planned',
    category: 'content',
  },
  '$BOARDROOM': {
    symbol: '$BOARDROOM',
    name: 'Boardroom',
    description: 'Enterprise governance investment token.',
    status: 'planned',
    category: 'utility',
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get a token by its symbol
 */
export function getToken(symbol: string): TokenInfo | undefined {
  return TOKEN_REGISTRY[symbol];
}

/**
 * Get all tokens
 */
export function getAllTokens(): TokenInfo[] {
  return Object.values(TOKEN_REGISTRY);
}

/**
 * Get tokens by status
 */
export function getTokensByStatus(status: TokenStatus): TokenInfo[] {
  return Object.values(TOKEN_REGISTRY).filter(token => token.status === status);
}

/**
 * Get tokens by category
 */
export function getTokensByCategory(category: TokenCategory): TokenInfo[] {
  return Object.values(TOKEN_REGISTRY).filter(token => token.category === category);
}

/**
 * Get minted tokens (tokens with real on-chain data)
 */
export function getMintedTokens(): TokenInfo[] {
  return getTokensByStatus('minted');
}

/**
 * Get concept tokens (tokens that exist as ideas but not minted)
 */
export function getConceptTokens(): TokenInfo[] {
  return getTokensByStatus('concept');
}

/**
 * Check if a token exists in the registry
 */
export function tokenExists(symbol: string): boolean {
  return symbol in TOKEN_REGISTRY;
}

/**
 * Check if a token is minted (has real on-chain data)
 */
export function isTokenMinted(symbol: string): boolean {
  const token = getToken(symbol);
  return token?.status === 'minted';
}

/**
 * Get token by project slug
 */
export function getTokenByProject(projectSlug: string): TokenInfo | undefined {
  return Object.values(TOKEN_REGISTRY).find(token => token.projectSlug === projectSlug);
}

/**
 * Get all token symbols
 */
export function getAllTokenSymbols(): string[] {
  return Object.keys(TOKEN_REGISTRY);
}

/**
 * Get company tokens (regulated shares)
 */
export function getCompanyTokens(): TokenInfo[] {
  return getTokensByCategory('company');
}

/**
 * Get venture tokens (project tokens)
 */
export function getVentureTokens(): TokenInfo[] {
  return getTokensByCategory('venture');
}
