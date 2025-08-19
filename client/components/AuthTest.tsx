import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { supabase } from '@/lib/supabase';

export default function AuthTest() {
  const [authState, setAuthState] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  const quickTestLogin = async () => {
    setLoginLoading(true);
    try {
      // Try to sign in with a test user or sign up if it doesn't exist
      const testEmail = 'test@chargesource.com.au';
      const testPassword = 'testpass123';

      // First try to sign in
      let { data, error } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });

      // If sign in fails, try to sign up
      if (error && error.message.includes('Invalid login')) {
        console.log('Test user not found, creating...');
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: testEmail,
          password: testPassword,
          options: {
            data: {
              first_name: 'Test',
              last_name: 'User',
            },
          },
        });

        if (signUpError) {
          throw signUpError;
        }

        data = signUpData;
      } else if (error) {
        throw error;
      }

      if (data.user) {
        alert('✅ Test login successful! You can now run the authentication test.');
        // Auto-run the auth test after successful login
        setTimeout(testAuth, 1000);
      }
    } catch (error) {
      console.error('Test login failed:', error);
      alert(`❌ Test login failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoginLoading(false);
    }
  };

  const testLogout = async () => {
    try {
      await supabase.auth.signOut();
      alert('✅ Logged out successfully');
      setAuthState(null);
    } catch (error) {
      alert(`❌ Logout failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const testAuth = async () => {
    setLoading(true);
    const results: any = {
      timestamp: new Date().toISOString()
    };

    try {
      // Test 1: getUser()
      const { data: userData, error: userError } = await supabase.auth.getUser();
      results.getUser = {
        success: !userError,
        user: userData.user,
        error: userError?.message,
        userId: userData.user?.id,
        email: userData.user?.email
      };

      // Test 2: getSession()
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      results.getSession = {
        success: !sessionError,
        session: sessionData.session ? {
          userId: sessionData.session.user?.id,
          email: sessionData.session.user?.email,
          expiresAt: sessionData.session.expires_at
        } : null,
        error: sessionError?.message
      };

      // Test 3: Storage bucket list
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      results.buckets = {
        success: !bucketsError,
        buckets: buckets?.map(b => b.name) || [],
        error: bucketsError?.message
      };

      // Test 4: Simple DB query (should work if auth is good)
      const { data: dbData, error: dbError } = await supabase
        .from('users')
        .select('id, email')
        .limit(1);
      
      results.database = {
        success: !dbError,
        canQuery: !dbError,
        error: dbError?.message
      };

    } catch (error) {
      results.globalError = {
        message: error instanceof Error ? error.message : String(error)
      };
    }

    setAuthState(results);
    setLoading(false);
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>🔐 Authentication Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          <Button onClick={testAuth} disabled={loading}>
            {loading ? 'Testing...' : 'Test Authentication'}
          </Button>
          <Button onClick={quickTestLogin} disabled={loginLoading} variant="outline">
            {loginLoading ? 'Logging in...' : 'Quick Test Login'}
          </Button>
          <Button onClick={testLogout} variant="outline" size="sm">
            Logout
          </Button>
        </div>

        {authState && (
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">
              Test run at: {authState.timestamp}
            </div>

            {/* getUser test */}
            <Alert variant={authState.getUser?.success ? 'default' : 'default'}>
              <AlertDescription>
                <div className="font-semibold">
                  getUser(): {authState.getUser?.success ? '✅ Authenticated' : '🔒 No Active Session'}
                </div>
                {authState.getUser?.success ? (
                  <div className="text-sm mt-1">
                    User: {authState.getUser.email} (ID: {authState.getUser.userId})
                  </div>
                ) : (
                  <div className="text-sm mt-1 text-muted-foreground">
                    {authState.getUser?.error?.includes('Auth session missing')
                      ? 'No user is currently logged in to Supabase'
                      : `Error: ${authState.getUser?.error || 'Unknown error'}`}
                  </div>
                )}
              </AlertDescription>
            </Alert>

            {/* getSession test */}
            <Alert variant={authState.getSession?.success ? 'default' : 'default'}>
              <AlertDescription>
                <div className="font-semibold">
                  getSession(): {authState.getSession?.success ? '✅ Valid Session' : '🔒 No Session'}
                </div>
                {authState.getSession?.success ? (
                  <div className="text-sm mt-1">
                    {authState.getSession.session ? (
                      <>Session: {authState.getSession.session.email} (Expires: {authState.getSession.session.expiresAt})</>
                    ) : (
                      'Session available but no user data'
                    )}
                  </div>
                ) : (
                  <div className="text-sm mt-1 text-muted-foreground">
                    No active authentication session found
                  </div>
                )}
              </AlertDescription>
            </Alert>

            {/* Storage buckets test */}
            <Alert variant={authState.buckets?.success ? 'default' : 'destructive'}>
              <AlertDescription>
                <div className="font-semibold">
                  Storage Buckets: {authState.buckets?.success ? '✅ Success' : '❌ Failed'}
                </div>
                {authState.buckets?.success ? (
                  <div className="text-sm mt-1">
                    Buckets: {authState.buckets.buckets.length > 0 ? authState.buckets.buckets.join(', ') : 'No buckets found'}
                  </div>
                ) : (
                  <div className="text-sm mt-1 text-red-600">
                    Error: {authState.buckets?.error || 'Unknown error'}
                  </div>
                )}
              </AlertDescription>
            </Alert>

            {/* Database test */}
            <Alert variant={authState.database?.success ? 'default' : 'destructive'}>
              <AlertDescription>
                <div className="font-semibold">
                  Database Query: {authState.database?.success ? '✅ Success' : '❌ Failed'}
                </div>
                {authState.database?.success ? (
                  <div className="text-sm mt-1">
                    Can query database with current auth
                  </div>
                ) : (
                  <div className="text-sm mt-1 text-red-600">
                    Error: {authState.database?.error || 'Unknown error'}
                  </div>
                )}
              </AlertDescription>
            </Alert>

            {authState.globalError && (
              <Alert variant="destructive">
                <AlertDescription>
                  <div className="font-semibold">Global Error</div>
                  <div className="text-sm mt-1">{authState.globalError.message}</div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
