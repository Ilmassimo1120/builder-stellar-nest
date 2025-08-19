import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, AlertTriangle, Eye, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function SimpleApiTest() {
  // Detect FullStory
  const isFullStoryDetected = !!(
    (window as any).FS ||
    document.querySelector('script[src*="fullstory"]') ||
    document.querySelector('script[src*="fs.js"]') ||
    (window.fetch && window.fetch.toString().includes('fullstory'))
  );

  const environment = window.location.hostname === 'localhost' ? 'local' : 'deployed';

  const endpoints = [
    {
      path: '/api',
      method: 'GET',
      description: 'API Index - Lists all available endpoints',
      expectedResponse: 'JSON object with endpoints array'
    },
    {
      path: '/api/ping',
      method: 'GET', 
      description: 'Health check endpoint',
      expectedResponse: '{"message": "ping"}'
    },
    {
      path: '/api/demo',
      method: 'GET',
      description: 'Demo data endpoint',
      expectedResponse: 'Demo response object'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Simple API Test</h1>
          <p className="text-muted-foreground">
            Manual API testing without fetch interference
          </p>
          <div className="mt-4">
            <Button variant="outline" asChild>
              <Link to="/">← Back to Home</Link>
            </Button>
          </div>
        </div>

        {/* Environment Status */}
        <Card>
          <CardHeader>
            <CardTitle>Environment Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {environment === 'local' ? 'Local' : 'Deployed'}
                </div>
                <div className="text-sm text-muted-foreground">Environment</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">
                  {isFullStoryDetected ? (
                    <Badge variant="destructive">Detected</Badge>
                  ) : (
                    <Badge variant="default">None</Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">FullStory</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {window.location.hostname}
                </div>
                <div className="text-sm text-muted-foreground">Host</div>
              </div>
            </div>

            {isFullStoryDetected && (
              <Alert variant="destructive">
                <Eye className="h-4 w-4" />
                <AlertDescription>
                  <strong>FullStory Analytics Active:</strong> This tool intercepts fetch requests. 
                  Use manual testing below to check API endpoints.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Manual API Testing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="w-5 h-5" />
              Manual API Testing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Click the buttons below to test each API endpoint in a new tab. 
                This bypasses any fetch interception issues.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              {endpoints.map((endpoint, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{endpoint.method}</Badge>
                      <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                        {endpoint.path}
                      </code>
                    </div>
                    <Button 
                      size="sm"
                      onClick={() => window.open(endpoint.path, '_blank')}
                      className="flex items-center gap-2"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Test
                    </Button>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    {endpoint.description}
                  </p>
                  
                  <div className="text-xs text-muted-foreground">
                    <strong>Expected:</strong> {endpoint.expectedResponse}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Troubleshooting */}
        <Card>
          <CardHeader>
            <CardTitle>Troubleshooting</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <h4 className="font-semibold">If you get 404 errors:</h4>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li><strong>Local:</strong> Make sure dev server is running with `npm run dev`</li>
                <li><strong>Deployed:</strong> Check if Netlify functions are properly deployed</li>
                <li>Try the `/api/ping` endpoint first - it's the simplest</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">Alternative testing methods:</h4>
              <div className="flex gap-2 flex-wrap">
                <Button variant="outline" size="sm" asChild>
                  <Link to="/api-status">Detailed API Status</Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/api-docs">Full API Documentation</Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href="/api" target="_blank">Raw API JSON</a>
                </Button>
              </div>
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Current URL:</strong> {window.location.href}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
