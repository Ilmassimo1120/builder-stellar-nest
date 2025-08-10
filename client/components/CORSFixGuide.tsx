import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertTriangle, 
  ExternalLink, 
  Copy, 
  CheckCircle,
  Globe,
  Settings,
  Shield
} from "lucide-react";

export default function CORSFixGuide() {
  const [copied, setCopied] = useState<string | null>(null);
  
  const currentDomain = window.location.origin;
  const supabaseUrl = "https://tepmkljodsifaexmrinl.supabase.co";
  
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const corsOrigins = [
    "http://localhost:8080",
    "http://localhost:5173", 
    "http://localhost:3000",
    currentDomain,
    "https://*.fly.dev"
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-500" />
          CORS Configuration Fix Required
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="problem" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="problem">Problem</TabsTrigger>
            <TabsTrigger value="fix">Fix Steps</TabsTrigger>
            <TabsTrigger value="test">Test Fix</TabsTrigger>
          </TabsList>

          <TabsContent value="problem" className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>CORS Error Detected:</strong> Your Supabase project is blocking requests from this domain.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-3">
              <div>
                <strong>Current Domain:</strong>
                <div className="flex items-center gap-2 mt-1">
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm">{currentDomain}</code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(currentDomain, "domain")}
                  >
                    {copied === "domain" ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  </Button>
                </div>
              </div>
              
              <div>
                <strong>Supabase Project:</strong>
                <div className="flex items-center gap-2 mt-1">
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm">{supabaseUrl}</code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(`${supabaseUrl.replace('https://', 'https://supabase.com/dashboard/project/')}/settings/api`, '_blank')}
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>

            <Alert>
              <Globe className="h-4 w-4" />
              <AlertDescription>
                CORS (Cross-Origin Resource Sharing) prevents your browser from making requests to Supabase from unauthorized domains.
              </AlertDescription>
            </Alert>
          </TabsContent>

          <TabsContent value="fix" className="space-y-4">
            <Alert>
              <Settings className="h-4 w-4" />
              <AlertDescription>
                Follow these steps to fix CORS in your Supabase dashboard:
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold mb-2">Step 1: Open Supabase Dashboard</h4>
                <Button
                  onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
                  className="mb-2"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Supabase Dashboard
                </Button>
                <p className="text-sm text-muted-foreground">Click to open in a new tab</p>
              </div>

              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold mb-2">Step 2: Navigate to API Settings</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  In your project dashboard: <strong>Settings → API</strong>
                </p>
                <Button
                  onClick={() => window.open(`https://supabase.com/dashboard/project/tepmkljodsifaexmrinl/settings/api`, '_blank')}
                  variant="outline"
                  size="sm"
                >
                  <ExternalLink className="w-3 h-3 mr-2" />
                  Direct Link to API Settings
                </Button>
              </div>

              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-semibold mb-2">Step 3: Add CORS Origins</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Scroll down to <strong>"CORS Origins"</strong> section and add these domains:
                </p>
                
                <div className="space-y-2">
                  {corsOrigins.map((origin, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm flex-1">{origin}</code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(origin, `origin-${index}`)}
                      >
                        {copied === `origin-${index}` ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </Button>
                    </div>
                  ))}
                </div>

                <Alert className="mt-3">
                  <AlertDescription>
                    <strong>Pro Tip:</strong> Add each origin on a separate line in the CORS Origins field.
                  </AlertDescription>
                </Alert>
              </div>

              <div className="border-l-4 border-purple-500 pl-4">
                <h4 className="font-semibold mb-2">Step 4: Save Changes</h4>
                <p className="text-sm text-muted-foreground">
                  Click <strong>"Save"</strong> and wait 2-3 minutes for changes to take effect.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="test" className="space-y-4">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                After updating CORS settings, test the connection here:
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <Button 
                onClick={() => window.location.reload()} 
                className="w-full"
              >
                🔄 Refresh Page to Test Connection
              </Button>
              
              <div className="text-sm text-muted-foreground space-y-1">
                <div>✅ If CORS is fixed: Bucket creation and auth will work</div>
                <div>❌ If still failing: Double-check CORS origins and wait a few more minutes</div>
              </div>
            </div>

            <Alert>
              <AlertDescription>
                <strong>Alternative Test:</strong> Try the standalone test file:
                <code className="ml-1">test-create-buckets.html</code>
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
