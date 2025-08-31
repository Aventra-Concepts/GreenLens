import type { Express } from "express";
import Stripe from "stripe";
import { requireAuth } from "../middleware/auth";
import { db } from "../db";
import { users, subscriptions } from "@shared/schema";
import { eq } from "drizzle-orm";
import { subscriptionEmailService } from "../services/subscriptionEmailService";

// Initialize Stripe only if secret key is available
let stripe: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2023-10-16",
  });
}

export function registerStripeSubscriptionRoutes(app: Express) {
  // Create subscription route for premium plans
  app.post("/api/create-subscription", requireAuth, async (req, res) => {
    if (!stripe) {
      return res.status(503).json({ 
        error: "Payment processing not available",
        message: "Stripe configuration is missing. Please contact support."
      });
    }

    try {
      const { planId } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      if (!planId || !['pro', 'premium'].includes(planId)) {
        return res.status(400).json({ error: "Invalid plan selected" });
      }

      // Get user details
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId));

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Check if user already has an active subscription
      const [existingSubscription] = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.userId, userId));

      if (existingSubscription && existingSubscription.status === 'active') {
        // Get existing subscription from Stripe
        const stripeSubscription = await stripe.subscriptions.retrieve(existingSubscription.stripeSubscriptionId!);
        
        if (stripeSubscription.status === 'active') {
          return res.json({
            subscriptionId: stripeSubscription.id,
            clientSecret: stripeSubscription.latest_invoice?.payment_intent?.client_secret,
            message: "You already have an active subscription"
          });
        }
      }

      let customerId = user.stripeCustomerId;

      // Create Stripe customer if doesn't exist
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email!,
          name: `${user.firstName} ${user.lastName}`.trim() || user.email!,
          metadata: {
            userId: user.id,
            planId: planId
          }
        });

        customerId = customer.id;

        // Update user with Stripe customer ID
        await db
          .update(users)
          .set({ stripeCustomerId: customerId })
          .where(eq(users.id, userId));
      }

      // Define price IDs based on plan
      const priceMap = {
        pro: process.env.STRIPE_PRO_PRICE_ID || 'price_pro_monthly',
        premium: process.env.STRIPE_PREMIUM_PRICE_ID || 'price_premium_monthly'
      };

      const priceId = priceMap[planId as keyof typeof priceMap];

      // Create subscription
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{
          price: priceId,
        }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          userId: user.id,
          planId: planId
        }
      });

      // Save subscription to database
      await db
        .insert(subscriptions)
        .values({
          userId: user.id,
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscription.id,
          stripePriceId: priceId,
          status: subscription.status,
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          planType: planId === 'premium' ? 'premium' : 'pro',
        })
        .onConflictDoUpdate({
          target: subscriptions.userId,
          set: {
            stripeSubscriptionId: subscription.id,
            stripePriceId: priceId,
            status: subscription.status,
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            planType: planId === 'premium' ? 'premium' : 'pro',
            updatedAt: new Date(),
          },
        });

      const paymentIntent = subscription.latest_invoice?.payment_intent;

      res.json({
        subscriptionId: subscription.id,
        clientSecret: paymentIntent?.client_secret,
        status: subscription.status
      });

    } catch (error: any) {
      console.error('Stripe subscription creation error:', error);
      res.status(500).json({ 
        error: "Subscription creation failed",
        message: error.message || "An unexpected error occurred"
      });
    }
  });

  // Get user's current subscription
  app.get("/api/subscription/status", requireAuth, async (req, res) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const [subscription] = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.userId, userId));

      if (!subscription) {
        return res.json({ 
          hasSubscription: false,
          plan: 'free',
          status: 'none'
        });
      }

      // Check with Stripe for the most current status
      if (stripe && subscription.stripeSubscriptionId) {
        try {
          const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId);
          
          // Update local status if different
          if (stripeSubscription.status !== subscription.status) {
            await db
              .update(subscriptions)
              .set({ 
                status: stripeSubscription.status,
                updatedAt: new Date()
              })
              .where(eq(subscriptions.userId, userId));
          }

          return res.json({
            hasSubscription: true,
            plan: subscription.planType,
            status: stripeSubscription.status,
            currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
            cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end
          });
        } catch (stripeError) {
          console.error('Error fetching Stripe subscription:', stripeError);
        }
      }

      // Return database info if Stripe call fails
      res.json({
        hasSubscription: subscription.status === 'active',
        plan: subscription.planType,
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd,
      });

    } catch (error) {
      console.error('Error fetching subscription status:', error);
      res.status(500).json({ error: "Failed to fetch subscription status" });
    }
  });

  // Cancel subscription
  app.post("/api/subscription/cancel", requireAuth, async (req, res) => {
    if (!stripe) {
      return res.status(503).json({ error: "Payment processing not available" });
    }

    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const [subscription] = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.userId, userId));

      if (!subscription || !subscription.stripeSubscriptionId) {
        return res.status(404).json({ error: "No active subscription found" });
      }

      // Cancel subscription at period end (don't cancel immediately)
      const canceledSubscription = await stripe.subscriptions.update(
        subscription.stripeSubscriptionId,
        {
          cancel_at_period_end: true
        }
      );

      res.json({
        success: true,
        message: "Subscription will be canceled at the end of the billing period",
        cancelAt: new Date(canceledSubscription.current_period_end * 1000)
      });

    } catch (error: any) {
      console.error('Subscription cancellation error:', error);
      res.status(500).json({ 
        error: "Cancellation failed",
        message: error.message || "An unexpected error occurred"
      });
    }
  });

  // Webhook endpoint for Stripe events
  app.post("/api/stripe/webhook", async (req, res) => {
    if (!stripe) {
      return res.status(503).json({ error: "Stripe not configured" });
    }

    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig || !endpointSecret) {
      return res.status(400).json({ error: "Missing signature or webhook secret" });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).json({ error: 'Webhook signature verification failed' });
    }

    try {
      switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          const subscription = event.data.object as Stripe.Subscription;
          await handleSubscriptionUpdate(subscription);
          break;

        case 'customer.subscription.deleted':
          const deletedSubscription = event.data.object as Stripe.Subscription;
          await handleSubscriptionCancellation(deletedSubscription);
          break;

        case 'invoice.payment_succeeded':
          const invoice = event.data.object as Stripe.Invoice;
          await handleSuccessfulPayment(invoice);
          break;

        case 'invoice.payment_failed':
          const failedInvoice = event.data.object as Stripe.Invoice;
          await handleFailedPayment(failedInvoice);
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      console.error('Webhook handler error:', error);
      res.status(500).json({ error: 'Webhook handler failed' });
    }
  });
}

// Helper functions for webhook handling
async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.userId;
  if (!userId) return;

  const planType = subscription.metadata.planId === 'premium' ? 'premium' : 'pro';

  // Get existing subscription to check if this is a renewal
  const [existingSubscription] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);

  const isRenewal = existingSubscription && 
    subscription.status === 'active' && 
    new Date(subscription.current_period_start * 1000) > new Date(existingSubscription.currentPeriodStart || 0);

  await db
    .update(subscriptions)
    .set({
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      planType: planType,
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.userId, userId));

  // Send renewal confirmation email if this is a renewal
  if (isRenewal && subscription.status === 'active') {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
      
      if (user && user.email && subscriptionEmailService.isConfigured()) {
        await subscriptionEmailService.sendRenewalConfirmation(user.email, {
          username: user.firstName || 'Valued Customer',
          subscriptionType: planType === 'premium' ? 'Premium Plan' : 'Pro Plan',
          renewalDate: new Date().toLocaleDateString(),
          expiryDate: new Date(subscription.current_period_end * 1000).toLocaleDateString(),
          amount: `$${(subscription.items.data[0]?.price?.unit_amount ? subscription.items.data[0].price.unit_amount / 100 : 0).toFixed(2)}`,
          currency: subscription.currency?.toUpperCase() || 'USD',
          provider: 'Stripe'
        });
        
        console.log(`Subscription renewal confirmation email sent to ${user.email}`);
      }
    } catch (emailError) {
      console.error('Failed to send subscription renewal confirmation email:', emailError);
    }
  }
}

async function handleSubscriptionCancellation(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.userId;
  if (!userId) return;

  await db
    .update(subscriptions)
    .set({
      status: 'canceled',
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.userId, userId));
}

async function handleSuccessfulPayment(invoice: Stripe.Invoice) {
  try {
    console.log('Payment succeeded for invoice:', invoice.id);
    
    // Get subscription details to find the user
    if (invoice.subscription && typeof invoice.subscription === 'string') {
      const subscriptionId = invoice.subscription;
      
      if (stripe) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const userId = subscription.metadata.userId;
        
        if (userId) {
          // Get user details
          const [user] = await db
            .select()
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);
          
          if (user && user.email && subscriptionEmailService.isConfigured()) {
            // Send renewal confirmation email
            await subscriptionEmailService.sendRenewalConfirmation(user.email, {
              username: user.firstName || 'Valued Customer',
              subscriptionType: subscription.metadata.planId === 'premium' ? 'Premium Plan' : 'Pro Plan',
              renewalDate: new Date().toLocaleDateString(),
              expiryDate: new Date(subscription.current_period_end * 1000).toLocaleDateString(),
              amount: `$${(invoice.amount_paid / 100).toFixed(2)}`,
              currency: invoice.currency.toUpperCase(),
              provider: 'Stripe'
            });
            
            console.log(`Renewal confirmation email sent to ${user.email} for Stripe payment`);
          }
        }
      }
    }
    
  } catch (error) {
    console.error('Error sending renewal confirmation email:', error);
    // Don't fail the webhook for email issues
  }
}

async function handleFailedPayment(invoice: Stripe.Invoice) {
  // Handle failed payment (could send notification email, update status, etc.)
  console.log('Payment failed for invoice:', invoice.id);
}