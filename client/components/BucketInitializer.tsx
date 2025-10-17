import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BucketInitService } from "@/lib/services/bucketInitService";
import { AlertCircle, CheckCircle, Clock, Loader2 } from "lucide-react";
import { stableKey } from "@/lib/stableKey";

export default function BucketInitializer() {
  const [isInitializing, setIsInitializing] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    created: string[];
    existing: string[];
    errors: string[];
  } | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `${timestamp}: ${message}`]);
  };

  const initializeBuckets = async () => {
    setIsInitializing(true);
    setLogs([]);
    setResult(null);

    try {
      addLog("🚀 Starting bucket initialization...");
      addLog("🔑 Using service role authentication...");

      const bucketService = new BucketInitService();
      const initResult = await bucketService.initializeBuckets();

      setResult(initResult);

      if (initResult.success) {
        addLog(`✅ Initialization completed successfully`);
        addLog(
          `📊 Created: ${initResult.created.length}, Existing: ${initResult.existing.length}`,
        );
      } else {
        addLog(`❌ Initialization completed with errors`);
        initResult.errors.forEach((error) => addLog(`❌ Error: ${error}`));
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      addLog(`💥 Failed to initialize buckets: ${errorMessage}`);
      setResult({
        success: false,
        created: [],
        existing: [],
        errors: [errorMessage],
      });
    } finally {
      setIsInitializing(false);
    }
  };

  const requiredBuckets = [
    { name: "product-images", public: true, purpose: "Product catalog images" },
    {
      name: "documents",
      public: false,
      purpose: "Project documents and files",
    },
    { name: "quote-attachments", public: false, purpose: "Quote attachments" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🪣 Storage Bucket Initializer
          {result && (
            <Badge variant={result.success ? "default" : "destructive"}>
              {result.success ? "Success" : "Errors"}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <h4 className="font-medium mb-2">Required Buckets:</h4>
            <div className="space-y-2">
              {requiredBuckets.map((bucket) => (
                <div
                  key={bucket.name}
                  className="flex items-center justify-between p-2 border rounded"
                >
                  <div>
                    <span className="font-mono text-sm">{bucket.name}</span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      ({bucket.public ? "Public" : "Private"})
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {bucket.purpose}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Button
            onClick={initializeBuckets}
            disabled={isInitializing}
            className="w-full"
          >
            {isInitializing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Buckets...
              </>
            ) : (
              "Initialize Storage Buckets"
            )}
          </Button>

          {result && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {result.success ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                )}
                <span className="font-medium">
                  {result.success
                    ? "Initialization Successful"
                    : "Initialization Failed"}
                </span>
              </div>

              {result.created.length > 0 && (
                <div className="p-2 bg-green-50 border border-green-200 rounded">
                  <strong>Created:</strong> {result.created.join(", ")}
                </div>
              )}

              {result.existing.length > 0 && (
                <div className="p-2 bg-blue-50 border border-blue-200 rounded">
                  <strong>Already Existed:</strong> {result.existing.join(", ")}
                </div>
              )}

              {result.errors.length > 0 && (
                <div className="p-2 bg-red-50 border border-red-200 rounded">
                  <strong>Errors:</strong>
                  <ul className="list-disc list-inside mt-1 text-sm">
                    {result.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {logs.length > 0 && (
            <div className="bg-black text-green-400 p-3 rounded font-mono text-sm max-h-48 overflow-y-auto">
              {logs.map((log, index) => (
                <div key={index}>{log}</div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
