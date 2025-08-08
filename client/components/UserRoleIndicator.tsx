import React from 'react';
import { Crown, Shield, TrendingUp, Users, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { UserRole, rbacService } from '@/lib/rbac';
import { useAuth } from '@/hooks/useAuth';

interface UserRoleIndicatorProps {
  role?: UserRole;
  showDescription?: boolean;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'sm' | 'default' | 'lg';
}

const getRoleIcon = (role: UserRole) => {
  switch (role) {
    case UserRole.GLOBAL_ADMIN:
      return <Crown className="w-4 h-4" />;
    case UserRole.ADMIN:
      return <Shield className="w-4 h-4" />;
    case UserRole.SALES:
      return <TrendingUp className="w-4 h-4" />;
    case UserRole.PARTNER:
      return <Users className="w-4 h-4" />;
    case UserRole.USER:
      return <User className="w-4 h-4" />;
    default:
      return <User className="w-4 h-4" />;
  }
};

const getRoleColor = (role: UserRole) => {
  switch (role) {
    case UserRole.GLOBAL_ADMIN:
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case UserRole.ADMIN:
      return 'bg-red-100 text-red-800 border-red-200';
    case UserRole.SALES:
      return 'bg-green-100 text-green-800 border-green-200';
    case UserRole.PARTNER:
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case UserRole.USER:
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export default function UserRoleIndicator({
  role,
  showDescription = false,
  variant = 'default',
  size = 'default'
}: UserRoleIndicatorProps) {
  const { user } = useAuth();
  const userRole = role || user?.role || UserRole.USER;
  
  const roleIcon = getRoleIcon(userRole);
  const roleColor = getRoleColor(userRole);
  const roleName = rbacService.getRoleDisplayName(userRole);
  const roleDescription = rbacService.getRoleDescription(userRole);

  return (
    <div className="flex items-center gap-2">
      <Badge 
        variant={variant}
        className={variant === 'default' ? roleColor : ''}
      >
        <div className="flex items-center gap-1">
          {roleIcon}
          <span className={size === 'sm' ? 'text-xs' : 'text-sm'}>
            {roleName}
          </span>
        </div>
      </Badge>
      
      {showDescription && (
        <span className="text-sm text-muted-foreground">
          {roleDescription}
        </span>
      )}
    </div>
  );
}

// Permission-based visibility wrapper
interface PermissionGateProps {
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function PermissionGate({
  permission,
  permissions,
  requireAll = false,
  fallback = null,
  children
}: PermissionGateProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = useAuth();

  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (permissions) {
    hasAccess = requireAll 
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}

// Role-based visibility wrapper
interface RoleGateProps {
  roles: UserRole[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function RoleGate({
  roles,
  fallback = null,
  children
}: RoleGateProps) {
  const { user } = useAuth();
  
  const hasAccess = user && roles.includes(user.role);
  
  return hasAccess ? <>{children}</> : <>{fallback}</>;
}
