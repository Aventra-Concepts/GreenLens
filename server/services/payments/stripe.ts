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
      apiVersion: '2025-07-30.basil',
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
      const currency = params.currency || 'USD';
      const { pricingService } = await import('../pricing');
      
      // Get pricing for the specified currency
      const pricing = pricingService.getPlanPricing(params.planId, currency);
      if (!pricing) {
        throw new Error('Invalid plan ID or unsupported currency');
      }
      
      const amount = params.amount || pricing.amount;

      const session = await this.stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        customer_email: params.userEmail,
        line_items: [
          {
            price_data: {
              currency: (currency || 'USD').toLowerCase(),
              product_data: {
                name: `GreenLens ${params.planId.charAt(0).toUpperCase() + params.planId.slice(1)} Plan`,
                description: `Monthly subscription to GreenLens ${params.planId} features`,
              },
              unit_amount: Math.round(amount * 100), // Convert to cents
              recurring: {
                interval: 'month',
              },
            },
            quantity: 1,
          },
        ],
        success_url: `${process.env.FRONTEND_URL || 'https://greenlens.replit.dev'}/account?success=true`,
        cancel_url: `${process.env.FRONTEND_URL || 'https://greenlens.replit.dev'}/pricing?canceled=true`,
        metadata: {
          userId: params.userId,
          planId: params.planId,
          currency: currency,
          amount: amount.toString(),
        },
        subscription_data: {
          metadata: {
            userId: params.userId,
            planId: params.planId,
            currency: currency,
            amount: amount.toString(),
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
        currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
      };

    } catch (error) {
      console.error('Stripe subscription status error:', error);
      throw new Error('Failed to get subscription status');
    }
  }

  private async handleCheckoutCompleted(session: any) {
    const userId = session.metadata?.userId;
    const planId = session.metadata?.planId;
    const currency = session.metadata?.currency || 'USD';
    const amount = session.metadata?.amount || '0';

    if (!userId) {
      console.error('No userId in checkout session metadata');
      return;
    }

    const subscription = await this.stripe.subscriptions.retrieve(session.subscription);

    await storage.createSubscription({
      userId,
      planType: planId || 'pro',
      status: subscription.status,
      currency,
      amount,
      stripeSubscriptionId: subscription.id,
      preferredProvider: 'stripe',
      startDate: new Date((subscription as any).current_period_start * 1000),
      endDate: new Date((subscription as any).current_period_end * 1000),
    });
  }

  private async handleSubscriptionUpdated(subscription: any) {
    const existingSubscription = await storage.getUserSubscription(subscription.metadata?.userId);
    
    if (existingSubscription && existingSubscription.stripeSubscriptionId === subscription.id) {
      await storage.updateSubscription(existingSubscription.id, {
        status: subscription.status,
        startDate: new Date(subscription.current_period_start * 1000),
        endDate: new Date(subscription.current_period_end * 1000),
      });
    }
  }

  private async handleSubscriptionDeleted(subscription: any) {
    const existingSubscription = await storage.getUserSubscription(subscription.metadata?.userId);
    
    if (existingSubscription && existingSubscription.stripeSubscriptionId === subscription.id) {
      await storage.updateSubscription(existingSubscription.id, {
        status: 'cancelled',
      });
    }
  }

  async createProductCheckout(params: {
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
  }): Promise<{ url: string; id: string }> {
    try {
      const lineItems = params.items.map(item => ({
        price_data: {
          currency: params.currency.toLowerCase(),
          product_data: {
            name: item.productName,
            images: item.productImage ? [item.productImage] : [],
          },
          unit_amount: Math.round(Number(item.price) * 100),
        },
        quantity: item.quantity,
      }));

      // Add shipping as a line item if applicable
      if (params.shippingAmount > 0) {
        lineItems.push({
          price_data: {
            currency: params.currency.toLowerCase(),
            product_data: {
              name: 'Shipping',
            },
            unit_amount: Math.round(params.shippingAmount * 100),
          },
          quantity: 1,
        });
      }

      // Add tax as a line item if applicable
      if (params.taxAmount > 0) {
        lineItems.push({
          price_data: {
            currency: params.currency.toLowerCase(),
            product_data: {
              name: 'Tax',
            },
            unit_amount: Math.round(params.taxAmount * 100),
          },
          quantity: 1,
        });
      }

      const session = await this.stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        customer_email: params.guestEmail,
        line_items: lineItems,
        success_url: `${process.env.FRONTEND_URL || 'https://greenlens.replit.dev'}/order-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL || 'https://greenlens.replit.dev'}/cart?canceled=true`,
        metadata: {
          userId: params.userId || '',
          guestEmail: params.guestEmail || '',
          subtotal: params.subtotal.toString(),
          taxAmount: params.taxAmount.toString(),
          shippingAmount: params.shippingAmount.toString(),
          discountAmount: params.discountAmount.toString(),
          totalAmount: params.totalAmount.toString(),
          items: JSON.stringify(params.items),
          shippingAddress: JSON.stringify(params.shippingAddress),
          billingAddress: JSON.stringify(params.billingAddress),
        },
        // Apply discount if applicable
        ...(params.discountAmount > 0 && {
          discounts: [{
            coupon: await this.createStudentDiscountCoupon(params.discountAmount, params.currency)
          }]
        }),
      });

      return { url: session.url || '', id: session.id };

    } catch (error) {
      console.error('Stripe product checkout creation error:', error);
      throw new Error('Failed to create product checkout session');
    }
  }

  async getSessionDetails(sessionId: string): Promise<any> {
    try {
      const session = await this.stripe.checkout.sessions.retrieve(sessionId);
      return session;
    } catch (error) {
      console.error('Stripe session retrieval error:', error);
      throw new Error('Failed to retrieve session details');
    }
  }

  private async createStudentDiscountCoupon(discountAmount: number, currency: string): Promise<string> {
    try {
      const coupon = await this.stripe.coupons.create({
        amount_off: Math.round(discountAmount * 100),
        currency: currency.toLowerCase(),
        duration: 'once',
        name: 'Student Discount (10%)',
      });
      return coupon.id;
    } catch (error) {
      console.error('Error creating student discount coupon:', error);
      throw error;
    }
  }

  supportsCurrency(currency: string): boolean {
    // Stripe supports a wide range of currencies
    const supportedCurrencies = [
      'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'SGD', 'BRL', 'MXN', 'NZD', 'ZAR', 'INR'
    ];
    return supportedCurrencies.includes(currency.toUpperCase());
  }
}

export const stripePayment = new StripePayment();
