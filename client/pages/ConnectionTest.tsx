import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { autoConfigureSupabase, checkSupabaseConnection } from "@/lib/supabase";
import { SupabaseSetup } from "@/components/SupabaseSetup";

export default function ConnectionTest() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
    console.log(message);
  };

  const testConnection = async () => {
    setIsLoading(true);
    addLog("🔍 Starting connection test...");

    try {
      // Test basic connection
      addLog("📡 Testing basic Supabase connection...");
      const basicConnection = await checkSupabaseConnection();
      addLog(`Basic connection result: ${basicConnection}`);

      // Test auto-configuration
      addLog("🚀 Testing auto-configuration...");
      const autoConfig = await autoConfigureSupabase();
      addLog(`Auto-configuration result: ${autoConfig}`);

      setIsConnected(autoConfig);
      addLog(`✅ Connection test completed. Connected: ${autoConfig}`);
    } catch (error) {
      addLog(`❌ Connection test failed: ${error}`);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const retryConnection = async (): Promise<void> => {
    addLog("🔄 Retrying connection...");
    await testConnection();
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Supabase Connection Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Button onClick={testConnection} disabled={isLoading}>
                {isLoading ? "Testing..." : "Test Connection"}
              </Button>
              <Button variant="outline" onClick={clearLogs}>
                Clear Logs
              </Button>
            </div>

            <div className="text-sm">
              <strong>Status:</strong>{" "}
              {isConnected ? "🟢 Connected" : "🔴 Not Connected"}
            </div>

            <div className="text-sm">
              <strong>Environment Variables:</strong>
              <ul className="list-disc list-inside ml-4">
                <li>
                  VITE_SUPABASE_URL:{" "}
                  {import.meta.env.VITE_SUPABASE_URL || "Not set"}
                </li>
                <li>
                  VITE_SUPABASE_ANON_KEY:{" "}
                  {import.meta.env.VITE_SUPABASE_ANON_KEY ? "Set" : "Not set"}
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <SupabaseSetup isConnected={isConnected} onRetry={retryConnection} />

        <Card>
          <CardHeader>
            <CardTitle>Connection Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 p-4 rounded-lg max-h-96 overflow-y-auto">
              {logs.length === 0 ? (
                <div className="text-gray-500">
                  No logs yet. Click "Test Connection" to start.
                </div>
              ) : (
                <div className="space-y-1 text-sm font-mono">
                  {logs.map((log, index) => (
                    <div key={index}>{log}</div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
