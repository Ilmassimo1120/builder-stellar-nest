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
  ArrowRight,
  Video,
  Play,
  Calendar,
  User,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";

export default function TrainingPublic() {
  const learningPaths = [
    {
      id: "beginner",
      title: "EV Infrastructure Fundamentals",
      description: "Perfect for contractors new to EV charging infrastructure",
      level: "Beginner",
      duration: "12 hours",
      courses: 6,
      certification: true,
      overview: [
        "Introduction to EV charging technology",
        "Understanding charging standards",
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
      overview: [
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
      overview: [
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
      overview: [
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
      title: "Comprehensive Site Assessment for EV Charging",
      instructor: "Industry Expert",
      duration: "2.5 hours",
      level: "Intermediate",
      type: "Video Course",
      description:
        "Learn to conduct thorough site assessments and identify potential challenges for EV charging installations.",
    },
    {
      title: "AS/NZS 3000 Compliance for EV Infrastructure",
      instructor: "Compliance Specialist",
      duration: "3 hours",
      level: "Intermediate",
      type: "Interactive Course",
      description:
        "Master Australian electrical standards and ensure all your EV installations meet regulatory requirements.",
    },
    {
      title: "Mastering the ChargeSource Platform",
      instructor: "Product Specialist",
      duration: "1.5 hours",
      level: "Beginner",
      type: "Platform Training",
      description:
        "Get the most out of ChargeSource's tools to create accurate estimates and manage projects effectively.",
    },
  ];

  const certifications = [
    {
      title: "Certified EV Infrastructure Specialist",
      description:
        "Demonstrate your expertise in EV charging infrastructure planning and installation",
      badge: "CEVIS",
      validity: "2 years",
      recognition: "Industry recognized",
    },
    {
      title: "Advanced EV Project Manager",
      description:
        "Advanced certification for managing complex EV infrastructure projects",
      badge: "AEPM",
      validity: "3 years",
      recognition: "Professional certification",
    },
    {
      title: "ChargeSource Platform Expert",
      description: "Master certification for ChargeSource platform proficiency",
      badge: "CSPE",
      validity: "1 year",
      recognition: "Platform certification",
    },
  ];

  const benefits = [
    {
      icon: <Award className="w-8 h-8 text-primary" />,
      title: "Industry Recognition",
      description:
        "Earn certifications recognized across the Australian EV industry",
    },
    {
      icon: <Users className="w-8 h-8 text-secondary" />,
      title: "Expert Instructors",
      description: "Learn from experienced professionals and industry leaders",
    },
    {
      icon: <Clock className="w-8 h-8 text-accent" />,
      title: "Flexible Learning",
      description: "Self-paced courses that fit around your busy schedule",
    },
    {
      icon: <CheckCircle2 className="w-8 h-8 text-primary" />,
      title: "Practical Skills",
      description:
        "Hands-on training with real-world applications and case studies",
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
                className="text-foreground font-medium"
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
          <div className="container mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              EV Infrastructure Training
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Master the skills you need to succeed in the growing EV
              infrastructure market. Professional training designed specifically
              for electrical contractors.
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
                variant="secondary"
                size="lg"
                className="bg-secondary hover:bg-secondary/90 text-white font-semibold px-8 py-4 text-lg shadow-md hover:shadow-lg transition-all duration-200"
                asChild
              >
                <Link to="/contact">Schedule Demo</Link>
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

        {/* Learning Paths Overview */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
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
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-3 mb-6">
                      <h4 className="font-semibold text-sm">
                        What you'll learn:
                      </h4>
                      <ul className="space-y-2">
                        {path.overview.slice(0, 4).map((item, index) => (
                          <li key={index} className="flex items-start text-sm">
                            <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Button className="w-full" variant="outline" asChild>
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
              {featuredCourses.map((course, index) => (
                <Card key={index} className="overflow-hidden">
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
                    </div>

                    <Button className="w-full" variant="outline" asChild>
                      <Link to="/register">Learn More</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Our Training */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                Why Choose Our Training?
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Comprehensive, practical training designed specifically for the
                Australian EV market
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-4">{benefit.icon}</div>
                  <h3 className="font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Professional Certifications */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/50">
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

                    <Button variant="outline" className="w-full" asChild>
                      <Link to="/register">Learn More</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
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
