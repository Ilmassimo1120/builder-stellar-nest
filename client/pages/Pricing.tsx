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
import { Link } from "react-router-dom";
import {
  Check,
  Star,
  Zap,
  Users,
  Building2,
  Crown,
  ArrowRight,
  Calculator,
  Package,
  Settings,
  Shield,
  Headphones,
  Clock,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">(
    "monthly",
  );

  const plans = [
    {
      id: "starter",
      name: "Starter",
      description:
        "Perfect for small electrical contractors getting started with EV infrastructure",
      icon: <Zap className="w-8 h-8 text-primary" />,
      monthlyPrice: 49,
      annualPrice: 39,
      badge: null,
      features: [
        "Up to 5 projects per month",
        "Basic project planning wizard",
        "Standard quote generation",
        "Email support",
        "Basic compliance checklists",
        "1 user account",
        "PDF exports",
        "Basic templates (5)",
      ],
      limitations: [
        "No CRM integration",
        "No real-time inventory",
        "Limited customization",
      ],
      cta: "Start Free Trial",
      ctaVariant: "outline" as const,
    },
    {
      id: "professional",
      name: "Professional",
      description:
        "For growing electrical businesses ready to scale their EV projects",
      icon: <Users className="w-8 h-8 text-secondary" />,
      monthlyPrice: 149,
      annualPrice: 119,
      badge: "Most Popular",
      features: [
        "Unlimited projects",
        "Advanced project planning wizard",
        "Smart quoting engine (CPQ)",
        "Priority email & chat support",
        "Full compliance automation",
        "Up to 10 user accounts",
        "Advanced PDF customization",
        "Premium templates (25+)",
        "Basic CRM integration",
        "Real-time inventory tracking",
        "Custom branding",
        "Analytics dashboard",
      ],
      limitations: [],
      cta: "Start Free Trial",
      ctaVariant: "default" as const,
    },
    {
      id: "enterprise",
      name: "Enterprise",
      description:
        "For established contractors managing multiple teams and complex projects",
      icon: <Building2 className="w-8 h-8 text-accent" />,
      monthlyPrice: 349,
      annualPrice: 279,
      badge: "Best Value",
      features: [
        "Everything in Professional",
        "Unlimited user accounts",
        "Advanced team collaboration",
        "Full supplier API integration",
        "One-click quote-to-order",
        "Advanced analytics & reporting",
        "MYOB/Xero/QuickBooks integration",
        "Priority phone support",
        "Custom integrations",
        "White-label options",
        "Advanced permissions",
        "API access",
        "Dedicated account manager",
      ],
      limitations: [],
      cta: "Start Free Trial",
      ctaVariant: "default" as const,
    },
    {
      id: "custom",
      name: "Custom",
      description:
        "Tailored solutions for large organizations with specific requirements",
      icon: <Crown className="w-8 h-8 text-primary" />,
      monthlyPrice: null,
      annualPrice: null,
      badge: "Enterprise",
      features: [
        "Everything in Enterprise",
        "Custom feature development",
        "On-premise deployment options",
        "24/7 dedicated support",
        "Custom training programs",
        "SLA guarantees",
        "Advanced security features",
        "Multi-region deployment",
        "Custom reporting",
        "Bulk user management",
        "Enterprise-grade backups",
        "Compliance consulting",
      ],
      limitations: [],
      cta: "Contact Sales",
      ctaVariant: "outline" as const,
    },
  ];

  const additionalFeatures = [
    {
      icon: <Calculator className="w-6 h-6 text-primary" />,
      title: "Advanced Quoting",
      description: "Dynamic pricing with real-time cost calculations",
    },
    {
      icon: <Package className="w-6 h-6 text-secondary" />,
      title: "Supplier Integration",
      description: "Direct connection to major EV equipment suppliers",
    },
    {
      icon: <Settings className="w-6 h-6 text-accent" />,
      title: "Custom Workflows",
      description: "Tailor the platform to your business processes",
    },
    {
      icon: <Shield className="w-6 h-6 text-primary" />,
      title: "Compliance Automation",
      description: "Stay compliant with AS/NZS 3000 and local regulations",
    },
  ];

  const faq = [
    {
      question: "Can I change plans at any time?",
      answer:
        "Yes, you can upgrade or downgrade your plan at any time. Changes will be prorated and reflected on your next billing cycle.",
    },
    {
      question: "What's included in the free trial?",
      answer:
        "All plans include a 14-day free trial with full access to all features. No credit card required to start.",
    },
    {
      question: "Do you offer refunds?",
      answer:
        "We offer a 30-day money-back guarantee for all annual plans if you're not completely satisfied.",
    },
    {
      question: "How does user management work?",
      answer:
        "Each plan includes a specific number of user accounts. Additional users can be added for $15/month per user.",
    },
  ];

  const getCurrentPrice = (plan: (typeof plans)[0]) => {
    if (!plan.monthlyPrice) return null;
    return billingCycle === "monthly" ? plan.monthlyPrice : plan.annualPrice;
  };

  const getSavings = (plan: (typeof plans)[0]) => {
    if (!plan.monthlyPrice || !plan.annualPrice) return null;
    const monthlyCost = plan.monthlyPrice * 12;
    const annualCost = plan.annualPrice * 12;
    const savings = monthlyCost - annualCost;
    const percentage = Math.round((savings / monthlyCost) * 100);
    return { amount: savings, percentage };
  };

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
              <Link to="/pricing" className="text-foreground font-medium">
                Pricing
              </Link>
              <Link
                to="/integrations"
                className="text-muted-foreground hover:text-foreground"
              >
                Integrations
              </Link>
              <Link
                to="/contact"
                className="text-muted-foreground hover:text-foreground"
              >
                Contact
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
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Choose the perfect plan for your electrical contracting business.
              Start with our free trial and scale as you grow.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center mb-12">
              <div className="flex items-center bg-muted rounded-lg p-1">
                <button
                  onClick={() => setBillingCycle("monthly")}
                  className={cn(
                    "px-4 py-2 rounded-md transition-colors",
                    billingCycle === "monthly"
                      ? "bg-background shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle("annual")}
                  className={cn(
                    "px-4 py-2 rounded-md transition-colors relative",
                    billingCycle === "annual"
                      ? "bg-background shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  Annual
                  <Badge className="ml-2 text-xs" variant="secondary">
                    Save 20%
                  </Badge>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-0 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {plans.map((plan) => {
                const currentPrice = getCurrentPrice(plan);
                const savings = getSavings(plan);
                const isPopular = plan.badge === "Most Popular";

                return (
                  <Card
                    key={plan.id}
                    className={cn(
                      "relative",
                      isPopular && "border-primary shadow-lg scale-105",
                    )}
                  >
                    {plan.badge && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <Badge
                          variant={isPopular ? "default" : "secondary"}
                          className="px-3 py-1"
                        >
                          {plan.badge}
                        </Badge>
                      </div>
                    )}

                    <CardHeader className="text-center">
                      <div className="flex justify-center mb-4">
                        {plan.icon}
                      </div>
                      <CardTitle className="text-2xl">{plan.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {plan.description}
                      </CardDescription>

                      <div className="mt-4">
                        {currentPrice ? (
                          <>
                            <div className="text-4xl font-bold">
                              ${currentPrice}
                              <span className="text-lg text-muted-foreground font-normal">
                                /month
                              </span>
                            </div>
                            {billingCycle === "annual" && savings && (
                              <p className="text-sm text-green-600 mt-1">
                                Save ${savings.amount}/year (
                                {savings.percentage}% off)
                              </p>
                            )}
                          </>
                        ) : (
                          <div className="text-2xl font-bold text-muted-foreground">
                            Custom Pricing
                          </div>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                      <Button
                        className="w-full"
                        variant={plan.ctaVariant}
                        size="lg"
                        asChild={plan.cta !== "Contact Sales"}
                      >
                        {plan.cta === "Contact Sales" ? (
                          <Link to="/contact">
                            {plan.cta}
                            <ArrowRight className="ml-2 w-4 h-4" />
                          </Link>
                        ) : (
                          <Link to="/register">{plan.cta}</Link>
                        )}
                      </Button>

                      <div className="space-y-3">
                        <h4 className="font-semibold text-sm">
                          Everything included:
                        </h4>
                        <ul className="space-y-2">
                          {plan.features.map((feature, index) => (
                            <li
                              key={index}
                              className="flex items-start text-sm"
                            >
                              <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Additional Features */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/50">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                Powerful Features Across All Plans
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Every plan includes the core tools you need to succeed in the EV
                infrastructure market
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {additionalFeatures.map((feature, index) => (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-4">{feature.icon}</div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-3xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-muted-foreground">
                Have a question? We're here to help.
              </p>
            </div>

            <div className="space-y-6">
              {faq.map((item, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{item.question}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{item.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Support Section */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-muted/50">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <Headphones className="w-8 h-8 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Expert Support</h3>
                <p className="text-sm text-muted-foreground">
                  Get help from our team of EV infrastructure specialists
                </p>
              </div>
              <div className="text-center">
                <Clock className="w-8 h-8 text-secondary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">14-Day Free Trial</h3>
                <p className="text-sm text-muted-foreground">
                  Try all features risk-free with no credit card required
                </p>
              </div>
              <div className="text-center">
                <Shield className="w-8 h-8 text-accent mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Money-Back Guarantee</h3>
                <p className="text-sm text-muted-foreground">
                  30-day refund policy on all annual plans
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Transform Your EV Business?
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
              Join hundreds of electrical contractors who are already using
              ChargeSource to streamline their EV infrastructure projects.
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
