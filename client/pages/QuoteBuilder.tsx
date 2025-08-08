import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useSearchParams, useLocation } from "react-router-dom";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Logo } from "@/components/ui/logo";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Save,
  Send,
  Download,
  Plus,
  Trash2,
  Edit,
  Copy,
  Calculator,
  FileText,
  Settings,
  Eye,
  Users,
  Package,
  DollarSign,
  Percent,
  Clock,
  CheckCircle2,
  AlertCircle,
  Share,
  Home,
  Building,
  Zap,
  MapPin,
  Target,
} from "lucide-react";
import {
  Quote,
  QuoteLineItem,
  QuoteTemplate,
  ProductCatalogueItem,
} from "@/lib/quoteTypes";
import { quoteService } from "@/lib/quoteService";

export default function QuoteBuilder() {
  const { quoteId } = useParams<{ quoteId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  // Determine if we're creating a new quote
  const isNewQuote = location.pathname === "/quotes/new" || quoteId === "new";

  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [selectedLineItem, setSelectedLineItem] = useState<string | null>(null);
  const [templates, setTemplates] = useState<QuoteTemplate[]>([]);
  const [productCatalogue, setProductCatalogue] = useState<
    ProductCatalogueItem[]
  >([]);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showProductCatalogue, setShowProductCatalogue] = useState(false);

  // Load quote data
  useEffect(() => {
    const loadQuote = async () => {
      try {
        if (isNewQuote) {
          // Create new quote
          const projectId = searchParams.get("project");
          const templateId = searchParams.get("template");

          console.log("Creating new quote with projectId:", projectId, "templateId:", templateId);

          const newQuote = quoteService.createQuote(
            projectId || undefined,
            templateId || undefined,
          );

          if (user) {
            newQuote.createdBy = user.id;
            quoteService.updateQuote(newQuote);
          }

          console.log("New quote created:", newQuote);
          setQuote(newQuote);
          setLoading(false);

          // Update URL to use the actual quote ID
          navigate(`/quotes/${newQuote.id}`, { replace: true });
        } else if (quoteId) {
          // Load existing quote
          console.log("Loading existing quote:", quoteId);
          const existingQuote = quoteService.getQuote(quoteId);
          if (existingQuote) {
            setQuote(existingQuote);
            setLoading(false);
          } else {
            console.error("Quote not found:", quoteId);
            toast({
              title: "Quote not found",
              description: "The quote you're looking for doesn't exist.",
              variant: "destructive",
            });
            navigate("/quotes");
          }
        } else {
          // This should not happen with proper routing
          console.error("Invalid quote route - no ID provided");
          toast({
            title: "Invalid route",
            description: "Invalid quote route. Redirecting to quotes page.",
            variant: "destructive",
          });
          navigate("/quotes");
        }

        // Load templates and product catalogue
        setTemplates(quoteService.getAllTemplates());
        setProductCatalogue(quoteService.getProductCatalogueItems());
      } catch (error) {
        console.error("Error loading quote:", error);
        toast({
          title: "Error loading quote",
          description: "There was an error loading the quote. Please try again.",
          variant: "destructive",
        });
        setLoading(false);
      }
    };

    loadQuote();

    // Add a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.error("Quote loading timed out");
        setError("Loading timed out. Please refresh the page.");
        setLoading(false);
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeoutId);
  }, [isNewQuote, quoteId, searchParams, navigate, user, toast, loading]);

  // Auto-save functionality
  const autoSave = useCallback(() => {
    if (quote && !saving) {
      setSaving(true);
      try {
        quoteService.updateQuote(quote);
        toast({
          title: "Quote saved",
          description: "Your changes have been automatically saved.",
        });
      } catch (error) {
        console.error("Auto-save failed:", error);
      } finally {
        setSaving(false);
      }
    }
  }, [quote, saving, toast]);

  // Auto-save when quote changes
  useEffect(() => {
    if (quote) {
      const timeoutId = setTimeout(autoSave, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [quote, autoSave]);

  // Update quote client information
  const updateClientInfo = (field: string, value: string) => {
    if (!quote) return;

    setQuote({
      ...quote,
      clientInfo: {
        ...quote.clientInfo,
        [field]: value,
      },
    });
  };

  // Update quote settings
  const updateQuoteSettings = (field: string, value: string | number) => {
    if (!quote) return;

    setQuote({
      ...quote,
      settings: {
        ...quote.settings,
        [field]: value,
      },
    });
  };

  // Add new line item
  const addLineItem = () => {
    if (!quote) return;

    const newLineItem: Omit<QuoteLineItem, "id" | "totalPrice"> = {
      type: "custom",
      name: "",
      description: "",
      category: "custom",
      quantity: 1,
      unitPrice: 0,
      cost: 0,
      markup: 35,
      unit: "each",
    };

    const updatedQuote = quoteService.addLineItem(quote.id, newLineItem);
    if (updatedQuote) {
      setQuote(updatedQuote);
      setActiveTab("items");
    }
  };

  // Update line item
  const updateLineItem = (
    lineItemId: string,
    updates: Partial<QuoteLineItem>,
  ) => {
    if (!quote) return;

    const updatedQuote = quoteService.updateLineItem(
      quote.id,
      lineItemId,
      updates,
    );
    if (updatedQuote) {
      setQuote(updatedQuote);
    }
  };

  // Remove line item
  const removeLineItem = (lineItemId: string) => {
    if (!quote) return;

    const updatedQuote = quoteService.removeLineItem(quote.id, lineItemId);
    if (updatedQuote) {
      setQuote(updatedQuote);
    }
  };

  // Apply template
  const applyTemplate = (templateId: string) => {
    if (!quote) return;

    const template = templates.find((t) => t.id === templateId);
    if (template) {
      const updatedQuote = quoteService.applyTemplate(quote, template);
      setQuote(updatedQuote);
      setShowTemplateSelector(false);
      toast({
        title: "Template applied",
        description: `Applied "${template.name}" template to quote.`,
      });
    }
  };

  // Add product from catalogue
  const addProduct = (productId: string, quantity: number = 1) => {
    if (!quote) return;

    const updatedQuote = quoteService.addProductToQuote(
      quote.id,
      productId,
      quantity,
    );
    if (updatedQuote) {
      setQuote(updatedQuote);
      setShowProductCatalogue(false);
      toast({
        title: "Product added",
        description: "Product has been added to the quote.",
      });
    }
  };

  // Send quote to client
  const sendQuote = async () => {
    if (!quote) return;

    try {
      setSaving(true);
      const updatedQuote = quoteService.sendQuote(quote.id);
      if (updatedQuote) {
        setQuote(updatedQuote);
        toast({
          title: "Quote sent",
          description: "The quote has been sent to the client.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send quote. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Generate PDF
  const generatePDF = () => {
    if (!quote) return;

    // This will be implemented with PDF generation
    toast({
      title: "Generating PDF",
      description: "Quote PDF will be downloaded shortly.",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "pending_review":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "sent":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "viewed":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "accepted":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "expired":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading quote builder...</p>
              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 text-sm">{error}</p>
                  <Button
                    onClick={() => window.location.reload()}
                    variant="outline"
                    size="sm"
                    className="mt-2"
                  >
                    Refresh Page
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Quote Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The quote you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <a href="/quotes">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Quotes
              </a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <a href="/quotes">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Quotes
              </a>
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <Logo size="xl" />
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor(quote.status)} variant="secondary">
              {quote.status}
            </Badge>
            <Button variant="outline" size="sm" onClick={generatePDF}>
              <Download className="w-4 h-4 mr-2" />
              PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTemplateSelector(true)}
            >
              <FileText className="w-4 h-4 mr-2" />
              Template
            </Button>
            <Button
              size="sm"
              onClick={sendQuote}
              disabled={saving || quote.status !== "draft"}
            >
              <Send className="w-4 h-4 mr-2" />
              {quote.status === "draft" ? "Send Quote" : "Sent"}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Quote Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {quote.title || `Quote ${quote.quoteNumber}`}
              </h1>
              <div className="flex items-center gap-4 text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Building className="w-4 h-4" />
                  {quote.clientInfo.company || quote.clientInfo.name}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {quote.clientInfo.contactPerson}
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
              <div className="text-sm text-muted-foreground">
                {quote.lineItems.length} items • GST included
              </div>
            </div>
          </div>

          {/* Progress indicator */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">
                    Subtotal
                  </div>
                  <div className="text-lg font-semibold">
                    ${quote.totals.subtotal.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">
                    Discount
                  </div>
                  <div className="text-lg font-semibold text-green-600">
                    -${quote.totals.discount.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">
                    GST (10%)
                  </div>
                  <div className="text-lg font-semibold">
                    ${quote.totals.gst.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">
                    Total
                  </div>
                  <div className="text-lg font-semibold text-primary">
                    ${quote.totals.total.toLocaleString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Quote Details</TabsTrigger>
            <TabsTrigger value="items">Line Items</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          {/* Quote Details Tab */}
          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Client Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Client Information
                    {quote.projectId && (
                      <Badge variant="secondary" className="text-xs">
                        <Home className="w-3 h-3 mr-1" />
                        From Project
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {quote.projectId
                      ? "Client details loaded from Project Management system"
                      : "Client contact details and billing information"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="clientName">Client Name</Label>
                      <Input
                        id="clientName"
                        value={quote.clientInfo.name}
                        onChange={(e) =>
                          updateClientInfo("name", e.target.value)
                        }
                        placeholder="Client name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactPerson">Contact Person</Label>
                      <Input
                        id="contactPerson"
                        value={quote.clientInfo.contactPerson}
                        onChange={(e) =>
                          updateClientInfo("contactPerson", e.target.value)
                        }
                        placeholder="Contact person"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={quote.clientInfo.email}
                        onChange={(e) =>
                          updateClientInfo("email", e.target.value)
                        }
                        placeholder="email@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={quote.clientInfo.phone}
                        onChange={(e) =>
                          updateClientInfo("phone", e.target.value)
                        }
                        placeholder="Phone number"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={quote.clientInfo.company}
                      onChange={(e) =>
                        updateClientInfo("company", e.target.value)
                      }
                      placeholder="Company name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      value={quote.clientInfo.address}
                      onChange={(e) =>
                        updateClientInfo("address", e.target.value)
                      }
                      placeholder="Full address"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="abn">ABN (optional)</Label>
                    <Input
                      id="abn"
                      value={quote.clientInfo.abn || ""}
                      onChange={(e) => updateClientInfo("abn", e.target.value)}
                      placeholder="Australian Business Number"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Project Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Project Information
                    {quote.projectData && (
                      <Badge variant="secondary" className="text-xs">
                        <Building className="w-3 h-3 mr-1" />
                        From Project
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {quote.projectData
                      ? "Project details loaded from Project Management system"
                      : "Project details and requirements"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="quoteTitle">Quote Title</Label>
                    <Input
                      id="quoteTitle"
                      value={quote.title}
                      onChange={(e) =>
                        setQuote({ ...quote, title: e.target.value })
                      }
                      placeholder="e.g., EV Charging Infrastructure Installation"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={quote.description}
                      onChange={(e) =>
                        setQuote({ ...quote, description: e.target.value })
                      }
                      placeholder="Detailed description of the project..."
                      rows={4}
                    />
                  </div>
                  {quote.projectData && (
                    <>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          Site Address
                          <Badge
                            variant="outline"
                            className="text-xs px-1 py-0"
                          >
                            Auto-filled
                          </Badge>
                        </Label>
                        <div className="p-3 bg-green-50 border border-green-200 rounded text-sm text-green-800">
                          <MapPin className="w-4 h-4 inline mr-2" />
                          {quote.projectData.siteAddress || "Not specified"}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            Site Type
                            <Badge
                              variant="outline"
                              className="text-xs px-1 py-0"
                            >
                              Auto-filled
                            </Badge>
                          </Label>
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                            <Building className="w-4 h-4 inline mr-2" />
                            {quote.projectData.siteType || "Not specified"}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            Project Name
                            <Badge
                              variant="outline"
                              className="text-xs px-1 py-0"
                            >
                              Auto-filled
                            </Badge>
                          </Label>
                          <div className="p-3 bg-purple-50 border border-purple-200 rounded text-sm text-purple-800">
                            <Zap className="w-4 h-4 inline mr-2" />
                            {quote.projectData.projectName || "Not specified"}
                          </div>
                        </div>
                      </div>
                      {quote.projectData.projectObjective && (
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            Project Objective
                            <Badge
                              variant="outline"
                              className="text-xs px-1 py-0"
                            >
                              Auto-filled
                            </Badge>
                          </Label>
                          <div className="p-3 bg-amber-50 border border-amber-200 rounded text-sm text-amber-800">
                            <Target className="w-4 h-4 inline mr-2" />
                            {quote.projectData.projectObjective}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Line Items Tab */}
          <TabsContent value="items" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Quote Line Items</h2>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowProductCatalogue(true)}
                >
                  <Package className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
                <Button onClick={addLineItem}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                {quote.lineItems.length === 0 ? (
                  <div className="p-8 text-center">
                    <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No items yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start building your quote by adding products or custom
                      items.
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setShowProductCatalogue(true)}
                      >
                        <Package className="w-4 h-4 mr-2" />
                        Browse Products
                      </Button>
                      <Button onClick={addLineItem}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Custom Item
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="divide-y">
                    {quote.lineItems.map((item, index) => (
                      <div key={item.id} className="p-4">
                        <div className="grid grid-cols-12 gap-4 items-start">
                          <div className="col-span-1 flex items-center justify-center pt-2">
                            {getTypeIcon(item.type)}
                          </div>
                          <div className="col-span-4">
                            <Input
                              value={item.name}
                              onChange={(e) =>
                                updateLineItem(item.id, {
                                  name: e.target.value,
                                })
                              }
                              placeholder="Item name"
                              className="font-medium mb-2"
                            />
                            <Textarea
                              value={item.description}
                              onChange={(e) =>
                                updateLineItem(item.id, {
                                  description: e.target.value,
                                })
                              }
                              placeholder="Item description"
                              rows={2}
                              className="text-sm"
                            />
                          </div>
                          <div className="col-span-1">
                            <Label className="text-xs text-muted-foreground">
                              Qty
                            </Label>
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) =>
                                updateLineItem(item.id, {
                                  quantity: parseFloat(e.target.value) || 1,
                                })
                              }
                              className="text-center"
                            />
                          </div>
                          <div className="col-span-2">
                            <Label className="text-xs text-muted-foreground">
                              Unit Price
                            </Label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                                $
                              </span>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.unitPrice}
                                onChange={(e) =>
                                  updateLineItem(item.id, {
                                    unitPrice: parseFloat(e.target.value) || 0,
                                  })
                                }
                                className="pl-6"
                              />
                            </div>
                          </div>
                          <div className="col-span-1">
                            <Label className="text-xs text-muted-foreground">
                              Markup
                            </Label>
                            <div className="relative">
                              <Input
                                type="number"
                                min="0"
                                max="200"
                                value={item.markup}
                                onChange={(e) =>
                                  updateLineItem(item.id, {
                                    markup: parseFloat(e.target.value) || 0,
                                  })
                                }
                                className="pr-6"
                              />
                              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                                %
                              </span>
                            </div>
                          </div>
                          <div className="col-span-2">
                            <Label className="text-xs text-muted-foreground">
                              Total
                            </Label>
                            <div className="text-lg font-semibold">
                              ${item.totalPrice.toLocaleString()}
                            </div>
                          </div>
                          <div className="col-span-1 flex justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeLineItem(item.id)}
                              className="text-red-600 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        {item.isOptional && (
                          <div className="mt-2">
                            <Badge variant="outline" className="text-xs">
                              Optional Item
                            </Badge>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quote Totals */}
            {quote.lineItems.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Quote Totals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>${quote.totals.subtotal.toLocaleString()}</span>
                    </div>
                    {quote.totals.discount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Discount</span>
                        <span>-${quote.totals.discount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span>GST (10%)</span>
                      <span>${quote.totals.gst.toLocaleString()}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span>${quote.totals.total.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quote Settings</CardTitle>
                  <CardDescription>
                    Configure quote validity, terms, and conditions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="validityDays">Validity Period (days)</Label>
                    <Input
                      id="validityDays"
                      type="number"
                      min="1"
                      max="365"
                      value={quote.settings.validityDays}
                      onChange={(e) =>
                        updateQuoteSettings(
                          "validityDays",
                          parseInt(e.target.value) || 30,
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paymentTerms">Payment Terms</Label>
                    <Input
                      id="paymentTerms"
                      value={quote.settings.paymentTerms}
                      onChange={(e) =>
                        updateQuoteSettings("paymentTerms", e.target.value)
                      }
                      placeholder="e.g., 30 days net"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="warranty">Warranty</Label>
                    <Input
                      id="warranty"
                      value={quote.settings.warranty}
                      onChange={(e) =>
                        updateQuoteSettings("warranty", e.target.value)
                      }
                      placeholder="e.g., 12 months parts and labour"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deliveryTerms">Delivery Terms</Label>
                    <Input
                      id="deliveryTerms"
                      value={quote.settings.deliveryTerms}
                      onChange={(e) =>
                        updateQuoteSettings("deliveryTerms", e.target.value)
                      }
                      placeholder="e.g., 5-10 business days"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Terms & Conditions</CardTitle>
                  <CardDescription>
                    Legal terms and project notes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="terms">Terms & Conditions</Label>
                    <Textarea
                      id="terms"
                      value={quote.settings.terms}
                      onChange={(e) =>
                        updateQuoteSettings("terms", e.target.value)
                      }
                      placeholder="Payment terms, cancellation policy, etc."
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Additional Notes</Label>
                    <Textarea
                      id="notes"
                      value={quote.settings.notes}
                      onChange={(e) =>
                        updateQuoteSettings("notes", e.target.value)
                      }
                      placeholder="Special instructions, project notes, etc."
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quote Preview</CardTitle>
                <CardDescription>
                  Preview how the quote will appear to your client
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-white border rounded-lg p-8 max-w-4xl mx-auto">
                  {/* Quote Header */}
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        QUOTATION
                      </h1>
                      <p className="text-gray-600">
                        Quote #{quote.quoteNumber}
                      </p>
                      <p className="text-gray-600">
                        Date: {new Date().toLocaleDateString()}
                      </p>
                      <p className="text-gray-600">
                        Valid until:{" "}
                        {new Date(quote.validUntil).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-gray-900">
                        ${quote.totals.total.toLocaleString()}
                      </div>
                      <p className="text-gray-600">GST Included</p>
                    </div>
                  </div>

                  {/* Client Information */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Bill To:
                    </h3>
                    <div className="text-gray-700">
                      <p className="font-medium">{quote.clientInfo.company}</p>
                      <p>{quote.clientInfo.contactPerson}</p>
                      <p>{quote.clientInfo.email}</p>
                      <p>{quote.clientInfo.phone}</p>
                      <div className="mt-2 whitespace-pre-line">
                        {quote.clientInfo.address}
                      </div>
                    </div>
                  </div>

                  {/* Project Information */}
                  {(quote.title || quote.description) && (
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Project Details:
                      </h3>
                      {quote.title && (
                        <p className="font-medium text-gray-900">
                          {quote.title}
                        </p>
                      )}
                      {quote.description && (
                        <p className="text-gray-700 mt-2">
                          {quote.description}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Line Items */}
                  {quote.lineItems.length > 0 && (
                    <div className="mb-8">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b-2 border-gray-200">
                            <th className="text-left py-2 text-gray-900">
                              Description
                            </th>
                            <th className="text-center py-2 text-gray-900">
                              Qty
                            </th>
                            <th className="text-right py-2 text-gray-900">
                              Unit Price
                            </th>
                            <th className="text-right py-2 text-gray-900">
                              Total
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {quote.lineItems.map((item) => (
                            <tr
                              key={item.id}
                              className="border-b border-gray-100"
                            >
                              <td className="py-3">
                                <div className="font-medium text-gray-900">
                                  {item.name}
                                </div>
                                {item.description && (
                                  <div className="text-sm text-gray-600 mt-1">
                                    {item.description}
                                  </div>
                                )}
                              </td>
                              <td className="text-center py-3 text-gray-700">
                                {item.quantity}
                              </td>
                              <td className="text-right py-3 text-gray-700">
                                ${item.unitPrice.toLocaleString()}
                              </td>
                              <td className="text-right py-3 text-gray-900 font-medium">
                                ${item.totalPrice.toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {/* Totals */}
                      <div className="mt-6 flex justify-end">
                        <div className="w-64">
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-700">Subtotal:</span>
                              <span className="text-gray-900">
                                ${quote.totals.subtotal.toLocaleString()}
                              </span>
                            </div>
                            {quote.totals.discount > 0 && (
                              <div className="flex justify-between text-green-600">
                                <span>Discount:</span>
                                <span>
                                  -${quote.totals.discount.toLocaleString()}
                                </span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-gray-700">GST (10%):</span>
                              <span className="text-gray-900">
                                ${quote.totals.gst.toLocaleString()}
                              </span>
                            </div>
                            <div className="border-t pt-2">
                              <div className="flex justify-between font-bold text-lg">
                                <span className="text-gray-900">Total:</span>
                                <span className="text-gray-900">
                                  ${quote.totals.total.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Terms */}
                  {quote.settings.terms && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Terms & Conditions:
                      </h3>
                      <div className="text-gray-700 whitespace-pre-line">
                        {quote.settings.terms}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {quote.settings.notes && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Notes:
                      </h3>
                      <div className="text-gray-700 whitespace-pre-line">
                        {quote.settings.notes}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-center gap-4">
                  <Button variant="outline" onClick={generatePDF}>
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button
                    onClick={sendQuote}
                    disabled={quote.status !== "draft"}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send to Client
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Auto-save indicator */}
      {saving && (
        <div className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Saving...
          </div>
        </div>
      )}
    </div>
  );
}
