import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, Info, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function SupabaseDebugger() {
  const [debugging, setDebugging] = useState(false);
  const [results, setResults] = useState<any>(null);

  const runDebugTests = async () => {
    setDebugging(true);
    const debugResults: any = {
      environment: {},
      supabaseConfig: {},
      connectionTest: {},
      bucketTest: {},
      authTest: {},
    };

    try {
      // Environment info
      debugResults.environment = {
        hostname: window.location.hostname,
        isDev: import.meta.env.DEV,
        url: window.location.href,
        userAgent: navigator.userAgent.slice(0, 100),
      };

      // Supabase config
      debugResults.supabaseConfig = {
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
        hasAnonKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
        anonKeyLength: import.meta.env.VITE_SUPABASE_ANON_KEY?.length || 0,
      };

      // Test basic connection
      try {
        const startTime = Date.now();
        const { data, error } = await supabase.storage.listBuckets();
        const responseTime = Date.now() - startTime;

        debugResults.connectionTest = {
          success: !error,
          error: error?.message,
          responseTime,
          bucketCount: data?.length || 0,
          buckets: data?.map((b) => b.name) || [],
        };
      } catch (err) {
        debugResults.connectionTest = {
          success: false,
          error: err instanceof Error ? err.message : "Unknown error",
          exception: true,
        };
      }

      // Test auth status
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();
        debugResults.authTest = {
          hasUser: !!user,
          userId: user?.id,
          userEmail: user?.email,
          error: authError?.message,
        };
      } catch (err) {
        debugResults.authTest = {
          hasUser: false,
          error: err instanceof Error ? err.message : "Unknown error",
        };
      }

      // Test specific bucket access
      if (debugResults.connectionTest.success) {
        try {
          const testResults = {};
          const buckets = [
            "charge-source-user-files",
            "charge-source-documents",
            "charge-source-videos",
          ];

          for (const bucket of buckets) {
            try {
              const { data, error } = await supabase.storage
                .from(bucket)
                .list("", { limit: 1 });
              testResults[bucket] = {
                accessible: !error,
                error: error?.message,
                canList: true,
              };
            } catch (err) {
              testResults[bucket] = {
                accessible: false,
                error: err instanceof Error ? err.message : "Unknown error",
                canList: false,
              };
            }
          }

          debugResults.bucketTest = testResults;
        } catch (err) {
          debugResults.bucketTest = {
            error: err instanceof Error ? err.message : "Unknown error",
          };
        }
      }
    } catch (err) {
      debugResults.error = err instanceof Error ? err.message : "Unknown error";
    }

    setResults(debugResults);
    setDebugging(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Info className="h-5 w-5" />
            <span>Supabase Connection Debugger</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={runDebugTests}
            disabled={debugging}
          >
            {debugging ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Info className="h-4 w-4 mr-2" />
            )}
            Run Debug Tests
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!results ? (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Click "Run Debug Tests" to diagnose Supabase connection and bucket
              access issues.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            {/* Environment */}
            <div>
              <h4 className="font-medium mb-2">Environment</h4>
              <div className="bg-gray-100 p-3 rounded text-sm font-mono">
                <div>Hostname: {results.environment.hostname}</div>
                <div>
                  Development: {results.environment.isDev ? "Yes" : "No"}
                </div>
                <div>URL: {results.environment.url}</div>
              </div>
            </div>

            {/* Supabase Config */}
            <div>
              <h4 className="font-medium mb-2">Supabase Configuration</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Badge
                    variant={
                      results.supabaseConfig.supabaseUrl
                        ? "default"
                        : "destructive"
                    }
                  >
                    URL:{" "}
                    {results.supabaseConfig.supabaseUrl ? "Set" : "Missing"}
                  </Badge>
                  <Badge
                    variant={
                      results.supabaseConfig.hasAnonKey
                        ? "default"
                        : "destructive"
                    }
                  >
                    Anon Key:{" "}
                    {results.supabaseConfig.hasAnonKey
                      ? `${results.supabaseConfig.anonKeyLength} chars`
                      : "Missing"}
                  </Badge>
                </div>
                {results.supabaseConfig.supabaseUrl && (
                  <div className="text-sm text-muted-foreground">
                    URL: {results.supabaseConfig.supabaseUrl}
                  </div>
                )}
              </div>
            </div>

            {/* Connection Test */}
            <div>
              <h4 className="font-medium mb-2 flex items-center space-x-2">
                <span>Connection Test</span>
                {results.connectionTest.success ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                )}
              </h4>
              <div className="space-y-2">
                <Badge
                  variant={
                    results.connectionTest.success ? "default" : "destructive"
                  }
                >
                  {results.connectionTest.success ? "Connected" : "Failed"}
                </Badge>
                {results.connectionTest.responseTime && (
                  <Badge variant="outline">
                    {results.connectionTest.responseTime}ms
                  </Badge>
                )}
                {results.connectionTest.error && (
                  <div className="text-sm text-red-600">
                    Error: {results.connectionTest.error}
                  </div>
                )}
                {results.connectionTest.buckets &&
                  results.connectionTest.buckets.length > 0 && (
                    <div className="text-sm">
                      <strong>Found buckets:</strong>{" "}
                      {results.connectionTest.buckets.join(", ")}
                    </div>
                  )}
              </div>
            </div>

            {/* Auth Test */}
            <div>
              <h4 className="font-medium mb-2">Authentication Status</h4>
              <div className="space-y-2">
                <Badge
                  variant={results.authTest.hasUser ? "default" : "secondary"}
                >
                  {results.authTest.hasUser
                    ? "Authenticated"
                    : "Not authenticated"}
                </Badge>
                {results.authTest.userId && (
                  <div className="text-sm">
                    <strong>User ID:</strong> {results.authTest.userId}
                  </div>
                )}
                {results.authTest.error && (
                  <div className="text-sm text-red-600">
                    Auth Error: {results.authTest.error}
                  </div>
                )}
              </div>
            </div>

            {/* Bucket Access Test */}
            {results.bucketTest &&
              Object.keys(results.bucketTest).length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Bucket Access Test</h4>
                  <div className="space-y-2">
                    {Object.entries(results.bucketTest).map(
                      ([bucket, test]: [string, any]) => (
                        <div
                          key={bucket}
                          className="flex items-center justify-between p-2 border rounded"
                        >
                          <span className="font-mono text-sm">{bucket}</span>
                          <div className="flex items-center space-x-2">
                            <Badge
                              variant={
                                test.accessible ? "default" : "destructive"
                              }
                            >
                              {test.accessible ? "Accessible" : "Blocked"}
                            </Badge>
                            {test.error && (
                              <span className="text-xs text-red-600">
                                {test.error}
                              </span>
                            )}
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
