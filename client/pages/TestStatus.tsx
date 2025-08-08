import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Cloud, Database, Wifi, RefreshCw } from "lucide-react";
import { autoInit } from "@/lib/autoInit";
import { autoConfigureSupabase } from "@/lib/supabase";
import ConnectionStatus from "@/components/ConnectionStatus";

export default function TestStatus() {
  const [results, setResults] = useState<string[]>([]);
  const [testing, setTesting] = useState(false);
  const [connectionState, setConnectionState] = useState({
    autoInit: false,
    autoConfig: false,
    manual: false
  });

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testAllConnections = async () => {
    setTesting(true);
    setResults([]);

    try {
      // Test 1: autoInit
      addResult("🔄 Testing autoInit.initialize()...");
      const autoInitResult = await autoInit.initialize();
      addResult(`autoInit result: ${autoInitResult}`);
      addResult(`autoInit.isSupabaseConnected(): ${autoInit.isSupabaseConnected()}`);
      
      // Test 2: autoConfigureSupabase
      addResult("🔄 Testing autoConfigureSupabase()...");
      const autoConfigResult = await autoConfigureSupabase();
      addResult(`autoConfigureSupabase result: ${autoConfigResult}`);
      
      // Test 3: Manual check
      addResult("🔄 Testing manual connection...");
      const { supabase } = await import("@/lib/supabase");
      const { data, error } = await supabase.from('health_status').select('*').limit(1);
      const manualResult = !error;
      addResult(`Manual check result: ${manualResult}`);
      if (error) {
        addResult(`Manual check error: ${error.message}`);
      } else {
        addResult(`Manual check data: ${JSON.stringify(data)}`);
      }
      
      setConnectionState({
        autoInit: autoInitResult,
        autoConfig: autoConfigResult,
        manual: manualResult
      });
      
      addResult("🎯 Summary:");
      addResult(`  autoInit: ${autoInitResult ? '✅' : '❌'}`);
      addResult(`  autoConfig: ${autoConfigResult ? '✅' : '❌'}`);
      addResult(`  manual: ${manualResult ? '✅' : '❌'}`);
      
    } catch (error) {
      addResult(`❌ Test failed: ${error}`);
    } finally {
      setTesting(false);
    }
  };

  useEffect(() => {
    testAllConnections();
  }, []);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>🔧 Connection Status Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-4">
              <Badge variant={connectionState.autoInit ? "default" : "destructive"}>
                AutoInit: {connectionState.autoInit ? "✅" : "❌"}
              </Badge>
              <Badge variant={connectionState.autoConfig ? "default" : "destructive"}>
                AutoConfig: {connectionState.autoConfig ? "✅" : "❌"}
              </Badge>
              <Badge variant={connectionState.manual ? "default" : "destructive"}>
                Manual: {connectionState.manual ? "✅" : "❌"}
              </Badge>
            </div>
            
            <Button onClick={testAllConnections} disabled={testing} className="mb-4">
              {testing ? "Testing..." : "Run All Tests"}
            </Button>
            
            {results.length > 0 && (
              <div className="bg-black text-green-400 p-4 rounded font-mono text-sm max-h-96 overflow-y-auto">
                {results.map((result, index) => (
                  <div key={index} className="mb-1">
                    {result}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>🔧 Actual ConnectionStatus Component</CardTitle>
          </CardHeader>
          <CardContent>
            <ConnectionStatus />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
