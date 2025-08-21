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
    // Priority currencies (top section)
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
    AUD: {
      code: 'AUD',
      symbol: 'A$',
      name: 'Australian Dollar',
      supportedProviders: ['stripe', 'paypal'],
      exchangeRate: 1.45,
    },
    SGD: {
      code: 'SGD',
      symbol: 'S$',
      name: 'Singapore Dollar',
      supportedProviders: ['stripe', 'paypal'],
      exchangeRate: 1.35,
    },
    AED: {
      code: 'AED',
      symbol: 'د.إ',
      name: 'UAE Dirham',
      supportedProviders: ['stripe', 'paypal'],
      exchangeRate: 3.67,
    },
    CAD: {
      code: 'CAD',
      symbol: 'C$',
      name: 'Canadian Dollar',
      supportedProviders: ['stripe', 'paypal'],
      exchangeRate: 1.35,
    },
    INR: {
      code: 'INR',
      symbol: '₹',
      name: 'Indian Rupee',
      supportedProviders: ['razorpay', 'cashfree', 'stripe'],
      exchangeRate: 83.0,
    },
    
    // Other major currencies
    JPY: {
      code: 'JPY',
      symbol: '¥',
      name: 'Japanese Yen',
      supportedProviders: ['stripe', 'paypal'],
      exchangeRate: 150.0,
    },
    CNY: {
      code: 'CNY',
      symbol: '¥',
      name: 'Chinese Yuan',
      supportedProviders: ['stripe'],
      exchangeRate: 7.2,
    },
    CHF: {
      code: 'CHF',
      symbol: 'CHF',
      name: 'Swiss Franc',
      supportedProviders: ['stripe', 'paypal'],
      exchangeRate: 0.88,
    },
    SEK: {
      code: 'SEK',
      symbol: 'kr',
      name: 'Swedish Krona',
      supportedProviders: ['stripe', 'paypal'],
      exchangeRate: 10.8,
    },
    NOK: {
      code: 'NOK',
      symbol: 'kr',
      name: 'Norwegian Krone',
      supportedProviders: ['stripe', 'paypal'],
      exchangeRate: 10.9,
    },
    DKK: {
      code: 'DKK',
      symbol: 'kr',
      name: 'Danish Krone',
      supportedProviders: ['stripe', 'paypal'],
      exchangeRate: 6.9,
    },
    PLN: {
      code: 'PLN',
      symbol: 'zł',
      name: 'Polish Zloty',
      supportedProviders: ['stripe', 'paypal'],
      exchangeRate: 4.2,
    },
    CZK: {
      code: 'CZK',
      symbol: 'Kč',
      name: 'Czech Koruna',
      supportedProviders: ['stripe', 'paypal'],
      exchangeRate: 23.0,
    },
    HUF: {
      code: 'HUF',
      symbol: 'Ft',
      name: 'Hungarian Forint',
      supportedProviders: ['stripe', 'paypal'],
      exchangeRate: 360.0,
    },
    RON: {
      code: 'RON',
      symbol: 'lei',
      name: 'Romanian Leu',
      supportedProviders: ['stripe', 'paypal'],
      exchangeRate: 4.7,
    },
    BGN: {
      code: 'BGN',
      symbol: 'лв',
      name: 'Bulgarian Lev',
      supportedProviders: ['stripe', 'paypal'],
      exchangeRate: 1.8,
    },
    HRK: {
      code: 'HRK',
      symbol: 'kn',
      name: 'Croatian Kuna',
      supportedProviders: ['stripe', 'paypal'],
      exchangeRate: 7.5,
    },
    RUB: {
      code: 'RUB',
      symbol: '₽',
      name: 'Russian Ruble',
      supportedProviders: ['stripe'],
      exchangeRate: 90.0,
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
    ARS: {
      code: 'ARS',
      symbol: '$',
      name: 'Argentine Peso',
      supportedProviders: ['stripe'],
      exchangeRate: 350.0,
    },
    CLP: {
      code: 'CLP',
      symbol: '$',
      name: 'Chilean Peso',
      supportedProviders: ['stripe'],
      exchangeRate: 900.0,
    },
    COP: {
      code: 'COP',
      symbol: '$',
      name: 'Colombian Peso',
      supportedProviders: ['stripe'],
      exchangeRate: 4000.0,
    },
    PEN: {
      code: 'PEN',
      symbol: 'S/',
      name: 'Peruvian Sol',
      supportedProviders: ['stripe'],
      exchangeRate: 3.8,
    },
    UYU: {
      code: 'UYU',
      symbol: '$U',
      name: 'Uruguayan Peso',
      supportedProviders: ['stripe'],
      exchangeRate: 39.0,
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
    KRW: {
      code: 'KRW',
      symbol: '₩',
      name: 'South Korean Won',
      supportedProviders: ['stripe'],
      exchangeRate: 1330.0,
    },
    THB: {
      code: 'THB',
      symbol: '฿',
      name: 'Thai Baht',
      supportedProviders: ['stripe'],
      exchangeRate: 35.0,
    },
    MYR: {
      code: 'MYR',
      symbol: 'RM',
      name: 'Malaysian Ringgit',
      supportedProviders: ['stripe'],
      exchangeRate: 4.6,
    },
    PHP: {
      code: 'PHP',
      symbol: '₱',
      name: 'Philippine Peso',
      supportedProviders: ['stripe'],
      exchangeRate: 56.0,
    },
    IDR: {
      code: 'IDR',
      symbol: 'Rp',
      name: 'Indonesian Rupiah',
      supportedProviders: ['stripe'],
      exchangeRate: 15600.0,
    },
    VND: {
      code: 'VND',
      symbol: '₫',
      name: 'Vietnamese Dong',
      supportedProviders: ['stripe'],
      exchangeRate: 24000.0,
    },
    HKD: {
      code: 'HKD',
      symbol: 'HK$',
      name: 'Hong Kong Dollar',
      supportedProviders: ['stripe', 'paypal'],
      exchangeRate: 7.8,
    },
    TWD: {
      code: 'TWD',
      symbol: 'NT$',
      name: 'Taiwan Dollar',
      supportedProviders: ['stripe'],
      exchangeRate: 31.0,
    },
    SAR: {
      code: 'SAR',
      symbol: '﷼',
      name: 'Saudi Riyal',
      supportedProviders: ['stripe'],
      exchangeRate: 3.75,
    },
    QAR: {
      code: 'QAR',
      symbol: '﷼',
      name: 'Qatari Riyal',
      supportedProviders: ['stripe'],
      exchangeRate: 3.64,
    },
    KWD: {
      code: 'KWD',
      symbol: 'د.ك',
      name: 'Kuwaiti Dinar',
      supportedProviders: ['stripe'],
      exchangeRate: 0.31,
    },
    BHD: {
      code: 'BHD',
      symbol: '.د.ب',
      name: 'Bahraini Dinar',
      supportedProviders: ['stripe'],
      exchangeRate: 0.38,
    },
    OMR: {
      code: 'OMR',
      symbol: '﷼',
      name: 'Omani Rial',
      supportedProviders: ['stripe'],
      exchangeRate: 0.38,
    },
    JOD: {
      code: 'JOD',
      symbol: 'د.ا',
      name: 'Jordanian Dinar',
      supportedProviders: ['stripe'],
      exchangeRate: 0.71,
    },
    LBP: {
      code: 'LBP',
      symbol: '£',
      name: 'Lebanese Pound',
      supportedProviders: ['stripe'],
      exchangeRate: 15000.0,
    },
    EGP: {
      code: 'EGP',
      symbol: '£',
      name: 'Egyptian Pound',
      supportedProviders: ['stripe'],
      exchangeRate: 31.0,
    },
    TRY: {
      code: 'TRY',
      symbol: '₺',
      name: 'Turkish Lira',
      supportedProviders: ['stripe'],
      exchangeRate: 27.0,
    },
    ILS: {
      code: 'ILS',
      symbol: '₪',
      name: 'Israeli Shekel',
      supportedProviders: ['stripe'],
      exchangeRate: 3.7,
    },
    PKR: {
      code: 'PKR',
      symbol: '₨',
      name: 'Pakistani Rupee',
      supportedProviders: ['stripe'],
      exchangeRate: 280.0,
    },
    BDT: {
      code: 'BDT',
      symbol: '৳',
      name: 'Bangladeshi Taka',
      supportedProviders: ['stripe'],
      exchangeRate: 110.0,
    },
    LKR: {
      code: 'LKR',
      symbol: '₨',
      name: 'Sri Lankan Rupee',
      supportedProviders: ['stripe'],
      exchangeRate: 320.0,
    },
    NPR: {
      code: 'NPR',
      symbol: '₨',
      name: 'Nepalese Rupee',
      supportedProviders: ['stripe'],
      exchangeRate: 133.0,
    },
    AFN: {
      code: 'AFN',
      symbol: '؋',
      name: 'Afghan Afghani',
      supportedProviders: ['stripe'],
      exchangeRate: 70.0,
    },
    KES: {
      code: 'KES',
      symbol: 'KSh',
      name: 'Kenyan Shilling',
      supportedProviders: ['stripe'],
      exchangeRate: 150.0,
    },
    UGX: {
      code: 'UGX',
      symbol: 'USh',
      name: 'Ugandan Shilling',
      supportedProviders: ['stripe'],
      exchangeRate: 3700.0,
    },
    TZS: {
      code: 'TZS',
      symbol: 'TSh',
      name: 'Tanzanian Shilling',
      supportedProviders: ['stripe'],
      exchangeRate: 2500.0,
    },
    GHS: {
      code: 'GHS',
      symbol: '₵',
      name: 'Ghanaian Cedi',
      supportedProviders: ['stripe'],
      exchangeRate: 12.0,
    },
    NGN: {
      code: 'NGN',
      symbol: '₦',
      name: 'Nigerian Naira',
      supportedProviders: ['stripe'],
      exchangeRate: 750.0,
    },
    MAD: {
      code: 'MAD',
      symbol: 'د.م.',
      name: 'Moroccan Dirham',
      supportedProviders: ['stripe'],
      exchangeRate: 10.2,
    },
    ETB: {
      code: 'ETB',
      symbol: 'Br',
      name: 'Ethiopian Birr',
      supportedProviders: ['stripe'],
      exchangeRate: 55.0,
    },
    XOF: {
      code: 'XOF',
      symbol: 'CFA',
      name: 'West African CFA Franc',
      supportedProviders: ['stripe'],
      exchangeRate: 600.0,
    },
    XAF: {
      code: 'XAF',
      symbol: 'FCFA',
      name: 'Central African CFA Franc',
      supportedProviders: ['stripe'],
      exchangeRate: 600.0,
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

  public getSupportedCurrencies(): string[] {
    return Object.keys(this.currencies);
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
    // Default to USD for US optimization
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