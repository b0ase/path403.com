'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  FaReact, FaNodeJs, FaDatabase, FaMobile, FaShoppingCart, FaUser, 
  FaCreditCard, FaSearch, FaChartLine, FaLock, FaRobot, FaBitcoin,
  FaVideo, FaComments, FaBell, FaCalendarAlt, FaEdit, FaUpload, 
  FaWallet, FaCube, FaTrash, FaMagic, FaReceipt, FaTimes, FaCode, FaTools, FaGlobe, FaServer, FaFileContract, FaWrench, FaCheckCircle, FaCoins, FaInfoCircle, FaPaw, FaLeaf, FaExchangeAlt, FaUtensils, FaPaintBrush, FaRunning, FaBullhorn, FaPlus, FaSync, FaRocket, FaPoundSign, FaCogs, FaEye, FaBuilding, FaChevronDown
} from 'react-icons/fa';
import { FiHome } from 'react-icons/fi';
import { useState as useTooltipState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { portfolioData } from '@/lib/data';
import { Sparkles, Coins, Rocket, Leaf, CheckCircle, TrendingUp, DollarSign, Users, Clock, Shield } from 'lucide-react';

interface Module {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ComponentType<any>;
  price: number;
  features: string[];
  tech: string[];
  complexity: 'Basic' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  hoverColor: string;
}

interface SelectedElement {
  skill: string;
  category: string;
}

interface MintPadElement {
  id: string;
  skill: string;
  category: string;
  position: { x: number; y: number };
}

const modules: Module[] = [
  {
    id: 'react-dashboard',
    name: 'React Dashboard',
    description: 'Complete admin interface with charts, tables, and user management',
    category: 'Frontend',
    icon: FaReact,
    price: 650,
    features: ['User Management', 'Analytics Charts', 'Data Tables', 'Responsive Design'],
    tech: ['React', 'TypeScript', 'Tailwind CSS', 'Chart.js'],
    complexity: 'Intermediate',
    estimatedTime: '1-2 weeks',
    hoverColor: 'cyan'
  },
  {
    id: 'mobile-app',
    name: 'Mobile App',
    description: 'Native-feeling mobile app for iOS and Android',
    category: 'Mobile',
    icon: FaMobile,
    price: 1600,
    features: ['Push Notifications', 'Offline Support', 'Native Performance', 'App Store Ready'],
    tech: ['React Native', 'Expo', 'TypeScript', 'Firebase'],
    complexity: 'Advanced',
    estimatedTime: '3-4 weeks',
    hoverColor: 'purple'
  },
  {
    id: 'e-commerce-store',
    name: 'E-commerce Store',
    description: 'Full-featured online store with cart and checkout',
    category: 'E-commerce',
    icon: FaShoppingCart,
    price: 1150,
    features: ['Product Catalog', 'Shopping Cart', 'Checkout Flow', 'Order Management'],
    tech: ['Next.js', 'Stripe', 'PostgreSQL', 'Prisma'],
    complexity: 'Advanced',
    estimatedTime: '2-3 weeks',
    hoverColor: 'emerald'
  },
  {
    id: 'payment-system',
    name: 'Payment System',
    description: 'Secure payment gateway with multiple providers',
    category: 'E-commerce',
    icon: FaCreditCard,
    price: 450,
    features: ['Stripe Integration', 'PayPal Support', 'Crypto Payments', 'Subscription Billing'],
    tech: ['Stripe API', 'PayPal SDK', 'Web3.js', 'Node.js'],
    complexity: 'Intermediate',
    estimatedTime: '1 week',
    hoverColor: 'blue'
  },
  {
    id: 'api-backend',
    name: 'API Backend',
    description: 'Scalable API with authentication and database integration',
    category: 'Backend',
    icon: FaNodeJs,
    price: 800,
    features: ['JWT Authentication', 'Rate Limiting', 'API Documentation', 'Error Handling'],
    tech: ['Node.js', 'Express', 'PostgreSQL', 'Redis'],
    complexity: 'Intermediate',
    estimatedTime: '1-2 weeks',
    hoverColor: 'green'
  },
  {
    id: 'database-design',
    name: 'Database Design',
    description: 'Optimized database schema with migrations and seeding',
    category: 'Backend',
    icon: FaDatabase,
    price: 550,
    features: ['Schema Design', 'Migrations', 'Indexing', 'Backup Strategy'],
    tech: ['PostgreSQL', 'Prisma', 'Redis', 'MongoDB'],
    complexity: 'Intermediate',
    estimatedTime: '1 week',
    hoverColor: 'teal'
  },
  {
    id: 'authentication',
    name: 'Authentication System',
    description: 'Complete user authentication with social login options',
    category: 'Security',
    icon: FaUser,
    price: 600,
    features: ['Email/Password Auth', 'Social Login', 'Password Recovery', 'Email Verification'],
    tech: ['Supabase Auth', 'NextAuth.js', 'OAuth', 'JWT'],
    complexity: 'Intermediate',
    estimatedTime: '1 week',
    hoverColor: 'indigo'
  },
  {
    id: 'ai-chatbot',
    name: 'AI Chatbot',
    description: 'Intelligent chatbot with natural language processing',
    category: 'AI/ML',
    icon: FaRobot,
    price: 950,
    features: ['Natural Language Processing', 'Context Awareness', 'Multi-language', 'Analytics'],
    tech: ['OpenAI API', 'LangChain', 'Vector Database', 'Node.js'],
    complexity: 'Advanced',
    estimatedTime: '2-3 weeks',
    hoverColor: 'purple'
  },
  {
    id: 'blockchain-integration',
    name: 'Blockchain Integration',
    description: 'Web3 wallet connection and smart contract interaction',
    category: 'Blockchain',
    icon: FaBitcoin,
    price: 1150,
    features: ['Wallet Connection', 'Smart Contracts', 'Token Transfers', 'NFT Support'],
    tech: ['Web3.js', 'Ethers.js', 'Solidity', 'MetaMask'],
    complexity: 'Advanced',
    estimatedTime: '2-4 weeks',
    hoverColor: 'yellow'
  },
  {
    id: 'cms-system',
    name: 'CMS System',
    description: 'Easy-to-use content management with rich text editor',
    category: 'Content',
    icon: FaEdit,
    price: 800,
    features: ['Rich Text Editor', 'Media Management', 'SEO Tools', 'Content Scheduling'],
    tech: ['Sanity', 'Strapi', 'TinyMCE', 'Cloudinary'],
    complexity: 'Intermediate',
    estimatedTime: '1-2 weeks',
    hoverColor: 'violet'
  },
  {
    id: 'analytics-dashboard',
    name: 'Analytics Dashboard',
    description: 'Real-time analytics and reporting with custom metrics',
    category: 'Analytics',
    icon: FaChartLine,
    price: 700,
    features: ['Real-time Data', 'Custom Metrics', 'Export Reports', 'Goal Tracking'],
    tech: ['Google Analytics', 'Chart.js', 'D3.js', 'PostgreSQL'],
    complexity: 'Intermediate',
    estimatedTime: '1-2 weeks',
    hoverColor: 'blue'
  },
  {
    id: 'notification-system',
    name: 'Notification System',
    description: 'Multi-channel notification delivery system',
    category: 'Communication',
    icon: FaBell,
    price: 550,
    features: ['Email Notifications', 'SMS Alerts', 'Push Notifications', 'In-app Messages'],
    tech: ['SendGrid', 'Twilio', 'Firebase Cloud Messaging', 'WebSockets'],
    complexity: 'Intermediate',
    estimatedTime: '1 week',
    hoverColor: 'orange'
  },
  {
    id: 'search-functionality',
    name: 'SEO Optimization',
    description: 'Complete SEO tools and optimization features',
    category: 'SEO',
    icon: FaSearch,
    price: 450,
    features: ['Full-text Search', 'Fuzzy Matching', 'Filtering', 'Sorting'],
    tech: ['Elasticsearch', 'Algolia', 'PostgreSQL', 'Redis'],
    complexity: 'Intermediate',
    estimatedTime: '1 week',
    hoverColor: 'lime'
  },
  {
    id: 'file-upload-system',
    name: 'File Management',
    description: 'Upload, organize, and manage files with cloud storage',
    category: 'Utility',
    icon: FaUpload,
    price: 400,
    features: ['File Upload', 'Cloud Storage', 'File Organization', 'Access Control'],
    tech: ['AWS S3', 'Cloudinary', 'Multer', 'Sharp'],
    complexity: 'Basic',
    estimatedTime: '1 week',
    hoverColor: 'gray'
  },
  {
    id: 'live-chat-system',
    name: 'Live Chat System',
    description: 'Real-time messaging and customer support chat',
    category: 'Communication',
    icon: FaComments,
    price: 800,
    features: ['Real-time Messaging', 'File Sharing', 'Typing Indicators', 'Chat History'],
    tech: ['Socket.io', 'WebRTC', 'Redis', 'MongoDB'],
    complexity: 'Advanced',
    estimatedTime: '2-3 weeks',
    hoverColor: 'emerald'
  },
  {
    id: 'video-streaming',
    name: 'Video Streaming',
    description: 'Video upload, processing, and streaming capabilities',
    category: 'Media',
    icon: FaVideo,
    price: 1400,
    features: ['Video Upload', 'Stream Processing', 'CDN Integration', 'Adaptive Bitrate'],
    tech: ['FFmpeg', 'AWS S3', 'CloudFront', 'WebRTC'],
    complexity: 'Advanced',
    estimatedTime: '3-4 weeks',
    hoverColor: 'indigo'
  },
  {
    id: 'subscription-service',
    name: 'Subscription Service',
    description: 'Manage recurring payments and user subscriptions',
    category: 'E-commerce',
    icon: FaCreditCard,
    price: 700,
    features: ['Recurring Billing', 'Trial Periods', 'Proration', 'Payment Gateway Integration'],
    tech: ['Stripe', 'Paddle', 'Node.js', 'PostgreSQL'],
    complexity: 'Intermediate',
    estimatedTime: '1-2 weeks',
    hoverColor: 'green'
  },
  {
    id: 'social-media-integration',
    name: 'Social Media Integration',
    description: 'Integrate social media login, sharing, and content embedding',
    category: 'Communication',
    icon: FaComments,
    price: 550,
    features: ['Social Login', 'Share Buttons', 'Embed Feeds', 'Analytics'],
    tech: ['OAuth', 'Facebook SDK', 'Twitter API', 'Next.js'],
    complexity: 'Intermediate',
    estimatedTime: '1 week',
    hoverColor: 'pink'
  },
  {
    id: 'real-time-features',
    name: 'Real-time Features',
    description: 'Integrate real-time capabilities like live updates and notifications',
    category: 'Communication',
    icon: FaComments,
    price: 800,
    features: ['Live Updates', 'WebSockets', 'Real-time Analytics', 'Presence Indicators'],
    tech: ['Socket.io', 'WebRTC', 'Redis', 'Node.js'],
    complexity: 'Advanced',
    estimatedTime: '2-3 weeks',
    hoverColor: 'rose'
  }
];

interface SelectedModule extends Module {
  uniqueId: string;
  position: { x: number; y: number };
}

// Define the type for items in the purchase order
type ItemOrder = {
  id: string;
  type: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
};

// Mock data for modules (tech + content)
const techModules = [
  { id: 'ai-chatbot', name: 'AI Chatbot', price: 950 },
  { id: 'analytics-dashboard', name: 'Analytics Dashboard', price: 800 },
  { id: 'api-backend', name: 'API Backend', price: 900 },
  { id: 'authentication', name: 'Authentication System', price: 600 },
  { id: 'blockchain-integration', name: 'Blockchain Integration', price: 1200 },
  { id: 'cms-system', name: 'CMS System', price: 700 },
  { id: 'database-design', name: 'Database Design', price: 550 },
  { id: 'e-commerce-store', name: 'E-commerce Store', price: 1100 },
  { id: 'live-chat-system', name: 'Live Chat System', price: 800 },
  { id: 'mobile-app', name: 'Mobile App', price: 1600 },
  { id: 'notification-system', name: 'Notification System', price: 550 },
  { id: 'payment-system', name: 'Payment System', price: 450 },
  { id: 'react-dashboard', name: 'React Dashboard', price: 650 },
  { id: 'real-time-features', name: 'Real-time Features', price: 800 },
  { id: 'search-functionality', name: 'SEO Optimization', price: 450 },
  { id: 'security', name: 'Security & Encryption', price: 700 },
  { id: 'seo-optimization', name: 'SEO Optimization', price: 400 },
  { id: 'social-media-integration', name: 'Social Media Integration', price: 550 },
  { id: 'subscription-service', name: 'Subscription Service', price: 700 },
  { id: 'video-streaming', name: 'Video Streaming', price: 1400 },
  { id: 'file-upload-system', name: 'File Upload System', price: 500 },
];
const contentModules = [
  { id: 'website-copy', name: 'Website Copy', price: 300 },
  { id: 'blog-articles', name: 'Blog Articles', price: 200 },
  { id: 'social-media-content', name: 'Social Media Content', price: 250 },
  { id: 'video-scripts', name: 'Video Scripts', price: 250 },
  { id: 'email-marketing', name: 'Email Marketing', price: 200 },
  { id: 'advertising-copy', name: 'Advertising Copy', price: 200 },
  { id: 'infographic-design', name: 'Infographic Design', price: 300 },
  { id: 'product-photography', name: 'Product Photography', price: 400 },
  { id: 'music-videos', name: 'Music Videos', price: 600 },
  { id: 'ai-audio-production', name: 'AI Audio Production', price: 400 },
  { id: 'ai-generated-music', name: 'AI Generated Music', price: 350 },
  { id: 'ai-generated-photos', name: 'AI Generated Photos', price: 350 },
  { id: 'ai-generated-videos', name: 'AI Generated Videos', price: 500 },
  { id: 'ai-influencer', name: 'AI Influencer', price: 800 },
];
const skills = [
  'JavaScript', 'TypeScript', 'Python', 'Solidity', 'SQL', 'React', 'Next.js', 'Node.js', 'Express', 'Tailwind CSS', 'PostgreSQL', 'MongoDB', 'Redis', 'Web3.js', 'Ethers.js', 'OpenAI API', 'LangChain', 'Stripe', 'Firebase', 'Socket.io', 'Expo', 'Sanity', 'Strapi', 'OAuth', 'JWT', 'Chart.js', 'D3.js', 'Cloudinary', 'AWS S3', 'FFmpeg', 'WebRTC', 'Prisma', 'Paddle', 'SendGrid', 'Twilio', 'MetaMask', 'TinyMCE', 'Google Analytics', 'Chart.js', 'D3.js', 'Cloudinary', 'AWS S3', 'FFmpeg', 'WebRTC', 'Prisma', 'Paddle', 'SendGrid', 'Twilio', 'MetaMask', 'TinyMCE', 'Google Analytics'
];
const recommendedStack = ['TypeScript', 'React', 'Next.js', 'Node.js', 'PostgreSQL', 'Tailwind CSS'];

const companyEssentials = [
  { id: 'domain', name: 'Domain Name', icon: FaGlobe, price: 30 },
  { id: 'hosting', name: 'Hosting', icon: FaServer, price: 120 },
  { id: 'maintenance', name: 'Maintenance (1yr)', icon: FaWrench, price: 200 },
  { id: 'incorporation', name: 'Incorporation Documents', icon: FaFileContract, price: 300 },
];

// Tooltip helper (simple hover, no external lib)
function InfoTooltip({ text }) {
  const [show, setShow] = useTooltipState(false);
  return (
    <span className="relative inline-block align-middle ml-1">
      <FaInfoCircle className="inline text-cyan-400 cursor-pointer" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)} />
      {show && (
        <span className="absolute z-20 left-1/2 -translate-x-1/2 mt-2 w-64 bg-gray-900 text-gray-100 text-xs rounded shadow-lg p-2 border border-cyan-700">
          {text}
        </span>
      )}
    </span>
  );
}

const iconMap = {
  FaPaw,
  FaLeaf,
  FaExchangeAlt,
  FaUtensils,
  FaPaintBrush,
  FaRunning,
  FaBullhorn,
  FaGlobe,
  FaServer,
  FaWrench,
  FaMagic,
  FaCube,
};

interface MintIdea {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  estimatedValue: string;
  complexity: 'Simple' | 'Medium' | 'Complex';
  timeToMarket: string;
}

const sampleCompanies = [
  {
    id: 'ecotech',
    name: 'EcoTech Solutions',
    description: 'Sustainable technology for green businesses',
    category: 'Technology',
    price: '$5,000',
    token: '$ECO',
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=200&fit=crop'
  },
  {
    id: 'healthsync',
    name: 'HealthSync',
    description: 'AI-powered healthcare management platform',
    category: 'Healthcare',
    price: '$5,000',
    token: '$HEALTH',
    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=200&fit=crop'
  },
  {
    id: 'cryptolearn',
    name: 'CryptoLearn',
    description: 'Educational platform for cryptocurrency trading',
    category: 'Education',
    price: '$5,000',
    token: '$LEARN',
    image: 'https://images.unsplash.com/photo-1640340434855-6084b1f4901c?w=400&h=200&fit=crop'
  },
  {
    id: 'fitflow',
    name: 'FitFlow',
    description: 'Personalized fitness and nutrition tracking',
    category: 'Health & Fitness',
    price: '$5,000',
    token: '$FIT',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=200&fit=crop'
  },
  {
    id: 'artchain',
    name: 'ArtChain',
    description: 'NFT marketplace for digital artists',
    category: 'Art & Design',
    price: '$5,000',
    token: '$ART',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=200&fit=crop'
  },
  {
    id: 'smartfarm',
    name: 'SmartFarm',
    description: 'IoT solutions for modern agriculture',
    category: 'Agriculture',
    price: '$5,000',
    token: '$FARM',
    image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=200&fit=crop'
  }
];

const valuePropositions = [
  {
    icon: TrendingUp,
    title: 'Proven ROI',
    description: 'Our companies average 300% returns within 18 months',
    stat: '300% ROI'
  },
  {
    icon: Clock,
    title: 'Ready to Launch',
    description: 'Complete business infrastructure, ready for immediate operation',
    stat: '0 Days Setup'
  },
  {
    icon: Shield,
    title: 'Risk Mitigation',
    description: 'Diversified portfolio approach with built-in market validation',
    stat: '85% Success Rate'
  },
  {
    icon: Users,
    title: 'Expert Team',
    description: 'Access to our network of industry professionals and advisors',
    stat: '50+ Experts'
  }
];

export default function MintPage() {
  const [mintIdeas, setMintIdeas] = useState<MintIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [generatedIdea, setGeneratedIdea] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    fetchMintIdeas();
  }, []);

  const fetchMintIdeas = async () => {
    try {
      const response = await fetch('/api/mint-ideas');
      const data = await response.json();
      setMintIdeas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching mint ideas:', error);
      setMintIdeas([]);
    } finally {
      setLoading(false);
    }
  };

  const generateIdea = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/mint-ideas');
      const data = await response.json();
      setMintIdeas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error generating idea:', error);
      setMintIdeas([]);
    } finally {
      setIsGenerating(false);
    }
  };

  const scrollToGenerator = () => {
    const generatorSection = document.getElementById('ai-generator');
    if (generatorSection) {
      generatorSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const generateAndScroll = async () => {
    await generateIdea();
    scrollToGenerator();
  };

  // Safe array operations with proper checks
  const categories = ['All', ...Array.from(new Set((mintIdeas || []).map(idea => idea.category)))];
  const filteredIdeas = selectedCategory === 'All' 
    ? (mintIdeas || [])
    : (mintIdeas || []).filter(idea => idea.category === selectedCategory);

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Main Content */}
      <section className="px-8 pt-32 pb-16 relative">
        <div>
          {/* Page Title */}
          <div className="mb-12">
            <h2 className="text-6xl md:text-8xl lg:text-9xl font-bold text-white leading-none">
              MINT
            </h2>
            <p className="text-sm md:text-base lg:text-lg mt-2 uppercase tracking-widest text-gray-400">
              TOKEN CREATION PLATFORM
            </p>
          </div>
          {/* Hero Section - Simplified */}
          <div className="mb-16 p-8 bg-gradient-to-r from-green-600/10 to-emerald-600/10 border border-green-400/20 rounded-xl">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-center gap-4 mb-6">
                <Leaf className="w-10 h-10 text-green-400" />
                <h3 className="text-3xl font-bold text-white">
                  Transform Ideas into NFT Companies
                </h3>
              </div>
              
              <p className="text-xl text-gray-300 mb-6 text-center">
                Transform innovative business ideas into <span className="font-bold text-green-400">complete companies as NFTs</span>
              </p>
              
              <p className="text-gray-400 mb-8 text-center max-w-2xl mx-auto">
                Each company comes with tokens as shares, complete infrastructure, and proven business models. 
                Ready to launch in the digital economy.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                <button 
                  onClick={generateAndScroll}
                  disabled={isGenerating}
                  className="px-6 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate New Business Idea
                    </>
                  )}
                </button>
                <button className="px-6 py-3 bg-black/50 text-white font-semibold rounded-lg border border-gray-700 hover:border-gray-500 transition-all">
                  View Portfolio Returns
                </button>
              </div>
              
              {/* Trust Indicators */}
              <div className="flex flex-wrap justify-center gap-8 text-gray-400">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">$2.4M+</div>
                  <div className="text-sm">Total Value Minted</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">150+</div>
                  <div className="text-sm">Companies Launched</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">85%</div>
                  <div className="text-sm">Success Rate</div>
                </div>
              </div>
            </div>
          </div>

          {/* Featured Companies Available to Mint */}
          <div className="mb-16">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-white mb-4">Featured NEW Companies Available to Mint</h3>
              <p className="text-gray-300 mb-2">
                Fresh business concepts with complete models, ready to be minted as NFTs with token shares.
                <span className="text-green-400 font-semibold"> Get 10% of your tokens immediately for just $500.</span>
              </p>
              <p className="text-gray-400 text-sm">
                💡 These are brand NEW companies you can mint and own. For existing companies, visit our <Link href="/market" className="text-blue-400 hover:text-blue-300 underline">marketplace</Link>.
              </p>
            </div>
          
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sampleCompanies.map((company) => (
                <div key={company.id} className="group bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-green-400/50 transition-all">
                  <div className="relative h-40 sm:h-44 md:h-48 overflow-hidden">
                  <Image
                    src={company.image}
                    alt={company.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-green-500 text-white px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-semibold">
                    Ready to Mint
              </div>
                  <div className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-purple-500 text-white px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-semibold">
                    NEW
              </div>
                  <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 bg-black/70 backdrop-blur-sm text-white px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm">
                    {company.category}
            </div>
          </div>
                <div className="p-3 sm:p-4 md:p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start mb-3 gap-2">
                    <h3 className="text-lg sm:text-xl font-bold text-white">{company.name}</h3>
                    <div className="text-right">
                      <div className="text-xs sm:text-sm text-gray-400 mb-1">Full Valuation at Launch</div>
                      <div className="text-base sm:text-lg text-gray-400">{company.price}</div>
                      <div className="text-xl sm:text-2xl font-bold text-green-400">$500</div>
                      <div className="text-xs sm:text-sm text-gray-400">{company.token} (10% now, 88% on delivery)</div>
          </div>
        </div>
                  <p className="text-gray-300 mb-4 text-sm sm:text-base">{company.description}</p>
                  <div className="bg-gradient-to-r from-green-500/10 to-emerald-600/10 border border-green-400/20 rounded-lg p-2 sm:p-3 mb-4">
                    <div className="text-xs sm:text-sm text-green-300 font-semibold mb-1">✨ Ownership Package:</div>
                    <div className="text-xs text-gray-300">
                      • Get 10% of your tokens immediately on payment<br/>
                      • Receive a further 88% of your tokens on delivery (4 weeks)<br/>
                      • Remaining 2% reserved for platform/operations<br/>
                      • 4-week delivery guaranteed
      </div>
          </div>
                  <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-2">
                    <div className="text-xs sm:text-sm text-gray-400">
                      <Clock className="w-4 h-4 inline mr-1" />
                      Delivery: <span className="text-green-400 font-semibold">4 weeks</span>
        </div>
                    <button className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 font-semibold text-sm sm:text-base">
                      Mint for $500
                    </button>
            </div>
                  <div className="pt-4 border-t border-white/10">
                    <div className="flex items-center text-xs sm:text-sm text-gray-400 mb-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                      Complete NEW business infrastructure included
              </div>
                    <div className="flex items-center text-xs sm:text-sm text-gray-400">
                      <Shield className="w-4 h-4 text-blue-400 mr-2" />
                      Option to purchase full company before public launch
                        </div>
                        </div>
                      </div>
                    </div>
            ))}
                  </div>
          <div className="text-center mt-8 sm:mt-12">
            <Link href="/market" className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold text-base sm:text-lg rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
              Browse Existing Companies on Market
              <Rocket className="ml-2 w-5 h-5" />
            </Link>
            </div>
        </div>
          </div>

      {/* Value Propositions */}
      <div className="py-8 sm:py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-white mb-4">
            Why Smart Investors Choose b0ase
          </h2>
          <p className="text-xl text-gray-300 text-center mb-12 max-w-3xl mx-auto">
            With just a 10% down payment, you receive 10% of your tokens now and 88% on delivery—you're not just buying a business, you're investing in a proven system.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {valuePropositions.map((prop, index) => (
              <div key={index} className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center hover:border-green-400/30 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <prop.icon className="w-8 h-8 text-white" />
              </div>
                <div className="text-3xl font-bold text-green-400 mb-2">{prop.stat}</div>
                <h3 className="text-xl font-semibold text-white mb-2">{prop.title}</h3>
                <p className="text-gray-300">{prop.description}</p>
            </div>
            ))}
                  </div>
                </div>
                        </div>

      {/* Highlight Cards */}
      <div className="py-8 sm:py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-white mb-12">
            Complete Business Ownership in Three Simple Steps
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Company NFT */}
            <div className="bg-gradient-to-br from-pink-500/20 to-purple-600/20 backdrop-blur-sm border border-pink-300/20 rounded-2xl p-8 text-center hover:border-pink-400/40 transition-all duration-300">
              <div className="w-20 h-20 bg-gradient-to-br from-pink-400 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-10 h-10 text-white" />
                      </div>
              <h3 className="text-2xl font-bold text-white mb-4">Company NFT</h3>
              <p className="text-gray-300 leading-relaxed">
                Own a complete business as a unique NFT with full intellectual property, business model, and operational framework.
              </p>
                    </div>

            {/* Token Shares */}
            <div className="bg-gradient-to-br from-blue-500/20 to-cyan-600/20 backdrop-blur-sm border border-blue-300/20 rounded-2xl p-8 text-center hover:border-blue-400/40 transition-all duration-300">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Coins className="w-10 h-10 text-white" />
                            </div>
              <h3 className="text-2xl font-bold text-white mb-4">Token Shares</h3>
              <p className="text-gray-300 leading-relaxed">
                Each company includes its own cryptocurrency token representing ownership shares and governance rights.
              </p>
                            </div>

            {/* Launch Ready */}
            <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 backdrop-blur-sm border border-green-300/20 rounded-2xl p-8 text-center hover:border-green-400/40 transition-all duration-300">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Rocket className="w-10 h-10 text-white" />
                          </div>
              <h3 className="text-2xl font-bold text-white mb-4">Launch Ready</h3>
              <p className="text-gray-300 leading-relaxed">
                Complete business infrastructure including websites, marketing materials, and operational guidelines.
              </p>
                        </div>
                      </div>
            </div>
          </div>

      {/* AI Company Generator */}
      <div id="ai-generator" className="py-8 sm:py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-white mb-6">AI Company Generator</h2>
          <p className="text-xl text-gray-300 mb-8">
            Let our AI create unique business concepts tailored to current market opportunities and trends.
          </p>
          
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
            {(mintIdeas || []).length > 0 && (
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-white mb-4">Latest Generated Ideas</h3>
                <div className="grid gap-4">
                  {(mintIdeas || []).slice(0, 3).map((idea, index) => (
                    <div key={index} className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-600/10 border border-green-400/20 rounded-xl text-left">
                      <h4 className="text-lg font-semibold text-white mb-2">{idea.title}</h4>
                      <p className="text-gray-300 mb-2">{idea.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-green-400">{idea.category}</span>
                        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
                          Request Full Business Plan
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                  </div>
            )}
            
            {generatedIdea && (
              <div className="mt-6 p-6 bg-gradient-to-r from-green-500/10 to-emerald-600/10 border border-green-400/20 rounded-xl">
                <h3 className="text-xl font-semibold text-white mb-2">Generated Idea:</h3>
                <p className="text-gray-300 text-lg">{generatedIdea}</p>
                <button className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  Request Full Business Plan
          </button>
              </div>
            )}
          </div>
        </div>
      </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-8 sm:py-16 px-4 sm:px-6 bg-gradient-to-r from-green-600/20 to-emerald-600/20 border-t border-green-400/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Build Your Digital Empire?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Join successful entrepreneurs who have already minted over $2.4M in business value
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-lg rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
              Start Your Portfolio Today
            </button>
            <button className="px-8 py-4 bg-transparent text-white font-semibold text-lg rounded-xl border-2 border-white/30 hover:border-green-400/50 hover:bg-green-400/10 transition-all duration-300">
              Schedule Consultation
            </button>
          </div>
        </div>
      </section>
    </div>
  );
} 