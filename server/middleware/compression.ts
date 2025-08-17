import compression from 'compression';
import { Request, Response, NextFunction } from 'express';

// Custom compression middleware with optimized settings
export const compressionMiddleware = compression({
  // Only compress responses larger than 1KB
  threshold: 1024,
  
  // Compression level (0-9, 6 is good balance between speed and compression)
  level: 6,
  
  // Only compress certain content types
  filter: (req: Request, res: Response) => {
    // Don't compress if the client doesn't support it
    if (req.headers['x-no-compression']) {
      return false;
    }
    
    // Check content type
    const contentType = res.getHeader('content-type') as string;
    if (!contentType) return false;
    
    // Compress text-based content
    return /^(text\/|application\/(json|javascript|xml)|image\/svg)/.test(contentType);
  },
  
  // Memory level (1-9, affects memory usage)
  memLevel: 8,
  
  // Window bits (affects compression quality and memory usage)
  windowBits: 15,
  
  // Chunk size (affects memory usage)
  chunkSize: 16 * 1024 // 16KB chunks
});

// Rate limiting for API endpoints
export const apiRateLimit = (maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) => {
  const requests = new Map<string, { count: number; resetTime: number }>();
  
  return (req: Request, res: Response, next: NextFunction) => {
    const clientId = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    
    // Clean up old entries
    requests.forEach((data, key) => {
      if (now > data.resetTime) {
        requests.delete(key);
      }
    });
    
    // Get or create client data
    let clientData = requests.get(clientId);
    if (!clientData || now > clientData.resetTime) {
      clientData = { count: 0, resetTime: now + windowMs };
      requests.set(clientId, clientData);
    }
    
    // Check rate limit
    if (clientData.count >= maxRequests) {
      return res.status(429).json({
        error: 'Too many requests',
        retryAfter: Math.ceil((clientData.resetTime - now) / 1000)
      });
    }
    
    // Increment counter
    clientData.count++;
    
    // Set headers
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', maxRequests - clientData.count);
    res.setHeader('X-RateLimit-Reset', Math.ceil(clientData.resetTime / 1000));
    
    next();
  };
};