'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/Providers';
import { 
  FaArrowLeft,
  FaChartLine,
  FaChartBar,
  FaCodeBranch,
  FaClock,
  FaBolt,
  FaUsers,
  FaHdd,
  FaEnvelope,
  FaFileAlt,
  FaYoutube,
  FaShare,
  FaPalette,
  FaMicrophone,
  FaBrain,
  FaMusic,
  FaVideo,
  FaTwitter,
  FaInstagram,
  FaDiscord,
  FaServer,
  FaDatabase,
  FaDollarSign,
  FaEye,
  FaGlobe,
  FaExternalLinkAlt,
  FaPlay,
  FaPause,
  FaCog
} from 'react-icons/fa';

export default function ZeroDiceAdminPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }
    
    if (user) {
      setIsLoading(false);
    }
  }, [loading, user, router]);

  const stats = [
    { title: 'Monthly Revenue', value: '$1,200', icon: FaDollarSign, color: 'text-green-400', bgColor: 'bg-green-400/20', change: '+15%' },
    { title: 'Active Users', value: '2,547', icon: FaUsers, color: 'text-blue-400', bgColor: 'bg-blue-400/20', change: '+8%' },
    { title: 'Content Views', value: '89.2K', icon: FaEye, color: 'text-purple-400', bgColor: 'bg-purple-400/20', change: '+23%' },
    { title: 'Social Reach', value: '156K', icon: FaShare, color: 'text-orange-400', bgColor: 'bg-orange-400/20', change: '+12%' },
  ];

  const integrationStatus = [
    { name: 'Google Drive', status: 'connected', icon: FaHdd, color: 'text-green-400' },
    { name: 'Gmail', status: 'connected', icon: FaEnvelope, color: 'text-red-400' },
    { name: 'YouTube', status: 'connected', icon: FaYoutube, color: 'text-red-400' },
    { name: 'Twitter/X', status: 'connected', icon: FaTwitter, color: 'text-blue-400' },
    { name: 'Instagram', status: 'connected', icon: FaInstagram, color: 'text-pink-400' },
    { name: 'Discord', status: 'connected', icon: FaDiscord, color: 'text-indigo-400' },
    { name: 'Suno AI', status: 'connected', icon: FaMusic, color: 'text-yellow-400' },
    { name: 'Google Gemini', status: 'connected', icon: FaBrain, color: 'text-purple-400' },
  ];

  const automationWorkflows = [
    { name: 'Auto-post to Twitter/X', status: 'active', lastRun: '2 hours ago', nextRun: 'In 4 hours', platform: 'Twitter' },
    { name: 'Instagram Story Upload', status: 'active', lastRun: '6 hours ago', nextRun: 'In 18 hours', platform: 'Instagram' },
    { name: 'YouTube Video Processing', status: 'active', lastRun: '1 day ago', nextRun: 'In 2 days', platform: 'YouTube' },
    { name: 'Discord Community Updates', status: 'active', lastRun: '30 minutes ago', nextRun: 'In 30 minutes', platform: 'Discord' },
  ];

  const socialMediaStats = [
    { platform: 'Twitter/X', followers: '15.2K', engagement: '4.2%', posts: '847', growth: '+12.5%' },
    { platform: 'Instagram', followers: '23.8K', engagement: '6.1%', posts: '342', growth: '+18.3%' },
    { platform: 'YouTube', subscribers: '8.9K', views: '156K', videos: '89', growth: '+22.1%' },
    { platform: 'Discord', members: '4.2K', online: '342', channels: '15', growth: '+8.7%' },
  ];

  const contentPerformance = {
    music: { tracks: 156, plays: '89.2K', rating: '4.7/5' },
    nfts: { total: 89, floorPrice: '0.15 ETH', volume: '12.4 ETH' },
    engagement: { activeUsers: 847, sessionTime: '8.5 min', bounceRate: '23%' }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FaChartLine },
    { id: 'analytics', label: 'Analytics', icon: FaChartBar },
    { id: 'automation', label: 'Automation', icon: FaCodeBranch },
    { id: 'integrations', label: 'Integrations', icon: FaBolt },
    { id: 'content', label: 'Content', icon: FaPalette },
    { id: 'server', label: 'Server', icon: FaServer },
    { id: 'database', label: 'Database', icon: FaDatabase },
    { id: 'settings', label: 'Settings', icon: FaCog },
  ];

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p>Loading Zero Dice admin dashboard...</p>
        </div>
      </div>
    );
  }

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
            className="bg-gradient-to-br from-gray-900/50 to-black border border-cyan-400/30 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                <stat.icon className={`text-xl ${stat.color}`} />
              </div>
              <span className="text-green-400 text-sm font-semibold">{stat.change}</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
            <p className="text-gray-400">{stat.title}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-br from-gray-900/50 to-black border border-cyan-400/30 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <FaBolt className="text-cyan-400 mr-3" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button className="flex items-center space-x-3 p-4 bg-gray-800/30 rounded-lg hover:bg-gray-700/50 transition-colors group">
            <div className="w-10 h-10 bg-purple-400/20 rounded-lg flex items-center justify-center group-hover:bg-purple-400/30 transition-colors">
              <FaHdd className="text-purple-400" />
            </div>
            <div className="text-left">
              <h3 className="text-white font-medium group-hover:text-purple-400 transition-colors">Google Drive</h3>
              <p className="text-gray-400 text-sm">Manage content files</p>
            </div>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-gray-800/30 rounded-lg hover:bg-gray-700/50 transition-colors group">
            <div className="w-10 h-10 bg-red-400/20 rounded-lg flex items-center justify-center group-hover:bg-red-400/30 transition-colors">
              <FaYoutube className="text-red-400" />
            </div>
            <div className="text-left">
              <h3 className="text-white font-medium group-hover:text-red-400 transition-colors">YouTube</h3>
              <p className="text-gray-400 text-sm">Upload & manage videos</p>
            </div>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-gray-800/30 rounded-lg hover:bg-gray-700/50 transition-colors group">
            <div className="w-10 h-10 bg-blue-400/20 rounded-lg flex items-center justify-center group-hover:bg-blue-400/30 transition-colors">
              <FaTwitter className="text-blue-400" />
            </div>
            <div className="text-left">
              <h3 className="text-white font-medium group-hover:text-blue-400 transition-colors">Social Media</h3>
              <p className="text-gray-400 text-sm">Auto-post content</p>
            </div>
          </button>
        </div>
      </div>

      {/* Active Workflows */}
      <div className="bg-gradient-to-br from-gray-900/50 to-black border border-cyan-400/30 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <FaCodeBranch className="text-cyan-400 mr-3" />
          Active Automation Workflows
        </h2>
        <div className="space-y-4">
          {automationWorkflows.map((workflow, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className={`w-3 h-3 rounded-full ${workflow.status === 'active' ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                <div>
                  <h3 className="text-white font-medium">{workflow.name}</h3>
                  <p className="text-gray-400 text-sm">{workflow.platform}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white text-sm">Last: {workflow.lastRun}</p>
                <p className="text-gray-400 text-sm">Next: {workflow.nextRun}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-8">
      {/* Social Media Analytics */}
      <div className="bg-gradient-to-br from-gray-900/50 to-black border border-cyan-400/30 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <FaChartBar className="text-cyan-400 mr-3" />
          Social Media Analytics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {socialMediaStats.map((stat) => (
            <div key={stat.platform} className="bg-gray-800/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-white">{stat.platform}</h3>
                <span className="text-green-400 text-sm font-semibold">{stat.growth}</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Followers:</span>
                  <span className="text-white font-medium">{stat.followers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Engagement:</span>
                  <span className="text-white font-medium">{stat.engagement}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Posts/Videos:</span>
                  <span className="text-white font-medium">{stat.posts || stat.videos}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Content Performance */}
      <div className="bg-gradient-to-br from-gray-900/50 to-black border border-cyan-400/30 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <FaChartLine className="text-cyan-400 mr-3" />
          Content Performance
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
              <FaMusic className="text-yellow-400 mr-2" />
              Music Tracks
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Tracks:</span>
                <span className="text-white">{contentPerformance.music.tracks}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Plays:</span>
                <span className="text-white">{contentPerformance.music.plays}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Avg. Rating:</span>
                <span className="text-white">{contentPerformance.music.rating}</span>
              </div>
            </div>
          </div>
          <div className="bg-gray-800/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
              <FaPalette className="text-purple-400 mr-2" />
              NFTs
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Total NFTs:</span>
                <span className="text-white">{contentPerformance.nfts.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Floor Price:</span>
                <span className="text-white">{contentPerformance.nfts.floorPrice}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Volume:</span>
                <span className="text-white">{contentPerformance.nfts.volume}</span>
              </div>
            </div>
          </div>
          <div className="bg-gray-800/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
              <FaUsers className="text-green-400 mr-2" />
              User Engagement
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Active Users:</span>
                <span className="text-white">{contentPerformance.engagement.activeUsers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Session Time:</span>
                <span className="text-white">{contentPerformance.engagement.sessionTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Bounce Rate:</span>
                <span className="text-white">{contentPerformance.engagement.bounceRate}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderServer = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-gray-900/50 to-black border border-cyan-400/30 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <FaServer className="text-orange-400 mr-3" />
          Oracle Cloud Server Management
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Server Path</label>
            <code className="block bg-gray-900 border border-gray-700 rounded p-3 text-green-400">
              /var/www/zerodice-store
            </code>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">SSH Connection</label>
            <code className="block bg-gray-900 border border-gray-700 rounded p-3 text-green-400">
              ssh -i ~/Downloads/ssh-key-2025-12-11.key opc@129.213.161.247
            </code>
          </div>
          <div className="flex gap-4">
            <button className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg font-medium transition-colors flex items-center gap-2">
              <FaServer />
              SSH Connect
            </button>
            <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors flex items-center gap-2">
              <FaFileAlt />
              View Logs
            </button>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors flex items-center gap-2">
              <FaEye />
              Monitor Performance
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderIntegrations = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-gray-900/50 to-black border border-cyan-400/30 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <FaBolt className="text-cyan-400 mr-3" />
          Integration Status
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {integrationStatus.map((integration) => (
            <div key={integration.name} className="flex items-center space-x-3 p-3 bg-gray-800/30 rounded-lg">
              <integration.icon className={`text-xl ${integration.color}`} />
              <div>
                <p className="text-white text-sm font-medium">{integration.name}</p>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-green-400 text-xs">Connected</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => router.push('/dashboard/projects')}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              <FaArrowLeft />
            </button>
            <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-xl flex items-center justify-center">
              <FaMusic className="text-2xl text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-bold text-white" style={{ 
                  fontFamily: 'Bangers, cursive',
                  textShadow: '0 0 20px #00d4ff'
                }}>
                  ZERO DICE ADMIN
                </h1>
                <div className="px-3 py-1 rounded-lg border text-sm font-medium bg-green-900/50 border-green-500 text-green-200">
                  Active
                </div>
              </div>
              <p className="text-cyan-300 text-xl">zerodice.store</p>
              <p className="text-gray-400">E-commerce store for gaming accessories with content automation</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.open('https://zerodice.store', '_blank')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <FaExternalLinkAlt />
                Visit Site
              </button>
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 border-b border-cyan-400/30">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-t-lg transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-cyan-400/20 text-cyan-400 border-b-2 border-cyan-400'
                    : 'text-gray-400 hover:text-cyan-300 hover:bg-cyan-400/10'
                }`}
              >
                <tab.icon className="text-sm" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
          className="min-h-[600px]"
        >
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'analytics' && renderAnalytics()}
          {activeTab === 'server' && renderServer()}
          {activeTab === 'integrations' && renderIntegrations()}
          {activeTab === 'automation' && (
            <div className="bg-gradient-to-br from-gray-900/50 to-black border border-cyan-400/30 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Automation Management</h2>
              <p className="text-gray-400">Detailed automation controls and workflow management coming soon...</p>
            </div>
          )}
          {activeTab === 'content' && (
            <div className="bg-gradient-to-br from-gray-900/50 to-black border border-cyan-400/30 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Content Management</h2>
              <p className="text-gray-400">Music tracks, NFTs, and content library management coming soon...</p>
            </div>
          )}
          {activeTab === 'database' && (
            <div className="bg-gradient-to-br from-gray-900/50 to-black border border-cyan-400/30 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Database Administration</h2>
              <p className="text-gray-400">Supabase PostgreSQL database management coming soon...</p>
            </div>
          )}
          {activeTab === 'settings' && (
            <div className="bg-gradient-to-br from-gray-900/50 to-black border border-cyan-400/30 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Project Settings</h2>
              <p className="text-gray-400">Configuration and project settings coming soon...</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}