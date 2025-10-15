import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  FileText,
  Users,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  Zap,
  Clock,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { quoteService } from "@/lib/quoteService";
import { QuoteAnalytics } from "@/lib/quoteTypes";

export default function Analytics() {
  const { user, hasPermission } = useAuth();
  const [analytics, setAnalytics] = useState<QuoteAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30d");

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = quoteService.getQuoteAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  // Sample data for charts (in a real app, this would come from your analytics service)
  const chartData = {
    revenue: [
      { month: "Jan", value: 45000 },
      { month: "Feb", value: 52000 },
      { month: "Mar", value: 48000 },
      { month: "Apr", value: 61000 },
      { month: "May", value: 55000 },
      { month: "Jun", value: 67000 },
    ],
    projects: [
      { status: "Completed", count: 12, percentage: 40 },
      { status: "In Progress", count: 8, percentage: 27 },
      { status: "Planning", count: 6, percentage: 20 },
      { status: "On Hold", count: 4, percentage: 13 },
    ],
    productCategories: [
      { category: "DC Fast Chargers", sales: 45, value: 234000 },
      { category: "AC Level 2", sales: 32, value: 156000 },
      { category: "Installation Materials", sales: 78, value: 89000 },
      { category: "Maintenance", sales: 23, value: 45000 },
    ],
  };

  const stats = [
    {
      title: "Total Revenue",
      value: analytics ? `$${analytics.totalValue.toLocaleString()}` : "$0",
      change: "+15.3%",
      trend: "up",
      icon: <DollarSign className="w-5 h-5" />,
      color: "text-green-600",
    },
    {
      title: "Active Projects",
      value: "18",
      change: "+2 this month",
      trend: "up",
      icon: <Zap className="w-5 h-5" />,
      color: "text-blue-600",
    },
    {
      title: "Quote Conversion",
      value: analytics ? `${analytics.conversionRate.toFixed(1)}%` : "0%",
      change: "+3.2%",
      trend: "up",
      icon: <FileText className="w-5 h-5" />,
      color: "text-purple-600",
    },
    {
      title: "Average Deal Size",
      value: analytics
        ? `$${analytics.averageQuoteValue.toLocaleString()}`
        : "$0",
      change: "+8.7%",
      trend: "up",
      icon: <TrendingUp className="w-5 h-5" />,
      color: "text-orange-600",
    },
    {
      title: "Active Clients",
      value: "47",
      change: "+5 this month",
      trend: "up",
      icon: <Users className="w-5 h-5" />,
      color: "text-indigo-600",
    },
    {
      title: "Avg Response Time",
      value: "2.4h",
      change: "-15min",
      trend: "up",
      icon: <Clock className="w-5 h-5" />,
      color: "text-green-600",
    },
  ];

  if (!hasPermission("analytics.view")) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
                <BarChart3 className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium mb-2">Access Restricted</h3>
              <p className="text-sm text-muted-foreground">
                You don't have permission to view analytics. Contact your
                administrator to request access.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Analytics & Reports</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={loadAnalytics}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Time Range Selector */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-sm font-medium">Time Range:</span>
          {["7d", "30d", "90d", "1y"].map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range === "7d" && "Last 7 days"}
              {range === "30d" && "Last 30 days"}
              {range === "90d" && "Last 90 days"}
              {range === "1y" && "Last year"}
            </Button>
          ))}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {stat.trend === "up" ? (
                        <ArrowUpRight className="w-3 h-3 text-green-600" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3 text-red-600" />
                      )}
                      <p className={`text-xs ${stat.color}`}>{stat.change}</p>
                    </div>
                  </div>
                  <div className={`${stat.color}`}>{stat.icon}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Analytics Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Trend</CardTitle>
                  <CardDescription>Monthly revenue over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Revenue chart would be rendered here</p>
                      <p className="text-xs">
                        Connect to chart library like Recharts
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Project Status Distribution</CardTitle>
                  <CardDescription>Current project pipeline</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {chartData.projects.map((item, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          {item.status}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {item.count} projects
                        </span>
                      </div>
                      <Progress value={item.percentage} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Top Performing Products</CardTitle>
                <CardDescription>
                  Best selling products by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {chartData.productCategories.map((category, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Package className="w-8 h-8 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{category.category}</p>
                          <p className="text-sm text-muted-foreground">
                            {category.sales} units sold
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          ${category.value.toLocaleString()}
                        </p>
                        <Badge variant="secondary">
                          {((category.value / 524000) * 100).toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Analytics</CardTitle>
                <CardDescription>
                  Detailed revenue breakdown and trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <DollarSign className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">
                      Revenue Analytics
                    </p>
                    <p>
                      Detailed revenue charts and forecasting would be displayed
                      here
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Analytics</CardTitle>
                <CardDescription>
                  Project performance metrics and insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Zap className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">
                      Project Analytics
                    </p>
                    <p>
                      Project timeline, completion rates, and performance
                      metrics
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>
                  Team and system performance indicators
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">
                      Performance Dashboard
                    </p>
                    <p>
                      KPIs, team productivity, and system performance metrics
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
