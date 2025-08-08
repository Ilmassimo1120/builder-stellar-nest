import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";

export default function SupabaseDebug() {
  const [results, setResults] = useState<string[]>([]);
  const [testing, setTesting] = useState(false);

  const addLog = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testConnection = async () => {
    setTesting(true);
    setResults([]);
    
    try {
      addLog("🔗 Testing basic connection...");
      
      // Test 1: Basic connection
      try {
        const response = await fetch(supabase.supabaseUrl + '/rest/v1/', {
          method: 'GET',
          headers: {
            'apikey': supabase.supabaseKey,
            'Authorization': `Bearer ${supabase.supabaseKey}`
          }
        });
        addLog(`✅ REST API reachable: ${response.status}`);
      } catch (error) {
        addLog(`❌ REST API unreachable: ${error}`);
      }

      // Test 2: Users table query
      addLog("🔍 Testing users table access...");
      try {
        const { data, error } = await supabase.from('users').select('count').limit(1);
        if (error) {
          addLog(`❌ Users table error: ${error.message} (${error.code})`);
          addLog(`📋 Error details: ${error.details}`);
          addLog(`💡 Hint: ${error.hint}`);
        } else {
          addLog(`✅ Users table accessible`);
        }
      } catch (error) {
        addLog(`❌ Users table exception: ${error}`);
      }

      // Test 3: Check if tables exist
      addLog("📊 Checking table schema...");
      try {
        const { data, error } = await supabase.rpc('version');
        if (error) {
          addLog(`❌ Version check failed: ${error.message}`);
        } else {
          addLog(`✅ Database version check successful`);
        }
      } catch (error) {
        addLog(`⚠️ Version check not available: ${error}`);
      }

      // Test 4: List available tables
      addLog("📋 Attempting to list tables...");
      try {
        const { data, error } = await supabase
          .from('information_schema.tables')
          .select('table_name')
          .eq('table_schema', 'public');
        
        if (error) {
          addLog(`❌ Cannot list tables: ${error.message}`);
        } else {
          addLog(`✅ Found ${data?.length || 0} tables in public schema`);
          data?.forEach(table => addLog(`  📑 Table: ${table.table_name}`));
        }
      } catch (error) {
        addLog(`❌ Table listing failed: ${error}`);
      }

      // Test 5: Auth status
      addLog("🔐 Checking auth status...");
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
          addLog(`⚠️ Auth status: ${error.message}`);
        } else if (user) {
          addLog(`✅ Authenticated as: ${user.email}`);
        } else {
          addLog(`ℹ️ No user authenticated (anonymous access)`);
        }
      } catch (error) {
        addLog(`❌ Auth check failed: ${error}`);
      }

    } catch (error) {
      addLog(`💥 General error: ${error}`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Supabase Connection Debug</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={testConnection} disabled={testing} className="w-full">
          {testing ? "Testing..." : "Run Connection Test"}
        </Button>
        
        {results.length > 0 && (
          <div className="bg-gray-50 border rounded p-4 max-h-96 overflow-y-auto">
            <h4 className="font-medium mb-2">Test Results:</h4>
            <div className="space-y-1 text-sm font-mono">
              {results.map((result, index) => (
                <div key={index} className={
                  result.includes('❌') ? 'text-red-600' :
                  result.includes('✅') ? 'text-green-600' :
                  result.includes('⚠️') ? 'text-yellow-600' :
                  'text-gray-600'
                }>
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
