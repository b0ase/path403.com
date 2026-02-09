'use client';

import React from 'react';
import { 
  FaChartLine, 
  FaCode, 
  FaShare, 
  FaUserTie, 
  FaPalette, 
  FaBullhorn,
  FaHandshake,
  FaUsers,
  FaLightbulb
} from 'react-icons/fa';
import useUserRole from '@/lib/hooks/useUserRole';

interface RoleBadgeProps {
  showIcon?: boolean;
  showTitle?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function RoleBadge({ 
  showIcon = true, 
  showTitle = true, 
  size = 'md',
  className = ''
}: RoleBadgeProps) {
  const { userRole, roleData, hasRole, loading } = useUserRole();

  if (loading || !hasRole() || !roleData) {
    return null;
  }

  const getIconForRole = (roleId: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      investor: <FaChartLine />,
      builder: <FaCode />,
      social: <FaShare />,
      strategist: <FaUserTie />,
      creative: <FaPalette />,
      marketer: <FaBullhorn />,
      connector: <FaHandshake />,
      community: <FaUsers />
    };
    return iconMap[roleId] || <FaLightbulb />;
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'px-2 py-1 text-xs',
          icon: 'text-xs',
          text: 'text-xs'
        };
      case 'lg':
        return {
          container: 'px-4 py-2 text-lg',
          icon: 'text-lg',
          text: 'text-lg'
        };
      default:
        return {
          container: 'px-3 py-1.5 text-sm',
          icon: 'text-sm',
          text: 'text-sm'
        };
    }
  };

  const sizeClasses = getSizeClasses();
  const colorClass = roleData.color.replace('bg-', 'bg-').replace('-500', '-600');

  return (
    <div className={`inline-flex items-center gap-2 ${colorClass} text-white rounded-full font-medium ${sizeClasses.container} ${className}`}>
      {showIcon && (
        <span className={sizeClasses.icon}>
          {getIconForRole(userRole || '')}
        </span>
      )}
      {showTitle && (
        <span className={sizeClasses.text}>
          {roleData.title}
        </span>
      )}
    </div>
  );
} 