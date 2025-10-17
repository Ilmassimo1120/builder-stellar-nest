import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Alert, AlertDescription } from "./ui/alert";
import { CheckCircle, XCircle, Clock, RefreshCw } from "lucide-react";
import { safeGetLocal } from "@/lib/safeLocalStorage";

interface SystemCheck {
  name: string;
  status: "success" | "error" | "warning" | "checking";
  message: string;
  details?: any;
}

export default function SystemStatus() {
  const [checks, setChecks] = useState<SystemCheck[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    runSystemChecks();
  }, []);

  const runSystemChecks = async () => {
    setIsRunning(true);
    const results: SystemCheck[] = [];

    // Check 1: Local Storage Access
    try {
      localStorage.setItem("test", "test");
      localStorage.removeItem("test");
      results.push({
        name: "Local Storage",
        status: "success",
        message: "Local storage is accessible",
      });
    } catch (error) {
      results.push({
        name: "Local Storage",
        status: "error",
        message: "Local storage is not accessible",
        details: error,
      });
    }

    // Check 2: Auth System
    try {
      const storedUser = safeGetLocal("chargeSourceUser", null);
      if (storedUser) {
        results.push({
          name: "Authentication",
          status: "success",
          message: `Logged in as ${storedUser.email} (${storedUser.role})`,
          details: storedUser,
        });
      } else {
        results.push({
          name: "Authentication",
          status: "warning",
          message: "No active session found",
        });
      }
    } catch (error) {
      results.push({
        name: "Authentication",
        status: "error",
        message: "Auth system error",
        details: error,
      });
    }

    // Check 3: Config Loading
    try {
      // Import config and check if it loads
      const { config } = await import("@/lib/config");
      results.push({
        name: "Configuration",
        status: "success",
        message: `Environment: ${config.NODE_ENV}`,
        details: {
          supabaseConfigured: !!(
            config.VITE_SUPABASE_URL && config.VITE_SUPABASE_ANON_KEY
          ),
          environment: config.NODE_ENV,
        },
      });
    } catch (error) {
      results.push({
        name: "Configuration",
        status: "error",
        message: "Config loading failed",
        details: error,
      });
    }

    // Check 4: Supabase Connection (basic)
    try {
      const { supabase } = await import("@/lib/supabase");

      // Just check if supabase client exists
      if (supabase) {
        results.push({
          name: "Supabase Client",
          status: "success",
          message: "Supabase client initialized",
        });
      } else {
        results.push({
          name: "Supabase Client",
          status: "error",
          message: "Supabase client not initialized",
        });
      }
    } catch (error) {
      results.push({
        name: "Supabase Client",
        status: "error",
        message: "Supabase import failed",
        details: error,
      });
    }

    // Check 5: Router
    try {
      const currentPath = window.location.pathname;
      results.push({
        name: "Router",
        status: "success",
        message: `Current path: ${currentPath}`,
      });
    } catch (error) {
      results.push({
        name: "Router",
        status: "error",
        message: "Router check failed",
        details: error,
      });
    }

    setChecks(results);
    setIsRunning(false);
  };

  const getStatusIcon = (status: SystemCheck["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "warning":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "checking":
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
    }
  };

  const getStatusBadge = (status: SystemCheck["status"]) => {
    const variants = {
      success: "default",
      error: "destructive",
      warning: "outline",
      checking: "secondary",
    } as const;

    return <Badge variant={variants[status]}>{status.toUpperCase()}</Badge>;
  };

  const overallStatus = checks.every((c) => c.status === "success")
    ? "success"
    : checks.some((c) => c.status === "error")
      ? "error"
      : "warning";

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>System Status</CardTitle>
          <div className="flex items-center space-x-2">
            {getStatusBadge(overallStatus)}
            <Button
              onClick={runSystemChecks}
              disabled={isRunning}
              size="sm"
              variant="outline"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {checks.length === 0 ? (
          <Alert>
            <AlertDescription>
              Running initial system checks...
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {overallStatus === "success" && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>✅ All systems operational</AlertDescription>
              </Alert>
            )}

            {overallStatus === "error" && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  ❌ Some systems have errors that need attention
                </AlertDescription>
              </Alert>
            )}

            <div className="grid gap-3">
              {checks.map((check, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(check.status)}
                    <div>
                      <div className="font-medium">{check.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {check.message}
                      </div>
                    </div>
                  </div>
                  {getStatusBadge(check.status)}
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
