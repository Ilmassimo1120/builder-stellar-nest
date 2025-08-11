import React, { useState, useEffect } from "react";
import {
  HardDrive,
  Upload,
  FolderOpen,
  Settings,
  BarChart3,
  Shield,
  Database,
  Users,
  FileText,
  Video,
  Image,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Archive,
  TrendingUp,
  Activity,
  ArrowLeft,
  Home,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import EnhancedFileManager from "@/components/EnhancedFileManager";
import FileStorageDebug from "@/components/FileStorageDebug";
import AuthTest from "@/components/AuthTest";
import StorageStatusIndicator from "@/components/StorageStatusIndicator";
import ChargeSourceStorageSetup from "@/components/ChargeSourceStorageSetup";
import { safeFileStorageService } from "@/lib/services/safeFileStorageService";
import { BucketName } from "@/lib/services/enhancedFileStorageService";
import { useAuth } from "@/hooks/useAuth";
import RoleBasedNavigation from "@/components/RoleBasedNavigation";

interface StorageStats {
  totalFiles: number;
  totalSize: number;
  bucketBreakdown: Record<BucketName, { files: number; size: number }>;
  categoryBreakdown: Record<string, { files: number; size: number }>;
}

interface StatusStats {
  draft: number;
  pending_approval: number;
  approved: number;
  rejected: number;
  archived: number;
}

const bucketInfo: Record<
  BucketName,
  {
    label: string;
    icon: React.ComponentType<any>;
    description: string;
    color: string;
    maxSize: string;
  }
> = {
  "charge-source-user-files": {
    label: "User Files",
    icon: Users,
    description: "Personal files and general documents",
    color: "bg-blue-500",
    maxSize: "50MB",
  },
  "charge-source-documents": {
    label: "Documents",
    icon: FileText,
    description: "Official documents, manuals, and reports",
    color: "bg-green-500",
    maxSize: "100MB",
  },
  "charge-source-videos": {
    label: "Videos",
    icon: Video,
    description: "Training videos and media content",
    color: "bg-purple-500",
    maxSize: "500MB",
  },
};

export default function EnhancedFileStorage() {
  const { user, isAdmin, isGlobalAdmin, isSales } = useAuth();
  const [storageStats, setStorageStats] = useState<StorageStats | null>(null);
  const [statusStats, setStatusStats] = useState<StatusStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canApprove = isAdmin || isGlobalAdmin || isSales;

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load storage usage stats
      const usageResult = await safeFileStorageService.getStorageUsage();
      if (usageResult.error) {
        throw new Error(usageResult.error);
      }
      setStorageStats(usageResult);

      // Calculate status distribution
      const filesResult = await safeFileStorageService.searchFiles({});
      if (filesResult.error) {
        throw new Error(filesResult.error);
      }
      const statusCounts = filesResult.files.reduce(
        (acc, file) => {
          acc[file.status] = (acc[file.status] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

      setStatusStats({
        draft: statusCounts.draft || 0,
        pending_approval: statusCounts.pending_approval || 0,
        approved: statusCounts.approved || 0,
        rejected: statusCounts.rejected || 0,
        archived: statusCounts.archived || 0,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load dashboard data",
      );
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getStorageUsagePercentage = (used: number, bucket?: BucketName) => {
    const limits = {
      "charge-source-user-files": 5 * 1024 * 1024 * 1024, // 5GB
      "charge-source-documents": 10 * 1024 * 1024 * 1024, // 10GB
      "charge-source-videos": 50 * 1024 * 1024 * 1024, // 50GB
    };

    const totalLimit = bucket
      ? limits[bucket]
      : Object.values(limits).reduce((a, b) => a + b, 0);
    return Math.min((used / totalLimit) * 100, 100);
  };

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <Alert>
          <AlertDescription>
            Please log in to access file storage.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" asChild>
              <Link to="/dashboard" className="flex items-center space-x-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            </Button>
          </div>
          <RoleBasedNavigation variant="header" />
        </div>
      </header>

      <div className="container mx-auto py-8 space-y-8">
        {/* Navigation Header */}
        <div className="flex items-center space-x-4 mb-6">
          <Button variant="outline" size="sm" asChild>
            <Link to="/dashboard" className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Link>
          </Button>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Link
              to="/dashboard"
              className="hover:text-primary transition-colors"
            >
              <Home className="h-4 w-4" />
            </Link>
            <span>/</span>
            <span className="text-primary font-medium">File Storage</span>
          </div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Enhanced File Storage
            </h1>
            <p className="text-muted-foreground">
              Manage files with advanced metadata, version control, and approval
              workflows
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/document-test" className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Test Documents</span>
              </Link>
            </Button>
            <Badge variant="outline">
              <HardDrive className="h-4 w-4 mr-2" />
              Supabase Storage
            </Badge>
            {isAdmin && (
              <Badge variant="secondary">
                <Shield className="h-4 w-4 mr-2" />
                Admin Access
              </Badge>
            )}
            {canApprove && (
              <Badge variant="outline">
                <CheckCircle className="h-4 w-4 mr-2" />
                Can Approve
              </Badge>
            )}
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Storage Status */}
        <StorageStatusIndicator showDetails={true} />

        {/* ChargeSource Storage Setup */}
        <ChargeSourceStorageSetup />

        {/* Debug Section - Admin Only */}
        {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle>🔧 Debug Section</CardTitle>
              <p className="text-sm text-muted-foreground">
                Admin-only debugging tools for troubleshooting
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <AuthTest />
              <FileStorageDebug />
            </CardContent>
          </Card>
        )}

        {/* Storage Overview */}
        {storageStats && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Files
                  </CardTitle>
                  <FolderOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {storageStats.totalFiles}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Across all buckets
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Storage Used
                  </CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatFileSize(storageStats.totalSize)}
                  </div>
                  <Progress
                    value={getStorageUsagePercentage(storageStats.totalSize)}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {getStorageUsagePercentage(storageStats.totalSize).toFixed(
                      1,
                    )}
                    % of total capacity
                  </p>
                </CardContent>
              </Card>

              {statusStats && (
                <>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Pending Approval
                      </CardTitle>
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-yellow-600">
                        {statusStats.pending_approval}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Files awaiting review
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Approved Files
                      </CardTitle>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        {statusStats.approved}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Ready for use
                      </p>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>

            {/* Bucket Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Storage by Bucket</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(bucketInfo).map(([bucketName, info]) => {
                    const bucket = bucketName as BucketName;
                    const stats = storageStats.bucketBreakdown[bucket] || {
                      files: 0,
                      size: 0,
                    };
                    const Icon = info.icon;

                    return (
                      <Card key={bucket} className="relative overflow-hidden">
                        <CardHeader className="pb-3">
                          <div className="flex items-center space-x-2">
                            <div
                              className={`p-2 rounded-lg ${info.color} bg-opacity-10`}
                            >
                              <Icon className={`h-5 w-5 text-current`} />
                            </div>
                            <div>
                              <CardTitle className="text-base">
                                {info.label}
                              </CardTitle>
                              <p className="text-xs text-muted-foreground">
                                Max {info.maxSize} per file
                              </p>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Files:</span>
                              <span className="font-medium">{stats.files}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Size:</span>
                              <span className="font-medium">
                                {formatFileSize(stats.size)}
                              </span>
                            </div>
                            <Progress
                              value={getStorageUsagePercentage(
                                stats.size,
                                bucket,
                              )}
                              className="mt-2"
                            />
                            <p className="text-xs text-muted-foreground">
                              {getStorageUsagePercentage(
                                stats.size,
                                bucket,
                              ).toFixed(1)}
                              % of bucket limit
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Main File Management */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All Files</TabsTrigger>
            <TabsTrigger value="user-files">👤 User Files</TabsTrigger>
            <TabsTrigger value="documents">📄 Documents</TabsTrigger>
            <TabsTrigger value="videos">🎥 Videos</TabsTrigger>
            {canApprove && (
              <TabsTrigger value="approval">
                ⚠️ Approval Queue
                {statusStats?.pending_approval > 0 && (
                  <Badge
                    variant="destructive"
                    className="ml-2 h-5 w-5 rounded-full p-0 text-xs"
                  >
                    {statusStats.pending_approval}
                  </Badge>
                )}
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>All Files</CardTitle>
                <p className="text-sm text-muted-foreground">
                  View and manage all your files across all storage buckets
                </p>
              </CardHeader>
              <CardContent>
                <EnhancedFileManager
                  showApprovalWorkflow={canApprove}
                  allowVersionControl={true}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="user-files">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>User Files</span>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Personal files and general documents (Max 50MB per file)
                </p>
              </CardHeader>
              <CardContent>
                <EnhancedFileManager
                  defaultBucket="charge-source-user-files"
                  showApprovalWorkflow={canApprove}
                  allowVersionControl={true}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Documents</span>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Official documents, manuals, and reports (Max 100MB per file)
                </p>
              </CardHeader>
              <CardContent>
                <EnhancedFileManager
                  defaultBucket="charge-source-documents"
                  showApprovalWorkflow={canApprove}
                  allowVersionControl={true}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="videos">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Video className="h-5 w-5" />
                  <span>Videos</span>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Training videos and media content (Max 500MB per file)
                </p>
              </CardHeader>
              <CardContent>
                <EnhancedFileManager
                  defaultBucket="charge-source-videos"
                  showApprovalWorkflow={canApprove}
                  allowVersionControl={true}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {canApprove && (
            <TabsContent value="approval">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    <span>Approval Queue</span>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Files pending approval across all buckets
                  </p>
                </CardHeader>
                <CardContent>
                  <EnhancedFileManager
                    showApprovalWorkflow={true}
                    allowVersionControl={true}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>

        {/* Analytics Section */}
        {storageStats && (
          <Card>
            <CardHeader>
              <CardTitle>Storage Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Category Breakdown */}
                <div>
                  <h4 className="font-medium mb-4">Files by Category</h4>
                  <div className="space-y-3">
                    {Object.entries(storageStats.categoryBreakdown)
                      .sort(([, a], [, b]) => b.files - a.files)
                      .slice(0, 5)
                      .map(([category, stats]) => (
                        <div
                          key={category}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded-full bg-primary"></div>
                            <span className="text-sm font-medium capitalize">
                              {category === "uncategorized"
                                ? "Uncategorized"
                                : category}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              {stats.files} files
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatFileSize(stats.size)}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Status Distribution */}
                {statusStats && (
                  <div>
                    <h4 className="font-medium mb-4">Files by Status</h4>
                    <div className="space-y-3">
                      {Object.entries(statusStats)
                        .filter(([, count]) => count > 0)
                        .map(([status, count]) => {
                          const icons = {
                            draft: Clock,
                            pending_approval: AlertTriangle,
                            approved: CheckCircle,
                            rejected: XCircle,
                            archived: Archive,
                          };
                          const colors = {
                            draft: "text-gray-500",
                            pending_approval: "text-yellow-500",
                            approved: "text-green-500",
                            rejected: "text-red-500",
                            archived: "text-blue-500",
                          };
                          const Icon = icons[status as keyof typeof icons];

                          return (
                            <div
                              key={status}
                              className="flex items-center justify-between"
                            >
                              <div className="flex items-center space-x-2">
                                <Icon
                                  className={`w-4 h-4 ${colors[status as keyof typeof colors]}`}
                                />
                                <span className="text-sm font-medium capitalize">
                                  {status.replace("_", " ")}
                                </span>
                              </div>
                              <span className="text-sm font-medium">
                                {count}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
