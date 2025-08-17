import { Request, Response, NextFunction } from 'express';

interface CacheOptions {
  maxAge?: number; // in seconds
  private?: boolean;
  noCache?: boolean;
  mustRevalidate?: boolean;
  staleWhileRevalidate?: number; // in seconds
}

// Cache middleware for static assets and API responses
export const cacheMiddleware = (options: CacheOptions = {}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const {
      maxAge = 3600, // 1 hour default
      private: isPrivate = false,
      noCache = false,
      mustRevalidate = false,
      staleWhileRevalidate
    } = options;

    if (noCache) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    } else {
      const directives = [];
      
      if (isPrivate) {
        directives.push('private');
      } else {
        directives.push('public');
      }
      
      directives.push(`max-age=${maxAge}`);
      
      if (mustRevalidate) {
        directives.push('must-revalidate');
      }
      
      if (staleWhileRevalidate) {
        directives.push(`stale-while-revalidate=${staleWhileRevalidate}`);
      }
      
      res.setHeader('Cache-Control', directives.join(', '));
    }
    
    next();
  };
};

// Specific cache strategies
export const staticAssetCache = cacheMiddleware({
  maxAge: 31536000, // 1 year
  private: false,
  staleWhileRevalidate: 86400 // 1 day
});

export const apiCache = cacheMiddleware({
  maxAge: 300, // 5 minutes
  private: true,
  staleWhileRevalidate: 60 // 1 minute
});

export const noCache = cacheMiddleware({
  noCache: true
});

// ETags for conditional requests
export const etagMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const originalSend = res.send;
  
  res.send = function(body) {
    if (body && typeof body === 'string') {
      // Generate simple ETag based on content hash
      const etag = `"${Buffer.from(body).toString('base64').slice(0, 16)}"`;
      res.setHeader('ETag', etag);
      
      // Check if client has the same version
      const clientETag = req.headers['if-none-match'];
      if (clientETag === etag) {
        res.status(304).end();
        return res;
      }
    }
    
    return originalSend.call(this, body);
  };
  
  next();
};

// Memory-based cache for expensive operations
class MemoryCache {
  private cache = new Map<string, { data: any; expires: number }>();
  
  set(key: string, data: any, ttlSeconds: number = 3600) {
    const expires = Date.now() + (ttlSeconds * 1000);
    this.cache.set(key, { data, expires });
  }
  
  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }
  
  delete(key: string) {
    this.cache.delete(key);
  }
  
  clear() {
    this.cache.clear();
  }
  
  // Clean up expired entries
  cleanup() {
    const now = Date.now();
    this.cache.forEach((entry, key) => {
      if (now > entry.expires) {
        this.cache.delete(key);
      }
    });
  }
}

export const memoryCache = new MemoryCache();

// Cleanup expired cache entries every 5 minutes
setInterval(() => {
  memoryCache.cleanup();
}, 5 * 60 * 1000);