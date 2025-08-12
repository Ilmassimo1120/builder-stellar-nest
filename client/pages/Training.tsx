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
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import {
  Play,
  BookOpen,
  Award,
  Users,
  Clock,
  Star,
  CheckCircle2,
  Zap,
  Calculator,
  Package,
  Settings,
  Shield,
  Download,
  ExternalLink,
  Calendar,
  User,
  ArrowRight,
  Video,
  FileText,
  Headphones,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";

export default function Training() {
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);

  const learningPaths = [
    {
      id: "beginner",
      title: "EV Infrastructure Fundamentals",
      description: "Perfect for contractors new to EV charging infrastructure",
      level: "Beginner",
      duration: "12 hours",
      courses: 6,
      certification: true,
      color: "primary",
      progress: 0,
      features: [
        "Introduction to EV charging technology",
        "Understanding charging standards (Type 2, CCS, CHAdeMO)",
        "Basic electrical requirements",
        "Safety considerations",
        "Market overview and opportunities",
        "Customer consultation basics",
      ],
    },
    {
      id: "intermediate",
      title: "Project Planning & Compliance",
      description:
        "Advanced planning, compliance, and project management skills",
      level: "Intermediate",
      duration: "18 hours",
      courses: 8,
      certification: true,
      color: "secondary",
      progress: 45,
      features: [
        "AS/NZS 3000 compliance requirements",
        "Site assessment and grid capacity analysis",
        "Load calculations and electrical design",
        "Permit and approval processes",
        "Risk assessment and management",
        "Project timeline and resource planning",
      ],
    },
    {
      id: "advanced",
      title: "Commercial & Industrial Solutions",
      description:
        "Complex installations, fleet management, and enterprise solutions",
      level: "Advanced",
      duration: "24 hours",
      courses: 10,
      certification: true,
      color: "accent",
      progress: 20,
      features: [
        "High-power DC fast charging systems",
        "Load management and smart charging",
        "Fleet depot design and implementation",
        "Grid integration and demand response",
        "Energy storage integration",
        "Maintenance and troubleshooting",
      ],
    },
    {
      id: "business",
      title: "Business Development & Growth",
      description:
        "Growing your EV contracting business and maximizing profitability",
      level: "Business",
      duration: "15 hours",
      courses: 7,
      certification: false,
      color: "primary",
      progress: 0,
      features: [
        "Market analysis and customer targeting",
        "Pricing strategies and profit optimization",
        "Marketing and lead generation",
        "Partnership development",
        "Financial planning and cash flow",
        "Scaling operations and team building",
      ],
    },
  ];

  const featuredCourses = [
    {
      id: "site-assessment",
      title: "Comprehensive Site Assessment for EV Charging",
      instructor: "Sarah Mitchell, Licensed Electrician",
      duration: "2.5 hours",
      rating: 4.9,
      students: 1247,
      level: "Intermediate",
      type: "Video Course",
      thumbnail: "/api/placeholder/400/225",
      description:
        "Learn to conduct thorough site assessments, identify potential challenges, and develop solutions for EV charging installations.",
      modules: [
        "Electrical system evaluation",
        "Physical site constraints",
        "Grid capacity assessment",
        "Cost estimation techniques",
      ],
    },
    {
      id: "compliance-mastery",
      title: "AS/NZS 3000 Compliance for EV Infrastructure",
      instructor: "David Chen, Compliance Specialist",
      duration: "3 hours",
      rating: 4.8,
      students: 892,
      level: "Intermediate",
      type: "Interactive Course",
      thumbnail: "/api/placeholder/400/225",
      description:
        "Master Australian electrical standards and ensure all your EV installations meet regulatory requirements.",
      modules: [
        "Standard requirements overview",
        "Inspection and testing procedures",
        "Documentation and certification",
        "Common compliance issues",
      ],
    },
    {
      id: "cpq-mastery",
      title: "Mastering the ChargeSource CPQ System",
      instructor: "Lisa Wang, Product Specialist",
      duration: "1.5 hours",
      rating: 4.9,
      students: 2156,
      level: "Beginner",
      type: "Platform Training",
      thumbnail: "/api/placeholder/400/225",
      description:
        "Get the most out of ChargeSource's Configure, Price, Quote system to create accurate estimates and win more projects.",
      modules: [
        "CPQ system overview",
        "Product configuration",
        "Pricing strategies",
        "Proposal generation",
      ],
    },
  ];

  const certifications = [
    {
      title: "Certified EV Infrastructure Specialist",
      description:
        "Demonstrate your expertise in EV charging infrastructure planning and installation",
      requirements: [
        "Complete Fundamentals path",
        "Pass final exam (80%+)",
        "Submit 3 project case studies",
      ],
      badge: "CEVIS",
      validity: "2 years",
      recognition: "Industry recognized",
      color: "primary",
    },
    {
      title: "Advanced EV Project Manager",
      description:
        "Advanced certification for managing complex EV infrastructure projects",
      requirements: [
        "Complete Project Planning path",
        "5+ years experience",
        "Pass comprehensive exam",
      ],
      badge: "AEPM",
      validity: "3 years",
      recognition: "Professional certification",
      color: "secondary",
    },
    {
      title: "ChargeSource Platform Expert",
      description: "Master certification for ChargeSource platform proficiency",
      requirements: [
        "Complete all platform courses",
        "Pass practical assessment",
        "Mentor 2 new users",
      ],
      badge: "CSPE",
      validity: "1 year",
      recognition: "Platform certification",
      color: "accent",
    },
  ];

  const upcomingWebinars = [
    {
      title: "EV Market Trends 2024: What Contractors Need to Know",
      date: "March 15, 2024",
      time: "2:00 PM AEST",
      presenter: "Industry Expert Panel",
      registered: 342,
      spots: 158,
    },
    {
      title: "Troubleshooting Common EV Charging Issues",
      date: "March 22, 2024",
      time: "10:00 AM AEST",
      presenter: "Mike Thompson, Senior Technician",
      registered: 189,
      spots: 311,
    },
    {
      title: "Maximizing Profitability in EV Projects",
      date: "March 29, 2024",
      time: "3:00 PM AEST",
      presenter: "Rachel Kim, Business Consultant",
      registered: 267,
      spots: 233,
    },
  ];

  const resources = [
    {
      title: "EV Charging Standards Reference Guide",
      type: "PDF Download",
      size: "2.4 MB",
      downloads: 3421,
      icon: <FileText className="w-6 h-6 text-primary" />,
    },
    {
      title: "Site Assessment Checklist Template",
      type: "Excel Template",
      size: "156 KB",
      downloads: 2877,
      icon: <Download className="w-6 h-6 text-secondary" />,
    },
    {
      title: "Compliance Documentation Templates",
      type: "Document Pack",
      size: "1.8 MB",
      downloads: 1954,
      icon: <Shield className="w-6 h-6 text-accent" />,
    },
    {
      title: "Project Costing Calculator",
      type: "Excel Tool",
      size: "298 KB",
      downloads: 4156,
      icon: <Calculator className="w-6 h-6 text-primary" />,
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
              <Link to="/training" className="text-foreground font-medium">
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
          <div className="container mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              EV Infrastructure Training
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Master the skills you need to succeed in the growing EV
              infrastructure market. From basics to advanced techniques, we've
              got you covered.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="#learning-paths">
                  Browse Learning Paths
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="#certifications">
                  View Certifications
                  <Award className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">500+</div>
                <div className="text-sm text-muted-foreground">
                  Students Trained
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary">45+</div>
                <div className="text-sm text-muted-foreground">
                  Training Modules
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent">98%</div>
                <div className="text-sm text-muted-foreground">
                  Completion Rate
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">4.8★</div>
                <div className="text-sm text-muted-foreground">
                  Average Rating
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Learning Paths */}
        <section id="learning-paths" className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Learning Paths</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Structured learning journeys designed to take you from beginner
                to expert in EV infrastructure
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {learningPaths.map((path) => (
                <Card key={path.id} className="h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{path.level}</Badge>
                          {path.certification && (
                            <Badge variant="secondary">
                              <Award className="w-3 h-3 mr-1" />
                              Certification
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-xl mb-2">
                          {path.title}
                        </CardTitle>
                        <CardDescription>{path.description}</CardDescription>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {path.duration}
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {path.courses} courses
                      </div>
                    </div>

                    {path.progress > 0 && (
                      <div className="mt-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{path.progress}%</span>
                        </div>
                        <Progress value={path.progress} className="h-2" />
                      </div>
                    )}
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-3 mb-6">
                      <h4 className="font-semibold text-sm">
                        What you'll learn:
                      </h4>
                      <ul className="space-y-2">
                        {path.features.slice(0, 4).map((feature, index) => (
                          <li key={index} className="flex items-start text-sm">
                            <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Button
                      className="w-full"
                      variant={path.progress > 0 ? "default" : "outline"}
                    >
                      {path.progress > 0
                        ? "Continue Learning"
                        : "Start Learning Path"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Courses */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/50">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Featured Courses</h2>
              <p className="text-muted-foreground text-lg">
                Popular courses chosen by our community of electrical
                contractors
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {featuredCourses.map((course) => (
                <Card key={course.id} className="overflow-hidden">
                  <div className="aspect-video bg-muted flex items-center justify-center">
                    <Play className="w-12 h-12 text-primary" />
                  </div>

                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">{course.level}</Badge>
                      <Badge variant="secondary">{course.type}</Badge>
                    </div>
                    <CardTitle className="text-lg leading-tight">
                      {course.title}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {course.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Instructor
                        </span>
                        <span>{course.instructor}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Duration</span>
                        <span>{course.duration}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span>{course.rating}</span>
                        </div>
                        <span className="text-muted-foreground">
                          {course.students} students
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <h4 className="font-semibold text-sm">Course modules:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {course.modules.map((module, index) => (
                          <li key={index}>• {module}</li>
                        ))}
                      </ul>
                    </div>

                    <Button className="w-full">
                      <Play className="w-4 h-4 mr-2" />
                      Start Course
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Certifications */}
        <section id="certifications" className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                Professional Certifications
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Earn industry-recognized certifications to validate your
                expertise and advance your career
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {certifications.map((cert, index) => (
                <Card key={index} className="text-center">
                  <CardHeader>
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Award className="w-10 h-10 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{cert.title}</CardTitle>
                    <CardDescription>{cert.description}</CardDescription>
                    <Badge variant="outline" className="mx-auto mt-2">
                      {cert.badge}
                    </Badge>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-4 mb-6">
                      <div>
                        <h4 className="font-semibold text-sm mb-2">
                          Requirements:
                        </h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {cert.requirements.map((req, reqIndex) => (
                            <li key={reqIndex}>• {req}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Valid for</span>
                        <span>{cert.validity}</span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Recognition
                        </span>
                        <span>{cert.recognition}</span>
                      </div>
                    </div>

                    <Button variant="outline" className="w-full">
                      Learn More
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Webinars & Events */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/50">
          <div className="container mx-auto">
            <div className="flex flex-col lg:flex-row gap-12">
              {/* Upcoming Webinars */}
              <div className="lg:w-2/3">
                <h2 className="text-2xl font-bold mb-6">Upcoming Webinars</h2>
                <div className="space-y-4">
                  {upcomingWebinars.map((webinar, index) => (
                    <Card key={index}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-2">
                              {webinar.title}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {webinar.date}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {webinar.time}
                              </div>
                              <div className="flex items-center gap-1">
                                <User className="w-4 h-4" />
                                {webinar.presenter}
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="text-green-600">
                                {webinar.registered} registered
                              </span>
                              <span className="text-muted-foreground">
                                {webinar.spots} spots left
                              </span>
                            </div>
                          </div>
                          <Button>Register Free</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Resources */}
              <div className="lg:w-1/3">
                <h3 className="text-xl font-semibold mb-6">
                  Training Resources
                </h3>
                <div className="space-y-4">
                  {resources.map((resource, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          {resource.icon}
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm mb-1">
                              {resource.title}
                            </h4>
                            <div className="text-xs text-muted-foreground mb-2">
                              {resource.type} • {resource.size}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {resource.downloads} downloads
                            </div>
                          </div>
                          <Button size="sm" variant="outline">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Need Custom Training?
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      We offer customized training programs for teams and
                      organizations.
                    </p>
                    <Button className="w-full" variant="outline" asChild>
                      <Link to="/contact">Contact Us</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto text-center">
            <Card className="bg-gradient-to-r from-primary to-secondary text-white">
              <CardContent className="p-12">
                <Video className="w-12 h-12 mx-auto mb-6" />
                <h3 className="text-3xl font-bold mb-4">
                  Start Your EV Infrastructure Journey Today
                </h3>
                <p className="text-xl mb-8 text-primary-foreground/90 max-w-2xl mx-auto">
                  Join hundreds of electrical contractors who have already
                  enhanced their skills and grown their businesses with our
                  comprehensive training programs.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="text-primary"
                  >
                    Browse All Courses
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-primary"
                  >
                    Schedule Demo
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
              <h4 className="font-semibold mb-4">Training</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link to="/training" className="hover:text-foreground">
                    Learning Paths
                  </Link>
                </li>
                <li>
                  <Link
                    to="/training#certifications"
                    className="hover:text-foreground"
                  >
                    Certifications
                  </Link>
                </li>
                <li>
                  <Link
                    to="/training#webinars"
                    className="hover:text-foreground"
                  >
                    Webinars
                  </Link>
                </li>
                <li>
                  <Link
                    to="/training#resources"
                    className="hover:text-foreground"
                  >
                    Resources
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
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>1800 TRAINING (872 464)</li>
                <li>training@chargesource.com.au</li>
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
