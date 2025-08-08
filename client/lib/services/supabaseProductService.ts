import { supabase } from "../supabase";
import { ProductCatalogueItem } from "../quoteTypes";

export interface ProductFilter {
  category?: string;
  subcategory?: string;
  brand?: string;
  powerRating?: string[];
  priceRange?: { min: number; max: number };
  availability?: "in-stock" | "low-stock" | "back-order" | "all";
  searchTerm?: string;
}

class SupabaseProductService {
  // Get all products with filtering
  async getProducts(filter?: ProductFilter): Promise<ProductCatalogueItem[]> {
    let query = supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("name");

    // Apply filters
    if (filter?.category) {
      query = query.eq("category", filter.category);
    }

    if (filter?.subcategory) {
      query = query.eq("subcategory", filter.subcategory);
    }

    if (filter?.brand) {
      query = query.eq("brand", filter.brand);
    }

    if (filter?.searchTerm) {
      query = query.or(
        `name.ilike.%${filter.searchTerm}%,description.ilike.%${filter.searchTerm}%,brand.ilike.%${filter.searchTerm}%`,
      );
    }

    if (filter?.priceRange) {
      query = query
        .gte("pricing->recommendedRetail", filter.priceRange.min)
        .lte("pricing->recommendedRetail", filter.priceRange.max);
    }

    const { data, error } = await query;

    if (error) throw error;

    let products = data || [];

    // Apply availability filter (client-side since it's JSONB)
    if (filter?.availability && filter.availability !== "all") {
      products = products.filter((product) => {
        const available = product.inventory?.available || 0;
        switch (filter.availability) {
          case "in-stock":
            return available > 10;
          case "low-stock":
            return available > 0 && available <= 10;
          case "back-order":
            return available === 0;
          default:
            return true;
        }
      });
    }

    // Apply power rating filter (client-side since it's JSONB)
    if (filter?.powerRating && filter.powerRating.length > 0) {
      products = products.filter((product) =>
        filter.powerRating?.includes(product.specifications?.powerRating),
      );
    }

    return products;
  }

  // Get single product
  async getProduct(productId: string): Promise<ProductCatalogueItem | null> {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();

    if (error) {
      console.error("Error fetching product:", error);
      return null;
    }
    return data;
  }

  // Add new product (admin only)
  async addProduct(
    product: Omit<ProductCatalogueItem, "id" | "createdAt" | "updatedAt">,
  ): Promise<ProductCatalogueItem> {
    const { data, error } = await supabase
      .from("products")
      .insert({
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
        is_active: product.isActive,
      })
      .select()
      .single();

    if (error) throw error;

    // Log activity
    await this.logActivity("product_created", "product", data.id);

    return data;
  }

  // Update product (admin only)
  async updateProduct(
    productId: string,
    updates: Partial<ProductCatalogueItem>,
  ): Promise<ProductCatalogueItem | null> {
    const { data, error } = await supabase
      .from("products")
      .update({
        ...(updates.sku && { sku: updates.sku }),
        ...(updates.name && { name: updates.name }),
        ...(updates.description && { description: updates.description }),
        ...(updates.category && { category: updates.category }),
        ...(updates.subcategory && { subcategory: updates.subcategory }),
        ...(updates.brand && { brand: updates.brand }),
        ...(updates.model && { model: updates.model }),
        ...(updates.specifications && {
          specifications: updates.specifications,
        }),
        ...(updates.pricing && { pricing: updates.pricing }),
        ...(updates.inventory && { inventory: updates.inventory }),
        ...(updates.supplier && { supplier: updates.supplier }),
        ...(updates.images && { images: updates.images }),
        ...(updates.documents && { documents: updates.documents }),
        ...(updates.isActive !== undefined && { is_active: updates.isActive }),
      })
      .eq("id", productId)
      .select()
      .single();

    if (error) throw error;

    // Log activity
    await this.logActivity("product_updated", "product", productId, updates);

    return data;
  }

  // Delete product (admin only)
  async deleteProduct(productId: string): Promise<boolean> {
    // Soft delete by setting is_active to false
    const { error } = await supabase
      .from("products")
      .update({ is_active: false })
      .eq("id", productId);

    if (error) throw error;

    // Log activity
    await this.logActivity("product_deleted", "product", productId);

    return true;
  }

  // Get categories
  async getCategories(): Promise<Array<{ id: string; name: string }>> {
    const { data, error } = await supabase
      .from("products")
      .select("category")
      .eq("is_active", true);

    if (error) throw error;

    // Get unique categories
    const categories = [...new Set(data?.map((p) => p.category) || [])];
    return categories.map((cat) => ({
      id: cat,
      name: cat
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase()),
    }));
  }

  // Get subcategories for a category
  async getSubcategories(
    category: string,
  ): Promise<Array<{ id: string; name: string }>> {
    const { data, error } = await supabase
      .from("products")
      .select("subcategory")
      .eq("category", category)
      .eq("is_active", true)
      .not("subcategory", "is", null);

    if (error) throw error;

    const subcategories = [
      ...new Set(data?.map((p) => p.subcategory).filter(Boolean) || []),
    ];
    return subcategories.map((subcat) => ({
      id: subcat,
      name: subcat
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase()),
    }));
  }

  // Get brands
  async getBrands(): Promise<string[]> {
    const { data, error } = await supabase
      .from("products")
      .select("brand")
      .eq("is_active", true);

    if (error) throw error;

    return [...new Set(data?.map((p) => p.brand) || [])];
  }

  // Get power ratings
  async getPowerRatings(): Promise<string[]> {
    const { data, error } = await supabase
      .from("products")
      .select("specifications")
      .eq("is_active", true);

    if (error) throw error;

    const powerRatings =
      data?.map((p) => p.specifications?.powerRating).filter(Boolean) || [];

    return [...new Set(powerRatings)];
  }

  // Get popular products
  async getPopularProducts(
    limit: number = 10,
  ): Promise<ProductCatalogueItem[]> {
    // This would typically be based on sales data or usage analytics
    // For now, return products with highest reserved inventory
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("inventory->reserved", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  // Get low stock products
  async getLowStockProducts(
    threshold: number = 10,
  ): Promise<ProductCatalogueItem[]> {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true);

    if (error) throw error;

    // Filter by low stock (client-side since inventory is JSONB)
    return (data || [])
      .filter((product) => (product.inventory?.available || 0) <= threshold)
      .sort(
        (a, b) => (a.inventory?.available || 0) - (b.inventory?.available || 0),
      );
  }

  // Get new products
  async getNewProducts(days: number = 30): Promise<ProductCatalogueItem[]> {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .gte("created_at", cutoffDate.toISOString())
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Bulk import products (admin only)
  async bulkImportProducts(
    products: Omit<ProductCatalogueItem, "id" | "createdAt" | "updatedAt">[],
  ): Promise<ProductCatalogueItem[]> {
    const productsToInsert = products.map((product) => ({
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
      is_active: product.isActive,
    }));

    const { data, error } = await supabase
      .from("products")
      .insert(productsToInsert)
      .select();

    if (error) throw error;

    // Log activity
    await this.logActivity("products_bulk_imported", "product", "", {
      count: products.length,
    });

    return data || [];
  }

  // Search products with advanced filters
  async searchProducts(
    query: string,
    filters?: ProductFilter,
  ): Promise<ProductCatalogueItem[]> {
    const searchFilter = { ...filters, searchTerm: query };
    return this.getProducts(searchFilter);
  }

  // Helper method to log activity
  private async logActivity(
    action: string,
    resourceType: string,
    resourceId: string,
    details?: any,
  ) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("activity_logs").insert({
      user_id: user.id,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      details,
    });
  }

  // Real-time subscriptions
  subscribeToProducts(callback: (payload: any) => void) {
    return supabase
      .channel("products")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "products",
        },
        callback,
      )
      .subscribe();
  }
}

export const supabaseProductService = new SupabaseProductService();
export default supabaseProductService;
