import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Link, useNavigate } from "react-router-dom";
import { quoteService } from "@/lib/quoteService";
import {
  PlugZap,
  Plus,
  Calendar,
  DollarSign,
  MapPin,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Eye,
  Edit,
  Copy,
  Trash2,
  MoreHorizontal,
  Users,
  Package,
  FileText,
  Settings,
  Bell,
  User,
  LogOut,
  Grid3X3,
  List,
  Map,
  Clock,
  AlertCircle,
  CheckCircle2,
  Zap,
  Building,
  Home,
  Factory,
  Store,
  Truck,
  Download,
  Upload,
  RefreshCw,
  Calculator,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { projectService, autoConfigureSupabase } from "@/lib/supabase";
import { safeGetLocal, generateId } from "@/lib/safeLocalStorage";
import { useAuth } from "@/hooks/useAuth";

// Google Maps integration types
declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
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
  latitude?: number;
  longitude?: number;
  isDraft?: boolean;
  draftStep?: number;
  createdAt?: string;
  updatedAt?: string;
  estimatedBudget?: string;
  timeline?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  siteAddress?: string;
  description?: string;
  _originalData?: any; // Store complete original project data for editing
}

export default function Projects() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("updated");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [viewMode, setViewMode] = useState<"grid" | "list" | "map">("grid");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  // Simple debounce hook for search
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Sample fallback projects with coordinates for demo
  const sampleProjects: Project[] = [
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
      latitude: -33.8688,
      longitude: 151.2093,
      contactPerson: "Sarah Johnson",
      phone: "(02) 9876 5432",
      email: "sarah.johnson@westfield.com",
      siteAddress:
        "Level 3, Westfield Sydney, Pitt Street Mall, Sydney NSW 2000",
      description:
        "Installation of 8x 50kW DC fast chargers in the main car park area",
      createdAt: "2024-01-15",
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
      latitude: -33.815,
      longitude: 151.0,
      contactPerson: "Michael Chen",
      phone: "(02) 8765 4321",
      email: "m.chen@mirvac.com",
      siteAddress: "123 Church Street, Parramatta NSW 2150",
      description: "22kW AC chargers for resident parking spaces",
      createdAt: "2024-01-20",
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
      latitude: -37.8136,
      longitude: 144.9631,
      contactPerson: "Emma Wilson",
      phone: "(03) 9658 9658",
      email: "e.wilson@melbourne.vic.gov.au",
      siteAddress: "Collins Street Car Park, Melbourne VIC 3000",
      description:
        "Public charging infrastructure upgrade with 6x 75kW DC chargers",
      createdAt: "2023-12-10",
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
      latitude: -27.4698,
      longitude: 153.0251,
      contactPerson: "David Kim",
      phone: "(07) 3123 4567",
      email: "david.kim@auspost.com.au",
      siteAddress: "Australia Post Depot, Eagle Farm QLD 4009",
      description:
        "Fleet charging infrastructure for electric delivery vehicles",
      createdAt: "2024-01-25",
    },
  ];

  // Load projects from various sources
  const loadProjects = async () => {
    try {
      setLoading(true);

      // Check Supabase connection
      const isConnected = await autoConfigureSupabase();
      setIsSupabaseConnected(isConnected);

      let loadedProjects: Project[] = [];

      // Load from Supabase if connected
      if (isConnected) {
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
            siteAddress: project.site_address,
            description: project.notes || project.project_objective,
            createdAt: project.created_at,
            // Add coordinates if available (would come from geocoding service)
            latitude: undefined, // TODO: Geocode addresses
            longitude: undefined,
          }));
        } catch (error) {
          console.error("Error loading projects from Supabase:", error);
        }
      }

      // Load from localStorage and preserve all detailed data
      const localProjects = safeGetLocal("chargeSourceProjects", []);
      const formattedLocalProjects = localProjects.map((project: any) => ({
        id: project.id || generateId("PRJ-"),
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
        siteAddress: project.projectInfo?.address || project.site_address,
        description:
          project.projectInfo?.objective || project.project_objective,
        createdAt: project.createdAt || project.created_at,
        timeline: project.timeline,
        // Extract contact details from detailed data if available
        contactPerson:
          project.clientRequirements?.contactPersonName ||
          project.contactPerson,
        phone: project.clientRequirements?.contactPhone || project.phone,
        email: project.clientRequirements?.contactEmail || project.email,
        // Preserve all detailed wizard data for editing
        _originalData: project, // Store the complete original project data
      }));

      // Load drafts for current user
      const drafts = safeGetLocal("chargeSourceDrafts", []);
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
          siteAddress: draft.siteAssessment?.siteAddress,
          description: draft.clientRequirements?.projectObjective,
          contactPerson: draft.clientRequirements?.contactPersonName,
          phone: draft.clientRequirements?.contactPhone,
          email: draft.clientRequirements?.contactEmail,
          // Preserve complete draft data for editing
          _originalData: draft,
        }));

      // Combine all projects
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
      const finalProjects =
        uniqueProjects.length > 0 ? uniqueProjects : sampleProjects;
      setProjects(finalProjects);
      setFilteredProjects(finalProjects);
    } catch (error) {
      console.error("Error loading projects:", error);
      setProjects(sampleProjects);
      setFilteredProjects(sampleProjects);
    } finally {
      setLoading(false);
    }
  };

  // Initialize Google Maps
  const initializeMap = () => {
    if (typeof window.google === "undefined" || !mapRef.current) return;

    const map = new window.google.maps.Map(mapRef.current, {
      zoom: 6,
      center: { lat: -25.2744, lng: 133.7751 }, // Center of Australia
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: true,
    });

    mapInstanceRef.current = map;
    updateMapMarkers();
  };

  // Update map markers based on filtered projects
  const updateMapMarkers = () => {
    if (!mapInstanceRef.current || typeof window.google === "undefined") return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    const bounds = new window.google.maps.LatLngBounds();
    let hasValidCoordinates = false;

    filteredProjects.forEach((project) => {
      if (project.latitude && project.longitude) {
        const marker = new window.google.maps.Marker({
          position: { lat: project.latitude, lng: project.longitude },
          map: mapInstanceRef.current,
          title: project.name,
          icon: {
            url: getMarkerIcon(project.status),
            scaledSize: new window.google.maps.Size(40, 40),
          },
        });

        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 10px; max-width: 300px;">
              <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold;">${project.name}</h3>
              <p style="margin: 0 0 4px 0; color: #666;"><strong>Client:</strong> ${project.client}</p>
              <p style="margin: 0 0 4px 0; color: #666;"><strong>Status:</strong> ${project.status}</p>
              <p style="margin: 0 0 4px 0; color: #666;"><strong>Type:</strong> ${project.type}</p>
              <p style="margin: 0 0 8px 0; color: #666;"><strong>Value:</strong> ${project.value}</p>
              <button onclick="window.viewProject('${project.id}')" style="background: #3b82f6; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">View Project</button>
            </div>
          `,
        });

        marker.addListener("click", () => {
          infoWindow.open(mapInstanceRef.current, marker);
        });

        markersRef.current.push(marker);
        bounds.extend({ lat: project.latitude, lng: project.longitude });
        hasValidCoordinates = true;
      }
    });

    if (hasValidCoordinates) {
      mapInstanceRef.current.fitBounds(bounds);
    }
  };

  // Get marker icon based on project status
  const getMarkerIcon = (status: string) => {
    const iconMap: Record<string, string> = {
      Completed:
        "data:image/svg+xml;base64," +
        btoa(
          `<svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="18" fill="#10b981" stroke="white" stroke-width="2"/><path d="M14 20l4 4 8-8" stroke="white" stroke-width="3" fill="none"/></svg>`,
        ),
      "In Progress":
        "data:image/svg+xml;base64," +
        btoa(
          `<svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="18" fill="#3b82f6" stroke="white" stroke-width="2"/><circle cx="20" cy="20" r="6" fill="white"/></svg>`,
        ),
      Planning:
        "data:image/svg+xml;base64," +
        btoa(
          `<svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="18" fill="#f59e0b" stroke="white" stroke-width="2"/><circle cx="20" cy="20" r="6" fill="white"/></svg>`,
        ),
      Quoting:
        "data:image/svg+xml;base64=" +
        btoa(
          `<svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="18" fill="#8b5cf6" stroke="white" stroke-width="2"/><text x="20" y="25" text-anchor="middle" fill="white" font-size="20" font-weight="bold">$</text></svg>`,
        ),
      Draft:
        "data:image/svg+xml;base64=" +
        btoa(
          `<svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="18" fill="#6b7280" stroke="white" stroke-width="2"/><circle cx="20" cy="20" r="3" fill="white"/></svg>`,
        ),
    };
    return iconMap[status] || iconMap["Planning"];
  };

  // Load Google Maps script
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (typeof window.google !== "undefined") {
        initializeMap();
        return;
      }

      window.initMap = initializeMap;

      const script = document.createElement("script");
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);

      // Fallback: Initialize with mock coordinates if API key is not valid
      script.onerror = () => {
        console.warn(
          "Google Maps API failed to load. Using fallback coordinates.",
        );
        // Could implement a fallback map solution here
      };
    };

    if (viewMode === "map") {
      loadGoogleMaps();
    }

    // Global function for info window buttons
    (window as any).viewProject = (projectId: string) => {
      const project = projects.find((p) => p.id === projectId);
      if (project) {
        setSelectedProject(project);
      }
    };

    return () => {
      delete (window as any).viewProject;
    };
  }, [viewMode, projects]);

  // Update map markers when filtered projects change
  useEffect(() => {
    if (viewMode === "map") {
      updateMapMarkers();
    }
  }, [filteredProjects, viewMode]);

  // Load projects on mount
  useEffect(() => {
    loadProjects();
  }, []);

  // Debounced search implemented above with useState and useEffect

  // Memoized filtering and sorting function
  const filteredAndSortedProjects = useMemo(() => {
    let filtered = [...projects];

    // Search filter
    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase();
      filtered = filtered.filter(
        (project) =>
          project.name.toLowerCase().includes(query) ||
          project.client.toLowerCase().includes(query) ||
          project.location.toLowerCase().includes(query) ||
          project.type.toLowerCase().includes(query),
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((project) => project.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((project) =>
        project.type.includes(typeFilter),
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "client":
          aValue = a.client.toLowerCase();
          bValue = b.client.toLowerCase();
          break;
        case "status":
          aValue = a.status.toLowerCase();
          bValue = b.status.toLowerCase();
          break;
        case "progress":
          aValue = a.progress;
          bValue = b.progress;
          break;
        case "deadline":
          aValue = new Date(a.deadline);
          bValue = new Date(b.deadline);
          break;
        case "updated":
        default:
          aValue = new Date(a.createdAt || a.deadline);
          bValue = new Date(b.createdAt || b.deadline);
          break;
      }

      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [
    projects,
    debouncedSearchQuery,
    statusFilter,
    typeFilter,
    sortBy,
    sortOrder,
  ]);

  // Update filtered projects when memoized result changes
  useEffect(() => {
    setFilteredProjects(filteredAndSortedProjects);
  }, [filteredAndSortedProjects]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "In Progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Planning":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Quoting":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Draft":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTypeIcon = (type: string) => {
    if (type.includes("Residential")) return <Home className="w-4 h-4" />;
    if (type.includes("Commercial") || type.includes("Retail"))
      return <Building className="w-4 h-4" />;
    if (type.includes("Industrial") || type.includes("Fleet"))
      return <Factory className="w-4 h-4" />;
    if (type.includes("Public")) return <Users className="w-4 h-4" />;
    return <Zap className="w-4 h-4" />;
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;

    try {
      // Remove from Supabase if connected
      if (isSupabaseConnected) {
        try {
          await projectService.deleteProject(projectId);
          console.log("✅ Project deleted from cloud:", projectId);
        } catch (cloudError) {
          console.log("⚠️ Could not delete from cloud, using local delete only:", cloudError);
        }
      }

      // Remove from localStorage
      const localProjects = safeGetLocal("chargeSourceProjects", []);
      const filteredLocalProjects = localProjects.filter(
        (p: any) => p.id !== projectId,
      );
      localStorage.setItem(
        "chargeSourceProjects",
        JSON.stringify(filteredLocalProjects),
      );

      // Remove from drafts
      const drafts = safeGetLocal("chargeSourceDrafts", []);
      const filteredDrafts = drafts.filter((d: any) => d.id !== projectId);
      localStorage.setItem(
        "chargeSourceDrafts",
        JSON.stringify(filteredDrafts),
      );

      // Reload projects
      await loadProjects();
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  const handleDuplicateProject = (project: Project) => {
    const duplicatedProject = {
      ...project,
      id: generateId("PRJ-"),
      name: `${project.name} (Copy)`,
      status: "Planning",
      progress: 0,
      createdAt: new Date().toISOString(),
    };

    const localProjects = safeGetLocal("chargeSourceProjects", []);
    localProjects.unshift(duplicatedProject);
    localStorage.setItem("chargeSourceProjects", JSON.stringify(localProjects));

    loadProjects();
  };

  // Handle creating quotes from projects (supports multiple quotes per project)
  const handleCreateQuote = (project: Project) => {
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
        newQuote.description = `${newQuote.description}\n\nThis is a comparison quote for exploring different options and pricing.`;
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

  const handleEditProject = (project: Project) => {
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

      // Debug logging for development
      if (import.meta.env.DEV) {
        console.log("Editing project with original data:", {
          hasOriginalData: !!project._originalData,
          clientReq: originalClientReq,
          siteAssess: originalSiteAssess,
          chargerSel: originalChargerSel,
        });
      }

      // Convert the project data back to wizard format for editing with better data mapping
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
            (project.type.toLowerCase().includes("residential")
              ? "residential"
              : project.type.toLowerCase().includes("commercial") ||
                  project.type.toLowerCase().includes("retail")
                ? "retail"
                : project.type.toLowerCase().includes("fleet")
                  ? "fleet"
                  : project.type.toLowerCase().includes("public")
                    ? "government"
                    : project.type.toLowerCase().includes("office")
                      ? "office"
                      : "other"),
          projectObjective:
            originalClientReq.projectObjective ||
            (project.type.toLowerCase().includes("fleet")
              ? "fleet-electrification"
              : project.type.toLowerCase().includes("residential")
                ? "employee-benefit"
                : project.type.toLowerCase().includes("retail")
                  ? "customer-attraction"
                  : "future-proofing"),
          numberOfVehicles:
            originalClientReq.numberOfVehicles ||
            (project.type.toLowerCase().includes("fleet") ? "31-50" : "6-15"),
          vehicleTypes:
            originalClientReq.vehicleTypes ||
            (project.type.toLowerCase().includes("fleet")
              ? ["Light Commercial", "Delivery Vans"]
              : ["Passenger Cars"]),
          dailyUsagePattern:
            originalClientReq.dailyUsagePattern ||
            (project.type.toLowerCase().includes("residential")
              ? "overnight"
              : project.type.toLowerCase().includes("office")
                ? "business-hours"
                : project.type.toLowerCase().includes("retail")
                  ? "extended-hours"
                  : "business-hours"),
          budgetRange:
            originalClientReq.budgetRange ||
            (project.value === "TBD"
              ? "tbd"
              : project.value.includes("$")
                ? parseInt(project.value.replace(/[$,]/g, "").split("-")[0]) >
                  100000
                  ? "100-250k"
                  : "50-100k"
                : "tbd"),
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
          siteType:
            originalSiteAssess.siteType ||
            (project.type.toLowerCase().includes("residential")
              ? "residential"
              : project.type.toLowerCase().includes("commercial") ||
                  project.type.toLowerCase().includes("retail")
                ? "retail"
                : project.type.toLowerCase().includes("fleet")
                  ? "fleet"
                  : project.type.toLowerCase().includes("public")
                    ? "public"
                    : project.type.toLowerCase().includes("office")
                      ? "office"
                      : "commercial"),
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
          chargingType:
            originalChargerSel.chargingType ||
            (project.type.toLowerCase().includes("fast")
              ? "dc-fast"
              : project.type.toLowerCase().includes("residential")
                ? "ac-level2"
                : ""),
          powerRating:
            originalChargerSel.powerRating ||
            (project.type.toLowerCase().includes("fast")
              ? "50kw"
              : project.type.toLowerCase().includes("residential")
                ? "7kw"
                : ""),
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
        progress: originalProject ? 100 : 33, // If we have original data, show as complete, otherwise start at step 2
      };

      // Save the edit draft
      const existingDrafts = safeGetLocal("chargeSourceDrafts", []);
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

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const renderProjectGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredProjects.map((project) => (
        <Card
          key={project.id}
          className="hover:shadow-lg transition-shadow cursor-pointer"
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {getTypeIcon(project.type)}
                  <CardTitle className="text-lg truncate">
                    {project.name}
                  </CardTitle>
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {project.client}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {project.location}
                  </div>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label="Project actions"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to={`/projects/${project.id}`}>
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Link>
                  </DropdownMenuItem>
                  {project.isDraft ? (
                    <DropdownMenuItem asChild>
                      <Link to={`/projects/new?draft=${project.id}`}>
                        <Edit className="w-4 h-4 mr-2" />
                        Resume Draft
                      </Link>
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      onClick={() => handleEditProject(project)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Project
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => handleCreateQuote(project)}>
                    <Calculator className="w-4 h-4 mr-2" />
                    Create Quote
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleDuplicateProject(project)}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleDeleteProject(project.id)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge
                  className={getStatusColor(project.status)}
                  variant="secondary"
                >
                  {project.isDraft
                    ? `Draft - Step ${project.draftStep}/6`
                    : project.status}
                </Badge>
                <span className="text-sm font-medium">{project.value}</span>
              </div>

              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>Progress</span>
                  <span>{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-2" />
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {project.deadline}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {project.type}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderProjectList = () => (
    <div className="space-y-4">
      {filteredProjects.map((project) => (
        <Card key={project.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                <div className="md:col-span-2">
                  <div className="flex items-center gap-2 mb-1">
                    {getTypeIcon(project.type)}
                    <h3 className="font-medium">{project.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {project.client}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    className={getStatusColor(project.status)}
                    variant="secondary"
                  >
                    {project.isDraft ? `Draft` : project.status}
                  </Badge>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-1.5" />
                </div>

                <div className="text-sm">
                  <div className="font-medium">{project.value}</div>
                  <div className="text-muted-foreground">{project.type}</div>
                </div>

                <div className="text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {project.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {project.deadline}
                  </div>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label="Project actions"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to={`/projects/${project.id}`}>
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Link>
                  </DropdownMenuItem>
                  {project.isDraft ? (
                    <DropdownMenuItem asChild>
                      <Link to={`/projects/new?draft=${project.id}`}>
                        <Edit className="w-4 h-4 mr-2" />
                        Resume Draft
                      </Link>
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      onClick={() => handleEditProject(project)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Project
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => handleCreateQuote(project)}>
                    <Calculator className="w-4 h-4 mr-2" />
                    Create Quote
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleDuplicateProject(project)}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleDeleteProject(project.id)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderMapView = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="w-5 h-5" />
            Project Locations
          </CardTitle>
          <CardDescription>
            Interactive map showing all project sites. Click on markers for
            details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            ref={mapRef}
            className="w-full h-[600px] rounded-lg border bg-muted flex items-center justify-center"
          >
            {typeof window.google === "undefined" ? (
              <div className="text-center">
                <Map className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Loading Google Maps...</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Note: Requires valid Google Maps API key
                </p>
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Logo size="xl" />
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/dashboard"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Dashboard
            </Link>
            <Link to="/projects" className="text-sm font-medium text-primary">
              Projects
            </Link>
            <Link
              to="/quotes"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Quotes
            </Link>
            <Link
              to="/catalogue"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Catalogue
            </Link>
            <Link
              to="/clients"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Clients
            </Link>
          </nav>
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon">
              <Bell className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="w-5 h-5" />
            </Button>
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
                </div>
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
            <h1 className="text-3xl font-bold mb-2">Project Management</h1>
            <div className="flex items-center gap-3">
              <p className="text-muted-foreground">
                Manage all your EV infrastructure projects
              </p>
              {!loading && (
                <Badge variant="secondary" className="text-xs">
                  {filteredProjects.length} of {projects.length} projects
                </Badge>
              )}
              {isSupabaseConnected && (
                <Badge variant="outline" className="text-xs">
                  ☁�� Cloud Storage
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <Button
              variant="outline"
              size="sm"
              onClick={loadProjects}
              disabled={loading}
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button size="sm" asChild>
              <Link to="/projects/new">
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Link>
            </Button>
          </div>
        </div>

        {/* Filters and Controls */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search projects, clients, or locations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Planning">Planning</SelectItem>
                    <SelectItem value="Quoting">Quoting</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Residential">Residential</SelectItem>
                    <SelectItem value="Commercial">Commercial</SelectItem>
                    <SelectItem value="Public">Public</SelectItem>
                    <SelectItem value="Fleet">Fleet</SelectItem>
                    <SelectItem value="Industrial">Industrial</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="updated">Last Updated</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="client">Client</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                    <SelectItem value="progress">Progress</SelectItem>
                    <SelectItem value="deadline">Deadline</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                  }
                >
                  {sortOrder === "asc" ? (
                    <SortAsc className="w-4 h-4" />
                  ) : (
                    <SortDesc className="w-4 h-4" />
                  )}
                </Button>
              </div>

              {/* View Mode Toggle */}
              <div className="flex rounded-md border">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-r-none"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-none border-x"
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "map" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("map")}
                  className="rounded-l-none"
                >
                  <Map className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Projects Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading projects...</p>
            </div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium mb-2">
                {searchQuery || statusFilter !== "all" || typeFilter !== "all"
                  ? "No projects match your filters"
                  : "No projects yet"}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchQuery || statusFilter !== "all" || typeFilter !== "all"
                  ? "Try adjusting your search criteria or filters"
                  : "Create your first project to get started"}
              </p>
              {!(
                searchQuery ||
                statusFilter !== "all" ||
                typeFilter !== "all"
              ) && (
                <Button asChild>
                  <Link to="/projects/new">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Project
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            {viewMode === "grid" && renderProjectGrid()}
            {viewMode === "list" && renderProjectList()}
            {viewMode === "map" && renderMapView()}
          </>
        )}

        {/* Project Details Dialog */}
        <Dialog
          open={!!selectedProject}
          onOpenChange={() => setSelectedProject(null)}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedProject && getTypeIcon(selectedProject.type)}
                {selectedProject?.name}
              </DialogTitle>
              <DialogDescription>
                Project details and site information
              </DialogDescription>
            </DialogHeader>
            {selectedProject && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Client</Label>
                    <p className="text-sm text-muted-foreground">
                      {selectedProject.client}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <Badge
                      className={getStatusColor(selectedProject.status)}
                      variant="secondary"
                    >
                      {selectedProject.isDraft
                        ? `Draft - Step ${selectedProject.draftStep}/6`
                        : selectedProject.status}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Project Value</Label>
                    <p className="text-sm text-muted-foreground">
                      {selectedProject.value}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Deadline</Label>
                    <p className="text-sm text-muted-foreground">
                      {selectedProject.deadline}
                    </p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Site Address</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedProject.siteAddress || selectedProject.location}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium">Project Type</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedProject.type}
                  </p>
                </div>

                {selectedProject.description && (
                  <div>
                    <Label className="text-sm font-medium">Description</Label>
                    <p className="text-sm text-muted-foreground">
                      {selectedProject.description}
                    </p>
                  </div>
                )}

                <div>
                  <Label className="text-sm font-medium">Progress</Label>
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Completion</span>
                      <span>{selectedProject.progress}%</span>
                    </div>
                    <Progress
                      value={selectedProject.progress}
                      className="h-2"
                    />
                  </div>
                </div>

                {selectedProject.contactPerson && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">
                        Contact Person
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {selectedProject.contactPerson}
                      </p>
                    </div>
                    {selectedProject.phone && (
                      <div>
                        <Label className="text-sm font-medium">Phone</Label>
                        <p className="text-sm text-muted-foreground">
                          {selectedProject.phone}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  {selectedProject.isDraft ? (
                    <Button asChild>
                      <Link to={`/projects/new?draft=${selectedProject.id}`}>
                        <Edit className="w-4 h-4 mr-2" />
                        Resume Draft
                      </Link>
                    </Button>
                  ) : (
                    <Button onClick={() => handleEditProject(selectedProject)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Project
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => handleCreateQuote(selectedProject)}
                  >
                    <Calculator className="w-4 h-4 mr-2" />
                    Create Quote
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleDuplicateProject(selectedProject)}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Duplicate
                  </Button>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
