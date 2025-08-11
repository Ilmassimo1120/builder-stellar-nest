import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, Loader2, Database } from "lucide-react";

export default function BucketVerifier() {
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<any>(null);

  const verifyBuckets = async () => {
    setChecking(true);
    setResult(null);

    try {
      // Use fetch directly to bypass any client-side restrictions
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        setResult({
          success: false,
          error: "Missing Supabase configuration",
        });
        return;
      }

      console.log("Testing direct API call to Supabase...");

      // Make direct API call to Supabase Storage API
      const response = await fetch(`${supabaseUrl}/storage/v1/bucket`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${supabaseKey}`,
          apikey: supabaseKey,
          "Content-Type": "application/json",
        },
      });

      console.log("Response status:", response.status);
      console.log(
        "Response headers:",
        Object.fromEntries(response.headers.entries()),
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.log("Error response:", errorText);

        setResult({
          success: false,
          error: `HTTP ${response.status}: ${errorText}`,
          status: response.status,
        });
        return;
      }

      const buckets = await response.json();
      console.log("Buckets found:", buckets);

      const bucketNames = buckets.map((b: any) => b.name);
      const requiredBuckets = [
        "charge-source-user-files",
        "charge-source-documents",
        "charge-source-videos",
      ];
      const foundRequired = requiredBuckets.filter((name) =>
        bucketNames.includes(name),
      );
      const missingRequired = requiredBuckets.filter(
        (name) => !bucketNames.includes(name),
      );

      setResult({
        success: true,
        totalBuckets: buckets.length,
        allBuckets: bucketNames,
        foundRequired,
        missingRequired,
        data: buckets,
      });
    } catch (err) {
      console.error("Verification error:", err);
      setResult({
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setChecking(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Raw Bucket Verification</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={verifyBuckets}
            disabled={checking}
          >
            {checking ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Database className="h-4 w-4 mr-2" />
            )}
            Verify Buckets
          </Button>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Direct API check to see if buckets actually exist in Supabase
        </p>
      </CardHeader>
      <CardContent>
        {!result ? (
          <Alert>
            <Database className="h-4 w-4" />
            <AlertDescription>
              Click "Verify Buckets" to make a direct API call to Supabase and
              see the real bucket status.
            </AlertDescription>
          </Alert>
        ) : result.success ? (
          <div className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                ✅ Successfully connected to Supabase Storage API
              </AlertDescription>
            </Alert>

            <div>
              <h4 className="font-medium mb-2">Bucket Status:</h4>
              <div className="space-y-2">
                <Badge variant="default">
                  Total Buckets Found: {result.totalBuckets}
                </Badge>

                {result.foundRequired.length > 0 && (
                  <div>
                    <Badge variant="default" className="mr-2">
                      ✅ Found Required: {result.foundRequired.length}/3
                    </Badge>
                    <div className="text-sm text-green-600 mt-1">
                      {result.foundRequired.join(", ")}
                    </div>
                  </div>
                )}

                {result.missingRequired.length > 0 && (
                  <div>
                    <Badge variant="destructive" className="mr-2">
                      ❌ Missing Required: {result.missingRequired.length}/3
                    </Badge>
                    <div className="text-sm text-red-600 mt-1">
                      {result.missingRequired.join(", ")}
                    </div>
                  </div>
                )}

                {result.allBuckets.length > 0 && (
                  <div className="mt-3">
                    <h5 className="text-sm font-medium">All Buckets Found:</h5>
                    <div className="text-sm text-muted-foreground">
                      {result.allBuckets.join(", ")}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {result.missingRequired.length === 0 ? (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  🎉 All required buckets exist! The issue is likely RLS
                  policies blocking access.
                  <br />
                  <strong>Next step:</strong> Run the RLS fix script in your
                  Supabase SQL Editor.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Some buckets are missing. Create them manually in your
                  Supabase Dashboard → Storage.
                </AlertDescription>
              </Alert>
            )}
          </div>
        ) : (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Verification Failed:</strong> {result.error}
              {result.status && (
                <div className="mt-2 text-sm">HTTP Status: {result.status}</div>
              )}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
