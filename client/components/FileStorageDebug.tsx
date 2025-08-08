import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { safeFileStorageService } from '@/lib/services/safeFileStorageService';
import { supabase } from '@/lib/supabase';

export default function FileStorageDebug() {
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    const testResults: any = {};

    try {
      // Test 1: Check authentication
      testResults.auth = await testAuth();
      
      // Test 2: Check database connection
      testResults.database = await testDatabase();
      
      // Test 3: Test search function
      testResults.search = await testSearch();
      
      // Test 4: Test storage usage
      testResults.storageUsage = await testStorageUsage();
      
    } catch (error) {
      testResults.globalError = {
        success: false,
        message: error instanceof Error ? error.message : String(error),
        error: error
      };
    }
    
    setResults(testResults);
    setLoading(false);
  };

  const testAuth = async () => {
    let localAuthResult = null;
    let supabaseAuthResult = null;

    // Test local auth
    try {
      const storedUser = localStorage.getItem('chargeSourceUser');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        localAuthResult = {
          success: true,
          message: `Local auth user: ${userData.email} (${userData.role})`,
          data: userData
        };
      } else {
        localAuthResult = {
          success: false,
          message: 'No local auth user found',
          data: null
        };
      }
    } catch (error) {
      localAuthResult = {
        success: false,
        message: `Local auth error: ${error instanceof Error ? error.message : String(error)}`,
        data: null
      };
    }

    // Test Supabase auth
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      supabaseAuthResult = {
        success: !error,
        message: error ? `Supabase auth error: ${error.message}` : `Supabase user: ${user?.email || 'No user'}`,
        data: { user, error }
      };
    } catch (error) {
      supabaseAuthResult = {
        success: false,
        message: `Supabase auth exception: ${error instanceof Error ? error.message : String(error)}`,
        data: error
      };
    }

    // Return combined result
    const primaryAuth = localAuthResult.success ? 'Local Auth' : (supabaseAuthResult.success ? 'Supabase Auth' : 'None');
    return {
      success: localAuthResult.success || supabaseAuthResult.success,
      message: `Primary: ${primaryAuth} | Local: ${localAuthResult.success ? '✅' : '❌'} | Supabase: ${supabaseAuthResult.success ? '✅' : '❌'}`,
      data: { localAuth: localAuthResult, supabaseAuth: supabaseAuthResult }
    };
  };

  const testDatabase = async () => {
    try {
      const { data, error } = await supabase
        .from('file_assets')
        .select('count')
        .limit(1);
      
      return {
        success: !error,
        message: error ? `Database error: ${error.message}` : 'Database connection successful',
        data: { data, error }
      };
    } catch (error) {
      return {
        success: false,
        message: `Database exception: ${error instanceof Error ? error.message : String(error)}`,
        error
      };
    }
  };

  const testSearch = async () => {
    const result = await safeFileStorageService.searchFiles({});
    return {
      success: !result.error,
      message: result.error || `Search successful: ${result.files.length} files found`,
      data: result
    };
  };

  const testStorageUsage = async () => {
    const result = await safeFileStorageService.getStorageUsage();
    return {
      success: !result.error,
      message: result.error || `Storage usage: ${result.totalFiles} files, ${result.totalSize} bytes`,
      data: result
    };
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>File Storage Debug</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runTests} disabled={loading}>
          {loading ? 'Running Tests...' : 'Run Debug Tests'}
        </Button>

        {Object.keys(results).length > 0 && (
          <div className="space-y-4">
            {Object.entries(results).map(([testName, result]: [string, any]) => (
              <Alert key={testName} variant={result.success ? 'default' : 'destructive'}>
                <AlertDescription>
                  <div className="space-y-2">
                    <div className="font-semibold">
                      {testName}: {result.success ? '✅ Success' : '❌ Failed'}
                    </div>
                    <div className="text-sm">{result.message}</div>
                    {result.error && (
                      <details className="text-xs">
                        <summary>Error Details</summary>
                        <pre className="mt-2 p-2 bg-muted rounded">
                          {JSON.stringify(result.error, null, 2)}
                        </pre>
                      </details>
                    )}
                    {result.data && (
                      <details className="text-xs">
                        <summary>Data</summary>
                        <pre className="mt-2 p-2 bg-muted rounded">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
