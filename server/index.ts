import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { activityTracker } from "./middleware/activityTracker";
import { scheduledService } from "./services/scheduledService";
import { 
  securityHeaders, 
  rateLimiter, 
  validateInput, 
  errorHandler,
  healthCheck
} from "./middleware/securityMiddleware";
import { compressionMiddleware, apiRateLimit } from "./middleware/compression";
import { staticAssetCache, apiCache, etagMiddleware } from "./middleware/cache";

const app = express();

// Security middleware
app.use(securityHeaders);
app.use(rateLimiter(1000, 15 * 60 * 1000)); // 1000 requests per 15 minutes
app.use(validateInput);

// Performance middleware
app.use(compressionMiddleware);
app.use(etagMiddleware);

// Static asset caching
app.use('/assets', staticAssetCache);
app.use('/uploads', staticAssetCache);

// API rate limiting and caching
app.use('/api', apiRateLimit(500, 15 * 60 * 1000)); // 500 requests per 15 minutes for API
app.use('/api', apiCache);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Trust proxy for accurate IP addresses
app.set('trust proxy', true);

// Health check endpoint
app.get('/health', healthCheck);

// Add activity tracking middleware
app.use(activityTracker);

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // Use centralized error handler
  app.use(errorHandler);

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
    
    // Start scheduled services for automatic student conversion
    scheduledService.start();
    log('Scheduled services started - automatic student conversion enabled');
  });
})();
