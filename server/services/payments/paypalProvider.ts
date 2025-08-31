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

export class PayPalProvider implements PaymentProvider {
  name = 'paypal';
  private clientId: string;
  private clientSecret: string;
  private baseUrl: string;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor() {
    this.clientId = process.env.PAYPAL_CLIENT_ID || '';
    this.clientSecret = process.env.PAYPAL_CLIENT_SECRET || '';
    this.baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://api.paypal.com' 
      : 'https://api.sandbox.paypal.com';
      
    if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
      console.warn('PayPal credentials not configured. Using demo mode - payments will not work until keys are added.');
    }
  }

  supportsCurrency(currency: string): boolean {
    return ['USD', 'EUR', 'GBP', 'AUD', 'CAD', 'JPY'].includes(currency.toUpperCase());
  }

  supportsRegion(region: string): boolean {
    return ['US', 'GB', 'AU', 'CA', 'EU'].includes(region.toUpperCase());
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      if (!this.clientId || !this.clientSecret) {
        return 'demo_token';
      }

      const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
      
      const response = await fetch(`${this.baseUrl}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Accept': 'application/json',
          'Accept-Language': 'en_US',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
      });

      if (!response.ok) {
        throw new Error(`Token request failed: ${response.statusText}`);
      }

      const data = await response.json();
      this.accessToken = data.access_token || '';
      this.tokenExpiry = new Date(Date.now() + ((data.expires_in || 3600) * 1000));
      
      return this.accessToken;
    } catch (error) {
      throw new PaymentError(
        PaymentErrors.PROVIDER_ERROR,
        `Failed to get PayPal access token: ${(error as Error).message}`,
        'paypal'
      );
    }
  }

  async createCheckout(params: CreateCheckoutParams): Promise<CheckoutResponse> {
    const orderId = `garden_sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Return demo response if no credentials configured
    if (!this.clientId || !this.clientSecret) {
      return {
        checkoutUrl: '/demo-payment?amount=' + params.amount + '&currency=' + params.currency,
        sessionId: 'demo_session_' + Date.now(),
        paymentId: 'demo_payment_' + Date.now(),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
      };
    }

    try {
      const accessToken = await this.getAccessToken();

      const orderData = {
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: params.currency,
            value: params.amount.toString()
          },
          description: params.productName,
          custom_id: orderId,
        }],
        application_context: {
          cancel_url: params.cancelUrl,
          return_url: params.returnUrl,
          brand_name: 'GreenLens',
          user_action: 'PAY_NOW'
        }
      };

      const response = await fetch(`${this.baseUrl}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'PayPal-Request-Id': orderId,
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`PayPal API error: ${errorData.message || response.statusText}`);
      }

      const order = await response.json();
      const approvalLink = order.links.find((link: any) => link.rel === 'approve');

      return {
        checkoutUrl: approvalLink?.href || params.returnUrl,
        sessionId: order.id,
        paymentId: order.id,
        expiresAt: new Date(Date.now() + 3 * 60 * 60 * 1000) // 3 hours
      };
    } catch (error) {
      throw new PaymentError(
        PaymentErrors.PROVIDER_ERROR,
        `Failed to create PayPal checkout: ${(error as Error).message}`,
        'paypal'
      );
    }
  }

  async handleWebhook(body: any, signature?: string): Promise<WebhookResult> {
    try {
      // PayPal webhook verification would go here
      // For now, return a basic webhook result
      return {
        success: true,
        subscriptionId: body.resource?.id,
        status: 'active',
        metadata: body
      };
    } catch (error) {
      throw new PaymentError(
        PaymentErrors.PROVIDER_ERROR,
        `PayPal webhook handling failed: ${(error as Error).message}`,
        'paypal'
      );
    }
  }

  async getSubscriptionStatus(subscriptionId: string): Promise<SubscriptionStatus> {
    try {
      if (!this.clientId || !this.clientSecret) {
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

      const accessToken = await this.getAccessToken();
      
      const response = await fetch(`${this.baseUrl}/v1/billing/subscriptions/${subscriptionId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get subscription: ${response.statusText}`);
      }

      const subscription = await response.json();
      
      return {
        id: subscription.id,
        status: subscription.status.toLowerCase(),
        currentPeriodStart: new Date(subscription.billing_info?.last_payment?.time || Date.now()),
        currentPeriodEnd: new Date(subscription.billing_info?.next_billing_time || Date.now() + 365 * 24 * 60 * 60 * 1000),
        cancelAtPeriodEnd: subscription.status === 'CANCELLED',
        customerId: subscription.subscriber?.payer_id || ''
      };
    } catch (error) {
      throw new PaymentError(
        PaymentErrors.SUBSCRIPTION_NOT_FOUND,
        `Failed to get PayPal subscription status: ${(error as Error).message}`,
        'paypal'
      );
    }
  }

  async verifyPayment(paymentId: string): Promise<PaymentVerification> {
    try {
      if (!this.clientId || !this.clientSecret) {
        return {
          isValid: true,
          subscriptionId: paymentId,
          amount: 99,
          currency: 'USD',
          status: 'completed'
        };
      }

      const accessToken = await this.getAccessToken();
      
      const response = await fetch(`${this.baseUrl}/v2/checkout/orders/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        return { isValid: false };
      }

      const order = await response.json();
      
      return {
        isValid: order.status === 'COMPLETED',
        subscriptionId: order.id,
        amount: parseFloat(order.purchase_units?.[0]?.amount?.value || '0'),
        currency: order.purchase_units?.[0]?.amount?.currency_code || 'USD',
        status: order.status.toLowerCase()
      };
    } catch (error) {
      return { isValid: false };
    }
  }
}