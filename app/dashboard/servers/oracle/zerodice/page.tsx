'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/Providers';
import { 
  FaArrowLeft,
  FaServer,
  FaTerminal,
  FaChartLine,
  FaDatabase,
  FaMicrochip,
  FaHdd,
  FaNetworkWired,
  FaShieldAlt,
  FaPlay,
  FaPause,
  FaStop,
  FaSync,
  FaDownload,
  FaUpload,
  FaClock,
  FaExclamationTriangle,
  FaCheckCircle,
  FaEye,
  FaEdit,
  FaCog,
  FaBolt,
  FaFileAlt,
  FaCode,
  FaMusic,
  FaVideo,
  FaFolder,
  FaCloudUploadAlt
} from 'react-icons/fa';

interface ProcessInfo {
  name: string;
  pid: number;
  cpu: number;
  memory: number;
  status: 'running' | 'stopped' | 'error';
  uptime: string;
}

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warning' | 'error';
  service: string;
  message: string;
}

export default function ZeroDiceServerPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [serverStats, setServerStats] = useState<any>(null);
  const [processes, setProcesses] = useState<ProcessInfo[]>([]);
  const [recentLogs, setRecentLogs] = useState<LogEntry[]>([]);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const directoryStructure = [
    { path: '/var/www/zerodice-store', type: 'folder', size: '2.4GB', modified: '2 hours ago' },
    { path: '/var/www/zerodice-server', type: 'folder', size: '892MB', modified: '1 day ago' },
    { path: '/opt/zerodice-automation', type: 'folder', size: '156MB', modified: '5 hours ago' },
    { path: '/etc/nginx/sites-available/zerodice', type: 'file', size: '4KB', modified: '15 days ago' },
    { path: '/var/log/zerodice', type: 'folder', size: '234MB', modified: '1 minute ago' },
    { path: '/home/opc/zerodice-backup', type: 'folder', size: '8.2GB', modified: '1 day ago' },
    { path: '/home/opc/uploads/music', type: 'folder', size: '45.3GB', modified: '3 hours ago' },
    { path: '/home/opc/uploads/videos', type: 'folder', size: '12.7GB', modified: '6 hours ago' }
  ];

  // Fetch real server data
  const loadServerData = async () => {
    try {
      setStatsError(null);
      
      // Fetch server stats and processes in parallel
      const [statsResponse, processesResponse] = await Promise.all([
        fetch('/api/oracle-server/stats'),
        fetch('/api/oracle-server/processes')
      ]);
      
      const statsResult = await statsResponse.json();
      const processesResult = await processesResponse.json();
      
      if (statsResult.success) {
        const realStats = statsResult.data;
        setServerStats({
          status: realStats.status === 'connection_error' ? 'error' : 'running',
          uptime: realStats.uptime || 'Unknown',
          cpu: parseFloat(realStats.cpu) || 0,
          memory: parseFloat(realStats.memory) || 0,
          disk: parseFloat(realStats.disk) || 0,
          network: {
            inbound: 'Live data',
            outbound: 'Live data'
          },
          processes: parseInt(realStats.processes) || 0,
          activeConnections: parseInt(realStats.connections) || 0,
          lastRestart: 'Check uptime',
          load: realStats.load || 0
        });
        
        if (realStats.error_message) {
          setStatsError(`Warning: ${realStats.error_message}`);
        }
      } else {
        setStatsError(`Failed to load server stats: ${statsResult.error}`);
        setServerStats({
          status: 'error',
          uptime: 'Connection failed',
          cpu: 0,
          memory: 0,
          disk: 0,
          network: { inbound: 'N/A', outbound: 'N/A' },
          processes: 0,
          activeConnections: 0,
          lastRestart: 'Unknown'
        });
      }
      
      if (processesResult.success && processesResult.data) {
        // Convert real process data to our interface - limit to top 8 processes
        const realProcesses = processesResult.data.slice(0, 8).map((proc: any) => ({
          name: proc.command ? proc.command.split(' ')[0].split('/').pop() : 'Unknown',
          pid: proc.pid,
          cpu: parseFloat(proc.cpu) || 0,
          memory: parseFloat(proc.memory) || 0,
          status: 'running' as const,
          uptime: proc.time || 'Unknown'
        }));
        setProcesses(realProcesses);
      } else {
        console.error('Failed to load processes:', processesResult.error);
        setProcesses([]);
      }
      
      // Generate logs based on real data
      const mockLogs: LogEntry[] = [
        { 
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19), 
          level: 'info', 
          service: 'monitoring', 
          message: `Server stats refreshed: CPU ${statsResult.data?.cpu || 0}%, Memory ${statsResult.data?.memory || 0}%` 
        },
        { 
          timestamp: new Date(Date.now() - 60000).toISOString().replace('T', ' ').substring(0, 19), 
          level: processesResult.data?.length > 100 ? 'warning' : 'info', 
          service: 'system', 
          message: `${processesResult.data?.length || 0} processes running` 
        },
        {
          timestamp: new Date(Date.now() - 120000).toISOString().replace('T', ' ').substring(0, 19),
          level: statsResult.data?.disk > 80 ? 'warning' : 'info',
          service: 'disk',
          message: `Disk usage: ${statsResult.data?.disk || 0}%`
        }
      ];
      setRecentLogs(mockLogs);
      
    } catch (error: any) {
      console.error('Error loading server data:', error);
      setStatsError(`Error loading server data: ${error.message}`);
      setServerStats({
        status: 'error',
        uptime: 'Connection failed',
        cpu: 0,
        memory: 0,
        disk: 0,
        network: { inbound: 'N/A', outbound: 'N/A' },
        processes: 0,
        activeConnections: 0,
        lastRestart: 'Unknown'
      });
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }
    
    if (user) {
      // Load real server data after auth
      loadServerData().then(() => setIsLoading(false));
    }
  }, [loading, user, router]);
  
  // Auto-refresh every 30 seconds if enabled
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      loadServerData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const getLogColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      default: return 'text-green-400';
    }
  };

  const getFileIcon = (type: string, path: string) => {
    if (type === 'folder') return FaFolder;
    if (path.includes('nginx')) return FaServer;
    if (path.includes('.js') || path.includes('.ts')) return FaCode;
    if (path.includes('music')) return FaMusic;
    if (path.includes('video')) return FaVideo;
    return FaFileAlt;
  };

  if (loading || isLoading || !serverStats) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p>Connecting to Zero Dice server...</p>
        </div>
      </div>
    );
  }

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
              onClick={() => router.push('/dashboard/servers/oracle')}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              <FaArrowLeft />
            </button>
            <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-xl flex items-center justify-center">
              <FaMusic className="text-2xl text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold" style={{ 
                  fontFamily: 'Bangers, cursive',
                  textShadow: '0 0 20px #00d4ff'
                }}>
                  ZERO DICE SERVER
                </h1>
                <div className={`px-3 py-1 rounded-lg border text-sm font-medium flex items-center gap-1 ${
                  serverStats.status === 'running' 
                    ? 'bg-green-900/50 border-green-500 text-green-200' 
                    : 'bg-red-900/50 border-red-500 text-red-200'
                }`}>
                  <FaCheckCircle className="text-xs" />
                  {serverStats.status}
                </div>
              </div>
              <p className="text-cyan-300 text-lg">129.213.161.247 • Oracle Cloud US West • Live Monitoring</p>
              {statsError && (
                <div className="mt-2 text-red-400 text-sm bg-red-900/20 border border-red-700 rounded px-3 py-1">
                  {statsError}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={loadServerData}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                <FaSync className="text-xs" />
                Refresh
              </button>
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  autoRefresh ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                {autoRefresh ? <FaCheckCircle className="text-xs" /> : <FaClock className="text-xs" />}
                {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
              </button>
            </div>
          </div>

          {/* Server Navigation */}
          <div className="flex gap-2 flex-wrap">
            {['overview', 'processes', 'logs', 'filesystem', 'monitoring', 'terminal'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
                  activeTab === tab 
                    ? 'bg-cyan-600 text-white' 
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Server Stats Overview */}
        {activeTab === 'overview' && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
            >
              <div className="bg-gradient-to-br from-gray-900/50 to-black border border-cyan-400/30 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <FaMicrochip className="text-2xl text-cyan-400" />
                  <div>
                    <h3 className="text-2xl font-bold">{serverStats.cpu}%</h3>
                    <p className="text-gray-400">CPU Usage</p>
                  </div>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full" 
                    style={{ width: `${serverStats.cpu}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-900/50 to-black border border-purple-400/30 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <FaDatabase className="text-2xl text-purple-400" />
                  <div>
                    <h3 className="text-2xl font-bold">{serverStats.memory}%</h3>
                    <p className="text-gray-400">Memory</p>
                  </div>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-400 to-pink-500 h-2 rounded-full" 
                    style={{ width: `${serverStats.memory}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-900/50 to-black border border-yellow-400/30 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <FaHdd className="text-2xl text-yellow-400" />
                  <div>
                    <h3 className="text-2xl font-bold">{serverStats.disk}%</h3>
                    <p className="text-gray-400">Disk Usage</p>
                  </div>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full" 
                    style={{ width: `${serverStats.disk}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-900/50 to-black border border-green-400/30 rounded-xl p-6">
                <div className="flex items-center gap-3">
                  <FaNetworkWired className="text-2xl text-green-400" />
                  <div>
                    <h3 className="text-xl font-bold">{serverStats.activeConnections}</h3>
                    <p className="text-gray-400">Active Connections</p>
                    <p className="text-xs text-gray-500 mt-1">↓ {serverStats.network.inbound} ↑ {serverStats.network.outbound}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Additional Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
            >
              <div className="bg-gradient-to-br from-gray-900/50 to-black border border-cyan-400/30 rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <FaClock className="text-cyan-400" />
                  System Information
                </h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Uptime:</span>
                    <span className="text-white">{serverStats.uptime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Last Restart:</span>
                    <span className="text-white">{serverStats.lastRestart}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Processes:</span>
                    <span className="text-white">{serverStats.processes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Load Average:</span>
                    <span className="text-white">{serverStats.load?.toFixed(2) || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Server Location:</span>
                    <span className="text-white">Oracle Cloud US West</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">IP Address:</span>
                    <span className="text-white font-mono">129.213.161.247</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-900/50 to-black border border-purple-400/30 rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <FaBolt className="text-purple-400" />
                  Quick Actions
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  <button className="px-4 py-3 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                    <FaTerminal />
                    SSH Terminal
                  </button>
                  <button className="px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                    <FaSync />
                    Restart Services
                  </button>
                  <button className="px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                    <FaDownload />
                    Backup Database
                  </button>
                  <button className="px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                    <FaCloudUploadAlt />
                    Deploy Update
                  </button>
                  <button className="px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                    <FaShieldAlt />
                    Security Scan
                  </button>
                  <button className="px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                    <FaChartLine />
                    Performance Report
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}

        {/* Running Processes Tab */}
        {activeTab === 'processes' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-gray-900/50 to-black border border-cyan-400/30 rounded-xl p-6"
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <FaCog className="text-cyan-400" />
              Running Processes (Top {processes.length} by CPU)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {processes.map((process, index) => (
                <div 
                  key={index}
                  className="bg-gray-900 border border-gray-700 rounded-lg p-4 hover:border-cyan-400/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-cyan-300">{process.name}</h3>
                    <span className="text-xs text-gray-400">PID: {process.pid}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Uptime: {process.uptime}</span>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>CPU: {process.cpu}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-1">
                        <div 
                          className="bg-cyan-400 h-1 rounded-full" 
                          style={{ width: `${Math.min(process.cpu, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>MEM: {process.memory}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-1">
                        <div 
                          className="bg-purple-400 h-1 rounded-full" 
                          style={{ width: `${Math.min(process.memory, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button className="flex-1 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs">
                      <FaEye />
                    </button>
                    <button className="flex-1 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs">
                      <FaPause />
                    </button>
                    <button className="flex-1 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs">
                      <FaStop />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Recent Logs Tab */}
        {activeTab === 'logs' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-gray-900/50 to-black border border-cyan-400/30 rounded-xl p-6"
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <FaFileAlt className="text-cyan-400" />
              Recent Logs
            </h2>
            <div className="bg-black rounded-lg p-4 font-mono text-sm overflow-x-auto">
              {recentLogs.map((log, index) => (
                <div key={index} className="flex gap-4 mb-2 hover:bg-gray-900/50 px-2 py-1 rounded">
                  <span className="text-gray-500">{log.timestamp}</span>
                  <span className={`${getLogColor(log.level)} uppercase font-bold w-16`}>[{log.level}]</span>
                  <span className="text-purple-400">{log.service}:</span>
                  <span className="text-gray-300 flex-1">{log.message}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-sm font-medium transition-colors">
                View All Logs
              </button>
              <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors">
                Download Logs
              </button>
              <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors">
                Clear Old Logs
              </button>
            </div>
          </motion.div>
        )}

        {/* File System Tab */}
        {activeTab === 'filesystem' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-gray-900/50 to-black border border-cyan-400/30 rounded-xl p-6"
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <FaFolder className="text-cyan-400" />
              File System
            </h2>
            <div className="space-y-2">
              {directoryStructure.map((item, index) => {
                const Icon = getFileIcon(item.type, item.path);
                return (
                  <div 
                    key={index}
                    className="flex items-center justify-between bg-gray-900 border border-gray-700 rounded-lg p-3 hover:border-cyan-400/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={item.type === 'folder' ? 'text-yellow-400' : 'text-gray-400'} />
                      <span className="font-mono text-sm">{item.path}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>{item.size}</span>
                      <span>{item.modified}</span>
                      <button className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs">
                        <FaEye />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Monitoring Tab */}
        {activeTab === 'monitoring' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-gray-900/50 to-black border border-cyan-400/30 rounded-xl p-6"
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <FaChartLine className="text-cyan-400" />
              Performance Monitoring
            </h2>
            <div className="text-center py-12 text-gray-400">
              <FaChartLine className="text-6xl mx-auto mb-4 opacity-50" />
              <p className="text-lg">Real-time performance charts coming soon</p>
              <p className="text-sm mt-2">CPU, Memory, Network, and Disk I/O trends will be displayed here</p>
            </div>
          </motion.div>
        )}

        {/* Terminal Tab */}
        {activeTab === 'terminal' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-gray-900/50 to-black border border-cyan-400/30 rounded-xl p-6"
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <FaTerminal className="text-cyan-400" />
              SSH Terminal
            </h2>
            <div className="bg-black rounded-lg p-4">
              <div className="font-mono text-sm text-green-400 mb-2">
                opc@zerodice-oracle:~$ 
              </div>
              <div className="text-gray-400 text-center py-12">
                <FaTerminal className="text-6xl mx-auto mb-4 opacity-50" />
                <p>Web-based SSH terminal coming soon</p>
                <p className="text-sm mt-4">For now, use SSH directly:</p>
                <code className="block mt-2 bg-gray-900 p-3 rounded text-green-400">
                  ssh -i ~/Downloads/ssh-key-2025-12-11.key opc@129.213.161.247
                </code>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}