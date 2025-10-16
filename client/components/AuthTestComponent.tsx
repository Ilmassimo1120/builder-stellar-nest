import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  User,
  Mail,
  Lock,
} from "lucide-react";

export default function AuthTestComponent() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [testing, setTesting] = useState(false);
  const [testEmail, setTestEmail] = useState("test@chargesource.demo");
  const [testPassword, setTestPassword] = useState("testpassword123");

  const { user, isAuthenticated, login, register, logout } = useSupabaseAuth();

  const addResult = (
    message: string,
    type: "success" | "error" | "info" = "info",
  ) => {
    const timestamp = new Date().toLocaleTimeString();
    const emoji = type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️";
    setTestResults((prev) => [...prev, `${timestamp} ${emoji} ${message}`]);
  };

  const clearResults = () => setTestResults([]);

  const testAuthConfiguration = async () => {
    setTesting(true);
    clearResults();
    addResult("🚀 Starting Authentication System Test");

    try {
      // Test 1: Check Supabase client configuration
      addResult("📋 Testing Supabase Auth Configuration...");
      addResult(`URL: ${import.meta.env.VITE_SUPABASE_URL}`, "info");
      addResult(
        `Key Present: ${import.meta.env.VITE_SUPABASE_ANON_KEY ? "Yes" : "No"}`,
        "info",
      );

      // Test 2: Check auth session
      addResult("🔐 Checking Current Auth Session...");
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        addResult(`Session Error: ${sessionError.message}`, "error");
      } else if (session) {
        addResult(`Active Session Found: ${session.user.email}`, "success");
      } else {
        addResult("No Active Session (Normal for anonymous)", "info");
      }

      // Test 3: Test auth endpoint connectivity
      addResult("🌐 Testing Auth Endpoint Connectivity...");
      try {
        const response = await fetch(
          `${supabase.supabaseUrl}/auth/v1/settings`,
          {
            headers: {
              apikey: supabase.supabaseKey,
            },
          },
        );

        if (response.ok) {
          addResult("Auth Endpoint Reachable", "success");
          const settings = await response.json();
          addResult(
            `Sign-up Enabled: ${settings.external_email_enabled || "Unknown"}`,
            "info",
          );
        } else {
          addResult(`Auth Endpoint Error: ${response.status}`, "error");
        }
      } catch (error) {
        addResult(
          `Auth Endpoint Test Failed: ${error instanceof Error ? error.message : "Unknown error"}`,
          "error",
        );
      }

      // Test 4: Test user creation capability (dry run)
      addResult("👤 Testing User Management Access...");
      try {
        const { data, error } = await supabase
          .from("users")
          .select("count")
          .limit(1);

        if (error) {
          if (error.code === "PGRST116") {
            addResult(
              "Users table not found - need to run migrations",
              "error",
            );
          } else {
            addResult(`Users table access error: ${error.message}`, "error");
          }
        } else {
          addResult("Users table accessible for auth integration", "success");
        }
      } catch (error) {
        addResult(
          `User table test failed: ${error instanceof Error ? error.message : "Unknown error"}`,
          "error",
        );
      }

      addResult("🎉 Auth Configuration Test Complete", "success");
    } catch (error) {
      addResult(
        `Unexpected Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        "error",
      );
    } finally {
      setTesting(false);
    }
  };

  const testSignUp = async () => {
    setTesting(true);
    addResult("���� Testing User Registration...");

    try {
      const testUser = {
        email: testEmail,
        password: testPassword,
        firstName: "Test",
        lastName: "User",
        company: "Test Company",
      };

      const success = await register(testUser);

      if (success) {
        addResult("Registration Successful!", "success");
        addResult("Check your email for verification link", "info");
      } else {
        addResult("Registration Failed", "error");
      }
    } catch (error) {
      addResult(
        `Registration Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        "error",
      );
    } finally {
      setTesting(false);
    }
  };

  const testSignIn = async () => {
    setTesting(true);
    addResult("🔑 Testing User Login...");

    try {
      const success = await login(testEmail, testPassword);

      if (success) {
        addResult("Login Successful!", "success");
      } else {
        addResult("Login Failed - Check credentials", "error");
      }
    } catch (error) {
      addResult(
        `Login Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        "error",
      );
    } finally {
      setTesting(false);
    }
  };

  const testSignOut = async () => {
    setTesting(true);
    addResult("🚪 Testing User Logout...");

    try {
      await logout();
      addResult("Logout Successful!", "success");
    } catch (error) {
      addResult(
        `Logout Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        "error",
      );
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔐 Authentication System Test
            {isAuthenticated && (
              <Badge variant="secondary" className="ml-2">
                <User className="w-3 h-3 mr-1" />
                Authenticated
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Auth Status */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Current Status</h4>
            <div className="text-sm space-y-1">
              <div>
                Authentication:{" "}
                {isAuthenticated ? "✅ Logged In" : "❌ Not Logged In"}
              </div>
              {user && (
                <>
                  <div>User: {user.email}</div>
                  <div>Role: {user.role}</div>
                  <div>Name: {user.name}</div>
                </>
              )}
            </div>
          </div>

          {/* Test Credentials */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="testEmail">Test Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="testEmail"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="testPassword">Test Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="testPassword"
                  type="password"
                  value={testPassword}
                  onChange={(e) => setTestPassword(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Test Actions */}
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={testAuthConfiguration}
              disabled={testing}
              variant="outline"
            >
              Test Auth Config
            </Button>
            <Button
              onClick={testSignUp}
              disabled={testing || isAuthenticated}
              variant="outline"
            >
              Test Sign Up
            </Button>
            <Button
              onClick={testSignIn}
              disabled={testing || isAuthenticated}
              variant="outline"
            >
              Test Sign In
            </Button>
            <Button
              onClick={testSignOut}
              disabled={testing || !isAuthenticated}
              variant="outline"
            >
              Test Sign Out
            </Button>
            <Button onClick={clearResults} disabled={testing} variant="ghost">
              Clear Results
            </Button>
          </div>

          {/* Demo Users Info */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Demo Users Available:</strong>
              <br />
              • demo@contractor.com.au / demo123
              <br />
              • admin@chargesource.com.au / admin123
              <br />
              <em>You can also create new test accounts.</em>
            </AlertDescription>
          </Alert>

          {/* Test Results */}
          {testResults.length > 0 && (
            <div className="bg-black text-green-400 p-4 rounded font-mono text-sm max-h-96 overflow-y-auto">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold">Test Results:</span>
                <Badge
                  variant="outline"
                  className="text-green-400 border-green-400"
                >
                  {testResults.length} entries
                </Badge>
              </div>
              {testResults.map((result, index) => (
                <div key={index} className="mb-1">
                  {result}
                </div>
              ))}
            </div>
          )}

          {testing && (
            <div className="flex items-center gap-2 text-blue-600">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              Running auth tests...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
