import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  Star 
} from "lucide-react";

export default function IndexWorking() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <PlugZap className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold">ChargeSource</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="outline">Login</Button>
              </Link>
              <Link to="/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Badge variant="secondary" className="mb-4">
            EV Infrastructure Management Platform
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Streamline Your EV Charging Projects
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Complete project management, quoting, and installation workflow for electrical contractors specializing in EV charging infrastructure.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="flex items-center gap-2 px-8 py-4 text-lg">
                Start Free Trial
              </Button>
            </Link>
            <Link to="/demo">
              <Button size="lg" variant="outline" className="px-8 py-4 text-lg">
                View Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Everything You Need</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From initial quote to final installation, manage your entire EV charging project lifecycle.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Calculator className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Smart Quoting</CardTitle>
                <CardDescription>
                  Generate accurate quotes with our comprehensive product database and pricing engine.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Package className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Project Management</CardTitle>
                <CardDescription>
                  Track projects from concept to completion with integrated workflow management.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Client Portal</CardTitle>
                <CardDescription>
                  Give clients real-time access to project progress, documents, and communications.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Share2 className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Document Management</CardTitle>
                <CardDescription>
                  Centralized storage for drawings, permits, photos, and compliance documents.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Zap className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Product Catalog</CardTitle>
                <CardDescription>
                  Access to comprehensive EV charging equipment with real-time pricing and availability.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CheckCircle2 className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Quality Assurance</CardTitle>
                <CardDescription>
                  Built-in quality checks and compliance tracking for professional installations.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Join hundreds of electrical contractors who trust ChargeSource for their EV infrastructure projects.
          </p>
          <Link to="/register">
            <Button size="lg">Start Your Free Trial</Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-8 px-4">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>&copy; 2024 ChargeSource. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
