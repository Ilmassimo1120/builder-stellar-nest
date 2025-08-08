import React, { useState, useEffect } from 'react';
import { 
  Save,
  AlertTriangle,
  CheckCircle2,
  Globe,
  Database,
  Shield,
  Bell,
  Mail,
  DollarSign,
  Users,
  Settings,
  Zap,
  FileText,
  Package,
  Truck,
  Clock,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface GlobalConfig {
  system: {
    siteName: string;
    supportEmail: string;
    maintenanceMode: boolean;
    allowRegistration: boolean;
    requireEmailVerification: boolean;
    sessionTimeout: number;
    maxUploadSize: number;
  };
  business: {
    companyName: string;
    companyAddress: string;
    companyPhone: string;
    companyEmail: string;
    abn: string;
    gstRate: number;
    defaultMarkup: number;
    currency: string;
    timezone: string;
  };
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    quoteExpireyAlert: number;
    lowStockAlert: number;
    systemAlerts: boolean;
  };
  integrations: {
    supabaseEnabled: boolean;
    stripeEnabled: boolean;
    emailProvider: string;
    smsProvider: string;
    analyticsEnabled: boolean;
  };
  security: {
    enforceStrongPasswords: boolean;
    enableTwoFactor: boolean;
    loginAttempts: number;
    lockoutDuration: number;
    sessionSecurity: string;
    dataEncryption: boolean;
  };
  features: {
    productComparison: boolean;
    advancedReporting: boolean;
    automatedQuotes: boolean;
    clientPortal: boolean;
    mobileApp: boolean;
    apiAccess: boolean;
  };
}

const defaultConfig: GlobalConfig = {
  system: {
    siteName: 'ChargeSource Portal',
    supportEmail: 'support@chargesource.com.au',
    maintenanceMode: false,
    allowRegistration: true,
    requireEmailVerification: true,
    sessionTimeout: 480, // 8 hours in minutes
    maxUploadSize: 10 // MB
  },
  business: {
    companyName: 'ChargeSource Pty Ltd',
    companyAddress: '123 Electric Avenue, Sydney NSW 2000',
    companyPhone: '+61 2 9876 5432',
    companyEmail: 'info@chargesource.com.au',
    abn: '12 345 678 901',
    gstRate: 10,
    defaultMarkup: 35,
    currency: 'AUD',
    timezone: 'Australia/Sydney'
  },
  notifications: {
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    quoteExpireyAlert: 7, // days
    lowStockAlert: 10, // units
    systemAlerts: true
  },
  integrations: {
    supabaseEnabled: false,
    stripeEnabled: false,
    emailProvider: 'sendgrid',
    smsProvider: 'twilio',
    analyticsEnabled: true
  },
  security: {
    enforceStrongPasswords: true,
    enableTwoFactor: false,
    loginAttempts: 5,
    lockoutDuration: 30, // minutes
    sessionSecurity: 'high',
    dataEncryption: true
  },
  features: {
    productComparison: true,
    advancedReporting: true,
    automatedQuotes: false,
    clientPortal: true,
    mobileApp: false,
    apiAccess: true
  }
};

export default function GlobalSettings() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [config, setConfig] = useState<GlobalConfig>(defaultConfig);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load configuration from localStorage
  useEffect(() => {
    try {
      const savedConfig = localStorage.getItem('chargeSourceGlobalConfig');
      if (savedConfig) {
        setConfig({ ...defaultConfig, ...JSON.parse(savedConfig) });
      }
    } catch (error) {
      console.error('Error loading global config:', error);
    }
  }, []);

  const updateConfig = (section: keyof GlobalConfig, field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    setHasChanges(true);
  };

  const saveConfiguration = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      localStorage.setItem('chargeSourceGlobalConfig', JSON.stringify(config));
      setHasChanges(false);
      
      toast({
        title: "Configuration Saved",
        description: "Global settings have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save configuration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = () => {
    setConfig(defaultConfig);
    setHasChanges(true);
    toast({
      title: "Reset to Defaults",
      description: "All settings have been reset to default values.",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Global System Settings
              </CardTitle>
              <CardDescription>
                Configure system-wide settings that affect all users and operations
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {hasChanges && (
                <Badge variant="outline" className="text-orange-600 border-orange-200">
                  Unsaved Changes
                </Badge>
              )}
              <Button variant="outline" onClick={resetToDefaults}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button onClick={saveConfiguration} disabled={!hasChanges || saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="system" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
        </TabsList>

        {/* System Settings */}
        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                System Configuration
              </CardTitle>
              <CardDescription>
                Core system settings and operational parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={config.system.siteName}
                    onChange={(e) => updateConfig('system', 'siteName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supportEmail">Support Email</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    value={config.system.supportEmail}
                    onChange={(e) => updateConfig('system', 'supportEmail', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={config.system.sessionTimeout}
                    onChange={(e) => updateConfig('system', 'sessionTimeout', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxUploadSize">Max Upload Size (MB)</Label>
                  <Input
                    id="maxUploadSize"
                    type="number"
                    value={config.system.maxUploadSize}
                    onChange={(e) => updateConfig('system', 'maxUploadSize', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">System Controls</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Maintenance Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Temporarily disable access for maintenance
                      </p>
                    </div>
                    <Switch
                      checked={config.system.maintenanceMode}
                      onCheckedChange={(checked) => updateConfig('system', 'maintenanceMode', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Allow User Registration</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable new user account creation
                      </p>
                    </div>
                    <Switch
                      checked={config.system.allowRegistration}
                      onCheckedChange={(checked) => updateConfig('system', 'allowRegistration', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Require Email Verification</Label>
                      <p className="text-sm text-muted-foreground">
                        New users must verify their email
                      </p>
                    </div>
                    <Switch
                      checked={config.system.requireEmailVerification}
                      onCheckedChange={(checked) => updateConfig('system', 'requireEmailVerification', checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Business Settings */}
        <TabsContent value="business">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Business Configuration
              </CardTitle>
              <CardDescription>
                Company details, pricing, and business rules
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={config.business.companyName}
                    onChange={(e) => updateConfig('business', 'companyName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="abn">ABN</Label>
                  <Input
                    id="abn"
                    value={config.business.abn}
                    onChange={(e) => updateConfig('business', 'abn', e.target.value)}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="companyAddress">Company Address</Label>
                  <Textarea
                    id="companyAddress"
                    value={config.business.companyAddress}
                    onChange={(e) => updateConfig('business', 'companyAddress', e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyPhone">Phone</Label>
                  <Input
                    id="companyPhone"
                    value={config.business.companyPhone}
                    onChange={(e) => updateConfig('business', 'companyPhone', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyEmail">Business Email</Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    value={config.business.companyEmail}
                    onChange={(e) => updateConfig('business', 'companyEmail', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gstRate">GST Rate (%)</Label>
                  <Input
                    id="gstRate"
                    type="number"
                    step="0.1"
                    value={config.business.gstRate}
                    onChange={(e) => updateConfig('business', 'gstRate', parseFloat(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="defaultMarkup">Default Markup (%)</Label>
                  <Input
                    id="defaultMarkup"
                    type="number"
                    value={config.business.defaultMarkup}
                    onChange={(e) => updateConfig('business', 'defaultMarkup', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select 
                    value={config.business.currency} 
                    onValueChange={(value) => updateConfig('business', 'currency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AUD">Australian Dollar (AUD)</SelectItem>
                      <SelectItem value="USD">US Dollar (USD)</SelectItem>
                      <SelectItem value="EUR">Euro (EUR)</SelectItem>
                      <SelectItem value="GBP">British Pound (GBP)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select 
                    value={config.business.timezone} 
                    onValueChange={(value) => updateConfig('business', 'timezone', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Australia/Sydney">Australia/Sydney</SelectItem>
                      <SelectItem value="Australia/Melbourne">Australia/Melbourne</SelectItem>
                      <SelectItem value="Australia/Perth">Australia/Perth</SelectItem>
                      <SelectItem value="Australia/Brisbane">Australia/Brisbane</SelectItem>
                      <SelectItem value="Australia/Adelaide">Australia/Adelaide</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>
                Configure system-wide notification preferences and alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Notification Channels</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Send email alerts and updates
                      </p>
                    </div>
                    <Switch
                      checked={config.notifications.emailNotifications}
                      onCheckedChange={(checked) => updateConfig('notifications', 'emailNotifications', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>SMS Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Send SMS alerts for urgent items
                      </p>
                    </div>
                    <Switch
                      checked={config.notifications.smsNotifications}
                      onCheckedChange={(checked) => updateConfig('notifications', 'smsNotifications', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Browser push notifications
                      </p>
                    </div>
                    <Switch
                      checked={config.notifications.pushNotifications}
                      onCheckedChange={(checked) => updateConfig('notifications', 'pushNotifications', checked)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Alert Thresholds</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="quoteExpireyAlert">Quote Expiry Alert (days)</Label>
                    <Input
                      id="quoteExpireyAlert"
                      type="number"
                      value={config.notifications.quoteExpireyAlert}
                      onChange={(e) => updateConfig('notifications', 'quoteExpireyAlert', parseInt(e.target.value))}
                    />
                    <p className="text-sm text-muted-foreground">
                      Alert when quotes are expiring within this many days
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lowStockAlert">Low Stock Alert (units)</Label>
                    <Input
                      id="lowStockAlert"
                      type="number"
                      value={config.notifications.lowStockAlert}
                      onChange={(e) => updateConfig('notifications', 'lowStockAlert', parseInt(e.target.value))}
                    />
                    <p className="text-sm text-muted-foreground">
                      Alert when product stock falls below this level
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>System Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive alerts about system errors and updates
                  </p>
                </div>
                <Switch
                  checked={config.notifications.systemAlerts}
                  onCheckedChange={(checked) => updateConfig('notifications', 'systemAlerts', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Settings */}
        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Third-party Integrations
              </CardTitle>
              <CardDescription>
                Configure external services and API integrations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Supabase Database</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable cloud database storage
                    </p>
                  </div>
                  <Switch
                    checked={config.integrations.supabaseEnabled}
                    onCheckedChange={(checked) => updateConfig('integrations', 'supabaseEnabled', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Stripe Payments</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable online payment processing
                    </p>
                  </div>
                  <Switch
                    checked={config.integrations.stripeEnabled}
                    onCheckedChange={(checked) => updateConfig('integrations', 'stripeEnabled', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Analytics Tracking</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable usage analytics and reporting
                    </p>
                  </div>
                  <Switch
                    checked={config.integrations.analyticsEnabled}
                    onCheckedChange={(checked) => updateConfig('integrations', 'analyticsEnabled', checked)}
                  />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="emailProvider">Email Provider</Label>
                  <Select 
                    value={config.integrations.emailProvider} 
                    onValueChange={(value) => updateConfig('integrations', 'emailProvider', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sendgrid">SendGrid</SelectItem>
                      <SelectItem value="mailgun">Mailgun</SelectItem>
                      <SelectItem value="aws-ses">AWS SES</SelectItem>
                      <SelectItem value="smtp">Custom SMTP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smsProvider">SMS Provider</Label>
                  <Select 
                    value={config.integrations.smsProvider} 
                    onValueChange={(value) => updateConfig('integrations', 'smsProvider', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="twilio">Twilio</SelectItem>
                      <SelectItem value="vonage">Vonage</SelectItem>
                      <SelectItem value="aws-sns">AWS SNS</SelectItem>
                      <SelectItem value="messagebird">MessageBird</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security Configuration
              </CardTitle>
              <CardDescription>
                System security policies and authentication settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enforce Strong Passwords</Label>
                    <p className="text-sm text-muted-foreground">
                      Require complex password patterns
                    </p>
                  </div>
                  <Switch
                    checked={config.security.enforceStrongPasswords}
                    onCheckedChange={(checked) => updateConfig('security', 'enforceStrongPasswords', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Two-Factor Auth</Label>
                    <p className="text-sm text-muted-foreground">
                      Require 2FA for all users
                    </p>
                  </div>
                  <Switch
                    checked={config.security.enableTwoFactor}
                    onCheckedChange={(checked) => updateConfig('security', 'enableTwoFactor', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Data Encryption</Label>
                    <p className="text-sm text-muted-foreground">
                      Encrypt sensitive data at rest
                    </p>
                  </div>
                  <Switch
                    checked={config.security.dataEncryption}
                    onCheckedChange={(checked) => updateConfig('security', 'dataEncryption', checked)}
                  />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="loginAttempts">Max Login Attempts</Label>
                  <Input
                    id="loginAttempts"
                    type="number"
                    value={config.security.loginAttempts}
                    onChange={(e) => updateConfig('security', 'loginAttempts', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lockoutDuration">Lockout Duration (minutes)</Label>
                  <Input
                    id="lockoutDuration"
                    type="number"
                    value={config.security.lockoutDuration}
                    onChange={(e) => updateConfig('security', 'lockoutDuration', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sessionSecurity">Session Security</Label>
                  <Select 
                    value={config.security.sessionSecurity} 
                    onValueChange={(value) => updateConfig('security', 'sessionSecurity', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="strict">Strict</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Features Settings */}
        <TabsContent value="features">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Feature Configuration
              </CardTitle>
              <CardDescription>
                Enable or disable platform features and modules
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Product Comparison</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow users to compare products side-by-side
                    </p>
                  </div>
                  <Switch
                    checked={config.features.productComparison}
                    onCheckedChange={(checked) => updateConfig('features', 'productComparison', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Advanced Reporting</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable detailed analytics and reports
                    </p>
                  </div>
                  <Switch
                    checked={config.features.advancedReporting}
                    onCheckedChange={(checked) => updateConfig('features', 'advancedReporting', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Automated Quotes</Label>
                    <p className="text-sm text-muted-foreground">
                      AI-powered quote generation
                    </p>
                  </div>
                  <Switch
                    checked={config.features.automatedQuotes}
                    onCheckedChange={(checked) => updateConfig('features', 'automatedQuotes', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Client Portal</Label>
                    <p className="text-sm text-muted-foreground">
                      Public client access to quotes and projects
                    </p>
                  </div>
                  <Switch
                    checked={config.features.clientPortal}
                    onCheckedChange={(checked) => updateConfig('features', 'clientPortal', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Mobile App</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable mobile application features
                    </p>
                  </div>
                  <Switch
                    checked={config.features.mobileApp}
                    onCheckedChange={(checked) => updateConfig('features', 'mobileApp', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>API Access</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow third-party API integrations
                    </p>
                  </div>
                  <Switch
                    checked={config.features.apiAccess}
                    onCheckedChange={(checked) => updateConfig('features', 'apiAccess', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
