import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';
import type { InsertUserActivity } from '@shared/schema';

// Extend Express Request to include user activity tracking
interface ActivityRequest extends Request {
  logActivity?: (action: string, details?: any) => Promise<void>;
}

export function activityTracker(req: ActivityRequest, res: Response, next: NextFunction) {
  // Extract user information if authenticated
  const userId = (req.user as any)?.claims?.sub;
  const userAgent = req.get('User-Agent') || '';
  const ipAddress = req.ip || req.connection.remoteAddress || '';
  
  // Add activity logging function to request
  req.logActivity = async (action: string, details?: any) => {
    if (!userId) return; // Skip logging for unauthenticated users
    
    try {
      const activity: InsertUserActivity = {
        userId,
        action,
        page: req.path,
        details: details ? JSON.stringify(details) : null,
        ipAddress,
        userAgent,
        timezone: req.get('X-User-Timezone') || 'UTC',
      };
      
      await storage.logUserActivity(activity);
    } catch (error) {
      console.error('Failed to log user activity:', error);
      // Don't throw error to avoid disrupting the main request
    }
  };
  
  // Log page view for authenticated users
  if (userId && req.method === 'GET' && !req.path.startsWith('/api/')) {
    req.logActivity?.('page_view', { route: req.path, query: req.query });
  }
  
  next();
}

// Activity tracking for specific actions
export async function trackUserLogin(req: Request) {
  const userId = (req.user as any)?.claims?.sub;
  if (!userId) return;
  
  try {
    // Update user login activity
    await storage.updateUserLoginActivity(userId);
    
    // Log login activity
    const activity: InsertUserActivity = {
      userId,
      action: 'user_login',
      page: req.path,
      details: JSON.stringify({ 
        loginMethod: 'replit_auth',
        timestamp: new Date().toISOString()
      }),
      ipAddress: req.ip || req.connection.remoteAddress || '',
      userAgent: req.get('User-Agent') || '',
      timezone: req.get('X-User-Timezone') || 'UTC',
    };
    
    await storage.logUserActivity(activity);
  } catch (error) {
    console.error('Failed to track user login:', error);
  }
}

export async function trackPlantIdentification(req: Request, plantResultId: string, isFree: boolean) {
  const userId = (req.user as any)?.claims?.sub;
  if (!userId) return;
  
  try {
    const activity: InsertUserActivity = {
      userId,
      action: 'plant_identify',
      page: req.path,
      details: JSON.stringify({ 
        plantResultId,
        isFreeIdentification: isFree,
        timestamp: new Date().toISOString()
      }),
      ipAddress: req.ip || req.connection.remoteAddress || '',
      userAgent: req.get('User-Agent') || '',
      timezone: req.get('X-User-Timezone') || 'UTC',
    };
    
    await storage.logUserActivity(activity);
  } catch (error) {
    console.error('Failed to track plant identification:', error);
  }
}

export async function trackSubscriptionPurchase(req: Request, subscriptionId: string, planName: string) {
  const userId = (req.user as any)?.claims?.sub;
  if (!userId) return;
  
  try {
    const activity: InsertUserActivity = {
      userId,
      action: 'subscription_purchase',
      page: req.path,
      details: JSON.stringify({ 
        subscriptionId,
        planName,
        timestamp: new Date().toISOString()
      }),
      ipAddress: req.ip || req.connection.remoteAddress || '',
      userAgent: req.get('User-Agent') || '',
      timezone: req.get('X-User-Timezone') || 'UTC',
    };
    
    await storage.logUserActivity(activity);
  } catch (error) {
    console.error('Failed to track subscription purchase:', error);
  }
}

export async function trackPdfDownload(req: Request, plantResultId: string) {
  const userId = (req.user as any)?.claims?.sub;
  if (!userId) return;
  
  try {
    const activity: InsertUserActivity = {
      userId,
      action: 'pdf_download',
      page: req.path,
      details: JSON.stringify({ 
        plantResultId,
        timestamp: new Date().toISOString()
      }),
      ipAddress: req.ip || req.connection.remoteAddress || '',
      userAgent: req.get('User-Agent') || '',
      timezone: req.get('X-User-Timezone') || 'UTC',
    };
    
    await storage.logUserActivity(activity);
  } catch (error) {
    console.error('Failed to track PDF download:', error);
  }
}