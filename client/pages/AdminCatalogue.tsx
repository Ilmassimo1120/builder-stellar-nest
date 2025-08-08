import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Logo } from "@/components/ui/logo";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import AdminProductManager from "@/components/AdminProductManager";
import CategoryManager from "@/components/CategoryManager";
import { Shield, ArrowLeft, Package, Users, BarChart3, Folder, GripVertical, ChevronUp, ChevronDown } from "lucide-react";
import { productCatalog } from "@/lib/productCatalog";
import { categoryService } from "@/lib/categoryService";

export default function AdminCatalogue() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showProductManager, setShowProductManager] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [draggedCategory, setDraggedCategory] = useState<string | null>(null);
  const [dragOverCategory, setDragOverCategory] = useState<string | null>(null);

  // Force refresh when categories change
  const handleCategoriesChanged = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Category reordering handlers
  const handleDragStart = (e: React.DragEvent, categoryId: string) => {
    setDraggedCategory(categoryId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', categoryId);
  };

  const handleDragOver = (e: React.DragEvent, categoryId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCategory(categoryId);
  };

  const handleDragLeave = () => {
    setDragOverCategory(null);
  };

  const handleDrop = (e: React.DragEvent, targetCategoryId: string) => {
    e.preventDefault();
    setDragOverCategory(null);

    if (draggedCategory && draggedCategory !== targetCategoryId) {
      const categories = productCatalog.getCategories();
      const newOrder = [...categories];

      const draggedIndex = newOrder.findIndex(cat => cat.id === draggedCategory);
      const targetIndex = newOrder.findIndex(cat => cat.id === targetCategoryId);

      if (draggedIndex !== -1 && targetIndex !== -1) {
        // Remove dragged item and insert at target position
        const [draggedItem] = newOrder.splice(draggedIndex, 1);
        newOrder.splice(targetIndex, 0, draggedItem);

        // Update order in categoryService
        categoryService.reorderCategories(newOrder.map(cat => cat.id));
        handleCategoriesChanged();

        toast({
          title: "Success",
          description: "Category order updated successfully",
        });
      }
    }

    setDraggedCategory(null);
  };

  const handleMoveCategory = (categoryId: string, direction: 'up' | 'down') => {
    const success = direction === 'up'
      ? categoryService.moveCategoryUp(categoryId)
      : categoryService.moveCategoryDown(categoryId);

    if (success) {
      handleCategoriesChanged();
      toast({
        title: "Success",
        description: `Category moved ${direction} successfully`,
      });
    }
  };

  const products = productCatalog.getProducts();
  const activeProducts = products.filter((p) => p.isActive);
  const inactiveProducts = products.filter((p) => !p.isActive);
  const lowStockProducts = products.filter((p) => p.inventory.available <= 5);

  // Listen for category changes
  useEffect(() => {
    const handleCategoriesChanged = () => {
      setRefreshKey(prev => prev + 1);
    };

    window.addEventListener('categoriesChanged', handleCategoriesChanged);
    return () => {
      window.removeEventListener('categoriesChanged', handleCategoriesChanged);
    };
  }, []);

  // Admin role check
  if (user?.role !== "admin" && user?.role !== "global_admin") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Shield className="w-5 h-5" />
              Access Denied
            </CardTitle>
            <CardDescription>
              This page is restricted to administrators only.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <a href="/catalogue">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Catalogue
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Logo size="xl" />
              <div className="hidden md:block">
                <h1 className="text-xl font-semibold flex items-center gap-2">
                  <Shield className="w-5 h-5 text-red-600" />
                  Admin Catalogue Management
                </h1>
              </div>
            </div>
            <nav className="flex items-center space-x-6">
              <a
                href="/catalogue"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2 inline" />
                Back to Catalogue
              </a>
              <a
                href="/dashboard"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Dashboard
              </a>
            </nav>
          </div>
        </header>

        <div className="container mx-auto px-4 py-6">
          {/* Admin Dashboard */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              Product Catalogue Administration
            </h1>
            <p className="text-muted-foreground">
              Manage your product catalog - add, edit, and remove products
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Products
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{products.length}</div>
                <p className="text-xs text-muted-foreground">
                  {activeProducts.length} active, {inactiveProducts.length}{" "}
                  inactive
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Categories
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {productCatalog.getCategories().length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Product categories
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
                <Package className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {lowStockProducts.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Products with ≤5 units
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Brands</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {productCatalog.getBrands().length}
                </div>
                <p className="text-xs text-muted-foreground">Product brands</p>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mb-8">
            <Button
              onClick={() => setShowProductManager(true)}
              className="flex items-center gap-2"
            >
              <Package className="w-4 h-4" />
              Manage Products
            </Button>
            <Button
              onClick={() => setShowCategoryManager(true)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Folder className="w-4 h-4" />
              Manage Categories
            </Button>
          </div>

          {/* Low Stock Alert */}
          {lowStockProducts.length > 0 && (
            <Card className="mb-8 border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="text-yellow-800 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Low Stock Alert
                </CardTitle>
                <CardDescription className="text-yellow-700">
                  The following products have low inventory levels:
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {lowStockProducts.slice(0, 5).map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-2 bg-white rounded border"
                    >
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          SKU: {product.sku}
                        </p>
                      </div>
                      <Badge variant="destructive">
                        {product.inventory.available} units
                      </Badge>
                    </div>
                  ))}
                  {lowStockProducts.length > 5 && (
                    <p className="text-sm text-muted-foreground">
                      +{lowStockProducts.length - 5} more products with low
                      stock
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Categories Overview */}
          <Card key={`categories-${refreshKey}`}>
            <CardHeader>
              <CardTitle>Categories Overview</CardTitle>
              <CardDescription>
                Product distribution across categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {productCatalog.getCategories().map((category) => {
                  const categoryProducts = productCatalog.getProducts({
                    category: category.id,
                  });
                  return (
                    <div
                      key={category.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <h3 className="font-medium">{category.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {category.description}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {categoryProducts.length} products
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Product Manager */}
        <AdminProductManager
          isOpen={showProductManager}
          onClose={() => setShowProductManager(false)}
        />

        {/* Category Manager */}
        <CategoryManager
          isOpen={showCategoryManager}
          onClose={() => setShowCategoryManager(false)}
          onCategoriesChanged={handleCategoriesChanged}
        />
      </div>
    </ProtectedRoute>
  );
}
