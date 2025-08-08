import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NetworkTest() {
  const [results, setResults] = useState<string[]>([]);
  const [testing, setTesting] = useState(false);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testNetwork = async () => {
    setTesting(true);
    setResults([]);

    const supabaseUrl = "https://tepmkljodsifaexmrinl.supabase.co";
    const apiKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlcG1rbGpvZHNpZmFleG1yaW5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2MDQwMjUsImV4cCI6MjA3MDE4MDAyNX0.n4WdeHUHHc5PuJV8-2oDn826CoNxNzHHbt4KxeAhOYc";

    try {
      // Test 1: Basic domain resolution
      addResult("🌐 Testing domain resolution...");
      try {
        const response = await fetch(supabaseUrl, { method: 'HEAD', mode: 'no-cors' });
        addResult("✅ Domain is reachable");
      } catch (error) {
        addResult(`❌ Domain unreachable: ${error}`);
      }

      // Test 2: Test CORS preflight
      addResult("🔒 Testing CORS...");
      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/`, {
          method: 'OPTIONS',
          headers: {
            'Origin': window.location.origin,
            'Access-Control-Request-Method': 'GET',
            'Access-Control-Request-Headers': 'apikey, authorization'
          }
        });
        addResult(`✅ CORS preflight: ${response.status}`);
      } catch (error) {
        addResult(`❌ CORS failed: ${error}`);
      }

      // Test 3: Test actual API endpoint
      addResult("📡 Testing API endpoint...");
      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/`, {
          method: 'GET',
          headers: {
            'apikey': apiKey,
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        });
        
        addResult(`📡 API Response: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
          addResult("✅ API endpoint accessible");
        } else {
          const text = await response.text();
          addResult(`❌ API error: ${text}`);
        }
      } catch (error) {
        addResult(`❌ API request failed: ${error}`);
        if (error instanceof TypeError && error.message.includes('fetch')) {
          addResult("💡 This appears to be a network connectivity issue");
          addResult("💡 Possible causes:");
          addResult("   - Firewall blocking requests");
          addResult("   - Network proxy issues");
          addResult("   - DNS resolution problems");
          addResult("   - SSL/TLS certificate issues");
        }
      }

      // Test 4: Test specific endpoints
      addResult("🔍 Testing health endpoint...");
      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/health_check`, {
          method: 'POST',
          headers: {
            'apikey': apiKey,
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          addResult(`✅ Health check successful: ${JSON.stringify(data)}`);
        } else {
          addResult(`❌ Health check failed: ${response.status}`);
        }
      } catch (error) {
        addResult(`❌ Health check error: ${error}`);
      }

    } catch (error) {
      addResult(`💥 Test suite error: ${error}`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>🌐 Network Connectivity Test</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={testNetwork} disabled={testing} className="mb-4">
          {testing ? "Testing..." : "Run Network Test"}
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
  );
}
