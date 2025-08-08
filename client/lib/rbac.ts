// Role-Based Access Control (RBAC) System for ChargeSource Platform

export enum UserRole {
  GLOBAL_ADMIN = 'global_admin',
  ADMIN = 'admin', 
  SALES = 'sales',
  PARTNER = 'partner',
  USER = 'user'
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

export interface RoleDefinition {
  role: UserRole;
  name: string;
  description: string;
  permissions: string[];
  level: number; // Higher number = higher privilege level
}

// Define all permissions in the system
export const PERMISSIONS: Record<string, Permission> = {
  // User Management
  'users.view.all': {
    id: 'users.view.all',
    name: 'View All Users',
    description: 'View all users in the system',
    resource: 'users',
    action: 'view.all'
  },
  'users.create': {
    id: 'users.create',
    name: 'Create Users',
    description: 'Create new user accounts',
    resource: 'users',
    action: 'create'
  },
  'users.edit.all': {
    id: 'users.edit.all',
    name: 'Edit All Users',
    description: 'Edit any user account',
    resource: 'users',
    action: 'edit.all'
  },
  'users.edit.own': {
    id: 'users.edit.own',
    name: 'Edit Own Profile',
    description: 'Edit own user profile',
    resource: 'users',
    action: 'edit.own'
  },
  'users.delete': {
    id: 'users.delete',
    name: 'Delete Users',
    description: 'Delete user accounts',
    resource: 'users',
    action: 'delete'
  },
  'users.manage.roles': {
    id: 'users.manage.roles',
    name: 'Manage User Roles',
    description: 'Assign and modify user roles',
    resource: 'users',
    action: 'manage.roles'
  },

  // Product Management
  'products.view': {
    id: 'products.view',
    name: 'View Products',
    description: 'View product catalog',
    resource: 'products',
    action: 'view'
  },
  'products.create': {
    id: 'products.create',
    name: 'Create Products',
    description: 'Add new products to catalog',
    resource: 'products',
    action: 'create'
  },
  'products.edit': {
    id: 'products.edit',
    name: 'Edit Products',
    description: 'Modify existing products',
    resource: 'products',
    action: 'edit'
  },
  'products.delete': {
    id: 'products.delete',
    name: 'Delete Products',
    description: 'Remove products from catalog',
    resource: 'products',
    action: 'delete'
  },
  'products.manage.pricing': {
    id: 'products.manage.pricing',
    name: 'Manage Product Pricing',
    description: 'Set and modify product pricing',
    resource: 'products',
    action: 'manage.pricing'
  },

  // Quote Management
  'quotes.view.all': {
    id: 'quotes.view.all',
    name: 'View All Quotes',
    description: 'View all quotes in the system',
    resource: 'quotes',
    action: 'view.all'
  },
  'quotes.view.own': {
    id: 'quotes.view.own',
    name: 'View Own Quotes',
    description: 'View own quotes',
    resource: 'quotes',
    action: 'view.own'
  },
  'quotes.create': {
    id: 'quotes.create',
    name: 'Create Quotes',
    description: 'Create new quotes',
    resource: 'quotes',
    action: 'create'
  },
  'quotes.edit.all': {
    id: 'quotes.edit.all',
    name: 'Edit All Quotes',
    description: 'Edit any quote',
    resource: 'quotes',
    action: 'edit.all'
  },
  'quotes.edit.own': {
    id: 'quotes.edit.own',
    name: 'Edit Own Quotes',
    description: 'Edit own quotes',
    resource: 'quotes',
    action: 'edit.own'
  },
  'quotes.delete.all': {
    id: 'quotes.delete.all',
    name: 'Delete All Quotes',
    description: 'Delete any quote',
    resource: 'quotes',
    action: 'delete.all'
  },
  'quotes.delete.own': {
    id: 'quotes.delete.own',
    name: 'Delete Own Quotes',
    description: 'Delete own quotes',
    resource: 'quotes',
    action: 'delete.own'
  },
  'quotes.approve': {
    id: 'quotes.approve',
    name: 'Approve Quotes',
    description: 'Approve quotes for sending',
    resource: 'quotes',
    action: 'approve'
  },
  'quotes.compare': {
    id: 'quotes.compare',
    name: 'Compare Products in Quotes',
    description: 'Compare products in quotations',
    resource: 'quotes',
    action: 'compare'
  },

  // Project Management
  'projects.view.all': {
    id: 'projects.view.all',
    name: 'View All Projects',
    description: 'View all projects in the system',
    resource: 'projects',
    action: 'view.all'
  },
  'projects.view.own': {
    id: 'projects.view.own',
    name: 'View Own Projects',
    description: 'View own projects',
    resource: 'projects',
    action: 'view.own'
  },
  'projects.create': {
    id: 'projects.create',
    name: 'Create Projects',
    description: 'Create new projects',
    resource: 'projects',
    action: 'create'
  },
  'projects.edit.all': {
    id: 'projects.edit.all',
    name: 'Edit All Projects',
    description: 'Edit any project',
    resource: 'projects',
    action: 'edit.all'
  },
  'projects.edit.own': {
    id: 'projects.edit.own',
    name: 'Edit Own Projects',
    description: 'Edit own projects',
    resource: 'projects',
    action: 'edit.own'
  },

  // Analytics and Reporting
  'analytics.view': {
    id: 'analytics.view',
    name: 'View Analytics',
    description: 'Access analytics and reports',
    resource: 'analytics',
    action: 'view'
  },
  'analytics.export': {
    id: 'analytics.export',
    name: 'Export Reports',
    description: 'Export analytics and reports',
    resource: 'analytics',
    action: 'export'
  },

  // System Settings
  'settings.view': {
    id: 'settings.view',
    name: 'View Settings',
    description: 'View system settings',
    resource: 'settings',
    action: 'view'
  },
  'settings.edit': {
    id: 'settings.edit',
    name: 'Edit Settings',
    description: 'Modify system settings',
    resource: 'settings',
    action: 'edit'
  },

  // Partner Management
  'partners.view': {
    id: 'partners.view',
    name: 'View Partners',
    description: 'View partner accounts',
    resource: 'partners',
    action: 'view'
  },
  'partners.manage': {
    id: 'partners.manage',
    name: 'Manage Partners',
    description: 'Manage partner accounts and relationships',
    resource: 'partners',
    action: 'manage'
  }
};

// Role definitions with permissions
export const ROLES: Record<UserRole, RoleDefinition> = {
  [UserRole.GLOBAL_ADMIN]: {
    role: UserRole.GLOBAL_ADMIN,
    name: 'Global Administrator',
    description: 'Full system access with all permissions',
    level: 100,
    permissions: Object.keys(PERMISSIONS) // All permissions
  },

  [UserRole.ADMIN]: {
    role: UserRole.ADMIN,
    name: 'Administrator',
    description: 'Administrative access with most permissions',
    level: 80,
    permissions: [
      'users.view.all',
      'users.create',
      'users.edit.all',
      'users.edit.own',
      'users.manage.roles',
      'products.view',
      'products.create',
      'products.edit',
      'products.delete',
      'products.manage.pricing',
      'quotes.view.all',
      'quotes.view.own',
      'quotes.create',
      'quotes.edit.all',
      'quotes.edit.own',
      'quotes.delete.all',
      'quotes.delete.own',
      'quotes.approve',
      'quotes.compare',
      'projects.view.all',
      'projects.view.own',
      'projects.create',
      'projects.edit.all',
      'projects.edit.own',
      'analytics.view',
      'analytics.export',
      'settings.view',
      'settings.edit',
      'partners.view',
      'partners.manage'
    ]
  },

  [UserRole.SALES]: {
    role: UserRole.SALES,
    name: 'Sales Representative',
    description: 'Sales-focused access for managing quotes and customers',
    level: 60,
    permissions: [
      'users.edit.own',
      'products.view',
      'quotes.view.all',
      'quotes.view.own',
      'quotes.create',
      'quotes.edit.all',
      'quotes.edit.own',
      'quotes.delete.own',
      'quotes.compare',
      'projects.view.all',
      'projects.view.own',
      'projects.create',
      'projects.edit.own',
      'analytics.view',
      'partners.view'
    ]
  },

  [UserRole.PARTNER]: {
    role: UserRole.PARTNER,
    name: 'Partner',
    description: 'Partner access with limited system permissions',
    level: 40,
    permissions: [
      'users.edit.own',
      'products.view',
      'quotes.view.own',
      'quotes.create',
      'quotes.edit.own',
      'quotes.delete.own',
      'quotes.compare',
      'projects.view.own',
      'projects.create',
      'projects.edit.own'
    ]
  },

  [UserRole.USER]: {
    role: UserRole.USER,
    name: 'User',
    description: 'Basic user access with minimal permissions',
    level: 20,
    permissions: [
      'users.edit.own',
      'products.view',
      'quotes.view.own',
      'quotes.create',
      'quotes.edit.own',
      'quotes.compare',
      'projects.view.own',
      'projects.create',
      'projects.edit.own'
    ]
  }
};

// RBAC Service Class
export class RBACService {
  private static instance: RBACService;

  private constructor() {}

  static getInstance(): RBACService {
    if (!RBACService.instance) {
      RBACService.instance = new RBACService();
    }
    return RBACService.instance;
  }

  // Check if user has a specific permission
  hasPermission(userRole: UserRole, permission: string): boolean {
    const role = ROLES[userRole];
    return role ? role.permissions.includes(permission) : false;
  }

  // Check if user has any of the specified permissions
  hasAnyPermission(userRole: UserRole, permissions: string[]): boolean {
    return permissions.some(permission => this.hasPermission(userRole, permission));
  }

  // Check if user has all of the specified permissions
  hasAllPermissions(userRole: UserRole, permissions: string[]): boolean {
    return permissions.every(permission => this.hasPermission(userRole, permission));
  }

  // Get all permissions for a role
  getRolePermissions(userRole: UserRole): string[] {
    const role = ROLES[userRole];
    return role ? [...role.permissions] : [];
  }

  // Check if one role has higher level than another
  isHigherRole(role1: UserRole, role2: UserRole): boolean {
    const level1 = ROLES[role1]?.level || 0;
    const level2 = ROLES[role2]?.level || 0;
    return level1 > level2;
  }

  // Get available roles that current user can assign to others
  getAssignableRoles(currentUserRole: UserRole): UserRole[] {
    const currentLevel = ROLES[currentUserRole]?.level || 0;
    return Object.values(UserRole).filter(role => {
      const roleLevel = ROLES[role]?.level || 0;
      return roleLevel < currentLevel; // Can only assign roles with lower level
    });
  }

  // Validate if user can manage another user based on roles
  canManageUser(managerRole: UserRole, targetRole: UserRole): boolean {
    return this.isHigherRole(managerRole, targetRole);
  }

  // Get role display name
  getRoleDisplayName(role: UserRole): string {
    return ROLES[role]?.name || role;
  }

  // Get role description
  getRoleDescription(role: UserRole): string {
    return ROLES[role]?.description || '';
  }

  // Check if user can access resource
  canAccessResource(userRole: UserRole, resource: string, action: string): boolean {
    const permissionId = `${resource}.${action}`;
    return this.hasPermission(userRole, permissionId);
  }

  // Get all roles ordered by level (highest first)
  getAllRolesByLevel(): RoleDefinition[] {
    return Object.values(ROLES).sort((a, b) => b.level - a.level);
  }

  // Check if role is valid
  isValidRole(role: string): role is UserRole {
    return Object.values(UserRole).includes(role as UserRole);
  }
}

// Export singleton instance
export const rbacService = RBACService.getInstance();

// Helper functions for common permission checks
export const canViewAllUsers = (role: UserRole) => rbacService.hasPermission(role, 'users.view.all');
export const canManageProducts = (role: UserRole) => rbacService.hasPermission(role, 'products.edit');
export const canViewAllQuotes = (role: UserRole) => rbacService.hasPermission(role, 'quotes.view.all');
export const canApproveQuotes = (role: UserRole) => rbacService.hasPermission(role, 'quotes.approve');
export const canCompareProducts = (role: UserRole) => rbacService.hasPermission(role, 'quotes.compare');
export const canManageSettings = (role: UserRole) => rbacService.hasPermission(role, 'settings.edit');
export const canViewAnalytics = (role: UserRole) => rbacService.hasPermission(role, 'analytics.view');
