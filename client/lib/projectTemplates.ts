// Project templates for common EV installation types
// Each template provides pre-configured settings and recommendations

export interface ProjectTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  estimatedDuration: string;
  costRange: string;
  complexity: "Low" | "Medium" | "High";
  popularityScore: number;
  clientRequirements: Partial<ClientRequirements>;
  siteAssessment: Partial<SiteAssessment>;
  chargerSelection: Partial<ChargerSelection>;
  gridCapacity: Partial<GridCapacity>;
  compliance: Partial<Compliance>;
  milestones: TemplateMilestone[];
  recommendations: string[];
  considerations: string[];
}

export interface TemplateMilestone {
  title: string;
  description: string;
  duration: number; // days from project start
  category: "planning" | "permits" | "procurement" | "installation" | "testing";
}

interface ClientRequirements {
  organizationType: string;
  projectObjective: string;
  numberOfVehicles: string;
  vehicleTypes: string[];
  dailyUsagePattern: string;
  budgetRange: string;
  projectTimeline: string;
  sustainabilityGoals: string[];
  accessibilityRequirements: boolean;
}

interface SiteAssessment {
  siteType: string;
  existingPowerSupply: string;
  parkingSpaces: string;
}

interface ChargerSelection {
  chargingType: string;
  powerRating: string;
  numberOfChargers: string;
  mountingType: string;
  connectorTypes: string[];
  weatherProtection: boolean;
  networkConnectivity: string;
  managementPlatform?: boolean;
  evnetPlatform?: boolean;
}

interface GridCapacity {
  upgradeNeeded: boolean;
  upgradeType: string;
}

interface Compliance {
  electricalStandards: string[];
  safetyRequirements: string[];
  localPermits: string[];
  environmentalConsiderations: string[];
  accessibilityCompliance: boolean;
}

export const projectTemplates: ProjectTemplate[] = [
  {
    id: "residential-apartment",
    name: "Residential Apartment Complex",
    category: "Residential",
    description:
      "Multi-unit residential charging solution with visitor and resident parking",
    icon: "building",
    estimatedDuration: "8-12 weeks",
    costRange: "$45,000 - $85,000",
    complexity: "Medium",
    popularityScore: 95,
    clientRequirements: {
      organizationType: "residential",
      projectObjective: "employee-benefit",
      numberOfVehicles: "16-30",
      vehicleTypes: ["Passenger Cars"],
      dailyUsagePattern: "overnight",
      budgetRange: "50-100k",
      projectTimeline: "standard",
      sustainabilityGoals: [
        "Green Building Certification",
        "Corporate ESG Goals",
      ],
      accessibilityRequirements: true,
    },
    siteAssessment: {
      siteType: "residential",
      existingPowerSupply: "three-phase-415v",
      parkingSpaces: "50",
    },
    chargerSelection: {
      chargingType: "ac-level2",
      powerRating: "7kw",
      numberOfChargers: "8",
      mountingType: "wall",
      connectorTypes: ["Type 2 AC"],
      weatherProtection: true,
      networkConnectivity: "wifi",
    },
    gridCapacity: {
      upgradeNeeded: false,
      upgradeType: "",
    },
    compliance: {
      electricalStandards: ["AS/NZS 3000", "AS/NZS 61851"],
      safetyRequirements: ["RCD Protection", "Earth Leakage Detection"],
      localPermits: ["Building Permit", "Electrical Work Permit"],
      environmentalConsiderations: ["Noise Assessment", "Visual Impact"],
      accessibilityCompliance: true,
    },
    milestones: [
      {
        title: "Initial Site Survey",
        description: "Electrical assessment and parking layout review",
        duration: 7,
        category: "planning",
      },
      {
        title: "Body Corporate Approval",
        description: "Obtain consent from building management",
        duration: 14,
        category: "permits",
      },
      {
        title: "Council Permits",
        description: "Submit and obtain local council approvals",
        duration: 21,
        category: "permits",
      },
      {
        title: "Equipment Procurement",
        description: "Order chargers and electrical components",
        duration: 35,
        category: "procurement",
      },
      {
        title: "Installation",
        description: "Install charging infrastructure",
        duration: 49,
        category: "installation",
      },
      {
        title: "Testing & Commissioning",
        description: "System testing and resident training",
        duration: 56,
        category: "testing",
      },
    ],
    recommendations: [
      "Install Type 2 AC chargers for overnight charging",
      "Consider smart load management to prevent grid overload",
      "Implement user access control for resident security",
      "Plan for future expansion as EV adoption grows",
    ],
    considerations: [
      "Body corporate approval required for common property modifications",
      "Resident communication strategy important for adoption",
      "Consider visitor charging provisions",
      "Plan cable management to prevent trip hazards",
    ],
  },
  {
    id: "commercial-office",
    name: "Commercial Office Building",
    category: "Commercial",
    description:
      "Workplace charging for employees and visitors with smart management",
    icon: "building2",
    estimatedDuration: "6-10 weeks",
    costRange: "$35,000 - $75,000",
    complexity: "Medium",
    popularityScore: 90,
    clientRequirements: {
      organizationType: "office",
      projectObjective: "employee-benefit",
      numberOfVehicles: "31-50",
      vehicleTypes: ["Passenger Cars"],
      dailyUsagePattern: "business-hours",
      budgetRange: "50-100k",
      projectTimeline: "standard",
      sustainabilityGoals: ["Corporate ESG Goals", "NABERS Rating Improvement"],
      accessibilityRequirements: true,
    },
    siteAssessment: {
      siteType: "office",
      existingPowerSupply: "three-phase-415v",
      parkingSpaces: "100",
    },
    chargerSelection: {
      chargingType: "ac-level2",
      powerRating: "11kw",
      numberOfChargers: "12",
      mountingType: "pedestal",
      connectorTypes: ["Type 2 AC"],
      weatherProtection: true,
      networkConnectivity: "ethernet",
      managementPlatform: true,
      evnetPlatform: true,
    },
    gridCapacity: {
      upgradeNeeded: false,
      upgradeType: "",
    },
    compliance: {
      electricalStandards: ["AS/NZS 3000", "AS/NZS 61851"],
      safetyRequirements: ["RCD Protection", "Emergency Stop"],
      localPermits: ["Development Approval", "Electrical Work Permit"],
      environmentalConsiderations: ["Green Star Certification"],
      accessibilityCompliance: true,
    },
    milestones: [
      {
        title: "Employee Survey",
        description: "Assess employee EV adoption and charging needs",
        duration: 3,
        category: "planning",
      },
      {
        title: "Site Assessment",
        description: "Electrical and structural evaluation",
        duration: 10,
        category: "planning",
      },
      {
        title: "Development Approval",
        description: "Council permits for commercial installation",
        duration: 28,
        category: "permits",
      },
      {
        title: "Equipment Order",
        description: "Procure charging stations and management system",
        duration: 35,
        category: "procurement",
      },
      {
        title: "Installation",
        description: "Install chargers and network connectivity",
        duration: 42,
        category: "installation",
      },
      {
        title: "Staff Training",
        description: "Train facilities team and launch employee program",
        duration: 49,
        category: "testing",
      },
    ],
    recommendations: [
      "Implement smart charging to optimize energy costs",
      "Consider time-of-use tariffs for cost savings",
      "Install workplace charging management system",
      "Plan for mix of dedicated and shared charging bays",
    ],
    considerations: [
      "Employee charging policy development required",
      "Consider energy management integration",
      "Plan for future fleet electrification",
      "Evaluate parking allocation strategies",
    ],
  },
  {
    id: "retail-shopping",
    name: "Retail Shopping Centre",
    category: "Retail",
    description:
      "Customer-focused fast charging with revenue generation potential",
    icon: "store",
    estimatedDuration: "10-16 weeks",
    costRange: "$150,000 - $300,000",
    complexity: "High",
    popularityScore: 85,
    clientRequirements: {
      organizationType: "retail",
      projectObjective: "customer-attraction",
      numberOfVehicles: "51-100",
      vehicleTypes: ["Passenger Cars"],
      dailyUsagePattern: "extended-hours",
      budgetRange: "250-500k",
      projectTimeline: "standard",
      sustainabilityGoals: [
        "Carbon Neutral by 2030",
        "Green Building Certification",
      ],
      accessibilityRequirements: true,
    },
    siteAssessment: {
      siteType: "retail",
      existingPowerSupply: "high-voltage",
      parkingSpaces: "500",
    },
    chargerSelection: {
      chargingType: "mixed",
      powerRating: "50kw",
      numberOfChargers: "16",
      mountingType: "pedestal",
      connectorTypes: ["Type 2 AC", "CCS2", "CHAdeMO"],
      weatherProtection: true,
      networkConnectivity: "4g",
      managementPlatform: true,
      evnetPlatform: true,
    },
    gridCapacity: {
      upgradeNeeded: true,
      upgradeType: "transformer",
    },
    compliance: {
      electricalStandards: ["AS/NZS 3000", "AS/NZS 61851", "AS/NZS 62196"],
      safetyRequirements: [
        "Emergency Stop",
        "Fire Safety Systems",
        "CCTV Monitoring",
      ],
      localPermits: [
        "Development Approval",
        "Building Permit",
        "Electrical Work Permit",
      ],
      environmentalConsiderations: [
        "Traffic Impact Assessment",
        "Noise Assessment",
      ],
      accessibilityCompliance: true,
    },
    milestones: [
      {
        title: "Customer Demand Analysis",
        description: "Market research and customer charging patterns",
        duration: 7,
        category: "planning",
      },
      {
        title: "Electrical Design",
        description: "High-voltage electrical design and load analysis",
        duration: 21,
        category: "planning",
      },
      {
        title: "Development Approval",
        description: "Council approval for major infrastructure",
        duration: 42,
        category: "permits",
      },
      {
        title: "Utility Coordination",
        description: "Grid connection and transformer upgrade",
        duration: 63,
        category: "permits",
      },
      {
        title: "Equipment Procurement",
        description: "Source DC fast chargers and payment systems",
        duration: 77,
        category: "procurement",
      },
      {
        title: "Civil Works",
        description: "Trenching, foundations, and site preparation",
        duration: 91,
        category: "installation",
      },
      {
        title: "Installation",
        description: "Install chargers and commission systems",
        duration: 105,
        category: "installation",
      },
      {
        title: "Customer Launch",
        description: "Marketing launch and customer onboarding",
        duration: 112,
        category: "testing",
      },
    ],
    recommendations: [
      "Install mix of AC and DC fast charging",
      "Implement payment systems for customer convenience",
      "Consider canopy for weather protection",
      "Plan marketing strategy for customer adoption",
    ],
    considerations: [
      "Revenue model and pricing strategy required",
      "High-voltage grid connection may be needed",
      "Consider integration with shopping centre systems",
      "Plan for peak demand management",
    ],
  },
  {
    id: "fleet-depot",
    name: "Fleet Depot Charging",
    category: "Fleet",
    description:
      "High-capacity charging for commercial vehicle fleets with depot management",
    icon: "truck",
    estimatedDuration: "12-20 weeks",
    costRange: "$200,000 - $500,000",
    complexity: "High",
    popularityScore: 80,
    clientRequirements: {
      organizationType: "fleet",
      projectObjective: "fleet-electrification",
      numberOfVehicles: "51-100",
      vehicleTypes: [
        "Light Commercial",
        "Delivery Vans",
        "Trucks/Heavy Vehicles",
      ],
      dailyUsagePattern: "overnight",
      budgetRange: "250-500k",
      projectTimeline: "flexible",
      sustainabilityGoals: ["Carbon Neutral by 2030", "Corporate ESG Goals"],
      accessibilityRequirements: false,
    },
    siteAssessment: {
      siteType: "fleet",
      existingPowerSupply: "high-voltage",
      parkingSpaces: "75",
    },
    chargerSelection: {
      chargingType: "mixed",
      powerRating: "22kw",
      numberOfChargers: "30",
      mountingType: "overhead",
      connectorTypes: ["Type 2 AC", "CCS2"],
      weatherProtection: true,
      networkConnectivity: "ethernet",
      managementPlatform: true,
      evnetPlatform: true,
    },
    gridCapacity: {
      upgradeNeeded: true,
      upgradeType: "service-upgrade",
    },
    compliance: {
      electricalStandards: ["AS/NZS 3000", "AS/NZS 61851"],
      safetyRequirements: [
        "Emergency Stop",
        "Isolation Switches",
        "Load Management",
      ],
      localPermits: ["Industrial Development Permit", "Electrical Work Permit"],
      environmentalConsiderations: ["Environmental Management Plan"],
      accessibilityCompliance: false,
    },
    milestones: [
      {
        title: "Fleet Analysis",
        description: "Vehicle usage patterns and charging requirements",
        duration: 14,
        category: "planning",
      },
      {
        title: "Load Management Design",
        description: "Electrical load analysis and smart charging design",
        duration: 28,
        category: "planning",
      },
      {
        title: "Industrial Permits",
        description: "Obtain permits for industrial-scale installation",
        duration: 56,
        category: "permits",
      },
      {
        title: "Grid Connection",
        description: "Utility coordination for high-capacity connection",
        duration: 84,
        category: "permits",
      },
      {
        title: "Infrastructure Installation",
        description: "Electrical infrastructure and charging equipment",
        duration: 126,
        category: "installation",
      },
      {
        title: "Fleet Management Integration",
        description: "Integrate with existing fleet management systems",
        duration: 140,
        category: "testing",
      },
    ],
    recommendations: [
      "Implement smart load management for cost optimization",
      "Consider overnight charging schedules",
      "Install fleet management integration",
      "Plan for heavy vehicle charging requirements",
    ],
    considerations: [
      "High power requirements need utility coordination",
      "Vehicle scheduling integration important",
      "Consider future fleet expansion",
      "Plan for different vehicle charging speeds",
    ],
  },
  {
    id: "public-council",
    name: "Public Council Facility",
    category: "Public",
    description:
      "Community charging infrastructure for public spaces and civic buildings",
    icon: "landmark",
    estimatedDuration: "14-22 weeks",
    costRange: "$100,000 - $200,000",
    complexity: "High",
    popularityScore: 75,
    clientRequirements: {
      organizationType: "government",
      projectObjective: "future-proofing",
      numberOfVehicles: "31-50",
      vehicleTypes: ["Passenger Cars"],
      dailyUsagePattern: "extended-hours",
      budgetRange: "100-250k",
      projectTimeline: "flexible",
      sustainabilityGoals: [
        "Carbon Neutral by 2030",
        "Community Environmental Impact",
      ],
      accessibilityRequirements: true,
    },
    siteAssessment: {
      siteType: "public",
      existingPowerSupply: "three-phase-415v",
      parkingSpaces: "80",
    },
    chargerSelection: {
      chargingType: "mixed",
      powerRating: "22kw",
      numberOfChargers: "10",
      mountingType: "pedestal",
      connectorTypes: ["Type 2 AC", "CCS2"],
      weatherProtection: true,
      networkConnectivity: "4g",
    },
    gridCapacity: {
      upgradeNeeded: false,
      upgradeType: "",
    },
    compliance: {
      electricalStandards: ["AS/NZS 3000", "AS/NZS 61851"],
      safetyRequirements: ["Public Safety Standards", "Emergency Stop", "CCTV"],
      localPermits: ["Council Resolution", "Public Works Permit"],
      environmentalConsiderations: [
        "Community Impact Assessment",
        "Heritage Considerations",
      ],
      accessibilityCompliance: true,
    },
    milestones: [
      {
        title: "Community Consultation",
        description: "Public consultation and stakeholder engagement",
        duration: 21,
        category: "planning",
      },
      {
        title: "Council Approval",
        description: "Internal council approval and budget allocation",
        duration: 42,
        category: "permits",
      },
      {
        title: "Public Tender",
        description: "Public procurement process for installation",
        duration: 77,
        category: "procurement",
      },
      {
        title: "Installation",
        description: "Install public charging infrastructure",
        duration: 119,
        category: "installation",
      },
      {
        title: "Public Launch",
        description: "Community launch and education program",
        duration: 154,
        category: "testing",
      },
    ],
    recommendations: [
      "Include DC fast charging for public convenience",
      "Implement payment systems for public use",
      "Consider solar integration for sustainability",
      "Plan community education program",
    ],
    considerations: [
      "Public procurement processes apply",
      "Community consultation required",
      "Accessibility compliance mandatory",
      "Consider vandalism protection",
    ],
  },
  {
    id: "hospitality-hotel",
    name: "Hotel & Hospitality",
    category: "Hospitality",
    description:
      "Guest charging services with premium amenities and valet integration",
    icon: "bed",
    estimatedDuration: "8-14 weeks",
    costRange: "$60,000 - $120,000",
    complexity: "Medium",
    popularityScore: 70,
    clientRequirements: {
      organizationType: "hotel",
      projectObjective: "customer-attraction",
      numberOfVehicles: "16-30",
      vehicleTypes: ["Passenger Cars"],
      dailyUsagePattern: "24-7",
      budgetRange: "50-100k",
      projectTimeline: "standard",
      sustainabilityGoals: [
        "Green Building Certification",
        "Corporate ESG Goals",
      ],
      accessibilityRequirements: true,
    },
    siteAssessment: {
      siteType: "commercial",
      existingPowerSupply: "three-phase-415v",
      parkingSpaces: "60",
    },
    chargerSelection: {
      chargingType: "ac-level2",
      powerRating: "11kw",
      numberOfChargers: "8",
      mountingType: "wall",
      connectorTypes: ["Type 2 AC"],
      weatherProtection: true,
      networkConnectivity: "wifi",
    },
    gridCapacity: {
      upgradeNeeded: false,
      upgradeType: "",
    },
    compliance: {
      electricalStandards: ["AS/NZS 3000", "AS/NZS 61851"],
      safetyRequirements: ["Guest Safety Standards", "Emergency Procedures"],
      localPermits: ["Building Permit", "Electrical Work Permit"],
      environmentalConsiderations: ["Noise Management", "Visual Impact"],
      accessibilityCompliance: true,
    },
    milestones: [
      {
        title: "Guest Needs Assessment",
        description: "Survey guest charging preferences and usage",
        duration: 7,
        category: "planning",
      },
      {
        title: "Site Design",
        description: "Integrate charging with existing parking",
        duration: 21,
        category: "planning",
      },
      {
        title: "Permits & Approvals",
        description: "Obtain necessary permits for commercial property",
        duration: 35,
        category: "permits",
      },
      {
        title: "Installation",
        description: "Install charging stations with minimal guest disruption",
        duration: 56,
        category: "installation",
      },
      {
        title: "Staff Training",
        description: "Train concierge and valet staff on charging services",
        duration: 63,
        category: "testing",
      },
      {
        title: "Guest Launch",
        description: "Launch guest charging program with marketing",
        duration: 70,
        category: "testing",
      },
    ],
    recommendations: [
      "Integrate with hotel management systems",
      "Consider valet charging services",
      "Implement guest billing integration",
      "Plan premium charging locations",
    ],
    considerations: [
      "Guest convenience is primary concern",
      "Integration with existing hotel systems",
      "Consider concierge service model",
      "Plan for varying guest vehicle types",
    ],
  },
];

// Template categories for filtering
export const templateCategories = [
  { id: "all", name: "All Templates", count: projectTemplates.length },
  {
    id: "residential",
    name: "Residential",
    count: projectTemplates.filter((t) => t.category === "Residential").length,
  },
  {
    id: "commercial",
    name: "Commercial",
    count: projectTemplates.filter((t) => t.category === "Commercial").length,
  },
  {
    id: "retail",
    name: "Retail",
    count: projectTemplates.filter((t) => t.category === "Retail").length,
  },
  {
    id: "fleet",
    name: "Fleet",
    count: projectTemplates.filter((t) => t.category === "Fleet").length,
  },
  {
    id: "public",
    name: "Public",
    count: projectTemplates.filter((t) => t.category === "Public").length,
  },
  {
    id: "hospitality",
    name: "Hospitality",
    count: projectTemplates.filter((t) => t.category === "Hospitality").length,
  },
];

// Get template by ID
export const getTemplateById = (id: string): ProjectTemplate | undefined => {
  return projectTemplates.find((template) => template.id === id);
};

// Get templates by category
export const getTemplatesByCategory = (category: string): ProjectTemplate[] => {
  if (category === "all") return projectTemplates;
  return projectTemplates.filter(
    (template) => template.category.toLowerCase() === category.toLowerCase(),
  );
};

// Get most popular templates
export const getPopularTemplates = (limit: number = 3): ProjectTemplate[] => {
  return projectTemplates
    .sort((a, b) => b.popularityScore - a.popularityScore)
    .slice(0, limit);
};

// Apply template to project data
export const applyTemplate = (template: ProjectTemplate) => {
  return {
    clientRequirements: {
      contactPersonName: "",
      contactTitle: "",
      contactEmail: "",
      contactPhone: "",
      organizationType: template.clientRequirements.organizationType || "",
      projectObjective: template.clientRequirements.projectObjective || "",
      numberOfVehicles: template.clientRequirements.numberOfVehicles || "",
      vehicleTypes: template.clientRequirements.vehicleTypes || [],
      dailyUsagePattern: template.clientRequirements.dailyUsagePattern || "",
      budgetRange: template.clientRequirements.budgetRange || "",
      projectTimeline: template.clientRequirements.projectTimeline || "",
      sustainabilityGoals:
        template.clientRequirements.sustainabilityGoals || [],
      accessibilityRequirements:
        template.clientRequirements.accessibilityRequirements || false,
      specialRequirements: "",
      preferredChargerBrands: [],
      paymentModel: "",
    },
    siteAssessment: {
      projectName: "",
      clientName: "",
      siteAddress: "",
      siteType: template.siteAssessment.siteType || "",
      existingPowerSupply: template.siteAssessment.existingPowerSupply || "",
      availableAmperes: "",
      estimatedLoad: "",
      parkingSpaces: template.siteAssessment.parkingSpaces || "",
      accessRequirements: "",
      photos: [],
      additionalNotes: "",
    },
    chargerSelection: {
      chargingType: template.chargerSelection.chargingType || "",
      powerRating: template.chargerSelection.powerRating || "",
      mountingType: template.chargerSelection.mountingType || "",
      numberOfChargers: template.chargerSelection.numberOfChargers || "",
      connectorTypes: template.chargerSelection.connectorTypes || [],
      weatherProtection: template.chargerSelection.weatherProtection || false,
      networkConnectivity: template.chargerSelection.networkConnectivity || "",
      managementPlatform: template.chargerSelection.managementPlatform || false,
      evnetPlatform: template.chargerSelection.evnetPlatform || false,
    },
    gridCapacity: {
      currentSupply: "",
      requiredCapacity: "",
      upgradeNeeded: template.gridCapacity.upgradeNeeded || false,
      upgradeType: template.gridCapacity.upgradeType || "",
      estimatedUpgradeCost: "",
      utilityContact: "",
    },
    compliance: {
      electricalStandards: template.compliance.electricalStandards || [],
      safetyRequirements: template.compliance.safetyRequirements || [],
      localPermits: template.compliance.localPermits || [],
      environmentalConsiderations:
        template.compliance.environmentalConsiderations || [],
      accessibilityCompliance:
        template.compliance.accessibilityCompliance || false,
    },
    templateId: template.id,
    templateName: template.name,
  };
};
