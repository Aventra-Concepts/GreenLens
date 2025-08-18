import Stripe from 'stripe';
import { z } from 'zod';

// Payment Gateway Types
export enum PaymentGateway {
  STRIPE = 'stripe',
  PAYPAL = 'paypal',
  RAZORPAY = 'razorpay',
  CASHFREE = 'cashfree',
  WISE = 'wise',
  ADYEN = 'adyen',
  SQUARE = 'square',
  MOLLIE = 'mollie',
  KLARNA = 'klarna',
  FLUTTERWAVE = 'flutterwave',
  PAYU = 'payu',
  PAYTM = 'paytm',
  PHONEPE = 'phonepe',
  GOOGLEPAY = 'googlepay',
  APPLEPAY = 'applepay',
  ALIPAY = 'alipay',
  WECHATPAY = 'wechatpay',
  UNIONPAY = 'unionpay'
}

export enum PaymentDirection {
  INWARD = 'inward',   // Receiving payments
  OUTWARD = 'outward'  // Making payments/payouts
}

export enum PaymentRegion {
  INTERNATIONAL = 'international',
  DOMESTIC = 'domestic'
}

// Payment Method Types
export enum PaymentMethod {
  CARD = 'card',
  BANK_TRANSFER = 'bank_transfer',
  DIGITAL_WALLET = 'digital_wallet',
  CRYPTO = 'crypto',
  BUY_NOW_PAY_LATER = 'bnpl',
  DIRECT_DEBIT = 'direct_debit',
  CASH = 'cash'
}

// Supported Currencies
export const SUPPORTED_CURRENCIES = [
  'USD', 'EUR', 'GBP', 'JPY', 'CNY', 'INR', 'CAD', 'AUD', 'CHF', 'SEK',
  'NOK', 'DKK', 'PLN', 'CZK', 'HUF', 'RON', 'BGN', 'HRK', 'RUB', 'BRL',
  'MXN', 'ARS', 'CLP', 'COP', 'PEN', 'UYU', 'NZD', 'ZAR', 'KRW', 'THB',
  'MYR', 'PHP', 'IDR', 'VND', 'HKD', 'TWD', 'SGD', 'AED', 'SAR', 'QAR',
  'KWD', 'BHD', 'OMR', 'JOD', 'LBP', 'EGP', 'TRY', 'ILS', 'PKR', 'BDT',
  'LKR', 'NPR', 'AFN', 'KES', 'UGX', 'TZS', 'GHS', 'NGN', 'MAD', 'ETB',
  'XOF', 'XAF'
] as const;

export type Currency = typeof SUPPORTED_CURRENCIES[number];

// Gateway Configuration Interface
interface GatewayConfig {
  gateway: PaymentGateway;
  enabled: boolean;
  supportedMethods: PaymentMethod[];
  supportedCurrencies: Currency[];
  supportedRegions: PaymentRegion[];
  supportedDirections: PaymentDirection[];
  minAmount: number;
  maxAmount: number;
  processingFee: number; // Percentage
  fixedFee: number;
  setupCompleted: boolean;
  apiKeys: {
    publicKey?: string;
    secretKey?: string;
    merchantId?: string;
    webhookSecret?: string;
  };
}

// Payment Intent Schema
const PaymentIntentSchema = z.object({
  amount: z.number().positive(),
  currency: z.enum(SUPPORTED_CURRENCIES),
  gateway: z.nativeEnum(PaymentGateway),
  method: z.nativeEnum(PaymentMethod),
  direction: z.nativeEnum(PaymentDirection),
  description: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

type PaymentIntentRequest = z.infer<typeof PaymentIntentSchema>;

export class EnhancedPaymentService {
  private gateways: Map<PaymentGateway, GatewayConfig> = new Map();
  private stripe?: Stripe;

  constructor() {
    this.initializeGateways();
  }

  private initializeGateways() {
    // International Gateways
    this.gateways.set(PaymentGateway.STRIPE, {
      gateway: PaymentGateway.STRIPE,
      enabled: !!process.env.STRIPE_SECRET_KEY,
      supportedMethods: [PaymentMethod.CARD, PaymentMethod.DIGITAL_WALLET, PaymentMethod.BANK_TRANSFER],
      supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'SEK', 'NOK', 'DKK'] as Currency[],
      supportedRegions: [PaymentRegion.INTERNATIONAL],
      supportedDirections: [PaymentDirection.INWARD, PaymentDirection.OUTWARD],
      minAmount: 0.50,
      maxAmount: 999999,
      processingFee: 2.9,
      fixedFee: 0.30,
      setupCompleted: !!process.env.STRIPE_SECRET_KEY,
      apiKeys: {
        publicKey: process.env.STRIPE_PUBLIC_KEY,
        secretKey: process.env.STRIPE_SECRET_KEY,
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
      },
    });

    this.gateways.set(PaymentGateway.PAYPAL, {
      gateway: PaymentGateway.PAYPAL,
      enabled: !!process.env.PAYPAL_CLIENT_ID,
      supportedMethods: [PaymentMethod.DIGITAL_WALLET, PaymentMethod.CARD, PaymentMethod.BANK_TRANSFER],
      supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'] as Currency[],
      supportedRegions: [PaymentRegion.INTERNATIONAL],
      supportedDirections: [PaymentDirection.INWARD, PaymentDirection.OUTWARD],
      minAmount: 1.00,
      maxAmount: 999999,
      processingFee: 3.49,
      fixedFee: 0.49,
      setupCompleted: !!process.env.PAYPAL_CLIENT_ID,
      apiKeys: {
        publicKey: process.env.PAYPAL_CLIENT_ID,
        secretKey: process.env.PAYPAL_CLIENT_SECRET,
      },
    });

    this.gateways.set(PaymentGateway.ADYEN, {
      gateway: PaymentGateway.ADYEN,
      enabled: !!process.env.ADYEN_API_KEY,
      supportedMethods: [PaymentMethod.CARD, PaymentMethod.DIGITAL_WALLET, PaymentMethod.BANK_TRANSFER, PaymentMethod.BUY_NOW_PAY_LATER],
      supportedCurrencies: ['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'INR', 'AUD', 'CAD', 'CHF', 'SEK', 'NOK', 'DKK'] as Currency[],
      supportedRegions: [PaymentRegion.INTERNATIONAL],
      supportedDirections: [PaymentDirection.INWARD, PaymentDirection.OUTWARD],
      minAmount: 0.01,
      maxAmount: 999999,
      processingFee: 2.95,
      fixedFee: 0.25,
      setupCompleted: !!process.env.ADYEN_API_KEY,
      apiKeys: {
        secretKey: process.env.ADYEN_API_KEY,
        merchantId: process.env.ADYEN_MERCHANT_ACCOUNT,
      },
    });

    this.gateways.set(PaymentGateway.WISE, {
      gateway: PaymentGateway.WISE,
      enabled: !!process.env.WISE_API_TOKEN,
      supportedMethods: [PaymentMethod.BANK_TRANSFER],
      supportedCurrencies: SUPPORTED_CURRENCIES.slice(),
      supportedRegions: [PaymentRegion.INTERNATIONAL],
      supportedDirections: [PaymentDirection.OUTWARD],
      minAmount: 1.00,
      maxAmount: 999999,
      processingFee: 0.5,
      fixedFee: 0.00,
      setupCompleted: !!process.env.WISE_API_TOKEN,
      apiKeys: {
        secretKey: process.env.WISE_API_TOKEN,
      },
    });

    // Indian Domestic Gateways
    this.gateways.set(PaymentGateway.RAZORPAY, {
      gateway: PaymentGateway.RAZORPAY,
      enabled: !!process.env.RAZORPAY_KEY_ID,
      supportedMethods: [PaymentMethod.CARD, PaymentMethod.DIGITAL_WALLET, PaymentMethod.BANK_TRANSFER],
      supportedCurrencies: ['INR'] as Currency[],
      supportedRegions: [PaymentRegion.DOMESTIC],
      supportedDirections: [PaymentDirection.INWARD, PaymentDirection.OUTWARD],
      minAmount: 1.00,
      maxAmount: 999999,
      processingFee: 2.0,
      fixedFee: 0.00,
      setupCompleted: !!process.env.RAZORPAY_KEY_ID,
      apiKeys: {
        publicKey: process.env.RAZORPAY_KEY_ID,
        secretKey: process.env.RAZORPAY_KEY_SECRET,
        webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET,
      },
    });

    this.gateways.set(PaymentGateway.CASHFREE, {
      gateway: PaymentGateway.CASHFREE,
      enabled: !!process.env.CASHFREE_APP_ID,
      supportedMethods: [PaymentMethod.CARD, PaymentMethod.DIGITAL_WALLET, PaymentMethod.BANK_TRANSFER],
      supportedCurrencies: ['INR'] as Currency[],
      supportedRegions: [PaymentRegion.DOMESTIC],
      supportedDirections: [PaymentDirection.INWARD, PaymentDirection.OUTWARD],
      minAmount: 1.00,
      maxAmount: 999999,
      processingFee: 1.95,
      fixedFee: 0.00,
      setupCompleted: !!process.env.CASHFREE_APP_ID,
      apiKeys: {
        publicKey: process.env.CASHFREE_APP_ID,
        secretKey: process.env.CASHFREE_SECRET_KEY,
      },
    });

    this.gateways.set(PaymentGateway.PAYU, {
      gateway: PaymentGateway.PAYU,
      enabled: !!process.env.PAYU_MERCHANT_KEY,
      supportedMethods: [PaymentMethod.CARD, PaymentMethod.DIGITAL_WALLET, PaymentMethod.BANK_TRANSFER],
      supportedCurrencies: ['INR'] as Currency[],
      supportedRegions: [PaymentRegion.DOMESTIC],
      supportedDirections: [PaymentDirection.INWARD],
      minAmount: 10.00,
      maxAmount: 999999,
      processingFee: 2.0,
      fixedFee: 0.00,
      setupCompleted: !!process.env.PAYU_MERCHANT_KEY,
      apiKeys: {
        publicKey: process.env.PAYU_MERCHANT_KEY,
        secretKey: process.env.PAYU_SALT,
      },
    });

    this.gateways.set(PaymentGateway.PHONEPE, {
      gateway: PaymentGateway.PHONEPE,
      enabled: !!process.env.PHONEPE_MERCHANT_ID,
      supportedMethods: [PaymentMethod.DIGITAL_WALLET],
      supportedCurrencies: ['INR'] as Currency[],
      supportedRegions: [PaymentRegion.DOMESTIC],
      supportedDirections: [PaymentDirection.INWARD],
      minAmount: 1.00,
      maxAmount: 100000,
      processingFee: 0.0,
      fixedFee: 0.00,
      setupCompleted: !!process.env.PHONEPE_MERCHANT_ID,
      apiKeys: {
        merchantId: process.env.PHONEPE_MERCHANT_ID,
        secretKey: process.env.PHONEPE_SALT_KEY,
      },
    });

    // European Gateways
    this.gateways.set(PaymentGateway.MOLLIE, {
      gateway: PaymentGateway.MOLLIE,
      enabled: !!process.env.MOLLIE_API_KEY,
      supportedMethods: [PaymentMethod.CARD, PaymentMethod.BANK_TRANSFER, PaymentMethod.DIGITAL_WALLET],
      supportedCurrencies: ['EUR', 'USD', 'GBP'] as Currency[],
      supportedRegions: [PaymentRegion.INTERNATIONAL],
      supportedDirections: [PaymentDirection.INWARD],
      minAmount: 0.01,
      maxAmount: 999999,
      processingFee: 1.8,
      fixedFee: 0.25,
      setupCompleted: !!process.env.MOLLIE_API_KEY,
      apiKeys: {
        secretKey: process.env.MOLLIE_API_KEY,
      },
    });

    this.gateways.set(PaymentGateway.KLARNA, {
      gateway: PaymentGateway.KLARNA,
      enabled: !!process.env.KLARNA_USERNAME,
      supportedMethods: [PaymentMethod.BUY_NOW_PAY_LATER],
      supportedCurrencies: ['EUR', 'USD', 'GBP', 'SEK', 'NOK', 'DKK'] as Currency[],
      supportedRegions: [PaymentRegion.INTERNATIONAL],
      supportedDirections: [PaymentDirection.INWARD],
      minAmount: 1.00,
      maxAmount: 10000,
      processingFee: 3.29,
      fixedFee: 0.30,
      setupCompleted: !!process.env.KLARNA_USERNAME,
      apiKeys: {
        publicKey: process.env.KLARNA_USERNAME,
        secretKey: process.env.KLARNA_PASSWORD,
      },
    });

    // US Domestic Gateways
    this.gateways.set(PaymentGateway.SQUARE, {
      gateway: PaymentGateway.SQUARE,
      enabled: !!process.env.SQUARE_APPLICATION_ID,
      supportedMethods: [PaymentMethod.CARD, PaymentMethod.DIGITAL_WALLET],
      supportedCurrencies: ['USD'] as Currency[],
      supportedRegions: [PaymentRegion.DOMESTIC],
      supportedDirections: [PaymentDirection.INWARD, PaymentDirection.OUTWARD],
      minAmount: 1.00,
      maxAmount: 999999,
      processingFee: 2.6,
      fixedFee: 0.10,
      setupCompleted: !!process.env.SQUARE_APPLICATION_ID,
      apiKeys: {
        publicKey: process.env.SQUARE_APPLICATION_ID,
        secretKey: process.env.SQUARE_ACCESS_TOKEN,
      },
    });

    // African Gateways
    this.gateways.set(PaymentGateway.FLUTTERWAVE, {
      gateway: PaymentGateway.FLUTTERWAVE,
      enabled: !!process.env.FLUTTERWAVE_PUBLIC_KEY,
      supportedMethods: [PaymentMethod.CARD, PaymentMethod.BANK_TRANSFER, PaymentMethod.DIGITAL_WALLET],
      supportedCurrencies: ['NGN', 'USD', 'EUR', 'GBP', 'KES', 'GHS', 'ZAR'] as Currency[],
      supportedRegions: [PaymentRegion.INTERNATIONAL],
      supportedDirections: [PaymentDirection.INWARD, PaymentDirection.OUTWARD],
      minAmount: 1.00,
      maxAmount: 999999,
      processingFee: 1.4,
      fixedFee: 0.00,
      setupCompleted: !!process.env.FLUTTERWAVE_PUBLIC_KEY,
      apiKeys: {
        publicKey: process.env.FLUTTERWAVE_PUBLIC_KEY,
        secretKey: process.env.FLUTTERWAVE_SECRET_KEY,
      },
    });

    // Asian Digital Wallets
    this.gateways.set(PaymentGateway.ALIPAY, {
      gateway: PaymentGateway.ALIPAY,
      enabled: !!process.env.ALIPAY_APP_ID,
      supportedMethods: [PaymentMethod.DIGITAL_WALLET],
      supportedCurrencies: ['CNY', 'USD', 'EUR'] as Currency[],
      supportedRegions: [PaymentRegion.INTERNATIONAL],
      supportedDirections: [PaymentDirection.INWARD],
      minAmount: 0.01,
      maxAmount: 999999,
      processingFee: 0.55,
      fixedFee: 0.00,
      setupCompleted: !!process.env.ALIPAY_APP_ID,
      apiKeys: {
        publicKey: process.env.ALIPAY_APP_ID,
        secretKey: process.env.ALIPAY_PRIVATE_KEY,
      },
    });

    this.gateways.set(PaymentGateway.WECHATPAY, {
      gateway: PaymentGateway.WECHATPAY,
      enabled: !!process.env.WECHAT_APP_ID,
      supportedMethods: [PaymentMethod.DIGITAL_WALLET],
      supportedCurrencies: ['CNY', 'USD', 'EUR'] as Currency[],
      supportedRegions: [PaymentRegion.INTERNATIONAL],
      supportedDirections: [PaymentDirection.INWARD],
      minAmount: 0.01,
      maxAmount: 999999,
      processingFee: 0.6,
      fixedFee: 0.00,
      setupCompleted: !!process.env.WECHAT_APP_ID,
      apiKeys: {
        publicKey: process.env.WECHAT_APP_ID,
        secretKey: process.env.WECHAT_MCH_KEY,
        merchantId: process.env.WECHAT_MCH_ID,
      },
    });

    // Initialize Stripe if available
    if (process.env.STRIPE_SECRET_KEY) {
      this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2024-12-18.acacia',
      });
    }
  }

  // Get available gateways based on criteria
  getAvailableGateways(criteria: {
    currency?: Currency;
    direction?: PaymentDirection;
    region?: PaymentRegion;
    method?: PaymentMethod;
    amount?: number;
  } = {}): GatewayConfig[] {
    return Array.from(this.gateways.values()).filter(gateway => {
      if (!gateway.enabled || !gateway.setupCompleted) return false;
      
      if (criteria.currency && !gateway.supportedCurrencies.includes(criteria.currency)) return false;
      if (criteria.direction && !gateway.supportedDirections.includes(criteria.direction)) return false;
      if (criteria.region && !gateway.supportedRegions.includes(criteria.region)) return false;
      if (criteria.method && !gateway.supportedMethods.includes(criteria.method)) return false;
      if (criteria.amount && (criteria.amount < gateway.minAmount || criteria.amount > gateway.maxAmount)) return false;
      
      return true;
    });
  }

  // Get optimal gateway based on criteria
  getOptimalGateway(criteria: {
    currency: Currency;
    direction: PaymentDirection;
    region?: PaymentRegion;
    method?: PaymentMethod;
    amount: number;
  }): GatewayConfig | null {
    const availableGateways = this.getAvailableGateways(criteria);
    
    if (availableGateways.length === 0) return null;
    
    // Sort by total cost (processing fee + fixed fee)
    return availableGateways.sort((a, b) => {
      const costA = (criteria.amount * a.processingFee / 100) + a.fixedFee;
      const costB = (criteria.amount * b.processingFee / 100) + b.fixedFee;
      return costA - costB;
    })[0];
  }

  // Create payment intent
  async createPaymentIntent(request: PaymentIntentRequest): Promise<{
    success: boolean;
    clientSecret?: string;
    paymentId?: string;
    gateway: PaymentGateway;
    error?: string;
  }> {
    try {
      const validatedRequest = PaymentIntentSchema.parse(request);
      const gateway = this.gateways.get(validatedRequest.gateway);
      
      if (!gateway || !gateway.enabled) {
        return {
          success: false,
          error: 'Gateway not available',
          gateway: validatedRequest.gateway,
        };
      }

      switch (validatedRequest.gateway) {
        case PaymentGateway.STRIPE:
          return await this.createStripePaymentIntent(validatedRequest);
        
        case PaymentGateway.RAZORPAY:
          return await this.createRazorpayPaymentIntent(validatedRequest);
        
        case PaymentGateway.CASHFREE:
          return await this.createCashfreePaymentIntent(validatedRequest);
        
        default:
          return {
            success: false,
            error: 'Gateway implementation not available',
            gateway: validatedRequest.gateway,
          };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        gateway: request.gateway,
      };
    }
  }

  private async createStripePaymentIntent(request: PaymentIntentRequest) {
    if (!this.stripe) {
      return {
        success: false,
        error: 'Stripe not initialized',
        gateway: PaymentGateway.STRIPE,
      };
    }

    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(request.amount * 100), // Convert to cents
        currency: request.currency.toLowerCase(),
        description: request.description,
        metadata: request.metadata || {},
      });

      return {
        success: true,
        clientSecret: paymentIntent.client_secret!,
        paymentId: paymentIntent.id,
        gateway: PaymentGateway.STRIPE,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Stripe error',
        gateway: PaymentGateway.STRIPE,
      };
    }
  }

  private async createRazorpayPaymentIntent(request: PaymentIntentRequest) {
    // Razorpay implementation would go here
    return {
      success: false,
      error: 'Razorpay implementation pending',
      gateway: PaymentGateway.RAZORPAY,
    };
  }

  private async createCashfreePaymentIntent(request: PaymentIntentRequest) {
    // Cashfree implementation would go here
    return {
      success: false,
      error: 'Cashfree implementation pending',
      gateway: PaymentGateway.CASHFREE,
    };
  }

  // Calculate fees for a transaction
  calculateFees(gateway: PaymentGateway, amount: number): {
    processingFee: number;
    fixedFee: number;
    totalFee: number;
  } {
    const config = this.gateways.get(gateway);
    if (!config) {
      return { processingFee: 0, fixedFee: 0, totalFee: 0 };
    }

    const processingFee = (amount * config.processingFee) / 100;
    const fixedFee = config.fixedFee;
    const totalFee = processingFee + fixedFee;

    return { processingFee, fixedFee, totalFee };
  }

  // Get gateway status and configuration
  getGatewayStatus(): Array<{
    gateway: PaymentGateway;
    enabled: boolean;
    setupCompleted: boolean;
    supportedMethods: PaymentMethod[];
    supportedCurrencies: Currency[];
    supportedRegions: PaymentRegion[];
    supportedDirections: PaymentDirection[];
  }> {
    return Array.from(this.gateways.values()).map(config => ({
      gateway: config.gateway,
      enabled: config.enabled,
      setupCompleted: config.setupCompleted,
      supportedMethods: config.supportedMethods,
      supportedCurrencies: config.supportedCurrencies,
      supportedRegions: config.supportedRegions,
      supportedDirections: config.supportedDirections,
    }));
  }
}

export const enhancedPaymentService = new EnhancedPaymentService();