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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  projectTemplates,
  templateCategories,
  getTemplatesByCategory,
  getPopularTemplates,
  ProjectTemplate,
  applyTemplate,
} from "@/lib/projectTemplates";
import {
  Building,
  Building2,
  Store,
  Truck,
  Landmark,
  Bed,
  Home,
  Search,
  Star,
  Clock,
  DollarSign,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Zap,
  Users,
  MapPin,
  Settings,
} from "lucide-react";

interface ProjectTemplateSelectorProps {
  onSelectTemplate: (template: ProjectTemplate) => void;
  onSkipTemplate: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getTemplateIcon = (iconName: string) => {
  const icons: Record<string, React.ReactNode> = {
    building: <Building className="w-6 h-6" />,
    building2: <Building2 className="w-6 h-6" />,
    store: <Store className="w-6 h-6" />,
    truck: <Truck className="w-6 h-6" />,
    landmark: <Landmark className="w-6 h-6" />,
    bed: <Bed className="w-6 h-6" />,
    home: <Home className="w-6 h-6" />,
  };
  return icons[iconName] || <Zap className="w-6 h-6" />;
};

const getComplexityColor = (complexity: string) => {
  switch (complexity) {
    case "Low":
      return "bg-green-100 text-green-800 border-green-200";
    case "Medium":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "High":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export default function ProjectTemplateSelector({
  onSelectTemplate,
  onSkipTemplate,
  open,
  onOpenChange,
}: ProjectTemplateSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
  const [showTemplateDetails, setShowTemplateDetails] = useState(false);

  // Filter templates based on category and search
  const filteredTemplates = getTemplatesByCategory(selectedCategory).filter(
    (template) =>
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const popularTemplates = getPopularTemplates(3);

  const handleTemplateSelect = (template: ProjectTemplate) => {
    setSelectedTemplate(template);
    setShowTemplateDetails(true);
  };

  const handleConfirmTemplate = () => {
    if (selectedTemplate) {
      onSelectTemplate(selectedTemplate);
      onOpenChange(false);
    }
  };

  const handleSkipTemplate = () => {
    onSkipTemplate();
    onOpenChange(false);
  };

  return (
    <>
      {/* Main Template Selection Dialog */}
      <Dialog open={open && !showTemplateDetails} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl h-[90vh] p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-2xl">Choose a Project Template</DialogTitle>
            <DialogDescription>
              Start with a pre-configured template to streamline your project setup, or skip to create a custom project from scratch.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 px-6 pb-6">
            {/* Popular Templates Section */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 text-yellow-500" />
                <h3 className="text-lg font-semibold">Most Popular Templates</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {popularTemplates.map((template) => (
                  <Card
                    key={template.id}
                    className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary/20"
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          {getTemplateIcon(template.icon)}
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-base">{template.name}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {template.category}
                            </Badge>
                            <Badge className={getComplexityColor(template.complexity)} variant="secondary">
                              {template.complexity}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground mb-3">
                        {template.description}
                      </p>
                      <div className="space-y-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          {template.estimatedDuration}
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-3 h-3" />
                          {template.costRange}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Search and Filter */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1">
                <Label htmlFor="template-search" className="sr-only">
                  Search templates
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="template-search"
                    placeholder="Search templates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-48">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {templateCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name} ({category.count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* All Templates Grid */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">
                All Templates ({filteredTemplates.length})
              </h3>
              <ScrollArea className="h-96">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pr-4">
                  {filteredTemplates.map((template) => (
                    <Card
                      key={template.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            {getTemplateIcon(template.icon)}
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-sm leading-tight">
                              {template.name}
                            </CardTitle>
                            <div className="flex items-center gap-1 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {template.category}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                          {template.description}
                        </p>
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <div className="flex items-center justify-between">
                            <span>{template.estimatedDuration}</span>
                            <Badge className={getComplexityColor(template.complexity)} variant="secondary">
                              {template.complexity}
                            </Badge>
                          </div>
                          <div className="font-medium text-foreground">
                            {template.costRange}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {filteredTemplates.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      No templates found matching your criteria.
                    </p>
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t">
            <Button variant="outline" onClick={handleSkipTemplate}>
              Skip Template - Start from Scratch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Template Details Dialog */}
      <Dialog open={showTemplateDetails} onOpenChange={setShowTemplateDetails}>
        <DialogContent className="max-w-4xl h-[90vh] p-0">
          {selectedTemplate && (
            <>
              <DialogHeader className="p-6 pb-0">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    {getTemplateIcon(selectedTemplate.icon)}
                  </div>
                  <div className="flex-1">
                    <DialogTitle className="text-2xl">{selectedTemplate.name}</DialogTitle>
                    <DialogDescription className="mt-2">
                      {selectedTemplate.description}
                    </DialogDescription>
                    <div className="flex items-center gap-3 mt-3">
                      <Badge variant="outline">{selectedTemplate.category}</Badge>
                      <Badge className={getComplexityColor(selectedTemplate.complexity)} variant="secondary">
                        {selectedTemplate.complexity} Complexity
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Star className="w-4 h-4 text-yellow-500" />
                        Popular
                      </div>
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <ScrollArea className="flex-1 px-6">
                <div className="space-y-6 pb-6">
                  {/* Key Information */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium">Duration</span>
                        </div>
                        <p className="text-lg font-semibold">{selectedTemplate.estimatedDuration}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <DollarSign className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium">Cost Range</span>
                        </div>
                        <p className="text-lg font-semibold">{selectedTemplate.costRange}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <BarChart3 className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium">Complexity</span>
                        </div>
                        <Badge className={getComplexityColor(selectedTemplate.complexity)} variant="secondary">
                          {selectedTemplate.complexity}
                        </Badge>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Pre-configured Settings */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Pre-configured Settings</CardTitle>
                      <CardDescription>
                        This template will automatically configure the following settings for your project
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Client Requirements
                          </h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• Organization: {selectedTemplate.clientRequirements.organizationType}</li>
                            <li>• Objective: {selectedTemplate.clientRequirements.projectObjective}</li>
                            <li>• Vehicles: {selectedTemplate.clientRequirements.numberOfVehicles}</li>
                            <li>• Usage: {selectedTemplate.clientRequirements.dailyUsagePattern}</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <Zap className="w-4 h-4" />
                            Charging Configuration
                          </h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• Type: {selectedTemplate.chargerSelection.chargingType}</li>
                            <li>• Power: {selectedTemplate.chargerSelection.powerRating}</li>
                            <li>• Quantity: {selectedTemplate.chargerSelection.numberOfChargers}</li>
                            <li>• Mounting: {selectedTemplate.chargerSelection.mountingType}</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            Site Assessment
                          </h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• Site Type: {selectedTemplate.siteAssessment.siteType}</li>
                            <li>• Power Supply: {selectedTemplate.siteAssessment.existingPowerSupply}</li>
                            <li>• Parking Spaces: {selectedTemplate.siteAssessment.parkingSpaces}</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <Settings className="w-4 h-4" />
                            Compliance
                          </h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• Standards: {selectedTemplate.compliance.electricalStandards?.slice(0, 2).join(", ")}</li>
                            <li>• Permits: {selectedTemplate.compliance.localPermits?.slice(0, 2).join(", ")}</li>
                            <li>• Accessibility: {selectedTemplate.compliance.accessibilityCompliance ? "Required" : "Not Required"}</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Milestones Timeline */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Project Timeline</CardTitle>
                      <CardDescription>
                        Key milestones and phases for this type of project
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {selectedTemplate.milestones.map((milestone, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium">{milestone.title}</h4>
                                <span className="text-xs text-muted-foreground">
                                  Day {milestone.duration}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {milestone.description}
                              </p>
                              <Badge variant="outline" className="text-xs mt-1">
                                {milestone.category}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recommendations */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {selectedTemplate.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Considerations */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Important Considerations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {selectedTemplate.considerations.map((consideration, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2 flex-shrink-0" />
                            <span className="text-sm">{consideration}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>

              <DialogFooter className="px-6 py-4 border-t">
                <Button variant="outline" onClick={() => setShowTemplateDetails(false)}>
                  Back to Templates
                </Button>
                <Button onClick={handleConfirmTemplate}>
                  Use This Template
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
