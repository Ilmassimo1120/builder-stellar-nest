import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, X, File, AlertCircle, CheckCircle, Tag, 
  FolderOpen, Eye, Users, Lock, Globe 
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from './ui/select';
import { cn } from '@/lib/utils';
import { 
  enhancedFileStorageService, 
  BucketName, 
  FileAsset, 
  FileUploadRequest,
  AssetVisibility
} from '@/lib/services/enhancedFileStorageService';

interface EnhancedFileUploadProps {
  defaultBucket?: BucketName;
  parentVersionId?: string; // For creating new versions
  onUploadComplete?: (assets: FileAsset[]) => void;
  onUploadError?: (error: string) => void;
  className?: string;
}

interface UploadState {
  file: File;
  bucket: BucketName;
  metadata: {
    title: string;
    description: string;
    tags: string[];
    category: string;
    subcategory: string;
    visibility: AssetVisibility;
  };
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  result?: FileAsset;
}

const bucketInfo: Record<BucketName, { label: string; description: string; icon: string; maxSize: string }> = {
  'charge-source-user-files': {
    label: 'User Files',
    description: 'Personal files and general documents',
    icon: '👤',
    maxSize: '50MB'
  },
  'charge-source-documents': {
    label: 'Documents',
    description: 'Official documents, manuals, and reports',
    icon: '📄',
    maxSize: '100MB'
  },
  'charge-source-videos': {
    label: 'Videos',
    description: 'Training videos and media content',
    icon: '🎥',
    maxSize: '500MB'
  }
};

const categories = [
  'Manual', 'Training', 'Specification', 'Report', 'Installation Guide',
  'Maintenance', 'Safety', 'Compliance', 'Product Info', 'Case Study'
];

const visibilityOptions = [
  { value: 'private' as AssetVisibility, label: 'Private', icon: Lock, description: 'Only you can access' },
  { value: 'team' as AssetVisibility, label: 'Team', icon: Users, description: 'Team members can access' },
  { value: 'public' as AssetVisibility, label: 'Public', icon: Globe, description: 'Everyone can access' }
];

export default function EnhancedFileUpload({
  defaultBucket = 'charge-source-user-files',
  parentVersionId,
  onUploadComplete,
  onUploadError,
  className
}: EnhancedFileUploadProps) {
  const [uploadStates, setUploadStates] = useState<UploadState[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [currentTab, setCurrentTab] = useState<string>('upload');

  const [globalSettings, setGlobalSettings] = useState({
    bucket: defaultBucket,
    category: '',
    visibility: 'private' as AssetVisibility
  });

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      // Initialize upload states for dropped files
      const initialStates: UploadState[] = acceptedFiles.map(file => ({
        file,
        bucket: globalSettings.bucket,
        metadata: {
          title: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
          description: '',
          tags: [],
          category: globalSettings.category,
          subcategory: '',
          visibility: globalSettings.visibility
        },
        progress: 0,
        status: 'pending' as const
      }));

      setUploadStates(initialStates);
      setCurrentTab('metadata');
    },
    [globalSettings]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    disabled: isUploading
  });

  const updateFileMetadata = (index: number, field: string, value: any) => {
    setUploadStates(prev => prev.map((state, i) => {
      if (i === index) {
        return {
          ...state,
          metadata: {
            ...state.metadata,
            [field]: value
          }
        };
      }
      return state;
    }));
  };

  const updateGlobalSetting = (field: string, value: any) => {
    setGlobalSettings(prev => ({ ...prev, [field]: value }));
    
    // Apply to all pending files
    setUploadStates(prev => prev.map(state => {
      if (state.status === 'pending') {
        return {
          ...state,
          bucket: field === 'bucket' ? value : state.bucket,
          metadata: {
            ...state.metadata,
            [field]: field !== 'bucket' ? value : state.metadata[field]
          }
        };
      }
      return state;
    }));
  };

  const addTag = (index: number, tag: string) => {
    if (!tag.trim()) return;
    
    setUploadStates(prev => prev.map((state, i) => {
      if (i === index && !state.metadata.tags.includes(tag.trim())) {
        return {
          ...state,
          metadata: {
            ...state.metadata,
            tags: [...state.metadata.tags, tag.trim()]
          }
        };
      }
      return state;
    }));
  };

  const removeTag = (index: number, tagToRemove: string) => {
    setUploadStates(prev => prev.map((state, i) => {
      if (i === index) {
        return {
          ...state,
          metadata: {
            ...state.metadata,
            tags: state.metadata.tags.filter(tag => tag !== tagToRemove)
          }
        };
      }
      return state;
    }));
  };

  const removeFile = (index: number) => {
    setUploadStates(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    setIsUploading(true);
    const uploadedAssets: FileAsset[] = [];

    try {
      for (let i = 0; i < uploadStates.length; i++) {
        const state = uploadStates[i];
        
        // Update status to uploading
        setUploadStates(prev => prev.map((s, index) => 
          index === i ? { ...s, status: 'uploading' as const } : s
        ));

        try {
          const uploadRequest: FileUploadRequest = {
            file: state.file,
            bucket: state.bucket,
            metadata: {
              title: state.metadata.title,
              description: state.metadata.description,
              tags: state.metadata.tags,
              category: state.metadata.category,
              subcategory: state.metadata.subcategory,
              visibility: state.metadata.visibility
            },
            parentVersionId
          };

          const result = await enhancedFileStorageService.uploadFile(uploadRequest);

          // Update status to success
          setUploadStates(prev => prev.map((s, index) => 
            index === i ? { 
              ...s, 
              status: 'success' as const, 
              progress: 100,
              result 
            } : s
          ));

          uploadedAssets.push(result);

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Upload failed';
          
          // Update status to error
          setUploadStates(prev => prev.map((s, index) => 
            index === i ? { 
              ...s, 
              status: 'error' as const, 
              error: errorMessage 
            } : s
          ));

          onUploadError?.(errorMessage);
        }
      }

      if (uploadedAssets.length > 0) {
        onUploadComplete?.(uploadedAssets);
      }

    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return '🖼️';
    if (file.type.startsWith('video/')) return '🎥';
    if (file.type.includes('pdf')) return '📄';
    if (file.type.includes('document') || file.type.includes('word')) return '📝';
    if (file.type.includes('spreadsheet') || file.type.includes('excel')) return '📊';
    return '📁';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const canUpload = uploadStates.length > 0 && 
    uploadStates.every(state => state.metadata.title.trim() !== '') &&
    !isUploading;

  return (
    <div className={cn('w-full space-y-6', className)}>
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">Upload Files</TabsTrigger>
          <TabsTrigger value="metadata" disabled={uploadStates.length === 0}>
            Metadata ({uploadStates.length})
          </TabsTrigger>
          <TabsTrigger value="review" disabled={uploadStates.length === 0}>
            Review & Upload
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          {/* Global Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Upload Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Storage Bucket</Label>
                  <Select 
                    value={globalSettings.bucket} 
                    onValueChange={(value: BucketName) => updateGlobalSetting('bucket', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(bucketInfo).map(([bucket, info]) => (
                        <SelectItem key={bucket} value={bucket}>
                          <div className="flex items-center space-x-2">
                            <span>{info.icon}</span>
                            <div>
                              <div className="font-medium">{info.label}</div>
                              <div className="text-xs text-muted-foreground">
                                Max {info.maxSize}
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Default Category</Label>
                  <Select 
                    value={globalSettings.category} 
                    onValueChange={(value) => updateGlobalSetting('category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Default Visibility</Label>
                  <Select 
                    value={globalSettings.visibility} 
                    onValueChange={(value: AssetVisibility) => updateGlobalSetting('visibility', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {visibilityOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center space-x-2">
                            <option.icon className="h-4 w-4" />
                            <div>
                              <div className="font-medium">{option.label}</div>
                              <div className="text-xs text-muted-foreground">
                                {option.description}
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Drop Zone */}
          <Card>
            <CardContent className="pt-6">
              <div
                {...getRootProps()}
                className={cn(
                  'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
                  isDragActive 
                    ? 'border-primary bg-primary/5' 
                    : 'border-muted-foreground/25 hover:border-primary/50',
                  isUploading && 'cursor-not-allowed opacity-50'
                )}
              >
                <input {...getInputProps()} />
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                {isDragActive ? (
                  <p className="text-lg font-medium">Drop the files here...</p>
                ) : (
                  <div>
                    <p className="text-lg font-medium mb-2">
                      Drag & drop files here, or click to select
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Multiple files supported • {bucketInfo[globalSettings.bucket].maxSize} max per file
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {bucketInfo[globalSettings.bucket].description}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metadata" className="space-y-4">
          {uploadStates.map((state, index) => (
            <Card key={index}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getFileIcon(state.file)}</span>
                    <div>
                      <CardTitle className="text-base">{state.file.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(state.file.size)} • {bucketInfo[state.bucket].label}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Title *</Label>
                    <Input
                      value={state.metadata.title}
                      onChange={(e) => updateFileMetadata(index, 'title', e.target.value)}
                      placeholder="Enter file title"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select 
                      value={state.metadata.category} 
                      onValueChange={(value) => updateFileMetadata(index, 'category', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={state.metadata.description}
                    onChange={(e) => updateFileMetadata(index, 'description', e.target.value)}
                    placeholder="Enter file description"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {state.metadata.tags.map(tag => (
                      <Badge 
                        key={tag} 
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => removeTag(index, tag)}
                      >
                        {tag} <X className="h-3 w-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Add tag and press Enter"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const input = e.target as HTMLInputElement;
                          addTag(index, input.value);
                          input.value = '';
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Visibility</Label>
                  <Select 
                    value={state.metadata.visibility} 
                    onValueChange={(value: AssetVisibility) => updateFileMetadata(index, 'visibility', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {visibilityOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center space-x-2">
                            <option.icon className="h-4 w-4" />
                            <span>{option.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="review" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Review Files Before Upload</CardTitle>
              <p className="text-sm text-muted-foreground">
                Review your files and metadata before uploading. All files will be saved as drafts requiring approval.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {uploadStates.map((state, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{getFileIcon(state.file)}</span>
                      <div>
                        <p className="font-medium">{state.metadata.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {state.file.name} • {formatFileSize(state.file.size)}
                        </p>
                      </div>
                    </div>

                    <Badge
                      variant={
                        state.status === 'success'
                          ? 'default'
                          : state.status === 'error'
                          ? 'destructive'
                          : 'secondary'
                      }
                    >
                      {state.status === 'pending' && 'Ready'}
                      {state.status === 'uploading' && 'Uploading'}
                      {state.status === 'success' && 'Complete'}
                      {state.status === 'error' && 'Failed'}
                    </Badge>
                  </div>

                  {state.metadata.description && (
                    <p className="text-sm text-muted-foreground">
                      {state.metadata.description}
                    </p>
                  )}

                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <span>📂 {bucketInfo[state.bucket].label}</span>
                    {state.metadata.category && <span>🏷️ {state.metadata.category}</span>}
                    <span>👁️ {state.metadata.visibility}</span>
                  </div>

                  {state.metadata.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {state.metadata.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {state.status === 'uploading' && (
                    <Progress value={state.progress} className="w-full" />
                  )}

                  {state.status === 'error' && state.error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{state.error}</AlertDescription>
                    </Alert>
                  )}
                </div>
              ))}

              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentTab('metadata')}
                  disabled={isUploading}
                >
                  Back to Metadata
                </Button>
                <Button
                  onClick={uploadFiles}
                  disabled={!canUpload}
                >
                  {isUploading ? 'Uploading...' : `Upload ${uploadStates.length} File${uploadStates.length !== 1 ? 's' : ''}`}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
