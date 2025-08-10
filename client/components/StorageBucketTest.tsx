import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";
import { bucketInitService } from "@/lib/services/bucketInitService";
import FileUpload from "./FileUpload";
import SupabaseStorageDiagnostics from "./SupabaseStorageDiagnostics";
import CORSFixGuide from "./CORSFixGuide";
import { 
  Folder, 
  Upload, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  RefreshCw,
  HardDrive,
  Database
} from "lucide-react";

interface BucketStatus {
  id: string;
  name: string;
  exists: boolean;
  maxSize: string;
  allowedTypes: number;
}

interface TestResult {
  test: string;
  status: 'success' | 'error' | 'warning' | 'info';
  message: string;
  details?: string;
}

export default function StorageBucketTest() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [bucketStatus, setBucketStatus] = useState<BucketStatus[]>([]);
  const [testing, setTesting] = useState(false);
  const [bucketsTested, setBucketsTested] = useState(false);

  const addResult = (test: string, status: TestResult['status'], message: string, details?: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const emoji = status === 'success' ? '✅' : status === 'error' ? '❌' : status === 'warning' ? '⚠️' : 'ℹ���';
    setTestResults(prev => [...prev, {
      test: `${timestamp} ${emoji} ${test}`,
      status,
      message,
      details
    }]);
  };

  const clearResults = () => setTestResults([]);

  const testStorageConnection = async () => {
    setTesting(true);
    clearResults();
    addResult("Storage Test", "info", "Starting storage connection tests...");

    try {
      // Test 1: Check storage API connectivity
      addResult("API Connectivity", "info", "Testing storage API...");
      try {
        const { data: buckets, error } = await supabase.storage.listBuckets();
        
        if (error) {
          addResult("API Connectivity", "error", `Storage API error: ${error.message}`, 
            "Cannot access storage API. Check CORS settings and project configuration.");
        } else {
          addResult("API Connectivity", "success", "Storage API accessible", 
            `Found ${buckets?.length || 0} existing buckets`);
          
          // Show existing buckets
          if (buckets && buckets.length > 0) {
            const bucketNames = buckets.map(b => b.name).join(', ');
            addResult("Existing Buckets", "info", `Current buckets: ${bucketNames}`);
          } else {
            addResult("Existing Buckets", "warning", "No storage buckets found", 
              "You need to create storage buckets for file uploads to work.");
          }
        }
      } catch (error) {
        addResult("API Connectivity", "error", `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          "Network or CORS issue. Check your internet connection and Supabase project settings.");
      }

      // Test 2: Check bucket initialization service
      addResult("Bucket Service", "info", "Testing bucket initialization service...");
      try {
        const bucketCheck = await bucketInitService.checkBuckets();
        
        if (bucketCheck.allExist) {
          addResult("Required Buckets", "success", "All required buckets exist", 
            `Found: ${bucketCheck.existing.join(', ')}`);
        } else {
          addResult("Required Buckets", "warning", "Missing required buckets", 
            `Missing: ${bucketCheck.missing.join(', ')}`);
        }

        // Get detailed status
        const status = await bucketInitService.getBucketStatus();
        setBucketStatus(status.buckets);
        setBucketsTested(true);
        
      } catch (error) {
        addResult("Bucket Service", "error", `Service test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      // Test 3: Test file upload permissions (without actually uploading)
      addResult("Permissions", "info", "Testing upload permissions...");
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          addResult("User Auth", "warning", "No active user session", 
            "File uploads require authentication. Login to test upload functionality.");
        } else if (user) {
          addResult("User Auth", "success", `Authenticated as: ${user.email}`, 
            "Ready for file uploads");
        } else {
          addResult("User Auth", "warning", "Anonymous user", 
            "File uploads may be restricted for anonymous users");
        }
      } catch (error) {
        addResult("Permissions", "error", `Auth check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      addResult("Storage Test", "success", "Storage connection test completed!");

    } catch (error) {
      addResult("Storage Test", "error", `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setTesting(false);
    }
  };

  const initializeBuckets = async () => {
    setTesting(true);
    addResult("Bucket Init", "info", "Initializing storage buckets...");

    try {
      const result = await bucketInitService.initializeBuckets();
      
      if (result.success) {
        addResult("Bucket Init", "success", "Bucket initialization completed!", 
          `Created: ${result.created.length}, Existing: ${result.existing.length}, Errors: ${result.errors.length}`);
        
        if (result.created.length > 0) {
          addResult("New Buckets", "success", `Created buckets: ${result.created.join(', ')}`);
        }
        
        if (result.existing.length > 0) {
          addResult("Existing Buckets", "info", `Already existed: ${result.existing.join(', ')}`);
        }
        
        if (result.errors.length > 0) {
          addResult("Bucket Errors", "error", `Errors: ${result.errors.join(', ')}`);
        }
      } else {
        addResult("Bucket Init", "error", "Bucket initialization failed", 
          `Errors: ${result.errors.join(', ')}`);
      }

      // Refresh bucket status
      const status = await bucketInitService.getBucketStatus();
      setBucketStatus(status.buckets);
      
    } catch (error) {
      addResult("Bucket Init", "error", `Initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setTesting(false);
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'info': return <Database className="w-4 h-4 text-blue-500" />;
    }
  };

  const handleUploadComplete = (files: any[]) => {
    addResult("File Upload", "success", `Successfully uploaded ${files.length} file(s)`, 
      files.map(f => f.name).join(', '));
  };

  const handleUploadError = (error: string) => {
    addResult("File Upload", "error", `Upload failed: ${error}`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="w-5 h-5" />
            Storage Bucket Test & Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="cors-fix" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="cors-fix">🔧 Fix CORS</TabsTrigger>
              <TabsTrigger value="test">Connection Test</TabsTrigger>
              <TabsTrigger value="buckets">Bucket Status</TabsTrigger>
              <TabsTrigger value="upload">File Upload</TabsTrigger>
              <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
            </TabsList>

            <TabsContent value="cors-fix" className="space-y-4">
              <CORSFixGuide />
            </TabsContent>

            <TabsContent value="test" className="space-y-4">
              <div className="flex gap-2">
                <Button 
                  onClick={testStorageConnection} 
                  disabled={testing}
                  variant="outline"
                >
                  {testing ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Database className="w-4 h-4 mr-2" />
                      Test Storage
                    </>
                  )}
                </Button>
                
                <Button 
                  onClick={initializeBuckets} 
                  disabled={testing}
                  variant="outline"
                >
                  <Folder className="w-4 h-4 mr-2" />
                  Initialize Buckets
                </Button>
                
                <Button 
                  onClick={clearResults} 
                  disabled={testing}
                  variant="ghost"
                >
                  Clear Results
                </Button>
              </div>

              {/* Test Results */}
              {testResults.length > 0 && (
                <div className="bg-black text-green-400 p-4 rounded font-mono text-sm max-h-96 overflow-y-auto">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold">Storage Test Results:</span>
                    <Badge variant="outline" className="text-green-400 border-green-400">
                      {testResults.length} entries
                    </Badge>
                  </div>
                  {testResults.map((result, index) => (
                    <div key={index} className="mb-1">
                      <div>{result.test}: {result.message}</div>
                      {result.details && (
                        <div className="text-blue-300 text-xs ml-4">└─ {result.details}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="buckets" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Required Storage Buckets</h3>
                  {bucketsTested && (
                    <Badge variant="outline">
                      {bucketStatus.filter(b => b.exists).length} / {bucketStatus.length} Ready
                    </Badge>
                  )}
                </div>

                {!bucketsTested ? (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Run the storage test first to check bucket status.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {bucketStatus.map(bucket => (
                      <Card key={bucket.id} className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Folder className="w-4 h-4" />
                            <span className="font-medium text-sm">{bucket.name}</span>
                          </div>
                          {bucket.exists ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <div>Status: {bucket.exists ? "Exists" : "Missing"}</div>
                          <div>Max Size: {bucket.maxSize}</div>
                          <div>File Types: {bucket.allowedTypes}</div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Bucket Creation:</strong> If buckets are missing, click "Initialize Buckets" 
                    in the Connection Test tab to create them automatically.
                  </AlertDescription>
                </Alert>
              </div>
            </TabsContent>

            <TabsContent value="upload" className="space-y-4">
              <div className="space-y-4">
                <Alert>
                  <Upload className="h-4 w-4" />
                  <AlertDescription>
                    <strong>File Upload Test:</strong> Use this to test the actual file upload functionality. 
                    You must be logged in to upload files.
                  </AlertDescription>
                </Alert>

                <FileUpload
                  category="general"
                  multiple={true}
                  maxFiles={3}
                  onUploadComplete={handleUploadComplete}
                  onUploadError={handleUploadError}
                  metadata={{ description: "Storage test upload" }}
                />
              </div>
            </TabsContent>

            <TabsContent value="diagnostics" className="space-y-4">
              <SupabaseStorageDiagnostics />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
