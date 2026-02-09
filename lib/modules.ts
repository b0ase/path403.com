import {
    FaReact, FaNodeJs, FaDatabase, FaMobile, FaShoppingCart, FaUser,
    FaCreditCard, FaSearch, FaChartLine, FaEdit, FaUpload, FaBell,
    FaComments, FaRobot, FaBitcoin, FaCube, FaUsers, FaBrain, FaCogs,
    FaLock, FaVideo
} from 'react-icons/fa';

export interface ComponentItem {
    id: string;
    name: string;
    description: string;
    category: string;
    icon: any; // using any for icon component type for simplicity across files
    price: string;
    features: string[];
    tech: string[];
    complexity: 'Basic' | 'Intermediate' | 'Advanced';
    estimatedTime: string;
}

export const components: ComponentItem[] = [
    // Frontend Components
    {
        id: 'react-dashboard',
        name: 'React Admin Dashboard',
        description: 'Complete admin interface with charts, tables, and user management',
        category: 'Frontend',
        icon: FaReact,
        price: '£500-800',
        features: ['User Management', 'Analytics Charts', 'Data Tables', 'Responsive Design'],
        tech: ['React', 'TypeScript', 'Tailwind CSS', 'Chart.js'],
        complexity: 'Intermediate',
        estimatedTime: '1-2 weeks'
    },
    {
        id: 'mobile-app',
        name: 'Cross-Platform Mobile App',
        description: 'Native-feeling mobile app for iOS and Android',
        category: 'Mobile',
        icon: FaMobile,
        price: '£1200-2000',
        features: ['Push Notifications', 'Offline Support', 'Native Performance', 'App Store Ready'],
        tech: ['React Native', 'Expo', 'TypeScript', 'Firebase'],
        complexity: 'Advanced',
        estimatedTime: '3-4 weeks'
    },

    // E-commerce Components
    {
        id: 'e-commerce-store',
        name: 'E-commerce Store',
        description: 'Full-featured online store with cart and checkout',
        category: 'E-commerce',
        icon: FaShoppingCart,
        price: '£800-1500',
        features: ['Product Catalog', 'Shopping Cart', 'Checkout Flow', 'Order Management'],
        tech: ['Next.js', 'Stripe', 'PostgreSQL', 'Prisma'],
        complexity: 'Advanced',
        estimatedTime: '2-3 weeks'
    },
    {
        id: 'payment-system',
        name: 'Payment Processing',
        description: 'Secure payment gateway integration with multiple providers',
        category: 'E-commerce',
        icon: FaCreditCard,
        price: '£300-600',
        features: ['Stripe Integration', 'PayPal Support', 'Crypto Payments', 'Subscription Billing'],
        tech: ['Stripe API', 'PayPal SDK', 'Web3.js', 'Node.js'],
        complexity: 'Intermediate',
        estimatedTime: '1 week'
    },

    // Backend Components
    {
        id: 'api-backend',
        name: 'REST API Backend',
        description: 'Scalable API with authentication and database integration',
        category: 'Backend',
        icon: FaNodeJs,
        price: '£600-1000',
        features: ['JWT Authentication', 'Rate Limiting', 'API Documentation', 'Error Handling'],
        tech: ['Node.js', 'Express', 'PostgreSQL', 'Redis'],
        complexity: 'Intermediate',
        estimatedTime: '1-2 weeks'
    },
    {
        id: 'database-design',
        name: 'Database Architecture',
        description: 'Optimized database schema with migrations and seeding',
        category: 'Backend',
        icon: FaDatabase,
        price: '£400-700',
        features: ['Schema Design', 'Migrations', 'Indexing', 'Backup Strategy'],
        tech: ['PostgreSQL', 'Prisma', 'Redis', 'MongoDB'],
        complexity: 'Intermediate',
        estimatedTime: '1 week'
    },

    // Authentication & Security
    {
        id: 'authentication',
        name: 'Authentication System',
        description: 'Complete user authentication with social login options',
        category: 'Security',
        icon: FaUser,
        price: '£400-800',
        features: ['Email/Password Auth', 'Social Login', 'Password Recovery', 'Email Verification'],
        tech: ['Supabase Auth', 'NextAuth.js', 'OAuth', 'JWT'],
        complexity: 'Intermediate',
        estimatedTime: '1 week'
    },

    // AI & Blockchain Components
    {
        id: 'ai-chatbot',
        name: 'AI Chatbot Integration',
        description: 'Intelligent chatbot with natural language processing',
        category: 'AI/ML',
        icon: FaRobot,
        price: '£700-1200',
        features: ['Natural Language Processing', 'Context Awareness', 'Multi-language', 'Analytics'],
        tech: ['OpenAI API', 'LangChain', 'Vector Database', 'Node.js'],
        complexity: 'Advanced',
        estimatedTime: '2-3 weeks'
    },
    {
        id: 'blockchain-integration',
        name: 'Blockchain Integration',
        description: 'Web3 wallet connection and smart contract interaction',
        category: 'Blockchain',
        icon: FaBitcoin,
        price: '£800-1500',
        features: ['Wallet Connection', 'Smart Contracts', 'Token Transfers', 'NFT Support'],
        tech: ['Web3.js', 'Ethers.js', 'Solidity', 'MetaMask'],
        complexity: 'Advanced',
        estimatedTime: '2-4 weeks'
    },

    // Content & Media Components
    {
        id: 'cms-system',
        name: 'Content Management System',
        description: 'Easy-to-use content management with rich text editor',
        category: 'Content',
        icon: FaEdit,
        price: '£600-1000',
        features: ['Rich Text Editor', 'Media Management', 'SEO Tools', 'Content Scheduling'],
        tech: ['Sanity', 'Strapi', 'TinyMCE', 'Cloudinary'],
        complexity: 'Intermediate',
        estimatedTime: '1-2 weeks'
    },

    // Analytics & SEO Components
    {
        id: 'analytics-dashboard',
        name: 'Analytics Dashboard',
        description: 'Real-time analytics and reporting with custom metrics',
        category: 'Analytics',
        icon: FaChartLine,
        price: '£500-900',
        features: ['Real-time Data', 'Custom Metrics', 'Export Reports', 'Goal Tracking'],
        tech: ['Google Analytics', 'Chart.js', 'D3.js', 'PostgreSQL'],
        complexity: 'Intermediate',
        estimatedTime: '1-2 weeks'
    },

    // Communication Components
    {
        id: 'notification-system',
        name: 'Notification System',
        description: 'Multi-channel notification delivery system',
        category: 'Communication',
        icon: FaBell,
        price: '£400-700',
        features: ['Email Notifications', 'SMS Alerts', 'Push Notifications', 'In-app Messages'],
        tech: ['SendGrid', 'Twilio', 'Firebase Cloud Messaging', 'WebSockets'],
        complexity: 'Intermediate',
        estimatedTime: '1 week'
    },
    {
        id: 'live-chat-system',
        name: 'Live Chat System',
        description: 'Real-time messaging and customer support chat',
        category: 'Communication',
        icon: FaComments,
        price: '£600-1000',
        features: ['Real-time Messaging', 'File Sharing', 'Typing Indicators', 'Chat History'],
        tech: ['Socket.io', 'WebRTC', 'Redis', 'MongoDB'],
        complexity: 'Advanced',
        estimatedTime: '2-3 weeks'
    },

    // Utility Components
    {
        id: 'subscription-service',
        name: 'Subscription Service',
        description: 'Manage recurring payments and user subscriptions.',
        category: 'E-commerce',
        icon: FaCreditCard,
        price: '£500-900',
        features: ['Recurring Billing', 'Trial Periods', 'Proration', 'Payment Gateway Integration'],
        tech: ['Stripe', 'Paddle', 'Node.js', 'PostgreSQL'],
        complexity: 'Intermediate',
        estimatedTime: '1-2 weeks'
    },
    {
        id: 'social-media-integration',
        name: 'Social Media Integration',
        description: 'Integrate social media login, sharing, and content embedding.',
        category: 'Communication',
        icon: FaComments,
        price: '£400-700',
        features: ['Social Login', 'Share Buttons', 'Embed Feeds', 'Analytics'],
        tech: ['OAuth', 'Facebook SDK', 'Twitter API', 'Next.js'],
        complexity: 'Intermediate',
        estimatedTime: '1 week'
    },
    {
        id: 'search-functionality',
        name: 'Search Functionality',
        description: 'Implement robust search capabilities with indexing and filtering.',
        category: 'Utility',
        icon: FaSearch,
        price: '£300-600',
        features: ['Full-text Search', 'Fuzzy Matching', 'Filtering', 'Sorting'],
        tech: ['Elasticsearch', 'Algolia', 'PostgreSQL', 'Redis'],
        complexity: 'Intermediate',
        estimatedTime: '1 week'
    },
    {
        id: 'real-time-features',
        name: 'Real-time Features',
        description: 'Integrate real-time capabilities like live updates and notifications.',
        category: 'Communication',
        icon: FaComments,
        price: '£600-1000',
        features: ['Live Updates', 'WebSockets', 'Real-time Analytics', 'Presence Indicators'],
        tech: ['Socket.io', 'WebRTC', 'Redis', 'Node.js'],
        complexity: 'Advanced',
        estimatedTime: '2-3 weeks'
    },
    {
        id: 'file-upload-system',
        name: 'File Management System',
        description: 'Upload, organize, and manage files with cloud storage',
        category: 'Utility',
        icon: FaUpload,
        price: '£300-500',
        features: ['File Upload', 'Cloud Storage', 'File Organization', 'Access Control'],
        tech: ['AWS S3', 'Cloudinary', 'Multer', 'Sharp'],
        complexity: 'Basic',
        estimatedTime: '1 week'
    },

    // Production Components from b0ase Projects
    {
        id: '3d-spreadsheet-viewer',
        name: '3D Spreadsheet Viewer',
        description: 'Interactive 3D grid visualization with multi-layer support and intuitive controls',
        category: 'Analytics',
        icon: FaCube,
        price: '£800-1200',
        features: ['3D Grid Display', 'Drag-to-Rotate', 'Multi-layer Support', 'Cell Selection', 'Zoom Controls'],
        tech: ['React', 'CSS 3D Transforms', 'TypeScript'],
        complexity: 'Advanced',
        estimatedTime: '2-3 weeks'
    },
    {
        id: 'bonding-curve-visualizer',
        name: 'Bonding Curve Visualizer',
        description: 'Beautiful token supply visualization with animated progress tracking',
        category: 'Blockchain',
        icon: FaChartLine,
        price: '£400-700',
        features: ['Progress Tracking', 'Stage Visualization', 'Animated Bars', 'Token Metrics', 'Real-time Updates'],
        tech: ['React', 'Framer Motion', 'Tailwind CSS', 'TypeScript'],
        complexity: 'Intermediate',
        estimatedTime: '1 week'
    },
    {
        id: 'rich-text-editor',
        name: 'Rich Text Editor',
        description: 'Production-ready Quill.js editor with SSR support and full formatting',
        category: 'Content',
        icon: FaEdit,
        price: '£300-500',
        features: ['WYSIWYG Editing', 'Formatting Tools', 'SSR Safe', 'Customizable Toolbar', 'Image Upload'],
        tech: ['React', 'Quill.js', 'TypeScript', 'Next.js'],
        complexity: 'Basic',
        estimatedTime: '3-5 days'
    },
    {
        id: 'ai-chat-interface',
        name: 'AI Chat Interface',
        description: 'Floating chat window with AI integration capabilities and message history',
        category: 'AI/ML',
        icon: FaRobot,
        price: '£500-800',
        features: ['Floating UI', 'Message History', 'AI Ready', 'Customizable Theme', 'Typing Indicators'],
        tech: ['React', 'OpenAI API', 'WebSockets', 'Tailwind CSS'],
        complexity: 'Intermediate',
        estimatedTime: '1-2 weeks'
    },

    // AI & Governance Components (NEW)
    {
        id: 'ai-agent-builder',
        name: 'AI Agent Builder',
        description: 'Custom AI agent development with tool integration and autonomous task execution',
        category: 'AI/ML',
        icon: FaBrain,
        price: '£1500-3000',
        features: ['Custom AI Agents', 'Tool Integration', 'Task Automation', 'Memory & Context', 'Multi-model Support'],
        tech: ['Claude API', 'OpenAI API', 'LangChain', 'Vector DB', 'Node.js'],
        complexity: 'Advanced',
        estimatedTime: '4-6 weeks'
    },
    {
        id: 'boardroom-platform',
        name: 'Boardroom Platform',
        description: 'Token-gated governance platform with proposals, voting, and delegation',
        category: 'Blockchain',
        icon: FaUsers,
        price: '£2000-4000',
        features: ['Token-weighted Voting', 'Proposal System', 'Vote Delegation', 'On-chain Verification', 'Chat Rooms'],
        tech: ['Next.js', 'BSV Blockchain', 'Supabase', 'WebSockets', 'TypeScript'],
        complexity: 'Advanced',
        estimatedTime: '6-8 weeks'
    },
    {
        id: 'ai-executive-suite',
        name: 'AI Executive Suite',
        description: 'Multi-provider AI integration with Claude, OpenAI, and Gemini connections',
        category: 'AI/ML',
        icon: FaCogs,
        price: '£1200-2400',
        features: ['Claude Integration', 'OpenAI Integration', 'Gemini Integration', 'API Key Management', 'Usage Analytics'],
        tech: ['Anthropic API', 'OpenAI API', 'Google AI', 'Next.js', 'TypeScript'],
        complexity: 'Intermediate',
        estimatedTime: '3-5 weeks'
    },
    {
        id: 'multisig-custody',
        name: '2-of-3 Multisig Custody',
        description: 'Non-custodial vault system with secure key management and withdrawal flows',
        category: 'Blockchain',
        icon: FaBitcoin,
        price: '£1800-3500',
        features: ['2-of-3 Multisig', 'P2SH Vaults', 'QR Deposits', 'Signature Coordination', 'Audit Logging'],
        tech: ['BSV SDK', 'P2SH Scripts', 'WebCrypto', 'Node.js', 'PostgreSQL'],
        complexity: 'Advanced',
        estimatedTime: '5-7 weeks'
    },
    {
        id: 'token-treasury',
        name: 'Token Treasury System',
        description: 'Treasury management with token sales, cap tables, and payment verification',
        category: 'Blockchain',
        icon: FaChartLine,
        price: '£1500-2800',
        features: ['Token Sales', 'Cap Table', 'Volume Discounts', 'Payment Verification', 'Multi-currency Support'],
        tech: ['BSV-21', 'GorillaPool API', 'Supabase', 'Next.js', 'TypeScript'],
        complexity: 'Advanced',
        estimatedTime: '4-6 weeks'
    },
    {
        id: 'security',
        name: 'Security & Encryption',
        description: 'Advanced security features and data protection for your application',
        category: 'Security',
        icon: FaLock,
        price: '£500-900',
        features: ['Data Encryption', 'Secure API Endpoints', 'MFA', 'RBAC', 'Input Validation', 'XSS Prevention', 'SQLi Prevention', 'Secure Sessions'],
        tech: ['Node.js', 'JWT', 'Bcrypt', 'Helmet.js', 'OWASP ZAP', 'Nessus'],
        complexity: 'Intermediate',
        estimatedTime: '2-3 weeks'
    },
    {
        id: 'seo-optimization',
        name: 'SEO Optimization',
        description: 'Complete SEO tools and features to improve your search engine ranking',
        category: 'Analytics',
        icon: FaSearch,
        price: '£300-600',
        features: ['Keyword Research', 'On-Page SEO', 'Technical SEO', 'Schema Markup', 'Content Optimization', 'Backlink Analysis', 'Competitor Analysis', 'Analytics'],
        tech: ['Next.js', 'Google Analytics', 'Search Console', 'Ahrefs', 'Semrush'],
        complexity: 'Intermediate',
        estimatedTime: '2-3 weeks'
    },
    {
        id: 'video-streaming',
        name: 'Video Streaming',
        description: 'Video upload, processing, and streaming capabilities for your platform',
        category: 'Content',
        icon: FaVideo,
        price: '£1000-1800',
        features: ['Secure Uploads', 'Auto Processing', 'Adaptive Stream', 'CDN Delivery', 'Player Integration', 'Analytics', 'DRM', 'Live Streaming'],
        tech: ['AWS MediaConvert', 'S3', 'Cloudflare Stream', 'Mux', 'Video.js'],
        complexity: 'Advanced',
        estimatedTime: '3-4 weeks'
    }
];
