import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Logo } from "@/components/ui/logo";
import { Link, useNavigate } from "react-router-dom";
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
  Settings
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

export default function ProjectWizard() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;

  const [clientRequirements, setClientRequirements] = useState<ClientRequirements>({
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
    paymentModel: ""
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
    additionalNotes: ""
  });

  const [chargerSelection, setChargerSelection] = useState<ChargerSelection>({
    chargingType: "",
    powerRating: "",
    mountingType: "",
    numberOfChargers: "",
    connectorTypes: [],
    weatherProtection: false,
    networkConnectivity: ""
  });

  const [gridCapacity, setGridCapacity] = useState<GridCapacity>({
    currentSupply: "",
    requiredCapacity: "",
    upgradeNeeded: false,
    upgradeType: "",
    estimatedUpgradeCost: "",
    utilityContact: ""
  });

  const [compliance, setCompliance] = useState<Compliance>({
    electricalStandards: [],
    safetyRequirements: [],
    localPermits: [],
    environmentalConsiderations: [],
    accessibilityCompliance: false
  });

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1: return "Client Requirements";
      case 2: return "Site Assessment";
      case 3: return "Charger Selection";
      case 4: return "Grid Capacity Analysis";
      case 5: return "Compliance Checklist";
      case 6: return "Project Summary";
      default: return "Project Planning";
    }
  };

  const getStepIcon = (step: number) => {
    switch (step) {
      case 1: return <Users className="w-5 h-5" />;
      case 2: return <MapPin className="w-5 h-5" />;
      case 3: return <Plug className="w-5 h-5" />;
      case 4: return <Gauge className="w-5 h-5" />;
      case 5: return <Shield className="w-5 h-5" />;
      case 6: return <FileText className="w-5 h-5" />;
      default: return <Settings className="w-5 h-5" />;
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    // Here you would save the project data
    console.log("Project Data:", {
      clientRequirements,
      siteAssessment,
      chargerSelection,
      gridCapacity,
      compliance
    });
    navigate("/dashboard");
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
                Let's start by understanding your specific requirements and project goals to tailor the best EV charging solution.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="contactPersonName">Primary Contact Name *</Label>
                <Input
                  id="contactPersonName"
                  value={clientRequirements.contactPersonName}
                  onChange={(e) => setClientRequirements({...clientRequirements, contactPersonName: e.target.value})}
                  placeholder="e.g., John Smith"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactTitle">Title/Position</Label>
                <Input
                  id="contactTitle"
                  value={clientRequirements.contactTitle}
                  onChange={(e) => setClientRequirements({...clientRequirements, contactTitle: e.target.value})}
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
                  onChange={(e) => setClientRequirements({...clientRequirements, contactEmail: e.target.value})}
                  placeholder="john.smith@company.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPhone">Phone Number</Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  value={clientRequirements.contactPhone}
                  onChange={(e) => setClientRequirements({...clientRequirements, contactPhone: e.target.value})}
                  placeholder="(02) 1234 5678"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="organizationType">Organization Type *</Label>
                <Select value={clientRequirements.organizationType} onValueChange={(value) => setClientRequirements({...clientRequirements, organizationType: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select organization type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="retail">Retail/Shopping Centre</SelectItem>
                    <SelectItem value="office">Office Building</SelectItem>
                    <SelectItem value="residential">Residential Complex</SelectItem>
                    <SelectItem value="hotel">Hotel/Hospitality</SelectItem>
                    <SelectItem value="government">Government/Public</SelectItem>
                    <SelectItem value="fleet">Fleet/Logistics</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="industrial">Industrial</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="projectObjective">Primary Project Objective *</Label>
                <Select value={clientRequirements.projectObjective} onValueChange={(value) => setClientRequirements({...clientRequirements, projectObjective: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select primary objective" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee-benefit">Employee Benefit</SelectItem>
                    <SelectItem value="customer-attraction">Customer Attraction</SelectItem>
                    <SelectItem value="fleet-electrification">Fleet Electrification</SelectItem>
                    <SelectItem value="revenue-generation">Revenue Generation</SelectItem>
                    <SelectItem value="sustainability-goals">Sustainability Goals</SelectItem>
                    <SelectItem value="regulatory-compliance">Regulatory Compliance</SelectItem>
                    <SelectItem value="future-proofing">Future-Proofing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="numberOfVehicles">Expected Number of Vehicles *</Label>
                <Select value={clientRequirements.numberOfVehicles} onValueChange={(value) => setClientRequirements({...clientRequirements, numberOfVehicles: value})}>
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
                <Select value={clientRequirements.dailyUsagePattern} onValueChange={(value) => setClientRequirements({...clientRequirements, dailyUsagePattern: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select usage pattern" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="business-hours">Business Hours Only (8am-6pm)</SelectItem>
                    <SelectItem value="extended-hours">Extended Hours (6am-10pm)</SelectItem>
                    <SelectItem value="24-7">24/7 Operation</SelectItem>
                    <SelectItem value="peak-times">Peak Times Only</SelectItem>
                    <SelectItem value="overnight">Overnight Charging</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Vehicle Types (select all that apply)</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {["Passenger Cars", "Light Commercial", "Buses", "Trucks/Heavy Vehicles", "Motorcycles/Scooters", "Delivery Vans", "Emergency Vehicles", "Other Fleet"].map((vehicleType) => (
                  <div key={vehicleType} className="flex items-center space-x-2">
                    <Checkbox
                      id={vehicleType}
                      checked={clientRequirements.vehicleTypes.includes(vehicleType)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setClientRequirements({
                            ...clientRequirements,
                            vehicleTypes: [...clientRequirements.vehicleTypes, vehicleType]
                          });
                        } else {
                          setClientRequirements({
                            ...clientRequirements,
                            vehicleTypes: clientRequirements.vehicleTypes.filter(v => v !== vehicleType)
                          });
                        }
                      }}
                    />
                    <Label htmlFor={vehicleType} className="text-sm">{vehicleType}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="budgetRange">Estimated Budget Range</Label>
                <Select value={clientRequirements.budgetRange} onValueChange={(value) => setClientRequirements({...clientRequirements, budgetRange: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select budget range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="under-25k">Under $25,000</SelectItem>
                    <SelectItem value="25-50k">$25,000 - $50,000</SelectItem>
                    <SelectItem value="50-100k">$50,000 - $100,000</SelectItem>
                    <SelectItem value="100-250k">$100,000 - $250,000</SelectItem>
                    <SelectItem value="250-500k">$250,000 - $500,000</SelectItem>
                    <SelectItem value="500k-1m">$500,000 - $1,000,000</SelectItem>
                    <SelectItem value="over-1m">Over $1,000,000</SelectItem>
                    <SelectItem value="tbd">To Be Determined</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="projectTimeline">Desired Project Timeline</Label>
                <Select value={clientRequirements.projectTimeline} onValueChange={(value) => setClientRequirements({...clientRequirements, projectTimeline: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select timeline" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="urgent">Urgent (1-2 months)</SelectItem>
                    <SelectItem value="fast">Fast Track (3-4 months)</SelectItem>
                    <SelectItem value="standard">Standard (4-6 months)</SelectItem>
                    <SelectItem value="flexible">Flexible (6-12 months)</SelectItem>
                    <SelectItem value="long-term">Long-term Planning (12+ months)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Sustainability Goals (select all that apply)</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {["Carbon Neutral by 2030", "Renewable Energy Integration", "NABERS Rating Improvement", "Green Building Certification", "Corporate ESG Goals", "Government Incentives", "Community Environmental Impact"].map((goal) => (
                  <div key={goal} className="flex items-center space-x-2">
                    <Checkbox
                      id={goal}
                      checked={clientRequirements.sustainabilityGoals.includes(goal)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setClientRequirements({
                            ...clientRequirements,
                            sustainabilityGoals: [...clientRequirements.sustainabilityGoals, goal]
                          });
                        } else {
                          setClientRequirements({
                            ...clientRequirements,
                            sustainabilityGoals: clientRequirements.sustainabilityGoals.filter(g => g !== goal)
                          });
                        }
                      }}
                    />
                    <Label htmlFor={goal} className="text-sm">{goal}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="accessibilityRequirements"
                checked={clientRequirements.accessibilityRequirements}
                onCheckedChange={(checked) => setClientRequirements({...clientRequirements, accessibilityRequirements: checked as boolean})}
              />
              <Label htmlFor="accessibilityRequirements">
                Accessibility requirements for disabled users (DDA compliance)
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialRequirements">Special Requirements or Considerations</Label>
              <Textarea
                id="specialRequirements"
                value={clientRequirements.specialRequirements}
                onChange={(e) => setClientRequirements({...clientRequirements, specialRequirements: e.target.value})}
                placeholder="Any specific requirements, constraints, or preferences..."
                rows={3}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="projectName">Project Name *</Label>
                <Input
                  id="projectName"
                  value={siteAssessment.projectName}
                  onChange={(e) => setSiteAssessment({...siteAssessment, projectName: e.target.value})}
                  placeholder="e.g., Westfield Shopping Centre EV Hub"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="clientName">Client Name *</Label>
                <Input
                  id="clientName"
                  value={siteAssessment.clientName}
                  onChange={(e) => setSiteAssessment({...siteAssessment, clientName: e.target.value})}
                  placeholder="e.g., Westfield Group"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="siteAddress">Site Address *</Label>
              <Input
                id="siteAddress"
                value={siteAssessment.siteAddress}
                onChange={(e) => setSiteAssessment({...siteAssessment, siteAddress: e.target.value})}
                placeholder="Full site address including postcode"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="siteType">Site Type *</Label>
                <Select value={siteAssessment.siteType} onValueChange={(value) => setSiteAssessment({...siteAssessment, siteType: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select site type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="commercial">Commercial Building</SelectItem>
                    <SelectItem value="residential">Residential Complex</SelectItem>
                    <SelectItem value="retail">Retail/Shopping Centre</SelectItem>
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
                  onChange={(e) => setSiteAssessment({...siteAssessment, parkingSpaces: e.target.value})}
                  placeholder="e.g., 150"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="existingPowerSupply">Existing Power Supply</Label>
                <Select value={siteAssessment.existingPowerSupply} onValueChange={(value) => setSiteAssessment({...siteAssessment, existingPowerSupply: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select power supply" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single-phase">Single Phase (240V)</SelectItem>
                    <SelectItem value="three-phase-415v">Three Phase (415V)</SelectItem>
                    <SelectItem value="three-phase-480v">Three Phase (480V)</SelectItem>
                    <SelectItem value="high-voltage">High Voltage (&gt;1kV)</SelectItem>
                    <SelectItem value="unknown">Unknown - Requires Assessment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="availableAmperes">Available Amperes (Amps)</Label>
                <Input
                  id="availableAmperes"
                  type="number"
                  value={siteAssessment.availableAmperes}
                  onChange={(e) => setSiteAssessment({...siteAssessment, availableAmperes: e.target.value})}
                  placeholder="e.g., 200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimatedLoad">Estimated Daily Load</Label>
                <Input
                  id="estimatedLoad"
                  value={siteAssessment.estimatedLoad}
                  onChange={(e) => setSiteAssessment({...siteAssessment, estimatedLoad: e.target.value})}
                  placeholder="e.g., 50 kWh/day"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accessRequirements">Site Access Requirements</Label>
              <Textarea
                id="accessRequirements"
                value={siteAssessment.accessRequirements}
                onChange={(e) => setSiteAssessment({...siteAssessment, accessRequirements: e.target.value})}
                placeholder="Describe access restrictions, special requirements, security procedures..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Site Photos</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <Camera className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Upload photos of the site, electrical panels, and proposed installation areas
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
        return (
          <div className="space-y-6">
            <div className="bg-muted/30 p-4 rounded-lg">
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                Recommended Configuration
              </h3>
              <p className="text-sm text-muted-foreground">
                Based on your site assessment, we recommend DC fast charging for commercial sites with high utilization.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="chargingType">Charging Type *</Label>
                <Select value={chargerSelection.chargingType} onValueChange={(value) => setChargerSelection({...chargerSelection, chargingType: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select charging type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ac-level2">AC Level 2 (7-22kW)</SelectItem>
                    <SelectItem value="dc-fast">DC Fast Charging (50-150kW)</SelectItem>
                    <SelectItem value="dc-ultra">DC Ultra Fast (150kW+)</SelectItem>
                    <SelectItem value="mixed">Mixed AC/DC Installation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="powerRating">Power Rating per Charger</Label>
                <Select value={chargerSelection.powerRating} onValueChange={(value) => setChargerSelection({...chargerSelection, powerRating: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select power rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7kw">7kW (AC)</SelectItem>
                    <SelectItem value="11kw">11kW (AC)</SelectItem>
                    <SelectItem value="22kw">22kW (AC)</SelectItem>
                    <SelectItem value="50kw">50kW (DC)</SelectItem>
                    <SelectItem value="75kw">75kW (DC)</SelectItem>
                    <SelectItem value="150kw">150kW (DC)</SelectItem>
                    <SelectItem value="350kw">350kW (DC Ultra)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="numberOfChargers">Number of Charging Points</Label>
                <Input
                  id="numberOfChargers"
                  type="number"
                  value={chargerSelection.numberOfChargers}
                  onChange={(e) => setChargerSelection({...chargerSelection, numberOfChargers: e.target.value})}
                  placeholder="e.g., 8"
                  min="1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mountingType">Mounting Type</Label>
                <Select value={chargerSelection.mountingType} onValueChange={(value) => setChargerSelection({...chargerSelection, mountingType: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select mounting type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pedestal">Pedestal Mount</SelectItem>
                    <SelectItem value="wall">Wall Mount</SelectItem>
                    <SelectItem value="overhead">Overhead Mount</SelectItem>
                    <SelectItem value="pole">Pole Mount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Connector Types (select all that apply)</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {["Type 2 AC", "CCS2", "CHAdeMO", "Tesla"].map((connector) => (
                  <div key={connector} className="flex items-center space-x-2">
                    <Checkbox
                      id={connector}
                      checked={chargerSelection.connectorTypes.includes(connector)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setChargerSelection({
                            ...chargerSelection,
                            connectorTypes: [...chargerSelection.connectorTypes, connector]
                          });
                        } else {
                          setChargerSelection({
                            ...chargerSelection,
                            connectorTypes: chargerSelection.connectorTypes.filter(c => c !== connector)
                          });
                        }
                      }}
                    />
                    <Label htmlFor={connector} className="text-sm">{connector}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="weatherProtection"
                  checked={chargerSelection.weatherProtection}
                  onCheckedChange={(checked) => setChargerSelection({...chargerSelection, weatherProtection: checked as boolean})}
                />
                <Label htmlFor="weatherProtection">Weather Protection Required</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="networkConnectivity">Network Connectivity</Label>
                <Select value={chargerSelection.networkConnectivity} onValueChange={(value) => setChargerSelection({...chargerSelection, networkConnectivity: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select connectivity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4g">4G/LTE</SelectItem>
                    <SelectItem value="wifi">WiFi</SelectItem>
                    <SelectItem value="ethernet">Ethernet</SelectItem>
                    <SelectItem value="offline">Offline Operation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                <h3 className="font-medium text-yellow-800">Grid Capacity Assessment Required</h3>
              </div>
              <p className="text-sm text-yellow-700">
                Based on your charger selection, we need to assess if the existing electrical infrastructure can support the new load.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="currentSupply">Current Electrical Supply (kVA)</Label>
                <Input
                  id="currentSupply"
                  type="number"
                  value={gridCapacity.currentSupply}
                  onChange={(e) => setGridCapacity({...gridCapacity, currentSupply: e.target.value})}
                  placeholder="e.g., 400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="requiredCapacity">Required Additional Capacity (kVA)</Label>
                <Input
                  id="requiredCapacity"
                  type="number"
                  value={gridCapacity.requiredCapacity}
                  onChange={(e) => setGridCapacity({...gridCapacity, requiredCapacity: e.target.value})}
                  placeholder="Calculated: 600"
                  disabled
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="upgradeNeeded"
                checked={gridCapacity.upgradeNeeded}
                onCheckedChange={(checked) => setGridCapacity({...gridCapacity, upgradeNeeded: checked as boolean})}
              />
              <Label htmlFor="upgradeNeeded">Electrical Infrastructure Upgrade Required</Label>
            </div>

            {gridCapacity.upgradeNeeded && (
              <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                <div className="space-y-2">
                  <Label htmlFor="upgradeType">Type of Upgrade Required</Label>
                  <Select value={gridCapacity.upgradeType} onValueChange={(value) => setGridCapacity({...gridCapacity, upgradeType: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select upgrade type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="meter-upgrade">Meter Upgrade</SelectItem>
                      <SelectItem value="switchboard-upgrade">Switchboard Upgrade</SelectItem>
                      <SelectItem value="transformer-upgrade">Transformer Upgrade</SelectItem>
                      <SelectItem value="service-upgrade">Service Connection Upgrade</SelectItem>
                      <SelectItem value="full-infrastructure">Full Infrastructure Upgrade</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estimatedUpgradeCost">Estimated Upgrade Cost (AUD)</Label>
                  <Input
                    id="estimatedUpgradeCost"
                    value={gridCapacity.estimatedUpgradeCost}
                    onChange={(e) => setGridCapacity({...gridCapacity, estimatedUpgradeCost: e.target.value})}
                    placeholder="e.g., $25,000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="utilityContact">Utility Company Contact</Label>
                  <Input
                    id="utilityContact"
                    value={gridCapacity.utilityContact}
                    onChange={(e) => setGridCapacity({...gridCapacity, utilityContact: e.target.value})}
                    placeholder="Contact person/department for utility approval"
                  />
                </div>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">Load Management Options</h3>
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
                <h3 className="font-medium text-green-800">AS/NZS 3000 Compliance Checklist</h3>
              </div>
              <p className="text-sm text-green-700">
                Ensure your EV charging installation meets Australian electrical standards and local regulations.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">Electrical Standards Compliance</Label>
                <div className="mt-2 space-y-2">
                  {[
                    "AS/NZS 3000:2018 Wiring Rules compliance",
                    "AS/NZS 61851 Electric vehicle charging standard",
                    "Earth leakage protection (RCD) installation",
                    "Surge protection devices installed",
                    "Proper cable sizing and protection",
                    "Electrical isolation and switching"
                  ].map((item) => (
                    <div key={item} className="flex items-center space-x-2">
                      <Checkbox
                        id={item}
                        checked={compliance.electricalStandards.includes(item)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setCompliance({
                              ...compliance,
                              electricalStandards: [...compliance.electricalStandards, item]
                            });
                          } else {
                            setCompliance({
                              ...compliance,
                              electricalStandards: compliance.electricalStandards.filter(s => s !== item)
                            });
                          }
                        }}
                      />
                      <Label htmlFor={item} className="text-sm">{item}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-base font-medium">Safety Requirements</Label>
                <div className="mt-2 space-y-2">
                  {[
                    "Emergency stop functionality",
                    "Vehicle impact protection barriers",
                    "Adequate lighting for night use",
                    "Clear signage and user instructions",
                    "Fire safety compliance",
                    "Weather protection and IP ratings"
                  ].map((item) => (
                    <div key={item} className="flex items-center space-x-2">
                      <Checkbox
                        id={item}
                        checked={compliance.safetyRequirements.includes(item)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setCompliance({
                              ...compliance,
                              safetyRequirements: [...compliance.safetyRequirements, item]
                            });
                          } else {
                            setCompliance({
                              ...compliance,
                              safetyRequirements: compliance.safetyRequirements.filter(s => s !== item)
                            });
                          }
                        }}
                      />
                      <Label htmlFor={item} className="text-sm">{item}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-base font-medium">Local Permits & Approvals</Label>
                <div className="mt-2 space-y-2">
                  {[
                    "Local council development approval",
                    "Electrical license verification",
                    "Network operator connection approval",
                    "Building permit (if required)",
                    "Environmental impact assessment",
                    "Heritage considerations (if applicable)"
                  ].map((item) => (
                    <div key={item} className="flex items-center space-x-2">
                      <Checkbox
                        id={item}
                        checked={compliance.localPermits.includes(item)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setCompliance({
                              ...compliance,
                              localPermits: [...compliance.localPermits, item]
                            });
                          } else {
                            setCompliance({
                              ...compliance,
                              localPermits: compliance.localPermits.filter(s => s !== item)
                            });
                          }
                        }}
                      />
                      <Label htmlFor={item} className="text-sm">{item}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="accessibilityCompliance"
                  checked={compliance.accessibilityCompliance}
                  onCheckedChange={(checked) => setCompliance({...compliance, accessibilityCompliance: checked as boolean})}
                />
                <Label htmlFor="accessibilityCompliance" className="font-medium">
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
                  <div><strong>Project:</strong> {siteAssessment.projectName || "Not specified"}</div>
                  <div><strong>Client:</strong> {siteAssessment.clientName || "Not specified"}</div>
                  <div><strong>Site Type:</strong> {siteAssessment.siteType || "Not specified"}</div>
                  <div><strong>Address:</strong> {siteAssessment.siteAddress || "Not specified"}</div>
                  <div><strong>Parking Spaces:</strong> {siteAssessment.parkingSpaces || "Not specified"}</div>
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
                  <div><strong>Type:</strong> {chargerSelection.chargingType || "Not specified"}</div>
                  <div><strong>Power Rating:</strong> {chargerSelection.powerRating || "Not specified"}</div>
                  <div><strong>Number of Chargers:</strong> {chargerSelection.numberOfChargers || "Not specified"}</div>
                  <div><strong>Mounting:</strong> {chargerSelection.mountingType || "Not specified"}</div>
                  <div><strong>Connectors:</strong> {chargerSelection.connectorTypes.join(", ") || "None selected"}</div>
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
                  <div><strong>Current Supply:</strong> {gridCapacity.currentSupply ? `${gridCapacity.currentSupply} kVA` : "Not specified"}</div>
                  <div><strong>Required Capacity:</strong> {gridCapacity.requiredCapacity ? `${gridCapacity.requiredCapacity} kVA` : "To be calculated"}</div>
                  <div><strong>Upgrade Needed:</strong> {gridCapacity.upgradeNeeded ? "Yes" : "No"}</div>
                  {gridCapacity.upgradeNeeded && (
                    <>
                      <div><strong>Upgrade Type:</strong> {gridCapacity.upgradeType || "Not specified"}</div>
                      <div><strong>Estimated Cost:</strong> {gridCapacity.estimatedUpgradeCost || "To be quoted"}</div>
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
                  <div><strong>Electrical Standards:</strong> {compliance.electricalStandards.length}/6 items</div>
                  <div><strong>Safety Requirements:</strong> {compliance.safetyRequirements.length}/6 items</div>
                  <div><strong>Local Permits:</strong> {compliance.localPermits.length}/6 items</div>
                  <div><strong>Accessibility:</strong> {compliance.accessibilityCompliance ? "Compliant" : "Needs Review"}</div>
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Logo size="lg" />
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
              Dashboard
            </Link>
            <Link to="/projects" className="text-sm font-medium hover:text-primary transition-colors">
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
              <p className="text-muted-foreground">Step {currentStep} of {totalSteps}: {getStepTitle(currentStep)}</p>
            </div>
            <Badge variant="outline" className="px-3 py-1">
              {Math.round((currentStep / totalSteps) * 100)}% Complete
            </Badge>
          </div>
          
          <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
          
          {/* Step indicators */}
          <div className="flex justify-between mt-4">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
              <div
                key={step}
                className={`flex items-center gap-2 text-sm ${
                  step <= currentStep ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step <= currentStep
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
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

        {/* Main Content */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getStepIcon(currentStep)}
              {getStepTitle(currentStep)}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && "Understand client needs, project objectives, and specific requirements before technical assessment."}
              {currentStep === 2 && "Gather essential information about the installation site and project requirements."}
              {currentStep === 3 && "Select the appropriate charging equipment based on site requirements and usage patterns."}
              {currentStep === 4 && "Analyze electrical infrastructure capacity and determine upgrade requirements."}
              {currentStep === 5 && "Ensure compliance with Australian electrical standards and local regulations."}
              {currentStep === 6 && "Review all project details and create your project plan."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderStepContent()}
          </CardContent>
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
            <Button variant="ghost" asChild>
              <Link to="/dashboard">Save Draft</Link>
            </Button>
            
            {currentStep < totalSteps ? (
              <Button onClick={nextStep} className="flex items-center gap-2">
                Next
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Create Project
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
