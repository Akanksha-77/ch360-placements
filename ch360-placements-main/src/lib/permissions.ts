import React from 'react';
import { authService } from './auth';

// Permission constants
export const PERMISSIONS = {
  // User management
  VIEW_USERS: 'auth.view_user',
  ADD_USERS: 'auth.add_user',
  CHANGE_USERS: 'auth.change_user',
  DELETE_USERS: 'auth.delete_user',
  
  // Company management
  VIEW_COMPANIES: 'companies.view_company',
  ADD_COMPANIES: 'companies.add_company',
  CHANGE_COMPANIES: 'companies.change_company',
  DELETE_COMPANIES: 'companies.delete_company',
  
  // Job management
  VIEW_JOBS: 'jobs.view_job',
  ADD_JOBS: 'jobs.add_job',
  CHANGE_JOBS: 'jobs.change_job',
  DELETE_JOBS: 'jobs.delete_job',
  
  // Reports
  VIEW_REPORTS: 'reports.view_report',
  EXPORT_REPORTS: 'reports.export_report',
} as const;

// Group constants
export const GROUPS = {
  PLACEMENT: 'placement',
  ADMIN: 'admin',
  STUDENT: 'student',
  COMPANY: 'company',
} as const;

// Permission checking utilities
export const hasPermission = (permission: string): boolean => {
  return authService.hasPermission(permission);
};

export const hasGroup = (group: string): boolean => {
  return authService.hasGroup(group);
};

export const hasPlacementAccess = (): boolean => {
  return authService.hasPlacementPermission();
};

export const isUserActive = (): boolean => {
  return authService.isUserActive();
};

// Debug function to log current user permissions
export const debugUserPermissions = (): void => {
  const user = authService.getCurrentUser();
  const profile = authService.getUserProfile();
  
  console.group('🔐 User Permission Debug');
  console.log('User:', user);
  console.log('Profile:', profile);
  console.log('Groups:', profile?.groups || []);
  console.log('Permissions:', profile?.user_permissions || []);
  console.log('Has Placement Access:', hasPlacementAccess());
  console.log('Is Active:', isUserActive());
  console.groupEnd();
};

// Higher-order component for permission-based rendering
export const withPermission = (
  permission: string,
  fallback?: React.ReactNode
) => {
  return (Component: React.ComponentType<any>) => {
    return (props: any) => {
      if (hasPermission(permission)) {
        return React.createElement(Component, props);
      }
      return fallback || null;
    };
  };
};

// Higher-order component for group-based rendering
export const withGroup = (
  group: string,
  fallback?: React.ReactNode
) => {
  return (Component: React.ComponentType<any>) => {
    return (props: any) => {
      if (hasGroup(group)) {
        return React.createElement(Component, props);
      }
      return fallback || null;
    };
  };
};
