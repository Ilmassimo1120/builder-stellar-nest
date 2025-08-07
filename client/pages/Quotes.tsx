import React, { useState, useEffect, useMemo } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Link, useNavigate } from "react-router-dom";
import {
  PlugZap,
  Plus,
  Calendar,
  DollarSign,
  TrendingUp,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Eye,
  Edit,
  Copy,
  Trash2,
  MoreHorizontal,
  Users,
  Building,
  FileText,
  Settings,
  Bell,
  User,
  LogOut,
  Download,
  Send,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  Calculator,
  BarChart3,
  Share,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Quote, QuoteAnalytics, QuoteTemplate } from "@/lib/quoteTypes";
import { quoteService } from "@/lib/quoteService";

export default function Quotes() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [filteredQuotes, setFilteredQuotes] = useState<Quote[]>([]);
  const [templates, setTemplates] = useState<QuoteTemplate[]>([]);
  const [analytics, setAnalytics] = useState<QuoteAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("updated");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);

  // Load quotes and analytics
  useEffect(() => {
    loadQuotes();
    loadTemplates();
    loadAnalytics();
  }, []);

  // Filter and search quotes
  useEffect(() => {
    let filtered = [...quotes];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (quote) =>
          quote.quoteNumber.toLowerCase().includes(query) ||
          quote.clientInfo.name.toLowerCase().includes(query) ||
          quote.clientInfo.company.toLowerCase().includes(query) ||
          quote.title.toLowerCase().includes(query),
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((quote) => quote.status === statusFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case "quoteNumber":
          aValue = a.quoteNumber;
          bValue = b.quoteNumber;
          break;
        case "client":
          aValue = a.clientInfo.name || a.clientInfo.company;
          bValue = b.clientInfo.name || b.clientInfo.company;
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        case "total":
          aValue = a.totals.total;
          bValue = b.totals.total;
          break;
        case "created":
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case "updated":
        default:
          aValue = new Date(a.updatedAt);
          bValue = new Date(b.updatedAt);
          break;
      }

      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredQuotes(filtered);
  }, [quotes, searchQuery, statusFilter, sortBy, sortOrder]);

  const loadQuotes = async () => {
    try {
      setLoading(true);
      const allQuotes = quoteService.getAllQuotes();
      setQuotes(allQuotes);
    } catch (error) {
      console.error("Error loading quotes:", error);
      toast({
        title: "Error",
        description: "Failed to load quotes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const allTemplates = quoteService.getAllTemplates();
      setTemplates(allTemplates);
    } catch (error) {
      console.error("Error loading templates:", error);
    }
  };

  const loadAnalytics = async () => {
    try {
      const quoteAnalytics = quoteService.getQuoteAnalytics();
      setAnalytics(quoteAnalytics);
    } catch (error) {
      console.error("Error loading analytics:", error);
    }
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "draft":
        return <Edit className="w-4 h-4" />;
      case "pending_review":
        return <Clock className="w-4 h-4" />;
      case "sent":
        return <Send className="w-4 h-4" />;
      case "viewed":
        return <Eye className="w-4 h-4" />;
      case "accepted":
        return <CheckCircle2 className="w-4 h-4" />;
      case "rejected":
        return <AlertCircle className="w-4 h-4" />;
      case "expired":
        return <Clock className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const handleDeleteQuote = async (quoteId: string) => {
    if (!confirm("Are you sure you want to delete this quote?")) return;

    try {
      const success = quoteService.deleteQuote(quoteId);
      if (success) {
        await loadQuotes();
        await loadAnalytics();
        toast({
          title: "Quote deleted",
          description: "The quote has been successfully deleted.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete quote. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDuplicateQuote = async (quoteId: string) => {
    try {
      const duplicatedQuote = quoteService.duplicateQuote(quoteId);
      if (duplicatedQuote) {
        await loadQuotes();
        toast({
          title: "Quote duplicated",
          description: "A copy of the quote has been created.",
        });
        navigate(`/quotes/${duplicatedQuote.id}`);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to duplicate quote. Please try again.",
        variant: "destructive",
      });
    }
  };

  const createQuoteFromTemplate = (templateId: string) => {
    const newQuote = quoteService.createQuote(undefined, templateId);
    if (user) {
      newQuote.createdBy = user.id;
      quoteService.updateQuote(newQuote);
    }
    navigate(`/quotes/${newQuote.id}`);
    setShowTemplateSelector(false);
  };

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Logo size="xl" />
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/dashboard"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Dashboard
            </Link>
            <Link
              to="/projects"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Projects
            </Link>
            <Link to="/quotes" className="text-sm font-medium text-primary">
              Quotes
            </Link>
            <Link
              to="/catalogue"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Catalogue
            </Link>
          </nav>
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon">
              <Bell className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="w-5 h-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-8 h-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {user?.name?.charAt(0) || user?.firstName?.charAt(0) || "U"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logout}
                  className="text-red-600 focus:text-red-600"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Smart Quoting Engine</h1>
            <p className="text-muted-foreground">
              Create professional quotes with intelligent pricing and product
              selection
            </p>
          </div>
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTemplateSelector(true)}
            >
              <FileText className="w-4 h-4 mr-2" />
              From Template
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={loadQuotes}
              disabled={loading}
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button size="sm" asChild>
              <Link to="/quotes/new">
                <Plus className="w-4 h-4 mr-2" />
                New Quote
              </Link>
            </Button>
          </div>
        </div>

        {/* Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Quotes
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.totalQuotes}
                </div>
                <p className="text-xs text-muted-foreground">
                  +12% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Value
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${analytics.totalValue.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  +20% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Conversion Rate
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.conversionRate.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  +2.1% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Avg Quote Value
                </CardTitle>
                <Calculator className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${analytics.averageQuoteValue.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  +5% from last month
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters and Controls */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search quotes, clients, or quote numbers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending_review">
                      Pending Review
                    </SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="viewed">Viewed</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="updated">Last Updated</SelectItem>
                    <SelectItem value="created">Date Created</SelectItem>
                    <SelectItem value="quoteNumber">Quote Number</SelectItem>
                    <SelectItem value="client">Client</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                    <SelectItem value="total">Total Value</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                  }
                >
                  {sortOrder === "asc" ? (
                    <SortAsc className="w-4 h-4" />
                  ) : (
                    <SortDesc className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quotes Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading quotes...</p>
            </div>
          </div>
        ) : filteredQuotes.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
                <Calculator className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium mb-2">
                {searchQuery || statusFilter !== "all"
                  ? "No quotes match your filters"
                  : "No quotes yet"}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your search criteria or filters"
                  : "Create your first quote to get started"}
              </p>
              {!(searchQuery || statusFilter !== "all") && (
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowTemplateSelector(true)}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Use Template
                  </Button>
                  <Button asChild>
                    <Link to="/quotes/new">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Quote
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredQuotes.map((quote) => (
              <Card
                key={quote.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                      <div className="md:col-span-2">
                        <div className="flex items-center gap-3 mb-1">
                          {getStatusIcon(quote.status)}
                          <h3 className="font-medium">
                            {quote.title || `Quote ${quote.quoteNumber}`}
                          </h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {quote.clientInfo.company || quote.clientInfo.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {quote.quoteNumber}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge
                          className={getStatusColor(quote.status)}
                          variant="secondary"
                        >
                          {quote.status.replace("_", " ")}
                        </Badge>
                      </div>

                      <div className="space-y-1">
                        <div className="text-sm font-medium">
                          ${quote.totals.total.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {quote.lineItems.length} items
                        </div>
                      </div>

                      <div className="text-sm">
                        <div className="font-medium">
                          {quote.clientInfo.contactPerson}
                        </div>
                        <div className="text-muted-foreground">
                          {quote.clientInfo.email}
                        </div>
                      </div>

                      <div className="text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(quote.updatedAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Valid until{" "}
                          {new Date(quote.validUntil).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to={`/quotes/${quote.id}`}>
                            <Eye className="w-4 h-4 mr-2" />
                            View & Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDuplicateQuote(quote.id)}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="w-4 h-4 mr-2" />
                          Download PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Share className="w-4 h-4 mr-2" />
                          Share Link
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteQuote(quote.id)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Template Selector Dialog */}
        <Dialog
          open={showTemplateSelector}
          onOpenChange={setShowTemplateSelector}
        >
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Choose a Quote Template</DialogTitle>
              <DialogDescription>
                Start with a pre-configured template to speed up quote creation.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((template) => (
                <Card
                  key={template.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => createQuoteFromTemplate(template.id)}
                >
                  <CardHeader>
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span>Category:</span>
                        <Badge variant="outline">{template.category}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Items:</span>
                        <span>{template.lineItems.length} line items</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Used:</span>
                        <span>{template.usageCount} times</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowTemplateSelector(false)}
              >
                Cancel
              </Button>
              <Button asChild>
                <Link to="/quotes/new">Create Blank Quote</Link>
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
