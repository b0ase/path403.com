'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/Providers';
import { 
  FiArrowLeft,
  FiServer,
  FiTerminal,
  FiCpu,
  FiHardDrive,
  FiRefreshCw,
  FiAlertTriangle
} from 'react-icons/fi';

interface ServerInstance {
  id: string;
  name: string;
  project: string;
  status: 'running' | 'stopped' | 'maintenance' | 'error';
  cpu: number;
  memory: number;
  disk: number;
  uptime: string;
  location: string;
  ip: string;
  lastActivity: string;
  processes: number;
}

export default function OracleServersPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [selectedServer, setSelectedServer] = useState<string | null>(null);
  const [serverInstances, setServerInstances] = useState<ServerInstance[]>([]);
  const [error, setError] = useState<string | null>(null);

  const overallStats = {
    totalServers: serverInstances.length,
    runningServers: serverInstances.filter(s => s.status === 'running').length,
    avgCpu: Math.round(serverInstances.reduce((acc, s) => acc + s.cpu, 0) / serverInstances.length),
    totalProcesses: serverInstances.reduce((acc, s) => acc + s.processes, 0)
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }
    
    if (user) {
      // Load real server data
      loadRealServerData();
    }
  }, [loading, user, router]);

  const loadRealServerData = async () => {
    try {
      console.log('Loading real Oracle server data...');
      setError(null);
      
      // Get real server stats from our API
      const response = await fetch('/api/oracle-server/stats');
      const result = await response.json();
      
      if (result.success) {
        const realStats = result.data;
        console.log('Real server stats:', realStats);
        
        // Convert real server data to our interface format
        const realServer: ServerInstance = {
          id: 'zerodice',
          name: 'Zero Dice Production',
          project: 'zerodice',
          status: realStats.status === 'connection_error' ? 'error' : 'running',
          cpu: parseFloat(realStats.cpu) || 0,
          memory: parseFloat(realStats.memory) || 0,
          disk: parseFloat(realStats.disk) || 0,
          uptime: realStats.uptime || 'Unknown',
          location: realStats.location,
          ip: realStats.ip,
          lastActivity: 'Live data',
          processes: parseInt(realStats.processes) || 0
        };
        
        setServerInstances([realServer]);
        
        if (realStats.error_message) {
          setError(`Warning: ${realStats.error_message}`);
        }
      } else {
        console.error('Failed to load server stats:', result.error);
        setError(`Failed to connect to Oracle server: ${result.error}`);
        
        // Use fallback data to show connection error
        setServerInstances([{
          id: 'zerodice',
          name: 'Zero Dice Production',
          project: 'zerodice',
          status: 'error',
          cpu: 0,
          memory: 0,
          disk: 0,
          uptime: 'Connection failed',
          location: 'Oracle Cloud - US West',
          ip: '129.213.161.247',
          lastActivity: 'Connection error',
          processes: 0
        }]);
      }
      
      setIsLoading(false);
    } catch (error: any) {
      console.error('Error loading server data:', error);
      setError(`Error loading server data: ${error.message}`);
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-green-500';
      case 'stopped': return 'text-red-500';
      case 'maintenance': return 'text-yellow-500';
      case 'error': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white font-mono text-sm">LOADING ORACLE SERVERS...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-mono">
      <div className="w-full px-8 py-8">
        {/* Header */}
        <header className="mb-16">
          <div className="flex justify-between items-start mb-12">
            <div>
              <h1 className="text-2xl font-bold mb-2">ORACLE CLOUD SERVERS</h1>
              <p className="text-sm text-gray-500">LIVE SYSTEM MONITORING</p>
              {error && (
                <div className="mt-4 text-sm text-red-500">
                  <FiAlertTriangle className="inline mr-2" size={14} />
                  {error.toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard/projects')}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors"
              >
                <FiArrowLeft size={14} />
                <span>BACK</span>
              </button>
              <button
                onClick={loadRealServerData}
                disabled={isLoading}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors disabled:opacity-50"
              >
                <FiRefreshCw className={isLoading ? 'animate-spin' : ''} size={14} />
                <span>{isLoading ? 'LOADING...' : 'REFRESH'}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Overall Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          <div>
            <p className="text-2xl font-bold mb-1">{overallStats.totalServers}</p>
            <p className="text-xs text-gray-500">TOTAL SERVERS</p>
          </div>
          <div>
            <p className="text-2xl font-bold mb-1">{overallStats.runningServers}</p>
            <p className="text-xs text-gray-500">RUNNING</p>
          </div>
          <div>
            <p className="text-2xl font-bold mb-1">{overallStats.avgCpu}%</p>
            <p className="text-xs text-gray-500">AVG CPU</p>
          </div>
          <div>
            <p className="text-2xl font-bold mb-1">{overallStats.totalProcesses}</p>
            <p className="text-xs text-gray-500">PROCESSES</p>
          </div>
        </div>

        {/* Server Instances */}
        <main>
          <div className="mb-12">
            <h2 className="text-sm text-gray-500 mb-6">SERVER INSTANCES</h2>
            <div className="space-y-2">
              {serverInstances.map((server, index) => (
                <div
                  key={server.id}
                  className="group border-b border-gray-900 hover:border-gray-700 transition-all"
                >
                  <div className="py-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-8">
                        <span className="text-xs text-gray-600 w-8">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-2">
                            <h3 className="text-lg font-medium">
                              {server.name.toUpperCase()}
                            </h3>
                            <span className={`text-xs ${getStatusColor(server.status)}`}>
                              [{server.status.toUpperCase()}]
                            </span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm mb-4">
                            <div>
                              <span className="text-xs text-gray-600">PROJECT</span>
                              <p>{server.project.toUpperCase()}</p>
                            </div>
                            <div>
                              <span className="text-xs text-gray-600">IP ADDRESS</span>
                              <p className="font-mono">{server.ip}</p>
                            </div>
                            <div>
                              <span className="text-xs text-gray-600">UPTIME</span>
                              <p>{server.uptime}</p>
                            </div>
                            <div>
                              <span className="text-xs text-gray-600">PROCESSES</span>
                              <p>{server.processes}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-6 text-sm">
                            <div>
                              <div className="flex justify-between mb-1">
                                <span className="text-xs text-gray-600">CPU</span>
                                <span>{server.cpu}%</span>
                              </div>
                              <div className="h-1 bg-gray-900">
                                <div className="h-1 bg-gray-600" style={{ width: `${server.cpu}%` }}></div>
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between mb-1">
                                <span className="text-xs text-gray-600">MEMORY</span>
                                <span>{server.memory}%</span>
                              </div>
                              <div className="h-1 bg-gray-900">
                                <div className="h-1 bg-gray-600" style={{ width: `${server.memory}%` }}></div>
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between mb-1">
                                <span className="text-xs text-gray-600">DISK</span>
                                <span>{server.disk}%</span>
                              </div>
                              <div className="h-1 bg-gray-900">
                                <div className="h-1 bg-gray-600" style={{ width: `${server.disk}%` }}></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <button 
                          onClick={() => router.push(`/dashboard/servers/oracle/${server.id}`)}
                          className="text-sm text-gray-500 hover:text-white transition-colors"
                        >
                          [DETAILS]
                        </button>
                        <button className="text-sm text-gray-500 hover:text-white transition-colors">
                          <FiTerminal size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SSH Access */}
          <div className="mt-16">
            <h2 className="text-sm text-gray-500 mb-6">SSH ACCESS</h2>
            <div className="mb-8">
              <p className="text-xs text-gray-600 mb-2">PRIMARY CONNECTION</p>
              <code className="block bg-black border border-gray-900 p-3 text-sm">
                ssh -i ~/Downloads/ssh-key-2025-12-11.key opc@129.213.161.247
              </code>
            </div>
            <div className="flex gap-8">
              <button className="text-sm text-gray-500 hover:text-white transition-colors">
                [CONNECT TO PRIMARY]
              </button>
              <button className="text-sm text-gray-500 hover:text-white transition-colors">
                [DOWNLOAD LOGS]
              </button>
              <button className="text-sm text-gray-500 hover:text-white transition-colors">
                [PERFORMANCE REPORT]
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}