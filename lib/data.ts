// Import token registry as single source of truth
import { TOKEN_REGISTRY, getToken, tokenExists } from './token-registry';

// Large image arrays moved to constants to optimize webpack caching
const FLOOP_IMAGES = [
  '/images/apps/FLOOP/boase4982_httpss.mj.runM93-sjOKpNo_FLOOP_Colourful_Pop-art_gr_31438ec7-f4b4-4fe2-8868-b2cae36444d3_0.png',
  '/floop.png',
  '/images/apps/FLOOP/FLOOP%20DASHBOARD.jpg',
  '/images/apps/FLOOP/Floop%20ID.png',
  '/images/apps/FLOOP/FLOOP%20X%20TITEL%20.png',
  '/images/apps/FLOOP/FLOOP!.png',
  '/images/apps/FLOOP/boase4982_httpss.mj.runM93-sjOKpNo_FLOOP_Colourful_Pop-art_gr_31438ec7-f4b4-4fe2-8868-b2cae36444d3_1.png',
  '/images/apps/FLOOP/boase4982_httpss.mj.runM93-sjOKpNo_FLOOP_Colourful_Pop-art_gr_31438ec7-f4b4-4fe2-8868-b2cae36444d3_3.png',
  '/images/apps/FLOOP/boase4982_httpss.mj.runM93-sjOKpNo_FLOOP_Colourful_Pop-art_gr_13af3d05-bc4f-44c1-b8d9-2e321adffcd7_0.png',
  '/images/apps/FLOOP/boase4982_httpss.mj.runM93-sjOKpNo_FLOOP_Colourful_Pop-art_gr_13af3d05-bc4f-44c1-b8d9-2e321adffcd7_1.png',
  '/images/apps/FLOOP/boase4982_httpss.mj.runM93-sjOKpNo_FLOOP_Colourful_Pop-art_gr_13af3d05-bc4f-44c1-b8d9-2e321adffcd7_3.png',
  '/images/apps/FLOOP/boase4982_httpss.mj.runM93-sjOKpNo_FLOOP_Colourful_Pop-art_gr_14047bc8-9aef-4b31-94e0-e160283e3030_2.png',
  '/images/apps/FLOOP/boase4982_httpss.mj.runM93-sjOKpNo_FLOOP_Colourful_Pop-art_gr_14047bc8-9aef-4b31-94e0-e160283e3030_3.png',
  '/images/apps/FLOOP/boase4982_httpss.mj.runM93-sjOKpNo_FLOOP_Colourful_Pop-art_gr_31bfc025-62cf-4c49-9212-16321ccaf73f_0.png',
  '/images/apps/FLOOP/boase4982_httpss.mj.runM93-sjOKpNo_FLOOP_Colourful_Pop-art_gr_8315524a-9eda-4194-8a2c-1d181b7271f7_2.png',
  '/images/apps/FLOOP/boase4982_httpss.mj.runM93-sjOKpNo_FLOOP_Colourful_Pop-art_gr_9d3ab076-31f0-4c6d-8125-3e8076258765_2.png',
  '/images/apps/FLOOP/boase4982_httpss.mj.runM93-sjOKpNo_FLOOP_Colourful_Pop-art_gr_a6832b94-36da-4d66-9006-e94fd583284e_2.png'
];

export interface Experience {
  id: number;
  role: string;
  company: string;
  period: string;
  description: string[];
}

export interface Education {
  id: number;
  degree: string;
  school: string;
  description: string;
}

// Helper function to create project stubs
const createProjectStub = (id: number, title: string, description: string, status?: string, tech?: string[], tokenName?: string, tokenProgressPercent?: number, cardImageUrls?: string[], xUrl?: string, githubUrl?: string, notionUrl?: string, notionDatabaseUrl?: string) => {
  // Ensure title is treated as a string for slug generation
  const safeTitle = (title || '');
  const slug = safeTitle.toLowerCase().replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[^a-z0-9\-]/g, '') // Remove invalid chars
    .replace(/\.+/g, '-'); // Replace periods with hyphens specifically for domain-like titles

  const defaultStatus = status || 'Concept';
  const defaultTech = tech || [];
  const defaultTokenName = tokenName || '';
  const defaultTokenProgress = tokenProgressPercent || 0;
  const defaultCardImageUrls = cardImageUrls || []; // Default to empty array

  return {
    id,
    title,
    slug, // Add generated slug
    description,
    tech: defaultTech,
    githubUrl: githubUrl || `https://github.com/b0ase/${slug}`, // Use slug for default URLs too?
    xUrl: xUrl || `https://x.com/${slug}`,
    notionUrl: notionUrl || 'https://www.notion.so/21d9c67aff39802bab23c588e9646bc2?v=21d9c67aff398083bfcf000c01aed8cb',
    notionDatabaseUrl: notionDatabaseUrl || 'https://www.notion.so/21d9c67aff39807495b8ded2256eb792?v=21d9c67aff39806ab9e5000cdfb2fe96',
    tokenName: defaultTokenName,
    tokenProgressPercent: defaultTokenProgress,
    status: defaultStatus,
    type: 'domain', // Default type, can be overridden
    cardImageUrls: defaultCardImageUrls // Use the new array field
  };
};

// Define the structure for a Service
export interface Service {
  id: number;
  slug: string;
  title: string;
  description: string;
  detailedDescription: string;
  priceInfo?: string;
}

// Define the structure for a Project
export interface Project {
  id: number;
  title: string;
  slug: string;
  description: string;
  tech: string[];
  githubUrl?: string;
  xUrl?: string;
  notionUrl?: string; // Project showcase/documentation
  notionDatabaseUrl?: string; // Backend project management
  tokenName?: string;
  tokenProgressPercent?: number;
  status: string;
  type: 'domain' | 'github' | 'client' | 'company';
  cardImageUrls?: string[]; // Changed from imageUrl to cardImageUrls
  tokenMarketUrl?: string; // Added for specific projects
  tokenPlatform?: string; // Added for specific projects
  liveUrl?: string;
  primaryColor?: string; // Added for branding customization

  hasLiveDemo?: boolean;
  category?: string;
  score?: string;
  hasGithub?: boolean;
  subtitle?: string;
  price?: number; // Company valuation/price in USD
  totalRaised?: number; // Total amount raised in fundraising (GBP)
  // Business Model Canvas Elements
  keyPartners?: string[];
  keyActivities?: string[];
  valuePropositions?: string[];
  customerSegments?: string[];
  channels?: string[];
  revenueStreams?: string[];
  costStructure?: string[];
  customStats?: { label: string; value: string }[];
  businessModel?: {
    overview: string;
    coreServices: string[];
    technologyStack: {
      hardware: string[];
      software: string[];
      blockchain: string[];
    };
    securityFeatures: string[];
    complianceStandards: string[];
    targetIndustries: string[];
    competitiveAdvantages: string[];
    revenueModel: {
      primary: string;
      recurring: string;
      consulting: string;
      training: string;
      hardware: string;
    };
    marketOpportunity: {
      size: string;
      growth: string;
      drivers: string;
      barriers: string;
    };
    tokenEconomics: {
      utility: string;
      rewards: string;
      staking: string;
      governance: string;
    };
  };
  // Theme configuration for portfolio page styling
  themeConfig?: {
    primary: string;      // Primary color (e.g., 'pink', 'blue', 'green')
    secondary: string;    // Secondary color (e.g., 'purple', 'cyan', 'teal')
  };
}

export interface SkillsData {
  apps: string[];
  platforms: string[];
  languages: string[];
  frameworks: string[];
  databases: string[];
  skills: string[];
  // soft?: string[]; // Optional: Add other skill categories if needed
}

export interface BoaseStats {
  yearsExperience: number;
  projectsLaunched: number;
  linesOfCode: string;
  tokenPrice: string;
}

export interface InvestmentPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  tokens: { symbol: string; amount: number }[];
  popular?: boolean;
}

export interface PortfolioData {
  about: {
    name: string;
    tagline: string;
    bio: string;
    socials: {
      github: string;
      linkedin: string;
      x: string;
      youtube: string;
      telegram?: string;
      discord?: string;
      whatsapp?: string;
      fiverr?: string;
      upwork?: string;
      freelancer?: string;
    };
    token: {
      name: string;
      ticker: string;
      description: string;
      platform: string;
      marketLink: string;
    };
  };
  notion: {
    projectsPage: string; // Public project showcase
    database: string; // Backend project/client management
  };
  boaseStats: BoaseStats;
  investmentPackages: InvestmentPackage[];
  projects: Project[];
  skills: SkillsData;
  services: Service[];
  experience: Experience[];
  education: Education[];
  contact: { email: string; };
}

// Main data object
export const portfolioData: PortfolioData = {
  about: {
    name: '',
    tagline: '',
    bio: "",
    socials: {
      github: 'https://github.com/b0ase',
      linkedin: 'https://www.linkedin.com/in/richardboase/',
      x: 'https://x.com/b0ase',
      youtube: 'https://www.youtube.com/@richardboase',
      telegram: 'https://t.me/b0ase_com',
      discord: '#discord',
      whatsapp: 'https://wa.me/447707954186',
      fiverr: 'https://www.fiverr.com/richardboase',
      upwork: '#upwork',
      freelancer: '#freelancer'
    },
    token: {
      name: TOKEN_REGISTRY['$BOASE'].symbol,
      ticker: 'BSV21',
      description: TOKEN_REGISTRY['$BOASE'].description || '',
      platform: 'BSV21',
      marketLink: TOKEN_REGISTRY['$BOASE'].marketUrl || 'https://1sat.market/bsv21/boase'
    }
  },
  notion: {
    projectsPage: 'https://www.notion.so/21d9c67aff39802bab23c588e9646bc2?v=21d9c67aff398083bfcf000c01aed8cb',
    database: 'https://www.notion.so/21d9c67aff39807495b8ded2256eb792?v=21d9c67aff39806ab9e5000cdfb2fe96'
  },
  boaseStats: {
    yearsExperience: 8,
    projectsLaunched: 50,
    linesOfCode: '1.2M+',
    tokenPrice: '$0.01'
  },
  experience: [
    {
      id: 1,
      role: 'Founder & Full-Stack Developer',
      company: 'B0ASE Digital Studio',
      period: '2020 - Present',
      description: [
        'Developed and deployed 50+ web applications using React, Next.js, and Node.js',
        'Built blockchain-integrated platforms with smart contract functionality',
        'Created comprehensive digital solutions from concept to deployment',
        'Managed client relationships and project delivery for diverse industries'
      ]
    },
    {
      id: 2,
      role: 'Senior Web Developer',
      company: 'Freelance Consulting',
      period: '2018 - 2020',
      description: [
        'Delivered custom web solutions for startups and established businesses',
        'Specialized in e-commerce platforms and content management systems',
        'Implemented responsive design and performance optimization strategies',
        'Collaborated with design teams to deliver pixel-perfect implementations'
      ]
    }
  ],
  education: [
    {
      id: 1,
      degree: 'Computer Science Foundations',
      school: 'Self-Directed Learning',
      description: 'Comprehensive study of algorithms, data structures, and software engineering principles'
    },
    {
      id: 2,
      degree: 'Blockchain Development',
      school: 'Various Platforms',
      description: 'Smart contract development, DeFi protocols, and Web3 integration'
    }
  ],
  investmentPackages: [
    {
      id: 'builder',
      name: 'The Builder Bundle',
      description: 'Invest in the tools that build the future. Includes standard governance rights.',
      price: 100,
      tokens: [
        { symbol: '$BOASE', amount: 5000 },
        { symbol: '$TECH', amount: 2500 },
        { symbol: '$COMPONENT', amount: 2500 }
      ]
    },
    {
      id: 'media',
      name: 'The Media Mogul',
      description: 'Back the content engine. Includes access to exclusive media drops.',
      price: 250,
      popular: true,
      tokens: [
        { symbol: '$BOASE', amount: 10000 },
        { symbol: '$MUSIC', amount: 7500 },
        { symbol: '$FLIX', amount: 7500 }
      ]
    },
    {
      id: 'whale',
      name: 'The Whale',
      description: 'Maximum governance power and dividends. Direct line to the founder.',
      price: 1000,
      tokens: [
        { symbol: '$BOASE', amount: 50000 },
        { symbol: '$BOARDROOM', amount: 50000 }
      ]
    }
  ],
  projects: [
    // TOP LINE PROJECTS
    {
      id: 106,
      title: 'Bitcoin Email',
      slug: 'bitcoin-email',
      description: 'Secure email service with Bitcoin integration for encrypted messaging and cryptocurrency transactions.',
      type: 'client',
      status: 'Demo',
      liveUrl: 'https://bitcoin-email.vercel.app/',
      tech: ['Next.js', 'TypeScript', 'Bitcoin', 'Encryption', 'Email Services'],
      cardImageUrls: ['/images/slugs/bitcoin-email.png'],
      subtitle: 'Secure Bitcoin Email',
      xUrl: 'https://x.com/bitcoin-email',
      notionUrl: 'https://notion.so/bitcoin-email',
      githubUrl: 'https://github.com/b0ase/bitcoin-email',
      tokenName: '$bMail',
      tokenProgressPercent: 0,
      price: undefined,
      keyPartners: ['Bitcoin Network', 'Email Providers', 'Security Services', 'Crypto Exchanges'],
      keyActivities: ['Email Service Development', 'Bitcoin Integration', 'Security Implementation', 'User Support'],
      valuePropositions: ['Secure Email Communication', 'Bitcoin Payment Integration', 'End-to-End Encryption', 'Decentralized Storage'],
      customerSegments: ['Bitcoin Users', 'Privacy Advocates', 'Crypto Traders', 'Secure Communication Users'],
      channels: ['Direct Website', 'Crypto Communities', 'Privacy Forums', 'Social Media'],
      revenueStreams: ['Subscription Fees', 'Transaction Fees', 'Premium Features', 'Storage Upgrades'],
      costStructure: ['Infrastructure', 'Security Services', 'Development', 'Customer Support'],
      themeConfig: { primary: 'orange', secondary: 'yellow' }
    },
    {
      id: 107,
      title: 'Bitcoin OS',
      slug: 'bitcoin-os',
      description: 'A revolutionary Bitcoin-based operating system that integrates cryptocurrency functionality directly into the desktop environment.',
      type: 'client' as const,
      status: 'Concept',
      liveUrl: 'https://bitcoin-os.vercel.app/',
      tech: ['Linux', 'Bitcoin', 'C++', 'JavaScript', 'Blockchain', 'Operating Systems'],
      cardImageUrls: ['/images/slugs/bitcoin-os.png'],
      subtitle: 'Bitcoin Operating System',
      xUrl: 'https://x.com/bitcoin-os',
      notionUrl: 'https://notion.so/bitcoin-os',
      githubUrl: 'https://github.com/b0ase/bitcoin-os',
      tokenName: '$bOs',
      tokenProgressPercent: 0,
      price: 100000,
      keyPartners: ['Linux Foundation', 'Bitcoin Core', 'Hardware Vendors', 'Crypto Exchanges'],
      keyActivities: ['OS Development', 'Bitcoin Integration', 'Hardware Optimization', 'Security Implementation'],
      valuePropositions: ['Native Bitcoin Integration', 'Secure OS Environment', 'Built-in Crypto Wallet', 'Decentralized Computing'],
      customerSegments: ['Bitcoin Enthusiasts', 'Crypto Traders', 'Privacy Advocates', 'Tech Early Adopters'],
      channels: ['Direct Download', 'Crypto Communities', 'Tech Forums', 'Open Source Platforms'],
      revenueStreams: ['Premium Features', 'Enterprise Licenses', 'Support Services', 'Hardware Partnerships'],
      costStructure: ['OS Development', 'Security Audits', 'Hardware Testing', 'Community Support']
    },
    {
      id: 42,
      title: 'Bitcoin Drive',
      slug: 'bitcoin-drive',
      description: 'Monetize your content with blockchain storage. A decentralized platform for storing and monetizing digital content using Bitcoin infrastructure.',
      type: 'domain' as const,
      status: 'Demo',
      liveUrl: 'https://bitcoin-drive.vercel.app/',
      tech: ['Next.js', 'TypeScript', 'Bitcoin', 'Blockchain Storage', 'Decentralized Systems', 'File Management'],
      cardImageUrls: ['/images/slugs/bitcoin-drive.png'],
      subtitle: 'Decentralized Storage',
      xUrl: 'https://x.com/BitcoinDrive',
      notionUrl: 'https://www.notion.so/21d9c67aff39802bab23c588e9646bc2?v=21d9c67aff398083bfcf000c01aed8cb',
      githubUrl: 'https://github.com/b0ase/bitcoin-drive',
      tokenName: '$bDrive',
      tokenProgressPercent: 0,
      tokenMarketUrl: '#',
      price: 30000,
      keyPartners: ['Bitcoin Network', 'Storage Providers', 'Blockchain Infrastructure', 'Security Auditors', 'Cloud Platforms', 'Decentralized Networks'],
      keyActivities: ['File Storage Management', 'Blockchain Verification', 'Security Implementation', 'User Interface Development', 'Network Optimization', 'Data Recovery'],
      valuePropositions: ['Decentralized File Storage', 'Blockchain Security', 'Immutable Records', 'Censorship Resistance', 'Data Sovereignty', 'Bitcoin-based Infrastructure'],
      customerSegments: ['Privacy Advocates', 'Bitcoin Enthusiasts', 'Decentralized App Users', 'Security-conscious Individuals', 'Content Creators', 'Data Storage Companies'],
      channels: ['Direct Platform', 'Bitcoin Communities', 'Privacy Forums', 'Tech Communities', 'Developer Networks', 'Blockchain Events'],
      revenueStreams: ['Storage Fees', 'Premium Features', 'API Access', 'Enterprise Solutions', 'Consultation Services', 'White-label Licensing'],
      costStructure: ['Bitcoin Network Fees', 'Storage Infrastructure', 'Platform Development', 'Security Audits', 'Marketing & Community', 'Customer Support']
    },
    {
      id: 40,
      title: 'Bitcoin Spreadsheets',
      slug: 'bitcoin-spreadsheets',
      description: 'Decentralized spreadsheet application storing all data on Bitcoin SV. Your data, your keys, your spreadsheet. First vibecoin from The Bitcoin Corporation.',
      type: 'domain' as const,
      status: 'Live',
      liveUrl: 'https://bitcoin-spreadsheet.vercel.app/',
      tech: ['Next.js', 'TypeScript', 'BSV', 'HandCash', 'AES-256-GCM', 'React', 'RevoGrid'],
      cardImageUrls: ['/images/slugs/bitcoin-spreadsheet.png'],
      subtitle: 'Blockchain Spreadsheets',
      xUrl: 'https://x.com/BitcoinSheets',
      notionUrl: 'https://www.notion.so/21d9c67aff39802bab23c588e9646bc2?v=21d9c67aff398083bfcf000c01aed8cb',
      githubUrl: 'https://github.com/b0ase/bitcoin-spreadsheet',
      tokenName: '$BSHEETS',
      tokenProgressPercent: 1,
      tokenMarketUrl: 'https://1sat.market/bsv21/bsheets',
      price: 127000,
      keyPartners: ['The Bitcoin Corporation', 'HandCash', 'Bitcoin SV Network', 'b0ase.com', 'Storage Infrastructure', 'Security Auditors'],
      keyActivities: ['Spreadsheet Development', 'Blockchain Integration', 'Data Encryption', 'User Authentication', 'Real-time Collaboration', 'Feature Development'],
      valuePropositions: ['True Data Ownership', 'Zero-Knowledge Encryption', 'Immutable Audit Trail', 'No Data Mining', 'Self-Sovereign Identity', 'Bitcoin-Native Storage'],
      customerSegments: ['Privacy Advocates', 'Small Businesses', 'Compliance Teams', 'Bitcoin Enthusiasts', 'Financial Professionals', 'Accountants'],
      channels: ['Direct Platform', 'Bitcoin Communities', 'Privacy Forums', 'b0ase.com', 'The Bitcoin Corporation', 'Developer Networks'],
      revenueStreams: ['Transaction Fees', 'Premium Features', 'Enterprise Licensing', 'API Access', 'Custom Development', 'White-label Solutions'],
      costStructure: ['BSV Network Fees', 'Platform Development', 'Security Infrastructure', 'HandCash Integration', 'Marketing & Community', 'Customer Support']
    },
    {
      id: 41,
      title: 'Bitcoin Writer',
      slug: 'bitcoin-writer',
      description: 'A word processor that saves documents immutably to the Bitcoin blockchain. Users earn $bWriter tokens for each save, stake tokens to become shareholders, and receive dividend payments from platform revenue.',
      type: 'domain' as const,
      status: 'Live',
      liveUrl: 'https://bitcoin-writer.com/',
      tech: ['Next.js', 'TypeScript', 'Bitcoin SV', 'BSV-20 Tokens', 'Blockchain Storage', 'Document Processing'],
      cardImageUrls: ['/images/slugs/bitcoin-writer.png'],
      subtitle: 'Blockchain Word Processor',
      xUrl: 'https://x.com/bitcoin_writer',
      notionUrl: 'https://www.notion.so/21d9c67aff39802bab23c588e9646bc2?v=21d9c67aff398083bfcf000c01aed8cb',
      githubUrl: 'https://github.com/b0ase/bitcoin-writer',
      tokenName: '$bWriter',
      tokenProgressPercent: 0,
      tokenMarketUrl: 'https://b0ase.com/blog/introduction-to-bitcoin-writer',
      price: 10000000,
      totalRaised: 1000,
      keyPartners: ['Bitcoin SV Network', 'b0ase.com', 'Bitcoin Corporation', 'Legal/Compliance', 'Infrastructure Providers'],
      keyActivities: ['Document Processing', 'Blockchain Inscription', 'Token Distribution', 'Dividend Calculation', 'Stake Management', 'Community Building'],
      valuePropositions: ['Permanent Document Storage', 'Immutable Timestamping', 'Direct Ownership (via tokens)', 'Dividend Participation', 'Zero Censorship', 'Proof of Authorship'],
      customerSegments: ['Legal Professionals', 'Intellectual Property Holders', 'Researchers', 'Bitcoin Enthusiasts', 'Asset Holders', 'Entrepreneurs'],
      channels: ['Direct Platform', 'Bitcoin Communities', 'Legal Forums', 'b0ase.com', 'Social Media'],
      revenueStreams: ['Save Transaction Fees (in BSV)', 'Premium Features', 'Enterprise Contracts', 'API Access', 'White-label Solutions'],
      costStructure: ['BSV Network Fees', 'Platform Development', 'Dividend Distribution', 'Infrastructure', 'Customer Support', 'Legal Compliance']
    },
    {
      id: 130,
      title: 'Bitcoin Corporation',
      slug: 'bitcoin-corp',
      description: 'The ultimate Bitcoin ecosystem hub providing integrated services, tools, and resources for Bitcoin users and businesses.',
      type: 'client' as const,
      status: 'LTD',
      liveUrl: 'https://www.thebitcoincorporation.website',
      tech: ['Next.js', 'TypeScript', 'Bitcoin', 'Blockchain', 'Web3'],
      cardImageUrls: ['/images/slugs/bitcoin-corp.png'],
      subtitle: 'Bitcoin Ecosystem Hub',
      xUrl: 'https://x.com/Bitcoin_Corp_X',
      notionUrl: 'https://www.notion.so/21d9c67aff39802bab23c588e9646bc2?v=21d9c67aff398083bfcf000c01aed8cb',
      githubUrl: 'https://github.com/b0ase/bitcoin-corp',
      tokenName: '$bCorp',
      tokenProgressPercent: 0,
      price: 100000,
      keyPartners: ['Bitcoin Network', 'Crypto Exchanges', 'Payment Processors', 'Blockchain Infrastructure'],
      keyActivities: ['Ecosystem Development', 'Service Integration', 'User Onboarding', 'Platform Management'],
      valuePropositions: ['Unified Bitcoin Services', 'Easy Onboarding', 'Integrated Tools', 'Comprehensive Resources'],
      customerSegments: ['Bitcoin Enthusiasts', 'Crypto Businesses', 'Developers', 'Retail Users'],
      channels: ['Direct Website', 'Crypto Communities', 'Social Media', 'Developer Forums'],
      revenueStreams: ['Service Fees', 'Premium Features', 'API Access', 'Enterprise Solutions'],
      costStructure: ['Platform Development', 'Infrastructure', 'Marketing', 'Customer Support']
    },
    {
      id: 141,
      title: 'PATH402.com',
      slug: 'path402-com',
      description: 'The $402 Protocol - turn any URL into a priced, tokenised market. AI-native micropayments on BSV with sqrt_decay pricing for content and APIs.',
      type: 'domain' as const,
      status: 'Alpha',
      liveUrl: 'https://path402.com',
      tech: ['Next.js', 'TypeScript', 'BSV', 'MCP', 'AI Agents', 'HTTP 402', 'Micropayments'],
      cardImageUrls: ['/images/slugs/path402-com.png'],
      subtitle: 'AI-Native Micropayments',
      xUrl: 'https://x.com/b0ase',
      notionUrl: 'https://www.notion.so/21d9c67aff39802bab23c588e9646bc2?v=21d9c67aff398083bfcf000c01aed8cb',
      githubUrl: 'https://github.com/b0ase/path402-mcp-server',
      tokenName: '$402',
      tokenProgressPercent: 5,
      price: 50000,
      keyPartners: ['BSV Network', 'HandCash', 'MCP Ecosystem', 'AI Agent Developers', 'Content Creators'],
      keyActivities: ['Protocol Development', 'MCP Server Maintenance', 'Token Economics', 'Developer Relations', 'AI Integration'],
      valuePropositions: ['Instant Micropayments', 'AI-Native Protocol', 'Sqrt Decay Pricing', 'Content Monetization', 'Machine-Readable Commerce'],
      customerSegments: ['AI Agents', 'Content Creators', 'API Providers', 'BSV Enthusiasts', 'Developers'],
      channels: ['npm Package', 'MCP Protocol', 'Developer Docs', 'b0ase.com', 'GitHub'],
      revenueStreams: ['Token Sales', 'Platform Fees', 'Enterprise Licensing', 'Content Serving Fees'],
      costStructure: ['Protocol Development', 'BSV Network Fees', 'Infrastructure', 'Community Building']
    },
    {
      id: 131,
      title: 'Bitcoin Apps',
      slug: 'bitcoin-apps',
      description: 'A curated suite of Bitcoin applications providing essential tools for everyday cryptocurrency use.',
      type: 'client' as const,
      status: 'Live',
      liveUrl: 'https://www.bitcoinapps.store',
      tech: ['Next.js', 'TypeScript', 'Bitcoin', 'BSV', 'Web3'],
      cardImageUrls: ['/images/slugs/bitcoin-apps.png'],
      subtitle: 'Bitcoin App Store',
      xUrl: 'https://x.com/bapps',
      notionUrl: 'https://www.notion.so/21d9c67aff39802bab23c588e9646bc2?v=21d9c67aff398083bfcf000c01aed8cb',
      githubUrl: 'https://github.com/b0ase/bitcoin-apps',
      tokenName: '$bApps',
      tokenProgressPercent: 0,
      price: 30000,
      keyPartners: ['Bitcoin Developers', 'App Marketplaces', 'Payment Processors', 'Blockchain Networks'],
      keyActivities: ['App Curation', 'Platform Development', 'User Acquisition', 'Developer Relations'],
      valuePropositions: ['Curated App Selection', 'Trusted Applications', 'Easy Installation', 'Bitcoin Integration'],
      customerSegments: ['Bitcoin Users', 'Crypto Enthusiasts', 'Developers', 'Mobile Users'],
      channels: ['App Store', 'Crypto Communities', 'Social Media', 'Developer Forums'],
      revenueStreams: ['App Sales', 'Developer Fees', 'Premium Listings', 'Advertising'],
      costStructure: ['Platform Development', 'App Review', 'Marketing', 'Infrastructure']
    },
    {
      id: 132,
      title: 'Bitcoin Music',
      slug: 'bitcoin-music',
      description: 'Decentralized music streaming platform enabling artists to monetize directly through Bitcoin micropayments.',
      type: 'client' as const,
      status: 'Demo',
      liveUrl: 'https://bitcoin-music.vercel.app',
      tech: ['Next.js', 'TypeScript', 'Bitcoin', 'Audio Streaming', 'Micropayments'],
      cardImageUrls: ['/images/slugs/bitcoin-music.png'],
      subtitle: 'Bitcoin Music Platform',
      xUrl: 'https://x.com/bitcoin-music',
      notionUrl: 'https://www.notion.so/21d9c67aff39802bab23c588e9646bc2?v=21d9c67aff398083bfcf000c01aed8cb',
      githubUrl: 'https://github.com/b0ase/bitcoin-music',
      tokenName: '$bMusic',
      tokenProgressPercent: 0,
      price: 25000,
      keyPartners: ['Music Artists', 'Record Labels', 'Bitcoin Network', 'Audio CDNs'],
      keyActivities: ['Platform Development', 'Artist Onboarding', 'Payment Processing', 'Content Delivery'],
      valuePropositions: ['Direct Artist Payments', 'No Middlemen', 'Instant Micropayments', 'Global Access'],
      customerSegments: ['Music Artists', 'Music Listeners', 'Bitcoin Users', 'Independent Musicians'],
      channels: ['Direct Platform', 'Music Communities', 'Crypto Forums', 'Social Media'],
      revenueStreams: ['Transaction Fees', 'Premium Features', 'Artist Services', 'API Access'],
      costStructure: ['Streaming Infrastructure', 'Payment Processing', 'Development', 'Marketing']
    },
    {
      id: 108,
      title: 'Bitcoin File Utility',
      slug: 'bitcoin-file-utility',
      description: 'Advanced file management and utility platform for Bitcoin enthusiasts. Secure file encryption, decentralized storage, and Bitcoin-integrated file operations.',
      type: 'domain' as const,
      status: 'Demo',
      liveUrl: 'https://bitcoin-file-utility.vercel.app/',
      tech: ['Next.js', 'TypeScript', 'Bitcoin', 'File Encryption', 'Decentralized Storage', 'Blockchain'],
      cardImageUrls: ['/images/slugs/bitcoin-file-utility.png'],
      subtitle: 'Bitcoin File Management',
      xUrl: 'https://x.com/BTCFileUtility',
      notionUrl: 'https://www.notion.so/21d9c67aff39802bab23c588e9646bc2?v=21d9c67aff398083bfcf000c01aed8cb',
      githubUrl: 'https://github.com/b0ase/bitcoin-file-utility',
      tokenName: '$bFile',
      tokenProgressPercent: 0,
      tokenMarketUrl: '#',
      price: 20000,
      keyPartners: ['Bitcoin Network', 'Decentralized Storage Providers', 'File Security Experts', 'Blockchain Infrastructure', 'Encryption Services', 'Cloud Platforms'],
      keyActivities: ['File Encryption & Decryption', 'Bitcoin Integration', 'Decentralized Storage Management', 'Security Implementation', 'User Interface Development', 'Performance Optimization'],
      valuePropositions: ['Bitcoin-Powered File Security', 'Decentralized File Storage', 'End-to-End Encryption', 'Blockchain Verification', 'Cross-Platform Support', 'Privacy-First Design'],
      customerSegments: ['Bitcoin Enthusiasts', 'Privacy Advocates', 'Security Professionals', 'Content Creators', 'Crypto Developers', 'Data Privacy Users'],
      channels: ['Direct Platform', 'Bitcoin Communities', 'Privacy Forums', 'Developer Networks', 'Social Media', 'Tech Events'],
      revenueStreams: ['Premium Storage Plans', 'Advanced Encryption Features', 'API Access', 'Enterprise Solutions', 'White-label Services', 'Consultation Fees'],
      costStructure: ['Storage Infrastructure', 'Bitcoin Network Fees', 'Development & Maintenance', 'Security Audits', 'Marketing & Growth', 'Customer Support']
    },
    // BITCOIN OS APPS - Full Suite
    {
      id: 210,
      title: 'Bitcoin Art',
      slug: 'bitcoin-art',
      description: 'Digital art creation and gallery platform on Bitcoin. Create, mint, and trade art with blockchain provenance.',
      type: 'client' as const,
      status: 'Demo',
      liveUrl: 'https://bitcoin-art.vercel.app',
      tech: ['Next.js', 'TypeScript', 'Bitcoin', 'NFT', 'Canvas API'],
      cardImageUrls: ['/images/slugs/bitcoin-art.png'],
      subtitle: 'Bitcoin Art Gallery',
      tokenName: '$bArt',
      tokenProgressPercent: 0,
      price: 15000
    },
    {
      id: 211,
      title: 'Bitcoin Paint',
      slug: 'bitcoin-paint',
      description: 'Collaborative drawing and painting app with Bitcoin micropayments. Create art and earn satoshis.',
      type: 'client' as const,
      status: 'Demo',
      liveUrl: 'https://bitcoin-paint.vercel.app',
      tech: ['Next.js', 'TypeScript', 'Bitcoin', 'Canvas', 'WebSocket'],
      cardImageUrls: ['/images/slugs/bitcoin-paint.png'],
      subtitle: 'Bitcoin Paint App',
      tokenName: '$bPaint',
      tokenProgressPercent: 0,
      price: 12000
    },
    {
      id: 212,
      title: 'Bitcoin Radio',
      slug: 'bitcoin-radio',
      description: 'Decentralized radio streaming with Bitcoin tipping. Listen, broadcast, and support creators with micropayments.',
      type: 'client' as const,
      status: 'Demo',
      liveUrl: 'https://bitcoin-radio.vercel.app',
      tech: ['Next.js', 'TypeScript', 'Bitcoin', 'Audio Streaming', 'WebRTC'],
      cardImageUrls: ['/images/slugs/bitcoin-radio.png'],
      subtitle: 'Bitcoin Radio Station',
      tokenName: '$bRadio',
      tokenProgressPercent: 0,
      price: 18000
    },
    {
      id: 213,
      title: 'Bitcoin Code',
      slug: 'bitcoin-code',
      description: 'Code editor with Bitcoin integration. Write, share, and monetize code snippets on-chain.',
      type: 'client' as const,
      status: 'Demo',
      liveUrl: 'https://bitcoin-code.vercel.app',
      tech: ['Next.js', 'TypeScript', 'Bitcoin', 'Monaco Editor', 'Syntax Highlighting'],
      cardImageUrls: ['/images/slugs/bitcoin-code.png'],
      subtitle: 'Bitcoin Code Editor',
      tokenName: '$bCode',
      tokenProgressPercent: 0,
      price: 20000
    },
    {
      id: 214,
      title: 'Bitcoin Chat',
      slug: 'bitcoin-chat',
      description: 'Encrypted messaging with Bitcoin payments. Send messages and money in one seamless experience.',
      type: 'client' as const,
      status: 'Demo',
      liveUrl: 'https://bitcoin-chat.vercel.app',
      tech: ['Next.js', 'TypeScript', 'Bitcoin', 'E2E Encryption', 'WebSocket'],
      cardImageUrls: ['/images/slugs/bitcoin-chat.png'],
      subtitle: 'Bitcoin Messenger',
      tokenName: '$bChat',
      tokenProgressPercent: 0,
      price: 25000
    },
    {
      id: 215,
      title: 'Bitcoin Education',
      slug: 'bitcoin-education',
      description: 'Learn Bitcoin and earn while you study. Educational platform with rewards for completing courses.',
      type: 'client' as const,
      status: 'Demo',
      liveUrl: 'https://bitcoin-education.vercel.app',
      tech: ['Next.js', 'TypeScript', 'Bitcoin', 'LMS', 'Gamification'],
      cardImageUrls: ['/images/slugs/bitcoin-education.png'],
      subtitle: 'Bitcoin Learning Platform',
      tokenName: '$bEdu',
      tokenProgressPercent: 0,
      price: 22000
    },
    {
      id: 216,
      title: 'Bitcoin Identity',
      slug: 'bitcoin-identity',
      description: 'Self-sovereign identity on Bitcoin. Own your digital identity with blockchain verification.',
      type: 'client' as const,
      status: 'Demo',
      liveUrl: 'https://bitcoin-identity.vercel.app',
      tech: ['Next.js', 'TypeScript', 'Bitcoin', 'DID', 'Verifiable Credentials'],
      cardImageUrls: ['/images/slugs/bitcoin-identity.png'],
      subtitle: 'Bitcoin Digital Identity',
      tokenName: '$bID',
      tokenProgressPercent: 0,
      price: 30000
    },
    {
      id: 217,
      title: 'Bitcoin Maps',
      slug: 'bitcoin-maps',
      description: 'Find Bitcoin-accepting businesses worldwide. Crowdsourced map with reviews and directions.',
      type: 'client' as const,
      status: 'Demo',
      liveUrl: 'https://bitcoin-maps.vercel.app',
      tech: ['Next.js', 'TypeScript', 'Bitcoin', 'Mapbox', 'Geolocation'],
      cardImageUrls: ['/images/slugs/bitcoin-maps.png'],
      subtitle: 'Bitcoin Business Directory',
      tokenName: '$bMaps',
      tokenProgressPercent: 0,
      price: 18000
    },
    {
      id: 218,
      title: 'Bitcoin Photos',
      slug: 'bitcoin-photos',
      description: 'Photo storage and sharing with Bitcoin monetization. Upload, sell, and license your photos.',
      type: 'client' as const,
      status: 'Demo',
      liveUrl: 'https://bitcoin-photos.vercel.app',
      tech: ['Next.js', 'TypeScript', 'Bitcoin', 'Image Processing', 'CDN'],
      cardImageUrls: ['/images/slugs/bitcoin-photos.png'],
      subtitle: 'Bitcoin Photo Gallery',
      tokenName: '$bPhotos',
      tokenProgressPercent: 0,
      price: 16000
    },
    {
      id: 219,
      title: 'Bitcoin Jobs',
      slug: 'bitcoin-jobs',
      description: 'Job board for Bitcoin and crypto industry. Get paid in Bitcoin for your skills.',
      type: 'client' as const,
      status: 'Demo',
      liveUrl: 'https://bitcoin-jobs.vercel.app',
      tech: ['Next.js', 'TypeScript', 'Bitcoin', 'Job Matching', 'Escrow'],
      cardImageUrls: ['/images/slugs/bitcoin-jobs.png'],
      subtitle: 'Bitcoin Job Board',
      tokenName: '$bJobs',
      tokenProgressPercent: 0,
      price: 25000
    },
    {
      id: 220,
      title: 'Bitcoin Calendar',
      slug: 'bitcoin-calendar',
      description: 'Decentralized calendar and scheduling. Book appointments and pay with Bitcoin.',
      type: 'client' as const,
      status: 'Demo',
      liveUrl: 'https://bitcoin-calendar.vercel.app',
      tech: ['Next.js', 'TypeScript', 'Bitcoin', 'CalDAV', 'Scheduling'],
      cardImageUrls: ['/images/slugs/bitcoin-calendar.png'],
      subtitle: 'Bitcoin Scheduling',
      tokenName: '$bCal',
      tokenProgressPercent: 0,
      price: 14000
    },
    {
      id: 221,
      title: 'Bitcoin 3D',
      slug: 'bitcoin-3d',
      description: '3D modeling and visualization with Bitcoin integration. Create, trade, and monetize 3D assets.',
      type: 'client' as const,
      status: 'Demo',
      liveUrl: 'https://bitcoin-3d.vercel.app',
      tech: ['Next.js', 'TypeScript', 'Bitcoin', 'Three.js', 'WebGL'],
      cardImageUrls: ['/images/slugs/bitcoin-3d.png'],
      subtitle: 'Bitcoin 3D Studio',
      tokenName: '$b3D',
      tokenProgressPercent: 0,
      price: 20000
    },
    {
      id: 222,
      title: 'Bitcoin DNS',
      slug: 'bitcoin-dns-app',
      description: 'Decentralized domain name system on Bitcoin. Register and manage domains with blockchain security.',
      type: 'client' as const,
      status: 'Demo',
      liveUrl: 'https://bitcoin-dns.vercel.app',
      tech: ['Next.js', 'TypeScript', 'Bitcoin', 'DNS', 'Blockchain'],
      cardImageUrls: ['/images/slugs/bitcoin-dns.png'],
      subtitle: 'Bitcoin Domain System',
      tokenName: '$bDNS',
      tokenProgressPercent: 0,
      price: 35000
    },
    {
      id: 223,
      title: 'Bitcoin Browser',
      slug: 'bitcoin-browser',
      description: 'Web browser with native Bitcoin integration. Browse, pay, and earn while surfing the web.',
      type: 'client' as const,
      status: 'Demo',
      liveUrl: 'https://bitcoin-browser.vercel.app',
      tech: ['Next.js', 'TypeScript', 'Bitcoin', 'Browser Engine', 'Extensions'],
      cardImageUrls: ['/images/slugs/bitcoin-browser.png'],
      subtitle: 'Bitcoin Web Browser',
      tokenName: '$bBrowser',
      tokenProgressPercent: 0,
      price: 40000
    },
    {
      id: 224,
      title: 'Bitcoin Gaming',
      slug: 'bitcoin-gaming',
      description: 'Play-to-earn gaming platform on Bitcoin. Play games, win prizes, and trade in-game assets.',
      type: 'client' as const,
      status: 'Demo',
      liveUrl: 'https://bitcoin-gaming.vercel.app',
      tech: ['Next.js', 'TypeScript', 'Bitcoin', 'Game Engine', 'NFT'],
      cardImageUrls: ['/images/slugs/bitcoin-gaming.png'],
      subtitle: 'Bitcoin Game Platform',
      tokenName: '$bGame',
      tokenProgressPercent: 0,
      price: 30000
    },
    {
      id: 225,
      title: 'Bitcoin Social',
      slug: 'bitcoin-social',
      description: 'Decentralized social network with Bitcoin tipping. Share content and monetize your audience.',
      type: 'client' as const,
      status: 'Demo',
      liveUrl: 'https://bitcoin-social.vercel.app',
      tech: ['Next.js', 'TypeScript', 'Bitcoin', 'Social Graph', 'Micropayments'],
      cardImageUrls: ['/images/slugs/bitcoin-social.png'],
      subtitle: 'Bitcoin Social Network',
      tokenName: '$bSocial',
      tokenProgressPercent: 0,
      price: 35000
    },
    {
      id: 226,
      title: 'Bitcoin Books',
      slug: 'bitcoin-books',
      description: 'E-book marketplace with Bitcoin payments. Publish, sell, and read books with micropayments.',
      type: 'client' as const,
      status: 'Demo',
      liveUrl: 'https://bitcoin-books.vercel.app',
      tech: ['Next.js', 'TypeScript', 'Bitcoin', 'EPUB', 'DRM'],
      cardImageUrls: ['/images/slugs/bitcoin-books.png'],
      subtitle: 'Bitcoin Book Store',
      tokenName: '$bBooks',
      tokenProgressPercent: 0,
      price: 18000
    },
    {
      id: 227,
      title: 'Bitcoin Marketplace',
      slug: 'bitcoin-marketplace',
      description: 'P2P marketplace for goods and services using Bitcoin. Buy, sell, and trade with escrow protection.',
      type: 'client' as const,
      status: 'Demo',
      liveUrl: 'https://bitcoin-marketplace.vercel.app',
      tech: ['Next.js', 'TypeScript', 'Bitcoin', 'Escrow', 'P2P'],
      cardImageUrls: ['/images/slugs/bitcoin-marketplace.png'],
      subtitle: 'Bitcoin P2P Market',
      tokenName: '$bMarket',
      tokenProgressPercent: 0,
      price: 40000
    },
    {
      id: 228,
      title: 'Bitcoin Exchange',
      slug: 'bitcoin-exchange-app',
      description: 'Currency exchange platform for Bitcoin. Trade fiat and crypto with competitive rates.',
      type: 'client' as const,
      status: 'Demo',
      liveUrl: 'https://bitcoin-exchange.vercel.app',
      tech: ['Next.js', 'TypeScript', 'Bitcoin', 'Trading Engine', 'Order Book'],
      cardImageUrls: ['/images/slugs/bitcoin-exchange.png'],
      subtitle: 'Bitcoin Currency Exchange',
      tokenName: '$bExchange',
      tokenProgressPercent: 0,
      price: 50000
    },
    {
      id: 109,
      title: 'NPG RED',
      slug: 'npg-red',
      description: 'Premium NFT collection and marketplace for Ninja Punk Girls RED series. Features exclusive digital art, collectibles, and community rewards.',
      type: 'client' as const,
      status: 'Live',
      liveUrl: 'https://ninjapunkgirls.store',
      tech: ['Next.js', 'Web3', 'NFTs', 'Ethereum', 'IPFS', 'Smart Contracts'],
      cardImageUrls: ['/images/slugs/npg-red.jpg', '/videos/npg-red-slug.mp4'],
      subtitle: 'Ninja Punk Girls RED Collection',
      xUrl: 'https://x.com/NinjaPunkGirls',
      notionUrl: 'https://www.notion.so/npg-red',
      githubUrl: 'https://github.com/b0ase/npg-red',
      tokenName: '$NPGRED',
      tokenProgressPercent: 75,
      price: 150000,
      keyPartners: ['NFT Marketplaces', 'Blockchain Networks', 'Digital Artists', 'Community Partners', 'Web3 Platforms'],
      keyActivities: ['NFT Collection Creation', 'Marketplace Development', 'Community Building', 'Smart Contract Development', 'Digital Art Curation'],
      valuePropositions: ['Exclusive NFT Art', 'Community Rewards', 'Limited Edition Collectibles', 'Holder Benefits', 'Metaverse Integration'],
      customerSegments: ['NFT Collectors', 'Digital Art Enthusiasts', 'Crypto Investors', 'Gaming Community', 'Anime & Manga Fans'],
      channels: ['NFT Marketplaces', 'Discord Community', 'Twitter/X', 'Direct Website', 'Metaverse Platforms'],
      revenueStreams: ['NFT Sales', 'Secondary Market Royalties', 'Merchandise', 'Exclusive Access Passes', 'Community Events'],
      costStructure: ['Art Creation', 'Smart Contract Development', 'Marketing', 'Platform Fees', 'Community Management'],
      themeConfig: { primary: 'red', secondary: 'pink' }
    },
    {
      id: 43,
      title: 'Repository Tokenizer',
      slug: 'repository-tokenizer',
      description: 'Advanced repository analysis and tokenization platform that converts code repositories into structured data and tokens for blockchain integration.',
      type: 'domain' as const,
      status: 'Demo',
      liveUrl: 'https://tokeniser.vercel.app/',
      tech: ['Next.js', 'TypeScript', 'AI Analysis', 'Blockchain', 'Code Analysis', 'Tokenization'],
      cardImageUrls: ['/images/slugs/repository-tokenizer.png'],
      subtitle: 'Code Tokenization',
      xUrl: 'https://x.com/RepoTokenizer',
      notionUrl: 'https://www.notion.so/21d9c67aff39802bab23c588e9646bc2?v=21d9c67aff398083bfcf000c01aed8cb',
      githubUrl: 'https://github.com/b0ase/repository-tokenizer',
      tokenName: '$REPO',
      tokenProgressPercent: 0,
      price: 35000,
      keyPartners: ['GitHub', 'GitLab', 'Blockchain Networks', 'Developer Tools', 'Code Analysis Platforms', 'Token Exchanges'],
      keyActivities: ['Repository Analysis', 'Code Tokenization', 'Blockchain Integration', 'Developer Tools', 'Data Processing', 'Token Management'],
      valuePropositions: ['Automated Code Analysis', 'Repository Tokenization', 'Blockchain Integration', 'Developer Insights', 'Code Monetization', 'Smart Contract Generation'],
      customerSegments: ['Developers', 'Open Source Projects', 'Tech Companies', 'Blockchain Developers', 'Code Analysts', 'Token Creators'],
      channels: ['Developer Platforms', 'GitHub Integration', 'Tech Communities', 'Blockchain Events', 'Developer Conferences', 'API Marketplace'],
      revenueStreams: ['Analysis Fees', 'Token Creation Services', 'API Access', 'Premium Features', 'Enterprise Solutions', 'Consultation Services'],
      costStructure: ['Platform Development', 'AI Infrastructure', 'GitHub API Costs', 'Blockchain Fees', 'Marketing', 'Customer Support']
    },
    {
      id: 44,
      title: 'RAFSKITCHEN',
      slug: 'rafskitchen-website',
      description: 'Software Development Studio providing open-source tools for a decentralized future. Full-stack development, AI integration, blockchain solutions, and tech startup incubation.',
      type: 'domain' as const,
      status: 'Live',
      liveUrl: 'https://www.rafskitchen.website/',
      tech: ['Next.js', 'React', 'TypeScript', 'Blockchain', 'AI/ML', 'Smart Contracts', 'DeFi', 'Full-stack Development'],
      cardImageUrls: ['/images/slugs/rafskitchen-website.png'],
      subtitle: 'Software Development Studio',
      xUrl: 'https://x.com/rafskitchen',
      notionUrl: 'https://www.notion.so/21d9c67aff39802bab23c588e9646bc2?v=21d9c67aff398083bfcf000c01aed8cb',
      githubUrl: 'https://github.com/rafskitchen',
      tokenName: '$RAFS',
      tokenProgressPercent: 0,
      tokenMarketUrl: '#',
      price: 75000,
      keyPartners: ['Blockchain Networks', 'Tech Startups', 'DeFi Protocols', 'Open Source Communities', 'Investment Partners', 'Development Teams'],
      keyActivities: ['Startup Incubation', 'Blockchain Development', 'Smart Contract Development', 'DeFi Exchange Development', 'Technical Consulting', 'Open Source Development'],
      valuePropositions: ['End-to-End Tech Incubation', 'Blockchain Platform Development', 'Open Source Innovation', 'DeFi Solutions', 'AI Integration', 'Full-Stack Development'],
      customerSegments: ['Tech Startups', 'Blockchain Projects', 'DeFi Platforms', 'Enterprise Clients', 'Open Source Communities', 'Investment Firms'],
      channels: ['Direct Website', 'GitHub Community', 'Tech Conferences', 'Startup Networks', 'Social Media', 'Partner Referrals'],
      revenueStreams: ['Development Services', 'Consulting Fees', 'Incubation Services', 'Platform Development', 'Technical Architecture', 'Token Services'],
      costStructure: ['Development Team', 'Infrastructure Costs', 'Marketing & Outreach', 'Research & Development', 'Platform Maintenance', 'Community Building']
    },
    {
      id: 45,
      title: 'Wordpress Design London',
      slug: 'wordpress-design-london',
      description: 'Professional WordPress design and development services for London businesses. Custom themes, e-commerce solutions, and website optimization.',
      type: 'domain' as const,
      status: 'Live',
      liveUrl: 'http://129.213.161.247/wordpress/',
      tech: ['WordPress', 'PHP', 'MySQL', 'CSS', 'JavaScript', 'E-commerce', 'SEO'],
      cardImageUrls: ['/images/slugs/wordpress-design-london.png'],
      subtitle: 'WordPress Development',
      xUrl: '#',
      notionUrl: '#',
      githubUrl: '#',
      tokenName: '$WPLDN',
      tokenProgressPercent: 0,
      tokenMarketUrl: '#',
      price: 25000,
      keyPartners: ['WordPress Community', 'Hosting Providers', 'Theme Developers', 'Plugin Developers', 'London Businesses', 'Digital Agencies'],
      keyActivities: ['WordPress Development', 'Custom Theme Design', 'Plugin Development', 'Website Optimization', 'E-commerce Setup', 'SEO Implementation'],
      valuePropositions: ['Custom WordPress Solutions', 'Professional Design', 'London-Focused Service', 'E-commerce Integration', 'SEO Optimization', 'Responsive Design'],
      customerSegments: ['London Businesses', 'Small Enterprises', 'E-commerce Stores', 'Professional Services', 'Local Organizations', 'Startups'],
      channels: ['Direct Website', 'Local Business Networks', 'WordPress Communities', 'London Business Forums', 'Social Media', 'Referrals'],
      revenueStreams: ['Website Development', 'Custom Theme Design', 'Maintenance Services', 'Hosting Management', 'SEO Services', 'Training & Support'],
      costStructure: ['Development Resources', 'Hosting Infrastructure', 'Theme & Plugin Licenses', 'Marketing', 'Support Services', 'Training Materials']
    },
    {
      id: 46,
      title: 'Divvy',
      slug: 'divvy',
      description: 'Advanced dividend distribution application for seamless profit sharing and automated payouts. Built for businesses and investment funds to manage dividend distributions efficiently.',
      type: 'domain' as const,
      status: 'Live',
      liveUrl: 'https://divvy-neon.vercel.app/',
      tech: ['Next.js', 'TypeScript', 'React', 'Blockchain', 'Smart Contracts', 'DeFi', 'Web3'],
      cardImageUrls: ['/images/slugs/divvy.jpg', '/images/clientprojects/divvy/divvy-video-1.mp4'],
      subtitle: 'Dividends Distribution',
      xUrl: '#',
      notionUrl: '#',
      githubUrl: '#',
      tokenName: '$DIVVY',
      tokenProgressPercent: 0,
      tokenMarketUrl: '#',
      price: 35000,
      keyPartners: ['Investment Funds', 'Blockchain Networks', 'Financial Institutions', 'Corporate Clients', 'DeFi Protocols', 'Payment Processors'],
      keyActivities: ['Dividend Calculation', 'Automated Distribution', 'Smart Contract Development', 'Compliance Management', 'Financial Reporting', 'Platform Maintenance'],
      valuePropositions: ['Automated Dividend Distribution', 'Transparent Profit Sharing', 'Smart Contract Security', 'Real-time Payments', 'Compliance Tools', 'Multi-chain Support'],
      customerSegments: ['Investment Funds', 'Corporations', 'DAOs', 'Token Projects', 'Real Estate Funds', 'Private Equity'],
      channels: ['Direct Sales', 'Financial Networks', 'DeFi Communities', 'Enterprise Partnerships', 'Investment Forums', 'Blockchain Events'],
      revenueStreams: ['Platform Fees', 'Transaction Fees', 'Enterprise Licenses', 'Custom Implementations', 'API Access', 'Consulting Services'],
      costStructure: ['Development Team', 'Blockchain Infrastructure', 'Security Audits', 'Compliance & Legal', 'Customer Support', 'Marketing & Sales']
    },
    {
      id: 47,
      title: 'CherryX',
      slug: 'cherry-x',
      description: 'Street art inspired digital gallery featuring cherry-themed graffiti artwork and urban aesthetics. A vibrant collection showcasing contemporary digital art.',
      type: 'domain' as const,
      status: 'Live',
      liveUrl: 'https://www.cherry-xxx.website/',
      tech: ['Next.js', 'TypeScript', 'React', 'Digital Art', 'Gallery', 'Urban Design'],
      cardImageUrls: ['/images/slugs/cherry-x.jpg'],
      subtitle: 'Digital Art Gallery',
      xUrl: '#',
      notionUrl: '#',
      githubUrl: '#',
      tokenName: '$CHERRY',
      tokenProgressPercent: 0,
      tokenMarketUrl: '#',
      price: 15000,
      keyPartners: ['Digital Artists', 'Street Art Communities', 'Gallery Networks', 'Art Collectors', 'Urban Culture Brands', 'Creative Studios'],
      keyActivities: ['Art Curation', 'Digital Gallery Management', 'Artist Collaboration', 'Community Building', 'Exhibition Planning', 'Content Creation'],
      valuePropositions: ['Urban Art Showcase', 'Digital Gallery Experience', 'Street Art Culture', 'Artist Platform', 'Contemporary Aesthetics', 'Community Engagement'],
      customerSegments: ['Art Collectors', 'Street Art Enthusiasts', 'Digital Art Lovers', 'Urban Culture Fans', 'Creative Professionals', 'Gallery Visitors'],
      channels: ['Direct Website', 'Art Communities', 'Social Media', 'Gallery Networks', 'Street Art Forums', 'Creative Events'],
      revenueStreams: ['Art Sales', 'Gallery Visits', 'Artist Commissions', 'Merchandise', 'Exhibition Fees', 'Sponsorships'],
      costStructure: ['Artist Payments', 'Platform Development', 'Gallery Hosting', 'Marketing & Promotion', 'Content Creation', 'Community Management']
    },
    {
      id: 39,
      title: 'AUDEX',
      slug: 'audex-website',
      description: 'AI music platform with speculative markets for AI-generated tunes and artists. Create music like SUNO, then trade popularity futures and invest in AI artist royalties as their tracks gain traction.',
      type: 'domain' as const,
      status: 'Live',
      liveUrl: 'https://www.audex.website/',
      tech: ['Next.js', 'TypeScript', 'Web3', 'NFT', 'DeFi', 'Music Tech', 'Blockchain'],
      cardImageUrls: ['/images/slugs/audex-website.png'],
      subtitle: 'Music Finance',
      xUrl: '#',
      notionUrl: 'https://www.notion.so/21d9c67aff39802bab23c588e9646bc2?v=21d9c67aff398083bfcf000c01aed8cb',
      githubUrl: '#',
      tokenName: '$AUDEX',
      tokenProgressPercent: 0,
      price: 500000,
      keyPartners: ['Music Artists', 'NFT Marketplaces', 'Blockchain Networks', 'Music Labels', 'DeFi Protocols', 'Crypto Exchanges'],
      keyActivities: ['Music NFT Trading', 'Royalty Token Exchange', 'AI Music Generation', 'Mobile Wallet Development', 'Artist Onboarding', 'Platform Operations'],
      valuePropositions: ['First Music NFT DEX', 'Royalty Dividend Tokens', 'AI Music Studio', 'Hybrid Wallet/Player', 'Fractional Music Ownership', 'Artist Monetization'],
      customerSegments: ['Music Artists', 'NFT Collectors', 'Music Investors', 'DeFi Traders', 'Music Fans', 'Crypto Enthusiasts'],
      channels: ['Direct Platform', 'Music Industry Networks', 'Crypto Communities', 'Social Media', 'Artist Partnerships', 'Mobile App Stores'],
      revenueStreams: ['Trading Fees', 'NFT Marketplace Fees', 'Subscription Services', 'AI Studio Usage', 'Mobile App Revenue', 'Partnership Revenue'],
      costStructure: ['Platform Development', 'AI Infrastructure', 'Artist Partnerships', 'Marketing & User Acquisition', 'Legal & Compliance', 'Mobile App Development'],
      themeConfig: { primary: 'amber', secondary: 'purple' }
    },
    {
      ...createProjectStub(38, 'Ninja Punk Girls', 'A revolutionary NFT and digital art platform combining cyberpunk aesthetics with ninja culture. Unique community-driven ecosystem for digital collectibles, gaming, and immersive experiences.', 'Live', ['Next.js', 'TypeScript', 'Web3', 'NFT', 'AI', 'Gaming'], '$NPG', 25, [
        '/images/slugs/npg-com.png',
        '/images/slugs/npg-website-demo.png'
      ]), type: 'domain' as const, liveUrl: 'https://ninjapunkgirls.com', price: 380000,
      keyPartners: ['Digital Artists', 'NFT Marketplaces', 'Blockchain Networks', 'Gaming Platforms', 'Crypto Exchanges', 'Influencer Networks', 'AI Technology Providers'],
      keyActivities: ['AI Character Generation', 'NFT Minting', 'Community Building', 'Gaming Integration', 'Platform Operations', 'Partnership Development'],
      valuePropositions: ['AI-Generated Characters', 'Cyberpunk Ninja Aesthetics', 'Gaming Integration', 'Community Governance', 'Immersive Experiences', 'Cross-Platform Compatibility'],
      customerSegments: ['NFT Collectors', 'Gaming Community', 'Cyberpunk Fans', 'AI Enthusiasts', 'Digital Artists', 'Crypto Investors'],
      channels: ['Direct Platform', 'Gaming Communities', 'NFT Marketplaces', 'Social Media', 'Influencer Partnerships', 'Metaverse Platforms'],
      revenueStreams: ['NFT Sales', 'Gaming Fees', 'Platform Subscriptions', 'Character Licensing', 'Partnership Revenue', 'Community Memberships'],
      costStructure: ['AI Infrastructure', 'Gaming Development', 'Platform Hosting', 'Artist Partnerships', 'Marketing', 'Community Management'],
      status: 'Live',
      tokenName: '$NPG',
      customStats: [{ label: 'Market Cap', value: '$380,000' }],
      themeConfig: { primary: 'pink', secondary: 'cyan' }
    },
    {
      // Using createProjectStub for consistency, then overriding/adding specific fields
      ...createProjectStub(
        21, // New unique ID
        'marina3d.xyz', // Title
        'Cutting-edge 3D visualization and interactive experiences for the web.', // Description
        'Live', // Status
        ['Next.js', 'TypeScript', 'Three.js', 'WebGL'], // Example Tech Stack (customize as needed)
        '$MARS3D', // tokenName
        0, // tokenProgressPercent (0 if not applicable)
        ['/images/slugs/marina3dxyz.png'] // Updated image path
      ),
      type: 'domain' as const, // Ensure it's treated as a domain project
      liveUrl: 'https://marina3d.xyz', // Specific live URL
      subtitle: '3D Web', // Example subtitle
      price: 10000,
      keyPartners: ['3D Artists', 'WebGL Developers', 'Design Agencies', 'Tech Companies', 'VR/AR Studios', 'Creative Studios'],
      keyActivities: ['3D Modeling & Animation', 'WebGL Development', 'Interactive Design', 'Performance Optimization', 'Client Consultation', 'Creative Direction'],
      valuePropositions: ['Cutting-Edge 3D Web Experiences', 'Interactive Visualization', 'Cross-Platform Compatibility', 'Performance-Optimized Solutions', 'Custom 3D Development'],
      customerSegments: ['Design Agencies', 'E-commerce Brands', 'Architecture Firms', 'Product Companies', 'Entertainment Industry', 'Tech Startups'],
      channels: ['Direct Client Outreach', 'Design Community Networks', 'Portfolio Showcase', 'Industry Events', 'Referral Partners', 'Social Media'],
      revenueStreams: ['Custom 3D Development', 'Consultation Services', 'Licensing Fees', 'Maintenance Contracts', 'Training Workshops', 'Template Sales'],
      costStructure: ['Development Tools & Software', 'High-End Hardware', 'Talent Acquisition', 'R&D Investment', 'Marketing & Networking', 'Cloud Infrastructure']
    },
    {
      id: 140,
      title: 'AIVJ',
      slug: 'aivj-website',
      description: 'AI Video Jockey platform for creating stunning visual performances and real-time video mixing powered by artificial intelligence.',
      type: 'client' as const,
      status: 'Live',
      liveUrl: 'https://aivj.website/',
      tech: ['Next.js', 'TypeScript', 'AI', 'Video Processing', 'Real-time Graphics', 'WebGL'],
      cardImageUrls: ['/images/slugs/aivj-website.png'],
      subtitle: 'AI Video Jockey',
      xUrl: '#',
      notionUrl: 'https://www.notion.so/21d9c67aff39802bab23c588e9646bc2?v=21d9c67aff398083bfcf000c01aed8cb',
      githubUrl: '#',
      tokenName: '$AIVJ',
      tokenProgressPercent: 0,
      price: 25000,
      keyPartners: ['AI Providers', 'VJ Artists', 'Event Organizers', 'Music Venues', 'Visual Artists', 'Streaming Platforms'],
      keyActivities: ['AI Video Generation', 'Real-time Mixing', 'Visual Performance', 'Platform Development', 'Artist Collaboration', 'Content Creation'],
      valuePropositions: ['AI-Powered Visuals', 'Real-time Video Mixing', 'Cloud-based Platform', 'Artist Tools', 'Event Integration', 'Stunning Performances'],
      customerSegments: ['VJs', 'Event Organizers', 'Music Artists', 'Clubs', 'Festival Producers', 'Content Creators'],
      channels: ['Direct Platform', 'Music Industry', 'Event Networks', 'Social Media', 'Artist Communities', 'Streaming Services'],
      revenueStreams: ['Platform Subscriptions', 'Premium Features', 'Event Licensing', 'API Access', 'Custom Development', 'Training Services'],
      costStructure: ['AI Infrastructure', 'Video Processing', 'Platform Development', 'Marketing', 'Artist Support', 'Cloud Services'],
      themeConfig: { primary: 'gray', secondary: 'black' }
    },
    {
      id: 36,
      title: 'AI Girlfriends',
      slug: 'aigirlfriends-website',
      description: 'AI-powered companion platform featuring advanced conversational AI and personalized virtual relationships.',
      type: 'domain' as const,
      status: 'Live',
      liveUrl: 'https://aigirlfriends.website/',
      tech: ['AI', 'Machine Learning', 'Next.js', 'TypeScript', 'Natural Language Processing'],
      cardImageUrls: ['/images/slugs/aigirlfriends-website.jpg'],
      subtitle: 'AI Companion',
      xUrl: '#',
      notionUrl: 'https://www.notion.so/21d9c67aff39802bab23c588e9646bc2?v=21d9c67aff398083bfcf000c01aed8cb',
      githubUrl: 'https://github.com/b0ase/aigirlfriends',
      tokenName: '$AIGF',
      tokenProgressPercent: 52,
      price: 10000,
      keyPartners: ['AI Technology Providers', 'Cloud Infrastructure', 'Payment Processors', 'Content Creators', 'Mental Health Professionals', 'Dating Platforms'],
      keyActivities: ['AI Model Training', 'Conversation Design', 'User Experience Optimization', 'Safety & Moderation', 'Customer Support', 'Product Development'],
      valuePropositions: ['24/7 AI Companionship', 'Personalized Conversations', 'Emotional Support', 'Safe Social Interaction', 'Privacy-Focused Platform', 'Customizable Personalities'],
      customerSegments: ['Lonely Individuals', 'Social Anxiety Sufferers', 'Relationship Seekers', 'Tech Enthusiasts', 'Remote Workers', 'Elderly Users'],
      channels: ['Direct Website', 'Social Media Advertising', 'Influencer Marketing', 'App Stores', 'Content Marketing', 'SEO'],
      revenueStreams: ['Subscription Fees', 'Premium Features', 'Virtual Gifts', 'Custom Personality Creation', 'API Licensing', 'Advertising Revenue'],
      costStructure: ['AI Infrastructure', 'Content Moderation', 'Customer Support', 'Marketing & Acquisition', 'R&D', 'Legal & Compliance'],
      themeConfig: { primary: 'pink', secondary: 'purple' }
    },
    {
      ...createProjectStub(8, 'HyperFlix', 'Innovative memecoin marketing platform specializing in viral TikTok campaigns and social engagement.', 'B2C', ['TikTok', 'Social Media', 'Crypto'], '$HFLIX', 100, ['/images/slugs/hyperflix.png']), type: 'github' as const, liveUrl: 'https://hyper-flix.com', price: 10000,
      keyPartners: ['TikTok Influencers', 'Crypto Projects', 'Social Media Agencies', 'Content Creators', 'Marketing Platforms', 'Meme Communities'],
      keyActivities: ['Viral Content Creation', 'TikTok Campaign Management', 'Memecoin Marketing', 'Influencer Coordination', 'Community Engagement', 'Trend Analysis'],
      valuePropositions: ['Viral Marketing Expertise', 'TikTok Specialization', 'Memecoin Focus', 'High Engagement Rates', 'Creative Content', 'Rapid Campaign Execution'],
      customerSegments: ['Memecoin Projects', 'Crypto Startups', 'DeFi Protocols', 'NFT Projects', 'Social Media Brands', 'Entertainment Companies'],
      channels: ['TikTok Platform', 'Social Media Networks', 'Crypto Communities', 'Influencer Networks', 'Direct Outreach', 'Viral Campaigns'],
      revenueStreams: ['Campaign Management Fees', 'Performance Bonuses', 'Retainer Contracts', 'Content Creation', 'Strategy Consulting', 'Platform Partnerships'],
      costStructure: ['Influencer Payments', 'Content Production', 'Platform Advertising', 'Team Salaries', 'Technology Tools', 'Marketing & Sales']
    },
    {
      ...createProjectStub(9, 'Tribify AI', 'AI-powered community platform that connects like-minded individuals through shared interests.', 'SaaS', [], '$TRIBE', 100, ['/images/slugs/tribify-ai.jpg']), type: 'github' as const, liveUrl: 'https://tribify.ai', price: 10000,
      keyPartners: ['AI Technology Providers', 'Community Platforms', 'Social Networks', 'Content Creators', 'Data Analytics', 'Cloud Infrastructure'],
      keyActivities: ['AI Algorithm Development', 'Community Matching', 'Platform Development', 'User Engagement', 'Data Analysis', 'Content Moderation'],
      valuePropositions: ['AI-Powered Matching', 'Interest-Based Communities', 'Meaningful Connections', 'Personalized Experience', 'Safe Environment', 'Global Reach'],
      customerSegments: ['Social Seekers', 'Hobby Enthusiasts', 'Professional Networkers', 'Remote Workers', 'Introverts', 'Niche Interest Groups'],
      channels: ['App Stores', 'Social Media Marketing', 'Content Marketing', 'Influencer Partnerships', 'SEO', 'Community Referrals'],
      revenueStreams: ['Subscription Fees', 'Premium Features', 'Event Organization', 'Advertising Revenue', 'Partnership Fees', 'Data Insights'],
      costStructure: ['AI Development', 'Platform Hosting', 'Customer Acquisition', 'Content Moderation', 'Customer Support', 'R&D']
    },
    {
      ...createProjectStub(
        10,
        'AI Tribes',
        'Dynamic social network where AI agents and humans collaborate to create unique digital experiences.',
        'Platform',
        [],
        '$AITR',
        100,
        ['/images/slugs/aitribes-online.png']
      ), type: 'domain' as const, liveUrl: 'https://aitribes.online', price: 10000,
      keyPartners: ['AI Researchers', 'Tech Companies', 'Creative Studios', 'Gaming Platforms', 'Social Networks', 'Digital Artists'],
      keyActivities: ['AI Agent Development', 'Human-AI Interaction Design', 'Platform Engineering', 'Community Building', 'Content Creation', 'Experience Design'],
      valuePropositions: ['Human-AI Collaboration', 'Unique Digital Experiences', 'Creative AI Agents', 'Social Innovation', 'Future-Forward Platform', 'Collaborative Creation'],
      customerSegments: ['Tech Enthusiasts', 'AI Researchers', 'Creative Professionals', 'Digital Natives', 'Early Adopters', 'Innovation Seekers'],
      channels: ['Tech Communities', 'AI Conferences', 'Social Media', 'Developer Networks', 'Creative Platforms', 'Innovation Hubs'],
      revenueStreams: ['Platform Subscriptions', 'AI Agent Licensing', 'Premium Features', 'Enterprise Solutions', 'API Access', 'Creative Services'],
      costStructure: ['AI Development', 'Platform Infrastructure', 'Research & Development', 'Community Management', 'Marketing', 'Talent Acquisition']
    },
    {
      ...createProjectStub(
        11,
        'Lilith Tattoo Studio',
        'Elegant portfolio showcase for a renowned tattoo artist specializing in dark art and mystical designs.',
        'Service',
        [],
        '$LILITH',
        100,
        ['/images/slugs/lilith-tattoo-studio.png'] // Updated image path for lilithtattoo.com
      ),
      type: 'github' as const,
      liveUrl: 'https://lilithtattoo.com',
      price: 10000
    },
    { ...createProjectStub(12, 'MetaGraph', 'Innovative data visualization tool that transforms complex relationships into interactive 3D networks.', 'App', [], '$META', 100, ['/images/slugs/metagraph-app.jpg']), slug: 'metagraph-app', type: 'domain' as const, liveUrl: 'https://metagraph.app', price: 10000 },
    {
      ...createProjectStub(13, 'FLOOP!', 'A wallet with a token that acts like a dividend-bearing share.', 'Wallet', ['React', 'Node.js', 'Solidity'], '$FLOOP', 100, ['/images/slugs/floop.png']), slug: 'floop', type: 'github' as const, liveUrl: 'https://floop.online', price: 10000,
      keyPartners: ['Blockchain Networks', 'DeFi Protocols', 'Financial Institutions', 'Crypto Exchanges', 'Wallet Providers', 'Regulatory Bodies'],
      keyActivities: ['Wallet Development', 'Token Management', 'Dividend Distribution', 'Security Implementation', 'Compliance Management', 'User Support'],
      valuePropositions: ['Dividend-Bearing Tokens', 'Secure Wallet Solution', 'Passive Income Generation', 'Easy Token Management', 'Transparent Returns', 'User-Friendly Interface'],
      customerSegments: ['Crypto Investors', 'DeFi Users', 'Passive Income Seekers', 'Token Holders', 'Retail Investors', 'Institutional Clients'],
      channels: ['Direct Website', 'Crypto Communities', 'DeFi Platforms', 'Social Media', 'Influencer Marketing', 'Exchange Partnerships'],
      revenueStreams: ['Transaction Fees', 'Premium Features', 'Staking Rewards', 'Partnership Revenue', 'Token Sales', 'Consulting Services'],
      costStructure: ['Development Costs', 'Security Audits', 'Compliance & Legal', 'Infrastructure', 'Marketing', 'Customer Support']
    },
    { ...createProjectStub(15, 'Tribes Wallet', 'Secure multi-chain cryptocurrency wallet designed for community-driven token ecosystems.', 'App', [], '$TWALL', 100, ['/images/slugs/tribes-wallet.jpg']), type: 'github' as const, liveUrl: 'https://tribeswallet.com' },
    { ...createProjectStub(16, 'Penny Pics', 'Micro-payment based image marketplace where photographers earn per view.', 'E-commerce', [], '$PICS', 100, ['/images/slugs/penny-pics.jpg']), type: 'github' as const, liveUrl: 'https://pennypics.store' },
    {
      ...createProjectStub(17, 'Miss Void', 'Alternative fashion and fetish wear boutique featuring bold, avant-garde designs.', 'E-commerce', [], '$MISSVOID', 100, ['/images/slugs/miss-void.jpg']), type: 'domain' as const, liveUrl: 'https://missvoid.store',
      keyPartners: ['Fashion Designers', 'Textile Suppliers', 'Manufacturing Partners', 'Shipping Companies', 'Payment Processors', 'Influencers'],
      keyActivities: ['Product Design', 'Inventory Management', 'E-commerce Operations', 'Brand Marketing', 'Customer Service', 'Quality Control'],
      valuePropositions: ['Unique Cyberpunk Fashion', 'Avant-Garde Designs', 'Limited Edition Pieces', 'High-Quality Materials', 'Exclusive Collections', 'Dystopian Aesthetic'],
      customerSegments: ['Fashion Enthusiasts', 'Cyberpunk Fans', 'Alternative Fashion', 'Young Adults', 'Cosplayers', 'Trendsetters'],
      channels: ['E-commerce Website', 'Social Media', 'Fashion Shows', 'Influencer Collaborations', 'Pop-up Stores', 'Online Marketplaces'],
      revenueStreams: ['Product Sales', 'Limited Editions', 'Collaborations', 'Accessories', 'Digital Fashion', 'Brand Licensing'],
      costStructure: ['Manufacturing', 'Materials', 'Marketing', 'Inventory', 'Shipping', 'Platform Fees']
    },
    { ...createProjectStub(18, 'Interior Design Pro', 'Virtual interior design consultation platform with AI-powered room visualization.', 'Service', [], '$NTR', 100, ['/images/slugs/interior-design-pro.jpg']), type: 'github' as const, liveUrl: 'https://interiordesigns.website' },
    {
      id: 22,
      title: 'Mikrocosm',
      slug: 'mikrocosm-com',
      description: 'A collection of creative coding projects, physical computing experiments, and audio-visual explorations. Projects include drum machine emulators, I Ching turntables, and space-time visualizations.',
      type: 'domain' as const,
      status: 'active',
      liveUrl: 'https://mikrocosm2.vercel.app/',
      tech: ['Creative Coding', 'Max', 'OpenFrameworks', 'Processing', 'Physical Computing'],
      cardImageUrls: ['/images/slugs/mikrocosm-com.png'],
      subtitle: 'Creative Coding',
      xUrl: '#',
      notionUrl: 'https://www.notion.so/21d9c67aff39802bab23c588e9646bc2?v=21d9c67aff398083bfcf000c01aed8cb',
      githubUrl: '#',
      tokenName: '$MIKRO',
      tokenProgressPercent: 0,
      price: 10000
    },
    {
      id: 23,
      title: 'v01d Store',
      slug: 'v01d-store',
      description: 'Minimalist streetwear brand featuring bold black and white prints and urban aesthetics. Fashion for the digitally native with a "less is more" philosophy that embraces the void.',
      type: 'domain' as const,
      status: 'active',
      liveUrl: 'https://v01d.store/',
      tech: ['E-commerce', 'Next.js', 'Shopify', 'React', 'TypeScript'],
      cardImageUrls: ['/images/slugs/v01d-store.png'],
      subtitle: 'Streetwear',
      xUrl: '#',
      notionUrl: 'https://www.notion.so/21d9c67aff39802bab23c588e9646bc2?v=21d9c67aff398083bfcf000c01aed8cb',
      githubUrl: '#',
      tokenName: '$MISSVOID',
      tokenProgressPercent: 0,
      price: 10000
    },
    {
      id: 27,
      title: 'Senseii',
      slug: 'senseii-zeta.vercel.app',
      description: 'AI-powered Bitcoin education platform featuring Satoshi as your personal teacher.',
      type: 'github' as const,
      status: 'Development',
      liveUrl: 'https://senseii-zeta.vercel.app/',
      tech: ['AI', 'Bitcoin SV', 'Next.js', 'TypeScript', 'Blockchain', 'Micropayments'],
      cardImageUrls: ['/images/slugs/senseii-zeta-vercel-app.jpg'],
      subtitle: 'Bitcoin Education',
      xUrl: '#',
      notionUrl: 'https://www.notion.so/21d9c67aff39802bab23c588e9646bc2?v=21d9c67aff398083bfcf000c01aed8cb',
      githubUrl: '#',
      tokenName: '$SENSEI',
      tokenProgressPercent: 0,
      keyPartners: ['Bitcoin SV Network', 'Educational Institutions', 'AI Technology Providers', 'Wallet Providers', 'Content Creators', 'Blockchain Developers'],
      keyActivities: ['AI Education Platform Development', 'Bitcoin SV Integration', 'Content Creation', 'Micropayment Processing', 'Community Building', 'Curriculum Development'],
      valuePropositions: ['AI-Powered Bitcoin Education', 'Micropayment Learning', 'Satoshi AI Teacher', 'Wallet-Based Authentication', 'Original Bitcoin Vision', 'Practical Learning'],
      customerSegments: ['Bitcoin Enthusiasts', 'Crypto Beginners', 'Developers', 'Educators', 'Students', 'Blockchain Professionals'],
      channels: ['Direct Platform', 'Bitcoin Communities', 'Educational Partnerships', 'Developer Networks', 'Social Media', 'Crypto Events'],
      revenueStreams: ['Course Fees', 'Micropayment Processing', 'Premium Content', 'Certification Programs', 'Enterprise Training', 'API Licensing'],
      costStructure: ['AI Development', 'Content Creation', 'Platform Infrastructure', 'Bitcoin SV Integration', 'Marketing', 'Legal & Compliance']
    },
    {
      id: 31,
      title: 'Vex Void',
      slug: 'vexvoid-com',
      description: 'Ambient trip-hop, dark underground musician and AV artist. Vex Void creates immersive audio-visual experiences blending experimental electronic music, live visuals, and cyberpunk aesthetics.',
      type: 'domain' as const,
      status: 'active',
      liveUrl: 'https://vexvoid.com/',
      tech: ['Next.js', 'TypeScript', 'React', 'Three.js', 'WebGL', 'GSAP'],
      cardImageUrls: ['/images/slugs/vexvoid-com.png'],
      subtitle: 'AV Artist',
      xUrl: '#',
      notionUrl: 'https://www.notion.so/21d9c67aff39802bab23c588e9646bc2?v=21d9c67aff398083bfcf000c01aed8cb',
      githubUrl: '#',
      tokenName: '$VEX',
      tokenProgressPercent: 0,
      price: 10000
    },
    {
      id: 33,
      title: 'V3XV0ID AV Client',
      slug: 'vexvoid-av-client',
      description: 'Cutting-edge dual-palette crossfading image and video animator with cyber aesthetic branding. Professional VJ/DJ-style tool for live performers and visual artists.',
      tech: ['Electron', 'JavaScript', 'WebGL', 'Video Processing', 'Real-time Graphics'],
      githubUrl: 'https://github.com/b0ase/vexvoid-AV-client',
      liveUrl: 'https://b0ase.github.io/vexvoid-AV-client/',
      xUrl: '#',
      notionUrl: 'https://www.notion.so/21d9c67aff39802bab23c588e9646bc2?v=21d9c67aff398083bfcf000c01aed8cb',
      status: 'Live',
      type: 'domain' as const,
      tokenName: '$V3X',
      tokenProgressPercent: 0,
      cardImageUrls: ['/images/slugs/vexvoid-av-client.jpg']
    },
    {
      id: 37,
      title: 'WebsiteStrategy Pro',
      slug: 'websitestrategypro2025',
      description: 'Get the exact 7-step framework that built 500+ profitable websites. Complete strategy workshop turning websites into customer-generating machines with proven methodology used for $10,000+ projects.',
      tech: ['Marketing', 'Next.js', 'TypeScript', 'Conversion Optimization', 'Lead Generation'],
      githubUrl: '#',
      liveUrl: 'https://websitestrategypro2025.vercel.app/',
      xUrl: '#',
      notionUrl: 'https://www.notion.so/21d9c67aff39802bab23c588e9646bc2?v=21d9c67aff398083bfcf000c01aed8cb',
      status: 'Live',
      type: 'github' as const,
      tokenName: '$WSPRO',
      tokenProgressPercent: 0,
      cardImageUrls: ['/images/slugs/websitestrategypro2025.jpg']
    },
    {
      id: 24,
      title: 'Future of Blockchain Research',
      slug: 'future-of-blockchain-research',
      description: 'Open research initiative examining blockchain network evolution, convergence theory, and the economic forces driving architectural decisions. Exploring PoS vs PoW models and efficiency pressures.',
      type: 'github' as const,
      status: 'active',
      liveUrl: 'https://future-of-blockchain.vercel.app/',
      tech: ['Research', 'Next.js', 'TypeScript', 'Data Analysis', 'Economic Modeling'],
      cardImageUrls: ['/images/slugs/future-of-blockchain-research.jpg'],
      subtitle: 'Blockchain Research',
      xUrl: '#',
      notionUrl: 'https://www.notion.so/21d9c67aff39802bab23c588e9646bc2?v=21d9c67aff398083bfcf000c01aed8cb',
      githubUrl: '#',
      tokenName: '$RESEARCH',
      tokenProgressPercent: 100
    },
    {
      id: 25,
      title: 'BitDNS',
      slug: 'bitdns-website',
      description: 'Decentralized domain name system implementation leveraging blockchain technology for censorship-resistant and distributed DNS resolution.',
      type: 'github' as const,
      status: 'active',
      liveUrl: 'https://bitdns.website',
      tech: ['Bitcoin Script', 'DNS', 'Blockchain', 'TypeScript'],
      cardImageUrls: ['/images/slugs/bitdns-website.jpg'],
      subtitle: 'DNS System',
      xUrl: '#',
      notionUrl: 'https://www.notion.so/21d9c67aff39802bab23c588e9646bc2?v=21d9c67aff398083bfcf000c01aed8cb',
      githubUrl: '#',
      tokenName: '$BITDNS',
      tokenProgressPercent: 100
    },
    {
      id: 26,
      title: 'BitCDN',
      slug: 'bitcdn-website',
      description: 'Blockchain-based content delivery network providing decentralized, efficient, and censorship-resistant content distribution infrastructure.',
      type: 'github' as const,
      status: 'active',
      liveUrl: 'https://bitcdn.website',
      tech: ['CDN', 'Blockchain', 'BitTorrent', 'TypeScript'],
      cardImageUrls: ['/images/slugs/bitcdn-website.png'],
      subtitle: 'Content Network',
      xUrl: '#',
      notionUrl: 'https://www.notion.so/21d9c67aff39802bab23c588e9646bc2?v=21d9c67aff398083bfcf000c01aed8cb',
      githubUrl: '#',
      tokenName: '$BITCDN',
      tokenProgressPercent: 100
    },

    {
      id: 34,
      title: 'AI Builders Club',
      slug: 'aibuildersclub-website',
      description: 'Community platform for AI builders and developers to collaborate, share projects, and build the future of artificial intelligence together.',
      type: 'domain' as const,
      status: 'Live',
      liveUrl: 'https://aibuildersclub.website/',
      tech: ['AI', 'Community', 'Next.js', 'TypeScript', 'React'],
      cardImageUrls: [
        '/images/slugs/aibuildersclub-website.jpg'
      ],
      subtitle: 'AI Community',
      xUrl: '#',
      notionUrl: 'https://www.notion.so/21d9c67aff39802bab23c588e9646bc2?v=21d9c67aff398083bfcf000c01aed8cb',
      githubUrl: '#',
      tokenName: '$AIBC',
      tokenProgressPercent: 0,
      keyPartners: ['AI Researchers', 'Tech Companies', 'Educational Platforms', 'Developer Communities', 'Startup Incubators', 'AI Tool Providers'],
      keyActivities: ['Community Building', 'Educational Content Creation', 'Project Collaboration', 'Networking Events', 'Resource Sharing', 'Mentorship Programs'],
      valuePropositions: ['AI Builder Community', 'Collaborative Learning', 'Project Sharing', 'Expert Network', 'Resource Access', 'Career Development'],
      customerSegments: ['AI Developers', 'Machine Learning Engineers', 'Tech Entrepreneurs', 'Students', 'Researchers', 'AI Enthusiasts'],
      channels: ['Community Platform', 'Tech Events', 'Social Media', 'Educational Partnerships', 'Developer Networks', 'AI Conferences'],
      revenueStreams: ['Membership Fees', 'Event Tickets', 'Premium Content', 'Job Board', 'Sponsorships', 'Training Programs'],
      costStructure: ['Platform Development', 'Content Creation', 'Event Organization', 'Community Management', 'Marketing', 'Infrastructure']
    },
    {
      id: 120,
      title: 'overNERD',
      slug: 'overnerd-website',
      description: 'Dynamic comic gallery website showcasing the OVERNERD comic collection with integrated blockchain tokenization and dividend-bearing shares.',
      type: 'domain' as const,
      status: 'Live',
      liveUrl: 'https://overnerd.website',
      tech: ['HTML5', 'CSS3', 'JavaScript', 'Blockchain', 'Comics', 'Glass Morphism'],
      cardImageUrls: ['/images/slugs/overnerd-website.png'],
      subtitle: 'Comic Gallery',
      xUrl: '#',
      notionUrl: 'https://www.notion.so/21d9c67aff39802bab23c588e9646bc2?v=21d9c67aff398083bfcf000c01aed8cb',
      githubUrl: '#',
      tokenName: '$NERD',
      tokenProgressPercent: 100
    },
    {
      id: 110,
      title: 'One-Shot Comics Store',
      slug: 'oneshotcomics',
      description: 'Digital marketplace for unique and AI-generated comic books.',
      type: 'client' as const,
      status: 'Live',
      liveUrl: 'https://oneshotcomics.store',
      tech: ['Next.js', 'TypeScript', 'Supabase', 'Stripe'],
      cardImageUrls: [
        '/images/slugs/oneshotcomics.png',
      ],
      subtitle: 'E-commerce for Comics',
      xUrl: '#',
      notionUrl: 'https://www.notion.so/21d9c67aff39802bab23c588e9646bc2?v=21d9c67aff398083bfcf000c01aed8cb',
      githubUrl: '#',
      tokenName: '$1SHOT',
      tokenProgressPercent: 0,
      keyPartners: ['Comic Book Artists', 'Writers', 'NFT Marketplaces', 'Blockchain Networks', 'Print Publishers', 'Digital Collectible Platforms', 'Crypto Exchanges'],
      keyActivities: ['Comic Creation', 'NFT Minting', 'Marketplace Operations', 'Community Building', 'Marketing & Promotion', 'Token Management'],
      valuePropositions: ['Ownable Digital Comics', 'Limited Edition NFT Issues', 'Royalties for Creators', 'Multichain Token Utility', 'Direct-to-Collector Sales', 'Community Voting on Storylines'],
      customerSegments: ['Comic Collectors', 'NFT Enthusiasts', 'Crypto Investors', 'Comic Book Fans', 'Digital Art Collectors', 'Speculators'],
      channels: ['NFT Marketplaces', 'Social Media', 'Comic Conventions', 'Online Communities', 'Direct Website Sales', 'Influencer Partnerships'],
      revenueStreams: ['NFT Sales', 'Royalties', 'Token Transactions', 'Merchandise', 'Special Edition Drops', 'Advertising'],
      costStructure: ['Artist & Writer Payments', 'Platform Development', 'Blockchain Fees', 'Marketing', 'Community Management', 'Legal & Compliance']
    },
    {
      id: 111,
      title: 'Robust Engineering',
      slug: 'robust-ae-com',
      description: 'Industrial automation and embedded systems development company. Services include embedded systems development, industrial automation solutions, and professional electrical engineering consultancy.',
      type: 'domain' as const,
      status: 'Live',
      liveUrl: 'https://robust-ae.com/',
      tech: ['Embedded Systems', 'Industrial Automation', 'Next.js', 'TypeScript', 'React'],
      cardImageUrls: ['/images/slugs/robust-ae-com.png'],
      subtitle: 'Engineering & Automation',
      xUrl: '#',
      notionUrl: 'https://www.notion.so/21d9c67aff39802bab23c588e9646bc2?v=21d9c67aff398083bfcf000c01aed8cb',
      githubUrl: 'https://github.com/b0ase/robust-ae',
      tokenName: '$ROBUST',
      tokenProgressPercent: 0,
      price: 10000,
      keyPartners: ['Industrial Equipment Manufacturers', 'SCADA System Providers', 'Blockchain Infrastructure', 'IoT Sensor Manufacturers', 'Cybersecurity Firms', 'Regulatory Bodies'],
      keyActivities: ['SCADA System Development', 'Blockchain Integration', 'Industrial Automation', 'Embedded Systems Design', 'Security Auditing', 'Compliance Certification'],
      valuePropositions: ['Blockchain-Secured SCADA Systems', 'Auditable Industrial Software Pipeline', 'Complete Hardware/Software Solutions', 'Regulatory Compliance', 'Real-time Monitoring', 'Immutable Audit Trails'],
      customerSegments: ['Manufacturing Plants', 'Power Generation Facilities', 'Oil & Gas Operations', 'Water Treatment Plants', 'Chemical Processing', 'Pharmaceutical Manufacturing'],
      channels: ['Direct Engineering Consultancy', 'Industrial Trade Shows', 'Engineering Associations', 'Government Contracts', 'Equipment Manufacturers', 'System Integrators'],
      revenueStreams: ['SCADA System Development', 'Blockchain Integration Services', 'Hardware Manufacturing', 'Software Licensing', 'Maintenance Contracts', 'Training & Certification'],
      costStructure: ['Engineering R&D', 'Hardware Manufacturing', 'Cybersecurity Infrastructure', 'Regulatory Compliance', 'Blockchain Infrastructure', 'Quality Assurance'],
      businessModel: {
        overview: "Robust Engineering delivers complete hardware/software solutions for industrial automation with blockchain-secured SCADA systems, providing auditable, immutable records for critical infrastructure operations.",
        coreServices: [
          "Blockchain-Secured SCADA Development",
          "Industrial IoT Hardware Design",
          "Embedded Systems Engineering",
          "Cybersecurity Implementation",
          "Regulatory Compliance Solutions",
          "Audit Trail Management"
        ],
        technologyStack: {
          hardware: ["Custom PCB Design", "Industrial Controllers", "IoT Sensors", "Edge Computing Devices", "Secure Communication Modules"],
          software: ["SCADA Systems", "Blockchain Integration", "Real-time Monitoring", "Predictive Analytics", "Security Protocols"],
          blockchain: ["Smart Contracts", "Immutable Logging", "Decentralized Verification", "Token Economics", "Audit Trails"]
        },
        securityFeatures: [
          "End-to-end encryption for all data transmission",
          "Blockchain-immutable audit trails for all operations",
          "Multi-factor authentication for system access",
          "Real-time threat detection and response",
          "Compliance with industrial cybersecurity standards",
          "Tamper-evident hardware and software design"
        ],
        complianceStandards: [
          "IEC 62443 (Industrial Cybersecurity)",
          "NERC CIP (Critical Infrastructure Protection)",
          "ISO 27001 (Information Security)",
          "NIST Cybersecurity Framework",
          "ISA/IEC 62443 (Industrial Automation Security)",
          "GDPR and Data Protection Regulations"
        ],
        targetIndustries: [
          "Power Generation and Distribution",
          "Oil and Gas Processing",
          "Chemical Manufacturing",
          "Water Treatment and Distribution",
          "Pharmaceutical Production",
          "Food and Beverage Processing"
        ],
        competitiveAdvantages: [
          "First-mover advantage in blockchain-secured SCADA",
          "Complete hardware/software solution provider",
          "Deep expertise in industrial cybersecurity",
          "Regulatory compliance expertise",
          "Proven track record in critical infrastructure",
          "Innovative token economics for system governance"
        ],
        revenueModel: {
          primary: "Project-based SCADA system development and deployment",
          recurring: "Software licensing and maintenance contracts",
          consulting: "Cybersecurity audits and compliance consulting",
          training: "Operator training and certification programs",
          hardware: "Custom industrial IoT device manufacturing"
        },
        marketOpportunity: {
          size: "Global industrial automation market valued at $200+ billion",
          growth: "15% annual growth in industrial cybersecurity",
          drivers: "Increasing regulatory requirements, cybersecurity threats, and need for audit trails",
          barriers: "High technical expertise requirements, regulatory compliance complexity"
        },
        tokenEconomics: {
          utility: "$ROBUST tokens provide governance rights and access to premium features",
          rewards: "Token rewards for system performance and security compliance",
          staking: "Stake tokens to participate in system governance and earn rewards",
          governance: "Token holders vote on system upgrades and security protocols"
        }
      }
    },
    {
      id: 112,
      title: 'Minecraft Party',
      slug: 'minecraftparty-website',
      description: 'Interactive Minecraft-themed party planning and event management platform for gaming communities and event organizers.',
      type: 'client' as const,
      status: 'Live',
      liveUrl: 'https://minecraftparty.website',
      tech: ['Next.js', 'TypeScript', 'React', 'Minecraft API', 'Event Management'],
      cardImageUrls: ['/images/slugs/minecraftparty-website.jpg'],
      subtitle: 'Minecraft Event Platform',
      xUrl: '#',
      notionUrl: 'https://www.notion.so/21d9c67aff39802bab23c588e9646bc2?v=21d9c67aff398083bfcf000c01aed8cb',
      githubUrl: '#',
      tokenName: '$MCPY',
      tokenProgressPercent: 0,
      keyPartners: ['Minecraft Content Creators', 'Gaming Communities', 'Event Venues', 'Streaming Platforms', 'Gaming Equipment Suppliers', 'Community Managers'],
      keyActivities: ['Event Planning & Coordination', 'Platform Development', 'Community Building', 'Gaming Integration', 'Marketing & Promotion', 'User Support'],
      valuePropositions: ['Easy Minecraft Event Planning', 'Community Management Tools', 'Gaming Integration', 'Automated Event Coordination', 'Real-time Communication', 'Customizable Event Templates'],
      customerSegments: ['Minecraft Communities', 'Event Organizers', 'Gaming Groups', 'Content Creators', 'Streamers', 'Gaming Enthusiasts'],
      channels: ['Gaming Platforms', 'Social Media', 'Minecraft Communities', 'Streaming Platforms', 'Gaming Forums', 'Direct Marketing'],
      revenueStreams: ['Event Planning Fees', 'Premium Features', 'Community Subscriptions', 'Advertising', 'Partnerships', 'Merchandise'],
      costStructure: ['Platform Development', 'Server Infrastructure', 'Marketing', 'Community Management', 'Customer Support', 'Partnerships']
    },
    {
      id: 113,
      title: 'BSV API',
      slug: 'bsvapi-com',
      description: 'Comprehensive Bitcoin SV (BSV) API platform providing developers with easy access to BSV blockchain data and transaction services.',
      type: 'github' as const,
      status: 'Development',
      liveUrl: 'https://bsvapi.com',
      tech: ['Bitcoin SV', 'API Development', 'Blockchain', 'TypeScript', 'Node.js'],
      cardImageUrls: ['/images/slugs/bsvapi-com.jpg'],
      subtitle: 'Bitcoin SV API Platform',
      xUrl: '#',
      notionUrl: 'https://www.notion.so/21d9c67aff39802bab23c588e9646bc2?v=21d9c67aff398083bfcf000c01aed8cb',
      githubUrl: '#',
      tokenName: '$BSVAPI',
      tokenProgressPercent: 0,
      keyPartners: ['Bitcoin SV Developers', 'Blockchain Infrastructure Providers', 'Crypto Exchanges', 'Payment Processors', 'Developer Communities', 'BSV Ecosystem Projects'],
      keyActivities: ['API Development & Maintenance', 'Blockchain Integration', 'Developer Support', 'Documentation', 'Infrastructure Management', 'Community Building'],
      valuePropositions: ['Easy BSV Blockchain Access', 'Comprehensive API Documentation', 'High-Performance Infrastructure', 'Developer-Friendly Tools', 'Real-time Data Access', 'Cost-Effective Solutions'],
      customerSegments: ['Blockchain Developers', 'Crypto Exchanges', 'Payment Processors', 'DeFi Applications', 'Enterprise Clients', 'Startups'],
      channels: ['Developer Communities', 'Blockchain Conferences', 'Online Documentation', 'Social Media', 'Direct Sales', 'Partnerships'],
      revenueStreams: ['API Usage Fees', 'Premium Features', 'Enterprise Plans', 'Consulting Services', 'Training Programs', 'Partnerships'],
      costStructure: ['Infrastructure Costs', 'Development Team', 'Marketing', 'Customer Support', 'Legal & Compliance', 'Community Management']
    },
    // Github Projects
    {
      id: 0,
      title: 'Boase',
      slug: 'boase',
      description: 'The personal holding company and venture studio of Richard Boase. Building the future of the internet on Bitcoin.',
      type: 'company' as const,
      status: 'Live',
      liveUrl: 'https://b0ase.com',
      tech: ['Venture Studio', 'Holding Company', 'Bitcoin', 'AI'],
      cardImageUrls: ['/b0ase_logo.png'],
      subtitle: 'Venture Studio',
      xUrl: 'https://x.com/richardboase',
      notionUrl: '#',
      githubUrl: 'https://github.com/b0ase',
      tokenName: '$BOASE',
      tokenProgressPercent: 100,
      price: 1000000,
      keyPartners: ['Bitcoin Corporation', 'Ninja Punk Girls', 'All Portfolio Companies'],
      keyActivities: ['Venture Building', 'Investment', 'Strategy', 'Architecture'],
      valuePropositions: ['Ecosystem Leadership', 'Strategic Vision', 'Cross-Pollination', 'Capital Allocation'],
      customerSegments: ['Investors', 'Partners', 'Employees'],
      channels: ['Direct', 'Network', 'Social Media'],
      revenueStreams: ['Dividends', 'Exits', 'Consulting'],
      costStructure: ['Operations', 'Legal', 'Team'],
      themeConfig: { primary: 'black', secondary: 'white' }
    },
    {
      id: 4,
      title: 'BitPension',
      slug: 'penshun',
      description: 'Fork of simply-stream: Lock to Stream Bitcoin. Investigating streaming payment models.',
      tech: ['JavaScript'],
      githubUrl: 'https://github.com/b0ase/Penshun',
      xUrl: '#',
      notionUrl: 'https://www.notion.so/21d9c67aff39802bab23c588e9646bc2?v=21d9c67aff398083bfcf000c01aed8cb',
      status: 'Investigation',
      type: 'github' as const,
      tokenName: '$PENSHUN',
      tokenProgressPercent: 0,
      cardImageUrls: ['/images/slugs/bitpension.jpg']
    },
    {
      id: 5,
      title: 'Weight',
      slug: 'weight',
      description: 'measuring the amount of micropayments that have called a particular piece of content online',
      tech: ['TypeScript'],
      githubUrl: 'https://github.com/b0ase/Weight',
      xUrl: '#',
      notionUrl: 'https://www.notion.so/21d9c67aff39802bab23c588e9646bc2?v=21d9c67aff398083bfcf000c01aed8cb',
      status: 'Experiment',
      type: 'github' as const,
      tokenName: '$WEIGHT',
      tokenProgressPercent: 0,
      cardImageUrls: ['/images/slugs/weight.jpg']
    },
    {
      id: 6,
      title: 'YourCash',
      slug: 'yourcash',
      description: 'Fork of Yours Wallet: Yours/HandCash Integration exploration.',
      tech: ['JavaScript'],
      githubUrl: 'https://github.com/b0ase/YourCash',
      xUrl: '#',
      notionUrl: 'https://www.notion.so/21d9c67aff39802bab23c588e9646bc2?v=21d9c67aff398083bfcf000c01aed8cb',
      status: 'Archived/Study',
      type: 'github' as const,
      tokenName: '$YHC',
      tokenProgressPercent: 0,
      cardImageUrls: ['/images/slugs/yourcash.jpg']
    },
    {
      id: 19,
      title: 'Index Token',
      slug: 'index-token',
      description: 'Concept and development for an index-based token system.',
      tech: ['Solidity', 'TypeScript'],
      githubUrl: 'https://github.com/b0ase/index-token',
      xUrl: '#',
      notionUrl: 'https://www.notion.so/21d9c67aff39802bab23c588e9646bc2?v=21d9c67aff398083bfcf000c01aed8cb',
      status: 'Development',
      type: 'github' as const,
      tokenName: '$INDEX',
      tokenProgressPercent: 0,
      cardImageUrls: ['/images/development/index-token/boase4982_a_logo_for_index_corporation_--v_6.1_4193a959-1a5b-4c24-8173-75f57861d462_1.png']
    },
    // NPGX - Advanced NFT marketplace and gaming platform
    {
      ...createProjectStub(122, 'NPGX', 'Advanced NFT marketplace and gaming platform featuring Ninja Punk Girls with expanded universe and Web3 integrations.', 'Live', ['Next.js', 'TypeScript', 'Web3', 'NFT'], '$NPGX', 0, [
        '/images/slugs/npgx-website.jpg'
      ]), slug: 'npgx-website', type: 'domain' as const, liveUrl: 'https://npgx.website', price: 10000,
      keyPartners: ['NFT Artists', 'Gaming Studios', 'Blockchain Networks', 'Crypto Exchanges', 'Gaming Communities', 'Digital Asset Platforms'],
      keyActivities: ['NFT Creation & Curation', 'Platform Development', 'Community Building', 'Gaming Integration', 'Marketplace Operations', 'User Acquisition'],
      valuePropositions: ['Unique Cyberpunk NFT Characters', 'Play-to-Earn Gaming', 'Marketplace for Digital Assets', 'Community-Driven Content', 'Staking & Rewards', 'Cross-Platform Integration'],
      customerSegments: ['Gamers', 'NFT Collectors', 'Crypto Investors', 'Artists', 'Developers', 'Community Builders'],
      channels: ['NFT Marketplaces', 'Gaming Platforms', 'Social Media', 'Influencer Marketing', 'Online Communities', 'Direct Sales'],
      revenueStreams: ['NFT Sales', 'Game Revenue', 'Royalties', 'Marketplace Fees', 'Staking Rewards', 'Advertising'],
      costStructure: ['Game Development', 'Platform Maintenance', 'Marketing', 'Community Management', 'Legal', 'Partnerships'],
      status: 'Live',
      tokenName: '$NPGX',
      customStats: [{ label: 'Market Cap', value: '$2,000,000' }],
    },
    {
      id: 114,
      title: 'CourseKings',
      slug: 'coursekings-website',
      description: 'Premium online learning platform offering high-quality courses and skill development programs for professionals and learners worldwide.',
      type: 'domain' as const,
      status: 'Live',
      liveUrl: 'https://www.coursekings.website',
      tech: ['Next.js', 'TypeScript', 'React', 'E-learning', 'Content Management', 'Payment Processing'],
      cardImageUrls: ['/images/slugs/coursekings-website.png'],
      subtitle: 'Online Learning Platform',
      xUrl: '#',
      notionUrl: 'https://www.notion.so/21d9c67aff39802bab23c588e9646bc2?v=21d9c67aff398083bfcf000c01aed8cb',
      githubUrl: '#',
      tokenName: '$COURSE',
      tokenProgressPercent: 0,
      price: 50000,
      keyPartners: ['Course Creators', 'Educational Institutions', 'Content Providers', 'Payment Processors', 'Learning Management Systems', 'Certification Bodies'],
      keyActivities: ['Course Curation', 'Platform Development', 'Content Management', 'User Support', 'Payment Processing', 'Quality Assurance'],
      valuePropositions: ['High-Quality Course Content', 'Professional Skill Development', 'Flexible Learning Options', 'Certification Programs', 'Expert Instructors', 'Affordable Pricing'],
      customerSegments: ['Professionals', 'Students', 'Career Changers', 'Skill Seekers', 'Corporate Training', 'Lifelong Learners'],
      channels: ['Direct Website', 'Social Media Marketing', 'SEO', 'Email Marketing', 'Partnerships', 'Referral Programs'],
      revenueStreams: ['Course Sales', 'Subscription Fees', 'Corporate Training', 'Certification Fees', 'Affiliate Marketing', 'Premium Features'],
      costStructure: ['Platform Development', 'Content Creation', 'Marketing', 'Customer Support', 'Payment Processing', 'Infrastructure']
    },
    {
      id: 115,
      title: 'BSVEX',
      slug: 'bsvex-com',
      description: 'Bitcoin SV exchange platform providing secure and efficient trading services for BSV and other digital assets.',
      type: 'github' as const,
      status: 'Development',
      liveUrl: 'https://bsvex.com',
      tech: ['Bitcoin SV', 'Exchange Platform', 'Blockchain', 'TypeScript', 'Node.js', 'Security'],
      cardImageUrls: ['/logo_banner.jpg'],
      subtitle: 'Bitcoin SV Exchange',
      xUrl: '#',
      notionUrl: 'https://www.notion.so/21d9c67aff39802bab23c588e9646bc2?v=21d9c67aff398083bfcf000c01aed8cb',
      githubUrl: '#',
      tokenName: '$BSVEX',
      tokenProgressPercent: 0,
      price: 100000,
      keyPartners: ['Bitcoin SV Developers', 'Crypto Exchanges', 'Payment Processors', 'Security Providers', 'Regulatory Bodies', 'Financial Institutions'],
      keyActivities: ['Exchange Operations', 'Security Management', 'Compliance Monitoring', 'Customer Support', 'Platform Development', 'Market Making'],
      valuePropositions: ['Secure BSV Trading', 'Fast Transaction Processing', 'Low Trading Fees', 'Regulatory Compliance', 'Advanced Security', 'User-Friendly Interface'],
      customerSegments: ['Crypto Traders', 'Bitcoin SV Enthusiasts', 'Institutional Investors', 'Retail Investors', 'DeFi Users', 'Crypto Exchanges'],
      channels: ['Direct Website', 'Crypto Communities', 'Social Media', 'Partnerships', 'Referral Programs', 'Industry Events'],
      revenueStreams: ['Trading Fees', 'Withdrawal Fees', 'Listing Fees', 'Premium Services', 'API Access', 'Institutional Services'],
      costStructure: ['Security Infrastructure', 'Compliance Costs', 'Development Team', 'Marketing', 'Customer Support', 'Legal & Regulatory']
    },
    {
      id: 116,
      title: 'Libertas Coffee',
      slug: 'libertascoffee-store',
      description: 'Premium bulk coffee drop-shipping with automatic revenue sharing. $BREW token holders earn dividends from every sale at point of sale.',
      type: 'github' as const,
      status: 'Development',
      liveUrl: 'https://www.libertascoffee.store/',
      tech: ['E-commerce', 'Bitcoin SV', 'HandCash', 'Token Rewards', 'Revenue Sharing', 'Drop-shipping'],
      cardImageUrls: ['/images/stock/coffee-shop.jpg'],
      subtitle: 'Premium Coffee Shop',
      xUrl: '#',
      notionUrl: 'https://www.notion.so/21d9c67aff39802bab23c588e9646bc2?v=21d9c67aff398083bfcf000c01aed8cb',
      githubUrl: '#',
      tokenName: '$BREW',
      tokenProgressPercent: 0,
      price: 50000,
      keyPartners: ['Coffee Suppliers', 'HandCash Wallet', 'Bitcoin SV Network', 'Logistics Partners', 'Payment Processors', 'Token Exchanges'],
      keyActivities: ['Coffee Sourcing', 'Drop-shipping Operations', 'Token Distribution', 'Revenue Sharing', 'Customer Support', 'Platform Development'],
      valuePropositions: ['Premium Coffee Quality', 'Automatic Revenue Sharing', '$BREW Token Rewards', 'HandCash Integration', 'Bulk Drop-shipping', 'Transparent Dividends'],
      customerSegments: ['Coffee Enthusiasts', 'Token Investors', 'Bulk Buyers', 'Crypto Users', 'HandCash Users', 'Rewards Seekers'],
      channels: ['Direct Website', 'HandCash Integration', 'Social Media', 'Crypto Communities', 'Coffee Communities', 'Token Exchanges'],
      revenueStreams: ['Coffee Sales', 'Token Trading Fees', 'Premium Memberships', 'Bulk Discounts', 'Shipping Fees', 'Partnership Revenue'],
      costStructure: ['Coffee Procurement', 'Platform Development', 'Token Infrastructure', 'Marketing', 'Customer Support', 'Logistics']
    },
    {
      id: 48,
      title: 'Beauty Queen AI',
      slug: 'beauty-queen-ai-com',
      description: 'AI-powered beauty and fashion platform with personalized recommendations and virtual try-on features.',
      type: 'github' as const,
      status: 'Development',
      tech: ['AI/ML', 'Computer Vision', 'React', 'Node.js', 'Python', 'TensorFlow', 'Virtual Try-On', 'Recommendation Engine'],
      cardImageUrls: ['/images/slugs/beauty-queen-ai-com.jpg'], // Use an image that actually exists
      subtitle: 'AI Beauty Platform',
      xUrl: '#',
      notionUrl: '#',
      githubUrl: '#',
      tokenName: '$BEAUTY',
      tokenProgressPercent: 75,
      price: 250000,
      keyPartners: ['AI/ML Providers', 'Beauty Brands', 'Fashion Retailers', 'Technology Partners', 'Data Providers', 'Payment Processors'],
      keyActivities: ['AI Model Development', 'Platform Development', 'Data Collection', 'User Experience Design', 'Marketing', 'Partnership Management'],
      valuePropositions: ['Personalized Beauty Recommendations', 'Virtual Try-On Technology', 'AI-Powered Styling', 'Beauty Community', 'Brand Partnerships', 'Mobile-First Experience'],
      customerSegments: ['Beauty Enthusiasts', 'Fashion Conscious Users', 'Beauty Brands', 'Influencers', 'Retailers', 'Tech-Savvy Consumers'],
      channels: ['Mobile App', 'Web Platform', 'Social Media', 'Influencer Partnerships', 'Beauty Events', 'Retail Partnerships'],
      revenueStreams: ['Subscription Premium', 'Brand Partnerships', 'Commission on Sales', 'Data Analytics', 'White-Label Solutions', 'Advertising'],
      costStructure: ['AI/ML Development', 'Platform Infrastructure', 'Data Acquisition', 'Marketing', 'Customer Support', 'Legal & Compliance']
    },
    {
      id: 100,
      title: 'Osinka Kalaso',
      slug: 'osinka-kalaso',
      description: 'Empowering Kenyan farmers through sustainable onion cultivation and water access. A community-driven agricultural project providing borehole drilling, water storage, and irrigation systems.',
      type: 'client',
      status: 'Live',
      liveUrl: 'https://osinkakalaso.website',
      tech: ['Sustainable Farming', 'Water Infrastructure', 'Community Development', 'Agriculture'],
      cardImageUrls: ['/images/slugs/osinka-kalaso.jpg', '/images/slugs/osinka-kalaso-logo.png'],
      subtitle: 'Onion Farm Project, Kenya',
      xUrl: '#',
      notionUrl: '',
      githubUrl: '',
      tokenName: undefined,
      tokenProgressPercent: 0,
      price: undefined,
      keyPartners: ['Local Farmers', 'Agricultural Experts', 'Water Engineers', 'Logistics Providers'],
      keyActivities: ['Onion Cultivation', 'Borehole Drilling', 'Irrigation Management', 'Farmer Training'],
      valuePropositions: ['Sustainable Agriculture', 'Reliable Water Access', 'Community Empowerment', 'Food Security'],
      customerSegments: ['Local Markets', 'Wholesale Buyers', 'Supermarkets', 'Community Members'],
      channels: ['Direct Sales', 'Agricultural Cooperatives', 'Local Markets'],
      revenueStreams: ['Onion Sales', 'Water Services', 'Agricultural Consulting'],
      costStructure: ['Farming Equipment', 'Water Infrastructure Maintenance', 'Labor', 'Seeds & Fertilizers']
    },
    {
      id: 101,
      title: 'Cashboard',
      slug: 'cashboard-website',
      description: 'Professional dashboard and analytics platform providing comprehensive business insights and data visualization tools.',
      type: 'client',
      status: 'Live',
      liveUrl: 'https://cashboard.website',
      tokenName: '$CBOARD',
      tech: ['Next.js', 'TypeScript', 'React', 'Analytics', 'Dashboard', 'Data Visualization'],
      cardImageUrls: ['/images/slugs/cashboard-website.png'],
      subtitle: 'Business Analytics Platform',
      xUrl: '#',
      notionUrl: '',
      githubUrl: '',
      tokenProgressPercent: 0,
      price: undefined,
      keyPartners: [],
      keyActivities: [],
      valuePropositions: [],
      customerSegments: [],
      channels: [],
      revenueStreams: [],
      costStructure: []
    },
    {
      id: 102,
      title: 'Cash Handle Token',
      slug: 'cashhandletoken-store',
      description: 'Innovative tokenization platform for cash handling and financial transactions, providing secure and efficient payment solutions.',
      type: 'client',
      status: 'Live',
      liveUrl: 'https://cashhandletoken.store',
      tech: ['Next.js', 'TypeScript', 'Web3', 'Blockchain', 'Payment Processing'],
      cardImageUrls: ['/images/slugs/cashhandletoken-store.png'],
      subtitle: 'Tokenized Payment Platform',
      xUrl: '#',
      notionUrl: '',
      githubUrl: '',
      tokenName: '$HCTOKEN',
      tokenProgressPercent: 0,
      price: 10000,
      keyPartners: ['Payment Processors', 'Blockchain Networks', 'Financial Institutions', 'Crypto Exchanges'],
      keyActivities: ['Token Development', 'Payment Integration', 'Security Implementation', 'Platform Development'],
      valuePropositions: ['Secure Tokenized Payments', 'Efficient Cash Handling', 'Blockchain Integration', 'Financial Innovation'],
      customerSegments: ['Businesses', 'Financial Institutions', 'Crypto Users', 'Payment Processors'],
      channels: ['Direct Platform', 'Financial Networks', 'Crypto Communities', 'Business Partnerships'],
      revenueStreams: ['Transaction Fees', 'Token Sales', 'Premium Services', 'Platform Licensing'],
      costStructure: ['Platform Development', 'Security Infrastructure', 'Blockchain Integration', 'Marketing']
    },
    {
      id: 103,
      title: 'Zero Dice',
      slug: 'zerodice-store',
      description: 'AI-powered virtual influencer and content creator. Zero Dice produces engaging digital content across social platforms.',
      type: 'client',
      status: 'Live',
      liveUrl: 'https://zerodice.store',
      tech: ['Next.js', 'TypeScript', 'AI', 'Content Generation', 'Social Media'],
      cardImageUrls: ['/images/slugs/zerodice-store.png'],
      subtitle: 'AI Influencer',
      xUrl: '#',
      notionUrl: '',
      githubUrl: '',
      tokenName: '$ZERODICE',
      tokenProgressPercent: 0,
      price: 15000,
      keyPartners: ['Blockchain Networks', 'Gaming Platforms', 'Crypto Exchanges', 'Fair Gaming Auditors'],
      keyActivities: ['Provably Fair Implementation', 'Game Development', 'Blockchain Integration', 'Security Auditing'],
      valuePropositions: ['Zero House Edge', 'Provably Fair Gaming', 'Transparent Transactions', 'Secure Blockchain Gaming'],
      customerSegments: ['Gamers', 'Crypto Enthusiasts', 'Gambling Community', 'Fair Gaming Advocates'],
      channels: ['Gaming Platforms', 'Crypto Communities', 'Social Media', 'Gaming Forums'],
      revenueStreams: ['Game Fees', 'Token Rewards', 'Premium Features', 'Affiliate Program'],
      costStructure: ['Game Development', 'Blockchain Integration', 'Security Audits', 'Marketing']
    },

    {
      id: 133,
      title: 'DNS DEX',
      slug: 'dns-dex',
      description: 'Decentralized exchange for tokenized domain names. Tokenize URLs like coca-cola.com, charge micropayments (x402) for site access, and distribute revenue to token holders as dividends.',
      type: 'client' as const,
      status: 'Demo',
      liveUrl: 'https://www.dns-dex.com/',
      tech: ['Next.js', 'TypeScript', 'Bitcoin', 'x402', 'Micropayments', 'DEX', 'Tokenization'],
      cardImageUrls: ['/images/slugs/dns-dex-com.jpg'],
      subtitle: 'Domain Name Tokenization Exchange',
      xUrl: 'https://x.com/dnsdex',
      notionUrl: 'https://www.notion.so/21d9c67aff39802bab23c588e9646bc2?v=21d9c67aff398083bfcf000c01aed8cb',
      githubUrl: 'https://github.com/b0ase/dnsdex',
      tokenName: '$DNSDEX',
      tokenProgressPercent: 0,
      price: 50000,
      keyPartners: ['Domain Registrars', 'x402 Protocol', 'Bitcoin Network', 'Payment Processors', 'DNS Infrastructure'],
      keyActivities: ['Domain Tokenization', 'DEX Operations', 'Dividend Distribution', 'Micropayment Processing'],
      valuePropositions: ['Tokenize Any Domain', 'Passive Income from Traffic', 'Decentralized Trading', 'Automated Dividends', 'x402 Micropayment Integration'],
      customerSegments: ['Domain Investors', 'Website Owners', 'Crypto Traders', 'Passive Income Seekers', 'Web3 Enthusiasts'],
      channels: ['Direct Platform', 'Domain Forums', 'Crypto Communities', 'DEX Aggregators', 'Social Media'],
      revenueStreams: ['Trading Fees', 'Tokenization Fees', 'Premium Features', 'API Access'],
      costStructure: ['DEX Infrastructure', 'Payment Processing', 'Development', 'Security Audits', 'Marketing']
    },
    {
      id: 200,
      title: 'MoneyButton',
      slug: 'moneybutton-store',
      description: 'A high-energy, dopamine-fueled button game on Bitcoin SV. Press to pay, earn tokens, and win the global jackpot. 1 press = 1 cent via HandCash.',
      type: 'client' as const,
      status: 'Live',
      liveUrl: 'https://www.themoneybutton.store/',
      tech: ['Next.js', 'TypeScript', 'Bitcoin SV', 'HandCash', 'Prisma', 'PostgreSQL'],
      cardImageUrls: ['/images/slugs/moneybutton-store.png'],
      subtitle: 'Pay-to-Play Button Game',
      xUrl: '#',
      notionUrl: 'https://www.notion.so/21d9c67aff39802bab23c588e9646bc2?v=21d9c67aff398083bfcf000c01aed8cb',
      githubUrl: 'https://github.com/b0ase/moneybutton2',
      tokenName: '$MONEYBUTTON',
      tokenProgressPercent: 0,
      price: 10000,
      primaryColor: '#ffd700',
      keyPartners: ['HandCash', 'Bitcoin SV Network', 'Payment Processors', 'Gaming Communities'],
      keyActivities: ['Button Game Development', 'Token Distribution', 'Jackpot Management', 'HandCash Integration'],
      valuePropositions: ['Instant Micropayments', 'Earn $MONEYBUTTON Tokens', 'Provably Fair Gaming', 'Dopamine-Fueled Experience', 'Global Jackpot System'],
      customerSegments: ['Crypto Gamers', 'Bitcoin SV Users', 'HandCash Users', 'Micropayment Enthusiasts', 'Casual Players'],
      channels: ['Direct Platform', 'HandCash App', 'Crypto Gaming Communities', 'Social Media', 'Bitcoin SV Ecosystem'],
      revenueStreams: ['Button Presses (1 cent each)', 'Premium Features', 'Token Trading Fees', 'Jackpot Commission'],
      costStructure: ['HandCash Integration', 'Platform Development', 'Jackpot Pool', 'Marketing', 'Server Infrastructure'],
      themeConfig: { primary: 'yellow', secondary: 'gold' }
    },
    {
      id: 201,
      title: 'Kintsugi',
      slug: 'kintsugi',
      description: 'Digital art and creative technology platform celebrating the beauty of imperfection. Transforming broken pieces into golden masterpieces through blockchain-verified digital art.',
      type: 'client' as const,
      status: 'Live',
      liveUrl: 'https://www.b0ase.com/kintsugi',
      tech: ['Next.js', 'TypeScript', 'Three.js', 'WebGL', 'Bitcoin SV', 'AI Art Generation'],
      cardImageUrls: ['/images/kintsugi/kintsugi-banner.png'],
      subtitle: 'Beauty in Imperfection',
      xUrl: '#',
      notionUrl: 'https://www.notion.so/21d9c67aff39802bab23c588e9646bc2?v=21d9c67aff398083bfcf000c01aed8cb',
      githubUrl: 'https://github.com/b0ase/kintsugi',
      tokenName: '$KINTSUGI',
      tokenProgressPercent: 0,
      price: 15000,
      primaryColor: '#ffd700',
      keyPartners: ['Digital Artists', 'AI Art Platforms', 'NFT Marketplaces', 'Blockchain Networks', 'Art Collectors'],
      keyActivities: ['Digital Art Creation', 'AI-Assisted Design', 'Blockchain Verification', 'Community Building', 'Art Curation'],
      valuePropositions: ['Unique Digital Art', 'Blockchain Provenance', 'AI-Enhanced Creativity', 'Community Ownership', 'Beauty from Imperfection'],
      customerSegments: ['Digital Art Collectors', 'Creative Professionals', 'NFT Enthusiasts', 'Art Investors', 'Design Studios'],
      channels: ['Direct Platform', 'NFT Marketplaces', 'Art Communities', 'Social Media', 'Gallery Partnerships'],
      revenueStreams: ['Art Sales', 'Commission Fees', 'Premium Features', 'Licensing', 'Collaborations'],
      costStructure: ['AI Infrastructure', 'Platform Development', 'Artist Payments', 'Marketing', 'Blockchain Fees'],
      themeConfig: { primary: 'yellow', secondary: 'gold' }
    },
  ],
  skills: {
    apps: [
      'Cursor', 'Supabase', 'VS Code', 'GitHub Desktop', 'Figma', 'Photoshop', 'Slack', 'Discord', 'Notion', 'Trello', 'Postman', 'Docker Desktop',
      'TablePlus', 'Zoom', 'Chrome DevTools', 'Git', 'Terminal', 'Xcode', 'Jira', 'Asana', 'Miro', 'Confluence', 'Jenkins', 'CircleCI', 'GitHub Actions',
      'GitLab CI/CD', 'Terraform', 'Ansible', 'Kubernetes', 'Grafana', 'Prometheus', 'Datadog', 'Sentry', 'Webpack', 'Babel', 'ESLint', 'Elementor Pro'
    ],
    platforms: [
      'Vercel', 'Netlify', 'AWS', 'Google Cloud', 'Digital Ocean', 'Heroku', 'Firebase', 'Cloudflare', 'GitHub Pages', 'Railway', 'PlanetScale',
      'Render', 'Fly.io', 'Upstash', 'Stripe', 'PayPal', 'Shopify', 'WordPress', 'Azure', 'Google Firebase', 'Vercel Edge Functions', 'Netlify Functions',
      'Cloudflare Workers', 'Render Blueprints', 'Fly.io Machines', 'Railway Private Networks', 'PlanetScale Serverless', 'Upstash Redis', 'Stripe Connect',
      'PayPal Braintree', 'Shopify Plus', 'WordPress VIP', 'Auth0', 'Okta', 'Twilio', 'SendGrid'
    ],
    languages: [
      'JavaScript', 'TypeScript', 'Python', 'HTML', 'CSS', 'SQL', 'Bash', 'PHP', 'Java', 'Swift', 'Kotlin', 'Go', 'Rust', 'C++', 'C#', 'Ruby', 'Dart',
      'Solidity', 'R', 'Scala', 'C', 'Perl', 'Lua', 'Erlang', 'Elixir', 'Clojure', 'Haskell', 'F#', 'Objective-C', 'Assembly', 'VHDL', 'Verilog', 'MATLAB',
      'Julia', 'Groovy', 'Scheme', 'Prolog', 'COBOL', 'Fortran'
    ],
    frameworks: [
      'React', 'Next.js', 'Node.js', 'Express', 'Vue.js', 'Angular', 'Svelte', 'Nuxt.js', 'Django', 'Flask', 'FastAPI', 'Spring Boot', 'Laravel',
      'Ruby on Rails', 'Flutter', 'React Native', 'Electron', 'Tailwind CSS', 'Next.js API Routes', 'NestJS', 'Quarkus', 'Micronaut', 'Phoenix',
      'ASP.NET Core', 'Blazor', 'Xamarin', 'Ionic', 'NativeScript', 'Chakra UI', 'Material-UI', 'Ant Design', 'Bootstrap', 'Bulma', 'Semantic UI',
      'Gatsby', 'Jekyll'
    ],
    databases: [
      'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'SQLite', 'Firebase Firestore', 'DynamoDB', 'Cassandra', 'Neo4j', 'InfluxDB', 'Elasticsearch',
      'CouchDB', 'MariaDB', 'Oracle', 'SQL Server', 'TimescaleDB', 'ClickHouse', 'Supabase', 'CockroachDB', 'YugabyteDB', 'ArangoDB', 'RethinkDB',
      'Couchbase', 'Aerospike', 'Memcached', 'Apache Kafka', 'RabbitMQ', 'Amazon S3', 'Google Cloud Storage', 'Azure Blob Storage', 'Snowflake',
      'BigQuery', 'Redshift', 'Teradata', 'Greenplum', 'Vertica'
    ],
    skills: [
      'Web Development', 'Mobile Development', 'API Design', 'Database Design', 'UI/UX Design', 'DevOps', 'Cloud Architecture', 'Blockchain Development',
      'AI/ML', 'Data Analysis', 'Project Management', 'Technical Writing', 'Code Review', 'Testing', 'Security', 'Performance Optimization',
      'Containerization', 'Orchestration', 'CI/CD', 'Infrastructure as Code', 'Network Security', 'Data Modeling', 'Machine Learning Engineering',
      'Natural Language Processing', 'Computer Vision', 'Statistical Analysis', 'Technical Leadership', 'Mentoring', 'Public Speaking',
      'Agile Methodologies', 'Scrum', 'Kanban', 'WordPress Development', 'Elementor Pro', 'CMS Development', 'Theme Customization', 'Plugin Development'
    ],

  },
  services: [
    {
      id: 1,
      slug: "wordpress-development",
      title: "WordPress Development",
      description: "Professional WordPress websites & landing pages with Elementor Pro for stunning, conversion-focused designs.",
      detailedDescription: "Specialized WordPress development using Elementor Pro to create stunning, responsive websites and landing pages. From business websites to e-commerce stores, I deliver pixel-perfect designs that convert visitors into customers. Includes mobile optimization, speed optimization, SEO setup, and ongoing support.",
      priceInfo: ""
    },
    {
      id: 2,
      slug: "web-development",
      title: "Web Development",
      description: "Responsive websites & apps with modern tech, WordPress/Elementor Pro, Web3 & blockchain integrations.",
      detailedDescription: "Our web development process focuses on creating high-performance, scalable, and visually appealing digital experiences. We specialize in WordPress development with Elementor Pro for stunning, conversion-focused websites, as well as modern frameworks like Next.js and React. From simple landing pages to complex web applications and e-commerce platforms, we tailor solutions to meet specific business goals with expertise in both traditional CMS and cutting-edge technologies.",
      priceInfo: ""
    },
    {
      id: 3,
      slug: "software-development",
      title: "Software Development",
      description: "App development & technical support for start-ups with crypto, blockchain & AI focus.",
      detailedDescription: "We specialize in developing scalable web and mobile applications tailored for start-ups and forward-thinking businesses. Our expertise includes blockchain integration, crypto payment systems, AI-powered features, and rapid MVP development. We provide ongoing technical support and strategic guidance to help your venture succeed in a fast-moving digital landscape.",
      priceInfo: ""
    },
    {
      id: 117,
      slug: "content-copywriting",
      title: "Content & Copywriting",
      description: "Compelling narratives, articles & website copy tailored to your audience.",
      detailedDescription: "We create engaging and SEO-optimized content that resonates with your target audience. Our services include blog posts, articles, website copy, social media content, email marketing campaigns, and more. We focus on clear communication and storytelling to enhance your brand voice.",
      priceInfo: ""
    },
    {
      id: 118,
      slug: "video-production",
      title: "Video Production & Photography",
      description: "Full video production & high-quality photography from concept to delivery.",
      detailedDescription: "Full-service video production covering concept development, storyboarding, filming, editing, color grading, motion graphics, and final delivery. We produce promotional videos, documentaries, interviews, social media clips, and more, using professional equipment and techniques. Our photography services include event coverage, product photography, corporate headshots, lifestyle portraits, and architectural photography—all expertly edited to meet your requirements.",
      priceInfo: ""
    },
    {
      id: 119,
      slug: "logo-branding",
      title: "Logo Design & Branding",
      description: "Unique logos & visual identities that effectively represent your brand.",
      detailedDescription: "We develop strong visual identities, starting with logo design and extending to brand guidelines, color palettes, typography, and marketing collateral design. Our goal is to create a cohesive and memorable brand image that aligns with your values.",
      priceInfo: ""
    },
    {
      id: 7,
      slug: "seo-marketing",
      title: "SEO & Digital Marketing",
      description: "Online presence optimization & content strategy to drive organic growth.",
      detailedDescription: "Comprehensive SEO services including keyword research, on-page optimization, technical SEO audits, link building, and content strategy development. We also offer broader digital marketing support, including PPC campaign management and analytics reporting.",
      priceInfo: ""
    },
    {
      id: 123,
      slug: "social-media-management",
      title: "Social Media Management",
      description: "Strategy development, content creation & social media management for growth.",
      detailedDescription: "Strategic social media management across various platforms. We handle content creation, scheduling, community engagement, performance tracking, and paid social advertising campaigns to build brand awareness and drive results.",
      priceInfo: ""
    },
    {
      id: 124,
      slug: "technical-consulting",
      title: "Technical Consulting",
      description: "Expert advice & strategy for digital projects and technical challenges.",
      detailedDescription: "Leverage our technical expertise for strategic decision-making. We offer consulting on technology stack selection, software architecture design, project planning, feasibility studies, and technical team guidance.",
      priceInfo: ""
    },
    {
      id: 10,
      slug: "support-maintenance",
      title: "Support & Maintenance",
      description: "Ongoing support to keep your digital assets running smoothly and securely.",
      detailedDescription: "Customizable support and maintenance plans to ensure your websites and applications remain secure, up-to-date, and performant. Services include regular updates, security monitoring, backups, performance checks, and troubleshooting.",
      priceInfo: ""
    }
  ],
  contact: {
    email: "admin@b0ase.com"
  }
};

export interface ContentModule {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  price: string;
  features: string[];
  deliverables: string[];
}

// Content Modules based on our services
export const contentModules: ContentModule[] = [
  {
    id: 'website-copy',
    title: 'Website Copy',
    description: 'Persuasive, conversion-focused copy for landing pages, about sections, and product descriptions',
    category: 'Copywriting',
    icon: 'FaFileAlt',
    price: '£200-500',
    features: ['Landing page copy', 'Product descriptions', 'About page content', 'Call-to-action optimization'],
    deliverables: ['Optimized web copy', 'SEO-friendly content', 'Brand voice guidelines']
  },
  {
    id: 'blog-articles',
    title: 'Blog Articles',
    description: 'Informative, engaging articles that position your brand as an industry authority',
    category: 'Content Writing',
    icon: 'FaNewspaper',
    price: '£100-300/article',
    features: ['Industry expertise', 'SEO optimization', 'Original research', 'Engaging storytelling'],
    deliverables: ['Well-researched articles', 'Meta descriptions', 'Social media snippets']
  },
  {
    id: 'social-media-content',
    title: 'Social Media Content',
    description: 'Platform-specific content that drives engagement across social channels',
    category: 'Social Media',
    icon: 'FaHashtag',
    price: '£150-400/week',
    features: ['Platform optimization', 'Visual content ideas', 'Hashtag strategy', 'Engagement copy'],
    deliverables: ['Content calendar', 'Post copy', 'Story templates', 'Caption variations']
  },
  {
    id: 'video-scripts',
    title: 'Video Scripts',
    description: 'Compelling scripts for promotional videos, explainers, and social media content',
    category: 'Video Content',
    icon: 'FaVideo',
    price: '£200-600',
    features: ['Storyboard alignment', 'Brand voice consistency', 'Call-to-action integration', 'Multiple formats'],
    deliverables: ['Script document', 'Scene descriptions', 'Voiceover notes', 'Visual cues']
  },
  {
    id: 'email-campaigns',
    title: 'Email Marketing',
    description: 'Persuasive email campaigns that nurture leads and drive conversions',
    category: 'Email Marketing',
    icon: 'FaEnvelope',
    price: '£150-400/campaign',
    features: ['Subject line optimization', 'Personalization', 'A/B testing copy', 'Automation sequences'],
    deliverables: ['Email templates', 'Subject line variations', 'Follow-up sequences', 'Performance copy']
  },
  {
    id: 'advertising-copy',
    title: 'Advertising Copy',
    description: 'High-converting ad copy for Google Ads, Facebook, and other platforms',
    category: 'Advertising',
    icon: 'FaBullhorn',
    price: '£100-300/campaign',
    features: ['Platform optimization', 'A/B testing variants', 'Keyword integration', 'Conversion focus'],
    deliverables: ['Ad copy variations', 'Headlines & descriptions', 'Landing page alignment', 'Performance tracking']
  },
  {
    id: 'infographics',
    title: 'Infographic Design',
    description: 'Visual content that simplifies complex information and drives engagement',
    category: 'Visual Content',
    icon: 'FaChartPie',
    price: '£300-800',
    features: ['Data visualization', 'Brand consistency', 'Social media optimization', 'Print-ready formats'],
    deliverables: ['High-res infographics', 'Social media versions', 'Source files', 'Usage guidelines']
  },
  {
    id: 'illustrations',
    title: 'Custom Illustrations',
    description: 'Unique illustrations that enhance your brand story and visual identity',
    category: 'Visual Content',
    icon: 'FaPaintBrush',
    price: '£200-600/piece',
    features: ['Custom style development', 'Brand integration', 'Multiple formats', 'Scalable vectors'],
    deliverables: ['Vector illustrations', 'Multiple file formats', 'Style guide', 'Usage rights']
  },
  {
    id: 'product-photography',
    title: 'Product Photography',
    description: 'Professional product images that showcase your offerings in the best light',
    category: 'Photography',
    icon: 'FaCamera',
    price: '£400-1200/session',
    features: ['Studio lighting', 'Multiple angles', 'Lifestyle shots', 'E-commerce optimization'],
    deliverables: ['High-res images', 'Edited photos', 'Web-optimized versions', 'Usage rights']
  },
  {
    id: 'brand-photography',
    title: 'Brand Photography',
    description: 'Professional photography that captures your brand personality and team',
    category: 'Photography',
    icon: 'FaUsers',
    price: '£600-1500/session',
    features: ['Team portraits', 'Office environment', 'Brand storytelling', 'Multiple formats'],
    deliverables: ['Professional portraits', 'Lifestyle shots', 'Brand imagery', 'Social media assets']
  },
  {
    id: 'promotional-videos',
    title: 'Promotional Videos',
    description: 'Engaging videos that showcase your brand, products, or services',
    category: 'Video Production',
    icon: 'FaPlay',
    price: '£800-2500',
    features: ['Professional filming', 'Post-production', 'Brand integration', 'Multiple formats'],
    deliverables: ['Final video files', 'Social media versions', 'Raw footage', 'Project files']
  },
  {
    id: 'podcast-content',
    title: 'Podcast Content',
    description: 'Scripts, show notes, and promotional content for podcast series',
    category: 'Audio Content',
    icon: 'FaMicrophone',
    price: '£150-400/episode',
    features: ['Episode scripting', 'Show notes', 'Social promotion', 'Guest preparation'],
    deliverables: ['Episode scripts', 'Show notes', 'Social media content', 'Promotional copy']
  }
];

// ============================================
// TOKEN VALIDATION
// ============================================
// Validates that all project tokens exist in the registry
// Logs warnings in development for any missing tokens

/**
 * Get all unique token symbols used in projects
 */
export function getProjectTokenSymbols(): string[] {
  return [...new Set(
    portfolioData.projects
      .map(p => p.tokenName)
      .filter((t): t is string => !!t && t !== '')
  )];
}

/**
 * Get token info for a project by its token symbol
 */
export function getProjectTokenInfo(tokenSymbol: string) {
  return getToken(tokenSymbol);
}

/**
 * Validate all project tokens exist in the registry
 * Returns array of missing token symbols
 */
export function validateProjectTokens(): string[] {
  const projectTokens = getProjectTokenSymbols();
  return projectTokens.filter(symbol => !tokenExists(symbol));
}

// Run validation in development
if (process.env.NODE_ENV === 'development') {
  const missingTokens = validateProjectTokens();
  if (missingTokens.length > 0) {
    console.warn(
      `[Token Registry] Missing tokens in registry: ${missingTokens.join(', ')}\n` +
      `Add these to lib/token-registry.ts`
    );
  }
}


export interface SmartContractTemplate {
  slug: string;
  title: string;
  iconName: 'Coins' | 'Clock' | 'Vote' | 'Percent' | 'Lock' | 'Users';
  description: string;
  detailedDescription: string;
  features: string[];
  codeSnippet: string;
}

export const smartContractTemplates: SmartContractTemplate[] = [
  {
    slug: 'dividend-distribution',
    title: 'Dividend Distribution',
    iconName: 'Coins',
    description: 'Automatically distribute revenue to token holders based on their stake. Daily, weekly, or custom schedules.',
    detailedDescription: 'This smart contract enables trustless profit sharing. By depositing funds into the contract, it automatically calculates the pro-rata share for every token holder at that specific block height and allows them to claim their dividends. This eliminates the need for manual calculations and centralized distribution scripts, providing complete transparency and fairness to your shareholders.',
    features: ['Pro-rata distribution algorithm', 'Support for native BSV and custom tokens', 'Automatic snapshot mechanisms', 'Gas-efficient claiming process'],
    codeSnippet: `contract DividendDistributor {
  public function distribute(int amount) {
    // Snapshot current balances
    require(Tx.checkPreimage(this.preimage));
    // Loop through holders (simplified)
    loop (holder : this.holders) {
      int share = amount * holder.balance / this.totalSupply;
      Pay.to(holder.address, share);
    }
  }
}`
  },
  {
    slug: 'vesting-schedules',
    title: 'Vesting Schedules',
    iconName: 'Clock',
    description: 'Lock tokens for team members, advisors, or investors with customizable release schedules.',
    detailedDescription: 'Protect your token economy with enforceable vesting schedules. This contract locks allocated tokens for a defined period, releasing them linearly or in cliffs over time. It creates trust with investors by mathematically guaranteeing that team tokens cannot be dumped, aligning long-term incentives.',
    features: ['Custom cliff periods', 'Linear release curves', 'Revocable options for employees', 'Publicly verifiable lock status'],
    codeSnippet: `contract TokenVesting {
  public function release() {
    int currentTime = Tx.time;
    require(currentTime >= this.cliff);
    
    int timeVested = currentTime - this.start;
    int amount = this.total * timeVested / this.duration;
    
    require(amount > this.released);
    this.released = amount;
  }
}`
  },
  {
    slug: 'governance-voting',
    title: 'Governance & Voting',
    iconName: 'Vote',
    description: 'Enable token-weighted voting for proposals, elections, and shareholder decisions.',
    detailedDescription: 'Empower your shareholders with on-chain governance. This contract allows token holders to create proposals and vote using their token balance as weight. The results are mathematically verifiable and can even automatically trigger other contract actions, effectively creating a DAO.',
    features: ['Token-weighted voting power', 'Quadratic voting support', 'Proposal lifecycle management', 'Quorum enforcement'],
    codeSnippet: `contract Governance {
  public function vote(bool support) {
    // Verify token balance
    int weight = this.token.balanceOf(Tx.sender);
    
    if (support) {
      this.forVotes += weight;
    } else {
      this.againstVotes += weight;
    }
    
    require(this.checkQuorum());
  }
}`
  },
  {
    slug: 'royalty-splits',
    title: 'Royalty Splits',
    iconName: 'Percent',
    description: 'Automatically split revenue between creators, collaborators, and platforms.',
    detailedDescription: 'Automate collaboration with instant revenue splitting. Perfect for marketplaces, co-productions, or affiliate systems, this contract accepts incoming payments and immediately diverts specific percentages to pre-defined wallet addresses. No more manual accounting or delays in getting paid.',
    features: ['Multi-party recipients', 'Configurable percentage splits', 'Immutable agreement logic', 'Real-time settlement'],
    codeSnippet: `contract RoyaltySplitter {
  public function receive() {
    int total = Tx.value;
    int creatorShare = total * 70 / 100;
    int platformShare = total * 30 / 100;
    
    Pay.to(this.creator, creatorShare);
    Pay.to(this.platform, platformShare);
  }
}`
  },
  {
    slug: 'escrow-milestones',
    title: 'Escrow & Milestones',
    iconName: 'Lock',
    description: 'Hold funds securely until conditions are met. Perfect for freelance work and partnerships.',
    detailedDescription: 'Secure your business relationships with smart escrow. Funds are locked in the contract and only released when specific milestones are verified—either by a mutual signature, an oracle data feed, or time-lock expiration. This removes counterparty risk for both payers and service providers.',
    features: ['Multi-signature release', 'Time-lock fallbacks', 'Oracle integration', 'Dispute resolution arbitration'],
    codeSnippet: `contract Escrow {
  public function release() {
    // Require 2 of 3 signatures (buyer, seller, arbiter)
    require(checkSig(this.sig1) && checkSig(this.sig2));
    
    Pay.to(this.seller, this.balance);
  }
}`
  },
  {
    slug: 'staking-rewards',
    title: 'Staking & Rewards',
    iconName: 'Users',
    description: 'Let users stake tokens to earn rewards, access features, or participate in governance.',
    detailedDescription: 'Incentivize long-term holding with a staking mechanism. Users lock their tokens into the contract to earn a yield (APY) paid in valid tokens. This reduces circulating supply and rewards your most loyal community members, creating a healthier token economy.',
    features: ['Flexible lock-up periods', 'Variable reward rates', 'Compound interest logic', 'Penalty for early unstaking'],
    codeSnippet: `contract Staking {
  public function stake(int amount) {
    // Transfer tokens to contract
    this.token.transferFrom(Tx.sender, this, amount);
    
    // Record stake info
    this.stakes[Tx.sender] = {
      amount: amount,
      timestamp: Tx.time
    };
  }
}`
  }
]; 