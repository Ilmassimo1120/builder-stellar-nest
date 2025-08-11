import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  AlertTriangle,
  Loader2,
  Database,
  HardDrive,
  Info,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface BucketStatus {
  name: string;
  exists: boolean;
  description: string;
  maxSize: string;
}

export default function ChargeSourceStorageSetup() {
  const [buckets, setBuckets] = useState<BucketStatus[]>([
    {
      name: "charge-source-user-files",
      exists: false,
      description: "Personal files and general documents",
      maxSize: "50MB",
    },
    {
      name: "charge-source-documents",
      exists: false,
      description: "Official documents, manuals, and reports",
      maxSize: "100MB",
    },
    {
      name: "charge-source-videos",
      exists: false,
      description: "Training videos and media content",
      maxSize: "500MB",
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkBuckets = async () => {
    try {
      const { data, error } = await supabase.storage.listBuckets();

      if (error) {
        throw error;
      }

      const existingBucketNames = data?.map((b) => b.name) || [];

      setBuckets((prev) =>
        prev.map((bucket) => ({
          ...bucket,
          exists: existingBucketNames.includes(bucket.name),
        })),
      );

      const allExist = buckets.every((bucket) =>
        existingBucketNames.includes(bucket.name),
      );

      setSetupComplete(allExist);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to check buckets");
    }
  };

  const createBuckets = async () => {
    setLoading(true);
    setError(null);

    try {
      // Use server endpoint to create buckets with service role privileges
      const response = await fetch("/api/create-storage-buckets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      let result;
      let errorMessage = "Failed to create buckets";

      try {
        result = await response.json();
      } catch (parseError) {
        // If JSON parsing fails, try to get text
        const text = await response.text();
        throw new Error(
          `Server response error: ${response.status} - ${text || response.statusText}`,
        );
      }

      if (!response.ok) {
        throw new Error(result?.error || result?.details || errorMessage);
      }

      if (!result.success) {
        throw new Error(result.message || "Failed to create some buckets");
      }

      // Recheck buckets after creation
      await checkBuckets();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create buckets");
    } finally {
      setLoading(false);
    }
  };

  const getBucketMimeTypes = (bucketName: string): string[] => {
    switch (bucketName) {
      case "charge-source-user-files":
        return [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "application/vnd.ms-excel",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "text/plain",
          "text/csv",
          "image/jpeg",
          "image/png",
          "image/webp",
        ];
      case "charge-source-documents":
        return [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "application/vnd.ms-excel",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "text/plain",
          "text/csv",
          "application/zip",
          "application/x-zip-compressed",
        ];
      case "charge-source-videos":
        return [
          "video/mp4",
          "video/mpeg",
          "video/quicktime",
          "video/x-msvideo",
          "video/webm",
        ];
      default:
        return [];
    }
  };

  const getBucketSizeLimit = (bucketName: string): number => {
    switch (bucketName) {
      case "charge-source-user-files":
        return 50 * 1024 * 1024; // 50MB
      case "charge-source-documents":
        return 100 * 1024 * 1024; // 100MB
      case "charge-source-videos":
        return 500 * 1024 * 1024; // 500MB
      default:
        return 10 * 1024 * 1024; // 10MB default
    }
  };

  React.useEffect(() => {
    checkBuckets();
  }, []);

  const missingBuckets = buckets.filter((b) => !b.exists);
  const existingBuckets = buckets.filter((b) => b.exists);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Database className="h-5 w-5" />
          <span>ChargeSource Storage Setup</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Configure the required storage buckets for document management
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>How it works:</strong> Storage buckets are created
            server-side with service role privileges. Click "Create Missing
            Buckets" to automatically set up the required storage containers for
            your ChargeSource documents.
          </AlertDescription>
        </Alert>
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p>
                  <strong>Error:</strong> {error}
                </p>
                {error.includes("row-level security") && (
                  <p className="text-sm">
                    <strong>Note:</strong> Storage bucket creation requires
                    service role privileges. This is normal - the server will
                    handle bucket creation with the proper permissions.
                  </p>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {setupComplete ? (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              ✅ All storage buckets are configured and ready for use!
            </AlertDescription>
          </Alert>
        ) : (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              ⚠️ {missingBuckets.length} storage buckets need to be created
              before document upload will work.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          <h4 className="font-medium">Storage Buckets Status:</h4>

          {buckets.map((bucket) => (
            <div
              key={bucket.name}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <HardDrive className="h-4 w-4" />
                <div>
                  <div className="font-medium">{bucket.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {bucket.description} (Max {bucket.maxSize})
                  </div>
                </div>
              </div>

              <Badge variant={bucket.exists ? "default" : "destructive"}>
                {bucket.exists ? (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Ready
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Missing
                  </>
                )}
              </Badge>
            </div>
          ))}
        </div>

        <div className="flex space-x-2">
          <Button onClick={checkBuckets} variant="outline" disabled={loading}>
            Refresh Status
          </Button>

          {missingBuckets.length > 0 && (
            <Button onClick={createBuckets} disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Missing Buckets ({missingBuckets.length})
            </Button>
          )}
        </div>

        {setupComplete && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">
              🎉 Setup Complete!
            </h4>
            <p className="text-sm text-green-700">
              Your ChargeSource document storage is now ready. You can:
            </p>
            <ul className="text-sm text-green-700 mt-2 space-y-1">
              <li>• Upload files to organize by user or organization</li>
              <li>• Store documents up to 100MB each</li>
              <li>• Upload training videos up to 500MB each</li>
              <li>• Manage personal files up to 50MB each</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
