import { ProductCategory, ProductSubcategory } from "./productCatalog";
import { productCatalog } from "./productCatalog";

class CategoryService {
  private categories: ProductCategory[] = [];
  private storageKey = "chargeSourceCategories";

  constructor() {
    this.loadFromStorage();
    // Initialize with default categories if none exist
    if (this.categories.length === 0) {
      this.initializeDefaultCategories();
      this.saveToStorage();
    } else {
      // Migrate existing categories to add order field if missing
      this.migrateCategoriesOrder();
    }
  }

  private migrateCategoriesOrder(): void {
    let needsMigration = false;

    // Check if categories need order field
    this.categories.forEach((category, index) => {
      if (category.order === undefined) {
        (category as any).order = index;
        needsMigration = true;
      }

      // Check subcategories
      category.subcategories.forEach((subcategory, subIndex) => {
        if (subcategory.order === undefined) {
          (subcategory as any).order = subIndex;
          needsMigration = true;
        }
      });
    });

    if (needsMigration) {
      console.log("Migrating categories to add order fields");
      this.saveToStorage();
    }
  }

  private initializeDefaultCategories(): void {
    this.categories = [
      {
        id: "chargers",
        name: "EV Chargers",
        description: "Electric vehicle charging stations and equipment",
        order: 0,
        subcategories: [
          {
            id: "ac-chargers-residential",
            name: "AC Chargers - Residential",
            description: "Home charging solutions up to 22kW",
            categoryId: "chargers",
            order: 0,
          },
          {
            id: "ac-chargers-commercial",
            name: "AC Chargers - Commercial",
            description: "Workplace and destination charging solutions",
            categoryId: "chargers",
            order: 1,
          },
          {
            id: "dc-fast-chargers",
            name: "DC Fast Chargers",
            description: "High-power rapid charging stations 50kW+",
            categoryId: "chargers",
            order: 2,
          },
          {
            id: "ultra-fast-chargers",
            name: "Ultra-Fast Chargers",
            description: "Ultra-high power charging 150kW+",
            categoryId: "chargers",
            order: 3,
          },
        ],
      },
      {
        id: "accessories",
        name: "Accessories & Components",
        description: "Cables, connectors, mounting hardware, and accessories",
        order: 1,
        subcategories: [
          {
            id: "charging-cables",
            name: "Charging Cables",
            description: "Type 1, Type 2, CCS, CHAdeMO cables",
            categoryId: "accessories",
            order: 0,
          },
          {
            id: "connectors",
            name: "Connectors & Adapters",
            description: "Charging connectors and adapter solutions",
            categoryId: "accessories",
            order: 1,
          },
          {
            id: "mounting-hardware",
            name: "Mounting Hardware",
            description: "Wall mounts, pedestals, and installation hardware",
            categoryId: "accessories",
            order: 2,
          },
          {
            id: "safety-equipment",
            name: "Safety Equipment",
            description: "RCBO, MCBs, surge protection devices",
            categoryId: "accessories",
            order: 3,
          },
        ],
      },
      {
        id: "infrastructure",
        name: "Infrastructure",
        description: "Electrical infrastructure and grid connection equipment",
        order: 2,
        subcategories: [
          {
            id: "transformers",
            name: "Transformers",
            description: "Step-down transformers for charging installations",
            categoryId: "infrastructure",
            order: 0,
          },
          {
            id: "switchgear",
            name: "Switchgear",
            description: "Electrical switchgear and distribution",
            categoryId: "infrastructure",
            order: 1,
          },
          {
            id: "load-management",
            name: "Load Management",
            description: "Dynamic load balancing and smart grid integration",
            categoryId: "infrastructure",
            order: 2,
          },
        ],
      },
      {
        id: "services",
        name: "Services",
        description: "Installation, maintenance, and support services",
        order: 3,
        subcategories: [
          {
            id: "installation",
            name: "Installation Services",
            description: "Professional installation and commissioning",
            categoryId: "services",
            order: 0,
          },
          {
            id: "maintenance",
            name: "Maintenance",
            description: "Ongoing maintenance and support contracts",
            categoryId: "services",
            order: 1,
          },
          {
            id: "consulting",
            name: "Consulting",
            description: "Site assessment and design consulting",
            categoryId: "services",
            order: 2,
          },
          {
            id: "management-platform",
            name: "Management Platform",
            description: "Software platforms for chargepoint management and monitoring",
            categoryId: "services",
            order: 3,
          },
        ],
      },
    ];
  }

  // Category CRUD operations
  getCategories(): ProductCategory[] {
    return [...this.categories].sort((a, b) => a.order - b.order);
  }

  getCategory(categoryId: string): ProductCategory | null {
    return this.categories.find((cat) => cat.id === categoryId) || null;
  }

  addCategory(name: string, description: string): ProductCategory {
    // Generate a unique ID based on name
    const id = name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "-")
      .substring(0, 50);

    // Ensure ID is unique
    let finalId = id;
    let counter = 1;
    while (this.categories.some((cat) => cat.id === finalId)) {
      finalId = `${id}-${counter}`;
      counter++;
    }

    // Assign the next order value
    const maxOrder = Math.max(...this.categories.map((cat) => cat.order), -1);

    const newCategory: ProductCategory = {
      id: finalId,
      name: name.trim(),
      description: description.trim(),
      subcategories: [],
      order: maxOrder + 1,
    };

    this.categories.push(newCategory);
    this.saveToStorage();

    return newCategory;
  }

  updateCategory(
    categoryId: string,
    updates: { name?: string; description?: string },
  ): ProductCategory | null {
    const categoryIndex = this.categories.findIndex(
      (cat) => cat.id === categoryId,
    );
    if (categoryIndex === -1) return null;

    if (updates.name !== undefined) {
      this.categories[categoryIndex].name = updates.name.trim();
    }
    if (updates.description !== undefined) {
      this.categories[categoryIndex].description = updates.description.trim();
    }

    this.saveToStorage();
    return this.categories[categoryIndex];
  }

  deleteCategory(categoryId: string): boolean {
    const categoryIndex = this.categories.findIndex(
      (cat) => cat.id === categoryId,
    );
    if (categoryIndex === -1) return false;

    // Check if there are products in this category
    const productsInCategory = this.getProductsInCategory(categoryId);
    if (productsInCategory > 0) {
      throw new Error(
        `Cannot delete category: ${productsInCategory} products are assigned to this category`,
      );
    }

    this.categories.splice(categoryIndex, 1);
    this.saveToStorage();
    return true;
  }

  // Subcategory CRUD operations
  getSubcategories(categoryId?: string): ProductSubcategory[] {
    if (categoryId) {
      const category = this.categories.find((cat) => cat.id === categoryId);
      return category
        ? [...category.subcategories].sort((a, b) => a.order - b.order)
        : [];
    }
    return this.categories
      .flatMap((cat) => cat.subcategories)
      .sort((a, b) => a.order - b.order);
  }

  getSubcategory(subcategoryId: string): ProductSubcategory | null {
    for (const category of this.categories) {
      const subcategory = category.subcategories.find(
        (sub) => sub.id === subcategoryId,
      );
      if (subcategory) return subcategory;
    }
    return null;
  }

  addSubcategory(
    categoryId: string,
    name: string,
    description: string,
  ): ProductSubcategory {
    const categoryIndex = this.categories.findIndex(
      (cat) => cat.id === categoryId,
    );
    if (categoryIndex === -1) {
      throw new Error("Category not found");
    }

    // Generate a unique ID based on name
    const baseId = name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "-")
      .substring(0, 50);

    // Ensure ID is unique across all subcategories
    let finalId = baseId;
    let counter = 1;
    while (this.getSubcategory(finalId)) {
      finalId = `${baseId}-${counter}`;
      counter++;
    }

    // Assign the next order value for this category
    const category = this.categories[categoryIndex];
    const maxOrder = Math.max(
      ...category.subcategories.map((sub) => sub.order),
      -1,
    );

    const newSubcategory: ProductSubcategory = {
      id: finalId,
      name: name.trim(),
      description: description.trim(),
      categoryId,
      order: maxOrder + 1,
    };

    this.categories[categoryIndex].subcategories.push(newSubcategory);
    this.saveToStorage();

    return newSubcategory;
  }

  updateSubcategory(
    subcategoryId: string,
    updates: { name?: string; description?: string },
  ): ProductSubcategory | null {
    for (const category of this.categories) {
      const subcategoryIndex = category.subcategories.findIndex(
        (sub) => sub.id === subcategoryId,
      );
      if (subcategoryIndex !== -1) {
        if (updates.name !== undefined) {
          category.subcategories[subcategoryIndex].name = updates.name.trim();
        }
        if (updates.description !== undefined) {
          category.subcategories[subcategoryIndex].description =
            updates.description.trim();
        }

        this.saveToStorage();
        return category.subcategories[subcategoryIndex];
      }
    }
    return null;
  }

  deleteSubcategory(subcategoryId: string): boolean {
    // Check if there are products in this subcategory
    const productsInSubcategory = this.getProductsInSubcategory(subcategoryId);
    if (productsInSubcategory > 0) {
      throw new Error(
        `Cannot delete subcategory: ${productsInSubcategory} products are assigned to this subcategory`,
      );
    }

    for (const category of this.categories) {
      const subcategoryIndex = category.subcategories.findIndex(
        (sub) => sub.id === subcategoryId,
      );
      if (subcategoryIndex !== -1) {
        category.subcategories.splice(subcategoryIndex, 1);
        this.saveToStorage();
        return true;
      }
    }
    return false;
  }

  // Product count utilities
  getProductsInCategory(categoryId: string): number {
    return productCatalog.getProducts({ category: categoryId }).length;
  }

  getProductsInSubcategory(subcategoryId: string): number {
    return productCatalog.getProducts({ subcategory: subcategoryId }).length;
  }

  // Utility methods for product management
  getCategorySelectOptions(): {
    value: string;
    label: string;
    description: string;
  }[] {
    return this.categories.map((cat) => ({
      value: cat.id,
      label: cat.name,
      description: cat.description,
    }));
  }

  getSubcategorySelectOptions(
    categoryId?: string,
  ): {
    value: string;
    label: string;
    description: string;
    categoryId: string;
  }[] {
    const subcategories = categoryId
      ? this.getSubcategories(categoryId)
      : this.getSubcategories();
    return subcategories.map((sub) => ({
      value: sub.id,
      label: sub.name,
      description: sub.description,
      categoryId: sub.categoryId,
    }));
  }

  // Validation methods
  isCategoryNameUnique(name: string, excludeId?: string): boolean {
    return !this.categories.some(
      (cat) =>
        cat.name.toLowerCase() === name.toLowerCase() && cat.id !== excludeId,
    );
  }

  isSubcategoryNameUnique(
    name: string,
    categoryId: string,
    excludeId?: string,
  ): boolean {
    const category = this.categories.find((cat) => cat.id === categoryId);
    if (!category) return true;

    return !category.subcategories.some(
      (sub) =>
        sub.name.toLowerCase() === name.toLowerCase() && sub.id !== excludeId,
    );
  }

  // Storage operations
  private saveToStorage(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.categories));
      // Trigger a custom event to notify other components
      window.dispatchEvent(
        new CustomEvent("categoriesChanged", {
          detail: { categories: this.categories },
        }),
      );
    } catch (error) {
      console.error("Error saving categories to storage:", error);
    }
  }

  private loadFromStorage(): void {
    try {
      const storedCategories = localStorage.getItem(this.storageKey);
      if (storedCategories) {
        this.categories = JSON.parse(storedCategories);
      }
    } catch (error) {
      console.error("Error loading categories from storage:", error);
      this.categories = [];
    }
  }

  // Import/Export utilities
  exportCategories(): string {
    return JSON.stringify(this.categories, null, 2);
  }

  importCategories(categoriesJson: string): boolean {
    try {
      const importedCategories = JSON.parse(categoriesJson);

      // Basic validation
      if (!Array.isArray(importedCategories)) {
        throw new Error("Invalid format: Expected an array of categories");
      }

      // Validate structure
      for (const category of importedCategories) {
        if (
          !category.id ||
          !category.name ||
          !Array.isArray(category.subcategories)
        ) {
          throw new Error("Invalid category structure");
        }
      }

      this.categories = importedCategories;
      this.saveToStorage();
      return true;
    } catch (error) {
      console.error("Error importing categories:", error);
      return false;
    }
  }

  // Reordering methods
  reorderCategories(categoryIds: string[]): boolean {
    try {
      // Create a map of current categories
      const categoryMap = new Map(this.categories.map((cat) => [cat.id, cat]));

      // Validate that all IDs exist
      for (const id of categoryIds) {
        if (!categoryMap.has(id)) {
          throw new Error(`Category with ID ${id} not found`);
        }
      }

      // Update categories with new order
      this.categories = categoryIds.map((id, index) => ({
        ...categoryMap.get(id)!,
        order: index,
      }));

      this.saveToStorage();
      return true;
    } catch (error) {
      console.error("Error reordering categories:", error);
      return false;
    }
  }

  reorderSubcategories(categoryId: string, subcategoryIds: string[]): boolean {
    try {
      const categoryIndex = this.categories.findIndex(
        (cat) => cat.id === categoryId,
      );
      if (categoryIndex === -1) {
        throw new Error("Category not found");
      }

      const category = this.categories[categoryIndex];
      const subcategoryMap = new Map(
        category.subcategories.map((sub) => [sub.id, sub]),
      );

      // Validate that all IDs exist
      for (const id of subcategoryIds) {
        if (!subcategoryMap.has(id)) {
          throw new Error(`Subcategory with ID ${id} not found`);
        }
      }

      // Update subcategories with new order
      this.categories[categoryIndex].subcategories = subcategoryIds.map(
        (id, index) => ({
          ...subcategoryMap.get(id)!,
          order: index,
        }),
      );

      this.saveToStorage();
      return true;
    } catch (error) {
      console.error("Error reordering subcategories:", error);
      return false;
    }
  }

  // Move category up or down
  moveCategoryUp(categoryId: string): boolean {
    const sortedCategories = this.getCategories();
    const currentIndex = sortedCategories.findIndex(
      (cat) => cat.id === categoryId,
    );

    if (currentIndex <= 0) return false; // Already at top or not found

    const newOrder = [...sortedCategories];
    [newOrder[currentIndex - 1], newOrder[currentIndex]] = [
      newOrder[currentIndex],
      newOrder[currentIndex - 1],
    ];

    return this.reorderCategories(newOrder.map((cat) => cat.id));
  }

  moveCategoryDown(categoryId: string): boolean {
    const sortedCategories = this.getCategories();
    const currentIndex = sortedCategories.findIndex(
      (cat) => cat.id === categoryId,
    );

    if (currentIndex >= sortedCategories.length - 1 || currentIndex === -1)
      return false; // Already at bottom or not found

    const newOrder = [...sortedCategories];
    [newOrder[currentIndex], newOrder[currentIndex + 1]] = [
      newOrder[currentIndex + 1],
      newOrder[currentIndex],
    ];

    return this.reorderCategories(newOrder.map((cat) => cat.id));
  }

  // Move subcategory up or down
  moveSubcategoryUp(subcategoryId: string): boolean {
    const subcategory = this.getSubcategory(subcategoryId);
    if (!subcategory) return false;

    const sortedSubcategories = this.getSubcategories(subcategory.categoryId);
    const currentIndex = sortedSubcategories.findIndex(
      (sub) => sub.id === subcategoryId,
    );

    if (currentIndex <= 0) return false; // Already at top or not found

    const newOrder = [...sortedSubcategories];
    [newOrder[currentIndex - 1], newOrder[currentIndex]] = [
      newOrder[currentIndex],
      newOrder[currentIndex - 1],
    ];

    return this.reorderSubcategories(
      subcategory.categoryId,
      newOrder.map((sub) => sub.id),
    );
  }

  moveSubcategoryDown(subcategoryId: string): boolean {
    const subcategory = this.getSubcategory(subcategoryId);
    if (!subcategory) return false;

    const sortedSubcategories = this.getSubcategories(subcategory.categoryId);
    const currentIndex = sortedSubcategories.findIndex(
      (sub) => sub.id === subcategoryId,
    );

    if (currentIndex >= sortedSubcategories.length - 1 || currentIndex === -1)
      return false; // Already at bottom or not found

    const newOrder = [...sortedSubcategories];
    [newOrder[currentIndex], newOrder[currentIndex + 1]] = [
      newOrder[currentIndex + 1],
      newOrder[currentIndex],
    ];

    return this.reorderSubcategories(
      subcategory.categoryId,
      newOrder.map((sub) => sub.id),
    );
  }

  // Reset to defaults
  resetToDefaults(): void {
    this.categories = [];
    this.initializeDefaultCategories();
    this.saveToStorage();
  }
}

export const categoryService = new CategoryService();
export default categoryService;
