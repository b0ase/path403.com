'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/Providers';
import {
  FiFolder,
  FiGlobe,
  FiServer,
  FiDollarSign,
  FiExternalLink,
  FiEdit2,
  FiPlus,
  FiArrowLeft
} from 'react-icons/fi';
import { portfolioData, Project as PortfolioProject } from '@/lib/data';

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
}

export default function ProjectsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      // Load projects data
      loadProjects();
    }
  }, [loading, user, router]);

  const loadProjects = async () => {
    setIsLoading(false);

    // Map portfolio data to the dashboard Project interface
    const projectsList: Project[] = (portfolioData.projects as PortfolioProject[]).map(p => {
      // Map status
      let status: Project['status'] = 'active';
      const s = p.status.toLowerCase();
      if (s.includes('live') || s.includes('active')) status = 'active';
      else if (s.includes('paused')) status = 'paused';
      else if (s.includes('sold')) status = 'sold';
      else if (s.includes('development') || s.includes('concept') || s.includes('progress')) status = 'development';

      // Map domain
      const domain = p.liveUrl 
        ? p.liveUrl.replace(/^https?:\/\//, '').split('/')[0] 
        : `${p.slug}.com`;

      return {
        id: p.slug,
        name: p.title,
        domain: domain,
        status: status,
        tech_stack: p.tech || [],
        oracle_server: (p.tech || []).some(t => t.toLowerCase().includes('node') || t.toLowerCase().includes('server')),
        revenue: 0,
        created_at: '2024-01-01', // Default since not in data.ts
        description: p.description
      };
    });

    setProjects(projectsList);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500';
      case 'paused': return 'text-yellow-500';
      case 'sold': return 'text-blue-500';
      case 'development': return 'text-gray-500';
      default: return 'text-gray-500';
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white font-mono text-sm">LOADING PROJECTS...</div>
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
              <h1 className="text-2xl font-bold mb-2">PROJECT MANAGEMENT</h1>
              <p className="text-sm text-gray-500">SYSTEM PROJECTS OVERVIEW</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors"
              >
                <FiArrowLeft size={14} />
                <span>BACK</span>
              </button>
              <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors">
                <FiPlus size={14} />
                <span>NEW PROJECT</span>
              </button>
            </div>
          </div>
        </header>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          <div>
            <p className="text-2xl font-bold mb-1">{projects.length}</p>
            <p className="text-xs text-gray-500">TOTAL PROJECTS</p>
          </div>
          <div>
            <p className="text-2xl font-bold mb-1">{projects.filter(p => p.status === 'active').length}</p>
            <p className="text-xs text-gray-500">ACTIVE</p>
          </div>
          <div>
            <p className="text-2xl font-bold mb-1">{projects.filter(p => p.oracle_server).length}</p>
            <p className="text-xs text-gray-500">ORACLE SERVERS</p>
          </div>
          <div>
            <p className="text-2xl font-bold mb-1">${projects.reduce((sum, p) => sum + (p.revenue || 0), 0).toLocaleString()}</p>
            <p className="text-xs text-gray-500">TOTAL REVENUE</p>
          </div>
        </div>

        {/* Projects List */}
        <div className="mb-12">
          <h2 className="text-sm text-gray-500 mb-6">ACTIVE PROJECTS</h2>
          <div className="space-y-2">
            {projects.map((project, index) => (
              <div
                key={project.id}
                className="group border-b border-gray-900 hover:border-gray-700 transition-all"
              >
                <div className="py-6 flex items-center justify-between">
                  <div className="flex items-center gap-8">
                    <span className="text-xs text-gray-600 w-8">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="text-lg font-medium">
                          {project.name.toUpperCase()}
                        </h3>
                        <span className={`text-xs ${getStatusColor(project.status)}`}>
                          [{project.status.toUpperCase()}]
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mb-3">
                        {project.domain}
                      </p>
                      <p className="text-sm text-gray-400 mb-3 max-w-2xl">
                        {project.description}
                      </p>
                      <div className="flex items-center gap-6 text-xs">
                        {project.oracle_server && (
                          <span className="text-gray-500">
                            <FiServer className="inline mr-1" size={12} />
                            ORACLE
                          </span>
                        )}
                        {project.client && (
                          <span className="text-gray-500">
                            CLIENT: {project.client.toUpperCase()}
                          </span>
                        )}
                        {project.revenue && project.revenue > 0 && (
                          <span className="text-gray-500">
                            <FiDollarSign className="inline mr-1" size={12} />
                            ${project.revenue.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-gray-600">STACK</p>
                      <p className="text-sm">
                        {project.tech_stack.length} TOOLS
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`https://${project.domain}`, '_blank');
                        }}
                        className="p-2 text-gray-600 hover:text-white transition-colors"
                      >
                        <FiExternalLink size={14} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/dashboard/projects/${project.id}`);
                        }}
                        className="p-2 text-gray-600 hover:text-white transition-colors"
                      >
                        <FiEdit2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-16">
          <h2 className="text-sm text-gray-500 mb-6">QUICK ACTIONS</h2>
          <div className="flex gap-8">
            <button
              onClick={() => router.push('/dashboard/servers/oracle')}
              className="text-sm text-gray-500 hover:text-white transition-colors"
            >
              [ORACLE SERVER SSH]
            </button>
            <button className="text-sm text-gray-500 hover:text-white transition-colors">
              [DATABASE ADMIN]
            </button>
            <button className="text-sm text-gray-500 hover:text-white transition-colors">
              [ANALYTICS OVERVIEW]
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}