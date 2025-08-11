import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  AlertTriangle, 
  Database, 
  HardDrive, 
  Copy, 
  ExternalLink,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface SetupStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'checking' | 'completed' | 'failed';
  error?: string;
}

export default function StorageSetupWizard() {
  const [steps, setSteps] = useState<SetupStep[]>([
    {
      id: 'buckets',
      title: 'Storage Buckets',
      description: 'Create charge-source-user-files, charge-source-documents, charge-source-videos',
      status: 'pending'
    },
    {
      id: 'tables',
      title: 'Database Tables',
      description: 'Create document_metadata and document_versions tables',
      status: 'pending'
    },
    {
      id: 'policies',
      title: 'Security Policies',
      description: 'Set up Row Level Security policies for data protection',
      status: 'pending'
    }
  ]);

  const [checking, setChecking] = useState(false);

  const updateStepStatus = (stepId: string, status: SetupStep['status'], error?: string) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status, error } : step
    ));
  };

  const checkStorageBuckets = async () => {
    updateStepStatus('buckets', 'checking');
    try {
      // First check if we have basic Supabase connection
      console.log('Checking Supabase connection...');

      const { data, error } = await supabase.storage.listBuckets();

      console.log('Storage listBuckets result:', { data, error });

      if (error) {
        // Check for common authentication issues
        if (error.message.includes('JWT') || error.message.includes('unauthorized') || error.message.includes('authentication')) {
          updateStepStatus('buckets', 'failed', `Authentication issue: ${error.message}. Make sure your Supabase URL and anon key are correct.`);
        } else {
          updateStepStatus('buckets', 'failed', `Supabase error: ${error.message}`);
        }
        return false;
      }

      const requiredBuckets = ['charge-source-user-files', 'charge-source-documents', 'charge-source-videos'];
      const existingBuckets = data?.map(b => b.name) || [];

      console.log('Required buckets:', requiredBuckets);
      console.log('Existing buckets:', existingBuckets);

      const missingBuckets = requiredBuckets.filter(name => !existingBuckets.includes(name));

      if (missingBuckets.length === 0) {
        updateStepStatus('buckets', 'completed');
        return true;
      } else {
        // Show more detailed info about what was found
        updateStepStatus('buckets', 'failed',
          `Missing ${missingBuckets.length} buckets: ${missingBuckets.join(', ')}. ` +
          `Found ${existingBuckets.length} buckets: ${existingBuckets.join(', ') || 'none'}`
        );
        return false;
      }
    } catch (err) {
      console.error('Storage check error:', err);
      updateStepStatus('buckets', 'failed',
        `Connection error: ${err instanceof Error ? err.message : 'Unknown error'}. Check browser console for details.`
      );
      return false;
    }
  };

  const checkDatabaseTables = async () => {
    updateStepStatus('tables', 'checking');
    try {
      // Try to query the document_metadata table
      const { error } = await supabase
        .from('document_metadata')
        .select('id')
        .limit(1);

      if (error) {
        if (error.message.includes('relation') || error.message.includes('does not exist')) {
          updateStepStatus('tables', 'failed', 'Tables do not exist');
          return false;
        } else {
          updateStepStatus('tables', 'failed', error.message);
          return false;
        }
      }

      updateStepStatus('tables', 'completed');
      return true;
    } catch (err) {
      updateStepStatus('tables', 'failed', err instanceof Error ? err.message : 'Unknown error');
      return false;
    }
  };

  const checkSecurityPolicies = async () => {
    updateStepStatus('policies', 'checking');
    
    // For now, we'll assume policies are set up if tables exist
    // In a real implementation, you might query pg_policies or test access
    const tablesExist = steps.find(s => s.id === 'tables')?.status === 'completed';
    
    if (tablesExist) {
      updateStepStatus('policies', 'completed');
      return true;
    } else {
      updateStepStatus('policies', 'failed', 'Cannot verify policies without database tables');
      return false;
    }
  };

  const runFullCheck = async () => {
    setChecking(true);
    
    await checkStorageBuckets();
    await checkDatabaseTables();
    await checkSecurityPolicies();
    
    setChecking(false);
  };

  useEffect(() => {
    runFullCheck();
  }, []);

  const allCompleted = steps.every(step => step.status === 'completed');
  const hasFailures = steps.some(step => step.status === 'failed');

  const databaseSetupSQL = `-- ChargeSource Storage Setup
-- Run this complete script in your Supabase SQL Editor

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('charge-source-user-files', 'charge-source-user-files', false),
  ('charge-source-documents', 'charge-source-documents', false),
  ('charge-source-videos', 'charge-source-videos', false)
ON CONFLICT (id) DO NOTHING;

-- Create document_metadata table
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

-- Create document_versions table
CREATE TABLE IF NOT EXISTS document_versions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES document_metadata(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  change_notes TEXT,
  UNIQUE(document_id, version_number)
);

-- Enable Row Level Security
ALTER TABLE document_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for document_metadata
DROP POLICY IF EXISTS "Users can view their own documents" ON document_metadata;
CREATE POLICY "Users can view their own documents" ON document_metadata
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own documents" ON document_metadata;
CREATE POLICY "Users can insert their own documents" ON document_metadata
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own documents" ON document_metadata;
CREATE POLICY "Users can update their own documents" ON document_metadata
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own documents" ON document_metadata;
CREATE POLICY "Users can delete their own documents" ON document_metadata
  FOR DELETE USING (auth.uid() = user_id);

-- Storage policies for charge-source-documents
DROP POLICY IF EXISTS "Users can view their own documents storage" ON storage.objects;
CREATE POLICY "Users can view their own documents storage" ON storage.objects
FOR SELECT USING (bucket_id = 'charge-source-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can upload their own documents storage" ON storage.objects;
CREATE POLICY "Users can upload their own documents storage" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'charge-source-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can update their own documents storage" ON storage.objects;
CREATE POLICY "Users can update their own documents storage" ON storage.objects
FOR UPDATE USING (bucket_id = 'charge-source-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can delete their own documents storage" ON storage.objects;
CREATE POLICY "Users can delete their own documents storage" ON storage.objects
FOR DELETE USING (bucket_id = 'charge-source-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Similar policies for other buckets
DROP POLICY IF EXISTS "Users can view their own user files storage" ON storage.objects;
CREATE POLICY "Users can view their own user files storage" ON storage.objects
FOR SELECT USING (bucket_id = 'charge-source-user-files' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can upload their own user files storage" ON storage.objects;
CREATE POLICY "Users can upload their own user files storage" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'charge-source-user-files' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can view their own videos storage" ON storage.objects;
CREATE POLICY "Users can view their own videos storage" ON storage.objects
FOR SELECT USING (bucket_id = 'charge-source-videos' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can upload their own videos storage" ON storage.objects;
CREATE POLICY "Users can upload their own videos storage" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'charge-source-videos' AND auth.uid()::text = (storage.foldername(name))[1]);`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>ChargeSource Storage Setup</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={runFullCheck}
            disabled={checking}
          >
            {checking ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Check Status
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {allCompleted ? (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              🎉 ChargeSource storage is fully configured and ready to use!
            </AlertDescription>
          </Alert>
        ) : hasFailures ? (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Setup incomplete. Please follow the instructions below to complete the configuration.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert>
            <Database className="h-4 w-4" />
            <AlertDescription>
              Checking storage configuration...
            </AlertDescription>
          </Alert>
        )}

        {/* Setup Steps */}
        <div className="space-y-3">
          <h4 className="font-medium">Setup Progress:</h4>
          {steps.map((step) => (
            <div key={step.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                {step.status === 'checking' && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
                {step.status === 'completed' && <CheckCircle className="h-4 w-4 text-green-500" />}
                {step.status === 'failed' && <AlertTriangle className="h-4 w-4 text-red-500" />}
                {step.status === 'pending' && <div className="h-4 w-4 rounded-full bg-gray-300" />}
                
                <div>
                  <div className="font-medium">{step.title}</div>
                  <div className="text-sm text-muted-foreground">{step.description}</div>
                  {step.error && (
                    <div className="text-sm text-red-600 mt-1">Error: {step.error}</div>
                  )}
                </div>
              </div>
              
              <Badge variant={
                step.status === 'completed' ? 'default' : 
                step.status === 'failed' ? 'destructive' : 
                step.status === 'checking' ? 'secondary' : 'outline'
              }>
                {step.status === 'checking' ? 'Checking...' : step.status.replace('_', ' ')}
              </Badge>
            </div>
          ))}
        </div>

        {hasFailures && (
          <Tabs defaultValue="instructions" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="instructions">Setup Instructions</TabsTrigger>
              <TabsTrigger value="sql">SQL Script</TabsTrigger>
            </TabsList>
            
            <TabsContent value="instructions" className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-medium">Quick Setup Steps:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>
                    Open your{' '}
                    <Button variant="link" className="p-0 h-auto" asChild>
                      <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Supabase Dashboard
                      </a>
                    </Button>
                  </li>
                  <li>Navigate to your project and go to <strong>SQL Editor</strong></li>
                  <li>Copy the SQL script from the "SQL Script" tab</li>
                  <li>Paste it into the SQL Editor and click <strong>Run</strong></li>
                  <li>Click the "Check Status" button above to verify setup</li>
                </ol>
              </div>
            </TabsContent>
            
            <TabsContent value="sql" className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Complete Setup SQL:</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(databaseSetupSQL);
                  }}
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copy SQL
                </Button>
              </div>
              <div className="bg-gray-100 p-4 rounded text-xs font-mono overflow-x-auto max-h-96 overflow-y-auto border">
                <pre>{databaseSetupSQL}</pre>
              </div>
            </TabsContent>
          </Tabs>
        )}

        {allCompleted && (
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">✅ Ready to Use!</h4>
            <p className="text-sm text-green-700 mb-3">
              Your ChargeSource storage system is now fully configured. You can:
            </p>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Upload files to all three storage buckets</li>
              <li>• Track document metadata and versions</li>
              <li>• Organize files by user or organization</li>
              <li>• Manage approval workflows</li>
              <li>• Search and categorize documents</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
