import React, { useState, useMemo } from "react";
import {
  X,
  Plus,
  Minus,
  Check,
  Star,
  Zap,
  Package,
  Clock,
  DollarSign,
  ShoppingCart,
  BarChart3,
  TrendingUp,
  Shield,
  Truck,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { ProductCatalogueItem } from "@/lib/quoteTypes";
import { productCatalog } from "@/lib/productCatalog";

interface ProductComparisonProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProducts: string[]; // Product IDs
  onAddToQuote: (productId: string, quantity: number) => void;
  onRemoveFromComparison: (productId: string) => void;
  maxProducts?: number;
}

interface ComparisonFeature {
  key: string;
  label: string;
  type: "text" | "number" | "currency" | "boolean" | "array" | "rating";
  important?: boolean;
}

const COMPARISON_FEATURES: ComparisonFeature[] = [
  { key: "name", label: "Product Name", type: "text", important: true },
  { key: "brand", label: "Brand", type: "text", important: true },
  { key: "model", label: "Model", type: "text" },
  {
    key: "specifications.powerRating",
    label: "Power Rating",
    type: "text",
    important: true,
  },
  { key: "specifications.inputVoltage", label: "Input Voltage", type: "text" },
  {
    key: "specifications.outputVoltage",
    label: "Output Voltage",
    type: "text",
  },
  {
    key: "specifications.connectorType",
    label: "Connector Type",
    type: "text",
    important: true,
  },
  {
    key: "specifications.connectorTypes",
    label: "Connector Types",
    type: "array",
  },
  { key: "specifications.dimensions", label: "Dimensions", type: "text" },
  { key: "specifications.weight", label: "Weight", type: "text" },
  {
    key: "specifications.protection",
    label: "Protection Rating",
    type: "text",
  },
  { key: "specifications.efficiency", label: "Efficiency", type: "text" },
  {
    key: "specifications.temperature",
    label: "Operating Temperature",
    type: "text",
  },
  { key: "specifications.warranty", label: "Warranty", type: "text" },
  {
    key: "pricing.recommendedRetail",
    label: "Recommended Retail Price",
    type: "currency",
    important: true,
  },
  { key: "pricing.listPrice", label: "List Price", type: "currency" },
  {
    key: "inventory.available",
    label: "Available Stock",
    type: "number",
    important: true,
  },
  {
    key: "inventory.leadTime",
    label: "Lead Time",
    type: "text",
    important: true,
  },
  { key: "category", label: "Category", type: "text" },
  { key: "subcategory", label: "Subcategory", type: "text" },
];

export default function ProductComparison({
  isOpen,
  onClose,
  selectedProducts,
  onAddToQuote,
  onRemoveFromComparison,
  maxProducts = 4,
}: ProductComparisonProps) {
  const { toast } = useToast();
  const { hasPermission } = useAuth();
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  // Check permission for product comparison
  const canCompare = hasPermission("quotes.compare");

  // Get product details
  const products = useMemo(() => {
    return selectedProducts
      .map((id) => productCatalog.getProducts().find((p) => p.id === id))
      .filter(Boolean) as ProductCatalogueItem[];
  }, [selectedProducts]);

  // Get value from nested object path
  const getNestedValue = (obj: any, path: string): any => {
    return path.split(".").reduce((current, key) => current?.[key], obj);
  };

  // Format value based on type
  const formatValue = (value: any, type: ComparisonFeature["type"]): string => {
    if (value === null || value === undefined || value === "") return "-";

    switch (type) {
      case "currency":
        return `$${Number(value).toLocaleString()}`;
      case "number":
        return Number(value).toLocaleString();
      case "boolean":
        return value ? "Yes" : "No";
      case "array":
        return Array.isArray(value) ? value.join(", ") : String(value);
      case "rating":
        return (
          "★".repeat(Math.floor(Number(value))) +
          "☆".repeat(5 - Math.floor(Number(value)))
        );
      default:
        return String(value);
    }
  };

  // Get best value for comparison highlighting
  const getBestValue = (feature: ComparisonFeature): any => {
    const values = products
      .map((p) => getNestedValue(p, feature.key))
      .filter((v) => v !== null && v !== undefined && v !== "");

    if (values.length === 0) return null;

    switch (feature.type) {
      case "currency":
      case "number":
        return Math.min(...values.map(Number));
      case "text":
        if (feature.key === "inventory.leadTime") {
          // For lead time, shorter is better
          return values.sort((a, b) => {
            const aNum = parseInt(String(a).replace(/\D/g, ""));
            const bNum = parseInt(String(b).replace(/\D/g, ""));
            return aNum - bNum;
          })[0];
        }
        return null;
      default:
        return null;
    }
  };

  // Check if value is the best among compared products
  const isBestValue = (value: any, feature: ComparisonFeature): boolean => {
    const bestValue = getBestValue(feature);
    if (bestValue === null || value === null || value === undefined)
      return false;

    switch (feature.type) {
      case "currency":
      case "number":
        return Number(value) === Number(bestValue);
      case "text":
        if (feature.key === "inventory.leadTime") {
          return value === bestValue;
        }
        return false;
      default:
        return false;
    }
  };

  const updateQuantity = (productId: string, delta: number) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: Math.max(1, (prev[productId] || 1) + delta),
    }));
  };

  const handleAddToQuote = (product: ProductCatalogueItem) => {
    const quantity = quantities[product.id] || 1;
    onAddToQuote(product.id, quantity);
    toast({
      title: "Product added to quote",
      description: `${product.name} (${quantity}) has been added to your quote.`,
    });
  };

  const getAvailabilityStatus = (product: ProductCatalogueItem) => {
    if (product.inventory.available > 10) {
      return {
        status: "In Stock",
        color: "bg-green-100 text-green-800",
        icon: Check,
      };
    } else if (product.inventory.available > 0) {
      return {
        status: "Low Stock",
        color: "bg-yellow-100 text-yellow-800",
        icon: AlertTriangle,
      };
    } else {
      return {
        status: "Back Order",
        color: "bg-red-100 text-red-800",
        icon: Clock,
      };
    }
  };

  if (!canCompare) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Access Denied</DialogTitle>
            <DialogDescription>
              You don't have permission to compare products. Please contact your
              administrator.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={onClose}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Product Comparison
          </DialogTitle>
          <DialogDescription>
            Compare up to {maxProducts} products side by side to make the best
            choice for your quote
          </DialogDescription>
        </DialogHeader>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Products Selected</h3>
            <p className="text-muted-foreground">
              Add products to comparison from the product catalog to get
              started.
            </p>
          </div>
        ) : (
          <div className="flex flex-col h-full overflow-hidden">
            {/* Product Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
              {products.map((product) => {
                const availability = getAvailabilityStatus(product);
                const AvailabilityIcon = availability.icon;
                const quantity = quantities[product.id] || 1;

                return (
                  <Card key={product.id} className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 h-6 w-6 p-0"
                      onClick={() => onRemoveFromComparison(product.id)}
                      aria-label="Remove product from comparison"
                    >
                      <X className="w-4 h-4" />
                    </Button>

                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{product.brand}</Badge>
                        <Badge
                          className={availability.color}
                          variant="secondary"
                        >
                          <AvailabilityIcon className="w-3 h-3 mr-1" />
                          {availability.status}
                        </Badge>
                      </div>
                      <CardTitle className="text-sm line-clamp-2">
                        {product.name}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">
                          {product.specifications.powerRating || "N/A"}
                        </span>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <div className="space-y-3">
                        <div className="text-center">
                          <div className="text-2xl font-bold">
                            $
                            {product.pricing.recommendedRetail.toLocaleString()}
                          </div>
                          {product.pricing.listPrice !==
                            product.pricing.recommendedRetail && (
                            <div className="text-sm text-muted-foreground line-through">
                              ${product.pricing.listPrice.toLocaleString()}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{product.inventory.leadTime}</span>
                        </div>

                        <Separator />

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Quantity:</span>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => updateQuantity(product.id, -1)}
                                disabled={quantity <= 1}
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="text-sm font-medium w-8 text-center">
                                {quantity}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => updateQuantity(product.id, 1)}
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>

                          <Button
                            size="sm"
                            onClick={() => handleAddToQuote(product)}
                            disabled={product.inventory.available === 0}
                            className="w-full"
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

            {/* Detailed Comparison Table */}
            <div className="flex-1 overflow-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Detailed Comparison</CardTitle>
                  <CardDescription>
                    Compare specifications, pricing, and availability
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-auto max-h-96">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="sticky left-0 bg-background border-r font-semibold min-w-[200px]">
                            Feature
                          </TableHead>
                          {products.map((product) => (
                            <TableHead
                              key={product.id}
                              className="text-center min-w-[150px]"
                            >
                              <div className="flex flex-col gap-1">
                                <span className="font-medium truncate">
                                  {product.name}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {product.brand}
                                </Badge>
                              </div>
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {COMPARISON_FEATURES.map((feature) => {
                          const hasData = products.some((p) => {
                            const value = getNestedValue(p, feature.key);
                            return (
                              value !== null &&
                              value !== undefined &&
                              value !== ""
                            );
                          });

                          if (!hasData) return null;

                          return (
                            <TableRow key={feature.key}>
                              <TableCell className="sticky left-0 bg-background border-r font-medium">
                                <div className="flex items-center gap-2">
                                  <span>{feature.label}</span>
                                  {feature.important && (
                                    <Star className="w-3 h-3 text-yellow-500" />
                                  )}
                                </div>
                              </TableCell>
                              {products.map((product) => {
                                const value = getNestedValue(
                                  product,
                                  feature.key,
                                );
                                const formattedValue = formatValue(
                                  value,
                                  feature.type,
                                );
                                const isBest = isBestValue(value, feature);

                                return (
                                  <TableCell
                                    key={product.id}
                                    className={`text-center ${isBest ? "bg-green-50 font-semibold text-green-800" : ""}`}
                                  >
                                    <div className="flex items-center justify-center gap-1">
                                      {formattedValue}
                                      {isBest && (
                                        <TrendingUp className="w-3 h-3 text-green-600" />
                                      )}
                                    </div>
                                  </TableCell>
                                );
                              })}
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Summary and Actions */}
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Comparing {products.length} of {maxProducts} maximum products
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose}>
                  Close Comparison
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
