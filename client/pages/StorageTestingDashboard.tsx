import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Info } from "lucide-react";
import { Link } from "react-router-dom";
import { Logo } from "@/components/ui/logo";
import StorageQuotaTester from "@/components/StorageQuotaTester";
import StoragePerformanceMetrics from "@/components/StoragePerformanceMetrics";

export default function StorageTestingDashboard() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <div className="h-6 w-px bg-border" />
            <Logo size="lg" />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Storage Testing Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive testing of Supabase storage buckets, quota limits, and
            performance metrics
          </p>
        </div>

        {/* Information Section */}
        <div className="mb-8 space-y-4">
          <Alert className="border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>What this tool does:</strong> This dashboard allows you to
              test file uploads to your Supabase storage buckets, monitor storage
              quota usage, and verify performance before using production data. Test
              files are created in a <code>/tests/</code> folder and can be
              automatically cleaned up.
            </AlertDescription>
          </Alert>

          <Alert className="border-amber-200 bg-amber-50">
            <Info className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>Storage Limits:</strong> Each bucket has a 50MB limit. When
              testing file uploads, ensure you have enough free space. The metrics
              below show your current usage across all buckets.
            </AlertDescription>
          </Alert>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Testing Tools */}
          <div className="lg:col-span-2 space-y-6">
            <StorageQuotaTester />
          </div>

          {/* Right Column - Quick Stats */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Guide</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="space-y-3">
                  <div>
                    <p className="font-medium text-xs uppercase text-muted-foreground mb-1">
                      Step 1: Check Metrics
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Scroll down to view your current storage usage and quota
                      information.
                    </p>
                  </div>

                  <div>
                    <p className="font-medium text-xs uppercase text-muted-foreground mb-1">
                      Step 2: Select Bucket & Size
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Choose a bucket and test file size (1MB to 50MB) above.
                    </p>
                  </div>

                  <div>
                    <p className="font-medium text-xs uppercase text-muted-foreground mb-1">
                      Step 3: Test Upload
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Click "Test Upload" to generate and upload a test file.
                      Monitor speed and success rate.
                    </p>
                  </div>

                  <div>
                    <p className="font-medium text-xs uppercase text-muted-foreground mb-1">
                      Step 4: Monitor Results
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Results show file size, upload speed, and any errors
                      (especially quota exceeded).
                    </p>
                  </div>

                  <div>
                    <p className="font-medium text-xs uppercase text-muted-foreground mb-1">
                      Step 5: Cleanup
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Use "Cleanup Old Files" to remove test files older than 1
                      hour.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Test File Sizes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <p className="text-muted-foreground">Available preset sizes:</p>
                <ul className="space-y-1 font-mono text-muted-foreground">
                  <li>• 1 MB - Quick test, minimal quota impact</li>
                  <li>• 5 MB - Standard test file</li>
                  <li>• 10 MB - Medium test</li>
                  <li>• 20 MB - Large file test</li>
                  <li>• 50 MB - Maximum limit test</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Storage Metrics Section */}
        <div className="mt-8">
          <StoragePerformanceMetrics />
        </div>

        {/* Footer Info */}
        <div className="mt-12 border-t pt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">About Quota Limits</h3>
              <p className="text-sm text-muted-foreground">
                ChargeSource includes 50MB storage per bucket as part of your
                Supabase project. This dashboard helps you verify that uploads and
                downloads work correctly before reaching the limit. Test files are
                stored in a dedicated /tests/ folder for easy cleanup.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Troubleshooting</h3>
              <p className="text-sm text-muted-foreground">
                If uploads fail with "quota exceeded" errors, use the "Cleanup Old
                Files" button to remove test files. If you need more storage,
                consider upgrading your Supabase plan. For other issues, contact
                support.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
