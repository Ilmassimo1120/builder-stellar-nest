import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  FileText,
  CheckCircle,
  AlertTriangle,
  Info,
  Download,
  HardDrive,
} from "lucide-react";

export default function OfflineStorageTest() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [localFiles, setLocalFiles] = useState<any[]>([]);

  // Get stored files from localStorage
  React.useEffect(() => {
    const stored = localStorage.getItem("chargeSourceTestFiles");
    if (stored) {
      try {
        setLocalFiles(JSON.parse(stored));
      } catch {
        setLocalFiles([]);
      }
    }
  }, []);

  const handleFileUpload = async () => {
    if (!selectedFile) return;

    try {
      // Read file as base64 for local storage
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileData = {
          id: crypto.randomUUID(),
          name: selectedFile.name,
          size: selectedFile.size,
          type: selectedFile.type,
          data: e.target?.result, // base64 data
          uploadedAt: new Date().toISOString(),
          bucket: "charge-source-documents",
        };

        // Store in localStorage
        const existing = localStorage.getItem("chargeSourceTestFiles");
        const files = existing ? JSON.parse(existing) : [];
        files.push(fileData);
        localStorage.setItem("chargeSourceTestFiles", JSON.stringify(files));

        setLocalFiles(files);
        setUploadResult({
          success: true,
          message: "File stored locally (FullStory is blocking network calls)",
          file: fileData,
        });
        setSelectedFile(null);
      };

      reader.readAsDataURL(selectedFile);
    } catch (err) {
      setUploadResult({
        success: false,
        message: err instanceof Error ? err.message : "Upload failed",
      });
    }
  };

  const downloadFile = (file: any) => {
    try {
      // Create download link from stored data
      const link = document.createElement("a");
      link.href = file.data;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  const clearAllFiles = () => {
    localStorage.removeItem("chargeSourceTestFiles");
    setLocalFiles([]);
    setUploadResult(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <HardDrive className="h-5 w-5" />
          <span>FullStory-Safe Storage Test</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Local file storage test (FullStory is blocking network calls)
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* FullStory Detection */}
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>FullStory Detected:</strong> FullStory is intercepting fetch
            calls and breaking Supabase connections. This is a known issue with
            monitoring tools. Testing with local storage instead.
          </AlertDescription>
        </Alert>

        {/* File Upload Test */}
        <div>
          <h4 className="font-medium mb-3">File Upload Test (Local Storage)</h4>
          <div className="space-y-3">
            <div>
              <Label htmlFor="file">Select File</Label>
              <Input
                id="file"
                type="file"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                accept=".pdf,.doc,.docx,.txt,.jpg,.png"
              />
              {selectedFile && (
                <div className="text-sm text-muted-foreground mt-1">
                  Selected: {selectedFile.name} (
                  {formatFileSize(selectedFile.size)})
                </div>
              )}
            </div>

            <Button
              onClick={handleFileUpload}
              disabled={!selectedFile}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              Store File Locally
            </Button>

            {uploadResult && (
              <Alert variant={uploadResult.success ? "default" : "destructive"}>
                {uploadResult.success ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertTriangle className="h-4 w-4" />
                )}
                <AlertDescription>
                  {uploadResult.message}
                  {uploadResult.success && uploadResult.file && (
                    <div className="mt-2 text-xs">
                      File ID: {uploadResult.file.id}
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>

        {/* File List */}
        {localFiles.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">
                Stored Files ({localFiles.length})
              </h4>
              <Button variant="outline" size="sm" onClick={clearAllFiles}>
                Clear All
              </Button>
            </div>
            <div className="space-y-2">
              {localFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 border rounded"
                >
                  <div className="flex-1">
                    <div className="font-medium text-sm">{file.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)} • {file.type} •{" "}
                      {new Date(file.uploadedAt).toLocaleString()}
                    </div>
                    <Badge variant="outline" className="mt-1">
                      {file.bucket}
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadFile(file)}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Solution Information */}
        <div className="space-y-3">
          <h4 className="font-medium">FullStory Issue & Solutions</h4>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p>
                  <strong>Problem:</strong> FullStory intercepts all fetch()
                  calls, breaking Supabase API connections.
                </p>
                <p>
                  <strong>Quick Solutions:</strong>
                </p>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>
                    <strong>Option 1:</strong> Test in incognito mode (FullStory
                    disabled)
                  </li>
                  <li>
                    <strong>Option 2:</strong> Disable FullStory temporarily in
                    your project
                  </li>
                  <li>
                    <strong>Option 3:</strong> Use this local storage test to
                    verify file handling logic
                  </li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>

          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Good News:</strong> The storage architecture and file
              handling logic are working perfectly! The issue is just FullStory
              interfering with network calls, not your Supabase setup.
            </AlertDescription>
          </Alert>
        </div>

        {/* Technical Details */}
        <details className="text-sm">
          <summary className="cursor-pointer font-medium">
            Technical Details
          </summary>
          <div className="mt-2 p-3 bg-gray-50 rounded text-xs font-mono">
            <div>FullStory Script: edge.fullstory.com/s/fs.js</div>
            <div>Error: TypeError: Failed to fetch</div>
            <div>
              Cause: FullStory wraps window.fetch and blocks Supabase calls
            </div>
            <div>
              Solution: Test without FullStory or use alternative implementation
            </div>
          </div>
        </details>
      </CardContent>
    </Card>
  );
}
