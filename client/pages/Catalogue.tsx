import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Filter, Package, Zap, Settings, Users, ShoppingCart, Eye, Star, Clock, CheckCircle, AlertTriangle, Plus } from 'lucide-react';
import { productCatalog, ProductFilter } from '@/lib/productCatalog';
import { ProductCatalogueItem } from '@/lib/quoteTypes';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/ui/logo';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import AdminProductManager from '@/components/AdminProductManager';

export default function Catalogue() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [filter, setFilter] = useState<ProductFilter>({ availability: 'all' });
  const [selectedProduct, setSelectedProduct] = useState<ProductCatalogueItem | null>(null);
  const [activeView, setActiveView] = useState<'grid' | 'list'>('grid');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const categories = productCatalog.getCategories();
  const brands = productCatalog.getBrands();
  const products = productCatalog.getProducts(filter);

  const updateFilter = (key: keyof ProductFilter, value: any) => {
    setFilter(prev => ({
      ...prev,
      [key]: value,
      ...(key === 'category' ? { subcategory: undefined } : {})
    }));
  };

  const clearFilters = () => {
    setFilter({ availability: 'all' });
    setActiveCategory('all');
  };

  const getAvailabilityStatus = (product: ProductCatalogueItem) => {
    if (product.inventory.available > 10) {
      return { status: 'in-stock', color: 'bg-green-100 text-green-800', icon: CheckCircle };
    } else if (product.inventory.available > 0) {
      return { status: 'low-stock', color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle };
    } else {
      return { status: 'back-order', color: 'bg-red-100 text-red-800', icon: Clock };
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'chargers':
        return <Zap className="w-4 h-4" />;
      case 'accessories':
        return <Package className="w-4 h-4" />;
      case 'infrastructure':
        return <Settings className="w-4 h-4" />;
      case 'services':
        return <Users className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const addToQuote = (product: ProductCatalogueItem) => {
    // For now, just show a success message
    // Later this could integrate with cart/quote functionality
    toast({
      title: "Added to Quote",
      description: `${product.name} has been added to your quote.`
    });
  };

  const filteredProducts = activeCategory === 'all' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Logo size="xl" />
              <div className="hidden md:block">
                <h1 className="text-xl font-semibold">Product Catalogue</h1>
              </div>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <a href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
                Dashboard
              </a>
              <a href="/projects" className="text-sm font-medium hover:text-primary transition-colors">
                Projects
              </a>
              <a href="/quotes" className="text-sm font-medium hover:text-primary transition-colors">
                Quotes
              </a>
            </nav>
          </div>
        </header>

        <div className="container mx-auto px-4 py-6">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">EV Charging Product Catalogue</h1>
            <p className="text-muted-foreground">
              Browse our comprehensive range of EV charging equipment, accessories, and services
            </p>
          </div>

          {/* Category Tabs */}
          <div className="mb-6">
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              <Button
                variant={activeCategory === 'all' ? 'default' : 'outline'}
                onClick={() => {
                  setActiveCategory('all');
                  updateFilter('category', undefined);
                }}
                className="whitespace-nowrap"
              >
                All Products ({products.length})
              </Button>
              {categories.map((category) => {
                const categoryProducts = productCatalog.getProducts({ category: category.id });
                return (
                  <Button
                    key={category.id}
                    variant={activeCategory === category.id ? 'default' : 'outline'}
                    onClick={() => {
                      setActiveCategory(category.id);
                      updateFilter('category', category.id);
                    }}
                    className="whitespace-nowrap flex items-center gap-2"
                  >
                    {getCategoryIcon(category.id)}
                    {category.name} ({categoryProducts.length})
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search products by name, brand, or description..."
                  value={filter.searchTerm || ''}
                  onChange={(e) => updateFilter('searchTerm', e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Select
                  value={filter.brand || 'all-brands'}
                  onValueChange={(value) => updateFilter('brand', value === 'all-brands' ? undefined : value)}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="All Brands" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-brands">All Brands</SelectItem>
                    {brands.map((brand) => (
                      <SelectItem key={brand} value={brand}>
                        {brand}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={filter.availability || 'all'}
                  onValueChange={(value) => updateFilter('availability', value as any)}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Availability" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Products</SelectItem>
                    <SelectItem value="in-stock">In Stock</SelectItem>
                    <SelectItem value="low-stock">Low Stock</SelectItem>
                    <SelectItem value="back-order">Back Order</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="flex items-center gap-2"
                >
                  <Filter className="w-4 h-4" />
                  Clear
                </Button>
              </div>
            </div>
          </div>

          {/* Results Header */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-muted-foreground">
              {filteredProducts.length} products found
              {activeCategory !== 'all' && (
                <span className="ml-2">
                  in {categories.find(c => c.id === activeCategory)?.name}
                </span>
              )}
            </p>
            <Tabs value={activeView} onValueChange={setActiveView as any}>
              <TabsList>
                <TabsTrigger value="grid">Grid</TabsTrigger>
                <TabsTrigger value="list">List</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Products Grid/List */}
          <Tabs value={activeView}>
            <TabsContent value="grid" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => {
                  const availability = getAvailabilityStatus(product);
                  const AvailabilityIcon = availability.icon;

                  return (
                    <Card key={product.id} className="group hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(product.category)}
                            <Badge variant="outline" className="text-xs">
                              {product.brand}
                            </Badge>
                          </div>
                          <Badge className={availability.color} variant="secondary">
                            <AvailabilityIcon className="w-3 h-3 mr-1" />
                            {product.inventory.available}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg leading-tight line-clamp-2">
                          {product.name}
                        </CardTitle>
                        <CardDescription className="text-sm line-clamp-2">
                          {product.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {/* Key Specifications */}
                          {product.specifications.powerRating && (
                            <div className="flex items-center gap-2 text-sm">
                              <Zap className="w-4 h-4 text-primary" />
                              <span className="font-medium">{product.specifications.powerRating}</span>
                            </div>
                          )}

                          {/* Pricing */}
                          <div className="flex items-baseline gap-2">
                            <span className="text-xl font-bold">
                              ${product.pricing.recommendedRetail.toLocaleString()}
                            </span>
                            {product.pricing.listPrice !== product.pricing.recommendedRetail && (
                              <span className="text-sm text-muted-foreground line-through">
                                ${product.pricing.listPrice.toLocaleString()}
                              </span>
                            )}
                          </div>

                          {/* Lead Time */}
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>{product.inventory.leadTime}</span>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedProduct(product)}
                              className="flex-1"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Details
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => addToQuote(product)}
                              disabled={product.inventory.available === 0}
                              className="flex-1"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add to Quote
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="list" className="mt-0">
              <div className="space-y-4">
                {filteredProducts.map((product) => {
                  const availability = getAvailabilityStatus(product);
                  const AvailabilityIcon = availability.icon;

                  return (
                    <Card key={product.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 flex-1">
                            <div className="flex items-center gap-2">
                              {getCategoryIcon(product.category)}
                              <Badge variant="outline" className="text-xs">
                                {product.brand}
                              </Badge>
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">{product.name}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {product.description}
                              </p>
                            </div>
                            {product.specifications.powerRating && (
                              <div className="flex items-center gap-2 text-sm">
                                <Zap className="w-4 h-4 text-primary" />
                                <span className="font-medium">{product.specifications.powerRating}</span>
                              </div>
                            )}
                            <div className="text-right">
                              <div className="text-xl font-bold">
                                ${product.pricing.recommendedRetail.toLocaleString()}
                              </div>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                <span>{product.inventory.leadTime}</span>
                              </div>
                            </div>
                            <Badge className={availability.color} variant="secondary">
                              <AvailabilityIcon className="w-3 h-3 mr-1" />
                              {product.inventory.available}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedProduct(product)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => addToQuote(product)}
                              disabled={product.inventory.available === 0}
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add to Quote
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>

          {/* Empty State */}
          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No products found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search criteria or filters
              </p>
              <Button onClick={clearFilters}>Clear all filters</Button>
            </div>
          )}
        </div>

        {/* Product Detail Modal */}
        {selectedProduct && (
          <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
              <DialogHeader>
                <DialogTitle>{selectedProduct.name}</DialogTitle>
                <DialogDescription>
                  {selectedProduct.brand} {selectedProduct.model}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {/* Product Image Placeholder */}
                  <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                    <Package className="w-16 h-16 text-muted-foreground" />
                  </div>

                  {/* Basic Info */}
                  <div className="space-y-2">
                    <h3 className="font-semibold">Product Information</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">SKU:</span>
                        <span className="ml-2 font-mono">{selectedProduct.sku}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Brand:</span>
                        <span className="ml-2">{selectedProduct.brand}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Model:</span>
                        <span className="ml-2">{selectedProduct.model}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Category:</span>
                        <span className="ml-2">{selectedProduct.category}</span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <h3 className="font-semibold">Description</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {selectedProduct.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Specifications */}
                  <div className="space-y-2">
                    <h3 className="font-semibold">Specifications</h3>
                    <div className="grid gap-2 text-sm">
                      {Object.entries(selectedProduct.specifications).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-muted-foreground capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}:
                          </span>
                          <span className="font-medium">
                            {Array.isArray(value) ? value.join(', ') : String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="space-y-2">
                    <h3 className="font-semibold">Pricing</h3>
                    <div className="grid gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">List Price:</span>
                        <span>${selectedProduct.pricing.listPrice.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Recommended Retail:</span>
                        <span className="font-bold text-lg">
                          ${selectedProduct.pricing.recommendedRetail.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Inventory */}
                  <div className="space-y-2">
                    <h3 className="font-semibold">Availability</h3>
                    <div className="grid gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Available:</span>
                        <span className="font-medium">{selectedProduct.inventory.available} units</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Lead Time:</span>
                        <span>{selectedProduct.inventory.leadTime}</span>
                      </div>
                    </div>
                  </div>

                  {/* Add to Quote */}
                  <div className="space-y-4 pt-4 border-t">
                    <Button
                      onClick={() => addToQuote(selectedProduct)}
                      disabled={selectedProduct.inventory.available === 0}
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add to Quote
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </ProtectedRoute>
  );
}
