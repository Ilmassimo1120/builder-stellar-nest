import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Link } from "react-router-dom";
import {
  Shield,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Download,
  ExternalLink,
  Calendar,
  Users,
  Book,
  Gavel,
  Search,
  Clock,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
  Info,
  Zap,
  Building2,
  Car,
  Settings,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";

export default function Compliance() {
  const [selectedState, setSelectedState] = useState("all");

  const standards = [
    {
      id: "as-nzs-3000",
      title: "AS/NZS 3000:2018",
      subtitle: "Australian/New Zealand Wiring Rules",
      category: "Electrical Standards",
      lastUpdated: "2023-12-15",
      description:
        "The fundamental electrical installation standard for Australia and New Zealand, covering all aspects of electrical wiring and safety.",
      keyRequirements: [
        "Installation and testing of electrical equipment",
        "Safety requirements for electrical installations",
        "Wiring methods and cable selection",
        "Earthing and protection systems",
        "Special installations including EV charging",
      ],
      applicableTo: [
        "Residential installations",
        "Commercial installations",
        "Industrial installations",
        "EV charging infrastructure",
      ],
      downloadUrl: "#as-nzs-3000",
      color: "primary",
    },
    {
      id: "as-nzs-61851",
      title: "AS/NZS 61851",
      subtitle: "Electric Vehicle Conductive Charging System",
      category: "EV Specific Standards",
      lastUpdated: "2023-10-20",
      description:
        "Specific requirements for electric vehicle supply equipment (EVSE) and charging infrastructure.",
      keyRequirements: [
        "EVSE safety and performance requirements",
        "Charging connector standards",
        "Communication protocols",
        "Installation and testing procedures",
        "Compatibility requirements",
      ],
      applicableTo: [
        "EV charging stations",
        "Home charging units",
        "Public charging infrastructure",
        "Fleet charging systems",
      ],
      downloadUrl: "#as-nzs-61851",
      color: "secondary",
    },
    {
      id: "as-nzs-3008",
      title: "AS/NZS 3008",
      subtitle: "Electrical Installations - Selection of Cables",
      category: "Installation Standards",
      lastUpdated: "2023-08-12",
      description:
        "Guidelines for selecting appropriate cables for electrical installations, including high-power EV charging applications.",
      keyRequirements: [
        "Cable current carrying capacity",
        "Voltage drop calculations",
        "Installation methods and derating",
        "Environmental considerations",
        "Special applications including EV charging",
      ],
      applicableTo: [
        "Cable installations",
        "High-power applications",
        "EV charging circuits",
        "Industrial installations",
      ],
      downloadUrl: "#as-nzs-3008",
      color: "accent",
    },
    {
      id: "as-4755",
      title: "AS 4755",
      subtitle: "Demand Response Capabilities",
      category: "Smart Grid Standards",
      lastUpdated: "2023-06-30",
      description:
        "Requirements for demand response capabilities in electrical equipment, including smart EV charging systems.",
      keyRequirements: [
        "Demand response interfaces",
        "Communication requirements",
        "Testing and verification",
        "Integration with smart grids",
        "Load management capabilities",
      ],
      applicableTo: [
        "Smart EV chargers",
        "Load management systems",
        "Grid-connected equipment",
        "Commercial installations",
      ],
      downloadUrl: "#as-4755",
      color: "primary",
    },
  ];

  const stateRegulations = [
    {
      state: "NSW",
      name: "New South Wales",
      authority: "Electrical Safety Office",
      website: "https://www.safework.nsw.gov.au",
      keyRequirements: [
        "Electrical work license required",
        "Compliance certificate mandatory",
        "Regular safety inspections",
        "Notification requirements for EV installations",
      ],
      evSpecific: [
        "EV charging installations must be notified",
        "Specific safety switch requirements",
        "Load management considerations",
      ],
      contacts: {
        phone: "13 10 50",
        email: "electrical.safety@safework.nsw.gov.au",
      },
    },
    {
      state: "VIC",
      name: "Victoria",
      authority: "Energy Safe Victoria",
      website: "https://www.esv.vic.gov.au",
      keyRequirements: [
        "Electrical installation work license",
        "Certificate of Electrical Safety",
        "Prescribed electrical work notifications",
        "EV charging compliance requirements",
      ],
      evSpecific: [
        "Prescribed electrical work notification for EV charging",
        "Specific earthing requirements",
        "Safety switch mandatory",
      ],
      contacts: {
        phone: "03 9203 9700",
        email: "info@esv.vic.gov.au",
      },
    },
    {
      state: "QLD",
      name: "Queensland",
      authority: "Electrical Safety Office",
      website: "https://www.worksafe.qld.gov.au",
      keyRequirements: [
        "Electrical work license",
        "Electrical work inspection",
        "Safety switch requirements",
        "EV charging installation compliance",
      ],
      evSpecific: [
        "Type A RCD protection required",
        "Specific installation requirements",
        "Load assessment requirements",
      ],
      contacts: {
        phone: "1300 369 915",
        email: "electricalsafety@worksafe.qld.gov.au",
      },
    },
    {
      state: "WA",
      name: "Western Australia",
      authority: "Building and Energy",
      website: "https://www.dmirs.wa.gov.au",
      keyRequirements: [
        "Electrical work license",
        "Notice of completion",
        "Safety switch compliance",
        "EV installation requirements",
      ],
      evSpecific: [
        "Installation compliance requirements",
        "Safety switch mandatory",
        "Specific earthing requirements",
      ],
      contacts: {
        phone: "1300 489 099",
        email: "electrical@dmirs.wa.gov.au",
      },
    },
  ];

  const complianceChecklist = [
    {
      category: "Pre-Installation",
      items: [
        "Site assessment completed",
        "Load calculations verified",
        "Grid capacity confirmed",
        "Permits and approvals obtained",
        "Customer requirements documented",
        "Safety planning completed",
      ],
    },
    {
      category: "Installation",
      items: [
        "AS/NZS 3000 compliance verified",
        "Cable selection per AS/NZS 3008",
        "Earthing system installed correctly",
        "Safety switches installed (Type A RCD)",
        "Isolation switches accessible",
        "Labeling and identification complete",
      ],
    },
    {
      category: "Testing & Commissioning",
      items: [
        "Insulation resistance testing",
        "Earth fault loop impedance testing",
        "RCD testing completed",
        "Polarity verification",
        "Functional testing of EV charger",
        "Load management testing (if applicable)",
      ],
    },
    {
      category: "Documentation",
      items: [
        "Compliance certificate issued",
        "Test results documented",
        "Installation manual provided",
        "Warranty documentation",
        "Maintenance schedule provided",
        "User training completed",
      ],
    },
  ];

  const tools = [
    {
      title: "Compliance Checklist Generator",
      description:
        "Generate customized compliance checklists for your EV installation projects",
      icon: <CheckCircle2 className="w-8 h-8 text-primary" />,
      features: [
        "State-specific requirements",
        "Project type customization",
        "PDF export",
        "Progress tracking",
      ],
      action: "Generate Checklist",
    },
    {
      title: "Standards Library",
      description:
        "Access to complete Australian electrical standards and regulations",
      icon: <Book className="w-8 h-8 text-secondary" />,
      features: [
        "Latest standards",
        "Search functionality",
        "Bookmark favorites",
        "Update notifications",
      ],
      action: "Browse Standards",
    },
    {
      title: "Inspection Forms",
      description: "Pre-built inspection forms for EV charging installations",
      icon: <FileText className="w-8 h-8 text-accent" />,
      features: [
        "Digital forms",
        "Photo attachments",
        "Signature capture",
        "Cloud sync",
      ],
      action: "Download Forms",
    },
    {
      title: "Compliance Calendar",
      description:
        "Track compliance deadlines, renewals, and training requirements",
      icon: <Calendar className="w-8 h-8 text-primary" />,
      features: [
        "Deadline tracking",
        "Renewal reminders",
        "Training schedules",
        "Team coordination",
      ],
      action: "View Calendar",
    },
  ];

  const updates = [
    {
      date: "2024-01-15",
      title: "AS/NZS 3000:2018 Amendment 3 Released",
      type: "Standard Update",
      description:
        "New requirements for EV charging installations and updated testing procedures.",
      impact: "High",
      action: "Review changes and update procedures",
    },
    {
      date: "2024-01-10",
      title: "Victorian EV Charging Regulations Update",
      type: "State Regulation",
      description:
        "Energy Safe Victoria updates prescribed electrical work requirements for EV charging.",
      impact: "Medium",
      action: "Update Victorian installation procedures",
    },
    {
      date: "2023-12-20",
      title: "Type A RCD Requirements Clarification",
      type: "Technical Guidance",
      description:
        "Industry guidance on Type A RCD requirements for EV charging installations.",
      impact: "Medium",
      action: "Review RCD selection criteria",
    },
  ];

  const filteredRegulations =
    selectedState === "all"
      ? stateRegulations
      : stateRegulations.filter((reg) => reg.state === selectedState);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="flex items-center space-x-2">
              <Logo />
            </Link>
            <nav className="hidden md:flex space-x-8">
              <Link
                to="/features"
                className="text-muted-foreground hover:text-foreground"
              >
                Features
              </Link>
              <Link
                to="/pricing"
                className="text-muted-foreground hover:text-foreground"
              >
                Pricing
              </Link>
              <Link
                to="/training"
                className="text-muted-foreground hover:text-foreground"
              >
                Training
              </Link>
              <Link to="/compliance" className="text-foreground font-medium">
                Compliance
              </Link>
            </nav>
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link to="/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/10 to-secondary/10">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              EV Infrastructure Compliance
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Stay compliant with Australian electrical standards and
              regulations for EV charging infrastructure. Access the latest
              requirements, guidelines, and tools to ensure safe and compliant
              installations.
            </p>

            <Alert className="max-w-2xl mx-auto mb-8">
              <Info className="w-4 h-4" />
              <AlertTitle>Always Current</AlertTitle>
              <AlertDescription>
                Our compliance information is updated regularly to reflect the
                latest standards and regulations. Last updated: January 2024
              </AlertDescription>
            </Alert>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="#standards">
                  Browse Standards
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="#tools">
                  Compliance Tools
                  <Shield className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Recent Updates */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-muted/50">
          <div className="container mx-auto">
            <h2 className="text-2xl font-bold mb-6">
              Recent Compliance Updates
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {updates.map((update, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge
                        variant={
                          update.impact === "High" ? "destructive" : "secondary"
                        }
                      >
                        {update.impact} Impact
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {update.date}
                      </span>
                    </div>
                    <CardTitle className="text-lg">{update.title}</CardTitle>
                    <Badge variant="outline">{update.type}</Badge>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {update.description}
                    </p>
                    <p className="text-sm font-medium mb-3">Action Required:</p>
                    <p className="text-sm">{update.action}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Standards Section */}
        <section id="standards" className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                Australian Electrical Standards
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Comprehensive overview of electrical standards applicable to EV
                charging infrastructure
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {standards.map((standard) => (
                <Card key={standard.id} className="h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <CardTitle className="text-xl">
                          {standard.title}
                        </CardTitle>
                        <CardDescription className="text-base font-medium">
                          {standard.subtitle}
                        </CardDescription>
                        <Badge variant="outline" className="mt-2">
                          {standard.category}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Updated</p>
                        <p className="text-sm font-medium">
                          {standard.lastUpdated}
                        </p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <p className="text-muted-foreground">
                      {standard.description}
                    </p>

                    <div>
                      <h4 className="font-semibold text-sm mb-3">
                        Key Requirements:
                      </h4>
                      <ul className="space-y-2">
                        {standard.keyRequirements.map((req, index) => (
                          <li key={index} className="flex items-start text-sm">
                            <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm mb-3">
                        Applicable To:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {standard.applicableTo.map((item, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs"
                          >
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Online
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* State Regulations */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/50">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                State & Territory Regulations
              </h2>
              <p className="text-muted-foreground text-lg">
                Specific requirements and regulations for each Australian state
                and territory
              </p>
            </div>

            {/* State Filter */}
            <div className="flex justify-center mb-8">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedState === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedState("all")}
                >
                  All States
                </Button>
                {stateRegulations.map((state) => (
                  <Button
                    key={state.state}
                    variant={
                      selectedState === state.state ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setSelectedState(state.state)}
                  >
                    {state.state}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {filteredRegulations.map((regulation) => (
                <Card key={regulation.state}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-primary" />
                          {regulation.name} ({regulation.state})
                        </CardTitle>
                        <CardDescription>
                          {regulation.authority}
                        </CardDescription>
                      </div>
                      <Badge variant="outline">{regulation.state}</Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-sm mb-3">
                        General Requirements:
                      </h4>
                      <ul className="space-y-2">
                        {regulation.keyRequirements.map((req, index) => (
                          <li key={index} className="flex items-start text-sm">
                            <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm mb-3">
                        EV Specific Requirements:
                      </h4>
                      <ul className="space-y-2">
                        {regulation.evSpecific.map((req, index) => (
                          <li key={index} className="flex items-start text-sm">
                            <Zap className="w-4 h-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm">
                        Contact Information:
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span>{regulation.contacts.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span>{regulation.contacts.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ExternalLink className="w-4 h-4 text-muted-foreground" />
                          <a
                            href={regulation.website}
                            className="text-primary hover:underline"
                          >
                            Official Website
                          </a>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Compliance Checklist */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                EV Installation Compliance Checklist
              </h2>
              <p className="text-muted-foreground text-lg">
                Comprehensive checklist to ensure your EV charging installations
                meet all requirements
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {complianceChecklist.map((section, sectionIndex) => (
                <Card key={sectionIndex}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                      {section.category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {section.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
                          />
                          <span className="text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-8">
              <Button size="lg">
                <Download className="w-5 h-5 mr-2" />
                Download Complete Checklist
              </Button>
            </div>
          </div>
        </section>

        {/* Compliance Tools */}
        <section id="tools" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/50">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Compliance Tools</h2>
              <p className="text-muted-foreground text-lg">
                Streamline your compliance processes with our specialized tools
                and resources
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {tools.map((tool, index) => (
                <Card key={index} className="text-center">
                  <CardHeader>
                    <div className="flex justify-center mb-4">{tool.icon}</div>
                    <CardTitle className="text-xl">{tool.title}</CardTitle>
                    <CardDescription>{tool.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 mb-6">
                      <h4 className="font-semibold text-sm">Features:</h4>
                      <ul className="space-y-2">
                        {tool.features.map((feature, featureIndex) => (
                          <li
                            key={featureIndex}
                            className="flex items-center justify-center text-sm"
                          >
                            <CheckCircle2 className="w-4 h-4 text-green-500 mr-2" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Button className="w-full">{tool.action}</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Expert Support */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto">
            <Card className="bg-gradient-to-r from-primary to-secondary text-white">
              <CardContent className="p-12 text-center">
                <Users className="w-12 h-12 mx-auto mb-6" />
                <h3 className="text-3xl font-bold mb-4">
                  Need Compliance Assistance?
                </h3>
                <p className="text-xl mb-8 text-primary-foreground/90 max-w-2xl mx-auto">
                  Our team of compliance experts is here to help you navigate
                  complex regulations and ensure your EV installations meet all
                  requirements.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="text-primary"
                  >
                    Contact Compliance Team
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-primary"
                  >
                    Schedule Consultation
                    <Calendar className="ml-2 w-5 h-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Logo />
              </div>
              <p className="text-sm text-muted-foreground">
                The complete platform for electrical contractors in the EV
                infrastructure market.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Compliance</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    to="/compliance#standards"
                    className="hover:text-foreground"
                  >
                    Standards
                  </Link>
                </li>
                <li>
                  <Link
                    to="/compliance#regulations"
                    className="hover:text-foreground"
                  >
                    Regulations
                  </Link>
                </li>
                <li>
                  <Link
                    to="/compliance#tools"
                    className="hover:text-foreground"
                  >
                    Tools
                  </Link>
                </li>
                <li>
                  <Link
                    to="/compliance#updates"
                    className="hover:text-foreground"
                  >
                    Updates
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link to="/help-centre" className="hover:text-foreground">
                    Help Centre
                  </Link>
                </li>
                <li>
                  <Link to="/training" className="hover:text-foreground">
                    Training
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-foreground">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>1800 COMPLY (266 759)</li>
                <li>compliance@chargesource.com.au</li>
                <li>Mon-Fri 9AM-6PM AEST</li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 ChargeSource. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
