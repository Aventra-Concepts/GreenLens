import { CashfreeProvider } from './cashfreeProvider';
import { PayPalProvider } from './paypalProvider';
import { RazorpayProvider } from './razorpayProvider';
import { 
  PaymentProvider, 
  CreateCheckoutParams, 
  CheckoutResponse, 
  WebhookResult, 
  SubscriptionStatus,
  PaymentVerification,
  PaymentError,
  PaymentErrors 
} from './paymentTypes';

export class PaymentService {
  private providers: PaymentProvider[] = [];
  private primaryProvider: PaymentProvider | null = null;

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders(): void {
    // Initialize available payment providers
    try {
      // Initialize Cashfree provider (works without keys initially for demo)
      this.providers.push(new CashfreeProvider());
    } catch (error) {
      console.warn('Failed to initialize Cashfree provider:', (error as Error).message);
    }

    try {
      // Initialize PayPal provider
      this.providers.push(new PayPalProvider());
    } catch (error) {
      console.warn('Failed to initialize PayPal provider:', (error as Error).message);
    }

    try {
      // Initialize Razorpay provider
      this.providers.push(new RazorpayProvider());
    } catch (error) {
      console.warn('Failed to initialize Razorpay provider:', (error as Error).message);
    }

    // Set primary provider based on configuration priority
    this.primaryProvider = this.providers.find(p => p.name === 'cashfree') || 
                          this.providers.find(p => p.name === 'paypal') ||
                          this.providers.find(p => p.name === 'razorpay') ||
                          this.providers[0] || 
                          null;

    if (!this.primaryProvider) {
      console.warn('No payment providers available. Please configure payment gateway credentials.');
    } else {
      console.log(`Payment service initialized with ${this.providers.length} providers. Primary: ${this.primaryProvider.name}`);
    }
  }

  getAvailableProviders(): string[] {
    return this.providers.map(p => p.name);
  }

  getOptimalProvider(currency: string, region?: string): PaymentProvider | null {
    // Find the best provider for the given currency and region
    const suitableProviders = this.providers.filter(provider => 
      provider.supportsCurrency(currency) && 
      (!region || provider.supportsRegion(region))
    );

    if (suitableProviders.length === 0) {
      return null;
    }

    // Use Cashfree for all transactions
    return suitableProviders.find(p => p.name === 'cashfree') || 
           suitableProviders[0];

  }

  async createGardenSubscriptionCheckout(params: {
    customerEmail: string;
    customerName: string;
    currency: string;
    region?: string;
    returnUrl: string;
    cancelUrl: string;
  }): Promise<CheckoutResponse & { provider: string }> {
    const provider = this.getOptimalProvider(params.currency, params.region);
    
    if (!provider) {
      throw new PaymentError(
        PaymentErrors.CURRENCY_NOT_SUPPORTED,
        `No payment provider available for currency ${params.currency} in region ${params.region}`
      );
    }

    // Garden Monitoring Subscription: $95 USD equivalent
    const amount = this.getAmountForCurrency(params.currency);

    const checkoutParams: CreateCheckoutParams = {
      amount,
      currency: params.currency,
      customerEmail: params.customerEmail,
      customerName: params.customerName,
      productName: 'Garden Monitoring Premium Subscription',
      returnUrl: params.returnUrl,
      cancelUrl: params.cancelUrl,
      subscriptionType: 'garden_monitoring',
      interval: 'year',
      metadata: {
        planType: 'garden_monitoring_annual',
        features: [
          'Unlimited plant tracking',
          'AI health predictions',
          'Weather integration',
          'Achievement system',
          'Social sharing',
          'PDF reports',
          'Expert recommendations'
        ]
      }
    };

    try {
      const result = await provider.createCheckout(checkoutParams);
      return {
        ...result,
        provider: provider.name
      };
    } catch (error) {
      // Try fallback provider if available
      const fallbackProviders = this.providers.filter(p => 
        p.name !== provider.name && 
        p.supportsCurrency(params.currency) &&
        (!params.region || p.supportsRegion(params.region))
      );

      if (fallbackProviders.length > 0) {
        try {
          const fallbackResult = await fallbackProviders[0].createCheckout(checkoutParams);
          return {
            ...fallbackResult,
            provider: fallbackProviders[0].name
          };
        } catch (fallbackError) {
          throw new PaymentError(
            PaymentErrors.PROVIDER_ERROR,
            `Primary and fallback providers failed: ${(error as Error).message}, ${(fallbackError as Error).message}`
          );
        }
      }

      throw error;
    }
  }

  async handleWebhook(providerName: string, body: any, signature?: string): Promise<WebhookResult> {
    const provider = this.providers.find(p => p.name === providerName);
    
    if (!provider) {
      throw new PaymentError(
        PaymentErrors.PROVIDER_ERROR,
        `Provider ${providerName} not found`
      );
    }

    return provider.handleWebhook(body, signature);
  }

  async getSubscriptionStatus(providerName: string, subscriptionId: string): Promise<SubscriptionStatus> {
    const provider = this.providers.find(p => p.name === providerName);
    
    if (!provider) {
      throw new PaymentError(
        PaymentErrors.PROVIDER_ERROR,
        `Provider ${providerName} not found`
      );
    }

    return provider.getSubscriptionStatus(subscriptionId);
  }

  async verifyPayment(providerName: string, paymentId: string): Promise<PaymentVerification> {
    const provider = this.providers.find(p => p.name === providerName);
    
    if (!provider) {
      return { isValid: false };
    }

    return provider.verifyPayment(paymentId);
  }

  private getAmountForCurrency(currency: string): number {
    // Use MultiCurrencyPricingService for consistency
    const { MultiCurrencyPricingService } = require('../pricing');
    const pricingService = MultiCurrencyPricingService.getInstance();
    
    // Base plan is "premium" at $19 USD, but for garden monitoring subscription we use a higher rate
    const basePriceUSD = 95; // Garden monitoring annual subscription base price
    const currencyInfo = pricingService.getCurrencyInfo(currency.toUpperCase());
    
    if (!currencyInfo || !currencyInfo.exchangeRate) {
      return basePriceUSD; // Return USD amount as fallback
    }
    
    const convertedAmount = basePriceUSD * currencyInfo.exchangeRate;
    
    // Apply rounding based on currency
    switch (currency.toUpperCase()) {
      case 'JPY':
      case 'KRW':
      case 'VND':
      case 'IDR':
        return Math.round(convertedAmount); // No decimals for these currencies
      case 'INR':
        return Math.round(convertedAmount); // Round to nearest rupee
      default:
        return Math.round(convertedAmount * 100) / 100; // Round to 2 decimal places
    }
  }

  getCurrencySymbol(currency: string): string {
    const { MultiCurrencyPricingService } = require('../pricing');
    const pricingService = MultiCurrencyPricingService.getInstance();
    const currencyInfo = pricingService.getCurrencyInfo(currency.toUpperCase());
    
    return currencyInfo?.symbol || currency.toUpperCase();
  }

  getFormattedPrice(currency: string): string {
    const { MultiCurrencyPricingService } = require('../pricing');
    const pricingService = MultiCurrencyPricingService.getInstance();
    const amount = this.getAmountForCurrency(currency);
    
    return pricingService.formatPrice(amount, currency.toUpperCase());
  }
}

// Singleton instance
export const paymentService = new PaymentService();