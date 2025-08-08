import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Users as UsersIcon,
  Shield,
  UserCheck,
  Plus,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Logo } from "@/components/ui/logo";
import { useAuth } from "@/hooks/useAuth";
import UserRoleIndicator, {
  PermissionGate,
} from "@/components/UserRoleIndicator";

export default function Users() {
  const { user } = useAuth();

  // Sample users data - in real app this would come from Supabase
  const sampleUsers = [
    {
      id: "1",
      name: "John Smith",
      email: "john@electricalservices.com.au",
      role: "admin",
      company: "Smith Electrical Services",
      verified: true,
      lastActive: "2 hours ago",
    },
    {
      id: "2",
      name: "Sarah Johnson",
      email: "sarah@evinstallpro.com.au",
      role: "partner",
      company: "EV Install Pro",
      verified: true,
      lastActive: "1 day ago",
    },
    {
      id: "3",
      name: "Mike Chen",
      email: "mike@chargeexperts.com.au",
      role: "sales",
      company: "Charge Experts",
      verified: false,
      lastActive: "3 days ago",
    },
  ];

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "global_admin":
        return "bg-red-100 text-red-800";
      case "admin":
        return "bg-purple-100 text-purple-800";
      case "sales":
        return "bg-blue-100 text-blue-800";
      case "partner":
        return "bg-green-100 text-green-800";
      case "user":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <div className="h-6 w-px bg-border" />
            <Logo size="lg" />
          </div>
          <div className="flex items-center gap-3">
            <UserRoleIndicator />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">User Management</h1>
            <p className="text-muted-foreground">
              Manage users, roles, and permissions across the ChargeSource
              platform
            </p>
          </div>
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <PermissionGate permission="users.create">
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Invite User
              </Button>
            </PermissionGate>
          </div>
        </div>

        {/* User List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UsersIcon className="w-5 h-5" />
              Platform Users
            </CardTitle>
            <CardDescription>
              All users with access to the ChargeSource platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sampleUsers.map((sampleUser) => (
                <div
                  key={sampleUser.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:border-primary transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-medium">
                      {sampleUser.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{sampleUser.name}</h3>
                        {sampleUser.verified && (
                          <UserCheck className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {sampleUser.email}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {sampleUser.company}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <Badge className={getRoleBadgeColor(sampleUser.role)}>
                        <Shield className="w-3 h-3 mr-1" />
                        {sampleUser.role.replace("_", " ").toUpperCase()}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        Active {sampleUser.lastActive}
                      </p>
                    </div>

                    <PermissionGate permission="users.edit.all">
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm">
                          ⋮
                        </Button>
                      </div>
                    </PermissionGate>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Role Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Role Permissions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge className="bg-red-100 text-red-800">
                    GLOBAL ADMIN
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Full system access, platform management
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge className="bg-purple-100 text-purple-800">ADMIN</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Company administration, user management
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-100 text-blue-800">SALES</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Sales analytics, quote management
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">User Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold">156</div>
                <div className="text-sm text-muted-foreground">Total Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">142</div>
                <div className="text-sm text-muted-foreground">
                  Verified Users
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">89</div>
                <div className="text-sm text-muted-foreground">
                  Active This Week
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <PermissionGate permission="users.create">
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="w-4 h-4 mr-2" />
                  Invite New User
                </Button>
              </PermissionGate>

              <PermissionGate permission="users.view.all">
                <Button variant="outline" className="w-full justify-start">
                  <UsersIcon className="w-4 h-4 mr-2" />
                  Export User List
                </Button>
              </PermissionGate>

              <PermissionGate permission="settings.edit">
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="w-4 h-4 mr-2" />
                  Manage Permissions
                </Button>
              </PermissionGate>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
