import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import {
  Plus,
  Search,
  Filter,
  Calendar,
  MapPin,
  User,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export default function ProjectsWorking() {
  const [searchTerm, setSearchTerm] = useState("");

  const projects = [
    {
      id: 1,
      name: "Tesla Supercharger Installation - Westfield Mall",
      client: "Westfield Corporation",
      status: "In Progress",
      progress: 75,
      startDate: "2024-01-15",
      expectedCompletion: "2024-03-20",
      value: "$125,000",
      location: "Sydney, NSW",
      priority: "High",
    },
    {
      id: 2,
      name: "Office Building EV Hub - Corporate Center",
      client: "ABC Property Group",
      status: "Planning",
      progress: 25,
      startDate: "2024-02-01",
      expectedCompletion: "2024-04-15",
      value: "$89,500",
      location: "Melbourne, VIC",
      priority: "Medium",
    },
    {
      id: 3,
      name: "Residential Complex Charging Network",
      client: "Green Living Apartments",
      status: "Completed",
      progress: 100,
      startDate: "2023-11-20",
      expectedCompletion: "2024-01-10",
      value: "$67,800",
      location: "Brisbane, QLD",
      priority: "Low",
    },
    {
      id: 4,
      name: "Hotel Destination Charging Stations",
      client: "Luxury Hotels Ltd",
      status: "Quote Pending",
      progress: 10,
      startDate: "TBD",
      expectedCompletion: "TBD",
      value: "$156,000",
      location: "Perth, WA",
      priority: "High",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "default";
      case "In Progress":
        return "secondary";
      case "Planning":
        return "outline";
      case "Quote Pending":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "text-red-600";
      case "Medium":
        return "text-yellow-600";
      case "Low":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Projects</h1>
            <p className="text-muted-foreground">
              Manage your EV charging infrastructure projects
            </p>
          </div>
          <Button className="flex items-center gap-2" asChild>
            <Link to="/projects/new">
              <Plus className="h-4 w-4" />
              New Project
            </Link>
          </Button>
        </div>
      </header>

      <div className="p-6">
        {/* Search and Filter Bar */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card
              key={project.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-1">
                      {project.name}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {project.client}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant={getStatusColor(project.status)}>
                      {project.status}
                    </Badge>
                    <span
                      className={`text-xs font-medium ${getPriorityColor(project.priority)}`}
                    >
                      {project.priority} Priority
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{project.progress}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Project Details */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span>{project.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-3 w-3 text-muted-foreground" />
                      <span className="font-medium">{project.value}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span>
                        {project.startDate !== "TBD"
                          ? `Due: ${project.expectedCompletion}`
                          : "Timeline TBD"}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <Link to={`/projects/${project.id}`}>View Details</Link>
                    </Button>
                    <Button size="sm" className="flex-1" asChild>
                      <Link to={`/projects/${project.id}/edit`}>Edit</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-xl font-bold">2</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-xl font-bold">1</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-xl font-bold">1</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <DollarSign className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Value</p>
                  <p className="text-xl font-bold">$438K</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
