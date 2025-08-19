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
  ArrowRight,
  Info,
  Calendar,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";

export default function HelpCentrePublic() {
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    {
      id: "getting-started",
      title: "Getting Started",
      description:
        "Everything you need to know to begin your EV infrastructure journey",
      icon: <Zap className="w-8 h-8 text-primary" />,
      articles: 12,
    },
    {
      id: "project-planning",
      title: "Project Planning",
      description:
        "Site assessment, compliance checks, and project setup guidance",
      icon: <Calculator className="w-8 h-8 text-secondary" />,
      articles: 18,
    },
    {
      id: "quoting-pricing",
      title: "Quoting & Pricing",
      description: "CPQ system, cost calculations, and proposal generation",
      icon: <FileText className="w-8 h-8 text-accent" />,
      articles: 15,
    },
    {
      id: "procurement",
      title: "Procurement & Orders",
      description:
        "Supplier integration, inventory management, and order processing",
      icon: <Package className="w-8 h-8 text-primary" />,
      articles: 10,
    },
    {
      id: "integrations",
      title: "Integrations",
      description: "Connect with MYOB, Xero, CRM systems, and other tools",
      icon: <Settings className="w-8 h-8 text-secondary" />,
      articles: 8,
    },
    {
      id: "troubleshooting",
      title: "Troubleshooting",
      description: "Common issues, error codes, and problem resolution",
      icon: <AlertCircle className="w-8 h-8 text-destructive" />,
      articles: 22,
    },
  ];

  const popularTopics = [
    {
      title: "Setting up your first EV charging project",
      category: "Getting Started",
      description:
        "Learn the basics of planning and implementing EV charging infrastructure projects.",
    },
    {
      title: "Understanding compliance requirements",
      category: "Compliance",
      description:
        "Overview of Australian electrical standards and regulatory requirements.",
    },
    {
      title: "Supplier integration overview",
      category: "Integrations",
      description:
        "How ChargeSource connects with major EV equipment suppliers.",
    },
    {
      title: "Cost estimation fundamentals",
      category: "Quoting & Pricing",
      description:
        "Basic principles for creating accurate EV infrastructure cost estimates.",
    },
    {
      title: "Commercial installation planning",
      category: "Project Planning",
      description:
        "Key considerations for multi-charger commercial installations.",
    },
  ];

  const supportOptions = [
    {
      title: "Live Chat",
      description: "Get instant help from our support team",
      icon: <MessageCircle className="w-6 h-6" />,
      availability: "Mon-Fri 9AM-6PM AEST",
    },
    {
      title: "Phone Support",
      description: "Speak directly with our technical experts",
      icon: <Phone className="w-6 h-6" />,
      availability: "1800 CHARGE (1800 242 743)",
    },
    {
      title: "Email Support",
      description: "Send us a detailed message for complex issues",
      icon: <Mail className="w-6 h-6" />,
      availability: "Response within 24 hours",
    },
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
                to="/training-public"
                className="text-muted-foreground hover:text-foreground"
              >
                Training
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
          <div className="container mx-auto text-center max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Help Centre</h1>
            <p className="text-xl text-muted-foreground mb-8">
              Learn about ChargeSource and how our platform can help electrical
              contractors succeed in the EV infrastructure market.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto mb-8">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="text"
                placeholder="Search topics and features..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-3 text-lg"
              />
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">150+</div>
                <div className="text-sm text-muted-foreground">Help Topics</div>
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
                  Happy Customers
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
                Explore our platform features and capabilities
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <Card
                  key={category.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      {category.icon}
                      <div className="flex-1">
                        <CardTitle className="text-xl">
                          {category.title}
                        </CardTitle>
                        <Badge variant="secondary" className="mt-1">
                          {category.articles} topics
                        </Badge>
                      </div>
                    </div>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full" asChild>
                      <Link to="/register">
                        Learn More
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Popular Topics */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/50">
          <div className="container mx-auto">
            <div className="flex flex-col lg:flex-row gap-12">
              {/* Popular Topics */}
              <div className="lg:w-2/3">
                <h2 className="text-2xl font-bold mb-6">Popular Topics</h2>
                <div className="space-y-4">
                  {popularTopics.map((topic, index) => (
                    <Card
                      key={index}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-2">
                              {topic.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-3">
                              {topic.description}
                            </p>
                            <Badge variant="outline">{topic.category}</Badge>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <Link to="/register">View</Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Get Started Sidebar */}
              <div className="lg:w-1/3">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Ready to Get Started?
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Sign up for ChargeSource to access our full help center,
                      training materials, and expert support.
                    </p>
                    <div className="space-y-3">
                      <Button className="w-full" asChild>
                        <Link to="/register">Start Free Trial</Link>
                      </Button>
                      <Button variant="outline" className="w-full" asChild>
                        <Link to="/contact">Contact Sales</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Why Choose ChargeSource?
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 text-sm">
                      <li className="flex items-start">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        Complete EV infrastructure platform
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        Australian compliance built-in
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        Expert training and support
                      </li>
                      <li className="flex items-start">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        Proven by 500+ contractors
                      </li>
                    </ul>
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
                Multiple ways to get the help you need
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {supportOptions.map((option, index) => (
                <Card key={index} className="text-center">
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
                    <Button variant="outline" className="w-full" asChild>
                      <Link to="/contact">Contact Us</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/50">
          <div className="container mx-auto text-center">
            <Card className="bg-gradient-to-r from-primary to-secondary text-white">
              <CardContent className="p-12">
                <BookOpen className="w-12 h-12 mx-auto mb-6" />
                <h3 className="text-3xl font-bold mb-4">
                  Access the Complete Help Centre
                </h3>
                <p className="text-xl mb-8 text-primary-foreground/90 max-w-2xl mx-auto">
                  Sign up for ChargeSource to access our comprehensive help
                  center with detailed guides, training materials, compliance
                  tools, and expert support.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                    asChild
                  >
                    <Link to="/register">
                      Start Free Trial
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    className="bg-secondary hover:bg-secondary/90 text-white font-semibold px-8 py-4 text-lg shadow-md hover:shadow-lg transition-all duration-200"
                    asChild
                  >
                    <Link to="/contact">
                      Schedule Demo
                      <Calendar className="ml-2 w-5 h-5" />
                    </Link>
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
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link to="/features" className="hover:text-foreground">
                    Features
                  </Link>
                </li>
                <li>
                  <Link to="/pricing" className="hover:text-foreground">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link to="/integrations" className="hover:text-foreground">
                    Integrations
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    to="/help-centre-public"
                    className="hover:text-foreground"
                  >
                    Help Centre
                  </Link>
                </li>
                <li>
                  <Link to="/training-public" className="hover:text-foreground">
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
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link to="/contact" className="hover:text-foreground">
                    About
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-foreground">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-foreground">
                    Terms
                  </Link>
                </li>
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
