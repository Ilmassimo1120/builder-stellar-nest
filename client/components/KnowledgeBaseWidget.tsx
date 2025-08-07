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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BookOpen,
  Search,
  Video,
  FileText,
  Zap,
  Shield,
  Calculator,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  HelpCircle,
  Settings,
  Users,
  Clock,
  Star,
  Download,
} from "lucide-react";

interface KnowledgeItem {
  id: string;
  title: string;
  description: string;
  category: string;
  type: "article" | "video" | "guide" | "regulation" | "template";
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedTime: string;
  tags: string[];
  content: string;
  lastUpdated: string;
  featured?: boolean;
}

const knowledgeBase: KnowledgeItem[] = [
  {
    id: "1",
    title: "EV Charging Station Installation Guide",
    description: "Complete step-by-step guide for installing commercial EV charging stations",
    category: "Installation",
    type: "guide",
    difficulty: "intermediate",
    estimatedTime: "15 min read",
    tags: ["installation", "commercial", "AC charging"],
    content: `# EV Charging Station Installation Guide

## Overview
This comprehensive guide covers the installation of commercial AC charging stations for workplace and retail environments.

## Pre-Installation Requirements
1. **Site Assessment**: Conduct thorough electrical and physical site evaluation
2. **Permits**: Obtain necessary electrical and building permits
3. **Grid Connection**: Verify adequate electrical capacity
4. **Accessibility**: Ensure compliance with DDA requirements

## Installation Steps

### 1. Electrical Work
- Install dedicated circuit breaker
- Run appropriate cabling (minimum 4mm² for 32A circuits)
- Install earth leakage protection
- Configure load management if required

### 2. Physical Installation
- Mount charging station according to manufacturer specifications
- Ensure minimum 1.2m clearance around unit
- Install appropriate signage
- Configure parking bay markings

### 3. Commissioning
- Test all electrical connections
- Verify safety systems operation
- Configure network connectivity
- Complete electrical certification

## Compliance Requirements
- AS/NZS 3000 Wiring Rules
- AS/NZS 61851 Electric vehicle charging systems
- Local council regulations
- Building Code of Australia (BCA)

## Common Issues and Solutions
- **Circuit overload**: Install load management system
- **Earth fault**: Check all connections and cable integrity  
- **Network connectivity**: Verify SIM card and signal strength
- **User access issues**: Configure appropriate RFID/app access`,
    lastUpdated: "2024-01-15",
    featured: true,
  },
  {
    id: "2",
    title: "DC Fast Charging Infrastructure",
    description: "Planning and installing high-power DC charging stations",
    category: "Installation",
    type: "guide",
    difficulty: "advanced",
    estimatedTime: "25 min read",
    tags: ["DC charging", "high power", "commercial"],
    content: `# DC Fast Charging Infrastructure

## Introduction
DC fast charging requires specialized knowledge of high-voltage systems and grid integration.

## Key Components
- DC charging unit (50kW - 350kW)
- High-voltage switchgear
- Transformer (if required)
- Power factor correction
- Communication systems

## Design Considerations
1. **Power Requirements**: Typical 50kW unit requires 80A 3-phase supply
2. **Cooling Systems**: Most units require forced ventilation
3. **Safety Systems**: Emergency stops, earth monitoring
4. **Grid Impact**: Power factor and harmonics management

## Installation Process
Detailed installation steps and safety procedures for DC charging infrastructure...`,
    lastUpdated: "2024-01-10",
  },
  {
    id: "3",
    title: "Australian Standards for EV Charging",
    description: "Overview of AS/NZS standards and compliance requirements",
    category: "Regulations",
    type: "regulation",
    difficulty: "beginner",
    estimatedTime: "10 min read",
    tags: ["standards", "compliance", "regulations"],
    content: `# Australian Standards for EV Charging

## Key Standards
- **AS/NZS 61851**: Electric vehicle charging systems
- **AS/NZS 3000**: Wiring Rules
- **AS/NZS 3008**: Electrical installations - cable selection

## Compliance Requirements
Essential compliance information for EV charging installations...`,
    lastUpdated: "2024-01-12",
    featured: true,
  },
  {
    id: "4",
    title: "Load Management and Smart Charging",
    description: "Implementing intelligent load management systems",
    category: "Technology",
    type: "article",
    difficulty: "intermediate",
    estimatedTime: "12 min read",
    tags: ["load management", "smart charging", "grid"],
    content: `# Load Management and Smart Charging

## Why Load Management?
Load management prevents electrical overloads and optimizes energy usage across multiple charging points.

## Implementation Strategies
1. **Static Load Management**: Fixed power allocation per charging point
2. **Dynamic Load Management**: Real-time power adjustment based on demand
3. **Grid Integration**: Response to grid signals and pricing

## Technology Options
- Hardwired load management controllers
- Cloud-based management systems
- Integrated charger load balancing`,
    lastUpdated: "2024-01-08",
  },
  {
    id: "5",
    title: "Workplace Charging Installation",
    description: "Best practices for employee charging facilities",
    category: "Applications",
    type: "guide",
    difficulty: "beginner",
    estimatedTime: "8 min read",
    tags: ["workplace", "employee", "AC charging"],
    content: `# Workplace Charging Installation

## Planning Considerations
- Employee demand assessment
- Parking allocation strategies
- Electrical capacity requirements
- Access control and billing

## Installation Guidelines
Step-by-step process for workplace charging implementation...`,
    lastUpdated: "2024-01-14",
  },
  {
    id: "6",
    title: "Troubleshooting Common Issues",
    description: "Quick solutions for frequent EV charging problems",
    category: "Support",
    type: "article",
    difficulty: "beginner",
    estimatedTime: "6 min read",
    tags: ["troubleshooting", "maintenance", "support"],
    content: `# Troubleshooting Common Issues

## Electrical Issues
- Circuit breaker tripping
- Earth leakage detection
- Voltage fluctuations
- Overheating

## Communication Problems
- Network connectivity
- RFID reader issues
- Backend communication failures

## User Interface Issues
- Display problems
- Cable management
- Emergency stop procedures`,
    lastUpdated: "2024-01-11",
    featured: true,
  },
];

export function KnowledgeBaseWidget() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedItem, setSelectedItem] = useState<KnowledgeItem | null>(null);

  const categories = [
    { id: "all", name: "All Topics", icon: <BookOpen className="w-4 h-4" /> },
    { id: "Installation", name: "Installation", icon: <Zap className="w-4 h-4" /> },
    { id: "Regulations", name: "Regulations", icon: <Shield className="w-4 h-4" /> },
    { id: "Technology", name: "Technology", icon: <Settings className="w-4 h-4" /> },
    { id: "Applications", name: "Applications", icon: <Users className="w-4 h-4" /> },
    { id: "Support", name: "Support", icon: <HelpCircle className="w-4 h-4" /> },
  ];

  const filteredItems = knowledgeBase.filter((item) => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const featuredItems = knowledgeBase.filter(item => item.featured);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video": return <Video className="w-4 h-4" />;
      case "guide": return <BookOpen className="w-4 h-4" />;
      case "regulation": return <Shield className="w-4 h-4" />;
      case "template": return <FileText className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-100 text-green-800 border-green-200";
      case "intermediate": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "advanced": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <CardTitle>Knowledge Base</CardTitle>
          </div>
          <Badge variant="secondary" className="text-xs">
            {knowledgeBase.length} articles
          </Badge>
        </div>
        <CardDescription>
          Quick access to EV charging guides, regulations, and best practices
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Welcome Banner */}
        <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
            <span className="font-medium text-blue-900 text-sm">Expert Knowledge at Your Fingertips</span>
          </div>
          <p className="text-xs text-blue-700">
            Access Australian standards, installation guides, and troubleshooting tips from certified EV charging professionals.
          </p>
        </div>

        <Tabs defaultValue="featured" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="featured" className="text-xs sm:text-sm">Featured</TabsTrigger>
            <TabsTrigger value="browse" className="text-xs sm:text-sm">Browse</TabsTrigger>
            <TabsTrigger value="search" className="text-xs sm:text-sm">Search</TabsTrigger>
          </TabsList>

          <TabsContent value="featured" className="space-y-3">
            {featuredItems.map((item) => (
              <Dialog key={item.id}>
                <DialogTrigger asChild>
                  <div className="p-3 border rounded-lg hover:border-primary transition-colors cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getTypeIcon(item.type)}
                          <h4 className="font-medium text-sm">{item.title}</h4>
                          <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          {item.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={`text-xs ${getDifficultyColor(item.difficulty)}`}>
                            {item.difficulty}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {item.estimatedTime}
                          </span>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh]">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      {getTypeIcon(item.type)}
                      {item.title}
                    </DialogTitle>
                    <DialogDescription>
                      {item.description}
                    </DialogDescription>
                  </DialogHeader>
                  <ScrollArea className="max-h-[60vh] pr-4">
                    <div className="prose prose-sm max-w-none">
                      <div className="whitespace-pre-line">{item.content}</div>
                    </div>
                  </ScrollArea>
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getDifficultyColor(item.difficulty)}>
                        {item.difficulty}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Updated: {new Date(item.lastUpdated).toLocaleDateString()}
                      </span>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            ))}
          </TabsContent>

          <TabsContent value="browse" className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="justify-start"
                >
                  {category.icon}
                  <span className="ml-1">{category.name}</span>
                </Button>
              ))}
            </div>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredItems.map((item) => (
                <Dialog key={item.id}>
                  <DialogTrigger asChild>
                    <div className="p-3 border rounded-lg hover:border-primary transition-colors cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(item.type)}
                          <span className="font-medium text-sm">{item.title}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {item.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {item.estimatedTime}
                          </span>
                        </div>
                      </div>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh]">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        {getTypeIcon(item.type)}
                        {item.title}
                      </DialogTitle>
                      <DialogDescription>
                        {item.description}
                      </DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="max-h-[60vh] pr-4">
                      <div className="prose prose-sm max-w-none">
                        <div className="whitespace-pre-line">{item.content}</div>
                      </div>
                    </ScrollArea>
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getDifficultyColor(item.difficulty)}>
                          {item.difficulty}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Updated: {new Date(item.lastUpdated).toLocaleDateString()}
                        </span>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="search" className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search guides, regulations, troubleshooting..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {searchQuery && (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <Dialog key={item.id}>
                      <DialogTrigger asChild>
                        <div className="p-3 border rounded-lg hover:border-primary transition-colors cursor-pointer">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                {getTypeIcon(item.type)}
                                <h4 className="font-medium text-sm">{item.title}</h4>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {item.description}
                              </p>
                            </div>
                            <Badge variant="outline" className="text-xs ml-2">
                              {item.category}
                            </Badge>
                          </div>
                        </div>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh]">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            {getTypeIcon(item.type)}
                            {item.title}
                          </DialogTitle>
                          <DialogDescription>
                            {item.description}
                          </DialogDescription>
                        </DialogHeader>
                        <ScrollArea className="max-h-[60vh] pr-4">
                          <div className="prose prose-sm max-w-none">
                            <div className="whitespace-pre-line">{item.content}</div>
                          </div>
                        </ScrollArea>
                        <div className="flex items-center justify-between pt-4 border-t">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={getDifficultyColor(item.difficulty)}>
                              {item.difficulty}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              Updated: {new Date(item.lastUpdated).toLocaleDateString()}
                            </span>
                          </div>
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            Download PDF
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">
                      No articles found for "{searchQuery}"
                    </p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
