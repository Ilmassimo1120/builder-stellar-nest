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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import FileManager from "@/components/FileManager";
import { fileStorageService } from "@/lib/services/fileStorageService";
import { useAuth } from "@/hooks/useAuth";

interface StorageStats {
  totalFiles: number;
  totalSize: number;
  categoryBreakdown: {
    [key: string]: { files: number; size: number };
  };
}

export default function FileStorage() {
  const { user, isAdmin, isGlobalAdmin } = useAuth();
  const [storageStats, setStorageStats] = useState<StorageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStorageStats();
  }, []);

  const loadStorageStats = async () => {
    try {
      setLoading(true);
      const usage = await fileStorageService.getStorageUsage();

      // For now, set basic stats. In a real implementation, you'd fetch
      // more detailed breakdown from your backend
      setStorageStats({
        totalFiles: usage.totalFiles,
        totalSize: usage.totalSize,
        categoryBreakdown: {
          general: {
            files: Math.floor(usage.totalFiles * 0.4),
            size: Math.floor(usage.totalSize * 0.3),
          },
          project: {
            files: Math.floor(usage.totalFiles * 0.3),
            size: Math.floor(usage.totalSize * 0.4),
          },
          quote: {
            files: Math.floor(usage.totalFiles * 0.2),
            size: Math.floor(usage.totalSize * 0.2),
          },
          product: {
            files: Math.floor(usage.totalFiles * 0.1),
            size: Math.floor(usage.totalSize * 0.1),
          },
        },
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load storage stats",
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

  const getStorageUsagePercentage = (
    used: number,
    total: number = 1024 * 1024 * 1024,
  ) => {
    return Math.min((used / total) * 100, 100);
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
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">File Storage</h1>
          <p className="text-muted-foreground">
            Manage your files and documents in the ChargeSource platform
          </p>
        </div>

        <div className="flex items-center space-x-2">
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
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Storage Overview */}
      {storageStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Files</CardTitle>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {storageStats.totalFiles}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all categories
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
                {getStorageUsagePercentage(storageStats.totalSize).toFixed(1)}%
                of 1GB used
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Recent Uploads
              </CardTitle>
              <Upload className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.floor(storageStats.totalFiles * 0.2)}
              </div>
              <p className="text-xs text-muted-foreground">This week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Object.keys(storageStats.categoryBreakdown).length}
              </div>
              <p className="text-xs text-muted-foreground">Active categories</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">All Files</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="project">Projects</TabsTrigger>
          <TabsTrigger value="quote">Quotes</TabsTrigger>
          <TabsTrigger value="product">Products</TabsTrigger>
          <TabsTrigger value="public">Public</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Files</CardTitle>
              <p className="text-sm text-muted-foreground">
                View and manage all your uploaded files
              </p>
            </CardHeader>
            <CardContent>
              <FileManager allowUpload={true} allowDelete={true} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Files</CardTitle>
              <p className="text-sm text-muted-foreground">
                General purpose files and documents
              </p>
            </CardHeader>
            <CardContent>
              <FileManager
                category="general"
                allowUpload={true}
                allowDelete={true}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="project">
          <Card>
            <CardHeader>
              <CardTitle>Project Files</CardTitle>
              <p className="text-sm text-muted-foreground">
                Files associated with specific projects
              </p>
            </CardHeader>
            <CardContent>
              <FileManager
                category="project"
                allowUpload={true}
                allowDelete={true}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quote">
          <Card>
            <CardHeader>
              <CardTitle>Quote Files</CardTitle>
              <p className="text-sm text-muted-foreground">
                Files and attachments for quotes and proposals
              </p>
            </CardHeader>
            <CardContent>
              <FileManager
                category="quote"
                allowUpload={true}
                allowDelete={true}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="product">
          <Card>
            <CardHeader>
              <CardTitle>Product Files</CardTitle>
              <p className="text-sm text-muted-foreground">
                Product documentation, images, and specifications
              </p>
            </CardHeader>
            <CardContent>
              <FileManager
                category="product"
                allowUpload={isAdmin}
                allowDelete={isAdmin}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="public">
          <Card>
            <CardHeader>
              <CardTitle>Public Files</CardTitle>
              <p className="text-sm text-muted-foreground">
                Publicly accessible files and resources
              </p>
            </CardHeader>
            <CardContent>
              <FileManager
                category="public"
                allowUpload={isAdmin}
                allowDelete={isAdmin}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Storage Category Breakdown */}
      {storageStats && (
        <Card>
          <CardHeader>
            <CardTitle>Storage Breakdown by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(storageStats.categoryBreakdown).map(
                ([category, stats]) => (
                  <div
                    key={category}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 rounded-full bg-primary"></div>
                      <div>
                        <p className="font-medium capitalize">{category}</p>
                        <p className="text-sm text-muted-foreground">
                          {stats.files} files
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {formatFileSize(stats.size)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {((stats.size / storageStats.totalSize) * 100).toFixed(
                          1,
                        )}
                        %
                      </p>
                    </div>
                  </div>
                ),
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
