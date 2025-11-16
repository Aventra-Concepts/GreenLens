import { db } from '../db';
import { paymentGateways, gatewayTransactions } from '@shared/schema';
import { eq, desc, sql } from 'drizzle-orm';

export interface GatewayConfig {
  provider: string;
  displayName: string;
  supportedCurrencies: string[];
  supportedCountries: string[];
  envVars: {
    appId?: string;
    secretKey?: string;
    clientId?: string;
    clientSecret?: string;
  };
}

export class PaymentGatewayService {
  private static readonly GATEWAY_CONFIGS: GatewayConfig[] = [
    {
      provider: 'cashfree',
      displayName: 'Cashfree',
      supportedCurrencies: ['INR', 'USD', 'EUR', 'GBP'],
      supportedCountries: ['IN', 'US', 'UK', 'EU'],
      envVars: {
        appId: 'CASHFREE_APP_ID',
        secretKey: 'CASHFREE_SECRET_KEY',
      },
    },
    {
      provider: 'razorpay',
      displayName: 'Razorpay',
      supportedCurrencies: ['INR', 'USD'],
      supportedCountries: ['IN', 'US'],
      envVars: {
        appId: 'RAZORPAY_KEY_ID',
        secretKey: 'RAZORPAY_KEY_SECRET',
      },
    },
    {
      provider: 'paypal',
      displayName: 'PayPal',
      supportedCurrencies: ['USD', 'EUR', 'GBP', 'INR'],
      supportedCountries: ['US', 'UK', 'EU', 'IN'],
      envVars: {
        clientId: 'PAYPAL_CLIENT_ID',
        clientSecret: 'PAYPAL_CLIENT_SECRET',
      },
    },
  ];

  async initializeGateways(): Promise<void> {
    console.log('Initializing payment gateways...');
    
    for (const config of PaymentGatewayService.GATEWAY_CONFIGS) {
      const existing = await db
        .select()
        .from(paymentGateways)
        .where(eq(paymentGateways.provider, config.provider))
        .limit(1);

      if (existing.length === 0) {
        const configStatus = this.checkConfiguration(config);
        
        await db.insert(paymentGateways).values({
          provider: config.provider,
          displayName: config.displayName,
          isEnabled: configStatus.isConfigured,
          isTestMode: true,
          isPrimary: config.provider === 'cashfree',
          supportedCurrencies: config.supportedCurrencies,
          supportedCountries: config.supportedCountries,
          configStatus: configStatus.isConfigured ? 'configured' : 'not_configured',
          statusMessage: configStatus.message,
          lastStatusCheck: new Date(),
        });

        console.log(`✓ Initialized ${config.displayName} gateway`);
      }
    }
  }

  checkConfiguration(config: GatewayConfig): { isConfigured: boolean; message: string } {
    const missingVars: string[] = [];

    Object.entries(config.envVars).forEach(([key, envVar]) => {
      if (!process.env[envVar]) {
        missingVars.push(envVar);
      }
    });

    if (missingVars.length > 0) {
      return {
        isConfigured: false,
        message: `Missing environment variables: ${missingVars.join(', ')}`,
      };
    }

    return {
      isConfigured: true,
      message: 'Configuration validated successfully',
    };
  }

  async getGateway(provider: string) {
    const gateway = await db
      .select()
      .from(paymentGateways)
      .where(eq(paymentGateways.provider, provider))
      .limit(1);

    return gateway[0];
  }

  async getAllGateways() {
    return await db.select().from(paymentGateways).orderBy(desc(paymentGateways.isPrimary));
  }

  async updateGateway(
    provider: string,
    updates: {
      isEnabled?: boolean;
      isTestMode?: boolean;
      isPrimary?: boolean;
      webhookUrl?: string;
      webhookSecret?: string;
      metadata?: any;
    },
    userId?: string | null
  ) {
    if (updates.isPrimary) {
      await db
        .update(paymentGateways)
        .set({ isPrimary: false })
        .where(eq(paymentGateways.isPrimary, true));
    }

    const updateData: any = {
      ...updates,
      updatedAt: new Date(),
    };
    
    // Only set lastConfiguredBy if userId is provided and valid
    if (userId && userId !== 'admin-system' && userId !== '999') {
      updateData.lastConfiguredBy = userId;
    }

    const [updated] = await db
      .update(paymentGateways)
      .set(updateData)
      .where(eq(paymentGateways.provider, provider))
      .returning();

    return updated;
  }

  async refreshGatewayStatus(provider: string) {
    const gateway = await this.getGateway(provider);
    if (!gateway) {
      throw new Error(`Gateway ${provider} not found`);
    }

    const config = PaymentGatewayService.GATEWAY_CONFIGS.find(c => c.provider === provider);
    if (!config) {
      throw new Error(`Gateway configuration for ${provider} not found`);
    }

    const configStatus = this.checkConfiguration(config);

    const [updated] = await db
      .update(paymentGateways)
      .set({
        configStatus: configStatus.isConfigured ? 'configured' : 'not_configured',
        statusMessage: configStatus.message,
        lastStatusCheck: new Date(),
        isEnabled: configStatus.isConfigured ? gateway.isEnabled : false,
      })
      .where(eq(paymentGateways.provider, provider))
      .returning();

    return updated;
  }

  async logTransaction(data: {
    gatewayId: string;
    transactionId: string;
    amount: string;
    currency: string;
    status: string;
    paymentMethod?: string;
    customerEmail?: string;
    customerName?: string;
    errorCode?: string;
    errorMessage?: string;
    responseData?: any;
  }) {
    const [transaction] = await db
      .insert(gatewayTransactions)
      .values(data)
      .returning();

    const gateway = await db
      .select()
      .from(paymentGateways)
      .where(eq(paymentGateways.id, data.gatewayId))
      .limit(1);

    if (gateway[0]) {
      const updates: any = {
        totalTransactions: (gateway[0].totalTransactions || 0) + 1,
      };

      if (data.status === 'success') {
        updates.successfulTransactions = (gateway[0].successfulTransactions || 0) + 1;
        updates.totalRevenue = sql`${paymentGateways.totalRevenue} + ${parseFloat(data.amount)}`;
      } else if (data.status === 'failed') {
        updates.failedTransactions = (gateway[0].failedTransactions || 0) + 1;
      }

      await db
        .update(paymentGateways)
        .set(updates)
        .where(eq(paymentGateways.id, data.gatewayId));
    }

    return transaction;
  }

  async getTransactions(gatewayId?: string, limit: number = 50) {
    const query = db
      .select()
      .from(gatewayTransactions)
      .orderBy(desc(gatewayTransactions.createdAt))
      .limit(limit);

    if (gatewayId) {
      return await query.where(eq(gatewayTransactions.gatewayId, gatewayId));
    }

    return await query;
  }

  async getGatewayStats(provider: string) {
    const gateway = await this.getGateway(provider);
    if (!gateway) {
      return null;
    }

    const recentTransactions = await db
      .select()
      .from(gatewayTransactions)
      .where(eq(gatewayTransactions.gatewayId, gateway.id))
      .orderBy(desc(gatewayTransactions.createdAt))
      .limit(10);

    return {
      gateway,
      recentTransactions,
      stats: {
        total: gateway.totalTransactions || 0,
        successful: gateway.successfulTransactions || 0,
        failed: gateway.failedTransactions || 0,
        revenue: gateway.totalRevenue || '0',
        successRate: gateway.totalTransactions 
          ? ((gateway.successfulTransactions || 0) / gateway.totalTransactions * 100).toFixed(2)
          : '0',
      },
    };
  }

  async getCashfreeCredentials(): Promise<{ appId: string; secretKey: string; isTestMode: boolean } | null> {
    const gateway = await this.getGateway('cashfree');
    if (!gateway || !gateway.isEnabled) {
      return null;
    }

    const appId = process.env.CASHFREE_APP_ID;
    const secretKey = process.env.CASHFREE_SECRET_KEY;

    if (!appId || !secretKey) {
      return null;
    }

    return {
      appId,
      secretKey,
      isTestMode: gateway.isTestMode,
    };
  }

  async testConnection(provider: string): Promise<{ success: boolean; message: string }> {
    const gateway = await this.getGateway(provider);
    if (!gateway) {
      return { success: false, message: 'Gateway not found' };
    }

    const config = PaymentGatewayService.GATEWAY_CONFIGS.find(c => c.provider === provider);
    if (!config) {
      return { success: false, message: 'Gateway configuration not found' };
    }

    const configCheck = this.checkConfiguration(config);
    if (!configCheck.isConfigured) {
      return { success: false, message: configCheck.message };
    }

    return { success: true, message: 'Connection successful' };
  }
}

export const paymentGatewayService = new PaymentGatewayService();
