import { useState, useEffect } from 'react';
import { Customer, CustomerListOptions } from '@shared/customer';
import { customerService } from '@/lib/services/customerService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  Plus,
  MoreHorizontal,
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Sync,
  Filter,
  Grid,
  List,
  Eye,
  Edit,
  Trash,
} from 'lucide-react';
import { CustomerForm } from './CustomerForm';
import { CustomerDetail } from './CustomerDetail';
import { LoadingSpinner } from './LoadingSpinner';
import { cn } from '@/lib/utils';

interface CustomerListProps {
  onCustomerSelect?: (customer: Customer) => void;
  selectedCustomerId?: string;
  compact?: boolean;
}

export function CustomerList({
  onCustomerSelect,
  selectedCustomerId,
  compact = false,
}: CustomerListProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, [searchQuery, sourceFilter, sortBy, sortOrder]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError(null);

      const options: CustomerListOptions = {
        filters: {
          query: searchQuery || undefined,
          source: sourceFilter === 'all' ? 'all' : sourceFilter as any,
        },
        sortBy: sortBy as any,
        sortOrder,
        limit: 100,
      };

      const result = await customerService.getCustomers(options);
      setCustomers(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      await customerService.sync();
      await loadCustomers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  const handleCustomerCreated = async (customer: Customer) => {
    setShowCreateForm(false);
    await loadCustomers();
    if (onCustomerSelect) {
      onCustomerSelect(customer);
    }
  };

  const handleCustomerUpdated = async () => {
    await loadCustomers();
  };

  const handleCustomerDeleted = async (customerId: string) => {
    try {
      await customerService.deleteCustomer(customerId);
      await loadCustomers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete customer');
    }
  };

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowDetail(true);
    if (onCustomerSelect) {
      onCustomerSelect(customer);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getSourceBadgeColor = (source: string) => {
    switch (source) {
      case 'hubspot': return 'bg-orange-100 text-orange-800';
      case 'pipedrive': return 'bg-green-100 text-green-800';
      case 'native': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && customers.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Customers</h2>
          <p className="text-muted-foreground">
            Manage your customer relationships and sync with CRM systems
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSync}
            disabled={syncing}
          >
            <Sync className={cn("w-4 h-4 mr-2", syncing && "animate-spin")} />
            Sync
          </Button>
          <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Customer
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Customer</DialogTitle>
                <DialogDescription>
                  Create a new customer record in your CRM system
                </DialogDescription>
              </DialogHeader>
              <CustomerForm onSave={handleCustomerCreated} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="native">Native</SelectItem>
                <SelectItem value="hubspot">HubSpot</SelectItem>
                <SelectItem value="pipedrive">Pipedrive</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="company">Company</SelectItem>
                <SelectItem value="createdAt">Created</SelectItem>
                <SelectItem value="updatedAt">Updated</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </Button>

            <div className="flex border rounded-md">
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('table')}
                className="border-0 rounded-none rounded-l-md"
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="border-0 rounded-none rounded-r-md"
              >
                <Grid className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="p-4">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Customer List */}
      {viewMode === 'table' ? (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow
                  key={customer.id}
                  className={cn(
                    "cursor-pointer hover:bg-muted/50",
                    selectedCustomerId === customer.id && "bg-muted"
                  )}
                  onClick={() => handleViewCustomer(customer)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs">
                          {getInitials(customer.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{customer.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {customer.email && (
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="w-3 h-3 text-muted-foreground" />
                          {customer.email}
                        </div>
                      )}
                      {customer.phone && (
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="w-3 h-3 text-muted-foreground" />
                          {customer.phone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {customer.company && (
                      <div className="flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-muted-foreground" />
                        {customer.company}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={getSourceBadgeColor(customer.source)}>
                      {customer.source}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {new Date(customer.createdAt).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewCustomer(customer)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleCustomerDeleted(customer.id)}
                        >
                          <Trash className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {customers.map((customer) => (
            <Card
              key={customer.id}
              className={cn(
                "cursor-pointer hover:shadow-md transition-shadow",
                selectedCustomerId === customer.id && "ring-2 ring-primary"
              )}
              onClick={() => handleViewCustomer(customer)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback>
                        {getInitials(customer.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{customer.name}</CardTitle>
                      {customer.company && (
                        <CardDescription>{customer.company}</CardDescription>
                      )}
                    </div>
                  </div>
                  <Badge className={getSourceBadgeColor(customer.source)}>
                    {customer.source}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2 text-sm">
                  {customer.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      {customer.email}
                    </div>
                  )}
                  {customer.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      {customer.phone}
                    </div>
                  )}
                  {customer.address?.city && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      {customer.address.city}
                      {customer.address.state && `, ${customer.address.state}`}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {customers.length === 0 && !loading && (
        <Card>
          <CardContent className="p-8 text-center">
            <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No customers found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery
                ? "Try adjusting your search criteria"
                : "Get started by adding your first customer"}
            </p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Customer
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Customer Detail Dialog */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <CustomerDetail
              customer={selectedCustomer}
              onUpdate={handleCustomerUpdated}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
