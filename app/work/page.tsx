'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiArrowRight, FiHome, FiCode, FiVideo, FiMusic, FiGlobe, FiDatabase, FiSmartphone, FiShoppingCart, FiTrendingUp, FiCpu, FiLayers, FiExternalLink } from 'react-icons/fi';
import { FaReact, FaWordpress, FaShopify, FaNodeJs, FaPython, FaFigma, FaInstagram, FaTiktok, FaSpotify } from 'react-icons/fa';

// Service offerings with detailed information
const services = [
  {
    id: 'llm-seo-optimization',
    title: 'LLM-Powered SEO & Content Generation',
    shortTitle: 'LLM SEO',
    href: '/work/llm-seo',
    description: 'AI-driven SEO strategies using large language models for content creation, keyword optimization, and automated blog generation. Scale your content marketing with intelligent automation.',
    price: '£800 - £2,500',
    timeline: '3-5 weeks',
    status: 'Available',
    technologies: ['GPT-4', 'Claude', 'Python', 'SEO Tools', 'WordPress'],
    category: 'AI & Automation',
    featured: true,
    deliverables: [
      'AI content generation system',
      'Automated blog posting',
      'SEO keyword optimization',
      'Content performance analytics',
      'Multi-platform publishing'
    ]
  },
  {
    id: 'ai-voice-cloning',
    title: 'AI Voice Cloning & Audio Content',
    shortTitle: 'Voice AI',
    href: '/work/voice-ai',
    description: 'Custom voice cloning for podcasts, audiobooks, and marketing content. Create unlimited audio content in your voice or custom brand voices.',
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
    id: 'automation-workflows',
    title: 'No-Code Business Automation',
    shortTitle: 'Automation',
    description: 'Zapier, Make.com, and n8n workflows that automate your business processes. From lead generation to customer onboarding, eliminate manual tasks.',
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
    id: 'wordpress-professional',
    title: 'WordPress for Professional Services',
    shortTitle: 'WordPress Sites',
    description: 'Sophisticated websites for law firms, medical practices, and consulting agencies. Includes booking systems, client portals, and case management integration.',
    price: '£700 - £1,800',
    timeline: '3-4 weeks',
    status: 'Available',
    technologies: ['WordPress', 'Custom Themes', 'WooCommerce', 'Elementor', 'ACF'],
    category: 'Development',
    deliverables: [
      'Custom WordPress theme',
      'Booking system',
      'Client portal',
      'SEO optimization',
      'Admin training'
    ]
  },
  {
    id: 'social-automation',
    title: 'Social Media Automation Dashboards',
    shortTitle: 'Social Automation',
    description: 'AI-powered content scheduling, multi-platform management, and analytics. Automate your entire social presence across Instagram, TikTok, Twitter, and LinkedIn.',
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
    id: 'ecommerce-fashion',
    title: 'E-commerce for Fashion Brands',
    shortTitle: 'Fashion E-commerce',
    description: 'Luxury online stores with virtual try-on features, size recommendations, and Instagram shopping. Built for conversion with premium user experience.',
    price: '£1,500 - £3,500',
    timeline: '6-8 weeks',
    status: 'Available',
    technologies: ['Shopify Plus', 'React', 'AR.js', 'Klaviyo', 'Instagram Shopping'],
    category: 'Development',
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
    price: '£3,000 - £7,500',
    timeline: '12-14 weeks',
    status: 'Available',
    technologies: ['React', 'WebSockets', 'Web3.js', 'TradingView', 'Binance API'],
    category: 'Development',
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
    price: '£900 - £2,500',
    timeline: '4-6 weeks',
    status: 'Available',
    technologies: ['GPT-4', 'Python', 'Langchain', 'Pinecone', 'Twilio'],
    category: 'Automation',
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
    price: '£2,200 - £6,000',
    timeline: '10-12 weeks',
    status: 'Available',
    technologies: ['React Native', 'Expo', 'Firebase', 'Redux', 'Push Notifications'],
    category: 'Development',
    deliverables: [
      'iOS app',
      'Android app',
      'Backend API',
      'App store deployment',
      'Push notifications'
    ]
  },
  {
    id: 'saas-platforms',
    title: 'SaaS Platforms with Billing',
    shortTitle: 'SaaS Platforms',
    description: 'Complete software-as-a-service solutions with user management, subscription billing, and admin dashboards. Ready to scale from day one.',
    price: '£3,500 - £8,500',
    timeline: '14-16 weeks',
    status: 'Available',
    technologies: ['Next.js', 'Supabase', 'Stripe', 'PostgreSQL', 'Vercel'],
    category: 'Development',
    featured: true,
    deliverables: [
      'Full SaaS platform',
      'Subscription billing',
      'User management',
      'Admin dashboard',
      'Documentation'
    ]
  },
  {
    id: 'ai-video-generation',
    title: 'AI Video Generation & Deepfakes',
    shortTitle: 'AI Video',
    description: 'Generate professional videos using AI avatars, deepfake technology, and automated editing. Perfect for marketing, training content, and social media at scale.',
    price: '£900 - £2,500',
    timeline: '4-6 weeks',
    status: 'Available',
    technologies: ['RunwayML', 'D-ID', 'Synthesia', 'Python', 'FFmpeg'],
    category: 'AI & Automation',
    featured: true,
    deliverables: [
      'AI avatar creation',
      'Automated video editing',
      'Deepfake generation',
      'Batch processing system',
      'Quality optimization'
    ]
  },
  {
    id: 'chatgpt-plugins',
    title: 'Custom ChatGPT Plugins & AI Tools',
    shortTitle: 'AI Plugins',
    description: 'Build custom ChatGPT plugins, AI assistants, and GPT wrappers for specific business needs. Monetize AI capabilities with subscription models.',
    price: '£500 - £1,600',
    timeline: '3-4 weeks',
    status: 'Available',
    technologies: ['OpenAI API', 'LangChain', 'Pinecone', 'FastAPI', 'React'],
    category: 'AI & Automation',
    deliverables: [
      'Custom AI plugin',
      'Knowledge base integration',
      'User interface',
      'Subscription billing',
      'API documentation'
    ]
  },
  {
    id: 'influencer-automation',
    title: 'Influencer Marketing Automation',
    shortTitle: 'Influencer AI',
    description: 'AI-powered influencer discovery, outreach automation, and performance tracking. Scale influencer partnerships with intelligent matching and campaign management.',
    price: '£1,200 - £3,200',
    timeline: '6-8 weeks',
    status: 'Available',
    technologies: ['Python', 'Instagram API', 'TikTok API', 'AI Analytics', 'CRM'],
    category: 'AI & Automation',
    deliverables: [
      'Influencer discovery system',
      'Automated outreach',
      'Performance analytics',
      'Campaign management',
      'ROI tracking'
    ]
  },
  {
    id: 'nft-web3',
    title: 'NFT Marketplaces & Web3',
    shortTitle: 'Web3 Integration',
    description: 'Custom blockchain-connected galleries, minting platforms, and DApps. Connect your business to the decentralized web with smart contracts and wallet integration.',
    price: '£2,200 - £5,500',
    timeline: '10-12 weeks',
    status: 'Available',
    technologies: ['Web3.js', 'Ethereum', 'IPFS', 'MetaMask', 'Solidity'],
    category: 'Development',
    deliverables: [
      'NFT marketplace',
      'Smart contracts',
      'Wallet integration',
      'IPFS storage',
      'Gas optimization'
    ]
  }
];

export default function WorkPage() {
  const [isDark, setIsDark] = useState(true);
  const [expandedService, setExpandedService] = useState<string | null>(null);
  const router = useRouter();

  return (
    <motion.div
      className={`min-h-screen ${isDark ? 'bg-black text-white' : 'bg-white text-black'} relative`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >


      {/* Main Content */}
      <motion.section
        className="px-4 md:px-8 py-16 relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <div className="w-full">
          {/* Page Title */}
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <h2 className={`text-6xl md:text-8xl lg:text-9xl font-bold ${isDark ? 'text-white' : 'text-black'} leading-none`}>
              WORK
            </h2>
            <p className={`text-sm md:text-base lg:text-lg mt-2 uppercase tracking-widest ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              DIGITAL SOLUTIONS & CREATIVE SERVICES
            </p>
          </motion.div>

          {/* Stats Bar */}
          <motion.div
            className="flex items-baseline gap-6 mb-6 px-4"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>{services.length}</span>
              <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Services</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                {services.filter(s => s.featured).length}
              </span>
              <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Featured</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>4</span>
              <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Categories</span>
            </div>
          </motion.div>

          {/* Services Grid */}
          <motion.div
            className="flex-1 overflow-y-auto px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {services.filter(s => s.featured).map((service, index) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 + (index * 0.05) }}
                  className={`
                    relative group cursor-pointer
                    ${isDark ? 'bg-gray-900/30' : 'bg-gray-50'} 
                    rounded-lg overflow-hidden
                    transition-all duration-300 hover:scale-[1.02]
                  `}
                  onClick={() => {
                    if (service.href) {
                      router.push(service.href);
                    } else {
                      setExpandedService(expandedService === service.id ? null : service.id);
                    }
                  }}
                >
                  {/* Main Content */}
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-black'} mb-1`}>
                          {service.shortTitle}
                        </h3>
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2 line-clamp-2`}>
                          {service.description}
                        </p>
                        <div className="flex items-center gap-2 text-xs">
                          <span className={`${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                            {service.category}
                          </span>
                          <span className={`${isDark ? 'text-gray-500' : 'text-gray-500'}`}>•</span>
                          <span className={`font-medium ${isDark ? 'text-white' : 'text-black'}`}>
                            {service.price}
                          </span>
                        </div>
                      </div>
                      <div className={`
                        p-2 rounded-lg transition-all duration-300
                        ${isDark ? 'bg-gray-800' : 'bg-white'}
                        group-hover:scale-110
                      `}>
                        <FiArrowRight size={14} />
                      </div>
                    </div>

                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Bottom Navigation */}
          <motion.div
            className="flex justify-between items-center px-4 py-4 border-t border-opacity-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            <Link
              href="/"
              className={`text-xs ${isDark ? 'text-gray-500 hover:text-white' : 'text-gray-600 hover:text-black'} transition-colors`}
            >
              ← Home
            </Link>
            <Link
              href="/contact"
              className="text-xs px-4 py-2 rounded-full font-medium transition-all hover:opacity-80"
              style={{ backgroundColor: isDark ? '#fff' : '#000', color: isDark ? '#000' : '#fff' }}
            >
              Get Started
            </Link>
            <button
              onClick={() => setIsDark(!isDark)}
              className={`px-3 py-1 rounded-full text-xs transition-all ${isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-black/10 hover:bg-black/20 text-black'}`}
            >
              {isDark ? '☀' : '☾'}
            </button>
          </motion.div>
        </div>
      </motion.section>
    </motion.div>
  );
}