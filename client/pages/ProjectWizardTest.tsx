import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/ui/logo";
import { Link } from "react-router-dom";
import { Users, ArrowLeft, ArrowRight } from "lucide-react";

export default function ProjectWizardTest() {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Logo size="xl" />
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" asChild>
              <Link to="/dashboard">Dashboard</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Project Planning Wizard - Test</h1>
        
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Step {currentStep} of {totalSteps}
            </CardTitle>
            <CardDescription>
              Testing the enhanced Project Planning Wizard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>This is a test version of the wizard. The full wizard will include:</p>
            <ul className="list-disc list-inside mt-4 space-y-2">
              <li>Client Requirements (Contact info, project objectives, vehicle types)</li>
              <li>Site Assessment (Enhanced with client data)</li>
              <li>Charger Selection</li>
              <li>Grid Capacity Analysis</li>
              <li>Compliance Checklist</li>
              <li>Project Summary</li>
            </ul>
          </CardContent>
        </Card>

        <div className="flex justify-between mt-8 max-w-4xl mx-auto">
          <Button variant="outline" disabled className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Previous
          </Button>
          <Button className="flex items-center gap-2">
            Next
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
