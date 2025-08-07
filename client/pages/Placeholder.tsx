import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "react-router-dom";
import { PlugZap, ArrowLeft, Construction } from "lucide-react";
import { Logo } from "@/components/ui/logo";

interface PlaceholderProps {
  title: string;
  description: string;
  features?: string[];
}

export default function Placeholder({
  title,
  description,
  features = [],
}: PlaceholderProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Logo size="xl" />
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/dashboard"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Dashboard
            </Link>
            <Link
              to="/projects"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Projects
            </Link>
            <Link
              to="/quotes"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Quotes
            </Link>
            <Link
              to="/catalogue"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Catalogue
            </Link>
            <Link
              to="/clients"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Clients
            </Link>
          </nav>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" asChild>
              <Link to="/">Home</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/dashboard">Dashboard</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <Construction className="w-16 h-16 text-primary mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-4">{title}</h1>
            <p className="text-lg text-muted-foreground mb-8">{description}</p>
          </div>

          <Card className="text-left">
            <CardHeader>
              <CardTitle>Coming Soon</CardTitle>
              <CardDescription>
                This feature is currently in development and will be available
                soon.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {features.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-medium mb-3">Planned Features:</h3>
                  <ul className="space-y-2">
                    {features.map((feature, index) => (
                      <li
                        key={index}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild>
                  <Link to="/dashboard">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/contact">Request Early Access</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 text-sm text-muted-foreground">
            <p>
              Want to help shape this feature?{" "}
              <Link to="/contact" className="text-primary hover:underline">
                Get in touch
              </Link>{" "}
              with our team.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
