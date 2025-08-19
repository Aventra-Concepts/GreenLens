// Payment system types and interfaces
export interface PaymentProvider {
  name: string;
  supportsCurrency(currency: string): boolean;
  supportsRegion(region: string): boolean;
  createCheckout(params: CreateCheckoutParams): Promise<CheckoutResponse>;
  handleWebhook(body: any, signature?: string): Promise<WebhookResult>;
  getSubscriptionStatus(subscriptionId: string): Promise<SubscriptionStatus>;
  verifyPayment(paymentId: string): Promise<PaymentVerification>;
}

export interface CreateCheckoutParams {
  amount: number;
  currency: string;
  customerEmail: string;
  customerName: string;
  productName: string;
  returnUrl: string;
  cancelUrl: string;
  subscriptionType: 'garden_monitoring';
  interval: 'year';
  metadata?: Record<string, any>;
}

export interface CheckoutResponse {
  checkoutUrl: string;
  sessionId: string;
  paymentId: string;
  expiresAt: Date;
}

export interface WebhookResult {
  success: boolean;
  subscriptionId?: string;
  customerId?: string;
  status?: 'active' | 'cancelled' | 'expired' | 'pending';
  expiresAt?: Date;
  metadata?: Record<string, any>;
}

export interface SubscriptionStatus {
  id: string;
  status: 'active' | 'cancelled' | 'expired' | 'pending';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  customerId: string;
}

export interface PaymentVerification {
  isValid: boolean;
  subscriptionId?: string;
  amount?: number;
  currency?: string;
  status?: string;
}

export enum PaymentErrors {
  INVALID_SIGNATURE = 'INVALID_SIGNATURE',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  SUBSCRIPTION_NOT_FOUND = 'SUBSCRIPTION_NOT_FOUND',
  CURRENCY_NOT_SUPPORTED = 'CURRENCY_NOT_SUPPORTED',
  REGION_NOT_SUPPORTED = 'REGION_NOT_SUPPORTED',
  PROVIDER_ERROR = 'PROVIDER_ERROR'
}

export class PaymentError extends Error {
  constructor(
    public code: PaymentErrors,
    message: string,
    public provider?: string
  ) {
    super(message);
    this.name = 'PaymentError';
  }
}