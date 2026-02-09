'use client';

import React, { useState } from 'react';
import { Project } from '@/lib/data';
import { FaRocket, FaLightbulb, FaChartLine, FaCode, FaUsers, FaShieldAlt, FaGlobe } from 'react-icons/fa';

interface AIGirlfriendsTabsProps {
  project: Project;
}

const AIGirlfriendsTabs = ({ project }: AIGirlfriendsTabsProps) => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FaRocket },
    { id: 'features', label: 'Features', icon: FaLightbulb },
    { id: 'revenue', label: 'Revenue Model', icon: FaChartLine },
    { id: 'tech', label: 'Technology', icon: FaCode },
    { id: 'market', label: 'Market Analysis', icon: FaUsers },
    { id: 'investment', label: 'Investment', icon: FaShieldAlt },
  ];

  const TabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-bold text-white mb-4">Revolutionary AI UGC Platform</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  AI Girlfriends is a cutting-edge platform that enables users to create, customize, and monetize ultra-realistic AI girlfriend personas across major social media platforms. Our advanced AI technology creates lifelike personalities and generates engaging content automatically.
                </p>
                <p className="text-gray-300 leading-relaxed mb-6">
                  The platform leverages state-of-the-art machine learning for personality modeling, natural language processing for conversational AI, and computer vision for generating photorealistic images and videos.
                </p>
                <div className="flex flex-wrap gap-3">
                  <span className="px-3 py-1 bg-pink-500/20 text-pink-300 rounded-full text-sm">AI-Powered</span>
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">Multi-Platform</span>
                  <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">Revenue Generating</span>
                  <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">Scalable</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-black/30 p-6 rounded-lg border border-pink-500/20">
                  <h4 className="text-lg font-semibold text-white mb-3">Key Statistics</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Platform Users</span>
                      <span className="text-white font-semibold">10,000+</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">AI Personas Created</span>
                      <span className="text-white font-semibold">50,000+</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Monthly Revenue</span>
                      <span className="text-white font-semibold">$500K+</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Social Media Reach</span>
                      <span className="text-white font-semibold">5M+</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'features':
        return (
          <div className="space-y-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-black/30 p-6 rounded-lg border border-pink-500/20">
                <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center mb-4">
                  <FaLightbulb className="text-pink-400 text-xl" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-3">AI Content Generation</h4>
                <p className="text-gray-300 text-sm">
                  Create lifelike AI girlfriends with unique personalities, visual styles, and conversational abilities using advanced machine learning algorithms.
                </p>
              </div>

              <div className="bg-black/30 p-6 rounded-lg border border-blue-500/20">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                  <FaGlobe className="text-blue-400 text-xl" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-3">Multi-Platform Distribution</h4>
                <p className="text-gray-300 text-sm">
                  Seamless posting to OnlyFans, Instagram, TikTok, X.com, and Facebook with automated content scheduling and optimization.
                </p>
              </div>

              <div className="bg-black/30 p-6 rounded-lg border border-green-500/20">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                  <FaChartLine className="text-green-400 text-xl" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-3">Revenue Streams</h4>
                <p className="text-gray-300 text-sm">
                  Multiple monetization options including subscriptions, pay-per-view content, tips, and affiliate marketing opportunities.
                </p>
              </div>

              <div className="bg-black/30 p-6 rounded-lg border border-purple-500/20">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                  <FaUsers className="text-purple-400 text-xl" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-3">Personality Customization</h4>
                <p className="text-gray-300 text-sm">
                  Deep personality modeling with customizable traits, interests, communication styles, and relationship dynamics.
                </p>
              </div>

              <div className="bg-black/30 p-6 rounded-lg border border-yellow-500/20">
                <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center mb-4">
                  <FaCode className="text-yellow-400 text-xl" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-3">Advanced Analytics</h4>
                <p className="text-gray-300 text-sm">
                  Comprehensive analytics dashboard with engagement metrics, revenue tracking, audience insights, and performance optimization tools.
                </p>
              </div>

              <div className="bg-black/30 p-6 rounded-lg border border-red-500/20">
                <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center mb-4">
                  <FaShieldAlt className="text-red-400 text-xl" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-3">Content Safety</h4>
                <p className="text-gray-300 text-sm">
                  Built-in content moderation, age verification, and compliance tools to ensure safe and legal content creation.
                </p>
              </div>
            </div>
          </div>
        );

      case 'revenue':
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">Diverse Revenue Streams</h3>
                <div className="space-y-4">
                  <div className="bg-black/30 p-4 rounded-lg border border-green-500/20">
                    <h4 className="text-lg font-semibold text-white mb-2">Subscription Models</h4>
                    <p className="text-gray-300 text-sm mb-3">Monthly and annual subscriptions with tiered pricing based on features and AI capabilities.</p>
                    <div className="text-green-400 font-semibold">Revenue: $200K/month</div>
                  </div>
                  
                  <div className="bg-black/30 p-4 rounded-lg border border-blue-500/20">
                    <h4 className="text-lg font-semibold text-white mb-2">Pay-Per-View Content</h4>
                    <p className="text-gray-300 text-sm mb-3">Premium content monetization with micro-payments for exclusive AI-generated content.</p>
                    <div className="text-blue-400 font-semibold">Revenue: $150K/month</div>
                  </div>
                  
                  <div className="bg-black/30 p-4 rounded-lg border border-purple-500/20">
                    <h4 className="text-lg font-semibold text-white mb-2">Tips & Donations</h4>
                    <p className="text-gray-300 text-sm mb-3">Direct user-to-AI tipping system with platform commission on transactions.</p>
                    <div className="text-purple-400 font-semibold">Revenue: $100K/month</div>
                  </div>
                  
                  <div className="bg-black/30 p-4 rounded-lg border border-yellow-500/20">
                    <h4 className="text-lg font-semibold text-white mb-2">Affiliate Marketing</h4>
                    <p className="text-gray-300 text-sm mb-3">Partnerships with lifestyle brands, fashion, and beauty products promoted by AI personas.</p>
                    <div className="text-yellow-400 font-semibold">Revenue: $50K/month</div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">Financial Projections</h3>
                <div className="bg-black/30 p-6 rounded-lg border border-pink-500/20">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Current Monthly Revenue</span>
                      <span className="text-white font-bold text-xl">$500K</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Projected Annual Revenue</span>
                      <span className="text-white font-bold text-xl">$6M</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Growth Rate</span>
                      <span className="text-green-400 font-bold">+25% MoM</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Profit Margin</span>
                      <span className="text-blue-400 font-bold">65%</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 bg-black/30 p-6 rounded-lg border border-green-500/20">
                  <h4 className="text-lg font-semibold text-white mb-4">Market Opportunity</h4>
                  <p className="text-gray-300 text-sm mb-4">
                    The AI companionship market is projected to reach $3.2 billion by 2028, with our platform positioned to capture 15-20% market share.
                  </p>
                  <div className="text-green-400 font-semibold">Total Addressable Market: $3.2B</div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'tech':
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">Technology Stack</h3>
                <div className="space-y-4">
                  <div className="bg-black/30 p-4 rounded-lg border border-blue-500/20">
                    <h4 className="text-lg font-semibold text-white mb-2">Frontend</h4>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">Next.js 14</span>
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">React 18</span>
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">TypeScript</span>
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">Tailwind CSS</span>
                    </div>
                  </div>
                  
                  <div className="bg-black/30 p-4 rounded-lg border border-green-500/20">
                    <h4 className="text-lg font-semibold text-white mb-2">Backend</h4>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs">Node.js</span>
                      <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs">Express.js</span>
                      <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs">PostgreSQL</span>
                      <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs">Redis</span>
                    </div>
                  </div>
                  
                  <div className="bg-black/30 p-4 rounded-lg border border-purple-500/20">
                    <h4 className="text-lg font-semibold text-white mb-2">AI/ML</h4>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs">OpenAI GPT-4</span>
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs">Stable Diffusion</span>
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs">TensorFlow</span>
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs">PyTorch</span>
                    </div>
                  </div>
                  
                  <div className="bg-black/30 p-4 rounded-lg border border-yellow-500/20">
                    <h4 className="text-lg font-semibold text-white mb-2">Infrastructure</h4>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded text-xs">AWS</span>
                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded text-xs">Docker</span>
                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded text-xs">Kubernetes</span>
                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded text-xs">CDN</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">AI Capabilities</h3>
                <div className="space-y-4">
                  <div className="bg-black/30 p-4 rounded-lg border border-pink-500/20">
                    <h4 className="text-lg font-semibold text-white mb-2">Natural Language Processing</h4>
                    <p className="text-gray-300 text-sm">
                      Advanced conversational AI with personality modeling, emotional intelligence, and context-aware responses.
                    </p>
                  </div>
                  
                  <div className="bg-black/30 p-4 rounded-lg border border-blue-500/20">
                    <h4 className="text-lg font-semibold text-white mb-2">Computer Vision</h4>
                    <p className="text-gray-300 text-sm">
                      Photorealistic image and video generation with style transfer, pose estimation, and facial expression synthesis.
                    </p>
                  </div>
                  
                  <div className="bg-black/30 p-4 rounded-lg border border-green-500/20">
                    <h4 className="text-lg font-semibold text-white mb-2">Content Generation</h4>
                    <p className="text-gray-300 text-sm">
                      Automated content creation including captions, stories, posts, and interactive responses across multiple platforms.
                    </p>
                  </div>
                  
                  <div className="bg-black/30 p-4 rounded-lg border border-purple-500/20">
                    <h4 className="text-lg font-semibold text-white mb-2">Analytics & Optimization</h4>
                    <p className="text-gray-300 text-sm">
                      ML-powered analytics for engagement optimization, audience targeting, and content performance prediction.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'market':
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">Market Analysis</h3>
                <div className="space-y-4">
                  <div className="bg-black/30 p-4 rounded-lg border border-blue-500/20">
                    <h4 className="text-lg font-semibold text-white mb-2">Target Demographics</h4>
                    <ul className="text-gray-300 text-sm space-y-2">
                      <li>• Primary: 18-35 age group</li>
                      <li>• Secondary: 35-50 age group</li>
                      <li>• Global market with focus on US, EU, Asia</li>
                      <li>• Tech-savvy individuals seeking companionship</li>
                    </ul>
                  </div>
                  
                  <div className="bg-black/30 p-4 rounded-lg border border-green-500/20">
                    <h4 className="text-lg font-semibold text-white mb-2">Competitive Landscape</h4>
                    <ul className="text-gray-300 text-sm space-y-2">
                      <li>• Replika (AI companion app)</li>
                      <li>• Character.ai (AI character platform)</li>
                      <li>• OnlyFans (content monetization)</li>
                      <li>• Instagram/TikTok (social media)</li>
                    </ul>
                  </div>
                  
                  <div className="bg-black/30 p-4 rounded-lg border border-purple-500/20">
                    <h4 className="text-lg font-semibold text-white mb-2">Market Size</h4>
                    <ul className="text-gray-300 text-sm space-y-2">
                      <li>• AI Companion Market: $3.2B by 2028</li>
                      <li>• Social Media Content: $50B+</li>
                      <li>• Digital Content Creation: $15B+</li>
                      <li>• Virtual Influencer Market: $4.6B</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">Growth Strategy</h3>
                <div className="space-y-4">
                  <div className="bg-black/30 p-4 rounded-lg border border-pink-500/20">
                    <h4 className="text-lg font-semibold text-white mb-2">User Acquisition</h4>
                    <p className="text-gray-300 text-sm">
                      Viral marketing through AI-generated content, influencer partnerships, and social media campaigns targeting specific demographics.
                    </p>
                  </div>
                  
                  <div className="bg-black/30 p-4 rounded-lg border border-yellow-500/20">
                    <h4 className="text-lg font-semibold text-white mb-2">Platform Expansion</h4>
                    <p className="text-gray-300 text-sm">
                      Integration with emerging platforms, mobile app development, and API partnerships for third-party integrations.
                    </p>
                  </div>
                  
                  <div className="bg-black/30 p-4 rounded-lg border border-green-500/20">
                    <h4 className="text-lg font-semibold text-white mb-2">Feature Development</h4>
                    <p className="text-gray-300 text-sm">
                      Advanced AI capabilities, AR/VR integration, voice synthesis, and real-time video generation for enhanced user experience.
                    </p>
                  </div>
                  
                  <div className="bg-black/30 p-4 rounded-lg border border-blue-500/20">
                    <h4 className="text-lg font-semibold text-white mb-2">Partnerships</h4>
                    <p className="text-gray-300 text-sm">
                      Strategic partnerships with social media platforms, payment processors, and content creators for ecosystem growth.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'investment':
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">Investment Opportunity</h3>
                <div className="space-y-4">
                  <div className="bg-black/30 p-4 rounded-lg border border-green-500/20">
                    <h4 className="text-lg font-semibold text-white mb-2">Current Valuation</h4>
                    <div className="text-3xl font-bold text-green-400 mb-2">$50M</div>
                    <p className="text-gray-300 text-sm">Based on 10x revenue multiple and growth projections</p>
                  </div>
                  
                  <div className="bg-black/30 p-4 rounded-lg border border-blue-500/20">
                    <h4 className="text-lg font-semibold text-white mb-2">Funding Round</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Series A Target</span>
                        <span className="text-white font-semibold">$10M</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Equity Offered</span>
                        <span className="text-white font-semibold">20%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Use of Funds</span>
                        <span className="text-white font-semibold">Growth & R&D</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-black/30 p-4 rounded-lg border border-purple-500/20">
                    <h4 className="text-lg font-semibold text-white mb-2">Exit Strategy</h4>
                    <ul className="text-gray-300 text-sm space-y-2">
                      <li>• IPO within 3-5 years</li>
                      <li>• Strategic acquisition by tech giants</li>
                      <li>• SPAC merger opportunity</li>
                      <li>• Secondary market liquidity</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">Risk Assessment</h3>
                <div className="space-y-4">
                  <div className="bg-black/30 p-4 rounded-lg border border-yellow-500/20">
                    <h4 className="text-lg font-semibold text-white mb-2">Regulatory Risks</h4>
                    <p className="text-gray-300 text-sm">
                      Evolving AI regulations, content moderation requirements, and platform policy changes may impact operations.
                    </p>
                  </div>
                  
                  <div className="bg-black/30 p-4 rounded-lg border border-red-500/20">
                    <h4 className="text-lg font-semibold text-white mb-2">Competition</h4>
                    <p className="text-gray-300 text-sm">
                      Established players and new entrants with significant funding may increase competitive pressure.
                    </p>
                  </div>
                  
                  <div className="bg-black/30 p-4 rounded-lg border border-orange-500/20">
                    <h4 className="text-lg font-semibold text-white mb-2">Technology Risks</h4>
                    <p className="text-gray-300 text-sm">
                      AI model limitations, infrastructure costs, and rapid technological changes may affect product development.
                    </p>
                  </div>
                  
                  <div className="bg-black/30 p-4 rounded-lg border border-pink-500/20">
                    <h4 className="text-lg font-semibold text-white mb-2">Market Risks</h4>
                    <p className="text-gray-300 text-sm">
                      Economic downturns, changing user preferences, and platform dependency may impact growth and revenue.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-8">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40'
                  : 'bg-black/30 text-gray-400 hover:text-white hover:bg-black/50 border border-gray-700'
              }`}
            >
              <Icon className="text-sm" />
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        <TabContent />
      </div>
    </div>
  );
};

export default AIGirlfriendsTabs; 