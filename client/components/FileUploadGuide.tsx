import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  Upload, FolderOpen, Tag, Eye, Users, Lock, Globe,
  FileText, Video, Image, MessageSquare, ArrowRight
} from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

export default function FileUploadGuide() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          📁 File Upload to Knowledge Base
        </h1>
        <p className="text-muted-foreground">
          How to upload files and documents to your ChargeSource Knowledge Base
        </p>
      </div>

      {/* Quick Access */}
      <Alert>
        <Upload className="h-4 w-4" />
        <AlertDescription>
          <div className="flex items-center justify-between">
            <span>
              <strong>Quick Access:</strong> Go to <code>/files</code> or click "Enhanced File Storage" in your dashboard
            </span>
            <Button variant="outline" size="sm" className="ml-4">
              Go to File Upload →
            </Button>
          </div>
        </AlertDescription>
      </Alert>

      {/* Step 1: Access File Storage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Badge className="bg-blue-500">1</Badge>
            <span>Access Enhanced File Storage</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">From Dashboard:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Look for "Upload Documents" in Quick Actions</li>
                <li>• Click the file storage link or button</li>
                <li>• Navigate to <code>/files</code> directly</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">From URL:</h4>
              <div className="bg-muted p-2 rounded text-sm font-mono">
                https://your-app.com/files
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Choose Storage Bucket */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Badge className="bg-green-500">2</Badge>
            <span>Choose Storage Bucket</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-2 border-blue-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl mb-2">👤</div>
                <h4 className="font-medium">User Files</h4>
                <p className="text-sm text-muted-foreground">Personal files</p>
                <Badge variant="outline" className="mt-2">Max 50MB</Badge>
              </CardContent>
            </Card>
            <Card className="border-2 border-green-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl mb-2">📄</div>
                <h4 className="font-medium">Documents</h4>
                <p className="text-sm text-muted-foreground">Official documents</p>
                <Badge variant="outline" className="mt-2">Max 100MB</Badge>
              </CardContent>
            </Card>
            <Card className="border-2 border-purple-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl mb-2">🎥</div>
                <h4 className="font-medium">Videos</h4>
                <p className="text-sm text-muted-foreground">Training videos</p>
                <Badge variant="outline" className="mt-2">Max 500MB</Badge>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Step 3: Upload Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Badge className="bg-purple-500">3</Badge>
            <span>Upload Interface Features</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium flex items-center space-x-2">
                <Upload className="h-4 w-4" />
                <span>Upload Methods</span>
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <span><strong>Drag & Drop:</strong> Drag files directly onto the upload area</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <span><strong>Click to Browse:</strong> Click the upload area to select files</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <span><strong>Multiple Files:</strong> Upload multiple files at once</span>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-medium flex items-center space-x-2">
                <Tag className="h-4 w-4" />
                <span>Metadata Options</span>
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <span><strong>Title:</strong> Clear, descriptive name</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <span><strong>Description:</strong> What the document contains</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <span><strong>Tags:</strong> Keywords for easy searching</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <span><strong>Category:</strong> File type classification</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 4: Visibility Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Badge className="bg-orange-500">4</Badge>
            <span>Set Visibility & Permissions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-3 border rounded">
              <Lock className="h-5 w-5 text-red-500" />
              <div>
                <div className="font-medium">Private</div>
                <div className="text-sm text-muted-foreground">Only you can access</div>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 border rounded">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <div className="font-medium">Team</div>
                <div className="text-sm text-muted-foreground">Team members can access</div>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 border rounded">
              <Globe className="h-5 w-5 text-green-500" />
              <div>
                <div className="font-medium">Public</div>
                <div className="text-sm text-muted-foreground">Everyone can access</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 5: Knowledge Base Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Badge className="bg-teal-500">5</Badge>
            <span>Knowledge Base Integration</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <MessageSquare className="h-4 w-4" />
            <AlertDescription>
              <strong>AI Integration:</strong> Once uploaded, your files become searchable through the Enhanced AI Assistant. 
              Try queries like "Find files about installation procedures" or "Search for safety documents".
            </AlertDescription>
          </Alert>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <h4 className="font-medium">Best Practices for Knowledge Base:</h4>
              <ul className="text-sm space-y-1">
                <li>• Use descriptive titles and filenames</li>
                <li>• Add relevant tags (installation, safety, standards)</li>
                <li>• Choose appropriate categories</li>
                <li>• Write clear descriptions</li>
                <li>• Set proper visibility levels</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Recommended Categories:</h4>
              <div className="flex flex-wrap gap-1">
                {['Manual', 'Training', 'Installation Guide', 'Safety', 'Compliance', 'Product Info'].map(cat => (
                  <Badge key={cat} variant="outline" className="text-xs">
                    {cat}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Final CTA */}
      <div className="text-center">
        <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600">
          <Upload className="h-4 w-4 mr-2" />
          Start Uploading Files
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
        <p className="text-sm text-muted-foreground mt-2">
          Your files will be immediately available to the AI Assistant for intelligent search
        </p>
      </div>
    </div>
  );
}
