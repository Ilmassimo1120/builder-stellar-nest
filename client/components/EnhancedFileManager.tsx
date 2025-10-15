import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Grid,
  List,
  MoreVertical,
  Download,
  Eye,
  Edit,
  Trash2,
  Share,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Tag,
  User,
  Calendar,
  FileText,
  Video,
  Image,
  File,
  GitBranch,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Archive,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "./ui/dialog";
import { Alert, AlertDescription } from "./ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Separator } from "./ui/separator";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { cn } from "@/lib/utils";
import {
  enhancedFileStorageService,
  FileAsset,
  SearchFilters,
  BucketName,
  AssetStatus,
  AssetVisibility,
  ChangelogEntry,
} from "@/lib/services/enhancedFileStorageService";
import { useAuth } from "@/hooks/useAuth";
import EnhancedFileUpload from "./EnhancedFileUpload";

interface EnhancedFileManagerProps {
  defaultBucket?: BucketName;
  showApprovalWorkflow?: boolean;
  allowVersionControl?: boolean;
  className?: string;
}

type ViewMode = "grid" | "list";
type SortBy = "name" | "size" | "date" | "status" | "version";

const statusColors: Record<AssetStatus, string> = {
  draft: "bg-gray-100 text-gray-800",
  pending_approval: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  archived: "bg-blue-100 text-blue-800",
};

const visibilityIcons: Record<AssetVisibility, React.ComponentType<any>> = {
  private: User,
  team: User,
  public: Eye,
};

export default function EnhancedFileManager({
  defaultBucket,
  showApprovalWorkflow = true,
  allowVersionControl = true,
  className,
}: EnhancedFileManagerProps) {
  const { user, isAdmin, isGlobalAdmin, isSales } = useAuth();
  const [assets, setAssets] = useState<FileAsset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<FileAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortBy>("date");

  const [filters, setFilters] = useState<SearchFilters>({
    bucket: defaultBucket,
    searchQuery: "",
  });

  const [selectedAsset, setSelectedAsset] = useState<FileAsset | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showChangelog, setShowChangelog] = useState(false);
  const [approvalAction, setApprovalAction] = useState<"approve" | "reject">(
    "approve",
  );
  const [rejectionReason, setRejectionReason] = useState("");
  const [versionHistory, setVersionHistory] = useState<FileAsset[]>([]);
  const [changelog, setChangelog] = useState<ChangelogEntry[]>([]);

  const canApprove = isAdmin || isGlobalAdmin || isSales;

  useEffect(() => {
    loadAssets();
  }, [filters]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [assets, filters, sortBy]);

  const loadAssets = async () => {
    try {
      setLoading(true);
      setError(null);
      const searchResults =
        await enhancedFileStorageService.searchFiles(filters);
      setAssets(searchResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load assets");
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...assets];

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return (a.title || a.fileName).localeCompare(b.title || b.fileName);
        case "size":
          return b.fileSize - a.fileSize;
        case "date":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "status":
          return a.status.localeCompare(b.status);
        case "version":
          return b.versionNumber - a.versionNumber;
        default:
          return 0;
      }
    });

    setFilteredAssets(filtered);
  };

  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleApproval = async () => {
    if (!selectedAsset) return;

    try {
      await enhancedFileStorageService.approveAsset(
        selectedAsset.id,
        approvalAction === "approve",
        rejectionReason,
      );

      await loadAssets();
      setShowApprovalDialog(false);
      setRejectionReason("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Approval failed");
    }
  };

  const handleDownload = async (asset: FileAsset) => {
    try {
      const blob = await enhancedFileStorageService.downloadFile(asset.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = asset.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Download failed");
    }
  };

  const handleView = async (asset: FileAsset) => {
    try {
      const signedUrl = await enhancedFileStorageService.getSignedUrl(asset.id);
      window.open(signedUrl, "_blank");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Preview failed");
    }
  };

  const handleCreateNewVersion = (asset: FileAsset) => {
    setSelectedAsset(asset);
    setShowUpload(true);
  };

  const loadVersionHistory = async (asset: FileAsset) => {
    try {
      const history = await enhancedFileStorageService.getVersionHistory(
        asset.id,
      );
      setVersionHistory(history);
      setSelectedAsset(asset);
      setShowVersionHistory(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load version history",
      );
    }
  };

  const loadChangelog = async (asset: FileAsset) => {
    try {
      const changes = await enhancedFileStorageService.getAssetChangelog(
        asset.id,
      );
      setChangelog(changes);
      setSelectedAsset(asset);
      setShowChangelog(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load changelog");
    }
  };

  const getFileIcon = (asset: FileAsset) => {
    if (asset.mimeType.startsWith("image/")) return Image;
    if (asset.mimeType.startsWith("video/")) return Video;
    if (asset.mimeType.includes("pdf")) return FileText;
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="files" className="w-full">
        <TabsList>
          <TabsTrigger value="files">File Library</TabsTrigger>
          <TabsTrigger value="upload">Upload Files</TabsTrigger>
          {showApprovalWorkflow && canApprove && (
            <TabsTrigger value="pending">
              Pending Approval (
              {assets.filter((a) => a.status === "pending_approval").length})
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle>Upload New Files</CardTitle>
            </CardHeader>
            <CardContent>
              <EnhancedFileUpload
                defaultBucket={defaultBucket}
                parentVersionId={selectedAsset?.id}
                onUploadComplete={() => {
                  loadAssets();
                  setSelectedAsset(null);
                }}
                onUploadError={setError}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="files" className="space-y-4">
          {/* Search and Filter Controls */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search files..."
                    value={filters.searchQuery || ""}
                    onChange={(e) =>
                      updateFilters({ searchQuery: e.target.value })
                    }
                    className="pl-10"
                  />
                </div>

                <Select
                  value={filters.bucket || "all"}
                  onValueChange={(value) =>
                    updateFilters({
                      bucket:
                        value === "all" ? undefined : (value as BucketName),
                    })
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Buckets</SelectItem>
                    <SelectItem value="charge-source-user-files">
                      👤 User Files
                    </SelectItem>
                    <SelectItem value="charge-source-documents">
                      📄 Documents
                    </SelectItem>
                    <SelectItem value="charge-source-videos">
                      🎥 Videos
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.status || "all"}
                  onValueChange={(value) =>
                    updateFilters({
                      status:
                        value === "all" ? undefined : (value as AssetStatus),
                    })
                  }
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending_approval">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={sortBy}
                  onValueChange={(value) => setSortBy(value as SortBy)}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="size">Size</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                    <SelectItem value="version">Version</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex border rounded-md">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    aria-label="Grid view"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* File Grid/List */}
          <Card>
            <CardContent className="p-6">
              {filteredAssets.length === 0 ? (
                <div className="text-center py-16">
                  <File className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No files found</h3>
                  <p className="text-muted-foreground">
                    {assets.length === 0
                      ? "Upload some files to get started"
                      : "Try adjusting your search or filters"}
                  </p>
                </div>
              ) : viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredAssets.map((asset) => {
                    const FileIcon = getFileIcon(asset);
                    const VisibilityIcon = visibilityIcons[asset.visibility];

                    return (
                      <div
                        key={asset.id}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <FileIcon className="h-8 w-8 text-muted-foreground" />
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem
                                onClick={() => handleView(asset)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDownload(asset)}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </DropdownMenuItem>
                              {allowVersionControl && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleCreateNewVersion(asset)
                                    }
                                  >
                                    <GitBranch className="h-4 w-4 mr-2" />
                                    New Version
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => loadVersionHistory(asset)}
                                  >
                                    <Clock className="h-4 w-4 mr-2" />
                                    Version History
                                  </DropdownMenuItem>
                                </>
                              )}
                              <DropdownMenuItem
                                onClick={() => loadChangelog(asset)}
                              >
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Changelog
                              </DropdownMenuItem>
                              {showApprovalWorkflow &&
                                canApprove &&
                                asset.status === "pending_approval" && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setSelectedAsset(asset);
                                        setApprovalAction("approve");
                                        setShowApprovalDialog(true);
                                      }}
                                    >
                                      <ThumbsUp className="h-4 w-4 mr-2" />
                                      Approve
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setSelectedAsset(asset);
                                        setApprovalAction("reject");
                                        setShowApprovalDialog(true);
                                      }}
                                    >
                                      <ThumbsDown className="h-4 w-4 mr-2" />
                                      Reject
                                    </DropdownMenuItem>
                                  </>
                                )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <h4
                          className="font-medium text-sm mb-2 truncate"
                          title={asset.title || asset.fileName}
                        >
                          {asset.title || asset.fileName}
                        </h4>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <Badge
                              className={cn(
                                "text-xs",
                                statusColors[asset.status],
                              )}
                            >
                              {asset.status.replace("_", " ")}
                            </Badge>
                            <span className="text-muted-foreground">
                              v{asset.versionNumber}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{formatFileSize(asset.fileSize)}</span>
                            <VisibilityIcon className="h-3 w-3" />
                          </div>

                          {asset.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {asset.tags.slice(0, 2).map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {tag}
                                </Badge>
                              ))}
                              {asset.tags.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{asset.tags.length - 2}
                                </Badge>
                              )}
                            </div>
                          )}

                          <p className="text-xs text-muted-foreground">
                            {formatDate(asset.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredAssets.map((asset) => {
                    const FileIcon = getFileIcon(asset);
                    const VisibilityIcon = visibilityIcons[asset.visibility];

                    return (
                      <div
                        key={asset.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                      >
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <FileIcon className="h-6 w-6 text-muted-foreground" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">
                              {asset.title || asset.fileName}
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <span>{formatFileSize(asset.fileSize)}</span>
                              <span>{formatDate(asset.createdAt)}</span>
                              <Badge
                                className={cn(
                                  "text-xs",
                                  statusColors[asset.status],
                                )}
                              >
                                {asset.status.replace("_", " ")}
                              </Badge>
                              <span>v{asset.versionNumber}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <VisibilityIcon className="h-4 w-4 text-muted-foreground" />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleView(asset)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload(asset)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              {allowVersionControl && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleCreateNewVersion(asset)
                                    }
                                  >
                                    <GitBranch className="h-4 w-4 mr-2" />
                                    New Version
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => loadVersionHistory(asset)}
                                  >
                                    <Clock className="h-4 w-4 mr-2" />
                                    Version History
                                  </DropdownMenuItem>
                                </>
                              )}
                              <DropdownMenuItem
                                onClick={() => loadChangelog(asset)}
                              >
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Changelog
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pending Approval Tab */}
        {showApprovalWorkflow && canApprove && (
          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Pending Approval</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Files waiting for your approval
                </p>
              </CardHeader>
              <CardContent>
                {assets
                  .filter((a) => a.status === "pending_approval")
                  .map((asset) => (
                    <div key={asset.id} className="border rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">
                          {asset.title || asset.fileName}
                        </h4>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedAsset(asset);
                              setApprovalAction("approve");
                              setShowApprovalDialog(true);
                            }}
                          >
                            <ThumbsUp className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedAsset(asset);
                              setApprovalAction("reject");
                              setShowApprovalDialog(true);
                            }}
                          >
                            <ThumbsDown className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {asset.description}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span>{formatFileSize(asset.fileSize)}</span>
                        <span>{formatDate(asset.createdAt)}</span>
                        <span>
                          📂 {asset.bucketName.replace("charge-source-", "")}
                        </span>
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {approvalAction === "approve" ? "Approve File" : "Reject File"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              Are you sure you want to {approvalAction} "
              {selectedAsset?.title || selectedAsset?.fileName}"?
            </p>
            {approvalAction === "reject" && (
              <div className="space-y-2">
                <Label>Rejection Reason</Label>
                <Textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Please provide a reason for rejection..."
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowApprovalDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleApproval}>
              {approvalAction === "approve" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Version History Dialog */}
      <Dialog open={showVersionHistory} onOpenChange={setShowVersionHistory}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Version History</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {versionHistory.map((version, index) => (
              <div key={version.id} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={
                        version.isCurrentVersion ? "default" : "secondary"
                      }
                    >
                      v{version.versionNumber}
                      {version.isCurrentVersion && " (Current)"}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(version.createdAt)}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownload(version)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
                <p className="text-sm">{version.fileName}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(version.fileSize)}
                </p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Changelog Dialog */}
      <Dialog open={showChangelog} onOpenChange={setShowChangelog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Change History</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {changelog.map((entry) => (
              <div key={entry.id} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline">{entry.action}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(entry.createdAt)}
                  </span>
                </div>
                {entry.notes && <p className="text-sm mb-2">{entry.notes}</p>}
                {entry.changes && Object.keys(entry.changes).length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify(entry.changes, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
