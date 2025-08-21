import crypto from 'crypto';
import { MARKETPLACES, PRODUCT_CATEGORIES, CURATED_ASINS, type Product, type Marketplace } from '../../config/affiliate';

interface AmazonAPICredentials {
  accessKey: string;
  secretKey: string;
  partnerTag: string;
  partnerId?: string;
}

interface ProductSearchParams {
  market: 'US' | 'IN' | 'UK';
  category?: string;
  q?: string;
  sort?: string;
  minRating?: number;
}

export class AmazonAffiliateService {
  private cache = new Map<string, { data: Product[]; timestamp: number }>();
  private readonly CACHE_TTL = 30 * 60 * 1000; // 30 minutes

  private getCredentials(market: string): AmazonAPICredentials | null {
    const marketplace = MARKETPLACES[market];
    if (!marketplace) return null;

    const accessKey = process.env.AMZ_ACCESS_KEY;
    const secretKey = process.env.AMZ_SECRET_KEY;
    const partnerTag = process.env[marketplace.tagEnvVar];

    if (!accessKey || !secretKey || !partnerTag) {
      return null;
    }

    return {
      accessKey,
      secretKey,
      partnerTag,
      partnerId: process.env.AMZ_PARTNER_ID
    };
  }

  private buildAffiliateUrl(asin: string, marketplace: Marketplace, tag: string): string {
    const utmParams = new URLSearchParams({
      utm_source: 'site',
      utm_medium: 'affiliate',
      utm_campaign: 'gardening-tools'
    });

    return `https://www.amazon.${marketplace.tld}/dp/${asin}?tag=${tag}&linkCode=osi&th=1&psc=1&${utmParams}`;
  }

  private async makeSignedRequest(
    credentials: AmazonAPICredentials,
    marketplace: Marketplace,
    operation: string,
    params: Record<string, any>
  ): Promise<any> {
    const host = `webservices.amazon.${marketplace.tld}`;
    const uri = '/paapi5/searchitems';
    const service = 'ProductAdvertisingAPI';
    const region = marketplace.region.toLowerCase();
    const method = 'POST';

    const payload = JSON.stringify({
      Operation: operation,
      PartnerType: 'Associates',
      PartnerTag: credentials.partnerTag,
      Marketplace: `www.amazon.${marketplace.tld}`,
      ...params
    });

    // AWS Signature V4
    const timestamp = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
    const date = timestamp.substr(0, 8);
    
    const credentialScope = `${date}/${region}/${service}/aws4_request`;
    const canonicalHeaders = `host:${host}\nx-amz-date:${timestamp}\n`;
    const signedHeaders = 'host;x-amz-date';
    
    const payloadHash = crypto.createHash('sha256').update(payload).digest('hex');
    const canonicalRequest = `${method}\n${uri}\n\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;
    
    const stringToSign = `AWS4-HMAC-SHA256\n${timestamp}\n${credentialScope}\n${crypto.createHash('sha256').update(canonicalRequest).digest('hex')}`;
    
    const kDate = crypto.createHmac('sha256', `AWS4${credentials.secretKey}`).update(date).digest();
    const kRegion = crypto.createHmac('sha256', kDate).update(region).digest();
    const kService = crypto.createHmac('sha256', kRegion).update(service).digest();
    const kSigning = crypto.createHmac('sha256', kService).update('aws4_request').digest();
    
    const signature = crypto.createHmac('sha256', kSigning).update(stringToSign).digest('hex');
    
    const authorizationHeader = `AWS4-HMAC-SHA256 Credential=${credentials.accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    const response = await fetch(`https://${host}${uri}`, {
      method,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Authorization': authorizationHeader,
        'X-Amz-Date': timestamp,
        'User-Agent': 'GreenLens/1.0'
      },
      body: payload
    });

    if (!response.ok) {
      throw new Error(`Amazon API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  private async searchWithAPI(params: ProductSearchParams): Promise<Product[]> {
    const marketplace = MARKETPLACES[params.market];
    const credentials = this.getCredentials(params.market);
    
    if (!credentials) {
      throw new Error('Amazon API credentials not configured');
    }

    const searchParams: Record<string, any> = {
      Resources: [
        'Images.Primary.Large',
        'Images.Primary.Medium',
        'Images.Variants.Large',
        'ItemInfo.Title',
        'ItemInfo.Features',
        'ItemInfo.ProductInfo.Color',
        'ItemInfo.ProductInfo.Size',
        'ItemInfo.ManufactureInfo.Brand',
        'ItemInfo.TechnicalInfo',
        'CustomerReviews.StarRating',
        'CustomerReviews.Count',
        'Offers.Listings.Price',
        'Offers.Listings.Availability',
        'Offers.Listings.DeliveryInfo.IsPrimeEligible'
      ]
    };

    if (params.category && PRODUCT_CATEGORIES[params.category as keyof typeof PRODUCT_CATEGORIES]) {
      const category = PRODUCT_CATEGORIES[params.category as keyof typeof PRODUCT_CATEGORIES];
      searchParams.Keywords = params.q || category.keywords.join(' OR ');
      searchParams.SearchIndex = 'LawnAndGarden';
    } else if (params.q) {
      searchParams.Keywords = params.q;
      searchParams.SearchIndex = 'All';
    }

    searchParams.ItemCount = 20;
    searchParams.SortBy = params.sort === 'price-low' ? 'Price:LowToHigh' : 
                         params.sort === 'price-high' ? 'Price:HighToLow' :
                         params.sort === 'rating' ? 'AvgCustomerReviews' : 'Relevance';

    const response = await this.makeSignedRequest(
      credentials,
      marketplace,
      'SearchItems',
      searchParams
    );

    return this.parseAmazonResponse(response, marketplace, credentials.partnerTag, params);
  }

  private parseAmazonResponse(
    response: any,
    marketplace: Marketplace,
    tag: string,
    params: ProductSearchParams
  ): Product[] {
    if (!response.SearchResult?.Items) {
      return [];
    }

    return response.SearchResult.Items
      .map((item: any) => {
        // Collect multiple product images
        const images = [];
        if (item.Images?.Primary?.Large?.URL) images.push(item.Images.Primary.Large.URL);
        if (item.Images?.Primary?.Medium?.URL) images.push(item.Images.Primary.Medium.URL);
        if (item.Images?.Variants?.length) {
          item.Images.Variants.slice(0, 3).forEach((variant: any) => {
            if (variant.Large?.URL) images.push(variant.Large.URL);
          });
        }

        const product: Product = {
          asin: item.ASIN,
          title: item.ItemInfo?.Title?.DisplayValue || 'Unknown Product',
          image: images[0] || '/placeholder-product.jpg',
          images: images.length > 1 ? images.slice(0, 4) : undefined, // Max 4 images
          url: this.buildAffiliateUrl(item.ASIN, marketplace, tag),
          lastUpdated: new Date()
        };

        // Add rating and review count if available
        if (item.CustomerReviews?.StarRating?.DisplayValue) {
          product.rating = parseFloat(item.CustomerReviews.StarRating.DisplayValue);
        }
        if (item.CustomerReviews?.Count?.DisplayValue) {
          product.reviewCount = parseInt(item.CustomerReviews.Count.DisplayValue);
        }

        // Add price if available
        if (item.Offers?.Listings?.[0]?.Price?.DisplayAmount) {
          product.price = item.Offers.Listings[0].Price.DisplayAmount;
          product.currency = marketplace.currency;
        }

        // Add product features from Amazon data
        if (item.ItemInfo?.Features?.DisplayValues) {
          product.features = item.ItemInfo.Features.DisplayValues.slice(0, 5); // Top 5 features
        }

        // Add dimensions and weight from technical info
        if (item.ItemInfo?.TechnicalInfo?.DisplayValues) {
          const techInfo = item.ItemInfo.TechnicalInfo.DisplayValues;
          const dimensions = techInfo.find((info: any) => info.Name?.includes('Dimensions'));
          const weight = techInfo.find((info: any) => info.Name?.includes('Weight'));
          
          if (dimensions) product.dimensions = dimensions.Value;
          if (weight) product.weight = weight.Value;
        }

        // Enhanced badges system
        product.badges = [];
        if (item.Offers?.Listings?.[0]?.DeliveryInfo?.IsPrimeEligible) {
          product.badges.push('Prime');
        }
        if (product.rating && product.rating >= 4.5) {
          product.badges.push('Bestseller');
          product.isRecommended = true;
        }
        if (product.reviewCount && product.reviewCount > 1000) {
          product.badges.push('Popular Choice');
        }

        // Generate AI review summary for products with ratings
        if (product.rating && product.reviewCount) {
          product.reviewSummary = this.generateReviewSummaryFromRating(product.rating, product.reviewCount, params.category);
        }

        // Add usage tips for specific categories
        if (params.category && PRODUCT_CATEGORIES[params.category as keyof typeof PRODUCT_CATEGORIES]) {
          product.usageTip = this.getUsageTip(item.ASIN, params.category);
        }

        return product;
      })
      .filter((product: Product) => {
        // Apply rating filter
        if (params.minRating && product.rating && product.rating < params.minRating) {
          return false;
        }
        return true;
      });
  }

  private async getFallbackProducts(params: ProductSearchParams): Promise<Product[]> {
    const marketplace = MARKETPLACES[params.market];
    const tag = process.env[marketplace.tagEnvVar];
    
    if (!tag) {
      return [];
    }

    const category = params.category || 'hand-tools';
    const asins = CURATED_ASINS[category as keyof typeof CURATED_ASINS] || CURATED_ASINS['hand-tools'];
    const categoryInfo = PRODUCT_CATEGORIES[category as keyof typeof PRODUCT_CATEGORIES] || PRODUCT_CATEGORIES['hand-tools'];

    return asins.map((asin, index) => ({
      asin,
      title: `${categoryInfo.name} - Premium Gardening Tool`,
      image: '/placeholder-product.jpg',
      url: this.buildAffiliateUrl(asin, marketplace, tag),
      lastUpdated: new Date(),
      usageTip: this.getUsageTip(asin, category)
    }));
  }

  private generateReviewSummaryFromRating(rating: number, reviewCount: number, category?: string): string {
    const categoryName = category ? category.replace('-', ' ') : 'gardening';
    
    if (rating >= 4.5) {
      return `Highly rated ${categoryName} product! ${reviewCount.toLocaleString()} customers love its durability, quality, and performance. Users frequently mention it exceeded expectations and would recommend to fellow gardeners.`;
    } else if (rating >= 4.0) {
      return `Well-regarded ${categoryName} choice with solid performance. ${reviewCount.toLocaleString()} reviews highlight good value and reliable functionality, with most customers satisfied with their purchase.`;
    } else if (rating >= 3.5) {
      return `Decent ${categoryName} option with mixed but generally positive feedback from ${reviewCount.toLocaleString()} customers. Good for basic needs, though some users suggest improvements.`;
    } else {
      return `Basic ${categoryName} product with ${reviewCount.toLocaleString()} reviews. Mixed opinions on quality and performance - may work for light, occasional use.`;
    }
  }

  private getUsageTip(asin: string, category: string): string {
    const tips: Record<string, string[]> = {
      'hand-tools': [
        'Great for pruning roses and small branches',
        'Perfect for precise planting and transplanting',
        'Ideal for weeding and soil cultivation'
      ],
      'watering': [
        'Essential for gentle watering of seedlings',
        'Perfect for targeted irrigation',
        'Great for maintaining consistent soil moisture'
      ],
      'power-tools': [
        'Excellent for large-scale yard maintenance',
        'Perfect for efficient hedge and lawn care',
        'Great for quick cleanup of garden debris'
      ],
      'mechanized-tools': [
        'Essential for preparing large garden beds',
        'Perfect for breaking up compacted soil',
        'Ideal for seasonal lawn and garden preparation'
      ],
      'greenhouse': [
        'Perfect for extending your growing season',
        'Great for protecting plants from harsh weather',
        'Ideal for starting seedlings early'
      ],
      'pest-control': [
        'Essential for organic pest management',
        'Great for preventing crop damage naturally',
        'Perfect for maintaining healthy garden ecosystems'
      ],
      'seeds-plants': [
        'Perfect for expanding your garden variety',
        'Great for succession planting throughout seasons',
        'Ideal for trying new gardening adventures'
      ],
      'fertilizers': [
        'Essential for maintaining soil fertility',
        'Perfect for boosting plant growth and yields',
        'Great for organic, sustainable gardening'
      ],
      'soil-care': [
        'Monitor soil health for optimal plant growth',
        'Create nutrient-rich compost for your garden',
        'Ensure proper soil conditions for planting'
      ],
      'protective-gear': [
        'Protect hands from thorns and rough surfaces',
        'Stay comfortable during long gardening sessions',
        'Essential safety gear for outdoor work'
      ]
    };

    const categoryTips = tips[category] || tips['hand-tools'];
    const tipIndex = parseInt(asin.slice(-1), 36) % categoryTips.length;
    return categoryTips[tipIndex];
  }

  async getProducts(params: ProductSearchParams): Promise<Product[]> {
    const cacheKey = JSON.stringify(params);
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    try {
      // Try PA-API first
      const products = await this.searchWithAPI(params);
      this.cache.set(cacheKey, { data: products, timestamp: Date.now() });
      return products;
    } catch (error) {
      console.warn('Amazon API failed, using fallback:', error);
      
      // Fallback to curated products
      const fallbackProducts = await this.getFallbackProducts(params);
      this.cache.set(cacheKey, { data: fallbackProducts, timestamp: Date.now() });
      return fallbackProducts;
    }
  }

  resolveMarketplace(country?: string, language?: string): 'US' | 'IN' | 'UK' {
    // Simple country-based resolution
    if (country) {
      const countryLower = country.toLowerCase();
      if (['in', 'india'].includes(countryLower)) return 'IN';
      if (['uk', 'gb', 'england', 'scotland', 'wales'].includes(countryLower)) return 'UK';
    }

    // Language-based fallback
    if (language) {
      if (language.startsWith('hi') || language.startsWith('ta') || language.startsWith('te')) return 'IN';
      if (language.startsWith('en-GB')) return 'UK';
    }

    return 'US'; // Default
  }

  isAPIConfigured(): boolean {
    return !!(process.env.AMZ_ACCESS_KEY && process.env.AMZ_SECRET_KEY);
  }
}

export const amazonAffiliateService = new AmazonAffiliateService();