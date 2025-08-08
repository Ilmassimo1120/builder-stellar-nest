import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Database, Wifi, WifiOff, CheckCircle, AlertTriangle } from 'lucide-react';
import { safeFileStorageService } from '@/lib/services/safeFileStorageService';

export default function DatabaseStatus() {
  const [status, setStatus] = useState<{
    connected: boolean;
    canQuery: boolean;
    storageWorking: boolean;
    error: string | null;
    lastCheck: string | null;
  }>({
    connected: false,
    canQuery: false,
    storageWorking: false,
    error: null,
    lastCheck: null
  });
  const [isChecking, setIsChecking] = useState(false);

  const checkDatabaseStatus = async () => {
    setIsChecking(true);
    const checkTime = new Date().toLocaleTimeString();

    try {
      // Test 1: Check if we can get storage usage (includes database connectivity)
      const storageResult = await safeFileStorageService.getStorageUsage();
      const storageWorking = !storageResult.error;

      // Test 2: Check if we can search (includes authentication + database)
      const searchResult = await safeFileStorageService.searchFiles({});
      const canQuery = !searchResult.error;

      setStatus({
        connected: true, // If we get here, basic connectivity works
        canQuery,
        storageWorking,
        error: storageResult.error || searchResult.error,
        lastCheck: checkTime
      });

    } catch (error) {
      setStatus({
        connected: false,
        canQuery: false,
        storageWorking: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        lastCheck: checkTime
      });
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkDatabaseStatus();
  }, []);

  const getStatusIcon = () => {
    if (status.connected && status.canQuery && status.storageWorking) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else if (status.connected) {
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    } else {
      return <WifiOff className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusText = () => {
    if (status.connected && status.canQuery && status.storageWorking) {
      return 'All systems operational';
    } else if (status.connected) {
      return 'Connected with limited functionality';
    } else {
      return 'Offline mode - database unavailable';
    }
  };

  const getStatusVariant = (): "default" | "secondary" | "destructive" => {
    if (status.connected && status.canQuery && status.storageWorking) {
      return 'default';
    } else if (status.connected) {
      return 'secondary';
    } else {
      return 'destructive';
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Database className="h-5 w-5" />
          <span>Database & Storage Status</span>
          {getStatusIcon()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Overall Status:</span>
          <Badge variant={getStatusVariant()}>
            {getStatusText()}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            {status.connected ? 
              <Wifi className="h-4 w-4 text-green-500" /> : 
              <WifiOff className="h-4 w-4 text-red-500" />
            }
            <span className="text-sm">
              Network: {status.connected ? 'Connected' : 'Offline'}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {status.canQuery ? 
              <CheckCircle className="h-4 w-4 text-green-500" /> : 
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            }
            <span className="text-sm">
              Search: {status.canQuery ? 'Working' : 'Limited'}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {status.storageWorking ? 
              <CheckCircle className="h-4 w-4 text-green-500" /> : 
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            }
            <span className="text-sm">
              Storage: {status.storageWorking ? 'Working' : 'Limited'}
            </span>
          </div>
        </div>

        {status.error && (
          <Alert variant="destructive">
            <AlertDescription>
              <strong>Note:</strong> {status.error}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Last checked: {status.lastCheck || 'Never'}
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={checkDatabaseStatus}
            disabled={isChecking}
          >
            {isChecking ? 'Checking...' : 'Refresh Status'}
          </Button>
        </div>

        <Alert>
          <AlertDescription>
            <strong>How it works:</strong> The file storage system now gracefully handles database 
            unavailability by returning empty results instead of crashing. This allows the 
            application to function even when the database tables don't exist yet or there 
            are network connectivity issues.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
