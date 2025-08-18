import { Request, Response, NextFunction } from 'express';
import { User } from '@shared/schema';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

/**
 * Authentication middleware - ensures user is logged in
 */
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated() && req.user) {
    return next();
  }
  return res.status(401).json({ 
    success: false,
    message: "Authentication required" 
  });
}

/**
 * Admin authentication middleware - ensures user is admin
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated() && req.user && req.user.isSuperAdmin) {
    return next();
  }
  return res.status(403).json({ 
    success: false,
    message: "Admin access required" 
  });
}

/**
 * Author authentication middleware - ensures user is verified author
 */
export function requireAuthor(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated() && req.user && req.user.isAuthor && req.user.authorVerified) {
    return next();
  }
  return res.status(403).json({ 
    success: false,
    message: "Verified author access required" 
  });
}

/**
 * General auth middleware - same as isAuthenticated but with different naming
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  return isAuthenticated(req, res, next);
}