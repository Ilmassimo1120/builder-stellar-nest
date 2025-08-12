import React, { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  HelpCircle,
  Building,
  Users,
  Zap,
  CheckCircle,
  ArrowRight,
  Globe,
  Calendar,
  Star,
  Headphones,
  Shield,
  BookOpen,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";

const Contact = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    inquiryType: "",
    projectType: "",
    message: "",
    acceptTerms: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsSubmitting(false);
    setSubmitted(true);
  };

  const contactInfo = [
    {
      icon: Phone,
      title: "Phone Support",
      primary: "+61 1800 CHARGE",
      secondary: "+61 1800 242 743",
      description: "Mon-Fri 8AM-6PM AEST",
      action: "Call Now",
      href: "tel:+611800242743",
    },
    {
      icon: Mail,
      title: "Email Support",
      primary: "support@chargesource.com.au",
      secondary: "sales@chargesource.com.au",
      description: "24-hour response time",
      action: "Send Email",
      href: "mailto:support@chargesource.com.au",
    },
    {
      icon: MapPin,
      title: "Head Office",
      primary: "Level 8, 123 Collins Street",
      secondary: "Melbourne, VIC 3000",
      description: "Australia",
      action: "Get Directions",
      href: "https://maps.google.com",
    },
    {
      icon: MessageSquare,
      title: "Live Chat",
      primary: "Instant Support",
      secondary: "Available 24/7",
      description: "Average response: 2 minutes",
      action: "Start Chat",
      href: "#",
    },
  ];

  const inquiryTypes = [
    "General Inquiry",
    "Sales & Pricing",
    "Technical Support",
    "Partnership Opportunities",
    "Demo Request",
    "Training & Education",
    "Billing & Accounts",
    "Feature Request",
  ];

  const projectTypes = [
    "Residential Installation",
    "Commercial Building",
    "Industrial Facility",
    "Fleet Charging",
    "Public Infrastructure",
    "Multi-Unit Dwelling",
    "Workplace Charging",
    "Other",
  ];

  const supportResources = [
    {
      icon: BookOpen,
      title: "Documentation",
      description: "Comprehensive guides and tutorials",
      link: "/docs",
    },
    {
      icon: HelpCircle,
      title: "FAQ",
      description: "Answers to common questions",
      link: "/faq",
    },
    {
      icon: Calendar,
      title: "Book a Demo",
      description: "Schedule a personalized demo",
      link: "/demo",
    },
    {
      icon: Users,
      title: "Community",
      description: "Connect with other users",
      link: "/community",
    },
  ];

  const offices = [
    {
      city: "Melbourne",
      address: "Level 8, 123 Collins Street",
      postal: "Melbourne, VIC 3000",
      phone: "+61 3 9000 0000",
      isPrimary: true,
    },
    {
      city: "Sydney",
      address: "Suite 45, 456 George Street",
      postal: "Sydney, NSW 2000",
      phone: "+61 2 8000 0000",
      isPrimary: false,
    },
    {
      city: "Brisbane",
      address: "Level 12, 789 Queen Street",
      postal: "Brisbane, QLD 4000",
      phone: "+61 7 3000 0000",
      isPrimary: false,
    },
  ];

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-auto text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl">Thank You!</CardTitle>
            <CardDescription>
              We've received your message and will get back to you within 24
              hours.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Reference: #
              {Math.random().toString(36).substring(7).toUpperCase()}
            </p>
            <div className="flex gap-3">
              <Button className="flex-1" asChild>
                <Link to="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSubmitted(false);
                  setFormData({
                    firstName: "",
                    lastName: "",
                    email: "",
                    phone: "",
                    company: "",
                    inquiryType: "",
                    projectType: "",
                    message: "",
                    acceptTerms: false,
                  });
                }}
              >
                Send Another
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            <Headphones className="w-3 h-3 mr-1" />
            24/7 Support Available
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Get in Touch
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Ready to transform your EV infrastructure business? Our team of
            experts is here to help you get started with ChargeSource.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg">
              <Phone className="w-4 h-4 mr-2" />
              Call +61 1800 CHARGE
            </Button>
            <Button size="lg" variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              Book a Demo
            </Button>
          </div>
        </section>

        {/* Contact Methods */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How Can We Help?</h2>
            <p className="text-lg text-muted-foreground">
              Choose the best way to reach our team
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {contactInfo.map((contact, index) => (
              <Card
                key={index}
                className="text-center hover:shadow-lg transition-shadow group"
              >
                <CardHeader>
                  <div className="mx-auto p-3 bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <contact.icon className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{contact.title}</CardTitle>
                  <div className="space-y-1">
                    <p className="font-medium">{contact.primary}</p>
                    <p className="text-sm text-muted-foreground">
                      {contact.secondary}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {contact.description}
                    </p>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" asChild>
                    <a href={contact.href}>
                      {contact.action}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Contact Form & Office Locations */}
        <section className="mb-16">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Send className="w-5 h-5" />
                  <span>Send us a Message</span>
                </CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you within 24
                  hours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) =>
                          handleInputChange("firstName", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) =>
                          handleInputChange("lastName", e.target.value)
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          handleInputChange("phone", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">Company Name</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) =>
                        handleInputChange("company", e.target.value)
                      }
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="inquiryType">Inquiry Type *</Label>
                      <Select
                        value={formData.inquiryType}
                        onValueChange={(value) =>
                          handleInputChange("inquiryType", value)
                        }
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select inquiry type" />
                        </SelectTrigger>
                        <SelectContent>
                          {inquiryTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="projectType">Project Type</Label>
                      <Select
                        value={formData.projectType}
                        onValueChange={(value) =>
                          handleInputChange("projectType", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select project type" />
                        </SelectTrigger>
                        <SelectContent>
                          {projectTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us about your project or how we can help..."
                      value={formData.message}
                      onChange={(e) =>
                        handleInputChange("message", e.target.value)
                      }
                      rows={5}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Office Locations */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building className="w-5 h-5" />
                    <span>Our Offices</span>
                  </CardTitle>
                  <CardDescription>
                    Visit us at one of our locations across Australia
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {offices.map((office, index) => (
                    <div
                      key={index}
                      className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold flex items-center space-x-2">
                          <span>{office.city}</span>
                          {office.isPrimary && (
                            <Badge variant="secondary" className="text-xs">
                              <Star className="w-3 h-3 mr-1" />
                              HQ
                            </Badge>
                          )}
                        </h3>
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p>{office.address}</p>
                        <p>{office.postal}</p>
                        <p className="flex items-center space-x-1">
                          <Phone className="w-3 h-3" />
                          <span>{office.phone}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Support Resources */}
              <Card>
                <CardHeader>
                  <CardTitle>Self-Service Resources</CardTitle>
                  <CardDescription>
                    Find answers and get help instantly
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {supportResources.map((resource, idx) => (
                    <Link
                      key={idx}
                      to={resource.link}
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted transition-colors group"
                    >
                      <resource.icon className="w-5 h-5 text-primary" />
                      <div className="flex-1">
                        <h4 className="font-medium text-sm group-hover:text-primary transition-colors">
                          {resource.title}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {resource.description}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </Link>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Business Hours */}
        <section className="mb-16">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>Business Hours</span>
              </CardTitle>
              <CardDescription>
                Our support team is available during these hours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Phone Support</h3>
                  <div className="space-y-1 text-sm">
                    <p>Monday - Friday: 8:00 AM - 6:00 PM</p>
                    <p>Saturday: 9:00 AM - 2:00 PM</p>
                    <p>Sunday: Closed</p>
                    <p className="text-muted-foreground">(AEST)</p>
                  </div>
                </div>
                <div className="text-center p-4 border rounded-lg bg-primary/5">
                  <h3 className="font-semibold mb-2">Live Chat</h3>
                  <div className="space-y-1 text-sm">
                    <p className="font-medium text-primary">24/7 Available</p>
                    <p>Instant responses</p>
                    <p>AI-powered assistance</p>
                    <p className="text-muted-foreground">
                      Average response: 2 min
                    </p>
                  </div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Email Support</h3>
                  <div className="space-y-1 text-sm">
                    <p>24-hour response time</p>
                    <p>Detailed technical help</p>
                    <p>Account management</p>
                    <p className="text-muted-foreground">Always available</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Emergency Support */}
        <section className="mb-16">
          <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
              <CardTitle className="text-orange-900 dark:text-orange-100">
                Emergency Support
              </CardTitle>
              <CardDescription className="text-orange-700 dark:text-orange-300">
                Critical system issues? We're here to help 24/7
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="mb-4 text-orange-800 dark:text-orange-200">
                For urgent technical issues affecting your operations, contact
                our emergency support line:
              </p>
              <Button
                size="lg"
                className="bg-orange-600 hover:bg-orange-700 text-white"
                asChild
              >
                <a href="tel:+611800911911">
                  <Phone className="w-4 h-4 mr-2" />
                  Emergency: +61 1800 911 911
                </a>
              </Button>
              <p className="mt-4 text-sm text-orange-600 dark:text-orange-400">
                Available 24/7 for critical system failures
              </p>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <Logo size="md" />
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <Link
                to="/features"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Features
              </Link>
              <Link
                to="/integrations"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Integrations
              </Link>
              <Link
                to="/pricing"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Pricing
              </Link>
              <Link
                to="/login"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Contact;
