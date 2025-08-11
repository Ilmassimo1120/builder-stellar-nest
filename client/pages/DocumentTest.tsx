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
  ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { documentMetadataService, DocumentMetadata } from '@/lib/services/documentMetadataService';

export default function DocumentTest() {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [bucket, setBucket] = useState<string>('charge-source-documents');
  const [organizationId, setOrganizationId] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<string>('uncategorized');
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
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
    }
  }, [user, bucket]);

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
      // Create form data for Edge Function
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('bucket', bucket);
      if (organizationId) {
        formData.append('organizationId', organizationId);
      }

      // Get auth token
      const { data: { session } } = await import('@/lib/supabase').then(m => m.supabase.auth.getSession());
      
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      // Upload file via Edge Function
      const uploadResponse = await fetch('/api/functions/secure-file-upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: formData
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.text();
        throw new Error(`Upload failed: ${errorData}`);
      }

      const uploadResult = await uploadResponse.json();

      // Create document metadata
      const metadata: Omit<DocumentMetadata, 'id' | 'created_at' | 'updated_at'> = {
        user_id: user.id,
        organization_id: organizationId || null,
        bucket_name: bucket,
        file_path: uploadResult.path,
        original_filename: selectedFile.name,
        file_size: selectedFile.size,
        mime_type: selectedFile.type,
        category: category,
        description: description || undefined,
        status: 'draft'
      };

      const { error: metadataError } = await documentMetadataService.createDocumentMetadata(metadata);

      if (metadataError) {
        console.warn('File uploaded but metadata creation failed:', metadataError);
        setSuccess(`File uploaded successfully to ${uploadResult.path}, but metadata creation failed. File is still accessible.`);
      } else {
        setSuccess(`Document uploaded successfully! File: ${selectedFile.name}`);
      }

      // Reset form
      setSelectedFile(null);
      setDescription('');
      setCategory('uncategorized');
      
      // Reload documents
      await loadDocuments();

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
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
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
                  <Badge variant="outline">{documents.length}</Badge>
                </div>
                <Button onClick={loadDocuments} variant="outline" size="sm" disabled={loading}>
                  {loading ? 'Loading...' : 'Refresh'}
                </Button>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Documents uploaded to the current bucket: {bucketOptions.find(b => b.value === bucket)?.label}
              </p>
            </CardHeader>
            <CardContent>
              {documents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No documents found in this bucket</p>
                  <p className="text-sm">Upload a document to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div key={doc.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <FileText className="h-4 w-4" />
                            <span className="font-medium">{doc.original_filename}</span>
                            <Badge variant="outline">{doc.category}</Badge>
                            <Badge variant={doc.status === 'approved' ? 'default' : 'secondary'}>
                              {doc.status}
                            </Badge>
                            {doc.organization_id ? (
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
                          
                          {doc.description && (
                            <p className="text-sm text-muted-foreground mb-2">{doc.description}</p>
                          )}
                          
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <span>Size: {formatFileSize(doc.file_size)}</span>
                            <span>Type: {doc.mime_type}</span>
                            <span>Uploaded: {formatDate(doc.created_at!)}</span>
                            <span>Path: {doc.file_path}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteDocument(doc.id!)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
