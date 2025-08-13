import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Server, Cloud, Database } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { directSupabase, testBucketAccess } from '@/lib/directSupabase';
import { connectionFixService, type FixResult } from '@/lib/services/connectionFixService';

interface DiagnosticResult {
  test: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: string;
  timing?: number;
}

export default function ConnectionDiagnostics() {
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [fixing, setFixing] = useState(false);
  const [fixResults, setFixResults] = useState<FixResult[]>([]);

  const runComprehensiveDiagnostics = async () => {
    setRunning(true);
    const newResults: DiagnosticResult[] = [];

    // Test 1: Environment Variables
    console.log('🔍 Testing environment configuration...');
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (supabaseUrl && supabaseAnonKey) {
      newResults.push({
        test: 'Environment Variables',
        status: 'success',
        message: 'All required environment variables are set',
        details: `URL: ${supabaseUrl}`
      });
    } else {
      newResults.push({
        test: 'Environment Variables',
        status: 'error',
        message: 'Missing required environment variables',
        details: `URL: ${supabaseUrl || 'MISSING'}, Key: ${supabaseAnonKey ? 'SET' : 'MISSING'}`
      });
    }

    // Test 2: Basic Supabase Connection
    try {
      console.log('🔍 Testing Supabase API connection...');
      const startTime = Date.now();
      const { data, error } = await supabase.auth.getSession();
      const timing = Date.now() - startTime;
      
      if (error) {
        if (error.message.includes('Failed to fetch')) {
          newResults.push({
            test: 'Supabase API Connection',
            status: 'error',
            message: 'Network connectivity issue',
            details: 'Cannot reach Supabase servers. Check your internet connection and CORS settings.',
            timing
          });
        } else {
          newResults.push({
            test: 'Supabase API Connection',
            status: 'warning',
            message: error.message,
            details: 'Connection established but auth failed. This might be expected.',
            timing
          });
        }
      } else {
        newResults.push({
          test: 'Supabase API Connection',
          status: 'success',
          message: 'Successfully connected to Supabase',
          details: `Response time: ${timing}ms`,
          timing
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      newResults.push({
        test: 'Supabase API Connection',
        status: 'error',
        message: errorMessage,
        details: 'Network error occurred. Check your internet connection and firewall settings.'
      });
    }

    // Test 3: Direct Supabase Connection
    try {
      console.log('🔍 Testing direct Supabase connection...');
      const startTime = Date.now();
      const { data, error } = await directSupabase.auth.getSession();
      const timing = Date.now() - startTime;
      
      if (error) {
        newResults.push({
          test: 'Direct Supabase Connection',
          status: 'error',
          message: error.message,
          details: 'Direct client connection failed.',
          timing
        });
      } else {
        newResults.push({
          test: 'Direct Supabase Connection',
          status: 'success',
          message: 'Direct connection successful',
          details: `Response time: ${timing}ms`,
          timing
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      newResults.push({
        test: 'Direct Supabase Connection',
        status: 'error',
        message: errorMessage,
        details: 'Direct connection failed.'
      });
    }

    // Test 4: Storage Bucket Access
    try {
      console.log('🪣 Testing storage bucket access...');
      const startTime = Date.now();
      const result = await testBucketAccess();
      const timing = Date.now() - startTime;
      
      if (result.success) {
        const requiredBuckets = ['charge-source-user-files', 'charge-source-documents', 'charge-source-videos'];
        const missing = result.missingRequired || [];
        
        if (missing.length > 0) {
          newResults.push({
            test: 'Storage Buckets',
            status: 'warning',
            message: `Missing ${missing.length} required buckets`,
            details: `Missing: ${missing.join(', ')}. Found: ${result.foundRequired?.join(', ') || 'none'}`,
            timing
          });
        } else {
          newResults.push({
            test: 'Storage Buckets',
            status: 'success',
            message: 'All required buckets found',
            details: `Buckets: ${result.buckets.join(', ')}`,
            timing
          });
        }
      } else {
        newResults.push({
          test: 'Storage Buckets',
          status: 'error',
          message: result.error || 'Unknown error',
          details: 'Failed to list storage buckets. Check your permissions.',
          timing
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      newResults.push({
        test: 'Storage Buckets',
        status: 'error',
        message: errorMessage,
        details: 'Storage bucket test failed.'
      });
    }

    // Test 5: Local API Server
    try {
      console.log('🌐 Testing local API server...');
      const startTime = Date.now();
      const response = await fetch('/api/ping');
      const timing = Date.now() - startTime;
      
      if (response.ok) {
        const data = await response.json();
        newResults.push({
          test: 'Local API Server',
          status: 'success',
          message: 'Local server responding',
          details: `Response: ${data.message || 'Success'}, Response time: ${timing}ms`,
          timing
        });
      } else {
        newResults.push({
          test: 'Local API Server',
          status: 'error',
          message: `Server error: ${response.status}`,
          details: `HTTP ${response.status} - ${response.statusText}`,
          timing
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      newResults.push({
        test: 'Local API Server',
        status: 'error',
        message: errorMessage,
        details: 'Local server connection failed.'
      });
    }

    // Test 6: Netlify Functions (if in production)
    if (window.location.hostname !== 'localhost' && !window.location.hostname.includes('127.0.0.1')) {
      try {
        console.log('🚀 Testing Netlify functions...');
        const startTime = Date.now();
        const response = await fetch('/.netlify/functions/api/ping');
        const timing = Date.now() - startTime;
        
        if (response.ok) {
          const data = await response.json();
          newResults.push({
            test: 'Netlify Functions',
            status: 'success',
            message: 'Netlify functions responding',
            details: `Response: ${data.message || 'Success'}, Response time: ${timing}ms`,
            timing
          });
        } else {
          newResults.push({
            test: 'Netlify Functions',
            status: 'error',
            message: `Netlify error: ${response.status}`,
            details: `HTTP ${response.status} - ${response.statusText}`,
            timing
          });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        newResults.push({
          test: 'Netlify Functions',
          status: 'error',
          message: errorMessage,
          details: 'Netlify functions connection failed.'
        });
      }
    }

    // Test 7: External Connectivity
    try {
      console.log('🌍 Testing external connectivity...');
      const startTime = Date.now();
      const response = await fetch('https://httpbin.org/get', { 
        method: 'GET',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      const timing = Date.now() - startTime;
      
      if (response.ok) {
        newResults.push({
          test: 'External Connectivity',
          status: 'success',
          message: 'Internet connectivity confirmed',
          details: `Response time: ${timing}ms`,
          timing
        });
      } else {
        newResults.push({
          test: 'External Connectivity',
          status: 'warning',
          message: 'External service returned error',
          details: `HTTP ${response.status} - May indicate network restrictions`,
          timing
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      newResults.push({
        test: 'External Connectivity',
        status: 'error',
        message: 'External connectivity failed',
        details: errorMessage.includes('timeout') ? 'Request timed out - slow connection' : errorMessage
      });
    }

    setResults(newResults);
    setRunning(false);
  };

  const runAutomaticFixes = async () => {
    setFixing(true);
    setFixResults([]);

    try {
      console.log('🔧 Starting automatic connection fixes...');
      const fixes = await connectionFixService.runAllFixes();
      setFixResults(fixes);

      // Re-run diagnostics after fixes to see if issues were resolved
      setTimeout(() => {
        runComprehensiveDiagnostics();
      }, 1000);

    } catch (error) {
      console.error('Error running automatic fixes:', error);
      setFixResults([{
        success: false,
        message: 'Failed to run automatic fixes',
        details: error instanceof Error ? error.message : 'Unknown error'
      }]);
    } finally {
      setFixing(false);
    }
  };

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-500">Pass</Badge>;
      case 'error':
        return <Badge variant="destructive">Fail</Badge>;
      case 'warning':
        return <Badge variant="secondary">Warning</Badge>;
    }
  };

  const getOverallStatus = () => {
    if (results.length === 0) return null;
    
    const hasErrors = results.some(r => r.status === 'error');
    const hasWarnings = results.some(r => r.status === 'warning');
    
    if (hasErrors) return 'error';
    if (hasWarnings) return 'warning';
    return 'success';
  };

  const getRecommendations = () => {
    const recommendations = [];
    
    const failedTests = results.filter(r => r.status === 'error');
    const supabaseConnectionIssues = failedTests.filter(r => 
      r.test.includes('Supabase') && r.message.includes('Failed to fetch')
    );
    
    if (supabaseConnectionIssues.length > 0) {
      recommendations.push({
        title: 'Fix Supabase Connection Issues',
        description: 'Update CORS settings in your Supabase dashboard',
        actions: [
          'Go to Supabase Dashboard → Settings → API',
          'Add your domain to CORS Origins',
          'Include both localhost:8080 and production domain',
          'Save and wait for changes to propagate'
        ]
      });
    }
    
    const bucketIssues = results.find(r => r.test === 'Storage Buckets' && r.status !== 'success');
    if (bucketIssues) {
      recommendations.push({
        title: 'Fix Storage Bucket Issues',
        description: 'Create missing storage buckets',
        actions: [
          'Go to Supabase Dashboard → Storage',
          'Create missing buckets: charge-source-user-files, charge-source-documents, charge-source-videos',
          'Set appropriate permissions for each bucket',
          'Test bucket access after creation'
        ]
      });
    }
    
    return recommendations;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Connection Diagnostics
            </CardTitle>
            <CardDescription>
              Comprehensive test of Supabase and Netlify connections to identify issues
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button
                onClick={runComprehensiveDiagnostics}
                disabled={running || fixing}
                className="flex-1"
              >
                {running ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Running Diagnostics...
                  </>
                ) : (
                  <>
                    <Server className="h-4 w-4 mr-2" />
                    Run Diagnostics
                  </>
                )}
              </Button>

              <Button
                onClick={runAutomaticFixes}
                disabled={running || fixing}
                variant="outline"
                className="flex-1"
              >
                {fixing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Fixing Issues...
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Auto-Fix Issues
                  </>
                )}
              </Button>
            </div>

            {results.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="font-semibold">Overall Status:</h3>
                  {getOverallStatus() === 'success' && (
                    <Badge variant="default" className="bg-green-500">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      All Systems Operational
                    </Badge>
                  )}
                  {getOverallStatus() === 'warning' && (
                    <Badge variant="secondary">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Issues Detected
                    </Badge>
                  )}
                  {getOverallStatus() === 'error' && (
                    <Badge variant="destructive">
                      <XCircle className="h-3 w-3 mr-1" />
                      Connection Problems
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {results.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {results.map((result, index) => (
                <Alert key={index} className={
                  result.status === 'error' ? 'border-red-200' :
                  result.status === 'warning' ? 'border-yellow-200' :
                  'border-green-200'
                }>
                  <div className="flex items-start gap-3">
                    {getStatusIcon(result.status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{result.test}</span>
                        {getStatusBadge(result.status)}
                        {result.timing && (
                          <Badge variant="outline" className="text-xs">
                            {result.timing}ms
                          </Badge>
                        )}
                      </div>
                      <AlertDescription className="text-sm">
                        <div className="mb-1">{result.message}</div>
                        {result.details && (
                          <div className="text-xs text-muted-foreground italic">
                            {result.details}
                          </div>
                        )}
                      </AlertDescription>
                    </div>
                  </div>
                </Alert>
              ))}
            </CardContent>
          </Card>
        )}

        {results.length > 0 && getRecommendations().length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Recommended Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {getRecommendations().map((rec, index) => (
                <Alert key={index} className="border-orange-200">
                  <AlertDescription>
                    <div className="font-medium mb-2">{rec.title}</div>
                    <div className="text-sm mb-3">{rec.description}</div>
                    <ol className="list-decimal list-inside text-sm space-y-1">
                      {rec.actions.map((action, i) => (
                        <li key={i}>{action}</li>
                      ))}
                    </ol>
                  </AlertDescription>
                </Alert>
              ))}
            </CardContent>
          </Card>
        )}

        {results.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Environment Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Environment:</strong> {import.meta.env.DEV ? 'Development' : 'Production'}
                </div>
                <div>
                  <strong>Hostname:</strong> {window.location.hostname}
                </div>
                <div>
                  <strong>Protocol:</strong> {window.location.protocol}
                </div>
                <div>
                  <strong>Online:</strong> {navigator.onLine ? 'Yes' : 'No'}
                </div>
                <div>
                  <strong>Supabase URL:</strong> {import.meta.env.VITE_SUPABASE_URL}
                </div>
                <div>
                  <strong>API Key Set:</strong> {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Yes' : 'No'}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
