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
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  Plus,
  TrendingUp,
  Users,
  Package,
  Calendar,
  FileText,
  DollarSign,
  BarChart3,
  FolderOpen,
  Calculator,
} from "lucide-react";

export default function DashboardWorking() {
  const { user, logout } = useAuth();

  const stats = [
    { title: "Active Projects", value: "12", icon: FolderOpen, trend: "+2" },
    { title: "Pending Quotes", value: "8", icon: Calculator, trend: "+3" },
    {
      title: "This Month Revenue",
      value: "$45,200",
      icon: DollarSign,
      trend: "+12%",
    },
    { title: "Completed Projects", value: "34", icon: Package, trend: "+5" },
  ];

  const recentProjects = [
    {
      id: 1,
      name: "Tesla Supercharger - Mall",
      status: "In Progress",
      completion: 75,
    },
    {
      id: 2,
      name: "Office Building EV Hub",
      status: "Planning",
      completion: 25,
    },
    {
      id: 3,
      name: "Residential Installation",
      status: "Completed",
      completion: 100,
    },
    {
      id: 4,
      name: "Hotel Charging Station",
      status: "In Progress",
      completion: 60,
    },
  ];

  const pendingQuotes = [
    { id: 1, client: "ABC Corp", amount: "$12,500", created: "2 days ago" },
    { id: 2, client: "XYZ Ltd", amount: "$8,900", created: "1 week ago" },
    {
      id: 3,
      client: "Green Energy Co",
      amount: "$25,000",
      created: "3 days ago",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user?.name}!</p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="secondary">{user?.role}</Badge>
            <Button onClick={logout} variant="outline">
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Button className="w-full h-16 flex flex-col gap-2" asChild>
            <Link to="/projects/new">
              <Plus className="h-5 w-5" />
              New Project
            </Link>
          </Button>
          <Button
            variant="outline"
            className="w-full h-16 flex flex-col gap-2"
            asChild
          >
            <Link to="/quotes/new">
              <Calculator className="h-5 w-5" />
              Create Quote
            </Link>
          </Button>
          <Button
            variant="outline"
            className="w-full h-16 flex flex-col gap-2"
            asChild
          >
            <Link to="/catalogue">
              <Package className="h-5 w-5" />
              Browse Catalog
            </Link>
          </Button>
          <Button
            variant="outline"
            className="w-full h-16 flex flex-col gap-2"
            asChild
          >
            <Link to="/customers">
              <Users className="h-5 w-5" />
              Manage Clients
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">↗ {stat.trend}</span> from
                  last month
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Projects */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5" />
                Recent Projects
              </CardTitle>
              <CardDescription>Your latest project activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentProjects.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{project.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {project.status}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={
                          project.status === "Completed"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {project.completion}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/projects">View All Projects</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Pending Quotes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Pending Quotes
              </CardTitle>
              <CardDescription>Quotes awaiting client response</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingQuotes.map((quote) => (
                  <div
                    key={quote.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{quote.client}</p>
                      <p className="text-sm text-muted-foreground">
                        {quote.created}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{quote.amount}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/quotes">View All Quotes</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
