'use client';

import { useAuth } from './Providers';
import useUserRole from '@/lib/hooks/useUserRole';
import { portfolioData } from '@/lib/data';
import { FaDatabase, FaProjectDiagram, FaExternalLinkAlt, FaLock } from 'react-icons/fa';

export default function UserNotionAccess() {
  const { session } = useAuth();
  const { roleData, hasRole } = useUserRole();

  if (!session?.user) return null;

  const getAccessLevel = () => {
    if (!hasRole()) return 'guest';
    
    const adminRoles = ['Business Strategist', 'Connector / Networker'];
    const managerRoles = ['Social Media Manager', 'Community Builder'];
    
    if (adminRoles.includes(roleData?.title || '')) return 'admin';
    if (managerRoles.includes(roleData?.title || '')) return 'manager';
    return 'user';
  };

  const accessLevel = getAccessLevel();

  return (
    <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 mb-4">
      <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
        <FaProjectDiagram className="text-blue-400" />
        Your Notion Access
      </h3>

      <div className="space-y-3">
        {/* Projects Page - Available to all authenticated users */}
        <div className="flex items-center justify-between bg-gray-700 rounded p-3">
          <div className="flex items-center gap-3">
            <FaProjectDiagram className="text-green-400" />
            <div>
              <div className="font-medium text-white">Project Documentation</div>
              <div className="text-sm text-gray-300">View project details and case studies</div>
            </div>
          </div>
          <a
            href={portfolioData.notion.projectsPage}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
          >
            Access <FaExternalLinkAlt size={10} />
          </a>
        </div>

        {/* Database Access - Role-based */}
        <div className="flex items-center justify-between bg-gray-700 rounded p-3">
          <div className="flex items-center gap-3">
            <FaDatabase className={accessLevel === 'admin' ? 'text-blue-400' : 'text-gray-500'} />
            <div>
              <div className="font-medium text-white flex items-center gap-2">
                Database Management
                {accessLevel !== 'admin' && <FaLock size={12} className="text-gray-500" />}
              </div>
              <div className="text-sm text-gray-300">
                {accessLevel === 'admin' 
                  ? 'Full CRM and project management access'
                  : 'Admin access required'
                }
              </div>
            </div>
          </div>
          {accessLevel === 'admin' ? (
            <a
              href={portfolioData.notion.database}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
            >
              Access <FaExternalLinkAlt size={10} />
            </a>
          ) : (
            <button
              disabled
              className="bg-gray-600 text-gray-400 px-3 py-1 rounded text-sm cursor-not-allowed"
            >
              Restricted
            </button>
          )}
        </div>
      </div>

      {/* Role Information */}
      <div className="mt-4 pt-3 border-t border-gray-600">
        <div className="text-sm text-gray-300">
          <strong>Current Role:</strong> {roleData?.title || 'No role selected'} 
          {accessLevel === 'admin' && (
            <span className="ml-2 bg-blue-900 text-blue-200 px-2 py-1 rounded text-xs">
              Admin Access
            </span>
          )}
        </div>
      </div>
    </div>
  );
} 