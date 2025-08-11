import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Edit,
  Trash2,
  Upload,
  X,
  Save,
  Package,
  DollarSign,
  Warehouse,
  Image as ImageIcon,
  Shield,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { productCatalog } from "@/lib/productCatalog";
import { ProductCatalogueItem } from "@/lib/quoteTypes";
import { useToast } from "@/hooks/use-toast";
import { enhancedFileStorageService } from "@/lib/services/enhancedFileStorageService";

interface AdminProductManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ProductFormData {
  sku: string;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  brand: string;
  model: string;
  specifications: Record<string, any>;
  pricing: {
    cost: number;
    listPrice: number;
    recommendedRetail: number;
  };
  inventory: {
    inStock: number;
    reserved: number;
    available: number;
    leadTime: string;
  };
  supplier: {
    id: string;
    name: string;
    partNumber: string;
    minimumOrderQuantity: number;
  };
  images: string[];
  documents: string[];
  isActive: boolean;
}

const emptyFormData: ProductFormData = {
  sku: "",
  name: "",
  description: "",
  category: "",
  subcategory: "",
  brand: "",
  model: "",
  specifications: {},
  pricing: {
    cost: 0,
    listPrice: 0,
    recommendedRetail: 0,
  },
  inventory: {
    inStock: 0,
    reserved: 0,
    available: 0,
    leadTime: "",
  },
  supplier: {
    id: "",
    name: "",
    partNumber: "",
    minimumOrderQuantity: 1,
  },
  images: [],
  documents: [],
  isActive: true,
};

export default function AdminProductManager({
  isOpen,
  onClose,
}: AdminProductManagerProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("list");
  const [products, setProducts] = useState<ProductCatalogueItem[]>(
    productCatalog.getProducts(),
  );
  const [editingProduct, setEditingProduct] =
    useState<ProductCatalogueItem | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(emptyFormData);
  const [showProductForm, setShowProductForm] = useState(false);
  const [deleteConfirmProduct, setDeleteConfirmProduct] =
    useState<ProductCatalogueItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [specKey, setSpecKey] = useState("");
  const [specValue, setSpecValue] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = productCatalog.getCategories();
  const subcategories = productCatalog.getSubcategories(formData.category);

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleAddProduct = () => {
    setEditingProduct(null);
    setFormData(emptyFormData);
    setShowProductForm(true);
    setActiveTab("form");
  };

  const handleEditProduct = (product: ProductCatalogueItem) => {
    setEditingProduct(product);
    setFormData({
      sku: product.sku,
      name: product.name,
      description: product.description,
      category: product.category,
      subcategory: product.subcategory,
      brand: product.brand,
      model: product.model,
      specifications: product.specifications,
      pricing: product.pricing,
      inventory: product.inventory,
      supplier: product.supplier,
      images: product.images,
      documents: product.documents,
      isActive: product.isActive,
    });
    setShowProductForm(true);
    setActiveTab("form");
  };

  const handleSaveProduct = () => {
    try {
      if (!formData.sku || !formData.name || !formData.category) {
        toast({
          title: "Validation Error",
          description: "SKU, Name, and Category are required fields.",
          variant: "destructive",
        });
        return;
      }

      // Calculate available inventory
      const available =
        formData.inventory.inStock - formData.inventory.reserved;

      const productData = {
        ...formData,
        inventory: {
          ...formData.inventory,
          available: Math.max(0, available),
        },
      };

      if (editingProduct) {
        // Update existing product
        const updatedProduct = productCatalog.updateProduct(
          editingProduct.id,
          productData,
        );
        if (updatedProduct) {
          const updatedProducts = products.map((p) =>
            p.id === editingProduct.id ? updatedProduct : p,
          );
          setProducts(updatedProducts);
          toast({
            title: "Product Updated",
            description: `${productData.name} has been updated successfully.`,
          });
        }
      } else {
        // Add new product
        const newProduct = productCatalog.addProduct(productData);
        setProducts([newProduct, ...products]);
        toast({
          title: "Product Added",
          description: `${productData.name} has been added to the catalog.`,
        });
      }

      setShowProductForm(false);
      setFormData(emptyFormData);
      setEditingProduct(null);
      setActiveTab("list");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save product. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduct = (product: ProductCatalogueItem) => {
    setDeleteConfirmProduct(product);
  };

  const confirmDeleteProduct = () => {
    if (deleteConfirmProduct) {
      const success = productCatalog.deleteProduct(deleteConfirmProduct.id);
      if (success) {
        setProducts(products.filter((p) => p.id !== deleteConfirmProduct.id));
        toast({
          title: "Product Deleted",
          description: `${deleteConfirmProduct.name} has been removed from the catalog.`,
        });
      }
      setDeleteConfirmProduct(null);
    }
  };

  const handleAddSpecification = () => {
    if (specKey && specValue) {
      setFormData((prev) => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [specKey]: specValue,
        },
      }));
      setSpecKey("");
      setSpecValue("");
    }
  };

  const handleRemoveSpecification = (key: string) => {
    setFormData((prev) => {
      const newSpecs = { ...prev.specifications };
      delete newSpecs[key];
      return {
        ...prev,
        specifications: newSpecs,
      };
    });
  };

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a JPEG, PNG, GIF, or WebP image.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    try {
      setImageUploading(true);

      const uploadResult = await enhancedFileStorageService.uploadFile(
        file,
        "product-images"
      );

      if (uploadResult) {
        // Add the uploaded image URL to the form data
        const imageUrl = (uploadResult as any).publicUrl || (uploadResult as any).filePath || '/placeholder.svg';
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, imageUrl]
        }));

        toast({
          title: "Image Uploaded",
          description: "Product image has been uploaded successfully.",
        });
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      console.error("Image upload error:", error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setImageUploading(false);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (imageIndex: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== imageIndex)
    }));
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-600" />
            Admin Product Management
          </DialogTitle>
          <DialogDescription>
            Manage product catalog - add, edit, and remove products
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 overflow-hidden"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list">Product List</TabsTrigger>
            <TabsTrigger value="form" disabled={!showProductForm}>
              {editingProduct ? "Edit Product" : "Add Product"}
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="list"
            className="space-y-4 overflow-auto max-h-[calc(95vh-200px)]"
          >
            {/* Product List Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                </div>
                <Badge variant="outline">
                  {filteredProducts.length} products
                </Badge>
              </div>
              <Button
                onClick={handleAddProduct}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Product
              </Button>
            </div>

            {/* Product List */}
            <div className="space-y-2">
              {filteredProducts.map((product) => (
                <Card
                  key={product.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        {/* Product Image Placeholder */}
                        <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                          <Package className="w-8 h-8 text-muted-foreground" />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{product.name}</h3>
                            <Badge variant="outline" className="text-xs">
                              {product.brand}
                            </Badge>
                            {!product.isActive && (
                              <Badge variant="destructive" className="text-xs">
                                Inactive
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            SKU: {product.sku}
                          </p>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {product.description}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="font-semibold">
                            $
                            {product.pricing.recommendedRetail.toLocaleString()}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Stock: {product.inventory.available}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditProduct(product)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteProduct(product)}
                          className="text-red-600 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent
            value="form"
            className="space-y-6 overflow-auto max-h-[calc(95vh-200px)]"
          >
            {showProductForm && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="sku">SKU *</Label>
                      <Input
                        id="sku"
                        value={formData.sku}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            sku: e.target.value,
                          }))
                        }
                        placeholder="e.g., CHG-AC-7KW"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="name">Product Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        placeholder="e.g., 7kW AC Charging Station"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        placeholder="Product description..."
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="brand">Brand</Label>
                        <Input
                          id="brand"
                          value={formData.brand}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              brand: e.target.value,
                            }))
                          }
                          placeholder="e.g., Tesla"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="model">Model</Label>
                        <Input
                          id="model"
                          value={formData.model}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              model: e.target.value,
                            }))
                          }
                          placeholder="e.g., Wall Connector"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Category & Images */}
                <Card>
                  <CardHeader>
                    <CardTitle>Category & Images</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="category">Category *</Label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) =>
                            setFormData((prev) => ({
                              ...prev,
                              category: value,
                              subcategory: "", // Reset subcategory when category changes
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="subcategory">Subcategory</Label>
                        <Select
                          value={formData.subcategory}
                          onValueChange={(value) =>
                            setFormData((prev) => ({
                              ...prev,
                              subcategory: value,
                            }))
                          }
                          disabled={!formData.category}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select subcategory" />
                          </SelectTrigger>
                          <SelectContent>
                            {subcategories.map((subcategory) => (
                              <SelectItem
                                key={subcategory.id}
                                value={subcategory.id}
                              >
                                {subcategory.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Image Upload */}
                    <div className="space-y-2">
                      <Label>Product Images</Label>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        style={{ display: 'none' }}
                      />
                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                        <ImageIcon className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground mb-2">
                          Upload product images (JPEG, PNG, GIF, WebP - Max 10MB)
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleImageUpload}
                          disabled={imageUploading}
                        >
                          {imageUploading ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4 mr-2" />
                          )}
                          {imageUploading ? 'Uploading...' : 'Upload Images'}
                        </Button>
                      </div>

                      {/* Display uploaded images */}
                      {formData.images.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">
                            Uploaded Images ({formData.images.length})
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            {formData.images.map((imageUrl, index) => (
                              <div key={index} className="relative">
                                <img
                                  src={imageUrl}
                                  alt={`Product image ${index + 1}`}
                                  className="w-full h-20 object-cover rounded border"
                                  onError={(e) => {
                                    e.currentTarget.src = '/placeholder.svg';
                                  }}
                                />
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="absolute top-1 right-1 h-6 w-6 p-0"
                                  onClick={() => removeImage(index)}
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Pricing */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Pricing
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cost">Cost Price</Label>
                      <Input
                        id="cost"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.pricing.cost}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            pricing: {
                              ...prev.pricing,
                              cost: parseFloat(e.target.value) || 0,
                            },
                          }))
                        }
                        placeholder="0.00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="listPrice">List Price</Label>
                      <Input
                        id="listPrice"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.pricing.listPrice}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            pricing: {
                              ...prev.pricing,
                              listPrice: parseFloat(e.target.value) || 0,
                            },
                          }))
                        }
                        placeholder="0.00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="recommendedRetail">
                        Recommended Retail
                      </Label>
                      <Input
                        id="recommendedRetail"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.pricing.recommendedRetail}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            pricing: {
                              ...prev.pricing,
                              recommendedRetail:
                                parseFloat(e.target.value) || 0,
                            },
                          }))
                        }
                        placeholder="0.00"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Inventory */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Warehouse className="w-4 h-4" />
                      Inventory
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="inStock">In Stock</Label>
                        <Input
                          id="inStock"
                          type="number"
                          min="0"
                          value={formData.inventory.inStock}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              inventory: {
                                ...prev.inventory,
                                inStock: parseInt(e.target.value) || 0,
                              },
                            }))
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="reserved">Reserved</Label>
                        <Input
                          id="reserved"
                          type="number"
                          min="0"
                          value={formData.inventory.reserved}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              inventory: {
                                ...prev.inventory,
                                reserved: parseInt(e.target.value) || 0,
                              },
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="leadTime">Lead Time</Label>
                      <Input
                        id="leadTime"
                        value={formData.inventory.leadTime}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            inventory: {
                              ...prev.inventory,
                              leadTime: e.target.value,
                            },
                          }))
                        }
                        placeholder="e.g., 2-3 business days"
                      />
                    </div>

                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm">
                        <strong>Available:</strong>{" "}
                        {Math.max(
                          0,
                          formData.inventory.inStock -
                            formData.inventory.reserved,
                        )}{" "}
                        units
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Specifications */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Technical Specifications</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Specification name (e.g., powerRating)"
                        value={specKey}
                        onChange={(e) => setSpecKey(e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        placeholder="Value (e.g., 7kW)"
                        value={specValue}
                        onChange={(e) => setSpecValue(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        onClick={handleAddSpecification}
                        disabled={!specKey || !specValue}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    {Object.keys(formData.specifications).length > 0 && (
                      <div className="space-y-2">
                        <Label>Current Specifications</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {Object.entries(formData.specifications).map(
                            ([key, value]) => (
                              <div
                                key={key}
                                className="flex items-center justify-between p-2 bg-muted rounded"
                              >
                                <span className="text-sm">
                                  <strong>{key}:</strong> {String(value)}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveSpecification(key)}
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="gap-2">
          {showProductForm ? (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setShowProductForm(false);
                  setActiveTab("list");
                  setFormData(emptyFormData);
                  setEditingProduct(null);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveProduct}>
                <Save className="w-4 h-4 mr-2" />
                {editingProduct ? "Update Product" : "Add Product"}
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          )}
        </DialogFooter>

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={!!deleteConfirmProduct}
          onOpenChange={() => setDeleteConfirmProduct(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                Confirm Delete
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{deleteConfirmProduct?.name}"?
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeleteProduct}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete Product
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );
}
