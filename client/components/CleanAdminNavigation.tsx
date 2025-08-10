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
  Building,
  Cloud,
  ChevronDown,
  Plus,
  Search,
  Bell,
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
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/lib/rbac";
import { cn } from "@/lib/utils";

interface NavGroup {
  label: string;
  items: {
    path: string;
    label: string;
    icon: React.ReactNode;
    permission?: string;
    roles?: UserRole[];
    badge?: string;
  }[];
}

const navigationGroups: NavGroup[] = [
  {
    label: "Core",
    items: [
      {
        path: "/dashboard",
        label: "Dashboard",
        icon: <Home className="w-4 h-4" style={{display: 'flex', flexDirection: 'column'}} />,
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
    ],
  },
  {
    label: "Catalog",
    items: [
      {
        path: "/catalogue",
        label: "Product Catalog",
        icon: <Package className="w-4 h-4" />,
        permission: "products.view",
      },
      {
        path: "/admin/catalogue",
        label: "Manage Products",
        icon: <Shield className="w-4 h-4" />,
        permission: "products.edit",
        badge: "Admin",
      },
    ],
  },
  {
    label: "Admin",
    items: [
      {
        path: "/analytics",
        label: "Analytics",
        icon: <BarChart3 className="w-4 h-4" />,
        permission: "analytics.view",
        roles: [UserRole.ADMIN, UserRole.GLOBAL_ADMIN, UserRole.SALES],
      },
      {
        path: "/files",
        label: "File Storage",
        icon: <Cloud className="w-4 h-4" />,
        roles: [UserRole.ADMIN, UserRole.GLOBAL_ADMIN],
      },
      {
        path: "/users",
        label: "User Management",
        icon: <Users className="w-4 h-4" />,
        permission: "users.view.all",
        roles: [UserRole.ADMIN, UserRole.GLOBAL_ADMIN],
      },
    ],
  },
];

export default function CleanAdminNavigation() {
  const { user, hasPermission } = useAuth();
  const location = useLocation();

  const isActivePath = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  const isItemVisible = (item: any) => {
    if (item.permission && !hasPermission(item.permission)) {
      return false;
    }
    if (item.roles && user && !item.roles.includes(user.role)) {
      return false;
    }
    return true;
  };

  const getVisibleGroups = () => {
    return navigationGroups
      .map(group => ({
        ...group,
        items: group.items.filter(isItemVisible)
      }))
      .filter(group => group.items.length > 0);
  };

  const visibleGroups = getVisibleGroups();
  
  // Get primary navigation items (Core group)
  const primaryItems = visibleGroups.find(g => g.label === "Core")?.items || [];
  
  // Get secondary groups (everything except Core)
  const secondaryGroups = visibleGroups.filter(g => g.label !== "Core");

  return (
    <nav className="flex items-center justify-end w-full" style={{maxWidth: '500px', marginLeft: 'auto'}}>
      {/* All Navigation Items - Right Side */}
      <div className="flex items-center space-x-4" style={{justifyContent: 'flex-start', marginLeft: 'auto', width: 'auto', flexGrow: '0'}}>
        {/* Primary Navigation - Core Items */}
        {primaryItems.map((item) => {
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
                <span className="hidden lg:inline">{item.label}</span>
              </Link>
            </Button>
          );
        })}

        {/* Catalog Dropdown */}
        {visibleGroups.find(g => g.label === "Catalog") && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant={
                  visibleGroups.find(g => g.label === "Catalog")?.items.some(item => isActivePath(item.path))
                    ? "default"
                    : "ghost"
                }
                size="sm"
                className="flex items-center gap-1"
              >
                <Package className="w-4 h-4" />
                <span className="hidden lg:inline">Catalog</span>
                <ChevronDown className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuLabel>Product Catalog</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {visibleGroups.find(g => g.label === "Catalog")?.items.map((item) => (
                <DropdownMenuItem key={item.path} asChild>
                  <Link to={item.path} className="flex items-center gap-2 w-full">
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
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Admin Tools Dropdown */}
        {visibleGroups.find(g => g.label === "Admin") && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant={
                  visibleGroups.find(g => g.label === "Admin")?.items.some(item => isActivePath(item.path))
                    ? "default"
                    : "ghost"
                }
                size="sm"
                className="flex items-center gap-1"
              >
                <Shield className="w-4 h-4" />
                <span className="hidden lg:inline">Admin</span>
                <ChevronDown className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuLabel>Administration</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {visibleGroups.find(g => g.label === "Admin")?.items.map((item) => (
                <DropdownMenuItem key={item.path} asChild>
                  <Link to={item.path} className="flex items-center gap-2 w-full">
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
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Separator */}
        <div className="w-px h-4 bg-border mx-2" />

        {/* Quick Create Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" className="flex items-center gap-1">
              <Plus className="w-4 h-4" />
              <span className="hidden md:inline" style={{marginLeft: 'auto'}}>Create</span>
              <ChevronDown className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuLabel>Quick Create</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/projects/new" className="flex items-center gap-2">
                <Building className="w-4 h-4" />
                New Project
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/quotes/new" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                New Quote
              </Link>
            </DropdownMenuItem>
            {hasPermission("products.create") && (
              <DropdownMenuItem asChild>
                <Link to="/admin/catalogue" className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Add Product
                </Link>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Settings */}
        <Button variant="ghost" size="sm" asChild>
          <Link to="/settings">
            <Settings className="w-4 h-4" />
            <span className="sr-only">Settings</span>
          </Link>
        </Button>
      </div>
    </nav>
  );
}

// Clean Quick Actions for Dashboard
export function CleanQuickActions() {
  const { user, hasPermission } = useAuth();

  if (!user) return null;

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" asChild>
        <Link to="/projects/new">
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Link>
      </Button>
      
      <Button variant="outline" size="sm" asChild>
        <Link to="/quotes/new">
          <FileText className="w-4 h-4 mr-2" />
          New Quote
        </Link>
      </Button>

      {(user.role === UserRole.ADMIN || user.role === UserRole.GLOBAL_ADMIN) && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Shield className="w-4 h-4 mr-2" />
              Admin
              <ChevronDown className="w-3 h-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to="/analytics">
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/users">
                <Users className="w-4 h-4 mr-2" />
                Manage Users
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/admin/catalogue">
                <Package className="w-4 h-4 mr-2" />
                Manage Products
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
