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
import { Link } from "react-router-dom";
import {
  Search,
  BookOpen,
  MessageCircle,
  Phone,
  Mail,
  FileText,
  Video,
  Users,
  Zap,
  Calculator,
  Package,
  Settings,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  Download,
  ExternalLink,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";

export default function HelpCentre() {
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    {
      id: "getting-started",
      title: "Getting Started",
      description:
        "Everything you need to know to begin your EV infrastructure journey",
      icon: <Zap className="w-8 h-8 text-primary" />,
      articles: 12,
      color: "primary",
    },
    {
      id: "project-planning",
      title: "Project Planning",
      description:
        "Site assessment, compliance checks, and project setup guidance",
      icon: <Calculator className="w-8 h-8 text-secondary" />,
      articles: 18,
      color: "secondary",
    },
    {
      id: "quoting-pricing",
      title: "Quoting & Pricing",
      description: "CPQ system, cost calculations, and proposal generation",
      icon: <FileText className="w-8 h-8 text-accent" />,
      articles: 15,
      color: "accent",
    },
    {
      id: "procurement",
      title: "Procurement & Orders",
      description:
        "Supplier integration, inventory management, and order processing",
      icon: <Package className="w-8 h-8 text-primary" />,
      articles: 10,
      color: "primary",
    },
    {
      id: "integrations",
      title: "Integrations",
      description: "Connect with MYOB, Xero, CRM systems, and other tools",
      icon: <Settings className="w-8 h-8 text-secondary" />,
      articles: 8,
      color: "secondary",
    },
    {
      id: "troubleshooting",
      title: "Troubleshooting",
      description: "Common issues, error codes, and problem resolution",
      icon: <AlertCircle className="w-8 h-8 text-destructive" />,
      articles: 22,
      color: "destructive",
    },
  ];

  const popularArticles = [
    {
      title: "Setting up your first EV charging project",
      category: "Getting Started",
      readTime: "5 min read",
      views: "2.1k views",
    },
    {
      title: "Understanding AS/NZS 3000 compliance requirements",
      category: "Compliance",
      readTime: "8 min read",
      views: "1.8k views",
    },
    {
      title: "Configuring supplier API integrations",
      category: "Integrations",
      readTime: "12 min read",
      views: "1.5k views",
    },
    {
      title: "Creating accurate cost estimates for EV infrastructure",
      category: "Quoting & Pricing",
      readTime: "6 min read",
      views: "1.3k views",
    },
    {
      title: "Managing multi-charger commercial installations",
      category: "Project Planning",
      readTime: "10 min read",
      views: "1.1k views",
    },
  ];

  const supportOptions = [
    {
      title: "Live Chat",
      description: "Get instant help from our support team",
      icon: <MessageCircle className="w-6 h-6" />,
      availability: "Mon-Fri 9AM-6PM AEST",
      action: "Start Chat",
      variant: "default" as const,
    },
    {
      title: "Phone Support",
      description: "Speak directly with our technical experts",
      icon: <Phone className="w-6 h-6" />,
      availability: "1800 CHARGE (1800 242 743)",
      action: "Call Now",
      variant: "outline" as const,
    },
    {
      title: "Email Support",
      description: "Send us a detailed message for complex issues",
      icon: <Mail className="w-6 h-6" />,
      availability: "Response within 24 hours",
      action: "Send Email",
      variant: "outline" as const,
    },
  ];

  const resources = [
    {
      title: "Video Tutorials",
      description: "Step-by-step video guides for all platform features",
      icon: <Video className="w-6 h-6 text-primary" />,
      count: "45+ videos",
      link: "/training",
    },
    {
      title: "API Documentation",
      description: "Complete reference for developers and integrations",
      icon: <FileText className="w-6 h-6 text-secondary" />,
      count: "Full reference",
      link: "#api-docs",
    },
    {
      title: "Compliance Guide",
      description: "Australian standards and regulatory requirements",
      icon: <CheckCircle2 className="w-6 h-6 text-accent" />,
      count: "Updated monthly",
      link: "/compliance",
    },
    {
      title: "Community Forum",
      description: "Connect with other electrical contractors",
      icon: <Users className="w-6 h-6 text-primary" />,
      count: "500+ members",
      link: "#forum",
    },
  ];

  const quickLinks = [
    { title: "Account Setup", link: "#setup" },
    { title: "Billing & Payments", link: "#billing" },
    { title: "User Management", link: "#users" },
    { title: "Data Export", link: "#export" },
    { title: "Security Settings", link: "#security" },
    { title: "Mobile App", link: "#mobile" },
  ];

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
            </nav>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link to="/register">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/10 to-secondary/10">
          <div className="container mx-auto text-center max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Help Centre</h1>
            <p className="text-xl text-muted-foreground mb-8">
              Find answers, get support, and learn how to maximize your EV
              infrastructure projects with ChargeSource.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto mb-8">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="text"
                placeholder="Search for help articles, guides, and tutorials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-3 text-lg"
              />
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">150+</div>
                <div className="text-sm text-muted-foreground">
                  Help Articles
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary">45+</div>
                <div className="text-sm text-muted-foreground">
                  Video Tutorials
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">24/7</div>
                <div className="text-sm text-muted-foreground">
                  Support Access
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">500+</div>
                <div className="text-sm text-muted-foreground">
                  Community Members
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Help Categories */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Browse by Category</h2>
              <p className="text-muted-foreground text-lg">
                Find the information you need, organized by topic
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <Card
                  key={category.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      {category.icon}
                      <div className="flex-1">
                        <CardTitle className="text-xl">
                          {category.title}
                        </CardTitle>
                        <Badge variant="secondary" className="mt-1">
                          {category.articles} articles
                        </Badge>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Popular Articles */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/50">
          <div className="container mx-auto">
            <div className="flex flex-col lg:flex-row gap-12">
              {/* Popular Articles */}
              <div className="lg:w-2/3">
                <h2 className="text-2xl font-bold mb-6">Popular Articles</h2>
                <div className="space-y-4">
                  {popularArticles.map((article) => (
                    <Card
                      key={article.title}
                      className="hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-2 hover:text-primary">
                              {article.title}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <Badge variant="outline">
                                {article.category}
                              </Badge>
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {article.readTime}
                              </div>
                              <span>{article.views}</span>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Quick Links Sidebar */}
              <div className="lg:w-1/3">
                <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
                <Card>
                  <CardContent className="p-4">
                    <ul className="space-y-3">
                      {quickLinks.map((link) => (
                        <li key={link.title}>
                          <a
                            href={link.link}
                            className="flex items-center justify-between text-sm hover:text-primary"
                          >
                            {link.title}
                            <ChevronRight className="w-4 h-4" />
                          </a>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-lg">Need More Help?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Can't find what you're looking for? Our support team is
                      here to help.
                    </p>
                    <Button className="w-full" asChild>
                      <Link to="/contact">Contact Support</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Support Options */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Get Support</h2>
              <p className="text-muted-foreground text-lg">
                Choose the support option that works best for you
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {supportOptions.map((option) => (
                <Card key={option.title} className="text-center">
                  <CardHeader>
                    <div className="flex justify-center mb-4">
                      {option.icon}
                    </div>
                    <CardTitle>{option.title}</CardTitle>
                    <CardDescription>{option.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {option.availability}
                    </p>
                    <Button variant={option.variant} className="w-full">
                      {option.action}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Resources */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/50">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Additional Resources</h2>
              <p className="text-muted-foreground text-lg">
                Explore more ways to learn and get the most out of ChargeSource
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {resources.map((resource, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                      {resource.icon}
                    </div>
                    <CardTitle className="text-lg">{resource.title}</CardTitle>
                    <CardDescription>{resource.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <Badge variant="outline" className="mb-4">
                      {resource.count}
                    </Badge>
                    <div>
                      <Button variant="outline" asChild className="w-full">
                        <Link to={resource.link}>
                          Explore
                          <ExternalLink className="ml-2 w-4 h-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Download Resources */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto">
            <Card className="bg-gradient-to-r from-primary to-secondary text-white">
              <CardContent className="p-12 text-center">
                <Download className="w-12 h-12 mx-auto mb-6" />
                <h3 className="text-3xl font-bold mb-4">
                  Download Our Complete Guide
                </h3>
                <p className="text-xl mb-8 text-primary-foreground/90 max-w-2xl mx-auto">
                  Get the comprehensive "EV Infrastructure Planning Guide for
                  Australian Contractors" - a 50-page resource covering
                  everything from site assessment to project completion.
                </p>
                <Button size="lg" variant="secondary" className="text-white">
                  Download Free Guide
                  <Download className="ml-2 w-5 h-5" />
                </Button>
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
                  <Link to="/compliance" className="hover:text-foreground">
                    Compliance
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
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#api" className="hover:text-foreground">
                    API Documentation
                  </a>
                </li>
                <li>
                  <a href="#downloads" className="hover:text-foreground">
                    Downloads
                  </a>
                </li>
                <li>
                  <a href="#forum" className="hover:text-foreground">
                    Community Forum
                  </a>
                </li>
                <li>
                  <a href="#status" className="hover:text-foreground">
                    System Status
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>1800 CHARGE (242 743)</li>
                <li>support@chargesource.com.au</li>
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
