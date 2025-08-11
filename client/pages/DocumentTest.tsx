import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, 
  FileText, 
  Download, 
  Trash2, 
  CheckCircle, 
  AlertTriangle,
  Users,
  Building2,
  Clock,
  ArrowLeft,
  Database,
  Copy
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { documentMetadataService, DocumentMetadata } from '@/lib/services/documentMetadataService';
import { simpleDocumentService, FileInfo } from '@/lib/services/simpleDocumentService';
import BucketSetupGuide from '@/components/BucketSetupGuide';

export default function DocumentTest() {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [bucket, setBucket] = useState<string>('charge-source-documents');
  const [organizationId, setOrganizationId] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<string>('uncategorized');
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [simpleFiles, setSimpleFiles] = useState<FileInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const bucketOptions = [
    { value: 'charge-source-user-files', label: '👤 User Files', description: 'Personal files (50MB max)' },
    { value: 'charge-source-documents', label: '📄 Documents', description: 'Official documents (100MB max)' },
    { value: 'charge-source-videos', label: '🎥 Videos', description: 'Training videos (500MB max)' }
  ];

  const categoryOptions = [
    { value: 'uncategorized', label: 'Uncategorized' },
    { value: 'manual', label: 'Manual' },
    { value: 'report', label: 'Report' },
    { value: 'specification', label: 'Specification' },
    { value: 'training', label: 'Training Material' },
    { value: 'contract', label: 'Contract' },
    { value: 'invoice', label: 'Invoice' }
  ];

  useEffect(() => {
    if (user) {
      loadDocuments();
      loadSimpleDocuments();
    }
  }, [user, bucket]);

  const loadSimpleDocuments = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { files, error } = await simpleDocumentService.listDocuments({
        bucket: bucket,
        organizationId: organizationId || undefined
      });

      if (error) {
        setError(`Failed to load files: ${error}`);
      } else {
        setSimpleFiles(files);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const loadDocuments = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await documentMetadataService.getDocumentsByUser(user.id, {
        bucket: bucket,
        organizationId: organizationId || undefined
      });

      if (error) {
        setError(`Failed to load documents: ${error.message}`);
      } else {
        setDocuments(data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile || !user) return;

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      // Use the simple document service (based on user's sample code)
      const uploadResult = await simpleDocumentService.uploadDocument(selectedFile, {
        bucket: bucket as any,
        organizationId: organizationId || undefined,
        upsert: true
      });

      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Upload failed');
      }

      // Try to create document metadata (optional - won't block upload)
      try {
        const metadata: Omit<DocumentMetadata, 'id' | 'created_at' | 'updated_at'> = {
          user_id: user.id,
          organization_id: organizationId || null,
          bucket_name: bucket,
          file_path: uploadResult.data!.path,
          original_filename: selectedFile.name,
          file_size: selectedFile.size,
          mime_type: selectedFile.type,
          category: category,
          description: description || undefined,
          status: 'draft'
        };

        await documentMetadataService.createDocumentMetadata(metadata);
      } catch (metadataError) {
        console.warn('File uploaded but metadata creation failed:', metadataError);
      }

      setSuccess(`Document uploaded successfully! File: ${selectedFile.name} to ${uploadResult.data!.path}`);

      // Reset form
      setSelectedFile(null);
      setDescription('');
      setCategory('uncategorized');

      // Reload documents
      await loadSimpleDocuments();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    try {
      const { error } = await documentMetadataService.deleteDocumentMetadata(documentId);
      
      if (error) {
        setError(`Failed to delete document: ${error.message}`);
      } else {
        setSuccess('Document deleted successfully');
        await loadDocuments();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete document');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <Alert>
          <AlertDescription>
            Please log in to test document storage functionality.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" asChild>
          <Link to="/enhanced-file-storage" className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to File Storage</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">ChargeSource Document Test</h1>
          <p className="text-muted-foreground">
            Test document upload and retrieval functionality
          </p>
        </div>
      </div>

      {error && (
        <>
          {error.includes('not found') || error.includes('create the storage buckets') ? (
            <BucketSetupGuide />
          ) : error.includes('document_metadata') || error.includes('schema cache') ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Database Setup Required</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    The document metadata tables don't exist yet. You need to create them in your Supabase database.
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  <h4 className="font-medium">Quick Setup:</h4>
                  <ol className="text-sm list-decimal list-inside space-y-1">
                    <li>Open your <Button variant="link" className="p-0 h-auto" asChild><a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer">Supabase Dashboard</a></Button></li>
                    <li>Go to <strong>SQL Editor</strong></li>
                    <li>Copy and paste the SQL script below</li>
                    <li>Click <strong>Run</strong> to execute it</li>
                    <li>Refresh this page</li>
                  </ol>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">SQL Setup Script:</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const sql = `-- ChargeSource Database Setup
CREATE TABLE IF NOT EXISTS document_metadata (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID DEFAULT NULL,
  bucket_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  category TEXT DEFAULT 'uncategorized',
  tags TEXT[] DEFAULT '{}',
  description TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'approved', 'rejected', 'archived')),
  version INTEGER DEFAULT 1,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_by UUID REFERENCES auth.users(id) DEFAULT NULL,
  approved_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  UNIQUE(bucket_name, file_path)
);

-- Enable RLS
ALTER TABLE document_metadata ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own documents" ON document_metadata
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own documents" ON document_metadata
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own documents" ON document_metadata
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own documents" ON document_metadata
  FOR DELETE USING (auth.uid() = user_id);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES
  ('charge-source-user-files', 'charge-source-user-files', false),
  ('charge-source-documents', 'charge-source-documents', false),
  ('charge-source-videos', 'charge-source-videos', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for charge-source-documents
CREATE POLICY "Users can view their own documents storage" ON storage.objects
FOR SELECT USING (bucket_id = 'charge-source-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can upload their own documents storage" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'charge-source-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update their own documents storage" ON storage.objects
FOR UPDATE USING (bucket_id = 'charge-source-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their own documents storage" ON storage.objects
FOR DELETE USING (bucket_id = 'charge-source-documents' AND auth.uid()::text = (storage.foldername(name))[1]);`;
                        navigator.clipboard.writeText(sql);
                        setSuccess('SQL script copied to clipboard!');
                      }}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy SQL
                    </Button>
                  </div>
                  <div className="bg-gray-100 p-3 rounded text-xs font-mono overflow-x-auto max-h-60 overflow-y-auto border">
                    <pre>{`-- ChargeSource Database Setup
CREATE TABLE IF NOT EXISTS document_metadata (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID DEFAULT NULL,
  bucket_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  category TEXT DEFAULT 'uncategorized',
  tags TEXT[] DEFAULT '{}',
  description TEXT,
  status TEXT DEFAULT 'draft',
  version INTEGER DEFAULT 1,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_by UUID REFERENCES auth.users(id) DEFAULT NULL,
  approved_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  UNIQUE(bucket_name, file_path)
);

-- Enable Row Level Security
ALTER TABLE document_metadata ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own documents" ON document_metadata
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own documents" ON document_metadata
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own documents" ON document_metadata
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own documents" ON document_metadata
  FOR DELETE USING (auth.uid() = user_id);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES
  ('charge-source-user-files', 'charge-source-user-files', false),
  ('charge-source-documents', 'charge-source-documents', false),
  ('charge-source-videos', 'charge-source-videos', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for charge-source-documents
CREATE POLICY "Users can view their own documents storage" ON storage.objects
FOR SELECT USING (bucket_id = 'charge-source-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can upload their own documents storage" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'charge-source-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update their own documents storage" ON storage.objects
FOR UPDATE USING (bucket_id = 'charge-source-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their own documents storage" ON storage.objects
FOR DELETE USING (bucket_id = 'charge-source-documents' AND auth.uid()::text = (storage.foldername(name))[1]);`}</pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </>
      )}

      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="upload" className="space-y-6">
        <TabsList>
          <TabsTrigger value="upload">📤 Upload Document</TabsTrigger>
          <TabsTrigger value="list">📋 My Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="h-5 w-5" />
                <span>Upload Document</span>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Test uploading documents to different buckets with metadata tracking
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="file">Select File</Label>
                  <Input
                    id="file"
                    type="file"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.zip,.mp4,.mov,.avi"
                  />
                  {selectedFile && (
                    <p className="text-sm text-muted-foreground">
                      Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bucket">Storage Bucket</Label>
                  <Select value={bucket} onValueChange={setBucket}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {bucketOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div>
                            <div>{option.label}</div>
                            <div className="text-xs text-muted-foreground">{option.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="organization">Organization ID (Optional)</Label>
                  <Input
                    id="organization"
                    placeholder="Leave empty for user files"
                    value={organizationId}
                    onChange={(e) => setOrganizationId(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Files will be organized by organization or user
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the document"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <Button 
                onClick={handleFileUpload} 
                disabled={!selectedFile || uploading}
                className="w-full"
              >
                {uploading ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Document
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>My Documents</span>
                  <Badge variant="outline">{simpleFiles.length} files</Badge>
                  {documents.length > 0 && (
                    <Badge variant="secondary">{documents.length} with metadata</Badge>
                  )}
                </div>
                <Button onClick={() => { loadDocuments(); loadSimpleDocuments(); }} variant="outline" size="sm" disabled={loading}>
                  {loading ? 'Loading...' : 'Refresh'}
                </Button>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Documents uploaded to the current bucket: {bucketOptions.find(b => b.value === bucket)?.label}
              </p>
            </CardHeader>
            <CardContent>
              {simpleFiles.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No documents found in this bucket</p>
                  <p className="text-sm">Upload a document to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground mb-4">
                    Showing files from {bucketOptions.find(b => b.value === bucket)?.label} bucket
                  </p>

                  {simpleFiles.map((file) => {
                    // Try to find corresponding metadata
                    const metadata = documents.find(doc =>
                      doc.original_filename === file.name || doc.file_path.endsWith(file.name)
                    );

                    return (
                      <div key={file.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <FileText className="h-4 w-4" />
                              <span className="font-medium">{file.name}</span>

                              {metadata ? (
                                <>
                                  <Badge variant="outline">{metadata.category}</Badge>
                                  <Badge variant={metadata.status === 'approved' ? 'default' : 'secondary'}>
                                    {metadata.status}
                                  </Badge>
                                  <Badge variant="default">
                                    <Database className="h-3 w-3 mr-1" />
                                    Metadata
                                  </Badge>
                                </>
                              ) : (
                                <Badge variant="outline">No metadata</Badge>
                              )}

                              {organizationId ? (
                                <Badge variant="outline">
                                  <Building2 className="h-3 w-3 mr-1" />
                                  Org
                                </Badge>
                              ) : (
                                <Badge variant="outline">
                                  <Users className="h-3 w-3 mr-1" />
                                  User
                                </Badge>
                              )}
                            </div>

                            {metadata?.description && (
                              <p className="text-sm text-muted-foreground mb-2">{metadata.description}</p>
                            )}

                            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                              <span>Updated: {formatDate(file.updated_at)}</span>
                              <span>Bucket: {file.bucket}</span>
                              <span>Path: {file.fullPath}</span>
                              {file.signedUrl && (
                                <a
                                  href={file.signedUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-500 hover:underline"
                                >
                                  Download
                                </a>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 ml-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={async () => {
                                const result = await simpleDocumentService.deleteDocument(file.name, {
                                  bucket: bucket,
                                  organizationId: organizationId || undefined
                                });
                                if (result.success) {
                                  setSuccess('File deleted successfully');
                                  await loadSimpleDocuments();
                                } else {
                                  setError(result.error || 'Failed to delete file');
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
