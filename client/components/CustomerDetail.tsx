import { useState, useEffect } from "react";
import { Customer, CustomerDeal, CustomerContact } from "@shared/customer";
import { customerService } from "@/lib/services/customerService";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  DollarSign,
  TrendingUp,
  MessageSquare,
  Plus,
  ExternalLink,
  Tag,
} from "lucide-react";
import { CustomerForm } from "./CustomerForm";
import { LoadingSpinner } from "./LoadingSpinner";
import { cn } from "@/lib/utils";

interface CustomerDetailProps {
  customer: Customer;
  onUpdate?: () => void;
}

export function CustomerDetail({ customer, onUpdate }: CustomerDetailProps) {
  const [deals, setDeals] = useState<CustomerDeal[]>([]);
  const [contacts, setContacts] = useState<CustomerContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditForm, setShowEditForm] = useState(false);

  useEffect(() => {
    loadCustomerData();
  }, [customer.id]);

  const loadCustomerData = async () => {
    try {
      setLoading(true);
      const [dealsData, contactsData] = await Promise.all([
        customerService.getCustomerDeals(customer.id),
        customerService.getCustomerContacts(customer.id),
      ]);
      setDeals(dealsData);
      setContacts(contactsData);
    } catch (error) {
      console.error("Error loading customer data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerUpdated = () => {
    setShowEditForm(false);
    if (onUpdate) {
      onUpdate();
    }
    loadCustomerData();
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getSourceBadgeColor = (source: string) => {
    switch (source) {
      case "hubspot":
        return "bg-orange-100 text-orange-800";
      case "pipedrive":
        return "bg-green-100 text-green-800";
      case "native":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getDealStageColor = (stage: string) => {
    switch (stage.toLowerCase()) {
      case "new":
        return "bg-blue-100 text-blue-800";
      case "qualified":
        return "bg-yellow-100 text-yellow-800";
      case "proposal":
        return "bg-orange-100 text-orange-800";
      case "negotiation":
        return "bg-purple-100 text-purple-800";
      case "closed_won":
        return "bg-green-100 text-green-800";
      case "closed_lost":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getContactTypeIcon = (type: string) => {
    switch (type) {
      case "email":
        return <Mail className="w-4 h-4" />;
      case "phone":
        return <Phone className="w-4 h-4" />;
      case "meeting":
        return <Calendar className="w-4 h-4" />;
      case "note":
        return <MessageSquare className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  const totalDealValue = deals.reduce((sum, deal) => sum + deal.value, 0);
  const activeDealCount = deals.filter(
    (deal) => !["closed_won", "closed_lost"].includes(deal.stage),
  ).length;

  return (
    <div className="space-y-6">
      {/* Customer Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarFallback className="text-lg">
                  {getInitials(customer.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold">{customer.name}</h2>
                {customer.company && (
                  <p className="text-lg text-muted-foreground">
                    {customer.company}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={getSourceBadgeColor(customer.source)}>
                    {customer.source}
                  </Badge>
                  {customer.externalId && (
                    <Badge variant="outline">ID: {customer.externalId}</Badge>
                  )}
                </div>
              </div>
            </div>
            <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Customer</DialogTitle>
                  <DialogDescription>
                    Update customer information
                  </DialogDescription>
                </DialogHeader>
                <CustomerForm
                  customer={customer}
                  onSave={handleCustomerUpdated}
                  onCancel={() => setShowEditForm(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">
                Contact Information
              </h4>
              <div className="space-y-2">
                {customer.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{customer.email}</span>
                  </div>
                )}
                {customer.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{customer.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {customer.address && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">
                  Address
                </h4>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div className="text-sm">
                    {customer.address.street && (
                      <div>{customer.address.street}</div>
                    )}
                    {(customer.address.city || customer.address.state) && (
                      <div>
                        {customer.address.city}
                        {customer.address.city &&
                          customer.address.state &&
                          ", "}
                        {customer.address.state} {customer.address.postalCode}
                      </div>
                    )}
                    {customer.address.country && (
                      <div>{customer.address.country}</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">
                Activity
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  Created: {new Date(customer.createdAt).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  Updated: {new Date(customer.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            {customer.tags.length > 0 && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">
                  Tags
                </h4>
                <div className="flex flex-wrap gap-1">
                  {customer.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Deal Value
                </p>
                <p className="text-xl font-semibold">
                  ${totalDealValue.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Active Deals</p>
                <p className="text-xl font-semibold">{activeDealCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Interactions</p>
                <p className="text-xl font-semibold">{contacts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Content */}
      <Tabs defaultValue="deals" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="deals">Deals ({deals.length})</TabsTrigger>
          <TabsTrigger value="contacts">
            Activity ({contacts.length})
          </TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
        </TabsList>

        <TabsContent value="deals" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Deals & Opportunities</h3>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New Deal
            </Button>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : deals.length > 0 ? (
            <div className="space-y-3">
              {deals.map((deal) => (
                <Card key={deal.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{deal.title}</h4>
                          <Badge className={getDealStageColor(deal.stage)}>
                            {deal.stage.replace("_", " ")}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>${deal.value.toLocaleString()}</span>
                          <span>{deal.probability}% probability</span>
                          {deal.expectedCloseDate && (
                            <span>
                              Expected:{" "}
                              {new Date(
                                deal.expectedCloseDate,
                              ).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      {deal.externalId && (
                        <Button variant="ghost" size="sm" aria-label="Open external deal">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No deals yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create the first deal for this customer
                </p>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Deal
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="contacts" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Contact History</h3>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Note
            </Button>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : contacts.length > 0 ? (
            <div className="space-y-3">
              {contacts.map((contact) => (
                <Card key={contact.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-muted rounded-lg">
                        {getContactTypeIcon(contact.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{contact.subject}</h4>
                          <Badge variant="outline" className="text-xs">
                            {contact.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {contact.content}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(contact.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No activity yet</h3>
                <p className="text-muted-foreground mb-4">
                  Add the first interaction with this customer
                </p>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Note
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Related Projects</h3>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Link Project
            </Button>
          </div>

          <Card>
            <CardContent className="p-8 text-center">
              <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No projects linked</h3>
              <p className="text-muted-foreground mb-4">
                Connect this customer to their projects
              </p>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Link Project
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
