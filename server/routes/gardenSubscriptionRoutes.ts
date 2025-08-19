import { Router } from "express";
import { requireAuth } from "../auth";
import { requireGardenSubscription, checkGardenSubscriptionStatus } from "../middleware/gardenSubscriptionAuth";
import { paymentService } from "../services/payments/paymentService";
import { PaymentError } from "../services/payments/paymentTypes";
import { storage } from "../storage";
import { GardenSubscriptionEmailService } from "../services/gardenSubscriptionEmailService";
import { z } from "zod";
import { db } from "../db";
import { users } from "@shared/schema";
import { eq, and, gt, count } from "drizzle-orm";

const router = Router();

// Schema for subscription request
const subscriptionRequestSchema = z.object({
  currency: z.string().default('USD'),
  region: z.string().optional(),
  returnUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

// Get subscription status and pricing
router.get('/status', requireAuth, checkGardenSubscriptionStatus, async (req, res) => {
  try {
    const user = req.user as any;
    const subscription = req.gardenSubscription;

    // Get pricing information for different currencies
    const availableProviders = paymentService.getAvailableProviders();
    const pricing = {
      USD: paymentService.getFormattedPrice('USD'),
      INR: paymentService.getFormattedPrice('INR'),
      EUR: paymentService.getFormattedPrice('EUR'),
      GBP: paymentService.getFormattedPrice('GBP'),
    };

    res.json({
      success: true,
      subscription: {
        isActive: subscription?.isActive || false,
        hasAccess: subscription?.hasAccess || false,
        expiresAt: subscription?.expiresAt,
        subscriptionId: subscription?.subscriptionId,
        daysUntilExpiry: subscription?.expiresAt 
          ? Math.ceil((subscription.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          : null,
      },
      pricing,
      availableProviders,
      features: [
        'Unlimited plant tracking and monitoring',
        'AI-powered health predictions with weather integration',
        'Gamified achievement system with badges',
        'Social sharing of plant milestones',
        'Detailed PDF reports and analytics',
        'Expert care recommendations',
        'Environmental monitoring tools',
        'Priority customer support'
      ]
    });
  } catch (error) {
    console.error('Get subscription status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get subscription status'
    });
  }
});

// Create subscription checkout
router.post('/checkout', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const validatedData = subscriptionRequestSchema.parse(req.body);

    // Check if user already has active subscription
    if (user.gardenMonitoringActive && user.gardenMonitoringExpiresAt && new Date() < user.gardenMonitoringExpiresAt) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active Garden Monitoring subscription',
        code: 'ALREADY_SUBSCRIBED',
        expiresAt: user.gardenMonitoringExpiresAt
      });
    }

    const checkoutData = await paymentService.createGardenSubscriptionCheckout({
      customerEmail: user.email,
      customerName: `${user.firstName} ${user.lastName}`,
      currency: validatedData.currency,
      region: validatedData.region,
      returnUrl: validatedData.returnUrl,
      cancelUrl: validatedData.cancelUrl,
    });

    // Log checkout creation
    await storage.logUserActivity({
      userId: user.id,
      action: 'garden_subscription_checkout_created',
      details: {
        provider: checkoutData.provider,
        currency: validatedData.currency,
        amount: paymentService.getAmountForCurrency(validatedData.currency),
        sessionId: checkoutData.sessionId,
      }
    });

    res.json({
      success: true,
      checkout: {
        url: checkoutData.checkoutUrl,
        sessionId: checkoutData.sessionId,
        provider: checkoutData.provider,
        expiresAt: checkoutData.expiresAt,
      },
      message: 'Checkout session created successfully'
    });

  } catch (error) {
    console.error('Create subscription checkout error:', error);
    
    if (error instanceof PaymentError) {
      return res.status(400).json({
        success: false,
        message: error.message,
        code: error.code,
        provider: error.provider
      });
    }

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data',
        errors: error.errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create checkout session'
    });
  }
});

// Handle payment success callback
router.post('/success', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    const { sessionId, provider, paymentId } = req.body;

    if (!sessionId || !provider) {
      return res.status(400).json({
        success: false,
        message: 'Missing required payment information'
      });
    }

    // Verify payment with the provider
    const verification = await paymentService.verifyPayment(provider, paymentId || sessionId);
    
    if (!verification.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }

    // Calculate expiry date (365 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 365);

    // Update user subscription
    const updatedUser = await storage.updateUserGardenSubscription(user.id, {
      gardenMonitoringActive: true,
      gardenMonitoringExpiresAt: expiresAt,
      gardenMonitoringSubscriptionId: verification.subscriptionId || sessionId,
    });

    // Log successful subscription
    await storage.logUserActivity({
      userId: user.id,
      action: 'garden_subscription_activated',
      details: {
        provider,
        subscriptionId: verification.subscriptionId || sessionId,
        amount: verification.amount,
        currency: verification.currency,
        expiresAt: expiresAt.toISOString(),
      }
    });

    // Send welcome email
    await GardenSubscriptionEmailService.sendSubscriptionWelcome(updatedUser, {
      subscriptionId: verification.subscriptionId || sessionId,
      expiresAt,
      provider,
      amount: verification.amount || 95,
      currency: verification.currency || 'USD',
    });

    res.json({
      success: true,
      message: 'Garden Monitoring subscription activated successfully!',
      subscription: {
        isActive: true,
        expiresAt,
        subscriptionId: verification.subscriptionId || sessionId,
      }
    });

  } catch (error) {
    console.error('Subscription success callback error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process subscription activation'
    });
  }
});

// Cancel subscription
router.post('/cancel', requireAuth, requireGardenSubscription, async (req, res) => {
  try {
    const user = req.user as any;

    // Update subscription to inactive
    const updatedUser = await storage.updateUserGardenSubscription(user.id, {
      gardenMonitoringActive: false,
      gardenMonitoringExpiresAt: null,
      gardenMonitoringSubscriptionId: null,
    });

    // Log cancellation
    await storage.logUserActivity({
      userId: user.id,
      action: 'garden_subscription_cancelled',
      details: {
        cancelledAt: new Date().toISOString(),
        subscriptionId: user.gardenMonitoringSubscriptionId,
      }
    });

    // Send cancellation email
    await GardenSubscriptionEmailService.sendSubscriptionCancellation(updatedUser);

    res.json({
      success: true,
      message: 'Garden Monitoring subscription cancelled successfully'
    });

  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel subscription'
    });
  }
});

// Webhook handlers for payment providers
router.post('/webhook/cashfree', async (req, res) => {
  try {
    const signature = req.headers['x-cf-signature'] as string;
    const result = await paymentService.handleWebhook('cashfree', req.body, signature);

    if (result.success && result.customerId) {
      // Find user by email and update subscription
      const user = await storage.getUserByEmail(result.customerId);
      if (user) {
        await storage.updateUserGardenSubscription(user.id, {
          gardenMonitoringActive: result.status === 'active',
          gardenMonitoringExpiresAt: result.expiresAt || null,
          gardenMonitoringSubscriptionId: result.subscriptionId || null,
        });

        console.log(`Cashfree webhook: Updated subscription for user ${user.email}`);
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Cashfree webhook error:', error);
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

router.post('/webhook/razorpay', async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'] as string;
    const result = await paymentService.handleWebhook('razorpay', req.body, signature);

    if (result.success && result.customerId) {
      // Find user by email and update subscription
      const user = await storage.getUserByEmail(result.customerId);
      if (user) {
        await storage.updateUserGardenSubscription(user.id, {
          gardenMonitoringActive: result.status === 'active',
          gardenMonitoringExpiresAt: result.expiresAt || null,
          gardenMonitoringSubscriptionId: result.subscriptionId || null,
        });

        console.log(`Razorpay webhook: Updated subscription for user ${user.email}`);
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Razorpay webhook error:', error);
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

// Get subscription analytics (admin only)
router.get('/analytics', requireAuth, async (req, res) => {
  try {
    const user = req.user as any;
    
    if (!user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    // Get subscription statistics  
    const activeSubscriptions = await db
      .select({ count: count() })
      .from(users)
      .where(and(
        eq(users.gardenMonitoringActive, true),
        gt(users.gardenMonitoringExpiresAt, new Date())
      ));

    res.json({
      success: true,
      analytics: {
        activeSubscriptions: activeSubscriptions[0]?.count || 0,
        availableProviders: paymentService.getAvailableProviders(),
      }
    });

  } catch (error) {
    console.error('Subscription analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get subscription analytics'
    });
  }
});

export default router;