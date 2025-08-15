import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Copy, ExternalLink, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function OAuthDebug() {
  const [currentUrl, setCurrentUrl] = useState("");
  const [redirectUrls, setRedirectUrls] = useState<string[]>([]);
  const [supabaseUrl, setSupabaseUrl] = useState("");
  const [testResults, setTestResults] = useState<any>(null);

  useEffect(() => {
    const url = window.location.origin;
    setCurrentUrl(url);
    setSupabaseUrl(import.meta.env.VITE_SUPABASE_URL || "Not configured");
    
    // Generate all possible redirect URLs
    const urls = [
      `${url}/auth/callback`,
      `http://localhost:8080/auth/callback`,
      `https://localhost:8080/auth/callback`,
    ];
    setRedirectUrls(urls);
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const testOAuthConfig = async () => {
    setTestResults({ loading: true });
    
    try {
      // Test Supabase connection
      const { data: session } = await supabase.auth.getSession();
      
      // Try to get OAuth URL (this will show if provider is configured)
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${currentUrl}/auth/callback`,
          skipBrowserRedirect: true, // Don't actually redirect, just test
        }
      });

      setTestResults({
        loading: false,
        supabaseConnection: true,
        oauthConfigured: !error,
        error: error?.message,
        currentSession: !!session?.session,
      });
    } catch (err: any) {
      setTestResults({
        loading: false,
        supabaseConnection: false,
        oauthConfigured: false,
        error: err.message,
        currentSession: false,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Google OAuth Debug Tool</h1>
          <p className="text-muted-foreground">
            Diagnose and fix Google OAuth 403 errors
          </p>
        </div>

        {/* Current Environment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Current Environment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Current URL:</label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="bg-muted px-2 py-1 rounded text-sm flex-1">
                    {currentUrl}
                  </code>
                  <Button size="sm" variant="outline" onClick={() => copyToClipboard(currentUrl)}>
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Supabase URL:</label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="bg-muted px-2 py-1 rounded text-sm flex-1">
                    {supabaseUrl}
                  </code>
                  <Button size="sm" variant="outline" onClick={() => copyToClipboard(supabaseUrl)}>
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Required Redirect URIs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="w-5 h-5 text-blue-500" />
              Required Redirect URIs for Google Cloud Console
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Add ALL of these redirect URIs to your Google Cloud Console OAuth configuration:
              </AlertDescription>
            </Alert>
            
            {redirectUrls.map((url, index) => (
              <div key={index} className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <code className="flex-1 text-sm">{url}</code>
                <Button size="sm" variant="outline" onClick={() => copyToClipboard(url)}>
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            ))}

            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Steps to fix in Google Cloud Console:</h4>
              <ol className="list-decimal list-inside text-sm text-blue-700 space-y-1">
                <li>Go to <a href="https://console.cloud.google.com/" target="_blank" className="underline">Google Cloud Console</a></li>
                <li>Navigate to APIs & Services → Credentials</li>
                <li>Find your OAuth 2.0 Client ID</li>
                <li>Add the redirect URIs above to "Authorized redirect URIs"</li>
                <li>Save the configuration</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Supabase Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="w-5 h-5 text-green-500" />
              Supabase Configuration Check
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={testOAuthConfig} disabled={testResults?.loading}>
              {testResults?.loading ? "Testing..." : "Test OAuth Configuration"}
            </Button>

            {testResults && !testResults.loading && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {testResults.supabaseConnection ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span className="text-sm">Supabase Connection</span>
                  <Badge variant={testResults.supabaseConnection ? "default" : "destructive"}>
                    {testResults.supabaseConnection ? "Working" : "Failed"}
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  {testResults.oauthConfigured ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span className="text-sm">Google OAuth Provider</span>
                  <Badge variant={testResults.oauthConfigured ? "default" : "destructive"}>
                    {testResults.oauthConfigured ? "Configured" : "Not Configured"}
                  </Badge>
                </div>

                {testResults.error && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Error:</strong> {testResults.error}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">Steps to configure in Supabase:</h4>
              <ol className="list-decimal list-inside text-sm text-green-700 space-y-1">
                <li>Go to your <a href="https://supabase.com/dashboard" target="_blank" className="underline">Supabase Dashboard</a></li>
                <li>Select your project</li>
                <li>Go to Authentication → Providers</li>
                <li>Enable Google provider</li>
                <li>Add your Google Client ID and Secret</li>
                <li>Save the configuration</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Quick Test */}
        <Card>
          <CardHeader>
            <CardTitle>Quick OAuth Test</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                After configuring both Google Cloud Console and Supabase, test the OAuth flow:
              </AlertDescription>
            </Alert>
            <div className="mt-4 flex gap-2">
              <Button asChild>
                <a href="/login">Test on Login Page</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/oauth-test">Dedicated OAuth Test</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
