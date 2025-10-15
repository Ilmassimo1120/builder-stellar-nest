import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Globe,
  Monitor,
  Eye,
} from "lucide-react";

interface TestResult {
  endpoint: string;
  status: "success" | "error" | "pending";
  responseTime?: number;
  data?: any;
  error?: string;
}

export default function ApiStatus() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [environment, setEnvironment] = useState<"local" | "deployed">("local");
  const [isFullStoryDetected, setIsFullStoryDetected] = useState(false);
  const [fetchMethod, setFetchMethod] = useState<
    "native" | "iframe" | "manual"
  >("native");

  const endpoints = [
    { path: "/api", method: "GET", description: "API Index" },
    { path: "/api/ping", method: "GET", description: "Health Check" },
    { path: "/api/demo", method: "GET", description: "Demo Data" },
  ];

  // Detect problematic environments
  const detectEnvironmentIssues = () => {
    const hostname = window.location.hostname;
    const isLocal = hostname === "localhost" || hostname === "127.0.0.1";
    setEnvironment(isLocal ? "local" : "deployed");

    // Check for FullStory
    const hasFullStory = !!(
      (window as any).FS ||
      document.querySelector('script[src*="fullstory"]') ||
      document.querySelector('script[src*="fs.js"]') ||
      (window.fetch && window.fetch.toString().includes("fullstory"))
    );

    setIsFullStoryDetected(hasFullStory);

    if (hasFullStory) {
      setFetchMethod("manual");
    } else {
      setFetchMethod("native");
    }
  };

  useEffect(() => {
    detectEnvironmentIssues();

    // Auto-test on load if fetch is safe
    if (!isFullStoryDetected) {
      testAllEndpoints();
    }
  }, []);

  const testEndpoint = async (endpoint: string): Promise<TestResult> => {
    const startTime = Date.now();

    try {
      // If FullStory is detected, provide manual testing info instead
      if (isFullStoryDetected) {
        return {
          endpoint,
          status: "error",
          responseTime: Date.now() - startTime,
          error:
            "FullStory detected - automatic testing disabled. Please test manually.",
        };
      }

      // Create a safe fetch wrapper
      const safeFetch = async (url: string) => {
        // Try to use original fetch if available
        const originalFetch = (window as any)._originalFetch || window.fetch;

        // Add timeout to prevent hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        try {
          const response = await originalFetch(url, {
            signal: controller.signal,
            method: "GET",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          });
          clearTimeout(timeoutId);
          return response;
        } catch (err) {
          clearTimeout(timeoutId);
          throw err;
        }
      };

      const response = await safeFetch(endpoint);
      const responseTime = Date.now() - startTime;

      if (!response.ok) {
        return {
          endpoint,
          status: "error",
          responseTime,
          error: `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const data = await response.json();

      return {
        endpoint,
        status: "success",
        responseTime,
        data,
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      let errorMessage = "Unknown error";

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          errorMessage = "Request timeout (10s)";
        } else if (error.message.includes("fetch")) {
          errorMessage =
            "Fetch API compromised (likely FullStory). Try manual testing.";
        } else {
          errorMessage = error.message;
        }
      }

      return {
        endpoint,
        status: "error",
        responseTime,
        error: errorMessage,
      };
    }
  };

  const testAllEndpoints = async () => {
    setIsLoading(true);

    // Initialize with pending status
    const pendingResults = endpoints.map((ep) => ({
      endpoint: ep.path,
      status: "pending" as const,
    }));
    setTestResults(pendingResults);

    // Test each endpoint
    const results = await Promise.all(
      endpoints.map((ep) => testEndpoint(ep.path)),
    );

    setTestResults(results);
    setIsLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "error":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "pending":
        return <RefreshCw className="w-4 h-4 text-yellow-500 animate-spin" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-100 text-green-800">Working</Badge>;
      case "error":
        return <Badge variant="destructive">Error</Badge>;
      case "pending":
        return <Badge variant="secondary">Testing...</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const successCount = testResults.filter((r) => r.status === "success").length;
  const totalCount = endpoints.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
            <Globe className="w-8 h-8 text-primary" />
            API Status Check
          </h1>
          <p className="text-muted-foreground">
            Test API endpoints and verify connectivity
          </p>
        </div>

        {/* FullStory Warning */}
        {isFullStoryDetected && (
          <Alert variant="destructive">
            <Eye className="h-4 w-4" />
            <AlertDescription>
              <strong>FullStory Analytics Detected:</strong> Automatic API
              testing is disabled because FullStory is intercepting fetch
              requests. Please test API endpoints manually by clicking the links
              below.
            </AlertDescription>
          </Alert>
        )}

        {/* Environment Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                {environment === "local" ? (
                  <Monitor className="w-5 h-5 text-blue-500" />
                ) : (
                  <Globe className="w-5 h-5 text-green-500" />
                )}
                Environment:{" "}
                {environment === "local" ? "Local Development" : "Deployed"}
                {isFullStoryDetected && (
                  <Badge variant="destructive" className="ml-2">
                    FullStory Active
                  </Badge>
                )}
              </span>
              <Button
                onClick={testAllEndpoints}
                disabled={isLoading || isFullStoryDetected}
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
                />
                {isFullStoryDetected ? "Auto-Test Disabled" : "Test All"}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {successCount}/{totalCount}
                </div>
                <div className="text-sm text-muted-foreground">
                  Endpoints Working
                </div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {window.location.hostname}
                </div>
                <div className="text-sm text-muted-foreground">
                  Current Host
                </div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {window.location.protocol}
                </div>
                <div className="text-sm text-muted-foreground">Protocol</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Manual Testing Section for FullStory */}
        {isFullStoryDetected && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-yellow-500" />
                Manual API Testing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Since FullStory is interfering with fetch requests, please
                  test these API endpoints manually:
                </AlertDescription>
              </Alert>

              <div className="grid gap-2">
                {endpoints.map((endpoint) => (
                  <div
                    key={endpoint.path}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <code className="text-sm font-mono">{endpoint.path}</code>
                      <span className="text-sm text-muted-foreground ml-2">
                        - {endpoint.description}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(endpoint.path, "_blank")}
                    >
                      Test Manually
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Test Results */}
        <Card>
          <CardHeader>
            <CardTitle>
              {isFullStoryDetected
                ? "Automatic Testing Disabled"
                : "Endpoint Test Results"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {testResults.map((result) => (
              <div key={result.endpoint} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(result.status)}
                    <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                      {result.endpoint}
                    </code>
                    {getStatusBadge(result.status)}
                  </div>
                  {result.responseTime && (
                    <span className="text-sm text-muted-foreground">
                      {result.responseTime}ms
                    </span>
                  )}
                </div>

                {result.error && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Error:</strong> {result.error}
                    </AlertDescription>
                  </Alert>
                )}

                {result.data && (
                  <div className="mt-2">
                    <details className="cursor-pointer">
                      <summary className="text-sm font-medium text-muted-foreground mb-2">
                        View Response Data
                      </summary>
                      <pre className="bg-muted p-2 rounded text-xs overflow-auto max-h-32">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </details>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Debugging Info */}
        <Card>
          <CardHeader>
            <CardTitle>Debugging Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm space-y-2">
              <p>
                <strong>Current URL:</strong> {window.location.href}
              </p>
              <p>
                <strong>Base URL:</strong> {window.location.origin}
              </p>
              <p>
                <strong>User Agent:</strong> {navigator.userAgent}
              </p>
            </div>

            {environment === "deployed" && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Deployed Environment:</strong> API requests are routed
                  through Netlify Functions. If you see 404 errors, the
                  serverless function may need to be deployed.
                </AlertDescription>
              </Alert>
            )}

            {environment === "local" && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Local Development:</strong> API requests are handled
                  by the Vite dev server. Make sure the server is running with{" "}
                  <code>npm run dev</code>.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
