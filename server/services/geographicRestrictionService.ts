import { eq, and, or, sql } from "drizzle-orm";
import { db } from "../db";
import { products, ebooks, type Product, type Ebook } from "@shared/schema";

// Country code mappings for geographic restrictions
export const COUNTRY_CODES = {
  // Major countries
  INDIA: 'IN',
  USA: 'US',
  UNITED_KINGDOM: 'GB',
  CANADA: 'CA',
  AUSTRALIA: 'AU',
  GERMANY: 'DE',
  FRANCE: 'FR',
  JAPAN: 'JP',
  CHINA: 'CN',
  BRAZIL: 'BR',
  // Add more as needed
} as const;

// Product type classifications for geographic restrictions
export const PRODUCT_TYPES = {
  GARDENING_TOOLS: 'gardening-tools',
  EBOOKS: 'ebooks',
  CONSULTATION: 'consultation',
  SUBSCRIPTION: 'subscription'
} as const;

export interface UserLocation {
  countryCode: string;
  regionCode?: string;
  ipAddress?: string;
  detectedCountry?: string;
}

export interface GeographicAvailability {
  isAvailable: boolean;
  reason?: string;
  allowedCountries?: string[];
  restrictedCountries?: string[];
  alternativeOptions?: string[];
}

export interface GeographicRestriction {
  allowedCountries: string[];
  restrictedCountries: string[];
  globalAccess: boolean;
  regionRestrictions: Record<string, any>;
}

export class GeographicRestrictionService {
  
  /**
   * Check if a product is available in the user's location
   */
  static async checkProductAvailability(
    productId: string, 
    userLocation: UserLocation
  ): Promise<GeographicAvailability> {
    try {
      const [product] = await db.select().from(products).where(eq(products.id, productId));
      
      if (!product) {
        return {
          isAvailable: false,
          reason: 'Product not found'
        };
      }

      // Parse geographic restrictions
      const allowedCountries = (product.allowedCountries as string[]) || [];
      const restrictedCountries = (product.restrictedCountries as string[]) || [];
      const globalAccess = product.globalAccess || false;
      const regionRestrictions = (product.regionRestrictions as Record<string, any>) || {};

      return this.evaluateAvailability({
        allowedCountries,
        restrictedCountries,
        globalAccess,
        regionRestrictions
      }, userLocation, 'product');

    } catch (error) {
      console.error('Error checking product availability:', error);
      return {
        isAvailable: false,
        reason: 'Unable to verify availability'
      };
    }
  }

  /**
   * Check if an e-book is available in the user's location
   */
  static async checkEbookAvailability(
    ebookId: string, 
    userLocation: UserLocation
  ): Promise<GeographicAvailability> {
    try {
      const [ebook] = await db.select().from(ebooks).where(eq(ebooks.id, ebookId));
      
      if (!ebook) {
        return {
          isAvailable: false,
          reason: 'E-book not found'
        };
      }

      // Parse geographic restrictions
      const allowedCountries = (ebook.allowedCountries as string[]) || [];
      const restrictedCountries = (ebook.restrictedCountries as string[]) || [];
      const globalAccess = ebook.globalAccess !== false; // E-books default to global access
      const regionRestrictions = (ebook.regionRestrictions as Record<string, any>) || {};

      return this.evaluateAvailability({
        allowedCountries,
        restrictedCountries,
        globalAccess,
        regionRestrictions
      }, userLocation, 'ebook');

    } catch (error) {
      console.error('Error checking e-book availability:', error);
      return {
        isAvailable: false,
        reason: 'Unable to verify availability'
      };
    }
  }

  /**
   * Filter products based on user's geographic location
   */
  static async filterAvailableProducts(
    userLocation: UserLocation,
    category?: string
  ): Promise<Product[]> {
    try {
      let query = db.select().from(products).where(eq(products.isActive, true));
      
      if (category) {
        query = query.where(eq(products.category, category));
      }

      const allProducts = await query;
      const availableProducts: Product[] = [];

      // Check each product for geographic availability
      for (const product of allProducts) {
        const allowedCountries = (product.allowedCountries as string[]) || [];
        const restrictedCountries = (product.restrictedCountries as string[]) || [];
        const globalAccess = product.globalAccess || false;

        const availability = this.evaluateAvailability({
          allowedCountries,
          restrictedCountries,
          globalAccess,
          regionRestrictions: {}
        }, userLocation, 'product');

        if (availability.isAvailable) {
          availableProducts.push(product);
        }
      }

      return availableProducts;
    } catch (error) {
      console.error('Error filtering available products:', error);
      return [];
    }
  }

  /**
   * Filter e-books based on user's geographic location
   */
  static async filterAvailableEbooks(
    userLocation: UserLocation,
    category?: string
  ): Promise<Ebook[]> {
    try {
      let query = db.select().from(ebooks).where(
        and(
          eq(ebooks.isActive, true),
          eq(ebooks.status, 'published')
        )
      );
      
      if (category) {
        query = query.where(eq(ebooks.category, category));
      }

      const allEbooks = await query;
      const availableEbooks: Ebook[] = [];

      // Check each e-book for geographic availability (most should be globally available)
      for (const ebook of allEbooks) {
        const allowedCountries = (ebook.allowedCountries as string[]) || [];
        const restrictedCountries = (ebook.restrictedCountries as string[]) || [];
        const globalAccess = ebook.globalAccess !== false; // Default true for e-books

        const availability = this.evaluateAvailability({
          allowedCountries,
          restrictedCountries,
          globalAccess,
          regionRestrictions: {}
        }, userLocation, 'ebook');

        if (availability.isAvailable) {
          availableEbooks.push(ebook);
        }
      }

      return availableEbooks;
    } catch (error) {
      console.error('Error filtering available e-books:', error);
      return [];
    }
  }

  /**
   * Core logic to evaluate geographic availability
   */
  private static evaluateAvailability(
    restrictions: GeographicRestriction,
    userLocation: UserLocation,
    itemType: 'product' | 'ebook'
  ): GeographicAvailability {
    const { allowedCountries, restrictedCountries, globalAccess } = restrictions;
    const userCountry = userLocation.countryCode.toUpperCase();

    // Check if explicitly restricted
    if (restrictedCountries.length > 0) {
      const isRestricted = restrictedCountries.some(country => 
        country.toUpperCase() === userCountry
      );
      if (isRestricted) {
        return {
          isAvailable: false,
          reason: `${itemType === 'product' ? 'Product' : 'E-book'} not available in your region`,
          restrictedCountries,
          alternativeOptions: this.getAlternativeOptions(itemType, userLocation)
        };
      }
    }

    // Check if explicitly allowed
    if (allowedCountries.length > 0) {
      const isAllowed = allowedCountries.some(country => 
        country.toUpperCase() === userCountry
      );
      if (isAllowed) {
        return {
          isAvailable: true,
          allowedCountries
        };
      } else {
        return {
          isAvailable: false,
          reason: `${itemType === 'product' ? 'Product' : 'E-book'} only available in specific regions`,
          allowedCountries,
          alternativeOptions: this.getAlternativeOptions(itemType, userLocation)
        };
      }
    }

    // Check global access
    if (globalAccess) {
      return {
        isAvailable: true,
        reason: 'Available worldwide'
      };
    }

    // Apply default rules based on item type
    return this.applyDefaultRules(itemType, userLocation);
  }

  /**
   * Apply default geographic rules for different item types
   */
  private static applyDefaultRules(
    itemType: 'product' | 'ebook',
    userLocation: UserLocation
  ): GeographicAvailability {
    const userCountry = userLocation.countryCode.toUpperCase();

    switch (itemType) {
      case 'product':
        // Gardening tools: Only available in India by default
        if (userCountry === COUNTRY_CODES.INDIA) {
          return {
            isAvailable: true,
            reason: 'Available in India'
          };
        } else {
          return {
            isAvailable: false,
            reason: 'Gardening tools currently only available in India',
            alternativeOptions: ['Consider e-books available worldwide', 'Plant identification services available globally']
          };
        }

      case 'ebook':
        // E-books: Available worldwide by default
        return {
          isAvailable: true,
          reason: 'E-books available worldwide'
        };

      default:
        return {
          isAvailable: false,
          reason: 'Unknown item type'
        };
    }
  }

  /**
   * Provide alternative options based on user location and item type
   */
  private static getAlternativeOptions(
    itemType: 'product' | 'ebook',
    userLocation: UserLocation
  ): string[] {
    const alternatives: string[] = [];

    if (itemType === 'product') {
      // If gardening tools not available, suggest e-books and services
      alternatives.push(
        'Browse our comprehensive e-book collection',
        'Access plant identification services',
        'Book expert consultations',
        'Join our global gardening community'
      );
    } else if (itemType === 'ebook') {
      // If e-books not available (rare), suggest other services
      alternatives.push(
        'Access plant identification services',
        'Book expert consultations',
        'Explore free blog content'
      );
    }

    return alternatives;
  }

  /**
   * Get user's location from IP address or request headers
   */
  static async detectUserLocation(req: any): Promise<UserLocation> {
    try {
      // Try to get country from headers first
      const countryHeader = req.headers['cf-ipcountry'] || 
                           req.headers['x-country-code'] || 
                           req.headers['cloudfront-viewer-country'];

      if (countryHeader) {
        return {
          countryCode: countryHeader.toUpperCase(),
          detectedCountry: countryHeader.toUpperCase(),
          ipAddress: this.getClientIP(req)
        };
      }

      // Fallback to IP geolocation (would require external service)
      // For now, return default location
      return {
        countryCode: 'US', // Default to US if unable to detect
        detectedCountry: 'US',
        ipAddress: this.getClientIP(req)
      };

    } catch (error) {
      console.error('Error detecting user location:', error);
      return {
        countryCode: 'US',
        detectedCountry: 'US'
      };
    }
  }

  /**
   * Extract client IP address from request
   */
  private static getClientIP(req: any): string {
    return req.headers['x-forwarded-for']?.split(',')[0] ||
           req.headers['x-real-ip'] ||
           req.connection?.remoteAddress ||
           req.socket?.remoteAddress ||
           req.ip ||
           'unknown';
  }

  /**
   * Initialize default geographic restrictions for existing products
   */
  static async initializeDefaultRestrictions(): Promise<void> {
    try {
      console.log('Initializing default geographic restrictions...');

      // Set gardening tools to India-only by default
      await db.update(products)
        .set({
          allowedCountries: [COUNTRY_CODES.INDIA],
          globalAccess: false,
          updatedAt: new Date()
        })
        .where(eq(products.category, 'gardening-tools'));

      // Set e-books to global access by default
      await db.update(ebooks)
        .set({
          globalAccess: true,
          allowedCountries: [],
          restrictedCountries: [],
          updatedAt: new Date()
        })
        .where(eq(ebooks.isActive, true));

      console.log('Default geographic restrictions initialized successfully');
    } catch (error) {
      console.error('Error initializing geographic restrictions:', error);
    }
  }

  /**
   * Update geographic restrictions for a specific product
   */
  static async updateProductRestrictions(
    productId: string,
    restrictions: Partial<GeographicRestriction>
  ): Promise<boolean> {
    try {
      const updateData: any = {
        updatedAt: new Date()
      };

      if (restrictions.allowedCountries !== undefined) {
        updateData.allowedCountries = restrictions.allowedCountries;
      }
      if (restrictions.restrictedCountries !== undefined) {
        updateData.restrictedCountries = restrictions.restrictedCountries;
      }
      if (restrictions.globalAccess !== undefined) {
        updateData.globalAccess = restrictions.globalAccess;
      }
      if (restrictions.regionRestrictions !== undefined) {
        updateData.regionRestrictions = restrictions.regionRestrictions;
      }

      await db.update(products)
        .set(updateData)
        .where(eq(products.id, productId));

      return true;
    } catch (error) {
      console.error('Error updating product restrictions:', error);
      return false;
    }
  }

  /**
   * Update geographic restrictions for a specific e-book
   */
  static async updateEbookRestrictions(
    ebookId: string,
    restrictions: Partial<GeographicRestriction>
  ): Promise<boolean> {
    try {
      const updateData: any = {
        updatedAt: new Date()
      };

      if (restrictions.allowedCountries !== undefined) {
        updateData.allowedCountries = restrictions.allowedCountries;
      }
      if (restrictions.restrictedCountries !== undefined) {
        updateData.restrictedCountries = restrictions.restrictedCountries;
      }
      if (restrictions.globalAccess !== undefined) {
        updateData.globalAccess = restrictions.globalAccess;
      }
      if (restrictions.regionRestrictions !== undefined) {
        updateData.regionRestrictions = restrictions.regionRestrictions;
      }

      await db.update(ebooks)
        .set(updateData)
        .where(eq(ebooks.id, ebookId));

      return true;
    } catch (error) {
      console.error('Error updating e-book restrictions:', error);
      return false;
    }
  }

  /**
   * Get geographic statistics for admin dashboard
   */
  static async getGeographicStats(): Promise<{
    totalProducts: number;
    productsWithRestrictions: number;
    totalEbooks: number;
    ebooksWithRestrictions: number;
    countryDistribution: Record<string, number>;
  }> {
    try {
      const [totalProducts] = await db.select({ count: sql<number>`count(*)` }).from(products);
      const [totalEbooks] = await db.select({ count: sql<number>`count(*)` }).from(ebooks);

      // Count products with restrictions (non-global access)
      const [productsWithRestrictions] = await db.select({ count: sql<number>`count(*)` })
        .from(products)
        .where(eq(products.globalAccess, false));

      // Count e-books with restrictions  
      const [ebooksWithRestrictions] = await db.select({ count: sql<number>`count(*)` })
        .from(ebooks)
        .where(eq(ebooks.globalAccess, false));

      return {
        totalProducts: totalProducts?.count || 0,
        productsWithRestrictions: productsWithRestrictions?.count || 0,
        totalEbooks: totalEbooks?.count || 0,
        ebooksWithRestrictions: ebooksWithRestrictions?.count || 0,
        countryDistribution: {
          [COUNTRY_CODES.INDIA]: 100, // All gardening tools
          'GLOBAL': 100 // All e-books
        }
      };
    } catch (error) {
      console.error('Error getting geographic stats:', error);
      return {
        totalProducts: 0,
        productsWithRestrictions: 0,
        totalEbooks: 0,
        ebooksWithRestrictions: 0,
        countryDistribution: {}
      };
    }
  }
}