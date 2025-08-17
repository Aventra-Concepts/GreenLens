import crypto from 'crypto';
import { storage } from '../../storage';
import type { PaymentProvider } from './index';

class CashfreePayment implements PaymentProvider {
  private clientId: string;
  private clientSecret: string;
  private baseUrl: string;

  constructor() {
    this.clientId = process.env.CASHFREE_CLIENT_ID || '';
    this.clientSecret = process.env.CASHFREE_CLIENT_SECRET || '';
    
    if (!this.clientId || !this.clientSecret) {
      throw new Error('CASHFREE_CLIENT_ID and CASHFREE_CLIENT_SECRET environment variables are required');
    }

    this.baseUrl = process.env.CASHFREE_ENVIRONMENT === 'production' 
      ? 'https://api.cashfree.com' 
      : 'https://sandbox.cashfree.com';
  }

  async createCheckout(params: {
    userId: string;
    userEmail: string;
    planId: string;
    currency?: string;
    amount?: number;
  }): Promise<string> {
    try {
      // Define pricing plans
      const plans = {
        pro: {
          amount: 750.00, // ₹750.00
          interval: 'monthly',
        },
        premium: {
          amount: 1500.00, // ₹1500.00
          interval: 'monthly',
        },
      };

      const plan = plans[params.planId as keyof typeof plans];
      if (!plan) {
        throw new Error('Invalid plan ID');
      }

      // Create subscription plan first
      const planResponse = await this.makeApiCall('/api/v2/subscriptions/plans', 'POST', {
        plan_id: `greenlens_${params.planId}_${Date.now()}`,
        plan_name: `GreenLens ${params.planId.charAt(0).toUpperCase() + params.planId.slice(1)} Plan`,
        type: 'PERIODIC',
        max_amount: plan.amount,
        max_cycles: 0, // Unlimited
        interval_type: 'MONTH',
        intervals: 1,
      });

      // Create subscription
      const subscriptionData = {
        subscription_id: `sub_${params.userId}_${Date.now()}`,
        plan_id: planResponse.plan_id,
        customer_details: {
          customer_id: params.userId,
          customer_email: params.userEmail,
          customer_phone: '9999999999', // This would need to be collected
        },
        return_url: `${process.env.FRONTEND_URL || 'https://greenlens.replit.dev'}/account?success=true`,
        subscription_meta: {
          userId: params.userId,
          planId: params.planId,
        },
      };

      const subscription = await this.makeApiCall('/api/v2/subscriptions', 'POST', subscriptionData);

      return subscription.authorization_url;

    } catch (error) {
      console.error('Cashfree checkout creation error:', error);
      throw new Error('Failed to create checkout session');
    }
  }

  async handleWebhook(body: any, headers: any): Promise<void> {
    try {
      const signature = headers['x-cashfree-signature'];
      const webhookSecret = process.env.CASHFREE_WEBHOOK_SECRET;

      if (!webhookSecret) {
        throw new Error('CASHFREE_WEBHOOK_SECRET not configured');
      }

      // Verify webhook signature
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(body))
        .digest('hex');

      if (signature !== expectedSignature) {
        throw new Error('Invalid webhook signature');
      }

      const eventType = body.type;
      const data = body.data;

      switch (eventType) {
        case 'SUBSCRIPTION_ACTIVATED':
          await this.handleSubscriptionActivated(data.subscription);
          break;
        case 'SUBSCRIPTION_CANCELLED':
          await this.handleSubscriptionCancelled(data.subscription);
          break;
        case 'PAYMENT_SUCCESS':
          await this.handlePaymentSuccess(data.payment);
          break;
      }

    } catch (error) {
      console.error('Cashfree webhook error:', error);
      throw error;
    }
  }

  async getSubscriptionStatus(subscriptionId: string) {
    try {
      const subscription = await this.makeApiCall(`/api/v2/subscriptions/${subscriptionId}`, 'GET');
      
      const statusMap: { [key: string]: string } = {
        'INITIALIZED': 'incomplete',
        'ACTIVE': 'active',
        'CANCELLED': 'canceled',
        'EXPIRED': 'canceled',
        'ON_HOLD': 'past_due',
      };

      return {
        status: statusMap[subscription.status] || subscription.status,
        currentPeriodEnd: new Date(subscription.current_cycle_end),
      };

    } catch (error) {
      console.error('Cashfree subscription status error:', error);
      throw new Error('Failed to get subscription status');
    }
  }

  private async makeApiCall(endpoint: string, method: string, data?: any) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      'x-client-id': this.clientId,
      'x-client-secret': this.clientSecret,
    };

    const response = await fetch(url, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      throw new Error(`Cashfree API error: ${response.status}`);
    }

    return response.json();
  }

  private async handleSubscriptionActivated(subscription: any) {
    const userId = subscription.subscription_meta?.userId;
    const planId = subscription.subscription_meta?.planId;

    if (!userId) {
      console.error('No userId in subscription metadata');
      return;
    }

    await storage.createSubscription({
      userId,
      provider: 'cashfree',
      providerSubscriptionId: subscription.subscription_id,
      providerCustomerId: subscription.customer_details.customer_id,
      status: 'active',
      currentPeriodStart: new Date(subscription.current_cycle_start),
      currentPeriodEnd: new Date(subscription.current_cycle_end),
      planId,
      planName: planId === 'pro' ? 'Pro Plan' : 'Premium Plan',
    });
  }

  private async handleSubscriptionCancelled(subscription: any) {
    const userId = subscription.subscription_meta?.userId;
    const existingSubscription = await storage.getUserSubscription(userId);
    
    if (existingSubscription && existingSubscription.providerSubscriptionId === subscription.subscription_id) {
      await storage.updateSubscription(existingSubscription.id, {
        status: 'canceled',
      });
    }
  }

  private async handlePaymentSuccess(payment: any) {
    // Handle successful payment
    console.log('Payment successful:', payment.payment_id);
  }

  async createProductCheckout(params: Parameters<import('./index').PaymentProvider['createProductCheckout']>[0]): Promise<{ url: string; id: string }> {
    // For now, Cashfree product checkout is not implemented
    // In a production environment, you would implement this similar to Stripe
    throw new Error('Cashfree product checkout not implemented yet');
  }

  async getSessionDetails(sessionId: string): Promise<any> {
    // For now, session details retrieval is not implemented for Cashfree
    throw new Error('Cashfree session details not implemented yet');
  }

  supportsCurrency(currency: string): boolean {
    // Cashfree primarily supports INR
    return currency.toUpperCase() === 'INR';
  }
}

export const cashfreePayment = new CashfreePayment();
