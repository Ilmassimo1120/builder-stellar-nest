import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ExternalLink, Copy, CheckCircle } from 'lucide-react';

export default function BucketSetupGuide() {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const sqlScript = `-- Create ChargeSource storage buckets
-- Run this in your Supabase SQL Editor

-- Create the buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('charge-source-user-files', 'charge-source-user-files', false),
  ('charge-source-documents', 'charge-source-documents', false),
  ('charge-source-videos', 'charge-source-videos', false)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for charge-source-user-files
CREATE POLICY "Users can view their own files" ON storage.objects
FOR SELECT USING (bucket_id = 'charge-source-user-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own files" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'charge-source-user-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own files" ON storage.objects
FOR UPDATE USING (bucket_id = 'charge-source-user-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own files" ON storage.objects
FOR DELETE USING (bucket_id = 'charge-source-user-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Set up RLS policies for charge-source-documents
CREATE POLICY "Users can view their own documents" ON storage.objects
FOR SELECT USING (bucket_id = 'charge-source-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own documents" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'charge-source-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own documents" ON storage.objects
FOR UPDATE USING (bucket_id = 'charge-source-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own documents" ON storage.objects
FOR DELETE USING (bucket_id = 'charge-source-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Set up RLS policies for charge-source-videos
CREATE POLICY "Users can view their own videos" ON storage.objects
FOR SELECT USING (bucket_id = 'charge-source-videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own videos" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'charge-source-videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own videos" ON storage.objects
FOR UPDATE USING (bucket_id = 'charge-source-videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own videos" ON storage.objects
FOR DELETE USING (bucket_id = 'charge-source-videos' AND auth.uid()::text = (storage.foldername(name))[1]);`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-red-600">
          <AlertTriangle className="h-5 w-5" />
          <span>Storage Buckets Required</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            The required storage buckets don't exist yet. You need to create them in your Supabase dashboard before you can upload files.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Required Buckets:</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 border rounded">
                <span className="font-mono text-sm">charge-source-user-files</span>
                <Badge variant="outline">50MB max</Badge>
              </div>
              <div className="flex items-center justify-between p-2 border rounded">
                <span className="font-mono text-sm">charge-source-documents</span>
                <Badge variant="outline">100MB max</Badge>
              </div>
              <div className="flex items-center justify-between p-2 border rounded">
                <span className="font-mono text-sm">charge-source-videos</span>
                <Badge variant="outline">500MB max</Badge>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Setup Instructions:</h4>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-start space-x-2">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                <div>
                  <p className="font-medium">Open your Supabase Dashboard</p>
                  <Button variant="outline" size="sm" className="mt-1" asChild>
                    <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Open Dashboard
                    </a>
                  </Button>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                <div>
                  <p className="font-medium">Go to SQL Editor</p>
                  <p className="text-muted-foreground">Navigate to: Project → SQL Editor</p>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                <div className="flex-1">
                  <p className="font-medium mb-2">Run this SQL script:</p>
                  <div className="relative">
                    <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto max-h-40 overflow-y-auto border">
                      <code>{sqlScript}</code>
                    </pre>
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(sqlScript)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <span className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
                <div>
                  <p className="font-medium">Verify buckets created</p>
                  <p className="text-muted-foreground">Go to Storage → check the 3 buckets exist</p>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <span className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">5</span>
                <div>
                  <p className="font-medium">Refresh this page and test upload</p>
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="mt-1"
                    onClick={() => window.location.reload()}
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Refresh Page
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Note:</strong> This is a one-time setup. Once the buckets are created, 
            file uploads will work automatically for all users.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
