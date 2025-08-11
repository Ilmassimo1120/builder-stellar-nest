import React, { useState, useEffect } from "react";
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
  Loader2,
  Users,
  Download,
} from "lucide-react";
import {
  directSupabase,
  testBucketAccess,
  testLogin,
  testLogout,
  getTestUser,
  testFileUpload,
  testFileList,
} from "@/lib/directSupabase";

export default function DirectStorageTest() {
  const [testUser, setTestUser] = useState<any>(null);
  const [email, setEmail] = useState("test@chargesource.com");
  const [bucketStatus, setBucketStatus] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing test user
    const user = getTestUser();
    setTestUser(user);

    // Test bucket access immediately
    checkBuckets();
  }, []);

  const checkBuckets = async () => {
    setLoading(true);
    try {
      const result = await testBucketAccess();
      setBucketStatus(result);

      if (!result.success) {
        setError(`Bucket access failed: ${result.error}`);
      } else {
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      const user = await testLogin(email);
      setTestUser(user);
      setError(null);

      // Load files after login
      await loadFiles();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  };

  const handleLogout = () => {
    testLogout();
    setTestUser(null);
    setFiles([]);
    setUploadResult(null);
  };

  const handleFileUpload = async () => {
    if (!selectedFile || !testUser) return;

    setLoading(true);
    setError(null);

    try {
      const result = await testFileUpload(
        selectedFile,
        "charge-source-documents",
      );

      if (result.success) {
        setUploadResult(result);
        setSelectedFile(null);
        await loadFiles(); // Reload file list
      } else {
        setError(`Upload failed: ${result.error}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const loadFiles = async () => {
    if (!testUser) return;

    try {
      const result = await testFileList("charge-source-documents");

      if (result.success) {
        setFiles(result.files);
      } else {
        setError(`Failed to load files: ${result.error}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load files");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5" />
          <span>Direct Storage Test</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Simplified test that bypasses authentication issues
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Bucket Status */}
        <div>
          <h4 className="font-medium mb-3">Storage Bucket Status</h4>
          <div className="flex items-center space-x-2 mb-3">
            <Button
              variant="outline"
              size="sm"
              onClick={checkBuckets}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Check Buckets
            </Button>
            {bucketStatus && (
              <Badge variant={bucketStatus.success ? "default" : "destructive"}>
                {bucketStatus.success ? "Connected" : "Failed"}
              </Badge>
            )}
          </div>

          {bucketStatus && (
            <div className="space-y-2">
              {bucketStatus.success ? (
                <div>
                  <div className="text-sm text-green-600">
                    ✅ Found {bucketStatus.buckets.length} total buckets
                  </div>
                  <div className="text-sm">
                    <strong>Required buckets found:</strong>{" "}
                    {bucketStatus.foundRequired.join(", ") || "none"}
                  </div>
                  {bucketStatus.missingRequired.length > 0 && (
                    <div className="text-sm text-red-600">
                      <strong>Missing:</strong>{" "}
                      {bucketStatus.missingRequired.join(", ")}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground">
                    All buckets: {bucketStatus.buckets.join(", ")}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-red-600">
                  ❌ Error: {bucketStatus.error}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Authentication */}
        <div>
          <h4 className="font-medium mb-3">Test Authentication</h4>
          {!testUser ? (
            <div className="space-y-3">
              <div>
                <Label htmlFor="email">Test Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="test@example.com"
                />
              </div>
              <Button onClick={handleLogin} className="w-full">
                <Users className="h-4 w-4 mr-2" />
                Create Test Session
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Logged in as: <strong>{testUser.email}</strong>
                  <br />
                  User ID: <code className="text-xs">{testUser.id}</code>
                </AlertDescription>
              </Alert>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          )}
        </div>

        {/* File Upload */}
        {testUser && bucketStatus?.success && (
          <div>
            <h4 className="font-medium mb-3">File Upload Test</h4>
            <div className="space-y-3">
              <div>
                <Label htmlFor="file">Select File</Label>
                <Input
                  id="file"
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
              </div>

              <Button
                onClick={handleFileUpload}
                disabled={!selectedFile || loading}
                className="w-full"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                Upload to charge-source-documents
              </Button>

              {uploadResult && uploadResult.success && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    ✅ File uploaded successfully!
                    <br />
                    Path:{" "}
                    <code className="text-xs">{uploadResult.data.path}</code>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        )}

        {/* File List */}
        {testUser && files.length > 0 && (
          <div>
            <h4 className="font-medium mb-3">
              Uploaded Files ({files.length})
            </h4>
            <div className="space-y-2">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 border rounded"
                >
                  <div>
                    <div className="font-medium text-sm">{file.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(file.updated_at).toLocaleString()}
                    </div>
                  </div>
                  {file.signedUrl && (
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={file.signedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </a>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Success Message */}
        {bucketStatus?.success && testUser && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              🎉 Storage test is working! You can upload files and they're being
              stored correctly in Supabase.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
