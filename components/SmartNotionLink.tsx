'use client';

import { useAuth } from './Providers';
import useUserRole from '@/lib/hooks/useUserRole';
import { portfolioData } from '@/lib/data';

interface SmartNotionLinkProps {
  project: {
    notionUrl?: string;
    notionDatabaseUrl?: string;
    title: string;
  };
  className?: string;
  title?: string;
  children: React.ReactNode;
}

export default function SmartNotionLink({ project, className, title, children }: SmartNotionLinkProps) {
  const { session } = useAuth();
  const { roleData } = useUserRole();

  // Determine which Notion URL to use based on user context
  const getNotionUrl = () => {
    // If user is authenticated and has admin-like role, show database
    if (session?.user && roleData) {
      const adminRoles = ['Business Strategist', 'Connector / Networker'];
      if (adminRoles.includes(roleData.title)) {
        return project.notionDatabaseUrl || portfolioData.notion.database;
      }
    }

    // Default to projects page for public users and other roles
    return project.notionUrl || portfolioData.notion.projectsPage;
  };

  // Get appropriate title based on user context
  const getLinkTitle = () => {
    if (title) return title;
    
    if (session?.user && roleData) {
      const adminRoles = ['Business Strategist', 'Connector / Networker'];
      if (adminRoles.includes(roleData.title)) {
        return `Manage ${project.title} in Database`;
      }
    }
    
    return `View ${project.title} Documentation`;
  };

  const notionUrl = getNotionUrl();
  
  // Don't render if no URL available
  if (!notionUrl || notionUrl === '#') return null;

  return (
    <a
      href={notionUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      title={getLinkTitle()}
    >
      {children}
    </a>
  );
} 