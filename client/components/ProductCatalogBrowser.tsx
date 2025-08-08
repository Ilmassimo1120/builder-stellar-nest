import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Package, Zap, Settings, Users, ShoppingCart, Eye, Star, Clock, CheckCircle, AlertTriangle, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { productCatalog, ProductFilter } from '@/lib/productCatalog';
import { ProductCatalogueItem } from '@/lib/quoteTypes';

interface ProductCatalogBrowserProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (productId: string, quantity: number) => void;
  selectedCategory?: string;
  onCompareProducts?: (productIds: string[]) => void;
  maxCompareProducts?: number;
}

export default function ProductCatalogBrowser({
  isOpen,
  onClose,
  onAddProduct,
  selectedCategory,
  onCompareProducts,
  maxCompareProducts = 4
}: ProductCatalogBrowserProps) {
  const [filter, setFilter] = useState<ProductFilter>({
    category: selectedCategory,
    availability: 'all'
  });
  const [selectedProduct, setSelectedProduct] = useState<ProductCatalogueItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeView, setActiveView] = useState<'grid' | 'list'>('grid');
  const [compareProducts, setCompareProducts] = useState<string[]>([]);

  const categories = productCatalog.getCategories();
  const brands = productCatalog.getBrands();
  const powerRatings = productCatalog.getPowerRatings();
  const products = productCatalog.getProducts(filter);

  const filteredSubcategories = useMemo(() => {
    if (filter.category) {
      return productCatalog.getSubcategories(filter.category);
    }
    return [];
  }, [filter.category]);

  const updateFilter = (key: keyof ProductFilter, value: any) => {
    setFilter(prev => ({
      ...prev,
      [key]: value,
      // Reset subcategory when category changes
      ...(key === 'category' ? { subcategory: undefined } : {})
    }));
  };

  const clearFilters = () => {
    setFilter({
      category: selectedCategory,
      availability: 'all'
    });
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

  const handleAddToQuote = (product: ProductCatalogueItem) => {
    console.log('Adding product to quote:', { productId: product.id, quantity, product });
    onAddProduct(product.id, quantity);
    setQuantity(1);
    setSelectedProduct(null);
  };

  const toggleProductComparison = (productId: string) => {
    setCompareProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else if (prev.length < maxCompareProducts) {
        return [...prev, productId];
      } else {
        // Replace oldest product if at max capacity
        return [...prev.slice(1), productId];
      }
    });
  };

  const handleCompareProducts = () => {
    if (onCompareProducts && compareProducts.length > 1) {
      onCompareProducts(compareProducts);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Product Catalog</DialogTitle>
          <DialogDescription>
            Browse and select products for your quote
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col space-y-4 h-full">
          {/* Search and Filters */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search products..."
                  value={filter.searchTerm || ''}
                  onChange={(e) => updateFilter('searchTerm', e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={clearFilters}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Clear Filters
              </Button>
            </div>

            {/* Filter Controls */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Select
                value={filter.category || 'all-categories'}
                onValueChange={(value) => updateFilter('category', value === 'all-categories' ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-categories">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {filteredSubcategories.length > 0 && (
                <Select
                  value={filter.subcategory || 'all-subcategories'}
                  onValueChange={(value) => updateFilter('subcategory', value === 'all-subcategories' ? undefined : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Subcategories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-subcategories">All Subcategories</SelectItem>
                    {filteredSubcategories.map((subcategory) => (
                      <SelectItem key={subcategory.id} value={subcategory.id}>
                        {subcategory.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <Select
                value={filter.brand || 'all-brands'}
                onValueChange={(value) => updateFilter('brand', value === 'all-brands' ? undefined : value)}
              >
                <SelectTrigger>
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
                <SelectTrigger>
                  <SelectValue placeholder="Availability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  <SelectItem value="in-stock">In Stock</SelectItem>
                  <SelectItem value="low-stock">Low Stock</SelectItem>
                  <SelectItem value="back-order">Back Order</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results */}
          <div className="flex-1 overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                {products.length} products found
              </p>
              <Tabs value={activeView} onValueChange={setActiveView as any}>
                <TabsList>
                  <TabsTrigger value="grid">Grid</TabsTrigger>
                  <TabsTrigger value="list">List</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <Tabs value={activeView}>
              <TabsContent value="grid" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map((product) => {
                    const availability = getAvailabilityStatus(product);
                    const AvailabilityIcon = availability.icon;

                    return (
                      <Card key={product.id} className="relative group hover:shadow-md transition-shadow">
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
                              {product.inventory.available} available
                            </Badge>
                          </div>
                          <CardTitle className="text-lg leading-tight">
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
                              <span className="text-2xl font-bold">
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

                            <Separator />

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedProduct(product)}
                                  >
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Details
                                  </Button>
                                </DialogTrigger>
                              </Dialog>
                              <Button
                                size="sm"
                                onClick={() => handleAddToQuote(product)}
                                disabled={product.inventory.available === 0}
                              >
                                <ShoppingCart className="w-4 h-4 mr-2" />
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
                <div className="space-y-2">
                  {products.map((product) => {
                    const availability = getAvailabilityStatus(product);
                    const AvailabilityIcon = availability.icon;

                    return (
                      <Card key={product.id} className="hover:shadow-sm transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 flex-1">
                              <div className="flex items-center gap-2">
                                {getCategoryIcon(product.category)}
                                <Badge variant="outline" className="text-xs">
                                  {product.brand}
                                </Badge>
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold">{product.name}</h3>
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
                                <div className="text-lg font-bold">
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
                                onClick={() => handleAddToQuote(product)}
                                disabled={product.inventory.available === 0}
                              >
                                <ShoppingCart className="w-4 h-4 mr-2" />
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
          </div>
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
                    <div className="flex items-center gap-4">
                      <label className="text-sm font-medium">Quantity:</label>
                      <Input
                        type="number"
                        min="1"
                        max={selectedProduct.inventory.available}
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                        className="w-20"
                      />
                    </div>
                    <Button
                      onClick={() => handleAddToQuote(selectedProduct)}
                      disabled={selectedProduct.inventory.available === 0}
                      className="w-full"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add {quantity} to Quote
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
}
