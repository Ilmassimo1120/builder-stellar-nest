import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Cloud,
  HardDrive,
  AlertTriangle,
  CheckCircle,
  Wifi,
  WifiOff,
  RefreshCw,
  Info,
} from "lucide-react";
import CORSFixGuide from "./CORSFixGuide";

interface StorageStatusIndicatorProps {
  className?: string;
  showDetails?: boolean;
}

export default function StorageStatusIndicator({
  className,
  showDetails = false,
}: StorageStatusIndicatorProps) {
  const [showGuide, setShowGuide] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Listen for online/offline events
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const hasLocalFiles = localStats.totalFiles > 0;

  return (
    <div className={className}>
      <div className="flex items-center space-x-2">
        {/* Network Status */}
        <Badge
          variant={isOnline ? "default" : "destructive"}
          className="flex items-center space-x-1"
        >
          {isOnline ? (
            <Wifi className="h-3 w-3" />
          ) : (
            <WifiOff className="h-3 w-3" />
          )}
          <span>{isOnline ? "Online" : "Offline"}</span>
        </Badge>

        {/* Storage Status */}
        {hasLocalFiles ? (
          <Badge variant="secondary" className="flex items-center space-x-1">
            <HardDrive className="h-3 w-3" />
            <span>{localStats.totalFiles} local files</span>
          </Badge>
        ) : (
          <Badge variant="outline" className="flex items-center space-x-1">
            <Cloud className="h-3 w-3" />
            <span>Cloud ready</span>
          </Badge>
        )}

        {/* Show help button if there are local files or if offline */}
        {(hasLocalFiles || !isOnline) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowGuide(!showGuide)}
            className="h-6 px-2"
          >
            <Info className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Status details */}
      {showDetails && hasLocalFiles && (
        <Alert className="mt-2">
          <HardDrive className="h-4 w-4" />
          <AlertDescription>
            {localStats.totalFiles} files stored locally (
            {localStats.storageUsed} used). Files will sync to cloud storage
            when connection is restored.
          </AlertDescription>
        </Alert>
      )}

      {/* Network status warning */}
      {!isOnline && (
        <Alert variant="destructive" className="mt-2">
          <WifiOff className="h-4 w-4" />
          <AlertDescription>
            You're currently offline. Files will be saved locally and synced
            when you're back online.
          </AlertDescription>
        </Alert>
      )}

      {/* CORS/Connection guide */}
      {showGuide && (
        <div className="mt-4">
          <CORSFixGuide showDetailed={true} />
        </div>
      )}
    </div>
  );
}
