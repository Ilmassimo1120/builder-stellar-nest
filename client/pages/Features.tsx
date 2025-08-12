import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import {
  PlugZap,
  ArrowLeft,
  Building,
  Calculator,
  FileText,
  Users,
  BarChart3,
  Shield,
  Zap,
  Settings,
  CloudIcon,
  Package,
  Clock,
  CheckCircle,
  ArrowRight,
  Smartphone,
  Globe,
  Database,
  Wrench,
  TrendingUp,
  Home,
  Factory,
  Car,
  Gauge,
  Battery,
  MapPin,
  CreditCard,
  HeadphonesIcon,
  BookOpen,
  Star,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";

const Features = () => {
  const coreFeatures = [
    {
      icon: Building,
      title: "Project Management",
      description: "Complete project lifecycle management from planning to completion",
      features: [
        "Custom project templates",
        "Progress tracking & milestones",
        "Resource allocation",
        "Team collaboration tools",
        "Document management",
      ],
      category: "Management",
    },
    {
      icon: Calculator,
      title: "Smart Quoting Engine",
      description: "AI-powered quote generation with real-time pricing",
      features: [
        "Automated cost calculations",
        "Material price updates",
        "Labor cost estimation",
        "Margin optimization",
        "Professional PDF generation",
      ],
      category: "Pricing",
    },
    {
      icon: FileText,
      title: "Document Management",
      description: "Centralized document storage with version control",
      features: [
        "Cloud-based storage",
        "Version history tracking",
        "Secure file sharing",
        "Template library",
        "Digital signatures",
      ],
      category: "Documents",
    },
    {
      icon: Users,
      title: "Customer Portal",
      description: "Self-service portal for clients to track projects",
      features: [
        "Real-time project updates",
        "Invoice management",
        "Communication hub",
        "Document access",
        "Feedback system",
      ],
      category: "Customer Experience",
    },
    {
      icon: BarChart3,
      title: "Analytics & Reporting",
      description: "Comprehensive business intelligence and insights",
      features: [
        "Performance dashboards",
        "Financial reporting",
        "Project analytics",
        "ROI tracking",
        "Custom reports",
      ],
      category: "Analytics",
    },
    {
      icon: Shield,
      title: "Compliance & Safety",
      description: "Built-in compliance tracking and safety management",
      features: [
        "Regulatory compliance",
        "Safety checklists",
        "Certification tracking",
        "Audit trails",
        "Risk assessment",
      ],
      category: "Compliance",
    },
  ];

  const industries = [
    {
      icon: Home,
      title: "Residential",
      description: "Home EV charging solutions",
      features: ["Single-family homes", "Townhouses", "Condominiums"],
    },
    {
      icon: Building,
      title: "Commercial",
      description: "Business charging infrastructure",
      features: ["Office buildings", "Retail centers", "Hotels"],
    },
    {
      icon: Factory,
      title: "Industrial",
      description: "Large-scale charging networks",
      features: ["Manufacturing facilities", "Warehouses", "Distribution centers"],
    },
    {
      icon: Car,
      title: "Fleet",
      description: "Commercial fleet charging",
      features: ["Delivery companies", "Transport services", "Government fleets"],
    },
  ];

  const benefits = [
    {
      icon: Clock,
      title: "Save Time",
      description: "Reduce project management overhead by 60%",
      value: "60%",
    },
    {
      icon: TrendingUp,
      title: "Increase Revenue",
      description: "Optimize pricing and win more projects",
      value: "35%",
    },
    {
      icon: CheckCircle,
      title: "Improve Quality",
      description: "Standardize processes and reduce errors",
      value: "90%",
    },
    {
      icon: Users,
      title: "Customer Satisfaction",
      description: "Enhanced client communication and transparency",
      value: "95%",
    },
  ];

  const integrations = [
    { name: "Accounting Software", description: "QuickBooks, Xero, MYOB" },
    { name: "CRM Systems", description: "Salesforce, HubSpot, Pipedrive" },
    { name: "Project Tools", description: "Monday, Asana, Trello" },
    { name: "Payment Gateways", description: "Stripe, PayPal, Square" },
    { name: "Communication", description: "Slack, Microsoft Teams" },
    { name: "Cloud Storage", description: "Google Drive, Dropbox, OneDrive" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="flex items-center space-x-2 text-sm font-medium hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
          </div>
          <Logo size="md" />
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/login"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Login
            </Link>
            <Button asChild>
              <Link to="/register">Get Started</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            <Star className="w-3 h-3 mr-1" />
            Complete EV Infrastructure Solution
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Powerful Features for
            <br />
            EV Infrastructure Projects
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Everything you need to plan, quote, manage, and deliver successful EV charging infrastructure projects. 
            Built specifically for electrical contractors and project managers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/register">
                Start Free Trial
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/login">View Demo</Link>
            </Button>
          </div>
        </section>

        {/* Core Features */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Core Features</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive tools designed to streamline every aspect of your EV infrastructure business
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {coreFeatures.map((feature, index) => (
              <Card key={index} className="relative overflow-hidden group hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <Badge variant="outline">{feature.category}</Badge>
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feature.features.map((item, idx) => (
                      <li key={idx} className="flex items-center space-x-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Industries */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Industry Solutions</h2>
            <p className="text-lg text-muted-foreground">
              Tailored solutions for every type of EV infrastructure project
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {industries.map((industry, index) => (
              <Card key={index} className="text-center group hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mx-auto p-3 bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                    <industry.icon className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{industry.title}</CardTitle>
                  <CardDescription>{industry.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {industry.features.map((feature, idx) => (
                      <li key={idx}>{feature}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Benefits */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Proven Results</h2>
            <p className="text-lg text-muted-foreground">
              See the measurable impact ChargeSource has on electrical contracting businesses
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="mx-auto p-3 bg-green-100 dark:bg-green-900/20 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                    <benefit.icon className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                    {benefit.value}
                  </div>
                  <CardTitle className="text-lg">{benefit.title}</CardTitle>
                  <CardDescription>{benefit.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        {/* Technical Features */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Technical Capabilities</h2>
            <p className="text-lg text-muted-foreground">
              Enterprise-grade infrastructure and security
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CloudIcon className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Cloud Infrastructure</CardTitle>
                <CardDescription>
                  Secure, scalable cloud hosting with 99.9% uptime guarantee
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Auto-scaling infrastructure</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Global CDN delivery</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Automated backups</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Smartphone className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Mobile Optimized</CardTitle>
                <CardDescription>
                  Full-featured mobile experience for field work
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Responsive design</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Offline capabilities</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Photo capture & upload</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Database className="w-8 h-8 text-primary mb-2" />
                <CardTitle>API Integration</CardTitle>
                <CardDescription>
                  Connect with your existing tools and workflows
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>RESTful API</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Webhook support</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Custom integrations</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Integrations */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Seamless Integrations</h2>
            <p className="text-lg text-muted-foreground">
              Works with the tools you already use
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {integrations.map((integration, index) => (
              <Card key={index} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Settings className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{integration.name}</h3>
                    <p className="text-sm text-muted-foreground">{integration.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center py-16 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Business?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join hundreds of electrical contractors who have streamlined their EV infrastructure projects with ChargeSource.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/register">
                Start Free Trial
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/support">Contact Sales</Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <Logo size="md" />
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <Link to="/support" className="text-sm text-muted-foreground hover:text-foreground">
                Support
              </Link>
              <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground">
                Pricing
              </Link>
              <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground">
                Login
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Features;
