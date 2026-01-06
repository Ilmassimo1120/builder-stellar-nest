import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  HardDrive,
} from "lucide-react";
import { storageQuotaService, type QuotaInfo } from "@/lib/services/storageQuotaService";
import { toast } from "sonner";

export default function StoragePerformanceMetrics() {
  const [quotaInfo, setQuotaInfo] = useState<QuotaInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadQuotaInfo = async () => {
    setLoading(true);
    setError(null);

    try {
      const info = await storageQuotaService.getQuotaInfo();
      setQuotaInfo(info);
      setLastUpdated(new Date());
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load quota info";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuotaInfo();
  }, []);

  const getProgressColor = (percent: number): string => {
    if (percent >= 100) return "bg-red-500";
    if (percent >= 80) return "bg-orange-500";
    if (percent >= 60) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getProgressPercentage = (percent: number): string => {
    if (percent >= 100) return "text-red-500";
    if (percent >= 80) return "text-orange-500";
    if (percent >= 60) return "text-yellow-500";
    return "text-green-500";
  };

  const getStatusBadge = (percent: number) => {
    if (percent >= 100) return <Badge className="bg-red-500">Full</Badge>;
    if (percent >= 80)
      return <Badge className="bg-orange-500">Near Limit</Badge>;
    if (percent >= 60) return <Badge className="bg-yellow-500">Caution</Badge>;
    return <Badge className="bg-green-500">Healthy</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Storage Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <RefreshCw className="w-5 h-5 animate-spin text-muted-foreground mr-2" />
          <span className="text-muted-foreground">Loading quota information...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Storage Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
          <Button onClick={loadQuotaInfo} variant="outline" className="w-full">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!quotaInfo) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Overall Quota Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Overall Storage Status
              </CardTitle>
              <CardDescription>
                Total usage across all buckets
              </CardDescription>
            </div>
            <div className="text-right">
              {getStatusBadge(quotaInfo.usagePercent)}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Alerts */}
          {quotaInfo.isExceeded && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                Storage quota has been exceeded! Files cannot be uploaded until space
                is freed.
              </AlertDescription>
            </Alert>
          )}

          {quotaInfo.isNearLimit && !quotaInfo.isExceeded && (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                You are approaching the storage limit. Consider deleting old test files
                or upgrading your plan.
              </AlertDescription>
            </Alert>
          )}

          {!quotaInfo.isNearLimit && !quotaInfo.isExceeded && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Storage is healthy with plenty of space available.
              </AlertDescription>
            </Alert>
          )}

          {/* Main Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Used Space */}
            <div className="bg-slate-50 rounded-lg p-4 border">
              <p className="text-xs text-muted-foreground font-medium">
                USED SPACE
              </p>
              <p className={`text-2xl font-bold mt-2 ${getProgressPercentage(quotaInfo.usagePercent)}`}>
                {storageQuotaService.formatBytes(quotaInfo.totalSize)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {quotaInfo.totalFiles} files
              </p>
            </div>

            {/* Remaining Space */}
            <div className="bg-slate-50 rounded-lg p-4 border">
              <p className="text-xs text-muted-foreground font-medium">
                REMAINING
              </p>
              <p className="text-2xl font-bold text-green-600 mt-2">
                {storageQuotaService.formatBytes(quotaInfo.remainingSize)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                of {storageQuotaService.formatBytes(quotaInfo.limitSize)}
              </p>
            </div>

            {/* Usage Percentage */}
            <div className="bg-slate-50 rounded-lg p-4 border">
              <p className="text-xs text-muted-foreground font-medium">
                USAGE
              </p>
              <p className={`text-2xl font-bold mt-2 ${getProgressPercentage(quotaInfo.usagePercent)}`}>
                {Math.round(quotaInfo.usagePercent)}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">of total quota</p>
            </div>
          </div>

          {/* Progress Visualization */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium">Quota Usage</span>
              <span className="text-muted-foreground">
                {storageQuotaService.formatBytes(quotaInfo.totalSize)} /{" "}
                {storageQuotaService.formatBytes(quotaInfo.limitSize)}
              </span>
            </div>
            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full ${getProgressColor(quotaInfo.usagePercent)} transition-all`}
                style={{
                  width: `${Math.min(quotaInfo.usagePercent, 100)}%`,
                }}
              />
            </div>
          </div>

          {/* Refresh Button */}
          <Button
            onClick={loadQuotaInfo}
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh Metrics
          </Button>

          {/* Last Updated */}
          {lastUpdated && (
            <p className="text-xs text-muted-foreground text-center">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Per-Bucket Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Per-Bucket Breakdown</CardTitle>
          <CardDescription>
            Storage usage by individual bucket (50MB limit each)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {quotaInfo.buckets.map((bucket) => (
              <div
                key={bucket.name}
                className="border rounded-lg p-4 space-y-3 bg-slate-50"
              >
                {/* Bucket Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium text-sm">{bucket.name}</span>
                  </div>
                  {getStatusBadge(bucket.usagePercent)}
                </div>

                {/* Bucket Stats */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-white p-2 rounded border">
                    <p className="text-muted-foreground">Used</p>
                    <p className="font-medium">
                      {storageQuotaService.formatBytes(bucket.totalSize)}
                    </p>
                  </div>
                  <div className="bg-white p-2 rounded border">
                    <p className="text-muted-foreground">Files</p>
                    <p className="font-medium">{bucket.fileCount}</p>
                  </div>
                  <div className="bg-white p-2 rounded border">
                    <p className="text-muted-foreground">Usage</p>
                    <p className="font-medium">{Math.round(bucket.usagePercent)}%</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getProgressColor(bucket.usagePercent)} transition-all`}
                    style={{
                      width: `${Math.min(bucket.usagePercent, 100)}%`,
                    }}
                  />
                </div>

                {/* Capacity Info */}
                <p className="text-xs text-muted-foreground">
                  {storageQuotaService.formatBytes(bucket.totalSize)} of 50 MB limit
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
