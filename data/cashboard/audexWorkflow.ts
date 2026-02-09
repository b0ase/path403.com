export const getAUDEXWorkflow = () => ({
  nodes: [
    // === TOP TIER: REVENUE SOURCES (PYRAMID BASE) ===
    { id: 1, name: 'Music Track Streaming', type: 'youtube', x: 100, y: 100, handcashHandle: 'AUDEX_Streaming' },
    { id: 2, name: 'YouTube Ad Revenue', type: 'youtube', x: 300, y: 100, handcashHandle: 'AUDEX_YouTube' },
    { id: 3, name: 'Spotify Royalties', type: 'payment', x: 500, y: 100, handcashHandle: 'AUDEX_Spotify' },
    { id: 4, name: 'Platform Subscriptions', type: 'payment', x: 700, y: 100, handcashHandle: 'AUDEX_Subs' },
    { id: 5, name: 'NFT Music Sales', type: 'instrument', x: 900, y: 100, handcashHandle: 'AUDEX_NFTs' },
    
    // === SECOND TIER: REVENUE AGGREGATION ===
    { id: 10, name: 'AUDEX Revenue Pool', type: 'splitter', x: 500, y: 250, handcashHandle: 'AUDEX_Revenue' },
    
    // === THIRD TIER: CORPORATE DISTRIBUTION ===
    { id: 15, name: 'AUDEX Treasury (51%)', type: 'organization', x: 300, y: 400, handcashHandle: 'AUDEX_Treasury' },
    { id: 16, name: 'Artist Royalty Pool (35%)', type: 'member', x: 500, y: 400, handcashHandle: 'AUDEX_Artists' },
    { id: 17, name: 'Operations Reserve (10%)', type: 'workflow', x: 700, y: 400, handcashHandle: 'AUDEX_Ops' },
    { id: 18, name: 'Platform Development (4%)', type: 'trigger', x: 900, y: 400, handcashHandle: 'AUDEX_Dev' },
    
    // === FOURTH TIER: TOKEN MANAGEMENT ===
    { id: 20, name: 'AUDEX Token Contract', type: 'contract', x: 500, y: 550, handcashHandle: 'AUDEX_Tokens' },
    
    // === FIFTH TIER: DIVIDEND CALCULATION ===
    { id: 30, name: 'Quarterly Dividend Calculator', type: 'decision', x: 500, y: 700, handcashHandle: 'AUDEX_Dividends' },
    
    // === BOTTOM TIER: SHAREHOLDER DISTRIBUTION (PYRAMID TOP) ===
    { id: 21, name: 'Treasury Tokens (51%)', type: 'wallets', x: 200, y: 850, handcashHandle: 'AUDEX_Treasury_Tokens' },
    { id: 22, name: 'Public Shareholders (35%)', type: 'member', x: 400, y: 850, handcashHandle: 'AUDEX_Public' },
    { id: 23, name: 'Artist Token Holders (10%)', type: 'member', x: 600, y: 850, handcashHandle: 'AUDEX_Artist_Tokens' },
    { id: 24, name: 'Team & Advisors (4%)', type: 'role', x: 800, y: 850, handcashHandle: 'AUDEX_Team' },
    
    // === SIDE BRANCH: INDIVIDUAL TRACK ASSETS ===
    { id: 40, name: 'Track NFT #001', type: 'instrument', x: 1100, y: 250, handcashHandle: 'AUDEX_Track001' },
    { id: 41, name: 'Track Royalty Split', type: 'splitter', x: 1100, y: 400, handcashHandle: 'AUDEX_TrackSplit' },
    { id: 42, name: 'Track Shareholders', type: 'member', x: 1100, y: 550, handcashHandle: 'AUDEX_TrackHolders' },
    
    // === SIDE BRANCH: PLATFORM ASSETS ===
    { id: 50, name: 'AUDEX Platform IP', type: 'contract', x: 100, y: 550, handcashHandle: 'AUDEX_Platform' },
    { id: 51, name: 'User Database', type: 'workflow', x: 100, y: 700, handcashHandle: 'AUDEX_Users' },
    { id: 52, name: 'Music Catalog Rights', type: 'instrument', x: 100, y: 850, handcashHandle: 'AUDEX_Catalog' }
  ],
  connections: [
    // PYRAMID FLOW: Revenue sources to main pool (Tier 1 → Tier 2)
    { from: 1, to: 10, type: 'payment' },
    { from: 2, to: 10, type: 'payment' },
    { from: 3, to: 10, type: 'payment' },
    { from: 4, to: 10, type: 'payment' },
    { from: 5, to: 10, type: 'payment' },
    
    // Main pool to corporate distribution (Tier 2 → Tier 3)
    { from: 10, to: 15, type: 'payment' },
    { from: 10, to: 16, type: 'payment' },
    { from: 10, to: 17, type: 'payment' },
    { from: 10, to: 18, type: 'payment' },
    
    // Corporate distribution to token contract (Tier 3 → Tier 4)
    { from: 15, to: 20, type: 'payment' },
    { from: 16, to: 20, type: 'payment' },
    
    // Token contract to dividend calculator (Tier 4 → Tier 5)
    { from: 20, to: 30, type: 'payment' },
    
    // Dividend calculator to shareholders (Tier 5 → Tier 6)
    { from: 30, to: 21, type: 'payment' },
    { from: 30, to: 22, type: 'payment' },
    { from: 30, to: 23, type: 'payment' },
    { from: 30, to: 24, type: 'payment' },
    
    // SIDE BRANCH: Individual track flows
    { from: 1, to: 40, type: 'payment' },
    { from: 40, to: 41, type: 'payment' },
    { from: 41, to: 42, type: 'payment' },
    
    // SIDE BRANCH: Platform asset connections
    { from: 4, to: 50, type: 'payment' },
    { from: 50, to: 51, type: 'payment' },
    { from: 51, to: 52, type: 'payment' }
  ]
})

