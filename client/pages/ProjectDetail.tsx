import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Logo } from "@/components/ui/logo";
import { useAuth } from "@/hooks/useAuth";
import { safeGetLocal } from "@/lib/safeLocalStorage";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Building,
  Zap,
  Edit,
  Plus,
  CheckCircle2,
  AlertCircle,
  XCircle,
  PlayCircle,
  PauseCircle,
  FileText,
  MessageSquare,
  UserPlus,
  Upload,
  Download,
  Share,
  Settings,
  MoreHorizontal,
  Bell,
  Activity,
  TrendingUp,
  Target,
  CheckSquare,
  AlertTriangle,
  Info,
  Send,
} from "lucide-react";

interface ProjectMilestone {
  id: string;
  title: string;
  description: string;
  status: "pending" | "in-progress" | "completed" | "overdue";
  dueDate: string;
  assignee?: string;
  completedDate?: string;
  dependencies?: string[];
}

interface ProjectComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  message: string;
  timestamp: string;
  type: "comment" | "status-update" | "milestone" | "file";
  attachments?: string[];
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  status: "active" | "away" | "offline";
  lastSeen?: string;
}

interface ProjectStatus {
  current: string;
  lastUpdate: string;
  updatedBy: string;
  notes?: string;
}

interface Project {
  id: string;
  name: string;
  client: string;
  status: string;
  progress: number;
  value: string;
  deadline: string;
  location: string;
  type: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  siteAddress?: string;
  milestones: ProjectMilestone[];
  comments: ProjectComment[];
  teamMembers: TeamMember[];
  statusHistory: ProjectStatus[];
  _originalData?: any;
}

export default function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [newComment, setNewComment] = useState("");
  const [isAddingMilestone, setIsAddingMilestone] = useState(false);
  const [isAddingTeamMember, setIsAddingTeamMember] = useState(false);
  const [newMilestone, setNewMilestone] = useState({
    title: "",
    description: "",
    dueDate: "",
    assignee: "",
  });
  const [newTeamMember, setNewTeamMember] = useState({
    name: "",
    email: "",
    role: "",
  });

  // Load project data
  useEffect(() => {
    if (!projectId) {
      navigate("/projects");
      return;
    }

    loadProject();
  }, [projectId]);

  const loadProject = async () => {
    try {
      setLoading(true);

      // Load from localStorage projects
      const localProjects = safeGetLocal("chargeSourceProjects", []);
      let foundProject = localProjects.find((p: any) => p.id === projectId);

      // Load from drafts if not found in projects
      if (!foundProject) {
        const drafts = safeGetLocal("chargeSourceDrafts", []);
        foundProject = drafts.find((d: any) => d.id === projectId);
      }

      if (!foundProject) {
        // Create mock project for demo purposes
        foundProject = createMockProject(projectId);
      }

      // Transform project data to include collaboration features
      const enhancedProject: Project = {
        id: foundProject.id,
        name:
          foundProject.projectInfo?.name ||
          foundProject.name ||
          "Unknown Project",
        client:
          foundProject.projectInfo?.client ||
          foundProject.client_name ||
          foundProject.client ||
          "Unknown Client",
        status: foundProject.status || "Planning",
        progress: foundProject.progress || 0,
        value:
          foundProject.estimatedBudget ||
          foundProject.estimated_budget ||
          foundProject.value ||
          "TBD",
        deadline:
          foundProject.deadline ||
          new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        location:
          foundProject.projectInfo?.address ||
          foundProject.site_address ||
          foundProject.location ||
          "TBD",
        type:
          foundProject.projectInfo?.type ||
          foundProject.site_type ||
          foundProject.type ||
          "EV Charging Project",
        description:
          foundProject.projectInfo?.objective ||
          foundProject.project_objective ||
          foundProject.description ||
          "",
        createdAt:
          foundProject.createdAt ||
          foundProject.created_at ||
          new Date().toISOString(),
        updatedAt:
          foundProject.updatedAt ||
          foundProject.updated_at ||
          new Date().toISOString(),
        contactPerson:
          foundProject.clientRequirements?.contactPersonName ||
          foundProject.contactPerson ||
          "",
        phone:
          foundProject.clientRequirements?.contactPhone ||
          foundProject.phone ||
          "",
        email:
          foundProject.clientRequirements?.contactEmail ||
          foundProject.email ||
          "",
        siteAddress:
          foundProject.siteAssessment?.siteAddress ||
          foundProject.site_address ||
          "",
        milestones: foundProject.milestones || createDefaultMilestones(),
        comments: foundProject.comments || createMockComments(),
        teamMembers: foundProject.teamMembers || createMockTeamMembers(),
        statusHistory: foundProject.statusHistory || createMockStatusHistory(),
        _originalData: foundProject,
      };

      setProject(enhancedProject);
    } catch (error) {
      console.error("Error loading project:", error);
      // Navigate back if project not found
      navigate("/projects");
    } finally {
      setLoading(false);
    }
  };

  const createMockProject = (id: string): any => ({
    id,
    name: "Sample EV Charging Project",
    client: "Demo Client",
    status: "In Progress",
    progress: 45,
    value: "$125,000",
    deadline: new Date(
      Date.now() + 60 * 24 * 60 * 60 * 1000,
    ).toLocaleDateString(),
    location: "Sydney, NSW",
    type: "Commercial DC Fast Charging",
    description:
      "Installation of DC fast charging infrastructure for commercial use",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const createDefaultMilestones = (): ProjectMilestone[] => [
    {
      id: "milestone-1",
      title: "Initial Site Assessment",
      description: "Complete electrical and site evaluation",
      status: "completed",
      dueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      assignee: "Technical Team",
      completedDate: new Date(
        Date.now() - 10 * 24 * 60 * 60 * 1000,
      ).toISOString(),
    },
    {
      id: "milestone-2",
      title: "Permit Applications",
      description: "Submit all required permits and approvals",
      status: "in-progress",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      assignee: "Compliance Team",
    },
    {
      id: "milestone-3",
      title: "Equipment Procurement",
      description: "Order charging equipment and electrical components",
      status: "pending",
      dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
      assignee: "Procurement Team",
      dependencies: ["milestone-2"],
    },
    {
      id: "milestone-4",
      title: "Installation",
      description: "Complete physical installation of charging infrastructure",
      status: "pending",
      dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
      assignee: "Installation Team",
      dependencies: ["milestone-3"],
    },
    {
      id: "milestone-5",
      title: "Testing & Commissioning",
      description: "Complete testing and system commissioning",
      status: "pending",
      dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      assignee: "Technical Team",
      dependencies: ["milestone-4"],
    },
  ];

  const createMockComments = (): ProjectComment[] => [
    {
      id: "comment-1",
      userId: "user-1",
      userName: "Sarah Wilson",
      message:
        "Initial site survey completed. Electrical capacity looks good for the planned installation.",
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      type: "comment",
    },
    {
      id: "comment-2",
      userId: "user-2",
      userName: "Mike Chen",
      message:
        "Permit applications have been submitted to the local council. Expecting approval within 10 business days.",
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      type: "status-update",
    },
    {
      id: "comment-3",
      userId: "user-3",
      userName: "Emma Davis",
      message:
        "Client has confirmed final charger specifications. Proceeding with equipment ordering.",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      type: "milestone",
    },
  ];

  const createMockTeamMembers = (): TeamMember[] => [
    {
      id: "user-1",
      name: "Sarah Wilson",
      email: "sarah.wilson@chargesource.com",
      role: "Project Manager",
      status: "active",
      avatar: "/api/placeholder/32/32",
    },
    {
      id: "user-2",
      name: "Mike Chen",
      email: "mike.chen@chargesource.com",
      role: "Electrical Engineer",
      status: "active",
      avatar: "/api/placeholder/32/32",
    },
    {
      id: "user-3",
      name: "Emma Davis",
      email: "emma.davis@chargesource.com",
      role: "Installation Coordinator",
      status: "away",
      lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      avatar: "/api/placeholder/32/32",
    },
  ];

  const createMockStatusHistory = (): ProjectStatus[] => [
    {
      current: "Planning",
      lastUpdate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedBy: "System",
      notes: "Project created and initial planning phase started",
    },
    {
      current: "Site Assessment",
      lastUpdate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      updatedBy: "Sarah Wilson",
      notes: "Site survey and electrical assessment completed",
    },
    {
      current: "In Progress",
      lastUpdate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updatedBy: "Mike Chen",
      notes: "Permit applications submitted, procurement phase started",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "in-progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "overdue":
        return "bg-red-100 text-red-800 border-red-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getMilestoneIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case "in-progress":
        return <PlayCircle className="w-4 h-4 text-blue-600" />;
      case "overdue":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const handleStatusUpdate = (newStatus: string) => {
    if (!project) return;

    const updatedProject = {
      ...project,
      status: newStatus,
      updatedAt: new Date().toISOString(),
      statusHistory: [
        ...project.statusHistory,
        {
          current: newStatus,
          lastUpdate: new Date().toISOString(),
          updatedBy: user?.name || "Current User",
          notes: `Status updated to ${newStatus}`,
        },
      ],
    };

    setProject(updatedProject);
    updateProjectInStorage(updatedProject);
  };

  const handleMilestoneUpdate = (milestoneId: string, status: string) => {
    if (!project) return;

    const updatedMilestones = project.milestones.map((milestone) =>
      milestone.id === milestoneId
        ? {
            ...milestone,
            status: status as any,
            completedDate:
              status === "completed" ? new Date().toISOString() : undefined,
          }
        : milestone,
    );

    const updatedProject = {
      ...project,
      milestones: updatedMilestones,
      updatedAt: new Date().toISOString(),
    };

    setProject(updatedProject);
    updateProjectInStorage(updatedProject);
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !project || !user) return;

    const comment: ProjectComment = {
      id: `comment-${Date.now()}`,
      userId: user.id,
      userName: user.name || "Unknown User",
      message: newComment,
      timestamp: new Date().toISOString(),
      type: "comment",
    };

    const updatedProject = {
      ...project,
      comments: [...project.comments, comment],
      updatedAt: new Date().toISOString(),
    };

    setProject(updatedProject);
    setNewComment("");
    updateProjectInStorage(updatedProject);
  };

  const handleAddMilestone = () => {
    if (!newMilestone.title || !project) return;

    const milestone: ProjectMilestone = {
      id: `milestone-${Date.now()}`,
      title: newMilestone.title,
      description: newMilestone.description,
      status: "pending",
      dueDate:
        newMilestone.dueDate ||
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      assignee: newMilestone.assignee,
    };

    const updatedProject = {
      ...project,
      milestones: [...project.milestones, milestone],
      updatedAt: new Date().toISOString(),
    };

    setProject(updatedProject);
    setNewMilestone({ title: "", description: "", dueDate: "", assignee: "" });
    setIsAddingMilestone(false);
    updateProjectInStorage(updatedProject);
  };

  const handleAddTeamMember = () => {
    if (!newTeamMember.name || !newTeamMember.email || !project) return;

    const member: TeamMember = {
      id: `user-${Date.now()}`,
      name: newTeamMember.name,
      email: newTeamMember.email,
      role: newTeamMember.role || "Team Member",
      status: "active",
    };

    const updatedProject = {
      ...project,
      teamMembers: [...project.teamMembers, member],
      updatedAt: new Date().toISOString(),
    };

    setProject(updatedProject);
    setNewTeamMember({ name: "", email: "", role: "" });
    setIsAddingTeamMember(false);
    updateProjectInStorage(updatedProject);
  };

  const updateProjectInStorage = (updatedProject: Project) => {
    // Update in localStorage projects
    const localProjects = safeGetLocal("chargeSourceProjects", []);
    const projectIndex = localProjects.findIndex(
      (p: any) => p.id === updatedProject.id,
    );

    if (projectIndex >= 0) {
      localProjects[projectIndex] = {
        ...localProjects[projectIndex],
        ...updatedProject,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(
        "chargeSourceProjects",
        JSON.stringify(localProjects),
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">
                Loading project details...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Project Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The project you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <Link to="/projects">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Projects
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link to="/projects">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Projects
              </Link>
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <Logo size="xl" />
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Share className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button size="sm" asChild>
              <Link to={`/projects/${project.id}/edit`}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Project
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Project Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
              <div className="flex items-center gap-4 text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Building className="w-4 h-4" />
                  {project.client}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {project.location}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Due {new Date(project.deadline).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold mb-1">{project.value}</div>
              <Badge
                className={getStatusColor(project.status)}
                variant="secondary"
              >
                {project.status}
              </Badge>
            </div>
          </div>

          {/* Progress Overview */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">
                    Overall Progress
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={project.progress} className="flex-1" />
                    <span className="text-sm font-medium">
                      {project.progress}%
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">
                    Milestones
                  </div>
                  <div className="text-lg font-semibold">
                    {
                      project.milestones.filter((m) => m.status === "completed")
                        .length
                    }{" "}
                    / {project.milestones.length}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">
                    Team Members
                  </div>
                  <div className="text-lg font-semibold">
                    {project.teamMembers.length}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">
                    Days Remaining
                  </div>
                  <div className="text-lg font-semibold">
                    {Math.max(
                      0,
                      Math.ceil(
                        (new Date(project.deadline).getTime() -
                          new Date().getTime()) /
                          (1000 * 60 * 60 * 24),
                      ),
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Project Details */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Project Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {project.description && (
                      <div>
                        <Label className="text-sm font-medium">
                          Description
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          {project.description}
                        </p>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">
                          Project Type
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          {project.type}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">
                          Site Address
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          {project.siteAddress || project.location}
                        </p>
                      </div>
                      {project.contactPerson && (
                        <div>
                          <Label className="text-sm font-medium">
                            Contact Person
                          </Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            {project.contactPerson}
                          </p>
                        </div>
                      )}
                      {project.phone && (
                        <div>
                          <Label className="text-sm font-medium">Phone</Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            {project.phone}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Milestones */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Recent Milestones</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveTab("timeline")}
                    >
                      View All
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {project.milestones.slice(0, 3).map((milestone) => (
                        <div
                          key={milestone.id}
                          className="flex items-center gap-3 p-3 border rounded-lg"
                        >
                          {getMilestoneIcon(milestone.status)}
                          <div className="flex-1">
                            <div className="font-medium">{milestone.title}</div>
                            <div className="text-sm text-muted-foreground">
                              Due{" "}
                              {new Date(milestone.dueDate).toLocaleDateString()}
                              {milestone.assignee && ` • ${milestone.assignee}`}
                            </div>
                          </div>
                          <Badge
                            className={getStatusColor(milestone.status)}
                            variant="secondary"
                          >
                            {milestone.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Status Updates */}
                <Card>
                  <CardHeader>
                    <CardTitle>Status Management</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">
                        Current Status
                      </Label>
                      <Select
                        value={project.status}
                        onValueChange={handleStatusUpdate}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Planning">Planning</SelectItem>
                          <SelectItem value="Site Assessment">
                            Site Assessment
                          </SelectItem>
                          <SelectItem value="Permits">Permits</SelectItem>
                          <SelectItem value="In Progress">
                            In Progress
                          </SelectItem>
                          <SelectItem value="Testing">Testing</SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                          <SelectItem value="On Hold">On Hold</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">
                        Last Updated
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(project.updatedAt).toLocaleDateString()} by{" "}
                        {project.statusHistory[project.statusHistory.length - 1]
                          ?.updatedBy || "System"}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Team Quick View */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Team</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveTab("team")}
                    >
                      Manage
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {project.teamMembers.slice(0, 3).map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center gap-3"
                        >
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback>
                              {member.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="text-sm font-medium">
                              {member.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {member.role}
                            </div>
                          </div>
                          <div
                            className={`w-2 h-2 rounded-full ${
                              member.status === "active"
                                ? "bg-green-500"
                                : member.status === "away"
                                  ? "bg-yellow-500"
                                  : "bg-gray-400"
                            }`}
                          />
                        </div>
                      ))}
                      {project.teamMembers.length > 3 && (
                        <div className="text-xs text-muted-foreground text-center pt-2">
                          +{project.teamMembers.length - 3} more members
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Project Timeline</h2>
              <Dialog
                open={isAddingMilestone}
                onOpenChange={setIsAddingMilestone}
              >
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Milestone
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Milestone</DialogTitle>
                    <DialogDescription>
                      Create a new milestone to track project progress.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="milestone-title">Title</Label>
                      <Input
                        id="milestone-title"
                        value={newMilestone.title}
                        onChange={(e) =>
                          setNewMilestone({
                            ...newMilestone,
                            title: e.target.value,
                          })
                        }
                        placeholder="Milestone title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="milestone-description">Description</Label>
                      <Textarea
                        id="milestone-description"
                        value={newMilestone.description}
                        onChange={(e) =>
                          setNewMilestone({
                            ...newMilestone,
                            description: e.target.value,
                          })
                        }
                        placeholder="Milestone description"
                      />
                    </div>
                    <div>
                      <Label htmlFor="milestone-due">Due Date</Label>
                      <Input
                        id="milestone-due"
                        type="date"
                        value={newMilestone.dueDate}
                        onChange={(e) =>
                          setNewMilestone({
                            ...newMilestone,
                            dueDate: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="milestone-assignee">Assignee</Label>
                      <Select
                        value={newMilestone.assignee}
                        onValueChange={(value) =>
                          setNewMilestone({ ...newMilestone, assignee: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select assignee" />
                        </SelectTrigger>
                        <SelectContent>
                          {project.teamMembers.map((member) => (
                            <SelectItem key={member.id} value={member.name}>
                              {member.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsAddingMilestone(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleAddMilestone}>Add Milestone</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {project.milestones.map((milestone, index) => (
                    <div key={milestone.id} className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        {getMilestoneIcon(milestone.status)}
                        {index < project.milestones.length - 1 && (
                          <div className="w-px h-8 bg-border mt-2" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">{milestone.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {milestone.description}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span>
                                Due:{" "}
                                {new Date(
                                  milestone.dueDate,
                                ).toLocaleDateString()}
                              </span>
                              {milestone.assignee && (
                                <span>Assigned to: {milestone.assignee}</span>
                              )}
                              {milestone.completedDate && (
                                <span>
                                  Completed:{" "}
                                  {new Date(
                                    milestone.completedDate,
                                  ).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              className={getStatusColor(milestone.status)}
                              variant="secondary"
                            >
                              {milestone.status}
                            </Badge>
                            <Select
                              value={milestone.status}
                              onValueChange={(status) =>
                                handleMilestoneUpdate(milestone.id, status)
                              }
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="in-progress">
                                  In Progress
                                </SelectItem>
                                <SelectItem value="completed">
                                  Completed
                                </SelectItem>
                                <SelectItem value="overdue">Overdue</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Team Management</h2>
              <Dialog
                open={isAddingTeamMember}
                onOpenChange={setIsAddingTeamMember}
              >
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Team Member
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Team Member</DialogTitle>
                    <DialogDescription>
                      Add a new team member to this project.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="member-name">Name</Label>
                      <Input
                        id="member-name"
                        value={newTeamMember.name}
                        onChange={(e) =>
                          setNewTeamMember({
                            ...newTeamMember,
                            name: e.target.value,
                          })
                        }
                        placeholder="Full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="member-email">Email</Label>
                      <Input
                        id="member-email"
                        type="email"
                        value={newTeamMember.email}
                        onChange={(e) =>
                          setNewTeamMember({
                            ...newTeamMember,
                            email: e.target.value,
                          })
                        }
                        placeholder="email@example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="member-role">Role</Label>
                      <Select
                        value={newTeamMember.role}
                        onValueChange={(value) =>
                          setNewTeamMember({ ...newTeamMember, role: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Project Manager">
                            Project Manager
                          </SelectItem>
                          <SelectItem value="Electrical Engineer">
                            Electrical Engineer
                          </SelectItem>
                          <SelectItem value="Installation Coordinator">
                            Installation Coordinator
                          </SelectItem>
                          <SelectItem value="Compliance Officer">
                            Compliance Officer
                          </SelectItem>
                          <SelectItem value="Client Liaison">
                            Client Liaison
                          </SelectItem>
                          <SelectItem value="Team Member">
                            Team Member
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsAddingTeamMember(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleAddTeamMember}>Add Member</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {project.teamMembers.map((member) => (
                <Card key={member.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {member.role}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {member.email}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            member.status === "active"
                              ? "bg-green-500"
                              : member.status === "away"
                                ? "bg-yellow-500"
                                : "bg-gray-400"
                          }`}
                        />
                        <span className="text-xs text-muted-foreground capitalize">
                          {member.status}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Project Activity</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Activity Feed</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-96 pr-4">
                      <div className="space-y-4">
                        {project.comments.map((comment) => (
                          <div key={comment.id} className="flex gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={comment.userAvatar} />
                              <AvatarFallback>
                                {comment.userName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium">
                                  {comment.userName}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(
                                    comment.timestamp,
                                  ).toLocaleDateString()}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {comment.type}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {comment.message}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Add Comment</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      placeholder="Write a comment or update..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={4}
                    />
                    <Button onClick={handleAddComment} className="w-full">
                      <Send className="w-4 h-4 mr-2" />
                      Post Comment
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Project Documents</h2>
              <Button>
                <Upload className="w-4 h-4 mr-2" />
                Upload Document
              </Button>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Documents Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Upload project documents, permits, and files to keep
                    everything organized.
                  </p>
                  <Button>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload First Document
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
