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

export class CashfreeProvider implements PaymentProvider {
  name = 'cashfree';
  private clientId: string;
  private clientSecret: string;
  private baseUrl: string;
  private accessToken?: string;
  private tokenExpiry?: Date;

  constructor() {
    this.clientId = process.env.CASHFREE_CLIENT_ID || 'demo_client_id';
    this.clientSecret = process.env.CASHFREE_CLIENT_SECRET || 'demo_client_secret';
    this.baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://api.cashfree.com' 
      : 'https://sandbox.cashfree.com';
      
    if (!process.env.CASHFREE_CLIENT_ID || !process.env.CASHFREE_CLIENT_SECRET) {
      console.warn('Cashfree credentials not configured. Using demo mode - payments will not work until keys are added.');
    }
  }

  supportsCurrency(currency: string): boolean {
    return ['INR', 'USD'].includes(currency.toUpperCase());
  }

  supportsRegion(region: string): boolean {
    return ['IN', 'US', 'GB'].includes(region.toUpperCase());
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      // Return demo token if no credentials are configured
      if (!process.env.CASHFREE_CLIENT_ID || !process.env.CASHFREE_CLIENT_SECRET) {
        return 'demo_token';
      }

      const response = await fetch(`${this.baseUrl}/payout/v1/authorize`, {
        method: 'POST',
        headers: {
          'X-Client-Id': this.clientId,
          'X-Client-Secret': this.clientSecret,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Token request failed: ${response.statusText}`);
      }

      const data = await response.json();
      this.accessToken = data.data?.token || '';
      this.tokenExpiry = new Date(Date.now() + ((data.data?.expiry || 3600) * 1000));
      
      return this.accessToken;
    } catch (error) {
      throw new PaymentError(
        PaymentErrors.PROVIDER_ERROR,
        `Failed to get Cashfree access token: ${(error as Error).message}`,
        'cashfree'
      );
    }
  }

  async createCheckout(params: CreateCheckoutParams): Promise<CheckoutResponse> {
    const orderId = `garden_sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Return demo response if no credentials configured
    if (!process.env.CASHFREE_CLIENT_ID || !process.env.CASHFREE_CLIENT_SECRET) {
      return {
        checkoutUrl: '/demo-payment?amount=' + params.amount + '&currency=' + params.currency,
        sessionId: 'demo_session_' + Date.now(),
        paymentId: 'demo_payment_' + Date.now(),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      };
    }

    const token = await this.getAccessToken();

    const orderData = {
      order_id: orderId,
      order_amount: params.amount,
      order_currency: params.currency,
      customer_details: {
        customer_id: params.customerEmail,
        customer_name: params.customerName,
        customer_email: params.customerEmail,
      },
      order_meta: {
        return_url: params.returnUrl,
        notify_url: `${process.env.APP_URL}/api/payments/cashfree/webhook`,
        payment_methods: 'cc,dc,nb,upi,paypal,app',
      },
      order_note: `Garden Monitoring Subscription - ${params.productName}`,
      order_tags: {
        subscription_type: params.subscriptionType,
        interval: params.interval,
      },
    };

    try {
      const response = await fetch(`${this.baseUrl}/pg/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'x-api-version': '2023-08-01',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Order creation failed: ${JSON.stringify(errorData)}`);
      }

      const result = await response.json();
      
      return {
        checkoutUrl: result.payment_link,
        sessionId: result.cf_order_id,
        paymentId: orderId,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
      };
    } catch (error) {
      throw new PaymentError(
        PaymentErrors.PROVIDER_ERROR,
        `Failed to create Cashfree checkout: ${(error as Error).message}`,
        'cashfree'
      );
    }
  }

  async handleWebhook(body: any, signature?: string): Promise<WebhookResult> {
    try {
      // Verify webhook signature
      const expectedSignature = crypto
        .createHmac('sha256', this.clientSecret)
        .update(JSON.stringify(body))
        .digest('base64');

      if (signature !== expectedSignature) {
        throw new PaymentError(PaymentErrors.INVALID_SIGNATURE, 'Invalid webhook signature');
      }

      const { type, data } = body;

      if (type === 'PAYMENT_SUCCESS_WEBHOOK') {
        return {
          success: true,
          subscriptionId: data.order.order_id,
          customerId: data.customer_details.customer_email,
          status: 'active',
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
          metadata: {
            paymentId: data.payment.cf_payment_id,
            amount: data.payment.payment_amount,
            currency: data.payment.payment_currency,
          },
        };
      }

      return { success: false };
    } catch (error) {
      throw new PaymentError(
        PaymentErrors.PROVIDER_ERROR,
        `Cashfree webhook handling failed: ${(error as Error).message}`,
        'cashfree'
      );
    }
  }

  async getSubscriptionStatus(subscriptionId: string): Promise<SubscriptionStatus> {
    const token = await this.getAccessToken();

    try {
      const response = await fetch(`${this.baseUrl}/pg/orders/${subscriptionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-api-version': '2023-08-01',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch order status: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        id: subscriptionId,
        status: data.order_status === 'PAID' ? 'active' : 'pending',
        currentPeriodStart: new Date(data.created_at),
        currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        cancelAtPeriodEnd: false,
        customerId: data.customer_details.customer_email,
      };
    } catch (error) {
      throw new PaymentError(
        PaymentErrors.SUBSCRIPTION_NOT_FOUND,
        `Failed to get Cashfree subscription status: ${(error as Error).message}`,
        'cashfree'
      );
    }
  }

  async verifyPayment(paymentId: string): Promise<PaymentVerification> {
    const token = await this.getAccessToken();

    try {
      const response = await fetch(`${this.baseUrl}/pg/orders/${paymentId}/payments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-api-version': '2023-08-01',
        },
      });

      if (!response.ok) {
        return { isValid: false };
      }

      const data = await response.json();
      const payment = data[0]; // Get latest payment

      return {
        isValid: payment?.payment_status === 'SUCCESS',
        subscriptionId: paymentId,
        amount: payment?.payment_amount,
        currency: payment?.payment_currency,
        status: payment?.payment_status,
      };
    } catch (error) {
      return { isValid: false };
    }
  }
}