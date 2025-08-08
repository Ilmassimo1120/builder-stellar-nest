import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  FileText,
  Package,
  Users,
  Settings,
  BarChart3,
  Shield,
  Zap,
  Building,
  UserCheck,
  Cloud,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/lib/rbac";
import UserRoleIndicator, {
  PermissionGate,
  RoleGate,
} from "./UserRoleIndicator";

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  permission?: string;
  roles?: UserRole[];
  badge?: string;
}

const navigationItems: NavItem[] = [
  {
    path: "/dashboard",
    label: "Dashboard",
    icon: <Home className="w-4 h-4" />,
  },
  {
    path: "/projects",
    label: "Projects",
    icon: <Building className="w-4 h-4" />,
    permission: "projects.view.own",
  },
  {
    path: "/quotes",
    label: "Quotes",
    icon: <FileText className="w-4 h-4" />,
    permission: "quotes.view.own",
  },
  {
    path: "/catalogue",
    label: "Product Catalog",
    icon: <Package className="w-4 h-4" />,
    permission: "products.view",
  },
  {
    path: "/admin/catalogue",
    label: "Admin Catalog",
    icon: <Shield className="w-4 h-4" />,
    permission: "products.edit",
    badge: "Admin",
  },
  {
    path: "/analytics",
    label: "Analytics",
    icon: <BarChart3 className="w-4 h-4" />,
    permission: "analytics.view",
    roles: [UserRole.ADMIN, UserRole.GLOBAL_ADMIN, UserRole.SALES],
  },
  {
    path: "/users",
    label: "User Management",
    icon: <Users className="w-4 h-4" />,
    permission: "users.view.all",
    roles: [UserRole.ADMIN, UserRole.GLOBAL_ADMIN],
  },
  {
    path: "/settings",
    label: "Settings",
    icon: <Settings className="w-4 h-4" />,
    permission: "users.edit.own",
  },
];

interface RoleBasedNavigationProps {
  variant?: "sidebar" | "header" | "dropdown";
  className?: string;
}

export default function RoleBasedNavigation({
  variant = "header",
  className = "",
}: RoleBasedNavigationProps) {
  const { user, hasPermission, logout } = useAuth();
  const location = useLocation();

  const isActivePath = (path: string) => {
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  const getVisibleItems = () => {
    return navigationItems.filter((item) => {
      // Check permission if specified
      if (item.permission && !hasPermission(item.permission)) {
        return false;
      }

      // Check roles if specified
      if (item.roles && user && !item.roles.includes(user.role)) {
        return false;
      }

      return true;
    });
  };

  const visibleItems = getVisibleItems();

  if (variant === "dropdown") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className={className}>
            <Users className="w-4 h-4 mr-2" />
            Menu
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium">{user?.name}</p>
              <UserRoleIndicator size="sm" />
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {visibleItems.map((item) => (
            <DropdownMenuItem key={item.path} asChild>
              <Link to={item.path} className="flex items-center gap-2">
                {item.icon}
                <span>{item.label}</span>
                {item.badge && (
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            </DropdownMenuItem>
          ))}

          {/* Cloud Status - only in dropdown menu */}
          <DropdownMenuItem asChild>
            <Link to="/cloud-status" className="flex items-center gap-2">
              <Cloud className="w-4 h-4" />
              <span>Cloud Status</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout} className="text-red-600">
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  if (variant === "sidebar") {
    return (
      <nav className={`space-y-2 ${className}`}>
        {visibleItems.map((item) => {
          const isActive = isActivePath(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.badge && (
                <Badge variant="secondary" className="ml-auto text-xs">
                  {item.badge}
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>
    );
  }

  // Header variant (default)
  return (
    <nav className={`flex items-center space-x-1 ${className}`}>
      {visibleItems.map((item) => {
        const isActive = isActivePath(item.path);
        return (
          <Button
            key={item.path}
            variant={isActive ? "default" : "ghost"}
            size="sm"
            asChild
            className="relative"
          >
            <Link to={item.path} className="flex items-center gap-2">
              {item.icon}
              <span className="hidden md:inline">{item.label}</span>
              {item.badge && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {item.badge}
                </Badge>
              )}
            </Link>
          </Button>
        );
      })}
    </nav>
  );
}

// Quick access component for role-specific actions
export function RoleQuickActions() {
  const { user, hasPermission } = useAuth();

  if (!user) return null;

  return (
    <div className="flex items-center gap-2">
      <PermissionGate permission="products.create">
        <Button variant="outline" size="sm" asChild>
          <Link to="/admin/catalogue">
            <Package className="w-4 h-4 mr-2" />
            Add Product
          </Link>
        </Button>
      </PermissionGate>

      <PermissionGate permission="quotes.create">
        <Button variant="outline" size="sm" asChild>
          <Link to="/quotes/new">
            <FileText className="w-4 h-4 mr-2" />
            New Quote
          </Link>
        </Button>
      </PermissionGate>


      <RoleGate roles={[UserRole.ADMIN, UserRole.GLOBAL_ADMIN]}>
        <Button variant="outline" size="sm" asChild>
          <Link to="/users">
            <UserCheck className="w-4 h-4 mr-2" />
            Manage Users
          </Link>
        </Button>
      </RoleGate>
    </div>
  );
}
