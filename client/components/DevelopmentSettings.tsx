import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import { 
  TestTube, 
  Database, 
  Settings, 
  HardDrive, 
  Key, 
  Users, 
  Code, 
  ExternalLink,
  Info,
  AlertTriangle,
  Shield
} from "lucide-react";

export default function DevelopmentSettings() {
  const testRoutes = [
    {
      path: "/auth-test",
      title: "Auth & Storage Test",
      description: "Test Supabase authentication and storage buckets",
      icon: <Database className="w-4 h-4" />,
      status: "ready"
    },
    {
      path: "/dashboard", 
      title: "Dashboard",
      description: "Main application dashboard",
      icon: <Settings className="w-4 h-4" />,
      status: "ready"
    },
    {
      path: "/login",
      title: "Login Page",
      description: "User authentication login",
      icon: <Key className="w-4 h-4" />,
      status: "ready"
    },
    {
      path: "/register",
      title: "Registration",
      description: "New user registration",
      icon: <Users className="w-4 h-4" />,
      status: "ready"
    }
  ];

  const testFiles = [
    {
      file: "test-supabase-connection.html",
      title: "Connection Test",
      description: "Basic Supabase connectivity"
    },
    {
      file: "test-storage-status.html", 
      title: "Storage Status",
      description: "Check storage bucket status"
    },
    {
      file: "test-create-buckets.html",
      title: "Bucket Creator",
      description: "Create missing storage buckets"
    },
    {
      file: "verify-buckets.html",
      title: "Quick Verification",
      description: "Fast bucket existence check"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center">
              <TestTube className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2">
                Development & Testing Tools
                <Badge variant="destructive">Admin Only</Badge>
              </CardTitle>
              <CardDescription>
                Development navigation and testing utilities for system diagnostics
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Warning Alert */}
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Administrative Access Required:</strong> These tools are intended for system administrators and developers only. 
          Use with caution in production environments.
        </AlertDescription>
      </Alert>

      {/* Application Routes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="w-5 h-5" />
            Application Routes
          </CardTitle>
          <CardDescription>
            Navigation to key application pages for testing and development
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {testRoutes.map((route) => (
              <Link
                key={route.path}
                to={route.path}
                className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-md bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      {route.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{route.title}</div>
                      <div className="text-xs text-muted-foreground mt-1">{route.description}</div>
                      <div className="text-xs text-primary mt-2 font-mono">{route.path}</div>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Test Files */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="w-5 h-5" />
            Standalone Test Files
          </CardTitle>
          <CardDescription>
            Direct HTML test files for low-level system diagnostics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {testFiles.map((file) => (
              <div
                key={file.file}
                className="p-4 border rounded-lg bg-muted/30"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-md bg-secondary/20 text-secondary">
                    <HardDrive className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{file.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">{file.description}</div>
                    <div className="text-xs text-secondary mt-2 font-mono">{file.file}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Quick Setup Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Quick Setup:</strong> For bucket creation, use the Auth Test page → Storage tab → "Initialize Buckets" button.
              Alternative routes: <code>/AuthTest</code>, <code>/authtest</code>, <code>/auth_test</code>
            </AlertDescription>
          </Alert>

          <Separator />

          <div className="flex flex-wrap gap-3">
            <Button asChild variant="default" size="sm">
              <Link to="/auth-test">
                <Database className="w-4 h-4 mr-2" />
                Go to Auth Test
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/dashboard">
                <Settings className="w-4 h-4 mr-2" />
                Go to Dashboard  
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
