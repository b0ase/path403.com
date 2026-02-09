'use client';

import { portfolioData } from '@/lib/data';
import { FaDatabase, FaProjectDiagram, FaExternalLinkAlt } from 'react-icons/fa';

export default function AdminNotionDashboard() {
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 mb-6">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <FaProjectDiagram className="text-blue-400" />
        Notion Integration
      </h3>
      
      <p className="text-gray-300 mb-6">
        Manage your projects and clients through our integrated Notion workspace
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Projects Showcase */}
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <FaProjectDiagram className="text-green-400" size={20} />
            <h4 className="font-semibold text-white">Projects Showcase</h4>
          </div>
          <p className="text-gray-300 text-sm mb-4">
            Public project documentation and case studies
          </p>
          <a
            href={portfolioData.notion.projectsPage}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
          >
            Open Projects Page
            <FaExternalLinkAlt size={12} />
          </a>
        </div>

        {/* Database Management */}
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <FaDatabase className="text-blue-400" size={20} />
            <h4 className="font-semibold text-white">Database Management</h4>
          </div>
          <p className="text-gray-300 text-sm mb-4">
            Client CRM, project tracking, and team management
          </p>
          <a
            href={portfolioData.notion.database}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
          >
            Open Database
            <FaExternalLinkAlt size={12} />
          </a>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-6 pt-4 border-t border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">
              {portfolioData.projects.filter(p => p.type === 'domain').length}
            </div>
            <div className="text-gray-300">Domain Projects</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {portfolioData.projects.filter(p => p.type === 'github').length}
            </div>
            <div className="text-gray-300">Open Source</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">
              {portfolioData.projects.filter(p => p.type === 'client').length}
            </div>
            <div className="text-gray-300">Client Projects</div>
          </div>
        </div>
      </div>
    </div>
  );
} 