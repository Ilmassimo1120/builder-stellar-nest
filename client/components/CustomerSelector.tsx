import { useState, useEffect } from 'react';
import { Customer } from '@shared/customer';
import { customerService } from '@/lib/services/customerService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Plus, 
  Search, 
  User, 
  Check, 
  ChevronsUpDown,
  Mail,
  Phone 
} from 'lucide-react';
import { CustomerForm } from './CustomerForm';
import { LoadingSpinner } from './LoadingSpinner';
import { cn } from '@/lib/utils';

interface CustomerSelectorProps {
  selectedCustomerId?: string;
  onCustomerSelect: (customer: Customer | null) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function CustomerSelector({
  selectedCustomerId,
  onCustomerSelect,
  placeholder = "Select customer...",
  className,
  disabled = false,
}: CustomerSelectorProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    if (selectedCustomerId) {
      const customer = customers.find(c => c.id === selectedCustomerId);
      setSelectedCustomer(customer || null);
    } else {
      setSelectedCustomer(null);
    }
  }, [selectedCustomerId, customers]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const result = await customerService.getCustomers({
        limit: 100,
        filters: {
          query: searchQuery || undefined,
        },
      });
      setCustomers(result);
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerCreated = async (customer: Customer) => {
    setShowCreateForm(false);
    await loadCustomers();
    handleCustomerSelect(customer);
    setOpen(false);
  };

  const handleCustomerSelect = (customer: Customer | null) => {
    setSelectedCustomer(customer);
    onCustomerSelect(customer);
    setOpen(false);
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

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (customer.company && customer.company.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}
          >
            {selectedCustomer ? (
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Avatar className="w-6 h-6">
                  <AvatarFallback className="text-xs">
                    {getInitials(selectedCustomer.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 text-left">
                  <div className="truncate font-medium">{selectedCustomer.name}</div>
                  {selectedCustomer.company && (
                    <div className="truncate text-xs text-muted-foreground">
                      {selectedCustomer.company}
                    </div>
                  )}
                </div>
                <Badge className={cn("text-xs", getSourceBadgeColor(selectedCustomer.source))}>
                  {selectedCustomer.source}
                </Badge>
              </div>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0">
          <Command>
            <div className="flex items-center border-b">
              <Search className="m-2 h-4 w-4 shrink-0 opacity-50" />
              <Input
                placeholder="Search customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 border-0 bg-transparent p-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0"
              />
            </div>
            <CommandList className="max-h-[300px]">
              {loading ? (
                <div className="p-4 text-center">
                  <LoadingSpinner className="w-4 h-4 mx-auto" />
                </div>
              ) : filteredCustomers.length > 0 ? (
                <CommandGroup>
                  {filteredCustomers.map((customer) => (
                    <CommandItem
                      key={customer.id}
                      value={customer.id}
                      onSelect={() => handleCustomerSelect(customer)}
                      className="flex items-center gap-3 p-3 cursor-pointer"
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs">
                          {getInitials(customer.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium truncate">{customer.name}</span>
                          <Badge className={cn("text-xs", getSourceBadgeColor(customer.source))}>
                            {customer.source}
                          </Badge>
                        </div>
                        {customer.company && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                            <Building2 className="w-3 h-3" />
                            <span className="truncate">{customer.company}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          {customer.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              <span className="truncate">{customer.email}</span>
                            </div>
                          )}
                          {customer.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              <span>{customer.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <Check
                        className={cn(
                          "ml-auto h-4 w-4",
                          selectedCustomer?.id === customer.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              ) : (
                <CommandEmpty className="py-6 text-center text-sm">
                  <User className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <div className="font-medium">No customers found</div>
                  <div className="text-muted-foreground">
                    {searchQuery ? 'Try a different search term' : 'No customers available'}
                  </div>
                </CommandEmpty>
              )}
              
              {/* Create New Customer Option */}
              <div className="border-t p-2">
                <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" className="w-full justify-start">
                      <Plus className="w-4 h-4 mr-2" />
                      Create new customer
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Create New Customer</DialogTitle>
                      <DialogDescription>
                        Add a new customer to your CRM
                      </DialogDescription>
                    </DialogHeader>
                    <CustomerForm onSave={handleCustomerCreated} />
                  </DialogContent>
                </Dialog>
              </div>

              {/* Clear Selection Option */}
              {selectedCustomer && (
                <div className="border-t p-2">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-muted-foreground"
                    onClick={() => handleCustomerSelect(null)}
                  >
                    Clear selection
                  </Button>
                </div>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
