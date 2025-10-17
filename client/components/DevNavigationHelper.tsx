import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Database,
  Settings,
  HardDrive,
  Key,
  Users,
  Code,
  TestTube,
  ExternalLink,
  Info,
} from "lucide-react";

export default function DevNavigationHelper() {
  const testRoutes = [
    {
      path: "/auth-test",
      title: "Auth & Storage Test",
      description: "Test Supabase authentication and storage buckets",
      icon: <Database className="w-4 h-4" />,
      status: "ready",
    },
    {
      path: "/dashboard",
      title: "Dashboard",
      description: "Main application dashboard",
      icon: <Settings className="w-4 h-4" />,
      status: "ready",
    },
    {
      path: "/login",
      title: "Login Page",
      description: "User authentication login",
      icon: <Key className="w-4 h-4" />,
      status: "ready",
    },
    {
      path: "/register",
      title: "Registration",
      description: "New user registration",
      icon: <Users className="w-4 h-4" />,
      status: "ready",
    },
  ];

  const testFiles = [
    {
      file: "test-supabase-connection.html",
      title: "Connection Test",
      description: "Basic Supabase connectivity",
    },
    {
      file: "test-storage-status.html",
      title: "Storage Status",
      description: "Check storage bucket status",
    },
    {
      file: "test-create-buckets.html",
      title: "Bucket Creator",
      description: "Create missing storage buckets",
    },
    {
      file: "verify-buckets.html",
      title: "Quick Verification",
      description: "Fast bucket existence check",
    },
  ];

  return (
    <Card className="w-full max-w-4xl mx-auto mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="w-5 h-5" />
          Development & Testing Navigation
          <Badge variant="outline">Debug Mode</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Route Navigation */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Code className="w-4 h-4" />
            Application Routes
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {testRoutes.map((route) => (
              <Link
                key={route.path}
                to={route.path}
                className="block p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2">
                    {route.icon}
                    <div>
                      <div className="font-medium">{route.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {route.description}
                      </div>
                      <div className="text-xs text-blue-600 mt-1">
                        {route.path}
                      </div>
                    </div>
                  </div>
                  <ExternalLink className="w-3 h-3 text-gray-400" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Test Files */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <HardDrive className="w-4 h-4" />
            Test Files (Standalone)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {testFiles.map((file) => (
              <div key={file.file} className="p-3 border rounded-lg bg-gray-50">
                <div className="font-medium">{file.title}</div>
                <div className="text-sm text-muted-foreground">
                  {file.description}
                </div>
                <div className="text-xs text-green-600 mt-1">{file.file}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Quick Setup:</strong> For bucket creation, use{" "}
            <code>/auth-test</code> → Storage tab → "Initialize Buckets" button.
            Alternative routes: <code>/AuthTest</code>, <code>/authtest</code>,{" "}
            <code>/auth_test</code>
          </AlertDescription>
        </Alert>

        <div className="flex gap-2 pt-4 border-t">
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
  );
}
