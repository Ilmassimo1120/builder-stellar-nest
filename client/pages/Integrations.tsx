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
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  ExternalLink,
  CheckCircle,
  Star,
  Users,
  Building,
  CreditCard,
  MessageSquare,
  Database,
  FileText,
  Settings,
  Zap,
  Cloud,
  Smartphone,
  BarChart3,
  Calendar,
  Mail,
  Package,
  Truck,
  Shield,
  Globe,
  Code,
  ArrowRight,
  Plus,
  Filter,
  Bookmark,
  Download,
  PlayCircle,
  BookOpen,
  HelpCircle,
  Puzzle,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";

const Integrations = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { id: "all", name: "All Integrations", count: 45 },
    { id: "accounting", name: "Accounting", count: 8 },
    { id: "crm", name: "CRM", count: 6 },
    { id: "project", name: "Project Management", count: 9 },
    { id: "communication", name: "Communication", count: 7 },
    { id: "payments", name: "Payments", count: 5 },
    { id: "storage", name: "Cloud Storage", count: 6 },
    { id: "analytics", name: "Analytics", count: 4 },
  ];

  const featuredIntegrations = [
    {
      id: "quickbooks",
      name: "QuickBooks",
      category: "accounting",
      description: "Sync your financial data automatically with QuickBooks Online and Desktop",
      logo: "https://logo.clearbit.com/quickbooks.intuit.com",
      isPopular: true,
      rating: 4.8,
      reviews: 2450,
      features: ["Two-way sync", "Real-time updates", "Invoice automation", "Tax reporting"],
      setupTime: "5 minutes",
      tier: "free",
    },
    {
      id: "hubspot",
      name: "HubSpot CRM",
      category: "crm",
      description: "Manage leads and customers seamlessly with HubSpot integration",
      logo: "https://logo.clearbit.com/hubspot.com",
      isPopular: true,
      rating: 4.7,
      reviews: 1850,
      features: ["Lead sync", "Contact management", "Deal tracking", "Email automation"],
      setupTime: "10 minutes",
      tier: "pro",
    },
    {
      id: "xero",
      name: "Xero",
      category: "accounting",
      description: "Cloud-based accounting software for small businesses",
      logo: "https://logo.clearbit.com/xero.com",
      isPopular: true,
      rating: 4.5,
      reviews: 1680,
      features: ["Bank reconciliation", "Invoice tracking", "Financial reporting", "GST compliance"],
      setupTime: "8 minutes",
      tier: "free",
    },
    {
      id: "pipedrive",
      name: "Pipedrive",
      category: "crm",
      description: "Sales-focused CRM that helps you organize leads and deals",
      logo: "https://via.placeholder.com/60x60/7B68EE/FFFFFF?text=PD",
      isPopular: true,
      rating: 4.5,
      reviews: 1340,
      features: ["Visual sales pipeline", "Activity reminders", "Email integration", "Lead scoring"],
      setupTime: "7 minutes",
      tier: "free",
    },
  ];

  const allIntegrations = [
    // Accounting
    {
      id: "xero",
      name: "Xero",
      category: "accounting",
      description: "Cloud-based accounting software for small businesses",
      logo: "https://via.placeholder.com/48x48/13B5EA/FFFFFF?text=XE",
      rating: 4.5,
      tier: "free",
      features: ["Bank reconciliation", "Invoice tracking", "Financial reporting"],
    },
    {
      id: "myob",
      name: "MYOB",
      category: "accounting",
      description: "Australian business management and accounting solution",
      logo: "https://via.placeholder.com/48x48/E31E24/FFFFFF?text=MY",
      rating: 4.3,
      tier: "pro",
      features: ["Payroll management", "GST compliance", "Australian tax reporting"],
    },
    {
      id: "freshbooks",
      name: "FreshBooks",
      category: "accounting",
      description: "Cloud accounting for freelancers and small businesses",
      logo: "https://via.placeholder.com/48x48/0F8A5C/FFFFFF?text=FB",
      rating: 4.4,
      tier: "free",
      features: ["Time tracking", "Expense management", "Client portal"],
    },
    {
      id: "sage",
      name: "Sage",
      category: "accounting",
      description: "Comprehensive business management software",
      logo: "https://via.placeholder.com/48x48/8BC34A/FFFFFF?text=SG",
      rating: 4.2,
      tier: "enterprise",
      features: ["Advanced reporting", "Multi-currency", "Inventory management"],
    },
    
    // CRM
    {
      id: "salesforce",
      name: "Salesforce",
      category: "crm",
      description: "World's leading customer relationship management platform",
      logo: "https://via.placeholder.com/48x48/00A1E0/FFFFFF?text=SF",
      rating: 4.6,
      tier: "pro",
      features: ["Lead management", "Sales pipeline", "Marketing automation"],
    },
    {
      id: "pipedrive",
      name: "Pipedrive",
      category: "crm",
      description: "Sales-focused CRM that helps you organize leads and deals",
      logo: "https://via.placeholder.com/48x48/7B68EE/FFFFFF?text=PD",
      rating: 4.5,
      tier: "free",
      features: ["Visual sales pipeline", "Activity reminders", "Email integration"],
    },
    {
      id: "monday",
      name: "Monday CRM",
      category: "crm",
      description: "Visual CRM and project management platform",
      logo: "https://via.placeholder.com/48x48/FF5722/FFFFFF?text=MO",
      rating: 4.4,
      tier: "pro",
      features: ["Custom workflows", "Team collaboration", "Visual dashboards"],
    },
    
    // Project Management
    {
      id: "asana",
      name: "Asana",
      category: "project",
      description: "Team collaboration and project management tool",
      logo: "https://via.placeholder.com/48x48/F06A6A/FFFFFF?text=AS",
      rating: 4.5,
      tier: "free",
      features: ["Task management", "Team coordination", "Progress tracking"],
    },
    {
      id: "trello",
      name: "Trello",
      category: "project",
      description: "Visual project management with boards and cards",
      logo: "https://via.placeholder.com/48x48/0079BF/FFFFFF?text=TR",
      rating: 4.3,
      tier: "free",
      features: ["Kanban boards", "Team collaboration", "Workflow automation"],
    },
    {
      id: "jira",
      name: "Jira",
      category: "project",
      description: "Issue tracking and project management for teams",
      logo: "https://via.placeholder.com/48x48/0052CC/FFFFFF?text=JI",
      rating: 4.2,
      tier: "pro",
      features: ["Issue tracking", "Agile boards", "Custom workflows"],
    },
    
    // Communication
    {
      id: "teams",
      name: "Microsoft Teams",
      category: "communication",
      description: "Chat-based workspace for real-time collaboration",
      logo: "https://via.placeholder.com/48x48/6264A7/FFFFFF?text=MT",
      rating: 4.4,
      tier: "free",
      features: ["Video meetings", "File sharing", "Team channels"],
    },
    {
      id: "discord",
      name: "Discord",
      category: "communication",
      description: "Voice, video, and text communication for teams",
      logo: "https://via.placeholder.com/48x48/7289DA/FFFFFF?text=DI",
      rating: 4.2,
      tier: "free",
      features: ["Voice channels", "Screen sharing", "Bot integrations"],
    },
    {
      id: "zoom",
      name: "Zoom",
      category: "communication",
      description: "Video conferencing and webinar platform",
      logo: "https://via.placeholder.com/48x48/2D8CFF/FFFFFF?text=ZO",
      rating: 4.3,
      tier: "free",
      features: ["HD video", "Screen sharing", "Recording"],
    },
    
    // Payments
    {
      id: "paypal",
      name: "PayPal",
      category: "payments",
      description: "Global online payment system",
      logo: "https://via.placeholder.com/48x48/003087/FFFFFF?text=PP",
      rating: 4.1,
      tier: "free",
      features: ["Online payments", "Invoice billing", "Buyer protection"],
    },
    {
      id: "square",
      name: "Square",
      category: "payments",
      description: "Point of sale and payment processing",
      logo: "https://via.placeholder.com/48x48/000000/FFFFFF?text=SQ",
      rating: 4.4,
      tier: "free",
      features: ["Card processing", "POS system", "Inventory management"],
    },
    
    // Cloud Storage
    {
      id: "googledrive",
      name: "Google Drive",
      category: "storage",
      description: "Cloud storage and file synchronization service",
      logo: "https://via.placeholder.com/48x48/34A853/FFFFFF?text=GD",
      rating: 4.6,
      tier: "free",
      features: ["File sync", "Real-time collaboration", "Version history"],
    },
    {
      id: "dropbox",
      name: "Dropbox",
      category: "storage",
      description: "File hosting service with advanced sharing features",
      logo: "https://via.placeholder.com/48x48/0061FF/FFFFFF?text=DB",
      rating: 4.4,
      tier: "free",
      features: ["File sync", "Smart sync", "Advanced sharing"],
    },
    {
      id: "onedrive",
      name: "OneDrive",
      category: "storage",
      description: "Microsoft's cloud storage solution",
      logo: "https://via.placeholder.com/48x48/0078D4/FFFFFF?text=OD",
      rating: 4.3,
      tier: "free",
      features: ["Office integration", "Version history", "Personal vault"],
    },
  ];

  const filteredIntegrations = allIntegrations.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || integration.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getTierBadge = (tier: string) => {
    const tierColors = {
      free: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
      pro: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
      enterprise: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300",
    };
    
    return (
      <Badge className={tierColors[tier as keyof typeof tierColors] || tierColors.free}>
        {tier.charAt(0).toUpperCase() + tier.slice(1)}
      </Badge>
    );
  };

  const developerResources = [
    {
      title: "API Documentation",
      description: "Complete reference for our REST API",
      icon: Code,
      link: "#",
    },
    {
      title: "SDK Downloads",
      description: "Libraries for popular programming languages",
      icon: Download,
      link: "#",
    },
    {
      title: "Video Tutorials",
      description: "Step-by-step integration guides",
      icon: PlayCircle,
      link: "#",
    },
    {
      title: "Integration Guide",
      description: "Best practices and examples",
      icon: BookOpen,
      link: "#",
    },
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
              to="/features"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Features
            </Link>
            <Link
              to="/pricing"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Pricing
            </Link>
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
            <Puzzle className="w-3 h-3 mr-1" />
            45+ Integrations Available
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Connect with
            <br />
            Your Favorite Tools
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Seamlessly integrate ChargeSource with the tools you already use. 
            From accounting software to project management platforms, we've got you covered.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" asChild>
              <Link to="/register">
                Start Integrating
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline">
              <ExternalLink className="w-4 h-4 mr-2" />
              API Documentation
            </Button>
          </div>
        </section>

        {/* Featured Integrations */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Featured Integrations</h2>
            <p className="text-lg text-muted-foreground">
              Our most popular and powerful integrations
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {featuredIntegrations.map((integration) => (
              <Card key={integration.id} className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                {integration.isPopular && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300">
                      <Star className="w-3 h-3 mr-1" />
                      Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3 mb-3">
                    <img src={integration.logo} alt={integration.name} className="w-12 h-12 rounded-lg" />
                    <div>
                      <CardTitle className="text-lg">{integration.name}</CardTitle>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{integration.rating}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          ({integration.reviews.toLocaleString()})
                        </span>
                      </div>
                    </div>
                  </div>
                  <CardDescription>{integration.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Setup time:</span>
                      <span className="text-sm font-medium">{integration.setupTime}</span>
                    </div>
                    {getTierBadge(integration.tier)}
                    <ul className="space-y-1">
                      {integration.features.slice(0, 3).map((feature, idx) => (
                        <li key={idx} className="flex items-center space-x-2 text-sm">
                          <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button className="w-full group-hover:bg-primary/90 transition-colors">
                      Connect
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* All Integrations */}
        <section className="mb-16">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <div className="lg:w-80 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Search className="w-5 h-5" />
                    <span>Search Integrations</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Input
                    placeholder="Search by name or feature..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="mb-4"
                  />
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-muted-foreground">Categories</h4>
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          selectedCategory === category.id
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm">{category.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {category.count}
                          </Badge>
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Developer Resources */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Developer Resources</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {developerResources.map((resource, idx) => (
                    <div key={idx} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                      <resource.icon className="w-5 h-5 text-primary" />
                      <div>
                        <h4 className="font-medium text-sm">{resource.title}</h4>
                        <p className="text-xs text-muted-foreground">{resource.description}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold">All Integrations</h2>
                  <p className="text-muted-foreground">
                    {filteredIntegrations.length} integrations found
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm">
                    <Bookmark className="w-4 h-4 mr-2" />
                    Saved
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredIntegrations.map((integration) => (
                  <Card key={integration.id} className="hover:shadow-md transition-shadow group">
                    <CardHeader className="pb-3">
                      <div className="flex items-center space-x-3 mb-2">
                        <img src={integration.logo} alt={integration.name} className="w-10 h-10 rounded-lg" />
                        <div className="flex-1">
                          <CardTitle className="text-base">{integration.name}</CardTitle>
                          <div className="flex items-center space-x-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm">{integration.rating}</span>
                          </div>
                        </div>
                        {getTierBadge(integration.tier)}
                      </div>
                      <CardDescription className="text-sm">{integration.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 mb-3">
                        {integration.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center space-x-2 text-xs">
                            <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                      <Button size="sm" className="w-full">
                        Connect
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredIntegrations.length === 0 && (
                <div className="text-center py-12">
                  <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No integrations found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search terms or category filters
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Custom Integration CTA */}
        <section className="text-center py-16 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl">
          <h2 className="text-3xl font-bold mb-4">Need a Custom Integration?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Don't see the tool you need? Our team can build custom integrations 
            to connect ChargeSource with any software your business uses.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg">
              <Plus className="w-4 h-4 mr-2" />
              Request Integration
            </Button>
            <Button size="lg" variant="outline">
              <HelpCircle className="w-4 h-4 mr-2" />
              Contact Support
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
              <Link to="/features" className="text-sm text-muted-foreground hover:text-foreground">
                Features
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

export default Integrations;
