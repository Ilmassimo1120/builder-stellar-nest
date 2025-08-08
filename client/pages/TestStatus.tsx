import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Database, 
  Wifi, 
  Settings,
  User,
  HardDrive,
  Zap
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import SystemStatus from "@/components/SystemStatus";
import ConnectionStatus from "@/components/ConnectionStatus";
import { bucketInitService } from "@/lib/services/bucketInitService";

interface TestResult {
  name: string;
  status: "success" | "error" | "warning" | "pending";
  message: string;
  details?: any;
  timestamp: string;
}

export default function TestStatus() {
  const { user } = useAuth();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [bucketStatus, setBucketStatus] = useState<any>(null);

  useEffect(() => {
    checkBucketStatus();
  }, []);

  const addResult = (result: Omit<TestResult, "timestamp">) => {
    setTestResults(prev => [...prev, {
      ...result,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const checkBucketStatus = async () => {
    try {
      const status = await bucketInitService.getBucketStatus();
      setBucketStatus(status);
    } catch (error) {
      console.error("Error checking bucket status:", error);
    }
  };

  const runComprehensiveTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    // Test 1: Authentication System
    addResult({
      name: "Authentication Check",
      status: "pending",
      message: "Checking authentication system..."
    });

    try {
      if (user) {
        addResult({
          name: "Authentication Check",
          status: "success", 
          message: `✅ Authenticated as ${user.email} (${user.role})`,
          details: { userId: user.id, role: user.role, email: user.email }
        });
      } else {
        addResult({
          name: "Authentication Check",
          status: "warning",
          message: "⚠️ No active user session"
        });
      }
    } catch (error) {
      addResult({
        name: "Authentication Check",
        status: "error",
        message: `❌ Auth check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: error
      });
    }

    // Test 2: Configuration Loading
    addResult({
      name: "Configuration",
      status: "pending", 
      message: "Loading configuration..."
    });

    try {
      const { config } = await import("@/lib/config");
      const supabaseConfigured = !!(config.VITE_SUPABASE_URL && config.VITE_SUPABASE_ANON_KEY);
      
      addResult({
        name: "Configuration",
        status: supabaseConfigured ? "success" : "warning",
        message: supabaseConfigured 
          ? `✅ Config loaded (${config.NODE_ENV})`
          : "⚠️ Config loaded but Supabase not fully configured",
        details: {
          environment: config.NODE_ENV,
          supabaseConfigured,
          hasSupabaseUrl: !!config.VITE_SUPABASE_URL,
          hasSupabaseKey: !!config.VITE_SUPABASE_ANON_KEY
        }
      });
    } catch (error) {
      addResult({
        name: "Configuration",
        status: "error",
        message: `❌ Config loading failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: error
      });
    }

    // Test 3: Supabase Client
    addResult({
      name: "Supabase Client",
      status: "pending",
      message: "Testing Supabase client..."
    });

    try {
      const { supabase } = await import("@/lib/supabase");
      
      if (supabase) {
        // Try a simple query to test connection
        try {
          const { error } = await supabase.from("file_assets").select("count").limit(1);
          
          if (error) {
            addResult({
              name: "Supabase Client",
              status: "warning",
              message: `⚠️ Client initialized but database connection failed: ${error.message}`,
              details: error
            });
          } else {
            addResult({
              name: "Supabase Client",
              status: "success",
              message: "✅ Supabase client working and database accessible",
            });
          }
        } catch (queryError) {
          addResult({
            name: "Supabase Client", 
            status: "warning",
            message: "⚠️ Client initialized but connection test failed",
            details: queryError
          });
        }
      } else {
        addResult({
          name: "Supabase Client",
          status: "error",
          message: "❌ Supabase client not initialized"
        });
      }
    } catch (error) {
      addResult({
        name: "Supabase Client",
        status: "error",
        message: `❌ Supabase import failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: error
      });
    }

    // Test 4: Storage Buckets
    addResult({
      name: "Storage Buckets",
      status: "pending",
      message: "Checking storage buckets..."
    });

    try {
      const bucketCheck = await bucketInitService.checkBuckets();
      
      addResult({
        name: "Storage Buckets",
        status: bucketCheck.allExist ? "success" : "warning",
        message: bucketCheck.allExist 
          ? `✅ All ${bucketCheck.existing.length} buckets exist`
          : `⚠️ Missing ${bucketCheck.missing.length} buckets: ${bucketCheck.missing.join(', ')}`,
        details: bucketCheck
      });
    } catch (error) {
      addResult({
        name: "Storage Buckets",
        status: "error",
        message: `❌ Bucket check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: error
      });
    }

    // Test 5: File Storage Service
    addResult({
      name: "File Storage Service",
      status: "pending",
      message: "Testing file storage service..."
    });

    try {
      const { safeFileStorageService } = await import("@/lib/services/safeFileStorageService");
      const storageResult = await safeFileStorageService.getStorageUsage();
      
      addResult({
        name: "File Storage Service",
        status: storageResult.error ? "warning" : "success",
        message: storageResult.error 
          ? `⚠️ Service loaded but query failed: ${storageResult.error}`
          : `✅ Storage service working (${storageResult.totalFiles} files, ${(storageResult.totalSize / 1024 / 1024).toFixed(2)} MB)`,
        details: storageResult
      });
    } catch (error) {
      addResult({
        name: "File Storage Service",
        status: "error",
        message: `❌ Storage service test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: error
      });
    }

    // Test 6: Local Storage
    addResult({
      name: "Local Storage",
      status: "pending",
      message: "Testing local storage..."
    });

    try {
      localStorage.setItem("test_chargesource", "test");
      const testValue = localStorage.getItem("test_chargesource");
      localStorage.removeItem("test_chargesource");
      
      addResult({
        name: "Local Storage",
        status: testValue === "test" ? "success" : "error",
        message: testValue === "test" 
          ? "✅ Local storage working"
          : "❌ Local storage read/write failed"
      });
    } catch (error) {
      addResult({
        name: "Local Storage",
        status: "error",
        message: `❌ Local storage not accessible: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: error
      });
    }

    setIsRunning(false);
  };

  const initializeBuckets = async () => {
    try {
      const result = await bucketInitService.initializeBuckets();
      await checkBucketStatus();
      
      addResult({
        name: "Bucket Initialization",
        status: result.success ? "success" : "error",
        message: result.success 
          ? `✅ Buckets initialized: ${result.created.length} created, ${result.existing.length} already existed`
          : `❌ Bucket initialization failed: ${result.errors.join(', ')}`,
        details: result
      });
    } catch (error) {
      addResult({
        name: "Bucket Initialization",
        status: "error",
        message: `❌ Bucket initialization error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: error
      });
    }
  };

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error": 
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "pending":
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
    }
  };

  const getStatusBadge = (status: TestResult["status"]) => {
    const variants = {
      success: "default",
      error: "destructive",
      warning: "outline", 
      pending: "secondary"
    } as const;

    return <Badge variant={variants[status]}>{status.toUpperCase()}</Badge>;
  };

  const overallStatus = testResults.length === 0 
    ? "pending"
    : testResults.every(r => r.status === "success")
    ? "success"
    : testResults.some(r => r.status === "error")
    ? "error" 
    : "warning";

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Test & Status</h1>
          <p className="text-muted-foreground">
            Comprehensive testing of ChargeSource system components
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Link to="/dashboard">
            <Button variant="outline">← Dashboard</Button>
          </Link>
          {getStatusBadge(overallStatus)}
        </div>
      </div>

      {/* Quick Status Overview */}
      {testResults.length > 0 && (
        <Alert variant={overallStatus === "error" ? "destructive" : "default"}>
          <Zap className="h-4 w-4" />
          <AlertDescription>
            {overallStatus === "success" && "🎉 All systems operational"}
            {overallStatus === "warning" && "⚠️ Some systems need attention"}
            {overallStatus === "error" && "❌ Critical issues detected"}
            {overallStatus === "pending" && "🔄 Tests in progress..."}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="comprehensive" className="space-y-6">
        <TabsList>
          <TabsTrigger value="comprehensive">Comprehensive Tests</TabsTrigger>
          <TabsTrigger value="system">System Overview</TabsTrigger>
          <TabsTrigger value="connection">Connection Status</TabsTrigger>
        </TabsList>

        <TabsContent value="comprehensive" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Comprehensive System Tests</CardTitle>
                <Button 
                  onClick={runComprehensiveTests}
                  disabled={isRunning}
                >
                  {isRunning ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Settings className="h-4 w-4 mr-2" />
                      Run All Tests
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {testResults.length === 0 ? (
                <Alert>
                  <AlertDescription>
                    Click "Run All Tests" to perform comprehensive system testing
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-3">
                  {testResults.map((result, index) => (
                    <div key={index} className="flex items-start justify-between p-3 border rounded-lg">
                      <div className="flex items-start space-x-3 flex-1">
                        {getStatusIcon(result.status)}
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="font-medium">{result.name}</div>
                            <div className="text-xs text-muted-foreground">{result.timestamp}</div>
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">{result.message}</div>
                          {result.details && (
                            <details className="mt-2">
                              <summary className="text-xs cursor-pointer">View Details</summary>
                              <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto">
                                {JSON.stringify(result.details, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      </div>
                      {getStatusBadge(result.status)}
                    </div>
                  ))}
                </div>
              )}

              {/* Storage Bucket Quick Fix */}
              {bucketStatus && !bucketStatus.allExist && (
                <Alert>
                  <HardDrive className="h-4 w-4" />
                  <AlertDescription className="flex items-center justify-between">
                    <span>
                      Storage buckets missing: {bucketStatus.missing.join(', ')}
                    </span>
                    <Button onClick={initializeBuckets} size="sm">
                      Create Buckets
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <SystemStatus />
        </TabsContent>

        <TabsContent value="connection">
          <ConnectionStatus />
        </TabsContent>
      </Tabs>

      {/* Demo Credentials Section */}
      <Card>
        <CardHeader>
          <CardTitle>🧪 Demo Authentication</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Available Demo Users:</h4>
              <div className="space-y-2 text-sm">
                <div>📧 <code>admin@chargesource.com.au</code> → Admin role</div>
                <div>📧 <code>globaladmin@chargesource.com.au</code> → Global Admin</div>
                <div>📧 <code>sales@chargesource.com.au</code> → Sales role</div>
                <div>📧 <code>partner@company.com</code> → Partner role</div>
                <div>📧 <code>user@demo.com</code> → Regular user</div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Test Instructions:</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div>• Use any password with the demo emails</div>
                <div>• Different email patterns assign different roles</div>
                <div>• Login persists in localStorage</div>
                <div>• No actual backend authentication required</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
