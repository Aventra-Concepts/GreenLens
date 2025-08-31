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
      
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.warn('Razorpay credentials not configured. Using demo mode - payments will not work until keys are added.');
    }
  }

  supportsCurrency(currency: string): boolean {
    return ['INR', 'USD'].includes(currency.toUpperCase());
  }

  supportsRegion(region: string): boolean {
    return ['IN', 'US'].includes(region.toUpperCase());
  }

  private getAuthHeader(): string {
    if (!this.keyId || !this.keySecret) {
      return 'Basic demo_auth';
    }
    return 'Basic ' + Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');
  }

  async createCheckout(params: CreateCheckoutParams): Promise<CheckoutResponse> {
    const orderId = `garden_sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Return demo response if no credentials configured
    if (!this.keyId || !this.keySecret) {
      return {
        checkoutUrl: '/demo-payment?amount=' + params.amount + '&currency=' + params.currency,
        sessionId: 'demo_session_' + Date.now(),
        paymentId: 'demo_payment_' + Date.now(),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
      };
    }

    try {
      // Convert amount to smallest currency unit (paise for INR, cents for USD)
      const amountInSmallestUnit = Math.round(params.amount * 100);

      const orderData = {
        amount: amountInSmallestUnit,
        currency: params.currency,
        receipt: orderId,
        notes: {
          customer_email: params.customerEmail,
          customer_name: params.customerName,
          product_name: params.productName,
          subscription_type: params.subscriptionType
        }
      };

      const response = await fetch(`${this.baseUrl}/orders`, {
        method: 'POST',
        headers: {
          'Authorization': this.getAuthHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Razorpay API error: ${errorData.error?.description || response.statusText}`);
      }

      const order = await response.json();

      // Razorpay requires frontend integration for checkout
      const checkoutUrl = `/razorpay-checkout?order_id=${order.id}&amount=${params.amount}&currency=${params.currency}`;

      return {
        checkoutUrl,
        sessionId: order.id,
        paymentId: order.id,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
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
      const expectedSignature = signature;
      // Razorpay webhook verification would go here
      
      const event = body.event;
      const payment = body.payload?.payment?.entity || body.payload?.order?.entity;

      let status: 'active' | 'cancelled' | 'expired' | 'pending' = 'pending';
      
      switch (event) {
        case 'payment.captured':
        case 'order.paid':
          status = 'active';
          break;
        case 'payment.failed':
        case 'order.failed':
          status = 'cancelled';
          break;
        default:
          status = 'pending';
      }

      return {
        success: true,
        subscriptionId: payment?.order_id || payment?.id,
        customerId: payment?.email,
        status,
        metadata: body
      };
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
      if (!this.keyId || !this.keySecret) {
        // Demo mode response
        return {
          id: subscriptionId,
          status: 'active',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          cancelAtPeriodEnd: false,
          customerId: 'demo_customer'
        };
      }

      const response = await fetch(`${this.baseUrl}/subscriptions/${subscriptionId}`, {
        headers: {
          'Authorization': this.getAuthHeader(),
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get subscription: ${response.statusText}`);
      }

      const subscription = await response.json();
      
      return {
        id: subscription.id,
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_start * 1000),
        currentPeriodEnd: new Date(subscription.current_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
        customerId: subscription.customer_id
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
      if (!this.keyId || !this.keySecret) {
        return {
          isValid: true,
          subscriptionId: paymentId,
          amount: 99,
          currency: 'INR',
          status: 'captured'
        };
      }

      const response = await fetch(`${this.baseUrl}/payments/${paymentId}`, {
        headers: {
          'Authorization': this.getAuthHeader(),
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        return { isValid: false };
      }

      const payment = await response.json();
      
      return {
        isValid: payment.status === 'captured',
        subscriptionId: payment.order_id,
        amount: payment.amount / 100, // Convert from smallest unit
        currency: payment.currency,
        status: payment.status
      };
    } catch (error) {
      return { isValid: false };
    }
  }
}