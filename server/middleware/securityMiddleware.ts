import { Request, Response, NextFunction } from "express";

// Security middleware to protect against common vulnerabilities
export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Content Security Policy
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://www.paypal.com https://www.sandbox.paypal.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: https: blob:; " +
    "connect-src 'self' https://api.stripe.com https://www.paypal.com https://www.sandbox.paypal.com; " +
    "frame-src https://js.stripe.com https://www.paypal.com https://www.sandbox.paypal.com;"
  );

  next();
}

// Rate limiting middleware for API endpoints
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function rateLimiter(maxRequests: number = 500, windowMs: number = 15 * 60 * 1000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientId = req.ip || 'unknown';
    const now = Date.now();
    
    const clientData = requestCounts.get(clientId);
    
    if (!clientData || now > clientData.resetTime) {
      requestCounts.set(clientId, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    if (clientData.count >= maxRequests) {
      res.status(429).json({ 
        error: 'Too many requests',
        retryAfter: Math.ceil((clientData.resetTime - now) / 1000)
      });
      return;
    }
    
    clientData.count++;
    next();
  };
}

// Input validation middleware
export function validateInput(req: Request, res: Response, next: NextFunction) {
  // Sanitize inputs to prevent injection attacks
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  
  next();
}

function sanitizeObject(obj: any): any {
  if (typeof obj !== 'object' || obj === null) {
    return sanitizeString(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  
  const sanitized: any = {};
  for (const [key, value] of Object.entries(obj)) {
    sanitized[key] = sanitizeObject(value);
  }
  
  return sanitized;
}

function sanitizeString(input: any): any {
  if (typeof input !== 'string') {
    return input;
  }
  
  // Remove potentially dangerous characters and patterns
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
}

// Global error handler middleware
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('Application error:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Don't leak sensitive information in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'File too large' });
  }
  
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ error: 'Invalid file type' });
  }
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }
  
  if (err.code === '23505') { // PostgreSQL unique constraint violation
    return res.status(409).json({ error: 'Resource already exists' });
  }
  
  if (err.code === '23503') { // PostgreSQL foreign key violation
    return res.status(400).json({ error: 'Invalid reference' });
  }

  const status = err.status || err.statusCode || 500;
  
  res.status(status).json({
    error: isDevelopment ? err.message : 'Internal server error',
    ...(isDevelopment && { stack: err.stack })
  });
}

// Database transaction wrapper for critical operations
export function withTransaction<T>(operation: () => Promise<T>): Promise<T> {
  return operation().catch(error => {
    console.error('Database transaction failed:', error);
    throw new Error('Operation failed. Please try again.');
  });
}

// Health check middleware
export function healthCheck(req: Request, res: Response) {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || '1.0.0'
  });
}