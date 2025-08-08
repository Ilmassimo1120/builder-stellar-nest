import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestConnection() {
  const [results, setResults] = useState<string[]>([]);
  const [testing, setTesting] = useState(false);

  const addResult = (message: string) => {
    setResults((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${message}`,
    ]);
  };

  const testConnection = async () => {
    setTesting(true);
    setResults([]);

    // Get environment variables
    const envUrl = import.meta.env.VITE_SUPABASE_URL;
    const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    // Hardcoded values for comparison
    const hardcodedUrl = "https://tepmkljodsifaexmrinl.supabase.co";
    const hardcodedKey =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlcG1rbGpvZHNpZmFleG1yaW5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2MDQwMjUsImV4cCI6MjA3MDE4MDAyNX0.n4WdeHUHHc5PuJV8-2oDn826CoNxNzHHbt4KxeAhOYc";

    addResult("🔧 Environment URL: " + (envUrl || "undefined"));
    addResult("🔧 Environment Key: " + (envKey ? "present" : "undefined"));
    addResult("🔧 Hardcoded URL: " + hardcodedUrl);
    addResult("🔧 Hardcoded Key: " + (hardcodedKey ? "present" : "undefined"));

    const urlToUse = envUrl || hardcodedUrl;
    const keyToUse = envKey || hardcodedKey;

    addResult("🎯 Using URL: " + urlToUse);
    addResult("🎯 Using Key: " + (keyToUse ? "present" : "missing"));

    try {
      // Test 1: Basic HTTP request
      addResult("🌐 Test 1: Basic HTTP request...");
      const basicResponse = await fetch(urlToUse + "/rest/v1/", {
        method: "GET",
        headers: {
          apikey: keyToUse,
          Authorization: `Bearer ${keyToUse}`,
          "Content-Type": "application/json",
        },
      });

      addResult(
        `✅ Basic request: ${basicResponse.status} ${basicResponse.statusText}`,
      );

      // Test 2: Health check function
      addResult("🔍 Test 2: Health check function...");
      const healthResponse = await fetch(
        urlToUse + "/rest/v1/rpc/health_check",
        {
          method: "POST",
          headers: {
            apikey: keyToUse,
            Authorization: `Bearer ${keyToUse}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        addResult("✅ Health check: " + JSON.stringify(healthData));
      } else {
        const errorText = await healthResponse.text();
        addResult(
          `❌ Health check failed: ${healthResponse.status} - ${errorText}`,
        );
      }

      // Test 3: Health status table
      addResult("📊 Test 3: Health status table...");
      const tableResponse = await fetch(
        urlToUse + "/rest/v1/health_status?select=*",
        {
          method: "GET",
          headers: {
            apikey: keyToUse,
            Authorization: `Bearer ${keyToUse}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (tableResponse.ok) {
        const tableData = await tableResponse.json();
        addResult("✅ Table query: " + JSON.stringify(tableData));
      } else {
        const errorText = await tableResponse.text();
        addResult(
          `❌ Table query failed: ${tableResponse.status} - ${errorText}`,
        );
      }

      addResult(
        "🎉 All tests completed successfully! Supabase should be working.",
      );
    } catch (error) {
      addResult("❌ Connection test failed: " + error.message);
      addResult("❌ Error type: " + error.constructor.name);
      addResult("❌ Full error: " + JSON.stringify(error, null, 2));

      if (error.message.includes("Failed to fetch")) {
        addResult("💡 This is likely a network/CORS/firewall issue");
        addResult("💡 Possible solutions:");
        addResult("   - Check if Supabase domain is blocked");
        addResult("   - Verify network connectivity");
        addResult("   - Check browser console for CORS errors");
      }
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>🔧 Direct Supabase Connection Test</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={testConnection} disabled={testing} className="mb-4">
            {testing ? "Testing..." : "Run Connection Test"}
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
    </div>
  );
}
