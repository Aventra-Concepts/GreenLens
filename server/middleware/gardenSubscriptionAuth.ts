import { RequestHandler } from 'express';
import { storage } from '../storage';

/**
 * Middleware to check if user has active Garden Monitoring subscription
 * Requires user to be authenticated first
 */
export const requireGardenSubscription: RequestHandler = async (req, res, next) => {
  try {
    // Check if user is authenticated
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ 
        message: "Authentication required",
        code: "AUTH_REQUIRED"
      });
    }

    const user = req.user as any;

    // Check if user has active garden monitoring subscription
    if (!user.gardenMonitoringActive) {
      return res.status(403).json({
        message: "Garden Monitoring subscription required",
        code: "SUBSCRIPTION_REQUIRED",
        subscriptionRequired: true,
        subscriptionType: "garden_monitoring",
        annualPrice: 95,
        features: [
          "Unlimited plant tracking",
          "AI health predictions with weather integration", 
          "Achievement system with badges",
          "Social sharing of plant milestones",
          "Detailed PDF reports",
          "Expert care recommendations",
          "Environmental monitoring tools"
        ]
      });
    }

    // Check if subscription has expired
    if (user.gardenMonitoringExpiresAt && new Date() > user.gardenMonitoringExpiresAt) {
      // Mark subscription as inactive
      await storage.updateUserGardenSubscription(user.id, {
        gardenMonitoringActive: false,
        gardenMonitoringExpiresAt: null
      });

      return res.status(403).json({
        message: "Garden Monitoring subscription expired",
        code: "SUBSCRIPTION_EXPIRED", 
        subscriptionExpired: true,
        expiredAt: user.gardenMonitoringExpiresAt,
        subscriptionType: "garden_monitoring",
        renewalRequired: true
      });
    }

    // Check if subscription expires within 7 days (send notification warning)
    if (user.gardenMonitoringExpiresAt) {
      const daysUntilExpiry = Math.ceil(
        (user.gardenMonitoringExpiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysUntilExpiry <= 7) {
        // Add expiry warning to response headers for client to display
        res.setHeader('X-Subscription-Warning', 'expires-soon');
        res.setHeader('X-Days-Until-Expiry', daysUntilExpiry.toString());
      }
    }

    next();
  } catch (error) {
    console.error('Garden subscription auth error:', error);
    res.status(500).json({ 
      message: "Internal server error",
      code: "SERVER_ERROR"
    });
  }
};

/**
 * Middleware to check subscription status without blocking request
 * Adds subscription info to request object
 */
export const checkGardenSubscriptionStatus: RequestHandler = async (req, res, next) => {
  try {
    if (req.isAuthenticated() && req.user) {
      const user = req.user as any;
      
      req.gardenSubscription = {
        isActive: user.gardenMonitoringActive || false,
        expiresAt: user.gardenMonitoringExpiresAt,
        subscriptionId: user.gardenMonitoringSubscriptionId,
        hasAccess: user.gardenMonitoringActive && 
                  (!user.gardenMonitoringExpiresAt || new Date() < user.gardenMonitoringExpiresAt)
      };
    } else {
      req.gardenSubscription = {
        isActive: false,
        hasAccess: false
      };
    }

    next();
  } catch (error) {
    console.error('Garden subscription status check error:', error);
    req.gardenSubscription = {
      isActive: false,
      hasAccess: false
    };
    next();
  }
};

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      gardenSubscription?: {
        isActive: boolean;
        hasAccess: boolean;
        expiresAt?: Date;
        subscriptionId?: string;
      };
    }
  }
}