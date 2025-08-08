interface UserCategoryPreference {
  categoryId: string;
  order: number;
}

interface UserSubcategoryPreference {
  subcategoryId: string;
  categoryId: string;
  order: number;
}

interface UserProductPreference {
  productId: string;
  categoryId: string;
  subcategoryId?: string;
  order: number;
}

interface UserPreferences {
  userId: string;
  categoryOrder: UserCategoryPreference[];
  subcategoryOrder: UserSubcategoryPreference[];
  productOrder: UserProductPreference[];
  lastUpdated: string;
}

class UserPreferencesService {
  private storageKey = "chargeSourceUserPreferences";
  private allPreferences: UserPreferences[] = [];

  constructor() {
    this.loadFromStorage();
  }

  // Get preferences for a specific user
  getUserPreferences(userId: string): UserPreferences {
    const existing = this.allPreferences.find(pref => pref.userId === userId);
    if (existing) return existing;

    // Create default preferences for new user
    const newPreferences: UserPreferences = {
      userId,
      categoryOrder: [],
      subcategoryOrder: [],
      productOrder: [],
      lastUpdated: new Date().toISOString(),
    };

    this.allPreferences.push(newPreferences);
    this.saveToStorage();
    return newPreferences;
  }

  // Category ordering methods
  setCategoryOrder(userId: string, categoryIds: string[]): boolean {
    try {
      const userPrefs = this.getUserPreferences(userId);
      userPrefs.categoryOrder = categoryIds.map((categoryId, index) => ({
        categoryId,
        order: index,
      }));
      userPrefs.lastUpdated = new Date().toISOString();
      this.saveToStorage();
      return true;
    } catch (error) {
      console.error("Error setting category order:", error);
      return false;
    }
  }

  getCategoryOrder(userId: string): string[] {
    const userPrefs = this.getUserPreferences(userId);
    return userPrefs.categoryOrder
      .sort((a, b) => a.order - b.order)
      .map(pref => pref.categoryId);
  }

  moveCategoryUp(userId: string, categoryId: string, allCategoryIds: string[]): boolean {
    const currentOrder = this.getCategoryOrder(userId);
    
    // If no custom order exists, use the provided default order
    const orderToUse = currentOrder.length > 0 ? currentOrder : allCategoryIds;
    
    const currentIndex = orderToUse.indexOf(categoryId);
    if (currentIndex <= 0) return false;

    const newOrder = [...orderToUse];
    [newOrder[currentIndex - 1], newOrder[currentIndex]] = [newOrder[currentIndex], newOrder[currentIndex - 1]];
    
    return this.setCategoryOrder(userId, newOrder);
  }

  moveCategoryDown(userId: string, categoryId: string, allCategoryIds: string[]): boolean {
    const currentOrder = this.getCategoryOrder(userId);
    
    // If no custom order exists, use the provided default order
    const orderToUse = currentOrder.length > 0 ? currentOrder : allCategoryIds;
    
    const currentIndex = orderToUse.indexOf(categoryId);
    if (currentIndex >= orderToUse.length - 1 || currentIndex === -1) return false;

    const newOrder = [...orderToUse];
    [newOrder[currentIndex], newOrder[currentIndex + 1]] = [newOrder[currentIndex + 1], newOrder[currentIndex]];
    
    return this.setCategoryOrder(userId, newOrder);
  }

  // Subcategory ordering methods
  setSubcategoryOrder(userId: string, categoryId: string, subcategoryIds: string[]): boolean {
    try {
      const userPrefs = this.getUserPreferences(userId);
      
      // Remove old subcategory preferences for this category
      userPrefs.subcategoryOrder = userPrefs.subcategoryOrder.filter(
        pref => pref.categoryId !== categoryId
      );
      
      // Add new preferences
      const newSubcategoryPrefs = subcategoryIds.map((subcategoryId, index) => ({
        subcategoryId,
        categoryId,
        order: index,
      }));
      
      userPrefs.subcategoryOrder.push(...newSubcategoryPrefs);
      userPrefs.lastUpdated = new Date().toISOString();
      this.saveToStorage();
      return true;
    } catch (error) {
      console.error("Error setting subcategory order:", error);
      return false;
    }
  }

  getSubcategoryOrder(userId: string, categoryId: string): string[] {
    const userPrefs = this.getUserPreferences(userId);
    return userPrefs.subcategoryOrder
      .filter(pref => pref.categoryId === categoryId)
      .sort((a, b) => a.order - b.order)
      .map(pref => pref.subcategoryId);
  }

  moveSubcategoryUp(userId: string, subcategoryId: string, categoryId: string, allSubcategoryIds: string[]): boolean {
    const currentOrder = this.getSubcategoryOrder(userId, categoryId);
    
    // If no custom order exists, use the provided default order
    const orderToUse = currentOrder.length > 0 ? currentOrder : allSubcategoryIds;
    
    const currentIndex = orderToUse.indexOf(subcategoryId);
    if (currentIndex <= 0) return false;

    const newOrder = [...orderToUse];
    [newOrder[currentIndex - 1], newOrder[currentIndex]] = [newOrder[currentIndex], newOrder[currentIndex - 1]];
    
    return this.setSubcategoryOrder(userId, categoryId, newOrder);
  }

  moveSubcategoryDown(userId: string, subcategoryId: string, categoryId: string, allSubcategoryIds: string[]): boolean {
    const currentOrder = this.getSubcategoryOrder(userId, categoryId);
    
    // If no custom order exists, use the provided default order
    const orderToUse = currentOrder.length > 0 ? currentOrder : allSubcategoryIds;
    
    const currentIndex = orderToUse.indexOf(subcategoryId);
    if (currentIndex >= orderToUse.length - 1 || currentIndex === -1) return false;

    const newOrder = [...orderToUse];
    [newOrder[currentIndex], newOrder[currentIndex + 1]] = [newOrder[currentIndex + 1], newOrder[currentIndex]];
    
    return this.setSubcategoryOrder(userId, categoryId, newOrder);
  }

  // Product ordering methods
  setProductOrder(userId: string, categoryId: string, subcategoryId: string | undefined, productIds: string[]): boolean {
    try {
      const userPrefs = this.getUserPreferences(userId);
      
      // Remove old product preferences for this category/subcategory combination
      userPrefs.productOrder = userPrefs.productOrder.filter(
        pref => !(pref.categoryId === categoryId && pref.subcategoryId === subcategoryId)
      );
      
      // Add new preferences
      const newProductPrefs = productIds.map((productId, index) => ({
        productId,
        categoryId,
        subcategoryId,
        order: index,
      }));
      
      userPrefs.productOrder.push(...newProductPrefs);
      userPrefs.lastUpdated = new Date().toISOString();
      this.saveToStorage();
      return true;
    } catch (error) {
      console.error("Error setting product order:", error);
      return false;
    }
  }

  getProductOrder(userId: string, categoryId: string, subcategoryId?: string): string[] {
    const userPrefs = this.getUserPreferences(userId);
    return userPrefs.productOrder
      .filter(pref => 
        pref.categoryId === categoryId && 
        pref.subcategoryId === subcategoryId
      )
      .sort((a, b) => a.order - b.order)
      .map(pref => pref.productId);
  }

  moveProductUp(userId: string, productId: string, categoryId: string, subcategoryId: string | undefined, allProductIds: string[]): boolean {
    const currentOrder = this.getProductOrder(userId, categoryId, subcategoryId);
    
    // If no custom order exists, use the provided default order
    const orderToUse = currentOrder.length > 0 ? currentOrder : allProductIds;
    
    const currentIndex = orderToUse.indexOf(productId);
    if (currentIndex <= 0) return false;

    const newOrder = [...orderToUse];
    [newOrder[currentIndex - 1], newOrder[currentIndex]] = [newOrder[currentIndex], newOrder[currentIndex - 1]];
    
    return this.setProductOrder(userId, categoryId, subcategoryId, newOrder);
  }

  moveProductDown(userId: string, productId: string, categoryId: string, subcategoryId: string | undefined, allProductIds: string[]): boolean {
    const currentOrder = this.getProductOrder(userId, categoryId, subcategoryId);
    
    // If no custom order exists, use the provided default order
    const orderToUse = currentOrder.length > 0 ? currentOrder : allProductIds;
    
    const currentIndex = orderToUse.indexOf(productId);
    if (currentIndex >= orderToUse.length - 1 || currentIndex === -1) return false;

    const newOrder = [...orderToUse];
    [newOrder[currentIndex], newOrder[currentIndex + 1]] = [newOrder[currentIndex + 1], newOrder[currentIndex]];
    
    return this.setProductOrder(userId, categoryId, subcategoryId, newOrder);
  }

  // Apply user preferences to sort arrays
  applyCategoryOrder<T extends { id: string }>(userId: string, categories: T[]): T[] {
    const userOrder = this.getCategoryOrder(userId);
    if (userOrder.length === 0) return categories; // No custom order, return as-is

    // Create a map for quick lookup
    const categoryMap = new Map(categories.map(cat => [cat.id, cat]));
    const orderMap = new Map(userOrder.map((id, index) => [id, index]));

    return categories.sort((a, b) => {
      const orderA = orderMap.get(a.id) ?? 999999;
      const orderB = orderMap.get(b.id) ?? 999999;
      return orderA - orderB;
    });
  }

  applySubcategoryOrder<T extends { id: string }>(userId: string, categoryId: string, subcategories: T[]): T[] {
    const userOrder = this.getSubcategoryOrder(userId, categoryId);
    if (userOrder.length === 0) return subcategories; // No custom order, return as-is

    const orderMap = new Map(userOrder.map((id, index) => [id, index]));

    return subcategories.sort((a, b) => {
      const orderA = orderMap.get(a.id) ?? 999999;
      const orderB = orderMap.get(b.id) ?? 999999;
      return orderA - orderB;
    });
  }

  applyProductOrder<T extends { id: string }>(userId: string, categoryId: string, subcategoryId: string | undefined, products: T[]): T[] {
    const userOrder = this.getProductOrder(userId, categoryId, subcategoryId);
    if (userOrder.length === 0) return products; // No custom order, return as-is

    const orderMap = new Map(userOrder.map((id, index) => [id, index]));

    return products.sort((a, b) => {
      const orderA = orderMap.get(a.id) ?? 999999;
      const orderB = orderMap.get(b.id) ?? 999999;
      return orderA - orderB;
    });
  }

  // Utility methods
  resetUserPreferences(userId: string): boolean {
    try {
      this.allPreferences = this.allPreferences.filter(pref => pref.userId !== userId);
      this.saveToStorage();
      return true;
    } catch (error) {
      console.error("Error resetting user preferences:", error);
      return false;
    }
  }

  exportUserPreferences(userId: string): string {
    const userPrefs = this.getUserPreferences(userId);
    return JSON.stringify(userPrefs, null, 2);
  }

  importUserPreferences(userId: string, preferencesJson: string): boolean {
    try {
      const importedPrefs = JSON.parse(preferencesJson);
      importedPrefs.userId = userId; // Ensure correct user ID
      importedPrefs.lastUpdated = new Date().toISOString();
      
      // Remove existing preferences for this user
      this.allPreferences = this.allPreferences.filter(pref => pref.userId !== userId);
      
      // Add imported preferences
      this.allPreferences.push(importedPrefs);
      this.saveToStorage();
      return true;
    } catch (error) {
      console.error("Error importing user preferences:", error);
      return false;
    }
  }

  // Storage operations
  private saveToStorage(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.allPreferences));
      
      // Trigger a custom event to notify other components
      window.dispatchEvent(new CustomEvent('userPreferencesChanged', { 
        detail: { preferences: this.allPreferences } 
      }));
    } catch (error) {
      console.error("Error saving user preferences to storage:", error);
    }
  }

  private loadFromStorage(): void {
    try {
      const storedPreferences = localStorage.getItem(this.storageKey);
      if (storedPreferences) {
        this.allPreferences = JSON.parse(storedPreferences);
      }
    } catch (error) {
      console.error("Error loading user preferences from storage:", error);
      this.allPreferences = [];
    }
  }
}

export const userPreferencesService = new UserPreferencesService();
export default userPreferencesService;
