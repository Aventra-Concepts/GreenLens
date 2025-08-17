import Razorpay from 'razorpay';
import crypto from 'crypto';
import { storage } from '../../storage';
import type { PaymentProvider } from './index';

class RazorpayPayment implements PaymentProvider {
  private razorpay: Razorpay;

  constructor() {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      throw new Error('RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables are required');
    }

    this.razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }

  async createCheckout(params: {
    userId: string;
    userEmail: string;
    planId: string;
    currency?: string;
    amount?: number;
  }): Promise<string> {
    try {
      // Define pricing plans (amounts in paise)
      const plans = {
        pro: {
          amount: 75000, // ₹750.00
          interval: 'monthly',
        },
        premium: {
          amount: 150000, // ₹1500.00
          interval: 'monthly',
        },
      };

      const plan = plans[params.planId as keyof typeof plans];
      if (!plan) {
        throw new Error('Invalid plan ID');
      }

      // Create subscription plan if it doesn't exist
      const subscriptionPlan = await this.razorpay.plans.create({
        period: plan.interval,
        interval: 1,
        item: {
          name: `GreenLens ${params.planId.charAt(0).toUpperCase() + params.planId.slice(1)} Plan`,
          amount: plan.amount,
          currency: 'INR',
        },
      });

      // Create subscription
      const subscription = await this.razorpay.subscriptions.create({
        plan_id: subscriptionPlan.id,
        customer_notify: 1,
        notes: {
          userId: params.userId,
          planId: params.planId,
        },
      });

      // Generate payment link
      const paymentLink = await this.razorpay.paymentLink.create({
        amount: plan.amount,
        currency: 'INR',
        description: `GreenLens ${params.planId} subscription`,
        customer: {
          email: params.userEmail,
        },
        notify: {
          sms: false,
          email: true,
        },
        reminder_enable: true,
        callback_url: `${process.env.FRONTEND_URL || 'https://greenlens.replit.dev'}/account?success=true`,
        callback_method: 'get',
        notes: {
          userId: params.userId,
          planId: params.planId,
          subscriptionId: subscription.id,
        },
      });

      return paymentLink.short_url;

    } catch (error) {
      console.error('Razorpay checkout creation error:', error);
      throw new Error('Failed to create checkout session');
    }
  }

  async handleWebhook(body: any, headers: any): Promise<void> {
    try {
      const signature = headers['x-razorpay-signature'];
      const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

      if (!webhookSecret) {
        throw new Error('RAZORPAY_WEBHOOK_SECRET not configured');
      }

      // Verify webhook signature
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(body))
        .digest('hex');

      if (signature !== expectedSignature) {
        throw new Error('Invalid webhook signature');
      }

      const event = body.event;
      const payload = body.payload;

      switch (event) {
        case 'subscription.activated':
          await this.handleSubscriptionActivated(payload.subscription.entity);
          break;
        case 'subscription.cancelled':
          await this.handleSubscriptionCancelled(payload.subscription.entity);
          break;
        case 'payment.captured':
          await this.handlePaymentCaptured(payload.payment.entity);
          break;
      }

    } catch (error) {
      console.error('Razorpay webhook error:', error);
      throw error;
    }
  }

  async getSubscriptionStatus(subscriptionId: string) {
    try {
      const subscription = await this.razorpay.subscriptions.fetch(subscriptionId);
      
      const statusMap: { [key: string]: string } = {
        'created': 'incomplete',
        'authenticated': 'incomplete',
        'active': 'active',
        'pending': 'past_due',
        'halted': 'past_due',
        'cancelled': 'canceled',
        'completed': 'canceled',
        'expired': 'canceled',
      };

      return {
        status: statusMap[subscription.status] || subscription.status,
        currentPeriodEnd: new Date(subscription.current_end * 1000),
      };

    } catch (error) {
      console.error('Razorpay subscription status error:', error);
      throw new Error('Failed to get subscription status');
    }
  }

  private async handleSubscriptionActivated(subscription: any) {
    const userId = subscription.notes?.userId;
    const planId = subscription.notes?.planId;

    if (!userId) {
      console.error('No userId in subscription notes');
      return;
    }

    await storage.createSubscription({
      userId,
      provider: 'razorpay',
      providerSubscriptionId: subscription.id,
      providerCustomerId: subscription.customer_id,
      status: 'active',
      currentPeriodStart: new Date(subscription.current_start * 1000),
      currentPeriodEnd: new Date(subscription.current_end * 1000),
      planId,
      planName: planId === 'pro' ? 'Pro Plan' : 'Premium Plan',
    });
  }

  private async handleSubscriptionCancelled(subscription: any) {
    const userId = subscription.notes?.userId;
    const existingSubscription = await storage.getUserSubscription(userId);
    
    if (existingSubscription && existingSubscription.providerSubscriptionId === subscription.id) {
      await storage.updateSubscription(existingSubscription.id, {
        status: 'canceled',
      });
    }
  }

  private async handlePaymentCaptured(payment: any) {
    // Handle successful payment - could update subscription status if needed
    console.log('Payment captured:', payment.id);
  }

  async createProductCheckout(params: Parameters<import('./index').PaymentProvider['createProductCheckout']>[0]): Promise<{ url: string; id: string }> {
    // For now, Razorpay product checkout is not implemented
    // In a production environment, you would implement this similar to Stripe
    throw new Error('Razorpay product checkout not implemented yet');
  }

  async getSessionDetails(sessionId: string): Promise<any> {
    // For now, session details retrieval is not implemented for Razorpay
    throw new Error('Razorpay session details not implemented yet');
  }

  supportsCurrency(currency: string): boolean {
    // Razorpay primarily supports INR
    return currency.toUpperCase() === 'INR';
  }
}

export const razorpayPayment = new RazorpayPayment();
