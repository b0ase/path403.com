'use client';

import React, { useState } from 'react';
import { 
  FaReact, FaNodeJs, FaDatabase, FaMobile, FaShoppingCart, FaUser, 
  FaCreditCard, FaSearch, FaChartLine, FaLock, FaRobot, FaBitcoin,
  FaVideo, FaComments, FaBell, FaCalendarAlt, FaEdit, FaUpload
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface Component {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ComponentType<any>;
  price: string;
  features: string[];
  tech: string[];
  complexity: 'Basic' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
}

const components: Component[] = [
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
  }
];

export default function ComponentsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [expandedComponent, setExpandedComponent] = useState<string | null>(null);

  const categories = ['All', ...new Set(components.map(c => c.category))];
  const filteredComponents = selectedCategory === 'All' 
    ? components 
    : components.filter(c => c.category === selectedCategory);

  return (
    <motion.div 
      className="min-h-screen bg-black text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Main Content */}
      <motion.section 
        className="px-8 pt-32 pb-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <div>
          {/* Page Title */}
          <motion.div 
            className="mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <h2 className="text-6xl md:text-8xl lg:text-9xl font-bold text-white leading-none">
              COMPONENTS
            </h2>
            <p className="text-sm md:text-base lg:text-lg mt-2 uppercase tracking-widest text-gray-400">
              Modular Building Blocks
            </p>
          </motion.div>

          {/* Stats Bar */}
          <motion.div 
            className="flex items-baseline gap-8 mb-16"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            <div>
              <span className="text-4xl md:text-5xl font-bold text-white">
                {components.length}
              </span>
              <span className="text-sm ml-2 text-gray-400">
                Components
              </span>
            </div>
            <div>
              <span className="text-4xl md:text-5xl font-bold text-white">
                {categories.length - 1}
              </span>
              <span className="text-sm ml-2 text-gray-400">
                Categories
              </span>
            </div>
          </motion.div>

          {/* Category Filter */}
          <div className="flex gap-2 mb-8 flex-wrap">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 transition-colors ${
                  selectedCategory === category
                    ? 'bg-white text-black'
                    : 'bg-black text-gray-400 border border-gray-800 hover:border-gray-600 hover:text-white'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-800 my-16" />

          {/* Components List */}
          <div>
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-sm font-medium text-gray-400">
                Available Components
              </h3>
              <span className="text-sm text-gray-400">
                {filteredComponents.length} Total
              </span>
            </div>

            {/* Component Rows */}
            <div className="space-y-2">
              {filteredComponents.map((component, index) => (
                <motion.div 
                  key={component.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 + index * 0.05 }}
                  className="group border-b border-gray-800 hover:border-gray-600 transition-all duration-300"
                >
                  <div 
                    className="py-6 cursor-pointer"
                    onClick={() => setExpandedComponent(
                      expandedComponent === component.id ? null : component.id
                    )}
                  >
                    {/* Component Row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <component.icon className="text-2xl text-gray-400 group-hover:text-white transition-colors" />
                        <div>
                          <h3 className="text-xl font-medium text-white group-hover:text-white transition-colors">
                            {component.name}
                          </h3>
                          <p className="text-sm text-gray-400 mt-1">
                            {component.description}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-8">
                        <div className="text-right">
                          <div className="text-lg text-white">
                            {component.price}
                          </div>
                          <div className="text-xs text-gray-400">
                            {component.estimatedTime}
                          </div>
                        </div>
                        <span className={`px-3 py-1 text-xs ${
                          component.complexity === 'Basic' ? 'bg-green-900/20 text-green-400' :
                          component.complexity === 'Intermediate' ? 'bg-yellow-900/20 text-yellow-400' :
                          'bg-red-900/20 text-red-400'
                        }`}>
                          {component.complexity}
                        </span>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedComponent === component.id && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ duration: 0.3 }}
                        className="mt-6 grid md:grid-cols-2 gap-6"
                      >
                        <div>
                          <h4 className="text-sm font-medium text-gray-400 mb-3">Features</h4>
                          <ul className="space-y-1">
                            {component.features.map(feature => (
                              <li key={feature} className="text-sm text-gray-300">
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-400 mb-3">Technologies</h4>
                          <div className="flex flex-wrap gap-2">
                            {component.tech.map(t => (
                              <span key={t} className="px-2 py-1 bg-gray-900 text-gray-400 text-xs">
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-20 border-t border-gray-800 pt-12">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-4">
                Need a Custom Component?
              </h3>
              <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
                All components are built with AI assistance for rapid delivery and tested for production use
              </p>
              <Link 
                href="/contact"
                className="inline-block px-8 py-3 bg-white text-black font-medium hover:bg-gray-200 transition-colors"
              >
                Request Component
              </Link>
            </div>
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}