import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Database, Zap, CheckCircle2, ArrowRight, RefreshCw } from "lucide-react";

interface SupabaseSetupProps {
  isConnected: boolean;
  onRetry: () => Promise<void>;
}

export function SupabaseSetup({ isConnected, onRetry }: SupabaseSetupProps) {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await onRetry();
    } catch (error) {
      console.error('Error during retry:', error);
    } finally {
      setIsRetrying(false);
    }
  };

  const handleOpenMCP = () => {
    console.log('🔗 Attempting to open MCP popover...');

    // Method 1: Try the documented action link format
    try {
      const link = document.createElement('a');
      link.href = '#open-mcp-popover';
      link.click();
      console.log('✅ Triggered MCP popover via action link');
    } catch (error) {
      console.log('❌ Action link method failed:', error);
    }

    // Method 2: Try to find and click MCP-related buttons
    try {
      const mcpButtons = document.querySelectorAll('button, [role="button"]');
      mcpButtons.forEach((button) => {
        const text = button.textContent?.toLowerCase();
        if (text?.includes('mcp') || text?.includes('integration') || text?.includes('popover')) {
          (button as HTMLElement).click();
          console.log('✅ Found and clicked MCP button');
        }
      });
    } catch (error) {
      console.log('❌ Button search method failed:', error);
    }

    // Method 3: Custom event dispatch
    try {
      window.dispatchEvent(new CustomEvent('openMCPPopover'));
      window.dispatchEvent(new CustomEvent('open-mcp-popover'));
      console.log('✅ Dispatched custom events');
    } catch (error) {
      console.log('❌ Custom event method failed:', error);
    }

    // Method 4: Show instructions to user
    alert('To connect Supabase:\\n\\n1. Look for an "MCP" or "Integrations" button in the UI\\n2. Click it to open the MCP popover\\n3. Find and connect to "Supabase"\\n4. Come back and click "Check Connection Again"');
  };

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
            onClick={handleOpenMCP}
          >
            <Zap className="w-4 h-4 mr-2" />
            Open MCP popover
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button
            variant="outline"
            onClick={handleRetry}
            disabled={isRetrying}
          >
            {isRetrying ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Check Connection Again
              </>
            )}
          </Button>
        </div>

        <Alert>
          <AlertDescription className="text-sm">
            💡 <strong>No setup required!</strong> Once connected, the database schema will be created automatically
            and your app will start saving to the cloud immediately.
          </AlertDescription>
        </Alert>

        {/* Debug Information */}
        <div className="text-xs text-blue-600 bg-blue-100 p-2 rounded">
          <details>
            <summary className="cursor-pointer">🔧 Debug Info (click to expand)</summary>
            <div className="mt-2 space-y-1">
              <div>Current URL: {import.meta.env.VITE_SUPABASE_URL || 'Not set'}</div>
              <div>Key Status: {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Not set'}</div>
              <div>Environment: {import.meta.env.MODE}</div>
              <div>Timestamp: {new Date().toISOString()}</div>
            </div>
          </details>
        </div>
      </CardContent>
    </Card>
  );
}
