'use client';

import { portfolioData } from '@/lib/data';
import { FaProjectDiagram, FaExternalLinkAlt, FaUser } from 'react-icons/fa';

interface ClientNotionAccessProps {
  clientId?: string;
  projectSlugs?: string[];
}

export default function ClientNotionAccess({ clientId, projectSlugs = [] }: ClientNotionAccessProps) {
  
  const getClientSpecificProjectsUrl = () => {
    // If specific project slugs are provided, create a filtered view
    if (projectSlugs.length > 0) {
      const projectFilter = projectSlugs.join('|');
      return `${portfolioData.notion.projectsPage}&filter=${encodeURIComponent(projectFilter)}`;
    }
    
    // Otherwise, return the general projects page
    return portfolioData.notion.projectsPage;
  };

  return (
    <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 mb-4">
      <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
        <FaUser className="text-green-400" />
        Your Project Access
      </h3>

      <div className="space-y-3">
        {/* Client Project Documentation */}
        <div className="flex items-center justify-between bg-gray-700 rounded p-3">
          <div className="flex items-center gap-3">
            <FaProjectDiagram className="text-green-400" />
            <div>
              <div className="font-medium text-white">Your Projects</div>
              <div className="text-sm text-gray-300">
                {projectSlugs.length > 0 
                  ? `Access to ${projectSlugs.length} project${projectSlugs.length > 1 ? 's' : ''}`
                  : 'View your project documentation and updates'
                }
              </div>
            </div>
          </div>
          <a
            href={getClientSpecificProjectsUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
          >
            View Projects <FaExternalLinkAlt size={10} />
          </a>
        </div>
      </div>

      {/* Project List */}
      {projectSlugs.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-600">
          <div className="text-sm text-gray-300 mb-2">
            <strong>Your Projects:</strong>
          </div>
          <div className="flex flex-wrap gap-2">
            {projectSlugs.map((slug) => {
              const project = portfolioData.projects.find(p => p.slug === slug);
              return (
                <span 
                  key={slug}
                  className="bg-gray-700 text-gray-200 px-2 py-1 rounded text-xs"
                >
                  {project?.title || slug}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
} 