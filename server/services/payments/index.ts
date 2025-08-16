import { stripePayment } from './stripe';
import { razorpayPayment } from './razorpay';
import { cashfreePayment } from './cashfree';

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
    this.providers.set('stripe', stripePayment);
    this.providers.set('razorpay', razorpayPayment);
    this.providers.set('cashfree', cashfreePayment);
  }

  async createCheckout(providerName: string, params: {
    userId: string;
    userEmail: string;
    planId: string;
  }): Promise<string> {
    const provider = this.providers.get(providerName);
    if (!provider) {
      throw new Error(`Payment provider ${providerName} not supported`);
    }

    return provider.createCheckout(params);
  }

  async handleWebhook(providerName: string, body: any, headers: any): Promise<void> {
    const provider = this.providers.get(providerName);
    if (!provider) {
      throw new Error(`Payment provider ${providerName} not supported`);
    }

    return provider.handleWebhook(body, headers);
  }

  async getSubscriptionStatus(providerName: string, subscriptionId: string) {
    const provider = this.providers.get(providerName);
    if (!provider) {
      throw new Error(`Payment provider ${providerName} not supported`);
    }

    return provider.getSubscriptionStatus(subscriptionId);
  }

  getAvailableProvider(): string {
    // Return the first available provider based on environment variables
    if (process.env.STRIPE_SECRET_KEY) return 'stripe';
    if (process.env.RAZORPAY_KEY_SECRET) return 'razorpay';
    if (process.env.CASHFREE_SECRET_KEY) return 'cashfree';
    
    throw new Error('No payment providers configured');
  }
}

export const paymentService = new PaymentService();
