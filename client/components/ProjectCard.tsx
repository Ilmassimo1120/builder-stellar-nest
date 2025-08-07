import React, { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";
import {
  Users,
  MapPin,
  Calendar,
  Clock,
  Eye,
  Edit,
  Copy,
  Trash2,
  MoreHorizontal,
  Home,
  Building,
  Factory,
  Zap,
} from "lucide-react";

interface Project {
  id: string;
  name: string;
  client: string;
  status: string;
  progress: number;
  value: string;
  deadline: string;
  location: string;
  type: string;
  isDraft?: boolean;
  draftStep?: number;
}

interface ProjectCardProps {
  project: Project;
  onView: (project: Project) => void;
  onEdit: (project: Project) => void;
  onDuplicate: (project: Project) => void;
  onDelete: (projectId: string) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "Completed":
      return "bg-green-100 text-green-800 border-green-200";
    case "In Progress":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "Planning":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "Quoting":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "Draft":
      return "bg-gray-100 text-gray-800 border-gray-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getTypeIcon = (type: string) => {
  if (type.includes("Residential")) return <Home className="w-4 h-4" />;
  if (type.includes("Commercial") || type.includes("Retail"))
    return <Building className="w-4 h-4" />;
  if (type.includes("Industrial") || type.includes("Fleet"))
    return <Factory className="w-4 h-4" />;
  if (type.includes("Public")) return <Users className="w-4 h-4" />;
  return <Zap className="w-4 h-4" />;
};

const ProjectCard = memo<ProjectCardProps>(
  ({ project, onView, onEdit, onDuplicate, onDelete }) => {
    return (
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {getTypeIcon(project.type)}
                <CardTitle className="text-lg truncate">
                  {project.name}
                </CardTitle>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {project.client}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {project.location}
                </span>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onView(project)}>
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                {project.isDraft ? (
                  <DropdownMenuItem asChild>
                    <Link to={`/projects/new?draft=${project.id}`}>
                      <Edit className="w-4 h-4 mr-2" />
                      Resume Draft
                    </Link>
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => onEdit(project)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Project
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => onDuplicate(project)}>
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(project.id)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Badge
                className={getStatusColor(project.status)}
                variant="secondary"
              >
                {project.isDraft
                  ? `Draft - Step ${project.draftStep}/6`
                  : project.status}
              </Badge>
              <span className="text-sm font-medium">{project.value}</span>
            </div>

            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span>Progress</span>
                <span>{project.progress}%</span>
              </div>
              <Progress value={project.progress} className="h-2" />
            </div>

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {project.deadline}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {project.type}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  },
);

ProjectCard.displayName = "ProjectCard";

export default ProjectCard;
