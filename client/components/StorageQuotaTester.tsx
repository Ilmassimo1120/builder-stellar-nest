import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  Download,
  Trash2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  HardDrive,
} from "lucide-react";
import {
  storageQuotaService,
  type StorageMetrics,
} from "@/lib/services/storageQuotaService";
import { toast } from "sonner";

interface TestResult {
  id: string;
  bucketName: string;
  fileSize: number;
  fileSizeMB: number;
  uploadSpeed?: number;
  uploadTime?: number;
  status: "success" | "error";
  message: string;
  timestamp: Date;
  filePath?: string;
}

const FILE_SIZE_OPTIONS = [1, 5, 10, 20, 50];

export default function StorageQuotaTester() {
  const [selectedBucket, setSelectedBucket] = useState<string>("documents");
  const [selectedSize, setSelectedSize] = useState<number>(1);
  const [isUploading, setIsUploading] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [currentProgress, setCurrentProgress] = useState(0);

  const bucketOptions = ["product-images", "documents", "quote-attachments"];

  const handleTestUpload = async () => {
    if (!selectedBucket || !selectedSize) {
      toast.error("Please select a bucket and file size");
      return;
    }

    setIsUploading(true);
    setCurrentProgress(0);
    const testId = `test-${Date.now()}`;

    try {
      // Generate test file
      console.log(`Generating ${selectedSize}MB test file...`);
      setCurrentProgress(25);

      const testFile = storageQuotaService.generateTestFile(selectedSize);

      // Upload file
      console.log(`Uploading to ${selectedBucket}...`);
      setCurrentProgress(50);

      const metrics = await storageQuotaService.uploadTestFile(
        selectedBucket,
        testFile,
      );

      setCurrentProgress(75);

      const result: TestResult = {
        id: testId,
        bucketName: selectedBucket,
        fileSize: metrics.fileSize,
        fileSizeMB: selectedSize,
        uploadSpeed: metrics.uploadSpeed,
        uploadTime: metrics.uploadTime,
        status: "success",
        message: `Successfully uploaded ${selectedSize}MB file`,
        timestamp: new Date(),
        filePath: `tests/${testFile.name}`,
      };

      setTestResults((prev) => [result, ...prev]);
      setCurrentProgress(100);

      toast.success(
        `Uploaded ${selectedSize}MB at ${storageQuotaService.formatSpeed(metrics.uploadSpeed)}`,
      );

      // Reset selection
      setTimeout(() => {
        setCurrentProgress(0);
      }, 1000);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      // Check if it's a quota exceeded error
      let message = errorMessage;
      if (
        errorMessage.includes("resource_limit_exceeded") ||
        errorMessage.includes("payload too large") ||
        errorMessage.includes("quota")
      ) {
        message = "Storage quota exceeded! The bucket is full.";
      }

      const result: TestResult = {
        id: testId,
        bucketName: selectedBucket,
        fileSize: selectedSize * 1024 * 1024,
        fileSizeMB: selectedSize,
        status: "error",
        message,
        timestamp: new Date(),
      };

      setTestResults((prev) => [result, ...prev]);
      toast.error(message);
      setCurrentProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteFile = async (result: TestResult) => {
    if (!result.filePath) {
      toast.error("No file path available");
      return;
    }

    try {
      await storageQuotaService.deleteTestFile(
        result.bucketName,
        result.filePath,
      );
      setTestResults((prev) => prev.filter((r) => r.id !== result.id));
      toast.success("Test file deleted");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.error(`Delete failed: ${errorMessage}`);
    }
  };

  const handleCleanup = async () => {
    if (!selectedBucket) {
      toast.error("Please select a bucket");
      return;
    }

    try {
      setIsUploading(true);
      const cleaned =
        await storageQuotaService.cleanupOldTestFiles(selectedBucket);
      toast.success(`Cleaned up ${cleaned} old test file(s)`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.error(`Cleanup failed: ${errorMessage}`);
    } finally {
      setIsUploading(false);
    }
  };

  const getStatusIcon = (status: TestResult["status"]) => {
    return status === "success" ? (
      <CheckCircle className="w-5 h-5 text-green-500" />
    ) : (
      <XCircle className="w-5 h-5 text-red-500" />
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Storage Upload Tester
        </CardTitle>
        <CardDescription>
          Test file uploads to buckets and monitor storage quota usage
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Safety Warning */}
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            Test files use your storage quota. Files are stored in a /tests/
            folder and can be manually cleaned up. Use "Cleanup Old Files" to
            remove test files older than 1 hour.
          </AlertDescription>
        </Alert>

        {/* Test Configuration */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Bucket Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Bucket</label>
              <Select value={selectedBucket} onValueChange={setSelectedBucket}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose bucket" />
                </SelectTrigger>
                <SelectContent>
                  {bucketOptions.map((bucket) => (
                    <SelectItem key={bucket} value={bucket}>
                      {bucket}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* File Size Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium">File Size (MB)</label>
              <Select
                value={selectedSize.toString()}
                onValueChange={(v) => setSelectedSize(parseInt(v))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose size" />
                </SelectTrigger>
                <SelectContent>
                  {FILE_SIZE_OPTIONS.map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {size}MB
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleTestUpload}
              disabled={isUploading || !selectedBucket || !selectedSize}
              className="flex-1"
            >
              {isUploading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Test Upload
                </>
              )}
            </Button>

            <Button
              onClick={handleCleanup}
              disabled={isUploading || !selectedBucket}
              variant="outline"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Cleanup Old Files
            </Button>
          </div>

          {/* Progress Bar */}
          {isUploading && currentProgress > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Upload Progress</span>
                <span className="font-medium">{currentProgress}%</span>
              </div>
              <Progress value={currentProgress} className="h-2" />
            </div>
          )}
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">
                Test Results ({testResults.length})
              </h3>
              <Button
                onClick={() => setTestResults([])}
                variant="ghost"
                size="sm"
              >
                Clear
              </Button>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {testResults.map((result) => (
                <div
                  key={result.id}
                  className="border rounded-lg p-4 space-y-3 bg-slate-50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      {getStatusIcon(result.status)}
                      <div className="flex-1">
                        <p className="font-medium text-sm">{result.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {result.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    {result.status === "success" && result.filePath && (
                      <Button
                        onClick={() => handleDeleteFile(result)}
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  {/* Result Details */}
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-white p-2 rounded border">
                      <p className="text-muted-foreground">Bucket</p>
                      <p className="font-medium">{result.bucketName}</p>
                    </div>
                    <div className="bg-white p-2 rounded border">
                      <p className="text-muted-foreground">Size</p>
                      <p className="font-medium">{result.fileSizeMB}MB</p>
                    </div>
                    {result.status === "success" && result.uploadSpeed ? (
                      <div className="bg-white p-2 rounded border">
                        <p className="text-muted-foreground">Speed</p>
                        <p className="font-medium">
                          {storageQuotaService.formatSpeed(result.uploadSpeed)}
                        </p>
                      </div>
                    ) : (
                      <div className="bg-white p-2 rounded border">
                        <p className="text-muted-foreground">Status</p>
                        <Badge variant="destructive" className="text-xs">
                          Failed
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Results Message */}
        {testResults.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <HardDrive className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No test results yet. Click "Test Upload" to start testing.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
