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
  ArrowLeft,
  CheckCircle,
  Zap,
  Battery,
  Car,
  Home,
  Factory,
  MapPin,
  Shield,
  Gauge,
  Package,
  Settings,
  Star,
  ArrowRight,
  DollarSign,
  Clock,
  Users,
  Award,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";

const Products = () => {
  const productCategories = [
    {
      icon: Home,
      title: "Residential EV Chargers",
      description:
        "Complete range of home EV charging solutions for Australian households",
      products: [
        "AC Wallbox Chargers (7.4kW - 22kW)",
        "Smart Home Integration",
        "Weatherproof Outdoor Units",
        "Type 2 & Type 1 Connectors",
        "Load Management Systems",
      ],
      badge: "Most Popular",
      badgeVariant: "default" as const,
    },
    {
      icon: Factory,
      title: "Commercial EV Chargers",
      description:
        "High-performance charging infrastructure for businesses and fleet operators",
      products: [
        "DC Fast Chargers (50kW - 350kW)",
        "Multi-Port AC Charging Stations",
        "Fleet Management Solutions",
        "Payment & Access Control",
        "Energy Management Systems",
      ],
      badge: "Enterprise",
      badgeVariant: "secondary" as const,
    },
    {
      icon: Car,
      title: "Public Charging Infrastructure",
      description:
        "Scalable solutions for public charging networks and destinations",
      products: [
        "Ultra-Fast DC Chargers",
        "Destination Charging Solutions",
        "Highway Corridor Systems",
        "Network Management Software",
        "Revenue Management Tools",
      ],
      badge: "High Capacity",
      badgeVariant: "destructive" as const,
    },
  ];

  const featuredProducts = [
    {
      name: "EVBox Elvi",
      category: "Residential",
      power: "11kW / 22kW",
      price: "From $1,299",
      features: ["Smart connectivity", "Load balancing", "Weather resistant"],
      image: "🏠",
      popular: true,
    },
    {
      name: "ABB Terra AC",
      category: "Commercial",
      power: "7.4kW - 22kW",
      price: "From $2,499",
      features: ["Multi-port charging", "RFID access", "Fleet management"],
      image: "🏢",
      popular: false,
    },
    {
      name: "Tritium PKM150",
      category: "Public DC Fast",
      power: "50kW - 150kW",
      price: "From $24,999",
      features: ["CCS & CHAdeMO", "Payment terminal", "Remote monitoring"],
      image: "⚡",
      popular: false,
    },
    {
      name: "Tesla Wall Connector",
      category: "Residential",
      power: "11.5kW",
      price: "From $899",
      features: ["Tesla integration", "Wi-Fi enabled", "Mobile app control"],
      image: "🔌",
      popular: true,
    },
  ];

  const accessories = [
    {
      name: "Installation Accessories",
      items: [
        "Mounting pedestals",
        "Cable management",
        "Ground anchors",
        "Signage",
      ],
    },
    {
      name: "Safety Equipment",
      items: [
        "Emergency stops",
        "Earth leakage protection",
        "Surge protection",
        "Isolation switches",
      ],
    },
    {
      name: "Smart Features",
      items: [
        "Load management",
        "Solar integration",
        "Time-of-use scheduling",
        "Remote monitoring",
      ],
    },
    {
      name: "Compliance & Testing",
      items: [
        "AS/NZS certification",
        "Installation testing",
        "Commissioning",
        "Compliance reports",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Link>
            </Button>
            <Logo size="lg" />
          </div>
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
              <Link to="/login">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge variant="secondary" className="mb-4">
            🇦🇺 AS/NZS 3000 Certified Products
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Complete Range of{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              EV Charging
            </span>{" "}
            Solutions
          </h1>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            From residential wall boxes to commercial fast chargers, discover
            our comprehensive range of EV charging products designed for
            Australian conditions and standards.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="text-lg px-8" asChild>
              <Link to="/catalogue">Browse Catalogue</Link>
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8">
              Download Brochure
            </Button>
          </div>
        </div>
      </section>

      {/* Product Categories */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Product Categories
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose from our comprehensive range of EV charging solutions, each
              designed to meet specific installation requirements and use cases.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {productCategories.map((category, index) => (
              <Card
                key={index}
                className="h-full hover:shadow-lg transition-shadow border-border/50 relative"
              >
                {category.badge && (
                  <div className="absolute -top-3 left-6">
                    <Badge variant={category.badgeVariant}>
                      {category.badge}
                    </Badge>
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <category.icon className="w-8 h-8 text-primary" />
                    <CardTitle className="text-xl">{category.title}</CardTitle>
                  </div>
                  <CardDescription className="text-base leading-relaxed">
                    {category.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {category.products.map((product, productIndex) => (
                      <li
                        key={productIndex}
                        className="flex items-center gap-2 text-sm"
                      >
                        <CheckCircle className="w-4 h-4 text-secondary" />
                        {product}
                      </li>
                    ))}
                  </ul>
                  <Button variant="outline" className="w-full">
                    View Products
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Featured Products
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our most popular and reliable EV charging solutions, trusted by
              Australian electrical contractors nationwide.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {featuredProducts.map((product, index) => (
              <Card
                key={index}
                className={`h-full hover:shadow-lg transition-shadow relative ${
                  product.popular ? "border-primary/50" : "border-border/50"
                }`}
              >
                {product.popular && (
                  <div className="absolute -top-3 right-6">
                    <Badge className="bg-primary">
                      <Star className="w-3 h-3 mr-1" />
                      Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <div className="text-4xl mb-2">{product.image}</div>
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <CardDescription>
                    {product.category} • {product.power}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-4">
                    <div className="text-2xl font-bold text-primary">
                      {product.price}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      + Installation
                    </div>
                  </div>
                  <ul className="space-y-1 mb-4">
                    {product.features.map((feature, featureIndex) => (
                      <li
                        key={featureIndex}
                        className="flex items-center gap-2 text-xs"
                      >
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={product.popular ? "default" : "outline"}
                    size="sm"
                    className="w-full"
                  >
                    Get Quote
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Accessories & Services */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Accessories & Services
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Complete your EV charging installation with our comprehensive
              range of accessories and professional services.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {accessories.map((accessory, index) => (
              <Card key={index} className="h-full border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">{accessory.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {accessory.items.map((item, itemIndex) => (
                      <li
                        key={itemIndex}
                        className="flex items-center gap-2 text-sm"
                      >
                        <Package className="w-3 h-3 text-accent" />
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

      {/* Why Choose Our Products */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose Our Products?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Every product in our range is carefully selected for Australian
              conditions and backed by comprehensive support.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">AS/NZS Certified</h3>
              <p className="text-sm text-muted-foreground">
                All products meet Australian and New Zealand electrical
                standards
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Premium Brands</h3>
              <p className="text-sm text-muted-foreground">
                Partner with industry leaders like ABB, Tesla, and EVBox
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-accent" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Expert Support</h3>
              <p className="text-sm text-muted-foreground">
                Technical support and training from our specialist team
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Fast Delivery</h3>
              <p className="text-sm text-muted-foreground">
                Quick delivery Australia-wide with real-time tracking
              </p>
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
                Ready to Explore Our Products?
              </h3>
              <p className="text-xl mb-8 text-primary-foreground/90 max-w-2xl mx-auto">
                Browse our complete catalogue or speak with our specialists to
                find the perfect EV charging solution for your project.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  variant="secondary"
                  className="text-lg px-8"
                  asChild
                >
                  <Link to="/catalogue">
                    Browse Catalogue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 bg-white/10 border-white/20 text-white hover:bg-white/20"
                  asChild
                >
                  <Link to="/contact">Contact Specialist</Link>
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
                Comprehensive EV charging solutions for Australian electrical
                contractors.
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                Australia-wide delivery
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Products</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    to="/products"
                    className="hover:text-primary transition-colors"
                  >
                    Residential Chargers
                  </Link>
                </li>
                <li>
                  <Link
                    to="/products"
                    className="hover:text-primary transition-colors"
                  >
                    Commercial Chargers
                  </Link>
                </li>
                <li>
                  <Link
                    to="/products"
                    className="hover:text-primary transition-colors"
                  >
                    DC Fast Chargers
                  </Link>
                </li>
                <li>
                  <Link
                    to="/products"
                    className="hover:text-primary transition-colors"
                  >
                    Accessories
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
                    Installation Guides
                  </Link>
                </li>
                <li>
                  <Link
                    to="/help"
                    className="hover:text-primary transition-colors"
                  >
                    Technical Support
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
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="hover:text-primary transition-colors"
                  >
                    Contact
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
                    to="/news"
                    className="hover:text-primary transition-colors"
                  >
                    News
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
              <span>🇦🇺 Australian Standards</span>
              <span>•</span>
              <span>AS/NZS 3000 Certified</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Products;
