import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Cloud, Database, Wifi, RefreshCw } from "lucide-react";
import { autoInit } from "@/lib/autoInit";

export default function ConnectionStatus() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkConnection();
  }, []);

  const forceRecheck = async () => {
    setIsLoading(true);
    // Reset the auto initialization
    autoInit.reset();
    await checkConnection();
  };

  const checkConnection = async () => {
    try {
      console.log("🔄 ConnectionStatus: Starting safe connection check...");

      // Check for problematic environments before doing anything
      if (typeof window !== "undefined") {
        const hasFullStory =
          !!(window as any).FS ||
          document.querySelector('script[src*="fullstory"]');
        const hasFetchInterception =
          window.fetch && window.fetch.toString().includes("messageHandler");

        if (hasFullStory || hasFetchInterception) {
          console.log(
            "🔄 ConnectionStatus: Monitoring tools detected, using local mode",
          );
          setIsConnected(false);
          return;
        }
      }

      // Force reset the autoInit state
      autoInit.reset();

      const connected = await autoInit.initialize();
      console.log(
        "🔄 ConnectionStatus: autoInit.initialize() returned:",
        connected,
      );

      // Double check the state
      const finalState = autoInit.isSupabaseConnected();
      console.log("🔄 ConnectionStatus: final state:", finalState);

      setIsConnected(finalState);
    } catch (error) {
      console.log(
        "⚠️ ConnectionStatus: Connection check failed, using local mode",
      );
      console.log(
        "Error details:",
        error instanceof Error ? error.message : String(error),
      );
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span>Connecting to ChargeSource...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            ChargeSource Cloud Status
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={forceRecheck}
            disabled={isLoading}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            {isLoading ? "Checking..." : "Refresh"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isConnected ? (
              <>
                <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg">
                  <Cloud className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Cloud Connected</p>
                  <p className="text-sm text-muted-foreground">
                    Your data is automatically synced to the cloud
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                  <Wifi className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Local Mode</p>
                  <p className="text-sm text-muted-foreground">
                    Working locally, cloud features unavailable
                  </p>
                </div>
              </>
            )}
          </div>
          <Badge
            variant={isConnected ? "default" : "secondary"}
            className={isConnected ? "bg-green-100 text-green-800" : ""}
          >
            {isConnected ? (
              <>
                <CheckCircle className="w-3 h-3 mr-1" />
                Connected
              </>
            ) : (
              "Local"
            )}
          </Badge>
        </div>

        {isConnected && (
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-green-600">✓</div>
              <div className="text-xs text-muted-foreground">
                Real-time Sync
              </div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-600">✓</div>
              <div className="text-xs text-muted-foreground">Cloud Backup</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-600">✓</div>
              <div className="text-xs text-muted-foreground">Collaboration</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
