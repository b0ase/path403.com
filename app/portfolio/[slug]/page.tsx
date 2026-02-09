'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound, useSearchParams } from 'next/navigation';
import { portfolioData } from '@/lib/data';
import { FaExternalLinkAlt, FaGithub, FaArrowLeft, FaInfoCircle, FaLock, FaWallet, FaCoins, FaDollarSign, FaRocket, FaUsers, FaChartLine, FaCog, FaShieldAlt, FaIndustry, FaNetworkWired, FaDatabase, FaCode, FaChartBar, FaGlobe, FaTools, FaTwitter } from 'react-icons/fa';
import ProjectTabs from '@/components/ProjectTabs';
import BWriterPurchaseModal from '@/components/BWriterPurchaseModal';
import BitcoinWriterFloat from '@/components/blog/BitcoinWriterFloat';

interface PortfolioPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Theme configuration helper
const getThemeClasses = (themeConfig?: { primary: string; secondary: string }) => {
  if (!themeConfig) {
    return {
      background: 'bg-black',
      gradientBg: '',
      primaryText: 'text-blue-400',
      primaryTextHover: 'hover:text-blue-300',
      primaryBg: 'bg-blue-600',
      primaryBgHover: 'hover:bg-blue-700',
      secondaryText: 'text-purple-400',
      borderColor: 'border-white/20',
      cardBg: 'bg-gray-800',
    };
  }

  const colorMap: Record<string, {
    text: string;
    textHover: string;
    bg: string;
    bgHover: string;
    border: string;
    gradientFrom: string;
    gradientTo: string;
  }> = {
    pink: { text: 'text-pink-400', textHover: 'hover:text-pink-300', bg: 'bg-pink-600', bgHover: 'hover:bg-pink-700', border: 'border-pink-500/30', gradientFrom: 'from-pink-900', gradientTo: 'to-pink-900' },
    purple: { text: 'text-purple-400', textHover: 'hover:text-purple-300', bg: 'bg-purple-600', bgHover: 'hover:bg-purple-700', border: 'border-purple-500/30', gradientFrom: 'from-purple-900', gradientTo: 'to-purple-900' },
    blue: { text: 'text-blue-400', textHover: 'hover:text-blue-300', bg: 'bg-blue-600', bgHover: 'hover:bg-blue-700', border: 'border-blue-500/30', gradientFrom: 'from-blue-900', gradientTo: 'to-blue-900' },
    cyan: { text: 'text-cyan-400', textHover: 'hover:text-cyan-300', bg: 'bg-cyan-600', bgHover: 'hover:bg-cyan-700', border: 'border-cyan-500/30', gradientFrom: 'from-cyan-900', gradientTo: 'to-cyan-900' },
    green: { text: 'text-green-400', textHover: 'hover:text-green-300', bg: 'bg-green-600', bgHover: 'hover:bg-green-700', border: 'border-green-500/30', gradientFrom: 'from-green-900', gradientTo: 'to-green-900' },
    amber: { text: 'text-amber-400', textHover: 'hover:text-amber-300', bg: 'bg-amber-600', bgHover: 'hover:bg-amber-700', border: 'border-amber-500/30', gradientFrom: 'from-amber-900', gradientTo: 'to-amber-900' },
    orange: { text: 'text-orange-400', textHover: 'hover:text-orange-300', bg: 'bg-orange-600', bgHover: 'hover:bg-orange-700', border: 'border-orange-500/30', gradientFrom: 'from-orange-900', gradientTo: 'to-orange-900' },
    yellow: { text: 'text-yellow-400', textHover: 'hover:text-yellow-300', bg: 'bg-yellow-600', bgHover: 'hover:bg-yellow-700', border: 'border-yellow-500/30', gradientFrom: 'from-yellow-900', gradientTo: 'to-yellow-900' },
    red: { text: 'text-red-400', textHover: 'hover:text-red-300', bg: 'bg-red-600', bgHover: 'hover:bg-red-700', border: 'border-red-500/30', gradientFrom: 'from-red-900', gradientTo: 'to-red-900' },
    teal: { text: 'text-teal-400', textHover: 'hover:text-teal-300', bg: 'bg-teal-600', bgHover: 'hover:bg-teal-700', border: 'border-teal-500/30', gradientFrom: 'from-teal-900', gradientTo: 'to-teal-900' },
  };

  const primary = colorMap[themeConfig.primary] || colorMap.blue;
  const secondary = colorMap[themeConfig.secondary] || colorMap.purple;

  return {
    background: `bg-gradient-to-br ${primary.gradientFrom} via-black ${secondary.gradientTo}`,
    gradientBg: `bg-gradient-to-br ${primary.gradientFrom} via-black ${secondary.gradientTo}`,
    primaryText: primary.text,
    primaryTextHover: primary.textHover,
    primaryBg: primary.bg,
    primaryBgHover: primary.bgHover,
    secondaryText: secondary.text,
    borderColor: primary.border,
    cardBg: `bg-gradient-to-br ${primary.gradientFrom}/50 ${secondary.gradientTo}/50`,
  };
};

// AI Girlfriends Tabs Component
function AIGirlfriendsTabs({ project }: { project: any }) {
  const [activeTab, setActiveTab] = React.useState('overview');

  const tabs = [
    { id: 'overview', name: 'Overview', icon: FaInfoCircle },
    { id: 'features', name: 'Features', icon: FaCog },
    { id: 'revenue', name: 'Revenue', icon: FaDollarSign },
    { id: 'tech', name: 'Tech Stack', icon: FaCode },
    { id: 'market', name: 'Market', icon: FaGlobe },
    { id: 'investment', name: 'Investment', icon: FaChartLine },
  ];

  return (
    <div className="w-full">
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-8 justify-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${activeTab === tab.id
                ? 'bg-pink-600 text-white shadow-lg'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
            >
              <Icon size={16} />
              {tab.name}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-8 border border-pink-500/30">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                AI Girlfriends Platform
              </h2>
              <p className="text-xl text-gray-300 max-w-4xl mx-auto">
                A revolutionary AI-powered social platform where users can create, customize, and interact with AI companions,
                building meaningful relationships in a safe, controlled environment.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-gradient-to-br from-pink-900/50 to-purple-900/50 rounded-2xl p-6 border border-pink-500/30">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl flex items-center justify-center mb-4">
                  <FaUsers size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">AI Companions</h3>
                <p className="text-gray-300 text-sm">
                  Create and customize AI girlfriends with unique personalities, interests, and conversation styles.
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-2xl p-6 border border-purple-500/30">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4">
                  <FaShieldAlt size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">Safe Environment</h3>
                <p className="text-gray-300 text-sm">
                  Controlled, monitored interactions with content filtering and user protection measures.
                </p>
              </div>

              <div className="bg-gradient-to-br from-pink-900/50 to-purple-900/50 rounded-2xl p-6 border border-pink-500/30">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl flex items-center justify-center mb-4">
                  <FaRocket size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">Monetization</h3>
                <p className="text-gray-300 text-sm">
                  Multiple revenue streams including subscriptions, premium features, and content creation.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'features' && (
          <div className="space-y-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                Platform Features
              </h2>
              <p className="text-xl text-gray-300 max-w-4xl mx-auto">
                Comprehensive suite of features designed to create engaging, personalized AI companion experiences.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-pink-400 mb-4">Core Features</h3>
                <div className="space-y-4">
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                    <h4 className="font-bold text-purple-400 mb-2">AI Personality Creation</h4>
                    <p className="text-gray-300 text-sm">
                      Advanced AI models that generate unique personalities, interests, and conversation patterns.
                    </p>
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                    <h4 className="font-bold text-purple-400 mb-2">Real-time Chat</h4>
                    <p className="text-gray-300 text-sm">
                      Instant messaging with AI companions featuring natural language processing and context awareness.
                    </p>
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                    <h4 className="font-bold text-purple-400 mb-2">Customization Tools</h4>
                    <p className="text-gray-300 text-sm">
                      Visual customization, personality tweaking, and relationship progression tracking.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-pink-400 mb-4">Premium Features</h3>
                <div className="space-y-4">
                  <div className="bg-pink-900/30 rounded-xl p-4 border border-pink-700">
                    <h4 className="font-bold text-pink-300 mb-2">Voice Interactions</h4>
                    <p className="text-gray-300 text-sm">
                      Text-to-speech and speech-to-text capabilities for more immersive conversations.
                    </p>
                  </div>
                  <div className="bg-pink-900/30 rounded-xl p-4 border border-pink-700">
                    <h4 className="font-bold text-pink-300 mb-2">Photo Sharing</h4>
                    <p className="text-gray-300 text-sm">
                      AI-generated photos and visual content sharing between users and companions.
                    </p>
                  </div>
                  <div className="bg-pink-900/30 rounded-xl p-4 border border-pink-700">
                    <h4 className="font-bold text-pink-300 mb-2">Relationship Analytics</h4>
                    <p className="text-gray-300 text-sm">
                      Detailed insights into conversation patterns, relationship growth, and interaction history.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'revenue' && (
          <div className="space-y-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                Revenue Model
              </h2>
              <p className="text-xl text-gray-300 max-w-4xl mx-auto">
                Multiple monetization strategies designed to maximize user engagement and platform profitability.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-pink-900/50 to-purple-900/50 rounded-2xl p-6 border border-pink-500/30">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl flex items-center justify-center mb-4">
                  <FaDollarSign size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">Subscription Tiers</h3>
                <p className="text-gray-300 text-sm mb-4">
                  Monthly and annual subscription plans with varying feature access levels.
                </p>
                <ul className="text-gray-400 text-xs space-y-1">
                  <li>• Basic: $9.99/month</li>
                  <li>• Premium: $19.99/month</li>
                  <li>• Ultimate: $39.99/month</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-2xl p-6 border border-purple-500/30">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4">
                  <FaCoins size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">Premium Features</h3>
                <p className="text-gray-300 text-sm mb-4">
                  One-time purchases and microtransactions for special features and content.
                </p>
                <ul className="text-gray-400 text-xs space-y-1">
                  <li>• Custom AI personalities</li>
                  <li>• Voice interactions</li>
                  <li>• Photo generation</li>
                  <li>• Advanced analytics</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-pink-900/50 to-purple-900/50 rounded-2xl p-6 border border-pink-500/30">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl flex items-center justify-center mb-4">
                  <FaChartBar size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">Content Creation</h3>
                <p className="text-gray-300 text-sm mb-4">
                  Revenue sharing with content creators and AI personality developers.
                </p>
                <ul className="text-gray-400 text-xs space-y-1">
                  <li>• Creator marketplace</li>
                  <li>• Commission sharing</li>
                  <li>• Premium content sales</li>
                  <li>• Partnership programs</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tech' && (
          <div className="space-y-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                Technology Stack
              </h2>
              <p className="text-xl text-gray-300 max-w-4xl mx-auto">
                Cutting-edge AI and web technologies powering the next generation of social AI interactions.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-pink-900/50 to-purple-900/50 rounded-2xl p-6 border border-pink-500/30">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl flex items-center justify-center mb-4">
                  <FaCode size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">AI & ML</h3>
                <p className="text-gray-300 text-sm mb-4">
                  Advanced language models and machine learning for natural conversations.
                </p>
                <ul className="text-gray-400 text-xs space-y-1">
                  <li>• GPT-4/Claude integration</li>
                  <li>• Custom fine-tuned models</li>
                  <li>• Personality generation</li>
                  <li>• Context awareness</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-2xl p-6 border border-purple-500/30">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4">
                  <FaDatabase size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">Backend</h3>
                <p className="text-gray-300 text-sm mb-4">
                  Scalable infrastructure for handling millions of conversations.
                </p>
                <ul className="text-gray-400 text-xs space-y-1">
                  <li>• Node.js/Express</li>
                  <li>• PostgreSQL</li>
                  <li>• Redis caching</li>
                  <li>• WebSocket real-time</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-pink-900/50 to-purple-900/50 rounded-2xl p-6 border border-pink-500/30">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl flex items-center justify-center mb-4">
                  <FaGlobe size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">Frontend</h3>
                <p className="text-gray-300 text-sm mb-4">
                  Modern, responsive web application with mobile optimization.
                </p>
                <ul className="text-gray-400 text-xs space-y-1">
                  <li>• React/Next.js</li>
                  <li>• TypeScript</li>
                  <li>• Tailwind CSS</li>
                  <li>• PWA capabilities</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'market' && (
          <div className="space-y-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                Market Analysis
              </h2>
              <p className="text-xl text-gray-300 max-w-4xl mx-auto">
                Targeting the rapidly growing AI companionship market with unique positioning and competitive advantages.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-pink-400 mb-4">Market Opportunity</h3>
                <div className="space-y-4">
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                    <h4 className="font-bold text-purple-400 mb-2">Growing AI Market</h4>
                    <p className="text-gray-300 text-sm">
                      Global AI market expected to reach $1.8 trillion by 2030, with social AI growing rapidly.
                    </p>
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                    <h4 className="font-bold text-purple-400 mb-2">Loneliness Epidemic</h4>
                    <p className="text-gray-300 text-sm">
                      60% of adults report feeling lonely, creating demand for AI companionship solutions.
                    </p>
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                    <h4 className="font-bold text-purple-400 mb-2">Digital Relationships</h4>
                    <p className="text-gray-300 text-sm">
                      Increasing acceptance of digital relationships and AI companions in modern society.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-pink-400 mb-4">Competitive Advantages</h3>
                <div className="space-y-4">
                  <div className="bg-pink-900/30 rounded-xl p-4 border border-pink-700">
                    <h4 className="font-bold text-pink-300 mb-2">Advanced AI</h4>
                    <p className="text-gray-300 text-sm">
                      State-of-the-art language models with custom personality generation capabilities.
                    </p>
                  </div>
                  <div className="bg-pink-900/30 rounded-xl p-4 border border-pink-700">
                    <h4 className="font-bold text-pink-300 mb-2">Safety Focus</h4>
                    <p className="text-gray-300 text-sm">
                      Comprehensive content filtering and user protection measures.
                    </p>
                  </div>
                  <div className="bg-pink-900/30 rounded-xl p-4 border border-pink-700">
                    <h4 className="font-bold text-pink-300 mb-2">Monetization</h4>
                    <p className="text-gray-300 text-sm">
                      Multiple revenue streams with creator economy integration.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'investment' && (
          <div className="space-y-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                Investment Opportunity
              </h2>
              <p className="text-xl text-gray-300 max-w-4xl mx-auto">
                High-growth potential in the AI companionship market with proven technology and strong market positioning.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-pink-900/50 to-purple-900/50 rounded-2xl p-6 border border-pink-500/30">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl flex items-center justify-center mb-4">
                  <FaChartLine size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">Growth Projections</h3>
                <p className="text-gray-300 text-sm mb-4">
                  Conservative estimates show 300% annual growth potential.
                </p>
                <ul className="text-gray-400 text-xs space-y-1">
                  <li>• Year 1: 10K users</li>
                  <li>• Year 2: 100K users</li>
                  <li>• Year 3: 500K users</li>
                  <li>• Year 5: 2M+ users</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-2xl p-6 border border-purple-500/30">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4">
                  <FaDollarSign size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">Revenue Potential</h3>
                <p className="text-gray-300 text-sm mb-4">
                  Multiple revenue streams with high ARPU potential.
                </p>
                <ul className="text-gray-400 text-xs space-y-1">
                  <li>• $15-40 ARPU</li>
                  <li>• 70% gross margins</li>
                  <li>• Recurring revenue</li>
                  <li>• Scalable model</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-pink-900/50 to-purple-900/50 rounded-2xl p-6 border border-pink-500/30">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl flex items-center justify-center mb-4">
                  <FaRocket size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">Exit Strategy</h3>
                <p className="text-gray-300 text-sm mb-4">
                  Multiple exit options with strong acquisition potential.
                </p>
                <ul className="text-gray-400 text-xs space-y-1">
                  <li>• Strategic acquisition</li>
                  <li>• IPO potential</li>
                  <li>• Private equity</li>
                  <li>• Management buyout</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Robust Engineering Tabs Component
function RobustEngineeringTabs({ project }: { project: any }) {
  const [activeTab, setActiveTab] = React.useState('overview');

  const tabs = [
    { id: 'overview', name: 'Overview', icon: FaInfoCircle },
    { id: 'business-model', name: 'Business Model', icon: FaChartBar },
    { id: 'services', name: 'Services', icon: FaCog },
    { id: 'technology', name: 'Technology', icon: FaCode },
    { id: 'market', name: 'Market Analysis', icon: FaGlobe },
    { id: 'financials', name: 'Financials', icon: FaDollarSign },
  ];

  return (
    <div className="w-full">
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-8 justify-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
            >
              <Icon size={16} />
              {tab.name}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-8 border border-blue-500/30">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Company Overview
              </h2>
              <p className="text-xl text-gray-300 max-w-4xl mx-auto">
                Robust Engineering delivers complete hardware/software solutions for industrial automation with blockchain-secured SCADA systems,
                providing auditable, immutable records for critical infrastructure operations.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 rounded-2xl p-6 border border-blue-500/30">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4">
                  <FaIndustry size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">Industrial Focus</h3>
                <p className="text-gray-300 text-sm">
                  Specialized in industrial automation, embedded systems, and critical infrastructure security solutions.
                </p>
              </div>

              <div className="bg-gradient-to-br from-gray-900/50 to-blue-900/50 rounded-2xl p-6 border border-gray-500/30">
                <div className="w-12 h-12 bg-gradient-to-r from-gray-500 to-blue-500 rounded-xl flex items-center justify-center mb-4">
                  <FaShieldAlt size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">Blockchain Security</h3>
                <p className="text-gray-300 text-sm">
                  SCADA systems with blockchain integration for immutable audit trails and enhanced security.
                </p>
              </div>

              <div className="bg-gradient-to-br from-cyan-900/50 to-blue-900/50 rounded-2xl p-6 border border-cyan-500/30">
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center mb-4">
                  <FaTools size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">Complete Solutions</h3>
                <p className="text-gray-300 text-sm">
                  End-to-end hardware and software development for industrial automation projects.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'business-model' && (
          <div className="space-y-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Business Model & Strategy
              </h2>
              <p className="text-xl text-gray-300 max-w-4xl mx-auto">
                Complete hardware/software solutions for clients building SCADA on the blockchain and other software that needs security on the chain,
                auditable, and software pipeline solutions.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-blue-400 mb-4">Core Value Proposition</h3>
                <div className="space-y-4">
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                    <h4 className="font-bold text-cyan-400 mb-2">Blockchain-Secured SCADA</h4>
                    <p className="text-gray-300 text-sm">
                      Industrial control systems with immutable audit trails, ensuring data integrity and compliance for critical infrastructure.
                    </p>
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                    <h4 className="font-bold text-cyan-400 mb-2">Complete Hardware/Software Solutions</h4>
                    <p className="text-gray-300 text-sm">
                      End-to-end development from custom sensors and controllers to full SCADA system integration.
                    </p>
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                    <h4 className="font-bold text-cyan-400 mb-2">Auditable Software Pipeline</h4>
                    <p className="text-gray-300 text-sm">
                      Secure development processes with blockchain-verified code integrity and deployment tracking.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-blue-400 mb-4">Revenue Streams</h3>
                <div className="space-y-4">
                  <div className="bg-blue-900/30 rounded-xl p-4 border border-blue-700">
                    <h4 className="font-bold text-blue-300 mb-2">Project-Based Services</h4>
                    <p className="text-gray-300 text-sm">
                      Custom SCADA system development, industrial automation solutions, and embedded systems engineering.
                    </p>
                  </div>
                  <div className="bg-blue-900/30 rounded-xl p-4 border border-blue-700">
                    <h4 className="font-bold text-blue-300 mb-2">Consulting & Support</h4>
                    <p className="text-gray-300 text-sm">
                      Professional electrical engineering consultancy, system integration, and ongoing maintenance.
                    </p>
                  </div>
                  <div className="bg-blue-900/30 rounded-xl p-4 border border-blue-700">
                    <h4 className="font-bold text-blue-300 mb-2">Blockchain Integration Services</h4>
                    <p className="text-gray-300 text-sm">
                      Specialized services for adding blockchain security to existing industrial systems.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'services' && (
          <div className="space-y-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Services Portfolio
              </h2>
              <p className="text-xl text-gray-300 max-w-4xl mx-auto">
                Comprehensive range of industrial automation and embedded systems services with blockchain security integration.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 rounded-2xl p-6 border border-blue-500/30">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4">
                  <FaNetworkWired size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">SCADA Development</h3>
                <p className="text-gray-300 text-sm mb-4">
                  Custom Supervisory Control and Data Acquisition systems with blockchain integration for immutable audit trails.
                </p>
                <ul className="text-gray-400 text-xs space-y-1">
                  <li>• Real-time monitoring & control</li>
                  <li>• Blockchain-secured data logging</li>
                  <li>• Custom HMI development</li>
                  <li>• Alarm & notification systems</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-gray-900/50 to-blue-900/50 rounded-2xl p-6 border border-gray-500/30">
                <div className="w-12 h-12 bg-gradient-to-r from-gray-500 to-blue-500 rounded-xl flex items-center justify-center mb-4">
                  <FaIndustry size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">Industrial Automation</h3>
                <p className="text-gray-300 text-sm mb-4">
                  Complete automation solutions for manufacturing, process control, and industrial applications.
                </p>
                <ul className="text-gray-400 text-xs space-y-1">
                  <li>• PLC programming & integration</li>
                  <li>• HMI/SCADA system design</li>
                  <li>• Process optimization</li>
                  <li>• Safety system implementation</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-cyan-900/50 to-blue-900/50 rounded-2xl p-6 border border-cyan-500/30">
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center mb-4">
                  <FaCode size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">Embedded Systems</h3>
                <p className="text-gray-300 text-sm mb-4">
                  Custom embedded hardware and software solutions for harsh industrial environments.
                </p>
                <ul className="text-gray-400 text-xs space-y-1">
                  <li>• Custom sensor development</li>
                  <li>• Industrial controller design</li>
                  <li>• Real-time operating systems</li>
                  <li>• Hardware-software integration</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-blue-900/50 to-gray-900/50 rounded-2xl p-6 border border-blue-500/30">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-gray-500 rounded-xl flex items-center justify-center mb-4">
                  <FaShieldAlt size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">Blockchain Integration</h3>
                <p className="text-gray-300 text-sm mb-4">
                  Secure blockchain integration for industrial systems requiring audit trails and data integrity.
                </p>
                <ul className="text-gray-400 text-xs space-y-1">
                  <li>• Smart contract development</li>
                  <li>• Data immutability solutions</li>
                  <li>• Audit trail implementation</li>
                  <li>• Security protocol design</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-gray-900/50 to-cyan-900/50 rounded-2xl p-6 border border-gray-500/30">
                <div className="w-12 h-12 bg-gradient-to-r from-gray-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4">
                  <FaDatabase size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">Data Management</h3>
                <p className="text-gray-300 text-sm mb-4">
                  Industrial data collection, storage, and analysis with blockchain verification.
                </p>
                <ul className="text-gray-400 text-xs space-y-1">
                  <li>• Real-time data acquisition</li>
                  <li>• Historical data analysis</li>
                  <li>• Predictive maintenance</li>
                  <li>• Compliance reporting</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-cyan-900/50 to-gray-900/50 rounded-2xl p-6 border border-cyan-500/30">
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-gray-500 rounded-xl flex items-center justify-center mb-4">
                  <FaTools size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">Consulting Services</h3>
                <p className="text-gray-300 text-sm mb-4">
                  Professional electrical engineering consultancy and system integration expertise.
                </p>
                <ul className="text-gray-400 text-xs space-y-1">
                  <li>• System architecture design</li>
                  <li>• Technology selection</li>
                  <li>• Implementation planning</li>
                  <li>• Ongoing support</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'technology' && (
          <div className="space-y-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Technology Stack & Architecture
              </h2>
              <p className="text-xl text-gray-300 max-w-4xl mx-auto">
                Advanced technology stack combining industrial automation, embedded systems, and blockchain security.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-blue-400 mb-4">Industrial Technologies</h3>
                <div className="space-y-4">
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                    <h4 className="font-bold text-cyan-400 mb-2">SCADA Systems</h4>
                    <p className="text-gray-300 text-sm">
                      Wonderware, Ignition, WinCC, and custom SCADA solutions with real-time data acquisition and control.
                    </p>
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                    <h4 className="font-bold text-cyan-400 mb-2">PLC Programming</h4>
                    <p className="text-gray-300 text-sm">
                      Siemens, Allen-Bradley, Schneider Electric, and other major PLC platforms with custom programming.
                    </p>
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                    <h4 className="font-bold text-cyan-400 mb-2">Industrial Protocols</h4>
                    <p className="text-gray-300 text-sm">
                      Modbus, OPC UA, Profinet, EtherNet/IP, and other industrial communication protocols.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-blue-400 mb-4">Blockchain & Security</h3>
                <div className="space-y-4">
                  <div className="bg-blue-900/30 rounded-xl p-4 border border-blue-700">
                    <h4 className="font-bold text-blue-300 mb-2">Blockchain Integration</h4>
                    <p className="text-gray-300 text-sm">
                      Ethereum, Hyperledger, and custom blockchain solutions for industrial data integrity and audit trails.
                    </p>
                  </div>
                  <div className="bg-blue-900/30 rounded-xl p-4 border border-blue-700">
                    <h4 className="font-bold text-blue-300 mb-2">Smart Contracts</h4>
                    <p className="text-gray-300 text-sm">
                      Automated compliance checking, data validation, and secure transaction processing for industrial systems.
                    </p>
                  </div>
                  <div className="bg-blue-900/30 rounded-xl p-4 border border-blue-700">
                    <h4 className="font-bold text-blue-300 mb-2">Cybersecurity</h4>
                    <p className="text-gray-300 text-sm">
                      Industrial cybersecurity solutions including network segmentation, access control, and threat detection.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 rounded-2xl p-8 border border-blue-500/30">
              <h3 className="text-2xl font-bold text-blue-400 mb-6 text-center">Development Technologies</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <h4 className="font-bold text-cyan-400 mb-3">Frontend</h4>
                  <div className="space-y-2 text-sm text-gray-300">
                    <div>React.js</div>
                    <div>Next.js</div>
                    <div>TypeScript</div>
                    <div>Tailwind CSS</div>
                  </div>
                </div>
                <div className="text-center">
                  <h4 className="font-bold text-cyan-400 mb-3">Backend</h4>
                  <div className="space-y-2 text-sm text-gray-300">
                    <div>Node.js</div>
                    <div>Python</div>
                    <div>C/C++</div>
                    <div>SQL/NoSQL</div>
                  </div>
                </div>
                <div className="text-center">
                  <h4 className="font-bold text-cyan-400 mb-3">Embedded</h4>
                  <div className="space-y-2 text-sm text-gray-300">
                    <div>Arduino</div>
                    <div>Raspberry Pi</div>
                    <div>ESP32</div>
                    <div>Custom PCBs</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'market' && (
          <div className="space-y-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Market Analysis & Opportunities
              </h2>
              <p className="text-xl text-gray-300 max-w-4xl mx-auto">
                Growing market for industrial automation with increasing demand for blockchain-secured solutions.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-blue-400 mb-4">Target Markets</h3>
                <div className="space-y-4">
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                    <h4 className="font-bold text-cyan-400 mb-2">Manufacturing</h4>
                    <p className="text-gray-300 text-sm">
                      Automotive, aerospace, electronics, and general manufacturing requiring secure automation systems.
                    </p>
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                    <h4 className="font-bold text-cyan-400 mb-2">Energy & Utilities</h4>
                    <p className="text-gray-300 text-sm">
                      Power plants, oil & gas, renewable energy, and utility companies needing auditable control systems.
                    </p>
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                    <h4 className="font-bold text-cyan-400 mb-2">Infrastructure</h4>
                    <p className="text-gray-300 text-sm">
                      Transportation, water treatment, and critical infrastructure requiring secure monitoring and control.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-blue-400 mb-4">Market Drivers</h3>
                <div className="space-y-4">
                  <div className="bg-blue-900/30 rounded-xl p-4 border border-blue-700">
                    <h4 className="font-bold text-blue-300 mb-2">Industry 4.0</h4>
                    <p className="text-gray-300 text-sm">
                      Increasing adoption of smart manufacturing and IoT technologies driving demand for advanced automation.
                    </p>
                  </div>
                  <div className="bg-blue-900/30 rounded-xl p-4 border border-blue-700">
                    <h4 className="font-bold text-blue-300 mb-2">Cybersecurity</h4>
                    <p className="text-gray-300 text-sm">
                      Growing concerns about industrial cybersecurity creating demand for blockchain-secured solutions.
                    </p>
                  </div>
                  <div className="bg-blue-900/30 rounded-xl p-4 border border-blue-700">
                    <h4 className="font-bold text-blue-300 mb-2">Compliance</h4>
                    <p className="text-gray-300 text-sm">
                      Regulatory requirements for audit trails and data integrity in critical infrastructure operations.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 rounded-2xl p-8 border border-blue-500/30">
              <h3 className="text-2xl font-bold text-blue-400 mb-6 text-center">Competitive Advantages</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <FaShieldAlt size={12} />
                    </div>
                    <div>
                      <h4 className="font-bold text-cyan-400">Blockchain Integration</h4>
                      <p className="text-gray-300 text-sm">Unique expertise in combining industrial automation with blockchain security.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <FaTools size={12} />
                    </div>
                    <div>
                      <h4 className="font-bold text-cyan-400">Complete Solutions</h4>
                      <p className="text-gray-300 text-sm">End-to-end hardware and software development capabilities.</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <FaIndustry size={12} />
                    </div>
                    <div>
                      <h4 className="font-bold text-cyan-400">Industry Expertise</h4>
                      <p className="text-gray-300 text-sm">Deep understanding of industrial processes and requirements.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <FaCode size={12} />
                    </div>
                    <div>
                      <h4 className="font-bold text-cyan-400">Technical Innovation</h4>
                      <p className="text-gray-300 text-sm">Cutting-edge technology stack and development methodologies.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'financials' && (
          <div className="space-y-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Financial Projections & Strategy
              </h2>
              <p className="text-xl text-gray-300 max-w-4xl mx-auto">
                Sustainable revenue model with multiple income streams and strong growth potential in the industrial automation market.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-blue-400 mb-4">Revenue Model</h3>
                <div className="space-y-4">
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                    <h4 className="font-bold text-cyan-400 mb-2">Project-Based Revenue (60%)</h4>
                    <p className="text-gray-300 text-sm">
                      Custom SCADA system development and industrial automation projects ranging from $50K to $500K per project.
                    </p>
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                    <h4 className="font-bold text-cyan-400 mb-2">Consulting Services (25%)</h4>
                    <p className="text-gray-300 text-sm">
                      Professional engineering consultancy, system integration, and ongoing technical support services.
                    </p>
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                    <h4 className="font-bold text-cyan-400 mb-2">Blockchain Integration (15%)</h4>
                    <p className="text-gray-300 text-sm">
                      Specialized blockchain security services and smart contract development for industrial applications.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-blue-400 mb-4">Growth Strategy</h3>
                <div className="space-y-4">
                  <div className="bg-blue-900/30 rounded-xl p-4 border border-blue-700">
                    <h4 className="font-bold text-blue-300 mb-2">Market Expansion</h4>
                    <p className="text-gray-300 text-sm">
                      Expand into new industrial sectors and geographic markets with high automation adoption rates.
                    </p>
                  </div>
                  <div className="bg-blue-900/30 rounded-xl p-4 border border-blue-700">
                    <h4 className="font-bold text-blue-300 mb-2">Product Development</h4>
                    <p className="text-gray-300 text-sm">
                      Develop standardized blockchain-secured SCADA components and software libraries for faster deployment.
                    </p>
                  </div>
                  <div className="bg-blue-900/30 rounded-xl p-4 border border-blue-700">
                    <h4 className="font-bold text-blue-300 mb-2">Partnerships</h4>
                    <p className="text-gray-300 text-sm">
                      Strategic partnerships with industrial equipment manufacturers and blockchain technology providers.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 rounded-2xl p-8 border border-blue-500/30">
              <h3 className="text-2xl font-bold text-blue-400 mb-6 text-center">Investment Opportunity</h3>
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-cyan-400 mb-2">$10,000</div>
                  <div className="text-sm text-gray-400">Investment Amount</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-400 mb-2">10%</div>
                  <div className="text-sm text-gray-400">Equity Offered</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-400 mb-2">$ROBUST</div>
                  <div className="text-sm text-gray-400">Token Symbol</div>
                </div>
              </div>
              <div className="mt-6 text-center">
                <p className="text-gray-300 mb-4">
                  Join us in revolutionizing industrial automation with blockchain-secured solutions.
                  Invest in the future of secure, auditable industrial control systems.
                </p>
                <Link
                  href={`/market#project-${project.slug}`}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all transform hover:scale-105 shadow-lg"
                >
                  <FaDollarSign size={16} />
                  Invest Now
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PortfolioPage({ params }: PortfolioPageProps) {
  const { slug } = React.use(params);
  const searchParams = useSearchParams();
  const investAmount = searchParams.get('invest');
  const [showPurchaseModal, setShowPurchaseModal] = React.useState(!!investAmount);

  const project = portfolioData.projects.find(p => p.slug === slug);

  if (!project) {
    notFound();
  }


  // Project video mapping - add more projects here as needed
  const projectVideos: { [key: string]: { video: string; poster: string } } = {
    'minecraftparty-website': {
      video: '/images/clientprojects/minecraftparty-website/MINECRAFTPARTY.mp4',
      poster: '/images/slugs/minecraftparty-website.jpg'
    },
    'oneshotcomics': {
      video: '/images/clientprojects/one-shot-comics/oneshotcomics.mp4',
      poster: '/images/slugs/oneshotcomics.png'
    },
    'aivj-website': {
      video: '/images/clientprojects/aivj/AIVJ-video.mp4',
      poster: '/images/slugs/aivj-website.png'
    }
    // Add more projects here like:
    // 'another-project-slug': {
    //   video: '/images/clientprojects/another-project/video.mp4',
    //   poster: '/images/clientprojects/another-project/poster.jpg'
    // }
  };

  // Special handling for Robust Engineering project
  if (project.slug === 'robust-ae-com') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-blue-900 text-white overflow-hidden relative" data-theme="dark">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>

        <div className="container mx-auto px-6 py-12 relative z-10">
          <Link
            href="/#projects"
            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-8 transition-colors"
          >
            <FaArrowLeft size={16} />
            Back to Projects
          </Link>

          {/* Hero Section */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-gray-500 flex items-center justify-center">
                  <FaInfoCircle size={32} />
                </div>
                <div>
                  <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-blue-400 via-gray-400 to-blue-400 bg-clip-text text-transparent">
                    Robust Engineering
                  </h1>
                  <p className="text-xl text-blue-300 font-semibold">Industrial Automation & Blockchain Security</p>
                </div>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
                Complete <span className="text-transparent bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text">Hardware/Software Solutions</span> for SCADA on Blockchain
              </h2>

              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Industrial automation and embedded systems development with blockchain-secured SCADA systems,
                providing auditable, immutable records for critical infrastructure operations.
              </p>

              <div className="flex flex-wrap gap-4 mb-8">
                <a
                  href="https://robust-ae.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
                >
                  <FaExternalLinkAlt size={16} />
                  Visit Website
                </a>
                <a
                  href="https://github.com/b0ase/robust-ae"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 border-2 border-blue-400 text-blue-400 font-bold rounded-xl hover:bg-blue-400 hover:text-black transition-all flex items-center gap-2"
                >
                  <FaGithub size={16} />
                  View Code
                </a>
                <Link
                  href={`/market#project-${project.slug}`}
                  className="px-8 py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all flex items-center gap-2"
                >
                  <FaExternalLinkAlt size={16} />
                  View on Market
                </Link>
              </div>

              {/* Key Stats */}
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400">$ROBUST</div>
                  <div className="text-sm text-gray-400">Native Token</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-cyan-400">SCADA</div>
                  <div className="text-sm text-gray-400">Blockchain</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-400">Industrial</div>
                  <div className="text-sm text-gray-400">Automation</div>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-3xl blur-3xl"></div>
              <div className="relative bg-black/30 backdrop-blur-sm rounded-3xl p-8 border border-blue-500/30">
                <Image
                  src="/images/clientprojects/robust-ae-com/slug/robust-logo.png"
                  alt="Robust Engineering Logo"
                  width={600}
                  height={400}
                  className="w-full h-auto rounded-2xl"
                  priority
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="bg-black/50 backdrop-blur-sm border-y border-blue-500/20">
          <div className="container mx-auto px-6 py-16">
            <RobustEngineeringTabs project={project} />
          </div>
        </div>
      </div>
    );
  }

  // Special handling for AI Girlfriends project
  if (project.slug === 'aigirlfriends-website') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-900 via-black to-purple-900 text-white overflow-hidden relative" data-theme="dark">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>

        <div className="container mx-auto px-6 py-12 relative z-10">
          <Link
            href="/#projects"
            className="inline-flex items-center gap-2 text-pink-400 hover:text-pink-300 mb-8 transition-colors"
          >
            <FaArrowLeft size={16} />
            Back to Projects
          </Link>

          {/* Hero Section */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center">
                  <FaUsers size={32} />
                </div>
                <div>
                  <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    AI Girlfriends
                  </h1>
                  <p className="text-xl text-pink-300 font-semibold">AI-Powered Social Platform</p>
                </div>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
                Revolutionary <span className="text-transparent bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text">AI Companionship</span> Platform
              </h2>

              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Create, customize, and interact with AI companions in a safe, controlled environment.
                Build meaningful relationships with advanced AI personalities designed for companionship and connection.
              </p>

              <div className="flex flex-wrap gap-4 mb-8">
                <a
                  href="https://aigirlfriends.website/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold rounded-xl hover:from-pink-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
                >
                  <FaExternalLinkAlt size={16} />
                  Visit Website
                </a>
                <Link
                  href={`/market#project-${project.slug}`}
                  className="px-8 py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all flex items-center gap-2"
                >
                  <FaExternalLinkAlt size={16} />
                  View on Market
                </Link>
              </div>

              {/* Key Stats */}
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-pink-400">AI</div>
                  <div className="text-sm text-gray-400">Companions</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400">Safe</div>
                  <div className="text-sm text-gray-400">Environment</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-400">Revenue</div>
                  <div className="text-sm text-gray-400">Multiple Streams</div>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-3xl blur-3xl"></div>
              <div className="relative bg-black/30 backdrop-blur-sm rounded-3xl p-8 border border-pink-500/30">
                <Image
                  src="/images/slugs/aigirlfriends-website.jpg"
                  alt="AI Girlfriends Logo"
                  width={600}
                  height={400}
                  className="w-full h-auto rounded-2xl"
                  priority
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="bg-black/50 backdrop-blur-sm border-y border-pink-500/20">
          <div className="container mx-auto px-6 py-16">
            <AIGirlfriendsTabs project={project} />
          </div>
        </div>
      </div>
    );
  }

  // Special handling for FLOOP project
  if (project.slug === 'floop') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-blue-900 text-white overflow-hidden relative" data-theme="dark">
        {/* Background Images */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-32 h-32 opacity-10">
            <Image
              src="/images/apps/FLOOP/boase4982_httpss.mj.runM93-sjOKpNo_FLOOP_Colourful_Pop-art_gr_13af3d05-bc4f-44c1-b8d9-2e321adffcd7_0.png"
              alt="FLOOP Background"
              width={128}
              height={128}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="absolute top-20 right-20 w-24 h-24 opacity-15">
            <Image
              src="/images/apps/FLOOP/boase4982_httpss.mj.runM93-sjOKpNo_FLOOP_Colourful_Pop-art_gr_8315524a-9eda-4194-8a2c-1d181b7271f7_2.png"
              alt="FLOOP Background"
              width={96}
              height={96}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="absolute bottom-32 left-20 w-28 h-28 opacity-12">
            <Image
              src="/images/apps/FLOOP/boase4982_httpss.mj.runM93-sjOKpNo_FLOOP_Colourful_Pop-art_gr_a6832b94-36da-4d66-9006-e94fd583284e_2.png"
              alt="FLOOP Background"
              width={112}
              height={112}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="absolute bottom-20 right-32 w-20 h-20 opacity-20">
            <Image
              src="/images/apps/FLOOP/boase4982_httpss.mj.runM93-sjOKpNo_FLOOP_Colourful_Pop-art_gr_31bfc025-62cf-4c49-9212-16321ccaf73f_0.png"
              alt="FLOOP Background"
              width={80}
              height={80}
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Hero Section */}
        <div className="relative z-10">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>

          <div className="container mx-auto px-6 py-12 relative z-10">
            <Link
              href="/#projects"
              className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-8 transition-colors"
            >
              <FaArrowLeft size={16} />
              Back to Projects
            </Link>

            {/* Hero Content */}
            <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                    <FaWallet size={32} />
                  </div>
                  <div>
                    <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                      FLOOP!
                    </h1>
                    <p className="text-xl text-purple-300 font-semibold">Feedback Loop Wallet</p>
                  </div>
                </div>

                <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
                  The Revolutionary Wallet That <span className="text-transparent bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text">Pays You Back</span>
                </h2>

                <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                  FLOOP isn't just a wallet—it's a complete ecosystem where every transaction creates value for token holders.
                  Powered by the innovative <span className="text-yellow-400 font-bold">$FLOOP</span> token.
                </p>

                <div className="flex flex-wrap gap-4 mb-8">
                  <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg">
                    <FaRocket className="inline mr-2" />
                    Launch FLOOP
                  </button>
                  <button className="px-8 py-4 border-2 border-purple-400 text-purple-400 font-bold rounded-xl hover:bg-purple-400 hover:text-black transition-all">
                    Learn More
                  </button>
                  <Link
                    href={`/market#project-${project.slug}`}
                    className="px-8 py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all flex items-center gap-2"
                  >
                    <FaExternalLinkAlt size={16} />
                    View on Market
                  </Link>
                </div>

                {/* Key Stats */}
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-400">$FLOOP</div>
                    <div className="text-sm text-gray-400">Native Token</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400">Auto</div>
                    <div className="text-sm text-gray-400">Dividends</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400">Real-time</div>
                    <div className="text-sm text-gray-400">Payouts</div>
                  </div>
                </div>
              </div>

              {/* Hero Image */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-3xl blur-3xl"></div>
                <div className="relative bg-black/30 backdrop-blur-sm rounded-3xl p-8 border border-purple-500/30">
                  <Image
                    src="/images/apps/FLOOP/boase4982_httpss.mj.runM93-sjOKpNo_FLOOP_Colourful_Pop-art_gr_31438ec7-f4b4-4fe2-8868-b2cae36444d3_0.png"
                    alt="FLOOP! Feedback Loop Wallet"
                    width={600}
                    height={400}
                    className="w-full h-auto rounded-2xl"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* What is FLOOP Section */}
        <div className="bg-black/50 backdrop-blur-sm border-y border-purple-500/20">
          <div className="container mx-auto px-6 py-16">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-black mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                What is FLOOP?
              </h2>
              <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
                FLOOP stands for <span className="text-purple-400 font-bold">"Feedback Loop"</span> - a revolutionary wallet system that creates a sustainable ecosystem where users are rewarded for their participation.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {/* Wallet Feature */}
              <div className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 rounded-2xl p-8 border border-purple-500/30 backdrop-blur-sm">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-6">
                  <FaWallet size={24} />
                </div>
                <h3 className="text-2xl font-bold mb-4">Smart Wallet</h3>
                <p className="text-gray-300">
                  A next-generation digital wallet that securely stores your $FLOOP tokens and automatically manages dividend distributions.
                </p>
              </div>

              {/* Token Feature */}
              <div className="bg-gradient-to-br from-yellow-900/50 to-orange-900/50 rounded-2xl p-8 border border-yellow-500/30 backdrop-blur-sm">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mb-6">
                  <FaCoins size={24} />
                </div>
                <h3 className="text-2xl font-bold mb-4">$FLOOP Token</h3>
                <p className="text-gray-300">
                  The native token that acts like a dividend-bearing share, automatically receiving payouts from all FLOOP-enabled services.
                </p>
              </div>

              {/* Ecosystem Feature */}
              <div className="bg-gradient-to-br from-green-900/50 to-teal-900/50 rounded-2xl p-8 border border-green-500/30 backdrop-blur-sm md:col-span-2 lg:col-span-1">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl flex items-center justify-center mb-6">
                  <FaUsers size={24} />
                </div>
                <h3 className="text-2xl font-bold mb-4">Service Ecosystem</h3>
                <p className="text-gray-300">
                  Every FLOOP-enabled service shares revenue with token holders, creating a self-sustaining economy that benefits everyone.
                </p>
              </div>
            </div>

            {/* How It Works */}
            <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-3xl p-12 border border-purple-500/20">
              <h3 className="text-4xl font-bold text-center mb-12">How FLOOP Works</h3>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-2xl font-bold">1</span>
                  </div>
                  <h4 className="text-xl font-bold mb-4">Service Payment</h4>
                  <p className="text-gray-300">A customer pays for a FLOOP-enabled service</p>
                </div>
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-2xl font-bold">2</span>
                  </div>
                  <h4 className="text-xl font-bold mb-4">Auto Distribution</h4>
                  <p className="text-gray-300">Payment is automatically distributed to all $FLOOP token holders</p>
                </div>
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-2xl font-bold">3</span>
                  </div>
                  <h4 className="text-xl font-bold mb-4">Instant Rewards</h4>
                  <p className="text-gray-300">Dividends appear in your FLOOP wallet automatically</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Project Video Section */}
        {projectVideos[slug] && (
          <div className="container mx-auto px-6 py-16">
            <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Project Video
            </h2>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/30 max-w-4xl mx-auto">
              <video
                src={projectVideos[slug].video}
                className="w-full rounded-lg"
                controls
                preload="metadata"
                poster={projectVideos[slug].poster}
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        )}

        {/* Gallery Section */}
        {project?.cardImageUrls && project.cardImageUrls.length > 0 && (
          <div className="container mx-auto px-6 py-16">
            <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              FLOOP in Action
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {project.cardImageUrls.map((url, index) => (
                <div key={index} className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/20 backdrop-blur-sm">
                  <div className="aspect-video overflow-hidden">
                    <Image
                      src={url}
                      alt={`FLOOP interface ${index + 1}`}
                      width={600}
                      height={400}
                      className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                      priority={index < 3}
                      quality={90}
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600">
          <div className="container mx-auto px-6 py-16 text-center">
            <h2 className="text-4xl font-bold mb-6">Ready to Join the FLOOP Revolution?</h2>
            <p className="text-xl mb-8 opacity-90">
              Be part of the future where your wallet works for you, not against you.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <button className="px-8 py-4 bg-white text-purple-600 font-bold rounded-xl hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg">
                <FaWallet className="inline mr-2" />
                Get FLOOP Wallet
              </button>
              <Link
                href={`/client-login/${project?.slug}`}
                className="px-8 py-4 border-2 border-white text-white font-bold rounded-xl hover:bg-white hover:text-purple-600 transition-all flex items-center gap-2"
              >
                <FaLock size={16} />
                Client Access
              </Link>
              <Link
                href={`/market#project-${project.slug}`}
                className="px-8 py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all flex items-center gap-2"
              >
                <FaExternalLinkAlt size={16} />
                View on Market
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default portfolio page for other projects - with dynamic theming
  const theme = getThemeClasses(project.themeConfig);

  return (
    <div className={`min-h-screen ${theme.background} text-white`} data-theme="dark">
      <div className="container mx-auto px-6 py-12">
        <Link
          href="/#projects"
          className={`inline-flex items-center gap-2 ${theme.primaryText} ${theme.primaryTextHover} mb-8`}
        >
          <FaArrowLeft size={16} />
          Back to Projects
        </Link>

        {/* Social Links Section */}
        {(project.xUrl && project.xUrl !== '#') && (
          <div className="flex gap-4 mb-8">
            {project.xUrl && project.xUrl !== '#' && (
              <a
                href={project.xUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-2 px-4 py-2 ${theme.primaryBg} ${theme.primaryBgHover} text-white rounded-lg transition-colors`}
              >
                <FaTwitter size={16} />
                Follow on X
              </a>
            )}
          </div>
        )}

        {/* Project Video Section */}
        {projectVideos[slug] && (
          <section className="mb-12">
            <h2 className={`text-3xl font-semibold ${theme.secondaryText} mb-6`}>Project Video</h2>
            <div className={`${theme.cardBg} p-6 rounded-lg shadow-xl border ${theme.borderColor}`}>
              <video
                src={projectVideos[slug].video}
                className="w-full max-w-4xl mx-auto rounded-lg"
                controls
                preload="metadata"
                poster={projectVideos[slug].poster}
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </section>
        )}

        <ProjectTabs project={project} themeConfig={project.themeConfig} />
      </div>

      {/* Floating Bitcoin Writer Button */}
      {project.slug === 'bitcoin-writer' && <BitcoinWriterFloat />}

      {/* $bWriter Purchase Modal for bitcoin-writer project */}
      {project.slug === 'bitcoin-writer' && (
        <BWriterPurchaseModal
          isOpen={showPurchaseModal}
          onClose={() => setShowPurchaseModal(false)}
          initialAmount={investAmount ? parseFloat(investAmount) : 100}
          tokenTicker="$bWriter"
          totalValuation={project.price}
          totalRaised={project.totalRaised}
        />
      )}
    </div>
  );
}
