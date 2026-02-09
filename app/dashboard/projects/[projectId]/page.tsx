'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/components/Providers';
import {
  FaArrowLeft,
  FaGlobe,
  FaCode,
  FaChartLine,
  FaUsers,
  FaCog,
  FaExternalLinkAlt,
  FaServer,
  FaDatabase,
  FaShieldAlt,
  FaDollarSign,
  FaCalendar,
  FaPlay,
  FaPause,
  FaEdit,
  FaTrash,
  FaTerminal,
  FaFileCode,
  FaEye,
  FaDownload,
  FaUpload,
  FaBug,
  FaCheckCircle
} from 'react-icons/fa';

interface Project {
  id: string;
  name: string;
  domain: string;
  status: 'active' | 'paused' | 'sold' | 'development';
  client?: string;
  tech_stack: string[];
  oracle_server: boolean;
  revenue?: number;
  created_at: string;
  description: string;
  server_path?: string;
  database_info?: {
    type: string;
    host: string;
    port: number;
  };
  analytics?: {
    monthly_visitors: number;
    conversion_rate: number;
    revenue_this_month: number;
  };
}

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading } = useAuth();
  const projectId = params.projectId as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }
    
    if (user) {
      loadProject();
    }
  }, [loading, user, router, projectId]);

  const loadProject = async () => {
    // Mock data based on project ID - will be replaced with actual database data
    const mockProjects: Record<string, Project> = {
      'zerodice': {
        id: 'zerodice',
        name: 'Zero Dice',
        domain: 'zerodice.store',
        status: 'active',
        tech_stack: ['Next.js', 'Supabase', 'Stripe', 'Tailwind CSS'],
        oracle_server: true,
        revenue: 1200,
        created_at: '2024-03-10',
        description: 'E-commerce store for gaming accessories',
        server_path: '/var/www/zerodice-store',
        database_info: {
          type: 'Supabase PostgreSQL',
          host: 'db.supabase.co',
          port: 5432
        },
        analytics: {
          monthly_visitors: 2500,
          conversion_rate: 3.2,
          revenue_this_month: 850
        }
      },
      'hyperflix': {
        id: 'hyperflix',
        name: 'HyperFlix',
        domain: 'hyper-flix.com',
        status: 'active',
        tech_stack: ['Next.js', 'React', 'Tailwind CSS', 'Node.js'],
        oracle_server: true,
        revenue: 0,
        created_at: '2024-01-15',
        description: 'Movie streaming platform with modern UI/UX',
        server_path: '/var/www/hyperflix',
        database_info: {
          type: 'MongoDB',
          host: 'cluster0.mongodb.net',
          port: 27017
        },
        analytics: {
          monthly_visitors: 5200,
          conversion_rate: 0.8,
          revenue_this_month: 0
        }
      },
      'vexvoid': {
        id: 'vexvoid',
        name: 'Vex Void',
        domain: 'vexvoid.com',
        status: 'development',
        tech_stack: ['React', 'Three.js', 'WebGL', 'Node.js'],
        oracle_server: true,
        revenue: 0,
        created_at: '2024-06-20',
        description: '3D interactive gaming experience',
        server_path: '/var/www/vexvoid',
        analytics: {
          monthly_visitors: 120,
          conversion_rate: 0,
          revenue_this_month: 0
        }
      },
      'npg': {
        id: 'npg',
        name: 'NPG',
        domain: 'npg.red',
        status: 'active',
        client: 'NPG Ltd',
        tech_stack: ['WordPress', 'PHP', 'MySQL'],
        oracle_server: false,
        revenue: 5000,
        created_at: '2024-02-05',
        description: 'Corporate website for NPG company',
        analytics: {
          monthly_visitors: 1200,
          conversion_rate: 8.5,
          revenue_this_month: 1200
        }
      }
    };

    const projectData = mockProjects[projectId];
    if (projectData) {
      setProject(projectData);
    } else {
      router.push('/dashboard/projects');
    }
    setIsLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-900/50 border-green-500 text-green-200';
      case 'paused': return 'bg-yellow-900/50 border-yellow-500 text-yellow-200';
      case 'sold': return 'bg-blue-900/50 border-blue-500 text-blue-200';
      case 'development': return 'bg-purple-900/50 border-purple-500 text-purple-200';
      default: return 'bg-gray-900/50 border-gray-500 text-gray-200';
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Project Not Found</h2>
          <button
            onClick={() => router.push('/dashboard/projects')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FaEye },
    { id: 'server', label: 'Server', icon: FaServer },
    { id: 'database', label: 'Database', icon: FaDatabase },
    { id: 'analytics', label: 'Analytics', icon: FaChartLine },
    { id: 'settings', label: 'Settings', icon: FaCog }
  ];

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
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.push('/dashboard/projects')}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              <FaArrowLeft />
            </button>
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <FaGlobe className="text-2xl text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold">{project.name}</h1>
                <div className={`px-3 py-1 rounded-lg border text-sm font-medium ${getStatusColor(project.status)}`}>
                  {project.status}
                </div>
              </div>
              <p className="text-gray-300 text-lg">{project.domain}</p>
              <p className="text-gray-400">{project.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.open(`https://${project.domain}`, '_blank')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <FaExternalLinkAlt />
                Visit Site
              </button>
            </div>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg mb-8">
          <nav className="flex">
            {tabs.map((tab, index) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-4 px-6 font-medium text-sm flex items-center justify-center gap-2 transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
                } ${index === 0 ? 'rounded-l-lg' : ''} ${index === tabs.length - 1 ? 'rounded-r-lg' : ''}`}
              >
                <tab.icon className="text-sm" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-800 border border-gray-600 rounded-xl p-6">
                  <div className="flex items-center gap-4">
                    <FaUsers className="text-3xl text-blue-400" />
                    <div>
                      <h3 className="text-2xl font-bold">{project.analytics?.monthly_visitors.toLocaleString()}</h3>
                      <p className="text-gray-400">Monthly Visitors</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-800 border border-gray-600 rounded-xl p-6">
                  <div className="flex items-center gap-4">
                    <FaChartLine className="text-3xl text-green-400" />
                    <div>
                      <h3 className="text-2xl font-bold">{project.analytics?.conversion_rate}%</h3>
                      <p className="text-gray-400">Conversion Rate</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-800 border border-gray-600 rounded-xl p-6">
                  <div className="flex items-center gap-4">
                    <FaDollarSign className="text-3xl text-emerald-400" />
                    <div>
                      <h3 className="text-2xl font-bold">${project.analytics?.revenue_this_month}</h3>
                      <p className="text-gray-400">This Month</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tech Stack */}
              <div className="bg-gray-800 border border-gray-600 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4">Technology Stack</h3>
                <div className="flex flex-wrap gap-3">
                  {project.tech_stack.map((tech) => (
                    <span key={tech} className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg font-medium">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Project Details */}
              <div className="bg-gray-800 border border-gray-600 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4">Project Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Created</label>
                    <p className="text-gray-200">{new Date(project.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Domain</label>
                    <p className="text-gray-200">{project.domain}</p>
                  </div>
                  {project.client && (
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Client</label>
                      <p className="text-gray-200">{project.client}</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Total Revenue</label>
                    <p className="text-gray-200">${project.revenue?.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'server' && project.oracle_server && (
            <div className="space-y-6">
              <div className="bg-gray-800 border border-gray-600 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <FaServer className="text-orange-400" />
                  Oracle Cloud Server
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Server Path</label>
                    <code className="block bg-gray-900 border border-gray-700 rounded p-3 text-green-400">
                      {project.server_path}
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
                      <FaTerminal />
                      SSH Connect
                    </button>
                    <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors flex items-center gap-2">
                      <FaFileCode />
                      View Logs
                    </button>
                    <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors flex items-center gap-2">
                      <FaDownload />
                      Backup
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'database' && (
            <div className="space-y-6">
              <div className="bg-gray-800 border border-gray-600 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <FaDatabase className="text-blue-400" />
                  Database Configuration
                </h3>
                {project.database_info && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Database Type</label>
                        <p className="text-gray-200">{project.database_info.type}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Host</label>
                        <p className="text-gray-200">{project.database_info.host}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Port</label>
                        <p className="text-gray-200">{project.database_info.port}</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors flex items-center gap-2">
                        <FaDatabase />
                        Connect to DB
                      </button>
                      <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors flex items-center gap-2">
                        <FaDownload />
                        Export Data
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="bg-gray-800 border border-gray-600 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4">Analytics Dashboard</h3>
                <p className="text-gray-400 mb-4">Detailed analytics integration coming soon...</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Traffic Metrics</h4>
                    <p className="text-gray-400 text-sm">Page views, unique visitors, session duration</p>
                  </div>
                  <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Revenue Tracking</h4>
                    <p className="text-gray-400 text-sm">Sales, conversions, revenue trends</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="bg-gray-800 border border-gray-600 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4">Project Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Project Status</label>
                    <select className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                      <option value="active">Active</option>
                      <option value="paused">Paused</option>
                      <option value="development">Development</option>
                      <option value="sold">Sold</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Client Assignment</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      placeholder="Client name (optional)"
                      defaultValue={project.client || ''}
                    />
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors">
                      Save Changes
                    </button>
                    <button className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors">
                      Delete Project
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}