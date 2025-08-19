import type { Express } from "express";
import { amazonAffiliateService } from "../services/amazonAffiliate";
import { z } from "zod";

const productSearchSchema = z.object({
  market: z.enum(['US', 'IN', 'UK']).optional(),
  category: z.string().optional(),
  q: z.string().optional(),
  sort: z.enum(['relevance', 'rating', 'price-low', 'price-high']).optional(),
  minRating: z.number().min(1).max(5).optional()
});

export function registerAffiliateRoutes(app: Express) {
  // Get products with market localization
  app.get("/api/affiliate/products", async (req, res) => {
    try {
      const params = productSearchSchema.parse(req.query);
      
      // Auto-resolve market if not provided
      if (!params.market) {
        const userAgent = req.get('User-Agent') || '';
        const acceptLanguage = req.get('Accept-Language') || '';
        const country = req.get('CF-IPCountry') || req.get('X-Country'); // Cloudflare or other proxy headers
        
        params.market = amazonAffiliateService.resolveMarketplace(country, acceptLanguage);
      }

      // Ensure market is defined for the service call
      const searchParams = {
        ...params,
        market: params.market as 'US' | 'IN' | 'UK'
      };

      const products = await amazonAffiliateService.getProducts(searchParams);
      
      res.json({
        products,
        market: params.market,
        hasApiAccess: amazonAffiliateService.isAPIConfigured(),
        lastUpdated: new Date().toISOString()
      });
      
    } catch (error: any) {
      console.error("Error fetching affiliate products:", error);
      res.status(500).json({ 
        error: "Failed to fetch products",
        message: error.message 
      });
    }
  });

  // Get marketplace info
  app.get("/api/affiliate/marketplaces", async (req, res) => {
    try {
      const { MARKETPLACES } = await import("../../config/affiliate");
      
      res.json({
        marketplaces: Object.values(MARKETPLACES),
        hasApiAccess: amazonAffiliateService.isAPIConfigured()
      });
      
    } catch (error: any) {
      console.error("Error fetching marketplaces:", error);
      res.status(500).json({ 
        error: "Failed to fetch marketplace info" 
      });
    }
  });

  // Get product categories
  app.get("/api/affiliate/categories", async (req, res) => {
    try {
      const { PRODUCT_CATEGORIES } = await import("../../config/affiliate");
      
      res.json({
        categories: PRODUCT_CATEGORIES
      });
      
    } catch (error: any) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ 
        error: "Failed to fetch categories" 
      });
    }
  });

  // Health check endpoint
  app.get("/api/affiliate/health", async (req, res) => {
    try {
      const hasApiAccess = amazonAffiliateService.isAPIConfigured();
      const configuredTags = [];
      
      if (process.env.AMZ_TAG_US) configuredTags.push('US');
      if (process.env.AMZ_TAG_IN) configuredTags.push('IN');
      if (process.env.AMZ_TAG_UK) configuredTags.push('UK');
      
      res.json({
        status: 'healthy',
        hasApiAccess,
        configuredMarkets: configuredTags,
        timestamp: new Date().toISOString()
      });
      
    } catch (error: any) {
      console.error("Error checking affiliate health:", error);
      res.status(500).json({ 
        status: 'error',
        error: error.message 
      });
    }
  });
}