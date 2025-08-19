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
  Zap,
  Calculator,
  Package,
  Users,
  Share2,
  PlugZap,
  CheckCircle2,
  ArrowRight,
  Star,
  MapPin,
  Calendar,
  DollarSign,
  Settings,
  TrendingUp,
  Shield,
  Clock,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { useAuth } from "@/hooks/useAuth";

export default function Index() {
  const { isAuthenticated } = useAuth();
  const features = [
    {
      icon: <Zap className="w-8 h-8 text-primary" />,
      title: "Project Planning Wizard",
      description:
        "Site assessment inputs, auto-selection of suitable chargers, grid capacity checks & compliance checklists (AS/NZS 3000).",
      items: [
        "Site Assessment Tools",
        "Auto Charger Selection",
        "Grid Capacity Analysis",
        "Compliance Checklists",
      ],
    },
    {
      icon: <Calculator className="w-8 h-8 text-secondary" />,
      title: "Smart Quoting Engine (CPQ)",
      description:
        "Dynamic quoting with selectable components, auto-calculated costs, templates for recurring projects.",
      items: [
        "Dynamic Component Selection",
        "Auto Cost Calculation",
        "Project Templates",
        "PDF Quote Generation",
      ],
    },
    {
      icon: <Package className="w-8 h-8 text-accent" />,
      title: "Procurement & Supplier Integration",
      description:
        "Product catalogue access, real-time inventory & pricing, one-click quote-to-order conversion.",
      items: [
        "Real-time Inventory",
        "Supplier API Integration",
        "Order Tracking",
        "Payment Gateway",
      ],
    },
    {
      icon: <Users className="w-8 h-8 text-primary" />,
      title: "Account & Project Management",
      description:
        "Multi-client dashboard, document uploads, permissions & collaboration tools for teams.",
      items: [
        "Client Dashboard",
        "Document Management",
        "Team Collaboration",
        "Project Tracking",
      ],
    },
    {
      icon: <Share2 className="w-8 h-8 text-secondary" />,
      title: "Marketing & Growth",
      description:
        "Referral programs, affiliate marketing tools to grow your electrical contracting business.",
      items: [
        "Referral System",
        "Affiliate Marketing",
        "Lead Generation",
        "Customer Retention",
      ],
    },
    {
      icon: <Settings className="w-8 h-8 text-accent" />,
      title: "Integration-Ready Modules",
      description:
        "MYOB/Xero/QuickBooks integration, CRM integration, training portal, rebate assistant.",
      items: [
        "Accounting Integration",
        "CRM Connectivity",
        "Training Portal",
        "Rebate Assistant",
      ],
    },
  ];

  const stats = [
    {
      value: "500+",
      label: "Active Contractors",
      icon: <Users className="w-5 h-5" />,
    },
    {
      value: "15,000+",
      label: "Projects Completed",
      icon: <CheckCircle2 className="w-5 h-5" />,
    },
    {
      value: "$50M+",
      label: "Revenue Generated",
      icon: <DollarSign className="w-5 h-5" />,
    },
    {
      value: "50+",
      label: "Supplier Partners",
      icon: <Package className="w-5 h-5" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Logo size="xl" />
          <nav className="hidden md:flex items-center space-x-6 -ml-px justify-center flex-1">
            <Link
              to="/features"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Features
            </Link>
            <Link
              to="/products"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Products
            </Link>
            <Link
              to="/integrations"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Integrations
            </Link>
            <Link
              to="/pricing"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Pricing
            </Link>
            <Link
              to="/contact"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Contact
            </Link>
          </nav>
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to={isAuthenticated ? "/dashboard" : "/login"}>
                Get Started
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge variant="secondary" className="mb-4">
            🇦🇺 Built for Australian Electrical Contractors
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Streamline Your{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              EV Infrastructure
            </span>{" "}
            Projects
          </h1>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            The comprehensive platform for planning, quoting, and procurement of
            commercial and residential EV charging solutions. Built specifically
            for Australian electrical contractors.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="text-lg px-8" asChild>
              <Link to={isAuthenticated ? "/dashboard" : "/login"}>
                Start Free Trial
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-4">
              Watch Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center mb-2 text-primary">
                  {stat.icon}
                </div>
                <div className="text-2xl md:text-3xl font-bold text-primary">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <p>
                Everything You Need to Scale Your EV Charging Installation
                Services
              </p>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From initial site assessment to project completion, ChargeSource
              handles every aspect of your EV infrastructure projects.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="h-full hover:shadow-lg transition-shadow border-border/50"
              >
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    {feature.icon}
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </div>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feature.items.map((item, itemIndex) => (
                      <li
                        key={itemIndex}
                        className="flex items-center gap-2 text-sm"
                      >
                        <CheckCircle2 className="w-4 h-4 text-secondary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Comprehensive Benefits Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Why Electrical Contractors Choose ChargeSource
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Discover the comprehensive advantages that make ChargeSource the
              preferred platform for Australian electrical contractors in the EV
              infrastructure market.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            {/* Business Growth Benefits */}
            <Card className="border-primary/20 hover:border-primary/40 transition-colors">
              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Business Growth</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">
                      Increase project win rate by up to 40% with professional
                      quotes
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">
                      Reduce quote preparation time from hours to minutes
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">
                      Access to exclusive EV infrastructure opportunities
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">
                      Built-in referral system to grow your client base
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">
                      Professional branding and marketing support
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Operational Efficiency Benefits */}
            <Card className="border-secondary/20 hover:border-secondary/40 transition-colors">
              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-lg bg-secondary/10">
                    <Settings className="w-6 h-6 text-secondary" />
                  </div>
                  <CardTitle className="text-xl">
                    Operational Efficiency
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">
                      Streamlined project management from quote to completion
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">
                      Automated compliance checking and documentation
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">
                      Real-time inventory tracking and procurement
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">
                      Integrated accounting and invoicing systems
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">
                      Mobile-first design for on-site productivity
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Risk Management Benefits */}
            <Card className="border-accent/20 hover:border-accent/40 transition-colors">
              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-lg bg-accent/10">
                    <Shield className="w-6 h-6 text-accent" />
                  </div>
                  <CardTitle className="text-xl">Risk Management</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">
                      Automatic AS/NZS 3000 compliance verification
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">
                      Built-in safety protocols and checklists
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">
                      Insurance-approved documentation and processes
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">
                      Regular updates for changing regulations
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">
                      Professional liability protection guidance
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Additional Benefits Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <div className="text-center p-6 rounded-lg bg-white/50 border">
              <DollarSign className="w-8 h-8 text-primary mx-auto mb-4" />
              <h4 className="font-semibold mb-2">Cost Savings</h4>
              <p className="text-sm text-muted-foreground">
                Save up to 30% on project costs through optimized procurement
                and efficient workflows
              </p>
            </div>
            <div className="text-center p-6 rounded-lg bg-white/50 border">
              <Clock className="w-8 h-8 text-secondary mx-auto mb-4" />
              <h4 className="font-semibold mb-2">Time Efficiency</h4>
              <p className="text-sm text-muted-foreground">
                Reduce project delivery time by 25% with streamlined processes
                and automation
              </p>
            </div>
            <div className="text-center p-6 rounded-lg bg-white/50 border">
              <Star className="w-8 h-8 text-accent mx-auto mb-4" />
              <h4 className="font-semibold mb-2">Customer Satisfaction</h4>
              <p className="text-sm text-muted-foreground">
                95% customer satisfaction rate with transparent communication
                and quality delivery
              </p>
            </div>
            <div className="text-center p-6 rounded-lg bg-white/50 border">
              <Users className="w-8 h-8 text-primary mx-auto mb-4" />
              <h4 className="font-semibold mb-2">Expert Support</h4>
              <p className="text-sm text-muted-foreground">
                24/7 technical support from EV infrastructure specialists and
                industry experts
              </p>
            </div>
          </div>

          {/* Key Advantages List */}
          <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-0">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-center mb-8">
                Why ChargeSource is the Smart Choice for Your Business
              </h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary" />
                    Competitive Advantages
                  </h4>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <ArrowRight className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                      <span className="text-sm">
                        First-to-market with comprehensive EV infrastructure
                        platform in Australia
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <ArrowRight className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                      <span className="text-sm">
                        Direct partnerships with leading EV equipment
                        manufacturers
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <ArrowRight className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                      <span className="text-sm">
                        Government rebate and incentive program integration
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <ArrowRight className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                      <span className="text-sm">
                        Exclusive access to high-value commercial projects
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <ArrowRight className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                      <span className="text-sm">
                        Industry-leading profit margins on completed projects
                      </span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5 text-secondary" />
                    Platform Benefits
                  </h4>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <ArrowRight className="w-4 h-4 text-secondary mt-1 flex-shrink-0" />
                      <span className="text-sm">
                        All-in-one solution eliminating need for multiple
                        software tools
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <ArrowRight className="w-4 h-4 text-secondary mt-1 flex-shrink-0" />
                      <span className="text-sm">
                        Cloud-based platform accessible anywhere, anytime
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <ArrowRight className="w-4 h-4 text-secondary mt-1 flex-shrink-0" />
                      <span className="text-sm">
                        Regular feature updates and platform improvements at no
                        extra cost
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <ArrowRight className="w-4 h-4 text-secondary mt-1 flex-shrink-0" />
                      <span className="text-sm">
                        Seamless integration with existing business systems
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <ArrowRight className="w-4 h-4 text-secondary mt-1 flex-shrink-0" />
                      <span className="text-sm">
                        Scalable from sole traders to large contracting
                        companies
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Success Metrics */}
          <div className="mt-16 text-center">
            <h3 className="text-2xl font-bold mb-8">
              Proven Results for Our Partners
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <div className="text-4xl font-bold text-primary mb-2">500+</div>
                <div className="text-sm text-muted-foreground">
                  Active Contractors
                </div>
              </div>
              <div>
                <div className="text-4xl font-bold text-secondary mb-2">
                  $50M+
                </div>
                <div className="text-sm text-muted-foreground">
                  Projects Completed
                </div>
              </div>
              <div>
                <div className="text-4xl font-bold text-accent mb-2">98%</div>
                <div className="text-sm text-muted-foreground">
                  Customer Retention
                </div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">24/7</div>
                <div className="text-sm text-muted-foreground">
                  Expert Support
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <Card className="bg-gradient-to-r from-primary to-secondary text-white border-0">
            <CardContent className="p-12 text-center">
              <h3 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Transform Your EV Projects?
              </h3>
              <p className="text-xl mb-8 text-primary-foreground/90 max-w-2xl mx-auto">
                Join hundreds of Australian electrical contractors who are
                streamlining their EV infrastructure projects with ChargeSource.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  variant="secondary"
                  className="text-lg px-8"
                  asChild
                >
                  <Link to={isAuthenticated ? "/dashboard" : "/login"}>
                    Get Started Free
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  Schedule Demo
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <Logo size="sm" className="mb-4" />
              <p className="text-sm text-muted-foreground mb-4">
                The leading platform for Australian electrical contractors
                specializing in EV infrastructure.
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                Sydney, Melbourne, Brisbane, Perth
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    to="/features"
                    className="hover:text-primary transition-colors"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    to="/pricing"
                    className="hover:text-primary transition-colors"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    to="/integrations"
                    className="hover:text-primary transition-colors"
                  >
                    Integrations
                  </Link>
                </li>
                <li>
                  <Link
                    to="/api"
                    className="hover:text-primary transition-colors"
                  >
                    API
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    to="/help"
                    className="hover:text-primary transition-colors"
                  >
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="hover:text-primary transition-colors"
                  >
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link
                    to="/training"
                    className="hover:text-primary transition-colors"
                  >
                    Training
                  </Link>
                </li>
                <li>
                  <Link
                    to="/compliance"
                    className="hover:text-primary transition-colors"
                  >
                    Compliance
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    to="/about"
                    className="hover:text-primary transition-colors"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    to="/careers"
                    className="hover:text-primary transition-colors"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    to="/privacy"
                    className="hover:text-primary transition-colors"
                  >
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link
                    to="/terms"
                    className="hover:text-primary transition-colors"
                  >
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © 2024 Charge N Go Australia. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-4 md:mt-0">
              <span>🇦🇺 Made in Australia</span>
              <span>•</span>
              <span>AS/NZS 3000 Compliant</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
