// Multi-currency pricing service for global subscription support
export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  supportedProviders: string[];
  exchangeRate?: number; // Rate from USD base
}

export interface PlanPricing {
  planId: string;
  basePrice: number; // USD base price
  currencies: {
    [currencyCode: string]: {
      amount: number;
      provider: string[];
    };
  };
}

export class MultiCurrencyPricingService {
  private static instance: MultiCurrencyPricingService;
  
  // Supported currencies with their payment providers
  private readonly currencies: Record<string, CurrencyConfig> = {
    USD: {
      code: 'USD',
      symbol: '$',
      name: 'US Dollar',
      supportedProviders: ['stripe', 'paypal'],
      exchangeRate: 1.0,
    },
    EUR: {
      code: 'EUR',
      symbol: '€',
      name: 'Euro',
      supportedProviders: ['stripe', 'paypal'],
      exchangeRate: 0.85,
    },
    GBP: {
      code: 'GBP',
      symbol: '£',
      name: 'British Pound',
      supportedProviders: ['stripe', 'paypal'],
      exchangeRate: 0.75,
    },
    CAD: {
      code: 'CAD',
      symbol: 'C$',
      name: 'Canadian Dollar',
      supportedProviders: ['stripe', 'paypal'],
      exchangeRate: 1.35,
    },
    AUD: {
      code: 'AUD',
      symbol: 'A$',
      name: 'Australian Dollar',
      supportedProviders: ['stripe', 'paypal'],
      exchangeRate: 1.45,
    },
    INR: {
      code: 'INR',
      symbol: '₹',
      name: 'Indian Rupee',
      supportedProviders: ['razorpay', 'cashfree', 'stripe'],
      exchangeRate: 83.0,
    },
    JPY: {
      code: 'JPY',
      symbol: '¥',
      name: 'Japanese Yen',
      supportedProviders: ['stripe', 'paypal'],
      exchangeRate: 150.0,
    },
    BRL: {
      code: 'BRL',
      symbol: 'R$',
      name: 'Brazilian Real',
      supportedProviders: ['stripe', 'paypal'],
      exchangeRate: 5.0,
    },
    MXN: {
      code: 'MXN',
      symbol: 'MX$',
      name: 'Mexican Peso',
      supportedProviders: ['stripe', 'paypal'],
      exchangeRate: 18.0,
    },
    SGD: {
      code: 'SGD',
      symbol: 'S$',
      name: 'Singapore Dollar',
      supportedProviders: ['stripe', 'paypal'],
      exchangeRate: 1.35,
    },
    NZD: {
      code: 'NZD',
      symbol: 'NZ$',
      name: 'New Zealand Dollar',
      supportedProviders: ['stripe', 'paypal'],
      exchangeRate: 1.60,
    },
    ZAR: {
      code: 'ZAR',
      symbol: 'R',
      name: 'South African Rand',
      supportedProviders: ['stripe', 'paypal'],
      exchangeRate: 18.5,
    },
  };

  // Base plan pricing in USD
  private readonly planPricing: Record<string, PlanPricing> = {
    pro: {
      planId: 'pro',
      basePrice: 9.00,
      currencies: this.generateCurrencyPricing(9.00),
    },
    premium: {
      planId: 'premium',
      basePrice: 19.00,
      currencies: this.generateCurrencyPricing(19.00),
    },
  };

  public static getInstance(): MultiCurrencyPricingService {
    if (!MultiCurrencyPricingService.instance) {
      MultiCurrencyPricingService.instance = new MultiCurrencyPricingService();
    }
    return MultiCurrencyPricingService.instance;
  }

  private generateCurrencyPricing(basePriceUSD: number) {
    const currencies: PlanPricing['currencies'] = {};
    
    Object.values(this.currencies).forEach(currency => {
      const localAmount = basePriceUSD * currency.exchangeRate!;
      const roundedAmount = this.roundToLocalCurrency(localAmount, currency.code);
      
      currencies[currency.code] = {
        amount: roundedAmount,
        provider: currency.supportedProviders,
      };
    });
    
    return currencies;
  }

  private roundToLocalCurrency(amount: number, currencyCode: string): number {
    // Different rounding strategies for different currencies
    switch (currencyCode) {
      case 'JPY':
        return Math.round(amount); // No decimals for Yen
      case 'INR':
        return Math.round(amount); // Round to nearest rupee
      default:
        return Math.round(amount * 100) / 100; // Round to 2 decimal places
    }
  }

  public getSupportedCurrencies(): CurrencyConfig[] {
    return Object.values(this.currencies);
  }

  public getCurrencyInfo(currencyCode: string): CurrencyConfig | null {
    return this.currencies[currencyCode] || null;
  }

  public getPlanPricing(planId: string, currencyCode: string = 'USD'): {
    amount: number;
    currency: CurrencyConfig;
    supportedProviders: string[];
  } | null {
    const plan = this.planPricing[planId];
    const currency = this.currencies[currencyCode];
    
    if (!plan || !currency) {
      return null;
    }

    const pricing = plan.currencies[currencyCode];
    if (!pricing) {
      return null;
    }

    return {
      amount: pricing.amount,
      currency,
      supportedProviders: pricing.provider,
    };
  }

  public getAllPlanPricing(currencyCode: string = 'USD'): Array<{
    planId: string;
    amount: number;
    currency: CurrencyConfig;
    supportedProviders: string[];
  }> {
    const currency = this.currencies[currencyCode];
    if (!currency) {
      return [];
    }

    return Object.values(this.planPricing).map(plan => {
      const pricing = plan.currencies[currencyCode];
      return {
        planId: plan.planId,
        amount: pricing.amount,
        currency,
        supportedProviders: pricing.provider,
      };
    });
  }

  public getOptimalProvider(currencyCode: string, userLocation?: string): string {
    const currency = this.currencies[currencyCode];
    if (!currency || !currency.supportedProviders.length) {
      return 'stripe'; // Fallback to Stripe
    }

    // Provider priority based on currency and location
    const providerPriority: Record<string, string[]> = {
      'USD': ['stripe', 'paypal'],
      'EUR': ['stripe', 'paypal'],
      'GBP': ['stripe', 'paypal'],
      'INR': ['razorpay', 'cashfree', 'stripe'],
      'JPY': ['stripe', 'paypal'],
      'CAD': ['stripe', 'paypal'],
      'AUD': ['stripe', 'paypal'],
      'BRL': ['stripe', 'paypal'],
      'MXN': ['stripe', 'paypal'],
      'SGD': ['stripe', 'paypal'],
      'NZD': ['stripe', 'paypal'],
      'ZAR': ['stripe', 'paypal'],
    };

    const preferredProviders = providerPriority[currencyCode] || ['stripe'];
    
    // Return first available provider for this currency
    for (const provider of preferredProviders) {
      if (currency.supportedProviders.includes(provider)) {
        return provider;
      }
    }

    return currency.supportedProviders[0];
  }

  public detectCurrencyByLocation(userLocation?: string): string {
    if (!userLocation) return 'USD';

    const locationToCurrency: Record<string, string> = {
      'United States': 'USD',
      'Canada': 'CAD',
      'United Kingdom': 'GBP',
      'Australia': 'AUD',
      'New Zealand': 'NZD',
      'India': 'INR',
      'Japan': 'JPY',
      'Brazil': 'BRL',
      'Mexico': 'MXN',
      'Singapore': 'SGD',
      'South Africa': 'ZAR',
      'Germany': 'EUR',
      'France': 'EUR',
      'Italy': 'EUR',
      'Spain': 'EUR',
      'Netherlands': 'EUR',
      'Belgium': 'EUR',
      'Austria': 'EUR',
      'Portugal': 'EUR',
      'Ireland': 'EUR',
      'Finland': 'EUR',
      'Greece': 'EUR',
    };

    return locationToCurrency[userLocation] || 'USD';
  }

  public formatPrice(amount: number, currencyCode: string): string {
    const currency = this.currencies[currencyCode];
    if (!currency) return `$${amount}`;

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: currencyCode === 'JPY' ? 0 : 2,
      maximumFractionDigits: currencyCode === 'JPY' ? 0 : 2,
    }).format(amount);
  }
}

export const pricingService = MultiCurrencyPricingService.getInstance();