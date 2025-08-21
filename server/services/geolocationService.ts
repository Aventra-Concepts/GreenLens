export class GeolocationService {
  // Detect user country from IP address
  static async detectUserCountry(ip: string): Promise<string> {
    try {
      // For development, return default country
      if (process.env.NODE_ENV === 'development' || !ip || ip === '127.0.0.1' || ip === '::1') {
        return 'US'; // Default to US for development
      }

      // In production, you could integrate with a real geolocation service
      // For now, return US as default
      return 'US';
    } catch (error) {
      console.error('Error detecting user country:', error);
      return 'US'; // Fallback to US
    }
  }

  // Get available products based on country - USA optimized
  static getAvailableProducts(country: string) {
    const isUS = country === 'US';
    const isIndia = country === 'IN';
    const hasGardeningTools = isUS || isIndia;
    
    return {
      country,
      canAccessEbooks: true, // E-books are available globally
      canAccessGardeningTools: hasGardeningTools, // Now available in USA and India
      restrictedMessage: hasGardeningTools 
        ? null 
        : 'Gardening tools are currently available for customers in the United States and India. E-books are available worldwide.',
      availableCategories: {
        ebooks: [
          'American Gardening Guides',
          'Plant Care for US Zones',
          'Organic Farming USA',
          'Indoor Plants',
          'American Landscaping',
          'Hydroponics',
          'Permaculture',
          'Pest Control',
          'US Soil Management',
          'Seasonal Gardening by Zone',
          'American Herb Gardens',
          'Vegetable Growing in USA'
        ],
        gardeningTools: hasGardeningTools ? (isUS ? [
          'American Hand Tools',
          'Irrigation Systems',
          'Planters & Containers',
          'US Organic Fertilizers',
          'Native American Seeds',
          'Premium Soil Mixes'
        ] : [
          'Hand Tools',
          'Watering Equipment',
          'Plant Pots',
          'Fertilizers',
          'Seeds',
          'Soil & Compost'
        ]) : []
      }
    };
  }

  // Check if gardening tools are available in user's country - USA optimized
  static isGardeningToolsAvailable(country: string): boolean {
    return country === 'US' || country === 'IN';
  }

  // Check if e-books are available in user's country
  static isEbooksAvailable(country: string): boolean {
    return true; // E-books are available globally
  }

  // Get localized currency based on country
  static getLocalCurrency(country: string): string {
    const currencyMap: { [key: string]: string } = {
      'US': 'USD',
      'IN': 'INR',
      'GB': 'GBP',
      'CA': 'CAD',
      'AU': 'AUD',
      'DE': 'EUR',
      'FR': 'EUR',
      'IT': 'EUR',
      'ES': 'EUR',
      'JP': 'JPY',
      'KR': 'KRW',
      'CN': 'CNY',
      'BR': 'BRL',
      'MX': 'MXN'
    };

    return currencyMap[country] || 'USD';
  }

  // Get country-specific payment methods
  static getPaymentMethods(country: string): string[] {
    const paymentMethodsMap: { [key: string]: string[] } = {
      'US': ['stripe', 'paypal'],
      'IN': ['razorpay', 'cashfree', 'stripe'],
      'GB': ['stripe', 'paypal'],
      'CA': ['stripe', 'paypal'],
      'AU': ['stripe', 'paypal'],
      'DE': ['stripe', 'paypal'],
      'FR': ['stripe', 'paypal'],
      'IT': ['stripe', 'paypal'],
      'ES': ['stripe', 'paypal'],
      'JP': ['stripe'],
      'KR': ['stripe'],
      'CN': ['stripe'],
      'BR': ['stripe'],
      'MX': ['stripe']
    };

    return paymentMethodsMap[country] || ['stripe'];
  }

  // Get shipping information for physical products
  static getShippingInfo(country: string) {
    return {
      available: country === 'IN', // Only shipping to India for gardening tools
      estimatedDays: country === 'IN' ? '3-7' : null,
      cost: country === 'IN' ? 'Free for orders over ₹500' : null,
      restrictions: country === 'IN' 
        ? null 
        : 'Physical products are currently only shipped within India'
    };
  }

  // Validate if order can be processed for the user's location
  static canProcessOrder(country: string, hasPhysicalProducts: boolean, hasDigitalProducts: boolean): {
    canProcess: boolean;
    reason?: string;
  } {
    // Digital products (e-books) can be processed globally
    if (hasDigitalProducts && !hasPhysicalProducts) {
      return { canProcess: true };
    }

    // Physical products can only be processed for India
    if (hasPhysicalProducts && country !== 'IN') {
      return {
        canProcess: false,
        reason: 'Physical products can only be shipped to addresses in India'
      };
    }

    return { canProcess: true };
  }
}