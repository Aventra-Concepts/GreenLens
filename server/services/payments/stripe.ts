import Stripe from 'stripe';
import { storage } from '../../storage';
import type { PaymentProvider } from './index';

class StripePayment implements PaymentProvider {
  private stripe: Stripe;

  constructor() {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY environment variable is required');
    }

    this.stripe = new Stripe(secretKey, {
      apiVersion: '2023-10-16',
    });
  }

  async createCheckout(params: {
    userId: string;
    userEmail: string;
    planId: string;
  }): Promise<string> {
    try {
      // Define pricing plans
      const plans = {
        pro: {
          priceId: process.env.STRIPE_PRO_PRICE_ID || 'price_pro',
          amount: 900, // $9.00
        },
        premium: {
          priceId: process.env.STRIPE_PREMIUM_PRICE_ID || 'price_premium',
          amount: 1900, // $19.00
        },
      };

      const plan = plans[params.planId as keyof typeof plans];
      if (!plan) {
        throw new Error('Invalid plan ID');
      }

      const session = await this.stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        customer_email: params.userEmail,
        line_items: [
          {
            price: plan.priceId,
            quantity: 1,
          },
        ],
        success_url: `${process.env.FRONTEND_URL || 'https://greenlens.replit.dev'}/account?success=true`,
        cancel_url: `${process.env.FRONTEND_URL || 'https://greenlens.replit.dev'}/pricing?canceled=true`,
        metadata: {
          userId: params.userId,
          planId: params.planId,
        },
        subscription_data: {
          metadata: {
            userId: params.userId,
            planId: params.planId,
          },
        },
      });

      return session.url || '';

    } catch (error) {
      console.error('Stripe checkout creation error:', error);
      throw new Error('Failed to create checkout session');
    }
  }

  async handleWebhook(body: any, headers: any): Promise<void> {
    try {
      const signature = headers['stripe-signature'];
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

      if (!webhookSecret) {
        throw new Error('STRIPE_WEBHOOK_SECRET not configured');
      }

      const event = this.stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      );

      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutCompleted(event.data.object);
          break;
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object);
          break;
      }

    } catch (error) {
      console.error('Stripe webhook error:', error);
      throw error;
    }
  }

  async getSubscriptionStatus(subscriptionId: string) {
    try {
      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
      
      return {
        status: subscription.status,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      };

    } catch (error) {
      console.error('Stripe subscription status error:', error);
      throw new Error('Failed to get subscription status');
    }
  }

  private async handleCheckoutCompleted(session: any) {
    const userId = session.metadata?.userId;
    const planId = session.metadata?.planId;

    if (!userId) {
      console.error('No userId in checkout session metadata');
      return;
    }

    const subscription = await this.stripe.subscriptions.retrieve(session.subscription);

    await storage.createSubscription({
      userId,
      provider: 'stripe',
      providerSubscriptionId: subscription.id,
      providerCustomerId: subscription.customer as string,
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      planId,
      planName: planId === 'pro' ? 'Pro Plan' : 'Premium Plan',
    });
  }

  private async handleSubscriptionUpdated(subscription: any) {
    const existingSubscription = await storage.getUserSubscription(subscription.metadata?.userId);
    
    if (existingSubscription && existingSubscription.providerSubscriptionId === subscription.id) {
      await storage.updateSubscription(existingSubscription.id, {
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      });
    }
  }

  private async handleSubscriptionDeleted(subscription: any) {
    const existingSubscription = await storage.getUserSubscription(subscription.metadata?.userId);
    
    if (existingSubscription && existingSubscription.providerSubscriptionId === subscription.id) {
      await storage.updateSubscription(existingSubscription.id, {
        status: 'canceled',
      });
    }
  }
}

export const stripePayment = new StripePayment();
