import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
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
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  FileText,
  DollarSign,
  Zap,
  Settings,
  Package,
  Users,
  AlertCircle,
  CheckCircle,
  Eye,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { useToast } from "@/hooks/use-toast";
import { Quote, QuoteComment, ClientDecision } from "@/lib/quoteTypes";
import { quoteService } from "@/lib/quoteService";

export default function ClientPortal() {
  const { quoteId } = useParams<{ quoteId: string }>();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDecisionDialog, setShowDecisionDialog] = useState(false);
  const [decisionType, setDecisionType] = useState<'accepted' | 'rejected' | null>(null);
  const [decisionComments, setDecisionComments] = useState("");
  const [newComment, setNewComment] = useState("");
  const [submittingDecision, setSubmittingDecision] = useState(false);
  const [viewStartTime] = useState(Date.now());

  // Access token from URL params
  const accessToken = searchParams.get("token");

  useEffect(() => {
    if (quoteId && accessToken) {
      loadQuote();
      // Track quote view
      trackQuoteView();
    } else {
      setLoading(false);
    }
  }, [quoteId, accessToken]);

  const loadQuote = async () => {
    try {
      setLoading(true);
      
      // In a real implementation, this would validate the access token
      // For now, we'll just load the quote directly
      const quoteData = quoteService.getQuote(quoteId!);
      
      if (quoteData) {
        setQuote(quoteData);
      } else {
        toast({
          title: "Quote not found",
          description: "The quote you're looking for doesn't exist or has expired.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error loading quote:', error);
      toast({
        title: "Error",
        description: "Failed to load quote. Please check the link and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const trackQuoteView = () => {
    if (!quote) return;

    // Track quote view for analytics
    const viewData = {
      id: `view-${Date.now()}`,
      viewedAt: new Date().toISOString(),
      ipAddress: '0.0.0.0', // Would be actual IP in production
      userAgent: navigator.userAgent,
    };

    // Update quote with view tracking
    const updatedQuote = {
      ...quote,
      clientViews: [...quote.clientViews, viewData],
      status: quote.status === 'sent' ? 'viewed' : quote.status,
    };

    quoteService.updateQuote(updatedQuote);
  };

  const handleDecision = (decision: 'accepted' | 'rejected') => {
    setDecisionType(decision);
    setShowDecisionDialog(true);
  };

  const submitDecision = async () => {
    if (!quote || !decisionType) return;

    try {
      setSubmittingDecision(true);

      const clientDecision: ClientDecision = {
        quoteId: quote.id,
        decision: decisionType,
        timestamp: new Date().toISOString(),
        comments: decisionComments,
      };

      let updatedQuote;
      if (decisionType === 'accepted') {
        updatedQuote = quoteService.acceptQuote(quote.id, clientDecision);
      } else {
        updatedQuote = quoteService.rejectQuote(quote.id, clientDecision);
      }

      if (updatedQuote) {
        setQuote(updatedQuote);
        setShowDecisionDialog(false);
        setDecisionComments("");
        
        toast({
          title: decisionType === 'accepted' ? "Quote Accepted" : "Quote Rejected",
          description: `Thank you for your ${decisionType === 'accepted' ? 'acceptance' : 'feedback'}. We'll be in touch soon.`,
        });
      }
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
    if (!newComment.trim() || !quote) return;

    const comment: QuoteComment = {
      id: `comment-${Date.now()}`,
      userId: 'client',
      userName: quote.clientInfo.contactPerson || 'Client',
      message: newComment,
      timestamp: new Date().toISOString(),
      isInternal: false,
    };

    const updatedQuote = {
      ...quote,
      comments: [...quote.comments, comment],
    };

    quoteService.updateQuote(updatedQuote);
    setQuote(updatedQuote);
    setNewComment("");

    toast({
      title: "Comment added",
      description: "Your comment has been sent to the team.",
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'charger':
        return <Zap className="w-4 h-4" />;
      case 'installation':
        return <Settings className="w-4 h-4" />;
      case 'accessory':
        return <Package className="w-4 h-4" />;
      case 'service':
        return <Users className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const isQuoteExpired = (quote: Quote) => {
    return new Date(quote.validUntil) < new Date();
  };

  const canMakeDecision = (quote: Quote) => {
    return ['sent', 'viewed'].includes(quote.status) && !isQuoteExpired(quote);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading quote...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!quote || !accessToken) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Access Required</h2>
            <p className="text-muted-foreground mb-4">
              This quote requires a valid access link. Please check your email for the correct link.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Logo size="lg" />
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              Client Portal
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
              <div className="text-sm text-muted-foreground">
                GST Included
              </div>
            </div>
          </div>

          {/* Status Banner */}
          {quote.status === 'accepted' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">Quote Accepted</span>
              </div>
              <p className="text-green-700 mt-2">
                Thank you for accepting this quote. Our team will contact you soon to proceed with the project.
              </p>
            </div>
          )}

          {quote.status === 'rejected' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <span className="font-medium text-red-800">Quote Declined</span>
              </div>
              <p className="text-red-700 mt-2">
                We understand this quote didn't meet your requirements. Please feel free to contact us to discuss alternatives.
              </p>
            </div>
          )}

          {isQuoteExpired(quote) && quote.status !== 'accepted' && quote.status !== 'rejected' && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                <span className="font-medium text-orange-800">Quote Expired</span>
              </div>
              <p className="text-orange-700 mt-2">
                This quote has expired. Please contact us for an updated quote.
              </p>
            </div>
          )}
        </div>

        {/* Quote Content */}
        <div className="space-y-8">
          {/* Project Details */}
          {(quote.title || quote.description) && (
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
              </CardHeader>
              <CardContent>
                {quote.title && (
                  <div className="mb-4">
                    <h3 className="font-medium text-lg">{quote.title}</h3>
                  </div>
                )}
                {quote.description && (
                  <div className="text-muted-foreground">{quote.description}</div>
                )}
                {quote.projectData && (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {quote.projectData.siteAddress && (
                      <div>
                        <Label className="text-sm font-medium">Site Address</Label>
                        <p className="text-sm text-muted-foreground">{quote.projectData.siteAddress}</p>
                      </div>
                    )}
                    {quote.projectData.siteType && (
                      <div>
                        <Label className="text-sm font-medium">Site Type</Label>
                        <p className="text-sm text-muted-foreground">{quote.projectData.siteType}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

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
                            {item.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {item.description}
                              </p>
                            )}
                            {item.specifications && Object.keys(item.specifications).length > 0 && (
                              <div className="mt-2 space-y-1">
                                <p className="text-xs font-medium text-muted-foreground">Specifications:</p>
                                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                                  {Object.entries(item.specifications).map(([key, value]) => (
                                    <div key={key}>
                                      <span className="font-medium">{key}:</span> {String(value)}
                                    </div>
                                  ))}
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
                    {quote.totals.discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount:</span>
                        <span>-${quote.totals.discount.toLocaleString()}</span>
                      </div>
                    )}
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
                  <p className="text-sm text-muted-foreground">{quote.settings.paymentTerms}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Warranty</Label>
                  <p className="text-sm text-muted-foreground">{quote.settings.warranty}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Delivery Terms</Label>
                  <p className="text-sm text-muted-foreground">{quote.settings.deliveryTerms}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Quote Validity</Label>
                  <p className="text-sm text-muted-foreground">
                    {quote.settings.validityDays} days from {new Date(quote.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              {quote.settings.terms && (
                <div>
                  <Label className="text-sm font-medium">General Terms</Label>
                  <div className="text-sm text-muted-foreground mt-2 whitespace-pre-line">
                    {quote.settings.terms}
                  </div>
                </div>
              )}

              {quote.settings.notes && (
                <div>
                  <Label className="text-sm font-medium">Additional Notes</Label>
                  <div className="text-sm text-muted-foreground mt-2 whitespace-pre-line">
                    {quote.settings.notes}
                  </div>
                </div>
              )}
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
              {quote.comments.filter(c => !c.isInternal).length > 0 && (
                <div className="space-y-4 mb-6">
                  {quote.comments.filter(c => !c.isInternal).map((comment) => (
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
              )}

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
                
                {canMakeDecision(quote) && (
                  <>
                    <Button
                      variant="outline"
                      className="flex-1 sm:flex-none border-red-200 text-red-600 hover:bg-red-50"
                      onClick={() => handleDecision('rejected')}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Decline Quote
                    </Button>
                    <Button
                      className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700"
                      onClick={() => handleDecision('accepted')}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Accept Quote
                    </Button>
                  </>
                )}

                {!canMakeDecision(quote) && quote.status !== 'accepted' && quote.status !== 'rejected' && (
                  <div className="text-center text-muted-foreground">
                    {isQuoteExpired(quote) 
                      ? "This quote has expired. Please contact us for an updated quote."
                      : "Quote decision already submitted."
                    }
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Decision Dialog */}
        <Dialog open={showDecisionDialog} onOpenChange={setShowDecisionDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {decisionType === 'accepted' ? 'Accept Quote' : 'Decline Quote'}
              </DialogTitle>
              <DialogDescription>
                {decisionType === 'accepted' 
                  ? 'By accepting this quote, you agree to proceed with the project as outlined.'
                  : 'Please let us know why you\'re declining this quote so we can better serve you in the future.'
                }
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="decisionComments">
                  {decisionType === 'accepted' ? 'Additional comments (optional)' : 'Reason for declining'}
                </Label>
                <Textarea
                  id="decisionComments"
                  value={decisionComments}
                  onChange={(e) => setDecisionComments(e.target.value)}
                  placeholder={
                    decisionType === 'accepted' 
                      ? 'Any additional notes or requirements...'
                      : 'Please tell us why this quote doesn\'t meet your needs...'
                  }
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDecisionDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={submitDecision}
                disabled={submittingDecision || (decisionType === 'rejected' && !decisionComments.trim())}
                className={decisionType === 'accepted' ? 'bg-green-600 hover:bg-green-700' : ''}
              >
                {submittingDecision ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : decisionType === 'accepted' ? (
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                ) : (
                  <XCircle className="w-4 h-4 mr-2" />
                )}
                {decisionType === 'accepted' ? 'Accept Quote' : 'Decline Quote'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
