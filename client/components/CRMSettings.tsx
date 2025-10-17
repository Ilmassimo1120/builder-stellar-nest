import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CRMConfig } from "@shared/customer";
import { customerService } from "@/lib/services/customerService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Settings,
  Check,
  X,
  AlertTriangle,
  RefreshCw,
  Database,
  Cloud,
  Link as LinkIcon,
  Shield,
} from "lucide-react";
import { LoadingSpinner } from "./LoadingSpinner";

const crmConfigSchema = z.object({
  provider: z.enum(["native", "hubspot", "pipedrive"]),
  apiKey: z.string().optional(),
  domain: z.string().optional(),
  syncEnabled: z.boolean(),
  syncFrequency: z.enum(["realtime", "hourly", "daily"]),
  autoCreateProjects: z.boolean(),
  autoSyncQuotes: z.boolean(),
});

type CRMConfigData = z.infer<typeof crmConfigSchema>;

export function CRMSettings() {
  const [config, setConfig] = useState<CRMConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "unknown" | "connected" | "disconnected"
  >("unknown");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const form = useForm<CRMConfigData>({
    resolver: zodResolver(crmConfigSchema),
    defaultValues: {
      provider: "native",
      syncEnabled: false,
      syncFrequency: "hourly",
      autoCreateProjects: false,
      autoSyncQuotes: false,
    },
  });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const currentConfig = customerService.getConfig();
      setConfig(currentConfig);
      form.reset(currentConfig);

      // Check connection status
      const provider = customerService.getActiveProvider();
      setConnectionStatus(
        provider.isAuthenticated() ? "connected" : "disconnected",
      );
    } catch (err) {
      setError("Failed to load CRM configuration");
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    try {
      setTesting(true);
      setError(null);

      const formData = form.getValues();
      const provider = customerService.getActiveProvider();

      const success = await provider.authenticate(formData);
      setConnectionStatus(success ? "connected" : "disconnected");

      if (success) {
        setSuccess("Connection successful!");
      } else {
        setError("Connection failed. Please check your credentials.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection test failed");
      setConnectionStatus("disconnected");
    } finally {
      setTesting(false);
    }
  };

  const onSubmit = async (data: CRMConfigData) => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const success = await customerService.setConfig({
        provider: data.provider || "native",
        ...data,
      });

      if (success) {
        setConfig({ provider: data.provider || "native", ...data } as any);
        setSuccess("Configuration saved successfully!");

        // Update connection status
        const provider = customerService.getActiveProvider();
        setConnectionStatus(
          provider.isAuthenticated() ? "connected" : "disconnected",
        );
      } else {
        setError("Failed to save configuration. Please check your settings.");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save configuration",
      );
    } finally {
      setSaving(false);
    }
  };

  const getProviderInfo = (provider: string) => {
    switch (provider) {
      case "hubspot":
        return {
          name: "HubSpot",
          description:
            "Connect to your HubSpot CRM for customer and deal management",
          requiresApiKey: true,
          requiresDomain: false,
          icon: "🟠",
        };
      case "pipedrive":
        return {
          name: "Pipedrive",
          description: "Integrate with Pipedrive for sales pipeline management",
          requiresApiKey: true,
          requiresDomain: true,
          icon: "🟢",
        };
      case "native":
        return {
          name: "Native Storage",
          description: "Use built-in customer management with local storage",
          requiresApiKey: false,
          requiresDomain: false,
          icon: "🔵",
        };
      default:
        return {
          name: provider,
          description: "Unknown provider",
          requiresApiKey: false,
          requiresDomain: false,
          icon: "⚪",
        };
    }
  };

  const currentProvider = getProviderInfo(form.watch("provider"));

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">CRM Settings</h2>
        <p className="text-muted-foreground">
          Configure your customer relationship management integration
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Status Alerts */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50">
              <Check className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Success</AlertTitle>
              <AlertDescription className="text-green-700">
                {success}
              </AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="provider" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="provider">Provider</TabsTrigger>
              <TabsTrigger value="sync">Sync Settings</TabsTrigger>
              <TabsTrigger value="integration">Integration</TabsTrigger>
            </TabsList>

            <TabsContent value="provider" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    CRM Provider
                  </CardTitle>
                  <CardDescription>
                    Choose your customer relationship management system
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="provider"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Provider</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a CRM provider" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="native">
                              <div className="flex items-center gap-2">
                                <span>🔵</span>
                                <span>Native Storage</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="hubspot">
                              <div className="flex items-center gap-2">
                                <span>🟠</span>
                                <span>HubSpot</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="pipedrive">
                              <div className="flex items-center gap-2">
                                <span>🟢</span>
                                <span>Pipedrive</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          {currentProvider.description}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Connection Status */}
                  <div className="flex items-center gap-2 p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      {connectionStatus === "connected" ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : connectionStatus === "disconnected" ? (
                        <X className="w-4 h-4 text-red-600" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-yellow-600" />
                      )}
                      <span className="text-sm font-medium">
                        {connectionStatus === "connected"
                          ? "Connected"
                          : connectionStatus === "disconnected"
                            ? "Disconnected"
                            : "Unknown"}
                      </span>
                    </div>
                    <Badge
                      variant={
                        connectionStatus === "connected"
                          ? "default"
                          : "destructive"
                      }
                    >
                      {currentProvider.name}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* API Configuration */}
              {(currentProvider.requiresApiKey ||
                currentProvider.requiresDomain) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      API Configuration
                    </CardTitle>
                    <CardDescription>
                      Configure your API credentials for {currentProvider.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {currentProvider.requiresApiKey && (
                      <FormField
                        control={form.control}
                        name="apiKey"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>API Key</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Enter your API key"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Your {currentProvider.name} API key for
                              authentication
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {currentProvider.requiresDomain && (
                      <FormField
                        control={form.control}
                        name="domain"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Domain</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="your-company.pipedrive.com"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Your {currentProvider.name} domain
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <Button
                      type="button"
                      variant="outline"
                      onClick={testConnection}
                      disabled={testing}
                    >
                      {testing ? (
                        <LoadingSpinner className="w-4 h-4 mr-2" />
                      ) : (
                        <LinkIcon className="w-4 h-4 mr-2" />
                      )}
                      Test Connection
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="sync" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <RefreshCw className="w-5 h-5" />
                    Sync Settings
                  </CardTitle>
                  <CardDescription>
                    Configure how data synchronizes with your CRM
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="syncEnabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Enable Sync
                          </FormLabel>
                          <FormDescription>
                            Automatically synchronize customer data with your
                            CRM
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {form.watch("syncEnabled") && (
                    <FormField
                      control={form.control}
                      name="syncFrequency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sync Frequency</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select sync frequency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="realtime">
                                Real-time
                              </SelectItem>
                              <SelectItem value="hourly">Hourly</SelectItem>
                              <SelectItem value="daily">Daily</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            How often to sync data with your CRM
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="integration" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cloud className="w-5 h-5" />
                    Integration Settings
                  </CardTitle>
                  <CardDescription>
                    Configure how the CRM integrates with your projects and
                    quotes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="autoCreateProjects"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Auto-create Projects
                          </FormLabel>
                          <FormDescription>
                            Automatically create projects when new deals are
                            created in CRM
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="autoSyncQuotes"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Auto-sync Quotes
                          </FormLabel>
                          <FormDescription>
                            Automatically update CRM deals when quote status
                            changes
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>
              {saving && <LoadingSpinner className="w-4 h-4 mr-2" />}
              Save Configuration
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
