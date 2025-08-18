import { db } from "../db";
import { ebookPurchases, ebooks, users } from "@shared/schema";
import { eq } from "drizzle-orm";
import Stripe from "stripe";
import { nanoid } from "nanoid";

// Initialize Stripe only if the secret key is provided
let stripe: Stripe | null = null;

if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2023-10-16",
  });
}

export class PaymentService {
  
  // Create payment intent for e-book purchase
  async createEbookPaymentIntent(
    userId: string,
    ebookId: string,
    currency = 'USD'
  ): Promise<{
    clientSecret: string;
    purchaseId: string;
    amount: number;
  }> {
    if (!stripe) {
      throw new Error('Payment processing is not configured. Please contact support.');
    }
    // Get e-book details
    const [ebook] = await db
      .select()
      .from(ebooks)
      .where(eq(ebooks.id, ebookId))
      .limit(1);

    if (!ebook) {
      throw new Error('E-book not found');
    }

    if (ebook.status !== 'published') {
      throw new Error('E-book is not available for purchase');
    }

    // Get user details
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new Error('User not found');
    }

    // Calculate pricing
    const basePrice = parseFloat(ebook.basePrice.toString());
    const platformFee = basePrice * parseFloat(ebook.platformCommissionRate.toString());
    const authorEarnings = basePrice - platformFee;

    // Create purchase record
    const purchaseOrderId = this.generateOrderId();
    const [purchase] = await db
      .insert(ebookPurchases)
      .values({
        purchaseOrderId,
        userId,
        ebookId,
        purchasePrice: basePrice.toString(),
        listPrice: ebook.basePrice,
        platformFee: platformFee.toString(),
        authorEarnings: authorEarnings.toString(),
        currency: currency.toUpperCase(),
        status: 'pending',
        customerEmail: user.email,
        customerName: `${user.firstName} ${user.lastName}`,
      })
      .returning();

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(basePrice * 100), // Convert to cents
      currency: currency.toLowerCase(),
      customer: await this.getOrCreateStripeCustomer(user),
      metadata: {
        purchaseId: purchase.id,
        ebookId: ebook.id,
        userId: user.id,
        type: 'ebook_purchase',
      },
      description: `Purchase of "${ebook.title}" by ${ebook.authorName}`,
    });

    // Update purchase with payment intent ID
    await db
      .update(ebookPurchases)
      .set({
        paymentIntentId: paymentIntent.id,
        paymentProvider: 'stripe',
      })
      .where(eq(ebookPurchases.id, purchase.id));

    return {
      clientSecret: paymentIntent.client_secret!,
      purchaseId: purchase.id,
      amount: basePrice,
    };
  }

  // Process successful payment
  async handlePaymentSuccess(paymentIntentId: string): Promise<void> {
    if (!stripe) {
      throw new Error('Payment processing is not configured. Please contact support.');
    }
    
    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
      throw new Error('Payment not successful');
    }

    const purchaseId = paymentIntent.metadata.purchaseId;
    if (!purchaseId) {
      throw new Error('Purchase ID not found in payment metadata');
    }

    // Update purchase status
    const [purchase] = await db
      .update(ebookPurchases)
      .set({
        status: 'completed',
        transactionId: paymentIntent.id,
        confirmationEmailSent: false, // Will be sent by email service
        receiptEmailSent: false,
        downloadLinkEmailSent: false,
      })
      .where(eq(ebookPurchases.id, purchaseId))
      .returning();

    if (!purchase) {
      throw new Error('Purchase not found');
    }

    // Update e-book sales statistics
    await this.updateEbookStats(purchase.ebookId);

    // Send confirmation email (would be handled by email service)
    await this.sendPurchaseConfirmationEmail(purchase);
  }

  // Handle payment failure
  async handlePaymentFailure(paymentIntentId: string, reason?: string): Promise<void> {
    const [purchase] = await db
      .update(ebookPurchases)
      .set({
        status: 'failed',
        // Store failure reason if provided
      })
      .where(eq(ebookPurchases.paymentIntentId, paymentIntentId))
      .returning();

    if (purchase) {
      console.log(`Payment failed for purchase ${purchase.id}: ${reason}`);
    }
  }

  // Process refund
  async processRefund(
    purchaseId: string,
    reason: string,
    refundAmount?: number
  ): Promise<void> {
    if (!stripe) {
      throw new Error('Payment processing is not configured. Please contact support.');
    }
    const [purchase] = await db
      .select()
      .from(ebookPurchases)
      .where(eq(ebookPurchases.id, purchaseId))
      .limit(1);

    if (!purchase) {
      throw new Error('Purchase not found');
    }

    if (purchase.status !== 'completed') {
      throw new Error('Cannot refund non-completed purchase');
    }

    const refundAmountToProcess = refundAmount || parseFloat(purchase.purchasePrice.toString());

    // Create refund in Stripe
    if (purchase.paymentIntentId) {
      await stripe.refunds.create({
        payment_intent: purchase.paymentIntentId,
        amount: Math.round(refundAmountToProcess * 100), // Convert to cents
        reason: 'requested_by_customer',
        metadata: {
          purchaseId: purchase.id,
          reason,
        },
      });
    }

    // Update purchase record
    await db
      .update(ebookPurchases)
      .set({
        refundStatus: refundAmount ? 'partial' : 'full',
        refundAmount: refundAmountToProcess.toString(),
        refundReason: reason,
        refundedAt: new Date(),
        accessRevoked: true, // Revoke download access
      })
      .where(eq(ebookPurchases.id, purchaseId));

    // Update e-book statistics
    await this.updateEbookStats(purchase.ebookId);
  }

  // Get or create Stripe customer
  private async getOrCreateStripeCustomer(user: any): Promise<string> {
    if (!stripe) {
      throw new Error('Payment processing is not configured. Please contact support.');
    }
    
    // In a real implementation, you'd store stripeCustomerId in the user record
    // For now, create a new customer each time (not ideal for production)
    const customer = await stripe.customers.create({
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      metadata: {
        userId: user.id,
      },
    });

    return customer.id;
  }

  // Update e-book sales statistics
  private async updateEbookStats(ebookId: string): Promise<void> {
    const stats = await db
      .select({
        totalSales: sql<number>`count(*)`,
        totalRevenue: sql<number>`sum(${ebookPurchases.purchasePrice})`,
        totalAuthorEarnings: sql<number>`sum(${ebookPurchases.authorEarnings})`,
        totalPlatformEarnings: sql<number>`sum(${ebookPurchases.platformFee})`,
      })
      .from(ebookPurchases)
      .where(eq(ebookPurchases.ebookId, ebookId));

    if (stats[0]) {
      await db
        .update(ebooks)
        .set({
          totalSales: stats[0].totalSales,
          totalRevenue: stats[0].totalRevenue?.toString() || '0',
          authorEarnings: stats[0].totalAuthorEarnings?.toString() || '0',
          platformEarnings: stats[0].totalPlatformEarnings?.toString() || '0',
        })
        .where(eq(ebooks.id, ebookId));
    }
  }

  // Send purchase confirmation email
  private async sendPurchaseConfirmationEmail(purchase: any): Promise<void> {
    // This would integrate with your email service
    console.log(`Sending purchase confirmation email for purchase ${purchase.id}`);
    
    // Mark email as sent
    await db
      .update(ebookPurchases)
      .set({
        confirmationEmailSent: true,
        receiptEmailSent: true,
        downloadLinkEmailSent: true,
      })
      .where(eq(ebookPurchases.id, purchase.id));
  }

  private generateOrderId(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `EB${timestamp.slice(-8)}${random}`;
  }

  // Webhook handler for Stripe events
  async handleStripeWebhook(event: any): Promise<void> {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentSuccess(event.data.object.id);
        break;
      
      case 'payment_intent.payment_failed':
        await this.handlePaymentFailure(
          event.data.object.id,
          event.data.object.last_payment_error?.message
        );
        break;
      
      default:
        console.log(`Unhandled Stripe webhook event: ${event.type}`);
    }
  }
}

export const paymentService = new PaymentService();