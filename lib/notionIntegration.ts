import { portfolioData } from './data';

export interface NotionAccessLevel {
  canAccessProjects: boolean;
  canAccessDatabase: boolean;
  accessLevel: 'guest' | 'user' | 'manager' | 'admin';
}

export const getNotionAccessLevel = (
  isAuthenticated: boolean,
  userRole?: string
): NotionAccessLevel => {
  if (!isAuthenticated) {
    return {
      canAccessProjects: false,
      canAccessDatabase: false,
      accessLevel: 'guest'
    };
  }

  const adminRoles = ['Business Strategist', 'Connector / Networker'];
  const managerRoles = ['Social Media Manager', 'Community Builder'];

  if (userRole && adminRoles.includes(userRole)) {
    return {
      canAccessProjects: true,
      canAccessDatabase: true,
      accessLevel: 'admin'
    };
  }

  if (userRole && managerRoles.includes(userRole)) {
    return {
      canAccessProjects: true,
      canAccessDatabase: false,
      accessLevel: 'manager'
    };
  }

  return {
    canAccessProjects: true,
    canAccessDatabase: false,
    accessLevel: 'user'
  };
};

export const getNotionUrl = (
  type: 'projects' | 'database',
  projectSlug?: string,
  clientFilter?: string
): string => {
  const baseUrl = type === 'projects' 
    ? portfolioData.notion.projectsPage 
    : portfolioData.notion.database;

  // Add filters if specified
  const params = new URLSearchParams();
  
  if (projectSlug && type === 'projects') {
    params.append('project', projectSlug);
  }
  
  if (clientFilter && type === 'database') {
    params.append('client', clientFilter);
  }

  const paramString = params.toString();
  return paramString ? `${baseUrl}&${paramString}` : baseUrl;
};

export const generateClientNotionAccess = (
  clientId: string,
  projectSlugs: string[]
) => {
  return {
    projectsUrl: getNotionUrl('projects', undefined, clientId),
    allowedProjects: projectSlugs,
    accessType: 'client' as const
  };
};

export const generateAdminNotionAccess = () => {
  return {
    projectsUrl: portfolioData.notion.projectsPage,
    databaseUrl: portfolioData.notion.database,
    accessType: 'admin' as const
  };
};

// Integration tracking for analytics
export const trackNotionAccess = (
  userId: string,
  accessType: 'projects' | 'database',
  userRole?: string
) => {
  // This would integrate with your analytics system
  console.log('Notion Access:', {
    userId,
    accessType,
    userRole,
    timestamp: new Date().toISOString()
  });
}; 