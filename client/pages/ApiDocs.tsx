import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy, ExternalLink, Server, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";

interface ApiEndpoint {
  method: string;
  path: string;
  description: string;
  example: string;
}

interface ApiData {
  title: string;
  version: string;
  timestamp: string;
  endpoints: ApiEndpoint[];
  totalEndpoints: number;
}

export default function ApiDocs() {
  const [apiData, setApiData] = useState<ApiData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Detect FullStory to prevent fetch errors
  const isFullStoryDetected = !!(
    (window as any).FS ||
    document.querySelector('script[src*="fullstory"]') ||
    document.querySelector('script[src*="fs.js"]') ||
    (window.fetch && window.fetch.toString().includes('messageHandler'))
  );

  const fetchApiData = async () => {
    if (isFullStoryDetected) {
      setError("FullStory detected - automatic API fetching disabled. Please test endpoints manually.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch('/api');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setApiData(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch API data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isFullStoryDetected) {
      fetchApiData();
    } else {
      // Provide static data when FullStory is detected
      setApiData({
        title: "ChargeSource API",
        version: "1.0.0",
        timestamp: new Date().toISOString(),
        totalEndpoints: 5,
        endpoints: [
          {
            method: "GET",
            path: "/api",
            description: "API Index - lists all available endpoints",
            example: `${window.location.origin}/api`
          },
          {
            method: "GET",
            path: "/api/ping",
            description: "Health check endpoint",
            example: `${window.location.origin}/api/ping`
          },
          {
            method: "GET",
            path: "/api/demo",
            description: "Demo data endpoint",
            example: `${window.location.origin}/api/demo`
          },
          {
            method: "POST",
            path: "/api/create-storage-buckets",
            description: "Create Supabase storage buckets",
            example: `${window.location.origin}/api/create-storage-buckets`
          },
          {
            method: "POST",
            path: "/api/crm/leads",
            description: "Submit CRM lead data",
            example: `${window.location.origin}/api/crm/leads`
          }
        ]
      });
    }
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET': return 'bg-green-100 text-green-800 border-green-200';
      case 'POST': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PUT': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'DELETE': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const testEndpoint = async (endpoint: ApiEndpoint) => {
    if (endpoint.method === 'GET') {
      window.open(endpoint.example, '_blank');
    } else {
      // For POST/PUT/DELETE, just copy the URL for now
      copyToClipboard(endpoint.example);
      alert(`${endpoint.method} endpoint URL copied to clipboard!`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
            <Server className="w-8 h-8 text-primary" />
            API Documentation
          </h1>
          <p className="text-muted-foreground">
            ChargeSource backend API endpoints and documentation
          </p>
          <div className="mt-4">
            <Button variant="outline" asChild>
              <Link to="/" className="flex items-center gap-2">
                ← Back to Home
              </Link>
            </Button>
          </div>
        </div>

        {/* API Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>API Overview</span>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={fetchApiData}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Loading API data...</p>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>
                  <strong>Error:</strong> {error}
                </AlertDescription>
              </Alert>
            )}

            {apiData && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">{apiData.totalEndpoints}</div>
                    <div className="text-sm text-muted-foreground">Total Endpoints</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">{apiData.version}</div>
                    <div className="text-sm text-muted-foreground">API Version</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">Live</div>
                    <div className="text-sm text-muted-foreground">Status</div>
                  </div>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  Last updated: {new Date(apiData.timestamp).toLocaleString()}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* API Endpoints */}
        {apiData?.endpoints && (
          <Card>
            <CardHeader>
              <CardTitle>Available Endpoints</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {apiData.endpoints.map((endpoint, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge className={getMethodColor(endpoint.method)}>
                        {endpoint.method}
                      </Badge>
                      <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                        {endpoint.path}
                      </code>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => copyToClipboard(endpoint.example)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => testEndpoint(endpoint)}
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    {endpoint.description}
                  </p>
                  
                  <div className="bg-muted p-2 rounded">
                    <code className="text-xs">{endpoint.example}</code>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button asChild variant="outline" className="justify-start">
                <a href="/api/ping" target="_blank">
                  Test Ping Endpoint
                </a>
              </Button>
              <Button asChild variant="outline" className="justify-start">
                <a href="/api/demo" target="_blank">
                  Test Demo Endpoint
                </a>
              </Button>
              <Button asChild variant="outline" className="justify-start">
                <a href="/api" target="_blank">
                  View Raw JSON
                </a>
              </Button>
              <Button asChild variant="outline" className="justify-start">
                <Link to="/oauth-debug">
                  OAuth Debug Tool
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
