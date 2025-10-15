import React, { useState, useEffect } from "react";
import {
  Save,
  Building,
  DollarSign,
  FileText,
  Users,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Truck,
  Shield,
  CreditCard,
  Mail,
  Phone,
  MapPin,
  Star,
  TrendingUp,
  Package,
} from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/lib/rbac";

interface PartnerConfig {
  companyInfo: {
    companyName: string;
    tradingName: string;
    abn: string;
    acn: string;
    registeredAddress: string;
    businessAddress: string;
    phone: string;
    email: string;
    website: string;
    industry: string;
    yearsInBusiness: number;
  };
  licensing: {
    electricalLicense: string;
    licenseExpiry: string;
    certifications: string[];
    insurancePolicy: string;
    insuranceAmount: number;
    insuranceExpiry: string;
    workCover: string;
  };
  contract: {
    contractType: string;
    startDate: string;
    endDate: string;
    renewalDate: string;
    status: string;
    territory: string[];
    exclusiveRights: boolean;
    minimumOrders: number;
    performanceTargets: number;
  };
  pricing: {
    discountTier: string;
    volumeDiscounts: boolean;
    earlyPaymentDiscount: number;
    standardPaymentTerms: number;
    creditLimit: number;
    marginSettings: {
      chargers: number;
      accessories: number;
      installation: number;
      service: number;
    };
  };
  services: {
    installationServices: boolean;
    maintenanceServices: boolean;
    supportServices: boolean;
    trainingServices: boolean;
    warrantySupport: boolean;
    emergencyCallout: boolean;
    serviceAreas: string[];
    certifiedTechnicians: number;
  };
  performance: {
    completedProjects: number;
    averageRating: number;
    onTimeDelivery: number;
    customerSatisfaction: number;
    qualityScore: number;
    responseTime: number;
  };
  preferences: {
    communicationMethod: string;
    reportingFrequency: string;
    invoiceFormat: string;
    paymentMethod: string;
    autoApproveQuotes: boolean;
    sendPerformanceReports: boolean;
    marketingOptIn: boolean;
  };
}

const defaultPartnerConfig: PartnerConfig = {
  companyInfo: {
    companyName: "",
    tradingName: "",
    abn: "",
    acn: "",
    registeredAddress: "",
    businessAddress: "",
    phone: "",
    email: "",
    website: "",
    industry: "electrical",
    yearsInBusiness: 0,
  },
  licensing: {
    electricalLicense: "",
    licenseExpiry: "",
    certifications: [],
    insurancePolicy: "",
    insuranceAmount: 10000000,
    insuranceExpiry: "",
    workCover: "",
  },
  contract: {
    contractType: "standard",
    startDate: "",
    endDate: "",
    renewalDate: "",
    status: "active",
    territory: [],
    exclusiveRights: false,
    minimumOrders: 12,
    performanceTargets: 85,
  },
  pricing: {
    discountTier: "standard",
    volumeDiscounts: true,
    earlyPaymentDiscount: 2,
    standardPaymentTerms: 30,
    creditLimit: 50000,
    marginSettings: {
      chargers: 25,
      accessories: 35,
      installation: 45,
      service: 55,
    },
  },
  services: {
    installationServices: true,
    maintenanceServices: false,
    supportServices: true,
    trainingServices: false,
    warrantySupport: true,
    emergencyCallout: false,
    serviceAreas: [],
    certifiedTechnicians: 0,
  },
  performance: {
    completedProjects: 0,
    averageRating: 0,
    onTimeDelivery: 0,
    customerSatisfaction: 0,
    qualityScore: 0,
    responseTime: 0,
  },
  preferences: {
    communicationMethod: "email",
    reportingFrequency: "monthly",
    invoiceFormat: "pdf",
    paymentMethod: "bank_transfer",
    autoApproveQuotes: false,
    sendPerformanceReports: true,
    marketingOptIn: false,
  },
};

export default function PartnerSettings() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [config, setConfig] = useState<PartnerConfig>(defaultPartnerConfig);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  // Determine if user can edit all settings or just view/edit their own
  const canEditAll =
    user?.role === UserRole.ADMIN || user?.role === UserRole.GLOBAL_ADMIN;

  // Load configuration from localStorage
  useEffect(() => {
    try {
      const storageKey = canEditAll
        ? "chargeSourcePartnerConfig"
        : `chargeSourcePartnerConfig_${user?.id}`;
      const savedConfig = safeGetLocal(storageKey, {});
      if (savedConfig && Object.keys(savedConfig).length > 0) {
        setConfig({ ...defaultPartnerConfig, ...savedConfig });
      } else if (user?.company) {
        // Pre-populate with user data
        setConfig((prev) => ({
          ...prev,
          companyInfo: {
            ...prev.companyInfo,
            companyName: user.company,
            email: user.email,
            phone: user.phone || "",
          },
        }));
      }
    } catch (error) {
      console.error("Error loading partner config:", error);
    }
  }, [user, canEditAll]);

  const updateConfig = (
    section: keyof PartnerConfig,
    field: string,
    value: any,
  ) => {
    setConfig((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
    setHasChanges(true);
  };

  const saveConfiguration = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const storageKey = canEditAll
        ? "chargeSourcePartnerConfig"
        : `chargeSourcePartnerConfig_${user?.id}`;
      localStorage.setItem(storageKey, JSON.stringify(config));
      setHasChanges(false);

      toast({
        title: "Configuration Saved",
        description: "Partner settings have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save configuration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Partner Settings
              </CardTitle>
              <CardDescription>
                {canEditAll
                  ? "Manage partner contracts, pricing, and business relationships"
                  : "Manage your partner profile and business settings"}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {hasChanges && (
                <Badge
                  variant="outline"
                  className="text-orange-600 border-orange-200"
                >
                  Unsaved Changes
                </Badge>
              )}
              <Button
                onClick={saveConfiguration}
                disabled={!hasChanges || saving}
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="company" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="licensing">Licensing</TabsTrigger>
          <TabsTrigger value="contract">Contract</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        {/* Company Information */}
        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Company Information
              </CardTitle>
              <CardDescription>
                Business details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Legal Company Name</Label>
                  <Input
                    id="companyName"
                    value={config.companyInfo.companyName}
                    onChange={(e) =>
                      updateConfig("companyInfo", "companyName", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tradingName">Trading Name</Label>
                  <Input
                    id="tradingName"
                    value={config.companyInfo.tradingName}
                    onChange={(e) =>
                      updateConfig("companyInfo", "tradingName", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="abn">ABN</Label>
                  <Input
                    id="abn"
                    value={config.companyInfo.abn}
                    onChange={(e) =>
                      updateConfig("companyInfo", "abn", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="acn">ACN</Label>
                  <Input
                    id="acn"
                    value={config.companyInfo.acn}
                    onChange={(e) =>
                      updateConfig("companyInfo", "acn", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={config.companyInfo.phone}
                    onChange={(e) =>
                      updateConfig("companyInfo", "phone", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Business Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={config.companyInfo.email}
                    onChange={(e) =>
                      updateConfig("companyInfo", "email", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={config.companyInfo.website}
                    onChange={(e) =>
                      updateConfig("companyInfo", "website", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="yearsInBusiness">Years in Business</Label>
                  <Input
                    id="yearsInBusiness"
                    type="number"
                    value={config.companyInfo.yearsInBusiness}
                    onChange={(e) =>
                      updateConfig(
                        "companyInfo",
                        "yearsInBusiness",
                        parseInt(e.target.value) || 0,
                      )
                    }
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="registeredAddress">Registered Address</Label>
                  <Textarea
                    id="registeredAddress"
                    value={config.companyInfo.registeredAddress}
                    onChange={(e) =>
                      updateConfig(
                        "companyInfo",
                        "registeredAddress",
                        e.target.value,
                      )
                    }
                    rows={3}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="businessAddress">Business Address</Label>
                  <Textarea
                    id="businessAddress"
                    value={config.companyInfo.businessAddress}
                    onChange={(e) =>
                      updateConfig(
                        "companyInfo",
                        "businessAddress",
                        e.target.value,
                      )
                    }
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry Sector</Label>
                  <Select
                    value={config.companyInfo.industry}
                    onValueChange={(value) =>
                      updateConfig("companyInfo", "industry", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="electrical">
                        Electrical Contracting
                      </SelectItem>
                      <SelectItem value="solar">Solar Installation</SelectItem>
                      <SelectItem value="automotive">Automotive</SelectItem>
                      <SelectItem value="construction">Construction</SelectItem>
                      <SelectItem value="facilities">
                        Facilities Management
                      </SelectItem>
                      <SelectItem value="retail">Retail/Commercial</SelectItem>
                      <SelectItem value="government">
                        Government/Council
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Licensing & Compliance */}
        <TabsContent value="licensing">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Licensing & Compliance
              </CardTitle>
              <CardDescription>
                Professional licenses, certifications, and insurance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="electricalLicense">
                    Electrical License Number
                  </Label>
                  <Input
                    id="electricalLicense"
                    value={config.licensing.electricalLicense}
                    onChange={(e) =>
                      updateConfig(
                        "licensing",
                        "electricalLicense",
                        e.target.value,
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="licenseExpiry">License Expiry Date</Label>
                  <Input
                    id="licenseExpiry"
                    type="date"
                    value={config.licensing.licenseExpiry}
                    onChange={(e) =>
                      updateConfig("licensing", "licenseExpiry", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="insurancePolicy">
                    Insurance Policy Number
                  </Label>
                  <Input
                    id="insurancePolicy"
                    value={config.licensing.insurancePolicy}
                    onChange={(e) =>
                      updateConfig(
                        "licensing",
                        "insurancePolicy",
                        e.target.value,
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="insuranceAmount">
                    Insurance Coverage Amount
                  </Label>
                  <Input
                    id="insuranceAmount"
                    type="number"
                    value={config.licensing.insuranceAmount}
                    onChange={(e) =>
                      updateConfig(
                        "licensing",
                        "insuranceAmount",
                        parseInt(e.target.value) || 0,
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="insuranceExpiry">Insurance Expiry Date</Label>
                  <Input
                    id="insuranceExpiry"
                    type="date"
                    value={config.licensing.insuranceExpiry}
                    onChange={(e) =>
                      updateConfig(
                        "licensing",
                        "insuranceExpiry",
                        e.target.value,
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="workCover">WorkCover/Workers Comp</Label>
                  <Input
                    id="workCover"
                    value={config.licensing.workCover}
                    onChange={(e) =>
                      updateConfig("licensing", "workCover", e.target.value)
                    }
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Certifications & Qualifications</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    "AS/NZS 3000 Wiring Rules",
                    "EV Charging Standards",
                    "Solar Installation",
                    "High Voltage Work",
                    "Work Health & Safety",
                    "Quality Management",
                  ].map((cert) => (
                    <div key={cert} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={cert}
                        checked={config.licensing.certifications.includes(cert)}
                        onChange={(e) => {
                          const certifications = e.target.checked
                            ? [...config.licensing.certifications, cert]
                            : config.licensing.certifications.filter(
                                (c) => c !== cert,
                              );
                          updateConfig(
                            "licensing",
                            "certifications",
                            certifications,
                          );
                        }}
                        className="rounded"
                      />
                      <label htmlFor={cert} className="text-sm">
                        {cert}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contract Terms */}
        <TabsContent value="contract">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Contract Terms
              </CardTitle>
              <CardDescription>
                Partnership agreement details and territory rights
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="contractType">Contract Type</Label>
                  <Select
                    value={config.contract.contractType}
                    onValueChange={(value) =>
                      updateConfig("contract", "contractType", value)
                    }
                    disabled={!canEditAll}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard Partner</SelectItem>
                      <SelectItem value="preferred">
                        Preferred Partner
                      </SelectItem>
                      <SelectItem value="exclusive">
                        Exclusive Partner
                      </SelectItem>
                      <SelectItem value="premium">Premium Partner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Contract Status</Label>
                  <Select
                    value={config.contract.status}
                    onValueChange={(value) =>
                      updateConfig("contract", "status", value)
                    }
                    disabled={!canEditAll}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                      <SelectItem value="terminated">Terminated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startDate">Contract Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={config.contract.startDate}
                    onChange={(e) =>
                      updateConfig("contract", "startDate", e.target.value)
                    }
                    disabled={!canEditAll}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">Contract End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={config.contract.endDate}
                    onChange={(e) =>
                      updateConfig("contract", "endDate", e.target.value)
                    }
                    disabled={!canEditAll}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="renewalDate">Next Renewal Date</Label>
                  <Input
                    id="renewalDate"
                    type="date"
                    value={config.contract.renewalDate}
                    onChange={(e) =>
                      updateConfig("contract", "renewalDate", e.target.value)
                    }
                    disabled={!canEditAll}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minimumOrders">
                    Minimum Orders (per year)
                  </Label>
                  <Input
                    id="minimumOrders"
                    type="number"
                    value={config.contract.minimumOrders}
                    onChange={(e) =>
                      updateConfig(
                        "contract",
                        "minimumOrders",
                        parseInt(e.target.value) || 0,
                      )
                    }
                    disabled={!canEditAll}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="performanceTargets">
                    Performance Target (%)
                  </Label>
                  <Input
                    id="performanceTargets"
                    type="number"
                    value={config.contract.performanceTargets}
                    onChange={(e) =>
                      updateConfig(
                        "contract",
                        "performanceTargets",
                        parseInt(e.target.value) || 0,
                      )
                    }
                    disabled={!canEditAll}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Exclusive Territory Rights</Label>
                  <p className="text-sm text-muted-foreground">
                    Grant exclusive sales rights in specified territories
                  </p>
                </div>
                <Switch
                  checked={config.contract.exclusiveRights}
                  onCheckedChange={(checked) =>
                    updateConfig("contract", "exclusiveRights", checked)
                  }
                  disabled={!canEditAll}
                />
              </div>

              <div className="space-y-2">
                <Label>Service Territory</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    "Sydney Metropolitan",
                    "Melbourne Metropolitan",
                    "Brisbane Metropolitan",
                    "Perth Metropolitan",
                    "Adelaide Metropolitan",
                    "Regional NSW",
                    "Regional VIC",
                    "Regional QLD",
                  ].map((territory) => (
                    <div
                      key={territory}
                      className="flex items-center space-x-2"
                    >
                      <input
                        type="checkbox"
                        id={territory}
                        checked={config.contract.territory.includes(territory)}
                        onChange={(e) => {
                          const territories = e.target.checked
                            ? [...config.contract.territory, territory]
                            : config.contract.territory.filter(
                                (t) => t !== territory,
                              );
                          updateConfig("contract", "territory", territories);
                        }}
                        className="rounded"
                        disabled={!canEditAll}
                      />
                      <label htmlFor={territory} className="text-sm">
                        {territory}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pricing & Margins */}
        <TabsContent value="pricing">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Pricing & Margins
              </CardTitle>
              <CardDescription>
                Discount tiers, payment terms, and margin settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="discountTier">Discount Tier</Label>
                  <Select
                    value={config.pricing.discountTier}
                    onValueChange={(value) =>
                      updateConfig("pricing", "discountTier", value)
                    }
                    disabled={!canEditAll}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard (0%)</SelectItem>
                      <SelectItem value="bronze">Bronze (5%)</SelectItem>
                      <SelectItem value="silver">Silver (10%)</SelectItem>
                      <SelectItem value="gold">Gold (15%)</SelectItem>
                      <SelectItem value="platinum">Platinum (20%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="earlyPaymentDiscount">
                    Early Payment Discount (%)
                  </Label>
                  <Input
                    id="earlyPaymentDiscount"
                    type="number"
                    step="0.1"
                    value={config.pricing.earlyPaymentDiscount}
                    onChange={(e) =>
                      updateConfig(
                        "pricing",
                        "earlyPaymentDiscount",
                        parseFloat(e.target.value) || 0,
                      )
                    }
                    disabled={!canEditAll}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="standardPaymentTerms">
                    Payment Terms (days)
                  </Label>
                  <Input
                    id="standardPaymentTerms"
                    type="number"
                    value={config.pricing.standardPaymentTerms}
                    onChange={(e) =>
                      updateConfig(
                        "pricing",
                        "standardPaymentTerms",
                        parseInt(e.target.value) || 0,
                      )
                    }
                    disabled={!canEditAll}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="creditLimit">Credit Limit ($)</Label>
                  <Input
                    id="creditLimit"
                    type="number"
                    value={config.pricing.creditLimit}
                    onChange={(e) =>
                      updateConfig(
                        "pricing",
                        "creditLimit",
                        parseInt(e.target.value) || 0,
                      )
                    }
                    disabled={!canEditAll}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Volume Discounts</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable automatic volume-based discounts
                  </p>
                </div>
                <Switch
                  checked={config.pricing.volumeDiscounts}
                  onCheckedChange={(checked) =>
                    updateConfig("pricing", "volumeDiscounts", checked)
                  }
                  disabled={!canEditAll}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Category Margins (%)</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="chargersMargin">EV Chargers</Label>
                    <Input
                      id="chargersMargin"
                      type="number"
                      value={config.pricing.marginSettings.chargers}
                      onChange={(e) =>
                        updateConfig("pricing", "marginSettings", {
                          ...config.pricing.marginSettings,
                          chargers: parseInt(e.target.value) || 0,
                        })
                      }
                      disabled={!canEditAll}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accessoriesMargin">Accessories</Label>
                    <Input
                      id="accessoriesMargin"
                      type="number"
                      value={config.pricing.marginSettings.accessories}
                      onChange={(e) =>
                        updateConfig("pricing", "marginSettings", {
                          ...config.pricing.marginSettings,
                          accessories: parseInt(e.target.value) || 0,
                        })
                      }
                      disabled={!canEditAll}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="installationMargin">Installation</Label>
                    <Input
                      id="installationMargin"
                      type="number"
                      value={config.pricing.marginSettings.installation}
                      onChange={(e) =>
                        updateConfig("pricing", "marginSettings", {
                          ...config.pricing.marginSettings,
                          installation: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="serviceMargin">Service & Support</Label>
                    <Input
                      id="serviceMargin"
                      type="number"
                      value={config.pricing.marginSettings.service}
                      onChange={(e) =>
                        updateConfig("pricing", "marginSettings", {
                          ...config.pricing.marginSettings,
                          service: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Services Offered */}
        <TabsContent value="services">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Services Offered
              </CardTitle>
              <CardDescription>
                Service capabilities and team information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Installation Services</Label>
                    <p className="text-sm text-muted-foreground">
                      EV charger installation and commissioning
                    </p>
                  </div>
                  <Switch
                    checked={config.services.installationServices}
                    onCheckedChange={(checked) =>
                      updateConfig("services", "installationServices", checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Maintenance Services</Label>
                    <p className="text-sm text-muted-foreground">
                      Ongoing maintenance and servicing
                    </p>
                  </div>
                  <Switch
                    checked={config.services.maintenanceServices}
                    onCheckedChange={(checked) =>
                      updateConfig("services", "maintenanceServices", checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Support Services</Label>
                    <p className="text-sm text-muted-foreground">
                      Customer support and troubleshooting
                    </p>
                  </div>
                  <Switch
                    checked={config.services.supportServices}
                    onCheckedChange={(checked) =>
                      updateConfig("services", "supportServices", checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Training Services</Label>
                    <p className="text-sm text-muted-foreground">
                      Customer training and education
                    </p>
                  </div>
                  <Switch
                    checked={config.services.trainingServices}
                    onCheckedChange={(checked) =>
                      updateConfig("services", "trainingServices", checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Warranty Support</Label>
                    <p className="text-sm text-muted-foreground">
                      Warranty claims and repairs
                    </p>
                  </div>
                  <Switch
                    checked={config.services.warrantySupport}
                    onCheckedChange={(checked) =>
                      updateConfig("services", "warrantySupport", checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Emergency Callout</Label>
                    <p className="text-sm text-muted-foreground">
                      24/7 emergency support services
                    </p>
                  </div>
                  <Switch
                    checked={config.services.emergencyCallout}
                    onCheckedChange={(checked) =>
                      updateConfig("services", "emergencyCallout", checked)
                    }
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="certifiedTechnicians">
                  Certified Technicians
                </Label>
                <Input
                  id="certifiedTechnicians"
                  type="number"
                  value={config.services.certifiedTechnicians}
                  onChange={(e) =>
                    updateConfig(
                      "services",
                      "certifiedTechnicians",
                      parseInt(e.target.value) || 0,
                    )
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Service Areas</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    "Residential",
                    "Commercial",
                    "Industrial",
                    "Public Infrastructure",
                    "Fleet Management",
                    "Retail/Shopping Centres",
                  ].map((area) => (
                    <div key={area} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={area}
                        checked={config.services.serviceAreas.includes(area)}
                        onChange={(e) => {
                          const areas = e.target.checked
                            ? [...config.services.serviceAreas, area]
                            : config.services.serviceAreas.filter(
                                (a) => a !== area,
                              );
                          updateConfig("services", "serviceAreas", areas);
                        }}
                        className="rounded"
                      />
                      <label htmlFor={area} className="text-sm">
                        {area}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Metrics */}
        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Performance Metrics
              </CardTitle>
              <CardDescription>
                Key performance indicators and service quality metrics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        Completed Projects
                      </span>
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="text-2xl font-bold">
                      {config.performance.completedProjects}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Total installations
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        Average Rating
                      </span>
                      <Star className="w-4 h-4 text-yellow-600" />
                    </div>
                    <div className="text-2xl font-bold">
                      {config.performance.averageRating}/5
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Customer feedback
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        On-Time Delivery
                      </span>
                      <Clock className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold">
                      {config.performance.onTimeDelivery}%
                    </div>
                    <Progress
                      value={config.performance.onTimeDelivery}
                      className="mt-2"
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        Customer Satisfaction
                      </span>
                      <Users className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="text-2xl font-bold">
                      {config.performance.customerSatisfaction}%
                    </div>
                    <Progress
                      value={config.performance.customerSatisfaction}
                      className="mt-2"
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Quality Score</span>
                      <Shield className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="text-2xl font-bold">
                      {config.performance.qualityScore}%
                    </div>
                    <Progress
                      value={config.performance.qualityScore}
                      className="mt-2"
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Response Time</span>
                      <Clock className="w-4 h-4 text-orange-600" />
                    </div>
                    <div className="text-2xl font-bold">
                      {config.performance.responseTime}h
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Average response
                    </p>
                  </CardContent>
                </Card>
              </div>

              {canEditAll && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">
                      Update Performance Data
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="completedProjects">
                          Completed Projects
                        </Label>
                        <Input
                          id="completedProjects"
                          type="number"
                          value={config.performance.completedProjects}
                          onChange={(e) =>
                            updateConfig(
                              "performance",
                              "completedProjects",
                              parseInt(e.target.value) || 0,
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="averageRating">
                          Average Rating (1-5)
                        </Label>
                        <Input
                          id="averageRating"
                          type="number"
                          step="0.1"
                          min="1"
                          max="5"
                          value={config.performance.averageRating}
                          onChange={(e) =>
                            updateConfig(
                              "performance",
                              "averageRating",
                              parseFloat(e.target.value) || 0,
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="onTimeDelivery">
                          On-Time Delivery (%)
                        </Label>
                        <Input
                          id="onTimeDelivery"
                          type="number"
                          min="0"
                          max="100"
                          value={config.performance.onTimeDelivery}
                          onChange={(e) =>
                            updateConfig(
                              "performance",
                              "onTimeDelivery",
                              parseInt(e.target.value) || 0,
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="customerSatisfaction">
                          Customer Satisfaction (%)
                        </Label>
                        <Input
                          id="customerSatisfaction"
                          type="number"
                          min="0"
                          max="100"
                          value={config.performance.customerSatisfaction}
                          onChange={(e) =>
                            updateConfig(
                              "performance",
                              "customerSatisfaction",
                              parseInt(e.target.value) || 0,
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="qualityScore">Quality Score (%)</Label>
                        <Input
                          id="qualityScore"
                          type="number"
                          min="0"
                          max="100"
                          value={config.performance.qualityScore}
                          onChange={(e) =>
                            updateConfig(
                              "performance",
                              "qualityScore",
                              parseInt(e.target.value) || 0,
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="responseTime">
                          Response Time (hours)
                        </Label>
                        <Input
                          id="responseTime"
                          type="number"
                          value={config.performance.responseTime}
                          onChange={(e) =>
                            updateConfig(
                              "performance",
                              "responseTime",
                              parseInt(e.target.value) || 0,
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Communication Preferences */}
        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Communication Preferences
              </CardTitle>
              <CardDescription>
                How you prefer to communicate and receive updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="communicationMethod">
                    Preferred Communication Method
                  </Label>
                  <Select
                    value={config.preferences.communicationMethod}
                    onValueChange={(value) =>
                      updateConfig("preferences", "communicationMethod", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="portal">Portal Messages</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reportingFrequency">
                    Reporting Frequency
                  </Label>
                  <Select
                    value={config.preferences.reportingFrequency}
                    onValueChange={(value) =>
                      updateConfig("preferences", "reportingFrequency", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="on-demand">On Demand</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invoiceFormat">Invoice Format</Label>
                  <Select
                    value={config.preferences.invoiceFormat}
                    onValueChange={(value) =>
                      updateConfig("preferences", "invoiceFormat", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="portal">Portal Download</SelectItem>
                      <SelectItem value="xml">XML/Electronic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">
                    Preferred Payment Method
                  </Label>
                  <Select
                    value={config.preferences.paymentMethod}
                    onValueChange={(value) =>
                      updateConfig("preferences", "paymentMethod", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank_transfer">
                        Bank Transfer
                      </SelectItem>
                      <SelectItem value="credit_card">Credit Card</SelectItem>
                      <SelectItem value="direct_debit">Direct Debit</SelectItem>
                      <SelectItem value="cheque">Cheque</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">
                  Notification Preferences
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto-approve Small Quotes</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically approve quotes under credit limit
                      </p>
                    </div>
                    <Switch
                      checked={config.preferences.autoApproveQuotes}
                      onCheckedChange={(checked) =>
                        updateConfig(
                          "preferences",
                          "autoApproveQuotes",
                          checked,
                        )
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Performance Reports</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive regular performance reports
                      </p>
                    </div>
                    <Switch
                      checked={config.preferences.sendPerformanceReports}
                      onCheckedChange={(checked) =>
                        updateConfig(
                          "preferences",
                          "sendPerformanceReports",
                          checked,
                        )
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Marketing Communications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive product updates and promotions
                      </p>
                    </div>
                    <Switch
                      checked={config.preferences.marketingOptIn}
                      onCheckedChange={(checked) =>
                        updateConfig("preferences", "marketingOptIn", checked)
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
