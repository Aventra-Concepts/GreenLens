import crypto from 'crypto';
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

export class RazorpayProvider implements PaymentProvider {
  name = 'razorpay';
  private keyId: string;
  private keySecret: string;
  private baseUrl: string;

  constructor() {
    this.keyId = process.env.RAZORPAY_KEY_ID || '';
    this.keySecret = process.env.RAZORPAY_KEY_SECRET || '';
    this.baseUrl = 'https://api.razorpay.com/v1';
  }

  supportsCurrency(currency: string): boolean {
    return ['INR', 'USD'].includes(currency.toUpperCase());
  }

  supportsRegion(region: string): boolean {
    return ['IN', 'US', 'MY', 'SG'].includes(region.toUpperCase());
  }

  private getAuthHeader(): string {
    return 'Basic ' + Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');
  }

  async createCheckout(params: CreateCheckoutParams): Promise<CheckoutResponse> {
    const orderId = `garden_sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create subscription plan first
    const planData = {
      period: params.interval,
      interval: 1,
      item: {
        name: params.productName,
        amount: params.amount * 100, // Convert to paise
        currency: params.currency,
        description: `Garden Monitoring Subscription - Annual Plan`
      },
      notes: {
        subscription_type: params.subscriptionType,
        customer_email: params.customerEmail,
      }
    };

    try {
      // Create subscription plan
      const planResponse = await fetch(`${this.baseUrl}/plans`, {
        method: 'POST',
        headers: {
          'Authorization': this.getAuthHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(planData),
      });

      if (!planResponse.ok) {
        const errorData = await planResponse.json();
        throw new Error(`Plan creation failed: ${JSON.stringify(errorData)}`);
      }

      const plan = await planResponse.json();

      // Create subscription
      const subscriptionData = {
        plan_id: plan.id,
        customer_notify: 1,
        quantity: 1,
        total_count: 1, // Annual subscription
        start_at: Math.floor(Date.now() / 1000),
        expire_by: Math.floor((Date.now() + 365 * 24 * 60 * 60 * 1000) / 1000),
        notes: {
          order_id: orderId,
          customer_name: params.customerName,
          customer_email: params.customerEmail,
          subscription_type: params.subscriptionType,
        }
      };

      const subResponse = await fetch(`${this.baseUrl}/subscriptions`, {
        method: 'POST',
        headers: {
          'Authorization': this.getAuthHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscriptionData),
      });

      if (!subResponse.ok) {
        const errorData = await subResponse.json();
        throw new Error(`Subscription creation failed: ${JSON.stringify(errorData)}`);
      }

      const subscription = await subResponse.json();

      // Create payment link
      const paymentLinkData = {
        amount: params.amount * 100,
        currency: params.currency,
        description: params.productName,
        customer: {
          name: params.customerName,
          email: params.customerEmail,
        },
        notify: {
          sms: false,
          email: true,
        },
        reminder_enable: true,
        notes: {
          subscription_id: subscription.id,
          order_id: orderId,
        },
        callback_url: params.returnUrl,
        callback_method: 'get',
      };

      const linkResponse = await fetch(`${this.baseUrl}/payment_links`, {
        method: 'POST',
        headers: {
          'Authorization': this.getAuthHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentLinkData),
      });

      if (!linkResponse.ok) {
        const errorData = await linkResponse.json();
        throw new Error(`Payment link creation failed: ${JSON.stringify(errorData)}`);
      }

      const paymentLink = await linkResponse.json();

      return {
        checkoutUrl: paymentLink.short_url,
        sessionId: subscription.id,
        paymentId: orderId,
        expiresAt: new Date(paymentLink.expire_by * 1000),
      };
    } catch (error) {
      throw new PaymentError(
        PaymentErrors.PROVIDER_ERROR,
        `Failed to create Razorpay checkout: ${(error as Error).message}`,
        'razorpay'
      );
    }
  }

  async handleWebhook(body: any, signature?: string): Promise<WebhookResult> {
    try {
      // Verify webhook signature
      const expectedSignature = crypto
        .createHmac('sha256', this.keySecret)
        .update(JSON.stringify(body))
        .digest('hex');

      if (signature !== expectedSignature) {
        throw new PaymentError(PaymentErrors.INVALID_SIGNATURE, 'Invalid webhook signature');
      }

      const { event, payload } = body;

      if (event === 'subscription.charged') {
        const subscription = payload.subscription.entity;
        const payment = payload.payment.entity;

        return {
          success: true,
          subscriptionId: subscription.id,
          customerId: payment.email,
          status: subscription.status === 'active' ? 'active' : 'pending',
          expiresAt: new Date(subscription.current_end * 1000),
          metadata: {
            paymentId: payment.id,
            amount: payment.amount / 100,
            currency: payment.currency,
          },
        };
      }

      if (event === 'subscription.cancelled') {
        return {
          success: true,
          subscriptionId: payload.subscription.entity.id,
          status: 'cancelled',
        };
      }

      return { success: false };
    } catch (error) {
      throw new PaymentError(
        PaymentErrors.PROVIDER_ERROR,
        `Razorpay webhook handling failed: ${(error as Error).message}`,
        'razorpay'
      );
    }
  }

  async getSubscriptionStatus(subscriptionId: string): Promise<SubscriptionStatus> {
    try {
      const response = await fetch(`${this.baseUrl}/subscriptions/${subscriptionId}`, {
        headers: {
          'Authorization': this.getAuthHeader(),
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch subscription: ${response.statusText}`);
      }

      const subscription = await response.json();
      
      return {
        id: subscriptionId,
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_start * 1000),
        currentPeriodEnd: new Date(subscription.current_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_cycle_end,
        customerId: subscription.customer_id,
      };
    } catch (error) {
      throw new PaymentError(
        PaymentErrors.SUBSCRIPTION_NOT_FOUND,
        `Failed to get Razorpay subscription status: ${(error as Error).message}`,
        'razorpay'
      );
    }
  }

  async verifyPayment(paymentId: string): Promise<PaymentVerification> {
    try {
      const response = await fetch(`${this.baseUrl}/payments/${paymentId}`, {
        headers: {
          'Authorization': this.getAuthHeader(),
        },
      });

      if (!response.ok) {
        return { isValid: false };
      }

      const payment = await response.json();

      return {
        isValid: payment.status === 'captured',
        subscriptionId: payment.notes?.subscription_id,
        amount: payment.amount / 100,
        currency: payment.currency,
        status: payment.status,
      };
    } catch (error) {
      return { isValid: false };
    }
  }
}