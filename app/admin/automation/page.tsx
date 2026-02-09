'use client';

import { useState, useEffect } from 'react';
import { 
  FaServer,
  FaPlay,
  FaPause,
  FaCheckCircle,
  FaSyncAlt,
  FaChartBar,
  FaTerminal,
  FaExclamationTriangle,
  FaTwitter,
  FaBolt,
  FaDatabase,
  FaCode,
  FaCog,
  FaPlus,
  FaEye,
  FaRocket,
  FaBitcoin,
  FaHeart,
  FaGamepad,
  FaCube,
  FaMusic,
  FaImage,
  FaVideo,
  FaComments,
  FaBookOpen
} from 'react-icons/fa';

interface Project {
  id: string;
  name: string;
  domain: string;
  status: 'active' | 'inactive' | 'maintenance';
  automations: {
    twitter: boolean;
    video: boolean;
    replies: boolean;
    custom: string[];
  };
  stats: {
    totalJobs: number;
    activeJobs: number;
    lastRun: string;
  };
  color: string;
}

interface AutomationJob {
  id: string;
  project: string;
  type: string;
  name: string;
  schedule: string;
  active: boolean;
  lastRun?: string;
  nextRun?: string;
  status: 'success' | 'failed' | 'pending' | 'running';
}

export default function CentralAutomationDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [jobs, setJobs] = useState<AutomationJob[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);

  // Mock data for all projects
  const mockProjects: Project[] = [
    {
      id: 'aigf',
      name: 'AI Girlfriends',
      domain: 'aigirlfriends.com',
      status: 'active',
      automations: {
        twitter: true,
        video: true,
        replies: true,
        custom: ['image-generation', 'user-onboarding']
      },
      stats: {
        totalJobs: 8,
        activeJobs: 6,
        lastRun: '2024-12-12T10:00:00Z'
      },
      color: 'pink'
    },
    {
      id: 'bitcoin-corp',
      name: 'Bitcoin Corp',
      domain: 'bitcoin-corp.com',
      status: 'active',
      automations: {
        twitter: true,
        video: false,
        replies: false,
        custom: ['market-data', 'analytics']
      },
      stats: {
        totalJobs: 7,
        activeJobs: 5,
        lastRun: '2024-12-12T10:00:00Z'
      },
      color: 'orange'
    },
    {
      id: 'b0ase',
      name: 'B0ase Personal',
      domain: 'b0ase.com',
      status: 'active',
      automations: {
        twitter: true,
        video: true,
        replies: false,
        custom: ['notion-sync', 'portfolio-build', 'client-reports']
      },
      stats: {
        totalJobs: 8,
        activeJobs: 6,
        lastRun: '2024-12-12T09:30:00Z'
      },
      color: 'blue'
    },
    {
      id: 'marina3d',
      name: 'Marina3D',
      domain: 'marina3d.xyz',
      status: 'active',
      automations: {
        twitter: false,
        video: false,
        replies: false,
        custom: ['content-scheduler', 'comments', 'music', 'stories']
      },
      stats: {
        totalJobs: 4,
        activeJobs: 3,
        lastRun: '2024-12-12T08:00:00Z'
      },
      color: 'purple'
    },
    {
      id: 'cherry-xxx',
      name: 'Cherry XXX',
      domain: 'cherry-xxx.com',
      status: 'maintenance',
      automations: {
        twitter: false,
        video: false,
        replies: false,
        custom: []
      },
      stats: {
        totalJobs: 0,
        activeJobs: 0,
        lastRun: ''
      },
      color: 'red'
    },
    {
      id: 'bitcoin-os',
      name: 'Bitcoin OS',
      domain: 'bitcoin-os.com',
      status: 'inactive',
      automations: {
        twitter: false,
        video: false,
        replies: false,
        custom: []
      },
      stats: {
        totalJobs: 0,
        activeJobs: 0,
        lastRun: ''
      },
      color: 'yellow'
    },
    {
      id: 'zerodice',
      name: 'Zero Dice',
      domain: 'zerodice.store',
      status: 'active',
      automations: {
        twitter: true,
        video: true,
        replies: true,
        custom: ['gaming-posts', 'dice-rolls']
      },
      stats: {
        totalJobs: 3,
        activeJobs: 2,
        lastRun: '2024-12-12T11:00:00Z'
      },
      color: 'indigo'
    }
  ];

  const mockJobs: AutomationJob[] = [
    // AIGF Jobs
    {
      id: 'aigf-twitter-morning',
      project: 'aigf',
      type: 'twitter',
      name: 'AI Girlfriends Twitter Posts (Morning)',
      schedule: '0 10 * * *',
      active: true,
      lastRun: '2024-12-12T10:00:00Z',
      nextRun: '2024-12-13T10:00:00Z',
      status: 'success'
    },
    {
      id: 'aigf-video-weekly',
      project: 'aigf',
      type: 'video',
      name: 'AI Girlfriends Video Content',
      schedule: '0 16 * * 3',
      active: false,
      status: 'pending'
    },
    
    // Bitcoin Corp Jobs  
    {
      id: 'bitcoin-corp-twitter-morning',
      project: 'bitcoin-corp',
      type: 'twitter',
      name: 'Bitcoin Corp Twitter Posts (Morning)',
      schedule: '0 10 * * *',
      active: true,
      lastRun: '2024-12-12T10:00:00Z',
      nextRun: '2024-12-13T10:00:00Z',
      status: 'success'
    },
    {
      id: 'bitcoin-corp-market-data',
      project: 'bitcoin-corp',
      type: 'custom',
      name: 'Market Data Sync',
      schedule: '*/15 * * * *',
      active: true,
      lastRun: '2024-12-12T11:45:00Z',
      nextRun: '2024-12-12T12:00:00Z',
      status: 'running'
    },
    
    // B0ase Jobs
    {
      id: 'b0ase-twitter-morning',
      project: 'b0ase',
      type: 'twitter',
      name: 'B0ase Twitter Posts (Morning)',
      schedule: '0 10 * * *',
      active: true,
      lastRun: '2024-12-12T10:00:00Z',
      nextRun: '2024-12-13T10:00:00Z',
      status: 'success'
    },
    {
      id: 'b0ase-notion-sync',
      project: 'b0ase',
      type: 'custom',
      name: 'Notion Project Sync',
      schedule: '0 */6 * * *',
      active: true,
      lastRun: '2024-12-12T06:00:00Z',
      nextRun: '2024-12-12T12:00:00Z',
      status: 'success'
    },
    
    // Marina3D Jobs
    {
      id: 'marina3d-content-scheduler',
      project: 'marina3d',
      type: 'custom',
      name: 'Marina3D Content Scheduler',
      schedule: '0 */2 * * *',
      active: true,
      lastRun: '2024-12-12T08:00:00Z',
      nextRun: '2024-12-12T10:00:00Z',
      status: 'success'
    },
    {
      id: 'marina3d-music',
      project: 'marina3d',
      type: 'custom',
      name: 'Marina3D Music Posting',
      schedule: '0 14 * * *',
      active: true,
      status: 'pending'
    },
    
    // Zero Dice Jobs
    {
      id: 'zerodice-twitter-morning',
      project: 'zerodice',
      type: 'twitter',
      name: 'Zero Dice Twitter Posts (Morning)',
      schedule: '0 11 * * *',
      active: true,
      lastRun: '2024-12-12T11:00:00Z',
      nextRun: '2024-12-13T11:00:00Z',
      status: 'success'
    },
    {
      id: 'zerodice-twitter-evening',
      project: 'zerodice',
      type: 'twitter',
      name: 'Zero Dice Twitter Posts (Evening)',
      schedule: '0 23 * * *',
      active: true,
      lastRun: '2024-12-11T23:00:00Z',
      nextRun: '2024-12-12T23:00:00Z',
      status: 'success'
    },
    {
      id: 'zerodice-auto-reply',
      project: 'zerodice',
      type: 'custom',
      name: 'Zero Dice Auto-Reply',
      schedule: '*/30 * * * *',
      active: false,
      status: 'pending'
    }
  ];

  useEffect(() => {
    setProjects(mockProjects);
    setJobs(mockJobs);
  }, []);

  const getProjectIcon = (projectId: string) => {
    switch (projectId) {
      case 'aigf': return <FaHeart className="w-5 h-5" />;
      case 'bitcoin-corp': return <FaBitcoin className="w-5 h-5" />;
      case 'b0ase': return <FaCode className="w-5 h-5" />;
      case 'marina3d': return <FaCube className="w-5 h-5" />;
      case 'cherry-xxx': return <FaGamepad className="w-5 h-5" />;
      case 'bitcoin-os': return <FaRocket className="w-5 h-5" />;
      case 'zerodice': return <FaGamepad className="w-5 h-5" />;
      default: return <FaCog className="w-5 h-5" />;
    }
  };

  const getProjectColor = (color: string) => {
    const colors = {
      pink: 'from-pink-500 to-purple-600',
      orange: 'from-orange-500 to-yellow-600',
      blue: 'from-blue-500 to-cyan-600',
      purple: 'from-purple-500 to-indigo-600',
      red: 'from-red-500 to-pink-600',
      yellow: 'from-yellow-500 to-orange-600',
      indigo: 'from-indigo-500 to-purple-600'
    };
    return colors[color as keyof typeof colors] || 'from-gray-500 to-gray-600';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'inactive': return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
      case 'maintenance': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getJobStatusIcon = (status: AutomationJob['status']) => {
    switch (status) {
      case 'success': return <FaCheckCircle className="w-4 h-4 text-green-400" />;
      case 'failed': return <FaExclamationTriangle className="w-4 h-4 text-red-400" />;
      case 'running': return <FaSyncAlt className="w-4 h-4 text-blue-400 animate-spin" />;
      default: return <FaPlay className="w-4 h-4 text-yellow-400" />;
    }
  };

  const filteredJobs = selectedProject 
    ? jobs.filter(job => job.project === selectedProject)
    : jobs;

  const totalStats = {
    totalProjects: projects.length,
    activeProjects: projects.filter(p => p.status === 'active').length,
    totalJobs: jobs.length,
    activeJobs: jobs.filter(j => j.active).length,
    runningJobs: jobs.filter(j => j.status === 'running').length
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="pt-8 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-cyan-500 to-teal-500 bg-clip-text text-transparent">
              Central Automation Dashboard
            </h1>
            <p className="text-gray-400">
              Master control for all Oracle server automations across your project portfolio
            </p>
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-gradient-to-r from-blue-900/50 to-blue-800/30 border border-blue-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-300 text-sm font-medium">Total Projects</p>
                  <p className="text-2xl font-bold text-blue-100">{totalStats.totalProjects}</p>
                </div>
                <FaServer className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-900/50 to-green-800/30 border border-green-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-300 text-sm font-medium">Active Projects</p>
                  <p className="text-2xl font-bold text-green-100">{totalStats.activeProjects}</p>
                </div>
                <FaCheckCircle className="w-6 h-6 text-green-400" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-900/50 to-purple-800/30 border border-purple-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-300 text-sm font-medium">Total Jobs</p>
                  <p className="text-2xl font-bold text-purple-100">{totalStats.totalJobs}</p>
                </div>
                <FaBolt className="w-6 h-6 text-purple-400" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-cyan-900/50 to-cyan-800/30 border border-cyan-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-cyan-300 text-sm font-medium">Active Jobs</p>
                  <p className="text-2xl font-bold text-cyan-100">{totalStats.activeJobs}</p>
                </div>
                <FaPlay className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-yellow-900/50 to-yellow-800/30 border border-yellow-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-300 text-sm font-medium">Running Now</p>
                  <p className="text-2xl font-bold text-yellow-100">{totalStats.runningJobs}</p>
                </div>
                <FaSyncAlt className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
          </div>

          {/* Projects Grid */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FaServer className="text-blue-400" />
              Project Portfolio
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div 
                  key={project.id}
                  className={`bg-gray-900/50 border border-gray-700 rounded-lg p-6 hover:border-gray-600 transition-all cursor-pointer ${
                    selectedProject === project.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedProject(selectedProject === project.id ? null : project.id)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`bg-gradient-to-r ${getProjectColor(project.color)} p-2 rounded-lg`}>
                      {getProjectIcon(project.id)}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-1">{project.name}</h3>
                  <p className="text-gray-400 text-sm mb-4">{project.domain}</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Total Jobs:</span>
                      <span className="text-white font-medium">{project.stats.totalJobs}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Active Jobs:</span>
                      <span className="text-green-400 font-medium">{project.stats.activeJobs}</span>
                    </div>
                    {project.stats.lastRun && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Last Run:</span>
                        <span className="text-gray-300">{new Date(project.stats.lastRun).toLocaleTimeString()}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 flex flex-wrap gap-2">
                    {project.automations.twitter && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded">
                        <FaTwitter className="w-3 h-3" />
                        Twitter
                      </span>
                    )}
                    {project.automations.video && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded">
                        <FaVideo className="w-3 h-3" />
                        Video
                      </span>
                    )}
                    {project.automations.replies && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded">
                        <FaComments className="w-3 h-3" />
                        Replies
                      </span>
                    )}
                    {project.automations.custom.length > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-500/20 text-orange-300 text-xs rounded">
                        <FaCog className="w-3 h-3" />
                        +{project.automations.custom.length}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Jobs Table */}
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg overflow-hidden">
            <div className="p-6 border-b border-gray-700 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <FaBolt className="text-yellow-400" />
                  {selectedProject ? `${projects.find(p => p.id === selectedProject)?.name} Jobs` : 'All Automation Jobs'}
                </h2>
                {selectedProject && (
                  <button
                    onClick={() => setSelectedProject(null)}
                    className="text-sm text-blue-400 hover:text-blue-300 mt-1"
                  >
                    ← Back to all projects
                  </button>
                )}
              </div>
              
              <div className="flex gap-2">
                <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-all duration-200">
                  <FaPlus className="w-4 h-4" />
                  Add Job
                </button>
                <button className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-all duration-200">
                  <FaSyncAlt className="w-4 h-4" />
                  Refresh
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Job</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Project</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Schedule</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Next Run</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-900/50 divide-y divide-gray-700">
                  {filteredJobs.map((job) => {
                    const project = projects.find(p => p.id === job.project);
                    return (
                      <tr key={job.id} className="hover:bg-gray-800/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8">
                              {job.type === 'twitter' && <FaTwitter className="h-5 w-5 text-blue-400" />}
                              {job.type === 'video' && <FaVideo className="h-5 w-5 text-purple-400" />}
                              {job.type === 'custom' && <FaCog className="h-5 w-5 text-orange-400" />}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-100">{job.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r ${getProjectColor(project?.color || 'gray')} text-white`}>
                            {getProjectIcon(job.project)}
                            {project?.name}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium bg-gray-700 text-gray-300 rounded capitalize">
                            {job.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {job.schedule}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1">
                            {getJobStatusIcon(job.status)}
                            <span className="text-sm capitalize">{job.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {job.nextRun ? new Date(job.nextRun).toLocaleString() : 'Not scheduled'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              className={`${job.active 
                                ? 'text-red-400 hover:text-red-300' 
                                : 'text-green-400 hover:text-green-300'
                              } transition-colors`}
                              title={job.active ? 'Pause job' : 'Start job'}
                            >
                              {job.active ? <FaPause className="w-4 h-4" /> : <FaPlay className="w-4 h-4" />}
                            </button>
                            <button className="text-blue-400 hover:text-blue-300 transition-colors" title="View logs">
                              <FaEye className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}