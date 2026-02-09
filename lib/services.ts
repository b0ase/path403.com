
import {
    FiArrowRight, FiHome, FiCode, FiVideo, FiMusic, FiGlobe,
    FiDatabase, FiSmartphone, FiShoppingCart, FiTrendingUp,
    FiCpu, FiLayers, FiExternalLink, FiBarChart, FiHeadphones,
    FiZap, FiTv, FiShare2, FiServer, FiCamera
} from 'react-icons/fi';
import {
    FaReact, FaWordpress, FaShopify, FaNodeJs, FaPython,
    FaFigma, FaInstagram, FaTiktok, FaSpotify, FaRobot,
    FaAws, FaStripe, FaDocker, FaYoutube, FaEthereum
} from 'react-icons/fa';

export interface Service {
    id: string;
    title: string;
    shortTitle: string;
    description: string;
    longDescription?: string; // Added for detail page
    price: string;
    timeline: string;
    status: string;
    technologies: string[];
    category: 'AI & Automation' | 'Development' | 'Creative' | 'Automation';
    featured?: boolean;
    deliverables: string[];
    icon?: any; // For mapping icons if needed, or we can resolve them in component
}

export const services: Service[] = [
    {
        id: 'ui-ux',
        title: 'UI/UX Design',
        shortTitle: 'UI/UX',
        description: 'Interface as Business Logic. We design for the "Third Audience" — Humans, Search, and AI Agents simultaneously.',
        longDescription: "Our UI/UX Design service treats the interface as a first-class citizen of your business logic. We define 'The Third Audience' standard, ensuring your application is equally legible to users, search engines, and autonomous AI agents. From high-fidelity prototypes and motion systems to comprehensive design systems with agentic schemas, we ensure every pixel and data point serves a purpose. By focusing on latency, cryptographic trust, and agentic workflows, we create experiences that are not only beautiful but architecturally superior.",
        price: '£1,000 - £3,500',
        timeline: '4-6 weeks',
        status: 'Available',
        technologies: ['Figma', 'Next.js', 'Framer Motion', 'Tailwind CSS', 'Storybook'],
        category: 'Creative',
        featured: true,
        deliverables: [
            'Interactive High-Fidelity Prototype',
            'AI-Readable (Third Audience) Schemas',
            'Full Design System (UI Kit)',
            'Agentic Workflow Mapping',
            'Animation & Motion Specs'
        ]
    },
    {
        id: 'llm-seo',
        title: 'LLM-Powered SEO & GEO',
        shortTitle: 'LLM SEO',
        description: 'Generative Engine Optimization (GEO). We optimize your content for both Google and the LLMs that power the next generation of search.',
        longDescription: "Our LLM-Powered SEO & GEO service leverages Large Language Models to revolutionize your content strategy. We don't just optimize for keywords; we optimize for 'The Third Audience'—ensuring your brand's data is crawlable, indexable, and quotable by AI agents. By integrating custom LLM pipelines with traditional SEO, we ensure your brand remains the primary source of truth across both traditional search results and generative AI responses.",
        price: '£800 - £2,500',
        timeline: '3-5 weeks',
        status: 'Available',
        technologies: ['GPT-4', 'Claude', 'Python', 'SEO Tools', 'Markdown'],
        category: 'AI & Automation',
        featured: true,
        deliverables: [
            'Generative Engine Optimization (GEO) audit',
            'AI-readable content pipeline',
            'SEO keyword optimization',
            'Markdown-first API surfaces',
            'Multi-platform publishing'
        ]
    },
    {
        id: 'voice-ai',
        title: 'AI Voice Cloning & Audio Content',
        shortTitle: 'Voice AI',
        description: 'Custom voice cloning for podcasts, audiobooks, and marketing content. Create unlimited audio content in your voice or custom brand voices.',
        longDescription: "Unlock the power of synthetic media with our AI Voice Cloning service. We create hyper-realistic voice models that are indistinguishable from the human original. Whether you need to narrate audiobooks, generate dynamic podcast ads, or localize video content into multiple languages, our pipeline delivers broadcast-quality audio at scale. We handle everything from data collection and model training to API integration, ensuring ethical usage and secure IP protection.",
        price: '£600 - £1,800',
        timeline: '2-4 weeks',
        status: 'Available',
        technologies: ['ElevenLabs', 'Python', 'Audio Processing', 'API Integration'],
        category: 'AI & Automation',
        featured: true,
        deliverables: [
            'Voice cloning model',
            'Audio generation pipeline',
            'Batch processing system',
            'Quality enhancement',
            'API integration'
        ]
    },
    {
        id: 'automation',
        title: 'No-Code Business Automation',
        shortTitle: 'Automation',
        description: 'Zapier, Make.com, and n8n workflows that automate your business processes. From lead generation to customer onboarding, eliminate manual tasks.',
        longDescription: "Stop wasting time on repetitive tasks. Our No-Code Business Automation service connects your favorite apps to create seamless, self-driving workflows. We map your entire business process—from lead capture to invoicing—and build robust automations using industry-leading tools like Make.com and Zapier. We handle complex logic, error handling, and data transformation, giving you back hours of productivity every single day.",
        price: '£400 - £1,200',
        timeline: '2-3 weeks',
        status: 'Available',
        technologies: ['Zapier', 'Make.com', 'n8n', 'Webhooks', 'API Integration'],
        category: 'Automation',
        featured: true,
        deliverables: [
            'Automated workflows',
            'Data synchronization',
            'Email automation',
            'CRM integration',
            'Performance monitoring'
        ]
    },
    {
        id: 'music-label-apps',
        title: 'React Apps for Music Labels',
        shortTitle: 'Music Label Apps',
        description: 'Modern streaming platforms, artist portfolios, and event management systems for record labels and music collectives. Complete with Spotify integration, ticket sales, and fan engagement features.',
        longDescription: "Empower your label with a bespoke digital ecosystem. We build high-performance React applications tailored for the music industry. Showcase your roster with immersive visuals, sell merchandise and tickets directly to fans without platform fees, and integrate streaming data from Spotify and Apple Music. Our solutions are designed to capture the unique aesthetic of your label while providing powerful tools to manage your business and grow your fanbase.",
        price: '£1,200 - £2,800',
        timeline: '6-8 weeks',
        status: 'Available',
        technologies: ['React', 'Next.js', 'Spotify API', 'Stripe', 'Sanity CMS'],
        category: 'Development',
        featured: true,
        deliverables: [
            'Artist roster website',
            'Streaming platform integration',
            'Event management system',
            'Fan engagement features',
            'Analytics dashboard'
        ]
    },
    {
        id: 'dj-visuals',
        title: 'Video Art for DJs & Musicians',
        shortTitle: 'DJ Visuals',
        description: 'Custom audio-reactive visuals, projection mapping content, and real-time generative art. Perfect for club nights, festivals, and live performances.',
        longDescription: "Transform your live sets into immersive audio-visual experiences. We create stunning, custom visuals that react in real-time to your music. Using advanced tools like TouchDesigner and WebGL, we design everything from loop packs to full projection mapping shows. Whether you need a subtle backdrop or a mind-bending light show, we deliver visual art that elevates your performance and leaves a lasting impression on your audience.",
        price: '£500 - £1,500',
        timeline: '2-4 weeks',
        status: 'Available',
        technologies: ['TouchDesigner', 'Three.js', 'WebGL', 'GLSL', 'After Effects'],
        category: 'Creative',
        featured: true,
        deliverables: [
            'VJ loop pack',
            'Audio-reactive visuals',
            'Projection mapping content',
            'Live performance setup',
            'Technical documentation'
        ]
    },
    {
        id: 'social-automation',
        title: 'Social Media Automation Dashboards',
        shortTitle: 'Social Automation',
        description: 'AI-powered content scheduling, multi-platform management, and analytics. Automate your entire social presence across Instagram, TikTok, Twitter, and LinkedIn.',
        longDescription: "Take command of your social media with a custom Automation Dashboard. We build centralized control centers that let you schedule posts, manage interactions, and track analytics across all major platforms. By integrating AI generation tools, we enable you to create and distribute content at scale with minimal effort. Say goodbye to juggling multiple apps and hello to a streamlined, data-driven social strategy.",
        price: '£1,800 - £4,500',
        timeline: '8-10 weeks',
        status: 'Available',
        technologies: ['React', 'Node.js', 'OpenAI', 'Instagram API', 'TikTok API'],
        category: 'Automation',
        featured: true,
        deliverables: [
            'Multi-platform dashboard',
            'AI content generation',
            'Scheduling system',
            'Analytics & reporting',
            'API integrations'
        ]
    },
    {
        id: 'saas-platforms',
        title: 'SaaS & Kintsugi Engines',
        shortTitle: 'SaaS Platforms',
        description: 'Complete software-as-a-service solutions using the Kintsugi Engine. Deploy subscription-for-equity models and bonding curve infrastructure.',
        longDescription: "Launch your next big idea with the Kintsugi Engine foundation. We build scalable, secure cloud platforms equipped with user management, recurring billing, and b0ase's proprietary equity-tranche system. Whether you are building a traditional SaaS or a tokenized ecosystem, we handle the infrastructure—from multi-wallet authentication to bonding curve logic—so you can focus on your product's unique value proposition.",
        price: '£3,500 - £8,500',
        timeline: '14-16 weeks',
        status: 'Available',
        technologies: ['Next.js', 'Kintsugi Engine', 'Stripe', 'PostgreSQL', 'Vercel'],
        category: 'Development',
        featured: true,
        deliverables: [
            'Full SaaS/Kintsugi platform',
            'Equity Tranche management',
            'Subscription billing',
            'User & Agent management',
            'Bonding Curve integration'
        ]
    },
    {
        id: 'ai-video',
        title: 'AI Video Generation & Deepfakes',
        shortTitle: 'AI Video',
        description: 'Generate professional videos using AI avatars, deepfake technology, and automated editing. Perfect for marketing, training content, and social media at scale.',
        longDescription: "Scale your video production without the studio costs. Our AI Video Generation service utilizes state-of-the-art synthetic media technology to produce high-quality video content from text. Create virtual presenters for training modules, personalized video messages for sales outreach, or endless social media clips. We integrate leading tools like HeyGen and RunwayML into automated workflows, delivering professional results in a fraction of the time.",
        price: '£900 - £2,500',
        timeline: '4-6 weeks',
        status: 'Available',
        technologies: ['RunwayML', 'D-ID', 'Synthesia', 'Python', 'FFmpeg'],
        category: 'AI & Automation',
        featured: true,
        deliverables: [
            'AI avatar creation',
            'Automated video editing',
            'Script-to-video pipeline',
            'Multi-language dubbing',
            'Template design'
        ]
    },
    // Additional services from the previous list can be added here if needed,
    // but these are the core 8 the user asked for.
    {
        id: 'wordpress-professional',
        title: 'WordPress for Professional Services',
        shortTitle: 'WordPress Sites',
        description: 'Sophisticated websites for law firms, medical practices, and consulting agencies. Includes booking systems, client portals, and case management integration.',
        longDescription: "Elevate your professional practice with a website that exudes trust and authority. We design and develop custom WordPress solutions tailored to the specific needs of service professionals. Whether you need a HIPAA-compliant portal for patients, a secure client intranet for your law firm, or a seamless booking engine for your consultancy, we deliver secure, high-performance sites that serve as the digital headquarters of your business.",
        price: '£700 - £1,800',
        timeline: '3-4 weeks',
        status: 'Available',
        technologies: ['WordPress', 'Custom Themes', 'WooCommerce', 'Elementor', 'ACF'],
        category: 'Development',
        featured: false,
        deliverables: [
            'Custom WordPress theme',
            'Booking system',
            'Client portal',
            'SEO optimization',
            'Admin training'
        ]
    },
    {
        id: 'ecommerce-fashion',
        title: 'E-commerce for Fashion Brands',
        shortTitle: 'Fashion E-commerce',
        description: 'Luxury online stores with virtual try-on features, size recommendations, and Instagram shopping. Built for conversion with premium user experience.',
        longDescription: "Create a digital storefront as stylish as your collection. Our Fashion E-commerce service focuses on visual storytelling and seamless purchasing experiences. We leverage platforms like Shopify Plus to build high-converting sites featuring AR virtual try-ons, intelligent sizing algorithms, and shoppable social feeds. We ensure your brand's aesthetic is perfectly translated online while maximizing Average Order Value and customer retention.",
        price: '£1,500 - £3,500',
        timeline: '6-8 weeks',
        status: 'Available',
        technologies: ['Shopify Plus', 'React', 'AR.js', 'Klaviyo', 'Instagram Shopping'],
        category: 'Development',
        featured: false,
        deliverables: [
            'Shopify Plus setup',
            'Custom theme development',
            'AR try-on features',
            'Instagram Shopping',
            'Email automation'
        ]
    },
    {
        id: 'crypto-dashboards',
        title: 'Crypto Trading & DeFi Platforms',
        shortTitle: 'Crypto Dashboards',
        description: 'Real-time portfolio tracking, DeFi yield aggregators, and automated trading interfaces. Connect to multiple exchanges and blockchain networks.',
        longDescription: "Stay ahead of the market with professional-grade crypto tools. We build high-speed, secure trading dashboards and DeFi interfaces that connect directly to the blockchain. From real-time price charting and portfolio analytics to automated trading bots and yield farming aggregators, our solutions are built for serious traders and fintech innovators. Security, latency, and reliability are our top priorities.",
        price: '£3,000 - £7,500',
        timeline: '12-14 weeks',
        status: 'Available',
        technologies: ['React', 'WebSockets', 'Web3.js', 'TradingView', 'Binance API'],
        category: 'Development',
        featured: false,
        deliverables: [
            'Trading dashboard',
            'Portfolio tracker',
            'DeFi integrations',
            'Real-time data feeds',
            'Security audit'
        ]
    },
    {
        id: 'ai-chatbots',
        title: 'AI Customer Service Agents',
        shortTitle: 'AI Agents',
        description: 'Intelligent chatbots that handle support tickets, book appointments, and process orders 24/7. Trained on your data with human-like conversation abilities.',
        longDescription: "Revolutionize your customer support with Al. Our AI Agents aren't just script-readers; they are intelligent virtual employees trained on your specific business data. They can handle complex queries, execute actions like booking appointments or processing refunds, and provide 24/7 support in multiple languages. We use advanced RAG (Retrieval-Augmented Generation) techniques to ensure accuracy and relevance, improving customer satisfaction while drastically reducing support costs.",
        price: '£900 - £2,500',
        timeline: '4-6 weeks',
        status: 'Available',
        technologies: ['GPT-4', 'Python', 'Langchain', 'Pinecone', 'Twilio'],
        category: 'Automation',
        featured: false,
        deliverables: [
            'Custom AI chatbot',
            'Training on your data',
            'Multi-channel deployment',
            'Admin dashboard',
            'Performance analytics'
        ]
    },
    {
        id: 'mobile-apps',
        title: 'React Native Mobile Apps',
        shortTitle: 'Mobile Apps',
        description: 'Native mobile applications for startups and enterprises. From fitness trackers to social networks, delivered to both app stores.',
        longDescription: "Turn your idea into a feature-rich mobile app. We use React Native to build cross-platform applications that offer true native performance on both iOS and Android from a single codebase. Whether you're building a social network, a fitness tracker, or an enterprise productivity tool, we handle the entire lifecycle—from UI/UX design and development to app store submission and maintenance. Get to market faster without compromising on quality.",
        price: '£2,200 - £6,000',
        timeline: '10-12 weeks',
        status: 'Available',
        technologies: ['React Native', 'Expo', 'Firebase', 'Redux', 'Push Notifications'],
        category: 'Development',
        featured: false,
        deliverables: [
            'iOS app',
            'Android app',
            'Backend API',
            'App store deployment',
            'Push notifications'
        ]
    },
    {
        id: 'cyber-security',
        title: 'Autonomous AI Pentesting',
        shortTitle: 'Cyber Security',
        description: "Continuous offensive security powered by Shannon. Identifying and proving vulnerabilities using autonomous agentic exploitation.",
        longDescription: "Secure your digital infrastructure with Shannon—our proprietary autonomous AI pentesting agent. Unlike traditional scanners that flag false positives, Shannon conducts deep, multi-agent reconnaissance and executes real exploits to provide cryptographic proof of vulnerability. We provide continuous penetration testing and security audits for web apps, APIs, and smart contracts, ensuring you identify weaknesses before attackers do.",
        price: '£2,000 - £8,000',
        timeline: '2-5 weeks',
        status: 'Available',
        technologies: ['Shannon', 'Keygraph', 'Sonnet 3.5', 'Python', 'Solidity'],
        category: 'Development',
        featured: true,
        deliverables: [
            'Shannon Pentest Report',
            'Exploitation Proof-of-Concepts (PoCs)',
            'Vulnerability Assessment',
            'Smart Contract Audit',
            'Remediation Guidance'
        ]
    }

];
