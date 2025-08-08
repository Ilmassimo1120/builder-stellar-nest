import { ProductCatalogueItem } from './quoteTypes';

export interface ProductCategory {
  id: string;
  name: string;
  description: string;
  subcategories: ProductSubcategory[];
}

export interface ProductSubcategory {
  id: string;
  name: string;
  description: string;
  categoryId: string;
}

export interface ProductFilter {
  category?: string;
  subcategory?: string;
  brand?: string;
  powerRating?: string[];
  priceRange?: { min: number; max: number };
  availability?: 'in-stock' | 'low-stock' | 'back-order' | 'all';
  searchTerm?: string;
}

class ProductCatalogService {
  private categories: ProductCategory[] = [];
  private products: ProductCatalogueItem[] = [];

  constructor() {
    this.initializeCategories();
    this.initializeProducts();
  }

  private initializeCategories(): void {
    this.categories = [
      {
        id: 'chargers',
        name: 'EV Chargers',
        description: 'Electric vehicle charging stations and equipment',
        subcategories: [
          {
            id: 'ac-chargers-residential',
            name: 'AC Chargers - Residential',
            description: 'Home charging solutions up to 22kW',
            categoryId: 'chargers'
          },
          {
            id: 'ac-chargers-commercial',
            name: 'AC Chargers - Commercial',
            description: 'Workplace and destination charging solutions',
            categoryId: 'chargers'
          },
          {
            id: 'dc-fast-chargers',
            name: 'DC Fast Chargers',
            description: 'High-power rapid charging stations 50kW+',
            categoryId: 'chargers'
          },
          {
            id: 'ultra-fast-chargers',
            name: 'Ultra-Fast Chargers',
            description: 'Ultra-high power charging 150kW+',
            categoryId: 'chargers'
          }
        ]
      },
      {
        id: 'accessories',
        name: 'Accessories & Components',
        description: 'Cables, connectors, mounting hardware, and accessories',
        subcategories: [
          {
            id: 'charging-cables',
            name: 'Charging Cables',
            description: 'Type 1, Type 2, CCS, CHAdeMO cables',
            categoryId: 'accessories'
          },
          {
            id: 'connectors',
            name: 'Connectors & Adapters',
            description: 'Charging connectors and adapter solutions',
            categoryId: 'accessories'
          },
          {
            id: 'mounting-hardware',
            name: 'Mounting Hardware',
            description: 'Wall mounts, pedestals, and installation hardware',
            categoryId: 'accessories'
          },
          {
            id: 'safety-equipment',
            name: 'Safety Equipment',
            description: 'RCBO, MCBs, surge protection devices',
            categoryId: 'accessories'
          }
        ]
      },
      {
        id: 'infrastructure',
        name: 'Infrastructure',
        description: 'Electrical infrastructure and grid connection equipment',
        subcategories: [
          {
            id: 'transformers',
            name: 'Transformers',
            description: 'Step-down transformers for charging installations',
            categoryId: 'infrastructure'
          },
          {
            id: 'switchgear',
            name: 'Switchgear',
            description: 'Electrical switchgear and distribution',
            categoryId: 'infrastructure'
          },
          {
            id: 'load-management',
            name: 'Load Management',
            description: 'Dynamic load balancing and smart grid integration',
            categoryId: 'infrastructure'
          }
        ]
      },
      {
        id: 'services',
        name: 'Services',
        description: 'Installation, maintenance, and support services',
        subcategories: [
          {
            id: 'installation',
            name: 'Installation Services',
            description: 'Professional installation and commissioning',
            categoryId: 'services'
          },
          {
            id: 'maintenance',
            name: 'Maintenance',
            description: 'Ongoing maintenance and support contracts',
            categoryId: 'services'
          },
          {
            id: 'consulting',
            name: 'Consulting',
            description: 'Site assessment and design consulting',
            categoryId: 'services'
          }
        ]
      }
    ];
  }

  private initializeProducts(): void {
    this.products = [
      // AC Chargers - Residential
      {
        id: 'prod-001',
        sku: 'ZAPPI-V2-7.4KW-T',
        name: 'myenergi Zappi V2 7.4kW Tethered',
        description: 'Smart EV charger with solar integration and load balancing. Perfect for home installations with renewable energy systems.',
        category: 'chargers',
        subcategory: 'ac-chargers-residential',
        brand: 'myenergi',
        model: 'Zappi V2',
        specifications: {
          powerRating: '7.4kW',
          inputVoltage: '230V AC',
          outputVoltage: '230V AC',
          connectorType: 'Type 2 Tethered',
          cableLength: '6.5m',
          dimensions: '436 x 281 x 122 mm',
          weight: '4.2kg',
          protection: 'IP65',
          connectivity: 'Wi-Fi, Ethernet',
          features: ['Solar integration', 'Load balancing', 'Smart scheduling', 'Mobile app']
        },
        pricing: {
          cost: 950,
          listPrice: 1399,
          recommendedRetail: 1599
        },
        inventory: {
          inStock: 45,
          reserved: 8,
          available: 37,
          leadTime: '2-3 business days'
        },
        supplier: {
          id: 'sup-myenergi',
          name: 'myenergi Ltd',
          partNumber: 'ZAPPI-2H74T-G2',
          minimumOrderQuantity: 1
        },
        images: ['/images/products/zappi-v2-tethered.jpg'],
        documents: ['/docs/zappi-v2-manual.pdf', '/docs/zappi-v2-spec.pdf'],
        isActive: true,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      },
      {
        id: 'prod-002',
        sku: 'OCPP-AC-22KW-S',
        name: 'OCPP AC Charger 22kW Socket',
        description: 'Three-phase AC charging station with OCPP compliance. Ideal for commercial and residential applications.',
        category: 'chargers',
        subcategory: 'ac-chargers-commercial',
        brand: 'Generic OCPP',
        model: 'AC22-S',
        specifications: {
          powerRating: '22kW',
          inputVoltage: '400V AC 3-phase',
          outputVoltage: '400V AC 3-phase',
          connectorType: 'Type 2 Socket',
          dimensions: '400 x 200 x 150 mm',
          weight: '8.5kg',
          protection: 'IP55',
          connectivity: '4G, Wi-Fi, Ethernet',
          features: ['OCPP 1.6J compliant', 'RFID authentication', 'Dynamic load balancing', 'Remote monitoring']
        },
        pricing: {
          cost: 1850,
          listPrice: 2950,
          recommendedRetail: 3500
        },
        inventory: {
          inStock: 28,
          reserved: 4,
          available: 24,
          leadTime: '5-7 business days'
        },
        supplier: {
          id: 'sup-ocpp',
          name: 'OCPP Solutions',
          partNumber: 'OCPP-AC22-S-001',
          minimumOrderQuantity: 1
        },
        images: ['/images/products/ocpp-ac-22kw.jpg'],
        documents: ['/docs/ocpp-ac22-manual.pdf'],
        isActive: true,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      },
      {
        id: 'prod-003',
        sku: 'TESLA-WALLCON-GEN3',
        name: 'Tesla Wall Connector Gen 3',
        description: 'Tesla\'s latest generation wall connector with Wi-Fi connectivity and power sharing capabilities.',
        category: 'chargers',
        subcategory: 'ac-chargers-residential',
        brand: 'Tesla',
        model: 'Wall Connector Gen 3',
        specifications: {
          powerRating: '11.5kW',
          inputVoltage: '240V AC',
          outputVoltage: '240V AC',
          connectorType: 'Tesla Proprietary / Type 2 (adapter)',
          cableLength: '7.3m',
          dimensions: '415 x 290 x 117 mm',
          weight: '5.4kg',
          protection: 'IP44',
          connectivity: 'Wi-Fi',
          features: ['Power sharing', 'Scheduling', 'Mobile app control', 'Over-the-air updates']
        },
        pricing: {
          cost: 520,
          listPrice: 750,
          recommendedRetail: 899
        },
        inventory: {
          inStock: 32,
          reserved: 6,
          available: 26,
          leadTime: '3-5 business days'
        },
        supplier: {
          id: 'sup-tesla',
          name: 'Tesla Motors',
          partNumber: 'TWC-GEN3-115',
          minimumOrderQuantity: 1
        },
        images: ['/images/products/tesla-wall-connector-gen3.jpg'],
        documents: ['/docs/tesla-wallconnector-manual.pdf'],
        isActive: true,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      },
      // DC Fast Chargers
      {
        id: 'prod-004',
        sku: 'ABB-TERRA54',
        name: 'ABB Terra 54 CJ DC Fast Charger',
        description: 'Compact 50kW DC fast charger with dual connector support (CCS2 + CHAdeMO). Perfect for public and semi-public locations.',
        category: 'chargers',
        subcategory: 'dc-fast-chargers',
        brand: 'ABB',
        model: 'Terra 54 CJ',
        specifications: {
          powerRating: '50kW',
          inputVoltage: '400V AC 3-phase',
          outputVoltage: '150-920V DC',
          connectorTypes: ['CCS2', 'CHAdeMO'],
          dimensions: '700 x 500 x 1700 mm',
          weight: '380kg',
          protection: 'IP54',
          connectivity: '4G, Ethernet',
          features: ['Dual connector', 'Credit card payment', 'OCPP 1.6J', 'Remote diagnostics', '7" touchscreen']
        },
        pricing: {
          cost: 32000,
          listPrice: 48000,
          recommendedRetail: 58000
        },
        inventory: {
          inStock: 12,
          reserved: 3,
          available: 9,
          leadTime: '4-6 weeks'
        },
        supplier: {
          id: 'sup-abb',
          name: 'ABB E-mobility',
          partNumber: 'TERRA54CJ-AUS',
          minimumOrderQuantity: 1
        },
        images: ['/images/products/abb-terra54.jpg'],
        documents: ['/docs/abb-terra54-datasheet.pdf', '/docs/abb-terra54-installation.pdf'],
        isActive: true,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      },
      {
        id: 'prod-005',
        sku: 'TRITIUM-PK50',
        name: 'Tritium PK50 DC Fast Charger',
        description: 'Australian-made 50kW DC fast charger with robust design for harsh outdoor conditions.',
        category: 'chargers',
        subcategory: 'dc-fast-chargers',
        brand: 'Tritium',
        model: 'PK50',
        specifications: {
          powerRating: '50kW',
          inputVoltage: '415V AC 3-phase',
          outputVoltage: '150-920V DC',
          connectorTypes: ['CCS2', 'CHAdeMO'],
          dimensions: '650 x 450 x 1600 mm',
          weight: '350kg',
          protection: 'IP65',
          connectivity: '4G, Wi-Fi, Ethernet',
          features: ['Australian designed', 'Extreme weather rated', 'OCPP compliant', 'Payment terminal', 'LED status lighting']
        },
        pricing: {
          cost: 35000,
          listPrice: 52000,
          recommendedRetail: 62000
        },
        inventory: {
          inStock: 8,
          reserved: 2,
          available: 6,
          leadTime: '3-4 weeks'
        },
        supplier: {
          id: 'sup-tritium',
          name: 'Tritium Pty Ltd',
          partNumber: 'PK50-AUS-001',
          minimumOrderQuantity: 1
        },
        images: ['/images/products/tritium-pk50.jpg'],
        documents: ['/docs/tritium-pk50-datasheet.pdf'],
        isActive: true,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      },
      // Ultra-Fast Chargers
      {
        id: 'prod-006',
        sku: 'ABB-TERRA360',
        name: 'ABB Terra 360 Ultra-Fast Charger',
        description: 'Next-generation 360kW ultra-fast charger capable of charging up to 4 vehicles simultaneously.',
        category: 'chargers',
        subcategory: 'ultra-fast-chargers',
        brand: 'ABB',
        model: 'Terra 360',
        specifications: {
          powerRating: '360kW',
          inputVoltage: '400V AC 3-phase',
          outputVoltage: '150-1000V DC',
          connectorTypes: ['CCS2'],
          maxOutputs: 4,
          dimensions: '900 x 650 x 2300 mm',
          weight: '1200kg',
          protection: 'IP54',
          connectivity: '4G, 5G, Ethernet',
          features: ['Dynamic power sharing', 'Liquid cooling', '15" touchscreen', 'Credit card payment', 'Contactless payment']
        },
        pricing: {
          cost: 125000,
          listPrice: 180000,
          recommendedRetail: 220000
        },
        inventory: {
          inStock: 3,
          reserved: 1,
          available: 2,
          leadTime: '12-16 weeks'
        },
        supplier: {
          id: 'sup-abb',
          name: 'ABB E-mobility',
          partNumber: 'TERRA360-AUS',
          minimumOrderQuantity: 1
        },
        images: ['/images/products/abb-terra360.jpg'],
        documents: ['/docs/abb-terra360-datasheet.pdf'],
        isActive: true,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      },
      // Accessories
      {
        id: 'prod-007',
        sku: 'CABLE-T2-32A-5M',
        name: 'Type 2 Charging Cable 32A 5m',
        description: 'High-quality Type 2 to Type 2 charging cable rated for 32A single-phase charging.',
        category: 'accessories',
        subcategory: 'charging-cables',
        brand: 'Generic',
        model: 'T2-32A-5M',
        specifications: {
          connectorType: 'Type 2 to Type 2',
          current: '32A',
          voltage: '240V AC',
          phases: 'Single phase',
          cableLength: '5m',
          cableType: 'TPE',
          protection: 'IP55',
          temperature: '-40°C to +50°C'
        },
        pricing: {
          cost: 180,
          listPrice: 280,
          recommendedRetail: 350
        },
        inventory: {
          inStock: 150,
          reserved: 20,
          available: 130,
          leadTime: 'In stock'
        },
        supplier: {
          id: 'sup-cables',
          name: 'EV Cable Solutions',
          partNumber: 'EVC-T2-32-5M',
          minimumOrderQuantity: 5
        },
        images: ['/images/products/type2-cable-32a.jpg'],
        documents: ['/docs/type2-cable-spec.pdf'],
        isActive: true,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      },
      {
        id: 'prod-008',
        sku: 'MOUNT-WALL-ADJ',
        name: 'Adjustable Wall Mount Bracket',
        description: 'Universal adjustable wall mounting bracket suitable for most AC charging stations.',
        category: 'accessories',
        subcategory: 'mounting-hardware',
        brand: 'Universal',
        model: 'WALL-ADJ-001',
        specifications: {
          material: 'Powder-coated steel',
          dimensions: '400 x 300 x 200 mm',
          weight: '3.2kg',
          maxLoad: '15kg',
          adjustment: 'Height and angle adjustable',
          mounting: 'Wall mount (fixings included)',
          finish: 'Weather resistant coating'
        },
        pricing: {
          cost: 85,
          listPrice: 150,
          recommendedRetail: 195
        },
        inventory: {
          inStock: 75,
          reserved: 12,
          available: 63,
          leadTime: 'In stock'
        },
        supplier: {
          id: 'sup-hardware',
          name: 'Mounting Solutions Ltd',
          partNumber: 'MS-WALL-ADJ-001',
          minimumOrderQuantity: 10
        },
        images: ['/images/products/wall-mount-adjustable.jpg'],
        documents: ['/docs/wall-mount-installation.pdf'],
        isActive: true,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      },
      // Safety Equipment
      {
        id: 'prod-009',
        sku: 'RCBO-32A-30MA',
        name: 'RCBO 32A 30mA Type A',
        description: 'Residual Current Breaker with Overcurrent protection specifically designed for EV charging applications.',
        category: 'accessories',
        subcategory: 'safety-equipment',
        brand: 'Schneider Electric',
        model: 'A9D34632',
        specifications: {
          current: '32A',
          residualCurrent: '30mA',
          type: 'Type A',
          poles: '1P+N',
          breakingCapacity: '6kA',
          voltage: '230V AC',
          mounting: 'DIN rail',
          standards: 'IEC 61008, IEC 60898'
        },
        pricing: {
          cost: 125,
          listPrice: 180,
          recommendedRetail: 220
        },
        inventory: {
          inStock: 200,
          reserved: 25,
          available: 175,
          leadTime: 'In stock'
        },
        supplier: {
          id: 'sup-schneider',
          name: 'Schneider Electric',
          partNumber: 'A9D34632',
          minimumOrderQuantity: 1
        },
        images: ['/images/products/rcbo-32a-30ma.jpg'],
        documents: ['/docs/rcbo-datasheet.pdf'],
        isActive: true,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      },
      // Installation Services
      {
        id: 'prod-010',
        sku: 'INST-AC-BASIC',
        name: 'Basic AC Charger Installation',
        description: 'Professional installation service for AC chargers up to 22kW including electrical work and commissioning.',
        category: 'services',
        subcategory: 'installation',
        brand: 'ChargeSource',
        model: 'Installation Service',
        specifications: {
          chargerTypes: 'AC chargers up to 22kW',
          includes: ['Site assessment', 'Electrical installation', 'Commissioning', 'Certificate of compliance'],
          duration: '4-6 hours',
          warranty: '12 months workmanship',
          requirements: 'Existing electrical supply within 5m',
          excludes: 'Trenching, concrete work, permit fees'
        },
        pricing: {
          cost: 450,
          listPrice: 650,
          recommendedRetail: 850
        },
        inventory: {
          inStock: 999,
          reserved: 0,
          available: 999,
          leadTime: '1-2 weeks booking'
        },
        supplier: {
          id: 'sup-chargesource',
          name: 'ChargeSource Services',
          partNumber: 'CS-INST-AC-BASIC',
          minimumOrderQuantity: 1
        },
        images: ['/images/services/installation-basic.jpg'],
        documents: ['/docs/installation-service-terms.pdf'],
        isActive: true,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      }
    ];
  }

  // Public methods
  getCategories(): ProductCategory[] {
    return [...this.categories];
  }

  getSubcategories(categoryId?: string): ProductSubcategory[] {
    if (categoryId) {
      return this.categories
        .find(cat => cat.id === categoryId)?.subcategories || [];
    }
    return this.categories.flatMap(cat => cat.subcategories);
  }

  getProducts(filter?: ProductFilter): ProductCatalogueItem[] {
    let filteredProducts = [...this.products];

    if (filter) {
      if (filter.category) {
        filteredProducts = filteredProducts.filter(p => p.category === filter.category);
      }

      if (filter.subcategory) {
        filteredProducts = filteredProducts.filter(p => p.subcategory === filter.subcategory);
      }

      if (filter.brand) {
        filteredProducts = filteredProducts.filter(p => 
          p.brand.toLowerCase().includes(filter.brand!.toLowerCase())
        );
      }

      if (filter.powerRating && filter.powerRating.length > 0) {
        filteredProducts = filteredProducts.filter(p => 
          filter.powerRating!.some(rating => 
            p.specifications.powerRating?.includes(rating)
          )
        );
      }

      if (filter.priceRange) {
        filteredProducts = filteredProducts.filter(p => 
          p.pricing.recommendedRetail >= filter.priceRange!.min &&
          p.pricing.recommendedRetail <= filter.priceRange!.max
        );
      }

      if (filter.availability && filter.availability !== 'all') {
        filteredProducts = filteredProducts.filter(p => {
          switch (filter.availability) {
            case 'in-stock':
              return p.inventory.available > 10;
            case 'low-stock':
              return p.inventory.available > 0 && p.inventory.available <= 10;
            case 'back-order':
              return p.inventory.available === 0;
            default:
              return true;
          }
        });
      }

      if (filter.searchTerm) {
        const searchLower = filter.searchTerm.toLowerCase();
        filteredProducts = filteredProducts.filter(p =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower) ||
          p.sku.toLowerCase().includes(searchLower) ||
          p.brand.toLowerCase().includes(searchLower) ||
          p.model.toLowerCase().includes(searchLower)
        );
      }
    }

    return filteredProducts.filter(p => p.isActive);
  }

  getProduct(productId: string): ProductCatalogueItem | null {
    return this.products.find(p => p.id === productId) || null;
  }

  getProductBySku(sku: string): ProductCatalogueItem | null {
    return this.products.find(p => p.sku === sku) || null;
  }

  getBrands(): string[] {
    const brands = [...new Set(this.products.map(p => p.brand))];
    return brands.sort();
  }

  getPowerRatings(): string[] {
    const ratings = [...new Set(
      this.products
        .map(p => p.specifications.powerRating)
        .filter(Boolean)
    )] as string[];
    return ratings.sort();
  }

  getProductCount(filter?: ProductFilter): number {
    return this.getProducts(filter).length;
  }

  // Admin CRUD operations
  addProduct(product: Omit<ProductCatalogueItem, 'id' | 'createdAt' | 'updatedAt'>): ProductCatalogueItem {
    const newProduct: ProductCatalogueItem = {
      ...product,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.products.unshift(newProduct);
    this.saveToStorage();
    return newProduct;
  }

  updateProduct(productId: string, updates: Partial<ProductCatalogueItem>): ProductCatalogueItem | null {
    const productIndex = this.products.findIndex(p => p.id === productId);
    if (productIndex === -1) return null;

    const updatedProduct = {
      ...this.products[productIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.products[productIndex] = updatedProduct;
    this.saveToStorage();
    return updatedProduct;
  }

  deleteProduct(productId: string): boolean {
    const productIndex = this.products.findIndex(p => p.id === productId);
    if (productIndex === -1) return false;

    this.products.splice(productIndex, 1);
    this.saveToStorage();
    return true;
  }

  // Storage operations
  private saveToStorage(): void {
    try {
      localStorage.setItem('chargeSourceProducts', JSON.stringify(this.products));
    } catch (error) {
      console.error('Error saving products to storage:', error);
    }
  }

  private loadFromStorage(): void {
    try {
      const storedProducts = localStorage.getItem('chargeSourceProducts');
      if (storedProducts) {
        this.products = JSON.parse(storedProducts);
      }
    } catch (error) {
      console.error('Error loading products from storage:', error);
    }
  }

  // Analytics methods
  getPopularProducts(limit: number = 10): ProductCatalogueItem[] {
    // In a real implementation, this would be based on sales/quote data
    return this.products
      .filter(p => p.isActive)
      .sort((a, b) => b.inventory.reserved - a.inventory.reserved)
      .slice(0, limit);
  }

  getLowStockProducts(threshold: number = 10): ProductCatalogueItem[] {
    return this.products
      .filter(p => p.isActive && p.inventory.available <= threshold)
      .sort((a, b) => a.inventory.available - b.inventory.available);
  }

  getNewProducts(days: number = 30): ProductCatalogueItem[] {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return this.products
      .filter(p => p.isActive && new Date(p.createdAt) > cutoffDate)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}

export const productCatalog = new ProductCatalogService();
export default productCatalog;
