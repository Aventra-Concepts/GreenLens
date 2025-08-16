export interface PaymentProvider {
  createCheckout(params: {
    userId: string;
    userEmail: string;
    planId: string;
  }): Promise<string>;
  
  handleWebhook(body: any, headers: any): Promise<void>;
  
  getSubscriptionStatus(subscriptionId: string): Promise<{
    status: string;
    currentPeriodEnd: Date;
  }>;
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
}

export const paymentService = new PaymentService();
