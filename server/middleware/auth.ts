import { Request, Response, NextFunction } from 'express';

// Type declarations for extended request object
declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      isAdmin: boolean;
      isActive: boolean;
    }
    
    interface Request {
      session?: {
        adminAuthenticated?: boolean;
        adminUser?: {
          id: string;
          username: string;
          isAdmin: boolean;
        };
      };
    }
  }
}

// Middleware to check if user is authenticated
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

// Middleware to check if user is admin (supports both passport and session-based auth)
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  // Check session-based admin authentication first
  if (req.session?.adminAuthenticated && req.session?.adminUser?.isAdmin) {
    return next();
  }
  
  // Fallback to passport-based authentication
  if (req.user?.isAdmin) {
    return next();
  }
  
  return res.status(403).json({ message: 'Admin access required' });
};

// Middleware to check if user account is active
export const requireActiveUser = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user?.isActive) {
    return res.status(403).json({ error: 'Account is inactive' });
  }
  next();
};