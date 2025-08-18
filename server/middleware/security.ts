import { Request, Response, NextFunction } from 'express';
import { rateLimit } from 'express-rate-limit';
import DOMPurify from 'isomorphic-dompurify';

/**
 * Enhanced security middleware for input sanitization and validation
 */

// Input sanitization middleware
export function sanitizeInput(req: Request, res: Response, next: NextFunction) {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query as Record<string, any>);
  }
  
  next();
}

function sanitizeObject(obj: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      // Remove potential XSS attacks while preserving markdown formatting for content
      sanitized[key] = DOMPurify.sanitize(value, {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li'],
        ALLOWED_ATTR: []
      });
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? DOMPurify.sanitize(item) : item
      );
    } else if (value && typeof value === 'object') {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

// File upload validation
export function validateFileUpload(req: Request, res: Response, next: NextFunction) {
  if (req.files) {
    const files = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
    
    for (const file of files as any[]) {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          message: 'File size too large. Maximum 10MB allowed.'
        });
      }
      
      // Check file type for images
      if (file.mimetype && !file.mimetype.startsWith('image/')) {
        return res.status(400).json({
          success: false,
          message: 'Only image files are allowed.'
        });
      }
      
      // Check for executable extensions
      const dangerousExtensions = ['.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js'];
      const fileExt = file.originalname?.toLowerCase() || '';
      
      if (dangerousExtensions.some(ext => fileExt.endsWith(ext))) {
        return res.status(400).json({
          success: false,
          message: 'File type not allowed for security reasons.'
        });
      }
    }
  }
  
  next();
}

// Email validation
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

// Password strength validation
export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    return { 
      valid: false, 
      message: 'Password must contain at least one lowercase letter, one uppercase letter, and one number' 
    };
  }
  
  return { valid: true };
}

// SQL injection prevention
export function preventSqlInjection(req: Request, res: Response, next: NextFunction) {
  const checkValue = (value: any): boolean => {
    if (typeof value === 'string') {
      const sqlPatterns = [
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
        /(;|\-\-|\/\*|\*\/)/,
        /(\bOR\b.*=.*|1=1|'=')/ // Common SQL injection patterns
      ];
      
      return sqlPatterns.some(pattern => pattern.test(value));
    }
    return false;
  };
  
  const checkObject = (obj: any): boolean => {
    if (Array.isArray(obj)) {
      return obj.some(item => checkObject(item));
    }
    
    if (obj && typeof obj === 'object') {
      return Object.values(obj).some(value => checkObject(value));
    }
    
    return checkValue(obj);
  };
  
  if (checkObject(req.body) || checkObject(req.query) || checkObject(req.params)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid input detected'
    });
  }
  
  next();
}

// Enhanced rate limiting for sensitive operations
export const sensitiveOperationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs for sensitive operations
  message: {
    success: false,
    message: 'Too many attempts. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth rate limiting (login/register)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 auth attempts per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// API rate limiting
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: {
    success: false,
    message: 'API rate limit exceeded. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// XSS protection headers
export function xssProtection(req: Request, res: Response, next: NextFunction) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  next();
}