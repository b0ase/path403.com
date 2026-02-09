'use client';

import { useState, useEffect } from 'react';

export interface UserRoleData {
  id: string;
  title: string;
  description: string;
  traits: string[];
  pathway: string;
  color: string;
  benefits: string[];
}

export default function useUserRole() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [roleData, setRoleData] = useState<UserRoleData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load role from localStorage on mount
    const savedRole = localStorage.getItem('userRole');
    const savedRoleData = localStorage.getItem('userRoleData');
    
    if (savedRole) {
      setUserRole(savedRole);
    }
    
    if (savedRoleData) {
      try {
        setRoleData(JSON.parse(savedRoleData));
      } catch (error) {
        console.error('Error parsing saved role data:', error);
      }
    }
    
    setLoading(false);
  }, []);

  const updateRole = (roleId: string, roleDataObj: UserRoleData) => {
    setUserRole(roleId);
    setRoleData(roleDataObj);
    
    // Save to localStorage
    localStorage.setItem('userRole', roleId);
    localStorage.setItem('userRoleData', JSON.stringify(roleDataObj));
  };

  const clearRole = () => {
    setUserRole(null);
    setRoleData(null);
    
    // Clear from localStorage
    localStorage.removeItem('userRole');
    localStorage.removeItem('userRoleData');
  };

  const hasRole = () => {
    return userRole !== null && roleData !== null;
  };

  return {
    userRole,
    roleData,
    loading,
    updateRole,
    clearRole,
    hasRole
  };
} 