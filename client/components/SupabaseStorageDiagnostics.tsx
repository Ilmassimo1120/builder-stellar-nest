import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface DiagnosticResult {
  test: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: string;
}

export const SupabaseStorageDiagnostics: React.FC = () => {
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<DiagnosticResult[]>([]);

  const runDiagnostics = async () => {
    setRunning(true);
    const newResults: DiagnosticResult[] = [];

    // Test 1: Basic Supabase connection
    try {
      console.log('🔍 Testing basic Supabase connection...');
      const { data, error } = await supabase.from('users').select('count').limit(1);
      
      if (error) {
        if (error.message.includes('Failed to fetch')) {
          newResults.push({
            test: 'Supabase Connection',
            status: 'error',
            message: 'Failed to fetch - CORS or network issue',
            details: 'This suggests a CORS configuration problem or network connectivity issue. Check your Supabase project settings.'
          });
        } else {
          newResults.push({
            test: 'Supabase Connection',
            status: 'warning',
            message: error.message,
            details: 'Connection established but query failed. This might be expected if tables don\'t exist yet.'
          });
        }
      } else {
        newResults.push({
          test: 'Supabase Connection',
          status: 'success',
          message: 'Connection successful',
          details: 'Supabase API is reachable and responding.'
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      newResults.push({
        test: 'Supabase Connection',
        status: 'error',
        message: errorMessage,
        details: 'Network error occurred. Check your internet connection and CORS settings.'
      });
    }

    // Test 2: Storage buckets
    try {
      console.log('🪣 Testing storage bucket access...');
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        if (bucketsError.message.includes('Failed to fetch')) {
          newResults.push({
            test: 'Storage Buckets',
            status: 'error',
            message: 'Failed to fetch buckets - CORS issue',
            details: 'Cannot access storage API. This is likely a CORS configuration problem in your Supabase project.'
          });
        } else {
          newResults.push({
            test: 'Storage Buckets',
            status: 'error',
            message: bucketsError.message,
            details: 'Storage API error. Check your Supabase configuration and permissions.'
          });
        }
      } else {
        const requiredBuckets = ['charge-source-user-files', 'charge-source-documents', 'charge-source-videos'];
        const existingBuckets = buckets?.map(b => b.name) || [];
        const missingBuckets = requiredBuckets.filter(b => !existingBuckets.includes(b));
        
        if (missingBuckets.length > 0) {
          newResults.push({
            test: 'Storage Buckets',
            status: 'warning',
            message: `Missing buckets: ${missingBuckets.join(', ')}`,
            details: 'Some required storage buckets are missing. Create them in your Supabase dashboard.'
          });
        } else {
          newResults.push({
            test: 'Storage Buckets',
            status: 'success',
            message: 'All required buckets exist',
            details: `Found buckets: ${existingBuckets.join(', ')}`
          });
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      newResults.push({
        test: 'Storage Buckets',
        status: 'error',
        message: errorMessage,
        details: 'Failed to test storage buckets. This is likely a network or CORS issue.'
      });
    }

    // Test 3: Authentication
    try {
      console.log('🔐 Testing authentication...');
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        if (authError.message.includes('Failed to fetch')) {
          newResults.push({
            test: 'Authentication',
            status: 'error',
            message: 'Failed to fetch user - CORS issue',
            details: 'Cannot access auth API. This is likely a CORS configuration problem.'
          });
        } else {
          newResults.push({
            test: 'Authentication',
            status: 'warning',
            message: authError.message,
            details: 'Auth API is reachable but no user session found. This may be expected.'
          });
        }
      } else if (user) {
        newResults.push({
          test: 'Authentication',
          status: 'success',
          message: `Authenticated as ${user.email}`,
          details: 'Supabase authentication is working correctly.'
        });
      } else {
        newResults.push({
          test: 'Authentication',
          status: 'warning',
          message: 'No active session',
          details: 'Auth API is working but no user is logged in. This may be expected.'
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      newResults.push({
        test: 'Authentication',
        status: 'error',
        message: errorMessage,
        details: 'Failed to test authentication. This is likely a network or CORS issue.'
      });
    }

    setResults(newResults);
    setRunning(false);
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Supabase Storage Diagnostics
        </CardTitle>
        <CardDescription>
          Test your Supabase connection and storage configuration to diagnose upload issues
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runDiagnostics} 
          disabled={running}
          className="w-full"
        >
          {running ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Running Diagnostics...
            </>
          ) : (
            'Run Diagnostics'
          )}
        </Button>

        {results.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold">Test Results:</h3>
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
          </div>
        )}

        {results.some(r => r.status === 'error' && r.message.includes('Failed to fetch')) && (
          <Alert className="border-orange-200">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>CORS Issue Detected:</strong> To fix "Failed to fetch" errors:
              <ol className="list-decimal list-inside mt-2 text-sm space-y-1">
                <li>Go to your Supabase Dashboard → Settings → API</li>
                <li>Add your domain to the "CORS Origins" list</li>
                <li>Include both <code>http://localhost:8080</code> and your production domain</li>
                <li>Save settings and wait a few minutes for changes to take effect</li>
              </ol>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default SupabaseStorageDiagnostics;
