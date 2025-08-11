import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  CheckCircle,
  Globe,
  Settings,
  ExternalLink,
} from "lucide-react";

interface CORSFixGuideProps {
  showDetailed?: boolean;
  className?: string;
}

export default function CORSFixGuide({
  showDetailed = false,
  className,
}: CORSFixGuideProps) {
  const currentDomain =
    typeof window !== "undefined"
      ? window.location.hostname
      : "your-domain.com";
  const currentOrigin =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://your-domain.com";

  if (!showDetailed) {
    return (
      <Alert className={className}>
        <Globe className="h-4 w-4" />
        <AlertTitle>Network Connection Issue</AlertTitle>
        <AlertDescription>
          File upload is using local storage as fallback. Files are safely
          stored and will sync when cloud storage is available.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
          <span>Cloud Storage Connection Guide</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Having trouble uploading to cloud storage? Here's how to fix common
          connection issues.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Status */}
        <div className="space-y-2">
          <h4 className="font-medium">Current Status</h4>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm">Local storage working</span>
            <Badge variant="secondary">Files saved locally</Badge>
          </div>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <span className="text-sm">Cloud storage connection issues</span>
            <Badge variant="outline">Using fallback</Badge>
          </div>
        </div>

        {/* What's happening */}
        <div className="space-y-2">
          <h4 className="font-medium">What's Happening</h4>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>• Files are being saved locally in your browser's storage</p>
            <p>• Cloud storage connection is temporarily unavailable</p>
            <p>• This might be due to network settings or CORS configuration</p>
            <p>
              • Your files are safe and will sync when connection is restored
            </p>
          </div>
        </div>

        {/* For Developers */}
        <div className="space-y-2">
          <h4 className="font-medium flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>For Developers</span>
          </h4>
          <div className="text-sm space-y-2 bg-muted p-3 rounded-lg">
            <p className="font-medium">
              Current domain:{" "}
              <code className="text-xs bg-background px-1 rounded">
                {currentDomain}
              </code>
            </p>
            <p className="font-medium">
              Current origin:{" "}
              <code className="text-xs bg-background px-1 rounded">
                {currentOrigin}
              </code>
            </p>

            <div className="space-y-1">
              <p className="font-medium text-foreground">To fix CORS issues:</p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>Log into your Supabase dashboard</li>
                <li>Go to Settings → API</li>
                <li>
                  Add{" "}
                  <code className="text-xs bg-background px-1 rounded">
                    {currentOrigin}
                  </code>{" "}
                  to allowed origins
                </li>
                <li>Save the settings and wait a few minutes</li>
                <li>Refresh this page and try uploading again</li>
              </ol>
            </div>

            <div className="space-y-1">
              <p className="font-medium text-foreground">Alternative fixes:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Check your network connection and firewall settings</li>
                <li>Try uploading from a different network or device</li>
                <li>Contact your system administrator about proxy settings</li>
              </ul>
            </div>
          </div>
        </div>

        {/* User guidance */}
        <div className="space-y-2">
          <h4 className="font-medium">What You Can Do</h4>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>
              ✅ <strong>Continue working normally</strong> - Files are safely
              stored locally
            </p>
            <p>
              ✅ <strong>Your data is safe</strong> - Local storage prevents
              data loss
            </p>
            <p>
              ✅ <strong>Files will sync</strong> - When cloud storage is
              available again
            </p>
            <p>
              ⏳ <strong>Try again later</strong> - Connection issues are often
              temporary
            </p>
          </div>
        </div>

        {/* External resources */}
        <div className="space-y-2">
          <h4 className="font-medium">Learn More</h4>
          <div className="flex space-x-2">
            <a
              href="https://supabase.com/docs/guides/api/cors"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline flex items-center space-x-1"
            >
              <ExternalLink className="h-3 w-3" />
              <span>Supabase CORS Guide</span>
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
