import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import {
  Settings,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Package,
  Folder,
  RefreshCw,
  Download,
  Upload,
} from "lucide-react";
import { productCatalog } from "@/lib/productCatalog";
import { userPreferencesService } from "@/lib/userPreferencesService";

interface UserPreferencesManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserPreferencesManager({
  isOpen,
  onClose,
}: UserPreferencesManagerProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Drag state
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverItem, setDragOverItem] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("categories");

  const userId = user?.id || "anonymous";

  const refreshData = () => {
    setRefreshKey((prev) => prev + 1);
  };

  // Category handlers
  const handleCategoryDragStart = (e: React.DragEvent, categoryId: string) => {
    setDraggedItem(categoryId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleCategoryDragOver = (e: React.DragEvent, categoryId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverItem(categoryId);
  };

  const handleCategoryDragLeave = () => {
    setDragOverItem(null);
  };

  const handleCategoryDrop = (e: React.DragEvent, targetCategoryId: string) => {
    e.preventDefault();
    setDragOverItem(null);

    if (draggedItem && draggedItem !== targetCategoryId) {
      const categories = productCatalog.getCategories(userId);
      const newOrder = [...categories];

      const draggedIndex = newOrder.findIndex((cat) => cat.id === draggedItem);
      const targetIndex = newOrder.findIndex(
        (cat) => cat.id === targetCategoryId,
      );

      if (draggedIndex !== -1 && targetIndex !== -1) {
        const [draggedCat] = newOrder.splice(draggedIndex, 1);
        newOrder.splice(targetIndex, 0, draggedCat);

        if (
          productCatalog.reorderCategoriesForUser(
            userId,
            newOrder.map((cat) => cat.id),
          )
        ) {
          refreshData();
          toast({
            title: "Success",
            description: "Category order updated successfully",
          });
        }
      }
    }

    setDraggedItem(null);
  };

  const handleMoveCategoryUp = (categoryId: string) => {
    if (productCatalog.moveCategoryUpForUser(userId, categoryId)) {
      refreshData();
      toast({
        title: "Success",
        description: "Category moved up successfully",
      });
    }
  };

  const handleMoveCategoryDown = (categoryId: string) => {
    if (productCatalog.moveCategoryDownForUser(userId, categoryId)) {
      refreshData();
      toast({
        title: "Success",
        description: "Category moved down successfully",
      });
    }
  };

  // Subcategory handlers
  const handleSubcategoryDragStart = (
    e: React.DragEvent,
    subcategoryId: string,
  ) => {
    setDraggedItem(subcategoryId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleSubcategoryDrop = (
    e: React.DragEvent,
    targetSubcategoryId: string,
  ) => {
    e.preventDefault();
    setDragOverItem(null);

    if (
      draggedItem &&
      draggedItem !== targetSubcategoryId &&
      selectedCategory
    ) {
      const subcategories = productCatalog.getSubcategories(
        selectedCategory,
        userId,
      );
      const newOrder = [...subcategories];

      const draggedIndex = newOrder.findIndex((sub) => sub.id === draggedItem);
      const targetIndex = newOrder.findIndex(
        (sub) => sub.id === targetSubcategoryId,
      );

      if (draggedIndex !== -1 && targetIndex !== -1) {
        const [draggedSub] = newOrder.splice(draggedIndex, 1);
        newOrder.splice(targetIndex, 0, draggedSub);

        if (
          productCatalog.reorderSubcategoriesForUser(
            userId,
            selectedCategory,
            newOrder.map((sub) => sub.id),
          )
        ) {
          refreshData();
          toast({
            title: "Success",
            description: "Subcategory order updated successfully",
          });
        }
      }
    }

    setDraggedItem(null);
  };

  const handleMoveSubcategoryUp = (subcategoryId: string) => {
    if (
      selectedCategory &&
      productCatalog.moveSubcategoryUpForUser(
        userId,
        subcategoryId,
        selectedCategory,
      )
    ) {
      refreshData();
      toast({
        title: "Success",
        description: "Subcategory moved up successfully",
      });
    }
  };

  const handleMoveSubcategoryDown = (subcategoryId: string) => {
    if (
      selectedCategory &&
      productCatalog.moveSubcategoryDownForUser(
        userId,
        subcategoryId,
        selectedCategory,
      )
    ) {
      refreshData();
      toast({
        title: "Success",
        description: "Subcategory moved down successfully",
      });
    }
  };

  // Product handlers
  const handleProductDragStart = (e: React.DragEvent, productId: string) => {
    setDraggedItem(productId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleProductDrop = (e: React.DragEvent, targetProductId: string) => {
    e.preventDefault();
    setDragOverItem(null);

    if (draggedItem && draggedItem !== targetProductId && selectedCategory) {
      const products = productCatalog.getProducts({
        category: selectedCategory,
        userId,
      });
      const newOrder = [...products];

      const draggedIndex = newOrder.findIndex(
        (prod) => prod.id === draggedItem,
      );
      const targetIndex = newOrder.findIndex(
        (prod) => prod.id === targetProductId,
      );

      if (draggedIndex !== -1 && targetIndex !== -1) {
        const [draggedProd] = newOrder.splice(draggedIndex, 1);
        newOrder.splice(targetIndex, 0, draggedProd);

        if (
          productCatalog.reorderProducts(
            userId,
            selectedCategory,
            undefined,
            newOrder.map((prod) => prod.id),
          )
        ) {
          refreshData();
          toast({
            title: "Success",
            description: "Product order updated successfully",
          });
        }
      }
    }

    setDraggedItem(null);
  };

  const handleMoveProductUp = (productId: string) => {
    if (
      selectedCategory &&
      productCatalog.moveProductUp(userId, productId, selectedCategory)
    ) {
      refreshData();
      toast({
        title: "Success",
        description: "Product moved up successfully",
      });
    }
  };

  const handleMoveProductDown = (productId: string) => {
    if (
      selectedCategory &&
      productCatalog.moveProductDown(userId, productId, selectedCategory)
    ) {
      refreshData();
      toast({
        title: "Success",
        description: "Product moved down successfully",
      });
    }
  };

  const handleResetPreferences = () => {
    if (userPreferencesService.resetUserPreferences(userId)) {
      refreshData();
      setSelectedCategory(null);
      toast({
        title: "Success",
        description: "Your preferences have been reset to default",
      });
    }
  };

  const handleExportPreferences = () => {
    const preferencesJson =
      userPreferencesService.exportUserPreferences(userId);
    const blob = new Blob([preferencesJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chargesource-preferences-${user?.name || "user"}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "Preferences exported successfully",
    });
  };

  if (!isOpen) return null;

  const categories = productCatalog.getCategories(userId);
  const subcategories = selectedCategory
    ? productCatalog.getSubcategories(selectedCategory, userId)
    : [];
  const products = selectedCategory
    ? productCatalog.getProducts({ category: selectedCategory, userId })
    : [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            My Preferences - Organize Categories & Products
          </DialogTitle>
          <DialogDescription>
            Customize how categories and products are ordered in your view. Drag
            items to reorder or use the arrow buttons.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="subcategories">Subcategories</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
          </TabsList>

          <TabsContent value="categories" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Category Order</CardTitle>
                <CardDescription>
                  Organize categories in your preferred order. This affects how
                  they appear throughout the app.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {categories.map((category, index) => (
                    <Card
                      key={`${category.id}-${refreshKey}`}
                      draggable
                      onDragStart={(e) =>
                        handleCategoryDragStart(e, category.id)
                      }
                      onDragOver={(e) => handleCategoryDragOver(e, category.id)}
                      onDragLeave={handleCategoryDragLeave}
                      onDrop={(e) => handleCategoryDrop(e, category.id)}
                      className={`cursor-move transition-all ${
                        draggedItem === category.id
                          ? "opacity-50 scale-105"
                          : ""
                      } ${
                        dragOverItem === category.id
                          ? "border-primary bg-primary/5"
                          : "hover:border-muted-foreground"
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <GripVertical className="w-4 h-4 text-muted-foreground" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">{category.name}</h4>
                                <Badge variant="outline">
                                  {category.subcategories.length} subcategories
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {category.description}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex flex-col gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() =>
                                  handleMoveCategoryUp(category.id)
                                }
                                disabled={index === 0}
                              >
                                <ChevronUp className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() =>
                                  handleMoveCategoryDown(category.id)
                                }
                                disabled={index === categories.length - 1}
                              >
                                <ChevronDown className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subcategories" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Select Category</CardTitle>
                  <CardDescription>
                    Choose a category to organize its subcategories
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-[350px] overflow-y-auto">
                    {categories.map((category) => (
                      <Card
                        key={category.id}
                        className={`cursor-pointer transition-colors ${
                          selectedCategory === category.id
                            ? "ring-2 ring-primary bg-primary/5"
                            : "hover:bg-muted/50"
                        }`}
                        onClick={() => setSelectedCategory(category.id)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{category.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {category.subcategories.length} subcategories
                              </p>
                            </div>
                            <Folder className="w-4 h-4 text-muted-foreground" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>
                    {selectedCategory
                      ? `${categories.find((c) => c.id === selectedCategory)?.name} Subcategories`
                      : "Subcategory Order"}
                  </CardTitle>
                  <CardDescription>
                    {selectedCategory
                      ? "Drag to reorder subcategories within this category"
                      : "Select a category to organize its subcategories"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedCategory ? (
                    <div className="space-y-2 max-h-[350px] overflow-y-auto">
                      {subcategories.map((subcategory, index) => (
                        <Card
                          key={`${subcategory.id}-${refreshKey}`}
                          draggable
                          onDragStart={(e) =>
                            handleSubcategoryDragStart(e, subcategory.id)
                          }
                          onDragOver={(e) =>
                            handleCategoryDragOver(e, subcategory.id)
                          }
                          onDragLeave={handleCategoryDragLeave}
                          onDrop={(e) =>
                            handleSubcategoryDrop(e, subcategory.id)
                          }
                          className={`cursor-move transition-all ${
                            draggedItem === subcategory.id
                              ? "opacity-50 scale-105"
                              : ""
                          } ${
                            dragOverItem === subcategory.id
                              ? "border-primary bg-primary/5"
                              : ""
                          }`}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1">
                                <GripVertical className="w-4 h-4 text-muted-foreground" />
                                <div>
                                  <h5 className="font-medium">
                                    {subcategory.name}
                                  </h5>
                                  <p className="text-sm text-muted-foreground">
                                    {subcategory.description}
                                  </p>
                                </div>
                              </div>
                              <div className="flex flex-col gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() =>
                                    handleMoveSubcategoryUp(subcategory.id)
                                  }
                                  disabled={index === 0}
                                >
                                  <ChevronUp className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() =>
                                    handleMoveSubcategoryDown(subcategory.id)
                                  }
                                  disabled={index === subcategories.length - 1}
                                >
                                  <ChevronDown className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Folder className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Select a category to organize its subcategories</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="products" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Select Category</CardTitle>
                  <CardDescription>
                    Choose a category to organize its products
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-[350px] overflow-y-auto">
                    {categories.map((category) => {
                      const productCount = productCatalog.getProducts({
                        category: category.id,
                      }).length;
                      return (
                        <Card
                          key={category.id}
                          className={`cursor-pointer transition-colors ${
                            selectedCategory === category.id
                              ? "ring-2 ring-primary bg-primary/5"
                              : "hover:bg-muted/50"
                          }`}
                          onClick={() => setSelectedCategory(category.id)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium">{category.name}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {productCount} products
                                </p>
                              </div>
                              <Package className="w-4 h-4 text-muted-foreground" />
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>
                    {selectedCategory
                      ? `${categories.find((c) => c.id === selectedCategory)?.name} Products`
                      : "Product Order"}
                  </CardTitle>
                  <CardDescription>
                    {selectedCategory
                      ? "Drag to reorder products within this category"
                      : "Select a category to organize its products"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedCategory ? (
                    <div className="space-y-2 max-h-[350px] overflow-y-auto">
                      {products.map((product, index) => (
                        <Card
                          key={`${product.id}-${refreshKey}`}
                          draggable
                          onDragStart={(e) =>
                            handleProductDragStart(e, product.id)
                          }
                          onDragOver={(e) =>
                            handleCategoryDragOver(e, product.id)
                          }
                          onDragLeave={handleCategoryDragLeave}
                          onDrop={(e) => handleProductDrop(e, product.id)}
                          className={`cursor-move transition-all ${
                            draggedItem === product.id
                              ? "opacity-50 scale-105"
                              : ""
                          } ${
                            dragOverItem === product.id
                              ? "border-primary bg-primary/5"
                              : ""
                          }`}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1">
                                <GripVertical className="w-4 h-4 text-muted-foreground" />
                                <div>
                                  <h5 className="font-medium">
                                    {product.name}
                                  </h5>
                                  <p className="text-sm text-muted-foreground">
                                    {product.brand} - {product.sku}
                                  </p>
                                </div>
                              </div>
                              <div className="flex flex-col gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() =>
                                    handleMoveProductUp(product.id)
                                  }
                                  disabled={index === 0}
                                >
                                  <ChevronUp className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() =>
                                    handleMoveProductDown(product.id)
                                  }
                                  disabled={index === products.length - 1}
                                >
                                  <ChevronDown className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      {products.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>No products found in this category</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Select a category to organize its products</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="justify-between">
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportPreferences}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" onClick={handleResetPreferences}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset to Default
            </Button>
          </div>
          <Button onClick={onClose}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
