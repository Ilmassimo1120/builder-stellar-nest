import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, File, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';
import { fileStorageService, type FileUpload as FileUploadType, StoredFile, UploadProgress } from '@/lib/services/fileStorageService';

interface FileUploadProps {
  category?: 'general' | 'project' | 'quote' | 'product' | 'user' | 'public';
  metadata?: {
    projectId?: string;
    quoteId?: string;
    productId?: string;
    description?: string;
  };
  multiple?: boolean;
  maxFiles?: number;
  onUploadComplete?: (files: StoredFile[]) => void;
  onUploadError?: (error: string) => void;
  className?: string;
  accept?: string[];
}

interface UploadState {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  result?: StoredFile;
}

export default function FileUpload({
  category = 'general',
  metadata,
  multiple = false,
  maxFiles = 5,
  onUploadComplete,
  onUploadError,
  className,
  accept = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv'
  ]
}: FileUploadProps) {
  const [uploadStates, setUploadStates] = useState<UploadState[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!multiple && acceptedFiles.length > 1) {
        onUploadError?.('Only one file is allowed');
        return;
      }

      if (acceptedFiles.length > maxFiles) {
        onUploadError?.(`Maximum ${maxFiles} files allowed`);
        return;
      }

      // Initialize upload states
      const initialStates: UploadState[] = acceptedFiles.map(file => ({
        file,
        progress: 0,
        status: 'pending' as const
      }));

      setUploadStates(initialStates);
      setIsUploading(true);

      const uploadedFiles: StoredFile[] = [];
      
      try {
        for (let i = 0; i < acceptedFiles.length; i++) {
          const file = acceptedFiles[i];
          
          // Update status to uploading
          setUploadStates(prev => prev.map((state, index) => 
            index === i ? { ...state, status: 'uploading' as const } : state
          ));

          const fileUpload: FileUploadType = {
            file,
            category,
            metadata
          };

          try {
            const result = await fileStorageService.uploadFile(
              fileUpload,
              (progress: UploadProgress) => {
                setUploadStates(prev => prev.map((state, index) => 
                  index === i ? { ...state, progress: progress.percentage } : state
                ));
              }
            );

            // Update status to success
            setUploadStates(prev => prev.map((state, index) => 
              index === i ? { 
                ...state, 
                status: 'success' as const, 
                progress: 100,
                result 
              } : state
            ));

            uploadedFiles.push(result);

          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Upload failed';
            
            // Update status to error
            setUploadStates(prev => prev.map((state, index) => 
              index === i ? { 
                ...state, 
                status: 'error' as const, 
                error: errorMessage 
              } : state
            ));

            onUploadError?.(errorMessage);
          }
        }

        if (uploadedFiles.length > 0) {
          onUploadComplete?.(uploadedFiles);
        }

      } finally {
        setIsUploading(false);
      }
    },
    [category, metadata, multiple, maxFiles, onUploadComplete, onUploadError]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    multiple,
    maxFiles,
    disabled: isUploading
  });

  const removeFile = (index: number) => {
    setUploadStates(prev => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    setUploadStates([]);
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return '🖼️';
    } else if (file.type.includes('pdf')) {
      return '📄';
    } else if (file.type.includes('document') || file.type.includes('word')) {
      return '📝';
    } else if (file.type.includes('spreadsheet') || file.type.includes('excel')) {
      return '📊';
    }
    return '📁';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={cn('w-full space-y-4', className)}>
      {/* Drop Zone */}
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
              {multiple ? `Up to ${maxFiles} files` : 'Single file only'} • Max 50MB each
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Supported: Images, PDFs, Documents, Spreadsheets
            </p>
          </div>
        )}
      </div>

      {/* Upload Progress */}
      {uploadStates.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">
              {multiple ? 'Uploaded Files' : 'File Upload'}
            </h4>
            {uploadStates.length > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearAll}
                disabled={isUploading}
              >
                Clear All
              </Button>
            )}
          </div>

          {uploadStates.map((state, index) => (
            <div
              key={index}
              className="border rounded-lg p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <span className="text-2xl">{getFileIcon(state.file)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{state.file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(state.file.size)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Badge
                    variant={
                      state.status === 'success'
                        ? 'default'
                        : state.status === 'error'
                        ? 'destructive'
                        : 'secondary'
                    }
                  >
                    {state.status === 'pending' && 'Pending'}
                    {state.status === 'uploading' && 'Uploading'}
                    {state.status === 'success' && 'Complete'}
                    {state.status === 'error' && 'Failed'}
                  </Badge>

                  {state.status === 'success' && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}

                  {state.status === 'error' && (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}

                  {!isUploading && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              {state.status === 'uploading' && (
                <Progress value={state.progress} className="w-full" />
              )}

              {/* Error Message */}
              {state.status === 'error' && state.error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{state.error}</AlertDescription>
                </Alert>
              )}

              {/* Success Info */}
              {state.status === 'success' && state.result && (
                <div className="text-sm text-muted-foreground">
                  <p>✅ Uploaded successfully</p>
                  <p className="truncate">Path: {state.result.path}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
