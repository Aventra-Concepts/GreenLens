export interface PaymentProvider {
  createCheckout(params: {
    userId: string;
    userEmail: string;
    planId: string;
    currency?: string;
    amount?: number;
  }): Promise<string>;

  createProductCheckout(params: {
    userId: string | null;
    guestEmail?: string;
    items: Array<{
      productId: string;
      productName: string;
      productImage?: string;
      price: string;
      quantity: number;
      totalPrice: number;
    }>;
    subtotal: number;
    taxAmount: number;
    shippingAmount: number;
    discountAmount: number;
    totalAmount: number;
    currency: string;
    shippingAddress: any;
    billingAddress: any;
  }): Promise<{
    url: string;
    id: string;
  }>;

  getSessionDetails(sessionId: string): Promise<any>;
  
  handleWebhook(body: any, headers: any): Promise<void>;
  
  getSubscriptionStatus(subscriptionId: string): Promise<{
    status: string;
    currentPeriodEnd: Date;
  }>;
  
  supportsCurrency(currency: string): boolean;
}

class PaymentService {
  private providers: Map<string, PaymentProvider> = new Map();

  constructor() {
    // Providers are loaded lazily when needed
  }

  private async getProvider(providerName: string): Promise<PaymentProvider> {
    if (this.providers.has(providerName)) {
      return this.providers.get(providerName)!;
    }

    let provider: PaymentProvider;
    
    try {
      switch (providerName) {
        case 'stripe':
          const { stripePayment } = await import('./stripe');
          provider = stripePayment;
          break;
        case 'razorpay':
          const { razorpayPayment } = await import('./razorpay');
          provider = razorpayPayment;
          break;
        case 'cashfree':
          const { cashfreePayment } = await import('./cashfree');
          provider = cashfreePayment;
          break;
        default:
          throw new Error(`Payment provider ${providerName} not supported`);
      }

      this.providers.set(providerName, provider);
      return provider;
    } catch (error) {
      throw new Error(`Failed to load payment provider ${providerName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createCheckout(providerName: string, params: {
    userId: string;
    userEmail: string;
    planId: string;
    currency?: string;
    amount?: number;
  }): Promise<string> {
    const provider = await this.getProvider(providerName);
    return provider.createCheckout(params);
  }

  async handleWebhook(providerName: string, body: any, headers: any): Promise<void> {
    const provider = await this.getProvider(providerName);
    return provider.handleWebhook(body, headers);
  }

  async getSubscriptionStatus(providerName: string, subscriptionId: string) {
    const provider = await this.getProvider(providerName);
    return provider.getSubscriptionStatus(subscriptionId);
  }

  getAvailableProvider(): string {
    // Return the first available provider based on environment variables
    if (process.env.STRIPE_SECRET_KEY) return 'stripe';
    if (process.env.RAZORPAY_KEY_SECRET) return 'razorpay';
    if (process.env.CASHFREE_CLIENT_SECRET) return 'cashfree';
    
    throw new Error('No payment providers configured');
  }

  async createProductCheckout(params: Parameters<PaymentProvider['createProductCheckout']>[0]): Promise<{ url: string; id: string }> {
    const provider = await this.getProvider('stripe'); // Default to Stripe for e-commerce
    return provider.createProductCheckout(params);
  }

  async getSessionDetails(sessionId: string): Promise<any> {
    const provider = await this.getProvider('stripe'); // Default to Stripe for e-commerce
    return provider.getSessionDetails(sessionId);
  }

  async getProviderForCurrency(currency: string): Promise<string> {
    const availableProviders = ['stripe', 'razorpay', 'cashfree'];
    
    for (const providerName of availableProviders) {
      try {
        const provider = await this.getProvider(providerName);
        if (provider.supportsCurrency(currency)) {
          return providerName;
        }
      } catch (error) {
        // Provider not configured, continue to next
        continue;
      }
    }
    
    // Fallback to stripe if available
    if (process.env.STRIPE_SECRET_KEY) return 'stripe';
    
    throw new Error(`No payment provider available for currency ${currency}`);
  }
}

export const paymentService = new PaymentService();
