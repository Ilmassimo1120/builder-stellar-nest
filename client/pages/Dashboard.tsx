import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, useNavigate } from "react-router-dom";
import { quoteService } from "@/lib/quoteService";
import {
  PlugZap,
  Plus,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  Users,
  Package,
  FileText,
  Settings,
  Bell,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  MoreHorizontal,
  MapPin,
  Zap,
  Calculator,
  ArrowUpRight,
  User,
  LogOut,
  HelpCircle,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { KnowledgeBaseWidget } from "@/components/KnowledgeBaseWidget";
import { SupabaseSetup } from "@/components/SupabaseSetup";
import { projectService, autoConfigureSupabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import RoleBasedNavigation, {
  RoleQuickActions,
} from "@/components/RoleBasedNavigation";
import UserRoleIndicator, {
  PermissionGate,
  RoleGate,
} from "@/components/UserRoleIndicator";
import { UserRole } from "@/lib/rbac";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export default function Dashboard() {
  const { user, logout, hasPermission } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<any[]>([]);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  // Function to retry Supabase connection
  const retryConnection = async (): Promise<void> => {
    try {
      console.log("🔄 Retrying Supabase connection...");
      const isConnected = await autoConfigureSupabase();
      setIsSupabaseConnected(isConnected);
      if (isConnected) {
        console.log("✅ Connection successful, reloading projects...");
        // Reload projects if connection is successful
        await loadProjects();
      } else {
        console.log("⚠️ Connection still not available");
      }
    } catch (error) {
      console.error("❌ Error retrying Supabase connection:", error);
      setIsSupabaseConnected(false);
    }
  };

  // Sample fallback projects for when no real projects exist
  const sampleProjects = [
    {
      id: "PRJ-001",
      name: "Westfield Shopping Centre - EV Hub",
      client: "Westfield Group",
      status: "In Progress",
      progress: 65,
      value: "$245,000",
      deadline: "2024-03-15",
      location: "Sydney, NSW",
      type: "Commercial DC Fast Charging",
    },
    {
      id: "PRJ-002",
      name: "Residential Complex - Parramatta",
      client: "Mirvac Properties",
      status: "Quoting",
      progress: 25,
      value: "$89,500",
      deadline: "2024-02-28",
      location: "Parramatta, NSW",
      type: "Residential AC Charging",
    },
    {
      id: "PRJ-003",
      name: "Council Car Park Upgrade",
      client: "City of Melbourne",
      status: "Completed",
      progress: 100,
      value: "$156,000",
      deadline: "2024-01-30",
      location: "Melbourne, VIC",
      type: "Public DC Charging",
    },
    {
      id: "PRJ-004",
      name: "Fleet Depot - Australia Post",
      client: "Australia Post",
      status: "Planning",
      progress: 15,
      value: "$320,000",
      deadline: "2024-04-20",
      location: "Brisbane, QLD",
      type: "Fleet DC Charging",
    },
  ];

  // Extract loadProjects function so it can be called from retryConnection
  const loadProjects = async () => {
    try {
      setLoading(true);

      // Auto-configure Supabase connection
      const isConnected = await autoConfigureSupabase();
      setIsSupabaseConnected(isConnected);

      let loadedProjects = [];

      if (isConnected) {
        // Load from Supabase
        try {
          const supabaseProjects = await projectService.getAllProjects();
          loadedProjects = supabaseProjects.map((project) => ({
            id: project.id?.slice(0, 8) || "PRJ-NEW",
            name: project.name,
            client: project.client_name,
            status: project.status,
            progress: project.progress,
            value:
              `$${project.estimated_budget_min?.toLocaleString()} - $${project.estimated_budget_max?.toLocaleString()}` ||
              "TBD",
            deadline: new Date(
              project.created_at || Date.now(),
            ).toLocaleDateString(),
            location:
              project.site_address?.split(",").slice(-2).join(",").trim() ||
              "TBD",
            type: project.site_type || "EV Charging Project",
          }));
        } catch (error) {
          console.error("Error loading projects from Supabase:", error);
        }
      }

      // Load from localStorage as fallback or additional
      const localProjects = JSON.parse(
        localStorage.getItem("chargeSourceProjects") || "[]",
      );
      const formattedLocalProjects = localProjects.map((project: any) => ({
        id: project.id || `PRJ-${Date.now()}`,
        name: project.projectInfo?.name || project.name || "Unnamed Project",
        client:
          project.projectInfo?.client ||
          project.client_name ||
          "Unknown Client",
        status: project.status || "Planning",
        progress: project.progress || 0,
        value: project.estimatedBudget || project.estimated_budget || "TBD",
        deadline: new Date(
          project.createdAt || project.created_at || Date.now(),
        ).toLocaleDateString(),
        location: project.projectInfo?.address || project.site_address || "TBD",
        type:
          project.projectInfo?.type ||
          project.site_type ||
          "EV Charging Project",
      }));

      // Load drafts for the current user
      const drafts = JSON.parse(
        localStorage.getItem("chargeSourceDrafts") || "[]",
      );
      const userDrafts = drafts
        .filter((draft: any) => draft.userId === user?.id)
        .map((draft: any) => ({
          id: draft.id,
          name: draft.draftName || "Untitled Draft",
          client: draft.clientRequirements?.contactPersonName || "Draft Client",
          status: "Draft",
          progress: draft.progress || 0,
          value: "In Progress",
          deadline: new Date(draft.updatedAt).toLocaleDateString(),
          location: draft.siteAssessment?.siteAddress || "TBD",
          type: "Draft Project",
          isDraft: true,
          draftStep: draft.currentStep,
        }));

      // Combine projects and drafts
      const allProjects = [
        ...loadedProjects,
        ...formattedLocalProjects,
        ...userDrafts,
      ];
      const uniqueProjects = allProjects.filter(
        (project, index, self) =>
          index === self.findIndex((p) => p.id === project.id),
      );

      // Use sample projects if no real projects exist
      setProjects(uniqueProjects.length > 0 ? uniqueProjects : sampleProjects);
    } catch (error) {
      console.error("Error loading projects:", error);
      setProjects(sampleProjects);
    } finally {
      setLoading(false);
    }
  };

  // Load projects on component mount
  useEffect(() => {
    loadProjects();
  }, []);

  const recentProjects = projects;

  // Handle editing projects by creating a draft
  const handleEditProject = (project: any) => {
    // Create a draft from the existing project data for editing
    if (!user) return;

    try {
      const editDraftId = `edit-${project.id}-${Date.now()}`;
      const now = new Date().toISOString();

      // Use preserved original detailed project data
      const originalProject = project._originalData || {};

      // Extract detailed data if available from original project
      const originalClientReq = originalProject?.clientRequirements || {};
      const originalSiteAssess = originalProject?.siteAssessment || {};
      const originalChargerSel = originalProject?.chargerSelection || {};
      const originalGridCap = originalProject?.gridCapacity || {};
      const originalCompliance = originalProject?.compliance || {};

      // Convert the project data back to wizard format for editing
      const editDraft = {
        id: editDraftId,
        userId: user.id,
        draftName: `${project.name} (Editing)`,
        currentStep: 1,
        createdAt: now,
        updatedAt: now,
        clientRequirements: {
          contactPersonName:
            originalClientReq.contactPersonName ||
            project.contactPerson ||
            project.client ||
            "",
          contactTitle: originalClientReq.contactTitle || "",
          contactEmail: originalClientReq.contactEmail || project.email || "",
          contactPhone: originalClientReq.contactPhone || project.phone || "",
          organizationType:
            originalClientReq.organizationType ||
            (project.type?.toLowerCase().includes("residential")
              ? "residential"
              : project.type?.toLowerCase().includes("commercial") ||
                  project.type?.toLowerCase().includes("retail")
                ? "retail"
                : project.type?.toLowerCase().includes("fleet")
                  ? "fleet"
                  : project.type?.toLowerCase().includes("public")
                    ? "government"
                    : project.type?.toLowerCase().includes("office")
                      ? "office"
                      : "other"),
          projectObjective:
            originalClientReq.projectObjective ||
            (project.type?.toLowerCase().includes("fleet")
              ? "fleet-electrification"
              : project.type?.toLowerCase().includes("residential")
                ? "employee-benefit"
                : project.type?.toLowerCase().includes("retail")
                  ? "customer-attraction"
                  : "future-proofing"),
          numberOfVehicles: originalClientReq.numberOfVehicles || "6-15",
          vehicleTypes: originalClientReq.vehicleTypes || ["Passenger Cars"],
          dailyUsagePattern:
            originalClientReq.dailyUsagePattern || "business-hours",
          budgetRange: originalClientReq.budgetRange || "tbd",
          projectTimeline: originalClientReq.projectTimeline || "standard",
          sustainabilityGoals: originalClientReq.sustainabilityGoals || [],
          accessibilityRequirements:
            originalClientReq.accessibilityRequirements || false,
          specialRequirements:
            originalClientReq.specialRequirements || project.description || "",
          preferredChargerBrands:
            originalClientReq.preferredChargerBrands || [],
          paymentModel: originalClientReq.paymentModel || "",
        },
        siteAssessment: {
          projectName: originalSiteAssess.projectName || project.name,
          clientName: originalSiteAssess.clientName || project.client,
          siteAddress:
            originalSiteAssess.siteAddress ||
            project.siteAddress ||
            project.location,
          siteType: originalSiteAssess.siteType || "commercial",
          existingPowerSupply: originalSiteAssess.existingPowerSupply || "",
          availableAmperes: originalSiteAssess.availableAmperes || "",
          estimatedLoad: originalSiteAssess.estimatedLoad || "",
          parkingSpaces: originalSiteAssess.parkingSpaces || "",
          accessRequirements: originalSiteAssess.accessRequirements || "",
          photos: originalSiteAssess.photos || [],
          additionalNotes:
            originalSiteAssess.additionalNotes || project.description || "",
        },
        chargerSelection: {
          chargingType: originalChargerSel.chargingType || "",
          powerRating: originalChargerSel.powerRating || "",
          mountingType: originalChargerSel.mountingType || "",
          numberOfChargers: originalChargerSel.numberOfChargers || "",
          connectorTypes: originalChargerSel.connectorTypes || [],
          weatherProtection: originalChargerSel.weatherProtection || false,
          networkConnectivity: originalChargerSel.networkConnectivity || "",
        },
        gridCapacity: {
          currentSupply: originalGridCap.currentSupply || "",
          requiredCapacity: originalGridCap.requiredCapacity || "",
          upgradeNeeded: originalGridCap.upgradeNeeded || false,
          upgradeType: originalGridCap.upgradeType || "",
          estimatedUpgradeCost: originalGridCap.estimatedUpgradeCost || "",
          utilityContact: originalGridCap.utilityContact || "",
        },
        compliance: {
          electricalStandards: originalCompliance.electricalStandards || [],
          safetyRequirements: originalCompliance.safetyRequirements || [],
          localPermits: originalCompliance.localPermits || [],
          environmentalConsiderations:
            originalCompliance.environmentalConsiderations || [],
          accessibilityCompliance:
            originalCompliance.accessibilityCompliance || false,
        },
        progress: originalProject ? 100 : 33,
      };

      // Save the edit draft
      const existingDrafts = JSON.parse(
        localStorage.getItem("chargeSourceDrafts") || "[]",
      );
      existingDrafts.unshift(editDraft);
      localStorage.setItem(
        "chargeSourceDrafts",
        JSON.stringify(existingDrafts),
      );

      // Navigate to Project Wizard with the edit draft
      navigate(`/projects/new?draft=${editDraftId}`);
    } catch (error) {
      console.error("Error creating edit draft:", error);
      alert("Error opening project for editing. Please try again.");
    }
  };

  // Handle creating quotes from projects (supports multiple quotes per project)
  const handleCreateQuote = (project: any) => {
    if (!user) return;

    try {
      // Check existing quotes for this project
      const allQuotes = quoteService.getAllQuotes();
      const existingQuotes = allQuotes.filter(
        (q) => q.projectId === project.id,
      );

      // Create a new quote from the project
      const newQuote = quoteService.createQuote(project.id);
      newQuote.createdBy = user.id;

      // If this is a comparison quote, add a note to the title
      if (existingQuotes.length > 0) {
        newQuote.title = `${newQuote.title} (Quote #${existingQuotes.length + 1})`;
      }

      // Update quote with user information
      quoteService.updateQuote(newQuote);

      // Navigate to quote builder
      navigate(`/quotes/${newQuote.id}`);
    } catch (error) {
      console.error("Error creating quote:", error);
      alert("Error creating quote. Please try again.");
    }
  };

  const quickActions = [
    {
      title: "New Project",
      description: "Start project planning wizard",
      icon: <Plus className="w-6 h-6" />,
      color: "bg-primary",
      href: "/projects/new",
    },
    {
      title: "Create Quote",
      description: "Generate quote with CPQ engine",
      icon: <Calculator className="w-6 h-6" />,
      color: "bg-secondary",
      href: "/quotes/new",
    },
    {
      title: "Browse Catalogue",
      description: "View products & inventory",
      icon: <Package className="w-6 h-6" />,
      color: "bg-accent",
      href: "/catalogue",
    },
    {
      title: "Upload Documents",
      description: "Add drawings, photos, invoices",
      icon: <FileText className="w-6 h-6" />,
      color: "bg-muted",
      href: "/documents",
    },
  ];

  // Role-based statistics
  const getRoleBasedStats = () => {
    const baseStats = [
      {
        title: "Active Projects",
        value: "12",
        change: "+2 this month",
        trend: "up",
        icon: <Zap className="w-5 h-5" />,
        roles: [
          UserRole.USER,
          UserRole.PARTNER,
          UserRole.SALES,
          UserRole.ADMIN,
          UserRole.GLOBAL_ADMIN,
        ],
      },
      {
        title: "Pending Quotes",
        value: "8",
        change: "3 expiring soon",
        trend: "neutral",
        icon: <FileText className="w-5 h-5" />,
        roles: [
          UserRole.USER,
          UserRole.PARTNER,
          UserRole.SALES,
          UserRole.ADMIN,
          UserRole.GLOBAL_ADMIN,
        ],
      },
    ];

    if (hasPermission("analytics.view")) {
      baseStats.push(
        {
          title: "Total Revenue",
          value: "$1.2M",
          change: "+15% this quarter",
          trend: "up",
          icon: <DollarSign className="w-5 h-5" />,
          roles: [UserRole.SALES, UserRole.ADMIN, UserRole.GLOBAL_ADMIN],
        },
        {
          title: "Avg. Project Value",
          value: "$98K",
          change: "+$12K from last month",
          trend: "up",
          icon: <TrendingUp className="w-5 h-5" />,
          roles: [UserRole.SALES, UserRole.ADMIN, UserRole.GLOBAL_ADMIN],
        },
      );
    }

    if (user?.role === UserRole.ADMIN || user?.role === UserRole.GLOBAL_ADMIN) {
      baseStats.push({
        title: "System Users",
        value: "156",
        change: "+8 this week",
        trend: "up",
        icon: <Users className="w-5 h-5" />,
        roles: [UserRole.ADMIN, UserRole.GLOBAL_ADMIN],
      });
    }

    if (user?.role === UserRole.GLOBAL_ADMIN) {
      baseStats.push({
        title: "System Health",
        value: "99.8%",
        change: "All systems operational",
        trend: "up",
        icon: <CheckCircle2 className="w-5 h-5" />,
        roles: [UserRole.GLOBAL_ADMIN],
      });
    }

    return baseStats.filter(
      (stat) => !stat.roles || stat.roles.includes(user?.role || UserRole.USER),
    );
  };

  const stats = getRoleBasedStats();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-secondary text-secondary-foreground";
      case "In Progress":
        return "bg-primary text-primary-foreground";
      case "Planning":
        return "bg-accent text-accent-foreground";
      case "Quoting":
        return "bg-muted text-muted-foreground";
      case "Draft":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Logo size="xl" />
          </div>
          <RoleBasedNavigation variant="header" className="hidden md:flex" />
          <div className="flex items-center space-x-3">
            <PermissionGate permission="analytics.view">
              <Button variant="ghost" size="icon">
                <Bell className="w-5 h-5" />
              </Button>
            </PermissionGate>
            <PermissionGate permission="settings.view">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/settings">
                  <Settings className="w-5 h-5" />
                </Link>
              </Button>
            </PermissionGate>
            <RoleBasedNavigation variant="dropdown" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-8 h-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {user?.name?.charAt(0) || user?.firstName?.charAt(0) || "U"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                  <p className="text-xs text-muted-foreground">
                    {user?.company}
                  </p>
                  <div className="mt-2">
                    <UserRoleIndicator size="sm" />
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Account Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logout}
                  className="text-red-600 focus:text-red-600"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <div className="flex items-center gap-3">
              <p className="text-muted-foreground">
                Welcome back, {user?.name || user?.firstName || "User"}. Here's
                your EV project overview.
              </p>
              {!loading && (
                <Badge variant="secondary" className="text-xs">
                  {isSupabaseConnected ? "☁️ Cloud Storage" : "💾 Ready to Use"}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <RoleQuickActions />
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
            <Button size="sm" asChild>
              <Link to="/projects/new">
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Link>
            </Button>
          </div>
        </div>

        {/* Optional Cloud Storage Upgrade - only show if user explicitly wants it */}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p
                      className={`text-xs mt-1 ${stat.trend === "up" ? "text-secondary" : "text-muted-foreground"}`}
                    >
                      {stat.change}
                    </p>
                  </div>
                  <div className="text-primary">{stat.icon}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <Link key={index} to={action.href}>
                  <div className="p-4 rounded-lg border hover:border-primary transition-colors cursor-pointer group">
                    <div
                      className={`w-12 h-12 rounded-lg ${action.color} text-white flex items-center justify-center mb-3 group-hover:scale-105 transition-transform`}
                    >
                      {action.icon}
                    </div>
                    <h3 className="font-medium mb-1">{action.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {action.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Knowledge Base Widget */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <KnowledgeBaseWidget />
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-primary" />
                Quick Help
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-1">
                    New to EV Charging?
                  </h4>
                  <p className="text-sm text-blue-700">
                    Start with our installation basics guide to understand the
                    fundamentals.
                  </p>
                </div>

                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-1">
                    Need Support?
                  </h4>
                  <p className="text-sm text-green-700 mb-2">
                    Our technical team is here to help with installations and
                    troubleshooting.
                  </p>
                  <Button size="sm" variant="outline" className="w-full">
                    Contact Support
                  </Button>
                </div>

                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <h4 className="font-medium text-purple-900 mb-1">
                    Training Available
                  </h4>
                  <p className="text-sm text-purple-700 mb-2">
                    Join our upcoming EV charging certification courses.
                  </p>
                  <Button size="sm" variant="outline" className="w-full">
                    View Courses
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="projects">Recent Projects</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="activity">Activity Feed</TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Projects</CardTitle>
                  <CardDescription>
                    Your latest EV infrastructure projects
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm">
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading ? (
                    <div className="p-6 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        <span>Loading projects...</span>
                      </div>
                    </div>
                  ) : recentProjects.length === 0 ? (
                    <div className="p-6 text-center">
                      <div className="space-y-4">
                        <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                          <FileText className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <div>
                          <h3 className="font-medium">No projects yet</h3>
                          <p className="text-sm text-muted-foreground">
                            Create your first project to get started
                          </p>
                        </div>
                        <Button asChild>
                          <Link to="/projects/new">
                            <Plus className="w-4 h-4 mr-2" />
                            Create Project
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    recentProjects.map((project, index) => (
                      <div
                        key={index}
                        className="p-4 border rounded-lg hover:border-primary transition-colors"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-medium">{project.name}</h3>
                              <Badge
                                className={getStatusColor(project.status)}
                                variant="secondary"
                              >
                                {project.isDraft
                                  ? `Draft - Step ${project.draftStep}/6`
                                  : project.status}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                {project.client}
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {project.location}
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {project.deadline}
                              </div>
                            </div>
                            <div className="mt-3">
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span>Progress</span>
                                <span>{project.progress}%</span>
                              </div>
                              <Progress
                                value={project.progress}
                                className="h-2"
                              />
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="font-medium">{project.value}</div>
                              <div className="text-sm text-muted-foreground">
                                {project.type}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {project.isDraft ? (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    asChild
                                    className="text-primary hover:text-primary"
                                  >
                                    <Link
                                      to={`/projects/new?draft=${project.id}`}
                                    >
                                      <Edit className="w-4 h-4 mr-1" />
                                      Resume Draft
                                    </Link>
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      if (confirm("Delete this draft?")) {
                                        const drafts = JSON.parse(
                                          localStorage.getItem(
                                            "chargeSourceDrafts",
                                          ) || "[]",
                                        );
                                        const filteredDrafts = drafts.filter(
                                          (d: any) => d.id !== project.id,
                                        );
                                        localStorage.setItem(
                                          "chargeSourceDrafts",
                                          JSON.stringify(filteredDrafts),
                                        );
                                        loadProjects(); // Reload projects
                                      }
                                    }}
                                    className="text-red-600 hover:text-red-600"
                                  >
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    asChild
                                    className="text-blue-600 hover:text-blue-600 hover:bg-blue-50 border-blue-200"
                                  >
                                    <Link to={`/projects/${project.id}`}>
                                      <Eye className="w-4 h-4 mr-1" />
                                      View
                                    </Link>
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEditProject(project)}
                                    className="text-green-600 hover:text-green-600 hover:bg-green-50 border-green-200"
                                  >
                                    <Edit className="w-4 h-4 mr-1" />
                                    Edit
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleCreateQuote(project)}
                                    className="text-purple-600 hover:text-purple-600 hover:bg-purple-50 border-purple-200"
                                  >
                                    <Calculator className="w-4 h-4 mr-1" />
                                    Quote
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Growth</CardTitle>
                  <CardDescription>Monthly revenue trend</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-48 flex items-center justify-center text-muted-foreground">
                    Revenue chart placeholder - Connect to data visualization
                    library
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Project Types</CardTitle>
                  <CardDescription>
                    Distribution by charging type
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Commercial DC Fast</span>
                      <span className="text-sm font-medium">45%</span>
                    </div>
                    <Progress value={45} />
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Residential AC</span>
                      <span className="text-sm font-medium">30%</span>
                    </div>
                    <Progress value={30} />
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Public DC</span>
                      <span className="text-sm font-medium">25%</span>
                    </div>
                    <Progress value={25} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest updates across your projects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      icon: <CheckCircle2 className="w-4 h-4 text-secondary" />,
                      text: "Quote approved for Westfield Shopping Centre project",
                      time: "2 hours ago",
                    },
                    {
                      icon: <Clock className="w-4 h-4 text-primary" />,
                      text: "Site assessment scheduled for Parramatta Residential Complex",
                      time: "4 hours ago",
                    },
                    {
                      icon: <Package className="w-4 h-4 text-accent" />,
                      text: "Equipment delivered to Melbourne Council project",
                      time: "1 day ago",
                    },
                    {
                      icon: (
                        <AlertCircle className="w-4 h-4 text-destructive" />
                      ),
                      text: "Compliance review required for Fleet Depot project",
                      time: "2 days ago",
                    },
                    {
                      icon: <DollarSign className="w-4 h-4 text-secondary" />,
                      text: "Payment received for completed Council Car Park project",
                      time: "3 days ago",
                    },
                  ].map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors"
                    >
                      {activity.icon}
                      <div className="flex-1">
                        <p className="text-sm">{activity.text}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
