import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { safeFileStorageService } from "@/lib/services/safeFileStorageService";
import { bucketInitService } from "@/lib/services/bucketInitService";
import { supabase } from "@/lib/supabase";

export default function FileStorageDebug() {
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [bucketStatus, setBucketStatus] = useState<any>(null);
  const [initializingBuckets, setInitializingBuckets] = useState(false);

  useEffect(() => {
    checkBucketStatus();
  }, []);

  const checkBucketStatus = async () => {
    try {
      const status = await bucketInitService.getBucketStatus();
      setBucketStatus(status);
    } catch (error) {
      console.error("Error checking bucket status:", error);
    }
  };

  const initializeBuckets = async () => {
    setInitializingBuckets(true);
    try {
      const result = await bucketInitService.initializeBuckets();
      console.log("Bucket initialization result:", result);

      // Refresh bucket status
      await checkBucketStatus();

      // Show result in debug output
      setResults((prev: any) => ({
        ...prev,
        bucketInit: {
          success: result.success,
          message: `Created: ${result.created.length}, Existing: ${result.existing.length}, Errors: ${result.errors.length}`,
          data: result
        }
      }));
    } catch (error) {
      console.error("Bucket initialization failed:", error);
      setResults((prev: any) => ({
        ...prev,
        bucketInit: {
          success: false,
          message: error instanceof Error ? error.message : "Unknown error",
          error
        }
      }));
    } finally {
      setInitializingBuckets(false);
    }
  };

  const runTests = async () => {
    setLoading(true);
    const testResults: any = {};

    try {
      // Test 1: Check authentication
      testResults.auth = await testAuth();

      // Test 2: Check storage buckets
      testResults.buckets = await testBuckets();

      // Test 3: Check database connection
      testResults.database = await testDatabase();

      // Test 4: Test search function
      testResults.search = await testSearch();

      // Test 5: Test storage usage
      testResults.storageUsage = await testStorageUsage();
    } catch (error) {
      testResults.globalError = {
        success: false,
        message: error instanceof Error ? error.message : String(error),
        error: error,
      };
    }

    setResults(testResults);
    setLoading(false);
  };

  const testAuth = async () => {
    let localAuthResult = null;
    let supabaseAuthResult = null;

    // Test local auth
    try {
      const storedUser = localStorage.getItem("chargeSourceUser");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        localAuthResult = {
          success: true,
          message: `Local auth user: ${userData.email} (${userData.role})`,
          data: userData,
        };
      } else {
        localAuthResult = {
          success: false,
          message: "No local auth user found",
          data: null,
        };
      }
    } catch (error) {
      localAuthResult = {
        success: false,
        message: `Local auth error: ${error instanceof Error ? error.message : String(error)}`,
        data: null,
      };
    }

    // Test Supabase auth
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      supabaseAuthResult = {
        success: !error,
        message: error
          ? `Supabase auth error: ${error.message}`
          : `Supabase user: ${user?.email || "No user"}`,
        data: { user, error },
      };
    } catch (error) {
      supabaseAuthResult = {
        success: false,
        message: `Supabase auth exception: ${error instanceof Error ? error.message : String(error)}`,
        data: error,
      };
    }

    // Return combined result
    const primaryAuth = localAuthResult.success
      ? "Local Auth"
      : supabaseAuthResult.success
        ? "Supabase Auth"
        : "None";
    return {
      success: localAuthResult.success || supabaseAuthResult.success,
      message: `Primary: ${primaryAuth} | Local: ${localAuthResult.success ? "✅" : "❌"} | Supabase: ${supabaseAuthResult.success ? "✅" : "❌"}`,
      data: { localAuth: localAuthResult, supabaseAuth: supabaseAuthResult },
    };
  };

  const testDatabase = async () => {
    try {
      const { data, error } = await supabase
        .from("file_assets")
        .select("count")
        .limit(1);

      return {
        success: !error,
        message: error
          ? `Database error: ${error.message}`
          : "Database connection successful",
        data: { data, error },
      };
    } catch (error) {
      return {
        success: false,
        message: `Database exception: ${error instanceof Error ? error.message : String(error)}`,
        error,
      };
    }
  };

  const testSearch = async () => {
    const result = await safeFileStorageService.searchFiles({});
    return {
      success: !result.error,
      message:
        result.error || `Search successful: ${result.files.length} files found`,
      data: result,
    };
  };

  const testBuckets = async () => {
    try {
      const status = await bucketInitService.checkBuckets();
      return {
        success: status.allExist,
        message: status.allExist
          ? `All ${status.existing.length} buckets exist`
          : `Missing ${status.missing.length} buckets: ${status.missing.join(', ')}`,
        data: status
      };
    } catch (error) {
      return {
        success: false,
        message: `Bucket check failed: ${error instanceof Error ? error.message : String(error)}`,
        error
      };
    }
  };

  const testStorageUsage = async () => {
    const result = await safeFileStorageService.getStorageUsage();
    return {
      success: !result.error,
      message:
        result.error ||
        `Storage usage: ${result.totalFiles} files, ${result.totalSize} bytes`,
      data: result,
    };
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>File Storage Debug</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Bucket Status Section */}
        {bucketStatus && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Storage Buckets</h3>
              <div className="flex items-center space-x-2">
                <Badge variant={bucketStatus.allExist ? "default" : "destructive"}>
                  {bucketStatus.allExist ? "✅ All Ready" : `❌ ${bucketStatus.missing.length} Missing`}
                </Badge>
                {!bucketStatus.allExist && (
                  <Button
                    onClick={initializeBuckets}
                    disabled={initializingBuckets}
                    size="sm"
                    variant="outline"
                  >
                    {initializingBuckets ? "Creating..." : "Create Buckets"}
                  </Button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {bucketStatus.buckets.map((bucket: any) => (
                <div key={bucket.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{bucket.name}</span>
                    <Badge variant={bucket.exists ? "default" : "secondary"}>
                      {bucket.exists ? "✅" : "❌"}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>Max: {bucket.maxSize}</div>
                    <div>Types: {bucket.allowedTypes}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* Test Section */}
        <div className="flex space-x-2">
          <Button onClick={runTests} disabled={loading}>
            {loading ? "Running Tests..." : "Run Debug Tests"}
          </Button>
          <Button onClick={checkBucketStatus} variant="outline" size="sm">
            Refresh Status
          </Button>
        </div>

        {Object.keys(results).length > 0 && (
          <div className="space-y-4">
            {Object.entries(results).map(
              ([testName, result]: [string, any]) => (
                <Alert
                  key={testName}
                  variant={result.success ? "default" : "destructive"}
                >
                  <AlertDescription>
                    <div className="space-y-2">
                      <div className="font-semibold">
                        {testName}:{" "}
                        {result.success ? "✅ Success" : "❌ Failed"}
                      </div>
                      <div className="text-sm">{result.message}</div>
                      {result.error && (
                        <details className="text-xs">
                          <summary>Error Details</summary>
                          <pre className="mt-2 p-2 bg-muted rounded">
                            {JSON.stringify(result.error, null, 2)}
                          </pre>
                        </details>
                      )}
                      {result.data && (
                        <details className="text-xs">
                          <summary>Data</summary>
                          <pre className="mt-2 p-2 bg-muted rounded">
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              ),
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
