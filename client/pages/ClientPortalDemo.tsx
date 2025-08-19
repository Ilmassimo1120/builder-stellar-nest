import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CheckCircle2,
  XCircle,
  Download,
  MessageSquare,
  Building,
  Calendar,
  Clock,
  FileText,
  Zap,
  Settings,
  Package,
  Users,
  Eye,
  ArrowLeft,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { useToast } from "@/hooks/use-toast";

// Demo quote data
const demoQuote = {
  id: "demo-quote-1",
  quoteNumber: "Q-2024-001",
  version: 1,
  status: "viewed" as const,
  title: "EV Charging Infrastructure - Corporate Headquarters",
  description: "Complete EV charging solution for corporate office building including AC and DC charging stations for employee and visitor use.",
  
  clientInfo: {
    id: "client-1",
    name: "Sarah Johnson",
    contactPerson: "Sarah Johnson",
    email: "sarah.johnson@greentech.com.au",
    phone: "+61 2 9876 5432",
    address: "Level 12, 123 Collins Street, Melbourne VIC 3000",
    company: "GreenTech Solutions Pty Ltd",
    abn: "12 345 678 901",
  },

  projectData: {
    projectId: "proj-1",
    projectName: "Corporate EV Charging Hub",
    siteAddress: "123 Collins Street, Melbourne VIC 3000",
    siteType: "Commercial Office Building",
    projectObjective: "Install comprehensive EV charging infrastructure for employees and visitors",
  },

  lineItems: [
    {
      id: "line-1",
      type: "charger" as const,
      name: "22kW AC Charging Station",
      description: "Dual-socket AC charging station suitable for employee parking areas",
      category: "chargers",
      quantity: 8,
      unitPrice: 12000,
      cost: 8400,
      markup: 30,
      totalPrice: 124800,
      unit: "each" as const,
      specifications: {
        powerRating: "22kW",
        chargingType: "AC",
        connectorTypes: ["Type 2"],
        mountingType: "Pedestal",
        weatherProtection: "IP55",
        networkConnectivity: "4G/WiFi/Ethernet",
      },
    },
    {
      id: "line-2",
      type: "charger" as const,
      name: "50kW DC Fast Charging Station",
      description: "High-speed DC charging for visitor parking and fleet vehicles",
      category: "chargers",
      quantity: 2,
      unitPrice: 65000,
      cost: 45500,
      markup: 25,
      totalPrice: 162500,
      unit: "each" as const,
      specifications: {
        powerRating: "50kW",
        chargingType: "DC",
        connectorTypes: ["CCS2", "CHAdeMO"],
        mountingType: "Floor-mounted",
        weatherProtection: "IP54",
        networkConnectivity: "4G/WiFi/Ethernet",
      },
    },
    {
      id: "line-3",
      type: "installation" as const,
      name: "Professional Installation & Commissioning",
      description: "Complete installation including electrical work, permits, and grid connection",
      category: "installation",
      quantity: 1,
      unitPrice: 45000,
      cost: 27000,
      markup: 40,
      totalPrice: 63000,
      unit: "package" as const,
    },
    {
      id: "line-4",
      type: "accessory" as const,
      name: "Weather Protection Canopy",
      description: "Protective canopy structure for outdoor charging stations",
      category: "accessories",
      quantity: 2,
      unitPrice: 8500,
      cost: 5950,
      markup: 35,
      totalPrice: 22950,
      unit: "each" as const,
      isOptional: true,
    },
    {
      id: "line-5",
      type: "service" as const,
      name: "Annual Maintenance Package",
      description: "Comprehensive maintenance and support including 24/7 monitoring",
      category: "service",
      quantity: 1,
      unitPrice: 8000,
      cost: 3200,
      markup: 60,
      totalPrice: 12800,
      unit: "year" as const,
      isOptional: true,
    },
  ],

  totals: {
    subtotal: 386050,
    discount: 0,
    discountType: "percentage" as const,
    gst: 38605,
    total: 424655,
  },

  settings: {
    validityDays: 30,
    terms: "Payment terms: 30% deposit on acceptance, 40% on delivery, 30% on completion and commissioning. All prices include GST.",
    notes: "This quote includes all necessary permits, grid connection coordination, and compliance certifications. Installation timeframe is 8-12 weeks from order confirmation.",
    paymentTerms: "Staged payments - 30% deposit, 40% on delivery, 30% on completion",
    warranty: "36 months comprehensive warranty with 24/7 support",
    deliveryTerms: "8-12 weeks from order confirmation",
  },

  createdAt: "2024-01-15T09:00:00.000Z",
  updatedAt: "2024-01-15T14:30:00.000Z",
  validUntil: "2024-02-14T23:59:59.000Z",

  comments: [
    {
      id: "comment-1",
      userId: "admin",
      userName: "David Chen - ChargeSource",
      message: "We've included optional weather protection canopies for the outdoor stations. These can be removed if not required to reduce the total cost.",
      timestamp: "2024-01-15T11:30:00.000Z",
      isInternal: false,
    },
    {
      id: "comment-2",
      userId: "client",
      userName: "Sarah Johnson",
      message: "Thanks for the detailed proposal. The weather protection looks necessary given our location. Can we discuss the maintenance package options?",
      timestamp: "2024-01-15T14:45:00.000Z",
      isInternal: false,
    },
  ],

  clientViews: [
    {
      id: "view-1",
      viewedAt: "2024-01-15T13:15:00.000Z",
      ipAddress: "203.123.45.67",
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    },
  ],

  templateId: "template-commercial",
  projectId: "proj-1",
  approvals: [],
};

export default function ClientPortalDemo() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [quote] = useState(demoQuote);
  const [showDecisionDialog, setShowDecisionDialog] = useState(false);
  const [decisionType, setDecisionType] = useState<"accepted" | "rejected" | null>(null);
  const [decisionComments, setDecisionComments] = useState("");
  const [newComment, setNewComment] = useState("");
  const [submittingDecision, setSubmittingDecision] = useState(false);

  const handleDecision = (decision: "accepted" | "rejected") => {
    setDecisionType(decision);
    setShowDecisionDialog(true);
  };

  const submitDecision = async () => {
    if (!decisionType) return;

    try {
      setSubmittingDecision(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      setShowDecisionDialog(false);
      setDecisionComments("");

      toast({
        title: decisionType === "accepted" ? "Quote Accepted" : "Quote Rejected",
        description: `Thank you for your ${decisionType === "accepted" ? "acceptance" : "feedback"}. We'll be in touch soon.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit your decision. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmittingDecision(false);
    }
  };

  const addComment = () => {
    if (!newComment.trim()) return;

    toast({
      title: "Comment added",
      description: "Your comment has been sent to the team.",
    });
    setNewComment("");
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "charger":
        return <Zap className="w-4 h-4" />;
      case "installation":
        return <Settings className="w-4 h-4" />;
      case "accessory":
        return <Package className="w-4 h-4" />;
      case "service":
        return <Users className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            <Logo size="xl" />
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              Client Portal Demo
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Quote Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {quote.title || `Quote ${quote.quoteNumber}`}
              </h1>
              <div className="flex items-center gap-4 text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Building className="w-4 h-4" />
                  {quote.clientInfo.company}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(quote.createdAt).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Valid until {new Date(quote.validUntil).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold mb-1">
                ${quote.totals.total.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">GST Included</div>
            </div>
          </div>

          {/* Status Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-800">Quote Under Review</span>
            </div>
            <p className="text-blue-700 mt-2">
              This quote is currently being reviewed by your team. You can accept, decline, or add comments below.
            </p>
          </div>
        </div>

        {/* Quote Content */}
        <div className="space-y-8">
          {/* Project Details */}
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <h3 className="font-medium text-lg">{quote.title}</h3>
              </div>
              <div className="text-muted-foreground mb-4">
                {quote.description}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Site Address</Label>
                  <p className="text-sm text-muted-foreground">
                    {quote.projectData.siteAddress}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Site Type</Label>
                  <p className="text-sm text-muted-foreground">
                    {quote.projectData.siteType}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card>
            <CardHeader>
              <CardTitle>Quote Items</CardTitle>
              <CardDescription>
                Detailed breakdown of products and services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {quote.lineItems.map((item) => (
                  <div key={item.id} className="p-4 border rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-muted rounded-lg">
                        {getTypeIcon(item.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium">{item.name}</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {item.description}
                            </p>
                            {item.specifications &&
                              Object.keys(item.specifications).length > 0 && (
                                <div className="mt-2 space-y-1">
                                  <p className="text-xs font-medium text-muted-foreground">
                                    Specifications:
                                  </p>
                                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                                    {Object.entries(item.specifications).map(
                                      ([key, value]) => (
                                        <div key={key}>
                                          <span className="font-medium">
                                            {key}:
                                          </span>{" "}
                                          {String(value)}
                                        </div>
                                      ),
                                    )}
                                  </div>
                                </div>
                              )}
                          </div>
                          <div className="text-right">
                            <div className="font-medium">
                              ${item.totalPrice.toLocaleString()}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {item.quantity} × ${item.unitPrice.toLocaleString()}
                            </div>
                          </div>
                        </div>
                        {item.isOptional && (
                          <Badge variant="outline" className="mt-2">
                            Optional
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quote Totals */}
              <div className="mt-8 border-t pt-6">
                <div className="flex justify-end">
                  <div className="w-64 space-y-3">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>${quote.totals.subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>GST (10%):</span>
                      <span>${quote.totals.gst.toLocaleString()}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span>${quote.totals.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Terms & Conditions */}
          <Card>
            <CardHeader>
              <CardTitle>Terms & Conditions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Payment Terms</Label>
                  <p className="text-sm text-muted-foreground">
                    {quote.settings.paymentTerms}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Warranty</Label>
                  <p className="text-sm text-muted-foreground">
                    {quote.settings.warranty}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Delivery Terms</Label>
                  <p className="text-sm text-muted-foreground">
                    {quote.settings.deliveryTerms}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Quote Validity</Label>
                  <p className="text-sm text-muted-foreground">
                    {quote.settings.validityDays} days from{" "}
                    {new Date(quote.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">General Terms</Label>
                <div className="text-sm text-muted-foreground mt-2 whitespace-pre-line">
                  {quote.settings.terms}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Additional Notes</Label>
                <div className="text-sm text-muted-foreground mt-2 whitespace-pre-line">
                  {quote.settings.notes}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comments Section */}
          <Card>
            <CardHeader>
              <CardTitle>Comments & Communication</CardTitle>
              <CardDescription>
                Communicate with our team about this quote
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Existing Comments */}
              <div className="space-y-4 mb-6">
                {quote.comments.map((comment) => (
                  <div key={comment.id} className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{comment.userName}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(comment.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm">{comment.message}</p>
                  </div>
                ))}
              </div>

              {/* Add Comment */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="comment">Add a comment or question</Label>
                  <Textarea
                    id="comment"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Ask questions or provide feedback about this quote..."
                    rows={3}
                  />
                </div>
                <Button onClick={addComment} disabled={!newComment.trim()}>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Add Comment
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="outline" className="flex-1 sm:flex-none">
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>

                <Button
                  variant="outline"
                  className="flex-1 sm:flex-none border-red-200 text-red-600 hover:bg-red-50"
                  onClick={() => handleDecision("rejected")}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Decline Quote
                </Button>
                
                <Button
                  className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700"
                  onClick={() => handleDecision("accepted")}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Accept Quote
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Decision Dialog */}
        <Dialog open={showDecisionDialog} onOpenChange={setShowDecisionDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {decisionType === "accepted" ? "Accept Quote" : "Decline Quote"}
              </DialogTitle>
              <DialogDescription>
                {decisionType === "accepted"
                  ? "By accepting this quote, you agree to proceed with the project as outlined."
                  : "Please let us know why you're declining this quote so we can better serve you in the future."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="decisionComments">
                  {decisionType === "accepted"
                    ? "Additional comments (optional)"
                    : "Reason for declining"}
                </Label>
                <Textarea
                  id="decisionComments"
                  value={decisionComments}
                  onChange={(e) => setDecisionComments(e.target.value)}
                  placeholder={
                    decisionType === "accepted"
                      ? "Any additional notes or requirements..."
                      : "Please tell us why this quote doesn't meet your needs..."
                  }
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDecisionDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={submitDecision}
                disabled={
                  submittingDecision ||
                  (decisionType === "rejected" && !decisionComments.trim())
                }
                className={
                  decisionType === "accepted"
                    ? "bg-green-600 hover:bg-green-700"
                    : ""
                }
              >
                {submittingDecision ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : decisionType === "accepted" ? (
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                ) : (
                  <XCircle className="w-4 h-4 mr-2" />
                )}
                {decisionType === "accepted" ? "Accept Quote" : "Decline Quote"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
