import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Settings as SettingsIcon,
  ArrowLeft,
  Globe,
  Users,
  Shield,
  Building,
  CreditCard,
  Bell,
  Lock,
  Database,
  Zap,
  FileText,
  Mail,
  Smartphone,
  Truck,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Logo } from "@/components/ui/logo";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/lib/rbac";
import UserRoleIndicator, {
  PermissionGate,
  RoleGate,
} from "@/components/UserRoleIndicator";
import RoleBasedNavigation from "@/components/RoleBasedNavigation";
import GlobalSettings from "@/components/GlobalSettings";
import PartnerSettings from "@/components/PartnerSettings";
import UserAccountSettings from "@/components/UserAccountSettings";
import { CRMSettings } from "@/components/CRMSettings";

interface SettingsSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  permission?: string;
  roles?: UserRole[];
  component: React.ComponentType;
}

const settingsSections: SettingsSection[] = [
  {
    id: "account",
    title: "Account Settings",
    description: "Manage your personal account and preferences",
    icon: <Users className="w-5 h-5" />,
    component: UserAccountSettings,
  },
  {
    id: "partner",
    title: "Partner Settings",
    description: "Contract terms, pricing, and partner-specific configurations",
    icon: <Building className="w-5 h-5" />,
    roles: [UserRole.PARTNER, UserRole.ADMIN, UserRole.GLOBAL_ADMIN],
    component: PartnerSettings,
  },
  {
    id: "crm",
    title: "CRM Integration",
    description: "Customer relationship management and sync settings",
    icon: <Database className="w-5 h-5" />,
    roles: [UserRole.SALES, UserRole.ADMIN, UserRole.GLOBAL_ADMIN],
    component: CRMSettings,
  },
  {
    id: "global",
    title: "Global System Settings",
    description: "System-wide configuration and administrative controls",
    icon: <Globe className="w-5 h-5" />,
    permission: "settings.edit",
    roles: [UserRole.GLOBAL_ADMIN],
    component: GlobalSettings,
  },
];

export default function Settings() {
  const navigate = useNavigate();
  const { user, hasPermission } = useAuth();
  const [activeSection, setActiveSection] = useState("account");

  // Filter sections based on user permissions and roles
  const availableSections = settingsSections.filter((section) => {
    // Check permission if specified
    if (section.permission && !hasPermission(section.permission)) {
      return false;
    }

    // Check roles if specified
    if (section.roles && user && !section.roles.includes(user.role)) {
      return false;
    }

    return true;
  });

  // Get the current section component
  const getCurrentSection = () => {
    const section = availableSections.find((s) => s.id === activeSection);
    if (!section) return null;

    const Component = section.component;
    return <Component />;
  };

  // Auto-select first available section if current is not available
  React.useEffect(() => {
    if (
      availableSections.length > 0 &&
      !availableSections.find((s) => s.id === activeSection)
    ) {
      setActiveSection(availableSections[0].id);
    }
  }, [availableSections, activeSection]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <Logo size="xl" />
          </div>

          <RoleBasedNavigation variant="header" className="hidden md:flex" />

          <div className="flex items-center space-x-3">
            <UserRoleIndicator />
            <RoleBasedNavigation variant="dropdown" />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
              <SettingsIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Settings</h1>
              <p className="text-muted-foreground">
                Manage your account, system preferences, and configurations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              Logged in as: <span className="font-medium">{user?.name}</span>
            </div>
            <UserRoleIndicator size="sm" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Settings Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Settings Sections</CardTitle>
                <CardDescription>Choose a section to configure</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <nav className="space-y-1">
                  {availableSections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted transition-colors ${
                        activeSection === section.id
                          ? "bg-primary text-primary-foreground"
                          : ""
                      }`}
                    >
                      {section.icon}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">
                          {section.title}
                        </div>
                        <div
                          className={`text-xs truncate ${
                            activeSection === section.id
                              ? "text-primary-foreground/80"
                              : "text-muted-foreground"
                          }`}
                        >
                          {section.description}
                        </div>
                      </div>
                    </button>
                  ))}
                </nav>
              </CardContent>
            </Card>

            {/* Quick Info Card */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-sm">Access Level</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <UserRoleIndicator showDescription />

                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>Department: {user?.department || "General"}</div>
                    <div>Company: {user?.company}</div>
                    {user?.permissions && (
                      <div>Permissions: {user.permissions.length} active</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3">{getCurrentSection()}</div>
        </div>
      </div>
    </div>
  );
}
