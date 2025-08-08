import React, { useState } from "react";
import {
  Save,
  User,
  Mail,
  Phone,
  Lock,
  Bell,
  Eye,
  EyeOff,
  Shield,
  Download,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import UserRoleIndicator from "./UserRoleIndicator";

export default function UserAccountSettings() {
  const { toast } = useToast();
  const { user, updateUser } = useAuth();
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Form states
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    company: user?.company || "",
    department: user?.department || "",
    businessAddress: user?.businessAddress || "",
    website: user?.website || "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: true,
    marketingEmails: false,
    weeklyReports: true,
    projectUpdates: true,
    quoteAlerts: true,
    language: "en",
    timezone: "Australia/Sydney",
    dateFormat: "dd/mm/yyyy",
    currency: "AUD",
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: "team",
    showEmail: false,
    showPhone: false,
    dataCollection: true,
    analytics: true,
  });

  const updateProfileData = (field: string, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const updatePreferences = (field: string, value: any) => {
    setPreferences((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const updatePrivacy = (field: string, value: any) => {
    setPrivacy((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update user in auth context
      updateUser({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        name: `${profileData.firstName} ${profileData.lastName}`,
        email: profileData.email,
        phone: profileData.phone,
        company: profileData.company,
        department: profileData.department,
        businessAddress: profileData.businessAddress,
        website: profileData.website,
      });

      // Save preferences and privacy settings
      localStorage.setItem(
        `userPreferences_${user?.id}`,
        JSON.stringify(preferences),
      );
      localStorage.setItem(`userPrivacy_${user?.id}`, JSON.stringify(privacy));

      setHasChanges(false);

      toast({
        title: "Profile Updated",
        description: "Your account settings have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save your settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirmation don't match.",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      toast({
        title: "Password Changed",
        description: "Your password has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Password Change Failed",
        description: "Failed to change password. Please try again.",
        variant: "destructive",
      });
    }
  };

  const exportData = () => {
    const userData = {
      profile: profileData,
      preferences,
      privacy,
      role: user?.role,
      loginHistory: [], // Would be fetched from API
      activityLog: [], // Would be fetched from API
    };

    const dataStr = JSON.stringify(userData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `user-data-${user?.id}-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Data Exported",
      description: "Your account data has been downloaded.",
    });
  };

  const deleteAccount = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone.",
    );

    if (!confirmed) return;

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Account Deletion Request",
        description:
          "Your account deletion request has been submitted for review.",
        variant: "destructive",
      });
    } catch (error) {
      toast({
        title: "Deletion Failed",
        description:
          "Failed to process account deletion. Please contact support.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Account Settings
              </CardTitle>
              <CardDescription>
                Manage your personal account information and preferences
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {hasChanges && (
                <Badge
                  variant="outline"
                  className="text-orange-600 border-orange-200"
                >
                  Unsaved Changes
                </Badge>
              )}
              <Button onClick={saveProfile} disabled={!hasChanges || saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Update your personal and business information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Role Display */}
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Current Role & Permissions</h3>
                    <p className="text-sm text-muted-foreground">
                      Your access level and permissions within the system
                    </p>
                  </div>
                  <UserRoleIndicator showDescription />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={profileData.firstName}
                    onChange={(e) =>
                      updateProfileData("firstName", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={profileData.lastName}
                    onChange={(e) =>
                      updateProfileData("lastName", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => updateProfileData("email", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => updateProfileData("phone", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={profileData.company}
                    onChange={(e) =>
                      updateProfileData("company", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={profileData.department}
                    onChange={(e) =>
                      updateProfileData("department", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="businessAddress">Business Address</Label>
                  <Textarea
                    id="businessAddress"
                    value={profileData.businessAddress}
                    onChange={(e) =>
                      updateProfileData("businessAddress", e.target.value)
                    }
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={profileData.website}
                    onChange={(e) =>
                      updateProfileData("website", e.target.value)
                    }
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Regional Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select
                      value={preferences.language}
                      onValueChange={(value) =>
                        updatePreferences("language", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="en-au">
                          English (Australia)
                        </SelectItem>
                        <SelectItem value="en-nz">
                          English (New Zealand)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select
                      value={preferences.timezone}
                      onValueChange={(value) =>
                        updatePreferences("timezone", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Australia/Sydney">
                          Australia/Sydney
                        </SelectItem>
                        <SelectItem value="Australia/Melbourne">
                          Australia/Melbourne
                        </SelectItem>
                        <SelectItem value="Australia/Perth">
                          Australia/Perth
                        </SelectItem>
                        <SelectItem value="Australia/Brisbane">
                          Australia/Brisbane
                        </SelectItem>
                        <SelectItem value="Australia/Adelaide">
                          Australia/Adelaide
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateFormat">Date Format</Label>
                    <Select
                      value={preferences.dateFormat}
                      onValueChange={(value) =>
                        updatePreferences("dateFormat", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dd/mm/yyyy">DD/MM/YYYY</SelectItem>
                        <SelectItem value="mm/dd/yyyy">MM/DD/YYYY</SelectItem>
                        <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      value={preferences.currency}
                      onValueChange={(value) =>
                        updatePreferences("currency", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AUD">
                          Australian Dollar (AUD)
                        </SelectItem>
                        <SelectItem value="USD">US Dollar (USD)</SelectItem>
                        <SelectItem value="EUR">Euro (EUR)</SelectItem>
                        <SelectItem value="GBP">British Pound (GBP)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
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
                <Lock className="w-5 h-5" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Manage your password and security preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Change Password</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          setPasswordData((prev) => ({
                            ...prev,
                            currentPassword: e.target.value,
                          }))
                        }
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData((prev) => ({
                            ...prev,
                            newPassword: e.target.value,
                          }))
                        }
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">
                      Confirm New Password
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData((prev) => ({
                          ...prev,
                          confirmPassword: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <Button
                  onClick={changePassword}
                  disabled={
                    !passwordData.currentPassword ||
                    !passwordData.newPassword ||
                    !passwordData.confirmPassword
                  }
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Change Password
                </Button>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Security Options</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Two-Factor Authentication</h4>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <Button variant="outline">
                      <Shield className="w-4 h-4 mr-2" />
                      Setup 2FA
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Login History</h4>
                      <p className="text-sm text-muted-foreground">
                        View recent login activity and manage sessions
                      </p>
                    </div>
                    <Button variant="outline">
                      <Eye className="w-4 h-4 mr-2" />
                      View History
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Choose what notifications you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Communication Channels</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications via email
                      </p>
                    </div>
                    <Switch
                      checked={preferences.emailNotifications}
                      onCheckedChange={(checked) =>
                        updatePreferences("emailNotifications", checked)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive browser push notifications
                      </p>
                    </div>
                    <Switch
                      checked={preferences.pushNotifications}
                      onCheckedChange={(checked) =>
                        updatePreferences("pushNotifications", checked)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Marketing Emails</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive product updates and promotions
                      </p>
                    </div>
                    <Switch
                      checked={preferences.marketingEmails}
                      onCheckedChange={(checked) =>
                        updatePreferences("marketingEmails", checked)
                      }
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Content Notifications</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Weekly Reports</Label>
                      <p className="text-sm text-muted-foreground">
                        Weekly summary of your activity
                      </p>
                    </div>
                    <Switch
                      checked={preferences.weeklyReports}
                      onCheckedChange={(checked) =>
                        updatePreferences("weeklyReports", checked)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Project Updates</Label>
                      <p className="text-sm text-muted-foreground">
                        Notifications about project changes
                      </p>
                    </div>
                    <Switch
                      checked={preferences.projectUpdates}
                      onCheckedChange={(checked) =>
                        updatePreferences("projectUpdates", checked)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Quote Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Alerts for quote expirations and updates
                      </p>
                    </div>
                    <Switch
                      checked={preferences.quoteAlerts}
                      onCheckedChange={(checked) =>
                        updatePreferences("quoteAlerts", checked)
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Settings */}
        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Privacy Settings
              </CardTitle>
              <CardDescription>
                Control your privacy and data sharing preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Profile Visibility</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="profileVisibility">
                      Who can see your profile
                    </Label>
                    <Select
                      value={privacy.profileVisibility}
                      onValueChange={(value) =>
                        updatePrivacy("profileVisibility", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Everyone</SelectItem>
                        <SelectItem value="team">Team Members Only</SelectItem>
                        <SelectItem value="company">Company Only</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Show Email Address</Label>
                      <p className="text-sm text-muted-foreground">
                        Display your email on your profile
                      </p>
                    </div>
                    <Switch
                      checked={privacy.showEmail}
                      onCheckedChange={(checked) =>
                        updatePrivacy("showEmail", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Show Phone Number</Label>
                      <p className="text-sm text-muted-foreground">
                        Display your phone number on your profile
                      </p>
                    </div>
                    <Switch
                      checked={privacy.showPhone}
                      onCheckedChange={(checked) =>
                        updatePrivacy("showPhone", checked)
                      }
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Data Usage</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Data Collection</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow collection of usage data to improve the service
                      </p>
                    </div>
                    <Switch
                      checked={privacy.dataCollection}
                      onCheckedChange={(checked) =>
                        updatePrivacy("dataCollection", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Analytics</Label>
                      <p className="text-sm text-muted-foreground">
                        Help us improve by sharing anonymous analytics
                      </p>
                    </div>
                    <Switch
                      checked={privacy.analytics}
                      onCheckedChange={(checked) =>
                        updatePrivacy("analytics", checked)
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Management */}
        <TabsContent value="data">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                Data Management
              </CardTitle>
              <CardDescription>
                Export your data or delete your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Data Export</h3>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Download Your Data</h4>
                    <p className="text-sm text-muted-foreground">
                      Export all your account data in JSON format
                    </p>
                  </div>
                  <Button onClick={exportData} variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export Data
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-red-600">
                  Danger Zone
                </h3>
                <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-red-900">
                        Delete Account
                      </h4>
                      <p className="text-sm text-red-700 mt-1">
                        Permanently delete your account and all associated data.
                        This action cannot be undone.
                      </p>
                      <Button
                        onClick={deleteAccount}
                        variant="destructive"
                        className="mt-3"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
