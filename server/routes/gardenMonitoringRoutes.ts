import { Router } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { isAuthenticated } from '../auth';
import { 
  insertGardenPlantSchema,
  insertCareActivitySchema,
  insertPlantMeasurementSchema,
  insertEnvironmentalReadingSchema,
  type GardenPlant,
  type CareActivity,
  type PlantMeasurement,
  type EnvironmentalReading
} from '@shared/schema';
import Stripe from 'stripe';

const router = Router();

// Initialize Stripe (will be null if keys not provided)
let stripe: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
  });
}

// Middleware to check garden monitoring subscription
const requireGardenSubscription = async (req: any, res: any, next: any) => {
  try {
    const user = await storage.getUser(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user has active garden monitoring subscription
    if (!user.gardenMonitoringActive || 
        (user.gardenMonitoringExpiresAt && new Date(user.gardenMonitoringExpiresAt) < new Date())) {
      return res.status(403).json({ 
        message: 'Garden monitoring subscription required',
        error: 'SUBSCRIPTION_REQUIRED',
        upgradeUrl: '/garden-monitoring/subscribe'
      });
    }

    next();
  } catch (error) {
    console.error('Error checking garden subscription:', error);
    res.status(500).json({ message: 'Failed to verify subscription' });
  }
};

// Get garden monitoring subscription status
router.get('/subscription/status', isAuthenticated, async (req: any, res) => {
  try {
    const user = await storage.getUser(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isActive = user.gardenMonitoringActive && 
      (!user.gardenMonitoringExpiresAt || new Date(user.gardenMonitoringExpiresAt) > new Date());

    res.json({
      active: isActive,
      expiresAt: user.gardenMonitoringExpiresAt,
      subscriptionId: user.gardenMonitoringSubscriptionId
    });
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    res.status(500).json({ message: 'Failed to fetch subscription status' });
  }
});

// Create garden monitoring subscription
router.post('/subscription/create', isAuthenticated, async (req: any, res) => {
  if (!stripe) {
    return res.status(500).json({ 
      message: 'Payment system not configured',
      error: 'PAYMENT_NOT_CONFIGURED'
    });
  }

  try {
    const user = await storage.getUser(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user already has active subscription
    if (user.gardenMonitoringActive && 
        user.gardenMonitoringExpiresAt && 
        new Date(user.gardenMonitoringExpiresAt) > new Date()) {
      return res.status(400).json({ 
        message: 'You already have an active garden monitoring subscription' 
      });
    }

    // Create or get Stripe customer
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        metadata: {
          userId: user.id
        }
      });
      customerId = customer.id;
      
      // Update user with Stripe customer ID
      await storage.updateUserStripeInfo(user.id, { customerId });
    }

    // Create subscription for garden monitoring ($95/year)
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Garden Monitoring Premium',
            description: 'Advanced garden monitoring with AI insights, automated scheduling, and detailed analytics'
          },
          unit_amount: 9500, // $95 in cents
          recurring: {
            interval: 'year'
          }
        }
      }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    });

    const invoice = subscription.latest_invoice as Stripe.Invoice;
    const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent;

    res.json({
      subscriptionId: subscription.id,
      clientSecret: paymentIntent.client_secret,
      status: subscription.status
    });

  } catch (error) {
    console.error('Error creating garden subscription:', error);
    res.status(500).json({ message: 'Failed to create subscription' });
  }
});

// Handle successful subscription webhook (you'll need to implement webhook endpoint)
router.post('/subscription/confirm', isAuthenticated, async (req: any, res) => {
  try {
    const { subscriptionId } = req.body;
    const user = await storage.getUser(req.user.id);
    
    if (!user || !stripe) {
      return res.status(400).json({ message: 'Invalid request' });
    }

    // Verify subscription with Stripe
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    if (subscription.status === 'active') {
      const expiresAt = new Date(subscription.current_period_end * 1000);
      
      // Update user subscription status
      await storage.updateGardenSubscription(user.id, {
        subscriptionId: subscription.id,
        active: true,
        expiresAt
      });

      res.json({ message: 'Subscription activated successfully' });
    } else {
      res.status(400).json({ message: 'Subscription not active' });
    }

  } catch (error) {
    console.error('Error confirming subscription:', error);
    res.status(500).json({ message: 'Failed to confirm subscription' });
  }
});

// Get user's garden plants
router.get('/plants', isAuthenticated, requireGardenSubscription, async (req: any, res) => {
  try {
    const plants = await storage.getGardenPlants(req.user.id);
    res.json(plants);
  } catch (error) {
    console.error('Error fetching garden plants:', error);
    res.status(500).json({ message: 'Failed to fetch plants' });
  }
});

// Add new garden plant
router.post('/plants', isAuthenticated, requireGardenSubscription, async (req: any, res) => {
  try {
    const plantData = insertGardenPlantSchema.parse(req.body);
    const plant = await storage.createGardenPlant({
      ...plantData,
      userId: req.user.id
    });
    res.status(201).json(plant);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid plant data', errors: error.errors });
    }
    console.error('Error creating garden plant:', error);
    res.status(500).json({ message: 'Failed to create plant' });
  }
});

// Update garden plant
router.put('/plants/:plantId', isAuthenticated, requireGardenSubscription, async (req: any, res) => {
  try {
    const { plantId } = req.params;
    const updateData = insertGardenPlantSchema.partial().parse(req.body);
    
    const plant = await storage.updateGardenPlant(plantId, req.user.id, updateData);
    if (!plant) {
      return res.status(404).json({ message: 'Plant not found' });
    }
    
    res.json(plant);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid plant data', errors: error.errors });
    }
    console.error('Error updating garden plant:', error);
    res.status(500).json({ message: 'Failed to update plant' });
  }
});

// Delete garden plant
router.delete('/plants/:plantId', isAuthenticated, requireGardenSubscription, async (req: any, res) => {
  try {
    const { plantId } = req.params;
    await storage.deleteGardenPlant(plantId, req.user.id);
    res.json({ message: 'Plant deleted successfully' });
  } catch (error) {
    console.error('Error deleting garden plant:', error);
    res.status(500).json({ message: 'Failed to delete plant' });
  }
});

// Get care activities for a plant or user
router.get('/care-activities', isAuthenticated, requireGardenSubscription, async (req: any, res) => {
  try {
    const { plantId, upcoming } = req.query;
    const activities = await storage.getCareActivities(req.user.id, plantId as string, upcoming === 'true');
    res.json(activities);
  } catch (error) {
    console.error('Error fetching care activities:', error);
    res.status(500).json({ message: 'Failed to fetch care activities' });
  }
});

// Create care activity
router.post('/care-activities', isAuthenticated, requireGardenSubscription, async (req: any, res) => {
  try {
    const activityData = insertCareActivitySchema.parse(req.body);
    const activity = await storage.createCareActivity({
      ...activityData,
      userId: req.user.id
    });
    res.status(201).json(activity);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid activity data', errors: error.errors });
    }
    console.error('Error creating care activity:', error);
    res.status(500).json({ message: 'Failed to create activity' });
  }
});

// Mark care activity as completed
router.put('/care-activities/:activityId/complete', isAuthenticated, requireGardenSubscription, async (req: any, res) => {
  try {
    const { activityId } = req.params;
    const { notes } = req.body;
    
    const activity = await storage.completeCareActivity(activityId, req.user.id, notes);
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }
    
    res.json(activity);
  } catch (error) {
    console.error('Error completing care activity:', error);
    res.status(500).json({ message: 'Failed to complete activity' });
  }
});

// Get plant measurements
router.get('/plants/:plantId/measurements', isAuthenticated, requireGardenSubscription, async (req: any, res) => {
  try {
    const { plantId } = req.params;
    const measurements = await storage.getPlantMeasurements(plantId, req.user.id);
    res.json(measurements);
  } catch (error) {
    console.error('Error fetching plant measurements:', error);
    res.status(500).json({ message: 'Failed to fetch measurements' });
  }
});

// Add plant measurement
router.post('/plants/:plantId/measurements', isAuthenticated, requireGardenSubscription, async (req: any, res) => {
  try {
    const { plantId } = req.params;
    const measurementData = insertPlantMeasurementSchema.parse(req.body);
    
    const measurement = await storage.createPlantMeasurement({
      ...measurementData,
      plantId,
      userId: req.user.id
    });
    res.status(201).json(measurement);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid measurement data', errors: error.errors });
    }
    console.error('Error creating plant measurement:', error);
    res.status(500).json({ message: 'Failed to create measurement' });
  }
});

// Get environmental readings
router.get('/environmental-readings', isAuthenticated, requireGardenSubscription, async (req: any, res) => {
  try {
    const { location, plantId, days } = req.query;
    const readings = await storage.getEnvironmentalReadings(
      req.user.id, 
      location as string, 
      plantId as string,
      days ? parseInt(days as string) : 7
    );
    res.json(readings);
  } catch (error) {
    console.error('Error fetching environmental readings:', error);
    res.status(500).json({ message: 'Failed to fetch readings' });
  }
});

// Add environmental reading
router.post('/environmental-readings', isAuthenticated, requireGardenSubscription, async (req: any, res) => {
  try {
    const readingData = insertEnvironmentalReadingSchema.parse(req.body);
    const reading = await storage.createEnvironmentalReading({
      ...readingData,
      userId: req.user.id
    });
    res.status(201).json(reading);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid reading data', errors: error.errors });
    }
    console.error('Error creating environmental reading:', error);
    res.status(500).json({ message: 'Failed to create reading' });
  }
});

// Get garden dashboard stats
router.get('/dashboard/stats', isAuthenticated, requireGardenSubscription, async (req: any, res) => {
  try {
    const stats = await storage.getGardenDashboardStats(req.user.id);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching garden stats:', error);
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
});

// Generate garden report
router.post('/reports/generate', isAuthenticated, requireGardenSubscription, async (req: any, res) => {
  try {
    const { reportType, title } = req.body;
    
    if (!reportType || !title) {
      return res.status(400).json({ message: 'Report type and title are required' });
    }

    const report = await storage.generateGardenReport(req.user.id, reportType, title);
    res.status(201).json(report);
  } catch (error) {
    console.error('Error generating garden report:', error);
    res.status(500).json({ message: 'Failed to generate report' });
  }
});

// Get user's garden reports
router.get('/reports', isAuthenticated, requireGardenSubscription, async (req: any, res) => {
  try {
    const reports = await storage.getGardenReports(req.user.id);
    res.json(reports);
  } catch (error) {
    console.error('Error fetching garden reports:', error);
    res.status(500).json({ message: 'Failed to fetch reports' });
  }
});

export default router;