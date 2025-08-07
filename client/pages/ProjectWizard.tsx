import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Logo } from "@/components/ui/logo";
import { SupabaseSetup } from "@/components/SupabaseSetup";
import ProjectTemplateSelector from "@/components/ProjectTemplateSelector";
import { Link, useNavigate } from "react-router-dom";
import { projectService, autoConfigureSupabase } from "@/lib/supabase";
import { ProjectTemplate, applyTemplate } from "@/lib/projectTemplates";
import { quoteService } from "@/lib/quoteService";
import { useAuth } from "@/hooks/useAuth";
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  Zap,
  Building,
  Camera,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Home,
  Shield,
  Calculator,
  Gauge,
  Plug,
  Settings,
  Users,
  Save,
  Clock,
} from "lucide-react";

interface ClientRequirements {
  contactPersonName: string;
  contactTitle: string;
  contactEmail: string;
  contactPhone: string;
  organizationType: string;
  projectObjective: string;
  numberOfVehicles: string;
  vehicleTypes: string[];
  dailyUsagePattern: string;
  budgetRange: string;
  projectTimeline: string;
  sustainabilityGoals: string[];
  accessibilityRequirements: boolean;
  specialRequirements: string;
  preferredChargerBrands: string[];
  paymentModel: string;
}

interface SiteAssessment {
  projectName: string;
  clientName: string;
  siteAddress: string;
  siteType: string;
  existingPowerSupply: string;
  availableAmperes: string;
  estimatedLoad: string;
  parkingSpaces: string;
  accessRequirements: string;
  photos: string[];
  additionalNotes: string;
}

interface ChargerSelection {
  chargingType: string;
  powerRating: string;
  mountingType: string;
  numberOfChargers: string;
  connectorTypes: string[];
  weatherProtection: boolean;
  networkConnectivity: string;
}

interface GridCapacity {
  currentSupply: string;
  requiredCapacity: string;
  upgradeNeeded: boolean;
  upgradeType: string;
  estimatedUpgradeCost: string;
  utilityContact: string;
}

interface Compliance {
  electricalStandards: string[];
  safetyRequirements: string[];
  localPermits: string[];
  environmentalConsiderations: string[];
  accessibilityCompliance: boolean;
}

interface ProjectDraft {
  id: string;
  userId: string;
  draftName: string;
  currentStep: number;
  createdAt: string;
  updatedAt: string;
  clientRequirements: ClientRequirements;
  siteAssessment: SiteAssessment;
  chargerSelection: ChargerSelection;
  gridCapacity: GridCapacity;
  compliance: Compliance;
  progress: number;
}

export default function ProjectWizard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const [showCloudUpgrade, setShowCloudUpgrade] = useState(false);
  const [isDraftSaving, setIsDraftSaving] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    useState<ProjectTemplate | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [createdProject, setCreatedProject] = useState<any>(null);

  // Auto-save throttling refs
  const lastAutoSaveRef = useRef<number>(0);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Function to retry Supabase connection
  const retryConnection = async (): Promise<void> => {
    try {
      console.log("🔄 Retrying Supabase connection...");
      setConnectionError(null);
      const isConnected = await autoConfigureSupabase();
      setIsSupabaseConnected(isConnected);
      if (!isConnected) {
        setConnectionError(
          "Database auto-configuration in progress. Projects will be saved locally for now.",
        );
        console.log("⚠️ Connection still not available");
      } else {
        console.log("✅ Connection successful!");
      }
    } catch (error) {
      console.error("❌ Error retrying Supabase connection:", error);
      setIsSupabaseConnected(false);
      setConnectionError(
        "Unable to connect to database. Projects will be saved locally.",
      );
    }
  };

  const [clientRequirements, setClientRequirements] =
    useState<ClientRequirements>({
      contactPersonName: "",
      contactTitle: "",
      contactEmail: "",
      contactPhone: "",
      organizationType: "",
      projectObjective: "",
      numberOfVehicles: "",
      vehicleTypes: [],
      dailyUsagePattern: "",
      budgetRange: "",
      projectTimeline: "",
      sustainabilityGoals: [],
      accessibilityRequirements: false,
      specialRequirements: "",
      preferredChargerBrands: [],
      paymentModel: "",
    });

  const [siteAssessment, setSiteAssessment] = useState<SiteAssessment>({
    projectName: "",
    clientName: "",
    siteAddress: "",
    siteType: "",
    existingPowerSupply: "",
    availableAmperes: "",
    estimatedLoad: "",
    parkingSpaces: "",
    accessRequirements: "",
    photos: [],
    additionalNotes: "",
  });

  const [chargerSelection, setChargerSelection] = useState<ChargerSelection>({
    chargingType: "",
    powerRating: "",
    mountingType: "",
    numberOfChargers: "",
    connectorTypes: [],
    weatherProtection: false,
    networkConnectivity: "",
  });

  const [gridCapacity, setGridCapacity] = useState<GridCapacity>({
    currentSupply: "",
    requiredCapacity: "",
    upgradeNeeded: false,
    upgradeType: "",
    estimatedUpgradeCost: "",
    utilityContact: "",
  });

  const [compliance, setCompliance] = useState<Compliance>({
    electricalStandards: [],
    safetyRequirements: [],
    localPermits: [],
    environmentalConsiderations: [],
    accessibilityCompliance: false,
  });

  // Throttled auto-save function (defined after state variables)
  const throttledAutoSave = useCallback(() => {
    const now = Date.now();
    const timeSinceLastSave = now - lastAutoSaveRef.current;
    const minInterval = 10000; // 10 seconds minimum between saves

    // Clear any existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // If enough time has passed, save immediately
    if (timeSinceLastSave >= minInterval) {
      if (clientRequirements.contactPersonName || siteAssessment.projectName) {
        if (import.meta.env.DEV) console.log("Auto-saving draft...");
        saveDraft(false);
        lastAutoSaveRef.current = now;
      }
    } else {
      // Otherwise, schedule a save for later
      const timeToWait = minInterval - timeSinceLastSave;
      autoSaveTimeoutRef.current = setTimeout(() => {
        if (
          clientRequirements.contactPersonName ||
          siteAssessment.projectName
        ) {
          if (import.meta.env.DEV)
            console.log("Auto-saving draft (delayed)...");
          saveDraft(false);
          lastAutoSaveRef.current = Date.now();
        }
      }, timeToWait);
    }
  }, [clientRequirements.contactPersonName, siteAssessment.projectName]);

  // Draft management functions
  const generateDraftName = () => {
    const clientName = clientRequirements.contactPersonName || "New Client";
    const projectName = siteAssessment.projectName || "Untitled Project";
    const name = projectName || `${clientName} Project`;
    return name.substring(0, 50); // Limit length
  };

  const saveDraft = async (showNotification = true) => {
    if (!user) return;

    try {
      setIsDraftSaving(true);

      const draftId = currentDraftId || `draft-${Date.now()}-${user.id}`;
      const now = new Date().toISOString();

      const draft: ProjectDraft = {
        id: draftId,
        userId: user.id,
        draftName: generateDraftName(),
        currentStep,
        createdAt: currentDraftId
          ? JSON.parse(localStorage.getItem("chargeSourceDrafts") || "[]").find(
              (d: any) => d.id === draftId,
            )?.createdAt || now
          : now,
        updatedAt: now,
        clientRequirements,
        siteAssessment,
        chargerSelection,
        gridCapacity,
        compliance,
        progress: Math.round((currentStep / totalSteps) * 100),
      };

      // Get existing drafts
      const existingDrafts = JSON.parse(
        localStorage.getItem("chargeSourceDrafts") || "[]",
      );

      // Update or add draft
      const draftIndex = existingDrafts.findIndex(
        (d: ProjectDraft) => d.id === draftId,
      );
      if (draftIndex >= 0) {
        existingDrafts[draftIndex] = draft;
      } else {
        existingDrafts.unshift(draft);
      }

      // Keep only last 10 drafts per user
      const userDrafts = existingDrafts.filter(
        (d: ProjectDraft) => d.userId === user.id,
      );
      const otherDrafts = existingDrafts.filter(
        (d: ProjectDraft) => d.userId !== user.id,
      );
      const limitedUserDrafts = userDrafts.slice(0, 10);

      localStorage.setItem(
        "chargeSourceDrafts",
        JSON.stringify([...limitedUserDrafts, ...otherDrafts]),
      );

      setCurrentDraftId(draftId);
      setDraftSaved(true);

      if (showNotification) {
        // Show temporary success notification
        setTimeout(() => setDraftSaved(false), 3000);
      }
    } catch (error) {
      console.error("Error saving draft:", error);
    } finally {
      setIsDraftSaving(false);
    }
  };

  const getDraftById = async (
    draftId: string,
  ): Promise<ProjectDraft | null> => {
    try {
      const drafts = JSON.parse(
        localStorage.getItem("chargeSourceDrafts") || "[]",
      );
      return drafts.find((d: ProjectDraft) => d.id === draftId) || null;
    } catch {
      return null;
    }
  };

  const loadDraft = (draft: ProjectDraft) => {
    setCurrentStep(draft.currentStep);
    setClientRequirements(draft.clientRequirements);
    setSiteAssessment(draft.siteAssessment);
    setChargerSelection(draft.chargerSelection);
    setGridCapacity(draft.gridCapacity);
    setCompliance(draft.compliance);
    setCurrentDraftId(draft.id);

    // If charger selection is empty but we have client requirements, populate recommendations
    if (
      !draft.chargerSelection.chargingType &&
      draft.clientRequirements.organizationType
    ) {
      setTimeout(() => {
        const recommendations = getChargerRecommendations();
        setChargerSelection((prev) => ({
          ...prev,
          chargingType: recommendations.chargingType,
          powerRating: recommendations.powerRating,
          numberOfChargers: recommendations.numberOfChargers,
        }));
      }, 100); // Small delay to ensure state is updated
    }
  };

  // Auto-save with proper throttling when content changes
  useEffect(() => {
    if (!user) return;

    // Trigger throttled auto-save when content changes
    throttledAutoSave();

    // Cleanup function
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [user, throttledAutoSave, currentStep]);

  // Check for draft from URL params, load existing, or show template selector
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const draftId = urlParams.get("draft");
    const template = urlParams.get("template");

    if (draftId && user) {
      getDraftById(draftId).then((draft) => {
        if (draft && draft.userId === user.id) {
          loadDraft(draft);
        }
      });
    } else if (template) {
      // Load specific template from URL
      // This allows direct linking to templates
      setShowTemplateSelector(false);
    } else if (!draftId && user) {
      // Show template selector for new projects
      setShowTemplateSelector(true);
    }
  }, [user]);

  // Quietly check for cloud storage availability (optional)
  useEffect(() => {
    const checkCloudStorage = async () => {
      try {
        const isConnected = await autoConfigureSupabase();
        setIsSupabaseConnected(isConnected);
        // No error messages - localStorage is perfectly fine!
      } catch (error) {
        // Silently handle - localStorage works great
        setIsSupabaseConnected(false);
      }
    };

    checkCloudStorage();
  }, []);

  // Template handling functions
  const handleSelectTemplate = (template: ProjectTemplate) => {
    const templateData = applyTemplate(template);

    // Apply template data to state
    setClientRequirements(templateData.clientRequirements);
    setSiteAssessment(templateData.siteAssessment);
    setChargerSelection(templateData.chargerSelection);
    setGridCapacity(templateData.gridCapacity);
    setCompliance(templateData.compliance);
    setSelectedTemplate(template);
    setShowTemplateSelector(false);

    // Auto-populate project name if not set
    if (!templateData.siteAssessment.projectName) {
      setSiteAssessment((prev) => ({
        ...prev,
        projectName: `${template.name} Project`,
      }));
    }
  };

  const handleSkipTemplate = () => {
    setShowTemplateSelector(false);
    setSelectedTemplate(null);
  };

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1:
        return "Client Requirements";
      case 2:
        return "Site Assessment";
      case 3:
        return "Charger Selection";
      case 4:
        return "Grid Capacity Analysis";
      case 5:
        return "Compliance Checklist";
      case 6:
        return "Project Summary";
      default:
        return "Project Planning";
    }
  };

  const getStepIcon = (step: number) => {
    switch (step) {
      case 1:
        return <Users className="w-5 h-5" />;
      case 2:
        return <MapPin className="w-5 h-5" />;
      case 3:
        return <Plug className="w-5 h-5" />;
      case 4:
        return <Gauge className="w-5 h-5" />;
      case 5:
        return <Shield className="w-5 h-5" />;
      case 6:
        return <FileText className="w-5 h-5" />;
      default:
        return <Settings className="w-5 h-5" />;
    }
  };

  const nextStep = () => {
    if (import.meta.env.DEV) {
      console.log(
        "NextStep clicked - currentStep:",
        currentStep,
        "totalSteps:",
        totalSteps,
      );
    }

    if (currentStep < totalSteps) {
      // Auto-populate site assessment when moving from client requirements to site assessment
      if (currentStep === 1) {
        if (import.meta.env.DEV)
          console.log("Populating site assessment from client requirements");
        populateSiteAssessmentFromClientRequirements();
      }
      // Auto-populate charger selection with recommendations when moving to Step 3
      if (currentStep === 2) {
        if (import.meta.env.DEV)
          console.log("Populating charger recommendations");
        populateChargerRecommendations();
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const populateSiteAssessmentFromClientRequirements = () => {
    // Auto-populate client name if available
    if (clientRequirements.contactPersonName && !siteAssessment.clientName) {
      setSiteAssessment((prev) => ({
        ...prev,
        clientName: clientRequirements.contactPersonName,
      }));
    }

    // Suggest site type based on organization type
    if (clientRequirements.organizationType && !siteAssessment.siteType) {
      const siteTypeMapping: Record<string, string> = {
        retail: "retail",
        office: "office",
        residential: "residential",
        hotel: "commercial",
        government: "public",
        fleet: "fleet",
        healthcare: "commercial",
        education: "public",
        industrial: "industrial",
      };

      const suggestedSiteType =
        siteTypeMapping[clientRequirements.organizationType];
      if (suggestedSiteType) {
        setSiteAssessment((prev) => ({
          ...prev,
          siteType: suggestedSiteType,
        }));
      }
    }
  };

  const populateChargerRecommendations = () => {
    // Only auto-populate if no manual selection has been made
    if (!chargerSelection.chargingType && clientRequirements.organizationType) {
      const recommendations = getChargerRecommendations();

      setChargerSelection((prev) => ({
        ...prev,
        chargingType: recommendations.chargingType,
        powerRating: recommendations.powerRating,
        numberOfChargers: recommendations.numberOfChargers,
      }));
    }
  };

  const validateProjectData = () => {
    const errors = [];

    // Validate Client Requirements
    if (!clientRequirements.contactPersonName)
      errors.push("Primary Contact Name is required");
    if (!clientRequirements.contactEmail)
      errors.push("Email Address is required");
    if (!clientRequirements.organizationType)
      errors.push("Organization Type is required");
    if (!clientRequirements.projectObjective)
      errors.push("Project Objective is required");
    if (!clientRequirements.numberOfVehicles)
      errors.push("Number of Vehicles is required");

    // Validate Site Assessment
    if (!siteAssessment.projectName) errors.push("Project Name is required");
    if (!siteAssessment.clientName) errors.push("Client Name is required");
    if (!siteAssessment.siteAddress) errors.push("Site Address is required");
    if (!siteAssessment.siteType) errors.push("Site Type is required");

    // Validate Charger Selection
    if (!chargerSelection.chargingType)
      errors.push("Charging Type is required");
    if (!chargerSelection.powerRating) errors.push("Power Rating is required");
    if (!chargerSelection.numberOfChargers)
      errors.push("Number of Chargers is required");
    if (!chargerSelection.mountingType)
      errors.push("Mounting Type is required");

    return errors;
  };

  const createSupabaseProjectData = () => {
    const recommendations = getChargerRecommendations();

    // Parse cost range for min/max values
    const costMatch = recommendations.estimatedCost.match(
      /\$([\d,]+).*?\$([\d,]+)/,
    );
    const costMin = costMatch ? parseInt(costMatch[1].replace(/,/g, "")) : 0;
    const costMax = costMatch ? parseInt(costMatch[2].replace(/,/g, "")) : 0;

    return {
      project: {
        status: "Planning" as const,
        progress: 100,
        name: siteAssessment.projectName,
        client_name:
          siteAssessment.clientName || clientRequirements.contactPersonName,
        site_address: siteAssessment.siteAddress,
        site_type: siteAssessment.siteType,
        project_objective: clientRequirements.projectObjective,
        estimated_budget_min: costMin,
        estimated_budget_max: costMax,
        estimated_timeline: recommendations.installationTime,
        created_by: "wizard",
        notes: `Created via Project Planning Wizard. ${clientRequirements.specialRequirements ? "Special Requirements: " + clientRequirements.specialRequirements : ""}`,
      },
      clientRequirements: {
        contact_person_name: clientRequirements.contactPersonName,
        contact_title: clientRequirements.contactTitle,
        contact_email: clientRequirements.contactEmail,
        contact_phone: clientRequirements.contactPhone,
        organization_type: clientRequirements.organizationType,
        project_objective: clientRequirements.projectObjective,
        number_of_vehicles: clientRequirements.numberOfVehicles,
        vehicle_types: clientRequirements.vehicleTypes,
        daily_usage_pattern: clientRequirements.dailyUsagePattern,
        budget_range: clientRequirements.budgetRange,
        project_timeline: clientRequirements.projectTimeline,
        sustainability_goals: clientRequirements.sustainabilityGoals,
        accessibility_requirements:
          clientRequirements.accessibilityRequirements,
        special_requirements: clientRequirements.specialRequirements,
        preferred_charger_brands: clientRequirements.preferredChargerBrands,
        payment_model: clientRequirements.paymentModel,
      },
      siteAssessment: {
        project_name: siteAssessment.projectName,
        client_name: siteAssessment.clientName,
        site_address: siteAssessment.siteAddress,
        site_type: siteAssessment.siteType,
        existing_power_supply: siteAssessment.existingPowerSupply,
        available_amperes: siteAssessment.availableAmperes
          ? parseInt(siteAssessment.availableAmperes)
          : undefined,
        estimated_load: siteAssessment.estimatedLoad,
        parking_spaces: siteAssessment.parkingSpaces
          ? parseInt(siteAssessment.parkingSpaces)
          : undefined,
        access_requirements: siteAssessment.accessRequirements,
        additional_notes: siteAssessment.additionalNotes,
        photos: siteAssessment.photos,
      },
      chargerConfiguration: {
        charging_type: chargerSelection.chargingType,
        power_rating: chargerSelection.powerRating,
        mounting_type: chargerSelection.mountingType,
        number_of_chargers: parseInt(chargerSelection.numberOfChargers),
        connector_types: chargerSelection.connectorTypes,
        weather_protection: chargerSelection.weatherProtection,
        network_connectivity: chargerSelection.networkConnectivity,
        estimated_cost_min: costMin,
        estimated_cost_max: costMax,
        installation_time: recommendations.installationTime,
      },
      gridCapacityAssessment: {
        current_supply: gridCapacity.currentSupply
          ? parseInt(gridCapacity.currentSupply)
          : undefined,
        required_capacity: gridCapacity.requiredCapacity
          ? parseInt(gridCapacity.requiredCapacity)
          : undefined,
        upgrade_needed: gridCapacity.upgradeNeeded,
        upgrade_type: gridCapacity.upgradeType,
        estimated_upgrade_cost: gridCapacity.estimatedUpgradeCost,
        utility_contact: gridCapacity.utilityContact,
        load_management_notes: "Generated via Project Planning Wizard",
      },
      complianceChecklist: {
        electrical_standards: compliance.electricalStandards,
        safety_requirements: compliance.safetyRequirements,
        local_permits: compliance.localPermits,
        environmental_considerations: compliance.environmentalConsiderations,
        accessibility_compliance: compliance.accessibilityCompliance,
        overall_compliance_score: Math.round(
          ((compliance.electricalStandards.length +
            compliance.safetyRequirements.length +
            compliance.localPermits.length) /
            18) *
            100,
        ),
      },
    };
  };

  const handleSubmit = async () => {
    console.log("🚀 Creating project...", {
      step: currentStep,
      projectName: siteAssessment.projectName,
      clientName: clientRequirements.contactPersonName,
      supabaseConnected: isSupabaseConnected,
    });

    const validationErrors = validateProjectData();

    if (validationErrors.length > 0) {
      console.log("❌ Validation errors:", validationErrors);
      alert(
        `Please complete the following required fields:\n\n${validationErrors.join("\n")}`,
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // Try Supabase first if connected
      if (isSupabaseConnected) {
        try {
          const supabaseData = createSupabaseProjectData();
          const project = await projectService.createProject(supabaseData);

          console.log("Project Created Successfully in Supabase:", project);

          // Remove draft if it exists
          if (currentDraftId) {
            const drafts = JSON.parse(
              localStorage.getItem("chargeSourceDrafts") || "[]",
            );
            const filteredDrafts = drafts.filter(
              (d: ProjectDraft) => d.id !== currentDraftId,
            );
            localStorage.setItem(
              "chargeSourceDrafts",
              JSON.stringify(filteredDrafts),
            );
          }

          // Show success dialog
          const recommendations = getChargerRecommendations();
          console.log("✅ Project created successfully in Supabase:", project);

          setCreatedProject({
            ...project,
            recommendations,
            storageType: 'cloud'
          });
          setShowSuccessDialog(true);
          return;
        } catch (error) {
          console.log("Cloud storage failed, using local storage fallback");
          // Fall through to localStorage
        }
      }

      // Use localStorage (either as primary or fallback)
      await handleLocalStorageSubmit();
    } catch (error) {
      console.error("❌ Error creating project:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      alert(
        `❌ Failed to create project.\n\nError: ${errorMessage}\n\nPlease try again or contact support if the problem persists.`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLocalStorageSubmit = async () => {
    try {
      const projectId = `PRJ-${Date.now()}`;
      const createdAt = new Date().toISOString();
      const recommendations = getChargerRecommendations();

      const projectData = {
        id: projectId,
        createdAt,
        status: "Planning",
        progress: 100,
        projectInfo: {
          name: siteAssessment.projectName,
          client:
            siteAssessment.clientName || clientRequirements.contactPersonName,
          address: siteAssessment.siteAddress,
          type: siteAssessment.siteType,
          objective: clientRequirements.projectObjective,
        },
        estimatedBudget: recommendations.estimatedCost,
        timeline: recommendations.installationTime,
        // Store all the detailed data for future reference
        clientRequirements,
        siteAssessment,
        chargerSelection,
        gridCapacity,
        compliance,
        userId: user?.id,
      };

      // Save to localStorage
      const existingProjects = JSON.parse(
        localStorage.getItem("chargeSourceProjects") || "[]",
      );
      existingProjects.unshift(projectData);
      localStorage.setItem(
        "chargeSourceProjects",
        JSON.stringify(existingProjects),
      );

      // Remove draft if it exists (project is now complete)
      if (currentDraftId) {
        const drafts = JSON.parse(
          localStorage.getItem("chargeSourceDrafts") || "[]",
        );
        const filteredDrafts = drafts.filter(
          (d: ProjectDraft) => d.id !== currentDraftId,
        );
        localStorage.setItem(
          "chargeSourceDrafts",
          JSON.stringify(filteredDrafts),
        );
      }

      console.log("Project Created Successfully (localStorage):", projectData);

      // Show success message and navigate
      console.log(
        "✅ Project created successfully in localStorage:",
        projectData,
      );

      const successMessage =
        `🎉 Project "${projectData.projectInfo.name}" created successfully!\n\n` +
        `📋 Project ID: ${projectData.id}\n` +
        `💰 Estimated Cost: ${projectData.estimatedBudget}\n` +
        `���️ Timeline: ${projectData.timeline}\n\n` +
        `💾 Saved locally`;

      setCreatedProject({
        ...projectData,
        name: projectData.projectInfo.name,
        storageType: 'local'
      });
      setShowSuccessDialog(true);
    } catch (error) {
      console.error("Error creating project with localStorage:", error);
      throw error;
    }
  };

  const getChargerRecommendations = () => {
    const orgType = clientRequirements.organizationType;
    const vehicleCount = clientRequirements.numberOfVehicles;
    const usagePattern = clientRequirements.dailyUsagePattern;

    let recommendations = {
      chargingType: "",
      powerRating: "",
      numberOfChargers: "",
      reasoning: "",
      estimatedCost: "",
      installationTime: "",
    };

    // Determine charging type based on organization and usage
    if (
      orgType === "fleet" ||
      orgType === "commercial" ||
      orgType === "retail"
    ) {
      if (usagePattern === "24-7" || usagePattern === "peak-times") {
        recommendations.chargingType = "dc-fast";
        recommendations.powerRating = "50kw";
        recommendations.reasoning =
          "DC fast charging recommended for high-utilization commercial sites with quick turnaround needs.";
      } else {
        recommendations.chargingType = "mixed";
        recommendations.powerRating = "22kw";
        recommendations.reasoning =
          "Mixed AC/DC installation offers flexibility for different vehicle types and charging needs.";
      }
    } else if (orgType === "residential" || orgType === "office") {
      recommendations.chargingType = "ac-level2";
      recommendations.powerRating = "7kw";
      recommendations.reasoning =
        "AC Level 2 charging ideal for longer dwell times typical in residential and office environments.";
    } else {
      recommendations.chargingType = "mixed";
      recommendations.powerRating = "22kw";
      recommendations.reasoning =
        "Mixed installation provides versatility for diverse user needs.";
    }

    // Estimate number of chargers based on vehicle count
    if (vehicleCount === "1-5") {
      recommendations.numberOfChargers = "2";
    } else if (vehicleCount === "6-15") {
      recommendations.numberOfChargers = "4";
    } else if (vehicleCount === "16-30") {
      recommendations.numberOfChargers = "8";
    } else if (vehicleCount === "31-50") {
      recommendations.numberOfChargers = "12";
    } else if (vehicleCount === "51-100") {
      recommendations.numberOfChargers = "20";
    } else {
      recommendations.numberOfChargers = "30";
    }

    // Estimate cost and installation time
    const chargerCount = parseInt(recommendations.numberOfChargers);
    if (recommendations.chargingType === "dc-fast") {
      recommendations.estimatedCost = `$${(chargerCount * 45000).toLocaleString()} - $${(chargerCount * 65000).toLocaleString()}`;
      recommendations.installationTime = "8-12 weeks";
    } else if (recommendations.chargingType === "mixed") {
      recommendations.estimatedCost = `$${(chargerCount * 25000).toLocaleString()} - $${(chargerCount * 35000).toLocaleString()}`;
      recommendations.installationTime = "6-10 weeks";
    } else {
      recommendations.estimatedCost = `$${(chargerCount * 8000).toLocaleString()} - $${(chargerCount * 15000).toLocaleString()}`;
      recommendations.installationTime = "4-6 weeks";
    }

    return recommendations;
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                Understanding Your EV Charging Needs
              </h3>
              <p className="text-sm text-muted-foreground">
                Let's start by understanding your specific requirements and
                project goals to tailor the best EV charging solution.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="contactPersonName">
                  Primary Contact Name *
                </Label>
                <Input
                  id="contactPersonName"
                  value={clientRequirements.contactPersonName}
                  onChange={(e) =>
                    setClientRequirements({
                      ...clientRequirements,
                      contactPersonName: e.target.value,
                    })
                  }
                  placeholder="e.g., John Smith"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactTitle">Title/Position</Label>
                <Input
                  id="contactTitle"
                  value={clientRequirements.contactTitle}
                  onChange={(e) =>
                    setClientRequirements({
                      ...clientRequirements,
                      contactTitle: e.target.value,
                    })
                  }
                  placeholder="e.g., Facilities Manager"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Email Address *</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={clientRequirements.contactEmail}
                  onChange={(e) =>
                    setClientRequirements({
                      ...clientRequirements,
                      contactEmail: e.target.value,
                    })
                  }
                  placeholder="john.smith@company.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPhone">Phone Number</Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  value={clientRequirements.contactPhone}
                  onChange={(e) =>
                    setClientRequirements({
                      ...clientRequirements,
                      contactPhone: e.target.value,
                    })
                  }
                  placeholder="(02) 1234 5678"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="organizationType">Organization Type *</Label>
                <Select
                  value={clientRequirements.organizationType}
                  onValueChange={(value) =>
                    setClientRequirements({
                      ...clientRequirements,
                      organizationType: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select organization type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="retail">
                      Retail/Shopping Centre
                    </SelectItem>
                    <SelectItem value="office">Office Building</SelectItem>
                    <SelectItem value="residential">
                      Residential Complex
                    </SelectItem>
                    <SelectItem value="hotel">Hotel/Hospitality</SelectItem>
                    <SelectItem value="government">
                      Government/Public
                    </SelectItem>
                    <SelectItem value="fleet">Fleet/Logistics</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="industrial">Industrial</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="projectObjective">
                  Primary Project Objective *
                </Label>
                <Select
                  value={clientRequirements.projectObjective}
                  onValueChange={(value) =>
                    setClientRequirements({
                      ...clientRequirements,
                      projectObjective: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select primary objective" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee-benefit">
                      Employee Benefit
                    </SelectItem>
                    <SelectItem value="customer-attraction">
                      Customer Attraction
                    </SelectItem>
                    <SelectItem value="fleet-electrification">
                      Fleet Electrification
                    </SelectItem>
                    <SelectItem value="revenue-generation">
                      Revenue Generation
                    </SelectItem>
                    <SelectItem value="sustainability-goals">
                      Sustainability Goals
                    </SelectItem>
                    <SelectItem value="regulatory-compliance">
                      Regulatory Compliance
                    </SelectItem>
                    <SelectItem value="future-proofing">
                      Future-Proofing
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="numberOfVehicles">
                  Expected Number of Vehicles *
                </Label>
                <Select
                  value={clientRequirements.numberOfVehicles}
                  onValueChange={(value) =>
                    setClientRequirements({
                      ...clientRequirements,
                      numberOfVehicles: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-5">1-5 vehicles</SelectItem>
                    <SelectItem value="6-15">6-15 vehicles</SelectItem>
                    <SelectItem value="16-30">16-30 vehicles</SelectItem>
                    <SelectItem value="31-50">31-50 vehicles</SelectItem>
                    <SelectItem value="51-100">51-100 vehicles</SelectItem>
                    <SelectItem value="100+">100+ vehicles</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dailyUsagePattern">Daily Usage Pattern</Label>
                <Select
                  value={clientRequirements.dailyUsagePattern}
                  onValueChange={(value) =>
                    setClientRequirements({
                      ...clientRequirements,
                      dailyUsagePattern: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select usage pattern" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="business-hours">
                      Business Hours Only (8am-6pm)
                    </SelectItem>
                    <SelectItem value="extended-hours">
                      Extended Hours (6am-10pm)
                    </SelectItem>
                    <SelectItem value="24-7">24/7 Operation</SelectItem>
                    <SelectItem value="peak-times">Peak Times Only</SelectItem>
                    <SelectItem value="overnight">
                      Overnight Charging
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Vehicle Types (select all that apply)</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  "Passenger Cars",
                  "Light Commercial",
                  "Buses",
                  "Trucks/Heavy Vehicles",
                  "Motorcycles/Scooters",
                  "Delivery Vans",
                  "Emergency Vehicles",
                  "Other Fleet",
                ].map((vehicleType) => (
                  <div
                    key={vehicleType}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={vehicleType}
                      checked={clientRequirements.vehicleTypes.includes(
                        vehicleType,
                      )}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setClientRequirements({
                            ...clientRequirements,
                            vehicleTypes: [
                              ...clientRequirements.vehicleTypes,
                              vehicleType,
                            ],
                          });
                        } else {
                          setClientRequirements({
                            ...clientRequirements,
                            vehicleTypes:
                              clientRequirements.vehicleTypes.filter(
                                (v) => v !== vehicleType,
                              ),
                          });
                        }
                      }}
                    />
                    <Label htmlFor={vehicleType} className="text-sm">
                      {vehicleType}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="budgetRange">Estimated Budget Range</Label>
                <Select
                  value={clientRequirements.budgetRange}
                  onValueChange={(value) =>
                    setClientRequirements({
                      ...clientRequirements,
                      budgetRange: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select budget range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="under-25k">Under $25,000</SelectItem>
                    <SelectItem value="25-50k">$25,000 - $50,000</SelectItem>
                    <SelectItem value="50-100k">$50,000 - $100,000</SelectItem>
                    <SelectItem value="100-250k">
                      $100,000 - $250,000
                    </SelectItem>
                    <SelectItem value="250-500k">
                      $250,000 - $500,000
                    </SelectItem>
                    <SelectItem value="500k-1m">
                      $500,000 - $1,000,000
                    </SelectItem>
                    <SelectItem value="over-1m">Over $1,000,000</SelectItem>
                    <SelectItem value="tbd">To Be Determined</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="projectTimeline">
                  Desired Project Timeline
                </Label>
                <Select
                  value={clientRequirements.projectTimeline}
                  onValueChange={(value) =>
                    setClientRequirements({
                      ...clientRequirements,
                      projectTimeline: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select timeline" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="urgent">Urgent (1-2 months)</SelectItem>
                    <SelectItem value="fast">
                      Fast Track (3-4 months)
                    </SelectItem>
                    <SelectItem value="standard">
                      Standard (4-6 months)
                    </SelectItem>
                    <SelectItem value="flexible">
                      Flexible (6-12 months)
                    </SelectItem>
                    <SelectItem value="long-term">
                      Long-term Planning (12+ months)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Sustainability Goals (select all that apply)</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  "Carbon Neutral by 2030",
                  "Renewable Energy Integration",
                  "NABERS Rating Improvement",
                  "Green Building Certification",
                  "Corporate ESG Goals",
                  "Government Incentives",
                  "Community Environmental Impact",
                ].map((goal) => (
                  <div key={goal} className="flex items-center space-x-2">
                    <Checkbox
                      id={goal}
                      checked={clientRequirements.sustainabilityGoals.includes(
                        goal,
                      )}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setClientRequirements({
                            ...clientRequirements,
                            sustainabilityGoals: [
                              ...clientRequirements.sustainabilityGoals,
                              goal,
                            ],
                          });
                        } else {
                          setClientRequirements({
                            ...clientRequirements,
                            sustainabilityGoals:
                              clientRequirements.sustainabilityGoals.filter(
                                (g) => g !== goal,
                              ),
                          });
                        }
                      }}
                    />
                    <Label htmlFor={goal} className="text-sm">
                      {goal}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="accessibilityRequirements"
                checked={clientRequirements.accessibilityRequirements}
                onCheckedChange={(checked) =>
                  setClientRequirements({
                    ...clientRequirements,
                    accessibilityRequirements: checked as boolean,
                  })
                }
              />
              <Label htmlFor="accessibilityRequirements">
                Accessibility requirements for disabled users (DDA compliance)
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialRequirements">
                Special Requirements or Considerations
              </Label>
              <Textarea
                id="specialRequirements"
                value={clientRequirements.specialRequirements}
                onChange={(e) =>
                  setClientRequirements({
                    ...clientRequirements,
                    specialRequirements: e.target.value,
                  })
                }
                placeholder="Any specific requirements, constraints, or preferences..."
                rows={3}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            {/* Recommendations based on client requirements */}
            {clientRequirements.organizationType && (
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Site Assessment Recommendations
                </h3>
                <div className="text-sm text-blue-700 space-y-1">
                  <p>
                    <strong>Organization Type:</strong>{" "}
                    {clientRequirements.organizationType}
                  </p>
                  <p>
                    <strong>Expected Vehicles:</strong>{" "}
                    {clientRequirements.numberOfVehicles}
                  </p>
                  <p>
                    <strong>Usage Pattern:</strong>{" "}
                    {clientRequirements.dailyUsagePattern}
                  </p>
                  {clientRequirements.budgetRange && (
                    <p>
                      <strong>Budget Range:</strong>{" "}
                      {clientRequirements.budgetRange}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="projectName">Project Name *</Label>
                <Input
                  id="projectName"
                  value={siteAssessment.projectName}
                  onChange={(e) =>
                    setSiteAssessment({
                      ...siteAssessment,
                      projectName: e.target.value,
                    })
                  }
                  placeholder={
                    clientRequirements.organizationType
                      ? `${clientRequirements.organizationType} EV Charging Project`
                      : "e.g., Westfield Shopping Centre EV Hub"
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientName">Client Name *</Label>
                <Input
                  id="clientName"
                  value={
                    siteAssessment.clientName ||
                    clientRequirements.contactPersonName
                  }
                  onChange={(e) =>
                    setSiteAssessment({
                      ...siteAssessment,
                      clientName: e.target.value,
                    })
                  }
                  placeholder={
                    clientRequirements.contactPersonName ||
                    "e.g., Westfield Group"
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="siteAddress">Site Address *</Label>
              <Input
                id="siteAddress"
                value={siteAssessment.siteAddress}
                onChange={(e) =>
                  setSiteAssessment({
                    ...siteAssessment,
                    siteAddress: e.target.value,
                  })
                }
                placeholder="Full site address including postcode"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="siteType">Site Type *</Label>
                <Select
                  value={siteAssessment.siteType}
                  onValueChange={(value) =>
                    setSiteAssessment({ ...siteAssessment, siteType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select site type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="commercial">
                      Commercial Building
                    </SelectItem>
                    <SelectItem value="residential">
                      Residential Complex
                    </SelectItem>
                    <SelectItem value="retail">
                      Retail/Shopping Centre
                    </SelectItem>
                    <SelectItem value="office">Office Building</SelectItem>
                    <SelectItem value="public">Public Facility</SelectItem>
                    <SelectItem value="industrial">Industrial Site</SelectItem>
                    <SelectItem value="fleet">Fleet Depot</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="parkingSpaces">Total Parking Spaces</Label>
                <Input
                  id="parkingSpaces"
                  type="number"
                  value={siteAssessment.parkingSpaces}
                  onChange={(e) =>
                    setSiteAssessment({
                      ...siteAssessment,
                      parkingSpaces: e.target.value,
                    })
                  }
                  placeholder="e.g., 150"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="existingPowerSupply">
                  Existing Power Supply
                </Label>
                <Select
                  value={siteAssessment.existingPowerSupply}
                  onValueChange={(value) =>
                    setSiteAssessment({
                      ...siteAssessment,
                      existingPowerSupply: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select power supply" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single-phase">
                      Single Phase (240V)
                    </SelectItem>
                    <SelectItem value="three-phase-415v">
                      Three Phase (415V)
                    </SelectItem>
                    <SelectItem value="three-phase-480v">
                      Three Phase (480V)
                    </SelectItem>
                    <SelectItem value="high-voltage">
                      High Voltage (&gt;1kV)
                    </SelectItem>
                    <SelectItem value="unknown">
                      Unknown - Requires Assessment
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="availableAmperes">
                  Available Amperes (Amps)
                </Label>
                <Input
                  id="availableAmperes"
                  type="number"
                  value={siteAssessment.availableAmperes}
                  onChange={(e) =>
                    setSiteAssessment({
                      ...siteAssessment,
                      availableAmperes: e.target.value,
                    })
                  }
                  placeholder="e.g., 200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimatedLoad">Estimated Daily Load</Label>
                <Input
                  id="estimatedLoad"
                  value={siteAssessment.estimatedLoad}
                  onChange={(e) =>
                    setSiteAssessment({
                      ...siteAssessment,
                      estimatedLoad: e.target.value,
                    })
                  }
                  placeholder="e.g., 50 kWh/day"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accessRequirements">
                Site Access Requirements
              </Label>
              <Textarea
                id="accessRequirements"
                value={siteAssessment.accessRequirements}
                onChange={(e) =>
                  setSiteAssessment({
                    ...siteAssessment,
                    accessRequirements: e.target.value,
                  })
                }
                placeholder="Describe access restrictions, special requirements, security procedures..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Site Photos</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <Camera className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Upload photos of the site, electrical panels, and proposed
                  installation areas
                </p>
                <Button variant="outline" className="mt-2">
                  <Camera className="w-4 h-4 mr-2" />
                  Upload Photos
                </Button>
              </div>
            </div>
          </div>
        );

      case 3:
        const recommendations = getChargerRecommendations();

        return (
          <div className="space-y-6">
            {/* Enhanced Recommendations Section */}
            <div className="bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20 p-6 rounded-lg">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                AI-Powered Charger Recommendations
              </h3>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-primary">
                    Recommended Configuration:
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {recommendations.reasoning}
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="font-medium">
                      Type:{" "}
                      {recommendations.chargingType
                        .replace("-", " ")
                        .toUpperCase()}
                    </span>
                    <span className="font-medium">
                      Power: {recommendations.powerRating}
                    </span>
                    <span className="font-medium">
                      Quantity: {recommendations.numberOfChargers} units
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-secondary">
                    Project Estimates:
                  </p>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>
                      <strong>Estimated Cost:</strong>{" "}
                      {recommendations.estimatedCost}
                    </p>
                    <p>
                      <strong>Installation Time:</strong>{" "}
                      {recommendations.installationTime}
                    </p>
                    <p>
                      <strong>Based on:</strong>{" "}
                      {clientRequirements.organizationType} •{" "}
                      {clientRequirements.numberOfVehicles} vehicles
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-secondary" />
                Recommendations based on your client requirements and industry
                best practices
              </div>
            </div>

            {/* Charger Type Comparison */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card
                className={`cursor-pointer transition-all hover:shadow-md ${chargerSelection.chargingType === "ac-level2" ? "border-primary bg-primary/5" : ""}`}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Zap className="w-4 h-4 text-blue-600" />
                    </div>
                    AC Level 2
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  <p>
                    <strong>Power:</strong> 7-22kW
                  </p>
                  <p>
                    <strong>Charging Time:</strong> 4-8 hours
                  </p>
                  <p>
                    <strong>Best For:</strong> Overnight, workplace
                  </p>
                  <p>
                    <strong>Cost:</strong> $8,000-$15,000 per unit
                  </p>
                  <p className="text-green-600">
                    <strong>✓ Lower installation cost</strong>
                  </p>
                  <p className="text-green-600">
                    <strong>✓ Suitable for long dwell times</strong>
                  </p>
                </CardContent>
              </Card>

              <Card
                className={`cursor-pointer transition-all hover:shadow-md ${chargerSelection.chargingType === "dc-fast" ? "border-primary bg-primary/5" : ""}`}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <Zap className="w-4 h-4 text-red-600" />
                    </div>
                    DC Fast Charging
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  <p>
                    <strong>Power:</strong> 50-150kW
                  </p>
                  <p>
                    <strong>Charging Time:</strong> 20-60 minutes
                  </p>
                  <p>
                    <strong>Best For:</strong> Commercial, high-turnover
                  </p>
                  <p>
                    <strong>Cost:</strong> $45,000-$65,000 per unit
                  </p>
                  <p className="text-green-600">
                    <strong>✓ Rapid charging</strong>
                  </p>
                  <p className="text-green-600">
                    <strong>✓ High vehicle throughput</strong>
                  </p>
                </CardContent>
              </Card>

              <Card
                className={`cursor-pointer transition-all hover:shadow-md ${chargerSelection.chargingType === "mixed" ? "border-primary bg-primary/5" : ""}`}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Zap className="w-4 h-4 text-yellow-600" />
                    </div>
                    Mixed Installation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  <p>
                    <strong>Power:</strong> 7kW-150kW
                  </p>
                  <p>
                    <strong>Charging Time:</strong> Variable
                  </p>
                  <p>
                    <strong>Best For:</strong> Diverse user needs
                  </p>
                  <p>
                    <strong>Cost:</strong> $25,000-$35,000 avg per unit
                  </p>
                  <p className="text-green-600">
                    <strong>✓ Maximum flexibility</strong>
                  </p>
                  <p className="text-green-600">
                    <strong>✓ Future-proof solution</strong>
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Configuration Selection Form */}
            <Card>
              <CardHeader>
                <CardTitle>Configuration Details</CardTitle>
                <CardDescription>
                  Customize your charging installation based on specific
                  requirements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="chargingType">Charging Type *</Label>
                    <Select
                      value={
                        chargerSelection.chargingType ||
                        recommendations.chargingType
                      }
                      onValueChange={(value) =>
                        setChargerSelection({
                          ...chargerSelection,
                          chargingType: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select charging type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ac-level2">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            AC Level 2 (7-22kW) - Long dwell time
                          </div>
                        </SelectItem>
                        <SelectItem value="dc-fast">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            DC Fast Charging (50-150kW) - Quick turnaround
                          </div>
                        </SelectItem>
                        <SelectItem value="dc-ultra">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                            DC Ultra Fast (150kW+) - Premium rapid charging
                          </div>
                        </SelectItem>
                        <SelectItem value="mixed">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                            Mixed AC/DC Installation - Maximum flexibility
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {recommendations.chargingType && (
                      <p className="text-xs text-primary">
                        Recommended:{" "}
                        {recommendations.chargingType
                          .replace("-", " ")
                          .toUpperCase()}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="powerRating">
                      Power Rating per Charger *
                    </Label>
                    <Select
                      value={
                        chargerSelection.powerRating ||
                        recommendations.powerRating
                      }
                      onValueChange={(value) =>
                        setChargerSelection({
                          ...chargerSelection,
                          powerRating: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select power rating" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7kw">
                          7kW (AC) - Standard residential
                        </SelectItem>
                        <SelectItem value="11kw">
                          11kW (AC) - Fast residential
                        </SelectItem>
                        <SelectItem value="22kw">
                          22kW (AC) - Commercial AC
                        </SelectItem>
                        <SelectItem value="50kw">
                          50kW (DC) - Standard fast charging
                        </SelectItem>
                        <SelectItem value="75kw">
                          75kW (DC) - Enhanced fast charging
                        </SelectItem>
                        <SelectItem value="150kw">
                          150kW (DC) - Ultra-fast charging
                        </SelectItem>
                        <SelectItem value="350kw">
                          350kW (DC) - Premium ultra-fast
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {recommendations.powerRating && (
                      <p className="text-xs text-primary">
                        Recommended: {recommendations.powerRating}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="numberOfChargers">
                      Number of Charging Points *
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="numberOfChargers"
                        type="number"
                        value={
                          chargerSelection.numberOfChargers ||
                          recommendations.numberOfChargers
                        }
                        onChange={(e) =>
                          setChargerSelection({
                            ...chargerSelection,
                            numberOfChargers: e.target.value,
                          })
                        }
                        placeholder="e.g., 8"
                        min="1"
                        max="100"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setChargerSelection({
                            ...chargerSelection,
                            numberOfChargers: recommendations.numberOfChargers,
                          })
                        }
                      >
                        Use Recommended ({recommendations.numberOfChargers})
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Based on {clientRequirements.numberOfVehicles} expected
                      vehicles
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mountingType">Mounting Type *</Label>
                    <Select
                      value={chargerSelection.mountingType}
                      onValueChange={(value) =>
                        setChargerSelection({
                          ...chargerSelection,
                          mountingType: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select mounting type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pedestal">
                          Pedestal Mount - Freestanding installation
                        </SelectItem>
                        <SelectItem value="wall">
                          Wall Mount - Space-saving option
                        </SelectItem>
                        <SelectItem value="overhead">
                          Overhead Mount - Suspended installation
                        </SelectItem>
                        <SelectItem value="pole">
                          Pole Mount - Street light style
                        </SelectItem>
                        <SelectItem value="canopy">
                          Canopy Integrated - Weather protected
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Connector Types (select all that apply)</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { name: "Type 2 AC", desc: "European standard AC" },
                      { name: "CCS2", desc: "Combined Charging System" },
                      { name: "CHAdeMO", desc: "Japanese DC standard" },
                      { name: "Tesla", desc: "Tesla Supercharger" },
                    ].map((connector) => (
                      <div
                        key={connector.name}
                        className="flex items-start space-x-2 p-2 border rounded-lg hover:bg-muted/50"
                      >
                        <Checkbox
                          id={connector.name}
                          checked={chargerSelection.connectorTypes.includes(
                            connector.name,
                          )}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setChargerSelection({
                                ...chargerSelection,
                                connectorTypes: [
                                  ...chargerSelection.connectorTypes,
                                  connector.name,
                                ],
                              });
                            } else {
                              setChargerSelection({
                                ...chargerSelection,
                                connectorTypes:
                                  chargerSelection.connectorTypes.filter(
                                    (c) => c !== connector.name,
                                  ),
                              });
                            }
                          }}
                        />
                        <div className="flex-1">
                          <Label
                            htmlFor={connector.name}
                            className="text-sm font-medium"
                          >
                            {connector.name}
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            {connector.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="weatherProtection"
                        checked={chargerSelection.weatherProtection}
                        onCheckedChange={(checked) =>
                          setChargerSelection({
                            ...chargerSelection,
                            weatherProtection: checked as boolean,
                          })
                        }
                      />
                      <Label htmlFor="weatherProtection">
                        Weather Protection Required
                      </Label>
                    </div>
                    <p className="text-xs text-muted-foreground ml-6">
                      IP65 rated enclosures for outdoor installations
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="networkConnectivity">
                      Network Connectivity *
                    </Label>
                    <Select
                      value={chargerSelection.networkConnectivity}
                      onValueChange={(value) =>
                        setChargerSelection({
                          ...chargerSelection,
                          networkConnectivity: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select connectivity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="4g">
                          4G/LTE - Cellular connection
                        </SelectItem>
                        <SelectItem value="wifi">
                          WiFi - Wireless network
                        </SelectItem>
                        <SelectItem value="ethernet">
                          Ethernet - Wired connection
                        </SelectItem>
                        <SelectItem value="offline">
                          Offline Operation - No connectivity
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Cost Summary */}
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-primary" />
                    Estimated Project Cost
                  </h4>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Equipment Cost:</p>
                      <p className="text-muted-foreground">
                        {recommendations.estimatedCost}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Installation Timeline:</p>
                      <p className="text-muted-foreground">
                        {recommendations.installationTime}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Total Charging Points:</p>
                      <p className="text-muted-foreground">
                        {chargerSelection.numberOfChargers ||
                          recommendations.numberOfChargers}{" "}
                        units
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                <h3 className="font-medium text-yellow-800">
                  Grid Capacity Assessment Required
                </h3>
              </div>
              <p className="text-sm text-yellow-700">
                Based on your charger selection, we need to assess if the
                existing electrical infrastructure can support the new load.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="currentSupply">
                  Current Electrical Supply (kVA)
                </Label>
                <Input
                  id="currentSupply"
                  type="number"
                  value={gridCapacity.currentSupply}
                  onChange={(e) =>
                    setGridCapacity({
                      ...gridCapacity,
                      currentSupply: e.target.value,
                    })
                  }
                  placeholder="e.g., 400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="requiredCapacity">
                  Required Additional Capacity (kVA)
                </Label>
                <Input
                  id="requiredCapacity"
                  type="number"
                  value={gridCapacity.requiredCapacity}
                  onChange={(e) =>
                    setGridCapacity({
                      ...gridCapacity,
                      requiredCapacity: e.target.value,
                    })
                  }
                  placeholder="Calculated: 600"
                  disabled
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="upgradeNeeded"
                checked={gridCapacity.upgradeNeeded}
                onCheckedChange={(checked) =>
                  setGridCapacity({
                    ...gridCapacity,
                    upgradeNeeded: checked as boolean,
                  })
                }
              />
              <Label htmlFor="upgradeNeeded">
                Electrical Infrastructure Upgrade Required
              </Label>
            </div>

            {gridCapacity.upgradeNeeded && (
              <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                <div className="space-y-2">
                  <Label htmlFor="upgradeType">Type of Upgrade Required</Label>
                  <Select
                    value={gridCapacity.upgradeType}
                    onValueChange={(value) =>
                      setGridCapacity({ ...gridCapacity, upgradeType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select upgrade type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="meter-upgrade">
                        Meter Upgrade
                      </SelectItem>
                      <SelectItem value="switchboard-upgrade">
                        Switchboard Upgrade
                      </SelectItem>
                      <SelectItem value="transformer-upgrade">
                        Transformer Upgrade
                      </SelectItem>
                      <SelectItem value="service-upgrade">
                        Service Connection Upgrade
                      </SelectItem>
                      <SelectItem value="full-infrastructure">
                        Full Infrastructure Upgrade
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estimatedUpgradeCost">
                    Estimated Upgrade Cost (AUD)
                  </Label>
                  <Input
                    id="estimatedUpgradeCost"
                    value={gridCapacity.estimatedUpgradeCost}
                    onChange={(e) =>
                      setGridCapacity({
                        ...gridCapacity,
                        estimatedUpgradeCost: e.target.value,
                      })
                    }
                    placeholder="e.g., $25,000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="utilityContact">
                    Utility Company Contact
                  </Label>
                  <Input
                    id="utilityContact"
                    value={gridCapacity.utilityContact}
                    onChange={(e) =>
                      setGridCapacity({
                        ...gridCapacity,
                        utilityContact: e.target.value,
                      })
                    }
                    placeholder="Contact person/department for utility approval"
                  />
                </div>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">
                Load Management Options
              </h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Dynamic load balancing to optimize power usage</li>
                <li>• Time-of-use scheduling to reduce peak demand</li>
                <li>• Smart charging algorithms to manage multiple vehicles</li>
                <li>• Integration with building management systems</li>
              </ul>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-green-600" />
                <h3 className="font-medium text-green-800">
                  AS/NZS 3000 Compliance Checklist
                </h3>
              </div>
              <p className="text-sm text-green-700">
                Ensure your EV charging installation meets Australian electrical
                standards and local regulations.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">
                  Electrical Standards Compliance
                </Label>
                <div className="mt-2 space-y-2">
                  {[
                    "AS/NZS 3000:2018 Wiring Rules compliance",
                    "AS/NZS 61851 Electric vehicle charging standard",
                    "Earth leakage protection (RCD) installation",
                    "Surge protection devices installed",
                    "Proper cable sizing and protection",
                    "Electrical isolation and switching",
                  ].map((item) => (
                    <div key={item} className="flex items-center space-x-2">
                      <Checkbox
                        id={item}
                        checked={compliance.electricalStandards.includes(item)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setCompliance({
                              ...compliance,
                              electricalStandards: [
                                ...compliance.electricalStandards,
                                item,
                              ],
                            });
                          } else {
                            setCompliance({
                              ...compliance,
                              electricalStandards:
                                compliance.electricalStandards.filter(
                                  (s) => s !== item,
                                ),
                            });
                          }
                        }}
                      />
                      <Label htmlFor={item} className="text-sm">
                        {item}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-base font-medium">
                  Safety Requirements
                </Label>
                <div className="mt-2 space-y-2">
                  {[
                    "Emergency stop functionality",
                    "Vehicle impact protection barriers",
                    "Adequate lighting for night use",
                    "Clear signage and user instructions",
                    "Fire safety compliance",
                    "Weather protection and IP ratings",
                  ].map((item) => (
                    <div key={item} className="flex items-center space-x-2">
                      <Checkbox
                        id={item}
                        checked={compliance.safetyRequirements.includes(item)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setCompliance({
                              ...compliance,
                              safetyRequirements: [
                                ...compliance.safetyRequirements,
                                item,
                              ],
                            });
                          } else {
                            setCompliance({
                              ...compliance,
                              safetyRequirements:
                                compliance.safetyRequirements.filter(
                                  (s) => s !== item,
                                ),
                            });
                          }
                        }}
                      />
                      <Label htmlFor={item} className="text-sm">
                        {item}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-base font-medium">
                  Local Permits & Approvals
                </Label>
                <div className="mt-2 space-y-2">
                  {[
                    "Local council development approval",
                    "Electrical license verification",
                    "Network operator connection approval",
                    "Building permit (if required)",
                    "Environmental impact assessment",
                    "Heritage considerations (if applicable)",
                  ].map((item) => (
                    <div key={item} className="flex items-center space-x-2">
                      <Checkbox
                        id={item}
                        checked={compliance.localPermits.includes(item)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setCompliance({
                              ...compliance,
                              localPermits: [...compliance.localPermits, item],
                            });
                          } else {
                            setCompliance({
                              ...compliance,
                              localPermits: compliance.localPermits.filter(
                                (s) => s !== item,
                              ),
                            });
                          }
                        }}
                      />
                      <Label htmlFor={item} className="text-sm">
                        {item}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="accessibilityCompliance"
                  checked={compliance.accessibilityCompliance}
                  onCheckedChange={(checked) =>
                    setCompliance({
                      ...compliance,
                      accessibilityCompliance: checked as boolean,
                    })
                  }
                />
                <Label
                  htmlFor="accessibilityCompliance"
                  className="font-medium"
                >
                  Accessibility compliance (DDA/BCA requirements)
                </Label>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <h3 className="font-medium text-primary">Project Summary</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Review your project details before creating the project plan.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Site Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>
                    <strong>Project:</strong>{" "}
                    {siteAssessment.projectName || "Not specified"}
                  </div>
                  <div>
                    <strong>Client:</strong>{" "}
                    {siteAssessment.clientName || "Not specified"}
                  </div>
                  <div>
                    <strong>Site Type:</strong>{" "}
                    {siteAssessment.siteType || "Not specified"}
                  </div>
                  <div>
                    <strong>Address:</strong>{" "}
                    {siteAssessment.siteAddress || "Not specified"}
                  </div>
                  <div>
                    <strong>Parking Spaces:</strong>{" "}
                    {siteAssessment.parkingSpaces || "Not specified"}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Plug className="w-4 h-4" />
                    Charging Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>
                    <strong>Type:</strong>{" "}
                    {chargerSelection.chargingType
                      ? chargerSelection.chargingType
                          .replace("-", " ")
                          .toUpperCase()
                      : "Not specified"}
                  </div>
                  <div>
                    <strong>Power Rating:</strong>{" "}
                    {chargerSelection.powerRating || "Not specified"}
                  </div>
                  <div>
                    <strong>Number of Chargers:</strong>{" "}
                    {chargerSelection.numberOfChargers || "Not specified"}
                  </div>
                  <div>
                    <strong>Mounting:</strong>{" "}
                    {chargerSelection.mountingType
                      ? chargerSelection.mountingType
                          .replace("-", " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())
                      : "Not specified"}
                  </div>
                  <div>
                    <strong>Connectors:</strong>{" "}
                    {chargerSelection.connectorTypes.length > 0
                      ? chargerSelection.connectorTypes.join(", ")
                      : "None selected"}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Gauge className="w-4 h-4" />
                    Grid Capacity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>
                    <strong>Current Supply:</strong>{" "}
                    {gridCapacity.currentSupply
                      ? `${gridCapacity.currentSupply} kVA`
                      : "Not specified"}
                  </div>
                  <div>
                    <strong>Required Capacity:</strong>{" "}
                    {gridCapacity.requiredCapacity
                      ? `${gridCapacity.requiredCapacity} kVA`
                      : "To be calculated"}
                  </div>
                  <div>
                    <strong>Upgrade Needed:</strong>{" "}
                    {gridCapacity.upgradeNeeded ? "Yes" : "No"}
                  </div>
                  {gridCapacity.upgradeNeeded && (
                    <>
                      <div>
                        <strong>Upgrade Type:</strong>{" "}
                        {gridCapacity.upgradeType || "Not specified"}
                      </div>
                      <div>
                        <strong>Estimated Cost:</strong>{" "}
                        {gridCapacity.estimatedUpgradeCost || "To be quoted"}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Compliance Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>
                    <strong>Electrical Standards:</strong>{" "}
                    {compliance.electricalStandards.length}/6 items
                  </div>
                  <div>
                    <strong>Safety Requirements:</strong>{" "}
                    {compliance.safetyRequirements.length}/6 items
                  </div>
                  <div>
                    <strong>Local Permits:</strong>{" "}
                    {compliance.localPermits.length}/6 items
                  </div>
                  <div>
                    <strong>Accessibility:</strong>{" "}
                    {compliance.accessibilityCompliance
                      ? "Compliant"
                      : "Needs Review"}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <h3 className="font-medium text-yellow-800 mb-2">Next Steps</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Generate detailed quote and project timeline</li>
                <li>• Schedule site visit for final assessment</li>
                <li>• Submit permit applications</li>
                <li>• Coordinate with utility company (if upgrade required)</li>
                <li>• Prepare installation schedule and team allocation</li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Handle creating a quote from the completed project
  const handleCreateQuote = () => {
    if (!createdProject || !user) return;

    try {
      // Create a new quote from the project
      const newQuote = quoteService.createQuote(createdProject.id);
      newQuote.createdBy = user.id;

      // Update quote with user information
      quoteService.updateQuote(newQuote);

      // Close success dialog and navigate to quote builder
      setShowSuccessDialog(false);
      navigate(`/quotes/${newQuote.id}`);
    } catch (error) {
      console.error("Error creating quote:", error);
      alert("Error creating quote. Please try again.");
    }
  };

  // Handle closing success dialog and going to dashboard
  const handleGoToDashboard = () => {
    setShowSuccessDialog(false);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Logo size="lg" />
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/dashboard"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Dashboard
            </Link>
            <Link
              to="/projects"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Projects
            </Link>
          </nav>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" asChild>
              <Link to="/dashboard">
                <Home className="w-4 h-4 mr-2" />
                Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">Project Planning Wizard</h1>
              <div className="flex items-center gap-3">
                <p className="text-muted-foreground">
                  Step {currentStep} of {totalSteps}:{" "}
                  {getStepTitle(currentStep)}
                </p>
                {isDraftSaving && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    Auto-saving...
                  </div>
                )}
                {draftSaved && !isDraftSaving && (
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <CheckCircle2 className="w-3 h-3" />
                    Draft saved
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {selectedTemplate && (
                <Badge variant="secondary" className="px-3 py-1">
                  Template: {selectedTemplate.name}
                </Badge>
              )}
              <Badge variant="outline" className="px-3 py-1">
                {Math.round((currentStep / totalSteps) * 100)}% Complete
              </Badge>
              {currentDraftId && (
                <Badge variant="secondary" className="px-3 py-1 text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  Draft
                </Badge>
              )}
            </div>
          </div>

          <Progress value={(currentStep / totalSteps) * 100} className="h-2" />

          {/* Step indicators */}
          <div className="flex justify-between mt-4">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
              <div
                key={step}
                className={`flex items-center gap-2 text-sm ${
                  step <= currentStep ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step <= currentStep
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step < currentStep ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    getStepIcon(step)
                  )}
                </div>
                <span className="hidden md:block">{getStepTitle(step)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Optional: Show cloud storage upgrade only if explicitly requested */}

        {/* Main Content */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getStepIcon(currentStep)}
              {getStepTitle(currentStep)}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 &&
                "Understand client needs, project objectives, and specific requirements before technical assessment."}
              {currentStep === 2 &&
                "Gather essential information about the installation site and project requirements."}
              {currentStep === 3 &&
                "Select the appropriate charging equipment based on site requirements and usage patterns."}
              {currentStep === 4 &&
                "Analyze electrical infrastructure capacity and determine upgrade requirements."}
              {currentStep === 5 &&
                "Ensure compliance with Australian electrical standards and local regulations."}
              {currentStep === 6 &&
                "Review all project details and create your project plan."}
            </CardDescription>
          </CardHeader>
          <CardContent>{renderStepContent()}</CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-8 max-w-4xl mx-auto">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </Button>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowTemplateSelector(true)}
              className="flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              {selectedTemplate ? "Change Template" : "Use Template"}
            </Button>
            <Button
              variant="ghost"
              onClick={async () => {
                await saveDraft(true);
                navigate("/dashboard");
              }}
              disabled={isDraftSaving}
              className="flex items-center gap-2"
            >
              {isDraftSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : draftSaved ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Draft Saved
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Draft
                </>
              )}
            </Button>

            {currentStep < totalSteps ? (
              <Button onClick={nextStep} className="flex items-center gap-2">
                Next
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 min-w-[140px]"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Create Project
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Template Selector */}
      <ProjectTemplateSelector
        open={showTemplateSelector}
        onOpenChange={setShowTemplateSelector}
        onSelectTemplate={handleSelectTemplate}
        onSkipTemplate={handleSkipTemplate}
      />
    </div>
  );
}
