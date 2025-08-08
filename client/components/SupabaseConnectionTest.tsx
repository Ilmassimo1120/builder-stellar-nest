import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";

export default function SupabaseConnectionTest() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [testing, setTesting] = useState(false);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testConnection = async () => {
    setTesting(true);
    setTestResults([]);
    
    try {
      // Test 1: Check environment variables
      addResult(`🔧 VITE_SUPABASE_URL: ${import.meta.env.VITE_SUPABASE_URL}`);
      addResult(`🔧 VITE_SUPABASE_ANON_KEY: ${import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Present' : 'Missing'}`);
      
      // Test 2: Check supabase client configuration
      addResult(`📡 Supabase URL: ${supabase.supabaseUrl}`);
      addResult(`🔑 Supabase Key: ${supabase.supabaseKey ? 'Present' : 'Missing'}`);
      
      // Test 3: Try a simple connection test using health check
      addResult("🚀 Testing connection with health check...");
      const { data, error } = await supabase.rpc('health_check');
      
      if (error) {
        addResult(`❌ Connection failed: ${error.message}`);
        addResult(`📋 Error code: ${error.code}`);
        addResult(`📋 Error details: ${error.details}`);
        addResult(`💡 Error hint: ${error.hint}`);
      } else {
        addResult("✅ Connection successful!");
        addResult(`📊 Query result: ${JSON.stringify(data)}`);
      }
      
      // Test 4: Test RLS and permissions
      addResult("🔐 Testing authentication status...");
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        addResult(`⚠️ Auth status: ${authError.message}`);
      } else if (user) {
        addResult(`✅ Authenticated as: ${user.email}`);
      } else {
        addResult("ℹ️ No user authenticated (using anonymous access)");
      }
      
    } catch (error) {
      addResult(`💥 Unexpected error: ${error}`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>🔍 Supabase Connection Diagnostics</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={testConnection} disabled={testing} className="mb-4">
          {testing ? "Testing..." : "Run Connection Test"}
        </Button>
        
        {testResults.length > 0 && (
          <div className="bg-black text-green-400 p-4 rounded font-mono text-sm max-h-96 overflow-y-auto">
            {testResults.map((result, index) => (
              <div key={index} className="mb-1">
                {result}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
