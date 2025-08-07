import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Database, Zap, CheckCircle2, ArrowRight } from "lucide-react";

interface SupabaseSetupProps {
  isConnected: boolean;
  onRetry: () => void;
}

export function SupabaseSetup({ isConnected, onRetry }: SupabaseSetupProps) {
  if (isConnected) {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          ✅ Database connected successfully! Your projects will be saved to the cloud.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <Database className="w-5 h-5" />
          Connect to Cloud Database
        </CardTitle>
        <CardDescription className="text-blue-700">
          Connect Supabase to save your projects to the cloud automatically
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-blue-900 mb-2">📋 Easy Setup Steps:</h4>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. Click "Open MCP popover" below</li>
              <li>2. Find and connect to "Supabase"</li>
              <li>3. Your database will be configured automatically</li>
              <li>4. Projects will save to the cloud instantly!</li>
            </ol>
          </div>
          <div>
            <h4 className="font-medium text-blue-900 mb-2">🌟 Benefits:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Access projects from anywhere</li>
              <li>• Real-time collaboration</li>
              <li>• Automatic backups</li>
              <li>• Advanced reporting & analytics</li>
            </ul>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => window.open('#open-mcp-popover', '_self')}
          >
            <Zap className="w-4 h-4 mr-2" />
            Open MCP popover
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button variant="outline" onClick={onRetry}>
            Check Connection Again
          </Button>
        </div>

        <Alert>
          <AlertDescription className="text-sm">
            💡 <strong>No setup required!</strong> Once connected, the database schema will be created automatically 
            and your app will start saving to the cloud immediately.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
