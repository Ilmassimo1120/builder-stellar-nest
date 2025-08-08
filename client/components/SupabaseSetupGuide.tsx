import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { Badge } from "./ui/badge";
import {
  Database,
  HardDrive,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Copy,
} from "lucide-react";

export default function SupabaseSetupGuide() {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const buckets = [
    "charge-source-user-files",
    "charge-source-documents",
    "charge-source-videos",
  ];

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Database className="h-6 w-6 text-blue-500" />
          <span>Supabase Setup Guide</span>
          <Badge variant="outline">Admin Setup Required</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Current Status:</strong> The file storage system is running
            in demo mode. To enable full functionality with cloud storage and
            database, complete the setup below.
          </AlertDescription>
        </Alert>

        {/* Storage Buckets Setup */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center space-x-2">
            <HardDrive className="h-5 w-5" />
            <span>1. Create Storage Buckets</span>
          </h3>

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Create these storage buckets in your Supabase dashboard:
            </p>

            {buckets.map((bucket) => (
              <div
                key={bucket}
                className="flex items-center justify-between p-3 bg-muted rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-4 w-4 text-gray-400" />
                  <code className="text-sm font-mono">{bucket}</code>
                </div>
                <button
                  onClick={() => copyToClipboard(bucket)}
                  className="p-1 hover:bg-gray-200 rounded"
                  title="Copy bucket name"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <Alert>
            <AlertDescription>
              <strong>How to create buckets:</strong>
              <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
                <li>Go to your Supabase dashboard</li>
                <li>
                  Navigate to <strong>Storage</strong> section
                </li>
                <li>
                  Click <strong>"New bucket"</strong>
                </li>
                <li>Enter the bucket name exactly as shown above</li>
                <li>
                  Set as <strong>Public bucket</strong> for file downloads
                </li>
                <li>Repeat for all three buckets</li>
              </ol>
            </AlertDescription>
          </Alert>
        </div>

        {/* Database Tables Setup */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>2. Create Database Tables</span>
          </h3>

          <Alert>
            <AlertDescription>
              <strong>Required tables:</strong> <code>file_assets</code>,{" "}
              <code>file_asset_changelog</code>, <code>file_asset_shares</code>
              <br />
              <br />
              Run the SQL migration file to create all necessary database tables
              and functions. Check the <code>supabase/migrations/</code> folder
              for the migration scripts.
            </AlertDescription>
          </Alert>
        </div>

        {/* What Works Without Setup */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            Current Functionality (Demo Mode)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-green-600">✅ Works Now</h4>
              <ul className="text-sm space-y-1">
                <li>• File validation and error handling</li>
                <li>• Authentication and permissions</li>
                <li>• UI components and navigation</li>
                <li>• Search functionality (returns empty)</li>
                <li>• Storage usage stats (shows zero)</li>
                <li>• Upload simulation with feedback</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-orange-600">⚠️ Needs Setup</h4>
              <ul className="text-sm space-y-1">
                <li>• Actual file uploads to cloud storage</li>
                <li>• File persistence and retrieval</li>
                <li>• File search with real results</li>
                <li>• Version control and history</li>
                <li>• File sharing and permissions</li>
                <li>• Storage usage analytics</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex flex-wrap gap-4 pt-4 border-t">
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 text-sm"
          >
            <ExternalLink className="h-4 w-4" />
            <span>Open Supabase Dashboard</span>
          </a>

          <a
            href="https://supabase.com/docs/guides/storage"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 text-sm"
          >
            <ExternalLink className="h-4 w-4" />
            <span>Storage Documentation</span>
          </a>

          <a
            href="https://supabase.com/docs/guides/database/tables"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 text-sm"
          >
            <ExternalLink className="h-4 w-4" />
            <span>Database Documentation</span>
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
